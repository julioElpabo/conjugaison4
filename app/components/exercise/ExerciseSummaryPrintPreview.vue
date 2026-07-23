<script setup lang="ts">
const { ui, uiLabel, interfaceLocale } = useLanguagePreferences()
interface SummaryItem {
  index: number
  status: 'correct' | 'incorrect'
  questionLabel: string
  learnerAnswer: string
  expectedAnswer: string
}

interface SummaryTense {
  name: string
  mode?: string
}

const props = defineProps<{
  items: SummaryItem[]
  score: number
  correctCount: number
  verbs: string[]
  tenses: SummaryTense[]
}>()

const emit = defineEmits<{ close: [] }>()
const { track } = useSiteAnalytics()
const dialog = useTemplateRef<HTMLElement>('summary-print-dialog')
const pdfPreviewUrl = ref('')
const previewError = ref('')
const isPreviewBusy = ref(true)
const isFrameReady = ref(false)
const isPdfBusy = ref(false)
let previewGeneration = 0

useDialogFocus(dialog, () => emit('close'))

const formattedDate = computed(() => new Intl.DateTimeFormat(`${interfaceLocale.value}-CH`, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date()).replace(',', ''))

function pdfSafe(value: unknown) {
  return String(value ?? '')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/–|—/g, '-')
}

function pdfFileName() {
  const date = new Date().toISOString().slice(0, 10)
  return `bilan-du-defi-${date}.pdf`
}

function groupedTenses() {
  const groups = new Map<string, string[]>()
  for (const tense of props.tenses) {
    const mode = tense.mode?.trim() || 'Autres'
    const names = groups.get(mode) || []
    if (!names.includes(tense.name)) names.push(tense.name)
    groups.set(mode, names)
  }
  const order = ['indicatif', 'conditionnel', 'subjonctif', 'impératif', 'infinitif', 'participe', 'gérondif']
  return [...groups.entries()]
    .sort(([left], [right]) => {
      const leftIndex = order.indexOf(left.toLocaleLowerCase('fr'))
      const rightIndex = order.indexOf(right.toLocaleLowerCase('fr'))
      return (leftIndex < 0 ? order.length : leftIndex) - (rightIndex < 0 ? order.length : rightIndex)
        || left.localeCompare(right, 'fr')
    })
    .map(([mode, names]) => [uiLabel(mode), names.map(uiLabel)] as const)
}

