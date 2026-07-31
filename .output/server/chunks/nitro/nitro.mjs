import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import http, { Server as Server$1 } from 'node:http';
import https, { Server } from 'node:https';
import { EventEmitter } from 'node:events';
import { Buffer as Buffer$1 } from 'node:buffer';
import { promises, existsSync } from 'node:fs';
import { resolve as resolve$1, dirname as dirname$1, join } from 'node:path';
import { createHash, randomBytes } from 'node:crypto';
import mysql from 'mysql2/promise';
import { readFile as readFile$1, mkdir, writeFile as writeFile$1 } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
const ENC_ENC_SLASH_RE = /%252f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function encodePath(text) {
  return encode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F").replace(ENC_ENC_SLASH_RE, "%2F").replace(AMPERSAND_RE, "%26").replace(PLUS_RE, "%2B");
}
function decode$1(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode$1(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const PROTOCOL_SCRIPT_RE = /^[\s\0]*(blob|data|javascript|vbscript):$/i;
const TRAILING_SLASH_RE = /\/$|\/\?|\/#/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function isScriptProtocol(protocol) {
  return !!protocol && PROTOCOL_SCRIPT_RE.test(protocol);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/");
  }
  return TRAILING_SLASH_RE.test(input);
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
  if (!hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
  }
  const [s0, ...s] = path.split("?");
  const cleanPath = s0.endsWith("/") ? s0.slice(0, -1) : s0;
  return (cleanPath || "/") + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/") ? input : input + "/";
  }
  if (hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
    if (!path) {
      return fragment;
    }
  }
  const [s0, ...s] = path.split("?");
  return s0 + "/" + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    const nextChar = input[_base.length];
    if (!nextChar || nextChar === "/" || nextChar === "?") {
      return input;
    }
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const nextChar = input[_base.length];
  if (nextChar && nextChar !== "/" && nextChar !== "?") {
    return input;
  }
  const trimmed = input.slice(_base.length).replace(/^\/+/, "");
  return "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery$1(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}
function joinRelativeURL(..._input) {
  const JOIN_SEGMENT_SPLIT_RE = /\/(?!\/)/;
  const input = _input.filter(Boolean);
  const segments = [];
  let segmentsDepth = 0;
  for (const i of input) {
    if (!i || i === "/") {
      continue;
    }
    for (const [sindex, s] of i.split(JOIN_SEGMENT_SPLIT_RE).entries()) {
      if (!s || s === ".") {
        continue;
      }
      if (s === "..") {
        if (segments.length === 1 && hasProtocol(segments[0])) {
          continue;
        }
        segments.pop();
        segmentsDepth--;
        continue;
      }
      if (sindex === 1 && segments[segments.length - 1]?.endsWith(":/")) {
        segments[segments.length - 1] += "/" + s;
        continue;
      }
      segments.push(s);
      segmentsDepth++;
    }
  }
  let url = segments.join("/");
  if (segmentsDepth >= 0) {
    if (input[0]?.startsWith("/") && !url.startsWith("/")) {
      url = "/" + url;
    } else if (input[0]?.startsWith("./") && !url.startsWith("./")) {
      url = "./" + url;
    }
  } else {
    url = "../".repeat(-1 * segmentsDepth) + url;
  }
  if (input[input.length - 1]?.endsWith("/") && !url.endsWith("/")) {
    url += "/";
  }
  return url;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

const NullObject = /* @__PURE__ */ (() => {
  const C = function() {
  };
  C.prototype = /* @__PURE__ */ Object.create(null);
  return C;
})();
function parse$1(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  const obj = new NullObject();
  const opt = {};
  const dec = opt.decode || decode;
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (opt?.filter && !opt?.filter(key)) {
      index = endIdx + 1;
      continue;
    }
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.codePointAt(0) === 34) {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode(val, dec);
    }
    index = endIdx + 1;
  }
  return obj;
}
function decode(str) {
  return str.includes("%") ? decodeURIComponent(str) : str;
}
function tryDecode(str, decode2) {
  try {
    return decode2(str);
  } catch {
    return str;
  }
}

const fieldContentRegExp = /^[\u0009\u0020-\u007E\u0080-\u00FF]+$/;
function serialize$2(name, value, options) {
  const opt = options || {};
  const enc = opt.encode || encodeURIComponent;
  if (typeof enc !== "function") {
    throw new TypeError("option encode is invalid");
  }
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError("argument name is invalid");
  }
  const encodedValue = enc(value);
  if (encodedValue && !fieldContentRegExp.test(encodedValue)) {
    throw new TypeError("argument val is invalid");
  }
  let str = name + "=" + encodedValue;
  if (void 0 !== opt.maxAge && opt.maxAge !== null) {
    const maxAge = opt.maxAge - 0;
    if (Number.isNaN(maxAge) || !Number.isFinite(maxAge)) {
      throw new TypeError("option maxAge is invalid");
    }
    str += "; Max-Age=" + Math.floor(maxAge);
  }
  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError("option domain is invalid");
    }
    str += "; Domain=" + opt.domain;
  }
  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError("option path is invalid");
    }
    str += "; Path=" + opt.path;
  }
  if (opt.expires) {
    if (!isDate(opt.expires) || Number.isNaN(opt.expires.valueOf())) {
      throw new TypeError("option expires is invalid");
    }
    str += "; Expires=" + opt.expires.toUTCString();
  }
  if (opt.httpOnly) {
    str += "; HttpOnly";
  }
  if (opt.secure) {
    str += "; Secure";
  }
  if (opt.priority) {
    const priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
    switch (priority) {
      case "low": {
        str += "; Priority=Low";
        break;
      }
      case "medium": {
        str += "; Priority=Medium";
        break;
      }
      case "high": {
        str += "; Priority=High";
        break;
      }
      default: {
        throw new TypeError("option priority is invalid");
      }
    }
  }
  if (opt.sameSite) {
    const sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
    switch (sameSite) {
      case true: {
        str += "; SameSite=Strict";
        break;
      }
      case "lax": {
        str += "; SameSite=Lax";
        break;
      }
      case "strict": {
        str += "; SameSite=Strict";
        break;
      }
      case "none": {
        str += "; SameSite=None";
        break;
      }
      default: {
        throw new TypeError("option sameSite is invalid");
      }
    }
  }
  if (opt.partitioned) {
    str += "; Partitioned";
  }
  return str;
}
function isDate(val) {
  return Object.prototype.toString.call(val) === "[object Date]" || val instanceof Date;
}

function parseSetCookie(setCookieValue, options) {
  const parts = (setCookieValue || "").split(";").filter((str) => typeof str === "string" && !!str.trim());
  const nameValuePairStr = parts.shift() || "";
  const parsed = _parseNameValuePair(nameValuePairStr);
  const name = parsed.name;
  let value = parsed.value;
  try {
    value = options?.decode === false ? value : (options?.decode || decodeURIComponent)(value);
  } catch {
  }
  const cookie = {
    name,
    value
  };
  for (const part of parts) {
    const sides = part.split("=");
    const partKey = (sides.shift() || "").trimStart().toLowerCase();
    const partValue = sides.join("=");
    switch (partKey) {
      case "expires": {
        cookie.expires = new Date(partValue);
        break;
      }
      case "max-age": {
        cookie.maxAge = Number.parseInt(partValue, 10);
        break;
      }
      case "secure": {
        cookie.secure = true;
        break;
      }
      case "httponly": {
        cookie.httpOnly = true;
        break;
      }
      case "samesite": {
        cookie.sameSite = partValue;
        break;
      }
      default: {
        cookie[partKey] = partValue;
      }
    }
  }
  return cookie;
}
function _parseNameValuePair(nameValuePairStr) {
  let name = "";
  let value = "";
  const nameValueArr = nameValuePairStr.split("=");
  if (nameValueArr.length > 1) {
    name = nameValueArr.shift();
    value = nameValueArr.join("=");
  } else {
    value = nameValuePairStr;
  }
  return { name, value };
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = { ...defaults };
  for (const key of Object.keys(baseObject)) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function o(n){throw new Error(`${n} is not implemented yet!`)}let i$1 = class i extends EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o("Readable.asyncIterator")}iterator(e){throw o("Readable.iterator")}map(e,t){throw o("Readable.map")}filter(e,t){throw o("Readable.filter")}forEach(e,t){throw o("Readable.forEach")}reduce(e,t,r){throw o("Readable.reduce")}find(e,t){throw o("Readable.find")}findIndex(e,t){throw o("Readable.findIndex")}some(e,t){throw o("Readable.some")}toArray(e){throw o("Readable.toArray")}every(e,t){throw o("Readable.every")}flatMap(e,t){throw o("Readable.flatMap")}drop(e,t){throw o("Readable.drop")}take(e,t){throw o("Readable.take")}asIndexedPairs(e){throw o("Readable.asIndexedPairs")}};let l$1 = class l extends EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;writableAborted=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer$1.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer$1.from(e,t||this._encoding||"utf8"):e;this._data=Buffer$1.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u,s);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return Promise.resolve()}};const c$1=class c{allowHalfOpen=true;_destroy;constructor(e=new i$1,t=new l$1){Object.assign(this,e),Object.assign(this,t),this._destroy=m(e._destroy,t._destroy);}};function _(){return Object.assign(c$1.prototype,i$1.prototype),Object.assign(c$1.prototype,l$1.prototype),c$1}function m(...n){return function(...e){for(const t of n)t(...e);}}const g=_();class A extends g{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}}class y extends i$1{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p(this.headers)}get trailersDistinct(){return p(this.trailers)}}function p(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}class w extends l$1{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}}const E=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R(n={}){const e=new E,t=Array.isArray(n)||H(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H(n){return typeof n?.entries=="function"}function v(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const S=new Set([101,204,205,304]);async function b(n,e){const t=new y,r=new w(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(S.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function C(n,e,t={}){try{const r=await b(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:v(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

class H3Error extends Error {
  static __h3_error__ = true;
  statusCode = 500;
  fatal = false;
  unhandled = false;
  statusMessage;
  data;
  cause;
  constructor(message, opts = {}) {
    super(message, opts);
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}

function parse(multipartBodyBuffer, boundary) {
  let lastline = "";
  let state = 0 /* INIT */;
  let buffer = [];
  const allParts = [];
  let currentPartHeaders = [];
  for (let i = 0; i < multipartBodyBuffer.length; i++) {
    const prevByte = i > 0 ? multipartBodyBuffer[i - 1] : null;
    const currByte = multipartBodyBuffer[i];
    const newLineChar = currByte === 10 || currByte === 13;
    if (!newLineChar) {
      lastline += String.fromCodePoint(currByte);
    }
    const newLineDetected = currByte === 10 && prevByte === 13;
    if (0 /* INIT */ === state && newLineDetected) {
      if ("--" + boundary === lastline) {
        state = 1 /* READING_HEADERS */;
      }
      lastline = "";
    } else if (1 /* READING_HEADERS */ === state && newLineDetected) {
      if (lastline.length > 0) {
        const i2 = lastline.indexOf(":");
        if (i2 > 0) {
          const name = lastline.slice(0, i2).toLowerCase();
          const value = lastline.slice(i2 + 1).trim();
          currentPartHeaders.push([name, value]);
        }
      } else {
        state = 2 /* READING_DATA */;
        buffer = [];
      }
      lastline = "";
    } else if (2 /* READING_DATA */ === state) {
      if (lastline.length > boundary.length + 4) {
        lastline = "";
      }
      if ("--" + boundary === lastline) {
        const j = buffer.length - lastline.length;
        const part = buffer.slice(0, j - 1);
        allParts.push(process$1(part, currentPartHeaders));
        buffer = [];
        currentPartHeaders = [];
        lastline = "";
        state = 3 /* READING_PART_SEPARATOR */;
      } else {
        buffer.push(currByte);
      }
      if (newLineDetected) {
        lastline = "";
      }
    } else if (3 /* READING_PART_SEPARATOR */ === state && newLineDetected) {
      state = 1 /* READING_HEADERS */;
    }
  }
  return allParts;
}
function process$1(data, headers) {
  const dataObj = {};
  const contentDispositionHeader = headers.find((h) => h[0] === "content-disposition")?.[1] || "";
  for (const i of contentDispositionHeader.split(";")) {
    const s = i.split("=");
    if (s.length !== 2) {
      continue;
    }
    const key = (s[0] || "").trim();
    if (key === "name" || key === "filename") {
      const _value = (s[1] || "").trim().replace(/"/g, "");
      dataObj[key] = Buffer.from(_value, "latin1").toString("utf8");
    }
  }
  const contentType = headers.find((h) => h[0] === "content-type")?.[1] || "";
  if (contentType) {
    dataObj.type = contentType;
  }
  dataObj.data = Buffer.from(data);
  return dataObj;
}

function getQuery(event) {
  return getQuery$1(event.path || "");
}
function getRouterParams(event, opts = {}) {
  let params = event.context.params || {};
  if (opts.decode) {
    params = { ...params };
    for (const key in params) {
      params[key] = decode$1(params[key]);
    }
  }
  return params;
}
function getRouterParam(event, name, opts = {}) {
  const params = getRouterParams(event, opts);
  return params[name];
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
const getHeader = getRequestHeader;
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const _header = event.node.req.headers["x-forwarded-host"];
    const xForwardedHost = (_header || "").split(",").shift()?.trim();
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}
function getRequestIP(event, opts = {}) {
  if (event.context.clientAddress) {
    return event.context.clientAddress;
  }
  if (opts.xForwardedFor) {
    const xForwardedFor = getRequestHeader(event, "x-forwarded-for")?.split(",").shift()?.trim();
    if (xForwardedFor) {
      return xForwardedFor;
    }
  }
  if (event.node.req.socket.remoteAddress) {
    return event.node.req.socket.remoteAddress;
  }
}

const RawBodySymbol = Symbol.for("h3RawBody");
const ParsedBodySymbol = Symbol.for("h3ParsedBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      if (_resolved instanceof FormData) {
        return new Response(_resolved).bytes().then((uint8arr) => Buffer.from(uint8arr));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !/\bchunked\b/i.test(
    String(event.node.req.headers["transfer-encoding"] ?? "")
  )) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
async function readBody(event, options = {}) {
  const request = event.node.req;
  if (hasProp(request, ParsedBodySymbol)) {
    return request[ParsedBodySymbol];
  }
  const contentType = request.headers["content-type"] || "";
  const body = await readRawBody(event);
  let parsed;
  if (contentType === "application/json") {
    parsed = _parseJSON(body, options.strict ?? true);
  } else if (contentType.startsWith("application/x-www-form-urlencoded")) {
    parsed = _parseURLEncodedBody(body);
  } else if (contentType.startsWith("text/")) {
    parsed = body;
  } else {
    parsed = _parseJSON(body, options.strict ?? false);
  }
  request[ParsedBodySymbol] = parsed;
  return parsed;
}
async function readMultipartFormData(event) {
  const contentType = getRequestHeader(event, "content-type");
  if (!contentType || !contentType.startsWith("multipart/form-data")) {
    return;
  }
  const boundary = contentType.match(/boundary=([^;]*)(;|$)/i)?.[1];
  if (!boundary) {
    return;
  }
  const body = await readRawBody(event, false);
  if (!body) {
    return;
  }
  return parse(body, boundary);
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}
function _parseJSON(body = "", strict) {
  if (!body) {
    return void 0;
  }
  try {
    return destr(body, { strict });
  } catch {
    throw createError$1({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid JSON body"
    });
  }
}
function _parseURLEncodedBody(body) {
  const form = new URLSearchParams(body);
  const parsedForm = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of form.entries()) {
    if (hasProp(parsedForm, key)) {
      if (!Array.isArray(parsedForm[key])) {
        parsedForm[key] = [parsedForm[key]];
      }
      parsedForm[key].push(value);
    } else {
      parsedForm[key] = value;
    }
  }
  return parsedForm;
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}

function getDistinctCookieKey(name, opts) {
  return [name, opts.domain || "", opts.path || "/"].join(";");
}

function parseCookies(event) {
  return parse$1(event.node.req.headers.cookie || "");
}
function getCookie(event, name) {
  return parseCookies(event)[name];
}
function setCookie(event, name, value, serializeOptions = {}) {
  if (!serializeOptions.path) {
    serializeOptions = { path: "/", ...serializeOptions };
  }
  const newCookie = serialize$2(name, value, serializeOptions);
  const currentCookies = splitCookiesString(
    event.node.res.getHeader("set-cookie")
  );
  if (currentCookies.length === 0) {
    event.node.res.setHeader("set-cookie", newCookie);
    return;
  }
  const newCookieKey = getDistinctCookieKey(name, serializeOptions);
  event.node.res.removeHeader("set-cookie");
  for (const cookie of currentCookies) {
    const parsed = parseSetCookie(cookie);
    const key = getDistinctCookieKey(parsed.name, parsed);
    if (key === newCookieKey) {
      continue;
    }
    event.node.res.appendHeader("set-cookie", cookie);
  }
  event.node.res.appendHeader("set-cookie", newCookie);
}
function deleteCookie(event, name, serializeOptions) {
  setCookie(event, name, "", {
    ...serializeOptions,
    maxAge: 0
  });
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
function appendResponseHeader(event, name, value) {
  let current = event.node.res.getHeader(name);
  if (!current) {
    event.node.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.node.res.setHeader(name, [...current, value]);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "accept-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event, { host: target.startsWith("/") }),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event, opts) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event, {
        host: typeof req === "string" && req.startsWith("/")
      }),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    const entries = Array.isArray(input) ? input : typeof input.entries === "function" ? input.entries() : Object.entries(input);
    for (const [key, value] of entries) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

class H3Event {
  "__is_event__" = true;
  // Context
  node;
  // Node
  web;
  // Web
  context = {};
  // Shared
  // Request
  _method;
  _path;
  _headers;
  _requestBody;
  // Response
  _handled = false;
  // Hooks
  _onBeforeResponseCalled;
  _onAfterResponseCalled;
  constructor(req, res) {
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _rawReqUrl = event.node.req.url || "/";
    const _reqPath = _decodePath(event._path || _rawReqUrl);
    event._path = _reqPath;
    const _needsRawUrl = _reqPath !== _rawReqUrl;
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _needsRawUrl ? layer.route.length > 1 ? _rawReqUrl.slice(layer.route.length) || "/" : _rawReqUrl : _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function _decodePath(url) {
  const qIndex = url.indexOf("?");
  const path = qIndex === -1 ? url : url.slice(0, qIndex);
  const query = qIndex === -1 ? "" : url.slice(qIndex);
  const decodedPath = path.includes("%25") ? decodePath(path.replace(/%25/g, "%2525")) : decodePath(path);
  return decodedPath + query;
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

const s$1=globalThis.Headers,i=globalThis.AbortController,l=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  if (value instanceof FormData || value instanceof URLSearchParams) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (contentType === "text/event-stream") {
    return "stream";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
      if (!(context.options.headers instanceof Headers)) {
        context.options.headers = new Headers(
          context.options.headers || {}
          /* compat */
        );
      }
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        const contentType = context.options.headers.get("content-type");
        if (typeof context.options.body !== "string") {
          context.options.body = contentType === "application/x-www-form-urlencoded" ? new URLSearchParams(
            context.options.body
          ).toString() : JSON.stringify(context.options.body);
        }
        if (!contentType) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s$1;
const AbortController = globalThis.AbortController || i;
const ofetch = createFetch({ fetch, Headers: Headers$1, AbortController });
const $fetch = ofetch;

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}

const storageKeyProperties = [
  "has",
  "hasItem",
  "get",
  "getItem",
  "getItemRaw",
  "set",
  "setItem",
  "setItemRaw",
  "del",
  "remove",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  nsStorage.keys = nsStorage.getKeys;
  nsStorage.getItems = async (items, commonOptions) => {
    const prefixedItems = items.map(
      (item) => typeof item === "string" ? base + item : { ...item, key: base + item.key }
    );
    const results = await storage.getItems(prefixedItems, commonOptions);
    return results.map((entry) => ({
      key: entry.key.slice(base.length),
      value: entry.value
    }));
  };
  nsStorage.setItems = async (items, commonOptions) => {
    const prefixedItems = items.map((item) => ({
      key: base + item.key,
      value: item.value,
      options: item.options
    }));
    return storage.setItems(prefixedItems, commonOptions);
  };
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$1 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$1,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createError);
  }
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore, maxDepth) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        if (maxDepth === void 0 || maxDepth > 0) {
          const dirFiles = await readdirRecursive(
            entryPath,
            ignore,
            maxDepth === void 0 ? void 0 : maxDepth - 1
          );
          files.push(...dirFiles.map((f) => entry.name + "/" + f));
        }
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve$1(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    flags: {
      maxDepth: true
    },
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys(_base, topts) {
      return readdirRecursive(r("."), opts.ignore, topts?.maxDepth);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

function serialize$1(o){return typeof o=="string"?`'${o}'`:new c().serialize(o)}const c=/*@__PURE__*/function(){class o{#t=new Map;compare(t,r){const e=typeof t,n=typeof r;return e==="string"&&n==="string"?t.localeCompare(r):e==="number"&&n==="number"?t-r:String.prototype.localeCompare.call(this.serialize(t,true),this.serialize(r,true))}serialize(t,r){if(t===null)return "null";switch(typeof t){case "string":return r?t:`'${t}'`;case "bigint":return `${t}n`;case "object":return this.$object(t);case "function":return this.$function(t)}return String(t)}serializeObject(t){const r=Object.prototype.toString.call(t);if(r!=="[object Object]")return this.serializeBuiltInType(r.length<10?`unknown:${r}`:r.slice(8,-1),t);const e=t.constructor,n=e===Object||e===void 0?"":e.name;if(n!==""&&globalThis[n]===e)return this.serializeBuiltInType(n,t);if(typeof t.toJSON=="function"){const i=t.toJSON();return n+(i!==null&&typeof i=="object"?this.$object(i):`(${this.serialize(i)})`)}return this.serializeObjectEntries(n,Object.entries(t))}serializeBuiltInType(t,r){const e=this["$"+t];if(e)return e.call(this,r);if(typeof r?.entries=="function")return this.serializeObjectEntries(t,r.entries());throw new Error(`Cannot serialize ${t}`)}serializeObjectEntries(t,r){const e=Array.from(r).sort((i,a)=>this.compare(i[0],a[0]));let n=`${t}{`;for(let i=0;i<e.length;i++){const[a,l]=e[i];n+=`${this.serialize(a,true)}:${this.serialize(l)}`,i<e.length-1&&(n+=",");}return n+"}"}$object(t){let r=this.#t.get(t);return r===void 0&&(this.#t.set(t,`#${this.#t.size}`),r=this.serializeObject(t),this.#t.set(t,r)),r}$function(t){const r=Function.prototype.toString.call(t);return r.slice(-15)==="[native code] }"?`${t.name||""}()[native]`:`${t.name}(${t.length})${r.replace(/\s*\n\s*/g,"")}`}$Array(t){let r="[";for(let e=0;e<t.length;e++)r+=this.serialize(t[e]),e<t.length-1&&(r+=",");return r+"]"}$Date(t){try{return `Date(${t.toISOString()})`}catch{return "Date(null)"}}$ArrayBuffer(t){return `ArrayBuffer[${new Uint8Array(t).join(",")}]`}$Set(t){return `Set${this.$Array(Array.from(t).sort((r,e)=>this.compare(r,e)))}`}$Map(t){return this.serializeObjectEntries("Map",t.entries())}}for(const s of ["Error","RegExp","URL"])o.prototype["$"+s]=function(t){return `${s}(${t})`};for(const s of ["Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join(",")}]`};for(const s of ["BigInt64Array","BigUint64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join("n,")}${t.length>0?"n":""}]`};return o}();

function isEqual(object1, object2) {
  if (object1 === object2) {
    return true;
  }
  if (serialize$1(object1) === serialize$1(object2)) {
    return true;
  }
  return false;
}

const e=globalThis.process?.getBuiltinModule?.("crypto")?.hash,r="sha256",s="base64url";function digest(t){if(e)return e(r,t,s);const o=createHash(r).update(t);return globalThis.process?.versions?.webcontainer?o.digest().toString(s):o.digest(s)}

function hash$1(input) {
  return digest(serialize$1(input));
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const inlineAppConfig = {
  "nuxt": {}
};



const appConfig = defuFn(inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "ea9928ba-527d-4076-8972-0b31aed34e6f",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      },
      "/_nuxt/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      }
    }
  },
  "public": {
    "ga4MeasurementId": "G-T0E6KRN0GZ",
    "turnstileSiteKey": ""
  },
  "dbHost": "localhost",
  "dbPort": 8889,
  "dbName": "conjugaison4",
  "dbUser": "root",
  "dbPassword": "root",
  "sessionSecret": "root",
  "learnerSessionSecret": "",
  "turnstileSecretKey": "",
  "contactEmail": "christophe.roulet@edu-vd.ch",
  "contactFromEmail": "",
  "smtpHost": "",
  "smtpPort": 587,
  "smtpSecure": false,
  "smtpUser": "",
  "smtpPassword": "",
  "ga4PropertyId": "309413461",
  "ga4ClientEmail": "",
  "ga4PrivateKey": "",
  "ga4CredentialsFile": "cle-google/lobjet-366517-4ee1bb2ab062.json"
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());
function executeAsync(function_) {
  const restores = [];
  for (const leaveHandler of asyncHandlers) {
    const restore2 = leaveHandler();
    if (restore2) {
      restores.push(restore2);
    }
  }
  const restore = () => {
    for (const restore2 of restores) {
      restore2();
    }
  };
  let awaitable = function_();
  if (awaitable && typeof awaitable === "object" && "catch" in awaitable) {
    awaitable = awaitable.catch((error) => {
      restore();
      throw error;
    });
  }
  return [awaitable, restore];
}

getContext("nitro-app", {
  asyncContext: false,
  AsyncLocalStorage: void 0
});

function isPathInScope(pathname, base) {
  let canonical;
  try {
    const pre = pathname.replace(/%2f/gi, "/").replace(/%5c/gi, "\\");
    canonical = new URL(pre, "http://_").pathname;
  } catch {
    return false;
  }
  return !base || canonical === base || canonical.startsWith(base + "/");
}

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError$1({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError$1({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function isJsonRequest(event) {
	
	if (hasReqHeader(event, "accept", "text/html")) {
		return false;
	}
	return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
	const value = getRequestHeader(event, name);
	return !!(value && typeof value === "string" && value.toLowerCase().includes(includes));
}

const errorHandler$0 = (async function errorhandler(error, event, { defaultHandler }) {
	if (event.handled || isJsonRequest(event)) {
		
		return;
	}
	
	const defaultRes = await defaultHandler(error, event, { json: true });
	
	const status = error.status || error.statusCode || 500;
	if (status === 404 && defaultRes.status === 302) {
		setResponseHeaders(event, defaultRes.headers);
		setResponseStatus(event, defaultRes.status, defaultRes.statusText);
		return send(event, JSON.stringify(defaultRes.body, null, 2));
	}
	const errorObject = defaultRes.body;
	
	const url = new URL(errorObject.url);
	errorObject.url = withoutBase(url.pathname, useRuntimeConfig(event).app.baseURL) + url.search + url.hash;
	
	errorObject.message = error.unhandled ? errorObject.message || "Server Error" : error.message || errorObject.message || "Server Error";
	
	errorObject.data ||= error.data;
	errorObject.statusText ||= error.statusText || error.statusMessage;
	delete defaultRes.headers["content-type"];
	delete defaultRes.headers["content-security-policy"];
	setResponseHeaders(event, defaultRes.headers);
	
	const reqHeaders = getRequestHeaders(event);
	
	const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
	
	const res = isRenderingError ? null : await useNitroApp().localFetch(withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject), {
		headers: {
			...reqHeaders,
			"x-nuxt-error": "true"
		},
		redirect: "manual"
	}).catch(() => null);
	if (event.handled) {
		return;
	}
	
	if (!res) {
		const { template } = await import('../_/error-500.mjs');
		setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
		return send(event, template(errorObject));
	}
	const html = await res.text();
	for (const [header, value] of res.headers.entries()) {
		if (header === "set-cookie") {
			appendResponseHeader(event, header, value);
			continue;
		}
		setResponseHeader(event, header, value);
	}
	setResponseStatus(event, res.status && res.status !== 200 ? res.status : defaultRes.status, res.statusText || defaultRes.statusText);
	return send(event, html);
});

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [errorHandler$0, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

function defineNitroPlugin(def) {
  return def;
}

let pool;
function useDatabase() {
  if (pool) {
    return pool;
  }
  const config = useRuntimeConfig();
  const missing = [
    ["DB_HOST", config.dbHost],
    ["DB_NAME", config.dbName],
    ["DB_USER", config.dbUser]
  ].filter(([, value]) => !value);
  if (missing.length > 0) {
    throw new Error(`Configuration MySQL manquante : ${missing.map(([name]) => name).join(", ")}`);
  }
  pool = mysql.createPool({
    host: config.dbHost,
    port: config.dbPort,
    database: config.dbName,
    user: config.dbUser,
    password: config.dbPassword,
    waitForConnections: true,
    connectionLimit: 10,
    charset: "utf8mb4"
  });
  return pool;
}

const _j6rhVa9vazQwWAo6ZokRIRcXkdzpBcvA9Sds0tqpZaM = defineNitroPlugin(async () => {
  try {
    const database = useDatabase();
    await database.query(`
      CREATE TABLE IF NOT EXISTS admin_login_rate_limits (
        key_hash CHAR(64) NOT NULL PRIMARY KEY,
        failure_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
        window_started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        blocked_until DATETIME NULL,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_admin_login_rate_limits_updated (updated_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await database.query(
      "DELETE FROM admin_login_rate_limits WHERE updated_at < CURRENT_TIMESTAMP - INTERVAL 30 DAY"
    );
    console.info("[security] Limitation des connexions administrateur disponible.");
  } catch (error) {
    console.error("[security] \xC9chec de la pr\xE9paration de la limitation des connexions.", error);
  }
});

const _Z45CxtDWqkkKjVCKLRFEp9iVHa4rBcfVi8IP4zGS48 = defineNitroPlugin(async () => {
  try {
    const database = useDatabase();
    await database.query(`CREATE TABLE IF NOT EXISTS analytics_sessions (
      session_id CHAR(36) NOT NULL PRIMARY KEY,
      first_seen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_seen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      current_path VARCHAR(255) NOT NULL DEFAULT '/',
      interface_locale VARCHAR(8) NOT NULL DEFAULT 'fr',
      device_category VARCHAR(16) NOT NULL DEFAULT 'desktop',
      page_views INT UNSIGNED NOT NULL DEFAULT 0,
      KEY idx_analytics_sessions_first_seen (first_seen),
      KEY idx_analytics_sessions_last_seen (last_seen),
      KEY idx_analytics_sessions_path (current_path)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    await database.query(`CREATE TABLE IF NOT EXISTS analytics_events (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      session_id CHAR(36) NOT NULL,
      event_name VARCHAR(64) NOT NULL,
      path VARCHAR(255) NOT NULL DEFAULT '/',
      metadata JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_analytics_events_created (created_at),
      KEY idx_analytics_events_name_created (event_name, created_at),
      KEY idx_analytics_events_session (session_id, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    console.info("[database] Tables de statistiques d\xE9taill\xE9es disponibles.");
  } catch (error) {
    console.error("[database] \xC9chec de la migration des statistiques d\xE9taill\xE9es.", error);
  }
});

const challengeGroupCriteria = new Map([
  ['groupe1', [{ field: 'groupeConjugaison', operator: 'equals', value: 1 }]],
  ['groupe2', [{ field: 'groupeConjugaison', operator: 'equals', value: 2 }]],
  ['groupe3', [{ field: 'groupeConjugaison', operator: 'equals', value: 3 }]],
  ['groupe3ir', [
    { field: 'groupeConjugaison', operator: 'equals', value: 3 },
    { field: 'terminaison', operator: 'equals', value: 'ir' },
  ]],
  ['groupe3oir', [
    { field: 'groupeConjugaison', operator: 'equals', value: 3 },
    { field: 'terminaison', operator: 'equals', value: 'oir' },
  ]],
  ['groupe3autres', [
    { field: 'groupeConjugaison', operator: 'equals', value: 3 },
    { field: 'terminaison', operator: 'not-in', value: ['ir', 'oir'] },
  ]],
]);

async function migrateChallengeGroupCriteria(connection) {
  const keys = [...challengeGroupCriteria.keys()];
  const placeholders = keys.map(() => '?').join(',');
  const [rows] = await connection.execute(
    `SELECT id,preset_key AS presetKey,verb_selection_mode AS selectionMode
     FROM challenge_presets
     WHERE preset_key IN (${placeholders})
     ORDER BY id
     FOR UPDATE`,
    keys,
  );
  const found = new Set(rows.map(row => row.presetKey));
  const missing = keys.filter(key => !found.has(key));
  if (missing.length) {
    throw new Error(`Défis de groupes introuvables : ${missing.join(', ')}.`)
  }

  let converted = 0;
  for (const row of rows) {
    const criteria = challengeGroupCriteria.get(row.presetKey);
    const [result] = await connection.execute(
      `UPDATE challenge_presets
       SET verb_selection_mode='criteria',criteria_json=?
       WHERE id=?`,
      [JSON.stringify(criteria), row.id],
    );
    if (row.selectionMode !== 'criteria' || Number(result.changedRows) > 0) converted += 1;
  }

  const ids = rows.map(row => Number(row.id));
  const [deleted] = await connection.execute(
    `DELETE FROM challenge_preset_verbs
     WHERE preset_id IN (${ids.map(() => '?').join(',')})`,
    ids,
  );
  return {
    presetCount: rows.length,
    converted,
    removedSelections: Number(deleted.affectedRows),
  }
}

async function run() {
  const config = {
    host: process.env.DB_HOST || process.env.NUXT_DB_HOST,
    port: Number(process.env.DB_PORT || process.env.NUXT_DB_PORT || 3306),
    database: process.env.DB_NAME || process.env.NUXT_DB_NAME,
    user: process.env.DB_USER || process.env.NUXT_DB_USER,
    password: process.env.DB_PASSWORD || process.env.NUXT_DB_PASSWORD,
  };
  if (!config.host || !config.database || !config.user) {
    throw new Error(
      'Configuration MySQL absente. Dans Plesk, redémarrez l’application : '
      + 'la migration sera appliquée automatiquement avec la configuration Nitro.',
    )
  }
  const connection = await mysql.createConnection({ ...config, charset: 'utf8mb4' });
  try {
    await connection.beginTransaction();
    const result = await migrateChallengeGroupCriteria(connection);
    await connection.commit();
    console.log(
      `${result.presetCount} défis de groupes utilisent maintenant des critères dynamiques`
      + ` (${result.removedSelections} anciennes sélections supprimées).`,
    );
  }
  catch (error) {
    await connection.rollback();
    throw error
  }
  finally {
    await connection.end();
  }
}

if (globalThis._importMeta_.url === `file://${process.argv[1]}`) {
  run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

const DEFAULT_COMPLEMENT_OPTIONS = ["cod-after", "coi-after"];
const COMPLEMENT_OPTIONS = ["cod-after", "cod-before", "coi-after", "coi-before"];
function normalizeComplementOptions(value) {
  if (!Array.isArray(value)) return [];
  return COMPLEMENT_OPTIONS.filter((option) => value.includes(option));
}
function legacyComplementOptions(includeComplements, placement) {
  if (!includeComplements) return [];
  if (placement === "before") return ["cod-before"];
  if (placement === "mixed") return ["cod-after", "cod-before", "coi-after"];
  return [...DEFAULT_COMPLEMENT_OPTIONS];
}
function legacyComplementConfig(options) {
  const hasBefore = options.some((option) => option.endsWith("-before"));
  const hasAfter = options.some((option) => option.endsWith("-after"));
  return {
    includeComplements: options.length > 0,
    complementPlacement: hasBefore && hasAfter ? "mixed" : hasBefore ? "before" : "after"
  };
}

const challengePresetGroupLabels = {
  school: "Niveaux scolaires suisses",
  cif: "CIF (FLE)",
  "verb-group": "Groupes -er, -ir, etc.",
  spelling: "Difficult\xE9s particuli\xE8res",
  semantic: "Sens des verbes"
};
const challengePresetGroupOrder = [
  "school",
  "cif",
  "verb-group",
  "spelling",
  "semantic"
];
const personalPresent = [1];
const coreTenses = [1, 2, 3, 4, 5, 6];
const secondaryTenses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15];
const nearFutureTenseId = 24;
const challengePresetDefinitions = [
  { id: "5P", label: "5P", description: "Verbes et temps usuels de 5P.", group: "school", criteria: [{ field: "niveauxScolaires", operator: "includes", value: "5P" }], tenseIds: [1, 2], questionCount: 10 },
  { id: "6P", label: "6P", description: "Verbes et temps usuels de 6P.", group: "school", criteria: [{ field: "niveauxScolaires", operator: "includes", value: "6P" }], tenseIds: [1, 2, 3, 5], questionCount: 10 },
  { id: "7H", label: "7H", description: "Programme de conjugaison de 7H.", group: "school", criteria: [{ field: "niveauxScolaires", operator: "includes", value: "7H" }], tenseIds: [1, 2, 3, 5, 9, 14], questionCount: 10 },
  { id: "8H", label: "8H", description: "Programme de conjugaison de 8H.", group: "school", criteria: [{ field: "niveauxScolaires", operator: "includes", value: "8H" }], tenseIds: [1, 2, 3, 4, 5, 6, 7, 9, 14], questionCount: 10 },
  { id: "9H", label: "9H", description: "Programme de conjugaison de 9H.", group: "school", criteria: [{ field: "niveauxScolaires", operator: "includes", value: "9H" }], tenseIds: secondaryTenses, questionCount: 10 },
  { id: "10H", label: "10H", description: "Programme de conjugaison de 10H.", group: "school", criteria: [{ field: "niveauxScolaires", operator: "includes", value: "10H" }], tenseIds: secondaryTenses, questionCount: 10 },
  { id: "11H", label: "11H", description: "Programme de conjugaison de 11H.", group: "school", criteria: [{ field: "niveauxScolaires", operator: "includes", value: "11H" }], tenseIds: secondaryTenses, questionCount: 10 },
  { id: "groupe1", label: "Premier groupe", description: "Tous les verbes du premier groupe.", group: "verb-group", criteria: [{ field: "groupeConjugaison", operator: "equals", value: 1 }], tenseIds: personalPresent, questionCount: 10 },
  { id: "groupe2", label: "Deuxi\xE8me groupe", description: "Tous les verbes du deuxi\xE8me groupe.", group: "verb-group", criteria: [{ field: "groupeConjugaison", operator: "equals", value: 2 }], tenseIds: personalPresent, questionCount: 10 },
  { id: "groupe3", label: "Troisi\xE8me groupe", description: "Tous les verbes du troisi\xE8me groupe.", group: "verb-group", criteria: [{ field: "groupeConjugaison", operator: "equals", value: 3 }], tenseIds: personalPresent, questionCount: 10 },
  { id: "groupe3ir", label: "Troisi\xE8me groupe en -ir", description: "Verbes du troisi\xE8me groupe termin\xE9s par -ir.", group: "verb-group", criteria: [{ field: "groupeConjugaison", operator: "equals", value: 3 }, { field: "terminaison", operator: "equals", value: "ir" }], tenseIds: personalPresent, questionCount: 10 },
  { id: "groupe3oir", label: "Troisi\xE8me groupe en -oir", description: "Verbes du troisi\xE8me groupe termin\xE9s par -oir.", group: "verb-group", criteria: [{ field: "groupeConjugaison", operator: "equals", value: 3 }, { field: "terminaison", operator: "equals", value: "oir" }], tenseIds: personalPresent, questionCount: 10 },
  { id: "groupe3autres", label: "Autres verbes du troisi\xE8me groupe", description: "Verbes du troisi\xE8me groupe hors terminaisons -ir et -oir.", group: "verb-group", criteria: [{ field: "groupeConjugaison", operator: "equals", value: 3 }, { field: "terminaison", operator: "not-in", value: ["ir", "oir"] }], tenseIds: personalPresent, questionCount: 10 },
  { id: "ger", label: "Verbes en -ger", description: "Particularit\xE9s orthographiques des verbes en -ger.", group: "spelling", criteria: [{ field: "particularites", operator: "includes", value: "ger" }], tenseIds: coreTenses, questionCount: 10 },
  { id: "cer", label: "Verbes en -cer", description: "Particularit\xE9s orthographiques des verbes en -cer.", group: "spelling", criteria: [{ field: "particularites", operator: "includes", value: "cer" }], tenseIds: coreTenses, questionCount: 10 },
  { id: "ger-cer", label: "Verbes en -ger et -cer", description: "Entra\xEEnement combin\xE9 aux verbes en -ger et -cer.", group: "spelling", criteria: [], tenseIds: coreTenses, questionCount: 10 },
  { id: "sens-mouvement", label: "Mouvement et d\xE9placement", description: "Aller, venir, partir et autres verbes de d\xE9placement.", group: "semantic", criteria: [{ field: "categoriesSemantiques", operator: "includes", value: "mouvement" }], tenseIds: coreTenses, questionCount: 10 },
  { id: "sens-communication", label: "Communication", description: "Dire, parler, r\xE9pondre, expliquer et raconter.", group: "semantic", criteria: [{ field: "categoriesSemantiques", operator: "includes", value: "communication" }], tenseIds: coreTenses, questionCount: 10 },
  { id: "sens-cognition", label: "Pens\xE9e et connaissance", description: "Penser, savoir, comprendre, apprendre et d\xE9cider.", group: "semantic", criteria: [{ field: "categoriesSemantiques", operator: "includes", value: "cognition" }], tenseIds: coreTenses, questionCount: 10 },
  { id: "sens-emotion", label: "\xC9motions et appr\xE9ciation", description: "Aimer, pr\xE9f\xE9rer, craindre, rire et ressentir.", group: "semantic", criteria: [{ field: "categoriesSemantiques", operator: "includes", value: "emotion" }], tenseIds: coreTenses, questionCount: 10 },
  { id: "sens-corps", label: "Corps et besoins", description: "Manger, boire, dormir et prendre soin de soi.", group: "semantic", criteria: [{ field: "categoriesSemantiques", operator: "includes", value: "corps" }], tenseIds: coreTenses, questionCount: 10 },
  { id: "rares", label: "Verbes rares", description: "Verbes marqu\xE9s comme rares ou vieillis.", group: "spelling", criteria: [{ field: "registrePrincipal", operator: "equals", value: "rare" }], tenseIds: coreTenses, questionCount: 10 },
  { id: "difficiles", label: "Verbes difficiles", description: "Conjugaisons de difficult\xE9 \xE9lev\xE9e.", group: "spelling", criteria: [{ field: "niveauDifficulte", operator: "gte", value: 3 }], tenseIds: coreTenses, questionCount: 10 },
  { id: "pronominaux", label: "Verbes pronominaux", description: "Tous les verbes pronominaux du catalogue.", group: "spelling", criteria: [{ field: "typePronominal", operator: "not-equals", value: "aucun" }], tenseIds: coreTenses, questionCount: 10 },
  { id: "CIF1", label: "CIF 1", description: "Premier parcours CIF historique.", group: "cif", criteria: [{ field: "parcoursCif", operator: "includes", value: "CIF1" }], tenseIds: [1, nearFutureTenseId], questionCount: 10 },
  { id: "CIF2", label: "CIF 2", description: "Deuxi\xE8me parcours CIF historique.", group: "cif", criteria: [{ field: "parcoursCif", operator: "includes", value: "CIF2" }], tenseIds: [1, nearFutureTenseId], questionCount: 10 },
  { id: "CIF3", label: "CIF 3", description: "Troisi\xE8me parcours CIF historique.", group: "cif", criteria: [{ field: "parcoursCif", operator: "includes", value: "CIF3" }], tenseIds: [1, 2, 3, 4, nearFutureTenseId], questionCount: 10 },
  { id: "CIF4", label: "CIF 4", description: "Quatri\xE8me parcours CIF historique.", group: "cif", criteria: [{ field: "parcoursCif", operator: "includes", value: "CIF4" }], tenseIds: [...coreTenses, nearFutureTenseId], questionCount: 10 }
];
function matchesCriterion(verb, criterion) {
  var _a;
  if (criterion.operator === "has-anteposable-cod") {
    return ((_a = verb.complementExample) == null ? void 0 : _a.functionObject) === "cod" && Boolean(verb.complementExample.before);
  }
  const value = verb[criterion.field];
  if (criterion.operator === "includes") return Array.isArray(value) && value.includes(criterion.value);
  if (criterion.operator === "not-in") return !criterion.value.includes(value);
  if (criterion.operator === "gte") return typeof value === "number" && value >= criterion.value;
  if (criterion.operator === "not-equals") return value !== criterion.value;
  return value === criterion.value;
}
function verbsForChallengePresetDefinition(definition, verbs) {
  if (definition.id === "pronominaux") {
    return verbs.filter((verb) => verb.isPronominalForm || verb.typePronominal !== "aucun");
  }
  const lexicalVerbs = verbs.filter((verb) => !verb.isPronominalForm);
  if (definition.id === "ger-cer") {
    return lexicalVerbs.filter((verb) => verb.particularites.includes("ger") || verb.particularites.includes("cer"));
  }
  return lexicalVerbs.filter((verb) => definition.criteria.every((criterion) => matchesCriterion(verb, criterion)));
}
function resolveChallengePresets(verbs) {
  return resolveChallengePresetDefinitions(challengePresetDefinitions, verbs);
}
function resolveChallengePresetDefinitions(definitions, verbs) {
  return definitions.map((definition) => {
    var _a, _b;
    const configurableDefinition = definition;
    const includeComplements = (_a = configurableDefinition.includeComplements) != null ? _a : false;
    const complementPlacement = (_b = configurableDefinition.complementPlacement) != null ? _b : "after";
    return {
      id: definition.id,
      label: definition.label,
      description: definition.description,
      group: definition.group,
      criteria: definition.criteria.map((criterion) => ({ ...criterion })),
      verbIds: verbsForChallengePresetDefinition(definition, verbs).map((verb) => verb.id),
      tenseIds: [...definition.tenseIds],
      questionCount: definition.questionCount,
      exerciseKind: "conjugation",
      pastSimplePronouns: "all",
      inclusivePronouns: false,
      includeComplements,
      complementPlacement,
      complementOptions: legacyComplementOptions(includeComplements, complementPlacement)
    };
  });
}

function encodePronominalSelectionId(useId) {
  return -Math.abs(useId);
}
function decodePronominalSelectionId(selectionId) {
  return selectionId < 0 ? Math.abs(selectionId) : null;
}

function unique(values) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
function normalized$1(value) {
  return value.trim().toLocaleLowerCase("fr-CH");
}
function startsWithVowel(value) {
  const first = value.trim().normalize("NFD").replace(/\p{Diacritic}/gu, "").charAt(0).toLowerCase();
  return "aeiouy".includes(first);
}
const ASPIRATED_H_INFINITIVES = /* @__PURE__ */ new Set(["ha\xEFr"]);
function startsWithElidableSound(value, infinitive = "") {
  const normalizedValue = normalized$1(value).normalize("NFC");
  if (startsWithVowel(normalizedValue)) return true;
  if (!normalizedValue.startsWith("h")) return false;
  const normalizedInfinitive = normalized$1(infinitive).normalize("NFC");
  if (ASPIRATED_H_INFINITIVES.has(normalizedInfinitive)) return false;
  if (/^ha(?:i|ï)/u.test(normalizedValue)) return false;
  return true;
}
function masculineSingularForm(form, participle) {
  if (!participle) return form.endsWith("s") ? form.slice(0, -1) : form;
  const endings = [
    `${participle}es`,
    `${participle}e`,
    .../[sx]$/u.test(participle) ? [] : [`${participle}s`],
    participle
  ];
  const ending = endings.find((candidate) => form.endsWith(candidate));
  if (ending) return `${form.slice(0, -ending.length)}${participle}`;
  return form;
}
function applyAgreement(form, pronoun, compound, auxiliary, participle, agreementRule) {
  if (!compound || normalized$1(auxiliary) !== "\xEAtre") return form;
  if (agreementRule === "invariable") return masculineSingularForm(form, participle);
  const stem = masculineSingularForm(form, participle);
  if (pronoun === "elle") return `${stem}e`;
  if (pronoun === "elles") return `${stem}es`;
  if (pronoun === "iel") return `${stem}(e)`;
  if (pronoun === "iels") return `${stem}(e)s`;
  return form;
}
function agreementVariants(form, pronoun, compound, auxiliary, participle, agreementRule, allowInvariableConstruction = false) {
  const canonical = applyAgreement(form, pronoun, compound, auxiliary, participle, agreementRule);
  const variants = [canonical];
  if (!compound || normalized$1(auxiliary) !== "\xEAtre") return variants;
  const stem = masculineSingularForm(form, participle);
  if (agreementRule === "invariable") return [stem];
  if (agreementRule === "selon_construction" && allowInvariableConstruction) variants.push(stem);
  if (pronoun === "iel") {
    variants.push(stem, `${stem}e`, `${stem}.e`);
  } else if (pronoun === "iels") {
    variants.push(form, `${stem}es`, `${stem}.e.s`);
  } else if (["je", "tu"].includes(pronoun)) {
    variants.push(stem, `${stem}e`);
  } else if (pronoun === "nous") {
    variants.push(`${stem}es`);
  } else if (pronoun === "vous") {
    variants.push(stem, `${stem}e`, `${stem}s`, `${stem}es`);
  }
  return unique(variants);
}
function allowsInvariableConstruction(row) {
  return row.agreement_rule === "selon_construction" && row.complement_position === "after" && row.complement_function === "cod";
}
function withPronoun(pronoun, form, infinitive = "") {
  return pronoun === "je" && startsWithElidableSound(form, infinitive) ? `j'${form}` : `${pronoun} ${form}`;
}
function withComplement(answer, complement) {
  var _a, _b;
  const trimmed = answer.trim();
  const punctuation = (_b = (_a = trimmed.match(/[!?]$/u)) == null ? void 0 : _a[0]) != null ? _b : "";
  const stem = punctuation ? trimmed.slice(0, -1).trimEnd() : trimmed;
  return `${stem} ${complement.trim()}${punctuation ? ` ${punctuation}` : ""}`;
}
function agreedParticiple(participle, gender, number) {
  var _a;
  let result = participle;
  if (gender === "feminin") {
    const exceptions = {
      absous: "absoute",
      dissous: "dissoute",
      d\u00FB: "due",
      m\u00FB: "mue",
      cr\u00FB: "crue"
    };
    result = (_a = exceptions[result]) != null ? _a : result.endsWith("e") ? result : `${result}e`;
  }
  if (number === "pluriel" && !/[sx]$/u.test(result)) result += "s";
  return result;
}
function applyAnteposedCodAgreement(form, row) {
  if (row.complement_position !== "before" || row.complement_function === "coi" || !row.is_compound || normalized$1(row.auxiliaire) !== "avoir" || !row.participe_passe || !row.complement_gender || !row.complement_number || !form.endsWith(row.participe_passe)) {
    return form;
  }
  const agreed = agreedParticiple(row.participe_passe, row.complement_gender, row.complement_number);
  return `${form.slice(0, -row.participe_passe.length)}${agreed}`;
}
function withoutSubjunctiveLink(value) {
  return value.replace(/^que\s+/iu, "").replace(/^qu['’]/iu, "");
}
function splitAnteposedCodComplement(complement, relativePronoun) {
  if (relativePronoun) return { antecedent: complement.trim(), postposed: "" };
  const match = complement.trim().match(
    /^(.+?)\s+((?:à\s+(?:l['’]|la\b|le\b|un\b|une\b|des\b)|au\b|aux\b|dans\b|sur\b|sous(?!-)\b|chez\b|vers\b|en\b|pour\b|par\b|avec\b|sans\b).*)$/iu
  );
  return match ? { antecedent: match[1].trim(), postposed: match[2].trim() } : { antecedent: complement.trim(), postposed: "" };
}
function anteposedComplementGrammar(antecedent, relativePronoun, gender, number) {
  var _a;
  const normalizedGender = normalized$1(gender || "").normalize("NFD").replace(/\p{Diacritic}/gu, "");
  const normalizedNumber = normalized$1(number || "");
  if ((normalizedGender === "masculin" || normalizedGender === "feminin") && (normalizedNumber === "singulier" || normalizedNumber === "pluriel")) {
    return { gender: normalizedGender, number: normalizedNumber };
  }
  const relative = normalized$1(relativePronoun || "").normalize("NFD").replace(/\p{Diacritic}/gu, "");
  if (["auxquelles", "desquelles"].includes(relative)) return { gender: "feminin", number: "pluriel" };
  if (["auxquels", "desquels"].includes(relative)) return { gender: "masculin", number: "pluriel" };
  if (["a laquelle", "de laquelle"].includes(relative)) return { gender: "feminin", number: "singulier" };
  if (["auquel", "duquel"].includes(relative)) return { gender: "masculin", number: "singulier" };
  const determiner = (_a = normalized$1(antecedent).match(/^(l['’]|le(?=\s)|la(?=\s)|les(?=\s)|un(?=\s)|une(?=\s)|des(?=\s)|ce(?=\s)|cet(?=\s)|cette(?=\s)|ces(?=\s))/u)) == null ? void 0 : _a[1];
  if (["les", "des", "ces"].includes(determiner || "")) return { gender: "masculin", number: "pluriel" };
  if (["la", "une", "cette"].includes(determiner || "")) return { gender: "feminin", number: "singulier" };
  return { gender: "masculin", number: "singulier" };
}
function subjunctiveRelativeAntecedent(antecedent, relativePronoun, gender, number) {
  const grammar = anteposedComplementGrammar(antecedent, relativePronoun, gender, number);
  const nounPhrase = antecedent.trim().replace(
    /^(?:l['’]|le\s+|la\s+|les\s+|un\s+|une\s+|des\s+|ce\s+|cet\s+|cette\s+|ces\s+)/iu,
    ""
  );
  const plural = grammar.number === "pluriel";
  const feminine = grammar.gender === "feminin";
  const article = plural ? "les" : feminine ? "la" : "le";
  const only = plural ? feminine ? "seules" : "seuls" : feminine ? "seule" : "seul";
  return `${plural ? "Ce sont" : "C'est"} ${article} ${only} ${nounPhrase}`;
}
function withRelativeLink(relativePronoun, pronoun, clause) {
  const relative = relativePronoun == null ? void 0 : relativePronoun.trim();
  if (!relative || normalized$1(relative) === "que") {
    return startsWithVowel(pronoun) ? `qu'${clause}` : `que ${clause}`;
  }
  return `${relative} ${clause}`;
}
function withAnteposedComplement(answer, pronoun, mode, complement, relativePronoun, gender, number) {
  const { antecedent, postposed } = splitAnteposedCodComplement(complement, relativePronoun);
  if (normalized$1(mode) === "subjonctif") {
    const framedAntecedent = subjunctiveRelativeAntecedent(antecedent, relativePronoun, gender, number);
    const clause2 = withoutSubjunctiveLink(answer);
    return [framedAntecedent, withRelativeLink(relativePronoun, pronoun, clause2), postposed].filter(Boolean).join(" ");
  }
  if (relativePronoun) {
    return `${antecedent} ${withRelativeLink(relativePronoun, pronoun, answer)}`;
  }
  const clause = startsWithVowel(pronoun) ? `qu'${answer}` : `que ${answer}`;
  return [antecedent, clause, postposed].filter(Boolean).join(" ");
}
function relativeSubjectPrefix(pronoun, form, mode, infinitive) {
  const formatted = formatAnswer(pronoun, form, mode, infinitive);
  const prefix = formatted.endsWith(form) ? formatted.slice(0, -form.length).trimEnd() : pronoun;
  return normalized$1(mode) === "subjonctif" ? withoutSubjunctiveLink(prefix) : prefix;
}
function inputPrefix(pronoun, form, mode, infinitive, position) {
  if (normalized$1(mode) === "imp\xE9ratif") return "";
  const formatted = formatAnswer(pronoun, form, mode, infinitive);
  const base = formatted.endsWith(form) ? formatted.slice(0, -form.length).trimEnd() : pronoun;
  if (position !== "before" || normalized$1(mode) === "subjonctif") return base;
  return startsWithVowel(pronoun) ? `qu'${base}` : `que ${base}`;
}
function formatAnswer(pronoun, form, mode, infinitive = "") {
  const normalizedMode = normalized$1(mode);
  if (normalizedMode === "imp\xE9ratif") return `${form.trimEnd()} !`;
  const phrase = withPronoun(pronoun, form, infinitive);
  if (normalizedMode === "subjonctif") {
    return `${startsWithVowel(pronoun) ? "qu'" : "que "}${phrase}`;
  }
  return phrase;
}
function answerVariants(row, pronoun) {
  const baseForms = unique([row.conjugaison1, row.conjugaison2, row.conjugaison3]);
  const answers = [];
  for (const baseForm of baseForms) {
    for (const form of agreementVariants(
      baseForm,
      pronoun,
      Boolean(row.is_compound),
      row.auxiliaire,
      row.participe_passe,
      row.agreement_rule,
      allowsInvariableConstruction(row)
    )) {
      const agreedForm = applyAnteposedCodAgreement(form, row);
      const canonical = formatAnswer(pronoun, agreedForm, row.mode_name, row.infinitif);
      answers.push(canonical, agreedForm);
      if (normalized$1(row.mode_name) === "imp\xE9ratif") {
        answers.push(agreedForm.replace(/!$/, ""));
      } else {
        answers.push(withPronoun(pronoun, agreedForm, row.infinitif));
      }
      if (row.complement_position === "before" && row.complement_anteposed) {
        answers.push(withAnteposedComplement(canonical, pronoun, row.mode_name, row.complement_anteposed, row.complement_relative_pronoun, row.complement_gender, row.complement_number));
      }
    }
  }
  const baseAnswers = unique(answers);
  return row.complement_phrase && row.complement_position !== "before" ? unique([...baseAnswers, ...baseAnswers.map((answer) => withComplement(answer, row.complement_phrase))]) : baseAnswers;
}
function formatConjugationQuestion(row, pronoun) {
  var _a, _b, _c;
  const anteposedComplement = row.complement_position === "before" && row.complement_anteposed ? splitAnteposedCodComplement(row.complement_anteposed, row.complement_relative_pronoun) : null;
  const sourceForms = unique([row.conjugaison1, row.conjugaison2, row.conjugaison3]);
  const correctedForms = (row.agreement_rule === "selon_construction" ? sourceForms.flatMap((form) => agreementVariants(
    form,
    pronoun,
    Boolean(row.is_compound),
    row.auxiliaire,
    row.participe_passe,
    row.agreement_rule,
    allowsInvariableConstruction(row)
  )) : sourceForms.map((form) => applyAgreement(
    form,
    pronoun,
    Boolean(row.is_compound),
    row.auxiliaire,
    row.participe_passe,
    row.agreement_rule
  ))).map((form) => applyAnteposedCodAgreement(form, row)).map((form) => formatAnswer(pronoun, form, row.mode_name, row.infinitif));
  const displayedCorrections = row.complement_position === "before" && row.complement_anteposed ? correctedForms.map((answer) => withAnteposedComplement(answer, pronoun, row.mode_name, row.complement_anteposed, row.complement_relative_pronoun, row.complement_gender, row.complement_number)) : row.complement_phrase ? correctedForms.map((answer) => withComplement(answer, row.complement_phrase)) : correctedForms;
  const prompt = row.complement_position === "before" && row.complement_anteposed ? normalized$1(row.mode_name) === "subjonctif" ? `${subjunctiveRelativeAntecedent(anteposedComplement.antecedent, row.complement_relative_pronoun, row.complement_gender, row.complement_number)} ${withRelativeLink(row.complement_relative_pronoun, pronoun, relativeSubjectPrefix(pronoun, row.conjugaison1, row.mode_name, row.infinitif))} \u2026${anteposedComplement.postposed ? ` ${anteposedComplement.postposed}` : ""} | ${row.infinitif} | ${row.temps_name} (${row.mode_name})` : row.complement_relative_pronoun ? `${anteposedComplement.antecedent} ${withRelativeLink(row.complement_relative_pronoun, pronoun, relativeSubjectPrefix(pronoun, row.conjugaison1, row.mode_name, row.infinitif))} \u2026 | ${row.infinitif} | ${row.temps_name} (${row.mode_name})` : `${anteposedComplement.antecedent} ${inputPrefix(pronoun, row.conjugaison1, row.mode_name, row.infinitif, "before")} \u2026${anteposedComplement.postposed ? ` ${anteposedComplement.postposed}` : ""} | ${row.infinitif} | ${row.temps_name} (${row.mode_name})` : row.complement_phrase ? `${normalized$1(row.mode_name) === "imp\xE9ratif" ? "" : `${inputPrefix(pronoun, row.conjugaison1, row.mode_name, row.infinitif)} `}\u2026 ${row.complement_phrase} | ${row.infinitif} | ${row.temps_name} (${row.mode_name})` : `${normalized$1(row.mode_name) === "imp\xE9ratif" ? "" : `${pronoun} | `}${row.infinitif} | ${row.temps_name} (${row.mode_name})`;
  const displayedComplement = row.complement_position === "before" ? anteposedComplement == null ? void 0 : anteposedComplement.antecedent : row.complement_phrase;
  const hasAvoirParticipleRule = Boolean(row.is_compound) && normalized$1(row.auxiliaire) === "avoir" && Boolean(displayedComplement) && (row.complement_function === "cod" || row.complement_function === "coi");
  const agreementReminder = hasAvoirParticipleRule ? {
    kind: row.complement_function === "coi" ? "coi" : row.complement_position === "before" ? "cod-before" : "cod-after",
    infinitive: row.infinitif,
    complement: displayedComplement,
    preposition: row.complement_preposition,
    participle: row.complement_function === "cod" && row.complement_position === "before" && row.complement_gender && row.complement_number ? agreedParticiple(row.participe_passe, row.complement_gender, row.complement_number) : row.participe_passe,
    gender: (_a = row.complement_gender) != null ? _a : null,
    number: (_b = row.complement_number) != null ? _b : null
  } : void 0;
  const futureSimpleAnswers = ((_c = row.future_simple_forms) == null ? void 0 : _c.length) ? answerVariants({
    ...row,
    conjugaison1: row.future_simple_forms[0] || "",
    conjugaison2: row.future_simple_forms[1] || "",
    conjugaison3: row.future_simple_forms[2] || "",
    is_compound: 0
  }, pronoun) : [];
  const conjugationConfusions = (row.conjugation_confusions || []).map((candidate) => ({
    tense: candidate.tense,
    mode: candidate.mode,
    answers: unique(candidate.forms.flatMap((form) => [
      form,
      formatAnswer(pronoun, form, candidate.mode, row.infinitif),
      withPronoun(pronoun, form, row.infinitif)
    ]))
  })).filter((candidate) => candidate.answers.length);
  return {
    id: `c-${row.id}`,
    verbeId: Number(row.verbe_id),
    tenseId: Number(row.temp_id),
    personId: Number(row.personne_id),
    titre: row.infinitif,
    consigne: prompt,
    reponses: answerVariants(row, pronoun),
    reponsesPourCorrige: unique(displayedCorrections),
    ...futureSimpleAnswers.length ? { futureSimpleAnswers } : {},
    ...conjugationConfusions.length ? { conjugationConfusions } : {},
    infinitif: row.infinitif,
    pronom: pronoun,
    temps: row.temps_name,
    mode: row.mode_name,
    ...row.tense_code ? { tenseCode: row.tense_code } : {},
    ...row.mode_code ? { modeCode: row.mode_code } : {},
    isCompound: Boolean(row.is_compound),
    conjugaison1: row.conjugaison1,
    conjugaison2: row.conjugaison2 || "",
    conjugaison3: row.conjugaison3 || "",
    nousForm: row.nous_form || null,
    ...row.radical_reference ? { radicalReference: row.radical_reference } : {},
    complement: row.complement_position === "before" ? row.complement_anteposed || void 0 : row.complement_phrase || void 0,
    complementPosition: row.complement_position,
    complementFunction: row.complement_function || void 0,
    relativePronoun: row.complement_relative_pronoun || void 0,
    saisiePrefixe: row.complement_position === "before" && row.complement_relative_pronoun ? relativeSubjectPrefix(pronoun, row.conjugaison1, row.mode_name, row.infinitif) : inputPrefix(pronoun, row.conjugaison1, row.mode_name, row.infinitif, row.complement_position),
    ...agreementReminder ? { agreementReminder } : {}
  };
}

const COMPLEMENTS = [
  "une pomme",
  "un sandwich",
  "des p\xE2tes",
  "son go\xFBter",
  "une soupe",
  "trois fraises",
  "le dessert",
  "une part de g\xE2teau"
];
const NON_FINITE_FORMS = {
  "participe:pr\xE9sent": "Mangeant",
  "participe:pass\xE9": "Ayant mang\xE9",
  "g\xE9rondif:pr\xE9sent": "En mangeant",
  "g\xE9rondif:pass\xE9": "En ayant mang\xE9"
};
const GENERATED_FINITE_FORMS = {
  "indicatif:futur proche": "Je vais manger"
};
function normalized(value) {
  return value.trim().toLocaleLowerCase("fr").normalize("NFC");
}
function pickComplement(random) {
  const index = Math.min(COMPLEMENTS.length - 1, Math.floor(random() * COMPLEMENTS.length));
  return COMPLEMENTS[index];
}
function withComplementAfter(answer, complement) {
  var _a;
  const trimmed = answer.trim();
  const punctuation = (_a = trimmed.match(/[!?]$/u)) == null ? void 0 : _a[0];
  const stem = punctuation ? trimmed.slice(0, -1).trimEnd() : trimmed;
  const sentence = `${stem} ${complement}${punctuation ? ` ${punctuation}` : "."}`;
  return sentence.charAt(0).toLocaleUpperCase("fr") + sentence.slice(1);
}
function buildTenseExamples(tenses, forms, random = Math.random) {
  var _a;
  const formsByTense = /* @__PURE__ */ new Map();
  for (const form of forms) {
    if (!form.conjugaison1.trim()) continue;
    const candidates = (_a = formsByTense.get(Number(form.temp_id))) != null ? _a : [];
    candidates.push(form);
    formsByTense.set(Number(form.temp_id), candidates);
  }
  return new Map(tenses.map((tense) => {
    var _a2, _b, _c;
    const candidates = (_a2 = formsByTense.get(Number(tense.id))) != null ? _a2 : [];
    if (candidates.length) {
      const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length));
      const chosen = candidates[index];
      const answer = formatAnswer(chosen.pronom, chosen.conjugaison1, chosen.mode_name, "manger");
      return [Number(tense.id), withComplementAfter(answer, pickComplement(random))];
    }
    const key = `${normalized(tense.mode)}:${normalized(tense.name)}`;
    const form = (_c = (_b = GENERATED_FINITE_FORMS[key]) != null ? _b : NON_FINITE_FORMS[key]) != null ? _c : "Manger";
    return [Number(tense.id), withComplementAfter(form, pickComplement(random))];
  }));
}

const SINGULAR_DETERMINERS = {
  un: "masculin",
  une: "feminin",
  le: "masculin",
  la: "feminin",
  ce: "masculin",
  cet: "masculin",
  cette: "feminin"
};
const SAFE_DETERMINERS = /* @__PURE__ */ new Set([
  ...Object.keys(SINGULAR_DETERMINERS),
  "des",
  "les",
  "ces",
  "mes",
  "tes",
  "ses",
  "nos",
  "vos",
  "leurs",
  "plusieurs",
  "quelques"
]);
function normalizedGrammar(gender, number) {
  const normalizedGender = gender == null ? void 0 : gender.trim().toLocaleLowerCase("fr").normalize("NFD").replace(/\p{Diacritic}/gu, "");
  const normalizedNumber = number == null ? void 0 : number.trim().toLocaleLowerCase("fr");
  if (normalizedGender !== "masculin" && normalizedGender !== "feminin" || normalizedNumber !== "singulier" && normalizedNumber !== "pluriel") return null;
  return { gender: normalizedGender, number: normalizedNumber };
}
function relativePronoun(preposition, gender, number) {
  if (preposition === "\xE0") {
    if (number === "pluriel") return gender === "feminin" ? "auxquelles" : "auxquels";
    return gender === "feminin" ? "\xE0 laquelle" : "auquel";
  }
  if (number === "pluriel") return gender === "feminin" ? "desquelles" : "desquels";
  return gender === "feminin" ? "de laquelle" : "duquel";
}
function indirectRelative(complement, preposition, gender, number) {
  const normalizedPreposition = preposition == null ? void 0 : preposition.trim().toLocaleLowerCase("fr");
  if (normalizedPreposition !== "\xE0" && normalizedPreposition !== "de") return null;
  let remainder = complement.trim();
  if (normalizedPreposition === "\xE0") {
    if (/^au\s/iu.test(remainder)) remainder = `le ${remainder.slice(3)}`;
    else if (/^aux\s/iu.test(remainder)) remainder = `les ${remainder.slice(4)}`;
    else if (/^à\s/iu.test(remainder)) remainder = remainder.slice(2);
    else return null;
  } else {
    if (/^du\s/iu.test(remainder)) remainder = `le ${remainder.slice(3)}`;
    else if (/^des\s/iu.test(remainder)) remainder = `les ${remainder.slice(4)}`;
    else if (/^d['’]/iu.test(remainder)) remainder = remainder.slice(2);
    else if (/^de\s/iu.test(remainder)) remainder = remainder.slice(3);
    else return null;
  }
  const match = remainder.match(/^(\S+)\s+(.+)$/u);
  if (!(match == null ? void 0 : match[1]) || !match[2]) return null;
  const determiner = match[1].toLocaleLowerCase("fr");
  if (!SAFE_DETERMINERS.has(determiner)) return null;
  const explicitGrammar = normalizedGrammar(gender, number);
  const inferredGender = SINGULAR_DETERMINERS[determiner];
  const grammar = explicitGrammar != null ? explicitGrammar : inferredGender ? { gender: inferredGender, number: "singulier" } : null;
  if (!grammar) return null;
  if (grammar.number === "singulier" && inferredGender && inferredGender !== grammar.gender) return null;
  const nounPhrase = match[2].trim();
  const first = nounPhrase.normalize("NFD").replace(/\p{Diacritic}/gu, "").charAt(0).toLocaleLowerCase("fr");
  const antecedent = grammar.number === "pluriel" ? `les ${nounPhrase}` : "aeiouyh".includes(first) ? `l\u2019${nounPhrase}` : `${grammar.gender === "feminin" ? "la" : "le"} ${nounPhrase}`;
  return {
    antecedent,
    relativePronoun: relativePronoun(normalizedPreposition, grammar.gender, grammar.number)
  };
}

const GRAMMAR_MODE_CODES = [
  "indicative",
  "subjunctive",
  "conditional",
  "imperative",
  "participle",
  "gerund",
  "infinitive"
];
const GRAMMAR_TENSE_CODES = [
  "present",
  "near-future",
  "imperfect",
  "future",
  "simple-past",
  "compound-past",
  "future-perfect",
  "pluperfect",
  "past-anterior",
  "past",
  "past-first-form",
  "past-second-form"
];
function normalizedGrammarLabel(value) {
  return (value || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLocaleLowerCase("fr");
}
const MODE_BY_FRENCH_NAME = {
  indicatif: "indicative",
  subjonctif: "subjunctive",
  conditionnel: "conditional",
  imperatif: "imperative",
  participe: "participle",
  gerondif: "gerund",
  infinitif: "infinitive"
};
const TENSE_BY_FRENCH_NAME = {
  present: "present",
  "futur proche": "near-future",
  imparfait: "imperfect",
  futur: "future",
  "passe simple": "simple-past",
  "passe compose": "compound-past",
  "futur anterieur": "future-perfect",
  "plus-que-parfait": "pluperfect",
  "passe anterieur": "past-anterior",
  passe: "past",
  "passe 1": "past-first-form",
  "passe 1re forme": "past-first-form",
  "passe 2": "past-second-form",
  "passe 2e forme": "past-second-form"
};
function grammarModeCode(value) {
  const normalized = normalizedGrammarLabel(value);
  return GRAMMAR_MODE_CODES.includes(normalized) ? normalized : MODE_BY_FRENCH_NAME[normalized] || null;
}
function grammarTenseCode(value) {
  const normalized = normalizedGrammarLabel(value);
  return GRAMMAR_TENSE_CODES.includes(normalized) ? normalized : TENSE_BY_FRENCH_NAME[normalized] || null;
}

const SUPPORTED_LOCALES = ["fr", "de", "en", "it", "es"];
const DEFAULT_INTERFACE_LOCALE = "fr";
const DEFAULT_EXPLANATION_LOCALE = "fr";
const DEFAULT_LANGUAGE_PREFERENCES = {
  interfaceLocale: DEFAULT_INTERFACE_LOCALE,
  explanationLocale: DEFAULT_EXPLANATION_LOCALE
};
function normalizeLocale(value, fallback = DEFAULT_INTERFACE_LOCALE) {
  if (typeof value !== "string") return fallback;
  const language = value.trim().toLocaleLowerCase().split(/[-_]/u)[0];
  return SUPPORTED_LOCALES.includes(language) ? language : fallback;
}
const LOCALE_PATH_PATTERN = /^\/(fr|de|en|it|es)(?=\/|$)/u;
function localeFromPath(path) {
  const match = path.match(LOCALE_PATH_PATTERN);
  return (match == null ? void 0 : match[1]) ? normalizeLocale(match[1]) : null;
}
function stripLocaleFromPath(path) {
  const stripped = path.replace(LOCALE_PATH_PATTERN, "");
  return stripped || "/";
}
function localizePath(path, locale) {
  const absolutePath = path.startsWith("/") ? path : `/${path}`;
  const unlocalizedPath = stripLocaleFromPath(absolutePath);
  return unlocalizedPath === "/" ? `/${locale}/` : `/${locale}${unlocalizedPath}`;
}

function parseArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
async function listChallengePresetCategories(database, activeOnly = false) {
  const [rows] = await database.execute(`SELECT id,slug,name,description,
    sort_order AS sortOrder,is_active AS isActive FROM challenge_preset_categories
    ${activeOnly ? "WHERE is_active=1" : ""} ORDER BY sort_order,name,id`);
  return rows.map((row) => ({ ...row, isActive: Boolean(row.isActive) }));
}
async function listStoredChallengePresets(database, verbs, activeOnly = false) {
  var _a, _b;
  const where = activeOnly ? "WHERE p.is_active=1 AND category.is_active=1" : "";
  const [[presetRows], [verbRows], [tenseRows]] = await Promise.all([
    database.execute(`SELECT p.id AS databaseId,p.preset_key AS presetKey,
      p.category_id AS categoryId,category.slug AS categorySlug,category.name AS categoryName,
      category.sort_order AS categoryOrder,p.name,p.description,p.question_count AS questionCount,
      p.exercise_kind AS exerciseKind,p.past_simple_pronouns AS pastSimplePronouns,
      p.inclusive_pronouns AS inclusivePronouns,p.complement_options AS complementOptions,
      p.verb_selection_mode AS verbSelectionMode,p.criteria_json AS criteriaJson,
      p.sort_order AS sortOrder,p.is_active AS isActive
      FROM challenge_presets p
      INNER JOIN challenge_preset_categories category ON category.id=p.category_id
      ${where} ORDER BY category.sort_order,p.sort_order,p.name,p.id`),
    database.execute(`SELECT preset_id AS presetId,selection_id AS selectionId
      FROM challenge_preset_verbs ORDER BY preset_id,sort_order,selection_id`),
    database.execute(`SELECT preset_id AS presetId,tense_id AS selectionId
      FROM challenge_preset_tenses ORDER BY preset_id,sort_order,tense_id`)
  ]);
  const verbIdsByPreset = /* @__PURE__ */ new Map();
  for (const row of verbRows) {
    const ids = (_a = verbIdsByPreset.get(Number(row.presetId))) != null ? _a : [];
    ids.push(Number(row.selectionId));
    verbIdsByPreset.set(Number(row.presetId), ids);
  }
  const tenseIdsByPreset = /* @__PURE__ */ new Map();
  for (const row of tenseRows) {
    const ids = (_b = tenseIdsByPreset.get(Number(row.presetId))) != null ? _b : [];
    ids.push(Number(row.selectionId));
    tenseIdsByPreset.set(Number(row.presetId), ids);
  }
  return presetRows.map((row) => {
    var _a2, _b2, _c, _d;
    const complementOptions = normalizeComplementOptions(parseArray(row.complementOptions));
    const legacy = legacyComplementConfig(complementOptions);
    const criteria = parseArray(row.criteriaJson);
    const definition = {
      id: row.presetKey,
      label: row.name,
      description: row.description,
      group: row.categorySlug,
      criteria,
      tenseIds: (_a2 = tenseIdsByPreset.get(Number(row.databaseId))) != null ? _a2 : [],
      questionCount: Number(row.questionCount)
    };
    const resolved = row.verbSelectionMode === "explicit" ? (_b2 = verbIdsByPreset.get(Number(row.databaseId))) != null ? _b2 : [] : (_d = (_c = resolveChallengePresetDefinitions([definition], verbs)[0]) == null ? void 0 : _c.verbIds) != null ? _d : [];
    return {
      databaseId: Number(row.databaseId),
      id: row.presetKey,
      label: row.name,
      description: row.description,
      group: row.categorySlug,
      groupLabel: row.categoryName,
      groupOrder: Number(row.categoryOrder),
      categoryId: Number(row.categoryId),
      criteria,
      verbIds: resolved,
      tenseIds: [...definition.tenseIds],
      questionCount: Number(row.questionCount),
      exerciseKind: row.exerciseKind,
      pastSimplePronouns: row.pastSimplePronouns,
      inclusivePronouns: Boolean(row.inclusivePronouns),
      includeComplements: legacy.includeComplements,
      complementPlacement: legacy.complementPlacement,
      complementOptions,
      sortOrder: Number(row.sortOrder),
      isActive: Boolean(row.isActive),
      verbSelectionMode: row.verbSelectionMode
    };
  });
}
function text$1(value, maximum) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}
function integer$1(value, minimum, maximum) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : null;
}
function uniqueIds(value, allowNegative = false) {
  if (!Array.isArray(value)) return null;
  const ids = value.map(Number);
  if (ids.some((id) => !Number.isInteger(id) || id === 0 || !allowNegative && id < 1)) return null;
  return [...new Set(ids)];
}
const criterionFields = /* @__PURE__ */ new Set([
  "groupeConjugaison",
  "terminaison",
  "typePronominal",
  "niveauDifficulte",
  "registrePrincipal",
  "particularites",
  "niveauxScolaires",
  "parcoursCif",
  "categoriesSemantiques",
  "complementExample"
]);
const criterionOperators = /* @__PURE__ */ new Set([
  "equals",
  "not-equals",
  "includes",
  "not-in",
  "gte",
  "has-anteposable-cod"
]);
function parseCriteria(value) {
  if (!Array.isArray(value)) return null;
  const criteria = value.filter((criterion) => Boolean(criterion) && typeof criterion === "object" && !Array.isArray(criterion));
  if (criteria.length !== value.length || criteria.some((criterion) => !criterionFields.has(String(criterion.field)) || !criterionOperators.has(String(criterion.operator)))) {
    return null;
  }
  return criteria;
}
function parseChallengePresetPayload(value) {
  var _a;
  const body = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const presetKey = text$1(body.id, 80);
  const name = text$1(body.label, 120);
  const description = text$1(body.description, 500);
  const categoryId = integer$1(body.categoryId, 1, Number.MAX_SAFE_INTEGER);
  const questionCount = integer$1(body.questionCount, 1, 100);
  const sortOrder = integer$1(body.sortOrder, -32768, 32767);
  const verbIds = uniqueIds(body.verbIds, true);
  const tenseIds = uniqueIds(body.tenseIds);
  const exerciseKind = body.exerciseKind;
  const pastSimplePronouns = body.pastSimplePronouns;
  const complementOptions = normalizeComplementOptions(body.complementOptions);
  const verbSelectionMode = body.verbSelectionMode === "criteria" ? "criteria" : "explicit";
  const criteria = parseCriteria((_a = body.criteria) != null ? _a : []);
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/u.test(presetKey) || !name || !categoryId || !questionCount || sortOrder === null || !(verbIds == null ? void 0 : verbIds.length) || !(tenseIds == null ? void 0 : tenseIds.length) || criteria === null || !["conjugation", "tense-identification"].includes(String(exerciseKind)) || !["all", "third-person-only"].includes(String(pastSimplePronouns)) || !Array.isArray(body.complementOptions) || complementOptions.length !== body.complementOptions.length || typeof body.inclusivePronouns !== "boolean" || typeof body.isActive !== "boolean") {
    throw createError$1({ statusCode: 400, statusMessage: "D\xE9fi pr\xE9-enregistr\xE9 invalide" });
  }
  return {
    presetKey,
    name,
    description,
    categoryId,
    questionCount,
    exerciseKind,
    pastSimplePronouns,
    inclusivePronouns: body.inclusivePronouns,
    complementOptions,
    verbIds,
    tenseIds,
    sortOrder,
    isActive: body.isActive,
    verbSelectionMode,
    criteria
  };
}
function parseChallengePresetCategoryPayload(value) {
  const body = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const slug = text$1(body.slug, 80).toLocaleLowerCase("fr").normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "");
  const name = text$1(body.name, 120);
  const description = text$1(body.description, 500);
  const sortOrder = integer$1(body.sortOrder, -32768, 32767);
  if (!slug || !name || sortOrder === null || typeof body.isActive !== "boolean") {
    throw createError$1({ statusCode: 400, statusMessage: "Cat\xE9gorie de d\xE9fis invalide" });
  }
  return { slug, name, description, sortOrder, isActive: body.isActive };
}
async function replaceChallengePresetSelections(connection, presetId, verbIds, tenseIds) {
  await connection.execute("DELETE FROM challenge_preset_verbs WHERE preset_id=?", [presetId]);
  for (const [index, id] of verbIds.entries()) {
    await connection.execute(`INSERT INTO challenge_preset_verbs
      (preset_id,selection_id,sort_order) VALUES (?,?,?)`, [presetId, id, index]);
  }
  await connection.execute("DELETE FROM challenge_preset_tenses WHERE preset_id=?", [presetId]);
  for (const [index, id] of tenseIds.entries()) {
    await connection.execute(`INSERT INTO challenge_preset_tenses
      (preset_id,tense_id,sort_order) VALUES (?,?,?)`, [presetId, id, index]);
  }
}
async function reorderChallengePresets(connection, categoryId, presetId, requestedOrder) {
  const [rows] = await connection.execute(`SELECT id
    FROM challenge_presets WHERE category_id=? ${presetId ? "AND id<>?" : ""}
    ORDER BY sort_order,name,id`, presetId ? [categoryId, presetId] : [categoryId]);
  const ids = rows.map((row) => Number(row.id));
  if (presetId) {
    const position = Math.max(0, Math.min(ids.length, Number(requestedOrder != null ? requestedOrder : ids.length + 1) - 1));
    ids.splice(position, 0, presetId);
  }
  for (const [index, id] of ids.entries()) {
    await connection.execute("UPDATE challenge_presets SET sort_order=? WHERE id=?", [index + 1, id]);
  }
  return ids.map((id, index) => ({ id, sortOrder: index + 1 }));
}

const CATALOGUE_CACHE_TTL_MS = 10 * 60 * 1e3;
const catalogueCache = /* @__PURE__ */ new Map();
const catalogueLoads = /* @__PURE__ */ new Map();
let catalogueCacheVersion = 0;
async function getCatalogue(locale = "fr") {
  var _a, _b, _c, _d;
  const database = useDatabase();
  const requestedLocale = normalizeLocale(locale, "fr");
  const [verbesResult, modesResult, tempsResult, semanticResult, meaningResult, pronominalResult, complementResult, mangerExamplesResult] = await Promise.all([
    database.execute(`
      SELECT v.id, v.infinitif,
             \`participe_pr\xE9sent\` AS participe_present,
             \`participe_pass\xE9\` AS participe_passe,
             v.auxiliaire, v.groupe_conjugaison, f.slug AS famille_conjugaison,
             v.terminaison_infinitif, v.type_pronominal, v.est_impersonnel, v.est_defectif,
             v.personnes_disponibles, v.type_h_initial, v.niveau_difficulte, v.niveau_cecrl,
             v.rang_frequence, v.registre_principal, v.forme_canonique, v.statut_validation,
             v.particularites, v.niveaux_scolaires, v.parcours_cif,
             v.pronominalisable
      FROM verbes v
      LEFT JOIN familles_conjugaison f ON f.id = v.famille_conjugaison_id
      WHERE v.est_archive = 0
      ORDER BY COALESCE(v.forme_canonique, v.infinitif), v.id
    `),
    database.execute(`
      SELECT id, code, name, \`order\` AS sort_order
      FROM modes
      ORDER BY \`order\`, id
    `),
    database.execute(`
      SELECT id, mode_id, code, name,
             isTempsCompose AS is_compound,
             selected
      FROM temps
      ORDER BY mode_id, id
    `),
    database.execute(`
      SELECT DISTINCT vs.verbe_id, cs.slug, cs.sort_order
      FROM verbe_sens vs
      INNER JOIN verbe_sens_categories vsc ON vsc.sens_id = vs.id
      INNER JOIN categories_semantiques cs ON cs.id = vsc.categorie_id
      ORDER BY vs.verbe_id, cs.sort_order, cs.slug
    `),
    database.execute(`
      SELECT vs.verbe_id,
             CASE WHEN ?='fr' THEN vs.intitule
               ELSE COALESCE(requested.intitule, french.intitule, vs.intitule) END AS intitule,
             CASE WHEN ?='fr' THEN vs.definition
               ELSE COALESCE(requested.definition, french.definition, vs.definition) END AS definition,
             vs.est_principal, vs.numero_sens
      FROM verbe_sens vs
      LEFT JOIN verbe_sens_translations requested
        ON requested.sens_id=vs.id AND requested.locale=?
      LEFT JOIN verbe_sens_translations french
        ON french.sens_id=vs.id AND french.locale='fr'
      ORDER BY vs.verbe_id, vs.est_principal DESC, vs.numero_sens, vs.sort_order, vs.id
    `, [requestedLocale, requestedLocale, requestedLocale]),
    database.execute(`
      SELECT id, verbe_id, infinitif_pronominal, type_emploi, fonction_pronom,
             regle_accord, preposition, statut_validation
      FROM emplois_pronominaux
      WHERE actif=1 AND verbe_id IS NOT NULL
      ORDER BY infinitif_pronominal, id
    `),
    database.execute(`
      SELECT vs.verbe_id, cv.fonction_objet, cv.preposition, c.texte, c.texte_antepose,
             c.genre, c.nombre
      FROM verbe_sens vs
      INNER JOIN constructions_verbales cv ON cv.sens_id=vs.id
      INNER JOIN complements_verbaux c ON c.construction_id=cv.id
      INNER JOIN verbes v ON v.id=vs.verbe_id
      WHERE v.est_archive=0 AND cv.actif=1 AND cv.statut_validation='valide'
        AND c.actif=1 AND c.statut_validation='valide'
        AND cv.fonction_objet IN ('cod', 'coi')
      ORDER BY vs.verbe_id,
        (cv.fonction_objet='cod' AND c.texte_antepose IS NOT NULL) DESC,
        cv.id, c.id
    `),
    database.execute(`
      SELECT vc.temp_id, p.pronom, vc.conjugaison1, m.name AS mode_name
      FROM verbesconjugues vc
      INNER JOIN verbes v ON v.id=vc.verbe_id
      INNER JOIN personnes p ON p.id=vc.personne_id
      INNER JOIN temps t ON t.id=vc.temp_id
      INNER JOIN modes m ON m.id=t.mode_id
      WHERE v.infinitif='manger' AND vc.conjugaison1 <> ''
      ORDER BY vc.temp_id, p.id
    `)
  ]);
  const parseArray = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };
  const semanticsByVerb = /* @__PURE__ */ new Map();
  for (const row of semanticResult[0]) {
    const categories = (_a = semanticsByVerb.get(Number(row.verbe_id))) != null ? _a : [];
    categories.push(row.slug);
    semanticsByVerb.set(Number(row.verbe_id), categories);
  }
  const meaningByVerb = /* @__PURE__ */ new Map();
  for (const row of meaningResult[0]) {
    const verbId = Number(row.verbe_id);
    if (meaningByVerb.has(verbId)) continue;
    const definition = (_b = row.definition) == null ? void 0 : _b.trim();
    const genericTitle = /^sens principal de\s+[«"']?/iu.test(row.intitule.trim());
    const meaning = definition || (genericTitle ? "" : row.intitule.trim());
    if (meaning) meaningByVerb.set(verbId, meaning);
  }
  const complementByVerb = /* @__PURE__ */ new Map();
  const complementFunctionsByVerb = /* @__PURE__ */ new Map();
  const anteposableComplementFunctionsByVerb = /* @__PURE__ */ new Map();
  for (const row of complementResult[0]) {
    const verbId = Number(row.verbe_id);
    const functions = (_c = complementFunctionsByVerb.get(verbId)) != null ? _c : /* @__PURE__ */ new Set();
    functions.add(row.fonction_objet);
    complementFunctionsByVerb.set(verbId, functions);
    const anteposable = (_d = anteposableComplementFunctionsByVerb.get(verbId)) != null ? _d : /* @__PURE__ */ new Set();
    if (row.fonction_objet === "cod" && row.texte_antepose || row.fonction_objet === "coi" && indirectRelative(row.texte, row.preposition, row.genre, row.nombre)) {
      anteposable.add(row.fonction_objet);
    }
    anteposableComplementFunctionsByVerb.set(verbId, anteposable);
    if (!complementByVerb.has(verbId)) {
      complementByVerb.set(verbId, {
        functionObject: row.fonction_objet,
        after: row.texte,
        before: row.texte_antepose
      });
    }
  }
  const verbs = verbesResult[0].map((row) => {
    var _a2, _b2, _c2, _d2, _e;
    return {
      id: Number(row.id),
      infinitif: row.infinitif,
      meaning: (_a2 = meaningByVerb.get(Number(row.id))) != null ? _a2 : null,
      participePresent: row.participe_present,
      participePasse: row.participe_passe,
      auxiliaire: row.auxiliaire,
      groupeConjugaison: row.groupe_conjugaison ? Number(row.groupe_conjugaison) : null,
      familleConjugaison: row.famille_conjugaison,
      terminaison: row.terminaison_infinitif,
      typePronominal: row.type_pronominal || "aucun",
      estImpersonnel: Boolean(row.est_impersonnel),
      estDefectif: Boolean(row.est_defectif),
      personnesDisponibles: parseArray(row.personnes_disponibles),
      typeHInitial: row.type_h_initial,
      niveauDifficulte: row.niveau_difficulte === null ? null : Number(row.niveau_difficulte),
      niveauCecrl: row.niveau_cecrl,
      rangFrequence: row.rang_frequence === null ? null : Number(row.rang_frequence),
      registrePrincipal: row.registre_principal,
      formeCanonique: row.forme_canonique || row.infinitif,
      statutValidation: row.statut_validation || "genere",
      particularites: parseArray(row.particularites),
      niveauxScolaires: parseArray(row.niveaux_scolaires),
      parcoursCif: parseArray(row.parcours_cif),
      categoriesSemantiques: (_b2 = semanticsByVerb.get(Number(row.id))) != null ? _b2 : [],
      pronominalisable: Boolean(row.pronominalisable),
      isPronominalForm: /^(s['’]|se\s)/iu.test(row.infinitif),
      baseVerbId: null,
      pronominalUseId: null,
      pronominalType: null,
      pronounFunction: null,
      agreementRule: null,
      requiredPreposition: null,
      complementExample: (_c2 = complementByVerb.get(Number(row.id))) != null ? _c2 : null,
      complementFunctions: [...(_d2 = complementFunctionsByVerb.get(Number(row.id))) != null ? _d2 : []],
      anteposableComplementFunctions: [...(_e = anteposableComplementFunctionsByVerb.get(Number(row.id))) != null ? _e : []]
    };
  });
  const byId = new Map(verbs.map((verb) => [verb.id, verb]));
  const virtualPronominals = pronominalResult[0].flatMap((use) => {
    const base = byId.get(Number(use.verbe_id));
    if (!base) return [];
    const pronominalParticiple = (base.participePresent || "").split("-").map((form) => form.trim()).filter(Boolean).map((form) => {
      const first = form.normalize("NFD").replace(/\p{Diacritic}/gu, "").charAt(0).toLowerCase();
      const elide = "aeiouy".includes(first) || first === "h" && base.typeHInitial !== "aspire";
      return `${elide ? "s'" : "se "}${form}`;
    }).join("-");
    return [{
      ...base,
      id: encodePronominalSelectionId(Number(use.id)),
      infinitif: use.infinitif_pronominal,
      participePresent: pronominalParticiple,
      auxiliaire: "\xEAtre",
      typePronominal: use.type_emploi === "essentiel" ? "essentiel" : "occasionnel",
      particularites: [.../* @__PURE__ */ new Set([...base.particularites, "pronominal"])],
      pronominalisable: true,
      isPronominalForm: true,
      baseVerbId: base.id,
      pronominalUseId: Number(use.id),
      pronominalType: use.type_emploi,
      pronounFunction: use.fonction_pronom,
      agreementRule: use.regle_accord,
      requiredPreposition: use.preposition,
      complementExample: null
    }];
  });
  const catalogueVerbs = [...verbs, ...virtualPronominals].sort((left, right) => left.infinitif.localeCompare(right.infinitif, "fr") || left.id - right.id);
  const modeNameById = new Map(modesResult[0].map((mode) => [Number(mode.id), mode.name]));
  const tenseExamples = buildTenseExamples(
    tempsResult[0].map((tense) => {
      var _a2;
      return {
        id: Number(tense.id),
        mode: (_a2 = modeNameById.get(Number(tense.mode_id))) != null ? _a2 : "",
        name: tense.name
      };
    }),
    mangerExamplesResult[0]
  );
  let presets;
  try {
    presets = await listStoredChallengePresets(database, catalogueVerbs, true);
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : null;
    if (code !== "ER_NO_SUCH_TABLE") throw error;
    presets = resolveChallengePresets(catalogueVerbs);
  }
  return {
    verbes: catalogueVerbs,
    modes: modesResult[0].map((row) => ({
      id: Number(row.id),
      code: row.code || grammarModeCode(row.name) || "indicative",
      name: row.name,
      order: Number(row.sort_order)
    })),
    temps: tempsResult[0].map((row) => ({
      id: Number(row.id),
      modeId: Number(row.mode_id),
      code: row.code || grammarTenseCode(row.name) || "present",
      name: row.name,
      isCompound: Boolean(row.is_compound),
      selected: Boolean(row.selected),
      example: tenseExamples.get(Number(row.id))
    })),
    presets
  };
}
async function getCachedCatalogue(locale = "fr", loader = getCatalogue) {
  const requestedLocale = normalizeLocale(locale, "fr");
  const cached = catalogueCache.get(requestedLocale);
  if (cached && cached.expiresAt > Date.now()) {
    return { catalogue: cached.value, status: "HIT" };
  }
  if (cached) catalogueCache.delete(requestedLocale);
  const activeLoad = catalogueLoads.get(requestedLocale);
  if (activeLoad) {
    return { catalogue: await activeLoad, status: "COALESCED" };
  }
  const version = catalogueCacheVersion;
  const load = loader(requestedLocale);
  catalogueLoads.set(requestedLocale, load);
  try {
    const catalogue = await load;
    if (version === catalogueCacheVersion) {
      catalogueCache.set(requestedLocale, {
        value: catalogue,
        expiresAt: Date.now() + CATALOGUE_CACHE_TTL_MS
      });
    }
    return { catalogue, status: "MISS" };
  } finally {
    if (catalogueLoads.get(requestedLocale) === load) {
      catalogueLoads.delete(requestedLocale);
    }
  }
}
function invalidateCatalogueCache() {
  catalogueCacheVersion += 1;
  catalogueCache.clear();
  catalogueLoads.clear();
}

const catalogue = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  getCachedCatalogue: getCachedCatalogue,
  getCatalogue: getCatalogue,
  invalidateCatalogueCache: invalidateCatalogueCache
}, Symbol.toStringTag, { value: 'Module' }));

const _tfOtJNAOlHYSBAoNhgJlF4qW4RlJtE_4zzODYwG3H8 = defineNitroPlugin(async () => {
  const connection = await useDatabase().getConnection();
  try {
    await connection.beginTransaction();
    const result = await migrateChallengeGroupCriteria(connection);
    await connection.commit();
    invalidateCatalogueCache();
    console.info(
      `[database] ${result.presetCount} d\xE9fis de groupes r\xE9solus dynamiquement` + (result.removedSelections ? ` ; ${result.removedSelections} anciennes s\xE9lections explicites supprim\xE9es.` : " ; aucune s\xE9lection explicite restante.")
    );
  } catch (error) {
    await connection.rollback();
    console.error("[database] \xC9chec de la migration dynamique des d\xE9fis de groupes.", error);
  } finally {
    connection.release();
  }
});

const _aCMECTWiwhQ_cHUZU9mps2K8n7GsVqimroMp6HH1F8 = defineNitroPlugin(async () => {
  try {
    const database = useDatabase();
    const [result] = await database.execute(`
      UPDATE challenge_presets
      SET question_count=10
      WHERE question_count<>10
    `);
    console.info(
      `[database] D\xE9fis pr\xE9fabriqu\xE9s limit\xE9s \xE0 10 questions` + (result.affectedRows ? ` (${result.affectedRows} mis \xE0 jour).` : ".")
    );
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : null;
    if (code === "ER_NO_SUCH_TABLE") return;
    console.error("[database] \xC9chec de la mise \xE0 jour du nombre de questions des d\xE9fis.", error);
  }
});

const DEFAULT_CONTACT_SETTINGS = {
  enabled: true,
  contactEmail: "christophe.roulet@edu-vd.ch",
  subjectMinLength: 5,
  subjectMaxLength: 120,
  messageMinLength: 20,
  messageMaxLength: 3e3,
  maxLinks: 2,
  shortRateLimit: 3,
  shortRateWindowMinutes: 120,
  dailyRateLimit: 8
};
function integer(value, minimum, maximum, label) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw createError$1({
      statusCode: 400,
      statusMessage: "R\xE9glages invalides",
      message: `${label} doit \xEAtre compris entre ${minimum} et ${maximum}.`
    });
  }
  return parsed;
}
function validateContactSettings(input) {
  const contactEmail = typeof input.contactEmail === "string" ? input.contactEmail.trim().toLocaleLowerCase() : "";
  if (contactEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(contactEmail)) {
    throw createError$1({ statusCode: 400, statusMessage: "Adresse destinataire invalide" });
  }
  const settings = {
    enabled: input.enabled === true,
    contactEmail,
    subjectMinLength: integer(input.subjectMinLength, 1, 100, "La longueur minimale de l\u2019objet"),
    subjectMaxLength: integer(input.subjectMaxLength, 5, 200, "La longueur maximale de l\u2019objet"),
    messageMinLength: integer(input.messageMinLength, 1, 500, "La longueur minimale du message"),
    messageMaxLength: integer(input.messageMaxLength, 100, 1e4, "La longueur maximale du message"),
    maxLinks: integer(input.maxLinks, 0, 10, "Le nombre de liens"),
    shortRateLimit: integer(input.shortRateLimit, 1, 100, "La limite courte"),
    shortRateWindowMinutes: integer(input.shortRateWindowMinutes, 5, 1440, "La dur\xE9e de la limite courte"),
    dailyRateLimit: integer(input.dailyRateLimit, 1, 500, "La limite journali\xE8re")
  };
  if (settings.subjectMinLength > settings.subjectMaxLength) {
    throw createError$1({ statusCode: 400, statusMessage: "La longueur minimale de l\u2019objet d\xE9passe sa longueur maximale" });
  }
  if (settings.messageMinLength > settings.messageMaxLength) {
    throw createError$1({ statusCode: 400, statusMessage: "La longueur minimale du message d\xE9passe sa longueur maximale" });
  }
  if (settings.shortRateLimit > settings.dailyRateLimit) {
    throw createError$1({ statusCode: 400, statusMessage: "La limite courte d\xE9passe la limite journali\xE8re" });
  }
  return settings;
}
async function getContactSettings(database = useDatabase()) {
  const [[row]] = await database.execute(`
    SELECT
      is_enabled AS enabled,
      contact_email AS contactEmail,
      subject_min_length AS subjectMinLength,
      subject_max_length AS subjectMaxLength,
      message_min_length AS messageMinLength,
      message_max_length AS messageMaxLength,
      max_links AS maxLinks,
      short_rate_limit AS shortRateLimit,
      short_rate_window_minutes AS shortRateWindowMinutes,
      daily_rate_limit AS dailyRateLimit
    FROM contact_settings
    WHERE id = 1
  `);
  if (!row) return { ...DEFAULT_CONTACT_SETTINGS };
  return {
    enabled: Boolean(row.enabled),
    contactEmail: row.contactEmail,
    subjectMinLength: Number(row.subjectMinLength),
    subjectMaxLength: Number(row.subjectMaxLength),
    messageMinLength: Number(row.messageMinLength),
    messageMaxLength: Number(row.messageMaxLength),
    maxLinks: Number(row.maxLinks),
    shortRateLimit: Number(row.shortRateLimit),
    shortRateWindowMinutes: Number(row.shortRateWindowMinutes),
    dailyRateLimit: Number(row.dailyRateLimit)
  };
}
async function saveContactSettings(database, settings) {
  await database.execute(`
    INSERT INTO contact_settings (
      id, is_enabled, contact_email,
      subject_min_length, subject_max_length,
      message_min_length, message_max_length, max_links,
      short_rate_limit, short_rate_window_minutes, daily_rate_limit
    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      is_enabled = VALUES(is_enabled),
      contact_email = VALUES(contact_email),
      subject_min_length = VALUES(subject_min_length),
      subject_max_length = VALUES(subject_max_length),
      message_min_length = VALUES(message_min_length),
      message_max_length = VALUES(message_max_length),
      max_links = VALUES(max_links),
      short_rate_limit = VALUES(short_rate_limit),
      short_rate_window_minutes = VALUES(short_rate_window_minutes),
      daily_rate_limit = VALUES(daily_rate_limit)
  `, [
    settings.enabled ? 1 : 0,
    settings.contactEmail,
    settings.subjectMinLength,
    settings.subjectMaxLength,
    settings.messageMinLength,
    settings.messageMaxLength,
    settings.maxLinks,
    settings.shortRateLimit,
    settings.shortRateWindowMinutes,
    settings.dailyRateLimit
  ]);
}

const _QQ3_jm_M8WHw8h_XJhiQZi3NFofRBeGDgShBG2LW_8 = defineNitroPlugin(async () => {
  try {
    const database = useDatabase();
    await database.query(`
      CREATE TABLE IF NOT EXISTS contact_settings (
        id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
        is_enabled TINYINT(1) NOT NULL DEFAULT 1,
        contact_email VARCHAR(254) NOT NULL,
        subject_min_length SMALLINT UNSIGNED NOT NULL DEFAULT 5,
        subject_max_length SMALLINT UNSIGNED NOT NULL DEFAULT 120,
        message_min_length SMALLINT UNSIGNED NOT NULL DEFAULT 20,
        message_max_length SMALLINT UNSIGNED NOT NULL DEFAULT 3000,
        max_links TINYINT UNSIGNED NOT NULL DEFAULT 2,
        short_rate_limit SMALLINT UNSIGNED NOT NULL DEFAULT 3,
        short_rate_window_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 120,
        daily_rate_limit SMALLINT UNSIGNED NOT NULL DEFAULT 8,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await database.execute(`
      INSERT IGNORE INTO contact_settings (
        id, is_enabled, contact_email,
        subject_min_length, subject_max_length,
        message_min_length, message_max_length, max_links,
        short_rate_limit, short_rate_window_minutes, daily_rate_limit
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      DEFAULT_CONTACT_SETTINGS.enabled ? 1 : 0,
      useRuntimeConfig().contactEmail || DEFAULT_CONTACT_SETTINGS.contactEmail,
      DEFAULT_CONTACT_SETTINGS.subjectMinLength,
      DEFAULT_CONTACT_SETTINGS.subjectMaxLength,
      DEFAULT_CONTACT_SETTINGS.messageMinLength,
      DEFAULT_CONTACT_SETTINGS.messageMaxLength,
      DEFAULT_CONTACT_SETTINGS.maxLinks,
      DEFAULT_CONTACT_SETTINGS.shortRateLimit,
      DEFAULT_CONTACT_SETTINGS.shortRateWindowMinutes,
      DEFAULT_CONTACT_SETTINGS.dailyRateLimit
    ]);
    console.info("[contact] R\xE9glages du formulaire disponibles.");
  } catch (error) {
    console.error("[contact] \xC9chec de la pr\xE9paration des r\xE9glages du formulaire.", error);
  }
});

const _W6EmE61CNpKiO0DniMnORvCS4gw0wKBQ2elDKHwm3Vk = defineNitroPlugin((nitro) => {
  nitro.hooks.hook("render:html", (html, { event }) => {
    const nonce = event.context.cspNonce;
    if (typeof nonce !== "string" || !nonce) return;
    const addNonce = (part) => part.replace(
      /<script(?![^>]*\snonce=)/gu,
      `<script nonce="${nonce}"`
    );
    const stamp = (parts) => {
      for (let index = 0; index < parts.length; index += 1) {
        parts[index] = addNonce(parts[index]);
      }
    };
    stamp(html.head);
    stamp(html.bodyPrepend);
    stamp(html.body);
    stamp(html.bodyAppend);
  });
});

const _zCJu2owYZ87LBosIyRTpSguHxfCuM7YreKVJ9ejQI = defineNitroPlugin(async () => {
  const database = useDatabase();
  try {
    const [tables] = await database.query(
      "SHOW TABLES LIKE 'coach_character_reaction_rules'"
    );
    if (tables.length === 0) {
      console.warn("[database] Migration des fr\xE9quences ignor\xE9e : table coach_character_reaction_rules absente.");
      return;
    }
    const [columns] = await database.query(
      "SHOW COLUMNS FROM coach_character_reaction_rules"
    );
    const columnNames = new Set(columns.map((column) => column.Field));
    let added = 0;
    if (!columnNames.has("animation_probability")) {
      await database.query(
        "ALTER TABLE coach_character_reaction_rules ADD COLUMN animation_probability DECIMAL(4,3) NOT NULL DEFAULT 0 AFTER media_probability"
      );
      await database.query(
        "UPDATE coach_character_reaction_rules SET animation_probability=media_probability"
      );
      columnNames.add("animation_probability");
      added += 1;
    }
    if (!columnNames.has("emoji_probability")) {
      await database.query(
        "ALTER TABLE coach_character_reaction_rules ADD COLUMN emoji_probability DECIMAL(4,3) NOT NULL DEFAULT 0 AFTER animation_probability"
      );
      await database.query(
        "UPDATE coach_character_reaction_rules SET emoji_probability=media_probability"
      );
      added += 1;
    }
    console.info(
      added ? `[database] Migration des fr\xE9quences termin\xE9e : ${added} colonne(s) ajout\xE9e(s).` : "[database] Migration des fr\xE9quences d\xE9j\xE0 appliqu\xE9e."
    );
  } catch (error) {
    console.error("[database] \xC9chec de la migration automatique des fr\xE9quences.", error);
  }
});

const DEFAULT_OPTIONS = {
  ignoreCase: true,
  ignoreWhitespace: true,
  normalizeApostrophes: true,
  unicodeForm: "NFC"
};
const APOSTROPHE_VARIANTS = /[\u0060\u00b4\u02b9\u02bb\u02bc\u02bd\u02be\u02bf\u055a\u2018\u2019\u201b\u2032\u2035\uff07]/gu;
const SUBJECT_WORDS = /* @__PURE__ */ new Set(["je", "j", "tu", "il", "elle", "iel"]);
const REFLEXIVE_WORDS = /* @__PURE__ */ new Set(["me", "m", "te", "t", "se", "s"]);
function normalizeAnswer(answer, options = {}) {
  if (typeof answer !== "string") {
    return "";
  }
  const resolved = { ...DEFAULT_OPTIONS, ...options };
  let normalized = answer;
  if (resolved.unicodeForm) {
    normalized = normalized.normalize(resolved.unicodeForm);
  }
  if (resolved.normalizeApostrophes) {
    normalized = normalized.replace(APOSTROPHE_VARIANTS, "'");
  }
  if (resolved.ignoreCase) {
    normalized = normalized.toLocaleLowerCase("fr-CH");
  }
  if (resolved.ignoreWhitespace) {
    normalized = normalized.replace(/\s/gu, "");
  } else {
    normalized = normalized.trim();
  }
  return normalized;
}
function validateAnswer(answer, expectedAnswers, options = {}) {
  const safeAnswer = typeof answer === "string" ? answer : "";
  const safeExpectedAnswers = Array.isArray(expectedAnswers) ? expectedAnswers.filter((candidate) => typeof candidate === "string") : [];
  const normalizedAnswer = normalizeAnswer(safeAnswer, options);
  const normalizedExpectedAnswers = safeExpectedAnswers.map(
    (candidate) => normalizeAnswer(candidate, options)
  );
  if (!normalizedAnswer) {
    return {
      isCorrect: false,
      reason: "empty-answer",
      answer: safeAnswer,
      normalizedAnswer,
      expectedAnswers: safeExpectedAnswers,
      normalizedExpectedAnswers,
      matchedAnswer: null
    };
  }
  if (safeExpectedAnswers.length === 0) {
    return {
      isCorrect: false,
      reason: "no-expected-answer",
      answer: safeAnswer,
      normalizedAnswer,
      expectedAnswers: safeExpectedAnswers,
      normalizedExpectedAnswers,
      matchedAnswer: null
    };
  }
  const matchIndex = normalizedExpectedAnswers.findIndex(
    (candidate) => candidate.length > 0 && candidate === normalizedAnswer
  );
  return {
    isCorrect: matchIndex >= 0,
    reason: matchIndex >= 0 ? "correct" : "no-match",
    answer: safeAnswer,
    normalizedAnswer,
    expectedAnswers: safeExpectedAnswers,
    normalizedExpectedAnswers,
    matchedAnswer: matchIndex >= 0 ? safeExpectedAnswers[matchIndex] : null
  };
}
function isFutureSimpleInsteadOfNearFuture(answer, question) {
  var _a;
  return Boolean((_a = question.futureSimpleAnswers) == null ? void 0 : _a.length) && validateAnswer(answer, question.futureSimpleAnswers || []).isCorrect;
}
function findConjugationConfusions(answer, question) {
  return (question.conjugationConfusions || []).filter(
    (candidate) => validateAnswer(answer, candidate.answers).isCorrect
  );
}
function lexicalWords(value) {
  if (typeof value !== "string") return [];
  return normalizeAnswer(value, { ignoreWhitespace: false }).replace(APOSTROPHE_VARIANTS, "'").match(/\p{L}+/gu) || [];
}
function singularPersonGroup(question) {
  const personId = Number(question.personId);
  if (personId === 4 || personId === 5) return "first-or-second-singular";
  if (personId === 6) return "third-singular";
  const subjectWords = lexicalWords(question.pronom || question.saisiePrefixe);
  if (subjectWords.some((word) => word === "je" || word === "j" || word === "tu")) {
    return "first-or-second-singular";
  }
  if (subjectWords.some((word) => word === "il" || word === "elle" || word === "iel")) {
    return "third-singular";
  }
  return null;
}
function conjugatedWord(answer, personGroup) {
  const answerWords = lexicalWords(answer);
  if (!answerWords.length) return "";
  const expectedSubjects = personGroup === "first-or-second-singular" ? /* @__PURE__ */ new Set(["je", "j", "tu"]) : /* @__PURE__ */ new Set(["il", "elle", "iel"]);
  let startIndex = -1;
  answerWords.forEach((word, index) => {
    if (expectedSubjects.has(word)) startIndex = index + 1;
  });
  const formWords = answerWords.slice(startIndex >= 0 ? startIndex : 0);
  while (formWords.length && (SUBJECT_WORDS.has(formWords[0]) || REFLEXIVE_WORDS.has(formWords[0]))) {
    formWords.shift();
  }
  return formWords[0] || "";
}
function findImpossibleSingularEnding(answer, question) {
  const personGroup = singularPersonGroup(question);
  if (!personGroup) return null;
  const form = conjugatedWord(answer, personGroup);
  const ending = Array.from(form).at(-1);
  let impossibleEnding;
  if (personGroup === "first-or-second-singular") {
    if (ending !== "t" && ending !== "d") return null;
    impossibleEnding = ending;
  } else {
    if (ending !== "s" && ending !== "x") return null;
    impossibleEnding = ending;
  }
  return {
    personGroup,
    target: question.isCompound ? "auxiliary" : "verb",
    ending: impossibleEnding
  };
}
function impossibleSingularEndingReminderMessage(reminder) {
  if (reminder.target === "auxiliary") {
    return reminder.personGroup === "first-or-second-singular" ? "Dans un temps compos\xE9, c\u2019est l\u2019auxiliaire qui se conjugue. Avec \xAB je \xBB ou \xAB tu \xBB, il ne peut pas se terminer par \xAB -t \xBB ou \xAB -d \xBB." : "Dans un temps compos\xE9, c\u2019est l\u2019auxiliaire qui se conjugue. Avec \xAB il \xBB, \xAB elle \xBB ou \xAB iel \xBB, il ne peut pas se terminer par \xAB -s \xBB ou \xAB -x \xBB.";
  }
  return reminder.personGroup === "first-or-second-singular" ? "Avec \xAB je \xBB ou \xAB tu \xBB, une forme conjugu\xE9e ne peut pas se terminer par \xAB -t \xBB ou \xAB -d \xBB." : "Avec \xAB il \xBB, \xAB elle \xBB ou \xAB iel \xBB, une forme conjugu\xE9e ne peut pas se terminer par \xAB -s \xBB ou \xAB -x \xBB.";
}
function getAlternativeCorrections(answer, corrections) {
  const safeAnswer = typeof answer === "string" ? answer : "";
  const normalizedAnswer = normalizeAnswer(safeAnswer).replace(/[.!?]+$/u, "");
  const safeCorrections = Array.isArray(corrections) ? corrections.filter((candidate) => typeof candidate === "string" && candidate.trim().length > 0) : [];
  if (!normalizedAnswer || safeCorrections.length < 2) return [];
  const normalizedCorrections = safeCorrections.map((correction) => normalizeAnswer(correction).replace(/[.!?]+$/u, ""));
  const matchesAnswer = (normalizedCorrection) => normalizedCorrection === normalizedAnswer || normalizedCorrection.endsWith(normalizedAnswer);
  if (!normalizedCorrections.some(matchesAnswer)) return [];
  const seen = /* @__PURE__ */ new Set();
  return safeCorrections.filter((_, index) => {
    const normalizedCorrection = normalizedCorrections[index];
    if (matchesAnswer(normalizedCorrection) || seen.has(normalizedCorrection)) return false;
    seen.add(normalizedCorrection);
    return true;
  });
}

const AUXILIARIES = /* @__PURE__ */ new Set([
  "ai",
  "as",
  "a",
  "avons",
  "avez",
  "ont",
  "avais",
  "avait",
  "avions",
  "aviez",
  "avaient",
  "aurai",
  "auras",
  "aura",
  "aurons",
  "aurez",
  "auront",
  "aie",
  "aies",
  "ait",
  "ayons",
  "ayez",
  "aient",
  "suis",
  "es",
  "est",
  "sommes",
  "\xEAtes",
  "sont",
  "\xE9tais",
  "\xE9tait",
  "\xE9tions",
  "\xE9tiez",
  "\xE9taient",
  "serai",
  "seras",
  "sera",
  "serons",
  "serez",
  "seront",
  "sois",
  "soit",
  "soyons",
  "soyez",
  "soient"
]);
function comparable(value) {
  return normalizeAnswer(value).replace(/[.!?;,«»"()[\]{}:…-]/gu, "");
}
function withoutDiacritics(value) {
  return comparable(value).normalize("NFD").replace(/\p{Diacritic}/gu, "");
}
function words(value) {
  return normalizeAnswer(value, { ignoreWhitespace: false }).replace(/[’']/gu, " ").replace(/[^\p{L}-]+/gu, " ").trim().split(/\s+/u).filter(Boolean);
}
function editDistance$1(left, right) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let diagonal = previous[0];
    previous[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const above = previous[rightIndex];
      previous[rightIndex] = Math.min(
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + 1,
        diagonal + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1)
      );
      diagonal = above;
    }
  }
  return previous[right.length];
}
function closestExpected(answer, candidates) {
  const safeCandidates = candidates.filter((candidate) => typeof candidate === "string" && candidate.trim());
  return safeCandidates.reduce((best, candidate) => {
    const distance = editDistance$1(comparable(answer), comparable(candidate));
    return !best || distance < best.distance ? { value: candidate, distance } : best;
  }, void 0);
}
function differingWord(answer, expected) {
  const answerWords = words(answer);
  const expectedWords = words(expected);
  if (answerWords.length !== expectedWords.length) return void 0;
  const differences = expectedWords.flatMap((word, index) => word === answerWords[index] ? [] : [{ learner: answerWords[index], expected: word }]);
  return differences.length === 1 ? differences[0] : void 0;
}
function agreementBase(value) {
  return value.replace(/(?:es|s|e)$/u, "");
}
function agreementStems(value) {
  const normalized = comparable(value);
  return new Set([
    normalized,
    normalized.replace(/es$/u, ""),
    normalized.replace(/s$/u, ""),
    normalized.replace(/e$/u, "")
  ].filter(Boolean));
}
function belongsToSameAgreementFamily(left, right) {
  const leftStems = agreementStems(left);
  return [...agreementStems(right)].some((stem) => leftStems.has(stem));
}
function commonPrefix(left, right) {
  let length = 0;
  while (length < left.length && length < right.length && left[length] === right[length]) length += 1;
  return length;
}
function auxiliaryIn(value) {
  return words(value).find((word) => AUXILIARIES.has(word));
}
function compoundParticipleDifference(learnerAnswer, expectedAnswer) {
  const learnerWords = words(learnerAnswer);
  const expectedWords = words(expectedAnswer);
  const auxiliaryIndex = expectedWords.findIndex((word) => AUXILIARIES.has(word));
  if (auxiliaryIndex < 0 || learnerWords[auxiliaryIndex] !== expectedWords[auxiliaryIndex]) return void 0;
  const expectedParticiple = expectedWords[auxiliaryIndex + 1];
  const learnerForm = learnerWords[auxiliaryIndex + 1];
  if (!expectedParticiple || !learnerForm || expectedParticiple === learnerForm) return void 0;
  if (belongsToSameAgreementFamily(learnerForm, expectedParticiple)) return void 0;
  if (commonPrefix(learnerForm, expectedParticiple) < 2) return void 0;
  return {
    auxiliary: expectedWords[auxiliaryIndex],
    expectedParticiple,
    learnerForm
  };
}
function displayedCorrection(question, fallback) {
  return question.reponsesPourCorrige.find((candidate) => candidate.trim()) || fallback;
}
function diagnoseCoachAgreement(learnerAnswer, question) {
  if (!question.isCompound && !question.agreementReminder) return void 0;
  const learnerWords = words(learnerAnswer);
  const learnerParticiple = learnerWords.at(-1);
  if (!learnerParticiple) return void 0;
  const expected = question.reponses.filter((candidate) => candidate.trim()).map((candidate) => ({
    value: candidate,
    words: words(candidate),
    distance: editDistance$1(comparable(learnerAnswer), comparable(candidate))
  })).filter((candidate) => {
    const expectedParticiple2 = candidate.words.at(-1);
    return expectedParticiple2 && learnerParticiple !== expectedParticiple2 && belongsToSameAgreementFamily(learnerParticiple, expectedParticiple2);
  }).sort((left, right) => left.distance - right.distance)[0];
  const expectedParticiple = expected == null ? void 0 : expected.words.at(-1);
  if (!expected || !expectedParticiple) return void 0;
  const reminder = question.agreementReminder;
  const features = (reminder == null ? void 0 : reminder.gender) && reminder.number ? `${reminder.gender === "feminin" ? "f\xE9minin" : "masculin"} ${reminder.number}` : void 0;
  return {
    result: "incorrect",
    learnerAnswer,
    expectedAnswer: displayedCorrection(question, expected.value),
    comparedAnswer: expected.value,
    errorKind: "agreement",
    confidence: "high",
    agreementFeatures: features,
    agreementSource: (reminder == null ? void 0 : reminder.kind) || "subject"
  };
}
function diagnoseCoachAnswer(learnerAnswer, question, isCorrect) {
  var _a;
  const nearest = closestExpected(learnerAnswer, question.reponses);
  const comparedAnswer = (nearest == null ? void 0 : nearest.value) || question.reponses[0] || "";
  const expectedAnswer = displayedCorrection(question, comparedAnswer);
  const base = {
    result: isCorrect ? "correct" : "incorrect",
    learnerAnswer,
    expectedAnswer,
    comparedAnswer,
    confidence: isCorrect ? "high" : "low"
  };
  if (isCorrect) return base;
  if (comparable(learnerAnswer) !== comparable(comparedAnswer) && withoutDiacritics(learnerAnswer) === withoutDiacritics(comparedAnswer)) {
    return { ...base, errorKind: "accent", confidence: "high" };
  }
  if (normalizeAnswer(learnerAnswer).replace(/[^\p{L}\p{N}]/gu, "") === normalizeAnswer(comparedAnswer).replace(/[^\p{L}\p{N}]/gu, "")) {
    return { ...base, errorKind: "punctuation", confidence: "high" };
  }
  const learnerAuxiliary = auxiliaryIn(learnerAnswer);
  const expectedAuxiliary = auxiliaryIn(comparedAnswer);
  if (learnerAuxiliary && expectedAuxiliary && learnerAuxiliary !== expectedAuxiliary) {
    return { ...base, errorKind: "auxiliary", confidence: "high", learnerAuxiliary, expectedAuxiliary };
  }
  const independentAgreement = diagnoseCoachAgreement(learnerAnswer, question);
  if (independentAgreement) return independentAgreement;
  const difference = differingWord(learnerAnswer, comparedAnswer);
  const questionCanRequireAgreement = Boolean(question.agreementReminder) || Boolean(learnerAuxiliary && expectedAuxiliary && learnerAuxiliary === expectedAuxiliary);
  if (questionCanRequireAgreement && difference && agreementBase(difference.learner) === agreementBase(difference.expected) && difference.learner !== difference.expected) {
    const reminder = question.agreementReminder;
    const features = (reminder == null ? void 0 : reminder.gender) && reminder.number ? `${reminder.gender === "feminin" ? "f\xE9minin" : "masculin"} ${reminder.number}` : void 0;
    return {
      ...base,
      errorKind: "agreement",
      confidence: "high",
      agreementFeatures: features,
      agreementSource: (reminder == null ? void 0 : reminder.kind) || "subject"
    };
  }
  const compoundParticiple = question.isCompound ? compoundParticipleDifference(learnerAnswer, comparedAnswer) : void 0;
  if (compoundParticiple) {
    return {
      ...base,
      errorKind: "compound-participle",
      confidence: "high",
      expectedAuxiliary: compoundParticiple.auxiliary,
      learnerAuxiliary: compoundParticiple.auxiliary,
      expectedParticiple: compoundParticiple.expectedParticiple,
      learnerFormAfterAuxiliary: compoundParticiple.learnerForm
    };
  }
  if (difference) {
    const prefixLength = commonPrefix(difference.learner, difference.expected);
    const expectedEnding = difference.expected.slice(prefixLength);
    const learnerEnding = difference.learner.slice(prefixLength);
    if (prefixLength >= 3 && expectedEnding.length <= 6 && learnerEnding.length <= 6) {
      return { ...base, errorKind: "ending", confidence: "high", expectedEnding, learnerEnding };
    }
  }
  const distance = (_a = nearest == null ? void 0 : nearest.distance) != null ? _a : Number.POSITIVE_INFINITY;
  const scale = Math.max(1, comparable(comparedAnswer).length);
  if (distance <= 3 || distance / scale <= 0.2) {
    return { ...base, errorKind: "close-form", confidence: "medium" };
  }
  return { ...base, errorKind: "unknown", confidence: "low" };
}

const learnerErrorMessages = {
  "task.wrong_mode": { de: "Du hast einen anderen Modus als den verlangten verwendet.", en: "You used a different mood from the one requested.", it: "Hai usato un modo diverso da quello richiesto.", es: "Has usado un modo diferente del solicitado." },
  "task.wrong_tense": { de: "Du hast eine andere Zeitform als die verlangte verwendet.", en: "You used a different tense from the one requested.", it: "Hai usato un tempo diverso da quello richiesto.", es: "Has usado un tiempo diferente del solicitado." },
  "task.future_simple_for_near_future": { de: "Du hast das einfache Futur verwendet, obwohl das nahe Futur mit \xAB aller \xBB und dem Infinitiv gebildet werden sollte.", en: "You used the simple future, but the near future had to be formed with \xAB aller \xBB followed by the infinitive.", it: "Hai usato il futuro semplice, ma occorreva formare il futuro prossimo con \xAB aller \xBB seguito dall\u2019infinito.", es: "Has usado el futuro simple, pero hab\xEDa que formar el futuro pr\xF3ximo con \xAB aller \xBB seguido del infinitivo." },
  "person.other_form": { de: "Du hast die grammatische Person verwechselt.", en: "You used the form for a different grammatical person.", it: "Hai confuso la persona grammaticale.", es: "Has confundido la persona gramatical." },
  "person.impossible_ending": { de: "Die verwendete Endung ist bei dieser Person nicht m\xF6glich.", en: "The ending you used is not possible with this person.", it: "La desinenza usata non \xE8 possibile con questa persona.", es: "La terminaci\xF3n utilizada no es posible con esta persona." },
  "compound.auxiliary": { de: "Du hast nicht das richtige Hilfsverb f\xFCr diese zusammengesetzte Zeitform verwendet.", en: "You did not use the correct auxiliary for this compound tense.", it: "Non hai usato l\u2019ausiliare corretto per questo tempo composto.", es: "No has usado el auxiliar correcto para este tiempo compuesto." },
  "compound.participle_form": { de: "Nach dem Hilfsverb musstest du das Partizip Perfekt und keine andere konjugierte Form verwenden.", en: "After the auxiliary, you had to use the past participle rather than another conjugated form.", it: "Dopo l\u2019ausiliare dovevi usare il participio passato e non un\u2019altra forma coniugata.", es: "Despu\xE9s del auxiliar deb\xEDas usar el participio pasado y no otra forma conjugada." },
  "agreement.subject": { de: "Das Partizip Perfekt wurde nicht richtig an das Subjekt angeglichen.", en: "The past participle did not agree correctly with the subject.", it: "Il participio passato non concordava correttamente con il soggetto.", es: "El participio pasado no concordaba correctamente con el sujeto." },
  "agreement.cod_before": { de: "Das Partizip Perfekt musste an das vorangestellte direkte Objekt angeglichen werden.", en: "The past participle had to agree with the direct object placed before it.", it: "Il participio passato doveva concordare con il complemento oggetto posto prima.", es: "El participio pasado deb\xEDa concordar con el complemento directo colocado antes." },
  "agreement.cod_after": { de: "Du hast das Partizip Perfekt an ein nachgestelltes Objekt angeglichen, obwohl es unver\xE4ndert bleiben musste.", en: "You made the past participle agree with an object placed after it, although it had to remain unchanged.", it: "Hai concordato il participio passato con un complemento posto dopo, mentre doveva restare invariato.", es: "Has hecho concordar el participio pasado con un complemento colocado despu\xE9s, aunque deb\xEDa permanecer invariable." },
  "agreement.coi": { de: "Du hast das Partizip Perfekt an ein indirektes Objekt angeglichen; ein indirektes Objekt bewirkt diese Angleichung nie.", en: "You made the past participle agree with an indirect object, which never determines this agreement.", it: "Hai concordato il participio passato con un complemento indiretto, che non determina mai questa concordanza.", es: "Has hecho concordar el participio pasado con un complemento indirecto, que nunca determina esta concordancia." },
  "agreement.avoir_unwarranted": { de: "Du hast das mit \xAB avoir \xBB verwendete Partizip Perfekt angeglichen, obwohl kein vorangestelltes Objekt dies erforderte.", en: "You made the past participle used with \xAB avoir \xBB agree, although no preceding object required it.", it: "Hai concordato il participio passato usato con \xAB avoir \xBB, anche se nessun complemento posto prima lo richiedeva.", es: "Has hecho concordar el participio pasado usado con \xAB avoir \xBB, aunque ning\xFAn complemento colocado antes lo exig\xEDa." },
  "morphology.ending": { de: "Die Endung ist nicht richtig.", en: "The ending is not correct.", it: "La desinenza non \xE8 corretta.", es: "La terminaci\xF3n no es correcta." },
  "orthography.copied_complement": { de: "Beim Abschreiben des in der Aufgabe vorgegebenen Objekts ist ein Rechtschreibfehler entstanden.", en: "You made a spelling error when copying the object given in the sentence.", it: "Hai commesso un errore ortografico copiando il complemento dato nella frase.", es: "Has cometido un error ortogr\xE1fico al copiar el complemento dado en la frase." },
  "orthography.accent": { de: "Die Form war richtig aufgebaut, aber ein Akzent war falsch oder fehlte.", en: "The form was built correctly, but an accent was incorrect or missing.", it: "La forma era costruita correttamente, ma un accento era errato o mancante.", es: "La forma estaba bien construida, pero un acento era incorrecto o faltaba." },
  "orthography.punctuation": { de: "Die Form war richtig, aber ein Zeichen wie ein Apostroph oder Bindestrich war falsch oder fehlte.", en: "The form was correct, but a mark such as an apostrophe or hyphen was incorrect or missing.", it: "La forma era corretta, ma un segno come un apostrofo o un trattino era errato o mancante.", es: "La forma era correcta, pero un signo como un ap\xF3strofo o un guion era incorrecto o faltaba." },
  "input.close_form": { de: "Deine Antwort war fast richtig, enthielt aber noch einen Rechtschreibunterschied.", en: "Your answer was close to the correct form, but it still contained a spelling difference.", it: "La tua risposta era vicina alla forma corretta, ma conteneva ancora una differenza ortografica.", es: "Tu respuesta estaba cerca de la forma correcta, pero a\xFAn conten\xEDa una diferencia ortogr\xE1fica." },
  unknown: { de: "Der Fehler konnte noch nicht genauer eingeordnet werden. Vergleiche deine Antwort mit der Korrektur.", en: "The error could not yet be classified more precisely. Compare your answer with the correction.", it: "L\u2019errore non pu\xF2 ancora essere classificato con maggiore precisione. Confronta la risposta con la correzione.", es: "El error todav\xEDa no puede clasificarse con mayor precisi\xF3n. Compara tu respuesta con la correcci\xF3n." }
};
const insteadOf = {
  fr: "\xE0 la place de",
  de: "anstelle von",
  en: "instead of",
  it: "al posto di",
  es: "en lugar de"
};
function localizedLearnerErrorMessage(detail, locale) {
  var _a;
  return locale === "fr" ? detail.message : ((_a = learnerErrorMessages[detail.code]) == null ? void 0 : _a[locale]) || detail.message;
}
function localizedLearnerErrorText(detail, locale) {
  const message = localizedLearnerErrorMessage(detail, locale);
  return detail.learnerValue && detail.expectedValue ? `${message} ${detail.learnerValue} ${insteadOf[locale]} ${detail.expectedValue}` : message;
}
function learnerErrorInsteadOf(locale) {
  return insteadOf[locale];
}
function localizedLearnerErrorMessageForCode(code, fallback, locale) {
  var _a;
  return locale === "fr" ? fallback : ((_a = learnerErrorMessages[code]) == null ? void 0 : _a[locale]) || fallback;
}
const learnerErrorLabels = {
  "task.wrong_mode": { de: "Modi verwechseln (Indikativ, Konjunktiv, \u2026)", en: "Confusing moods (indicative, subjunctive, \u2026)", it: "Confondere i modi (indicativo, congiuntivo, \u2026)", es: "Confundir los modos (indicativo, subjuntivo, \u2026)" },
  "task.wrong_tense": { de: "Zeitformen verwechseln (Imparfait, Futur, \u2026)", en: "Confusing tenses (imperfect, future, \u2026)", it: "Confondere i tempi (imperfetto, futuro, \u2026)", es: "Confundir los tiempos (imperfecto, futuro, \u2026)" },
  "task.future_simple_for_near_future": { de: "Einfaches Futur statt nahes Futur", en: "Simple future instead of near future", it: "Futuro semplice al posto del futuro prossimo", es: "Futuro simple en lugar de futuro pr\xF3ximo" },
  "person.other_form": { de: "Pronomen verwechseln (je, tu, ils \u2026)", en: "Confusing pronouns (je, tu, ils \u2026)", it: "Confondere i pronomi (je, tu, ils \u2026)", es: "Confundir los pronombres (je, tu, ils \u2026)" },
  "person.impossible_ending": { de: "F\xFCr diese Person unm\xF6gliche Endung", en: "Ending impossible for this person", it: "Desinenza impossibile per questa persona", es: "Terminaci\xF3n imposible para esta persona" },
  "compound.auxiliary": { de: "Falsches Hilfsverb", en: "Incorrect auxiliary", it: "Ausiliare errato", es: "Auxiliar incorrecto" },
  "compound.participle_form": { de: "Falsche Form nach dem Hilfsverb", en: "Incorrect form after the auxiliary", it: "Forma errata dopo l\u2019ausiliare", es: "Forma incorrecta despu\xE9s del auxiliar" },
  "agreement.subject": { de: "Angleichung des Partizips an das Subjekt", en: "Participle agreement with the subject", it: "Concordanza del participio con il soggetto", es: "Concordancia del participio con el sujeto" },
  "agreement.cod_before": { de: "Angleichung an ein vorangestelltes direktes Objekt", en: "Agreement with a preceding direct object", it: "Concordanza con un complemento oggetto precedente", es: "Concordancia con un complemento directo anterior" },
  "agreement.cod_after": { de: "Unn\xF6tige Angleichung an ein nachgestelltes Objekt", en: "Incorrect agreement with a following direct object", it: "Concordanza indebita con un complemento oggetto successivo", es: "Concordancia indebida con un complemento directo posterior" },
  "agreement.coi": { de: "Unn\xF6tige Angleichung an ein indirektes Objekt", en: "Incorrect agreement with an indirect object", it: "Concordanza indebita con un complemento indiretto", es: "Concordancia indebida con un complemento indirecto" },
  "agreement.avoir_unwarranted": { de: "Unn\xF6tige Angleichung mit avoir", en: "Incorrect agreement with avoir", it: "Concordanza indebita con avoir", es: "Concordancia indebida con avoir" },
  "morphology.ending": { de: "Falsche Endung", en: "Incorrect ending", it: "Desinenza errata", es: "Terminaci\xF3n incorrecta" },
  "orthography.copied_complement": { de: "Abschreibfehler beim Objekt", en: "Error copying the object", it: "Errore nel copiare il complemento", es: "Error al copiar el complemento" },
  "orthography.accent": { de: "Falscher oder fehlender Akzent", en: "Incorrect or missing accent", it: "Accento errato o mancante", es: "Acento incorrecto o ausente" },
  "orthography.punctuation": { de: "Falsche Zeichensetzung", en: "Incorrect punctuation or symbol", it: "Punteggiatura o segno errato", es: "Puntuaci\xF3n o signo incorrecto" },
  "input.close_form": { de: "Antwort nahe an der richtigen Form", en: "Answer close to the correct form", it: "Forma vicina alla risposta corretta", es: "Forma cercana a la respuesta correcta" },
  unknown: { de: "Noch nicht klassifizierter Fehler", en: "Mistake not yet classified", it: "Errore non ancora classificato", es: "Error a\xFAn no clasificado" }
};
const learnerErrorDomains = {
  Consigne: { de: "Aufgabe", en: "Instructions", it: "Consegna", es: "Consigna" },
  Personne: { de: "Person", en: "Person", it: "Persona", es: "Persona" },
  "Temps compos\xE9": { de: "Zusammengesetzte Zeit", en: "Compound tense", it: "Tempo composto", es: "Tiempo compuesto" },
  Accord: { de: "Angleichung", en: "Agreement", it: "Concordanza", es: "Concordancia" },
  Construction: { de: "Bildung", en: "Formation", it: "Formazione", es: "Formaci\xF3n" },
  Orthographe: { de: "Rechtschreibung", en: "Spelling", it: "Ortografia", es: "Ortograf\xEDa" },
  Saisie: { de: "Eingabe", en: "Input", it: "Inserimento", es: "Entrada" },
  Autre: { de: "Sonstiges", en: "Other", it: "Altro", es: "Otro" }
};
function localizedLearnerErrorLabel(code, fallback, locale) {
  var _a;
  return locale === "fr" ? fallback : ((_a = learnerErrorLabels[code]) == null ? void 0 : _a[locale]) || fallback;
}
function localizedLearnerErrorDomain(domain, locale) {
  var _a;
  return locale === "fr" ? domain : ((_a = learnerErrorDomains[domain]) == null ? void 0 : _a[locale]) || domain;
}

const LEARNER_ERROR_TAXONOMY = [
  { code: "task.wrong_mode", domain: "Consigne", label: "Confondre les modes (Indicatif, Subjonctif, ...)", advice: "Compare le mode demand\xE9 avec la forme que tu as utilis\xE9e." },
  { code: "task.wrong_tense", domain: "Consigne", label: "Confondre les temps (imparfait, futur, ...)", advice: "Rep\xE8re le temps demand\xE9 avant de construire la forme." },
  { code: "task.future_simple_for_near_future", domain: "Consigne", label: "Futur simple \xE0 la place du futur proche", advice: "Le futur proche se construit avec aller au pr\xE9sent suivi de l\u2019infinitif." },
  { code: "person.other_form", domain: "Personne", label: "confondre les pronoms (je, tu, ils...)", advice: "Relis le pronom et cherche la terminaison qui lui correspond." },
  { code: "person.impossible_ending", domain: "Personne", label: "Terminaison impossible pour cette personne", advice: "Avec je ou tu, pas de -t ou -d ; avec il, elle ou iel, pas de -s ou -x." },
  { code: "compound.auxiliary", domain: "Temps compos\xE9", label: "Auxiliaire incorrect", advice: "Apprends par coeur les verbes \xEAtre et avoir \xE0 tous les temps" },
  { code: "compound.participle_form", domain: "Temps compos\xE9", label: "Forme incorrecte apr\xE8s l\u2019auxiliaire", advice: "Apr\xE8s l\u2019auxiliaire, emploie le participe pass\xE9 et non une forme conjugu\xE9e." },
  { code: "agreement.subject", domain: "Accord", label: "Accord du participe avec le sujet", advice: "Avec \xEAtre, v\xE9rifie le genre et le nombre du sujet." },
  { code: "agreement.cod_before", domain: "Accord", label: "Accord avec un COD plac\xE9 avant", advice: "Avec avoir, le participe s\u2019accorde avec le COD lorsque celui-ci est plac\xE9 avant." },
  { code: "agreement.cod_after", domain: "Accord", label: "Accord indu avec un COD plac\xE9 apr\xE8s", advice: "Un COD plac\xE9 apr\xE8s le participe ne commande pas son accord." },
  { code: "agreement.coi", domain: "Accord", label: "Accord indu avec un COI", advice: "Un COI ne commande jamais l\u2019accord du participe pass\xE9 avec avoir." },
  { code: "agreement.avoir_unwarranted", domain: "Accord", label: "Accord indu avec avoir", advice: "Sans COD plac\xE9 avant, le participe pass\xE9 employ\xE9 avec avoir reste invariable." },
  { code: "morphology.ending", domain: "Construction", label: "Terminaison incorrecte", advice: "Apprends par coeur les terminaisons du temps demand\xE9" },
  { code: "orthography.copied_complement", domain: "Orthographe", label: "Faute de recopie du compl\xE9ment", advice: "Recopie pr\xE9cis\xE9ment le COD ou le COI donn\xE9 dans la phrase." },
  { code: "orthography.accent", domain: "Orthographe", label: "Accent incorrect ou manquant", advice: "Observe pr\xE9cis\xE9ment les accents de la forme attendue." },
  { code: "orthography.punctuation", domain: "Orthographe", label: "Ponctuation ou signe incorrect", advice: "V\xE9rifie les apostrophes, les traits d\u2019union et la ponctuation utile." },
  { code: "input.close_form", domain: "Saisie", label: "Forme proche de la r\xE9ponse", advice: "Compare lettre par lettre ta r\xE9ponse avec la correction." },
  { code: "unknown", domain: "Autre", label: "Erreur non encore class\xE9e", advice: "Relis la correction et compare la construction compl\xE8te." }
];
const LEARNER_ERROR_DETECTOR_VERSION = "1.3.0";
function text(value) {
  return typeof value === "string" ? value.trim() : "";
}
const ETRE_AUXILIARY_FORMS = /* @__PURE__ */ new Set([
  "suis",
  "es",
  "est",
  "sommes",
  "\xEAtes",
  "sont",
  "\xE9tais",
  "\xE9tait",
  "\xE9tions",
  "\xE9tiez",
  "\xE9taient",
  "serai",
  "seras",
  "sera",
  "serons",
  "serez",
  "seront",
  "sois",
  "soit",
  "soyons",
  "soyez",
  "soient"
]);
function expectedUsesEtre(question) {
  return question.reponses.some((answer) => {
    var _a;
    return (_a = normalizeAnswer(answer, { ignoreWhitespace: false }).match(/\p{L}+/gu)) == null ? void 0 : _a.some((word) => ETRE_AUXILIARY_FORMS.has(word));
  });
}
function tag(code, confidence, evidence) {
  return { code, confidence, ...evidence && Object.keys(evidence).length ? { evidence } : {} };
}
function uniqueTags(tags) {
  const seen = /* @__PURE__ */ new Set();
  return tags.filter((candidate) => {
    if (seen.has(candidate.code)) return false;
    seen.add(candidate.code);
    return true;
  }).map((candidate, index) => ({ ...candidate, primary: index === 0 }));
}
function otherPersonTag(answer, question) {
  var _a, _b;
  const currentPersonId = Number(question.personId);
  const match = (_b = (_a = question.radicalReference) == null ? void 0 : _a.paradigmForms) == null ? void 0 : _b.find(
    (candidate) => Number(candidate.personId) !== currentPersonId && validateAnswer(answer, [candidate.form]).isCorrect
  );
  return match ? tag("person.other_form", "high", {
    expectedPerson: text(question.pronom || question.saisiePrefixe),
    detectedPerson: text(match.subject),
    detectedForm: text(match.form)
  }) : null;
}
function lastWord(value) {
  var _a;
  return ((_a = normalizeAnswer(value, { ignoreWhitespace: false }).match(/\p{L}+/gu)) == null ? void 0 : _a.at(-1)) || "";
}
function pluralPersonEndingTag(answer, question) {
  const learnerWord = lastWord(answer);
  const expectedWord = lastWord(question.reponses[0] || "");
  if (learnerWord.endsWith("ont") && expectedWord.endsWith("ons")) {
    return tag("person.other_form", "high", {
      detectedPerson: "ils/elles",
      expectedPerson: "nous",
      detectedEnding: "-ont",
      expectedEnding: "-ons"
    });
  }
  if (learnerWord.endsWith("ons") && expectedWord.endsWith("ont")) {
    return tag("person.other_form", "high", {
      detectedPerson: "nous",
      expectedPerson: "ils/elles",
      detectedEnding: "-ons",
      expectedEnding: "-ont"
    });
  }
  return null;
}
function copiedWords(value) {
  if (typeof value !== "string") return [];
  return normalizeAnswer(value, { ignoreWhitespace: false }).match(/\p{L}+(?:'\p{L}+)?/gu) || [];
}
function editDistance(left, right) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1)
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}
function copiedComplementTag(answer, question) {
  if (question.complementPosition !== "after" || !question.complement || question.complementFunction !== "cod" && question.complementFunction !== "coi") {
    return null;
  }
  const expectedComplementWords = copiedWords(question.complement);
  const answerWords = copiedWords(answer);
  if (!expectedComplementWords.length || answerWords.length <= expectedComplementWords.length) return null;
  const expectedComplement = expectedComplementWords.join(" ");
  for (const expectedAnswer of question.reponses) {
    const expectedWords = copiedWords(expectedAnswer);
    if (expectedWords.length <= expectedComplementWords.length) continue;
    const expectedSuffix = expectedWords.slice(-expectedComplementWords.length).join(" ");
    if (expectedSuffix !== expectedComplement) continue;
    const learnerComplement = answerWords.slice(-expectedComplementWords.length).join(" ");
    if (learnerComplement === expectedComplement) continue;
    const distance = editDistance(learnerComplement, expectedComplement);
    const maximumDistance = Math.min(3, Math.max(1, Math.floor(expectedComplement.length * 0.18)));
    if (distance > maximumDistance) continue;
    return tag("orthography.copied_complement", "high", {
      complementFunction: question.complementFunction.toUpperCase(),
      learnerComplement,
      expectedComplement: question.complement
    });
  }
  return null;
}
function agreementTag(diagnostic) {
  if (!diagnostic) return null;
  const agreementCode = diagnostic.agreementSource === "cod-before" ? "agreement.cod_before" : diagnostic.agreementSource === "cod-after" ? "agreement.cod_after" : diagnostic.agreementSource === "coi" ? "agreement.coi" : "agreement.subject";
  return tag(agreementCode, "high", {
    features: text(diagnostic.agreementFeatures)
  });
}
function diagnoseLearnerError(answer, question) {
  if (validateAnswer(answer, question.reponses).isCorrect) return [];
  const independentAgreement = agreementTag(diagnoseCoachAgreement(answer, question));
  const copiedComplement = copiedComplementTag(answer, question);
  const withDetectedContext = (primary) => {
    const genericFormDifference = primary.code === "morphology.ending" || primary.code === "input.close_form";
    return uniqueTags([
      ...copiedComplement && copiedComplement.code !== primary.code ? [copiedComplement] : [],
      ...!copiedComplement || !genericFormDifference ? [primary] : [],
      ...independentAgreement ? [independentAgreement] : []
    ]);
  };
  if (isFutureSimpleInsteadOfNearFuture(answer, question)) {
    return withDetectedContext(tag("task.future_simple_for_near_future", "high"));
  }
  const confusions = findConjugationConfusions(answer, question);
  if (confusions.length) {
    const source = confusions[0];
    const tags = [];
    if (normalizeAnswer(source.mode) !== normalizeAnswer(question.mode || "")) {
      tags.push(tag("task.wrong_mode", "high", {
        detectedMode: source.mode,
        expectedMode: text(question.mode)
      }));
    }
    if (normalizeAnswer(source.tense) !== normalizeAnswer(question.temps || "")) {
      tags.push(tag("task.wrong_tense", "high", {
        detectedTense: source.tense,
        expectedTense: text(question.temps)
      }));
    }
    if (copiedComplement) tags.unshift(copiedComplement);
    if (independentAgreement) tags.push(independentAgreement);
    if (tags.length) return uniqueTags(tags);
  }
  const personConfusion = otherPersonTag(answer, question);
  if (personConfusion) return withDetectedContext(personConfusion);
  const pluralEndingConfusion = pluralPersonEndingTag(answer, question);
  if (pluralEndingConfusion) return withDetectedContext(pluralEndingConfusion);
  const impossibleEnding = findImpossibleSingularEnding(answer, question);
  if (impossibleEnding) {
    return withDetectedContext(tag("person.impossible_ending", "high", {
      ending: impossibleEnding.ending,
      target: impossibleEnding.target,
      personGroup: impossibleEnding.personGroup
    }));
  }
  const diagnostic = diagnoseCoachAnswer(answer, question, false);
  if (diagnostic.errorKind === "accent") {
    return withDetectedContext(tag("orthography.accent", "high"));
  }
  if (diagnostic.errorKind === "punctuation") {
    return withDetectedContext(tag("orthography.punctuation", "high"));
  }
  if (diagnostic.errorKind === "auxiliary") {
    return withDetectedContext(tag("compound.auxiliary", "high", {
      learnerAuxiliary: text(diagnostic.learnerAuxiliary),
      expectedAuxiliary: text(diagnostic.expectedAuxiliary)
    }));
  }
  if (diagnostic.errorKind === "compound-participle") {
    return withDetectedContext(tag("compound.participle_form", "high", {
      auxiliary: text(diagnostic.expectedAuxiliary),
      learnerForm: text(diagnostic.learnerFormAfterAuxiliary),
      expectedParticiple: text(diagnostic.expectedParticiple)
    }));
  }
  if (diagnostic.errorKind === "agreement") {
    const detectedAgreement = agreementTag(diagnostic);
    if (detectedAgreement) {
      if (diagnostic.agreementSource === "subject" && !expectedUsesEtre(question)) {
        detectedAgreement.code = "agreement.avoir_unwarranted";
      }
      return withDetectedContext(detectedAgreement);
    }
  }
  if (diagnostic.errorKind === "ending") {
    return withDetectedContext(tag("morphology.ending", "high", {
      learnerEnding: text(diagnostic.learnerEnding),
      expectedEnding: text(diagnostic.expectedEnding)
    }));
  }
  if (diagnostic.errorKind === "close-form") {
    return withDetectedContext(tag("input.close_form", "medium"));
  }
  if (copiedComplement) {
    return uniqueTags([
      copiedComplement,
      ...independentAgreement ? [independentAgreement] : []
    ]);
  }
  return withDetectedContext(tag("unknown", "low"));
}
function learnerErrorDetails(answer, question) {
  const labels = new Map(LEARNER_ERROR_TAXONOMY.map((item) => [item.code, item.label]));
  return diagnoseLearnerError(answer, question).filter((item) => item.code !== "unknown").flatMap((item) => {
    var _a, _b, _c, _d;
    const label = labels.get(item.code);
    if (!label) return [];
    if (item.code === "person.other_form" && ((_a = item.evidence) == null ? void 0 : _a.detectedPerson) && ((_b = item.evidence) == null ? void 0 : _b.expectedPerson)) {
      return [{
        code: item.code,
        label,
        message: `Tu as confondu la personne. Tu as conjugu\xE9 avec \xAB ${item.evidence.detectedPerson} \xBB, alors que c\u2019\xE9tait \xAB ${item.evidence.expectedPerson} \xBB.`,
        learnerValue: item.evidence.detectedPerson,
        expectedValue: item.evidence.expectedPerson
      }];
    }
    if (item.code === "morphology.ending") {
      return [{
        code: item.code,
        label,
        message: "La terminaison est fausse.",
        ...((_c = item.evidence) == null ? void 0 : _c.learnerEnding) ? { learnerValue: `-${item.evidence.learnerEnding}` } : {},
        ...((_d = item.evidence) == null ? void 0 : _d.expectedEnding) ? { expectedValue: `-${item.evidence.expectedEnding}` } : {}
      }];
    }
    const evidence = item.evidence || {};
    const message = (() => {
      if (item.code === "task.wrong_mode") {
        return evidence.detectedMode && evidence.expectedMode ? `Tu as utilis\xE9 le mode \xAB ${evidence.detectedMode} \xBB, alors que le mode \xAB ${evidence.expectedMode} \xBB \xE9tait demand\xE9.` : "Tu as utilis\xE9 un autre mode que celui qui \xE9tait demand\xE9.";
      }
      if (item.code === "task.wrong_tense") {
        return evidence.detectedTense && evidence.expectedTense ? `Tu as utilis\xE9 le temps \xAB ${evidence.detectedTense} \xBB, alors que le temps \xAB ${evidence.expectedTense} \xBB \xE9tait demand\xE9.` : "Tu as utilis\xE9 un autre temps que celui qui \xE9tait demand\xE9.";
      }
      if (item.code === "task.future_simple_for_near_future") {
        return "Tu as employ\xE9 le futur simple, alors qu\u2019il fallait construire le futur proche avec \xAB aller \xBB suivi de l\u2019infinitif.";
      }
      if (item.code === "person.impossible_ending") {
        if (evidence.ending && evidence.target) {
          const subject = evidence.personGroup === "first-or-second-singular" ? "\xAB je \xBB ou \xAB tu \xBB" : evidence.personGroup === "third-singular" ? "\xAB il \xBB, \xAB elle \xBB ou \xAB iel \xBB" : "cette personne";
          const conjugatedPart = evidence.target === "auxiliary" ? "l\u2019auxiliaire" : "le verbe";
          return `Avec ${subject}, ${conjugatedPart} ne peut pas se terminer par \xAB -${evidence.ending} \xBB.`;
        }
        return "La terminaison utilis\xE9e n\u2019est pas possible avec cette personne.";
      }
      if (item.code === "compound.auxiliary") {
        return evidence.learnerAuxiliary && evidence.expectedAuxiliary ? `Tu as utilis\xE9 l\u2019auxiliaire \xAB ${evidence.learnerAuxiliary} \xBB, alors qu\u2019il fallait \xAB ${evidence.expectedAuxiliary} \xBB.` : "Tu n\u2019as pas utilis\xE9 le bon auxiliaire pour construire ce temps compos\xE9.";
      }
      if (item.code === "compound.participle_form") {
        return evidence.auxiliary && evidence.learnerForm && evidence.expectedParticiple ? `Apr\xE8s l\u2019auxiliaire \xAB ${evidence.auxiliary} \xBB, il fallait employer le participe pass\xE9 \xAB ${evidence.expectedParticiple} \xBB, et non \xAB ${evidence.learnerForm} \xBB.` : "Apr\xE8s l\u2019auxiliaire, il fallait employer le participe pass\xE9 et non une autre forme conjugu\xE9e.";
      }
      if (item.code === "agreement.subject") {
        return "Le participe pass\xE9 n\u2019\xE9tait pas correctement accord\xE9 avec le sujet.";
      }
      if (item.code === "agreement.cod_before") {
        return "Le participe pass\xE9 devait s\u2019accorder avec le compl\xE9ment d\u2019objet direct plac\xE9 avant.";
      }
      if (item.code === "agreement.cod_after") {
        return "Tu as accord\xE9 le participe pass\xE9 avec un compl\xE9ment plac\xE9 apr\xE8s, alors qu\u2019il devait rester invariable.";
      }
      if (item.code === "agreement.coi") {
        return "Tu as accord\xE9 le participe pass\xE9 avec un compl\xE9ment indirect, qui ne commande jamais cet accord.";
      }
      if (item.code === "agreement.avoir_unwarranted") {
        return "Tu as accord\xE9 le participe pass\xE9 employ\xE9 avec \xAB avoir \xBB, alors qu\u2019aucun compl\xE9ment plac\xE9 avant ne demandait cet accord.";
      }
      if (item.code === "orthography.accent") {
        return "La forme \xE9tait correcte dans sa construction, mais un accent \xE9tait incorrect ou manquant.";
      }
      if (item.code === "orthography.copied_complement") {
        return evidence.complementFunction && evidence.learnerComplement && evidence.expectedComplement ? `Tu as fait une faute d\u2019orthographe en recopiant le ${evidence.complementFunction} : \xAB ${evidence.learnerComplement} \xBB au lieu de \xAB ${evidence.expectedComplement} \xBB.` : "Tu as fait une faute d\u2019orthographe en recopiant le compl\xE9ment donn\xE9 dans la phrase.";
      }
      if (item.code === "orthography.punctuation") {
        return "La forme \xE9tait correcte, mais un signe comme une apostrophe ou un trait d\u2019union \xE9tait incorrect ou manquant.";
      }
      if (item.code === "input.close_form") {
        return "Ta r\xE9ponse \xE9tait proche de la bonne forme, mais elle contenait encore une diff\xE9rence orthographique.";
      }
      return label;
    })();
    return [{ code: item.code, label, message }];
  });
}
function mergeLearnerErrorDetails(...groups) {
  const details = /* @__PURE__ */ new Map();
  for (const detail of groups.flat()) {
    if (!details.has(detail.code)) details.set(detail.code, detail);
  }
  return [...details.values()];
}
function learnerErrorDetailText(detail, locale = "fr") {
  if (detail.code === "person.other_form") return localizedLearnerErrorMessage(detail, locale);
  return localizedLearnerErrorText(detail, locale);
}
function applicableLearnerErrorTypes(question) {
  var _a, _b, _c, _d;
  const codes = [
    "task.wrong_mode",
    "task.wrong_tense",
    "orthography.accent",
    "orthography.punctuation",
    "input.close_form",
    "unknown"
  ];
  if (question.complement && question.complementPosition === "after" && (question.complementFunction === "cod" || question.complementFunction === "coi")) {
    codes.push("orthography.copied_complement");
  }
  if ((_a = question.futureSimpleAnswers) == null ? void 0 : _a.length) codes.push("task.future_simple_for_near_future");
  if (question.personId || question.pronom || question.saisiePrefixe) {
    codes.push("person.other_form", "person.impossible_ending", "morphology.ending");
  }
  if (question.isCompound) {
    codes.push(
      "compound.auxiliary",
      "compound.participle_form",
      expectedUsesEtre(question) ? "agreement.subject" : "agreement.avoir_unwarranted"
    );
  }
  if (((_b = question.agreementReminder) == null ? void 0 : _b.kind) === "cod-before") codes.push("agreement.cod_before");
  if (((_c = question.agreementReminder) == null ? void 0 : _c.kind) === "cod-after") codes.push("agreement.cod_after");
  if (((_d = question.agreementReminder) == null ? void 0 : _d.kind) === "coi") codes.push("agreement.coi");
  return [...new Set(codes)];
}

const CURRENT_PRIVACY_NOTICE_VERSION = "privacy-2026-07-29";

const _JOsA3jUY7njW3XDKIBbVuT3Ysg9FEVxTIGHLvxX7BfI = defineNitroPlugin(async () => {
  try {
    const database = useDatabase();
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_accounts (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(80) NOT NULL,
        username_normalized VARCHAR(80) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        recovery_code_hash VARCHAR(255) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        session_version INT UNSIGNED NOT NULL DEFAULT 1,
        privacy_notice_version VARCHAR(30) NOT NULL DEFAULT '${CURRENT_PRIVACY_NOTICE_VERSION}',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_login_at DATETIME NULL,
        activated_at DATETIME NULL,
        deletion_scheduled_at DATETIME NULL,
        deleted_at DATETIME NULL,
        UNIQUE KEY uq_learner_accounts_username (username_normalized),
        KEY idx_learner_accounts_status_created (status, created_at),
        KEY idx_learner_accounts_deletion (deletion_scheduled_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_sessions (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        account_id BIGINT UNSIGNED NOT NULL,
        token_hash CHAR(64) NOT NULL,
        session_version INT UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        UNIQUE KEY uq_learner_sessions_token (token_hash),
        KEY idx_learner_sessions_account (account_id),
        KEY idx_learner_sessions_expiry (expires_at),
        CONSTRAINT fk_learner_sessions_account
          FOREIGN KEY (account_id) REFERENCES learner_accounts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_registration_rate_limits (
        key_hash CHAR(64) NOT NULL PRIMARY KEY,
        bucket VARCHAR(50) NOT NULL,
        request_count INT UNSIGNED NOT NULL DEFAULT 0,
        window_started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_learner_rate_limits_updated (updated_at),
        KEY idx_learner_rate_limits_bucket (bucket)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_challenge_runs (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        account_id BIGINT UNSIGNED NOT NULL,
        client_run_id VARCHAR(100) NOT NULL,
        challenge_fingerprint CHAR(64) NOT NULL,
        challenge_label VARCHAR(160) NOT NULL,
        challenge_config_json LONGTEXT NOT NULL,
        presentation VARCHAR(20) NOT NULL,
        is_review TINYINT(1) NOT NULL DEFAULT 0,
        started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_answered_at DATETIME NULL,
        completed_at DATETIME NULL,
        correct_count INT UNSIGNED NOT NULL DEFAULT 0,
        incorrect_count INT UNSIGNED NOT NULL DEFAULT 0,
        UNIQUE KEY uq_learner_runs_client (account_id, client_run_id),
        KEY idx_learner_runs_account_activity (account_id, last_answered_at),
        KEY idx_learner_runs_challenge (account_id, challenge_fingerprint, last_answered_at),
        CONSTRAINT fk_learner_runs_account
          FOREIGN KEY (account_id) REFERENCES learner_accounts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_answer_attempts (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        run_id BIGINT UNSIGNED NOT NULL,
        client_attempt_id VARCHAR(100) NOT NULL,
        question_index INT UNSIGNED NOT NULL,
        form_key CHAR(64) NOT NULL,
        verb_id BIGINT UNSIGNED NULL,
        tense_id BIGINT UNSIGNED NULL,
        person_id BIGINT UNSIGNED NULL,
        infinitive VARCHAR(100) NOT NULL,
        tense_label VARCHAR(100) NOT NULL,
        mode_label VARCHAR(100) NOT NULL,
        question_json LONGTEXT NOT NULL,
        learner_answer VARCHAR(500) NOT NULL,
        is_correct TINYINT(1) NOT NULL,
        answered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_learner_attempt_client (run_id, client_attempt_id),
        KEY idx_learner_attempt_run_date (run_id, answered_at),
        KEY idx_learner_attempt_form (run_id, form_key, answered_at),
        CONSTRAINT fk_learner_attempt_run
          FOREIGN KEY (run_id) REFERENCES learner_challenge_runs(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_error_types (
        code VARCHAR(80) NOT NULL PRIMARY KEY,
        domain VARCHAR(80) NOT NULL,
        label VARCHAR(160) NOT NULL,
        advice VARCHAR(500) NOT NULL,
        taxonomy_version VARCHAR(30) NOT NULL,
        active TINYINT(1) NOT NULL DEFAULT 1,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_learner_error_types_domain (domain, active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    for (const errorType of LEARNER_ERROR_TAXONOMY) {
      await database.execute(`
        INSERT INTO learner_error_types
          (code, domain, label, advice, taxonomy_version, active)
        VALUES (?, ?, ?, ?, '1', 1)
        ON DUPLICATE KEY UPDATE domain=VALUES(domain), label=VALUES(label),
          advice=VALUES(advice), taxonomy_version=VALUES(taxonomy_version), active=1
      `, [errorType.code, errorType.domain, errorType.label, errorType.advice]);
    }
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_attempt_error_tags (
        attempt_id BIGINT UNSIGNED NOT NULL,
        error_type_code VARCHAR(80) NOT NULL,
        is_primary TINYINT(1) NOT NULL DEFAULT 0,
        confidence VARCHAR(10) NOT NULL,
        is_initial TINYINT(1) NOT NULL DEFAULT 1,
        detector_version VARCHAR(30) NOT NULL,
        evidence_json LONGTEXT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (attempt_id, error_type_code),
        KEY idx_learner_error_tags_type_date (error_type_code, created_at),
        CONSTRAINT fk_learner_error_tags_attempt
          FOREIGN KEY (attempt_id) REFERENCES learner_answer_attempts(id) ON DELETE CASCADE,
        CONSTRAINT fk_learner_error_tags_type
          FOREIGN KEY (error_type_code) REFERENCES learner_error_types(code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_skill_daily_stats (
        account_id BIGINT UNSIGNED NOT NULL,
        stat_date DATE NOT NULL,
        error_type_code VARCHAR(80) NOT NULL,
        opportunities INT UNSIGNED NOT NULL DEFAULT 0,
        errors INT UNSIGNED NOT NULL DEFAULT 0,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (account_id, stat_date, error_type_code),
        KEY idx_learner_skill_stats_account_type (account_id, error_type_code, stat_date),
        CONSTRAINT fk_learner_skill_stats_account
          FOREIGN KEY (account_id) REFERENCES learner_accounts(id) ON DELETE CASCADE,
        CONSTRAINT fk_learner_skill_stats_type
          FOREIGN KEY (error_type_code) REFERENCES learner_error_types(code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_run_forms (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        run_id BIGINT UNSIGNED NOT NULL,
        form_key CHAR(64) NOT NULL,
        last_client_attempt_id VARCHAR(100) NOT NULL,
        question_index INT UNSIGNED NOT NULL,
        verb_id BIGINT UNSIGNED NULL,
        tense_id BIGINT UNSIGNED NULL,
        person_id BIGINT UNSIGNED NULL,
        infinitive VARCHAR(100) NOT NULL,
        tense_label VARCHAR(100) NOT NULL,
        mode_label VARCHAR(100) NOT NULL,
        question_json LONGTEXT NULL,
        attempt_count INT UNSIGNED NOT NULL DEFAULT 1,
        incorrect_count INT UNSIGNED NOT NULL DEFAULT 0,
        is_mastered TINYINT(1) NOT NULL DEFAULT 0,
        first_answered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_answered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_learner_run_forms (run_id, form_key),
        KEY idx_learner_run_forms_status (run_id, is_mastered, last_answered_at),
        CONSTRAINT fk_learner_run_forms_run
          FOREIGN KEY (run_id) REFERENCES learner_challenge_runs(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_run_questions (
        run_id BIGINT UNSIGNED NOT NULL,
        question_index INT UNSIGNED NOT NULL,
        question_json LONGTEXT NOT NULL,
        result_status VARCHAR(12) NULL,
        attempt_number TINYINT UNSIGNED NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (run_id, question_index),
        CONSTRAINT fk_learner_run_questions_run
          FOREIGN KEY (run_id) REFERENCES learner_challenge_runs(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    const [runQuestionColumns] = await database.query(
      "SHOW COLUMNS FROM learner_run_questions"
    );
    const runQuestionColumnNames = new Set(runQuestionColumns.map((column) => column.Field));
    if (!runQuestionColumnNames.has("result_status")) {
      await database.query(
        "ALTER TABLE learner_run_questions ADD COLUMN result_status VARCHAR(12) NULL AFTER question_json"
      );
    }
    if (!runQuestionColumnNames.has("attempt_number")) {
      await database.query(
        "ALTER TABLE learner_run_questions ADD COLUMN attempt_number TINYINT UNSIGNED NULL AFTER result_status"
      );
    }
    await database.query(`
      INSERT IGNORE INTO learner_run_forms
        (run_id, form_key, last_client_attempt_id, question_index, verb_id,
         tense_id, person_id, infinitive, tense_label, mode_label, question_json,
         attempt_count, incorrect_count, is_mastered, first_answered_at,
         last_answered_at)
      SELECT latest.run_id, latest.form_key, latest.client_attempt_id,
             latest.question_index, latest.verb_id, latest.tense_id,
             latest.person_id, latest.infinitive, latest.tense_label,
             latest.mode_label,
             IF(latest.is_correct = 0, latest.question_json, NULL),
             summary.attempt_count, summary.incorrect_count, latest.is_correct,
             summary.first_answered_at, summary.last_answered_at
      FROM learner_answer_attempts latest
      INNER JOIN (
        SELECT run_id, form_key, MAX(id) AS latest_id, COUNT(*) AS attempt_count,
               SUM(is_correct = 0) AS incorrect_count,
               MIN(answered_at) AS first_answered_at,
               MAX(answered_at) AS last_answered_at
        FROM learner_answer_attempts
        GROUP BY run_id, form_key
      ) summary ON summary.latest_id = latest.id
    `);
    await database.query(`
      UPDATE learner_run_questions q
      INNER JOIN learner_run_forms f
        ON f.run_id=q.run_id AND f.question_index=q.question_index
      SET q.result_status=IF(f.is_mastered=1, 'correct', 'incorrect'),
          q.attempt_number=IF(f.attempt_count > 1, 2, 1)
      WHERE q.result_status IS NULL
    `);
    await database.query(`
      UPDATE learner_challenge_runs runs
      INNER JOIN (
        SELECT run_id, MAX(question_index) + 1 AS question_count
        FROM learner_run_questions
        GROUP BY run_id
        HAVING SUM(result_status IS NULL) > 0
      ) review_plan ON review_plan.run_id=runs.id
      SET runs.challenge_config_json=JSON_SET(
        runs.challenge_config_json,
        '$.questionCount',
        review_plan.question_count
      )
      WHERE runs.is_review=1
    `);
    await database.query(`
      UPDATE learner_challenge_runs runs
      SET runs.completed_at=NULL
      WHERE runs.completed_at IS NOT NULL
        AND (
          SELECT COUNT(*)
          FROM learner_run_questions answered_questions
          WHERE answered_questions.run_id=runs.id
            AND answered_questions.question_index < GREATEST(
              1,
              COALESCE(CAST(JSON_UNQUOTE(JSON_EXTRACT(
                runs.challenge_config_json,
                '$.questionCount'
              )) AS UNSIGNED), 1)
            )
            AND answered_questions.result_status IN ('correct', 'incorrect')
        ) < GREATEST(
          1,
          COALESCE(CAST(JSON_UNQUOTE(JSON_EXTRACT(
            runs.challenge_config_json,
            '$.questionCount'
          )) AS UNSIGNED), 1)
        )
    `);
    await database.query("DELETE FROM learner_answer_attempts WHERE is_correct = 1");
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_login_events (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        account_id BIGINT UNSIGNED NOT NULL,
        event_type VARCHAR(20) NOT NULL DEFAULT 'login',
        occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_learner_login_events_account_date (account_id, occurred_at),
        CONSTRAINT fk_learner_login_events_account
          FOREIGN KEY (account_id) REFERENCES learner_accounts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await database.query(`
      CREATE TABLE IF NOT EXISTS learner_preferences (
        account_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
        interface_locale VARCHAR(5) NOT NULL DEFAULT 'fr',
        color_theme VARCHAR(10) NOT NULL DEFAULT 'light',
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_learner_preferences_account
          FOREIGN KEY (account_id) REFERENCES learner_accounts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await database.query("DELETE FROM learner_sessions WHERE expires_at < CURRENT_TIMESTAMP");
    await database.query(
      "DELETE FROM learner_accounts WHERE status = 'pending' AND activated_at IS NULL AND created_at < CURRENT_TIMESTAMP - INTERVAL 48 HOUR"
    );
    await database.query(
      "DELETE FROM learner_registration_rate_limits WHERE updated_at < CURRENT_TIMESTAMP - INTERVAL 2 DAY"
    );
    console.info("[learner] Comptes pseudonymes et protections disponibles.");
  } catch (error) {
    console.error("[learner] \xC9chec de la pr\xE9paration des comptes pseudonymes.", error);
  }
});

const _eSq4K5b6RSeu3LcljONAV8BhPU4WPYxVU6csrhX9YqY = defineNitroPlugin(async () => {
  var _a;
  const database = useDatabase();
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [[mode]] = await connection.query(
      "SELECT id FROM modes WHERE name='indicatif' ORDER BY id LIMIT 1 FOR UPDATE"
    );
    if (!(mode == null ? void 0 : mode.id)) throw new Error("Mode indicatif introuvable.");
    const [existing] = await connection.query(`
      SELECT id, mode_id, code, name, isTempsCompose
      FROM temps
      WHERE code='near-future' OR name='futur proche'
      ORDER BY id
      FOR UPDATE
    `);
    if (existing.length > 1) {
      throw new Error("Plusieurs temps correspondent d\xE9j\xE0 au futur proche.");
    }
    let tenseId = Number(((_a = existing[0]) == null ? void 0 : _a.id) || 0);
    if (tenseId) {
      const tense = existing[0];
      if (Number(tense.mode_id) !== Number(mode.id) || tense.code !== "near-future" || tense.name !== "futur proche" || Number(tense.isTempsCompose) !== 0) {
        throw new Error("Le futur proche existe avec une configuration incompatible.");
      }
    } else {
      const [result] = await connection.query(`
        INSERT INTO temps (mode_id, code, name, isTempsCompose, selected)
        VALUES (?, 'near-future', 'futur proche', 0, 1)
      `, [mode.id]);
      tenseId = Number(result.insertId);
    }
    const [[storedForms]] = await connection.query(
      "SELECT COUNT(*) AS count FROM verbesconjugues WHERE temp_id=?",
      [tenseId]
    );
    if (Number(storedForms == null ? void 0 : storedForms.count) !== 0) {
      throw new Error("Le futur proche doit \xEAtre g\xE9n\xE9r\xE9 et ne doit pas avoir de formes stock\xE9es.");
    }
    const [[presetTables]] = await connection.query(`
      SELECT COUNT(*) AS count
      FROM information_schema.tables
      WHERE table_schema=DATABASE()
        AND table_name IN (
          'challenge_presets',
          'challenge_preset_categories',
          'challenge_preset_tenses'
        )
    `);
    let cifPresetCount = 0;
    let cifInsertCount = 0;
    if (Number(presetTables == null ? void 0 : presetTables.count) === 3) {
      const [presets] = await connection.query(`
        SELECT preset.id, preset.preset_key
        FROM challenge_presets preset
        INNER JOIN challenge_preset_categories category ON category.id=preset.category_id
        WHERE category.slug='cif'
        ORDER BY preset.sort_order,preset.id
      `);
      cifPresetCount = presets.length;
      for (const preset of presets) {
        const [[position]] = await connection.query(`
          SELECT COALESCE(MAX(sort_order),0)+1 AS next_order
          FROM challenge_preset_tenses
          WHERE preset_id=?
        `, [preset.id]);
        const [result] = await connection.query(`
          INSERT IGNORE INTO challenge_preset_tenses (preset_id,tense_id,sort_order)
          VALUES (?,?,?)
        `, [preset.id, tenseId, Number((position == null ? void 0 : position.next_order) || 1)]);
        cifInsertCount += Number(result.affectedRows);
      }
      const [missing] = await connection.query(`
        SELECT preset.id, preset.preset_key
        FROM challenge_presets preset
        INNER JOIN challenge_preset_categories category ON category.id=preset.category_id
        LEFT JOIN challenge_preset_tenses selection
          ON selection.preset_id=preset.id AND selection.tense_id=?
        WHERE category.slug='cif' AND selection.preset_id IS NULL
      `, [tenseId]);
      if (missing.length) {
        throw new Error(`Futur proche absent de : ${missing.map((row) => row.preset_key).join(", ")}.`);
      }
    }
    await connection.commit();
    console.info(
      `[database] Futur proche disponible (temps ${tenseId})` + (cifPresetCount ? ` et s\xE9lectionn\xE9 dans ${cifPresetCount} d\xE9fis CIF (${cifInsertCount} ajout${cifInsertCount > 1 ? "s" : ""}).` : "; aucun d\xE9fi CIF stock\xE9 \xE0 mettre \xE0 jour.")
    );
  } catch (error) {
    await connection.rollback();
    console.error("[database] \xC9chec de la migration automatique du futur proche.", error);
  } finally {
    connection.release();
  }
});

const _DsNS3JEJlnvrCCIjdkld6dzfoTqGONHrJMrPWhd60 = defineNitroPlugin(async () => {
  var _a;
  const database = useDatabase();
  try {
    const [verbs] = await database.query(
      "SELECT id, infinitif FROM verbes WHERE infinitif IN ('conduire', 'produire')"
    );
    const conduire = verbs.find((verb) => verb.infinitif === "conduire");
    const produire = verbs.find((verb) => verb.infinitif === "produire");
    if (!conduire || !produire) {
      console.warn("[database] R\xE9paration de \xAB produire \xBB ignor\xE9e : verbe mod\xE8le introuvable.");
      return;
    }
    const [[sourceCount]] = await database.query(
      "SELECT COUNT(*) AS count FROM verbesconjugues WHERE verbe_id = ?",
      [conduire.id]
    );
    if (!(sourceCount == null ? void 0 : sourceCount.count)) {
      console.warn("[database] R\xE9paration de \xAB produire \xBB ignor\xE9e : \xAB conduire \xBB ne poss\xE8de aucune conjugaison.");
      return;
    }
    const [result] = await database.query(`
      INSERT INTO verbesconjugues
        (verbe_id, verbe_infinitif, personne_id, temp_id, conjugaison1, conjugaison2, conjugaison3)
      SELECT ?, 'produire', source.personne_id, source.temp_id,
        REPLACE(source.conjugaison1, 'condu', 'produ'),
        REPLACE(source.conjugaison2, 'condu', 'produ'),
        REPLACE(source.conjugaison3, 'condu', 'produ')
      FROM verbesconjugues source
      LEFT JOIN verbesconjugues target
        ON target.verbe_id = ?
        AND target.personne_id = source.personne_id
        AND target.temp_id = source.temp_id
      WHERE source.verbe_id = ?
        AND target.id IS NULL
    `, [produire.id, produire.id, conduire.id]);
    const [[targetCount]] = await database.query(
      "SELECT COUNT(*) AS count FROM verbesconjugues WHERE verbe_id = ?",
      [produire.id]
    );
    if ((targetCount == null ? void 0 : targetCount.count) !== sourceCount.count) {
      throw new Error(
        `\xAB produire \xBB poss\xE8de ${(_a = targetCount == null ? void 0 : targetCount.count) != null ? _a : 0} conjugaison(s), ${sourceCount.count} attendue(s).`
      );
    }
    console.info(
      result.affectedRows ? `[database] R\xE9paration de \xAB produire \xBB termin\xE9e : ${result.affectedRows} forme(s) ajout\xE9e(s).` : "[database] Conjugaisons de \xAB produire \xBB d\xE9j\xE0 disponibles."
    );
  } catch (error) {
    console.error("[database] \xC9chec de la r\xE9paration automatique de \xAB produire \xBB.", error);
  }
});

const SOURCE_ROOT = "https://www.dictionnaire-academie.fr/article";
const ACADEMIE_USES = [
  ["abonner", "A9A0099"],
  ["abreuver", "B0A0134"],
  ["abriter", "A9A0142"],
  ["accompagner", "A9A0269"],
  ["accorder", "A9A0283"],
  ["accumuler", "A9A0339"],
  ["accuser", "A9A0345"],
  ["acheminer", "A9A0374"],
  ["acqu\xE9rir", "A9A0424", "p"],
  ["adapter", "A9A0506"],
  ["adresser", "A9A0606"],
  ["affronter", "A9A0786"],
  ["agacer", "A9A0815"],
  ["aggraver", "A9A0853"],
  ["aimer", "A9A1016"],
  ["ajouter", "A9A1047"],
  ["ajuster", "A9A1051"],
  ["amarrer", "A9A1381"],
  ["amener", "A9A1441"],
  ["ancrer", "A9A1693"],
  ["animer", "A9A1803"],
  ["apaiser", "A9A2069"],
  ["apprendre", "A9A2249"],
  ["assumer", "A9A2900"],
  ["attendre", "A9A3030"],
  ["attirer", "A9A3066"],
  ["attraper", "A9A3078"],
  ["avaler", "A9A3332"],
  ["avouer", "A9A3471"],
  ["barrer", "A9B0482"],
  ["blesser", "A9B1365"],
  ["boire", "A9B1462", "p"],
  ["bousculer", "A9B1877"],
  ["brancher", "A9B2003"],
  ["brouiller", "A9B2285"],
  ["calmer", "A9C0327"],
  ["camoufler", "A9C0415"],
  ["caracteriser", "A9C0726"],
  ["ceindre", "A9C1230"],
  ["changer", "A9C1591"],
  ["charger", "A9C1670"],
  ["chercher", "A9C1904"],
  ["clore", "A9C2658"],
  ["combiner", "A9C3062"],
  ["commander", "A9C3091"],
  ["communiquer", "A9C3170"],
  ["concentrer", "A9C3355"],
  ["conduire", "A9C3472"],
  ["conna\xEEtre", "A9C3636"],
  ["corriger", "A9C4351"],
  ["couler", "A9C4538"],
  ["cr\xE9er", "A9C4870"],
  ["croire", "A9C5041"],
  ["croiser", "A9C5047"],
  ["cultiver", "A9C5283"],
  ["danser", "A9D0087", "p"],
  ["deborder", "A9D0233"],
  ["d\xE9couper", "A9D0606"],
  ["d\xE9couvrir", "A9D0628"],
  ["defiler", "A9D0799"],
  ["d\xE9poser", "A9D1558"],
  ["dessiner", "A9D2011"],
  ["devoir", "A9D2262"],
  ["disposer", "A9D2723"],
  ["diviser", "A9D2863", "p"],
  ["documenter", "A9D2924"],
  ["\xE9crire", "A9E0358", "i"],
  ["employer", "A9E1180"],
  ["enfiler", "A9E1555"],
  ["enseigner", "A9E1784", "p"],
  ["essayer", "A9E2664"],
  ["essuyer", "A9E2693"],
  ["estimer", "A9E2733"],
  ["\xE9tudier", "A9E3017", "r"],
  ["examiner", "A9E3207"],
  ["expliquer", "A9E3460"],
  ["fabriquer", "A9F0013"],
  ["faire", "A9F0112"],
  ["fixer", "A9F0878"],
  ["garder", "A9G0255"],
  ["grandir", "A9G1216"],
  ["ha\xEFr", "A9H0071", "r"],
  ["interpeller", "A9I1744", "r"],
  ["inventer", "A9I1922", "p"],
  ["inviter", "A9I1963", "r"],
  ["joindre", "A9J0231"],
  ["juger", "A9J0351", "r"],
  ["laisser", "A9L0132"],
  ["lancer", "A9L0235"],
  ["lire", "A9L0973", "p"],
  ["manger", "A9M0490", "p"],
  ["manquer", "A9M0575"],
  ["menacer", "A9M1668"],
  ["mettre", "A9M1992"],
  ["modeler", "A9M2436"],
  ["monter", "A9M2749"],
  ["mourir", "A9M3019"],
  ["observer", "A9O0082", "r"],
  ["offrir", "A9O0286"],
  ["oindre", "A9O0305"],
  ["organiser", "A9O0703", "p"],
  ["ouvrir", "A9O1025"],
  ["partager", "A9P0750"],
  ["passer", "A9P0853"],
  ["payer", "A9P1095", "p"],
  ["peindre", "A9P1224"],
  ["peler", "A9P1254", "p"],
  ["penser", "A9P1375"],
  ["peser", "A9P1757"],
  ["plaire", "A9P2680", "q"],
  ["plonger", "A9P2934"],
  ["porter", "A9P3531", "p"],
  ["pouvoir", "A9P3829", "p"],
  ["pr\xE9senter", "A9P4144"],
  ["prononcer", "A9P4591", "p"],
  ["raconter", "A9R0122"],
  ["ranger", "A9R0448", "p"],
  ["recevoir", "A9R0843"],
  ["reconna\xEEtre", "A9R0949"],
  ["rencontrer", "A9R1680", "r"],
  ["rendre", "A9R1686"],
  ["rentrer", "A9R1786"],
  ["r\xE9p\xE9ter", "A9R1858"],
  ["r\xE9pondre", "A9R1899", "q"],
  ["reprendre", "A9R1930"],
  ["rire", "A9R2696", "i"],
  ["rompre", "A9R2887"],
  ["savoir", "A9S0657"],
  ["sentir", "A9S1258"],
  ["sortir", "A9S2177"],
  ["souffrir", "A9S2239", "r"],
  ["suivre", "A9S3347"],
  ["tirer", "A9T1270", "p"],
  ["trahir", "A9T1779"],
  ["travailler", "A9T2026", "p"],
  ["tuer", "A9T2638"],
  ["utiliser", "A9U0236", "p"],
  ["valoir", "A9V0113", "r"],
  ["vendre", "A9V0354", "p"],
  ["v\xEAtir", "A9V0637"],
  ["vider", "A9V0766"],
  ["voir", "A9V1094", "p"],
  ["vouloir", "A9V1230"]
];
const PERSONS = {
  default: [4, 5, 6, 7, 8, 9],
  p: [6, 9],
  r: [7, 8, 9],
  i: [4, 5, 6, 7, 8, 9],
  q: [7, 8, 9]
};
const pronominalUseSeeds = ACADEMIE_USES.map(([infinitif, articleId, kind = ""]) => ({
  infinitif,
  typeEmploi: kind === "p" ? "passif" : ["r", "q"].includes(kind) ? "reciproque" : "reflechi",
  fonctionPronom: kind === "p" ? "sans_fonction" : ["i", "q"].includes(kind) ? "coi" : "variable",
  regleAccord: ["i", "q"].includes(kind) ? "invariable" : ["p", "r"].includes(kind) ? "avec_sujet" : "selon_construction",
  personnesAutorisees: PERSONS[kind || "default"],
  sourceUrl: `${SOURCE_ROOT}/${articleId}`
}));

function pronominalInfinitive(infinitive, hType) {
  const first = infinitive.normalize("NFD").replace(/\p{Diacritic}/gu, "").charAt(0).toLocaleLowerCase("fr");
  const elides = "aeiouy".includes(first) || first === "h" && hType !== "aspire";
  return `${elides ? "s'" : "se "}${infinitive}`;
}
async function migratePronominalUses(connection) {
  var _a;
  const [bases] = await connection.execute(`
    SELECT id, infinitif, type_h_initial
    FROM verbes
    WHERE est_archive=0
    ORDER BY infinitif
  `);
  const [existingUses] = await connection.execute(`
    SELECT id, verbe_id, infinitif_pronominal, actif
    FROM emplois_pronominaux
    ORDER BY id
  `);
  const basesByInfinitive = new Map(bases.map((base) => [base.infinitif, base]));
  const usesByInfinitive = new Map(existingUses.map((use) => [use.infinitif_pronominal, use]));
  const missingBases = [];
  let inserted = 0;
  let reactivated = 0;
  for (const seed of pronominalUseSeeds) {
    const base = basesByInfinitive.get(seed.infinitif);
    if (!base) {
      missingBases.push(seed.infinitif);
      continue;
    }
    const infinitifPronominal = pronominalInfinitive(base.infinitif, base.type_h_initial);
    const existing = usesByInfinitive.get(infinitifPronominal);
    if (existing && Number(existing.verbe_id) !== Number(base.id)) {
      throw new Error(
        `${infinitifPronominal} est d\xE9j\xE0 reli\xE9 au verbe ${existing.verbe_id}, pas \xE0 ${base.id}.`
      );
    }
    if (!existing) {
      const [result] = await connection.execute(`
        INSERT INTO emplois_pronominaux
          (verbe_id, infinitif_pronominal, type_emploi, fonction_pronom, regle_accord,
           preposition, personnes_autorisees, source, source_url, statut_validation, actif)
        VALUES (?, ?, ?, ?, ?, NULL, ?,
          'Dictionnaire de l\u2019Acad\xE9mie fran\xE7aise', ?, 'valide', 1)
      `, [
        base.id,
        infinitifPronominal,
        seed.typeEmploi,
        seed.fonctionPronom,
        seed.regleAccord,
        JSON.stringify(seed.personnesAutorisees),
        seed.sourceUrl
      ]);
      inserted += Number(result.affectedRows);
    } else if (!Number(existing.actif)) {
      const [result] = await connection.execute(
        "UPDATE emplois_pronominaux SET actif=1 WHERE id=?",
        [existing.id]
      );
      reactivated += Number(result.affectedRows);
    }
    await connection.execute(
      "UPDATE verbes SET pronominalisable=1 WHERE id=? AND pronominalisable<>1",
      [base.id]
    );
  }
  if (missingBases.length) {
    throw new Error(`Verbes de base introuvables : ${missingBases.join(", ")}.`);
  }
  const [verification] = await connection.execute(`
    SELECT COUNT(*) AS count
    FROM emplois_pronominaux
    WHERE actif=1 AND verbe_id IS NOT NULL
  `);
  return {
    seedCount: pronominalUseSeeds.length,
    inserted,
    reactivated,
    activeUseCount: Number(((_a = verification[0]) == null ? void 0 : _a.count) || 0)
  };
}

const _Qvt69RZj56eCkoAFoZ87Qax4PcSt9omNAJjJjfRESY = defineNitroPlugin(async () => {
  const database = useDatabase();
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const result = await migratePronominalUses(connection);
    await connection.commit();
    console.info(
      `[database] Catalogue pronominal disponible : ${result.activeUseCount} emplois actifs (${result.inserted} ajout\xE9s, ${result.reactivated} r\xE9activ\xE9s).`
    );
  } catch (error) {
    await connection.rollback();
    console.error("[database] \xC9chec de la migration automatique du catalogue pronominal.", error);
  } finally {
    connection.release();
  }
});

const _cJS8fUHbWPAFEGMrZY0adbH3sscbwPp1lUW6TfGNu0 = defineNitroPlugin(async () => {
  try {
    const database = useDatabase();
    await database.query(`
      CREATE TABLE IF NOT EXISTS public_api_rate_limits (
        key_hash CHAR(64) NOT NULL PRIMARY KEY,
        bucket VARCHAR(40) NOT NULL,
        request_count INT UNSIGNED NOT NULL DEFAULT 0,
        window_started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_public_api_rate_limits_updated (updated_at),
        KEY idx_public_api_rate_limits_bucket (bucket)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await database.query(
      "DELETE FROM public_api_rate_limits WHERE updated_at < CURRENT_TIMESTAMP - INTERVAL 2 DAY"
    );
    console.info("[security] Limitation des API publiques disponible.");
  } catch (error) {
    console.error("[security] \xC9chec de la pr\xE9paration de la limitation des API publiques.", error);
  }
});

/**
 * Premier sous-lot pédagogique du lot verbs-frequency-pilot-2026-01.
 *
 * Les sens et constructions sont contrôlés auprès du Dictionnaire de
 * l’Académie française. Les niveaux CECRL sont des estimations pédagogiques
 * internes au projet, pas des niveaux attribués par l’Académie.
 */
const verbPilot202601 = [
  {
    infinitive: 'désoler',
    definition: 'Rendre une personne très triste ou lui causer un grand regret.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'emotion',
    sense: {
      title: 'Causer une grande tristesse',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'personne-affectee',
      complements: [
        'sa famille', 'ses parents', 'son équipe', 'les élèves', 'la directrice',
        'ses collègues', 'le public', 'une amie', 'les enfants', 'son entourage',
      ],
    },
    pronominalUse: {
      infinitive: 'se désoler',
      type: 'subjectif',
      pronounFunction: 'sans_fonction',
      agreementRule: 'avec_sujet',
      allowedPersons: [4, 5, 6, 7, 8, 9],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9D1953',
  },
  {
    infinitive: 'importer',
    definition: 'Faire venir des produits ou des choses depuis un autre pays.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'echange',
    sense: {
      title: 'Faire venir des produits d’un autre pays',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'produit-importe',
      complements: [
        'des fruits', 'des légumes', 'du café', 'une machine', 'des médicaments',
        'des vêtements', 'du matériel', 'des pièces détachées', 'une technologie', 'de l’énergie',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9I0430',
  },
  {
    infinitive: 'prier',
    definition: 'Demander quelque chose avec beaucoup de respect ou s’adresser à Dieu.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'communication',
    sense: {
      title: 'Faire une demande avec respect',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1 de Vinf',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9P4282',
  },
  {
    infinitive: 'mentir',
    definition: 'Dire volontairement une chose que l’on sait fausse.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'communication',
    sense: {
      title: 'Dire quelque chose de faux',
      transitivity: 'transitif_indirect',
      construction: 'N0 V à N1',
      complementType: 'coi',
      preposition: 'à',
      semanticClass: 'destinataire-mensonge',
      complements: [
        'à ses parents', 'à son ami', 'à la professeure', 'aux élèves', 'à sa sœur',
        'au directeur', 'à ses collègues', 'à une voisine', 'à la police', 'aux journalistes',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9M1730',
  },
  {
    infinitive: 'supposer',
    definition: 'Penser qu’une chose est possible ou vraie sans en être certain.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'cognition',
    sense: {
      title: 'Considérer une chose comme possible',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'hypothese',
      complements: [
        'une erreur', 'un lien', 'des difficultés', 'la présence d’un témoin', 'une cause',
        'des changements', 'le retour du train', 'une intention', 'des risques', 'la bonne foi',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9S3479',
  },
  {
    infinitive: 'revoir',
    definition: 'Voir une personne ou une chose une nouvelle fois.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'perception',
    sense: {
      title: 'Voir de nouveau',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'personne-chose-revue',
      complements: [
        'sa famille', 'ses amis', 'la leçon', 'une amie', 'le film',
        'les règles', 'son travail', 'la réponse', 'des photos', 'une décision',
      ],
    },
    pronominalUse: {
      infinitive: 'se revoir',
      type: 'reciproque',
      pronounFunction: 'cod',
      agreementRule: 'avec_sujet',
      allowedPersons: [7, 8, 9],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9R2442',
  },
  {
    infinitive: 'maintenir',
    definition: 'Garder une personne ou une chose dans la même position ou le même état.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'position',
    sense: {
      title: 'Garder dans la même position ou le même état',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-maintenu',
      complements: [
        'la température', 'l’équilibre', 'les liens', 'une distance', 'le rythme',
        'la qualité', 'des services', 'son attention', 'les règles', 'une position',
      ],
    },
    pronominalUse: {
      infinitive: 'se maintenir',
      type: 'subjectif',
      pronounFunction: 'sans_fonction',
      agreementRule: 'avec_sujet',
      allowedPersons: [4, 5, 6, 7, 8, 9],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9M0234',
  },
  {
    infinitive: 'pleurer',
    definition: 'Avoir des larmes qui coulent à cause d’une douleur ou d’une émotion.',
    cefr: 'A1',
    schoolLevels: ['6P'],
    semanticDomain: 'emotion',
    sense: {
      title: 'Verser des larmes',
      transitivity: 'intransitif',
      construction: 'N0 V',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9P2867',
  },
  {
    infinitive: 'prévoir',
    definition: 'Penser à l’avance à ce qui peut arriver ou décider une chose avant.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'cognition',
    sense: {
      title: 'Envisager ou organiser à l’avance',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'evenement-prevu',
      complements: [
        'un voyage', 'la réunion', 'des dépenses', 'une solution', 'le repas',
        'les difficultés', 'une visite', 'une pause', 'des activités', 'la suite',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9P4272',
  },
  {
    infinitive: 'dégager',
    definition: 'Libérer une personne, une chose ou un passage qui était bloqué.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'manipulation',
    sense: {
      title: 'Rendre un passage ou un espace libre',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'espace-libere',
      complements: [
        'la route', 'le passage', 'une sortie', 'les escaliers', 'la table',
        'des places', 'la voie', 'les portes', 'une zone', 'son bureau',
      ],
    },
    pronominalUse: {
      infinitive: 'se dégager',
      type: 'reflechi',
      pronounFunction: 'cod',
      agreementRule: 'avec_sujet',
      allowedPersons: [4, 5, 6, 7, 8, 9],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9D0857',
  },
  {
    infinitive: 'signifier',
    definition: 'Vouloir dire quelque chose ou faire connaître clairement une décision.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'communication',
    sense: {
      title: 'Faire connaître clairement',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'contenu-signifie',
      complements: [
        'sa décision', 'son refus', 'une interdiction', 'les nouvelles règles', 'son accord',
        'la fin du contrat', 'une demande', 'ses intentions', 'la décision', 'des avertissements',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9S1622',
  },
  {
    infinitive: 'ravir',
    definition: 'Donner beaucoup de plaisir ou de joie à une personne.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'emotion',
    sense: {
      title: 'Donner une grande joie',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'personne-rejouie',
      complements: [
        'sa famille', 'le public', 'les enfants', 'une amie', 'ses collègues',
        'la classe', 'les visiteurs', 'son équipe', 'la directrice', 'les invités',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9R0653',
  },
  {
    infinitive: 'appartenir',
    definition: 'Faire partie d’un groupe ou être la propriété d’une personne.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'relations',
    sense: {
      title: 'Faire partie d’un groupe',
      transitivity: 'transitif_indirect',
      construction: 'N0 V à N1',
      complementType: 'coi',
      preposition: 'à',
      semanticClass: 'groupe-appartenance',
      complements: [
        'à une équipe', 'à la classe', 'au club', 'à une association', 'à ce groupe',
        'à une famille', 'au personnel', 'à la chorale', 'à cette génération', 'aux bénévoles',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9A2191',
  },
  {
    infinitive: 'parier',
    definition: 'Dire que l’on pense avoir raison sur un résultat qui reste incertain.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'cognition',
    sense: {
      title: 'Soutenir une opinion sur un résultat incertain',
      transitivity: 'transitif_direct',
      construction: 'N0 V que P',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9P0654',
  },
  {
    infinitive: 'deviner',
    definition: 'Trouver une réponse sans avoir toutes les informations.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'cognition',
    sense: {
      title: 'Trouver par intuition',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'contenu-devine',
      complements: [
        'la réponse', 'une énigme', 'des secrets', 'les intentions', 'la suite',
        'une solution', 'le résultat', 'la cause', 'ses pensées', 'le mot caché',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9D2237',
  },
  {
    infinitive: 'rater',
    definition: 'Ne pas réussir une action ou ne pas arriver à temps pour quelque chose.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'action-processus',
    sense: {
      title: 'Manquer ou ne pas réussir',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'occasion-manquee',
      complements: [
        'les bus', 'la sortie', 'des rendez-vous', 'les cours', 'une occasion',
        'son examen', 'la cible', 'des épisodes', 'la réunion', 'son train',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9R0585',
  },
  {
    infinitive: 'respirer',
    definition: 'Faire entrer de l’air dans son corps, puis le faire sortir.',
    cefr: 'A1',
    schoolLevels: ['6P'],
    semanticDomain: 'corps',
    sense: {
      title: 'Faire entrer et sortir l’air',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'air-odeur',
      complements: [
        'des bouffées d’air frais', 'les parfums des fleurs', 'une odeur agréable', 'des odeurs marines', 'des parfums',
        'l’odeur du pain', 'un air pur', 'la fraîcheur du matin', 'des odeurs de forêt', 'l’air de la montagne',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9R2093',
  },
  {
    infinitive: 'fonctionner',
    definition: 'Faire correctement le travail prévu pour une machine ou un système.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'creation-travail',
    sense: {
      title: 'Faire le travail prévu',
      transitivity: 'intransitif',
      construction: 'N0 V',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9F1179',
  },
  {
    infinitive: 'remplir',
    definition: 'Mettre quelque chose dans un espace jusqu’à ce qu’il soit plein.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'transformation',
    sense: {
      title: 'Rendre un contenant plein',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'contenant-rempli',
      complements: [
        'la bouteille', 'des formulaires', 'les verres', 'une boîte', 'le réservoir',
        'des sacs', 'la piscine', 'son panier', 'les cases', 'une valise',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9R1636',
  },
  {
    infinitive: 'durer',
    definition: 'Continuer pendant un certain temps.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'etat-existence',
    sense: {
      title: 'Continuer pendant un temps',
      transitivity: 'intransitif',
      construction: 'N0 V',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9D3385',
  },
];

new Map(
  verbPilot202601.map(entry => [entry.infinitive, entry]),
);

/**
 * Deuxième sous-lot pédagogique du lot verbs-frequency-pilot-2026-01.
 *
 * Les sens et constructions sont contrôlés auprès du Dictionnaire de
 * l’Académie française. Les niveaux CECRL sont des estimations pédagogiques
 * internes au projet, pas des niveaux attribués par l’Académie.
 */
const verbPilot202601Part02 = [
  {
    infinitive: 'rechercher',
    definition: 'Chercher avec soin une personne, une chose ou une information.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'cognition',
    sense: {
      title: 'Chercher avec soin',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-recherche',
      complements: [
        'une adresse', 'la solution', 'des informations', 'une école', 'le document',
        'les causes', 'une personne', 'la vérité', 'des indices', 'les réponses',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9R0870',
  },
  {
    infinitive: 'refaire',
    definition: 'Faire une nouvelle fois une action ou une chose.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'action-processus',
    sense: {
      title: 'Faire une nouvelle fois',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'action-repetee',
      complements: [
        'un exercice', 'la recette', 'ses calculs', 'une affiche', 'le trajet',
        'les dessins', 'une expérience', 'la peinture', 'des essais', 'les étapes',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9R1179',
  },
  {
    infinitive: 'dépendre',
    definition: 'Être lié à une personne ou à une chose qui peut changer la situation.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'relations',
    sense: {
      title: 'Être déterminé par quelque chose',
      transitivity: 'transitif_indirect',
      construction: 'N0 V de N1',
      complementType: 'coi',
      preposition: 'de',
      semanticClass: 'condition',
      complements: [
        'de la météo', 'du résultat', 'des horaires', 'de sa décision', 'du budget',
        'de plusieurs facteurs', 'des règles', 'de la température', 'du contexte', 'de leurs réponses',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9D1467',
  },
  {
    infinitive: 'soutenir',
    definition: 'Tenir une personne ou une chose pour l’empêcher de tomber.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'position',
    sense: {
      title: 'Empêcher de tomber',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-soutenu',
      complements: [
        'une branche', 'la personne blessée', 'des étagères', 'une plante', 'le plafond',
        'les panneaux', 'une poutre', 'la tête', 'ses camarades', 'les murs',
      ],
    },
    pronominalUse: {
      infinitive: 'se soutenir',
      type: 'reflechi',
      pronounFunction: 'cod',
      agreementRule: 'avec_sujet',
      allowedPersons: [4, 5, 6, 7, 8, 9],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9S2465',
  },
  {
    infinitive: 'guérir',
    definition: 'Retrouver la santé ou faire disparaître une maladie ou une blessure.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'corps',
    sense: {
      title: 'Retrouver la santé',
      transitivity: 'intransitif',
      construction: 'N0 V',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9G1667',
  },
  {
    infinitive: 'autoriser',
    definition: 'Donner à une personne le droit de faire quelque chose.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'modalite',
    sense: {
      title: 'Donner une permission',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'personne-autorisee',
      complements: [
        'une élève', 'la classe', 'ses enfants', 'une équipe', 'le visiteur',
        'les participantes', 'une amie', 'la conductrice', 'des journalistes', 'les responsables',
      ],
    },
    pronominalUse: {
      infinitive: 's’autoriser',
      type: 'reflechi',
      pronounFunction: 'coi',
      agreementRule: 'sans_accord',
      allowedPersons: [4, 5, 6, 7, 8, 9],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9A3297',
  },
  {
    infinitive: 'correspondre',
    definition: 'Être en accord avec une chose ou avoir un lien avec elle.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'relations',
    sense: {
      title: 'Être en accord avec',
      transitivity: 'transitif_indirect',
      construction: 'N0 V à N1',
      complementType: 'coi',
      preposition: 'à',
      semanticClass: 'element-comparable',
      complements: [
        'à la description', 'au modèle', 'aux attentes', 'à sa demande', 'au résultat',
        'à la réalité', 'aux critères', 'à cette image', 'au niveau demandé', 'à leurs besoins',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9C4347',
  },
  {
    infinitive: 'voter',
    definition: 'Exprimer son choix dans une élection ou décider par un vote.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'relations',
    sense: {
      title: 'Décider par un vote',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'decision-votee',
      complements: [
        'une loi', 'la proposition', 'des mesures', 'une règle', 'le budget',
        'les changements', 'une résolution', 'la motion', 'des crédits', 'les nouvelles règles',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9V1223',
  },
  {
    infinitive: 'réunir',
    definition: 'Mettre ensemble plusieurs personnes ou plusieurs choses.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'relations',
    sense: {
      title: 'Mettre ensemble',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'elements-rassembles',
      complements: [
        'une équipe', 'la famille', 'des élèves', 'une collection', 'le groupe',
        'les participantes', 'une classe', 'la commission', 'des documents', 'les équipes',
      ],
    },
    pronominalUse: {
      infinitive: 'se réunir',
      type: 'reciproque',
      pronounFunction: 'sans_fonction',
      agreementRule: 'avec_sujet',
      allowedPersons: [7, 8, 9],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9R2336',
  },
  {
    infinitive: 'déménager',
    definition: 'Quitter son logement pour aller habiter dans un autre.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'mouvement',
    sense: {
      title: 'Changer de logement',
      transitivity: 'intransitif',
      construction: 'N0 V',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9D1152',
  },
  {
    infinitive: 'insister',
    definition: 'Dire ou demander plusieurs fois quelque chose que l’on juge important.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'communication',
    sense: {
      title: 'Revenir avec force sur une demande',
      transitivity: 'intransitif',
      construction: 'N0 V',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9I1472',
  },
  {
    infinitive: 'décevoir',
    definition: 'Rendre une personne triste parce que ce qu’elle espérait ne se réalise pas.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'emotion',
    sense: {
      title: 'Ne pas répondre à une attente',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'personne-decue',
      complements: [
        'une amie', 'la famille', 'ses parents', 'une équipe', 'le public',
        'les élèves', 'une collègue', 'la directrice', 'des supporters', 'les participantes',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9D0409',
  },
  {
    infinitive: 'viser',
    definition: 'Diriger son regard ou un objet vers une cible précise.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'perception',
    sense: {
      title: 'Diriger vers une cible',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'cible',
      complements: [
        'une cible', 'la corbeille', 'des cerceaux', 'une zone', 'le centre',
        'les quilles', 'une ouverture', 'la marque', 'des panneaux', 'les buts',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9V0954',
  },
  {
    infinitive: 'réagir',
    definition: 'Agir ou montrer une émotion en réponse à ce qui arrive.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'action-processus',
    sense: {
      title: 'Agir en réponse à un évènement',
      transitivity: 'transitif_indirect',
      construction: 'N0 V à N1',
      complementType: 'coi',
      preposition: 'à',
      semanticClass: 'evenement-declencheur',
      complements: [
        'à la nouvelle', 'au bruit', 'aux critiques', 'à sa remarque', 'au changement',
        'à la chaleur', 'aux résultats', 'à cette décision', 'au signal', 'à leurs questions',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9R0708',
  },
  {
    infinitive: 'enquêter',
    definition: 'Chercher des informations pour comprendre ce qui s’est passé.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'cognition',
    sense: {
      title: 'Chercher des informations',
      transitivity: 'intransitif',
      construction: 'N0 V',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9E1731',
  },
  {
    infinitive: 'contenir',
    definition: 'Avoir une chose à l’intérieur ou empêcher quelque chose de se répandre.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'etat-existence',
    sense: {
      title: 'Avoir à l’intérieur',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'contenu',
      complements: [
        'une lettre', 'la réponse', 'des vitamines', 'une surprise', 'le matériel',
        'les ingrédients', 'une erreur', 'la liste', 'des images', 'les consignes',
      ],
    },
    pronominalUse: {
      infinitive: 'se contenir',
      type: 'reflechi',
      pronounFunction: 'cod',
      agreementRule: 'avec_sujet',
      allowedPersons: [4, 5, 6, 7, 8, 9],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9C3815',
  },
  {
    infinitive: 'fêter',
    definition: 'Célébrer un évènement heureux en montrant sa joie.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'relations',
    sense: {
      title: 'Célébrer un évènement',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'evenement-celebre',
      complements: [
        'un anniversaire', 'la victoire', 'des réussites', 'une naissance', 'le retour',
        'les vacances', 'une promotion', 'la fin des cours', 'des retrouvailles', 'les résultats',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9F0579',
  },
  {
    infinitive: 'fournir',
    definition: 'Donner ce qui est nécessaire à une personne ou à une activité.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'echange',
    sense: {
      title: 'Donner ce qui est nécessaire',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-fourni',
      complements: [
        'une preuve', 'la nourriture', 'des renseignements', 'une adresse', 'le matériel',
        'les documents', 'une explication', 'la liste', 'des outils', 'les résultats',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9F1439',
  },
  {
    infinitive: 'veiller',
    definition: 'Rester éveillé ou faire attention à une personne ou à une chose.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'perception',
    sense: {
      title: 'Rester éveillé',
      transitivity: 'intransitif',
      construction: 'N0 V',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9V0293',
  },
  {
    infinitive: 'visiter',
    definition: 'Aller voir un lieu pour le découvrir ou une personne pour la rencontrer.',
    cefr: 'A1',
    schoolLevels: ['6P'],
    semanticDomain: 'mouvement',
    sense: {
      title: 'Aller voir un lieu',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'lieu-visite',
      complements: [
        'une ville', 'la région', 'des musées', 'une exposition', 'le château',
        'les monuments', 'une école', 'la vieille ville', 'des villages', 'les jardins',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9V0974',
  },
];

new Map(
  verbPilot202601Part02.map(entry => [entry.infinitive, entry]),
);

/**
 * Troisième sous-lot pédagogique du lot verbs-frequency-pilot-2026-01.
 *
 * Les sens et constructions sont contrôlés auprès du Dictionnaire de
 * l’Académie française. Les niveaux CECRL sont des estimations pédagogiques
 * internes au projet, pas des niveaux attribués par l’Académie.
 */
const verbPilot202601Part03 = [
  {
    infinitive: 'échanger',
    definition: 'Donner une chose et en recevoir une autre en retour.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'echange',
    sense: {
      title: 'Donner et recevoir en retour',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-echange',
      complements: [
        'une idée', 'la nouvelle', 'des messages', 'une adresse', 'le livre',
        'les informations', 'une photo', 'la recette', 'des conseils', 'les coordonnées',
      ],
    },
    pronominalUse: {
      infinitive: 's’échanger',
      type: 'passif',
      pronounFunction: 'sans_fonction',
      agreementRule: 'avec_sujet',
      allowedPersons: [6, 9],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9E0137',
  },
  {
    infinitive: 'renoncer',
    definition: 'Décider de ne plus faire ou de ne plus vouloir quelque chose.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'modalite',
    sense: {
      title: 'Abandonner un projet ou une intention',
      transitivity: 'transitif_indirect',
      construction: 'N0 V à N1',
      complementType: 'coi',
      preposition: 'à',
      semanticClass: 'projet-abandonne',
      complements: [
        'à la sortie', 'au voyage', 'aux vacances', 'à son projet', 'au concours',
        'à la compétition', 'aux avantages', 'à cette idée', 'au rendez-vous', 'à leurs demandes',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9R1749',
  },
  {
    infinitive: 'obéir',
    definition: 'Faire ce qu’une personne ou une règle demande.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'relations',
    sense: {
      title: 'Faire ce qui est demandé',
      transitivity: 'transitif_indirect',
      construction: 'N0 V à N1',
      complementType: 'coi',
      preposition: 'à',
      semanticClass: 'autorite-consigne',
      complements: [
        'à sa mère', 'au professeur', 'aux règles', 'à la directrice', 'au règlement',
        'à ses parents', 'aux consignes', 'à une responsable', 'au signal', 'à leurs ordres',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9O0009',
  },
  {
    infinitive: 'ordonner',
    definition: 'Donner un ordre ou demander qu’une action soit faite.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'communication',
    sense: {
      title: 'Donner l’ordre de faire',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'action-ordonnee',
      complements: [
        'une évacuation', 'la fermeture', 'des travaux', 'une enquête', 'le départ',
        'les vérifications', 'une intervention', 'la reprise', 'des contrôles', 'les mesures',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9O0674',
  },
  {
    infinitive: 'douer',
    definition: 'Donner naturellement à une personne une qualité ou une capacité.',
    cefr: 'B2',
    schoolLevels: ['10H'],
    semanticDomain: 'etat-existence',
    sense: {
      title: 'Donner une qualité naturelle',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1 de N2',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9D3151',
  },
  {
    infinitive: 'mentionner',
    definition: 'Parler brièvement d’une personne, d’une chose ou d’un fait.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'communication',
    sense: {
      title: 'Parler brièvement de',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'information-mentionnee',
      complements: [
        'une date', 'la source', 'des détails', 'une adresse', 'le nom',
        'les raisons', 'une erreur', 'la décision', 'des exemples', 'les références',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9M1729',
  },
  {
    infinitive: 'repérer',
    definition: 'Trouver une personne ou une chose et savoir où elle se trouve.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'perception',
    sense: {
      title: 'Trouver et situer',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-repere',
      complements: [
        'une erreur', 'la sortie', 'des indices', 'une balise', 'le chemin',
        'les différences', 'une adresse', 'la cible', 'des obstacles', 'les panneaux',
      ],
    },
    pronominalUse: {
      infinitive: 'se repérer',
      type: 'reflechi',
      pronounFunction: 'cod',
      agreementRule: 'avec_sujet',
      allowedPersons: [4, 5, 6, 7, 8, 9],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9R1854',
  },
  {
    infinitive: 'hésiter',
    definition: 'Ne pas réussir à choisir rapidement entre plusieurs possibilités.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'cognition',
    sense: {
      title: 'Avoir du mal à choisir',
      transitivity: 'intransitif',
      construction: 'N0 V',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9H0592',
  },
  {
    infinitive: 'hurler',
    definition: 'Pousser un cri très fort ou parler d’une voix très forte.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'communication',
    sense: {
      title: 'Pousser un cri très fort',
      transitivity: 'intransitif',
      construction: 'N0 V',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9H1135',
  },
  {
    infinitive: 'établir',
    definition: 'Créer quelque chose de manière solide ou montrer qu’un fait est vrai.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'creation-travail',
    sense: {
      title: 'Créer de manière solide',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-etabli',
      complements: [
        'une liste', 'la règle', 'des contacts', 'une relation', 'le programme',
        'les faits', 'une carte', 'la vérité', 'des priorités', 'les responsabilités',
      ],
    },
    pronominalUse: {
      infinitive: 's’établir',
      type: 'subjectif',
      pronounFunction: 'sans_fonction',
      agreementRule: 'avec_sujet',
      allowedPersons: [4, 5, 6, 7, 8, 9],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9E2775',
  },
  {
    infinitive: 'vomir',
    definition: 'Rejeter par la bouche ce qui se trouve dans l’estomac.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'corps',
    sense: {
      title: 'Rejeter le contenu de l’estomac',
      transitivity: 'intransitif',
      construction: 'N0 V',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9V1207',
  },
  {
    infinitive: 'parer',
    definition: 'Décorer une personne, une chose ou un lieu.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'transformation',
    sense: {
      title: 'Décorer',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-decore',
      complements: [
        'une salle', 'la table', 'des fleurs', 'une vitrine', 'le sapin',
        'les murs', 'une scène', 'la maison', 'des guirlandes', 'les fenêtres',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9P0623',
  },
  {
    infinitive: 'déclencher',
    definition: 'Faire commencer brusquement une action ou un évènement.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'action-processus',
    sense: {
      title: 'Faire commencer brusquement',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'evenement-declenche',
      complements: [
        'une alarme', 'la réaction', 'des mouvements', 'une enquête', 'le départ',
        'les opérations', 'une crise', 'la procédure', 'des changements', 'les secours',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9D0505',
  },
  {
    infinitive: 'avérer',
    definition: 'Montrer qu’une chose est vraie. Ce verbe est surtout utilisé sous la forme « s’avérer ».',
    cefr: 'B2',
    schoolLevels: ['10H'],
    semanticDomain: 'cognition',
    sense: {
      title: 'Montrer qu’une chose est vraie',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    pronominalUse: {
      infinitive: 's’avérer',
      type: 'subjectif',
      pronounFunction: 'sans_fonction',
      agreementRule: 'avec_sujet',
      allowedPersons: [6, 9],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/B0A3408',
  },
  {
    infinitive: 'foncer',
    definition: 'Avancer très vite et directement vers un endroit.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'mouvement',
    sense: {
      title: 'Avancer très vite',
      transitivity: 'intransitif',
      construction: 'N0 V',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9F1163',
  },
  {
    infinitive: 'embarquer',
    definition: 'Faire monter une personne ou charger une chose dans un moyen de transport.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'mouvement',
    sense: {
      title: 'Faire monter ou charger',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-embarque',
      complements: [
        'une valise', 'la marchandise', 'des passagers', 'une équipe', 'le matériel',
        'les véhicules', 'une caisse', 'la cargaison', 'des vélos', 'les bagages',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9E0866',
  },
  {
    infinitive: 'chérir',
    definition: 'Aimer très fort une personne, une chose ou un souvenir.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'emotion',
    sense: {
      title: 'Aimer très fort',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-aime',
      complements: [
        'une amie', 'la famille', 'ses enfants', 'une personne', 'le souvenir',
        'les traditions', 'une idée', 'la liberté', 'des proches', 'les moments',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9C1913',
  },
  {
    infinitive: 'exiger',
    definition: 'Demander quelque chose avec fermeté parce qu’on le juge nécessaire.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'communication',
    sense: {
      title: 'Demander avec fermeté',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-exige',
      complements: [
        'une réponse', 'la présence', 'des efforts', 'une preuve', 'le respect',
        'les documents', 'une autorisation', 'la qualité', 'des garanties', 'les résultats',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9E3350',
  },
  {
    infinitive: 'boiter',
    definition: 'Marcher de façon irrégulière parce qu’une jambe fait mal ou fonctionne mal.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'corps',
    sense: {
      title: 'Marcher de façon irrégulière',
      transitivity: 'intransitif',
      construction: 'N0 V',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9B1477',
  },
  {
    infinitive: 'transporter',
    definition: 'Porter ou déplacer une personne ou une chose d’un endroit à un autre.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'mouvement',
    sense: {
      title: 'Déplacer d’un endroit à un autre',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-transporte',
      complements: [
        'une valise', 'la marchandise', 'des personnes', 'une caisse', 'le matériel',
        'les voyageurs', 'une table', 'la nourriture', 'des colis', 'les élèves',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9T1969',
  },
];

new Map(
  verbPilot202601Part03.map(entry => [entry.infinitive, entry]),
);

/**
 * Quatrième sous-lot pédagogique du lot verbs-frequency-pilot-2026-01.
 *
 * Les sens et constructions sont contrôlés auprès du Dictionnaire de
 * l’Académie française. Les niveaux CECRL sont des estimations pédagogiques
 * internes au projet, pas des niveaux attribués par l’Académie.
 */
const verbPilot202601Part04 = [
  {
    infinitive: 'navrer',
    definition: 'Rendre une personne très triste ou lui causer un grand regret.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'emotion',
    sense: {
      title: 'Causer une grande tristesse',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'personne-affectee',
      complements: [
        'une amie', 'la famille', 'ses parents', 'une équipe', 'le public',
        'les élèves', 'une collègue', 'la directrice', 'des supporters', 'les participantes',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9N0171',
  },
  {
    infinitive: 'entourer',
    definition: 'Placer des personnes ou des choses tout autour de quelqu’un ou de quelque chose.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'position',
    sense: {
      title: 'Placer tout autour',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-entoure',
      complements: [
        'une maison', 'la place', 'des arbres', 'une personne', 'le jardin',
        'les bâtiments', 'une table', 'la cour', 'des barrières', 'les enfants',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9E1895',
  },
  {
    infinitive: 'lutter',
    definition: 'Faire de grands efforts pour combattre une difficulté ou un danger.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'action-processus',
    sense: {
      title: 'Combattre une difficulté',
      transitivity: 'intransitif',
      construction: 'N0 V',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9L1400',
  },
  {
    infinitive: 'ralentir',
    definition: 'Faire aller moins vite une personne, une chose ou une action.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'mouvement',
    sense: {
      title: 'Faire aller moins vite',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-ralenti',
      complements: [
        'une voiture', 'la circulation', 'des véhicules', 'une machine', 'le rythme',
        'les travaux', 'une descente', 'la progression', 'des coureurs', 'les opérations',
      ],
    },
    pronominalUse: {
      infinitive: 'se ralentir',
      type: 'subjectif',
      pronounFunction: 'sans_fonction',
      agreementRule: 'avec_sujet',
      allowedPersons: [6, 9],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9R0343',
  },
  {
    infinitive: 'dater',
    definition: 'Indiquer la date d’un document, d’un objet ou d’un évènement.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'cognition',
    sense: {
      title: 'Indiquer une date',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-date',
      complements: [
        'une lettre', 'la demande', 'des documents', 'une photo', 'le formulaire',
        'les œuvres', 'une découverte', 'la construction', 'des objets', 'les évènements',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9D0116',
  },
  {
    infinitive: 'intervenir',
    definition: 'Agir dans une situation pour aider, modifier ou arrêter ce qui se passe.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'action-processus',
    sense: {
      title: 'Agir dans une situation',
      transitivity: 'intransitif',
      construction: 'N0 V',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9I1793',
  },
  {
    infinitive: 'déterminer',
    definition: 'Trouver avec précision une information ou décider d’une chose.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'cognition',
    sense: {
      title: 'Trouver avec précision',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-determine',
      complements: [
        'une date', 'la cause', 'des priorités', 'une distance', 'le résultat',
        'les besoins', 'une direction', 'la valeur', 'des objectifs', 'les responsabilités',
      ],
    },
    pronominalUse: {
      infinitive: 'se déterminer',
      type: 'subjectif',
      pronounFunction: 'sans_fonction',
      agreementRule: 'avec_sujet',
      allowedPersons: [4, 5, 6, 7, 8, 9],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9D2099',
  },
  {
    infinitive: 'puer',
    definition: 'Avoir une odeur très mauvaise.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'perception',
    sense: {
      title: 'Sentir très mauvais',
      transitivity: 'intransitif',
      construction: 'N0 V',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9P5011',
  },
  {
    infinitive: 'garantir',
    definition: 'Assurer qu’une chose est vraie, possible ou protégée.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'communication',
    sense: {
      title: 'Assurer qu’une chose est certaine',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-garanti',
      complements: [
        'une place', 'la sécurité', 'des résultats', 'une protection', 'le paiement',
        'les droits', 'une qualité', 'la livraison', 'des services', 'les libertés',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9G0224',
  },
  {
    infinitive: 'emménager',
    definition: 'S’installer dans un nouveau logement pour y habiter.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'mouvement',
    sense: {
      title: 'S’installer dans un logement',
      transitivity: 'intransitif',
      construction: 'N0 V',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9E1064',
  },
  {
    infinitive: 'rassurer',
    definition: 'Faire disparaître la peur ou l’inquiétude d’une personne.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'emotion',
    sense: {
      title: 'Faire disparaître une inquiétude',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'personne-rassuree',
      complements: [
        'une amie', 'la famille', 'ses parents', 'une élève', 'le patient',
        'les enfants', 'une collègue', 'la conductrice', 'des voyageurs', 'les participantes',
      ],
    },
    pronominalUse: {
      infinitive: 'se rassurer',
      type: 'reflechi',
      pronounFunction: 'cod',
      agreementRule: 'avec_sujet',
      allowedPersons: [4, 5, 6, 7, 8, 9],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9R0562',
  },
  {
    infinitive: 'concevoir',
    definition: 'Créer une idée ou imaginer la manière de fabriquer quelque chose.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'creation-travail',
    sense: {
      title: 'Imaginer et préparer',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-concu',
      complements: [
        'une affiche', 'la méthode', 'des projets', 'une application', 'le programme',
        'les plans', 'une expérience', 'la solution', 'des activités', 'les exercices',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9C3380',
  },
  {
    infinitive: 'adopter',
    definition: 'Choisir une manière de faire, une idée ou une règle.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'cognition',
    sense: {
      title: 'Choisir et accepter',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-adopte',
      complements: [
        'une règle', 'la proposition', 'des mesures', 'une méthode', 'le projet',
        'les changements', 'une attitude', 'la solution', 'des habitudes', 'les recommandations',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9A0582',
  },
  {
    infinitive: 'sécuriser',
    definition: 'Rendre une personne, un lieu ou une activité plus sûre.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'action-processus',
    sense: {
      title: 'Rendre plus sûr',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-securise',
      complements: [
        'une entrée', 'la route', 'des accès', 'une école', 'le bâtiment',
        'les données', 'une zone', 'la connexion', 'des passages', 'les installations',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9S1020',
  },
  {
    infinitive: 'parvenir',
    definition: 'Arriver à un endroit ou réussir à atteindre un résultat.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'mouvement',
    sense: {
      title: 'Arriver à un endroit ou à un résultat',
      transitivity: 'transitif_indirect',
      construction: 'N0 V à N1',
      complementType: 'coi',
      preposition: 'à',
      semanticClass: 'destination-resultat',
      complements: [
        'à la sortie', 'au sommet', 'aux premières places', 'à son objectif', 'au village',
        'à la solution', 'aux résultats attendus', 'à cette conclusion', 'au refuge', 'à leurs fins',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9P0800',
  },
  {
    infinitive: 'grimper',
    definition: 'Monter en s’aidant de ses mains et de ses pieds ou monter rapidement.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'mouvement',
    sense: {
      title: 'Monter avec effort',
      transitivity: 'intransitif',
      construction: 'N0 V',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9G1517',
  },
  {
    infinitive: 'évacuer',
    definition: 'Faire sortir des personnes ou enlever des choses d’un lieu.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'mouvement',
    sense: {
      title: 'Faire sortir d’un lieu',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-evacue',
      complements: [
        'une personne', 'la classe', 'des habitants', 'une équipe', 'le bâtiment',
        'les visiteurs', 'une salle', 'la zone', 'des déchets', 'les élèves',
      ],
    },
    pronominalUse: {
      infinitive: 's’évacuer',
      type: 'passif',
      pronounFunction: 'sans_fonction',
      agreementRule: 'avec_sujet',
      allowedPersons: [6, 9],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9E3097',
  },
  {
    infinitive: 'reparler',
    definition: 'Parler une nouvelle fois d’une personne, d’une chose ou d’un sujet.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'communication',
    sense: {
      title: 'Parler de nouveau',
      transitivity: 'transitif_indirect',
      construction: 'N0 V de N1',
      complementType: 'coi',
      preposition: 'de',
      semanticClass: 'sujet-discute',
      complements: [
        'de la réunion', 'du voyage', 'des résultats', 'de sa proposition', 'du problème',
        'de la solution', 'des règles', 'de cette histoire', 'du projet', 'de leurs idées',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9R1821',
  },
  {
    infinitive: 'redevenir',
    definition: 'Commencer une nouvelle fois à être dans un état que l’on connaissait avant.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'transformation',
    sense: {
      title: 'Retrouver un ancien état',
      transitivity: 'intransitif',
      construction: 'N0 V attribut',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9R1098',
  },
  {
    infinitive: 'analyser',
    definition: 'Étudier avec attention les différentes parties d’une chose.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'cognition',
    sense: {
      title: 'Étudier avec attention',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-analyse',
      complements: [
        'une phrase', 'la situation', 'des résultats', 'une image', 'le document',
        'les données', 'une réponse', 'la méthode', 'des textes', 'les différences',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9A1643',
  },
];

new Map(
  verbPilot202601Part04.map(entry => [entry.infinitive, entry]),
);

/**
 * Cinquième sous-lot pédagogique du lot verbs-frequency-pilot-2026-01.
 *
 * Les sens et constructions sont contrôlés auprès du Dictionnaire de
 * l’Académie française. Les niveaux CECRL sont des estimations pédagogiques
 * internes au projet, pas des niveaux attribués par l’Académie.
 */
const verbPilot202601Part05 = [
  {
    infinitive: 'larguer',
    definition: 'Détacher ou laisser partir une chose qui était retenue.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'manipulation',
    sense: {
      title: 'Détacher ou laisser partir',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-libere',
      complements: [
        'une corde', 'la remorque', 'des amarres', 'une bouée', 'le câble',
        'les attaches', 'une voile', 'la charge', 'des objets', 'les parachutes',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9L0348',
  },
  {
    infinitive: 'bourrer',
    definition: 'Remplir complètement un espace en tassant ce que l’on y met.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'manipulation',
    sense: {
      title: 'Remplir en tassant',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'contenant-rempli',
      complements: [
        'une valise', 'la boîte', 'des coussins', 'une enveloppe', 'le sac',
        'les poches', 'une caisse', 'la corbeille', 'des paniers', 'les tiroirs',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9B1856',
  },
  {
    infinitive: 'pourrir',
    definition: 'Se décomposer et devenir mauvais sous l’action de l’humidité ou du temps.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'transformation',
    sense: {
      title: 'Se décomposer',
      transitivity: 'intransitif',
      construction: 'N0 V',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9P3788',
  },
  {
    infinitive: 'embaucher',
    definition: 'Engager une personne pour lui donner un travail payé.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'creation-travail',
    sense: {
      title: 'Engager pour un travail',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'personne-engagee',
      complements: [
        'une apprentie', 'la candidate', 'des employés', 'une spécialiste', 'le technicien',
        'les stagiaires', 'une secrétaire', 'la cuisinière', 'des ingénieurs', 'les responsables',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9E0888',
  },
  {
    infinitive: 'effondrer',
    definition: 'Faire tomber une construction ou, sous la forme « s’effondrer », tomber brusquement.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'transformation',
    sense: {
      title: 'Faire tomber une construction',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    pronominalUse: {
      infinitive: 's’effondrer',
      type: 'subjectif',
      pronounFunction: 'sans_fonction',
      agreementRule: 'avec_sujet',
      allowedPersons: [4, 5, 6, 7, 8, 9],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9E0506',
  },
  {
    infinitive: 'investir',
    definition: 'Placer de l’argent ou des moyens dans un projet pour préparer l’avenir.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'echange',
    sense: {
      title: 'Placer de l’argent ou des moyens',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'ressource-investie',
      complements: [
        'une somme', 'la totalité', 'des économies', 'une partie du budget', 'le capital',
        'les bénéfices', 'une réserve', 'la recette', 'des ressources', 'les fonds disponibles',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9I1941',
  },
  {
    infinitive: 'tarder',
    definition: 'Mettre plus de temps que prévu avant de faire une action ou d’arriver.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'action-processus',
    sense: {
      title: 'Mettre plus de temps que prévu',
      transitivity: 'intransitif',
      construction: 'N0 V',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9T0315',
  },
  {
    infinitive: 'franchir',
    definition: 'Passer au-delà d’un obstacle, d’une limite ou d’un passage.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'mouvement',
    sense: {
      title: 'Passer au-delà',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'obstacle-franchi',
      complements: [
        'une frontière', 'la rivière', 'des obstacles', 'une étape', 'le pont',
        'les barrières', 'une porte', 'la ligne', 'des passages', 'les montagnes',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9F1533',
  },
  {
    infinitive: 'fréquenter',
    definition: 'Aller souvent dans un lieu ou rencontrer régulièrement une personne.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'relations',
    sense: {
      title: 'Aller souvent dans un lieu',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'lieu-personne-frequente',
      complements: [
        'une bibliothèque', 'la piscine', 'des musées', 'une école', 'le centre sportif',
        'les commerces', 'une association', 'la médiathèque', 'des ateliers', 'les parcs',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9F1629',
  },
  {
    infinitive: 'sacrer',
    definition: 'Donner officiellement un caractère sacré ou un titre très important à une personne.',
    cefr: 'B2',
    schoolLevels: ['10H'],
    semanticDomain: 'relations',
    sense: {
      title: 'Donner un caractère sacré',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: null,
      semanticClass: null,
      complements: [],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9S0097',
  },
  {
    infinitive: 'provenir',
    definition: 'Venir d’un lieu, d’une personne ou d’une cause.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'mouvement',
    sense: {
      title: 'Venir de',
      transitivity: 'transitif_indirect',
      construction: 'N0 V de N1',
      complementType: 'coi',
      preposition: 'de',
      semanticClass: 'origine',
      complements: [
        'de la région', 'du jardin', 'des montagnes', 'de cette usine', 'du voisinage',
        'de la rivière', 'des élèves', 'de cette erreur', 'du laboratoire', 'de leurs recherches',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9P4812',
  },
  {
    infinitive: 'sécher',
    definition: 'Rendre une personne ou une chose sèche en retirant son eau ou son humidité.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'transformation',
    sense: {
      title: 'Rendre sec',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-seche',
      complements: [
        'une serviette', 'la vaisselle', 'des vêtements', 'une feuille', 'le linge',
        'les cheveux', 'une assiette', 'la peinture', 'des herbes', 'les chaussures',
      ],
    },
    pronominalUse: {
      infinitive: 'se sécher',
      type: 'reflechi',
      pronounFunction: 'cod',
      agreementRule: 'avec_sujet',
      allowedPersons: [4, 5, 6, 7, 8, 9],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9S0969',
  },
  {
    infinitive: 'doubler',
    definition: 'Rendre une quantité deux fois plus grande ou dépasser une personne en mouvement.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'transformation',
    sense: {
      title: 'Rendre deux fois plus grand',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-double',
      complements: [
        'une quantité', 'la distance', 'des portions', 'une équipe', 'le nombre',
        'les réserves', 'une recette', 'la dose', 'des mesures', 'les capacités',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9D3120',
  },
  {
    infinitive: 'draguer',
    definition: 'Nettoyer ou creuser le fond d’un cours d’eau, d’un canal ou d’un port.',
    cefr: 'B2',
    schoolLevels: ['10H'],
    semanticDomain: 'creation-travail',
    sense: {
      title: 'Nettoyer le fond d’une voie d’eau',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'voie-eau-nettoyee',
      complements: [
        'une rivière', 'la baie', 'des canaux', 'une voie navigable', 'le port',
        'les bassins', 'une embouchure', 'la passe', 'des chenaux', 'les zones portuaires',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9D3207',
  },
  {
    infinitive: 'activer',
    definition: 'Mettre en marche un appareil, une fonction ou un système.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'manipulation',
    sense: {
      title: 'Mettre en marche',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-active',
      complements: [
        'une alarme', 'la fonction', 'des options', 'une connexion', 'le système',
        'les commandes', 'une application', 'la minuterie', 'des capteurs', 'les notifications',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9A0478',
  },
  {
    infinitive: 'contrer',
    definition: 'S’opposer à une action pour l’empêcher de réussir.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'action-processus',
    sense: {
      title: 'Empêcher une action de réussir',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'action-bloquee',
      complements: [
        'une attaque', 'la proposition', 'des arguments', 'une stratégie', 'le projet',
        'les critiques', 'une tentative', 'la manœuvre', 'des mesures', 'les effets',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9C4016',
  },
  {
    infinitive: 'unir',
    definition: 'Mettre ensemble des personnes ou des choses pour former un même groupe.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'relations',
    sense: {
      title: 'Mettre ensemble',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'elements-unis',
      complements: [
        'une équipe', 'la famille', 'des personnes', 'une classe', 'le groupe',
        'les participantes', 'une association', 'la communauté', 'des régions', 'les générations',
      ],
    },
    pronominalUse: {
      infinitive: 's’unir',
      type: 'reciproque',
      pronounFunction: 'sans_fonction',
      agreementRule: 'avec_sujet',
      allowedPersons: [7, 8, 9],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9U0109',
  },
  {
    infinitive: 'reproduire',
    definition: 'Faire une copie d’une image, d’un texte, d’un objet ou d’un son.',
    cefr: 'B1',
    schoolLevels: ['9H'],
    semanticDomain: 'creation-travail',
    sense: {
      title: 'Faire une copie',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-copie',
      complements: [
        'une image', 'la photographie', 'des dessins', 'une œuvre', 'le document',
        'les sons', 'une expérience', 'la forme', 'des textes', 'les couleurs',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9R1962',
  },
  {
    infinitive: 'griller',
    definition: 'Faire cuire un aliment directement sous une forte chaleur.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'transformation',
    sense: {
      title: 'Faire cuire sous une forte chaleur',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'aliment-grille',
      complements: [
        'une tranche de pain', 'la courgette', 'des légumes', 'une tomate', 'le fromage',
        'les poivrons', 'une tartine', 'la brioche', 'des champignons', 'les aubergines',
      ],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9G1500',
  },
  {
    infinitive: 'accélérer',
    definition: 'Faire aller plus vite une personne, une chose ou une action.',
    cefr: 'A2',
    schoolLevels: ['8H'],
    semanticDomain: 'mouvement',
    sense: {
      title: 'Faire aller plus vite',
      transitivity: 'transitif_direct',
      construction: 'N0 V N1',
      complementType: 'cod',
      semanticClass: 'element-accelere',
      complements: [
        'une voiture', 'la production', 'des opérations', 'une machine', 'le rythme',
        'les travaux', 'une livraison', 'la procédure', 'des recherches', 'les changements',
      ],
    },
    pronominalUse: {
      infinitive: 's’accélérer',
      type: 'subjectif',
      pronounFunction: 'sans_fonction',
      agreementRule: 'avec_sujet',
      allowedPersons: [6, 9],
    },
    sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9A0226',
  },
];

new Map(
  verbPilot202601Part05.map(entry => [entry.infinitive, entry]),
);

const CEFR_LEVELS = new Set(['A1', 'A2', 'B1', 'B2']);
const SEMANTIC_DOMAINS = new Set([
  'etat-existence', 'mouvement', 'position', 'transformation', 'manipulation', 'corps',
  'perception', 'cognition', 'communication', 'emotion', 'modalite', 'relations',
  'echange', 'creation-travail', 'nature', 'action-processus',
]);
const TRANSITIVITY = new Set(['intransitif', 'transitif_direct', 'transitif_indirect']);
const DIFFICULT_DEFINITION_WORDS = /\b(absorber|acquérir|effectuer|éprouver|percevoir|susceptible)\b/iu;
const UNSUITABLE_CONTENT = /\b(alcool|drogue|pornograph|sexe|suicide|tuer|vulgaire)\b/iu;
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
]);

function anteposedText(text, gender, number) {
  if (number === 'pluriel') return text.replace(/^(?:des|ses|les)\s+/iu, 'les ')
  const noun = text.match(/^(?:une?|du|de la|le|la|ce|cet|cette|ma|ta|sa|son)\s+(.+)$/iu)?.[1]
    || text.match(/^(?:de\s+)?l[’'](.+)$/iu)?.[1]
    || text;
  const initial = noun.normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0).toLowerCase();
  if ('aeiouy'.includes(initial)) return `l’${noun}`
  return `${gender === 'feminin' ? 'la' : 'le'} ${noun}`
}

function validatedComplementGrammar(text) {
  const normalized = text.trim();
  const plural = /^(?:des|les|ses)\s+/iu.test(normalized);
  let gender = EXPLICIT_COMPLEMENT_GENDERS.get(normalized.toLocaleLowerCase('fr'));
  if (!gender) {
    if (/^(?:une|la|sa|ma|ta|cette|de la)\s+/iu.test(normalized)) gender = 'feminin';
    else if (/^(?:un|le|du|ce|cet)\s+/iu.test(normalized)) gender = 'masculin';
  }
  if (!gender) return null
  const number = plural ? 'pluriel' : 'singulier';
  return {
    text: anteposedText(normalized, gender, number),
    gender,
    number,
  }
}

function duplicateValues(values) {
  const seen = new Set();
  return [...new Set(values.filter(value => {
    const normalized = value.toLocaleLowerCase('fr').normalize('NFC').trim();
    if (seen.has(normalized)) return true
    seen.add(normalized);
    return false
  }))]
}

function validatePedagogicalPilot(entries, expectedInfinitives) {
  const errors = [];
  const infinitives = entries.map(entry => entry.infinitive);
  const duplicates = duplicateValues(infinitives);
  if (duplicates.length) errors.push(`Infinitifs en double : ${duplicates.join(', ')}`);
  if (entries.length !== expectedInfinitives.length) {
    errors.push(`${entries.length} entrées au lieu de ${expectedInfinitives.length}`);
  }
  if (infinitives.join('|') !== expectedInfinitives.join('|')) {
    errors.push('Le sous-lot pédagogique ne correspond pas aux premiers candidats, dans le même ordre.');
  }

  for (const entry of entries) {
    const prefix = entry.infinitive || '(infinitif absent)';
    if (entry.infinitive !== entry.infinitive?.normalize('NFC')) {
      errors.push(`${prefix} : infinitif non normalisé en NFC`);
    }
    if (!entry.definition || entry.definition.length > 180
      || !/^[A-ZÀÂÇÉÈÊËÎÏÔÙÛÜŒ]/u.test(entry.definition)
      || !/[.!?]$/u.test(entry.definition)) {
      errors.push(`${prefix} : définition FALC invalide`);
    }
    if (DIFFICULT_DEFINITION_WORDS.test(entry.definition)) {
      errors.push(`${prefix} : définition inutilement difficile`);
    }
    if (UNSUITABLE_CONTENT.test(entry.definition)) {
      errors.push(`${prefix} : définition potentiellement inadaptée`);
    }
    if (!CEFR_LEVELS.has(entry.cefr)) errors.push(`${prefix} : niveau CECRL invalide`);
    if (!Array.isArray(entry.schoolLevels) || !entry.schoolLevels.length) {
      errors.push(`${prefix} : niveau scolaire absent`);
    }
    if (!SEMANTIC_DOMAINS.has(entry.semanticDomain)) {
      errors.push(`${prefix} : domaine sémantique invalide`);
    }
    if (!/^https:\/\/www\.dictionnaire-academie\.fr\/article\/[A-Z]\d[A-Z]\d+$/u.test(entry.sourceUrl)) {
      errors.push(`${prefix} : source Académie invalide`);
    }

    const sense = entry.sense || {};
    if (!sense.title || !sense.construction || !TRANSITIVITY.has(sense.transitivity)) {
      errors.push(`${prefix} : sens principal incomplet`);
    }
    const complements = sense.complements || [];
    const complementDuplicates = duplicateValues(complements);
    if (complementDuplicates.length) errors.push(`${prefix} : compléments en double`);
    if (complements.some(complement => (
      !complement.trim()
      || /[.!?]$/u.test(complement)
      || UNSUITABLE_CONTENT.test(complement)
    ))) {
      errors.push(`${prefix} : complément vide, ponctué ou inadapté`);
    }
    if (sense.complementType === 'cod') {
      if (sense.transitivity !== 'transitif_direct' || sense.preposition) {
        errors.push(`${prefix} : construction COD incohérente`);
      }
      if (complements.length !== 10) errors.push(`${prefix} : un COD validé exige 10 compléments`);
      const grammar = complements.map(validatedComplementGrammar);
      if (grammar.some(value => !value)) {
        errors.push(`${prefix} : métadonnées grammaticales COD incomplètes`);
      }
      const masculineSingular = grammar.filter(value => (
        value?.gender === 'masculin' && value.number === 'singulier'
      )).length;
      if (masculineSingular > 2) {
        errors.push(`${prefix} : trop de COD masculins singuliers`);
      }
    }
    else if (sense.complementType === 'coi') {
      if (sense.transitivity !== 'transitif_indirect' || !['à', 'de'].includes(sense.preposition)) {
        errors.push(`${prefix} : construction COI incohérente`);
      }
      if (complements.length !== 10) errors.push(`${prefix} : un COI validé exige 10 compléments`);
      const expectedStarts = sense.preposition === 'à'
        ? /^(?:à |au |aux )/u
        : /^(?:de |du |des |d[’'])/u;
      if (complements.some(complement => !expectedStarts.test(complement))) {
        errors.push(`${prefix} : préposition manquante dans un COI`);
      }
    }
    else if (sense.complementType !== null || complements.length) {
      errors.push(`${prefix} : compléments présents sans construction activable`);
    }

    if (entry.pronominalUse) {
      const use = entry.pronominalUse;
      if (!use.infinitive.startsWith('se ') && !use.infinitive.startsWith('s’')) {
        errors.push(`${prefix} : infinitif pronominal invalide`);
      }
      if (!Array.isArray(use.allowedPersons) || !use.allowedPersons.length
        || use.allowedPersons.some(person => ![4, 5, 6, 7, 8, 9].includes(person))) {
        errors.push(`${prefix} : personnes pronominales invalides`);
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

function renderReport$1(result, entries, { title, priorityOffset }) {
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
  ];
  return `${lines.join('\n')}\n`
}

async function runPedagogicalValidation({
  candidatePath,
  outputPath,
  jsonOutputPath,
  entries = verbPilot202601,
  candidateOffset = 0,
  lot = 'verbs-frequency-pilot-2026-01-part-01',
  title = 'Validation pédagogique du premier sous-lot',
}) {
  const source = JSON.parse(await readFile$1(candidatePath, 'utf8'));
  const expected = source.candidates
    .slice(candidateOffset, candidateOffset + entries.length)
    .map(candidate => candidate.lemma);
  const result = validatePedagogicalPilot(entries, expected);
  const json = {
    generatedAt: new Date().toISOString(),
    lot,
    ...result,
    entries,
  };
  await mkdir(dirname$1(outputPath), { recursive: true });
  await writeFile$1(outputPath, renderReport$1(result, entries, {
    title,
    priorityOffset: candidateOffset,
  }), 'utf8');
  await mkdir(dirname$1(jsonOutputPath), { recursive: true });
  await writeFile$1(jsonOutputPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  if (result.errors.length) throw new Error(result.errors.join('\n'))
  return json
}

async function main() {
  const candidatePath = resolve$1('reports/missing-french-verbs-morphalou.json');
  const batches = [
    {
      entries: verbPilot202601,
      candidateOffset: 0,
      lot: 'verbs-frequency-pilot-2026-01-part-01',
      title: 'Validation pédagogique du premier sous-lot',
      outputPath: resolve$1('reports/verb-pilot-pedagogy-part-01.md'),
      jsonOutputPath: resolve$1('reports/verb-pilot-pedagogy-part-01.json'),
    },
    {
      entries: verbPilot202601Part02,
      candidateOffset: 20,
      lot: 'verbs-frequency-pilot-2026-01-part-02',
      title: 'Validation pédagogique du deuxième sous-lot',
      outputPath: resolve$1('reports/verb-pilot-pedagogy-part-02.md'),
      jsonOutputPath: resolve$1('reports/verb-pilot-pedagogy-part-02.json'),
    },
    {
      entries: verbPilot202601Part03,
      candidateOffset: 40,
      lot: 'verbs-frequency-pilot-2026-01-part-03',
      title: 'Validation pédagogique du troisième sous-lot',
      outputPath: resolve$1('reports/verb-pilot-pedagogy-part-03.md'),
      jsonOutputPath: resolve$1('reports/verb-pilot-pedagogy-part-03.json'),
    },
    {
      entries: verbPilot202601Part04,
      candidateOffset: 60,
      lot: 'verbs-frequency-pilot-2026-01-part-04',
      title: 'Validation pédagogique du quatrième sous-lot',
      outputPath: resolve$1('reports/verb-pilot-pedagogy-part-04.md'),
      jsonOutputPath: resolve$1('reports/verb-pilot-pedagogy-part-04.json'),
    },
    {
      entries: verbPilot202601Part05,
      candidateOffset: 80,
      lot: 'verbs-frequency-pilot-2026-01-part-05',
      title: 'Validation pédagogique du cinquième sous-lot',
      outputPath: resolve$1('reports/verb-pilot-pedagogy-part-05.md'),
      jsonOutputPath: resolve$1('reports/verb-pilot-pedagogy-part-05.json'),
    },
  ];
  for (const batch of batches) {
    const result = await runPedagogicalValidation({ candidatePath, ...batch });
    console.log(
      `${batch.lot} : ${result.entryCount} verbes, ${result.definitionCount} définitions, `
      + `${result.complementCount} compléments et ${result.pronominalUseCount} emplois pronominaux validés.`,
    );
    console.log(`Rapports : ${batch.outputPath} et ${batch.jsonOutputPath}`);
  }
}

if (globalThis._importMeta_.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

const PERSON = {
  'singular|firstPerson': 4,
  'singular|secondPerson': 5,
  'singular|thirdPerson': 6,
  'plural|firstPerson': 7,
  'plural|secondPerson': 8,
  'plural|thirdPerson': 9,
};
const SIMPLE_TENSES = [
  [1, 'indicative', 'present'],
  [2, 'indicative', 'imperfect'],
  [3, 'indicative', 'future'],
  [4, 'indicative', 'simplePast'],
  [9, 'imperative', 'present'],
  [10, 'subjunctive', 'present'],
  [14, 'conditional', 'present'],
  [16, 'subjunctive', 'imperfect'],
];
const COMPOUND_TENSES = new Map([
  [5, 1],
  [6, 3],
  [7, 2],
  [8, 4],
  [11, 10],
  [15, 14],
  [17, 16],
  [18, 9],
  [19, 16],
]);
const IMPERATIVE_PERSONS = new Map([
  [5, ['singular', 'secondPerson']],
  [7, ['plural', 'firstPerson']],
  [8, ['plural', 'secondPerson']],
]);
const PEDAGOGICAL_ENTRIES = [
  ...verbPilot202601,
  ...verbPilot202601Part02,
  ...verbPilot202601Part03,
  ...verbPilot202601Part04,
  ...verbPilot202601Part05,
];
const PEDAGOGY_BY_INFINITIVE = new Map(
  PEDAGOGICAL_ENTRIES.map(entry => [entry.infinitive, entry]),
);
const PILOT_SOURCE = 'pilot-2026-01';
const BACKUP_TABLES = {
  verbs: 'backup_verbes_vfp202601',
  conjugations: 'backup_verbesconjugues_vfp202601',
};

function option(name, fallback = '') {
  const prefix = `--${name}=`;
  return process.argv.find(argument => argument.startsWith(prefix))?.slice(prefix.length) || fallback
}

function values(candidate, key) {
  return (candidate.forms[key] || []).slice(0, 3)
}

function personMorphology(personId) {
  return Object.entries(PERSON).find(([, id]) => id === personId)?.[0].split('|') || []
}

function simpleForms(candidate, mode, tense, personId) {
  let number;
  let person;
  if (mode === 'imperative') {
    [number, person] = IMPERATIVE_PERSONS.get(personId) || [];
    if (!number) return []
  }
  else {
    [number, person] = personMorphology(personId);
  }
  return values(candidate, `${mode}|${tense}|${number}|${person}|-`)
}

function pastParticiples(candidate, personId) {
  const [number] = personMorphology(personId);
  return values(candidate, `participle|past|${number}|-|masculine`)
}

function databaseConfig() {
  const config = {
    host: process.env.DB_HOST || process.env.NUXT_DB_HOST,
    port: Number(process.env.DB_PORT || process.env.NUXT_DB_PORT || 3306),
    database: process.env.DB_NAME || process.env.NUXT_DB_NAME,
    user: process.env.DB_USER || process.env.NUXT_DB_USER,
    password: process.env.DB_PASSWORD || process.env.NUXT_DB_PASSWORD,
  };
  if (!config.host || !config.database || !config.user) {
    throw new Error(
      'Configuration MySQL absente (DB_* ou NUXT_DB_*). '
      + 'Dans Plesk, ne lancez pas cette commande avec « Run script » : '
      + 'redémarrez l’application, le plugin serveur appliquera le lot avec la configuration Nitro.',
    )
  }
  return config
}

function json(value) {
  if (value === null || value === undefined) return null
  return typeof value === 'string' ? value : JSON.stringify(value)
}

function group(candidate) {
  const match = candidate.groupDescription?.match(/^(\d)/u);
  return Number(match?.[1] || (candidate.lemma.endsWith('er') ? 1 : 3))
}

function fallbackModel(candidate) {
  if (candidate.model) return candidate.model.toLocaleLowerCase('fr')
  if (candidate.family.includes('voir')) return 'voir'
  if (candidate.family.includes('dre')) return 'attendre'
  if (group(candidate) === 1) return 'aimer'
  if (group(candidate) === 2) return 'finir'
  throw new Error(`Modèle absent pour « ${candidate.lemma} ».`)
}

function ending(lemma) {
  if (lemma.endsWith('oir')) return 'oir'
  if (lemma.endsWith('er')) return 'er'
  if (lemma.endsWith('ir')) return 'ir'
  if (lemma.endsWith('re')) return 're'
  return 'autre'
}

function difficulty(candidate) {
  if (candidate.difficulty === 'faible') return 1
  if (candidate.difficulty === 'moyenne') return 2
  return 3
}

async function modelRows(connection, candidates) {
  const names = [...new Set(candidates.map(fallbackModel))];
  const placeholders = names.map(() => '?').join(', ');
  const [rows] = await connection.execute(
    `SELECT * FROM verbes WHERE LOWER(infinitif) IN (${placeholders}) ORDER BY id`,
    names,
  );
  const byName = new Map(rows.map(row => [row.infinitif.toLocaleLowerCase('fr'), row]));
  const missing = names.filter(name => !byName.has(name));
  if (missing.length) throw new Error(`Modèles absents : ${missing.join(', ')}.`)
  return byName
}

async function auxiliaryForms(connection) {
  const [rows] = await connection.execute(`
    SELECT v.infinitif, vc.personne_id, vc.temp_id,
           vc.conjugaison1, vc.conjugaison2, vc.conjugaison3
    FROM verbes v
    INNER JOIN verbesconjugues vc ON vc.verbe_id=v.id
    WHERE v.infinitif IN ('avoir', 'être')
  `);
  return new Map(rows.map(row => [
    `${row.infinitif}|${row.temp_id}|${row.personne_id}`,
    [row.conjugaison1, row.conjugaison2, row.conjugaison3].filter(Boolean),
  ]))
}

function compoundForms(candidate, auxiliaryBySlot, targetTense, personId) {
  const sourceTense = COMPOUND_TENSES.get(targetTense);
  const auxiliary = candidate.auxiliary || 'avoir';
  if (!['avoir', 'être'].includes(auxiliary)) {
    throw new Error(`Auxiliaire non univoque pour « ${candidate.lemma} » : ${auxiliary}.`)
  }
  const auxiliaries = auxiliaryBySlot.get(`${auxiliary}|${sourceTense}|${personId}`) || [];
  if (!auxiliaries.length) return []
  const participles = auxiliary === 'être'
    ? pastParticiples(candidate, personId)
    : values(candidate, 'participle|past|singular|-|masculine');
  return [...new Set(auxiliaries.flatMap(aux => participles.map(participle => `${aux} ${participle}`)))].slice(0, 3)
}

async function insertCandidate(
  connection,
  candidate,
  model,
  auxiliaryBySlot,
  tables,
  pedagogy,
  frequencyRank,
) {
  const presentParticiple = values(candidate, 'participle|present|-|-|-')[0];
  const pastParticiple = values(candidate, 'participle|past|singular|-|masculine')[0];
  if (!presentParticiple || !pastParticiple) {
    throw new Error(`Participes incomplets pour « ${candidate.lemma} ».`)
  }
  const [result] = await connection.execute(`
    INSERT INTO ${tables.verbs} (
      infinitif, \`participe_présent\`, \`participe_passé\`, auxiliaire,
      groupe_conjugaison, famille_conjugaison_id, terminaison_infinitif,
      type_pronominal, est_impersonnel, est_defectif, personnes_disponibles,
      type_h_initial, niveau_difficulte, niveau_cecrl, rang_frequence,
      registre_principal, forme_canonique, statut_validation, particularites,
      niveaux_scolaires, parcours_cif, pronominalisable, est_archive
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'aucun', 0, 0, ?, ?, ?, ?, ?,
              'courant', ?, ?, ?, ?, ?, ?, 0)
  `, [
    candidate.lemma,
    presentParticiple,
    pastParticiple,
    candidate.auxiliary || 'avoir',
    group(candidate),
    model.famille_conjugaison_id,
    ending(candidate.lemma),
    json([4, 5, 6, 7, 8, 9]),
    model.type_h_initial,
    difficulty(candidate),
    pedagogy?.cefr || null,
    frequencyRank,
    candidate.lemma,
    pedagogy ? 'valide' : 'a_verifier',
    json([
      'source:lexique4',
      'formes:morphalou-3.1',
      'validation:academie-9e',
      ...(pedagogy ? [`pedagogie:${PILOT_SOURCE}`] : []),
    ]),
    json(pedagogy?.schoolLevels || []),
    json([]),
    pedagogy?.pronominalUse ? 1 : 0,
  ]);
  const verbId = Number(result.insertId);
  let insertedForms = 0;
  for (const [tempId, mode, tense] of SIMPLE_TENSES) {
    for (const personId of Object.values(PERSON)) {
      const forms = simpleForms(candidate, mode, tense, personId);
      await connection.execute(`
        INSERT INTO ${tables.conjugations}
          (verbe_id, verbe_infinitif, personne_id, temp_id, conjugaison1, conjugaison2, conjugaison3)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [verbId, candidate.lemma, personId, tempId, forms[0] || '', forms[1] || '', forms[2] || '']);
      insertedForms += 1;
    }
  }
  for (const tempId of COMPOUND_TENSES.keys()) {
    for (const personId of Object.values(PERSON)) {
      const forms = compoundForms(candidate, auxiliaryBySlot, tempId, personId);
      await connection.execute(`
        INSERT INTO ${tables.conjugations}
          (verbe_id, verbe_infinitif, personne_id, temp_id, conjugaison1, conjugaison2, conjugaison3)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [verbId, candidate.lemma, personId, tempId, forms[0] || '', forms[1] || '', forms[2] || '']);
      insertedForms += 1;
    }
  }
  if (insertedForms !== 102) {
    throw new Error(`Nombre de lignes inattendu pour « ${candidate.lemma} » : ${insertedForms}.`)
  }
  return { insertedForms, verbId }
}

async function insertPedagogy(connection, tables, verbId, candidate, pedagogy) {
  const [senseResult] = await connection.execute(`
    INSERT INTO ${tables.senses}
      (verbe_id, numero_sens, intitule, definition, construction, transitivite,
       preposition, auxiliaire, registre, est_pronominal, est_principal, source, sort_order)
    VALUES (?, 1, ?, ?, ?, ?, ?, ?, 'courant', 0, 1, 'pilot-2026-01', 1)
  `, [
    verbId,
    pedagogy.sense.title,
    pedagogy.definition,
    pedagogy.sense.construction,
    pedagogy.sense.transitivity,
    pedagogy.sense.preposition || null,
    candidate.auxiliary || 'avoir',
  ]);
  const senseId = Number(senseResult.insertId);
  const [categoryResult] = await connection.execute(`
    INSERT INTO ${tables.senseCategories} (sens_id, categorie_id)
    SELECT ?, id FROM categories_semantiques WHERE slug=?
  `, [senseId, pedagogy.semanticDomain]);
  if (Number(categoryResult.affectedRows) !== 1) {
    throw new Error(
      `Catégorie sémantique introuvable pour « ${pedagogy.infinitive} » : `
      + `${pedagogy.semanticDomain}.`,
    )
  }
  if (!pedagogy.sense.complementType) {
    return {
      senses: 1,
      categoryLinks: 1,
      constructions: 0,
      complements: 0,
      anteposable: 0,
    }
  }
  const code = `${pedagogy.sense.complementType}-postpose`;
  const [constructionResult] = await connection.execute(`
    INSERT INTO ${tables.constructions}
      (sens_id, code, fonction_objet, preposition, patron, complement_obligatoire,
       source, source_url, statut_validation, actif)
    VALUES (?, ?, ?, ?, ?, 0, 'pilot-2026-01', ?, 'valide', 1)
  `, [
    senseId,
    code,
    pedagogy.sense.complementType,
    pedagogy.sense.preposition || null,
    pedagogy.sense.construction,
    pedagogy.sourceUrl,
  ]);
  const constructionId = Number(constructionResult.insertId);
  for (const complement of pedagogy.sense.complements) {
    const grammar = pedagogy.sense.complementType === 'cod'
      ? validatedComplementGrammar(complement)
      : null;
    await connection.execute(`
      INSERT INTO ${tables.complements}
        (construction_id, texte, texte_antepose, genre, nombre,
         classe_semantique, niveau_cecrl, poids,
         source, source_url, statut_validation, actif)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'pilot-2026-01', ?, 'valide', 1)
    `, [
      constructionId,
      complement,
      grammar?.text || null,
      grammar?.gender || null,
      grammar?.number || null,
      pedagogy.sense.semanticClass,
      pedagogy.cefr,
      pedagogy.sourceUrl,
    ]);
  }
  return {
    senses: 1,
    categoryLinks: 1,
    constructions: 1,
    complements: pedagogy.sense.complements.length,
    anteposable: pedagogy.sense.complementType === 'cod'
      ? pedagogy.sense.complements.length
      : 0,
  }
}

async function addMissingPilotCategoryLinks(connection) {
  await connection.beginTransaction();
  try {
    let inserted = 0;
    for (const pedagogy of PEDAGOGICAL_ENTRIES) {
      const [result] = await connection.execute(`
        INSERT IGNORE INTO verbe_sens_categories (sens_id, categorie_id)
        SELECT s.id, c.id
        FROM verbe_sens s
        INNER JOIN verbes v ON v.id=s.verbe_id
        INNER JOIN categories_semantiques c ON c.slug=?
        WHERE v.infinitif=? AND s.source=?
      `, [pedagogy.semanticDomain, pedagogy.infinitive, PILOT_SOURCE]);
      inserted += Number(result.affectedRows);
    }
    await connection.commit();
    return inserted
  }
  catch (error) {
    await connection.rollback();
    throw error
  }
}

async function insertPronominalUse(connection, table, verbId, pedagogy) {
  const use = pedagogy.pronominalUse;
  if (!use) return 0
  await connection.execute(`
    INSERT INTO ${table}
      (verbe_id, legacy_verbe_id, infinitif_pronominal, type_emploi,
       fonction_pronom, regle_accord, preposition, personnes_autorisees,
       source, source_url, statut_validation, actif)
    VALUES (?, NULL, ?, ?, ?, ?, NULL, ?, ?, ?, 'valide', 1)
  `, [
    verbId,
    use.infinitive.replaceAll('’', "'"),
    use.type,
    use.pronounFunction,
    use.agreementRule === 'sans_accord' ? 'invariable' : use.agreementRule,
    json(use.allowedPersons),
    PILOT_SOURCE,
    pedagogy.sourceUrl,
  ]);
  return 1
}

async function tableExists(connection, tableName) {
  const [rows] = await connection.execute(`
    SELECT COUNT(*) AS count
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=?
  `, [tableName]);
  return Number(rows[0]?.count || 0) === 1
}

async function createMyisamBackups(connection) {
  for (const backup of Object.values(BACKUP_TABLES)) {
    if (await tableExists(connection, backup)) {
      throw new Error(
        `La sauvegarde ${backup} existe déjà. Contrôlez l’état du lot avant toute application.`,
      )
    }
  }
  await connection.query(`CREATE TABLE ${BACKUP_TABLES.verbs} LIKE verbes`);
  await connection.query(`INSERT INTO ${BACKUP_TABLES.verbs} SELECT * FROM verbes`);
  await connection.query(
    `CREATE TABLE ${BACKUP_TABLES.conjugations} LIKE verbesconjugues`,
  );
  await connection.query(
    `INSERT INTO ${BACKUP_TABLES.conjugations} SELECT * FROM verbesconjugues`,
  );
}

async function restoreMyisamBackups(connection) {
  if (!await tableExists(connection, BACKUP_TABLES.verbs)
    || !await tableExists(connection, BACKUP_TABLES.conjugations)) {
    throw new Error('Sauvegardes MyISAM incomplètes : restauration automatique impossible.')
  }
  const suffix = Date.now();
  await connection.query(`
    RENAME TABLE
      verbes TO failed_verbes_vfp202601_${suffix},
      ${BACKUP_TABLES.verbs} TO verbes,
      verbesconjugues TO failed_verbesconjugues_vfp202601_${suffix},
      ${BACKUP_TABLES.conjugations} TO verbesconjugues
  `);
}

async function removePilotPedagogy(connection) {
  await connection.beginTransaction();
  try {
    await connection.execute(
      `DELETE FROM emplois_pronominaux WHERE source=?`,
      [PILOT_SOURCE],
    );
    await connection.execute(`
      DELETE cv
      FROM complements_verbaux cv
      INNER JOIN constructions_verbales c ON c.id=cv.construction_id
      WHERE c.source=?
    `, [PILOT_SOURCE]);
    await connection.execute(
      `DELETE FROM constructions_verbales WHERE source=?`,
      [PILOT_SOURCE],
    );
    await connection.execute(
      `DELETE FROM verbe_sens WHERE source=?`,
      [PILOT_SOURCE],
    );
    await connection.commit();
  }
  catch (error) {
    await connection.rollback();
    throw error
  }
}

function renderReport(
  inputName,
  candidates,
  formCount,
  mode,
  pedagogyCounts,
  { applied = false, alreadyApplied = false, repaired = false } = {},
) {
  const title = applied ? 'Application du lot pilote' : 'Simulation d’import du lot pilote';
  const persistence = applied
    ? (repaired
        ? 'liens sémantiques manquants ajoutés ; aucune duplication du lot'
        : alreadyApplied
        ? 'lot déjà présent et contrôlé ; aucune nouvelle écriture'
        : 'lot appliqué ; sauvegardes MyISAM conservées')
    : 'aucune';
  return `# ${title}

Rapport généré le ${new Intl.DateTimeFormat('fr-CH', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())}.

## Résultat technique

- mode : ${mode} ;
- verbes préparés : ${candidates.length} ;
- lignes de conjugaison préparées : ${formCount.toLocaleString('fr-CH')} ;
- fiches pédagogiques complètes : ${pedagogyCounts.senses} ;
- liens vers les catégories sémantiques : ${pedagogyCounts.categoryLinks} ;
- constructions avec compléments : ${pedagogyCounts.constructions} ;
- compléments pédagogiques préparés : ${pedagogyCounts.complements} ;
- COD avec genre, nombre et forme antéposée : ${pedagogyCounts.anteposable} ;
- emplois pronominaux validés : ${pedagogyCounts.pronominalUses} ;
- doublons détectés : 0 ;
- écriture conservée dans MySQL : ${persistence}.

## Sécurité

${applied
    ? `Les tables MyISAM antérieures sont conservées sous les noms \`${BACKUP_TABLES.verbs}\` et \`${BACKUP_TABLES.conjugations}\`. La commande de restauration peut remettre ces tables en service.`
    : alreadyApplied
      ? 'Le contrôle relit le lot déjà appliqué sans écrire dans les tables permanentes.'
      : 'La simulation utilise des tables temporaires et ne modifie aucune table permanente.'}

## Traçabilité

- lot : \`verbs-frequency-pilot-2026-01\` ;
- données préparées : \`${inputName}\`.
`
}

function expectedPedagogyCounts() {
  return {
    senses: PEDAGOGICAL_ENTRIES.length,
    categoryLinks: PEDAGOGICAL_ENTRIES.length,
    constructions: PEDAGOGICAL_ENTRIES
      .filter(entry => entry.sense.complementType).length,
    complements: PEDAGOGICAL_ENTRIES
      .reduce((total, entry) => total + entry.sense.complements.length, 0),
    anteposable: PEDAGOGICAL_ENTRIES
      .filter(entry => entry.sense.complementType === 'cod')
      .reduce((total, entry) => total + entry.sense.complements.length, 0),
    pronominalUses: PEDAGOGICAL_ENTRIES.filter(entry => entry.pronominalUse).length,
  }
}

async function inspectAppliedState(connection, infinitives) {
  const placeholders = infinitives.map(() => '?').join(', ');
  const [verbs] = await connection.execute(`
    SELECT id, infinitif, est_archive, statut_validation
    FROM verbes
    WHERE infinitif IN (${placeholders})
  `, infinitives);
  if (!verbs.length) return { state: 'absent' }
  if (verbs.length !== infinitives.length) {
    return { state: 'partial', verbCount: verbs.length }
  }
  const ids = verbs.map(row => Number(row.id));
  const idPlaceholders = ids.map(() => '?').join(', ');
  const [
    [forms],
    [senses],
    [categoryLinks],
    [constructions],
    [complements],
    [pronominals],
  ] = await Promise.all([
    connection.execute(
      `SELECT COUNT(*) AS count FROM verbesconjugues WHERE verbe_id IN (${idPlaceholders})`,
      ids,
    ),
    connection.execute(
      `SELECT COUNT(*) AS count FROM verbe_sens WHERE verbe_id IN (${idPlaceholders}) AND source=?`,
      [...ids, PILOT_SOURCE],
    ),
    connection.execute(`
      SELECT COUNT(*) AS count
      FROM verbe_sens_categories vsc
      INNER JOIN verbe_sens s ON s.id=vsc.sens_id
      WHERE s.verbe_id IN (${idPlaceholders}) AND s.source=?
    `, [...ids, PILOT_SOURCE]),
    connection.execute(`
      SELECT COUNT(*) AS count
      FROM constructions_verbales c
      INNER JOIN verbe_sens s ON s.id=c.sens_id
      WHERE s.verbe_id IN (${idPlaceholders}) AND c.source=?
    `, [...ids, PILOT_SOURCE]),
    connection.execute(`
      SELECT COUNT(*) AS count
      FROM complements_verbaux cv
      INNER JOIN constructions_verbales c ON c.id=cv.construction_id
      INNER JOIN verbe_sens s ON s.id=c.sens_id
      WHERE s.verbe_id IN (${idPlaceholders}) AND cv.source=?
    `, [...ids, PILOT_SOURCE]),
    connection.execute(
      `SELECT COUNT(*) AS count FROM emplois_pronominaux WHERE verbe_id IN (${idPlaceholders}) AND source=?`,
      [...ids, PILOT_SOURCE],
    ),
  ]);
  const expected = expectedPedagogyCounts();
  const counts = {
    verbs: verbs.length,
    forms: Number(forms[0].count),
    senses: Number(senses[0].count),
    categoryLinks: Number(categoryLinks[0].count),
    constructions: Number(constructions[0].count),
    complements: Number(complements[0].count),
    pronominalUses: Number(pronominals[0].count),
  };
  const complete = counts.forms === infinitives.length * 102
    && counts.senses === expected.senses
    && counts.categoryLinks === expected.categoryLinks
    && counts.constructions === expected.constructions
    && counts.complements === expected.complements
    && counts.pronominalUses === expected.pronominalUses
    && verbs.every(row => !Number(row.est_archive) && row.statut_validation === 'valide');
  const repairable = !complete
    && counts.forms === infinitives.length * 102
    && counts.senses === expected.senses
    && counts.categoryLinks < expected.categoryLinks
    && counts.constructions === expected.constructions
    && counts.complements === expected.complements
    && counts.pronominalUses === expected.pronominalUses
    && verbs.every(row => !Number(row.est_archive) && row.statut_validation === 'valide');
  return { state: complete ? 'complete' : repairable ? 'repairable' : 'partial', counts }
}

async function restorePilot(connection) {
  await restoreMyisamBackups(connection);
  await removePilotPedagogy(connection);
}

async function runVerbPilotImport(options = {}) {
  const apply = options.apply ?? process.argv.includes('--apply');
  const restore = options.restore ?? process.argv.includes('--restore');
  const config = options.databaseConfig || databaseConfig();
  const writeReports = options.writeReports ?? true;
  if (apply && restore) throw new Error('Choisissez soit --apply, soit --restore.')
  if (restore) {
    const connection = await mysql.createConnection(config);
    try {
      await restorePilot(connection);
      console.log(
        'Restauration réussie : les tables MyISAM antérieures sont de nouveau actives '
        + 'et les données pédagogiques du lot ont été retirées.',
      );
    }
    finally {
      await connection.end();
    }
    return { restored: true }
  }
  const inputPath = resolve$1(
    options.inputPath
      || option('input', 'reports/missing-french-verbs-morphalou.json'),
  );
  const outputPath = resolve$1(
    options.outputPath
      || option(
        'output',
        apply ? 'reports/verb-pilot-import-apply.md' : 'reports/verb-pilot-import-check.md',
      ),
  );
  const source = JSON.parse(await readFile$1(inputPath, 'utf8'));
  if (source.readyCount !== 100 || source.blocked?.length) {
    throw new Error('Le contrôle Morphalou ne valide pas exactement 100 candidats.')
  }
  const expectedPedagogicalInfinitives = source.candidates
    .slice(0, PEDAGOGICAL_ENTRIES.length)
    .map(candidate => candidate.lemma);
  const pedagogyValidation = validatePedagogicalPilot(
    PEDAGOGICAL_ENTRIES,
    expectedPedagogicalInfinitives,
  );
  if (pedagogyValidation.errors.length) {
    throw new Error(`Sous-lot pédagogique invalide : ${pedagogyValidation.errors.join(' ; ')}`)
  }
  const connection = await mysql.createConnection(config);
  let preparedForms = 0;
  let mode = '';
  let backupCreated = false;
  let transactionStarted = false;
  let alreadyApplied = false;
  let repaired = false;
  const pedagogyCounts = {
    senses: 0,
    categoryLinks: 0,
    constructions: 0,
    complements: 0,
    anteposable: 0,
    pronominalUses: 0,
  };
  const infinitives = source.candidates.map(candidate => candidate.lemma);
  const placeholders = infinitives.map(() => '?').join(', ');
  try {
    const [engineRows] = await connection.execute(`
      SELECT TABLE_NAME, ENGINE
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA=DATABASE()
        AND TABLE_NAME IN (
          'verbes', 'verbesconjugues', 'verbe_sens',
          'verbe_sens_categories', 'categories_semantiques',
          'constructions_verbales', 'complements_verbaux', 'emplois_pronominaux'
        )
    `);
    if (engineRows.length !== 8) throw new Error('Une table requise par le lot est absente.')
    const transactional = engineRows.length === 8
      && engineRows.every(row => String(row.ENGINE).toLocaleUpperCase('en') === 'INNODB');
    const engines = new Map(engineRows.map(row => [row.TABLE_NAME, String(row.ENGINE).toUpperCase()]));
    if (!transactional && (
      engines.get('verbes') !== 'MYISAM'
      || engines.get('verbesconjugues') !== 'MYISAM'
      || [
        'verbe_sens', 'verbe_sens_categories', 'categories_semantiques',
        'constructions_verbales', 'complements_verbaux', 'emplois_pronominaux',
      ]
        .some(table => engines.get(table) !== 'INNODB')
    )) {
      throw new Error('Combinaison de moteurs non prise en charge pour une application sûre.')
    }

    const appliedState = await inspectAppliedState(connection, infinitives);
    if (appliedState.state === 'complete') {
      alreadyApplied = true;
      preparedForms = infinitives.length * 102;
      Object.assign(pedagogyCounts, expectedPedagogyCounts());
      mode = apply
        ? 'contrôle idempotent du lot déjà appliqué'
        : 'contrôle du lot déjà appliqué, sans nouvelle écriture';
    }
    else if (apply && appliedState.state === 'repairable') {
      const inserted = await addMissingPilotCategoryLinks(connection);
      const repairedState = await inspectAppliedState(connection, infinitives);
      if (repairedState.state !== 'complete') {
        throw new Error(
          `Réparation sémantique incomplète : ${JSON.stringify(repairedState.counts)}.`,
        )
      }
      alreadyApplied = true;
      repaired = true;
      preparedForms = infinitives.length * 102;
      Object.assign(pedagogyCounts, expectedPedagogyCounts());
      mode = `réparation idempotente de ${inserted} liens sémantiques`;
    }
    else if (appliedState.state !== 'absent') {
      throw new Error(
        `État partiel du lot détecté (${JSON.stringify(appliedState.counts || appliedState)}). `
        + 'Utilisez la restauration avant de réessayer.',
      )
    }

    if (!alreadyApplied) {
      const tables = apply
        ? {
          verbs: 'verbes',
          conjugations: 'verbesconjugues',
          senses: 'verbe_sens',
          senseCategories: 'verbe_sens_categories',
          constructions: 'constructions_verbales',
          complements: 'complements_verbaux',
          pronominals: 'emplois_pronominaux',
        }
        : {
          verbs: 'simulation_verbes',
          conjugations: 'simulation_verbesconjugues',
          senses: 'simulation_verbe_sens',
          senseCategories: 'simulation_verbe_sens_categories',
          constructions: 'simulation_constructions_verbales',
          complements: 'simulation_complements_verbaux',
          pronominals: 'simulation_emplois_pronominaux',
        };
      if (apply && !transactional) {
        await createMyisamBackups(connection);
        backupCreated = true;
        mode = 'application avec sauvegardes MyISAM et transaction pédagogique InnoDB';
      }
      else if (apply) {
        mode = 'transaction InnoDB';
      }
      else {
        await connection.query('CREATE TEMPORARY TABLE simulation_verbes LIKE verbes');
        await connection.query('CREATE TEMPORARY TABLE simulation_verbesconjugues LIKE verbesconjugues');
        await connection.query('CREATE TEMPORARY TABLE simulation_verbe_sens LIKE verbe_sens');
        await connection.query('CREATE TEMPORARY TABLE simulation_verbe_sens_categories LIKE verbe_sens_categories');
        await connection.query('CREATE TEMPORARY TABLE simulation_constructions_verbales LIKE constructions_verbales');
        await connection.query('CREATE TEMPORARY TABLE simulation_complements_verbaux LIKE complements_verbaux');
        await connection.query('CREATE TEMPORARY TABLE simulation_emplois_pronominaux LIKE emplois_pronominaux');
        await connection.query('INSERT INTO simulation_emplois_pronominaux SELECT * FROM emplois_pronominaux');
        mode = 'tables temporaires (tables permanentes non transactionnelles)';
      }

      await connection.beginTransaction();
      transactionStarted = true;
      const models = await modelRows(connection, source.candidates);
      const auxiliaries = await auxiliaryForms(connection);
      for (const [index, candidate] of source.candidates.entries()) {
        const pedagogy = PEDAGOGY_BY_INFINITIVE.get(candidate.lemma);
        const inserted = await insertCandidate(
          connection,
          candidate,
          models.get(fallbackModel(candidate)),
          auxiliaries,
          tables,
          pedagogy,
          index + 1,
        );
        preparedForms += inserted.insertedForms;
        if (pedagogy) {
          const insertedPedagogy = await insertPedagogy(
            connection,
            tables,
            inserted.verbId,
            candidate,
            pedagogy,
          );
          pedagogyCounts.senses += insertedPedagogy.senses;
          pedagogyCounts.categoryLinks += insertedPedagogy.categoryLinks;
          pedagogyCounts.constructions += insertedPedagogy.constructions;
          pedagogyCounts.complements += insertedPedagogy.complements;
          pedagogyCounts.anteposable += insertedPedagogy.anteposable;
          pedagogyCounts.pronominalUses += await insertPronominalUse(
            connection,
            tables.pronominals,
            inserted.verbId,
            pedagogy,
          );
        }
      }
      const [counts] = await connection.execute(
        `SELECT COUNT(*) AS count FROM ${tables.verbs} WHERE infinitif IN (${placeholders})`,
        infinitives,
      );
      const expected = expectedPedagogyCounts();
      if (Number(counts[0].count) !== 100
        || Object.entries(expected).some(([key, count]) => pedagogyCounts[key] !== count)) {
        throw new Error('Le contrôle structurel du lot pédagogique a échoué.')
      }
      if (apply) await connection.commit();
      else await connection.rollback();
      transactionStarted = false;
    }
  }
  catch (error) {
    if (transactionStarted) await connection.rollback();
    if (apply && backupCreated) {
      try {
        await restoreMyisamBackups(connection);
      }
      catch (restoreError) {
        throw new AggregateError(
          [error, restoreError],
          'Échec de l’application et de la restauration automatique.',
        )
      }
    }
    throw error
  }
  finally {
    await connection.end();
  }
  if (writeReports) {
    await mkdir(dirname$1(outputPath), { recursive: true });
    await writeFile$1(
      outputPath,
      renderReport(
        inputPath.split(/[\\/]/u).pop(),
        source.candidates,
        preparedForms,
        mode,
        pedagogyCounts,
        { applied: apply, alreadyApplied, repaired },
      ),
      'utf8',
    );
  }
  console.log(
    `${apply
      ? (repaired ? 'Réparation idempotente réussie' : alreadyApplied ? 'Contrôle idempotent réussi' : 'Application réussie')
      : 'Simulation réussie'} : `
    + `100 verbes et ${preparedForms} lignes préparés via ${mode}.`,
  );
  if (writeReports) console.log(`Rapport : ${outputPath}`);
  return {
    applied: apply,
    alreadyApplied,
    repaired,
    preparedForms,
    pedagogyCounts,
    mode,
  }
}

if (globalThis._importMeta_.url === `file://${process.argv[1]}`) {
  runVerbPilotImport().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

const _0T1W4DkA4XhxQ3mqRSifwqf7ZnOeJX9jNfES0b6RQ = defineNitroPlugin(async () => {
  const config = useRuntimeConfig();
  try {
    const result = await runVerbPilotImport({
      apply: true,
      writeReports: false,
      databaseConfig: {
        host: String(config.dbHost || ""),
        port: Number(config.dbPort || 3306),
        database: String(config.dbName || ""),
        user: String(config.dbUser || ""),
        password: String(config.dbPassword || "")
      }
    });
    console.info(
      `[database] Lot verbs-frequency-pilot-2026-01 disponible : ${result.preparedForms} conjugaisons contr\xF4l\xE9es` + (result.repaired ? ", liens s\xE9mantiques r\xE9par\xE9s." : result.alreadyApplied ? ", aucune nouvelle \xE9criture." : ", 100 verbes ajout\xE9s avec sauvegardes MyISAM.")
    );
  } catch (error) {
    console.error(
      "[database] \xC9chec de la migration automatique du lot verbs-frequency-pilot-2026-01.",
      error
    );
  }
});

const plugins = [
  _j6rhVa9vazQwWAo6ZokRIRcXkdzpBcvA9Sds0tqpZaM,
_Z45CxtDWqkkKjVCKLRFEp9iVHa4rBcfVi8IP4zGS48,
_tfOtJNAOlHYSBAoNhgJlF4qW4RlJtE_4zzODYwG3H8,
_aCMECTWiwhQ_cHUZU9mps2K8n7GsVqimroMp6HH1F8,
_QQ3_jm_M8WHw8h_XJhiQZi3NFofRBeGDgShBG2LW_8,
_W6EmE61CNpKiO0DniMnORvCS4gw0wKBQ2elDKHwm3Vk,
_zCJu2owYZ87LBosIyRTpSguHxfCuM7YreKVJ9ejQI,
_JOsA3jUY7njW3XDKIBbVuT3Ysg9FEVxTIGHLvxX7BfI,
_eSq4K5b6RSeu3LcljONAV8BhPU4WPYxVU6csrhX9YqY,
_DsNS3JEJlnvrCCIjdkld6dzfoTqGONHrJMrPWhd60,
_Qvt69RZj56eCkoAFoZ87Qax4PcSt9omNAJjJjfRESY,
_cJS8fUHbWPAFEGMrZY0adbH3sscbwPp1lUW6TfGNu0,
_0T1W4DkA4XhxQ3mqRSifwqf7ZnOeJX9jNfES0b6RQ
];

const assets = {
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": "\"10be-n8egyE9tcb7sKGr/pYCaQ4uWqxI\"",
    "mtime": "2026-07-31T08:53:57.856Z",
    "size": 4286,
    "path": "../public/favicon.ico"
  },
  "/favicon.svg": {
    "type": "image/svg+xml",
    "etag": "\"74-WyA9ZQw0VL+p5r20HpGPoXfXkds\"",
    "mtime": "2026-07-31T08:53:57.857Z",
    "size": 116,
    "path": "../public/favicon.svg"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"39-z7+5/BkI7a/N5a4Vze8Tande0QU\"",
    "mtime": "2026-07-31T08:53:57.856Z",
    "size": 57,
    "path": "../public/robots.txt"
  },
  "/theme-init.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15d-LdG5lUVNvFDRrmi87xtSdBWs6zw\"",
    "mtime": "2026-07-31T08:53:57.858Z",
    "size": 349,
    "path": "../public/theme-init.js"
  },
  "/images/ancien-site.webp": {
    "type": "image/webp",
    "etag": "\"3746-e734D11Dqjfh5NlFidUXIfqJ//8\"",
    "mtime": "2026-07-31T08:53:57.846Z",
    "size": 14150,
    "path": "../public/images/ancien-site.webp"
  },
  "/images/site-mountains.svg": {
    "type": "image/svg+xml",
    "etag": "\"2fdd-Kp0xCymtx14aH6SsI0yTF9+0o2s\"",
    "mtime": "2026-07-31T08:53:57.846Z",
    "size": 12253,
    "path": "../public/images/site-mountains.svg"
  },
  "/_nuxt/1IR7KQhr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"140-/YHAf/dTlR7bMuXhKIh2LPo+N0Y\"",
    "mtime": "2026-07-31T08:53:57.818Z",
    "size": 320,
    "path": "../public/_nuxt/1IR7KQhr.js"
  },
  "/images/recharger-defi.svg": {
    "type": "image/svg+xml",
    "etag": "\"7da-sW4Yx/P5X4Hs5bsLkaNr7fae5Cw\"",
    "mtime": "2026-07-31T08:53:57.846Z",
    "size": 2010,
    "path": "../public/images/recharger-defi.svg"
  },
  "/_nuxt/4mZIX6PM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"55f-IGC1G64F3022R758V8cziyL4u00\"",
    "mtime": "2026-07-31T08:53:57.818Z",
    "size": 1375,
    "path": "../public/_nuxt/4mZIX6PM.js"
  },
  "/_nuxt/AdminAuthBoundary.CaeNCAYA.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1c12-k+DAZ8DJ8kCwhTlPv7Ci0umRKiM\"",
    "mtime": "2026-07-31T08:53:57.818Z",
    "size": 7186,
    "path": "../public/_nuxt/AdminAuthBoundary.CaeNCAYA.css"
  },
  "/_nuxt/B-2FngII.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d60-ngZ85WtSCN1RiMTHx4vDI8/t1zg\"",
    "mtime": "2026-07-31T08:53:57.818Z",
    "size": 11616,
    "path": "../public/_nuxt/B-2FngII.js"
  },
  "/_nuxt/B1ZRb7_o.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ecf-eBkbHRCDWWB4SFnw3U2kgZ72iiA\"",
    "mtime": "2026-07-31T08:53:57.818Z",
    "size": 3791,
    "path": "../public/_nuxt/B1ZRb7_o.js"
  },
  "/_nuxt/B4-Bxl2w.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"160-VxRMLmM2OFtslvcrjImbo6Pm2rM\"",
    "mtime": "2026-07-31T08:53:57.818Z",
    "size": 352,
    "path": "../public/_nuxt/B4-Bxl2w.js"
  },
  "/_nuxt/BEcfmriu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"40-qMPkq8oKenwasbMbAnMsK6GstZc\"",
    "mtime": "2026-07-31T08:53:57.818Z",
    "size": 64,
    "path": "../public/_nuxt/BEcfmriu.js"
  },
  "/_nuxt/B5mNWH9S.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"208-a8AUppM4lLw7pQhORvp+AQjL+00\"",
    "mtime": "2026-07-31T08:53:57.818Z",
    "size": 520,
    "path": "../public/_nuxt/B5mNWH9S.js"
  },
  "/_nuxt/BFs5FO6h.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4027-wpKuyQ3unY7B1M5cWahWJtMWTeU\"",
    "mtime": "2026-07-31T08:53:57.818Z",
    "size": 16423,
    "path": "../public/_nuxt/BFs5FO6h.js"
  },
  "/_nuxt/BFuAqewi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8ef2-JeIh+57IJgz6uv4bdYsRG9vIHHk\"",
    "mtime": "2026-07-31T08:53:57.818Z",
    "size": 36594,
    "path": "../public/_nuxt/BFuAqewi.js"
  },
  "/_nuxt/BeHZwg2h.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"186c-J9ZxfT8l7lBxSiCcp6n6sSPTorQ\"",
    "mtime": "2026-07-31T08:53:57.818Z",
    "size": 6252,
    "path": "../public/_nuxt/BeHZwg2h.js"
  },
  "/_nuxt/BgTWDYZX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ced-TwhiPaivDG6JghP5KScNtaNpceQ\"",
    "mtime": "2026-07-31T08:53:57.818Z",
    "size": 7405,
    "path": "../public/_nuxt/BgTWDYZX.js"
  },
  "/_nuxt/BeRPODyE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"39cb-Wnr2mSzbi56T3/Eav7TPzIb0Nmo\"",
    "mtime": "2026-07-31T08:53:57.818Z",
    "size": 14795,
    "path": "../public/_nuxt/BeRPODyE.js"
  },
  "/_nuxt/Bu2ivkU4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"313-jPMASgfk94Di2gzAnI2NE6IjfDA\"",
    "mtime": "2026-07-31T08:53:57.819Z",
    "size": 787,
    "path": "../public/_nuxt/Bu2ivkU4.js"
  },
  "/_nuxt/C71LENrZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"864-l+jBfM8GJ+uBt8xA9E7Y9qyq7NA\"",
    "mtime": "2026-07-31T08:53:57.819Z",
    "size": 2148,
    "path": "../public/_nuxt/C71LENrZ.js"
  },
  "/_nuxt/BZz7WOoS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4a1da-6CLetO8aKkL8Dsqv5coMsr1wr6k\"",
    "mtime": "2026-07-31T08:53:57.818Z",
    "size": 303578,
    "path": "../public/_nuxt/BZz7WOoS.js"
  },
  "/_nuxt/BhtGhYQi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"26d1e-MjdQDDa3/b3bFraK966Y7ZZngM0\"",
    "mtime": "2026-07-31T08:53:57.819Z",
    "size": 159006,
    "path": "../public/_nuxt/BhtGhYQi.js"
  },
  "/_nuxt/BOF6v8rb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"643fd-4eAFzvIrVx6RBdakASdECPaZDE0\"",
    "mtime": "2026-07-31T08:53:57.818Z",
    "size": 410621,
    "path": "../public/_nuxt/BOF6v8rb.js"
  },
  "/_nuxt/CPyvgkwD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"56e7-C9acOxIAQkIZF9wW8ATJxmZHo6Y\"",
    "mtime": "2026-07-31T08:53:57.819Z",
    "size": 22247,
    "path": "../public/_nuxt/CPyvgkwD.js"
  },
  "/_nuxt/C_agLmz_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8dbb-8NJks5iDbmNajmnCY25a4mkDLHs\"",
    "mtime": "2026-07-31T08:53:57.819Z",
    "size": 36283,
    "path": "../public/_nuxt/C_agLmz_.js"
  },
  "/_nuxt/CcrwEU2M.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"41d-YHgiiOOsOLIQRPoltHNCdLAM6BE\"",
    "mtime": "2026-07-31T08:53:57.819Z",
    "size": 1053,
    "path": "../public/_nuxt/CcrwEU2M.js"
  },
  "/_nuxt/CjoFa3Ch.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"24e6-QKCNrjBirvyHs0Ti8hOrhjx2vpM\"",
    "mtime": "2026-07-31T08:53:57.819Z",
    "size": 9446,
    "path": "../public/_nuxt/CjoFa3Ch.js"
  },
  "/_nuxt/ClKksP15.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1747-nDCChsKEJgC9M/r20mIuCVFPjSs\"",
    "mtime": "2026-07-31T08:53:57.819Z",
    "size": 5959,
    "path": "../public/_nuxt/ClKksP15.js"
  },
  "/_nuxt/CnD20lMG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"48a-a6cmZOHzA3DK3uDARnWPHOiglk0\"",
    "mtime": "2026-07-31T08:53:57.819Z",
    "size": 1162,
    "path": "../public/_nuxt/CnD20lMG.js"
  },
  "/_nuxt/CoYRKfuD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"35-VNA0DjxaxUUvg8NcaUbo2abQ+oU\"",
    "mtime": "2026-07-31T08:53:57.819Z",
    "size": 53,
    "path": "../public/_nuxt/CoYRKfuD.js"
  },
  "/_nuxt/CoachHelpPanel.DMp_9ibv.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"71b4-oTnfvEiqaD6gtl4cKur4egcTBLA\"",
    "mtime": "2026-07-31T08:53:57.819Z",
    "size": 29108,
    "path": "../public/_nuxt/CoachHelpPanel.DMp_9ibv.css"
  },
  "/_nuxt/D2TdqJdp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2a4-hiRgkKs29eVpX75KvuWwCigNDZE\"",
    "mtime": "2026-07-31T08:53:57.819Z",
    "size": 676,
    "path": "../public/_nuxt/D2TdqJdp.js"
  },
  "/_nuxt/DItTFUBP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f9c5-P/1+8g47QUB1GzTwGli7jQnkT9Q\"",
    "mtime": "2026-07-31T08:53:57.819Z",
    "size": 63941,
    "path": "../public/_nuxt/DItTFUBP.js"
  },
  "/_nuxt/D3v5kuVg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f96-y//nnoM3Dm5FPOYOsA6FzUohG8w\"",
    "mtime": "2026-07-31T08:53:57.819Z",
    "size": 8086,
    "path": "../public/_nuxt/D3v5kuVg.js"
  },
  "/_nuxt/DR2dD8EH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"22d-1v6k8GwV/IM3TamgGtkeRkx+XvM\"",
    "mtime": "2026-07-31T08:53:57.819Z",
    "size": 557,
    "path": "../public/_nuxt/DR2dD8EH.js"
  },
  "/_nuxt/D50GhzYy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"28617-ist5ph1Pi0HlV9/eViAYD7XnRDg\"",
    "mtime": "2026-07-31T08:53:57.819Z",
    "size": 165399,
    "path": "../public/_nuxt/D50GhzYy.js"
  },
  "/_nuxt/DQP43qYX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b27b-PLt4HIAwnRwUL8jRvYpS/i5eZhI\"",
    "mtime": "2026-07-31T08:53:57.819Z",
    "size": 111227,
    "path": "../public/_nuxt/DQP43qYX.js"
  },
  "/_nuxt/DSI2HkLV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e06-o/AnmMNg1lIXgVNMnLPeVthi32g\"",
    "mtime": "2026-07-31T08:53:57.819Z",
    "size": 3590,
    "path": "../public/_nuxt/DSI2HkLV.js"
  },
  "/_nuxt/DXH4mO3j.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2dd-6n6rHdXcT4EBZAeb09Pu/DQh+ZY\"",
    "mtime": "2026-07-31T08:53:57.820Z",
    "size": 733,
    "path": "../public/_nuxt/DXH4mO3j.js"
  },
  "/_nuxt/DXas9nvQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3441-YRTvVjhAgSvZaR9eMoCIeubTWF4\"",
    "mtime": "2026-07-31T08:53:57.820Z",
    "size": 13377,
    "path": "../public/_nuxt/DXas9nvQ.js"
  },
  "/_nuxt/DYQsmMUw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bfe-hfkazSeAVujGfG1m8wluPQtiXCg\"",
    "mtime": "2026-07-31T08:53:57.820Z",
    "size": 7166,
    "path": "../public/_nuxt/DYQsmMUw.js"
  },
  "/_nuxt/DdbnXX6_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3772-JkrHjkxiWdD1yo6MS2ppjmGCbA0\"",
    "mtime": "2026-07-31T08:53:57.820Z",
    "size": 14194,
    "path": "../public/_nuxt/DdbnXX6_.js"
  },
  "/_nuxt/DebbvJvu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a834-/dtIOF4AkSkcX30QxutI7CTCCRw\"",
    "mtime": "2026-07-31T08:53:57.820Z",
    "size": 43060,
    "path": "../public/_nuxt/DebbvJvu.js"
  },
  "/_nuxt/DXEQVQnt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"31151-TyUyRNm9rR2JDwpyAxcruTmmr6A\"",
    "mtime": "2026-07-31T08:53:57.820Z",
    "size": 201041,
    "path": "../public/_nuxt/DXEQVQnt.js"
  },
  "/_nuxt/Dj4CfABu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6345-RnYNDiaKvisSouzs1GSYqwk0FRo\"",
    "mtime": "2026-07-31T08:53:57.820Z",
    "size": 25413,
    "path": "../public/_nuxt/Dj4CfABu.js"
  },
  "/_nuxt/Djroj16B.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5efe-r4biSS8i9Lr2alC9UXCaL1yw1dY\"",
    "mtime": "2026-07-31T08:53:57.820Z",
    "size": 24318,
    "path": "../public/_nuxt/Djroj16B.js"
  },
  "/_nuxt/DR4kA__E.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5e479-bl4ZzZp1EaQpYLl6m7aiNFM+8QI\"",
    "mtime": "2026-07-31T08:53:57.820Z",
    "size": 386169,
    "path": "../public/_nuxt/DR4kA__E.js"
  },
  "/_nuxt/DlAUqK2U.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5b-eFCz/UrraTh721pgAl0VxBNR1es\"",
    "mtime": "2026-07-31T08:53:57.820Z",
    "size": 91,
    "path": "../public/_nuxt/DlAUqK2U.js"
  },
  "/_nuxt/DplC-_w3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1627-HIRy34tN1Rt0n2YPec50V5UijOo\"",
    "mtime": "2026-07-31T08:53:57.820Z",
    "size": 5671,
    "path": "../public/_nuxt/DplC-_w3.js"
  },
  "/_nuxt/DwgErDql.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f88-0GZiMac1R24TNDnUTh/aMrhazo0\"",
    "mtime": "2026-07-31T08:53:57.820Z",
    "size": 8072,
    "path": "../public/_nuxt/DwgErDql.js"
  },
  "/_nuxt/Dzot9ObL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3460-klcLupFY+RL1q0mSQBwPvj4bdiI\"",
    "mtime": "2026-07-31T08:53:57.820Z",
    "size": 13408,
    "path": "../public/_nuxt/Dzot9ObL.js"
  },
  "/_nuxt/LearnerSpace.BLjcDulu.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"11076-h8KW6XmT/rUbaPtKDZ7PpH9voig\"",
    "mtime": "2026-07-31T08:53:57.820Z",
    "size": 69750,
    "path": "../public/_nuxt/LearnerSpace.BLjcDulu.css"
  },
  "/_nuxt/VaSPOPhr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7032-uZQ20bhcE4YqMv2bJ83N97r01ek\"",
    "mtime": "2026-07-31T08:53:57.820Z",
    "size": 28722,
    "path": "../public/_nuxt/VaSPOPhr.js"
  },
  "/_nuxt/WizardChallengeWorkspace.DQEfyUy_.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"70e8-czK33H1C2/Chy8dq0c/y4y0xrvA\"",
    "mtime": "2026-07-31T08:53:57.820Z",
    "size": 28904,
    "path": "../public/_nuxt/WizardChallengeWorkspace.DQEfyUy_.css"
  },
  "/_nuxt/Yf1sIW8d.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c3-LVe9aJn5NPXYdCawnvv+5s8hcgo\"",
    "mtime": "2026-07-31T08:53:57.820Z",
    "size": 451,
    "path": "../public/_nuxt/Yf1sIW8d.js"
  },
  "/_nuxt/Q7e4qLa_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2146d-SHgoa6QVyEI2IFY9N4zwoIbleB8\"",
    "mtime": "2026-07-31T08:53:57.820Z",
    "size": 136301,
    "path": "../public/_nuxt/Q7e4qLa_.js"
  },
  "/_nuxt/ZrBg3W11.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b5f-wlshUgtoEorvnPQ8nir4mcnBK2A\"",
    "mtime": "2026-07-31T08:53:57.820Z",
    "size": 2911,
    "path": "../public/_nuxt/ZrBg3W11.js"
  },
  "/_nuxt/ZxaibjE6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d31-FkXIrLbLH70EM39chY/Y34ZQ/uo\"",
    "mtime": "2026-07-31T08:53:57.820Z",
    "size": 11569,
    "path": "../public/_nuxt/ZxaibjE6.js"
  },
  "/_nuxt/_ZPH3TCe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"29c6-MEzF3VD0MwnkRwmDAN6TG1sX51U\"",
    "mtime": "2026-07-31T08:53:57.821Z",
    "size": 10694,
    "path": "../public/_nuxt/_ZPH3TCe.js"
  },
  "/_nuxt/a5l4Eygb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"428c-Ot/UWwe3xutMeRt7B3UmZ9KIztY\"",
    "mtime": "2026-07-31T08:53:57.821Z",
    "size": 17036,
    "path": "../public/_nuxt/a5l4Eygb.js"
  },
  "/_nuxt/admins.dzDkGKEv.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"919-IcW5l1f9k07twX9+HuwUcwEj4n0\"",
    "mtime": "2026-07-31T08:53:57.821Z",
    "size": 2329,
    "path": "../public/_nuxt/admins.dzDkGKEv.css"
  },
  "/_nuxt/apprendre.PnZotV3R.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1a49-V5V2fvgsmKKZqw4AjXKy+rwkApM\"",
    "mtime": "2026-07-31T08:53:57.821Z",
    "size": 6729,
    "path": "../public/_nuxt/apprendre.PnZotV3R.css"
  },
  "/_nuxt/caracteres.BcNkZVio.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"5ed6-eQ6eNeASOetd0aeTsNNXynTuNLo\"",
    "mtime": "2026-07-31T08:53:57.821Z",
    "size": 24278,
    "path": "../public/_nuxt/caracteres.BcNkZVio.css"
  },
  "/_nuxt/challenges.dppAlAcn.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2be1-Yg0dbN7tedFEkpHPL3OkjTxE2C4\"",
    "mtime": "2026-07-31T08:53:57.821Z",
    "size": 11233,
    "path": "../public/_nuxt/challenges.dppAlAcn.css"
  },
  "/_nuxt/charts.CiBYolJF.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"d793-Epz7yODl5PD7K62+M/h8HHkd0vY\"",
    "mtime": "2026-07-31T08:53:57.821Z",
    "size": 55187,
    "path": "../public/_nuxt/charts.CiBYolJF.css"
  },
  "/_nuxt/coaches.BaDV-bQP.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2220-x9RcJK5uh5+VaoyG5f2pdZ3z28E\"",
    "mtime": "2026-07-31T08:53:57.821Z",
    "size": 8736,
    "path": "../public/_nuxt/coaches.BaDV-bQP.css"
  },
  "/_nuxt/consulter.BZzAvpPP.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"23c9-vXSgLeFHKDkDNl5IsGf9YpG9fnw\"",
    "mtime": "2026-07-31T08:53:57.821Z",
    "size": 9161,
    "path": "../public/_nuxt/consulter.BZzAvpPP.css"
  },
  "/_nuxt/contact.CEAlz-zn.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"8f4-ykOUqzOkUVv5IJI3yhju5VrDLdo\"",
    "mtime": "2026-07-31T08:53:57.821Z",
    "size": 2292,
    "path": "../public/_nuxt/contact.CEAlz-zn.css"
  },
  "/_nuxt/default.BZGlWQec.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"4208-37NGK+sKDF/acYjf1n+HrGCOlK4\"",
    "mtime": "2026-07-31T08:53:57.821Z",
    "size": 16904,
    "path": "../public/_nuxt/default.BZGlWQec.css"
  },
  "/_nuxt/entry.CRRjxRjR.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"4c10-SAOgeK1r6diHaEiecX8rmBR1GI8\"",
    "mtime": "2026-07-31T08:53:57.822Z",
    "size": 19472,
    "path": "../public/_nuxt/entry.CRRjxRjR.css"
  },
  "/_nuxt/error-404.C3kT2QX-.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"97e-Xk26Nv4oQLpK3PtofolSggS9Z1M\"",
    "mtime": "2026-07-31T08:53:57.821Z",
    "size": 2430,
    "path": "../public/_nuxt/error-404.C3kT2QX-.css"
  },
  "/_nuxt/error-500.BW0Y54Of.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"773-NSoEX19gPmM2NozVKWotHuvxtho\"",
    "mtime": "2026-07-31T08:53:57.822Z",
    "size": 1907,
    "path": "../public/_nuxt/error-500.BW0Y54Of.css"
  },
  "/_nuxt/dgET4xTb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1463b7-OAzZa94Vm7Wul/eDpf908Th9Yhc\"",
    "mtime": "2026-07-31T08:53:57.822Z",
    "size": 1336247,
    "path": "../public/_nuxt/dgET4xTb.js"
  },
  "/_nuxt/errors.BjGnDVcv.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1362-+l8lZeseXcg1LBBZAI84EJMTHAg\"",
    "mtime": "2026-07-31T08:53:57.822Z",
    "size": 4962,
    "path": "../public/_nuxt/errors.BjGnDVcv.css"
  },
  "/_nuxt/feedbacks.2l4c_9on.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"19b7-IeFg4/GX0231o85Ya2XpgZqJHFg\"",
    "mtime": "2026-07-31T08:53:57.822Z",
    "size": 6583,
    "path": "../public/_nuxt/feedbacks.2l4c_9on.css"
  },
  "/_nuxt/g6ucs01C.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"160-gtb4LsLA85Vn+6lu9juD+DKhlTM\"",
    "mtime": "2026-07-31T08:53:57.822Z",
    "size": 352,
    "path": "../public/_nuxt/g6ucs01C.js"
  },
  "/_nuxt/help-verification.DODWt3zK.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1e41-GtHymoSAF4psafTipM39PN7Xytg\"",
    "mtime": "2026-07-31T08:53:57.822Z",
    "size": 7745,
    "path": "../public/_nuxt/help-verification.DODWt3zK.css"
  },
  "/_nuxt/helps.DZJ6t0nO.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2207-jtfvJZDC3TYKKO8XFRnFINfGF8k\"",
    "mtime": "2026-07-31T08:53:57.822Z",
    "size": 8711,
    "path": "../public/_nuxt/helps.DZJ6t0nO.css"
  },
  "/_nuxt/index.D579FHEw.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"488d-eb885muPMUoohkLI9Q5AZBeConM\"",
    "mtime": "2026-07-31T08:53:57.822Z",
    "size": 18573,
    "path": "../public/_nuxt/index.D579FHEw.css"
  },
  "/_nuxt/mSr3LXc2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"375c-t4MMQ6w6jXfghC1pdpYyWa8sEdI\"",
    "mtime": "2026-07-31T08:53:57.822Z",
    "size": 14172,
    "path": "../public/_nuxt/mSr3LXc2.js"
  },
  "/_nuxt/mWFv6tjf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"adff-94Vq2uHZI6lqj0OOI/Th8zsCnVM\"",
    "mtime": "2026-07-31T08:53:57.822Z",
    "size": 44543,
    "path": "../public/_nuxt/mWFv6tjf.js"
  },
  "/_nuxt/mon-compte.BfHrW1fD.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"81f-qRXMInFEyvge+C3tRZgg5uCaXx4\"",
    "mtime": "2026-07-31T08:53:57.822Z",
    "size": 2079,
    "path": "../public/_nuxt/mon-compte.BfHrW1fD.css"
  },
  "/_nuxt/signin.CF2VGsJc.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"100e-jDykrebphTgAAdflfwX9MSv7ams\"",
    "mtime": "2026-07-31T08:53:57.822Z",
    "size": 4110,
    "path": "../public/_nuxt/signin.CF2VGsJc.css"
  },
  "/_nuxt/tests.LWRbe2kp.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"39e7-BTQZpkKx07gIFERalmVUK0MvJ74\"",
    "mtime": "2026-07-31T08:53:57.822Z",
    "size": 14823,
    "path": "../public/_nuxt/tests.LWRbe2kp.css"
  },
  "/_nuxt/url.DYRpxmrd.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"43ee-N7Ivpw8dmPZaieXS3TxhyCEwvL0\"",
    "mtime": "2026-07-31T08:53:57.822Z",
    "size": 17390,
    "path": "../public/_nuxt/url.DYRpxmrd.css"
  },
  "/_nuxt/users.D0_n7LnF.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"a87-gdpl2VnXOVPpa/zExdiw5k6pK2I\"",
    "mtime": "2026-07-31T08:53:57.822Z",
    "size": 2695,
    "path": "../public/_nuxt/users.D0_n7LnF.css"
  },
  "/_nuxt/main.BWlbsXWt.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"136c1-tD/V9ejQIHhWBaeJ396QqpzJEJU\"",
    "mtime": "2026-07-31T08:53:57.822Z",
    "size": 79553,
    "path": "../public/_nuxt/main.BWlbsXWt.css"
  },
  "/_nuxt/yL1fAkWO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d96-htYQA57yT6aqlbGfqLbSTp7gAh4\"",
    "mtime": "2026-07-31T08:53:57.823Z",
    "size": 3478,
    "path": "../public/_nuxt/yL1fAkWO.js"
  },
  "/coach-media/avatars-cartoon/42f6c648-e545-4d49-8f0b-518fb3a2d186.png": {
    "type": "image/png",
    "etag": "\"16e697-lSZcsIa6taUTrpbXlngJJs5do7E\"",
    "mtime": "2026-07-31T08:53:57.861Z",
    "size": 1500823,
    "path": "../public/coach-media/avatars-cartoon/42f6c648-e545-4d49-8f0b-518fb3a2d186.png"
  },
  "/coach-media/avatars-cartoon/4f7a8330-834e-44e0-ad17-397d1e2a5891.png": {
    "type": "image/png",
    "etag": "\"15dca6-tSDm1naznyFNYIkdupEaTCi//zk\"",
    "mtime": "2026-07-31T08:53:57.861Z",
    "size": 1432742,
    "path": "../public/coach-media/avatars-cartoon/4f7a8330-834e-44e0-ad17-397d1e2a5891.png"
  },
  "/coach-media/avatars-cartoon/732fe1f9-b633-4261-bdf8-542b99b2a98c.png": {
    "type": "image/png",
    "etag": "\"172bf9-bwNVo0D3pGzvGYiYtpjtpXMEyow\"",
    "mtime": "2026-07-31T08:53:57.866Z",
    "size": 1518585,
    "path": "../public/coach-media/avatars-cartoon/732fe1f9-b633-4261-bdf8-542b99b2a98c.png"
  },
  "/coach-media/avatars-cartoon/10f80bed-4250-41d9-8a65-fbaa5deba408.png": {
    "type": "image/png",
    "etag": "\"1cb81c-MRMBmg7AHvu65SJLBvBK8rFlodk\"",
    "mtime": "2026-07-31T08:53:57.850Z",
    "size": 1882140,
    "path": "../public/coach-media/avatars-cartoon/10f80bed-4250-41d9-8a65-fbaa5deba408.png"
  },
  "/coach-media/avatars-cartoon/19f352b5-75f2-449a-b441-7b8203da9e6f.png": {
    "type": "image/png",
    "etag": "\"19e42e-iH1LFjD11ghq1jK6hmAx+ousOZA\"",
    "mtime": "2026-07-31T08:53:57.860Z",
    "size": 1696814,
    "path": "../public/coach-media/avatars-cartoon/19f352b5-75f2-449a-b441-7b8203da9e6f.png"
  },
  "/coach-media/avatars-cartoon/1af3afdd-5c5a-41ef-b639-d2e415aaa4fd.png": {
    "type": "image/png",
    "etag": "\"1e6a20-WtrSxDO1985qI/4CZZABrySuKig\"",
    "mtime": "2026-07-31T08:53:57.861Z",
    "size": 1993248,
    "path": "../public/coach-media/avatars-cartoon/1af3afdd-5c5a-41ef-b639-d2e415aaa4fd.png"
  },
  "/coach-media/avatars-cartoon/24ff9e4a-18bc-4fd6-86b6-1f4a3faf5e07.png": {
    "type": "image/png",
    "etag": "\"1aa3b8-TwwcoBqTa5YFLJ8/s7NpNGJYybo\"",
    "mtime": "2026-07-31T08:53:57.866Z",
    "size": 1745848,
    "path": "../public/coach-media/avatars-cartoon/24ff9e4a-18bc-4fd6-86b6-1f4a3faf5e07.png"
  },
  "/coach-media/avatars-cartoon/3b8a6868-873d-477c-a947-45d00761cd5d.png": {
    "type": "image/png",
    "etag": "\"181561-RMchrt2bobchfIO+Ry8cEH8QGsA\"",
    "mtime": "2026-07-31T08:53:57.865Z",
    "size": 1578337,
    "path": "../public/coach-media/avatars-cartoon/3b8a6868-873d-477c-a947-45d00761cd5d.png"
  },
  "/coach-media/avatars-cartoon/5da085b6-2b23-4338-bc79-31f5e9a4b5bc.png": {
    "type": "image/png",
    "etag": "\"1e69ce-QlNHo6FKaD6iOL26iod9ZwyufwY\"",
    "mtime": "2026-07-31T08:53:57.871Z",
    "size": 1993166,
    "path": "../public/coach-media/avatars-cartoon/5da085b6-2b23-4338-bc79-31f5e9a4b5bc.png"
  },
  "/coach-media/avatars-cartoon/Defi-de-conjugaison.pdf": {
    "type": "application/pdf",
    "etag": "\"1971-GvyCFxsExS5nnjCoRJihmJWjW1Y\"",
    "mtime": "2026-07-31T08:53:57.872Z",
    "size": 6513,
    "path": "../public/coach-media/avatars-cartoon/Defi-de-conjugaison.pdf"
  },
  "/coach-media/avatars/camille.jpg": {
    "type": "image/jpeg",
    "etag": "\"8236-iF9IFpUQ41mOrk3DW4giaY2v1A4\"",
    "mtime": "2026-07-31T08:53:57.857Z",
    "size": 33334,
    "path": "../public/coach-media/avatars/camille.jpg"
  },
  "/coach-media/avatars/claire.jpg": {
    "type": "image/jpeg",
    "etag": "\"c54e-brF3vVSmHDKtuq1fWp3D7oFg51M\"",
    "mtime": "2026-07-31T08:53:57.857Z",
    "size": 50510,
    "path": "../public/coach-media/avatars/claire.jpg"
  },
  "/coach-media/avatars/amel.jpg": {
    "type": "image/jpeg",
    "etag": "\"bdc2-XpfseHXprhgQ2kOwJnuzEG4Szrk\"",
    "mtime": "2026-07-31T08:53:57.847Z",
    "size": 48578,
    "path": "../public/coach-media/avatars/amel.jpg"
  },
  "/coach-media/avatars/gabriel.jpg": {
    "type": "image/jpeg",
    "etag": "\"bcf0-Gm00KTQi4TW4IfPKJlSbLvra1vY\"",
    "mtime": "2026-07-31T08:53:57.857Z",
    "size": 48368,
    "path": "../public/coach-media/avatars/gabriel.jpg"
  },
  "/coach-media/avatars/karim.jpg": {
    "type": "image/jpeg",
    "etag": "\"f507-Nj981GfUvc5eTvpZtyN0ieyiCHU\"",
    "mtime": "2026-07-31T08:53:57.857Z",
    "size": 62727,
    "path": "../public/coach-media/avatars/karim.jpg"
  },
  "/coach-media/avatars/hugo.jpg": {
    "type": "image/jpeg",
    "etag": "\"e0ab-BgIuErDh4c6iTXJy8Qw9D1fV2Y4\"",
    "mtime": "2026-07-31T08:53:57.858Z",
    "size": 57515,
    "path": "../public/coach-media/avatars/hugo.jpg"
  },
  "/coach-media/avatars/lea.jpg": {
    "type": "image/jpeg",
    "etag": "\"f9f5-I+UeknSzltKnBgxau2s+TTvCXzM\"",
    "mtime": "2026-07-31T08:53:57.858Z",
    "size": 63989,
    "path": "../public/coach-media/avatars/lea.jpg"
  },
  "/coach-media/avatars/lucas.jpg": {
    "type": "image/jpeg",
    "etag": "\"10f02-mIKj8itqNevLJJvdMQvCLra5sZs\"",
    "mtime": "2026-07-31T08:53:57.858Z",
    "size": 69378,
    "path": "../public/coach-media/avatars/lucas.jpg"
  },
  "/coach-media/avatars/nora.jpg": {
    "type": "image/jpeg",
    "etag": "\"f434-vbQD186KDkY42S4uGz7cixTeM3Y\"",
    "mtime": "2026-07-31T08:53:57.858Z",
    "size": 62516,
    "path": "../public/coach-media/avatars/nora.jpg"
  },
  "/coach-media/avatars-cartoon/830a8cdd-fb26-4191-a673-42c5f28f2e73.png": {
    "type": "image/png",
    "etag": "\"18729d-vgPDIRQFPyqmy59+U/oQK3/Yp4M\"",
    "mtime": "2026-07-31T08:53:57.869Z",
    "size": 1602205,
    "path": "../public/coach-media/avatars-cartoon/830a8cdd-fb26-4191-a673-42c5f28f2e73.png"
  },
  "/coach-media/avatars-cartoon/8f23428e-ed2c-4938-9186-44447f1efcbe.png": {
    "type": "image/png",
    "etag": "\"17d758-OI0Dn0p4RUBHe8wmZnEaiLE1TOE\"",
    "mtime": "2026-07-31T08:53:57.873Z",
    "size": 1562456,
    "path": "../public/coach-media/avatars-cartoon/8f23428e-ed2c-4938-9186-44447f1efcbe.png"
  },
  "/coach-media/avatars-cartoon/db266268-397e-4920-93bb-f134a85cd8b7.png": {
    "type": "image/png",
    "etag": "\"159daf-4edzaYomlV2+3x6M64Bky/SRlbg\"",
    "mtime": "2026-07-31T08:53:57.874Z",
    "size": 1416623,
    "path": "../public/coach-media/avatars-cartoon/db266268-397e-4920-93bb-f134a85cd8b7.png"
  },
  "/coach-media/avatars/sami.jpg": {
    "type": "image/jpeg",
    "etag": "\"b13e-AVASgC2NUl9cEqNeVXQZf710AtI\"",
    "mtime": "2026-07-31T08:53:57.859Z",
    "size": 45374,
    "path": "../public/coach-media/avatars/sami.jpg"
  },
  "/coach-media/avatars/thomas.jpg": {
    "type": "image/jpeg",
    "etag": "\"cf97-C0nHicl9/0pZcc6nPoN1AK6qGxg\"",
    "mtime": "2026-07-31T08:53:57.858Z",
    "size": 53143,
    "path": "../public/coach-media/avatars/thomas.jpg"
  },
  "/coach-media/avatars/zoe.jpg": {
    "type": "image/jpeg",
    "etag": "\"c393-S8Ro+/yzyBY+cBCNNh6M59U1lLI\"",
    "mtime": "2026-07-31T08:53:57.859Z",
    "size": 50067,
    "path": "../public/coach-media/avatars/zoe.jpg"
  },
  "/coach-media/avatars-cartoon/8ced5816-480d-4d64-8e16-a33a743d155c.png": {
    "type": "image/png",
    "etag": "\"1b3e92-OvEuoxrwwJ+3kbm6/frWCWrki5s\"",
    "mtime": "2026-07-31T08:53:57.873Z",
    "size": 1785490,
    "path": "../public/coach-media/avatars-cartoon/8ced5816-480d-4d64-8e16-a33a743d155c.png"
  },
  "/coach-media/avatars-cartoon/b970ff06-9199-44c9-90d3-4adf29466ef2.png": {
    "type": "image/png",
    "etag": "\"191b76-HQFygNHbvhIArIsnfMO1th0D4OU\"",
    "mtime": "2026-07-31T08:53:57.873Z",
    "size": 1645430,
    "path": "../public/coach-media/avatars-cartoon/b970ff06-9199-44c9-90d3-4adf29466ef2.png"
  },
  "/coach-media/avatars-cartoon/fad8cab6-7cd9-454b-a967-00de62cdde32.png": {
    "type": "image/png",
    "etag": "\"196a6b-RvlHBrNGfK3RroJNjF3UpktyvXs\"",
    "mtime": "2026-07-31T08:53:57.880Z",
    "size": 1665643,
    "path": "../public/coach-media/avatars-cartoon/fad8cab6-7cd9-454b-a967-00de62cdde32.png"
  },
  "/coach-media/people/200.webp": {
    "type": "image/webp",
    "etag": "\"1d696-kiyalxZWWq76I5xPP32p65sny50\"",
    "mtime": "2026-07-31T08:53:57.849Z",
    "size": 120470,
    "path": "../public/coach-media/people/200.webp"
  },
  "/coach-media/people/T01.06.01.xlsx": {
    "type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "etag": "\"dcc6-yJKLWkGDw+a72V9Ge5nDtMengWg\"",
    "mtime": "2026-07-31T08:53:57.925Z",
    "size": 56518,
    "path": "../public/coach-media/people/T01.06.01.xlsx"
  },
  "/coach-media/people/portrait1.jpg": {
    "type": "image/jpeg",
    "etag": "\"8236-iF9IFpUQ41mOrk3DW4giaY2v1A4\"",
    "mtime": "2026-07-31T08:53:57.923Z",
    "size": 33334,
    "path": "../public/coach-media/people/portrait1.jpg"
  },
  "/coach-media/people/portrait10.jpg": {
    "type": "image/jpeg",
    "etag": "\"13242-oU9sw67fXaoOhBCspE1ufcKQVJk\"",
    "mtime": "2026-07-31T08:53:57.926Z",
    "size": 78402,
    "path": "../public/coach-media/people/portrait10.jpg"
  },
  "/coach-media/people/portrait11.jpg": {
    "type": "image/jpeg",
    "etag": "\"122fb-lSrwI6GnjcqOU7p9bL3eLB6zbPk\"",
    "mtime": "2026-07-31T08:53:57.926Z",
    "size": 74491,
    "path": "../public/coach-media/people/portrait11.jpg"
  },
  "/coach-media/people/portrait12.jpg": {
    "type": "image/jpeg",
    "etag": "\"f434-vbQD186KDkY42S4uGz7cixTeM3Y\"",
    "mtime": "2026-07-31T08:53:57.925Z",
    "size": 62516,
    "path": "../public/coach-media/people/portrait12.jpg"
  },
  "/coach-media/people/portrait13.jpg": {
    "type": "image/jpeg",
    "etag": "\"e0ab-BgIuErDh4c6iTXJy8Qw9D1fV2Y4\"",
    "mtime": "2026-07-31T08:53:57.927Z",
    "size": 57515,
    "path": "../public/coach-media/people/portrait13.jpg"
  },
  "/coach-media/people/portrait16.jpg": {
    "type": "image/jpeg",
    "etag": "\"cf97-C0nHicl9/0pZcc6nPoN1AK6qGxg\"",
    "mtime": "2026-07-31T08:53:57.928Z",
    "size": 53143,
    "path": "../public/coach-media/people/portrait16.jpg"
  },
  "/coach-media/people/portrait14.jpg": {
    "type": "image/jpeg",
    "etag": "\"10f02-mIKj8itqNevLJJvdMQvCLra5sZs\"",
    "mtime": "2026-07-31T08:53:57.927Z",
    "size": 69378,
    "path": "../public/coach-media/people/portrait14.jpg"
  },
  "/coach-media/people/portrait15.jpg": {
    "type": "image/jpeg",
    "etag": "\"e76c-vSk8fJrHyAqX+V28777ha8WbgNQ\"",
    "mtime": "2026-07-31T08:53:57.928Z",
    "size": 59244,
    "path": "../public/coach-media/people/portrait15.jpg"
  },
  "/coach-media/people/portrait17.jpg": {
    "type": "image/jpeg",
    "etag": "\"bcf0-Gm00KTQi4TW4IfPKJlSbLvra1vY\"",
    "mtime": "2026-07-31T08:53:57.928Z",
    "size": 48368,
    "path": "../public/coach-media/people/portrait17.jpg"
  },
  "/coach-media/people/portrait18.jpg": {
    "type": "image/jpeg",
    "etag": "\"c54e-brF3vVSmHDKtuq1fWp3D7oFg51M\"",
    "mtime": "2026-07-31T08:53:57.929Z",
    "size": 50510,
    "path": "../public/coach-media/people/portrait18.jpg"
  },
  "/coach-media/people/portrait2.jpg": {
    "type": "image/jpeg",
    "etag": "\"bcdc-0QQ4XzMu+rYTbqYvpc9NTeUA8tY\"",
    "mtime": "2026-07-31T08:53:57.928Z",
    "size": 48348,
    "path": "../public/coach-media/people/portrait2.jpg"
  },
  "/coach-media/people/portrait19.jpg": {
    "type": "image/jpeg",
    "etag": "\"c393-S8Ro+/yzyBY+cBCNNh6M59U1lLI\"",
    "mtime": "2026-07-31T08:53:57.929Z",
    "size": 50067,
    "path": "../public/coach-media/people/portrait19.jpg"
  },
  "/coach-media/people/portrait20.jpg": {
    "type": "image/jpeg",
    "etag": "\"b13e-AVASgC2NUl9cEqNeVXQZf710AtI\"",
    "mtime": "2026-07-31T08:53:57.928Z",
    "size": 45374,
    "path": "../public/coach-media/people/portrait20.jpg"
  },
  "/coach-media/people/portrait21.jpg": {
    "type": "image/jpeg",
    "etag": "\"f9f5-I+UeknSzltKnBgxau2s+TTvCXzM\"",
    "mtime": "2026-07-31T08:53:57.928Z",
    "size": 63989,
    "path": "../public/coach-media/people/portrait21.jpg"
  },
  "/coach-media/people/portrait22.jpg": {
    "type": "image/jpeg",
    "etag": "\"bdc2-XpfseHXprhgQ2kOwJnuzEG4Szrk\"",
    "mtime": "2026-07-31T08:53:57.929Z",
    "size": 48578,
    "path": "../public/coach-media/people/portrait22.jpg"
  },
  "/coach-media/people/portrait23.jpg": {
    "type": "image/jpeg",
    "etag": "\"be4c-P8CT4CrVwbEaeQLat0jhjTQMjxo\"",
    "mtime": "2026-07-31T08:53:57.928Z",
    "size": 48716,
    "path": "../public/coach-media/people/portrait23.jpg"
  },
  "/coach-media/people/portrait24.jpg": {
    "type": "image/jpeg",
    "etag": "\"abed-vXR8pegbgVS9EPJiKC3ZDRQ4dJg\"",
    "mtime": "2026-07-31T08:53:57.929Z",
    "size": 44013,
    "path": "../public/coach-media/people/portrait24.jpg"
  },
  "/coach-media/people/portrait25.jpg": {
    "type": "image/jpeg",
    "etag": "\"e0a7-8029IuA0LaQ6Vf6lujX/+UuHaV0\"",
    "mtime": "2026-07-31T08:53:57.930Z",
    "size": 57511,
    "path": "../public/coach-media/people/portrait25.jpg"
  },
  "/coach-media/people/portrait26.jpg": {
    "type": "image/jpeg",
    "etag": "\"10adb-Y2avzIjFtKDJtMnigpGDItgDIK4\"",
    "mtime": "2026-07-31T08:53:57.929Z",
    "size": 68315,
    "path": "../public/coach-media/people/portrait26.jpg"
  },
  "/coach-media/people/portrait27.jpg": {
    "type": "image/jpeg",
    "etag": "\"e758-fcjR+RePqA6Bh1Ol6SdhNalWKxo\"",
    "mtime": "2026-07-31T08:53:57.930Z",
    "size": 59224,
    "path": "../public/coach-media/people/portrait27.jpg"
  },
  "/coach-media/people/portrait28.jpg": {
    "type": "image/jpeg",
    "etag": "\"ab15-QtgsG93oCrKL2cWD/M5wqljszjg\"",
    "mtime": "2026-07-31T08:53:57.930Z",
    "size": 43797,
    "path": "../public/coach-media/people/portrait28.jpg"
  },
  "/coach-media/people/portrait29.jpg": {
    "type": "image/jpeg",
    "etag": "\"f507-Nj981GfUvc5eTvpZtyN0ieyiCHU\"",
    "mtime": "2026-07-31T08:53:57.930Z",
    "size": 62727,
    "path": "../public/coach-media/people/portrait29.jpg"
  },
  "/coach-media/people/portrait3.jpg": {
    "type": "image/jpeg",
    "etag": "\"ce90-1wGjSDgtEHb8AUpH3znLDA47jOw\"",
    "mtime": "2026-07-31T08:53:57.930Z",
    "size": 52880,
    "path": "../public/coach-media/people/portrait3.jpg"
  },
  "/coach-media/people/portrait30.jpg": {
    "type": "image/jpeg",
    "etag": "\"91aa-41JiP0aXvZq9y9u/b4pTIbC5DeU\"",
    "mtime": "2026-07-31T08:53:57.930Z",
    "size": 37290,
    "path": "../public/coach-media/people/portrait30.jpg"
  },
  "/coach-media/people/portrait31.jpg": {
    "type": "image/jpeg",
    "etag": "\"ee72-6mKQvP6WUZZaZuh//G3t4u0EMBg\"",
    "mtime": "2026-07-31T08:53:57.930Z",
    "size": 61042,
    "path": "../public/coach-media/people/portrait31.jpg"
  },
  "/coach-media/people/portrait32.jpg": {
    "type": "image/jpeg",
    "etag": "\"c2cc-IStqzFyonefLZL/ubYviGC+lI+w\"",
    "mtime": "2026-07-31T08:53:57.930Z",
    "size": 49868,
    "path": "../public/coach-media/people/portrait32.jpg"
  },
  "/coach-media/people/portrait33.jpg": {
    "type": "image/jpeg",
    "etag": "\"e86f-wCIX8Pwsa0GqVd/2WH5WG1WSyNs\"",
    "mtime": "2026-07-31T08:53:57.931Z",
    "size": 59503,
    "path": "../public/coach-media/people/portrait33.jpg"
  },
  "/coach-media/people/portrait34.jpg": {
    "type": "image/jpeg",
    "etag": "\"1002d-6T6Xf9AX5UafZW2vbYEzj+5xvO0\"",
    "mtime": "2026-07-31T08:53:57.931Z",
    "size": 65581,
    "path": "../public/coach-media/people/portrait34.jpg"
  },
  "/coach-media/people/portrait4.jpg": {
    "type": "image/jpeg",
    "etag": "\"d171-TlrBkVdDwxLYUzqOqRWUkbkpkAo\"",
    "mtime": "2026-07-31T08:53:57.931Z",
    "size": 53617,
    "path": "../public/coach-media/people/portrait4.jpg"
  },
  "/coach-media/people/portrait5.jpg": {
    "type": "image/jpeg",
    "etag": "\"c82f-tvc7CKCgsthto9vLFPf7pJndf5o\"",
    "mtime": "2026-07-31T08:53:57.931Z",
    "size": 51247,
    "path": "../public/coach-media/people/portrait5.jpg"
  },
  "/coach-media/people/portrait6.jpg": {
    "type": "image/jpeg",
    "etag": "\"10235-GkA1z8RzeZJIqSW/DgPAy8/3Vj0\"",
    "mtime": "2026-07-31T08:53:57.931Z",
    "size": 66101,
    "path": "../public/coach-media/people/portrait6.jpg"
  },
  "/coach-media/people/portrait7.jpg": {
    "type": "image/jpeg",
    "etag": "\"e4ac-HYcziHIjoK0r/C0hUk1bV4NjrUM\"",
    "mtime": "2026-07-31T08:53:57.932Z",
    "size": 58540,
    "path": "../public/coach-media/people/portrait7.jpg"
  },
  "/coach-media/people/portrait8.jpg": {
    "type": "image/jpeg",
    "etag": "\"e800-jIBzhW7XT+HESqFyHPtIW1HuZc4\"",
    "mtime": "2026-07-31T08:53:57.931Z",
    "size": 59392,
    "path": "../public/coach-media/people/portrait8.jpg"
  },
  "/coach-media/people/portrait9.jpg": {
    "type": "image/jpeg",
    "etag": "\"e386-JbEwT6JqpTHkIY1qDgk1a5zOrIc\"",
    "mtime": "2026-07-31T08:53:57.931Z",
    "size": 58246,
    "path": "../public/coach-media/people/portrait9.jpg"
  },
  "/coach-media/uploads/538b12dc-7f77-437e-a281-3db72a0a987c.png": {
    "type": "image/png",
    "etag": "\"17d758-OI0Dn0p4RUBHe8wmZnEaiLE1TOE\"",
    "mtime": "2026-07-31T08:53:57.896Z",
    "size": 1562456,
    "path": "../public/coach-media/uploads/538b12dc-7f77-437e-a281-3db72a0a987c.png"
  },
  "/coach-media/uploads/2f16e10d-f885-45d1-9208-7faac71a6577.png": {
    "type": "image/png",
    "etag": "\"19e42e-iH1LFjD11ghq1jK6hmAx+ousOZA\"",
    "mtime": "2026-07-31T08:53:57.889Z",
    "size": 1696814,
    "path": "../public/coach-media/uploads/2f16e10d-f885-45d1-9208-7faac71a6577.png"
  },
  "/coach-media/uploads/30fdf4c2-bf1e-492d-b2ee-e4c920be3e28.png": {
    "type": "image/png",
    "etag": "\"18729d-vgPDIRQFPyqmy59+U/oQK3/Yp4M\"",
    "mtime": "2026-07-31T08:53:57.849Z",
    "size": 1602205,
    "path": "../public/coach-media/uploads/30fdf4c2-bf1e-492d-b2ee-e4c920be3e28.png"
  },
  "/coach-media/uploads/06e4101b-298e-4352-bf66-f4ea7a350500.png": {
    "type": "image/png",
    "etag": "\"1b3e92-OvEuoxrwwJ+3kbm6/frWCWrki5s\"",
    "mtime": "2026-07-31T08:53:57.889Z",
    "size": 1785490,
    "path": "../public/coach-media/uploads/06e4101b-298e-4352-bf66-f4ea7a350500.png"
  },
  "/coach-media/uploads/4f43eb0e-1591-4688-9a04-ad786c1ed617.png": {
    "type": "image/png",
    "etag": "\"1e69ce-QlNHo6FKaD6iOL26iod9ZwyufwY\"",
    "mtime": "2026-07-31T08:53:57.889Z",
    "size": 1993166,
    "path": "../public/coach-media/uploads/4f43eb0e-1591-4688-9a04-ad786c1ed617.png"
  },
  "/coach-media/uploads/58a1f2ac-9ac5-4c89-9453-f96b177e021a.png": {
    "type": "image/png",
    "etag": "\"159daf-4edzaYomlV2+3x6M64Bky/SRlbg\"",
    "mtime": "2026-07-31T08:53:57.892Z",
    "size": 1416623,
    "path": "../public/coach-media/uploads/58a1f2ac-9ac5-4c89-9453-f96b177e021a.png"
  },
  "/coach-media/uploads/7c2bbc4c-d63f-430b-a18d-fcee64d2ee27.png": {
    "type": "image/png",
    "etag": "\"159daf-4edzaYomlV2+3x6M64Bky/SRlbg\"",
    "mtime": "2026-07-31T08:53:57.906Z",
    "size": 1416623,
    "path": "../public/coach-media/uploads/7c2bbc4c-d63f-430b-a18d-fcee64d2ee27.png"
  },
  "/coach-media/uploads/5b59b65b-55d0-4b8a-a0d0-37bf9385ba24.png": {
    "type": "image/png",
    "etag": "\"1aa3b8-TwwcoBqTa5YFLJ8/s7NpNGJYybo\"",
    "mtime": "2026-07-31T08:53:57.893Z",
    "size": 1745848,
    "path": "../public/coach-media/uploads/5b59b65b-55d0-4b8a-a0d0-37bf9385ba24.png"
  },
  "/coach-media/uploads/841d5131-04ff-427b-893a-847773422907.png": {
    "type": "image/png",
    "etag": "\"17d758-OI0Dn0p4RUBHe8wmZnEaiLE1TOE\"",
    "mtime": "2026-07-31T08:53:57.900Z",
    "size": 1562456,
    "path": "../public/coach-media/uploads/841d5131-04ff-427b-893a-847773422907.png"
  },
  "/coach-media/uploads/5c10171b-755c-4d43-aa06-52e70ee0c28e.png": {
    "type": "image/png",
    "etag": "\"19e42e-iH1LFjD11ghq1jK6hmAx+ousOZA\"",
    "mtime": "2026-07-31T08:53:57.899Z",
    "size": 1696814,
    "path": "../public/coach-media/uploads/5c10171b-755c-4d43-aa06-52e70ee0c28e.png"
  },
  "/coach-media/uploads/5d410305-96e0-4e99-ae37-0ad0346d2834.png": {
    "type": "image/png",
    "etag": "\"1b3e92-OvEuoxrwwJ+3kbm6/frWCWrki5s\"",
    "mtime": "2026-07-31T08:53:57.892Z",
    "size": 1785490,
    "path": "../public/coach-media/uploads/5d410305-96e0-4e99-ae37-0ad0346d2834.png"
  },
  "/coach-media/uploads/5fef96f4-0377-4736-b0e0-f084e8c0acb1.png": {
    "type": "image/png",
    "etag": "\"18729d-vgPDIRQFPyqmy59+U/oQK3/Yp4M\"",
    "mtime": "2026-07-31T08:53:57.900Z",
    "size": 1602205,
    "path": "../public/coach-media/uploads/5fef96f4-0377-4736-b0e0-f084e8c0acb1.png"
  },
  "/coach-media/uploads/c92ca73c-2c4e-4f00-8d40-78323ecc6d1d.png": {
    "type": "image/png",
    "etag": "\"16e697-lSZcsIa6taUTrpbXlngJJs5do7E\"",
    "mtime": "2026-07-31T08:53:57.918Z",
    "size": 1500823,
    "path": "../public/coach-media/uploads/c92ca73c-2c4e-4f00-8d40-78323ecc6d1d.png"
  },
  "/coach-media/uploads/e8056f15-4264-4483-bde0-da27016883c3.png": {
    "type": "image/png",
    "etag": "\"16e697-lSZcsIa6taUTrpbXlngJJs5do7E\"",
    "mtime": "2026-07-31T08:53:57.918Z",
    "size": 1500823,
    "path": "../public/coach-media/uploads/e8056f15-4264-4483-bde0-da27016883c3.png"
  },
  "/coach-media/uploads/a09d1eae-bb31-49b6-9b87-2f6b14cc7720.png": {
    "type": "image/png",
    "etag": "\"196a6b-RvlHBrNGfK3RroJNjF3UpktyvXs\"",
    "mtime": "2026-07-31T08:53:57.906Z",
    "size": 1665643,
    "path": "../public/coach-media/uploads/a09d1eae-bb31-49b6-9b87-2f6b14cc7720.png"
  },
  "/coach-media/uploads/849249ef-60fe-497d-a0cc-1ff6224e1035.png": {
    "type": "image/png",
    "etag": "\"1e6a20-WtrSxDO1985qI/4CZZABrySuKig\"",
    "mtime": "2026-07-31T08:53:57.900Z",
    "size": 1993248,
    "path": "../public/coach-media/uploads/849249ef-60fe-497d-a0cc-1ff6224e1035.png"
  },
  "/coach-media/uploads/9e91555a-0c28-4378-8797-391dee96076d.png": {
    "type": "image/png",
    "etag": "\"1e6a20-WtrSxDO1985qI/4CZZABrySuKig\"",
    "mtime": "2026-07-31T08:53:57.906Z",
    "size": 1993248,
    "path": "../public/coach-media/uploads/9e91555a-0c28-4378-8797-391dee96076d.png"
  },
  "/coach-media/uploads/ab818ee2-0431-430e-a9af-e78936417633.png": {
    "type": "image/png",
    "etag": "\"196a6b-RvlHBrNGfK3RroJNjF3UpktyvXs\"",
    "mtime": "2026-07-31T08:53:57.915Z",
    "size": 1665643,
    "path": "../public/coach-media/uploads/ab818ee2-0431-430e-a9af-e78936417633.png"
  },
  "/coach-media/uploads/a2a433ff-1b21-482b-a9d9-6cb0da8146f4.png": {
    "type": "image/png",
    "etag": "\"1aa3b8-TwwcoBqTa5YFLJ8/s7NpNGJYybo\"",
    "mtime": "2026-07-31T08:53:57.915Z",
    "size": 1745848,
    "path": "../public/coach-media/uploads/a2a433ff-1b21-482b-a9d9-6cb0da8146f4.png"
  },
  "/coach-media/uploads/aed28159-a121-45cb-9dd1-16ecc349b84d.png": {
    "type": "image/png",
    "etag": "\"181561-RMchrt2bobchfIO+Ry8cEH8QGsA\"",
    "mtime": "2026-07-31T08:53:57.915Z",
    "size": 1578337,
    "path": "../public/coach-media/uploads/aed28159-a121-45cb-9dd1-16ecc349b84d.png"
  },
  "/coach-media/uploads/a1ec228e-1055-4648-9252-fb2dd6fb5a02.png": {
    "type": "image/png",
    "etag": "\"1e69ce-QlNHo6FKaD6iOL26iod9ZwyufwY\"",
    "mtime": "2026-07-31T08:53:57.907Z",
    "size": 1993166,
    "path": "../public/coach-media/uploads/a1ec228e-1055-4648-9252-fb2dd6fb5a02.png"
  },
  "/coach-media/uploads/bf6f3f5e-efca-4554-9963-44587811c0f8.png": {
    "type": "image/png",
    "etag": "\"1e69ce-QlNHo6FKaD6iOL26iod9ZwyufwY\"",
    "mtime": "2026-07-31T08:53:57.915Z",
    "size": 1993166,
    "path": "../public/coach-media/uploads/bf6f3f5e-efca-4554-9963-44587811c0f8.png"
  },
  "/_nuxt/builds/latest.json": {
    "type": "application/json",
    "etag": "\"47-aYTHVHG3XTnY//IQ+zKOMfHiM5I\"",
    "mtime": "2026-07-31T08:53:57.807Z",
    "size": 71,
    "path": "../public/_nuxt/builds/latest.json"
  },
  "/coach-media/animations/fail/fail1.webp": {
    "type": "image/webp",
    "etag": "\"3e6cc-CLBekLwBwSBNLCxvb1eKJT9+wZU\"",
    "mtime": "2026-07-31T08:53:57.932Z",
    "size": 255692,
    "path": "../public/coach-media/animations/fail/fail1.webp"
  },
  "/coach-media/uploads/c1fd77f5-5909-4c4c-ae98-b09d04e5e085.png": {
    "type": "image/png",
    "etag": "\"1cb81c-MRMBmg7AHvu65SJLBvBK8rFlodk\"",
    "mtime": "2026-07-31T08:53:57.918Z",
    "size": 1882140,
    "path": "../public/coach-media/uploads/c1fd77f5-5909-4c4c-ae98-b09d04e5e085.png"
  },
  "/coach-media/uploads/e5108547-b1b3-4c96-89ca-6e00c0d1c60a.png": {
    "type": "image/png",
    "etag": "\"1cb81c-MRMBmg7AHvu65SJLBvBK8rFlodk\"",
    "mtime": "2026-07-31T08:53:57.927Z",
    "size": 1882140,
    "path": "../public/coach-media/uploads/e5108547-b1b3-4c96-89ca-6e00c0d1c60a.png"
  },
  "/coach-media/uploads/f8346f58-2678-4a95-aaa8-d37ba71ecb3b.png": {
    "type": "image/png",
    "etag": "\"191b76-HQFygNHbvhIArIsnfMO1th0D4OU\"",
    "mtime": "2026-07-31T08:53:57.918Z",
    "size": 1645430,
    "path": "../public/coach-media/uploads/f8346f58-2678-4a95-aaa8-d37ba71ecb3b.png"
  },
  "/coach-media/animations/fail/fail2.webp": {
    "type": "image/webp",
    "etag": "\"5e028-RHwRc2cf0IvG2H9MS53ShV8XyoY\"",
    "mtime": "2026-07-31T08:53:57.933Z",
    "size": 385064,
    "path": "../public/coach-media/animations/fail/fail2.webp"
  },
  "/coach-media/animations/fail/fail10.webp": {
    "type": "image/webp",
    "etag": "\"ec4a8-LxdVywk4WTKCcK/Mz98lMc+PlrY\"",
    "mtime": "2026-07-31T08:53:57.849Z",
    "size": 967848,
    "path": "../public/coach-media/animations/fail/fail10.webp"
  },
  "/coach-media/animations/fail/fail4.webp": {
    "type": "image/webp",
    "etag": "\"5cece-RjBisoBNjPRhvK+ndq3WET8sFcg\"",
    "mtime": "2026-07-31T08:53:57.938Z",
    "size": 380622,
    "path": "../public/coach-media/animations/fail/fail4.webp"
  },
  "/coach-media/animations/fail/fail5.webp": {
    "type": "image/webp",
    "etag": "\"3418c-nUcgdhefQjLBbi5YPrFDciGNe1I\"",
    "mtime": "2026-07-31T08:53:57.938Z",
    "size": 213388,
    "path": "../public/coach-media/animations/fail/fail5.webp"
  },
  "/coach-media/animations/fail/fail6.webp": {
    "type": "image/webp",
    "etag": "\"31e86-st4q2D401jTAQjaB6fQJge0HiLk\"",
    "mtime": "2026-07-31T08:53:57.937Z",
    "size": 204422,
    "path": "../public/coach-media/animations/fail/fail6.webp"
  },
  "/coach-media/animations/fail/fail7.webp": {
    "type": "image/webp",
    "etag": "\"63788-deMgnTG8ziw8Sq9HQAAG5lpmaYQ\"",
    "mtime": "2026-07-31T08:53:57.933Z",
    "size": 407432,
    "path": "../public/coach-media/animations/fail/fail7.webp"
  },
  "/coach-media/uploads/fe9fc5ec-02df-41ce-8f18-7cb14f9fe9e3.png": {
    "type": "image/png",
    "etag": "\"181561-RMchrt2bobchfIO+Ry8cEH8QGsA\"",
    "mtime": "2026-07-31T08:53:57.927Z",
    "size": 1578337,
    "path": "../public/coach-media/uploads/fe9fc5ec-02df-41ce-8f18-7cb14f9fe9e3.png"
  },
  "/coach-media/animations/fail/fail8.webp": {
    "type": "image/webp",
    "etag": "\"39a32-GZjK64v2UufujF0nhcGEc6ElNfk\"",
    "mtime": "2026-07-31T08:53:57.933Z",
    "size": 236082,
    "path": "../public/coach-media/animations/fail/fail8.webp"
  },
  "/coach-media/animations/bravo/bravo1.webp": {
    "type": "image/webp",
    "etag": "\"44738-4QhsLfUd9XIbDTSNeKIP8/efIFU\"",
    "mtime": "2026-07-31T08:53:57.939Z",
    "size": 280376,
    "path": "../public/coach-media/animations/bravo/bravo1.webp"
  },
  "/coach-media/animations/bravo/bravo11.webp": {
    "type": "image/webp",
    "etag": "\"1a216-3xX4QCqG7FtxwZvgt1PBqgFlbzg\"",
    "mtime": "2026-07-31T08:53:57.850Z",
    "size": 107030,
    "path": "../public/coach-media/animations/bravo/bravo11.webp"
  },
  "/coach-media/animations/bravo/bravo12.webp": {
    "type": "image/webp",
    "etag": "\"1205a-/7k+Wui1IgWSv4DPL8QXZSf1p2U\"",
    "mtime": "2026-07-31T08:53:57.944Z",
    "size": 73818,
    "path": "../public/coach-media/animations/bravo/bravo12.webp"
  },
  "/coach-media/animations/bravo/bravo13.webp": {
    "type": "image/webp",
    "etag": "\"56106-bhB3PYpSVxWys8XQ9pz9OrU7QBA\"",
    "mtime": "2026-07-31T08:53:57.938Z",
    "size": 352518,
    "path": "../public/coach-media/animations/bravo/bravo13.webp"
  },
  "/coach-media/animations/bravo/bravo14.webp": {
    "type": "image/webp",
    "etag": "\"34da4-cRZ9lyimIePouzhUvQ/mHfvEtuY\"",
    "mtime": "2026-07-31T08:53:57.939Z",
    "size": 216484,
    "path": "../public/coach-media/animations/bravo/bravo14.webp"
  },
  "/coach-media/animations/bravo/bravo15.webp": {
    "type": "image/webp",
    "etag": "\"2b0e2-qaGuoSfLeg5vXhKMrtg/rxugwqA\"",
    "mtime": "2026-07-31T08:53:57.944Z",
    "size": 176354,
    "path": "../public/coach-media/animations/bravo/bravo15.webp"
  },
  "/coach-media/animations/bravo/bravo16.webp": {
    "type": "image/webp",
    "etag": "\"203f8-jg0MLG/nBqRrdnyLW65UaerRQNM\"",
    "mtime": "2026-07-31T08:53:57.940Z",
    "size": 132088,
    "path": "../public/coach-media/animations/bravo/bravo16.webp"
  },
  "/coach-media/animations/bravo/bravo17.webp": {
    "type": "image/webp",
    "etag": "\"241a0-uyZNtAYraFvIQXIqjMvyOPE1jTw\"",
    "mtime": "2026-07-31T08:53:57.944Z",
    "size": 147872,
    "path": "../public/coach-media/animations/bravo/bravo17.webp"
  },
  "/coach-media/animations/fail/fail9.webp": {
    "type": "image/webp",
    "etag": "\"f5f18-OaHXpPB3qd/rQVrqz8lBFShsxjI\"",
    "mtime": "2026-07-31T08:53:57.938Z",
    "size": 1007384,
    "path": "../public/coach-media/animations/fail/fail9.webp"
  },
  "/coach-media/animations/bravo/bravo18.webp": {
    "type": "image/webp",
    "etag": "\"a01a-cps+HXxadKCjeKKYWHbwcIGk6hU\"",
    "mtime": "2026-07-31T08:53:57.942Z",
    "size": 40986,
    "path": "../public/coach-media/animations/bravo/bravo18.webp"
  },
  "/coach-media/animations/fail/fail3.webp": {
    "type": "image/webp",
    "etag": "\"19d1a6-49q6JpI6yKtRh2mygNyjyUsItIM\"",
    "mtime": "2026-07-31T08:53:57.933Z",
    "size": 1692070,
    "path": "../public/coach-media/animations/fail/fail3.webp"
  },
  "/coach-media/animations/bravo/bravo19.webp": {
    "type": "image/webp",
    "etag": "\"13352-7XcYb6ke3l0xF2LCw/KR+dXmc7Q\"",
    "mtime": "2026-07-31T08:53:57.944Z",
    "size": 78674,
    "path": "../public/coach-media/animations/bravo/bravo19.webp"
  },
  "/coach-media/animations/bravo/bravo2.webp": {
    "type": "image/webp",
    "etag": "\"d0ca-uTre9Wq69Wtq99T7Vn3/dRXQFkg\"",
    "mtime": "2026-07-31T08:53:57.945Z",
    "size": 53450,
    "path": "../public/coach-media/animations/bravo/bravo2.webp"
  },
  "/coach-media/animations/bravo/bravo20.webp": {
    "type": "image/webp",
    "etag": "\"233b2-LlDa1c9jqNgHkGB9k+cU7ap5b0Y\"",
    "mtime": "2026-07-31T08:53:57.945Z",
    "size": 144306,
    "path": "../public/coach-media/animations/bravo/bravo20.webp"
  },
  "/coach-media/animations/bravo/bravo21.webp": {
    "type": "image/webp",
    "etag": "\"3da68-ISHGzxh2cgKoQraDg+pa1TIB3Eo\"",
    "mtime": "2026-07-31T08:53:57.946Z",
    "size": 252520,
    "path": "../public/coach-media/animations/bravo/bravo21.webp"
  },
  "/coach-media/animations/bravo/bravo10.webp": {
    "type": "image/webp",
    "etag": "\"adbd4-UywgFHyHGzDijqz6jodwTseMtkI\"",
    "mtime": "2026-07-31T08:53:57.940Z",
    "size": 711636,
    "path": "../public/coach-media/animations/bravo/bravo10.webp"
  },
  "/coach-media/animations/bravo/bravo22.webp": {
    "type": "image/webp",
    "etag": "\"695d4-fo3c1QhJVPT0yXYAuoQyAXrIO9E\"",
    "mtime": "2026-07-31T08:53:57.946Z",
    "size": 431572,
    "path": "../public/coach-media/animations/bravo/bravo22.webp"
  },
  "/coach-media/animations/bravo/bravo23.webp": {
    "type": "image/webp",
    "etag": "\"203f8-jg0MLG/nBqRrdnyLW65UaerRQNM\"",
    "mtime": "2026-07-31T08:53:57.945Z",
    "size": 132088,
    "path": "../public/coach-media/animations/bravo/bravo23.webp"
  },
  "/coach-media/animations/bravo/bravo24.webp": {
    "type": "image/webp",
    "etag": "\"21c1c-BCPPzQaqjCgONCZQqIz0MRfkhnk\"",
    "mtime": "2026-07-31T08:53:57.945Z",
    "size": 138268,
    "path": "../public/coach-media/animations/bravo/bravo24.webp"
  },
  "/coach-media/animations/bravo/bravo25.webp": {
    "type": "image/webp",
    "etag": "\"6e646-B09j5zbOGx/pB/KUZrJkPccQvk0\"",
    "mtime": "2026-07-31T08:53:57.950Z",
    "size": 452166,
    "path": "../public/coach-media/animations/bravo/bravo25.webp"
  },
  "/coach-media/animations/bravo/bravo26.webp": {
    "type": "image/webp",
    "etag": "\"30b4-3zSDRUC/kfpm2SrLPRZXdNLOLHk\"",
    "mtime": "2026-07-31T08:53:57.945Z",
    "size": 12468,
    "path": "../public/coach-media/animations/bravo/bravo26.webp"
  },
  "/coach-media/animations/bravo/bravo27.webp": {
    "type": "image/webp",
    "etag": "\"18b24-qcCeJs9S6OXbNHnCNtW2ImrJbvY\"",
    "mtime": "2026-07-31T08:53:57.950Z",
    "size": 101156,
    "path": "../public/coach-media/animations/bravo/bravo27.webp"
  },
  "/coach-media/animations/bravo/bravo28.webp": {
    "type": "image/webp",
    "etag": "\"18612-7Zj+YVZPRJ6CKyZAwrxfXIc7fjI\"",
    "mtime": "2026-07-31T08:53:57.946Z",
    "size": 99858,
    "path": "../public/coach-media/animations/bravo/bravo28.webp"
  },
  "/coach-media/animations/bravo/bravo3.webp": {
    "type": "image/webp",
    "etag": "\"80d8-WZGwWFCLsk3YDTm9XP5QCq8R7Es\"",
    "mtime": "2026-07-31T08:53:57.949Z",
    "size": 32984,
    "path": "../public/coach-media/animations/bravo/bravo3.webp"
  },
  "/coach-media/animations/bravo/bravo29.webp": {
    "type": "image/webp",
    "etag": "\"163a6-ViRk6UjMsrG8Il8pS7HYT3/WiFk\"",
    "mtime": "2026-07-31T08:53:57.950Z",
    "size": 91046,
    "path": "../public/coach-media/animations/bravo/bravo29.webp"
  },
  "/coach-media/animations/bravo/bravo30.webp": {
    "type": "image/webp",
    "etag": "\"2be66-2mV/o9/SR26sBGn1HK62usspEXM\"",
    "mtime": "2026-07-31T08:53:57.951Z",
    "size": 179814,
    "path": "../public/coach-media/animations/bravo/bravo30.webp"
  },
  "/coach-media/animations/bravo/bravo31.webp": {
    "type": "image/webp",
    "etag": "\"2154c-mTHroY9VN55S8jkoGrrtwcul4rs\"",
    "mtime": "2026-07-31T08:53:57.950Z",
    "size": 136524,
    "path": "../public/coach-media/animations/bravo/bravo31.webp"
  },
  "/coach-media/animations/bravo/bravo33.webp": {
    "type": "image/webp",
    "etag": "\"19ec0-c95YrxMrzqQW4G9FjU0ykKQ7V9o\"",
    "mtime": "2026-07-31T08:53:57.952Z",
    "size": 106176,
    "path": "../public/coach-media/animations/bravo/bravo33.webp"
  },
  "/coach-media/animations/bravo/bravo32.webp": {
    "type": "image/webp",
    "etag": "\"3ddf2-eZeHr4gLF4RNVRJoLdRkGG/wq/4\"",
    "mtime": "2026-07-31T08:53:57.952Z",
    "size": 253426,
    "path": "../public/coach-media/animations/bravo/bravo32.webp"
  },
  "/coach-media/animations/bravo/bravo4.webp": {
    "type": "image/webp",
    "etag": "\"301b0-kZdjup76tUvXnUsAqLJ/bPOuJLQ\"",
    "mtime": "2026-07-31T08:53:57.951Z",
    "size": 197040,
    "path": "../public/coach-media/animations/bravo/bravo4.webp"
  },
  "/coach-media/animations/bravo/bravo5.webp": {
    "type": "image/webp",
    "etag": "\"120aa-WQCZmq2H4iAmCwkgGz0jbhroUMU\"",
    "mtime": "2026-07-31T08:53:57.950Z",
    "size": 73898,
    "path": "../public/coach-media/animations/bravo/bravo5.webp"
  },
  "/coach-media/animations/bravo/bravo6.webp": {
    "type": "image/webp",
    "etag": "\"1a95c-STnlzMe66YjYqbDuY5yLt9ADvzM\"",
    "mtime": "2026-07-31T08:53:57.952Z",
    "size": 108892,
    "path": "../public/coach-media/animations/bravo/bravo6.webp"
  },
  "/coach-media/animations/bravo/bravo7.webp": {
    "type": "image/webp",
    "etag": "\"29fa6-QguGsOjUTD8OjKKTZfpb9dijR5g\"",
    "mtime": "2026-07-31T08:53:57.953Z",
    "size": 171942,
    "path": "../public/coach-media/animations/bravo/bravo7.webp"
  },
  "/coach-media/animations/bravo/bravo8.webp": {
    "type": "image/webp",
    "etag": "\"1d8b4-xhvLiSPfxFlQsAeh/JU1EhCyKtQ\"",
    "mtime": "2026-07-31T08:53:57.952Z",
    "size": 121012,
    "path": "../public/coach-media/animations/bravo/bravo8.webp"
  },
  "/coach-media/animations/bravo/bravo9.webp": {
    "type": "image/webp",
    "etag": "\"1105e-m+/rIlVAaoiD3hxFGIcC7Skzq0k\"",
    "mtime": "2026-07-31T08:53:57.952Z",
    "size": 69726,
    "path": "../public/coach-media/animations/bravo/bravo9.webp"
  },
  "/coach-media/emojis/danger/danger1.png": {
    "type": "image/png",
    "etag": "\"3036-eXYZ+J7eqF26NQJZHhXFXrNgGww\"",
    "mtime": "2026-07-31T08:53:57.849Z",
    "size": 12342,
    "path": "../public/coach-media/emojis/danger/danger1.png"
  },
  "/coach-media/animations/surprise/surprise10.webp": {
    "type": "image/webp",
    "etag": "\"131a0-flDD1aRXvJm4HKE+7qPrfT2YS20\"",
    "mtime": "2026-07-31T08:53:57.954Z",
    "size": 78240,
    "path": "../public/coach-media/animations/surprise/surprise10.webp"
  },
  "/coach-media/animations/surprise/surprise1.webp": {
    "type": "image/webp",
    "etag": "\"4a370-9Oi37cBTqcZsmdkv+CmJExyHBlo\"",
    "mtime": "2026-07-31T08:53:57.854Z",
    "size": 303984,
    "path": "../public/coach-media/animations/surprise/surprise1.webp"
  },
  "/coach-media/animations/surprise/surprise11.webp": {
    "type": "image/webp",
    "etag": "\"226fa-Xm81GJcMlpKVokcSNJtb09zW62k\"",
    "mtime": "2026-07-31T08:53:57.954Z",
    "size": 141050,
    "path": "../public/coach-media/animations/surprise/surprise11.webp"
  },
  "/coach-media/animations/surprise/surprise12.webp": {
    "type": "image/webp",
    "etag": "\"a118-ZWkYpEVwrTmfFkTwYVBVpG6odjA\"",
    "mtime": "2026-07-31T08:53:57.955Z",
    "size": 41240,
    "path": "../public/coach-media/animations/surprise/surprise12.webp"
  },
  "/coach-media/animations/surprise/surprise13.webp": {
    "type": "image/webp",
    "etag": "\"289d4-B/06SsPdfqNr35A+kWV5GqsWzHg\"",
    "mtime": "2026-07-31T08:53:57.955Z",
    "size": 166356,
    "path": "../public/coach-media/animations/surprise/surprise13.webp"
  },
  "/coach-media/animations/surprise/surprise14.webp": {
    "type": "image/webp",
    "etag": "\"3f97e-wtHNBTyAPcvP3sC4pqeu2CzXJMs\"",
    "mtime": "2026-07-31T08:53:57.955Z",
    "size": 260478,
    "path": "../public/coach-media/animations/surprise/surprise14.webp"
  },
  "/coach-media/animations/surprise/surprise16.webp": {
    "type": "image/webp",
    "etag": "\"10334-Gb5fHOWmtfoadRAb/ahHh2AADW0\"",
    "mtime": "2026-07-31T08:53:57.955Z",
    "size": 66356,
    "path": "../public/coach-media/animations/surprise/surprise16.webp"
  },
  "/coach-media/animations/surprise/surprise15.webp": {
    "type": "image/webp",
    "etag": "\"83768-IbKQoFThb02i7K7OLM8NjZwMn+w\"",
    "mtime": "2026-07-31T08:53:57.955Z",
    "size": 538472,
    "path": "../public/coach-media/animations/surprise/surprise15.webp"
  },
  "/coach-media/animations/surprise/surprise17.webp": {
    "type": "image/webp",
    "etag": "\"1b95e-L11+Pw+wBWHBUC/2neg+jcazG2Y\"",
    "mtime": "2026-07-31T08:53:57.956Z",
    "size": 112990,
    "path": "../public/coach-media/animations/surprise/surprise17.webp"
  },
  "/coach-media/animations/surprise/surprise18.webp": {
    "type": "image/webp",
    "etag": "\"18598-xHc16X67VNu9v8+Gc1s2b0JpwDg\"",
    "mtime": "2026-07-31T08:53:57.957Z",
    "size": 99736,
    "path": "../public/coach-media/animations/surprise/surprise18.webp"
  },
  "/coach-media/animations/surprise/surprise19.webp": {
    "type": "image/webp",
    "etag": "\"11b66-taP6NYs2DrSJ1/Fu0gCrYIFdJrI\"",
    "mtime": "2026-07-31T08:53:57.955Z",
    "size": 72550,
    "path": "../public/coach-media/animations/surprise/surprise19.webp"
  },
  "/coach-media/animations/surprise/surprise2.webp": {
    "type": "image/webp",
    "etag": "\"1b28c-nMtO/w3tSIWPnQA/P/d7OQO8Fos\"",
    "mtime": "2026-07-31T08:53:57.961Z",
    "size": 111244,
    "path": "../public/coach-media/animations/surprise/surprise2.webp"
  },
  "/coach-media/animations/surprise/surprise20.webp": {
    "type": "image/webp",
    "etag": "\"193ea-58K//9bArX9XDu0po5Lr3OMkZHg\"",
    "mtime": "2026-07-31T08:53:57.957Z",
    "size": 103402,
    "path": "../public/coach-media/animations/surprise/surprise20.webp"
  },
  "/coach-media/animations/surprise/surprise21.webp": {
    "type": "image/webp",
    "etag": "\"a180-9IgNwh+Zz8BrStL5KFb1UAAyx08\"",
    "mtime": "2026-07-31T08:53:57.956Z",
    "size": 41344,
    "path": "../public/coach-media/animations/surprise/surprise21.webp"
  },
  "/coach-media/animations/surprise/surprise22.webp": {
    "type": "image/webp",
    "etag": "\"14758-fKETCESGU4TOKmR+Tq2Jt5vsZv4\"",
    "mtime": "2026-07-31T08:53:57.956Z",
    "size": 83800,
    "path": "../public/coach-media/animations/surprise/surprise22.webp"
  },
  "/coach-media/animations/surprise/surprise23.webp": {
    "type": "image/webp",
    "etag": "\"309fc-vmf3IDCZQraeJiH2u5nNYnBmLE0\"",
    "mtime": "2026-07-31T08:53:57.957Z",
    "size": 199164,
    "path": "../public/coach-media/animations/surprise/surprise23.webp"
  },
  "/coach-media/animations/surprise/surprise24.webp": {
    "type": "image/webp",
    "etag": "\"8ec6-3SAThVbqdRWZ2r2MmBs4qSDgNSA\"",
    "mtime": "2026-07-31T08:53:57.957Z",
    "size": 36550,
    "path": "../public/coach-media/animations/surprise/surprise24.webp"
  },
  "/coach-media/animations/surprise/surprise25.webp": {
    "type": "image/webp",
    "etag": "\"34a6-dvr2Gjy94G6cfLjV7K9ojhZks7w\"",
    "mtime": "2026-07-31T08:53:57.959Z",
    "size": 13478,
    "path": "../public/coach-media/animations/surprise/surprise25.webp"
  },
  "/coach-media/animations/surprise/surprise26.webp": {
    "type": "image/webp",
    "etag": "\"743c6-pt6mVsMYiG3+eBL112jrgey0Gzo\"",
    "mtime": "2026-07-31T08:53:57.964Z",
    "size": 476102,
    "path": "../public/coach-media/animations/surprise/surprise26.webp"
  },
  "/coach-media/animations/bravo/bravo34.webp": {
    "type": "image/webp",
    "etag": "\"26ccac-0lLmGbQH56H1iPHEYHxgMHzvGqg\"",
    "mtime": "2026-07-31T08:53:57.952Z",
    "size": 2542764,
    "path": "../public/coach-media/animations/bravo/bravo34.webp"
  },
  "/coach-media/animations/surprise/surprise27.webp": {
    "type": "image/webp",
    "etag": "\"2fd12-RMFF8r6epFOKQpfSCriVPGTdgVU\"",
    "mtime": "2026-07-31T08:53:57.964Z",
    "size": 195858,
    "path": "../public/coach-media/animations/surprise/surprise27.webp"
  },
  "/coach-media/animations/surprise/surprise28.webp": {
    "type": "image/webp",
    "etag": "\"ad24-FgC+hvDgvud9BCFGf28pvxl71oQ\"",
    "mtime": "2026-07-31T08:53:57.961Z",
    "size": 44324,
    "path": "../public/coach-media/animations/surprise/surprise28.webp"
  },
  "/coach-media/animations/surprise/surprise29.webp": {
    "type": "image/webp",
    "etag": "\"12cd0-q0YDo94p3qYkje+5yt5zOubu2/Q\"",
    "mtime": "2026-07-31T08:53:57.961Z",
    "size": 77008,
    "path": "../public/coach-media/animations/surprise/surprise29.webp"
  },
  "/coach-media/animations/surprise/surprise31.webp": {
    "type": "image/webp",
    "etag": "\"8b78-fIpPGO3WzV7KeoLiRXPR1uc7I+0\"",
    "mtime": "2026-07-31T08:53:57.964Z",
    "size": 35704,
    "path": "../public/coach-media/animations/surprise/surprise31.webp"
  },
  "/coach-media/animations/surprise/surprise32.webp": {
    "type": "image/webp",
    "etag": "\"1fc6e-bll0tlhrTsQvI87il4kKbajXbMg\"",
    "mtime": "2026-07-31T08:53:57.965Z",
    "size": 130158,
    "path": "../public/coach-media/animations/surprise/surprise32.webp"
  },
  "/coach-media/animations/surprise/surprise34.webp": {
    "type": "image/webp",
    "etag": "\"39c0c-gOa+85OS+P0yapBXCLgb6G4e3KY\"",
    "mtime": "2026-07-31T08:53:57.965Z",
    "size": 236556,
    "path": "../public/coach-media/animations/surprise/surprise34.webp"
  },
  "/coach-media/animations/surprise/surprise35.webp": {
    "type": "image/webp",
    "etag": "\"2fdf0-P29h6puCfyWcpyj5Hiuay3K7+XI\"",
    "mtime": "2026-07-31T08:53:57.966Z",
    "size": 196080,
    "path": "../public/coach-media/animations/surprise/surprise35.webp"
  },
  "/coach-media/animations/surprise/surprise36.webp": {
    "type": "image/webp",
    "etag": "\"65d6a-XLUQAUVvNKrY0Ak4xmcIhKdi+kc\"",
    "mtime": "2026-07-31T08:53:57.969Z",
    "size": 417130,
    "path": "../public/coach-media/animations/surprise/surprise36.webp"
  },
  "/coach-media/animations/surprise/surprise3.webp": {
    "type": "image/webp",
    "etag": "\"c1a0c-usHwa9n1ie+2Cm+CLsVeWK9PJMQ\"",
    "mtime": "2026-07-31T08:53:57.966Z",
    "size": 793100,
    "path": "../public/coach-media/animations/surprise/surprise3.webp"
  },
  "/coach-media/animations/surprise/surprise30.webp": {
    "type": "image/webp",
    "etag": "\"a5fd0-Hnpb/dNn7ssnoWT9WjuIq+4t5Qo\"",
    "mtime": "2026-07-31T08:53:57.965Z",
    "size": 679888,
    "path": "../public/coach-media/animations/surprise/surprise30.webp"
  },
  "/coach-media/animations/surprise/surprise37.webp": {
    "type": "image/webp",
    "etag": "\"1c006-O6avPzSEEE8867z/qx4SNy/2Dbs\"",
    "mtime": "2026-07-31T08:53:57.970Z",
    "size": 114694,
    "path": "../public/coach-media/animations/surprise/surprise37.webp"
  },
  "/coach-media/animations/surprise/surprise38.webp": {
    "type": "image/webp",
    "etag": "\"13470-E9RJjOFPzc8oN6aIexSBkTIvvno\"",
    "mtime": "2026-07-31T08:53:57.968Z",
    "size": 78960,
    "path": "../public/coach-media/animations/surprise/surprise38.webp"
  },
  "/coach-media/animations/surprise/surprise39.webp": {
    "type": "image/webp",
    "etag": "\"3f126-BT2+LxctzUWG3/ThOwuDtTgAArY\"",
    "mtime": "2026-07-31T08:53:57.969Z",
    "size": 258342,
    "path": "../public/coach-media/animations/surprise/surprise39.webp"
  },
  "/coach-media/animations/surprise/surprise4.webp": {
    "type": "image/webp",
    "etag": "\"435ca-axYlJUxq0dxVUcdPGXfx7jIjOqI\"",
    "mtime": "2026-07-31T08:53:57.969Z",
    "size": 275914,
    "path": "../public/coach-media/animations/surprise/surprise4.webp"
  },
  "/coach-media/animations/surprise/surprise41.webp": {
    "type": "image/webp",
    "etag": "\"a8cc-eJpn1iM/G93mG/y3J7MYZxb5oZk\"",
    "mtime": "2026-07-31T08:53:57.969Z",
    "size": 43212,
    "path": "../public/coach-media/animations/surprise/surprise41.webp"
  },
  "/coach-media/animations/surprise/surprise40.webp": {
    "type": "image/webp",
    "etag": "\"39564-nIAqPe45sz0KpkAx2CKOstSaCTA\"",
    "mtime": "2026-07-31T08:53:57.971Z",
    "size": 234852,
    "path": "../public/coach-media/animations/surprise/surprise40.webp"
  },
  "/coach-media/animations/surprise/surprise42.webp": {
    "type": "image/webp",
    "etag": "\"646bc-7+aKS5sl1K5hY8UDNYAFM4lfo6Y\"",
    "mtime": "2026-07-31T08:53:57.970Z",
    "size": 411324,
    "path": "../public/coach-media/animations/surprise/surprise42.webp"
  },
  "/coach-media/animations/surprise/surprise43.webp": {
    "type": "image/webp",
    "etag": "\"4b24-EbrAgTKhgJEIluaU9wK/fZsqFQI\"",
    "mtime": "2026-07-31T08:53:57.969Z",
    "size": 19236,
    "path": "../public/coach-media/animations/surprise/surprise43.webp"
  },
  "/coach-media/animations/surprise/surprise45.webp": {
    "type": "image/webp",
    "etag": "\"1a680-xKF6ecJOJz07Bq3nMYUvl7ZSmJo\"",
    "mtime": "2026-07-31T08:53:57.971Z",
    "size": 108160,
    "path": "../public/coach-media/animations/surprise/surprise45.webp"
  },
  "/coach-media/animations/surprise/surprise46.webp": {
    "type": "image/webp",
    "etag": "\"b624-UVBhSbU4BcnZsHBEFLk/NJkigMs\"",
    "mtime": "2026-07-31T08:53:57.970Z",
    "size": 46628,
    "path": "../public/coach-media/animations/surprise/surprise46.webp"
  },
  "/coach-media/animations/surprise/surprise33.webp": {
    "type": "image/webp",
    "etag": "\"1ff378-3ceZyeJGfgZwkrgPrzBv1AbDx9o\"",
    "mtime": "2026-07-31T08:53:57.969Z",
    "size": 2093944,
    "path": "../public/coach-media/animations/surprise/surprise33.webp"
  },
  "/coach-media/animations/surprise/surprise47.webp": {
    "type": "image/webp",
    "etag": "\"ed28-q4uXmQ440B/uZ44347cvninGGos\"",
    "mtime": "2026-07-31T08:53:57.970Z",
    "size": 60712,
    "path": "../public/coach-media/animations/surprise/surprise47.webp"
  },
  "/coach-media/animations/surprise/surprise48.webp": {
    "type": "image/webp",
    "etag": "\"132e0-ARE5bC0A3JVvXvF646DPkIObvBU\"",
    "mtime": "2026-07-31T08:53:57.971Z",
    "size": 78560,
    "path": "../public/coach-media/animations/surprise/surprise48.webp"
  },
  "/coach-media/animations/surprise/surprise49.webp": {
    "type": "image/webp",
    "etag": "\"25b6c-wCdzxaXfkdqyDcw6a8xy07JXmzE\"",
    "mtime": "2026-07-31T08:53:57.973Z",
    "size": 154476,
    "path": "../public/coach-media/animations/surprise/surprise49.webp"
  },
  "/coach-media/animations/surprise/surprise5.webp": {
    "type": "image/webp",
    "etag": "\"27cfa-OX0fnlOewddMbbATr6i9i2ynE3Y\"",
    "mtime": "2026-07-31T08:53:57.972Z",
    "size": 163066,
    "path": "../public/coach-media/animations/surprise/surprise5.webp"
  },
  "/coach-media/animations/surprise/surprise50.webp": {
    "type": "image/webp",
    "etag": "\"54ee6-utB6xrbIiRW/BR2zFsCbLOBuYQ0\"",
    "mtime": "2026-07-31T08:53:57.972Z",
    "size": 347878,
    "path": "../public/coach-media/animations/surprise/surprise50.webp"
  },
  "/coach-media/animations/surprise/surprise51.webp": {
    "type": "image/webp",
    "etag": "\"2227a-5yeomBh1J53C2OweVlrUJRsy7d0\"",
    "mtime": "2026-07-31T08:53:57.974Z",
    "size": 139898,
    "path": "../public/coach-media/animations/surprise/surprise51.webp"
  },
  "/coach-media/animations/surprise/surprise52.webp": {
    "type": "image/webp",
    "etag": "\"142aa-ez2zkO6VqB8WIkeukvxz7D7f1lU\"",
    "mtime": "2026-07-31T08:53:57.972Z",
    "size": 82602,
    "path": "../public/coach-media/animations/surprise/surprise52.webp"
  },
  "/coach-media/animations/surprise/surprise53.webp": {
    "type": "image/webp",
    "etag": "\"118e2-l9zmLQtW2P6gxSkdSTudjLq2c3Q\"",
    "mtime": "2026-07-31T08:53:57.972Z",
    "size": 71906,
    "path": "../public/coach-media/animations/surprise/surprise53.webp"
  },
  "/coach-media/animations/surprise/surprise54.webp": {
    "type": "image/webp",
    "etag": "\"1e178-jaNfsOInt+QvPbLkhzwWaJqG/Bs\"",
    "mtime": "2026-07-31T08:53:57.973Z",
    "size": 123256,
    "path": "../public/coach-media/animations/surprise/surprise54.webp"
  },
  "/coach-media/animations/surprise/surprise56.webp": {
    "type": "image/webp",
    "etag": "\"1b960-DZp5H8cTkUG7OqYKTKt0Wb41j6Y\"",
    "mtime": "2026-07-31T08:53:57.982Z",
    "size": 112992,
    "path": "../public/coach-media/animations/surprise/surprise56.webp"
  },
  "/coach-media/animations/surprise/surprise44.webp": {
    "type": "image/webp",
    "etag": "\"a77fc-figlb0a9uvdibEtUPy5WQ390cJ0\"",
    "mtime": "2026-07-31T08:53:57.971Z",
    "size": 686076,
    "path": "../public/coach-media/animations/surprise/surprise44.webp"
  },
  "/coach-media/animations/surprise/surprise55.webp": {
    "type": "image/webp",
    "etag": "\"5a896-O68fUxVUguZ0BzBxfGlXQFyP0DA\"",
    "mtime": "2026-07-31T08:53:57.976Z",
    "size": 370838,
    "path": "../public/coach-media/animations/surprise/surprise55.webp"
  },
  "/coach-media/animations/surprise/surprise57.webp": {
    "type": "image/webp",
    "etag": "\"44ab8-mSBT2ojhhuQLKvtVbnLyoP47hJY\"",
    "mtime": "2026-07-31T08:53:57.980Z",
    "size": 281272,
    "path": "../public/coach-media/animations/surprise/surprise57.webp"
  },
  "/coach-media/animations/surprise/surprise58.webp": {
    "type": "image/webp",
    "etag": "\"21a8a-Yf9qQLhbyXuD9/JZ+89b4mvgAKw\"",
    "mtime": "2026-07-31T08:53:57.979Z",
    "size": 137866,
    "path": "../public/coach-media/animations/surprise/surprise58.webp"
  },
  "/coach-media/animations/surprise/surprise59.webp": {
    "type": "image/webp",
    "etag": "\"ad24-FgC+hvDgvud9BCFGf28pvxl71oQ\"",
    "mtime": "2026-07-31T08:53:57.980Z",
    "size": 44324,
    "path": "../public/coach-media/animations/surprise/surprise59.webp"
  },
  "/coach-media/animations/surprise/surprise6.webp": {
    "type": "image/webp",
    "etag": "\"efbe-4a9rtfMIdF2+TFeY3gBQcGq2OOY\"",
    "mtime": "2026-07-31T08:53:57.973Z",
    "size": 61374,
    "path": "../public/coach-media/animations/surprise/surprise6.webp"
  },
  "/coach-media/animations/surprise/surprise61.webp": {
    "type": "image/webp",
    "etag": "\"12cd0-q0YDo94p3qYkje+5yt5zOubu2/Q\"",
    "mtime": "2026-07-31T08:53:57.979Z",
    "size": 77008,
    "path": "../public/coach-media/animations/surprise/surprise61.webp"
  },
  "/coach-media/animations/surprise/surprise60.webp": {
    "type": "image/webp",
    "etag": "\"4b7a6-epNKh/4axQkdUr59kQLtvLuUWxk\"",
    "mtime": "2026-07-31T08:53:57.980Z",
    "size": 309158,
    "path": "../public/coach-media/animations/surprise/surprise60.webp"
  },
  "/coach-media/animations/surprise/surprise62.webp": {
    "type": "image/webp",
    "etag": "\"1c6a0-mXpnKRv+Hz25jP09BjR4foiD6qw\"",
    "mtime": "2026-07-31T08:53:57.981Z",
    "size": 116384,
    "path": "../public/coach-media/animations/surprise/surprise62.webp"
  },
  "/coach-media/animations/surprise/surprise63.webp": {
    "type": "image/webp",
    "etag": "\"1eeba-iqr/NnLNgmJCGHzVJ166UGdRB4Q\"",
    "mtime": "2026-07-31T08:53:57.980Z",
    "size": 126650,
    "path": "../public/coach-media/animations/surprise/surprise63.webp"
  },
  "/coach-media/animations/surprise/surprise7.webp": {
    "type": "image/webp",
    "etag": "\"28cf0-WZKrfZgxmWudkDiNqJ2t+yttmY4\"",
    "mtime": "2026-07-31T08:53:57.981Z",
    "size": 167152,
    "path": "../public/coach-media/animations/surprise/surprise7.webp"
  },
  "/coach-media/animations/surprise/surprise9.webp": {
    "type": "image/webp",
    "etag": "\"3567c-XTH6klwiC89h9A35OVWjuAEqJ5A\"",
    "mtime": "2026-07-31T08:53:57.980Z",
    "size": 218748,
    "path": "../public/coach-media/animations/surprise/surprise9.webp"
  },
  "/coach-media/emojis/heureux/heureux1.png": {
    "type": "image/png",
    "etag": "\"5091-+uAnUfC4q2tlld3BzD89z3lKd4w\"",
    "mtime": "2026-07-31T08:53:57.847Z",
    "size": 20625,
    "path": "../public/coach-media/emojis/heureux/heureux1.png"
  },
  "/coach-media/emojis/heureux/heureux10.png": {
    "type": "image/png",
    "etag": "\"5bbe-8dpJHwcxgGm/L+GGIgukoN99+qw\"",
    "mtime": "2026-07-31T08:53:57.953Z",
    "size": 23486,
    "path": "../public/coach-media/emojis/heureux/heureux10.png"
  },
  "/coach-media/emojis/heureux/heureux11.png": {
    "type": "image/png",
    "etag": "\"60b8-LMMAFjmB/Rwe+6qwtxB0KRRjFVE\"",
    "mtime": "2026-07-31T08:53:57.952Z",
    "size": 24760,
    "path": "../public/coach-media/emojis/heureux/heureux11.png"
  },
  "/coach-media/emojis/heureux/heureux12.png": {
    "type": "image/png",
    "etag": "\"79c6-gOXTGgNP0DRA6mU73TQkCLA2IZc\"",
    "mtime": "2026-07-31T08:53:57.953Z",
    "size": 31174,
    "path": "../public/coach-media/emojis/heureux/heureux12.png"
  },
  "/coach-media/emojis/heureux/heureux2.png": {
    "type": "image/png",
    "etag": "\"54c1-7stf5vr0fIsbVKX4y+9cXcdF6Mo\"",
    "mtime": "2026-07-31T08:53:57.953Z",
    "size": 21697,
    "path": "../public/coach-media/emojis/heureux/heureux2.png"
  },
  "/coach-media/emojis/heureux/heureux3.png": {
    "type": "image/png",
    "etag": "\"531f-VfeI7fmVy/9I1cJdA+JneCazNHU\"",
    "mtime": "2026-07-31T08:53:57.953Z",
    "size": 21279,
    "path": "../public/coach-media/emojis/heureux/heureux3.png"
  },
  "/coach-media/emojis/heureux/heureux4.png": {
    "type": "image/png",
    "etag": "\"5885-WkglwLUYH5ALdE1dXhy9hL4kIX4\"",
    "mtime": "2026-07-31T08:53:57.953Z",
    "size": 22661,
    "path": "../public/coach-media/emojis/heureux/heureux4.png"
  },
  "/coach-media/emojis/heureux/heureux5.png": {
    "type": "image/png",
    "etag": "\"5a47-dAmqVWfHl7YFERUDnBuBJDfdxvs\"",
    "mtime": "2026-07-31T08:53:57.953Z",
    "size": 23111,
    "path": "../public/coach-media/emojis/heureux/heureux5.png"
  },
  "/coach-media/emojis/heureux/heureux6.png": {
    "type": "image/png",
    "etag": "\"536f-MLOUAyVp0bZpHOQ61BWW10gqYAk\"",
    "mtime": "2026-07-31T08:53:57.953Z",
    "size": 21359,
    "path": "../public/coach-media/emojis/heureux/heureux6.png"
  },
  "/coach-media/emojis/heureux/heureux7.png": {
    "type": "image/png",
    "etag": "\"4c1e-5J3Hb2P7b9Dhw36q+lPFACHsBzo\"",
    "mtime": "2026-07-31T08:53:57.953Z",
    "size": 19486,
    "path": "../public/coach-media/emojis/heureux/heureux7.png"
  },
  "/coach-media/emojis/heureux/heureux8.png": {
    "type": "image/png",
    "etag": "\"4c3d-xFJiCChiW5P5PT3dzl6b9pdUZCU\"",
    "mtime": "2026-07-31T08:53:57.953Z",
    "size": 19517,
    "path": "../public/coach-media/emojis/heureux/heureux8.png"
  },
  "/coach-media/emojis/heureux/heureux9.png": {
    "type": "image/png",
    "etag": "\"53d1-nvrpEmDOGFDrOhR0CwIqhjydUqw\"",
    "mtime": "2026-07-31T08:53:57.954Z",
    "size": 21457,
    "path": "../public/coach-media/emojis/heureux/heureux9.png"
  },
  "/coach-media/animations/happy/happy10.webp": {
    "type": "image/webp",
    "etag": "\"13102-1AwfKNNogN0hV9N7INQr8b/L5U0\"",
    "mtime": "2026-07-31T08:53:57.981Z",
    "size": 78082,
    "path": "../public/coach-media/animations/happy/happy10.webp"
  },
  "/coach-media/animations/happy/happy11.webp": {
    "type": "image/webp",
    "etag": "\"c51c-aSSJ/YerC2d+QHIzkxapjUKX1xo\"",
    "mtime": "2026-07-31T08:53:57.982Z",
    "size": 50460,
    "path": "../public/coach-media/animations/happy/happy11.webp"
  },
  "/coach-media/animations/happy/happy12.webp": {
    "type": "image/webp",
    "etag": "\"26dd0-kEufqOKIIc4EphkqsilP8Vg0anA\"",
    "mtime": "2026-07-31T08:53:57.982Z",
    "size": 159184,
    "path": "../public/coach-media/animations/happy/happy12.webp"
  },
  "/coach-media/animations/happy/happy13.webp": {
    "type": "image/webp",
    "etag": "\"1b7c8-6YwhPgMDDi09N6QaiQGvB3MESN8\"",
    "mtime": "2026-07-31T08:53:57.982Z",
    "size": 112584,
    "path": "../public/coach-media/animations/happy/happy13.webp"
  },
  "/coach-media/animations/happy/happy1.webp": {
    "type": "image/webp",
    "etag": "\"9a9fe-dnJ60THXbLE/qdsCoy8mks8JEWo\"",
    "mtime": "2026-07-31T08:53:57.857Z",
    "size": 633342,
    "path": "../public/coach-media/animations/happy/happy1.webp"
  },
  "/coach-media/animations/happy/happy14.webp": {
    "type": "image/webp",
    "etag": "\"2b5e-Tlk4vz7sMxW+TPrlh/TTUPVQZ64\"",
    "mtime": "2026-07-31T08:53:57.982Z",
    "size": 11102,
    "path": "../public/coach-media/animations/happy/happy14.webp"
  },
  "/coach-media/animations/happy/happy15.webp": {
    "type": "image/webp",
    "etag": "\"1f82e-GdfVpoK+FBOph2APqZZ2ksTEi/M\"",
    "mtime": "2026-07-31T08:53:57.984Z",
    "size": 129070,
    "path": "../public/coach-media/animations/happy/happy15.webp"
  },
  "/coach-media/animations/happy/happy16.webp": {
    "type": "image/webp",
    "etag": "\"39676-m3hlL8MEmfcM8A6RQ/d34G7k4z4\"",
    "mtime": "2026-07-31T08:53:57.982Z",
    "size": 235126,
    "path": "../public/coach-media/animations/happy/happy16.webp"
  },
  "/coach-media/animations/happy/happy17.webp": {
    "type": "image/webp",
    "etag": "\"6c236-lcuyQg6sSZcT0+fCpGNG/JhMi7U\"",
    "mtime": "2026-07-31T08:53:57.984Z",
    "size": 442934,
    "path": "../public/coach-media/animations/happy/happy17.webp"
  },
  "/coach-media/animations/happy/happy19.webp": {
    "type": "image/webp",
    "etag": "\"7340-Mvycs8QTkYX6zm7iIfL2nLfxOe8\"",
    "mtime": "2026-07-31T08:53:57.983Z",
    "size": 29504,
    "path": "../public/coach-media/animations/happy/happy19.webp"
  },
  "/coach-media/animations/happy/happy18.webp": {
    "type": "image/webp",
    "etag": "\"38cca-HDXyFn4nw7hhDQ0f8voh7jHxFIU\"",
    "mtime": "2026-07-31T08:53:57.983Z",
    "size": 232650,
    "path": "../public/coach-media/animations/happy/happy18.webp"
  },
  "/coach-media/animations/happy/happy2.webp": {
    "type": "image/webp",
    "etag": "\"1b638-CG1y3zibI0VpxAfTb3zZrzRaw90\"",
    "mtime": "2026-07-31T08:53:57.985Z",
    "size": 112184,
    "path": "../public/coach-media/animations/happy/happy2.webp"
  },
  "/coach-media/animations/happy/happy20.webp": {
    "type": "image/webp",
    "etag": "\"31eb2-eG0f1RbiJPRwmWx1p+zVbeej7Jo\"",
    "mtime": "2026-07-31T08:53:57.986Z",
    "size": 204466,
    "path": "../public/coach-media/animations/happy/happy20.webp"
  },
  "/coach-media/animations/happy/happy21.webp": {
    "type": "image/webp",
    "etag": "\"d20a-nJXSMlgY3QzHwwJw2j7rW4bD6HU\"",
    "mtime": "2026-07-31T08:53:57.983Z",
    "size": 53770,
    "path": "../public/coach-media/animations/happy/happy21.webp"
  },
  "/coach-media/animations/happy/happy23.webp": {
    "type": "image/webp",
    "etag": "\"e74a-F+BBio6AhOZ5hwHOGh8wKCLcoGA\"",
    "mtime": "2026-07-31T08:53:57.984Z",
    "size": 59210,
    "path": "../public/coach-media/animations/happy/happy23.webp"
  },
  "/coach-media/animations/happy/happy22.webp": {
    "type": "image/webp",
    "etag": "\"2be74-wts9jwpJqVDGud0ZifbURmTwf7g\"",
    "mtime": "2026-07-31T08:53:57.984Z",
    "size": 179828,
    "path": "../public/coach-media/animations/happy/happy22.webp"
  },
  "/coach-media/animations/happy/happy24.webp": {
    "type": "image/webp",
    "etag": "\"23e02-CIi7WeJXeH8cd/GgwMtt3CFFVkM\"",
    "mtime": "2026-07-31T08:53:57.985Z",
    "size": 146946,
    "path": "../public/coach-media/animations/happy/happy24.webp"
  },
  "/coach-media/animations/happy/happy25.webp": {
    "type": "image/webp",
    "etag": "\"16574-kubThW5vAMKccIZc2jswkTWLUoA\"",
    "mtime": "2026-07-31T08:53:57.985Z",
    "size": 91508,
    "path": "../public/coach-media/animations/happy/happy25.webp"
  },
  "/coach-media/animations/happy/happy27.webp": {
    "type": "image/webp",
    "etag": "\"1c662-1bbHXwmlK1/Q6duQFfbU/+Wg5Fg\"",
    "mtime": "2026-07-31T08:53:57.986Z",
    "size": 116322,
    "path": "../public/coach-media/animations/happy/happy27.webp"
  },
  "/coach-media/animations/happy/happy26.webp": {
    "type": "image/webp",
    "etag": "\"6c706-bOAKAMAiElDmC2MCxEJkrvr5A+k\"",
    "mtime": "2026-07-31T08:53:57.985Z",
    "size": 444166,
    "path": "../public/coach-media/animations/happy/happy26.webp"
  },
  "/coach-media/animations/happy/happy28.webp": {
    "type": "image/webp",
    "etag": "\"2090a-cfPB8KwXDFTC2iWhg6Pn7kOvGeg\"",
    "mtime": "2026-07-31T08:53:57.987Z",
    "size": 133386,
    "path": "../public/coach-media/animations/happy/happy28.webp"
  },
  "/coach-media/animations/happy/happy29.webp": {
    "type": "image/webp",
    "etag": "\"15a6e-F4FEHmzAIG7WW3pszvFsq0XKYGk\"",
    "mtime": "2026-07-31T08:53:57.986Z",
    "size": 88686,
    "path": "../public/coach-media/animations/happy/happy29.webp"
  },
  "/coach-media/animations/happy/happy30.webp": {
    "type": "image/webp",
    "etag": "\"46140-52DID+yWWHNDhSWo2wqCW7AgztI\"",
    "mtime": "2026-07-31T08:53:57.989Z",
    "size": 287040,
    "path": "../public/coach-media/animations/happy/happy30.webp"
  },
  "/coach-media/animations/happy/happy3.webp": {
    "type": "image/webp",
    "etag": "\"6438c-AQmLLI1sVtzVfySWLf8q8/SnoDQ\"",
    "mtime": "2026-07-31T08:53:57.987Z",
    "size": 410508,
    "path": "../public/coach-media/animations/happy/happy3.webp"
  },
  "/coach-media/animations/happy/happy31.webp": {
    "type": "image/webp",
    "etag": "\"4d6ca-GZQfzSkO4AbRu7KJoQWgnIw6U6k\"",
    "mtime": "2026-07-31T08:53:57.987Z",
    "size": 317130,
    "path": "../public/coach-media/animations/happy/happy31.webp"
  },
  "/coach-media/animations/happy/happy32.webp": {
    "type": "image/webp",
    "etag": "\"1ce94-qd5mvwxqL3x8atGLGoQ6T5SBIM8\"",
    "mtime": "2026-07-31T08:53:57.987Z",
    "size": 118420,
    "path": "../public/coach-media/animations/happy/happy32.webp"
  },
  "/coach-media/animations/happy/happy33.webp": {
    "type": "image/webp",
    "etag": "\"1ca8a-w5q1HyoRf3YSX2wny1ajxC1lVTw\"",
    "mtime": "2026-07-31T08:53:57.987Z",
    "size": 117386,
    "path": "../public/coach-media/animations/happy/happy33.webp"
  },
  "/coach-media/animations/happy/happy34.webp": {
    "type": "image/webp",
    "etag": "\"7a6e-N4lUoynD0pY1HrZqbhKsKEJcIdY\"",
    "mtime": "2026-07-31T08:53:57.987Z",
    "size": 31342,
    "path": "../public/coach-media/animations/happy/happy34.webp"
  },
  "/coach-media/animations/happy/happy35.webp": {
    "type": "image/webp",
    "etag": "\"27e2a-nINbfIIzpb0aB5cQDbxz/GDwNug\"",
    "mtime": "2026-07-31T08:53:57.988Z",
    "size": 163370,
    "path": "../public/coach-media/animations/happy/happy35.webp"
  },
  "/coach-media/animations/happy/happy36.webp": {
    "type": "image/webp",
    "etag": "\"1480e-iU7KcSbk60IXH4CWOzNyttBsbE0\"",
    "mtime": "2026-07-31T08:53:57.987Z",
    "size": 83982,
    "path": "../public/coach-media/animations/happy/happy36.webp"
  },
  "/coach-media/animations/happy/happy37.webp": {
    "type": "image/webp",
    "etag": "\"e17c-cpG9tAQA2HdkKWbtZensoAkI5NI\"",
    "mtime": "2026-07-31T08:53:57.988Z",
    "size": 57724,
    "path": "../public/coach-media/animations/happy/happy37.webp"
  },
  "/coach-media/animations/happy/happy38.webp": {
    "type": "image/webp",
    "etag": "\"20928-zE86yLQztSZEATTCxTKRuQFifnw\"",
    "mtime": "2026-07-31T08:53:57.988Z",
    "size": 133416,
    "path": "../public/coach-media/animations/happy/happy38.webp"
  },
  "/coach-media/animations/happy/happy39.webp": {
    "type": "image/webp",
    "etag": "\"1031c-0I4f6s3jDJrqeEDNAVBubusuRqQ\"",
    "mtime": "2026-07-31T08:53:57.988Z",
    "size": 66332,
    "path": "../public/coach-media/animations/happy/happy39.webp"
  },
  "/coach-media/animations/happy/happy4.webp": {
    "type": "image/webp",
    "etag": "\"80d8-WZGwWFCLsk3YDTm9XP5QCq8R7Es\"",
    "mtime": "2026-07-31T08:53:57.989Z",
    "size": 32984,
    "path": "../public/coach-media/animations/happy/happy4.webp"
  },
  "/coach-media/animations/happy/happy40.webp": {
    "type": "image/webp",
    "etag": "\"116ba-M7X1kM6tt7dIECx3koEGYbji1us\"",
    "mtime": "2026-07-31T08:53:57.989Z",
    "size": 71354,
    "path": "../public/coach-media/animations/happy/happy40.webp"
  },
  "/coach-media/animations/happy/happy41.webp": {
    "type": "image/webp",
    "etag": "\"a76a-Nmck64+pAP0tEnTHpG1mitI4ONk\"",
    "mtime": "2026-07-31T08:53:57.994Z",
    "size": 42858,
    "path": "../public/coach-media/animations/happy/happy41.webp"
  },
  "/coach-media/animations/happy/happy42.webp": {
    "type": "image/webp",
    "etag": "\"7eba-Xqry0H+Qj7x/M1eDmO0CIQ+A7Mg\"",
    "mtime": "2026-07-31T08:53:57.989Z",
    "size": 32442,
    "path": "../public/coach-media/animations/happy/happy42.webp"
  },
  "/coach-media/animations/happy/happy43.webp": {
    "type": "image/webp",
    "etag": "\"55a5e-kUYTswcDoeybUYnmGXDBV0ny564\"",
    "mtime": "2026-07-31T08:53:57.994Z",
    "size": 350814,
    "path": "../public/coach-media/animations/happy/happy43.webp"
  },
  "/coach-media/animations/happy/happy46.webp": {
    "type": "image/webp",
    "etag": "\"13dec-uj4sm+IwuLOmQY7lGy1JeMzt2FM\"",
    "mtime": "2026-07-31T08:53:57.995Z",
    "size": 81388,
    "path": "../public/coach-media/animations/happy/happy46.webp"
  },
  "/coach-media/animations/happy/happy44.webp": {
    "type": "image/webp",
    "etag": "\"24e16-Y7u+Md6oQPbYSDjE0D9H77j0Z5I\"",
    "mtime": "2026-07-31T08:53:57.989Z",
    "size": 151062,
    "path": "../public/coach-media/animations/happy/happy44.webp"
  },
  "/coach-media/animations/happy/happy45.webp": {
    "type": "image/webp",
    "etag": "\"65a82-XxALJISFlOUdD3wSziHwFXHhxqc\"",
    "mtime": "2026-07-31T08:53:57.994Z",
    "size": 416386,
    "path": "../public/coach-media/animations/happy/happy45.webp"
  },
  "/coach-media/animations/happy/happy47.webp": {
    "type": "image/webp",
    "etag": "\"234e4-DNBmLISLOFimd+G8XihNRgMsjGw\"",
    "mtime": "2026-07-31T08:53:57.991Z",
    "size": 144612,
    "path": "../public/coach-media/animations/happy/happy47.webp"
  },
  "/coach-media/animations/happy/happy49.webp": {
    "type": "image/webp",
    "etag": "\"3123c-mf62C2iWRtx585STd9CHbYmICyM\"",
    "mtime": "2026-07-31T08:53:57.994Z",
    "size": 201276,
    "path": "../public/coach-media/animations/happy/happy49.webp"
  },
  "/coach-media/animations/happy/happy5.webp": {
    "type": "image/webp",
    "etag": "\"10784-0Rzy5v92HqFbOQ0qn2Jo9XRJ1r0\"",
    "mtime": "2026-07-31T08:53:57.994Z",
    "size": 67460,
    "path": "../public/coach-media/animations/happy/happy5.webp"
  },
  "/coach-media/animations/happy/happy50.webp": {
    "type": "image/webp",
    "etag": "\"2b72a-Xz8Gb2Cdj+rrnnpbXbSGBQRTFYw\"",
    "mtime": "2026-07-31T08:53:57.995Z",
    "size": 177962,
    "path": "../public/coach-media/animations/happy/happy50.webp"
  },
  "/coach-media/animations/happy/happy51.webp": {
    "type": "image/webp",
    "etag": "\"29090-le1WcmrRN+RDX52joaRj6kdNQS0\"",
    "mtime": "2026-07-31T08:53:57.995Z",
    "size": 168080,
    "path": "../public/coach-media/animations/happy/happy51.webp"
  },
  "/coach-media/animations/happy/happy53.webp": {
    "type": "image/webp",
    "etag": "\"57d0-WEnplvWuFKWqXkfuwNFuk472muo\"",
    "mtime": "2026-07-31T08:53:57.996Z",
    "size": 22480,
    "path": "../public/coach-media/animations/happy/happy53.webp"
  },
  "/coach-media/animations/happy/happy52.webp": {
    "type": "image/webp",
    "etag": "\"4a9b0-bNgmWpmTSjuc06DQcbX6RkVvCnU\"",
    "mtime": "2026-07-31T08:53:57.996Z",
    "size": 305584,
    "path": "../public/coach-media/animations/happy/happy52.webp"
  },
  "/coach-media/animations/happy/happy54.webp": {
    "type": "image/webp",
    "etag": "\"de70-7JEgp30lMgh1RT82Z43BnbOPyME\"",
    "mtime": "2026-07-31T08:53:57.995Z",
    "size": 56944,
    "path": "../public/coach-media/animations/happy/happy54.webp"
  },
  "/coach-media/animations/happy/happy55.webp": {
    "type": "image/webp",
    "etag": "\"4b40a-Dq55EPJ++rGpcOm3dfVMczMYPaI\"",
    "mtime": "2026-07-31T08:53:58.000Z",
    "size": 308234,
    "path": "../public/coach-media/animations/happy/happy55.webp"
  },
  "/coach-media/animations/happy/happy56.webp": {
    "type": "image/webp",
    "etag": "\"7ec86-JO0Q1vC7rgTxvmuYQZ3337jzHAM\"",
    "mtime": "2026-07-31T08:53:58.000Z",
    "size": 519302,
    "path": "../public/coach-media/animations/happy/happy56.webp"
  },
  "/coach-media/animations/happy/happy48.webp": {
    "type": "image/webp",
    "etag": "\"8a5a0-gFczO6H6/tjC5WfcMHBF/H3NWBc\"",
    "mtime": "2026-07-31T08:53:57.994Z",
    "size": 566688,
    "path": "../public/coach-media/animations/happy/happy48.webp"
  },
  "/coach-media/animations/happy/happy57.webp": {
    "type": "image/webp",
    "etag": "\"74f88-eEN2CyUJ9rLsRvqY7OzSZS3p2IU\"",
    "mtime": "2026-07-31T08:53:57.996Z",
    "size": 479112,
    "path": "../public/coach-media/animations/happy/happy57.webp"
  },
  "/coach-media/animations/happy/happy58.webp": {
    "type": "image/webp",
    "etag": "\"695d4-fo3c1QhJVPT0yXYAuoQyAXrIO9E\"",
    "mtime": "2026-07-31T08:53:58.000Z",
    "size": 431572,
    "path": "../public/coach-media/animations/happy/happy58.webp"
  },
  "/coach-media/animations/happy/happy59.webp": {
    "type": "image/webp",
    "etag": "\"e290-fQb7JlOst9pysXxzv35HJTcHlpE\"",
    "mtime": "2026-07-31T08:53:58.003Z",
    "size": 58000,
    "path": "../public/coach-media/animations/happy/happy59.webp"
  },
  "/coach-media/animations/happy/happy6.webp": {
    "type": "image/webp",
    "etag": "\"2f8ce-NjZdr7Vin1NbHT+GFgWzMwsZeZE\"",
    "mtime": "2026-07-31T08:53:57.996Z",
    "size": 194766,
    "path": "../public/coach-media/animations/happy/happy6.webp"
  },
  "/coach-media/animations/happy/happy61.webp": {
    "type": "image/webp",
    "etag": "\"253e8-1Fqod1LG1PZNTdmri6v0gPMthaE\"",
    "mtime": "2026-07-31T08:53:57.998Z",
    "size": 152552,
    "path": "../public/coach-media/animations/happy/happy61.webp"
  },
  "/coach-media/animations/happy/happy62.webp": {
    "type": "image/webp",
    "etag": "\"4f8f8-tLTO1/dtiZumcCPIDjxNhkIrS9g\"",
    "mtime": "2026-07-31T08:53:58.002Z",
    "size": 325880,
    "path": "../public/coach-media/animations/happy/happy62.webp"
  },
  "/coach-media/animations/happy/happy63.webp": {
    "type": "image/webp",
    "etag": "\"2b52a-B18WnXoFNFEoRmRiTpAPD0Xw4fA\"",
    "mtime": "2026-07-31T08:53:58.000Z",
    "size": 177450,
    "path": "../public/coach-media/animations/happy/happy63.webp"
  },
  "/coach-media/animations/happy/happy65.webp": {
    "type": "image/webp",
    "etag": "\"153e2-1MrE6YaWW1bqq3uRkAG3roDYdbI\"",
    "mtime": "2026-07-31T08:53:58.002Z",
    "size": 87010,
    "path": "../public/coach-media/animations/happy/happy65.webp"
  },
  "/coach-media/animations/happy/happy66.webp": {
    "type": "image/webp",
    "etag": "\"5aac0-EL5Dnfs0ZHXfZ2nFXHuqusIiA6U\"",
    "mtime": "2026-07-31T08:53:58.003Z",
    "size": 371392,
    "path": "../public/coach-media/animations/happy/happy66.webp"
  },
  "/coach-media/animations/happy/happy67.webp": {
    "type": "image/webp",
    "etag": "\"26842-Ttlq6ska7bBpzXjvIXLqSUaPnIk\"",
    "mtime": "2026-07-31T08:53:58.002Z",
    "size": 157762,
    "path": "../public/coach-media/animations/happy/happy67.webp"
  },
  "/coach-media/animations/happy/happy69.webp": {
    "type": "image/webp",
    "etag": "\"1843a-+cJ0+7F0PNcalsjHJcXNkw7qRDw\"",
    "mtime": "2026-07-31T08:53:58.003Z",
    "size": 99386,
    "path": "../public/coach-media/animations/happy/happy69.webp"
  },
  "/coach-media/animations/happy/happy68.webp": {
    "type": "image/webp",
    "etag": "\"3a9f6-uXcrvu87C4tyxdUD8qy84likyxA\"",
    "mtime": "2026-07-31T08:53:58.002Z",
    "size": 240118,
    "path": "../public/coach-media/animations/happy/happy68.webp"
  },
  "/coach-media/animations/happy/happy7.webp": {
    "type": "image/webp",
    "etag": "\"6dbe6-GIqYtKyf033a2vAUrfvCUdyYOmE\"",
    "mtime": "2026-07-31T08:53:58.009Z",
    "size": 449510,
    "path": "../public/coach-media/animations/happy/happy7.webp"
  },
  "/coach-media/animations/happy/happy71.webp": {
    "type": "image/webp",
    "etag": "\"12890-iDkXNnqbnihYZd5fm+x9SogtFL0\"",
    "mtime": "2026-07-31T08:53:58.002Z",
    "size": 75920,
    "path": "../public/coach-media/animations/happy/happy71.webp"
  },
  "/coach-media/animations/happy/happy72.webp": {
    "type": "image/webp",
    "etag": "\"1132e-N279XcIE77SVgWI5RK4HGZTKNNQ\"",
    "mtime": "2026-07-31T08:53:58.002Z",
    "size": 70446,
    "path": "../public/coach-media/animations/happy/happy72.webp"
  },
  "/coach-media/animations/happy/happy64.webp": {
    "type": "image/webp",
    "etag": "\"8b070-7oC7TYj4LIldWg1605cOC8gYl+w\"",
    "mtime": "2026-07-31T08:53:58.003Z",
    "size": 569456,
    "path": "../public/coach-media/animations/happy/happy64.webp"
  },
  "/coach-media/animations/happy/happy73.webp": {
    "type": "image/webp",
    "etag": "\"12dd8-PuAHZqC2ZtYnGQM/yt5HL7w8Z5w\"",
    "mtime": "2026-07-31T08:53:58.006Z",
    "size": 77272,
    "path": "../public/coach-media/animations/happy/happy73.webp"
  },
  "/coach-media/animations/happy/happy75.webp": {
    "type": "image/webp",
    "etag": "\"1cfd0-9c+pPyscG4ipyzhzbN//E8mdshQ\"",
    "mtime": "2026-07-31T08:53:58.009Z",
    "size": 118736,
    "path": "../public/coach-media/animations/happy/happy75.webp"
  },
  "/coach-media/animations/happy/happy74.webp": {
    "type": "image/webp",
    "etag": "\"5deae-Nnfy+JPdNa90X/TKIQJKDHXtEDg\"",
    "mtime": "2026-07-31T08:53:58.009Z",
    "size": 384686,
    "path": "../public/coach-media/animations/happy/happy74.webp"
  },
  "/coach-media/animations/happy/happy76.webp": {
    "type": "image/webp",
    "etag": "\"14a9e-d6rGydXTPMji/MdwYzCalRd2xW0\"",
    "mtime": "2026-07-31T08:53:58.007Z",
    "size": 84638,
    "path": "../public/coach-media/animations/happy/happy76.webp"
  },
  "/coach-media/animations/happy/happy77.webp": {
    "type": "image/webp",
    "etag": "\"1e10a-1aPPim9G6xum8/Hs8Ro6u3VlG6U\"",
    "mtime": "2026-07-31T08:53:58.006Z",
    "size": 123146,
    "path": "../public/coach-media/animations/happy/happy77.webp"
  },
  "/coach-media/animations/happy/happy78.webp": {
    "type": "image/webp",
    "etag": "\"17ba4-3h26xVZZTGib30A7sQhqoYBlgqs\"",
    "mtime": "2026-07-31T08:53:58.009Z",
    "size": 97188,
    "path": "../public/coach-media/animations/happy/happy78.webp"
  },
  "/coach-media/animations/happy/happy79.webp": {
    "type": "image/webp",
    "etag": "\"e17c-cpG9tAQA2HdkKWbtZensoAkI5NI\"",
    "mtime": "2026-07-31T08:53:58.010Z",
    "size": 57724,
    "path": "../public/coach-media/animations/happy/happy79.webp"
  },
  "/coach-media/animations/happy/happy70.webp": {
    "type": "image/webp",
    "etag": "\"813fc-MRr6jjBP9Dwv9BEsHOHSRAaT2vg\"",
    "mtime": "2026-07-31T08:53:58.007Z",
    "size": 529404,
    "path": "../public/coach-media/animations/happy/happy70.webp"
  },
  "/coach-media/animations/happy/happy8.webp": {
    "type": "image/webp",
    "etag": "\"9d5e-zP9Tu9ncCFIvZEyvVyuhVBachAE\"",
    "mtime": "2026-07-31T08:53:58.010Z",
    "size": 40286,
    "path": "../public/coach-media/animations/happy/happy8.webp"
  },
  "/coach-media/animations/happy/happy80.webp": {
    "type": "image/webp",
    "etag": "\"1da90-C0sljbqRem33mzQhLpalQ7JqSpU\"",
    "mtime": "2026-07-31T08:53:58.009Z",
    "size": 121488,
    "path": "../public/coach-media/animations/happy/happy80.webp"
  },
  "/coach-media/animations/happy/happy60.webp": {
    "type": "image/webp",
    "etag": "\"1e7f54-IoOugN/ir+60blKcpy6Kl2RuTBI\"",
    "mtime": "2026-07-31T08:53:58.001Z",
    "size": 1998676,
    "path": "../public/coach-media/animations/happy/happy60.webp"
  },
  "/coach-media/animations/happy/happy82.webp": {
    "type": "image/webp",
    "etag": "\"f1a4-tNEKunf3T9spLovIQWFozZvffw4\"",
    "mtime": "2026-07-31T08:53:58.011Z",
    "size": 61860,
    "path": "../public/coach-media/animations/happy/happy82.webp"
  },
  "/coach-media/animations/happy/happy83.webp": {
    "type": "image/webp",
    "etag": "\"2fe42-Kmm0KGXV1dEPQbjoM5G8BWcNWBM\"",
    "mtime": "2026-07-31T08:53:58.013Z",
    "size": 196162,
    "path": "../public/coach-media/animations/happy/happy83.webp"
  },
  "/coach-media/animations/happy/happy84.webp": {
    "type": "image/webp",
    "etag": "\"7b984-0wPlyvPIzXRP9eIMHgiBJFl+27A\"",
    "mtime": "2026-07-31T08:53:58.014Z",
    "size": 506244,
    "path": "../public/coach-media/animations/happy/happy84.webp"
  },
  "/coach-media/animations/happy/happy85.webp": {
    "type": "image/webp",
    "etag": "\"150ae-QMfLvsJpp/BJuZy4OwOXUD8OYUQ\"",
    "mtime": "2026-07-31T08:53:58.010Z",
    "size": 86190,
    "path": "../public/coach-media/animations/happy/happy85.webp"
  },
  "/coach-media/animations/happy/happy81.webp": {
    "type": "image/webp",
    "etag": "\"8a5a0-gFczO6H6/tjC5WfcMHBF/H3NWBc\"",
    "mtime": "2026-07-31T08:53:58.013Z",
    "size": 566688,
    "path": "../public/coach-media/animations/happy/happy81.webp"
  },
  "/coach-media/animations/happy/happy86.webp": {
    "type": "image/webp",
    "etag": "\"d7f8-QCvUvt2Z0TOPZeSr+n8EKTRxFUo\"",
    "mtime": "2026-07-31T08:53:58.010Z",
    "size": 55288,
    "path": "../public/coach-media/animations/happy/happy86.webp"
  },
  "/coach-media/animations/happy/happy87.webp": {
    "type": "image/webp",
    "etag": "\"17dec-6w/mkYwGAw5T0lZlhGXtO5BcsZU\"",
    "mtime": "2026-07-31T08:53:58.011Z",
    "size": 97772,
    "path": "../public/coach-media/animations/happy/happy87.webp"
  },
  "/coach-media/animations/happy/happy89.webp": {
    "type": "image/webp",
    "etag": "\"1c7e2-sUSfie0YAo/54wJ6tzJq/DwQ0Uw\"",
    "mtime": "2026-07-31T08:53:58.014Z",
    "size": 116706,
    "path": "../public/coach-media/animations/happy/happy89.webp"
  },
  "/coach-media/animations/happy/happy88.webp": {
    "type": "image/webp",
    "etag": "\"10722-eVPV4BPr+xXKB/m7b01HTc3BYvY\"",
    "mtime": "2026-07-31T08:53:58.013Z",
    "size": 67362,
    "path": "../public/coach-media/animations/happy/happy88.webp"
  },
  "/coach-media/animations/happy/happy90.webp": {
    "type": "image/webp",
    "etag": "\"40b96-2KBRO6W19pvILapZ8+Vi3lurBCw\"",
    "mtime": "2026-07-31T08:53:58.013Z",
    "size": 265110,
    "path": "../public/coach-media/animations/happy/happy90.webp"
  },
  "/coach-media/animations/happy/happy9.webp": {
    "type": "image/webp",
    "etag": "\"48688-/orx463Bv1qJxQ1v4poLAvBrNjI\"",
    "mtime": "2026-07-31T08:53:58.013Z",
    "size": 296584,
    "path": "../public/coach-media/animations/happy/happy9.webp"
  },
  "/coach-media/animations/happy/happy91.webp": {
    "type": "image/webp",
    "etag": "\"162e4-8HqkqL71/r+QJURh8ZbqNFMM6ZE\"",
    "mtime": "2026-07-31T08:53:58.015Z",
    "size": 90852,
    "path": "../public/coach-media/animations/happy/happy91.webp"
  },
  "/coach-media/animations/happy/happy92.webp": {
    "type": "image/webp",
    "etag": "\"1eb3c-dpJ07uxpsVOLdaMyS3SOlqMT6/k\"",
    "mtime": "2026-07-31T08:53:58.015Z",
    "size": 125756,
    "path": "../public/coach-media/animations/happy/happy92.webp"
  },
  "/coach-media/emojis/muet/muet1.png": {
    "type": "image/png",
    "etag": "\"51a6-vln2s/UdhcTRTaO8VHDa3lfz0h8\"",
    "mtime": "2026-07-31T08:53:57.980Z",
    "size": 20902,
    "path": "../public/coach-media/emojis/muet/muet1.png"
  },
  "/coach-media/emojis/muet/muet2.png": {
    "type": "image/png",
    "etag": "\"4fd6-7oBC0gGyTBoUjDE6sag9tGTRXEk\"",
    "mtime": "2026-07-31T08:53:57.854Z",
    "size": 20438,
    "path": "../public/coach-media/emojis/muet/muet2.png"
  },
  "/coach-media/emojis/muet/muet3.png": {
    "type": "image/png",
    "etag": "\"5287-ywn34jaL1+x0Qfo7jSf48qjMhfs\"",
    "mtime": "2026-07-31T08:53:57.980Z",
    "size": 21127,
    "path": "../public/coach-media/emojis/muet/muet3.png"
  },
  "/coach-media/emojis/muet/muet4.png": {
    "type": "image/png",
    "etag": "\"56a5-+3X/CcPHmEJ0+beAZBYg2M7ZSgA\"",
    "mtime": "2026-07-31T08:53:57.981Z",
    "size": 22181,
    "path": "../public/coach-media/emojis/muet/muet4.png"
  },
  "/coach-media/emojis/triste/triste1.png": {
    "type": "image/png",
    "etag": "\"4ad5-sZv/ngDIpKluR3uoIL+9/tVgBAk\"",
    "mtime": "2026-07-31T08:53:57.854Z",
    "size": 19157,
    "path": "../public/coach-media/emojis/triste/triste1.png"
  },
  "/coach-media/emojis/triste/triste10.png": {
    "type": "image/png",
    "etag": "\"6ad7-6iFb9ksjGHu03kWI85GQAULPlgA\"",
    "mtime": "2026-07-31T08:53:58.014Z",
    "size": 27351,
    "path": "../public/coach-media/emojis/triste/triste10.png"
  },
  "/coach-media/emojis/triste/triste11.png": {
    "type": "image/png",
    "etag": "\"7b07-5Y/2vAUDwkCG9yUv2xhGyKhfVv4\"",
    "mtime": "2026-07-31T08:53:58.014Z",
    "size": 31495,
    "path": "../public/coach-media/emojis/triste/triste11.png"
  },
  "/coach-media/emojis/triste/triste4.png": {
    "type": "image/png",
    "etag": "\"51ea-mZrIfYhaUQQDvlUt7+NCSIE6cfI\"",
    "mtime": "2026-07-31T08:53:58.014Z",
    "size": 20970,
    "path": "../public/coach-media/emojis/triste/triste4.png"
  },
  "/coach-media/emojis/triste/triste5.png": {
    "type": "image/png",
    "etag": "\"54c1-XD0mhNmrQPVAFqEXG0C1s1P3Oa4\"",
    "mtime": "2026-07-31T08:53:58.014Z",
    "size": 21697,
    "path": "../public/coach-media/emojis/triste/triste5.png"
  },
  "/coach-media/emojis/triste/triste6.png": {
    "type": "image/png",
    "etag": "\"54c1-XD0mhNmrQPVAFqEXG0C1s1P3Oa4\"",
    "mtime": "2026-07-31T08:53:58.014Z",
    "size": 21697,
    "path": "../public/coach-media/emojis/triste/triste6.png"
  },
  "/coach-media/emojis/triste/triste7.png": {
    "type": "image/png",
    "etag": "\"4663-GYg5O4kBtQpnNYQYt+t2VyLkYuE\"",
    "mtime": "2026-07-31T08:53:58.015Z",
    "size": 18019,
    "path": "../public/coach-media/emojis/triste/triste7.png"
  },
  "/coach-media/emojis/triste/triste8.png": {
    "type": "image/png",
    "etag": "\"5281-YyJBOzW/kpn0XNWvaoOHWcnQ+0k\"",
    "mtime": "2026-07-31T08:53:58.014Z",
    "size": 21121,
    "path": "../public/coach-media/emojis/triste/triste8.png"
  },
  "/coach-media/emojis/triste/triste9.png": {
    "type": "image/png",
    "etag": "\"56b5-7e4ksvafotKRdiRp4CmrqGW7UkM\"",
    "mtime": "2026-07-31T08:53:58.014Z",
    "size": 22197,
    "path": "../public/coach-media/emojis/triste/triste9.png"
  },
  "/_nuxt/builds/meta/ea9928ba-527d-4076-8972-0b31aed34e6f.json": {
    "type": "application/json",
    "etag": "\"58-jmYwNwCDFrk2dl9F0ahQeXvYlhs\"",
    "mtime": "2026-07-31T08:53:57.804Z",
    "size": 88,
    "path": "../public/_nuxt/builds/meta/ea9928ba-527d-4076-8972-0b31aed34e6f.json"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1},"/_nuxt/":{"maxAge":31536000}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _zUOlpk = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({ statusCode: 404 });
    }
    return;
  }
  if (asset.encoding !== void 0) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const CATALOGUE_MUTATION_PREFIXES = [
  "/api/admin/verbes",
  "/api/admin/challenge-presets",
  "/api/admin/challenge-preset-categories"
];
const MUTATION_METHODS = /* @__PURE__ */ new Set(["POST", "PUT", "PATCH", "DELETE"]);
const _VQKqTk = defineEventHandler((event) => {
  if (!MUTATION_METHODS.has(event.method.toUpperCase())) return;
  const path = event.path.split("?")[0] || "/";
  if (!CATALOGUE_MUTATION_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return;
  event.node.res.once("finish", () => {
    if (event.node.res.statusCode < 200 || event.node.res.statusCode >= 400) return;
    void Promise.resolve().then(function () { return catalogue; }).then(({ invalidateCatalogueCache }) => {
      invalidateCatalogueCache();
    });
  });
});

const UNSAFE_METHODS = /* @__PURE__ */ new Set(["POST", "PUT", "PATCH", "DELETE"]);
function isProtectedMutation(path, method) {
  if (!UNSAFE_METHODS.has(method.toUpperCase())) return false;
  return path === "/api/auth/login" || path === "/api/auth/logout" || path === "/api/learner" || path.startsWith("/api/learner/") || path === "/api/admin" || path.startsWith("/api/admin/");
}
function assertSameOrigin(event) {
  const origin = getHeader(event, "origin");
  const expectedOrigin = getRequestURL(event, {
    xForwardedHost: true,
    xForwardedProto: true
  }).origin;
  if (!origin) {
    throw createError$1({ statusCode: 403, statusMessage: "Origine de la requ\xEAte manquante" });
  }
  try {
    if (new URL(origin).origin !== expectedOrigin) {
      throw createError$1({ statusCode: 403, statusMessage: "Origine de la requ\xEAte refus\xE9e" });
    }
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;
    throw createError$1({ statusCode: 403, statusMessage: "Origine de la requ\xEAte invalide" });
  }
}
const _Hy8sLX = defineEventHandler((event) => {
  const path = event.path.split("?")[0] || "/";
  const scriptNonce = randomBytes(18).toString("base64url");
  event.context.cspNonce = scriptNonce;
  const contentSecurityPolicy = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'self' blob: https://challenges.cloudflare.com",
    "object-src 'none'",
    `script-src 'self' 'nonce-${scriptNonce}' https://www.googletagmanager.com https://challenges.cloudflare.com`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://www.google-analytics.com https://*.google-analytics.com",
    "font-src 'self' data:",
    "media-src 'self' blob:",
    "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://challenges.cloudflare.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'"
  ].join("; ");
  setResponseHeaders(event, {
    "Content-Security-Policy": contentSecurityPolicy,
    "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY"
  });
  {
    setResponseHeader(event, "Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  if (path.startsWith("/api/admin") || path.startsWith("/api/auth/") || path.startsWith("/api/learner/") || /^\/(?:fr|de|en|it|es)\/admin(?:\/|$)/u.test(path) || /^\/(?:fr|de|en|it|es)\/(?:signin|my-page)$/u.test(path) || path === "/admin" || path.startsWith("/admin/")) {
    setResponseHeader(event, "Cache-Control", "no-store, private");
  }
  if (isProtectedMutation(path, event.method)) assertSameOrigin(event);
});

const _SxA8c9 = defineEventHandler(() => {});

const _lazy_FrjBIN = () => import('../routes/api/admin/admins/_id_.delete.mjs');
const _lazy_nmAUbf = () => import('../routes/api/admin/admins/_id_.put.mjs');
const _lazy_LYK4qu = () => import('../routes/api/admin/index.get.mjs');
const _lazy_lncNYX = () => import('../routes/api/admin/index.post.mjs');
const _lazy_tlntNH = () => import('../routes/api/admin/analytics-usage.get.mjs');
const _lazy_AXRfsL = () => import('../routes/api/admin/analytics-users.get.mjs');
const _lazy_Haqmef = () => import('../routes/api/admin/analytics.get.mjs');
const _lazy_Feou3T = () => import('../routes/api/admin/challenge-preset-categories/_id_.delete.mjs');
const _lazy_qsRAnA = () => import('../routes/api/admin/challenge-preset-categories/_id_.put.mjs');
const _lazy_iGUuSi = () => import('../routes/api/admin/index2.post.mjs');
const _lazy_vHbftk = () => import('../routes/api/admin/challenge-preset-categories/reorder.put.mjs');
const _lazy_JkIfL6 = () => import('../routes/api/admin/challenge-presets/_id_.delete.mjs');
const _lazy_jQYunH = () => import('../routes/api/admin/challenge-presets/_id_.put.mjs');
const _lazy_dwuZ6z = () => import('../routes/api/admin/index2.get.mjs');
const _lazy_S4QTtl = () => import('../routes/api/admin/index3.post.mjs');
const _lazy_YFy3TG = () => import('../routes/api/admin/challenge-presets/reorder.put.mjs');
const _lazy_MRu6D5 = () => import('../routes/api/admin/city-locations.post.mjs');
const _lazy_BBtDg5 = () => import('../routes/api/admin/coach-characters/_id_.delete.mjs').then(function (n) { return n._; });
const _lazy_A8QwIA = () => import('../routes/api/admin/coach-characters/_id_.put.mjs').then(function (n) { return n._; });
const _lazy_OGPqU9 = () => import('../routes/api/admin/coach-caracteres/_id/audit-cases.get.mjs');
const _lazy_AvD0co = () => import('../routes/api/admin/coach-characters/_id/permanent.delete.mjs').then(function (n) { return n.p; });
const _lazy_W3tfPx = () => import('../routes/api/admin/index3.get.mjs');
const _lazy_1OeX2b = () => import('../routes/api/admin/index4.post.mjs').then(function (n) { return n.i; });
const _lazy_HVz2LF = () => import('../routes/api/admin/coach-characters/_id_.delete.mjs').then(function (n) { return n.a; });
const _lazy_7O4iLa = () => import('../routes/api/admin/coach-characters/_id_.put.mjs').then(function (n) { return n.a; });
const _lazy__mhW4G = () => import('../routes/api/admin/coach-characters/_id/permanent.delete.mjs').then(function (n) { return n.a; });
const _lazy_B0RRlQ = () => import('../routes/api/admin/index4.get.mjs');
const _lazy_NAOXUG = () => import('../routes/api/admin/index4.post.mjs').then(function (n) { return n.a; });
const _lazy_VXpT2u = () => import('../routes/api/admin/coach-help-approaches/_id_.delete.mjs');
const _lazy_hTzggQ = () => import('../routes/api/admin/coach-help-approaches/_id_.put.mjs');
const _lazy_zHB6GN = () => import('../routes/api/admin/index5.get.mjs');
const _lazy_ThoaOE = () => import('../routes/api/admin/index5.post.mjs');
const _lazy_kBGbMt = () => import('../routes/api/admin/coach-help-errors/export.get.mjs');
const _lazy_xvoGIX = () => import('../routes/api/admin/coach-help-feedbacks.get.mjs');
const _lazy_9LvES8 = () => import('../routes/api/admin/coach-help-feedbacks/_id_.put.mjs');
const _lazy_qZNZgY = () => import('../routes/api/admin/coach-help-feedbacks/export.get.mjs');
const _lazy_qACps0 = () => import('../routes/api/admin/coach-help-feedbacks/treated.delete.mjs');
const _lazy_wtEEuU = () => import('../routes/api/admin/coach-help-verb-reviews.get.mjs');
const _lazy_32s5gO = () => import('../routes/api/admin/coach-helps/_id_.delete.mjs');
const _lazy_svgYNM = () => import('../routes/api/admin/coach-helps/_id_.put.mjs');
const _lazy_Yre9hG = () => import('../routes/api/admin/coach-helps/_id/character.put.mjs').then(function (n) { return n.c; });
const _lazy_jmciZO = () => import('../routes/api/admin/coach-helps/_id/character.put.mjs').then(function (n) { return n.a; });
const _lazy_vZmY9_ = () => import('../routes/api/admin/index6.get.mjs');
const _lazy_vWaBfp = () => import('../routes/api/admin/index6.post.mjs');
const _lazy_kb3nRT = () => import('../routes/api/admin/coach-media/_id_.delete.mjs');
const _lazy_p5tZi1 = () => import('../routes/api/admin/coach-media/_id_.put.mjs');
const _lazy_FJ3hxo = () => import('../routes/api/admin/index7.get.mjs');
const _lazy_5VMpxX = () => import('../routes/api/admin/index7.post.mjs');
const _lazy_4icOIV = () => import('../routes/api/admin/coach-media/upload.post.mjs');
const _lazy_jZwS0v = () => import('../routes/api/admin/coaches/_id_.delete.mjs');
const _lazy_QCS3k9 = () => import('../routes/api/admin/coaches/_id_.put.mjs');
const _lazy_cJUfKz = () => import('../routes/api/admin/index8.get.mjs');
const _lazy_6hXaRh = () => import('../routes/api/admin/index8.post.mjs');
const _lazy_8lRq29 = () => import('../routes/api/admin/contact-settings.get.mjs');
const _lazy_H6EpZy = () => import('../routes/api/admin/contact-settings.put.mjs');
const _lazy_X9D0v5 = () => import('../routes/api/admin/defis/_code/permanent.put.mjs');
const _lazy_TdJp9W = () => import('../routes/api/admin/stats.get.mjs');
const _lazy_zP9Yux = () => import('../routes/api/admin/swiss-cantons.get.mjs');
const _lazy_tDxyoz = () => import('../routes/api/admin/swiss-city-cantons.post.mjs');
const _lazy_aLt4oJ = () => import('../routes/api/admin/index9.get.mjs');
const _lazy_lwNfKn = () => import('../routes/api/admin/tests/run.post.mjs');
const _lazy_FdWL78 = () => import('../routes/api/admin/index10.get.mjs');
const _lazy_zyStke = () => import('../routes/api/admin/verbes/_id_.get.mjs');
const _lazy_5hEsHe = () => import('../routes/api/admin/verbes/_id_.put.mjs');
const _lazy_cPi9jB = () => import('../routes/api/admin/verbes/_id/complements/_complementId_.delete.mjs');
const _lazy_xaLuFb = () => import('../routes/api/admin/verbes/_id/complements/_complementId_.patch.mjs');
const _lazy_tdjTHd = () => import('../routes/api/admin/verbes/_id/index.post.mjs');
const _lazy_oXwbR_ = () => import('../routes/api/admin/verbes/_id/constructions/_constructionId_.patch.mjs');
const _lazy__gkSOa = () => import('../routes/api/admin/index9.post.mjs');
const _lazy_eb7B5L = () => import('../routes/api/admin/world-regions.get.mjs');
const _lazy_N3CxLm = () => import('../routes/api/analytics/event.post.mjs');
const _lazy_2a4uj1 = () => import('../routes/api/analytics/heartbeat.post.mjs');
const _lazy_139NUz = () => import('../routes/api/auth/login.post.mjs');
const _lazy_ueK6WC = () => import('../routes/api/auth/logout.post.mjs');
const _lazy_SoKXsN = () => import('../routes/api/auth/me.get.mjs');
const _lazy_gyqS83 = () => import('../routes/api/index.get.mjs');
const _lazy_MzvSN6 = () => import('../routes/api/coach-help-errors.post.mjs');
const _lazy_IpB7QQ = () => import('../routes/api/coach-help-feedback.post.mjs');
const _lazy_VIC0vM = () => import('../routes/api/index2.get.mjs');
const _lazy_h_prsr = () => import('../routes/api/conjugaisons/_id_.get.mjs');
const _lazy_d0MdWr = () => import('../routes/api/contact-settings.get.mjs');
const _lazy_IzEzBk = () => import('../routes/api/contact.post.mjs');
const _lazy_Ul9OUa = () => import('../routes/api/defis/_code_.get.mjs');
const _lazy__j7ijp = () => import('../routes/api/index.post.mjs');
const _lazy_vrx5Eb = () => import('../routes/api/dev-learner-login.get.mjs');
const _lazy_EqhngM = () => import('../routes/api/dev-login.get.mjs');
const _lazy_7R0kdS = () => import('../routes/api/learner/account.delete.mjs');
const _lazy_H053HE = () => import('../routes/api/learner/activity/attempt.post.mjs');
const _lazy_KPYAI2 = () => import('../routes/api/learner/activity/plan.post.mjs');
const _lazy_HMa5CX = () => import('../routes/api/learner/challenge-progress.get.mjs');
const _lazy__LfSEM = () => import('../routes/api/learner/challenge-summary.get.mjs');
const _lazy_ql_9yX = () => import('../routes/api/learner/challenge-trainings.get.mjs');
const _lazy_o4sbiM = () => import('../routes/api/learner/dashboard.get.mjs');
const _lazy_pZUjuJ = () => import('../routes/api/learner/error-challenge.get.mjs');
const _lazy_apItcC = () => import('../routes/api/learner/error-insights.get.mjs');
const _lazy_GCLUNn = () => import('../routes/api/learner/login.post.mjs');
const _lazy_0bKwps = () => import('../routes/api/learner/logout.post.mjs');
const _lazy_ri0j2G = () => import('../routes/api/learner/me.get.mjs');
const _lazy_eZBKwf = () => import('../routes/api/learner/password.put.mjs');
const _lazy_6DCDmt = () => import('../routes/api/learner/preferences.get.mjs');
const _lazy_jvkaXi = () => import('../routes/api/learner/preferences.put.mjs');
const _lazy_4Uts_O = () => import('../routes/api/learner/progress-examples.get.mjs');
const _lazy_qqbbfp = () => import('../routes/api/learner/progress.get.mjs');
const _lazy_zLnTOt = () => import('../routes/api/learner/register.post.mjs');
const _lazy_nWWHDd = () => import('../routes/api/learner/registration.get.mjs');
const _lazy_AVSiFL = () => import('../routes/api/learner/results.delete.mjs');
const _lazy_VlO5xm = () => import('../routes/api/learner/review.get.mjs');
const _lazy_eV99Yp = () => import('../routes/api/learner/timeline.get.mjs');
const _lazy_dZqWCB = () => import('../routes/api/learner/username-suggestion.post.mjs');
const _lazy_BOwuGD = () => import('../routes/api/logs.post.mjs');
const _lazy_vClid5 = () => import('../routes/api/index2.post.mjs');
const _lazy_nOrODq = () => import('../routes/api/index3.post.mjs');
const _lazy_ErnDr6 = () => import('../routes/api/test-db.get.mjs');
const _lazy_xt1Pk1 = () => import('../routes/api/verbes.get.mjs');
const _lazy_Mbsjol = () => import('../routes/renderer.mjs').then(function (n) { return n.r; });

const handlers = [
  { route: '', handler: _zUOlpk, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _VQKqTk, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _Hy8sLX, lazy: false, middleware: true, method: undefined },
  { route: '/api/admin/admins/:id', handler: _lazy_FrjBIN, lazy: true, middleware: false, method: "delete" },
  { route: '/api/admin/admins/:id', handler: _lazy_nmAUbf, lazy: true, middleware: false, method: "put" },
  { route: '/api/admin/admins', handler: _lazy_LYK4qu, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/admins', handler: _lazy_lncNYX, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/analytics-usage', handler: _lazy_tlntNH, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/analytics-users', handler: _lazy_AXRfsL, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/analytics', handler: _lazy_Haqmef, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/challenge-preset-categories/:id', handler: _lazy_Feou3T, lazy: true, middleware: false, method: "delete" },
  { route: '/api/admin/challenge-preset-categories/:id', handler: _lazy_qsRAnA, lazy: true, middleware: false, method: "put" },
  { route: '/api/admin/challenge-preset-categories', handler: _lazy_iGUuSi, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/challenge-preset-categories/reorder', handler: _lazy_vHbftk, lazy: true, middleware: false, method: "put" },
  { route: '/api/admin/challenge-presets/:id', handler: _lazy_JkIfL6, lazy: true, middleware: false, method: "delete" },
  { route: '/api/admin/challenge-presets/:id', handler: _lazy_jQYunH, lazy: true, middleware: false, method: "put" },
  { route: '/api/admin/challenge-presets', handler: _lazy_dwuZ6z, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/challenge-presets', handler: _lazy_S4QTtl, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/challenge-presets/reorder', handler: _lazy_YFy3TG, lazy: true, middleware: false, method: "put" },
  { route: '/api/admin/city-locations', handler: _lazy_MRu6D5, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/coach-caracteres/:id', handler: _lazy_BBtDg5, lazy: true, middleware: false, method: "delete" },
  { route: '/api/admin/coach-caracteres/:id', handler: _lazy_A8QwIA, lazy: true, middleware: false, method: "put" },
  { route: '/api/admin/coach-caracteres/:id/audit-cases', handler: _lazy_OGPqU9, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/coach-caracteres/:id/permanent', handler: _lazy_AvD0co, lazy: true, middleware: false, method: "delete" },
  { route: '/api/admin/coach-caracteres', handler: _lazy_W3tfPx, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/coach-caracteres', handler: _lazy_1OeX2b, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/coach-characters/:id', handler: _lazy_HVz2LF, lazy: true, middleware: false, method: "delete" },
  { route: '/api/admin/coach-characters/:id', handler: _lazy_7O4iLa, lazy: true, middleware: false, method: "put" },
  { route: '/api/admin/coach-characters/:id/permanent', handler: _lazy__mhW4G, lazy: true, middleware: false, method: "delete" },
  { route: '/api/admin/coach-characters', handler: _lazy_B0RRlQ, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/coach-characters', handler: _lazy_NAOXUG, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/coach-help-approaches/:id', handler: _lazy_VXpT2u, lazy: true, middleware: false, method: "delete" },
  { route: '/api/admin/coach-help-approaches/:id', handler: _lazy_hTzggQ, lazy: true, middleware: false, method: "put" },
  { route: '/api/admin/coach-help-approaches', handler: _lazy_zHB6GN, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/coach-help-approaches', handler: _lazy_ThoaOE, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/coach-help-errors/export', handler: _lazy_kBGbMt, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/coach-help-feedbacks', handler: _lazy_xvoGIX, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/coach-help-feedbacks/:id', handler: _lazy_9LvES8, lazy: true, middleware: false, method: "put" },
  { route: '/api/admin/coach-help-feedbacks/export', handler: _lazy_qZNZgY, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/coach-help-feedbacks/treated', handler: _lazy_qACps0, lazy: true, middleware: false, method: "delete" },
  { route: '/api/admin/coach-help-verb-reviews', handler: _lazy_wtEEuU, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/coach-helps/:id', handler: _lazy_32s5gO, lazy: true, middleware: false, method: "delete" },
  { route: '/api/admin/coach-helps/:id', handler: _lazy_svgYNM, lazy: true, middleware: false, method: "put" },
  { route: '/api/admin/coach-helps/:id/caractere', handler: _lazy_Yre9hG, lazy: true, middleware: false, method: "put" },
  { route: '/api/admin/coach-helps/:id/character', handler: _lazy_jmciZO, lazy: true, middleware: false, method: "put" },
  { route: '/api/admin/coach-helps', handler: _lazy_vZmY9_, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/coach-helps', handler: _lazy_vWaBfp, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/coach-media/:id', handler: _lazy_kb3nRT, lazy: true, middleware: false, method: "delete" },
  { route: '/api/admin/coach-media/:id', handler: _lazy_p5tZi1, lazy: true, middleware: false, method: "put" },
  { route: '/api/admin/coach-media', handler: _lazy_FJ3hxo, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/coach-media', handler: _lazy_5VMpxX, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/coach-media/upload', handler: _lazy_4icOIV, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/coaches/:id', handler: _lazy_jZwS0v, lazy: true, middleware: false, method: "delete" },
  { route: '/api/admin/coaches/:id', handler: _lazy_QCS3k9, lazy: true, middleware: false, method: "put" },
  { route: '/api/admin/coaches', handler: _lazy_cJUfKz, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/coaches', handler: _lazy_6hXaRh, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/contact-settings', handler: _lazy_8lRq29, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/contact-settings', handler: _lazy_H6EpZy, lazy: true, middleware: false, method: "put" },
  { route: '/api/admin/defis/:code/permanent', handler: _lazy_X9D0v5, lazy: true, middleware: false, method: "put" },
  { route: '/api/admin/stats', handler: _lazy_TdJp9W, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/swiss-cantons', handler: _lazy_zP9Yux, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/swiss-city-cantons', handler: _lazy_tDxyoz, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/tests', handler: _lazy_aLt4oJ, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/tests/run', handler: _lazy_lwNfKn, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/users', handler: _lazy_FdWL78, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/verbes/:id', handler: _lazy_zyStke, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/verbes/:id', handler: _lazy_5hEsHe, lazy: true, middleware: false, method: "put" },
  { route: '/api/admin/verbes/:id/complements/:complementId', handler: _lazy_cPi9jB, lazy: true, middleware: false, method: "delete" },
  { route: '/api/admin/verbes/:id/complements/:complementId', handler: _lazy_xaLuFb, lazy: true, middleware: false, method: "patch" },
  { route: '/api/admin/verbes/:id/complements', handler: _lazy_tdjTHd, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/verbes/:id/constructions/:constructionId', handler: _lazy_oXwbR_, lazy: true, middleware: false, method: "patch" },
  { route: '/api/admin/verbes', handler: _lazy__gkSOa, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/world-regions', handler: _lazy_eb7B5L, lazy: true, middleware: false, method: "get" },
  { route: '/api/analytics/event', handler: _lazy_N3CxLm, lazy: true, middleware: false, method: "post" },
  { route: '/api/analytics/heartbeat', handler: _lazy_2a4uj1, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/login', handler: _lazy_139NUz, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/logout', handler: _lazy_ueK6WC, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/me', handler: _lazy_SoKXsN, lazy: true, middleware: false, method: "get" },
  { route: '/api/catalogue', handler: _lazy_gyqS83, lazy: true, middleware: false, method: "get" },
  { route: '/api/coach-help-errors', handler: _lazy_MzvSN6, lazy: true, middleware: false, method: "post" },
  { route: '/api/coach-help-feedback', handler: _lazy_IpB7QQ, lazy: true, middleware: false, method: "post" },
  { route: '/api/coaches', handler: _lazy_VIC0vM, lazy: true, middleware: false, method: "get" },
  { route: '/api/conjugaisons/:id', handler: _lazy_h_prsr, lazy: true, middleware: false, method: "get" },
  { route: '/api/contact-settings', handler: _lazy_d0MdWr, lazy: true, middleware: false, method: "get" },
  { route: '/api/contact', handler: _lazy_IzEzBk, lazy: true, middleware: false, method: "post" },
  { route: '/api/defis/:code', handler: _lazy_Ul9OUa, lazy: true, middleware: false, method: "get" },
  { route: '/api/defis', handler: _lazy__j7ijp, lazy: true, middleware: false, method: "post" },
  { route: '/api/dev-learner-login', handler: _lazy_vrx5Eb, lazy: true, middleware: false, method: "get" },
  { route: '/api/dev-login', handler: _lazy_EqhngM, lazy: true, middleware: false, method: "get" },
  { route: '/api/learner/account', handler: _lazy_7R0kdS, lazy: true, middleware: false, method: "delete" },
  { route: '/api/learner/activity/attempt', handler: _lazy_H053HE, lazy: true, middleware: false, method: "post" },
  { route: '/api/learner/activity/plan', handler: _lazy_KPYAI2, lazy: true, middleware: false, method: "post" },
  { route: '/api/learner/challenge-progress', handler: _lazy_HMa5CX, lazy: true, middleware: false, method: "get" },
  { route: '/api/learner/challenge-summary', handler: _lazy__LfSEM, lazy: true, middleware: false, method: "get" },
  { route: '/api/learner/challenge-trainings', handler: _lazy_ql_9yX, lazy: true, middleware: false, method: "get" },
  { route: '/api/learner/dashboard', handler: _lazy_o4sbiM, lazy: true, middleware: false, method: "get" },
  { route: '/api/learner/error-challenge', handler: _lazy_pZUjuJ, lazy: true, middleware: false, method: "get" },
  { route: '/api/learner/error-insights', handler: _lazy_apItcC, lazy: true, middleware: false, method: "get" },
  { route: '/api/learner/login', handler: _lazy_GCLUNn, lazy: true, middleware: false, method: "post" },
  { route: '/api/learner/logout', handler: _lazy_0bKwps, lazy: true, middleware: false, method: "post" },
  { route: '/api/learner/me', handler: _lazy_ri0j2G, lazy: true, middleware: false, method: "get" },
  { route: '/api/learner/password', handler: _lazy_eZBKwf, lazy: true, middleware: false, method: "put" },
  { route: '/api/learner/preferences', handler: _lazy_6DCDmt, lazy: true, middleware: false, method: "get" },
  { route: '/api/learner/preferences', handler: _lazy_jvkaXi, lazy: true, middleware: false, method: "put" },
  { route: '/api/learner/progress-examples', handler: _lazy_4Uts_O, lazy: true, middleware: false, method: "get" },
  { route: '/api/learner/progress', handler: _lazy_qqbbfp, lazy: true, middleware: false, method: "get" },
  { route: '/api/learner/register', handler: _lazy_zLnTOt, lazy: true, middleware: false, method: "post" },
  { route: '/api/learner/registration', handler: _lazy_nWWHDd, lazy: true, middleware: false, method: "get" },
  { route: '/api/learner/results', handler: _lazy_AVSiFL, lazy: true, middleware: false, method: "delete" },
  { route: '/api/learner/review', handler: _lazy_VlO5xm, lazy: true, middleware: false, method: "get" },
  { route: '/api/learner/timeline', handler: _lazy_eV99Yp, lazy: true, middleware: false, method: "get" },
  { route: '/api/learner/username-suggestion', handler: _lazy_dZqWCB, lazy: true, middleware: false, method: "post" },
  { route: '/api/logs', handler: _lazy_BOwuGD, lazy: true, middleware: false, method: "post" },
  { route: '/api/questionnaires', handler: _lazy_vClid5, lazy: true, middleware: false, method: "post" },
  { route: '/api/tense-examples', handler: _lazy_nOrODq, lazy: true, middleware: false, method: "post" },
  { route: '/api/test-db', handler: _lazy_ErnDr6, lazy: true, middleware: false, method: "get" },
  { route: '/api/verbes', handler: _lazy_xt1Pk1, lazy: true, middleware: false, method: "get" },
  { route: '/__nuxt_error', handler: _lazy_Mbsjol, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_island/**', handler: _SxA8c9, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_Mbsjol, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => b(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return C(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    debug("received shut down signal", signal);
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((error) => {
      debug("server shut down error occurred", error);
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    debug("Destroy Connections : " + (force ? "forced close" : "close"));
    let counter = 0;
    let secureCounter = 0;
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        counter++;
        destroy(socket);
      }
    }
    debug("Connections destroyed : " + counter);
    debug("Connection Counter    : " + connectionCounter);
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        secureCounter++;
        destroy(socket);
      }
    }
    debug("Secure Connections destroyed : " + secureCounter);
    debug("Secure Connection Counter    : " + secureConnectionCounter);
  }
  server.on("request", (req, res) => {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", () => {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", () => {
    debug("closed");
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      debug("Close http server");
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    debug("shutdown signal - " + sig);
    if (options.development) {
      debug("DEV-Mode - immediate forceful shutdown");
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          debug("executing finally()");
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      debug(`waitForReadyToShutDown... ${totalNumInterval}`);
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        debug("All connections closed. Continue to shutting down");
        return Promise.resolve(false);
      }
      debug("Schedule the next waitForReadyToShutdown");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    debug("shutting down");
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      debug("Do onShutdown now");
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((error) => {
      const errString = typeof error === "string" ? error : JSON.stringify(error);
      debug(errString);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT || "", 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((error) => {
          console.error(error);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const path = process.env.NITRO_UNIX_SOCKET;
const listener = server.listen(path ? { path } : { port, host }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const addressInfo = listener.address();
  if (typeof addressInfo === "string") {
    console.log(`Listening on unix socket ${addressInfo}`);
    return;
  }
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${addressInfo.family === "IPv6" ? `[${addressInfo.address}]` : addressInfo.address}:${addressInfo.port}${baseURL}`;
  console.log(`Listening on ${url}`);
});
trapUnhandledNodeErrors();
setupGracefulShutdown(listener, nitroApp);
const nodeServer = {};

export { indirectRelative as $, getRequestIP as A, getCachedCatalogue as B, setResponseHeaders as C, decodePronominalSelectionId as D, encodePronominalSelectionId as E, legacyComplementOptions as F, legacyComplementConfig as G, normalizeComplementOptions as H, DEFAULT_COMPLEMENT_OPTIONS as I, validateAnswer as J, diagnoseLearnerError as K, LEARNER_ERROR_DETECTOR_VERSION as L, applicableLearnerErrorTypes as M, learnerErrorDetails as N, LEARNER_ERROR_TAXONOMY as O, learnerErrorDetailText as P, CURRENT_PRIVACY_NOTICE_VERSION as Q, parseQuery as R, hasProtocol as S, joinURL as T, isScriptProtocol as U, withTrailingSlash as V, withoutTrailingSlash as W, challengePresetGroupLabels as X, hash$1 as Y, executeAsync as Z, challengePresetDefinitions as _, getQuery as a, formatConjugationQuestion as a0, formatAnswer as a1, challengePresetGroupOrder as a2, localizedLearnerErrorMessageForCode as a3, localizedLearnerErrorDomain as a4, localizedLearnerErrorLabel as a5, parseURL as a6, encodePath as a7, decodePath as a8, localeFromPath as a9, getRouteRules as aA, getResponseStatusText as aB, getResponseStatus as aC, useNitroApp as aD, nodeServer as aE, getRequestHeaders as aa, withQuery as ab, klona as ac, DEFAULT_LANGUAGE_PREFERENCES as ad, localizePath as ae, sanitizeStatusCode as af, getContext as ag, getRequestHeader as ah, isEqual as ai, $fetch as aj, defu as ak, DEFAULT_INTERFACE_LOCALE as al, grammarModeCode as am, getAlternativeCorrections as an, impossibleSingularEndingReminderMessage as ao, localizedLearnerErrorMessage as ap, isFutureSimpleInsteadOfNearFuture as aq, findConjugationConfusions as ar, findImpossibleSingularEnding as as, diagnoseCoachAgreement as at, diagnoseCoachAnswer as au, mergeLearnerErrorDetails as av, learnerErrorInsteadOf as aw, joinRelativeURL as ax, defineRenderHandler as ay, destr as az, reorderChallengePresets as b, createError$1 as c, defineEventHandler as d, parseChallengePresetPayload as e, replaceChallengePresetSelections as f, getRouterParam as g, getCatalogue as h, listStoredChallengePresets as i, setCookie as j, deleteCookie as k, listChallengePresetCategories as l, getCookie as m, useRuntimeConfig as n, normalizeLocale as o, parseChallengePresetCategoryPayload as p, readMultipartFormData as q, readBody as r, setResponseHeader as s, getContactSettings as t, useDatabase as u, validateContactSettings as v, saveContactSettings as w, getHeader as x, getRequestURL as y, stripLocaleFromPath as z };
//# sourceMappingURL=nitro.mjs.map
