import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

const read = path => readFile(new URL(path, import.meta.url), 'utf8')

describe('priorité 1 de l’audit d’accessibilité', () => {
  it('aère les questions et laisse les choix revenir à la ligne', async () => {
    const [mainCss, chat, options] = await Promise.all([
      read('../app/assets/css/main.css'),
      read('../app/components/exercise/ChatExercise.vue'),
      read('../app/components/challenge/ChallengeOptions.vue'),
    ])

    assert.match(mainCss, /\.question-text[\s\S]*letter-spacing: normal;[\s\S]*line-height: 1\.45;/u)
    assert.match(mainCss, /\.classic-mode-choices button[\s\S]*overflow-wrap: anywhere;[\s\S]*white-space: normal;/u)
    assert.match(chat, /\.chat-mode-choices button[^{]*\{[^}]*font-size: clamp\(\.875rem,[^}]*white-space: normal;/u)
    assert.match(options, /\.field-hint[^}]*font-size: \.875rem/u)
  })

  it('conserve les réglages de lecture dans les exercices classique et avec coach', async () => {
    const [layout, initializer, classic, chat] = await Promise.all([
      read('../app/layouts/default.vue'),
      read('../public/theme-init.js'),
      read('../app/components/exercise/ClassicExercise.vue'),
      read('../app/components/exercise/ChatExercise.vue'),
    ])

    assert.doesNotMatch(layout, /reading-comfort-switch|toggleReadingComfort|data-reading-comfort/u)
    assert.doesNotMatch(initializer, /conjugaison\.reading-comfort/u)
    assert.match(layout, /:is\(\.exercise-overlay, \.chat-overlay\) \{[\s\S]*font-family: Arial,[\s\S]*font-size: 112\.5%;[\s\S]*line-height: 1\.5;/u)
    assert.match(layout, /:is\(\.exercise-overlay, \.chat-overlay\) :is\(p, li, dd, blockquote, figcaption, label\)/u)
    assert.match(layout, /:is\(\.exercise-overlay, \.chat-overlay\) button \{[\s\S]*white-space: normal;/u)
    for (const exercise of [classic, chat]) {
      assert.match(exercise, /function spokenAnswerParts\(text: string\) \{\s+return text\.trim\(\)\.split\(\/\\s\+\/u\)\.filter\(Boolean\)/u)
      assert.ok(exercise.includes('}, 420)'))
    }
  })

  it('garde l’impression ordinaire par défaut et offre un profil inclusif pour PDF et Word', async () => {
    const [builder, preview] = await Promise.all([
      read('../app/composables/useChallengeBuilder.ts'),
      read('../app/components/challenge/PrintPreview.vue'),
    ])

    assert.match(builder, /inclusiveDisplay: false/u)
    assert.match(preview, /Affichage inclusif/u)
    assert.match(preview, /inclusivePrint\.value \? 12 : 10\.5/u)
    assert.match(preview, /inclusivePrint\.value \? 24 : 21/u)
    assert.match(preview, /inclusivePrint\.value \? 360 : 240/u)
    assert.match(preview, /font: 'Arial'/u)
    assert.match(preview, /const INCLUSIVE_GRADE_TOP_MM = 26/u)
    assert.match(preview, /const gradeTop = inclusivePrint\.value \? INCLUSIVE_GRADE_TOP_MM : 15/u)
    assert.match(preview, /if \(inclusivePrint\.value\) y = Math\.max\(y, gradeTop \+ GRADE_BOX_SIZE_MM\)/u)
    assert.match(preview, /const INCLUSIVE_QUESTION_LINE_HEIGHT_MM = 7\.5/u)
    assert.match(preview, /lineHeightFactor: questionLineHeightFactor/u)
  })
})
