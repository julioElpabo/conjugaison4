<script setup lang="ts">
import type {
  ExerciseSummaryItem,
  ExerciseSummaryTense,
} from '~~/shared/types/exercise-summary'

const props = defineProps<{
  presentation: 'classic' | 'chat'
  items: ExerciseSummaryItem[]
  verbs: string[]
  tenses: ExerciseSummaryTense[]
}>()
const emit = defineEmits<{ close: [] }>()
const { ui, interfaceLocale, localePath } = useLanguagePreferences()
const config = useRuntimeConfig()
const dialog = useTemplateRef<HTMLElement>('share-summary-dialog')
const closeButton = useTemplateRef<HTMLButtonElement>('close-button')
const busy = ref(true)
const error = ref('')
const token = ref('')
const copyStatus = ref('')
const canNativeShare = ref(false)

useDialogFocus(dialog, () => emit('close'), closeButton)

const shareUrl = computed(() => {
  if (!token.value) return ''
  const siteUrl = import.meta.client
    ? window.location.origin
    : String(config.public.siteUrl).replace(/\/$/u, '')
  return new URL(localePath(`/bilan/${token.value}`), `${siteUrl}/`).toString()
})

async function createShareLink() {
  if (busy.value && token.value) return
  busy.value = true
  error.value = ''
  copyStatus.value = ''
  try {
    const items = props.items.slice(0, 100).map((item, index) => ({
      index: index + 1,
      status: item.status,
      questionLabel: String(item.questionLabel || '').slice(0, 1000),
      learnerAnswer: String(item.learnerAnswer || '').slice(0, 1000),
      expectedAnswer: String(item.expectedAnswer || '').slice(0, 1000),
      errorLabels: (item.errorLabels || []).slice(0, 12).map(label => String(label).slice(0, 160)),
    }))
    const response = await $fetch<{ token: string }>('/api/bilans', {
      method: 'POST',
      body: {
        version: 1,
        locale: interfaceLocale.value,
        presentation: props.presentation,
        items,
        verbs: props.verbs.slice(0, 100).map(verb => String(verb).slice(0, 120)),
        tenses: props.tenses.slice(0, 50).map(tense => ({
          name: String(tense.name || '').slice(0, 120),
          ...(tense.mode ? { mode: String(tense.mode).slice(0, 120) } : {}),
        })),
      },
    })
    token.value = response.token
  } catch {
    error.value = ui('Le lien du bilan n’a pas pu être créé.')
  } finally {
    busy.value = false
  }
}

async function writeClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return
    } catch {
      // Repli pour les navigateurs qui refusent l’API Clipboard.
    }
  }
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  textarea.setSelectionRange(0, value.length)
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('Copie impossible')
}

async function copyLink() {
  if (!shareUrl.value) return
  try {
    await writeClipboard(shareUrl.value)
    copyStatus.value = ui('Lien copié')
  } catch {
    copyStatus.value = ui('La copie a échoué.')
  }
}

async function shareLink() {
  if (!shareUrl.value || !navigator.share) return
  try {
    await navigator.share({
      title: ui('Mon bilan de conjugaison'),
      text: ui('Voici mon bilan de conjugaison.'),
      url: shareUrl.value,
    })
  } catch {
    // L’annulation de la feuille de partage ne nécessite aucun message d’erreur.
  }
}

onMounted(() => {
  canNativeShare.value = typeof navigator.share === 'function'
  void createShareLink()
})
</script>

