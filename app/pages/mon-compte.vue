<script setup lang="ts">
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

const { ui } = useLanguagePreferences()
const { user } = useAdminAuth()
const pushSupported = ref(false)
const pushCapabilityChecked = ref(false)
const pushEnabled = ref(false)
const pushBusy = ref(false)
const pushMessage = ref('')
const pushError = ref('')
const windowSecureContext = ref(true)
let pushRegistration: ServiceWorkerRegistration | null = null
let pushSubscription: PushSubscription | null = null
type PushPreferenceKey = 'learner_registration' | 'learner_accounts' | 'daily_sessions' | 'foreign_country' | 'falc_usage'
type PushPreferences = Record<PushPreferenceKey, boolean>
const pushPreferences = reactive<PushPreferences>({
  learner_registration: true,
  learner_accounts: true,
  daily_sessions: true,
  foreign_country: true,
  falc_usage: true,
})
const pushPreferenceOptions = [
  { key: 'learner_registration', label: 'Chaque nouvelle inscription, avec le total de comptes créés.' },
  { key: 'learner_accounts', label: 'Comptes créés : 40, 50, 60, puis chaque dizaine.' },
  { key: 'daily_sessions', label: 'Sessions quotidiennes : 1 000, 1 500, puis chaque centaine.' },
  { key: 'foreign_country', label: 'Plus de 5 personnes actives simultanément dans un pays hors de Suisse.' },
  { key: 'falc_usage', label: 'Une personne utilise réellement le mode FALC.' },
] as const

useHead(() => ({ title: ui('Mon compte') }))

const displayName = computed(() => {
  if (!user.value) {
    return ''
  }
  return [user.value.prenom, user.value.nom].filter(Boolean).join(' ')
})

function applicationServerKey(value: string) {
  const normalized = value.trim()
  const padding = '='.repeat((4 - normalized.length % 4) % 4)
  const raw = atob((normalized + padding).replace(/-/gu, '+').replace(/_/gu, '/'))
  const key = Uint8Array.from(raw, character => character.charCodeAt(0))
  if (key.length !== 65 || key[0] !== 4) {
    throw new Error('La clé Web Push fournie par le serveur est invalide.')
  }
  return key
}

async function readyPushRegistration() {
  await navigator.serviceWorker.register('/admin-push-sw.js', {
    scope: '/',
    updateViaCache: 'none',
  })
  const registration = await navigator.serviceWorker.ready
  if (!registration.active) {
    throw new Error('Le service worker de notifications ne s’est pas activé.')
  }
  return registration
}

function isPushServiceError(error: unknown) {
  const detail = getAdminErrorMessage(error, '').toLocaleLowerCase('en')
  return detail.includes('push service') || detail.includes('registration failed')
}

async function createPushSubscription(registration: ServiceWorkerRegistration, publicKey: string) {
  const existing = await registration.pushManager.getSubscription()
  if (existing) return existing

  const options: PushSubscriptionOptionsInit = {
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey(publicKey),
  }
  try {
    return await registration.pushManager.subscribe(options)
  }
  catch (error) {
    if (!isPushServiceError(error)) throw error
    // Chrome, Edge et Firefox peuvent échouer transitoirement pendant
    // l'initialisation de leur service Push. Une mise à jour du worker suivie
    // d'une seule nouvelle tentative évite de laisser l'appareil bloqué.
    await registration.update()
    await new Promise(resolve => setTimeout(resolve, 750))
    return await registration.pushManager.subscribe(options)
  }
}

async function pushConfiguration() {
  return await $fetch<{ publicKey: string }>('/api/admin/push-subscriptions')
}

async function synchronizeSubscription(subscription: PushSubscription) {
  const response = await $fetch<{ preferences: PushPreferences }>('/api/admin/push-subscriptions', {
    method: 'POST',
    body: subscription.toJSON(),
  })
  Object.assign(pushPreferences, response.preferences)
}

