import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

const read = path => readFile(new URL(path, import.meta.url), 'utf8')

describe('drapeau de la lecture audio', () => {
  it('verrouille la publication de la fonctionnalité dans le code partagé', async () => {
    const featureFlags = await read('../shared/config/feature-flags.ts')

    assert.match(featureFlags, /export const AUDIO_READING_ENABLED = false/u)
  })

  it('conditionne les deux exercices avant toute utilisation de la synthèse vocale', async () => {
    const [classic, chat] = await Promise.all([
      read('../app/components/exercise/ClassicExercise.vue'),
      read('../app/components/exercise/ChatExercise.vue'),
    ])

    for (const exercise of [classic, chat]) {
      assert.match(exercise, /import \{ AUDIO_READING_ENABLED \} from '~~\/shared\/config\/feature-flags'/u)
      assert.match(exercise, /const audioReadingEnabled = AUDIO_READING_ENABLED/u)
      assert.match(exercise, /speechSupported\.value = audioReadingEnabled\s+&& 'speechSynthesis' in window/u)
    }
  })

  it('garde tous les éléments audio derrière speechSupported', async () => {
    const [classic, chat] = await Promise.all([
      read('../app/components/exercise/ClassicExercise.vue'),
      read('../app/components/exercise/ChatExercise.vue'),
    ])

    assert.match(classic, /v-if="audioReadingEnabled && speechSupported && retryMessageVisible && currentSpokenAnswer"/u)
    assert.match(classic, /v-if="audioReadingEnabled && speechSupported && currentSpokenAnswer"/u)
    assert.match(classic, /v-if="audioReadingEnabled && speechSupported"/u)
    assert.match(chat, /usesDelayedAnswerAudio\.value && speechSupported\.value/u)
    assert.match(chat, /usesImmediateAnswerAudio\.value && speechSupported\.value/u)
    assert.match(chat, /v-if="audioReadingEnabled && message\.spokenAnswer && speechSupported"/u)
  })
})
