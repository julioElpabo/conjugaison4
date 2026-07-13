<script setup lang="ts">
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

interface AdminTest { id: string, title: string, description: string, category: string }
interface ConjugationRule { id: string, label: string }
interface ConjugationAssertion {
  id: string
  property: 'titre' | 'consigne' | 'reponsesPourCorrige' | 'reponses'
  matcher: 'equal' | 'include'
  expected: string
  actual: string | string[]
  passed: boolean
}
interface ConjugationScenario {
  id: string
  name: string
  title: string
  purpose: string
  infinitif: string
  pronom: string
  mode: string
  tense: string
  sourceForms: string[]
  rules: ConjugationRule[]
  passed: boolean
  assertions: ConjugationAssertion[]
}
interface TestResultGroup {
  title: string
  description: string
  kind: 'general' | 'conjugation'
  passed: boolean
  cases: Array<{ title: string, passed: boolean, skipped: boolean }>
}
interface TestRun {
  success: boolean
  exitCode: number
  timedOut: boolean
  durationMs: number
  files: string[]
  summary: { tests: number, suites: number, passed: number, failed: number, skipped: number }
  groups: TestResultGroup[]
  conjugationScenarios: ConjugationScenario[]
  repairPrompt: string
  output: string
}

const { user, handleUnauthorized } = useAdminAuth()
const tests = ref<AdminTest[]>([])
const selected = ref<string[]>([])
const loading = ref(false)
const running = ref(false)
const error = ref('')
const result = ref<TestRun | null>(null)
const scenarioFilter = ref<'all' | 'passed' | 'failed'>('all')
const ruleFilter = ref('all')
const selectedScenarioId = ref('')
const promptCopied = ref(false)
let loaded = false

useHead({ title: 'Tests — Administration' })

const allSelected = computed(() => tests.value.length > 0 && selected.value.length === tests.value.length)
const testGroups = computed(() => {
  const groups = new Map<string, AdminTest[]>()
  for (const test of tests.value) groups.set(test.category, [...(groups.get(test.category) || []), test])
  return [...groups].map(([title, items]) => ({ title, items }))
})
const visibleScenarios = computed(() => {
  const scenarios = result.value?.conjugationScenarios || []
  return scenarios.filter((scenario) => {
    const statusMatches = scenarioFilter.value === 'all'
      || (scenarioFilter.value === 'passed' && scenario.passed)
      || (scenarioFilter.value === 'failed' && !scenario.passed)
    const ruleMatches = ruleFilter.value === 'all' || scenario.rules.some(rule => rule.id === ruleFilter.value)
    return statusMatches && ruleMatches
  })
})
const selectedScenario = computed(() => {
  return visibleScenarios.value.find(scenario => scenario.id === selectedScenarioId.value) || visibleScenarios.value[0] || null
})
const scenarioCounts = computed(() => {
  const scenarios = result.value?.conjugationScenarios || []
  return {
    all: scenarios.length,
    passed: scenarios.filter(scenario => scenario.passed).length,
    failed: scenarios.filter(scenario => !scenario.passed).length,
  }
})
const availableRules = computed(() => {
  const rules = new Map<string, { id: string, label: string, count: number }>()
  for (const scenario of result.value?.conjugationScenarios || []) {
    for (const rule of scenario.rules) {
      const current = rules.get(rule.id)
      rules.set(rule.id, { ...rule, count: (current?.count || 0) + 1 })
    }
  }
  return [...rules.values()].sort((left, right) => left.label.localeCompare(right.label, 'fr'))
})
const scenariosByMode = computed(() => {
  const modeOrder = ['indicatif', 'subjonctif', 'conditionnel', 'impératif', 'participe', 'infinitif', 'gérondif']
  const groups = new Map<string, ConjugationScenario[]>()
  for (const scenario of visibleScenarios.value) groups.set(scenario.mode, [...(groups.get(scenario.mode) || []), scenario])
  return [...groups]
    .sort(([left], [right]) => modeOrder.indexOf(left.toLocaleLowerCase('fr')) - modeOrder.indexOf(right.toLocaleLowerCase('fr')))
    .map(([mode, scenarios]) => ({ mode, scenarios }))
})
const generalResultGroups = computed(() => result.value?.groups.filter(group => group.kind === 'general') || [])

