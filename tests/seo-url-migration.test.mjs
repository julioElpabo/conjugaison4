import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import { permanentLegacyRedirect } from '../shared/seo/legacy-redirects.ts'

describe('migration des anciennes URL pour le référencement', () => {
  it('redirige définitivement les anciennes pages françaises vers leur URL localisée', () => {
    assert.equal(permanentLegacyRedirect('/'), '/fr/')
    assert.equal(permanentLegacyRedirect('/accueil'), '/fr/')
    assert.equal(permanentLegacyRedirect('/apprendre'), '/fr/apprendre')
    assert.equal(permanentLegacyRedirect('/consulter/'), '/fr/consulter')
    assert.equal(permanentLegacyRedirect('/exercices'), '/fr/exercices')
    assert.equal(permanentLegacyRedirect('/modes/indicatif'), '/fr/modes/indicatif')
    assert.equal(permanentLegacyRedirect('/exercices/present'), '/fr/modes/indicatif/present')
  })

  it('supprime les anciennes pages accueil localisées sans toucher aux URL actuelles', () => {
    assert.equal(permanentLegacyRedirect('/fr/accueil'), '/fr/')
    assert.equal(permanentLegacyRedirect('/de/accueil/'), '/de/')
    assert.equal(permanentLegacyRedirect('/fr/exercices'), null)
    assert.equal(permanentLegacyRedirect('/signin'), null)
  })

  it('utilise un statut permanent et relie la page exercices depuis le pied de page', async () => {
    const middleware = await readFile(new URL('../app/middleware/locale.global.ts', import.meta.url), 'utf8')
    const layout = await readFile(new URL('../app/layouts/default.vue', import.meta.url), 'utf8')

    assert.match(middleware, /redirectCode:\s*301/u)
    assert.match(layout, /localePath\('\/exercices'\).*ui\('Modes et temps'\)/u)
  })
})
