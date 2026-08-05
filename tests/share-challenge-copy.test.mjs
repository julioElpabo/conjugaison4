import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const dialog = await readFile(new URL('../app/components/challenge/ShareChallengeDialog.vue', import.meta.url), 'utf8')

test('copie directement avec une solution de repli pour les navigateurs non sécurisés', () => {
  assert.match(dialog, /navigator\.clipboard\?\.writeText/u)
  assert.match(dialog, /document\.execCommand\('copy'\)/u)
  assert.doesNotMatch(dialog, /Sélectionnez puis copiez/u)
})

test('affiche la confirmation sous le champ concerné', () => {
  const codeInput = dialog.indexOf('id="share-code"')
  const codeStatus = dialog.indexOf('copyStatuses.code', codeInput)
  const linkInput = dialog.indexOf('id="share-url"')
  const linkStatus = dialog.indexOf('copyStatuses.link', linkInput)

  assert.ok(codeInput >= 0 && codeStatus > codeInput && codeStatus < linkInput)
  assert.ok(linkInput >= 0 && linkStatus > linkInput)
  assert.match(dialog, /'Code copié'/u)
  assert.match(dialog, /'Lien copié'/u)
})
