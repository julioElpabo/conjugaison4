<script setup lang="ts">
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

interface ContactSettings {
  enabled: boolean
  contactEmail: string
  subjectMinLength: number
  subjectMaxLength: number
  messageMinLength: number
  messageMaxLength: number
  maxLinks: number
  shortRateLimit: number
  shortRateWindowMinutes: number
  dailyRateLimit: number
}

const defaults: ContactSettings = {
  enabled: true,
  contactEmail: '',
  subjectMinLength: 5,
  subjectMaxLength: 120,
  messageMinLength: 20,
  messageMaxLength: 3000,
  maxLinks: 2,
  shortRateLimit: 3,
  shortRateWindowMinutes: 120,
  dailyRateLimit: 8,
}

const { user, handleUnauthorized } = useAdminAuth()
const settings = reactive<ContactSettings>({ ...defaults })
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')
let loaded = false

useHead({ title: 'Contact — Administration' })

async function loadSettings() {
  loading.value = true
  error.value = ''
  try {
    const response = await $fetch<{ settings: ContactSettings }>('/api/admin/contact-settings', {
      credentials: 'same-origin',
    })
    Object.assign(settings, response.settings)
  }
  catch (caught) {
    if (!handleUnauthorized(caught)) {
      error.value = getAdminErrorMessage(caught, 'Impossible de charger les réglages du contact.')
    }
  }
  finally {
    loading.value = false
  }
}

async function saveSettings() {
  if (saving.value) return
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    const response = await $fetch<{ settings: ContactSettings }>('/api/admin/contact-settings', {
      method: 'PUT',
      credentials: 'same-origin',
      body: { ...settings },
    })
    Object.assign(settings, response.settings)
    success.value = 'Réglages du formulaire de contact enregistrés.'
  }
  catch (caught) {
    if (!handleUnauthorized(caught)) {
      error.value = getAdminErrorMessage(caught, 'Impossible d’enregistrer les réglages.')
    }
  }
  finally {
    saving.value = false
  }
}

watch(user, (current) => {
  if (current && !loaded) {
    loaded = true
    void loadSettings()
  }
  if (!current) loaded = false
}, { immediate: true })
</script>

