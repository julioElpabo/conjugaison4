import type { ConjugationTense, ExerciseQuestion, Verb } from '../types/conjugation'
import type { CoachExplanationApproach } from '../types/coach'

export interface TargetedConjugationHelp {
  title: string
  subtitle: string
  requestedForm: string
  meaning: string
  verbFacts: Array<{ label: string, value: string }>
  formation: string[]
  endings: string | null
  exception: string | null
  warnings: string[]
  method: string[]
  decomposition: ConjugationDecomposition | null
}

export interface ConjugationDecomposition {
  base: string
  ending: string
  baseLabel: string
  confidence: 'high'
  source: 'stored-form'
}

const semanticMeanings: Record<string, string> = {
  mouvement: 'exprime un mouvement ou un déplacement',
  position: 'exprime une position ou un changement de position',
  perception: 'exprime ce que l’on perçoit avec les sens',
  manipulation: 'exprime une action faite sur un objet',
  'creation-transformation': 'exprime une création ou une transformation',
  communication: 'sert à communiquer une parole, une idée ou une information',
  cognition: 'exprime une pensée, une connaissance ou un apprentissage',
  emotion: 'exprime une émotion, un goût ou une appréciation',
  modalite: 'précise ce qui est possible, nécessaire ou souhaité',
  'relation-sociale': 'exprime une relation ou une action avec d’autres personnes',
  echange: 'exprime un échange, un don ou une transmission',
  corps: 'exprime une action ou un besoin du corps',
  nature: 'décrit un phénomène naturel',
  'action-processus': 'exprime une action ou un processus',
}

const particularityLabels: Record<string, string> = {
  pronominal: 'C’est un verbe pronominal : le pronom réfléchi change avec la personne.',
  impersonnel: 'Ce verbe s’emploie surtout à la 3e personne du singulier.',
  defectif: 'Ce verbe ne possède pas toutes les formes de conjugaison.',
  'formes-alternatives': 'Plusieurs formes peuvent être admises pour cette conjugaison.',
  'auxiliaire-variable': 'Selon son sens, ce verbe peut changer d’auxiliaire aux temps composés.',
}

function normalized(value: string | null | undefined) {
  return (value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[’]/g, "'")
    .trim()
    .toLocaleLowerCase('fr')
}

function unique(items: Array<string | null | undefined>) {
  return [...new Set(items.map(item => item?.trim()).filter((item): item is string => Boolean(item)))]
}

