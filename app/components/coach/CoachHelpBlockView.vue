<script setup lang="ts">
import type { CoachHelpBlock } from '~~/shared/types/coach'
import type { CoachHelpContentValues } from '~~/shared/utils/coach-help'
import { automaticOrthographyHelpKind, renderCoachHelpContent } from '~~/shared/utils/coach-help'
import { sanitizeCoachHtml } from '~~/shared/utils/safe-html'

const props = defineProps<{
  block: CoachHelpBlock
  values: CoachHelpContentValues
}>()

const activeChildren = computed(() => (props.block.children || []).filter(child => child.isActive))
const isRadicalBlock = computed(() => props.block.content.trim() === '{contextualBaseHelp}')
const orthographyKind = computed(() => automaticOrthographyHelpKind(props.block))
const animationRun = ref(0)
const renderedTitle = computed(() => isRadicalBlock.value ? 'Radical' : props.block.title)
const renderedContent = computed(() => sanitizeCoachHtml(renderCoachHelpContent(props.block.content, props.values, props.block.explanationApproach || 'cif-falc')))
const hasRadicalAnimation = computed(() => isRadicalBlock.value && renderedContent.value.includes('<figure>'))
</script>

<template>
  <section class="coach-help-block" :class="[`coach-help-block--${block.type}`, { 'coach-help-block--orthography': orthographyKind }]">
    <h3 v-if="renderedTitle">
      <span v-if="orthographyKind" class="coach-help-block__letter" aria-hidden="true">{{ orthographyKind.toUpperCase() }}</span>
      {{ renderedTitle }}
    </h3>
    <div
      v-if="renderedContent"
      :key="hasRadicalAnimation ? animationRun : 0"
      class="coach-help-block__content"
      :class="{ 'coach-help-block__content--radical': hasRadicalAnimation }"
      v-html="renderedContent"
    />
    <button
      v-if="hasRadicalAnimation"
      class="coach-help-block__replay"
      type="button"
      aria-label="Rejouer la construction du radical"
      @click="animationRun += 1"
    >
      <span aria-hidden="true">↻</span> Rejouer
    </button>
    <div v-if="activeChildren.length" class="coach-help-block__children">
      <CoachHelpBlockView
        v-for="(child, index) in activeChildren"
        :key="`${child.id}-${index}`"
        :block="child"
        :values="values"
      />
    </div>
  </section>
</template>

