import assert from 'node:assert/strict'
import test from 'node:test'
import { falcVerbDefinitions } from '../scripts/falc-verb-definitions.mjs'

test('toutes les définitions FALC restent courtes et forment une phrase', () => {
  const definitions = Object.entries(falcVerbDefinitions)
  assert.equal(definitions.length, 435)
  for (const [infinitive, definition] of definitions) {
    assert.ok(definition.length <= 180, `${infinitive} dépasse la longueur maximale`)
    assert.match(definition, /^[A-ZÀÂÇÉÈÊËÎÏÔÙÛÜŒ]/u, `${infinitive} doit commencer par une majuscule`)
    assert.match(definition, /[.!?]$/u, `${infinitive} doit former une phrase`)
  }
})

test('les définitions courantes évitent les formulations de dictionnaire difficiles', () => {
  assert.equal(falcVerbDefinitions.manger, 'Mettre de la nourriture dans sa bouche, puis l’avaler.')
  assert.equal(falcVerbDefinitions.boire, 'Prendre un liquide par la bouche et l’avaler.')
  assert.equal(falcVerbDefinitions.acheter, 'Donner de l’argent pour recevoir quelque chose.')
  assert.equal(falcVerbDefinitions.voir, 'Regarder ou remarquer avec ses yeux.')
  assert.equal(falcVerbDefinitions.utiliser, 'Se servir d’une chose pour faire une action.')
  assert.doesNotMatch(
    [falcVerbDefinitions.manger, falcVerbDefinitions.boire, falcVerbDefinitions.acheter,
      falcVerbDefinitions.aimer, falcVerbDefinitions.voir, falcVerbDefinitions.utiliser].join(' '),
    /absorber|acquérir|éprouver|percevoir|faire usage/iu,
  )
})
