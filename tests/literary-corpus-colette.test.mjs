import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { literaryCommonLanguage } from '../scripts/literary-common-language.mjs'
import { literaryYouthSafety } from '../scripts/literary-youth-safety.mjs'

const corpus = JSON.parse(await readFile(
  new URL('../shared/data/literary-corpus-colette.json', import.meta.url),
  'utf8',
))

test('le corpus courant de Colette reste sûr, validé et diversifié', () => {
  assert.equal(corpus.source.author, 'Colette')
  assert.equal(corpus.source.title, 'La Maison de Claudine')
  assert.equal(corpus.source.register, 'courant')
  assert.match(corpus.source.sourceUrl, /^https:\/\/www\.gutenberg\.org\//u)
  assert.match(corpus.source.license, /domaine public/iu)
  assert.ok(corpus.sentences.length >= 70)

  const sentenceTexts = new Set()
  const verbTenseCounts = new Map()
  let targetCount = 0

  for (const sentence of corpus.sentences) {
    const normalizedText = sentence.text.normalize('NFC').replace(/\s+/gu, ' ').trim().toLocaleLowerCase('fr')
    assert.equal(sentenceTexts.has(normalizedText), false, sentence.text)
    sentenceTexts.add(normalizedText)
    assert.equal(literaryYouthSafety(sentence.text).suitable, true, sentence.text)
    assert.equal(literaryCommonLanguage(sentence.text).suitable, true, sentence.text)

    const sentenceTargets = new Set()
    for (const target of sentence.targets) {
      targetCount += 1
      assert.equal(target.confidence, 'high')
      assert.equal(target.ambiguityReason, null)
      assert.equal(sentence.text.slice(target.start, target.end), target.form)

      const sentenceKey = `${target.verbId}:${target.tenseId}:${target.personId}`
      assert.equal(sentenceTargets.has(sentenceKey), false, sentence.text)
      sentenceTargets.add(sentenceKey)

      const verbTenseKey = `${target.verbId}:${target.tenseId}`
      verbTenseCounts.set(verbTenseKey, (verbTenseCounts.get(verbTenseKey) || 0) + 1)
    }
  }

  assert.ok(targetCount >= 80)
  assert.ok(Math.max(...verbTenseCounts.values()) <= 10)
})
