import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  correctionItemHeight,
  exerciseItemHeight,
  paginateByHeight,
} from '../shared/utils/print-pagination.ts'

describe('pagination des fiches PDF', () => {
  it('ne crée aucune page vide et conserve toutes les questions dans l’ordre', () => {
    const questions = Array.from({ length: 50 }, (_, index) => `Question ${index + 1}`)
    const pages = paginateByHeight(questions, 70, 80, exerciseItemHeight)
    assert.ok(pages.length > 1)
    assert.ok(pages.every(page => page.length > 0))
    assert.deepEqual(pages.flat().map(entry => entry.item), questions)
  })

  it('tient compte des consignes et réponses longues', () => {
    const short = correctionItemHeight('il | aimer | présent', 'aime')
    const long = correctionItemHeight(
      'une consigne particulièrement longue qui doit revenir sur plusieurs lignes dans le corrigé',
      'une réponse détaillée qui occupe elle aussi davantage de place'
    )
    assert.ok(long > short)
  })

  it('utilise une capacité distincte pour la première page', () => {
    const pages = paginateByHeight(['a', 'b', 'c'], 8, 16, () => 8)
    assert.deepEqual(pages.map(page => page.map(entry => entry.item)), [['a'], ['b', 'c']])
  })

  it('conserve quinze questions avec l’espacement par défaut sur une seule page avec un en-tête complet', () => {
    const questions = Array.from({ length: 15 }, (_, index) => `Question ${index + 1}`)
    // 226 mm moins les champs d'identité, les verbes et les temps.
    const pages = paginateByHeight(questions, 202, 220, exerciseItemHeight)
    assert.equal(pages.length, 1)
    assert.equal(pages[0]?.length, 15)
  })
})
