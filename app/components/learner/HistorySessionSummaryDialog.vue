<script setup lang="ts">
import type { ExerciseQuestion, LearnerErrorDetail } from '~~/shared/types/conjugation'
import type { IdentificationFormParts } from '~~/shared/utils/identification-form'
import { buildAnswerComparison } from '~~/shared/utils/answer-difference'
import LearnerErrorDetailMessage from '~/components/exercise/LearnerErrorDetailMessage.vue'

interface SummaryItem {
  index: number
  status: 'correct' | 'incorrect'
  questionLabel: string
  learnerAnswer: string
  expectedAnswer: string
  acceptedAnswers: string[]
  displayExpectedAnswers: string[]
  errorLabels: string[]
  errorDetails: LearnerErrorDetail[]
  identificationForm: IdentificationFormParts | null
  literaryCitation?: ExerciseQuestion['literaryCitation']
  isIdentification: boolean
}

const props = defineProps<{
  title: string
  items: SummaryItem[]
  correctCount: number
  totalCount: number
}>()

const emit = defineEmits<{ close: [] }>()
const { interfaceLocale, ui } = useLanguagePreferences()
const dialog = useTemplateRef<HTMLElement>('history-summary-dialog')
const incorrectItems = computed(() => props.items.filter(item => item.status === 'incorrect'))
const correctItems = computed(() => props.items.filter(item => item.status === 'correct'))
const answerComparison = (item: SummaryItem) => buildAnswerComparison(
  item.learnerAnswer,
  item.acceptedAnswers?.length ? item.acceptedAnswers : [item.expectedAnswer],
  item.displayExpectedAnswers?.length ? item.displayExpectedAnswers : [item.expectedAnswer],
)

const resultLabel = computed(() => {
  const middle = {
    fr: 'réussites sur',
    de: 'Erfolge von',
    en: 'correct out of',
    it: 'risposte corrette su',
    es: 'aciertos de',
  }[interfaceLocale.value]
  return `${props.correctCount} ${middle} ${props.totalCount}`
})

useDialogFocus(dialog, () => emit('close'))
</script>

<template>
  <Teleport to="body">
    <div class="history-summary-overlay" role="presentation" @click.self="emit('close')">
      <section
        ref="history-summary-dialog"
        class="history-summary-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-summary-title"
      >
        <header class="history-summary-dialog__header">
          <div>
            <span>{{ ui('Bilan de la séance') }}</span>
            <h2 id="history-summary-title">{{ title }}</h2>
            <p>{{ resultLabel }}</p>
          </div>
          <button type="button" :aria-label="ui('Fermer')" @click="emit('close')">×</button>
        </header>

        <div class="history-summary-dialog__content">
          <section v-if="incorrectItems.length" class="history-summary-section history-summary-section--errors">
            <h3>{{ ui('Mes erreurs') }} <span>{{ incorrectItems.length }}</span></h3>
            <ol>
              <li v-for="item in incorrectItems" :key="`error-${item.index}`">
                <p class="history-summary-item__question">{{ item.questionLabel }}</p>
                <blockquote v-if="item.identificationForm" class="history-summary-item__citation">
                  <p>
                    <span>{{ item.identificationForm.before }}</span><mark>{{ item.identificationForm.target }}</mark><span>{{ item.identificationForm.after }}</span>
                  </p>
                  <footer v-if="item.literaryCitation">
                    {{ item.literaryCitation.author }}, <cite>{{ item.literaryCitation.work }}</cite>
                  </footer>
                </blockquote>
                <div
                  v-for="comparison in [answerComparison(item)]"
                  :key="`${item.index}-comparison`"
                  class="history-summary-item__comparison"
                >
                  <span class="history-summary-item__answer history-summary-item__answer--learner">
                    <template v-if="item.isIdentification">{{ item.learnerAnswer || '—' }}</template>
                    <template v-else-if="comparison">
                      <span
                        v-for="(part, partIndex) in comparison.learnerParts"
                        :key="`learner-${partIndex}`"
                        :class="`history-summary-item__part--${part.kind}`"
                      >{{ part.text }}</span>
                    </template>
                    <template v-else>{{ item.learnerAnswer || '—' }}</template>
                  </span>
                  <b aria-hidden="true">→</b>
                  <strong class="history-summary-item__answer history-summary-item__answer--expected">
                    <template v-if="item.isIdentification">{{ item.expectedAnswer }}</template>
                    <template v-else-if="comparison">
                      <span
                        v-for="(part, partIndex) in comparison.expectedParts"
                        :key="`expected-${partIndex}`"
                        :class="`history-summary-item__part--${part.kind}`"
                      >{{ part.text }}</span>
                    </template>
                    <template v-else>{{ item.expectedAnswer }}</template>
                  </strong>
                </div>
                <ul v-if="item.errorDetails.length" class="history-summary-item__reasons">
                  <li v-for="detail in item.errorDetails" :key="detail.code">
                    <LearnerErrorDetailMessage :detail="detail" />
                  </li>
                </ul>
              </li>
            </ol>
          </section>

          <section class="history-summary-section history-summary-section--successes">
            <h3>{{ ui('Mes réussites') }} <span>{{ correctItems.length }}</span></h3>
            <ol v-if="correctItems.length">
              <li v-for="item in correctItems" :key="`success-${item.index}`">
                <p class="history-summary-item__question">{{ item.questionLabel }}</p>
                <strong class="history-summary-item__correct">{{ item.expectedAnswer }}</strong>
              </li>
            </ol>
            <p v-else class="history-summary-section__empty">{{ ui('Aucune réussite dans cette séance.') }}</p>
          </section>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.history-summary-overlay{position:fixed;z-index:2200;inset:0;display:grid;padding:24px;place-items:center;background:rgb(14 25 38 / 74%);backdrop-filter:blur(6px)}
