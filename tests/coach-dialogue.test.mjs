import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  coachMediaRule,
  createCoachDialogueState,
  createCoachReaction,
  createVariedCoachReaction,
} from '../shared/utils/coach-dialogue.ts'

function coachWithRule(rule) {
  return {
    id: 1,
    slug: 'test',
    firstName: 'Test',
    lastName: '',
    gender: 'female',
    avatarPath: '',
    description: '',
    likes: '',
    caractereId: 1,
    caractereName: 'Test',
    personality: '',
    pedagogicalStyle: '',
    help: null,
    themeColor: '#000000',
    status: 'published',
    sortOrder: 1,
    replies: [{ id: 1, eventType: 'correct', content: 'Bravo', weight: 1, isActive: true }],
    media: [
      { id: 10, name: 'gif', filePath: '/gif.gif', mediaType: 'animation', category: 'success', altText: '', rightsStatus: 'verified', safetyStatus: 'approved', isActive: true, fileSize: null },
      { id: 20, name: 'emoji', filePath: '✅', mediaType: 'emoji', category: 'success', altText: '', rightsStatus: 'verified', safetyStatus: 'approved', isActive: true, fileSize: null },
    ],
    assignments: [
      { mediaId: 10, eventType: 'correct', weight: 1, isActive: true },
      { mediaId: 20, eventType: 'correct', weight: 1, isActive: true },
    ],
    rules: [{ eventType: 'correct', mediaProbability: Math.max(rule.animationProbability, rule.emojiProbability), cooldownQuestions: 0, ...rule }],
  }
}

function sequenceRandom(values) {
  let index = 0
  return () => values[index++] ?? 0
}

describe('fréquences séparées des médias du coach', () => {
  it('respecte la fréquence des GIFs sur une conversation, même avec un seul GIF et des émojis toujours activés', () => {
    for (const probability of [0, 0.2, 0.5, 0.8, 1]) {
      const coach = coachWithRule({ animationProbability: probability, emojiProbability: 1 })
      const state = createCoachDialogueState()
      let seed = 12345
      const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
        return seed / 2 ** 32
      }
      let gifs = 0
      for (let index = 0; index < 10000; index++) {
        const reaction = createVariedCoachReaction(coach, 'correct', {}, state, { mediaAllowed: true, random })
        assert.ok(reaction.media)
        if (reaction.media.mediaType === 'animation') gifs++
      }
      assert.ok(Math.abs(gifs / 10000 - probability) < 0.02, `${probability}: ${gifs} GIFs sur 10000`)
    }
  })

  it('alterne les GIFs disponibles sans laisser les émojis supprimer une animation', () => {
    const coach = coachWithRule({ animationProbability: 1, emojiProbability: 1 })
    coach.media.push({ ...coach.media[0], id: 11 })
    coach.assignments.push({ ...coach.assignments[0], mediaId: 11 })
    const state = createCoachDialogueState()
    const ids = Array.from({ length: 4 }, () => createVariedCoachReaction(
      coach, 'correct', {}, state, { mediaAllowed: true, random: () => 0 },
    ).media?.id)
    assert.deepEqual(ids, [10, 11, 10, 11])
  })

  it('utilise les GIFs, la fréquence et la pause des bonnes réponses pour une réponse alternative', () => {
    const coach = coachWithRule({ animationProbability: 1, emojiProbability: 0, cooldownQuestions: 2 })
    coach.replies.push({ ...coach.replies[0], id: 2, eventType: 'correct-alternative' })
    assert.equal(coachMediaRule(coach, 'correct-alternative')?.cooldownQuestions, 2)
    const reaction = createCoachReaction(coach, 'correct-alternative', {}, { mediaAllowed: true, random: () => 0 })
    assert.equal(reaction.media?.id, 10)
  })

  it('conserve un réglage explicite de série et son absence de GIFs', () => {
    const coach = coachWithRule({ animationProbability: 1, emojiProbability: 0 })
    coach.replies.push({ ...coach.replies[0], id: 2, eventType: 'streak' })
    coach.rules.push({ ...coach.rules[0], eventType: 'streak', animationProbability: 0 })
    assert.equal(createCoachReaction(coach, 'streak', {}, { mediaAllowed: true, random: () => 0 }).media, undefined)
  })

  it('respecte la pause, la réduction des animations et la validation des médias', () => {
    const coach = coachWithRule({ animationProbability: 1, emojiProbability: 0 })
    assert.equal(createCoachReaction(coach, 'correct', {}, { mediaAllowed: false, random: () => 0 }).media, undefined)
    assert.equal(createCoachReaction(coach, 'correct', {}, { mediaAllowed: true, allowMotion: false, random: () => 0 }).media, undefined)
    coach.media[0].safetyStatus = 'pending'
    assert.equal(createCoachReaction(coach, 'correct', {}, { mediaAllowed: true, random: () => 0 }).media, undefined)
  })

  it('peut afficher un GIF animé sans afficher d’emoji', () => {
    const reaction = createCoachReaction(coachWithRule({ animationProbability: 1, emojiProbability: 0 }), 'correct', {}, {
      mediaAllowed: true,
      random: sequenceRandom([0, 0, 0, 0]),
    })

    assert.equal(reaction.media?.mediaType, 'animation')
  })

  it('peut afficher un emoji sans afficher de GIF animé', () => {
    const reaction = createCoachReaction(coachWithRule({ animationProbability: 0, emojiProbability: 1 }), 'correct', {}, {
      mediaAllowed: true,
      random: sequenceRandom([0, 0, 0, 0]),
    })

    assert.equal(reaction.media?.mediaType, 'emoji')
  })
})

function coachWithExpectedAnswerTemplate() {
  const coach = coachWithRule({ animationProbability: 0, emojiProbability: 0 })
  return {
    ...coach,
    replies: [
      {
        id: 1,
        eventType: 'incorrect',
        content: 'C’est faux. La bonne réponse est « {expectedAnswer} ».',
        weight: 100,
        isActive: true,
      },
      {
        id: 2,
        eventType: 'incorrect',
        content: 'Essaie encore.',
        weight: 1,
        isActive: true,
      },
    ],
    assignments: [],
    rules: [],
  }
}

describe('variables des réactions du coach', () => {
  it('remplace expectedAnswer par la correction exacte lorsqu’elle est disponible', () => {
    const reaction = createVariedCoachReaction(
      coachWithExpectedAnswerTemplate(),
      'incorrect',
      { expectedAnswer: 'elles ont rempli' },
      createCoachDialogueState(),
      { random: () => 0 },
    )

    assert.equal(reaction.text, 'C’est faux. La bonne réponse est « elles ont rempli ».')
    assert.doesNotMatch(reaction.text, /\{expectedAnswer\}/u)
  })

  it('écarte cette réaction si le coach ne peut pas révéler la réponse', () => {
    const reaction = createVariedCoachReaction(
      coachWithExpectedAnswerTemplate(),
      'incorrect',
      {},
      createCoachDialogueState(),
      { random: () => 0 },
    )

    assert.equal(reaction.text, 'Essaie encore.')
    assert.doesNotMatch(reaction.text, /\{[a-zA-Z]+\}/u)
  })
})
