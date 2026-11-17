import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { access, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { delimiter, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { test } from 'node:test'

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '')
const require = createRequire(import.meta.url)
const enabled = process.env.FEEDBACK_BROWSER_TESTS === '1'
let baseUrl = ''
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
    send: (method, params) => send(method, params, sessionId),
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

async function buildHarness(directory, progressive) {
  const { build } = require('esbuild')
  const { parse, compileScript, compileStyle } = require('@vue/compiler-sfc')
  const entry = `
    import {createApp, h, reactive, ref, nextTick} from 'vue';
    import Feedback from '${root}/app/components/exercise/LearnerErrorFeedback.vue';
    import {learnerFeedbackCases as cases} from '${root}/tests/fixtures/learner-feedback-cases.mjs';
    import {learnerErrorDetails,concealLearnerErrorDetail} from '${root}/shared/utils/learner-error-diagnostics.ts';
    import {validateConjugationAnswer} from '${root}/shared/utils/answer.ts';
    import {auditRenderedLearnerFeedback} from '${root}/shared/utils/learner-feedback-audit.ts';
    import {SUPPORTED_LOCALES} from '${root}/shared/i18n/locales.ts';
    import {COACH_HELP_PROFILES} from '${root}/shared/data/coach-help-profiles.ts';
    import '${root}/app/assets/css/main.css';
    import '${root}/app/assets/css/dark-theme.css';
    window.feedbackLocale=ref('fr');
    const state=reactive({details:[]}); let current;
    window.nextRender=nextTick;
    window.cases=cases;window.locales=SUPPORTED_LOCALES;window.profiles=Object.values(COACH_HELP_PROFILES);
    window.validationForCase=(index)=>validateConjugationAnswer(cases[index].answer,cases[index].question);
    window.renderCase=async(index,locale='fr',revealsAnswers=true)=>{
      window.feedbackLocale.value=locale;
      const example=cases[index];const detected=learnerErrorDetails(example.answer,example.question);
      state.details=revealsAnswers?detected:detected.map(concealLearnerErrorDetail);
      current={...example,details:state.details,locale,revealsAnswers};await nextTick();
    };
    window.auditCurrent=()=>auditRenderedLearnerFeedback({...current,renderedText:document.querySelector('.learner-error-feedback').innerText});
    createApp({render:()=>h('main',{style:'max-width:800px;margin:auto;padding:12px'},h(Feedback,{details:state.details}))}).mount('#app');
    window.ready=true;
  `
  await build({
    stdin: { contents: entry, resolveDir: root, sourcefile: 'feedback-harness.js' },
    absWorkingDir: root, bundle: true, format: 'iife', outfile: join(directory, 'harness.js'),
    nodePaths: [join(root, 'node_modules')], alias: { '~~': root, '~': join(root, 'app') },
    define: { 'process.env.NODE_ENV': '"development"' },
    plugins: [{ name: 'actual-vue-components', setup(builder) {
      builder.onLoad({ filter: /feature-flags\.ts$/ }, async args => ({
        contents: (await readFile(args.path, 'utf8')).replace('PROGRESSIVE_ERROR_FEEDBACK_ENABLED = true', `PROGRESSIVE_ERROR_FEEDBACK_ENABLED = ${progressive}`), loader: 'ts',
      }))
      builder.onLoad({ filter: /\.vue$/ }, async args => {
        const source = await readFile(args.path, 'utf8')
        const { descriptor } = parse(source, { filename: args.path })
        const id = args.path.includes('DetailMessage') ? 'data-v-feedback-message-test' : 'data-v-feedback-test'
        const script = compileScript(descriptor, { id, inlineTemplate: true })
        const css = descriptor.styles.map(style => compileStyle({ source: style.content, filename: args.path, id, scoped: style.scoped }).code).join('\n')
        const globals = `import {computed,ref,watch} from 'vue'; const useLanguagePreferences=()=>({interfaceLocale:window.feedbackLocale});\n`
        return {
          contents: globals + script.content.replace('export default', 'const __component =') +
            `\n__component.__scopeId=${JSON.stringify(id)};const style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.append(style);export default __component;`,
          loader: 'ts', resolveDir: fileURLToPath(new URL('.', `file://${args.path}`)),
        }
      })
    } }],
  })
  const layout = parse(await readFile(join(root, 'app/layouts/default.vue'), 'utf8'))
  const layoutCss = layout.descriptor.styles.map(style => style.content).join('\n')
  await writeFile(join(directory, 'index.html'), `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="harness.css"><style>${layoutCss}</style></head><body><div id="app"></div><script src="harness.js"></script></body></html>`)
}

test('commentaires rendus : toutes les langues et tous les profils, mobile, sombre, clavier et repli', { skip: !enabled, timeout: 120_000 }, async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tatitotu-feedback-browser-'))
  baseUrl = `file://${directory}`
  await buildHarness(directory, true)
  const browser = await launchBrowser()
  assert.ok(browser.debuggerAddress, browser.unavailable)
  const page = await connect(browser.debuggerAddress)
  try {
    await page.navigate('/index.html')
    assert.ok(await waitFor(page, 'window.ready'))
    const audited = await page.evaluate(`(async()=>{
      let count=0;
      for(const locale of window.locales) for(const profile of window.profiles) for(let index=0;index<window.cases.length;index++){
        await renderCase(index,locale,profile.revealsAnswers);
        const button=document.querySelector('.learner-error-feedback__more');if(button){button.click();await nextRender()}
        const audit=auditCurrent();if(audit.status!=='passed')throw new Error(JSON.stringify({locale,profile:profile.id,index,audit}));count++;
      }
      return count;
    })()`)
    assert.equal(audited, await page.evaluate('cases.length*locales.length*profiles.length'))
    for (const index of [8, 9, 10]) {
      assert.equal(await page.evaluate(`validationForCase(${index}).isCorrect`), false)
      await page.evaluate(`renderCase(${index},'fr',true)`)
      const text = await page.evaluate('document.body.innerText')
      assert.doesNotMatch(text, /confondu|Bravo|terminaison/u)
      assert.match(text, index === 8 ? /élision/u : /espaces/u)
    }
    await page.evaluate("renderCase(1,'fr',true)")
    assert.ok((await page.evaluate('document.body.innerText')).includes('Vérifie le pronom'))
    assert.ok(!(await page.evaluate('document.body.innerText')).includes('confondu la personne'))
    await page.evaluate("renderCase(7,'fr',true)")
    assert.equal(await page.evaluate("document.querySelector('button').getAttribute('aria-expanded')"), 'false')
    assert.equal(await page.evaluate("[...document.querySelectorAll('li')].filter(li=>getComputedStyle(li).display!=='none').length"), 1)
    await page.send('Page.bringToFront')
    await page.evaluate("document.querySelector('button').focus()")
    await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' })
    await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
    await page.evaluate('nextRender()')
    assert.equal(await page.evaluate("document.querySelector('button').getAttribute('aria-expanded')"), 'true')
    assert.equal(await page.evaluate('auditCurrent().status'), 'passed')
    for (const [label, width, dark] of [['desktop', 1440, false], ['mobile', 320, false], ['mobile-dark', 320, true]]) {
      await page.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 })
      await page.evaluate(`document.documentElement.dataset.theme='${dark ? 'dark' : 'light'}'`)
      assert.equal(await page.evaluate('document.documentElement.scrollWidth>innerWidth'), false, label)
      if (dark) {
        assert.equal(await page.evaluate("getComputedStyle(document.documentElement).backgroundColor"), 'rgb(17, 27, 28)')
        assert.equal(await page.evaluate("getComputedStyle(document.querySelector('.learner-error-feedback')).backgroundColor"), 'rgb(59, 41, 41)')
        assert.equal(await page.evaluate("getComputedStyle(document.querySelector('.learner-error-feedback')).color"), 'rgb(220, 232, 230)')
      }
      const screenshot = await page.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
      await writeFile(join(directory, `${label}.png`), Buffer.from(screenshot.data, 'base64'))
    }
    await page.evaluate("renderCase(7,'en',true)")
    assert.equal(await page.evaluate("document.querySelector('button').getAttribute('aria-expanded')"), 'false')
    await buildHarness(directory, false)
    await page.navigate('/index.html')
    assert.ok(await waitFor(page, 'window.ready'))
    await page.evaluate("renderCase(7,'fr',true)")
    assert.equal(await page.evaluate("Boolean(document.querySelector('.learner-error-feedback__more'))"), false)
    assert.equal(await page.evaluate("[...document.querySelectorAll('li')].filter(li=>getComputedStyle(li).display!=='none').length"), 2)
    console.log(JSON.stringify({ audited, keyboard: true, desktop: true, mobile320: true, dark: true, rollback: true, artifacts: directory }))
  }
  finally {
    await page.close()
    await browser.close()
  }
})
