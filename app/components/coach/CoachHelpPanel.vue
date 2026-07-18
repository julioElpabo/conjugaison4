<script setup lang="ts">
import type { CoachHelpBlock } from '~~/shared/types/coach'
import type { CoachHelpContentValues } from '~~/shared/utils/coach-help'
import { renderCoachHelpContent } from '~~/shared/utils/coach-help'
import { sanitizeCoachHtml } from '~~/shared/utils/safe-html'

const props = withDefaults(defineProps<{
  blocks: CoachHelpBlock[]
  values: CoachHelpContentValues
  headerTitle?: string
  headerDescription?: string
  questionNumber?: number
  coachColor?: string
  embedded?: boolean
  showClose?: boolean
}>(), {
  questionNumber: 1,
  coachColor: '#295f72',
  embedded: false,
  showClose: true,
  headerTitle: '{helpTitle}',
  headerDescription: '',
})

const emit = defineEmits<{ close: [] }>()
const renderedBlocks = computed(() => props.blocks.filter(block => block.isActive))
const renderedHeaderTitle = computed(() => renderCoachHelpContent(props.headerTitle, props.values))
const renderedHeaderDescription = computed(() => sanitizeCoachHtml(renderCoachHelpContent(props.headerDescription, props.values)))

</script>

<template>
  <aside
    class="coach-help-panel"
    :class="{ 'coach-help-panel--embedded': embedded }"
    :style="{ '--coach-color': coachColor }"
    role="region"
    aria-labelledby="coach-help-title"
  >
    <header class="coach-help-header">
      <div>
        <span class="coach-help-kicker">Aide ciblée · question {{ questionNumber }}</span>
        <h2 id="coach-help-title">{{ renderedHeaderTitle }}</h2>
        <div v-if="renderedHeaderDescription" class="coach-help-header__description" v-html="renderedHeaderDescription" />
      </div>
      <button v-if="showClose" type="button" aria-label="Fermer l’aide" @click="emit('close')">×</button>
    </header>

    <div class="coach-help-content">
      <CoachHelpBlockView
        v-for="(block, index) in renderedBlocks"
        :key="`${block.id}-${index}`"
        :block="block"
        :values="values"
      />
    </div>

    <footer class="coach-help-footer"><button type="button" @click="emit('close')">Fermer</button></footer>
  </aside>
</template>

