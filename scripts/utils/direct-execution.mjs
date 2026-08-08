import { basename, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

/**
 * Nitro regroupe les scripts importés dans son propre fichier d'entrée. Dans ce
 * contexte, comparer seulement import.meta.url à process.argv[1] ferait croire
 * au script importé qu'il a été lancé directement.
 */
export function isDirectScriptExecution(importMetaUrl, scriptFilename, argvEntry = process.argv[1]) {
  if (!argvEntry || basename(argvEntry) !== scriptFilename) return false
  return importMetaUrl === pathToFileURL(resolve(argvEntry)).href
}
