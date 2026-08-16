import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import type { ClassicSpeechPurpose } from './classic-speech-token'
import { useDatabase } from '../utils/database'

const MIME_TYPE = 'audio/mpeg'
const OUTPUT_FORMAT = 'audio-24khz-48kbitrate-mono-mp3'
const SAFE_MONTHLY_CHARACTER_LIMIT = 480_000
const ALLOWED_VOICES = new Set([
  'fr-FR-VivienneMultilingualNeural',
  'fr-FR-YvetteNeural',
  'fr-FR-HenriNeural',
  'fr-FR-JeromeNeural',
  'fr-CH-ArianeNeural',
  'fr-CH-FabriceNeural',
])
const GENDER_VOICES = {
  female: 'fr-FR-YvetteNeural',
  male: 'fr-FR-JeromeNeural',
} as const

export type AzureSpeechVoiceGender = keyof typeof GENDER_VOICES

interface CacheRow extends RowDataPacket {
  audio: Buffer | null
}

interface CacheFileRow extends RowDataPacket {
  cacheKey: string
  byteSize: number
}

interface CacheSizeRow extends RowDataPacket {
  byteSize: string | number | null
}

export interface AzureSpeechPayload {
  purpose: ClassicSpeechPurpose | 'coach-message' | 'help-message' | 'help-conjugation' | 'definition'
  segments: string[]
}

function xml(value: string) {
  return value.replace(/&/gu, '&amp;').replace(/</gu, '&lt;').replace(/>/gu, '&gt;').replace(/"/gu, '&quot;').replace(/'/gu, '&apos;')
}

export function classicSpeechSsml(payload: AzureSpeechPayload, voice: string) {
  const pause = payload.purpose === 'question' ? 520 : 420
  const segmented = payload.segments.map(xml).join(`<break time="${pause}ms"/>`)
  const body = payload.purpose === 'answer'
    ? `<prosody rate="-8%">${segmented}</prosody><break time="700ms"/><prosody rate="-2%"><s>${xml(payload.segments.join(' '))}</s></prosody>`
    : payload.purpose === 'definition'
      ? `<prosody rate="-25%"><s>${xml(payload.segments.filter(Boolean).join(' '))}</s></prosody>`
    : payload.purpose === 'help-conjugation'
      ? `<prosody rate="-18%">${payload.segments.map(xml).join('<break time="600ms"/>')}</prosody>`
    : payload.purpose === 'help-message'
      ? `<prosody rate="-22%"><s>${xml(payload.segments.join(' '))}</s></prosody>`
    : payload.purpose === 'coach-message'
      ? `<prosody rate="-3%"><s>${xml(payload.segments.join(' '))}</s></prosody>`
      : `<prosody rate="-8%">${segmented}</prosody>`
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="fr-CH"><voice name="${voice}">${body}</voice></speak>`
}

function classicSpeechCharacterCount(payload: AzureSpeechPayload) {
  const phraseLength = payload.segments.join(' ').length
  return payload.purpose === 'answer' ? phraseLength * 2 : phraseLength
}

function speechConfiguration() {
  const config = useRuntimeConfig()
  const voice = String(config.azureSpeechClassicVoice || 'fr-FR-VivienneMultilingualNeural')
  if (!ALLOWED_VOICES.has(voice)) throw new Error(`Voix Azure non autorisée : ${voice}`)
  const region = String(config.azureSpeechRegion || 'switzerlandnorth').trim().toLocaleLowerCase('en')
  return {
    key: String(config.azureSpeechKey || ''),
    secondaryKey: String(config.azureSpeechKeySecondary || ''),
    region,
    voice,
    url: `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
  }
}

export function azureSpeechVoice(defaultVoice: string, gender?: AzureSpeechVoiceGender) {
  return gender ? GENDER_VOICES[gender] : defaultVoice
}

