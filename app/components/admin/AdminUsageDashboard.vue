<script setup lang="ts">
import type {
  AnalyticsActorFilter,
  AnalyticsUsageDiagnostic,
  AnalyticsUsageResponse,
  AnalyticsUsageRow,
} from '~~/shared/types/analytics'
import {
  challengePresetDefinitions,
  challengePresetGroupLabels,
  challengePresetGroupOrder,
} from '~~/shared/data/challenge-presets'

const props = defineProps<{
  usage: AnalyticsUsageResponse
  actor: AnalyticsActorFilter
}>()
const emit = defineEmits<{ 'update:actor': [value: AnalyticsActorFilter] }>()

const category = ref<'preset' | 'feature'>('preset')
const focus = ref<'all' | AnalyticsUsageDiagnostic>('all')
const activeFeatureArea = ref<'build' | 'exercise' | 'learner' | 'navigation'>('build')
const activePresetGroupId = ref('school')
const activePresetId = ref('5P')
const usageByPreset = computed(() => new Map(props.usage.presets.map(row => [row.key, row])))
const presetGroups = computed(() => challengePresetGroupOrder
  .map(id => ({
    id,
    label: challengePresetGroupLabels[id] || id,
    presets: challengePresetDefinitions
      .filter(preset => preset.group === id)
      .map(preset => ({
        definition: preset,
        usage: usageByPreset.value.get(preset.id),
      })),
  }))
  .filter(group => group.presets.length)
  .map(group => ({
    ...group,
    starts: group.presets.reduce((total, preset) => total + (preset.usage?.starts || 0), 0),
  })))
