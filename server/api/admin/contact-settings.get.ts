import { getContactSettings } from '../../services/contact-settings'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return { settings: await getContactSettings() }
})
