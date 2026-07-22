export interface PreviewModeCandidate {
  id: number
  name: string
}

export interface PreviewTenseCandidate {
  id: number
  modeId: number
  name: string
}

export interface PreviewConjugationCandidate {
  tenseId: number
  personId: number
  pronom: string
  conjugaison1: string
}

export interface RandomConjugationPreview {
  modeName: string
  tenseName: string
  pronoun: string
}

function randomIndex(length: number, random: () => number) {
  return Math.min(length - 1, Math.max(0, Math.floor(random() * length)))
}

function shuffled<T>(values: readonly T[], random: () => number) {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = randomIndex(index + 1, random)
    ;[result[index], result[other]] = [result[other]!, result[index]!]
  }
  return result
}

/** Tire des formes existantes en n'utilisant jamais deux fois le même mode. */
export function randomConjugationPreviews(
  modes: readonly PreviewModeCandidate[],
  tenses: readonly PreviewTenseCandidate[],
  conjugations: readonly PreviewConjugationCandidate[],
  count = 4,
  random: () => number = Math.random,
): RandomConjugationPreview[] {
  const availableFormsByTense = new Map<number, PreviewConjugationCandidate[]>()
  for (const form of conjugations) {
    if (!form.conjugaison1.trim()) continue
    const forms = availableFormsByTense.get(form.tenseId) || []
    forms.push(form)
    availableFormsByTense.set(form.tenseId, forms)
  }

  const availableModes = modes.map(mode => ({
    mode,
    tenses: tenses.filter(tense => tense.modeId === mode.id && availableFormsByTense.has(tense.id)),
  })).filter(candidate => candidate.tenses.length > 0)

  return shuffled(availableModes, random).slice(0, count).map(({ mode, tenses: modeTenses }) => {
    const tense = modeTenses[randomIndex(modeTenses.length, random)]!
    const forms = availableFormsByTense.get(tense.id)!
    const form = forms[randomIndex(forms.length, random)]!
    return {
      modeName: mode.name,
      tenseName: tense.name,
      pronoun: form.pronom,
    }
  })
}
