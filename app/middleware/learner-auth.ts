export default defineNuxtRouteMiddleware(async () => {
  const { checkSession } = useLearnerAuth()
  const learner = await checkSession()
  if (!learner) {
    return navigateTo('/fr/signin', { replace: true })
  }
})