async function savePushPreference(key: PushPreferenceKey, enabled: boolean) {
  if (!pushSubscription || pushBusy.value) return
  const previous = pushPreferences[key]
  pushPreferences[key] = enabled
  pushBusy.value = true
  pushMessage.value = ''
  pushError.value = ''
  try {
    const response = await $fetch<{ preferences: PushPreferences }>('/api/admin/push-subscriptions/preferences', {
      method: 'PUT',
      body: { endpoint: pushSubscription.endpoint, preferences: { ...pushPreferences } },
    })
    Object.assign(pushPreferences, response.preferences)
    pushMessage.value = 'Préférences de notifications enregistrées.'
  }
  catch (error) {
    pushPreferences[key] = previous
    pushError.value = getAdminErrorMessage(error, 'Impossible d’enregistrer cette préférence.')
  }
  finally {
    pushBusy.value = false
  }
}

onMounted(async () => {
  windowSecureContext.value = window.isSecureContext
  pushSupported.value = window.isSecureContext
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window
  pushCapabilityChecked.value = true
  if (!pushSupported.value) return
  try {
    pushRegistration = await readyPushRegistration()
    pushSubscription = await pushRegistration.pushManager.getSubscription()
    pushEnabled.value = Boolean(pushSubscription)
    if (pushSubscription) await synchronizeSubscription(pushSubscription)
  }
  catch (error) {
    const detail = getAdminErrorMessage(error, '')
    pushError.value = `Impossible de vérifier les notifications sur cet appareil.${detail ? ` ${detail}` : ''}`
  }
})

async function enablePush() {
  if (!pushSupported.value || pushBusy.value) return
  pushBusy.value = true
  pushMessage.value = ''
  pushError.value = ''
  let step = 'autorisation du navigateur'
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      pushError.value = 'Les notifications ont été refusées dans les réglages du navigateur.'
      return
    }
    step = 'enregistrement du service worker'
    pushRegistration ||= await readyPushRegistration()
    step = 'lecture de la configuration serveur'
    const { publicKey } = await pushConfiguration()
    if (!publicKey) throw new Error('Clé Web Push indisponible')
    step = 'création de l’abonnement navigateur'
    pushSubscription = await createPushSubscription(pushRegistration, publicKey)
    step = 'enregistrement de l’abonnement en base'
    await synchronizeSubscription(pushSubscription)
    pushEnabled.value = true
    pushMessage.value = 'Notifications activées sur cet appareil.'
  }
  catch (error) {
    const detail = getAdminErrorMessage(error, '')
    const serviceHint = isPushServiceError(error)
      ? ' Le navigateur n’arrive pas à joindre son propre service Push. Vérifiez qu’un VPN, pare-feu ou bloqueur DNS ne bloque pas ce service, puis relancez le navigateur.'
      : ''
    pushError.value = `L’activation a échoué pendant l’étape « ${step} ».${detail ? ` ${detail}` : ''}${serviceHint}`
  }
  finally {
    pushBusy.value = false
  }
}

async function disablePush() {
  if (!pushSubscription || pushBusy.value) return
  pushBusy.value = true
  pushMessage.value = ''
  pushError.value = ''
  try {
    await $fetch('/api/admin/push-subscriptions', {
      method: 'DELETE',
      body: { endpoint: pushSubscription.endpoint },
    })
    await pushSubscription.unsubscribe()
    pushSubscription = null
    pushEnabled.value = false
    pushMessage.value = 'Notifications désactivées sur cet appareil.'
  }
  catch {
    pushError.value = 'La désactivation des notifications a échoué.'
  }
  finally {
    pushBusy.value = false
  }
}

async function testPush() {
  if (!pushSubscription || pushBusy.value) return
  pushBusy.value = true
  pushMessage.value = ''
  pushError.value = ''
  try {
    const testId = crypto.randomUUID()
    const browserReceipt = new Promise<boolean>((resolve) => {
      const timeout = window.setTimeout(() => {
        navigator.serviceWorker.removeEventListener('message', receive)
        resolve(false)
      }, 10000)
      function receive(event: MessageEvent) {
        if (event.data?.type !== 'tatitotu-admin-push-test-received' || event.data?.testId !== testId) return
        window.clearTimeout(timeout)
        navigator.serviceWorker.removeEventListener('message', receive)
        resolve(true)
      }
      navigator.serviceWorker.addEventListener('message', receive)
    })
    const response = await $fetch<{ pushServiceStatus: number }>('/api/admin/push-subscriptions/test', {
      method: 'POST',
      body: { endpoint: pushSubscription.endpoint, testId },
    })
    const received = await browserReceipt
    pushMessage.value = received
      ? 'Notification de test reçue et affichée par ce navigateur.'
      : `Notification acceptée par le service Push (${response.pushServiceStatus}), mais sa réception n’a pas été confirmée sous 10 secondes. Vérifiez le centre de notifications et les réglages système.`
  }
  catch (error) {
    pushError.value = getAdminErrorMessage(error, 'La notification de test n’a pas pu être envoyée.')
  }
  finally {
    pushBusy.value = false
  }
}
</script>