const assertionLabels: Record<ConjugationAssertion['property'], string> = {
  titre: 'Infinitif',
  consigne: 'Consigne',
  reponsesPourCorrige: 'Forme attendue dans le corrigé',
  reponses: 'Forme acceptée par le correcteur',
}
const assertionExplanations: Record<ConjugationAssertion['property'], string> = {
  titre: 'Le verbe demandé est correctement identifié.',
  consigne: 'Le pronom, le verbe, le temps et le mode sont correctement assemblés.',
  reponsesPourCorrige: 'Cette forme doit apparaître comme solution dans le corrigé.',
  reponses: 'Cette saisie doit être reconnue comme juste par le correcteur.',
}

async function loadTests() {
  loading.value = true
  error.value = ''
  try {
    const response = await $fetch<{ tests: AdminTest[] }>('/api/admin/tests', { credentials: 'same-origin' })
    tests.value = response.tests
    selected.value = response.tests.map(test => test.id)
  } catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de charger les tests.')
  } finally {
    loading.value = false
  }
}

function toggleAll() {
  selected.value = allSelected.value ? [] : tests.value.map(test => test.id)
}

async function runTests() {
  if (running.value || selected.value.length === 0) return
  running.value = true
  result.value = null
  error.value = ''
  try {
    result.value = await $fetch<TestRun>('/api/admin/tests/run', {
      method: 'POST',
      credentials: 'same-origin',
      body: { files: selected.value },
    })
    scenarioFilter.value = result.value.conjugationScenarios.some(scenario => !scenario.passed) ? 'failed' : 'all'
    ruleFilter.value = 'all'
    selectedScenarioId.value = result.value.conjugationScenarios.find(scenario => !scenario.passed)?.id
      || result.value.conjugationScenarios[0]?.id
      || ''
    promptCopied.value = false
  } catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de lancer les tests.')
  } finally {
    running.value = false
  }
}

async function copyRepairPrompt() {
  if (!result.value?.repairPrompt) return
  await navigator.clipboard.writeText(result.value.repairPrompt)
  promptCopied.value = true
  window.setTimeout(() => { promptCopied.value = false }, 2500)
}

watch(user, (current) => {
  if (current && !loaded) {
    loaded = true
    void loadTests()
  }
  if (!current) loaded = false
}, { immediate: true })
</script>

