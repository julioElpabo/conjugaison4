export interface CoachCondensedTenseRule {
  label: string
  rule: string
  notes?: readonly string[]
  example: string
}

export const COACH_CONDENSED_TENSE_RULES = {
  'indicatif:present': {
    label: 'Indicatif présent',
    rule: 'Radical du présent, parfois variable + terminaison de la personne.',
    example: 'chant- + -ons = chantons',
  },
  'indicatif:imparfait': {
    label: 'Indicatif imparfait',
    rule: 'Forme avec « nous » au présent, sans « -ons » + terminaison de l’imparfait.',
    notes: ['Exception : être → ét-.'],
    example: 'nous chantons → chant- + -ait = chantait',
  },
  'indicatif:futur': {
    label: 'Indicatif futur',
    rule: 'Radical du futur, souvent l’infinitif sans le « e » final des verbes en « -re » + terminaison du futur.',
    example: 'chanter- + -ons = chanterons',
  },
  'indicatif:passe simple': {
    label: 'Indicatif passé simple',
    rule: 'Radical du passé simple + terminaison de sa série.',
    example: 'chant- + -èrent = chantèrent',
  },
  'indicatif:passe compose': {
    label: 'Indicatif passé composé',
    rule: 'Auxiliaire au présent + participe passé.',
    example: 'il a + chanté = il a chanté',
  },
  'indicatif:futur anterieur': {
    label: 'Indicatif futur antérieur',
    rule: 'Auxiliaire au futur + participe passé.',
    example: 'il aura + chanté = il aura chanté',
  },
  'indicatif:plus-que-parfait': {
    label: 'Indicatif plus-que-parfait',
    rule: 'Auxiliaire à l’imparfait + participe passé.',
    example: 'il avait + chanté = il avait chanté',
  },
  'indicatif:passe anterieur': {
    label: 'Indicatif passé antérieur',
    rule: 'Auxiliaire au passé simple + participe passé.',
    example: 'il eut + chanté = il eut chanté',
  },
  'imperatif:present': {
    label: 'Impératif présent',
    rule: 'Forme du présent avec « tu », « nous » ou « vous », sans le sujet.',
    notes: ['Avec « tu » des verbes en « -er », enlève généralement le « s ».'],
    example: 'tu chantes → chante !',
  },
  'imperatif:passe': {
    label: 'Impératif passé',
    rule: 'Auxiliaire à l’impératif présent + participe passé.',
    example: 'aie + chanté = aie chanté !',
  },
  'subjonctif:present': {
    label: 'Subjonctif présent',
    rule: 'Formes avec « ils » et « nous » au présent, sans « -ent » ou « -ons » + terminaison du subjonctif.',
    example: 'ils chantent → chant- + -ions = que nous chantions',
  },
  'subjonctif:passe': {
    label: 'Subjonctif passé',
    rule: 'Auxiliaire au subjonctif présent + participe passé.',
    example: 'qu’il ait + chanté = qu’il ait chanté',
  },
  'subjonctif:imparfait': {
    label: 'Subjonctif imparfait',
    rule: 'Prends la forme avec « il » au passé simple.',
    notes: ['Enlève le « t » final s’il y en a.', 'Puis ajoute la terminaison du subjonctif imparfait.'],
    example: 'il finit → fini- + -sse = que je finisse',
  },
  'subjonctif:plus-que-parfait': {
    label: 'Subjonctif plus-que-parfait',
    rule: 'Auxiliaire au subjonctif imparfait + participe passé.',
    example: 'qu’il eût + chanté = qu’il eût chanté',
  },
  'conditionnel:present': {
    label: 'Conditionnel présent',
    rule: 'Radical du futur + terminaison de l’imparfait.',
    example: 'chanter- + -ait = chanterait',
  },
  'conditionnel:passe 1': {
    label: 'Conditionnel passé, première forme',
    rule: 'Auxiliaire au conditionnel présent + participe passé.',
    example: 'il aurait + chanté = il aurait chanté',
  },
  'conditionnel:passe 2': {
    label: 'Conditionnel passé, deuxième forme',
    rule: 'Auxiliaire au subjonctif imparfait + participe passé.',
    example: 'il eût + chanté = il eût chanté',
  },
  'participe:present': {
    label: 'Participe présent',
    rule: 'Forme avec « nous » au présent, sans « -ons » + « -ant ».',
    example: 'nous chantons → chant- + -ant = chantant',
  },
  'participe:passe': {
    label: 'Participe passé',
    rule: 'Le participe passé est une forme à apprendre.',
    notes: ['Il est utilisé dans les temps composés.'],
    example: 'chanter → chanté',
  },
  'gerondif:present': {
    label: 'Gérondif présent',
    rule: '« en » + participe présent.',
    example: 'en + chantant = en chantant',
  },
  'gerondif:passe': {
    label: 'Gérondif passé',
    rule: '« en » + participe présent de l’auxiliaire + participe passé.',
    example: 'en + ayant + chanté = en ayant chanté',
  },
} as const satisfies Record<string, CoachCondensedTenseRule>

function normalizedRulePart(value?: string | null) {
  return (value || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLocaleLowerCase('fr')
}

export function coachCondensedTenseRule(mode?: string | null, tense?: string | null): CoachCondensedTenseRule {
  const key = `${normalizedRulePart(mode)}:${normalizedRulePart(tense)}`
  return COACH_CONDENSED_TENSE_RULES[key as keyof typeof COACH_CONDENSED_TENSE_RULES] || {
    label: [mode, tense].filter(Boolean).join(' · ') || 'Conjugaison',
    rule: 'Repère le mode et le temps, puis construis la forme avec le radical et la terminaison adaptés.',
    example: 'chant- + -ons = chantons',
  }
}
