import type { RowDataPacket } from 'mysql2/promise'
import type { ExerciseQuestion } from '../types/public-api'
import { useDatabase } from '../utils/database'
import { formatAnswer, type ConjugationSourceRow } from './question-formatter'
import { formatNonFiniteQuestion, type NonFiniteVerbSource, type NonFiniteTenseSource } from './non-finite-formatter'
import { generatePronominalRow, type PronominalSourceRow } from './pronominal-formatter'
import { isImpersonalVerb } from '../../shared/utils/impersonal-verbs'
import { infinitiveAnswers, infinitiveFormKey, INFINITIVE_IDENTIFICATION_INSTRUCTION } from '../../shared/utils/infinitive-identification'

interface ReferenceRow extends RowDataPacket, ConjugationSourceRow {
  pronom: string
  est_impersonnel: number
  type_h_initial: string | null
}
interface UseRow extends RowDataPacket {
  id: number
  verbe_id: number
  infinitif_pronominal: string
  regle_accord: string
  personnes_autorisees: unknown
}
type Lexicon = Map<string, Set<string>>
let cache: { expires: number, promise: Promise<Lexicon> } | undefined

export function invalidateInfinitiveLexicon() { cache = undefined }

function allowedPersons(value: unknown): number[] | null {
  if (typeof value === 'string') {
    try { value = JSON.parse(value) } catch { return null }
  }
  return Array.isArray(value) && value.length ? value.map(Number) : null
}

/** Index de toutes les formes, indépendamment des verbes/temps choisis pour le défi. */
async function loadLexicon(): Promise<Lexicon> {
  const database = useDatabase()
  const [finite, uses, verbs, tenses] = await Promise.all([
    database.execute<ReferenceRow[]>(`
      SELECT vc.*, v.infinitif, v.auxiliaire, v.\`participe_passé\` AS participe_passe,
             v.est_impersonnel, v.type_h_initial, p.pronom,
             t.name AS temps_name, t.isTempsCompose AS is_compound, m.name AS mode_name
      FROM verbesconjugues vc
      JOIN verbes v ON v.id=vc.verbe_id AND v.est_archive=0
      JOIN personnes p ON p.id=vc.personne_id
      JOIN temps t ON t.id=vc.temp_id
      JOIN modes m ON m.id=t.mode_id
      WHERE vc.conjugaison1<>''
        AND m.name NOT IN ('infinitif','participe','gérondif')
    `),
    database.execute<UseRow[]>(`SELECT ep.id,ep.verbe_id,ep.infinitif_pronominal,ep.regle_accord,ep.personnes_autorisees
      FROM emplois_pronominaux ep JOIN verbes v ON v.id=ep.verbe_id AND v.est_archive=0
      WHERE ep.actif=1`),
    database.execute<(RowDataPacket & NonFiniteVerbSource & { type_h_initial: string | null })[]>(`
      SELECT v.id,v.infinitif,v.type_h_initial,v.\`participe_présent\` AS participe_present,
             v.\`participe_passé\` AS participe_passe, a.infinitif AS auxiliaire_infinitif,
             a.\`participe_présent\` AS auxiliaire_participe_present
      FROM verbes v LEFT JOIN verbes a ON a.infinitif=v.auxiliaire WHERE v.est_archive=0
    `),
    database.execute<(RowDataPacket & NonFiniteTenseSource)[]>(`
      SELECT t.id,t.name,t.isTempsCompose AS is_compound,m.name AS mode_name
      FROM temps t JOIN modes m ON m.id=t.mode_id WHERE m.name IN ('participe','gérondif')
    `),
  ])
  const lexicon: Lexicon = new Map()
  const add = (form: string, infinitive: string, rawForm?: string, personId?: number) => {
    if (!form.trim() || form.trim() === '-') return
    const key = infinitiveFormKey(form)
    const candidates = lexicon.get(key) || new Set<string>()
    candidates.add(infinitive)
    lexicon.set(key, candidates)
    if (rawForm && personId) {
      const rawKey = `form:${personId}:${infinitiveFormKey(rawForm)}`
      const rawCandidates = lexicon.get(rawKey) || new Set<string>()
      rawCandidates.add(infinitive)
      lexicon.set(rawKey, rawCandidates)
    }
  }
  const auxiliaryForms = finite[0].filter(row => row.infinitif === 'être')
  const usesByVerb = new Map<number, UseRow[]>()
  for (const use of uses[0]) usesByVerb.set(Number(use.verbe_id), [...(usesByVerb.get(Number(use.verbe_id)) || []), use])
  for (const row of finite[0]) {
    if (isImpersonalVerb(row.infinitif, row.est_impersonnel) && row.pronom !== 'il') continue
    for (const form of [row.conjugaison1, row.conjugaison2, row.conjugaison3]) {
      if (form?.trim()) add(formatAnswer(row.pronom, form, row.mode_name, row.infinitif), row.infinitif, form, Number(row.personne_id))
    }
    for (const use of usesByVerb.get(Number(row.verbe_id)) || []) {
      const persons = allowedPersons(use.personnes_autorisees)
      if (persons && !persons.includes(Number(row.personne_id))) continue
      const generated = generatePronominalRow({
        ...row, pronominal_use_id: use.id, infinitif_pronominal: use.infinitif_pronominal,
        regle_accord: use.regle_accord, base_conjugaison1: row.conjugaison1,
        base_conjugaison2: row.conjugaison2, base_conjugaison3: row.conjugaison3,
      } as PronominalSourceRow, auxiliaryForms)
      for (const form of [generated.conjugaison1, generated.conjugaison2, generated.conjugaison3]) {
        if (form?.trim()) add(formatAnswer(row.pronom, form, row.mode_name, generated.infinitif), generated.infinitif, form, Number(row.personne_id))
      }
    }
  }
  for (const verb of verbs[0]) {
    const pronominalVerbs = (usesByVerb.get(Number(verb.id)) || []).map(use => ({
      ...verb, id: -Number(use.id), infinitif: use.infinitif_pronominal,
      auxiliaire_infinitif: 'être', auxiliaire_participe_present: "s'étant",
      participe_present: (verb.participe_present || '').split('-').map(form => {
        const initial = form.normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0).toLowerCase()
        const elide = 'aeiouy'.includes(initial) || (initial === 'h' && verb.type_h_initial !== 'aspire')
        return form.trim() ? `${elide ? "s'" : 'se '}${form.trim()}` : ''
      }).join('-'),
    }))
    for (const candidate of [verb, ...pronominalVerbs]) {
      for (const tense of tenses[0]) {
        const question = formatNonFiniteQuestion(candidate, tense)
        for (const form of question?.reponses || []) add(form, candidate.infinitif)
      }
    }
  }
  return lexicon
}

