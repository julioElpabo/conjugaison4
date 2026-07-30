import { getContactSettings } from '../services/contact-settings'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, max-age=60')
  const settings = await getContactSettings()
  return {
    enabled: settings.enabled,
    subjectMinLength: settings.subjectMinLength,
    subjectMaxLength: settings.subjectMaxLength,
    messageMinLength: settings.messageMinLength,
    messageMaxLength: settings.messageMaxLength,
  }
})
