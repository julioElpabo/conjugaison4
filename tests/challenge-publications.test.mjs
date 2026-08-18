import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

import {
  groupChallengePublicationAlternates,
  normalizeChallengePublicationSlug,
  parseChallengePublicationPayload,
  parsePublicationLocale,
  publicChallengeCategoryName,
  resolveChallengePublication,
} from '../server/services/challenge-publications.ts'
import {
  applyChallengePublicationDeployment,
  parseChallengePublicationDeployment,
} from '../server/services/challenge-publication-deployment.ts'
import { challengePresetDefinitions } from '../shared/data/challenge-presets.ts'

describe('publications SEO des défis officiels', () => {
  it('normalise les slugs sans accents ni séparateurs parasites', () => {
    assert.equal(normalizeChallengePublicationSlug('  Exercices : verbes en -GER ! '), 'exercices-verbes-en-ger')
    assert.equal(normalizeChallengePublicationSlug('Übungen für französische Verben'), 'ubungen-fur-franzosische-verben')
  })

  it('limite strictement les langues aux cinq interfaces du site', () => {
    assert.equal(parsePublicationLocale('de'), 'de')
    assert.throws(() => parsePublicationLocale('nl'), /Langue/u)
  })

  it('traduit les catégories publiques dans la langue de la page', () => {
    assert.equal(publicChallengeCategoryName('semantic', 'fr', 'Sens des verbes'), 'Sens des verbes')
    assert.equal(publicChallengeCategoryName('semantic', 'de', 'Sens des verbes'), 'Bedeutung der Verben')
    assert.equal(publicChallengeCategoryName('spelling', 'es', 'Difficultés'), 'Dificultades particulares')
    assert.equal(publicChallengeCategoryName('cif', 'fr', 'CIF'), 'Conjugaison FLE (français langue étrangère)')
  })

  it('autorise un brouillon incomplet mais exige un contenu complet pour publier', () => {
    const draft = parseChallengePublicationPayload({
      slug: '', title: '', metaTitle: '', description: '', metaDescription: '',
      isPublished: false,
    })
    assert.equal(draft.slug, null)
    assert.throws(() => parseChallengePublicationPayload({
      slug: 'exercices-test', title: 'Exercices', metaTitle: '', description: '', metaDescription: '',
      isPublished: true,
    }), /description/u)
    assert.throws(() => parseChallengePublicationPayload({
      slug: 'exercices-test', title: 'Exercices', metaTitle: '', description: 'Description', metaDescription: '',
      isPublished: true,
    }), /titre SEO/u)
  })

  it('fait automatiquement correspondre publication et indexation', () => {
    const draft = parseChallengePublicationPayload({
      slug: 'exercices-test', title: 'Exercices', metaTitle: '', description: 'Description', metaDescription: '',
      isPublished: false, isIndexable: true,
    })
    assert.equal(draft.isIndexable, false)
    const publication = parseChallengePublicationPayload({
      slug: 'exercices-test', title: 'Exercices', metaTitle: 'Exercices de conjugaison', description: 'Description', metaDescription: 'Description SEO',
      isPublished: true, isIndexable: false,
    })
    assert.equal(publication.isIndexable, true)
  })

  it('rejette les champs inconnus et les textes trop longs', () => {
    assert.throws(() => parseChallengePublicationPayload({
      slug: '', title: '', metaTitle: '', description: '', metaDescription: '',
      isPublished: false, isIndexable: false, privateNote: 'ne doit pas sortir',
    }), /Champs inconnus/u)
    assert.throws(() => parseChallengePublicationPayload({
      slug: '', title: 'x'.repeat(181), metaTitle: '', description: '', metaDescription: '',
      isPublished: false, isIndexable: false,
    }), /180/u)
  })

  it('regroupe toutes les traductions publiées', () => {
    const alternates = groupChallengePublicationAlternates([
      { locale: 'fr', slug: 'verbes-en-ger', isPublished: true, isIndexable: true },
      { locale: 'de', slug: 'verben-auf-ger', isPublished: true, isIndexable: true },
      { locale: 'en', slug: 'ger-verbs', isPublished: true, isIndexable: false },
      { locale: 'it', slug: null, isPublished: false, isIndexable: false },
    ])
    assert.deepEqual(alternates, [
      { locale: 'fr', path: '/fr/defis/verbes-en-ger' },
      { locale: 'de', path: '/de/defis/verben-auf-ger' },
      { locale: 'en', path: '/en/defis/ger-verbs' },
    ])
  })

  it('prévoit une migration idempotente séparée de la table des défis personnels', async () => {
    const migration = await readFile(new URL('../server/plugins/challenge-publications-migration.ts', import.meta.url), 'utf8')
    const deploymentPlugin = await readFile(new URL('../server/plugins/zz-challenge-publications-deployment.ts', import.meta.url), 'utf8')
    assert.match(migration, /CREATE TABLE IF NOT EXISTS challenge_preset_publications/u)
    assert.match(migration, /CREATE TABLE IF NOT EXISTS challenge_preset_publication_redirects/u)
    assert.match(migration, /CREATE TABLE IF NOT EXISTS challenge_preset_publication_deployments/u)
    assert.match(migration, /UNIQUE KEY uq_challenge_publication_preset_locale/u)
    assert.match(migration, /UNIQUE KEY uq_challenge_publication_locale_slug/u)
    assert.match(migration, /SET is_indexable=is_published/u)
    assert.doesNotMatch(migration, /ALTER TABLE defis/u)
    assert.match(deploymentPlugin, /applyChallengePublicationDeployment/u)
    assert.match(deploymentPlugin, /challenge-publication-deployment\.json/u)
    assert.match(deploymentPlugin, /hooks\.hook\('request'/u)
    assert.match(deploymentPlugin, /deploymentPromise = null/u)
  })

  it('déploie par clé stable et préserve par défaut une publication distante existante', async () => {
    const batch = parseChallengePublicationDeployment({
      schemaVersion: 1,
      batchId: 'challenge-publications-test-1',
      publications: [{
        presetKey: 'ger', locale: 'fr', slug: 'verbes-en-ger', title: 'Verbes en -ger',
        metaTitle: 'Exercices sur les verbes en -ger', description: 'Description pédagogique.',
        metaDescription: 'Exercices de conjugaison française sur les verbes en -ger.',
        isPublished: false, isIndexable: false, overwriteExisting: false,
      }],
    })
    assert.equal(batch.publications[0].presetKey, 'ger')
    assert.equal(batch.publications[0].overwriteExisting, false)
    assert.throws(() => parseChallengePublicationDeployment({
      schemaVersion: 1, batchId: null, publications: batch.publications,
    }), /identifiant/u)
  })

  it('versionne et publie les cinq langues de tous les défis préfabriqués', async () => {
    const deployment = JSON.parse(await readFile(
      new URL('../shared/data/challenge-publication-deployment.json', import.meta.url), 'utf8',
    ))
    assert.equal(deployment.schemaVersion, 1)
    assert.equal(deployment.publications.length, challengePresetDefinitions.length * 5)
    assert.deepEqual(
      [...new Set(deployment.publications.map(item => item.presetKey))].sort(),
      challengePresetDefinitions.map(item => item.id).sort(),
    )
    assert.deepEqual([...new Set(deployment.publications.map(item => item.locale))].sort(), ['de', 'en', 'es', 'fr', 'it'])
    assert.ok(deployment.publications.every(item => item.isPublished && item.isIndexable))
    const flePresetKeys = new Set(challengePresetDefinitions.filter(item => item.group === 'cif').map(item => item.id))
    assert.ok(deployment.publications.every(item => item.overwriteExisting === flePresetKeys.has(item.presetKey)))
    assert.equal(deployment.publications.filter(item => item.overwriteExisting).length, flePresetKeys.size * 5)
    assert.ok(deployment.publications.every(item => item.description.length >= 120 && item.description.length <= 320))
    assert.ok(deployment.publications.every(item => item.metaDescription.length <= 160))
    assert.equal(new Set(deployment.publications.map(item => `${item.locale}:${item.slug}`)).size, deployment.publications.length)
    const conjugationMarkers = {
      fr: /conjugaison/iu,
      de: /Konjugation/iu,
      en: /conjugation/iu,
      it: /coniugazione/iu,
      es: /conjugación/iu,
    }
    assert.ok(deployment.publications.every(item => conjugationMarkers[item.locale].test(item.title)))
    const frenchFlePublications = deployment.publications.filter(item => item.locale === 'fr' && flePresetKeys.has(item.presetKey))
    assert.ok(frenchFlePublications.every(item => /conjugaison FLE/iu.test(`${item.slug} ${item.title} ${item.metaTitle} ${item.description} ${item.metaDescription}`)))
    const exporter = await readFile(new URL('../scripts/export-challenge-publications.mjs', import.meta.url), 'utf8')
    assert.match(exporter, /preset\.preset_key AS presetKey/u)
    assert.match(exporter, /preservePublicationStatus \? Boolean\(row\.isPublished\) : false/u)
    assert.match(exporter, /overwriteExisting/u)
    assert.doesNotMatch(exporter, /\bdefis\b/u)
  })

  it('n’écrase pas une publication distante existante sans autorisation explicite', async () => {
    const statements = []
    const connection = {
      async beginTransaction() { statements.push('BEGIN') },
      async commit() { statements.push('COMMIT') },
      async rollback() { statements.push('ROLLBACK') },
      release() { statements.push('RELEASE') },
      async execute(sql) {
        statements.push(sql.replace(/\s+/gu, ' ').trim())
        if (sql.includes('challenge_preset_publication_deployments') && sql.includes('SELECT')) return [[]]
        if (sql.includes('FROM challenge_presets')) return [[{ id: 17 }]]
        if (sql.includes('FROM challenge_preset_publications')) return [[{ id: 99 }]]
        return [{ affectedRows: 1 }]
      },
    }
    const database = { async getConnection() { return connection } }
    const result = await applyChallengePublicationDeployment(database, {
      schemaVersion: 1,
      batchId: 'challenge-publications-preserve-test',
      publications: [{
        presetKey: 'ger', locale: 'fr', slug: 'verbes-en-ger', title: 'Verbes en -ger',
        metaTitle: 'Exercices sur les verbes en -ger', description: 'Description pédagogique.',
        metaDescription: 'Exercices de conjugaison française sur les verbes en -ger.',
        isPublished: false, isIndexable: false, overwriteExisting: false,
      }],
    })
    assert.deepEqual(result, { status: 'applied', inserted: 0, replaced: 0, preserved: 1 })
    assert.equal(statements.filter(statement => statement.includes('INSERT INTO challenge_preset_publications')).length, 0)
    assert.ok(statements.some(statement => statement.includes('INSERT INTO challenge_preset_publication_deployments')))
    assert.deepEqual(statements.slice(-2), ['COMMIT', 'RELEASE'])
  })

  it('résout un ancien slug et renvoie null pour un slug inconnu', async () => {
    const redirectDatabase = {
      calls: 0,
      async execute() {
        this.calls += 1
        return this.calls === 1 ? [[]] : [[{ publicationId: 7, locale: 'fr', slug: 'nouveau-slug' }]]
      },
    }
    assert.deepEqual(await resolveChallengePublication(redirectDatabase, 'fr', 'ancien-slug'), {
      kind: 'redirect', locale: 'fr', slug: 'nouveau-slug',
    })
    const emptyDatabase = { async execute() { return [[]] } }
    assert.equal(await resolveChallengePublication(emptyDatabase, 'fr', 'inconnu'), null)
  })

  it('câble les API, la route SSR, la bibliothèque et le sitemap dynamique', async () => {
    const files = await Promise.all([
      '../server/api/admin/challenge-presets/[id]/publications/index.get.ts',
      '../server/api/admin/challenge-presets/[id]/publications/[locale].put.ts',
      '../app/pages/defis/[slug].vue',
      '../app/pages/defis/index.vue',
      '../server/routes/sitemap.xml.get.ts',
    ].map(path => readFile(new URL(path, import.meta.url), 'utf8')))
    assert.match(files[0], /requireAdministrator/u)
    assert.match(files[1], /requireAdministrator/u)
    assert.match(files[1], /ChallengePublicationConflictError/u)
    assert.match(files[2], /redirectCode: 301/u)
    assert.match(files[2], /initial-preset-id/u)
    assert.match(files[2], /start-at-launch/u)
    assert.match(files[2], /:launch-title="publication\.title"/u)
    assert.match(files[2], /:launch-description="publication\.description"/u)
    assert.match(files[2], /:launch-edit-hint="editHint"/u)
    assert.match(files[2], /Les boutons/u)
    assert.doesNotMatch(files[2], /Un exercice adapté à ton objectif/u)
    assert.doesNotMatch(files[2], /Ce défi est déjà configuré/u)
    assert.doesNotMatch(files[2], /public-challenge__intro/u)
    assert.match(files[3], /api\/challenge-publications/u)
    assert.match(files[3], /challenge-library__navigation/u)
    assert.match(files[3], /groupe-defis-/u)
    assert.match(files[3], /querySelector<HTMLElement>\('\.site-header'\)/u)
    assert.match(files[3], /window\.scrollTo\(\{ top, behavior: reduceMotion \? 'auto' : 'smooth'/u)
    assert.match(files[3], /challenge-library__back-to-top/u)
    assert.match(files[3], /window\.scrollY > 420/u)
    assert.match(files[3], /window\.scrollTo\(\{ top: 0, behavior: reduceMotion \? 'auto' : 'smooth'/u)
    assert.match(files[3], /visibleFooterHeight \+ 18/u)
    assert.match(files[3], /:style="\{ bottom: `\$\{backToTopBottom\}px` \}"/u)
    assert.match(files[3], /prefers-reduced-motion: reduce/u)
    assert.match(files[4], /listPublishedChallengePublications/u)
    assert.match(files[4], /Impossible de charger les publications/u)
  })

  it('permet de resynchroniser l’éditeur avec les publications enregistrées en base', async () => {
    const adminPage = await readFile(new URL('../app/pages/admin/challenges.vue', import.meta.url), 'utf8')
    assert.match(adminPage, /reloadPublicationsFromDatabase/u)
    assert.match(adminPage, /Recharger les textes/u)
    assert.match(adminPage, /cancelPublicationAutosave\(\)/u)
  })

  it('publie une page dédiée à la conjugaison FLE et la relie à la bibliothèque', async () => {
    const [flePage, library, sitemap] = await Promise.all([
      readFile(new URL('../app/pages/conjugaison-fle.vue', import.meta.url), 'utf8'),
      readFile(new URL('../app/pages/defis/index.vue', import.meta.url), 'utf8'),
      readFile(new URL('../server/routes/sitemap.xml.get.ts', import.meta.url), 'utf8'),
    ])
    assert.match(flePage, /Exercices de conjugaison FLE gratuits et personnalisables/u)
    assert.match(flePage, /categorySlug === 'cif'/u)
    assert.match(flePage, /'@type': 'CollectionPage'/u)
    assert.match(flePage, /'@type': 'ItemList'/u)
    assert.match(library, /localePath\('\/conjugaison-fle'\)/u)
    assert.match(sitemap, /'\/conjugaison-fle'/u)
  })
})
