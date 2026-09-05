<script setup lang="ts">
import { localeLanguageTag } from '~~/shared/i18n/locales'
import type { SharedExerciseSummary } from '~~/shared/types/exercise-summary'

const route = useRoute()
const { ui, uiLabel, interfaceLocale } = useLanguagePreferences()
const token = computed(() => String(route.params.token || ''))
const { data: summary, error } = await useFetch<SharedExerciseSummary>(() => `/api/bilans/${encodeURIComponent(token.value)}`)

if (error.value || !summary.value) {
  throw createError({ statusCode: error.value?.statusCode || 404, statusMessage: ui('Bilan introuvable') })
}

const formattedDate = computed(() => new Intl.DateTimeFormat((interfaceLocale.value === 'nl' || interfaceLocale.value === 'nl-NL') ? localeLanguageTag(interfaceLocale.value) : `${interfaceLocale.value}-CH`, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date(summary.value!.createdAt)))

useHead(() => ({
  title: ui('Bilan de conjugaison partagé'),
  meta: [
    { name: 'description', content: ui('Consulter un bilan de conjugaison partagé.') },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}))
</script>

<template>
  <article v-if="summary" class="shared-summary-page">
    <header class="shared-summary-hero">
      <p>{{ ui('BILAN PARTAGÉ') }}</p>
      <h1>{{ ui('Bilan de conjugaison') }}</h1>
      <div class="shared-summary-score">
        <strong>{{ summary.score }}%</strong>
        <span>{{ summary.correctCount }} / {{ summary.items.length }} {{ summary.correctCount === 1 ? ui('réponse juste') : ui('réponses justes') }}</span>
      </div>
      <small>{{ ui('Bilan réalisé le {date}', { date: formattedDate }) }}</small>
    </header>

    <section v-if="summary.verbs.length || summary.tenses.length" class="shared-summary-context" :aria-label="ui('Contenu de l’exercice')">
      <p v-if="summary.verbs.length"><strong>{{ ui('Verbes') }} :</strong> {{ summary.verbs.join(', ') }}</p>
      <p v-if="summary.tenses.length"><strong>{{ ui('Temps') }} :</strong> {{ summary.tenses.map(tense => tense.mode ? `${uiLabel(tense.mode)} · ${uiLabel(tense.name)}` : uiLabel(tense.name)).join(', ') }}</p>
    </section>

    <section class="shared-summary-results" aria-labelledby="shared-summary-results-title">
      <h2 id="shared-summary-results-title">{{ ui('Récapitulatif des réponses') }}</h2>
      <ol>
        <li v-for="item in summary.items" :key="item.index" :class="`is-${item.status}`">
          <span class="shared-summary-results__status" :aria-label="item.status === 'correct' ? ui('Juste') : ui('À revoir')">{{ item.status === 'correct' ? '✓' : '×' }}</span>
          <div>
            <h3>{{ item.index }}. {{ item.questionLabel }}</h3>
            <dl>
              <div><dt>{{ ui('Réponse donnée') }}</dt><dd>{{ item.learnerAnswer || '—' }}</dd></div>
              <div><dt>{{ ui('Bonne réponse') }}</dt><dd>{{ item.expectedAnswer }}</dd></div>
            </dl>
            <p v-if="item.errorLabels.length" class="shared-summary-results__errors">{{ item.errorLabels.join(' · ') }}</p>
          </div>
        </li>
      </ol>
    </section>
  </article>
</template>

<style scoped>
.shared-summary-page{width:min(960px,calc(100% - 28px));margin:34px auto 64px;color:var(--ink)}
.shared-summary-hero{display:grid;padding:34px;justify-items:center;border:1px solid var(--line);border-radius:24px;background:linear-gradient(135deg,var(--surface),var(--surface-soft));box-shadow:var(--shadow);text-align:center}
.shared-summary-hero>p{margin:0;color:var(--brand);font-size:.72rem;font-weight:900;letter-spacing:.16em}
.shared-summary-hero h1{margin:7px 0 20px;color:var(--brand-dark);font-size:clamp(1.8rem,5vw,3rem)}
.shared-summary-score{display:grid;justify-items:center}
.shared-summary-score strong{color:var(--success);font-size:clamp(3.5rem,10vw,6.5rem);letter-spacing:.012em;line-height:.95}
.shared-summary-score span{margin-top:8px;color:var(--muted);font-weight:750}
.shared-summary-hero small{margin-top:16px;color:var(--muted)}
.shared-summary-context{display:grid;margin:18px 0;padding:18px 22px;gap:8px;border:1px solid var(--line);border-radius:16px;background:var(--surface)}
.shared-summary-context p{margin:0;line-height:1.5}.shared-summary-context strong{color:var(--brand-dark)}
.shared-summary-results{overflow:hidden;border:1px solid var(--line);border-radius:20px;background:var(--surface);box-shadow:var(--shadow)}
.shared-summary-results>h2{margin:0;padding:20px 24px;color:var(--brand-dark);font-size:1.15rem;border-bottom:1px solid var(--line)}
.shared-summary-results ol{display:grid;margin:0;padding:0;list-style:none}
.shared-summary-results li{display:grid;padding:18px 22px;grid-template-columns:38px minmax(0,1fr);gap:14px;border-bottom:1px solid var(--line)}
.shared-summary-results li:last-child{border-bottom:0}.shared-summary-results li.is-correct{background:color-mix(in srgb,var(--success) 5%,var(--surface))}.shared-summary-results li.is-incorrect{background:color-mix(in srgb,var(--danger) 5%,var(--surface))}
.shared-summary-results__status{display:grid;width:32px;height:32px;place-items:center;border:2px solid currentColor;border-radius:50%;color:var(--success);font-weight:900}.is-incorrect .shared-summary-results__status{color:var(--danger)}
.shared-summary-results h3{margin:4px 0 12px;color:var(--brand-dark);font-size:1rem;line-height:1.45}
.shared-summary-results dl{display:grid;margin:0;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.shared-summary-results dl>div{padding:11px;border-radius:10px;background:var(--surface-soft)}
.shared-summary-results dt{color:var(--muted);font-size:.68rem;font-weight:850;letter-spacing:.06em;text-transform:uppercase}.shared-summary-results dd{margin:4px 0 0;overflow-wrap:anywhere;font-weight:750;line-height:1.4}
.shared-summary-results__errors{margin:10px 0 0;color:var(--danger);font-size:.8rem;font-weight:750}
@media(max-width:650px){.shared-summary-page{margin-top:18px}.shared-summary-hero{padding:26px 18px}.shared-summary-results li{padding:16px 14px;grid-template-columns:32px minmax(0,1fr);gap:10px}.shared-summary-results__status{width:28px;height:28px}.shared-summary-results dl{grid-template-columns:1fr}}
</style>
