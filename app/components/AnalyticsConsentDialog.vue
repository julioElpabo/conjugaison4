<script setup lang="ts">
import type { AppLocale } from '~~/shared/i18n/locales'

const { interfaceLocale, setInterfaceLocale } = useLanguagePreferences()
const { consent, preferencesOpen, choose } = useAnalyticsConsent()
const declineButton = ref<HTMLButtonElement | null>(null)

const copy: Record<AppLocale, { title: string, body: string, decline: string, accept: string }> = {
  fr: {
    title: 'Aidez-nous à améliorer le site',
    body: 'Ce site est entièrement non commercial. Avec votre accord, il utilise des données anonymes uniquement pour comprendre sa fréquentation et améliorer son fonctionnement. Aucune donnée n’est vendue.',
    decline: 'Non merci',
    accept: 'Accepter',
  },
  de: {
    title: 'Helfen Sie uns, die Website zu verbessern',
    body: 'Diese Website ist vollständig nicht kommerziell. Mit Ihrer Zustimmung verwendet sie anonyme Daten ausschliesslich, um ihre Nutzung zu verstehen und ihre Funktionsweise zu verbessern. Es werden keine Daten verkauft.',
    decline: 'Nein danke',
    accept: 'Akzeptieren',
  },
  en: {
    title: 'Help us improve the website',
    body: 'This website is entirely non-commercial. With your agreement, it uses anonymous data only to understand how often it is visited and to improve how it works. No data is sold.',
    decline: 'No thanks',
    accept: 'Accept',
  },
  it: {
    title: 'Aiutaci a migliorare il sito',
    body: 'Questo sito è interamente non commerciale. Con il tuo consenso, utilizza dati anonimi esclusivamente per comprenderne la frequentazione e migliorarne il funzionamento. Nessun dato viene venduto.',
    decline: 'No, grazie',
    accept: 'Accetta',
  },
  es: {
    title: 'Ayúdanos a mejorar el sitio',
    body: 'Este sitio no tiene ningún fin comercial. Con tu consentimiento, utiliza datos anónimos únicamente para conocer su afluencia y mejorar su funcionamiento. No se vende ningún dato.',
    decline: 'No, gracias',
    accept: 'Aceptar',
  },
}
const text = computed(() => copy[interfaceLocale.value])
const languages: Array<{ locale: AppLocale, flag: string, label: string }> = [
  { locale: 'fr', flag: '🇫🇷', label: 'Français' },
  { locale: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { locale: 'en', flag: '🇬🇧', label: 'English' },
  { locale: 'it', flag: '🇮🇹', label: 'Italiano' },
  { locale: 'es', flag: '🇪🇸', label: 'Español' },
]
const visible = computed(() => consent.value === null || preferencesOpen.value)

watch(visible, async (isVisible) => {
  if (!isVisible) return
  await nextTick()
  declineButton.value?.focus()
}, { immediate: true })
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="analytics-consent-backdrop">
      <section
        class="analytics-consent-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="analytics-consent-title"
        aria-describedby="analytics-consent-description"
      >
        <div class="analytics-consent-languages" role="group" aria-label="Language · Langue">
          <button
            v-for="language in languages"
            :key="language.locale"
            type="button"
            :class="{ 'is-active': interfaceLocale === language.locale }"
            :aria-label="language.label"
            :aria-pressed="interfaceLocale === language.locale"
            :title="language.label"
            @click="setInterfaceLocale(language.locale)"
          >
            <span aria-hidden="true">{{ language.flag }}</span>
          </button>
        </div>
        <h2 id="analytics-consent-title">{{ text.title }}</h2>
        <p id="analytics-consent-description">{{ text.body }}</p>
        <div class="analytics-consent-actions">
          <button ref="declineButton" type="button" class="analytics-consent-decline" @click="choose('refused')">
            {{ text.decline }}
          </button>
          <button type="button" class="analytics-consent-accept" @click="choose('accepted')">
            {{ text.accept }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.analytics-consent-backdrop{position:fixed;z-index:10000;inset:0;display:grid;padding:20px;place-items:center;background:rgb(18 38 46 / 62%);backdrop-filter:blur(5px)}
.analytics-consent-dialog{width:min(560px,100%);padding:clamp(28px,6vw,44px);color:var(--ink);border:2px solid #9bcbd5;border-radius:24px;background:var(--surface);box-shadow:0 28px 80px rgb(8 28 35 / 38%);text-align:center}
.analytics-consent-languages{display:flex;margin:0 0 20px;justify-content:center;gap:7px}
.analytics-consent-languages button{display:grid;width:36px;height:32px;padding:0;place-items:center;border:1px solid var(--line);border-radius:9px;background:var(--surface-soft);cursor:pointer;font-size:1.15rem;line-height:1;transition:border-color 150ms ease,background-color 150ms ease,transform 150ms ease}
.analytics-consent-languages button:hover{border-color:var(--brand);transform:translateY(-1px)}
.analytics-consent-languages button.is-active{border-color:var(--brand);background:color-mix(in srgb,var(--brand) 14%,var(--surface));box-shadow:0 0 0 2px color-mix(in srgb,var(--brand) 20%,transparent)}
.analytics-consent-languages button:focus-visible{outline:3px solid rgb(229 139 43 / 50%);outline-offset:2px}
.analytics-consent-dialog h2{margin:0;color:var(--brand-dark);font-size:clamp(1.65rem,5vw,2.25rem)}
.analytics-consent-dialog p{margin:18px 0 30px;color:var(--muted);font-size:1.08rem;font-weight:600;line-height:1.6}
.analytics-consent-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.analytics-consent-actions button{min-height:52px;padding:12px 18px;border:2px solid var(--brand);border-radius:12px;cursor:pointer;font:inherit;font-weight:850}
.analytics-consent-decline{color:var(--brand-dark);background:var(--surface)}
.analytics-consent-accept{color:white;background:var(--brand)}
.analytics-consent-actions button:focus-visible{outline:4px solid rgb(229 139 43 / 50%);outline-offset:3px}
:global(:root[data-theme='dark']) .analytics-consent-backdrop{background:rgb(2 12 19 / 78%)}
:global(:root[data-theme='dark']) .analytics-consent-dialog{border-color:#527b7d;box-shadow:0 30px 90px rgb(0 0 0 / 62%)}
:global(:root[data-theme='dark']) .analytics-consent-accept{color:#092d2b;background:#82c9c0;border-color:#82c9c0}
@media(max-width:520px){.analytics-consent-actions{grid-template-columns:1fr}.analytics-consent-dialog{text-align:left}.analytics-consent-languages{justify-content:flex-start}.analytics-consent-actions button{text-align:center}}
</style>
