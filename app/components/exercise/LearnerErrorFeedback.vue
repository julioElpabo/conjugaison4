<script setup lang="ts">
import type { LearnerErrorDetail } from '~~/shared/types/conjugation'
import { learnerErrorInsteadOf, learnerErrorMorePoints } from '~~/shared/i18n/learner-errors'
import { PROGRESSIVE_ERROR_FEEDBACK_ENABLED } from '~~/shared/config/feature-flags'
import LearnerErrorDetailMessage from '~/components/exercise/LearnerErrorDetailMessage.vue'

const props = defineProps<{
  details: LearnerErrorDetail[]
  compact?: boolean
}>()

const { interfaceLocale } = useLanguagePreferences()
const visibleDetails = computed(() => props.details)
const expanded = ref(false)
watch(() => props.details, () => { expanded.value = false })
const hasSecondary = computed(() => PROGRESSIVE_ERROR_FEEDBACK_ENABLED && visibleDetails.value.length > 1)
</script>

<template>
  <div v-if="visibleDetails.length" class="learner-error-feedback" :class="{ 'is-compact': compact }">
    <ul>
      <li v-for="(detail, index) in visibleDetails" v-show="index === 0 || !hasSecondary || expanded" :key="detail.code">
        <b><LearnerErrorDetailMessage :detail="detail" /></b>
        <span
          v-if="detail.code !== 'person.other_form' && detail.learnerValue && detail.expectedValue"
          class="learner-error-feedback__comparison"
        >
          <del>{{ detail.learnerValue }}</del>
          <span>{{ learnerErrorInsteadOf(interfaceLocale) }}</span>
          <ins>{{ detail.expectedValue }}</ins>
        </span>
      </li>
    </ul>
    <button
      v-if="hasSecondary"
      type="button"
      class="learner-error-feedback__more"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      {{ expanded ? '−' : '+' }} {{ learnerErrorMorePoints(interfaceLocale) }} ({{ visibleDetails.length - 1 }})
    </button>
  </div>
</template>

<style scoped>
.learner-error-feedback__more{justify-self:start;max-width:100%;padding:5px 0;border:0;background:transparent;color:var(--ink);font:inherit;text-align:start;cursor:pointer;text-decoration:underline;text-underline-offset:3px}.learner-error-feedback__more:focus-visible{outline:2px solid var(--ink);outline-offset:3px}.learner-error-feedback{min-width:0;overflow-wrap:anywhere}
.learner-error-feedback{display:grid;padding:12px 14px;border:1px solid color-mix(in srgb,var(--danger) 35%,var(--line));border-radius:12px;gap:8px;color:var(--ink);background:color-mix(in srgb,var(--danger) 7%,var(--surface))}.learner-error-feedback ul{display:grid;margin:0;padding:0;gap:8px;list-style:none}.learner-error-feedback li{display:flex;flex-wrap:wrap;align-items:center;gap:7px;line-height:1.4}.learner-error-feedback li>b{color:var(--ink)}.learner-error-feedback__comparison{display:inline-flex;flex-wrap:wrap;align-items:center;gap:6px}.learner-error-feedback del,.learner-error-feedback ins{padding:3px 8px;border-radius:7px;font-weight:900;text-decoration:none}.learner-error-feedback del{color:#8f2925;background:#ffd8d5;box-shadow:inset 0 0 0 1px #e9a39e}.learner-error-feedback ins{color:#17613f;background:#cef0dd;box-shadow:inset 0 0 0 1px #8bc8a7}.learner-error-feedback__comparison>span{color:var(--muted);font-size:.84em}.learner-error-feedback.is-compact{padding:8px 10px;gap:5px}.learner-error-feedback.is-compact li{font-size:.82rem}:global(:root[data-theme='dark'] .learner-error-feedback){border-color:#8d5753;background:#3b2929}:global(:root[data-theme='dark'] .learner-error-feedback del){color:#ffd8d5;background:#692f2c;box-shadow:inset 0 0 0 1px #9f504a}:global(:root[data-theme='dark'] .learner-error-feedback ins){color:#d9f7e6;background:#24543b;box-shadow:inset 0 0 0 1px #478566}
</style>
