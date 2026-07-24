<script setup lang="ts">
import type { CoachHelpBlock } from '~~/shared/types/coach'
import type { ConjugationTense, ExerciseQuestion, Verb } from '~~/shared/types/conjugation'
import { auditRenderedCoachHelp } from '~~/shared/utils/coach-help-audit'
import type { CoachHelpContentValues } from '~~/shared/utils/coach-help'
import { conditionalCoachHelpBlocks, renderCoachHelpContent } from '~~/shared/utils/coach-help'
import { sanitizeCoachHtml } from '~~/shared/utils/safe-html'
import { coachHelpProfile } from '~~/shared/data/coach-help-profiles'

const props = withDefaults(defineProps<{
  blocks: CoachHelpBlock[]
  values: CoachHelpContentValues
  headerTitle?: string
  headerDescription?: string
  questionNumber?: number
  coachColor?: string
  embedded?: boolean
  showClose?: boolean
  showFeedback?: boolean
  includeAutomaticOrthography?: boolean
  feedbackContext?: Record<string, unknown>
}>(), {
  questionNumber: 1,
  coachColor: '#295f72',
  embedded: false,
  showClose: true,
  showFeedback: true,
  includeAutomaticOrthography: true,
  headerTitle: '{helpTitle}',
  headerDescription: '',
})

interface PreviewScrollPosition {
  blockIndex: number
  progress: number
}

type HelpFeedbackType = 'useful' | 'unclear' | 'error' | 'remark'
type FeedbackStatus = 'idle' | 'sending' | 'sent' | 'error'

const emit = defineEmits<{
  close: []
  contentScroll: []
  previewScroll: [position: PreviewScrollPosition]
}>()
const content = useTemplateRef<HTMLElement>('content')
const feedbackTextarea = useTemplateRef<HTMLTextAreaElement>('feedbackTextarea')
const feedbackType = ref<HelpFeedbackType | ''>('')
const feedbackComment = ref('')
const feedbackStatus = ref<FeedbackStatus>('idle')
const feedbackError = ref('')
const feedbackOptions: Array<{ type: HelpFeedbackType, label: string, icon: string }> = [
  { type: 'useful', label: 'Utile', icon: '✓' },
  { type: 'unclear', label: 'Pas clair', icon: '?' },
  { type: 'error', label: 'Erreur', icon: '!' },
  { type: 'remark', label: 'Remarque', icon: '✎' },
]
const activeProfile = computed(() => coachHelpProfile(props.blocks.find(block => block.profileId)?.profileId))
const renderedBlocks = computed(() => [
  ...props.blocks
    .map((block, blockIndex) => ({ block, blockIndex: blockIndex as number | null }))
    .filter(item => item.block.isActive),
  ...(props.includeAutomaticOrthography
    ? conditionalCoachHelpBlocks(activeProfile.value.id, props.values).map(block => ({ block, blockIndex: null as number | null }))
    : []),
])
const sourceRenderedHtml = computed(() => renderedBlocks.value
  .map(item => renderHelpBlockSnapshot(item.block, item.blockIndex))
  .map(snapshotHtml)
  .join('\n'))
const automaticAuditInput = computed(() => {
  const context = props.feedbackContext || {}
  const question = context.currentQuestion as ExerciseQuestion | undefined
  const verb = context.currentVerb as Verb | undefined
  const tense = context.currentTense as ConjugationTense | undefined
  return question && verb ? { question, verb, tense } : null
})
const automaticAudit = computed(() => automaticAuditInput.value
  ? auditRenderedCoachHelp({
      renderedHtml: sourceRenderedHtml.value,
      blocks: renderedBlocks.value.map(item => item.block),
      question: automaticAuditInput.value.question,
      verb: automaticAuditInput.value.verb,
      tense: automaticAuditInput.value.tense,
    })
  : null)
const safeFallbackBlock: CoachHelpBlock = {
  id: -990_001,
  type: 'warning',
  title: 'Aide sécurisée',
  content: '<p>Une incohérence a été détectée dans l’explication détaillée. La réponse officielle à retenir est :</p><p><mark><strong>{correctAnswers}</strong></mark></p>',
  explanationApproach: 'cif-falc',
  isActive: true,
  sortOrder: 1,
  children: [],
}
const safeAdviceFallbackBlock: CoachHelpBlock = {
  id: -990_002,
  type: 'warning',
  title: 'Aide sécurisée',
  content: '<p>Une incohérence a été détectée dans cette explication. Repère le temps et la personne, cherche le radical, puis choisis la terminaison correspondante.</p>',
  explanationApproach: 'cif-falc',
  profileId: 'complete',
  isActive: true,
  sortOrder: 1,
  children: [],
}
const displayedBlocks = computed(() => automaticAudit.value?.status === 'failed'
  ? [{ block: activeProfile.value.revealsAnswers ? safeFallbackBlock : safeAdviceFallbackBlock, blockIndex: null as number | null }]
  : renderedBlocks.value)
