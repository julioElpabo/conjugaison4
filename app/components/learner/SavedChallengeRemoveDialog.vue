<script setup lang="ts">
import type { SavedChallenge } from '~~/shared/types/saved-challenge'
import { savedChallengeRemovalCopy } from '~~/shared/i18n/saved-challenge-removal'

const props = defineProps<{ challenges: SavedChallenge[], pending: boolean, failed: boolean }>()
const emit = defineEmits<{ close: [], confirm: [] }>()
const { interfaceLocale } = useLanguagePreferences()
const copy = computed(() => savedChallengeRemovalCopy(interfaceLocale.value))
const dialog = useTemplateRef<HTMLElement>('dialog')
const cancelButton = useTemplateRef<HTMLButtonElement>('cancel-button')
function close() { if (!props.pending) emit('close') }
useDialogFocus(dialog, close, cancelButton)
</script>

<template>
  <Teleport to="body">
    <div class="saved-remove-backdrop" @click.self="close">
      <section ref="dialog" class="saved-remove-dialog" role="dialog" aria-modal="true" aria-labelledby="saved-remove-title" aria-describedby="saved-remove-scope" :aria-busy="pending" tabindex="-1">
        <h2 id="saved-remove-title">{{ copy.confirmTitle(challenges.length) }}</h2>
        <ul><li v-for="challenge in challenges" :key="challenge.code">{{ challenge.title }}</li></ul>
        <p id="saved-remove-scope">{{ copy.scope }}</p>
        <p v-if="failed" class="saved-remove-error" role="alert">{{ copy.error }}</p>
        <div class="saved-remove-actions">
          <button ref="cancel-button" type="button" :disabled="pending" @click="close">{{ copy.cancel }}</button>
          <button type="button" class="saved-remove-confirm" :disabled="pending" @click="emit('confirm')">{{ pending ? copy.pending : copy.confirm }}</button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.saved-remove-backdrop{position:fixed;inset:0;z-index:1100;display:grid;place-items:center;padding:20px;background:rgb(12 20 35 / 75%);backdrop-filter:blur(6px)}
.saved-remove-dialog{box-sizing:border-box;width:min(100%,560px);max-height:calc(100dvh - 40px);overflow:auto;padding:24px;border:1px solid var(--line);border-radius:20px;background:var(--surface,var(--paper,#fff));color:var(--ink);box-shadow:0 28px 100px rgb(0 0 0 / 30%)}
.saved-remove-dialog h2{margin:0;font-size:1.25rem;line-height:1.4}.saved-remove-dialog ul{max-height:25dvh;overflow:auto;padding-left:24px;overflow-wrap:anywhere}.saved-remove-dialog p{line-height:1.6}.saved-remove-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:10px;margin-top:20px}.saved-remove-actions button{padding:10px 16px;border:1px solid var(--line);border-radius:10px;color:var(--ink);background:var(--surface,var(--paper,#fff));font:inherit;cursor:pointer}.saved-remove-actions .saved-remove-confirm{background:var(--danger);border-color:var(--danger);color:var(--surface,#fff)}.saved-remove-actions button:disabled{opacity:.6;cursor:wait}.saved-remove-actions button:focus-visible{outline:3px solid #8c6cba;outline-offset:3px}.saved-remove-error{color:var(--danger)}
@media(max-width:480px){.saved-remove-dialog{padding:20px}.saved-remove-actions button{flex:1}}
</style>
