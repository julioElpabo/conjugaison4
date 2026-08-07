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
  ['indicatif:passé composé', 11],
  ['indicatif:imparfait', 20],
  ['indicatif:plus-que-parfait', 21],
  ['indicatif:passé simple', 30],
  ['indicatif:passé antérieur', 31],
  ['indicatif:futur proche', 40],
  ['indicatif:futur', 50],
  ['indicatif:futur antérieur', 51],
  ['subjonctif:présent', 10],
  ['subjonctif:passé', 11],
  ['subjonctif:imparfait', 20],
  ['subjonctif:plus-que-parfait', 21],
  ['conditionnel:présent', 10],
  ['conditionnel:passé 1', 11],
  ['conditionnel:passé 2', 20],
  ['impératif:présent', 10],
  ['impératif:passé', 11],
  ['infinitif:présent', 10],
  ['infinitif:passé', 11],
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

export function conjugationTenseRow(mode: string, tense: string) {
  const order = conjugationTenseOrder(mode, tense)
  return order === 999 ? 999 : Math.floor(order / 10)
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
