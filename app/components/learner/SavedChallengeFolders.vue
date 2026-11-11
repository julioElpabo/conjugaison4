<script setup lang="ts">
import type { SavedChallenge, SavedChallengeFolder, SavedChallengeFolderFilter } from '~~/shared/types/saved-challenge'
import { savedChallengeFoldersCopy } from '~~/shared/i18n/saved-challenge-folders'
import { DEFAULT_SAVED_CHALLENGE_FOLDER_COLOR, savedChallengeFolderColorStyle } from '~~/shared/utils/saved-challenge-folder-colors'

const props = defineProps<{
  modelValue: SavedChallengeFolderFilter, folders: SavedChallengeFolder[], challenges: SavedChallenge[],
  readOnly?: boolean, disabled?: boolean,
}>()
const emit = defineEmits<{
  'update:modelValue': [value: SavedChallengeFolderFilter]
  create: []
  rename: [folder: SavedChallengeFolder]
  color: [folder: SavedChallengeFolder]
  remove: [folder: SavedChallengeFolder]
}>()
const { interfaceLocale } = useLanguagePreferences()
const copy = computed(() => savedChallengeFoldersCopy(interfaceLocale.value))
const currentFolder = computed(() => props.folders.find(folder => folder.id === props.modelValue))
const items = computed(() => {
  const counts = new Map<number | null, number>()
  for (const challenge of props.challenges) {
    const id = challenge.folderId ?? null
    counts.set(id, (counts.get(id) || 0) + 1)
  }
  return [
    { id: 'all' as const, name: copy.value.all, count: props.challenges.length, color: DEFAULT_SAVED_CHALLENGE_FOLDER_COLOR },
    { id: 'unfiled' as const, name: copy.value.unfiled, count: counts.get(null) || 0, color: DEFAULT_SAVED_CHALLENGE_FOLDER_COLOR },
    ...props.folders.map(folder => ({ ...folder, count: counts.get(folder.id) || 0 })),
  ]
})
</script>

<template>
  <div class="saved-folders">
    <div class="saved-folders__heading">
      <h3 id="saved-folders-label">{{ copy.label }}</h3>
      <button v-if="!readOnly" type="button" :disabled="disabled" @click="emit('create')">＋ {{ copy.create }}</button>
    </div>
    <div class="saved-folders__list" role="group" aria-labelledby="saved-folders-label">
      <button v-for="item in items" :key="item.id" type="button" class="saved-folder-colored" :style="savedChallengeFolderColorStyle(item.color)" :aria-pressed="modelValue === item.id" :disabled="disabled" @click="emit('update:modelValue', item.id)">
        <LearnerSavedChallengeFolderIcon v-if="typeof item.id === 'number'" class="saved-folders__icon" />
        <span class="saved-folders__name">{{ item.name }}</span><span class="saved-folders__count">{{ item.count }}</span>
      </button>
    </div>
    <div v-if="currentFolder && !readOnly" class="saved-folders__manage">
      <strong>{{ currentFolder.name }}</strong>
      <button type="button" :disabled="disabled" @click="emit('rename', currentFolder)">{{ copy.rename }}</button>
      <button type="button" class="saved-folders__color saved-folder-colored" :style="savedChallengeFolderColorStyle(currentFolder.color)" :disabled="disabled" @click="emit('color', currentFolder)"><span aria-hidden="true" />{{ copy.color }}</button>
      <button type="button" class="saved-folders__delete" :disabled="disabled" @click="emit('remove', currentFolder)">{{ copy.remove }}</button>
    </div>
  </div>
</template>

<style scoped>
.saved-folder-colored{--folder-accent:var(--folder-color-light,#7052a0)}:global(:root[data-theme='dark'] .saved-folder-colored){--folder-accent:var(--folder-color-dark,#c5a9ed)}
.saved-folders .saved-folders__color{display:flex;align-items:center;justify-content:center;gap:8px}.saved-folders__color span{width:14px;height:14px;border-radius:50%;background:var(--folder-accent);box-shadow:0 0 0 1px color-mix(in srgb,var(--folder-accent) 50%,var(--line))}
.saved-folders{display:grid;gap:14px;padding:18px;border:1px solid var(--line);border-radius:16px;background:var(--surface)}
.saved-folders__heading{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px}.saved-folders h3{margin:0;font-size:1rem;color:var(--ink)}
.saved-folders button{min-height:40px;padding:8px 12px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink);font:inherit;font-size:.82rem;cursor:pointer}
.saved-folders button:disabled{opacity:.5;cursor:default}.saved-folders button:focus-visible{outline:3px solid #8c6cba;outline-offset:3px}
.saved-folders__list{display:flex;flex-wrap:wrap;gap:8px}.saved-folders__list button{display:flex;max-width:100%;align-items:center;gap:10px;text-align:left}.saved-folders__name{overflow-wrap:anywhere;min-width:0}.saved-folders__icon{flex-shrink:0;width:28px;height:28px;color:var(--folder-accent)}.saved-folders__list button[aria-pressed=true] .saved-folders__icon{color:inherit}
.saved-folders__list button[aria-pressed=true]{border-color:var(--folder-accent);background:var(--folder-color-light,#7052a0);color:#fff}.saved-folders__count{flex-shrink:0;min-width:1.5em;padding:2px 5px;border-radius:6px;background:color-mix(in srgb,currentColor 12%,transparent);font-size:.75rem;text-align:center}
.saved-folders__manage{display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding-top:12px;border-top:1px solid var(--line)}.saved-folders__manage strong{margin-right:auto;color:var(--ink);overflow-wrap:anywhere;min-width:0}.saved-folders__manage .saved-folders__delete{color:var(--danger)}
@media(max-width:480px){.saved-folders{padding:14px}.saved-folders__heading>button{width:100%}.saved-folders__manage strong{width:100%}.saved-folders__manage button{flex:1}}
</style>
