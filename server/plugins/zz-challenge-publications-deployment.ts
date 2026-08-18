import publicationDeployment from '../../shared/data/challenge-publication-deployment.json'
import { applyChallengePublicationDeployment } from '../services/challenge-publication-deployment'
import { useDatabase } from '../utils/database'

// Nitro ne garantit pas l’ordre d’exécution des plugins de migration. La
// première requête attend donc cette synchronisation, après l’initialisation
// de tous les plugins. Une tentative anticipée évite ce coût dans le cas
// habituel et un échec transitoire reste retentable.
export default defineNitroPlugin((nitroApp) => {
  let deploymentPromise: Promise<void> | null = null
  let isReady = false

  const ensureDeployment = () => {
    if (isReady) return Promise.resolve()
    if (deploymentPromise) return deploymentPromise
    deploymentPromise = applyChallengePublicationDeployment(
      useDatabase(),
      publicationDeployment,
    ).then((deployment) => {
      isReady = true
      console.info('[database] Publications des défis officiels prêtes.', deployment)
    }).catch((error) => {
      deploymentPromise = null
      throw error
    })
    return deploymentPromise
  }

  const reportFailure = (error: unknown) => {
    console.error('[database] Échec du déploiement des publications de défis.', error)
  }

  setTimeout(() => {
    void ensureDeployment().catch(reportFailure)
  }, 0)

  nitroApp.hooks.hook('request', async () => {
    await ensureDeployment().catch(reportFailure)
  })
})
