import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { access, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { delimiter, join } from 'node:path'
import { test } from 'node:test'

const enabled = process.env.ADMIN_BROWSER_TESTS === '1'
const baseUrl = String(process.env.ADMIN_TEST_BASE_URL || '').replace(/\/$/u, '')
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

async function firstExecutable(candidates) {
  for (const candidate of candidates) {
    if (!candidate) continue
    try {
      await access(candidate)
      return candidate
    } catch {
      // Essaie le chemin suivant.
    }
  }
  return ''
}

async function chromeExecutable() {
  const pathCandidates = String(process.env.PATH || '')
    .split(delimiter)
    .flatMap(directory => ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'].map(name => join(directory, name)))
  return firstExecutable([
    process.env.CHROME_BIN,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    ...pathCandidates,
  ])
}

async function launchBrowser() {
  const executable = await chromeExecutable()
  if (!executable) return { unavailable: 'Chrome ou Chromium n’est pas installé sur ce serveur.' }

  const profile = await mkdtemp(join(tmpdir(), 'tatitotu-browser-tests-'))
  const child = spawn(executable, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--no-sandbox', '--disable-dev-shm-usage', '--remote-debugging-address=127.0.0.1',
    '--remote-debugging-port=0', '--window-size=1680,1300', `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore' })

  const activePortFile = join(profile, 'DevToolsActivePort')
  let debuggerAddress = ''
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) break
    try {
      const [port, browserPath] = (await readFile(activePortFile, 'utf8')).trim().split('\n')
      if (port && browserPath) {
        debuggerAddress = `ws://127.0.0.1:${port}${browserPath}`
        break
      }
    } catch {
      await delay(100)
    }
  }

  if (!debuggerAddress) {
    child.kill('SIGTERM')
    await rm(profile, { recursive: true, force: true })
    return { unavailable: 'Le navigateur sans interface n’a pas pu démarrer sur ce serveur.' }
  }

  return {
    debuggerAddress,
    async close() {
      child.kill('SIGTERM')
      await Promise.race([
        new Promise(resolve => child.once('exit', resolve)),
        delay(2_000),
      ])
      await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
    },
  }
}

async function connect(debuggerAddress) {
  const socket = new WebSocket(debuggerAddress)
  const pending = new Map()
  const events = new Map()
  let nextId = 0

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data)
    if (message.id && pending.has(message.id)) {
      const operation = pending.get(message.id)
      pending.delete(message.id)
      if (message.error) operation.reject(new Error(message.error.message))
      else operation.resolve(message.result)
      return
    }
    const key = `${message.sessionId || ''}:${message.method}`
    const listeners = events.get(key) || []
    events.delete(key)
    for (const resolve of listeners) resolve(message.params)
  }
  await new Promise((resolve, reject) => {
    socket.onopen = resolve
    socket.onerror = () => reject(new Error('Connexion impossible au navigateur.'))
  })

  function send(method, params = {}, sessionId) {
    const id = ++nextId
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }))
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }))
  }
  function once(method, sessionId) {
    const key = `${sessionId || ''}:${method}`
    return new Promise(resolve => events.set(key, [...(events.get(key) || []), resolve]))
  }

  const target = await send('Target.createTarget', { url: 'about:blank' })
  const attached = await send('Target.attachToTarget', { targetId: target.targetId, flatten: true })
  const sessionId = attached.sessionId
  await send('Page.enable', {}, sessionId)
  await send('Runtime.enable', {}, sessionId)

  return {
    async evaluate(expression) {
      const response = await send('Runtime.evaluate', {
        expression,
        awaitPromise: true,
        returnByValue: true,
      }, sessionId)
      if (response.exceptionDetails) {
        throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text || 'Erreur dans la page')
      }
      return response.result.value
    },
    async navigate(path) {
      const loaded = once('Page.loadEventFired', sessionId)
      await send('Page.navigate', { url: `${baseUrl}${path}` }, sessionId)
      await loaded
      await delay(1_800)
    },
    async close() {
      await send('Target.closeTarget', { targetId: target.targetId })
      socket.close()
    },
  }
}

async function waitFor(page, expression, timeoutMs = 10_000) {
  const startedAt = Date.now()
  let value
  while (Date.now() - startedAt < timeoutMs) {
    value = await page.evaluate(expression)
    if (value) return value
    await delay(200)
  }
  return value
}

async function check(t, title, value, details = '') {
  await t.test(title, () => {
    assert.ok(value, details || title)
  })
}

