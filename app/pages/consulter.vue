<script setup lang="ts">
import type { ConjugationMode, ConjugationTense, Verb } from '~~/shared/types/conjugation'
import type { ConsultedConjugation, VerbConsultation } from '~~/shared/types/verb-consultation'
import { conjugationModeOrder, conjugationTenseLabel, conjugationTenseOrder, isFiniteConjugationMode } from '~~/shared/data/conjugation-display'
import { matchingVerbs, normalizeVerbSearch } from '~~/shared/utils/verb-search'

interface Catalogue {
  verbes: Verb[]
  modes: ConjugationMode[]
  temps: ConjugationTense[]
}

const route = useRoute()
const router = useRouter()
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
let detailRequest = 0

useHead({
  title: 'Consulter un verbe',
  meta: [{ name: 'description', content: 'Recherchez un verbe et consultez sa conjugaison à tous les modes et à tous les temps.' }],
})

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
  .map(mode => ({
    mode,
    tenses: [...(catalogue.value?.temps ?? [])]
      .filter(tense => tense.modeId === mode.id)
      .sort((left, right) => conjugationTenseOrder(mode.name, left.name) - conjugationTenseOrder(mode.name, right.name) || left.id - right.id)
      .map(tense => ({
        ...tense,
        rows: (detail.value?.conjugations ?? []).filter(row => row.tenseId === tense.id),
      }))
      .filter(tense => tense.rows.length),
  }))
  .filter(group => group.tenses.length))

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

function groupLabel(group: number | null) {
  if (!group) return 'groupe irrégulier'
  return `${group}${group === 1 ? 'er' : 'e'} groupe`
}

async function loadVerb(id: number) {
  const request = ++detailRequest
  selectedId.value = id
  detailLoading.value = true
  detailError.value = ''
  try {
    const response = await $fetch<VerbConsultation>(`/api/conjugaisons/${id}`)
    if (request === detailRequest) detail.value = response
  } catch {
    if (request === detailRequest) {
      detail.value = null
      detailError.value = 'Impossible de charger la conjugaison de ce verbe.'
    }
  } finally {
    if (request === detailRequest) detailLoading.value = false
  }
}

