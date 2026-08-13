<script setup lang="ts">
import type { ConjugationMode, ConjugationTense } from '~~/shared/types/conjugation'
import type { ConsultedConjugation, VerbConsultation } from '~~/shared/types/verb-consultation'
import { conjugationModeOrder, conjugationTenseLabel, conjugationTenseOrder, conjugationTenseRow, isFiniteConjugationMode } from '~~/shared/data/conjugation-display'

const props = withDefaults(defineProps<{
  verbId: number
  headerColor?: string
}>(), {
  headerColor: '#344758',
})
const emit = defineEmits<{ close: [] }>()
const { ui, uiLabel } = useLanguagePreferences()
const dialog = useTemplateRef<HTMLElement>('dialog')
const closeButton = useTemplateRef<HTMLButtonElement>('close-button')
const detail = ref<VerbConsultation | null>(null)
const modes = ref<ConjugationMode[]>([])
const tenses = ref<ConjugationTense[]>([])
const loading = ref(true)
const loadError = ref('')
let previouslyFocused: HTMLElement | null = null
let requestNumber = 0

const groups = computed(() => [...modes.value]
  .filter(mode => isFiniteConjugationMode(mode.name))
  .sort((left, right) => conjugationModeOrder(left.name) - conjugationModeOrder(right.name) || left.id - right.id)
  .map(mode => {
    const modeTenses = [...tenses.value]
      .filter(tense => tense.modeId === mode.id)
      .sort((left, right) => conjugationTenseOrder(mode.name, left.name) - conjugationTenseOrder(mode.name, right.name) || left.id - right.id)
      .map(tense => ({
        ...tense,
        rows: (detail.value?.conjugations ?? []).filter(row => row.tenseId === tense.id),
      }))
      .filter(tense => tense.rows.length)
    const rows = new Map<number, typeof modeTenses>()
    for (const tense of modeTenses) {
      const row = conjugationTenseRow(mode.name, tense.name)
      rows.set(row, [...(rows.get(row) ?? []), tense])
    }
    return { mode, tenseRows: [...rows.values()] }
  })
  .filter(group => group.tenseRows.length))

const nonFiniteForms = computed(() => {
  const verb = detail.value?.verb
  if (!verb) return []
  const isPronominal = /^(?:s['’]|se\s)/iu.test(verb.infinitif)
  const auxiliaryInfinitive = isPronominal ? 's’être' : (verb.auxiliaire ?? '')
  const auxiliaryParticiple = isPronominal
    ? 's’étant'
    : verb.auxiliaire?.toLocaleLowerCase('fr') === 'être' ? 'étant' : 'ayant'
  return [
    { mode: 'Infinitif', tense: 'présent', form: verb.infinitif },
    { mode: 'Infinitif', tense: 'passé', form: [auxiliaryInfinitive, verb.participePasse].filter(Boolean).join(' ') },
    { mode: 'Participe', tense: 'présent', form: verb.participePresent ?? '' },
    { mode: 'Participe', tense: 'passé', form: verb.participePasse ?? '' },
    { mode: 'Gérondif', tense: 'présent', form: verb.participePresent ? `en ${verb.participePresent}` : '' },
    { mode: 'Gérondif', tense: 'passé', form: verb.participePasse ? `en ${auxiliaryParticiple} ${verb.participePasse}` : '' },
  ].filter(item => item.form.trim())
})

function displayedForm(row: ConsultedConjugation, form: string, mode: string) {
  if (mode.trim().toLocaleLowerCase('fr') === 'impératif') return `${form} !`
  const elidesJe = row.pronoun === 'je' && /^[aeiouyàâäéèêëîïôöùûüh]/iu.test(form)
  const phrase = elidesJe ? `j’${form}` : `${row.pronoun} ${form}`
  if (mode.trim().toLocaleLowerCase('fr') !== 'subjonctif') return phrase
  return /^[aeiouy]/iu.test(row.pronoun) ? `qu’${phrase}` : `que ${phrase}`
}

function groupLabel(group: number | null) {
  if (group === 1) return ui('1er groupe')
  if (group === 2) return ui('2e groupe')
  if (group === 3) return ui('3e groupe')
  return ui('groupe irrégulier')
}

async function loadConsultation(id: number) {
  const currentRequest = ++requestNumber
  loading.value = true
  loadError.value = ''
  detail.value = null
  try {
    const [consultation, catalogue] = await Promise.all([
      $fetch<VerbConsultation>(`/api/conjugaisons/${id}`),
      $fetch<{ modes: ConjugationMode[], temps: ConjugationTense[] }>('/api/catalogue'),
    ])
    if (currentRequest !== requestNumber) return
    detail.value = consultation
    modes.value = catalogue.modes
    tenses.value = catalogue.temps
  }
  catch {
    if (currentRequest === requestNumber) loadError.value = ui('Impossible de charger la conjugaison de ce verbe.')
  }
  finally {
    if (currentRequest === requestNumber) loading.value = false
  }
}

function close() {
  emit('close')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopImmediatePropagation()
    close()
    return
  }
  if (event.key !== 'Tab' || !dialog.value) return
  const focusable = [...dialog.value.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter(element => element.offsetParent !== null)
  if (!focusable.length) return
  const first = focusable[0]!
  const last = focusable[focusable.length - 1]!
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  }
  else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => {
  previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
  document.addEventListener('keydown', onKeydown, true)
  void loadConsultation(props.verbId)
  nextTick(() => closeButton.value?.focus())
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown, true)
  previouslyFocused?.focus()
})

