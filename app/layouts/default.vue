<script setup lang="ts">
const route = useRoute()
const { applyTheme } = useColorTheme()
const isDark = ref(false)
const isAdminRoute = computed(() => route.path === '/admin' || route.path.startsWith('/admin/'))
const themeSwitchTitle = computed(() => isDark.value ? 'Activer le mode clair' : 'Activer le mode sombre')

onMounted(() => {
  const activeTheme = document.documentElement.dataset.theme
  if (activeTheme === 'light' || activeTheme === 'dark') {
    isDark.value = activeTheme === 'dark'
    applyTheme(activeTheme, false)
  }
})

function toggleTheme() {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  isDark.value = nextTheme === 'dark'
  applyTheme(nextTheme)
}
const activeSection = computed(() => {
  if (route.path === '/consulter' || route.path.startsWith('/consulter/')) return 'consulter'
  if (route.path === '/apprendre' || route.path.startsWith('/apprendre/')) return 'apprendre'
  if (!isAdminRoute.value) return 'exercer'
  return ''
})
</script>

<template>
  <div class="site-shell">
    <header class="site-header">
      <div class="site-header__inner">
        <a class="site-brand" href="/">
          <strong>TATITOTU</strong>
          <span>Défis de conjugaison</span>
        </a>
        <nav class="site-navigation" aria-label="Navigation principale">
          <NuxtLink class="site-navigation__home" to="/" aria-label="Accueil" title="Accueil">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M3 11.2 12 4l9 7.2" />
              <path d="M5.5 10.7V20h4.8v-5.4h3.4V20h4.8v-9.3" />
            </svg>
          </NuxtLink>
          <NuxtLink to="/" :class="{ 'is-active': activeSection === 'exercer' }" :aria-current="activeSection === 'exercer' ? 'page' : undefined">
            S’exercer
          </NuxtLink>
          <NuxtLink to="/consulter" :class="{ 'is-active': activeSection === 'consulter' }" :aria-current="activeSection === 'consulter' ? 'page' : undefined">
            Consulter
          </NuxtLink>
          <NuxtLink to="/apprendre" :class="{ 'is-active': activeSection === 'apprendre' }" :aria-current="activeSection === 'apprendre' ? 'page' : undefined">
            Apprendre
          </NuxtLink>
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
      <p>Un outil gratuit pour travailler la conjugaison française.</p>
      <div class="site-footer__links">
        <a href="mailto:christophe.roulet@edu-vd.ch">Contact</a>
        <NuxtLink to="/admin">Administration</NuxtLink>
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
  min-height: 100vh;
  margin: 0;
  color: var(--ink);
  background: linear-gradient(180deg, #d7f3fa 0%, #f9f8e8 72%, #f6f3e7 100%);
}

:root[data-theme='dark'] body {
  background:
    radial-gradient(circle at 12% 0%, rgb(35 70 71 / 55%), transparent 32rem),
    linear-gradient(180deg, #111b1c 0%, #182321 65%, #151d1c 100%);
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
    grid-template-columns: auto repeat(3, minmax(0, 1fr)) auto;
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

  .theme-switch { margin-left: 2px; }

  .site-main {
    width: min(100% - 20px, 1180px);
    padding-top: 22px;
  }

  .site-main--admin {
    width: calc(100% - 10px);
  }
}
</style>
