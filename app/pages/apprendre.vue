<script setup lang="ts">
import { EXERCISE_LANDING_SLUGS, exerciseLandingPage } from '~~/shared/data/exercise-landing-pages'
import { MODE_LANDING_SLUGS, modeLandingPage, type ModeLandingSlug } from '~~/shared/data/mode-landing-pages'
import { modeTensePages } from '~~/shared/data/mode-tense-pages'

const { ui, localePath, interfaceLocale } = useLanguagePreferences()
const { track } = useSiteAnalytics()
useHead(() => ({
  title: ui('Apprendre la conjugaison'),
  meta: [{ name: 'description', content: ui('Une synthèse claire des règles essentielles de la conjugaison française.') }],
}))

const modeExplorerCopy = computed(() => ({
  fr: { eyebrow: 'Le sens et le temps', title: 'Comprendre les modes et choisir un temps', intro: 'Sélectionne un mode pour comprendre ce qu’il exprime. Tu verras ensuite ses exemples, les points à surveiller et uniquement les temps qui lui appartiennent.', tabsLabel: 'Choisir un mode', tenseHelp: 'Choisis ensuite un temps pour approfondir son rôle, sa formation et ses emplois.' },
  de: { eyebrow: 'Bedeutung und Zeit', title: 'Modi verstehen und eine Zeit wählen', intro: 'Wähle einen Modus, um seine Bedeutung zu verstehen. Danach siehst du Beispiele, wichtige Hinweise und nur die dazugehörigen Zeiten.', tabsLabel: 'Einen Modus wählen', tenseHelp: 'Wähle anschließend eine Zeitform, um Funktion, Bildung und Gebrauch zu vertiefen.' },
  en: { eyebrow: 'Meaning and tense', title: 'Understand moods and choose a tense', intro: 'Select a mood to understand what it expresses. You will then see examples, points to watch and only the tenses that belong to it.', tabsLabel: 'Choose a mood', tenseHelp: 'Then choose a tense to explore its role, formation and uses.' },
  it: { eyebrow: 'Significato e tempo', title: 'Capire i modi e scegliere un tempo', intro: 'Seleziona un modo per capire che cosa esprime. Vedrai poi gli esempi, i punti importanti e soltanto i tempi che gli appartengono.', tabsLabel: 'Scegliere un modo', tenseHelp: 'Scegli quindi un tempo per approfondirne ruolo, formazione e usi.' },
  es: { eyebrow: 'Significado y tiempo', title: 'Comprender los modos y elegir un tiempo', intro: 'Selecciona un modo para comprender qué expresa. Después verás ejemplos, puntos importantes y únicamente los tiempos que le corresponden.', tabsLabel: 'Elegir un modo', tenseHelp: 'Elige después un tiempo para profundizar en su función, formación y usos.' },
}[interfaceLocale.value]))
const sections = computed(() => [
  { id: 'modes', number: '01', title: modeExplorerCopy.value.title, description: modeExplorerCopy.value.tabsLabel },
  { id: 'bases', number: '02', title: ui('Comprendre le verbe'), description: ui('Radical, terminaison, groupes et auxiliaires.') },
  { id: 'accords', number: '03', title: ui('Réussir les accords'), description: ui('Sujet, auxiliaires et participe passé.') },
  { id: 'orthographe', number: '04', title: ui('Éviter les pièges'), description: ui('Modifications du radical et terminaisons à surveiller.') },
])
const exerciseJourneys = computed(() => EXERCISE_LANDING_SLUGS.map(slug => exerciseLandingPage(slug, interfaceLocale.value)))
const learningModes = computed(() => MODE_LANDING_SLUGS.map(slug => ({
  ...modeLandingPage(slug, interfaceLocale.value),
  tenses: modeTensePages(slug).map(tense => ({ ...tense, to: localePath(tense.path) })),
})))
const selectedLearningMode = ref<ModeLandingSlug>('indicatif')

