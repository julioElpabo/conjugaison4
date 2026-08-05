import type { PoolConnection, RowDataPacket } from 'mysql2/promise'

interface ConjugationRow extends RowDataPacket {
  id: number
  infinitif: string
  participe_passe: string
  conjugaison1: string
  conjugaison2: string
  conjugaison3: string
}

interface ParadigmRow extends RowDataPacket {
  verb_id: number
  infinitif: string
  personnes_disponibles: string | number[] | null
  tense_id: number
  mode_name: string
  tense_name: string
  person_id: number
  conjugaison1: string
}

export interface ParadigmIssue {
  infinitive: string
  mode: string
  tense: string
  missingPersonIds: number[]
}

function forms(row: Pick<ConjugationRow, 'conjugaison1' | 'conjugaison2' | 'conjugaison3'>) {
  return [row.conjugaison1, row.conjugaison2, row.conjugaison3]
    .map(value => String(value || '').trim())
}

function allowedPersons(value: ParadigmRow['personnes_disponibles']) {
  if (Array.isArray(value)) return value.map(Number)
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed.map(Number)
    } catch {
      return []
    }
  }
  return []
}

function escapedRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
}

/** Retire uniquement un s ajouté après un participe qui se termine déjà par s ou x. */
export function repairMalformedPluralParticiple(form: string, participle: string) {
  const normalizedParticiple = participle.trim()
  if (!/[sx]$/u.test(normalizedParticiple)) return form
  return form.replace(
    new RegExp(`${escapedRegExp(normalizedParticiple)}s(?=$|[\\s!?.,;:])`, 'gu'),
    normalizedParticiple,
  )
}

export async function auditFiniteParadigms(connection: PoolConnection): Promise<ParadigmIssue[]> {
  const [rows] = await connection.query<ParadigmRow[]>(`
    SELECT v.id AS verb_id,v.infinitif,v.personnes_disponibles,
           t.id AS tense_id,m.name AS mode_name,t.name AS tense_name,
           p.id AS person_id,COALESCE(vc.conjugaison1,'') AS conjugaison1
    FROM verbes v
    CROSS JOIN temps t
    INNER JOIN modes m ON m.id=t.mode_id
    CROSS JOIN personnes p
    LEFT JOIN verbesconjugues vc
      ON vc.verbe_id=v.id AND vc.temp_id=t.id AND vc.personne_id=p.id
    WHERE v.est_archive=0
      AND m.name NOT IN ('impératif','participe','infinitif','gérondif')
      AND t.code<>'near-future'
    ORDER BY v.id,t.id,p.id
  `)

  const groups = new Map<string, ParadigmRow[]>()
  for (const row of rows) {
    const key = `${row.verb_id}:${row.tense_id}`
    const group = groups.get(key) || []
    group.push(row)
    groups.set(key, group)
  }

  const issues: ParadigmIssue[] = []
  for (const group of groups.values()) {
    const filled = group.filter(row => String(row.conjugaison1 || '').trim())
    // Un temps entièrement absent représente un temps non disponible pour ce verbe.
    if (!filled.length) continue
    const configured = allowedPersons(group[0]!.personnes_disponibles)
    const expected = configured.length ? configured : [4, 5, 6, 7, 8, 9]
    const filledIds = new Set(filled.map(row => Number(row.person_id)))
    const missingPersonIds = expected.filter(id => !filledIds.has(id))
    if (missingPersonIds.length) {
      issues.push({
        infinitive: group[0]!.infinitif,
        mode: group[0]!.mode_name,
        tense: group[0]!.tense_name,
        missingPersonIds,
      })
    }
  }
  return issues
}

