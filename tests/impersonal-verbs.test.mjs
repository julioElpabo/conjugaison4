import assert from 'node:assert/strict'
import { it } from 'node:test'
import { isImpersonalVerb } from '../shared/utils/impersonal-verbs.ts'
import { isPassivizableInfinitive } from '../shared/utils/passive-voice.ts'

it('reconnaît les impersonnels connus et ceux déclarés dans le catalogue', () => {
  for (const infinitive of ['falloir', 'pleuvoir', 'neiger', 'bruiner', 'venter', "s'agir", ' S’AGIR ']) {
    assert.equal(isImpersonalVerb(infinitive), true, infinitive)
    assert.equal(isPassivizableInfinitive(infinitive), false, infinitive)
  }
  assert.equal(isImpersonalVerb('verbe du catalogue', 1), true)
  for (const infinitive of ['agir', 'geler', 'tonner', 'clore', 'inventer', 'être', 'avoir']) {
    assert.equal(isImpersonalVerb(infinitive, 0), false, infinitive)
  }
})
