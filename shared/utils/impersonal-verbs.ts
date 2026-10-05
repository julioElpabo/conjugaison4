// Emplois impersonnels : le sujet « il » ne désigne aucune personne.
// Les verbes ayant aussi des emplois personnels (geler, tonner…) sont exclus.
const IMPERSONAL_INFINITIVES = new Set([
  'falloir', 'pleuvoir', 'neiger', 'bruiner', 'venter', "s'agir",
])

export function isImpersonalVerb(infinitive: string, impersonal?: boolean | number) {
  const normalized = infinitive.trim().normalize('NFC').toLocaleLowerCase('fr').replace(/’/gu, "'")
  return Boolean(impersonal) || IMPERSONAL_INFINITIVES.has(normalized)
}
