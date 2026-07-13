const MODE_ORDER = new Map([
  ['indicatif', 10],
  ['subjonctif', 20],
  ['conditionnel', 30],
  ['impératif', 40],
  ['participe', 50],
  ['infinitif', 60],
  ['gérondif', 70],
])

const TENSE_ORDER = new Map([
  ['indicatif:présent', 10],
  ['indicatif:passé composé', 20],
  ['indicatif:imparfait', 30],
  ['indicatif:plus-que-parfait', 40],
  ['indicatif:passé simple', 50],
  ['indicatif:passé antérieur', 60],
  ['indicatif:futur', 70],
  ['indicatif:futur antérieur', 80],
  ['subjonctif:présent', 10],
  ['subjonctif:passé', 20],
  ['subjonctif:imparfait', 30],
  ['subjonctif:plus-que-parfait', 40],
  ['conditionnel:présent', 10],
  ['conditionnel:passé 1', 20],
  ['conditionnel:passé 2', 30],
  ['impératif:présent', 10],
  ['impératif:passé', 20],
])

function key(value: string) {
  return value.trim().toLocaleLowerCase('fr-CH')
}

export function conjugationModeOrder(mode: string) {
  return MODE_ORDER.get(key(mode)) ?? 999
}

export function conjugationTenseOrder(mode: string, tense: string) {
  return TENSE_ORDER.get(`${key(mode)}:${key(tense)}`) ?? 999
}

export function conjugationTenseLabel(mode: string, tense: string) {
  const normalizedMode = key(mode)
  const normalizedTense = key(tense)
  if (normalizedMode === 'indicatif' && normalizedTense === 'futur') return 'futur simple'
  if (normalizedMode === 'conditionnel' && normalizedTense === 'passé 1') return 'passé première forme'
  if (normalizedMode === 'conditionnel' && normalizedTense === 'passé 2') return 'passé deuxième forme'
  return tense
}

export function isFiniteConjugationMode(mode: string) {
  return ['indicatif', 'subjonctif', 'conditionnel', 'impératif'].includes(key(mode))
}