<template>
  <AdminAuthBoundary>
    <AdminShell>
      <div class="admin-tests">
        <header class="admin-section-heading">
          <div>
            <p class="admin-eyebrow">Qualité</p>
            <h1>Tests automatisés</h1>
            <p class="admin-muted">Lancez les tests métier et les scénarios importés de Postman sans quitter l’administration.</p>
          </div>
          <button class="admin-button admin-button--primary" :disabled="running || selected.length === 0" @click="runTests">
            {{ running ? 'Tests en cours…' : `Lancer ${selected.length} fichier${selected.length > 1 ? 's' : ''}` }}
          </button>
        </header>

        <p v-if="error" class="admin-notice admin-notice--error" role="alert">{{ error }}</p>

        <section class="admin-tests__selection admin-card" aria-labelledby="test-selection-title">
          <div class="admin-tests__selection-heading">
            <div><h2 id="test-selection-title">Suites disponibles</h2><p class="admin-muted">Les fichiers sont exécutés côté serveur avec le moteur de test Node.</p></div>
            <button class="admin-button admin-button--small" type="button" :disabled="loading" @click="toggleAll">
              {{ allSelected ? 'Tout désélectionner' : 'Tout sélectionner' }}
            </button>
          </div>
          <div v-if="loading" class="admin-tests__loading"><span class="admin-spinner" aria-hidden="true" /> Chargement…</div>
          <div v-else class="admin-tests__catalog">
            <section v-for="group in testGroups" :key="group.title">
              <h3>{{ group.title }}</h3>
              <div class="admin-tests__list">
                <label v-for="test in group.items" :key="test.id">
                  <input v-model="selected" type="checkbox" :value="test.id">
                  <span><strong>{{ test.title }}</strong><small>{{ test.description }}</small></span>
                </label>
              </div>
            </section>
          </div>
        </section>

        <section v-if="result" :class="['admin-tests__result', 'admin-card', { 'is-success': result.success, 'is-failure': !result.success }]" aria-live="polite">
          <header>
            <div><p class="admin-eyebrow">Dernière exécution</p><h2>{{ result.success ? 'Tous les tests passent' : 'Des tests ont échoué' }}</h2></div>
            <strong>{{ (result.durationMs / 1000).toFixed(2) }} s</strong>
          </header>
          <dl>
            <div><dt>Tests</dt><dd>{{ result.summary.tests }}</dd></div>
            <div><dt>Réussis</dt><dd>{{ result.summary.passed }}</dd></div>
            <div><dt>Échoués</dt><dd>{{ result.summary.failed }}</dd></div>
            <div><dt>Ignorés</dt><dd>{{ result.summary.skipped }}</dd></div>
          </dl>

          <section v-if="result.repairPrompt" class="repair-prompt" aria-labelledby="repair-prompt-title">
            <header>
              <div>
                <p class="admin-eyebrow">Aide à la réparation</p>
                <h3 id="repair-prompt-title">Prompt généré à partir des échecs</h3>
                <p>Copiez ce texte et envoyez-le-moi : il contient les tests concernés, les résultats attendus et le journal utile.</p>
              </div>
              <button class="admin-button admin-button--primary" type="button" @click="copyRepairPrompt">
                {{ promptCopied ? 'Prompt copié ✓' : 'Copier le prompt' }}
              </button>
            </header>
            <textarea :value="result.repairPrompt" readonly aria-label="Prompt de réparation généré" />
          </section>

          <div v-if="generalResultGroups.length" class="test-groups">
            <header>
              <p class="admin-eyebrow">Détail des tests</p>
              <h3>Ce qui a été vérifié</h3>
            </header>
            <details v-for="group in generalResultGroups" :key="group.title" :open="!group.passed">
              <summary>
                <span :class="['postman-status', group.passed ? 'is-passed' : 'is-failed']" aria-hidden="true">{{ group.passed ? '✓' : '×' }}</span>
                <span><strong>{{ group.title }}</strong><small>{{ group.description }}</small></span>
                <b>{{ group.cases.filter(testCase => testCase.passed).length }}/{{ group.cases.length }}</b>
              </summary>
              <ul>
                <li v-for="testCase in group.cases" :key="testCase.title">
                  <span :class="['postman-status', testCase.passed ? 'is-passed' : 'is-failed']" aria-hidden="true">{{ testCase.passed ? '✓' : '×' }}</span>
                  <span>{{ testCase.title }}</span>
                  <small v-if="testCase.skipped">Ignoré</small>
                </li>
              </ul>
            </details>
          </div>

          <div v-if="result.conjugationScenarios.length" class="postman-report">
            <header class="postman-report__header">
              <div>
                <p class="admin-eyebrow">Collection Postman</p>
                <h3>Résultats par forme verbale</h3>
              </div>
              <div class="postman-report__filters" aria-label="Filtrer les scénarios">
                <button
                  v-for="filter in ([['all', 'Tous'], ['passed', 'Réussis'], ['failed', 'Échoués']] as const)"
                  :key="filter[0]"
                  type="button"
                  :class="{ 'is-active': scenarioFilter === filter[0] }"
                  @click="scenarioFilter = filter[0]"
                >
                  {{ filter[1] }} <span>{{ scenarioCounts[filter[0]] }}</span>
                </button>
              </div>
            </header>

            <div class="postman-report__rule-filters" aria-label="Filtrer par règle de conjugaison">
              <strong>Règle testée</strong>
              <button type="button" :class="{ 'is-active': ruleFilter === 'all' }" @click="ruleFilter = 'all'">
                Toutes <span>{{ scenarioCounts.all }}</span>
              </button>
              <button
                v-for="rule in availableRules"
                :key="rule.id"
                type="button"
                :class="{ 'is-active': ruleFilter === rule.id }"
                @click="ruleFilter = rule.id"
              >
                {{ rule.label }} <span>{{ rule.count }}</span>
              </button>
            </div>

            <div class="postman-report__workspace">
              <nav class="postman-report__scenarios" aria-label="Scénarios de conjugaison">
                <section v-for="group in scenariosByMode" :key="group.mode">
                  <h4>{{ group.mode }} <span>{{ group.scenarios.length }}</span></h4>
                  <button
                    v-for="scenario in group.scenarios"
                    :key="scenario.id"
                    type="button"
                    :class="{ 'is-selected': selectedScenario?.id === scenario.id }"
                    @click="selectedScenarioId = scenario.id"
                  >
                    <span :class="['postman-status', scenario.passed ? 'is-passed' : 'is-failed']" aria-hidden="true">{{ scenario.passed ? '✓' : '×' }}</span>
                    <span><strong>{{ scenario.name }}</strong><small>{{ scenario.tense }}</small></span>
                  </button>
                </section>
                <p v-if="visibleScenarios.length === 0" class="admin-muted">Aucun scénario dans ce filtre.</p>
              </nav>

              <article v-if="selectedScenario" class="postman-report__detail">
                <header>
                  <div>
                    <span :class="['postman-result-badge', selectedScenario.passed ? 'is-passed' : 'is-failed']">
                      {{ selectedScenario.passed ? 'Réussi' : 'Échoué' }}
                    </span>
                    <h3>{{ selectedScenario.title }}</h3>
                    <p class="postman-report__purpose">{{ selectedScenario.purpose }}</p>
                  </div>
                </header>

                <div class="postman-report__tags">
                  <span v-for="rule in selectedScenario.rules" :key="rule.id">{{ rule.label }}</span>
                </div>

                <div class="postman-report__source">
                  <span>Forme{{ selectedScenario.sourceForms.length > 1 ? 's' : '' }} en entrée</span>
                  <code v-for="form in selectedScenario.sourceForms" :key="form">{{ form }}</code>
                </div>

                <div class="postman-report__assertions">
                  <section v-for="assertion in selectedScenario.assertions" :key="assertion.id" :class="{ 'is-failed': !assertion.passed }">
                    <header>
                      <span :class="['postman-status', assertion.passed ? 'is-passed' : 'is-failed']" aria-hidden="true">{{ assertion.passed ? '✓' : '×' }}</span>
                      <span><strong>{{ assertionLabels[assertion.property] }}</strong><small>{{ assertionExplanations[assertion.property] }}</small></span>
                    </header>
                    <dl>
                      <div><dt>Attendu</dt><dd><code>{{ assertion.expected }}</code></dd></div>
                      <div>
                        <dt>Obtenu</dt>
                        <dd v-if="Array.isArray(assertion.actual)" class="postman-values">
                          <code v-for="value in assertion.actual" :key="value" :class="{ 'is-match': value === assertion.expected }">{{ value }}</code>
                        </dd>
                        <dd v-else><code>{{ assertion.actual }}</code></dd>
                      </div>
                    </dl>
                  </section>
                </div>
              </article>
            </div>
          </div>

          <details>
            <summary>Afficher le journal technique</summary>
            <pre>{{ result.output }}</pre>
          </details>
        </section>
      </div>
    </AdminShell>
  </AdminAuthBoundary>
