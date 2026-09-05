<script setup lang="ts">
import QrcodeVue from 'qrcode.vue'
import type { SavedChallenge } from '~~/shared/types/saved-challenge'
import { savedChallengeCardCopy } from '~~/shared/i18n/saved-challenge-card'
import { copyText } from '~/utils/copy-text'

const props = defineProps<{ challenge: SavedChallenge, dateLabel: string, dateTime?: string, readOnly?: boolean }>()
const emit = defineEmits<{ updated: [value: { code: string, title: string, description: string }] }>()
const { interfaceLocale, localePath } = useLanguagePreferences()
const config = useRuntimeConfig()
const copy = computed(() => savedChallengeCardCopy(interfaceLocale.value))
const challengePath = computed(() => localePath(`/defi/${props.challenge.code}`))
const shareUrl = computed(() => new URL(challengePath.value, import.meta.client ? window.location.origin : String(config.public.siteUrl)).toString())
const qrOpen = ref(false)
const editing = ref(false)
const saving = ref(false)
const title = ref('')
const description = ref('')
const error = ref('')
const notice = ref('')
const copyStatus = ref<'idle' | 'success' | 'error'>('idle')
const titleInput = useTemplateRef<HTMLInputElement>('title-input')
const editButton = useTemplateRef<HTMLButtonElement>('edit-button')
const valid = computed(() => title.value.trim().length >= 1 && title.value.trim().length <= 80 && description.value.trim().length <= 1000)
let copyTimer: ReturnType<typeof setTimeout> | undefined

async function copyCode() {
  if (copyTimer) clearTimeout(copyTimer)
  try { await copyText(props.challenge.code); copyStatus.value = 'success' }
  catch { copyStatus.value = 'error' }
  copyTimer = setTimeout(() => { copyStatus.value = 'idle' }, 4000)
}
async function edit() {
  title.value = props.challenge.title
  description.value = props.challenge.description
  error.value = ''
  notice.value = ''
  editing.value = true
  await nextTick()
  titleInput.value?.focus()
}
async function cancel() {
  if (saving.value) return
  editing.value = false
  error.value = ''
  await nextTick()
  editButton.value?.focus()
}
async function save() {
  if (saving.value || !valid.value || props.readOnly) return
  saving.value = true
  error.value = ''
  try {
    const result = await $fetch<{ code: string, title: string, description: string }>(`/api/learner/saved-challenges/${encodeURIComponent(props.challenge.code)}`, {
      method: 'PATCH', credentials: 'same-origin', body: { title: title.value.trim(), description: description.value.trim() },
    })
    emit('updated', result)
    editing.value = false
    notice.value = copy.value.saved
    await nextTick()
    editButton.value?.focus()
  } catch { error.value = copy.value.error }
  finally { saving.value = false }
}
onBeforeUnmount(() => { if (copyTimer) clearTimeout(copyTimer) })
</script>

<template>
  <article class="saved-card">
    <header class="saved-card__top">
      <div class="saved-card__heading">
        <time v-if="dateTime" :datetime="dateTime">{{ dateLabel }}</time><span v-else />
        <button v-if="!readOnly && !editing" ref="edit-button" type="button" class="saved-card__edit" @click="edit"><span aria-hidden="true">✎</span> {{ copy.edit }}</button>
      </div>
      <form v-if="editing" class="saved-card__form" @submit.prevent="save" @keydown.esc.stop.prevent="cancel">
        <p class="saved-card__scope">{{ copy.scopeHint }}</p>
        <label :for="`saved-title-${challenge.code}`">{{ copy.title }}</label>
        <input :id="`saved-title-${challenge.code}`" ref="title-input" v-model="title" maxlength="80" required :disabled="saving">
        <small>{{ title.length }}/80</small>
        <label :for="`saved-description-${challenge.code}`">{{ copy.description }} <span>· {{ copy.optional }}</span></label>
        <textarea :id="`saved-description-${challenge.code}`" v-model="description" rows="4" maxlength="1000" :disabled="saving" />
        <small>{{ description.length }}/1000</small>
        <p v-if="error" class="saved-card__error" role="alert">{{ error }}</p>
        <div class="saved-card__form-actions"><button type="button" :disabled="saving" @click="cancel">{{ copy.cancel }}</button><button type="submit" class="saved-card__primary" :disabled="saving || !valid">{{ saving ? copy.saving : copy.save }}</button></div>
      </form>
      <div v-else class="saved-card__content">
        <h4>{{ challenge.title }}</h4>
        <p v-if="challenge.description" class="saved-card__description">{{ challenge.description }}</p>
        <p v-if="notice" class="saved-card__notice" role="status">{{ notice }}</p>
      </div>
      <dl class="saved-card__stats">
        <div><dt>{{ copy.verbs }}</dt><dd>{{ challenge.verbCount }}</dd></div>
        <div><dt>{{ copy.tenses }}</dt><dd>{{ challenge.tenseCount }}</dd></div>
        <div><dt>{{ copy.questions }}</dt><dd>{{ challenge.questionCount }}</dd></div>
      </dl>
    </header>

    <div class="saved-card__share">
      <div class="saved-card__code">
        <span>{{ copy.code }}</span><strong>{{ challenge.code }}</strong>
        <button type="button" class="saved-card__copy" @click="copyCode">{{ copyStatus === 'success' ? copy.copied : copy.copy }}</button>
        <span class="saved-card__copy-status" :class="{ 'saved-card__sr-only': copyStatus === 'success' }" role="status">{{ copyStatus === 'error' ? copy.copyError : copyStatus === 'success' ? copy.copied : '' }}</span>
      </div>
      <button type="button" class="saved-card__qr" :aria-label="`${copy.expand} — ${challenge.title}`" @click="qrOpen = true">
        <QrcodeVue :value="shareUrl" :size="104" :margin="4" level="M" render-as="svg" background="#ffffff" foreground="#000000" aria-hidden="true" />
        <span>{{ copy.expand }}</span>
      </button>
    </div>
    <NuxtLink class="saved-card__launch" :to="challengePath">{{ copy.launch }} <span aria-hidden="true">→</span></NuxtLink>
    <LearnerSavedChallengeQrDialog v-if="qrOpen" :url="shareUrl" :title="challenge.title" :code="challenge.code" @close="qrOpen = false" />
  </article>
