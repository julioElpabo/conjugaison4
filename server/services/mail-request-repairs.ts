import type { PoolConnection, RowDataPacket } from 'mysql2/promise'

interface ConjugationRow extends RowDataPacket {
  id: number
  infinitif: string
  participe_passe: string
  verbe_infinitif?: string
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

interface AccentVerbRow extends RowDataPacket {
  id: number
  infinitif: string
  participe_present: string
  participe_passe: string
  forme_canonique: string
}

interface AccentTextRow extends RowDataPacket {
  id: number
  value1: string
  value2?: string | null
}

export const MISSING_DE_ACCENT_REPAIRS = [
  { before: 'deborder', after: 'déborder', presentParticiple: 'débordant', pastParticiple: 'débordé' },
  { before: 'debuter', after: 'débuter', presentParticiple: 'débutant', pastParticiple: 'débuté' },
  { before: 'decoller', after: 'décoller', presentParticiple: 'décollant', pastParticiple: 'décollé' },
  { before: 'dedier', after: 'dédier', presentParticiple: 'dédiant', pastParticiple: 'dédié' },
  { before: 'defiler', after: 'défiler', presentParticiple: 'défilant', pastParticiple: 'défilé' },
  { before: 'designer', after: 'désigner', presentParticiple: 'désignant', pastParticiple: 'désigné' },
  { before: 'detourner', after: 'détourner', presentParticiple: 'détournant', pastParticiple: 'détourné' },
  { before: 'developper', after: 'développer', presentParticiple: 'développant', pastParticiple: 'développé' },
] as const

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

export function repairMissingDeAccentForm(form: string, beforeInfinitive: string, afterInfinitive: string) {
  const beforeStem = beforeInfinitive.slice(0, -2)
  const afterStem = afterInfinitive.slice(0, -2)
  return form.split(beforeStem).join(afterStem)
}

export async function repairMissingDeAccents(connection: PoolConnection) {
  const report = {
    verbs: 0,
    conjugationRows: 0,
    conjugationForms: 0,
    pronominalUses: 0,
    meaningTexts: 0,
  }

  for (const repair of MISSING_DE_ACCENT_REPAIRS) {
    const [verbRows] = await connection.execute<AccentVerbRow[]>(`
      SELECT id,infinitif,
             \`participe_présent\` AS participe_present,
             \`participe_passé\` AS participe_passe,
             forme_canonique
      FROM verbes
      WHERE infinitif IN (?,?)
      ORDER BY id
      FOR UPDATE
    `, [repair.before, repair.after])
    const beforeRows = verbRows.filter(row => row.infinitif === repair.before)
    const afterRows = verbRows.filter(row => row.infinitif === repair.after)
    if (beforeRows.length > 1 || afterRows.length > 1 || (beforeRows.length && afterRows.length)) {
      throw new Error(`La correction de « ${repair.before} » est ambiguë (${verbRows.length} lignes).`)
    }
    const verb = beforeRows[0] ?? afterRows[0]
    if (!verb) continue

    const [conjugationRows] = await connection.execute<ConjugationRow[]>(`
      SELECT id,'' AS infinitif,'' AS participe_passe,verbe_infinitif,
             conjugaison1,conjugaison2,conjugaison3
      FROM verbesconjugues
      WHERE verbe_id=?
      ORDER BY id
      FOR UPDATE
    `, [verb.id])
    for (const row of conjugationRows) {
      const current = forms(row)
      const repaired = current.map(form => repairMissingDeAccentForm(form, repair.before, repair.after))
      const changedForms = current.filter((form, index) => form !== repaired[index]).length
      if (!changedForms && row.verbe_infinitif === repair.after) continue
      await connection.execute(
        'UPDATE verbesconjugues SET verbe_infinitif=?,conjugaison1=?,conjugaison2=?,conjugaison3=? WHERE id=?',
        [repair.after, ...repaired, row.id],
      )
      report.conjugationRows += 1
      report.conjugationForms += changedForms
    }

    const [pronominalRows] = await connection.execute<AccentTextRow[]>(`
      SELECT id,infinitif_pronominal AS value1
      FROM emplois_pronominaux
      WHERE verbe_id=?
      FOR UPDATE
    `, [verb.id])
    for (const row of pronominalRows) {
      const repaired = row.value1.split(repair.before).join(repair.after)
      if (repaired === row.value1) continue
      await connection.execute('UPDATE emplois_pronominaux SET infinitif_pronominal=? WHERE id=?', [repaired, row.id])
      report.pronominalUses += 1
    }

    const [meaningRows] = await connection.execute<AccentTextRow[]>(`
      SELECT id,intitule AS value1,definition AS value2
      FROM verbe_sens
      WHERE verbe_id=?
      FOR UPDATE
    `, [verb.id])
    for (const row of meaningRows) {
      const title = String(row.value1 || '').split(repair.before).join(repair.after)
      const definition = row.value2 === null || row.value2 === undefined
        ? null
        : row.value2.split(repair.before).join(repair.after)
      if (title === row.value1 && definition === (row.value2 ?? null)) continue
      await connection.execute('UPDATE verbe_sens SET intitule=?,definition=? WHERE id=?', [title, definition, row.id])
      report.meaningTexts += Number(title !== row.value1) + Number(definition !== (row.value2 ?? null))
    }

    const verbNeedsRepair = verb.infinitif !== repair.after
      || verb.participe_present !== repair.presentParticiple
      || verb.participe_passe !== repair.pastParticiple
      || verb.forme_canonique !== repair.after
    if (verbNeedsRepair) {
      await connection.execute(`
        UPDATE verbes
        SET infinitif=?,\`participe_présent\`=?,\`participe_passé\`=?,forme_canonique=?
        WHERE id=?
      `, [repair.after, repair.presentParticiple, repair.pastParticiple, repair.after, verb.id])
      report.verbs += 1
    }
  }

  return report
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
    missingDeAccents: await repairMissingDeAccents(connection),
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
