import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  agreePastParticiple,
  splitPastParticipleAgreement,
} from '../shared/utils/past-participle-agreement.ts'
import { buildPastParticipleAgreementExample } from '../server/services/past-participle-agreement-example.ts'

function complement(texte, texteAntepose, genre, nombre) {
  return { texte, texte_antepose: texteAntepose, genre, nombre }
}

describe('exemple d’accord du participe passé dans la consultation', () => {
  it('oppose le COD postposé au COD antéposé et isole la marque d’accord', () => {
    assert.deepEqual(buildPastParticipleAgreementExample('mangé', [
      complement('une pomme', 'la pomme', 'feminin', 'singulier'),
    ]), {
      afterSentence: 'Il a mangé une pomme.',
      beforeSentenceStart: 'La pomme qu’il a ',
      agreedParticipleStart: 'mangé',
      agreementLetters: 'e',
      beforeSentenceEnd: '.',
      cod: 'la pomme',
      gender: 'feminin',
      number: 'singulier',
    })
  })

  it('replace après le participe le complément qui ne fait pas partie du COD', () => {
    const example = buildPastParticipleAgreementExample('amené', [
      complement('des enfants à la campagne', 'les enfants à la campagne', 'masculin', 'pluriel'),
    ])
    assert.equal(example?.beforeSentenceStart, 'Les enfants qu’il a ')
    assert.equal(example?.agreementLetters, 's')
    assert.equal(example?.beforeSentenceEnd, ' à la campagne.')
    assert.equal(example?.cod, 'les enfants')
  })

  it('ignore un choix qui ne rendrait aucun accord visible', () => {
    const example = buildPastParticipleAgreementExample('pris', [
      complement('des livres', 'les livres', 'masculin', 'pluriel'),
      complement('une décision', 'la décision', 'feminin', 'singulier'),
    ])
    assert.equal(example?.cod, 'la décision')
    assert.equal(example?.agreementLetters, 'e')
  })

  it('déduit le genre d’un pluriel contrôlé lorsque la base ne l’a pas encore renseigné', () => {
    const example = buildPastParticipleAgreementExample('accumulé', [
      complement('des marchandises dans un entrepôt', null, null, 'pluriel'),
    ])
    assert.equal(example?.beforeSentenceStart, 'Les marchandises qu’il a ')
    assert.equal(example?.beforeSentenceEnd, ' dans un entrepôt.')
    assert.equal(example?.gender, 'feminin')
    assert.equal(example?.agreementLetters, 'es')
  })

  it('surligne toute la terminaison modifiée dans un accord irrégulier', () => {
    const agreed = agreePastParticiple('absous', 'feminin', 'singulier')
    assert.equal(agreed, 'absoute')
    assert.deepEqual(splitPastParticipleAgreement('absous', agreed), {
      unchanged: 'absou', agreement: 'te',
    })
  })
})