<template>
  <AdminAuthBoundary>
    <AdminShell>
      <div class="contact-admin">
        <header class="admin-section-heading">
          <div>
            <p class="admin-eyebrow">Formulaire public</p>
            <h1>Contact</h1>
            <p class="admin-muted">Réglez la réception, la validation et les limites anti-abus du formulaire.</p>
          </div>
          <button class="admin-button" type="button" :disabled="loading || saving" @click="loadSettings">
            Actualiser
          </button>
        </header>

        <p v-if="error" class="admin-notice admin-notice--error" role="alert">{{ error }}</p>
        <p v-if="success" class="admin-notice admin-notice--success" role="status">{{ success }}</p>

        <div v-if="loading" class="contact-admin__loading">
          <span class="admin-spinner" aria-hidden="true" /> Chargement…
        </div>

        <form v-else class="contact-admin__form" @submit.prevent="saveSettings">
          <section class="admin-card contact-admin__section">
            <header>
              <div><h2>Réception</h2><p>Destination des messages et disponibilité du formulaire.</p></div>
              <label class="contact-admin__switch">
                <input v-model="settings.enabled" type="checkbox">
                <span>Formulaire actif</span>
              </label>
            </header>
            <label class="admin-field">
              <span>Adresse destinataire *</span>
              <input v-model.trim="settings.contactEmail" type="email" maxlength="254" autocomplete="email" required>
              <small>L’adresse reste invisible pour les visiteurs. Les secrets SMTP et Turnstile restent dans les variables d’environnement.</small>
            </label>
          </section>

          <section class="admin-card contact-admin__section">
            <header><div><h2>Contenu</h2><p>Contraintes vérifiées dans le navigateur et de nouveau sur le serveur.</p></div></header>
            <div class="contact-admin__grid">
              <label class="admin-field">
                <span>Objet — caractères minimum</span>
                <input v-model.number="settings.subjectMinLength" type="number" min="1" max="100" required>
              </label>
              <label class="admin-field">
                <span>Objet — caractères maximum</span>
                <input v-model.number="settings.subjectMaxLength" type="number" min="5" max="200" required>
              </label>
              <label class="admin-field">
                <span>Message — caractères minimum</span>
                <input v-model.number="settings.messageMinLength" type="number" min="1" max="500" required>
              </label>
              <label class="admin-field">
                <span>Message — caractères maximum</span>
                <input v-model.number="settings.messageMaxLength" type="number" min="100" max="10000" required>
              </label>
              <label class="admin-field">
                <span>Nombre maximal de liens</span>
                <input v-model.number="settings.maxLinks" type="number" min="0" max="10" required>
                <small>Au-delà de ce nombre, le message est considéré comme automatisé.</small>
              </label>
            </div>
          </section>

          <section class="admin-card contact-admin__section">
            <header><div><h2>Limitation des envois</h2><p>Les deux limites s’appliquent à une même connexion internet.</p></div></header>
            <div class="contact-admin__grid contact-admin__grid--rates">
              <label class="admin-field">
                <span>Messages pendant la période courte</span>
                <input v-model.number="settings.shortRateLimit" type="number" min="1" max="100" required>
              </label>
              <label class="admin-field">
                <span>Durée de la période courte, en minutes</span>
                <input v-model.number="settings.shortRateWindowMinutes" type="number" min="5" max="1440" required>
                <small>120 minutes correspondent à 2 heures.</small>
              </label>
              <label class="admin-field">
                <span>Messages maximum sur 24 heures</span>
                <input v-model.number="settings.dailyRateLimit" type="number" min="1" max="500" required>
              </label>
            </div>
            <p class="contact-admin__summary">
              Réglage actuel : au maximum <strong>{{ settings.shortRateLimit }}</strong> messages toutes les
              <strong>{{ settings.shortRateWindowMinutes }}</strong> minutes et
              <strong>{{ settings.dailyRateLimit }}</strong> messages sur 24 heures.
            </p>
          </section>

          <aside class="contact-admin__translation-note">
            <strong>Textes traduits</strong>
            <p>Le titre, l’introduction, les libellés, les confirmations et les erreurs restent dans <code>shared/i18n/contact.ts</code>. Ils ne sont pas mélangés à ces réglages techniques.</p>
          </aside>

          <div class="contact-admin__actions">
            <button class="admin-button admin-button--primary" type="submit" :disabled="saving">
              {{ saving ? 'Enregistrement…' : 'Enregistrer les réglages' }}
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  </AdminAuthBoundary>
</template>

<style scoped>
.contact-admin {
  display: grid;
  max-width: 1080px;
  margin-inline: auto;
  gap: 22px;
}

.contact-admin .admin-section-heading {
  align-items: center;
}

.contact-admin .admin-section-heading p {
  margin: 6px 0 0;
}

.contact-admin__loading {
  display: flex;
  min-height: 220px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--admin-muted);
}

.contact-admin__form {
  display: grid;
  gap: 17px;
}

.contact-admin__section {
  display: grid;
  padding: clamp(18px, 3vw, 26px);
  gap: 20px;
  box-shadow: none;
}

.contact-admin__section > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--admin-border);
}

.contact-admin__section h2 {
  margin: 0;
  color: var(--admin-navy);
}

.contact-admin__section header p {
  margin: 5px 0 0;
  color: var(--admin-muted);
}

.contact-admin__switch {
  display: flex;
  flex: 0 0 auto;
  padding: 10px 13px;
  align-items: center;
  gap: 8px;
  color: var(--admin-navy);
  border: 1px solid var(--admin-border);
  border-radius: 10px;
  background: var(--surface-soft);
  font-weight: 850;
}

.contact-admin__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.contact-admin__grid--rates {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.contact-admin small {
  color: var(--admin-muted);
  font-weight: 500;
  line-height: 1.4;
}

.contact-admin__summary,
.contact-admin__translation-note {
  margin: 0;
  padding: 13px 15px;
  border-radius: 10px;
  color: var(--admin-navy);
  background: var(--admin-cyan);
  line-height: 1.55;
}

.contact-admin__translation-note {
  border: 1px solid var(--admin-border);
  background: var(--surface-soft);
}

.contact-admin__translation-note p {
  margin: 5px 0 0;
  color: var(--admin-muted);
}

.contact-admin__translation-note code {
  color: var(--admin-blue-dark);
}

.contact-admin__actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 760px) {
  .contact-admin__grid,
  .contact-admin__grid--rates {
    grid-template-columns: 1fr;
  }

  .contact-admin__section > header,
  .contact-admin .admin-section-heading {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
