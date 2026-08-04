import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const corpora = await Promise.all([
  '../shared/data/literary-corpus-pilot.json',
  '../shared/data/literary-corpus-verne.json',
  '../shared/data/literary-corpus-leroux.json',
  '../shared/data/literary-corpus-fournier.json',
].map(async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'))))

test('le corpus littéraire garde sa provenance et des phrases courtes', () => {
  assert.deepEqual(corpora.map(corpus => corpus.source.author), ['Maurice Leblanc', 'Jules Verne', 'Gaston Leroux', 'Alain-Fournier'])

  for (const corpus of corpora) {
    assert.match(corpus.source.sourceUrl, /^https:\/\/fr\.wikisource\.org\//)
    assert.match(corpus.source.license, /domaine public/i)
    assert.ok(corpus.sentences.length >= 500)

    for (const sentence of corpus.sentences) {
      assert.ok(sentence.wordCount >= 4 && sentence.wordCount <= 32, sentence.text)
      assert.ok(sentence.characterCount <= 280, sentence.text)
      assert.equal(sentence.characterCount, sentence.text.length)
      assert.doesNotMatch(sentence.text, /^(?:—|»)\s/u)
      assert.ok(sentence.targets.length > 0)

      for (const target of sentence.targets) {
        assert.equal(sentence.text.slice(target.start, target.end), target.form)
        assert.ok(['high', 'ambiguous'].includes(target.confidence))
        assert.equal(typeof target.isCompound, 'boolean')
      }

      const compoundTargets = sentence.targets.filter(target => target.isCompound)
      for (const target of sentence.targets.filter(target => !target.isCompound)) {
        assert.equal(compoundTargets.some(compound => (
          compound.start <= target.start && compound.end > target.end
        )), false, `Auxiliaire pris pour un verbe principal : ${sentence.text}`)
      }
    }
  }
})

test('le corpus conserve aussi des phrases avec davantage de contexte', () => {
  for (const corpus of corpora) {
    assert.ok(corpus.sentences.some(sentence => sentence.wordCount >= 20))
  }
})

test('le corpus limite les candidats à 10 par verbe, temps et personne', () => {
  for (const corpus of corpora) {
    const counts = new Map()
    for (const sentence of corpus.sentences) {
      for (const target of sentence.targets) {
        const key = `${target.verbId}:${target.tenseId}:${target.personId}`
        counts.set(key, (counts.get(key) || 0) + 1)
      }
    }

    assert.ok(counts.size > 20)
    assert.ok(Math.max(...counts.values()) <= 10)
  }
})

test('un auxiliaire suivi d’un participe passé n’est jamais proposé comme temps simple', () => {
  const sentences = corpora.flatMap(corpus => corpus.sentences.map(sentence => sentence.text))
  assert.equal(sentences.includes('— Je suis rentré, monsieur.'), false)
  assert.equal(sentences.includes('Je suis rentré tout seul.'), false)
  assert.equal(sentences.includes('C’est pour moi que vous êtes poursuivi !'), false)
  assert.equal(sentences.includes('— Il est donc parti au matin, poursuivit-elle.'), false)
  assert.equal(sentences.includes('— Le soir où il a dîné chez nous.'), false)
})

test('une même phrase ne se répète pas pour un même verbe, temps et personne', () => {
  for (const corpus of corpora) {
    const seen = new Set()
    for (const sentence of corpus.sentences) {
      const normalizedText = sentence.text.normalize('NFC').replace(/\s+/gu, ' ').trim().toLocaleLowerCase('fr')
      for (const target of sentence.targets) {
        const key = `${target.verbId}:${target.tenseId}:${target.personId}:${normalizedText}`
        assert.equal(seen.has(key), false, sentence.text)
        seen.add(key)
      }
    }
  }
})
