<script setup lang="ts">
import { savedChallengeFoldersCopy } from '~~/shared/i18n/saved-challenge-folders'
import { SAVED_CHALLENGE_FOLDER_COLORS, savedChallengeFolderColorStyle, type SavedChallengeFolderColor } from '~~/shared/utils/saved-challenge-folder-colors'

const props = defineProps<{ modelValue: SavedChallengeFolderColor, disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [color: SavedChallengeFolderColor] }>()
const { interfaceLocale } = useLanguagePreferences()
const copy = computed(() => savedChallengeFoldersCopy(interfaceLocale.value))
function selectColor(color: SavedChallengeFolderColor) { if (!props.disabled) emit('update:modelValue', color) }
</script>

<template>
  <fieldset class="saved-folder-palette" :disabled="disabled">
    <legend>{{ copy.color }}</legend>
    <div class="saved-folder-palette__grid">
      <button v-for="option in SAVED_CHALLENGE_FOLDER_COLORS" :key="option.id" type="button" class="saved-folder-palette__choice" :class="{ 'is-selected': modelValue === option.id }" :style="savedChallengeFolderColorStyle(option.id)" :aria-label="copy.colors[option.id]" :aria-pressed="modelValue === option.id" :disabled="disabled" @click="selectColor(option.id)">
        <span class="saved-folder-palette__swatch" :style="{ background: option.swatch }" aria-hidden="true" />
        <span>{{ copy.colors[option.id] }} <span v-if="modelValue === option.id" aria-hidden="true">✓</span></span>
      </button>
    </div>
  </fieldset>
</template>

<style scoped>
.saved-folder-palette{min-width:0;margin:0;padding:0;border:0}.saved-folder-palette legend{margin-bottom:12px;padding:0;font-size:.9rem;font-weight:700}.saved-folder-palette__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.saved-folder-palette__choice{--folder-accent:var(--folder-color-light,#7052a0);display:grid;min-width:0;min-height:80px;justify-items:center;align-content:center;gap:8px;padding:10px 6px;border:1px solid var(--line);border-radius:10px;color:var(--ink);background:var(--surface);font:inherit;font-size:.78rem;overflow-wrap:anywhere;cursor:pointer}:global(:root[data-theme='dark'] .saved-folder-palette__choice){--folder-accent:var(--folder-color-dark,#c5a9ed)}
.saved-folder-palette__choice.is-selected{border-color:var(--folder-accent);box-shadow:0 0 0 2px var(--folder-accent);background:color-mix(in srgb,var(--folder-accent) 12%,var(--surface))}.saved-folder-palette__swatch{width:28px;height:28px;border-radius:50%;border:1px solid rgb(0 0 0 / 15%)}.saved-folder-palette__choice:disabled{opacity:.5;cursor:default}.saved-folder-palette__choice:focus-visible{outline:3px solid #8c6cba;outline-offset:3px}
@media(max-width:480px){.saved-folder-palette__grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
</style>
