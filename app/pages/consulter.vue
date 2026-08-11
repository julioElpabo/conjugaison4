<script setup lang="ts">
const { ui, uiLabel } = useLanguagePreferences()
import type { ConjugationMode, ConjugationTense, Verb } from '~~/shared/types/conjugation'
import type { ConsultedConjugation, VerbConsultation } from '~~/shared/types/verb-consultation'
import { conjugationModeOrder, conjugationTenseLabel, conjugationTenseOrder, conjugationTenseRow, isFiniteConjugationMode } from '~~/shared/data/conjugation-display'
import { matchingVerbs, normalizeVerbSearch } from '~~/shared/utils/verb-search'
import { analyzeConjugationTraps, conjugationTrapFormKey, type ConjugationTrap } from '~~/shared/utils/conjugation-traps'

interface Catalogue {
  verbes: Verb[]
  modes: ConjugationMode[]
  temps: ConjugationTense[]
}

const route = useRoute()
const router = useRouter()
const embeddedInChallenge = computed(() => route.query.embed === 'challenge')
const { track } = useSiteAnalytics()
const query = ref('')
const suggestionsOpen = ref(false)
const activeSuggestion = ref(0)
const activeTab = ref<'search' | 'list'>('search')
const showingDetail = ref(false)
const transitionDirection = ref<'forward' | 'back'>('forward')
const consultationContainer = useTemplateRef<HTMLElement>('consultation-container')
const alphabetList = useTemplateRef<HTMLElement>('alphabet-list')
const selectedId = ref<number | null>(null)
const detail = ref<VerbConsultation | null>(null)
const detailLoading = ref(false)
const detailError = ref('')
const agreementOpen = ref(false)
const trapsOpen = ref(false)
let detailRequest = 0

useHead(() => ({
  title: ui('Consulter un verbe'),
  meta: [{ name: 'description', content: ui('Recherchez un verbe et consultez sa conjugaison à tous les modes et à tous les temps.') }],
}))

const { data: catalogue, status, error, refresh } = await useFetch<Catalogue>('/api/catalogue', {
  key: 'public-conjugation-catalogue',
})

const verbs = computed(() => [...(catalogue.value?.verbes ?? [])]
  .sort((left, right) => left.infinitif.localeCompare(right.infinitif, 'fr') || left.id - right.id))

const suggestions = computed(() => normalizeVerbSearch(query.value)
  ? matchingVerbs(verbs.value, query.value).slice(0, 10)
  : [])

const alphabetGroups = computed(() => {
  const groups = new Map<string, Verb[]>()
  for (const verb of verbs.value) {
    const letter = verb.infinitif.normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0).toLocaleUpperCase('fr') || '#'
    const values = groups.get(letter) ?? []
    values.push(verb)
    groups.set(letter, values)
  }
  return [...groups].map(([letter, values]) => ({ letter, verbs: values }))
})

