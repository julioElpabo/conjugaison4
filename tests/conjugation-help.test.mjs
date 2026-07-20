import assert from 'node:assert/strict'
import test from 'node:test'
import { buildConjugationBaseHtml, buildConjugationEndingsHtml, buildTargetedConjugationHelp, decomposeConjugationForm, isHelpCommand } from '../shared/utils/conjugation-help.ts'
import { buildRadicalReference } from '../shared/utils/radical-reference.ts'

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
  assert.match(html, /<figcaption>À savoir par cœur<i>♥<\/i><\/figcaption>/)
  assert.match(html, /<blockquote><strong>Forme repère<\/strong><p>Voici la forme repère au présent de l’indicatif\. Apprends-la par cœur, c’est très utile :<\/p>/)
  assert.match(html, /<p><mark><strong>Nous mangeons<\/strong><\/mark><\/p><\/blockquote>/)
  assert.match(html, /<strong>Terminaisons de l’imparfait de l’indicatif<\/strong><table>/)
  assert.match(html, /<figcaption>Trouve le radical<\/figcaption><ol><li>Prends la forme repère :<br><mark>/)
  assert.match(html, /<figcaption>Réponse<\/figcaption><blockquote><p>Ajoute <samp>-ais<\/samp> au radical <var>mange-<\/var>/)
  assert.doesNotMatch(html, /<li>Mode :|<li>Temps :|<li>Personne :/)
  assert.match(html, /Enlève <kbd>-ons<\/kbd>/)
  assert.match(html, /<span><var>mange<\/var><samp>ais<\/samp><\/span>/)
  assert.doesNotMatch(html, /Construction du radical/)
  assert.doesNotMatch(html, /Regarde la forme avec je|Enlève la fin <code>-ais<\/code>/)
})

test('les formes repères respectent l’élision avec je devant voyelle', () => {
  const currentQuestion = question({
    infinitif: 'acquérir',
    mode: 'indicatif',
    temps: 'futur',
    pronom: 'il',
    conjugaison1: 'acquerra',
    radicalReference: {
      kind: 'future-stem', label: 'je au futur', form: 'acquerrai', removableEnding: 'ai', radical: 'acquerr',
      targetEnding: 'a', referenceMode: 'indicatif', referenceTense: 'futur', referenceSubject: 'je',
      strategy: 'remove-ending', validated: true,
    },
  })

  const html = buildConjugationBaseHtml(currentQuestion, verb({ infinitif: 'acquérir', terminaison: 'ir', groupeConjugaison: 3 }), undefined, 'cif-falc')

  assert.match(html, /J’acquerrai/)
  assert.doesNotMatch(html, /Je acquerrai/)
})

test('les aides automatiques gardent les pronoms réfléchis des verbes pronominaux', () => {
  const currentQuestion = question({
    infinitif: 'se brosser',
    mode: 'indicatif',
    temps: 'présent',
    pronom: 'il',
    conjugaison1: 'se brosse',
    radicalReference: buildRadicalReference({
      infinitive: 'se brosser',
      mode: 'indicatif',
      tense: 'présent',
      personId: 6,
      conjugation: 'se brosse',
    }, [
      { mode: 'indicatif', tense: 'présent', personId: 6, pronoun: 'il', form: 'se brosse' },
      { mode: 'indicatif', tense: 'présent', personId: 7, pronoun: 'nous', form: 'nous nous brossons' },
      { mode: 'indicatif', tense: 'présent', personId: 9, pronoun: 'ils', form: 'se brossent' },
    ]),
  })
  const currentVerb = verb({ infinitif: 'se brosser', typePronominal: 'essentiel', particularites: ['pronominal'] })
  const html = buildConjugationBaseHtml(currentQuestion, currentVerb, undefined, 'cif-falc')

  assert.match(html, /Ils se brossent/)
  assert.match(html, /Ajoute aussi le pronom réfléchi adapté/)
  assert.match(html, /Il se brosse/)
})

test('le présent des verbes en -er à alternance peut partir de ils', () => {
  const reference = buildRadicalReference({
    infinitive: 'préférer',
    mode: 'indicatif',
    tense: 'présent',
    personId: 5,
    conjugation: 'préfères',
  }, [
    { mode: 'indicatif', tense: 'présent', personId: 5, pronoun: 'tu', form: 'préfères' },
    { mode: 'indicatif', tense: 'présent', personId: 7, pronoun: 'nous', form: 'préférons' },
    { mode: 'indicatif', tense: 'présent', personId: 9, pronoun: 'ils', form: 'préfèrent' },
  ])

  assert.equal(reference?.referenceSubject, 'ils')
  assert.equal(reference?.radical, 'préfèr')
  assert.equal(reference?.targetEnding, 'es')
})

