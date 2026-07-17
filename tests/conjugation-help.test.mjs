import assert from 'node:assert/strict'
import test from 'node:test'
import { buildTargetedConjugationHelp, isHelpCommand } from '../shared/utils/conjugation-help.ts'

function verb(overrides = {}) {
  return {
    id: 1,
    infinitif: 'commencer',
    meaning: 'Faire le début de quelque chose.',
    participePresent: 'commençant',
    participePasse: 'commencé',
    auxiliaire: 'avoir',
    groupeConjugaison: 1,
    familleConjugaison: 'er-regulier',
    terminaison: 'er',
    typePronominal: 'aucun',
    estImpersonnel: false,
    estDefectif: false,
    personnesDisponibles: [],
    typeHInitial: null,
    niveauDifficulte: 1,
    niveauCecrl: 'A1',
    rangFrequence: 1,
    registrePrincipal: 'courant',
    formeCanonique: 'commencer',
    statutValidation: 'valide',
    particularites: ['cer'],
    niveauxScolaires: [],
    parcoursCif: [],
    categoriesSemantiques: ['action-processus'],
    ...overrides,
  }
}

function question(overrides = {}) {
  return {
    titre: 'Question',
    consigne: 'nous | commencer | indicatif présent',
    reponses: ['commençons'],
    reponsesPourCorrige: ['nous commençons'],
    verbeId: 1,
    tenseId: 1,
    personId: 7,
    infinitif: 'commencer',
    pronom: 'nous',
    temps: 'présent',
    mode: 'indicatif',
    isCompound: false,
    ...overrides,
  }
}

test('la commande Aide tolère la casse, les accents et la ponctuation finale', () => {
  assert.equal(isHelpCommand('Aide'), true)
  assert.equal(isHelpCommand('  AIDE !  '), true)
  assert.equal(isHelpCommand('aider'), false)
  assert.equal(isHelpCommand('j’ai besoin d’aide'), false)
})

test('l’aide cible le groupe, le radical, la personne et la cédille', () => {
  const help = buildTargetedConjugationHelp(question(), verb())

  assert.equal(help.meaning, 'Faire le début de quelque chose.')
  assert.equal(help.requestedForm, 'La question demande le présent de l’indicatif.')
  assert.deepEqual(help.verbFacts.slice(0, 2), [
    { label: 'Groupe', value: '1er groupe' },
    { label: 'Radical de base', value: 'commenc-' },
  ])
  assert.match(help.endings, /ici, la terminaison attendue est -ons/)
  assert.ok(help.warnings.some(item => item.includes('c devient ç')))
})

test('l’aide distingue clairement la règle générale d’une exception', () => {
  const help = buildTargetedConjugationHelp(question({
    infinitif: 'être',
    temps: 'imparfait',
    pronom: 'il',
  }), verb({
    infinitif: 'être',
    terminaison: 're',
    groupeConjugaison: 3,
    particularites: [],
  }))

  assert.equal(help.requestedForm, 'La question demande l’imparfait de l’indicatif.')
  assert.match(help.formation[0], /forme avec « nous » au présent/)
  assert.match(help.endings, /-ais, -ais, -ait, -ions, -iez, -aient/)
  assert.match(help.exception, /radical ét-/)
  assert.match(help.exception, /seul verbe/)
})

test('l’aide d’un temps composé explique l’auxiliaire et l’accord du COD antéposé', () => {
  const help = buildTargetedConjugationHelp(question({
    temps: 'plus-que-parfait',
    isCompound: true,
    agreementReminder: {
      kind: 'cod-before',
      infinitive: 'envoyer',
      complement: 'les lettres',
      participle: 'envoyé',
      gender: 'feminin',
      number: 'pluriel',
    },
  }), verb({ infinitif: 'envoyer', participePasse: 'envoyé', particularites: [] }))

  assert.match(help.formation[0], /auxiliaire avoir à l’imparfait/)
  assert.equal(help.requestedForm, 'La question demande le plus-que-parfait de l’indicatif.')
  assert.match(help.endings, /avais, avais, avait, avions, aviez, avaient/)
  assert.ok(help.warnings.some(item => item.includes('COD « les lettres » est placé avant')))
})

test('l’aide signale les graphies en -ger et -guer sans afficher la réponse', () => {
  const ger = buildTargetedConjugationHelp(question({ infinitif: 'manger' }), verb({ infinitif: 'manger', particularites: ['ger'] }))
  const guer = buildTargetedConjugationHelp(question({ infinitif: 'naviguer' }), verb({ infinitif: 'naviguer', particularites: [] }))

  assert.ok(ger.warnings.some(item => item.includes('nous mangeons')))
  assert.ok(guer.warnings.some(item => item.includes('nous naviguons')))
  assert.ok(!JSON.stringify(ger).includes('commençons'))
})
