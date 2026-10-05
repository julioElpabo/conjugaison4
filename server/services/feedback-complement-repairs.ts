import type { PoolConnection, RowDataPacket } from 'mysql2/promise'
import { withComplementPreposition } from '../../shared/utils/complement-preposition'

const catalogSources = new Set(['Catalogue pédagogique mineurs 2026', 'Catalogue exhaustif contrôlé 2026'])

/** Corrections ciblées des exemples pédagogiques, sans modifier les emplois dictionnairiques. */
export function repairFeedbackComplement(row: {
  infinitif: string; texte: string; texte_antepose: string | null; source: string | null; actif: number
}) {
  let { texte, texte_antepose, actif } = row
  if (row.infinitif === 'tomber' && /\bquilles?$/iu.test(texte)) actif = 0
  if (catalogSources.has(row.source || '')) {
    const replaceNoun = (value: string) => {
      if (row.infinitif === 'élever') return value.replace(/\bconstructions?$/iu, noun => noun.endsWith('s') ? 'poules' : 'poule')
      if (row.infinitif === 'souffrir' && /\battentes?$/iu.test(value)) {
        return value.replace(/^l['’](?=attente)/iu, 'la ').replace(/^mon /iu, 'ma ').replace(/^ton /iu, 'ta ').replace(/^son /iu, 'sa ')
          .replace(/\battentes?$/iu, noun => noun.endsWith('s') ? 'douleurs' : 'douleur')
      }
      return value
    }
    texte = replaceNoun(texte)
    if (texte_antepose) {
      texte_antepose = replaceNoun(texte_antepose)
      if (row.infinitif === 'souffrir') texte_antepose = texte_antepose.replace(/^la autre (?=douleurs?$)/iu, 'l’autre ')
    }
  }
  if (/^de\s+des\s+/iu.test(texte)) texte = withComplementPreposition(texte, 'de')
  return { texte, texte_antepose, actif }
}

/** Idempotent ; ne réécrit ni les réponses des élèves ni leurs résultats. */
export async function repairFeedbackComplements(connection: PoolConnection, apply = false) {
  const [rows] = await connection.query<RowDataPacket[]>(`
    SELECT c.id,c.construction_id,c.texte,c.texte_antepose,c.source,c.actif,v.infinitif
    FROM complements_verbaux c
    JOIN constructions_verbales cv ON cv.id=c.construction_id
    JOIN verbe_sens vs ON vs.id=cv.sens_id JOIN verbes v ON v.id=vs.verbe_id
    WHERE c.actif=1 AND (v.infinitif IN ('tomber','élever','souffrir') OR c.texte LIKE 'de des %')
    ORDER BY c.id
  `)
  const report = { replaced: 0, disabled: 0 }
  for (const row of rows) {
    const corrected = repairFeedbackComplement({
      infinitif: String(row.infinitif), texte: String(row.texte),
      texte_antepose: row.texte_antepose === null ? null : String(row.texte_antepose),
      source: row.source === null ? null : String(row.source), actif: Number(row.actif),
    })
    if (corrected.texte === row.texte && corrected.texte_antepose === row.texte_antepose && corrected.actif === Number(row.actif)) continue
    // Une correction déjà ajoutée par l’administration peut occuper la clé unique.
    const [duplicates] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM complements_verbaux WHERE construction_id=? AND texte=? AND id<>? LIMIT 1',
      [row.construction_id, corrected.texte, row.id],
    )
    if (duplicates.length) corrected.actif = 0
    if (apply) {
      if (duplicates.length) await connection.execute('UPDATE complements_verbaux SET actif=0 WHERE id=?', [row.id])
      else await connection.execute('UPDATE complements_verbaux SET texte=?,texte_antepose=?,actif=? WHERE id=?',
        [corrected.texte, corrected.texte_antepose, corrected.actif, row.id])
    }
    if (corrected.actif === 0) report.disabled += 1
    else report.replaced += 1
  }
  return report
}
