<script setup lang="ts">
import type { AnalyticsFunnelStage, AnalyticsProductItem, AnalyticsProductResponse } from '~~/shared/types/analytics'
import AdminFeatureUsageChart from './AdminFeatureUsageChart.vue'

type ProductView = 'challenges' | 'exercises' | 'print' | 'accessibility'
const props = defineProps<{ product: AnalyticsProductResponse, view: ProductView }>()

const number = (value: number) => new Intl.NumberFormat('fr-CH').format(value)
const dimension = (key: string) => props.product.dimensions[key] || []
const funnel = (key: string) => props.product.funnels[key] || []
const printOptionLabels: Record<string, string> = {
  inclusiveDisplay: 'Affichage inclusif', showGrade: 'Niveau / classe', showVerbs: 'Liste des verbes',
  showTenses: 'Liste des temps', showFirstName: 'Prénom', showLastName: 'Nom', showDate: 'Date',
  showRandomNumber: 'Code du défi',
}

function relabel(items: AnalyticsProductItem[], labels: Record<string, string>) {
  return items.map(item => ({ ...item, label: labels[item.key] || item.label }))
}

const title = computed(() => ({
  challenges: 'Défis et options', exercises: 'Exercices et chat', print: 'Impression',
  accessibility: 'Accessibilité et visite',
}[props.view]))
const sections = computed(() => {
  if (props.view === 'challenges') return [
    { title: 'Origine des défis', eyebrow: 'Parcours', key: 'challengeSources', insight: 'Défis tout faits, chargés avec un code ou personnalisés.' },
    { title: 'Type de question', eyebrow: 'Pédagogie', key: 'exerciseKinds', insight: 'Répartition des exercices réellement commencés.' },
    { title: 'Voix active et passive', eyebrow: 'Options', key: 'voices', insight: 'Options présentes au lancement, et non simples clics.' },
    { title: 'COD et COI', eyebrow: 'Options', key: 'complements', insight: 'Combinaisons de compléments dans les exercices lancés.' },
  ]
  if (props.view === 'exercises') return [
    { title: 'Classique ou chat', eyebrow: 'Présentation', key: 'presentations', insight: 'Sessions ayant réellement commencé chaque présentation.' },
    { title: 'Types d’exercice', eyebrow: 'Pédagogie', key: 'exerciseKinds', insight: 'Conjugaison, mode ou mode et temps.' },
    { title: 'Outils du chat', eyebrow: 'Chat', key: 'chatTools', insight: 'Personnes ayant réellement parcouru l’aide latérale ou consulté une conjugaison.' },
    { title: 'Types de coach', eyebrow: 'Chat', key: 'coachTypes', insight: 'Classement des approches de coach par sessions ayant lancé un exercice.' },
  ]
  if (props.view === 'print') return [
    { title: 'PDF ou Word', eyebrow: 'Format', key: 'printFormats', insight: 'Téléchargements aboutis, distincts des aperçus ouverts.' },
    { title: 'Origine de l’impression', eyebrow: 'Parcours', key: 'printSources', insight: 'Origine fonctionnelle des documents produits.' },
    { title: 'Options activées', eyebrow: 'Mise en page', key: 'printOptions', insight: 'Nombre de documents téléchargés avec chaque option.' },
  ]
  return [
    { title: 'Langues réellement utilisées', eyebrow: 'Traduction', key: 'languages', insight: 'Une action significative a été réalisée dans la langue.' },
    { title: 'Mode FALC observé', eyebrow: 'Accessibilité', key: 'falc', insight: 'État du mode pendant un exercice commencé.' },
    { title: 'Mode clair ou sombre', eyebrow: 'Apparence', key: 'observedThemes', insight: 'Thème observé lors d’une action significative.' },
    { title: 'Format de visite', eyebrow: 'Visite guidée', key: 'tourFormats', insight: 'Démarrages des visites rapides et complètes.' },
  ]
})
const selectedFunnel = computed<AnalyticsFunnelStage[]>(() => (
  props.view === 'challenges' ? funnel('customChallenge')
    : props.view === 'exercises' ? funnel('exercise')
      : props.view === 'print' ? funnel('print') : funnel('tour')
))
const selectedFunnelTitle = computed(() => ({
  challenges: 'Création d’un défi personnalisé', exercises: 'Continuité des exercices',
  print: 'De l’aperçu au téléchargement', accessibility: 'Achèvement de la visite guidée',
}[props.view]))
const maximumFunnel = computed(() => Math.max(1, ...selectedFunnel.value.map(item => item.value)))
const coaches = computed(() => dimension('coaches'))
</script>