<style scoped>
.coach-help-block{--help-list-accent:#267f8d;--help-list-marker:#e0f1f2;--help-list-surface:#f3f8f7;--help-list-border:#d9e8e5;--help-list-text:#29454c;display:grid;gap:8px;color:#293e45}.coach-help-block>h3{margin:0;color:#185a6d;font-size:1rem}.coach-help-block__content{line-height:1.55}.coach-help-block__content :deep(> :first-child){margin-top:0}.coach-help-block__content :deep(> :last-child){margin-bottom:0}.coach-help-block__content :deep(code){display:inline-block;padding:2px 7px;border:1px solid var(--help-list-border);border-radius:7px;color:var(--help-list-accent);background:var(--help-list-marker);font:800 .9em/1.4 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}.coach-help-block__content :deep(ul),.coach-help-block__content :deep(ol){display:grid;margin:0;padding:20px 0 0;gap:7px;list-style:none}.coach-help-block__content :deep(ol){counter-reset:coach-help-list}.coach-help-block__content :deep(ul>li),.coach-help-block__content :deep(ol>li){position:relative;min-height:38px;margin:0;padding:8px 10px 8px 42px;border:1px solid var(--help-list-border);border-radius:11px;color:var(--help-list-text);background:var(--help-list-surface);line-height:1.45}.coach-help-block__content :deep(ul>li::before),.coach-help-block__content :deep(ol>li::before){position:absolute;top:7px;left:8px;display:grid;width:24px;height:24px;place-items:center;border-radius:8px;color:var(--help-list-accent);background:var(--help-list-marker);font-size:1rem;font-weight:900;line-height:1}.coach-help-block__content :deep(ul>li::before){content:'✦';font-size:.72rem}.coach-help-block__content :deep(ol>li){counter-increment:coach-help-list}.coach-help-block__content :deep(ol>li::before){content:counter(coach-help-list);font-size:.7rem}.coach-help-block__content :deep(li>ul),.coach-help-block__content :deep(li>ol){padding-top:8px}.coach-help-block__content :deep(table){width:100%;margin:17px 0 0;border-collapse:separate;border-spacing:0 7px}.coach-help-block__content :deep(th),.coach-help-block__content :deep(td){padding:8px 12px;border:0;line-height:1.35}.coach-help-block__content :deep(th){border-radius:11px 0 0 11px;color:var(--help-list-text);background:var(--help-list-surface);text-align:left;font-size:.86rem;font-weight:750}.coach-help-block__content :deep(td){width:34%;border-radius:0 11px 11px 0;color:var(--help-list-accent);background:var(--help-list-marker);text-align:center;font:850 .88rem/1.35 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}.coach-help-block__content :deep(details){margin-top:8px;border:1px solid var(--help-list-border);border-radius:11px;color:var(--help-list-text);background:var(--help-list-surface)}.coach-help-block__content :deep(summary){padding:9px 12px;color:var(--help-list-accent);font-weight:850;cursor:pointer}.coach-help-block__content :deep(details p){margin:0;padding:2px 12px 12px}.coach-help-block__children{display:grid;margin-top:8px;gap:12px}.coach-help-block--normal{padding:16px;border:1px solid #cfe0dc;border-radius:16px;background:white}.coach-help-block--warning,.coach-help-block--danger{margin-block:8px;padding:14px 16px;border-radius:12px}.coach-help-block--warning{--help-list-accent:#8a650f;--help-list-marker:#f7e5aa;--help-list-surface:#fffaf0;--help-list-border:#ead9a7;--help-list-text:#57400d;border-left:5px solid #d9a20f;color:#57400d;background:#fff6d9}.coach-help-block--warning>h3{color:#79540a;text-transform:uppercase}.coach-help-block--danger{--help-list-accent:#a55227;--help-list-marker:#f5d8c5;--help-list-surface:#fff8f3;--help-list-border:#e8c1aa;--help-list-text:#663716;border:2px solid #c96f37;color:#663716;background:#fff0e5}.coach-help-block--danger>h3{color:#6d3816;text-transform:uppercase}.coach-help-block--warning>h3,.coach-help-block--danger>h3{font-size:.82rem;letter-spacing:.04em}.coach-help-block--header{padding:4px 0}.coach-help-block__header{display:flex;align-items:center;gap:12px}.coach-help-block__header>span{display:grid;width:42px;height:42px;flex:0 0 auto;place-items:center;border-radius:14px;color:white;background:#267f8d;font-size:1.15rem;font-weight:900}.coach-help-block__header h3{margin:0;color:#15566a;font-size:1.35rem}.coach-help-block--header>.coach-help-block__content{color:#1b596c;font-size:1.05rem;font-weight:750}.coach-help-block--header>.coach-help-block__children{margin-top:14px}:global(:root[data-theme='dark'] .coach-help-block){--help-list-accent:#84cad5;--help-list-marker:#28464d;--help-list-surface:#20383d;--help-list-border:#3b565c;--help-list-text:#dce8e9;color:#dce8e9}:global(:root[data-theme='dark'] .coach-help-block--normal){border-color:#3e595d;background:#1b3035}:global(:root[data-theme='dark'] .coach-help-block>h3),:global(:root[data-theme='dark'] .coach-help-block__header h3){color:#b5e4e7}:global(:root[data-theme='dark'] .coach-help-block--warning){--help-list-accent:#edc765;--help-list-marker:#4c3f20;--help-list-surface:#3b321f;--help-list-border:#625431;--help-list-text:#f0e3c2;color:#f0e3c2;background:#332c1c}:global(:root[data-theme='dark'] .coach-help-block--danger){--help-list-accent:#efa476;--help-list-marker:#543124;--help-list-surface:#472d23;--help-list-border:#764b37;--help-list-text:#f3d1bd;color:#f3d1bd;background:#3c271e}

.coach-help-block__content--radical :deep(figure){display:grid;margin:16px 0 0;padding:14px;border:1px solid var(--help-list-border);border-radius:14px;gap:9px;color:var(--help-list-text);background:var(--help-list-surface);overflow:hidden}.coach-help-block__content--radical :deep(figcaption){color:var(--help-list-accent);font-size:.78rem;font-weight:850;letter-spacing:.04em;text-transform:uppercase}.coach-help-block__content--radical :deep(figure p){margin:0;padding:9px 11px;border-radius:10px;background:color-mix(in srgb,var(--help-list-marker) 54%,transparent);font:800 1rem/1.45 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}.coach-help-block__content--radical :deep(figure p small){display:block;margin-bottom:3px;color:var(--help-list-text);font:650 .72rem/1.35 system-ui,sans-serif;opacity:.75}.coach-help-block__content--radical :deep(figure del){display:inline-block;margin-left:1px;padding-inline:3px;border-radius:5px;color:#9b432b;background:#ffd8cc;text-decoration-thickness:2px;animation:radical-ending-out 3.4s ease both}.coach-help-block__content--radical :deep(figure p:nth-of-type(2)){color:var(--help-list-accent);animation:radical-step-in 3.4s ease both}.coach-help-block__content--radical :deep(figure p:nth-of-type(3)){animation:radical-result-in 3.4s ease both}.coach-help-block__content--radical :deep(figure mark){padding:2px 5px;border-radius:5px;color:#6e520b;background:#ffe6a3}.coach-help-block__replay{justify-self:end;padding:5px 9px;border:1px solid var(--help-list-border);border-radius:9px;color:var(--help-list-accent);background:transparent;font:inherit;font-size:.75rem;font-weight:750;line-height:1.2;cursor:pointer}.coach-help-block__replay:hover{background:var(--help-list-marker)}.coach-help-block__replay:focus-visible{outline:3px solid color-mix(in srgb,var(--help-list-accent) 35%,transparent);outline-offset:2px}@keyframes radical-ending-out{0%,28%{opacity:1;transform:none}42%,100%{opacity:0;transform:translateY(12px)}}@keyframes radical-step-in{0%,38%{opacity:0;transform:translateY(8px)}54%,100%{opacity:1;transform:none}}@keyframes radical-result-in{0%,64%{opacity:0;transform:translateY(8px)}80%,100%{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){.coach-help-block__content--radical :deep(figure del),.coach-help-block__content--radical :deep(figure p:nth-of-type(2)),.coach-help-block__content--radical :deep(figure p:nth-of-type(3)){animation:none;opacity:1;transform:none}}
.coach-help-block--orthography{margin-top:8px;border-top:4px solid var(--help-list-accent)}.coach-help-block--orthography>h3{display:flex;align-items:center;gap:9px}.coach-help-block__letter{display:grid;width:30px;height:30px;place-items:center;border-radius:9px;color:white;background:var(--help-list-accent);font-size:.85rem;font-weight:900}.coach-help-block--orthography .coach-help-block__content :deep(table){border-spacing:0 8px}.coach-help-block--orthography .coach-help-block__content :deep(th){width:47%;border:1px solid var(--help-list-border);border-right:0}.coach-help-block--orthography .coach-help-block__content :deep(td){width:auto;border:1px solid var(--help-list-border);border-left:0;color:var(--help-list-text);background:var(--help-list-marker);text-align:left;font:700 .84rem/1.4 system-ui,sans-serif}.coach-help-block--orthography .coach-help-block__content :deep(table+p){margin-top:16px;padding:12px;border-radius:11px;color:var(--help-list-text);background:var(--help-list-surface)}
</style>
