import assert from 'node:assert/strict'
import test from 'node:test'
import { buildConjugationBaseHtml, buildConjugationEndingsHtml, buildTargetedConjugationHelp, decomposeConjugationForm, isHelpCommand } from '../shared/utils/conjugation-help.ts'

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
    conjugaison1: 'commençons',
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

  assert.equal(help.title, 'nous | commencer | présent')
  assert.equal(help.meaning, 'Faire le début de quelque chose.')
  assert.equal(help.requestedForm, 'La question demande le présent de l’indicatif.')
  assert.deepEqual(help.verbFacts.slice(0, 2), [
    { label: 'Groupe', value: '1er groupe' },
    { label: 'Base pour cette forme', value: 'commenç-' },
  ])
  assert.deepEqual(help.decomposition, {
    base: 'commenç', ending: 'ons', baseLabel: 'Base pour cette forme', confidence: 'high', source: 'stored-form',
  })
  assert.match(help.endings, /ici, la terminaison attendue est -ons/)
  assert.ok(help.warnings.some(item => item.includes('c devient ç')))
})

test('le header précise le mode seulement lorsqu’il n’est pas indicatif', () => {
  const help = buildTargetedConjugationHelp(question({
    infinitif: 'aller', pronom: 'il', temps: 'présent', mode: 'subjonctif',
  }), verb({ infinitif: 'aller' }))

  assert.equal(help.title, 'il | aller | présent (subjonctif)')
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

test('le bloc terminaisons décrit grammaticalement le verbe et le contexte demandé', () => {
  const html = buildConjugationEndingsHtml(question({
    infinitif: 'manger',
    temps: 'imparfait',
    conjugaison1: 'mangions',
  }), verb({
    infinitif: 'manger',
    terminaison: 'er',
    particularites: ['ger'],
  }))

  assert.match(html, /Le verbe <strong>manger<\/strong> est un verbe en <strong>-er<\/strong> \(premier groupe\)/)
  assert.match(html, /Base pour cette forme<\/strong> : <span><var>mang<\/var><samp>ions<\/samp><\/span>/)
  assert.match(html, /Ses terminaisons à l’imparfait de l’indicatif sont/)
  assert.match(html, /<tr><th>je<\/th><td>-ais<\/td><\/tr>/)
  assert.match(html, /<tr><th>ils \/ elles<\/th><td>-aient<\/td><\/tr>/)
})

test('la base contextuelle vient de la forme stockée, y compris au futur irrégulier', () => {
  const decomposition = decomposeConjugationForm(question({
    infinitif: 'venir',
    pronom: 'tu',
    temps: 'futur',
    conjugaison1: 'viendras',
  }), verb({ infinitif: 'venir', groupeConjugaison: 3, terminaison: 'ir' }))

  assert.deepEqual(decomposition, {
    base: 'viendr', ending: 'as', baseLabel: 'Base pour cette forme', confidence: 'high', source: 'stored-form',
  })
})

test('aucune fausse base n’est produite quand les terminaisons dépendent de la famille', () => {
  assert.equal(decomposeConjugationForm(question({
    infinitif: 'venir',
    pronom: 'tu',
    conjugaison1: 'viens',
  }), verb({ infinitif: 'venir', groupeConjugaison: 3, terminaison: 'ir' })), null)
  assert.equal(decomposeConjugationForm(question({
    temps: 'plus-que-parfait',
    conjugaison1: 'avais commencé',
    isCompound: true,
  }), verb()), null)
})

test('le bloc terminaisons présente les formes de l’auxiliaire aux temps composés', () => {
  const html = buildConjugationEndingsHtml(question({
    temps: 'plus-que-parfait',
    isCompound: true,
  }), verb())

  assert.match(html, /Au plus-que-parfait de l’indicatif, le verbe se construit avec l’auxiliaire <strong>avoir<\/strong>/)
  assert.match(html, /<tr><th>je<\/th><td>avais<\/td><\/tr>/)
  assert.match(html, /<tr><th>ils \/ elles<\/th><td>avaient<\/td><\/tr>/)
})

test('le bloc terminaisons ne donne pas de fausse série aux verbes irréguliers', () => {
  const html = buildConjugationEndingsHtml(question({
    infinitif: 'venir',
    temps: 'passé simple',
  }), verb({
    infinitif: 'venir',
    terminaison: 'ir',
    groupeConjugaison: 3,
    particularites: [],
  }))

  assert.match(html, /verbe en <strong>-ir<\/strong> \(troisième groupe\)/)
  assert.match(html, /Il n’existe pas de série unique/)
  assert.doesNotMatch(html, /<table>/)
})

test('les quatre approches transforment les mêmes faits en explications distinctes', () => {
  const currentQuestion = question({
    infinitif: 'manger',
    temps: 'imparfait',
    conjugaison1: 'mangions',
  })
  const currentVerb = verb({ infinitif: 'manger', terminaison: 'er', particularites: ['ger'] })

  const falc = buildConjugationEndingsHtml(currentQuestion, currentVerb, undefined, 'cif-falc')
  assert.equal((falc.match(/<li>/gu) || []).length, 3)
  assert.match(falc, /Regarde le temps/)
  assert.match(falc, /puis relis la phrase/)

  const concise = buildConjugationEndingsHtml(currentQuestion, currentVerb, undefined, 'concise')
  assert.equal((concise.match(/<p>/gu) || []).length, 1)
  assert.match(concise, /<code>mang-<\/code>.*<code>-ions<\/code>/)
  assert.doesNotMatch(concise, /radical|désinence|table/iu)

  const technical = buildConjugationEndingsHtml(currentQuestion, currentVerb, undefined, 'grammatical-technical')
  assert.match(technical, /radical contextuel/)
  assert.match(technical, /désinence/)
  assert.match(technical, /<table>/)

  const guided = buildConjugationEndingsHtml(currentQuestion, currentVerb, undefined, 'guided-discovery')
  assert.equal((guided.match(/<details>/gu) || []).length, 4)
  assert.match(guided, /Indice 1 · Le temps/)
  assert.match(guided, /Dernière vérification/)
})

test('le bloc Radical adapte les mêmes faits aux quatre approches', () => {
  const currentQuestion = question({
    infinitif: 'venir',
    temps: 'futur',
    pronom: 'tu',
    conjugaison1: 'viendras',
  })
  const currentVerb = verb({
    infinitif: 'venir',
    terminaison: 'ir',
    groupeConjugaison: 3,
    familleConjugaison: 'venir-tenir',
    particularites: [],
  })

  assert.match(buildConjugationBaseHtml(currentQuestion, currentVerb, undefined, 'concise'), /radical <var>viendr-<\/var>/)
  assert.equal((buildConjugationBaseHtml(currentQuestion, currentVerb, undefined, 'cif-falc').match(/<li>/gu) || []).length, 3)
  assert.match(buildConjugationBaseHtml(currentQuestion, currentVerb, undefined, 'guided-discovery'), /Indice 2 · Le radical/)
  assert.doesNotMatch(buildConjugationBaseHtml(currentQuestion, currentVerb, undefined, 'guided-discovery'), /Regarde la forme avec tu/)
  const technical = buildConjugationBaseHtml(currentQuestion, currentVerb, undefined, 'grammatical-technical')
  assert.match(technical, /radical contextuel/)
  assert.match(technical, /radical lexical <var>ven-<\/var>/)
  assert.match(technical, /venir tenir/)
})

test('le radical de l’imparfait part de nous au présent sans répéter la construction', () => {
  const currentQuestion = question({
    infinitif: 'manger',
    mode: 'indicatif',
    temps: 'imparfait',
    pronom: 'je',
    conjugaison1: 'mangeais',
    radicalReference: {
      kind: 'present-nous',
      label: 'nous au présent',
      form: 'mangeons',
      removableEnding: 'ons',
      radical: 'mange',
    },
  })
  const html = buildConjugationBaseHtml(currentQuestion, verb({
    infinitif: 'manger',
    terminaison: 'er',
    groupeConjugaison: 1,
  }), undefined, 'cif-falc')

  assert.match(html, /mangeons/)
  assert.doesNotMatch(html, /Une fois cette forme connue|toutes les personnes de l’imparfait/)
  assert.match(html, /<figcaption>À savoir par cœur<\/figcaption>/)
  assert.match(html, /<blockquote><strong>Forme repère<\/strong><p>Apprends par cœur la forme repère au présent de l’indicatif avec le pronom <strong>nous<\/strong> :<\/p>/)
  assert.match(html, /<p><mark><strong><i>♥<\/i> Nous mangeons<\/strong><\/mark><\/p><\/blockquote>/)
  assert.match(html, /<strong>Terminaisons de l’imparfait de l’indicatif<\/strong><table>/)
  assert.match(html, /<figcaption>Trouve le radical<\/figcaption><ol><li>Prends la forme repère :<br><mark>/)
  assert.match(html, /<figcaption>Réponse<\/figcaption><blockquote><p>Ajoute <samp>-ais<\/samp> au radical <var>mange-<\/var>/)
  assert.doesNotMatch(html, /<li>Mode :|<li>Temps :|<li>Personne :/)
  assert.match(html, /Enlève <kbd>-ons<\/kbd>/)
  assert.match(html, /<span><var>mange<\/var><samp>ais<\/samp><\/span>/)
  assert.doesNotMatch(html, /Construction du radical/)
  assert.doesNotMatch(html, /Regarde la forme avec je|Enlève la fin <code>-ais<\/code>/)
})

test('le bloc radical laisse l’explication de la lettre g au bloc spécialisé', () => {
  const html = buildConjugationBaseHtml(question({
    infinitif: 'manger', mode: 'indicatif', temps: 'imparfait', pronom: 'nous', conjugaison1: 'mangions',
    radicalReference: {
      kind: 'present-nous', label: 'nous au présent', form: 'mangeons', removableEnding: 'ons', radical: 'mang',
      targetEnding: 'ions', referenceMode: 'indicatif', referenceTense: 'présent', referenceSubject: 'nous',
      strategy: 'remove-ending', orthographicAdjustment: 'Devant i, le e disparaît.', validated: true,
    },
  }), verb({ infinitif: 'manger', terminaison: 'er', groupeConjugaison: 1 }), undefined, 'cif-falc')

  assert.match(html, /obtiens d’abord le radical <var>mange-<\/var>/)
  assert.doesNotMatch(html, /Devant i|le e disparaît|son doux de g/)
  assert.match(html, /Ajoute <samp>-ions<\/samp> au radical <var>mange-<\/var>/)
  assert.match(html, /<th><strong>nous<\/strong><\/th><td><samp>-ions<\/samp><\/td>/)
  assert.match(html, /<span><var>mange<\/var><samp>ions<\/samp><\/span><small>/)
  assert.match(html, /Si la lettre <strong>g<\/strong> est suivie de <strong>i<\/strong>, pas besoin de <strong>e<\/strong>.*explication plus bas/)
  assert.match(html, /<\/small><span><var>mang<\/var><del>e<\/del><samp>ions<\/samp><\/span>/)
  assert.match(html, /<\/span><strong>Résultat<\/strong><b><span><var>mang<\/var><samp>ions<\/samp><\/span><i>✓<\/i><\/b>/)
  assert.match(html, /<span><var>mang<\/var><samp>ions<\/samp><\/span>/)
  assert.doesNotMatch(html, /Enlève <kbd>-ons<\/kbd> : il reste le radical <var>mang-<\/var>/)
})

test('la base contextuelle explique le supplétisme sans inventer de découpage', () => {
  const html = buildConjugationBaseHtml(question({
    infinitif: 'aller',
    conjugaison1: 'vais',
    pronom: 'je',
  }), verb({
    infinitif: 'aller',
    terminaison: 'er',
    groupeConjugaison: 3,
    familleConjugaison: 'irregulier',
    particularites: [],
  }), undefined, 'grammatical-technical')

  assert.match(html, /très irrégulier/)
  assert.match(html, /supplétif/)
  assert.match(html, /ne repose pas sur un radical unique/)
  assert.doesNotMatch(html, /radical lexical indicatif/)
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
