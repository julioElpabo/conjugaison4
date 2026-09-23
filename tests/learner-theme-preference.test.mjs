import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('enregistre automatiquement le thème choisi par un utilisateur connecté', async () => {
  const [layout, learnerSpace] = await Promise.all([
    readFile(new URL('../app/layouts/default.vue', import.meta.url), 'utf8'),
    readFile(new URL('../app/components/learner/LearnerSpace.vue', import.meta.url), 'utf8'),
  ])

  assert.match(layout, /if \(learner\.value\) \{[\s\S]*?\$fetch\('\/api\/learner\/preferences'/u)
  assert.match(layout, /method: 'PUT'[\s\S]*?interfaceLocale: interfaceLocale\.value,[\s\S]*?colorTheme: nextTheme/u)
  assert.match(layout, /applyTheme\(nextTheme\)[\s\S]*?if \(learner\.value\)/u)
  assert.match(learnerSpace, /watch\(theme, \(nextTheme\) => \{\s+if \(!props\.readOnly\) preferredTheme\.value = nextTheme/u)
})
