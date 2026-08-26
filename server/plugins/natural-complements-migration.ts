import { useDatabase } from '../utils/database'

export default defineNitroPlugin(async () => {
  try {
    const database = useDatabase()
    await database.query(`
      UPDATE complements_verbaux AS complement
      INNER JOIN constructions_verbales AS construction ON construction.id = complement.construction_id
      INNER JOIN verbe_sens AS meaning ON meaning.id = construction.sens_id
      INNER JOIN verbes AS verb ON verb.id = meaning.verbe_id
      SET complement.texte = CASE complement.texte
            WHEN 'mon idée' THEN 'une bonne raison'
            WHEN 'ton idée' THEN 'une grande envie'
            WHEN 'son idée' THEN 'une nouvelle occasion'
            WHEN 'notre idée' THEN 'une forte motivation'
            WHEN 'votre idée' THEN 'une vraie possibilité'
            WHEN 'leur idée' THEN 'une priorité'
          END,
          complement.actif = 1
      WHERE verb.infinitif = 'avoir'
        AND complement.texte IN ('mon idée', 'ton idée', 'son idée', 'notre idée', 'votre idée', 'leur idée')
    `)
    console.info('[database] Compléments naturels du verbe avoir disponibles.')
  }
  catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : ''
    if (code === 'ER_NO_SUCH_TABLE') return
    console.error('[database] Échec de la normalisation des compléments du verbe avoir.', error)
  }
})
