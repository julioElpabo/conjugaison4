import type { AnalyticsUsageDiagnostic, AnalyticsUsageRow } from '../types/analytics'

export function analyticsUsageDiagnostic(
  row: Omit<AnalyticsUsageRow, 'diagnostic' | 'diagnosticReason'>,
): { diagnostic: AnalyticsUsageDiagnostic, diagnosticReason: string } {
  if (row.exposures < 100) {
    return {
      diagnostic: 'insufficient',
      diagnosticReason: `Seulement ${row.exposures} exposition${row.exposures > 1 ? 's' : ''} mesurée${row.exposures > 1 ? 's' : ''}. Attendre davantage de données.`,
    }
  }
  const adoption = row.adoptionRate ?? 0
  const completion = row.completionRate ?? 0
  const repeat = row.repeatRate ?? 0
  if (row.exposures >= 300 && adoption < 1 && row.completions < 5 && repeat < 5) {
    return {
      diagnostic: 'remove-candidate',
      diagnosticReason: `Proposée ${row.exposures} fois, choisie dans ${adoption} % des cas et presque jamais réutilisée.`,
    }
  }
  if (adoption < 5 && (completion >= 70 || repeat >= 20)) {
    return {
      diagnostic: 'promote',
      diagnosticReason: `Peu choisie (${adoption} %), mais convaincante après sélection (${completion} % terminés).`,
    }
  }
  if (adoption >= 5 && row.starts >= 10 && completion < 40) {
    return {
      diagnostic: 'improve',
      diagnosticReason: `La fonction attire, mais seulement ${completion} % des usages commencés sont terminés.`,
    }
  }
  if (adoption < 5 && (row.completions >= 5 || repeat >= 15)) {
    return {
      diagnostic: 'niche',
      diagnosticReason: `Faible volume global, mais ${row.completions} utilisations terminées et ${repeat} % de réutilisation.`,
    }
  }
  return {
    diagnostic: 'keep',
    diagnosticReason: `${adoption} % d’adoption et ${completion} % de complétion sur la période.`,
  }
}
