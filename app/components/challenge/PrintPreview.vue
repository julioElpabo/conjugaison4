<script setup lang="ts">
import type { ExerciseQuestion } from '~~/shared/types/conjugation'
import type { ExerciseKind, PrintOptions, Tense, Verb } from '~/composables/useChallengeBuilder'

const props = defineProps<{
  questions: ExerciseQuestion[]
  verbs: Verb[]
  tenses: Tense[]
  exerciseKind: ExerciseKind
  options: PrintOptions
}>()

const emit = defineEmits<{
  close: []
}>()

const sheetNumber = Math.floor(Math.random() * 9000) + 1000

function print() {
  window.print()
}

function escapeHtml(value: unknown) {
  const replacements: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return String(value ?? '').replace(/[&<>"']/g, character => replacements[character] ?? character)
}

function downloadWord() {
  const title = props.options.title || 'Défi de conjugaison'
  const identifier = props.options.showRandomNumber ? ` n° ${sheetNumber}` : ''
  const identity = [
    props.options.showFirstName ? 'Prénom : ____________________' : '',
    props.options.showLastName ? 'Nom : ____________________' : '',
    props.options.showDate ? 'Date : ______________' : ''
  ].filter(Boolean).map(value => `<span>${escapeHtml(value)}</span>`).join(' &nbsp; ')
  const metadata = [
    props.options.showVerbs
      ? `<p><strong>Verbes :</strong> ${escapeHtml(props.verbs.map(verb => verb.infinitif).join(', '))}</p>`
      : '',
    props.options.showTenses
      ? `<p><strong>Temps :</strong> ${escapeHtml(props.tenses.map(tense => tense.name).join(', '))}</p>`
      : ''
  ].join('')
  const questions = props.questions.map(question => (
    `<li><span>${escapeHtml(question.consigne)}</span><span class="line">&nbsp;</span></li>`
  )).join('')
  const answers = props.questions.map(question => (
    `<li><span>${escapeHtml(question.consigne)}</span><strong>${escapeHtml(question.reponsesPourCorrige.join(' ou '))}</strong></li>`
  )).join('')
  const instruction = props.exerciseKind === 'tense-identification'
    ? '<p class="instruction">Indique le mode et le temps de chaque forme conjuguée.</p>'
    : ''
  const grade = props.options.showGrade ? '<div class="grade">&nbsp;</div>' : ''

  const html = `<!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(title)}</title>
        <style>
          body{font-family:Arial,sans-serif;color:#111;margin:36pt;font-size:11pt}
          .page{page-break-after:always}.page:last-child{page-break-after:auto}
          h1{font-size:18pt;text-transform:uppercase;margin:24pt 0 14pt}
          h1 small{font-size:9pt;font-weight:normal;text-transform:none}
          .identity span{display:inline-block;margin-right:20pt;font-size:9pt}
          .grade{float:right;width:45pt;height:45pt;border:1pt solid #222}
          .instruction{padding:8pt;border:1pt solid #777}
          ol{padding-left:22pt;margin-top:22pt}li{margin:0 0 16pt;padding-left:5pt}
          .line{display:inline-block;width:220pt;margin-left:15pt;border-bottom:1pt dotted #333}
          .answers li{display:table;width:100%;border-bottom:1pt solid #ddd;padding-bottom:7pt;margin-bottom:7pt}
          .answers li span,.answers li strong{display:table-cell;width:50%}
        </style>
      </head>
      <body>
        <section class="page">
          ${grade}<div class="identity">${identity}</div>
          <h1>${escapeHtml(title)} <small>${escapeHtml(identifier)}</small></h1>
          ${metadata}${instruction}<ol>${questions}</ol>
        </section>
        <section class="page">
          <h1>${escapeHtml(title)} — corrigé <small>${escapeHtml(identifier)}</small></h1>
          <ol class="answers">${answers}</ol>
        </section>
      </body>
    </html>`

  const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const safeTitle = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '')
  link.href = url
  link.download = `${safeTitle || 'defi-conjugaison'}.doc`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <Teleport to="body">
    <div class="print-overlay" role="dialog" aria-modal="true" aria-labelledby="print-preview-title">
      <div class="print-toolbar no-print">
        <div>
          <strong id="print-preview-title">Aperçu avant impression</strong>
          <span>La fiche et son corrigé seront imprimés sur des pages séparées.</span>
        </div>
        <div>
          <button class="secondary-button" type="button" @click="emit('close')">Fermer</button>
          <button class="secondary-button" type="button" @click="downloadWord">Télécharger Word</button>
          <button class="primary-button" type="button" @click="print">Imprimer</button>
        </div>
      </div>

      <main class="print-document">
        <section class="print-sheet">
          <header class="print-sheet__header">
            <div class="student-fields">
              <span v-if="options.showFirstName">Prénom : ____________________</span>
              <span v-if="options.showLastName">Nom : ____________________</span>
              <span v-if="options.showDate">Date : ______________</span>
            </div>
            <div v-if="options.showGrade" class="grade-box" aria-label="Espace pour la note" />
            <h1>
              {{ options.title || 'Défi de conjugaison' }}
              <small v-if="options.showRandomNumber">n° {{ sheetNumber }}</small>
            </h1>
            <p v-if="options.showVerbs"><strong>Verbes :</strong> {{ verbs.map(verb => verb.infinitif).join(', ') }}</p>
            <p v-if="options.showTenses"><strong>Temps :</strong> {{ tenses.map(tense => tense.name).join(', ') }}</p>
            <p v-if="exerciseKind === 'tense-identification'" class="print-instruction">
              Indique le mode et le temps de chaque forme conjuguée.
            </p>
          </header>

          <ol class="print-questions">
            <li v-for="question in questions" :key="`${question.titre}-${question.consigne}`">
              <span>{{ question.consigne }}</span>
              <span class="answer-line" />
            </li>
          </ol>
        </section>

        <section class="print-sheet print-sheet--correction">
          <header class="print-sheet__header">
            <h1>
              {{ options.title || 'Défi de conjugaison' }} — corrigé
              <small v-if="options.showRandomNumber">n° {{ sheetNumber }}</small>
            </h1>
          </header>
          <ol class="print-questions print-questions--answers">
            <li v-for="question in questions" :key="`answer-${question.titre}-${question.consigne}`">
              <span>{{ question.consigne }}</span>
              <strong>{{ question.reponsesPourCorrige.join(' ou ') }}</strong>
            </li>
          </ol>
        </section>
      </main>
    </div>
  </Teleport>
</template>
