import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { coachPickerGroups } from '../shared/utils/coach-picker-groups.ts'

function coach(id, firstName, helpApproach, sortOrder) {
  return { id, firstName, helpApproach, sortOrder }
}

describe('regroupement des coaches du sélecteur', () => {
  it('regroupe et trie les coaches par type d’aide', () => {
    const groups = coachPickerGroups([
      coach(3, 'Zoé', 'tres-condensee', 2),
      coach(2, 'Sami', 'complete-avec-reponses', 2),
      coach(1, 'Camille', 'complete-avec-reponses', 1),
      coach(7, 'Lucas', 'tres-condensee', 1),
    ])

    assert.deepEqual(groups.map(group => group.approach), ['complete-avec-reponses', 'tres-condensee'])
    assert.deepEqual(groups.map(group => group.label), ['Complète avec réponses', 'Très condensée'])
    assert.deepEqual(groups[0].coaches.map(item => item.firstName), ['Camille', 'Sami'])
    assert.deepEqual(groups[1].coaches.map(item => item.firstName), ['Lucas', 'Zoé'])
  })

  it('respecte l’ordre administré des caractères à l’ouverture du chat', () => {
    const groups = coachPickerGroups([
      { ...coach(1, 'Camille', 'complete-avec-reponses', 1), caractereSortOrder: 4, helpApproachSortOrder: 1 },
      { ...coach(2, 'Sami', 'complete', 1), caractereSortOrder: 3, helpApproachSortOrder: 3 },
      { ...coach(3, 'Zoé', 'tres-condensee', 1), caractereSortOrder: 2, helpApproachSortOrder: 2 },
    ])

    assert.deepEqual(groups.map(group => group.approach), [
      'tres-condensee',
      'complete',
      'complete-avec-reponses',
    ])
  })

  it('ne fusionne pas deux types administrés qui utilisent le même moteur', () => {
    const groups = coachPickerGroups([
      { ...coach(1, 'Camille', 'complete', 1), helpApproachId: 12, helpApproachName: 'Conseils', helpApproachSortOrder: 2 },
      { ...coach(2, 'Sami', 'complete', 1), helpApproachId: 11, helpApproachName: 'Premiers indices', helpApproachSortOrder: 1 },
    ])

    assert.deepEqual(groups.map(group => group.label), ['Premiers indices', 'Conseils'])
    assert.deepEqual(groups.map(group => group.coaches[0].firstName), ['Sami', 'Camille'])
  })
})