const groups = computed(() => [...(catalogue.value?.modes ?? [])]
  .filter(mode => isFiniteConjugationMode(mode.name))
  .sort((left, right) => conjugationModeOrder(left.name) - conjugationModeOrder(right.name) || left.id - right.id)
  .map(mode => {
    const tenses = [...(catalogue.value?.temps ?? [])]
      .filter(tense => tense.modeId === mode.id)
      .sort((left, right) => conjugationTenseOrder(mode.name, left.name) - conjugationTenseOrder(mode.name, right.name) || left.id - right.id)
      .map(tense => ({
        ...tense,
        rows: (detail.value?.conjugations ?? []).filter(row => row.tenseId === tense.id),
      }))
      .filter(tense => tense.rows.length)
    const rows = new Map<number, typeof tenses>()
    for (const tense of tenses) {
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

const trapAnalysis = computed(() => detail.value
  ? analyzeConjugationTraps(
      detail.value.verb,
      detail.value.conjugations,
      catalogue.value?.temps ?? [],
      catalogue.value?.modes ?? [],
      detail.value.trapExampleComplement,
    )
  : { traps: [], markers: [] })

const trapById = computed(() => new Map(trapAnalysis.value.traps.map(trap => [trap.id, trap])))
const trapMarkersByForm = computed(() => {
  const markers = new Map<string, typeof trapAnalysis.value.markers>()
  for (const marker of trapAnalysis.value.markers) {
    const key = conjugationTrapFormKey(marker.tenseId, marker.personId, marker.form)
    markers.set(key, [...(markers.get(key) ?? []), marker])
  }
  return markers
})

function startsWithElidableSound(value: string, infinitive: string) {
  const normalized = value.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr')
  if ('aeiouy'.includes(normalized.charAt(0))) return true
  return normalized.startsWith('h') && infinitive.toLocaleLowerCase('fr') !== 'haïr'
}

function displayedForm(row: ConsultedConjugation, form: string, mode: string) {
  if (mode.toLocaleLowerCase('fr') === 'impératif') return `${form} !`
  const pronoun = row.pronoun
  const phrase = pronoun === 'je' && startsWithElidableSound(form, detail.value?.verb.infinitif ?? '')
    ? `j’${form}`
    : `${pronoun} ${form}`
  if (mode.toLocaleLowerCase('fr') !== 'subjonctif') return phrase
  return /^[aeiouy]/iu.test(pronoun) ? `qu’${phrase}` : `que ${phrase}`
}

function displayedFormSegments(row: ConsultedConjugation, form: string, mode: string) {
  const phrase = displayedForm(row, form, mode)
  const formOffset = phrase.lastIndexOf(form)
  const markers = trapMarkersByForm.value.get(conjugationTrapFormKey(row.tenseId, row.personId, form)) ?? []
  if (formOffset < 0 || !markers.length) return [{ text: phrase, trap: null }]

  const ranges = markers.map(marker => ({
    start: formOffset + marker.start,
    end: formOffset + marker.start + marker.length,
    priority: marker.priority,
    trap: trapById.value.get(marker.trapId) ?? null,
  })).filter(range => range.trap && range.start < range.end)
  const boundaries = [...new Set([0, phrase.length, ...ranges.flatMap(range => [range.start, range.end])])]
    .sort((left, right) => left - right)
  return boundaries.slice(0, -1).flatMap((start, index) => {
    const end = boundaries[index + 1]!
    const active = ranges.filter(range => range.start <= start && range.end >= end)
      .sort((left, right) => right.priority - left.priority)[0]
    const text = phrase.slice(start, end)
    return text ? [{ text, trap: active?.trap ?? null }] : []
  })
}

function trapToneClass(trap: ConjugationTrap) {
  return `trap-tone--${trap.tone}`
}

function acceptedFormColumnCount(rows: ConsultedConjugation[]) {
  return Math.max(1, ...rows.map(row => row.forms.length))
}

function isIndicativeMode(mode: string) {
  return mode.trim().toLocaleLowerCase('fr-CH') === 'indicatif'
}

function groupLabel(group: number | null) {
  if (!group) return ui('groupe irrégulier')
  if (group === 1) return ui('1er groupe')
  if (group === 2) return ui('2e groupe')
  return ui('3e groupe')
}

function agreementGenderLabel(gender: 'masculin' | 'feminin') {
  return gender === 'feminin' ? ui('féminin') : ui('masculin')
}

async function loadVerb(id: number) {
  const request = ++detailRequest
  selectedId.value = id
  agreementOpen.value = false
  trapsOpen.value = false
  detailLoading.value = true
  detailError.value = ''
  try {
    const response = await $fetch<VerbConsultation>(`/api/conjugaisons/${id}`)
    if (request === detailRequest) detail.value = response
  } catch {
    if (request === detailRequest) {
      detail.value = null
      detailError.value = ui('Impossible de charger la conjugaison de ce verbe.')
    }
  } finally {
    if (request === detailRequest) detailLoading.value = false
  }
}

async function selectVerb(verb: Verb) {
  track('feature_selected', { feature: 'consult.verb', item: String(verb.id) })
  query.value = verb.infinitif
  suggestionsOpen.value = false
  activeSuggestion.value = 0
  transitionDirection.value = 'forward'
  showingDetail.value = true
  void router.replace({ query: { ...route.query, verbe: String(verb.id) } })
  await loadVerb(verb.id)
  if (detail.value?.verb.id === verb.id) {
    track('feature_completed', { feature: 'consult.verb', item: String(verb.id) })
  }
  else {
    track('feature_failed', { feature: 'consult.verb', item: String(verb.id) })
  }
  nextTick(() => consultationContainer.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

onMounted(() => track('feature_exposed', { feature: 'consult.verb' }))

onBeforeUnmount(() => {
  if (import.meta.client) document.body.classList.remove('is-verb-consultation-print')
})

function returnToSelection() {
  transitionDirection.value = 'back'
  query.value = ''
  selectedId.value = null
  suggestionsOpen.value = false
  activeSuggestion.value = 0
  showingDetail.value = false
  detailError.value = ''
  const { verbe: _verb, ...queryWithoutVerb } = route.query
  void router.replace({ query: queryWithoutVerb })
  nextTick(() => consultationContainer.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

function returnFromConsultation() {
  if (embeddedInChallenge.value && import.meta.client && window.parent !== window) {
    window.parent.postMessage({ type: 'tatitotu:close-verb-consultation' }, window.location.origin)
    return
  }
  returnToSelection()
}

function selectTab(tab: 'search' | 'list') {
  activeTab.value = tab
  suggestionsOpen.value = false
}

function preferredScrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

function scrollToLetter(letter: string) {
  const list = alphabetList.value
  const target = document.getElementById(`letter-${letter}`)
  if (!list || !target) return
  list.scrollTo({ top: target.offsetTop - list.offsetTop - 10, behavior: preferredScrollBehavior() })
}

function scrollToMode(targetId: string) {
  document.getElementById(targetId)?.scrollIntoView({ behavior: preferredScrollBehavior(), block: 'start' })
}

function printConsultation() {
  if (!import.meta.client) return
  const clearPrintMode = () => document.body.classList.remove('is-verb-consultation-print')
  document.body.classList.add('is-verb-consultation-print')
  window.addEventListener('afterprint', clearPrintMode, { once: true })
  window.print()
}

function onSearchInput() {
  activeSuggestion.value = 0
  suggestionsOpen.value = suggestions.value.length > 0
}

function closeSuggestions() {
  window.setTimeout(() => { suggestionsOpen.value = false }, 120)
}

function onSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    suggestionsOpen.value = false
    return
  }
  if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key) || !suggestions.value.length) return
  event.preventDefault()
  if (event.key === 'Enter') {
    const verb = suggestions.value[activeSuggestion.value]
    if (verb) selectVerb(verb)
    return
  }
  const direction = event.key === 'ArrowDown' ? 1 : -1
  activeSuggestion.value = (activeSuggestion.value + direction + suggestions.value.length) % suggestions.value.length
  suggestionsOpen.value = true
}

const initialId = Number(route.query.verbe)
if (Number.isSafeInteger(initialId) && initialId !== 0) {
  const initialVerb = verbs.value.find(verb => verb.id === initialId)
  if (initialVerb) query.value = initialVerb.infinitif
  await loadVerb(initialId)
  showingDetail.value = true
}
</script>

<template>
  <div class="reference-page" :class="{ 'reference-page--embedded': embeddedInChallenge }">
    <header v-if="!embeddedInChallenge" class="reference-hero">
      <p class="reference-eyebrow">{{ ui('Le conjugueur') }}</p>
      <h1>{{ ui('Consulter un verbe') }}</h1>
    </header>

    <div v-if="status === 'pending'" class="reference-state" role="status">{{ ui('Chargement du catalogue…') }}</div>
    <div v-else-if="error" class="reference-state reference-state--error" role="alert">
      <p>{{ ui('Le catalogue n’a pas pu être chargé.') }}</p>
      <button type="button" @click="refresh()">{{ ui('Réessayer') }}</button>
    </div>

    <section v-else ref="consultation-container" class="consultation-container" aria-live="polite">
      <Transition :name="transitionDirection === 'forward' ? 'slide-forward' : 'slide-back'" mode="out-in">
        <div v-if="!showingDetail" key="selection" class="consultation-panel selection-panel">
          <div class="consultation-tabs" role="tablist" :aria-label="ui('Méthode de recherche du verbe')">
            <button
              id="search-tab"
              type="button"
              role="tab"
              :aria-selected="activeTab === 'search'"
              aria-controls="search-panel"
              :class="{ 'is-active': activeTab === 'search' }"
              @click="selectTab('search')"
            > {{ ui('Rechercher un verbe') }} </button>
            <button
              id="list-tab"
              type="button"
              role="tab"
              :aria-selected="activeTab === 'list'"
              aria-controls="list-panel"
              :class="{ 'is-active': activeTab === 'list' }"
              @click="selectTab('list')"
            > {{ ui('Liste de A à Z') }} </button>
          </div>

          <div v-if="activeTab === 'search'" id="search-panel" class="tab-panel search-tab-panel" role="tabpanel" aria-labelledby="search-tab">
            <div>
              <p class="reference-eyebrow">{{ ui('Recherche rapide') }}</p>
              <h2>{{ ui('Quel verbe cherches-tu ?') }}</h2>
              <p>{{ ui('Commence à écrire son infinitif, puis choisis-le dans les propositions.') }}</p>
            </div>
            <div class="verb-combobox">
              <input
                id="public-verb-search"
                v-model="query"
                type="search"
                role="combobox"
                autocomplete="off"
                spellcheck="false"
                :placeholder="ui('Par exemple : venir')"
                :aria-label="ui('Rechercher un verbe')"
                aria-autocomplete="list"
                aria-controls="public-verb-suggestions"
                :aria-expanded="suggestionsOpen"
                :aria-activedescendant="suggestionsOpen ? `public-verb-option-${suggestions[activeSuggestion]?.id}` : undefined"
                @input="onSearchInput"
                @focus="suggestionsOpen = suggestions.length > 0"
                @blur="closeSuggestions"
                @keydown="onSearchKeydown"
              >
              <ul v-if="suggestionsOpen" id="public-verb-suggestions" role="listbox">
                <li v-for="(verb, index) in suggestions" :id="`public-verb-option-${verb.id}`" :key="verb.id" role="option" :aria-selected="index === activeSuggestion">
                  <button type="button" :class="{ 'is-active': index === activeSuggestion }" @mousedown.prevent @click="selectVerb(verb)">
                    <strong>{{ verb.infinitif }}</strong>
                    <small>{{ groupLabel(verb.groupeConjugaison) }}</small>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div v-else id="list-panel" class="tab-panel list-tab-panel" role="tabpanel" aria-labelledby="list-tab">
            <div class="alphabet-heading">
              <div>
                <p class="reference-eyebrow">{{ ui('Catalogue complet') }}</p>
                <h2>{{ ui('Tous les verbes de A à Z') }}</h2>
              </div>
              <span>{{ verbs.length }} {{ verbs.length === 1 ? ui('verbe') : ui('verbes') }}</span>
            </div>
            <nav class="letter-nav" :aria-label="ui('Accès aux lettres')">
              <button v-for="group in alphabetGroups" :key="group.letter" type="button" @click="scrollToLetter(group.letter)">
                {{ group.letter }}
              </button>
            </nav>
            <div ref="alphabet-list" class="alphabet-list">
              <div class="alphabet-groups">
                <section v-for="group in alphabetGroups" :id="`letter-${group.letter}`" :key="group.letter" class="letter-group">
                  <h3>{{ group.letter }}</h3>
                  <div>
                    <button v-for="verb in group.verbs" :key="verb.id" type="button" :class="{ 'is-selected': selectedId === verb.id }" @click="selectVerb(verb)">
                      {{ verb.infinitif }}
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        <div v-else key="detail" class="consultation-panel detail-panel" :class="{ 'detail-panel--has-open-notes': agreementOpen || trapsOpen }">
          <div class="detail-toolbar">
            <button class="back-button" type="button" @click="returnFromConsultation">
              <span aria-hidden="true">←</span> {{ embeddedInChallenge ? ui('Retour au défi') : ui('Retour au choix du verbe') }}
            </button>
            <button v-if="detail" class="print-consultation-button" type="button" @click="printConsultation">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                <path d="M7 2.75h6.8L19 7.95v13.3H7z" />
                <path d="M13.5 2.75v5.5H19" />
                <path d="M9.3 16.9v-4.4h1.45a1.35 1.35 0 0 1 0 2.7H9.3m4.05 1.7v-4.4h1.05c1.35 0 2.15.8 2.15 2.2s-.8 2.2-2.15 2.2zm4.7 0v-4.4h2.65m-2.65 1.85h2.2" />
              </svg>
              {{ ui('Exporter en PDF') }}
            </button>
          </div>

          <div v-if="detailLoading" class="reference-state" role="status">{{ ui('Chargement de la conjugaison…') }}</div>
          <div v-else-if="detailError" class="reference-state reference-state--error" role="alert">
            <p>{{ detailError }}</p>
            <button type="button" @click="returnFromConsultation">{{ embeddedInChallenge ? ui('Retour au défi') : ui('Retour à la liste') }}</button>
          </div>
          <template v-else-if="detail">
            <header class="conjugation-heading">
              <h2>{{ detail.verb.infinitif }}</h2>
              <dl>
                <div><dt>{{ ui('Groupe') }}</dt><dd>{{ groupLabel(detail.verb.groupeConjugaison) }}</dd></div>
                <div><dt>{{ ui('Auxiliaire') }}</dt><dd>{{ detail.verb.auxiliaire }}</dd></div>
              </dl>
            </header>

            <div class="conjugation-disclosures">
              <button
                type="button"
                :aria-expanded="agreementOpen"
                :aria-controls="`agreement-panel-${detail.verb.id}`"
                @click="agreementOpen = !agreementOpen"
              >
                <span>{{ agreementOpen ? ui('Masquer le COD') : ui('Voir avec un COD') }}</span>
                <span class="disclosure-chevron" aria-hidden="true">⌄</span>
              </button>
              <button
                type="button"
                :aria-expanded="trapsOpen"
                aria-controls="consult-trap-legend"
                @click="trapsOpen = !trapsOpen"
              >
                <span>{{ trapsOpen ? ui('Masquer les pièges') : ui('Voir les pièges') }}</span>
                <span class="disclosure-chevron" aria-hidden="true">⌄</span>
              </button>
            </div>

            <div
              class="detail-disclosure"
              :class="{ 'is-open': agreementOpen }"
              :aria-hidden="!agreementOpen"
              :inert="!agreementOpen"
            >
              <div class="detail-disclosure__inner">
                <section :id="`agreement-panel-${detail.verb.id}`" class="agreement-panel" :aria-labelledby="`agreement-title-${detail.verb.id}`">
                  <header v-if="detail.pastParticipleAgreement">
                    <p class="reference-eyebrow">{{ ui('Le participe passé avec avoir') }}</p>
                    <h3 :id="`agreement-title-${detail.verb.id}`">{{ ui('La place du COD change l’accord') }}</h3>
                  </header>
                  <div v-if="detail.pastParticipleAgreement" class="agreement-examples">
                    <article>
                      <span class="agreement-badge">{{ ui('COD placé après') }}</span>
                      <p class="agreement-sentence">{{ detail.pastParticipleAgreement.afterSentence }}</p>
                      <p class="agreement-rule">{{ ui('Avec avoir, le participe passé ne s’accorde pas avec le COD placé après.') }}</p>
                    </article>
                    <article>
                      <span class="agreement-badge agreement-badge--before">{{ ui('COD placé avant') }}</span>
                      <p class="agreement-sentence">
                        {{ detail.pastParticipleAgreement.beforeSentenceStart }}{{ detail.pastParticipleAgreement.agreedParticipleStart }}<mark>{{ detail.pastParticipleAgreement.agreementLetters }}</mark>{{ detail.pastParticipleAgreement.beforeSentenceEnd }}
                      </p>
                      <p class="agreement-rule">
                        {{ ui('COD « {cod} » placé avant : accord avec le COD ({gender}, {number}).', {
                          cod: detail.pastParticipleAgreement.cod,
                          gender: agreementGenderLabel(detail.pastParticipleAgreement.gender),
                          number: ui(detail.pastParticipleAgreement.number),
                        }) }}
                      </p>
                    </article>
                  </div>
                  <template v-else>
                    <header>
                      <p class="reference-eyebrow">{{ ui('Avec un COD') }}</p>
                      <h3 :id="`agreement-title-${detail.verb.id}`">{{ ui('Exemple indisponible') }}</h3>
                    </header>
                    <p class="agreement-rule">{{ ui('Aucun exemple avec un COD n’est disponible pour ce verbe.') }}</p>
                  </template>
                </section>
              </div>
            </div>

            <div
              class="detail-disclosure"
              :class="{ 'is-open': trapsOpen }"
              :aria-hidden="!trapsOpen"
              :inert="!trapsOpen"
            >
              <div class="detail-disclosure__inner">
                <aside id="consult-trap-legend" class="trap-legend">
                  <header>
                    <p class="reference-eyebrow">{{ ui('Difficultés repérées') }}</p>
                    <h3>{{ ui('Pièges à surveiller pour « {verb} »', { verb: detail.verb.infinitif }) }}</h3>
                  </header>
                  <p v-if="!trapAnalysis.traps.length" class="trap-legend__empty">{{ ui('Aucun piège particulier n’a été détecté dans les formes de ce verbe.') }}</p>
                  <ul v-else>
                    <li v-for="trap in trapAnalysis.traps" :key="trap.id" :class="trapToneClass(trap)">
                      <span aria-hidden="true" />
                      <div>
                        <strong>{{ uiLabel(trap.title) }}</strong>
                        <p>{{ uiLabel(trap.explanation) }}</p>
                        <small v-for="example in trap.examples" :key="example">{{ example }}</small>
                      </div>
                    </li>
                  </ul>
                </aside>
              </div>
            </div>

            <nav class="mode-nav" :aria-label="ui('Accès aux modes')">
              <button v-for="group in groups" :key="group.mode.id" type="button" @click="scrollToMode(`consult-mode-${group.mode.id}`)">
                {{ uiLabel(group.mode.name) }}
              </button>
              <button type="button" @click="scrollToMode('consult-non-finite')">{{ ui('Formes non personnelles') }}</button>
            </nav>

            <section
              v-for="group in groups"
              :id="`consult-mode-${group.mode.id}`"
              :key="group.mode.id"
              class="mode-section"
              :class="{ 'mode-section--indicative': isIndicativeMode(group.mode.name) }"
            >
              <h2>{{ uiLabel(group.mode.name) }}</h2>
              <div class="tense-grid">
                <div v-for="(tenseRow, rowIndex) in group.tenseRows" :key="rowIndex" class="tense-row">
                  <article v-for="tense in tenseRow" :key="tense.id" class="tense-consult-card">
                    <h3 :id="`consult-tense-${tense.id}`">{{ uiLabel(conjugationTenseLabel(group.mode.name, tense.name)) }}</h3>
                    <table
                      class="conjugation-table"
                      :class="{ 'conjugation-table--alternatives': acceptedFormColumnCount(tense.rows) > 1 }"
                      :aria-labelledby="`consult-tense-${tense.id}`"
                    >
                      <tbody>
                        <tr v-for="row in tense.rows" :key="row.id">
                          <template v-for="(form, index) in row.forms" :key="form">
                            <td
                              class="conjugation-form"
                              :colspan="index === row.forms.length - 1 ? 2 * (acceptedFormColumnCount(tense.rows) - row.forms.length) + 1 : 1"
                            >
                              <template v-for="(segment, segmentIndex) in displayedFormSegments(row, form, group.mode.name)" :key="segmentIndex"><mark v-if="segment.trap && trapsOpen" class="conjugation-trap-mark" :class="trapToneClass(segment.trap)" :title="uiLabel(segment.trap.title)">{{ segment.text }}</mark><span v-else>{{ segment.text }}</span></template>
                            </td>
                            <td v-if="index < row.forms.length - 1" class="alternative-separator">
                              <span>{{ ui('ou') }}</span>
                            </td>
                          </template>
                        </tr>
                      </tbody>
                    </table>
                  </article>
                </div>
              </div>
            </section>

            <section id="consult-non-finite" class="mode-section">
              <h2>{{ ui('Formes non personnelles') }}</h2>
              <div class="non-finite-grid">
                <article v-for="item in nonFiniteForms" :key="`${item.mode}-${item.tense}`">
                  <p>{{ uiLabel(item.mode) }} · {{ uiLabel(item.tense) }}</p>
                  <strong>{{ item.form }}</strong>
                </article>
              </div>
            </section>

            <div v-if="embeddedInChallenge" class="consultation-return-bottom">
              <button class="back-button" type="button" @click="returnFromConsultation">
                <span aria-hidden="true">←</span> {{ ui('Retour au défi') }}
              </button>
            </div>
          </template>
        </div>
      </Transition>
    </section>
  </div>
</template>

<style scoped>
.reference-page { color: var(--ink); font-family: "Funnel Sans", "Avenir Next", Avenir, system-ui, sans-serif; }
.reference-page--embedded { min-height: 100%; }
.reference-hero { max-width: 760px; margin: 8px auto 34px; text-align: center; }
.reference-hero h1 { margin: 4px 0 12px; color: #294c4b; font-size: clamp(2.3rem, 6vw, 4.6rem); letter-spacing: -.055em; line-height: 1; }
.reference-eyebrow { margin: 0 0 5px; color: var(--brand); font-size: .76rem; font-weight: 850; letter-spacing: .13em; text-transform: uppercase; }
.reference-state { display: grid; min-height: 180px; place-items: center; padding: 28px; border: 1px solid var(--line); border-radius: 22px; background: rgb(255 255 255 / 88%); color: var(--muted); text-align: center; }
.reference-state--error { color: var(--danger); }
.reference-state button { padding: 9px 16px; border: 0; border-radius: 99px; color: white; background: var(--brand); }
.consultation-container { max-width: 1080px; margin: 0 auto 24px; overflow: hidden; border: 1px solid var(--line); border-radius: 24px; background: rgb(255 255 255 / 93%); box-shadow: var(--shadow); scroll-margin-top: 18px; }
.consultation-panel { padding: 28px; }
.reference-page--embedded .consultation-container { max-width: none; margin: 0; border: 0; border-radius: 0; box-shadow: none; }
.reference-page--embedded .consultation-panel { padding: clamp(18px, 3vw, 32px); }
.consultation-return-bottom { display: flex; padding-top: 32px; justify-content: center; }
.consultation-return-bottom .back-button { margin: 0; }
.consultation-tabs { display: grid; width: min(560px, 100%); margin: 0 auto 30px; padding: 5px; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 5px; border-radius: 15px; background: #e8efed; }
.consultation-tabs button { min-height: 45px; padding: 8px 14px; border: 0; border-radius: 11px; color: var(--muted); background: transparent; font-weight: 800; cursor: pointer; }
.consultation-tabs button:hover { color: var(--brand-dark); }
.consultation-tabs button.is-active { color: white; background: var(--brand); box-shadow: 0 5px 14px rgb(36 73 66 / 18%); }
.tab-panel h2, .alphabet-heading h2 { margin: 0; color: var(--brand-dark); font-size: clamp(1.35rem, 3vw, 2rem); letter-spacing: -.03em; }
.search-tab-panel { display: grid; min-height: 300px; grid-template-columns: minmax(340px, .8fr) minmax(300px, 1.2fr); align-items: center; gap: 38px; padding: 20px 28px 42px; }
.search-tab-panel > div:first-child > p:last-child { max-width: 390px; margin: 10px 0 0; color: var(--muted); line-height: 1.55; }
.verb-combobox { position: relative; }
.verb-combobox input { width: 100%; min-height: 54px; padding: 12px 18px; border: 1px solid #aabdb8; border-radius: 15px; color: var(--ink); background: white; font-size: 1.05rem; }
.verb-combobox input:focus { outline: 3px solid rgb(217 130 50 / 24%); border-color: var(--accent); }
.verb-combobox ul { position: absolute; z-index: 10; top: calc(100% + 7px); right: 0; left: 0; max-height: 330px; margin: 0; padding: 6px; overflow: auto; border: 1px solid var(--line); border-radius: 15px; background: white; box-shadow: 0 18px 42px rgb(36 50 71 / 18%); list-style: none; }
.verb-combobox button { display: flex; width: 100%; justify-content: space-between; gap: 12px; padding: 10px 12px; border: 0; border-radius: 10px; color: var(--ink); background: transparent; text-align: left; }
.verb-combobox button:hover, .verb-combobox button.is-active { background: var(--brand-pale); }
.verb-combobox small { color: var(--muted); }
.list-tab-panel { min-height: 520px; }
.alphabet-heading, .conjugation-heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; }
.alphabet-heading > span { padding: 6px 11px; border-radius: 99px; color: var(--brand-dark); background: var(--brand-pale); font-size: .82rem; font-weight: 750; }
.letter-nav, .mode-nav { display: flex; flex-wrap: wrap; gap: 7px; margin: 22px 0; }
.letter-nav button, .mode-nav button { display: grid; min-width: 34px; min-height: 34px; place-items: center; padding: 6px 10px; border: 1px solid var(--line); border-radius: 10px; color: var(--brand-dark); background: white; font-size: .86rem; font-weight: 800; cursor: pointer; }
.letter-nav button:hover, .mode-nav button:hover { border-color: var(--brand); background: var(--brand-pale); }
.alphabet-list { max-height: min(58vh, 620px); padding-right: 9px; overflow-y: auto; overscroll-behavior: contain; scrollbar-color: #a9bdb7 transparent; }
.alphabet-groups { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 24px; }
.letter-group { display: grid; grid-template-columns: 42px 1fr; align-items: start; gap: 10px; padding-top: 14px; border-top: 1px solid var(--line); scroll-margin-top: 18px; }
.letter-group h3 { position: sticky; top: 12px; margin: 0; color: var(--accent); font-size: 1.55rem; }
.letter-group > div { display: flex; flex-wrap: wrap; gap: 5px; }
.letter-group button { padding: 5px 8px; border: 0; border-radius: 7px; color: var(--ink); background: transparent; text-align: left; }
.letter-group button:hover, .letter-group button.is-selected { color: white; background: var(--brand); }
.detail-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 25px; }
.back-button { display: inline-flex; align-items: center; gap: 9px; margin: 0 0 25px; padding: 10px 15px 10px 11px; border: 1px solid #a9bdb7; border-radius: 999px; color: var(--brand-dark); background: white; font-weight: 800; cursor: pointer; }
.detail-toolbar .back-button { margin: 0; }
.back-button span { display: grid; width: 27px; height: 27px; place-items: center; border-radius: 50%; color: white; background: var(--brand); font-size: 1.15rem; transition: transform 150ms ease; }
.back-button:hover { border-color: var(--brand); background: var(--brand-pale); }
.back-button:hover span { transform: translateX(-2px); }
.print-consultation-button { display: inline-flex; min-height: 44px; align-items: center; justify-content: center; gap: 9px; padding: 9px 15px; border: 1px solid var(--brand); border-radius: 999px; color: white; background: var(--brand); font: inherit; font-weight: 400; letter-spacing: .055em; cursor: pointer; }
.print-consultation-button:hover { background: var(--brand-dark); }
.print-consultation-button:focus-visible { outline: 3px solid rgb(217 130 50 / 24%); outline-offset: 2px; }
.print-consultation-button svg { width: 21px; height: 21px; flex: 0 0 auto; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.conjugation-heading h2 { margin: 0; color: #294c4b; font-size: clamp(2.2rem, 5vw, 3.8rem); letter-spacing: -.05em; }
.conjugation-heading { align-items: center; }
.conjugation-disclosures { display: grid; width: 100%; margin-top: 15px; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.conjugation-disclosures button { display: inline-flex; width: 100%; min-height: 44px; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 12px; border: 1px solid #a9bdb7; border-radius: 11px; color: var(--brand-dark); background: white; font: inherit; font-size: .86rem; font-weight: 800; cursor: pointer; transition: border-color 150ms ease, background-color 150ms ease, color 150ms ease; }
.conjugation-disclosures button:hover, .conjugation-disclosures button[aria-expanded="true"] { border-color: var(--brand); background: var(--brand-pale); }
.conjugation-disclosures button:focus-visible { outline: 3px solid rgb(217 130 50 / 24%); outline-offset: 2px; }
.disclosure-chevron { font-size: 1.1rem; line-height: 1; transition: transform 220ms ease; }
.conjugation-disclosures button[aria-expanded="true"] .disclosure-chevron { transform: rotate(180deg); }
.conjugation-heading dl { display: flex; gap: 9px; margin: 0; }
.conjugation-heading dl div { padding: 8px 12px; border-radius: 12px; background: var(--soft); }
.conjugation-heading dt { color: var(--muted); font-size: .72rem; text-transform: uppercase; }
.conjugation-heading dd { margin: 2px 0 0; color: var(--brand-dark); font-weight: 750; }
.detail-disclosure { display: grid; margin: 0; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 300ms cubic-bezier(.22, .8, .3, 1), margin 300ms cubic-bezier(.22, .8, .3, 1), opacity 180ms ease; }
.detail-disclosure.is-open { margin: 22px 0; grid-template-rows: 1fr; opacity: 1; }
.detail-disclosure__inner { min-height: 0; overflow: hidden; }
.agreement-panel { display: grid; padding: clamp(18px, 3vw, 26px); border: 1px solid #bad4cc; border-radius: 19px; background: linear-gradient(135deg, #f5faf8, #edf6f3); gap: 17px; }
.agreement-panel h3 { margin: 0; color: var(--brand-dark); font-size: clamp(1.25rem, 3vw, 1.65rem); letter-spacing: -.025em; }
.agreement-examples { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.agreement-examples article { display: grid; align-content: start; padding: 16px; border: 1px solid rgb(62 112 99 / 18%); border-radius: 14px; background: rgb(255 255 255 / 82%); gap: 10px; }
.agreement-badge { justify-self: start; padding: 5px 9px; border-radius: 999px; color: #76511d; background: #f7e8c8; font-size: .73rem; font-weight: 850; letter-spacing: .04em; text-transform: uppercase; }
.agreement-badge--before { color: #205b4b; background: #d7eee6; }
.agreement-sentence { margin: 0; color: var(--ink); font-size: clamp(1.08rem, 2.3vw, 1.3rem); font-weight: 800; line-height: 1.45; }
.agreement-sentence mark { padding: 0 .08em; border-radius: 4px; color: #713a00; background: #ffd76a; box-shadow: 0 0 0 2px #ffd76a; }
.agreement-rule { margin: 0; color: var(--muted); font-size: .9rem; line-height: 1.5; }
.mode-nav { position: sticky; z-index: 3; top: 8px; margin-bottom: 8px; padding: 8px; border: 1px solid var(--line); border-radius: 14px; background: rgb(255 255 255 / 94%); box-shadow: 0 8px 20px rgb(36 50 71 / 8%); }
.trap-legend { display: grid; padding: clamp(18px, 3vw, 25px); border: 1px solid #ddc88e; border-radius: 18px; background: #fffaf0; gap: 16px; }
.trap-legend h3 { margin: 0; color: var(--brand-dark); font-size: clamp(1.2rem, 2.8vw, 1.55rem); }
.trap-legend ul { display: grid; margin: 0; padding: 0; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; list-style: none; }
.trap-legend li { display: grid; padding: 13px; grid-template-columns: 10px minmax(0, 1fr); gap: 10px; border: 1px solid rgb(80 92 105 / 14%); border-radius: 12px; background: rgb(255 255 255 / 80%); }
.trap-legend li > span { width: 10px; height: 100%; min-height: 38px; border-radius: 999px; background: var(--trap-color); }
.trap-legend li strong { color: var(--ink); font-size: .9rem; }
.trap-legend li p { margin: 3px 0 7px; color: var(--muted); font-size: .82rem; line-height: 1.42; }
.trap-legend li small { display: block; margin-top: 6px; color: var(--brand-dark); font-size: .78rem; font-weight: 750; line-height: 1.45; }
.trap-legend__empty { margin: 0; color: var(--muted); }
.trap-tone--orthography { --trap-color: #e5a225; --trap-surface: #ffe6a6; --trap-ink: #674300; }
.trap-tone--stem { --trap-color: #438ab8; --trap-surface: #cfeafa; --trap-ink: #184b6b; }
.trap-tone--ending { --trap-color: #cf6375; --trap-surface: #f8d5db; --trap-ink: #732d3a; }
.trap-tone--special { --trap-color: #8669b7; --trap-surface: #e5daf7; --trap-ink: #4d3676; }
.conjugation-trap-mark { padding: .05em .12em; border-radius: 4px; color: var(--trap-ink); background: var(--trap-surface); box-shadow: inset 0 -2px 0 var(--trap-color); }
.mode-section { padding-top: 18px; scroll-margin-top: 72px; }
.mode-section > h2 { margin: 0 0 14px; color: var(--brand-dark); font-size: 1.6rem; text-transform: capitalize; }
.tense-grid { display: grid; gap: 14px; }
.tense-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.tense-consult-card { padding: 18px; border: 1px solid var(--line); border-radius: 17px; background: var(--soft); }
.tense-consult-card h3 { margin: 0 0 12px; color: var(--brand); font-size: 1.05rem; text-transform: capitalize; }
.conjugation-table { width: 100%; border: 0; border-collapse: separate; border-spacing: 0 7px; color: var(--ink); line-height: 1.45; }
.conjugation-table--alternatives { table-layout: fixed; }
.conjugation-form { padding: 0; vertical-align: middle; }
.conjugation-table--alternatives .conjugation-form:first-child { text-align: right; }
.alternative-separator { width: 2.8rem; padding: 0 .35rem; color: var(--muted); text-align: center; vertical-align: middle; }
.alternative-separator span { display: inline-grid; min-width: 2rem; min-height: 1.5rem; padding: .12rem .35rem; place-items: center; border: 1px solid color-mix(in srgb, var(--line) 75%, transparent); border-radius: 999px; background: rgb(255 255 255 / 72%); font-size: .68rem; font-weight: 750; line-height: 1; }
.non-finite-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.non-finite-grid article { padding: 14px; border: 1px solid var(--line); border-radius: 15px; background: var(--soft); }
.non-finite-grid p { margin: 0 0 5px; color: var(--muted); font-size: .78rem; text-transform: capitalize; }
.non-finite-grid strong { color: var(--brand-dark); }
.slide-forward-enter-active, .slide-forward-leave-active, .slide-back-enter-active, .slide-back-leave-active { transition: transform 260ms cubic-bezier(.22, .8, .3, 1), opacity 190ms ease; }
.slide-forward-enter-from { transform: translateX(70px); opacity: 0; }
.slide-forward-leave-to { transform: translateX(-70px); opacity: 0; }
.slide-back-enter-from { transform: translateX(-70px); opacity: 0; }
.slide-back-leave-to { transform: translateX(70px); opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .slide-forward-enter-active, .slide-forward-leave-active, .slide-back-enter-active, .slide-back-leave-active { transition-duration: 1ms; }
  .detail-disclosure, .disclosure-chevron { transition-duration: 1ms; }
}
@media (max-width: 760px) {
  .search-tab-panel { min-height: 350px; grid-template-columns: 1fr; align-content: center; gap: 24px; padding: 10px 4px 30px; }
  .alphabet-groups, .tense-row, .agreement-examples, .trap-legend ul { grid-template-columns: 1fr; }
  .non-finite-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 480px) {
  .consultation-container { border-radius: 19px; }
  .consultation-panel { padding: 17px; }
  .consultation-tabs { margin-bottom: 22px; }
  .consultation-tabs button { padding: 7px; font-size: .82rem; }
  .letter-nav { gap: 5px; }
  .letter-nav button { min-width: 31px; padding: 5px 8px; }
  .non-finite-grid { grid-template-columns: 1fr; }
  .detail-toolbar { align-items: stretch; gap: 8px; }
  .detail-toolbar :is(.back-button, .print-consultation-button) { padding-right: 10px; font-size: .76rem; }
  .conjugation-heading { gap: 10px; }
  .conjugation-heading dl { gap: 5px; }
  .conjugation-heading dl div { padding: 6px 8px; }
  .conjugation-heading dt { font-size: .62rem; }
  .conjugation-heading dd { font-size: .8rem; }
  .conjugation-disclosures { gap: 6px; }
  .conjugation-disclosures button { min-width: 0; padding: 8px; font-size: .78rem; }
  .conjugation-table--alternatives,
  .conjugation-table--alternatives tbody,
  .conjugation-table--alternatives tr,
  .conjugation-table--alternatives td { display: block; width: 100%; }
  .conjugation-table--alternatives tr { padding: 5px 0; }
  .conjugation-table--alternatives .conjugation-form:first-child { text-align: left; }
  .conjugation-table--alternatives .alternative-separator { padding: 4px 0; text-align: left; }
  .conjugation-table--alternatives .alternative-separator span { min-width: 0; min-height: 0; padding: 0; border: 0; background: transparent; font-size: .7rem; }
}

@media print {
  .reference-page, .reference-page * { visibility: visible !important; }
  .reference-page { position: static; width: 100%; color: #111 !important; background: white !important; --ink: #111; --muted: #4b5560; --brand: #376b66; --brand-dark: #203f3e; --brand-pale: #e8f3f0; --soft: #f4f7f6; --line: #cbd3d1; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  .reference-hero, .detail-toolbar, .conjugation-disclosures, .mode-nav, .consultation-return-bottom { display: none !important; }
  .consultation-container { max-width: none; margin: 0; overflow: visible; border: 0; border-radius: 0; background: white; box-shadow: none; }
  .consultation-panel, .reference-page--embedded .consultation-panel { padding: 0; }
  .conjugation-heading { margin-bottom: 4mm; break-after: avoid; }
  .conjugation-heading h2 { color: #294c4b !important; font-size: 24pt; }
  .conjugation-heading dl { gap: 2mm; }
  .conjugation-heading dl div { padding: 2mm 3mm; background: var(--soft) !important; }
  .detail-disclosure { display: none; }
  .detail-disclosure.is-open { display: block; margin: 0 0 4mm; opacity: 1; }
  .detail-disclosure__inner { overflow: visible; }
  .agreement-panel, .trap-legend { padding: 4mm; gap: 2.5mm; box-shadow: none; }
  .agreement-examples, .trap-legend ul { gap: 2mm; }
  .agreement-examples article, .trap-legend li { padding: 3mm; gap: 1.5mm; }
  .agreement-panel h3, .trap-legend h3 { font-size: 11pt; }
  .agreement-badge, .trap-legend li strong { font-size: 8pt; }
  .agreement-sentence { font-size: 8pt; line-height: 1.25; }
  .agreement-rule, .trap-legend li p { font-size: 7.2pt; line-height: 1.3; }
  .trap-legend li p { margin: .8mm 0 1.2mm; }
  .trap-legend li small { margin-top: 1mm; font-size: 7pt; line-height: 1.25; }
  .trap-legend__empty { font-size: 8pt; }
  .mode-section { padding-top: 2.5mm; break-before: auto; break-after: auto; }
  .detail-panel--has-open-notes .mode-section:first-of-type { break-before: page; }
  .mode-section--indicative { break-after: page; }
  .mode-section > h2 { margin-bottom: 2mm; break-after: avoid; font-size: 14pt; }
  .tense-grid { gap: 2.5mm; }
  .tense-row { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 2.5mm; break-inside: auto; }
  .tense-consult-card { padding: 3mm; border-radius: 3mm; background: var(--soft) !important; break-inside: avoid; box-shadow: none; }
  .tense-consult-card h3 { margin-bottom: 1.5mm; font-size: 9.5pt; }
  .conjugation-table { border-spacing: 0 .8mm; font-size: 8.5pt; line-height: 1.2; }
  .alternative-separator { width: 7mm; padding: 0 1mm; }
  .alternative-separator span { min-width: 5mm; min-height: 4mm; padding: 0; font-size: 7pt; }
  .non-finite-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 2mm; }
  .non-finite-grid article { padding: 2.5mm; border-radius: 3mm; background: var(--soft) !important; break-inside: avoid; }
  .non-finite-grid p { margin-bottom: 1mm; }
  .non-finite-grid strong { font-size: 8.5pt; }
}
</style>