function selectVerb(verb: Verb) {
  query.value = verb.infinitif
  suggestionsOpen.value = false
  activeSuggestion.value = 0
  transitionDirection.value = 'forward'
  showingDetail.value = true
  void router.replace({ query: { ...route.query, verbe: String(verb.id) } })
  void loadVerb(verb.id)
  nextTick(() => consultationContainer.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

function returnToSelection() {
  transitionDirection.value = 'back'
  showingDetail.value = false
  detailError.value = ''
  const { verbe: _verb, ...queryWithoutVerb } = route.query
  void router.replace({ query: queryWithoutVerb })
  nextTick(() => consultationContainer.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
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
  <div class="reference-page">
    <header class="reference-hero">
      <p class="reference-eyebrow">Le conjugueur</p>
      <h1>Consulter un verbe</h1>
      <p>Écris un infinitif ou parcours le catalogue de A à Z pour afficher toute sa conjugaison.</p>
    </header>

    <div v-if="status === 'pending'" class="reference-state" role="status">Chargement du catalogue…</div>
    <div v-else-if="error" class="reference-state reference-state--error" role="alert">
      <p>Le catalogue n’a pas pu être chargé.</p>
      <button type="button" @click="refresh()">Réessayer</button>
    </div>

    <section v-else ref="consultation-container" class="consultation-container" aria-live="polite">
      <Transition :name="transitionDirection === 'forward' ? 'slide-forward' : 'slide-back'" mode="out-in">
        <div v-if="!showingDetail" key="selection" class="consultation-panel selection-panel">
          <div class="consultation-tabs" role="tablist" aria-label="Méthode de recherche du verbe">
            <button
              id="search-tab"
              type="button"
              role="tab"
              :aria-selected="activeTab === 'search'"
              aria-controls="search-panel"
              :class="{ 'is-active': activeTab === 'search' }"
              @click="selectTab('search')"
            >
              Rechercher un verbe
            </button>
            <button
              id="list-tab"
              type="button"
              role="tab"
              :aria-selected="activeTab === 'list'"
              aria-controls="list-panel"
              :class="{ 'is-active': activeTab === 'list' }"
              @click="selectTab('list')"
            >
              Liste de A à Z
            </button>
          </div>

          <div v-if="activeTab === 'search'" id="search-panel" class="tab-panel search-tab-panel" role="tabpanel" aria-labelledby="search-tab">
            <div>
              <p class="reference-eyebrow">Recherche rapide</p>
              <h2>Quel verbe cherches-tu ?</h2>
              <p>Commence à écrire son infinitif, puis choisis-le dans les propositions.</p>
            </div>
            <div class="verb-combobox">
              <input
                id="public-verb-search"
                v-model="query"
                type="search"
                role="combobox"
                autocomplete="off"
                spellcheck="false"
                placeholder="Par exemple : venir"
                aria-label="Rechercher un verbe"
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
                <p class="reference-eyebrow">Catalogue complet</p>
                <h2>Tous les verbes de A à Z</h2>
              </div>
              <span>{{ verbs.length }} verbes</span>
            </div>
            <nav class="letter-nav" aria-label="Accès aux lettres">
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

        <div v-else key="detail" class="consultation-panel detail-panel">
          <button class="back-button" type="button" @click="returnToSelection">
            <span aria-hidden="true">←</span>
            Retour au choix du verbe
          </button>

          <div v-if="detailLoading" class="reference-state" role="status">Chargement de la conjugaison…</div>
          <div v-else-if="detailError" class="reference-state reference-state--error" role="alert">
            <p>{{ detailError }}</p>
            <button type="button" @click="returnToSelection">Retour à la liste</button>
          </div>
          <template v-else-if="detail">
            <header class="conjugation-heading">
              <div>
                <p class="reference-eyebrow">Conjugaison du verbe</p>
                <h2>{{ detail.verb.infinitif }}</h2>
              </div>
              <dl>
                <div><dt>Groupe</dt><dd>{{ groupLabel(detail.verb.groupeConjugaison) }}</dd></div>
                <div><dt>Auxiliaire</dt><dd>{{ detail.verb.auxiliaire }}</dd></div>
              </dl>
            </header>

            <nav class="mode-nav" aria-label="Accès aux modes">
              <button v-for="group in groups" :key="group.mode.id" type="button" @click="scrollToMode(`consult-mode-${group.mode.id}`)">
                {{ group.mode.name }}
              </button>
              <button type="button" @click="scrollToMode('consult-non-finite')">Formes non personnelles</button>
            </nav>

            <section v-for="group in groups" :id="`consult-mode-${group.mode.id}`" :key="group.mode.id" class="mode-section">
              <h2>{{ group.mode.name }}</h2>
              <div class="tense-grid">
                <article v-for="tense in group.tenses" :key="tense.id" class="tense-consult-card">
                  <h3>{{ conjugationTenseLabel(group.mode.name, tense.name) }}</h3>
                  <ul>
                    <li v-for="row in tense.rows" :key="row.id">
                      <span v-for="(form, index) in row.forms" :key="form">
                        {{ displayedForm(row, form, group.mode.name) }}<small v-if="index < row.forms.length - 1"> ou </small>
                      </span>
                    </li>
                  </ul>
                </article>
              </div>
            </section>

            <section id="consult-non-finite" class="mode-section">
              <h2>Formes non personnelles</h2>
              <div class="non-finite-grid">
                <article v-for="item in nonFiniteForms" :key="`${item.mode}-${item.tense}`">
                  <p>{{ item.mode }} · {{ item.tense }}</p>
                  <strong>{{ item.form }}</strong>
                </article>
              </div>
            </section>
          </template>
        </div>
      </Transition>
    </section>
  </div>
</template>

<style scoped>
.reference-page { color: var(--ink); font-family: "Funnel Sans", "Avenir Next", Avenir, system-ui, sans-serif; }
.reference-hero { max-width: 760px; margin: 8px auto 34px; text-align: center; }
.reference-hero h1 { margin: 4px 0 12px; color: #294c4b; font-size: clamp(2.3rem, 6vw, 4.6rem); letter-spacing: -.055em; line-height: 1; }
.reference-hero > p:last-child { max-width: 650px; margin: 0 auto; color: var(--muted); font-size: 1.08rem; line-height: 1.6; }
.reference-eyebrow { margin: 0 0 5px; color: var(--brand); font-size: .76rem; font-weight: 850; letter-spacing: .13em; text-transform: uppercase; }
.reference-state { display: grid; min-height: 180px; place-items: center; padding: 28px; border: 1px solid var(--line); border-radius: 22px; background: rgb(255 255 255 / 88%); color: var(--muted); text-align: center; }
.reference-state--error { color: var(--danger); }
.reference-state button { padding: 9px 16px; border: 0; border-radius: 99px; color: white; background: var(--brand); }
.consultation-container { max-width: 1080px; margin: 0 auto 24px; overflow: hidden; border: 1px solid var(--line); border-radius: 24px; background: rgb(255 255 255 / 93%); box-shadow: var(--shadow); scroll-margin-top: 18px; }
.consultation-panel { padding: 28px; }
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
.back-button { display: inline-flex; align-items: center; gap: 9px; margin: 0 0 25px; padding: 10px 15px 10px 11px; border: 1px solid #a9bdb7; border-radius: 999px; color: var(--brand-dark); background: white; font-weight: 800; cursor: pointer; }
.back-button span { display: grid; width: 27px; height: 27px; place-items: center; border-radius: 50%; color: white; background: var(--brand); font-size: 1.15rem; transition: transform 150ms ease; }
.back-button:hover { border-color: var(--brand); background: var(--brand-pale); }
.back-button:hover span { transform: translateX(-2px); }
.conjugation-heading h2 { margin: 0; color: #294c4b; font-size: clamp(2.2rem, 5vw, 3.8rem); letter-spacing: -.05em; }
.conjugation-heading dl { display: flex; gap: 9px; margin: 0; }
.conjugation-heading dl div { padding: 8px 12px; border-radius: 12px; background: var(--soft); }
.conjugation-heading dt { color: var(--muted); font-size: .72rem; text-transform: uppercase; }
.conjugation-heading dd { margin: 2px 0 0; color: var(--brand-dark); font-weight: 750; }
.mode-nav { position: sticky; z-index: 3; top: 8px; padding: 8px; border: 1px solid var(--line); border-radius: 14px; background: rgb(255 255 255 / 94%); box-shadow: 0 8px 20px rgb(36 50 71 / 8%); }
.mode-section { padding-top: 18px; scroll-margin-top: 72px; }
.mode-section > h2 { margin: 0 0 14px; color: var(--brand-dark); font-size: 1.6rem; text-transform: capitalize; }
.tense-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.tense-consult-card { padding: 18px; border: 1px solid var(--line); border-radius: 17px; background: var(--soft); }
.tense-consult-card h3 { margin: 0 0 12px; color: var(--brand); font-size: 1.05rem; text-transform: capitalize; }
.tense-consult-card ul { display: grid; gap: 7px; margin: 0; padding: 0; list-style: none; }
.tense-consult-card li { color: var(--ink); line-height: 1.45; }
.tense-consult-card li small { color: var(--muted); }
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
}
@media (max-width: 760px) {
  .search-tab-panel { min-height: 350px; grid-template-columns: 1fr; align-content: center; gap: 24px; padding: 10px 4px 30px; }
  .alphabet-groups, .tense-grid { grid-template-columns: 1fr; }
  .conjugation-heading { align-items: start; flex-direction: column; }
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
  .conjugation-heading dl { width: 100%; }
  .conjugation-heading dl div { flex: 1; }
}
</style>