<template>
  <div class="product-dashboard">
    <header class="product-dashboard__hero">
      <div><p class="admin-eyebrow">Analyse produit</p><h2>{{ title }}</h2></div>
      <span>Événements locaux · sessions uniques</span>
    </header>

    <p v-if="product.notice" class="admin-notice">{{ product.notice }}</p>

    <section class="product-funnel admin-card">
      <header><div><p class="admin-eyebrow">Entonnoir</p><h3>{{ selectedFunnelTitle }}</h3></div></header>
      <ol>
        <li v-for="stage in selectedFunnel" :key="stage.key">
          <span><b>{{ stage.label }}</b><strong>{{ number(stage.value) }}</strong></span>
          <i><b :style="{ width: `${stage.value / maximumFunnel * 100}%` }" /></i>
        </li>
      </ol>
    </section>

    <div class="product-dashboard__grid">
      <AdminFeatureUsageChart
        v-for="section in sections"
        :key="section.key"
        :items="(section.key === 'printOptions' ? relabel(dimension(section.key), printOptionLabels) : dimension(section.key)).map(item => ({ label: item.label, value: item.uniqueSessions }))"
        :title="section.title"
        :eyebrow="section.eyebrow"
        :insight="section.insight"
        center-label="sessions"
        :max-items="10"
      />
    </div>

    <section v-if="view === 'exercises'" class="product-ranking admin-card">
      <header><div><p class="admin-eyebrow">Chat</p><h3>Coachs les plus utilisés</h3></div><small>Tri par sessions ayant lancé un exercice</small></header>
      <div class="product-ranking__head"><span>Coach</span><span>Sessions</span><span>Lancements</span></div>
      <ol v-if="coaches.length">
        <li v-for="coach in coaches" :key="coach.key"><strong>{{ coach.label }}</strong><span>{{ number(coach.uniqueSessions) }}</span><span>{{ number(coach.events) }}</span></li>
      </ol>
      <p v-else>Aucun exercice chat avec un coach sur cette période.</p>
    </section>
  </div>
</template>

<style scoped>
.product-dashboard{display:grid;gap:15px}.product-dashboard__hero{display:flex;padding:20px 22px;align-items:center;justify-content:space-between;gap:18px;color:#fff;border-radius:17px;background:linear-gradient(125deg,#073f51,#08758b)}.product-dashboard__hero h2{margin:3px 0 0;font-size:1.65rem}.product-dashboard__hero .admin-eyebrow{color:#91e2e4}.product-dashboard__hero>span{padding:6px 10px;border:1px solid rgb(255 255 255 / 28%);border-radius:99px;font-size:.7rem}.product-dashboard__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.product-dashboard__grid>:deep(.admin-card),.product-funnel,.product-ranking{border:1px solid #c9dce0;border-radius:15px;background:#fff}.product-funnel{display:grid;padding:18px;gap:13px;box-shadow:none}.product-funnel h3,.product-ranking h3{margin:2px 0 0;color:#073f51}.product-funnel ol{display:grid;margin:0;padding:0;gap:9px;list-style:none}.product-funnel li{display:grid;gap:4px}.product-funnel li>span{display:flex;justify-content:space-between;color:#456069;font-size:.75rem}.product-funnel li>span strong{color:#073f51}.product-funnel li>i{display:block;height:9px;overflow:hidden;border-radius:99px;background:#e4edef}.product-funnel li>i>b{display:block;height:100%;min-width:2px;border-radius:inherit;background:linear-gradient(90deg,#08758b,#2ba582)}.product-ranking{padding:18px;box-shadow:none}.product-ranking header{display:flex;align-items:end;justify-content:space-between;gap:15px}.product-ranking header small,.product-ranking>p{color:#71868c}.product-ranking__head,.product-ranking li{display:grid;padding:9px 10px;grid-template-columns:minmax(0,1fr) 100px 100px;gap:10px}.product-ranking__head{margin-top:13px;color:#71868c;background:#edf5f6;font-size:.67rem;font-weight:850;text-transform:uppercase}.product-ranking ol{margin:0;padding:0;list-style:none}.product-ranking li{border-bottom:1px solid #e2ecee;color:#36545c}.product-ranking li strong{color:#173f4a}:global(:root[data-theme='dark']) .product-dashboard__grid>:deep(.admin-card),:global(:root[data-theme='dark']) .product-funnel,:global(:root[data-theme='dark']) .product-ranking{border-color:#3d565e;background:#172a30}:global(:root[data-theme='dark']) .product-funnel h3,:global(:root[data-theme='dark']) .product-ranking h3,:global(:root[data-theme='dark']) .product-funnel li>span strong{color:#dff5f7}@media(max-width:850px){.product-dashboard__grid{grid-template-columns:1fr}}@media(max-width:620px){.product-dashboard__hero,.product-ranking header{align-items:flex-start;flex-direction:column}.product-ranking__head,.product-ranking li{grid-template-columns:minmax(0,1fr) 70px 70px}}
</style>
