import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

const pagePath = new URL('../app/pages/admin/feedbacks.vue', import.meta.url)
const exportPath = new URL('../server/api/admin/coach-help-feedbacks/export.get.ts', import.meta.url)
const deletePath = new URL('../server/api/admin/coach-help-feedbacks/all.delete.ts', import.meta.url)
const listPath = new URL('../server/api/admin/coach-help-feedbacks.get.ts', import.meta.url)

describe('traitement global des feedbacks administrateur', () => {
  it('remplace la validation individuelle par Tout copier et Tout supprimer', async () => {
    const page = await readFile(pagePath, 'utf8')

    assert.match(page, /Tout copier pour Codex/u)
    assert.match(page, /Tout supprimer/u)
    assert.doesNotMatch(page, />\s*Valider\s*</u)
    assert.doesNotMatch(page, /Remettre non-validé/u)
    assert.doesNotMatch(page, /updateFeedback/u)
  })

  it('exporte tous les feedbacks utilisateurs sans filtre de validation', async () => {
    const endpoint = await readFile(exportPath, 'utf8')

    assert.match(endpoint, /WHERE origin='user'/u)
    assert.doesNotMatch(endpoint, /validation_status='validated'/u)
    assert.doesNotMatch(endpoint, /moderation_status='active'/u)
    assert.match(endpoint, /Analyse tous les feedbacks utilisateurs/u)
  })

  it('supprime exclusivement tous les feedbacks utilisateurs après confirmation dans la page', async () => {
    const [page, endpoint] = await Promise.all([
      readFile(pagePath, 'utf8'),
      readFile(deletePath, 'utf8'),
    ])

    assert.match(page, /window\.confirm/u)
    assert.match(page, /coach-help-feedbacks\/all/u)
    assert.match(endpoint, /requireAdministrator\(event\)/u)
    assert.match(endpoint, /DELETE FROM coach_help_feedback WHERE origin='user'/u)
  })

  it('affiche le nombre total en base plutôt que la seule page chargée', async () => {
    const [page, endpoint] = await Promise.all([
      readFile(pagePath, 'utf8'),
      readFile(listPath, 'utf8'),
    ])

    assert.match(endpoint, /COUNT\(\*\) AS totalCount/u)
    assert.match(page, /Tout copier pour Codex \(\$\{totalCount\}\)/u)
    assert.match(page, /Tout supprimer \(\$\{totalCount\}\)/u)
  })

  it('ne renvoie plus les anciens statuts de validation dans la page des retours utilisateurs', async () => {
    const endpoint = await readFile(listPath, 'utf8')

    assert.match(endpoint, /origin === 'automatic' \? \{/u)
  })
})
