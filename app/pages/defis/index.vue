<script setup lang="ts">
import { withDutchVariants } from '~~/shared/i18n/dutch-variants'

import type { ChallengePublicationSummary } from '~~/shared/types/challenge-publication'

const { interfaceLocale, localePath } = useLanguagePreferences()
const copy = computed(() => (withDutchVariants({
  fr: { eyebrow: 'Défis officiels', title: 'Défis de conjugaison prêts à jouer', intro: 'Choisis un entraînement préparé par TATITOTU et commence immédiatement.', empty: 'Aucun défi public n’est encore disponible dans cette langue.', start: 'Commencer ce défi' },
  de: { eyebrow: 'Offizielle Aufgaben', title: 'Spielfertige Konjugationsaufgaben', intro: 'Wählen Sie eine von TATITOTU vorbereitete Übung und legen Sie sofort los.', empty: 'In dieser Sprache ist noch keine öffentliche Aufgabe verfügbar.', start: 'Aufgabe starten' },
  en: { eyebrow: 'Official challenges', title: 'Ready-to-play conjugation challenges', intro: 'Choose an exercise prepared by TATITOTU and start immediately.', empty: 'No public challenge is available in this language yet.', start: 'Start this challenge' },
  it: { eyebrow: 'Sfide ufficiali', title: 'Sfide di coniugazione pronte da giocare', intro: 'Scegli un esercizio preparato da TATITOTU e inizia subito.', empty: 'Non è ancora disponibile alcuna sfida pubblica in questa lingua.', start: 'Inizia questa sfida' },
  es: { eyebrow: 'Retos oficiales', title: 'Retos de conjugación listos para jugar', intro: 'Elige un ejercicio preparado por TATITOTU y empieza inmediatamente.', empty: 'Todavía no hay ningún reto público disponible en este idioma.', start: 'Empezar este reto' }, nl: { eyebrow: "Officiële uitdagingen", title: "Kant-en-klare vervoegingsuitdagingen", intro: "Kies een oefening van TATITOTU en begin meteen.", empty: "Er is nog geen openbare uitdaging in deze taal beschikbaar.", start: "Start deze uitdaging" },
}))[interfaceLocale.value])
const { data: response } = await useFetch<{ publications: ChallengePublicationSummary[] }>('/api/challenge-publications', {
  query: computed(() => ({ locale: interfaceLocale.value })),
})
const publications = computed(() => response.value?.publications ?? [])
const groups = computed(() => {
  const grouped = new Map<string, { name: string, items: ChallengePublicationSummary[] }>()
  for (const publication of publications.value) {
    const group = grouped.get(publication.categorySlug) ?? { name: publication.categoryName, items: [] }
    group.items.push(publication)
    grouped.set(publication.categorySlug, group)
  }
  return [...grouped.entries()].map(([slug, group]) => ({ slug, ...group }))
})

const navigationLabel = computed(() => (withDutchVariants({
  fr: 'Aller directement à un groupe de défis',
  de: 'Direkt zu einer Aufgabengruppe springen',
  en: 'Jump directly to a challenge group',
  it: 'Vai direttamente a un gruppo di sfide',
  es: 'Ir directamente a un grupo de retos', nl: "Ga rechtstreeks naar een groep uitdagingen",
}))[interfaceLocale.value])
const backToTopLabel = computed(() => (withDutchVariants({
  fr: 'Revenir en haut de la page',
  de: 'Zum Seitenanfang zurückkehren',
  en: 'Back to the top of the page',
  it: 'Torna all’inizio della pagina',
  es: 'Volver al principio de la página', nl: "Terug naar boven",
}))[interfaceLocale.value])
const flePageLabel = computed(() => (withDutchVariants({
  fr: 'Découvrir les exercices de conjugaison FLE',
  de: 'FLE-Konjugationsübungen entdecken',
  en: 'Explore FLE French conjugation exercises',
  it: 'Scopri gli esercizi di coniugazione FLE',
  es: 'Descubre los ejercicios de conjugación FLE', nl: "Ontdek oefeningen op Franse vervoeging voor anderstaligen",
}))[interfaceLocale.value])
const showBackToTop = ref(false)
const backToTopBottom = ref(84)

