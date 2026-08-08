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
    assert.equal(permanentLegacyRedirect('/exercices'), '/fr/apprendre')
    assert.equal(permanentLegacyRedirect('/modes'), '/fr/apprendre')
    assert.equal(permanentLegacyRedirect('/modes/indicatif'), '/fr/apprendre')
    assert.equal(permanentLegacyRedirect('/modes/indicatif/present'), '/fr/indicatif/present')
    assert.equal(permanentLegacyRedirect('/fr/modes/indicatif'), '/fr/apprendre')
    assert.equal(permanentLegacyRedirect('/fr/modes'), '/fr/apprendre')
    assert.equal(permanentLegacyRedirect('/de/modes/indicatif/present'), '/de/indicatif/present')
    assert.equal(permanentLegacyRedirect('/exercices/present'), '/fr/indicatif/present')
  })

  it('supprime les anciennes pages accueil localisées sans toucher aux URL actuelles', () => {
    assert.equal(permanentLegacyRedirect('/fr/accueil'), '/fr/')
    assert.equal(permanentLegacyRedirect('/de/accueil/'), '/de/')
    assert.equal(permanentLegacyRedirect('/fr/exercices'), null)
    assert.equal(permanentLegacyRedirect('/signin'), null)
  })

  it('redirige définitivement la page exercices et la retire du pied de page et du sitemap', async () => {
    const middleware = await readFile(new URL('../app/middleware/locale.global.ts', import.meta.url), 'utf8')
    const layout = await readFile(new URL('../app/layouts/default.vue', import.meta.url), 'utf8')
    const exercisePage = await readFile(new URL('../app/pages/exercices/index.vue', import.meta.url), 'utf8')
    const sitemap = await readFile(new URL('../server/routes/sitemap.xml.get.ts', import.meta.url), 'utf8')

    assert.match(middleware, /redirectCode:\s*301/u)
    assert.match(exercisePage, /localePath\('\/apprendre'\)/u)
    assert.match(exercisePage, /redirectCode:\s*301/u)
    assert.doesNotMatch(layout, /localePath\('\/exercices'\)/u)
    assert.doesNotMatch(sitemap, /['"]\/exercices['"]/u)
  })

  it('conserve les fiches de temps sur des URL courtes sans accès aux pages générales des modes', async () => {
    const tensePage = await readFile(new URL('../app/pages/modes/[mode]/[temps].vue', import.meta.url), 'utf8')
    const tensePaths = await readFile(new URL('../shared/data/mode-tense-pages.ts', import.meta.url), 'utf8')
    const sitemap = await readFile(new URL('../server/routes/sitemap.xml.get.ts', import.meta.url), 'utf8')

    assert.match(tensePage, /Quand choisir/u)
    assert.match(tensePage, /localePath\('\/apprendre'\)/u)
    assert.doesNotMatch(tensePage, /tense-page__mode-context/u)
    assert.doesNotMatch(tensePage, /tense-page__summary/u)
    assert.doesNotMatch(tensePage, /copy\.formation/u)
    assert.match(tensePaths, /path: `\/\$\{mode\}\/\$\{tense\.slug\}`/u)
    assert.doesNotMatch(sitemap, /MODE_LANDING_SLUGS/u)
  })
})
