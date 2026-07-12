<script setup lang="ts">
defineProps<{
  ready: boolean
  busyAction?: 'exercise' | 'print' | 'save' | 'load' | null
}>()

const emit = defineEmits<{
  exercise: [mode: 'classic' | 'chat']
  print: []
  save: []
  load: []
}>()
</script>

<template>
  <div class="challenge-actions" aria-label="Actions du défi">
    <button
      class="action-button action-button--primary"
      type="button"
      :disabled="!ready || Boolean(busyAction)"
      @click="emit('exercise', 'classic')"
    >
      <span class="action-button__icon" aria-hidden="true">✎</span>
      <span>
        <strong>{{ busyAction === 'exercise' ? 'Préparation…' : 'Exercice classique' }}</strong>
        <small>Questions et correction</small>
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
        <strong>{{ busyAction === 'exercise' ? 'Préparation…' : 'Exercice chat' }}</strong>
        <small>Dialogue avec un coach</small>
      </span>
    </button>

    <button
      class="action-button"
      type="button"
      :disabled="!ready || Boolean(busyAction)"
      @click="emit('print')"
    >
      <span class="action-button__icon" aria-hidden="true">▤</span>
      <span>
        <strong>{{ busyAction === 'print' ? 'Préparation…' : 'Imprimer' }}</strong>
        <small>Fiche et corrigé</small>
      </span>
    </button>

    <button
      class="action-button action-button--save"
      type="button"
      :disabled="!ready || Boolean(busyAction)"
      @click="emit('save')"
    >
      <span class="action-button__icon" aria-hidden="true">↑</span>
      <span>
        <strong>{{ busyAction === 'save' ? 'Sauvegarde…' : 'Sauvegarder' }}</strong>
        <small>Obtenir un code de partage</small>
      </span>
    </button>

    <button
      class="action-button action-button--load"
      type="button"
      :disabled="Boolean(busyAction)"
      @click="emit('load')"
    >
      <span class="action-button__icon" aria-hidden="true">↓</span>
      <span>
        <strong>Charger</strong>
        <small>Retrouver un défi</small>
      </span>
    </button>
  </div>
</template>
