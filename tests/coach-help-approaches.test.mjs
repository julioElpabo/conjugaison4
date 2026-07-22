import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { coachHelpApproachSlug, parseCoachHelpApproachPayload } from '../server/services/coach-help-approaches.ts'

describe('approches d’aide administrables', () => {
  it('fabrique un identifiant stable à partir du nom libre', () => {
    assert.equal(coachHelpApproachSlug('  Découverte guidée !  '), 'decouverte-guidee')
    assert.equal(coachHelpApproachSlug('Grammaire & technique'), 'grammaire-technique')
  })

  it('conserve séparément le nom affiché et le comportement moteur', () => {
    assert.deepEqual(parseCoachHelpApproachPayload({
      name: 'Mon approche personnalisée',
      engineKey: 'allophone',
      status: 'published',
      sortOrder: 7,
    }), {
      name: 'Mon approche personnalisée',
      engineKey: 'allophone',
      status: 'published',
      sortOrder: 7,
    })
  })
})
