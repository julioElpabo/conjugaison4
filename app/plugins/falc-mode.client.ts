export default defineNuxtPlugin(() => {
  const falcMode = useState<boolean>('falc-mode', () => false)
  falcMode.value = document.documentElement.dataset.falcMode === 'true'
})
