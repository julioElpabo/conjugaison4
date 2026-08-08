import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const [learn, questionnaire, classic, chat] = await Promise.all([
  readFile(new URL('../app/pages/apprendre.vue', import.meta.url), 'utf8'),
  readFile(new URL('../server/services/questionnaire.ts', import.meta.url), 'utf8'),
  readFile(new URL('../app/components/exercise/ClassicExercise.vue', import.meta.url), 'utf8'),
  readFile(new URL('../app/components/exercise/ChatExercise.vue', import.meta.url), 'utf8'),
])

test('la page apprendre propose un accès pleine largeur à la reconnaissance des modes', () => {
  assert.match(learn, /class="mode-training-button"/u)
  assert.match(learn, /S’entraîner à reconnaître les modes/u)
  assert.match(learn, /\.mode-training-button \{ display: flex; width: 100%/u)
})

test('le parcours propose les présentations classique et chat avec dix citations', () => {
  assert.match(learn, /import ClassicExercise from '~\/components\/exercise\/ClassicExercise\.vue'/u)
  assert.match(learn, /import ChatExercise from '~\/components\/exercise\/ChatExercise\.vue'/u)
  assert.match(learn, /import CoachPicker from '~\/components\/exercise\/CoachPicker\.vue'/u)
  assert.match(learn, /<strong>Classique<\/strong>/u)
  assert.match(learn, /<strong>Chat<\/strong>/u)
  assert.match(learn, /questionCount: 10/u)
  assert.match(learn, /exerciseKind: 'mode-identification'/u)
  assert.match(learn, /identificationSource: 'literary-corpus'/u)
  assert.match(learn, /<ClassicExercise[\s\S]*exercise-kind="mode-identification"/u)
  assert.match(learn, /<ChatExercise[\s\S]*exercise-kind="mode-identification"/u)
})

test('le chat rappelle la règle du pronom adaptée au mode après la question', () => {
  const openingStart = chat.indexOf('async function runChatOpening')
  const welcome = chat.indexOf('await addCoachReaction(eventType, {})', openingStart)
  const mobileHint = chat.indexOf("text: ui('Glisse vers le bas pour voir l’aide.')", welcome)
  const question = chat.indexOf('await askCurrentQuestion()', mobileHint)
  const reminder = chat.indexOf('const imperative =', question)

  assert.ok(welcome >= 0 && welcome < mobileHint)
  assert.ok(mobileHint < question && question < reminder)
  assert.match(chat.slice(question), /eventType === 'introduction' && !isIdentificationExercise\.value[\s\S]*await enqueueCoachBubble/u)
  assert.match(chat.slice(reminder), /À l'impératif, la personne est indiquée, mais n'écris pas le pronom\./u)
  assert.match(chat.slice(reminder), /N'oublie pas le pronom !/u)
  assert.doesNotMatch(chat, /<label for="chat-answer">/u)
  assert.match(chat, /:aria-label="ui\('Ta réponse'\)"/u)
})

test('les questions sont équilibrées par mode et les deux interfaces savent les afficher', () => {
  assert.match(questionnaire, /balancedModeIdentificationQuestions/u)
  assert.match(questionnaire, /\['indicatif', 'subjonctif', 'conditionnel', 'impératif', 'infinitif'\]/u)
  assert.match(questionnaire, /for \(const mode of shuffle\(\[\.\.\.modeOrder\]\)\)/u)
  assert.match(questionnaire, /return shuffle\(balanced\)/u)
  assert.match(classic, /'mode-identification'/u)
  assert.match(chat, /'mode-identification'/u)
  assert.match(chat, /props\.exerciseKind \|\| props\.trackingContext/u)
})

test('le chat littéraire utilise une aide dédiée aux modes', () => {
  assert.match(chat, /const usesIdentificationHelp = computed\(\(\) => isIdentificationExercise\.value\)/u)
  assert.match(chat, /literaryIdentificationCoachHelpBlocks/u)
  assert.match(chat, /:include-automatic-orthography="!usesIdentificationHelp"/u)
  assert.match(chat, /:enable-automatic-audit="!usesIdentificationHelp"/u)
})

test('le chat de reconnaissance propose les cinq modes après la citation', () => {
  assert.match(chat, /const modeAnswerChoices = computed/u)
  assert.match(chat, /\{ value: 'indicatif', label: ui\('Indicatif'\) \}/u)
  assert.match(chat, /\{ value: 'impératif', label: ui\('Impératif'\) \}/u)
  assert.match(chat, /\{ value: 'subjonctif', label: ui\('Subjonctif'\) \}/u)
  assert.match(chat, /\{ value: 'conditionnel', label: ui\('Conditionnel'\) \}/u)
  assert.match(chat, /\{ value: 'infinitif', label: ui\('Infinitif'\) \}/u)
  assert.match(chat, /class="chat-mode-choices"/u)
  assert.match(chat, /@click\.stop="chooseIdentificationMode\(choice\.value\)"/u)
  assert.match(chat, /Écris ta réponse ou clique directement sur le mode correct/u)
  assert.match(chat, /grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/u)
})

test('le chat mode et temps propose un choix progressif', () => {
  assert.match(chat, /activeExerciseKind\.value === 'tense-identification'/u)
  assert.match(chat, /const modeAnswerChoices = computed/u)
  assert.match(chat, /const selectedModeTenses = computed/u)
  assert.match(chat, /const selectedModeTenseRows = computed/u)
  assert.match(chat, /class="chat-tense-choices"/u)
  assert.match(chat, /class="chat-tense-choice-row"/u)
  assert.match(chat, /@click\.stop="submitIdentificationTense\(row\.simple\)"/u)
  assert.match(chat, /@click\.stop="submitIdentificationTense\(row\.compound\)"/u)
  assert.match(chat, /answer\.value = `\$\{tense\.name\} \$\{selectedIdentificationMode\.value\}`/u)
  assert.match(chat, /Écris ta réponse ou clique directement sur le mode puis sur le temps correct/u)
  assert.match(chat, /\{ value: 'infinitif', label: ui\('Infinitif'\) \}/u)
  assert.match(chat, /if \(key === 'futur proche'\) continue/u)
  assert.match(chat, /\['present', 'passe compose'\]/u)
  assert.match(chat, /\['imparfait', 'plus-que-parfait'\]/u)
  assert.match(chat, /\['passe simple', 'passe anterieur'\]/u)
  assert.match(chat, /\['futur', 'futur anterieur'\]/u)
})

test('la version classique propose les mêmes boutons pour le mode et le temps', () => {
  assert.match(classic, /const isModeIdentificationExercise = computed/u)
  assert.match(classic, /const fixedModeChoices = computed/u)
  assert.match(classic, /class="classic-mode-choices"/u)
  assert.match(classic, /class="classic-tense-choices"/u)
  assert.match(classic, /@click="chooseIdentificationMode\(choice\.value\)"/u)
  assert.match(classic, /@click="submitIdentificationTense\(row\.simple\)"/u)
  assert.match(classic, /@click="submitIdentificationTense\(row\.compound\)"/u)
  assert.match(classic, /:placeholder="currentSubjectMustBeTyped \? currentAnswerPlaceholder : answerPlaceholder"/u)
  assert.match(classic, /Écris ta réponse ou clique directement sur le mode puis sur le temps correct/u)
  assert.match(classic, /props\.identificationTenses\?\.length/u)
  assert.match(chat, /props\.identificationTenses\?\.length/u)
  assert.match(classic, /if \(key === 'futur proche'\) continue/u)
  assert.match(classic, /\['present', 'passe compose'\]/u)
  assert.match(classic, /\['imparfait', 'plus-que-parfait'\]/u)
  assert.match(classic, /\['passe simple', 'passe anterieur'\]/u)
  assert.match(classic, /\['futur', 'futur anterieur'\]/u)
})

test('les réponses grammaticales ne déclenchent pas les diagnostics de conjugaison', () => {
  assert.match(classic, /result\.isCorrect \|\| isIdentificationExercise\.value \? \[\] : learnerErrorDetails/u)
  assert.match(classic, /isIdentificationExercise\.value \|\| result\.isCorrect \? null : findImpossibleSingularEnding/u)
  assert.match(classic, /isIdentificationExercise\.value \? null : diagnoseCoachAnswer/u)
  assert.match(chat, /result\.isCorrect \|\| isIdentificationExercise\.value \? \[\] : learnerErrorDetails/u)
  assert.match(chat, /isIdentificationExercise\.value \|\| result\.isCorrect \? null : findImpossibleSingularEnding/u)
  assert.match(chat, /isIdentificationExercise\.value \? null : diagnoseCoachAnswer/u)
})

test('l’aide classique décrit uniquement les choix grammaticaux erronés', () => {
  assert.match(classic, /const identificationChoiceHelpMessages = computed/u)
  assert.match(classic, /modeLandingPage\(selectedModeSlug, interfaceLocale\.value\)/u)
  assert.match(classic, /messages\.push\(`\$\{uiLabel\(selectedMode\)\} : \$\{modeHelp\.purpose\}`\)/u)
  assert.match(classic, /modeTensePedagogy\(selectedModeSlug, tenseSlug\)/u)
  assert.match(classic, /messages\.push\(`\$\{uiLabel\(selectedTense\)\} — \$\{uiLabel\(selectedMode\)\} : \$\{tenseHelp\.summary\}`\)/u)
  assert.match(classic, /grammarTenseCode\(selectedTense\) === grammarTenseCode\(question\.temps\)/u)
  assert.doesNotMatch(classic, /Commence par repérer le mode, puis distingue le temps simple/u)
})

test('le placeholder est raccourci sur les petits écrans', () => {
  assert.match(classic, /window\.matchMedia\('\(max-width: 760px\)'\)/u)
  assert.match(classic, /isIdentificationExercise\.value && isSmallScreen\.value[\s\S]*ui\('Écris ta réponse'\)/u)
  assert.match(chat, /window\.matchMedia\('\(max-width: 760px\)'\)/u)
  assert.match(chat, /isSmallScreen\.value[\s\S]*ui\('Écris ta réponse'\)/u)
})