function updateBackToTopVisibility() {
  showBackToTop.value = window.scrollY > 420
  const baseBottom = window.matchMedia('(max-width: 640px)').matches ? 72 : 84
  const footerTop = document.querySelector<HTMLElement>('.site-footer')?.getBoundingClientRect().top
  const visibleFooterHeight = footerTop === undefined ? 0 : Math.max(0, window.innerHeight - footerTop)
  backToTopBottom.value = Math.max(baseBottom, Math.ceil(visibleFooterHeight + 18))
}

function scrollToTop() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
}

onMounted(() => {
  updateBackToTopVisibility()
  window.addEventListener('scroll', updateBackToTopVisibility, { passive: true })
  window.addEventListener('resize', updateBackToTopVisibility, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateBackToTopVisibility)
  window.removeEventListener('resize', updateBackToTopVisibility)
})

function groupAnchor(slug: string) {
  return `groupe-defis-${slug}`
}

function scrollToGroup(event: MouseEvent, slug: string) {
  const anchor = groupAnchor(slug)
  const target = document.getElementById(anchor)
  if (!target) return
  event.preventDefault()
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const headerHeight = document.querySelector<HTMLElement>('.site-header')?.getBoundingClientRect().height ?? 0
  const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight - 20)
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${anchor}`)
  window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' })
}

useHead(() => ({
  title: `${copy.value.title} | TATITOTU`,
  titleTemplate: null,
  meta: [
    { name: 'description', content: copy.value.intro },
    { property: 'og:title', content: copy.value.title },
    { property: 'og:description', content: copy.value.intro },
  ],
}))
</script>

<template>
  <main class="challenge-library">
    <header>
      <p>{{ copy.eyebrow }}</p>
      <h1>{{ copy.title }}</h1>
      <span>{{ copy.intro }}</span>
    </header>
    <nav v-if="groups.length" class="challenge-library__navigation" :aria-label="navigationLabel">
      <p>{{ navigationLabel }}</p>
      <div>
        <a
          v-for="group in groups"
          :key="group.slug"
          :href="`#${groupAnchor(group.slug)}`"
          @click="scrollToGroup($event, group.slug)"
        >
          <span>{{ group.name }}</span>
          <small>{{ group.items.length }}</small>
        </a>
      </div>
    </nav>
    <p v-if="!groups.length" class="challenge-library__empty">{{ copy.empty }}</p>
    <section v-for="group in groups" :id="groupAnchor(group.slug)" :key="group.slug">
      <div class="challenge-library__section-heading">
        <h2>{{ group.name }}</h2>
        <NuxtLink v-if="group.slug === 'cif'" :to="localePath('/conjugaison-fle')">
          {{ flePageLabel }} <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>
      <div class="challenge-library__grid">
        <article v-for="publication in group.items" :key="publication.id">
          <h3>{{ publication.title }}</h3>
          <p>{{ publication.description }}</p>
          <NuxtLink :to="localePath(`/defis/${publication.slug}`)">{{ copy.start }} <span aria-hidden="true">→</span></NuxtLink>
        </article>
      </div>
    </section>
    <Transition name="back-to-top">
      <button
        v-if="showBackToTop"
        class="challenge-library__back-to-top"
        type="button"
        :aria-label="backToTopLabel"
        :title="backToTopLabel"
        :style="{ bottom: `${backToTopBottom}px` }"
        @click="scrollToTop"
      >
        <span aria-hidden="true">↑</span>
      </button>
    </Transition>
  </main>
</template>

