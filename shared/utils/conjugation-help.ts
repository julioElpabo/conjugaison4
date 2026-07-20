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

function normalizedStrict(value: string | null | undefined) {
  return (value || '')
    .replace(/[’]/g, "'")
    .replace(/\s+/gu, ' ')
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

function rememberedFormMarkup(value: string, capitalize = true) {
  const trimmed = value.trim()
  const displayed = capitalize ? trimmed.replace(/^./u, letter => letter.toLocaleUpperCase('fr')) : trimmed
  return `<mark><strong>${escapedHtml(displayed)}</strong></mark>`
}

function startsWithVowelSound(value: string, verb?: Verb) {
  const first = normalized(value).charAt(0)
  if (first === 'h') return verb?.typeHInitial !== 'aspire'
  return 'aeiouy'.includes(first)
}

function isPronominalInfinitive(value: string, verb?: Verb) {
  return /^(?:se\s+|s['’])/iu.test(value.trim())
    || verb?.isPronominalForm
    || Boolean(verb?.typePronominal && verb.typePronominal !== 'aucun')
}

function reflexivePronounForVerb(subject: string, form: string, verb?: Verb) {
  const key = subjectKey(subject)
  const elide = startsWithVowelSound(form, verb)
  if (key === 'je') return elide ? 'm’' : 'me'
  if (key === 'tu') return elide ? 't’' : 'te'
  if (['il', 'elle', 'on', 'ils', 'elles'].includes(key)) return elide ? 's’' : 'se'
  if (key === 'nous') return 'nous'
  if (key === 'vous') return 'vous'
  return ''
}

function capitalizedDisplay(value: string) {
  return value.trim().replace(/^./u, letter => letter.toLocaleUpperCase('fr'))
}

function displayedConjugatedForm(subject: string, form: string, infinitive: string, verb?: Verb) {
  const cleanSubject = subject.trim()
  const cleanForm = form.trim()
  if (!cleanSubject) return capitalizedDisplay(cleanForm)
  if (isPronominalInfinitive(infinitive, verb)) {
    const coreForm = conjugatedCore(cleanForm)
    const reflexive = reflexivePronounForVerb(cleanSubject, coreForm, verb)
    const separator = reflexive.endsWith('’') ? '' : ' '
    return capitalizedDisplay(`${cleanSubject} ${reflexive}${separator}${coreForm}`)
  }
  if (subjectKey(cleanSubject) === 'je' && startsWithVowelSound(cleanForm)) return `J’${cleanForm}`
  return capitalizedDisplay(`${cleanSubject} ${cleanForm}`)
}

function displayedAnswerForm(question: ExerciseQuestion, infinitive: string, verb?: Verb) {
  const answer = (question.conjugaison1 || '').trim()
  if (!answer) return ''
  if (isPronominalInfinitive(infinitive, verb)) {
    return displayedConjugatedForm(question.pronom || question.saisiePrefixe || '', conjugatedCore(answer), infinitive, verb)
  }
  return capitalizedDisplay(conjugatedCore(answer))
}

function displayedStoredFormOnly(subject: string, form: string, infinitive: string, verb?: Verb) {
  const core = conjugatedCore(form)
  if (!isPronominalInfinitive(infinitive, verb)) return core
  const reflexive = reflexivePronounForVerb(subject, core, verb)
  const separator = reflexive.endsWith('’') ? '' : ' '
  return `${reflexive}${separator}${core}`
}

function pronominalAnswerHelp(subject: string, coreForm: string, infinitive: string, verb?: Verb, storedForm = '') {
  if (!isPronominalInfinitive(infinitive, verb) || !coreForm.trim()) return ''
  const reflexive = reflexivePronounForVerb(subject, coreForm, verb)
  const stored = storedForm.trim()
  const display = stored && subjectKey(stored) === subjectKey(subject) && normalized(conjugatedCore(stored)) === normalized(coreForm)
    ? stored
    : displayedStoredFormOnly(subject, coreForm, infinitive, verb)
  if (!reflexive || normalized(display) === normalized(coreForm)) return ''
  return `<p>Avec <strong>${escapedHtml(subjectKey(subject) || subject)}</strong>, le pronom réfléchi est <strong>${escapedHtml(reflexive)}</strong>.</p><p>${rememberedFormMarkup(display)}</p>`
}

function auxiliaryChoicesMarkup(active: 'avoir' | 'être') {
  const option = (auxiliary: 'avoir' | 'être') => active === auxiliary
    ? rememberedFormMarkup(auxiliary)
    : `<kbd>${escapedHtml(auxiliary.replace(/^./u, letter => letter.toLocaleUpperCase('fr')))}</kbd>`
  return `<p>${option('avoir')}</p><p>${option('être')}</p>`
}

function knowledgeCaption() {
  return '<figcaption>À savoir par cœur<i>♥</i></figcaption>'
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
  const subject = normalized(question.pronom || question.saisiePrefixe).replace(/^(?:que\s+|qu')/u, '')
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
    .replace(/^(?:je|j['’]|tu|il|elle|on|nous|vous|ils|elles)\s+/iu, '')
    .replace(/^(?:me|te|se|nous|vous)\s+/iu, '')
    .replace(/^[mts]['’]/iu, '')
    .trim()
}

function subjectKey(value: string | null | undefined) {
  const subject = normalized(value).replace(/^(?:que\s+|qu')/u, '')
  if (/^(?:je|j')/u.test(subject)) return 'je'
  if (/^tu\b/u.test(subject)) return 'tu'
  if (/^(?:il|elle|on)\b/u.test(subject)) return subject.match(/^(?:il|elle|on)/u)?.[0] || subject
  if (/^nous\b/u.test(subject)) return 'nous'
  if (/^vous\b/u.test(subject)) return 'vous'
  if (/^(?:ils|elles)\b/u.test(subject)) return subject.match(/^(?:ils|elles)/u)?.[0] || subject
  return subject
}

function referenceSubjectGroup(value: string | null | undefined) {
  const subject = subjectKey(value)
  if (['il', 'elle', 'on'].includes(subject)) return 'third-singular'
  if (['ils', 'elles'].includes(subject)) return 'third-plural'
  return subject
}

function requestedFormIsReference(
  question: ExerciseQuestion,
  reference: NonNullable<ExerciseQuestion['radicalReference']>,
) {
  const requestedForm = normalizedStrict(conjugatedCore(question.conjugaison1 || ''))
  const referenceForm = normalizedStrict(conjugatedCore(reference.form))
  const referenceSubject = referenceSubjectGroup(reference.referenceSubject)
  const requestedSubject = referenceSubjectGroup(question.pronom || question.saisiePrefixe)
  return Boolean(requestedForm && requestedForm === referenceForm && (!referenceSubject || requestedSubject === referenceSubject))
}

function stripLeadingHyphen(value: string) {
  return value.trim().replace(/^-/u, '')
}

function stripTrailingHyphen(value: string) {
  return value.trim().replace(/-$/u, '')
}

function adjustReferenceStemForEnding(stem: string, infinitive: string, ending: string) {
  const bare = normalized(bareInfinitive(infinitive))
  const normalizedEnding = normalized(ending)
  if (bare.endsWith('ger') && normalized(stem).endsWith('ge') && /^(?:i|e)/u.test(normalizedEnding)) {
    return stem.slice(0, -1)
  }
  if (bare.endsWith('cer') && stem.toLocaleLowerCase('fr').endsWith('ç') && /^(?:i|e)/u.test(normalizedEnding)) {
    return `${stem.slice(0, -1)}c`
  }
  return stem
}

function pastSimpleSeriesFromReference(form: string) {
  const normalizedForm = normalized(form)
  if (normalizedForm.endsWith('int')) return { stem: form.slice(0, -3), endings: ['ins', 'ins', 'int', 'înmes', 'întes', 'inrent'] }
  if (normalizedForm.endsWith('ut')) return { stem: form.slice(0, -2), endings: ['us', 'us', 'ut', 'ûmes', 'ûtes', 'urent'] }
  if (normalizedForm.endsWith('it')) return { stem: form.slice(0, -2), endings: ['is', 'is', 'it', 'îmes', 'îtes', 'irent'] }
  if (normalizedForm.endsWith('a')) return { stem: form.slice(0, -1), endings: ['ai', 'as', 'a', 'âmes', 'âtes', 'èrent'] }
  return null
}

function subjunctiveImperfectRootAndEndings(form: string) {
  const normalizedForm = normalized(form)
  if (normalizedForm.endsWith('int')) return { root: form.slice(0, -3), removable: form.slice(-3), endings: ['insse', 'insses', 'înt', 'inssions', 'inssiez', 'inssent'] }
  if (normalizedForm.endsWith('ut')) return { root: form.slice(0, -2), removable: form.slice(-2), endings: ['usse', 'usses', 'ût', 'ussions', 'ussiez', 'ussent'] }
  if (normalizedForm.endsWith('it')) return { root: form.slice(0, -2), removable: form.slice(-2), endings: ['isse', 'isses', 'ît', 'issions', 'issiez', 'issent'] }
  if (normalizedForm.endsWith('a')) return { root: form.slice(0, -1), removable: form.slice(-1), endings: ['asse', 'asses', 'ât', 'assions', 'assiez', 'assent'] }
  return null
}

function subjunctiveImperfectSeriesFromReference(form: string) {
  const normalizedForm = normalized(form)
  if (normalizedForm.endsWith('int')) {
    const root = form.slice(0, -3)
    return { stem: root, accentedThird: `${root}înt`, endings: ['insse', 'insses', '', 'inssions', 'inssiez', 'inssent'] }
  }
  if (normalizedForm.endsWith('ut')) {
    const root = form.slice(0, -2)
    return { stem: root, accentedThird: `${root}ût`, endings: ['usse', 'usses', '', 'ussions', 'ussiez', 'ussent'] }
  }
  if (normalizedForm.endsWith('it')) {
    const root = form.slice(0, -2)
    return { stem: root, accentedThird: `${root}ît`, endings: ['isse', 'isses', '', 'issions', 'issiez', 'issent'] }
  }
  if (normalizedForm.endsWith('a')) {
    const root = form.slice(0, -1)
    return { stem: root, accentedThird: `${root}ât`, endings: ['asse', 'asses', '', 'assions', 'assiez', 'assent'] }
  }
  return null
}

function referenceDerivedRows(
  question: ExerciseQuestion,
  reference: NonNullable<ExerciseQuestion['radicalReference']>,
  verb: Verb | undefined,
  tense: ConjugationTense | undefined,
  rule: ReturnType<typeof tenseRule>,
) {
  const mode = normalized(question.mode || tense?.mode?.name)
  const time = normalized(question.temps || tense?.name)
  const infinitive = question.infinitif || verb?.infinitif || ''
  const requestedPerson = subjectIndex(question)
  const pronouns = endingPronouns(question.mode || tense?.mode?.name || '', 6)
  let stem = ''
  let endings: string[] = []
  let fixedForms: Array<string | null> = []
  let lead = ''

  if (mode === 'indicatif' && time === 'passe simple' && reference.kind === 'past-simple-il') {
    const series = pastSimpleSeriesFromReference(reference.form)
    if (!series) return null
    stem = series.stem
    endings = series.endings
    if (normalized(reference.form).endsWith('ut') || normalized(reference.form).endsWith('int')) {
      lead = `Cette forme repère est utile parce qu’elle montre la série du passé simple de <strong>${escapedHtml(question.infinitif || verb?.infinitif || 'ce verbe')}</strong>. Avec elle, tu peux retenir les autres formes ${escapedHtml(tenseContext(question, tense))} :`
    }
  } else if (mode === 'subjonctif' && time === 'imparfait' && reference.kind === 'past-simple-il') {
    const series = subjunctiveImperfectSeriesFromReference(reference.form)
    if (!series) return null
    stem = series.stem
    endings = series.endings
    fixedForms = [null, null, series.accentedThird, null, null, null]
  } else if (rule.endingItems.length >= 3 && rule.endingsKind === 'endings') {
    stem = reference.removableEnding && reference.form.endsWith(reference.removableEnding)
      ? reference.form.slice(0, -reference.removableEnding.length)
      : stripTrailingHyphen(reference.radical)
    endings = rule.endingItems.map(stripLeadingHyphen)
  }

  if (!stem || !endings.length) return null
  const rows = endings.map((ending, index) => {
    const pronoun = pronouns[index] || `forme ${index + 1}`
    const adjustedStem = adjustReferenceStemForEnding(stem, infinitive, ending)
    const form = fixedForms[index] || `${adjustedStem}${ending}`
    const displayForm = isPronominalInfinitive(infinitive, verb)
      ? displayedConjugatedForm(pronoun, form, infinitive, verb)
      : form
    const formMarkup = index === requestedPerson
      ? rememberedFormMarkup(displayForm, false)
      : `<strong>${escapedHtml(displayForm)}</strong>`
    return `<tr><th><strong>${escapedHtml(pronoun)}</strong></th><td>${formMarkup}</td></tr>`
  }).join('')

  return rows ? { stem, rows, lead } : null
}

function referenceUsefulnessHtml(
  question: ExerciseQuestion,
  tense: ConjugationTense | undefined,
  reference: NonNullable<ExerciseQuestion['radicalReference']>,
  verb?: Verb,
) {
  const rule = tenseRule(question, verb, tense)
  const derived = referenceDerivedRows(question, reference, verb, tense, rule)
  if (!derived) return ''
  const context = tenseContext(question, tense)
  const displayedStem = radicalBadge(derived.stem)
  const lead = derived.lead || `Cette forme repère est utile parce qu’elle donne le point de départ ${displayedStem}. Avec les terminaisons, tu peux construire les formes ${escapedHtml(context)} :`
  return `<figure><figcaption>En effet</figcaption><blockquote><p>${lead}</p><table><tbody>${derived.rows}</tbody></table></blockquote></figure>`
}

function requestedReferenceVerificationHtml(
  question: ExerciseQuestion,
  reference: NonNullable<ExerciseQuestion['radicalReference']>,
  tense?: ConjugationTense,
) {
  const mode = normalized(question.mode || tense?.mode?.name)
  const time = normalized(question.temps || tense?.name)
  if (mode !== 'indicatif' || time !== 'present') return ''
  if (!reference.removableEnding || reference.targetEnding === undefined) return ''
  const sourceStem = reference.form.endsWith(reference.removableEnding)
    ? reference.form.slice(0, -reference.removableEnding.length)
    : stripTrailingHyphen(reference.radical)
  const ending = stripLeadingHyphen(reference.targetEnding)
  if (!sourceStem || !ending) return ''
  const pronoun = question.pronom || question.saisiePrefixe || 'cette personne'
  return `<figure><figcaption>Vérifie la réponse</figcaption><blockquote><p>Avec <strong>${escapedHtml(pronoun)}</strong> au présent, tu peux vérifier : radical ${radicalBadge(sourceStem)} + terminaison ${endingBadge(ending)}.</p><b>${assembledFormBadges(sourceStem, ending)}<i>✓</i></b></blockquote></figure>`
}

function requestedReferenceHelpHtml(
  question: ExerciseQuestion,
  tense: ConjugationTense | undefined,
  reference: NonNullable<ExerciseQuestion['radicalReference']>,
  verb?: Verb,
) {
  const subject = reference.referenceSubject?.trim() || question.pronom || question.saisiePrefixe || ''
  const requestedSubject = question.pronom || question.saisiePrefixe || ''
  const sameDisplayedSubject = referenceSubjectGroup(subject) === referenceSubjectGroup(requestedSubject)
  const display = displayedConjugatedForm(subject, reference.form, question.infinitif || verb?.infinitif || '', verb)
  const intro = sameDisplayedSubject
    ? `La forme demandée est justement la <strong>forme repère</strong> ${escapedHtml(tenseContext(question, tense))}.`
    : `La forme demandée utilise la même forme verbale que cette <strong>forme repère</strong> ${escapedHtml(tenseContext(question, tense))}.`
  const decomposition = decomposeConjugationForm(question, verb, tense)
  const construction = decomposition
    ? `<figure><figcaption>Construis la réponse</figcaption><blockquote><p>Tu peux aussi la reconstruire : radical ${radicalBadge(decomposition.base)} + terminaison ${endingBadge(decomposition.ending)}.</p><b>${assembledFormBadges(decomposition.base, decomposition.ending)}<i>✓</i></b>${pronominalAnswerHelp(requestedSubject, conjugatedCore(question.conjugaison1 || ''), question.infinitif || verb?.infinitif || '', verb, question.conjugaison1 || '')}</blockquote></figure>`
    : requestedReferenceVerificationHtml(question, reference, tense)
  return `<figure>${knowledgeCaption()}<blockquote><strong>Forme repère</strong><p>${intro} Apprends-la par cœur, c’est très utile :</p><p>${rememberedFormMarkup(display)}</p></blockquote></figure>${construction}${referenceUsefulnessHtml(question, tense, reference, verb)}`
}

function shouldUseReferenceMethodForRegularForm(
  question: ExerciseQuestion,
  reference: NonNullable<ExerciseQuestion['radicalReference']>,
  verb: Verb | undefined,
  tense?: ConjugationTense,
) {
  const mode = normalized(question.mode || tense?.mode?.name)
  const time = normalized(question.temps || tense?.name)
  const infinitive = question.infinitif || verb?.infinitif || ''
  if (isPronominalInfinitive(infinitive, verb)) return true
  if (mode === 'indicatif' && time === 'present' && (verb?.groupeConjugaison === 1 || verb?.groupeConjugaison === 2)) {
    return false
  }
  if (mode === 'indicatif' && time === 'futur' && reference.kind === 'future-stem') {
    const bare = bareInfinitive(infinitive)
    const regularRadical = bare.endsWith('re') ? bare.slice(0, -1) : bare
    if (normalizedStrict(stripTrailingHyphen(reference.radical)) === normalizedStrict(regularRadical)) return false
  }
  return true
}

function pronominalIntroHtml(question: ExerciseQuestion, infinitive: string, verb?: Verb) {
  if (!isPronominalInfinitive(infinitive, verb)) return ''
  const subject = question.pronom || question.saisiePrefixe || ''
  const core = conjugatedCore(question.conjugaison1 || '')
  const reflexive = reflexivePronounForVerb(subject, core, verb)
  if (!subject || !reflexive) return ''
  return `<figure><figcaption>Verbe pronominal</figcaption><blockquote><p><strong>${escapedHtml(infinitive)}</strong> est un verbe pronominal.</p><p>Avec <strong>${escapedHtml(subjectKey(subject) || subject)}</strong>, le pronom réfléchi est <strong>${escapedHtml(reflexive)}</strong>. Garde-le dès le début de la réponse.</p></blockquote></figure>`
}

function imperativePresentHelpHtml(
  question: ExerciseQuestion,
  reference?: ExerciseQuestion['radicalReference'],
) {
  const subject = subjectKey(question.pronom || question.saisiePrefixe)
  const references = reference?.imperativePresentReferences || []
  const requestedReference = references.find(item => item.subject === subject)
  const referenceRows = references.map(item => `<tr><th><strong>${escapedHtml(item.subject)}</strong></th><td>${rememberedFormMarkup(`${item.subject} ${item.form}`)}</td></tr>`).join('')
  const referencesMenu = referenceRows
    ? `<details><summary>Consulter les formes avec tu, nous et vous</summary><table><tbody>${referenceRows}</tbody></table></details>`
    : '<p>Les formes du présent de l’indicatif ne sont pas disponibles pour ce verbe.</p>'
  const knowledge = `<figure>${knowledgeCaption()}<blockquote><strong>Présent de l’indicatif : tu, nous, vous</strong><p>Apprends par cœur ces trois formes. Elles servent de formes repères pour construire l’impératif.</p>${referencesMenu}</blockquote></figure>`

  const actualForm = conjugatedCore(question.conjugaison1 || '')
  const capitalizedResult = actualForm.replace(/^./u, letter => letter.toLocaleUpperCase('fr'))
  const sourceForm = requestedReference?.form || reference?.form || ''
  const regularTarget = subject === 'tu' && /(?:es|as)$/iu.test(sourceForm) ? sourceForm.slice(0, -1) : sourceForm
  const isException = Boolean(sourceForm && normalized(regularTarget) !== normalized(actualForm))
  const referenceStep = requestedReference
    ? `Avec <strong>${escapedHtml(subject)}</strong>, pars de la forme du présent de l’indicatif :<br>${rememberedFormMarkup(`${subject} ${requestedReference.form}`)}`
    : `Choisis la forme du présent de l’indicatif qui correspond à <strong>${escapedHtml(subject || 'la personne demandée')}</strong>.`
  const verificationStep = isException
    ? 'Ce verbe fait exception : sa forme à l’impératif doit aussi être apprise par cœur. Regarde les exceptions plus bas.'
    : subject === 'tu'
      ? 'Vérifie s’il faut garder ou enlever le <strong>s</strong>. Regarde le bloc « s ou pas s avec tu » plus bas.'
      : ''
  const result = actualForm ? `<blockquote><strong>Résultat</strong><p><mark><strong>${escapedHtml(capitalizedResult)}</strong></mark></p></blockquote>` : ''
  const verificationItem = verificationStep ? `<li>${verificationStep}</li>` : ''
  const construction = `<figure><figcaption>Construis la réponse</figcaption><ol><li>${referenceStep}</li><li>Garde la forme verbale, mais n’écris pas le pronom sujet.</li>${verificationItem}</ol>${result}</figure>`

  const sRule = subject === 'tu'
    ? normalized(sourceForm) !== normalized(actualForm)
      ? `<figure><figcaption>S ou pas s avec tu</figcaption><blockquote><strong>Ici : pas de s final</strong><p>La forme au présent est <strong>${escapedHtml(sourceForm)}</strong>. À l’impératif avec <strong>tu</strong>, on enlève le <strong>s</strong> final : <strong>${escapedHtml(actualForm)}</strong>.</p><p>Si <strong>en</strong> ou <strong>y</strong> vient juste après, le <strong>s</strong> revient : <em>manges-en</em>, <em>vas-y</em>.</p></blockquote></figure>`
      : `<figure><figcaption>S ou pas s avec tu</figcaption><blockquote><strong>Ici : garde le s final</strong><p>La forme au présent est <strong>${escapedHtml(sourceForm)}</strong>. Pour ce verbe, l’impératif avec <strong>tu</strong> garde cette forme sans le pronom sujet.</p></blockquote></figure>`
    : ''
  return `${knowledge}${construction}${sRule}`
}

function subjunctiveImperfectHelpHtml(
  question: ExerciseQuestion,
  reference: NonNullable<ExerciseQuestion['radicalReference']>,
  verb: Verb | undefined,
  tense: ConjugationTense | undefined,
  approach: CoachExplanationApproach,
) {
  const infinitive = question.infinitif || verb?.infinitif || ''
  const requestedPerson = subjectIndex(question)
  const referenceForm = reference.form || ''
  const series = subjunctiveImperfectRootAndEndings(referenceForm)
  const endings = series?.endings || ['sse', 'sses', 't', 'ssions', 'ssiez', 'ssent']
  const removableEnding = series?.removable || reference.removableEnding || ''
  const rawRadical = series?.root || (removableEnding && referenceForm.endsWith(removableEnding)
    ? referenceForm.slice(0, -removableEnding.length)
    : reference.radical || '')
  const targetEnding = stripLeadingHyphen(
    reference.targetEnding
    || (requestedPerson === null ? '' : endings[requestedPerson] || '')
  )
  const radical = targetEnding
    ? adjustReferenceStemForEnding(rawRadical, infinitive, targetEnding)
    : reference.radical || rawRadical
  const referenceSubject = reference.referenceSubject || 'il'
  const displayedReference = displayedConjugatedForm(referenceSubject, referenceForm, infinitive, verb)
  const highlightedReference = displayedReference ? rememberedFormMarkup(displayedReference) : ''
  const pronouns = endingPronouns('subjonctif', endings.length)
  const endingRows = endings.map((ending, index) => `<tr><th><strong>${escapedHtml(pronouns[index] || '')}</strong></th><td>${index === requestedPerson ? endingBadge(ending) : `<strong>-${escapedHtml(ending)}</strong>`}</td></tr>`).join('')
  const endingsBlock = `<blockquote><strong>${escapedHtml(endingsKnowledgeTitle(question, tense))}</strong><table><tbody>${endingRows}</tbody></table></blockquote>`
  const knowledgeBlock = `<figure>${knowledgeCaption()}<blockquote><strong>Forme repère</strong><p>Voici la forme repère au passé simple de l’indicatif. Apprends-la par cœur, c’est très utile :</p><p>${highlightedReference}</p></blockquote>${endingsBlock}</figure>`
  const usefulnessBlock = referenceUsefulnessHtml(question, tense, reference, verb)
  const removeInstruction = removableEnding
    ? `Enlève ${removedEndingBadge(removableEnding)} : tu obtiens le point de départ ${radicalBadge(rawRadical)}.`
    : `Garde le radical ${radicalBadge(radical)}.`
  const radicalBlock = approach === 'guided-discovery'
    ? `<figure><figcaption>Trouve le radical</figcaption><details><summary>Indice 1 · La forme repère</summary><p>Prends la forme repère :<br>${highlightedReference}</p></details><details><summary>Indice 2 · Le radical</summary><p>${removeInstruction}</p></details></figure>`
    : `<figure><figcaption>Trouve le radical</figcaption><ol><li>Prends la forme repère :<br>${highlightedReference}</li><li>${removeInstruction}</li></ol></figure>`
  const answerDisplay = displayedAnswerForm(question, infinitive, verb)
  const answerMarkup = radical && targetEnding
    ? `<b>${assembledFormBadges(radical, targetEnding)}<i>✓</i></b>`
    : rememberedFormMarkup(answerDisplay || question.conjugaison1 || '')
  const pronominalResult = isPronominalInfinitive(infinitive, verb) && answerDisplay
    ? pronominalAnswerHelp(question.pronom || question.saisiePrefixe || '', conjugatedCore(question.conjugaison1 || ''), infinitive, verb, question.conjugaison1 || '')
    : ''
  const answerBlock = `<figure><figcaption>Réponse</figcaption><blockquote><p>Ajoute ${endingBadge(targetEnding)} au point de départ ${radicalBadge(radical)} :</p>${answerMarkup}${pronominalResult}</blockquote></figure>`
  return `${knowledgeBlock}${radicalBlock}${answerBlock}${usefulnessBlock}`
}

function subjunctivePresentHelpHtml(
  question: ExerciseQuestion,
  reference?: ExerciseQuestion['radicalReference'],
  verb?: Verb,
) {
  const infinitive = question.infinitif || verb?.infinitif || ''
  const requestedPerson = subjectIndex(question)
  const requestedForm = conjugatedCore(question.conjugaison1 || '')
  const requestedSubject = question.pronom || question.saisiePrefixe || ''
  const requestedDisplay = displayedStoredFormOnly(requestedSubject, requestedForm, infinitive, verb)
  const endings = ['e', 'es', 'e', 'ions', 'iez', 'ent']
  const pronouns = endingPronouns('subjonctif', endings.length)
  const indicativeReferences = reference?.subjunctivePresentReferences || []
  const ilsReference = indicativeReferences.find(item => item.subject === 'ils')
  const nousReference = indicativeReferences.find(item => item.subject === 'nous')
  const usesVerifiedReference = reference?.kind === 'present-ils' || reference?.kind === 'present-nous'

  if (!usesVerifiedReference) {
    const storedForms = reference?.subjunctivePresentForms || []
    const rows = pronouns.map((pronoun, index) => {
      const personId = [4, 5, 6, 7, 8, 9][index]
      const stored = storedForms.find(item => item.personId === personId)?.form
      const form = stored || (index === requestedPerson ? requestedForm : '')
      if (!form) return ''
      const display = displayedStoredFormOnly(pronoun, form, infinitive, verb)
      return `<tr><th><strong>${escapedHtml(pronoun)}</strong></th><td>${index === requestedPerson ? rememberedFormMarkup(display) : `<strong>${escapedHtml(display)}</strong>`}</td></tr>`
    }).join('')
    const knowledge = `<figure>${knowledgeCaption()}<blockquote><strong>Formes particulières du subjonctif présent</strong><p>Le verbe <strong>${escapedHtml(question.infinitif || 'demandé')}</strong> est irrégulier ici. Les formes avec <strong>ils</strong> et <strong>nous</strong> au présent de l’indicatif ne suffisent pas pour construire sûrement toutes les personnes.</p>${rows ? `<table><tbody>${rows}</tbody></table>` : `<p>${rememberedFormMarkup(requestedForm)}</p>`}</blockquote></figure>`
    const pronominalHelp = pronominalAnswerHelp(requestedSubject, requestedForm, infinitive, verb, question.conjugaison1 || '')
    const answer = `<figure><figcaption>Construis la réponse</figcaption><ol><li>Repère la personne demandée.</li><li>Choisis la forme du subjonctif présent dans le tableau et apprends-la par cœur.</li></ol><blockquote><strong>Résultat</strong><p>${rememberedFormMarkup(requestedDisplay || requestedForm)}</p>${pronominalHelp}</blockquote></figure>`
    return `${knowledge}${answer}`
  }

  const referenceRows = `<p>Pour <strong>que je, que tu, qu’il / elle / on</strong> et <strong>qu’ils / elles</strong>, pars de la forme avec <strong>ils</strong> au présent de l’indicatif :</p>${ilsReference ? `<p>${rememberedFormMarkup(displayedConjugatedForm('ils', ilsReference.form, infinitive, verb))}</p>` : ''}<p>Pour <strong>que nous</strong> et <strong>que vous</strong>, pars de la forme avec <strong>nous</strong> au présent de l’indicatif :</p>${nousReference ? `<p>${rememberedFormMarkup(displayedConjugatedForm('nous', nousReference.form, infinitive, verb))}</p>` : ''}`
  const endingRows = endings.map((ending, index) => `<tr><th><strong>${escapedHtml(pronouns[index] || '')}</strong></th><td>${index === requestedPerson ? endingBadge(ending) : `<strong>-${escapedHtml(ending)}</strong>`}</td></tr>`).join('')
  const knowledge = `<figure>${knowledgeCaption()}<blockquote><strong>Deux formes repères</strong><p>Apprends ces deux formes. Elles permettent de construire toutes les personnes du subjonctif présent.</p>${referenceRows}</blockquote><blockquote><strong>Terminaisons du subjonctif présent</strong><table><tbody>${endingRows}</tbody></table></blockquote></figure>`

  const sourceSubject = reference?.referenceSubject || (requestedPerson === 3 || requestedPerson === 4 ? 'nous' : 'ils')
  const sourceForm = reference?.form || (sourceSubject === 'nous' ? nousReference?.form : ilsReference?.form) || ''
  const removableEnding = reference?.removableEnding || (sourceSubject === 'nous' ? 'ons' : 'ent')
  const sourceDisplay = displayedConjugatedForm(sourceSubject, sourceForm, infinitive, verb)
  const requestedIsSource = Boolean(sourceForm)
    && referenceSubjectGroup(sourceSubject) === referenceSubjectGroup(requestedSubject)
    && normalized(sourceForm) === normalized(requestedForm)
  if (requestedIsSource) {
    const result = requestedDisplay || displayedStoredFormOnly(requestedSubject, requestedForm, infinitive, verb) || requestedForm
    const construction = `<figure><figcaption>Construis la réponse</figcaption><blockquote><p>La forme demandée est une <strong>forme repère</strong>. Apprends-la par cœur.</p><p>Au subjonctif, écris-la après <strong>que</strong> quand la phrase le demande.</p><p>${rememberedFormMarkup(result)}</p></blockquote></figure>`
    return `${knowledge}${referenceUsefulnessHtml(question, undefined, reference!, verb)}${construction}`
  }
  const rawRadical = sourceForm.endsWith(removableEnding) ? sourceForm.slice(0, -removableEnding.length) : reference?.radical || ''
  const radical = reference?.radical || rawRadical
  const ending = reference?.targetEnding || (requestedPerson === null ? '' : endings[requestedPerson] || '')
  const bare = normalized(bareInfinitive(question.infinitif || ''))
  const adjustmentExplanation = bare.endsWith('ger') && normalized(rawRadical).endsWith('ge') && normalized(radical).endsWith('g')
    ? 'Si la lettre <strong>g</strong> est suivie de <strong>i</strong>, pas besoin de <strong>e</strong>. Regarde l’explication plus bas.'
    : bare.endsWith('cer') && rawRadical.toLocaleLowerCase('fr').endsWith('ç') && normalized(radical).endsWith('c')
      ? 'Devant <strong>i</strong>, la cédille ne sert pas. Regarde l’explication plus bas.'
      : 'Le radical s’adapte devant cette terminaison.'
  const adjustment = normalized(rawRadical) !== normalized(radical)
    ? `<li>${adjustmentExplanation} ${radicalBadge(rawRadical)} devient ${radicalBadge(radical)}.</li>`
    : ''
  const assembly = radical && ending ? assembledFormBadges(radical, ending) : rememberedFormMarkup(requestedForm)
  const pronominalResult = pronominalAnswerHelp(requestedSubject, requestedForm, infinitive, verb, question.conjugaison1 || '')
  const construction = `<figure><figcaption>Construis la réponse</figcaption><ol><li>Pars de la forme avec <strong>${escapedHtml(sourceSubject)}</strong> au présent de l’indicatif :<br>${rememberedFormMarkup(sourceDisplay)}</li><li>Enlève ${removedEndingBadge(removableEnding)} : il reste le radical ${radicalBadge(rawRadical)}.</li>${adjustment}<li>Ajoute ${endingBadge(ending)}.</li></ol><blockquote><strong>Résultat</strong><p>${assembly}</p>${pronominalResult}</blockquote></figure>`
  return `${knowledge}${construction}`
}

function conditionalPresentHelpHtml(
  question: ExerciseQuestion,
  verb?: Verb,
  reference?: ExerciseQuestion['radicalReference'],
) {
  const infinitive = question.infinitif || verb?.infinitif || 'ce verbe'
  const bare = bareInfinitive(infinitive)
  const requestedPerson = subjectIndex(question)
  const endings = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient']
  const ending = reference?.targetEnding || (requestedPerson === null ? '' : endings[requestedPerson] || '')
  const actualForm = conjugatedCore(question.conjugaison1 || '')
  const decomposedRadical = ending && normalized(actualForm).endsWith(normalized(ending))
    ? actualForm.slice(0, -ending.length)
    : ''
  const futureRadical = reference?.radical || decomposedRadical
  const regularRadical = normalized(bare).endsWith('re') ? bare.slice(0, -1) : bare
  const regularRadicalKey = stripTrailingHyphen(regularRadical)
  const futureRadicalKey = stripTrailingHyphen(futureRadical)
  const isRegularRadical = Boolean(futureRadical && normalizedStrict(futureRadicalKey) === normalizedStrict(regularRadicalKey))
  const isAccentAlternation = Boolean(
    futureRadical
    && normalized(futureRadicalKey) === normalized(regularRadicalKey)
    && normalizedStrict(futureRadicalKey) !== normalizedStrict(regularRadicalKey),
  )
  const referenceSubject = reference?.referenceSubject || 'je'
  const referenceDisplay = reference?.form ? displayedConjugatedForm(referenceSubject, reference.form, infinitive, verb) : ''
  const endingRows = endings.map((item, index) => `<tr><th><strong>${escapedHtml(endingPronouns('conditionnel', endings.length)[index] || '')}</strong></th><td>${index === requestedPerson ? endingBadge(item) : `<strong>-${escapedHtml(item)}</strong>`}</td></tr>`).join('')

  const referenceKnowledge = referenceDisplay && !isRegularRadical
    ? `<blockquote><strong>Forme repère du futur</strong><p>Apprends par cœur cette forme repère. Elle donne le radical du futur :</p><p>${rememberedFormMarkup(referenceDisplay)}</p></blockquote>`
    : ''
  const knowledge = `<figure>${knowledgeCaption()}<blockquote><strong>La formule</strong><p><strong>Conditionnel présent</strong> = ${radicalBadge('radical du futur')} + ${endingBadge('terminaisons de l’imparfait', false)}.</p></blockquote>${referenceKnowledge}<blockquote><strong>Terminaisons de l’imparfait</strong><table><tbody>${endingRows}</tbody></table></blockquote></figure>`

  const radicalConstruction = isRegularRadical
    ? normalized(bare).endsWith('re')
      ? `<ol><li>Pars de l’infinitif : <strong>${escapedHtml(bare)}</strong>.</li><li>Enlève le <strong>e</strong> final : tu obtiens ${radicalBadge(futureRadical)}.</li></ol>`
      : `<ol><li>Pars de l’infinitif : <strong>${escapedHtml(bare)}</strong>.</li><li>Garde tout l’infinitif : le radical du futur est ${radicalBadge(futureRadical)}.</li></ol>`
    : isAccentAlternation
      ? `<ol><li>Pars de l’infinitif : <strong>${escapedHtml(bare)}</strong>.</li><li>Le radical du futur change d’accent : ${radicalBadge(regularRadical)} devient ${radicalBadge(futureRadical)}.</li></ol>`
      : referenceDisplay
      ? `<ol><li>Pars de la forme repère au futur :<br>${rememberedFormMarkup(referenceDisplay)}</li><li>Enlève ${removedEndingBadge(reference?.removableEnding || 'ai')} : tu obtiens ${radicalBadge(futureRadical)}.</li></ol>`
      : `<p>Pour ce verbe, apprends le radical du futur : ${radicalBadge(futureRadical)}.</p>`
  const radicalBlock = `<figure><figcaption>Trouve le radical du futur</figcaption>${radicalConstruction}</figure>`

  const assembly = futureRadical && ending ? assembledFormBadges(futureRadical, ending) : rememberedFormMarkup(actualForm)
  const answer = `<figure><figcaption>Réponse</figcaption><blockquote><p>Ajoute la terminaison de l’imparfait ${endingBadge(ending)} au radical du futur ${radicalBadge(futureRadical)} :</p><b>${assembly}<i>✓</i></b></blockquote></figure>`
  return `${knowledge}${radicalBlock}${answer}`
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

interface AuxiliarySimpleTense {
  mode: string
  tense: string
  pronouns: string[]
  forms: Record<'avoir' | 'être', string[]>
}

const AUXILIARY_SIMPLE_TENSES: AuxiliarySimpleTense[] = [
  { mode: 'indicatif', tense: 'présent', pronouns: ['je', 'tu', 'il / elle / on', 'nous', 'vous', 'ils / elles'], forms: { avoir: ['ai', 'as', 'a', 'avons', 'avez', 'ont'], être: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'] } },
  { mode: 'indicatif', tense: 'imparfait', pronouns: ['je', 'tu', 'il / elle / on', 'nous', 'vous', 'ils / elles'], forms: { avoir: ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'], être: ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'] } },
  { mode: 'indicatif', tense: 'futur', pronouns: ['je', 'tu', 'il / elle / on', 'nous', 'vous', 'ils / elles'], forms: { avoir: ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'], être: ['serai', 'seras', 'sera', 'serons', 'serez', 'seront'] } },
  { mode: 'indicatif', tense: 'passé simple', pronouns: ['je', 'tu', 'il / elle / on', 'nous', 'vous', 'ils / elles'], forms: { avoir: ['eus', 'eus', 'eut', 'eûmes', 'eûtes', 'eurent'], être: ['fus', 'fus', 'fut', 'fûmes', 'fûtes', 'furent'] } },
  { mode: 'conditionnel', tense: 'présent', pronouns: ['je', 'tu', 'il / elle / on', 'nous', 'vous', 'ils / elles'], forms: { avoir: ['aurais', 'aurais', 'aurait', 'aurions', 'auriez', 'auraient'], être: ['serais', 'serais', 'serait', 'serions', 'seriez', 'seraient'] } },
  { mode: 'subjonctif', tense: 'présent', pronouns: ['que j’', 'que tu', 'qu’il / elle / on', 'que nous', 'que vous', 'qu’ils / elles'], forms: { avoir: ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'], être: ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'] } },
  { mode: 'subjonctif', tense: 'imparfait', pronouns: ['que j’', 'que tu', 'qu’il / elle / on', 'que nous', 'que vous', 'qu’ils / elles'], forms: { avoir: ['eusse', 'eusses', 'eût', 'eussions', 'eussiez', 'eussent'], être: ['fusse', 'fusses', 'fût', 'fussions', 'fussiez', 'fussent'] } },
  { mode: 'impératif', tense: 'présent', pronouns: ['tu', 'nous', 'vous'], forms: { avoir: ['aie', 'ayons', 'ayez'], être: ['sois', 'soyons', 'soyez'] } },
  { mode: 'infinitif', tense: 'présent', pronouns: ['forme'], forms: { avoir: ['avoir'], être: ['être'] } },
  { mode: 'participe', tense: 'présent', pronouns: ['forme'], forms: { avoir: ['ayant'], être: ['étant'] } },
]

function compoundSimpleTense(mode: string, tense: string) {
  const key = `${normalized(mode)}:${normalized(tense)}`
  const mappings: Record<string, { mode: string, tense: string }> = {
    'indicatif:passe compose': { mode: 'indicatif', tense: 'présent' },
    'indicatif:plus-que-parfait': { mode: 'indicatif', tense: 'imparfait' },
    'indicatif:futur anterieur': { mode: 'indicatif', tense: 'futur' },
    'indicatif:passe anterieur': { mode: 'indicatif', tense: 'passé simple' },
    'conditionnel:passe': { mode: 'conditionnel', tense: 'présent' },
    'conditionnel:passe 1': { mode: 'conditionnel', tense: 'présent' },
    'conditionnel:passe 2': { mode: 'subjonctif', tense: 'imparfait' },
    'subjonctif:passe': { mode: 'subjonctif', tense: 'présent' },
    'subjonctif:plus-que-parfait': { mode: 'subjonctif', tense: 'imparfait' },
    'imperatif:passe': { mode: 'impératif', tense: 'présent' },
    'infinitif:passe': { mode: 'infinitif', tense: 'présent' },
    'participe:passe': { mode: 'participe', tense: 'présent' },
    'gerondif:passe': { mode: 'participe', tense: 'présent' },
  }
  return mappings[key] || null
}

function inferCompoundAuxiliary(question: ExerciseQuestion, verb?: Verb): 'avoir' | 'être' {
  const words = new Set(normalized(question.conjugaison1).split(/[^a-z]+/u).filter(Boolean))
  const etreForms = new Set(AUXILIARY_SIMPLE_TENSES.flatMap(item => item.forms.être.map(normalized)))
  const avoirForms = new Set(AUXILIARY_SIMPLE_TENSES.flatMap(item => item.forms.avoir.map(normalized)))
  if ([...words].some(word => etreForms.has(word))) return 'être'
  if ([...words].some(word => avoirForms.has(word))) return 'avoir'
  return normalized(verb?.auxiliaire) === 'etre' ? 'être' : 'avoir'
}

function auxiliaryConjugationHtml(auxiliary: 'avoir' | 'être', target: { mode: string, tense: string } | null, requestedPerson: number | null) {
  const selected = target
    ? AUXILIARY_SIMPLE_TENSES.find(item => normalized(item.mode) === normalized(target.mode) && normalized(item.tense) === normalized(target.tense))
    : undefined
  if (!selected) return '<p>La conjugaison de l’auxiliaire n’est pas disponible pour cette forme.</p>'
  const rows = selected.forms[auxiliary].map((form, index) => {
    const isRequested = index === requestedPerson || (requestedPerson === null && selected.forms[auxiliary].length === 1)
    return `<tr><th><strong>${escapedHtml(selected.pronouns[index] || `personne ${index + 1}`)}</strong></th><td>${isRequested ? `<mark><strong>${escapedHtml(form)}</strong></mark>` : `<strong>${escapedHtml(form)}</strong>`}</td></tr>`
  }).join('')
  const summary = target?.tense
    ? `${normalized(target.mode) === 'imperatif' ? 'impératif ' : ''}${target.tense} du verbe ${auxiliary}`
    : `Temps simples du verbe ${auxiliary}`
  return `<details><summary>${escapedHtml(summary)}</summary><table><tbody>${rows}</tbody></table></details>`
}

function auxiliaryPersonIndex(question: ExerciseQuestion, target: { mode: string, tense: string } | null) {
  if (normalized(target?.mode) !== 'imperatif') return subjectIndex(question)
  const subject = normalized(question.pronom || question.saisiePrefixe)
  if (subject === 'tu') return 0
  if (subject === 'nous') return 1
  if (subject === 'vous') return 2
  return null
}

function compoundAuxiliaryPart(form: string, participle: string) {
  const source = form.trim()
  if (!source || !participle) return source
  const escaped = participle.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
  return source
    .replace(new RegExp(`\\s+${escaped}(?:e|s|es)?$`, 'iu'), '')
    .replace(/^en\s+/iu, '')
    .replace(/^(?:me|te|se|nous|vous|m['’]|t['’]|s['’])\s*/iu, '')
    .trim()
}

function agreedParticipleFromCompound(form: string, baseParticiple: string) {
  if (!baseParticiple) return ''
  const escaped = baseParticiple.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
  const match = form.match(new RegExp(`(?:^|\\s)(${escaped}(?:e|s|es)?)(?=$|\\s|[.,!?;:])`, 'iu'))
  return match?.[1] || baseParticiple
}

function compoundAgreementHtml(auxiliary: 'avoir' | 'être', subject: string, baseParticiple = '', answer = '') {
  if (auxiliary === 'être') {
    const tuNote = subjectKey(subject) === 'tu'
      ? '<p>Avec <strong>tu</strong>, la forme peut changer selon la personne à qui l’on parle : <em>sois né</em> ou <em>sois née</em>. L’exercice attend ici la forme enregistrée dans la réponse.</p>'
      : ''
    const agreed = agreedParticipleFromCompound(answer, baseParticiple)
    const key = subjectKey(subject)
    const pluralNote = ['nous', 'vous', 'ils', 'elles'].includes(key) && agreed && normalized(agreed) !== normalized(baseParticiple)
      ? key === 'vous'
        ? `<p>Ici, l’exercice attend <strong>${escapedHtml(agreed)}</strong>. Avec <strong>vous</strong>, l’accord dépend du contexte : une personne polie, plusieurs personnes, masculin ou féminin.</p>`
        : `<p>Ici, <strong>${escapedHtml(key)}</strong> désigne plusieurs personnes : le participe passé s’accorde au pluriel. <strong>${escapedHtml(baseParticiple)}</strong> devient <strong>${escapedHtml(agreed)}</strong>.</p>`
      : ''
    return `<figure><figcaption>Accord du participe passé</figcaption><blockquote><strong>Avec être</strong><p>Le participe passé s’accorde avec le sujet.</p><p><em>Elle est arrivée. · Ils sont arrivés.</em></p>${pluralNote}${tuNote}</blockquote></figure>`
  }
  return `<figure><figcaption>Accord du participe passé</figcaption><blockquote><strong>Cas général avec avoir</strong><p>Le participe passé ne s’accorde pas avec le sujet.</p><p><em>Elle a mangé. · Ils ont mangé.</em></p></blockquote><blockquote><strong>Si le COD est placé avant</strong><p>Le participe passé s’accorde avec le complément d’objet direct placé avant le verbe.</p><p><em>Les pommes qu’elle a mangées. · Les livres qu’il a lus.</em></p></blockquote></figure>`
}

function buildCompoundConjugationHtml(question: ExerciseQuestion, verb?: Verb, tense?: ConjugationTense) {
  const infinitive = question.infinitif || verb?.infinitif || 'ce verbe'
  const auxiliary = inferCompoundAuxiliary(question, verb)
  const participle = verb?.participePasse?.trim() || question.agreementReminder?.participle?.trim() || 'participe passé à vérifier'
  const simpleTense = compoundSimpleTense(question.mode || tense?.mode?.name || '', question.temps || tense?.name || '')
  const person = auxiliaryPersonIndex(question, simpleTense)
  const subject = question.pronom || question.saisiePrefixe || 'la personne demandée'
  const auxiliaryForm = compoundAuxiliaryPart(question.conjugaison1 || '', participle)
  const auxiliaryContext = simpleTense
    ? `${withAArticle(simpleTense.tense)} ${withDeArticle(simpleTense.mode)}`
    : 'au temps simple correspondant'
  const knowledge = `<figure>${knowledgeCaption()}<blockquote><strong>Quel verbe auxiliaire pour ${escapedHtml(infinitive)} ?</strong>${auxiliaryChoicesMarkup(auxiliary)}</blockquote>${auxiliaryConjugationHtml(auxiliary, simpleTense, person)}<blockquote><strong>Le participe passé de ${escapedHtml(infinitive)}</strong><p>${rememberedFormMarkup(participle)}</p></blockquote></figure>`
  const conjugatedAuxiliary = auxiliaryForm
    ? `<br><mark><strong>${escapedHtml(auxiliaryForm)}</strong></mark>`
    : ''
  const nonPersonal = ['participe', 'gerondif'].includes(normalized(question.mode || tense?.mode?.name))
  const auxiliaryInstruction = nonPersonal
    ? `Utilise le verbe auxiliaire <strong>${escapedHtml(auxiliary)}</strong> ${escapedHtml(auxiliaryContext)} :${conjugatedAuxiliary}`
    : `Conjugue le verbe auxiliaire <strong>${escapedHtml(auxiliary)}</strong> ${escapedHtml(auxiliaryContext)} avec <strong>${escapedHtml(subject)}</strong> :${conjugatedAuxiliary}`
  const result = question.conjugaison1?.trim()
    ? `<blockquote><strong>Résultat</strong><p><mark><strong>${escapedHtml(question.conjugaison1.trim())}</strong></mark></p></blockquote>`
    : ''
  const answer = `<figure><figcaption>Réponse</figcaption><ol><li>${auxiliaryInstruction}</li><li>Ajoute le participe passé :<br>${rememberedFormMarkup(participle)}</li><li>Vérifie l’accord du participe passé. Regarde plus bas pour plus de détails.</li></ol>${result}</figure>`
  return `${knowledge}${answer}${compoundAgreementHtml(auxiliary, subject, participle, question.conjugaison1 || '')}`
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
    const bare = bareInfinitive(question.infinitif || verb?.infinitif || '')
    const expectedFutureRadical = bare.endsWith('re') ? bare.slice(0, -1) : bare
    if (verb?.groupeConjugaison === 3 && normalized(futureStem(question.infinitif || verb?.infinitif || '').replace(/-$/u, '')) !== normalized(expectedFutureRadical)) {
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
    const bare = bareInfinitive(question.infinitif || verb?.infinitif || '')
    const expectedFutureRadical = bare.endsWith('re') ? bare.slice(0, -1) : bare
    if (verb?.groupeConjugaison === 3 && normalized(futureStem(question.infinitif || verb?.infinitif || '').replace(/-$/u, '')) !== normalized(expectedFutureRadical)) {
      exception = `Le radical ${futureStem(question.infinitif || verb?.infinitif || '')} est irrégulier : le conditionnel reprend le même radical particulier que le futur.`
    }
  } else if (mode === 'subjonctif' && time === 'present') {
    endings = ['-e', '-es', '-e', '-ions', '-iez', '-ent']
    rule = 'Pars généralement de la forme avec « ils » au présent, enlève -ent, puis ajoute la terminaison. N’oublie pas « que ».'
  } else if (mode === 'subjonctif' && time === 'imparfait') {
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
    ? displayedConjugatedForm(referenceSubject, reference.form, infinitive, verb)
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
    return buildCompoundConjugationHtml(question, verb, tense)
  }

  if (normalizedMode === 'imperatif' && normalizedTense === 'present') {
    return imperativePresentHelpHtml(question, reference)
  }

  if (normalizedMode === 'subjonctif' && normalizedTense === 'present') {
    return subjunctivePresentHelpHtml(question, reference, verb)
  }

  if (normalizedMode === 'subjonctif' && normalizedTense === 'imparfait' && reference?.kind === 'past-simple-il') {
    return subjunctiveImperfectHelpHtml(question, reference, verb, tense, approach)
  }

  if (normalizedMode === 'conditionnel' && normalizedTense === 'present') {
    return conditionalPresentHelpHtml(question, verb, reference)
  }

  if (reference && requestedFormIsReference(question, reference) && shouldUseReferenceMethodForRegularForm(question, reference, verb, tense)) {
    return requestedReferenceHelpHtml(question, tense, reference, verb)
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

    if (reference && normalized(reference.radical) === normalized(decomposition.base) && shouldUseReferenceMethodForRegularForm(question, reference, verb, tense)) {
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
        : bare.endsWith('cer') && rawReferenceRadical.toLocaleLowerCase('fr').endsWith('ç') && normalized(decomposition.base).endsWith('c')
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
      const referenceInstruction = `Voici la forme repère${referenceContext ? ` ${escapedHtml(referenceContext)}` : ''}. Apprends-la par cœur, c’est très utile :`
      const knowledgeBlock = `<figure>${knowledgeCaption()}<blockquote><strong>Forme repère</strong><p>${referenceInstruction}</p><p>${highlightedReference}</p></blockquote><blockquote><strong>${escapedHtml(endingsKnowledgeTitle(question, tense))}</strong>${endingsContent}</blockquote></figure>`
      const usefulnessBlock = referenceUsefulnessHtml(question, tense, reference, verb)
      const pronominalIntro = pronominalIntroHtml(question, infinitive, verb)
      const radicalBlock = approach === 'guided-discovery'
        ? `<figure><figcaption>Trouve le radical</figcaption><details><summary>Indice 1 · La forme repère</summary><p>Prends la forme repère :<br>${highlightedReference}</p></details><details><summary>Indice 2 · Le radical</summary><p>${removeInstruction}</p></details></figure>`
        : `<figure><figcaption>Trouve le radical</figcaption><ol><li>Prends la forme repère :<br>${highlightedReference}</li><li>${removeInstruction}</li></ol></figure>`
      const answerDisplay = displayedAnswerForm(question, infinitive, verb)
      const pronominalResult = isPronominalInfinitive(infinitive, verb) && answerDisplay && normalized(answerDisplay) !== normalized(actualForm)
        ? `<p>Ajoute aussi le pronom réfléchi adapté :</p><b>${rememberedFormMarkup(answerDisplay)}<i>✓</i></b>`
        : ''
      const answerBlock = `<figure><figcaption>Réponse</figcaption><blockquote><p>Ajoute ${ending} au radical ${changesBeforeEnding ? radicalBadge(rawReferenceRadical) : base} :</p>${assembly}${pronominalResult}</blockquote></figure>`
      if (approach === 'concise') {
        return `${knowledgeBlock}${pronominalIntro}${radicalBlock}${answerBlock}${usefulnessBlock}`
      }
      if (approach === 'guided-discovery') {
        return `${knowledgeBlock}${pronominalIntro}${radicalBlock}${answerBlock}${usefulnessBlock}${exception}`
      }
      if (approach === 'cif-falc') {
        return `${knowledgeBlock}${pronominalIntro}${radicalBlock}${answerBlock}${usefulnessBlock}${exception}`
      }
      const familyFact = family ? `<p><strong>Famille de conjugaison :</strong> ${escapedHtml(family)}.</p>` : ''
      return `${knowledgeBlock}${pronominalIntro}${radicalBlock}${answerBlock}${usefulnessBlock}${familyFact}${exception}`
    }

    if (approach === 'concise') {
      return `<p>Avec <strong>${escapedHtml(subject)}</strong> ${escapedHtml(context)}, utilise le radical ${base}, puis ajoute ${ending}.</p><p><strong>Résultat</strong><br>${rememberedFormMarkup(actualForm)}</p>`
    }
    if (approach === 'guided-discovery') {
      return `<details><summary>Indice 1 · L’infinitif</summary><p>Pars de l’infinitif <strong>${escapedHtml(infinitive)}</strong> et identifie sa famille.</p></details><details><summary>Indice 2 · Le radical</summary><p>Ici, cette famille utilise le radical ${base}. Il faut le connaître comme radical repère, sans partir de la réponse.</p></details><details><summary>Indice 3 · Assemble</summary><p>Ajoute la terminaison ${ending} demandée avec ${escapedHtml(subject)}.</p><p><strong>Résultat</strong><br>${rememberedFormMarkup(actualForm)}</p></details>${exception}`
    }
    if (approach === 'cif-falc') {
      const answerDisplay = displayedAnswerForm(question, infinitive, verb) || actualForm
      return `<ol><li>Pars de l’infinitif <strong>${escapedHtml(infinitive)}</strong>.</li><li>Pour ce temps, utilise le radical ${base}.</li><li>Ajoute la terminaison ${ending}.</li></ol><p><strong>Résultat</strong><br>${rememberedFormMarkup(answerDisplay)}</p>${exception}`
    }
    const familyFact = family ? `<p><strong>Famille de conjugaison :</strong> ${escapedHtml(family)}.</p>` : ''
    const suppletism = isSuppletive
      ? '<p>Le paradigme présente du <strong>supplétisme</strong> : plusieurs radicaux historiquement distincts coexistent.</p>'
      : ''
    return `<p>Pour <strong>${escapedHtml(infinitive)}</strong> avec <strong>${escapedHtml(subject)}</strong> ${escapedHtml(context)}, le paradigme fournit le <strong>radical contextuel</strong> ${base}; on lui ajoute la <strong>désinence</strong> ${ending}.</p><p><strong>Résultat</strong><br>${rememberedFormMarkup(actualForm)}</p><p>Ce radical est appris avec la famille du verbe, et non extrait de la réponse attendue.${alternation}</p>${familyFact}${suppletism}${exception}`
  }

  if (reference) {
    const referenceKnowledge = highlightedReference
      ? `<figure>${knowledgeCaption()}<blockquote><strong>Forme repère</strong><p>Apprends par cœur cette forme repère :</p><p>${highlightedReference}</p></blockquote></figure>`
      : ''
    const answerDisplay = displayedAnswerForm(question, infinitive, verb)
    const displayedAnswerCore = conjugatedCore(answerDisplay || actualForm)
    const pastSimpleUSeries = reference.kind === 'past-simple-il' && normalized(reference.form).endsWith('ut')
    const pastSimpleURadical = pastSimpleUSeries ? reference.form.slice(0, -1) : ''
    const normalizedAnswer = normalized(displayedAnswerCore)
    const normalizedURadical = normalized(pastSimpleURadical)
    const uSeriesRadicalInAnswer = pastSimpleUSeries && normalizedAnswer.startsWith(normalizedURadical)
      ? displayedAnswerCore.slice(0, pastSimpleURadical.length)
      : pastSimpleURadical
    const uSeriesEndingInAnswer = pastSimpleUSeries && normalizedAnswer.startsWith(normalizedURadical)
      ? displayedAnswerCore.slice(pastSimpleURadical.length)
      : ''
    const transformation = reference.kind === 'memorized-form'
      ? 'Mémorise cette forme repère.'
      : pastSimpleUSeries
      ? `À partir de cette forme repère, retiens le radical du passé simple ${radicalBadge(pastSimpleURadical)}.${normalized(uSeriesRadicalInAnswer) !== normalized(pastSimpleURadical) ? ` Dans la réponse, il s’écrit ${radicalBadge(uSeriesRadicalInAnswer)}.` : ''}`
      : reference.removableEnding
      ? `Retire ${removedEndingBadge(reference.removableEnding)} pour obtenir le radical ${radicalBadge(reference.radical)}.`
      : `Le radical repère est ${radicalBadge(reference.radical)}.`
    const assemble = reference.targetEnding !== undefined
      ? pastSimpleUSeries && uSeriesEndingInAnswer
        ? `Ajoute ${endingBadge(uSeriesEndingInAnswer)} pour former <strong>${escapedHtml(displayedAnswerCore)}</strong>.`
        : reference.targetEnding
        ? `Ajoute <code>-${escapedHtml(reference.targetEnding)}</code> pour former <strong>${escapedHtml(displayedAnswerCore || actualForm)}</strong>.`
        : `Avec <strong>${escapedHtml(subject)}</strong>, garde cette forme : elle s’écrit <strong>${escapedHtml(displayedAnswerCore || actualForm)}</strong>.`
      : `Utilise cette forme avec ${escapedHtml(subject)} pour obtenir <strong>${escapedHtml(displayedAnswerCore || actualForm)}</strong>.`
    if (approach === 'concise') return `${referenceKnowledge}<p>${transformation} ${assemble}</p>`
    if (approach === 'guided-discovery') return `${referenceKnowledge}<details><summary>Indice 1 · La forme repère</summary><p>Pars de ${highlightedReference}.</p></details><details><summary>Indice 2 · Le radical</summary><p>${transformation}</p></details><details><summary>Indice 3 · La forme demandée</summary><p>${assemble}</p></details>`
    if (approach === 'cif-falc') return `${referenceKnowledge}<figure><figcaption>Construis la réponse</figcaption><ol><li>Pars de la forme repère :<br>${highlightedReference}</li><li>${transformation}</li><li>${assemble}</li></ol></figure>`
    return `<p>La forme repère est ${highlightedReference}. ${transformation}</p><p>Cette forme repère a été vérifiée contre le paradigme enregistré avant d’être proposée.</p>`
  }

  const strongIrregularity = isSuppletive
    ? 'Ce verbe est très irrégulier : son paradigme est supplétif et ne repose pas sur un radical unique.'
    : `Le radical varie avec la famille du verbe et parfois avec la personne ${escapedHtml(context)}.`
  if (approach === 'concise') {
    return `<p><strong>${escapedHtml(infinitive)}</strong> est très irrégulier ici : apprends cette forme avec son temps et sa personne.</p><p>${rememberedFormMarkup(actualForm)}</p>`
  }
  if (approach === 'guided-discovery') {
    return `<details><summary>Indice 1 · L’infinitif</summary><p>Pars de <strong>${escapedHtml(infinitive)}</strong> et identifie sa famille.</p></details><details><summary>Indice 2 · Les formes repères</summary><p>Ce verbe emploie plusieurs radicaux${family ? ` dans la famille « ${escapedHtml(family)} »` : ''}. Il n’existe pas de retrait mécanique fiable.</p></details><details><summary>Indice 3 · Conclusion</summary><p>Apprends cette forme, puis réutilise-la comme modèle :</p><p>${rememberedFormMarkup(actualForm)}</p></details>`
  }
  if (approach === 'cif-falc') {
    return `<ol><li>Pars de l’infinitif <strong>${escapedHtml(infinitive)}</strong>.</li><li>Ce verbe change beaucoup : il n’a pas toujours le même radical.</li><li>Apprends cette forme comme un modèle :<br>${rememberedFormMarkup(actualForm)}</li></ol>`
  }
  const lexicalFact = isSuppletive ? '' : `<p>Le radical lexical indicatif est ${radicalBadge(lexical)}, mais il ne suffit pas à prédire sûrement cette forme.</p>`
  const familyFact = family ? `<p><strong>Famille de conjugaison :</strong> ${escapedHtml(family)}.</p>` : ''
  return `<p>${strongIrregularity}</p><p>Aucune règle de retrait fondée sur la réponse attendue n’est proposée : elle serait circulaire. Il faut rattacher cette forme à son paradigme ou à sa famille.</p><p>La forme à retenir est ${rememberedFormMarkup(actualForm)}.</p>${lexicalFact}${familyFact}`
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
    ? displayedConjugatedForm(referenceSubject, reference.form, infinitive, verb)
    : ''
  const referenceReminder = referenceDisplay
    ? `<p><strong>${reference?.kind === 'memorized-stem' ? 'Radical repère' : 'Forme repère'} :</strong> ${reference?.kind === 'memorized-stem' ? `<mark>${escapedHtml(referenceDisplay)}</mark>` : rememberedFormMarkup(referenceDisplay)}.</p>`
    : ''

    if (reference && requestedFormIsReference(question, reference) && shouldUseReferenceMethodForRegularForm(question, reference, verb, tense)) {
      return requestedReferenceHelpHtml(question, tense, reference, verb)
    }

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
