<script setup lang="ts">
import { getAdminErrorMessage } from '~/composables/useAdminAuth'
import {
  conjugationModeOrder,
  conjugationTenseLabel,
  conjugationTenseOrder,
  isFiniteConjugationMode,
} from '~~/shared/data/conjugation-display'

interface AdminVerb {
  id: number
  infinitif: string
  participePresent: string
  participePasse: string
  auxiliaire: string
  groupeConjugaison?: number | null
  familleConjugaison?: string | null
  terminaison?: string | null
  typePronominal?: string
  estImpersonnel?: boolean
  estDefectif?: boolean
  niveauDifficulte?: number | null
  niveauCecrl?: string | null
  registrePrincipal?: string | null
  formeCanonique?: string
  statutValidation?: string
  particularites?: string[]
  niveauxScolaires?: string[]
  parcoursCif?: string[]
  categoriesSemantiques?: Array<{ slug: string, label: string }>
}

interface AdminConjugation {
  id?: number
  personId: number
  tenseId: number
  conjugaison1: string
  conjugaison2: string
  conjugaison3: string
}

interface AdminComplement {
  id: number
  texte: string
}

interface AdminConstruction {
  id: number
  code: string
  fonctionObjet: string
  preposition: string | null
  patron: string
  complements: AdminComplement[]
}