function cacheKey(payload: AzureSpeechPayload, voice: string) {
  const version = payload.purpose === 'coach-message' ? 2 : payload.purpose === 'definition' ? 4 : 3
  return createHash('sha256').update(JSON.stringify({ v: version, voice, purpose: payload.purpose, segments: payload.segments })).digest('hex')
}

function monthKey() {
  return new Date().toISOString().slice(0, 7)
}

function fileCacheConfiguration() {
  const config = useRuntimeConfig()
  const configuredDirectory = String(config.azureSpeechCacheDir || '../conjugaison4-cache-audio').trim()
  const configuredMaxGb = Number(config.azureSpeechCacheMaxGb || 2)
  if (!configuredDirectory) throw new Error('AZURE_SPEECH_CACHE_DIR est vide.')
  if (!Number.isFinite(configuredMaxGb) || configuredMaxGb <= 0) throw new Error('AZURE_SPEECH_CACHE_MAX_GB doit être un nombre positif.')
  return {
    directory: path.resolve(process.cwd(), configuredDirectory),
    maxBytes: Math.floor(configuredMaxGb * 1024 * 1024 * 1024),
    maxGb: configuredMaxGb,
  }
}

function audioFilePath(key: string) {
  const { directory } = fileCacheConfiguration()
  return path.join(directory, key.slice(0, 2), `${key}.mp3`)
}

function isMp3(audio: Buffer) {
  return audio.length >= 3 && (
    audio.subarray(0, 3).toString('ascii') === 'ID3'
    || (audio[0] === 0xff && (audio[1]! & 0xe0) === 0xe0)
  )
}

async function removeFile(file: string) {
  await unlink(file).catch(error => {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  })
}

async function writeAudioFile(key: string, audio: Buffer) {
  if (!isMp3(audio)) throw new Error('Azure Speech a retourné un fichier MP3 invalide.')
  const file = audioFilePath(key)
  await mkdir(path.dirname(file), { recursive: true })
  const temporaryFile = `${file}.${process.pid}.${randomUUID()}.tmp`
  await writeFile(temporaryFile, audio, { flag: 'wx' })
  try {
    await rename(temporaryFile, file)
  } catch (error) {
    await removeFile(temporaryFile)
    throw error
  }
  return file
}

async function ensureFileCacheCapacity(connection: PoolConnection, incomingBytes: number) {
  const { maxBytes } = fileCacheConfiguration()
  if (incomingBytes > maxBytes) throw new Error('Le fichier audio dépasse à lui seul la taille maximale du cache.')
  const [[lock]] = await connection.query<RowDataPacket[]>('SELECT GET_LOCK(?, 8) AS acquired', ['speech:file-cache-prune'])
  if (Number(lock?.acquired) !== 1) throw new Error('Le nettoyage du cache audio est momentanément occupé.')
  try {
    const [[size]] = await connection.query<CacheSizeRow[]>(`
      SELECT COALESCE(SUM(byte_size), 0) AS byteSize
      FROM azure_speech_cache
      WHERE audio_data IS NULL
    `)
    let occupiedBytes = Number(size?.byteSize || 0)
    if (occupiedBytes + incomingBytes <= maxBytes) return
    const [candidates] = await connection.query<CacheFileRow[]>(`
      SELECT cache_key AS cacheKey, byte_size AS byteSize
      FROM azure_speech_cache
      WHERE audio_data IS NULL
      ORDER BY last_accessed_at ASC, created_at ASC
    `)
    for (const candidate of candidates) {
      await removeFile(audioFilePath(candidate.cacheKey))
      await connection.execute('DELETE FROM azure_speech_cache WHERE cache_key=? AND audio_data IS NULL', [candidate.cacheKey])
      occupiedBytes -= Number(candidate.byteSize)
      if (occupiedBytes + incomingBytes <= maxBytes) break
    }
    if (occupiedBytes + incomingBytes > maxBytes) throw new Error('La limite du cache audio ne permet pas d’enregistrer ce fichier.')
  } finally {
    await connection.query('SELECT RELEASE_LOCK(?)', ['speech:file-cache-prune']).catch(() => undefined)
  }
}

