const compact = value => String(value || '').replace(/[‘ʼ‛`´']/gu, '’').replace(/\s+/gu, ' ').trim()

const familiarOrArgotic = /\b(?:bougre|caboche|cabot|cambrousse|costaud|crétin|débine|fichu|foutre|gamin|gars|gonzesse|môme|piger|roupiller|sacré|salaud|sapristi|type)\b/iu
const literaryOrArchaic = /\b(?:certes|derechef|guère|jadis|maintes?|moult|naguère|nonobstant|quiconque|toutefois)\b/iu
const droppedNegation = /\b(?:j’|tu |il |elle |on |nous |vous |ils |elles )(?:ai|as|a|avons|avez|ont|sais|sait|sommes|êtes|sont|vais|vas|va|allons|allez|vont) pas\b/iu
const literaryVerbForm = /\b(?:eusse|eusses|eût|eussions|eussiez|eussent|fusse|fusses|fût|fussions|fussiez|fussent)\b/iu

export function literaryCommonLanguage(value) {
  const text = compact(value)
  const reasons = []
  if (familiarOrArgotic.test(text)) reasons.push('registre familier ou argotique')
  if (literaryOrArchaic.test(text)) reasons.push('vocabulaire soutenu ou vieilli')
  if (droppedNegation.test(text) || /\b(?:y a|j’sais|j’vas|t’es|t’as)\b/iu.test(text)) reasons.push('syntaxe orale relâchée')
  if (literaryVerbForm.test(text)) reasons.push('forme verbale propre au registre littéraire')
  if (/--|\.\.\.|…/u.test(text)) reasons.push('phrase elliptique')
  if ((text.match(/;/gu) || []).length > 1 || (text.match(/,/gu) || []).length > 5) reasons.push('syntaxe trop complexe')
  if (!/^[A-ZÀ-ÖØ-ÞŒÆ«“]/u.test(text)) reasons.push('phrase non autonome')
  return { suitable: reasons.length === 0, reasons }
}
