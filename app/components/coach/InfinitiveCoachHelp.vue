<script setup lang="ts">
import type { ExerciseQuestion, LearningSupportMode, Verb } from '~~/shared/types/conjugation'
import type { CoachProfile } from '~~/shared/types/coach'
import CoachHelpBlockView from './CoachHelpBlockView.vue'
import CoachHelpPanel from './CoachHelpPanel.vue'
import { coachHelpProfile } from '~~/shared/data/coach-help-profiles'
import { buildDefinitionHelpHtml, defaultCoachHelpBlocks, localizedCoachVerbDefinition } from '~~/shared/utils/coach-help'
import { INFINITIVE_AMBIGUITY_NOTICE, infinitiveHelpVerb, infinitiveIdentificationGroupHints, infinitiveIdentificationEndingHints } from '~~/shared/utils/infinitive-identification'

const props = defineProps<{
  question: ExerciseQuestion
  questionNumber: number
  verbs?: Verb[]
  coach?: CoachProfile
  learningSupportMode?: LearningSupportMode
  allowAnswer?: boolean
  corrected?: boolean
  feedbackContext?: Record<string, unknown>
}>()
const emit = defineEmits<{ close: [], revealAnswer: [], changeCoach: [coach: CoachProfile] }>()
const { interfaceLocale, ui } = useLanguagePreferences()
const showAnswer = ref(false)
const helpContent = useTemplateRef<HTMLElement>('helpContent')
const usesBareAnswer = computed(() => props.learningSupportMode === 'cif-fle' || coachHelpProfile(props.coach?.helpApproach).id === 'allophone')
const definitionBlock = defaultCoachHelpBlocks('complete')[0]!
watch([() => props.questionNumber, () => props.question], () => { showAnswer.value = false })
watch(() => props.allowAnswer, allowed => { if (!allowed) showAnswer.value = false })
const definition = computed(() => localizedCoachVerbDefinition(
  infinitiveHelpVerb(props.question.infinitif || props.question.reponsesPourCorrige[0] || '', props.verbs || []),
  interfaceLocale.value,
))
const groupHints = computed(() => infinitiveIdentificationGroupHints(props.question, props.verbs || [], ui))
const endingHints = computed(() => infinitiveIdentificationEndingHints(props.question, ui))
const answerText = computed(() => {
  const infinitive = props.question.reponsesPourCorrige.join(` ${ui('ou')} `)
  return usesBareAnswer.value ? infinitive : `${ui('Il s’agit du')} ${ui('verbe {verb}', { verb: infinitive })}.`
})
const helpParagraphs = (texts: string[]) => texts.map(text => buildDefinitionHelpHtml({ definition: text })).join('')
const displayedHelp = computed(() => ({
  header: { title: ui('Trouver l’infinitif') },
  exerciseKind: 'infinitive-identification',
  blocks: [
    { type: 'normal', kind: 'definition', title: ui('Définition'), renderedHtml: helpParagraphs([definition.value ? `${ui('Ce verbe signifie :')} ${definition.value}` : ui('Définition indisponible pour ce verbe.')]) },
    { type: 'normal', kind: 'group', title: ui('Groupe du verbe'), renderedHtml: helpParagraphs(groupHints.value) },
    { type: 'normal', kind: 'ending', title: ui('Terminaison'), renderedHtml: helpParagraphs(endingHints.value) },
    { type: 'normal', kind: 'answer', title: ui('Voir la réponse'), revealed: showAnswer.value, answers: showAnswer.value ? props.question.reponsesPourCorrige : [], renderedHtml: showAnswer.value ? helpParagraphs([answerText.value]) : '' },
  ],
}))

function toggleAnswer(event: Event) {
  const open = (event.target as HTMLDetailsElement).open
  if (open && !showAnswer.value && !props.corrected) emit('revealAnswer')
  showAnswer.value = open
}
</script>