</template>

<style scoped>
.saved-card__scope{margin:0 0 5px;color:var(--muted);font-size:.76rem;line-height:1.45}.saved-card__sr-only{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.saved-card{--card-padding:20px;display:flex;min-width:0;padding:var(--card-padding);flex-direction:column;gap:16px;border:2px solid color-mix(in srgb,#7052a0 58%,var(--line));border-radius:20px;background:var(--surface);box-shadow:0 8px 22px rgb(46 31 73 / 14%),0 2px 5px rgb(46 31 73 / 8%)}.saved-card__top{display:grid;gap:14px;margin:calc(0px - var(--card-padding)) calc(0px - var(--card-padding)) 0;padding:14px var(--card-padding);border-radius:18px 18px 0 0;background:color-mix(in srgb,#7052a0 12%,var(--surface))}.saved-card__heading{display:flex;align-items:center;justify-content:space-between;gap:12px}.saved-card time{color:var(--ink);font-size:.76rem;font-weight:750}.saved-card button{font:inherit;cursor:pointer}.saved-card button:disabled{opacity:.5;cursor:default}.saved-card button:focus-visible,.saved-card a:focus-visible,.saved-card input:focus-visible,.saved-card textarea:focus-visible{outline:3px solid #8c6cba;outline-offset:3px}.saved-card__edit{display:flex;padding:6px 9px;align-items:center;gap:6px;border:1px solid var(--line);border-radius:8px;color:var(--ink);background:var(--surface);font-size:.76rem!important}.saved-card__content h4{margin:0;color:var(--ink);font-size:1.15rem;line-height:1.35;overflow-wrap:anywhere}.saved-card__description{margin:8px 0 0;color:var(--muted);font-size:.87rem;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere}.saved-card__stats{display:flex;flex-wrap:nowrap;align-items:center;justify-content:flex-start;gap:clamp(8px,2vw,18px);margin:0;text-align:left;font-weight:400}.saved-card__stats div{display:flex;flex-direction:row-reverse;align-items:center;gap:4px;white-space:nowrap}.saved-card__stats dt{color:var(--muted);font-size:.7rem;font-weight:400}.saved-card__stats dd{margin:0;color:var(--ink);font-size:.8rem;font-weight:400}.saved-card__share{display:grid;grid-template-columns:minmax(0,1fr) 112px;align-items:center;gap:14px;margin-top:auto;padding:16px 0;border-bottom:1px solid var(--line)}.saved-card__code{display:flex;min-width:0;align-items:flex-start;flex-direction:column;gap:8px}.saved-card__code>span:first-child{color:var(--muted);font-size:.72rem}.saved-card__code strong{color:var(--ink);font-size:clamp(.9rem,1.8vw,1.2rem);letter-spacing:.05em;white-space:nowrap;user-select:all}.saved-card__copy{padding:8px 11px;border:1px solid color-mix(in srgb,#7052a0 35%,var(--line));border-radius:9px;color:var(--ink);background:color-mix(in srgb,#7052a0 8%,var(--surface));font-size:.76rem!important;font-weight:750!important}.saved-card__copy-status{font-size:.72rem;color:var(--muted)}.saved-card__copy-status:empty{display:none}.saved-card__qr{display:grid;padding:4px;justify-items:center;gap:5px;border:1px solid var(--line);border-radius:12px;color:var(--ink);background:var(--surface)}.saved-card__qr svg{display:block;border-radius:7px}.saved-card__qr span{padding:0 2px 4px;font-size:.68rem;line-height:1.3}.saved-card__qr:hover{border-color:#8c6cba}.saved-card__launch{display:flex;min-height:42px;align-items:center;justify-content:center;gap:12px;border-radius:11px;color:white;background:#7052a0;font-size:.84rem;font-weight:800;text-decoration:none}.saved-card__launch:hover{background:#5c408d}.saved-card__form{display:grid;gap:7px}.saved-card__form label{color:var(--ink);font-size:.8rem;font-weight:750}.saved-card__form label span{font-weight:400;color:var(--muted)}.saved-card__form input,.saved-card__form textarea{box-sizing:border-box;width:100%;min-width:0;padding:10px;border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--ink);font:inherit}.saved-card__form textarea{resize:vertical}.saved-card__form small{justify-self:end;color:var(--muted);font-size:.7rem}.saved-card__form-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}.saved-card__form-actions button{padding:9px 12px;border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--ink);font-size:.8rem}.saved-card__form-actions .saved-card__primary{color:white;border-color:#7052a0;background:#7052a0}.saved-card__error{color:var(--danger);font-size:.8rem}.saved-card__notice{margin:8px 0 0;color:var(--success);font-size:.76rem}
@media(max-width:380px){.saved-card{--card-padding:15px}.saved-card__share{grid-template-columns:minmax(0,1fr) 104px;gap:8px}.saved-card__qr svg{width:94px;height:94px}.saved-card__code strong{font-size:.9rem;letter-spacing:0}}
</style>