function scrollToSection(sectionId: string) {
  track('feature_selected', { feature: 'learn.content', item: sectionId })
  track('feature_completed', { feature: 'learn.content', item: sectionId })
  const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  document.getElementById(sectionId)?.scrollIntoView({ behavior, block: 'start' })
}

function focusLearningMode(slug: ModeLandingSlug) {
  selectedLearningMode.value = slug
  nextTick(() => document.getElementById(`mode-tab-${slug}`)?.focus())
}

function moveLearningModeFocus(offset: number) {
  const currentIndex = MODE_LANDING_SLUGS.indexOf(selectedLearningMode.value)
  const nextIndex = (currentIndex + offset + MODE_LANDING_SLUGS.length) % MODE_LANDING_SLUGS.length
  focusLearningMode(MODE_LANDING_SLUGS[nextIndex]!)
}

onMounted(() => track('feature_exposed', { feature: 'learn.content' }))
</script>

<template>
  <div class="learning-page">
    <header class="learning-hero">
      <p class="learning-eyebrow">{{ ui('Les règles essentielles') }}</p>
      <h1>{{ ui('Apprendre la conjugaison française') }}</h1>
    </header>

    <nav class="learning-summary" :aria-label="ui('Sommaire des règles')">
      <button v-for="section in sections" :key="section.id" type="button" @click="scrollToSection(section.id)">
        <span>{{ section.number }}</span>
        <strong>{{ section.title }}</strong>
        <small>{{ section.description }}</small>
      </button>
    </nav>

    <main class="learning-content">
      <section id="modes" class="rule-section">
        <header>
          <span>01</span>
          <div>
            <p class="learning-eyebrow">{{ modeExplorerCopy.eyebrow }}</p>
            <h2>{{ modeExplorerCopy.title }}</h2>
            <p class="mode-explorer-intro">{{ modeExplorerCopy.intro }}</p>
          </div>
        </header>

        <div class="mode-selector" role="tablist" :aria-label="modeExplorerCopy.tabsLabel">
          <button
            v-for="mode in learningModes"
            :id="`mode-tab-${mode.slug}`"
            :key="mode.slug"
            type="button"
            role="tab"
            :aria-controls="`mode-panel-${mode.slug}`"
            :aria-selected="selectedLearningMode === mode.slug"
            :tabindex="selectedLearningMode === mode.slug ? 0 : -1"
            :class="{ 'is-active': selectedLearningMode === mode.slug }"
            @click="selectedLearningMode = mode.slug"
            @keydown.left.prevent="moveLearningModeFocus(-1)"
            @keydown.right.prevent="moveLearningModeFocus(1)"
            @keydown.home.prevent="focusLearningMode(MODE_LANDING_SLUGS[0]!)"
            @keydown.end.prevent="focusLearningMode(MODE_LANDING_SLUGS[MODE_LANDING_SLUGS.length - 1]!)"
          >
            <strong>{{ mode.modeName }}</strong>
          </button>
        </div>

        <div
          v-for="mode in learningModes"
          v-show="selectedLearningMode === mode.slug"
          :id="`mode-panel-${mode.slug}`"
          :key="mode.slug"
          class="mode-explorer-panel"
          role="tabpanel"
          :aria-labelledby="`mode-tab-${mode.slug}`"
        >
          <div class="mode-explorer-purpose">
            <p>{{ mode.eyebrow }}</p>
            <h3>{{ mode.purposeTitle }}</h3>
            <p>{{ mode.purpose }}</p>
          </div>

          <div class="mode-explorer-details">
            <section>
              <h4>{{ mode.examplesTitle }}</h4>
              <ul><li v-for="example in mode.examples" :key="example">{{ example }}</li></ul>
            </section>
            <section>
              <h4>{{ mode.watchTitle }}</h4>
              <ul><li v-for="item in mode.watchItems" :key="item">{{ item }}</li></ul>
            </section>
          </div>

          <section class="mode-explorer-tenses" :aria-labelledby="`mode-panel-${mode.slug}-tenses`">
            <header>
              <h4 :id="`mode-panel-${mode.slug}-tenses`">{{ mode.tensesTitle }}</h4>
              <p>{{ modeExplorerCopy.tenseHelp }}</p>
            </header>
            <nav :aria-label="mode.tensesTitle">
              <NuxtLink v-for="tense in mode.tenses" :key="tense.slug" :to="tense.to">
                <strong>{{ tense.label }}</strong><span aria-hidden="true">→</span>
              </NuxtLink>
            </nav>
          </section>

          <div class="mode-explorer-actions">
            <p>{{ mode.ctaText }}</p>
            <NuxtLink :to="{ path: localePath('/'), query: { mode: mode.slug } }">{{ mode.ctaLabel }} <span aria-hidden="true">→</span></NuxtLink>
          </div>
        </div>

        <NuxtLink class="mode-training-button" :to="{ path: localePath('/'), query: { identifier: 'mode-temps' } }">
          <span>S’entraîner à reconnaître les modes et les temps</span><span aria-hidden="true">→</span>
        </NuxtLink>
      </section>

      <section id="bases" class="rule-section">
        <header><span>02</span><div><p class="learning-eyebrow">{{ ui('Les fondations') }}</p><h2>{{ ui('Comprendre le verbe') }}</h2></div></header>
        <div class="rule-grid rule-grid--three">
          <article>
            <h3>{{ ui('Radical + terminaison') }}</h3>
            <p>{{ ui('Une forme conjuguée associe généralement un radical, qui porte le sens, et une terminaison, qui indique la personne, le mode et le temps.') }}</p>
            <p class="rule-example"><strong>nous chantions</strong><span>chant- + -ions</span></p>
          </article>
          <article>
            <h3>{{ ui('Les trois groupes') }}</h3>
            <ul>
              <li><strong>{{ ui('1er groupe :') }}</strong> {{ ui('verbes en -er, sauf aller.') }}</li>
              <li><strong>{{ ui('2e groupe :') }}</strong> {{ ui('verbes en -ir faisant -issons.') }}</li>
              <li><strong>{{ ui('3e groupe :') }}</strong> {{ ui('tous les autres verbes, souvent irréguliers.') }}</li>
            </ul>
          </article>
          <article>
            <h3>{{ ui('Être et avoir') }}</h3>
            <p>{{ ui('Ces deux verbes ont leurs propres conjugaisons et servent aussi d’auxiliaires pour former les temps composés.') }}</p>
            <p class="rule-example"><strong>elle a fini</strong><span>{{ ui('auxiliaire + participe passé') }}</span></p>
          </article>
        </div>
      </section>

      <section id="accords" class="rule-section">
        <header><span>03</span><div><p class="learning-eyebrow">{{ ui('Les correspondances') }}</p><h2>{{ ui('Réussir les accords') }}</h2></div></header>
        <div class="agreement-flow">
          <article><span>1</span><div><h3>{{ ui('Trouver le sujet') }}</h3><p>{{ ui('Le verbe s’accorde en personne et en nombre avec son sujet, même lorsque celui-ci est éloigné.') }}</p><em>Les élèves de cette classe réussissent.</em></div></article>
          <article><span>2</span><div><h3>{{ ui('Identifier l’auxiliaire') }}</h3><p>{{ ui('Avec être, le participe passé s’accorde généralement avec le sujet.') }}</p><em>Elles sont arrivées.</em></div></article>
          <article><span>3</span><div><h3>{{ ui('Repérer le COD avec avoir') }}</h3><p>{{ ui('Avec avoir, le participe passé s’accorde avec le COD seulement si celui-ci est placé avant.') }}</p><em>Les lettres qu’il a écrites.</em></div></article>
        </div>
        <aside class="rule-note rule-note--warning"><strong>{{ ui('Verbes pronominaux') }}</strong><p>{{ ui('Leur accord dépend de la fonction du pronom. Il faut déterminer si celui-ci est COD, COI ou fait partie du verbe.') }}</p></aside>
      </section>

      <section id="orthographe" class="rule-section">
        <header><span>04</span><div><p class="learning-eyebrow">{{ ui('Les pièges fréquents') }}</p><h2>{{ ui('Préserver le son et l’orthographe') }}</h2></div></header>
        <div class="trap-grid">
          <article><h3>-ger et -cer</h3><p>{{ ui('On ajoute parfois un e après g ou une cédille pour conserver le son.') }}</p><em>nous mangeons · nous plaçons</em></article>
          <article><h3>-yer</h3><p>{{ ui('Le y peut devenir i devant un e muet. Pour certains verbes, les deux graphies sont admises.') }}</p><em>j’emploie · nous employons</em></article>
          <article><h3>e / è</h3><p>{{ ui('Certains verbes changent l’accent lorsque la syllabe suivante contient un e muet.') }}</p><em>je lève · nous levons</em></article>
          <article><h3>{{ ui('Consonne doublée') }}</h3><p>{{ ui('Certains verbes en -eler et -eter doublent la consonne ; d’autres prennent un accent grave.') }}</p><em>j’appelle · j’achète</em></article>
          <article><h3>-é ou -er ?</h3><p>{{ ui('Remplace le verbe par « vendre » : si « vendu » convient, écris le participe passé ; si « vendre » convient, écris l’infinitif.') }}</p><em>j’ai mangé · je vais manger</em></article>
          <article><h3>-rai ou -rais ?</h3><p>{{ ui('Le futur exprime ce qui arrivera ; le conditionnel dépend d’une condition ou atténue une demande.') }}</p><em>je viendrai · je viendrais si…</em></article>
        </div>
      </section>

      <section class="learning-journeys" aria-labelledby="journeys-title">
        <header>
          <p class="learning-eyebrow">{{ ui('À toi de jouer') }}</p>
          <h2 id="journeys-title">{{ ui('Passe de la règle à la pratique') }}</h2>
        </header>
        <div>
          <NuxtLink v-for="journey in exerciseJourneys" :key="journey.slug" :to="localePath(`/indicatif/${journey.slug}`)">
            <span>{{ journey.eyebrow }}</span>
            <strong>{{ journey.title }}</strong>
            <small>{{ journey.description }}</small>
          </NuxtLink>
        </div>
      </section>

      <section class="learning-actions" aria-labelledby="continue-title">
        <div><p class="learning-eyebrow">{{ ui('À toi de jouer') }}</p><h2 id="continue-title">{{ ui('Passe de la règle à la pratique') }}</h2><p>{{ ui('Consulte un modèle complet ou crée un exercice ciblé pour vérifier ce que tu viens d’apprendre.') }}</p></div>
        <div><NuxtLink :to="localePath('/consulter')">{{ ui('Consulter un verbe') }}</NuxtLink><NuxtLink class="is-primary" :to="localePath('/')">{{ ui('S’exercer') }}</NuxtLink></div>
      </section>
    </main>

  </div>
