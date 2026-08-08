<script setup lang="ts">
const props = defineProps<{ verbId: number }>()
const emit = defineEmits<{ close: [] }>()
const { localePath, ui } = useLanguagePreferences()
const dialog = useTemplateRef<HTMLElement>('dialog')
const closeButton = useTemplateRef<HTMLButtonElement>('close-button')
const frame = useTemplateRef<HTMLIFrameElement>('frame')
let previouslyFocused: HTMLElement | null = null

const consultationUrl = computed(() => {
  const path = localePath('/consulter')
  return `${path}?verbe=${encodeURIComponent(String(props.verbId))}&embed=challenge`
})

function close() {
  emit('close')
}

function onMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin) return
  if (event.source !== frame.value?.contentWindow) return
  if (event.data?.type === 'tatitotu:close-verb-consultation') close()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopImmediatePropagation()
    close()
    return
  }
  if (event.key !== 'Tab' || !dialog.value) return
  const focusable = [...dialog.value.querySelectorAll<HTMLElement>('button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])')]
    .filter(element => element.offsetParent !== null)
  if (!focusable.length) return
  const first = focusable[0]!
  const last = focusable[focusable.length - 1]!
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  }
  else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => {
  previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
  window.addEventListener('message', onMessage)
  document.addEventListener('keydown', onKeydown, true)
  nextTick(() => closeButton.value?.focus())
})

onBeforeUnmount(() => {
  window.removeEventListener('message', onMessage)
  document.removeEventListener('keydown', onKeydown, true)
  previouslyFocused?.focus()
})
</script>

<template>
  <Teleport to="body">
    <div class="verb-consultation-overlay" @click.self="close">
      <section
        ref="dialog"
        class="verb-consultation-dialog"
        role="dialog"
        aria-modal="true"
        :aria-label="ui('Consulter le verbe')"
      >
        <header>
          <strong>{{ ui('Consulter le verbe') }}</strong>
          <button ref="close-button" type="button" :aria-label="ui('Fermer')" @click="close">×</button>
        </header>
        <iframe ref="frame" :src="consultationUrl" :title="ui('Consulter le verbe')" />
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.verb-consultation-overlay {
  position: fixed;
  z-index: 2400;
  inset: 0;
  display: grid;
  padding: 20px;
  place-items: center;
  background: rgb(16 31 42 / 76%);
  backdrop-filter: blur(7px);
}
.verb-consultation-dialog {
  display: grid;
  width: min(1180px, calc(100vw - 40px));
  height: min(94vh, 1040px);
  overflow: hidden;
  grid-template-rows: auto minmax(0, 1fr);
  border: 1px solid rgb(255 255 255 / 64%);
  border-radius: 22px;
  background: var(--surface);
  box-shadow: 0 30px 90px rgb(5 19 28 / 46%);
}
.verb-consultation-dialog > header {
  display: flex;
  min-height: 58px;
  padding: 10px 14px 10px 20px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: white;
  background: #344758;
}
.verb-consultation-dialog > header strong { font-size: 1.05rem; }
.verb-consultation-dialog > header button {
  width: 38px;
  height: 38px;
  border: 1px solid rgb(255 255 255 / 52%);
  border-radius: 11px;
  color: white;
  background: rgb(255 255 255 / 10%);
  cursor: pointer;
  font: inherit;
  font-size: 1.5rem;
  line-height: 1;
}
.verb-consultation-dialog > header button:hover,
.verb-consultation-dialog > header button:focus-visible { background: rgb(255 255 255 / 22%); }
.verb-consultation-dialog iframe { width: 100%; height: 100%; border: 0; background: var(--surface-soft); }

@media (max-width: 680px) {
  .verb-consultation-overlay { padding: 0; }
  .verb-consultation-dialog { width: 100vw; height: 100dvh; border: 0; border-radius: 0; }
}
</style>
