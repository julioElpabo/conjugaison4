import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { automaticOrthographyHelpBlocks, buildCondensedVerbGroupHtml, buildContextualBaseTitle, buildDefinitionHelpHtml, buildReferenceFormHelpHtml, coachHelpBlockUsesPedagogicalApproach, coachHelpQuestionVariables, conditionalCoachHelpBlocks, defaultCoachHelpBlocks, renderCoachHelpContent, visibleCoachHelpBlocks } from '../shared/utils/coach-help.ts'
import { COACH_HELP_BLOCK_TYPES } from '../shared/types/coach.ts'
import { formatCoachHtmlSource } from '../shared/utils/html-source-format.ts'
import { sanitizeCoachHtml } from '../shared/utils/safe-html.ts'

const block = {
  id: 1,
  type: 'normal',
  title: '',
  content: '<p>{verb} : <strong>{definition}</strong></p>',
  explanationApproach: 'cif-falc',
  isActive: true,
  sortOrder: 1,
  children: [],
}

describe('aides visuelles configurables', () => {
  it('impose la structure automatique minimale à toutes les aides', () => {
    const blocks = defaultCoachHelpBlocks()
    assert.equal(blocks.length, 2)
    assert.equal(blocks[0].title, 'Définition')
    assert.equal(blocks[0].content, '{definitionHelp}')
    assert.equal(blocks[1].content, '{contextualBaseHelp}')
    assert.ok(blocks.every(item => item.explanationApproach === 'cif-falc'))
  })

  it('rend la définition du verbe dans le HTML administré', () => {
    const rendered = renderCoachHelpContent(block.content, { verb: 'manger', definition: 'prendre un aliment' })
    assert.equal(rendered, '<p>manger : <strong>prendre un aliment</strong></p>')
  })

  it('construit le bloc Définition automatique avec les données FALC du verbe', () => {
    const values = { verb: 'savoir', definition: 'Avoir une information dans sa mémoire ou savoir faire une action.' }
    assert.equal(
      buildDefinitionHelpHtml(values),
      '<p><strong>savoir</strong> = Avoir une information dans sa mémoire ou savoir faire une action.</p>',
    )
    assert.equal(renderCoachHelpContent('{definitionHelp}', values), buildDefinitionHelpHtml(values))
    assert.equal(
      buildDefinitionHelpHtml({ verb: '<dire>', definition: 'Comprendre & répondre.' }),
      '<p><strong>&lt;dire&gt;</strong> = Comprendre &amp; répondre.</p>',
    )
  })

  it('propose les visuels info et success', () => {
    assert.deepEqual(COACH_HELP_BLOCK_TYPES, ['normal', 'info', 'success', 'warning', 'danger'])
  })

  it('adapte le titre automatique du radical au verbe', () => {
    assert.equal(buildContextualBaseTitle('manger'), 'Trouve le radical de manger')
    assert.equal(buildContextualBaseTitle('aller'), 'Trouve le radical d’aller')
    assert.equal(buildContextualBaseTitle('habiter', 'muet'), 'Trouve le radical d’habiter')
    assert.equal(buildContextualBaseTitle('haïr', 'aspire'), 'Trouve le radical de haïr')
  })

  it('expose séparément la base contextuelle et la terminaison fiables', () => {
    const values = coachHelpQuestionVariables({
      titre: 'Question', consigne: '', reponses: ['viendras'], reponsesPourCorrige: ['tu viendras'],
      infinitif: 'venir', pronom: 'tu', mode: 'indicatif', temps: 'futur', conjugaison1: 'viendras',
    }, {
      infinitif: 'venir', groupeConjugaison: 3, terminaison: 'ir', auxiliaire: 'être', participePasse: 'venu',
    })
    assert.equal(values.conjugationBase, 'viendr-')
    assert.equal(values.conjugationEnding, '-as')
    assert.equal(
      renderCoachHelpContent('{conjugationBase} + {conjugationEnding}', values),
      'viendr- + -as',
    )
  })

  it('applique l’approche pédagogique bloc par bloc au contenu automatique', () => {
    const values = coachHelpQuestionVariables({
      titre: 'Question', consigne: '', reponses: ['mangions'], reponsesPourCorrige: ['nous mangions'],
      infinitif: 'manger', pronom: 'nous', mode: 'indicatif', temps: 'imparfait', conjugaison1: 'mangions',
    }, {
      infinitif: 'manger', groupeConjugaison: 1, terminaison: 'er', auxiliaire: 'avoir', participePasse: 'mangé',
    })
    const concise = renderCoachHelpContent('{endingsHelp}', values, 'concise')
    const technical = renderCoachHelpContent('{endingsHelp}', values, 'grammatical-technical')
    const contextualBase = renderCoachHelpContent('{contextualBaseHelp}', values, 'grammatical-technical')

    assert.match(concise, /<code>mang-<\/code>.*<code>-ions<\/code>/)
    assert.doesNotMatch(concise, /<table>/)
    assert.match(technical, /radical contextuel/)
    assert.match(technical, /<table>/)
    assert.match(contextualBase, /radical contextuel/)
    assert.equal(coachHelpBlockUsesPedagogicalApproach('<p>{endingsHelp}</p>'), true)
    assert.equal(coachHelpBlockUsesPedagogicalApproach('<p>{contextualBaseHelp}</p>'), true)
    assert.equal(coachHelpBlockUsesPedagogicalApproach('<p>{definition}</p>'), false)
  })

  it('emploie nous pour construire l’imparfait depuis le présent', () => {
    const baseQuestion = {
      titre: 'Question', consigne: '', reponses: ['mangeait'], reponsesPourCorrige: ['il mangeait'],
      infinitif: 'manger', pronom: 'il', mode: 'indicatif', temps: 'imparfait', conjugaison1: 'mangeait',
      radicalReference: {
        kind: 'present-nous', label: 'nous au présent', form: 'mangeons', removableEnding: 'ons', radical: 'mange',
        targetEnding: 'ait', referenceMode: 'indicatif', referenceTense: 'présent', referenceSubject: 'nous',
        strategy: 'remove-ending', validated: true,
      },
    }
    const html = buildReferenceFormHelpHtml(baseQuestion)
    const values = coachHelpQuestionVariables(baseQuestion)
    const indicativeOnlyBase = renderCoachHelpContent('{contextualBaseHelp}', { ...values, omitIndicativeMode: true }, 'cif-falc')
    assert.match(html, /<strong>à l’imparfait<\/strong> <strong>de l’indicatif<\/strong>/)
    assert.match(html, /utilise sa forme repère <strong>au présent<\/strong> <strong>de l’indicatif<\/strong>\. Apprends-la par cœur, c’est très utile :/)
    assert.doesNotMatch(html, /avec le pronom <strong>nous<\/strong>/)
    assert.match(html, /<p><mark><strong>Nous mangeons<\/strong><\/mark><\/p>/)
    assert.match(indicativeOnlyBase, /Terminaisons de l’imparfait<\/strong>/)
    assert.doesNotMatch(indicativeOnlyBase, /Terminaisons de l’imparfait de l’indicatif/)
  })

  it('précise le mode dans le tableau des personnes sauf pour un questionnaire uniquement indicatif', () => {
    const compoundQuestion = {
      titre: 'Question', consigne: '', reponses: ['a mangé'], reponsesPourCorrige: ['il a mangé'],
      infinitif: 'manger', pronom: 'il', mode: 'indicatif', temps: 'passé composé',
      isCompound: true, conjugaison1: 'a mangé',
    }
    const values = coachHelpQuestionVariables(compoundQuestion, {
      infinitif: 'manger',
      groupeConjugaison: 1,
      terminaison: 'er',
      participePasse: 'mangé',
      auxiliaire: 'avoir',
    })

    const mixedModes = renderCoachHelpContent('{contextualBaseHelp}', { ...values, omitIndicativeMode: false }, 'cif-falc')
    const indicativeOnly = renderCoachHelpContent('{contextualBaseHelp}', { ...values, omitIndicativeMode: true }, 'cif-falc')

    assert.match(mixedModes, /<summary>présent de l’indicatif du verbe avoir<\/summary>/)
    assert.match(indicativeOnly, /<summary>présent du verbe avoir<\/summary>/)
  })

  it('emploie il au passé simple dans tous les blocs automatiques', () => {
    const question = {
      titre: 'Question', consigne: '', reponses: ['mangeâmes'], reponsesPourCorrige: ['nous mangeâmes'],
      infinitif: 'manger', pronom: 'nous', mode: 'indicatif', temps: 'passé simple', conjugaison1: 'mangeâmes',
      radicalReference: {
        kind: 'past-simple-il', label: 'il au passé simple', form: 'mangea', removableEnding: 'a', radical: 'mange',
        targetEnding: 'âmes', referenceMode: 'indicatif', referenceTense: 'passé simple', referenceSubject: 'il',
        strategy: 'remove-ending', validated: true,
      },
    }
    const values = coachHelpQuestionVariables(question)
    assert.match(values.referenceFormHelp, /Voici la forme repère du verbe <strong>manger<\/strong> <strong>au passé simple<\/strong> <strong>de l’indicatif<\/strong>\./)
    assert.match(values.referenceFormHelp, /Apprends-la par cœur, c’est très utile/)
    assert.match(values.referenceFormHelp, /<mark><strong>Il mangea<\/strong><\/mark>/)
    assert.match(values.contextualBaseHelp, /<mark><strong>Il mangea<\/strong><\/mark>/)
    assert.match(values.contextualBaseHelp, /À savoir par cœur<i>♥<\/i>/)
    assert.doesNotMatch(values.endingsHelp, /♥/)
    assert.equal(renderCoachHelpContent('{referenceFormHelp}', values), values.referenceFormHelp)
    assert.equal(renderCoachHelpContent('{nousFormHelp}', values), values.referenceFormHelp)
  })

  it('retient la personne demandée quand aucune autre forme ne permet une déduction sûre', () => {
    const html = buildReferenceFormHelpHtml({
      titre: 'Question', consigne: '', reponses: ['a mangé'], reponsesPourCorrige: ['il a mangé'],
      infinitif: 'manger', pronom: 'il', mode: 'indicatif', temps: 'passé composé',
      conjugaison1: 'a mangé', isCompound: true,
    })

    assert.match(html, /pronom <strong>il<\/strong>/)
    assert.match(html, /<mark><strong>il a mangé<\/strong><\/mark>/)
    assert.doesNotMatch(html, /pronom <strong>nous<\/strong>/)
  })

  it('conserve les balises sûres et retire scripts et attributs', () => {
    assert.equal(
      sanitizeCoachHtml('<p class="x">Texte <strong>utile</strong><script>alert(1)</script></p>'),
      '<p>Texte <strong>utile</strong></p>',
    )
  })

  it('présente les listes HTML avec une indentation lisible dans l’éditeur', () => {
    assert.equal(
      formatCoachHtmlSource('<ol><li>Repère le sujet.</li><li>Trouve le radical.</li><li>Ajoute la terminaison.</li></ol>'),
      '<ol>\n  <li>Repère le sujet.</li>\n  <li>Trouve le radical.</li>\n  <li>Ajoute la terminaison.</li>\n</ol>',
    )
    assert.equal(
      formatCoachHtmlSource('<p>Observe <strong>bien</strong> la question.</p>'),
      '<p>\n  Observe\n  <strong>bien</strong>\n  la question.\n</p>',
    )
    assert.equal(
      formatCoachHtmlSource('<section><custom-card><span>Texte</span></custom-card></section>'),
      '<section>\n  <custom-card>\n    <span>Texte</span>\n  </custom-card>\n</section>',
    )
  })

  it('conserve la structure sûre du tableau des terminaisons', () => {
    assert.equal(
      sanitizeCoachHtml('<table class="endings"><tbody><tr><th scope="row">je</th><td>-ais</td></tr></tbody></table>'),
      '<table><tbody><tr><th>je</th><td>-ais</td></tr></tbody></table>',
    )
  })

  it('compose les blocs selon le profil moteur du caractère', () => {
    const configured = visibleCoachHelpBlocks('tres-condensee')
    assert.deepEqual(configured.map(item => item.content), [
      '{definitionHelp}',
      '{condensedVerbGroupHelp}',
      '{condensedTenseRuleHelp}',
    ])
    assert.equal(configured[1].type, 'normal')
    assert.ok(configured.every(item => item.explanationApproach === 'concise'))
    assert.ok(configured.every(item => item.profileId === 'tres-condensee'))

    // Compatibilité de lecture avec les anciennes aides pendant la transition des historiques.
    const configuredBlock = { ...block, explanationApproach: 'concise' }
    const draft = visibleCoachHelpBlocks({ id: 1, name: 'A', description: '', headerTitle: '{helpTitle}', headerDescription: '', status: 'draft', blocks: [configuredBlock] })
    const published = visibleCoachHelpBlocks({ id: 1, name: 'A', description: '', headerTitle: '{helpTitle}', headerDescription: '', status: 'published', blocks: [configuredBlock] })
    assert.deepEqual(draft, published)
    assert.deepEqual(draft.map(item => item.content), configured.map(item => item.content))
    assert.ok(draft.every(item => item.explanationApproach === 'concise'))
  })

  it('ne transmet aucune réponse cible aux profils sans réponses', () => {
    const question = {
      titre: 'Question', consigne: '', reponses: ['mangions'], reponsesPourCorrige: ['nous mangions'],
      infinitif: 'manger', pronom: 'nous', mode: 'indicatif', temps: 'imparfait', conjugaison1: 'mangions',
    }
    const verb = { infinitif: 'manger', groupeConjugaison: 1, terminaison: 'er', auxiliaire: 'avoir', participePasse: 'mangé' }
    const values = coachHelpQuestionVariables(question, verb)
    for (const profile of ['complete', 'tres-condensee']) {
      const rendered = visibleCoachHelpBlocks(profile)
        .map(item => renderCoachHelpContent(item.content, values, item.explanationApproach))
        .join(' ')
      assert.doesNotMatch(rendered, /mangions|<mark>/u)
    }
    const completeWithAnswers = renderCoachHelpContent('{contextualBaseHelp}', values)
    const completeAdvice = renderCoachHelpContent('{completeAdviceHelp}', values)
    const instructions = '<ol><li>Pars de l’infinitif <strong>manger</strong>.</li><li>Pour ce temps, utilise le radical <var>mang-</var>.</li><li>Ajoute la terminaison <samp>-ions</samp>.</li></ol>'
    assert.ok(completeWithAnswers.startsWith(instructions))
    assert.equal(completeAdvice, instructions)
    assert.match(completeAdvice, /mang-|<samp>|<var>/u)
    assert.doesNotMatch(completeAdvice, /mangions|<mark>/u)
    assert.match(renderCoachHelpContent('{condensedTenseRuleHelp}', values), /Indicatif imparfait/u)
    assert.match(renderCoachHelpContent('{condensedTenseRuleHelp}', values), /nous chantons/u)
    assert.match(renderCoachHelpContent('{condensedVerbGroupHelp}', values), /1er groupe/u)
    assert.doesNotMatch(renderCoachHelpContent('{condensedTenseRuleHelp}', values), /<details>|<table>/u)
  })

  it('garde les ressources des temps composés sans révéler leur construction', () => {
    const values = coachHelpQuestionVariables({
      titre: 'Question', consigne: '', reponses: ['eussiez calqué'], reponsesPourCorrige: ['vous eussiez calqué'],
      infinitif: 'calquer', pronom: 'vous', mode: 'subjonctif', temps: 'plus-que-parfait', conjugaison1: 'eussiez calqué', isCompound: true,
    }, {
      infinitif: 'calquer', groupeConjugaison: 1, terminaison: 'er', auxiliaire: 'avoir', participePasse: 'calqué',
    })
    const advice = renderCoachHelpContent('{completeAdviceHelp}', values)
    assert.match(advice, /imparfait du subjonctif du verbe avoir/u)
    assert.match(advice, /imparfait du subjonctif du verbe être/u)
    assert.match(advice, /Le participe passé de calquer[\s\S]*<strong>calqué<\/strong>/u)
    assert.match(advice, /Conjugue le verbe auxiliaire à l’imparfait du subjonctif avec <strong>vous<\/strong>\./u)
    assert.match(advice, /<li>Ajoute le participe passé\.<\/li>/u)
    assert.match(advice, /Vérifie l’accord du participe passé\. Regarde plus bas pour plus de détails\./u)
    assert.match(advice, /<figcaption>Accord du participe passé<\/figcaption>/u)
    assert.doesNotMatch(advice, /Quel verbe auxiliaire|<kbd>Avoir<\/kbd>|<kbd>Être<\/kbd>|<mark>|eussiez calqué|Résultat|…/u)
  })

  it('ne donne ni radical ni terminaison ciblée au conditionnel sans réponses', () => {
    const values = coachHelpQuestionVariables({
      titre: 'Question', consigne: '', reponses: ['calquerions'], reponsesPourCorrige: ['nous calquerions'],
      infinitif: 'calquer', pronom: 'nous', mode: 'conditionnel', temps: 'présent', conjugaison1: 'calquerions',
    }, {
      infinitif: 'calquer', groupeConjugaison: 1, terminaison: 'er', auxiliaire: 'avoir', participePasse: 'calqué',
    })
    const advice = renderCoachHelpContent('{completeAdviceHelp}', values)
    assert.match(advice, /<figcaption>Trouve le radical du futur<\/figcaption><ol><li>Pars de l’infinitif : <strong>calquer<\/strong>\.<\/li><\/ol>/u)
    assert.match(advice, /Ajoute au radical du futur la terminaison de l’imparfait qui correspond à la personne demandée\./u)
    assert.match(advice, /<strong>Exemple :<\/strong><br><strong>nous<\/strong> <span><var>prendr<\/var><samp>ions<\/samp><\/span>/u)
    assert.doesNotMatch(advice, /calquer-|<samp>-ions<\/samp>|calquerions|Résultat|…/u)
  })

  it('change le verbe de l’exemple lorsque la question porte déjà sur prendre', () => {
    const values = coachHelpQuestionVariables({
      titre: 'Question', consigne: '', reponses: ['prendraient'], reponsesPourCorrige: ['ils prendraient'],
      infinitif: 'prendre', pronom: 'ils', mode: 'conditionnel', temps: 'présent', conjugaison1: 'prendraient',
    }, {
      infinitif: 'prendre', groupeConjugaison: 3, terminaison: 're', auxiliaire: 'avoir', participePasse: 'pris',
    })
    const advice = renderCoachHelpContent('{completeAdviceHelp}', values)
    assert.match(advice, /<strong>Exemple :<\/strong><br><strong>ils<\/strong> <span><var>chanter<\/var><samp>aient<\/samp><\/span>/u)
    assert.doesNotMatch(advice, /prendraient/u)
  })

  it('supprime les résultats vides au lieu d’afficher des points de suspension', () => {
    const values = coachHelpQuestionVariables({
      titre: 'Question', consigne: '', reponses: ['mange'], reponsesPourCorrige: ['mange'],
      infinitif: 'manger', pronom: 'tu', mode: 'impératif', temps: 'présent', conjugaison1: 'mange',
    }, {
      infinitif: 'manger', groupeConjugaison: 1, terminaison: 'er', auxiliaire: 'avoir', participePasse: 'mangé',
    })
    const advice = renderCoachHelpContent('{completeAdviceHelp}', values)
    assert.match(advice, /<figcaption>Construis la réponse<\/figcaption>/u)
    assert.doesNotMatch(advice, /Résultat|…|<p>\s*<\/p>/u)
  })

  it('conserve les trois formes repères de l’impératif, y compris vous', () => {
    const values = coachHelpQuestionVariables({
      titre: 'Question', consigne: '', reponses: ['prenez'], reponsesPourCorrige: ['prenez'],
      infinitif: 'prendre', pronom: 'vous', mode: 'impératif', temps: 'présent', conjugaison1: 'prenez',
      radicalReference: {
        kind: 'present-same-person', label: 'vous au présent', form: 'prenez', radical: 'pren', targetEnding: 'ez',
        referenceMode: 'indicatif', referenceTense: 'présent', referenceSubject: 'vous', strategy: 'memorize', validated: true,
        imperativePresentReferences: [
          { subject: 'tu', form: 'prends' },
          { subject: 'nous', form: 'prenons' },
          { subject: 'vous', form: 'prenez' },
        ],
      },
    }, {
      infinitif: 'prendre', groupeConjugaison: 3, terminaison: 're', auxiliaire: 'avoir', participePasse: 'pris',
    })
    const advice = renderCoachHelpContent('{completeAdviceHelp}', values)
    assert.match(advice, /<th><strong>tu<\/strong><\/th><td><strong>Tu prends<\/strong><\/td>/u)
    assert.match(advice, /<th><strong>nous<\/strong><\/th><td><strong>Nous prenons<\/strong><\/td>/u)
    assert.match(advice, /<th><strong>vous<\/strong><\/th><td><strong>Vous prenez<\/strong><\/td>/u)
    assert.doesNotMatch(advice, /<mark>|Résultat|…/u)
  })

  it('conserve la forme repère mais masque le radical et la terminaison pendant la construction', () => {
    const values = coachHelpQuestionVariables({
      titre: 'Question', consigne: '', reponses: ['brave'], reponsesPourCorrige: ['qu’il brave'],
      infinitif: 'braver', pronom: 'il', mode: 'subjonctif', temps: 'présent', conjugaison1: 'brave',
      radicalReference: {
        kind: 'present-ils', label: 'ils au présent', form: 'bravent', removableEnding: 'ent', radical: 'brav', targetEnding: 'e',
        referenceMode: 'indicatif', referenceTense: 'présent', referenceSubject: 'ils', strategy: 'remove-ending', validated: true,
        subjunctivePresentReferences: [
          { subject: 'ils', form: 'bravent' },
          { subject: 'nous', form: 'bravons' },
        ],
      },
    }, {
      infinitif: 'braver', groupeConjugaison: 1, terminaison: 'er', auxiliaire: 'avoir', participePasse: 'bravé',
    })
    const advice = renderCoachHelpContent('{completeAdviceHelp}', values)
    assert.match(advice, /Ils bravent/u)
    assert.match(advice, /Enlève <kbd>-ent<\/kbd> : il reste le radical\./u)
    assert.match(advice, /Ajoute la terminaison qui correspond à la personne demandée\./u)
    const construction = advice.match(/<figure><figcaption>Construis la réponse<\/figcaption>([\s\S]*?)<\/figure>/u)?.[1] || ''
    assert.doesNotMatch(construction, /<var>|<samp>|brav-|>-e</u)
    assert.doesNotMatch(advice, /qu’il brave|Résultat|…/u)
  })

  it('résume les facilités et les pièges propres à chaque groupe', () => {
    const firstGroup = buildCondensedVerbGroupHtml({ infinitif: 'manger', groupeConjugaison: 1 })
    const secondGroup = buildCondensedVerbGroupHtml({ infinitif: 'finir', groupeConjugaison: 2 })
    const thirdGroup = buildCondensedVerbGroupHtml({ infinitif: 'venir', groupeConjugaison: 3 }, { mode: 'conditionnel', tense: 'présent', subject: 'nous' })
    assert.match(firstGroup, /<p>Conjugaison généralement régulière\.<\/p><p>Attention : le radical ne s’écrit pas toujours de la même façon\.<\/p>/u)
    assert.match(secondGroup, /modèle de « finir »[^<]+-iss-/u)
    assert.match(thirdGroup, /souvent irrégulière[^<]+formes repères/u)
    assert.match(thirdGroup, /<details><summary>Qu’est-ce que c’est \?<\/summary>/u)
    assert.match(thirdGroup, /forme du verbe que tu as apprise par cœur/u)
    assert.match(thirdGroup, /<p><strong>Exemple :<\/strong><\/p>/u)
    assert.doesNotMatch(thirdGroup, /Exemple avec/u)
    assert.match(thirdGroup, /chanterons[^<]+<code>chanter-<\/code>/u)
    assert.match(thirdGroup, /<p>Trouve le radical\. Forme repère au futur/u)
    assert.doesNotMatch(thirdGroup, /Utilise la terminaison|Construis la réponse|<p>[123]\./u)
    assert.doesNotMatch(firstGroup + secondGroup, /<details>/u)
  })

  it('garde allophone indépendant tout en réutilisant actuellement le rendu complet', () => {
    const complete = visibleCoachHelpBlocks('complete-avec-reponses')
    const allophone = visibleCoachHelpBlocks('allophone')
    assert.deepEqual(allophone.map(item => item.content), complete.map(item => item.content))
    assert.ok(allophone.every(item => item.profileId === 'allophone'))
  })

  it('ajoute le bloc G uniquement aux verbes concernés', () => {
    assert.deepEqual(automaticOrthographyHelpBlocks({ verb: 'manger' }), [])

    const [manger] = automaticOrthographyHelpBlocks({ verb: 'manger', correctAnswers: 'nous mangeons' })
    assert.equal(manger.title, 'La lettre G')
    assert.match(manger.content, /fait le son « j » devant <strong>e<\/strong>, <strong>i<\/strong> ou <strong>y<\/strong>/)
    assert.match(manger.content, /on écrit <strong>ge<\/strong> devant <strong>a<\/strong> ou <strong>o<\/strong>/)
    assert.doesNotMatch(manger.content, /guitare/)

    const [naviguer] = automaticOrthographyHelpBlocks({ verb: 'naviguer', correctAnswers: 'nous naviguons' })
    assert.match(naviguer.content, /le <strong>u<\/strong> après <strong>g<\/strong> garde le son « g »/)
    assert.deepEqual(automaticOrthographyHelpBlocks({ verb: 'finir' }), [])
  })

  it('ajoute un bloc C court et contextualisé aux verbes en -cer', () => {
    assert.deepEqual(automaticOrthographyHelpBlocks({ verb: 's’avancer' }), [])

    const [blockC] = automaticOrthographyHelpBlocks({ verb: 's’avancer', correctAnswers: 'nous avançons' })
    assert.equal(blockC.title, 'La lettre C et la cédille')
    assert.match(blockC.content, /café · colle · cube · courir/)
    assert.match(blockC.content, /la cédille sert seulement devant <strong>a<\/strong>, <strong>o<\/strong> ou <strong>u<\/strong>/)
    assert.doesNotMatch(blockC.content, /nous avancions/)
  })

  it('garde le bloc G pour expliquer la disparition du e devant i', () => {
    const [blockG] = automaticOrthographyHelpBlocks({
      verb: 'manger',
      correctAnswers: 'nous mangions',
      contextualBaseHelp: 'Si la lettre <strong>g</strong> est suivie de <strong>i</strong>, pas besoin de <strong>e</strong>.',
    })
    assert.equal(blockG.title, 'La lettre G')
    assert.match(blockG.content, /devant <strong>i<\/strong>/)
    assert.match(blockG.content, /n’est donc pas utile/)
  })

  it('évite les blocs orthographiques hors contexte', () => {
    assert.deepEqual(automaticOrthographyHelpBlocks({ verb: 'ranger', correctAnswers: 'ils rangent' }), [])
    assert.deepEqual(automaticOrthographyHelpBlocks({ verb: 'mélanger', correctAnswers: 'tu mélangerais' }), [])
    assert.deepEqual(automaticOrthographyHelpBlocks({ verb: 'avancer', correctAnswers: 'nous avancions' }), [])
  })

  it('ajoute le bloc COD placé avant uniquement à l’aide complète sans réponses', () => {
    const values = {
      verb: 'manger',
      COD: 'la pomme',
      isCODplace_avant: 'oui',
    }
    const [codBlock] = conditionalCoachHelpBlocks('complete', values)
    assert.equal(codBlock.title, 'Le COD placé avant')
    assert.equal(codBlock.type, 'info')
    assert.match(codBlock.content, /<strong>« la pomme »<\/strong> est le complément d’objet direct \(COD\)/u)
    assert.match(codBlock.content, /Ne le confonds pas avec le sujet/u)
    assert.match(codBlock.content, /temps composé avec <strong>avoir<\/strong>/u)
    assert.doesNotMatch(codBlock.content, /mange|mangée/u)

    assert.deepEqual(conditionalCoachHelpBlocks('complete', { ...values, isCODplace_avant: 'non' }), [])
    assert.deepEqual(conditionalCoachHelpBlocks('complete-avec-reponses', values), [])
    assert.deepEqual(conditionalCoachHelpBlocks('tres-condensee', values), [])
  })

  it('affiche la règle d’accord avec un COD ou un COI dans tous les modes d’aide', () => {
    const compoundQuestion = {
      titre: 'Question', consigne: '', reponses: ['a mangée'], reponsesPourCorrige: ['elle a mangée'],
      infinitif: 'manger', pronom: 'elle', mode: 'indicatif', temps: 'passé composé', conjugaison1: 'a mangé',
      isCompound: true, complement: 'la pomme', complementFunction: 'cod', complementPosition: 'before',
      agreementReminder: {
        kind: 'cod-before', infinitive: 'manger', complement: 'la pomme', participle: 'mangée',
        gender: 'feminin', number: 'singulier',
      },
    }
    const currentVerb = {
      infinitif: 'manger', groupeConjugaison: 1, terminaison: 'er', auxiliaire: 'avoir', participePasse: 'mangé',
    }
    const values = coachHelpQuestionVariables(compoundQuestion, currentVerb)
    for (const profile of ['complete-avec-reponses', 'complete', 'tres-condensee', 'allophone']) {
      const rendered = [
        ...visibleCoachHelpBlocks(profile),
        ...conditionalCoachHelpBlocks(profile, values),
      ].map(block => `${block.title} ${renderCoachHelpContent(block.content, values, block.explanationApproach)}`).join(' ')
      assert.match(rendered, /Accord du participe passé/u, profile)
      assert.match(rendered, /COD[^<]*placé avant|COD placé avant/iu, profile)
    }

    const coiValues = coachHelpQuestionVariables({
      ...compoundQuestion,
      reponses: ['a parlé'], reponsesPourCorrige: ['elle a parlé'], infinitif: 'parler', conjugaison1: 'a parlé',
      complement: 'à ses amis', complementFunction: 'coi', complementPosition: 'before',
      agreementReminder: { ...compoundQuestion.agreementReminder, kind: 'coi', infinitive: 'parler', complement: 'à ses amis', participle: 'parlé' },
    }, { ...currentVerb, infinitif: 'parler', participePasse: 'parlé' })
    for (const profile of ['complete-avec-reponses', 'complete', 'tres-condensee', 'allophone']) {
      const rendered = [
        ...visibleCoachHelpBlocks(profile),
        ...conditionalCoachHelpBlocks(profile, coiValues),
      ].map(block => `${block.title} ${renderCoachHelpContent(block.content, coiValues, block.explanationApproach)}`).join(' ')
      assert.match(rendered, /Accord du participe passé/u, profile)
      assert.match(rendered, /COI/iu, profile)
      assert.match(rendered, /ne commande pas l’accord|ne s’accorde pas/iu, profile)
    }

    const simpleValues = { ...values, isCompound: false }
    assert.deepEqual(conditionalCoachHelpBlocks('tres-condensee', simpleValues), [])
  })

  it('construit le subjonctif imparfait en -a sans radical artificiel', () => {
    const values = coachHelpQuestionVariables({
      titre: 'Question',
      consigne: '',
      reponses: ['pelassions'],
      reponsesPourCorrige: ['que nous pelassions'],
      infinitif: 'peler',
      pronom: 'que nous',
      mode: 'subjonctif',
      temps: 'imparfait',
      conjugaison1: 'pelassions',
      radicalReference: {
        kind: 'past-simple-il',
        label: 'il au passé simple',
        form: 'pela',
        removableEnding: 'a',
        radical: 'pel',
        targetEnding: 'assions',
        referenceMode: 'indicatif',
        referenceTense: 'passé simple',
        referenceSubject: 'il',
        strategy: 'remove-ending',
        validated: true,
      },
    }, {
      infinitif: 'peler',
      groupeConjugaison: 1,
      terminaison: 'er',
      auxiliaire: 'avoir',
      participePasse: 'pelé',
    })

    assert.match(values.contextualBaseHelp, /<var>pel-<\/var>/)
    assert.match(values.contextualBaseHelp, /<samp>-assions<\/samp>/)
    assert.match(values.contextualBaseHelp, /<var>pel<\/var><samp>assions<\/samp>/)
    assert.doesNotMatch(values.contextualBaseHelp, /<var>pela-<\/var>/)
    assert.doesNotMatch(values.contextualBaseHelp, /<samp>-ssions<\/samp>/)
  })

  it('traite qu’ils au subjonctif présent comme la forme repère ils', () => {
    const values = coachHelpQuestionVariables({
      titre: 'Question',
      consigne: '',
      reponses: ['rient'],
      reponsesPourCorrige: ['qu’ils rient'],
      infinitif: 'rire',
      pronom: 'qu’ils',
      mode: 'subjonctif',
      temps: 'présent',
      conjugaison1: 'rient',
      radicalReference: {
        kind: 'present-ils',
        label: 'ils au présent',
        form: 'rient',
        removableEnding: 'ent',
        radical: 'ri',
        targetEnding: 'ent',
        referenceMode: 'indicatif',
        referenceTense: 'présent',
        referenceSubject: 'ils',
        strategy: 'remove-ending',
        validated: true,
        subjunctivePresentReferences: [
          { subject: 'ils', form: 'rient' },
          { subject: 'nous', form: 'rions' },
        ],
      },
    })

    assert.match(values.contextualBaseHelp, /La forme demandée est une <strong>forme repère<\/strong>/)
    assert.doesNotMatch(values.contextualBaseHelp, /Enlève <kbd>-ent<\/kbd>/)
    assert.match(values.contextualBaseHelp, /<mark><strong>rient<\/strong><\/mark>/)
  })

  it('explicite l’accord pluriel avec être aux temps composés', () => {
    const values = coachHelpQuestionVariables({
      titre: 'Question',
      consigne: '',
      reponses: ['soyons nés'],
      reponsesPourCorrige: ['soyons nés'],
      infinitif: 'naître',
      pronom: 'nous',
      mode: 'impératif',
      temps: 'passé',
      conjugaison1: 'soyons nés',
      isCompound: true,
    }, {
      infinitif: 'naître',
      groupeConjugaison: 3,
      terminaison: 'aître',
      auxiliaire: 'être',
      participePasse: 'né',
    })

    assert.match(values.contextualBaseHelp, /Accord du participe passé/)
    assert.match(values.contextualBaseHelp, /<strong>né<\/strong> devient <strong>nés<\/strong>/)
  })

  it('assimile elle à il quand la troisième personne est la forme repère', () => {
    const values = coachHelpQuestionVariables({
      titre: 'Question',
      consigne: '',
      reponses: ['fut'],
      reponsesPourCorrige: ['elle fut'],
      infinitif: 'être',
      pronom: 'elle',
      mode: 'indicatif',
      temps: 'passé simple',
      conjugaison1: 'fut',
      radicalReference: {
        kind: 'past-simple-il',
        label: 'il au passé simple',
        form: 'fut',
        removableEnding: 't',
        radical: 'fu',
        targetEnding: 't',
        referenceMode: 'indicatif',
        referenceTense: 'passé simple',
        referenceSubject: 'il',
        strategy: 'remove-ending',
        validated: true,
      },
    }, {
      infinitif: 'être',
      groupeConjugaison: 3,
      terminaison: 're',
      auxiliaire: 'avoir',
      participePasse: 'été',
    })

    assert.match(values.contextualBaseHelp, /La forme demandée est justement la <strong>forme repère<\/strong>/)
    assert.match(values.contextualBaseHelp, /<mark><strong>fut<\/strong><\/mark>/)
    assert.match(values.contextualBaseHelp, /En effet/)
  })
})
