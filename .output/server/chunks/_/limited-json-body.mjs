import { x as getHeader, c as createError } from '../nitro/nitro.mjs';

function payloadTooLarge(maxBytes) {
  throw createError({
    statusCode: 413,
    statusMessage: "Payload Too Large",
    message: `La taille maximale autoris\xE9e est de ${Math.ceil(maxBytes / 1024)} Ko.`
  });
}
async function readLimitedJsonBody(event, maxBytes) {
  var _a, _b;
  const contentType = (_b = (_a = getHeader(event, "content-type")) == null ? void 0 : _a.split(";", 1)[0]) == null ? void 0 : _b.trim().toLocaleLowerCase();
  if (contentType !== "application/json") {
    throw createError({
      statusCode: 415,
      statusMessage: "Le corps de la requ\xEAte doit \xEAtre au format JSON"
    });
  }
  const contentLength = Number.parseInt(getHeader(event, "content-length") || "", 10);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) payloadTooLarge(maxBytes);
  const chunks = [];
  let size = 0;
  const request = event.node.req;
  const iterator = request.iterator({ destroyOnReturn: false });
  for await (const rawChunk of iterator) {
    const chunk = Buffer.isBuffer(rawChunk) ? rawChunk : Buffer.from(rawChunk);
    size += chunk.length;
    if (size > maxBytes) {
      request.resume();
      payloadTooLarge(maxBytes);
    }
    chunks.push(chunk);
  }
  if (size === 0) {
    throw createError({ statusCode: 400, statusMessage: "Corps JSON manquant" });
  }
  try {
    return JSON.parse(Buffer.concat(chunks, size).toString("utf8"));
  } catch {
    throw createError({ statusCode: 400, statusMessage: "Corps JSON invalide" });
  }
}

export { readLimitedJsonBody as r };
//# sourceMappingURL=limited-json-body.mjs.map
