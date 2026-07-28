<script setup lang="ts">
type Mode = 'register' | 'login'

interface UsernameSuggestion {
  username: string
  proof: string
}

interface RegistrationResult {
  ok: boolean
  username: string
  recoveryCode: string
  user: LearnerUser
}

interface LoginResult {
  ok: boolean
  username: string
  user: LearnerUser
}

const config = useRuntimeConfig()
const { setUser } = useLearnerAuth()
const mode = ref<Mode>('login')
const loadingSuggestion = ref(true)
const submitting = ref(false)
const errorMessage = ref('')
const suggestion = ref<UsernameSuggestion | null>(null)
const rejectedSuggestions = ref<string[]>([])
const password = ref('')
const passwordConfirmation = ref('')
const loginUsername = ref('')
const loginPassword = ref('')
const privacyAccepted = ref(false)
const website = ref('')
const recovery = ref<RegistrationResult | null>(null)
const registerForm = ref<HTMLFormElement | null>(null)
const copied = ref(false)
const turnstileSiteKey = String(config.public.turnstileSiteKey || '')

useHead({
  title: 'Compte pseudonyme',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  script: turnstileSiteKey
    ? [{ src: 'https://challenges.cloudflare.com/turnstile/v0/api.js', async: true, defer: true }]
    : [],
})

onMounted(async () => {
  if (!import.meta.dev) return

  try {
    const credentials = await $fetch<{ username: string, password: string }>('/api/dev-learner-login', {
      credentials: 'same-origin',
    })
    loginUsername.value = credentials.username
    loginPassword.value = credentials.password
  }
  catch {
    // Le formulaire reste vide si le fichier local est absent ou invalide.
  }
})

function humanError(error: unknown, fallback: string) {
  if (!error || typeof error !== 'object') return fallback
  const candidate = error as {
    data?: {
      statusMessage?: string
      message?: string
      data?: UsernameSuggestion
    }
  }
  return candidate.data?.statusMessage || candidate.data?.message || fallback
}

async function startRegistration() {
  loadingSuggestion.value = true
  errorMessage.value = ''
  try {
    suggestion.value = await $fetch<UsernameSuggestion>('/api/learner/registration')
    rejectedSuggestions.value = []
  } catch (error) {
    errorMessage.value = humanError(error, 'Impossible de commencer l’inscription.')
  } finally {
    loadingSuggestion.value = false
  }
}

function selectMode(nextMode: Mode) {
  mode.value = nextMode
  errorMessage.value = ''
  if (nextMode === 'register' && !suggestion.value) {
    void startRegistration()
  }
}

async function refreshSuggestion() {
  if (loadingSuggestion.value) return
  if (suggestion.value) rejectedSuggestions.value.push(suggestion.value.username)
  loadingSuggestion.value = true
  errorMessage.value = ''
  try {
    suggestion.value = await $fetch<UsernameSuggestion>('/api/learner/username-suggestion', {
      method: 'POST',
      body: { excluded: rejectedSuggestions.value.slice(-100) },
    })
  } catch (error) {
    errorMessage.value = humanError(error, 'Impossible de proposer un autre pseudonyme.')
  } finally {
    loadingSuggestion.value = false
  }
}

function turnstileToken() {
  if (!registerForm.value) return ''
  return String(new FormData(registerForm.value).get('cf-turnstile-response') || '')
}

async function register() {
  errorMessage.value = ''
  if (!suggestion.value) {
    errorMessage.value = 'Aucun pseudonyme n’est disponible.'
    return
  }
  if (password.value.length < 10) {
    errorMessage.value = 'Choisis un mot de passe d’au moins 10 caractères.'
    return
  }
  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = 'Les deux mots de passe ne correspondent pas.'
    return
  }
  if (!privacyAccepted.value) {
    errorMessage.value = 'Lis et accepte l’information sur les données enregistrées.'
    return
  }
  submitting.value = true
  try {
    recovery.value = await $fetch<RegistrationResult>('/api/learner/register', {
      method: 'POST',
      body: {
        username: suggestion.value.username,
        usernameProof: suggestion.value.proof,
        password: password.value,
        privacyAccepted: privacyAccepted.value,
        website: website.value,
        turnstileToken: turnstileToken(),
      },
    })
    setUser(recovery.value.user)
    password.value = ''
    passwordConfirmation.value = ''
  } catch (error) {
    const candidate = error as { data?: { data?: UsernameSuggestion } }
    if (candidate.data?.data?.username && candidate.data.data.proof) {
      suggestion.value = candidate.data.data
    }
    errorMessage.value = humanError(error, 'Impossible de créer le compte.')
  } finally {
    submitting.value = false
  }
}