const renderedHeaderTitle = computed(() => renderCoachHelpContent('{helpTitle}', props.values))
const renderedHeaderDescription = computed(() => sanitizeCoachHtml(renderCoachHelpContent(props.headerDescription, props.values)))
const feedbackRequiresComment = computed(() => feedbackType.value !== '' && feedbackType.value !== 'useful')
const displayedHelpSnapshot = computed(() => ({
  header: {
    title: renderedHeaderTitle.value,
    descriptionHtml: renderedHeaderDescription.value,
  },
  blocks: renderedBlocks.value.map(item => renderHelpBlockSnapshot(item.block, item.blockIndex)),
  values: props.values,
}))
let previewScrollFrame: number | null = null
let lastAutomaticErrorReport = ''

function resetFeedback() {
  feedbackType.value = ''
  feedbackComment.value = ''
  feedbackStatus.value = 'idle'
  feedbackError.value = ''
}

function preferredScrollBehavior(): ScrollBehavior {
  if (typeof window === 'undefined') return 'auto'
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

function scrollContentToTop() {
  void nextTick(() => {
    window.requestAnimationFrame(() => {
      content.value?.scrollTo({ top: 0, behavior: preferredScrollBehavior() })
    })
  })
}

function scrollContentToBottom(focusTextarea = false) {
  void nextTick(() => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const container = content.value
        if (!container) return
        container.scrollTo({ top: container.scrollHeight, behavior: preferredScrollBehavior() })
        if (focusTextarea) feedbackTextarea.value?.focus({ preventScroll: true })
      })
    })
  })
}

function renderedBlockTitle(block: CoachHelpBlock) {
  const content = block.content.trim()
  if (content === '{definitionHelp}') return 'Définition'
  if (content === '{contextualBaseHelp}') return ''
  return block.title
}

function renderHelpBlockSnapshot(block: CoachHelpBlock, blockIndex: number | null): Record<string, unknown> {
  const children = (block.children || []).filter(child => child.isActive)
  return {
    id: block.id,
    sourceIndex: blockIndex,
    type: block.type,
    title: renderedBlockTitle(block),
    sourceTitle: block.title,
    sourceContent: block.content,
    explanationApproach: block.explanationApproach,
    renderedHtml: sanitizeCoachHtml(renderCoachHelpContent(block.content, props.values, block.explanationApproach || 'cif-falc')),
    children: children.map((child, index) => renderHelpBlockSnapshot(child, index)),
  }
}

function snapshotHtml(snapshot: Record<string, unknown>): string {
  const children = Array.isArray(snapshot.children) ? snapshot.children as Record<string, unknown>[] : []
  return [String(snapshot.renderedHtml || ''), ...children.map(snapshotHtml)].join('\n')
}

async function reportAutomaticErrors() {
  const input = automaticAuditInput.value
  const audit = automaticAudit.value
  const errors = audit?.issues.filter(issue => issue.severity === 'error') || []
  if (props.embedded || !input || !errors.length || !props.feedbackContext?.sessionId) return
  const reportKey = JSON.stringify([
    props.feedbackContext.exerciseRunId,
    props.feedbackContext.questionNumber,
    errors.map(issue => issue.code),
  ])
  if (reportKey === lastAutomaticErrorReport) return
  lastAutomaticErrorReport = reportKey
  try {
    await $fetch('/api/coach-help-errors', {
      method: 'POST',
      body: {
        context: { ...props.feedbackContext, uiContext: currentUiContext() },
        blocks: renderedBlocks.value.map(item => item.block),
        question: input.question,
        verb: input.verb,
        tense: input.tense,
        clientAudit: audit,
        renderedHtml: sourceRenderedHtml.value,
        displayedHelp: displayedHelpSnapshot.value,
      },
    })
  }
  catch {
    if (lastAutomaticErrorReport === reportKey) lastAutomaticErrorReport = ''
    // L’aide de secours reste affichée même si le registre est temporairement indisponible.
  }
}