test('une terminaison vide est expliquée explicitement', () => {
  const html = buildConjugationBaseHtml(question({
    infinitif: 'vendre',
    mode: 'indicatif',
    temps: 'présent',
    pronom: 'il',
    conjugaison1: 'vend',
    radicalReference: {
      kind: 'present-nous', label: 'nous au présent', form: 'vendons', removableEnding: 'ons', radical: 'vend',
      targetEnding: '', referenceMode: 'indicatif', referenceTense: 'présent', referenceSubject: 'nous',
      strategy: 'remove-ending', validated: true,
    },
  }), verb({ infinitif: 'vendre', terminaison: 're', groupeConjugaison: 3 }), undefined, 'cif-falc')

  assert.match(html, /garde cette forme/)
  assert.match(html, /<strong>Vend<\/strong>/)
  assert.doesNotMatch(html, /Utilise cette forme avec il\./)
})

test('le futur régulier demandé à je évite la boucle de forme repère', () => {
  const currentQuestion = question({
    infinitif: 'manger',
    mode: 'indicatif',
    temps: 'futur',
    pronom: 'je',
    conjugaison1: 'mangerai',
    radicalReference: {
      kind: 'future-stem', label: 'je au futur', form: 'mangerai', removableEnding: 'ai', radical: 'manger',
      targetEnding: 'ai', referenceMode: 'indicatif', referenceTense: 'futur', referenceSubject: 'je',
      strategy: 'remove-ending', validated: true,
    },
  })
  const currentVerb = verb({ infinitif: 'manger', terminaison: 'er', groupeConjugaison: 1 })

  for (const approach of ['cif-falc', 'concise', 'grammatical-technical', 'guided-discovery']) {
    const html = buildConjugationBaseHtml(currentQuestion, currentVerb, undefined, approach)
    assert.doesNotMatch(html, /La forme demandée est justement la <strong>forme repère<\/strong>/)
    assert.doesNotMatch(html, /Apprends-la par cœur/)
    assert.match(html, /manger/)
    assert.match(html, /mangerai|Mangerai|<var>manger<\/var><samp>ai<\/samp>/)
  }

  const endingsHtml = buildConjugationEndingsHtml(currentQuestion, currentVerb, undefined, 'cif-falc')
  assert.doesNotMatch(endingsHtml, /La forme demandée est justement la <strong>forme repère<\/strong>/)
  assert.match(endingsHtml, /Trouve la base|Ajoute/)
})

test('il elle on partagent la même forme repère à la troisième personne du singulier', () => {
  const html = buildConjugationBaseHtml(question({
    infinitif: 'être',
    mode: 'indicatif',
    temps: 'passé simple',
    pronom: 'elle',
    conjugaison1: 'fut',
    radicalReference: {
      kind: 'past-simple-il', label: 'il au passé simple', form: 'fut', removableEnding: 'ut', radical: 'fu',
      targetEnding: 'ut', referenceMode: 'indicatif', referenceTense: 'passé simple', referenceSubject: 'il',
      strategy: 'remove-ending', validated: true,
    },
  }), verb({ infinitif: 'être', terminaison: 're', groupeConjugaison: 3 }), undefined, 'cif-falc')

  assert.match(html, /La forme demandée est justement la <strong>forme repère<\/strong>/)
  assert.match(html, /<mark><strong>Il fut<\/strong><\/mark>/)
  assert.match(html, /<figcaption>En effet<\/figcaption>/)
  assert.match(html, /Cette forme repère est utile parce qu’elle montre la série du passé simple de <strong>être<\/strong>/)
  assert.match(html, /<strong>fus<\/strong>/)
  assert.match(html, /<mark><strong>fut<\/strong><\/mark>/)
  assert.doesNotMatch(html, /Construis la réponse/)
})