function bareInfinitive(infinitive: string) {
  return infinitive.replace(/^(?:se\s+|s['’])/iu, '').trim()
}

function lexicalStem(infinitive: string, termination?: string | null) {
  const bare = bareInfinitive(infinitive)
  const suffix = termination?.trim()
  if (suffix && normalized(bare).endsWith(normalized(suffix))) {
    return bare.slice(0, Math.max(1, bare.length - suffix.length))
  }
  return bare.replace(/(?:er|ir|re|oir)$/iu, '') || bare
}

function groupLabel(verb?: Verb) {
  if (!verb?.groupeConjugaison) return 'groupe à vérifier'
  return `${verb.groupeConjugaison}${verb.groupeConjugaison === 1 ? 'er' : 'e'} groupe`
}

function escapedHtml(value: string) {
  return value.replace(/&/gu, '&amp;').replace(/</gu, '&lt;').replace(/>/gu, '&gt;').replace(/"/gu, '&quot;').replace(/'/gu, '&#39;')
}

function rememberedFormMarkup(value: string) {
  const displayed = value.trim().replace(/^./u, letter => letter.toLocaleUpperCase('fr'))
  return `<mark><strong><i>♥</i> ${escapedHtml(displayed)}</strong></mark>`
}

function radicalBadge(value: string, withBoundary = true) {
  const radical = value.trim().replace(/-$/u, '')
  return `<var>${escapedHtml(radical)}${withBoundary ? '-' : ''}</var>`
}

function endingBadge(value: string, withBoundary = true) {
  const ending = value.trim().replace(/^-/u, '')
  return `<samp>${withBoundary ? '-' : ''}${escapedHtml(ending)}</samp>`
}

function removedEndingBadge(value: string) {
  const ending = value.trim().replace(/^-/u, '')
  return `<kbd>-${escapedHtml(ending)}</kbd>`
}

function assembledFormBadges(base: string, ending: string) {
  return `<span>${radicalBadge(base, false)}${endingBadge(ending, false)}</span>`
}

function adjustedAssemblyBadges(initialBase: string, adjustedBase: string, ending: string) {
  const initial = initialBase.trim().replace(/-$/u, '')
  const adjusted = adjustedBase.trim().replace(/-$/u, '')
  if (normalized(initial) === `${normalized(adjusted)}e`) {
    return `<span>${radicalBadge(adjusted, false)}<del>e</del>${endingBadge(ending, false)}</span>`
  }
  return assembledFormBadges(initial, ending)
}

function verbGroupDescription(verb: Verb | undefined, infinitive: string) {
  const group = verb?.groupeConjugaison
  const bare = bareInfinitive(infinitive)
  const ending = verb?.terminaison?.trim()
    || bare.match(/(oir|re|ir|er)$/iu)?.[1]?.toLocaleLowerCase('fr')
    || ''
  const groupNames = { 1: 'premier groupe', 2: 'deuxième groupe', 3: 'troisième groupe' } as const
  if (!group) return 'un verbe dont le groupe n’est pas renseigné'
  return `un verbe${ending ? ` en <strong>-${escapedHtml(ending)}</strong>` : ''} (${groupNames[group]})`
}

function tenseContext(question: ExerciseQuestion, tense?: ConjugationTense) {
  const rawMode = (question.mode || tense?.mode?.name || '').trim()
  const rawTense = (question.temps || tense?.name || '').trim()
  const mode = normalized(rawMode)
  const time = rawTense.toLocaleLowerCase('fr')
  const normalizedTime = normalized(rawTense)
  const timeWithArticle = `${/^(imparfait|imperatif|infinitif)$/u.test(normalizedTime) ? "à l’" : 'au '}${time}`
  if (!rawMode) return timeWithArticle
  if (mode === 'participe') return `au participe ${time}`
  if (mode === 'gerondif') return `au gérondif ${time}`
  if (mode === 'infinitif') return `à l’infinitif ${time}`
  const modeWithArticle = /^(indicatif|imperatif)$/u.test(mode)
    ? `de l’${rawMode.toLocaleLowerCase('fr')}`
    : `du ${rawMode.toLocaleLowerCase('fr')}`
  return `${timeWithArticle} ${modeWithArticle}`
}

function endingPronouns(mode: string, count: number) {
  const normalizedMode = normalized(mode)
  const pronouns = normalizedMode === 'imperatif'
    ? ['tu', 'nous', 'vous']
    : normalizedMode === 'subjonctif'
      ? ['que je', 'que tu', 'qu’il / elle / on', 'que nous', 'que vous', 'qu’ils / elles']
      : ['je', 'tu', 'il / elle / on', 'nous', 'vous', 'ils / elles']
  return pronouns.slice(0, count)
}

function withDeArticle(value: string) {
  const label = value.trim().toLocaleLowerCase('fr')
  const first = normalized(label).charAt(0)
  return `${'aeiouy'.includes(first) ? 'de l’' : 'du '}${label}`
}

function withAArticle(value: string) {
  const label = value.trim().toLocaleLowerCase('fr')
  const first = normalized(label).charAt(0)
  return `${'aeiouy'.includes(first) ? 'à l’' : 'au '}${label}`
}

function endingsKnowledgeTitle(question: ExerciseQuestion, tense?: ConjugationTense) {
  const tenseName = (question.temps || tense?.name || '').trim()
  const modeName = (question.mode || tense?.mode?.name || '').trim()
  const tensePart = tenseName ? withDeArticle(tenseName) : 'du temps demandé'
  return `Terminaisons ${tensePart}${modeName ? ` ${withDeArticle(modeName)}` : ''}`
}

function subjectIndex(question: ExerciseQuestion) {
  const subject = normalized(question.pronom || question.saisiePrefixe).replace(/^que\s+/, '')
  if (/^(je|j')/.test(subject)) return 0
  if (/^tu\b/.test(subject)) return 1
  if (/^(il|elle|on)\b/.test(subject)) return 2
  if (/^nous\b/.test(subject)) return 3
  if (/^vous\b/.test(subject)) return 4
  if (/^(ils|elles)\b/.test(subject)) return 5
  return null
}

function hasFamilyIndependentEndings(
  question: ExerciseQuestion,
  verb?: Verb,
  tense?: ConjugationTense,
) {
  const mode = normalized(question.mode || tense?.mode?.name)
  const time = normalized(question.temps || tense?.name)
  const group = verb?.groupeConjugaison
  if (mode === 'indicatif' && time === 'passe simple' && group !== 1 && group !== 2) return false
  if (mode === 'subjonctif' && time === 'present' && group === 3) return false
  return true
}

function conjugatedCore(form: string) {
  return form
    .trim()
    .replace(/[.!?…]+$/gu, '')
    .replace(/^(?:me|te|se|nous|vous)\s+/iu, '')
    .replace(/^[mts]['’]/iu, '')
    .trim()
}

function futureStem(infinitive: string) {
  const bare = normalized(bareInfinitive(infinitive))
  const known: Record<string, string> = {
    etre: 'ser-', avoir: 'aur-', aller: 'ir-', faire: 'fer-', venir: 'viendr-', tenir: 'tiendr-',
    voir: 'verr-', pouvoir: 'pourr-', vouloir: 'voudr-', savoir: 'saur-', devoir: 'devr-',
    recevoir: 'recevr-', envoyer: 'enverr-', courir: 'courr-', mourir: 'mourr-', falloir: 'faudr-',
    pleuvoir: 'pleuvr-', valoir: 'vaudr-', asseoir: 'assiér- ou assoir-', acquérir: 'acquerr-',
  }
  if (known[bare]) return known[bare]
  const visible = bareInfinitive(infinitive)
  return `${visible.endsWith('re') ? visible.slice(0, -1) : visible}-`
}

function requestedFormLabel(question: ExerciseQuestion, tense?: ConjugationTense) {
  const rawMode = (question.mode || tense?.mode?.name || '').trim()
  const mode = normalized(rawMode)
  const displayedMode = rawMode.toLocaleLowerCase('fr')
  const time = (question.temps || tense?.name || '').trim()
  const normalizedTime = normalized(time)
  const timeWithArticle = `${/^(imparfait|imperatif|infinitif)$/u.test(normalizedTime) ? "l’" : 'le '}${time}`
  if (!mode) return `La question demande ${timeWithArticle}.`
  if (mode === 'participe' || mode === 'gerondif' || mode === 'infinitif') {
    return `La question demande ${mode === 'participe' ? 'le participe' : mode === 'gerondif' ? 'le gérondif' : "l’infinitif"} ${time}.`
  }
  const modeWithArticle = /^(indicatif|imperatif)$/u.test(mode) ? `de l’${displayedMode}` : `du ${displayedMode}`
  return `La question demande ${timeWithArticle} ${modeWithArticle}.`
}

function compoundAuxiliaryForms(auxiliary: string, time: string, mode: string) {
  const key = `${mode}:${time}:${auxiliary}`
  const forms: Record<string, string> = {
    'indicatif:passe compose:avoir': 'ai, as, a, avons, avez, ont',
    'indicatif:passe compose:etre': 'suis, es, est, sommes, êtes, sont',
    'indicatif:plus-que-parfait:avoir': 'avais, avais, avait, avions, aviez, avaient',
    'indicatif:plus-que-parfait:etre': 'étais, étais, était, étions, étiez, étaient',
    'indicatif:futur anterieur:avoir': 'aurai, auras, aura, aurons, aurez, auront',
    'indicatif:futur anterieur:etre': 'serai, seras, sera, serons, serez, seront',
    'indicatif:passe anterieur:avoir': 'eus, eus, eut, eûmes, eûtes, eurent',
    'indicatif:passe anterieur:etre': 'fus, fus, fut, fûmes, fûtes, furent',
    'subjonctif:passe:avoir': 'aie, aies, ait, ayons, ayez, aient',
    'subjonctif:passe:etre': 'sois, sois, soit, soyons, soyez, soient',
    'subjonctif:plus-que-parfait:avoir': 'eusse, eusses, eût, eussions, eussiez, eussent',
    'subjonctif:plus-que-parfait:etre': 'fusse, fusses, fût, fussions, fussiez, fussent',
    'conditionnel:passe 1:avoir': 'aurais, aurais, aurait, aurions, auriez, auraient',
    'conditionnel:passe 1:etre': 'serais, serais, serait, serions, seriez, seraient',
    'conditionnel:passe 2:avoir': 'eusse, eusses, eût, eussions, eussiez, eussent',
    'conditionnel:passe 2:etre': 'fusse, fusses, fût, fussions, fussiez, fussent',
  }
  return forms[key] || null
}

function tenseRule(question: ExerciseQuestion, verb?: Verb, tense?: ConjugationTense) {
  const mode = normalized(question.mode || tense?.mode?.name)
  const time = normalized(question.temps || tense?.name)
  const group = verb?.groupeConjugaison
  const person = subjectIndex(question)
  let rule = ''
  let endings: string[] | null = null
  let endingsText: string | null = null
  let endingsKind: 'endings' | 'auxiliary' = 'endings'
  let auxiliaryLabel = ''
  let exception: string | null = null

  if (question.isCompound || tense?.isCompound) {
    const auxiliaryLabelFromVerb = verb?.auxiliaire?.trim() || 'avoir ou être selon le verbe'
    const auxiliary = normalized(auxiliaryLabelFromVerb)
    auxiliaryLabel = auxiliaryLabelFromVerb
    const auxiliaryTime: Record<string, string> = {
      'passe compose': 'au présent', 'plus-que-parfait': 'à l’imparfait', 'futur anterieur': 'au futur',
      'passe anterieur': 'au passé simple', passe: mode === 'gerondif' ? 'au participe présent' : 'au temps simple correspondant',
      'passe 1': 'au conditionnel présent', 'passe 2': 'au subjonctif imparfait',
    }
    rule = `Conjugue l’auxiliaire ${auxiliary} ${auxiliaryTime[time] || 'au temps demandé'}, puis ajoute le participe passé.`
    const auxiliaryForms = compoundAuxiliaryForms(auxiliary, time, mode)
    if (auxiliaryForms) {
      endings = auxiliaryForms.split(',').map(form => form.trim())
      endingsKind = 'auxiliary'
      endingsText = `Formes de l’auxiliaire : ${auxiliaryForms}.`
    }
  } else if (mode === 'indicatif' && time === 'present') {
    if (group === 1) endings = ['-e', '-es', '-e', '-ons', '-ez', '-ent']
    else if (group === 2) endings = ['-is', '-is', '-it', '-issons', '-issez', '-issent']
    rule = group === 3
      ? 'Au présent, les verbes du 3e groupe changent souvent de radical : appuie-toi sur leur famille.'
      : 'Pars du radical du verbe et ajoute la terminaison du présent.'
    if (group === 3) exception = 'Ce verbe appartient au 3e groupe : il ne suit pas une série unique de terminaisons et son radical peut changer selon la personne.'
  } else if (mode === 'indicatif' && time === 'imparfait') {
    endings = ['-ais', '-ais', '-ait', '-ions', '-iez', '-aient']
    rule = 'Prends la forme avec « nous » au présent, enlève -ons, puis ajoute la terminaison de l’imparfait.'
    if (normalized(verb?.infinitif) === 'etre') {
      exception = '« Être » utilise le radical ét-. C’est le seul verbe dont l’imparfait ne se construit pas à partir de la forme avec « nous » au présent.'
    }
  } else if (mode === 'indicatif' && time === 'futur') {
    endings = ['-ai', '-as', '-a', '-ons', '-ez', '-ont']
    rule = `Utilise le radical du futur ${futureStem(question.infinitif || verb?.infinitif || '')}, puis ajoute la terminaison.`
    if (verb?.groupeConjugaison === 3 || normalized(futureStem(question.infinitif || verb?.infinitif || '').replace(/-$/u, '')) !== normalized(bareInfinitive(question.infinitif || verb?.infinitif || ''))) {
      exception = `Le radical ${futureStem(question.infinitif || verb?.infinitif || '')} est irrégulier : il ne se forme pas simplement en conservant l’infinitif.`
    }
  } else if (mode === 'indicatif' && time === 'passe simple') {
    endings = group === 1
      ? ['-ai', '-as', '-a', '-âmes', '-âtes', '-èrent']
      : ['-is', '-is', '-it', '-îmes', '-îtes', '-irent']
    rule = group === 3
      ? 'Au passé simple, le radical et parfois la série de terminaisons varient selon la famille du verbe.'
      : 'Pars du radical et ajoute la terminaison du passé simple.'
    if (group === 3) exception = 'Au 3e groupe, le passé simple peut employer un radical et une voyelle de terminaison particuliers ; il faut suivre la famille du verbe.'
  } else if (mode === 'conditionnel' && time === 'present') {
    endings = ['-ais', '-ais', '-ait', '-ions', '-iez', '-aient']
    rule = `Utilise le radical du futur ${futureStem(question.infinitif || verb?.infinitif || '')}, puis une terminaison de l’imparfait.`
    if (verb?.groupeConjugaison === 3 || normalized(futureStem(question.infinitif || verb?.infinitif || '').replace(/-$/u, '')) !== normalized(bareInfinitive(question.infinitif || verb?.infinitif || ''))) {
      exception = `Le radical ${futureStem(question.infinitif || verb?.infinitif || '')} est irrégulier : le conditionnel reprend le même radical particulier que le futur.`
    }
  } else if (mode === 'subjonctif' && time === 'present') {
    endings = ['-e', '-es', '-e', '-ions', '-iez', '-ent']
    rule = 'Pars généralement de la forme avec « ils » au présent, enlève -ent, puis ajoute la terminaison. N’oublie pas « que ».'
  } else if (mode === 'subjonctif' && time === 'imparfait') {
    endings = ['-sse', '-sses', '-(voyelle accentuée)t', '-ssions', '-ssiez', '-ssent']
    rule = 'Pars de la 3e personne du singulier au passé simple, puis construis le subjonctif imparfait. N’oublie pas « que ».'
  } else if (mode === 'imperatif' && time === 'present') {
    rule = 'Utilise la forme du présent pour tu, nous ou vous, sans écrire le pronom sujet.'
    if (verb?.groupeConjugaison === 1 && subjectIndex(question) === 1) {
      exception = 'À la 2e personne du singulier, les verbes du 1er groupe perdent normalement le -s final : « mange ! ». Le -s revient devant « en » ou « y » : « manges-en ! ».'
    }
  } else if (mode === 'participe' && time === 'present') {
    rule = normalized(verb?.infinitif) === 'etre' || normalized(verb?.infinitif) === 'avoir' || normalized(verb?.infinitif) === 'savoir'
      ? 'C’est une forme particulière à mémoriser.'
      : 'Prends la forme avec « nous » au présent, enlève -ons, puis ajoute -ant.'
  } else if (mode === 'participe' && time === 'passe') {
    rule = 'Utilise le participe passé du verbe et vérifie s’il doit s’accorder.'
  } else if (mode === 'gerondif' && time === 'present') {
    rule = 'Écris « en » suivi du participe présent : base de « nous » au présent sans -ons, puis -ant.'
  } else if (mode === 'gerondif' && time === 'passe') {
    rule = 'Écris « en ayant » ou « en étant », puis le participe passé du verbe.'
  } else {
    rule = 'Repère d’abord le mode, le temps et la personne, puis choisis le radical et la terminaison correspondants.'
  }

  const actualForm = normalized(question.conjugaison1)
  if (!exception && actualForm.includes('ç')) {
    exception = 'Le radical prend une cédille devant a ou o afin que la lettre c conserve le son [s].'
  } else if (!exception && /ge[ao]/u.test(actualForm)) {
    exception = 'Un e est ajouté après g devant a ou o afin de conserver le son doux [j].'
  } else if (!exception && normalized(question.infinitif).endsWith('guer') && actualForm.includes('gu')) {
    exception = 'Le u de -gu- appartient au radical : il reste écrit même lorsqu’on ne l’entend pas séparément.'
  } else if (!exception && /(?:eler|eter)$/u.test(normalized(question.infinitif)) && /(?:ll|tt|è)/u.test(actualForm)) {
    exception = 'Devant une terminaison muette, ce verbe modifie son radical : selon sa famille, la consonne double ou le e devient è.'
  } else if (!exception && normalized(question.infinitif).endsWith('yer') && actualForm.includes('i')) {
    exception = 'Devant une terminaison muette, le y du radical devient ici i.'
  }

  return {
    rule,
    endingItems: endings || [],
    endingsKind,
    auxiliaryLabel,
    endings: endingsText || (endings
      ? `${endings.join(', ')}${person === null ? '' : ` — ici, la terminaison attendue est ${endings[person]}`}`
      : null),
    exception,
  }
}

/**
 * Découpe uniquement les formes pour lesquelles la série de terminaisons est
 * stable. La forme enregistrée reste la source de vérité : aucune base
 * irrégulière n'est reconstruite à partir de l'infinitif.
 */
export function decomposeConjugationForm(
  question: ExerciseQuestion,
  verb?: Verb,
  tense?: ConjugationTense,
): ConjugationDecomposition | null {
  if (question.isCompound || tense?.isCompound || !question.conjugaison1) return null

  const rule = tenseRule(question, verb, tense)
  if (rule.endingsKind !== 'endings' || !hasFamilyIndependentEndings(question, verb, tense)) return null
  const person = subjectIndex(question)
  const displayedEnding = person === null ? '' : rule.endingItems[person] || ''
  if (!/^-[\p{L}]+$/u.test(displayedEnding)) return null

  const ending = displayedEnding.slice(1)
  const form = conjugatedCore(question.conjugaison1)
  if (!form || form.length <= ending.length || !form.toLocaleLowerCase('fr').endsWith(ending.toLocaleLowerCase('fr'))) {
    return null
  }

  const base = form.slice(0, -ending.length)
  if (!base || /[\s-]/u.test(base)) return null
  return {
    base,
    ending,
    baseLabel: 'Base pour cette forme',
    confidence: 'high',
    source: 'stored-form',
  }
}

/** Explique le radical réellement utile, y compris lorsqu'il alterne. */
export function buildConjugationBaseHtml(
  question: ExerciseQuestion,
  verb?: Verb,
  tense?: ConjugationTense,
  approach: CoachExplanationApproach = 'grammatical-technical',
) {
  const infinitive = question.infinitif || verb?.infinitif || 'ce verbe'
  const context = tenseContext(question, tense)
  const subject = question.pronom || question.saisiePrefixe || 'la personne demandée'
  const decomposition = decomposeConjugationForm(question, verb, tense)
  const lexical = lexicalStem(infinitive, verb?.terminaison)
  const actualForm = conjugatedCore(question.conjugaison1 || '')
  const rule = tenseRule(question, verb, tense)
  const family = verb?.familleConjugaison?.replaceAll('-', ' ').trim() || ''
  const normalizedInfinitive = normalized(infinitive)
  const isSuppletive = normalizedInfinitive === 'aller' || normalizedInfinitive === 'etre'
  const isCompound = Boolean(question.isCompound || tense?.isCompound)
  const reference = question.radicalReference?.validated === false ? undefined : question.radicalReference
  const referenceSubject = reference?.referenceSubject?.trim() || (reference?.label.startsWith('nous') ? 'nous' : reference?.label.startsWith('ils') ? 'ils' : '')
  const rawReferenceRadical = reference?.removableEnding && reference.form.endsWith(reference.removableEnding)
    ? reference.form.slice(0, -reference.removableEnding.length)
    : reference?.radical || ''
  const displayedReference = reference
    ? `${referenceSubject ? `${referenceSubject} ` : ''}${reference.form}`
    : ''
  const highlightedReference = displayedReference ? rememberedFormMarkup(displayedReference) : ''
  const normalizedMode = normalized(question.mode || tense?.mode?.name)
  const normalizedTense = normalized(question.temps || tense?.name)
  if (normalizedMode === 'participe' && normalizedTense === 'passe') {
    const participle = verb?.participePasse?.trim() || actualForm
    if (approach === 'concise') return `<p>Le participe passé est <strong>${escapedHtml(participle)}</strong> : apprends cette forme.</p>`
    if (approach === 'guided-discovery') return `<details><summary>Indice 1 · La famille</summary><p>Observe la famille de <strong>${escapedHtml(infinitive)}</strong>.</p></details><details><summary>Indice 2 · La forme</summary><p>Le participe passé n’est pas toujours prévisible à partir de l’infinitif.</p></details><details><summary>Indice 3 · À retenir</summary><p>La forme repère est ${rememberedFormMarkup(participle)}. Vérifie ensuite son accord.</p></details>`
    if (approach === 'cif-falc') return `<ol><li>Repère le verbe <strong>${escapedHtml(infinitive)}</strong>.</li><li>Apprends son participe passé : <strong>${escapedHtml(participle)}</strong>.</li><li>Vérifie s’il faut l’accorder.</li></ol>`
    return `<p>Le participe passé <strong>${escapedHtml(participle)}</strong> est une <strong>forme lexicale</strong> enregistrée avec le verbe <strong>${escapedHtml(infinitive)}</strong>.</p><p>Il ne faut pas lui inventer un radical productif : sa formation dépend de la famille et comporte de nombreuses irrégularités. L’étape suivante est la vérification de l’accord.</p>`
  }

  if (isCompound) {
    const auxiliary = verb?.auxiliaire?.trim() || 'avoir ou être'
    if (approach === 'concise') {
      return `<p>Ici, construis la forme avec <strong>${escapedHtml(auxiliary)}</strong> et le participe passé : ne cherche pas un radical unique du verbe.</p>`
    }
    if (approach === 'guided-discovery') {
      return `<details><summary>Indice 1 · La construction</summary><p>La forme ${escapedHtml(context)} contient-elle un ou deux mots ?</p></details><details><summary>Indice 2 · Le premier élément</summary><p>Quel auxiliaire convient à <strong>${escapedHtml(infinitive)}</strong> ?</p></details><details><summary>Indice 3 · La vérification</summary><p>Conjugue cet auxiliaire avec ${escapedHtml(subject)}, puis ajoute le participe passé et vérifie son accord.</p></details>`
    }
    if (approach === 'cif-falc') {
      return `<ol><li>Cette forme est composée : elle a deux parties.</li><li>Conjugue <strong>${escapedHtml(auxiliary)}</strong> avec ${escapedHtml(subject)}.</li><li>Ajoute le participe passé, puis vérifie l’accord.</li></ol>`
    }
    return `<p>${context.replace(/^./u, letter => letter.toLocaleUpperCase('fr'))}, la forme est <strong>périphrastique</strong> : elle associe l’auxiliaire <strong>${escapedHtml(auxiliary)}</strong> et le participe passé.</p><p>On ne cherche donc pas ici le radical de <strong>${escapedHtml(infinitive)}</strong> : la flexion est portée par l’auxiliaire.</p>`
  }

  if (decomposition) {
    const base = radicalBadge(decomposition.base)
    const ending = endingBadge(decomposition.ending)
    const assembledForm = assembledFormBadges(decomposition.base, decomposition.ending)
    const alternates = normalized(lexical) !== normalized(decomposition.base)
    const alternation = alternates
      ? ` Elle diffère du radical lexical ${radicalBadge(lexical)} : cette conjugaison commande une alternance.`
      : ` Elle correspond ici au radical lexical ${radicalBadge(lexical)}.`
    const bare = normalized(bareInfinitive(infinitive))
    const hasDedicatedLetterHelp = bare.endsWith('ger') || bare.endsWith('guer') || bare.endsWith('cer')
    const exception = rule.exception && !hasDedicatedLetterHelp ? `<p>${escapedHtml(rule.exception)}</p>` : ''

    if (reference && normalized(reference.radical) === normalized(decomposition.base)) {
      const referenceEnding = reference.removableEnding ? removedEndingBadge(reference.removableEnding) : ''
      const removeInstruction = referenceEnding
        ? normalized(rawReferenceRadical) === normalized(reference.radical)
          ? `Enlève ${referenceEnding} : il reste le radical ${base}.`
          : `Enlève ${referenceEnding} : tu obtiens d’abord le radical ${radicalBadge(rawReferenceRadical)}.`
        : `Garde le radical ${base}.`
      const changesBeforeEnding = normalized(rawReferenceRadical) !== normalized(decomposition.base)
      const firstAssembly = changesBeforeEnding ? assembledFormBadges(rawReferenceRadical, decomposition.ending) : assembledForm
      const crossedAssembly = changesBeforeEnding ? adjustedAssemblyBadges(rawReferenceRadical, decomposition.base, decomposition.ending) : ''
      const adjustmentNote = bare.endsWith('ger') && normalized(rawReferenceRadical).endsWith('ge') && normalized(decomposition.base).endsWith('g')
        ? 'Si la lettre <strong>g</strong> est suivie de <strong>i</strong>, pas besoin de <strong>e</strong>. Regarde l’explication plus bas.'
        : bare.endsWith('cer') && normalized(rawReferenceRadical).endsWith('ç') && normalized(decomposition.base).endsWith('c')
          ? 'Devant <strong>i</strong>, la cédille ne sert pas. Regarde l’explication plus bas.'
          : 'Le radical s’adapte devant cette terminaison. Regarde l’explication plus bas.'
      const assembly = changesBeforeEnding
        ? `${firstAssembly}<small>${adjustmentNote}</small>${crossedAssembly}<strong>Résultat</strong><b>${assembledForm}<i>✓</i></b>`
        : assembledForm
      const requestedPersonIndex = subjectIndex(question)
      const endingRows = rule.endingItems.map((item, index) => `<tr><th><strong>${escapedHtml(endingPronouns(question.mode || tense?.mode?.name || '', rule.endingItems.length)[index] || `forme ${index + 1}`)}</strong></th><td>${index === requestedPersonIndex ? endingBadge(item) : `<strong>${escapedHtml(item)}</strong>`}</td></tr>`).join('')
      const endingsContent = endingRows
        ? `<table><tbody>${endingRows}</tbody></table>`
        : `<p>${escapedHtml(rule.rule)}</p>`
      const inferredReferenceTense = reference.kind.startsWith('present-')
        ? 'présent'
        : reference.kind === 'future-stem'
          ? 'futur'
          : reference.kind === 'past-simple-il'
            ? 'passé simple'
            : reference.kind === 'infinitive'
              ? 'présent'
              : ''
      const inferredReferenceMode = /^(?:present-|future-stem|past-simple-il)/u.test(reference.kind) ? 'indicatif' : ''
      const referenceTenseName = (reference.referenceTense || inferredReferenceTense || question.temps || tense?.name || '').trim()
      const referenceModeName = (reference.referenceMode || inferredReferenceMode || question.mode || tense?.mode?.name || '').trim()
      const referenceContext = `${referenceTenseName ? withAArticle(referenceTenseName) : ''}${referenceModeName ? ` ${withDeArticle(referenceModeName)}` : ''}`.trim()
      const referenceInstruction = `Apprends par cœur la forme repère${referenceContext ? ` ${escapedHtml(referenceContext)}` : ''}${referenceSubject ? ` avec le pronom <strong>${escapedHtml(referenceSubject)}</strong>` : ''} :`
      const knowledgeBlock = `<figure><figcaption>À savoir par cœur</figcaption><blockquote><strong>Forme repère</strong><p>${referenceInstruction}</p><p>${highlightedReference}</p></blockquote><blockquote><strong>${escapedHtml(endingsKnowledgeTitle(question, tense))}</strong>${endingsContent}</blockquote></figure>`
      const radicalBlock = approach === 'guided-discovery'
        ? `<figure><figcaption>Trouve le radical</figcaption><details><summary>Indice 1 · La forme repère</summary><p>Prends la forme repère :<br>${highlightedReference}</p></details><details><summary>Indice 2 · Le radical</summary><p>${removeInstruction}</p></details></figure>`
        : `<figure><figcaption>Trouve le radical</figcaption><ol><li>Prends la forme repère :<br>${highlightedReference}</li><li>${removeInstruction}</li></ol></figure>`
      const answerBlock = `<figure><figcaption>Réponse</figcaption><blockquote><p>Ajoute ${ending} au radical ${changesBeforeEnding ? radicalBadge(rawReferenceRadical) : base} :</p>${assembly}</blockquote></figure>`
      if (approach === 'concise') {
        return `${knowledgeBlock}${radicalBlock}${answerBlock}`
      }
      if (approach === 'guided-discovery') {
        return `${knowledgeBlock}${radicalBlock}${answerBlock}${exception}`
      }
      if (approach === 'cif-falc') {
        return `${knowledgeBlock}${radicalBlock}${answerBlock}${exception}`
      }
      const familyFact = family ? `<p><strong>Famille de conjugaison :</strong> ${escapedHtml(family)}.</p>` : ''
      return `${knowledgeBlock}${radicalBlock}${answerBlock}${familyFact}${exception}`
    }

    if (approach === 'concise') {
      return `<p>Avec <strong>${escapedHtml(subject)}</strong> ${escapedHtml(context)}, utilise le radical ${base}, puis ajoute ${ending}.</p>`
    }
    if (approach === 'guided-discovery') {
      return `<details><summary>Indice 1 · L’infinitif</summary><p>Pars de l’infinitif <strong>${escapedHtml(infinitive)}</strong> et identifie sa famille.</p></details><details><summary>Indice 2 · Le radical</summary><p>Ici, cette famille utilise le radical ${base}. Il faut le connaître comme radical repère, sans partir de la réponse.</p></details><details><summary>Indice 3 · Assemble</summary><p>Ajoute la terminaison ${ending} demandée avec ${escapedHtml(subject)}.</p></details>${exception}`
    }
    if (approach === 'cif-falc') {
      return `<ol><li>Pars de l’infinitif <strong>${escapedHtml(infinitive)}</strong>.</li><li>Pour ce temps, utilise le radical ${base}.</li><li>Ajoute la terminaison ${ending}.</li></ol>${exception}`
    }
    const familyFact = family ? `<p><strong>Famille de conjugaison :</strong> ${escapedHtml(family)}.</p>` : ''
    const suppletism = isSuppletive
      ? '<p>Le paradigme présente du <strong>supplétisme</strong> : plusieurs radicaux historiquement distincts coexistent.</p>'
      : ''
    return `<p>Pour <strong>${escapedHtml(infinitive)}</strong> avec <strong>${escapedHtml(subject)}</strong> ${escapedHtml(context)}, le paradigme fournit le <strong>radical contextuel</strong> ${base}; on lui ajoute la <strong>désinence</strong> ${ending}.</p><p>Ce radical est appris avec la famille du verbe, et non extrait de la réponse attendue.${alternation}</p>${familyFact}${suppletism}${exception}`
  }

  if (reference) {
    const transformation = reference.kind === 'memorized-form'
      ? 'Mémorise cette forme repère.'
      : reference.removableEnding
      ? `Retire ${removedEndingBadge(reference.removableEnding)} pour obtenir le radical ${radicalBadge(reference.radical)}.`
      : `Le radical repère est ${radicalBadge(reference.radical)}.`
    const assemble = reference.targetEnding
      ? `Ajoute <code>-${escapedHtml(reference.targetEnding)}</code> pour former <strong>${escapedHtml(actualForm)}</strong>.`
      : `Utilise cette forme avec ${escapedHtml(subject)}.`
    if (approach === 'concise') return `<p>${transformation} ${assemble}</p>`
    if (approach === 'guided-discovery') return `<details><summary>Indice 1 · La forme repère</summary><p>Pars de ${highlightedReference}.</p></details><details><summary>Indice 2 · Le radical</summary><p>${transformation}</p></details><details><summary>Indice 3 · La forme demandée</summary><p>${assemble}</p></details>`
    if (approach === 'cif-falc') return `<ol><li>Pars de la forme repère :<br>${highlightedReference}</li><li>${transformation}</li><li>${assemble}</li></ol>`
    return `<p>La forme repère est ${highlightedReference}. ${transformation}</p><p>Cette forme repère a été vérifiée contre le paradigme enregistré avant d’être proposée.</p>`
  }

  const strongIrregularity = isSuppletive
    ? 'Ce verbe est très irrégulier : son paradigme est supplétif et ne repose pas sur un radical unique.'
    : `Le radical varie avec la famille du verbe et parfois avec la personne ${escapedHtml(context)}.`
  if (approach === 'concise') {
    return `<p><strong>${escapedHtml(infinitive)}</strong> est très irrégulier ici : apprends cette forme avec son temps et sa personne.</p>`
  }
  if (approach === 'guided-discovery') {
    return `<details><summary>Indice 1 · L’infinitif</summary><p>Pars de <strong>${escapedHtml(infinitive)}</strong> et identifie sa famille.</p></details><details><summary>Indice 2 · Les formes repères</summary><p>Ce verbe emploie plusieurs radicaux${family ? ` dans la famille « ${escapedHtml(family)} »` : ''}. Il n’existe pas de retrait mécanique fiable.</p></details><details><summary>Indice 3 · Conclusion</summary><p>Apprends la forme avec son temps et sa personne, puis réutilise-la comme modèle.</p></details>`
  }
  if (approach === 'cif-falc') {
    return `<ol><li>Pars de l’infinitif <strong>${escapedHtml(infinitive)}</strong>.</li><li>Ce verbe change beaucoup : il n’a pas toujours le même radical.</li><li>Apprends la forme de ${escapedHtml(subject)} comme un modèle.</li></ol>`
  }
  const lexicalFact = isSuppletive ? '' : `<p>Le radical lexical indicatif est ${radicalBadge(lexical)}, mais il ne suffit pas à prédire sûrement cette forme.</p>`
  const familyFact = family ? `<p><strong>Famille de conjugaison :</strong> ${escapedHtml(family)}.</p>` : ''
  return `<p>${strongIrregularity}</p><p>Aucune règle de retrait fondée sur la réponse attendue n’est proposée : elle serait circulaire. Il faut rattacher cette forme à son paradigme ou à sa famille.</p>${lexicalFact}${familyFact}`
}

export function buildConjugationEndingsHtml(
  question: ExerciseQuestion,
  verb?: Verb,
  tense?: ConjugationTense,
  approach: CoachExplanationApproach = 'grammatical-technical',
) {
  const infinitive = question.infinitif || verb?.infinitif || 'ce verbe'
  const rule = tenseRule(question, verb, tense)
  const endingsAreFamilyDependent = !hasFamilyIndependentEndings(question, verb, tense)
  const endingItems = endingsAreFamilyDependent ? [] : rule.endingItems
  const context = tenseContext(question, tense)
  const decomposition = decomposeConjugationForm(question, verb, tense)
  const requestedEnding = subjectIndex(question) === null ? '' : endingItems[subjectIndex(question)!] || ''
  const introduction = `<p>Le verbe <strong>${escapedHtml(infinitive)}</strong> est ${verbGroupDescription(verb, infinitive)}.</p>`
  const reference = question.radicalReference?.validated === false ? undefined : question.radicalReference
  const referenceSubject = reference?.referenceSubject?.trim() || ''
  const referenceDisplay = reference?.form
    ? `${referenceSubject ? `${referenceSubject} ` : ''}${reference.form}`
    : ''
  const referenceReminder = referenceDisplay
    ? `<p><strong>${reference?.kind === 'memorized-stem' ? 'Radical repère' : 'Forme repère'} :</strong> ${reference?.kind === 'memorized-stem' ? `<mark>${escapedHtml(referenceDisplay)}</mark>` : rememberedFormMarkup(referenceDisplay)}${referenceSubject ? ` avec le pronom <strong>${escapedHtml(referenceSubject)}</strong>` : ''}.</p>`
    : ''

  if (approach === 'concise') {
    if (decomposition) {
      return `${referenceReminder}<p><strong>${escapedHtml(infinitive)}</strong> : prends <code>${escapedHtml(decomposition.base)}-</code>, puis ajoute <code>-${escapedHtml(decomposition.ending)}</code>.</p>`
    }
    if (requestedEnding) {
      return `${referenceReminder}<p><strong>${escapedHtml(infinitive)}</strong> ${escapedHtml(context)} : cherche la base de cette forme et ajoute ${endingBadge(requestedEnding)}.</p>`
    }
    return `${referenceReminder}<p><strong>${escapedHtml(infinitive)}</strong> change beaucoup ici : appuie-toi sur sa forme et sa famille.</p>`
  }

  if (approach === 'guided-discovery') {
    const baseClue = decomposition
      ? `Observe la forme demandée : quelle partie reste si tu retires ${endingBadge(decomposition.ending)} ?`
      : `Compare les formes de la famille de <strong>${escapedHtml(infinitive)}</strong>. Quelle partie retrouves-tu ?`
    const endingClue = requestedEnding
      ? `Pour ${escapedHtml(question.pronom || question.saisiePrefixe || 'cette personne')}, la terminaison attendue est ${endingBadge(requestedEnding)}.`
      : `Quelle forme de cette famille correspond à ${escapedHtml(question.pronom || question.saisiePrefixe || 'la personne demandée')} ?`
    return `<p>Ouvre les indices un par un et essaie de répondre avant de lire le suivant.</p><details><summary>Indice 1 · Le temps</summary><p>La forme est demandée ${escapedHtml(context)}. Quelle forme connue peux-tu utiliser comme point de départ ?</p>${referenceReminder}</details><details><summary>Indice 2 · La base</summary><p>${baseClue}</p></details><details><summary>Indice 3 · La terminaison</summary><p>${endingClue}</p></details><details><summary>Dernière vérification</summary><p>Assemble les deux parties, puis relis la phrase avec son sujet.</p></details>`
  }

  if (approach === 'cif-falc') {
    const baseStep = rule.endingsKind === 'auxiliary'
      ? `Choisis l’auxiliaire <strong>${escapedHtml(rule.auxiliaryLabel)}</strong>.`
      : decomposition
      ? `Trouve la base : ${radicalBadge(decomposition.base)}.`
      : `Trouve la base en regardant la famille du verbe <strong>${escapedHtml(infinitive)}</strong>.`
    const endingStep = rule.endingsKind === 'auxiliary' && requestedEnding
      ? `Conjugue-le : ${endingBadge(requestedEnding)}. Ajoute le participe passé, puis relis.`
      : decomposition
      ? `Ajoute ${endingBadge(decomposition.ending)}, puis relis la phrase.`
      : requestedEnding
        ? `Ajoute ${endingBadge(requestedEnding)}, puis relis la phrase.`
        : 'Choisis la forme qui va avec le sujet, puis relis la phrase.'
    const referenceStep = referenceDisplay ? ` Appuie-toi sur la forme repère ${rememberedFormMarkup(referenceDisplay)}.` : ''
    return `<ol><li>Regarde le temps : ${escapedHtml(context)}.${referenceStep}</li><li>${baseStep}</li><li>${endingStep}</li></ol>`
  }

  // Approche grammatico-technique : elle explicite le système et ses écarts.
  if (!endingItems.length) {
    const normalizedInfinitive = normalized(infinitive)
    const supplétive = normalizedInfinitive === 'aller' || normalizedInfinitive === 'etre'
      ? ' Son paradigme comporte du supplétisme : certaines formes proviennent de radicaux historiquement différents.'
      : ''
    return `${introduction}${referenceReminder}<p>Il n’existe pas de série unique de désinences ${escapedHtml(context)} pour ce verbe. Le radical dépend de sa famille et parfois de la personne.${supplétive}</p><p>Il faut donc partir de la forme attestée, puis identifier sa désinence.</p>`
  }
  const lead = rule.endingsKind === 'auxiliary'
    ? `<p>${context.replace(/^./u, character => character.toLocaleUpperCase('fr'))}, le verbe se construit avec l’auxiliaire <strong>${escapedHtml(rule.auxiliaryLabel)}</strong>. Les formes de cet auxiliaire sont :</p>`
    : `<p>Ses terminaisons ${escapedHtml(context)} sont :</p>`
  const pronouns = endingPronouns(question.mode || tense?.mode?.name || '', endingItems.length)
  const rows = endingItems.map((ending, index) => `<tr><th>${escapedHtml(pronouns[index] || `forme ${index + 1}`)}</th><td>${escapedHtml(ending)}</td></tr>`).join('')
  const construction = decomposition
    ? `<p><strong>${escapedHtml(decomposition.baseLabel)}</strong> : ${assembledFormBadges(decomposition.base, decomposition.ending)}. Cette construction associe un <strong>radical contextuel</strong> et une <strong>désinence</strong>.</p>`
    : ''
  const stem = lexicalStem(infinitive, verb?.terminaison)
  const alternation = decomposition && normalized(stem) !== normalized(decomposition.base)
    ? `<p>Le radical contextuel diffère du radical lexical ${radicalBadge(stem)} : il s’agit d’une alternance commandée par cette conjugaison.</p>`
    : ''
  const normalizedInfinitive = normalized(infinitive)
  const supplétism = (normalizedInfinitive === 'aller' || normalizedInfinitive === 'etre')
    ? '<p>Ce paradigme présente aussi du <strong>supplétisme</strong> : plusieurs radicaux d’origines différentes coexistent.</p>'
    : ''
  return `${introduction}${referenceReminder}${construction}${alternation}${supplétism}${lead}<table><tbody>${rows}</tbody></table>`
}

function meaningFor(question: ExerciseQuestion, verb?: Verb) {
  if (verb?.meaning?.trim()) return verb.meaning.trim()
  const descriptions = unique((verb?.categoriesSemantiques || []).map(category => semanticMeanings[category]))
  if (descriptions.length) return `Ce verbe ${descriptions.join(' et ')}.`
  if (question.complement) return `Dans cette question, son sens se comprend avec « ${question.complement} ».`
  return 'Observe la phrase entière pour déterminer le sens précis du verbe dans ce contexte.'
}

function targetedWarnings(question: ExerciseQuestion, verb?: Verb) {
  const warnings: string[] = []
  const infinitive = normalized(question.infinitif || verb?.infinitif)
  const particularities = new Set((verb?.particularites || []).map(normalized))

  if (infinitive.endsWith('ger') || particularities.has('ger')) {
    warnings.push('Verbe en -ger : devant a ou o, on garde le son doux de g en ajoutant e, par exemple « nous mangeons ».')
  }
  if (infinitive.endsWith('cer') || particularities.has('cer')) {
    warnings.push('Verbe en -cer : devant a ou o, c devient ç pour garder le son [s], par exemple « nous commençons ».')
  }
  if (infinitive.endsWith('guer')) {
    warnings.push('Verbe en -guer : le u appartient au radical et se conserve, par exemple « nous naviguons ».')
  }
  if (infinitive.endsWith('yer')) {
    warnings.push('Verbe en -yer : le y peut devenir i devant un e muet ; certaines formes admettent deux graphies.')
  }
  if (/(?:eler|eter)$/.test(infinitive)) {
    warnings.push('Vérifie la famille du verbe : selon le verbe, la consonne double ou le e devient è devant une syllabe muette.')
  }
  if (verb?.isPronominalForm || verb?.typePronominal === 'essentiel' || particularities.has('pronominal')) {
    warnings.push(particularityLabels.pronominal!)
  }
  if (verb?.estImpersonnel || particularities.has('impersonnel')) warnings.push(particularityLabels.impersonnel!)
  if (verb?.estDefectif || particularities.has('defectif')) warnings.push(particularityLabels.defectif!)
  for (const key of ['formes-alternatives', 'auxiliaire-variable']) {
    if (particularities.has(key)) warnings.push(particularityLabels[key]!)
  }
  if (question.agreementReminder) {
    const reminder = question.agreementReminder
    if (reminder.kind === 'cod-before') {
      warnings.push(`Le COD « ${reminder.complement} » est placé avant : avec avoir, vérifie l’accord du participe passé.`)
    } else if (reminder.kind === 'cod-after') {
      warnings.push(`Le COD « ${reminder.complement} » est placé après : avec avoir, le participe passé ne s’accorde pas avec lui.`)
    } else {
      warnings.push(`« ${reminder.complement} » est un COI : il ne commande pas l’accord du participe passé.`)
    }
  } else if ((question.isCompound || false) && normalized(verb?.auxiliaire) === 'etre') {
    warnings.push('Avec l’auxiliaire être, le participe passé s’accorde généralement avec le sujet.')
  }
  if (question.mode && normalized(question.mode) === 'subjonctif' && !normalized(question.saisiePrefixe).startsWith('que')) {
    warnings.push('Au subjonctif, pense à introduire la forme par « que » lorsque la phrase le demande.')
  }
  return unique(warnings)
}

export function isHelpCommand(value: string) {
  return normalized(value).replace(/[\s.!?…,:;]+$/g, '') === 'aide'
}

export function buildTargetedConjugationHelp(
  question: ExerciseQuestion,
  verb?: Verb,
  tense?: ConjugationTense,
): TargetedConjugationHelp {
  const infinitive = question.infinitif || verb?.infinitif || 'ce verbe'
  const stem = lexicalStem(infinitive, verb?.terminaison)
  const tenseName = [question.temps || tense?.name, question.mode || tense?.mode?.name]
    .filter(Boolean)
    .join(' · ')
  const rule = tenseRule(question, verb, tense)
  const decomposition = decomposeConjugationForm(question, verb, tense)
  const warnings = targetedWarnings(question, verb)
  const subject = question.pronom || question.saisiePrefixe
  const displayedTense = question.temps || tense?.name || ''
  const displayedMode = question.mode || tense?.mode?.name || ''
  const helpTitle = [
    subject,
    infinitive,
    displayedMode && normalized(displayedMode) !== 'indicatif'
      ? `${displayedTense} (${displayedMode})`
      : displayedTense,
  ].filter(Boolean).join(' | ')
  const method = [
    subject ? `Repère la personne : ${subject}.` : 'Repère la personne demandée.',
    question.isCompound || tense?.isCompound
      ? 'Conjugue d’abord l’auxiliaire, puis ajoute le participe passé.'
      : 'Choisis le bon radical, puis ajoute la terminaison de cette personne.',
    question.complement
      ? `Relis la phrase avec « ${question.complement} » pour vérifier le sens et l’accord.`
      : 'Relis la forme obtenue à voix basse pour vérifier qu’elle convient.',
  ]

  return {
    title: helpTitle || `Aide pour « ${infinitive} »`,
    subtitle: tenseName || 'Question en cours',
    requestedForm: requestedFormLabel(question, tense),
    meaning: meaningFor(question, verb),
    verbFacts: [
      { label: 'Groupe', value: groupLabel(verb) },
      { label: decomposition?.baseLabel || 'Radical lexical', value: `${decomposition?.base || stem}-` },
      ...(verb?.familleConjugaison ? [{ label: 'Famille', value: verb.familleConjugaison.replaceAll('-', ' ') }] : []),
      ...(verb?.participePasse && (question.isCompound || tense?.isCompound)
        ? [{ label: 'Participe passé', value: verb.participePasse }]
        : []),
    ],
    formation: [rule.rule],
    endings: rule.endings,
    exception: rule.exception,
    warnings,
    method,
    decomposition,
  }
}
