<script setup lang="ts">
import type {
  AnalyticsUserActivityWindow,
  AnalyticsUsersResponse,
} from '~~/shared/types/analytics'

const props = defineProps<{
  users: AnalyticsUsersResponse
  activityWindow: AnalyticsUserActivityWindow
}>()
const emit = defineEmits<{
  'update:activityWindow': [value: AnalyticsUserActivityWindow]
}>()
const activityOptions: Array<{ value: AnalyticsUserActivityWindow, label: string }> = [
  { value: 'week', label: '7 derniers jours' },
  { value: 'month', label: '30 derniers jours' },
  { value: 'year', label: '365 derniers jours' },
]
const activityLabel = computed(() => (
  activityOptions.find(option => option.value === props.activityWindow)?.label || '30 derniers jours'
))

function number(value: number) {
  return new Intl.NumberFormat('fr-CH').format(value)
}
</script>

<template>
  <div class="user-usage">
    <section class="user-usage__kpis" aria-label="Synthèse des comptes utilisateurs">
      <article>
        <span>Comptes existants</span>
        <strong>{{ number(users.totalAccounts) }}</strong>
        <small>comptes non supprimés</small>
      </article>
      <article>
        <label for="user-activity-window">Utilisateurs actifs</label>
        <strong>{{ number(users.activeAccounts) }}</strong>
        <select
          id="user-activity-window"
          :value="activityWindow"
          @change="emit('update:activityWindow', ($event.target as HTMLSelectElement).value as AnalyticsUserActivityWindow)"
        >
          <option v-for="option in activityOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </article>
      <article>
        <span>Reprise de leurs erreurs</span>
        <strong>{{ number(users.errorReviewUsers) }}</strong>
        <small>utilisateurs distincts sur la période affichée</small>
      </article>
    </section>

    <p v-if="users.notice" class="user-usage__notice">{{ users.notice }}</p>

    <div class="user-usage__charts">
      <AdminFeatureUsageChart
        :items="users.languages"
        :max-items="5"
        eyebrow="Préférences"
        title="Langue choisie par les utilisateurs"
        insight="Répartition de la langue actuellement enregistrée dans les préférences des comptes."
        center-label="comptes"
      />
      <AdminTrendChart
        title="Créations de comptes"
        eyebrow="Évolution"
        :series="[{ label: 'Nouveaux comptes', color: '#08758b', points: users.registrations }]"
        :insight="`Comptes créés entre le ${new Date(`${users.startDate}T12:00:00`).toLocaleDateString('fr-CH')} et le ${new Date(`${users.endDate}T12:00:00`).toLocaleDateString('fr-CH')}.`"
        :x-unit="users.registrationUnit"
        y-unit="Nouveaux comptes"
      />
    </div>
    <p class="user-usage__definition">
      <strong>{{ number(users.activeAccounts) }}</strong> utilisateur{{ users.activeAccounts > 1 ? 's' : '' }}
      actif{{ users.activeAccounts > 1 ? 's' : '' }} sur les {{ activityLabel.toLocaleLowerCase('fr-CH') }}.
    </p>
  </div>
</template>

<style scoped>
.user-usage{display:grid;gap:16px}.user-usage__kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.user-usage__kpis article{display:grid;min-height:130px;padding:17px;border:1px solid #c9dce0;border-radius:14px;align-content:start;gap:5px;background:#fff}.user-usage__kpis span,.user-usage__kpis label{color:#577078;font-size:.73rem;font-weight:800}.user-usage__kpis strong{color:#073f51;font-size:2rem;line-height:1}.user-usage__kpis small{color:#71868c;font-size:.68rem}.user-usage__kpis select{margin-top:auto;padding:8px 30px 8px 9px;border:1px solid #bdd2d7;border-radius:8px;color:#143f4c;background:#fff;font:inherit;font-size:.72rem;font-weight:750}.user-usage__notice,.user-usage__definition{margin:0;padding:11px 14px;border-radius:9px;color:#526d75;background:#edf5f6;font-size:.72rem;line-height:1.45}.user-usage__charts{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.35fr);gap:12px}.user-usage__charts>:deep(.admin-card){border:1px solid #c9dce0;border-radius:16px;background:#fff}:global(:root[data-theme='dark']) .user-usage__kpis article,:global(:root[data-theme='dark']) .user-usage__charts>:deep(.admin-card){border-color:#3d565e;background:#172a30}:global(:root[data-theme='dark']) .user-usage__kpis strong{color:#dff5f7}:global(:root[data-theme='dark']) .user-usage__kpis span,:global(:root[data-theme='dark']) .user-usage__kpis label,:global(:root[data-theme='dark']) .user-usage__kpis small{color:#a9c1c7}:global(:root[data-theme='dark']) .user-usage__kpis select{color:#d9eff2;border-color:#48636b;background:#20383f}:global(:root[data-theme='dark']) .user-usage__notice,:global(:root[data-theme='dark']) .user-usage__definition{color:#bdd2d7;background:#20383f}@media(max-width:960px){.user-usage__charts{grid-template-columns:1fr}}@media(max-width:650px){.user-usage__kpis{grid-template-columns:1fr}}
</style>