test('l’impératif présent mémorise tu, nous et vous puis renvoie à la règle du s', () => {
  const html = buildConjugationBaseHtml(question({
    infinitif: 'manger', mode: 'impératif', temps: 'présent', pronom: 'tu', conjugaison1: 'mange',
    radicalReference: {
      kind: 'present-same-person', label: 'tu à l’indicatif présent', form: 'manges', removableEnding: 's', radical: 'mange',
      referenceMode: 'indicatif', referenceTense: 'présent', referenceSubject: 'tu', strategy: 'remove-ending', validated: true,
      imperativePresentReferences: [
        { subject: 'tu', form: 'manges' },
        { subject: 'nous', form: 'mangeons' },
        { subject: 'vous', form: 'mangez' },
      ],
    },
  }), verb({ infinitif: 'manger', terminaison: 'er', groupeConjugaison: 1 }), undefined, 'cif-falc')

  assert.match(html, /<figcaption>À savoir par cœur<i>♥<\/i><\/figcaption>/)
  assert.match(html, /Présent de l’indicatif : tu, nous, vous/)
  assert.match(html, /<details><summary>Consulter les formes avec tu, nous et vous<\/summary>/)
  assert.match(html, /Tu manges/)
  assert.match(html, /Nous mangeons/)
  assert.match(html, /Vous mangez/)
  assert.match(html, /<figcaption>Construis la réponse<\/figcaption>/)
  assert.doesNotMatch(html, /À l’impératif, n’écris pas le pronom sujet/)
  assert.match(html, /<li>Garde la forme verbale, mais n’écris pas le pronom sujet\.<\/li><li>Vérifie s’il faut garder ou enlever/)
  assert.equal(html.match(/n’écris pas le pronom sujet/g)?.length, 1)
  assert.match(html, /Regarde le bloc « s ou pas s avec tu » plus bas/)
  assert.match(html, /<figcaption>S ou pas s avec tu<\/figcaption>/)
  assert.match(html, /Ici : pas de s final/)
  assert.match(html, /on enlève le <strong>s<\/strong> final/)
  assert.match(html, /Si <strong>en<\/strong> ou <strong>y<\/strong> vient juste après/)
  assert.match(html, /<strong>Mange<\/strong>/)
})

test('l’impératif présent reconnaît une forme irrégulière sans fausse transformation', () => {
  const html = buildConjugationBaseHtml(question({
    infinitif: 'être', mode: 'impératif', temps: 'présent', pronom: 'tu', conjugaison1: 'sois',
    radicalReference: {
      kind: 'memorized-form', label: 'forme particulière de être', form: 'sois', removableEnding: '', radical: 'sois',
      referenceMode: 'impératif', referenceTense: 'présent', referenceSubject: '', strategy: 'memorize-stem', validated: true,
      imperativePresentReferences: [
        { subject: 'tu', form: 'es' },
        { subject: 'nous', form: 'sommes' },
        { subject: 'vous', form: 'êtes' },
      ],
    },
  }), verb({ infinitif: 'être', terminaison: 're', groupeConjugaison: 3 }), undefined, 'cif-falc')

  assert.match(html, /Tu es/)
  assert.match(html, /Nous sommes/)
  assert.match(html, /Vous êtes/)
  assert.match(html, /Ce verbe fait exception/)
  assert.match(html, /Garde la forme verbale, mais n’écris pas le pronom sujet/)
  assert.equal(html.match(/n’écris pas le pronom sujet/g)?.length, 1)
  assert.match(html, /<strong>Sois<\/strong>/)
  assert.doesNotMatch(html, /il reste le radical|Ajoute <samp>/)
})

test('l’impératif rappelle une seule fois de retirer le pronom avec nous et vous', () => {
  for (const [subject, form] of [['nous', 'mangeons'], ['vous', 'mangez']]) {
    const html = buildConjugationBaseHtml(question({
      infinitif: 'manger', mode: 'impératif', temps: 'présent', pronom: subject, conjugaison1: form,
      radicalReference: {
        kind: 'present-same-person', label: `${subject} à l’indicatif présent`, form, removableEnding: '', radical: form,
        referenceMode: 'indicatif', referenceTense: 'présent', referenceSubject: subject, strategy: 'remove-ending', validated: true,
        imperativePresentReferences: [
          { subject: 'tu', form: 'manges' },
          { subject: 'nous', form: 'mangeons' },
          { subject: 'vous', form: 'mangez' },
        ],
      },
    }), verb({ infinitif: 'manger', terminaison: 'er', groupeConjugaison: 1 }), undefined, 'cif-falc')

    assert.match(html, /Garde la forme verbale, mais n’écris pas le pronom sujet/)
    assert.equal(html.match(/n’écris pas le pronom sujet/g)?.length, 1)
  }
})