const activePresetGroup = computed(() => (
  presetGroups.value.find(group => group.id === activePresetGroupId.value)
  || presetGroups.value[0]
))
const activePreset = computed(() => (
  activePresetGroup.value?.presets.find(preset => preset.definition.id === activePresetId.value)
  || activePresetGroup.value?.presets[0]
))
const presetLaunchTotal = computed(() => presetGroups.value.reduce((total, group) => total + group.starts, 0))
const rows = computed(() => {
  const values = category.value === 'preset' ? props.usage.presets : props.usage.features
  return focus.value === 'all' ? values : values.filter(row => row.diagnostic === focus.value)
})
const diagnostics: Array<{ value: 'all' | AnalyticsUsageDiagnostic, label: string }> = [
  { value: 'all', label: 'Tout voir' },
  { value: 'remove-candidate', label: 'À arbitrer' },
  { value: 'improve', label: 'À améliorer' },
  { value: 'promote', label: 'À mieux montrer' },
  { value: 'keep', label: 'À conserver' },
  { value: 'insufficient', label: 'Données insuffisantes' },
]
const diagnosticLabels: Record<AnalyticsUsageDiagnostic, string> = {
  'keep': 'À conserver',
  'improve': 'À améliorer',
  'promote': 'À mieux montrer',
  'niche': 'Usage de niche',
  'remove-candidate': 'À arbitrer',
  'insufficient': 'Données insuffisantes',
}
const diagnosticOrder: Record<AnalyticsUsageDiagnostic, number> = {
  'remove-candidate': 0,
  'improve': 1,
  'promote': 2,
  'niche': 3,
  'keep': 4,
  'insufficient': 5,
}
type FeatureArea = typeof activeFeatureArea.value
type FeatureVisualKind = 'choice' | 'exercise' | 'session' | 'menu'
interface FeatureVisual {
  area: FeatureArea
  kind: FeatureVisualKind
  icon: string
  context: string
  action: string
  detail: string
  completionLabel?: string
}
const featureAreas: Array<{ id: FeatureArea, label: string }> = [
  { id: 'build', label: 'Créer un défi' },
  { id: 'exercise', label: 'Faire un exercice' },
  { id: 'learner', label: 'Espace personnel' },
  { id: 'navigation', label: 'Navigation et compte' },
]
const featureVisuals: Record<string, FeatureVisual> = {
  'preset.library': { area: 'build', kind: 'choice', icon: '★', context: 'Page d’accueil', action: 'Découvrir les défis', detail: 'Choisir un défi prêt à l’emploi' },
  'builder.custom': { area: 'build', kind: 'choice', icon: '✎', context: 'Page d’accueil', action: 'Construire un nouveau défi →', detail: 'Choisir les verbes, les temps et les options' },
  'challenge.load': { area: 'build', kind: 'choice', icon: '↓', context: 'Tu as reçu un défi ?', action: 'Charger', detail: 'Saisir le code du défi' },
  'challenge.share': { area: 'build', kind: 'choice', icon: '↗', context: 'Ton défi est prêt', action: 'Enregistrer et partager', detail: 'Créer un code et un lien de partage', completionLabel: 'Partages' },
  'exercise.classic': { area: 'exercise', kind: 'exercise', icon: '✓', context: 'Choisir une façon de s’exercer', action: 'Mode classique', detail: 'Questionnaire avec réponse à saisir' },
  'exercise.chat': { area: 'exercise', kind: 'exercise', icon: '●', context: 'Choisir une façon de s’exercer', action: 'Mode chat', detail: 'Exercice accompagné par un coach' },
  'print.preview': { area: 'exercise', kind: 'exercise', icon: '▤', context: 'Imprimer le défi', action: 'Préparer la fiche', detail: 'Aperçu avant impression' },
  'download.pdf': { area: 'exercise', kind: 'exercise', icon: 'PDF', context: 'Télécharger la fiche', action: 'Document PDF', detail: 'Fiche imprimable avec son corrigé', completionLabel: 'Téléchargements' },
  'download.word': { area: 'exercise', kind: 'exercise', icon: 'W', context: 'Télécharger la fiche', action: 'Document Word', detail: 'Fiche modifiable avec son corrigé', completionLabel: 'Téléchargements' },
  'learner.history': { area: 'learner', kind: 'session', icon: '◷', context: 'Ma progression', action: 'Dernières séances', detail: 'Consulter son historique' },
  'learner.summary': { area: 'learner', kind: 'session', icon: '▤', context: 'Exercices terminés', action: 'Consulter le bilan', detail: 'Voir les erreurs, puis les réussites' },
  'learner.finish': { area: 'learner', kind: 'session', icon: '▶', context: 'Séance inachevée', action: 'Terminer la séance', detail: 'Reprendre à la prochaine question' },
  'learner.relaunch.same': { area: 'learner', kind: 'session', icon: '☷', context: 'Relancer le même défi', action: 'Même ordre', detail: 'Recommencer toutes les questions' },
  'learner.relaunch.random': { area: 'learner', kind: 'session', icon: '↝', context: 'Relancer le même défi', action: 'Au hasard', detail: 'Recommencer dans un ordre différent' },
  'learner.errors.session': { area: 'learner', kind: 'session', icon: '▤', context: 'Reprendre uniquement les erreurs faites', action: 'Dans cette séance', detail: 'Retravailler les erreurs de la séance' },
  'learner.errors.challenge': { area: 'learner', kind: 'session', icon: '▥', context: 'Reprendre uniquement les erreurs faites', action: 'Dans tout le défi', detail: 'Retravailler toutes les erreurs du défi' },
  'learner.errors.targeted': { area: 'learner', kind: 'session', icon: '◎', context: 'Comprendre mes erreurs', action: 'Lancer un défi ciblé', detail: 'Créer dix questions sur un type d’erreur' },
  'learner.progress': { area: 'learner', kind: 'session', icon: '✦', context: 'Menu utilisateur', action: 'Comprendre mes erreurs', detail: 'Analyser les types d’erreurs fréquents' },
  'consult.verb': { area: 'navigation', kind: 'menu', icon: 'C', context: 'Navigation principale', action: 'Consulter', detail: 'Chercher et consulter la conjugaison d’un verbe' },
  'learn.content': { area: 'navigation', kind: 'menu', icon: 'A', context: 'Navigation principale', action: 'Apprendre', detail: 'Lire les contenus pédagogiques' },
  'language.change': { area: 'navigation', kind: 'menu', icon: '文', context: 'Menu utilisateur', action: 'Changer de langue', detail: 'Modifier la langue de l’interface' },
  'theme.change': { area: 'navigation', kind: 'menu', icon: '◐', context: 'Menu utilisateur', action: 'Changer l’apparence', detail: 'Passer du thème clair au thème sombre' },
  'auth.register': { area: 'navigation', kind: 'menu', icon: '+', context: 'Connexion', action: 'Créer un compte', detail: 'Créer un espace personnel', completionLabel: 'Comptes créés' },
  'auth.login': { area: 'navigation', kind: 'menu', icon: '→', context: 'Connexion', action: 'Se connecter', detail: 'Ouvrir son espace personnel', completionLabel: 'Connexions' },
}
const sortedRows = computed(() => [...rows.value].sort((left, right) => (
  diagnosticOrder[left.diagnostic] - diagnosticOrder[right.diagnostic]
  || right.exposures - left.exposures
  || right.selections - left.selections
)))
const featureAreaRows = computed(() => sortedRows.value.filter(row => (
  (featureVisuals[row.key]?.area || 'navigation') === activeFeatureArea.value
)))

function featureAreaCount(area: FeatureArea) {
  return rows.value.filter(row => (featureVisuals[row.key]?.area || 'navigation') === area).length
}

function featureVisual(row: AnalyticsUsageRow): FeatureVisual {
  return featureVisuals[row.key] || {
    area: 'navigation',
    kind: 'menu',
    icon: '•',
    context: 'Fonctionnalité du site',
    action: row.label,
    detail: 'Action suivie dans les statistiques',
  }
}

