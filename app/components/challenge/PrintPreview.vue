<script setup lang="ts">
const { ui, uiLabel } = useLanguagePreferences()
import type { ExerciseQuestion } from '~~/shared/types/conjugation'
import type { ExerciseKind, PrintOptions, Tense, Verb } from '~/composables/useChallengeBuilder'
import { TENSE_IDENTIFICATION_INSTRUCTION } from '~~/shared/utils/exercise-instructions'
import {
  correctionItemHeight,
  exerciseItemHeight,
  paginateByHeight,
} from '~~/shared/utils/print-pagination'
import {
  printableCorrectionAnswers,
  printableCorrectionLabel,
  printableCorrectionText,
  printableQuestion,
  printableQuestionParts,
} from '~~/shared/utils/print-question'

const props = defineProps<{
  questions: ExerciseQuestion[]
  verbs: Verb[]
  tenses: Tense[]
  exerciseKind: ExerciseKind
  options: PrintOptions
}>()

const emit = defineEmits<{
  close: []
  updateOptions: [value: PrintOptions]
}>()
const { track } = useSiteAnalytics()

const sheetNumber = Math.floor(Math.random() * 9000) + 1000
const dialog = useTemplateRef<HTMLElement>('print-dialog')
const isPdfBusy = ref(false)
const isWordBusy = ref(false)
const isPdfPreviewBusy = ref(true)
const isPdfPreviewFrameReady = ref(false)
const pdfPreviewUrl = ref('')
const pdfPreviewError = ref('')
let pdfPreviewGeneration = 0
let pdfPreviewTimer: ReturnType<typeof setTimeout> | undefined

function boundedOption(value: number | undefined, fallback: number, minimum: number, maximum: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : fallback
}

const questionSpacingMm = computed(() => boundedOption(props.options.questionSpacingMm, 8, 2, 15))
const titleSpacingMm = computed(() => boundedOption(props.options.titleSpacingMm, 30, 8, 30))

const exerciseFirstPageCapacity = computed(() => {
  // La zone utile commence après l'en-tête : 226 mm permet de conserver
  // vingt questions courtes sur la première page, même avec les métadonnées.
  let capacity = 226
  if (props.options.showFirstName || props.options.showLastName || props.options.showDate) {
    capacity -= Math.max(0, titleSpacingMm.value - 1)
  }
  if (props.options.showVerbs) capacity -= 8
  if (props.options.showTenses) capacity -= 8
  if (props.exerciseKind === 'tense-identification') capacity -= 13
  return capacity
})
const exercisePages = computed(() => paginateByHeight(
  props.questions,
  exerciseFirstPageCapacity.value,
  220,
  (question) => {
    const printable = printableQuestionParts(question, props.exerciseKind)
    return exerciseItemHeight(printableQuestion(question, props.exerciseKind), questionSpacingMm.value)
      + (printable.suffixOnNextLine ? 6 : 0)
  }
))
const correctionPages = computed(() => paginateByHeight(
  props.questions,
  205,
  220,
  question => correctionItemHeight(printableCorrectionLabel(question, props.exerciseKind), printableCorrectionText(question))
))

useDialogFocus(dialog, () => emit('close'))

function setPrintOption<K extends keyof PrintOptions>(key: K, value: PrintOptions[K]) {
  emit('updateOptions', {
    ...props.options,
    [key]: value
  })
}

function pdfSafe(value: unknown) {
  return String(value ?? '')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/–|—/g, '-')
}

function capitalizePrintLine(value: unknown) {
  return String(value ?? '').replace(
    /^(\s*)(\p{L})/u,
    (_match, spacing: string, letter: string) => `${spacing}${letter.toLocaleUpperCase('fr-CH')}`
  )
}

function capitalizePrintText(value: unknown) {
  return String(value ?? '')
    .split('\n')
    .map(capitalizePrintLine)
    .join('\n')
}

