<script setup lang="ts">
const { ui, uiLabel } = useLanguagePreferences()
import type { ExerciseQuestion } from '~~/shared/types/conjugation'
import type { ExerciseKind, PrintOptions, Tense, Verb } from '~/composables/useChallengeBuilder'
import { TENSE_IDENTIFICATION_INSTRUCTION } from '~~/shared/utils/exercise-instructions'
import {
  correctionItemHeight,
  estimatedTextLines,
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
  requestedQuestionCount: number
  regenerating?: boolean
}>()

const emit = defineEmits<{
  close: []
  updateOptions: [value: PrintOptions]
  regenerate: []
}>()
const { track } = useSiteAnalytics()

function randomSheetNumber(excluding?: number) {
  let number = Math.floor(Math.random() * 9000) + 1000
  while (number === excluding) number = Math.floor(Math.random() * 9000) + 1000
  return number
}

const sheetNumber = ref(randomSheetNumber())
const dialog = useTemplateRef<HTMLElement>('print-dialog')
const isPdfBusy = ref(false)
const isWordBusy = ref(false)
const isPdfPreviewBusy = ref(true)
const isPdfPreviewFrameReady = ref(false)
const pdfPreviewUrl = ref('')
const pdfPreviewError = ref('')
const allowRepetitions = ref(false)
let pdfPreviewGeneration = 0
let pdfPreviewTimer: ReturnType<typeof setTimeout> | undefined

function boundedOption(value: number | undefined, fallback: number, minimum: number, maximum: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : fallback
}

const GRADE_BOX_SIZE_MM = 17
const INCLUSIVE_GRADE_TOP_MM = 26
const INCLUSIVE_QUESTION_LINE_HEIGHT_MM = 7.5

const questionSpacingMm = computed(() => boundedOption(props.options.questionSpacingMm, 8, 2, 15))
const titleSpacingMm = computed(() => boundedOption(props.options.titleSpacingMm, 30, 8, 30))
const inclusivePrint = computed(() => props.options.inclusiveDisplay)
const effectiveQuestionSpacingMm = computed(() => inclusivePrint.value
  ? Math.max(10, questionSpacingMm.value)
  : questionSpacingMm.value)
const pdfBodySize = computed(() => inclusivePrint.value ? 12 : 10.5)
const pdfCorrectionSize = computed(() => inclusivePrint.value ? 12 : 9.5)
const pdfLineHeightMm = computed(() => inclusivePrint.value ? 6.5 : 5)
const isTenseIdentification = computed(() => props.exerciseKind === 'tense-identification')
const identificationAnswerHeightMm = computed(() => 8 + Math.max(0, 5 - questionSpacingMm.value))
const missingQuestionCount = computed(() => Math.max(0, props.requestedQuestionCount - props.questions.length))
const printableQuestions = computed(() => {
  if (!allowRepetitions.value || !missingQuestionCount.value || !props.questions.length) return props.questions
  const result = [...props.questions]
  while (result.length < props.requestedQuestionCount) {
    const cycle = [...props.questions]
    for (let index = cycle.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1))
      ;[cycle[index], cycle[randomIndex]] = [cycle[randomIndex]!, cycle[index]!]
    }
    result.push(...cycle.slice(0, props.requestedQuestionCount - result.length))
  }
  return result
})

