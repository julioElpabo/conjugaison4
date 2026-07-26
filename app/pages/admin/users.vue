<script setup lang="ts">
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

interface LearnerAccountSummary {
  id: number
  username: string
  status: string
  createdAt: string
  lastLoginAt: string | null
  lastActivityAt: string | null
  exerciseCount: number
  correctCount: number
  incorrectCount: number
}

interface LearnerAccountsResponse {
  users: LearnerAccountSummary[]
  total: number
  nextOffset: number
  hasMore: boolean
}

const { user: sessionUser, handleUnauthorized } = useAdminAuth()
const users = ref<LearnerAccountSummary[]>([])
const total = ref(0)
const nextOffset = ref(0)
const hasMore = ref(false)
const selectedId = ref<number>()
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
let loaded = false

const selectedUser = computed(() => users.value.find(user => user.id === selectedId.value))

useHead({ title: 'Utilisateurs — Administration' })

function displayUsername(username: string) {
  return username
    ? username.charAt(0).toLocaleUpperCase('fr-CH') + username.slice(1)
    : 'Utilisateur'
}

function exerciseLabel(count: number) {
  return `${count} exercice${count > 1 ? 's' : ''}`
}

async function loadUsers(reset = true) {
  if (reset ? loading.value : loadingMore.value) return
  if (reset) loading.value = true
  else loadingMore.value = true
  error.value = ''
  try {
    const response = await $fetch<LearnerAccountsResponse>('/api/admin/users', {
      query: { offset: reset ? 0 : nextOffset.value, limit: 50 },
      credentials: 'same-origin',
    })
    users.value = reset ? response.users : [...users.value, ...response.users]
    total.value = response.total
    nextOffset.value = response.nextOffset
    hasMore.value = response.hasMore
    if (!selectedId.value || !users.value.some(user => user.id === selectedId.value)) {
      selectedId.value = users.value[0]?.id
    }
  }
  catch (caught) {
    if (!handleUnauthorized(caught)) {
      error.value = getAdminErrorMessage(caught, 'Impossible de charger les utilisateurs.')
    }
  }
  finally {
    loading.value = false
    loadingMore.value = false
  }
}

watch(sessionUser, (current) => {
  if (current && !loaded) {
    loaded = true
    void loadUsers()
  }
  if (!current) loaded = false
}, { immediate: true })
</script>

<template>
  <AdminAuthBoundary>
    <AdminShell>
      <div class="learner-admin">
        <header class="admin-section-heading">
          <div>
            <p class="admin-eyebrow">Comptes pseudonymes</p>
            <h1>Utilisateurs</h1>
            <p class="admin-muted">Les comptes sont classés du plus actif au moins actif.</p>
          </div>
          <button class="admin-button admin-button--small" type="button" :disabled="loading" @click="loadUsers()">
            Actualiser
          </button>
        </header>

        <p v-if="error" class="admin-notice admin-notice--error" role="alert">{{ error }}</p>

        <div class="learner-admin__workspace">
          <aside class="learner-admin__directory admin-card" aria-labelledby="learner-directory-title">
            <header>
              <div>
                <h2 id="learner-directory-title">{{ total }} utilisateurs</h2>
                <span>Triés par exercices réalisés</span>
              </div>
            </header>

            <div v-if="loading" class="learner-admin__loading">
              <span class="admin-spinner" aria-hidden="true" /> Chargement…
            </div>
            <ol v-else class="learner-admin__list">
              <li v-for="learner in users" :key="learner.id">
                <button
                  type="button"
                  :class="{ 'is-selected': learner.id === selectedId }"
                  @click="selectedId = learner.id"
                >
                  <span class="learner-admin__avatar" aria-hidden="true">
                    {{ learner.username.charAt(0).toLocaleUpperCase('fr-CH') }}
                  </span>
                  <span>
                    <strong>{{ displayUsername(learner.username) }}</strong>
                    <small>{{ exerciseLabel(learner.exerciseCount) }}</small>
                  </span>
                  <b>{{ learner.exerciseCount }}</b>
                </button>
              </li>
            </ol>
            <button
              v-if="hasMore"
              class="admin-button learner-admin__more"
              type="button"
              :disabled="loadingMore"
              @click="loadUsers(false)"
            >
              {{ loadingMore ? 'Chargement…' : 'Afficher les suivants' }}
            </button>
          </aside>

          <main class="learner-admin__preview">
            <LearnerSpace
              v-if="selectedUser"
              :key="selectedUser.id"
              :inspected-learner="{ id: selectedUser.id, username: selectedUser.username }"
              read-only
            />
            <div v-else-if="!loading" class="admin-card learner-admin__empty">
              Aucun compte utilisateur à afficher.
            </div>
          </main>
        </div>
      </div>
    </AdminShell>
  </AdminAuthBoundary>
</template>

<style scoped>
.learner-admin{display:grid;gap:20px}.learner-admin .admin-section-heading{align-items:center}.learner-admin .admin-section-heading p{margin:5px 0 0}.learner-admin__workspace{display:grid;grid-template-columns:minmax(260px,320px) minmax(0,1fr);align-items:start;gap:18px}.learner-admin__directory{position:sticky;top:calc(var(--admin-sticky-top,68px) + 82px);display:grid;max-height:calc(100vh - var(--admin-sticky-top,68px) - 100px);padding:14px;gap:10px;overflow:auto;box-shadow:none}.learner-admin__directory>header{padding:5px 5px 10px;border-bottom:1px solid var(--admin-border)}.learner-admin__directory h2{margin:0;color:var(--admin-navy);font-size:1rem}.learner-admin__directory header span{color:var(--admin-muted);font-size:.72rem}.learner-admin__loading{display:flex;min-height:140px;align-items:center;justify-content:center;gap:9px;color:var(--admin-muted)}.learner-admin__list{display:grid;margin:0;padding:0;gap:6px;list-style:none}.learner-admin__list button{display:grid;width:100%;padding:9px;grid-template-columns:38px minmax(0,1fr) auto;align-items:center;gap:9px;color:var(--admin-navy);border:1px solid transparent;border-radius:11px;background:#f7fafb;text-align:left;cursor:pointer}.learner-admin__list button:hover,.learner-admin__list button.is-selected{border-color:#83bfce;background:var(--admin-cyan)}.learner-admin__avatar{display:grid;width:38px;height:38px;place-items:center;color:white;border-radius:11px;background:var(--admin-blue);font-weight:900}.learner-admin__list button>span:nth-child(2){display:grid;min-width:0}.learner-admin__list strong,.learner-admin__list small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.learner-admin__list small{color:var(--admin-muted);font-size:.72rem}.learner-admin__list b{display:grid;min-width:28px;height:28px;padding:0 7px;place-items:center;color:var(--admin-blue-dark);border-radius:999px;background:white;font-size:.72rem}.learner-admin__more{width:100%}.learner-admin__preview{min-width:0}.learner-admin__preview :deep(.learner-space){max-width:none}.learner-admin__empty{display:grid;min-height:360px;place-items:center;color:var(--admin-muted)}@media(max-width:1050px){.learner-admin__workspace{grid-template-columns:1fr}.learner-admin__directory{position:static;max-height:420px}}
</style>
