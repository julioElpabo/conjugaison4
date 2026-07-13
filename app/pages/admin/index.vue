<script setup lang="ts">
import { getAdminErrorMessage } from '~/composables/useAdminAuth'
import AdminNewVerbForm from '~/components/admin/NewVerbForm.vue'
import AdminVerbCatalogue from '~/components/admin/VerbCatalogue.vue'
import AdminVerbEditor from '~/components/admin/VerbEditor.vue'

interface CatalogueVerb {
  id: number
  infinitif: string
  participePresent: string
  participePasse: string
  auxiliaire: string
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

interface Catalogue {
  verbes: CatalogueVerb[]
  modes: CatalogueMode[]
  temps: CatalogueTense[]
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
  verb: CatalogueVerb
  conjugations: AdminConjugation[]
}

interface VerbPayload {
  infinitif: string
  participePresent: string
  participePasse: string
  auxiliaire: string
  conjugations?: Array<{
    personId: number
    tenseId: number
    conjugaison1: string
    conjugaison2: string
    conjugaison3: string
  }>
}

const { user, handleUnauthorized } = useAdminAuth()
const catalogue = ref<Catalogue>({ verbes: [], modes: [], temps: [] })
const catalogueLoading = ref(false)
const catalogueError = ref('')
const selectedId = ref<number | null>(null)
const detail = ref<VerbDetail | null>(null)
const detailLoading = ref(false)
const detailError = ref('')
const saveError = ref('')
const saveSuccess = ref('')
const saving = ref(false)
const creating = ref(false)
const createError = ref('')
const showCreate = ref(false)
const editorDirty = ref(false)
let detailRequest = 0
let loadedForUserId: number | null = null

useHead({ title: 'Administration des verbes' })

async function fetchCatalogue(loadSelection = true) {
  catalogueLoading.value = true
  catalogueError.value = ''

  try {
    const response = await $fetch<Catalogue>('/api/catalogue', {
      credentials: 'same-origin'
    })
    catalogue.value = {
      verbes: [...response.verbes].sort((a, b) => a.infinitif.localeCompare(b.infinitif, 'fr')),
      modes: [...response.modes].sort((a, b) => a.order - b.order || a.id - b.id),
      temps: [...response.temps]
    }

    if (loadSelection) {
      const selectedStillExists = catalogue.value.verbes.some(verb => verb.id === selectedId.value)
      const nextId = selectedStillExists ? selectedId.value : (catalogue.value.verbes[0]?.id ?? null)
      if (nextId) {
        await loadVerb(nextId)
      } else {
        selectedId.value = null
        detail.value = null
      }
    }
  } catch (error) {
    if (!handleUnauthorized(error)) {
      catalogueError.value = getAdminErrorMessage(error, 'Impossible de charger le catalogue.')
    }
  } finally {
    catalogueLoading.value = false
  }
}

async function loadVerb(id: number) {
  const request = ++detailRequest
  selectedId.value = id
  detailLoading.value = true
  detailError.value = ''
  saveError.value = ''
  saveSuccess.value = ''

  try {
    const response = await $fetch<VerbDetail>(`/api/admin/verbes/${id}`, {
      credentials: 'same-origin'
    })
    if (request === detailRequest) {
      detail.value = response
      editorDirty.value = false
    }
  } catch (error) {
    if (request === detailRequest && !handleUnauthorized(error)) {
      detail.value = null
      detailError.value = getAdminErrorMessage(error, 'Impossible de charger ce verbe.')
    }
  } finally {
    if (request === detailRequest) {
      detailLoading.value = false
    }
  }
}

function mayDiscardChanges(): boolean {
  return !editorDirty.value || window.confirm('Abandonner les modifications non enregistrées ?')
}

function selectVerb(id: number) {
  if (id === selectedId.value && detail.value && !showCreate.value) {
    return
  }
  if (!mayDiscardChanges()) {
    return
  }

  showCreate.value = false
  createError.value = ''
  void loadVerb(id)
}

function openCreateForm() {
  if (!mayDiscardChanges()) {
    return
  }

  showCreate.value = true
  createError.value = ''
  saveError.value = ''
  saveSuccess.value = ''
}

function closeCreateForm() {
  showCreate.value = false
  createError.value = ''
}

async function createVerb(payload: VerbPayload) {
  if (creating.value) {
    return
  }

  creating.value = true
  createError.value = ''

  try {
    const response = await $fetch<{ ok: boolean, id: number }>('/api/admin/verbes', {
      method: 'POST',
      credentials: 'same-origin',
      body: payload
    })
    showCreate.value = false
    await fetchCatalogue(false)
    await loadVerb(response.id)
    saveSuccess.value = `Le verbe « ${payload.infinitif} » a été créé. Vous pouvez maintenant compléter sa grille.`
  } catch (error) {
    if (!handleUnauthorized(error)) {
      createError.value = getAdminErrorMessage(error, 'Impossible de créer ce verbe.')
    }
  } finally {
    creating.value = false
  }
}

async function saveVerb(payload: VerbPayload) {
  const id = selectedId.value
  if (!id || saving.value) {
    return
  }

  saving.value = true
  saveError.value = ''
  saveSuccess.value = ''

  try {
    await $fetch(`/api/admin/verbes/${id}`, {
      method: 'PUT',
      credentials: 'same-origin',
      body: payload
    })
    editorDirty.value = false
    await fetchCatalogue(false)
    await loadVerb(id)
    saveSuccess.value = `Le verbe « ${payload.infinitif} » a été enregistré.`
  } catch (error) {
    if (!handleUnauthorized(error)) {
      saveError.value = getAdminErrorMessage(error, 'Impossible d’enregistrer ce verbe.')
    }
  } finally {
    saving.value = false
  }
}

watch(user, (currentUser) => {
  if (!currentUser) {
    loadedForUserId = null
    return
  }

  if (loadedForUserId !== currentUser.id) {
    loadedForUserId = currentUser.id
    void fetchCatalogue()
  }
}, { immediate: true })
</script>

<template>
  <AdminAuthBoundary>
    <AdminShell>
      <div class="admin-home">
        <header class="admin-section-heading admin-home__heading">
          <div>
            <p class="admin-eyebrow">Données de conjugaison</p>
            <h1>Gestion des verbes</h1>
            <p class="admin-muted">
              Modifiez les fiches, les formes conjuguées et les variantes acceptées.
            </p>
          </div>
        </header>

