import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

const read = path => readFile(new URL(path, import.meta.url), 'utf8')

describe('contraste des blocs de texte de l’aide du coach', () => {
  it('blanchit seulement les surfaces du bloc pédagogique détaillé', async () => {
    const view = await read('../app/components/coach/CoachHelpBlockView.vue')
    const panel = await read('../app/components/coach/CoachHelpPanel.vue')

    assert.match(view, /\.coach-help-block__content--radical\{--help-list-surface:#fff\}/u)
    assert.match(view, /figure:has\(>figcaption\)\)\{background:color-mix\(in srgb,var\(--coach-color,#295f72\) 8%,white\)\}/u)
    assert.match(view, /\.coach-help-block__content--radical :deep\(blockquote\),[\s\S]*background:#fff/u)
    assert.match(view, /data-theme='dark'[\s\S]*\.coach-help-block__content--radical\)\{--help-list-surface:#20383d\}/u)
    assert.match(view, /\.coach-help-block--definition\{/u)
    assert.match(panel, /class="coach-help-consult"/u)
    assert.match(panel, /class="coach-help-feedback"/u)
  })

  it('propose un coach du niveau d’aide supérieur après le retour automatique', async () => {
    const panel = await read('../app/components/coach/CoachHelpPanel.vue')
    const chat = await read('../app/components/exercise/ChatExercise.vue')
    const wizard = await read('../app/components/challenge/WizardChallengeWorkspace.vue')
    const challenge = await read('../app/components/challenge/ChallengeWorkspace.vue')
    const learner = await read('../app/components/learner/LearnerSpace.vue')

    assert.match(panel, /activeProfile\.value\.id === 'tres-condensee'\) return \['complete', 'complete-avec-reponses'\]/u)
    assert.match(panel, /activeProfile\.value\.id === 'complete'\) return \['complete-avec-reponses'\]/u)
    assert.match(panel, /coachPairForPicker\(available, \(\) => 0\)/u)
    assert.match(panel, /coach\.status === 'published' && coach\.helpApproach === approach/u)
    assert.match(panel, /recommendedCoach\.pedagogicalStyle/u)
    assert.match(panel, /coach-help-recommendation__group\+\.coach-help-recommendation__group/u)
    assert.match(panel, /recommendedCoach\.avatarPath/u)
    assert.match(panel, /emit\('changeCoach', recommendedCoach\)/u)
    assert.ok(panel.indexOf('class="coach-help-feedback coach-help-recommendation"') > panel.indexOf('class="coach-help-feedback__error"'))
    assert.match(chat, /track\('coach_selected', \{ coach: coach\.id, previousCoach: props\.coach\.id, source: 'help_recommendation' \}\)/u)
    assert.match(chat, /@change-coach="changeCoachFromHelp"/u)
    for (const parent of [wizard, challenge, learner]) assert.match(parent, /@change-coach="selectedCoach = \$event"/u)
  })
})
