import assert from 'node:assert/strict'
import test from 'node:test'
import { nextZazizozuDiscoveryVisit, rememberZazizozuDiscoveryClick, ZAZIZOZU_CLICKED_KEY, ZAZIZOZU_ROTATION_KEY } from '../shared/utils/zazizozu-discovery.ts'

function browserStorage(data = new Map()) {
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
}

test('le bandeau apparaît exactement une fois par groupe de quatre visites, après rechargement aussi', () => {
  const data = new Map()
  const visits = Array.from({ length: 12 }, () => nextZazizozuDiscoveryVisit(browserStorage(data)))
  assert.deepEqual(visits, [true, false, false, false, true, false, false, false, true, false, false, false])
})

test('un clic supprime les apparitions futures quel que soit le compteur', () => {
  for (const phase of ['0', '1', '2', '3']) {
    const data = new Map([[ZAZIZOZU_ROTATION_KEY, phase]])
    rememberZazizozuDiscoveryClick(browserStorage(data))
    for (let visit = 0; visit < 8; visit++) assert.equal(nextZazizozuDiscoveryVisit(browserStorage(data)), false)
    assert.equal(data.get(ZAZIZOZU_CLICKED_KEY), '1')
    assert.equal(data.get(ZAZIZOZU_ROTATION_KEY), phase)
  }
})

test('un compteur corrompu repart sur un cycle valide', () => {
  for (const value of ['NaN', '-1', '4', 'Infinity', '1.5', '']) {
    const data = new Map([[ZAZIZOZU_ROTATION_KEY, value]])
    const storage = browserStorage(data)
    assert.equal(nextZazizozuDiscoveryVisit(storage), true)
    assert.equal(nextZazizozuDiscoveryVisit(storage), false)
  }
})

test('un stockage bloqué ou plein ne provoque ni répétition du bandeau ni erreur de navigation', () => {
  const blocked = { getItem() { throw Error('blocked') }, setItem() { throw Error('blocked') } }
  const full = { getItem() { return null }, setItem() { throw Error('quota') } }
  for (const storage of [blocked, full]) {
    for (let visit = 0; visit < 4; visit++) assert.equal(nextZazizozuDiscoveryVisit(storage), false)
    assert.doesNotThrow(() => rememberZazizozuDiscoveryClick(storage))
  }
})