test('le subjonctif présent utilise ils et nous comme repères pour toutes les personnes', () => {
  const forms = [
    { mode: 'indicatif', tense: 'présent', personId: 7, pronoun: 'nous', form: 'mangeons' },
    { mode: 'indicatif', tense: 'présent', personId: 9, pronoun: 'ils', form: 'mangent' },
    ...[
      ['je', 'mange'], ['tu', 'manges'], ['il', 'mange'], ['nous', 'mangions'], ['vous', 'mangiez'], ['ils', 'mangent'],
    ].map(([pronoun, form], index) => ({ mode: 'subjonctif', tense: 'présent', personId: index + 4, pronoun, form })),
  ]
  const reference = buildRadicalReference({
    infinitive: 'manger', mode: 'subjonctif', tense: 'présent', personId: 4, conjugation: 'mange',
  }, forms)
  const html = buildConjugationBaseHtml(question({
    infinitif: 'manger', mode: 'subjonctif', temps: 'présent', personId: 4, pronom: 'je', conjugaison1: 'mange', radicalReference: reference,
  }), verb({ infinitif: 'manger', terminaison: 'er', groupeConjugaison: 1 }), undefined, 'cif-falc')

  assert.match(html, /<strong>Deux formes repères<\/strong>/)
  assert.match(html, /Ils mangent/)
  assert.match(html, /Nous mangeons/)
  assert.match(html, /Terminaisons du subjonctif présent/)
  assert.match(html, /<th><strong>que je<\/strong><\/th><td><samp>-e<\/samp><\/td>/)
  assert.match(html, /Enlève <kbd>-ent<\/kbd> : il reste le radical <var>mang-<\/var>/)
  assert.match(html, /<span><var>mang<\/var><samp>e<\/samp><\/span>/)
})

test('le subjonctif présent affiche les formes réelles d’un verbe irrégulier', () => {
  const forms = [
    { mode: 'indicatif', tense: 'présent', personId: 7, pronoun: 'nous', form: 'avons' },
    { mode: 'indicatif', tense: 'présent', personId: 9, pronoun: 'ils', form: 'ont' },
    ...[
      ['je', 'aie'], ['tu', 'aies'], ['il', 'ait'], ['nous', 'ayons'], ['vous', 'ayez'], ['ils', 'aient'],
    ].map(([pronoun, form], index) => ({ mode: 'subjonctif', tense: 'présent', personId: index + 4, pronoun, form })),
  ]
  const reference = buildRadicalReference({
    infinitive: 'avoir', mode: 'subjonctif', tense: 'présent', personId: 4, conjugation: 'aie',
  }, forms)
  const html = buildConjugationBaseHtml(question({
    infinitif: 'avoir', mode: 'subjonctif', temps: 'présent', personId: 4, pronom: 'je', conjugaison1: 'aie', radicalReference: reference,
  }), verb({ infinitif: 'avoir', terminaison: 'oir', groupeConjugaison: 3 }), undefined, 'cif-falc')

  assert.match(html, /Formes particulières du subjonctif présent/)
  assert.match(html, /est irrégulier ici/)
  assert.match(html, /<th><strong>que je<\/strong><\/th><td><mark><strong>Aie<\/strong><\/mark><\/td>/)
  assert.match(html, /<th><strong>que nous<\/strong><\/th><td><strong>ayons<\/strong><\/td>/)
  assert.doesNotMatch(html, /Enlève <kbd>-ent<\/kbd>/)
})

test('le subjonctif présent affiche les pronoms réfléchis des verbes pronominaux', () => {
  const forms = [
    { mode: 'indicatif', tense: 'présent', personId: 7, pronoun: 'nous', form: 'nous nous souvenons' },
    { mode: 'indicatif', tense: 'présent', personId: 9, pronoun: 'ils', form: 'se souviennent' },
    ...[
      ['je', 'me souvienne'],
      ['tu', 'te souviennes'],
      ['il', 'se souvienne'],
      ['nous', 'nous nous souvenions'],
      ['vous', 'vous vous souveniez'],
      ['ils', 'se souviennent'],
    ].map(([pronoun, form], index) => ({ mode: 'subjonctif', tense: 'présent', personId: index + 4, pronoun, form })),
  ]
  const reference = buildRadicalReference({
    infinitive: 'se souvenir', mode: 'subjonctif', tense: 'présent', personId: 6, conjugation: 'se souvienne',
  }, forms)
  const html = buildConjugationBaseHtml(question({
    infinitif: 'se souvenir', mode: 'subjonctif', temps: 'présent', personId: 6, pronom: 'il', conjugaison1: 'se souvienne', radicalReference: reference,
  }), verb({ infinitif: 'se souvenir', terminaison: 'ir', groupeConjugaison: 3, typePronominal: 'essentiel', auxiliaire: 'être' }), undefined, 'cif-falc')

  assert.match(html, /Ils se souviennent/)
  assert.match(html, /Nous nous souvenons/)
  assert.match(html, /<mark><strong>Se souvienne<\/strong><\/mark>/)
  assert.doesNotMatch(html, /Ils souviennent|Nous souvenons|se se/)
})

