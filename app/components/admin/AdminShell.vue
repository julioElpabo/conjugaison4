<script setup lang="ts">
const { user, logout, authError } = useAdminAuth()
const { localePath } = useLanguagePreferences()
const loggingOut = ref(false)
const siteHeaderHeight = ref(68)
let siteHeaderObserver: ResizeObserver | undefined

const stickyHeaderStyle = computed(() => ({
  '--admin-sticky-top': `${siteHeaderHeight.value}px`,
}))

onMounted(() => {
  const siteHeader = document.querySelector<HTMLElement>('.site-header')
  if (!siteHeader) return
  const updateHeight = () => {
    siteHeaderHeight.value = Math.ceil(siteHeader.getBoundingClientRect().height)
  }
  updateHeight()
  siteHeaderObserver = new ResizeObserver(updateHeight)
  siteHeaderObserver.observe(siteHeader)
})

onBeforeUnmount(() => siteHeaderObserver?.disconnect())

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
        <NuxtLink :to="localePath('/admin')">Verbes</NuxtLink>
        <NuxtLink :to="localePath('/admin/challenges')">Défis</NuxtLink>
        <NuxtLink :to="localePath('/admin/caracteres')">Caractères</NuxtLink>
        <NuxtLink :to="localePath('/admin/coaches')">Coaches</NuxtLink>
        <NuxtLink :to="localePath('/admin/tests')">Tests</NuxtLink>
        <NuxtLink :to="localePath('/admin/users')">Utilisateurs</NuxtLink>
        <NuxtLink :to="localePath('/admin/charts')">Statistiques</NuxtLink>
        <NuxtLink :to="localePath('/admin/feedbacks')">Feedbacks</NuxtLink>
        <NuxtLink :to="localePath('/admin/errors')">Erreurs</NuxtLink>
        <NuxtLink :to="localePath('/mon-compte')">Mon compte</NuxtLink>
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
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  scrollbar-width: thin;
}

.admin-shell__nav a {
  flex: 0 0 auto;
  padding: 8px 11px;
  color: #d8e9f1;
  border-radius: 8px;
  text-decoration: none;
  font-size: .9rem;
  font-weight: 750;
}

.admin-shell__nav a:hover,
.admin-shell__nav a.router-link-exact-active {
  color: white;
  background: rgb(255 255 255 / 13%);
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
    overflow-x: auto;
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

  .admin-shell__nav a {
    white-space: nowrap;
  }

  .admin-shell__content {
    padding: 16px 12px 24px;
  }
}
</style>
