<script setup lang="ts">
const { ui } = useLanguagePreferences()
import { normalizeChallengeCode } from '~/composables/useChallengeApi'

const props = defineProps<{
  busy?: boolean
  error?: string
}>()

const emit = defineEmits<{
  close: []
  load: [code: string]
}>()

const code = ref('')
const input = useTemplateRef<HTMLInputElement>('code-input')
const dialog = useTemplateRef<HTMLElement>('load-dialog')
const localError = ref('')

useDialogFocus(dialog, () => emit('close'), input)

function submit() {
  const normalized = normalizeChallengeCode(code.value)
  if (!/^[A-Z0-9]{2}(?:-[A-Z0-9]{2}){3}$/.test(normalized)) {
    localError.value = ui('Le code doit ressembler à AB-CD-EF-23.')
    return
  }

  localError.value = ''
  emit('load', normalized)
}

</script>

<template>
  <Teleport to="body">
    <div class="dialog-backdrop" @click.self="emit('close')">
      <section ref="load-dialog" class="app-dialog load-dialog" role="dialog" aria-modal="true" aria-labelledby="load-title" tabindex="-1">
        <button class="dialog-close" type="button" :aria-label="ui('Fermer')" @click="emit('close')">×</button>
        <p class="dialog-kicker">{{ ui('Défi enregistré') }}</p>
        <h2 id="load-title">{{ ui('Charger un défi') }}</h2>
        <p>{{ ui('Saisissez ou collez le code reçu. Les tirets sont ajoutés automatiquement.') }}</p>

        <form @submit.prevent="submit">
          <label class="field-stack" for="challenge-code">
            <span>{{ ui('Code à 8 caractères') }}</span>
            <input
              id="challenge-code"
              ref="code-input"
              v-model="code"
              type="text"
              autocomplete="off"
              autocapitalize="characters"
              placeholder="AB-CD-EF-23"
              maxlength="11"
              @paste="localError = ''"
            >
          </label>
          <p v-if="localError || props.error" class="form-error" role="alert">
            {{ localError || props.error }}
          </p>
          <div class="dialog-actions">
            <button class="secondary-button" type="button" @click="emit('close')">{{ ui('Annuler') }}</button>
            <button class="primary-button" type="submit" :disabled="busy">
              {{ busy ? ui('Chargement…') : ui('Charger ce défi') }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </Teleport>
</template>
