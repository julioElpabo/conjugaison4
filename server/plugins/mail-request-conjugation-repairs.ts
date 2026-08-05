import { auditFiniteParadigms, repairMailRequestConjugations } from '../services/mail-request-repairs'
import { useDatabase } from '../utils/database'

export default defineNitroPlugin(async () => {
  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const report = await repairMailRequestConjugations(connection)
    const issues = await auditFiniteParadigms(connection)
    if (issues.length) {
      throw new Error(issues.map(issue => (
        `${issue.infinitive} · ${issue.tense} (${issue.mode}) : personnes ${issue.missingPersonIds.join(', ')}`
      )).join(' ; '))
    }
    await connection.commit()
    console.info(
      '[database] Demandes des utilisateurs contrôlées : '
      + `${report.protegerPresentNous} forme « protégeons », `
      + `${report.malformedPluralParticiples} participe(s) sans s redoublé, `
      + `${report.affaiblirPastSimpleForms} forme(s) d’« affaiblir » ajoutée(s), `
      + `${report.missingDeAccents.verbs} verbe(s) en « dé- » corrigé(s).`,
    )
  } catch (error) {
    await connection.rollback()
    console.error('[database] Échec des réparations issues des demandes utilisateurs.', error)
  } finally {
    connection.release()
  }
})
