<script setup lang="ts">
import { MODE_LANDING_SLUGS, isModeLandingSlug, modeLandingPage } from '~~/shared/data/mode-landing-pages'
import { modeTensePages } from '~~/shared/data/mode-tense-pages'

const route = useRoute()
const { interfaceLocale, localePath } = useLanguagePreferences()
const slug = String(route.params.mode || '')

if (!isModeLandingSlug(slug)) {
  throw createError({ statusCode: 404, statusMessage: 'Mode introuvable' })
}

const page = computed(() => modeLandingPage(slug, interfaceLocale.value))
const modeNavigation = computed(() => MODE_LANDING_SLUGS.map(modeSlug => ({
  key: modeSlug,
  label: modeLandingPage(modeSlug, interfaceLocale.value).modeName,
  to: localePath(`/modes/${modeSlug}`),
})))
const navigationLabel = computed(() => ({
  fr: 'Les modes', de: 'Die Modi', en: 'French moods', it: 'I modi', es: 'Los modos',
}[interfaceLocale.value]))
const tenseItems = computed(() => modeTensePages(slug).map(tense => ({
  key: tense.slug,
  label: tense.label,
  to: localePath(tense.path),
})))
const exerciseUrl = computed(() => ({ path: localePath('/'), query: { mode: slug } }))

useHead(() => ({
  title: page.value.metaTitle,
  meta: [
    { name: 'description', content: page.value.description },
    { property: 'og:title', content: page.value.metaTitle },
    { property: 'og:description', content: page.value.description },
    { property: 'og:type', content: 'website' },
  ],
  script: [{
    key: 'mode-learning-resource',
    type: 'application/ld+json',
    textContent: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: page.value.title,
      description: page.value.description,
      learningResourceType: 'Lesson',
      educationalUse: ['Instruction', 'Practice'],
      inLanguage: interfaceLocale.value,
      teaches: `Conjugaison française : ${page.value.modeName}`,
      isAccessibleForFree: true,
    }),
  }],
}))

useSeoMeta({ twitterCard: 'summary' })
</script>

<template>
  <main class="mode-landing">
    <div class="mode-landing__navigation">
      <LearningSubnav :label="navigationLabel" :items="modeNavigation" :active-key="slug" />
    </div>

    <header class="mode-landing__hero">
      <p>{{ page.eyebrow }}</p>
      <h1>{{ page.title }}</h1>
      <NuxtLink :to="exerciseUrl">{{ page.ctaLabel }}</NuxtLink>
    </header>

    <div class="mode-landing__content">
      <section class="mode-purpose">
        <span>01</span>
        <div><h2>{{ page.purposeTitle }}</h2><p>{{ page.purpose }}</p></div>
      </section>

      <section class="mode-panel">
        <h2>{{ page.examplesTitle }}</h2>
        <ul><li v-for="example in page.examples" :key="example">{{ example }}</li></ul>
      </section>

      <section class="mode-panel mode-panel--watch">
        <h2>{{ page.watchTitle }}</h2>
        <ul><li v-for="item in page.watchItems" :key="item">{{ item }}</li></ul>
      </section>

      <section class="mode-tenses" :aria-labelledby="`${slug}-tenses-title`">
        <div>
          <p>02</p>
          <div>
            <h2 :id="`${slug}-tenses-title`">{{ page.tensesTitle }}</h2>
            <span>Choisis un temps pour comprendre son rôle précis, sa formation et les raisons de son emploi dans plusieurs contextes.</span>
          </div>
        </div>
        <LearningSubnav :label="page.modeName" :items="tenseItems" active-key="" />
      </section>

      <section class="mode-cta">
        <div><p>{{ page.eyebrow }}</p><h2>{{ page.ctaTitle }}</h2><span>{{ page.ctaText }}</span></div>
        <NuxtLink :to="exerciseUrl">{{ page.ctaLabel }} <span aria-hidden="true">→</span></NuxtLink>
      </section>
    </div>
  </main>
</template>

