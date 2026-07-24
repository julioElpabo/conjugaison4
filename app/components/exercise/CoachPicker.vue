<script setup lang="ts">
const { interfaceLocale, ui } = useLanguagePreferences()
import type { CoachProfile } from '~~/shared/types/coach'
import { coachHelpApproachTitle, localizeCoachProfile, translateCoachUiText } from '~~/shared/i18n/coach-ui'
import { coachPickerGroups } from '~~/shared/utils/coach-picker-groups'

const props = defineProps<{ tourDemo?: boolean }>()
const emit = defineEmits<{ close: [], select: [coach: CoachProfile] }>()
const coaches = ref<CoachProfile[]>([])
const loading = ref(true)
const error = ref('')
const highlightedGroupId = ref('')
let groupHighlightTimer: ReturnType<typeof setTimeout> | undefined

const coachGroups = computed(() => coachPickerGroups(coaches.value)
  .map(group => ({
    ...group,
    label: coachHelpApproachTitle(interfaceLocale.value, group.approach),
    description: translateCoachUiText(interfaceLocale.value, group.description),
    coaches: (props.tourDemo && group.approach === 'complete'
      ? group.coaches.slice(0, 2)
      : group.coaches)
      .map(coach => localizeCoachProfile(interfaceLocale.value, coach)),
  })))

function coachGroupDomId(id: string) {
  return `coach-help-${id.replace(/[^a-z0-9]+/giu, '-')}`
}

function scrollToCoachGroup(id: string) {
  const group = document.getElementById(coachGroupDomId(id))
  if (!group) return
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  group.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  highlightedGroupId.value = id
  if (groupHighlightTimer) clearTimeout(groupHighlightTimer)
  groupHighlightTimer = setTimeout(() => {
    if (highlightedGroupId.value === id) highlightedGroupId.value = ''
  }, 1_200)
}

