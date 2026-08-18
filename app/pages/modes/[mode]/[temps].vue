<script setup lang="ts">
import { isModeLandingSlug, modeLandingPage } from '~~/shared/data/mode-landing-pages'
import { modeTensePage } from '~~/shared/data/mode-tense-pages'
import { modeTensePedagogy } from '~~/shared/data/mode-tense-pedagogy'
import { modeTenseEndings } from '~~/shared/data/mode-tense-endings'

const route = useRoute()
const { interfaceLocale, localePath } = useLanguagePreferences()
const modeSlug = String(route.params.mode || '')
const tenseSlug = String(route.params.temps || '')

if (!isModeLandingSlug(modeSlug)) {
  throw createError({ statusCode: 404, statusMessage: 'Mode introuvable' })
}

const tense = modeTensePage(modeSlug, tenseSlug)
const pedagogy = modeTensePedagogy(modeSlug, tenseSlug)
const endingsGuide = modeTenseEndings(modeSlug, tenseSlug)
if (!tense || !pedagogy || !endingsGuide) {
  throw createError({ statusCode: 404, statusMessage: 'Temps introuvable' })
}

const mode = computed(() => modeLandingPage(modeSlug, interfaceLocale.value))
const endingPronouns = computed(() => {
  if (modeSlug === 'participe') return []
  if (modeSlug === 'imperatif') return ['(tu)', '(nous)', '(vous)']
  if (modeSlug === 'subjonctif') return ['que je / j’', 'que tu', 'qu’il / elle / on', 'que nous', 'que vous', 'qu’ils / elles']
  return ['je / j’', 'tu', 'il / elle / on', 'nous', 'vous', 'ils / elles']
})
function endingForms(endings: string) {
  return endings.split('·').map(ending => ending.trim())
}
const endingTableGroups = computed(() => endingsGuide.groups.filter(group => endingForms(group.endings).length === endingPronouns.value.length))
const endingReferenceGroups = computed(() => endingsGuide.groups.filter(group => !endingTableGroups.value.includes(group)))
const learnUrl = computed(() => localePath('/apprendre'))
const frenchUseTitle = computed(() => {
  if (modeSlug === 'participe') {
    const form = tenseSlug === 'present'
      ? 'le participe présent'
      : tenseSlug === 'passe'
        ? 'le participe passé'
        : `${/^[aeiouyéèêàâîïôöùûü]/iu.test(tense.label) ? 'l’' : 'le '}${tense.label}`
    return `Quand choisir ${form} ?`
  }
  const tenseArticle = /^[aeiouyéèêàâîïôöùûü]/iu.test(tense.label) ? 'l’' : 'le '
  const modeArticle = /^[aeiouyéèêàâîïôöùûü]/iu.test(mode.value.modeName) ? 'de l’' : 'du '
  return `Quand choisir ${tenseArticle}${tense.label} ${modeArticle}${mode.value.modeName} ?`
})
const copy = computed(() => ({
  fr: { title: `${tense.label} — ${mode.value.modeName}`, description: `${tense.label} du mode ${mode.value.modeName} : emplois, terminaisons et exemples contextualisés.`, endings: 'Les terminaisons', uses: frenchUseTitle.value, examples: 'Phrases exemples : pourquoi employer ce temps ?', examplesIntro: `Chaque phrase met en évidence un usage du ${tense.label}. Le contexte fournit les indices et la justification explique précisément pourquoi ce temps convient.`, example: 'Phrase exemple', context: 'Situation et indices', reason: 'Justification de l’usage du temps', back: 'Retour', practise: `Créer un exercice au ${tense.label}` },
  de: { title: `${tense.label} — ${mode.value.modeName}`, description: `Verstehe die Wahl von ${tense.label} im Modus ${mode.value.modeName} anhand konkreter Situationen.`, endings: 'Endungen', uses: `Wann verwendet man ${tense.label} im ${mode.value.modeName}?`, examples: 'Beispiele: Warum diese Zeit verwenden?', examplesIntro: 'Jeder Satz zeigt eine Verwendung dieser Zeit. Der Kontext liefert die Hinweise und die Begründung erklärt die Wahl.', example: 'Beispielsatz', context: 'Situation und Hinweise', reason: 'Begründung der Zeitwahl', back: 'Zurück zu Lernen', practise: `Übung: ${tense.label}` },
  en: { title: `${tense.label} — ${mode.value.modeName}`, description: `Understand why ${tense.label} is chosen within the ${mode.value.modeName} through concrete situations.`, endings: 'Endings', uses: `When should you use the ${tense.label} ${mode.value.modeName}?`, examples: 'Example sentences: why use this tense?', examplesIntro: 'Each sentence illustrates one use of the tense. The context provides the clues and the explanation justifies the choice.', example: 'Example sentence', context: 'Situation and clues', reason: 'Why this tense is used', back: 'Back to Learn', practise: `Practise ${tense.label}` },
  it: { title: `${tense.label} — ${mode.value.modeName}`, description: `Comprendi perché si sceglie ${tense.label} nel modo ${mode.value.modeName} attraverso situazioni concrete.`, endings: 'Desinenze', uses: `Quando scegliere ${tense.label} del ${mode.value.modeName}?`, examples: 'Frasi di esempio: perché usare questo tempo?', examplesIntro: 'Ogni frase mostra un uso del tempo. Il contesto fornisce gli indizi e la spiegazione giustifica la scelta.', example: 'Frase di esempio', context: 'Situazione e indizi', reason: 'Giustificazione dell’uso del tempo', back: 'Torna a Imparare', practise: `Esercitati: ${tense.label}` },
  es: { title: `${tense.label} — ${mode.value.modeName}`, description: `Comprende por qué se elige ${tense.label} en el modo ${mode.value.modeName} mediante situaciones concretas.`, endings: 'Terminaciones', uses: `¿Cuándo elegir ${tense.label} del ${mode.value.modeName}?`, examples: 'Frases de ejemplo: ¿por qué usar este tiempo?', examplesIntro: 'Cada frase muestra un uso del tiempo. El contexto aporta las pistas y la explicación justifica la elección.', example: 'Frase de ejemplo', context: 'Situación y pistas', reason: 'Justificación del uso del tiempo', back: 'Volver a Aprender', practise: `Practicar ${tense.label}` },
}[interfaceLocale.value]))
const exerciseUrl = computed(() => ({
  path: localePath('/exercices-de-conjugaison'),
  query: { mode: modeSlug, temps: tense.label },
}))