async function recordCacheHit(key: string) {
  const database = useDatabase()
  const [updated] = await database.execute<ResultSetHeader>('UPDATE azure_speech_cache SET hit_count=hit_count+1, last_accessed_at=CURRENT_TIMESTAMP WHERE cache_key=?', [key])
  if (updated.affectedRows !== 1) return false
  await database.execute(`
    INSERT INTO azure_speech_usage (cycle_key, cache_hit_count) VALUES (?, 1)
    ON DUPLICATE KEY UPDATE cache_hit_count=cache_hit_count+1
  `, [monthKey()])
  return true
}

async function migrateLegacyBlob(key: string, audio: Buffer) {
  const database = useDatabase()
  const connection = await database.getConnection()
  const lockName = `speech:${key.slice(0, 56)}`
  let file = ''
  try {
    const [[lock]] = await connection.query<RowDataPacket[]>('SELECT GET_LOCK(?, 8) AS acquired', [lockName])
    if (Number(lock?.acquired) !== 1) return
    const [rows] = await connection.execute<CacheRow[]>('SELECT audio_data AS audio FROM azure_speech_cache WHERE cache_key=? LIMIT 1', [key])
    const currentAudio = rows[0]?.audio ? Buffer.from(rows[0].audio) : null
    if (!currentAudio) return
    await ensureFileCacheCapacity(connection, currentAudio.length)
    file = await writeAudioFile(key, currentAudio)
    await connection.execute('UPDATE azure_speech_cache SET audio_data=NULL, byte_size=? WHERE cache_key=?', [currentAudio.length, key])
  } catch (error) {
    if (file) await removeFile(file)
    console.warn('[speech] Un ancien audio reste provisoirement stocké en base.', error)
  } finally {
    await connection.query('SELECT RELEASE_LOCK(?)', [lockName]).catch(() => undefined)
    connection.release()
  }
}

async function cachedAudio(key: string) {
  const database = useDatabase()
  const file = audioFilePath(key)
  try {
    const audio = await readFile(file)
    if (!isMp3(audio)) {
      await removeFile(file)
      await database.execute('DELETE FROM azure_speech_cache WHERE cache_key=? AND audio_data IS NULL', [key])
      return null
    }
    if (!await recordCacheHit(key)) {
      await removeFile(file)
      return null
    }
    return audio
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
  const [rows] = await database.execute<CacheRow[]>('SELECT audio_data AS audio FROM azure_speech_cache WHERE cache_key=? LIMIT 1', [key])
  const audio = rows[0]?.audio
  if (!audio) {
    if (rows.length) await database.execute('DELETE FROM azure_speech_cache WHERE cache_key=? AND audio_data IS NULL', [key])
    return null
  }
  const legacyAudio = Buffer.from(audio)
  if (!isMp3(legacyAudio)) return null
  await migrateLegacyBlob(key, legacyAudio)
  await recordCacheHit(key)
  return legacyAudio
}

export async function prepareSpeechFileCache() {
  const { directory, maxGb } = fileCacheConfiguration()
  await mkdir(directory, { recursive: true })
  console.info(`[speech] Cache fichier : ${directory} (maximum ${maxGb} Go).`)
}

async function reserveCharacters(connection: PoolConnection, count: number) {
  await connection.execute('INSERT IGNORE INTO azure_speech_usage (cycle_key) VALUES (?)', [monthKey()])
  const [result] = await connection.execute<ResultSetHeader>(`
    UPDATE azure_speech_usage
    SET character_count=character_count+?, generation_count=generation_count+1
    WHERE cycle_key=? AND character_count+? <= ?
  `, [count, monthKey(), count, SAFE_MONTHLY_CHARACTER_LIMIT])
  return result.affectedRows === 1
}

async function releaseCharacters(connection: PoolConnection, count: number) {
  await connection.execute(`
    UPDATE azure_speech_usage
    SET character_count=GREATEST(0, character_count-?), generation_count=GREATEST(0, generation_count-1)
    WHERE cycle_key=?
  `, [count, monthKey()])
}

async function callAzure(ssml: string, keys: string[], url: string) {
  let response: Response | undefined
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const activeKey = response && [401, 403].includes(response.status) && keys[1] ? keys[1] : keys[0]
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': activeKey!,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': OUTPUT_FORMAT,
        'User-Agent': 'tatitotu-classic-exercise',
      },
      body: ssml,
      signal: AbortSignal.timeout(12_000),
    })
    if ([401, 403].includes(response.status) && keys[1] && activeKey === keys[0]) continue
    if (response.status !== 429 || attempt >= 1) break
    await new Promise(resolve => setTimeout(resolve, 650))
  }
  if (!response?.ok) throw new Error(`Azure Speech a répondu ${response?.status || 'sans statut'}.`)
  return Buffer.from(await response.arrayBuffer())
}

