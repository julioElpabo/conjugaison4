import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

globalThis.createError = ({ statusCode, statusMessage }) => Object.assign(new Error(statusMessage), { statusCode })
const { parseAdminUserInput } = await import('../server/services/admin-users.ts')

describe('validation des comptes admins', () => {
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
      privilegeId: 1,
    })
  })

  it('autorise un mot de passe vide lors d’une modification', () => {
    const input = parseAdminUserInput({
      prenom: 'Alice', nom: 'Exemple', email: 'alice@exemple.ch', username: 'alice', password: '', privilegeId: 2,
    }, false)
    assert.equal(input.password, '')
    assert.equal(input.privilegeId, 1)
  })

  for (const [label, changes] of [
    ['adresse invalide', { email: 'pas-une-adresse' }],
    ['mot de passe trop court', { password: 'court' }],
  ]) {
    it(`refuse : ${label}`, () => {
      assert.throws(() => parseAdminUserInput({
        prenom: 'Alice', nom: 'Exemple', email: 'alice@exemple.ch', username: 'alice', password: 'mot-de-passe-solide', privilegeId: 2,
        ...changes,
      }, true), error => error.statusCode === 400)
    })
  }

  it('efface les mots de passe de l’ancienne table ADMINS au démarrage', async () => {
    const migration = await readFile(new URL('../server/plugins/admin-security-migrations.ts', import.meta.url), 'utf8')

    assert.match(migration, /UPDATE `ADMINS` SET `password`='' WHERE `password`<>''/u)
  })
})