</template>

<style scoped>
.admin-tests { display: grid; width: 100%; max-width: 100%; min-width: 0; gap: 24px; }
.admin-tests .admin-section-heading { align-items: center; }
.admin-tests .admin-section-heading p { max-width: 720px; margin: 7px 0 0; }
.admin-tests__selection, .admin-tests__result { width: 100%; max-width: 100%; min-width: 0; padding: clamp(18px, 3vw, 28px); box-shadow: none; }
.admin-tests__selection-heading, .admin-tests__result > header { display: flex; align-items: center; justify-content: space-between; gap: 18px; }
.admin-tests h2, .admin-tests__selection-heading p { margin: 0; }
.admin-tests__selection-heading p { margin-top: 4px; }
.admin-tests__catalog { display: grid; margin-top: 22px; gap: 22px; }
.admin-tests__catalog h3 { margin: 0 0 9px; color: var(--admin-navy); font-size: .92rem; }
.admin-tests__list { display: grid; min-width: 0; margin-top: 18px; grid-template-columns: repeat(auto-fit, minmax(min(360px, 100%), 1fr)); gap: 9px; }
.admin-tests__catalog .admin-tests__list { margin-top: 0; }
.admin-tests__list label { display: flex; padding: 13px; align-items: flex-start; gap: 11px; background: #f5f9fb; border: 1px solid var(--admin-border); border-radius: 9px; cursor: pointer; }
.admin-tests__list input { margin-top: 3px; }
.admin-tests__list span { display: grid; min-width: 0; }
.admin-tests__list small { margin-top: 3px; color: var(--admin-muted); line-height: 1.35; overflow-wrap: anywhere; }
.admin-tests__loading { display: flex; margin-top: 20px; align-items: center; gap: 10px; }
.admin-tests__result { border-left: 5px solid var(--admin-red); }
.admin-tests__result.is-success { border-left-color: var(--admin-green); }
.admin-tests__result dl { display: grid; margin: 20px 0; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.admin-tests__result dl div { padding: 12px; text-align: center; background: #f5f9fb; border-radius: 8px; }
.admin-tests__result dt { color: var(--admin-muted); font-size: .74rem; font-weight: 800; text-transform: uppercase; }
.admin-tests__result dd { margin: 3px 0 0; color: var(--admin-navy); font-size: 1.4rem; font-weight: 900; }
.admin-tests__result pre { max-height: 460px; padding: 15px; overflow: auto; color: #e8f2f7; background: #122c3d; border-radius: 9px; font-size: .78rem; white-space: pre-wrap; }
.admin-tests__result summary { cursor: pointer; font-weight: 800; }
.repair-prompt { margin: 24px 0; padding: 17px; background: #fff8e8; border: 1px solid #e8c97c; border-radius: 11px; }
.repair-prompt > header { display: flex; align-items: center; justify-content: space-between; gap: 18px; }
.repair-prompt h3 { margin: 3px 0 0; color: var(--admin-navy); }
.repair-prompt header p:last-child { max-width: 760px; margin: 5px 0 0; color: var(--admin-muted); line-height: 1.45; }
.repair-prompt textarea { width: 100%; min-height: 300px; margin-top: 15px; padding: 13px; resize: vertical; color: #d9edf7; background: #122c3d; border: 0; border-radius: 8px; font: .78rem/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; }
.test-groups { display: grid; margin: 24px 0; gap: 8px; }
.test-groups > header { margin-bottom: 5px; }
.test-groups > header h3 { margin: 2px 0 0; color: var(--admin-navy); }
.test-groups details { overflow: hidden; border: 1px solid var(--admin-border); border-radius: 9px; }
.test-groups summary { display: grid; padding: 12px 14px; grid-template-columns: 24px 1fr auto; align-items: center; gap: 10px; background: #f7f9fa; list-style: none; }
.test-groups summary::-webkit-details-marker { display: none; }
.test-groups summary > span:nth-child(2) { display: grid; }
.test-groups summary small { margin-top: 2px; color: var(--admin-muted); font-weight: 500; }
.test-groups summary b { color: var(--admin-muted); font-size: .82rem; }
.test-groups ul { display: grid; margin: 0; padding: 8px 14px 12px 48px; gap: 7px; list-style: none; }
.test-groups li { display: grid; grid-template-columns: 21px 1fr auto; align-items: center; gap: 8px; color: #365669; font-size: .87rem; }
.test-groups li small { color: var(--admin-muted); }
.postman-report { width: 100%; max-width: 100%; min-width: 0; margin: 24px 0; overflow: hidden; border: 1px solid var(--admin-border); border-radius: 12px; }
.postman-report__header { display: flex; padding: 16px 18px; align-items: center; justify-content: space-between; gap: 16px; background: #f7f9fa; border-bottom: 1px solid var(--admin-border); }
.postman-report__header h3, .postman-report__detail h3 { margin: 2px 0 0; color: var(--admin-navy); }
.postman-report__filters { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 5px; }
.postman-report__filters button { padding: 7px 9px; color: var(--admin-muted); background: white; border: 1px solid var(--admin-border); border-radius: 7px; font-weight: 750; cursor: pointer; }
.postman-report__filters button.is-active { color: white; background: var(--admin-navy); border-color: var(--admin-navy); }
.postman-report__filters span { display: inline-grid; min-width: 20px; height: 20px; margin-left: 3px; place-items: center; background: rgb(255 255 255 / 18%); border-radius: 10px; }
.postman-report__rule-filters { display: flex; min-width: 0; padding: 10px 14px; align-items: center; flex-wrap: wrap; gap: 6px; overflow: visible; background: white; border-bottom: 1px solid var(--admin-border); }
.postman-report__rule-filters > strong { margin-right: 4px; color: var(--admin-muted); font-size: .75rem; text-transform: uppercase; white-space: nowrap; }
.postman-report__rule-filters button { padding: 6px 9px; color: #365669; background: #f2f6f8; border: 1px solid transparent; border-radius: 999px; font-size: .76rem; font-weight: 800; white-space: nowrap; cursor: pointer; }
.postman-report__rule-filters button.is-active { color: #9b301f; background: #fff1ed; border-color: #e9b7ad; }
.postman-report__rule-filters button span { margin-left: 3px; opacity: .7; }
.postman-report__workspace { display: grid; min-width: 0; grid-template-columns: minmax(230px, 25%) minmax(0, 1fr); min-height: 500px; }
.postman-report__scenarios { max-height: 650px; padding: 7px; overflow-y: auto; background: #f7f9fa; border-right: 1px solid var(--admin-border); }
.postman-report__scenarios section + section { margin-top: 13px; }
.postman-report__scenarios h4 { display: flex; margin: 4px 8px 5px; align-items: center; justify-content: space-between; color: var(--admin-muted); font-size: .7rem; letter-spacing: .07em; text-transform: uppercase; }
.postman-report__scenarios h4 span { display: inline-grid; min-width: 19px; height: 19px; place-items: center; color: #4f6a79; background: #e5ecef; border-radius: 10px; letter-spacing: 0; }
.postman-report__scenarios button { display: grid; width: 100%; padding: 10px; grid-template-columns: 24px 1fr; gap: 8px; text-align: left; color: var(--admin-navy); background: transparent; border: 0; border-radius: 7px; cursor: pointer; }
.postman-report__scenarios button:hover, .postman-report__scenarios button.is-selected { background: white; box-shadow: 0 1px 5px rgb(18 44 61 / 10%); }
.postman-report__scenarios button > span:last-child { display: grid; min-width: 0; }
.postman-report__scenarios strong { overflow-wrap: anywhere; white-space: normal; }
.postman-report__scenarios small { color: var(--admin-muted); }
.postman-status { display: inline-grid; width: 21px; height: 21px; place-items: center; color: white; border-radius: 50%; font-size: .83rem; font-weight: 900; }
.postman-status.is-passed, .postman-result-badge.is-passed { background: var(--admin-green); }
.postman-status.is-failed, .postman-result-badge.is-failed { background: var(--admin-red); }
.postman-report__detail { min-width: 0; padding: 22px; }
.postman-report__detail > header p { margin: 5px 0 0; color: var(--admin-muted); }
.postman-report__detail > header .postman-report__purpose { max-width: 700px; line-height: 1.5; }
.postman-result-badge { display: inline-block; padding: 4px 8px; color: white; border-radius: 999px; font-size: .7rem; font-weight: 900; text-transform: uppercase; }
.postman-report__tags { display: flex; margin-top: 13px; flex-wrap: wrap; gap: 5px; }
.postman-report__tags span { padding: 5px 8px; color: #31566a; background: #eaf1f4; border-radius: 999px; font-size: .72rem; font-weight: 800; }
.postman-report__source { display: flex; margin: 18px 0; padding: 11px; align-items: center; flex-wrap: wrap; gap: 7px; background: #f7f9fa; border-radius: 8px; }
.postman-report__source > span { margin-right: auto; color: var(--admin-muted); font-size: .77rem; font-weight: 800; text-transform: uppercase; }
.postman-report code { padding: 3px 6px; overflow-wrap: anywhere; color: #24485d; background: #eaf1f4; border-radius: 4px; }
.postman-report__assertions { display: grid; gap: 9px; }
.postman-report__assertions section { padding: 13px; border: 1px solid #cde7da; border-radius: 8px; }
.postman-report__assertions section.is-failed { background: #fff8f7; border-color: #efc6c1; }
.postman-report__assertions section > header { display: flex; align-items: center; gap: 8px; }
.postman-report__assertions section > header > span:last-child { display: grid; }
.postman-report__assertions section > header small { margin-top: 2px; color: var(--admin-muted); font-weight: 500; }
.postman-report__assertions dl { display: grid; margin: 11px 0 0; grid-template-columns: 1fr 1fr; gap: 7px; }
.postman-report__assertions dl div { padding: 9px; text-align: left; background: #f7f9fa; }
.postman-report__assertions dt { margin-bottom: 5px; }
.postman-report__assertions dd { margin: 0; font-size: .9rem; }
.postman-values { display: flex; align-items: flex-start; flex-wrap: wrap; gap: 4px; }
.postman-values code.is-match { color: #12643a; background: #dff4e9; box-shadow: inset 0 0 0 1px #8dceb0; }
@media (max-width: 900px) { .postman-report__workspace { grid-template-columns: 1fr; } .postman-report__scenarios { max-height: 280px; border-right: 0; border-bottom: 1px solid var(--admin-border); } }
@media (max-width: 700px) { .admin-tests .admin-section-heading, .admin-tests__selection-heading, .postman-report__header, .repair-prompt > header { align-items: stretch; flex-direction: column; } .admin-tests__list { grid-template-columns: 1fr; } .admin-tests__result dl, .postman-report__assertions dl { grid-template-columns: 1fr; } .postman-report__filters { overflow-x: auto; } }
</style>