function currentUiContext() {
  if (typeof window === 'undefined') return {}
  const container = content.value
  return {
    path: window.location.pathname,
    href: window.location.href,
    referrer: document.referrer || null,
    theme: document.documentElement.dataset.theme || null,
    colorScheme: document.documentElement.style.colorScheme || null,
    locale: navigator.language,
    languages: Array.from(navigator.languages || []),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      availableWidth: window.screen.availWidth,
      availableHeight: window.screen.availHeight,
    },
    helpPanel: container
      ? {
          scrollTop: container.scrollTop,
          scrollHeight: container.scrollHeight,
          clientHeight: container.clientHeight,
          clientWidth: container.clientWidth,
        }
      : null,
  }
}

function reportPreviewScroll() {
  emit('contentScroll')
  if (previewScrollFrame !== null) window.cancelAnimationFrame(previewScrollFrame)
  previewScrollFrame = window.requestAnimationFrame(() => {
    previewScrollFrame = null
    const container = content.value
    if (!container) return
    const elements = [...container.querySelectorAll<HTMLElement>('[data-help-block-index]')]
    if (!elements.length) return
    const containerTop = container.getBoundingClientRect().top
    const anchor = container.scrollTop + Math.min(36, container.clientHeight * 0.12)
    let visible = elements[0]
    for (const element of elements) {
      const elementTop = element.getBoundingClientRect().top - containerTop + container.scrollTop
      if (elementTop > anchor) break
      visible = element
    }
    if (!visible) return
    const blockIndex = Number(visible.dataset.helpBlockIndex)
    if (!Number.isInteger(blockIndex)) return
    const visibleTop = visible.getBoundingClientRect().top - containerTop + container.scrollTop
    const progress = Math.min(1, Math.max(0, (anchor - visibleTop) / Math.max(1, visible.offsetHeight)))
    emit('previewScroll', { blockIndex, progress })
  })
}

function selectFeedback(type: HelpFeedbackType) {
  feedbackType.value = type
  feedbackError.value = ''
  if (feedbackStatus.value === 'sent') feedbackStatus.value = 'idle'
  if (type === 'useful') {
    feedbackComment.value = ''
    void submitFeedback()
    return
  }
  scrollContentToBottom(true)
}

async function submitFeedback() {
  if (!feedbackType.value || feedbackStatus.value === 'sending') return
  feedbackStatus.value = 'sending'
  feedbackError.value = ''
  try {
    await $fetch('/api/coach-help-feedback', {
      method: 'POST',
      body: {
        feedbackType: feedbackType.value,
        comment: feedbackComment.value.trim(),
        context: {
          ...(props.feedbackContext || {}),
          questionNumber: props.questionNumber,
          helpTitle: renderedHeaderTitle.value,
        },
        displayedHelp: displayedHelpSnapshot.value,
        displayedHelpHtml: content.value?.innerHTML || '',
        uiContext: currentUiContext(),
      },
    })
    feedbackStatus.value = 'sent'
  }
  catch {
    feedbackStatus.value = 'error'
    feedbackError.value = 'Retour impossible pour le moment.'
  }
}

watch(() => props.questionNumber, () => {
  resetFeedback()
  scrollContentToTop()
  void reportAutomaticErrors()
})

watch(sourceRenderedHtml, () => {
  void reportAutomaticErrors()
}, { flush: 'post' })

onMounted(() => {
  scrollContentToTop()
  void reportAutomaticErrors()
})

onBeforeUnmount(() => {
  if (previewScrollFrame !== null) window.cancelAnimationFrame(previewScrollFrame)
})

</script>