<template>
  <aside ref="helpContent" class="infinitive-help" data-tour="chat-help" :aria-label="ui('Trouver l’infinitif')">
    <header>
      <div>
        <small v-if="coach">{{ coach.firstName }}</small>
        <strong>{{ ui('Trouver l’infinitif') }} · {{ questionNumber }}</strong>
      </div>
      <button type="button" :aria-label="ui('Fermer l’aide')" @click="emit('close')">×</button>
    </header>
    <div :key="question.id + ':' + questionNumber" class="infinitive-help__blocks">
      <details>
        <summary>{{ ui('Indice {number}', { number: 1 }) }} : {{ ui('Définition') }}</summary>
        <CoachHelpBlockView class="infinitive-help__definition" :block="definitionBlock" :values="{}">
          <template #content>
            <p v-if="definition"><strong>{{ ui('Ce verbe signifie :') }}</strong> {{ definition }}</p>
            <p v-else>{{ ui('Définition indisponible pour ce verbe.') }}</p>
          </template>
        </CoachHelpBlockView>
      </details>
      <details>
        <summary>{{ ui('Indice {number}', { number: 2 }) }} : {{ ui('Groupe du verbe') }}</summary>
        <p v-for="hint in groupHints" :key="hint">{{ hint }}</p>
      </details>
      <details>
        <summary>{{ ui('Indice {number}', { number: 3 }) }} : {{ ui('Terminaison') }}</summary>
        <p v-for="hint in endingHints" :key="hint">{{ hint }}</p>
      </details>
      <p v-if="question.reponsesPourCorrige.length > 1">{{ ui(INFINITIVE_AMBIGUITY_NOTICE) }}</p>
      <details v-if="allowAnswer" :open="showAnswer" @toggle="toggleAnswer">
        <summary>{{ ui('Voir la réponse') }}</summary>
        <section v-if="showAnswer" class="infinitive-help__correction">
          <p v-if="usesBareAnswer"><strong>{{ question.reponsesPourCorrige.join(` ${ui('ou')} `) }}</strong></p>
          <p v-else>{{ ui('Il s’agit du') }} <strong>{{ ui('verbe {verb}', { verb: question.reponsesPourCorrige.join(` ${ui('ou')} `) }) }}</strong>.</p>
        </section>
      </details>
    </div>
    <CoachHelpPanel
      v-if="coach"
      footer-only
      :active-coach="coach"
      :help-approach="coach.helpApproach"
      :coach-color="coach.themeColor"
      :question-number="questionNumber"
      :blocks="[]"
      :values="{ helpTitle: ui('Trouver l’infinitif') }"
      :include-automatic-orthography="false"
      :enable-automatic-audit="false"
      :feedback-context="feedbackContext"
      :feedback-content="helpContent"
      :displayed-help="displayedHelp"
      @change-coach="emit('changeCoach', $event)"
    />
  </aside>
</template>

<style scoped>
.infinitive-help { min-width: 0; width: 100%; padding: 20px; border: 1px solid var(--line); border-radius: 18px; background: var(--paper); color: var(--ink); overflow-wrap: anywhere; line-height: 1.6; }
.infinitive-help header { display: flex; align-items: start; justify-content: space-between; gap: 12px; color: var(--brand-dark); }
.infinitive-help header div { display: grid; gap: 4px; }
.infinitive-help header button { flex: 0 0 auto; width: 44px; height: 44px; border: 0; border-radius: 50%; color: inherit; background: var(--soft); font-size: 1.5rem; cursor: pointer; }
.infinitive-help__blocks { display: grid; gap: 12px; margin-top: 16px; }
.infinitive-help details { border: 1px solid var(--line); border-radius: 12px; background: var(--soft); }
.infinitive-help summary { padding: 12px; min-height: 44px; color: var(--brand-dark); font-weight: 700; cursor: pointer; }
.infinitive-help summary:focus-visible { outline: 2px solid var(--brand-dark); outline-offset: 2px; border-radius: 12px; }
.infinitive-help details p, .infinitive-help__correction { margin: 0; padding: 0 12px 12px; }
.infinitive-help__definition { margin: 0 12px 12px; }
.infinitive-help .infinitive-help__definition p { padding: 0; }
.infinitive-help .infinitive-help__correction p { padding: 0; }
</style>
