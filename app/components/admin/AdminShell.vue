<script setup lang="ts">
const { user, logout, authError } = useAdminAuth()
const loggingOut = ref(false)

async function signOut() {
  if (loggingOut.value) {
    return
  }

  loggingOut.value = true
  try {
    await logout()
    await navigateTo('/admin')
  } catch {
    // Le message est exposé par le composable et affiché ci-dessous.
  } finally {
    loggingOut.value = false
  }
}
</script>

<template>
  <div class="admin-shell admin-card">
    <header class="admin-shell__header">
      <div class="admin-shell__identity">
        <span class="admin-shell__mark" aria-hidden="true">A</span>
        <div>
          <strong>Administration</strong>
          <small v-if="user">{{ user.prenom }} {{ user.nom }}</small>
        </div>
      </div>

      <nav class="admin-shell__nav" aria-label="Navigation d’administration">
        <NuxtLink to="/admin">Verbes</NuxtLink>
        <NuxtLink to="/admin/characters">Caractères</NuxtLink>
        <NuxtLink to="/admin/coaches">Coaches</NuxtLink>
        <NuxtLink to="/admin/tests">Tests</NuxtLink>
        <NuxtLink to="/admin/users">Utilisateurs</NuxtLink>
        <NuxtLink to="/charts">Statistiques</NuxtLink>
        <NuxtLink to="/admin/feedbacks">Feedbacks</NuxtLink>
        <NuxtLink to="/admin/errors">Erreurs</NuxtLink>
        <NuxtLink to="/mon-compte">Mon compte</NuxtLink>
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
  display: grid;
  grid-template-columns: auto 1fr auto;
  min-height: 72px;
  padding: 12px 18px;
  align-items: center;
  gap: 20px;
  color: white;
  background: var(--admin-navy);
  border-radius: 18px 18px 0 0;
}

.admin-shell__identity {
  display: flex;
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
  justify-content: center;
  gap: 5px;
}

.admin-shell__nav a {
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
