// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/dark-theme.css'],
  devtools: { enabled: true },
  runtimeConfig: {
    dbHost: process.env.NUXT_DB_HOST || process.env.DB_HOST,
    dbPort: Number(process.env.NUXT_DB_PORT || process.env.DB_PORT || 3306),
    dbName: process.env.NUXT_DB_NAME || process.env.DB_NAME,
    dbUser: process.env.NUXT_DB_USER || process.env.DB_USER,
    dbPassword: process.env.NUXT_DB_PASSWORD || process.env.DB_PASSWORD,
    sessionSecret: process.env.NUXT_SESSION_SECRET || process.env.SESSION_SECRET || process.env.DB_PASSWORD,
    learnerSessionSecret: process.env.NUXT_LEARNER_SESSION_SECRET || process.env.LEARNER_SESSION_SECRET,
    turnstileSecretKey: process.env.NUXT_TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY,
    ga4PropertyId: process.env.NUXT_GA4_PROPERTY_ID || process.env.GA4_PROPERTY_ID || '309413461',
    ga4ClientEmail: process.env.NUXT_GA4_CLIENT_EMAIL || process.env.GA4_CLIENT_EMAIL,
    ga4PrivateKey: process.env.NUXT_GA4_PRIVATE_KEY || process.env.GA4_PRIVATE_KEY,
    ga4CredentialsFile: process.env.NUXT_GA4_CREDENTIALS_FILE
      || process.env.GA4_CREDENTIALS_FILE
      || 'cle-google/lobjet-366517-4ee1bb2ab062.json',
    public: {
      ga4MeasurementId: process.env.NUXT_PUBLIC_GA4_MEASUREMENT_ID || process.env.GA4_MEASUREMENT_ID || 'G-T0E6KRN0GZ',
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || '',
    },
  },
  nitro: {
    externals: {
      external: ['all-the-cities'],
      // Le plugin de migration importe un script versionné hors de server/.
      // Sans inlining, le bundle de développement conserve un chemin relatif
      // qui remonte jusqu'à /scripts au lieu de rester dans le projet.
      inline: [
        /[/\\]scripts[/\\]/,
        /[/\\]shared[/\\]data[/\\]verb-pilot-/,
      ],
    },
  },
  hooks: {
    'pages:extend'(pages) {
      const localePrefix = '/:locale(fr|de|en|it|es)'
      const localizePage = (page: typeof pages[number]): typeof pages[number] => ({
        ...page,
        name: page.name ? `localized-${page.name}` : undefined,
        path: page.path === '/' ? `${localePrefix}/` : `${localePrefix}${page.path}`,
        children: page.children?.map(child => ({
          ...child,
          name: child.name ? `localized-${child.name}` : undefined,
        })),
      })
      pages.push(...pages.map(localizePage))
    },
  },
})
