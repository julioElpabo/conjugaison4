import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import { verbPilot202601 } from '../shared/data/verb-pilot-2026-01.mjs'
import { verbPilot202601Part02 } from '../shared/data/verb-pilot-2026-01-part-02.mjs'
import { verbPilot202601Part03 } from '../shared/data/verb-pilot-2026-01-part-03.mjs'
import { verbPilot202601Part04 } from '../shared/data/verb-pilot-2026-01-part-04.mjs'
import { verbPilot202601Part05 } from '../shared/data/verb-pilot-2026-01-part-05.mjs'
import { isDirectScriptExecution } from './utils/direct-execution.mjs'

const CEFR_LEVELS = new Set(['A1', 'A2', 'B1', 'B2'])
const SEMANTIC_DOMAINS = new Set([
  'etat-existence', 'mouvement', 'position', 'transformation', 'manipulation', 'corps',
  'perception', 'cognition', 'communication', 'emotion', 'modalite', 'relations',
  'echange', 'creation-travail', 'nature', 'action-processus',
])
const TRANSITIVITY = new Set(['intransitif', 'transitif_direct', 'transitif_indirect'])
const DIFFICULT_DEFINITION_WORDS = /\b(absorber|acquérir|effectuer|éprouver|percevoir|susceptible)\b/iu
const UNSUITABLE_CONTENT = /\b(alcool|drogue|pornograph|sexe|suicide|tuer|vulgaire)\b/iu
const EXPLICIT_COMPLEMENT_GENDERS = new Map([
  ['ses parents', 'masculin'], ['son équipe', 'feminin'], ['les élèves', 'masculin'],
  ['ses collègues', 'masculin'], ['les enfants', 'masculin'], ['son entourage', 'masculin'],
  ['des fruits', 'masculin'], ['des légumes', 'masculin'], ['des médicaments', 'masculin'],
  ['des vêtements', 'masculin'], ['des pièces détachées', 'feminin'], ['de l’énergie', 'feminin'],
  ['des difficultés', 'feminin'], ['des changements', 'masculin'], ['des risques', 'masculin'],
  ['ses amis', 'masculin'], ['les règles', 'feminin'], ['son travail', 'masculin'],
  ['des photos', 'feminin'], ['l’équilibre', 'masculin'], ['les liens', 'masculin'],
  ['des services', 'masculin'], ['son attention', 'feminin'], ['des dépenses', 'feminin'],
  ['les difficultés', 'feminin'], ['des activités', 'feminin'], ['les escaliers', 'masculin'],
  ['des places', 'feminin'], ['les portes', 'feminin'], ['son bureau', 'masculin'],
  ['son refus', 'masculin'], ['les nouvelles règles', 'feminin'], ['son accord', 'masculin'],
  ['ses intentions', 'feminin'], ['des avertissements', 'masculin'], ['les enfants', 'masculin'],
  ['ses collègues', 'masculin'], ['son équipe', 'feminin'], ['les visiteurs', 'masculin'],
  ['les invités', 'masculin'], ['les intentions', 'feminin'], ['ses pensées', 'feminin'],
  ['des secrets', 'masculin'],
  ['les bus', 'masculin'], ['des rendez-vous', 'masculin'], ['les cours', 'masculin'],
  ['son examen', 'masculin'], ['des épisodes', 'masculin'], ['son train', 'masculin'],
  ['des bouffées d’air frais', 'feminin'], ['les parfums des fleurs', 'masculin'],
  ['des odeurs marines', 'feminin'], ['des parfums', 'masculin'], ['l’odeur du pain', 'feminin'],
  ['des odeurs de forêt', 'feminin'], ['l’air de la montagne', 'masculin'],
  ['des formulaires', 'masculin'], ['les verres', 'masculin'], ['des sacs', 'masculin'],
  ['son panier', 'masculin'], ['les cases', 'feminin'],
  ['des informations', 'feminin'], ['les causes', 'feminin'], ['des indices', 'masculin'],
  ['les réponses', 'feminin'], ['ses calculs', 'masculin'], ['les dessins', 'masculin'],
  ['des essais', 'masculin'], ['les étapes', 'feminin'], ['des étagères', 'feminin'],
  ['les panneaux', 'masculin'], ['ses camarades', 'masculin'], ['les murs', 'masculin'],
  ['ses enfants', 'masculin'], ['les participantes', 'feminin'], ['des journalistes', 'masculin'],
  ['les responsables', 'masculin'], ['des mesures', 'feminin'], ['les changements', 'masculin'],
  ['des crédits', 'masculin'], ['des élèves', 'masculin'], ['des documents', 'masculin'],
  ['les équipes', 'feminin'], ['des supporters', 'masculin'], ['des cerceaux', 'masculin'],
  ['les quilles', 'feminin'], ['des panneaux', 'masculin'], ['les buts', 'masculin'],
  ['des vitamines', 'feminin'], ['les ingrédients', 'masculin'], ['des images', 'feminin'],
  ['les consignes', 'feminin'], ['des réussites', 'feminin'], ['les vacances', 'feminin'],
  ['des retrouvailles', 'feminin'], ['les résultats', 'masculin'], ['des renseignements', 'masculin'],
  ['les documents', 'masculin'], ['des outils', 'masculin'], ['des musées', 'masculin'],
  ['les monuments', 'masculin'], ['des villages', 'masculin'], ['les jardins', 'masculin'],
  ['des messages', 'masculin'], ['les informations', 'feminin'], ['des conseils', 'masculin'],
  ['les coordonnées', 'feminin'], ['des travaux', 'masculin'], ['les vérifications', 'feminin'],
  ['des contrôles', 'masculin'], ['les mesures', 'feminin'], ['des détails', 'masculin'],
  ['les raisons', 'feminin'], ['des exemples', 'masculin'], ['les références', 'feminin'],
  ['des indices', 'masculin'], ['les différences', 'feminin'], ['des obstacles', 'masculin'],
  ['des contacts', 'masculin'], ['les faits', 'masculin'], ['des priorités', 'feminin'],
  ['les responsabilités', 'feminin'], ['des fleurs', 'feminin'], ['les murs', 'masculin'],
  ['des guirlandes', 'feminin'], ['les fenêtres', 'feminin'], ['des mouvements', 'masculin'],
  ['les opérations', 'feminin'], ['des changements', 'masculin'], ['les secours', 'masculin'],
  ['des passagers', 'masculin'], ['les véhicules', 'masculin'], ['des vélos', 'masculin'],
  ['les bagages', 'masculin'], ['ses enfants', 'masculin'], ['les traditions', 'feminin'],
  ['des proches', 'masculin'], ['les moments', 'masculin'], ['des efforts', 'masculin'],
  ['les documents', 'masculin'], ['des garanties', 'feminin'], ['des personnes', 'feminin'],
  ['les voyageurs', 'masculin'], ['des colis', 'masculin'], ['les élèves', 'masculin'],
  ['des arbres', 'masculin'], ['les bâtiments', 'masculin'], ['des barrières', 'feminin'],
  ['des véhicules', 'masculin'], ['des coureurs', 'masculin'], ['des objets', 'masculin'],
  ['les évènements', 'masculin'], ['les besoins', 'masculin'], ['des objectifs', 'masculin'],
  ['les droits', 'masculin'], ['les libertés', 'feminin'], ['des voyageurs', 'masculin'],
  ['des projets', 'masculin'], ['les plans', 'masculin'], ['les exercices', 'masculin'],
  ['des habitudes', 'feminin'], ['les recommandations', 'feminin'], ['des accès', 'masculin'],
  ['les données', 'feminin'], ['des passages', 'masculin'], ['les installations', 'feminin'],
  ['des habitants', 'masculin'], ['les visiteurs', 'masculin'], ['des déchets', 'masculin'],
  ['des textes', 'masculin'],
  ['les travaux', 'masculin'], ['les œuvres', 'feminin'], ['des résultats', 'masculin'],
  ['des amarres', 'feminin'], ['les attaches', 'feminin'], ['les parachutes', 'masculin'],
  ['des coussins', 'masculin'], ['les poches', 'feminin'], ['des paniers', 'masculin'],
  ['les tiroirs', 'masculin'], ['des employés', 'masculin'], ['les stagiaires', 'masculin'],
  ['des ingénieurs', 'masculin'], ['des économies', 'feminin'], ['les bénéfices', 'masculin'],
  ['des ressources', 'feminin'], ['les fonds disponibles', 'masculin'], ['des obstacles', 'masculin'],
  ['les montagnes', 'feminin'], ['les commerces', 'masculin'], ['des ateliers', 'masculin'],
  ['les parcs', 'masculin'], ['les cheveux', 'masculin'], ['des herbes', 'feminin'],
  ['les chaussures', 'feminin'], ['des portions', 'feminin'], ['les réserves', 'feminin'],
  ['les capacités', 'feminin'], ['des canaux', 'masculin'], ['les bassins', 'masculin'],
  ['des chenaux', 'masculin'], ['les zones portuaires', 'feminin'], ['des options', 'feminin'],
  ['les commandes', 'feminin'], ['des capteurs', 'masculin'], ['les notifications', 'feminin'],
  ['des arguments', 'masculin'], ['les critiques', 'feminin'], ['les effets', 'masculin'],
  ['des régions', 'feminin'], ['les générations', 'feminin'], ['les sons', 'masculin'],
  ['les couleurs', 'feminin'], ['les poivrons', 'masculin'], ['des champignons', 'masculin'],
  ['les aubergines', 'feminin'], ['des opérations', 'feminin'], ['des recherches', 'feminin'],
  ['les barrières', 'feminin'], ['des dessins', 'masculin'],
])

