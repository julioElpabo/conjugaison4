<script setup lang="ts">
import type { CoachProfile } from '~~/shared/types/coach'

const emit = defineEmits<{ close: [], select: [coach: CoachProfile] }>()
const coaches = ref<CoachProfile[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const response = await $fetch<{ coaches: CoachProfile[] }>('/api/coaches')
    coaches.value = response.coaches
  } catch {
    error.value = 'Impossible de charger les coaches.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <Teleport to="body">
    <div class="coach-picker-overlay" @click.self="emit('close')">
      <section class="coach-picker" role="dialog" aria-modal="true" aria-labelledby="coach-picker-title">
        <header>
          <div><p>Exercice dialogué</p><h2 id="coach-picker-title">Choisis ton coach</h2></div>
          <button type="button" aria-label="Fermer" @click="emit('close')">×</button>
        </header>

        <div class="coach-safety">
          <strong>Les coaches sont des personnages virtuels automatisés.</strong>
          <p>Un avatar, un prénom ou un âge ne prouvent jamais l’identité d’une personne sur Internet. Ici, écris seulement les réponses demandées et ne partage aucune information personnelle.</p>
        </div>

        <p v-if="loading" class="coach-picker__state">Chargement des coaches…</p>
        <p v-else-if="error" class="coach-picker__state coach-picker__state--error">{{ error }}</p>
        <div v-else class="coach-picker__grid">
          <button v-for="coach in coaches" :key="coach.id" type="button" class="coach-card" :style="{ '--coach-color': coach.themeColor }" @click="emit('select', coach)">
            <img :src="coach.avatarPath" :alt="`Avatar de ${coach.firstName}`">
            <span><strong>{{ coach.firstName }}</strong><small>Personnage virtuel</small></span>
            <p>{{ coach.description }}</p>
            <em>{{ coach.pedagogicalStyle }}</em>
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.coach-picker-overlay { position: fixed; z-index: 1000; inset: 0; display: grid; padding: 20px; place-items: center; background: rgb(25 44 58 / 72%); backdrop-filter: blur(5px); }
.coach-picker { width: min(920px, 100%); max-height: calc(100vh - 40px); padding: clamp(20px, 4vw, 34px); overflow-y: auto; background: #f8fbfc; border-radius: 24px; box-shadow: 0 30px 80px rgb(12 29 39 / 35%); }
.coach-picker > header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
.coach-picker header p { margin: 0 0 5px; color: #26758e; font-size: .78rem; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
.coach-picker h2 { margin: 0; color: #173f55; font-size: clamp(1.8rem, 4vw, 2.6rem); }
.coach-picker header button { width: 42px; height: 42px; color: #49636d; background: white; border: 1px solid #cad8dc; border-radius: 50%; font-size: 1.5rem; cursor: pointer; }
.coach-safety { margin: 20px 0; padding: 15px 17px; color: #38535d; background: #edf6f8; border: 1px solid #bddbe3; border-radius: 13px; }
.coach-safety p { margin: 5px 0 0; line-height: 1.45; }
.coach-picker__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.coach-card { display: grid; padding: 17px; grid-template-columns: 66px 1fr; gap: 7px 14px; color: #284650; text-align: left; background: white; border: 2px solid transparent; border-radius: 16px; cursor: pointer; box-shadow: 0 6px 20px rgb(24 61 73 / 8%); }
.coach-card:hover, .coach-card:focus-visible { border-color: var(--coach-color); outline: 0; transform: translateY(-2px); }
.coach-card img { width: 66px; height: 66px; grid-row: 1 / 3; object-fit: cover; border: 3px solid var(--coach-color); border-radius: 50%; }
.coach-card > span { display: grid; align-content: center; }
.coach-card strong { color: #173f55; font-size: 1.1rem; }
.coach-card small { color: #5f7882; }
.coach-card p, .coach-card em { grid-column: 1 / -1; margin: 5px 0 0; }
.coach-card em { color: #59717a; font-size: .88rem; font-style: normal; }
.coach-picker__state { padding: 30px; text-align: center; }
.coach-picker__state--error { color: #913e38; }
@media (max-width: 650px) { .coach-picker__grid { grid-template-columns: 1fr; } }
</style>
