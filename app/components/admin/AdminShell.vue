<script setup lang="ts">
const { user, logout, authError } = useAdminAuth()
const { localePath } = useLanguagePreferences()
const route = useRoute()
const loggingOut = ref(false)
const siteHeaderHeight = ref(68)
const openMenu = ref<string | null>(null)
let siteHeaderObserver: ResizeObserver | undefined

const menuGroups = [
  {
    id: 'verbs',
    label: 'Verbes',
    links: [
      { label: 'Verbes', path: '/admin' },
      { label: 'Défis', path: '/admin/challenges' },
    ],
  },
  {
    id: 'coaches',
    label: 'Coaches',
    links: [
      { label: 'Coaches', path: '/admin/coaches' },
      { label: 'Caractères', path: '/admin/caracteres' },
    ],
  },
  {
    id: 'development',
    label: 'Développement',
    links: [
      { label: 'Tests', path: '/admin/tests' },
      { label: 'Feedbacks', path: '/admin/feedbacks' },
      { label: 'Erreurs', path: '/admin/errors' },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    links: [
      { label: 'Mon compte', path: '/mon-compte' },
      { label: 'Utilisateurs', path: '/admin/users' },
    ],
  },
] as const

const stickyHeaderStyle = computed(() => ({
  '--admin-sticky-top': `${siteHeaderHeight.value}px`,
}))

onMounted(() => {
  document.addEventListener('pointerdown', closeMenusFromOutside)
  document.addEventListener('keydown', closeMenusWithEscape)
  const siteHeader = document.querySelector<HTMLElement>('.site-header')
  if (!siteHeader) return
  const updateHeight = () => {
    siteHeaderHeight.value = Math.ceil(siteHeader.getBoundingClientRect().height)
  }
  updateHeight()
  siteHeaderObserver = new ResizeObserver(updateHeight)
  siteHeaderObserver.observe(siteHeader)
})

onBeforeUnmount(() => {
  siteHeaderObserver?.disconnect()
  document.removeEventListener('pointerdown', closeMenusFromOutside)
  document.removeEventListener('keydown', closeMenusWithEscape)
})

watch(() => route.fullPath, () => {
  openMenu.value = null
})

function toggleMenu(id: string) {
  openMenu.value = openMenu.value === id ? null : id
}

function closeMenusFromOutside(event: PointerEvent) {
  if (!(event.target instanceof Element) || !event.target.closest('.admin-menu')) openMenu.value = null
}

function closeMenusWithEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') openMenu.value = null
}

function linkIsActive(path: string) {
  const target = localePath(path).replace(/\/+$/u, '')
  const current = route.path.replace(/\/+$/u, '')
  return current === target
}

function groupIsActive(group: typeof menuGroups[number]) {
  return group.links.some(link => linkIsActive(link.path))
}

async function signOut() {
  if (loggingOut.value) {
    return
  }

  loggingOut.value = true
  try {
    await logout()
    await navigateTo(localePath('/admin'))
  } catch {
    // Le message est exposé par le composable et affiché ci-dessous.
  } finally {
    loggingOut.value = false
  }
}
</script>

<template>
  <div class="admin-shell admin-card">
    <header class="admin-shell__header" :style="stickyHeaderStyle">
      <div class="admin-shell__identity">
        <span class="admin-shell__mark" aria-hidden="true">A</span>
        <div>
          <strong>Administration</strong>
          <small v-if="user">{{ user.prenom }} {{ user.nom }}</small>
        </div>
      </div>

      <nav class="admin-shell__nav" aria-label="Navigation d’administration">
        <div
          v-for="group in menuGroups"
          :key="group.id"
          class="admin-menu"
          :class="[`admin-menu--${group.id}`, { active: groupIsActive(group) }]"
        >
          <button
            type="button"
            aria-haspopup="menu"
            :aria-expanded="openMenu === group.id"
            :aria-controls="`admin-menu-${group.id}`"
            @click="toggleMenu(group.id)"
          >
            {{ group.label }}
            <span aria-hidden="true">⌄</span>
          </button>
          <div
            v-show="openMenu === group.id"
            :id="`admin-menu-${group.id}`"
            class="admin-menu__panel"
            role="menu"
          >
            <NuxtLink
              v-for="link in group.links"
              :key="link.path"
              :to="localePath(link.path)"
              role="menuitem"
              :class="{ 'router-link-exact-active': linkIsActive(link.path) }"
            >
              {{ link.label }}
            </NuxtLink>
          </div>
        </div>
        <NuxtLink class="admin-shell__direct-link" :to="localePath('/admin/charts')">Statistiques</NuxtLink>
      </nav>

      <button
        class="admin-button admin-button--small"
        type="button"
        :disabled="loggingOut"
        @click="signOut"
      >
        {{ loggingOut ? 'Déconnexion…' : 'Se déconnecter' }}
      </button>
    </header>

    <p v-if="authError" class="admin-shell__error admin-notice admin-notice--error" role="alert">
      {{ authError }}
    </p>

    <main class="admin-shell__content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-shell {
  width: 100%;
  max-width: none;
  min-width: 0;
  margin-inline: 0;
  overflow: visible;
}