function featureMetrics(row: AnalyticsUsageRow) {
  const visual = featureVisual(row)
  const metrics = [
    { label: 'Affichages', value: row.exposures },
    { label: 'Clics', value: row.selections },
  ]
  if (row.starts || visual.kind === 'exercise' || visual.kind === 'session') {
    metrics.push({ label: 'Lancements', value: row.starts })
  }
  if (row.completions || visual.completionLabel) {
    metrics.push({ label: visual.completionLabel || 'Actions terminées', value: row.completions })
  }
  return metrics
}

function rate(value: number | null) {
  return value === null ? '—' : `${new Intl.NumberFormat('fr-CH', { maximumFractionDigits: 1 }).format(value)} %`
}

function number(value: number) {
  return new Intl.NumberFormat('fr-CH').format(value)
}

function date(value: string | null) {
  return value
    ? new Intl.DateTimeFormat('fr-CH', { dateStyle: 'medium' }).format(new Date(value))
    : 'Jamais'
}

function selectPresetGroup(groupId: string) {
  activePresetGroupId.value = groupId
  activePresetId.value = presetGroups.value.find(group => group.id === groupId)?.presets[0]?.definition.id || ''
}
</script>

<template>
  <div class="usage-dashboard">
    <header class="usage-intro">
      <div>
        <p class="admin-eyebrow">Décisions produit</p>
        <h2>Qu’est-ce qui est vraiment utilisé&nbsp;?</h2>
        <p>Comparez ce qui est affiché, choisi, réellement lancé, terminé et réutilisé.</p>
      </div>
      <div class="actor-filter" role="group" aria-label="Type de visiteur">
        <button
          v-for="option in [
            { value: 'all', label: 'Tous' },
            { value: 'anonymous', label: 'Sans compte' },
            { value: 'learner', label: 'Avec compte' },
          ] as const"
          :key="option.value"
          type="button"
          :class="{ active: actor === option.value }"
          :aria-pressed="actor === option.value"
          @click="emit('update:actor', option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </header>

    <section class="usage-kpis" aria-label="Synthèse des usages">
      <article><span>Sessions exposées</span><strong>{{ number(usage.summary.exposedSessions) }}</strong><small>ont vu au moins une fonction mesurée</small></article>
      <article><span>Sessions actives</span><strong>{{ number(usage.summary.activeFeatureSessions) }}</strong><small>ont choisi ou lancé une fonction</small></article>
      <article class="is-alert"><span>À arbitrer</span><strong>{{ number(usage.summary.removeCandidates) }}</strong><small>candidats à retirer après volume suffisant</small></article>
      <article><span>À observer</span><strong>{{ number(usage.summary.insufficient) }}</strong><small>manquent encore de données fiables</small></article>
    </section>

    <p v-if="usage.notice" class="usage-notice">{{ usage.notice }}</p>

    <section class="usage-table-card">
      <header class="usage-controls">
        <div class="category-tabs" role="tablist" aria-label="Famille analysée">
          <button type="button" role="tab" :aria-selected="category === 'preset'" :class="{ active: category === 'preset' }" @click="category = 'preset'">
            Défis tout faits <span>{{ usage.presets.length }}</span>
          </button>
          <button type="button" role="tab" :aria-selected="category === 'feature'" :class="{ active: category === 'feature' }" @click="category = 'feature'">
            Fonctionnalités <span>{{ usage.features.length }}</span>
          </button>
        </div>
        <label v-if="category === 'feature'">
          <span>Afficher</span>
          <select v-model="focus">
            <option v-for="option in diagnostics" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>
      </header>

      <div v-if="category === 'feature'" class="usage-legend">
        <span><strong>Adoption</strong> = choix ÷ affichages</span>
        <span><strong>Complétion</strong> = fins ÷ lancements ou choix</span>
        <span><strong>Réutilisation</strong> = sessions ayant choisi plusieurs fois</span>
      </div>

      <div v-if="category === 'preset'" class="preset-usage">
        <header class="preset-usage__heading">
          <span class="preset-usage__star" aria-hidden="true">★</span>
          <div>
            <h3>Défis tout faits</h3>
            <p>La pastille indique le nombre de fois où le défi a été lancé sur la période.</p>
          </div>
          <span class="preset-usage__total"><strong>{{ number(presetLaunchTotal) }}</strong> lancements</span>
        </header>

        <div class="preset-usage__browser">
          <section class="preset-usage__column" aria-labelledby="usage-preset-categories">
            <h4 id="usage-preset-categories">Catégories</h4>
            <div class="preset-usage__list">
              <button
                v-for="group in presetGroups"
                :key="group.id"
                type="button"
                :class="{ active: activePresetGroup?.id === group.id }"
                :aria-pressed="activePresetGroup?.id === group.id"
                @click="selectPresetGroup(group.id)"
              >
                <span>{{ group.label }}</span>
                <span class="preset-usage__count" :class="{ 'is-zero': !group.starts }">{{ number(group.starts) }}</span>
                <span class="preset-usage__chevron" aria-hidden="true">›</span>
              </button>
            </div>
          </section>

          <section v-if="activePresetGroup" class="preset-usage__column" :aria-labelledby="`usage-preset-group-${activePresetGroup.id}`">
            <h4 :id="`usage-preset-group-${activePresetGroup.id}`">{{ activePresetGroup.label }}</h4>
            <div class="preset-usage__list">
              <button
                v-for="preset in activePresetGroup.presets"
                :key="preset.definition.id"
                type="button"
                :class="{ active: activePreset?.definition.id === preset.definition.id }"
                :aria-pressed="activePreset?.definition.id === preset.definition.id"
                @click="activePresetId = preset.definition.id"
              >
                <span><strong>{{ preset.definition.label }}</strong></span>
                <span class="preset-usage__count" :class="{ 'is-zero': !preset.usage?.starts }">{{ number(preset.usage?.starts || 0) }}</span>
                <span class="preset-usage__chevron" aria-hidden="true">›</span>
              </button>
            </div>
          </section>

          <section v-if="activePreset" class="preset-usage__column preset-usage__column--details" :aria-labelledby="`usage-preset-details-${activePreset.definition.id}`">
            <h4 :id="`usage-preset-details-${activePreset.definition.id}`">{{ activePreset.definition.label }}</h4>
            <p class="preset-usage__description">{{ activePreset.definition.description }}</p>
            <dl class="preset-usage__metrics">
              <div>
                <dt>Lancé</dt>
                <dd>{{ number(activePreset.usage?.starts || 0) }}</dd>
              </div>
              <div>
                <dt>Terminé</dt>
                <dd>{{ number(activePreset.usage?.completions || 0) }}</dd>
              </div>
              <div>
                <dt>Choisi</dt>
                <dd>{{ number(activePreset.usage?.selections || 0) }}</dd>
              </div>
              <div>
                <dt>Sessions distinctes</dt>
                <dd>{{ number(activePreset.usage?.uniqueSessions || 0) }}</dd>
              </div>
            </dl>
            <footer>
              <span>{{ activePreset.definition.questionCount }} questions</span>
              <small v-if="activePreset.usage?.lastUsedAt">Dernier usage&nbsp;: {{ date(activePreset.usage.lastUsedAt) }}</small>
              <small v-else>Jamais lancé sur la période</small>
            </footer>
          </section>
        </div>
      </div>

      <div v-else-if="sortedRows.length" class="feature-catalogue">
        <nav class="feature-area-tabs" aria-label="Parties du site">
          <button
            v-for="area in featureAreas"
            :key="area.id"
            type="button"
            :class="{ active: activeFeatureArea === area.id }"
            :aria-pressed="activeFeatureArea === area.id"
            @click="activeFeatureArea = area.id"
          >
            {{ area.label }}
            <span>{{ featureAreaCount(area.id) }}</span>
          </button>
        </nav>

        <div v-if="featureAreaRows.length" class="feature-cards">
          <article v-for="row in featureAreaRows" :key="row.key" class="feature-card">
            <div class="feature-card__preview" :class="`feature-card__preview--${featureVisual(row).kind}`">
              <small>{{ featureVisual(row).context }}</small>
              <div class="feature-card__site-element">
                <span class="feature-card__icon" aria-hidden="true">{{ featureVisual(row).icon }}</span>
                <div>
                  <strong>{{ featureVisual(row).action }}</strong>
                  <span>{{ featureVisual(row).detail }}</span>
                </div>
                <span v-if="featureVisual(row).kind === 'menu'" class="feature-card__arrow" aria-hidden="true">›</span>
              </div>
            </div>

            <div class="feature-card__body">
              <header>
                <div>
                  <h3>{{ row.label }}</h3>
                  <small>Dernier usage&nbsp;: {{ date(row.lastUsedAt) }}</small>
                </div>
                <span class="diagnostic" :class="`diagnostic--${row.diagnostic}`">{{ diagnosticLabels[row.diagnostic] }}</span>
              </header>

              <dl class="feature-card__metrics">
                <div v-for="metric in featureMetrics(row)" :key="metric.label">
                  <dt>{{ metric.label }}</dt>
                  <dd>{{ number(metric.value) }}</dd>
                </div>
              </dl>

              <div class="feature-card__rates">
                <span><small>Adoption</small><strong>{{ rate(row.adoptionRate) }}</strong></span>
                <span><small>Complétion</small><strong>{{ rate(row.completionRate) }}</strong></span>
                <span><small>Réutilisation</small><strong>{{ rate(row.repeatRate) }}</strong></span>
              </div>

              <p>{{ row.diagnosticReason }}</p>
            </div>
          </article>
        </div>
        <p v-else class="usage-empty">Aucune fonctionnalité de cette partie ne correspond au filtre.</p>
      </div>
      <p v-else class="usage-empty">Aucun élément ne correspond à ce filtre.</p>
    </section>
  </div>
