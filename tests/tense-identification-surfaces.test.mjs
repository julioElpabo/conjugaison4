import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const [options, wizard, classic, chat, print, printPreview, questionnaire] = await Promise.all([
  readFile(new URL('../app/components/challenge/ChallengeOptions.vue', import.meta.url), 'utf8'),
  readFile(new URL('../app/components/challenge/WizardChallengeWorkspace.vue', import.meta.url), 'utf8'),
  readFile(new URL('../app/components/exercise/ClassicExercise.vue', import.meta.url), 'utf8'),
  readFile(new URL('../app/components/exercise/ChatExercise.vue', import.meta.url), 'utf8'),
  readFile(new URL('../shared/utils/print-question.ts', import.meta.url), 'utf8'),
  readFile(new URL('../app/components/challenge/PrintPreview.vue', import.meta.url), 'utf8'),
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

test('le choix du mode et du temps révèle ses sous-options dans le même bloc sans défilement', () => {
  assert.match(options, /<Transition name="identification-options">/u)
  assert.match(options, /class="identification-source-panel"/u)
  assert.match(options, /\.identification-source-panel \{[^}]*margin: 12px 0 0 18px/u)
  assert.doesNotMatch(options, /scrollIntoView\(/u)
  assert.doesNotMatch(options, /Choix des verbes/u)
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

test('les fiches PDF et Word réservent une réponse séparée au mode et au temps', () => {
  assert.match(printPreview, /identificationAnswerHeightMm/u)
  assert.match(printPreview, /const modeLabel = pdfSafe\(ui\('Mode :'\)\)/u)
  assert.match(printPreview, /const tenseLabel = pdfSafe\(ui\('Temps :'\)\)/u)
  assert.match(printPreview, /identificationAnswerParagraph/u)
  assert.match(printPreview, /LeaderType\.DOT/u)
  assert.match(printPreview, /Math\.max\(5, questionSpacingMm\.value\)/u)
})

test('les fiches PDF et Word soulignent la forme ciblée sans afficher de crochets', () => {
  assert.match(printPreview, /pdfLiteraryCitation/u)
  assert.match(printPreview, /drawPdfLiteraryCitation/u)
  assert.match(printPreview, /underline: \{ type: UnderlineType\.SINGLE \}/u)
  assert.match(printPreview, /spacing: \{ before: 160, after: 480 \}/u)
  assert.match(printPreview, /capacity -= 19/u)
})

test('la provenance est isolée sur une ligne plus petite et italique dans les deux formats', () => {
  assert.match(printPreview, /sourceLines/u)
  assert.match(printPreview, /pdf\.setFont\('helvetica', 'italic'\)/u)
  assert.match(printPreview, /pdf\.setFontSize\(8\.3\)/u)
  assert.match(printPreview, /identificationQuestionParagraphs/u)
  assert.match(printPreview, /italics: true/u)
  assert.match(printPreview, /size: Math\.max\(15, size - 3\)/u)
})

test('le corrigé d’identification ne contient que les réponses de mode et de temps', () => {
  assert.match(printPreview, /correctionItemHeight\('', printableCorrectionText\(question\)\)/u)
  assert.match(printPreview, /pdf\.text\(answer, left \+ 10/u)
  assert.match(printPreview, /columnWidths: isTenseIdentification\.value \? \[480, 9495\]/u)
  assert.match(printPreview, /identificationCorrectionCells/u)
  assert.match(printPreview, /children: isTenseIdentification\.value[\s\S]*\? identificationCorrectionCells/u)
})

test('les fiches ordinaires éloignent la première question du titre en PDF et Word', () => {
  assert.match(printPreview, /else capacity -= 6/u)
  assert.match(printPreview, /return y \+ \(isTenseIdentification\.value \? 2 : 8\)/u)
  assert.match(printPreview, /spacing: \{ before: 0, after: 340 \}/u)
})

test('l’aperçu d’impression signale les questions manquantes et permet de compléter avec des répétitions', () => {
  assert.match(printPreview, /const missingQuestionCount = computed/u)
  assert.match(printPreview, /Seulement \{available\} questions différentes sont disponibles sur les \{requested\} demandées/u)
  assert.match(printPreview, /@click="emit\('regenerate'\)"/u)
  assert.match(printPreview, /@click="allowRepetitions = !allowRepetitions"/u)
  assert.match(printPreview, /const printableQuestions = computed/u)
  assert.match(printPreview, /exercisePages = computed\(\(\) => paginateByHeight\(\s*printableQuestions\.value/u)
  assert.match(printPreview, /rows: printableQuestions\.value\.map/u)
})

test('une nouvelle fiche reçoit un autre numéro commun au questionnaire et au corrigé', () => {
  assert.match(printPreview, /const sheetNumber = ref\(randomSheetNumber\(\)\)/u)
  assert.match(printPreview, /\(\) => props\.questions,[\s\S]*sheetNumber\.value = randomSheetNumber\(sheetNumber\.value\)/u)
  assert.equal((printPreview.match(/` n° \$\{sheetNumber\.value\}`/gu) || []).length, 2)
})
