<script setup lang="ts">
import type { SavedChallengeFolder, SavedChallengeFolderAction } from '~~/shared/types/saved-challenge'
import { savedChallengeFoldersCopy } from '~~/shared/i18n/saved-challenge-folders'
import { DEFAULT_SAVED_CHALLENGE_FOLDER_COLOR, savedChallengeFolderColorStyle, type SavedChallengeFolderColor } from '~~/shared/utils/saved-challenge-folder-colors'

const props = defineProps<{
  action: Exclude<SavedChallengeFolderAction, { kind: 'color' }>, folders: SavedChallengeFolder[], pending: boolean, error: string,
  createFolder: (name: string, color: SavedChallengeFolderColor) => Promise<SavedChallengeFolder | null>,
}>()
const emit = defineEmits<{ close: [], confirm: [values: { name: string, folderId: number | null, color?: SavedChallengeFolderColor }], clearError: [] }>()
const { interfaceLocale } = useLanguagePreferences()
const copy = computed(() => savedChallengeFoldersCopy(interfaceLocale.value))
const name = ref('folder' in props.action ? props.action.folder.name : '')
const destination = ref('')
const creatingFolder = ref(false)
const newFolderName = ref('')
const color = ref<SavedChallengeFolderColor>(DEFAULT_SAVED_CHALLENGE_FOLDER_COLOR)
const newFolderColor = ref<SavedChallengeFolderColor>(DEFAULT_SAVED_CHALLENGE_FOLDER_COLOR)
const dialog = useTemplateRef<HTMLElement>('dialog')
const cancelButton = useTemplateRef<HTMLButtonElement>('cancel-button')
const firstInput = useTemplateRef<HTMLElement>('first-input')
const destinations = useTemplateRef<HTMLElement>('destinations')
const newFolderInput = useTemplateRef<HTMLInputElement>('new-folder-input')
const createButton = useTemplateRef<HTMLButtonElement>('create-button')
const initialFocus = computed(() => props.action.kind === 'delete' ? cancelButton.value
  : props.action.kind === 'move' ? destinations.value?.querySelector<HTMLButtonElement>('button') ?? null : firstInput.value)
const title = computed(() => {
  switch (props.action.kind) {
    case 'create': return copy.value.create
    case 'rename': return copy.value.rename
    case 'delete': return copy.value.deleteTitle(props.action.folder.name)
    case 'move': return copy.value.moveTitle
  }
  return ''
})
const validName = (value: string) => value.trim().length > 0 && value.trim().length <= 80
const valid = computed(() => props.action.kind === 'delete'
  || (props.action.kind === 'move' ? !!destination.value && !creatingFolder.value
    : (props.action.kind === 'create' || props.action.kind === 'rename') && validName(name.value)))
const destinationOptions = computed(() => [
  { value: 'unfiled', name: copy.value.unfiled, color: DEFAULT_SAVED_CHALLENGE_FOLDER_COLOR },
  ...props.folders.map(folder => ({ value: String(folder.id), name: folder.name, color: folder.color })),
])
function close() { if (!props.pending) emit('close') }
function confirm() {
  if (!props.pending && valid.value) emit('confirm', { name: name.value, folderId: destination.value === 'unfiled' ? null : Number(destination.value), color: color.value })
}
async function startCreatingFolder() {
  emit('clearError')
  creatingFolder.value = true
  newFolderName.value = ''
  newFolderColor.value = DEFAULT_SAVED_CHALLENGE_FOLDER_COLOR
  await nextTick()
  newFolderInput.value?.focus()
}
async function cancelCreatingFolder() {
  emit('clearError')
  creatingFolder.value = false
  await nextTick()
  createButton.value?.focus()
}
async function createDestination() {
  if (props.pending || !validName(newFolderName.value)) return
  const folder = await props.createFolder(newFolderName.value, newFolderColor.value)
  if (!folder) return
  destination.value = String(folder.id)
  creatingFolder.value = false
  await nextTick()
  destinations.value?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')?.focus()
}
function selectDestination(value: string) {
  emit('clearError')
  destination.value = value
  creatingFolder.value = false
}
function submit() {
  if (props.action.kind === 'move' && creatingFolder.value) void createDestination()
  else confirm()
}
useDialogFocus(dialog, close, initialFocus)
</script>

