import type { Ref } from 'vue'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',')

export function useDialogFocus(
  dialog: Readonly<Ref<HTMLElement | null>>,
  close: () => void,
  initialFocus?: Readonly<Ref<HTMLElement | null>>
) {
  let previouslyFocused: HTMLElement | null = null

  function focusableElements() {
    return dialog.value
      ? [...dialog.value.querySelectorAll<HTMLElement>(focusableSelector)]
        .filter(element => !element.hidden && element.offsetParent !== null)
      : []
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }

    if (event.key !== 'Tab') return

    const elements = focusableElements()
    if (elements.length === 0) {
      event.preventDefault()
      dialog.value?.focus()
      return
    }

    const first = elements[0]!
    const last = elements[elements.length - 1]!
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  onMounted(() => {
    previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.classList.add('dialog-open')
    document.addEventListener('keydown', onKeydown)
    nextTick(() => (initialFocus?.value ?? focusableElements()[0] ?? dialog.value)?.focus())
  })

  onBeforeUnmount(() => {
    document.body.classList.remove('dialog-open')
    document.removeEventListener('keydown', onKeydown)
    previouslyFocused?.focus()
  })
}
