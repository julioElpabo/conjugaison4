<script setup lang="ts">
import mountainSvgSource from '../../public/images/site-mountains.svg?raw'
import type { AppLocale } from '~~/shared/i18n/locales'
import { guidedTourCopy } from '~~/shared/i18n/guided-tour'
import { learnerSpaceCopy } from '~~/shared/i18n/learner-space'

const { ui, interfaceLocale, setInterfaceLocale, localePath } = useLanguagePreferences()
const { user: learner, checkSession, logout: endLearnerSession } = useLearnerAuth()
const route = useRoute()
const { applyTheme } = useColorTheme()
const { track } = useSiteAnalytics()
const { openPreferences } = useAnalyticsConsent()
const isDark = ref(false)
const isPhoneViewport = ref(false)
const falcMode = useState<boolean>('falc-mode', () => false)
const falcConfirmationOpen = ref(false)
const falcCancelButton = ref<HTMLButtonElement | null>(null)
const localizedSectionPath = computed(() => route.path.replace(/^\/(?:fr|de|en|it|es)(?=\/|$)/u, '') || '/')
const isAdminRoute = computed(() => localizedSectionPath.value === '/admin' || localizedSectionPath.value.startsWith('/admin/'))
const embeddedConsultation = computed(() => localizedSectionPath.value === '/consulter' && route.query.embed === 'challenge')
const themeSwitchTitle = computed(() => isDark.value ? ui('Activer le mode clair') : ui('Activer le mode sombre'))
const falcSwitchTitle = computed(() => falcMode.value ? ui('Désactiver le mode FALC') : ui('Activer le mode FALC'))
const languageOptions = computed<{ value: AppLocale, label: string, flag: string }[]>(() => [
  { value: 'fr', label: ui('Français'), flag: '🇫🇷' },
  { value: 'de', label: ui('Allemand'), flag: '🇩🇪' },
  { value: 'en', label: ui('Anglais'), flag: '🇬🇧' },
  { value: 'it', label: ui('Italien'), flag: '🇮🇹' },
  { value: 'es', label: ui('Espagnol'), flag: '🇪🇸' },
])
const homeResetRequested = useState('home-reset-requested', () => false)
const newChallengeRequested = useState('new-challenge-requested', () => false)
const guidedTourRequested = useState('guided-tour-requested', () => false)
const wizardAtHome = useState('wizard-at-home', () => true)
const tourCopy = computed(() => guidedTourCopy(interfaceLocale.value))
const learnerCopy = computed(() => learnerSpaceCopy(interfaceLocale.value))
const publicChallengesLabel = computed(() => ({
  fr: 'Défis officiels', de: 'Offizielle Aufgaben', en: 'Official challenges', it: 'Sfide ufficiali', es: 'Retos oficiales',
})[interfaceLocale.value])
const isExerciseLandingPage = computed(() => ['/', '/exercices-de-conjugaison'].includes(localizedSectionPath.value))
const isActualHomePage = computed(() => isExerciseLandingPage.value && wizardAtHome.value)
const activeLanguageOption = computed(() => languageOptions.value.find(option => option.value === interfaceLocale.value) ?? languageOptions.value[0]!)
const learnerMenu = ref<HTMLDetailsElement | null>(null)
const learnerLanguageMenuOpen = ref(false)
const headerLanguageMenu = ref<HTMLElement | null>(null)
const headerLanguageMenuOpen = ref(false)
const learnerLoggingOut = ref(false)
const contactDialog = ref<{ open: () => void } | null>(null)
const mountainBackdrop = ref<HTMLElement | null>(null)
let parallaxFrame = 0
let headerLanguageCloseTimer: number | undefined
let phoneMediaQuery: MediaQueryList | undefined
const nightStarsSvg = `<g class="night-stars night-stars--a">
  <circle cx="548" cy="565" r="1.15"/><circle cx="614" cy="618" r=".75"/><circle cx="690" cy="554" r="1.05"/><circle cx="774" cy="644" r=".7"/><circle cx="853" cy="578" r="1.2"/><circle cx="951" cy="625" r=".8"/><circle cx="1042" cy="557" r=".65"/><circle cx="1148" cy="604" r="1.05"/><circle cx="1220" cy="566" r=".8"/>
</g><g class="night-stars night-stars--b">
  <circle cx="570" cy="674" r=".65"/><circle cx="646" cy="584" r=".85"/><circle cx="731" cy="610" r="1.15"/><circle cx="812" cy="550" r=".7"/><circle cx="895" cy="667" r=".9"/><circle cx="985" cy="583" r="1.1"/><circle cx="1080" cy="647" r=".7"/><circle cx="1178" cy="548" r="1.2"/><circle cx="1241" cy="652" r=".65"/>
</g><g class="night-stars night-stars--c">
  <circle cx="532" cy="629" r=".8"/><circle cx="596" cy="545" r=".65"/><circle cx="667" cy="690" r="1.1"/><circle cx="752" cy="571" r=".8"/><circle cx="835" cy="615" r=".65"/><circle cx="922" cy="546" r="1"/><circle cx="1011" cy="689" r=".75"/><circle cx="1105" cy="577" r=".9"/><circle cx="1204" cy="621" r="1.15"/><circle cx="1252" cy="590" r=".65"/>
</g>`
// Prolonge uniquement les fermetures inférieures des silhouettes. Les crêtes et
// les translations de parallaxe restent intactes, mais aucun fond de calque ne
// peut remonter dans le cadre lorsque la page atteint le bas du défilement.
const mountainSvgWithExtendedBottoms = mountainSvgSource
  .replace('169.33 81.75v40.02H502.29l6.53-98.77Z', '169.33 81.75v340.02H502.29l6.53-398.77Z')
  .replace('51.34 41.29 36 112.03H793.29z', '51.34 41.29 36 112.03v300H793.29z')
  .replace('-98.67 19.47v85.36h781.33z', '-98.67 19.47v385.36h781.33z')
  .replace('22 17.5l44 47v194h-801z', '22 17.5l44 47v494h-801z')
  .replace('-35.33 33.56v89.1h632z', '-35.33 33.56v389.1h632z')
  .replace('l26.67 13h36v152h-777.8v-31.33Z', 'l26.67 13h36v452h-777.8v-31.33Z')
  .replace('l-4.05-5.5-9.55-9.71v114.51h337.13Z', 'l-4.05-5.5-9.55-9.71v414.51h337.13Z')
  .replace('h497.33l2.92-65.75Z', 'v300h497.33l2.92-365.75Z')
