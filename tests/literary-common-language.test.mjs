import assert from 'node:assert/strict'
import test from 'node:test'
import { literaryCommonLanguage } from '../scripts/literary-common-language.mjs'

test('accepte un français courant et correct', () => {
  assert.equal(literaryCommonLanguage('Ma mère range les livres dans la bibliothèque.').suitable, true)
  assert.equal(literaryCommonLanguage('Nous avons attendu le retour des enfants.').suitable, true)
})

test('écarte le familier, l’argot et le registre littéraire marqué', () => {
  assert.equal(literaryCommonLanguage('Y a un gars qui roupille ici.').suitable, false)
  assert.equal(literaryCommonLanguage('Il eût certes préféré partir.').suitable, false)
})
