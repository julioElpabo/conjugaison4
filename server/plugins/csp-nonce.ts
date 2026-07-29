export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('render:html', (html, { event }) => {
    const nonce = event.context.cspNonce
    if (typeof nonce !== 'string' || !nonce) return

    const addNonce = (part: string) => part.replace(
      /<script(?![^>]*\snonce=)/gu,
      `<script nonce="${nonce}"`,
    )
    const stamp = (parts: string[]) => {
      for (let index = 0; index < parts.length; index += 1) {
        parts[index] = addNonce(parts[index]!)
      }
    }

    stamp(html.head)
    stamp(html.bodyPrepend)
    stamp(html.body)
    stamp(html.bodyAppend)
  })
})
