import { formatAnswer } from './question-formatter'

export interface TenseForExample {
  id: number
  mode: string
  name: string
}

export interface MangerFormForExample {
  temp_id: number
  pronom: string
  conjugaison1: string
  mode_name: string
}

const COMPLEMENTS = [
  'une pomme',
  'un sandwich',
  'des pâtes',
  'son goûter',
  'une soupe',
  'trois fraises',
  'le dessert',
  'une part de gâteau',
] as const

const NON_FINITE_FORMS: Record<string, string> = {
  'participe:présent': 'Mangeant',
  'participe:passé': 'Ayant mangé',
  'gérondif:présent': 'En mangeant',
  'gérondif:passé': 'En ayant mangé',
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase('fr').normalize('NFC')
}

function pickComplement(random: () => number) {
  const index = Math.min(COMPLEMENTS.length - 1, Math.floor(random() * COMPLEMENTS.length))
  return COMPLEMENTS[index]!
}

function withComplementAfter(answer: string, complement: string) {
  const trimmed = answer.trim()
  const punctuation = trimmed.match(/[!?]$/u)?.[0]
  const stem = punctuation ? trimmed.slice(0, -1).trimEnd() : trimmed
  const sentence = `${stem} ${complement}${punctuation ? ` ${punctuation}` : '.'}`
  return sentence.charAt(0).toLocaleUpperCase('fr') + sentence.slice(1)
}

export function buildTenseExamples(
  tenses: readonly TenseForExample[],
  forms: readonly MangerFormForExample[],
  random: () => number = Math.random,
) {
  const formsByTense = new Map<number, MangerFormForExample[]>()
  for (const form of forms) {
    if (!form.conjugaison1.trim()) continue
    const candidates = formsByTense.get(Number(form.temp_id)) ?? []
    candidates.push(form)
    formsByTense.set(Number(form.temp_id), candidates)
  }

  return new Map(tenses.map((tense) => {
    const candidates = formsByTense.get(Number(tense.id)) ?? []
    if (candidates.length) {
      const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length))
      const chosen = candidates[index]!
      const answer = formatAnswer(chosen.pronom, chosen.conjugaison1, chosen.mode_name, 'manger')
      return [Number(tense.id), withComplementAfter(answer, pickComplement(random))]
    }

    const key = `${normalized(tense.mode)}:${normalized(tense.name)}`
    const form = NON_FINITE_FORMS[key] ?? 'Manger'
    return [Number(tense.id), withComplementAfter(form, pickComplement(random))]
  }))
}