const exerciseFirstPageCapacity = computed(() => {
  // La zone utile commence après l'en-tête : 226 mm permet de conserver
  // vingt questions courtes sur la première page, même avec les métadonnées.
  let capacity = 226
  if (props.options.showFirstName || props.options.showLastName || props.options.showDate) {
    capacity -= Math.max(0, titleSpacingMm.value - 1)
  }
  if (inclusivePrint.value && props.options.showGrade) {
    const identityBottom = props.options.showFirstName || props.options.showLastName || props.options.showDate
      ? 18 + titleSpacingMm.value
      : 18
    capacity -= Math.max(0, INCLUSIVE_GRADE_TOP_MM + GRADE_BOX_SIZE_MM - identityBottom)
  }
  if (props.options.showVerbs) capacity -= 8
  if (props.options.showTenses) capacity -= 8
  if (isTenseIdentification.value) capacity -= 19
  else capacity -= 6
  return capacity
})
const exercisePages = computed(() => paginateByHeight(
  printableQuestions.value,
  exerciseFirstPageCapacity.value,
  220,
  (question) => {
    const printable = printableQuestionParts(question, props.exerciseKind)
    const inclusiveLineCount = Math.max(
      estimatedTextLines(printable.label, 34),
      estimatedTextLines(printable.completion, 48),
    )
    return exerciseItemHeight(printableQuestion(question, props.exerciseKind), effectiveQuestionSpacingMm.value)
      * (inclusivePrint.value ? 1.18 : 1)
      + (inclusivePrint.value ? Math.max(0, inclusiveLineCount - 1) * (INCLUSIVE_QUESTION_LINE_HEIGHT_MM - pdfLineHeightMm.value) : 0)
      + (printable.suffixOnNextLine ? 6 : 0)
      + (isTenseIdentification.value ? identificationAnswerHeightMm.value : 0)
      + (question.literaryCitation ? 4 : 0)
  }
))
const correctionPages = computed(() => paginateByHeight(
  printableQuestions.value,
  205,
  220,
  question => isTenseIdentification.value
    ? correctionItemHeight('', printableCorrectionText(question)) * (inclusivePrint.value ? 1.35 : 1)
    : correctionItemHeight(printableCorrectionLabel(question, props.exerciseKind), printableCorrectionText(question)) * (inclusivePrint.value ? 1.35 : 1)
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
    .replace(/【/g, '[')
    .replace(/】/g, ']')
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
    const identifier = props.options.showRandomNumber ? ` n° ${sheetNumber.value}` : ''
    const bodySize = pdfBodySize.value
    const correctionSize = pdfCorrectionSize.value
    const lineHeight = pdfLineHeightMm.value
    const questionLineHeight = inclusivePrint.value ? INCLUSIVE_QUESTION_LINE_HEIGHT_MM : lineHeight
    const questionLineHeightFactor = questionLineHeight / (bodySize * 25.4 / 72)
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
        pdf.setFontSize(inclusivePrint.value ? 12 : 8.5)
        pdf.setTextColor(90, 90, 90)
        pdf.text(`${title}${identifier}`, pageWidth / 2, 12, { align: 'center' })
        pdf.setTextColor(20, 20, 20)
        return 32
      }
      let y = 18
      const gradeTop = inclusivePrint.value ? INCLUSIVE_GRADE_TOP_MM : 15
      const identity = [
        props.options.showFirstName ? `${ui('Prénom')} : ____________________` : '',
        props.options.showLastName ? `${ui('Nom')} : ____________________` : '',
        props.options.showDate ? `${ui('Date')} : ______________` : '',
      ].filter(Boolean)
      if (identity.length) {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(inclusivePrint.value ? 12 : 8.5)
        pdf.text(pdfSafe(identity.join('     ')), left, y)
        y += titleSpacingMm.value
      }
      if (props.options.showGrade) {
        pdf.setDrawColor(40, 40, 40)
        pdf.rect(right - GRADE_BOX_SIZE_MM, gradeTop, GRADE_BOX_SIZE_MM, GRADE_BOX_SIZE_MM)
        if (inclusivePrint.value) y = Math.max(y, gradeTop + GRADE_BOX_SIZE_MM)
      }
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(17)
      const heading = `${title}${identifier}`
      const titleLines = pdf.splitTextToSize(inclusivePrint.value ? heading : heading.toUpperCase(), 150)
      pdf.text(titleLines, left, y + 8)
      y += titleLines.length * 7 + 10
      pdf.setFontSize(inclusivePrint.value ? 12 : 9)
      if (props.options.showVerbs) {
        const lines = pdf.splitTextToSize(`Verbes : ${pdfSafe(props.verbs.map(verb => verb.infinitif).join(', '))}`, 176)
        pdf.text(lines, left, y)
        y += lines.length * (inclusivePrint.value ? 6.5 : 4.5) + 2
      }
      if (props.options.showTenses) {
        const lines = pdf.splitTextToSize(`${ui('Temps :')} ${pdfSafe(props.tenses.map(tense => uiLabel(tense.name)).join(', '))}`, 176)
        pdf.text(lines, left, y)
        y += lines.length * (inclusivePrint.value ? 6.5 : 4.5) + 2
      }
      if (isTenseIdentification.value) {
        pdf.setDrawColor(120, 120, 120)
        pdf.rect(left, y, 176, 10)
        pdf.text(TENSE_IDENTIFICATION_INSTRUCTION, left + 3, y + 6)
        y += 21
      }
      return y + (isTenseIdentification.value ? 2 : 8)
    }

    function drawCorrectionHeader(continuation: boolean) {
      if (continuation) {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(inclusivePrint.value ? 12 : 8.5)
        pdf.setTextColor(90, 90, 90)
        pdf.text(`${title} - corrigé${identifier}`, pageWidth / 2, 12, { align: 'center' })
        pdf.setTextColor(20, 20, 20)
        return 32
      }
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(17)
      pdf.setTextColor(20, 20, 20)
      const correctionTitle = inclusivePrint.value
        ? capitalizePrintLine(ui('CORRIGÉ').toLocaleLowerCase('fr-CH'))
        : ui('CORRIGÉ')
      pdf.text(`${correctionTitle}${identifier}`, left, 26)
      return 38
    }

    function pdfLiteraryCitation(question: ExerciseQuestion, width: number) {
      const citation = question.literaryCitation
      if (!citation) return null
      const before = pdfSafe(citation.before).replace(/\s+/gu, ' ')
      const target = pdfSafe(citation.target).replace(/\s+/gu, ' ')
      const after = pdfSafe(citation.after).replace(/\s+/gu, ' ')
      const text = capitalizePrintLine(`${before}${target}${after}`)
      const source = pdfSafe(`- ${citation.author}, ${citation.work}`)
      const targetStart = before.length
      const targetEnd = targetStart + target.length
      let cursor = 0
      const lines = (pdf.splitTextToSize(text, width) as string[]).map((line) => {
        const located = text.indexOf(line, cursor)
        const start = located >= 0 ? located : cursor
        cursor = start + line.length
        return { text: line, start }
      })
      const previousSize = pdf.getFontSize()
      const previousStyle = pdf.getFont().fontStyle
      pdf.setFont('helvetica', 'italic')
      pdf.setFontSize(inclusivePrint.value ? 12 : 8.3)
      const sourceLines = pdf.splitTextToSize(source, width) as string[]
      pdf.setFont('helvetica', previousStyle)
      pdf.setFontSize(previousSize)
      return {
        lines,
        sourceLines,
        targetStart,
        targetEnd,
        height: lines.length * questionLineHeight + sourceLines.length * (inclusivePrint.value ? 6.5 : 4),
      }
    }

    function drawPdfLiteraryCitation(
      citation: NonNullable<ReturnType<typeof pdfLiteraryCitation>>,
      x: number,
      y: number,
    ) {
      citation.lines.forEach((line, lineIndex) => {
        const baseline = y + lineIndex * questionLineHeight
        pdf.text(line.text, x, baseline)
        const overlapStart = Math.max(line.start, citation.targetStart)
        const overlapEnd = Math.min(line.start + line.text.length, citation.targetEnd)
        if (overlapEnd <= overlapStart) return
        const prefix = line.text.slice(0, overlapStart - line.start)
        const underlined = line.text.slice(overlapStart - line.start, overlapEnd - line.start)
        const underlineStart = x + pdf.getTextWidth(prefix)
        pdf.setDrawColor(25, 25, 25)
        pdf.setLineWidth(.25)
        pdf.line(underlineStart, baseline + .8, underlineStart + pdf.getTextWidth(underlined), baseline + .8)
      })
      const previousSize = pdf.getFontSize()
      const previousStyle = pdf.getFont().fontStyle
      pdf.setFont('helvetica', 'italic')
      pdf.setFontSize(inclusivePrint.value ? 12 : 8.3)
      pdf.setTextColor(90, 90, 90)
      citation.sourceLines.forEach((line, lineIndex) => {
        pdf.text(line, x, y + citation.lines.length * questionLineHeight + lineIndex * (inclusivePrint.value ? 6.5 : 4))
      })
      pdf.setTextColor(20, 20, 20)
      pdf.setFont('helvetica', previousStyle)
      pdf.setFontSize(previousSize)
    }

    function drawExercisePage(page: typeof exercisePages.value[number], continuation: boolean) {
      addPage()
      let y = drawExerciseHeader(continuation)
      pdf.setFontSize(bodySize)
      page.forEach(({ item: question, index }) => {
        const prefix = `${index + 1}. `
        const printable = printableQuestionParts(question, props.exerciseKind)
        pdf.setFont('helvetica', 'normal')
        const labelLines = pdf.splitTextToSize(pdfSafe(capitalizePrintLine(printable.label)), 68)
        const completionWidth = printable.label ? 96 : 169
        const literaryCitation = pdfLiteraryCitation(question, completionWidth)
        const completionLines = literaryCitation
          ? [...literaryCitation.lines.map(line => line.text), ...literaryCitation.sourceLines]
          : printable.fillBlank
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
        if (printable.label) pdf.text(labelLines, left + 7, y, { lineHeightFactor: questionLineHeightFactor })
        if (printable.fillBlank) {
          if (before) pdf.text(before, completionX, y)
          if (after && !printable.suffixOnNextLine) pdf.text(after, right, y, { align: 'right' })
          if (lineEnd > lineStart) {
            pdf.setDrawColor(55, 55, 55)
            pdf.line(lineStart, y + .8, lineEnd, y + .8)
          }
          if (printable.suffixOnNextLine) {
            if (firstSuffixLine) pdf.text(firstSuffixLine, lineEnd + 2, y)
            remainingSuffixLines.forEach((line: string, lineIndex: number) => {
              pdf.text(line, completionX, y + questionLineHeight + lineIndex * questionLineHeight)
            })
          }
        } else if (literaryCitation) {
          drawPdfLiteraryCitation(literaryCitation, completionX, y)
        } else {
          pdf.text(completionLines, completionX, y, { lineHeightFactor: questionLineHeightFactor })
        }
        if (isTenseIdentification.value) {
          const questionHeight = literaryCitation ? literaryCitation.height : lineCount * questionLineHeight
          const answerY = y + questionHeight + 2
          const modeLabel = pdfSafe(ui('Mode :'))
          const tenseLabel = pdfSafe(ui('Temps :'))
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(inclusivePrint.value ? 12 : 9.5)
          pdf.setTextColor(70, 70, 70)
          pdf.text(modeLabel, left + 7, answerY)
          pdf.text(tenseLabel, 108, answerY)
          pdf.setDrawColor(105, 105, 105)
          pdf.line(left + 7 + pdf.getTextWidth(modeLabel) + 2, answerY + .7, 101, answerY + .7)
          pdf.line(108 + pdf.getTextWidth(tenseLabel) + 2, answerY + .7, right, answerY + .7)
          pdf.setTextColor(20, 20, 20)
          pdf.setFontSize(bodySize)
          y += questionHeight + 8 + Math.max(5, effectiveQuestionSpacingMm.value)
        } else {
          y += Math.max(questionLineHeight + effectiveQuestionSpacingMm.value, lineCount * questionLineHeight + effectiveQuestionSpacingMm.value)
        }
      })
      drawFooter()
    }

    function drawCorrectionPage(page: typeof correctionPages.value[number], continuation: boolean) {
      addPage()
      let y = drawCorrectionHeader(continuation)
      pdf.setFontSize(correctionSize)
      page.forEach(({ item: question, index }) => {
        const answer = printableCorrectionAnswers(question)
          .flatMap(value => pdf.splitTextToSize(
            pdfSafe(capitalizePrintText(value)),
            isTenseIdentification.value ? 169 : 82,
          ))
        const answerHeight = answer.length * lineHeight
        if (isTenseIdentification.value) {
          const rowHeight = Math.max(inclusivePrint.value ? 13 : 9, answerHeight + 4)
          const textY = y + Math.max(0, (rowHeight - answerHeight) / 2)
          pdf.setFont('helvetica', 'normal')
          pdf.text(`${index + 1}.`, left, textY, { baseline: 'top' })
          pdf.setFont('helvetica', 'bold')
          pdf.text(answer, left + 10, textY, { baseline: 'top' })
          pdf.setDrawColor(225, 225, 225)
          pdf.line(left, y + rowHeight, right, y + rowHeight)
          y += rowHeight
          return
        }
        const prompt = pdf.splitTextToSize(
          pdfSafe(capitalizePrintLine(printableCorrectionLabel(question, props.exerciseKind))),
          79,
        )
        const promptHeight = prompt.length * lineHeight
        const rowHeight = Math.max(inclusivePrint.value ? 13 : 8, Math.max(promptHeight, answerHeight) + 3)
        const numberY = y + Math.max(0, (rowHeight - lineHeight) / 2)
        const promptY = y + Math.max(0, (rowHeight - promptHeight) / 2)
        const answerY = y + Math.max(0, (rowHeight - answerHeight) / 2)
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
  track('feature_selected', { feature: 'download.pdf' })
  isPdfBusy.value = true
  try {
    const pdf = await buildPdf()
    pdf.save(pdfFileName())
    track('pdf_downloaded', { exerciseKind: props.exerciseKind })
  }
  catch {
    track('feature_failed', { feature: 'download.pdf' })
  }
  finally {
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
    questions: printableQuestions.value,
    verbs: props.verbs,
    tenses: props.tenses,
    exerciseKind: props.exerciseKind,
    options: props.options,
  }),
  schedulePdfPreview,
  { deep: true }
)

watch(
  () => props.questions,
  () => {
    sheetNumber.value = randomSheetNumber(sheetNumber.value)
  }
)

onMounted(() => {
  track('feature_exposed', { feature: 'download.pdf' })
  track('feature_exposed', { feature: 'download.word' })
  void refreshPdfPreview()
})

onBeforeUnmount(() => {
  pdfPreviewGeneration += 1
  if (pdfPreviewTimer) clearTimeout(pdfPreviewTimer)
  revokePdfPreviewUrl()
})

async function downloadWord() {
  if (isWordBusy.value) return
  track('feature_selected', { feature: 'download.word' })
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
      UnderlineType,
      VerticalAlign,
      WidthType,
    } = await import('docx')

    const title = props.options.title || ui('Défi de conjugaison')
    const identifier = props.options.showRandomNumber ? ` n° ${sheetNumber.value}` : ''
    const contentWidth = 9975
    const pageMargins = { top: 1020, right: 965, bottom: 850, left: 965, header: 360, footer: 360, gutter: 0 }
    const wordBodySize = inclusivePrint.value ? 24 : 21
    const wordSecondarySize = inclusivePrint.value ? 24 : 19
    const wordLineSpacing = inclusivePrint.value ? 360 : 240
    const wordQuestionSpacingMm = inclusivePrint.value ? Math.max(10, questionSpacingMm.value) : questionSpacingMm.value
    const noSpacing = { before: 0, after: 0, line: wordLineSpacing }
    const footer = new Footer({
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: noSpacing,
        children: [new TextRun({ text: 'conjugaison.tatitotu.ch', size: inclusivePrint.value ? 20 : 16, color: '666666' })]
      })]
    })
    const runningHeader = (text: string) => new Header({
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: noSpacing,
        children: [new TextRun({ text, size: inclusivePrint.value ? 20 : 17, color: '666666' })]
      })]
    })
    const emptyHeader = new Header({ children: [new Paragraph({ spacing: noSpacing })] })
    const paragraph = (text: string, options: { bold?: boolean, size?: number, alignment?: typeof AlignmentType[keyof typeof AlignmentType] } = {}) => new Paragraph({
      alignment: options.alignment,
      spacing: noSpacing,
      children: [new TextRun({ text, bold: options.bold, size: options.size ?? wordBodySize, font: 'Arial' })]
    })
    const identificationQuestionParagraphs = (question: ExerciseQuestion, size = wordBodySize) => {
      const citation = question.literaryCitation
      if (!citation) {
        return [paragraph(capitalizePrintLine(printableQuestionParts(question, props.exerciseKind).completion), { size })]
      }
      const before = capitalizePrintLine(citation.before)
      const target = citation.before ? citation.target : capitalizePrintLine(citation.target)
      return [
        new Paragraph({
          spacing: noSpacing,
          children: [
            new TextRun({ text: before, size, font: 'Arial' }),
            new TextRun({ text: target, size, font: 'Arial', underline: { type: UnderlineType.SINGLE } }),
            new TextRun({ text: citation.after, size, font: 'Arial' }),
          ],
        }),
        new Paragraph({
          spacing: { before: 50, after: 0, line: inclusivePrint.value ? wordLineSpacing : 220 },
          children: [
            new TextRun({
              text: `— ${citation.author}, ${citation.work}`,
              size: inclusivePrint.value ? wordBodySize : Math.max(15, size - 3),
              italics: true,
              color: '666666',
              font: 'Arial',
            }),
          ],
        }),
      ]
    }
    const completionParagraphs = (question: ExerciseQuestion) => {
      const printable = printableQuestionParts(question, props.exerciseKind)
      if (!printable.fillBlank) return [paragraph(capitalizePrintLine(printable.completion), { size: wordBodySize })]

      const prefix = capitalizePrintLine(printable.completionPrefix)
      const suffix = printable.completionSuffix
      return [new Paragraph({
        spacing: noSpacing,
        tabStops: [{
          type: TabStopType.RIGHT,
          position: 5300,
          leader: LeaderType.UNDERSCORE,
        }],
        children: [new TextRun({
          size: wordBodySize,
          font: 'Arial',
          children: [
            ...(prefix ? [prefix, ' '] : []),
            new Tab(),
            ...(suffix ? [` ${suffix}`] : []),
          ],
        })],
      })]
    }
    const identificationAnswerParagraph = () => new Paragraph({
      spacing: { before: 150, after: 40, line: wordLineSpacing },
      tabStops: [
        { type: TabStopType.RIGHT, position: 4300, leader: LeaderType.UNDERSCORE },
        { type: TabStopType.RIGHT, position: 9250, leader: LeaderType.UNDERSCORE },
      ],
      children: [
        new TextRun({ text: `${ui('Mode :')} `, bold: true, size: wordSecondarySize, color: '555555', font: 'Arial' }),
        new TextRun({ children: [new Tab()], size: wordSecondarySize, font: 'Arial' }),
        new TextRun({ text: `   ${ui('Temps :')} `, bold: true, size: wordSecondarySize, color: '555555', font: 'Arial' }),
        new TextRun({ children: [new Tab()], size: wordSecondarySize, font: 'Arial' }),
      ],
    })
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
    identityValues.forEach(value => identityCells.push(cell([paragraph(value, { size: inclusivePrint.value ? wordBodySize : 18 })], identityWidth)))
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
        new TextRun({ text: inclusivePrint.value ? title : title.toUpperCase(), bold: true, size: 34, font: 'Arial' }),
        new TextRun({ text: identifier, size: inclusivePrint.value ? wordBodySize : 18, font: 'Arial' })
      ]
    }))
    if (props.options.showVerbs) exerciseChildren.push(paragraph(`Verbes : ${props.verbs.map(verb => verb.infinitif).join(', ')}`, { bold: true, size: wordSecondarySize }))
    if (props.options.showTenses) exerciseChildren.push(paragraph(`${ui('Temps :')} ${props.tenses.map(tense => uiLabel(tense.name)).join(', ')}`, { bold: true, size: wordSecondarySize }))
    if (isTenseIdentification.value) {
      exerciseChildren.push(new Paragraph({
        spacing: { before: 160, after: 480 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: '777777' }, bottom: { style: BorderStyle.SINGLE, size: 4, color: '777777' }, left: { style: BorderStyle.SINGLE, size: 4, color: '777777' }, right: { style: BorderStyle.SINGLE, size: 4, color: '777777' } },
        children: [new TextRun({ text: TENSE_IDENTIFICATION_INSTRUCTION, size: wordSecondarySize, font: 'Arial' })]
      }))
    }
    else {
      exerciseChildren.push(new Paragraph({
        spacing: { before: 0, after: 340 },
        children: [],
      }))
    }
    exerciseChildren.push(new Table({
      width: { size: contentWidth, type: WidthType.DXA },
      columnWidths: isTenseIdentification.value ? [480, 9495] : [480, 3900, 5595],
      layout: TableLayoutType.FIXED,
      borders: TableBorders.NONE,
      rows: printableQuestions.value.map((question, index) => {
        const printable = printableQuestionParts(question, props.exerciseKind)
        const identificationCells = [
          cell([paragraph(`${index + 1}.`, { size: wordBodySize })], 480, { margins: { top: 90, bottom: 90, left: 0, right: 40 } }),
          cell([
            ...identificationQuestionParagraphs(question),
            identificationAnswerParagraph(),
          ], 9495, { margins: { top: 90, bottom: 100, left: 70, right: 70 } }),
        ]
        const conjugationCells = [
          cell([paragraph(`${index + 1}.`, { size: wordBodySize })], 480, { margins: { top: 70, bottom: 70, left: 0, right: 40 } }),
          cell([paragraph(capitalizePrintLine(printable.label), { size: wordBodySize })], 3900),
          cell(completionParagraphs(question), 5595),
        ]
        return new TableRow({
          cantSplit: true,
          height: {
            value: Math.round(((isTenseIdentification.value ? 13 : 5)
              + Math.max(isTenseIdentification.value ? 5 : 0, wordQuestionSpacingMm)) * 56.7),
            rule: HeightRule.ATLEAST,
          },
          children: isTenseIdentification.value ? identificationCells : conjugationCells,
        })
      })
    }))

    const correctionChildren: Array<InstanceType<typeof Paragraph> | InstanceType<typeof Table>> = [
      new Paragraph({
        spacing: { before: 0, after: 260 },
        children: [
          new TextRun({ text: inclusivePrint.value ? capitalizePrintLine(ui('CORRIGÉ').toLocaleLowerCase('fr-CH')) : ui('CORRIGÉ'), bold: true, size: 34, font: 'Arial' }),
          new TextRun({ text: identifier, size: inclusivePrint.value ? wordBodySize : 18, font: 'Arial' })
        ]
      }),
      new Table({
        width: { size: contentWidth, type: WidthType.DXA },
        columnWidths: isTenseIdentification.value ? [480, 9495] : [480, 5100, 4395],
        layout: TableLayoutType.FIXED,
        borders: TableBorders.NONE,
        rows: printableQuestions.value.map((question, index) => {
          const identificationCorrectionCells = [
            cell([paragraph(`${index + 1}.`, { size: wordSecondarySize })], 480, {
              borders: lightBottomBorder,
              margins: { top: 70, bottom: 70, left: 0, right: 40 },
            }),
            cell(
              printableCorrectionAnswers(question).map(answer => paragraph(capitalizePrintText(answer), { bold: true, size: wordSecondarySize })),
              9495,
              { borders: lightBottomBorder, margins: { top: 70, bottom: 70, left: 70, right: 70 } },
            ),
          ]
          const conjugationCorrectionCells = [
            cell([paragraph(`${index + 1}.`, { size: wordSecondarySize })], 480, { borders: lightBottomBorder, margins: { top: 55, bottom: 55, left: 0, right: 40 } }),
            cell(
              [paragraph(capitalizePrintLine(printableCorrectionLabel(question, props.exerciseKind)), { size: wordSecondarySize })],
              5100,
              { borders: lightBottomBorder, margins: { top: 55, bottom: 55, left: 70, right: 70 } },
            ),
            cell(printableCorrectionAnswers(question).map(answer => paragraph(capitalizePrintText(answer), { bold: true, size: wordSecondarySize })), 4395, { borders: lightBottomBorder, margins: { top: 55, bottom: 55, left: 70, right: 70 } }),
          ]
          return new TableRow({
            cantSplit: true,
            height: { value: 460, rule: HeightRule.ATLEAST },
            children: isTenseIdentification.value
              ? identificationCorrectionCells
              : conjugationCorrectionCells,
          })
        })
      })
    ]

    const wordDocument = new Document({
      styles: {
        default: {
          document: { run: { font: 'Arial', size: wordBodySize }, paragraph: { spacing: noSpacing } }
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
  }
  catch {
    track('feature_failed', { feature: 'download.word' })
  }
  finally {
    isWordBusy.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div ref="print-dialog" class="print-overlay" data-tour="print-preview" role="dialog" aria-modal="true" aria-labelledby="print-preview-title" tabindex="-1">
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
        <aside class="print-settings no-print" data-tour="print-settings" aria-labelledby="print-settings-title">
          <div class="print-settings__heading">
            <p>{{ ui('Personnalisation') }}</p>
            <h2 id="print-settings-title">{{ ui('Options de la fiche') }}</h2>
            <span>{{ ui('Les changements apparaissent immédiatement dans l’aperçu.') }}</span>
          </div>

          <section class="print-sheet-generation" :aria-label="ui('Questions de la fiche')">
            <button
              class="secondary-button print-sheet-generation__random"
              type="button"
              :disabled="regenerating"
              @click="emit('regenerate')"
            >
              {{ regenerating ? ui('Création d’une nouvelle fiche…') : ui('Nouvelle fiche au hasard') }}
            </button>

            <div v-if="missingQuestionCount" class="print-question-shortage">
              <strong role="status">
                {{ ui('Seulement {available} questions différentes sont disponibles sur les {requested} demandées', {
                  available: questions.length,
                  requested: requestedQuestionCount,
                }) }}
              </strong>
              <div class="print-question-shortage__action">
                <span aria-hidden="true">↳</span>
                <button
                  type="button"
                  :class="{ 'is-active': allowRepetitions }"
                  :aria-pressed="allowRepetitions"
                  @click="allowRepetitions = !allowRepetitions"
                >
                  {{ allowRepetitions ? ui('Répétitions autorisées') : ui('Autoriser les répétitions') }}
                </button>
              </div>
            </div>
          </section>

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
            <label class="print-settings__inclusive">
              <input type="checkbox" :checked="options.inclusiveDisplay" @change="setPrintOption('inclusiveDisplay', ($event.target as HTMLInputElement).checked)">
              <span>
                <strong>{{ ui('Affichage inclusif') }}</strong>
                <small>{{ ui('Texte agrandi, police Arial, interligne renforcé et mise en page plus aérée.') }}</small>
              </span>
            </label>
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