test('les formes repères pronominales font l’élision devant h muet', () => {
  const reference = buildRadicalReference({
    infinitive: 's’habiller', mode: 'indicatif', tense: 'présent', personId: 9, conjugation: 'se habillent',
  }, [{ mode: 'indicatif', tense: 'présent', personId: 9, pronoun: 'ils', form: 'se habillent' }])
  const html = buildConjugationBaseHtml(question({
    infinitif: 's’habiller', mode: 'indicatif', temps: 'présent', personId: 9, pronom: 'ils',
    conjugaison1: 'se habillent', radicalReference: reference,
  }), verb({
    infinitif: 's’habiller', terminaison: 'er', groupeConjugaison: 1,
    typePronominal: 'essentiel', isPronominalForm: true, typeHInitial: 'muet',
  }), undefined, 'cif-falc')

  assert.match(html, /<mark><strong>Ils s’habillent<\/strong><\/mark>/)
  assert.match(html, /Avec <strong>ils<\/strong>, le pronom réfléchi est <strong>s’<\/strong>/)
  assert.match(html, /<mark><strong>S’habillent<\/strong><\/mark>/)
  assert.doesNotMatch(html, /se habillent|Ils se habillent/)
})

test('le conditionnel présent combine le radical du futur et les terminaisons de l’imparfait', () => {
  const reference = buildRadicalReference({
    infinitive: 'manger', mode: 'conditionnel', tense: 'présent', personId: 5, conjugation: 'mangerais',
  }, [{ mode: 'indicatif', tense: 'futur', personId: 4, pronoun: 'je', form: 'mangerai' }])
  const html = buildConjugationBaseHtml(question({
    infinitif: 'manger', mode: 'conditionnel', temps: 'présent', personId: 5, pronom: 'tu', conjugaison1: 'mangerais', radicalReference: reference,
  }), verb({ infinitif: 'manger', terminaison: 'er', groupeConjugaison: 1 }), undefined, 'cif-falc')

  assert.match(html, /<strong>Conditionnel présent<\/strong> = <var>radical du futur-<\/var> \+ <samp>terminaisons de l’imparfait<\/samp>/)
  assert.doesNotMatch(html, /<blockquote><strong>Radical du futur<\/strong>/)
  assert.doesNotMatch(html, /Forme repère du futur/)
  assert.match(html, /<th><strong>tu<\/strong><\/th><td><samp>-ais<\/samp><\/td>/)
  assert.match(html, /<figcaption>Trouve le radical du futur<\/figcaption>/)
  assert.match(html, /Garde tout l’infinitif/)
  assert.match(html, /<span><var>manger<\/var><samp>ais<\/samp><\/span><i>✓<\/i>/)
})

test('le futur régulier ne présente pas la réponse comme forme repère', () => {
  const reference = buildRadicalReference({
    infinitive: 'crier', mode: 'indicatif', tense: 'futur', personId: 4, conjugation: 'crierai',
  }, [{ mode: 'indicatif', tense: 'futur', personId: 4, pronoun: 'je', form: 'crierai' }])
  const html = buildConjugationBaseHtml(question({
    infinitif: 'crier', mode: 'indicatif', temps: 'futur', personId: 4, pronom: 'je', conjugaison1: 'crierai', radicalReference: reference,
  }), verb({ infinitif: 'crier', terminaison: 'er', groupeConjugaison: 1 }), undefined, 'cif-falc')

  assert.doesNotMatch(html, /La forme demandée est justement la <strong>forme repère<\/strong>/)
  assert.match(html, /Pars de l’infinitif <strong>crier<\/strong>/)
  assert.match(html, /<mark><strong>Crierai<\/strong><\/mark>/)
})

