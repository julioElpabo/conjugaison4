import type { ConjugationMode, ConjugationTense, Verb } from '../types/conjugation'
import type { ConsultedConjugation } from '../types/verb-consultation'

export type ConjugationTrapTone = 'orthography' | 'stem' | 'ending' | 'special'

export interface ConjugationTrapMarker {
  tenseId: number
  personId: number
  form: string
  start: number
  length: number
  trapId: string
  priority: number
}

export interface ConjugationTrap {
  id: string
  title: string
  explanation: string
  tone: ConjugationTrapTone
  examples: string[]
}

export interface ConjugationTrapAnalysis {
  traps: ConjugationTrap[]
  markers: ConjugationTrapMarker[]
}

const TRAPS: Record<string, Omit<ConjugationTrap, 'examples'>> = {
  cedilla: {
    id: 'cedilla', tone: 'orthography', title: 'Cédille à ne pas oublier',
    explanation: 'Le ç conserve le son [s] devant a, o ou u, ou appartient au radical de certaines formes.',
  },
  softG: {
    id: 'softG', tone: 'orthography', title: 'E protecteur après le g',
    explanation: 'Le e placé après g conserve le son [ʒ] devant a ou o : mangeais, mangeons.',
  },
  yToI: {
    id: 'yToI', tone: 'orthography', title: 'Y remplacé par i',
    explanation: 'Dans certaines formes des verbes en -yer, le y du radical devient i.',
  },
  graveAccent: {
    id: 'graveAccent', tone: 'orthography', title: 'Accent grave dans le radical',
    explanation: 'Un e ou un é du radical devient è dans certaines formes.',
  },
  doubleConsonant: {
    id: 'doubleConsonant', tone: 'orthography', title: 'Consonne doublée',
    explanation: 'Certains verbes en -eler ou -eter doublent le l ou le t dans une partie de leur conjugaison.',
  },
  doubleI: {
    id: 'doubleI', tone: 'orthography', title: 'Deux i consécutifs',
    explanation: 'Le premier i appartient au radical et le second à la terminaison : les deux doivent être écrits.',
  },
  circumflex: {
    id: 'circumflex', tone: 'orthography', title: 'Accent circonflexe aux temps littéraires',
    explanation: 'Le passé simple et le subjonctif imparfait comportent parfois un accent circonflexe facile à oublier.',
  },
  futureStem: {
    id: 'futureStem', tone: 'stem', title: 'Radical du futur à mémoriser',
    explanation: 'Le futur simple et le conditionnel utilisent ici un radical différent de l’infinitif attendu.',
  },
  futureConditional: {
    id: 'futureConditional', tone: 'ending', title: 'Futur ou conditionnel ?',
    explanation: 'Avec je, le futur se termine par -ai et le conditionnel par -ais.',
  },
  silentEnt: {
    id: 'silentEnt', tone: 'ending', title: 'Terminaison -ent muette',
    explanation: 'À la troisième personne du pluriel, -ent s’écrit mais ne se prononce généralement pas.',
  },
  imperativeWithoutS: {
    id: 'imperativeWithoutS', tone: 'ending', title: 'Pas de s à l’impératif',
    explanation: 'À l’impératif présent, les verbes en -er perdent normalement le s de la forme tu.',
  },
  variants: {
    id: 'variants', tone: 'special', title: 'Plusieurs formes admises',
    explanation: 'La base contient plusieurs variantes correctes pour cette personne et ce temps.',
  },
  defective: {
    id: 'defective', tone: 'special', title: 'Conjugaison incomplète',
    explanation: 'Ce verbe est impersonnel ou défectif : certaines personnes ou certains temps ne s’emploient pas.',
  },
}

function normalized(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr')
}

