import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

const read = path => readFile(new URL(path, import.meta.url), 'utf8')

describe('repérage des consignes dans le chat', () => {
  it('marque toutes les bulles qui portent la consigne', async () => {
    const chat = await read('../app/components/exercise/ChatExercise.vue')

    assert.match(chat, /if \(question\.instruction\) await addCoachText\(question\.instruction, undefined, false, true\)/u)
    assert.match(chat, /text: bubbles\.formula,\s+emphasis: true,\s+instructionPrompt: true,\s+\.\.\.\(question\.speech\?\.questionToken/u)
    assert.match(chat, /answerLine: true,\s+instructionPrompt: true,/u)
    assert.match(chat, /identificationPrompt: true,\s+instructionPrompt: true,/u)
  })

  it('réserve le blanc aux consignes et teinte les autres messages avec la couleur du coach', async () => {
    const chat = await read('../app/components/exercise/ChatExercise.vue')

    assert.match(chat, /'chat-message--instruction': message\.instructionPrompt/u)
    assert.match(chat, /const coachChatStyle = computed\(\(\) => \{[\s\S]*'--coach-message-bg': `hsl\(\$\{hue\} 62% 89%\)`/u)
    assert.match(chat, /\.chat-message--coach \{[\s\S]*background: var\(--coach-message-bg,[\s\S]*box-shadow: none;/u)
    assert.match(chat, /\.chat-message--coach\.chat-message--instruction \{[\s\S]*border-left: 6px solid var\(--coach-instruction-accent,[\s\S]*background: white;/u)
    assert.match(chat, /0 3px 7px rgb\(18 40 49 \/ 22%\),\s+0 10px 26px rgb\(18 40 49 \/ 30%\)/u)
  })
})
