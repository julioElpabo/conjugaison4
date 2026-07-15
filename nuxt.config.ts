// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    dbHost: process.env.NUXT_DB_HOST || process.env.DB_HOST,
    dbPort: Number(process.env.NUXT_DB_PORT || process.env.DB_PORT || 3306),
    dbName: process.env.NUXT_DB_NAME || process.env.DB_NAME,
    dbUser: process.env.NUXT_DB_USER || process.env.DB_USER,
    dbPassword: process.env.NUXT_DB_PASSWORD || process.env.DB_PASSWORD,
    sessionSecret: process.env.NUXT_SESSION_SECRET || process.env.SESSION_SECRET || process.env.DB_PASSWORD
  }
})
