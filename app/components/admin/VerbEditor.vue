<script setup lang="ts">
interface AdminVerb {
  id: number
  infinitif: string
  participePresent: string
  participePasse: string
  auxiliaire: string
}

interface AdminConjugation {
  id?: number
  personId: number
  tenseId: number
  conjugaison1: string
  conjugaison2: string
  conjugaison3: string
}

interface VerbDetail {
  verb: AdminVerb
  conjugations: AdminConjugation[]
}

interface CatalogueMode {
  id: number
  name: string
  order: number
}

interface CatalogueTense {
  id: number
  modeId: number
  name: string
  isCompound: boolean
  selected: boolean
}

interface VerbSavePayload {
  infinitif: string
  participePresent: string
  participePasse: string
  auxiliaire: string
  conjugations: Array<{
    personId: number
    tenseId: number
    conjugaison1: string
    conjugaison2: string
    conjugaison3: string
  }>
}

const props = defineProps<{
  detail: VerbDetail
  modes: CatalogueMode[]
  tenses: CatalogueTense[]
  saving?: boolean
  error?: string
  success?: string
}>()

const emit = defineEmits<{
  save: [payload: VerbSavePayload]
  dirtyChange: [dirty: boolean]
}>()

const people = [
  { id: 4, short: 'je', label: 'Première personne du singulier' },
  { id: 5, short: 'tu', label: 'Deuxième personne du singulier' },
  { id: 6, short: 'il / elle', label: 'Troisième personne du singulier' },
  { id: 7, short: 'nous', label: 'Première personne du pluriel' },
  { id: 8, short: 'vous', label: 'Deuxième personne du pluriel' },
  { id: 9, short: 'ils / elles', label: 'Troisième personne du pluriel' }
] as const

const draft = reactive<VerbSavePayload>({
  infinitif: '',
  participePresent: '',
  participePasse: '',
  auxiliaire: 'avoir',
  conjugations: []
})

const initialSnapshot = ref('')

const groups = computed(() => [...props.modes]
  .sort((left, right) => left.order - right.order || left.id - right.id)
  .map(mode => ({
    mode,
    tenses: props.tenses
      .filter(tense => tense.modeId === mode.id)
      .map(tense => ({
        ...tense,
        rows: people.map(person => ({
          person,
          conjugation: draft.conjugations.find(item => (
            item.tenseId === tense.id && item.personId === person.id
          ))
        }))
      }))
  }))
  .filter(group => group.tenses.length > 0))

function payload(): VerbSavePayload {
  return {
    infinitif: draft.infinitif.trim(),
    participePresent: draft.participePresent.trim(),
    participePasse: draft.participePasse.trim(),
    auxiliaire: draft.auxiliaire.trim(),
    conjugations: draft.conjugations.map(item => ({
      personId: item.personId,
      tenseId: item.tenseId,
      conjugaison1: item.conjugaison1.trim(),
      conjugaison2: item.conjugaison2.trim(),
      conjugaison3: item.conjugaison3.trim()
    }))
  }
}

const dirty = computed(() => JSON.stringify(payload()) !== initialSnapshot.value)
const isValid = computed(() => Boolean(draft.infinitif.trim() && draft.auxiliaire.trim()))

function resetDraft() {
  const existing = new Map(
    props.detail.conjugations.map(item => [`${Number(item.tenseId)}:${Number(item.personId)}`, item])
  )
  const expectedKeys = new Set<string>()
  const rows: VerbSavePayload['conjugations'] = []

  for (const tense of props.tenses) {
    for (const person of people) {
      const key = `${tense.id}:${person.id}`
      const item = existing.get(key)
      expectedKeys.add(key)
      rows.push({
        tenseId: tense.id,
        personId: person.id,
        conjugaison1: item?.conjugaison1 ?? '',
        conjugaison2: item?.conjugaison2 ?? '',
        conjugaison3: item?.conjugaison3 ?? ''
      })
    }
  }

  // Garde toute ligne inconnue afin qu'une sauvegarde ne supprime pas une donnée
  // que le catalogue courant ne saurait pas encore afficher.
  for (const item of props.detail.conjugations) {
    const key = `${Number(item.tenseId)}:${Number(item.personId)}`
    if (!expectedKeys.has(key)) {
      rows.push({
        tenseId: Number(item.tenseId),
        personId: Number(item.personId),
        conjugaison1: item.conjugaison1 ?? '',
        conjugaison2: item.conjugaison2 ?? '',
        conjugaison3: item.conjugaison3 ?? ''
      })
    }
  }

  draft.infinitif = props.detail.verb.infinitif
  draft.participePresent = props.detail.verb.participePresent
  draft.participePasse = props.detail.verb.participePasse
  draft.auxiliaire = props.detail.verb.auxiliaire || 'avoir'
  draft.conjugations.splice(0, draft.conjugations.length, ...rows)
  initialSnapshot.value = JSON.stringify(payload())
}

