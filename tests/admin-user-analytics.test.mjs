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
    assert.match(endpoint, /activityDays/u)
  })

  it('compte une seule fois les utilisateurs ayant retravaillé uniquement leurs erreurs', async () => {
    const endpoint = await read('../server/api/admin/analytics-users.get.ts')
    assert.match(endpoint, /COUNT\(DISTINCT runs\.account_id\)/u)
    assert.match(endpoint, /runs\.is_review=1/u)
    assert.match(endpoint, /runs\.last_answered_at>=\?/u)
  })

  it('affiche l’onglet, le sélecteur, le fromage des langues et la courbe des inscriptions', async () => {
    const page = await read('../app/pages/admin/charts.vue')
    const dashboard = await read('../app/components/admin/AdminUserUsageDashboard.vue')
    assert.match(page, />\s*Utilisateurs\s*</u)
    assert.match(page, /analytics-users/u)
    assert.match(dashboard, /id="user-activity-window"/u)
    assert.match(dashboard, /Langue choisie par les utilisateurs/u)
    assert.match(dashboard, /title="Créations de comptes"/u)
    assert.match(dashboard, /Reprise de leurs erreurs/u)
  })
})
