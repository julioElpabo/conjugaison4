<script setup lang="ts">
import { contactCopy } from '~~/shared/i18n/contact'

const config = useRuntimeConfig()
const { interfaceLocale } = useLanguagePreferences()
const copy = computed(() => contactCopy(interfaceLocale.value))
const dialog = ref<HTMLDialogElement | null>(null)
const form = ref<HTMLFormElement | null>(null)
const email = ref('')
const subject = ref('')
const message = ref('')
const website = ref('')
const submitting = ref(false)
const sent = ref(false)
const errorMessage = ref('')
const turnstileSiteKey = String(config.public.turnstileSiteKey || '')
const constraints = reactive({
  enabled: true,
  subjectMinLength: 5,
  subjectMaxLength: 120,
  messageMinLength: 20,
  messageMaxLength: 3000,
})

useHead(() => ({
  script: turnstileSiteKey
    ? [{ src: 'https://challenges.cloudflare.com/turnstile/v0/api.js', async: true, defer: true }]
    : [],
}))

async function refreshConstraints() {
  try {
    Object.assign(constraints, await $fetch<typeof constraints>('/api/contact-settings'))
  }
  catch {
    // Les valeurs sûres par défaut restent actives si les réglages sont indisponibles.
  }
}

function open() {
  sent.value = false
  errorMessage.value = ''
  dialog.value?.showModal()
  void refreshConstraints()
}

function close() {
  if (submitting.value) return
  dialog.value?.close()
}

function closeOnBackdrop(event: MouseEvent) {
  if (event.target === dialog.value) close()
}

function turnstileToken() {
  if (!form.value) return ''
  return String(new FormData(form.value).get('cf-turnstile-response') || '')
}

function resetTurnstile() {
  const turnstile = (window as Window & {
    turnstile?: { reset: (container?: HTMLElement) => void }
  }).turnstile
  const container = form.value?.querySelector<HTMLElement>('.cf-turnstile')
  if (turnstile && container) turnstile.reset(container)
}

function retryTime(seconds: number) {
  const formatter = new Intl.RelativeTimeFormat(interfaceLocale.value, { numeric: 'always' })
  if (seconds >= 90 * 60) return formatter.format(Math.ceil(seconds / 3600), 'hour')
  return formatter.format(Math.max(1, Math.ceil(seconds / 60)), 'minute')
}

function humanError(error: unknown) {
  if (!error || typeof error !== 'object') return copy.value.error
  const candidate = error as {
    data?: {
      statusCode?: number
      data?: {
        rateLimitBucket?: string
        retryAfter?: number
        maximum?: number
      }
    }
  }
  if (candidate.data?.statusCode === 429) {
    const details = candidate.data.data
    if (
      details
      && ['contact-short', 'contact-daily'].includes(String(details.rateLimitBucket))
      && Number.isFinite(Number(details.retryAfter))
      && Number.isFinite(Number(details.maximum))
    ) {
      const template = details.rateLimitBucket === 'contact-daily'
        ? copy.value.dailyRateLimited
        : copy.value.shortRateLimited
      return template
        .replace('{maximum}', String(details.maximum))
        .replace('{when}', retryTime(Number(details.retryAfter)))
    }
    return copy.value.rateLimited
  }
  return copy.value.error
}

async function submit() {
  if (submitting.value) return
  submitting.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        email: email.value,
        subject: subject.value,
        message: message.value,
        website: website.value,
        turnstileToken: turnstileToken(),
      },
    })
    sent.value = true
    email.value = ''
    subject.value = ''
    message.value = ''
    website.value = ''
  }
  catch (error) {
    errorMessage.value = humanError(error)
    resetTurnstile()
  }
  finally {
    submitting.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <dialog
    ref="dialog"
    class="contact-dialog"
    :aria-labelledby="sent ? 'contact-success-title' : 'contact-title'"
    @click="closeOnBackdrop"
    @cancel="submitting && $event.preventDefault()"
  >
    <section class="contact-dialog__card">
      <button class="contact-dialog__close" type="button" :aria-label="copy.close" :title="copy.close" :disabled="submitting" @click="close">
        <span aria-hidden="true">×</span>
      </button>

      <div v-if="sent" class="contact-dialog__success" role="status">
        <span class="contact-dialog__success-icon" aria-hidden="true">✓</span>
        <h2 id="contact-success-title">{{ copy.successTitle }}</h2>
        <p>{{ copy.success }}</p>
        <button class="contact-dialog__primary" type="button" @click="close">{{ copy.close }}</button>
      </div>

      <template v-else>
        <header class="contact-dialog__header">
          <span class="contact-dialog__eyebrow">CONTACT</span>
          <h2 id="contact-title">{{ copy.title }}</h2>
          <p>{{ copy.intro }}</p>
        </header>

        <form ref="form" class="contact-dialog__form" @submit.prevent="submit">
          <label>
            <span>{{ copy.email }}</span>
            <input
              v-model.trim="email"
              type="email"
              maxlength="254"
              autocomplete="email"
              :placeholder="copy.emailPlaceholder"
              required
            >
          </label>

          <label>
            <span>{{ copy.subject }}</span>
            <input
              v-model.trim="subject"
              type="text"
              :minlength="constraints.subjectMinLength"
              :maxlength="constraints.subjectMaxLength"
              :placeholder="copy.subjectPlaceholder"
              required
            >
          </label>

          <label>
            <span>{{ copy.message }}</span>
            <textarea
              v-model.trim="message"
              :minlength="constraints.messageMinLength"
              :maxlength="constraints.messageMaxLength"
              rows="6"
              :placeholder="copy.messagePlaceholder"
              required
            />
            <small>{{ copy.characters.replace('{count}', String(constraints.messageMinLength)) }}</small>
          </label>

          <label class="contact-dialog__honeypot" aria-hidden="true">
            Site internet
            <input v-model="website" name="website" type="text" tabindex="-1" autocomplete="off">
          </label>

          <div
            v-if="turnstileSiteKey"
            class="cf-turnstile"
            :data-sitekey="turnstileSiteKey"
            data-action="contact"
            data-theme="auto"
          />

          <p v-if="errorMessage" class="contact-dialog__error" role="alert">{{ errorMessage }}</p>
          <p v-else-if="!constraints.enabled" class="contact-dialog__error" role="status">{{ copy.unavailable }}</p>
          <p class="contact-dialog__privacy">{{ copy.privacy }}</p>

          <div class="contact-dialog__actions">
            <button type="button" :disabled="submitting" @click="close">{{ copy.cancel }}</button>
            <button class="contact-dialog__primary" type="submit" :disabled="submitting || !constraints.enabled">
              {{ submitting ? copy.sending : copy.send }}
            </button>
          </div>
        </form>
      </template>
    </section>
  </dialog>
</template>

<style scoped>
.contact-dialog {
  width: min(650px, calc(100% - 28px));
  max-height: calc(100dvh - 28px);
  padding: 0;
  overflow: auto;
  border: 0;
  border-radius: 24px;
  color: var(--ink);
  background: transparent;
  box-shadow: 0 28px 80px rgb(18 35 54 / 28%);
}

.contact-dialog::backdrop {
  background: rgb(12 29 45 / 58%);
  backdrop-filter: blur(4px);
}

.contact-dialog__card {
  position: relative;
  padding: clamp(24px, 5vw, 42px);
  background: var(--surface);
}

.contact-dialog__close {
  position: absolute;
  z-index: 1;
  top: 14px;
  right: 14px;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--muted);
  background: var(--surface-soft);
  font: inherit;
  font-size: 1.55rem;
  line-height: 1;
  cursor: pointer;
}

