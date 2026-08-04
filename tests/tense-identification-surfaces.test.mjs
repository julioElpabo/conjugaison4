import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const [options, wizard, classic, chat, print, questionnaire] = await Promise.all([
  readFile(new URL('../app/components/challenge/ChallengeOptions.vue', import.meta.url), 'utf8'),
  readFile(new URL('../app/components/challenge/WizardChallengeWorkspace.vue', import.meta.url), 'utf8'),
  readFile(new URL('../app/components/exercise/ClassicExercise.vue', import.meta.url), 'utf8'),
  readFile(new URL('../app/components/exercise/ChatExercise.vue', import.meta.url), 'utf8'),
  readFile(new URL('../shared/utils/print-question.ts', import.meta.url), 'utf8'),
  readFile(new URL('../server/services/questionnaire.ts', import.meta.url), 'utf8'),
])

test('l’étape 3 propose les verbes sélectionnés ou les citations de tout le corpus', () => {
  assert.match(options, /Avec mes verbes/u)
  assert.match(options, /Avec n’importe quel verbe/u)
  assert.match(options, /Construits avec des phrases littéraires/u)
  assert.doesNotMatch(options, /Phrases issues des citations validées/u)
  assert.match(options, /segmented-control--stacked input:checked \+ span/u)
  assert.match(options, /updateIdentificationSource/u)
  assert.doesNotMatch(options, /Registre des phrases/u)
  assert.doesNotMatch(options, /updateLiteraryRegister/u)
  assert.match(wizard, /:identification-source="challenge\.identificationSource"/u)
  assert.match(wizard, /@update-identification-source="challenge\.identificationSource = \$event/u)
  assert.match(questionnaire, /request\.identificationSource === 'literary-corpus'/u)
  assert.match(questionnaire, /validatedLiteraryCitations\(null, finiteIds\)/u)
  assert.match(questionnaire, /eligibleRows = usesLiteraryCitations/u)
  assert.match(questionnaire, /GROUP BY covered\.tense_id/u)
  assert.match(questionnaire, /source\.language_register/u)
  assert.match(questionnaire, /exactLiteraryClause/u)
})

test('le choix du mode et du temps révèle le menu des verbes par un défilement fluide', () => {
  assert.match(options, /ref="identificationSourceFieldset"/u)
  assert.match(options, /scrollIntoView\(\{/u)
  assert.match(options, /behavior: window\.matchMedia[\s\S]*\? 'auto' : 'smooth'/u)
  assert.match(options, /<legend class="sr-only">Choix des verbes<\/legend>/u)
  assert.doesNotMatch(options, /<legend>Choix des verbes<\/legend>/u)
})

test('l’aperçu de l’étape 3 affiche la citation et sa forme ciblée', () => {
  assert.match(wizard, /:conjugation-literary-citation="conjugationLiteraryCitationRaw"/u)
  assert.match(options, /conjugationLiteraryCitation\.before/u)
  assert.match(options, /<mark>\{\{ conjugationLiteraryCitation\.target \}\}<\/mark>/u)
  assert.match(options, /conjugationLiteraryCitation\.author/u)
})

test('les exercices classique et chat surlignent la forme interrogée sans révéler la réponse', () => {
  assert.match(classic, /<mark>\{\{ currentIdentificationFormParts\.target \}\}<\/mark>/u)
  assert.match(chat, /isIdentificationExercise/u)
  assert.match(chat, /message\.literaryCitation\.target/u)
  assert.match(chat, /<mark>\{\{ message\.identificationForm\.target \}\}<\/mark>/u)
  assert.match(classic, /value: 'infinitif', label: ui\('Infinitif'\)/u)
  assert.match(chat, /value: 'infinitif', label: ui\('Infinitif'\)/u)
  assert.match(chat, /const formParts = identificationFormParts\(question\)/u)
  assert.match(chat, /identificationForm: formParts \|\| undefined/u)
  assert.match(chat, /if \(isIdentificationExercise\.value\)/u)
  assert.doesNotMatch(classic, /literaryCitation\.chapter/u)
  assert.doesNotMatch(chat, /literaryCitation\.chapter/u)
})

test('le chat ne répète pas la correction détaillée après une erreur d’identification', () => {
  assert.match(chat, /isIncorrectReaction && !isIdentificationExercise\.value && !comparisonDisplayed/u)
})

test('le bilan rappelle les phrases ratées avec leur forme verbale surlignée', () => {
  assert.match(classic, /attempt\.status === 'incorrect'[\s\S]*identificationFormParts\(attempt\.question\)/u)
  assert.match(classic, /<mark>\{\{ incorrectSummaryForms\[index\]\?\.target \}\}<\/mark>/u)
  assert.match(chat, /attempt\.status === 'incorrect'[\s\S]*identificationFormParts\(attempt\.question\)/u)
  assert.match(chat, /<mark>\{\{ item\.identificationForm\.target \}\}<\/mark>/u)
})

test('les choix de modes et de temps utilisent le catalogue complet et restent tous sélectionnables', () => {
  assert.match(wizard, /:identification-tenses="identificationTenses"/u)
  assert.match(wizard, /catalogue\.value\.temps\.map/u)
  assert.doesNotMatch(classic, /identificationModeAvailable|identificationTenseAvailable|\.available/u)
  assert.doesNotMatch(chat, /identificationModeAvailable|identificationTenseAvailable|\.available/u)
  assert.match(classic, /:disabled="feedback !== 'idle'"/u)
  assert.match(chat, /:disabled="waitingForNext \|\| posingQuestion \|\| deliveringFeedback"/u)
})

test('la provenance visible se limite à l’auteur et à l’œuvre', () => {
  assert.match(options, /conjugationLiteraryCitation\.author/u)
  assert.match(options, /conjugationLiteraryCitation\.work/u)
  assert.doesNotMatch(options, /conjugationLiteraryCitation\.chapter/u)
  assert.match(print, /literaryCitation\.author/u)
  assert.match(print, /literaryCitation\.work/u)
  assert.doesNotMatch(print, /literaryCitation\.chapter/u)
})

test('l’impression délimite la cible et indique la provenance', () => {
  assert.match(print, /literaryCitation\.target/u)
  assert.match(print, /literaryCitation\.author/u)
  assert.match(print, /literaryCitation\.work/u)
})
