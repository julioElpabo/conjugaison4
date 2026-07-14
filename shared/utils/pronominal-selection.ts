/** Les identifiants négatifs représentent des emplois générés, jamais des lignes de `verbes`. */
export function encodePronominalSelectionId(useId: number) {
  return -Math.abs(useId)
}

export function decodePronominalSelectionId(selectionId: number) {
  return selectionId < 0 ? Math.abs(selectionId) : null
}

export function isPronominalSelectionId(selectionId: number) {
  return Number.isInteger(selectionId) && selectionId < 0
}
