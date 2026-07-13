<script setup lang="ts">
const props = defineProps<{
  code: string
  url: string
}>()

const emit = defineEmits<{
  close: []
}>()

const copyStatus = ref('')
const closeButton = useTemplateRef<HTMLButtonElement>('close-button')
const dialog = useTemplateRef<HTMLElement>('share-dialog')

useDialogFocus(dialog, () => emit('close'), closeButton)

async function copy(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value)
    copyStatus.value = `${label} copié.`
  } catch {
    copyStatus.value = `Sélectionnez puis copiez le ${label.toLocaleLowerCase('fr')}.`
  }
}

</script>

<template>
  <Teleport to="body">
    <div class="dialog-backdrop" @click.self="emit('close')">
      <section ref="share-dialog" class="app-dialog share-dialog" role="dialog" aria-modal="true" aria-labelledby="share-title" tabindex="-1">
        <button ref="close-button" class="dialog-close" type="button" aria-label="Fermer" @click="emit('close')">
          ×
        </button>
        <p class="dialog-kicker">Défi sauvegardé</p>
        <h2 id="share-title">Votre défi est prêt à être partagé</h2>
        <p>Conservez ce code ou envoyez directement le lien à vos élèves.</p>

        <div class="share-value">
          <label for="share-code">Code du défi</label>
          <div>
            <input id="share-code" :value="code" readonly @focus="($event.target as HTMLInputElement).select()">
            <button type="button" @click="copy(code, 'Code')">Copier</button>
          </div>
        </div>

        <div class="share-value">
          <label for="share-url">Lien direct</label>
          <div>
            <input id="share-url" :value="url" readonly @focus="($event.target as HTMLInputElement).select()">
            <button type="button" @click="copy(url, 'Lien')">Copier</button>
          </div>
        </div>

        <p class="copy-status" aria-live="polite">{{ copyStatus }}</p>
        <button class="primary-button" type="button" @click="emit('close')">Terminé</button>
      </section>
    </div>
  </Teleport>
</template>
