<script setup lang="ts">
const emit = defineEmits<{
  authenticated: []
}>()

const { login, authError } = useAdminAuth()
const email = ref('')
const password = ref('')
const submitting = ref(false)

async function submit() {
  if (submitting.value) {
    return
  }

  submitting.value = true
  try {
    await login(email.value.trim(), password.value)
    password.value = ''
    emit('authenticated')
  } catch {
    // Le composable expose déjà le message sûr à afficher.
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="admin-login admin-card" aria-labelledby="admin-login-title">
    <p class="admin-eyebrow">Espace protégé</p>
    <h1 id="admin-login-title">Administration</h1>
    <p class="admin-muted">
      Connectez-vous avec un compte administrateur pour gérer les verbes et consulter les statistiques.
    </p>

    <form class="admin-form" @submit.prevent="submit">
      <label class="admin-field">
        <span>Adresse e-mail</span>
        <input
          v-model="email"
          type="email"
          name="email"
          autocomplete="username"
          inputmode="email"
          maxlength="254"
          required
          autofocus
        >
      </label>

      <label class="admin-field">
        <span>Mot de passe</span>
        <input
          v-model="password"
          type="password"
          name="password"
          autocomplete="current-password"
          maxlength="200"
          required
        >
      </label>

      <p v-if="authError" class="admin-notice admin-notice--error" role="alert">
        {{ authError }}
      </p>

      <button class="admin-button admin-button--primary" type="submit" :disabled="submitting">
        {{ submitting ? 'Connexion…' : 'Se connecter' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.admin-login {
  width: min(100%, 470px);
  margin: clamp(24px, 8vh, 88px) auto;
  padding: clamp(24px, 5vw, 42px);
}

.admin-login h1 {
  margin: 4px 0 10px;
  font-size: clamp(2rem, 7vw, 3rem);
  line-height: 1;
}

.admin-login .admin-form {
  margin-top: 28px;
}

.admin-login .admin-button {
  width: 100%;
  margin-top: 4px;
}
</style>