<style scoped>
.mode-landing { width: 100%; min-width: 0; max-width: 1120px; margin: 0 auto; color: var(--ink); font-family: "Funnel Sans", "Avenir Next", Avenir, system-ui, sans-serif; }
.mode-landing__navigation { display: grid; justify-items: center; }
.mode-landing__navigation :deep(.learning-subnav:first-child) { margin-bottom: 10px; }
.mode-landing__hero { max-width: 850px; margin: 14px auto 50px; text-align: center; }
.mode-landing__hero > p:first-child, .mode-cta p { margin: 0 0 8px; color: var(--accent); font-size: .76rem; font-weight: 850; letter-spacing: .14em; text-transform: uppercase; }
.mode-landing__hero h1 { margin: 0; color: #294c4b; font-size: clamp(2.2rem, 6vw, 4.55rem); letter-spacing: -.055em; line-height: 1.02; }
.mode-landing__hero > a, .mode-cta a { display: inline-flex; max-width: 100%; padding: 13px 19px; align-items: center; justify-content: center; border-radius: 12px; color: white; background: var(--brand); font-weight: 820; text-align: center; text-decoration: none; white-space: normal; box-shadow: 0 12px 28px rgb(41 76 75 / 18%); }
.mode-landing__hero > a { margin-top: 26px; }
.mode-landing__content { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.mode-landing h2 { margin: 0 0 13px; color: var(--brand-dark); font-size: clamp(1.35rem, 3vw, 2rem); letter-spacing: -.025em; }
.mode-purpose { display: grid; grid-column: 1 / -1; padding: clamp(24px, 5vw, 40px); border: 1px solid var(--line); border-radius: 24px; background: var(--surface); box-shadow: 0 16px 40px rgb(42 65 61 / 7%); }
.mode-purpose { grid-template-columns: auto 1fr; gap: 22px; }
.mode-purpose > span { color: var(--accent); font-weight: 900; }
.mode-purpose p { max-width: 850px; margin: 0; color: var(--muted); font-size: 1.04rem; line-height: 1.7; }
.mode-panel { padding: 26px; border: 1px solid var(--line); border-radius: 21px; background: color-mix(in srgb, var(--surface) 92%, var(--brand)); }
.mode-panel--watch { background: color-mix(in srgb, var(--surface) 91%, var(--accent)); }
.mode-panel ul { display: grid; margin: 0; padding: 0; gap: 11px; list-style: none; }
.mode-panel li { position: relative; padding-left: 25px; line-height: 1.55; }
.mode-panel li::before { position: absolute; top: .62em; left: 4px; width: 8px; height: 8px; border-radius: 50%; background: var(--accent); content: ""; }
.mode-tenses { grid-column: 1 / -1; margin-top: 12px; padding: clamp(24px, 5vw, 40px); border: 1px solid var(--line); border-radius: 24px; background: var(--surface); box-shadow: 0 16px 40px rgb(42 65 61 / 7%); }
.mode-tenses > div:first-child { display: grid; grid-template-columns: auto 1fr; gap: 22px; }
.mode-tenses > div:first-child > p { margin: 3px 0 0; color: var(--accent); font-weight: 900; }
.mode-tenses > div:first-child span { display: block; max-width: 780px; color: var(--muted); line-height: 1.65; }
.mode-tenses :deep(.learning-subnav) { margin: 24px 0 0; }
.mode-cta { display: flex; grid-column: 1 / -1; align-items: center; justify-content: space-between; margin-top: 12px; padding: clamp(25px, 5vw, 42px); border-radius: 24px; gap: 28px; background: #294c4b; }
.mode-cta h2 { color: white; }
.mode-cta div > span { display: block; max-width: 690px; color: rgb(255 255 255 / 78%); line-height: 1.6; }
.mode-cta a { flex: 0 0 auto; color: #294c4b; background: #f4c943; box-shadow: none; }
.mode-cta a span { margin-left: 6px; }
@media (max-width: 720px) {
  .mode-landing { width: min(100%, calc(100vw - 20px)); }
  .mode-landing__hero h1 { overflow-wrap: anywhere; }
  .mode-landing__content { grid-template-columns: 1fr; }
  .mode-purpose, .mode-tenses, .mode-cta { grid-column: auto; }
  .mode-cta { align-items: stretch; flex-direction: column; }
  .mode-cta a { width: 100%; }
}
</style>