watch(() => props.verbId, id => void loadConsultation(id))
</script>

<template>
  <Teleport to="body">
    <div class="verb-consultation-overlay" @click.self="close">
      <section
        ref="dialog"
        class="verb-consultation-dialog"
        :style="{ '--verb-consultation-header': headerColor }"
        role="dialog"
        aria-modal="true"
        :aria-label="ui('Consulter le verbe')"
      >
        <header>
          <strong>{{ ui('Consulter le verbe') }}</strong>
          <button ref="close-button" type="button" :aria-label="ui('Fermer')" @click="close">×</button>
        </header>
        <div class="verb-consultation-content">
          <p v-if="loading" class="verb-consultation-state" role="status">{{ ui('Chargement de la conjugaison…') }}</p>
          <div v-else-if="loadError" class="verb-consultation-state verb-consultation-state--error" role="alert">
            <p>{{ loadError }}</p>
            <button type="button" @click="loadConsultation(verbId)">{{ ui('Réessayer') }}</button>
          </div>
          <template v-else-if="detail">
            <header class="verb-consultation-heading">
              <div>
                <h2>{{ detail.verb.infinitif }}</h2>
              </div>
              <dl>
                <div><dt>{{ ui('Groupe') }}</dt><dd>{{ groupLabel(detail.verb.groupeConjugaison) }}</dd></div>
                <div><dt>{{ ui('Auxiliaire') }}</dt><dd>{{ detail.verb.auxiliaire }}</dd></div>
              </dl>
            </header>

            <nav class="verb-consultation-nav" :aria-label="ui('Accès aux modes')">
              <a v-for="group in groups" :key="group.mode.id" :href="`#modal-mode-${group.mode.id}`">{{ uiLabel(group.mode.name) }}</a>
              <a href="#modal-non-finite">{{ ui('Formes non personnelles') }}</a>
            </nav>

            <section v-for="group in groups" :id="`modal-mode-${group.mode.id}`" :key="group.mode.id" class="verb-mode-section">
              <h2>{{ uiLabel(group.mode.name) }}</h2>
              <div class="verb-tense-grid">
                <template v-for="(tenseRow, rowIndex) in group.tenseRows" :key="rowIndex">
                  <article v-for="tense in tenseRow" :key="tense.id">
                    <h3>{{ uiLabel(conjugationTenseLabel(group.mode.name, tense.name)) }}</h3>
                    <ul>
                      <li v-for="row in tense.rows" :key="row.id">
                        <template v-for="(form, index) in row.forms" :key="form"><span v-if="index" class="verb-form-or">{{ ui('ou') }}</span><span>{{ displayedForm(row, form, group.mode.name) }}</span></template>
                      </li>
                    </ul>
                  </article>
                </template>
              </div>
            </section>

            <section id="modal-non-finite" class="verb-mode-section">
              <h2>{{ ui('Formes non personnelles') }}</h2>
              <div class="verb-non-finite-grid">
                <article v-for="item in nonFiniteForms" :key="`${item.mode}-${item.tense}`">
                  <small>{{ uiLabel(item.mode) }} · {{ uiLabel(item.tense) }}</small>
                  <strong>{{ item.form }}</strong>
                </article>
              </div>
            </section>
          </template>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.verb-consultation-overlay {
  position: fixed;
  z-index: 2400;
  inset: 0;
  display: grid;
  padding: 20px;
  place-items: center;
  background: rgb(16 31 42 / 76%);
  backdrop-filter: blur(7px);
}
.verb-consultation-dialog {
  display: grid;
  width: min(1180px, calc(100vw - 40px));
  height: min(94vh, 1040px);
  overflow: hidden;
  grid-template-rows: auto minmax(0, 1fr);
  border: 1px solid rgb(255 255 255 / 64%);
  border-radius: 22px;
  background: var(--surface);
  box-shadow: 0 30px 90px rgb(5 19 28 / 46%);
}
.verb-consultation-dialog > header {
  display: flex;
  min-height: 58px;
  padding: 10px 14px 10px 20px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: white;
  background: var(--verb-consultation-header);
}
.verb-consultation-dialog > header strong { font-size: 1.05rem; }
.verb-consultation-dialog > header button {
  width: 38px;
  height: 38px;
  border: 1px solid rgb(255 255 255 / 52%);
  border-radius: 11px;
  color: white;
  background: rgb(255 255 255 / 10%);
  cursor: pointer;
  font: inherit;
  font-size: 1.5rem;
  line-height: 1;
}
.verb-consultation-dialog > header button:hover,
.verb-consultation-dialog > header button:focus-visible { background: rgb(255 255 255 / 22%); }
.verb-consultation-content { min-height: 0; padding: clamp(18px, 3vw, 32px); overflow-y: auto; scroll-behavior: smooth; background: var(--surface-soft); }
.verb-consultation-state { display: grid; min-height: 260px; margin: 0; place-items: center; color: var(--muted); text-align: center; }
.verb-consultation-state--error { align-content: center; gap: 14px; color: var(--danger); }
.verb-consultation-state--error p { margin: 0; }
.verb-consultation-state--error button { padding: 9px 16px; border: 0; border-radius: 10px; color: white; background: var(--brand); cursor: pointer; font: inherit; font-weight: 800; }
.verb-consultation-heading { display: flex; align-items: end; justify-content: space-between; gap: 24px; }
.verb-consultation-heading h2 { margin: 3px 0 0; color: var(--brand-dark); font-size: clamp(2rem, 5vw, 3.6rem); line-height: 1; }
.verb-consultation-heading dl { display: flex; margin: 0; gap: 10px; }
.verb-consultation-heading dl div { min-width: 110px; padding: 10px 13px; border: 1px solid var(--line); border-radius: 12px; background: var(--surface); }
.verb-consultation-heading dt { color: var(--muted); font-size: .68rem; font-weight: 850; text-transform: uppercase; }
.verb-consultation-heading dd { margin: 3px 0 0; font-weight: 850; }
.verb-consultation-nav { position: sticky; z-index: 2; top: -32px; display: flex; margin: 24px 0; padding: 12px 0; gap: 7px; overflow-x: auto; background: var(--surface-soft); }
.verb-consultation-nav a { padding: 8px 12px; border: 1px solid var(--line); border-radius: 999px; color: var(--brand-dark); background: var(--surface); text-decoration: none; font-size: .8rem; font-weight: 850; white-space: nowrap; }
.verb-mode-section { scroll-margin-top: 58px; }
.verb-mode-section + .verb-mode-section { margin-top: 30px; }
.verb-mode-section > h2 { margin: 0 0 13px; color: var(--brand-dark); font-size: 1.55rem; }
.verb-tense-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.verb-tense-grid article, .verb-non-finite-grid article { padding: 15px; border: 1px solid var(--line); border-radius: 15px; background: var(--surface); }
.verb-tense-grid h3 { margin: 0 0 10px; color: var(--brand); font-size: 1rem; }
.verb-tense-grid ul { display: grid; margin: 0; padding: 0; gap: 4px; list-style: none; }
.verb-tense-grid li { display: flex; gap: 6px; flex-wrap: wrap; line-height: 1.45; }
.verb-form-or { color: var(--muted); font-size: .78rem; font-weight: 750; }
.verb-non-finite-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.verb-non-finite-grid article { display: grid; gap: 5px; }
.verb-non-finite-grid small { color: var(--muted); }

@media (max-width: 680px) {
  .verb-consultation-overlay { padding: 0; }
  .verb-consultation-dialog { width: 100vw; height: 100dvh; border: 0; border-radius: 0; }
  .verb-consultation-heading { align-items: stretch; flex-direction: column; }
  .verb-consultation-heading dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .verb-tense-grid { grid-template-columns: 1fr; }
  .verb-non-finite-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
