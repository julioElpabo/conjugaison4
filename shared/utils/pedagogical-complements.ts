/** Un complément nominal ne convient pas à toutes les formes du même verbe. */
export function allowsPedagogicalComplement(question: { infinitif: string, mode_name: string }, complement: { fonction_objet: 'cod' | 'coi' }) {
  const infinitive = question.infinitif.trim().toLocaleLowerCase('fr')
  const imperative = question.mode_name.trim().toLocaleLowerCase('fr') === 'impératif'
  // « Veuillez leur réponse » résulte d’un complément valable à l’indicatif
  // appliqué à une formule de demande, qui appelle une autre construction.
  if (infinitive === 'vouloir' && imperative) return false
  // Préserver le sens usuel de déplacement dans les exercices de base.
  if (infinitive === 'tomber' && complement.fonction_objet === 'cod') return false
  return true
}
