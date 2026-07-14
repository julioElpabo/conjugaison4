import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { createCoachReaction, renderCoachTemplate, unknownCoachPlaceholders } from '../shared/utils/coach-dialogue.ts'

function coach(overrides = {}) {
  return {
    id: 1, slug: 'camille', firstName: 'Camille', lastName: 'Morel', avatarPath: '/camille.jpg',
    description: '', personality: '', pedagogicalStyle: '', themeColor: '#123456', status: 'published', sortOrder: 1,
    replies: [{ id: 1, eventType: 'cod-before', content: 'Le COD « {complement} » impose « {participle} ».', weight: 1, isActive: true }],
    media: [{ id: 4, name: 'Bravo', filePath: '/bravo.webp', mediaType: 'animation', category: 'success', altText: 'Bravo', rightsStatus: 'verified', safetyStatus: 'approved', isActive: true, fileSize: 100 }],
    assignments: [{ mediaId: 4, eventType: 'cod-before', weight: 1, isActive: true }],
    rules: [{ eventType: 'cod-before', mediaProbability: 1, cooldownQuestions: 2 }],
    ...overrides,
  }
}

describe('dialogue contextualisé des coaches', () => {
  it('remplace les données grammaticales sans modifier la règle', () => {
    assert.equal(renderCoachTemplate('{complement} — {verb} — {participle}', {
      complement: 'les pommes', verb: 'manger', participle: 'mangées',
    }), 'les pommes — manger — mangées')
  })

  it('signale les variables inconnues dans l’administration', () => {
    assert.deepEqual(unknownCoachPlaceholders('{verb} {inconnue} {inconnue}'), ['inconnue'])
  })

  it('associe une réplique et un média approuvé au bon événement', () => {
    const reaction = createCoachReaction(coach(), 'cod-before', { complement: 'les pommes', participle: 'mangées' }, {
      random: () => 0, mediaAllowed: true, allowMotion: true,
    })
    assert.equal(reaction.text, 'Le COD « les pommes » impose « mangées ».')
    assert.equal(reaction.media?.id, 4)
  })

  it('ne propose pas une animation quand les mouvements sont réduits', () => {
    const reaction = createCoachReaction(coach(), 'cod-before', {}, { random: () => 0, mediaAllowed: true, allowMotion: false })
    assert.equal(reaction.media, undefined)
  })

  it('peut imposer un média animé pour une réaction de réussite', () => {
    const emoji = { ...coach().media[0], id: 5, mediaType: 'emoji', filePath: '/bravo.png' }
    const reaction = createCoachReaction(coach({
      media: [emoji, coach().media[0]],
      assignments: [
        { mediaId: 5, eventType: 'cod-before', weight: 10, isActive: true },
        { mediaId: 4, eventType: 'cod-before', weight: 1, isActive: true },
      ],
    }), 'cod-before', {}, { random: () => 0, mediaAllowed: true, allowMotion: true, animatedOnly: true })
    assert.equal(reaction.media?.mediaType, 'animation')
  })

  it('évite de reprendre immédiatement le même GIF quand une alternative existe', () => {
    const second = { ...coach().media[0], id: 6, filePath: '/autre-bravo.webp' }
    const reaction = createCoachReaction(coach({
      media: [coach().media[0], second],
      assignments: [
        { mediaId: 4, eventType: 'cod-before', weight: 1, isActive: true },
        { mediaId: 6, eventType: 'cod-before', weight: 1, isActive: true },
      ],
    }), 'cod-before', {}, {
      random: () => 0, mediaAllowed: true, allowMotion: true, excludeMediaIds: [4],
    })
    assert.equal(reaction.media?.id, 6)
  })

  it('réutilise les médias de réussite pour une bonne réponse avec variante', () => {
    const reaction = createCoachReaction(coach({
      assignments: [{ mediaId: 4, eventType: 'correct', weight: 1, isActive: true }],
      rules: [{ eventType: 'correct-alternative', mediaProbability: 1, cooldownQuestions: 0 }],
    }), 'correct-alternative', {}, { random: () => 0, mediaAllowed: true, allowMotion: true })
    assert.equal(reaction.media?.id, 4)
  })

  it('bloque les médias sans droits ou validation mineurs', () => {
    for (const media of [
      { ...coach().media[0], rightsStatus: 'pending' },
      { ...coach().media[0], safetyStatus: 'pending' },
    ]) {
      const reaction = createCoachReaction(coach({ media: [media] }), 'cod-before', {}, { random: () => 0, mediaAllowed: true })
      assert.equal(reaction.media, undefined)
    }
  })
})
