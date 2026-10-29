// Ces verbes changent d’auxiliaire selon leur construction ou leur sens.
// La liste est lexicale : l’absence de COD ne suffit pas à autoriser être.
const VARIABLE_AUXILIARY_VERBS = new Set([
  'descendre', 'entrer', 'monter', 'passer', 'rentrer', 'retourner', 'sortir',
  'redescendre', 'remonter', 'repasser', 'ressortir', 'demeurer',
])

export function hasVariableAuxiliary(infinitive: string) {
  return VARIABLE_AUXILIARY_VERBS.has(infinitive.trim().normalize('NFC').toLocaleLowerCase('fr'))
}

export const VARIABLE_AUXILIARY_EXPLANATION = 'Sans phrase de contexte, les auxiliaires avoir et être sont acceptés ici selon le sens du verbe. Avec être, accorde le participe passé avec le sujet. Avec avoir, sans COD placé avant, le participe passé reste invariable.'

/** Modèle usuel des verbes de déplacement ; demeurer dépend davantage du sens. */
export function prefersEtreWithoutComplement(infinitive: string) {
  return hasVariableAuxiliary(infinitive) && infinitive.trim().toLocaleLowerCase('fr') !== 'demeurer'
}

export function hasMultipleAuxiliaryModels(question: { auxiliaryChoices?: readonly string[], preferredAuxiliary?: string }) {
  return !question.preferredAuxiliary && (question.auxiliaryChoices?.length || 0) > 1
}