test('le conditionnel présent enlève le e des verbes réguliers en re', () => {
  const reference = buildRadicalReference({
    infinitive: 'prendre', mode: 'conditionnel', tense: 'présent', personId: 8, conjugation: 'prendriez',
  }, [{ mode: 'indicatif', tense: 'futur', personId: 4, pronoun: 'je', form: 'prendrai' }])
  const html = buildConjugationBaseHtml(question({
    infinitif: 'prendre', mode: 'conditionnel', temps: 'présent', personId: 8, pronom: 'vous', conjugaison1: 'prendriez', radicalReference: reference,
  }), verb({ infinitif: 'prendre', terminaison: 're', groupeConjugaison: 3 }), undefined, 'cif-falc')

  assert.match(html, /Enlève le <strong>e<\/strong> final : tu obtiens <var>prendr-<\/var>/)
  assert.match(html, /<span><var>prendr<\/var><samp>iez<\/samp><\/span>/)
})

test('le conditionnel présent explique les changements d’accent du radical futur', () => {
  const reference = buildRadicalReference({
    infinitive: 'élever', mode: 'conditionnel', tense: 'présent', personId: 9, conjugation: 'élèveraient',
  }, [{ mode: 'indicatif', tense: 'futur', personId: 4, pronoun: 'je', form: 'élèverai' }])
  const html = buildConjugationBaseHtml(question({
    infinitif: 'élever', mode: 'conditionnel', temps: 'présent', personId: 9, pronom: 'ils', conjugaison1: 'élèveraient', radicalReference: reference,
  }), verb({ infinitif: 'élever', terminaison: 'er', groupeConjugaison: 1, familleConjugaison: 'er-alternance' }), undefined, 'cif-falc')

  assert.match(html, /Forme repère du futur/)
  assert.match(html, /<mark><strong>J’élèverai<\/strong><\/mark>/)
  assert.match(html, /Le radical du futur change d’accent : <var>élever-<\/var> devient <var>élèver-<\/var>/)
  assert.doesNotMatch(html, /Garde tout l’infinitif/)
})

test('le conditionnel présent apprend le radical futur d’un verbe irrégulier', () => {
  const reference = buildRadicalReference({
    infinitive: 'venir', mode: 'conditionnel', tense: 'présent', personId: 4, conjugation: 'viendrais',
  }, [{ mode: 'indicatif', tense: 'futur', personId: 4, pronoun: 'je', form: 'viendrai' }])
  const html = buildConjugationBaseHtml(question({
    infinitif: 'venir', mode: 'conditionnel', temps: 'présent', personId: 4, pronom: 'je', conjugaison1: 'viendrais', radicalReference: reference,
  }), verb({ infinitif: 'venir', terminaison: 'ir', groupeConjugaison: 3 }), undefined, 'cif-falc')

  assert.match(html, /Pars de la forme repère au futur/)
  assert.match(html, /<mark><strong>Je viendrai<\/strong><\/mark>/)
  assert.match(html, /Enlève <kbd>-ai<\/kbd> : tu obtiens <var>viendr-<\/var>/)
  assert.match(html, /<span><var>viendr<\/var><samp>ais<\/samp><\/span>/)
})

test('le subjonctif imparfait construit les séries en -ît et -înt sans contradiction de radical', () => {
  const affaiblir = buildConjugationBaseHtml(question({
    infinitif: 'affaiblir', mode: 'subjonctif', temps: 'imparfait', personId: 6, pronom: 'il', conjugaison1: 'affaiblît',
    radicalReference: {
      kind: 'past-simple-il', label: 'il au passé simple', form: 'affaiblit', removableEnding: 'it', radical: 'affaibl',
      targetEnding: 'ît', referenceMode: 'indicatif', referenceTense: 'passé simple', referenceSubject: 'il',
      strategy: 'remove-ending', validated: true,
    },
  }), verb({ infinitif: 'affaiblir', terminaison: 'ir', groupeConjugaison: 2, familleConjugaison: 'deuxieme-ir' }), undefined, 'cif-falc')
  assert.match(affaiblir, /Enlève <kbd>-it<\/kbd> : tu obtiens le point de départ <var>affaibl-<\/var>/)
  assert.match(affaiblir, /Ajoute <samp>-ît<\/samp> au point de départ <var>affaibl-<\/var>/)
  assert.match(affaiblir, /<span><var>affaibl<\/var><samp>ît<\/samp><\/span><i>✓<\/i>/)

  const devenir = buildConjugationBaseHtml(question({
    infinitif: 'devenir', mode: 'subjonctif', temps: 'imparfait', personId: 6, pronom: 'il', conjugaison1: 'devînt',
    radicalReference: {
      kind: 'past-simple-il', label: 'il au passé simple', form: 'devint', removableEnding: 'int', radical: 'dev',
      targetEnding: 'înt', referenceMode: 'indicatif', referenceTense: 'passé simple', referenceSubject: 'il',
      strategy: 'remove-ending', validated: true,
    },
  }), verb({ infinitif: 'devenir', terminaison: 'ir', groupeConjugaison: 3, familleConjugaison: 'venir-tenir' }), undefined, 'cif-falc')
  assert.match(devenir, /Enlève <kbd>-int<\/kbd> : tu obtiens le point de départ <var>dev-<\/var>/)
  assert.match(devenir, /Ajoute <samp>-înt<\/samp> au point de départ <var>dev-<\/var>/)
  assert.match(devenir, /<span><var>dev<\/var><samp>înt<\/samp><\/span><i>✓<\/i>/)
  assert.doesNotMatch(devenir, /devin-.*dev-/)
})