export async function repairMailRequestConjugations(connection: PoolConnection) {
  const report = {
    protegerPresentNous: 0,
    malformedPluralParticiples: 0,
    affaiblirPastSimpleForms: 0,
  }

  const [protegerRows] = await connection.execute<ConjugationRow[]>(`
    SELECT vc.id,v.infinitif,v.\`participe_passé\` AS participe_passe,
           vc.conjugaison1,vc.conjugaison2,vc.conjugaison3
    FROM verbesconjugues vc
    INNER JOIN verbes v ON v.id=vc.verbe_id
    INNER JOIN personnes p ON p.id=vc.personne_id
    INNER JOIN temps t ON t.id=vc.temp_id
    INNER JOIN modes m ON m.id=t.mode_id
    WHERE v.infinitif='protéger' AND p.pronom='nous'
      AND m.name='indicatif' AND t.name='présent'
    FOR UPDATE
  `)
  if (protegerRows.length !== 1) {
    throw new Error(`Une forme « nous protéger » au présent était attendue, ${protegerRows.length} trouvée(s).`)
  }
  const proteger = protegerRows[0]!
  if (!['protègeons', 'protégeons'].includes(proteger.conjugaison1)) {
    throw new Error(`Forme inattendue pour « nous protéger » : ${proteger.conjugaison1}.`)
  }
  if (proteger.conjugaison1 === 'protègeons') {
    await connection.execute(
      "UPDATE verbesconjugues SET conjugaison1='protégeons' WHERE id=?",
      [proteger.id],
    )
    report.protegerPresentNous = 1
  }

  const [compoundRows] = await connection.query<ConjugationRow[]>(`
    SELECT vc.id,v.infinitif,v.\`participe_passé\` AS participe_passe,
           vc.conjugaison1,vc.conjugaison2,vc.conjugaison3
    FROM verbesconjugues vc
    INNER JOIN verbes v ON v.id=vc.verbe_id
    INNER JOIN personnes p ON p.id=vc.personne_id
    INNER JOIN temps t ON t.id=vc.temp_id
    WHERE t.isTempsCompose=1 AND p.id IN (7,8,9)
      AND v.\`participe_passé\` REGEXP '[sx]$'
    FOR UPDATE
  `)
  for (const row of compoundRows) {
    const current = forms(row)
    const repaired = current.map(form => repairMalformedPluralParticiple(form, row.participe_passe))
    if (current.join('\u0000') === repaired.join('\u0000')) continue
    await connection.execute(
      'UPDATE verbesconjugues SET conjugaison1=?,conjugaison2=?,conjugaison3=? WHERE id=?',
      [...repaired, row.id],
    )
    report.malformedPluralParticiples += 1
  }

  const expectedAffaiblir = new Map<number, string>([
    [4, 'affaiblis'],
    [5, 'affaiblis'],
    [6, 'affaiblit'],
  ])
  const [affaiblirContext] = await connection.query<Array<RowDataPacket & { verb_id: number, tense_id: number }>>(`
    SELECT v.id AS verb_id,t.id AS tense_id
    FROM verbes v
    CROSS JOIN temps t
    INNER JOIN modes m ON m.id=t.mode_id
    WHERE v.infinitif='affaiblir' AND m.name='indicatif' AND t.name='passé simple'
  `)
  if (affaiblirContext.length !== 1) throw new Error('Le passé simple d’« affaiblir » est introuvable ou ambigu.')
  for (const [personId, expected] of expectedAffaiblir) {
    const [existing] = await connection.execute<ConjugationRow[]>(`
      SELECT vc.id,'affaiblir' AS infinitif,'' AS participe_passe,
             vc.conjugaison1,vc.conjugaison2,vc.conjugaison3
      FROM verbesconjugues vc
      WHERE vc.verbe_id=? AND vc.temp_id=? AND vc.personne_id=?
      FOR UPDATE
    `, [affaiblirContext[0]!.verb_id, affaiblirContext[0]!.tense_id, personId])
    if (existing.length > 1) throw new Error(`Plusieurs formes d’« affaiblir » existent pour la personne ${personId}.`)
    if (!existing.length) {
      await connection.execute(`
        INSERT INTO verbesconjugues
          (verbe_id,verbe_infinitif,personne_id,temp_id,conjugaison1,conjugaison2,conjugaison3)
        VALUES (?,'affaiblir',?,?,?,'','')
      `, [affaiblirContext[0]!.verb_id, personId, affaiblirContext[0]!.tense_id, expected])
      report.affaiblirPastSimpleForms += 1
    } else if (!existing[0]!.conjugaison1) {
      await connection.execute('UPDATE verbesconjugues SET conjugaison1=? WHERE id=?', [expected, existing[0]!.id])
      report.affaiblirPastSimpleForms += 1
    } else if (existing[0]!.conjugaison1 !== expected) {
      throw new Error(`Forme inattendue pour « affaiblir » (personne ${personId}) : ${existing[0]!.conjugaison1}.`)
    }
  }

  return report
}
