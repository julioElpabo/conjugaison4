<script setup lang="ts">
import type { SavedChallengeFolder } from '~~/shared/types/saved-challenge'
import { savedChallengeFoldersCopy } from '~~/shared/i18n/saved-challenge-folders'
import { savedChallengeFolderColor, savedChallengeFolderColorStyle, type SavedChallengeFolderColor } from '~~/shared/utils/saved-challenge-folder-colors'

const props = defineProps<{ folder: SavedChallengeFolder, pending: boolean, error: string }>()
const emit = defineEmits<{ close: [], confirm: [color: SavedChallengeFolderColor], clearError: [] }>()
const { interfaceLocale } = useLanguagePreferences()
const copy = computed(() => savedChallengeFoldersCopy(interfaceLocale.value))
const color = ref(savedChallengeFolderColor(props.folder.color))
const dialog = useTemplateRef<HTMLElement>('dialog')
const colorPicker = useTemplateRef<HTMLElement>('color-picker')
const initialFocus = computed(() => colorPicker.value?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]') ?? null)

function close() { if (!props.pending) emit('close') }
function selectColor(value: SavedChallengeFolderColor) {
  if (props.pending) return
  color.value = value
  emit('clearError')
}
function confirm() { if (!props.pending) emit('confirm', color.value) }
useDialogFocus(dialog, close, initialFocus)
</script>

<template>
  <Teleport to="body">
    <div class="saved-folder-color-backdrop" @click.self="close">
      <section ref="dialog" class="saved-folder-color-dialog" role="dialog" aria-modal="true" aria-labelledby="saved-folder-color-title" :aria-busy="pending" tabindex="-1">
        <h2 id="saved-folder-color-title">{{ copy.colorTitle }}</h2>
        <form @submit.prevent="confirm">
          <p class="saved-folder-color-preview saved-folder-colored" :style="savedChallengeFolderColorStyle(color)"><LearnerSavedChallengeFolderIcon /><strong>{{ folder.name }}</strong></p>
          <div ref="color-picker"><LearnerSavedChallengeFolderColorPicker :model-value="color" :disabled="pending" @update:model-value="selectColor" /></div>
          <p v-if="error" class="saved-folder-color-error" role="alert">{{ error }}</p>
          <div class="saved-folder-color-actions">
            <button type="button" :disabled="pending" @click="close">{{ copy.cancel }}</button>
            <button type="submit" class="is-primary" :disabled="pending">{{ pending ? copy.pending : copy.save }}</button>
          </div>
        </form>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.saved-folder-colored{--folder-accent:var(--folder-color-light,#7052a0)}:global(:root[data-theme='dark'] .saved-folder-colored){--folder-accent:var(--folder-color-dark,#c5a9ed)}
.saved-folder-color-backdrop{position:fixed;inset:0;z-index:1100;display:grid;place-items:center;padding:20px;background:rgb(12 20 35 / 75%);backdrop-filter:blur(6px)}
.saved-folder-color-dialog{box-sizing:border-box;width:min(100%,560px);max-height:calc(100dvh - 40px);overflow:auto;padding:24px;border:1px solid var(--line);border-radius:20px;background:var(--surface,var(--paper,#fff));color:var(--ink);box-shadow:0 28px 100px rgb(0 0 0 / 30%)}
.saved-folder-color-dialog h2{margin:0 0 20px;font-size:1.25rem;line-height:1.4}.saved-folder-color-dialog form{display:grid;gap:12px}.saved-folder-color-dialog p{margin:0;line-height:1.6}.saved-folder-color-preview{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid color-mix(in srgb,var(--folder-accent) 55%,var(--line));border-radius:12px;background:color-mix(in srgb,var(--folder-accent) 12%,var(--surface));overflow-wrap:anywhere}.saved-folder-color-preview svg{flex-shrink:0;color:var(--folder-accent)}.saved-folder-color-preview strong{min-width:0}
.saved-folder-color-dialog button{padding:10px 16px;border:1px solid var(--line);border-radius:10px;color:var(--ink);background:var(--surface);font:inherit;cursor:pointer}
.saved-folder-color-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:10px;margin-top:8px}.saved-folder-color-dialog .is-primary{background:#7052a0;border-color:#7052a0;color:#fff}.saved-folder-color-dialog button:disabled{opacity:.5;cursor:default}.saved-folder-color-dialog button:focus-visible{outline:3px solid #8c6cba;outline-offset:3px}.saved-folder-color-error{color:var(--danger)}
@media(max-width:480px){.saved-folder-color-dialog{padding:20px}.saved-folder-color-actions button{flex:1}}
</style>
