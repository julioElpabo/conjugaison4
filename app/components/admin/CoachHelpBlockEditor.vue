<script setup lang="ts">
import type { CoachHelpBlock, CoachHelpBlockType } from '~~/shared/types/coach'
import { COACH_HELP_BLOCK_TYPES } from '~~/shared/types/coach'
import { COACH_EXPLANATION_APPROACH_OPTIONS } from '~~/shared/data/coach-explanation-approaches'
import { coachHelpBlockUsesPedagogicalApproach } from '~~/shared/utils/coach-help'

const props = defineProps<{
  block: CoachHelpBlock
  siblings: CoachHelpBlock[]
  index: number
  depth?: number
}>()

const LABELS: Record<CoachHelpBlockType, string> = {
  normal: 'Normal',
  info: 'Info',
  success: 'Success',
  warning: 'Warning',
  danger: 'Danger',
}
const childType = ref<CoachHelpBlockType>('normal')
const isContextualBaseBlock = computed(() => props.block.content.trim() === '{contextualBaseHelp}')
const isReferenceFormBlock = computed(() => ['{referenceFormHelp}', '{nousFormHelp}'].includes(props.block.content.trim()))
const isDefinitionBlock = computed(() => props.block.content.trim() === '{definitionHelp}')
const usesPedagogicalApproach = computed(() => coachHelpBlockUsesPedagogicalApproach(props.block.content))
const selectedApproach = computed(() => COACH_EXPLANATION_APPROACH_OPTIONS.find(option => option.value === props.block.explanationApproach))

function move(direction: -1 | 1) {
  const target = props.index + direction
  if (target < 0 || target >= props.siblings.length) return
  const [block] = props.siblings.splice(props.index, 1)
  if (block) props.siblings.splice(target, 0, block)
}
function remove() {
  props.siblings.splice(props.index, 1)
}
function addChild() {
  if (!props.block.children) props.block.children = []
  props.block.children.push({
    id: 0,
    type: childType.value,
    title: '',
    content: '',
    explanationApproach: 'cif-falc',
    isActive: true,
    sortOrder: props.block.children.length + 1,
    children: [],
  })
}
</script>

