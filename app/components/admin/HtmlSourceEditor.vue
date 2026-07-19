<script setup lang="ts">
import { formatCoachHtmlSource } from '~~/shared/utils/html-source-format'

const props = withDefaults(defineProps<{
  label?: string
  rows?: number
  maxlength?: number
}>(), {
  label: 'Description — HTML autorisé',
  rows: 6,
  maxlength: 20000,
})

const model = defineModel<string>({ required: true })
const textarea = useTemplateRef<HTMLTextAreaElement>('textarea')
const highlightedCode = useTemplateRef<HTMLElement>('highlighted-code')
const activeTags = ref(new Set<string>())

interface Tool {
  tag: string
  icon: string
  label: string
  kind?: 'pair' | 'list' | 'void'
}

const tools: Tool[] = [
  { tag: 'p', icon: '¶', label: 'Paragraphe' },
  { tag: 'strong', icon: 'B', label: 'Gras' },
  { tag: 'em', icon: 'I', label: 'Italique' },
  { tag: 'mark', icon: '▰', label: 'Surligné' },
  { tag: 'ul', icon: '•', label: 'Liste à puces', kind: 'list' },
  { tag: 'ol', icon: '1.', label: 'Liste numérotée', kind: 'list' },
  { tag: 'li', icon: '—', label: 'Élément de liste' },
  { tag: 'blockquote', icon: '❝', label: 'Citation' },
  { tag: 'code', icon: '</>', label: 'Code' },
  { tag: 'small', icon: 'A−', label: 'Petit texte' },
  { tag: 'sub', icon: 'X₂', label: 'Indice' },
  { tag: 'sup', icon: 'X²', label: 'Exposant' },
  { tag: 'br', icon: '↵', label: 'Saut de ligne', kind: 'void' },
]

