export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  throw createError({ statusCode: 405, statusMessage: 'Créez l’aide depuis son caractère' })
})