test('le subjonctif imparfait en -u garde un point de départ cohérent', () => {
  const html = buildConjugationBaseHtml(question({
    infinitif: 'déchoir', mode: 'subjonctif', temps: 'imparfait', personId: 4, pronom: 'je', conjugaison1: 'déchusse',
    radicalReference: {
      kind: 'past-simple-il', label: 'il au passé simple', form: 'déchut', removableEnding: 'ut', radical: 'déch',
      targetEnding: 'usse', referenceMode: 'indicatif', referenceTense: 'passé simple', referenceSubject: 'il',
      strategy: 'remove-ending', validated: true,
    },
  }), verb({ infinitif: 'déchoir', terminaison: 'oir', groupeConjugaison: 3, familleConjugaison: 'troisieme-oir' }), undefined, 'cif-falc')

  assert.match(html, /Enlève <kbd>-ut<\/kbd> : tu obtiens le point de départ <var>déch-<\/var>/)
  assert.match(html, /Ajoute <samp>-usse<\/samp> au point de départ <var>déch-<\/var>/)
  assert.match(html, /Cette forme repère est utile parce qu’elle donne le point de départ <var>déch-<\/var>/)
  assert.doesNotMatch(html, /déchu-/)
})

test('le tableau issu d’une forme en -cer enlève la cédille devant i', () => {
  const html = buildConjugationBaseHtml(question({
    infinitif: 'déplacer', mode: 'indicatif', temps: 'imparfait', personId: 9, pronom: 'ils', conjugaison1: 'déplaçaient',
    radicalReference: {
      kind: 'present-nous', label: 'nous au présent', form: 'déplaçons', removableEnding: 'ons', radical: 'déplaç',
      targetEnding: 'aient', referenceMode: 'indicatif', referenceTense: 'présent', referenceSubject: 'nous',
      strategy: 'remove-ending', validated: true,
    },
  }), verb({ infinitif: 'déplacer', terminaison: 'er', groupeConjugaison: 1, familleConjugaison: 'cer' }), undefined, 'cif-falc')

  assert.match(html, /<strong>déplacions<\/strong>/)
  assert.match(html, /<strong>déplaciez<\/strong>/)
  assert.doesNotMatch(html, /déplaçions|déplaçiez/)
})