interface VerbDetail {
  verb: AdminVerb
  conjugations: AdminConjugation[]
  constructions?: AdminConstruction[]
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

function peopleForMode(mode: string) {
  return mode.trim().toLocaleLowerCase('fr-CH') === 'impératif'
    ? people.filter(person => [5, 7, 8].includes(person.id))
    : people
}

function modeAnchor(mode: string) {
  return `mode-${mode.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr').replace(/[^a-z]+/g, '-')}`
}

const draft = reactive<VerbSavePayload>({
  infinitif: '',
  participePresent: '',
  participePasse: '',
  auxiliaire: 'avoir',
  conjugations: []
})

const initialSnapshot = ref('')
const complementGroups = ref<AdminConstruction[]>([])
const complementDrafts = reactive<Record<number, string>>({})
const firstComplementDraft = ref('')
const complementBusy = ref('')
const complementError = ref('')
const complementSuccess = ref('')

const groups = computed(() => [...props.modes]
  .filter(mode => isFiniteConjugationMode(mode.name))
  .sort((left, right) => conjugationModeOrder(left.name) - conjugationModeOrder(right.name) || left.id - right.id)
  .map(mode => ({
    mode,
    tenses: props.tenses
      .filter(tense => tense.modeId === mode.id)
      .sort((left, right) => conjugationTenseOrder(mode.name, left.name) - conjugationTenseOrder(mode.name, right.name) || left.id - right.id)
      .map(tense => ({
        ...tense,
        rows: peopleForMode(mode.name).map(person => ({
          person,
          conjugation: draft.conjugations.find(item => (
            item.tenseId === tense.id && item.personId === person.id
          ))
        }))
      }))
  }))
  .filter(group => group.tenses.length > 0))

const auxiliaryParticiple = computed(() => draft.auxiliaire === 'être' ? 'étant' : 'ayant')
const nonFiniteForms = computed(() => ({
  infinitivePast: [draft.auxiliaire, draft.participePasse].filter(Boolean).join(' '),
  gerundPresent: draft.participePresent ? `en ${draft.participePresent}` : '',
  gerundPast: draft.participePasse ? `en ${auxiliaryParticiple.value} ${draft.participePasse}` : '',
}))

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

function resetComplements() {
  complementGroups.value = (props.detail.constructions ?? []).map(construction => ({
    ...construction,
    complements: construction.complements.map(complement => ({ ...complement }))
  }))
  complementError.value = ''
  complementSuccess.value = ''
  firstComplementDraft.value = ''
}

async function addComplement(construction: AdminConstruction) {
  const texte = (complementDrafts[construction.id] ?? '').replace(/\s+/g, ' ').trim()
  if (!texte || complementBusy.value) return

  complementBusy.value = `add:${construction.id}`
  complementError.value = ''
  complementSuccess.value = ''
  try {
    const response = await $fetch<{ complement: AdminComplement }>(
      `/api/admin/verbes/${props.detail.verb.id}/complements`,
      {
        method: 'POST',
        credentials: 'same-origin',
        body: { constructionId: construction.id, texte }
      }
    )
    construction.complements.push(response.complement)
    complementDrafts[construction.id] = ''
    complementSuccess.value = `Le complément « ${response.complement.texte} » a été ajouté.`
  } catch (error) {
    complementError.value = getAdminErrorMessage(error, 'Impossible d’ajouter ce complément.')
  } finally {
    complementBusy.value = ''
  }
}

async function deleteComplement(construction: AdminConstruction, complement: AdminComplement) {
  if (complementBusy.value || !window.confirm(`Supprimer le complément « ${complement.texte} » ?`)) return

  complementBusy.value = `delete:${complement.id}`
  complementError.value = ''
  complementSuccess.value = ''
  try {
    await $fetch(`/api/admin/verbes/${props.detail.verb.id}/complements/${complement.id}`, {
      method: 'DELETE',
      credentials: 'same-origin'
    })
    construction.complements = construction.complements.filter(item => item.id !== complement.id)
    complementSuccess.value = `Le complément « ${complement.texte} » a été supprimé.`
  } catch (error) {
    complementError.value = getAdminErrorMessage(error, 'Impossible de supprimer ce complément.')
  } finally {
    complementBusy.value = ''
  }
}

async function addFirstComplement() {
  const texte = firstComplementDraft.value.replace(/\s+/g, ' ').trim()
  if (!texte || complementBusy.value) return

  complementBusy.value = 'add:new'
  complementError.value = ''
  complementSuccess.value = ''
  try {
    const response = await $fetch<{
      construction: Omit<AdminConstruction, 'complements'>
      complement: AdminComplement
    }>(`/api/admin/verbes/${props.detail.verb.id}/complements`, {
      method: 'POST',
      credentials: 'same-origin',
      body: { texte }
    })
    complementGroups.value.push({ ...response.construction, complements: [response.complement] })
    firstComplementDraft.value = ''
    complementSuccess.value = `La liste COD a été créée avec « ${response.complement.texte} ».`
  } catch (error) {
    complementError.value = getAdminErrorMessage(error, 'Impossible de créer cette liste de compléments.')
  } finally {
    complementBusy.value = ''
  }
}

watch(
  () => [props.detail, props.tenses] as const,
  resetDraft,
  { immediate: true }
)

watch(() => props.detail, resetComplements, { immediate: true })

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
        <span>Auxiliaire *</span>
        <select v-model="draft.auxiliaire" required>
          <option value="avoir">avoir</option>
          <option value="être">être</option>
        </select>
      </label>
    </fieldset>

    <section class="verb-editor__classification" aria-labelledby="classification-title">
      <div>
        <h2 id="classification-title">Classement grammatical et sémantique</h2>
        <p class="admin-muted">Ces critères sont recalculés lors de l’enregistrement et déterminent les défis prêts à l’emploi.</p>
      </div>
      <dl>
        <div><dt>Groupe</dt><dd>{{ detail.verb.groupeConjugaison || 'À déterminer' }}</dd></div>
        <div><dt>Famille</dt><dd>{{ detail.verb.familleConjugaison || 'À déterminer' }}</dd></div>
        <div><dt>Terminaison</dt><dd>{{ detail.verb.terminaison ? `-${detail.verb.terminaison}` : '—' }}</dd></div>
        <div><dt>Pronominalité</dt><dd>{{ detail.verb.typePronominal || 'aucun' }}</dd></div>
        <div><dt>Difficulté</dt><dd>{{ detail.verb.niveauDifficulte ? `${detail.verb.niveauDifficulte}/3` : '—' }}</dd></div>
        <div><dt>Niveau CECRL</dt><dd>{{ detail.verb.niveauCecrl || 'Non renseigné' }}</dd></div>
        <div><dt>Registre</dt><dd>{{ detail.verb.registrePrincipal || 'courant' }}</dd></div>
        <div><dt>Forme canonique</dt><dd>{{ detail.verb.formeCanonique || detail.verb.infinitif }}</dd></div>
      </dl>
      <div class="verb-editor__tags">
        <strong>Catégories de sens</strong>
        <span v-for="category in detail.verb.categoriesSemantiques" :key="category.slug">{{ category.label }}</span>
        <em v-if="!detail.verb.categoriesSemantiques?.length">À classer</em>
      </div>
      <div class="verb-editor__tags">
        <strong>Défis et particularités</strong>
        <span v-for="tag in [...(detail.verb.niveauxScolaires || []), ...(detail.verb.parcoursCif || []), ...(detail.verb.particularites || [])]" :key="tag">{{ tag }}</span>
        <em v-if="![...(detail.verb.niveauxScolaires || []), ...(detail.verb.parcoursCif || []), ...(detail.verb.particularites || [])].length">Aucune étiquette</em>
      </div>
    </section>

