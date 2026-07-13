import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

globalThis.createError = ({ statusCode, statusMessage }) => Object.assign(new Error(statusMessage), { statusCode })
const { parseAdminUserInput } = await import('../server/services/admin-users.ts')

describe('validation des utilisateurs administrés', () => {
  it('normalise un compte complet', () => {
    assert.deepEqual(parseAdminUserInput({
      prenom: '  Alice ',
      nom: ' Exemple ',
      email: ' ALICE@EXEMPLE.CH ',
      username: ' alice ',
      password: 'mot-de-passe-solide',
      privilegeId: 2,
    }, true), {
      prenom: 'Alice',
      nom: 'Exemple',
      email: 'alice@exemple.ch',
      username: 'alice',
      password: 'mot-de-passe-solide',
      privilegeId: 2,
    })
  })

  it('autorise un mot de passe vide lors d’une modification', () => {
    const input = parseAdminUserInput({
      prenom: 'Alice', nom: 'Exemple', email: 'alice@exemple.ch', username: 'alice', password: '', privilegeId: 2,
    }, false)
    assert.equal(input.password, '')
  })

  for (const [label, changes] of [
    ['adresse invalide', { email: 'pas-une-adresse' }],
    ['mot de passe trop court', { password: 'court' }],
    ['rôle invalide', { privilegeId: 1.5 }],
  ]) {
    it(`refuse : ${label}`, () => {
      assert.throws(() => parseAdminUserInput({
        prenom: 'Alice', nom: 'Exemple', email: 'alice@exemple.ch', username: 'alice', password: 'mot-de-passe-solide', privilegeId: 2,
        ...changes,
      }, true), error => error.statusCode === 400)
    })
  }
})
