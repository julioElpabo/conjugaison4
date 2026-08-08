<script setup lang="ts">
import type { AppLocale } from '~~/shared/i18n/locales'
import { guidedTourCopy } from '~~/shared/i18n/guided-tour'
import { learnerSpaceCopy } from '~~/shared/i18n/learner-space'

const { ui, interfaceLocale, setInterfaceLocale, localePath } = useLanguagePreferences()
const { user: learner, checkSession, logout: endLearnerSession } = useLearnerAuth()
const route = useRoute()
const { applyTheme } = useColorTheme()
const { track } = useSiteAnalytics()
const isDark = ref(false)
const localizedSectionPath = computed(() => route.path.replace(/^\/(?:fr|de|en|it|es)(?=\/|$)/u, '') || '/')
const isAdminRoute = computed(() => localizedSectionPath.value === '/admin' || localizedSectionPath.value.startsWith('/admin/'))
const embeddedConsultation = computed(() => localizedSectionPath.value === '/consulter' && route.query.embed === 'challenge')
const themeSwitchTitle = computed(() => isDark.value ? ui('Activer le mode clair') : ui('Activer le mode sombre'))
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
const isActualHomePage = computed(() => localizedSectionPath.value === '/' && wizardAtHome.value)
const activeLanguageOption = computed(() => languageOptions.value.find(option => option.value === interfaceLocale.value) ?? languageOptions.value[0]!)
const learnerMenu = ref<HTMLDetailsElement | null>(null)
const learnerLanguageMenuOpen = ref(false)
const tabletLanguageMenu = ref<HTMLElement | null>(null)
const tabletLanguageMenuOpen = ref(false)
const learnerLoggingOut = ref(false)
const contactDialog = ref<{ open: () => void } | null>(null)
const learnerDisplayName = computed(() => {
  const username = learner.value?.username || ''
  return username ? username.charAt(0).toLocaleUpperCase('fr-CH') + username.slice(1) : ''
})

await checkSession()

watch(() => route.fullPath, () => {
  learnerMenu.value?.removeAttribute('open')
  learnerLanguageMenuOpen.value = false
  tabletLanguageMenuOpen.value = false
})

