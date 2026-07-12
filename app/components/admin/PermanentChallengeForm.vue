<script setup lang="ts">
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

const { handleUnauthorized } = useAdminAuth()
const code = ref('')
const submitting = ref(false)
const error = ref('')
const success = ref('')

const isValid = computed(() => /^[A-Z2-9]{2}(?:-[A-Z2-9]{2}){3}$/.test(code.value))

function formatCode(value: string): string {
  const compact = value.toUpperCase().replace(/[^A-Z2-9]/g, '').slice(0, 8)
  return compact.match(/.{1,2}/g)?.join('-') ?? ''
}

function onInput(event: Event) {
  code.value = formatCode((event.target as HTMLInputElement).value)
  error.value = ''
  success.value = ''
}

async function submit() {
  if (!isValid.value || submitting.value) {
    error.value = 'Saisissez les 8 caractères du code du défi.'
    return
  }

  submitting.value = true
  error.value = ''
  success.value = ''

  try {
    await $fetch(`/api/admin/defis/${encodeURIComponent(code.value)}/permanent`, {
      method: 'PUT',
      credentials: 'same-origin'
    })
    success.value = `Le défi ${code.value} est maintenant permanent.`
    code.value = ''
  } catch (caught) {
    if (!handleUnauthorized(caught)) {
      error.value = getAdminErrorMessage(caught, 'Impossible de rendre ce défi permanent.')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="permanent-challenge admin-card" aria-labelledby="permanent-challenge-title">
    <div>
      <p class="admin-eyebrow">Conservation</p>
      <h2 id="permanent-challenge-title">Rendre un défi permanent</h2>
      <p class="admin-muted">Entrez son code de partage à 8 caractères.</p>
    </div>

    <form class="permanent-challenge__form" @submit.prevent="submit">
      <label class="admin-field">
        <span class="admin-sr-only">Code du défi</span>
        <input
          class="permanent-challenge__code"
          type="text"
          name="challenge-code"
          autocomplete="off"
          spellcheck="false"
          inputmode="text"
          maxlength="11"
          placeholder="AB-CD-EF-GH"
          :value="code"
          aria-describedby="challenge-code-help"
          @input="onInput"
        >
      </label>
      <button class="admin-button admin-button--primary" type="submit" :disabled="submitting || !isValid">
        {{ submitting ? 'Enregistrement…' : 'Rendre permanent' }}
      </button>
    </form>

    <p id="challenge-code-help" class="permanent-challenge__help admin-muted">
      Les tirets sont ajoutés automatiquement. Les caractères 0 et 1 ne font pas partie des codes.
    </p>
    <p v-if="success" class="admin-notice admin-notice--success" role="status">{{ success }}</p>
    <p v-if="error" class="admin-notice admin-notice--error" role="alert">{{ error }}</p>
  </section>
</template>

<style scoped>
.permanent-challenge {
  display: grid;
  padding: 20px;
  gap: 14px 24px;
  box-shadow: none;
}

.permanent-challenge h2 {
  margin: 4px 0 0;
  color: var(--admin-navy);
  font-size: 1.2rem;
}

.permanent-challenge .admin-muted {
  margin: 5px 0 0;
}

.permanent-challenge__form {
  display: flex;
  align-items: end;
  gap: 10px;
}

.permanent-challenge__form .admin-field {
  flex: 1;
}

.permanent-challenge__code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 1.08rem;
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.permanent-challenge__help {
  font-size: .8rem;
}

@media (min-width: 900px) {
  .permanent-challenge {
    grid-template-columns: minmax(240px, .8fr) minmax(390px, 1.2fr);
    align-items: center;
  }

  .permanent-challenge__help,
  .permanent-challenge .admin-notice {
    grid-column: 2;
  }
}

@media (max-width: 560px) {
  .permanent-challenge__form {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