useHead(() => ({
  title: `${copy.value.title} : emplois, exemples et exercices`,
  meta: [
    { name: 'description', content: copy.value.description },
    { property: 'og:title', content: copy.value.title },
    { property: 'og:description', content: copy.value.description },
    { property: 'og:type', content: 'website' },
  ],
  script: [{
    key: 'mode-tense-learning-resource',
    type: 'application/ld+json',
    textContent: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: copy.value.title,
      description: copy.value.description,
      learningResourceType: 'Lesson',
      educationalUse: ['Instruction', 'Practice'],
      inLanguage: 'fr',
      teaches: `Conjugaison française : ${tense.label} — ${mode.value.modeName}`,
      isAccessibleForFree: true,
    }),
  }],
}))
</script>

<template>
  <main class="tense-page">
    <NuxtLink class="tense-page__back" :to="learnUrl"><span aria-hidden="true">←</span> {{ copy.back }}</NuxtLink>

    <header class="tense-page__hero">
      <p>{{ mode.modeName }} · {{ tense.label }}</p>
      <h1>{{ copy.title }}</h1>
    </header>

    <div class="tense-page__content">
      <section class="tense-page__panel tense-page__panel--uses">
        <h2>{{ copy.uses }}</h2>
        <ul><li v-for="use in pedagogy.uses" :key="use">{{ use }}</li></ul>
      </section>

      <section class="tense-page__endings">
        <header>
          <h2>{{ copy.endings }}</h2>
          <p>{{ endingsGuide.intro }}</p>
        </header>
        <div v-if="endingPronouns.length && endingTableGroups.length" class="tense-page__table-wrap">
          <table>
            <thead>
              <tr><th scope="col">Pronom</th><th v-for="group in endingTableGroups" :key="group.label" scope="col">{{ group.label }}</th></tr>
            </thead>
            <tbody>
              <tr v-for="(pronoun, index) in endingPronouns" :key="pronoun">
                <th scope="row">{{ pronoun }}</th>
                <td v-for="group in endingTableGroups" :key="group.label"><strong>{{ endingForms(group.endings)[index] }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="endingReferenceGroups.length" class="tense-page__table-wrap tense-page__table-wrap--reference">
          <table>
            <thead><tr><th scope="col">Groupe ou élément</th><th scope="col">Terminaison ou construction</th><th scope="col">Exemple</th></tr></thead>
            <tbody>
              <tr v-for="group in endingReferenceGroups" :key="group.label">
                <th scope="row">{{ group.label }}</th><td><strong>{{ group.endings }}</strong></td><td>{{ group.example }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="tense-page__ending-notes">
          <p v-for="group in endingsGuide.groups.filter(item => item.note)" :key="group.label"><strong>{{ group.label }} :</strong> {{ group.note }}</p>
        </div>
      </section>

      <section class="tense-page__examples" :aria-labelledby="`${modeSlug}-${tenseSlug}-examples`">
        <header><p>02</p><div><h2 :id="`${modeSlug}-${tenseSlug}-examples`">{{ copy.examples }}</h2><p>{{ copy.examplesIntro }}</p></div></header>
        <div>
          <article v-for="(example, index) in pedagogy.examples" :key="example.sentence">
            <p class="tense-page__example-label">{{ copy.example }} {{ String(index + 1).padStart(2, '0') }}</p>
            <blockquote>{{ example.sentence }}</blockquote>
            <dl>
              <div><dt>{{ copy.context }}</dt><dd>{{ example.context }}</dd></div>
              <div><dt>{{ copy.reason }}</dt><dd>{{ example.reason }}</dd></div>
            </dl>
          </article>
        </div>
      </section>
    </div>

    <footer class="tense-page__actions">
      <NuxtLink class="tense-page__footer-back" :to="learnUrl"><span aria-hidden="true">←</span> {{ copy.back }}</NuxtLink>
      <NuxtLink class="is-primary" :to="exerciseUrl">{{ copy.practise }} <span aria-hidden="true">→</span></NuxtLink>
    </footer>
  </main>
</template>

<style scoped>
.tense-page { width: 100%; min-width: 0; max-width: 1120px; margin: 0 auto; color: var(--ink); font-family: "Funnel Sans", "Avenir Next", Avenir, system-ui, sans-serif; }
.tense-page h2 { margin: 0 0 13px; color: var(--brand-dark); font-size: clamp(1.35rem, 3vw, 2rem); letter-spacing: .015em; }
.tense-page__back { display: inline-flex; min-height: 44px; padding: 9px 14px; align-items: center; gap: 8px; border: 1px solid var(--line); border-radius: 12px; color: var(--brand-dark); background: var(--surface); font-weight: 800; text-decoration: none; box-shadow: 0 7px 18px rgb(42 65 61 / 7%); transition: border-color 150ms ease, background 150ms ease, transform 150ms ease; }
.tense-page__back:hover, .tense-page__back:focus-visible { border-color: var(--brand); background: var(--brand-pale); outline: 3px solid color-mix(in srgb, var(--accent) 45%, transparent); transform: translateX(-2px); }
.tense-page__back span { color: var(--accent); font-size: 1.15rem; }
.tense-page__hero { max-width: 850px; margin: 34px auto 38px; text-align: center; }
.tense-page__hero > p:first-child { margin: 0 0 8px; color: var(--accent); font-size: .76rem; font-weight: 850; letter-spacing: .14em; text-transform: uppercase; }
.tense-page__hero h1 { margin: 0; color: #294c4b; font-size: clamp(2.2rem, 6vw, 4.55rem); letter-spacing: .015em; line-height: 1.06; text-transform: capitalize; }
.tense-page__content { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; }
.tense-page__panel { padding: 27px; border: 1px solid var(--line); border-radius: 21px; background: color-mix(in srgb, var(--surface) 92%, var(--brand)); }
.tense-page__panel--uses { background: color-mix(in srgb, var(--surface) 91%, var(--accent)); }
.tense-page__panel p, .tense-page__panel li { color: var(--muted); line-height: 1.65; }
.tense-page__panel p { margin: 0; }
.tense-page__panel ul { display: grid; margin: 0; padding-left: 20px; gap: 8px; }
.tense-page__endings { padding: clamp(24px, 5vw, 40px); border: 1px solid var(--line); border-radius: 24px; background: color-mix(in srgb, var(--surface) 95%, var(--accent)); }
.tense-page__endings > header p { max-width: 820px; margin: 0; color: var(--muted); line-height: 1.65; }
.tense-page__table-wrap { margin-top: 22px; overflow-x: auto; border: 1px solid var(--line); border-radius: 17px; background: var(--surface); }
.tense-page__table-wrap--reference { margin-top: 13px; }
.tense-page__table-wrap table { width: 100%; min-width: 620px; border-collapse: separate; border-spacing: 0; }
.tense-page__table-wrap th, .tense-page__table-wrap td { padding: 14px 16px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); text-align: center; }
.tense-page__table-wrap tr > *:last-child { border-right: 0; }
.tense-page__table-wrap tbody tr:last-child > * { border-bottom: 0; }
.tense-page__table-wrap thead th { color: var(--brand-dark); background: color-mix(in srgb, var(--surface) 78%, var(--brand)); font-size: .78rem; font-weight: 900; letter-spacing: .025em; }
.tense-page__table-wrap thead th:first-child { min-width: 130px; text-align: left; }
.tense-page__table-wrap tbody th { color: var(--brand-dark); background: var(--surface-soft); text-align: left; white-space: nowrap; }
.tense-page__table-wrap td { color: var(--muted); line-height: 1.45; }
.tense-page__table-wrap td strong { color: var(--accent); font-size: 1.02rem; }
.tense-page__table-wrap--reference th, .tense-page__table-wrap--reference td { text-align: left; }
.tense-page__ending-notes { display: grid; margin-top: 14px; gap: 7px; }
.tense-page__ending-notes p { margin: 0; color: var(--muted); font-size: .9rem; line-height: 1.55; }
.tense-page__ending-notes strong { color: var(--brand-dark); }
.tense-page__examples { padding: clamp(24px, 5vw, 40px); border: 1px solid var(--line); border-radius: 24px; background: var(--surface); box-shadow: 0 16px 40px rgb(42 65 61 / 7%); }
.tense-page__examples > header { display: grid; grid-template-columns: auto 1fr; gap: 22px; }
.tense-page__examples > header > p { margin: 4px 0 0; color: var(--accent); font-weight: 900; }
.tense-page__examples > header h2 { margin-bottom: 7px; }
.tense-page__examples > header div > p { max-width: 820px; margin: 0; color: var(--muted); line-height: 1.6; }
.tense-page__examples > div { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 12px; gap: 13px; }
.tense-page__examples article { min-width: 0; overflow: hidden; border: 1px solid var(--line); border-radius: 18px; background: var(--surface-soft); }
.tense-page__example-label { margin: 0; padding: 13px 20px 0; color: var(--accent); background: color-mix(in srgb, var(--surface) 78%, var(--brand)); font-size: .7rem; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
.tense-page__examples blockquote { margin: 0; padding: 20px; color: var(--brand-dark); background: color-mix(in srgb, var(--surface) 78%, var(--brand)); font-size: 1.06rem; font-style: italic; font-weight: 800; line-height: 1.5; }
.tense-page__examples dl { display: grid; margin: 0; padding: 18px; gap: 16px; }
.tense-page__examples dt { margin-bottom: 4px; color: var(--accent); font-size: .72rem; font-weight: 900; letter-spacing: .07em; text-transform: uppercase; }
.tense-page__examples dd { margin: 0; color: var(--muted); line-height: 1.55; }
.tense-page__examples dl div:last-child { padding-top: 14px; border-top: 1px solid var(--line); }
.tense-page__actions { display: flex; margin-top: 18px; padding: 24px; align-items: center; justify-content: space-between; border-radius: 20px; gap: 12px; background: #294c4b; }
.tense-page__actions a { padding: 11px 15px; border-radius: 11px; color: white; font-weight: 800; text-align: center; text-decoration: none; }
.tense-page__footer-back { border: 1px solid rgb(255 255 255 / 42%); }
.tense-page__actions a.is-primary { color: #294c4b; background: #f4c943; }
@media (max-width: 820px) {
  .tense-page__examples > div { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .tense-page { width: min(100%, calc(100vw - 20px)); }
  .tense-page__examples > header { grid-template-columns: 1fr; gap: 8px; }
  .tense-page__examples > header > p { margin-top: 0; }
  .tense-page__hero h1 { overflow-wrap: anywhere; }
  .tense-page__content > section { min-width: 0; }
  .tense-page__actions { align-items: stretch; flex-direction: column; }
}
</style>
