import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  chatScrollDistanceFromBottom,
  shouldFollowChatAfterLearnerMessage,
  shouldFollowChatAfterUserScroll,
} from '../shared/utils/chat-scroll-follow.ts'

describe('suivi du défilement dans le chat', () => {
  it('reste automatique lorsque la conversation est déjà en bas', () => {
    const metrics = { scrollHeight: 1_000, scrollTop: 590, clientHeight: 400 }
    assert.equal(chatScrollDistanceFromBottom(metrics), 10)
    assert.equal(shouldFollowChatAfterUserScroll(metrics), true)
  })

  it('ne ramène pas en bas une personne qui relit volontairement la conversation', () => {
    assert.equal(shouldFollowChatAfterUserScroll({
      scrollHeight: 1_000,
      scrollTop: 250,
      clientHeight: 400,
    }), false)
  })

  it('reprend le suivi automatique dès que l’élève envoie un nouveau message', () => {
    assert.equal(shouldFollowChatAfterLearnerMessage(), true)
  })
})
