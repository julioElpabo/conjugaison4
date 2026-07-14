<script setup lang="ts">
import type { ClassicComplementChoice, Verb } from '~~/shared/types/conjugation'

const props = defineProps<{
  ready: boolean
  busyAction?: 'exercise' | 'print' | 'save' | 'load' | null
  complementVerb?: Verb | null
}>()

const emit = defineEmits<{
  exercise: [mode: 'classic' | 'chat', complementChoice?: ClassicComplementChoice]
  print: []
  save: []
}>()

const classicMenu = ref<HTMLElement | null>(null)
const isClassicMenuOpen = ref(false)
const example = computed(() => props.complementVerb?.complementExample ?? null)

function onClassicClick() {
  if (!example.value) {
    emit('exercise', 'classic')
    return
  }
  isClassicMenuOpen.value = !isClassicMenuOpen.value
}

function launchClassic(choice: ClassicComplementChoice) {
  isClassicMenuOpen.value = false
  emit('exercise', 'classic', choice)
}

function closeFromOutside(event: PointerEvent) {
  if (classicMenu.value && !classicMenu.value.contains(event.target as Node)) {
    isClassicMenuOpen.value = false
  }
}

onMounted(() => document.addEventListener('pointerdown', closeFromOutside))
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeFromOutside))
</script>

<template>
  <section class="challenge-launch" aria-labelledby="launch-title">
    <div class="challenge-launch__heading">
      <div>
        <p class="builder-card__eyebrow">Ton défi est prêt</p>
        <h2 id="launch-title">Comment veux-tu l’utiliser&nbsp;?</h2>
      </div>
      <p>Entraîne-toi directement ou prépare une fiche à distribuer.</p>
    </div>

    <div class="challenge-actions" aria-label="Lancer le défi">
      <div ref="classicMenu" class="classic-action" @keydown.esc="isClassicMenuOpen = false">
        <button
          class="action-button action-button--primary"
          type="button"
          :disabled="!ready || Boolean(busyAction)"
          :aria-expanded="example ? isClassicMenuOpen : undefined"
          :aria-controls="example ? 'classic-complement-menu' : undefined"
          :aria-haspopup="example ? 'menu' : undefined"
          @click="onClassicClick"
        >
          <span class="action-button__icon" aria-hidden="true">✎</span>
          <span>
            <strong>{{ busyAction === 'exercise' ? 'Préparation…' : 'Exercice classique' }}</strong>
            <small>Questions et correction immédiate</small>
          </span>
          <span v-if="example" class="classic-action__chevron" aria-hidden="true">⌄</span>
        </button>

        <div
          v-if="isClassicMenuOpen && example && complementVerb"
          id="classic-complement-menu"
          class="classic-complement-menu"
          role="menu"
          aria-label="Choisir la présentation des compléments"
        >
          <div class="classic-complement-menu__heading">
            <strong>Comment présenter les compléments&nbsp;?</strong>
            <span>Exemples avec « {{ complementVerb.infinitif }} »</span>
          </div>
          <button type="button" role="menuitem" @click="launchClassic('none')">
            <span class="classic-complement-menu__label">Sans complément</span>
            <small>vous <b>[…]</b></small>
          </button>
          <button type="button" role="menuitem" @click="launchClassic('after')">
            <span class="classic-complement-menu__label">Complément après</span>
            <small>vous <b>[…]</b> {{ example.after }}</small>
          </button>
          <button type="button" role="menuitem" @click="launchClassic('before')">
            <span class="classic-complement-menu__label">Complément avant</span>
            <small v-if="example.before">{{ example.before }} que vous <b>[…]</b></small>
            <small v-else>avant si possible · ce COI reste après</small>
          </button>
          <button type="button" role="menuitem" @click="launchClassic('mixed')">
            <span class="classic-complement-menu__label">Un mélange</span>
            <small v-if="example.before">{{ example.after }} · ou · {{ example.before }} que vous <b>[…]</b></small>
            <small v-else>COD avant ou après · COI après</small>
          </button>
        </div>
      </div>

      <button
        class="action-button action-button--chat"
        type="button"
        :disabled="!ready || Boolean(busyAction)"
        @click="emit('exercise', 'chat')"
      >
        <span class="action-button__icon" aria-hidden="true">●</span>
        <span>
          <strong>{{ busyAction === 'exercise' ? 'Préparation…' : 'Avec un coach' }}</strong>
          <small>Un exercice sous forme de dialogue</small>
        </span>
      </button>

      <button
        class="action-button action-button--print"
        type="button"
        :disabled="!ready || Boolean(busyAction)"
        @click="emit('print')"
      >
        <span class="action-button__icon" aria-hidden="true">▤</span>
        <span>
          <strong>{{ busyAction === 'print' ? 'Préparation…' : 'Créer une fiche' }}</strong>
          <small>Questionnaire, corrigé et export Word</small>
        </span>
      </button>
    </div>

    <div class="challenge-save">
      <div>
        <strong>Reprendre ou partager ce défi</strong>
        <span>Crée un code que tu pourras conserver ou envoyer.</span>
      </div>
      <button
        class="secondary-button"
        type="button"
        :disabled="!ready || Boolean(busyAction)"
        @click="emit('save')"
      >
        {{ busyAction === 'save' ? 'Sauvegarde…' : 'Sauvegarder et partager' }}
      </button>
    </div>
  </section>
</template>