export async function synthesizeClassicSpeech(payload: AzureSpeechPayload, voiceGender?: AzureSpeechVoiceGender) {
  const config = speechConfiguration()
  const voice = azureSpeechVoice(config.voice, voiceGender)
  const key = cacheKey(payload, voice)
  const existing = await cachedAudio(key)
  if (existing) return { audio: existing, mimeType: MIME_TYPE, cached: true, voice }
  if (!config.key) throw createError({ statusCode: 503, statusMessage: 'Lecture audio indisponible' })

  const database = useDatabase()
  const connection = await database.getConnection()
  const lockName = `speech:${key.slice(0, 56)}`
  let reserved = false
  let azureConsumedCharacters = false
  try {
    const [[lock]] = await connection.query<RowDataPacket[]>('SELECT GET_LOCK(?, 8) AS acquired', [lockName])
    if (Number(lock?.acquired) !== 1) throw createError({ statusCode: 503, statusMessage: 'Lecture audio momentanément occupée' })
    const afterLock = await cachedAudio(key)
    if (afterLock) return { audio: afterLock, mimeType: MIME_TYPE, cached: true, voice }

    const characterCount = classicSpeechCharacterCount(payload)
    reserved = await reserveCharacters(connection, characterCount)
    if (!reserved) throw createError({ statusCode: 503, statusMessage: 'Quota mensuel de lecture audio atteint' })
    const audio = await callAzure(classicSpeechSsml(payload, voice), [config.key, config.secondaryKey].filter(Boolean), config.url)
    azureConsumedCharacters = true
    await ensureFileCacheCapacity(connection, audio.length)
    const file = await writeAudioFile(key, audio)
    try {
      await connection.execute(`
        INSERT INTO azure_speech_cache
          (cache_key, voice_id, purpose, character_count, mime_type, audio_data, byte_size)
        VALUES (?, ?, ?, ?, ?, NULL, ?)
        ON DUPLICATE KEY UPDATE
          voice_id=VALUES(voice_id), purpose=VALUES(purpose), character_count=VALUES(character_count),
          mime_type=VALUES(mime_type), audio_data=NULL, byte_size=VALUES(byte_size),
          last_accessed_at=CURRENT_TIMESTAMP
      `, [key, voice, payload.purpose, characterCount, MIME_TYPE, audio.length])
    } catch (error) {
      await removeFile(file)
      throw error
    }
    return { audio, mimeType: MIME_TYPE, cached: false, voice }
  } catch (error) {
    if (reserved && !azureConsumedCharacters) await releaseCharacters(connection, classicSpeechCharacterCount(payload))
    throw error
  } finally {
    await connection.query('SELECT RELEASE_LOCK(?)', [lockName]).catch(() => undefined)
    connection.release()
  }
}
