<script setup lang="ts">
import { faChevronDown, faChevronRight, faSpinner, faStop, faVolume } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { ConjugationTense } from '~~/shared/types/conjugation'
import type { ConsultedConjugation, VerbConsultation } from '~~/shared/types/verb-consultation'

const props = defineProps<{
  verbId?: number
  verbLabel?: string
  definition?: string
  tenses: ConjugationTense[]
  coachId?: number
  audioEnabled?: boolean
}>()

const { ui, uiLabel } = useLanguagePreferences()
const consultation = ref<VerbConsultation | null>(null)
const loading = ref(false)
const loadError = ref('')
const audioLoadingKey = ref('')
const audioPlayingKey = ref('')
const audioErrorKey = ref('')
let requestNumber = 0
let audio: HTMLAudioElement | null = null
let audioObjectUrl = ''
let audioController: AbortController | null = null

const displayedTenses = computed(() => props.tenses
  .filter(tense => tense.selected !== false)
  .map(tense => ({
    ...tense,
    rows: (consultation.value?.conjugations || []).filter(row => row.tenseId === tense.id),
  }))
  .filter(tense => tense.rows.length))

function displayedForm(row: ConsultedConjugation, form: string, mode: string) {
  if (mode.trim().toLocaleLowerCase('fr') === 'impératif') return `${form} !`
  const elidesJe = row.pronoun === 'je' && /^[aeiouyàâäéèêëîïôöùûüh]/iu.test(form)
  const phrase = elidesJe ? `j’${form}` : `${row.pronoun} ${form}`
  if (mode.trim().toLocaleLowerCase('fr') !== 'subjonctif') return phrase
  return /^[aeiouy]/iu.test(row.pronoun) ? `qu’${phrase}` : `que ${phrase}`
}

function tenseMode(tense: ConjugationTense) {
  return tense.mode?.name || ''
}

function lineText(row: ConsultedConjugation, tense: ConjugationTense) {
  const form = row.forms[0]
  return form ? displayedForm(row, form, tenseMode(tense)) : ''
}

function lineSegments(row: ConsultedConjugation, tense: ConjugationTense) {
  return lineText(row, tense).split(/\s+/u).filter(Boolean)
}

function clearAudio() {
  audio?.pause()
  if (audio) {
    audio.onended = null
    audio.onerror = null
  }
  audio = null
  if (audioObjectUrl) URL.revokeObjectURL(audioObjectUrl)
  audioObjectUrl = ''
  audioPlayingKey.value = ''
}

function stopAudio() {
  audioController?.abort()
  audioController = null
  audioLoadingKey.value = ''
  clearAudio()
}

