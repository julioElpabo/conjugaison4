import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

const read = path => readFile(new URL(path, import.meta.url), 'utf8')

describe('consentement aux statistiques', () => {
  it('présente le texte choisi et deux choix équivalents', async () => {
    const dialog = await read('../app/components/AnalyticsConsentDialog.vue')
    assert.match(dialog, /Ce site est entièrement non commercial\./u)
    assert.match(dialog, /il utilise des données anonymes uniquement/u)
    assert.match(dialog, /Aucune donnée n’est vendue\./u)
    assert.match(dialog, /Non merci/u)
    assert.match(dialog, /Accepter/u)
    assert.match(dialog, /v-for="language in languages"/u)
    assert.match(dialog, /@click="setInterfaceLocale\(language\.locale\)"/u)
    assert.match(dialog, /🇫🇷.*🇩🇪.*🇬🇧.*🇮🇹.*🇪🇸/su)
  })

  it('mémorise acceptation et refus et permet de rouvrir les préférences', async () => {
    const consent = await read('../app/composables/useAnalyticsConsent.ts')
    const layout = await read('../app/layouts/default.vue')
    assert.match(consent, /maxAge: 60 \* 60 \* 24 \* 365/u)
    assert.match(consent, /ANALYTICS_CONSENT_REFUSED/u)
    assert.match(layout, /@click="openPreferences"/u)
  })

  it('ne charge Google et les statistiques détaillées qu’après acceptation', async () => {
    const plugin = await read('../app/plugins/analytics.client.ts')
    const events = await read('../server/api/analytics/event.post.ts')
    const heartbeat = await read('../server/api/analytics/heartbeat.post.ts')
    assert.match(plugin, /consent\.value !== 'accepted'/u)
    assert.match(plugin, /allow_google_signals: false/u)
    assert.match(plugin, /allow_ad_personalization_signals: false/u)
    assert.match(events, /ANALYTICS_CONSENT_ACCEPTED/u)
    assert.match(heartbeat, /ANALYTICS_CONSENT_ACCEPTED/u)
  })

  it('compte les pages vues sans créer de session identifiable', async () => {
    const endpoint = await read('../server/api/analytics/page-view.post.ts')
    const migration = await read('../server/plugins/analytics-migrations.ts')
    assert.match(endpoint, /analytics_page_views/u)
    assert.doesNotMatch(endpoint, /analyticsSessionId/u)
    assert.match(endpoint, /deleteCookie\(event, 'tatitotu_session'/u)
    assert.match(migration, /CREATE TABLE IF NOT EXISTS analytics_page_views/u)
  })
})
