import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { formatConjugationQuestion } from './question-formatter'

const COLLECTION_FILE = 'Tests conjugaisons - corrigé.postman_collection.json'
const EXPECTATION_PATTERN = /pm\.expect\(data\.(titre|consigne|reponsesPourCorrige|reponses)\)\.to\.(equal|include)\(("(?:\\.|[^"\\])*")\)/gu

interface PostmanItem {
  name: string
  request: { body: { raw: string } }
  event?: Array<{ listen: string, script?: { exec?: string[] } }>
}

interface PostmanCollection {
  item: PostmanItem[]
}

interface PostmanInput {
  conjugaison1: string
  conjugaison2?: string
  conjugaison3?: string
  infinitif: string
  auxiliaire: string
  participe_passé: string
  pronom: string
  tempsname: string
  isTempsCompose: string | number
  modename: string
}

export interface ConjugationRule {
  id: 'apostrophe' | 'agreement' | 'inclusive' | 'compound' | 'imperative' | 'reflexive' | 'simple'
  label: string
}

export interface ConjugationAssertionResult {
  id: string
  property: 'titre' | 'consigne' | 'reponsesPourCorrige' | 'reponses'
  matcher: 'equal' | 'include'
  expected: string
  actual: string | string[]
  passed: boolean
}

export interface ConjugationScenarioResult {
  id: string
  name: string
  title: string
  purpose: string
  infinitif: string
  pronom: string
  mode: string
  tense: string
  sourceForms: string[]
  rules: ConjugationRule[]
  passed: boolean
  assertions: ConjugationAssertionResult[]
}

function rulesFor(input: PostmanInput, expectedValues: string[]): ConjugationRule[] {
  const rules: ConjugationRule[] = []
  const allText = expectedValues.join(' ')
  const compound = Boolean(Number(input.isTempsCompose))
  if (/['’]/u.test(allText)) rules.push({ id: 'apostrophe', label: 'Apostrophe et élision' })
  if (compound && input.auxiliaire.trim().toLocaleLowerCase('fr') === 'être') rules.push({ id: 'agreement', label: 'Accord du participe passé' })
  if (['iel', 'iels'].includes(input.pronom)) rules.push({ id: 'inclusive', label: 'Pronoms inclusifs' })
  if (compound) rules.push({ id: 'compound', label: 'Temps composé' })
  if (input.modename.toLocaleLowerCase('fr') === 'impératif') rules.push({ id: 'imperative', label: 'Impératif sans pronom' })
  if (/^(s['’]|se\s)/iu.test(input.infinitif)) rules.push({ id: 'reflexive', label: 'Verbe pronominal' })
  if (!compound) rules.push({ id: 'simple', label: 'Temps simple' })
  return rules
}

function purposeFor(input: PostmanInput, rules: ConjugationRule[]) {
  const checks: string[] = []
  if (rules.some(rule => rule.id === 'apostrophe')) checks.push('l’élision et l’apostrophe')
  if (rules.some(rule => rule.id === 'agreement')) checks.push(`l’accord du participe passé avec « ${input.pronom} »`)
  if (rules.some(rule => rule.id === 'inclusive')) checks.push(`la forme inclusive employée avec « ${input.pronom} »`)
  if (rules.some(rule => rule.id === 'imperative')) checks.push('la construction de l’impératif sans pronom sujet')
  if (rules.some(rule => rule.id === 'reflexive')) checks.push('la construction du verbe pronominal')
  if (checks.length === 0) checks.push(`la forme de « ${input.infinitif} » à la personne « ${input.pronom} »`)
  const modeContext: Record<string, string> = {
    indicatif: 'de l’indicatif',
    subjonctif: 'du subjonctif',
    conditionnel: 'du conditionnel',
    impératif: 'de l’impératif',
  }
  return `Vérifie ${checks.join(', ainsi que ')} au ${input.tempsname} ${modeContext[input.modename.toLocaleLowerCase('fr')] || `du mode ${input.modename}`}.`
}

export function expectationsForPostmanItem(item: PostmanItem) {
  const script = item.event
    ?.filter(event => event.listen === 'test')
    .flatMap(event => event.script?.exec || [])
    .join('\n') || ''

  return [...script.matchAll(EXPECTATION_PATTERN)].map(match => ({
    property: match[1] as ConjugationAssertionResult['property'],
    matcher: match[2] as ConjugationAssertionResult['matcher'],
    expected: JSON.parse(match[3]!) as string,
  }))
}

function sourceRow(input: PostmanInput, index: number) {
  return {
    id: index + 1,
    verbe_id: 1,
    personne_id: 1,
    temp_id: 1,
    conjugaison1: input.conjugaison1,
    conjugaison2: input.conjugaison2 || '',
    conjugaison3: input.conjugaison3 || '',
    infinitif: input.infinitif,
    auxiliaire: input.auxiliaire,
    participe_passe: input.participe_passé,
    temps_name: input.tempsname,
    is_compound: Number(input.isTempsCompose),
    mode_name: input.modename,
  }
}

export async function conjugationScenarioResults(): Promise<ConjugationScenarioResult[]> {
  const collectionPath = resolve(process.cwd(), 'postman', COLLECTION_FILE)
  const collection = JSON.parse(await readFile(collectionPath, 'utf8')) as PostmanCollection

  return collection.item.map((item, index) => {
    const input = JSON.parse(item.request.body.raw) as PostmanInput
    const result = formatConjugationQuestion(sourceRow(input, index), input.pronom)
    const expectations = expectationsForPostmanItem(item)
    const rules = rulesFor(input, expectations.map(expectation => expectation.expected))
    const displayedForm = expectations.find(expectation => expectation.property === 'reponsesPourCorrige')?.expected || item.name
    const assertions = expectations.map((expectation, assertionIndex) => {
      const actual = result[expectation.property]
      const passed = expectation.matcher === 'equal'
        ? actual === expectation.expected
        : Array.isArray(actual) && actual.includes(expectation.expected)

      return {
        id: `${index + 1}-${assertionIndex + 1}`,
        ...expectation,
        actual: Array.isArray(actual) ? actual : String(actual ?? ''),
        passed,
      }
    })

    return {
      id: String(index + 1),
      name: displayedForm,
      title: `${input.modename.charAt(0).toLocaleUpperCase('fr')}${input.modename.slice(1)} — ${input.tempsname} — « ${displayedForm} »`,
      purpose: purposeFor(input, rules),
      infinitif: input.infinitif,
      pronom: input.pronom,
      mode: input.modename,
      tense: input.tempsname,
      sourceForms: [input.conjugaison1, input.conjugaison2, input.conjugaison3].filter((form): form is string => Boolean(form)),
      rules,
      passed: assertions.length > 0 && assertions.every(assertion => assertion.passed),
      assertions,
    }
  })
}
