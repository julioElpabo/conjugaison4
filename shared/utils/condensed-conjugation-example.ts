interface ExampleVerb { infinitif: string, groupeConjugaison?: 1 | 2 | 3 | null }

const normalize = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr').trim()
const pronouns = ['je', 'tu', 'il', 'nous', 'vous', 'ils']
const models = {
  chanter: { present: ['chante', 'chantes', 'chante', 'chantons', 'chantez', 'chantent'], future: 'chanter', imperfect: 'chant', group: 1 },
  parler: { present: ['parle', 'parles', 'parle', 'parlons', 'parlez', 'parlent'], future: 'parler', imperfect: 'parl', group: 1 },
  jeter: { present: ['jette', 'jettes', 'jette', 'jetons', 'jetez', 'jettent'], future: 'jetter', imperfect: 'jet', group: 1 },
  appeler: { present: ['appelle', 'appelles', 'appelle', 'appelons', 'appelez', 'appellent'], future: 'appeller', imperfect: 'appel', group: 1 },
  grandir: { present: ['grandis', 'grandis', 'grandit', 'grandissons', 'grandissez', 'grandissent'], future: 'grandir', imperfect: 'grandiss', group: 2 },
  finir: { present: ['finis', 'finis', 'finit', 'finissons', 'finissez', 'finissent'], future: 'finir', imperfect: 'finiss', group: 2 },
  prendre: { present: ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent'], future: 'prendr', imperfect: 'pren', group: 3 },
  apprendre: { present: ['apprends', 'apprends', 'apprend', 'apprenons', 'apprenez', 'apprennent'], future: 'apprendr', imperfect: 'appren', group: 3 },
  tenir: { present: ['tiens', 'tiens', 'tient', 'tenons', 'tenez', 'tiennent'], future: 'tiendr', imperfect: 'ten', group: 3 },
  venir: { present: ['viens', 'viens', 'vient', 'venons', 'venez', 'viennent'], future: 'viendr', imperfect: 'ven', group: 3 },
} as const

/** Un autre verbe sert de modèle : la réponse demandée n’est jamais donnée. */
export function condensedConjugationExample(mode: string, tense: string, verb: ExampleVerb, requestedSubject?: string) {
  const infinitive = normalize(verb.infinitif)
  let model: keyof typeof models = verb.groupeConjugaison === 2 ? (infinitive === 'grandir' ? 'finir' : 'grandir')
    : verb.groupeConjugaison === 3 ? (infinitive === 'prendre' ? 'apprendre' : 'prendre')
      : infinitive === 'chanter' ? 'parler' : 'chanter'
  if (['appeler', 'rappeler'].includes(infinitive)) model = 'jeter'
  if (['jeter', 'rejeter'].includes(infinitive)) model = 'appeler'
  if (infinitive.endsWith('venir')) model = 'tenir'
  if (infinitive.endsWith('tenir')) model = 'venir'
  const subject = requestedSubject?.trim() || 'nous'
  const subjectKey = ({ elle: 'il', iel: 'il', on: 'il', elles: 'ils', iels: 'ils' } as Record<string, string>)[subject] || subject
  const index = pronouns.indexOf(subjectKey)
  if (index < 0) return null
  const source = models[model]
  const key = `${normalize(mode)}:${normalize(tense)}`
  let form = ''
  let example = ''
  if (key === 'indicatif:present') {
    form = source.present[index]!
    example = `${subject === 'je' && /^[aeiou]/u.test(form) ? "j’" : `${subject} `}${form}`
  } else if (key === 'indicatif:futur' || key === 'conditionnel:present') {
    const ending = (key === 'indicatif:futur' ? ['ai', 'as', 'a', 'ons', 'ez', 'ont'] : ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'])[index]!
    example = `${source.future}- + -${ending} = ${subject} ${source.future}${ending}`
    if (subject === 'je' && /^[aeiou]/u.test(source.future)) example = example.replace('= je ', '= j’')
  } else if (key === 'indicatif:imparfait') {
    const ending = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'][index]!
    const prefix = subject === 'je' && /^[aeiou]/u.test(source.imperfect) ? 'j’' : `${subject} `
    example = `nous ${source.present[3]} → ${source.imperfect}- + -${ending} = ${prefix}${source.imperfect}${ending}`
  } else return null
  return { infinitive: model, example, group: source.group }
}
