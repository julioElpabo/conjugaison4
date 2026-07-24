import type { H3Event } from 'h3'

function payloadTooLarge(maxBytes: number): never {
  throw createError({
    statusCode: 413,
    statusMessage: 'Payload Too Large',
    message: `La taille maximale autorisée est de ${Math.ceil(maxBytes / 1024)} Ko.`,
  })
}

export async function readLimitedJsonBody<T>(event: H3Event, maxBytes: number): Promise<T> {
  const contentType = getHeader(event, 'content-type')?.split(';', 1)[0]?.trim().toLocaleLowerCase()
  if (contentType !== 'application/json') {
    throw createError({
      statusCode: 415,
      statusMessage: 'Le corps de la requête doit être au format JSON',
    })
  }

  const contentLength = Number.parseInt(getHeader(event, 'content-length') || '', 10)
  if (Number.isFinite(contentLength) && contentLength > maxBytes) payloadTooLarge(maxBytes)

  const chunks: Buffer[] = []
  let size = 0
  const request = event.node.req
  const iterator = request.iterator({ destroyOnReturn: false })
  for await (const rawChunk of iterator) {
    const chunk = Buffer.isBuffer(rawChunk) ? rawChunk : Buffer.from(rawChunk)
    size += chunk.length
    if (size > maxBytes) {
      request.resume()
      payloadTooLarge(maxBytes)
    }
    chunks.push(chunk)
  }

  if (size === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Corps JSON manquant' })
  }

  try {
    return JSON.parse(Buffer.concat(chunks, size).toString('utf8')) as T
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Corps JSON invalide' })
  }
}