<style scoped>
.challenge-library{display:grid;width:100%;max-width:1080px;margin:0 auto;padding:28px 16px 64px;gap:34px;color:var(--ink)}.challenge-library>header{max-width:860px;margin:0 auto;text-align:center}.challenge-library>header>p{margin:0 0 9px;color:var(--accent);font-size:.78rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.challenge-library h1{margin:0;color:var(--brand-dark);font-size:clamp(2.2rem,6vw,4.2rem);letter-spacing:.018em;line-height:1.08}.challenge-library>header>span{display:block;margin:20px auto 0;color:var(--muted);font-size:1.06rem;line-height:1.65}.challenge-library section{display:grid;gap:14px}.challenge-library h2{margin:0;color:var(--brand-dark)}.challenge-library__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}.challenge-library article,.challenge-library__empty{padding:22px;border:1px solid var(--line);border-radius:18px;background:var(--surface);box-shadow:0 10px 28px rgb(42 65 61 / 5%)}.challenge-library article h3{margin:0 0 9px;color:var(--brand-dark)}.challenge-library article p{color:var(--muted);line-height:1.6}.challenge-library article a{color:var(--accent);font-weight:850}.challenge-library__empty{text-align:center;color:var(--muted)}
.challenge-library{width:min(1080px,calc(100vw - 32px));box-sizing:border-box}
.challenge-library__navigation{display:grid;padding:18px 20px;border:1px solid var(--line);border-radius:18px;gap:12px;background:color-mix(in srgb,var(--surface) 92%,var(--brand-pale));box-shadow:0 10px 28px rgb(42 65 61 / 5%)}
.challenge-library__navigation>p{margin:0;color:var(--brand-dark);font-size:.86rem;font-weight:850}
.challenge-library__navigation>div{display:flex;flex-wrap:wrap;gap:9px}
.challenge-library__navigation a{display:inline-flex;min-height:42px;padding:8px 10px 8px 14px;align-items:center;gap:9px;border:1px solid color-mix(in srgb,var(--brand) 34%,var(--line));border-radius:999px;color:var(--brand-dark);background:var(--surface);font-weight:800;line-height:1.2;text-decoration:none;transition:border-color 160ms ease,background-color 160ms ease,box-shadow 160ms ease,transform 160ms ease}
.challenge-library__navigation a:hover{border-color:var(--brand);background:var(--brand-pale);box-shadow:0 7px 18px rgb(42 65 61 / 9%);transform:translateY(-1px)}
.challenge-library__navigation a:focus-visible{outline:3px solid color-mix(in srgb,var(--brand) 28%,transparent);outline-offset:2px}
.challenge-library__navigation small{display:grid;min-width:25px;height:25px;padding:0 7px;place-items:center;border-radius:999px;color:var(--brand-dark);background:var(--brand-pale);font-size:.7rem;font-weight:850}
.challenge-library section{scroll-margin-top:88px}
.challenge-library__section-heading{display:flex;align-items:baseline;justify-content:space-between;gap:14px}.challenge-library__section-heading>a{color:var(--accent);font-size:.86rem;font-weight:850;text-align:right}
.challenge-library__back-to-top{position:fixed;z-index:90;right:auto;bottom:84px;left:50%;display:grid;width:52px;height:52px;padding:0;place-items:center;transform:translateX(-50%);border:2px solid rgb(255 255 255 / 82%);border-radius:50%;color:white;background:var(--accent);box-shadow:0 8px 24px rgb(20 58 68 / 28%);cursor:pointer;font:900 1.75rem/1 system-ui,sans-serif;transition:bottom 100ms ease-out,background-color 160ms ease,box-shadow 160ms ease,transform 160ms ease,opacity 160ms ease}
.challenge-library__back-to-top>span{display:block;transform:translateY(-2px);text-align:center}
.challenge-library__back-to-top:hover{box-shadow:0 10px 28px rgb(20 58 68 / 38%);transform:translateX(-50%) translateY(-2px) scale(1.04)}
.challenge-library__back-to-top:focus-visible{outline:4px solid color-mix(in srgb,var(--accent) 30%,transparent);outline-offset:3px}
.back-to-top-enter-active,.back-to-top-leave-active{transition:opacity 160ms ease,transform 160ms ease}.back-to-top-enter-from,.back-to-top-leave-to{opacity:0;transform:translateX(-50%) translateY(10px) scale(.86)}
@media(max-width:1024px){.challenge-library section{scroll-margin-top:140px}}
@media(max-width:600px){.challenge-library__navigation{padding:16px}.challenge-library__navigation>div{display:grid;grid-template-columns:1fr}.challenge-library__navigation a{justify-content:space-between}.challenge-library__section-heading{display:grid}.challenge-library__section-heading>a{text-align:left}}
@media(max-width:640px){.challenge-library section{scroll-margin-top:180px}.challenge-library__back-to-top{bottom:72px;width:48px;height:48px}}
@media(prefers-reduced-motion:reduce){.challenge-library__navigation a,.challenge-library__back-to-top,.back-to-top-enter-active,.back-to-top-leave-active{transition:none}.challenge-library__navigation a:hover{transform:none}.challenge-library__back-to-top:hover{transform:translateX(-50%)}}
</style>