const mountainSvg = mountainSvgWithExtendedBottoms
  .replace('<defs>', `<defs>
    <linearGradient id="night-far-gradient" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#5f8295"/><stop offset="1" stop-color="#294359"/>
    </linearGradient>
    <linearGradient id="night-middle-gradient" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#4b7083"/><stop offset="1" stop-color="#1e3a50"/>
    </linearGradient>
    <linearGradient id="night-near-gradient" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#3b6174"/><stop offset="1" stop-color="#153044"/>
    </linearGradient>
    <linearGradient id="night-front-gradient" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#2c5264"/><stop offset="1" stop-color="#0c2638"/>
    </linearGradient>
    <linearGradient id="night-trees-gradient" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#153746"/><stop offset="1" stop-color="#040e17"/>
    </linearGradient>`)
  .replace('<g id="OBJECTS" style="clip-path:url(#clippath)">', `${nightStarsSvg}<g id="OBJECTS" style="clip-path:url(#clippath)"><g class="mountain-layer mountain-layer--far">`)
  .replace('<path d="m1271.29 743.13', '</g><g class="mountain-layer mountain-layer--middle"><path d="m1271.29 743.13')
  .replace('<path d="M481.29 871.29', '</g><g class="mountain-layer mountain-layer--near"><path d="M481.29 871.29')
  .replace('<path d="M1129.96 997.64', '</g><g class="mountain-layer mountain-layer--front"><path d="M1129.96 997.64')
  .replace('<path d="M1099.96 522.96', '</g><g class="mountain-layer mountain-layer--clouds"><path d="M1099.96 522.96')
  .replace('<path d="M845.96 1050.29', '</g><g class="mountain-layer mountain-layer--trees"><path d="M845.96 1050.29')
  .replace('</g></g></svg>', '</g></g></g></svg>')
const learnerDisplayName = computed(() => {
  const username = learner.value?.username || ''
  return username ? username.charAt(0).toLocaleUpperCase('fr-CH') + username.slice(1) : ''
})

await checkSession()

watch(() => route.fullPath, () => {
  learnerMenu.value?.removeAttribute('open')
  learnerLanguageMenuOpen.value = false
  closeHeaderLanguageMenu()
})

function cancelHeaderLanguageMenuClose() {
  if (headerLanguageCloseTimer === undefined) return
  window.clearTimeout(headerLanguageCloseTimer)
  headerLanguageCloseTimer = undefined
}

function closeHeaderLanguageMenu() {
  cancelHeaderLanguageMenuClose()
  headerLanguageMenuOpen.value = false
}

function scheduleHeaderLanguageMenuClose() {
  cancelHeaderLanguageMenuClose()
  headerLanguageCloseTimer = window.setTimeout(() => {
    headerLanguageCloseTimer = undefined
    headerLanguageMenuOpen.value = false
  }, 1_000)
}

function toggleHeaderLanguageMenu() {
  cancelHeaderLanguageMenuClose()
  headerLanguageMenuOpen.value = !headerLanguageMenuOpen.value
}

function closeLearnerMenuOnOutside(event: PointerEvent) {
  const target = event.target
  if (!(target instanceof Node)) return
  if (learnerMenu.value?.open && !learnerMenu.value.contains(target)) {
    learnerMenu.value.removeAttribute('open')
    learnerLanguageMenuOpen.value = false
  }
  if (headerLanguageMenuOpen.value && headerLanguageMenu.value && !headerLanguageMenu.value.contains(target)) {
    closeHeaderLanguageMenu()
  }
}

function handleFalcConfirmationKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && falcConfirmationOpen.value) closeFalcConfirmation()
}

function syncPhoneViewport() {
  isPhoneViewport.value = phoneMediaQuery?.matches === true
}

onMounted(() => {
  phoneMediaQuery = window.matchMedia('(max-width: 640px)')
  syncPhoneViewport()
  phoneMediaQuery.addEventListener('change', syncPhoneViewport)
  document.addEventListener('pointerdown', closeLearnerMenuOnOutside)
  document.addEventListener('keydown', handleFalcConfirmationKeydown)
  window.addEventListener('scroll', updateMountainParallax, { passive: true })
  window.addEventListener('resize', updateMountainParallax, { passive: true })
  updateMountainParallax()
  track('feature_exposed', { feature: 'language.change' })
  track('feature_exposed', { feature: 'theme.change' })
  const activeTheme = document.documentElement.dataset.theme
  if (activeTheme === 'light' || activeTheme === 'dark') {
    isDark.value = activeTheme === 'dark'
    applyTheme(activeTheme, false)
  }
  falcMode.value = document.documentElement.dataset.falcMode === 'true'
})

onBeforeUnmount(() => {
  phoneMediaQuery?.removeEventListener('change', syncPhoneViewport)
  document.removeEventListener('pointerdown', closeLearnerMenuOnOutside)
  document.removeEventListener('keydown', handleFalcConfirmationKeydown)
  window.removeEventListener('scroll', updateMountainParallax)
  window.removeEventListener('resize', updateMountainParallax)
  window.cancelAnimationFrame(parallaxFrame)
  cancelHeaderLanguageMenuClose()
})

function updateMountainParallax() {
  if (parallaxFrame) return
  parallaxFrame = window.requestAnimationFrame(() => {
    parallaxFrame = 0
    const backdrop = mountainBackdrop.value
    if (!backdrop || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const maximumScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    const progress = maximumScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maximumScroll)) : 0
    backdrop.style.setProperty('--mountain-far-y', `${progress * -22.5}px`)
    backdrop.style.setProperty('--mountain-middle-y', `${progress * -54}px`)
    backdrop.style.setProperty('--mountain-near-y', `${progress * -90}px`)
    backdrop.style.setProperty('--mountain-front-y', `${progress * -126}px`)
    backdrop.style.setProperty('--mountain-clouds-y', `${progress * -13.5}px`)
    backdrop.style.setProperty('--mountain-trees-y', `${progress * -162}px`)
  })
}

function toggleTheme() {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  track('feature_selected', { feature: 'theme.change', item: nextTheme })
  const updateTheme = () => {
    isDark.value = nextTheme === 'dark'
    applyTheme(nextTheme)
    track('feature_completed', { feature: 'theme.change', item: nextTheme })
  }
  const viewTransitionDocument = document as Document & {
    startViewTransition?: (update: () => void) => unknown
  }
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && viewTransitionDocument.startViewTransition) {
    viewTransitionDocument.startViewTransition(updateTheme)
    return
  }
  updateTheme()
}

function toggleFalcMode() {
  if (falcMode.value) {
    setFalcMode(false)
    return
  }
  falcConfirmationOpen.value = true
  nextTick(() => falcCancelButton.value?.focus())
}

function setFalcMode(enabled: boolean) {
  falcMode.value = enabled
  falcConfirmationOpen.value = false
  document.documentElement.dataset.falcMode = enabled ? 'true' : 'false'
  localStorage.setItem('conjugaison.falc-mode', String(enabled))
  track('feature_selected', { feature: 'accessibility.falc', item: enabled ? 'enabled' : 'disabled' })
}

function closeFalcConfirmation() {
  falcConfirmationOpen.value = false
}

function trackLanguageChoice(locale: AppLocale, source: string) {
  if (locale === interfaceLocale.value) return false
  track('language_tested', {
    locale,
    previousLocale: interfaceLocale.value,
    source,
  })
  track('feature_selected', { feature: 'language.change', item: locale })
  return true
}

