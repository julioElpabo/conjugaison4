import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import { permanentLegacyRedirect } from '../shared/seo/legacy-redirects.ts'

describe('migration des anciennes URL pour le référencement', () => {
  it('redirige définitivement les anciennes pages françaises vers leur URL localisée', () => {
    assert.equal(permanentLegacyRedirect('/'), '/fr/')
    assert.equal(permanentLegacyRedirect('/accueil'), '/fr/exercices-de-conjugaison')
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

  it('redirige les anciennes pages accueil vers la page d’exercices sans toucher à la racine localisée', () => {
    assert.equal(permanentLegacyRedirect('/fr/accueil'), '/fr/exercices-de-conjugaison')
    assert.equal(permanentLegacyRedirect('/de/accueil/'), '/de/')
    assert.equal(permanentLegacyRedirect('/fr/'), null)
    assert.equal(permanentLegacyRedirect('/fr/exercices'), null)
    assert.equal(permanentLegacyRedirect('/signin'), null)
  })

  it('publie la nouvelle page d’exercices avec ses métadonnées SEO', async () => {
    const page = await readFile(new URL('../app/pages/exercices-de-conjugaison.vue', import.meta.url), 'utf8')
    const sitemap = await readFile(new URL('../server/routes/sitemap.xml.get.ts', import.meta.url), 'utf8')

    assert.match(page, /Exercices de conjugaison française gratuits \| TATITOTU/u)
    assert.match(page, /titleTemplate: null/u)
    assert.match(page, /Exercices de conjugaison française gratuits, interactifs et personnalisables/u)
    assert.match(page, /home-heading="ui\('Exercices de conjugaison française'\)"/u)
    assert.match(page, /'@type': 'LearningResource'/u)
    assert.match(sitemap, /'\/exercices-de-conjugaison'/u)
    assert.doesNotMatch(sitemap, /['"]\/accueil['"]/u)
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

  it('décrit clairement les exercices dans le contenu visible de l’accueil', async () => {
    const wizard = await readFile(new URL('../app/components/challenge/WizardChallengeWorkspace.vue', import.meta.url), 'utf8')

    assert.match(wizard, /<h1 v-if="currentStep === 0" class="wizard-hero__subtitle">\{\{ props\.homeHeading \|\| ui\('Exercices de conjugaison française, gratuits et sans publicité'\) \}\}<\/h1>/u)
    assert.match(wizard, /class="wizard-home__seo-intro"/u)
    assert.match(wizard, /exercices de conjugaison française entièrement gratuits, interactifs et personnalisables/u)
    assert.match(wizard, /dialogue avec un coach virtuel qui t’aide pour chaque question/u)
    assert.match(wizard, /Tes propres exercices peuvent être partagés avec tes élèves/u)
    assert.match(wizard, /partager leurs bilans pour un meilleur suivi/u)
    assert.match(wizard, /conjugaison complète des verbes français/u)
  })

  it('présente l’accueil comme une ressource internationale dans ses métadonnées', async () => {
    const home = await readFile(new URL('../app/pages/index.vue', import.meta.url), 'utf8')

    assert.match(home, /outil gratuit et multilingue/u)
    assert.match(home, /quel que soit le pays/u)
    assert.match(home, /'@type': 'LearningResource'/u)
    assert.match(home, /isAccessibleForFree: true/u)
    assert.match(home, /inLanguage: interfaceLocale\.value/u)
  })
})
