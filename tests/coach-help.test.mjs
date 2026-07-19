import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { automaticOrthographyHelpBlocks, buildContextualBaseTitle, buildDefinitionHelpHtml, buildReferenceFormHelpHtml, coachHelpBlockUsesPedagogicalApproach, coachHelpQuestionVariables, defaultCoachHelpBlocks, renderCoachHelpContent, visibleCoachHelpBlocks } from '../shared/utils/coach-help.ts'
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
  it('ne prédéfinit aucun contenu pour une nouvelle aide', () => {
    assert.deepEqual(defaultCoachHelpBlocks(), [])
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
    assert.match(html, /apprends par cœur sa forme repère avec le pronom <strong>nous<\/strong> :/)
    assert.doesNotMatch(html, /forme repère <strong>au présent<\/strong>/)
    assert.match(html, /<p><mark><strong><i>♥<\/i> Nous mangeons<\/strong><\/mark><\/p>/)
    assert.match(indicativeOnlyBase, /Terminaisons de l’imparfait<\/strong>/)
    assert.doesNotMatch(indicativeOnlyBase, /Terminaisons de l’imparfait de l’indicatif/)
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
    assert.match(values.referenceFormHelp, /pronom <strong>il<\/strong>/)
    assert.match(values.referenceFormHelp, /<mark><strong><i>♥<\/i> Il mangea<\/strong><\/mark>/)
    assert.match(values.contextualBaseHelp, /<mark><strong><i>♥<\/i> Il mangea<\/strong><\/mark>/)
    assert.match(values.endingsHelp, /<i>♥<\/i> Il mangea/)
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

  it('n’expose que l’instantané marqué comme publié', () => {
    assert.deepEqual(visibleCoachHelpBlocks({ id: 1, name: 'A', description: '', headerTitle: '{helpTitle}', headerDescription: '', status: 'draft', blocks: [block] }), [])
    assert.deepEqual(visibleCoachHelpBlocks({ id: 1, name: 'A', description: '', headerTitle: '{helpTitle}', headerDescription: '', status: 'published', blocks: [block] }), [block])
  })

  it('ajoute le bloc G uniquement aux verbes concernés', () => {
    const [manger] = automaticOrthographyHelpBlocks({ verb: 'manger' })
    assert.equal(manger.title, 'La lettre G')
    assert.match(manger.content, /gare · gomme · légume · grimper/)
    assert.match(manger.content, /nous mangeons/)
    assert.match(manger.content, /il mangeait/)
    assert.match(manger.content, /nous mangions/)

    const [naviguer] = automaticOrthographyHelpBlocks({ verb: 'naviguer' })
    assert.match(naviguer.content, /le <strong>u<\/strong> reste/)
    assert.match(naviguer.content, /nous naviguons/)
    assert.deepEqual(automaticOrthographyHelpBlocks({ verb: 'finir' }), [])
  })

  it('ajoute le bloc C et ses exemples adaptés aux verbes en -cer', () => {
    const [blockC] = automaticOrthographyHelpBlocks({ verb: 's’avancer' })
    assert.equal(blockC.title, 'La lettre C et la cédille')
    assert.match(blockC.content, /café · colle · cube · courir/)
    assert.match(blockC.content, /nous avançons/)
    assert.match(blockC.content, /il avançait/)
    assert.match(blockC.content, /nous avancions/)
  })
})