async function buildPdf() {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
  const pageWidth = 210
  const pageHeight = 297
  const left = 15
  const right = 195
  const contentWidth = right - left
  const footerLimit = 282
  const questionX = 24
  const questionWidth = 72
  const learnerX = 100
  const learnerWidth = 39
  const expectedX = 143
  const expectedWidth = 47
  let y = 0

  function drawIdentityAndTitle() {
    pdf.setTextColor(35, 35, 35)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8.5)
    pdf.text(`${ui('Prénom')} : ..................................................`, left, 14)
    pdf.text(`${ui('Nom')} : ..................................................`, 78, 14)
    pdf.text(pdfSafe(formattedDate.value), right, 14, { align: 'right' })
    pdf.setDrawColor(165, 165, 165)
    pdf.setLineWidth(.25)
    pdf.line(left, 19, right, 19)

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(18)
    pdf.setTextColor(20, 62, 78)
    pdf.text(ui('BILAN DU DÉFI'), pageWidth / 2, 29, { align: 'center' })
    pdf.setFontSize(9)
    pdf.setTextColor(65, 65, 65)
    pdf.text(`${props.correctCount} / ${props.items.length} réponses justes  ·  ${props.score} %`, pageWidth / 2, 36, { align: 'center' })

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(6.4)
    pdf.setTextColor(80, 80, 80)
    const verbLines = pdf.splitTextToSize(pdfSafe(`Verbes : ${props.verbs.join(', ')}`), contentWidth) as string[]
    pdf.text(verbLines, left, 42, { baseline: 'top' })
    let tenseY = 42 + verbLines.length * 3
    for (const [mode, names] of groupedTenses()) {
      pdf.setFont('helvetica', 'bold')
      const modeLabel = pdfSafe(`${mode} :`)
      pdf.text(modeLabel, left, tenseY, { baseline: 'top' })
      const labelWidth = pdf.getTextWidth(modeLabel) + 1.5
      pdf.setFont('helvetica', 'normal')
      const tenseLines = pdf.splitTextToSize(pdfSafe(names.join(', ')), contentWidth - labelWidth) as string[]
      pdf.text(tenseLines, left + labelWidth, tenseY, { baseline: 'top' })
      tenseY += Math.max(1, tenseLines.length) * 3
    }
    y = tenseY + 2
    pdf.setDrawColor(55, 105, 120)
    pdf.setLineWidth(.35)
    pdf.line(left, y, right, y)
    y += 4
    drawTableHeader()
  }

  function drawContinuationHeader() {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.setTextColor(20, 62, 78)
    pdf.text(ui('BILAN DU DÉFI — SUITE'), left, 16)
    pdf.setDrawColor(165, 165, 165)
    pdf.setLineWidth(.25)
    pdf.line(left, 20, right, 20)
    y = 25
    drawTableHeader()
  }

  function addPage() {
    pdf.addPage('a4', 'portrait')
    drawContinuationHeader()
  }

  function drawStatusIcon(item: SummaryItem, centerX: number, centerY: number) {
    const correct = item.status === 'correct'
    const color: [number, number, number] = correct ? [42, 139, 88] : [202, 72, 65]
    pdf.setDrawColor(...color)
    pdf.setLineWidth(.45)
    pdf.circle(centerX, centerY, 2, 'S')
    if (correct) {
      pdf.line(centerX - 1, centerY, centerX - .25, centerY + .75)
      pdf.line(centerX - .25, centerY + .75, centerX + 1.15, centerY - .9)
    } else {
      pdf.line(centerX - .85, centerY - .85, centerX + .85, centerY + .85)
      pdf.line(centerX + .85, centerY - .85, centerX - .85, centerY + .85)
    }
  }

  function drawTableHeader() {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(6.7)
    pdf.setTextColor(95, 103, 106)
    pdf.text('QUESTION', questionX, y)
    pdf.text(ui('RÉPONSE DONNÉE'), learnerX, y)
    pdf.text(ui('BONNE RÉPONSE'), expectedX, y)
    pdf.setDrawColor(155, 165, 168)
    pdf.setLineWidth(.3)
    pdf.line(left, y + 2.5, right, y + 2.5)
    y += 5
  }

  function fitCell(value: string, width: number, fontStyle: 'normal' | 'bold') {
    const text = pdfSafe(value || '—')
    for (let size = 8.2; size >= 6.2; size -= .4) {
      pdf.setFont('helvetica', fontStyle)
      pdf.setFontSize(size)
      const lines = pdf.splitTextToSize(text, width) as string[]
      if (lines.length <= 2) return { lines, size }
    }
    pdf.setFont('helvetica', fontStyle)
    pdf.setFontSize(6.2)
    const lines = pdf.splitTextToSize(text, width) as string[]
    const compact = [lines[0] || '']
    let last = lines.slice(1).join(' ')
    while (last.length > 1 && pdf.getTextWidth(`${last}…`) > width) last = last.slice(0, -1)
    compact.push(`${last.trimEnd()}…`)
    return { lines: compact, size: 6.2 }
  }

  function drawQuestion(item: SummaryItem) {
    const question = fitCell(`${item.index}. ${item.questionLabel}`, questionWidth, 'bold')
    const learner = fitCell(item.learnerAnswer || '—', learnerWidth, 'normal')
    const expected = fitCell(item.expectedAnswer || '—', expectedWidth, 'bold')
    const lineCount = Math.max(question.lines.length, learner.lines.length, expected.lines.length)
    const rowHeight = lineCount > 1 ? 12 : 8.5

    if (y + rowHeight > footerLimit) addPage()

    drawStatusIcon(item, left + 4.2, y + rowHeight / 2 - .3)
    pdf.setTextColor(30, 55, 64)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(question.size)
    pdf.text(question.lines, questionX, y + 2, { baseline: 'top', lineHeightFactor: 1.15 })
    pdf.setTextColor(45, 45, 45)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(learner.size)
    pdf.text(learner.lines, learnerX, y + 2, { baseline: 'top', lineHeightFactor: 1.15 })
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(expected.size)
    pdf.text(expected.lines, expectedX, y + 2, { baseline: 'top', lineHeightFactor: 1.15 })
    pdf.setDrawColor(216, 220, 221)
    pdf.setLineWidth(.18)
    pdf.line(left, y + rowHeight, right, y + rowHeight)
    y += rowHeight
  }

  drawIdentityAndTitle()
  for (const item of props.items) drawQuestion(item)

  const totalPages = pdf.getNumberOfPages()
  for (let page = 1; page <= totalPages; page += 1) {
    pdf.setPage(page)
    pdf.setDrawColor(205, 205, 205)
    pdf.setLineWidth(.2)
    pdf.line(left, pageHeight - 13, right, pageHeight - 13)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7.5)
    pdf.setTextColor(110, 110, 110)
    pdf.text(`TATITOTU · ${ui('Exercices de conjugaison française')}`, left, pageHeight - 8)
    pdf.text('tatitotu.ch', pageWidth / 2, pageHeight - 8, { align: 'center' })
    pdf.text(`${page} / ${totalPages}`, right, pageHeight - 8, { align: 'right' })
  }
  return pdf
}

function revokePreviewUrl() {
  if (!pdfPreviewUrl.value) return
  URL.revokeObjectURL(pdfPreviewUrl.value)
  pdfPreviewUrl.value = ''
}