        <p v-if="catalogueError" class="admin-notice admin-notice--error" role="alert">
          {{ catalogueError }}
          <button class="admin-button admin-button--small" type="button" @click="fetchCatalogue()">
            Réessayer
          </button>
        </p>

        <div class="admin-home__workspace">
          <AdminVerbCatalogue
            :verbs="catalogue.verbes"
            :selected-id="selectedId"
            :loading="catalogueLoading"
            @select="selectVerb"
            @create="openCreateForm"
          />

          <div class="admin-home__editor">
            <AdminNewVerbForm
              v-if="showCreate"
              :saving="creating"
              :error="createError"
              @create="createVerb"
              @cancel="closeCreateForm"
            />

            <div v-else-if="detailLoading" class="admin-home__placeholder" role="status">
              <span class="admin-spinner" aria-hidden="true" />
              <p>Chargement du verbe…</p>
            </div>

            <div v-else-if="detailError" class="admin-home__placeholder">
              <p class="admin-notice admin-notice--error" role="alert">{{ detailError }}</p>
              <button
                v-if="selectedId"
                class="admin-button"
                type="button"
                @click="loadVerb(selectedId)"
              >
                Réessayer
              </button>
            </div>

            <AdminVerbEditor
              v-else-if="detail"
              :detail="detail"
              :modes="catalogue.modes"
              :tenses="catalogue.temps"
              :saving="saving"
              :error="saveError"
              :success="saveSuccess"
              @save="saveVerb"
              @dirty-change="editorDirty = $event"
            />

            <div v-else class="admin-home__placeholder">
              <p class="admin-muted">Sélectionnez un verbe dans le catalogue ou créez-en un nouveau.</p>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  </AdminAuthBoundary>
</template>

<style scoped>
.admin-home {
  display: grid;
  gap: 26px;
}

.admin-home__heading .admin-muted {
  max-width: 720px;
  margin: 8px 0 0;
}

.admin-home > .admin-notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.admin-home__workspace {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(250px, 300px) minmax(0, 1fr);
  gap: 22px;
}

.admin-home__editor {
  min-width: 0;
}

.admin-home__placeholder {
  display: flex;
  min-height: 220px;
  padding: 28px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 14px;
  text-align: center;
  background: #f7fafb;
  border: 1px dashed var(--admin-border);
  border-radius: 12px;
}

.admin-home__placeholder p {
  margin: 0;
}

@media (max-width: 840px) {
  .admin-home__workspace {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .admin-home > .admin-notice {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
