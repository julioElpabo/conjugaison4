<script setup lang="ts">
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

interface ManagedUser {
  id: number
  prenom: string
  nom: string
  email: string
  username: string
  privilegeId: number
  privilegeName: string
  created: string
  modified: string | null
}
interface Privilege { id: number, name: string }

const { user: sessionUser, handleUnauthorized, checkSession } = useAdminAuth()
const users = ref<ManagedUser[]>([])
const privileges = ref<Privilege[]>([])
const selectedId = ref<number | null>(null)
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const success = ref('')
let loaded = false

const draft = reactive({ prenom: '', nom: '', email: '', username: '', password: '', privilegeId: 3 })
const editing = computed(() => selectedId.value !== null)
const selectedUser = computed(() => users.value.find(item => item.id === selectedId.value) || null)

useHead({ title: 'Utilisateurs — Administration' })

function resetDraft() {
  selectedId.value = null
  Object.assign(draft, { prenom: '', nom: '', email: '', username: '', password: '', privilegeId: privileges.value.find(item => item.id === 3)?.id || privileges.value[0]?.id || 1 })
  error.value = ''
  success.value = ''
}

function editUser(managed: ManagedUser) {
  selectedId.value = managed.id
  Object.assign(draft, { prenom: managed.prenom, nom: managed.nom, email: managed.email, username: managed.username, password: '', privilegeId: managed.privilegeId })
  error.value = ''
  success.value = ''
}

async function loadUsers(keepSelection = true) {
  loading.value = true
  error.value = ''
  try {
    const response = await $fetch<{ users: ManagedUser[], privileges: Privilege[] }>('/api/admin/users', { credentials: 'same-origin' })
    users.value = response.users
    privileges.value = response.privileges
    if (keepSelection && selectedId.value) {
      const refreshed = users.value.find(item => item.id === selectedId.value)
      if (refreshed) editUser(refreshed)
      else resetDraft()
    }
  } catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de charger les utilisateurs.')
  } finally {
    loading.value = false
  }
}

async function saveUser() {
  if (saving.value) return
  saving.value = true
  error.value = ''
  success.value = ''
  const body = { ...draft }
  const wasEditing = editing.value
  try {
    if (wasEditing) {
      await $fetch(`/api/admin/users/${selectedId.value}`, { method: 'PUT', credentials: 'same-origin', body })
      if (selectedId.value === sessionUser.value?.id) await checkSession(true)
    } else {
      const response = await $fetch<{ id: number }>('/api/admin/users', { method: 'POST', credentials: 'same-origin', body })
      selectedId.value = response.id
    }
    const message = wasEditing ? 'Utilisateur enregistré.' : 'Utilisateur créé.'
    draft.password = ''
    await loadUsers(true)
    success.value = message
  } catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible d’enregistrer cet utilisateur.')
  } finally {
    saving.value = false
  }
}

async function deleteUser() {
  const managed = selectedUser.value
  if (!managed || deleting.value || !window.confirm(`Supprimer le compte de ${managed.prenom} ${managed.nom} ?`)) return
  deleting.value = true
  error.value = ''
  try {
    await $fetch(`/api/admin/users/${managed.id}`, { method: 'DELETE', credentials: 'same-origin' })
    resetDraft()
    await loadUsers(false)
    success.value = 'Utilisateur supprimé.'
  } catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de supprimer cet utilisateur.')
  } finally {
    deleting.value = false
  }
}

watch(sessionUser, (current) => {
  if (current && !loaded) { loaded = true; void loadUsers(false) }
  if (!current) loaded = false
}, { immediate: true })
</script>

