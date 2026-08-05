import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const optionsSource = await readFile(
  new URL('../app/components/challenge/ChallengeOptions.vue', import.meta.url),
  'utf8',
)
const wizardSource = await readFile(
  new URL('../app/components/challenge/WizardChallengeWorkspace.vue', import.meta.url),
  'utf8',
)

test('l’étape 3 place les trois choix de voix après le type d’exercice', () => {
  const exerciseIndex = optionsSource.indexOf("ui('Type d’exercice')")
  const voiceIndex = optionsSource.indexOf("ui('Voix du verbe')")
  const complementIndex = optionsSource.indexOf("ui('Compléments d’objets :')")

  assert.ok(exerciseIndex >= 0)
  assert.ok(voiceIndex > exerciseIndex)
  assert.ok(complementIndex > voiceIndex)
  assert.match(optionsSource, /value="active"/u)
  assert.match(optionsSource, /value="passive"/u)
  assert.match(optionsSource, /value="mixed"/u)
})

test('l’étape 3 sépare chaque famille d’options dans une carte', () => {
  for (const group of ['questions', 'pronouns', 'exercise', 'voice']) {
    assert.match(optionsSource, new RegExp(`option-group-card--${group}`, 'u'))
  }
  assert.match(optionsSource, /<legend>\{\{ ui\('Pronoms'\) \}\}<\/legend>/u)
})

test('les choix du mode et du temps apparaissent dans leur carte avec une animation', () => {
  const exerciseCardStart = optionsSource.indexOf('option-group-card--exercise')
  const sourcePanel = optionsSource.indexOf('class="identification-source-panel"')
  const exerciseCardEnd = optionsSource.indexOf('</fieldset>', sourcePanel)

  assert.ok(exerciseCardStart >= 0)
  assert.ok(sourcePanel > exerciseCardStart)
  assert.ok(exerciseCardEnd > sourcePanel)
  assert.match(optionsSource, /<Transition name="identification-options">/u)
  assert.match(optionsSource, /\.identification-options-enter-from/u)
  assert.doesNotMatch(optionsSource, /identification-source-panel__title/u)
  assert.match(optionsSource, /margin: 12px 0 0 18px/u)
})

test('la grille de l’étape 3 remplit trois colonnes en maçonnerie', () => {
  assert.match(optionsSource, /\.options-layout--columns \{[^}]*grid-template-columns: repeat\(3,/u)
  assert.match(optionsSource, /grid-auto-flow: row dense/u)
  assert.match(optionsSource, /card\.style\.gridRowEnd/u)
})

test('ouvrir les choix du mode et du temps ne change pas la colonne des autres blocs', () => {
  assert.match(optionsSource, /\.option-group-card--questions,[\s\S]*?\.option-group-card--voice \{ grid-column: 1; \}/u)
  assert.match(optionsSource, /\.option-group-card--pronouns,[\s\S]*?> \.conjugation-example \{ grid-column: 2; \}/u)
  assert.match(optionsSource, /\.option-group-card--exercise,[\s\S]*?\.complement-options \{ grid-column: 3; \}/u)
})

test('les blocs inapplicables restent visibles mais sont désactivés', () => {
  assert.doesNotMatch(optionsSource, /v-if="exerciseKind === 'conjugation'" class="option-fieldset option-group-card option-group-card--voice/u)
  assert.match(optionsSource, /:disabled="exerciseKind !== 'conjugation'"/u)
  assert.doesNotMatch(optionsSource, /complement-options--hidden/u)
})

test('le mode passif désactive les réglages COD et COI sans effacer leur sélection', () => {
  assert.match(optionsSource, /props\.voiceMode !== 'passive'/u)
  assert.match(optionsSource, /Au passif, le COD devient le sujet/u)
})

test('l’assistant transmet le choix de voix à la configuration du défi', () => {
  assert.match(wizardSource, /:voice-mode="challenge\.voiceMode"/u)
  assert.match(wizardSource, /@update-voice-mode="challenge\.voiceMode = \$event; markAsCustom\(\)"/u)
})