    <section class="verb-editor__complements" aria-labelledby="complements-title">
      <div>
        <h2 id="complements-title">Compléments proposés dans les exercices</h2>
        <p class="admin-muted">
          Ces fragments sont liés à un sens et à une construction validée du verbe.
        </p>
      </div>
      <p v-if="complementSuccess" class="admin-notice admin-notice--success" role="status">
        {{ complementSuccess }}
      </p>
      <p v-if="complementError" class="admin-notice admin-notice--error" role="alert">
        {{ complementError }}
      </p>
      <article v-for="construction in complementGroups" :key="construction.id">
        <header>
          <strong>{{ construction.fonctionObjet.toUpperCase() }}</strong>
          <span>{{ construction.patron }}</span>
          <small>{{ construction.complements.length }} / 30 compléments</small>
        </header>
        <p v-if="construction.complements.length" class="verb-editor__sentence-preview">
          Exemple : il … {{ construction.complements[0]?.texte }}
        </p>
        <div class="verb-editor__complement-list">
          <span v-for="complement in construction.complements" :key="complement.id">
            {{ complement.texte }}
            <button
              type="button"
              :disabled="Boolean(complementBusy)"
              :title="`Supprimer « ${complement.texte} »`"
              :aria-label="`Supprimer le complément ${complement.texte}`"
              @click="deleteComplement(construction, complement)"
            >
              <span aria-hidden="true">×</span>
            </button>
          </span>
        </div>
        <div class="verb-editor__complement-add">
          <label :for="`complement-${construction.id}`">Ajouter un complément</label>
          <div>
            <input
              :id="`complement-${construction.id}`"
              v-model="complementDrafts[construction.id]"
              maxlength="180"
              placeholder="Ex. une pomme"
              :disabled="Boolean(complementBusy) || construction.complements.length >= 30"
              @keydown.enter.prevent="addComplement(construction)"
            >
            <button
              class="admin-button admin-button--small"
              type="button"
              :disabled="Boolean(complementBusy) || !complementDrafts[construction.id]?.trim() || construction.complements.length >= 30"
              @click="addComplement(construction)"
            >
              {{ complementBusy === `add:${construction.id}` ? 'Ajout…' : 'Ajouter' }}
            </button>
          </div>
        </div>
      </article>
      <article v-if="!complementGroups.length" class="verb-editor__empty-complements">
        <p class="admin-muted">Aucun complément validé pour ce verbe.</p>
        <div class="verb-editor__complement-add">
          <label :for="`first-complement-${detail.verb.id}`">Ajouter un premier complément COD</label>
          <div>
            <input
              :id="`first-complement-${detail.verb.id}`"
              v-model="firstComplementDraft"
              maxlength="180"
              placeholder="Ex. une proposition"
              :disabled="Boolean(complementBusy)"
              @keydown.enter.prevent="addFirstComplement"
            >
            <button
              class="admin-button admin-button--small"
              type="button"
              :disabled="Boolean(complementBusy) || !firstComplementDraft.trim()"
              @click="addFirstComplement"
            >
              {{ complementBusy === 'add:new' ? 'Création…' : 'Créer la liste COD' }}
            </button>
          </div>
        </div>
      </article>
    </section>

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

