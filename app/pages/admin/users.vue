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
  recentExerciseCount: number
  activeDaysLast30: number
}

interface LearnerAccountsResponse {
  users: LearnerAccountSummary[]
  total: number
  nextOffset: number
  hasMore: boolean
}

interface LearnerActivityResponse {
  summary: {
    createdAt: string
    lastLoginAt: string | null
    lastSeenAt: string | null
    loginCount: number
    exerciseCount: number
    correctCount: number
    incorrectCount: number
  }
  events: Array<{
    id: string
    type: 'registration' | 'login' | 'account' | 'exercise'
    occurredAt: string
    eventType?: string
    startedAt?: string
    label?: string
    presentation?: string
    isReview?: boolean
    completed?: boolean
    correctCount?: number
    incorrectCount?: number
  }>
}

type PreviewTab = 'account' | 'activity'
type ActivityEvent = LearnerActivityResponse['events'][number]

const { user: sessionUser, handleUnauthorized } = useAdminAuth()
const users = ref<LearnerAccountSummary[]>([])
const total = ref(0)
const nextOffset = ref(0)
const hasMore = ref(false)
const selectedId = ref<number>()
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const previewTab = ref<PreviewTab>('account')
const activity = ref<LearnerActivityResponse>()
const activityLoading = ref(false)
const activityError = ref('')
const deleteDialog = ref<HTMLDialogElement | null>(null)
const deleting = ref(false)
const deleteError = ref('')
let loaded = false
let activityRequest = 0

const selectedUser = computed(() => users.value.find(user => user.id === selectedId.value))
const activityConnections = computed(() => {
  const connections: Array<{ connection: ActivityEvent, children: ActivityEvent[] }> = []
  let current: { connection: ActivityEvent, children: ActivityEvent[] } | undefined
  const events = [...(activity.value?.events || [])]
    .sort((left, right) => new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime())

  for (const event of events) {
    if (event.type === 'login' || event.type === 'registration') {
      current = { connection: event, children: [] }
      connections.push(current)
    }
    else if (current) {
      current.children.push(event)
    }
  }

  return connections.reverse().map(group => ({
    ...group,
    children: group.children.reverse(),
  }))
})

useHead({ title: 'Utilisateurs — Administration' })

function displayUsername(username: string) {
  return username
    ? username.charAt(0).toLocaleUpperCase('fr-CH') + username.slice(1)
    : 'Utilisateur'
}

function engagementLevel(learner: LearnerAccountSummary) {
  if (learner.activeDaysLast30 >= 12 && learner.recentExerciseCount >= 24) return 4
  if (learner.activeDaysLast30 >= 6 && learner.recentExerciseCount >= 12) return 3
  if (learner.activeDaysLast30 >= 3 && learner.recentExerciseCount >= 5) return 2
  if (learner.recentExerciseCount > 0) return 1
  return 0
}

