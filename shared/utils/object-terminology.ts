/** Ajoute les appellations CVD/CVI utilisées dans les programmes scolaires suisses. */
export function withSwissObjectAliases(value: string) {
  return value
    .replace(/\bCOD\b(?!\s*\(CVD\))/gu, 'COD (CVD)')
    .replace(/\bCOI\b(?!\s*\(CVI\))/gu, 'COI (CVI)')
}