      <nav class="verb-editor__mode-nav" aria-label="Accès rapide aux modes">
        <a v-for="group in groups" :key="group.mode.id" :href="`#${modeAnchor(group.mode.name)}`">
          {{ group.mode.name }}
        </a>
        <a href="#mode-participe">Participe</a>
        <a href="#mode-infinitif">Infinitif</a>
        <a href="#mode-gerondif">Gérondif</a>
      </nav>

      <section
        v-for="group in groups"
        :key="group.mode.id"
        :id="modeAnchor(group.mode.name)"
        class="verb-editor__mode"
      >
        <header class="verb-editor__mode-heading">
          <h2>{{ group.mode.name }}</h2>
          <small>{{ group.tenses.length }} temps</small>
        </header>

        <div class="verb-editor__tenses">
          <article v-for="tense in group.tenses" :key="tense.id" class="tense-card">
            <header>
              <h3>{{ conjugationTenseLabel(group.mode.name, tense.name) }}</h3>
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
      </section>

      <section class="verb-editor__non-finite" aria-labelledby="non-finite-title">
        <header>
          <h2 id="non-finite-title">Formes non personnelles</h2>
          <p class="admin-muted">Participe, infinitif et gérondif, dans l’ordre du site de référence.</p>
        </header>

        <div class="verb-editor__non-finite-grid">
          <article id="mode-participe">
            <h3>Participe</h3>
            <label class="admin-field"><span>Présent</span><input v-model="draft.participePresent" maxlength="255"></label>
            <label class="admin-field"><span>Passé</span><input v-model="draft.participePasse" maxlength="255"></label>
          </article>
          <article id="mode-infinitif">
            <h3>Infinitif</h3>
            <label class="admin-field"><span>Présent</span><input :value="draft.infinitif" readonly></label>
            <label class="admin-field"><span>Passé généré</span><input :value="nonFiniteForms.infinitivePast" readonly></label>
          </article>
          <article id="mode-gerondif">
            <h3>Gérondif</h3>
            <label class="admin-field"><span>Présent généré</span><input :value="nonFiniteForms.gerundPresent" readonly></label>
            <label class="admin-field"><span>Passé généré</span><input :value="nonFiniteForms.gerundPast" readonly></label>
          </article>
        </div>
      </section>
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

.verb-editor__classification {
  display: grid;
  gap: 15px;
  padding: 18px;
  background: #f7fafb;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
}

.verb-editor__classification h2,
.verb-editor__classification p {
  margin: 0;
}

.verb-editor__classification dl {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  gap: 8px;
}

.verb-editor__classification dl > div {
  padding: 10px;
  background: white;
  border: 1px solid var(--admin-border);
  border-radius: 8px;
}

.verb-editor__classification dt {
  color: var(--admin-muted);
  font-size: .7rem;
  font-weight: 800;
  text-transform: uppercase;
}

.verb-editor__classification dd {
  margin: 4px 0 0;
  color: var(--admin-navy);
  font-weight: 750;
}

.verb-editor__complements {
  display: grid;
  gap: 13px;
  padding: 18px;
  background: #f7fafb;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
}

.verb-editor__complements h2,
.verb-editor__complements p {
  margin: 0;
}

.verb-editor__complements article {
  display: grid;
  gap: 10px;
  padding: 13px;
  background: white;
  border: 1px solid var(--admin-border);
  border-radius: 9px;
}

.verb-editor__complements article header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: var(--admin-navy);
}

.verb-editor__complements article header span,
.verb-editor__complements article header small {
  color: var(--admin-muted);
}

.verb-editor__complements article header small {
  margin-left: auto;
}

.verb-editor__sentence-preview {
  color: var(--admin-blue-dark);
  font-weight: 750;
}

.verb-editor__complement-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.verb-editor__complement-list > span {
  display: inline-flex;
  padding: 4px 4px 4px 9px;
  align-items: center;
  gap: 4px;
  color: var(--admin-blue-dark);
  background: #e4f3f6;
  border-radius: 99px;
  font-size: .76rem;
  font-weight: 700;
}