function closeLearnerMenuOnOutside(event: PointerEvent) {
  const target = event.target
  if (!(target instanceof Node)) return
  if (learnerMenu.value?.open && !learnerMenu.value.contains(target)) {
    learnerMenu.value.removeAttribute('open')
    learnerLanguageMenuOpen.value = false
  }
  if (tabletLanguageMenuOpen.value && tabletLanguageMenu.value && !tabletLanguageMenu.value.contains(target)) {
    tabletLanguageMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', closeLearnerMenuOnOutside)
  track('feature_exposed', { feature: 'language.change' })
  track('feature_exposed', { feature: 'theme.change' })
  const activeTheme = document.documentElement.dataset.theme
  if (activeTheme === 'light' || activeTheme === 'dark') {
    isDark.value = activeTheme === 'dark'
    applyTheme(activeTheme, false)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', closeLearnerMenuOnOutside)
})

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

function selectTabletLanguage(locale: AppLocale) {
  tabletLanguageMenuOpen.value = false
  selectPublicLanguage(locale, 'tablet-menu')
}

function requestHomeReset() {
  homeResetRequested.value = true
}

function requestNewChallenge() {
  newChallengeRequested.value = true
}

async function requestGuidedTour() {
  guidedTourRequested.value = true
  if (localizedSectionPath.value !== '/') {
    await navigateTo(localePath('/'))
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
  return ['history', 'progress', 'preferences', 'account'].includes(tab) ? tab : 'history'
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
  <div class="site-shell" :class="{ 'site-shell--embedded': embeddedConsultation }">
    <header v-if="!embeddedConsultation" class="site-header">
      <div class="site-header__inner">
        <div class="site-header__identity">
          <NuxtLink class="site-brand" :to="localePath('/')">
            <strong>TATITOTU</strong>
            <span>{{ ui('Défis de conjugaison') }}</span>
          </NuxtLink>
          <div v-if="isActualHomePage" class="language-selector language-selector--tablet" role="group" :aria-label="ui('Langue de l’interface')">
            <button
              v-for="option in languageOptions"
              :key="option.value"
              type="button"
              :class="{ 'is-active': interfaceLocale === option.value }"
              :aria-label="option.label"
              :aria-pressed="interfaceLocale === option.value"
              :title="option.label"
              @click="selectPublicLanguage(option.value, 'homepage-tablet')"
            >
              <span aria-hidden="true">{{ option.flag }}</span>
            </button>
          </div>
          <div
            v-else
            ref="tabletLanguageMenu"
            class="tablet-language-menu"
            :class="{ 'is-open': tabletLanguageMenuOpen }"
          >
            <button
              class="tablet-language-menu__trigger"
              type="button"
              :aria-label="ui('Langue de l’interface')"
              :aria-expanded="tabletLanguageMenuOpen"
              :title="activeLanguageOption.label"
              @click="tabletLanguageMenuOpen = !tabletLanguageMenuOpen"
            >
              <span aria-hidden="true">{{ activeLanguageOption.flag }}</span>
            </button>
            <div
              class="language-selector tablet-language-menu__panel"
              role="group"
              :aria-label="ui('Langue de l’interface')"
              :aria-hidden="!tabletLanguageMenuOpen"
            >
              <button
                v-for="option in languageOptions"
                :key="option.value"
                type="button"
                :class="{ 'is-active': interfaceLocale === option.value }"
                :aria-label="option.label"
                :aria-pressed="interfaceLocale === option.value"
                :title="option.label"
                @click="selectTabletLanguage(option.value)"
              >
                <span aria-hidden="true">{{ option.flag }}</span>
              </button>
            </div>
          </div>
          <button
            v-if="!isActualHomePage"
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
            :to="localePath('/')"
            :class="{ 'is-active': activeSection === 'exercer' }"
            :aria-current="activeSection === 'exercer' ? 'page' : undefined"
            @click="requestNewChallenge"
          >
            {{ ui('S’exercer') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/consulter')" :class="{ 'is-active': activeSection === 'consulter' }" :aria-current="activeSection === 'consulter' ? 'page' : undefined"> {{ ui('Consulter') }} </NuxtLink>
          <NuxtLink :to="localePath('/apprendre')" :class="{ 'is-active': activeSection === 'apprendre' }" :aria-current="activeSection === 'apprendre' ? 'page' : undefined"> {{ ui('Apprendre') }} </NuxtLink>
          <details v-if="learner" ref="learnerMenu" class="learner-menu" data-tour="learner-account">
            <summary>
              <span class="learner-menu__avatar" aria-hidden="true">{{ learnerDisplayName.charAt(0) }}</span>
              <span>{{ learnerDisplayName }}</span>
              <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m5 7.5 5 5 5-5" /></svg>
            </summary>
            <div class="learner-menu__panel">
              <NuxtLink
                class="learner-menu__progress"
                :class="{ 'is-active': activeLearnerTab === 'history' }"
                :to="`${localePath('/my-page')}?tab=history`"
              >
                <span aria-hidden="true">✦</span>
                {{ learnerCopy.history }}
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
            <div class="language-selector language-selector--navigation" role="group" :aria-label="ui('Langue de l’interface')">
              <button
                v-for="option in languageOptions"
                :key="option.value"
                type="button"
                :class="{ 'is-active': interfaceLocale === option.value }"
                :aria-label="option.label"
                :aria-pressed="interfaceLocale === option.value"
                :title="option.label"
                @click="selectPublicLanguage(option.value, 'navigation')"
              >
                <span aria-hidden="true">{{ option.flag }}</span>
              </button>
            </div>
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
        <button type="button" @click="contactDialog?.open()">{{ ui('Contact') }}</button>
        <NuxtLink :to="localePath('/admin')">{{ ui('Administration') }}</NuxtLink>
      </div>
    </footer>
    <ContactDialog v-if="!embeddedConsultation" ref="contactDialog" />
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
  background-color: #dcecf3;
  background-image:
    linear-gradient(180deg, rgb(247 252 251 / 52%), rgb(239 247 245 / 62%)),
    url('/images/site-mountains.svg');
  background-blend-mode: normal;
  background-position: center bottom;
  background-size: cover;
}

body::after {
  background-color: #081a31;
  background-image:
    linear-gradient(180deg, rgb(3 14 31 / 88%) 0%, rgb(5 24 38 / 78%) 42%, rgb(4 22 30 / 26%) 70%, transparent 100%),
    url('/images/site-mountains.svg');
  background-blend-mode: normal;
  opacity: 0;
  transition: opacity 1s ease-in-out;
}

:root[data-theme='dark'] body::after {
  opacity: 1;
}

::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 1s;
  animation-timing-function: ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  body::after {
    transition: none;
  }

  .tablet-language-menu__panel,
  .tablet-language-menu__panel button {
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

.language-selector--tablet {
  display: none;
}

.tablet-language-menu {
  display: none;
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

  .language-selector--tablet {
    display: inline-flex;
    margin-left: auto;
  }

  .tablet-language-menu {
    position: relative;
    display: block;
    margin-left: auto;
  }

  .tablet-language-menu__trigger {
    display: grid;
    width: 34px;
    height: 34px;
    padding: 0;
    place-items: center;
    border: 1px solid rgb(255 255 255 / 22%);
    border-radius: 50%;
    background: #455b6c;
    cursor: pointer;
    list-style: none;
  }

  .tablet-language-menu__trigger:focus-visible {
    outline: 3px solid rgb(112 210 232 / 55%);
    outline-offset: 2px;
  }

  .tablet-language-menu__trigger > span {
    font-size: 1.05rem;
    line-height: 1;
  }

  .tablet-language-menu__panel {
    position: absolute;
    z-index: 10;
    top: 0;
    right: calc(100% + 7px);
    width: max-content;
    overflow: hidden;
    visibility: hidden;
    pointer-events: none;
    clip-path: inset(0 0 0 100% round 999px);
    transform: translateX(20px);
    transform-origin: right center;
    box-shadow: 0 8px 22px rgb(14 31 43 / 28%);
    transition:
      clip-path 300ms cubic-bezier(.22, 1, .36, 1),
      transform 300ms cubic-bezier(.22, 1, .36, 1),
      visibility 0s linear 300ms;
  }

  .tablet-language-menu__panel button {
    transform: translateX(150px);
    transition: transform 300ms cubic-bezier(.22, 1, .36, 1);
  }

  .tablet-language-menu.is-open .tablet-language-menu__panel {
    visibility: visible;
    pointer-events: auto;
    clip-path: inset(0 round 999px);
    transform: translateX(0);
    transition-delay: 0s;
  }

  .tablet-language-menu.is-open .tablet-language-menu__panel button {
    transform: translateX(0);
  }

  .language-selector--navigation {
    display: none;
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
    grid-column: 1;
    justify-self: start;
    margin-left: 0;
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
