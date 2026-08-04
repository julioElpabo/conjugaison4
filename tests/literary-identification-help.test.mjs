import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { literaryIdentificationCoachHelpBlocks, renderCoachHelpContent } from '../shared/utils/coach-help.ts'

const [wizard, workspace, panel] = await Promise.all([
  readFile(new URL('../app/components/challenge/WizardChallengeWorkspace.vue', import.meta.url), 'utf8'),
  readFile(new URL('../app/components/challenge/ChallengeWorkspace.vue', import.meta.url), 'utf8'),
  readFile(new URL('../app/components/coach/CoachHelpPanel.vue', import.meta.url), 'utf8'),
])

test('l’aide littéraire contient seulement la définition et un guide des quatre modes', () => {
  const blocks = literaryIdentificationCoachHelpBlocks()
  assert.equal(blocks.length, 2)
  assert.equal(blocks[0].title, 'Définition du verbe')
  assert.equal(blocks[0].content, '{definitionHelp}')
  assert.equal(blocks[1].title, 'Reconnaître les modes')
  assert.deepEqual(blocks[1].children.map(block => block.title), [
    'Indicatif',
    'Subjonctif',
    'Conditionnel',
    'Impératif',
  ])
  for (const mode of blocks[1].children) {
    assert.match(mode.content, /<p>.+<\/p><p><strong>Exemples :<\/strong> .+<\/p>/u)
  }
  assert.equal(
    renderCoachHelpContent(blocks[0].content, { verb: 'commencer', definition: 'Débuter une action.' }),
    '<p><strong>commencer</strong> = Débuter une action.</p>',
  )
})

test('les deux espaces de défi fournissent les verbes réels des citations à cette aide', () => {
  for (const source of [wizard, workspace]) {
    assert.match(source, /challenge\.value\.identificationSource !== 'literary-corpus'/u)
    assert.match(source, /questions\.value\.map\(question => Number\(question\.verbeId\)\)/u)
    assert.match(source, /:verbs="chatExerciseVerbs"/u)
  }
})

test('le panneau peut désactiver son audit de conjugaison pour cette aide de référence', () => {
  assert.match(panel, /enableAutomaticAudit\?: boolean/u)
  assert.match(panel, /props\.enableAutomaticAudit && automaticAuditInput\.value/u)
})