test('parcours utilisateur dans un navigateur réel', { skip: !enabled && 'Disponible depuis la page Tests de l’administration.' }, async (t) => {
  if (!/^https?:\/\/[^/]+/u.test(baseUrl)) {
    await t.test('Adresse du site disponible', { skip: 'L’adresse du site n’est pas configurée.' })
    return
  }

  try {
    const response = await fetch(`${baseUrl}/fr/`, { signal: AbortSignal.timeout(10_000) })
    if (!response.ok) {
      await t.test('Site accessible', { skip: `Le site répond avec le statut ${response.status}.` })
      return
    }
  } catch (error) {
    await t.test('Site accessible', { skip: `Le site est inaccessible : ${error instanceof Error ? error.message : 'erreur réseau'}.` })
    return
  }

  const browser = await launchBrowser()
  if ('unavailable' in browser) {
    await t.test('Navigateur disponible', { skip: browser.unavailable })
    return
  }

  const page = await connect(browser.debuggerAddress)
  try {
    await page.navigate('/fr/')
    const welcome = await page.evaluate(`(() => ({
      automaticTour: Boolean(document.querySelector('.tour-welcome-backdrop')),
      tourButton: Boolean(document.querySelector('.tour-entry-button')),
    }))()`)
    await check(t, 'La visite ne s’ouvre pas automatiquement', !welcome.automaticTour)
    await check(t, 'Le bouton de visite guidée reste disponible', welcome.tourButton)

    await page.evaluate(`document.querySelector('.tour-entry-button')?.click()`)
    const manualTour = await waitFor(page, `Boolean(document.querySelector('.tour-welcome-backdrop'))`)
    await check(t, 'La visite s’ouvre à la demande', manualTour)
    await page.evaluate(`document.querySelector('.tour-welcome-dialog__close')?.click()`)

    await page.navigate('/fr/signin')
    const passwordBefore = await page.evaluate(`document.querySelector('.password-input input')?.type`)
    await page.evaluate(`document.querySelector('.password-input button')?.click()`)
    const passwordAfter = await page.evaluate(`document.querySelector('.password-input input')?.type`)
    await check(t, 'Le mot de passe peut être affiché puis masqué', passwordBefore === 'password' && passwordAfter === 'text')

    await page.navigate('/fr/')
    await page.evaluate(`[...document.querySelectorAll('button')].find(button => button.textContent?.includes('Construire un nouveau défi'))?.click()`)
    await delay(500)
    await page.evaluate(`(() => {
      const input = document.querySelector('input[type="search"]')
      if (!input) return false
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'avoir')
      input.dispatchEvent(new Event('input', { bubbles: true }))
      return true
    })()`)
    const suggestion = await waitFor(page, `Boolean(document.querySelector('[role="option"] button'))`)
    if (suggestion) await page.evaluate(`document.querySelector('[role="option"] button')?.click()`)
    const verbSelected = await waitFor(page, `document.querySelector('.wizard-step__cta')?.disabled === false`)
    await check(t, 'Un verbe peut être recherché et ajouté au défi', suggestion && verbSelected)

    await page.evaluate(`document.querySelector('.wizard-step__cta')?.click()`)
    await delay(400)
    await page.evaluate(`[...document.querySelectorAll('button')].find(button => button.textContent?.trim() === 'Tout cocher')?.click()`)
    const timesSelected = await waitFor(page, `document.querySelector('.wizard-step__cta')?.disabled === false`)
    await check(t, 'Les temps peuvent être sélectionnés pour poursuivre', timesSelected)

    await page.evaluate(`document.querySelector('.wizard-step__cta')?.click()`)
    await delay(400)
    const options = await page.evaluate(`(() => {
      const body = document.body.innerText
      const labels = [...document.querySelectorAll('.complement-options__panel label')]
      const disabled = labels.filter(label => label.querySelector('input')?.disabled)
      return {
        terminology: body.includes('COD (CVD)') && body.includes('COI (CVI)'),
        disabledReasons: disabled.length > 0 && disabled.every(label => label.innerText.trim().split('\\n').length > 1),
      }
    })()`)
    await check(t, 'Les libellés COD (CVD) et COI (CVI) sont affichés', options.terminology)
    await check(t, 'Les options grisées expliquent leur indisponibilité', options.disabledReasons)

    await page.evaluate(`document.querySelector('.wizard-step__cta--launch')?.click()`)
    const challengeReady = await waitFor(page, `document.body.innerText.includes('Comment veux-tu l’utiliser')`, 12_000)
    await check(t, 'Le défi est généré et arrive à l’étape de lancement', challengeReady)

    await page.evaluate(`document.querySelector('.action-button--chat')?.click()`)
    const pickerOpened = await waitFor(page, `Boolean(document.querySelector('.coach-picker'))`)
    await check(t, 'Le sélecteur de coach s’ouvre depuis le défi', pickerOpened)

    const coachesLoaded = await waitFor(page, `document.querySelectorAll('.coach-card').length > 0`, 12_000)
    const coachSelected = coachesLoaded && await page.evaluate(`(() => {
      const groups = [...document.querySelectorAll('.coach-caractere-group')]
      const answerGroup = document.querySelector('[data-help-approach="complete-avec-reponses"]')
        || groups.find(group => /avec (?:les )?réponses/iu.test(group.querySelector('h3')?.textContent || ''))
      const coach = answerGroup?.querySelector('.coach-card') || [...document.querySelectorAll('.coach-card')].find(button => button.textContent?.trim() === 'Amel')
      coach?.click()
      return Boolean(coach)
    })()`)
    const chatOpened = coachSelected && await waitFor(page, `document.body.innerText.includes('QUESTION 1 SUR') || Boolean([...document.querySelectorAll('input')].find(input => input.placeholder?.includes('______')))`, 15_000)
    const chatState = chatOpened ? null : await page.evaluate(`(() => ({
      selected: ${JSON.stringify(Boolean(coachSelected))},
      picker: Boolean(document.querySelector('.coach-picker')),
      pickerError: document.querySelector('.coach-picker__state--error')?.textContent?.trim() || '',
      text: document.body.innerText.slice(-1800),
    }))()`)
    await check(t, 'Le dialogue avec le coach démarre', chatOpened, JSON.stringify(chatState))

    const beforeFailure = await page.evaluate(`document.querySelectorAll('.coach-help-revealed-answers span').length`)
    await check(t, 'Le coach ne montre pas la réponse avant le premier échec', beforeFailure === 0)

    const inputReady = await waitFor(page, `Boolean([...document.querySelectorAll('input')].find(element => element.placeholder?.includes('______') && !element.disabled))`, 8_000)
    const answerEntered = inputReady && await page.evaluate(`(() => {
      const input = [...document.querySelectorAll('input')].find(element => element.placeholder?.includes('______'))
      if (!input) return false
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'réponse volontairement fausse')
      input.dispatchEvent(new Event('input', { bubbles: true }))
      return true
    })()`)
    const sendReady = answerEntered && await waitFor(page, `Boolean([...document.querySelectorAll('.chat-composer button')].find(item => item.textContent?.trim() === 'Envoyer' && !item.disabled))`, 12_000)
    const answerSent = sendReady && await page.evaluate(`(() => {
      const button = [...document.querySelectorAll('button')].find(item => item.textContent?.trim() === 'Envoyer' && !item.disabled)
      button?.click()
      return Boolean(button)
    })()`)
    const answerRevealed = await waitFor(page, `(() => {
      const answers = document.querySelectorAll('.coach-help-revealed-answers span')
      const label = document.querySelector('.coach-help-revealed-answers strong')?.textContent || ''
      return answers.length > 0 && label.includes('Réponse après la première tentative')
    })()`, 10_000)
    const answerState = answerSent && answerRevealed ? null : await page.evaluate(`(() => ({
      inputReady: ${JSON.stringify(Boolean(inputReady))},
      answerEntered: ${JSON.stringify(Boolean(answerEntered))},
      answerSent: ${JSON.stringify(Boolean(answerSent))},
      input: document.querySelector('#chat-answer')?.value || '',
      buttons: [...document.querySelectorAll('.chat-composer button')].map(button => ({ text: button.textContent?.trim(), disabled: button.disabled })),
      approach: document.querySelector('.chat-layout')?.getAttribute('data-help-approach') || '',
      help: document.querySelector('.coach-help-panel')?.innerText?.slice(0, 900) || '',
      text: document.body.innerText.slice(-1600),
    }))()`)
    await check(t, 'La réponse apparaît clairement après la première tentative ratée', answerSent && answerRevealed, JSON.stringify(answerState))

    const nextQuestion = await waitFor(page, `document.body.innerText.includes('QUESTION 2 SUR')`, 15_000)
    const answersAfterNavigation = await page.evaluate(`document.querySelectorAll('.coach-help-revealed-answers span').length`)
    await check(t, 'Au changement de question, l’aide revient à la question courante', nextQuestion && answersAfterNavigation === 0)
  } finally {
    await page.close().catch(() => {})
    await browser.close()
  }
})