<template>
  <article class="block-editor-card" :class="[`is-${block.type}`, { 'is-inactive': !block.isActive }]">
    <header class="block-editor-card__toolbar">
      <span class="block-editor-card__handle" aria-hidden="true">⋮⋮</span>
      <select v-model="block.type" aria-label="Style du bloc">
        <option v-for="type in COACH_HELP_BLOCK_TYPES" :key="type" :value="type">{{ LABELS[type] }}</option>
      </select>
      <label><input v-model="block.isActive" type="checkbox"> Actif</label>
      <button type="button" :disabled="index === 0" aria-label="Monter ce bloc" @click="move(-1)">↑</button>
      <button type="button" :disabled="index === siblings.length - 1" aria-label="Descendre ce bloc" @click="move(1)">↓</button>
      <button type="button" class="is-delete" aria-label="Supprimer ce bloc" @click="remove">×</button>
    </header>
    <div class="block-editor-card__fields">
      <label class="admin-field"><span>{{ isContextualBaseBlock || isReferenceFormBlock || isDefinitionBlock ? 'Titre automatique' : 'Titre (facultatif)' }}</span><input v-model="block.title" maxlength="160" :disabled="isContextualBaseBlock || isReferenceFormBlock || isDefinitionBlock"></label>
      <label v-if="usesPedagogicalApproach" class="admin-field block-editor-card__approach"><span>Approche pédagogique du contenu automatique</span><select v-model="block.explanationApproach"><option v-for="option in COACH_EXPLANATION_APPROACH_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option></select><small v-if="selectedApproach">{{ selectedApproach.objective }} {{ selectedApproach.length }} {{ selectedApproach.vocabulary }}</small></label>
      <AdminHtmlSourceEditor v-model="block.content" :rows="4" :maxlength="20000" />
    </div>
    <div class="block-editor-card__children">
      <div v-if="block.children?.length" class="block-editor-card__children-list">
        <CoachHelpBlockEditor
          v-for="(child, childIndex) in block.children"
          :key="`${child.id}-${childIndex}`"
          :block="child"
          :siblings="block.children"
          :index="childIndex"
          :depth="(depth || 0) + 1"
        />
      </div>
      <div class="block-editor-card__add-child">
        <span>Sous-bloc</span>
        <select v-model="childType"><option v-for="type in COACH_HELP_BLOCK_TYPES" :key="type" :value="type">{{ LABELS[type] }}</option></select>
        <button class="admin-button admin-button--small" type="button" @click="addChild">+ Ajouter</button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.block-editor-card{overflow:hidden;border:1px solid #cbdadd;border-left:5px solid #87aeb6;border-radius:12px;background:white;box-shadow:0 4px 14px rgb(37 75 78 / 5%)}.block-editor-card.is-warning{border-left-color:#dda511}.block-editor-card.is-danger{border-color:#d18a5d;border-left-color:#c86c32}.block-editor-card.is-header{border-left-color:#267f8d}.block-editor-card.is-inactive{opacity:.6;background:#f1f4f5}.block-editor-card__toolbar{display:flex;padding:8px 10px;align-items:center;gap:7px;border-bottom:1px solid var(--admin-border);background:#f6f9fa}.block-editor-card__toolbar select{padding:6px;border:1px solid var(--admin-border);border-radius:7px;background:white;font-weight:800}.block-editor-card__toolbar label{display:flex;margin-left:auto;align-items:center;gap:5px;font-size:.75rem;font-weight:800}.block-editor-card__toolbar button{display:grid;width:28px;height:28px;place-items:center;border:1px solid var(--admin-border);border-radius:7px;background:white;cursor:pointer}.block-editor-card__toolbar button:disabled{opacity:.35}.block-editor-card__toolbar button.is-delete{color:#9c342f;background:#f7e4e2}.block-editor-card__handle{color:#7c8e94;font-size:1.15rem;letter-spacing:-.2em}.block-editor-card__fields{display:grid;padding:12px;gap:10px}.block-editor-card__children{display:grid;padding:0 12px 12px;gap:9px}.block-editor-card__children-list{display:grid;margin-left:15px;padding-left:12px;gap:9px;border-left:2px solid #cbdadd}.block-editor-card__add-child{display:flex;align-items:center;justify-content:flex-end;gap:7px;color:var(--admin-muted);font-size:.75rem;font-weight:800}.block-editor-card__add-child select{padding:6px;border:1px solid var(--admin-border);border-radius:7px;background:white}@media(max-width:650px){.block-editor-card__toolbar{flex-wrap:wrap}.block-editor-card__toolbar label{margin-left:0}.block-editor-card__add-child{align-items:stretch;flex-direction:column}}
:global(:root[data-theme='dark'] .block-editor-card){color:#d3e2e6;border-color:#465e67;border-left-color:#6d9ca8;background:#1b2d32;box-shadow:0 6px 18px rgb(0 0 0 / 18%)}:global(:root[data-theme='dark'] .block-editor-card.is-warning){border-color:#5e5740;border-left-color:#b88b24}:global(:root[data-theme='dark'] .block-editor-card.is-danger){border-color:#86523a;border-left-color:#c46d3e}:global(:root[data-theme='dark'] .block-editor-card.is-inactive){background:#19282d}:global(:root[data-theme='dark'] .block-editor-card__toolbar){color:#cbdcdf;border-color:#465e67;background:#22363d}:global(:root[data-theme='dark'] .block-editor-card__toolbar select),:global(:root[data-theme='dark'] .block-editor-card__toolbar button),:global(:root[data-theme='dark'] .block-editor-card__add-child select){color:#d7e5e8;border-color:#536c75;background:#17282d}:global(:root[data-theme='dark'] .block-editor-card__toolbar button:hover:not(:disabled)){border-color:#72a6b4;background:#293f46}:global(:root[data-theme='dark'] .block-editor-card__toolbar button.is-delete){color:#efaaa3;border-color:#79504c;background:#3b2828}:global(:root[data-theme='dark'] .block-editor-card__handle){color:#91aab1}:global(:root[data-theme='dark'] .block-editor-card__children-list){border-color:#49626b}:global(:root[data-theme='dark'] .block-editor-card__add-child){color:#acbec4}
.block-editor-card.is-info{border-color:#b9dbea;border-left-color:#2d8fb7;background:#f3f9fc}.block-editor-card.is-success{border-color:#bddfce;border-left-color:#3b9877;background:#f3faf7}
:global(:root[data-theme='dark'] .block-editor-card.is-info){border-color:#315f70;border-left-color:#58a9c8;background:#1b333c}:global(:root[data-theme='dark'] .block-editor-card.is-success){border-color:#376354;border-left-color:#5db28f;background:#1b352e}
</style>
