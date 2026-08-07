export type AgreementGender = 'masculin' | 'feminin'
export type AgreementNumber = 'singulier' | 'pluriel'

export function agreePastParticiple(
  participle: string,
  gender?: string | null,
  number?: string | null,
) {
  let result = participle
  if (gender === 'feminin') {
    const exceptions: Record<string, string> = {
      absous: 'absoute', dissous: 'dissoute', dû: 'due', mû: 'mue', crû: 'crue',
    }
    result = exceptions[result] ?? (result.endsWith('e') ? result : `${result}e`)
  }
  if (number === 'pluriel' && !/[sx]$/u.test(result)) result += 's'
  return result
}

export function splitPastParticipleAgreement(participle: string, agreedParticiple: string) {
  let commonLength = 0
  const maximum = Math.min(participle.length, agreedParticiple.length)
  while (commonLength < maximum && participle[commonLength] === agreedParticiple[commonLength]) {
    commonLength += 1
  }
  return {
    unchanged: agreedParticiple.slice(0, commonLength),
    agreement: agreedParticiple.slice(commonLength),
  }
}