<template>
  <aside
    data-tour="chat-help"
    class="coach-help-panel"
    :class="{ 'coach-help-panel--embedded': embedded }"
    :style="{ '--coach-color': coachColor }"
    role="region"
    aria-labelledby="coach-help-title"
  >
    <span class="coach-help-badge">Aide</span>
    <header class="coach-help-header">
      <div>
        <h2 id="coach-help-title">{{ renderedHeaderTitle }}</h2>
        <div v-if="renderedHeaderDescription" class="coach-help-header__description" v-html="renderedHeaderDescription" />
      </div>
      <button v-if="showClose" type="button" aria-label="Fermer l’aide" @click="emit('close')">×</button>
    </header>

    <div ref="content" class="coach-help-content" @scroll.passive="reportPreviewScroll">
      <CoachHelpBlockView
        v-for="item in displayedBlocks"
        :key="`${item.block.id}-${item.blockIndex ?? 'automatic'}`"
        :data-help-block-index="item.blockIndex"
        :block="item.block"
        :values="values"
      />

      <section v-if="showFeedback" class="coach-help-feedback" aria-labelledby="coach-help-feedback-title">
        <h3 id="coach-help-feedback-title" class="sr-only">Retour sur l’aide automatique</h3>
        <p>
          Cette aide est générée automatiquement. Elle peut contenir une erreur ou manquer de clarté.
          Les retours permettent de l’améliorer.
        </p>
        <div class="coach-help-feedback__actions" role="group" aria-label="Retour sur cette aide">
          <button
            v-for="option in feedbackOptions"
            :key="option.type"
            type="button"
            :class="{ 'is-selected': feedbackType === option.type }"
            :disabled="feedbackStatus === 'sending'"
            @click="selectFeedback(option.type)"
          >
            <span aria-hidden="true">{{ option.icon }}</span>
            {{ option.label }}
          </button>
        </div>
        <form v-if="feedbackRequiresComment && feedbackStatus !== 'sent'" class="coach-help-feedback__form" @submit.prevent="submitFeedback">
          <label for="coach-help-feedback-comment">Remarque optionnelle</label>
          <textarea
            id="coach-help-feedback-comment"
            ref="feedbackTextarea"
            v-model="feedbackComment"
            rows="3"
            maxlength="2000"
            placeholder="Précision utile pour corriger ou améliorer l’aide…"
          />
          <button type="submit" :disabled="feedbackStatus === 'sending'">
            {{ feedbackStatus === 'sending' ? 'Envoi…' : 'Envoyer le retour' }}
          </button>
        </form>
        <p v-if="feedbackStatus === 'sent'" class="coach-help-feedback__status">Retour enregistré.</p>
        <p v-else-if="feedbackError" class="coach-help-feedback__error">{{ feedbackError }}</p>
      </section>
    </div>

    <footer class="coach-help-footer"><button type="button" @click="emit('close')">Fermer</button></footer>
  </aside>
</template>

