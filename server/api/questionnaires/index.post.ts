import { generateQuestionnaire, QuestionnaireSelectionError } from '../../services/questionnaire'
import { parseQuestionnaireRequest, PublicInputError } from '../../services/public-api-validation'

export default defineEventHandler(async (event) => {
  let request
  try {
    request = parseQuestionnaireRequest(await readBody<unknown>(event))
  } catch (error) {
    if (error instanceof PublicInputError) {
      throw createError({ statusCode: 400, statusMessage: error.message })
    }
    throw createError({ statusCode: 400, statusMessage: 'Corps JSON invalide' })
  }

  try {
    const questions = await generateQuestionnaire(request)
    if (questions.length === 0) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Aucune question disponible pour cette sélection'
      })
    }
    return questions
  } catch (error) {
    if (error instanceof QuestionnaireSelectionError) {
      throw createError({ statusCode: 400, statusMessage: error.message })
    }
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    console.error('Impossible de générer le questionnaire', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible de générer le questionnaire'
    })
  }
})
