<script setup lang="ts">
const { ui, localePath } = useLanguagePreferences()
const props = defineProps<{
  code: string
  url: string
  busy?: boolean
  error?: string
  initialTitle?: string
  initialDescription?: string
}>()

const emit = defineEmits<{
  close: []
  save: [title: string, description: string]
}>()

const copyStatus = ref('')
const challengeTitle = ref(props.initialTitle?.trim() || ui('Défi de conjugaison'))
const challengeDescription = ref(props.initialDescription?.trim() || '')
const closeButton = useTemplateRef<HTMLButtonElement>('close-button')
const dialog = useTemplateRef<HTMLElement>('share-dialog')
const normalizedTitle = computed(() => challengeTitle.value.trim())
const normalizedDescription = computed(() => challengeDescription.value.trim())
const titleIsValid = computed(() => normalizedTitle.value.length >= 1 && normalizedTitle.value.length <= 80)

useDialogFocus(dialog, () => emit('close'), closeButton)

async function copy(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value)
    copyStatus.value = `${label} copié.`
  } catch {
    copyStatus.value = `Sélectionnez puis copiez le ${label.toLocaleLowerCase('fr')}.`
  }
}

function highlightChallengeLoaderOnHome() {
  try {
    sessionStorage.setItem('highlight-home-challenge-loader', '1')
  } catch {
    // Le lien reste fonctionnel si le stockage du navigateur est indisponible.
  }
}

function createCode() {
  if (props.code || props.busy || !titleIsValid.value) return
  emit('save', normalizedTitle.value, normalizedDescription.value)
}

</script>

<template>
  <Teleport to="body">
    <div class="dialog-backdrop" @click.self="emit('close')">
      <section ref="share-dialog" class="app-dialog share-dialog" data-tour="share-dialog" role="dialog" aria-modal="true" aria-labelledby="share-title" tabindex="-1">
        <button ref="close-button" class="dialog-close" type="button" :aria-label="ui('Fermer')" @click="emit('close')">
          ×
        </button>
        <p class="dialog-kicker">{{ code ? ui('Défi sauvegardé') : ui('Défi prêt à être partagé') }}</p>
        <h2 id="share-title">{{ ui('Votre défi est prêt à être partagé') }}</h2>
        <form class="share-title-form" @submit.prevent="createCode">
          <label for="share-challenge-title">{{ ui('Titre du défi') }}</label>
          <div>
            <input
              id="share-challenge-title"
              v-model="challengeTitle"
              type="text"
              maxlength="80"
              :readonly="Boolean(code)"
              :aria-invalid="!titleIsValid"
              :aria-describedby="error ? 'share-title-error' : undefined"
              required
              autofocus
            >
            <button v-if="!code" class="primary-button" type="submit" :disabled="busy || !titleIsValid">
              {{ busy ? ui('Création…') : ui('Créer le code') }}
            </button>
          </div>
          <small>{{ normalizedTitle.length }}/80</small>
          <label for="share-challenge-description">{{ ui('Description du défi') }}</label>
          <textarea
            id="share-challenge-description"
            v-model="challengeDescription"
            rows="4"
            maxlength="1000"
            :readonly="Boolean(code)"
            :aria-describedby="error ? 'share-title-error share-description-help' : 'share-description-help'"
          />
          <small id="share-description-help" class="share-title-form__description-help">
            {{ ui('Facultatif : une description à l’attention des personnes qui découvriront ce défi') }}
            · {{ normalizedDescription.length }}/1000
          </small>
          <p v-if="error" id="share-title-error" class="form-error" role="alert">{{ error }}</p>
        </form>
        <p v-if="code">{{ ui('Deux possibilités permettent à vos élèves de retrouver ce défi.') }}</p>

        <div v-if="code" class="share-methods">
          <section class="share-method" aria-labelledby="share-code-title">
            <header>
              <span class="share-method__number" aria-hidden="true">1</span>
              <div>
                <h3 id="share-code-title">{{ ui('Sauvegarder le code') }}</h3>
                <p>{{ ui('L’élève conserve ce code. Plus tard, il le copie sur la page d’accueil pour retrouver ce défi.') }}</p>
                <p class="share-method__tip">{{ ui('Idéal pour transmettre le défi par écrit') }}</p>
              </div>
            </header>
            <div class="share-value">
              <label for="share-code">{{ ui('Code à conserver') }}</label>
              <div>
                <input id="share-code" :value="code" readonly @focus="($event.target as HTMLInputElement).select()">
                <button type="button" @click="copy(code, 'Code')">{{ ui('Copier') }}</button>
              </div>
              <div class="share-help">
                <button type="button" class="share-help__trigger" aria-describedby="reload-help-tooltip">{{ ui('Comment le recharger plus tard ?') }}</button>
                <div id="reload-help-tooltip" class="share-help__tooltip" role="tooltip">
                  <div class="share-help__preview">
                    <img src="/images/recharger-defi.svg?v=dynamic-code" :alt="ui('Emplacement du code reçu sur la page d’accueil')">
                    <span aria-hidden="true">{{ code }}</span>
                  </div>
                  <p>Tes élèves colleront le code à cet endroit dans la <NuxtLink :to="localePath('/')" @click="highlightChallengeLoaderOnHome">{{ ui('page d’accueil') }}</NuxtLink></p>
                </div>
              </div>
            </div>
          </section>

          <section class="share-method" aria-labelledby="share-link-title">
            <header>
              <span class="share-method__number" aria-hidden="true">2</span>
              <div>
                <h3 id="share-link-title">{{ ui('Envoyer le lien direct') }}</h3>
                <p>{{ ui('L’élève clique simplement sur ce lien : il arrive directement sur le défi, sans saisir le code.') }}</p>
                <p class="share-method__tip">{{ ui('Idéal pour transmettre le défi par email') }}</p>
              </div>
            </header>
            <div class="share-value">
              <label for="share-url">{{ ui('Lien à envoyer') }}</label>
              <div>
                <input id="share-url" :value="url" readonly @focus="($event.target as HTMLInputElement).select()">
                <button type="button" @click="copy(url, 'Lien')">{{ ui('Copier') }}</button>
              </div>
            </div>
          </section>
        </div>

        <template v-if="code">
          <p class="copy-status" aria-live="polite">{{ copyStatus }}</p>
          <button class="primary-button" type="button" @click="emit('close')">{{ ui('Terminé') }}</button>
        </template>
      </section>
    </div>
  </Teleport>
</template>