function bareInfinitive(value: string) {
  return value.replace(/^(?:s['’]|se\s+)/iu, '')
}

function lexicalWord(form: string) {
  const match = form.match(/([^\s’']+)$/u)
  const word = match?.[1] ?? form
  return { word, offset: form.lastIndexOf(word) }
}

function cleanComplement(value: string | null | undefined) {
  return value?.replace(/\s+/gu, ' ').replace(/[.!?]+$/gu, '').trim() ?? ''
}

function sentenceCase(value: string) {
  return value.charAt(0).toLocaleUpperCase('fr') + value.slice(1)
}

function conjugatedPhrase(row: ConsultedConjugation, form: string) {
  const pronoun = row.pronoun.trim()
  if (pronoun.toLocaleLowerCase('fr') === 'je' && /^[aeiouyh]/iu.test(form)) return `j’${form}`
  return `${pronoun} ${form}`.trim()
}

function simpleTenseInfo(
  tenseId: number,
  tenses: ReadonlyMap<number, ConjugationTense>,
  modes: ReadonlyMap<number, ConjugationMode>,
) {
  const tense = tenses.get(tenseId)
  const mode = tense ? modes.get(tense.modeId) : undefined
  return {
    tense,
    mode,
    tenseName: tense ? normalized(tense.name) : '',
    modeName: mode ? normalized(mode.name) : '',
    simple: Boolean(tense && !tense.isCompound),
  }
}

function futureEnding(personId: number, conditional: boolean) {
  const endings = conditional
    ? new Map([[4, 'ais'], [5, 'ais'], [6, 'ait'], [7, 'ions'], [8, 'iez'], [9, 'aient']])
    : new Map([[4, 'ai'], [5, 'as'], [6, 'a'], [7, 'ons'], [8, 'ez'], [9, 'ont']])
  return endings.get(personId) ?? ''
}

export function conjugationTrapFormKey(tenseId: number, personId: number, form: string) {
  return `${tenseId}:${personId}:${form}`
}

export function analyzeConjugationTraps(
  verb: Pick<Verb, 'infinitif' | 'groupeConjugaison' | 'estImpersonnel' | 'estDefectif'>,
  conjugations: readonly ConsultedConjugation[],
  tensesList: readonly ConjugationTense[],
  modesList: readonly ConjugationMode[],
  exampleComplement?: string | null,
): ConjugationTrapAnalysis {
  const tenses = new Map(tensesList.map(tense => [Number(tense.id), tense]))
  const modes = new Map(modesList.map(mode => [Number(mode.id), mode]))
  const markers: ConjugationTrapMarker[] = []
  const examples = new Map<string, string[]>()
  const infinitive = bareInfinitive(verb.infinitif)
  const infinitiveStem = /er$/iu.test(infinitive) ? infinitive.slice(0, -2) : infinitive
  const complement = cleanComplement(exampleComplement)

  function exampleSentence(row: ConsultedConjugation, form: string) {
    const info = simpleTenseInfo(row.tenseId, tenses, modes)
    const object = complement ? ` ${complement}` : ''
    if (info.modeName === 'imperatif') return `${sentenceCase(form)}${object} !`
    const phrase = conjugatedPhrase(row, form)
    if (info.modeName === 'subjonctif') return `Il faut que ${phrase}${object}.`
    if (info.modeName === 'indicatif' && info.tenseName === 'futur') {
      return `Demain, ${phrase}${object}.`
    }
    if (info.modeName === 'conditionnel' && info.tenseName === 'present') {
      return `Si c’était possible, ${phrase}${object}.`
    }
    return `${sentenceCase(phrase)}${object}.`
  }

  function addExample(trapId: string, sentence: string) {
    const current = examples.get(trapId) ?? []
    if (current.includes(sentence)) return
    if (trapId !== 'futureConditional' && current.length) return
    examples.set(trapId, [...current, sentence])
  }

  function addMarker(row: ConsultedConjugation, form: string, trapId: string, start: number, length: number, priority: number) {
    if (start < 0 || length < 1 || start + length > form.length) return
    if (markers.some(marker => marker.tenseId === row.tenseId && marker.personId === row.personId
      && marker.form === form && marker.trapId === trapId && marker.start === start && marker.length === length)) return
    markers.push({ tenseId: row.tenseId, personId: row.personId, form, trapId, start, length, priority })
    addExample(trapId, exampleSentence(row, form))
  }

  function addTrapWithoutMarker(trapId: string, example: string) {
    addExample(trapId, example)
  }

  for (const row of conjugations) {
    const info = simpleTenseInfo(row.tenseId, tenses, modes)
    for (const form of row.forms) {
      const lexical = lexicalWord(form)
      if (info.simple) {
        for (const match of lexical.word.matchAll(/ç/giu)) {
          addMarker(row, form, 'cedilla', lexical.offset + (match.index ?? 0), 1, 40)
        }
        for (const match of lexical.word.matchAll(/ge(?=[aoâ])/giu)) {
          addMarker(row, form, 'softG', lexical.offset + (match.index ?? 0) + 1, 1, 40)
        }

        if (/yer$/iu.test(infinitive)) {
          const prefix = infinitive.slice(0, -3)
          if (normalized(lexical.word.slice(0, prefix.length)) === normalized(prefix)
              && lexical.word[prefix.length]?.toLocaleLowerCase('fr') === 'i') {
            addMarker(row, form, 'yToI', lexical.offset + prefix.length, 1, 40)
          }
        }

        for (const match of lexical.word.matchAll(/è/giu)) {
          const index = match.index ?? 0
          if (index < infinitiveStem.length
              && normalized(lexical.word[index] ?? '') === normalized(infinitiveStem[index] ?? '')) {
            addMarker(row, form, 'graveAccent', lexical.offset + index, 1, 40)
          }
        }

        if (/(?:eler|eter)$/iu.test(infinitive)) {
          for (const match of lexical.word.matchAll(/ll|tt/giu)) {
            addMarker(row, form, 'doubleConsonant', lexical.offset + (match.index ?? 0), 2, 40)
          }
        }
        for (const match of lexical.word.matchAll(/ii(?=ons|ez)/giu)) {
          addMarker(row, form, 'doubleI', lexical.offset + (match.index ?? 0), 2, 40)
        }
        if (info.tenseName === 'passe simple'
            || (info.modeName === 'subjonctif' && info.tenseName === 'imparfait')) {
          for (const match of lexical.word.matchAll(/[âîû]/giu)) {
            addMarker(row, form, 'circumflex', lexical.offset + (match.index ?? 0), 1, 40)
          }
        }

        const conditional = info.modeName === 'conditionnel' && info.tenseName === 'present'
        const future = info.modeName === 'indicatif' && info.tenseName === 'futur'
        if (future || conditional) {
          const ending = futureEnding(row.personId, conditional)
          if (ending && normalized(lexical.word).endsWith(ending)) {
            const stem = lexical.word.slice(0, -ending.length)
            const expectedStem = /re$/iu.test(infinitive) ? infinitive.slice(0, -1) : infinitive
            if (normalized(stem) !== normalized(expectedStem)) {
              addMarker(row, form, 'futureStem', lexical.offset, stem.length, 25)
            }
            if (row.personId === 4) {
              addMarker(row, form, 'futureConditional', lexical.offset + lexical.word.length - ending.length, ending.length, 35)
            }
          }
        }

        if (row.personId === 9 && /ent$/iu.test(lexical.word)) {
          addMarker(row, form, 'silentEnt', lexical.offset + lexical.word.length - 3, 3, 30)
        }
        if (info.modeName === 'imperatif' && info.tenseName === 'present'
            && row.personId === 5 && verb.groupeConjugaison === 1 && !/[sx]$/iu.test(lexical.word)) {
          addMarker(row, form, 'imperativeWithoutS', lexical.offset + lexical.word.length - 1, 1, 30)
        }
      }

      if (row.forms.length > 1) addMarker(row, form, 'variants', 0, form.length, 5)
    }
  }

  if (verb.estImpersonnel || verb.estDefectif) {
    const firstRow = conjugations[0]
    const firstForm = firstRow?.forms[0]
    addTrapWithoutMarker('defective', firstRow && firstForm
      ? exampleSentence(firstRow, firstForm)
      : `${sentenceCase(verb.infinitif)}.`)
  }

  return {
    markers,
    traps: Object.values(TRAPS)
      .filter(trap => examples.has(trap.id))
      .map(trap => ({ ...trap, examples: examples.get(trap.id)! })),
  }
}
