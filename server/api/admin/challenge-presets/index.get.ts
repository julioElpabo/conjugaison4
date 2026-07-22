import { getCatalogue } from '../../../services/catalogue'
import { listChallengePresetCategories, listStoredChallengePresets } from '../../../services/challenge-presets'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const database = useDatabase()
  const catalogue = await getCatalogue('fr')
  const [categories, presets] = await Promise.all([
    listChallengePresetCategories(database),
    listStoredChallengePresets(database, catalogue.verbes),
  ])
  return {
    categories,
    presets,
    verbs: catalogue.verbes,
    modes: catalogue.modes,
    tenses: catalogue.temps,
  }
})