<style scoped>
.coach-help-panel{position:relative;display:grid;width:min(440px,38vw);min-width:360px;height:100%;grid-template-rows:auto minmax(0,1fr) auto;overflow:visible;border:1px solid rgb(255 255 255 / 68%);border-radius:24px;color:#263b43;background:#f8fcfb;box-shadow:0 30px 80px rgb(12 29 39 / 32%)}.coach-help-panel--embedded{width:100%;min-width:0;height:720px;border-color:#c9dadd;box-shadow:0 14px 35px rgb(12 29 39 / 15%)}.coach-help-badge{position:absolute;z-index:3;top:0;left:50%;display:inline-grid;min-width:92px;min-height:40px;padding:8px 18px;place-items:center;transform:translate(-50%,-50%);border:2px solid #9badb2;border-radius:999px;color:#38525a;background:#eef3f4;font-size:.9rem;font-weight:900;letter-spacing:.1em;line-height:1;text-transform:uppercase}.coach-help-header{display:flex;padding:34px 22px 18px;align-items:center;gap:16px;border-radius:23px 23px 0 0;color:white;background:linear-gradient(135deg,var(--coach-color,#295f72),#187b83)}.coach-help-header>div{min-width:0;flex:1}.coach-help-header h2,.coach-help-header p{margin:0}.coach-help-header h2{font-size:1.35rem;line-height:1.15}.coach-help-header p{margin-top:6px;color:rgb(255 255 255 / 84%);font-size:.9rem}.coach-help-header button{width:38px;height:38px;flex:0 0 auto;border:1px solid rgb(255 255 255 / 58%);border-radius:12px;color:white;background:rgb(255 255 255 / 10%);cursor:pointer;font-size:1.5rem;line-height:1}.coach-help-header button:hover,.coach-help-header button:focus-visible{background:rgb(255 255 255 / 22%)}.coach-help-content{display:flex;overflow-y:auto;padding:16px;flex-direction:column;gap:12px}.coach-help-card{padding:16px;border:1px solid #cfe0dc;border-radius:16px;background:white;box-shadow:0 4px 14px rgb(37 75 78 / 6%)}.coach-help-card h3{display:flex;margin:0 0 11px;align-items:center;gap:9px;color:#17566a;font-size:.96rem}.coach-help-card h3>span{display:inline-grid;width:25px;height:25px;flex:0 0 auto;place-items:center;border-radius:8px;color:white;background:#267a87;font-size:.76rem}.coach-help-card p{margin:0;line-height:1.52}.coach-help-custom-content{margin-bottom:12px!important;color:#405b63;white-space:pre-line}.coach-help-card--intro,.coach-help-card--custom{border-color:color-mix(in srgb,var(--coach-color,#295f72) 28%,#cfe0dc);background:color-mix(in srgb,var(--coach-color,#295f72) 5%,white)}.coach-help-requested-form{margin-bottom:10px!important;color:#17566a;font-weight:850}.coach-help-meaning{color:#405b63}.coach-help-card dl{display:grid;margin:14px 0 0;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.coach-help-card dl>div{padding:9px 10px;border-radius:10px;background:#eef6f4}.coach-help-card dt{color:#6b7e81;font-size:.67rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase}.coach-help-card dd{margin:3px 0 0;color:#25484f;font-weight:800;overflow-wrap:anywhere}.coach-help-endings{display:grid;margin-top:12px;padding:11px 12px;gap:3px;border-left:4px solid #d59a1c;border-radius:5px 10px 10px 5px;background:#fff7df}.coach-help-endings strong{color:#7d5709;font-size:.76rem;text-transform:uppercase}.coach-help-endings span{line-height:1.45}.coach-help-exception{display:grid;margin-top:12px;padding:12px;gap:4px;border:2px solid #c8753d;border-radius:11px;color:#653515;background:#fff0e5}.coach-help-exception strong{font-size:.76rem;letter-spacing:.05em;text-transform:uppercase}.coach-help-exception span{line-height:1.45}.coach-help-card ul,.coach-help-card ol{margin:0;padding-left:1.25rem}.coach-help-card li{padding-left:.25rem;line-height:1.48}.coach-help-card li+li{margin-top:7px}.coach-help-card--warning{border-color:#ead7a6;background:#fffbef}.coach-help-card--warning h3{color:#76530c}.coach-help-card--warning h3>span{color:#4c3504;background:#e1ad3d}.coach-help-footer{display:grid;padding:14px 16px 16px;gap:10px;border-top:1px solid #d6e4e1;border-radius:0 0 23px 23px;background:white}.coach-help-footer p{margin:0;color:#65797e;font-size:.75rem;text-align:center}.coach-help-footer button{padding:11px 16px;border:0;border-radius:12px;color:white;background:#176b87;cursor:pointer;font-weight:800}.coach-help-empty{margin:auto;color:#65797e;text-align:center}
.sr-only{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.coach-help-header__description{margin-top:7px;color:rgb(255 255 255 / 84%);font-size:.9rem;line-height:1.45}.coach-help-header__description :deep(> :first-child){margin-top:0}.coach-help-header__description :deep(> :last-child){margin-bottom:0}
.coach-help-feedback{position:relative;display:grid;margin-top:26px;padding:12px 12px 13px;gap:10px;border:1px dashed #b8cdd1;border-radius:14px;background:rgb(241 247 247 / 52%);color:#5a7076}.coach-help-feedback::before{content:"";position:absolute;top:-20px;left:22px;right:22px;border-top:1px solid #d5e3e5}.coach-help-feedback p{margin:0;color:#6a7e83;font-size:.76rem;line-height:1.38}.coach-help-feedback__actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.coach-help-feedback__actions button,.coach-help-feedback__form button{border:1px solid #cbdadd;border-radius:12px;color:#5d7278;background:rgb(255 255 255 / 58%);cursor:pointer;font-weight:750}.coach-help-feedback__actions button{display:flex;min-height:36px;padding:6px 8px;align-items:center;justify-content:center;gap:6px;font-size:.78rem}.coach-help-feedback__actions button span{display:inline-grid;width:18px;height:18px;place-items:center;border-radius:999px;color:#6d858b;background:rgb(228 239 241 / 70%);font-size:.72rem}.coach-help-feedback__actions button:hover,.coach-help-feedback__actions button:focus-visible,.coach-help-feedback__actions button.is-selected{border-color:#7aa5ad;color:#255a66;background:#e9f5f6}.coach-help-feedback__actions button:hover span,.coach-help-feedback__actions button:focus-visible span,.coach-help-feedback__actions button.is-selected span{color:#255a66;background:white}.coach-help-feedback__actions button:disabled,.coach-help-feedback__form button:disabled{cursor:progress;opacity:.72}.coach-help-feedback__form{display:grid;gap:7px}.coach-help-feedback__form label{color:#6a7e83;font-size:.74rem;font-weight:800}.coach-help-feedback__form textarea{width:100%;resize:vertical;padding:9px 10px;border:1px solid #b8cdd1;border-radius:12px;color:#263b43;background:rgb(255 255 255 / 72%);font:inherit;font-size:.82rem;line-height:1.38}.coach-help-feedback__form button{justify-self:start;padding:8px 11px;border-color:#a8c2c7;color:#3f5960;background:rgb(255 255 255 / 72%);font-size:.78rem}.coach-help-feedback__status{color:#46765f;font-size:.8rem;font-weight:800}.coach-help-feedback__error{color:#9f514b;font-size:.8rem;font-weight:800}
:global(:root[data-theme='dark'] .coach-help-panel){color:#dce8e9;border-color:#60777d;background:#13262b}:global(:root[data-theme='dark'] .coach-help-card),:global(:root[data-theme='dark'] .coach-help-footer){border-color:#3e595d;background:#1b3035}:global(:root[data-theme='dark'] .coach-help-card h3),:global(:root[data-theme='dark'] .coach-help-requested-form){color:#b5e4e7}:global(:root[data-theme='dark'] .coach-help-meaning),:global(:root[data-theme='dark'] .coach-help-footer p),:global(:root[data-theme='dark'] .coach-help-custom-content){color:#bfd0d2}:global(:root[data-theme='dark'] .coach-help-card dl>div){background:#243e42}:global(:root[data-theme='dark'] .coach-help-card dt){color:#a8bdc0}:global(:root[data-theme='dark'] .coach-help-card dd){color:#edf5f5}:global(:root[data-theme='dark'] .coach-help-endings){color:#f4e4bb;background:#3b321b}:global(:root[data-theme='dark'] .coach-help-endings strong){color:#f1cb71}:global(:root[data-theme='dark'] .coach-help-exception){color:#f3d1bd;border-color:#b96c3b;background:#3c271e}:global(:root[data-theme='dark'] .coach-help-card--warning){color:#f0e3c2;border-color:#665631;background:#332c1c}:global(:root[data-theme='dark'] .coach-help-card--warning h3){color:#f1ce78}
:global(:root[data-theme='dark'] .coach-help-badge){color:#dce8e9;border-color:#71878c;background:#20363b}
:global(:root[data-theme='dark'] .coach-help-feedback){border-color:#486268;background:rgb(18 43 49 / 42%);color:#aebfc2}:global(:root[data-theme='dark'] .coach-help-feedback::before){border-top-color:#405a5f}:global(:root[data-theme='dark'] .coach-help-feedback p){color:#9fb1b4}:global(:root[data-theme='dark'] .coach-help-feedback__actions button){border-color:#405a60;color:#aebfc2;background:rgb(16 35 40 / 48%)}:global(:root[data-theme='dark'] .coach-help-feedback__actions button span){color:#9fbfc5;background:rgb(36 62 67 / 64%)}:global(:root[data-theme='dark'] .coach-help-feedback__actions button:hover),:global(:root[data-theme='dark'] .coach-help-feedback__actions button:focus-visible),:global(:root[data-theme='dark'] .coach-help-feedback__actions button.is-selected){border-color:#6b9aa3;color:#dce8e9;background:#243e43}:global(:root[data-theme='dark'] .coach-help-feedback__actions button:hover span),:global(:root[data-theme='dark'] .coach-help-feedback__actions button:focus-visible span),:global(:root[data-theme='dark'] .coach-help-feedback__actions button.is-selected span){color:#dce8e9;background:#31565d}:global(:root[data-theme='dark'] .coach-help-feedback__form label){color:#aebfc2}:global(:root[data-theme='dark'] .coach-help-feedback__form textarea){border-color:#4a666b;color:#e8f2f3;background:rgb(16 35 40 / 72%)}:global(:root[data-theme='dark'] .coach-help-feedback__form button){border-color:#4f747b;color:#dce8e9;background:rgb(16 35 40 / 72%)}:global(:root[data-theme='dark'] .coach-help-feedback__status){color:#89c9aa}:global(:root[data-theme='dark'] .coach-help-feedback__error){color:#e3a19c}
@media(max-width:900px){.coach-help-panel{width:100%;min-width:0}}
@media(max-width:680px){.coach-help-badge{top:12px;transform:translateX(-50%)}.coach-help-header{padding-top:64px}}
</style>
