import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createCoachReaction } from '../shared/utils/coach-dialogue.ts'

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
    characterId: 1,
    characterName: 'Test',
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
