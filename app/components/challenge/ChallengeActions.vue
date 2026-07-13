<script setup lang="ts">
defineProps<{
  ready: boolean
  busyAction?: 'exercise' | 'print' | 'save' | 'load' | null
}>()

const emit = defineEmits<{
  exercise: [mode: 'classic' | 'chat']
  print: []
  save: []
}>()
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
      <button
        class="action-button action-button--primary"
        type="button"
        :disabled="!ready || Boolean(busyAction)"
        @click="emit('exercise', 'classic')"
      >
        <span class="action-button__icon" aria-hidden="true">✎</span>
        <span>
          <strong>{{ busyAction === 'exercise' ? 'Préparation…' : 'Exercice classique' }}</strong>
          <small>Questions et correction immédiate</small>
        </span>
      </button>

      <button
        class="action-button action-button--chat"
        type="button"
        :disabled="!ready || Boolean(busyAction)"
        @click="emit('exercise', 'chat')"
      >
        <span class="action-button__icon" aria-hidden="true">●</span>
        <span>
          <strong>{{ busyAction === 'exercise' ? 'Préparation…' : 'Avec le coach' }}</strong>
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
