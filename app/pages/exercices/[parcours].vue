<script setup lang="ts">
import { exerciseLandingPage, isExerciseLandingSlug } from '~~/shared/data/exercise-landing-pages'
import { MODE_LANDING_SLUGS, modeLandingPage } from '~~/shared/data/mode-landing-pages'
import { modeTensePages } from '~~/shared/data/mode-tense-pages'
import { tenseGroupGuide } from '~~/shared/data/tense-group-guides'

const route = useRoute()
const { interfaceLocale, localePath } = useLanguagePreferences()
const slug = String(route.params.parcours || '')

if (!isExerciseLandingSlug(slug)) {
  throw createError({ statusCode: 404, statusMessage: 'Parcours introuvable' })
}

const page = computed(() => exerciseLandingPage(slug, interfaceLocale.value))
const groupGuide = computed(() => tenseGroupGuide(slug, interfaceLocale.value))
const modeNavigation = computed(() => MODE_LANDING_SLUGS.map(modeSlug => ({
  key: modeSlug,
  label: modeLandingPage(modeSlug, interfaceLocale.value).modeName,
  to: localePath(`/modes/${modeSlug}`),
})))
const tenseNavigation = computed(() => modeTensePages('indicatif').map(tense => ({
  key: tense.slug,
  label: tense.label,
  to: localePath(tense.path),
})))
const navigationLabels = computed(() => ({
  fr: { modes: 'Les modes', tenses: 'indicatif' },
  de: { modes: 'Die Modi', tenses: 'indicatif' },
  en: { modes: 'French moods', tenses: 'indicatif' },
  it: { modes: 'I modi', tenses: 'indicatif' },
  es: { modes: 'Los modos', tenses: 'indicatif' },
}[interfaceLocale.value]))
const exerciseUrl = computed(() => ({
  path: localePath('/'),
  query: { parcours: slug },
}))

useHead(() => ({
  title: page.value.metaTitle,
  meta: [
    { name: 'description', content: page.value.description },
    { property: 'og:title', content: page.value.metaTitle },
    { property: 'og:description', content: page.value.description },
    { property: 'og:type', content: 'website' },
  ],
}))

useSeoMeta({
  twitterCard: 'summary',
})

const learningResource = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: page.value.title,
  description: page.value.description,
  learningResourceType: 'Exercise',
  educationalUse: 'Practice',
  inLanguage: interfaceLocale.value,
  teaches: `Conjugaison française : ${page.value.tenseName}`,
  isAccessibleForFree: true,
}))

useHead(() => ({
  script: [{
    key: 'exercise-learning-resource',
    type: 'application/ld+json',
    textContent: JSON.stringify(learningResource.value),
  }],
}))
</script>

