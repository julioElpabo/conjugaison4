<script setup lang="ts">
import type { LearnerErrorDetail } from '~~/shared/types/conjugation'
import { localizedLearnerErrorMessage } from '~~/shared/i18n/learner-errors'

const props = defineProps<{ detail: LearnerErrorDetail }>()
const { interfaceLocale } = useLanguagePreferences()
const isPersonConfusion = computed(() => (
  props.detail.code === 'person.other_form'
  && Boolean(props.detail.learnerValue)
  && Boolean(props.detail.expectedValue)
))
const personSentence = computed(() => ({
  fr: { intro: 'Tu as confondu la personne.', before: 'Tu as conjugué avec', middle: 'alors que c’était' },
  de: { intro: 'Du hast die Person verwechselt.', before: 'Du hast mit', middle: 'konjugiert, erwartet war aber' },
  en: { intro: 'You confused the grammatical person.', before: 'You conjugated for', middle: 'but the expected person was' },
  it: { intro: 'Hai confuso la persona.', before: 'Hai coniugato con', middle: 'ma la persona richiesta era' },
  es: { intro: 'Has confundido la persona.', before: 'Has conjugado con', middle: 'pero la persona esperada era' },
})[interfaceLocale.value])
</script>

<template>
  <span v-if="isPersonConfusion" class="person-confusion-message">
    {{ personSentence.intro }}
    {{ personSentence.before }}
    <mark class="is-wrong">{{ detail.learnerValue }}</mark>,
    {{ personSentence.middle }}
    <mark class="is-correct">{{ detail.expectedValue }}</mark>.
  </span>
  <span v-else>{{ localizedLearnerErrorMessage(detail, interfaceLocale) }}</span>
</template>

<style scoped>
.person-confusion-message{line-height:1.55}
.person-confusion-message mark{display:inline-block;padding:1px 5px;border-radius:6px;color:inherit;font-weight:800}
.person-confusion-message .is-wrong{color:var(--danger);background:color-mix(in srgb,var(--danger) 18%,var(--surface));text-decoration:underline 2px;text-underline-offset:3px}
.person-confusion-message .is-correct{color:#17613f;background:#cef0dd;box-shadow:inset 0 0 0 1px #8bc8a7}
:global(:root[data-theme='dark']) .person-confusion-message .is-correct{color:#d9f7e6;background:#24543b;box-shadow:inset 0 0 0 1px #478566}
</style>
