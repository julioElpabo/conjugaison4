export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  throw createError({ statusCode: 405, statusMessage: 'L’aide permanente d’un caractère ne peut pas être supprimée' })
})