.history-summary-dialog{display:grid;width:min(900px,100%);max-height:min(900px,calc(100dvh - 48px));grid-template-rows:auto minmax(0,1fr);overflow:hidden;border:1px solid var(--line);border-radius:22px;color:var(--ink);background:var(--surface);box-shadow:0 30px 90px rgb(5 19 25 / 42%)}
.history-summary-dialog__header{display:flex;padding:20px 22px;align-items:start;justify-content:space-between;gap:20px;border-bottom:1px solid var(--line);background:var(--surface-soft)}
.history-summary-dialog__header span{color:var(--learner-purple-heading,#7052a0);font-size:.72rem;font-weight:900;letter-spacing:.09em;text-transform:uppercase}
.history-summary-dialog__header h2{margin:4px 0 0;color:var(--ink);font-size:clamp(1.2rem,3vw,1.65rem)}
.history-summary-dialog__header p{margin:5px 0 0;color:var(--muted)}
.history-summary-dialog__header button{display:grid;width:40px;height:40px;border:1px solid var(--line);border-radius:50%;place-items:center;color:var(--muted);background:var(--surface);font:inherit;font-size:1.45rem;cursor:pointer}
.history-summary-dialog__content{display:grid;overflow-y:auto;padding:22px;gap:24px}
.history-summary-section{display:grid;gap:11px}
.history-summary-section h3{display:flex;margin:0;align-items:center;gap:8px;color:var(--ink);font-size:1rem}
.history-summary-section h3 span{display:grid;min-width:25px;height:25px;padding:0 7px;border-radius:99px;place-items:center;color:var(--muted);background:var(--surface-soft);font-size:.72rem}
.history-summary-section>ol{display:grid;margin:0;padding:0;gap:11px;list-style:none}
.history-summary-section>ol>li{display:grid;padding:15px 16px;border:1px solid var(--line);border-left-width:5px;border-radius:14px;gap:9px;background:var(--surface-soft)}
.history-summary-section--errors>ol>li{border-left-color:var(--danger);background:color-mix(in srgb,var(--danger) 7%,var(--surface))}
.history-summary-section--successes>ol>li{border-left-color:var(--success);background:color-mix(in srgb,var(--success) 7%,var(--surface))}
.history-summary-item__question{margin:0;color:var(--muted);font-size:.78rem;line-height:1.35}
.history-summary-item__citation{display:grid;margin:0;padding:10px 12px;gap:4px;border-left:3px solid #e2b945;border-radius:0 9px 9px 0;background:color-mix(in srgb,#f6d85d 13%,var(--surface))}
.history-summary-item__citation p{margin:0;color:var(--ink);font-weight:700;line-height:1.5}
.history-summary-item__citation mark{padding:1px 4px;color:#4b3563;border-radius:4px;background:#eadcf8;font-weight:900}
.history-summary-item__citation footer{color:var(--muted);font-size:.7rem;font-weight:700}
.history-summary-item__comparison{display:flex;flex-wrap:wrap;align-items:baseline;gap:9px;font-size:1rem;line-height:1.45}
.history-summary-item__answer--learner{color:#ba2f28}
.history-summary-item__comparison>b{color:var(--muted);font-weight:600}
.history-summary-item__answer--expected,.history-summary-item__correct{color:var(--success);font-weight:800}
.history-summary-item__part--changed,.history-summary-item__part--extra{padding:1px 2px;border-radius:4px}
.history-summary-item__answer--learner .history-summary-item__part--changed,.history-summary-item__answer--learner .history-summary-item__part--extra{color:var(--danger);background:color-mix(in srgb,var(--danger) 18%,var(--surface));text-decoration:underline 2px;text-underline-offset:3px}
.history-summary-item__answer--expected .history-summary-item__part--changed{color:#493600;background:#f6d85d;box-shadow:0 0 0 2px rgb(230 185 54 / 20%)}
:global(:root[data-theme='dark']) .history-summary-item__answer--expected .history-summary-item__part--changed{color:#211900;background:#e8c84f}
.history-summary-item__reasons{display:grid;margin:1px 0 0;padding:10px 13px;gap:5px;border-radius:10px;color:var(--learner-purple-copy,#5a3b86);background:color-mix(in srgb,#7052a0 7%,var(--surface));font-size:.82rem;line-height:1.45;list-style:none}
.history-summary-section__empty{margin:0;padding:15px;border:1px dashed var(--line);border-radius:12px;color:var(--muted);background:var(--surface-soft)}
@media(max-width:650px){.history-summary-overlay{padding:0}.history-summary-dialog{width:100%;height:100dvh;max-height:none;border:0;border-radius:0}.history-summary-dialog__header,.history-summary-dialog__content{padding:17px}.history-summary-item__comparison{font-size:.92rem}}
</style>
