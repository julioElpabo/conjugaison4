export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  throw createError({ statusCode: 405, statusMessage: 'L’association caractère–aide est permanente' })
})
