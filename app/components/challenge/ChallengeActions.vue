<script setup lang="ts">
import type { CoachProfile } from '~~/shared/types/coach'

defineProps<{
  ready: boolean
  busyAction?: 'exercise' | 'print' | 'save' | 'load' | null
}>()

const emit = defineEmits<{
  exercise: [mode: 'classic' | 'chat']
  print: []
  save: []
}>()

const randomCoachAvatar = useState<string>('challenge-random-coach-avatar', () => '')

onMounted(async () => {
  if (randomCoachAvatar.value) return
  try {
    const response = await $fetch<{ coaches: CoachProfile[] }>('/api/coaches')
    const coachesWithAvatar = response.coaches.filter(coach => coach.avatarPath)
    const coach = coachesWithAvatar[Math.floor(Math.random() * coachesWithAvatar.length)]
    randomCoachAvatar.value = coach?.avatarPath || ''
  } catch {
    // L’action reste utilisable avec son pictogramme de secours.
  }
})
</script>

<template>
  <section class="challenge-launch" aria-labelledby="launch-title">
    <div class="challenge-launch__heading">
      <div>
        <p class="builder-card__eyebrow">Ton défi est prêt</p>
        <h2 id="launch-title">Comment veux-tu l’utiliser&nbsp;?</h2>
      </div>
    </div>

    <div class="challenge-actions" aria-label="Lancer le défi">
      <button
        class="action-button action-button--primary"
        type="button"
        :disabled="!ready || Boolean(busyAction)"
        @click="emit('exercise', 'classic')"
      >
        <span class="action-button__icon" aria-hidden="true">●</span>
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
        <span class="action-button__icon" aria-hidden="true">
          <img v-if="randomCoachAvatar" :src="randomCoachAvatar" alt="">
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
          </svg>
        </span>
        <span>
          <strong>{{ busyAction === 'exercise' ? 'Préparation…' : 'Avec un coach' }}</strong>
          <small>Un exercice sous forme de dialogue virtuel</small>
        </span>
      </button>

      <button
        class="action-button action-button--print"
        type="button"
        :disabled="!ready || Boolean(busyAction)"
        @click="emit('print')"
      >
        <span class="action-button__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9V3h12v6" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <path d="M6 14h12v7H6z" />
            <path d="M18 12h.01" />
          </svg>
        </span>
        <span>
          <strong>{{ busyAction === 'print' ? 'Préparation…' : 'Imprimer' }}</strong>
          <small>Les questions et le corrigé</small>
        </span>
      </button>
    </div>
  </section>

  <section class="challenge-save" aria-labelledby="challenge-save-title">
      <div>
        <strong id="challenge-save-title">Reprendre ou partager ce défi</strong>
        <span>Crée un code que tu pourras conserver ou envoyer.</span>
      </div>
      <button
        class="secondary-button"
        type="button"
        :disabled="!ready || Boolean(busyAction)"
        @click="emit('save')"
      >
        <svg class="challenge-save__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 16V4" />
          <path d="m7 9 5-5 5 5" />
          <path d="M5 21h14" />
        </svg>
        {{ busyAction === 'save' ? 'Sauvegarde…' : 'Sauvegarder et partager' }}
      </button>
  </section>
</template>