async function refreshPreview() {
  const generation = ++previewGeneration
  isPreviewBusy.value = true
  isFrameReady.value = false
  previewError.value = ''
  try {
    const pdf = await buildPdf()
    const blob = pdf.output('blob')
    if (generation !== previewGeneration) return
    revokePreviewUrl()
    pdfPreviewUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    if (generation !== previewGeneration) return
    console.error(ui('Impossible de générer le bilan PDF.'), error)
    previewError.value = ui('L’aperçu du bilan n’a pas pu être créé.')
  } finally {
    if (generation === previewGeneration) isPreviewBusy.value = false
  }
}

async function downloadPdf() {
  if (isPdfBusy.value) return
  isPdfBusy.value = true
  try {
    const pdf = await buildPdf()
    pdf.save(pdfFileName())
    track('pdf_downloaded', { presentation: 'chat' })
  } finally {
    isPdfBusy.value = false
  }
}

onMounted(refreshPreview)

onBeforeUnmount(() => {
  previewGeneration += 1
  revokePreviewUrl()
})
</script>

<template>
  <Teleport to="body">
    <div ref="summary-print-dialog" class="summary-print-overlay" role="dialog" aria-modal="true" aria-labelledby="summary-print-title">
      <section class="summary-print-modal">
        <header class="summary-print-toolbar">
          <h2 id="summary-print-title">{{ ui('Aperçu du bilan') }}</h2>
          <div>
            <button type="button" class="secondary-button" @click="emit('close')">{{ ui('Fermer') }}</button>
            <button type="button" class="primary-button" :disabled="isPdfBusy" @click="downloadPdf">
              {{ isPdfBusy ? 'Création…' : 'PDF' }}
            </button>
          </div>
        </header>

        <main class="summary-print-preview">
          <iframe
            v-if="pdfPreviewUrl"
            :src="`${pdfPreviewUrl}#view=FitH&toolbar=0&navpanes=0`"
            :title="ui('Aperçu du bilan au format PDF')"
            @load="isFrameReady = true"
          />
          <div v-if="!previewError && (isPreviewBusy || !isFrameReady)" class="summary-print-state" role="status" aria-live="polite">
            <span aria-hidden="true" />
            <strong>{{ ui('Création de l’aperçu PDF…') }}</strong>
          </div>
          <div v-if="previewError" class="summary-print-state summary-print-state--error" role="alert">
            <strong>{{ previewError }}</strong>
            <button type="button" class="secondary-button" @click="refreshPreview">{{ ui('Réessayer') }}</button>
          </div>
        </main>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.summary-print-overlay{position:fixed;z-index:2200;inset:0;display:grid;padding:24px;place-items:center;background:rgb(14 32 40 / 78%);backdrop-filter:blur(6px)}
.summary-print-modal{display:grid;width:min(1050px,100%);height:min(900px,calc(100vh - 48px));grid-template-rows:auto minmax(0,1fr);overflow:hidden;border:1px solid #c5d7dc;border-radius:22px;background:#eaf2f4;box-shadow:0 30px 90px rgb(5 19 25 / 42%)}
.summary-print-toolbar{display:flex;padding:14px 18px;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid #c5d7dc;background:white}
.summary-print-toolbar h2{margin:0;color:#173f55;font-size:1.2rem}
.summary-print-toolbar>div{display:flex;gap:9px}
.summary-print-toolbar button{min-width:92px}
.summary-print-preview{position:relative;display:grid;min-height:0;padding:18px;place-items:stretch}
.summary-print-preview iframe{width:100%;height:100%;border:1px solid #bdcdd1;border-radius:12px;background:#747b7d}
.summary-print-state{position:absolute;inset:18px;display:grid;place-content:center;justify-items:center;gap:12px;color:#315b68;background:#edf5f6;border-radius:12px}
.summary-print-state>span{width:34px;height:34px;border:4px solid #cbdfe4;border-top-color:#176b87;border-radius:50%;animation:summary-print-spin .7s linear infinite}
.summary-print-state--error{color:#8f3934}
:global(:root[data-theme='dark']) .summary-print-modal{border-color:#496268;background:#13262b}
:global(:root[data-theme='dark']) .summary-print-toolbar{border-bottom-color:#496268;background:#1c3237}
:global(:root[data-theme='dark']) .summary-print-toolbar h2{color:#dcecef}
:global(:root[data-theme='dark']) .summary-print-state{color:#cde3e7;background:#172d32}
@keyframes summary-print-spin{to{transform:rotate(360deg)}}
@media(max-width:650px){.summary-print-overlay{padding:0}.summary-print-modal{width:100%;height:100dvh;border:0;border-radius:0}.summary-print-toolbar{align-items:flex-start;flex-direction:column}.summary-print-toolbar>div{width:100%}.summary-print-toolbar button{flex:1}.summary-print-preview{padding:10px}.summary-print-state{inset:10px}}
@media(prefers-reduced-motion:reduce){.summary-print-state>span{animation:none}}
</style>