async function infinitiveLexicon() {
  if (!cache || cache.expires < Date.now()) {
    const promise = loadLexicon()
    cache = { expires: Date.now() + 120_000, promise }
    void promise.catch(() => { if (cache?.promise === promise) cache = undefined })
  }
  return cache.promise
}

export function infinitiveIdentificationQuestion(question: ExerciseQuestion, candidates: readonly string[]): ExerciseQuestion {
  const infinitives = [...new Set([question.infinitif || '', ...candidates].filter(Boolean))]
  const { radicalReference: _radical, conjugationConfusions: _confusions, nousForm: _nous, speech: _speech, ...source } = question
  return {
    ...source, id: `i-${question.id}`, exerciseKind: 'infinitive-identification', titre: 'Trouver l’infinitif',
    instruction: INFINITIVE_IDENTIFICATION_INSTRUCTION,
    // Un participe passé isolé n’est pas une forme avec auxiliaire.
    isCompound: Boolean(question.isCompound) && question.mode?.toLocaleLowerCase('fr') !== 'participe',
    reponses: infinitiveAnswers(infinitives), reponsesPourCorrige: infinitives,
  }
}

export async function identifyInfinitives(questions: ExerciseQuestion[]) {
  const lexicon = await infinitiveLexicon()
  const seen = new Set<string>()
  return questions.flatMap((question) => {
    const phrase = question.literaryCitation
      ? formatAnswer(question.pronom || '', question.conjugaison1 || question.literaryCitation.target, question.mode || '', question.infinitif)
      : question.consigne
    const key = infinitiveFormKey(phrase)
    const candidates = [...(lexicon.get(key) || [])]
    if (question.literaryCitation) {
      // Ne pas utiliser le mode caché pour écarter artificiellement un homographe.
      const target = question.literaryCitation.target
      const withoutSubject = target.replace(/^(?:que\s+|qu[’'])?(?:je\s+|j[’']|tu\s+|il\s+|elle\s+|on\s+|nous\s+|vous\s+|ils\s+|elles\s+)/iu, '')
      for (const form of [target, withoutSubject]) {
        for (const candidate of lexicon.get(`form:${question.personId}:${infinitiveFormKey(form)}`) || []) {
          if (!candidates.includes(candidate)) candidates.push(candidate)
        }
      }
    }
    // Le contexte d’une citation doit être étudié avant d’accepter un homographe.
    if (question.literaryCitation && candidates.some(candidate => candidate !== question.infinitif)) return []
    const uniqueKey = question.literaryCitation ? String(question.id) : key
    if (seen.has(uniqueKey)) return []
    seen.add(uniqueKey)
    return [infinitiveIdentificationQuestion(question, candidates)]
  })
}
