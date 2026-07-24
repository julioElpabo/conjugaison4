<script setup lang="ts">
import type { AppLocale } from '~~/shared/i18n/locales'
import { guidedTourCopy } from '~~/shared/i18n/guided-tour'

const { ui, interfaceLocale, setInterfaceLocale, localePath } = useLanguagePreferences()
const route = useRoute()
const { applyTheme } = useColorTheme()
const isDark = ref(false)
const localizedSectionPath = computed(() => route.path.replace(/^\/(?:fr|de|en|it|es)(?=\/|$)/u, '') || '/')
const isAdminRoute = computed(() => localizedSectionPath.value === '/admin' || localizedSectionPath.value.startsWith('/admin/'))
const themeSwitchTitle = computed(() => isDark.value ? ui('Activer le mode clair') : ui('Activer le mode sombre'))
const languageOptions = computed<{ value: AppLocale, label: string, flag: string }[]>(() => [
  { value: 'fr', label: ui('Français'), flag: '🇫🇷' },
  { value: 'de', label: ui('Allemand'), flag: '🇩🇪' },
  { value: 'en', label: ui('Anglais'), flag: '🇬🇧' },
  { value: 'it', label: ui('Italien'), flag: '🇮🇹' },
  { value: 'es', label: ui('Espagnol'), flag: '🇪🇸' },
])
const homeResetRequested = useState('home-reset-requested', () => false)
const guidedTourRequested = useState('guided-tour-requested', () => false)
const wizardAtHome = useState('wizard-at-home', () => true)
const tourCopy = computed(() => guidedTourCopy(interfaceLocale.value))
const isActualHomePage = computed(() => localizedSectionPath.value === '/' && wizardAtHome.value)

onMounted(() => {
  const activeTheme = document.documentElement.dataset.theme
  if (activeTheme === 'light' || activeTheme === 'dark') {
    isDark.value = activeTheme === 'dark'
    applyTheme(activeTheme, false)
  }
})

function toggleTheme() {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  const updateTheme = () => {
    isDark.value = nextTheme === 'dark'
    applyTheme(nextTheme)
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

function requestHomeReset() {
  homeResetRequested.value = true
}

async function requestGuidedTour() {
  guidedTourRequested.value = true
  if (localizedSectionPath.value !== '/') {
    await navigateTo(localePath('/'))
  }
}
const activeSection = computed(() => {
  if (localizedSectionPath.value === '/consulter' || localizedSectionPath.value.startsWith('/consulter/')) return 'consulter'
  if (localizedSectionPath.value === '/apprendre' || localizedSectionPath.value.startsWith('/apprendre/')) return 'apprendre'
  if (!isAdminRoute.value) return 'exercer'
  return ''
})
</script>

<template>
  <div class="site-shell">
    <header class="site-header">
      <div class="site-header__inner">
        <div class="site-header__identity">
          <NuxtLink class="site-brand" :to="localePath('/')">
            <strong>TATITOTU</strong>
            <span>{{ ui('Défis de conjugaison') }}</span>
          </NuxtLink>
          <button
            v-if="!isActualHomePage"
            class="site-tour-button"
            type="button"
            :title="tourCopy.navLabel"
            @click="requestGuidedTour"
          >
            <span aria-hidden="true">?</span>
            <span>{{ tourCopy.navLabel }}</span>
          </button>
        </div>
        <nav class="site-navigation" :aria-label="ui('Navigation principale')">
          <NuxtLink class="site-navigation__home" :to="localePath('/')" :aria-label="ui('Accueil')" :title="ui('Accueil')" @click="requestHomeReset">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M3 11.2 12 4l9 7.2" />
              <path d="M5.5 10.7V20h4.8v-5.4h3.4V20h4.8v-9.3" />
            </svg>
          </NuxtLink>
          <NuxtLink :to="localePath('/')" :class="{ 'is-active': activeSection === 'exercer' }" :aria-current="activeSection === 'exercer' ? 'page' : undefined"> {{ ui('S’exercer') }} </NuxtLink>
          <NuxtLink :to="localePath('/consulter')" :class="{ 'is-active': activeSection === 'consulter' }" :aria-current="activeSection === 'consulter' ? 'page' : undefined"> {{ ui('Consulter') }} </NuxtLink>
          <NuxtLink :to="localePath('/apprendre')" :class="{ 'is-active': activeSection === 'apprendre' }" :aria-current="activeSection === 'apprendre' ? 'page' : undefined"> {{ ui('Apprendre') }} </NuxtLink>
          <div class="language-selector" role="group" :aria-label="ui('Langue de l’interface')">
            <button
              v-for="option in languageOptions"
              :key="option.value"
              type="button"
              :class="{ 'is-active': interfaceLocale === option.value }"
              :aria-label="option.label"
              :aria-pressed="interfaceLocale === option.value"
              :title="option.label"
              @click="setInterfaceLocale(option.value)"
            >
              <span aria-hidden="true">{{ option.flag }}</span>
            </button>
          </div>
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
            <span class="theme-switch__thumb" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </header>

    <main :class="['site-main', { 'site-main--admin': isAdminRoute }]">
      <slot />
    </main>

    <footer class="site-footer">
      <p>{{ ui('Un outil gratuit pour travailler la conjugaison française.') }}</p>
      <div class="site-footer__links">
        <a href="mailto:christophe.roulet@edu-vd.ch">{{ ui('Contact') }}</a>
        <NuxtLink :to="localePath('/admin')">{{ ui('Administration') }}</NuxtLink>
      </div>
    </footer>
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
  padding: 4px 9px 4px 5px;
  align-items: center;
  justify-content: center;
  gap: 5px;
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

.site-tour-button > span:first-child {
  display: grid;
  width: 18px;
  height: 18px;
  place-items: center;
  color: #493a08;
  border: 1px solid #c99500;
  border-radius: 50%;
  background: #ffd943;
  font-size: .66rem;
  font-weight: 900;
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
  width: 3.9rem;
  height: 2rem;
  flex: 0 0 3.9rem;
  margin-left: 4px;
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

.theme-switch__thumb {
  position: absolute;
  z-index: 2;
  top: .2rem;
  left: .2rem;
  width: 1.5rem;
  height: 1.5rem;
  background: #f7fafb;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgb(0 0 0 / 30%);
  transition: transform .28s cubic-bezier(.22, 1, .36, 1), background-color .25s ease;
}

.theme-switch.is-dark .theme-switch__thumb {
  background: #dce8ec;
  transform: translateX(1.88rem);
}

.theme-switch__icon {
  position: absolute;
  z-index: 1;
  top: 50%;
  display: grid;
  width: 1.5rem;
  height: 1.5rem;
  place-items: center;
  transform: translateY(-50%);
  transition: opacity .2s ease;
}

.theme-switch__icon svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.9;
}

.theme-switch__icon--moon { left: .3rem; opacity: 0; }
.theme-switch__icon--moon svg { fill: currentColor; stroke: none; }
.theme-switch__icon--sun { right: .3rem; opacity: 1; }
.theme-switch.is-dark .theme-switch__icon--moon { opacity: 1; }
.theme-switch.is-dark .theme-switch__icon--sun { opacity: 0; }

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

.site-footer a {
  color: white;
}

.site-footer__links {
  display: flex;
  justify-content: center;
  gap: 18px;
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
    grid-column: 1 / 4;
    justify-self: end;
  }

  .language-selector button {
    width: 1.7rem;
  }

  .theme-switch {
    grid-column: 4;
    justify-self: end;
    margin-left: 2px;
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
