import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import { addClassicSpeechTokens, readClassicSpeechToken, spokenTenseAndMode } from '../server/services/classic-speech-token.ts'
import { azureSpeechVoice, classicSpeechSsml } from '../server/services/azure-speech.ts'

const read = path => readFile(new URL(path, import.meta.url), 'utf8')

describe('lecture audio des exercices', () => {
  it('garde la synthèse navigateur du chat désactivée', async () => {
    const [featureFlags, chat] = await Promise.all([
      read('../shared/config/feature-flags.ts'),
      read('../app/components/exercise/ChatExercise.vue'),
    ])
    assert.match(featureFlags, /export const AUDIO_READING_ENABLED = false/u)
    assert.match(chat, /import \{ AUDIO_READING_ENABLED \} from '~~\/shared\/config\/feature-flags'/u)
    assert.match(chat, /speechSupported\.value = audioReadingEnabled/u)
  })

  it('utilise exclusivement le point Azure sécurisé dans l’exercice classique', async () => {
    const [classic, questionnaireApi] = await Promise.all([
      read('../app/components/exercise/ClassicExercise.vue'),
      read('../server/api/questionnaires/index.post.ts'),
    ])
    assert.match(classic, /fetch\('\/api\/speech\/classic'/u)
    assert.match(classic, /faVolume/u)
    assert.match(classic, /faCirclePlay/u)
    assert.doesNotMatch(classic, /speechSynthesis|SpeechSynthesisUtterance/u)
    assert.match(classic, /answerHeardBeforeSubmission\.value = true/u)
    assert.doesNotMatch(classic, /exercise-audio-toggle|audioEnabled|faVolumeXmark/u)
    assert.match(classic, /speakingKey === 'question' \? faStop : faVolume/u)
    assert.match(classic, /audioLoadingKey === 'question' \? faSpinner/u)
    assert.match(classic, /audioLoadingKey === 'answer' \? faSpinner/u)
    assert.match(classic, /:spin="audioLoadingKey === 'question'"/u)
    assert.match(classic, /:spin="audioLoadingKey === 'answer'"/u)
    assert.match(questionnaireApi, /request\.learningSupportMode === 'cif-fle'/u)
  })

  it('propose chaque message du coach à l’écoute uniquement en mode CIF/FLE', async () => {
    const [chat, coachSpeechApi, workspace, wizard] = await Promise.all([
      read('../app/components/exercise/ChatExercise.vue'),
      read('../server/api/speech/coach.post.ts'),
      read('../app/components/challenge/ChallengeWorkspace.vue'),
      read('../app/components/challenge/WizardChallengeWorkspace.vue'),
    ])
    assert.match(chat, /coachMessageAudioEnabled = computed/u)
    assert.match(chat, /learningSupportMode === 'cif-fle'/u)
    assert.match(chat, /message\.author === 'coach'/u)
    assert.match(chat, /class="chat-message-audio-button"/u)
    assert.match(chat, /fetch\(message\.speechToken \? '\/api\/speech\/classic' : '\/api\/speech\/coach'/u)
    assert.match(chat, /voiceGender: props\.coach\.gender/g)
    assert.match(chat, /coachId: props\.coach\.id/g)
    assert.match(chat, /faSpinner/u)
    assert.match(chat, /faVolume/u)
    assert.match(coachSpeechApi, /PUBLIC_RATE_LIMITS\.speech/u)
    assert.match(coachSpeechApi, /MAX_COACH_MESSAGE_LENGTH = 1_200/u)
    assert.match(workspace, /:learning-support-mode="challenge\.learningSupportMode"/u)
    assert.match(wizard, /:learning-support-mode="challenge\.learningSupportMode"/u)
  })

  it('accorde la voix Azure au genre du coach sélectionné', async () => {
    const [classicSpeechApi, coachSpeechApi] = await Promise.all([
      read('../server/api/speech/classic.post.ts'),
      read('../server/api/speech/coach.post.ts'),
    ])
    assert.equal(azureSpeechVoice('fr-CH-ArianeNeural', 'female'), 'fr-FR-YvetteNeural')
    assert.equal(azureSpeechVoice('fr-CH-ArianeNeural', 'male'), 'fr-FR-JeromeNeural')
    assert.match(classicSpeechApi, /await coachSpeechVoiceGender\(coachId\)/u)
    assert.match(coachSpeechApi, /await coachSpeechVoiceGender\(coachId\)/u)
    assert.match(classicSpeechApi, /'X-Speech-Voice': result\.voice/u)
    assert.match(coachSpeechApi, /'X-Speech-Voice': result\.voice/u)
  })

  it('réutilise les jetons sécurisés du classique pour la question et la correction du chat', async () => {
    const chat = await read('../app/components/exercise/ChatExercise.vue')
    assert.match(chat, /question\.speech\?\.questionToken/u)
    assert.match(chat, /speechToken: question\.speech\.questionToken/u)
    assert.match(chat, /question\.speech\?\.answerToken/u)
    assert.match(chat, /addAnswerComparison\(candidate, officialAnswers, question\.reponsesPourCorrige, question\.speech\?\.answerToken\)/u)
    assert.match(chat, /if \(message\.answerLine\) return Boolean\(message\.speechToken\)/u)
    assert.match(chat, /answerLine: true,[\s\S]*question\.speech\?\.answerToken \? \{ speechToken: question\.speech\.answerToken \}/u)
  })

  it('formule le temps et le mode comme une phrase française', () => {
    assert.equal(spokenTenseAndMode('futur', 'indicatif'), 'au futur de l’indicatif')
    assert.equal(spokenTenseAndMode('imparfait', 'indicatif'), 'à l’imparfait de l’indicatif')
  })

  it('détache les segments et échappe le XML Azure', () => {
    const ssml = classicSpeechSsml({
      version: 1,
      purpose: 'question',
      segments: ['vous', 'visiter', 'au futur de l’indicatif & simplement'],
      expiresAt: Date.now() + 1000,
    }, 'fr-CH-ArianeNeural')
    assert.match(ssml, /vous<break time="520ms"\/>visiter/u)
    assert.match(ssml, /&amp; simplement/u)
  })

  it('répète une réponse hachée puis comme une phrase naturelle avec ses liaisons', () => {
    const ssml = classicSpeechSsml({
      version: 1,
      purpose: 'answer',
      segments: ['ils', 'auraient', 'été'],
      expiresAt: Date.now() + 1000,
    }, 'fr-CH-ArianeNeural')
    assert.match(ssml, /ils<break time="420ms"\/>auraient<break time="420ms"\/>été/u)
    assert.match(ssml, /<break time="700ms"\/><prosody rate="-2%"><s>ils auraient été<\/s><\/prosody>/u)
  })

  it('lit un message du coach comme une phrase naturelle', () => {
    const ssml = classicSpeechSsml({
      purpose: 'coach-message',
      segments: ['Observe le radical, puis choisis la terminaison.'],
    }, 'fr-CH-ArianeNeural')
    assert.match(ssml, /<prosody rate="-3%"><s>Observe le radical, puis choisis la terminaison\.<\/s><\/prosody>/u)
    assert.doesNotMatch(ssml, /<break time=/u)
  })

  it('ralentit uniquement les lectures du panneau d’aide', () => {
    const help = classicSpeechSsml({
      purpose: 'help-message',
      segments: ['nous achetons'],
    }, 'fr-CH-ArianeNeural')
    const chat = classicSpeechSsml({
      purpose: 'coach-message',
      segments: ['Nous continuons.'],
    }, 'fr-CH-ArianeNeural')
    assert.match(help, /<prosody rate="-22%"><s>nous achetons<\/s><\/prosody>/u)
    assert.match(chat, /<prosody rate="-3%"><s>Nous continuons\.<\/s><\/prosody>/u)
  })

  it('détache chaque mot d’une forme conjuguée dans le panneau d’aide', () => {
    const help = classicSpeechSsml({
      purpose: 'help-conjugation',
      segments: ['ils', 'auraient', 'été'],
    }, 'fr-CH-FabriceNeural')
    assert.match(help, /<prosody rate="-18%">ils<break time="600ms"\/>auraient<break time="600ms"\/>été<\/prosody>/u)
  })

  it('lit le verbe et sa définition dans une seule phrase sans pause forcée', () => {
    const ssml = classicSpeechSsml({
      purpose: 'definition',
      segments: ['Le verbe acheter veut dire :', 'Donner de l’argent pour recevoir quelque chose.'],
    }, 'fr-CH-FabriceNeural')
    assert.match(ssml, /<prosody rate="-25%"><s>Le verbe acheter veut dire : Donner de l’argent pour recevoir quelque chose\.<\/s><\/prosody>/u)
    assert.doesNotMatch(ssml, /<break time=/u)
  })

  it('réserve le panneau CIFFLE à la définition et aux temps choisis', async () => {
    const [chat, panel, content] = await Promise.all([
      read('../app/components/exercise/ChatExercise.vue'),
      read('../app/components/coach/CoachHelpPanel.vue'),
      read('../app/components/coach/CoachAllophoneHelpContent.vue'),
    ])
    assert.match(chat, /props\.coach\.helpApproach === 'allophone'/u)
    assert.match(panel, /<CoachAllophoneHelpContent[\s\S]*v-if="allophoneMode"/u)
    assert.match(panel, /<template v-else>[\s\S]*Conjugaison complète/u)
    assert.match(content, /speechKind: 'definition'/u)
    assert.match(content, /v-for="tense in displayedTenses"/u)
    assert.match(content, /v-for="row in tense\.rows"/u)
    assert.doesNotMatch(content, /uiLabel\(tense\.mode\.name\)/u)
    assert.match(content, /faChevronDown/u)
    assert.match(content, /faChevronRight/u)
    assert.match(content, /allophone-help__tense-title[\s\S]*allophone-help__expand[\s\S]*uiLabel\(tense\.name\)/u)
    assert.match(content, /allophone-help__tense\[open\] \.allophone-help__expand-collapsed/u)
    assert.match(content, /toggleAudio\(`tense-\$\{tense\.id\}`,[\s\S]*uiLabel\(tense\.name\)/u)
  })

  it('prépare aussi l’écoute des formes sans pronom comme le gérondif', () => {
    globalThis.useRuntimeConfig = () => ({ classicSpeechTokenSecret: 'secret-audio-local-suffisamment-long' })
    try {
      const question = addClassicSpeechTokens({
        titre: 'Faire',
        consigne: 'Le gérondif présent de Faire',
        infinitif: 'faire',
        temps: 'présent',
        mode: 'gérondif',
        reponses: ['En faisant'],
        reponsesPourCorrige: ['En faisant'],
      })
      assert.ok(question.speech?.questionToken)
      assert.ok(question.speech?.answerToken)
      assert.deepEqual(readClassicSpeechToken(question.speech.questionToken).segments, ['faire', 'au présent du gérondif'])
      assert.deepEqual(readClassicSpeechToken(question.speech.answerToken).segments, ['En', 'faisant'])
    } finally {
      delete globalThis.useRuntimeConfig
    }
  })
})
