export async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return
    } catch { /* Utiliser la sélection si le navigateur refuse le presse-papiers. */ }
  }
  const previousFocus = document.activeElement
  const field = document.createElement('textarea')
  field.value = value
  field.readOnly = true
  field.style.position = 'fixed'
  field.style.opacity = '0'
  document.body.appendChild(field)
  try {
    field.focus()
    field.select()
    field.setSelectionRange(0, value.length)
    if (!document.execCommand('copy')) throw new Error('Copy failed')
  } finally {
    field.remove()
    if (previousFocus instanceof HTMLElement) previousFocus.focus()
  }
}
