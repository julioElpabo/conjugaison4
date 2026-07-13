import { availableAdminTests } from '../../../services/admin-tests'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  return { tests: await availableAdminTests() }
})