function engagementDescription(learner: LearnerAccountSummary) {
  if (!learner.recentExerciseCount) return 'Aucune activité durant les 30 derniers jours'
  return `${learner.recentExerciseCount} exercice${learner.recentExerciseCount > 1 ? 's' : ''} sur ${learner.activeDaysLast30} jour${learner.activeDaysLast30 > 1 ? 's' : ''} durant les 30 derniers jours`
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Jamais'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date inconnue'
  return new Intl.DateTimeFormat('fr-CH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function activityTitle(event: LearnerActivityResponse['events'][number]) {
  if (event.type === 'registration') return 'Création du compte'
  if (event.type === 'login') return 'Connexion'
  if (event.type === 'account') return event.eventType === 'password_changed' ? 'Mot de passe modifié' : 'Modification du compte'
  if (event.isReview) return 'Entraînement sur les erreurs'
  return event.label || 'Exercice utilisé'
}

function activityDetail(event: LearnerActivityResponse['events'][number]) {
  if (event.type !== 'exercise') return ''
  const total = Number(event.correctCount || 0) + Number(event.incorrectCount || 0)
  const presentation = event.presentation === 'chat' ? 'avec coach' : 'classique'
  if (!total) return `Défi ouvert · ${presentation}`
  return `${total} réponse${total > 1 ? 's' : ''} · ${event.correctCount || 0} correcte${Number(event.correctCount) > 1 ? 's' : ''} · ${presentation}`
}

async function loadActivity() {
  const id = selectedId.value
  if (!id) return
  const request = ++activityRequest
  activityLoading.value = true
  activityError.value = ''
  activity.value = undefined
  try {
    const response = await $fetch<LearnerActivityResponse>(`/api/admin/users/${id}/activity`, {
      credentials: 'same-origin',
    })
    if (request === activityRequest && selectedId.value === id) activity.value = response
  }
  catch (caught) {
    if (request !== activityRequest) return
    if (!handleUnauthorized(caught)) {
      activityError.value = getAdminErrorMessage(caught, 'Impossible de charger l’activité.')
    }
  }
  finally {
    if (request === activityRequest) activityLoading.value = false
  }
}

function selectPreviewTab(tab: PreviewTab) {
  previewTab.value = tab
  if (tab === 'activity') void loadActivity()
}

function openDeleteDialog() {
  if (!selectedUser.value) return
  deleteError.value = ''
  deleteDialog.value?.showModal()
}

function closeDeleteDialog() {
  if (!deleting.value) deleteDialog.value?.close()
}

async function deleteSelectedUser() {
  const target = selectedUser.value
  if (!target || deleting.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await $fetch(`/api/admin/users/${target.id}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    })
    const index = users.value.findIndex(user => user.id === target.id)
    users.value = users.value.filter(user => user.id !== target.id)
    total.value = Math.max(0, total.value - 1)
    selectedId.value = users.value[index]?.id || users.value[index - 1]?.id
    activity.value = undefined
    deleteDialog.value?.close()
  }
  catch (caught) {
    if (!handleUnauthorized(caught)) {
      deleteError.value = getAdminErrorMessage(caught, 'Impossible de supprimer ce compte.')
    }
  }
  finally {
    deleting.value = false
  }
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

watch(selectedId, () => {
  activity.value = undefined
  activityError.value = ''
  if (previewTab.value === 'activity') void loadActivity()
})
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
                  :class="[
                    { 'is-selected': learner.id === selectedId },
                    `is-engagement-${engagementLevel(learner)}`,
                  ]"
                  :title="engagementDescription(learner)"
                  @click="selectedId = learner.id"
                >
                  <span class="learner-admin__avatar" aria-hidden="true">
                    {{ learner.username.charAt(0).toLocaleUpperCase('fr-CH') }}
                  </span>
                  <span>
                    <strong>{{ displayUsername(learner.username) }}</strong>
                    <small>{{ engagementDescription(learner) }}</small>
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
            <template v-if="selectedUser">
              <header class="learner-admin__preview-header admin-card">
                <nav aria-label="Consultation de l’utilisateur">
                  <button type="button" :class="{ 'is-active': previewTab === 'account' }" @click="selectPreviewTab('account')">
                    Vue du compte
                  </button>
                  <button type="button" :class="{ 'is-active': previewTab === 'activity' }" @click="selectPreviewTab('activity')">
                    Activité
                  </button>
                </nav>
                <button class="admin-button admin-button--danger admin-button--small" type="button" @click="openDeleteDialog">
                  Supprimer le compte
                </button>
              </header>

              <LearnerSpace
                v-if="previewTab === 'account'"
                :key="selectedUser.id"
                :inspected-learner="{ id: selectedUser.id, username: selectedUser.username }"
                read-only
              />

              <section v-else class="learner-activity admin-card" aria-labelledby="learner-activity-title">
                <header>
                  <div>
                    <p class="admin-eyebrow">Suivi du compte</p>
                    <h2 id="learner-activity-title">Activité de {{ displayUsername(selectedUser.username) }}</h2>
                    <p>Connexions et utilisations enregistrées par le compte.</p>
                  </div>
                  <button class="admin-button admin-button--small" type="button" :disabled="activityLoading" @click="loadActivity">
                    Actualiser
                  </button>
                </header>

                <div v-if="activityLoading" class="learner-admin__loading">
                  <span class="admin-spinner" aria-hidden="true" /> Chargement de l’activité…
                </div>
                <p v-else-if="activityError" class="admin-notice admin-notice--error" role="alert">{{ activityError }}</p>
                <template v-else-if="activity">
                  <dl class="learner-activity__summary">
                    <div><dt>Compte créé</dt><dd>{{ formatDate(activity.summary.createdAt) }}</dd></div>
                    <div><dt>Dernière connexion</dt><dd>{{ formatDate(activity.summary.lastLoginAt) }}</dd></div>
                    <div><dt>Dernière présence</dt><dd>{{ formatDate(activity.summary.lastSeenAt || activity.summary.lastLoginAt) }}</dd></div>
                    <div><dt>Connexions</dt><dd>{{ activity.summary.loginCount }}</dd></div>
                    <div><dt>Exercices utilisés</dt><dd>{{ activity.summary.exerciseCount }}</dd></div>
                    <div><dt>Réponses</dt><dd>{{ activity.summary.correctCount + activity.summary.incorrectCount }}</dd></div>
                  </dl>

                  <ol v-if="activityConnections.length" class="connection-timeline">
                    <li v-for="group in activityConnections" :key="group.connection.id">
                      <span class="connection-timeline__dot" aria-hidden="true" />
                      <details class="connection-card">
                        <summary>
                          <span class="connection-card__icon" aria-hidden="true">↪</span>
                          <span class="connection-card__heading">
                            <strong>{{ group.connection.type === 'registration' ? 'Création et première connexion' : 'Connexion' }}</strong>
                            <time :datetime="group.connection.occurredAt">{{ formatDate(group.connection.occurredAt) }}</time>
                          </span>
                          <span class="connection-card__count">
                            {{ group.children.length }} événement{{ group.children.length > 1 ? 's' : '' }}
                          </span>
                          <span class="connection-card__chevron" aria-hidden="true">⌄</span>
                        </summary>

                        <ol v-if="group.children.length" class="connection-card__children">
                          <li v-for="item in group.children" :key="item.id" :class="`is-${item.type}`">
                            <span class="connection-card__child-dot" aria-hidden="true" />
                            <article>
                              <time :datetime="item.occurredAt">{{ formatDate(item.occurredAt) }}</time>
                              <strong>{{ activityTitle(item) }}</strong>
                              <p v-if="activityDetail(item)">{{ activityDetail(item) }}</p>
                            </article>
                          </li>
                        </ol>
                        <p v-else class="connection-card__empty">Aucun autre événement enregistré pendant cette connexion.</p>
                      </details>
                    </li>
                  </ol>
                  <p v-else class="learner-admin__empty">Aucune activité enregistrée pour ce compte.</p>
                </template>
              </section>
            </template>
            <div v-else-if="!loading" class="admin-card learner-admin__empty">
              Aucun compte utilisateur à afficher.
            </div>
          </main>
        </div>

        <dialog ref="deleteDialog" class="learner-delete-dialog" @cancel="deleting && $event.preventDefault()">
          <section v-if="selectedUser">
            <span class="learner-delete-dialog__icon" aria-hidden="true">!</span>
            <p class="admin-eyebrow">Suppression définitive</p>
            <h2>Supprimer {{ displayUsername(selectedUser.username) }} ?</h2>
            <p>Le compte, ses connexions, sa progression et tout son historique d’exercices seront définitivement supprimés.</p>
            <p v-if="deleteError" class="admin-notice admin-notice--error" role="alert">{{ deleteError }}</p>
            <footer>
              <button class="admin-button" type="button" :disabled="deleting" @click="closeDeleteDialog">Annuler</button>
              <button class="admin-button admin-button--danger" type="button" :disabled="deleting" @click="deleteSelectedUser">
                {{ deleting ? 'Suppression…' : 'Supprimer définitivement' }}
              </button>
            </footer>
          </section>
        </dialog>
      </div>
    </AdminShell>
  </AdminAuthBoundary>
</template>

<style scoped>
.learner-admin{display:grid;gap:20px}.learner-admin .admin-section-heading{align-items:center}.learner-admin .admin-section-heading p{margin:5px 0 0}.learner-admin__workspace{display:grid;grid-template-columns:minmax(260px,320px) minmax(0,1fr);align-items:start;gap:18px}.learner-admin__directory{position:sticky;top:calc(var(--admin-sticky-top,68px) + 82px);display:grid;max-height:calc(100vh - var(--admin-sticky-top,68px) - 100px);padding:14px;gap:10px;overflow:auto;box-shadow:none}.learner-admin__directory>header{padding:5px 5px 10px;border-bottom:1px solid var(--admin-border)}.learner-admin__directory h2{margin:0;color:var(--admin-navy);font-size:1rem}.learner-admin__directory header span{color:var(--admin-muted);font-size:.72rem}.learner-admin__loading{display:flex;min-height:140px;align-items:center;justify-content:center;gap:9px;color:var(--admin-muted)}.learner-admin__list{display:grid;margin:0;padding:0;gap:6px;list-style:none}.learner-admin__list button{display:grid;width:100%;padding:9px;grid-template-columns:38px minmax(0,1fr) auto;align-items:center;gap:9px;color:var(--admin-navy);border:1px solid transparent;border-radius:11px;background:#f7fafb;text-align:left;cursor:pointer;transition:background-color .18s,border-color .18s,transform .18s}.learner-admin__list button:hover{border-color:#6ba99a;transform:translateX(2px)}.learner-admin__list button.is-selected{border-color:#257769;box-shadow:0 0 0 2px rgb(37 119 105 / 20%)}.learner-admin__list button.is-engagement-0{background:#fff}.learner-admin__list button.is-engagement-1{background:#edf8f1}.learner-admin__list button.is-engagement-2{background:#c7ead4}.learner-admin__list button.is-engagement-3{color:#103f34;background:#74c59a}.learner-admin__list button.is-engagement-4{color:#fff;background:#176b50}.learner-admin__list button.is-engagement-3 small{color:#285f4f}.learner-admin__list button.is-engagement-4 small{color:#d9f2e6}.learner-admin__list button.is-engagement-4 b{color:#145641;background:#e8f7ef}.learner-admin__avatar{display:grid;width:38px;height:38px;place-items:center;color:white;border-radius:11px;background:var(--admin-blue);font-weight:900}.learner-admin__list button>span:nth-child(2){display:grid;min-width:0}.learner-admin__list strong,.learner-admin__list small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.learner-admin__list small{color:var(--admin-muted);font-size:.68rem}.learner-admin__list b{display:grid;min-width:28px;height:28px;padding:0 7px;place-items:center;color:var(--admin-blue-dark);border-radius:999px;background:white;font-size:.72rem}.learner-admin__more{width:100%}.learner-admin__preview{display:grid;min-width:0;gap:14px}.learner-admin__preview :deep(.learner-space){max-width:none}.learner-admin__preview-header{display:flex;padding:7px;align-items:center;justify-content:space-between;gap:14px}.learner-admin__preview-header nav{display:flex;padding:3px;border-radius:10px;background:#edf3f5}.learner-admin__preview-header nav button{padding:8px 14px;border:0;border-radius:8px;color:var(--admin-muted);background:transparent;font:inherit;font-size:.8rem;font-weight:850;cursor:pointer}.learner-admin__preview-header nav button.is-active{color:white;background:var(--admin-blue);box-shadow:0 4px 10px rgb(23 74 87 / 18%)}.learner-admin__empty{display:grid;min-height:360px;place-items:center;color:var(--admin-muted)}.learner-activity{display:grid;padding:clamp(20px,3vw,30px);gap:24px}.learner-activity>header{display:flex;align-items:start;justify-content:space-between;gap:18px}.learner-activity h2{margin:0;color:var(--admin-navy)}.learner-activity header p:last-child{margin:5px 0 0;color:var(--admin-muted)}.learner-activity__summary{display:grid;margin:0;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.learner-activity__summary>div{display:grid;padding:15px;border:1px solid var(--admin-border);border-radius:12px;gap:5px;background:#f7fafb}.learner-activity__summary dt{color:var(--admin-muted);font-size:.7rem;font-weight:850;text-transform:uppercase}.learner-activity__summary dd{margin:0;color:var(--admin-navy);font-size:1.05rem;font-weight:900}.connection-timeline{position:relative;display:grid;margin:0;padding:0 0 0 36px;gap:13px;list-style:none}.connection-timeline::before{position:absolute;top:22px;bottom:22px;left:11px;width:3px;border-radius:99px;background:#b9d4d7;content:""}.connection-timeline>li{position:relative}.connection-timeline__dot{position:absolute;z-index:1;top:24px;left:-32px;width:15px;height:15px;border:4px solid white;border-radius:50%;background:var(--admin-blue);box-shadow:0 0 0 2px var(--admin-blue)}.connection-card{overflow:hidden;border:1px solid var(--admin-border);border-radius:14px;background:#fff}.connection-card>summary{display:grid;padding:15px;grid-template-columns:38px minmax(0,1fr) auto 20px;align-items:center;gap:11px;cursor:pointer;list-style:none}.connection-card>summary::-webkit-details-marker{display:none}.connection-card__icon{display:grid;width:38px;height:38px;place-items:center;color:#fff;border-radius:11px;background:var(--admin-blue);font-size:1.15rem;font-weight:900}.connection-card__heading{display:grid;gap:3px}.connection-card__heading strong{color:var(--admin-navy);font-size:1rem}.connection-card__heading time{color:#246679;font-size:.86rem;font-weight:850}.connection-card__count{padding:5px 9px;color:var(--admin-muted);border-radius:999px;background:#edf3f5;font-size:.7rem;font-weight:800}.connection-card__chevron{color:var(--admin-blue);font-size:1.25rem;transition:transform .18s}.connection-card[open] .connection-card__chevron{transform:rotate(180deg)}.connection-card__children{position:relative;display:grid;margin:0 14px 15px 33px;padding:4px 0 0 28px;gap:9px;border-left:2px solid #c9dadd;list-style:none}.connection-card__children li{position:relative}.connection-card__child-dot{position:absolute;top:18px;left:-34px;width:10px;height:10px;border:3px solid #fff;border-radius:50%;background:#7052a0;box-shadow:0 0 0 2px #7052a0}.connection-card__children li.is-account .connection-card__child-dot{background:#d48b36;box-shadow:0 0 0 2px #d48b36}.connection-card__children article{display:grid;padding:11px 13px;border:1px solid var(--admin-border);border-radius:11px;gap:3px;background:#f8fafb}.connection-card__children time{color:var(--admin-muted);font-size:.69rem}.connection-card__children strong{color:var(--admin-navy);font-size:.86rem}.connection-card__children p,.connection-card__empty{margin:0;color:var(--admin-muted);font-size:.76rem}.connection-card__empty{padding:0 18px 16px 64px}.learner-delete-dialog{width:min(500px,calc(100% - 28px));padding:0;border:0;border-radius:22px;background:white;box-shadow:0 28px 80px rgb(18 35 54 / 30%)}.learner-delete-dialog::backdrop{background:rgb(12 29 45 / 60%);backdrop-filter:blur(4px)}.learner-delete-dialog section{display:grid;padding:30px;justify-items:center;gap:9px;text-align:center}.learner-delete-dialog__icon{display:grid;width:52px;height:52px;place-items:center;color:#a43d37;border-radius:50%;background:#f8e3e1;font-size:1.5rem;font-weight:950}.learner-delete-dialog h2{margin:0;color:var(--admin-navy)}.learner-delete-dialog section>p:not(.admin-eyebrow):not(.admin-notice){margin:3px 0 12px;color:var(--admin-muted);line-height:1.55}.learner-delete-dialog footer{display:flex;width:100%;margin-top:8px;justify-content:flex-end;gap:9px}@media(max-width:1050px){.learner-admin__workspace{grid-template-columns:1fr}.learner-admin__directory{position:static;max-height:420px}}@media(max-width:680px){.learner-admin__preview-header,.learner-activity>header{align-items:stretch;flex-direction:column}.learner-admin__preview-header nav{display:grid;grid-template-columns:1fr 1fr}.learner-activity__summary{grid-template-columns:1fr 1fr}.connection-card>summary{grid-template-columns:34px minmax(0,1fr) 18px}.connection-card__count{display:none}.learner-delete-dialog footer{display:grid}.learner-delete-dialog footer button{width:100%}}
</style>