async function login() {
  errorMessage.value = ''
  submitting.value = true
  try {
    const result = await $fetch<LoginResult>('/api/learner/login', {
      method: 'POST',
      body: { username: loginUsername.value, password: loginPassword.value },
    })
    setUser(result.user)
    await navigateTo('/fr/my-page')
  } catch (error) {
    errorMessage.value = humanError(error, 'Pseudonyme ou mot de passe incorrect.')
  } finally {
    submitting.value = false
  }
}

async function copyRecoveryCode() {
  if (!recovery.value) return
  await navigator.clipboard.writeText(recovery.value.recoveryCode)
  copied.value = true
}

function downloadRecoveryCode() {
  if (!recovery.value) return
  const content = `TATITOTU\nPseudonyme : ${recovery.value.username}\nCode de récupération : ${recovery.value.recoveryCode}\n`
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'tatitotu-recuperation.txt'
  anchor.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="learner-auth-page">
    <section v-if="recovery" class="learner-card learner-recovery" aria-labelledby="recovery-title">
      <p class="learner-eyebrow">Ton compte est créé</p>
      <h1 id="recovery-title">Conserve ton code de récupération</h1>
      <p>Il permet de récupérer ton compte sans adresse e-mail. Il ne sera plus affiché après cette étape.</p>
      <dl>
        <div><dt>Pseudonyme</dt><dd>{{ recovery.username }}</dd></div>
        <div><dt>Code de récupération</dt><dd><code>{{ recovery.recoveryCode }}</code></dd></div>
      </dl>
      <div class="learner-actions">
        <button type="button" class="secondary-button" @click="copyRecoveryCode">
          {{ copied ? 'Code copié' : 'Copier le code' }}
        </button>
        <button type="button" class="secondary-button" @click="downloadRecoveryCode">Télécharger</button>
        <NuxtLink class="primary-button" to="/fr/my-page">Continuer</NuxtLink>
      </div>
    </section>

    <section v-else class="learner-card" aria-labelledby="learner-auth-title">
      <h1 id="learner-auth-title">{{ mode === 'register' ? 'Créer mon compte' : 'Me connecter' }}</h1>
      <p class="learner-intro">
        Créer un compte t’aide à mieux progresser : tes résultats sont mémorisés,
        tu peux suivre tes progrès et retravailler tes fautes.
        Aucun nom ni aucune adresse e-mail ne sont demandés.
      </p>

      <div class="learner-tabs" role="tablist" aria-label="Choisir une action">
        <button type="button" role="tab" :aria-selected="mode === 'login'" @click="selectMode('login')">
          Me connecter
        </button>
        <button type="button" role="tab" :aria-selected="mode === 'register'" @click="selectMode('register')">
          Créer un compte
        </button>
      </div>

      <p v-if="errorMessage" class="learner-error" role="alert">{{ errorMessage }}</p>

      <form v-if="mode === 'register'" ref="registerForm" @submit.prevent="register">
        <div class="learner-field">
          <span>Ton pseudonyme proposé</span>
          <div class="username-proposal" aria-live="polite">
            <strong>{{ loadingSuggestion ? 'Recherche…' : suggestion?.username || 'Indisponible' }}</strong>
            <button type="button" :disabled="loadingSuggestion" @click="refreshSuggestion">M’en proposer un autre</button>
          </div>
        </div>

        <label class="learner-field">
          <span>Choisis un mot de passe</span>
          <input v-model="password" type="password" minlength="10" maxlength="200" autocomplete="new-password" required>
          <small>Au moins 10 caractères. Une petite phrase est facile à retenir.</small>
        </label>
        <label class="learner-field">
          <span>Confirme ton mot de passe</span>
          <input v-model="passwordConfirmation" type="password" minlength="10" maxlength="200" autocomplete="new-password" required>
        </label>

        <label class="honeypot" aria-hidden="true">
          Site internet
          <input v-model="website" name="website" type="text" tabindex="-1" autocomplete="off">
        </label>

        <label class="privacy-check">
          <input v-model="privacyAccepted" type="checkbox" required>
          <span>J’ai compris que le site enregistre mon pseudonyme et, plus tard, ma progression. Il ne demande pas mon vrai nom et je pourrai supprimer mon compte.</span>
        </label>

        <div
          v-if="turnstileSiteKey"
          class="cf-turnstile"
          :data-sitekey="turnstileSiteKey"
          data-action="learner_register"
          data-theme="auto"
        />

        <button class="primary-button is-full" type="submit" :disabled="submitting || loadingSuggestion || !suggestion">
          {{ submitting ? 'Création…' : 'Créer mon compte' }}
        </button>
      </form>

      <form v-else @submit.prevent="login">
        <label class="learner-field">
          <span>Pseudonyme</span>
          <input v-model="loginUsername" type="text" maxlength="80" autocomplete="username" autocapitalize="none" spellcheck="false" required>
        </label>
        <label class="learner-field">
          <span>Mot de passe</span>
          <input v-model="loginPassword" type="password" maxlength="200" autocomplete="current-password" required>
        </label>
        <button class="primary-button is-full" type="submit" :disabled="submitting">
          {{ submitting ? 'Connexion…' : 'Me connecter' }}
        </button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.learner-auth-page{display:grid;min-height:calc(100vh - 260px);padding:34px 16px;place-items:start center}.learner-card{width:min(620px,100%);padding:clamp(24px,5vw,42px);border:1px solid var(--line);border-radius:24px;background:var(--surface);box-shadow:var(--shadow)}.learner-eyebrow{margin:0 0 6px;color:var(--brand);font-size:.76rem;font-weight:850;letter-spacing:.12em;text-transform:uppercase}.learner-card h1{margin:0;color:var(--brand-dark);font-size:clamp(2rem,6vw,3.2rem);letter-spacing:-.05em}.learner-intro,.learner-card>p{color:var(--muted);line-height:1.55}.learner-tabs{display:grid;margin:24px 0;grid-template-columns:1fr 1fr;padding:4px;border-radius:14px;background:var(--surface-soft)}.learner-tabs button{padding:11px;border:0;border-radius:10px;color:var(--muted);background:transparent;font-weight:800;cursor:pointer}.learner-tabs button[aria-selected=true]{color:var(--brand-dark);background:var(--surface);box-shadow:0 4px 16px rgb(36 50 71 / 10%)}form{display:grid;gap:18px}.learner-field{display:grid;gap:7px;color:var(--ink);font-weight:750}.learner-field input{width:100%;box-sizing:border-box;padding:12px 14px;border:1px solid var(--line);border-radius:12px;color:var(--ink);background:var(--surface);font:inherit}.learner-field small{color:var(--muted);font-weight:500}.username-proposal{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:15px;border:1px solid var(--line);border-radius:15px;background:var(--surface-soft)}.username-proposal strong{color:var(--brand-dark);font-size:1.35rem}.username-proposal button{padding:8px 11px;border:1px solid var(--line);border-radius:99px;color:var(--brand-dark);background:var(--surface);font-weight:750;cursor:pointer}.privacy-check{display:flex;align-items:start;gap:10px;color:var(--muted);font-size:.9rem;line-height:1.5}.privacy-check input{margin-top:4px}.primary-button,.secondary-button{display:inline-flex;min-height:44px;align-items:center;justify-content:center;padding:10px 16px;border:0;border-radius:99px;text-decoration:none;font:inherit;font-weight:850;cursor:pointer}.primary-button{color:white;background:var(--brand)}.secondary-button{color:var(--brand-dark);background:var(--surface-soft);border:1px solid var(--line)}.is-full{width:100%}.primary-button:disabled,.username-proposal button:disabled{opacity:.55;cursor:wait}.learner-error{padding:11px 13px;border-radius:11px;color:var(--danger);background:color-mix(in srgb,var(--danger) 10%,transparent)}.honeypot{position:absolute!important;width:1px!important;height:1px!important;margin:-1px!important;padding:0!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;white-space:nowrap!important;border:0!important}.learner-recovery dl{display:grid;gap:10px;margin:24px 0}.learner-recovery dl>div{padding:14px;border-radius:13px;background:var(--surface-soft)}.learner-recovery dt{color:var(--muted);font-size:.76rem;font-weight:800;text-transform:uppercase}.learner-recovery dd{margin:5px 0 0;color:var(--brand-dark);font-size:1.12rem;font-weight:800;overflow-wrap:anywhere}.learner-recovery code{font-size:1rem}.learner-actions{display:flex;flex-wrap:wrap;gap:9px}.cf-turnstile{min-height:65px}@media(max-width:560px){.learner-auth-page{padding-inline:0}.learner-card{border-radius:18px}.username-proposal{align-items:stretch;flex-direction:column}.learner-actions>*{width:100%}}
</style>