<template>
  <AdminAuthBoundary>
    <AdminShell>
      <div v-if="user" class="account-page">
        <header class="admin-section-heading">
          <div>
            <p class="admin-eyebrow">{{ ui('Profil') }}</p>
            <h1>{{ ui('Mon compte') }}</h1>
            <p class="admin-muted">{{ ui('Informations associées à votre session administrateur.') }}</p>
          </div>
        </header>

        <section class="account-card admin-card" aria-labelledby="account-identity-title">
          <div class="account-card__avatar" aria-hidden="true">
            {{ (user.prenom?.[0] || user.username?.[0] || 'A').toLocaleUpperCase('fr') }}
          </div>

          <div class="account-card__heading">
            <h2 id="account-identity-title">{{ displayName || user.username }}</h2>
            <p>{{ ui('Administrateur') }}</p>
          </div>

          <dl>
            <div>
              <dt>{{ ui('Prénom') }}</dt>
              <dd>{{ user.prenom || '—' }}</dd>
            </div>
            <div>
              <dt>{{ ui('Nom') }}</dt>
              <dd>{{ user.nom || '—' }}</dd>
            </div>
            <div>
              <dt>{{ ui('Nom d’utilisateur') }}</dt>
              <dd>{{ user.username || '—' }}</dd>
            </div>
            <div>
              <dt>{{ ui('Adresse e-mail') }}</dt>
              <dd><a :href="`mailto:${user.email}`">{{ user.email }}</a></dd>
            </div>
            <div>
              <dt>{{ ui('Identifiant') }}</dt>
              <dd>{{ user.id }}</dd>
            </div>
            <div>
              <dt>{{ ui('Niveau d’accès') }}</dt>
              <dd>{{ ui('Administration') }}</dd>
            </div>
          </dl>
        </section>

        <section class="push-card admin-card" aria-labelledby="push-notifications-title">
          <div>
            <p class="admin-eyebrow">{{ ui('Alertes privées') }}</p>
            <h2 id="push-notifications-title">{{ ui('Notifications Tatitotu') }}</h2>
            <p class="admin-muted">
              {{ ui('Recevez les paliers de comptes créés et de sessions quotidiennes, même lorsque le site n’est pas ouvert.') }}
            </p>
          </div>

          <div v-if="pushSupported" class="push-card__actions">
            <button
              v-if="!pushEnabled"
              class="admin-button"
              type="button"
              :disabled="pushBusy"
              @click="enablePush"
            >
              {{ pushBusy ? ui('Activation…') : ui('Activer sur cet appareil') }}
            </button>
            <template v-else>
              <span class="push-card__status">{{ ui('Activées sur cet appareil') }}</span>
              <button class="admin-button" type="button" :disabled="pushBusy" @click="testPush">
                {{ ui('Envoyer un test') }}
              </button>
              <button class="admin-button admin-button--secondary" type="button" :disabled="pushBusy" @click="disablePush">
                {{ ui('Désactiver') }}
              </button>
            </template>
          </div>
          <p v-else-if="pushCapabilityChecked" class="admin-notice admin-notice--error" role="status">
            {{ windowSecureContext
              ? ui('Ce navigateur ne prend pas en charge les notifications Web Push.')
              : ui('Les notifications nécessitent une connexion HTTPS sécurisée.') }}
          </p>
          <p v-if="pushMessage" class="admin-notice admin-notice--success" role="status">{{ pushMessage }}</p>
          <p v-if="pushError" class="admin-notice admin-notice--error" role="alert">{{ pushError }}</p>

          <fieldset class="push-preferences" :disabled="!pushEnabled || pushBusy">
            <legend>{{ ui('Messages à recevoir sur cet appareil') }}</legend>
            <label v-for="option in pushPreferenceOptions" :key="option.key">
              <input
                type="checkbox"
                :checked="pushPreferences[option.key]"
                @change="savePushPreference(option.key, ($event.target as HTMLInputElement).checked)"
              >
              <span>{{ ui(option.label) }}</span>
            </label>
          </fieldset>
        </section>

        <aside class="account-note">
          <strong>{{ ui('Modification du profil') }}</strong>
          <p> {{ ui('Cette version permet de consulter le compte. Aucune API de modification du profil ou du mot de passe n’est disponible.') }} </p>
        </aside>
      </div>
    </AdminShell>
  </AdminAuthBoundary>
