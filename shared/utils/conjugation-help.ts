import type { ConjugationTense, ExerciseQuestion, Verb } from '../types/conjugation'

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

export function buildConjugationEndingsHtml(
  question: ExerciseQuestion,
  verb?: Verb,
  tense?: ConjugationTense,
) {
  const infinitive = question.infinitif || verb?.infinitif || 'ce verbe'
  const rule = tenseRule(question, verb, tense)
  const mode = normalized(question.mode || tense?.mode?.name)
  const time = normalized(question.temps || tense?.name)
  const group = verb?.groupeConjugaison
  const endingsAreFamilyDependent = (mode === 'indicatif' && time === 'passe simple' && group !== 1 && group !== 2)
    || (mode === 'subjonctif' && time === 'present' && group === 3)
  const endingItems = endingsAreFamilyDependent ? [] : rule.endingItems
  const introduction = `<p>Le verbe <strong>${escapedHtml(infinitive)}</strong> est ${verbGroupDescription(verb, infinitive)}.</p>`
  if (!endingItems.length) {
    return `${introduction}<p>Il n’existe pas de série unique de terminaisons ${tenseContext(question, tense)} pour ce verbe. Appuie-toi sur la forme demandée et sur sa famille de conjugaison.</p>`
  }
  const lead = rule.endingsKind === 'auxiliary'
    ? `<p>${tenseContext(question, tense).replace(/^./u, character => character.toLocaleUpperCase('fr'))}, le verbe se construit avec l’auxiliaire <strong>${escapedHtml(rule.auxiliaryLabel)}</strong>. Les formes de cet auxiliaire sont :</p>`
    : `<p>Ses terminaisons ${tenseContext(question, tense)} sont :</p>`
  const pronouns = endingPronouns(question.mode || tense?.mode?.name || '', endingItems.length)
  const rows = endingItems.map((ending, index) => `<tr><th>${escapedHtml(pronouns[index] || `forme ${index + 1}`)}</th><td>${escapedHtml(ending)}</td></tr>`).join('')
  return `${introduction}${lead}<table><tbody>${rows}</tbody></table>`
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
  const warnings = targetedWarnings(question, verb)
  const subject = question.pronom || question.saisiePrefixe
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
    title: `Aide pour « ${infinitive} »`,
    subtitle: tenseName || 'Question en cours',
    requestedForm: requestedFormLabel(question, tense),
    meaning: meaningFor(question, verb),
    verbFacts: [
      { label: 'Groupe', value: groupLabel(verb) },
      { label: 'Radical de base', value: `${stem}-` },
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
  }
}