.contact-dialog__eyebrow {
  color: var(--accent);
  font-size: .75rem;
  font-weight: 900;
  letter-spacing: .14em;
}

.contact-dialog__header h2,
.contact-dialog__success h2 {
  margin: 5px 44px 10px 0;
  color: var(--brand-dark);
  font-size: clamp(1.7rem, 5vw, 2.35rem);
  letter-spacing: -.035em;
}

.contact-dialog__header p,
.contact-dialog__success p {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
}

.contact-dialog__form {
  display: grid;
  gap: 16px;
  margin-top: 24px;
}

.contact-dialog__form label {
  display: grid;
  gap: 7px;
  font-weight: 800;
}

.contact-dialog__form input,
.contact-dialog__form textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  color: var(--ink);
  background: var(--surface);
  font: inherit;
  font-weight: 500;
}

.contact-dialog__form textarea {
  min-height: 130px;
  resize: vertical;
  line-height: 1.45;
}

.contact-dialog__form input:focus,
.contact-dialog__form textarea:focus {
  border-color: var(--brand);
  outline: 3px solid color-mix(in srgb, var(--brand) 18%, transparent);
}

.contact-dialog__form small,
.contact-dialog__privacy {
  color: var(--muted);
  font-size: .8rem;
  font-weight: 500;
}

.contact-dialog__privacy {
  margin: -4px 0 0;
  line-height: 1.45;
}

.contact-dialog__error {
  margin: 0;
  padding: 11px 13px;
  border-radius: 11px;
  color: var(--danger);
  background: color-mix(in srgb, var(--danger) 10%, transparent);
}

.contact-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.contact-dialog__actions button,
.contact-dialog__success button {
  min-height: 44px;
  padding: 10px 18px;
  border: 1px solid var(--line);
  border-radius: 99px;
  color: var(--brand-dark);
  background: var(--surface-soft);
  font: inherit;
  font-weight: 850;
  cursor: pointer;
}

.contact-dialog__actions .contact-dialog__primary,
.contact-dialog__success .contact-dialog__primary {
  border-color: #7052a0;
  color: white;
  background: #7052a0;
}

.contact-dialog__actions button:disabled,
.contact-dialog__close:disabled {
  opacity: .55;
  cursor: wait;
}

.contact-dialog__honeypot {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  margin: -1px !important;
  padding: 0 !important;
  overflow: hidden !important;
  clip: rect(0 0 0 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

.contact-dialog__success {
  display: grid;
  min-height: 280px;
  justify-items: center;
  align-content: center;
  text-align: center;
}

.contact-dialog__success h2 {
  margin-right: 0;
}

.contact-dialog__success-icon {
  display: grid;
  width: 64px;
  height: 64px;
  margin-bottom: 10px;
  border-radius: 50%;
  place-items: center;
  color: white;
  background: var(--success);
  font-size: 2rem;
  font-weight: 900;
}

.contact-dialog__success button {
  margin-top: 24px;
}

.cf-turnstile {
  min-height: 65px;
}

@media (max-width: 520px) {
  .contact-dialog {
    width: calc(100% - 16px);
    max-height: calc(100dvh - 16px);
    border-radius: 18px;
  }

  .contact-dialog__card {
    padding: 24px 18px;
  }

  .contact-dialog__actions {
    align-items: stretch;
    flex-direction: column-reverse;
  }
}
</style>