onMounted(async () => {
  try {
    const response = await $fetch<{ coaches: CoachProfile[] }>('/api/coaches')
    coaches.value = response.coaches
  } catch {
    error.value = ui('Impossible de charger les coaches.')
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (groupHighlightTimer) clearTimeout(groupHighlightTimer)
})
</script>

<template>
  <Teleport to="body">
    <div class="coach-picker-overlay" data-tour="coach-picker" @click.self="emit('close')">
      <section class="coach-picker" role="dialog" aria-modal="true" aria-labelledby="coach-picker-title">
        <header>
          <div><h2 id="coach-picker-title">{{ ui('Choisis ton coach') }}</h2></div>
          <button type="button" :aria-label="ui('Fermer')" @click="emit('close')">×</button>
        </header>

        <div class="coach-safety">
          <strong>{{ ui('Ces coaches sont des personnages virtuels automatisés.') }}</strong>
          <p>{{ ui('Un avatar, un prénom ou un âge ne prouvent jamais l’identité d’une personne sur Internet.') }} </p>
        </div>

        <p v-if="loading" class="coach-picker__state">{{ ui('Chargement des coaches…') }}</p>
        <p v-else-if="error" class="coach-picker__state coach-picker__state--error">{{ error }}</p>
        <template v-else>
          <nav class="coach-help-menu" :aria-label="ui('Type d’aide')">
            <button
              v-for="group in coachGroups"
              :key="group.id"
              type="button"
              :aria-controls="coachGroupDomId(group.id)"
              @click="scrollToCoachGroup(group.id)"
            >
              {{ group.label }}
            </button>
          </nav>
        <div class="coach-picker__groups">
          <section
            v-for="group in coachGroups"
            :key="group.id"
            :id="coachGroupDomId(group.id)"
            class="coach-caractere-group"
            :class="{ 'is-scroll-target': highlightedGroupId === group.id }"
            :data-tour="group.approach === 'complete' ? 'coach-complete-group' : undefined"
          >
            <header class="coach-caractere-group__header">
              <div><h3>{{ group.label }}</h3><p>{{ group.description }}</p></div>
              <small>{{ ui(group.coaches.length > 1 ? '{count} coaches' : '{count} coach', { count: group.coaches.length }) }}</small>
            </header>
            <div class="coach-picker__grid">
              <button v-for="coach in group.coaches" :key="coach.id" type="button" class="coach-card" :style="{ '--coach-color': coach.themeColor }" @click="emit('select', coach)">
                <img :src="coach.avatarPath" :alt="ui('Avatar de {name}', { name: coach.firstName })">
                <span>
                  <strong>{{ coach.firstName }}</strong>
                  <small class="coach-card__caractere-description">{{ coach.pedagogicalStyle }}</small>
                </span>
                <blockquote v-if="coach.description">« {{ coach.description }} »</blockquote>
                <p v-if="coach.likes" class="coach-card__likes"><b>{{ ui('Aime :') }}</b> {{ coach.likes }}</p>
              </button>
            </div>
          </section>
        </div>
        </template>
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
.coach-help-menu { display: flex; margin: 0 0 18px; padding: 3px 2px 8px; gap: 8px; overflow-x: auto; scrollbar-width: thin; }
.coach-help-menu button { --help-menu-accent: #3b8976; --help-menu-tint: #e7f4ef; flex: 0 0 auto; padding: 9px 13px; color: color-mix(in srgb, var(--help-menu-accent) 78%, #173f55); border: 1px solid color-mix(in srgb, var(--help-menu-accent) 58%, white); border-radius: 999px; background: var(--help-menu-tint); cursor: pointer; font-size: .8rem; font-weight: 800; white-space: nowrap; }
.coach-help-menu button:nth-child(4n + 2) { --help-menu-accent: #b48523; --help-menu-tint: #faf4e6; }
.coach-help-menu button:nth-child(4n + 3) { --help-menu-accent: #bd6737; --help-menu-tint: #fbefe9; }
.coach-help-menu button:nth-child(4n + 4) { --help-menu-accent: #4b846f; --help-menu-tint: #ebf4f0; }
.coach-help-menu button:hover, .coach-help-menu button:focus-visible { color: white; border-color: var(--help-menu-accent); background: var(--help-menu-accent); outline: 0; box-shadow: 0 0 0 3px color-mix(in srgb, var(--help-menu-accent) 18%, transparent); }
.coach-picker__groups { display: grid; gap: 18px; }
.coach-caractere-group { --caractere-accent: #3b8976; --caractere-tint: #e7f4ef; display: grid; scroll-margin-top: 18px; gap: 12px; padding: 15px; border: 1px solid #c8dce1; border-left: 6px solid var(--caractere-accent); border-radius: 17px; background: var(--caractere-tint); }
.coach-caractere-group.is-scroll-target { animation: coach-group-arrival 700ms ease-out; }
.coach-caractere-group:nth-child(4n + 2) { --caractere-accent: #b48523; --caractere-tint: #faf4e6; }
.coach-caractere-group:nth-child(4n + 3) { --caractere-accent: #bd6737; --caractere-tint: #fbefe9; }
.coach-caractere-group:nth-child(4n + 4) { --caractere-accent: #4b846f; --caractere-tint: #ebf4f0; }
.coach-caractere-group__header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 0 3px; }
.coach-caractere-group__header > div { display: grid; gap: 2px; }
.coach-caractere-group__header h3 { margin: 2px 0 3px; color: #173f55; font-size: clamp(1.65rem, 3vw, 2.2rem); letter-spacing: -.025em; line-height: 1.05; }
.coach-picker .coach-caractere-group__header p { margin: 2px 0 0; color: #49636d; font-size: .78rem; font-weight: 500; letter-spacing: normal; line-height: 1.35; text-transform: none; }
.coach-caractere-group__header > small { padding: 5px 9px; color: #49636d; background: rgb(255 255 255 / 68%); border-radius: 999px; font-size: .7rem; font-weight: 800; white-space: nowrap; }
.coach-picker__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.coach-card { display: grid; padding: 17px; grid-template-columns: 66px 1fr; gap: 7px 14px; color: #284650; text-align: left; background: white; border: 2px solid transparent; border-radius: 16px; cursor: pointer; box-shadow: 0 6px 20px rgb(24 61 73 / 8%); }
.coach-card:hover, .coach-card:focus-visible { border-color: var(--coach-color); outline: 0; transform: translateY(-2px); }
.coach-card img { width: 66px; height: 66px; grid-row: 1 / 3; object-fit: cover; border: 3px solid var(--coach-color); border-radius: 50%; }
.coach-card > span { display: grid; align-content: center; }
.coach-card strong { color: #173f55; font-size: 1.1rem; }
.coach-card small { color: #5f7882; }
.coach-card__caractere-description { margin-top: 3px; line-height: 1.35; }
.coach-card p, .coach-card blockquote { grid-column: 1 / -1; margin: 5px 0 0; }
.coach-card blockquote { padding-left: 12px; color: #38535d; border-left: 3px solid color-mix(in srgb, var(--coach-color) 58%, #c5dce2); font-size: .92rem; font-style: italic; line-height: 1.45; }
.coach-card__likes { color: #405b63; font-size: .86rem; line-height: 1.35; }
.coach-card__likes b { color: #173f55; }
.coach-picker__state { padding: 30px; text-align: center; }
.coach-picker__state--error { color: #913e38; }
:global(:root[data-theme='dark'] .coach-caractere-group) { border-color: #405963; border-left-color: var(--caractere-accent); background: color-mix(in srgb, var(--caractere-accent) 14%, #17262a); }
:global(:root[data-theme='dark'] .coach-caractere-group__header h3) { color: #d4e9ee; }
:global(:root[data-theme='dark'] .coach-caractere-group__header p) { color: #b8ced5; }
:global(:root[data-theme='dark'] .coach-caractere-group__header > small) { color: #b8ced5; background: rgb(9 29 34 / 45%); }
:global(:root[data-theme='dark'] .coach-help-menu button) { color: color-mix(in srgb, var(--help-menu-accent) 72%, white); border-color: color-mix(in srgb, var(--help-menu-accent) 62%, #405963); background: color-mix(in srgb, var(--help-menu-accent) 14%, #17262a); }
:global(:root[data-theme='dark'] .coach-help-menu button:hover), :global(:root[data-theme='dark'] .coach-help-menu button:focus-visible) { color: white; border-color: color-mix(in srgb, var(--help-menu-accent) 72%, white); background: var(--help-menu-accent); }
:global(:root[data-theme='dark'] .coach-card__caractere-description) { color: #b8ced5; }
:global(:root[data-theme='dark'] .coach-card blockquote) { color: #cfe0e4; border-left-color: color-mix(in srgb, var(--coach-color) 70%, white); }
:global(:root[data-theme='dark'] .coach-card__likes) { color: #b8ced5; }
:global(:root[data-theme='dark'] .coach-card__likes b) { color: #dff3f6; }
@keyframes coach-group-arrival {
  0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--caractere-accent) 0%, transparent); transform: scale(1); }
  42% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--caractere-accent) 22%, transparent); transform: scale(1.008); }
  100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--caractere-accent) 0%, transparent); transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) { .coach-caractere-group.is-scroll-target { animation: none; } }
@media (max-width: 650px) { .coach-picker__grid { grid-template-columns: 1fr; }.coach-caractere-group { padding: 12px; }.coach-caractere-group__header { align-items: flex-start; }.coach-caractere-group__header > small { margin-top: 2px; } }
</style>
