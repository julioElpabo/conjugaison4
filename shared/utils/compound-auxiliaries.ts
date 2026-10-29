function normalized(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLocaleLowerCase('fr')
}

interface AuxiliarySimpleTense {
  mode: string
  tense: string
  pronouns: string[]
  forms: Record<'avoir' | 'être', string[]>
}

export const AUXILIARY_SIMPLE_TENSES: AuxiliarySimpleTense[] = [
  { mode: 'indicatif', tense: 'présent', pronouns: ['je', 'tu', 'il / elle / on', 'nous', 'vous', 'ils / elles'], forms: { avoir: ['ai', 'as', 'a', 'avons', 'avez', 'ont'], être: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'] } },
  { mode: 'indicatif', tense: 'imparfait', pronouns: ['je', 'tu', 'il / elle / on', 'nous', 'vous', 'ils / elles'], forms: { avoir: ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'], être: ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'] } },
  { mode: 'indicatif', tense: 'futur', pronouns: ['je', 'tu', 'il / elle / on', 'nous', 'vous', 'ils / elles'], forms: { avoir: ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'], être: ['serai', 'seras', 'sera', 'serons', 'serez', 'seront'] } },
  { mode: 'indicatif', tense: 'passé simple', pronouns: ['je', 'tu', 'il / elle / on', 'nous', 'vous', 'ils / elles'], forms: { avoir: ['eus', 'eus', 'eut', 'eûmes', 'eûtes', 'eurent'], être: ['fus', 'fus', 'fut', 'fûmes', 'fûtes', 'furent'] } },
  { mode: 'conditionnel', tense: 'présent', pronouns: ['je', 'tu', 'il / elle / on', 'nous', 'vous', 'ils / elles'], forms: { avoir: ['aurais', 'aurais', 'aurait', 'aurions', 'auriez', 'auraient'], être: ['serais', 'serais', 'serait', 'serions', 'seriez', 'seraient'] } },
  { mode: 'subjonctif', tense: 'présent', pronouns: ['que j’', 'que tu', 'qu’il / elle / on', 'que nous', 'que vous', 'qu’ils / elles'], forms: { avoir: ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'], être: ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'] } },
  { mode: 'subjonctif', tense: 'imparfait', pronouns: ['que j’', 'que tu', 'qu’il / elle / on', 'que nous', 'que vous', 'qu’ils / elles'], forms: { avoir: ['eusse', 'eusses', 'eût', 'eussions', 'eussiez', 'eussent'], être: ['fusse', 'fusses', 'fût', 'fussions', 'fussiez', 'fussent'] } },
  { mode: 'impératif', tense: 'présent', pronouns: ['tu', 'nous', 'vous'], forms: { avoir: ['aie', 'ayons', 'ayez'], être: ['sois', 'soyons', 'soyez'] } },
  { mode: 'infinitif', tense: 'présent', pronouns: ['forme'], forms: { avoir: ['avoir'], être: ['être'] } },
  { mode: 'participe', tense: 'présent', pronouns: ['forme'], forms: { avoir: ['ayant'], être: ['étant'] } },
]

export function compoundSimpleTense(mode: string, tense: string) {
  const key = `${normalized(mode)}:${normalized(tense)}`
  const mappings: Record<string, { mode: string, tense: string }> = {
    'indicatif:passe compose': { mode: 'indicatif', tense: 'présent' },
    'indicatif:plus-que-parfait': { mode: 'indicatif', tense: 'imparfait' },
    'indicatif:futur anterieur': { mode: 'indicatif', tense: 'futur' },
    'indicatif:passe anterieur': { mode: 'indicatif', tense: 'passé simple' },
    'conditionnel:passe': { mode: 'conditionnel', tense: 'présent' },
    'conditionnel:passe 1': { mode: 'conditionnel', tense: 'présent' },
    'conditionnel:passe 2': { mode: 'subjonctif', tense: 'imparfait' },
    'subjonctif:passe': { mode: 'subjonctif', tense: 'présent' },
    'subjonctif:plus-que-parfait': { mode: 'subjonctif', tense: 'imparfait' },
    'imperatif:passe': { mode: 'impératif', tense: 'présent' },
    'infinitif:passe': { mode: 'infinitif', tense: 'présent' },
    'participe:passe': { mode: 'participe', tense: 'présent' },
    'gerondif:passe': { mode: 'participe', tense: 'présent' },
  }
  return mappings[key] || null
}