const highlightedHtml = computed(() => {
  const escape = (value: string) => value.replace(/&/gu, '&amp;').replace(/</gu, '&lt;').replace(/>/gu, '&gt;')
  const tokens = model.value.split(/(<[^>]*>|\{[a-zA-Z_][a-zA-Z0-9_]*\}|&[a-zA-Z0-9#]+;)/gu)
  return `${tokens.map((token) => {
    const safe = escape(token)
    if (/^<[^>]*>$/u.test(token)) return `<span class="html-token html-token--tag">${safe}</span>`
    if (/^\{[^}]+\}$/u.test(token)) return `<span class="html-token html-token--variable">${safe}</span>`
    if (/^&[^;]+;$/u.test(token)) return `<span class="html-token html-token--entity">${safe}</span>`
    return safe
  }).join('')}\n`
})

function replaceSelection(replacement: string, selectionStart: number, selectionEnd: number) {
  const control = textarea.value
  if (!control) return
  const start = control.selectionStart
  const end = control.selectionEnd
  model.value = `${model.value.slice(0, start)}${replacement}${model.value.slice(end)}`
  void nextTick(() => {
    control.focus()
    control.setSelectionRange(start + selectionStart, start + selectionEnd)
    updateActiveTags()
  })
}

function applyTool(tool: Tool) {
  const control = textarea.value
  if (!control) return
  const start = control.selectionStart
  const end = control.selectionEnd
  const selected = model.value.slice(start, end)
  if (tool.kind === 'void') {
    replaceSelection(`<${tool.tag}>`, tool.tag.length + 2, tool.tag.length + 2)
    return
  }
  if (tool.kind === 'list') {
    if (!selected) {
      const opening = `<${tool.tag}>\n  <li>`
      const replacement = `${opening}</li>\n</${tool.tag}>`
      replaceSelection(replacement, opening.length, opening.length)
      return
    }
    const items = selected.split(/\r?\n/u).map(line => `  <li>${line}</li>`).join('\n')
    const replacement = `<${tool.tag}>\n${items}\n</${tool.tag}>`
    replaceSelection(replacement, 0, replacement.length)
    return
  }
  const opening = `<${tool.tag}>`
  const replacement = `${opening}${selected}</${tool.tag}>`
  replaceSelection(replacement, opening.length, opening.length + selected.length)
}

function updateActiveTags() {
  const control = textarea.value
  if (!control) return
  const stack: string[] = []
  const sourceBeforeCaret = model.value.slice(0, control.selectionStart)
  for (const match of sourceBeforeCaret.matchAll(/<\s*(\/?)\s*([a-z][a-z0-9-]*)\b[^>]*>/giu)) {
    const closing = Boolean(match[1])
    const tag = (match[2] || '').toLowerCase()
    if (!tag || tag === 'br') continue
    if (!closing) stack.push(tag)
    else {
      const index = stack.lastIndexOf(tag)
      if (index >= 0) stack.splice(index)
    }
  }
  activeTags.value = new Set(stack)
}

function syncScroll() {
  if (!textarea.value || !highlightedCode.value) return
  highlightedCode.value.scrollTop = textarea.value.scrollTop
  highlightedCode.value.scrollLeft = textarea.value.scrollLeft
}

function formatSource(keepFocus = true) {
  const formatted = formatCoachHtmlSource(model.value)
  if (formatted === model.value) return
  const control = textarea.value
  const caret = control?.selectionStart || formatted.length
  model.value = formatted
  void nextTick(() => {
    if (!control) return
    const nextCaret = Math.min(caret, formatted.length)
    if (keepFocus) control.focus()
    control.setSelectionRange(nextCaret, nextCaret)
    updateActiveTags()
    syncScroll()
  })
}

function formatAfterPaste() {
  window.setTimeout(() => formatSource(), 0)
}

onMounted(() => formatSource(false))
</script>

<template>
  <div class="html-source-field">
    <span class="html-source-field__label">{{ props.label }}</span>
    <div class="html-source-toolbar" role="toolbar" :aria-label="`Mise en forme de ${props.label}`">
      <button
        v-for="tool in tools"
        :key="tool.tag"
        type="button"
        :class="{ selected: activeTags.has(tool.tag) }"
        :title="`${tool.label} <${tool.tag}>`"
        :aria-label="`${tool.label}, balise ${tool.tag}`"
        :aria-pressed="tool.kind === 'void' ? undefined : activeTags.has(tool.tag)"
        @mousedown.prevent
        @click="applyTool(tool)"
      ><span aria-hidden="true">{{ tool.icon }}</span></button>
      <button class="html-source-toolbar__format" type="button" title="Indenter le HTML" aria-label="Indenter automatiquement le HTML" @mousedown.prevent @click="formatSource()"><span aria-hidden="true">{ }</span></button>
    </div>
    <div class="html-source-editor">
      <pre ref="highlighted-code" class="html-source-editor__highlight" aria-hidden="true" v-html="highlightedHtml" />
      <textarea
        ref="textarea"
        v-model="model"
        :rows="props.rows"
        :maxlength="props.maxlength"
        spellcheck="false"
        autocapitalize="off"
        autocomplete="off"
        @click="updateActiveTags"
        @keyup="updateActiveTags"
        @select="updateActiveTags"
        @input="updateActiveTags"
        @blur="formatSource(false)"
        @paste="formatAfterPaste"
        @scroll="syncScroll"
      />
    </div>
  </div>
</template>

<style scoped>
.html-source-field{display:grid;gap:0}.html-source-field__label{margin-bottom:5px;font-size:.76rem;font-weight:800}.html-source-toolbar{display:flex;padding:6px;gap:4px;overflow-x:auto;border:1px solid var(--admin-border);border-bottom:0;border-radius:8px 8px 0 0;background:#edf3f5}.html-source-toolbar button{display:grid;min-width:31px;height:29px;padding:0 6px;place-items:center;border:1px solid transparent;border-radius:5px;color:#234b59;background:transparent;cursor:pointer;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:.78rem;font-weight:900}.html-source-toolbar button:hover{border-color:#a9c7ce;background:white}.html-source-toolbar button.selected{color:white;border-color:#176b87;background:#176b87;box-shadow:0 0 0 2px rgb(23 107 135 / 16%)}.html-source-toolbar .html-source-toolbar__format{margin-left:auto;border-left-color:#b8cdd2;border-radius:0 5px 5px 0}.html-source-editor{position:relative;min-height:140px;border:1px solid var(--admin-border);border-radius:0 0 8px 8px;background:#17262e;overflow:hidden}.html-source-editor__highlight,.html-source-editor textarea{width:100%;min-height:140px;margin:0;padding:11px 12px;border:0;font:500 .82rem/1.55 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace;letter-spacing:0;tab-size:2;white-space:pre-wrap;overflow-wrap:break-word}.html-source-editor__highlight{position:absolute;z-index:0;inset:0;color:#d7e4e8;background:transparent;pointer-events:none;overflow:auto}.html-source-editor textarea{position:relative;z-index:1;display:block;resize:vertical;color:transparent;caret-color:#fff;background:transparent;-webkit-text-fill-color:transparent}.html-source-editor textarea::selection{background:rgb(66 153 187 / 58%);-webkit-text-fill-color:transparent}.html-source-editor textarea:focus{outline:2px solid #58a8bd;outline-offset:-2px}.html-source-editor__highlight :deep(.html-token--tag){color:#ff9d76}.html-source-editor__highlight :deep(.html-token--variable){color:#75d5ff;font-weight:750}.html-source-editor__highlight :deep(.html-token--entity){color:#e8c76d}:global(:root[data-theme='dark'] .html-source-field__label){color:#c7d9dd}:global(:root[data-theme='dark'] .html-source-toolbar){border-color:#48616a;background:#21363d}:global(:root[data-theme='dark'] .html-source-toolbar button){color:#d4e3e6}:global(:root[data-theme='dark'] .html-source-toolbar button:hover){border-color:#638b97;background:#2a434b}:global(:root[data-theme='dark'] .html-source-toolbar button.selected){color:#f6fbfc;border-color:#66b3c7;background:#2e788d;box-shadow:0 0 0 2px rgb(102 179 199 / 14%)}:global(:root[data-theme='dark'] .html-source-toolbar .html-source-toolbar__format){border-left-color:#54717a}:global(:root[data-theme='dark'] .html-source-editor){border-color:#48616a;background:#122126}:global(:root[data-theme='dark'] .html-source-editor textarea){color:transparent!important;background-color:transparent!important;-webkit-text-fill-color:transparent!important}:global(:root[data-theme='dark'] .html-source-editor__highlight){color:#e1eaed}:global(:root[data-theme='dark'] .html-source-editor__highlight .html-token--tag){color:#e99a7d}:global(:root[data-theme='dark'] .html-source-editor__highlight .html-token--variable){color:#72c4dc;font-weight:750}:global(:root[data-theme='dark'] .html-source-editor__highlight .html-token--entity){color:#d2b86f}
</style>