function submit() {
  if (isValid.value && dirty.value && !props.saving) {
    emit('save', payload())
  }
}

watch(
  () => [props.detail, props.tenses] as const,
  resetDraft,
  { immediate: true }
)

watch(dirty, value => emit('dirtyChange', value), { immediate: true })
</script>

<template>
  <form class="verb-editor" @submit.prevent="submit">
    <div class="verb-editor__top">
      <div class="admin-section-heading">
        <div>
          <p class="admin-eyebrow">Verbe no {{ detail.verb.id }}</p>
          <h1>Modifier « {{ detail.verb.infinitif }} »</h1>
        </div>
      </div>

      <div class="verb-editor__actions">
        <button class="admin-button" type="button" :disabled="saving || !dirty" @click="resetDraft">
          Annuler les changements
        </button>
        <button
          class="admin-button admin-button--primary"
          type="submit"
          :disabled="saving || !dirty || !isValid"
        >
          {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
      </div>
    </div>

    <p v-if="success" class="admin-notice admin-notice--success" role="status">{{ success }}</p>
    <p v-if="error" class="admin-notice admin-notice--error" role="alert">{{ error }}</p>

    <fieldset class="verb-editor__metadata">
      <legend>Fiche du verbe</legend>

      <label class="admin-field">
        <span>Infinitif *</span>
        <input v-model="draft.infinitif" maxlength="255" required>
      </label>
      <label class="admin-field">
        <span>Participe présent</span>
        <input v-model="draft.participePresent" maxlength="255">
      </label>
      <label class="admin-field">
        <span>Participe passé</span>
        <input v-model="draft.participePasse" maxlength="255">
      </label>
      <label class="admin-field">
        <span>Auxiliaire *</span>
        <select v-model="draft.auxiliaire" required>
          <option value="avoir">avoir</option>
          <option value="être">être</option>
        </select>
      </label>
    </fieldset>

    <section class="verb-editor__conjugations" aria-labelledby="conjugations-title">
      <div class="verb-editor__grid-heading">
        <div>
          <h2 id="conjugations-title">Grille des conjugaisons</h2>
          <p class="admin-muted">
            La première forme est la réponse principale. Les formes 2 et 3 sont des variantes acceptées.
          </p>
        </div>
        <span :class="['verb-editor__state', { 'is-dirty': dirty }]">
          {{ dirty ? 'Modifications non enregistrées' : 'À jour' }}
        </span>
      </div>

      <details
        v-for="(group, groupIndex) in groups"
        :key="group.mode.id"
        class="verb-editor__mode"
        :open="groupIndex === 0"
      >
        <summary>
          <span>{{ group.mode.name }}</span>
          <small>{{ group.tenses.length }} temps</small>
        </summary>

        <div class="verb-editor__tenses">
          <article v-for="tense in group.tenses" :key="tense.id" class="tense-card">
            <header>
              <h3>{{ tense.name }}</h3>
              <span v-if="tense.isCompound">Composé</span>
            </header>

            <div class="tense-card__table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Personne</th>
                    <th scope="col">Forme principale</th>
                    <th scope="col">Variante 2</th>
                    <th scope="col">Variante 3</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in tense.rows" :key="row.person.id">
                    <th scope="row" :title="row.person.label">{{ row.person.short }}</th>
                    <template v-if="row.conjugation">
                      <td>
                        <input
                          v-model="row.conjugation.conjugaison1"
                          maxlength="255"
                          :aria-label="`${tense.name}, ${row.person.label}, forme principale`"
                        >
                      </td>
                      <td>
                        <input
                          v-model="row.conjugation.conjugaison2"
                          maxlength="255"
                          :aria-label="`${tense.name}, ${row.person.label}, variante 2`"
                        >
                      </td>
                      <td>
                        <input
                          v-model="row.conjugation.conjugaison3"
                          maxlength="255"
                          :aria-label="`${tense.name}, ${row.person.label}, variante 3`"
                        >
                      </td>
                    </template>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </details>
    </section>

    <div class="verb-editor__footer">
      <span :class="['verb-editor__state', { 'is-dirty': dirty }]">
        {{ dirty ? 'Modifications non enregistrées' : 'À jour' }}
      </span>
      <button
        class="admin-button admin-button--primary"
        type="submit"
        :disabled="saving || !dirty || !isValid"
      >
        {{ saving ? 'Enregistrement…' : 'Enregistrer le verbe' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.verb-editor {
  display: grid;
  min-width: 0;
  gap: 22px;
}

.verb-editor__top,
.verb-editor__grid-heading,
.verb-editor__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.verb-editor__actions,
.verb-editor__footer {
  display: flex;
  gap: 9px;
}

.verb-editor__metadata {
  display: grid;
  margin: 0;
  padding: 18px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  background: #f7fafb;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
}

.verb-editor__metadata legend {
  padding: 0 7px;
  color: var(--admin-navy);
  font-weight: 850;
}

.verb-editor__conjugations {
  display: grid;
  min-width: 0;
  gap: 13px;
}

.verb-editor__grid-heading {
  align-items: start;
}

.verb-editor__grid-heading h2 {
  margin: 0;
  color: var(--admin-navy);
}

.verb-editor__grid-heading p {
  margin: 5px 0 0;
  font-size: .88rem;
}

.verb-editor__state {
  flex: 0 0 auto;
  padding: 5px 9px;
  color: var(--admin-green);
  background: #eaf8f0;
  border-radius: 99px;
  font-size: .73rem;
  font-weight: 800;
}

.verb-editor__state.is-dirty {
  color: #8b4b0d;
  background: #fff3df;
}

.verb-editor__mode {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
}

.verb-editor__mode > summary {
  display: flex;
  min-height: 48px;
  padding: 12px 15px;
  align-items: center;
  justify-content: space-between;
  color: var(--admin-navy);
  background: #f3f8fa;
  cursor: pointer;
  font-weight: 850;
  text-transform: capitalize;
}

.verb-editor__mode > summary small {
  color: var(--admin-muted);
  font-weight: 600;
  text-transform: none;
}

.verb-editor__tenses {
  display: grid;
  padding: 13px;
  gap: 13px;
}

.tense-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #dbe5eb;
  border-radius: 10px;
}

.tense-card > header {
  display: flex;
  min-height: 42px;
  padding: 9px 12px;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid #dbe5eb;
}

.tense-card h3 {
  margin: 0;
  color: var(--admin-navy);
  font-size: 1rem;
  text-transform: capitalize;
}

.tense-card header span {
  padding: 3px 7px;
  color: var(--admin-blue-dark);
  background: var(--admin-cyan);
  border-radius: 99px;
  font-size: .68rem;
  font-weight: 800;
}

.tense-card__table-wrap {
  overflow-x: auto;
}

.tense-card table {
  width: 100%;
  min-width: 650px;
  border-collapse: collapse;
  table-layout: fixed;
}

.tense-card th,
.tense-card td {
  padding: 6px;
  border-bottom: 1px solid #e4ebef;
}

.tense-card thead th {
  padding-block: 7px;
  color: var(--admin-muted);
  text-align: left;
  background: #fbfcfd;
  font-size: .7rem;
  letter-spacing: .02em;
}

.tense-card thead th:first-child {
  width: 105px;
}

.tense-card tbody th {
  color: var(--admin-navy);
  text-align: left;
  font-size: .82rem;
}

.tense-card tbody tr:last-child th,
.tense-card tbody tr:last-child td {
  border-bottom: 0;
}

.tense-card input {
  width: 100%;
  min-height: 34px;
  padding: 5px 7px;
  border: 1px solid #becdd6;
  border-radius: 6px;
  outline: 0;
}

.tense-card input:focus {
  border-color: var(--admin-blue);
  box-shadow: 0 0 0 2px rgb(23 107 135 / 13%);
}

.verb-editor__footer {
  padding-top: 5px;
  justify-content: flex-end;
}

@media (max-width: 720px) {
  .verb-editor__top,
  .verb-editor__grid-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .verb-editor__actions {
    flex-wrap: wrap;
  }

  .verb-editor__metadata {
    grid-template-columns: 1fr;
  }

  .verb-editor__state {
    align-self: flex-start;
  }
}

@media (max-width: 470px) {
  .verb-editor__actions .admin-button {
    flex: 1 1 150px;
  }

  .verb-editor__footer {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