</template>

<style scoped>
.usage-dashboard{display:grid;gap:18px}.usage-intro{display:flex;padding:22px 24px;align-items:center;justify-content:space-between;gap:24px;border-radius:18px;color:#fff;background:linear-gradient(128deg,#083f52,#08758b 62%,#248fa2);box-shadow:0 14px 30px rgb(8 63 82 / 18%)}.usage-intro h2{margin:3px 0 5px;font-size:clamp(1.45rem,3vw,2.15rem);letter-spacing:-.035em}.usage-intro p{max-width:680px;margin:0;color:#d5eef2}.usage-intro .admin-eyebrow{color:#8be0df}.actor-filter{display:flex;flex:0 0 auto;padding:4px;border:1px solid rgb(255 255 255 / 28%);border-radius:12px;background:rgb(1 42 55 / 28%)}.actor-filter button{min-height:38px;padding:7px 12px;border:0;border-radius:8px;color:#d5eef2;background:transparent;font:inherit;font-size:.76rem;font-weight:850;cursor:pointer}.actor-filter button.active{color:#07566a;background:#fff;box-shadow:0 3px 10px rgb(0 35 45 / 18%)}.usage-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.usage-kpis article{display:grid;padding:16px 17px;border:1px solid #c9dce0;border-radius:14px;gap:3px;background:#fff}.usage-kpis span{color:#577078;font-size:.73rem;font-weight:800}.usage-kpis strong{color:#073f51;font-size:1.7rem;line-height:1}.usage-kpis small{color:#71868c;font-size:.66rem;line-height:1.35}.usage-kpis .is-alert{border-color:#e3b5aa;background:#fff8f5}.usage-kpis .is-alert strong{color:#a64838}.usage-notice{margin:0;padding:11px 14px;border-left:4px solid #d19c38;border-radius:8px;color:#684c17;background:#fff7e6;font-size:.76rem;line-height:1.45}.usage-table-card{min-width:0;overflow:hidden;border:1px solid #c9dce0;border-radius:18px;background:#fff}.usage-controls{display:flex;padding:15px 17px;align-items:end;justify-content:space-between;gap:16px;border-bottom:1px solid #dbe7e9}.category-tabs{display:flex;gap:6px}.category-tabs button{padding:10px 13px;border:1px solid #c3d7db;border-radius:10px;color:#49636c;background:#f4f9fa;font:inherit;font-size:.78rem;font-weight:850;cursor:pointer}.category-tabs button.active{color:#fff;border-color:#08758b;background:#08758b}.category-tabs span{display:inline-grid;min-width:21px;height:21px;margin-left:5px;place-items:center;border-radius:99px;color:inherit;background:rgb(255 255 255 / 18%);font-size:.65rem}.usage-controls label{display:grid;gap:4px;color:#667d84;font-size:.68rem;font-weight:800}.usage-controls select{min-width:180px;padding:9px 31px 9px 10px;border:1px solid #bdd2d7;border-radius:9px;color:#143f4c;background:#fff;font:inherit;font-size:.76rem}.usage-legend{display:flex;padding:9px 17px;flex-wrap:wrap;gap:8px 20px;color:#6a7e84;background:#f5f9fa;font-size:.67rem}.usage-table-wrap{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:.73rem}th,td{padding:13px 11px;border-top:1px solid #e2ebed;text-align:right;vertical-align:top;white-space:nowrap}thead th{color:#5f767e;background:#fbfdfd;font-size:.63rem;text-transform:uppercase;letter-spacing:.04em}thead th:first-child,tbody th{text-align:left}tbody th{width:32%;min-width:270px;white-space:normal}tbody th>strong{display:block;margin:5px 0 3px;color:#113f4e;font-size:.82rem}tbody th>small{display:block;color:#71848a;font-weight:500;line-height:1.4}td{color:#435e66}td>strong{color:#0a6075}td>small{display:block;color:#819399}.diagnostic{display:inline-flex;padding:3px 7px;border-radius:99px;color:#3b646c;background:#e8f1f2;font-size:.58rem;font-weight:900;text-transform:uppercase;letter-spacing:.035em}.diagnostic--remove-candidate{color:#9a3528;background:#fbe5df}.diagnostic--improve{color:#8b5614;background:#fff0d5}.diagnostic--promote{color:#5b488a;background:#eee9f8}.diagnostic--keep{color:#187149;background:#dcf4e7}.diagnostic--niche{color:#28678f;background:#e1f0fa}.usage-empty{padding:45px 20px;color:#70858b;text-align:center}
:global(:root[data-theme='dark']) .usage-kpis article,:global(:root[data-theme='dark']) .usage-table-card{border-color:#3d565e;background:#172a30}:global(:root[data-theme='dark']) .usage-kpis span,:global(:root[data-theme='dark']) .usage-kpis small,:global(:root[data-theme='dark']) tbody th>small,:global(:root[data-theme='dark']) td{color:#a9c1c7}:global(:root[data-theme='dark']) .usage-kpis strong,:global(:root[data-theme='dark']) tbody th>strong{color:#dff5f7}:global(:root[data-theme='dark']) thead th,:global(:root[data-theme='dark']) .usage-legend{color:#aac2c8;background:#1c3238}:global(:root[data-theme='dark']) th,:global(:root[data-theme='dark']) td,:global(:root[data-theme='dark']) .usage-controls{border-color:#334b52}:global(:root[data-theme='dark']) .category-tabs button,:global(:root[data-theme='dark']) .usage-controls select{color:#d9eff2;border-color:#48636b;background:#20383f}
.feature-catalogue{display:grid}.feature-area-tabs{display:grid;padding:12px 16px;border-bottom:1px solid #dbe7e9;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;background:#f7fafb}.feature-area-tabs button{display:flex;min-height:43px;padding:8px 11px;align-items:center;justify-content:space-between;gap:8px;border:1px solid #c7dadd;border-radius:10px;color:#456069;background:#fff;font:inherit;font-size:.73rem;font-weight:850;text-align:left;cursor:pointer}.feature-area-tabs button:hover{border-color:#82b7c0}.feature-area-tabs button.active{color:#fff;border-color:#08758b;background:#08758b;box-shadow:0 5px 12px rgb(8 117 139 / 16%)}.feature-area-tabs button span{display:grid;min-width:23px;height:23px;padding:0 6px;place-items:center;border-radius:999px;color:#07566a;background:#e5f1f2;font-size:.65rem}.feature-area-tabs button.active span{background:#fff}.feature-cards{display:grid;padding:16px;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;background:#f4f8f9}.feature-card{min-width:0;overflow:hidden;border:1px solid #c8dadd;border-radius:16px;background:#fff;box-shadow:0 5px 15px rgb(13 63 75 / 5%)}.feature-card__preview{min-height:132px;padding:14px 15px;background:#edf6f7}.feature-card__preview>small{display:block;margin-bottom:10px;color:#637b82;font-size:.63rem;font-weight:900;letter-spacing:.055em;text-transform:uppercase}.feature-card__site-element{display:flex;min-height:78px;padding:13px;align-items:center;gap:12px;border:1px solid #9bc2c8;border-radius:14px;color:#07566a;background:#fff;box-shadow:0 5px 13px rgb(8 95 112 / 8%)}.feature-card__site-element>div{display:grid;min-width:0;gap:3px}.feature-card__site-element strong{font-size:.92rem;line-height:1.18}.feature-card__site-element div span{color:#657a80;font-size:.68rem;line-height:1.32}.feature-card__icon{display:grid;width:43px;height:43px;flex:0 0 43px;place-items:center;border-radius:12px;color:#fff;background:#08758b;font-size:.94rem;font-weight:900}.feature-card__arrow{margin-left:auto;color:#08758b;font-size:1.5rem}.feature-card__preview--choice{background:#edf7f5}.feature-card__preview--choice .feature-card__site-element{border-color:#a8ccc3}.feature-card__preview--choice .feature-card__icon{background:#315f56}.feature-card__preview--exercise{background:#edf6fa}.feature-card__preview--exercise .feature-card__site-element{border-color:#a9cbd8}.feature-card__preview--exercise .feature-card__icon{background:#176f89}.feature-card__preview--session{background:#f2eff8}.feature-card__preview--session .feature-card__site-element{color:#5d3b8f;border-color:#bdb0d8;background:#faf8fd}.feature-card__preview--session .feature-card__icon{background:#7351a6}.feature-card__preview--menu{background:#f1f5f5}.feature-card__preview--menu .feature-card__site-element{min-height:60px;border-color:#cbd9db;border-radius:9px;box-shadow:none}.feature-card__preview--menu .feature-card__icon{width:35px;height:35px;flex-basis:35px;border-radius:50%;background:#315f56}.feature-card__body{display:grid;padding:15px;gap:13px}.feature-card__body>header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.feature-card__body h3{margin:0;color:#123f4c;font-size:.94rem}.feature-card__body header small{display:block;margin-top:3px;color:#7b8e93;font-size:.62rem}.feature-card__metrics{display:grid;margin:0;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.feature-card__metrics div{display:grid;padding:8px;border-radius:9px;gap:2px;background:#f1f6f7}.feature-card__metrics dt{color:#72868c;font-size:.58rem;font-weight:800}.feature-card__metrics dd{margin:0;color:#07566a;font-size:1rem;font-weight:900}.feature-card__rates{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));overflow:hidden;border:1px solid #d8e4e6;border-radius:9px}.feature-card__rates span{display:grid;padding:7px 9px;border-right:1px solid #d8e4e6;gap:1px}.feature-card__rates span:last-child{border-right:0}.feature-card__rates small{color:#798c91;font-size:.57rem}.feature-card__rates strong{color:#365c65;font-size:.72rem}.feature-card__body>p{margin:0;padding-top:10px;border-top:1px solid #e1eaec;color:#687e84;font-size:.67rem;line-height:1.42}.feature-card .diagnostic{flex:0 0 auto}
:global(:root[data-theme='dark']) .feature-area-tabs,:global(:root[data-theme='dark']) .feature-cards{border-color:#334b52;background:#13262c}:global(:root[data-theme='dark']) .feature-area-tabs button{color:#d9eff2;border-color:#48636b;background:#20383f}:global(:root[data-theme='dark']) .feature-area-tabs button.active{border-color:#1590a8;background:#08758b}:global(:root[data-theme='dark']) .feature-card{border-color:#3d565e;background:#172a30}:global(:root[data-theme='dark']) .feature-card__preview{background:#1c3238}:global(:root[data-theme='dark']) .feature-card__site-element{color:#dff5f7;border-color:#49656d;background:#20383f}:global(:root[data-theme='dark']) .feature-card__site-element div span,:global(:root[data-theme='dark']) .feature-card__preview>small,:global(:root[data-theme='dark']) .feature-card__body header small,:global(:root[data-theme='dark']) .feature-card__body>p{color:#a9c1c7}:global(:root[data-theme='dark']) .feature-card__body h3{color:#dff5f7}:global(:root[data-theme='dark']) .feature-card__metrics div{background:#20383f}:global(:root[data-theme='dark']) .feature-card__metrics dt,:global(:root[data-theme='dark']) .feature-card__rates small{color:#a9c1c7}:global(:root[data-theme='dark']) .feature-card__metrics dd{color:#8ed6df}:global(:root[data-theme='dark']) .feature-card__rates{border-color:#3d565e}:global(:root[data-theme='dark']) .feature-card__rates span{border-color:#3d565e}:global(:root[data-theme='dark']) .feature-card__rates strong{color:#c8dfe3}:global(:root[data-theme='dark']) .feature-card__body>p{border-color:#3d565e}
.preset-usage{display:grid;padding:20px;gap:16px}.preset-usage__heading{display:flex;align-items:center;gap:14px}.preset-usage__heading h3{margin:0;color:#073f51;font-size:1.15rem}.preset-usage__heading p{margin:3px 0 0;color:#6d8187;font-size:.72rem}.preset-usage__star{display:grid;width:48px;height:48px;flex:0 0 48px;place-items:center;border-radius:14px;color:#fff;background:#08758b;font-size:1.55rem}.preset-usage__total{display:flex;margin-left:auto;padding:7px 11px;align-items:baseline;gap:5px;border:1px solid #b9d2d5;border-radius:999px;color:#5b747b;background:#eff6f6;font-size:.65rem;font-weight:800}.preset-usage__total strong{color:#07566a;font-size:.9rem}.preset-usage__browser{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));overflow:hidden;border:1px solid #c6d9dd;border-radius:16px;background:#fff}.preset-usage__column{display:grid;min-width:0;min-height:330px;padding:14px;align-content:start;border-right:1px solid #cfdfe2;background:#fbfdfd}.preset-usage__column:last-child{border-right:0}.preset-usage__column h4{margin:0;padding:5px 9px 12px;color:#687982;font-size:.72rem;font-weight:900;letter-spacing:.07em;text-transform:uppercase}.preset-usage__list{display:grid;align-content:start;gap:5px}.preset-usage__list button{display:grid;width:100%;min-height:48px;padding:8px 9px 8px 13px;align-items:center;border:1px solid transparent;border-radius:11px;grid-template-columns:minmax(0,1fr) auto auto;gap:8px;color:#20394b;background:transparent;font:inherit;font-size:.82rem;text-align:left;cursor:pointer}.preset-usage__list button strong{font-size:.86rem}.preset-usage__list button:hover{border-color:#b7d1d5;background:#edf6f7}.preset-usage__list button.active{color:#fff;border-color:#08758b;background:#08758b;box-shadow:0 6px 14px rgb(8 117 139 / 18%)}.preset-usage__chevron{color:#08758b;font-size:1.35rem;line-height:1}.preset-usage__list button.active .preset-usage__chevron{color:#fff}.preset-usage__count{display:grid;min-width:34px;height:27px;padding:0 8px;place-items:center;border:1px solid #a9c9ce;border-radius:999px;color:#07566a;background:#e5f1f2;font-size:.7rem;font-weight:900}.preset-usage__list button.active .preset-usage__count{color:#07566a;border-color:#fff;background:#fff}.preset-usage__count.is-zero{color:#7b8d91;border-color:#d3dfe1;background:#f0f4f4}.preset-usage__description{margin:1px 9px 15px;color:#657a80;font-size:.74rem;line-height:1.45}.preset-usage__metrics{display:grid;margin:0;gap:5px}.preset-usage__metrics div{display:flex;min-height:46px;padding:8px 10px;align-items:center;justify-content:space-between;gap:12px;border-radius:10px;color:#173c49;background:#f1f7f8}.preset-usage__metrics dt{font-size:.76rem;font-weight:800}.preset-usage__metrics dd{display:grid;min-width:38px;height:28px;margin:0;padding:0 9px;place-items:center;border:1px solid #a9c9ce;border-radius:999px;color:#07566a;background:#fff;font-size:.75rem;font-weight:900}.preset-usage__column footer{display:grid;margin-top:18px;padding:13px 9px 0;gap:4px;border-top:1px solid #dbe6e8}.preset-usage__column footer span{color:#345760;font-size:.71rem;font-weight:850}.preset-usage__column footer small{color:#7a8d92;font-size:.65rem}
:global(:root[data-theme='dark']) .preset-usage__heading h3{color:#dff5f7}:global(:root[data-theme='dark']) .preset-usage__heading p{color:#a9c1c7}:global(:root[data-theme='dark']) .preset-usage__total{color:#b8cdd1;border-color:#476169;background:#20383f}:global(:root[data-theme='dark']) .preset-usage__total strong{color:#8ed6df}:global(:root[data-theme='dark']) .preset-usage__browser{border-color:#3d565e;background:#172a30}:global(:root[data-theme='dark']) .preset-usage__column{border-color:#3d565e;background:#172a30}:global(:root[data-theme='dark']) .preset-usage__column h4,:global(:root[data-theme='dark']) .preset-usage__description,:global(:root[data-theme='dark']) .preset-usage__column footer small{color:#a9c1c7}:global(:root[data-theme='dark']) .preset-usage__list button{color:#dff5f7}:global(:root[data-theme='dark']) .preset-usage__list button:hover{border-color:#49656d;background:#20383f}:global(:root[data-theme='dark']) .preset-usage__metrics div{color:#dff5f7;background:#20383f}:global(:root[data-theme='dark']) .preset-usage__column footer{border-color:#3d565e}:global(:root[data-theme='dark']) .preset-usage__column footer span{color:#c3dadd}
@media(max-width:1050px){.usage-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.usage-intro{align-items:stretch;flex-direction:column}.actor-filter{align-self:start}.feature-area-tabs{grid-template-columns:repeat(2,minmax(0,1fr))}.feature-card__metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.preset-usage__browser{grid-template-columns:minmax(220px,.8fr) minmax(220px,.9fr) minmax(250px,1fr);overflow-x:auto}}
@media(max-width:760px){.feature-cards{grid-template-columns:1fr}}
@media(max-width:650px){.usage-kpis{grid-template-columns:1fr 1fr}.usage-controls{align-items:stretch;flex-direction:column}.category-tabs{display:grid;grid-template-columns:1fr 1fr}.usage-controls select{width:100%}.feature-area-tabs{padding:10px;grid-template-columns:1fr 1fr}.feature-area-tabs button{padding-inline:8px}.feature-cards{padding:10px}.feature-card__rates{grid-template-columns:1fr}.feature-card__rates span{border-right:0;border-bottom:1px solid #d8e4e6}.feature-card__rates span:last-child{border-bottom:0}.preset-usage{padding:13px}.preset-usage__heading{align-items:flex-start;flex-wrap:wrap}.preset-usage__heading>div{min-width:calc(100% - 66px)}.preset-usage__total{margin-left:62px}.preset-usage__browser{width:100%;grid-template-columns:repeat(3,minmax(245px,78vw));overflow-x:auto}.preset-usage__column{min-height:300px}.usage-table-wrap{overflow:visible}table,tbody{display:grid}thead{display:none}tbody{gap:10px;padding:10px}tr{display:grid;padding:14px;border:1px solid #d7e4e6;border-radius:12px;grid-template-columns:1fr 1fr;background:#fff}tbody th{grid-column:1/-1;width:auto;min-width:0;padding:0 0 10px}td{display:flex;padding:7px 0;justify-content:space-between;gap:8px;border:0;text-align:right;white-space:normal}td::before{color:#778b91;content:attr(data-label);font-weight:700}.usage-intro{padding:19px}.actor-filter{width:100%}.actor-filter button{flex:1;padding-inline:6px}:global(:root[data-theme='dark']) tr{border-color:#3d565e;background:#172a30}:global(:root[data-theme='dark']) .feature-card__rates span{border-color:#3d565e}}
</style>
