import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

const read = path => readFile(new URL(path, import.meta.url), 'utf8')

describe('consultation du verbe depuis le chat', () => {
  it('ouvre les accès du chat dans une modale sans remplacer le défi', async () => {
    const [chat, help, modal] = await Promise.all([
      read('../app/components/exercise/ChatExercise.vue'),
      read('../app/components/coach/CoachHelpPanel.vue'),
      read('../app/components/exercise/VerbConsultationModal.vue'),
    ])

    assert.match(chat, /<VerbConsultationModal/u)
    assert.match(chat, /import VerbConsultationModal from '~\/components\/exercise\/VerbConsultationModal\.vue'/u)
    assert.match(chat, /@consult-verb="openVerbConsultation"/u)
    assert.match(chat, /@click\.stop="openVerbConsultation\(message\.consultVerbId\)"/u)
    assert.match(chat, /@click\.stop="openVerbConsultation\(item\.verbId\)"/u)
    assert.match(chat, /:header-color="coach\.themeColor"/u)
    assert.doesNotMatch(help, /target="_blank"/u)
    assert.match(help, /emit\('consultVerb', consultVerbId\)/u)
    assert.match(modal, /\/api\/conjugaisons\/\$\{id\}/u)
    assert.match(modal, /\/api\/catalogue/u)
    assert.match(modal, /v-for="group in groups"/u)
    assert.doesNotMatch(modal, /<iframe/u)
    assert.doesNotMatch(modal, /ui\('Conjugaison complète'\)/u)
    assert.match(modal, /<strong>\{\{ ui\('Consulter le verbe'\) \}\}<\/strong>/u)
  })

  it('ouvre aussi la consultation du mode classique dans la même modale', async () => {
    const classic = await read('../app/components/exercise/ClassicExercise.vue')

    assert.match(classic, /<VerbConsultationModal/u)
    assert.match(classic, /import VerbConsultationModal from '~\/components\/exercise\/VerbConsultationModal\.vue'/u)
    assert.match(classic, /@click="openVerbConsultation\(attempt\.question\.verbeId\)"/u)
    assert.doesNotMatch(classic, /target="_blank"/u)
  })

  it('conserve la protection anti-iframe du reste du site', async () => {
    const security = await read('../server/middleware/security.ts')

    assert.match(security, /frame-ancestors 'none'/u)
    assert.match(security, /'X-Frame-Options': 'DENY'/u)
  })

  it('ferme la modale avec Retour au défi en haut comme en bas', async () => {
    const [page, layout, messages] = await Promise.all([
      read('../app/pages/consulter.vue'),
      read('../app/layouts/default.vue'),
      read('../shared/i18n/ui-messages.ts'),
    ])

    assert.match(page, /tatitotu:close-verb-consultation/u)
    assert.match(page, /embeddedInChallenge \? ui\('Retour au défi'\)/u)
    assert.match(page, /class="consultation-return-bottom"/u)
    assert.match(layout, /site-main--embedded/u)
    assert.match(layout, /v-if="!embeddedConsultation" class="site-header"/u)
    assert.match(messages, /'Retour au défi'/u)
  })
})
