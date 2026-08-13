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
})