<template>
  <main class="exercise-landing">
    <div class="exercise-landing__navigation">
      <LearningSubnav :label="navigationLabels.modes" :items="modeNavigation" active-key="indicatif" />
      <LearningSubnav :label="navigationLabels.tenses" :items="tenseNavigation" :active-key="slug" />
    </div>

    <header class="exercise-landing__hero">
      <p>{{ page.eyebrow }}</p>
      <h1>{{ page.title }}</h1>
      <p>{{ page.description }}</p>
      <NuxtLink class="exercise-landing__primary" :to="exerciseUrl">{{ page.ctaLabel }}</NuxtLink>
    </header>

    <div class="exercise-landing__content">
      <section class="exercise-landing__rule">
        <p class="exercise-landing__number">01</p>
        <div>
          <h2>{{ page.ruleTitle }}</h2>
          <p>{{ page.rule }}</p>
        </div>
      </section>

      <section class="exercise-landing__cards" :aria-labelledby="`${slug}-examples`">
        <h2 :id="`${slug}-examples`">{{ page.examplesTitle }}</h2>
        <ul>
          <li v-for="example in page.examples" :key="example">{{ example }}</li>
        </ul>
      </section>

      <section class="exercise-landing__cards exercise-landing__cards--watch" :aria-labelledby="`${slug}-watch`">
        <h2 :id="`${slug}-watch`">{{ page.watchTitle }}</h2>
        <ul>
          <li v-for="item in page.watchItems" :key="item">{{ item }}</li>
        </ul>
      </section>

      <section class="group-guide" :aria-labelledby="`${slug}-groups`">
        <header>
          <p class="exercise-landing__number">02</p>
          <div>
            <h2 :id="`${slug}-groups`">{{ groupGuide.title }}</h2>
            <p>{{ groupGuide.intro }}</p>
          </div>
        </header>
        <div class="group-guide__grid">
          <article v-for="group in groupGuide.groups" :key="group.label">
            <header><span>{{ group.label }}</span><strong>{{ group.model }}</strong></header>
            <p>{{ group.explanation }}</p>
            <code>{{ group.formula }}</code>
            <ul>
              <li v-for="form in group.forms" :key="form">{{ form }}</li>
            </ul>
            <small>{{ group.note }}</small>
          </article>
        </div>
        <aside>
          <h3>{{ groupGuide.specialTitle }}</h3>
          <ul><li v-for="item in groupGuide.specialCases" :key="item">{{ item }}</li></ul>
        </aside>
      </section>

      <section class="exercise-landing__cta">
        <div>
          <p>{{ page.eyebrow }}</p>
          <h2>{{ page.ctaTitle }}</h2>
          <span>{{ page.ctaText }}</span>
        </div>
        <NuxtLink :to="exerciseUrl">{{ page.ctaLabel }} <span aria-hidden="true">→</span></NuxtLink>
      </section>
    </div>
  </main>
</template>

