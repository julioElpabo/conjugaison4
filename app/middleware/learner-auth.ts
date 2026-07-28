export default defineNuxtRouteMiddleware(async (to) => {
  const { checkSession } = useLearnerAuth()
  const { localePath } = useLanguagePreferences()
  const learner = await checkSession()
  if (!learner) {
    return navigateTo({
      path: localePath('/signin'),
      query: { redirect: to.fullPath },
    }, { replace: true })
  }
})
