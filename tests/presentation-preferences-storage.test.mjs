import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { runInNewContext } from 'node:vm'

const script = await readFile(new URL('../public/theme-init.js', import.meta.url), 'utf8')

function initialPresentation(cookie, allowStorage = true) {
  const document = { cookie, documentElement: { dataset: {}, style: {} } }
  let reads = 0
  runInNewContext(script, {
    document,
    localStorage: { getItem(key) {
      reads++
      if (!allowStorage) throw Error('Stockage bloqué')
      return key === 'conjugaison.theme' ? 'dark' : 'true'
    } },
  })
  return { ...document.documentElement, reads }
}

test('le refus de mémorisation empêche la lecture de préférences locales au démarrage', () => {
  const result = initialPresentation('autre=1; tatitotu_remember_preferences=%22disabled%22', false)
  assert.equal(result.dataset.theme, 'light')
  assert.equal(result.dataset.falcMode, 'false')
  assert.equal(result.reads, 0)
})

test('la mémorisation activée ou non encore réglée restaure le thème et le mode FALC', () => {
  for (const cookie of ['', 'tatitotu_remember_preferences=%22enabled%22']) {
    const result = initialPresentation(cookie)
    assert.equal(result.dataset.theme, 'dark')
    assert.equal(result.dataset.falcMode, 'true')
    assert.equal(result.reads, 2)
  }
})

test('un cookie de mémorisation mal formé conserve le comportement par défaut', () => {
  const result = initialPresentation('tatitotu_remember_preferences=invalide')
  assert.equal(result.dataset.theme, 'dark')
  assert.equal(result.dataset.falcMode, 'true')
})