test('le tableau des verbes pronominaux affiche le sujet avec le pronom réfléchi', () => {
  const html = buildConjugationBaseHtml(question({
    infinitif: "s'écrier", mode: 'indicatif', temps: 'futur', personId: 9, pronom: 'ils', conjugaison1: "s'écrieront",
    radicalReference: {
      kind: 'future-stem', label: 'je au futur', form: "m'écrierai", removableEnding: 'ai', radical: "s'écrier",
      targetEnding: 'ont', referenceMode: 'indicatif', referenceTense: 'futur', referenceSubject: 'je',
      strategy: 'remove-ending', validated: true,
    },
  }), verb({ infinitif: "s'écrier", terminaison: 'er', groupeConjugaison: 1, typePronominal: 'essentiel', isPronominalForm: true }), undefined, 'cif-falc')

  assert.match(html, /Ils s’écrieront|Ils s&#39;écrieront/)
  assert.doesNotMatch(html, /<td><mark><strong>s[’&#39;]écrieront<\/strong><\/mark><\/td>/)
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
  assert.match(html, /La forme à retenir est <mark><strong>Vais<\/strong><\/mark>/)
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

test('le bloc automatique d’un temps composé sépare mémorisation, réponse et accords', () => {
  const html = buildConjugationBaseHtml(question({
    infinitif: 'manger', temps: 'plus-que-parfait', pronom: 'nous',
    isCompound: true, conjugaison1: 'avions mangé', reponsesPourCorrige: ['nous avions mangé'],
  }), verb({ infinitif: 'manger', participePasse: 'mangé', auxiliaire: 'avoir', particularites: [] }), undefined, 'cif-falc')

  assert.match(html, /<figcaption>À savoir par cœur<i>♥<\/i><\/figcaption>/)
  assert.match(html, /Quel verbe auxiliaire pour manger \?<\/strong><p><mark><strong>Avoir<\/strong><\/mark><\/p><p><kbd>Être<\/kbd><\/p>/)
  assert.doesNotMatch(html, /Conjugaison du verbe avoir/)
  assert.match(html, /<summary>imparfait du verbe avoir<\/summary>/)
  assert.match(html, /<\/blockquote><details><summary>imparfait du verbe avoir<\/summary><table>/)
  assert.doesNotMatch(html, /<blockquote><details><summary>imparfait du verbe avoir/)
  assert.doesNotMatch(html, /Temps simples du verbe avoir/)
  assert.doesNotMatch(html, /Voir tous les temps simples/)
  assert.doesNotMatch(html, /Temps utilisé ici|<summary>indicatif ·/)
  assert.match(html, /<th><strong>nous<\/strong><\/th><td><mark><strong>avions<\/strong><\/mark><\/td>/)
  assert.match(html, /Le participe passé de manger<\/strong><p><mark><strong>Mangé/)
  assert.match(html, /<figcaption>Réponse<\/figcaption>/)
  assert.match(html, /Conjugue le verbe auxiliaire <strong>avoir<\/strong> à l’imparfait de l’indicatif avec <strong>nous<\/strong>/)
  assert.match(html, /<figcaption>Accord du participe passé<\/figcaption>/)
  assert.match(html, /Cas général avec avoir/)
  assert.doesNotMatch(html, /Avec l’auxiliaire <strong>être<\/strong>/)
  assert.match(html, /Si le COD est placé avant/)
  assert.match(html, /Les pommes qu’elle a mangées/)
})

test('le bloc composé emploie être quand la forme réelle le demande', () => {
  const html = buildConjugationBaseHtml(question({
    infinitif: 'venir', temps: 'passé composé', pronom: 'elle', personId: 3,
    isCompound: true, conjugaison1: 'est venue', reponsesPourCorrige: ['elle est venue'],
  }), verb({ infinitif: 'venir', participePasse: 'venu', auxiliaire: 'être', particularites: [] }), undefined, 'cif-falc')

  assert.match(html, /Quel verbe auxiliaire pour venir \?<\/strong><p><kbd>Avoir<\/kbd><\/p><p><mark><strong>Être<\/strong><\/mark><\/p>/)
  assert.match(html, /<summary>présent du verbe être<\/summary><table>/)
  assert.doesNotMatch(html, /Temps utilisé ici|<summary>indicatif ·/)
  assert.match(html, /<th><strong>il \/ elle \/ on<\/strong><\/th><td><mark><strong>est<\/strong><\/mark><\/td>/)
  assert.match(html, /Conjugue le verbe auxiliaire <strong>être<\/strong> au présent de l’indicatif avec <strong>elle<\/strong>/)
})

test('l’accord avec vous aux temps composés ne suppose pas un pluriel automatique', () => {
  const html = buildConjugationBaseHtml(question({
    infinitif: 'naître', mode: 'impératif', temps: 'passé', pronom: 'vous', personId: 8,
    isCompound: true, conjugaison1: 'soyez nés', reponsesPourCorrige: ['soyez nés'],
  }), verb({ infinitif: 'naître', participePasse: 'né', auxiliaire: 'être', particularites: [] }), undefined, 'cif-falc')

  assert.match(html, /Quel verbe auxiliaire pour naître \?/)
  assert.match(html, /l’exercice attend <strong>nés<\/strong>/)
  assert.match(html, /Avec <strong>vous<\/strong>, l’accord dépend du contexte/)
  assert.doesNotMatch(html, /vous<\/strong> désigne plusieurs personnes/)
})

test('l’aide signale les graphies en -ger et -guer sans afficher la réponse', () => {
  const ger = buildTargetedConjugationHelp(question({ infinitif: 'manger' }), verb({ infinitif: 'manger', particularites: ['ger'] }))
  const guer = buildTargetedConjugationHelp(question({ infinitif: 'naviguer' }), verb({ infinitif: 'naviguer', particularites: [] }))

  assert.ok(ger.warnings.some(item => item.includes('nous mangeons')))
  assert.ok(guer.warnings.some(item => item.includes('nous naviguons')))
  assert.ok(!JSON.stringify(ger).includes('commençons'))
})
