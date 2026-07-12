export default defineEventHandler((event) => {
  return { user: getAdminSession(event) }
})
