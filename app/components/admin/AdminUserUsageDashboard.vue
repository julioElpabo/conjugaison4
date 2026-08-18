<script setup lang="ts">
import type { AnalyticsUsersResponse } from '~~/shared/types/analytics'

defineProps<{
  users: AnalyticsUsersResponse
}>()

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
        <span>Utilisateurs actifs</span>
        <strong>{{ number(users.activeAccounts) }}</strong>
        <small>sur la période sélectionnée</small>
      </article>
      <article>
        <span>Reprise de leurs erreurs</span>
        <strong>{{ number(users.errorReviewUsers) }}</strong>
        <small>utilisateurs distincts sur la période affichée</small>
      </article>
      <article><span>Comptes connectés</span><strong>{{ number(users.loggedInAccounts) }}</strong><small>personnes distinctes sur la période</small></article>
      <article><span>Connexions réussies</span><strong>{{ number(users.successfulLogins) }}</strong><small>ouvertures de session</small></article>
      <article><span>Échecs de connexion</span><strong>{{ number(users.failedLogins) }}</strong><small>tentatives suivies localement</small></article>
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
        title="Évolution du total des comptes"
        eyebrow="Comptes"
        :series="[{ label: 'Total des comptes', color: '#08758b', points: users.accountTotals }]"
        :insight="`Évolution du nombre total de comptes entre le ${new Date(`${users.startDate}T12:00:00`).toLocaleDateString('fr-CH')} et le ${new Date(`${users.endDate}T12:00:00`).toLocaleDateString('fr-CH')}.`"
        :x-unit="users.registrationUnit"
        y-unit="Total des comptes"
      />
    </div>
    <AdminFeatureUsageChart
      :items="users.connectedFeatures"
      :max-items="12"
      eyebrow="Après connexion"
      title="Fonctions propres aux comptes"
      insight="Sessions connectées ayant utilisé l’historique, les bilans, la progression ou la reprise des erreurs."
      center-label="sessions"
    />
    <p class="user-usage__definition">
      <strong>{{ number(users.activeAccounts) }}</strong> utilisateur{{ users.activeAccounts > 1 ? 's' : '' }}
      actif{{ users.activeAccounts > 1 ? 's' : '' }} sur la période sélectionnée.
    </p>
  </div>
</template>

<style scoped>
.user-usage{display:grid;gap:16px}.user-usage__kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.user-usage__kpis article{display:grid;min-height:130px;padding:17px;border:1px solid #c9dce0;border-radius:14px;align-content:start;gap:5px;background:#fff}.user-usage__kpis span{color:#577078;font-size:.73rem;font-weight:800}.user-usage__kpis strong{color:#073f51;font-size:2rem;line-height:1}.user-usage__kpis small{color:#71868c;font-size:.68rem}.user-usage__notice,.user-usage__definition{margin:0;padding:11px 14px;border-radius:9px;color:#526d75;background:#edf5f6;font-size:.72rem;line-height:1.45}.user-usage__charts{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.35fr);gap:12px}.user-usage__charts>:deep(.admin-card){border:1px solid #c9dce0;border-radius:16px;background:#fff}:global(:root[data-theme='dark']) .user-usage__kpis article,:global(:root[data-theme='dark']) .user-usage__charts>:deep(.admin-card){border-color:#3d565e;background:#172a30}:global(:root[data-theme='dark']) .user-usage__kpis strong{color:#dff5f7}:global(:root[data-theme='dark']) .user-usage__kpis span,:global(:root[data-theme='dark']) .user-usage__kpis small{color:#a9c1c7}:global(:root[data-theme='dark']) .user-usage__notice,:global(:root[data-theme='dark']) .user-usage__definition{color:#bdd2d7;background:#20383f}@media(max-width:960px){.user-usage__charts{grid-template-columns:1fr}}@media(max-width:650px){.user-usage__kpis{grid-template-columns:1fr}}
</style>