<style scoped>
.exercise-landing { width: 100%; min-width: 0; max-width: 1120px; margin: 0 auto; color: var(--ink); font-family: "Funnel Sans", "Avenir Next", Avenir, system-ui, sans-serif; }
.exercise-landing__navigation { display: grid; justify-items: center; }
.exercise-landing__navigation :deep(.learning-subnav:first-child) { margin-bottom: 10px; }
.exercise-landing__hero { max-width: 850px; margin: 14px auto 54px; text-align: center; }
.exercise-landing__hero > p:first-child, .exercise-landing__cta p { margin: 0 0 8px; color: var(--accent); font-size: .76rem; font-weight: 850; letter-spacing: .14em; text-transform: uppercase; }
.exercise-landing__hero h1 { margin: 0; color: #294c4b; font-size: clamp(2.25rem, 6vw, 4.65rem); letter-spacing: -.055em; line-height: 1.02; }
.exercise-landing__hero > p:nth-of-type(2) { max-width: 720px; margin: 22px auto 28px; color: var(--muted); font-size: 1.12rem; line-height: 1.7; }
.exercise-landing__primary, .exercise-landing__cta a { display: inline-flex; max-width: 100%; align-items: center; justify-content: center; padding: 13px 19px; color: white; border-radius: 12px; background: var(--brand); font-weight: 820; text-align: center; text-decoration: none; white-space: normal; box-shadow: 0 12px 28px rgb(41 76 75 / 18%); }
.exercise-landing__primary:hover, .exercise-landing__cta a:hover { background: var(--brand-dark); transform: translateY(-1px); }
.exercise-landing__content { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.exercise-landing__rule { display: grid; grid-column: 1 / -1; grid-template-columns: auto 1fr; padding: clamp(24px, 5vw, 42px); border: 1px solid var(--line); border-radius: 24px; gap: 24px; background: rgb(255 255 255 / 88%); box-shadow: 0 16px 40px rgb(42 65 61 / 7%); }
.exercise-landing__number { margin: 0; color: var(--accent); font-size: 1rem; font-weight: 900; }
.exercise-landing h2 { margin: 0 0 13px; color: var(--brand-dark); font-size: clamp(1.35rem, 3vw, 2rem); letter-spacing: -.025em; }
.exercise-landing__rule div > p { max-width: 820px; margin: 0; color: var(--muted); font-size: 1.04rem; line-height: 1.7; }
.exercise-landing__cards { padding: 26px; border: 1px solid var(--line); border-radius: 21px; background: color-mix(in srgb, var(--surface) 92%, var(--brand)); }
.exercise-landing__cards--watch { background: color-mix(in srgb, var(--surface) 91%, var(--accent)); }
.exercise-landing__cards ul { display: grid; margin: 0; padding: 0; gap: 11px; list-style: none; }
.exercise-landing__cards li { position: relative; padding-left: 25px; color: var(--ink); line-height: 1.55; }
.exercise-landing__cards li::before { position: absolute; top: .62em; left: 4px; width: 8px; height: 8px; border-radius: 50%; background: var(--accent); content: ""; }
.group-guide { display: grid; grid-column: 1 / -1; margin-top: 12px; padding: clamp(24px, 5vw, 42px); border: 1px solid var(--line); border-radius: 24px; gap: 24px; background: var(--surface); box-shadow: 0 16px 40px rgb(42 65 61 / 7%); }
.group-guide > header { display: grid; grid-template-columns: auto 1fr; gap: 20px; }
.group-guide > header p:last-child { max-width: 850px; margin: 0; color: var(--muted); line-height: 1.65; }
.group-guide__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.group-guide__grid article { display: flex; min-width: 0; padding: 20px; flex-direction: column; border: 1px solid var(--line); border-radius: 18px; background: var(--surface-soft); }
.group-guide__grid article > header { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.group-guide__grid article > header span { color: var(--brand-dark); font-size: 1.08rem; font-weight: 900; }
.group-guide__grid article > header strong { color: var(--accent); font-style: italic; }
.group-guide__grid article > p { min-height: 112px; color: var(--muted); line-height: 1.55; }
.group-guide__grid code { display: block; min-height: 58px; padding: 10px 11px; border-radius: 10px; color: var(--brand-dark); background: color-mix(in srgb, var(--surface) 78%, var(--brand)); font: 750 .81rem/1.45 ui-monospace, SFMono-Regular, Menlo, monospace; white-space: normal; }
.group-guide__grid ul { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 16px 0; padding: 0; gap: 6px 10px; list-style: none; }
.group-guide__grid li { font-size: .86rem; line-height: 1.35; }
.group-guide__grid small { margin-top: auto; padding-top: 13px; border-top: 1px solid var(--line); color: var(--muted); font-size: .8rem; line-height: 1.45; }
.group-guide > aside { padding: 20px 22px; border-radius: 17px; color: var(--ink); background: color-mix(in srgb, var(--surface) 89%, var(--accent)); }
.group-guide > aside h3 { margin: 0 0 11px; color: var(--brand-dark); }
.group-guide > aside ul { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 0; padding-left: 20px; gap: 8px 28px; }
.group-guide > aside li { line-height: 1.5; }
.exercise-landing__cta { display: flex; grid-column: 1 / -1; align-items: center; justify-content: space-between; margin-top: 12px; padding: clamp(25px, 5vw, 42px); border-radius: 24px; gap: 28px; background: #294c4b; }
.exercise-landing__cta h2 { color: white; }
.exercise-landing__cta span { display: block; max-width: 690px; color: rgb(255 255 255 / 78%); line-height: 1.6; }
.exercise-landing__cta a { flex: 0 0 auto; color: #294c4b; background: #f4c943; box-shadow: none; }
.exercise-landing__cta a span { display: inline; margin-left: 6px; color: inherit; }
@media (max-width: 720px) {
  .exercise-landing { width: min(100%, calc(100vw - 20px)); }
  .exercise-landing__hero { margin-bottom: 34px; }
  .exercise-landing__hero h1 { overflow-wrap: anywhere; }
  .exercise-landing__content { grid-template-columns: 1fr; }
  .exercise-landing__rule, .group-guide, .exercise-landing__cta { grid-column: auto; }
  .group-guide__grid, .group-guide > aside ul { grid-template-columns: 1fr; }
  .group-guide__grid article > p { min-height: 0; }
  .exercise-landing__cta { align-items: stretch; flex-direction: column; }
  .exercise-landing__cta a { width: 100%; }
}
</style>