<template>
  <Teleport to="body">
    <div class="saved-folder-backdrop" @click.self="close">
      <section ref="dialog" class="saved-folder-dialog" role="dialog" aria-modal="true" aria-labelledby="saved-folder-dialog-title" :aria-describedby="action.kind === 'delete' ? 'saved-folder-delete-hint' : undefined" :aria-busy="pending" tabindex="-1">
        <h2 id="saved-folder-dialog-title">{{ title }}</h2>
        <form @submit.prevent="submit">
          <template v-if="action.kind === 'create' || action.kind === 'rename'">
            <label for="saved-folder-name">{{ copy.name }}</label>
            <input id="saved-folder-name" ref="first-input" v-model="name" maxlength="80" required :disabled="pending" autocomplete="off">
            <LearnerSavedChallengeFolderColorPicker v-if="action.kind === 'create'" v-model="color" :disabled="pending" @update:model-value="emit('clearError')" />
          </template>
          <template v-else-if="action.kind === 'move'">
            <ul><li v-for="challenge in action.challenges" :key="challenge.code">{{ challenge.title }}</li></ul>
            <fieldset ref="destinations" class="saved-folder-destinations" :disabled="pending">
              <legend>{{ copy.destination }}</legend>
              <div class="saved-folder-destinations__grid">
                <button v-for="option in destinationOptions" :key="option.value" type="button" class="saved-folder-choice saved-folder-colored" :style="savedChallengeFolderColorStyle(option.color)" :class="{ 'is-selected': destination === option.value }" :aria-pressed="destination === option.value" :disabled="pending" @click="selectDestination(option.value)">
                  <LearnerSavedChallengeFolderIcon v-if="option.value !== 'unfiled'" />
                  <span>{{ option.name }}</span>
                  <span class="saved-folder-choice__check" aria-hidden="true">{{ destination === option.value ? '✓' : '' }}</span>
                </button>
              </div>
            </fieldset>
            <div v-if="creatingFolder" class="saved-folder-new">
              <label for="saved-folder-new-name">{{ copy.name }}</label>
              <input id="saved-folder-new-name" ref="new-folder-input" v-model="newFolderName" maxlength="80" :disabled="pending" autocomplete="off">
              <LearnerSavedChallengeFolderColorPicker v-model="newFolderColor" :disabled="pending" @update:model-value="emit('clearError')" />
              <div class="saved-folder-new__actions">
                <button type="button" :disabled="pending" @click="cancelCreatingFolder">{{ copy.cancel }}</button>
                <button type="submit" class="is-primary" :disabled="pending || !validName(newFolderName)">{{ pending ? copy.pending : copy.create }}</button>
              </div>
            </div>
            <button v-else ref="create-button" type="button" class="saved-folder-create" :disabled="pending" @click="startCreatingFolder">＋ {{ copy.create }}</button>
          </template>
          <p v-else-if="action.kind === 'delete'" id="saved-folder-delete-hint">{{ copy.deleteHint }}</p>
          <p v-if="error" class="saved-folder-dialog__error" role="alert">{{ error }}</p>
          <div class="saved-folder-dialog__actions">
            <button ref="cancel-button" type="button" :disabled="pending" @click="close">{{ copy.cancel }}</button>
            <button type="submit" :class="{ 'is-danger': action.kind === 'delete', 'is-primary': action.kind !== 'delete' }" :disabled="pending || !valid">
              {{ pending ? copy.pending : action.kind === 'delete' ? copy.remove : action.kind === 'move' ? copy.move : copy.save }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.saved-folder-colored{--folder-accent:var(--folder-color-light,#7052a0)}:global(:root[data-theme='dark'] .saved-folder-colored){--folder-accent:var(--folder-color-dark,#c5a9ed)}
.saved-folder-backdrop{position:fixed;inset:0;z-index:1100;display:grid;place-items:center;padding:20px;background:rgb(12 20 35 / 75%);backdrop-filter:blur(6px)}
.saved-folder-dialog{box-sizing:border-box;width:min(100%,560px);max-height:calc(100dvh - 40px);overflow:auto;padding:24px;border:1px solid var(--line);border-radius:20px;background:var(--surface,var(--paper,#fff));color:var(--ink);box-shadow:0 28px 100px rgb(0 0 0 / 30%)}
.saved-folder-dialog h2{margin:0 0 20px;font-size:1.25rem;line-height:1.4;overflow-wrap:anywhere}.saved-folder-dialog form{display:grid;gap:12px}.saved-folder-dialog label{font-size:.9rem;font-weight:700}.saved-folder-dialog input{box-sizing:border-box;width:100%;min-width:0;min-height:44px;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink);font:inherit}.saved-folder-dialog ul{max-height:25dvh;overflow:auto;margin:0;padding-left:24px;overflow-wrap:anywhere}.saved-folder-dialog p{margin:0;line-height:1.6}
.saved-folder-destinations{min-width:0;margin:0;padding:0;border:0}.saved-folder-destinations legend{margin-bottom:12px;padding:0;font-size:.9rem;font-weight:700}.saved-folder-destinations__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.saved-folder-dialog .saved-folder-choice{display:flex;min-width:0;min-height:64px;align-items:center;gap:10px;padding:12px;border:1px solid var(--line);border-radius:12px;cursor:pointer;text-align:left;font-weight:500}.saved-folder-choice span{min-width:0;overflow-wrap:anywhere}.saved-folder-choice svg{flex-shrink:0;color:var(--folder-accent)}.saved-folder-choice__check{flex-shrink:0;width:1em;margin-left:auto}.saved-folder-choice.is-selected{border-color:var(--folder-accent);background:color-mix(in srgb,var(--folder-accent) 15%,var(--surface))}.saved-folder-destinations:disabled .saved-folder-choice{opacity:.5;cursor:default}
.saved-folder-dialog .saved-folder-create{justify-self:start;border-style:dashed}.saved-folder-new{display:grid;gap:10px;padding:14px;border:1px solid var(--line);border-radius:12px}.saved-folder-new__actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}
.saved-folder-dialog__actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:10px;margin-top:8px}.saved-folder-dialog button{padding:10px 16px;border:1px solid var(--line);border-radius:10px;color:var(--ink);background:var(--surface);font:inherit;cursor:pointer}.saved-folder-dialog .is-primary{background:#7052a0;border-color:#7052a0;color:#fff}.saved-folder-dialog .is-danger{background:var(--danger);border-color:var(--danger);color:#fff}.saved-folder-dialog button:disabled{opacity:.5;cursor:default}.saved-folder-dialog :is(button,input,select):focus-visible{outline:3px solid #8c6cba;outline-offset:3px}.saved-folder-dialog__error{color:var(--danger)}
@media(max-width:480px){.saved-folder-dialog{padding:20px}.saved-folder-destinations__grid{grid-template-columns:1fr}.saved-folder-dialog__actions button,.saved-folder-new__actions button{flex:1}.saved-folder-dialog .saved-folder-create{justify-self:stretch}}
</style>