<template>
  <Teleport to="body">
    <div class="summary-share-overlay" @click.self="emit('close')">
      <section
        ref="share-summary-dialog"
        class="summary-share-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="summary-share-title"
        tabindex="-1"
      >
        <button ref="close-button" class="summary-share-dialog__close" type="button" :aria-label="ui('Fermer')" @click="emit('close')">×</button>
        <p class="summary-share-dialog__kicker">{{ ui('PARTAGER MON BILAN') }}</p>
        <h2 id="summary-share-title">{{ ui('Ton bilan est prêt à être envoyé') }}</h2>
        <p>{{ ui('Il te suffit d’envoyer ce lien à la personne de ton choix, par e-mail, WhatsApp ou tout autre moyen. En l’ouvrant, elle verra directement ton bilan. Le lien restera disponible pendant un mois.') }}</p>

        <div v-if="busy" class="summary-share-dialog__state" role="status">
          <span aria-hidden="true" />
          <strong>{{ ui('Création du lien…') }}</strong>
        </div>

        <template v-else-if="shareUrl">
          <label for="shared-summary-url">{{ ui('Lien complet à envoyer') }}</label>
          <div class="summary-share-dialog__link">
            <input id="shared-summary-url" :value="shareUrl" readonly @focus="($event.target as HTMLInputElement).select()">
            <button class="primary-button" type="button" @click="copyLink">{{ ui('Copier le lien') }}</button>
          </div>
          <p v-if="copyStatus" class="summary-share-dialog__copy-status" role="status">{{ copyStatus }}</p>
          <button v-if="canNativeShare" class="secondary-button summary-share-dialog__native-share" type="button" @click="shareLink">
            {{ ui('Partager avec une application…') }}
          </button>
          <small>{{ ui('Toute personne qui possède ce lien peut consulter le bilan.') }}</small>
        </template>

        <div v-else class="summary-share-dialog__error" role="alert">
          <p>{{ error }}</p>
          <button class="primary-button" type="button" @click="createShareLink">{{ ui('Réessayer') }}</button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.summary-share-overlay{position:fixed;z-index:2300;inset:0;display:grid;padding:20px;place-items:center;background:rgb(14 32 40 / 78%);backdrop-filter:blur(6px)}
.summary-share-dialog{position:relative;display:grid;width:min(620px,100%);padding:30px;gap:16px;border:1px solid #c5d7dc;border-radius:22px;color:var(--ink);background:var(--surface);box-shadow:0 30px 90px rgb(5 19 25 / 42%)}
.summary-share-dialog__close{position:absolute;top:16px;right:16px;display:grid;width:40px;height:40px;padding:0;place-items:center;border:1px solid var(--line);border-radius:50%;color:var(--muted);background:var(--surface);cursor:pointer;font-size:1.25rem}
.summary-share-dialog__kicker{margin:0;padding-right:48px;color:var(--brand);font-size:.72rem;font-weight:900;letter-spacing:.15em}
.summary-share-dialog h2{margin:0;padding-right:48px;color:var(--brand-dark);font-size:clamp(1.5rem,4vw,2rem)}
.summary-share-dialog>p:not(.summary-share-dialog__kicker,.summary-share-dialog__copy-status){margin:0;color:var(--muted);line-height:1.6}
.summary-share-dialog label{color:var(--brand-dark);font-size:.8rem;font-weight:850}
.summary-share-dialog__link{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px}
.summary-share-dialog__link input{width:100%;min-width:0;padding:12px;border:1px solid var(--line);border-radius:11px;color:var(--ink);background:var(--surface-soft);font:600 .86rem/1.3 ui-monospace,SFMono-Regular,Menlo,monospace}
.summary-share-dialog__link button{white-space:nowrap}
.summary-share-dialog__copy-status{min-height:22px;margin:-7px 0 0;color:var(--success);font-size:.82rem;font-weight:800}
.summary-share-dialog__native-share{justify-self:start}
.summary-share-dialog small{color:var(--muted);line-height:1.45}
.summary-share-dialog__state{display:grid;min-height:110px;place-content:center;justify-items:center;gap:12px;color:var(--brand-dark);background:var(--surface-soft);border-radius:14px}
.summary-share-dialog__state span{width:30px;height:30px;border:4px solid var(--line);border-top-color:var(--brand);border-radius:50%;animation:summary-share-spin .7s linear infinite}
.summary-share-dialog__error{display:grid;padding:16px;gap:12px;border-radius:14px;color:var(--danger);background:#fff1ef}
.summary-share-dialog__error p{margin:0}
.summary-share-dialog__error button{justify-self:start}
@keyframes summary-share-spin{to{transform:rotate(360deg)}}
@media(max-width:650px){.summary-share-overlay{padding:12px}.summary-share-dialog{padding:24px 18px}.summary-share-dialog__link{grid-template-columns:1fr}.summary-share-dialog__link button,.summary-share-dialog__native-share{width:100%}}
@media(prefers-reduced-motion:reduce){.summary-share-dialog__state span{animation:none}}
</style>