async function toggleAudio(key: string, body: Record<string, unknown>) {
  if (audioLoadingKey.value === key || audioPlayingKey.value === key) {
    stopAudio()
    return
  }
  stopAudio()
  audioErrorKey.value = ''
  audioLoadingKey.value = key
  const controller = new AbortController()
  audioController = controller
  try {
    const response = await fetch('/api/speech/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, coachId: props.coachId }),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`Lecture audio indisponible (${response.status}).`)
    const blob = await response.blob()
    if (controller.signal.aborted) return
    audioController = null
    audioLoadingKey.value = ''
    audioObjectUrl = URL.createObjectURL(blob)
    audio = new Audio(audioObjectUrl)
    audioPlayingKey.value = key
    audio.onended = clearAudio
    audio.onerror = () => {
      audioErrorKey.value = key
      clearAudio()
    }
    await audio.play()
  }
  catch {
    if (controller.signal.aborted) return
    audioController = null
    audioLoadingKey.value = ''
    audioErrorKey.value = key
    clearAudio()
  }
}

async function loadConjugation() {
  const id = props.verbId
  const currentRequest = ++requestNumber
  consultation.value = null
  loadError.value = ''
  if (!id) return
  loading.value = true
  try {
    const response = await $fetch<VerbConsultation>(`/api/conjugaisons/${id}`)
    if (currentRequest === requestNumber) consultation.value = response
  }
  catch {
    if (currentRequest === requestNumber) loadError.value = ui('Impossible de charger la conjugaison de ce verbe.')
  }
  finally {
    if (currentRequest === requestNumber) loading.value = false
  }
}

watch(() => props.verbId, () => {
  stopAudio()
  void loadConjugation()
})

onMounted(() => void loadConjugation())
onBeforeUnmount(stopAudio)
</script>

<template>
  <div class="allophone-help">
    <section class="allophone-help__definition">
      <header>
        <h3>{{ ui('Définition') }}</h3>
        <button
          v-if="audioEnabled && verbLabel && definition"
          type="button"
          class="allophone-help__audio"
          :class="{ 'has-error': audioErrorKey === 'definition' }"
          :aria-label="ui('Écouter la définition')"
          :aria-pressed="audioPlayingKey === 'definition'"
          :title="audioErrorKey === 'definition' ? ui('La lecture audio a échoué. Réessayer.') : undefined"
          @click="toggleAudio('definition', { speechKind: 'definition', verb: verbLabel, definition })"
        >
          <FontAwesomeIcon
            :icon="audioLoadingKey === 'definition' ? faSpinner : audioPlayingKey === 'definition' ? faStop : faVolume"
            :spin="audioLoadingKey === 'definition'"
            aria-hidden="true"
          />
        </button>
      </header>
      <p><strong>{{ verbLabel }}</strong><template v-if="definition"> = {{ definition }}</template></p>
    </section>

    <p v-if="loading" class="allophone-help__status">{{ ui('Chargement de la conjugaison…') }}</p>
    <div v-else-if="loadError" class="allophone-help__error" role="alert">
      <p>{{ loadError }}</p>
      <button type="button" @click="loadConjugation">{{ ui('Réessayer') }}</button>
    </div>

    <details v-for="tense in displayedTenses" :key="tense.id" class="allophone-help__tense">
      <summary>
        <span class="allophone-help__tense-title">
          <span class="allophone-help__expand" aria-hidden="true">
            <FontAwesomeIcon class="allophone-help__expand-collapsed" :icon="faChevronRight" />
            <FontAwesomeIcon class="allophone-help__expand-open" :icon="faChevronDown" />
          </span>
          <span>{{ uiLabel(tense.name) }}</span>
        </span>
        <button
          v-if="audioEnabled"
          type="button"
          class="allophone-help__audio"
          :class="{ 'has-error': audioErrorKey === `tense-${tense.id}` }"
          :aria-label="ui('Écouter le nom du temps')"
          :aria-pressed="audioPlayingKey === `tense-${tense.id}`"
          :title="audioErrorKey === `tense-${tense.id}` ? ui('La lecture audio a échoué. Réessayer.') : undefined"
          @click.stop.prevent="toggleAudio(`tense-${tense.id}`, { speechKind: 'help', text: uiLabel(tense.name) })"
        >
          <FontAwesomeIcon
            :icon="audioLoadingKey === `tense-${tense.id}` ? faSpinner : audioPlayingKey === `tense-${tense.id}` ? faStop : faVolume"
            :spin="audioLoadingKey === `tense-${tense.id}`"
            aria-hidden="true"
          />
        </button>
      </summary>
      <ul>
        <li v-for="row in tense.rows" :key="row.id">
          <span class="allophone-help__forms">
            <template v-for="(form, index) in row.forms" :key="form">
              <span v-if="index" class="allophone-help__or">{{ ui('ou') }}</span>
              <span>{{ displayedForm(row, form, tenseMode(tense)) }}</span>
            </template>
          </span>
          <button
            v-if="audioEnabled && lineText(row, tense)"
            type="button"
            class="allophone-help__audio"
            :class="{ 'has-error': audioErrorKey === `line-${row.id}` }"
            :aria-label="ui('Écouter cette ligne')"
            :aria-pressed="audioPlayingKey === `line-${row.id}`"
            :title="audioErrorKey === `line-${row.id}` ? ui('La lecture audio a échoué. Réessayer.') : undefined"
            @click="toggleAudio(`line-${row.id}`, { speechKind: 'help-conjugation', segments: lineSegments(row, tense) })"
          >
            <FontAwesomeIcon
              :icon="audioLoadingKey === `line-${row.id}` ? faSpinner : audioPlayingKey === `line-${row.id}` ? faStop : faVolume"
              :spin="audioLoadingKey === `line-${row.id}`"
              aria-hidden="true"
            />
          </button>
        </li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
.allophone-help{display:grid;gap:12px}.allophone-help__definition,.allophone-help__tense{border:1px solid color-mix(in srgb,var(--coach-color,#295f72) 30%,#cfe0dc);border-radius:16px;background:color-mix(in srgb,var(--coach-color,#295f72) 5%,white);box-shadow:0 4px 14px rgb(37 75 78 / 6%)}.allophone-help__definition{padding:16px}.allophone-help__definition header{display:flex;align-items:center;justify-content:space-between;gap:12px}.allophone-help__definition h3{margin:0;color:#17566a;font-size:1rem}.allophone-help__definition p{margin:12px 0 0;color:#405b63;font-size:1rem;line-height:1.52}.allophone-help__audio{display:inline-grid;width:32px;height:32px;flex:0 0 auto;place-items:center;border:1px solid color-mix(in srgb,var(--coach-color,#295f72) 48%,#b9cccf);border-radius:50%;color:var(--coach-color,#295f72);background:white;cursor:pointer}.allophone-help__audio:hover,.allophone-help__audio:focus-visible{outline:2px solid color-mix(in srgb,var(--coach-color,#295f72) 25%,transparent);background:color-mix(in srgb,var(--coach-color,#295f72) 8%,white)}.allophone-help__audio.has-error{color:#a03e3e;border-color:#d69292}.allophone-help__tense{overflow:hidden}.allophone-help__tense summary{display:flex;padding:10px 12px;align-items:center;justify-content:space-between;gap:12px;color:#17566a;cursor:pointer;font-weight:850;list-style:none}.allophone-help__tense summary::-webkit-details-marker{display:none}.allophone-help__tense-title{display:flex;min-width:0;align-items:center;gap:10px}.allophone-help__expand{display:inline-grid;width:32px;height:32px;flex:0 0 auto;place-items:center;border:1px solid color-mix(in srgb,var(--coach-color,#295f72) 35%,#b9cccf);border-radius:50%;color:var(--coach-color,#295f72);background:color-mix(in srgb,var(--coach-color,#295f72) 5%,white)}.allophone-help__expand-open{display:none}.allophone-help__tense[open] .allophone-help__expand-collapsed{display:none}.allophone-help__tense[open] .allophone-help__expand-open{display:block}.allophone-help__tense[open] summary{border-bottom:1px solid #d7e4e2}.allophone-help__tense ul{display:grid;margin:0;padding:8px 14px 12px;list-style:none}.allophone-help__tense li{display:flex;min-height:44px;padding:7px 2px;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid #e2ecea;color:#294a51}.allophone-help__tense li:last-child{border-bottom:0}.allophone-help__forms{display:flex;min-width:0;flex-wrap:wrap;gap:5px}.allophone-help__or{color:#7a8d91;font-size:.8rem;font-style:italic}.allophone-help__status,.allophone-help__error{margin:0;padding:14px;border:1px solid #cfe0dc;border-radius:14px;color:#5a7076;background:#f1f7f7}.allophone-help__error{display:grid;gap:9px}.allophone-help__error p{margin:0}.allophone-help__error button{justify-self:start;padding:7px 10px;border:0;border-radius:9px;color:white;background:var(--coach-color,#295f72);cursor:pointer;font:inherit;font-weight:800}
:global(:root[data-theme='dark'] .allophone-help__definition),:global(:root[data-theme='dark'] .allophone-help__tense){border-color:#47666d;background:#1b3035}:global(:root[data-theme='dark'] .allophone-help__definition h3),:global(:root[data-theme='dark'] .allophone-help__tense summary){color:#b5e4e7}:global(:root[data-theme='dark'] .allophone-help__definition p),:global(:root[data-theme='dark'] .allophone-help__tense li){color:#d5e4e5}:global(:root[data-theme='dark'] .allophone-help__or){color:#9fb1b4}:global(:root[data-theme='dark'] .allophone-help__tense[open] summary),:global(:root[data-theme='dark'] .allophone-help__tense li){border-color:#385156}:global(:root[data-theme='dark'] .allophone-help__audio),:global(:root[data-theme='dark'] .allophone-help__expand){color:#b5e4e7;border-color:#53737a;background:#20383d}:global(:root[data-theme='dark'] .allophone-help__audio:hover),:global(:root[data-theme='dark'] .allophone-help__audio:focus-visible){background:#29464c}:global(:root[data-theme='dark'] .allophone-help__status),:global(:root[data-theme='dark'] .allophone-help__error){color:#bfd0d2;border-color:#47666d;background:#1b3035}
</style>