function selectPublicLanguage(locale: AppLocale, source: string) {
  if (!trackLanguageChoice(locale, source)) return
  setInterfaceLocale(locale)
  track('feature_completed', { feature: 'language.change', item: locale })
}

function selectHeaderLanguage(locale: AppLocale) {
  closeHeaderLanguageMenu()
  selectPublicLanguage(locale, 'header-menu')
}

function closeHeaderLanguageMenuOnFocusOut(event: FocusEvent) {
  const nextTarget = event.relatedTarget
  if (!(nextTarget instanceof Node) || !headerLanguageMenu.value?.contains(nextTarget)) {
    closeHeaderLanguageMenu()
  }
}

function requestHomeReset() {
  homeResetRequested.value = true
}

function requestNewChallenge() {
  newChallengeRequested.value = true
}

async function requestGuidedTour() {
  guidedTourRequested.value = true
  if (!isExerciseLandingPage.value) {
    await navigateTo(localePath('/exercices-de-conjugaison'))
  }
}

async function logoutLearner() {
  if (learnerLoggingOut.value) return
  learnerLoggingOut.value = true
  try {
    await endLearnerSession()
    learnerMenu.value?.removeAttribute('open')
    await navigateTo(localePath('/signin'))
  }
  finally {
    learnerLoggingOut.value = false
  }
}
const activeLearnerTab = computed(() => {
  if (localizedSectionPath.value !== '/my-page') return ''
  const tab = String(route.query.tab || 'history')
  return ['saved', 'history', 'progress', 'preferences', 'account'].includes(tab) ? tab : 'history'
})

