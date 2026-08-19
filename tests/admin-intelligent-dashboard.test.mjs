import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

const read = path => readFile(new URL(path, import.meta.url), 'utf8')

describe('dashboard intelligent des statistiques', () => {
  it('place Maintenant avant la vue d’ensemble et charge les trois sources de cette dernière', async () => {
    const page = await read('../app/pages/admin/charts.vue')
    const nowIndex = page.indexOf("{ id: 'now', label: 'Maintenant'")
    const overviewIndex = page.indexOf("{ id: 'overview', label: 'Vue d’ensemble'")
    assert.ok(nowIndex >= 0)
    assert.ok(overviewIndex > nowIndex)
    assert.match(page, /Promise\.all/u)
    assert.match(page, /analytics-usage/u)
    assert.match(page, /analytics-users/u)
    assert.match(page, /window: 'range'/u)
  })

  it('ouvre la vue d’ensemble par défaut et charge ses données après authentification', async () => {
    const page = await read('../app/pages/admin/charts.vue')
    assert.match(page, /const activeTab = ref<[^>]+>\('overview'\)/u)
    assert.match(page, /loadedForUserId = current\.id; void loadActiveTab\(\)/u)
  })

  it('propose Aujourd’hui avant 7 jours et le traduit en une période d’un jour', async () => {
    const page = await read('../app/pages/admin/charts.vue')
    const todayIndex = page.indexOf("{ days: 1, label: 'Aujourd’hui' }")
    const sevenDaysIndex = page.indexOf("{ days: 7, label: '7 jours' }")
    assert.ok(todayIndex >= 0)
    assert.ok(sevenDaysIndex > todayIndex)
    assert.match(page, /offsetDate\(-\(days - 1\)\)/u)
  })

  it('présente les indicateurs, le parcours, les tendances et les signaux automatiques', async () => {
    const component = await read('../app/components/admin/AdminIntelligentDashboard.vue')
    assert.match(component, /Apprenants actifs/u)
    assert.match(component, /Exercices lancés/u)
    assert.match(component, /Reprise des erreurs/u)
    assert.match(component, /Du passage à l’apprentissage/u)
    assert.match(component, /Analyse automatique/u)
    assert.match(component, /seriesTrend/u)
    assert.match(component, /insufficientData/u)
    assert.match(component, /Langues préférées/u)
    assert.match(component, /Langues des utilisateurs non connectés/u)
    const funnelIndex = component.indexOf('Du passage à l’apprentissage')
    const anonymousLanguagesIndex = component.indexOf('Langues des utilisateurs non connectés')
    const accountLanguagesIndex = component.indexOf('Langues préférées')
    assert.ok(anonymousLanguagesIndex > funnelIndex)
    assert.ok(accountLanguagesIndex > anonymousLanguagesIndex)
    assert.match(component, /Évolution du total des comptes/u)
  })

  it('compte les sessions anonymes ayant réellement lancé un exercice par langue', async () => {
    const endpoint = await read('../server/api/admin/analytics-users.get.ts')
    assert.match(endpoint, /events\.event_name='exercise_started'/u)
    assert.match(endpoint, /events\.actor_type='anonymous'/u)
    assert.match(endpoint, /COUNT\(DISTINCT events\.session_id\)/u)
    assert.match(endpoint, /sessions\.interface_locale IN \('fr','de','en','it','es'\)/u)
  })

  it('adapte les constats à la période et évite les conclusions sur un faible volume', async () => {
    const component = await read('../app/components/admin/AdminIntelligentDashboard.vue')
    assert.match(component, /Les constats changent avec la période/u)
    assert.match(component, /Volume encore faible/u)
    assert.match(component, /Premières tendances/u)
    assert.match(component, /Données exploitables/u)
  })

  it('arrête le rafraîchissement temps réel et ignore ses réponses tardives', async () => {
    const page = await read('../app/pages/admin/charts.vue')
    assert.match(page, /function chooseTab\(tab: StatsTab\) \{ activeTab\.value = tab; void loadActiveTab\(\); configureRefresh\(\) \}/u)
    assert.match(page, /const request = \+\+requestId/u)
    assert.match(page, /if \(request === requestId\)/u)
    assert.match(page, /if \(refreshTimer\) clearInterval\(refreshTimer\)/u)
    assert.match(page, /activeTab\.value === 'now'/u)
    assert.match(page, /Actualiser/u)
  })
})
