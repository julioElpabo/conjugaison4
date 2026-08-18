import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

const read = path => readFile(new URL(path, import.meta.url), 'utf8')

describe('statistiques des comptes utilisateurs', () => {
  it('calcule les comptes, les actifs et les préférences de langue depuis la base', async () => {
    const endpoint = await read('../server/api/admin/analytics-users.get.ts')
    assert.match(endpoint, /FROM learner_accounts/u)
    assert.match(endpoint, /FROM learner_login_events/u)
    assert.match(endpoint, /FROM learner_sessions/u)
    assert.match(endpoint, /FROM learner_challenge_runs/u)
    assert.match(endpoint, /learner_preferences/u)
    assert.doesNotMatch(endpoint, /query\.activity/u)
    assert.match(endpoint, /occurred_at<DATE_ADD\(\?, INTERVAL 1 DAY\)/u)
  })

  it('compte une seule fois les utilisateurs ayant retravaillé uniquement leurs erreurs', async () => {
    const endpoint = await read('../server/api/admin/analytics-users.get.ts')
    assert.match(endpoint, /COUNT\(DISTINCT runs\.account_id\)/u)
    assert.match(endpoint, /runs\.is_review=1/u)
    assert.match(endpoint, /runs\.last_answered_at>=\?/u)
  })

  it('affiche l’onglet Comptes sans sélecteur redondant et les inscriptions en barres verticales', async () => {
    const page = await read('../app/pages/admin/charts.vue')
    const dashboard = await read('../app/components/admin/AdminUserUsageDashboard.vue')
    assert.match(page, /\{ id: 'accounts', label: 'Comptes', short: 'Connexions et fonctions' \}/u)
    assert.match(page, /activeTab === 'accounts'/u)
    assert.match(page, /analytics-users/u)
    assert.doesNotMatch(dashboard, /id="user-activity-window"/u)
    assert.match(dashboard, /Langue choisie par les utilisateurs/u)
    assert.match(dashboard, /title="Créations de comptes"/u)
    assert.match(dashboard, /kind="bar"/u)
    assert.match(dashboard, /y-unit="Nombre de comptes créés"/u)
    assert.match(dashboard, /Reprise de leurs erreurs/u)
  })
})
