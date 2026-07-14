<script setup lang="ts">
import type { ExerciseQuestion } from '~~/shared/types/conjugation'
import type { ExerciseKind, PrintOptions, Tense, Verb } from '~/composables/useChallengeBuilder'
import {
  correctionItemHeight,
  exerciseItemHeight,
  paginateByHeight,
} from '~~/shared/utils/print-pagination'

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

const sheetNumber = Math.floor(Math.random() * 9000) + 1000
const dialog = useTemplateRef<HTMLElement>('print-dialog')
const isPdfBusy = ref(false)
const isWordBusy = ref(false)

const exerciseFirstPageCapacity = computed(() => {
  // La zone utile commence après l'en-tête : 226 mm permet de conserver
  // vingt questions courtes sur la première page, même avec les métadonnées.
  let capacity = 226
  if (props.options.showFirstName || props.options.showLastName || props.options.showDate) capacity -= 8
  if (props.options.showVerbs) capacity -= 8
  if (props.options.showTenses) capacity -= 8
  if (props.exerciseKind === 'tense-identification') capacity -= 13
  return capacity
})
const exercisePages = computed(() => paginateByHeight(
  props.questions,
  exerciseFirstPageCapacity.value,
  220,
  question => exerciseItemHeight(question.consigne)
))
const correctionPages = computed(() => paginateByHeight(
  props.questions,
  218,
  220,
  question => correctionItemHeight(question.consigne, question.reponsesPourCorrige.join(' ou '))
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

function pdfFileName() {
  const title = props.options.title || 'Défi de conjugaison'
  const safeTitle = title.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${safeTitle || 'defi-conjugaison'}.pdf`
}

async function downloadPdf() {
  if (isPdfBusy.value) return
  isPdfBusy.value = true
  try {
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
    const pageWidth = 210
    const pageHeight = 297
    const left = 17
    const right = 193
    const title = pdfSafe(props.options.title || 'Défi de conjugaison')
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
        return 22
      }
      let y = 18
      const identity = [
        props.options.showFirstName ? 'Prénom : ____________________' : '',
        props.options.showLastName ? 'Nom : ____________________' : '',
        props.options.showDate ? 'Date : ______________' : '',
      ].filter(Boolean)
      if (identity.length) {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(8.5)
        pdf.text(pdfSafe(identity.join('     ')), left, y)
        y += 9
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
        const lines = pdf.splitTextToSize(`Temps : ${pdfSafe(props.tenses.map(tense => tense.name).join(', '))}`, 176)
        pdf.text(lines, left, y)
        y += lines.length * 4.5 + 2
      }
      if (props.exerciseKind === 'tense-identification') {
        pdf.setDrawColor(120, 120, 120)
        pdf.rect(left, y, 176, 10)
        pdf.text('Indique le mode et le temps de chaque forme conjuguée.', left + 3, y + 6)
        y += 15
      }
      return y + 2
    }

    function drawCorrectionHeader() {
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8.5)
      pdf.setTextColor(90, 90, 90)
      pdf.text(`${title} - corrigé${identifier}`, pageWidth / 2, 12, { align: 'center' })
      pdf.setTextColor(20, 20, 20)
      return 22
    }

    function drawExercisePage(page: typeof exercisePages.value[number], continuation: boolean) {
      addPage()
      let y = drawExerciseHeader(continuation)
      pdf.setFontSize(10.5)
      page.forEach(({ item: question, index }) => {
        const prefix = `${index + 1}. `
        pdf.setFont('helvetica', 'normal')
        const lines = pdf.splitTextToSize(pdfSafe(question.consigne), 116)
        pdf.text(prefix, left, y)
        pdf.text(lines, left + 7, y)
        const lineY = y + Math.max(0, lines.length - 1) * 5
        pdf.setLineDashPattern([1, 1], 0)
        pdf.setDrawColor(80, 80, 80)
        pdf.line(142, lineY, right, lineY)
        pdf.setLineDashPattern([], 0)
        y += Math.max(9.5, lines.length * 5 + 4.5)
      })
      drawFooter()
    }

    function drawCorrectionPage(page: typeof correctionPages.value[number]) {
      addPage()
      let y = drawCorrectionHeader()
      pdf.setFontSize(9.5)
      page.forEach(({ item: question, index }) => {
        const prompt = pdf.splitTextToSize(`${index + 1}. ${pdfSafe(question.consigne)}`, 98)
        const answer = pdf.splitTextToSize(pdfSafe(question.reponsesPourCorrige.join(' ou ')), 66)
        const lineCount = Math.max(prompt.length, answer.length)
        const rowHeight = Math.max(8, lineCount * 5 + 3)
        const promptY = y + Math.max(0, (rowHeight - prompt.length * 5) / 2)
        const answerY = y + Math.max(0, (rowHeight - answer.length * 5) / 2)
        pdf.setFont('helvetica', 'normal')
        pdf.text(prompt, left, promptY, { baseline: 'top' })
        pdf.setFont('helvetica', 'bold')
        pdf.text(answer, 124, answerY, { baseline: 'top' })
        pdf.setDrawColor(220, 220, 220)
        pdf.line(left, y + rowHeight, right, y + rowHeight)
        y += rowHeight
      })
      drawFooter()
    }

    exercisePages.value.forEach((page, index) => drawExercisePage(page, index > 0))
    // Le premier corrigé commence toujours sur une nouvelle page PDF.
    correctionPages.value.forEach(page => drawCorrectionPage(page))

    if (pageCount > 0) pdf.save(pdfFileName())
  } finally {
    isPdfBusy.value = false
  }
}

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
      Packer,
      Paragraph,
      SectionType,
      Table,
      TableBorders,
      TableCell,
      TableLayoutType,
      TableRow,
      TextRun,
      VerticalAlign,
      WidthType,
    } = await import('docx')

    const title = props.options.title || 'Défi de conjugaison'
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
      props.options.showFirstName ? 'Prénom : ____________________' : '',
      props.options.showLastName ? 'Nom : ____________________' : '',
      props.options.showDate ? 'Date : ______________' : '',
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
      spacing: { before: 380, after: 260 },
      children: [
        new TextRun({ text: title.toUpperCase(), bold: true, size: 34, font: 'Arial' }),
        new TextRun({ text: identifier, size: 18, font: 'Arial' })
      ]
    }))
    if (props.options.showVerbs) exerciseChildren.push(paragraph(`Verbes : ${props.verbs.map(verb => verb.infinitif).join(', ')}`, { bold: true, size: 19 }))
    if (props.options.showTenses) exerciseChildren.push(paragraph(`Temps : ${props.tenses.map(tense => tense.name).join(', ')}`, { bold: true, size: 19 }))
    if (props.exerciseKind === 'tense-identification') {
      exerciseChildren.push(new Paragraph({
        spacing: { before: 160, after: 160 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: '777777' }, bottom: { style: BorderStyle.SINGLE, size: 4, color: '777777' }, left: { style: BorderStyle.SINGLE, size: 4, color: '777777' }, right: { style: BorderStyle.SINGLE, size: 4, color: '777777' } },
        children: [new TextRun({ text: 'Indique le mode et le temps de chaque forme conjuguée.', size: 19, font: 'Arial' })]
      }))
    }
    exerciseChildren.push(new Table({
      width: { size: contentWidth, type: WidthType.DXA },
      columnWidths: [480, 5900, 3595],
      layout: TableLayoutType.FIXED,
      borders: TableBorders.NONE,
      rows: props.questions.map((question, index) => new TableRow({
        cantSplit: true,
        height: { value: 540, rule: HeightRule.ATLEAST },
        children: [
          cell([paragraph(`${index + 1}.`, { size: 21 })], 480, { margins: { top: 70, bottom: 70, left: 0, right: 40 } }),
          cell([paragraph(question.consigne, { size: 21 })], 5900),
          cell([new Paragraph({
            spacing: { before: 0, after: 0, line: 240 },
            border: { bottom: { style: BorderStyle.DOTTED, size: 4, color: '555555', space: 1 } },
            children: [new TextRun({ text: ' ', size: 21, font: 'Arial' })]
          })], 3595)
        ]
      }))
    }))

    const correctionChildren: Array<InstanceType<typeof Paragraph> | InstanceType<typeof Table>> = [
      new Table({
        width: { size: contentWidth, type: WidthType.DXA },
        columnWidths: [480, 5900, 3595],
        layout: TableLayoutType.FIXED,
        borders: TableBorders.NONE,
        rows: props.questions.map((question, index) => new TableRow({
          cantSplit: true,
          height: { value: 460, rule: HeightRule.ATLEAST },
          children: [
            cell([paragraph(`${index + 1}.`, { size: 19 })], 480, { borders: lightBottomBorder, margins: { top: 55, bottom: 55, left: 0, right: 40 } }),
            cell([paragraph(question.consigne, { size: 19 })], 5900, { borders: lightBottomBorder, margins: { top: 55, bottom: 55, left: 70, right: 70 } }),
            cell([paragraph(question.reponsesPourCorrige.join(' ou '), { bold: true, size: 19 })], 3595, { borders: lightBottomBorder, margins: { top: 55, bottom: 55, left: 70, right: 70 } })
          ]
        }))
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
          <strong id="print-preview-title">Aperçu avant impression</strong>
          <span>La fiche et son corrigé seront imprimés sur des pages séparées.</span>
        </div>
        <div>
          <button class="secondary-button" type="button" @click="emit('close')">Fermer</button>
          <button class="secondary-button" type="button" :disabled="isWordBusy" @click="downloadWord">
            {{ isWordBusy ? 'Création du fichier Word…' : 'Télécharger Word' }}
          </button>
          <button class="primary-button" type="button" :disabled="isPdfBusy" @click="downloadPdf">
            {{ isPdfBusy ? 'Création du PDF…' : 'Télécharger le PDF' }}
          </button>
        </div>
      </div>

      <div class="print-preview-layout">
        <aside class="print-settings no-print" aria-labelledby="print-settings-title">
          <div class="print-settings__heading">
            <p>Personnalisation</p>
            <h2 id="print-settings-title">Options de la fiche</h2>
            <span>Les changements apparaissent immédiatement dans l’aperçu.</span>
          </div>

          <label class="print-settings__field" for="preview-print-title">
            <span>Titre de la fiche</span>
            <input
              id="preview-print-title"
              type="text"
              :value="options.title"
              @input="setPrintOption('title', ($event.target as HTMLInputElement).value)"
            >
          </label>

          <fieldset class="print-settings__group">
            <legend>Informations de l’élève</legend>
            <label>
              <input type="checkbox" :checked="options.showFirstName" @change="setPrintOption('showFirstName', ($event.target as HTMLInputElement).checked)">
              <span>Prénom</span>
            </label>
            <label>
              <input type="checkbox" :checked="options.showLastName" @change="setPrintOption('showLastName', ($event.target as HTMLInputElement).checked)">
              <span>Nom</span>
            </label>
            <label>
              <input type="checkbox" :checked="options.showDate" @change="setPrintOption('showDate', ($event.target as HTMLInputElement).checked)">
              <span>Date</span>
            </label>
            <label>
              <input type="checkbox" :checked="options.showGrade" @change="setPrintOption('showGrade', ($event.target as HTMLInputElement).checked)">
              <span>Espace pour la note</span>
            </label>
          </fieldset>

          <fieldset class="print-settings__group">
            <legend>Contenu affiché</legend>
            <label>
              <input type="checkbox" :checked="options.showVerbs" @change="setPrintOption('showVerbs', ($event.target as HTMLInputElement).checked)">
              <span>Liste des verbes</span>
            </label>
            <label>
              <input type="checkbox" :checked="options.showTenses" @change="setPrintOption('showTenses', ($event.target as HTMLInputElement).checked)">
              <span>Liste des temps</span>
            </label>
            <label>
              <input type="checkbox" :checked="options.showRandomNumber" @change="setPrintOption('showRandomNumber', ($event.target as HTMLInputElement).checked)">
              <span>Numéro questionnaire/corrigé</span>
            </label>
          </fieldset>
        </aside>

        <main class="print-document">
          <section
            v-for="(page, pageIndex) in exercisePages"
            :key="`exercise-page-${pageIndex}`"
            class="print-sheet"
          >
          <header class="print-sheet__header">
            <div v-if="pageIndex === 0" class="student-fields">
              <span v-if="options.showFirstName">Prénom : ____________________</span>
              <span v-if="options.showLastName">Nom : ____________________</span>
              <span v-if="options.showDate">Date : ______________</span>
            </div>
            <div v-if="pageIndex === 0 && options.showGrade" class="grade-box" aria-label="Espace pour la note" />
            <h1 v-if="pageIndex === 0">
              {{ options.title || 'Défi de conjugaison' }}
              <small v-if="options.showRandomNumber">n° {{ sheetNumber }}</small>
            </h1>
            <p v-else class="print-running-header">
              {{ options.title || 'Défi de conjugaison' }}<template v-if="options.showRandomNumber"> n° {{ sheetNumber }}</template>
            </p>
            <p v-if="pageIndex === 0 && options.showVerbs"><strong>Verbes :</strong> {{ verbs.map(verb => verb.infinitif).join(', ') }}</p>
            <p v-if="pageIndex === 0 && options.showTenses"><strong>Temps :</strong> {{ tenses.map(tense => tense.name).join(', ') }}</p>
            <p v-if="pageIndex === 0 && exerciseKind === 'tense-identification'" class="print-instruction">
              Indique le mode et le temps de chaque forme conjuguée.
            </p>
          </header>

          <ol class="print-questions" :start="(page[0]?.index ?? 0) + 1">
            <li v-for="entry in page" :key="`${entry.index}-${entry.item.titre}-${entry.item.consigne}`">
              <span>{{ entry.item.consigne }}</span>
              <span class="answer-line" />
            </li>
          </ol>
          <footer class="print-site-reference">conjugaison.tatitotu.ch</footer>
          </section>

          <section
            v-for="(page, pageIndex) in correctionPages"
            :key="`correction-page-${pageIndex}`"
            class="print-sheet print-sheet--correction"
          >
          <header class="print-sheet__header">
            <p class="print-running-header">
              {{ options.title || 'Défi de conjugaison' }} — corrigé<template v-if="options.showRandomNumber"> n° {{ sheetNumber }}</template>
            </p>
          </header>
          <ol class="print-questions print-questions--answers" :start="(page[0]?.index ?? 0) + 1">
            <li v-for="entry in page" :key="`answer-${entry.index}-${entry.item.titre}-${entry.item.consigne}`">
              <span>{{ entry.item.consigne }}</span>
              <strong>{{ entry.item.reponsesPourCorrige.join(' ou ') }}</strong>
            </li>
          </ol>
          <footer class="print-site-reference">conjugaison.tatitotu.ch</footer>
          </section>
        </main>
      </div>
    </div>
  </Teleport>
</template>
