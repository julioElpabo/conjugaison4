import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const [page, phrasesRoute, shell, endpoint, updateEndpoint, migration] = await Promise.all([
  readFile(new URL('../app/pages/admin/literary-corpus.vue', import.meta.url), 'utf8'),
  readFile(new URL('../app/pages/admin/phrases.vue', import.meta.url), 'utf8'),
  readFile(new URL('../app/components/admin/AdminShell.vue', import.meta.url), 'utf8'),
  readFile(new URL('../server/api/admin/literary-corpus/index.get.ts', import.meta.url), 'utf8'),
  readFile(new URL('../server/api/admin/literary-corpus/[id].put.ts', import.meta.url), 'utf8'),
  readFile(new URL('../server/plugins/literary-corpus-migration.ts', import.meta.url), 'utf8'),
])

test('la navigation Verbes expose la page Phrases', () => {
  assert.match(shell, /label: 'Phrases', path: '\/admin\/phrases'/u)
  assert.match(phrasesRoute, /import PhrasesAdminPage from '.\/literary-corpus\.vue'/u)
  assert.match(phrasesRoute, /<PhrasesAdminPage\s*\/>/u)
  assert.match(page, /<h1>Phrases<\/h1>/u)
  assert.match(page, /const status = ref<ReviewStatus \| 'all'>\('candidate'\)/u)
  assert.match(endpoint, /: 'candidate'/u)
})

test('la liste permet une validation rapide et une navigation au clavier', () => {
  assert.match(page, /quickToggleStatus\(target\)/u)
  assert.match(page, /event\.key === 'ArrowDown' \|\| event\.key === 'ArrowUp'/u)
  assert.match(page, /event\.key\.toLocaleLowerCase\('fr'\) === 'x'/u)
  assert.match(page, /window\.addEventListener\('keydown', handleKeyboard\)/u)
  assert.match(page, /grid-template-columns: minmax\(460px, 1\.15fr\) minmax\(430px, 1fr\)/u)
})

test('quitter une candidate la valide avant de sélectionner la suivante', () => {
  assert.match(page, /previous\?\.reviewStatus === 'candidate'/u)
  assert.match(page, /await review\('validated', \{ quick: true, target: previous, selectAfter: id \}\)/u)
  assert.match(page, /@click="selectTarget\(target\.id\)"/u)
  assert.match(page, /↑↓ valider et parcourir · X rejeter/u)
})

test('les acquisitions restent candidates jusqu’à leur validation humaine', () => {
  assert.match(migration, /DEFAULT 'candidate'/u)
  assert.match(migration, /manual-review-workflow-v2/u)
  assert.match(migration, /WHERE review_status IN \('validated','reserve'\)/u)
  assert.doesNotMatch(migration, /validée\(s\) automatiquement/u)
})

test('les acquisitions écartent les combinaisons fréquentes et préservent les temps rares', () => {
  assert.match(migration, /FREQUENT_TENSE_QUOTAS/u)
  assert.match(migration, /\['indicatif:présent', 2\]/u)
  assert.match(migration, /\['indicatif:passé composé', 3\]/u)
  assert.match(migration, /combinaison fréquente déjà suffisamment représentée/u)
  assert.match(migration, /FREQUENT_TENSE_QUOTAS\.get\(`\$\{row\.mode\}:\$\{row\.tense\}`\)/u)
})

test('les acquisitions retirent le tiret de dialogue initial sans décaler la cible', () => {
  assert.match(migration, /target\.target_start=target\.target_start - 2/u)
  assert.match(migration, /sentence_text=SUBSTRING\(sentence_text,3\)/u)
  assert.match(migration, /\['» ', '— '\]/u)
  assert.match(migration, /WHERE sentence\.sentence_text LIKE \?/u)
})

test('la forme ciblée est éditable sans champ visuellement intrusif', () => {
  assert.match(page, /v-model="editableTargetText"/u)
  assert.match(page, /class="corpus-inline-edit"/u)
  assert.match(page, /@blur="saveTargetText"/u)
  assert.match(updateEndpoint, /target_text=COALESCE\(\?,target_text\)/u)
  assert.match(updateEndpoint, /Cette forme ne figure pas dans la phrase/u)
})

test('la phrase elle-même est éditable sans modifier son rendu', () => {
  assert.match(page, /class="corpus-editable-quote"/u)
  assert.match(page, /contenteditable="plaintext-only"/u)
  assert.match(page, /@blur="saveSentenceText"/u)
  assert.match(updateEndpoint, /UPDATE literary_sentences SET sentence_text=\?,word_count=\?,character_count=\?/u)
  assert.match(updateEndpoint, /La forme « \$\{form\} » doit rester présente dans la phrase/u)
})

test('la page permet de parcourir verbe, mode, temps et personne avec des compteurs', () => {
  assert.match(page, /v-model\.number="verbId"/u)
  assert.match(page, /chooseMode\(mode\.id\)/u)
  assert.match(page, /chooseTense\(tense\.id\)/u)
  assert.match(page, /choosePerson\(person\.id\)/u)
  assert.match(page, /<strong>\{\{ mode\.count \}\}<\/strong>/u)
  assert.match(endpoint, /verbs: verbOptions/u)
  assert.match(endpoint, /modes: modeOptions/u)
  assert.match(endpoint, /tenses: tenseOptions/u)
  assert.match(endpoint, /persons: personOptions/u)
  assert.match(endpoint, /Number\(right\.count > 0\) - Number\(left\.count > 0\)/u)
})

test('la page filtre les phrases par œuvre', () => {
  assert.match(page, /v-model\.number="sourceId"/u)
  assert.match(page, /Toutes les œuvres/u)
  assert.match(page, /sourceId: sourceId\.value \|\| undefined/u)
  assert.match(page, /watch\(\[status, confidence, sourceId\]/u)
  assert.match(endpoint, /clauses\.push\('sentence\.source_id=\?'\)/u)
  assert.match(endpoint, /sources: sources\.map/u)
  assert.match(endpoint, /source\.title AS label,source\.author/u)
})
