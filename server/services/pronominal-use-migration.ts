import type { Connection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { pronominalUseSeeds } from '../../shared/data/pronominal-use-seeds'

interface MigrationConnection {
  execute: Connection['execute']
}

interface BaseVerbRow extends RowDataPacket {
  id: number
  infinitif: string
  type_h_initial: string | null
}

interface ExistingUseRow extends RowDataPacket {
  id: number
  verbe_id: number | null
  infinitif_pronominal: string
  actif: number
}

function pronominalInfinitive(infinitive: string, hType: string | null) {
  const first = infinitive
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .charAt(0)
    .toLocaleLowerCase('fr')
  const elides = 'aeiouy'.includes(first) || (first === 'h' && hType !== 'aspire')
  return `${elides ? "s'" : 'se '}${infinitive}`
}

export async function migratePronominalUses(connection: MigrationConnection) {
  const [bases] = await connection.execute<BaseVerbRow[]>(`
    SELECT id, infinitif, type_h_initial
    FROM verbes
    WHERE est_archive=0
    ORDER BY infinitif
  `)
  const [existingUses] = await connection.execute<ExistingUseRow[]>(`
    SELECT id, verbe_id, infinitif_pronominal, actif
    FROM emplois_pronominaux
    ORDER BY id
  `)
  const basesByInfinitive = new Map(bases.map(base => [base.infinitif, base]))
  const usesByInfinitive = new Map(existingUses.map(use => [use.infinitif_pronominal, use]))
  const missingBases: string[] = []
  let inserted = 0
  let reactivated = 0

  for (const seed of pronominalUseSeeds) {
    const base = basesByInfinitive.get(seed.infinitif)
    if (!base) {
      missingBases.push(seed.infinitif)
      continue
    }

    const infinitifPronominal = pronominalInfinitive(base.infinitif, base.type_h_initial)
    const existing = usesByInfinitive.get(infinitifPronominal)
    if (existing && Number(existing.verbe_id) !== Number(base.id)) {
      throw new Error(
        `${infinitifPronominal} est déjà relié au verbe ${existing.verbe_id}, pas à ${base.id}.`
      )
    }

    if (!existing) {
      const [result] = await connection.execute<ResultSetHeader>(`
        INSERT INTO emplois_pronominaux
          (verbe_id, infinitif_pronominal, type_emploi, fonction_pronom, regle_accord,
           preposition, personnes_autorisees, source, source_url, statut_validation, actif)
        VALUES (?, ?, ?, ?, ?, NULL, ?,
          'Dictionnaire de l’Académie française', ?, 'valide', 1)
      `, [
        base.id,
        infinitifPronominal,
        seed.typeEmploi,
        seed.fonctionPronom,
        seed.regleAccord,
        JSON.stringify(seed.personnesAutorisees),
        seed.sourceUrl,
      ])
      inserted += Number(result.affectedRows)
    }
    else if (!Number(existing.actif)) {
      const [result] = await connection.execute<ResultSetHeader>(
        'UPDATE emplois_pronominaux SET actif=1 WHERE id=?',
        [existing.id]
      )
      reactivated += Number(result.affectedRows)
    }

    await connection.execute(
      'UPDATE verbes SET pronominalisable=1 WHERE id=? AND pronominalisable<>1',
      [base.id]
    )
  }

  if (missingBases.length) {
    throw new Error(`Verbes de base introuvables : ${missingBases.join(', ')}.`)
  }

  const [verification] = await connection.execute<Array<RowDataPacket & { count: number }>>(`
    SELECT COUNT(*) AS count
    FROM emplois_pronominaux
    WHERE actif=1 AND verbe_id IS NOT NULL
  `)

  return {
    seedCount: pronominalUseSeeds.length,
    inserted,
    reactivated,
    activeUseCount: Number(verification[0]?.count || 0),
  }
}
