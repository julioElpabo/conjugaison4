import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = path => readFile(new URL(path, import.meta.url), 'utf8')

test('la visite guidée ne s’ouvre que sur une demande manuelle', async () => {
  const workspace = await read('../app/components/challenge/WizardChallengeWorkspace.vue')

  assert.match(workspace, /@click="openTourMenu"/u)
  assert.match(workspace, /tourWelcomeSource\.value = 'manual'/u)
  assert.doesNotMatch(workspace, /tourWelcomeSource\.value = '(?:initial|reminder)'/u)
  assert.doesNotMatch(workspace, /guided-tour-reminder/u)
  assert.doesNotMatch(workspace, /tourPromptTimer/u)
})
