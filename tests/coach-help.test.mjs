import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { defaultCoachHelpBlocks, renderCoachHelpContent, visibleCoachHelpBlocks } from '../shared/utils/coach-help.ts'
import { sanitizeCoachHtml } from '../shared/utils/safe-html.ts'

const block = {
  id: 1,
  type: 'normal',
  title: '',
  content: '<p>{verb} : <strong>{definition}</strong></p>',
  isActive: true,
  sortOrder: 1,
  children: [],
}

describe('aides visuelles configurables', () => {
  it('ne prédéfinit aucun contenu pour une nouvelle aide', () => {
    assert.deepEqual(defaultCoachHelpBlocks(), [])
  })

  it('rend la définition du verbe dans le HTML administré', () => {
    const rendered = renderCoachHelpContent(block.content, { verb: 'manger', definition: 'prendre un aliment' })
    assert.equal(rendered, '<p>manger : <strong>prendre un aliment</strong></p>')
  })

  it('conserve les balises sûres et retire scripts et attributs', () => {
    assert.equal(
      sanitizeCoachHtml('<p class="x">Texte <strong>utile</strong><script>alert(1)</script></p>'),
      '<p>Texte <strong>utile</strong></p>',
    )
  })

  it('conserve la structure sûre du tableau des terminaisons', () => {
    assert.equal(
      sanitizeCoachHtml('<table class="endings"><tbody><tr><th scope="row">je</th><td>-ais</td></tr></tbody></table>'),
      '<table><tbody><tr><th>je</th><td>-ais</td></tr></tbody></table>',
    )
  })

  it('n’expose que l’instantané marqué comme publié', () => {
    assert.deepEqual(visibleCoachHelpBlocks({ id: 1, name: 'A', description: '', headerTitle: '{helpTitle}', headerDescription: '', status: 'draft', blocks: [block] }), [])
    assert.deepEqual(visibleCoachHelpBlocks({ id: 1, name: 'A', description: '', headerTitle: '{helpTitle}', headerDescription: '', status: 'published', blocks: [block] }), [block])
  })
})