.verb-editor__complement-list button {
  display: inline-grid;
  width: 22px;
  height: 22px;
  padding: 0;
  place-items: center;
  color: #6b7780;
  background: transparent;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  font: inherit;
  font-size: 1.05rem;
  line-height: 1;
}

.verb-editor__complement-list button:hover,
.verb-editor__complement-list button:focus-visible {
  color: white;
  background: #a83d32;
  outline: 0;
}

.verb-editor__complement-list button:disabled {
  opacity: .45;
  cursor: wait;
}

.verb-editor__complement-add {
  display: grid;
  max-width: 560px;
  gap: 5px;
}

.verb-editor__complement-add label {
  color: var(--admin-navy);
  font-size: .76rem;
  font-weight: 800;
}

.verb-editor__complement-add > div {
  display: flex;
  align-items: stretch;
  gap: 7px;
}

.verb-editor__complement-add input {
  min-width: 0;
  min-height: 38px;
  padding: 7px 10px;
  flex: 1 1 auto;
  border: 1px solid #becdd6;
  border-radius: 7px;
}

.verb-editor__complement-add input:focus {
  border-color: var(--admin-blue);
  outline: 0;
  box-shadow: 0 0 0 2px rgb(23 107 135 / 13%);
}

.verb-editor__tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.verb-editor__tags strong {
  width: 100%;
  color: var(--admin-navy);
}

.verb-editor__tags span {
  padding: 4px 8px;
  color: var(--admin-blue-dark);
  background: #e4f3f6;
  border-radius: 99px;
  font-size: .76rem;
  font-weight: 750;
}

.verb-editor__tags em {
  color: var(--admin-muted);
}

.verb-editor__non-finite {
  display: grid;
  gap: 14px;
  padding: 18px;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
}

.verb-editor__non-finite header h2,
.verb-editor__non-finite header p,
.verb-editor__non-finite article h3 {
  margin: 0;
}

.verb-editor__non-finite header p {
  margin-top: 5px;
  font-size: .88rem;
}

.verb-editor__non-finite-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.verb-editor__non-finite article {
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 15px;
  background: #f7fafb;
  border-radius: 10px;
}

.verb-editor__non-finite article[id] {
  scroll-margin-top: 60px;
}

.verb-editor__non-finite article h3 {
  color: var(--admin-navy);
  text-transform: capitalize;
}

.verb-editor__non-finite input[readonly] {
  color: #536675;
  background: #edf3f6;
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
  scroll-margin-top: 16px;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
}

.verb-editor__mode-heading {
  display: flex;
  min-height: 48px;
  padding: 12px 15px;
  align-items: center;
  justify-content: space-between;
  color: var(--admin-navy);
  background: #f3f8fa;
  border-bottom: 1px solid var(--admin-border);
}

.verb-editor__mode-heading h2 {
  margin: 0;
  font-size: 1.15rem;
  text-transform: capitalize;
}

.verb-editor__mode-heading small {
  color: var(--admin-muted);
  font-weight: 600;
  text-transform: none;
}

.verb-editor__mode-nav {
  position: sticky;
  z-index: 8;
  top: 0;
  display: flex;
  margin-inline: -2px;
  padding: 7px 2px;
  gap: 6px;
  overflow-x: auto;
  background: rgb(255 255 255 / 94%);
  backdrop-filter: blur(8px);
}

.verb-editor__mode-nav a {
  flex: 0 0 auto;
  padding: 6px 10px;
  color: var(--admin-blue-dark);
  background: #edf6f8;
  border: 1px solid #c9dfe6;
  border-radius: 99px;
  text-decoration: none;
  font-size: .76rem;
  font-weight: 800;
  text-transform: capitalize;
}

.verb-editor__mode-nav a:hover,
.verb-editor__mode-nav a:focus-visible {
  color: white;
  background: var(--admin-blue-dark);
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

  .verb-editor__non-finite-grid {
    grid-template-columns: 1fr;
  }

  .verb-editor__classification dl {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
