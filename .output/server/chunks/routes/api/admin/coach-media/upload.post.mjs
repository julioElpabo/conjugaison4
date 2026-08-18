import { d as defineEventHandler, z as readMultipartFormData, c as createError } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'mysql2/promise';
import 'node:url';

const ALLOWED = /* @__PURE__ */ new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/gif", ".gif"],
  ["image/webp", ".webp"],
  ["video/mp4", ".mp4"],
  ["video/webm", ".webm"]
]);
const upload_post = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const parts = await readMultipartFormData(event);
  const file = parts == null ? void 0 : parts.find((part) => part.name === "file" && part.filename);
  if (!file || !file.type || !ALLOWED.has(file.type) || file.data.length > 12 * 1024 * 1024) {
    throw createError({ statusCode: 400, statusMessage: "Fichier invalide ou sup\xE9rieur \xE0 12 Mo" });
  }
  const extension = ALLOWED.get(file.type) || extname(file.filename || "");
  const filename = `${randomUUID()}${extension}`;
  const directory = join(process.cwd(), "public", "coach-media", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, filename), file.data, { flag: "wx" });
  return {
    path: `/coach-media/uploads/${filename}`,
    size: file.data.length,
    mediaType: file.type.startsWith("video/") ? "video" : file.type === "image/gif" || file.type === "image/webp" ? "animation" : "image"
  };
});

export { upload_post as default };
//# sourceMappingURL=upload.post.mjs.map