<template>
  <AdminAuthBoundary>
    <AdminShell>
      <div class="admin-users">
        <header class="admin-section-heading">
          <div><p class="admin-eyebrow">Accès</p><h1>Utilisateurs</h1><p class="admin-muted">Créez les comptes et attribuez les rôles administrateur, prof, élève ou parent.</p></div>
          <button class="admin-button admin-button--primary" type="button" @click="resetDraft">Nouvel utilisateur</button>
        </header>

        <p v-if="error" class="admin-notice admin-notice--error" role="alert">{{ error }}</p>
        <p v-if="success" class="admin-notice admin-notice--success" role="status">{{ success }}</p>

        <div class="admin-users__workspace">
          <section class="admin-users__list admin-card" aria-labelledby="users-list-title">
            <header><h2 id="users-list-title">{{ users.length }} comptes</h2><button class="admin-button admin-button--small" :disabled="loading" @click="loadUsers()">Actualiser</button></header>
            <div v-if="loading" class="admin-users__loading"><span class="admin-spinner" aria-hidden="true" /> Chargement…</div>
            <template v-else>
              <button v-for="managed in users" :key="managed.id" :class="['admin-users__item', { 'is-selected': managed.id === selectedId }]" type="button" @click="editUser(managed)">
                <span class="admin-users__avatar" aria-hidden="true">{{ (managed.prenom[0] || managed.username[0] || '?').toLocaleUpperCase('fr') }}</span>
                <span><strong>{{ managed.prenom }} {{ managed.nom }}</strong><small>{{ managed.email }}</small></span>
                <em>{{ managed.privilegeName }}</em>
              </button>
            </template>
          </section>

          <form class="admin-users__form admin-card" @submit.prevent="saveUser">
            <div class="admin-users__form-heading">
              <div><p class="admin-eyebrow">{{ editing ? `Compte no ${selectedId}` : 'Nouveau compte' }}</p><h2>{{ editing ? 'Modifier l’utilisateur' : 'Créer un utilisateur' }}</h2></div>
              <button v-if="editing" class="admin-button admin-button--danger admin-button--small" type="button" :disabled="deleting || selectedId === sessionUser?.id" @click="deleteUser">{{ deleting ? 'Suppression…' : 'Supprimer' }}</button>
            </div>
            <div class="admin-users__fields">
              <label class="admin-field"><span>Prénom *</span><input v-model="draft.prenom" required maxlength="255"></label>
              <label class="admin-field"><span>Nom *</span><input v-model="draft.nom" required maxlength="255"></label>
              <label class="admin-field"><span>Adresse e-mail *</span><input v-model="draft.email" required type="email" maxlength="254"></label>
              <label class="admin-field"><span>Nom d’utilisateur *</span><input v-model="draft.username" required maxlength="255" autocomplete="off"></label>
              <label class="admin-field"><span>{{ editing ? 'Nouveau mot de passe' : 'Mot de passe *' }}</span><input v-model="draft.password" type="password" :required="!editing" minlength="10" maxlength="200" autocomplete="new-password"><small>{{ editing ? 'Laissez vide pour le conserver.' : '10 caractères minimum.' }}</small></label>
              <label class="admin-field"><span>Rôle *</span><select v-model="draft.privilegeId" required><option v-for="privilege in privileges" :key="privilege.id" :value="privilege.id">{{ privilege.name }}</option></select></label>
            </div>
            <div class="admin-users__actions"><button class="admin-button" type="button" @click="resetDraft">Annuler</button><button class="admin-button admin-button--primary" :disabled="saving">{{ saving ? 'Enregistrement…' : (editing ? 'Enregistrer' : 'Créer le compte') }}</button></div>
          </form>
        </div>
      </div>
    </AdminShell>
  </AdminAuthBoundary>
</template>

<style scoped>
.admin-users { display: grid; gap: 23px; }
.admin-users .admin-section-heading { align-items: center; }
.admin-users .admin-section-heading p { margin: 6px 0 0; }
.admin-users__workspace { display: grid; grid-template-columns: minmax(260px, .72fr) minmax(420px, 1.28fr); gap: 18px; align-items: start; }
.admin-users__list, .admin-users__form { padding: 18px; box-shadow: none; }
.admin-users__list > header, .admin-users__form-heading, .admin-users__actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.admin-users h2 { margin: 0; color: var(--admin-navy); }
.admin-users__item { display: grid; width: 100%; margin-top: 8px; padding: 10px; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 10px; text-align: left; background: #f7fafb; border: 1px solid transparent; border-radius: 9px; cursor: pointer; }
.admin-users__item:hover, .admin-users__item.is-selected { background: var(--admin-cyan); border-color: #9bcbd8; }
.admin-users__item > span:nth-child(2) { display: grid; min-width: 0; }
.admin-users__item small { overflow: hidden; color: var(--admin-muted); text-overflow: ellipsis; }
.admin-users__item em { color: var(--admin-blue-dark); font-size: .72rem; font-style: normal; font-weight: 800; text-transform: capitalize; }
.admin-users__avatar { display: grid; width: 35px; height: 35px; place-items: center; color: white; background: var(--admin-blue); border-radius: 10px; font-weight: 900; }
.admin-users__loading { display: flex; margin-top: 20px; align-items: center; gap: 10px; }
.admin-users__form { display: grid; gap: 20px; }
.admin-users__fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px; }
.admin-users__fields small { color: var(--admin-muted); font-weight: 500; }
.admin-users__actions { justify-content: flex-end; }
@media (max-width: 900px) { .admin-users__workspace { grid-template-columns: 1fr; } }
@media (max-width: 600px) { .admin-users .admin-section-heading, .admin-users__form-heading { align-items: stretch; flex-direction: column; } .admin-users__fields { grid-template-columns: 1fr; } }
</style>