</template>

<style scoped>
.account-page {
  display: grid;
  gap: 25px;
}

.account-page .admin-section-heading .admin-muted {
  margin: 7px 0 0;
}

.account-card {
  display: grid;
  padding: clamp(20px, 4vw, 32px);
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 14px 18px;
  box-shadow: none;
}

.account-card__avatar {
  display: grid;
  width: 68px;
  height: 68px;
  grid-row: 1;
  place-items: center;
  color: white;
  background: linear-gradient(145deg, var(--admin-blue), var(--admin-navy));
  border-radius: 20px;
  font-size: 1.8rem;
  font-weight: 900;
}

.account-card__heading h2,
.account-card__heading p {
  margin: 0;
}

.account-card__heading h2 {
  color: var(--admin-navy);
  font-size: 1.5rem;
}

.account-card__heading p {
  margin-top: 4px;
  color: var(--admin-muted);
}

.account-card dl {
  display: grid;
  margin: 14px 0 0;
  grid-column: 1 / -1;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  overflow: hidden;
}

.account-card dl > div {
  min-width: 0;
  padding: 14px 16px;
  border-bottom: 1px solid var(--admin-border);
}

.account-card dl > div:nth-child(odd) {
  border-right: 1px solid var(--admin-border);
}

.account-card dl > div:nth-last-child(-n + 2) {
  border-bottom: 0;
}

.account-card dt {
  color: var(--admin-muted);
  font-size: .75rem;
  font-weight: 800;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.account-card dd {
  margin: 5px 0 0;
  overflow-wrap: anywhere;
  color: var(--admin-navy);
  font-weight: 750;
}

.account-note {
  padding: 17px 19px;
  color: #765018;
  background: #fff8e8;
  border-left: 4px solid #e9a53c;
  border-radius: 8px;
}

.account-note p {
  margin: 5px 0 0;
  line-height: 1.55;
}

.push-card {
  display: grid;
  padding: clamp(20px, 4vw, 28px);
  gap: 18px;
  box-shadow: none;
}

.push-card h2,
.push-card p {
  margin: 0;
}

.push-card .admin-muted {
  margin-top: 7px;
  line-height: 1.55;
}

.push-card__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.push-card__status {
  padding: 8px 12px;
  color: #25603a;
  background: #eaf7ee;
  border-radius: 999px;
  font-weight: 800;
}

.push-preferences {
  display: grid;
  margin: 0;
  padding: 16px;
  gap: 11px;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
}

.push-preferences legend {
  padding: 0 7px;
  color: var(--admin-navy);
  font-weight: 850;
}

.push-preferences label {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: start;
  gap: 10px;
  color: var(--admin-navy);
  line-height: 1.45;
  cursor: pointer;
}

.push-preferences input {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: var(--admin-blue);
}

.push-preferences:disabled {
  opacity: .58;
}

@media (max-width: 590px) {
  .account-card dl {
    grid-template-columns: 1fr;
  }

  .account-card dl > div,
  .account-card dl > div:nth-child(odd),
  .account-card dl > div:nth-last-child(-n + 2) {
    border-right: 0;
    border-bottom: 1px solid var(--admin-border);
  }

  .account-card dl > div:last-child {
    border-bottom: 0;
  }
}
</style>
