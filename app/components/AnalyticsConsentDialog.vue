<script setup lang="ts">
import { withDutchVariants } from '~~/shared/i18n/dutch-variants'

import type { AppLocale } from '~~/shared/i18n/locales'

const { interfaceLocale, setInterfaceLocale } = useLanguagePreferences()
const { consent, preferencesOpen, choose } = useAnalyticsConsent()
const { rememberPreferences, setRememberPreferences } = usePreferencePersistence()
const declineButton = ref<HTMLButtonElement | null>(null)

const copy: Record<AppLocale, { title: string, body: string, remember: string, cookies: string, choiceScope: string, decline: string, accept: string }> = withDutchVariants({
  fr: {
    title: 'Aidez-nous à améliorer le site',
    body: 'Ce site est entièrement non commercial. Avec votre accord, il utilise des données anonymes uniquement pour comprendre sa fréquentation et améliorer son fonctionnement. Aucune donnée n’est vendue.',
    remember: 'Mémoriser mes préférences sur ce navigateur',
    cookies: 'Enregistre vos choix de langue et de présentation avec des cookies et le stockage local.',
    choiceScope: 'Les boutons ci-dessous concernent uniquement les statistiques.',
    decline: 'Non merci',
    accept: 'Accepter',
  },
  de: {
    title: 'Helfen Sie uns, die Website zu verbessern',
    body: 'Diese Website ist vollständig nicht kommerziell. Mit Ihrer Zustimmung verwendet sie anonyme Daten ausschliesslich, um ihre Nutzung zu verstehen und ihre Funktionsweise zu verbessern. Es werden keine Daten verkauft.',
    remember: 'Meine Einstellungen in diesem Browser speichern',
    cookies: 'Speichert Ihre Sprach- und Darstellungseinstellungen mit Cookies und lokalem Speicher.',
    choiceScope: 'Die folgenden Schaltflächen betreffen nur die Statistik.',
    decline: 'Nein danke',
    accept: 'Akzeptieren',
  },
  en: {
    title: 'Help us improve the website',
    body: 'This website is entirely non-commercial. With your agreement, it uses anonymous data only to understand how often it is visited and to improve how it works. No data is sold.',
    remember: 'Remember my preferences in this browser',
    cookies: 'Saves your language and display choices using cookies and local storage.',
    choiceScope: 'The buttons below apply only to statistics.',
    decline: 'No thanks',
    accept: 'Accept',
  },
  it: {
    title: 'Aiutaci a migliorare il sito',
    body: 'Questo sito è interamente non commerciale. Con il tuo consenso, utilizza dati anonimi esclusivamente per comprenderne la frequentazione e migliorarne il funzionamento. Nessun dato viene venduto.',
    remember: 'Memorizzare le mie preferenze in questo browser',
    cookies: 'Salva le tue scelte di lingua e presentazione con i cookie e lo spazio di archiviazione locale.',
    choiceScope: 'I pulsanti qui sotto riguardano solo le statistiche.',
    decline: 'No, grazie',
    accept: 'Accetta',
  },
  es: {
    title: 'Ayúdanos a mejorar el sitio',
    body: 'Este sitio no tiene ningún fin comercial. Con tu consentimiento, utiliza datos anónimos únicamente para conocer su afluencia y mejorar su funcionamiento. No se vende ningún dato.',
    remember: 'Recordar mis preferencias en este navegador',
    cookies: 'Guarda tus elecciones de idioma y presentación con cookies y almacenamiento local.',
    choiceScope: 'Los botones siguientes se refieren únicamente a las estadísticas.',
    decline: 'No, gracias',
    accept: 'Aceptar',
  }, nl: {
    title: "Help ons de website te verbeteren",
    body: "Deze website is volledig niet-commercieel. Met jouw toestemming gebruikt hij anonieme gegevens, alleen om het aantal bezoeken te begrijpen en de werking te verbeteren. Er worden geen gegevens verkocht.",
    remember: 'Mijn voorkeuren onthouden in deze browser',
    cookies: 'Bewaart je taal- en weergavekeuzes met cookies en lokale opslag.',
    choiceScope: 'De onderstaande knoppen gelden alleen voor statistieken.',
    decline: "Nee, bedankt",
    accept: "Accepteren",
  },
})
const text = computed(() => copy[interfaceLocale.value])
const languages: Array<{ locale: AppLocale, flag: string, label: string }> = [
  { locale: 'fr', flag: '🇫🇷', label: 'Français' },
  { locale: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { locale: 'en', flag: '🇬🇧', label: 'English' },
  { locale: 'it', flag: '🇮🇹', label: 'Italiano' },
  { locale: 'es', flag: '🇪🇸', label: 'Español' },
  { locale: 'nl-NL', flag: '🇳🇱', label: 'Nederlands (Nederland)' },
  { locale: 'nl', flag: '🇧🇪', label: 'Nederlands (België)' },
]
const visible = computed(() => consent.value === null || preferencesOpen.value)

function updateRememberPreferences(event: Event) {
  setRememberPreferences((event.target as HTMLInputElement).checked)
}

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
        aria-describedby="analytics-consent-description analytics-consent-cookies analytics-consent-choice"
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
        <label class="analytics-consent-cookie-info">
          <input
            type="checkbox"
            :checked="rememberPreferences"
            aria-describedby="analytics-consent-cookies"
            @change="updateRememberPreferences"
          >
          <span>
            <strong>{{ text.remember }}</strong>
            <span id="analytics-consent-cookies">{{ text.cookies }}</span>
          </span>
        </label>
        <p id="analytics-consent-choice" class="analytics-consent-choice-scope">{{ text.choiceScope }}</p>
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
.analytics-consent-dialog {
  max-height: calc(100vh - 40px);
  max-height: calc(100dvh - 40px);
  overflow-y: auto;
}

.analytics-consent-cookie-info {
  display: flex;
  margin: 18px 0;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface-soft);
  align-items: flex-start;
  gap: 10px;
  color: var(--muted);
  cursor: pointer;
  font-size: .9rem;
  line-height: 1.45;
  text-align: left;
}

.analytics-consent-cookie-info input {
  width: 20px;
  height: 20px;
  margin: 2px 0 0;
  flex: 0 0 auto;
  accent-color: var(--brand);
}

.analytics-consent-cookie-info input:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}

.analytics-consent-cookie-info > span {
  min-width: 0;
}

.analytics-consent-cookie-info strong {
  display: block;
  margin-bottom: 4px;
  color: var(--ink);
}

.analytics-consent-cookie-info span span {
  display: block;
}

.analytics-consent-dialog .analytics-consent-choice-scope {
  margin: 0 0 12px;
  font-size: .86rem;
  line-height: 1.4;
}

.analytics-consent-languages {
  flex-wrap: wrap;
}

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