.admin-shell__header {
  position: sticky;
  z-index: 90;
  top: var(--admin-sticky-top, 68px);
  display: grid;
  grid-template-columns: auto 1fr auto;
  min-height: 64px;
  padding: 9px 14px;
  align-items: center;
  gap: 14px;
  color: white;
  background: var(--admin-navy);
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 14px;
  box-shadow: 0 8px 24px rgb(13 41 54 / 22%);
}

.admin-shell__identity {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;
}

.admin-shell__identity > div {
  display: grid;
}

.admin-shell__identity small {
  color: #bcd2df;
  font-size: .75rem;
}

.admin-shell__mark {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  color: var(--admin-navy);
  background: #8de0ef;
  border-radius: 11px;
  font-weight: 900;
}

.admin-shell__nav {
  display: flex;
  min-width: 0;
  padding: 2px;
  justify-content: flex-start;
  gap: 5px;
  overflow: visible;
}

.admin-shell__nav a,
.admin-menu > button {
  flex: 0 0 auto;
  padding: 8px 11px;
  color: #d8e9f1;
  border: 0;
  border-radius: 8px;
  background: transparent;
  text-decoration: none;
  font: inherit;
  font-size: .9rem;
  font-weight: 750;
  cursor: pointer;
}

.admin-shell__nav a:hover,
.admin-shell__nav a.router-link-exact-active,
.admin-menu > button:hover,
.admin-menu.active > button,
.admin-menu > button[aria-expanded='true'] {
  color: white;
  background: rgb(255 255 255 / 13%);
}

.admin-menu {
  position: relative;
  flex: 0 0 auto;
}

.admin-menu > button {
  display: flex;
  align-items: center;
  gap: 7px;
}

.admin-menu > button span {
  font-size: .72rem;
  transition: transform .15s;
}

.admin-menu > button[aria-expanded='true'] span {
  transform: rotate(180deg);
}

.admin-menu__panel {
  position: absolute;
  z-index: 110;
  top: calc(100% + 8px);
  left: 0;
  display: grid;
  min-width: 190px;
  padding: 6px;
  gap: 3px;
  color: var(--admin-navy);
  background: white;
  border: 1px solid #c9dbe0;
  border-radius: 11px;
  box-shadow: 0 14px 34px rgb(8 35 47 / 25%);
}

.admin-menu__panel a {
  width: 100%;
  padding: 9px 11px;
  color: #294954;
}

.admin-menu__panel a:hover,
.admin-menu__panel a.router-link-exact-active {
  color: #075f73;
  background: #e7f4f6;
}

.admin-menu--development .admin-menu__panel,
.admin-menu--admin .admin-menu__panel {
  right: 0;
  left: auto;
}

:global(:root[data-theme='dark']) .admin-menu__panel {
  color: #dbe9ed;
  background: #1b3036;
  border-color: #405a62;
}

:global(:root[data-theme='dark']) .admin-menu__panel a {
  color: #d2e4e8;
}

:global(:root[data-theme='dark']) .admin-menu__panel a:hover,
:global(:root[data-theme='dark']) .admin-menu__panel a.router-link-exact-active {
  color: white;
  background: #294a53;
}

.admin-shell__header .admin-button {
  flex: 0 0 auto;
  color: white;
  background: transparent;
  border-color: rgb(255 255 255 / 35%);
}

.admin-shell__header .admin-button:hover:not(:disabled) {
  border-color: white;
}

.admin-shell__content {
  width: 100%;
  min-width: 0;
  padding: clamp(18px, 3vw, 34px);
}

.admin-shell__error {
  margin: 18px 18px 0;
}

@media (max-width: 780px) {
  .admin-shell__header {
    grid-template-columns: 1fr auto;
    border-radius: 11px;
  }

  .admin-shell__nav {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-content: flex-start;
    flex-wrap: wrap;
    order: 3;
  }
}

@media (max-width: 480px) {
  .admin-shell__header {
    padding: 11px;
    gap: 10px;
  }

  .admin-shell__identity small {
    display: none;
  }

  .admin-shell__header > .admin-button {
    padding-inline: 9px;
    font-size: .78rem;
  }

  .admin-shell__nav > a,
  .admin-menu > button {
    white-space: nowrap;
    font-size: .8rem;
  }

  .admin-shell__content {
    padding: 16px 12px 24px;
  }
}
</style>