function anteposedText(text, gender, number) {
  if (number === 'pluriel') return text.replace(/^(?:des|ses|les)\s+/iu, 'les ')
  const noun = text.match(/^(?:une?|du|de la|le|la|ce|cet|cette|ma|ta|sa|son)\s+(.+)$/iu)?.[1]
    || text.match(/^(?:de\s+)?l[’'](.+)$/iu)?.[1]
    || text
  const initial = noun.normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0).toLowerCase()
  if ('aeiouy'.includes(initial)) return `l’${noun}`
  return `${gender === 'feminin' ? 'la' : 'le'} ${noun}`
}

export function validatedComplementGrammar(text) {
  const normalized = text.trim()
  const plural = /^(?:des|les|ses)\s+/iu.test(normalized)
  let gender = EXPLICIT_COMPLEMENT_GENDERS.get(normalized.toLocaleLowerCase('fr'))
  if (!gender) {
    if (/^(?:une|la|sa|ma|ta|cette|de la)\s+/iu.test(normalized)) gender = 'feminin'
    else if (/^(?:un|le|du|ce|cet)\s+/iu.test(normalized)) gender = 'masculin'
  }
  if (!gender) return null
  const number = plural ? 'pluriel' : 'singulier'
  return {
    text: anteposedText(normalized, gender, number),
    gender,
    number,
  }
}

function duplicateValues(values) {
  const seen = new Set()
  return [...new Set(values.filter(value => {
    const normalized = value.toLocaleLowerCase('fr').normalize('NFC').trim()
    if (seen.has(normalized)) return true
    seen.add(normalized)
    return false
  }))]
}

export function validatePedagogicalPilot(entries, expectedInfinitives) {
  const errors = []
  const infinitives = entries.map(entry => entry.infinitive)
  const duplicates = duplicateValues(infinitives)
  if (duplicates.length) errors.push(`Infinitifs en double : ${duplicates.join(', ')}`)
  if (entries.length !== expectedInfinitives.length) {
    errors.push(`${entries.length} entrées au lieu de ${expectedInfinitives.length}`)
  }
  if (infinitives.join('|') !== expectedInfinitives.join('|')) {
    errors.push('Le sous-lot pédagogique ne correspond pas aux premiers candidats, dans le même ordre.')
  }

  for (const entry of entries) {
    const prefix = entry.infinitive || '(infinitif absent)'
    if (entry.infinitive !== entry.infinitive?.normalize('NFC')) {
      errors.push(`${prefix} : infinitif non normalisé en NFC`)
    }
    if (!entry.definition || entry.definition.length > 180
      || !/^[A-ZÀÂÇÉÈÊËÎÏÔÙÛÜŒ]/u.test(entry.definition)
      || !/[.!?]$/u.test(entry.definition)) {
      errors.push(`${prefix} : définition FALC invalide`)
    }
    if (DIFFICULT_DEFINITION_WORDS.test(entry.definition)) {
      errors.push(`${prefix} : définition inutilement difficile`)
    }
    if (UNSUITABLE_CONTENT.test(entry.definition)) {
      errors.push(`${prefix} : définition potentiellement inadaptée`)
    }
    if (!CEFR_LEVELS.has(entry.cefr)) errors.push(`${prefix} : niveau CECRL invalide`)
    if (!Array.isArray(entry.schoolLevels) || !entry.schoolLevels.length) {
      errors.push(`${prefix} : niveau scolaire absent`)
    }
    if (!SEMANTIC_DOMAINS.has(entry.semanticDomain)) {
      errors.push(`${prefix} : domaine sémantique invalide`)
    }
    if (!/^https:\/\/www\.dictionnaire-academie\.fr\/article\/[A-Z]\d[A-Z]\d+$/u.test(entry.sourceUrl)) {
      errors.push(`${prefix} : source Académie invalide`)
    }

    const sense = entry.sense || {}
    if (!sense.title || !sense.construction || !TRANSITIVITY.has(sense.transitivity)) {
      errors.push(`${prefix} : sens principal incomplet`)
    }
    const complements = sense.complements || []
    const complementDuplicates = duplicateValues(complements)
    if (complementDuplicates.length) errors.push(`${prefix} : compléments en double`)
    if (complements.some(complement => (
      !complement.trim()
      || /[.!?]$/u.test(complement)
      || UNSUITABLE_CONTENT.test(complement)
    ))) {
      errors.push(`${prefix} : complément vide, ponctué ou inadapté`)
    }
    if (sense.complementType === 'cod') {
      if (sense.transitivity !== 'transitif_direct' || sense.preposition) {
        errors.push(`${prefix} : construction COD incohérente`)
      }
      if (complements.length !== 10) errors.push(`${prefix} : un COD validé exige 10 compléments`)
      const grammar = complements.map(validatedComplementGrammar)
      if (grammar.some(value => !value)) {
        errors.push(`${prefix} : métadonnées grammaticales COD incomplètes`)
      }
      const masculineSingular = grammar.filter(value => (
        value?.gender === 'masculin' && value.number === 'singulier'
      )).length
      if (masculineSingular > 2) {
        errors.push(`${prefix} : trop de COD masculins singuliers`)
      }
    }
    else if (sense.complementType === 'coi') {
      if (sense.transitivity !== 'transitif_indirect' || !['à', 'de'].includes(sense.preposition)) {
        errors.push(`${prefix} : construction COI incohérente`)
      }
      if (complements.length !== 10) errors.push(`${prefix} : un COI validé exige 10 compléments`)
      const expectedStarts = sense.preposition === 'à'
        ? /^(?:à |au |aux )/u
        : /^(?:de |du |des |d[’'])/u
      if (complements.some(complement => !expectedStarts.test(complement))) {
        errors.push(`${prefix} : préposition manquante dans un COI`)
      }
    }
    else if (sense.complementType !== null || complements.length) {
      errors.push(`${prefix} : compléments présents sans construction activable`)
    }

    if (entry.pronominalUse) {
      const use = entry.pronominalUse
      if (!use.infinitive.startsWith('se ') && !use.infinitive.startsWith('s’')) {
        errors.push(`${prefix} : infinitif pronominal invalide`)
      }
      if (!Array.isArray(use.allowedPersons) || !use.allowedPersons.length
        || use.allowedPersons.some(person => ![4, 5, 6, 7, 8, 9].includes(person))) {
        errors.push(`${prefix} : personnes pronominales invalides`)
      }
    }
  }
  return {
    errors,
    entryCount: entries.length,
    definitionCount: entries.filter(entry => entry.definition).length,
    complementCount: entries.reduce((total, entry) => total + entry.sense.complements.length, 0),
    pronominalUseCount: entries.filter(entry => entry.pronominalUse).length,
  }
}

function renderReport(result, entries, { title, priorityOffset }) {
  const lines = [
    `# ${title}`,
    '',
    `Rapport généré le ${new Intl.DateTimeFormat('fr-CH', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())}.`,
    '',
    '## Résumé',
    '',
    `- verbes contrôlés : ${result.entryCount} ;`,
    `- définitions FALC : ${result.definitionCount} ;`,
    `- compléments validés : ${result.complementCount} ;`,
    `- emplois pronominaux validés séparément : ${result.pronominalUseCount} ;`,
    `- erreurs bloquantes : ${result.errors.length}.`,
    '',
    'Les niveaux CECRL sont des estimations pédagogiques internes au projet.',
    '',
    '## Verbes',
    '',
    '| Priorité | Infinitif | CECRL estimé | Sens principal | Construction | Compléments |',
    '|---:|---|---|---|---|---:|',
    ...entries.map((entry, index) => (
      `| ${index + 1 + priorityOffset} | ${entry.infinitive} | ${entry.cefr} | ${entry.sense.title} | ${entry.sense.construction} | ${entry.sense.complements.length} |`
    )),
    '',
    '## Résultat',
    '',
    result.errors.length
      ? result.errors.map(error => `- ${error}`).join('\n')
      : 'Le sous-lot satisfait tous les contrôles automatiques et peut être inclus dans la simulation.',
    '',
  ]
  return `${lines.join('\n')}\n`
}

export async function runPedagogicalValidation({
  candidatePath,
  outputPath,
  jsonOutputPath,
  entries = verbPilot202601,
  candidateOffset = 0,
  lot = 'verbs-frequency-pilot-2026-01-part-01',
  title = 'Validation pédagogique du premier sous-lot',
}) {
  const source = JSON.parse(await readFile(candidatePath, 'utf8'))
  const expected = source.candidates
    .slice(candidateOffset, candidateOffset + entries.length)
    .map(candidate => candidate.lemma)
  const result = validatePedagogicalPilot(entries, expected)
  const json = {
    generatedAt: new Date().toISOString(),
    lot,
    ...result,
    entries,
  }
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, renderReport(result, entries, {
    title,
    priorityOffset: candidateOffset,
  }), 'utf8')
  await mkdir(dirname(jsonOutputPath), { recursive: true })
  await writeFile(jsonOutputPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8')
  if (result.errors.length) throw new Error(result.errors.join('\n'))
  return json
}

async function main() {
  const candidatePath = resolve('reports/missing-french-verbs-morphalou.json')
  const batches = [
    {
      entries: verbPilot202601,
      candidateOffset: 0,
      lot: 'verbs-frequency-pilot-2026-01-part-01',
      title: 'Validation pédagogique du premier sous-lot',
      outputPath: resolve('reports/verb-pilot-pedagogy-part-01.md'),
      jsonOutputPath: resolve('reports/verb-pilot-pedagogy-part-01.json'),
    },
    {
      entries: verbPilot202601Part02,
      candidateOffset: 20,
      lot: 'verbs-frequency-pilot-2026-01-part-02',
      title: 'Validation pédagogique du deuxième sous-lot',
      outputPath: resolve('reports/verb-pilot-pedagogy-part-02.md'),
      jsonOutputPath: resolve('reports/verb-pilot-pedagogy-part-02.json'),
    },
    {
      entries: verbPilot202601Part03,
      candidateOffset: 40,
      lot: 'verbs-frequency-pilot-2026-01-part-03',
      title: 'Validation pédagogique du troisième sous-lot',
      outputPath: resolve('reports/verb-pilot-pedagogy-part-03.md'),
      jsonOutputPath: resolve('reports/verb-pilot-pedagogy-part-03.json'),
    },
    {
      entries: verbPilot202601Part04,
      candidateOffset: 60,
      lot: 'verbs-frequency-pilot-2026-01-part-04',
      title: 'Validation pédagogique du quatrième sous-lot',
      outputPath: resolve('reports/verb-pilot-pedagogy-part-04.md'),
      jsonOutputPath: resolve('reports/verb-pilot-pedagogy-part-04.json'),
    },
    {
      entries: verbPilot202601Part05,
      candidateOffset: 80,
      lot: 'verbs-frequency-pilot-2026-01-part-05',
      title: 'Validation pédagogique du cinquième sous-lot',
      outputPath: resolve('reports/verb-pilot-pedagogy-part-05.md'),
      jsonOutputPath: resolve('reports/verb-pilot-pedagogy-part-05.json'),
    },
  ]
  for (const batch of batches) {
    const result = await runPedagogicalValidation({ candidatePath, ...batch })
    console.log(
      `${batch.lot} : ${result.entryCount} verbes, ${result.definitionCount} définitions, `
      + `${result.complementCount} compléments et ${result.pronominalUseCount} emplois pronominaux validés.`,
    )
    console.log(`Rapports : ${batch.outputPath} et ${batch.jsonOutputPath}`)
  }
}

if (isDirectScriptExecution(import.meta.url, 'validate-verb-pilot-pedagogy.mjs')) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