<style scoped>
.coach-help-panel{display:grid;width:min(440px,38vw);min-width:360px;height:100%;grid-template-rows:auto minmax(0,1fr) auto;overflow:hidden;border:1px solid rgb(255 255 255 / 68%);border-radius:24px;color:#263b43;background:#f8fcfb;box-shadow:0 30px 80px rgb(12 29 39 / 32%)}.coach-help-panel--embedded{width:100%;min-width:0;height:720px;border-color:#c9dadd;box-shadow:0 14px 35px rgb(12 29 39 / 15%)}.coach-help-header{display:flex;padding:22px 22px 18px;align-items:flex-start;gap:16px;color:white;background:linear-gradient(135deg,var(--coach-color,#295f72),#187b83)}.coach-help-header>div{min-width:0;flex:1}.coach-help-kicker{display:block;margin-bottom:7px;color:rgb(255 255 255 / 78%);font-size:.7rem;font-weight:850;letter-spacing:.07em;text-transform:uppercase}.coach-help-header h2,.coach-help-header p{margin:0}.coach-help-header h2{font-size:1.35rem;line-height:1.15}.coach-help-header p{margin-top:6px;color:rgb(255 255 255 / 84%);font-size:.9rem}.coach-help-header button{width:38px;height:38px;flex:0 0 auto;border:1px solid rgb(255 255 255 / 58%);border-radius:12px;color:white;background:rgb(255 255 255 / 10%);cursor:pointer;font-size:1.5rem;line-height:1}.coach-help-header button:hover,.coach-help-header button:focus-visible{background:rgb(255 255 255 / 22%)}.coach-help-content{display:flex;overflow-y:auto;padding:16px;flex-direction:column;gap:12px}.coach-help-card{padding:16px;border:1px solid #cfe0dc;border-radius:16px;background:white;box-shadow:0 4px 14px rgb(37 75 78 / 6%)}.coach-help-card h3{display:flex;margin:0 0 11px;align-items:center;gap:9px;color:#17566a;font-size:.96rem}.coach-help-card h3>span{display:inline-grid;width:25px;height:25px;flex:0 0 auto;place-items:center;border-radius:8px;color:white;background:#267a87;font-size:.76rem}.coach-help-card p{margin:0;line-height:1.52}.coach-help-custom-content{margin-bottom:12px!important;color:#405b63;white-space:pre-line}.coach-help-card--intro,.coach-help-card--custom{border-color:color-mix(in srgb,var(--coach-color,#295f72) 28%,#cfe0dc);background:color-mix(in srgb,var(--coach-color,#295f72) 5%,white)}.coach-help-requested-form{margin-bottom:10px!important;color:#17566a;font-weight:850}.coach-help-meaning{color:#405b63}.coach-help-card dl{display:grid;margin:14px 0 0;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.coach-help-card dl>div{padding:9px 10px;border-radius:10px;background:#eef6f4}.coach-help-card dt{color:#6b7e81;font-size:.67rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase}.coach-help-card dd{margin:3px 0 0;color:#25484f;font-weight:800;overflow-wrap:anywhere}.coach-help-endings{display:grid;margin-top:12px;padding:11px 12px;gap:3px;border-left:4px solid #d59a1c;border-radius:5px 10px 10px 5px;background:#fff7df}.coach-help-endings strong{color:#7d5709;font-size:.76rem;text-transform:uppercase}.coach-help-endings span{line-height:1.45}.coach-help-exception{display:grid;margin-top:12px;padding:12px;gap:4px;border:2px solid #c8753d;border-radius:11px;color:#653515;background:#fff0e5}.coach-help-exception strong{font-size:.76rem;letter-spacing:.05em;text-transform:uppercase}.coach-help-exception span{line-height:1.45}.coach-help-card ul,.coach-help-card ol{margin:0;padding-left:1.25rem}.coach-help-card li{padding-left:.25rem;line-height:1.48}.coach-help-card li+li{margin-top:7px}.coach-help-card--warning{border-color:#ead7a6;background:#fffbef}.coach-help-card--warning h3{color:#76530c}.coach-help-card--warning h3>span{color:#4c3504;background:#e1ad3d}.coach-help-footer{display:grid;padding:14px 16px 16px;gap:10px;border-top:1px solid #d6e4e1;background:white}.coach-help-footer p{margin:0;color:#65797e;font-size:.75rem;text-align:center}.coach-help-footer button{padding:11px 16px;border:0;border-radius:12px;color:white;background:#176b87;cursor:pointer;font-weight:800}.coach-help-empty{margin:auto;color:#65797e;text-align:center}
.coach-help-header__description{margin-top:7px;color:rgb(255 255 255 / 84%);font-size:.9rem;line-height:1.45}.coach-help-header__description :deep(> :first-child){margin-top:0}.coach-help-header__description :deep(> :last-child){margin-bottom:0}
:global(:root[data-theme='dark'] .coach-help-panel){color:#dce8e9;border-color:#60777d;background:#13262b}:global(:root[data-theme='dark'] .coach-help-card),:global(:root[data-theme='dark'] .coach-help-footer){border-color:#3e595d;background:#1b3035}:global(:root[data-theme='dark'] .coach-help-card h3),:global(:root[data-theme='dark'] .coach-help-requested-form){color:#b5e4e7}:global(:root[data-theme='dark'] .coach-help-meaning),:global(:root[data-theme='dark'] .coach-help-footer p),:global(:root[data-theme='dark'] .coach-help-custom-content){color:#bfd0d2}:global(:root[data-theme='dark'] .coach-help-card dl>div){background:#243e42}:global(:root[data-theme='dark'] .coach-help-card dt){color:#a8bdc0}:global(:root[data-theme='dark'] .coach-help-card dd){color:#edf5f5}:global(:root[data-theme='dark'] .coach-help-endings){color:#f4e4bb;background:#3b321b}:global(:root[data-theme='dark'] .coach-help-endings strong){color:#f1cb71}:global(:root[data-theme='dark'] .coach-help-exception){color:#f3d1bd;border-color:#b96c3b;background:#3c271e}:global(:root[data-theme='dark'] .coach-help-card--warning){color:#f0e3c2;border-color:#665631;background:#332c1c}:global(:root[data-theme='dark'] .coach-help-card--warning h3){color:#f1ce78}
@media(max-width:900px){.coach-help-panel{width:100%;min-width:0}}
</style>