async function selectLearnerLanguage(locale: AppLocale) {
  learnerLanguageMenuOpen.value = false
  if (!trackLanguageChoice(locale, 'learner-menu')) return
  setInterfaceLocale(locale)
  try {
    await $fetch('/api/learner/preferences', {
      method: 'PUT',
      body: {
        interfaceLocale: locale,
        colorTheme: isDark.value ? 'dark' : 'light',
      },
    })
    track('feature_completed', { feature: 'language.change', item: locale })
  }
  catch {
    track('feature_failed', { feature: 'language.change', item: locale })
    // Le choix reste actif localement même si sa mémorisation échoue.
  }
  learnerMenu.value?.removeAttribute('open')
}
const activeSection = computed(() => {
  if (localizedSectionPath.value === '/consulter' || localizedSectionPath.value.startsWith('/consulter/')) return 'consulter'
  if (localizedSectionPath.value === '/apprendre' || localizedSectionPath.value.startsWith('/apprendre/') || /^\/(?:indicatif|subjonctif|conditionnel|imperatif|participe)\//u.test(localizedSectionPath.value) || localizedSectionPath.value === '/exercices' || localizedSectionPath.value.startsWith('/exercices/')) return 'apprendre'
  if (!isAdminRoute.value) return 'exercer'
  return ''
})
</script>

<template>
  <div class="site-shell" :class="{ 'site-shell--embedded': embeddedConsultation, 'site-shell--falc': falcMode, 'site-shell--home': isActualHomePage }">
    <div
      ref="mountainBackdrop"
      class="mountain-backdrop"
      aria-hidden="true"
      v-html="mountainSvg"
    />
    <header v-if="!embeddedConsultation" class="site-header">
      <div class="site-header__inner">
        <div class="site-header__identity">
          <NuxtLink class="site-brand" :to="localePath('/')">
            <strong>TATITOTU</strong>
            <span v-if="isActualHomePage">{{ ui('Défis de conjugaison') }}</span>
          </NuxtLink>
          <AdminDailySessionsBadge />
          <button
            v-if="!isActualHomePage && !falcMode && !isPhoneViewport"
            class="site-tour-button"
            type="button"
            :title="tourCopy.navLabel"
            @click="requestGuidedTour"
          >
            <span class="site-tour-button__label">{{ tourCopy.navLabel }}</span>
            <span class="site-tour-button__tablet-icon" aria-hidden="true">i</span>
          </button>
        </div>
        <nav class="site-navigation" :aria-label="ui('Navigation principale')">
          <NuxtLink class="site-navigation__home" :to="localePath('/')" :aria-label="ui('Accueil')" :title="ui('Accueil')" @click="requestHomeReset">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M3 11.2 12 4l9 7.2" />
              <path d="M5.5 10.7V20h4.8v-5.4h3.4V20h4.8v-9.3" />
            </svg>
          </NuxtLink>
          <NuxtLink
            :to="localePath('/exercices-de-conjugaison')"
            :class="{ 'is-active': activeSection === 'exercer' }"
            :aria-current="activeSection === 'exercer' ? 'page' : undefined"
            @click="requestNewChallenge"
          >
            {{ ui('S’exercer') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/consulter')" :class="{ 'is-active': activeSection === 'consulter' }" :aria-current="activeSection === 'consulter' ? 'page' : undefined"> {{ ui('Consulter') }} </NuxtLink>
          <NuxtLink :to="localePath('/apprendre')" :class="{ 'is-active': activeSection === 'apprendre' }" :aria-current="activeSection === 'apprendre' ? 'page' : undefined"> {{ ui('Apprendre') }} </NuxtLink>
          <div class="display-mode-switches">
            <button
              class="theme-switch"
              :class="{ 'is-dark': isDark }"
              type="button"
              role="switch"
              :aria-checked="isDark"
              :aria-label="themeSwitchTitle"
              :title="themeSwitchTitle"
              @click="toggleTheme"
            >
              <span class="theme-switch__icon theme-switch__icon--moon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M20.1 15.4A8.7 8.7 0 0 1 8.6 3.9 8.8 8.8 0 1 0 20.1 15.4Z" /></svg>
              </span>
              <span class="theme-switch__icon theme-switch__icon--sun" aria-hidden="true">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
              </span>
            </button>
            <button
              class="falc-switch"
              data-tour="falc-mode"
              :class="{ 'is-active': falcMode }"
              type="button"
              role="switch"
              :aria-checked="falcMode"
              :aria-label="falcSwitchTitle"
              :title="falcSwitchTitle"
              @click="toggleFalcMode"
            >{{ ui('FALC') }}</button>
          <div
            ref="headerLanguageMenu"
            class="header-language-menu"
            :class="{ 'is-open': headerLanguageMenuOpen }"
            @mouseenter="cancelHeaderLanguageMenuClose"
            @mouseleave="scheduleHeaderLanguageMenuClose"
            @focusout="closeHeaderLanguageMenuOnFocusOut"
          >
            <button
              class="header-language-menu__trigger"
              type="button"
              :aria-label="ui('Langue de l’interface')"
              :aria-expanded="headerLanguageMenuOpen"
              :title="activeLanguageOption.label"
              @click="toggleHeaderLanguageMenu"
            >
              <span aria-hidden="true">{{ activeLanguageOption.flag }}</span>
            </button>
            <div
              class="language-selector header-language-menu__panel"
              role="group"
              :aria-label="ui('Langue de l’interface')"
              :aria-hidden="!headerLanguageMenuOpen"
            >
              <button
                v-for="option in languageOptions"
                :key="option.value"
                type="button"
                :class="{ 'is-active': interfaceLocale === option.value }"
                :aria-label="option.label"
                :aria-pressed="interfaceLocale === option.value"
                :title="option.label"
                @click="selectHeaderLanguage(option.value)"
              >
                <span aria-hidden="true">{{ option.flag }}</span>
              </button>
            </div>
          </div>
          </div>
          <details v-if="learner" ref="learnerMenu" class="learner-menu" data-tour="learner-account">
            <summary>
              <span class="learner-menu__avatar" aria-hidden="true">{{ learnerDisplayName.charAt(0) }}</span>
              <span>{{ learnerDisplayName }}</span>
              <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m5 7.5 5 5 5-5" /></svg>
            </summary>
            <div class="learner-menu__panel">
              <NuxtLink
                :to="`${localePath('/my-page')}?tab=saved`"
                :class="{ 'is-active': activeLearnerTab === 'saved' }"
              >
                {{ learnerCopy.myChallenges }}
              </NuxtLink>
              <NuxtLink
                class="learner-menu__progress"
                :class="{ 'is-active': activeLearnerTab === 'history' }"
                :to="`${localePath('/my-page')}?tab=history`"
              >
                <span aria-hidden="true">✦</span>
                {{ learnerCopy.account }}
              </NuxtLink>
              <NuxtLink
                :to="`${localePath('/my-page')}?tab=progress`"
                :class="{ 'is-active': activeLearnerTab === 'progress' }"
              >
                {{ learnerCopy.commonErrors }}
              </NuxtLink>
              <div class="learner-menu__separator" role="separator" />
              <NuxtLink
                :to="`${localePath('/my-page')}?tab=preferences`"
                :class="{ 'is-active': activeLearnerTab === 'preferences' }"
              >
                {{ learnerCopy.preferences }}
              </NuxtLink>
              <div class="learner-menu__language">
                <button
                  class="learner-menu__language-trigger"
                  type="button"
                  :aria-expanded="learnerLanguageMenuOpen"
                  :aria-label="learnerCopy.changeLanguage"
                  @click="learnerLanguageMenuOpen = !learnerLanguageMenuOpen"
                >
                  <span>{{ learnerCopy.changeLanguage }}</span>
                  <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m7.5 5 5 5-5 5" /></svg>
                </button>
                <div
                  v-if="learnerLanguageMenuOpen"
                  class="learner-menu__language-options"
                  role="group"
                  :aria-label="ui('Langue de l’interface')"
                >
                  <button
                    v-for="option in languageOptions"
                    :key="option.value"
                    type="button"
                    :class="{ 'is-active': interfaceLocale === option.value }"
                    :aria-label="option.label"
                    :aria-pressed="interfaceLocale === option.value"
                    :title="option.label"
                    @click="selectLearnerLanguage(option.value)"
                  >
                    <span aria-hidden="true">{{ option.flag }}</span>
                  </button>
                </div>
              </div>
              <NuxtLink
                :to="`${localePath('/my-page')}?tab=account#change-password`"
                :class="{ 'is-active': activeLearnerTab === 'account' }"
              >
                {{ ui('Changer mon mot de passe') }}
              </NuxtLink>
              <button type="button" :disabled="learnerLoggingOut" @click="logoutLearner">
                {{ learnerLoggingOut ? ui('Déconnexion…') : ui('Me déconnecter') }}
              </button>
            </div>
          </details>
          <template v-else>
            <NuxtLink class="site-login-button" data-tour="learner-account" :to="localePath('/signin')">
              {{ ui('Connexion') }}
            </NuxtLink>
          </template>
        </nav>
      </div>
    </header>

    <main :class="['site-main', { 'site-main--admin': isAdminRoute, 'site-main--embedded': embeddedConsultation }]">
      <slot />
    </main>

    <footer v-if="!embeddedConsultation" class="site-footer">
      <p>{{ ui('Un outil gratuit pour travailler la conjugaison française.') }}</p>
      <div class="site-footer__links">
        <NuxtLink :to="localePath('/defis')">{{ publicChallengesLabel }}</NuxtLink>
        <button type="button" @click="contactDialog?.open()">{{ ui('Contact') }}</button>
        <button type="button" @click="openPreferences">{{ ui('Statistiques') }}</button>
        <NuxtLink :to="localePath('/admin')">{{ ui('Administration') }}</NuxtLink>
      </div>
    </footer>
    <Teleport to="body">
      <div v-if="falcConfirmationOpen" class="falc-confirmation" @click.self="closeFalcConfirmation">
        <section role="dialog" aria-modal="true" aria-labelledby="falc-confirmation-title" aria-describedby="falc-confirmation-description">
          <h2 id="falc-confirmation-title">{{ ui('Mode FALC') }}</h2>
          <p id="falc-confirmation-description">{{ ui('Le mode FALC affiche seulement l’essentiel. Les mots et les étapes sont plus simples.') }}</p>
          <div class="falc-confirmation__actions">
            <button ref="falcCancelButton" type="button" class="falc-confirmation__cancel" @click="closeFalcConfirmation">← {{ ui('Pas maintenant') }}</button>
            <button type="button" class="falc-confirmation__confirm" @click="setFalcMode(true)">{{ ui('Mode FALC') }} →</button>
          </div>
        </section>
      </div>
    </Teleport>
    <ContactDialog v-if="!embeddedConsultation" ref="contactDialog" />
    <AnalyticsConsentDialog v-if="!isAdminRoute" />
  </div>
</template>

<style>
:root {
  color-scheme: light;
  --ink: #243247;
  --muted: #667085;
  --surface: #ffffff;
  --surface-soft: #f4f8fb;
  --line: #d9e2ea;
  --brand: #176b87;
  --brand-dark: #0e4e65;
  --accent: #e58b2b;
  --success: #34895f;
  --danger: #b42318;
  --shadow: 0 18px 50px rgb(36 50 71 / 10%);
  font-family: "Funnel Sans", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

:root[data-theme='dark'] {
  color-scheme: dark;
  --ink: #dce8e6;
  --muted: #a7b8b6;
  --surface: #182523;
  --surface-soft: #202f2c;
  --line: #3a4b47;
  --paper: #182523;
  --soft: #202f2c;
  --brand: #6db9aa;
  --brand-dark: #a5ddd2;
  --brand-pale: #263f39;
  --accent: #e8a65d;
  --accent-pale: #3d3022;
  --success: #70c596;
  --success-pale: #203b2d;
  --danger: #f08d86;
  --danger-pale: #452725;
  --blue: #78b6d3;
  --shadow: 0 18px 52px rgb(0 0 0 / 28%);
}

/* Les titres et graisses restent volontairement aérés sur l’ensemble du site. */
:is(h1, h2, h3, h4, h5, h6, strong, b) {
  letter-spacing: .018em;
}

/* Les deux surfaces d'exercice gardent les réglages de lecture utiles,
   indépendamment des autres pages du site. */
:is(.exercise-overlay, .chat-overlay) {
  font-family: Arial, Verdana, ui-sans-serif, system-ui, sans-serif;
  font-size: 112.5%;
  line-height: 1.5;
}

:root:not([data-theme='dark']) :is(.exercise-overlay, .chat-overlay) {
  --surface: #fffdf5;
  --surface-soft: #f7f3e7;
  --line: #d8d1bf;
}

:is(.exercise-overlay, .chat-overlay) :is(p, li, dd, blockquote, figcaption, label) {
  letter-spacing: .03em;
  line-height: 1.5;
  word-spacing: .08em;
}

:is(.exercise-overlay, .chat-overlay) :is(h1, h2, h3, h4, h5, h6) {
  letter-spacing: normal;
  line-height: 1.3;
}

:is(.exercise-overlay, .chat-overlay) :is(button, a, input, select, textarea) {
  font-family: inherit;
}

:is(.exercise-overlay, .chat-overlay) button {
  text-overflow: clip;
  white-space: normal;
}

* {
  box-sizing: border-box;
}

html {
  min-width: 320px;
  background: #edf8fb;
}

body {
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  margin: 0;
  color: var(--ink);
  background-color: #dcecf3;
}

body::before,
body::after {
  position: fixed;
  z-index: -1;
  inset: 0;
  content: "";
  pointer-events: none;
  background: linear-gradient(180deg, rgb(247 252 251 / 52%), rgb(239 247 245 / 62%));
}

body::before {
  opacity:1;
  transition:opacity 1s ease-in-out;
}

body::after {
  background: linear-gradient(180deg, rgb(3 14 31 / 88%) 0%, rgb(5 24 38 / 78%) 42%, rgb(4 22 30 / 26%) 70%, transparent 100%);
  opacity: 0;
  transition: opacity 1s ease-in-out;
}

:root[data-theme='dark'] body::after {
  background:
    radial-gradient(ellipse at 78% 12%,transparent 0 18%,rgb(1 7 15 / 7%) 52%,rgb(0 4 9 / 28%) 100%),
    linear-gradient(180deg,rgb(0 5 13 / 3%) 0%,rgb(1 9 17 / 10%) 58%,rgb(0 5 10 / 31%) 100%);
  opacity: 1;
}

:root[data-theme='dark'] body::before {
  opacity:0;
}

::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 1s;
  animation-timing-function: ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  .mountain-backdrop .mountain-layer {
    transform: none;
    will-change: auto;
  }

  :root[data-theme='dark'] .site-shell--home .mountain-backdrop .night-stars circle {
    opacity: .78;
    animation: none;
    filter: drop-shadow(0 0 2px rgb(205 238 255 / 65%));
  }

  body::after {
    transition: none;
  }


  body::before {
    transition:none;
  }

  .header-language-menu__panel,
  .header-language-menu__panel button {
    transition: none !important;
  }
}

button,
input,
select,
textarea {
  font: inherit;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

a {
  color: var(--brand-dark);
}

.site-shell {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.mountain-backdrop {
  position: fixed;
  z-index: -2;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  background: #dcecf3;
  --mountain-far-y: 0px;
  --mountain-middle-y: 0px;
  --mountain-near-y: 0px;
  --mountain-front-y: 0px;
  --mountain-clouds-y: 0px;
  --mountain-trees-y: 0px;
}

.mountain-backdrop::before,
.mountain-backdrop::after {
  position: absolute;
  inset: 0;
  content: "";
  pointer-events: none;
  opacity: 0;
  transition: opacity 1s ease-in-out;
}

.mountain-backdrop::before {
  z-index: 0;
  background:
    radial-gradient(circle at 80% 11%,rgb(226 238 246 / 92%) 0 17px,rgb(171 202 223 / 52%) 18px 20px,transparent 22px),
    radial-gradient(circle at 11% 14%, rgb(210 231 255 / 72%) 0 1px, transparent 1.7px),
    radial-gradient(circle at 29% 8%, rgb(190 220 255 / 55%) 0 1px, transparent 1.6px),
    radial-gradient(circle at 47% 19%, rgb(225 239 255 / 58%) 0 1px, transparent 1.8px),
    radial-gradient(circle at 68% 9%, rgb(203 229 255 / 68%) 0 1px, transparent 1.7px),
    radial-gradient(circle at 86% 22%, rgb(181 216 255 / 48%) 0 1px, transparent 1.6px),
    radial-gradient(ellipse at 80% 13%,rgb(145 187 218 / 28%) 0,transparent 34%),
    linear-gradient(180deg,#07111f 0%,#102536 50%,#183744 100%);
}

.mountain-backdrop::after {
  z-index: 2;
  background:
    radial-gradient(ellipse at 79% 23%,rgb(157 197 220 / 13%) 0,transparent 43%),
    linear-gradient(180deg,transparent 24%,rgb(116 157 174 / 5%) 46%,rgb(101 153 164 / 14%) 68%,transparent 94%),
    radial-gradient(ellipse at 50% 69%,rgb(122 171 178 / 12%) 0,transparent 65%);
}

:root[data-theme='dark'] .mountain-backdrop::before,
:root[data-theme='dark'] .mountain-backdrop::after {
  opacity: 1;
}

.mountain-backdrop > svg {
  position: absolute;
  z-index: 1;
  inset: -180px -8vw;
  width: 116vw;
  height: calc(100vh + 360px);
  max-width: none;
}

.mountain-backdrop .mountain-layer {
  will-change: transform;
}

.mountain-backdrop .night-stars { opacity: 0; }

:root[data-theme='dark'] .site-shell--home .mountain-backdrop .night-stars {
  opacity: 1;
}

:root[data-theme='dark'] .site-shell--home .mountain-backdrop .night-stars circle {
  fill: #d8efff;
  transform-box: fill-box;
  transform-origin: center;
  animation: night-star-twinkle 3.8s ease-in-out infinite alternate;
}

:root[data-theme='dark'] .site-shell--home .mountain-backdrop .night-stars--b circle {
  fill: #b9deef;
  animation-duration: 5.1s;
  animation-delay: -2.3s;
}

:root[data-theme='dark'] .site-shell--home .mountain-backdrop .night-stars--c circle {
  fill: #e8f5ff;
  animation-duration: 4.4s;
  animation-delay: -3.1s;
}

:root[data-theme='dark'] .site-shell--home .mountain-backdrop .night-stars circle:nth-child(3n + 2) {
  animation-duration: 2.9s;
  animation-delay: -1.7s;
}

:root[data-theme='dark'] .site-shell--home .mountain-backdrop .night-stars circle:nth-child(3n) {
  animation-duration: 6.2s;
  animation-delay: -4.1s;
}

@keyframes night-star-twinkle {
  0%, 24% { opacity: .24; transform: scale(.72); filter: drop-shadow(0 0 0 transparent); }
  58% { opacity: .62; transform: scale(1); filter: drop-shadow(0 0 1px rgb(190 229 255 / 52%)); }
  100% { opacity: 1; transform: scale(1.28); filter: drop-shadow(0 0 3px rgb(205 238 255 / 88%)); }
}

.mountain-backdrop .mountain-layer--far {
  transform: translateY(var(--mountain-far-y));
}

.mountain-backdrop .mountain-layer--middle {
  transform: translateY(var(--mountain-middle-y));
}

.mountain-backdrop .mountain-layer--near {
  transform: translateY(var(--mountain-near-y));
}

.mountain-backdrop .mountain-layer--front {
  transform: translateY(var(--mountain-front-y));
}

.mountain-backdrop .mountain-layer--clouds {
  transform: translateY(var(--mountain-clouds-y));
}

.mountain-backdrop .mountain-layer--trees {
  transform: translateY(var(--mountain-trees-y));
}

/* La nuit est construite par plans de luminance. Les facettes internes du SVG
   prennent la couleur de leur plan : aucun faux contour ne subsiste. */
:root[data-theme='dark'] .mountain-backdrop {
  background:#07111f;
}

:root[data-theme='dark'] .mountain-backdrop #BACKGROUND {
  fill:transparent !important;
}

:root[data-theme='dark'] .mountain-backdrop .mountain-layer path {
  stroke:none !important;
  stroke-width:0 !important;
  mix-blend-mode:normal !important;
}

:root[data-theme='dark'] .mountain-backdrop .mountain-layer circle {
  display:none;
}

:root[data-theme='dark'] .mountain-backdrop .mountain-layer--far {
  opacity:.82;
  filter:none;
}

:root[data-theme='dark'] .mountain-backdrop .mountain-layer--far path {
  fill:url(#night-far-gradient) !important;
}

:root[data-theme='dark'] .mountain-backdrop .mountain-layer--far path:nth-child(2) {
  fill:url(#night-far-gradient) !important;
}

:root[data-theme='dark'] .mountain-backdrop .mountain-layer--far .st15 {
  fill:#172e42 !important;
  opacity:.14 !important;
}

:root[data-theme='dark'] .mountain-backdrop .mountain-layer--middle {
  opacity:.88;
  filter:none;
}

:root[data-theme='dark'] .mountain-backdrop .mountain-layer--middle path {
  fill:url(#night-middle-gradient) !important;
}

:root[data-theme='dark'] .mountain-backdrop .mountain-layer--middle .st3 {
  fill:#adc5d2 !important;
  opacity:.08 !important;
}

:root[data-theme='dark'] .mountain-backdrop .mountain-layer--middle .st15 {
  fill:#102638 !important;
  opacity:.13 !important;
}

:root[data-theme='dark'] .mountain-backdrop .mountain-layer--near {
  opacity:.94;
  filter:blur(.22px);
}

:root[data-theme='dark'] .mountain-backdrop .mountain-layer--near path {
  fill:url(#night-near-gradient) !important;
}

:root[data-theme='dark'] .mountain-backdrop .mountain-layer--near path:nth-of-type(2) {
  fill:#10283b !important;
  opacity:.32 !important;
}

:root[data-theme='dark'] .mountain-backdrop .mountain-layer--near .st3 {
  fill:#9fb9c7 !important;
  opacity:.07 !important;
}

:root[data-theme='dark'] .mountain-backdrop .mountain-layer--front path {
  fill:url(#night-front-gradient) !important;
}

:root[data-theme='dark'] .mountain-backdrop .mountain-layer--front path:nth-of-type(2) {
  fill:#91aeba !important;
  opacity:.06 !important;
}

:root[data-theme='dark'] .mountain-backdrop .mountain-layer--front path:nth-of-type(3) {
  fill:url(#night-front-gradient) !important;
}

:root[data-theme='dark'] .mountain-backdrop .mountain-layer--clouds {
  opacity:.12;
  filter:blur(2.6px);
}

:root[data-theme='dark'] .mountain-backdrop .mountain-layer--clouds path {
  fill:#abc6d7 !important;
}

:root[data-theme='dark'] .mountain-backdrop .mountain-layer--trees path {
  fill:url(#night-trees-gradient) !important;
}

.site-header {
  position: sticky;
  z-index: 100;
  top: 0;
  color: white;
  background: #344758;
  box-shadow: 0 2px 10px rgb(26 42 56 / 18%);
}

.site-header__inner {
  display: flex;
  width: min(1180px, calc(100% - 32px));
  min-height: 68px;
  margin: 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.site-brand {
  display: flex;
  align-items: baseline;
  gap: 10px;
  color: white;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: .06em;
}

.site-header__identity {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 16px;
}

.site-brand strong {
  letter-spacing: .18em;
}

.site-brand span {
  opacity: .82;
  font-size: .88rem;
}

.site-navigation {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.site-navigation a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 14px;
  border: 1px solid transparent;
  border-radius: 999px;
  color: #eaf4f7;
  text-decoration: none;
  font-size: .92rem;
  font-weight: 700;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
}

.site-tour-button {
  display: inline-flex;
  min-height: 32px;
  padding: 5px 10px;
  align-items: center;
  justify-content: center;
  color: #0b4f69;
  border: 2px solid #e4ad00;
  border-radius: 999px;
  background: #fff3a8;
  box-shadow: 0 4px 13px rgb(0 0 0 / 16%), 0 0 0 3px rgb(255 215 43 / 10%);
  cursor: pointer;
  font-size: .76rem;
  font-weight: 750;
  transition: background-color 150ms ease, border-color 150ms ease;
}

.site-tour-button:hover {
  color: #083f54;
  border-color: #c99500;
  background: #ffe978;
  box-shadow: 0 6px 18px rgb(0 0 0 / 20%), 0 0 0 4px rgb(255 215 43 / 20%);
}

.site-tour-button:focus-visible {
  outline: 3px solid rgb(255 215 43 / 72%);
  outline-offset: 2px;
}

.site-tour-button__tablet-icon {
  display: none;
}

.site-navigation__home {
  width: 42px;
  padding-inline: 0 !important;
}

.site-navigation__home svg {
  width: 1.15rem;
  height: 1.15rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.2;
}

.site-navigation a:hover {
  background: rgb(255 255 255 / 9%);
}

.site-navigation a.is-active {
  color: white;
  border-color: rgb(112 210 232 / 50%);
  background: rgb(112 210 232 / 17%);
}

.language-selector {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  color: #eaf4f7;
  background: #455b6c;
  border: 1px solid rgb(255 255 255 / 22%);
  border-radius: 999px;
}

.header-language-menu {
  position: relative;
  display: block;
  flex: 0 0 auto;
}

.header-language-menu.is-open::after {
  position: absolute;
  z-index: 9;
  top: calc(100% - 4px);
  right: -12px;
  width: max(100%, 12.5rem);
  height: 60px;
  content: "";
}

.header-language-menu__trigger {
  display: grid;
  width: 34px;
  height: 34px;
  padding: 0;
  place-items: center;
  color: white;
  border: 1px solid rgb(255 255 255 / 22%);
  border-radius: 50%;
  background: #455b6c;
  cursor: pointer;
}

.header-language-menu__trigger:hover,
.header-language-menu.is-open .header-language-menu__trigger {
  background: #526a7c;
}

.header-language-menu__trigger:focus-visible {
  outline: 3px solid rgb(112 210 232 / 55%);
  outline-offset: 2px;
}

.header-language-menu__trigger > span {
  font-size: 1.05rem;
  line-height: 1;
}

.header-language-menu__panel {
  position: absolute;
  z-index: 10;
  top: calc(100% + 7px);
  right: 0;
  width: max-content;
  visibility: hidden;
  pointer-events: none;
  opacity: 0;
  box-shadow: 0 8px 22px rgb(14 31 43 / 28%);
  transform: translateY(-8px);
  transition:
    opacity 180ms ease,
    transform 180ms ease,
    visibility 0s linear 180ms;
}

.header-language-menu__panel button {
  transform: translateY(-4px);
  transition: transform 180ms ease;
}

.header-language-menu.is-open .header-language-menu__panel {
  visibility: visible;
  pointer-events: auto;
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0s;
}

.header-language-menu.is-open .header-language-menu__panel button {
  transform: translateY(0);
}

.language-selector button {
  display: grid;
  width: 1.85rem;
  height: 1.65rem;
  padding: 0;
  place-items: center;
  background: transparent;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  filter: saturate(.78);
  opacity: .68;
  transition: background-color 150ms ease, filter 150ms ease, opacity 150ms ease, transform 150ms ease;
}

.language-selector button:hover {
  background: rgb(255 255 255 / 10%);
  filter: saturate(1);
  opacity: 1;
  transform: translateY(-1px);
}

.language-selector button.is-active {
  background: rgb(255 255 255 / 18%);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 30%);
  filter: saturate(1.08);
  opacity: 1;
}

.language-selector button:focus-visible {
  outline: 3px solid rgb(112 210 232 / 55%);
  outline-offset: 2px;
}

.language-selector button span {
  font-size: 1.05rem;
  line-height: 1;
}

.learner-menu {
  position: relative;
}

.learner-menu summary {
  display: flex;
  min-height: 38px;
  padding: 4px 10px 4px 5px;
  align-items: center;
  gap: 8px;
  color: white;
  border: 1px solid rgb(255 255 255 / 25%);
  border-radius: 999px;
  background: #7052a0;
  cursor: pointer;
  font-size: .86rem;
  font-weight: 800;
  list-style: none;
}

.learner-menu summary::-webkit-details-marker {
  display: none;
}

.learner-menu summary:hover,
.learner-menu[open] summary {
  background: #8162b2;
}

.learner-menu summary:focus-visible {
  outline: 3px solid rgb(112 210 232 / 55%);
  outline-offset: 2px;
}

.learner-menu__avatar {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  color: #174f62;
  border-radius: 50%;
  background: #d9f0ec;
  font-size: .78rem;
}

.learner-menu summary svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
  transition: transform 150ms ease;
}

.learner-menu[open] summary svg {
  transform: rotate(180deg);
}

.learner-menu__panel {
  position: absolute;
  z-index: 20;
  top: calc(100% + 8px);
  right: 0;
  display: grid;
  width: max-content;
  min-width: 230px;
  padding: 6px;
  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--surface);
  box-shadow: 0 16px 38px rgb(18 35 48 / 24%);
}

.learner-menu__panel a,
.learner-menu__panel button {
  display: flex;
  min-height: 40px;
  padding: 8px 11px;
  align-items: center;
  justify-content: flex-start;
  color: var(--ink);
  border: 0;
  border-radius: 9px;
  background: transparent;
  text-decoration: none;
  font: inherit;
  font-size: .86rem;
  font-weight: 750;
  cursor: pointer;
}

.learner-menu__panel a:hover,
.learner-menu__panel button:hover {
  color: var(--brand-dark);
  background: var(--surface-soft);
}

.learner-menu__panel > a.is-active {
  color: var(--brand-dark);
  background: var(--surface-soft);
}

.learner-menu__panel a.learner-menu__progress {
  gap: 7px;
  color: #5a3b86;
  border: 1px solid color-mix(in srgb, #7052a0 48%, var(--line));
  background: color-mix(in srgb, #7052a0 11%, var(--surface));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, #7052a0 7%, transparent);
}

.learner-menu__panel a.learner-menu__progress:hover {
  border-color: #7052a0;
  background: color-mix(in srgb, #7052a0 17%, var(--surface));
}

.learner-menu__panel a.learner-menu__progress.is-active {
  color: white;
  border-color: #7052a0;
  background: #7052a0;
  box-shadow: 0 7px 18px rgb(75 48 113 / 20%);
}

:root[data-theme='dark'] .learner-menu__panel a.learner-menu__progress:not(.is-active) {
  color: #cdb9f6;
}

.learner-menu__language {
  display: grid;
}

.learner-menu__separator {
  height: 1px;
  margin: 5px 8px;
  background: var(--line);
}

.learner-menu__panel .learner-menu__language-trigger {
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 16px;
  align-items: center;
  justify-items: start;
  gap: 7px;
  text-align: left;
}

.learner-menu__language-trigger svg {
  justify-self: end;
}

.learner-menu__language-options span {
  font-size: 1.05rem;
  line-height: 1;
}

.learner-menu__language-trigger svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
  transition: transform 180ms ease;
}

.learner-menu__language-trigger[aria-expanded='true'] svg {
  transform: rotate(90deg);
}

.learner-menu__language-options {
  display: flex;
  padding: 4px 7px 7px;
  gap: 5px;
}

.learner-menu__panel .learner-menu__language-options button {
  display: grid;
  width: 34px;
  min-height: 32px;
  padding: 0;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface-soft);
}

.learner-menu__panel .learner-menu__language-options button.is-active {
  border-color: #7052a0;
  background: color-mix(in srgb, #7052a0 18%, var(--surface));
  box-shadow: inset 0 0 0 1px #7052a0;
}

.learner-menu__panel button:disabled {
  opacity: .55;
  cursor: wait;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  padding: 0;
  margin: -1px;
  border: 0;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.theme-switch {
  position: relative;
  width: 1.75rem;
  height: 1.75rem;
  flex: 0 0 1.75rem;
  margin-left: 0;
  overflow: hidden;
  padding: 0;
  color: white;
  background: #596b78;
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 999px;
  cursor: pointer;
  box-shadow: inset 0 1px 3px rgb(0 0 0 / 18%);
  transition: background-color .25s ease, border-color .25s ease;
}

.theme-switch:hover { background: #657987; }

.theme-switch:focus-visible {
  outline: 3px solid rgb(112 210 232 / 55%);
  outline-offset: 3px;
}

.theme-switch.is-dark {
  color: #fff4c7;
  background: #263b48;
  border-color: rgb(153 211 224 / 34%);
}

.theme-switch__icon {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 50%;
  display: grid;
  width: 1.35rem;
  height: 1.35rem;
  place-items: center;
  transform: translate(-50%, -50%);
  transition: opacity .2s ease;
}

.theme-switch__icon svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.9;
}

.theme-switch__icon--moon { opacity: 1; }
.theme-switch__icon--moon svg { fill: currentColor; stroke: none; }
.theme-switch__icon--sun { opacity: 0; }
.theme-switch.is-dark .theme-switch__icon--moon { opacity: 0; }
.theme-switch.is-dark .theme-switch__icon--sun { opacity: 1; }

.display-mode-switches { display: inline-flex; align-items: center; gap: 5px; }

.falc-switch {
  min-height: 1.75rem;
  padding: 3px 9px;
  color: white;
  border: 1px solid rgb(255 255 255 / 28%);
  border-radius: 999px;
  background: #596b78;
  cursor: pointer;
  font-size: .72rem;
  font-weight: 900;
  letter-spacing: .035em;
}

.falc-switch:hover { background: #657987; }
.falc-switch.is-active { color: #173d49; border-color: #b8e5ef; background: #dff7fb; }
.falc-switch:focus-visible { outline: 3px solid rgb(112 210 232 / 55%); outline-offset: 3px; }

.falc-confirmation {
  position: fixed;
  z-index: 5000;
  inset: 0;
  display: grid;
  padding: 20px;
  place-items: center;
  background: rgb(18 38 46 / 62%);
  backdrop-filter: blur(5px);
}

.falc-confirmation > section {
  width: min(520px, 100%);
  padding: clamp(28px, 6vw, 44px);
  color: var(--ink);
  border: 2px solid #9bcbd5;
  border-radius: 24px;
  background: white;
  box-shadow: 0 28px 80px rgb(8 28 35 / 38%);
  text-align: center;
}

.falc-confirmation h2 { margin: 0; color: var(--brand-dark); font-size: clamp(1.8rem, 5vw, 2.4rem); }
.falc-confirmation p { margin: 18px 0 30px; color: #43566a; font-size: 1.2rem; font-weight: 650; line-height: 1.55; }
.falc-confirmation__actions { display: flex; justify-content: center; flex-wrap: wrap; gap: 12px; }
.falc-confirmation__actions button { min-height: 52px; padding: 12px 18px; border-radius: 12px; cursor: pointer; font: inherit; font-weight: 850; }
.falc-confirmation__cancel { color: var(--brand-dark); border: 2px solid #b7cacd; background: white; }
.falc-confirmation__confirm { color: white; border: 2px solid var(--brand); background: var(--brand); }
.falc-confirmation__actions button:focus-visible { outline: 4px solid rgb(229 139 43 / 50%); outline-offset: 3px; }

:root[data-theme='dark'] .falc-confirmation {
  background: rgb(2 12 19 / 78%);
}

:root[data-theme='dark'] .falc-confirmation > section {
  color: #dce8e6;
  border-color: #527b7d;
  background: #172725;
  box-shadow: 0 30px 90px rgb(0 0 0 / 62%), 0 0 36px rgb(91 173 172 / 8%);
}

:root[data-theme='dark'] .falc-confirmation h2 { color: #b9e5df; }
:root[data-theme='dark'] .falc-confirmation p { color: #b5c7c5; }

:root[data-theme='dark'] .falc-confirmation__cancel {
  color: #d1e4e2;
  border-color: #52706d;
  background: #223432;
}

:root[data-theme='dark'] .falc-confirmation__cancel:hover { border-color: #75aaa6; background: #2b403d; }

:root[data-theme='dark'] .falc-confirmation__confirm {
  color: #092d2b;
  border-color: #82c9c0;
  background: #82c9c0;
}

:root[data-theme='dark'] .falc-confirmation__confirm:hover { border-color: #a2ddd6; background: #9ad8d0; }

.site-navigation .site-login-button {
  min-height: 2rem;
  padding: 5px 12px;
  color: white;
  border-color: rgb(255 255 255 / 25%);
  background: #7052a0;
}

.site-navigation .site-login-button:hover {
  border-color: rgb(255 255 255 / 25%);
  background: #8162b2;
}

.site-navigation .site-login-button:focus-visible {
  outline: 3px solid rgb(112 210 232 / 55%);
  outline-offset: 2px;
}

.site-main {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  flex: 1;
  padding: 38px 0 64px;
}

.site-main--admin {
  width: calc(100% - 24px);
  max-width: none;
}

.site-main.site-main--embedded {
  width: 100%;
  max-width: none;
  padding: 0;
}

.site-footer {
  min-height: 150px;
  padding: 42px 24px;
  color: #dfe9ef;
  text-align: center;
  background: #344758;
}

.site-footer p {
  margin: 0 0 10px;
}

.site-footer a,
.site-footer button {
  padding: 0;
  border: 0;
  color: white;
  background: transparent;
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}

.site-footer__links {
  display: flex;
  justify-content: center;
  gap: 18px;
}

@media (min-width: 641px) and (max-width: 1024px) {
  .site-header__inner {
    min-height: 0;
    flex-wrap: wrap;
    gap: 7px;
    padding: 10px 0;
  }

  .site-header__identity {
    width: 100%;
    flex: 1 1 100%;
  }

  .site-brand span {
    white-space: nowrap;
  }

  .site-tour-button {
    width: 34px;
    height: 34px;
    min-height: 34px;
    flex: 0 0 34px;
    padding: 0;
    border-radius: 50%;
  }

  .site-tour-button__label {
    display: none;
  }

  .site-tour-button__tablet-icon {
    display: inline;
    font-family: Georgia, serif;
    font-size: 1.05rem;
    font-weight: 900;
    line-height: 1;
  }

  .site-navigation {
    width: 100%;
    flex: 1 1 100%;
    justify-content: center;
    gap: 6px;
  }

  .site-navigation a {
    padding: 8px 11px;
    font-size: .88rem;
  }
}

@media (max-width: 640px) {
  .site-tour-button {
    display: none;
  }

  .site-header__inner {
    width: min(100% - 20px, 1180px);
    min-height: 62px;
    flex-wrap: wrap;
    gap: 6px 12px;
    padding: 10px 0;
  }

  .site-brand span {
    display: none;
  }

  .site-navigation {
    display: grid;
    width: 100%;
    flex: 1 1 100%;
    grid-template-columns: auto repeat(3, minmax(0, 1fr));
    justify-content: center;
    order: 2;
  }

  .site-navigation a {
    min-width: 0;
    padding: 8px 5px;
    text-align: center;
    font-size: .84rem;
  }

  .site-navigation__home {
    width: 38px;
  }

  .language-selector {
    width: max-content;
    grid-column: 2 / 4;
    justify-self: end;
  }

  .language-selector button {
    width: 1.7rem;
  }

  .theme-switch {
    justify-self: start;
    margin-left: 0;
  }

  .display-mode-switches {
    grid-column: 1 / -1;
    justify-self: start;
  }

  .site-navigation .site-login-button {
    grid-column: 4;
    justify-self: end;
    padding-inline: 9px;
  }

  .learner-menu {
    grid-column: 1 / -1;
    justify-self: end;
  }

  .site-main {
    width: min(100% - 20px, 1180px);
    padding-top: 22px;
  }

  .site-main--admin {
    width: calc(100% - 10px);
  }
}
</style>