function pdfFileName() {
  const title = props.options.title || ui('Défi de conjugaison')
  const safeTitle = title.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${safeTitle || 'defi-conjugaison'}.pdf`
}

async function buildPdf() {
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
    const pageWidth = 210
    const pageHeight = 297
    const left = 17
    const right = 193
    const title = pdfSafe(props.options.title || ui('Défi de conjugaison'))
    const identifier = props.options.showRandomNumber ? ` n° ${sheetNumber}` : ''
    let pageCount = 0

    function addPage() {
      if (pageCount > 0) pdf.addPage('a4', 'portrait')
      pageCount += 1
    }

    function drawFooter() {
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      pdf.setTextColor(105, 105, 105)
      pdf.text('conjugaison.tatitotu.ch', pageWidth / 2, pageHeight - 8, { align: 'center' })
      pdf.setTextColor(20, 20, 20)
    }

    function drawExerciseHeader(continuation: boolean) {
      if (continuation) {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(8.5)
        pdf.setTextColor(90, 90, 90)
        pdf.text(`${title}${identifier}`, pageWidth / 2, 12, { align: 'center' })
        pdf.setTextColor(20, 20, 20)
        return 32
      }
      let y = 18
      const identity = [
        props.options.showFirstName ? `${ui('Prénom')} : ____________________` : '',
        props.options.showLastName ? `${ui('Nom')} : ____________________` : '',
        props.options.showDate ? `${ui('Date')} : ______________` : '',
      ].filter(Boolean)
      if (identity.length) {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(8.5)
        pdf.text(pdfSafe(identity.join('     ')), left, y)
        y += titleSpacingMm.value
      }
      if (props.options.showGrade) {
        pdf.setDrawColor(40, 40, 40)
        pdf.rect(right - 17, 15, 17, 17)
      }
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(17)
      const heading = `${title}${identifier}`
      const titleLines = pdf.splitTextToSize(heading.toUpperCase(), 150)
      pdf.text(titleLines, left, y + 8)
      y += titleLines.length * 7 + 10
      pdf.setFontSize(9)
      if (props.options.showVerbs) {
        const lines = pdf.splitTextToSize(`Verbes : ${pdfSafe(props.verbs.map(verb => verb.infinitif).join(', '))}`, 176)
        pdf.text(lines, left, y)
        y += lines.length * 4.5 + 2
      }
      if (props.options.showTenses) {
        const lines = pdf.splitTextToSize(`${ui('Temps :')} ${pdfSafe(props.tenses.map(tense => uiLabel(tense.name)).join(', '))}`, 176)
        pdf.text(lines, left, y)
        y += lines.length * 4.5 + 2
      }
      if (props.exerciseKind === 'tense-identification') {
        pdf.setDrawColor(120, 120, 120)
        pdf.rect(left, y, 176, 10)
        pdf.text(TENSE_IDENTIFICATION_INSTRUCTION, left + 3, y + 6)
        y += 15
      }
      return y + 2
    }

    function drawCorrectionHeader(continuation: boolean) {
      if (continuation) {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(8.5)
        pdf.setTextColor(90, 90, 90)
        pdf.text(`${title} - corrigé${identifier}`, pageWidth / 2, 12, { align: 'center' })
        pdf.setTextColor(20, 20, 20)
        return 32
      }
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(17)
      pdf.setTextColor(20, 20, 20)
      pdf.text(`${ui('CORRIGÉ')}${identifier}`, left, 26)
      return 38
    }

    function drawExercisePage(page: typeof exercisePages.value[number], continuation: boolean) {
      addPage()
      let y = drawExerciseHeader(continuation)
      pdf.setFontSize(10.5)
      page.forEach(({ item: question, index }) => {
        const prefix = `${index + 1}. `
        const printable = printableQuestionParts(question, props.exerciseKind)
        pdf.setFont('helvetica', 'normal')
        const labelLines = pdf.splitTextToSize(pdfSafe(capitalizePrintLine(printable.label)), 68)
        const completionWidth = printable.label ? 96 : 169
        const completionLines = printable.fillBlank
          ? [pdfSafe(capitalizePrintLine(printable.completion))]
          : pdf.splitTextToSize(pdfSafe(capitalizePrintLine(printable.completion)), completionWidth)
        const completionX = printable.label ? 96 : left + 7
        const before = pdfSafe(capitalizePrintLine(printable.completionPrefix))
        const after = pdfSafe(printable.completionSuffix)
        const lineStart = completionX + (before ? pdf.getTextWidth(before) + 2 : 0)
        const availableLineEnd = right - (!printable.suffixOnNextLine && after ? pdf.getTextWidth(after) + 2 : 0)
        const lineEnd = printable.suffixOnNextLine
          ? completionX + completionWidth * (printable.blankWidthPercent / 100)
          : availableLineEnd
        let firstSuffixLine = ''
        let remainingSuffixLines: string[] = []

        if (printable.suffixOnNextLine && after) {
          const suffixStart = lineEnd + 2
          const firstLineWidth = Math.max(0, right - suffixStart)
          const words = after.split(/\s+/u).filter(Boolean)
          const firstLineWords: string[] = []

          while (words.length) {
            const candidate = [...firstLineWords, words[0]].join(' ')
            if (firstLineWords.length && pdf.getTextWidth(candidate) > firstLineWidth) break
            if (!firstLineWords.length && pdf.getTextWidth(candidate) > firstLineWidth) break
            firstLineWords.push(words.shift()!)
          }

          firstSuffixLine = firstLineWords.join(' ')
          remainingSuffixLines = words.length
            ? pdf.splitTextToSize(words.join(' '), completionWidth)
            : []
        }

        const completionLineCount = printable.suffixOnNextLine
          ? 1 + remainingSuffixLines.length
          : completionLines.length
        const lineCount = Math.max(labelLines.length, completionLineCount)
        pdf.text(prefix, left, y)
        if (printable.label) pdf.text(labelLines, left + 7, y)
        if (printable.fillBlank) {
          if (before) pdf.text(before, completionX, y)
          if (after && !printable.suffixOnNextLine) pdf.text(after, right, y, { align: 'right' })
          if (lineEnd > lineStart) {
            pdf.setLineDashPattern([.7, .7], 0)
            pdf.setDrawColor(55, 55, 55)
            pdf.line(lineStart, y + .8, lineEnd, y + .8)
            pdf.setLineDashPattern([], 0)
          }
          if (printable.suffixOnNextLine) {
            if (firstSuffixLine) pdf.text(firstSuffixLine, lineEnd + 2, y)
            remainingSuffixLines.forEach((line: string, lineIndex: number) => {
              pdf.text(line, completionX, y + 5 + lineIndex * 5)
            })
          }
        } else {
          pdf.text(completionLines, completionX, y)
        }
        y += Math.max(5 + questionSpacingMm.value, lineCount * 5 + questionSpacingMm.value)
      })
      drawFooter()
    }

    function drawCorrectionPage(page: typeof correctionPages.value[number], continuation: boolean) {
      addPage()
      let y = drawCorrectionHeader(continuation)
      pdf.setFontSize(9.5)
      page.forEach(({ item: question, index }) => {
        const prompt = pdf.splitTextToSize(pdfSafe(capitalizePrintLine(printableCorrectionLabel(question, props.exerciseKind))), 79)
        const answer = printableCorrectionAnswers(question)
          .flatMap(value => pdf.splitTextToSize(pdfSafe(capitalizePrintText(value)), 82))
        const lineCount = Math.max(prompt.length, answer.length)
        const rowHeight = Math.max(8, lineCount * 5 + 3)
        const numberY = y + Math.max(0, (rowHeight - 5) / 2)
        const promptY = y + Math.max(0, (rowHeight - prompt.length * 5) / 2)
        const answerY = y + Math.max(0, (rowHeight - answer.length * 5) / 2)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`${index + 1}.`, left, numberY, { baseline: 'top' })
        pdf.text(prompt, left + 7, promptY, { baseline: 'top' })
        pdf.setFont('helvetica', 'bold')
        pdf.text(answer, 106, answerY, { baseline: 'top' })
        pdf.setDrawColor(220, 220, 220)
        pdf.line(left, y + rowHeight, right, y + rowHeight)
        y += rowHeight
      })
      drawFooter()
    }

    exercisePages.value.forEach((page, index) => drawExercisePage(page, index > 0))
    // Le premier corrigé commence toujours sur une nouvelle page PDF.
    correctionPages.value.forEach((page, index) => drawCorrectionPage(page, index > 0))

    return pdf
}

async function downloadPdf() {
  if (isPdfBusy.value) return
  isPdfBusy.value = true
  try {
    const pdf = await buildPdf()
    pdf.save(pdfFileName())
    track('pdf_downloaded', { exerciseKind: props.exerciseKind })
  } finally {
    isPdfBusy.value = false
  }
}

function revokePdfPreviewUrl() {
  if (!pdfPreviewUrl.value) return
  URL.revokeObjectURL(pdfPreviewUrl.value)
  pdfPreviewUrl.value = ''
}

async function refreshPdfPreview() {
  const generation = ++pdfPreviewGeneration
  isPdfPreviewBusy.value = true
  isPdfPreviewFrameReady.value = false
  pdfPreviewError.value = ''

  try {
    const pdf = await buildPdf()
    const blob = pdf.output('blob')
    if (generation !== pdfPreviewGeneration) return

    revokePdfPreviewUrl()
    pdfPreviewUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    if (generation !== pdfPreviewGeneration) return
    console.error(ui('Impossible de générer l’aperçu PDF.'), error)
    pdfPreviewError.value = ui('L’aperçu PDF n’a pas pu être créé.')
  } finally {
    if (generation === pdfPreviewGeneration) isPdfPreviewBusy.value = false
  }
}

function schedulePdfPreview() {
  if (pdfPreviewTimer) clearTimeout(pdfPreviewTimer)
  pdfPreviewTimer = setTimeout(() => {
    pdfPreviewTimer = undefined
    void refreshPdfPreview()
  }, 250)
}

watch(
  () => ({
    questions: props.questions,
    verbs: props.verbs,
    tenses: props.tenses,
    exerciseKind: props.exerciseKind,
    options: props.options,
  }),
  schedulePdfPreview,
  { deep: true }
)

onMounted(() => {
  void refreshPdfPreview()
})

onBeforeUnmount(() => {
  pdfPreviewGeneration += 1
  if (pdfPreviewTimer) clearTimeout(pdfPreviewTimer)
  revokePdfPreviewUrl()
})

async function downloadWord() {
  if (isWordBusy.value) return
  isWordBusy.value = true
  try {
    const {
      AlignmentType,
      BorderStyle,
      Document,
      Footer,
      Header,
      HeightRule,
      LeaderType,
      Packer,
      Paragraph,
      SectionType,
      Tab,
      TabStopType,
      Table,
      TableBorders,
      TableCell,
      TableLayoutType,
      TableRow,
      TextRun,
      VerticalAlign,
      WidthType,
    } = await import('docx')

    const title = props.options.title || ui('Défi de conjugaison')
    const identifier = props.options.showRandomNumber ? ` n° ${sheetNumber}` : ''
    const contentWidth = 9975
    const pageMargins = { top: 1020, right: 965, bottom: 850, left: 965, header: 360, footer: 360, gutter: 0 }
    const noSpacing = { before: 0, after: 0, line: 240 }
    const footer = new Footer({
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: noSpacing,
        children: [new TextRun({ text: 'conjugaison.tatitotu.ch', size: 16, color: '666666' })]
      })]
    })
    const runningHeader = (text: string) => new Header({
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: noSpacing,
        children: [new TextRun({ text, size: 17, color: '666666' })]
      })]
    })
    const emptyHeader = new Header({ children: [new Paragraph({ spacing: noSpacing })] })
    const paragraph = (text: string, options: { bold?: boolean, size?: number, alignment?: typeof AlignmentType[keyof typeof AlignmentType] } = {}) => new Paragraph({
      alignment: options.alignment,
      spacing: noSpacing,
      children: [new TextRun({ text, bold: options.bold, size: options.size ?? 21, font: 'Arial' })]
    })
    const completionParagraphs = (question: ExerciseQuestion) => {
      const printable = printableQuestionParts(question, props.exerciseKind)
      if (!printable.fillBlank) return [paragraph(capitalizePrintLine(printable.completion), { size: 21 })]

      const prefix = capitalizePrintLine(printable.completionPrefix)
      const suffix = printable.completionSuffix
      return [new Paragraph({
        spacing: noSpacing,
        tabStops: [{
          type: TabStopType.RIGHT,
          position: 5300,
          leader: LeaderType.DOT,
        }],
        children: [new TextRun({
          size: 21,
          font: 'Arial',
          children: [
            ...(prefix ? [prefix, ' '] : []),
            new Tab(),
            ...(suffix ? [` ${suffix}`] : []),
          ],
        })],
      })]
    }
    const cell = (children: InstanceType<typeof Paragraph>[], width: number, options: { borders?: Record<string, unknown>, margins?: Record<string, number> } = {}) => new TableCell({
      children,
      width: { size: width, type: WidthType.DXA },
      verticalAlign: VerticalAlign.CENTER,
      borders: options.borders,
      margins: options.margins ?? { top: 70, bottom: 70, left: 70, right: 70 }
    })
    const lightBottomBorder = {
      bottom: { style: BorderStyle.SINGLE, size: 2, color: 'D9D9D9' }
    }

    const identityCells: InstanceType<typeof TableCell>[] = []
    const identityValues = [
      props.options.showFirstName ? `${ui('Prénom')} : ____________________` : '',
      props.options.showLastName ? `${ui('Nom')} : ____________________` : '',
      props.options.showDate ? `${ui('Date')} : ______________` : '',
    ].filter(Boolean)
    const gradeWidth = props.options.showGrade ? 965 : 0
    const identityWidth = identityValues.length > 0 ? Math.floor((contentWidth - gradeWidth) / identityValues.length) : contentWidth - gradeWidth
    identityValues.forEach(value => identityCells.push(cell([paragraph(value, { size: 18 })], identityWidth)))
    if (identityValues.length === 0 && props.options.showGrade) {
      identityCells.push(cell([paragraph('')], contentWidth - gradeWidth))
    }
    if (props.options.showGrade) {
      const boxBorder = { style: BorderStyle.SINGLE, size: 8, color: '333333' }
      identityCells.push(cell([paragraph('')], gradeWidth, {
        borders: { top: boxBorder, bottom: boxBorder, left: boxBorder, right: boxBorder },
        margins: { top: 0, bottom: 0, left: 0, right: 0 }
      }))
    }

    const exerciseChildren: Array<InstanceType<typeof Paragraph> | InstanceType<typeof Table>> = []
    if (identityCells.length > 0) {
      exerciseChildren.push(new Table({
        width: { size: contentWidth, type: WidthType.DXA },
        columnWidths: identityCells.map(item => item.options.width?.size as number),
        layout: TableLayoutType.FIXED,
        borders: TableBorders.NONE,
        rows: [new TableRow({
          height: { value: 700, rule: HeightRule.ATLEAST },
          cantSplit: true,
          children: identityCells
        })]
      }))
    }
    exerciseChildren.push(new Paragraph({
      spacing: { before: Math.round(titleSpacingMm.value * 56.7), after: 260 },
      children: [
        new TextRun({ text: title.toUpperCase(), bold: true, size: 34, font: 'Arial' }),
        new TextRun({ text: identifier, size: 18, font: 'Arial' })
      ]
    }))
    if (props.options.showVerbs) exerciseChildren.push(paragraph(`Verbes : ${props.verbs.map(verb => verb.infinitif).join(', ')}`, { bold: true, size: 19 }))
    if (props.options.showTenses) exerciseChildren.push(paragraph(`${ui('Temps :')} ${props.tenses.map(tense => uiLabel(tense.name)).join(', ')}`, { bold: true, size: 19 }))
    if (props.exerciseKind === 'tense-identification') {
      exerciseChildren.push(new Paragraph({
        spacing: { before: 160, after: 160 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: '777777' }, bottom: { style: BorderStyle.SINGLE, size: 4, color: '777777' }, left: { style: BorderStyle.SINGLE, size: 4, color: '777777' }, right: { style: BorderStyle.SINGLE, size: 4, color: '777777' } },
        children: [new TextRun({ text: TENSE_IDENTIFICATION_INSTRUCTION, size: 19, font: 'Arial' })]
      }))
    }
    exerciseChildren.push(new Table({
      width: { size: contentWidth, type: WidthType.DXA },
      columnWidths: [480, 3900, 5595],
      layout: TableLayoutType.FIXED,
      borders: TableBorders.NONE,
      rows: props.questions.map((question, index) => {
        const printable = printableQuestionParts(question, props.exerciseKind)
        return new TableRow({
          cantSplit: true,
          height: { value: Math.round((5 + questionSpacingMm.value) * 56.7), rule: HeightRule.ATLEAST },
          children: [
            cell([paragraph(`${index + 1}.`, { size: 21 })], 480, { margins: { top: 70, bottom: 70, left: 0, right: 40 } }),
            cell([paragraph(capitalizePrintLine(printable.label), { size: 21 })], 3900),
            cell(completionParagraphs(question), 5595),
          ]
        })
      })
    }))

    const correctionChildren: Array<InstanceType<typeof Paragraph> | InstanceType<typeof Table>> = [
      new Paragraph({
        spacing: { before: 0, after: 260 },
        children: [
          new TextRun({ text: ui('CORRIGÉ'), bold: true, size: 34, font: 'Arial' }),
          new TextRun({ text: identifier, size: 18, font: 'Arial' })
        ]
      }),
      new Table({
        width: { size: contentWidth, type: WidthType.DXA },
        columnWidths: [480, 5100, 4395],
        layout: TableLayoutType.FIXED,
        borders: TableBorders.NONE,
        rows: props.questions.map((question, index) => {
          return new TableRow({
            cantSplit: true,
            height: { value: 460, rule: HeightRule.ATLEAST },
            children: [
              cell([paragraph(`${index + 1}.`, { size: 19 })], 480, { borders: lightBottomBorder, margins: { top: 55, bottom: 55, left: 0, right: 40 } }),
              cell([paragraph(capitalizePrintLine(printableCorrectionLabel(question, props.exerciseKind)), { size: 19 })], 5100, { borders: lightBottomBorder, margins: { top: 55, bottom: 55, left: 70, right: 70 } }),
              cell(printableCorrectionAnswers(question).map(answer => paragraph(capitalizePrintText(answer), { bold: true, size: 19 })), 4395, { borders: lightBottomBorder, margins: { top: 55, bottom: 55, left: 70, right: 70 } })
            ]
          })
        })
      })
    ]

    const wordDocument = new Document({
      styles: {
        default: {
          document: { run: { font: 'Arial', size: 21 }, paragraph: { spacing: noSpacing } }
        }
      },
      sections: [
        {
          properties: { page: { margin: pageMargins }, titlePage: true },
          headers: { first: emptyHeader, default: runningHeader(`${title}${identifier}`) },
          footers: { first: footer, default: footer },
          children: exerciseChildren
        },
        {
          properties: { page: { margin: pageMargins }, type: SectionType.NEXT_PAGE },
          headers: { default: runningHeader(`${title} — corrigé${identifier}`) },
          footers: { default: footer },
          children: correctionChildren
        }
      ]
    })

    const blob = await Packer.toBlob(wordDocument)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const safeTitle = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '')
    link.href = url
    link.download = `${safeTitle || 'defi-conjugaison'}.docx`
    document.body.appendChild(link)
    link.click()
    track('word_downloaded', { exerciseKind: props.exerciseKind })
    link.remove()
    URL.revokeObjectURL(url)
  } finally {
    isWordBusy.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div ref="print-dialog" class="print-overlay" role="dialog" aria-modal="true" aria-labelledby="print-preview-title" tabindex="-1">
      <div class="print-toolbar no-print">
        <div>
          <strong id="print-preview-title">{{ ui('Aperçu avant impression') }}</strong>
        </div>
        <div>
          <button class="secondary-button" type="button" @click="emit('close')">{{ ui('Fermer') }}</button>
          <button class="secondary-button" type="button" :disabled="isWordBusy" @click="downloadWord">
            {{ isWordBusy ? 'Création du fichier Word…' : 'Télécharger au format Word' }}
          </button>
          <button class="primary-button" type="button" :disabled="isPdfBusy" @click="downloadPdf">
            {{ isPdfBusy ? 'Création du PDF…' : 'Télécharger le PDF' }}
          </button>
        </div>
      </div>

      <div class="print-preview-layout">
        <aside class="print-settings no-print" aria-labelledby="print-settings-title">
          <div class="print-settings__heading">
            <p>{{ ui('Personnalisation') }}</p>
            <h2 id="print-settings-title">{{ ui('Options de la fiche') }}</h2>
            <span>{{ ui('Les changements apparaissent immédiatement dans l’aperçu.') }}</span>
          </div>

          <label class="print-settings__field" for="preview-print-title">
            <span>{{ ui('Titre de la fiche') }}</span>
            <input
              id="preview-print-title"
              type="text"
              :value="options.title"
              @input="setPrintOption('title', ($event.target as HTMLInputElement).value)"
            >
          </label>

          <fieldset class="print-settings__group">
            <legend>{{ ui('Mise en page') }}</legend>
            <label class="print-settings__number-field" for="preview-title-spacing">
              <span>{{ ui('Espace avant le titre') }}</span>
              <span>
                <input
                  id="preview-title-spacing"
                  type="number"
                  min="8"
                  max="30"
                  step="1"
                  :value="titleSpacingMm"
                  @input="setPrintOption('titleSpacingMm', Number(($event.target as HTMLInputElement).value))"
                >
                mm
              </span>
            </label>
            <label class="print-settings__number-field" for="preview-question-spacing">
              <span>{{ ui('Espacement entre les questions') }}</span>
              <span>
                <input
                  id="preview-question-spacing"
                  type="number"
                  min="2"
                  max="15"
                  step="0.5"
                  :value="questionSpacingMm"
                  @input="setPrintOption('questionSpacingMm', Number(($event.target as HTMLInputElement).value))"
                >
                mm
              </span>
            </label>
          </fieldset>

          <fieldset class="print-settings__group">
            <legend>{{ ui('Informations de l’élève') }}</legend>
            <label>
              <input type="checkbox" :checked="options.showFirstName" @change="setPrintOption('showFirstName', ($event.target as HTMLInputElement).checked)">
              <span>{{ ui('Prénom') }}</span>
            </label>
            <label>
              <input type="checkbox" :checked="options.showLastName" @change="setPrintOption('showLastName', ($event.target as HTMLInputElement).checked)">
              <span>{{ ui('Nom') }}</span>
            </label>
            <label>
              <input type="checkbox" :checked="options.showDate" @change="setPrintOption('showDate', ($event.target as HTMLInputElement).checked)">
              <span>{{ ui('Date') }}</span>
            </label>
            <label>
              <input type="checkbox" :checked="options.showGrade" @change="setPrintOption('showGrade', ($event.target as HTMLInputElement).checked)">
              <span>{{ ui('Espace pour la note') }}</span>
            </label>
          </fieldset>

          <fieldset class="print-settings__group">
            <legend>{{ ui('Contenu affiché') }}</legend>
            <label>
              <input type="checkbox" :checked="options.showVerbs" @change="setPrintOption('showVerbs', ($event.target as HTMLInputElement).checked)">
              <span>{{ ui('Liste des verbes') }}</span>
            </label>
            <label>
              <input type="checkbox" :checked="options.showTenses" @change="setPrintOption('showTenses', ($event.target as HTMLInputElement).checked)">
              <span>{{ ui('Liste des temps') }}</span>
            </label>
            <label>
              <input type="checkbox" :checked="options.showRandomNumber" @change="setPrintOption('showRandomNumber', ($event.target as HTMLInputElement).checked)">
              <span>{{ ui('Numéro questionnaire/corrigé') }}</span>
            </label>
          </fieldset>
        </aside>

        <main class="print-document print-document--pdf">
          <iframe
            v-if="pdfPreviewUrl"
            class="pdf-preview-frame"
            :src="`${pdfPreviewUrl}#view=FitH&toolbar=1&navpanes=0`"
            :title="ui('Aperçu exact de la fiche PDF et de son corrigé')"
            @load="isPdfPreviewFrameReady = true"
          />
          <div
            v-if="!pdfPreviewError && (isPdfPreviewBusy || !isPdfPreviewFrameReady)"
            class="pdf-preview-state"
            role="status"
            aria-live="polite"
          >
            <span class="pdf-preview-spinner" aria-hidden="true" />
            <strong>{{ ui('Création de l’aperçu PDF…') }}</strong>
            <span>{{ ui('La fiche et le corrigé sont mis en page.') }}</span>
          </div>
          <div v-if="pdfPreviewError" class="pdf-preview-state pdf-preview-state--error" role="alert">
            <strong>{{ pdfPreviewError }}</strong>
            <button class="secondary-button" type="button" @click="refreshPdfPreview">{{ ui('Réessayer') }}</button>
          </div>
        </main>
      </div>
    </div>
  </Teleport>
</template>