</template>

<style scoped>
.learning-page { max-width: 100%; min-width: 0; overflow-x: clip; color: var(--ink); font-family: "Funnel Sans", "Avenir Next", Avenir, system-ui, sans-serif; }
.learning-hero { max-width: 850px; margin: 8px auto 36px; text-align: center; }
.learning-eyebrow { margin: 0 0 6px; color: var(--brand); font-size: .75rem; font-weight: 850; letter-spacing: .13em; text-transform: uppercase; }
.learning-hero h1 { margin: 0; color: #294c4b; font-size: clamp(2.3rem, 6vw, 4.7rem); letter-spacing: -.06em; line-height: 1; }
.learning-summary { display: grid; max-width: 1080px; margin: 0 auto 32px; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 9px; }
.learning-summary button { display: flex; min-height: 155px; flex-direction: column; padding: 16px; border: 1px solid var(--line); border-radius: 17px; color: var(--ink); background: rgb(255 255 255 / 88%); text-align: left; box-shadow: 0 10px 28px rgb(42 65 61 / 7%); transition: transform 150ms ease, border-color 150ms ease; cursor: pointer; }
.learning-summary button:hover { transform: translateY(-3px); border-color: var(--brand); }
.learning-summary span { color: var(--accent); font-size: .76rem; font-weight: 850; }
.learning-journeys { max-width: 1080px; margin: 42px auto 20px; }
.learning-journeys > header { margin-bottom: 17px; text-align: center; }
.learning-journeys h2 { margin: 0; color: #294c4b; font-size: clamp(1.7rem, 4vw, 2.6rem); letter-spacing: -.04em; }
.learning-journeys > div { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.learning-journeys a { display: flex; min-height: 190px; padding: 21px; flex-direction: column; border: 1px solid var(--line); border-radius: 18px; gap: 8px; color: var(--ink); background: var(--surface); text-decoration: none; box-shadow: 0 10px 28px rgb(42 65 61 / 7%); transition: transform 150ms ease, border-color 150ms ease; }
.learning-journeys a:hover { transform: translateY(-3px); border-color: var(--brand); }
.learning-journeys a span { color: var(--accent); font-size: .72rem; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }
.learning-journeys a strong { color: var(--brand-dark); font-size: 1.1rem; line-height: 1.3; }
.learning-journeys a small { color: var(--muted); font-size: .88rem; line-height: 1.5; }
.learning-summary strong { margin-top: auto; color: var(--brand-dark); line-height: 1.2; }
.learning-summary small { margin-top: 6px; color: var(--muted); line-height: 1.35; }
.learning-content { display: grid; width: 100%; max-width: 1080px; min-width: 0; margin: 0 auto; gap: 24px; }
.rule-section { width: 100%; min-width: 0; padding: 30px; box-sizing: border-box; border: 1px solid var(--line); border-radius: 24px; background: rgb(255 255 255 / 92%); box-shadow: var(--shadow); scroll-margin-top: 20px; }
.rule-section > header { display: flex; align-items: center; gap: 16px; margin-bottom: 23px; }
.rule-section > header > div { min-width: 0; }
.rule-section > header > span { display: grid; flex: 0 0 48px; width: 48px; height: 48px; place-items: center; border-radius: 14px; color: var(--brand-dark); background: var(--brand-pale); font-weight: 850; }
.rule-section h2 { margin: 0; color: var(--brand-dark); font-size: clamp(1.65rem, 4vw, 2.4rem); letter-spacing: -.04em; overflow-wrap: anywhere; }
.rule-section h3 { margin: 0 0 9px; color: var(--brand-dark); font-size: 1.08rem; }
.rule-section article p, .rule-section li { color: var(--muted); line-height: 1.55; }
.rule-grid { display: grid; gap: 13px; }
.rule-grid--three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.rule-grid article, .trap-grid article { padding: 18px; border: 1px solid var(--line); border-radius: 17px; background: var(--soft); }
.rule-grid article > p { margin: 0; }
.rule-grid ul { margin: 0; padding-left: 19px; }
.rule-example { display: flex; flex-direction: column; margin-top: 16px !important; padding: 12px; border-radius: 11px; color: var(--ink) !important; background: white; }
.rule-example span { margin-top: 3px; color: var(--muted); font-size: .82rem; }
.rule-note { display: flex; align-items: center; gap: 18px; margin-top: 15px; padding: 15px 18px; border-radius: 15px; color: var(--brand-dark); background: var(--brand-pale); }
.rule-note p { margin: 0; line-height: 1.5; }
.rule-note--warning { color: #784719; background: var(--accent-pale); }
.mode-explorer-intro { max-width: 760px; margin: 7px 0 0; color: var(--muted); line-height: 1.5; }
.mode-selector { display: grid; padding: 6px; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; border: 1px solid var(--line); border-radius: 17px; background: var(--soft); }
.mode-selector button { min-width: 0; min-height: 48px; padding: 10px 9px; border: 1px solid transparent; border-radius: 12px; color: var(--muted); background: transparent; font: inherit; text-align: center; cursor: pointer; transition: color 150ms ease, background 150ms ease, border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease; }
.mode-selector button:hover { color: var(--brand-dark); background: rgb(255 255 255 / 65%); }
.mode-selector button:focus-visible { outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent); outline-offset: 2px; }
.mode-selector button.is-active { border-color: color-mix(in srgb, var(--brand) 32%, var(--line)); color: var(--brand-dark); background: var(--surface); box-shadow: 0 5px 16px rgb(42 65 61 / 10%); transform: translateY(-1px); }
.mode-selector strong { display: block; overflow-wrap: anywhere; font-size: .95rem; text-transform: capitalize; }
.mode-explorer-panel { overflow: hidden; margin-top: 13px; border: 1px solid var(--line); border-radius: 19px; background: var(--surface); }
.mode-explorer-purpose { padding: 24px; color: white; background: var(--brand); }
.mode-explorer-purpose > p:first-child { margin: 0 0 5px; color: #c7e7de; font-size: .7rem; font-weight: 850; letter-spacing: .12em; text-transform: uppercase; }
.mode-explorer-purpose h3 { margin: 0 0 7px; color: white; font-size: clamp(1.25rem, 3vw, 1.65rem); }
.mode-explorer-purpose > p:last-child { max-width: 820px; margin: 0; color: #eef8f5; line-height: 1.55; }
.mode-explorer-details { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-bottom: 1px solid var(--line); }
.mode-explorer-details section { padding: 21px 24px; }
.mode-explorer-details section + section { border-left: 1px solid var(--line); }
.mode-explorer-details h4, .mode-explorer-tenses h4 { margin: 0 0 10px; color: var(--brand-dark); font-size: 1rem; }
.mode-explorer-details ul { display: grid; margin: 0; padding: 0; gap: 8px; list-style: none; }
.mode-explorer-details li { position: relative; padding-left: 17px; }
.mode-explorer-details li::before { position: absolute; top: .66em; left: 0; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); content: ""; transform: translateY(-50%); }
.mode-explorer-tenses { padding: 21px 24px 24px; background: var(--soft); }
.mode-explorer-tenses > header { display: flex; align-items: baseline; justify-content: space-between; gap: 22px; margin-bottom: 13px; }
.mode-explorer-tenses h4 { flex: 0 0 auto; margin: 0; }
.mode-explorer-tenses header p { max-width: 620px; margin: 0; color: var(--muted); font-size: .84rem; line-height: 1.45; }
.mode-explorer-tenses nav { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.mode-explorer-tenses a { display: flex; min-height: 48px; padding: 10px 12px; align-items: center; justify-content: space-between; gap: 10px; border: 1px solid var(--line); border-radius: 11px; color: var(--brand-dark); background: var(--surface); font-size: .84rem; text-decoration: none; text-transform: capitalize; transition: border-color 150ms ease, background 150ms ease, transform 150ms ease; }
.mode-explorer-tenses a:hover, .mode-explorer-tenses a:focus-visible { border-color: var(--brand); background: var(--brand-pale); outline: 0; transform: translateY(-1px); }
.mode-explorer-tenses a span { color: var(--accent); font-size: 1.05rem; }
.mode-explorer-actions { display: flex; padding: 16px 24px; align-items: center; justify-content: space-between; gap: 20px; border-top: 1px solid var(--line); }
.mode-explorer-actions p { margin: 0; color: var(--muted); font-size: .87rem; line-height: 1.45; }
.mode-explorer-actions a { flex: 0 0 auto; padding: 9px 13px; border-radius: 99px; color: white; background: var(--brand); font-size: .82rem; font-weight: 800; text-decoration: none; }
.mode-explorer-actions a:hover, .mode-explorer-actions a:focus-visible { background: var(--brand-dark); outline: 3px solid color-mix(in srgb, var(--accent) 45%, transparent); }
.trap-grid em, .agreement-flow em { color: var(--brand-dark); }
.mode-training-button { display: flex; width: 100%; min-height: 58px; box-sizing: border-box; margin-top: 14px; padding: 14px 18px; align-items: center; justify-content: space-between; gap: 16px; color: white; background: var(--brand); border: 2px solid var(--brand); border-radius: 15px; box-shadow: 0 8px 20px rgb(43 103 86 / 18%); font: inherit; font-weight: 850; text-decoration: none; cursor: pointer; transition: transform 150ms ease, box-shadow 150ms ease, background 150ms ease; }
.mode-training-button:hover, .mode-training-button:focus-visible { background: var(--brand-dark); box-shadow: 0 11px 25px rgb(43 103 86 / 24%); outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent); transform: translateY(-2px); }
.mode-training-button span:last-child { font-size: 1.35rem; }
.agreement-flow { display: grid; gap: 10px; }
.agreement-flow article { display: flex; align-items: start; gap: 15px; padding: 16px 18px; border: 1px solid var(--line); border-radius: 16px; background: var(--soft); }
.agreement-flow article > span { display: grid; flex: 0 0 34px; width: 34px; height: 34px; place-items: center; border-radius: 50%; color: white; background: var(--brand); font-weight: 800; }
.agreement-flow p { margin: 0 0 5px; }
.trap-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 11px; }
.trap-grid p { min-height: 74px; margin: 0 0 8px; }
.learning-actions { display: flex; align-items: center; justify-content: space-between; gap: 28px; padding: 30px; border-radius: 24px; color: white; background: #345f58; }
.learning-actions .learning-eyebrow { color: #bfe5d8; }
.learning-actions h2 { margin: 0; font-size: 1.8rem; }
.learning-actions p:last-child { max-width: 630px; margin: 8px 0 0; color: #dbece7; line-height: 1.5; }
.learning-actions > div:last-child { display: flex; flex: 0 0 auto; gap: 8px; }
.learning-actions a { padding: 10px 14px; border: 1px solid rgb(255 255 255 / 45%); border-radius: 99px; color: white; text-decoration: none; font-weight: 750; }
.learning-actions a.is-primary { border-color: var(--accent); background: var(--accent); }
@media (max-width: 850px) {
  .learning-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .learning-journeys > div { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .rule-grid--three, .trap-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .mode-selector { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .mode-explorer-tenses nav { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 620px) {
  .learning-summary { grid-template-columns: 1fr; }
  .learning-journeys > div { grid-template-columns: 1fr; }
  .learning-summary button { min-height: 105px; }
  .rule-section { padding: 20px; border-radius: 19px; }
  .rule-grid--three, .trap-grid, .mode-explorer-details { grid-template-columns: 1fr; }
  .mode-selector { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .mode-selector button:last-child:nth-child(odd) { grid-column: 1 / -1; }
  .mode-explorer-details section + section { border-top: 1px solid var(--line); border-left: 0; }
  .mode-explorer-tenses > header, .mode-explorer-actions { align-items: start; flex-direction: column; }
  .mode-explorer-tenses nav { grid-template-columns: 1fr; }
  .mode-explorer-actions a { width: 100%; box-sizing: border-box; text-align: center; }
  .trap-grid p { min-height: 0; }
  .rule-note, .learning-actions { align-items: start; flex-direction: column; }
  .learning-actions > div:last-child { width: 100%; flex-wrap: wrap; }
}
</style>
