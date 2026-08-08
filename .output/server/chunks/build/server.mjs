import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { computed, hasInjectionContext, inject, getCurrentInstance, ref, customRef, defineComponent, createElementBlock, defineAsyncComponent, h, unref, shallowRef, provide, shallowReactive, Suspense, Fragment, useSSRContext, createApp, withCtx, createVNode, onErrorCaptured, onServerPrefetch, resolveDynamicComponent, reactive, effectScope, nextTick, mergeProps, getCurrentScope, toRef, isReadonly, isRef, isShallow, isReactive, toRaw } from 'vue';
import { _ as SUPPORTED_LOCALES, al as parseURL, am as encodePath, an as decodePath, ao as localeFromPath, o as normalizeLocale, ap as getRequestHeaders, c as createError$1, a2 as hasProtocol, a4 as isScriptProtocol, a3 as joinURL, aq as withQuery, ar as klona, as as DEFAULT_LANGUAGE_PREFERENCES, a0 as localizePath, at as sanitizeStatusCode, au as getContext, av as getRequestHeader, aw as isEqual, j as setCookie, m as getCookie, k as deleteCookie, ax as $fetch, ay as defu, C as stripLocaleFromPath, a9 as executeAsync, az as DEFAULT_INTERFACE_LOCALE } from '../nitro/nitro.mjs';
import { u as useSeoMeta$1, a as useHead$1, h as headSymbol, b as baseURL } from '../routes/renderer.mjs';
import { useRoute as useRoute$1, RouterView, createMemoryHistory, createRouter, START_LOCATION } from 'vue-router';
import { ssrRenderComponent, ssrRenderSuspense, ssrRenderVNode } from 'vue/server-renderer';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:url';
import 'node:fs/promises';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';

function flatHooks(configHooks, hooks = {}, parentName) {
	for (const key in configHooks) {
		const subHook = configHooks[key];
		const name = parentName ? `${parentName}:${key}` : key;
		if (typeof subHook === "object" && subHook !== null) flatHooks(subHook, hooks, name);
		else if (typeof subHook === "function") hooks[name] = subHook;
	}
	return hooks;
}
const createTask = /* @__PURE__ */ (() => {
	if (console.createTask) return console.createTask;
	const defaultTask = { run: (fn) => fn() };
	return () => defaultTask;
})();
function callHooks(hooks, args, startIndex, task) {
	for (let i = startIndex; i < hooks.length; i += 1) try {
		const result = task ? task.run(() => hooks[i](...args)) : hooks[i](...args);
		if (result && typeof result.then === "function") return Promise.resolve(result).then(() => callHooks(hooks, args, i + 1, task));
	} catch (error) {
		return Promise.reject(error);
	}
}
function serialTaskCaller(hooks, args, name) {
	if (hooks.length > 0) return callHooks(hooks, args, 0, createTask(name));
}
function parallelTaskCaller(hooks, args, name) {
	if (hooks.length > 0) {
		const task = createTask(name);
		return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
	}
}
function callEachWith(callbacks, arg0) {
	for (const callback of [...callbacks]) callback(arg0);
}
var Hookable = class {
	_hooks;
	_before;
	_after;
	_deprecatedHooks;
	_deprecatedMessages;
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
		if (!name || typeof function_ !== "function") return () => {};
		const originalName = name;
		let dep;
		while (this._deprecatedHooks[name]) {
			dep = this._deprecatedHooks[name];
			name = dep.to;
		}
		if (dep && !options.allowDeprecated) {
			let message = dep.message;
			if (!message) message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
			if (!this._deprecatedMessages) this._deprecatedMessages = /* @__PURE__ */ new Set();
			if (!this._deprecatedMessages.has(message)) {
				console.warn(message);
				this._deprecatedMessages.add(message);
			}
		}
		if (!function_.name) try {
			Object.defineProperty(function_, "name", {
				get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
				configurable: true
			});
		} catch {}
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
			if (typeof _unreg === "function") _unreg();
			_unreg = void 0;
			_function = void 0;
			return function_(...arguments_);
		};
		_unreg = this.hook(name, _function);
		return _unreg;
	}
	removeHook(name, function_) {
		const hooks = this._hooks[name];
		if (hooks) {
			const index = hooks.indexOf(function_);
			if (index !== -1) hooks.splice(index, 1);
			if (hooks.length === 0) this._hooks[name] = void 0;
		}
	}
	clearHook(name) {
		this._hooks[name] = void 0;
	}
	deprecateHook(name, deprecated) {
		this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
		const _hooks = this._hooks[name] || [];
		this._hooks[name] = void 0;
		for (const hook of _hooks) this.hook(name, hook);
	}
	deprecateHooks(deprecatedHooks) {
		for (const name in deprecatedHooks) this.deprecateHook(name, deprecatedHooks[name]);
	}
	addHooks(configHooks) {
		const hooks = flatHooks(configHooks);
		const removeFns = Object.keys(hooks).map((key) => this.hook(key, hooks[key]));
		return () => {
			for (const unreg of removeFns) unreg();
			removeFns.length = 0;
		};
	}
	removeHooks(configHooks) {
		const hooks = flatHooks(configHooks);
		for (const key in hooks) this.removeHook(key, hooks[key]);
	}
	removeAllHooks() {
		this._hooks = {};
	}
	callHook(name, ...args) {
		return this.callHookWith(serialTaskCaller, name, args);
	}
	callHookParallel(name, ...args) {
		return this.callHookWith(parallelTaskCaller, name, args);
	}
	callHookWith(caller, name, args) {
		const event = this._before || this._after ? {
			name,
			args,
			context: {}
		} : void 0;
		if (this._before) callEachWith(this._before, event);
		const result = caller(this._hooks[name] ? [...this._hooks[name]] : [], args, name);
		if (result instanceof Promise) return result.finally(() => {
			if (this._after && event) callEachWith(this._after, event);
		});
		if (this._after && event) callEachWith(this._after, event);
		return result;
	}
	beforeEach(function_) {
		this._before = this._before || [];
		this._before.push(function_);
		return () => {
			if (this._before !== void 0) {
				const index = this._before.indexOf(function_);
				if (index !== -1) this._before.splice(index, 1);
			}
		};
	}
	afterEach(function_) {
		this._after = this._after || [];
		this._after.push(function_);
		return () => {
			if (this._after !== void 0) {
				const index = this._after.indexOf(function_);
				if (index !== -1) this._after.splice(index, 1);
			}
		};
	}
};
function createHooks() {
	return new Hookable();
}

const LOCALE_PATTERN = SUPPORTED_LOCALES.join("|");
const LOCALIZED_LEGACY_HOME = new RegExp(`^/(${LOCALE_PATTERN})/accueil/?$`, "u");
const LOCALIZED_MODE_PATH = new RegExp(`^/(${LOCALE_PATTERN})/modes(?:/([^/]+)(?:/([^/]+))?)?$`, "u");
function withoutTrailingSlash(path) {
  return path.length > 1 ? path.replace(/\/+$/u, "") : path;
}
function permanentLegacyRedirect(path) {
  const localizedHome = path.match(LOCALIZED_LEGACY_HOME);
  if (localizedHome) return `/${localizedHome[1]}/`;
  const normalizedPath = withoutTrailingSlash(path);
  const localizedModePath = normalizedPath.match(LOCALIZED_MODE_PATH);
  if (localizedModePath) {
    const [, locale, mode, tense] = localizedModePath;
    return mode && tense ? `/${locale}/${mode}/${tense}` : `/${locale}/apprendre`;
  }
  if (normalizedPath === "/" || normalizedPath === "/accueil") return "/fr/";
  if (normalizedPath === "/exercices") return "/fr/apprendre";
  if (normalizedPath === "/modes") return "/fr/apprendre";
  if (["/apprendre", "/consulter"].includes(normalizedPath)) {
    return `/fr${normalizedPath}`;
  }
  const formerExerciseJourney = normalizedPath.match(/^\/exercices\/([^/]+)$/u);
  if (formerExerciseJourney) {
    return `/fr/indicatif/${formerExerciseJourney[1]}`;
  }
  const modePath = normalizedPath.match(/^\/modes\/([^/]+)(?:\/([^/]+))?$/u);
  if (modePath) {
    const [, mode, tense] = modePath;
    return tense ? `/fr/${mode}/${tense}` : "/fr/apprendre";
  }
  return null;
}

function endIndex(str, min, len) {
	const index = str.indexOf(";", min);
	return index === -1 ? len : index;
}
function eqIndex(str, min, max) {
	const index = str.indexOf("=", min);
	return index < max ? index : -1;
}
function valueSlice(str, min, max) {
	if (min === max) return "";
	let start = min;
	let end = max;
	do {
		const code = str.charCodeAt(start);
		if (code !== 32 && code !== 9) break;
	} while (++start < end);
	while (end > start) {
		const code = str.charCodeAt(end - 1);
		if (code !== 32 && code !== 9) break;
		end--;
	}
	return str.slice(start, end);
}
const NullObject = /* @__PURE__ */ (() => {
	const C = function() {};
	C.prototype = Object.create(null);
	return C;
})();
function parse(str, options) {
	const obj = new NullObject();
	const len = str.length;
	if (len < 2) return obj;
	const dec = options?.decode || decode;
	const allowMultiple = options?.allowMultiple || false;
	let index = 0;
	do {
		const eqIdx = eqIndex(str, index, len);
		if (eqIdx === -1) break;
		const endIdx = endIndex(str, index, len);
		if (eqIdx > endIdx) {
			index = str.lastIndexOf(";", eqIdx - 1) + 1;
			continue;
		}
		const key = valueSlice(str, index, eqIdx);
		if (options?.filter && !options.filter(key)) {
			index = endIdx + 1;
			continue;
		}
		const val = dec(valueSlice(str, eqIdx + 1, endIdx));
		if (allowMultiple) {
			const existing = obj[key];
			if (existing === void 0) obj[key] = val;
			else if (Array.isArray(existing)) existing.push(val);
			else obj[key] = [existing, val];
		} else if (obj[key] === void 0) obj[key] = val;
		index = endIdx + 1;
	} while (index < len);
	return obj;
}
function decode(str) {
	if (!str.includes("%")) return str;
	try {
		return decodeURIComponent(str);
	} catch {
		return str;
	}
}

const frenchMessages = {
  "language.interface": "Langue de l\u2019interface",
  "language.explanations": "Langue des explications",
  "language.french": "Fran\xE7ais",
  "language.german": "Allemand",
  "language.english": "Anglais",
  "language.italian": "Italien",
  "language.spanish": "Espagnol",
  "common.close": "Fermer",
  "common.loading": "Chargement\u2026",
  "common.save": "Enregistrer",
  "common.cancel": "Annuler"
};
const appMessages = {
  fr: frenchMessages,
  de: {
    "language.interface": "Sprache der Benutzeroberfl\xE4che",
    "language.explanations": "Sprache der Erkl\xE4rungen",
    "language.french": "Franz\xF6sisch",
    "language.german": "Deutsch",
    "language.english": "Englisch",
    "language.italian": "Italienisch",
    "language.spanish": "Spanisch",
    "common.close": "Schlie\xDFen",
    "common.loading": "Wird geladen\u2026",
    "common.save": "Speichern",
    "common.cancel": "Abbrechen"
  },
  en: {
    "language.interface": "Interface language",
    "language.explanations": "Explanation language",
    "language.french": "French",
    "language.german": "German",
    "language.english": "English",
    "language.italian": "Italian",
    "language.spanish": "Spanish",
    "common.close": "Close",
    "common.loading": "Loading\u2026",
    "common.save": "Save",
    "common.cancel": "Cancel"
  },
  it: {
    "language.interface": "Lingua dell\u2019interfaccia",
    "language.explanations": "Lingua delle spiegazioni",
    "language.french": "Francese",
    "language.german": "Tedesco",
    "language.english": "Inglese",
    "language.italian": "Italiano",
    "language.spanish": "Spagnolo",
    "common.close": "Chiudi",
    "common.loading": "Caricamento\u2026",
    "common.save": "Salva",
    "common.cancel": "Annulla"
  },
  es: {
    "language.interface": "Idioma de la interfaz",
    "language.explanations": "Idioma de las explicaciones",
    "language.french": "Franc\xE9s",
    "language.german": "Alem\xE1n",
    "language.english": "Ingl\xE9s",
    "language.italian": "Italiano",
    "language.spanish": "Espa\xF1ol",
    "common.close": "Cerrar",
    "common.loading": "Cargando\u2026",
    "common.save": "Guardar",
    "common.cancel": "Cancelar"
  }
};
function translateAppMessage(locale, key, parameters = {}) {
  const template = appMessages[locale][key] || frenchMessages[key] || key;
  return template.replace(/\{([a-zA-Z0-9_]+)\}/gu, (_match, name) => {
    var _a;
    return String((_a = parameters[name]) != null ? _a : `{${name}}`);
  });
}

const uiMessages = {
  "D\xE9fis de conjugaison": { de: "Konjugations\xFCbungen", en: "Conjugation challenges", it: "Esercizi di coniugazione", es: "Ejercicios de conjugaci\xF3n" },
  "D\xE9fi de conjugaison": { de: "Konjugations\xFCbung", en: "Conjugation challenge", it: "Esercizio di coniugazione", es: "Ejercicio de conjugaci\xF3n" },
  "D\xE9fi pr\xEAt \xE0 \xEAtre partag\xE9": { de: "\xDCbung bereit zum Teilen", en: "Challenge ready to share", it: "Esercizio pronto per essere condiviso", es: "Ejercicio listo para compartir" },
  "D\xE9fi partag\xE9": { de: "Geteilte \xDCbung", en: "Shared challenge", it: "Esercizio condiviso", es: "Ejercicio compartido" },
  "Phrases litt\xE9raires": { de: "Literarische S\xE4tze", en: "Literary sentences", it: "Frasi letterarie", es: "Frases literarias" },
  "Titre du d\xE9fi": { de: "Titel der \xDCbung", en: "Challenge title", it: "Titolo dell\u2019esercizio", es: "T\xEDtulo del ejercicio" },
  "Description du d\xE9fi": { de: "Beschreibung der \xDCbung", en: "Challenge description", it: "Descrizione dell\u2019esercizio", es: "Descripci\xF3n del ejercicio" },
  "Facultatif : une description \xE0 l\u2019attention des personnes qui d\xE9couvriront ce d\xE9fi": { de: "Optional: eine Beschreibung f\xFCr Personen, die diese \xDCbung entdecken", en: "Optional: a description for people discovering this challenge", it: "Facoltativo: una descrizione per chi scoprir\xE0 questo esercizio", es: "Opcional: una descripci\xF3n para quienes descubran este ejercicio" },
  "Cr\xE9er le code": { de: "Code erstellen", en: "Create code", it: "Crea il codice", es: "Crear el c\xF3digo" },
  "Cr\xE9ation\u2026": { de: "Wird erstellt\u2026", en: "Creating\u2026", it: "Creazione\u2026", es: "Creando\u2026" },
  "Nouveau parcours": { de: "Neue \xDCbungsstrecke", en: "New learning path", it: "Nuovo percorso", es: "Nuevo recorrido" },
  "D\xE9fi {code} \xB7 Conjugaison": { de: "\xDCbung {code} \xB7 Konjugation", en: "Challenge {code} \xB7 Conjugation", it: "Esercizio {code} \xB7 Coniugazione", es: "Ejercicio {code} \xB7 Conjugaci\xF3n" },
  "Ouvrir et r\xE9aliser le d\xE9fi de conjugaison {code}.": { de: "Konjugations\xFCbung {code} \xF6ffnen und bearbeiten.", en: "Open and complete conjugation challenge {code}.", it: "Apri e completa l\u2019esercizio di coniugazione {code}.", es: "Abre y completa el ejercicio de conjugaci\xF3n {code}." },
  "Exercices de conjugaison fran\xE7aise gratuits et sans publicit\xE9": { de: "Kostenlose und werbefreie \xDCbungen zur franz\xF6sischen Konjugation", en: "Free, ad-free French conjugation exercises", it: "Esercizi gratuiti di coniugazione francese senza pubblicit\xE0", es: "Ejercicios gratuitos de conjugaci\xF3n francesa sin publicidad" },
  "Exercices de conjugaison fran\xE7aise": { de: "\xDCbungen zur franz\xF6sischen Konjugation", en: "French conjugation exercises", it: "Esercizi di coniugazione francese", es: "Ejercicios de conjugaci\xF3n francesa" },
  "Composez un d\xE9fi de conjugaison en choisissant les verbes, les modes et les temps.": { de: "Erstelle eine Konjugations\xFCbung, indem du Verben, Modi und Zeitformen ausw\xE4hlst.", en: "Create a conjugation challenge by choosing the verbs, moods and tenses.", it: "Crea un esercizio di coniugazione scegliendo verbi, modi e tempi.", es: "Crea un ejercicio de conjugaci\xF3n eligiendo verbos, modos y tiempos." },
  "Cr\xE9ez des d\xE9fis de conjugaison, entra\xEEnez-vous et imprimez vos questionnaires.": { de: "Erstelle Konjugations\xFCbungen, \xFCbe und drucke deine Frageb\xF6gen.", en: "Create conjugation challenges, practise and print your questionnaires.", it: "Crea esercizi di coniugazione, allenati e stampa i questionari.", es: "Crea ejercicios de conjugaci\xF3n, practica e imprime tus cuestionarios." },
  "Navigation principale": { de: "Hauptnavigation", en: "Main navigation", it: "Navigazione principale", es: "Navegaci\xF3n principal" },
  "Accueil": { de: "Startseite", en: "Home", it: "Home", es: "Inicio" },
  "S\u2019exercer": { de: "\xDCben", en: "Practise", it: "Esercitarsi", es: "Practicar" },
  "Consulter": { de: "Nachschlagen", en: "Look up", it: "Consultare", es: "Consultar" },
  "Apprendre": { de: "Lernen", en: "Learn", it: "Imparare", es: "Aprender" },
  "Un outil gratuit pour travailler la conjugaison fran\xE7aise.": { de: "Ein kostenloses Werkzeug zum \xDCben der franz\xF6sischen Konjugation.", en: "A free tool for practising French conjugation.", it: "Uno strumento gratuito per esercitare la coniugazione francese.", es: "Una herramienta gratuita para practicar la conjugaci\xF3n francesa." },
  "Contact": { de: "Kontakt", en: "Contact", it: "Contatti", es: "Contacto" },
  "Administration": { de: "Verwaltung", en: "Administration", it: "Amministrazione", es: "Administraci\xF3n" },
  "Connexion": { de: "Anmelden", en: "Sign in", it: "Accedi", es: "Iniciar sesi\xF3n" },
  "Mon espace": { de: "Mein Bereich", en: "My page", it: "Il mio spazio", es: "Mi espacio" },
  "Changer mon mot de passe": { de: "Mein Passwort \xE4ndern", en: "Change my password", it: "Cambia la mia password", es: "Cambiar mi contrase\xF1a" },
  "D\xE9connexion\u2026": { de: "Abmeldung\u2026", en: "Signing out\u2026", it: "Disconnessione\u2026", es: "Cerrando sesi\xF3n\u2026" },
  "Me d\xE9connecter": { de: "Abmelden", en: "Sign out", it: "Disconnettermi", es: "Cerrar sesi\xF3n" },
  "Activer le mode clair": { de: "Hellen Modus aktivieren", en: "Switch to light mode", it: "Attiva la modalit\xE0 chiara", es: "Activar el modo claro" },
  "Activer le mode sombre": { de: "Dunklen Modus aktivieren", en: "Switch to dark mode", it: "Attiva la modalit\xE0 scura", es: "Activar el modo oscuro" },
  "Langue de l\u2019interface": { de: "Sprache der Benutzeroberfl\xE4che", en: "Interface language", it: "Lingua dell\u2019interfaccia", es: "Idioma de la interfaz" },
  "Fran\xE7ais": { de: "Franz\xF6sisch", en: "French", it: "Francese", es: "Franc\xE9s" },
  "Allemand": { de: "Deutsch", en: "German", it: "Tedesco", es: "Alem\xE1n" },
  "Anglais": { de: "Englisch", en: "English", it: "Inglese", es: "Ingl\xE9s" },
  "Italien": { de: "Italienisch", en: "Italian", it: "Italiano", es: "Italiano" },
  "Espagnol": { de: "Spanisch", en: "Spanish", it: "Spagnolo", es: "Espa\xF1ol" },
  "Fermer": { de: "Schlie\xDFen", en: "Close", it: "Chiudi", es: "Cerrar" },
  "Chargement\u2026": { de: "Wird geladen\u2026", en: "Loading\u2026", it: "Caricamento\u2026", es: "Cargando\u2026" },
  "R\xE9essayer": { de: "Erneut versuchen", en: "Try again", it: "Riprova", es: "Reintentar" },
  "Annuler": { de: "Abbrechen", en: "Cancel", it: "Annulla", es: "Cancelar" },
  "Termin\xE9": { de: "Fertig", en: "Done", it: "Fatto", es: "Listo" },
  "Copier": { de: "Kopieren", en: "Copy", it: "Copia", es: "Copiar" },
  "Code copi\xE9": { de: "Code kopiert", en: "Code copied", it: "Codice copiato", es: "C\xF3digo copiado" },
  "Lien copi\xE9": { de: "Link kopiert", en: "Link copied", it: "Link copiato", es: "Enlace copiado" },
  "La copie a \xE9chou\xE9.": { de: "Das Kopieren ist fehlgeschlagen.", en: "Copying failed.", it: "Copia non riuscita.", es: "No se ha podido copiar." },
  "Retour": { de: "Zur\xFCck", en: "Back", it: "Indietro", es: "Volver" },
  "Continuer": { de: "Weiter", en: "Continue", it: "Continua", es: "Continuar" },
  "Mesure d\u2019activit\xE9": { de: "Aktivit\xE4tsmessung", en: "Activity tracking", it: "Misurazione dell\u2019attivit\xE0", es: "Medici\xF3n de actividad" },
  "Statistiques": { de: "Statistiken", en: "Statistics", it: "Statistiche", es: "Estad\xEDsticas" },
  "Vue quotidienne des 30 derniers jours enregistr\xE9s.": { de: "Tagesansicht der letzten 30 aufgezeichneten Tage.", en: "Daily view of the last 30 recorded days.", it: "Vista giornaliera degli ultimi 30 giorni registrati.", es: "Vista diaria de los \xFAltimos 30 d\xEDas registrados." },
  "Chargement des statistiques\u2026": { de: "Statistiken werden geladen\u2026", en: "Loading statistics\u2026", it: "Caricamento delle statistiche\u2026", es: "Cargando estad\xEDsticas\u2026" },
  "Impossible de charger les statistiques.": { de: "Die Statistiken konnten nicht geladen werden.", en: "The statistics could not be loaded.", it: "Impossibile caricare le statistiche.", es: "No se han podido cargar las estad\xEDsticas." },
  "Le conjugueur": { de: "Konjugator", en: "Conjugator", it: "Coniugatore", es: "Conjugador" },
  "Consulter un verbe": { de: "Ein Verb nachschlagen", en: "Look up a verb", it: "Consultare un verbo", es: "Consultar un verbo" },
  "Recherchez un verbe et consultez sa conjugaison \xE0 tous les modes et \xE0 tous les temps.": { de: "Suche ein Verb und sieh seine Konjugation in allen Modi und Zeitformen nach.", en: "Search for a verb and view its conjugation in every mood and tense.", it: "Cerca un verbo e consulta la coniugazione in tutti i modi e tempi.", es: "Busca un verbo y consulta su conjugaci\xF3n en todos los modos y tiempos." },
  "Chargement du catalogue\u2026": { de: "Katalog wird geladen\u2026", en: "Loading catalogue\u2026", it: "Caricamento del catalogo\u2026", es: "Cargando cat\xE1logo\u2026" },
  "Le catalogue n\u2019a pas pu \xEAtre charg\xE9.": { de: "Der Katalog konnte nicht geladen werden.", en: "The catalogue could not be loaded.", it: "Impossibile caricare il catalogo.", es: "No se ha podido cargar el cat\xE1logo." },
  "Impossible de charger la conjugaison de ce verbe.": { de: "Die Konjugation dieses Verbs konnte nicht geladen werden.", en: "This verb\u2019s conjugation could not be loaded.", it: "Impossibile caricare la coniugazione di questo verbo.", es: "No se ha podido cargar la conjugaci\xF3n de este verbo." },
  "Le participe pass\xE9 avec avoir": { de: "Das Partizip Perfekt mit avoir", en: "The past participle with avoir", it: "Il participio passato con avoir", es: "El participio pasado con avoir" },
  "La place du COD change l\u2019accord": { de: "Die Position des direkten Objekts bestimmt die Angleichung", en: "The position of the direct object changes agreement", it: "La posizione del complemento oggetto cambia la concordanza", es: "La posici\xF3n del complemento directo cambia la concordancia" },
  "Voir avec un COD": { de: "Mit direktem Objekt anzeigen", en: "View with a direct object", it: "Vedi con un complemento oggetto", es: "Ver con un complemento directo" },
  "Masquer le COD": { de: "Direktes Objekt ausblenden", en: "Hide direct object", it: "Nascondi il complemento oggetto", es: "Ocultar el complemento directo" },
  "Avec un COD": { de: "Mit direktem Objekt", en: "With a direct object", it: "Con un complemento oggetto", es: "Con un complemento directo" },
  "Exemple indisponible": { de: "Beispiel nicht verf\xFCgbar", en: "Example unavailable", it: "Esempio non disponibile", es: "Ejemplo no disponible" },
  "Aucun exemple avec un COD n\u2019est disponible pour ce verbe.": { de: "F\xFCr dieses Verb ist kein Beispiel mit direktem Objekt verf\xFCgbar.", en: "No example with a direct object is available for this verb.", it: "Non \xE8 disponibile alcun esempio con complemento oggetto per questo verbo.", es: "No hay ning\xFAn ejemplo con complemento directo disponible para este verbo." },
  "Voir les pi\xE8ges": { de: "Stolperfallen anzeigen", en: "View pitfalls", it: "Vedi le difficolt\xE0", es: "Ver las dificultades" },
  "Masquer les pi\xE8ges": { de: "Stolperfallen ausblenden", en: "Hide pitfalls", it: "Nascondi le difficolt\xE0", es: "Ocultar las dificultades" },
  "Exporter en PDF": { de: "Als PDF exportieren", en: "Export to PDF", it: "Esporta in PDF", es: "Exportar a PDF" },
  "Avec avoir, le participe pass\xE9 ne s\u2019accorde pas avec le COD plac\xE9 apr\xE8s.": { de: "Mit avoir wird das Partizip Perfekt nicht an ein nachgestelltes direktes Objekt angeglichen.", en: "With avoir, the past participle does not agree with a direct object placed after it.", it: "Con avoir, il participio passato non concorda con il complemento oggetto posto dopo.", es: "Con avoir, el participio pasado no concuerda con el complemento directo colocado despu\xE9s." },
  "COD \xAB {cod} \xBB plac\xE9 avant : accord avec le COD ({gender}, {number}).": { de: "Vorangestelltes direktes Objekt \u201E{cod}\u201C: Angleichung an das direkte Objekt ({gender}, {number}).", en: "Direct object \u201C{cod}\u201D placed before the verb: agreement with the direct object ({gender}, {number}).", it: "Complemento oggetto \xAB{cod}\xBB posto prima: concordanza con il complemento oggetto ({gender}, {number}).", es: "Complemento directo \xAB{cod}\xBB colocado antes: concordancia con el complemento directo ({gender}, {number})." },
  "Difficult\xE9s rep\xE9r\xE9es": { de: "Erkannte Schwierigkeiten", en: "Detected difficulties", it: "Difficolt\xE0 rilevate", es: "Dificultades detectadas" },
  "Consulter le verbe": { de: "Verb nachschlagen", en: "View the verb", it: "Consulta il verbo", es: "Consultar el verbo" },
  "Conjugaison compl\xE8te": { de: "Vollst\xE4ndige Konjugation", en: "Full conjugation", it: "Coniugazione completa", es: "Conjugaci\xF3n completa" },
  "Consulte toutes les formes du verbe {verb}.": { de: "Sieh dir alle Formen des Verbs {verb} an.", en: "View every form of the verb {verb}.", it: "Consulta tutte le forme del verbo {verb}.", es: "Consulta todas las formas del verbo {verb}." },
  "Tu veux consulter la conjugaison du verbe {verb} ?": { de: "M\xF6chtest du die Konjugation des Verbs {verb} nachschlagen?", en: "Would you like to view the conjugation of the verb {verb}?", it: "Vuoi consultare la coniugazione del verbo {verb}?", es: "\xBFQuieres consultar la conjugaci\xF3n del verbo {verb}?" },
  "Pi\xE8ges \xE0 surveiller pour \xAB {verb} \xBB": { de: "Stolperfallen bei \u201E{verb}\u201C", en: "Pitfalls to watch for with \u201C{verb}\u201D", it: "Difficolt\xE0 da osservare per \xAB{verb}\xBB", es: "Dificultades que debes vigilar con \xAB{verb}\xBB" },
  "Aucun pi\xE8ge particulier n\u2019a \xE9t\xE9 d\xE9tect\xE9 dans les formes de ce verbe.": { de: "In den Formen dieses Verbs wurde keine besondere Stolperfalle erkannt.", en: "No particular pitfall was detected in this verb\u2019s forms.", it: "Non \xE8 stata rilevata alcuna difficolt\xE0 particolare nelle forme di questo verbo.", es: "No se ha detectado ninguna dificultad particular en las formas de este verbo." },
  "C\xE9dille \xE0 ne pas oublier": { de: "Die Cedille nicht vergessen", en: "Do not forget the cedilla", it: "Non dimenticare la cediglia", es: "No olvides la cedilla" },
  "Le \xE7 conserve le son [s] devant a, o ou u, ou appartient au radical de certaines formes.": { de: "Das \xE7 erh\xE4lt den Laut [s] vor a, o oder u oder geh\xF6rt in manchen Formen zum Stamm.", en: "The \xE7 preserves the [s] sound before a, o or u, or belongs to the stem in some forms.", it: "La \xE7 conserva il suono [s] davanti ad a, o o u, oppure appartiene alla radice di alcune forme.", es: "La \xE7 conserva el sonido [s] delante de a, o o u, o forma parte de la ra\xEDz en algunas formas." },
  "E protecteur apr\xE8s le g": { de: "Sch\xFCtzendes e nach g", en: "Protective e after g", it: "E protettiva dopo la g", es: "E protectora despu\xE9s de la g" },
  "Le e plac\xE9 apr\xE8s g conserve le son [\u0292] devant a ou o : mangeais, mangeons.": { de: "Das e nach g erh\xE4lt den Laut [\u0292] vor a oder o: mangeais, mangeons.", en: "The e after g preserves the [\u0292] sound before a or o: mangeais, mangeons.", it: "La e dopo g conserva il suono [\u0292] davanti ad a o o: mangeais, mangeons.", es: "La e despu\xE9s de g conserva el sonido [\u0292] delante de a u o: mangeais, mangeons." },
  "Y remplac\xE9 par i": { de: "Y wird durch i ersetzt", en: "Y changes to i", it: "Y sostituita da i", es: "Y sustituida por i" },
  "Dans certaines formes des verbes en -yer, le y du radical devient i.": { de: "In manchen Formen der Verben auf -yer wird das y des Stamms zu i.", en: "In some forms of -yer verbs, the y in the stem changes to i.", it: "In alcune forme dei verbi in -yer, la y della radice diventa i.", es: "En algunas formas de los verbos en -yer, la y de la ra\xEDz se convierte en i." },
  "Accent grave dans le radical": { de: "Gravis im Stamm", en: "Grave accent in the stem", it: "Accento grave nella radice", es: "Acento grave en la ra\xEDz" },
  "Un e ou un \xE9 du radical devient \xE8 dans certaines formes.": { de: "Ein e oder \xE9 des Stamms wird in manchen Formen zu \xE8.", en: "An e or \xE9 in the stem changes to \xE8 in some forms.", it: "Una e o una \xE9 della radice diventa \xE8 in alcune forme.", es: "Una e o una \xE9 de la ra\xEDz se convierte en \xE8 en algunas formas." },
  "Certains verbes en -eler ou -eter doublent le l ou le t dans une partie de leur conjugaison.": { de: "Manche Verben auf -eler oder -eter verdoppeln in einem Teil ihrer Konjugation l oder t.", en: "Some -eler or -eter verbs double the l or t in part of their conjugation.", it: "Alcuni verbi in -eler o -eter raddoppiano la l o la t in parte della coniugazione.", es: "Algunos verbos en -eler o -eter duplican la l o la t en parte de su conjugaci\xF3n." },
  "Deux i cons\xE9cutifs": { de: "Zwei aufeinanderfolgende i", en: "Two consecutive i letters", it: "Due i consecutive", es: "Dos \xEDes consecutivas" },
  "Le premier i appartient au radical et le second \xE0 la terminaison : les deux doivent \xEAtre \xE9crits.": { de: "Das erste i geh\xF6rt zum Stamm und das zweite zur Endung: Beide m\xFCssen geschrieben werden.", en: "The first i belongs to the stem and the second to the ending: both must be written.", it: "La prima i appartiene alla radice e la seconda alla desinenza: vanno scritte entrambe.", es: "La primera i pertenece a la ra\xEDz y la segunda a la terminaci\xF3n: hay que escribir ambas." },
  "Accent circonflexe aux temps litt\xE9raires": { de: "Zirkumflex in literarischen Zeitformen", en: "Circumflex in literary tenses", it: "Accento circonflesso nei tempi letterari", es: "Acento circunflejo en los tiempos literarios" },
  "Le pass\xE9 simple et le subjonctif imparfait comportent parfois un accent circonflexe facile \xE0 oublier.": { de: "Pass\xE9 simple und Subjonctif imparfait enthalten manchmal einen leicht zu vergessenden Zirkumflex.", en: "The past historic and imperfect subjunctive sometimes contain an easily forgotten circumflex.", it: "Il pass\xE9 simple e il congiuntivo imperfetto contengono talvolta un accento circonflesso facile da dimenticare.", es: "El pass\xE9 simple y el subjuntivo imperfecto llevan a veces un circunflejo f\xE1cil de olvidar." },
  "Radical du futur \xE0 m\xE9moriser": { de: "Futurstamm zum Auswendiglernen", en: "Future stem to memorise", it: "Radice del futuro da memorizzare", es: "Ra\xEDz del futuro que debes memorizar" },
  "Le futur simple et le conditionnel utilisent ici un radical diff\xE9rent de l\u2019infinitif attendu.": { de: "Futur simple und Conditionnel verwenden hier einen anderen Stamm als den vom Infinitiv erwarteten.", en: "The future and conditional use a stem here that differs from the expected infinitive.", it: "Il futuro e il condizionale usano qui una radice diversa da quella attesa dall\u2019infinito.", es: "El futuro y el condicional usan aqu\xED una ra\xEDz distinta de la esperada a partir del infinitivo." },
  "Futur ou conditionnel ?": { de: "Futur oder Konditional?", en: "Future or conditional?", it: "Futuro o condizionale?", es: "\xBFFuturo o condicional?" },
  "Avec je, le futur se termine par -ai et le conditionnel par -ais.": { de: "Mit je endet das Futur auf -ai und das Konditional auf -ais.", en: "With je, the future ends in -ai and the conditional in -ais.", it: "Con je, il futuro termina in -ai e il condizionale in -ais.", es: "Con je, el futuro termina en -ai y el condicional en -ais." },
  "Terminaison -ent muette": { de: "Stumme Endung -ent", en: "Silent -ent ending", it: "Desinenza -ent muta", es: "Terminaci\xF3n -ent muda" },
  "\xC0 la troisi\xE8me personne du pluriel, -ent s\u2019\xE9crit mais ne se prononce g\xE9n\xE9ralement pas.": { de: "In der dritten Person Plural wird -ent geschrieben, aber meist nicht ausgesprochen.", en: "In the third person plural, -ent is written but is generally not pronounced.", it: "Alla terza persona plurale, -ent si scrive ma generalmente non si pronuncia.", es: "En la tercera persona del plural, -ent se escribe pero normalmente no se pronuncia." },
  "Pas de s \xE0 l\u2019imp\xE9ratif": { de: "Kein s im Imperativ", en: "No s in the imperative", it: "Niente s all\u2019imperativo", es: "Sin s en el imperativo" },
  "\xC0 l\u2019imp\xE9ratif pr\xE9sent, les verbes en -er perdent normalement le s de la forme tu.": { de: "Im Imperativ Pr\xE4sens verlieren Verben auf -er normalerweise das s der tu-Form.", en: "In the present imperative, -er verbs normally drop the s from the tu form.", it: "All\u2019imperativo presente, i verbi in -er perdono normalmente la s della forma tu.", es: "En el imperativo presente, los verbos en -er normalmente pierden la s de la forma tu." },
  "Plusieurs formes admises": { de: "Mehrere zul\xE4ssige Formen", en: "Several accepted forms", it: "Pi\xF9 forme ammesse", es: "Varias formas admitidas" },
  "La base contient plusieurs variantes correctes pour cette personne et ce temps.": { de: "Die Datenbank enth\xE4lt f\xFCr diese Person und Zeitform mehrere korrekte Varianten.", en: "The database contains several correct variants for this person and tense.", it: "La banca dati contiene pi\xF9 varianti corrette per questa persona e questo tempo.", es: "La base de datos contiene varias variantes correctas para esta persona y este tiempo." },
  "Conjugaison incompl\xE8te": { de: "Unvollst\xE4ndige Konjugation", en: "Incomplete conjugation", it: "Coniugazione incompleta", es: "Conjugaci\xF3n incompleta" },
  "Ce verbe est impersonnel ou d\xE9fectif : certaines personnes ou certains temps ne s\u2019emploient pas.": { de: "Dieses Verb ist unpers\xF6nlich oder defektiv: Manche Personen oder Zeitformen werden nicht verwendet.", en: "This verb is impersonal or defective: some persons or tenses are not used.", it: "Questo verbo \xE8 impersonale o difettivo: alcune persone o alcuni tempi non si usano.", es: "Este verbo es impersonal o defectivo: algunas personas o tiempos no se usan." },
  "M\xE9thode de recherche du verbe": { de: "Methode der Verbsuche", en: "Verb search method", it: "Metodo di ricerca del verbo", es: "M\xE9todo de b\xFAsqueda del verbo" },
  "Rechercher un verbe": { de: "Ein Verb suchen", en: "Search for a verb", it: "Cerca un verbo", es: "Buscar un verbo" },
  "Liste de A \xE0 Z": { de: "Liste von A bis Z", en: "A\u2013Z list", it: "Elenco dalla A alla Z", es: "Lista de la A a la Z" },
  "Recherche rapide": { de: "Schnellsuche", en: "Quick search", it: "Ricerca rapida", es: "B\xFAsqueda r\xE1pida" },
  "Quel verbe cherches-tu ?": { de: "Welches Verb suchst du?", en: "Which verb are you looking for?", it: "Quale verbo cerchi?", es: "\xBFQu\xE9 verbo buscas?" },
  "Commence \xE0 \xE9crire son infinitif, puis choisis-le dans les propositions.": { de: "Beginne den Infinitiv einzugeben und w\xE4hle ihn dann aus den Vorschl\xE4gen.", en: "Start typing its infinitive, then choose it from the suggestions.", it: "Inizia a scrivere l\u2019infinito, poi sceglilo tra i suggerimenti.", es: "Empieza a escribir el infinitivo y el\xEDgelo entre las sugerencias." },
  "Par exemple : venir": { de: "Zum Beispiel: venir", en: "For example: venir", it: "Per esempio: venir", es: "Por ejemplo: venir" },
  "Catalogue complet": { de: "Vollst\xE4ndiger Katalog", en: "Full catalogue", it: "Catalogo completo", es: "Cat\xE1logo completo" },
  "Tous les verbes de A \xE0 Z": { de: "Alle Verben von A bis Z", en: "All verbs from A to Z", it: "Tutti i verbi dalla A alla Z", es: "Todos los verbos de la A a la Z" },
  "Acc\xE8s aux lettres": { de: "Buchstabennavigation", en: "Letter navigation", it: "Navigazione per lettera", es: "Navegaci\xF3n por letras" },
  "Retour au choix du verbe": { de: "Zur\xFCck zur Verbauswahl", en: "Back to verb selection", it: "Torna alla scelta del verbo", es: "Volver a la selecci\xF3n del verbo" },
  "Retour au d\xE9fi": { de: "Zur\xFCck zur Aufgabe", en: "Back to the challenge", it: "Torna alla sfida", es: "Volver al reto" },
  "Chargement de la conjugaison\u2026": { de: "Konjugation wird geladen\u2026", en: "Loading conjugation\u2026", it: "Caricamento della coniugazione\u2026", es: "Cargando conjugaci\xF3n\u2026" },
  "Retour \xE0 la liste": { de: "Zur\xFCck zur Liste", en: "Back to the list", it: "Torna all\u2019elenco", es: "Volver a la lista" },
  "Conjugaison du verbe": { de: "Konjugation des Verbs", en: "Verb conjugation", it: "Coniugazione del verbo", es: "Conjugaci\xF3n del verbo" },
  "Groupe": { de: "Gruppe", en: "Group", it: "Gruppo", es: "Grupo" },
  "groupe irr\xE9gulier": { de: "unregelm\xE4\xDFige Gruppe", en: "irregular group", it: "gruppo irregolare", es: "grupo irregular" },
  "1er groupe": { de: "1. Gruppe", en: "1st group", it: "1\xBA gruppo", es: "1.er grupo" },
  "2e groupe": { de: "2. Gruppe", en: "2nd group", it: "2\xBA gruppo", es: "2.\xBA grupo" },
  "3e groupe": { de: "3. Gruppe", en: "3rd group", it: "3\xBA gruppo", es: "3.er grupo" },
  "Auxiliaire": { de: "Hilfsverb", en: "Auxiliary", it: "Ausiliare", es: "Auxiliar" },
  "Acc\xE8s aux modes": { de: "Navigation nach Modi", en: "Mood navigation", it: "Navigazione per modi", es: "Navegaci\xF3n por modos" },
  "Formes non personnelles": { de: "Unpers\xF6nliche Formen", en: "Non-finite forms", it: "Forme non personali", es: "Formas no personales" },
  "Profil": { de: "Profil", en: "Profile", it: "Profilo", es: "Perfil" },
  "Mon compte": { de: "Mein Konto", en: "My account", it: "Il mio account", es: "Mi cuenta" },
  "Informations associ\xE9es \xE0 votre session administrateur.": { de: "Informationen zu Ihrer Administratorsitzung.", en: "Information associated with your administrator session.", it: "Informazioni associate alla sessione amministratore.", es: "Informaci\xF3n asociada a tu sesi\xF3n de administrador." },
  "Administrateur": { de: "Administrator", en: "Administrator", it: "Amministratore", es: "Administrador" },
  "Pr\xE9nom": { de: "Vorname", en: "First name", it: "Nome", es: "Nombre" },
  "Nom": { de: "Nachname", en: "Last name", it: "Cognome", es: "Apellido" },
  "Nom d\u2019utilisateur": { de: "Benutzername", en: "Username", it: "Nome utente", es: "Nombre de usuario" },
  "Adresse e-mail": { de: "E-Mail-Adresse", en: "Email address", it: "Indirizzo e-mail", es: "Correo electr\xF3nico" },
  "Identifiant": { de: "Kennung", en: "Identifier", it: "Identificativo", es: "Identificador" },
  "Niveau d\u2019acc\xE8s": { de: "Zugriffsebene", en: "Access level", it: "Livello di accesso", es: "Nivel de acceso" },
  "Modification du profil": { de: "Profil bearbeiten", en: "Edit profile", it: "Modifica del profilo", es: "Editar perfil" },
  "Cette version permet de consulter le compte. Aucune API de modification du profil ou du mot de passe n\u2019est disponible.": { de: "In dieser Version kann das Konto eingesehen werden. Eine Schnittstelle zum \xC4ndern des Profils oder Passworts ist nicht verf\xFCgbar.", en: "This version lets you view the account. No API is available for changing the profile or password.", it: "Questa versione permette di consultare l\u2019account. Non \xE8 disponibile un\u2019API per modificare il profilo o la password.", es: "Esta versi\xF3n permite consultar la cuenta. No hay disponible una API para modificar el perfil o la contrase\xF1a." },
  "Ton d\xE9fi est pr\xEAt": { de: "Deine \xDCbung ist bereit", en: "Your challenge is ready", it: "Il tuo esercizio \xE8 pronto", es: "Tu ejercicio est\xE1 listo" },
  "Comment veux-tu l\u2019utiliser ?": { de: "Wie m\xF6chtest du sie verwenden?", en: "How would you like to use it?", it: "Come vuoi usarlo?", es: "\xBFC\xF3mo quieres utilizarlo?" },
  "Lancer le d\xE9fi": { de: "\xDCbung starten", en: "Start the challenge", it: "Avvia l\u2019esercizio", es: "Iniciar el ejercicio" },
  "Questions et correction imm\xE9diate": { de: "Fragen mit sofortiger Korrektur", en: "Questions with instant feedback", it: "Domande e correzione immediata", es: "Preguntas y correcci\xF3n inmediata" },
  "Dialogue virtuel avec une aide pas \xE0 pas": { de: "Virtueller Dialog mit schrittweiser Hilfe", en: "Virtual dialogue with step-by-step help", it: "Dialogo virtuale con aiuto passo passo", es: "Di\xE1logo virtual con ayuda paso a paso" },
  "Les questions et le corrig\xE9": { de: "Fragen und L\xF6sungen", en: "Questions and answer key", it: "Domande e soluzioni", es: "Preguntas y soluciones" },
  "Partager ce d\xE9fi avec d\u2019autres personnes": { de: "Diese \xDCbung mit anderen teilen", en: "Share this challenge with others", it: "Condividi questo esercizio con altre persone", es: "Compartir este ejercicio con otras personas" },
  "Mes options": { de: "Meine Optionen", en: "My options", it: "Le mie opzioni", es: "Mis opciones" },
  "Nombre de questions": { de: "Anzahl der Fragen", en: "Number of questions", it: "Numero di domande", es: "N\xFAmero de preguntas" },
  "Pronoms": { de: "Pronomen", en: "Pronouns", it: "Pronomi", es: "Pronombres" },
  "Inclure les pronoms": { de: "Pronomen einbeziehen", en: "Include pronouns", it: "Includi i pronomi", es: "Incluir pronombres" },
  "Voix du verbe": { de: "Verbform", en: "Verb voice", it: "Voce del verbo", es: "Voz del verbo" },
  "Active uniquement": { de: "Nur Aktiv", en: "Active only", it: "Solo attiva", es: "Solo activa" },
  "Passive uniquement": { de: "Nur Passiv", en: "Passive only", it: "Solo passiva", es: "Solo pasiva" },
  "Active et passive": { de: "Aktiv und Passiv", en: "Active and passive", it: "Attiva e passiva", es: "Activa y pasiva" },
  "Le COD devient le sujet de la phrase.": { de: "Das direkte Objekt wird zum Subjekt des Satzes.", en: "The direct object becomes the subject of the sentence.", it: "Il complemento oggetto diventa il soggetto della frase.", es: "El complemento directo se convierte en el sujeto de la oraci\xF3n." },
  "Les deux voix alterneront dans le d\xE9fi.": { de: "Beide Formen wechseln sich in der \xDCbung ab.", en: "Both voices will alternate in the challenge.", it: "Le due voci si alterneranno nella sfida.", es: "Las dos voces se alternar\xE1n en el reto." },
  "Aucun verbe s\xE9lectionn\xE9 ne poss\xE8de de COD valid\xE9.": { de: "Keines der ausgew\xE4hlten Verben hat ein validiertes direktes Objekt.", en: "None of the selected verbs has a validated direct object.", it: "Nessun verbo selezionato ha un complemento oggetto convalidato.", es: "Ning\xFAn verbo seleccionado tiene un complemento directo validado." },
  "Ils appara\xEEtront ponctuellement dans les questions.": { de: "Sie erscheinen gelegentlich in den Fragen.", en: "They will occasionally appear in questions.", it: "Appariranno occasionalmente nelle domande.", es: "Aparecer\xE1n ocasionalmente en las preguntas." },
  "Inclure le pronom": { de: "Pronomen einbeziehen", en: "Include the pronoun", it: "Includi il pronome", es: "Incluir el pronombre" },
  "Il appara\xEEtra ponctuellement dans les questions \xE0 la troisi\xE8me personne du singulier.": { de: "Es erscheint gelegentlich in Fragen in der dritten Person Singular.", en: "It will occasionally appear in third-person singular questions.", it: "Apparir\xE0 occasionalmente nelle domande alla terza persona singolare.", es: "Aparecer\xE1 ocasionalmente en preguntas en tercera persona del singular." },
  "Type d\u2019exercice": { de: "\xDCbungstyp", en: "Exercise type", it: "Tipo di esercizio", es: "Tipo de ejercicio" },
  "Choix des verbes": { de: "Auswahl der Verben", en: "Verb selection", it: "Scelta dei verbi", es: "Selecci\xF3n de verbos" },
  "Conjuguer": { de: "Konjugieren", en: "Conjugate", it: "Coniugare", es: "Conjugar" },
  "Conjuguer les formes demand\xE9es": { de: "Die verlangten Formen konjugieren", en: "Conjugate the requested forms", it: "Coniugare le forme richieste", es: "Conjugar las formas solicitadas" },
  "avec compl\xE9ments,": { de: "mit Erg\xE4nzungen,", en: "with complements,", it: "con complementi,", es: "con complementos," },
  "Trouver le mode et le temps": { de: "Modus und Zeitform bestimmen", en: "Identify the mood and tense", it: "Trovare il modo e il tempo", es: "Identificar el modo y el tiempo" },
  "Trouver le mode et les temps": { de: "Modus und Zeitformen bestimmen", en: "Identify the mood and tenses", it: "Trovare il modo e i tempi", es: "Identificar el modo y los tiempos" },
  "Avec mes verbes": { de: "Mit meinen Verben", en: "With my verbs", it: "Con i miei verbi", es: "Con mis verbos" },
  "Formes conjugu\xE9es simples, sans citation.": { de: "Einfache konjugierte Formen, ohne Zitat.", en: "Simple conjugated forms, without quotations.", it: "Forme coniugate semplici, senza citazioni.", es: "Formas conjugadas simples, sin citas." },
  "Avec n\u2019importe quel verbe": { de: "Mit beliebigen Verben", en: "With any verb", it: "Con qualsiasi verbo", es: "Con cualquier verbo" },
  "Construits avec des phrases litt\xE9raires.": { de: "Mit literarischen S\xE4tzen erstellt.", en: "Built from literary sentences.", it: "Costruiti con frasi letterarie.", es: "Construidos con frases literarias." },
  "Disponible uniquement pour un exercice de conjugaison.": { de: "Nur f\xFCr Konjugations\xFCbungen verf\xFCgbar.", en: "Available only for conjugation exercises.", it: "Disponibile solo per gli esercizi di coniugazione.", es: "Disponible solo para los ejercicios de conjugaci\xF3n." },
  "Au passif, le COD devient le sujet : ces options ne s\u2019appliquent pas.": { de: "Im Passiv wird das direkte Objekt zum Subjekt: Diese Optionen gelten hier nicht.", en: "In the passive voice, the direct object becomes the subject, so these options do not apply.", it: "Nella forma passiva, il complemento oggetto diventa il soggetto: queste opzioni non si applicano.", es: "En la voz pasiva, el complemento directo se convierte en sujeto: estas opciones no se aplican." },
  "Les verbes choisis ne proposent pas de compl\xE9ment.": { de: "F\xFCr die ausgew\xE4hlten Verben sind keine Objekterg\xE4nzungen verf\xFCgbar.", en: "The selected verbs do not provide any object complements.", it: "I verbi selezionati non prevedono complementi oggetto.", es: "Los verbos seleccionados no incluyen complementos de objeto." },
  "Compl\xE9ments d\u2019objets :": { de: "Objekterg\xE4nzungen:", en: "Object complements:", it: "Complementi oggetto:", es: "Complementos de objeto:" },
  "Ajoute des compl\xE9ments d\u2019objets directs ou indirects.": { de: "F\xFCge direkte oder indirekte Objekte hinzu.", en: "Add direct or indirect object complements.", it: "Aggiungi complementi oggetto diretti o indiretti.", es: "A\xF1ade complementos de objeto directos o indirectos." },
  "nouveau": { de: "neu", en: "new", it: "nuovo", es: "nuevo" },
  "Pr\xE9sentation des compl\xE9ments d\u2019objets": { de: "Position der Objekterg\xE4nzungen", en: "Object complement placement", it: "Posizione dei complementi oggetto", es: "Posici\xF3n de los complementos de objeto" },
  "toujours apr\xE8s": { de: "immer danach", en: "always after", it: "sempre dopo", es: "siempre despu\xE9s" },
  "parfois avant": { de: "manchmal davor", en: "sometimes before", it: "a volte prima", es: "a veces antes" },
  "avant si possible": { de: "wenn m\xF6glich davor", en: "before when possible", it: "prima se possibile", es: "antes si es posible" },
  "COD plac\xE9 apr\xE8s": { de: "Direktes Objekt danach", en: "Direct object after", it: "Oggetto diretto dopo", es: "Objeto directo despu\xE9s" },
  "COD plac\xE9 avant": { de: "Direktes Objekt davor", en: "Direct object before", it: "Oggetto diretto prima", es: "Objeto directo antes" },
  "COI plac\xE9 apr\xE8s": { de: "Indirektes Objekt danach", en: "Indirect object after", it: "Oggetto indiretto dopo", es: "Objeto indirecto despu\xE9s" },
  "COI plac\xE9 avant": { de: "Indirektes Objekt davor", en: "Indirect object before", it: "Oggetto indiretto prima", es: "Objeto indirecto antes" },
  "Aper\xE7u d\u2019une question": { de: "Vorschau einer Frage", en: "Question preview", it: "Anteprima di una domanda", es: "Vista previa de una pregunta" },
  "Pr\xE9paration de l\u2019aper\xE7u": { de: "Vorschau wird vorbereitet", en: "Preparing preview", it: "Preparazione dell\u2019anteprima", es: "Preparando vista previa" },
  "Exemple de question": { de: "Beispielfrage", en: "Sample question", it: "Esempio di domanda", es: "Ejemplo de pregunta" },
  "R\xE9ponse attendue": { de: "Erwartete Antwort", en: "Expected answer", it: "Risposta attesa", es: "Respuesta esperada" },
  "Gratuit \xB7 sans publicit\xE9 \xB7 personnalisable": { de: "Kostenlos \xB7 werbefrei \xB7 anpassbar", en: "Free \xB7 ad-free \xB7 customisable", it: "Gratuito \xB7 senza pubblicit\xE0 \xB7 personalizzabile", es: "Gratis \xB7 sin publicidad \xB7 personalizable" },
  "Cr\xE9e ton d\xE9fi de conjugaison": { de: "Erstelle deine Konjugations\xFCbung", en: "Create your conjugation challenge", it: "Crea il tuo esercizio di coniugazione", es: "Crea tu ejercicio de conjugaci\xF3n" },
  "Choisis les verbes et les temps \xE0 travailler, puis exerce-toi en ligne ou imprime une fiche avec son corrig\xE9.": { de: "W\xE4hle die Verben und Zeitformen aus und \xFCbe online oder drucke ein Arbeitsblatt mit L\xF6sungen.", en: "Choose the verbs and tenses to practise, then work online or print a worksheet with its answer key.", it: "Scegli i verbi e i tempi da esercitare, poi allenati online o stampa una scheda con le soluzioni.", es: "Elige los verbos y tiempos que quieras practicar y trabaja en l\xEDnea o imprime una ficha con soluciones." },
  "Chargement du catalogue de conjugaison\u2026": { de: "Konjugationskatalog wird geladen\u2026", en: "Loading conjugation catalogue\u2026", it: "Caricamento del catalogo di coniugazione\u2026", es: "Cargando cat\xE1logo de conjugaci\xF3n\u2026" },
  "Pr\xE9paration de la s\xE9ance\u2026": { de: "\xDCbung wird vorbereitet\u2026", en: "Preparing the session\u2026", it: "Preparazione della sessione\u2026", es: "Preparando la sesi\xF3n\u2026" },
  "Tu as re\xE7u ou enregistr\xE9 un d\xE9fi ?": { de: "Hast du eine \xDCbung erhalten oder gespeichert?", en: "Have you received or saved a challenge?", it: "Hai ricevuto o salvato un esercizio?", es: "\xBFHas recibido o guardado un ejercicio?" },
  "Charger un d\xE9fi avec son code": { de: "\xDCbung mit Code laden", en: "Load a challenge using its code", it: "Carica un esercizio con il codice", es: "Cargar un ejercicio con su c\xF3digo" },
  "R\xE9sum\xE9 de ton d\xE9fi": { de: "Zusammenfassung deiner \xDCbung", en: "Challenge summary", it: "Riepilogo del tuo esercizio", es: "Resumen de tu ejercicio" },
  "Ton d\xE9fi n\u2019est pas encore complet": { de: "Deine \xDCbung ist noch nicht vollst\xE4ndig", en: "Your challenge is not complete yet", it: "Il tuo esercizio non \xE8 ancora completo", es: "Tu ejercicio a\xFAn no est\xE1 completo" },
  "Aucune question ne correspond \xE0 cette s\xE9lection.": { de: "F\xFCr diese Auswahl gibt es keine passende Frage.", en: "No questions match this selection.", it: "Nessuna domanda corrisponde a questa selezione.", es: "Ninguna pregunta corresponde a esta selecci\xF3n." },
  "Impossible de pr\xE9parer le questionnaire.": { de: "Der Fragebogen konnte nicht vorbereitet werden.", en: "The questionnaire could not be prepared.", it: "Impossibile preparare il questionario.", es: "No se ha podido preparar el cuestionario." },
  "Aucune nouvelle question ne correspond \xE0 cette s\xE9lection.": { de: "F\xFCr diese Auswahl gibt es keine neue passende Frage.", en: "No new questions match this selection.", it: "Nessuna nuova domanda corrisponde a questa selezione.", es: "Ninguna pregunta nueva corresponde a esta selecci\xF3n." },
  "Impossible de pr\xE9parer la fiche \xE0 imprimer.": { de: "Das Arbeitsblatt konnte nicht zum Drucken vorbereitet werden.", en: "The printable worksheet could not be prepared.", it: "Impossibile preparare la scheda da stampare.", es: "No se ha podido preparar la ficha para imprimir." },
  "Impossible de sauvegarder ce d\xE9fi.": { de: "Diese \xDCbung konnte nicht gespeichert werden.", en: "This challenge could not be saved.", it: "Impossibile salvare questo esercizio.", es: "No se ha podido guardar este ejercicio." },
  "Ce code ne correspond \xE0 aucun d\xE9fi.": { de: "Dieser Code geh\xF6rt zu keiner \xDCbung.", en: "This code does not match any challenge.", it: "Questo codice non corrisponde ad alcun esercizio.", es: "Este c\xF3digo no corresponde a ning\xFAn ejercicio." },
  "S\xE9lectionne au moins un verbe et un temps pour pouvoir le lancer.": { de: "W\xE4hle mindestens ein Verb und eine Zeitform aus, um zu beginnen.", en: "Select at least one verb and one tense to start it.", it: "Seleziona almeno un verbo e un tempo per iniziare.", es: "Selecciona al menos un verbo y un tiempo para empezar." },
  "D\xE9fi enregistr\xE9": { de: "\xDCbung gespeichert", en: "Challenge saved", it: "Esercizio salvato", es: "Ejercicio guardado" },
  "Charger un d\xE9fi": { de: "\xDCbung laden", en: "Load a challenge", it: "Carica un esercizio", es: "Cargar un ejercicio" },
  "Saisissez ou collez le code re\xE7u. Les tirets sont ajout\xE9s automatiquement.": { de: "Gib den erhaltenen Code ein. Bindestriche werden automatisch erg\xE4nzt.", en: "Enter or paste the code you received. Hyphens are added automatically.", it: "Inserisci o incolla il codice ricevuto. I trattini vengono aggiunti automaticamente.", es: "Escribe o pega el c\xF3digo recibido. Los guiones se a\xF1aden autom\xE1ticamente." },
  "Code \xE0 8 caract\xE8res": { de: "8-stelliger Code", en: "8-character code", it: "Codice di 8 caratteri", es: "C\xF3digo de 8 caracteres" },
  "Le code doit ressembler \xE0 AB-CD-EF-23.": { de: "Der Code muss dem Muster AB-CD-EF-23 entsprechen.", en: "The code should look like AB-CD-EF-23.", it: "Il codice deve essere simile a AB-CD-EF-23.", es: "El c\xF3digo debe tener el formato AB-CD-EF-23." },
  "Cat\xE9gories": { de: "Kategorien", en: "Categories", it: "Categorie", es: "Categor\xEDas" },
  "autres verbes": { de: "weitere Verben", en: "other verbs", it: "altri verbi", es: "otros verbos" },
  "Choisir le nombre de verbes": { de: "Anzahl der Verben w\xE4hlen", en: "Choose the number of verbs", it: "Scegli il numero di verbi", es: "Elegir el n\xFAmero de verbos" },
  "Choisissez un niveau ou une famille de verbes, puis ajustez librement la s\xE9lection.": { de: "W\xE4hle eine Stufe oder Verbfamilie und passe die Auswahl anschlie\xDFend frei an.", en: "Choose a level or verb family, then adjust the selection as you wish.", it: "Scegli un livello o una famiglia di verbi, poi modifica liberamente la selezione.", es: "Elige un nivel o una familia de verbos y ajusta libremente la selecci\xF3n." },
  "Choisir un niveau ou un entra\xEEnement\u2026": { de: "Stufe oder Training w\xE4hlen\u2026", en: "Choose a level or practice set\u2026", it: "Scegli un livello o un allenamento\u2026", es: "Elegir un nivel o una pr\xE1ctica\u2026" },
  "Cat\xE9gories de d\xE9fis": { de: "\xDCbungskategorien", en: "Challenge categories", it: "Categorie di esercizi", es: "Categor\xEDas de ejercicios" },
  "Verbes": { de: "Verben", en: "Verbs", it: "Verbi", es: "Verbos" },
  "verbe": { de: "Verb", en: "verb", it: "verbo", es: "verbo" },
  "verbes": { de: "Verben", en: "verbs", it: "verbi", es: "verbos" },
  "s\xE9lectionn\xE9": { de: "ausgew\xE4hlt", en: "selected", it: "selezionato", es: "seleccionado" },
  "s\xE9lectionn\xE9s": { de: "ausgew\xE4hlt", en: "selected", it: "selezionati", es: "seleccionados" },
  "temps": { de: "Zeitformen", en: "tenses", it: "tempi", es: "tiempos" },
  "question": { de: "Frage", en: "question", it: "domanda", es: "pregunta" },
  "questions": { de: "Fragen", en: "questions", it: "domande", es: "preguntas" },
  "r\xE9ponse juste": { de: "richtige Antwort", en: "correct answer", it: "risposta corretta", es: "respuesta correcta" },
  "r\xE9ponses justes": { de: "richtige Antworten", en: "correct answers", it: "risposte corrette", es: "respuestas correctas" },
  "Temps": { de: "Zeitformen", en: "Tenses", it: "Tempi", es: "Tiempos" },
  "Tous les verbes": { de: "Alle Verben", en: "All verbs", it: "Tutti i verbi", es: "Todos los verbos" },
  "1 au hasard": { de: "1 zuf\xE4llig", en: "1 at random", it: "1 a caso", es: "1 al azar" },
  "2 au hasard": { de: "2 zuf\xE4llig", en: "2 at random", it: "2 a caso", es: "2 al azar" },
  "3 au hasard": { de: "3 zuf\xE4llig", en: "3 at random", it: "3 a caso", es: "3 al azar" },
  "5 au hasard": { de: "5 zuf\xE4llig", en: "5 at random", it: "5 a caso", es: "5 al azar" },
  "10 au hasard": { de: "10 zuf\xE4llig", en: "10 at random", it: "10 a caso", es: "10 al azar" },
  "Pour d\xE9marrer rapidement": { de: "F\xFCr einen schnellen Start", en: "For a quick start", it: "Per iniziare rapidamente", es: "Para empezar r\xE1pidamente" },
  "D\xE9fis pr\xEAts \xE0 l\u2019emploi": { de: "Fertige \xDCbungen", en: "Ready-made challenges", it: "Esercizi pronti all\u2019uso", es: "Ejercicios listos para usar" },
  "Choisir un d\xE9fi pr\xEAt \xE0 l\u2019emploi": { de: "Eine fertige \xDCbung w\xE4hlen", en: "Choose a ready-made challenge", it: "Scegli un esercizio pronto", es: "Elegir un ejercicio listo" },
  "Au hasard :": { de: "Zuf\xE4llig:", en: "At random:", it: "A caso:", es: "Al azar:" },
  "Autres temps": { de: "Weitere Zeitformen", en: "Other tenses", it: "Altri tempi", es: "Otros tiempos" },
  "Autres": { de: "Weitere", en: "Other", it: "Altri", es: "Otros" },
  "Aper\xE7u avant impression": { de: "Druckvorschau", en: "Print preview", it: "Anteprima di stampa", es: "Vista previa de impresi\xF3n" },
  "Personnalisation": { de: "Anpassung", en: "Customisation", it: "Personalizzazione", es: "Personalizaci\xF3n" },
  "Options de la fiche": { de: "Arbeitsblattoptionen", en: "Worksheet options", it: "Opzioni della scheda", es: "Opciones de la ficha" },
  "Les changements apparaissent imm\xE9diatement dans l\u2019aper\xE7u.": { de: "\xC4nderungen erscheinen sofort in der Vorschau.", en: "Changes appear immediately in the preview.", it: "Le modifiche appaiono subito nell\u2019anteprima.", es: "Los cambios aparecen inmediatamente en la vista previa." },
  "Titre de la fiche": { de: "Titel des Arbeitsblatts", en: "Worksheet title", it: "Titolo della scheda", es: "T\xEDtulo de la ficha" },
  "Espace avant le titre": { de: "Abstand vor dem Titel", en: "Space before the title", it: "Spazio prima del titolo", es: "Espacio antes del t\xEDtulo" },
  "Espacement entre les questions": { de: "Abstand zwischen den Fragen", en: "Spacing between questions", it: "Spaziatura tra le domande", es: "Espacio entre las preguntas" },
  "Mise en page": { de: "Layout", en: "Layout", it: "Impaginazione", es: "Dise\xF1o" },
  "Informations de l\u2019\xE9l\xE8ve": { de: "Angaben zum Sch\xFCler", en: "Student information", it: "Informazioni dell\u2019alunno", es: "Informaci\xF3n del alumno" },
  "Date": { de: "Datum", en: "Date", it: "Data", es: "Fecha" },
  "Espace pour la note": { de: "Platz f\xFCr die Note", en: "Space for the mark", it: "Spazio per il voto", es: "Espacio para la nota" },
  "Contenu affich\xE9": { de: "Angezeigter Inhalt", en: "Displayed content", it: "Contenuto visualizzato", es: "Contenido mostrado" },
  "Liste des verbes": { de: "Verbliste", en: "Verb list", it: "Elenco dei verbi", es: "Lista de verbos" },
  "Liste des temps": { de: "Liste der Zeitformen", en: "Tense list", it: "Elenco dei tempi", es: "Lista de tiempos" },
  "Num\xE9ro questionnaire/corrig\xE9": { de: "Nummer des Fragebogens/der L\xF6sung", en: "Questionnaire/answer-key number", it: "Numero questionario/soluzioni", es: "N\xFAmero de cuestionario/soluciones" },
  "Aper\xE7u exact de la fiche PDF et de son corrig\xE9": { de: "Genaue Vorschau des PDF-Arbeitsblatts und der L\xF6sungen", en: "Exact preview of the PDF worksheet and its answer key", it: "Anteprima esatta della scheda PDF e delle soluzioni", es: "Vista exacta de la ficha PDF y sus soluciones" },
  "Cr\xE9ation de l\u2019aper\xE7u PDF\u2026": { de: "PDF-Vorschau wird erstellt\u2026", en: "Creating PDF preview\u2026", it: "Creazione dell\u2019anteprima PDF\u2026", es: "Creando vista previa en PDF\u2026" },
  "La fiche et le corrig\xE9 sont mis en page.": { de: "Arbeitsblatt und L\xF6sungen werden formatiert.", en: "The worksheet and answer key are being laid out.", it: "La scheda e le soluzioni vengono impaginate.", es: "Se est\xE1n maquetando la ficha y las soluciones." },
  "Impossible de g\xE9n\xE9rer l\u2019aper\xE7u PDF.": { de: "Die PDF-Vorschau konnte nicht erstellt werden.", en: "The PDF preview could not be generated.", it: "Impossibile generare l\u2019anteprima PDF.", es: "No se ha podido generar la vista previa en PDF." },
  "L\u2019aper\xE7u PDF n\u2019a pas pu \xEAtre cr\xE9\xE9.": { de: "Die PDF-Vorschau konnte nicht erstellt werden.", en: "The PDF preview could not be created.", it: "Impossibile creare l\u2019anteprima PDF.", es: "No se ha podido crear la vista previa en PDF." },
  "CORRIG\xC9": { de: "L\xD6SUNGEN", en: "ANSWER KEY", it: "SOLUZIONI", es: "SOLUCIONES" },
  "D\xE9fi sauvegard\xE9": { de: "\xDCbung gespeichert", en: "Challenge saved", it: "Esercizio salvato", es: "Ejercicio guardado" },
  "Votre d\xE9fi est pr\xEAt \xE0 \xEAtre partag\xE9": { de: "Deine \xDCbung kann geteilt werden", en: "Your challenge is ready to share", it: "Il tuo esercizio \xE8 pronto per essere condiviso", es: "Tu ejercicio est\xE1 listo para compartir" },
  "Deux possibilit\xE9s permettent \xE0 vos \xE9l\xE8ves de retrouver ce d\xE9fi.": { de: "Deine Sch\xFClerinnen und Sch\xFCler k\xF6nnen diese \xDCbung auf zwei Arten wiederfinden.", en: "Your students can retrieve this challenge in two ways.", it: "Gli alunni possono ritrovare questo esercizio in due modi.", es: "Tus alumnos pueden recuperar este ejercicio de dos maneras." },
  "Sauvegarder le code": { de: "Code speichern", en: "Save the code", it: "Salva il codice", es: "Guardar el c\xF3digo" },
  "L\u2019\xE9l\xE8ve conserve ce code. Plus tard, il le copie sur la page d\u2019accueil pour retrouver ce d\xE9fi.": { de: "Der Sch\xFCler bewahrt diesen Code auf und gibt ihn sp\xE4ter auf der Startseite ein, um die \xDCbung wiederzufinden.", en: "The student keeps this code and later enters it on the home page to retrieve the challenge.", it: "L\u2019alunno conserva il codice e lo inserisce in seguito nella home page per ritrovare l\u2019esercizio.", es: "El alumno guarda el c\xF3digo y lo introduce m\xE1s tarde en la p\xE1gina de inicio para recuperar el ejercicio." },
  "Id\xE9al pour transmettre le d\xE9fi par \xE9crit": { de: "Ideal, um die \xDCbung schriftlich weiterzugeben", en: "Ideal for sharing the challenge in writing", it: "Ideale per trasmettere l\u2019esercizio per iscritto", es: "Ideal para compartir el ejercicio por escrito" },
  "Code \xE0 conserver": { de: "Code zum Aufbewahren", en: "Code to keep", it: "Codice da conservare", es: "C\xF3digo que debes guardar" },
  "Comment le recharger plus tard ?": { de: "Wie kann ich ihn sp\xE4ter laden?", en: "How can it be loaded later?", it: "Come ricaricarlo in seguito?", es: "\xBFC\xF3mo cargarlo m\xE1s tarde?" },
  "Emplacement du code re\xE7u sur la page d\u2019accueil": { de: "Eingabefeld f\xFCr den erhaltenen Code auf der Startseite", en: "Where to enter the received code on the home page", it: "Posizione del codice ricevuto nella home page", es: "Lugar para introducir el c\xF3digo recibido en la p\xE1gina de inicio" },
  "page d\u2019accueil": { de: "Startseite", en: "home page", it: "home page", es: "p\xE1gina de inicio" },
  "Envoyer le lien direct": { de: "Direktlink senden", en: "Send the direct link", it: "Invia il link diretto", es: "Enviar el enlace directo" },
  "L\u2019\xE9l\xE8ve clique simplement sur ce lien : il arrive directement sur le d\xE9fi, sans saisir le code.": { de: "Der Sch\xFCler klickt einfach auf diesen Link und gelangt ohne Codeeingabe direkt zur \xDCbung.", en: "The student simply clicks this link to open the challenge directly, without entering the code.", it: "L\u2019alunno fa clic sul link e accede direttamente all\u2019esercizio senza inserire il codice.", es: "El alumno solo tiene que hacer clic en el enlace para abrir el ejercicio sin introducir el c\xF3digo." },
  "Id\xE9al pour transmettre le d\xE9fi par email": { de: "Ideal zum Versenden per E-Mail", en: "Ideal for sharing the challenge by email", it: "Ideale per inviare l\u2019esercizio via e-mail", es: "Ideal para enviar el ejercicio por correo electr\xF3nico" },
  "Lien \xE0 envoyer": { de: "Link zum Senden", en: "Link to send", it: "Link da inviare", es: "Enlace para enviar" },
  "\xC9tape 1": { de: "Schritt 1", en: "Step 1", it: "Passaggio 1", es: "Paso 1" },
  "\xC9tape 2": { de: "Schritt 2", en: "Step 2", it: "Passaggio 2", es: "Paso 2" },
  "Mes verbes": { de: "Meine Verben", en: "My verbs", it: "I miei verbi", es: "Mis verbos" },
  "Mes temps": { de: "Meine Zeitformen", en: "My tenses", it: "I miei tempi", es: "Mis tiempos" },
  "Ajouter un verbe": { de: "Verb hinzuf\xFCgen", en: "Add a verb", it: "Aggiungi un verbo", es: "A\xF1adir un verbo" },
  "Ex. aller, \xEAtre, finir\u2026": { de: "Z. B. aller, \xEAtre, finir\u2026", en: "E.g. aller, \xEAtre, finir\u2026", it: "Es. aller, \xEAtre, finir\u2026", es: "P. ej. aller, \xEAtre, finir\u2026" },
  "Ajouter le premier verbe propos\xE9": { de: "Erstes vorgeschlagenes Verb hinzuf\xFCgen", en: "Add the first suggested verb", it: "Aggiungi il primo verbo suggerito", es: "A\xF1adir el primer verbo sugerido" },
  "Verbes propos\xE9s": { de: "Vorgeschlagene Verben", en: "Suggested verbs", it: "Verbi suggeriti", es: "Verbos sugeridos" },
  "forme pronominale g\xE9n\xE9r\xE9e": { de: "erzeugte pronominale Form", en: "generated pronominal form", it: "forma pronominale generata", es: "forma pronominal generada" },
  "auxiliaire": { de: "Hilfsverb", en: "auxiliary", it: "ausiliare", es: "auxiliar" },
  "Verbes s\xE9lectionn\xE9s": { de: "Ausgew\xE4hlte Verben", en: "Selected verbs", it: "Verbi selezionati", es: "Verbos seleccionados" },
  "Tout supprimer": { de: "Alle entfernen", en: "Remove all", it: "Rimuovi tutto", es: "Eliminar todo" },
  "Tout cocher": { de: "Alle ausw\xE4hlen", en: "Select all", it: "Seleziona tutto", es: "Seleccionar todo" },
  "Tout d\xE9cocher": { de: "Alle abw\xE4hlen", en: "Clear all", it: "Deseleziona tutto", es: "Deseleccionar todo" },
  "Exemple:": { de: "Beispiel:", en: "Example:", it: "Esempio:", es: "Ejemplo:" },
  "Voir un exemple :": { de: "Beispiel anzeigen:", en: "View an example:", it: "Vedi un esempio:", es: "Ver un ejemplo:" },
  "Exemple momentan\xE9ment indisponible.": { de: "Beispiel vor\xFCbergehend nicht verf\xFCgbar.", en: "Example temporarily unavailable.", it: "Esempio temporaneamente non disponibile.", es: "Ejemplo no disponible temporalmente." },
  "Composer un d\xE9fi personnalis\xE9": { de: "Eigene \xDCbung erstellen", en: "Create a custom challenge", it: "Crea un esercizio personalizzato", es: "Crear un ejercicio personalizado" },
  "Niveau scolaire suisse": { de: "Schweizer Schulstufe", en: "Swiss school level", it: "Livello scolastico svizzero", es: "Nivel escolar suizo" },
  "Construire mon d\xE9fi": { de: "Meine \xDCbung erstellen", en: "Build my challenge", it: "Crea il mio esercizio", es: "Crear mi ejercicio" },
  "Exercices de conjugaison fran\xE7aise, gratuits et sans publicit\xE9": { de: "Kostenlose und werbefreie \xDCbungen zur franz\xF6sischen Konjugation", en: "Free, ad-free French conjugation exercises", it: "Esercizi gratuiti di coniugazione francese senza pubblicit\xE0", es: "Ejercicios gratuitos de conjugaci\xF3n francesa sin publicidad" },
  "\xC9tapes de cr\xE9ation du d\xE9fi": { de: "Schritte zur Erstellung der \xDCbung", en: "Challenge creation steps", it: "Passaggi per creare l\u2019esercizio", es: "Pasos para crear el ejercicio" },
  "Options": { de: "Optionen", en: "Options", it: "Opzioni", es: "Opciones" },
  "Finaliser le d\xE9fi": { de: "\xDCbung fertigstellen", en: "Finish the challenge", it: "Completa l\u2019esercizio", es: "Finalizar el ejercicio" },
  "Cr\xE9er": { de: "Erstellen", en: "Create", it: "Crea", es: "Crear" },
  "Utiliser le d\xE9fi": { de: "\xDCbung verwenden", en: "Use the challenge", it: "Usa l\u2019esercizio", es: "Utilizar el ejercicio" },
  "Pr\xE9paration de ton d\xE9fi\u2026": { de: "Deine \xDCbung wird vorbereitet\u2026", en: "Preparing your challenge\u2026", it: "Preparazione dell\u2019esercizio\u2026", es: "Preparando tu ejercicio\u2026" },
  "Tu as re\xE7u un d\xE9fi ?": { de: "Hast du eine \xDCbung erhalten?", en: "Have you received a challenge?", it: "Hai ricevuto un esercizio?", es: "\xBFHas recibido un ejercicio?" },
  "Colle son code pour le reprendre imm\xE9diatement.": { de: "F\xFCge den Code ein, um sofort weiterzumachen.", en: "Paste its code to resume it immediately.", it: "Incolla il codice per riprenderlo subito.", es: "Pega el c\xF3digo para retomarlo inmediatamente." },
  "Code du d\xE9fi": { de: "\xDCbungscode", en: "Challenge code", it: "Codice dell\u2019esercizio", es: "C\xF3digo del ejercicio" },
  "Voir": { de: "Ansehen", en: "View", it: "Vedi", es: "Ver" },
  "D\xE9couvrir": { de: "Entdecken", en: "Discover", it: "Scopri", es: "Descubrir" },
  "Tu veux travailler un de nos d\xE9fis\xA0?": { de: "M\xF6chtest du eine unserer \xDCbungen bearbeiten?", en: "Would you like to try one of our challenges?", it: "Vuoi provare uno dei nostri esercizi?", es: "\xBFQuieres practicar con uno de nuestros ejercicios?" },
  "Tu veux construire ton propre d\xE9fi ?": { de: "M\xF6chtest du deine eigene \xDCbung erstellen?", en: "Would you like to build your own challenge?", it: "Vuoi creare il tuo esercizio?", es: "\xBFQuieres crear tu propio ejercicio?" },
  "Choisis les verbes, les modes, les temps et les options.": { de: "W\xE4hle Verben, Modi, Zeitformen und Optionen.", en: "Choose the verbs, moods, tenses and options.", it: "Scegli verbi, modi, tempi e opzioni.", es: "Elige los verbos, modos, tiempos y opciones." },
  "Construire un nouveau d\xE9fi \u2192": { de: "Neue \xDCbung erstellen \u2192", en: "Build a new challenge \u2192", it: "Crea un nuovo esercizio \u2192", es: "Crear un nuevo ejercicio \u2192" },
  "\u2190 Accueil": { de: "\u2190 Startseite", en: "\u2190 Home", it: "\u2190 Home", es: "\u2190 Inicio" },
  "\u2190 Nouveau d\xE9fi": { de: "\u2190 Neue Herausforderung", en: "\u2190 New challenge", it: "\u2190 Nuova sfida", es: "\u2190 Nuevo desaf\xEDo" },
  "Choisir les temps \u2192": { de: "Zeitformen w\xE4hlen \u2192", en: "Choose tenses \u2192", it: "Scegli i tempi \u2192", es: "Elegir tiempos \u2192" },
  "Modifier la liste": { de: "Liste \xE4ndern", en: "Edit the list", it: "Modifica l\u2019elenco", es: "Modificar la lista" },
  "\u2190 Verbes": { de: "\u2190 Verben", en: "\u2190 Verbs", it: "\u2190 Verbi", es: "\u2190 Verbos" },
  "Choisir les options \u2192": { de: "Optionen w\xE4hlen \u2192", en: "Choose options \u2192", it: "Scegli le opzioni \u2192", es: "Elegir opciones \u2192" },
  "Cr\xE9er le d\xE9fi": { de: "\xDCbung erstellen", en: "Create the challenge", it: "Crea l\u2019esercizio", es: "Crear el ejercicio" },
  "Options du d\xE9fi": { de: "\xDCbungsoptionen", en: "Challenge options", it: "Opzioni dell\u2019esercizio", es: "Opciones del ejercicio" },
  "\u2190 Options": { de: "\u2190 Optionen", en: "\u2190 Options", it: "\u2190 Opzioni", es: "\u2190 Opciones" },
  "Aper\xE7u des verbes choisis": { de: "Vorschau der ausgew\xE4hlten Verben", en: "Preview of selected verbs", it: "Anteprima dei verbi scelti", es: "Vista previa de los verbos elegidos" },
  "Autres verbes choisis": { de: "Weitere ausgew\xE4hlte Verben", en: "Other selected verbs", it: "Altri verbi scelti", es: "Otros verbos elegidos" },
  "Questionnaire": { de: "Fragebogen", en: "Questionnaire", it: "Questionario", es: "Cuestionario" },
  "Question": { de: "Frage", en: "Question", it: "Domanda", es: "Pregunta" },
  "Verbe :": { de: "Verb:", en: "Verb:", it: "Verbo:", es: "Verbo:" },
  "Mode :": { de: "Modus:", en: "Mood:", it: "Modo:", es: "Modo:" },
  "Temps :": { de: "Zeitform:", en: "Tense:", it: "Tempo:", es: "Tiempo:" },
  "Personne :": { de: "Person:", en: "Person:", it: "Persona:", es: "Persona:" },
  "Progression": { de: "Fortschritt", en: "Progress", it: "Avanzamento", es: "Progreso" },
  "Progression du questionnaire": { de: "Fortschritt im Fragebogen", en: "Questionnaire progress", it: "Avanzamento del questionario", es: "Progreso del cuestionario" },
  "{answered} questions r\xE9pondues sur {total}": { de: "{answered} von {total} Fragen beantwortet", en: "{answered} of {total} questions answered", it: "{answered} domande su {total} completate", es: "{answered} preguntas de {total} respondidas" },
  "Pas encore r\xE9pondue": { de: "Noch nicht beantwortet", en: "Not answered yet", it: "Non ancora completata", es: "A\xFAn no respondida" },
  "R\xE9ussie au premier essai": { de: "Beim ersten Versuch richtig", en: "Correct on the first attempt", it: "Corretta al primo tentativo", es: "Correcta en el primer intento" },
  "R\xE9ussie au deuxi\xE8me essai": { de: "Beim zweiten Versuch richtig", en: "Correct on the second attempt", it: "Corretta al secondo tentativo", es: "Correcta en el segundo intento" },
  "R\xE9ponse fausse": { de: "Falsche Antwort", en: "Incorrect answer", it: "Risposta errata", es: "Respuesta incorrecta" },
  "Terminer la s\xE9ance": { de: "Sitzung beenden", en: "Finish session", it: "Termina la sessione", es: "Finalizar la sesi\xF3n" },
  "Reprendre \xE0 la prochaine question": { de: "Mit der n\xE4chsten Frage fortfahren", en: "Resume with the next question", it: "Riprendi dalla prossima domanda", es: "Retomar desde la siguiente pregunta" },
  "Contexte grammatical": { de: "Grammatischer Kontext", en: "Grammatical context", it: "Contesto grammaticale", es: "Contexto gramatical" },
  "V\xE9rifier": { de: "Pr\xFCfen", en: "Check", it: "Verifica", es: "Comprobar" },
  "Pas encore. V\xE9rifie ta r\xE9ponse et essaie une deuxi\xE8me fois.": { de: "Noch nicht. Pr\xFCfe deine Antwort und versuche es ein zweites Mal.", en: "Not yet. Check your answer and try a second time.", it: "Non ancora. Controlla la risposta e prova una seconda volta.", es: "Todav\xEDa no. Comprueba tu respuesta e int\xE9ntalo una segunda vez." },
  "Pas encore. Essaie une deuxi\xE8me fois.": { de: "Noch nicht. Versuche es ein zweites Mal.", en: "Not yet. Try a second time.", it: "Non ancora. Prova una seconda volta.", es: "Todav\xEDa no. Int\xE9ntalo una segunda vez." },
  "Un indice pour t\u2019aider": { de: "Ein Hinweis f\xFCr dich", en: "A hint to help you", it: "Un suggerimento per aiutarti", es: "Una pista para ayudarte" },
  "Modifie ta r\xE9ponse ci-dessus, puis clique \xE0 nouveau sur \xAB V\xE9rifier \xBB.": { de: "\xC4ndere deine Antwort oben und klicke dann erneut auf \u201EPr\xFCfen\u201C.", en: "Change your answer above, then click \u201CCheck\u201D again.", it: "Modifica la risposta qui sopra, quindi fai di nuovo clic su \xABVerifica\xBB.", es: "Modifica tu respuesta de arriba y vuelve a pulsar \xABComprobar\xBB." },
  "Ta conjugaison est correcte au futur simple, mais la question demande le futur proche. Au futur simple, le verbe est conjugu\xE9 en un seul mot (\xAB tu mangeras \xBB). Au futur proche, on utilise \xAB aller \xBB au pr\xE9sent suivi de l\u2019infinitif (\xAB tu vas manger \xBB).": { de: "Deine Konjugation ist im Futur I richtig, aber gefragt ist das nahe Futur. Im Futur I wird das Verb in einem Wort konjugiert (\u201Etu mangeras\u201C). F\xFCr das nahe Futur verwendet man \u201Ealler\u201C im Pr\xE4sens mit dem Infinitiv (\u201Etu vas manger\u201C).", en: "Your conjugation is correct in the simple future, but the question asks for the near future. In the simple future, the verb is conjugated as one word (\u201Ctu mangeras\u201D). The near future uses the present tense of \u201Caller\u201D followed by the infinitive (\u201Ctu vas manger\u201D).", it: "La coniugazione \xE8 corretta al futuro semplice, ma la domanda richiede il futuro prossimo. Al futuro semplice il verbo \xE8 coniugato in una sola parola (\xABtu mangeras\xBB). Il futuro prossimo usa \xABaller\xBB al presente seguito dall\u2019infinito (\xABtu vas manger\xBB).", es: "La conjugaci\xF3n es correcta en futuro simple, pero la pregunta pide el futuro pr\xF3ximo. En futuro simple, el verbo se conjuga en una sola palabra (\xABtu mangeras\xBB). El futuro pr\xF3ximo usa \xABaller\xBB en presente seguido del infinitivo (\xABtu vas manger\xBB)." },
  "Futur proche ou futur simple ?": { de: "Nahes Futur oder Futur I?", en: "Near future or simple future?", it: "Futuro prossimo o futuro semplice?", es: "\xBFFuturo pr\xF3ximo o futuro simple?" },
  "Bravo, c\u2019est juste !": { de: "Bravo, das ist richtig!", en: "Well done, that\u2019s correct!", it: "Bravo, \xE8 corretto!", es: "\xA1Muy bien, es correcto!" },
  "Pas tout \xE0 fait.": { de: "Nicht ganz.", en: "Not quite.", it: "Non proprio.", es: "No del todo." },
  "Ta r\xE9ponse": { de: "Deine Antwort", en: "Your answer", it: "La tua risposta", es: "Tu respuesta" },
  "La r\xE9ponse attendue \xE9tait :": { de: "Die erwartete Antwort war:", en: "The expected answer was:", it: "La risposta attesa era:", es: "La respuesta esperada era:" },
  "On peut aussi r\xE9pondre :": { de: "Auch m\xF6glich:", en: "Another possible answer is:", it: "Si pu\xF2 anche rispondere:", es: "Tambi\xE9n se puede responder:" },
  "Tu peux passer \xE0 la question suivante.": { de: "Du kannst zur n\xE4chsten Frage gehen.", en: "You can move on to the next question.", it: "Puoi passare alla domanda successiva.", es: "Puedes pasar a la pregunta siguiente." },
  "Correction": { de: "Korrektur", en: "Correction", it: "Correzione", es: "Correcci\xF3n" },
  "Bonne r\xE9ponse": { de: "Richtige Antwort", en: "Correct answer", it: "Risposta corretta", es: "Respuesta correcta" },
  "Bilan de la s\xE9ance": { de: "Sitzungsbilanz", en: "Session report", it: "Bilancio della sessione", es: "Balance de la sesi\xF3n" },
  "Mes erreurs": { de: "Meine Fehler", en: "My mistakes", it: "I miei errori", es: "Mis errores" },
  "Mes r\xE9ussites": { de: "Meine Erfolge", en: "My correct answers", it: "Le mie risposte corrette", es: "Mis aciertos" },
  "Aucune r\xE9ussite dans cette s\xE9ance.": { de: "Keine richtige Antwort in dieser Sitzung.", en: "No correct answers in this session.", it: "Nessuna risposta corretta in questa sessione.", es: "Ning\xFAn acierto en esta sesi\xF3n." },
  "R\xE9ponse donn\xE9e": { de: "Gegebene Antwort", en: "Answer given", it: "Risposta data", es: "Respuesta dada" },
  "Question suivante": { de: "N\xE4chste Frage", en: "Next question", it: "Domanda successiva", es: "Pregunta siguiente" },
  "Recommencer": { de: "Neu starten", en: "Start again", it: "Ricomincia", es: "Empezar de nuevo" },
  "R\xE9capitulatif des r\xE9ponses": { de: "Antwort\xFCbersicht", en: "Answer summary", it: "Riepilogo delle risposte", es: "Resumen de respuestas" },
  "R\xE9sultat": { de: "Ergebnis", en: "Result", it: "Risultato", es: "Resultado" },
  "Excellent !": { de: "Ausgezeichnet!", en: "Excellent!", it: "Eccellente!", es: "\xA1Excelente!" },
  "Bravo !": { de: "Bravo!", en: "Well done!", it: "Bravo!", es: "\xA1Muy bien!" },
  "Bel effort !": { de: "Gute Leistung!", en: "Good effort!", it: "Ottimo impegno!", es: "\xA1Buen esfuerzo!" },
  "Continue, tu progresses !": { de: "Weiter so, du machst Fortschritte!", en: "Keep going, you\u2019re making progress!", it: "Continua cos\xEC, stai migliorando!", es: "\xA1Sigue as\xED, est\xE1s progresando!" },
  "Quitter": { de: "Beenden", en: "Leave", it: "Esci", es: "Salir" },
  "Quitter l\u2019exercice": { de: "\xDCbung verlassen", en: "Leave the exercise", it: "Esci dall\u2019esercizio", es: "Salir del ejercicio" },
  "Quitter l\u2019exercice ?": { de: "\xDCbung verlassen?", en: "Leave the exercise?", it: "Uscire dall\u2019esercizio?", es: "\xBFSalir del ejercicio?" },
  "Quitter le chat": { de: "Chat verlassen", en: "Leave the chat", it: "Esci dalla chat", es: "Salir del chat" },
  "Quitter le chat ?": { de: "Chat verlassen?", en: "Leave the chat?", it: "Uscire dalla chat?", es: "\xBFSalir del chat?" },
  "Continuer l\u2019exercice": { de: "\xDCbung fortsetzen", en: "Continue the exercise", it: "Continua l\u2019esercizio", es: "Continuar el ejercicio" },
  "Impossible de pr\xE9parer de nouvelles questions. Le d\xE9fi actuel reste disponible.": { de: "Neue Fragen konnten nicht vorbereitet werden. Die aktuelle \xDCbung bleibt verf\xFCgbar.", en: "New questions could not be prepared. The current challenge remains available.", it: "Impossibile preparare nuove domande. L\u2019esercizio attuale rimane disponibile.", es: "No se han podido preparar nuevas preguntas. El ejercicio actual sigue disponible." },
  "Ta progression actuelle sera perdue.": { de: "Dein aktueller Fortschritt geht verloren.", en: "Your current progress will be lost.", it: "I progressi attuali andranno persi.", es: "Perder\xE1s tu progreso actual." },
  "Besoin d\u2019un coup de pouce ?": { de: "Brauchst du einen Tipp?", en: "Need a hint?", it: "Hai bisogno di un suggerimento?", es: "\xBFNecesitas una pista?" },
  "Les deux r\xE9ponses sont tr\xE8s diff\xE9rentes : observe d\u2019abord la construction compl\xE8te.": { de: "Die beiden Antworten unterscheiden sich stark: Schau dir zuerst die vollst\xE4ndige Konstruktion an.", en: "The two answers are very different: first look at the complete construction.", it: "Le due risposte sono molto diverse: osserva prima la costruzione completa.", es: "Las dos respuestas son muy diferentes: observa primero la construcci\xF3n completa." },
  "Ouvrir l\u2019aide": { de: "Hilfe \xF6ffnen", en: "Open help", it: "Apri l\u2019aiuto", es: "Abrir la ayuda" },
  "Cr\xE9ation du bilan": { de: "Auswertung wird erstellt", en: "Creating summary", it: "Creazione del riepilogo", es: "Creando resumen" },
  "Bilan du d\xE9fi": { de: "\xDCbungsauswertung", en: "Challenge summary", it: "Riepilogo dell\u2019esercizio", es: "Resumen del ejercicio" },
  "Tu veux refaire ce d\xE9fi ?": { de: "M\xF6chtest du diese \xDCbung wiederholen?", en: "Would you like to repeat this challenge?", it: "Vuoi ripetere questo esercizio?", es: "\xBFQuieres repetir este ejercicio?" },
  "Avec les m\xEAmes questions": { de: "Mit denselben Fragen", en: "With the same questions", it: "Con le stesse domande", es: "Con las mismas preguntas" },
  "Imprimer le bilan": { de: "Auswertung drucken", en: "Print summary", it: "Stampa il riepilogo", es: "Imprimir el resumen" },
  "Partager mon bilan": { de: "Meine Auswertung teilen", en: "Share my summary", it: "Condividi il mio riepilogo", es: "Compartir mi resumen" },
  "Imprimer mon bilan": { de: "Meine Auswertung drucken", en: "Print my summary", it: "Stampa il mio riepilogo", es: "Imprimir mi resumen" },
  "PARTAGER MON BILAN": { de: "MEINE AUSWERTUNG TEILEN", en: "SHARE MY SUMMARY", it: "CONDIVIDI IL MIO RIEPILOGO", es: "COMPARTIR MI RESUMEN" },
  "Ton bilan est pr\xEAt \xE0 \xEAtre envoy\xE9": { de: "Deine Auswertung kann verschickt werden", en: "Your summary is ready to send", it: "Il tuo riepilogo \xE8 pronto per essere inviato", es: "Tu resumen est\xE1 listo para enviar" },
  "Il te suffit d\u2019envoyer ce lien \xE0 la personne de ton choix, par e-mail, WhatsApp ou tout autre moyen. En l\u2019ouvrant, elle verra directement ton bilan. Le lien restera disponible pendant un mois.": { de: "Sende diesen Link einfach per E-Mail, WhatsApp oder auf einem anderen Weg an die Person deiner Wahl. Beim \xD6ffnen sieht sie direkt deine Auswertung. Der Link bleibt einen Monat lang verf\xFCgbar.", en: "Simply send this link to anyone you choose by email, WhatsApp or any other means. When they open it, they will see your summary directly. The link will remain available for one month.", it: "Invia questo link alla persona che preferisci via e-mail, WhatsApp o con qualsiasi altro mezzo. Aprendolo, vedr\xE0 direttamente il tuo riepilogo. Il link rester\xE0 disponibile per un mese.", es: "Solo tienes que enviar este enlace a quien quieras por correo electr\xF3nico, WhatsApp o cualquier otro medio. Al abrirlo, ver\xE1 directamente tu resumen. El enlace estar\xE1 disponible durante un mes." },
  "Cr\xE9ation du lien\u2026": { de: "Link wird erstellt\u2026", en: "Creating link\u2026", it: "Creazione del link\u2026", es: "Creando el enlace\u2026" },
  "Lien complet \xE0 envoyer": { de: "Vollst\xE4ndiger Link zum Versenden", en: "Full link to send", it: "Link completo da inviare", es: "Enlace completo para enviar" },
  "Copier le lien": { de: "Link kopieren", en: "Copy link", it: "Copia il link", es: "Copiar el enlace" },
  "Partager avec une application\u2026": { de: "Mit einer App teilen\u2026", en: "Share with an app\u2026", it: "Condividi con un\u2019app\u2026", es: "Compartir con una aplicaci\xF3n\u2026" },
  "Toute personne qui poss\xE8de ce lien peut consulter le bilan.": { de: "Jede Person mit diesem Link kann die Auswertung ansehen.", en: "Anyone with this link can view the summary.", it: "Chiunque possieda questo link pu\xF2 consultare il riepilogo.", es: "Cualquier persona que tenga este enlace puede consultar el resumen." },
  "Le lien du bilan n\u2019a pas pu \xEAtre cr\xE9\xE9.": { de: "Der Link zur Auswertung konnte nicht erstellt werden.", en: "The summary link could not be created.", it: "Non \xE8 stato possibile creare il link del riepilogo.", es: "No se ha podido crear el enlace del resumen." },
  "Mon bilan de conjugaison": { de: "Meine Konjugationsauswertung", en: "My conjugation summary", it: "Il mio riepilogo di coniugazione", es: "Mi resumen de conjugaci\xF3n" },
  "Voici mon bilan de conjugaison.": { de: "Hier ist meine Konjugationsauswertung.", en: "Here is my conjugation summary.", it: "Ecco il mio riepilogo di coniugazione.", es: "Aqu\xED est\xE1 mi resumen de conjugaci\xF3n." },
  "Bilan introuvable": { de: "Auswertung nicht gefunden", en: "Summary not found", it: "Riepilogo non trovato", es: "Resumen no encontrado" },
  "Bilan de conjugaison partag\xE9": { de: "Geteilte Konjugationsauswertung", en: "Shared conjugation summary", it: "Riepilogo di coniugazione condiviso", es: "Resumen de conjugaci\xF3n compartido" },
  "Consulter un bilan de conjugaison partag\xE9.": { de: "Eine geteilte Konjugationsauswertung ansehen.", en: "View a shared conjugation summary.", it: "Consulta un riepilogo di coniugazione condiviso.", es: "Consulta un resumen de conjugaci\xF3n compartido." },
  "BILAN PARTAG\xC9": { de: "GETEILTE AUSWERTUNG", en: "SHARED SUMMARY", it: "RIEPILOGO CONDIVISO", es: "RESUMEN COMPARTIDO" },
  "Bilan de conjugaison": { de: "Konjugationsauswertung", en: "Conjugation summary", it: "Riepilogo di coniugazione", es: "Resumen de conjugaci\xF3n" },
  "Bilan r\xE9alis\xE9 le {date}": { de: "Auswertung vom {date}", en: "Summary completed on {date}", it: "Riepilogo completato il {date}", es: "Resumen realizado el {date}" },
  "Contenu de l\u2019exercice": { de: "Inhalt der \xDCbung", en: "Exercise content", it: "Contenuto dell\u2019esercizio", es: "Contenido del ejercicio" },
  "Glisse vers le bas pour voir l\u2019aide.": { de: "Wische nach unten, um die Hilfe zu sehen.", en: "Swipe down to see the help.", it: "Scorri verso il basso per vedere l\u2019aiuto.", es: "Desliza hacia abajo para ver la ayuda." },
  "N'oublie pas le pronom !": { de: "Vergiss das Pronomen nicht!", en: "Don't forget the pronoun!", it: "Non dimenticare il pronome!", es: "\xA1No olvides el pronombre!" },
  "\xC0 l'imp\xE9ratif, la personne est indiqu\xE9e, mais n'\xE9cris pas le pronom.": { de: "Beim Imperativ ist die Person angegeben, aber schreibe das Pronomen nicht.", en: "For the imperative, the person is shown, but don't write the pronoun.", it: "Nell\u2019imperativo la persona \xE8 indicata, ma non scrivere il pronome.", es: "En el imperativo se indica la persona, pero no escribas el pronombre." },
  "Il manque le pronom": { de: "Das Pronomen fehlt", en: "The pronoun is missing", it: "Manca il pronome", es: "Falta el pronombre" },
  "Type de faute": { de: "Fehlertyp", en: "Error type", it: "Tipo di errore", es: "Tipo de error" },
  "Types de faute": { de: "Fehlertypen", en: "Error types", it: "Tipi di errore", es: "Tipos de error" },
  "Choisis ton coach": { de: "W\xE4hle deinen Coach", en: "Choose your coach", it: "Scegli il tuo coach", es: "Elige tu coach" },
  "Ces coaches sont des personnages virtuels automatis\xE9s.": { de: "Diese Coaches sind automatisierte virtuelle Figuren.", en: "These coaches are automated virtual characters.", it: "Questi coach sono personaggi virtuali automatizzati.", es: "Estos coaches son personajes virtuales automatizados." },
  "Un avatar, un pr\xE9nom ou un \xE2ge ne prouvent jamais l\u2019identit\xE9 d\u2019une personne sur Internet.": { de: "Ein Avatar, Vorname oder Alter beweist niemals die Identit\xE4t einer Person im Internet.", en: "An avatar, first name or age never proves a person\u2019s identity online.", it: "Un avatar, un nome o un\u2019et\xE0 non provano mai l\u2019identit\xE0 di una persona su Internet.", es: "Un avatar, un nombre o una edad nunca demuestran la identidad de una persona en Internet." },
  "Aime :": { de: "Mag:", en: "Likes:", it: "Gli piace:", es: "Le gusta:" },
  "Chargement des coaches\u2026": { de: "Coaches werden geladen\u2026", en: "Loading coaches\u2026", it: "Caricamento dei coach\u2026", es: "Cargando coaches\u2026" },
  "Impossible de charger les coaches.": { de: "Die Coaches konnten nicht geladen werden.", en: "The coaches could not be loaded.", it: "Impossibile caricare i coach.", es: "No se han podido cargar los coaches." },
  "Type d\u2019aide": { de: "Art der Hilfe", en: "Type of help", it: "Tipo di aiuto", es: "Tipo de ayuda" },
  "Aper\xE7u du bilan": { de: "Vorschau der Auswertung", en: "Summary preview", it: "Anteprima del riepilogo", es: "Vista previa del resumen" },
  "Aper\xE7u du bilan au format PDF": { de: "Vorschau der Auswertung als PDF", en: "PDF summary preview", it: "Anteprima del riepilogo in PDF", es: "Vista previa del resumen en PDF" },
  "BILAN DU D\xC9FI": { de: "\xDCBUNGSAUSWERTUNG", en: "CHALLENGE SUMMARY", it: "RIEPILOGO DELL\u2019ESERCIZIO", es: "RESUMEN DEL EJERCICIO" },
  "BILAN DU D\xC9FI \u2014 SUITE": { de: "\xDCBUNGSAUSWERTUNG \u2014 FORTSETZUNG", en: "CHALLENGE SUMMARY \u2014 CONTINUED", it: "RIEPILOGO DELL\u2019ESERCIZIO \u2014 SEGUITO", es: "RESUMEN DEL EJERCICIO \u2014 CONTINUACI\xD3N" },
  "R\xC9PONSE DONN\xC9E": { de: "GEGEBENE ANTWORT", en: "ANSWER GIVEN", it: "RISPOSTA DATA", es: "RESPUESTA DADA" },
  "BONNE R\xC9PONSE": { de: "RICHTIGE ANTWORT", en: "CORRECT ANSWER", it: "RISPOSTA CORRETTA", es: "RESPUESTA CORRECTA" },
  "Impossible de g\xE9n\xE9rer le bilan PDF.": { de: "Die PDF-Auswertung konnte nicht erstellt werden.", en: "The PDF summary could not be generated.", it: "Impossibile generare il riepilogo PDF.", es: "No se ha podido generar el resumen en PDF." },
  "L\u2019aper\xE7u du bilan n\u2019a pas pu \xEAtre cr\xE9\xE9.": { de: "Die Vorschau der Auswertung konnte nicht erstellt werden.", en: "The summary preview could not be created.", it: "Impossibile creare l\u2019anteprima del riepilogo.", es: "No se ha podido crear la vista previa del resumen." },
  "Aide": { de: "Hilfe", en: "Help", it: "Aiuto", es: "Ayuda" },
  "Fermer l\u2019aide": { de: "Hilfe schlie\xDFen", en: "Close help", it: "Chiudi l\u2019aiuto", es: "Cerrar la ayuda" },
  "Retour sur l\u2019aide automatique": { de: "Feedback zur automatischen Hilfe", en: "Feedback on automated help", it: "Feedback sull\u2019aiuto automatico", es: "Comentarios sobre la ayuda autom\xE1tica" },
  "Cette aide est g\xE9n\xE9r\xE9e automatiquement. Elle peut contenir une erreur ou manquer de clart\xE9. Les retours permettent de l\u2019am\xE9liorer.": { de: "Diese Hilfe wird automatisch erstellt. Sie kann Fehler enthalten oder unklar sein. R\xFCckmeldungen helfen, sie zu verbessern.", en: "This help is generated automatically. It may contain an error or lack clarity. Feedback helps improve it.", it: "Questo aiuto \xE8 generato automaticamente. Pu\xF2 contenere errori o essere poco chiaro. I feedback aiutano a migliorarlo.", es: "Esta ayuda se genera autom\xE1ticamente. Puede contener errores o no ser clara. Los comentarios ayudan a mejorarla." },
  "Retour sur cette aide": { de: "Feedback zu dieser Hilfe", en: "Feedback on this help", it: "Feedback su questo aiuto", es: "Comentarios sobre esta ayuda" },
  "Remarque optionnelle": { de: "Optionale Anmerkung", en: "Optional comment", it: "Nota facoltativa", es: "Comentario opcional" },
  "Pr\xE9cision utile pour corriger ou am\xE9liorer l\u2019aide\u2026": { de: "N\xFCtzlicher Hinweis zur Korrektur oder Verbesserung der Hilfe\u2026", en: "Useful detail for correcting or improving the help\u2026", it: "Dettaglio utile per correggere o migliorare l\u2019aiuto\u2026", es: "Detalle \xFAtil para corregir o mejorar la ayuda\u2026" },
  "Retour enregistr\xE9.": { de: "Feedback gespeichert.", en: "Feedback saved.", it: "Feedback salvato.", es: "Comentarios guardados." },
  "Retour impossible pour le moment.": { de: "Feedback ist derzeit nicht m\xF6glich.", en: "Feedback is currently unavailable.", it: "Il feedback non \xE8 disponibile al momento.", es: "Los comentarios no est\xE1n disponibles en este momento." },
  "Pas clair": { de: "Unklar", en: "Unclear", it: "Poco chiaro", es: "Poco claro" },
  "Utile": { de: "Hilfreich", en: "Helpful", it: "Utile", es: "\xDAtil" },
  "Erreur": { de: "Fehler", en: "Error", it: "Errore", es: "Error" },
  "Remarque": { de: "Anmerkung", en: "Comment", it: "Nota", es: "Comentario" },
  "Aide s\xE9curis\xE9e": { de: "Abgesicherte Hilfe", en: "Safeguarded help", it: "Aiuto protetto", es: "Ayuda protegida" },
  "D\xE9finition": { de: "Definition", en: "Definition", it: "Definizione", es: "Definici\xF3n" },
  "Envoi\u2026": { de: "Wird gesendet\u2026", en: "Sending\u2026", it: "Invio\u2026", es: "Enviando\u2026" },
  "Envoyer le retour": { de: "Feedback senden", en: "Send feedback", it: "Invia feedback", es: "Enviar comentarios" },
  "Une incoh\xE9rence a \xE9t\xE9 d\xE9tect\xE9e dans l\u2019explication d\xE9taill\xE9e. La r\xE9ponse officielle \xE0 retenir est :": { de: "In der ausf\xFChrlichen Erkl\xE4rung wurde eine Unstimmigkeit festgestellt. Die ma\xDFgebliche richtige Antwort lautet:", en: "An inconsistency was found in the detailed explanation. The official answer to remember is:", it: "\xC8 stata rilevata un\u2019incoerenza nella spiegazione dettagliata. La risposta ufficiale da ricordare \xE8:", es: "Se ha detectado una incoherencia en la explicaci\xF3n detallada. La respuesta oficial que debes recordar es:" },
  "Une incoh\xE9rence a \xE9t\xE9 d\xE9tect\xE9e dans cette explication. Rep\xE8re le temps et la personne, cherche le radical, puis choisis la terminaison correspondante.": { de: "In dieser Erkl\xE4rung wurde eine Unstimmigkeit festgestellt. Bestimme Zeitform und Person, suche den Stamm und w\xE4hle dann die passende Endung.", en: "An inconsistency was found in this explanation. Identify the tense and person, find the stem, then choose the corresponding ending.", it: "\xC8 stata rilevata un\u2019incoerenza in questa spiegazione. Individua il tempo e la persona, trova la radice, poi scegli la desinenza corrispondente.", es: "Se ha detectado una incoherencia en esta explicaci\xF3n. Identifica el tiempo y la persona, busca la ra\xEDz y elige la terminaci\xF3n correspondiente." },
  "Groupe du verbe": { de: "Verbgruppe", en: "Verb group", it: "Gruppo del verbo", es: "Grupo del verbo" },
  "Verbe aller": { de: "Das Verb aller", en: "The verb aller", it: "Il verbo aller", es: "El verbo aller" },
  "La lettre G": { de: "Der Buchstabe G", en: "The letter G", it: "La lettera G", es: "La letra G" },
  "La lettre C et la c\xE9dille": { de: "Der Buchstabe C und die Cedille", en: "The letter C and the cedilla", it: "La lettera C e la cediglia", es: "La letra C y la cedilla" },
  "Le COD plac\xE9 avant": { de: "Das vorangestellte direkte Objekt", en: "The direct object placed before the verb", it: "Il complemento oggetto posto prima", es: "El complemento directo colocado antes" },
  "Accord du participe pass\xE9": { de: "Angleichung des Partizips Perfekt", en: "Past participle agreement", it: "Concordanza del participio passato", es: "Concordancia del participio pasado" },
  "Verbe pronominal": { de: "Reflexives Verb", en: "Pronominal verb", it: "Verbo pronominale", es: "Verbo pronominal" },
  "Indicatif": { de: "Indikativ", en: "Indicative", it: "Indicativo", es: "Indicativo" },
  "Reconna\xEEtre les modes": { de: "Modi erkennen", en: "Recognise moods", it: "Riconoscere i modi", es: "Reconocer los modos" },
  "D\xE9finition du verbe": { de: "Definition des Verbs", en: "Verb definition", it: "Definizione del verbo", es: "Definici\xF3n del verbo" },
  "Choisis le mode": { de: "W\xE4hle den Modus", en: "Choose the mood", it: "Scegli il modo", es: "Elige el modo" },
  "Modes": { de: "Modi", en: "Moods", it: "Modi", es: "Modos" },
  "Choisis le temps": { de: "W\xE4hle die Zeitform", en: "Choose the tense", it: "Scegli il tempo", es: "Elige el tiempo" },
  "\xC9cris ta r\xE9ponse ou clique directement sur le mode correct": { de: "Schreibe deine Antwort oder klicke direkt auf den richtigen Modus", en: "Write your answer or click the correct mood directly", it: "Scrivi la risposta o fai clic direttamente sul modo corretto", es: "Escribe tu respuesta o haz clic directamente en el modo correcto" },
  "\xC9cris ta r\xE9ponse ou clique directement sur le mode puis sur le temps correct": { de: "Schreibe deine Antwort oder klicke direkt auf den richtigen Modus und dann auf die richtige Zeitform", en: "Write your answer or click the correct mood and then the correct tense", it: "Scrivi la risposta o fai clic direttamente sul modo e poi sul tempo corretto", es: "Escribe tu respuesta o haz clic directamente en el modo y despu\xE9s en el tiempo correcto" },
  "\xC9cris ta r\xE9ponse": { de: "Schreibe deine Antwort", en: "Type your answer", it: "Scrivi la tua risposta", es: "Escribe tu respuesta" },
  "Subjonctif": { de: "Subjonktiv", en: "Subjunctive", it: "Congiuntivo", es: "Subjuntivo" },
  "Conditionnel": { de: "Konditional", en: "Conditional", it: "Condizionale", es: "Condicional" },
  "Imp\xE9ratif": { de: "Imperativ", en: "Imperative", it: "Imperativo", es: "Imperativo" },
  "Infinitif": { de: "Infinitiv", en: "Infinitive", it: "Infinito", es: "Infinitivo" },
  "Participe": { de: "Partizip", en: "Participle", it: "Participio", es: "Participio" },
  "G\xE9rondif": { de: "Gerundium", en: "Gerund", it: "Gerundio", es: "Gerundio" },
  "pr\xE9sent": { de: "Pr\xE4sens", en: "present", it: "presente", es: "presente" },
  "pass\xE9": { de: "Vergangenheit", en: "past", it: "passato", es: "pasado" },
  "futur proche": { de: "nahes Futur", en: "near future", it: "futuro prossimo", es: "futuro pr\xF3ximo" },
  "futur simple": { de: "Futur I", en: "simple future", it: "futuro semplice", es: "futuro simple" },
  "futur": { de: "Futur", en: "future", it: "futuro", es: "futuro" },
  "pass\xE9 compos\xE9": { de: "Pass\xE9 compos\xE9", en: "perfect tense", it: "passato prossimo", es: "pret\xE9rito perfecto" },
  "imparfait": { de: "Imparfait", en: "imperfect", it: "imperfetto", es: "pret\xE9rito imperfecto" },
  "plus-que-parfait": { de: "Plusquamperfekt", en: "pluperfect", it: "trapassato prossimo", es: "pret\xE9rito pluscuamperfecto" },
  "pass\xE9 simple": { de: "Pass\xE9 simple", en: "simple past", it: "passato remoto", es: "pret\xE9rito indefinido" },
  "pass\xE9 ant\xE9rieur": { de: "Pass\xE9 ant\xE9rieur", en: "past anterior", it: "trapassato remoto", es: "pret\xE9rito anterior" },
  "futur ant\xE9rieur": { de: "Futur II", en: "future perfect", it: "futuro anteriore", es: "futuro perfecto" },
  "pass\xE9 premi\xE8re forme": { de: "Vergangenheit, erste Form", en: "past, first form", it: "passato, prima forma", es: "pasado, primera forma" },
  "pass\xE9 deuxi\xE8me forme": { de: "Vergangenheit, zweite Form", en: "past, second form", it: "passato, seconda forma", es: "pasado, segunda forma" },
  "Choisis les verbes": { de: "W\xE4hle die Verben", en: "Choose the verbs", it: "Scegli i verbi", es: "Elige los verbos" },
  "Verbes du d\xE9fi": { de: "Verben der \xDCbung", en: "Challenge verbs", it: "Verbi dell\u2019esercizio", es: "Verbos del ejercicio" },
  "Choisis les modes et les temps": { de: "W\xE4hle Modi und Zeitformen", en: "Choose moods and tenses", it: "Scegli modi e tempi", es: "Elige modos y tiempos" },
  "\xC0 choisir": { de: "Auszuw\xE4hlen", en: "To choose", it: "Da scegliere", es: "Por elegir" },
  "{count} choisi": { de: "{count} ausgew\xE4hlt", en: "{count} selected", it: "{count} selezionato", es: "{count} seleccionado" },
  "{count} choisis": { de: "{count} ausgew\xE4hlt", en: "{count} selected", it: "{count} selezionati", es: "{count} seleccionados" },
  "Aucun verbe s\xE9lectionn\xE9": { de: "Kein Verb ausgew\xE4hlt", en: "No verb selected", it: "Nessun verbo selezionato", es: "Ning\xFAn verbo seleccionado" },
  "Verbes retenus": { de: "Ausgew\xE4hlte Verben", en: "Selected verbs", it: "Verbi selezionati", es: "Verbos seleccionados" },
  "Charger": { de: "Laden", en: "Load", it: "Carica", es: "Cargar" },
  "Pr\xE9paration\u2026": { de: "Vorbereitung\u2026", en: "Preparing\u2026", it: "Preparazione\u2026", es: "Preparando\u2026" },
  "Classique": { de: "Klassisch", en: "Classic", it: "Classica", es: "Cl\xE1sica" },
  "Avec un coach": { de: "Mit einem Coach", en: "With a coach", it: "Con un coach", es: "Con un coach" },
  "Imprimer": { de: "Drucken", en: "Print", it: "Stampa", es: "Imprimir" },
  "Partager": { de: "Teilen", en: "Share", it: "Condividi", es: "Compartir" },
  "Sauvegarde\u2026": { de: "Wird gespeichert\u2026", en: "Saving\u2026", it: "Salvataggio\u2026", es: "Guardando\u2026" },
  "R\xE9sultats": { de: "Ergebnisse", en: "Results", it: "Risultati", es: "Resultados" },
  "Question {current} sur {total}": { de: "Frage {current} von {total}", en: "Question {current} of {total}", it: "Domanda {current} di {total}", es: "Pregunta {current} de {total}" },
  "Voir mes r\xE9sultats": { de: "Meine Ergebnisse ansehen", en: "View my results", it: "Vedi i miei risultati", es: "Ver mis resultados" },
  "Forme conjugu\xE9e de {verb}": { de: "Konjugierte Form von {verb}", en: "Conjugated form of {verb}", it: "Forma coniugata di {verb}", es: "Forma conjugada de {verb}" },
  "Rappel de la r\xE8gle": { de: "Regelerinnerung", en: "Rule reminder", it: "Promemoria della regola", es: "Recordatorio de la regla" },
  "Attention au temps et au mode": { de: "Achte auf Zeitform und Modus", en: "Check the tense and mood", it: "Attenzione al tempo e al modo", es: "Atenci\xF3n al tiempo y al modo" },
  "Attention \xE0 la personne": { de: "Achte auf die Person", en: "Check the person", it: "Attenzione alla persona", es: "Atenci\xF3n a la persona" },
  "Avec \xAB je \xBB ou \xAB tu \xBB, une forme conjugu\xE9e ne peut pas se terminer par \xAB -t \xBB ou \xAB -d \xBB.": {
    de: "Mit \xAB je \xBB oder \xAB tu \xBB kann eine konjugierte Form nicht auf \xAB -t \xBB oder \xAB -d \xBB enden.",
    en: "With \u201Cje\u201D or \u201Ctu\u201D, a conjugated form cannot end in \u201C-t\u201D or \u201C-d\u201D.",
    it: "Con \xAB je \xBB o \xAB tu \xBB, una forma coniugata non pu\xF2 terminare in \xAB -t \xBB o \xAB -d \xBB.",
    es: "Con \xAB je \xBB o \xAB tu \xBB, una forma conjugada no puede terminar en \xAB -t \xBB o \xAB -d \xBB."
  },
  "Avec \xAB il \xBB, \xAB elle \xBB ou \xAB iel \xBB, une forme conjugu\xE9e ne peut pas se terminer par \xAB -s \xBB ou \xAB -x \xBB.": {
    de: "Mit \xAB il \xBB, \xAB elle \xBB oder \xAB iel \xBB kann eine konjugierte Form nicht auf \xAB -s \xBB oder \xAB -x \xBB enden.",
    en: "With \u201Cil\u201D, \u201Celle\u201D or \u201Ciel\u201D, a conjugated form cannot end in \u201C-s\u201D or \u201C-x\u201D.",
    it: "Con \xAB il \xBB, \xAB elle \xBB o \xAB iel \xBB, una forma coniugata non pu\xF2 terminare in \xAB -s \xBB o \xAB -x \xBB.",
    es: "Con \xAB il \xBB, \xAB elle \xBB o \xAB iel \xBB, una forma conjugada no puede terminar en \xAB -s \xBB o \xAB -x \xBB."
  },
  "Dans un temps compos\xE9, c\u2019est l\u2019auxiliaire qui se conjugue. Avec \xAB je \xBB ou \xAB tu \xBB, il ne peut pas se terminer par \xAB -t \xBB ou \xAB -d \xBB.": {
    de: "In einer zusammengesetzten Zeitform wird das Hilfsverb konjugiert. Mit \xAB je \xBB oder \xAB tu \xBB kann es nicht auf \xAB -t \xBB oder \xAB -d \xBB enden.",
    en: "In a compound tense, the auxiliary is conjugated. With \u201Cje\u201D or \u201Ctu\u201D, it cannot end in \u201C-t\u201D or \u201C-d\u201D.",
    it: "In un tempo composto si coniuga l\u2019ausiliare. Con \xAB je \xBB o \xAB tu \xBB, non pu\xF2 terminare in \xAB -t \xBB o \xAB -d \xBB.",
    es: "En un tiempo compuesto se conjuga el auxiliar. Con \xAB je \xBB o \xAB tu \xBB, no puede terminar en \xAB -t \xBB o \xAB -d \xBB."
  },
  "Dans un temps compos\xE9, c\u2019est l\u2019auxiliaire qui se conjugue. Avec \xAB il \xBB, \xAB elle \xBB ou \xAB iel \xBB, il ne peut pas se terminer par \xAB -s \xBB ou \xAB -x \xBB.": {
    de: "In einer zusammengesetzten Zeitform wird das Hilfsverb konjugiert. Mit \xAB il \xBB, \xAB elle \xBB oder \xAB iel \xBB kann es nicht auf \xAB -s \xBB oder \xAB -x \xBB enden.",
    en: "In a compound tense, the auxiliary is conjugated. With \u201Cil\u201D, \u201Celle\u201D or \u201Ciel\u201D, it cannot end in \u201C-s\u201D or \u201C-x\u201D.",
    it: "In un tempo composto si coniuga l\u2019ausiliare. Con \xAB il \xBB, \xAB elle \xBB o \xAB iel \xBB, non pu\xF2 terminare in \xAB -s \xBB o \xAB -x \xBB.",
    es: "En un tiempo compuesto se conjuga el auxiliar. Con \xAB il \xBB, \xAB elle \xBB o \xAB iel \xBB, no puede terminar en \xAB -s \xBB o \xAB -x \xBB."
  },
  "Ta forme est correcte pour le mode {sourceMode}, au temps {sourceTense}. Ici, il fallait le mode {targetMode}, au temps {targetTense}.": {
    de: "Deine Form ist im Modus {sourceMode} und in der Zeitform {sourceTense} richtig. Hier war der Modus {targetMode} in der Zeitform {targetTense} gefragt.",
    en: "Your form is correct in the {sourceMode} mood and the {sourceTense} tense. Here, the required mood was {targetMode} and the tense was {targetTense}.",
    it: "La tua forma \xE8 corretta nel modo {sourceMode}, al tempo {sourceTense}. Qui servivano il modo {targetMode} e il tempo {targetTense}.",
    es: "Tu forma es correcta en el modo {sourceMode}, en el tiempo {sourceTense}. Aqu\xED se ped\xEDan el modo {targetMode} y el tiempo {targetTense}."
  },
  "{correct} bonnes r\xE9ponses sur {total}": { de: "{correct} richtige Antworten von {total}", en: "{correct} correct answers out of {total}", it: "{correct} risposte corrette su {total}", es: "{correct} respuestas correctas de {total}" },
  "{correct} bonne r\xE9ponse sur {total}": { de: "{correct} richtige Antwort von {total}", en: "{correct} correct answer out of {total}", it: "{correct} risposta corretta su {total}", es: "{correct} respuesta correcta de {total}" },
  "Juste au deuxi\xE8me essai": { de: "Beim zweiten Versuch richtig", en: "Correct on the second try", it: "Corretta al secondo tentativo", es: "Correcta al segundo intento" },
  "Juste": { de: "Richtig", en: "Correct", it: "Corretta", es: "Correcta" },
  "\xC0 revoir": { de: "Noch einmal ansehen", en: "Review", it: "Da rivedere", es: "Para repasar" },
  "{count} coach": { de: "{count} Coach", en: "{count} coach", it: "{count} coach", es: "{count} coach" },
  "{count} coaches": { de: "{count} Coaches", en: "{count} coaches", it: "{count} coach", es: "{count} coaches" },
  "Avatar de {name}": { de: "Avatar von {name}", en: "{name}\u2019s avatar", it: "Avatar di {name}", es: "Avatar de {name}" },
  "\xC9cris ta r\xE9ponse\u2026": { de: "Schreibe deine Antwort\u2026", en: "Type your answer\u2026", it: "Scrivi la tua risposta\u2026", es: "Escribe tu respuesta\u2026" },
  "\xC9cris ta r\xE9ponse ou \xAB Aide \xBB\u2026": { de: "Schreibe deine Antwort oder \u201EHilfe\u201C\u2026", en: "Type your answer or \u201CHelp\u201D\u2026", it: "Scrivi la tua risposta o \xABAiuto\xBB\u2026", es: "Escribe tu respuesta o \xABAyuda\xBB\u2026" },
  "Question\u2026": { de: "Frage\u2026", en: "Question\u2026", it: "Domanda\u2026", es: "Pregunta\u2026" },
  "R\xE9ponse\u2026": { de: "Antwort\u2026", en: "Answer\u2026", it: "Risposta\u2026", es: "Respuesta\u2026" },
  "Suite\u2026": { de: "Weiter\u2026", en: "Next\u2026", it: "Avanti\u2026", es: "Siguiente\u2026" },
  "Envoyer": { de: "Senden", en: "Send", it: "Invia", es: "Enviar" },
  "Avec d\u2019autres questions": { de: "Mit anderen Fragen", en: "With different questions", it: "Con altre domande", es: "Con otras preguntas" },
  "Revenir \xE0 l\u2019aide de la derni\xE8re question": { de: "Zur Hilfe der letzten Frage zur\xFCckkehren", en: "Return to help for the last question", it: "Torna all\u2019aiuto dell\u2019ultima domanda", es: "Volver a la ayuda de la \xFAltima pregunta" },
  "Revenir \xE0 l\u2019aide de la question actuelle": { de: "Zur Hilfe der aktuellen Frage zur\xFCckkehren", en: "Return to help for the current question", it: "Torna all\u2019aiuto della domanda attuale", es: "Volver a la ayuda de la pregunta actual" },
  "Voir l\u2019aide de la derni\xE8re question": { de: "Hilfe zur letzten Frage anzeigen", en: "View help for the last question", it: "Vedi l\u2019aiuto dell\u2019ultima domanda", es: "Ver la ayuda de la \xFAltima pregunta" },
  "Voir l\u2019aide de la question actuelle": { de: "Hilfe zur aktuellen Frage anzeigen", en: "View help for the current question", it: "Vedi l\u2019aiuto della domanda attuale", es: "Ver la ayuda de la pregunta actual" },
  "Voir l\u2019aide de la question {number} pour la r\xE9ponse {answer}": { de: "Hilfe zu Frage {number} f\xFCr die Antwort {answer} anzeigen", en: "View help for question {number} for the answer {answer}", it: "Vedi l\u2019aiuto della domanda {number} per la risposta {answer}", es: "Ver la ayuda de la pregunta {number} para la respuesta {answer}" },
  "Voir l\u2019aide de la question {number} : {question}": { de: "Hilfe zu Frage {number} anzeigen: {question}", en: "View help for question {number}: {question}", it: "Vedi l\u2019aiuto della domanda {number}: {question}", es: "Ver la ayuda de la pregunta {number}: {question}" },
  "Tu peux regarder l\u2019aide \xE0 droite pour trouver un indice.": { de: "In der Hilfe rechts findest du einen Hinweis.", en: "You can look at the help panel on the right for a hint.", it: "Puoi guardare l\u2019aiuto a destra per trovare un indizio.", es: "Puedes consultar la ayuda de la derecha para encontrar una pista." },
  "Si tu veux un indice, tape \xAB Aide \xBB dans le champ de r\xE9ponse": { de: "Wenn du einen Hinweis m\xF6chtest, schreibe \u201EHilfe\u201C in das Antwortfeld", en: "If you want a hint, type \u201CHelp\u201D in the answer field", it: "Se vuoi un indizio, scrivi \xABAiuto\xBB nel campo della risposta", es: "Si quieres una pista, escribe \xABAyuda\xBB en el campo de respuesta" },
  ", ou clique sur ce bouton :": { de: ", oder klicke auf diese Schaltfl\xE4che:", en: ", or click this button:", it: ", oppure fai clic su questo pulsante:", es: ", o haz clic en este bot\xF3n:" },
  "Regarde o\xF9 \xE7a change :": { de: "Schau, wo es sich unterscheidet:", en: "Look at what changes:", it: "Guarda che cosa cambia:", es: "Mira qu\xE9 cambia:" },
  "Repars de la correction compl\xE8te :": { de: "Gehe von der vollst\xE4ndigen Korrektur aus:", en: "Start again from the full correction:", it: "Riparti dalla correzione completa:", es: "Vuelve a partir de la correcci\xF3n completa:" },
  "Apprendre la conjugaison": { de: "Franz\xF6sische Konjugation lernen", en: "Learn French conjugation", it: "Imparare la coniugazione francese", es: "Aprender la conjugaci\xF3n francesa" },
  "Une synth\xE8se claire des r\xE8gles essentielles de la conjugaison fran\xE7aise.": { de: "Eine klare \xDCbersicht \xFCber die wichtigsten Regeln der franz\xF6sischen Konjugation.", en: "A clear overview of the essential rules of French conjugation.", it: "Una sintesi chiara delle regole essenziali della coniugazione francese.", es: "Un resumen claro de las reglas esenciales de la conjugaci\xF3n francesa." },
  "Les r\xE8gles essentielles": { de: "Die wichtigsten Regeln", en: "The essential rules", it: "Le regole essenziali", es: "Las reglas esenciales" },
  "Apprendre la conjugaison fran\xE7aise": { de: "Franz\xF6sische Konjugation lernen", en: "Learn French conjugation", it: "Imparare la coniugazione francese", es: "Aprender la conjugaci\xF3n francesa" },
  "Sommaire des r\xE8gles": { de: "\xDCbersicht der Regeln", en: "Rules overview", it: "Indice delle regole", es: "\xCDndice de las reglas" },
  "Comprendre le verbe": { de: "Das Verb verstehen", en: "Understand the verb", it: "Capire il verbo", es: "Entender el verbo" },
  "Radical, terminaison, groupes et auxiliaires.": { de: "Stamm, Endung, Gruppen und Hilfsverben.", en: "Stem, ending, groups and auxiliaries.", it: "Radice, desinenza, gruppi e ausiliari.", es: "Ra\xEDz, terminaci\xF3n, grupos y auxiliares." },
  "Former les temps": { de: "Zeitformen bilden", en: "Form the tenses", it: "Formare i tempi", es: "Formar los tiempos" },
  "Les rep\xE8res pour construire les temps simples et compos\xE9s.": { de: "Orientierung zur Bildung einfacher und zusammengesetzter Zeitformen.", en: "Guidance for forming simple and compound tenses.", it: "Indicazioni per formare i tempi semplici e composti.", es: "Pautas para formar los tiempos simples y compuestos." },
  "Choisir le bon mode": { de: "Den richtigen Modus w\xE4hlen", en: "Choose the right mood", it: "Scegliere il modo giusto", es: "Elegir el modo adecuado" },
  "Indicatif, subjonctif, conditionnel et imp\xE9ratif.": { de: "Indikativ, Subjonctif, Konditional und Imperativ.", en: "Indicative, subjunctive, conditional and imperative.", it: "Indicativo, congiuntivo, condizionale e imperativo.", es: "Indicativo, subjuntivo, condicional e imperativo." },
  "R\xE9ussir les accords": { de: "\xDCbereinstimmungen meistern", en: "Master agreement", it: "Padroneggiare le concordanze", es: "Dominar las concordancias" },
  "Sujet, auxiliaires et participe pass\xE9.": { de: "Subjekt, Hilfsverben und Partizip Perfekt.", en: "Subject, auxiliaries and past participle.", it: "Soggetto, ausiliari e participio passato.", es: "Sujeto, auxiliares y participio pasado." },
  "\xC9viter les pi\xE8ges": { de: "Stolperfallen vermeiden", en: "Avoid pitfalls", it: "Evitare le insidie", es: "Evitar las trampas" },
  "Modifications du radical et terminaisons \xE0 surveiller.": { de: "Stamm\xE4nderungen und Endungen, auf die du achten solltest.", en: "Stem changes and endings to watch out for.", it: "Modifiche della radice e desinenze da controllare.", es: "Cambios de ra\xEDz y terminaciones que hay que vigilar." },
  "Les fondations": { de: "Die Grundlagen", en: "The foundations", it: "Le basi", es: "Los fundamentos" },
  "Radical + terminaison": { de: "Stamm + Endung", en: "Stem + ending", it: "Radice + desinenza", es: "Ra\xEDz + terminaci\xF3n" },
  "Une forme conjugu\xE9e associe g\xE9n\xE9ralement un radical, qui porte le sens, et une terminaison, qui indique la personne, le mode et le temps.": { de: "Eine konjugierte Form verbindet meist einen bedeutungstragenden Stamm mit einer Endung, die Person, Modus und Zeitform angibt.", en: "A conjugated form usually combines a stem, which carries the meaning, with an ending that indicates person, mood and tense.", it: "Una forma coniugata unisce generalmente una radice, che porta il significato, e una desinenza, che indica persona, modo e tempo.", es: "Una forma conjugada suele unir una ra\xEDz, que aporta el significado, y una terminaci\xF3n, que indica persona, modo y tiempo." },
  "Les trois groupes": { de: "Die drei Gruppen", en: "The three groups", it: "I tre gruppi", es: "Los tres grupos" },
  "1er groupe :": { de: "1. Gruppe:", en: "1st group:", it: "1\xBA gruppo:", es: "1.er grupo:" },
  "2e groupe :": { de: "2. Gruppe:", en: "2nd group:", it: "2\xBA gruppo:", es: "2.\xBA grupo:" },
  "3e groupe :": { de: "3. Gruppe:", en: "3rd group:", it: "3\xBA gruppo:", es: "3.er grupo:" },
  "verbes en -er, sauf aller.": { de: "Verben auf -er, au\xDFer aller.", en: "verbs ending in -er, except aller.", it: "verbi in -er, tranne aller.", es: "verbos en -er, excepto aller." },
  "verbes en -ir faisant -issons.": { de: "Verben auf -ir, deren nous-Form auf -issons endet.", en: "verbs ending in -ir whose nous form ends in -issons.", it: "verbi in -ir che alla forma nous terminano in -issons.", es: "verbos en -ir cuya forma nous termina en -issons." },
  "tous les autres verbes, souvent irr\xE9guliers.": { de: "alle anderen, oft unregelm\xE4\xDFigen Verben.", en: "all other verbs, which are often irregular.", it: "tutti gli altri verbi, spesso irregolari.", es: "todos los dem\xE1s verbos, a menudo irregulares." },
  "\xCAtre et avoir": { de: "\xCAtre und avoir", en: "\xCAtre and avoir", it: "\xCAtre e avoir", es: "\xCAtre y avoir" },
  "Ces deux verbes ont leurs propres conjugaisons et servent aussi d\u2019auxiliaires pour former les temps compos\xE9s.": { de: "Diese beiden Verben haben eigene Konjugationen und dienen auch als Hilfsverben zur Bildung zusammengesetzter Zeiten.", en: "These two verbs have their own conjugations and also serve as auxiliaries for compound tenses.", it: "Questi due verbi hanno coniugazioni proprie e servono anche da ausiliari per formare i tempi composti.", es: "Estos dos verbos tienen conjugaciones propias y tambi\xE9n sirven de auxiliares para formar los tiempos compuestos." },
  "auxiliaire + participe pass\xE9": { de: "Hilfsverb + Partizip Perfekt", en: "auxiliary + past participle", it: "ausiliare + participio passato", es: "auxiliar + participio pasado" },
  "La construction": { de: "Der Aufbau", en: "Formation", it: "La costruzione", es: "La formaci\xF3n" },
  "Formation des principaux temps": { de: "Bildung der wichtigsten Zeitformen", en: "Formation of the main tenses", it: "Formazione dei tempi principali", es: "Formaci\xF3n de los tiempos principales" },
  "Construction": { de: "Bildung", en: "Formation", it: "Formazione", es: "Formaci\xF3n" },
  "Exemple": { de: "Beispiel", en: "Example", it: "Esempio", es: "Ejemplo" },
  "radical + terminaisons du pr\xE9sent": { de: "Stamm + Pr\xE4sensendungen", en: "stem + present-tense endings", it: "radice + desinenze del presente", es: "ra\xEDz + terminaciones del presente" },
  "radical de \xAB nous \xBB au pr\xE9sent + -ais, -ais, -ait, -ions, -iez, -aient": { de: "Stamm der nous-Form im Pr\xE4sens + -ais, -ais, -ait, -ions, -iez, -aient", en: "stem of the present nous form + -ais, -ais, -ait, -ions, -iez, -aient", it: "radice della forma nous al presente + -ais, -ais, -ait, -ions, -iez, -aient", es: "ra\xEDz de la forma nous del presente + -ais, -ais, -ait, -ions, -iez, -aient" },
  "infinitif, ou radical irr\xE9gulier, + -ai, -as, -a, -ons, -ez, -ont": { de: "Infinitiv oder unregelm\xE4\xDFiger Stamm + -ai, -as, -a, -ons, -ez, -ont", en: "infinitive, or irregular stem, + -ai, -as, -a, -ons, -ez, -ont", it: "infinito, o radice irregolare, + -ai, -as, -a, -ons, -ez, -ont", es: "infinitivo, o ra\xEDz irregular, + -ai, -as, -a, -ons, -ez, -ont" },
  "radical du futur + terminaisons de l\u2019imparfait": { de: "Futurstamm + Imparfait-Endungen", en: "future stem + imperfect endings", it: "radice del futuro + desinenze dell\u2019imperfetto", es: "ra\xEDz del futuro + terminaciones del imperfecto" },
  "auxiliaire conjugu\xE9 + participe pass\xE9": { de: "konjugiertes Hilfsverb + Partizip Perfekt", en: "conjugated auxiliary + past participle", it: "ausiliare coniugato + participio passato", es: "auxiliar conjugado + participio pasado" },
  "Le bon r\xE9flexe": { de: "Der richtige Reflex", en: "A useful habit", it: "Il riflesso giusto", es: "El buen reflejo" },
  "Pour reconna\xEEtre un temps compos\xE9, cherche d\u2019abord une forme de avoir ou d\u2019\xEAtre, puis le participe pass\xE9.": { de: "Um eine zusammengesetzte Zeit zu erkennen, suche zuerst eine Form von avoir oder \xEAtre und dann das Partizip Perfekt.", en: "To identify a compound tense, first look for a form of avoir or \xEAtre, then the past participle.", it: "Per riconoscere un tempo composto, cerca prima una forma di avoir o \xEAtre, poi il participio passato.", es: "Para reconocer un tiempo compuesto, busca primero una forma de avoir o \xEAtre y despu\xE9s el participio pasado." },
  "Le sens": { de: "Die Bedeutung", en: "Meaning", it: "Il significato", es: "El significado" },
  "Fait": { de: "Tatsache", en: "Fact", it: "Fatto", es: "Hecho" },
  "Doute": { de: "Zweifel", en: "Doubt", it: "Dubbio", es: "Duda" },
  "Hypoth\xE8se": { de: "Annahme", en: "Hypothesis", it: "Ipotesi", es: "Hip\xF3tesis" },
  "Consigne": { de: "Aufforderung", en: "Instruction", it: "Istruzione", es: "Instrucci\xF3n" },
  "Pr\xE9sente un fait, une action certaine ou situ\xE9e dans le temps.": { de: "Dr\xFCckt eine Tatsache, eine sichere oder zeitlich eingeordnete Handlung aus.", en: "Presents a fact, a certain action or one situated in time.", it: "Presenta un fatto, un\u2019azione certa o collocata nel tempo.", es: "Presenta un hecho, una acci\xF3n segura o situada en el tiempo." },
  "Exprime notamment le souhait, la n\xE9cessit\xE9, le sentiment ou l\u2019incertitude.": { de: "Dr\xFCckt unter anderem Wunsch, Notwendigkeit, Gef\xFChl oder Unsicherheit aus.", en: "Expresses wishes, necessity, feelings or uncertainty, among other things.", it: "Esprime, tra l\u2019altro, desiderio, necessit\xE0, sentimento o incertezza.", es: "Expresa, entre otras cosas, deseo, necesidad, sentimiento o incertidumbre." },
  "Pr\xE9sente une possibilit\xE9, une information incertaine ou une action soumise \xE0 une condition.": { de: "Dr\xFCckt eine M\xF6glichkeit, eine unsichere Information oder eine bedingte Handlung aus.", en: "Presents a possibility, uncertain information or an action subject to a condition.", it: "Presenta una possibilit\xE0, un\u2019informazione incerta o un\u2019azione soggetta a una condizione.", es: "Presenta una posibilidad, una informaci\xF3n incierta o una acci\xF3n sujeta a una condici\xF3n." },
  "Exprime un ordre, un conseil ou une invitation, sans sujet exprim\xE9.": { de: "Dr\xFCckt einen Befehl, einen Rat oder eine Einladung ohne genanntes Subjekt aus.", en: "Expresses an order, advice or an invitation, without an explicit subject.", it: "Esprime un ordine, un consiglio o un invito, senza soggetto espresso.", es: "Expresa una orden, un consejo o una invitaci\xF3n, sin sujeto expl\xEDcito." },
  "Les correspondances": { de: "Die \xDCbereinstimmungen", en: "Agreement", it: "Le concordanze", es: "Las concordancias" },
  "Trouver le sujet": { de: "Das Subjekt finden", en: "Find the subject", it: "Trovare il soggetto", es: "Encontrar el sujeto" },
  "Le verbe s\u2019accorde en personne et en nombre avec son sujet, m\xEAme lorsque celui-ci est \xE9loign\xE9.": { de: "Das Verb stimmt in Person und Zahl mit seinem Subjekt \xFCberein, auch wenn dieses weit entfernt steht.", en: "The verb agrees in person and number with its subject, even when the subject is far away.", it: "Il verbo concorda in persona e numero con il soggetto, anche quando questo \xE8 lontano.", es: "El verbo concuerda en persona y n\xFAmero con el sujeto, aunque est\xE9 alejado." },
  "Identifier l\u2019auxiliaire": { de: "Das Hilfsverb bestimmen", en: "Identify the auxiliary", it: "Individuare l\u2019ausiliare", es: "Identificar el auxiliar" },
  "Avec \xEAtre, le participe pass\xE9 s\u2019accorde g\xE9n\xE9ralement avec le sujet.": { de: "Mit \xEAtre stimmt das Partizip Perfekt normalerweise mit dem Subjekt \xFCberein.", en: "With \xEAtre, the past participle generally agrees with the subject.", it: "Con \xEAtre, il participio passato concorda generalmente con il soggetto.", es: "Con \xEAtre, el participio pasado concuerda generalmente con el sujeto." },
  "Rep\xE9rer le COD avec avoir": { de: "Das direkte Objekt bei avoir erkennen", en: "Identify the direct object with avoir", it: "Individuare il complemento oggetto con avoir", es: "Identificar el complemento directo con avoir" },
  "Avec avoir, le participe pass\xE9 s\u2019accorde avec le COD seulement si celui-ci est plac\xE9 avant.": { de: "Mit avoir stimmt das Partizip Perfekt nur dann mit dem direkten Objekt \xFCberein, wenn dieses davorsteht.", en: "With avoir, the past participle agrees with the direct object only when it comes before it.", it: "Con avoir, il participio passato concorda con il complemento oggetto solo se questo \xE8 posto prima.", es: "Con avoir, el participio pasado concuerda con el complemento directo solo si este aparece antes." },
  "Verbes pronominaux": { de: "Pronominalverben", en: "Pronominal verbs", it: "Verbi pronominali", es: "Verbos pronominales" },
  "Leur accord d\xE9pend de la fonction du pronom. Il faut d\xE9terminer si celui-ci est COD, COI ou fait partie du verbe.": { de: "Ihre \xDCbereinstimmung h\xE4ngt von der Funktion des Pronomens ab. Bestimme, ob es direktes Objekt, indirektes Objekt oder Teil des Verbs ist.", en: "Their agreement depends on the function of the pronoun. Determine whether it is a direct object, an indirect object or part of the verb.", it: "La concordanza dipende dalla funzione del pronome. Bisogna stabilire se \xE8 complemento oggetto, complemento indiretto o parte del verbo.", es: "La concordancia depende de la funci\xF3n del pronombre. Hay que determinar si es complemento directo, indirecto o parte del verbo." },
  "Les pi\xE8ges fr\xE9quents": { de: "H\xE4ufige Stolperfallen", en: "Common pitfalls", it: "Le insidie frequenti", es: "Las trampas frecuentes" },
  "Pr\xE9server le son et l\u2019orthographe": { de: "Laut und Schreibweise bewahren", en: "Preserve sound and spelling", it: "Conservare il suono e l\u2019ortografia", es: "Conservar el sonido y la ortograf\xEDa" },
  "On ajoute parfois un e apr\xE8s g ou une c\xE9dille pour conserver le son.": { de: "Manchmal wird nach g ein e oder unter c eine Cedille erg\xE4nzt, um den Laut zu bewahren.", en: "An e after g or a cedilla is sometimes added to preserve the sound.", it: "A volte si aggiunge una e dopo g o una cediglia per conservare il suono.", es: "A veces se a\xF1ade una e despu\xE9s de g o una cedilla para conservar el sonido." },
  "Le y peut devenir i devant un e muet. Pour certains verbes, les deux graphies sont admises.": { de: "Vor einem stummen e kann y zu i werden. Bei manchen Verben sind beide Schreibweisen zul\xE4ssig.", en: "The y may become i before a silent e. For some verbs, both spellings are accepted.", it: "La y pu\xF2 diventare i davanti a una e muta. Per alcuni verbi sono ammesse entrambe le grafie.", es: "La y puede convertirse en i delante de una e muda. En algunos verbos se admiten ambas graf\xEDas." },
  "Certains verbes changent l\u2019accent lorsque la syllabe suivante contient un e muet.": { de: "Bei manchen Verben \xE4ndert sich der Akzent, wenn die folgende Silbe ein stummes e enth\xE4lt.", en: "Some verbs change their accent when the following syllable contains a silent e.", it: "Alcuni verbi cambiano accento quando la sillaba seguente contiene una e muta.", es: "Algunos verbos cambian el acento cuando la s\xEDlaba siguiente contiene una e muda." },
  "Consonne doubl\xE9e": { de: "Doppelter Konsonant", en: "Double consonant", it: "Consonante doppia", es: "Consonante doble" },
  "Certains verbes en -eler et -eter doublent la consonne ; d\u2019autres prennent un accent grave.": { de: "Manche Verben auf -eler und -eter verdoppeln den Konsonanten; andere erhalten einen accent grave.", en: "Some verbs ending in -eler and -eter double the consonant; others take a grave accent.", it: "Alcuni verbi in -eler e -eter raddoppiano la consonante; altri prendono un accento grave.", es: "Algunos verbos en -eler y -eter duplican la consonante; otros llevan acento grave." },
  "Remplace le verbe par \xAB vendre \xBB : si \xAB vendu \xBB convient, \xE9cris le participe pass\xE9 ; si \xAB vendre \xBB convient, \xE9cris l\u2019infinitif.": { de: "Ersetze das Verb durch \u201Evendre\u201C: Passt \u201Evendu\u201C, schreibe das Partizip Perfekt; passt \u201Evendre\u201C, schreibe den Infinitiv.", en: "Replace the verb with \u201Cvendre\u201D: if \u201Cvendu\u201D works, write the past participle; if \u201Cvendre\u201D works, write the infinitive.", it: "Sostituisci il verbo con \xABvendre\xBB: se va bene \xABvendu\xBB, scrivi il participio passato; se va bene \xABvendre\xBB, scrivi l\u2019infinito.", es: "Sustituye el verbo por \xABvendre\xBB: si encaja \xABvendu\xBB, escribe el participio pasado; si encaja \xABvendre\xBB, escribe el infinitivo." },
  "Le futur exprime ce qui arrivera ; le conditionnel d\xE9pend d\u2019une condition ou att\xE9nue une demande.": { de: "Das Futur dr\xFCckt aus, was geschehen wird; das Konditional h\xE4ngt von einer Bedingung ab oder mildert eine Bitte.", en: "The future expresses what will happen; the conditional depends on a condition or softens a request.", it: "Il futuro esprime ci\xF2 che accadr\xE0; il condizionale dipende da una condizione o attenua una richiesta.", es: "El futuro expresa lo que ocurrir\xE1; el condicional depende de una condici\xF3n o suaviza una petici\xF3n." },
  "\xC0 toi de jouer": { de: "Jetzt bist du dran", en: "Your turn", it: "Tocca a te", es: "Tu turno" },
  "Passe de la r\xE8gle \xE0 la pratique": { de: "Von der Regel zur Praxis", en: "Put the rules into practice", it: "Passa dalla regola alla pratica", es: "Pasa de la regla a la pr\xE1ctica" },
  "Consulte un mod\xE8le complet ou cr\xE9e un exercice cibl\xE9 pour v\xE9rifier ce que tu viens d\u2019apprendre.": { de: "Sieh dir ein vollst\xE4ndiges Konjugationsmuster an oder erstelle eine gezielte \xDCbung, um dein Wissen zu pr\xFCfen.", en: "View a full conjugation or create a focused exercise to check what you have just learned.", it: "Consulta un modello completo o crea un esercizio mirato per verificare ci\xF2 che hai appena imparato.", es: "Consulta un modelo completo o crea un ejercicio espec\xEDfico para comprobar lo que acabas de aprender." },
  "Pr\xE9sent": { de: "Pr\xE4sens", en: "Present", it: "Presente", es: "Presente" },
  "Imparfait": { de: "Imparfait", en: "Imperfect", it: "Imperfetto", es: "Pret\xE9rito imperfecto" },
  "Futur simple": { de: "Futur I", en: "Simple future", it: "Futuro semplice", es: "Futuro simple" },
  "Conditionnel pr\xE9sent": { de: "Konditional Pr\xE4sens", en: "Present conditional", it: "Condizionale presente", es: "Condicional presente" },
  "Temps compos\xE9": { de: "Zusammengesetzte Zeit", en: "Compound tense", it: "Tempo composto", es: "Tiempo compuesto" },
  "Charger ce d\xE9fi": { de: "Diese \xDCbung laden", en: "Load this challenge", it: "Carica questo esercizio", es: "Cargar este ejercicio" },
  "Modes et temps": { de: "Modi und Zeitformen", en: "Moods and tenses", it: "Modi e tempi", es: "Modos y tiempos" },
  "Verbes choisis": { de: "Ausgew\xE4hlte Verben", en: "Selected verbs", it: "Verbi scelti", es: "Verbos elegidos" },
  "{count} verbe": { de: "{count} Verb", en: "{count} verb", it: "{count} verbo", es: "{count} verbo" },
  "{count} verbes": { de: "{count} Verben", en: "{count} verbs", it: "{count} verbi", es: "{count} verbos" },
  "{count} temps": { de: "{count} Zeitformen", en: "{count} tenses", it: "{count} tempi", es: "{count} tiempos" },
  "R\xE9duire": { de: "Weniger anzeigen", en: "Show less", it: "Riduci", es: "Mostrar menos" },
  "Voir tout ({count})": { de: "Alle anzeigen ({count})", en: "View all ({count})", it: "Vedi tutti ({count})", es: "Ver todos ({count})" },
  "Retirer le verbe {verb}": { de: "Verb {verb} entfernen", en: "Remove the verb {verb}", it: "Rimuovi il verbo {verb}", es: "Eliminar el verbo {verb}" },
  "Quel est le mode et le temps de cette forme conjugu\xE9e ?": { de: "Welchen Modus und welche Zeitform hat diese konjugierte Form?", en: "What are the mood and tense of this conjugated form?", it: "Quali sono il modo e il tempo di questa forma coniugata?", es: "\xBFCu\xE1les son el modo y el tiempo de esta forma conjugada?" },
  "ou": { de: "oder", en: "or", it: "o", es: "o" },
  "f\xE9minin": { de: "weiblich", en: "feminine", it: "femminile", es: "femenino" },
  "masculin": { de: "m\xE4nnlich", en: "masculine", it: "maschile", es: "masculino" },
  "singulier": { de: "Singular", en: "singular", it: "singolare", es: "singular" },
  "pluriel": { de: "Plural", en: "plural", it: "plurale", es: "plural" },
  "C\u2019est juste : le COD \xAB {complement} \xBB est plac\xE9 avant le verbe \xAB {verb} \xBB. Avec avoir, le participe pass\xE9 s\u2019accorde donc avec ce COD{features} : \xAB {participle} \xBB.": { de: "Richtig: Das direkte Objekt \u201E{complement}\u201C steht vor dem Verb \u201E{verb}\u201C. Mit avoir stimmt das Partizip Perfekt daher mit diesem Objekt{features} \xFCberein: \u201E{participle}\u201C.", en: "Correct: the direct object \u201C{complement}\u201D comes before the verb \u201C{verb}\u201D. With avoir, the past participle therefore agrees with this direct object{features}: \u201C{participle}\u201D.", it: "Giusto: il complemento oggetto \xAB{complement}\xBB \xE8 posto prima del verbo \xAB{verb}\xBB. Con avoir, il participio passato concorda quindi con questo complemento{features}: \xAB{participle}\xBB.", es: "Correcto: el complemento directo \xAB{complement}\xBB aparece antes del verbo \xAB{verb}\xBB. Con avoir, el participio pasado concuerda por tanto con este complemento{features}: \xAB{participle}\xBB." },
  "Ici, le COD \xAB {complement} \xBB est plac\xE9 avant le verbe \xAB {verb} \xBB. Avec avoir, il commande l\u2019accord du participe pass\xE9{features} : \xAB {participle} \xBB.": { de: "Hier steht das direkte Objekt \u201E{complement}\u201C vor dem Verb \u201E{verb}\u201C. Mit avoir bestimmt es die Angleichung des Partizips Perfekt{features}: \u201E{participle}\u201C.", en: "Here, the direct object \u201C{complement}\u201D comes before the verb \u201C{verb}\u201D. With avoir, it determines the agreement of the past participle{features}: \u201C{participle}\u201D.", it: "Qui il complemento oggetto \xAB{complement}\xBB \xE8 posto prima del verbo \xAB{verb}\xBB. Con avoir determina la concordanza del participio passato{features}: \xAB{participle}\xBB.", es: "Aqu\xED, el complemento directo \xAB{complement}\xBB aparece antes del verbo \xAB{verb}\xBB. Con avoir, determina la concordancia del participio pasado{features}: \xAB{participle}\xBB." },
  "Le participe pass\xE9 n\u2019a pas le bon accord. Compare sa terminaison avec la correction.": { de: "Das Partizip Perfekt ist nicht richtig angeglichen. Vergleiche seine Endung mit der Korrektur.", en: "The past participle does not have the correct agreement. Compare its ending with the correction.", it: "Il participio passato non \xE8 concordato correttamente. Confronta la sua desinenza con la correzione.", es: "El participio pasado no tiene la concordancia correcta. Compara su terminaci\xF3n con la correcci\xF3n." },
  "Attention \xE0 l\u2019auxiliaire": { de: "Achte auf das Hilfsverb", en: "Check the auxiliary", it: "Attenzione all\u2019ausiliare", es: "Atenci\xF3n al auxiliar" },
  "cette personne": { de: "dieser Person", en: "this person", it: "questa persona", es: "esta persona" },
  "L\u2019auxiliaire \xAB {learnerAuxiliary} \xBB ne convient pas. Avec {person} au {tense}, il fallait \xAB {expectedAuxiliary} \xBB.": { de: "Das Hilfsverb \u201E{learnerAuxiliary}\u201C passt nicht. Mit {person} im {tense} musste \u201E{expectedAuxiliary}\u201C stehen.", en: "The auxiliary \u201C{learnerAuxiliary}\u201D is not correct. With {person} in the {tense}, \u201C{expectedAuxiliary}\u201D was required.", it: "L\u2019ausiliare \xAB{learnerAuxiliary}\xBB non \xE8 corretto. Con {person} al {tense} occorreva \xAB{expectedAuxiliary}\xBB.", es: "El auxiliar \xAB{learnerAuxiliary}\xBB no es correcto. Con {person} en {tense}, deb\xEDa usarse \xAB{expectedAuxiliary}\xBB." },
  "Pour reconna\xEEtre le COD, pose \xAB {verb} qui ? \xBB ou \xAB {verb} quoi ? \xBB. Il r\xE9pond sans pr\xE9position.": { de: "Um das direkte Objekt zu erkennen, frage \u201E{verb} wen?\u201C oder \u201E{verb} was?\u201C. Es antwortet ohne Pr\xE4position.", en: "To identify the direct object, ask \u201C{verb} whom?\u201D or \u201C{verb} what?\u201D. It answers without a preposition.", it: "Per riconoscere il complemento oggetto, chiedi \xAB{verb} chi?\xBB o \xAB{verb} che cosa?\xBB. Risponde senza preposizione.", es: "Para reconocer el complemento directo, pregunta \xAB\xBF{verb} a qui\xE9n?\xBB o \xAB\xBF{verb} qu\xE9?\xBB. Responde sin preposici\xF3n." },
  "C\u2019est juste : le COD \xAB {complement} \xBB est plac\xE9 apr\xE8s le verbe \xAB {verb} \xBB. Avec avoir, on n\u2019accorde pas le participe pass\xE9 avec un COD plac\xE9 apr\xE8s : il reste \xAB {participle} \xBB.": { de: "Richtig: Das direkte Objekt \u201E{complement}\u201C steht nach dem Verb \u201E{verb}\u201C. Mit avoir wird das Partizip Perfekt nicht an ein nachgestelltes Objekt angeglichen: Es bleibt \u201E{participle}\u201C.", en: "Correct: the direct object \u201C{complement}\u201D comes after the verb \u201C{verb}\u201D. With avoir, the past participle does not agree with a direct object placed after it, so it remains \u201C{participle}\u201D.", it: "Giusto: il complemento oggetto \xAB{complement}\xBB \xE8 posto dopo il verbo \xAB{verb}\xBB. Con avoir, il participio passato non concorda con un complemento posto dopo: resta \xAB{participle}\xBB.", es: "Correcto: el complemento directo \xAB{complement}\xBB aparece despu\xE9s del verbo \xAB{verb}\xBB. Con avoir, el participio pasado no concuerda con un complemento colocado despu\xE9s: queda \xAB{participle}\xBB." },
  "Ici, le COD \xAB {complement} \xBB est plac\xE9 apr\xE8s le verbe \xAB {verb} \xBB. Il ne commande donc aucun accord : le participe pass\xE9 reste \xAB {participle} \xBB.": { de: "Hier steht das direkte Objekt \u201E{complement}\u201C nach dem Verb \u201E{verb}\u201C. Es bewirkt daher keine Angleichung: Das Partizip Perfekt bleibt \u201E{participle}\u201C.", en: "Here, the direct object \u201C{complement}\u201D comes after the verb \u201C{verb}\u201D. It therefore causes no agreement: the past participle remains \u201C{participle}\u201D.", it: "Qui il complemento oggetto \xAB{complement}\xBB \xE8 posto dopo il verbo \xAB{verb}\xBB. Non determina quindi alcuna concordanza: il participio passato resta \xAB{participle}\xBB.", es: "Aqu\xED, el complemento directo \xAB{complement}\xBB aparece despu\xE9s del verbo \xAB{verb}\xBB. Por tanto, no determina ninguna concordancia: el participio pasado queda \xAB{participle}\xBB." },
  "C\u2019est juste : \xAB {complement} \xBB n\u2019est pas un COD, mais un COI du verbe \xAB {verb} \xBB. Un COI ne commande jamais l\u2019accord du participe pass\xE9 employ\xE9 avec avoir : il reste \xAB {participle} \xBB.": { de: "Richtig: \u201E{complement}\u201C ist kein direktes, sondern ein indirektes Objekt des Verbs \u201E{verb}\u201C. Ein indirektes Objekt bewirkt beim Partizip Perfekt mit avoir nie eine Angleichung: Es bleibt \u201E{participle}\u201C.", en: "Correct: \u201C{complement}\u201D is not a direct object but an indirect object of the verb \u201C{verb}\u201D. An indirect object never determines agreement of a past participle used with avoir, so it remains \u201C{participle}\u201D.", it: "Giusto: \xAB{complement}\xBB non \xE8 un complemento oggetto, ma un complemento indiretto del verbo \xAB{verb}\xBB. Un complemento indiretto non determina mai la concordanza del participio passato con avoir: resta \xAB{participle}\xBB.", es: "Correcto: \xAB{complement}\xBB no es un complemento directo, sino indirecto del verbo \xAB{verb}\xBB. Un complemento indirecto nunca determina la concordancia del participio pasado con avoir: queda \xAB{participle}\xBB." },
  "Attention : \xAB {complement} \xBB n\u2019est pas un COD, mais un COI du verbe \xAB {verb} \xBB. Il ne faut pas accorder le participe avec ce compl\xE9ment : il reste \xAB {participle} \xBB.": { de: "Vorsicht: \u201E{complement}\u201C ist kein direktes, sondern ein indirektes Objekt des Verbs \u201E{verb}\u201C. Das Partizip darf nicht an dieses Objekt angeglichen werden: Es bleibt \u201E{participle}\u201C.", en: "Careful: \u201C{complement}\u201D is not a direct object but an indirect object of the verb \u201C{verb}\u201D. The participle must not agree with this complement, so it remains \u201C{participle}\u201D.", it: "Attenzione: \xAB{complement}\xBB non \xE8 un complemento oggetto, ma un complemento indiretto del verbo \xAB{verb}\xBB. Il participio non va concordato con questo complemento: resta \xAB{participle}\xBB.", es: "Atenci\xF3n: \xAB{complement}\xBB no es un complemento directo, sino indirecto del verbo \xAB{verb}\xBB. El participio no debe concordar con este complemento: queda \xAB{participle}\xBB." },
  "Pour reconna\xEEtre le COI, rep\xE8re sa pr\xE9position et pose la question \xAB {question} \xBB.": { de: "Um das indirekte Objekt zu erkennen, achte auf seine Pr\xE4position und stelle die Frage \u201E{question}\u201C.", en: "To identify the indirect object, find its preposition and ask \u201C{question}\u201D.", it: "Per riconoscere il complemento indiretto, individua la preposizione e poni la domanda \xAB{question}\xBB.", es: "Para reconocer el complemento indirecto, identifica la preposici\xF3n y formula la pregunta \xAB{question}\xBB." }
};
function translateUiMessage(locale, message, parameters = {}) {
  const template = locale === "fr" ? message : uiMessages[message][locale];
  return template.replace(/\{([a-zA-Z0-9_]+)\}/gu, (_match, name) => {
    var _a;
    return String((_a = parameters[name]) != null ? _a : `{${name}}`);
  });
}
function isUiMessage(value) {
  return Object.prototype.hasOwnProperty.call(uiMessages, value);
}

if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch.create({
    baseURL: baseURL()
  });
}
if (!("global" in globalThis)) {
  globalThis.global = globalThis;
}
const appLayoutTransition = false;
const nuxtLinkDefaults = { "componentName": "NuxtLink" };
const asyncDataDefaults = { "deep": false };
const fetchDefaults = {};
const appId = "nuxt-app";
function getNuxtAppCtx(id = appId) {
  return getContext(id, {
    asyncContext: false
  });
}
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  let hydratingCount = 0;
  const nuxtApp = {
    _id: options.id || appId || "nuxt-app",
    _scope: effectScope(),
    provide: void 0,
    versions: {
      get nuxt() {
        return "4.4.8";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      ...options.ssrContext?.payload || {},
      data: shallowReactive({}),
      state: reactive({}),
      once: /* @__PURE__ */ new Set(),
      _errors: shallowReactive({})
    }),
    static: {
      data: {}
    },
    runWithContext(fn) {
      if (nuxtApp._scope.active && !getCurrentScope()) {
        return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
      }
      return callWithNuxt(nuxtApp, fn);
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: shallowReactive({}),
    _state: shallowReactive({}),
    _payloadRevivers: {},
    ...options
  };
  {
    nuxtApp.payload.serverRendered = true;
  }
  if (nuxtApp.ssrContext) {
    nuxtApp.payload.path = nuxtApp.ssrContext.url;
    nuxtApp.ssrContext.nuxt = nuxtApp;
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: nuxtApp.ssrContext.runtimeConfig.public,
      app: nuxtApp.ssrContext.runtimeConfig.app
    };
  }
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
function registerPluginHooks(nuxtApp, plugin2) {
  if (plugin2.hooks) {
    nuxtApp.hooks.addHooks(plugin2.hooks);
  }
}
async function applyPlugin(nuxtApp, plugin2) {
  if (typeof plugin2 === "function") {
    const { provide: provide2 } = await nuxtApp.runWithContext(() => plugin2(nuxtApp)) || {};
    if (provide2 && typeof provide2 === "object") {
      for (const key in provide2) {
        nuxtApp.provide(key, provide2[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  const resolvedPlugins = /* @__PURE__ */ new Set();
  const unresolvedPlugins = [];
  const parallels = [];
  let error = void 0;
  let promiseDepth = 0;
  async function executePlugin(plugin2) {
    const unresolvedPluginsForThisPlugin = plugin2.dependsOn?.filter((name) => plugins2.some((p) => p._name === name) && !resolvedPlugins.has(name)) ?? [];
    if (unresolvedPluginsForThisPlugin.length > 0) {
      unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin2]);
    } else {
      const promise = applyPlugin(nuxtApp, plugin2).then(async () => {
        if (plugin2._name) {
          resolvedPlugins.add(plugin2._name);
          await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
            if (dependsOn.has(plugin2._name)) {
              dependsOn.delete(plugin2._name);
              if (dependsOn.size === 0) {
                promiseDepth++;
                await executePlugin(unexecutedPlugin);
              }
            }
          }));
        }
      }).catch((e) => {
        if (!plugin2.parallel && !nuxtApp.payload.error) {
          throw e;
        }
        error ||= e;
      });
      if (plugin2.parallel) {
        parallels.push(promise);
      } else {
        await promise;
      }
    }
  }
  for (const plugin2 of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin2.env?.islands === false) {
      continue;
    }
    registerPluginHooks(nuxtApp, plugin2);
  }
  for (const plugin2 of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin2.env?.islands === false) {
      continue;
    }
    await executePlugin(plugin2);
  }
  await Promise.all(parallels);
  if (promiseDepth) {
    for (let i = 0; i < promiseDepth; i++) {
      await Promise.all(parallels);
    }
  }
  if (error) {
    throw nuxtApp.payload.error || error;
  }
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin2) {
  if (typeof plugin2 === "function") {
    return plugin2;
  }
  const _name = plugin2._name || plugin2.name;
  delete plugin2.name;
  return Object.assign(plugin2.setup || (() => {
  }), plugin2, { [NuxtPluginIndicator]: true, _name });
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => setup();
  const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
function tryUseNuxtApp(id) {
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = getCurrentInstance()?.appContext.app.$nuxt;
  }
  nuxtAppInstance ||= getNuxtAppCtx(id).tryUse();
  return nuxtAppInstance || null;
}
function useNuxtApp(id) {
  const nuxtAppInstance = tryUseNuxtApp(id);
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const LayoutMetaSymbol = /* @__PURE__ */ Symbol("layout-meta");
const PageRouteSymbol = /* @__PURE__ */ Symbol("route");
globalThis._importMeta_.url.replace(/\/app\/.*$/, "/");
const useRouter = () => {
  return useNuxtApp()?.$router;
};
const useRoute = () => {
  if (hasInjectionContext()) {
    return inject(PageRouteSymbol, useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
const HTML_ATTR_UNSAFE_RE = /[&"'<>]/g;
const HTML_ATTR_ENCODE_MAP = {
  "&": "%26",
  '"': "%22",
  "'": "%27",
  "<": "%3C",
  ">": "%3E"
};
function encodeForHtmlAttr(value) {
  return value.replace(HTML_ATTR_UNSAFE_RE, (c) => HTML_ATTR_ENCODE_MAP[c]);
}
const navigateTo = (to, options) => {
  to ||= "/";
  const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
  const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
  const isExternal = options?.external || isExternalHost;
  if (isExternal) {
    if (!options?.external) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const { protocol } = new URL(toPath, "http://localhost");
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
      const redirect = async function(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedHeader = encodeURL(location2, isExternalHost);
        const encodedLoc = encodeForHtmlAttr(encodedHeader);
        nuxtApp.ssrContext["~renderResponse"] = {
          statusCode: sanitizeStatusCode(options?.redirectCode || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: encodedHeader }
        };
        return response;
      };
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options?.replace) {
      (void 0).replace(toPath);
    } else {
      (void 0).href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  const encodedTo = typeof to === "string" ? encodeRoutePath(to) : to;
  return options?.replace ? router.replace(encodedTo) : router.push(encodedTo);
};
function resolveRouteObject(to) {
  return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
function encodeURL(location2, isExternalHost = false) {
  const url = new URL(location2, "http://localhost");
  if (!isExternalHost) {
    const pathname = url.pathname.replace(/^\/{2,}/, "/");
    return pathname + url.search + url.hash;
  }
  if (location2.startsWith("//")) {
    return url.toString().replace(url.protocol, "");
  }
  return url.toString();
}
function encodeRoutePath(url) {
  const parsed = parseURL(url);
  return encodePath(decodePath(parsed.pathname)) + parsed.search + parsed.hash;
}
const NUXT_ERROR_SIGNATURE = "__nuxt_error";
const useError = /* @__NO_SIDE_EFFECTS__ */ () => toRef(useNuxtApp().payload, "error");
const showError = (error) => {
  const nuxtError = createError(error);
  try {
    const error2 = /* @__PURE__ */ useError();
    if (false) ;
    error2.value ||= nuxtError;
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
const isNuxtError = (error) => !!error && typeof error === "object" && NUXT_ERROR_SIGNATURE in error;
const createError = (error) => {
  if (typeof error !== "string" && error.statusText) {
    error.message ??= error.statusText;
  }
  const nuxtError = createError$1(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  Object.defineProperty(nuxtError, "status", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusCode,
    configurable: true
  });
  Object.defineProperty(nuxtError, "statusText", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusMessage,
    configurable: true
  });
  return nuxtError;
};
function freezeHead(head) {
  const realPush = head.push;
  head.push = () => ({ dispose: () => {
  }, patch: () => {
  }, _poll: () => {
  } });
  return () => {
    head.push = realPush;
  };
}
const unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  enforce: "pre",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    if (nuxtApp.ssrContext.islandContext) {
      const unfreeze = freezeHead(head);
      nuxtApp.hooks.hookOnce("app:created", unfreeze);
    }
    nuxtApp.vueApp.use(head);
  }
});
function toArray$1(value) {
  return Array.isArray(value) ? value : [value];
}
const matcher = (m, p) => {
  return [];
};
const _routeRulesMatcher = (path) => defu({}, ...matcher("", typeof path === "string" ? path.toLowerCase() : path).map((r) => r.data).reverse());
const routeRulesMatcher$1 = _routeRulesMatcher;
function getRouteRules(arg) {
  const path = typeof arg === "string" ? arg : arg.path;
  try {
    return routeRulesMatcher$1(path.toLowerCase());
  } catch (e) {
    console.error("[nuxt] Error matching route rules.", e);
    return {};
  }
}
const _routes = [
  {
    name: "admin-admins",
    path: "/admin/admins",
    component: () => import('./admins-ByYqTX-l.mjs')
  },
  {
    name: "admin-caracteres",
    path: "/admin/caracteres",
    component: () => import('./caracteres-D9si6_na.mjs')
  },
  {
    name: "admin-challenges",
    path: "/admin/challenges",
    component: () => import('./challenges-BXLbpoli.mjs')
  },
  {
    name: "admin-characters",
    path: "/admin/characters",
    component: () => import('./characters-BXdrw2IO.mjs')
  },
  {
    name: "admin-charts",
    path: "/admin/charts",
    component: () => import('./charts-DkpYroMx.mjs')
  },
  {
    name: "admin-coaches",
    path: "/admin/coaches",
    component: () => import('./coaches-DCxPVcZ4.mjs')
  },
  {
    name: "admin-contact",
    path: "/admin/contact",
    component: () => import('./contact-CZwL-pF4.mjs')
  },
  {
    name: "admin-errors",
    path: "/admin/errors",
    component: () => import('./errors-Dekuc_zf.mjs')
  },
  {
    name: "admin-feedbacks",
    path: "/admin/feedbacks",
    component: () => import('./feedbacks-CJTL1j9_.mjs')
  },
  {
    name: "admin-help-verification",
    path: "/admin/help-verification",
    component: () => import('./help-verification-USdpnzJg.mjs')
  },
  {
    name: "admin-helps",
    path: "/admin/helps",
    component: () => import('./helps-x2fKobgt.mjs')
  },
  {
    name: "admin-literary-corpus",
    path: "/admin/literary-corpus",
    component: () => import('./literary-corpus-CHWF3U9e.mjs')
  },
  {
    name: "admin-phrases",
    path: "/admin/phrases",
    component: () => import('./phrases-D36F4JmP.mjs')
  },
  {
    name: "admin-shared-summaries",
    path: "/admin/shared-summaries",
    component: () => import('./shared-summaries-CFdn8Lx_.mjs')
  },
  {
    name: "admin-tests",
    path: "/admin/tests",
    component: () => import('./tests-BUcIaujo.mjs')
  },
  {
    name: "admin-users",
    path: "/admin/users",
    component: () => import('./users-B6ToOjwJ.mjs')
  },
  {
    name: "modes-mode-temps",
    path: "/modes/:mode()/:temps()",
    component: () => import('./_temps_-BkkPpQEC.mjs')
  },
  {
    name: "bilan-token",
    path: "/bilan/:token()",
    component: () => import('./_token_-uGNw_wpn.mjs')
  },
  {
    name: "defi-code",
    path: "/defi/:code()",
    component: () => import('./_code_-DzQ2HSrX.mjs')
  },
  {
    name: "exercices-parcours",
    path: "/exercices/:parcours()",
    component: () => import('./_parcours_-B1nmhSHG.mjs')
  },
  {
    name: "modes-mode",
    path: "/modes/:mode()",
    component: () => import('./index-D3n4Xe-s.mjs')
  },
  {
    name: "accueil",
    path: "/accueil",
    component: () => import('./accueil-BU3oxvk-.mjs')
  },
  {
    name: "admin",
    path: "/admin",
    component: () => import('./index-BKMT1r5g.mjs')
  },
  {
    name: "apprendre",
    path: "/apprendre",
    component: () => import('./apprendre-BTlT3UZi.mjs')
  },
  {
    name: "consulter",
    path: "/consulter",
    component: () => import('./consulter-eUhL7J3e.mjs')
  },
  {
    name: "exercices",
    path: "/exercices",
    component: () => import('./index-BM0DBf8x.mjs')
  },
  {
    name: "mon-compte",
    path: "/mon-compte",
    component: () => import('./mon-compte-CWRsuIbV.mjs')
  },
  {
    name: "my-page",
    path: "/my-page",
    meta: { "middleware": "learner-auth" },
    component: () => import('./my-page-DHD2DSIG.mjs')
  },
  {
    name: "nouveau-defi",
    path: "/nouveau-defi",
    component: () => import('./nouveau-defi-BVRbn8sA.mjs')
  },
  {
    name: "signin",
    path: "/signin",
    component: () => import('./signin-LSEvn-Xv.mjs')
  },
  {
    name: "index",
    path: "/",
    component: () => import('./index-vihwZrqJ.mjs')
  },
  {
    name: "mode-tense",
    path: "/:mode(indicatif|subjonctif|conditionnel|imperatif|participe)/:temps",
    component: () => import('./_temps_-BkkPpQEC.mjs')
  },
  {
    name: "localized-admin-admins",
    path: "/:locale(fr|de|en|it|es)/admin/admins",
    component: () => import('./admins-ByYqTX-l.mjs')
  },
  {
    name: "localized-admin-caracteres",
    path: "/:locale(fr|de|en|it|es)/admin/caracteres",
    component: () => import('./caracteres-D9si6_na.mjs')
  },
  {
    name: "localized-admin-challenges",
    path: "/:locale(fr|de|en|it|es)/admin/challenges",
    component: () => import('./challenges-BXLbpoli.mjs')
  },
  {
    name: "localized-admin-characters",
    path: "/:locale(fr|de|en|it|es)/admin/characters",
    component: () => import('./characters-BXdrw2IO.mjs')
  },
  {
    name: "localized-admin-charts",
    path: "/:locale(fr|de|en|it|es)/admin/charts",
    component: () => import('./charts-DkpYroMx.mjs')
  },
  {
    name: "localized-admin-coaches",
    path: "/:locale(fr|de|en|it|es)/admin/coaches",
    component: () => import('./coaches-DCxPVcZ4.mjs')
  },
  {
    name: "localized-admin-contact",
    path: "/:locale(fr|de|en|it|es)/admin/contact",
    component: () => import('./contact-CZwL-pF4.mjs')
  },
  {
    name: "localized-admin-errors",
    path: "/:locale(fr|de|en|it|es)/admin/errors",
    component: () => import('./errors-Dekuc_zf.mjs')
  },
  {
    name: "localized-admin-feedbacks",
    path: "/:locale(fr|de|en|it|es)/admin/feedbacks",
    component: () => import('./feedbacks-CJTL1j9_.mjs')
  },
  {
    name: "localized-admin-help-verification",
    path: "/:locale(fr|de|en|it|es)/admin/help-verification",
    component: () => import('./help-verification-USdpnzJg.mjs')
  },
  {
    name: "localized-admin-helps",
    path: "/:locale(fr|de|en|it|es)/admin/helps",
    component: () => import('./helps-x2fKobgt.mjs')
  },
  {
    name: "localized-admin-literary-corpus",
    path: "/:locale(fr|de|en|it|es)/admin/literary-corpus",
    component: () => import('./literary-corpus-CHWF3U9e.mjs')
  },
  {
    name: "localized-admin-phrases",
    path: "/:locale(fr|de|en|it|es)/admin/phrases",
    component: () => import('./phrases-D36F4JmP.mjs')
  },
  {
    name: "localized-admin-shared-summaries",
    path: "/:locale(fr|de|en|it|es)/admin/shared-summaries",
    component: () => import('./shared-summaries-CFdn8Lx_.mjs')
  },
  {
    name: "localized-admin-tests",
    path: "/:locale(fr|de|en|it|es)/admin/tests",
    component: () => import('./tests-BUcIaujo.mjs')
  },
  {
    name: "localized-admin-users",
    path: "/:locale(fr|de|en|it|es)/admin/users",
    component: () => import('./users-B6ToOjwJ.mjs')
  },
  {
    name: "localized-modes-mode-temps",
    path: "/:locale(fr|de|en|it|es)/modes/:mode()/:temps()",
    component: () => import('./_temps_-BkkPpQEC.mjs')
  },
  {
    name: "localized-bilan-token",
    path: "/:locale(fr|de|en|it|es)/bilan/:token()",
    component: () => import('./_token_-uGNw_wpn.mjs')
  },
  {
    name: "localized-defi-code",
    path: "/:locale(fr|de|en|it|es)/defi/:code()",
    component: () => import('./_code_-DzQ2HSrX.mjs')
  },
  {
    name: "localized-exercices-parcours",
    path: "/:locale(fr|de|en|it|es)/exercices/:parcours()",
    component: () => import('./_parcours_-B1nmhSHG.mjs')
  },
  {
    name: "localized-modes-mode",
    path: "/:locale(fr|de|en|it|es)/modes/:mode()",
    component: () => import('./index-D3n4Xe-s.mjs')
  },
  {
    name: "localized-accueil",
    path: "/:locale(fr|de|en|it|es)/accueil",
    component: () => import('./accueil-BU3oxvk-.mjs')
  },
  {
    name: "localized-admin",
    path: "/:locale(fr|de|en|it|es)/admin",
    component: () => import('./index-BKMT1r5g.mjs')
  },
  {
    name: "localized-apprendre",
    path: "/:locale(fr|de|en|it|es)/apprendre",
    component: () => import('./apprendre-BTlT3UZi.mjs')
  },
  {
    name: "localized-consulter",
    path: "/:locale(fr|de|en|it|es)/consulter",
    component: () => import('./consulter-eUhL7J3e.mjs')
  },
  {
    name: "localized-exercices",
    path: "/:locale(fr|de|en|it|es)/exercices",
    component: () => import('./index-BM0DBf8x.mjs')
  },
  {
    name: "localized-mon-compte",
    path: "/:locale(fr|de|en|it|es)/mon-compte",
    component: () => import('./mon-compte-CWRsuIbV.mjs')
  },
  {
    name: "localized-my-page",
    path: "/:locale(fr|de|en|it|es)/my-page",
    meta: { "middleware": "learner-auth" },
    component: () => import('./my-page-DHD2DSIG.mjs')
  },
  {
    name: "localized-nouveau-defi",
    path: "/:locale(fr|de|en|it|es)/nouveau-defi",
    component: () => import('./nouveau-defi-BVRbn8sA.mjs')
  },
  {
    name: "localized-signin",
    path: "/:locale(fr|de|en|it|es)/signin",
    component: () => import('./signin-LSEvn-Xv.mjs')
  },
  {
    name: "localized-index",
    path: "/:locale(fr|de|en|it|es)/",
    component: () => import('./index-vihwZrqJ.mjs')
  },
  {
    name: "localized-mode-tense",
    path: "/:locale(fr|de|en|it|es)/:mode(indicatif|subjonctif|conditionnel|imperatif|participe)/:temps",
    component: () => import('./_temps_-BkkPpQEC.mjs')
  }
];
const _wrapInTransition = (props, children) => {
  return { default: () => children.default?.() };
};
const ROUTE_KEY_PARENTHESES_RE = /(:\w+)\([^)]+\)/g;
const ROUTE_KEY_SYMBOLS_RE = /(:\w+)[?+*]/g;
const ROUTE_KEY_NORMAL_RE = /:\w+/g;
function generateRouteKey(route) {
  const source = route?.meta.key ?? route.path.replace(ROUTE_KEY_PARENTHESES_RE, "$1").replace(ROUTE_KEY_SYMBOLS_RE, "$1").replace(ROUTE_KEY_NORMAL_RE, (r) => route.params[r.slice(1)]?.toString() || "");
  return typeof source === "function" ? source(route) : source;
}
function isChangingPage(to, from) {
  if (to === from || from === START_LOCATION) {
    return false;
  }
  if (generateRouteKey(to) !== generateRouteKey(from)) {
    return true;
  }
  const areComponentsSame = to.matched.every(
    (comp, index) => comp.components && comp.components.default === from.matched[index]?.components?.default
  );
  if (areComponentsSame) {
    return false;
  }
  return true;
}
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}
function _mergeTransitionProps(routeProps) {
  const _props = [];
  for (const prop of routeProps) {
    if (!prop) {
      continue;
    }
    _props.push({
      ...prop,
      onAfterLeave: prop.onAfterLeave ? toArray(prop.onAfterLeave) : void 0,
      onBeforeLeave: prop.onBeforeLeave ? toArray(prop.onBeforeLeave) : void 0
    });
  }
  return defu(..._props);
}
const routerOptions0 = {
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp();
    const hashScrollBehaviour = useRouter().options?.scrollBehaviorType ?? "auto";
    if (to.path.replace(/\/$/, "") === from.path.replace(/\/$/, "")) {
      if (from.hash && !to.hash) {
        return { left: 0, top: 0 };
      }
      if (to.hash) {
        return { el: to.hash, top: _getHashElementScrollMarginTop(to.hash), behavior: hashScrollBehaviour };
      }
      return false;
    }
    const routeAllowsScrollToTop = typeof to.meta.scrollToTop === "function" ? to.meta.scrollToTop(to, from) : to.meta.scrollToTop;
    if (routeAllowsScrollToTop === false) {
      return false;
    }
    if (from === START_LOCATION) {
      return _calculatePosition(to, from, savedPosition, hashScrollBehaviour);
    }
    return new Promise((resolve) => {
      const doScroll = () => {
        requestAnimationFrame(() => resolve(_calculatePosition(to, from, savedPosition, hashScrollBehaviour)));
      };
      nuxtApp.hooks.hookOnce("page:loading:end", () => {
        const transitionPromise = nuxtApp["~transitionPromise"];
        if (transitionPromise) {
          transitionPromise.then(doScroll);
        } else {
          doScroll();
        }
      });
    });
  }
};
function _getHashElementScrollMarginTop(selector) {
  try {
    const elem = (void 0).querySelector(selector);
    if (elem) {
      return (Number.parseFloat(getComputedStyle(elem).scrollMarginTop) || 0) + (Number.parseFloat(getComputedStyle((void 0).documentElement).scrollPaddingTop) || 0);
    }
  } catch {
  }
  return 0;
}
function _calculatePosition(to, from, savedPosition, defaultHashScrollBehaviour) {
  if (savedPosition) {
    return savedPosition;
  }
  if (to.hash) {
    return {
      el: to.hash,
      top: _getHashElementScrollMarginTop(to.hash),
      behavior: isChangingPage(to, from) ? defaultHashScrollBehaviour : "instant"
    };
  }
  return {
    left: 0,
    top: 0
  };
}
const configRouterOptions = {
  hashMode: false,
  scrollBehaviorType: "auto"
};
const routerOptions = {
  ...configRouterOptions,
  ...routerOptions0
};
const validate = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to, from) => {
  let __temp, __restore;
  if (!to.meta?.validate) {
    return;
  }
  const result = ([__temp, __restore] = executeAsync(() => Promise.resolve(to.meta.validate(to))), __temp = await __temp, __restore(), __temp);
  if (result === true) {
    return;
  }
  const error = createError({
    fatal: false,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    status: result && (result.status || result.statusCode) || 404,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    statusText: result && (result.statusText || result.statusMessage) || `Page Not Found: ${to.fullPath}`,
    data: {
      path: to.fullPath
    }
  });
  return error;
});
function injectHead(nuxtApp) {
  const nuxt = nuxtApp || useNuxtApp();
  return nuxt.ssrContext?.head || nuxt.runWithContext(() => {
    if (hasInjectionContext()) {
      const head = inject(headSymbol);
      if (!head) {
        throw new Error("[nuxt] [unhead] Missing Unhead instance.");
      }
      return head;
    }
  });
}
function useHead(input, options = {}) {
  const head = options.head || injectHead(options.nuxt);
  return useHead$1(input, { head, ...options });
}
function useSeoMeta(input, options = {}) {
  const head = options.head || injectHead(options.nuxt);
  return useSeoMeta$1(input, { head, ...options });
}
function useRequestEvent(nuxtApp) {
  nuxtApp ||= useNuxtApp();
  return nuxtApp.ssrContext?.event;
}
function useRequestHeaders(include) {
  const event = useRequestEvent();
  const _headers = event ? getRequestHeaders(event) : {};
  if (!include || !event) {
    return _headers;
  }
  const headers = /* @__PURE__ */ Object.create(null);
  for (const _key of include) {
    const key = _key.toLowerCase();
    const header = _headers[key];
    if (header) {
      headers[key] = header;
    }
  }
  return headers;
}
function useRequestFetch() {
  return useRequestEvent()?.$fetch || globalThis.$fetch;
}
function parseCookieValue(value) {
  if (value === "undefined") {
    return void 0;
  }
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "number" && String(parsed) !== value) {
      return value;
    }
    return parsed;
  } catch {
    return value;
  }
}
const CookieDefaults = {
  path: "/",
  watch: true,
  decode: (val) => val ? parseCookieValue(decodeURIComponent(val)) : val,
  encode: (val) => {
    if (typeof val !== "string" || val === "undefined") {
      return encodeURIComponent(JSON.stringify(val));
    }
    try {
      if (typeof JSON.parse(val) !== "string") {
        return encodeURIComponent(JSON.stringify(val));
      }
    } catch {
    }
    return encodeURIComponent(val);
  },
  refresh: false
};
function useCookie(name, _opts) {
  const opts = { ...CookieDefaults, ..._opts };
  opts.filter ??= (key) => key === name;
  const cookies = readRawCookies(opts) || {};
  let delay;
  if (opts.maxAge !== void 0) {
    delay = opts.maxAge * 1e3;
  } else if (opts.expires) {
    delay = opts.expires.getTime() - Date.now();
  }
  const hasExpired = delay !== void 0 && delay <= 0;
  const cookieValue = klona(hasExpired ? void 0 : cookies[name] ?? opts.default?.());
  const cookie = cookieServerRef(name, cookieValue);
  {
    const nuxtApp = useNuxtApp();
    const writeFinalCookieValue = () => {
      const valueIsSame = isEqual(cookie.value, cookies[name]);
      if (opts.readonly || valueIsSame && !opts.refresh) {
        return;
      }
      nuxtApp._cookiesChanged ||= {};
      if (valueIsSame && opts.refresh && !nuxtApp._cookiesChanged[name]) {
        return;
      }
      nuxtApp._cookies ||= {};
      if (name in nuxtApp._cookies) {
        if (isEqual(cookie.value, nuxtApp._cookies[name])) {
          return;
        }
      }
      nuxtApp._cookies[name] = cookie.value;
      const encoded = cookie.value === null || cookie.value === void 0 ? void 0 : opts.encode(cookie.value);
      writeServerCookie(useRequestEvent(nuxtApp), name, encoded, opts);
    };
    const unhook = nuxtApp.hooks.hookOnce("app:rendered", writeFinalCookieValue);
    nuxtApp.hooks.hookOnce("app:error", () => {
      unhook();
      return writeFinalCookieValue();
    });
  }
  return cookie;
}
function readRawCookies(opts = {}) {
  {
    return parse(getRequestHeader(useRequestEvent(), "cookie") || "", opts);
  }
}
const identityEncode = (val) => val;
function toSerializeOptions(opts) {
  const { encode: _encode, decode: _decode, ...rest } = opts;
  return { ...rest, encode: identityEncode };
}
function writeServerCookie(event, name, value, opts = {}) {
  if (event) {
    const serializeOpts = toSerializeOptions(opts);
    if (value !== void 0) {
      return setCookie(event, name, value, serializeOpts);
    }
    if (getCookie(event, name) !== void 0) {
      return deleteCookie(event, name, serializeOpts);
    }
  }
}
function cookieServerRef(name, value) {
  const internalRef = ref(value);
  const nuxtApp = useNuxtApp();
  return customRef((track, trigger) => {
    return {
      get() {
        track();
        return internalRef.value;
      },
      set(newValue) {
        nuxtApp._cookiesChanged ||= {};
        nuxtApp._cookiesChanged[name] = true;
        internalRef.value = newValue;
        trigger();
      }
    };
  });
}
const locale_45global = /* @__PURE__ */ defineNuxtRouteMiddleware((to) => {
  const interfaceLocale = useCookie("interface_locale", {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax"
  });
  const legacyRedirect = permanentLegacyRedirect(to.path);
  if (legacyRedirect && legacyRedirect !== to.path) {
    const destinationLocale = localeFromPath(legacyRedirect);
    if (destinationLocale) interfaceLocale.value = destinationLocale;
    return navigateTo({
      path: legacyRedirect,
      query: to.query,
      hash: to.hash
    }, {
      redirectCode: 301,
      replace: true
    });
  }
  const routeLocale = localeFromPath(to.path);
  if (routeLocale) {
    if (interfaceLocale.value !== routeLocale) interfaceLocale.value = routeLocale;
    if (to.path.replace(/^\/(?:fr|de|en|it|es)(?=\/|$)/u, "") === "/charts") {
      return navigateTo({
        path: localizePath("/admin/charts", routeLocale),
        query: to.query,
        hash: to.hash
      }, {
        redirectCode: 301,
        replace: true
      });
    }
    return;
  }
  const locale = normalizeLocale(interfaceLocale.value, DEFAULT_INTERFACE_LOCALE);
  interfaceLocale.value = locale;
  const path = to.path === "/charts" ? "/admin/charts" : to.path;
  return navigateTo({
    path: localizePath(path, locale),
    query: to.query,
    hash: to.hash
  }, {
    redirectCode: 302,
    replace: true
  });
});
const manifest_45route_45rule = /* @__PURE__ */ defineNuxtRouteMiddleware((to) => {
  {
    return;
  }
});
const globalMiddleware = [
  validate,
  locale_45global,
  manifest_45route_45rule
];
const namedMiddleware = {
  "learner-auth": () => import('./learner-auth-BlQpcSD3.mjs')
};
Object.assign(/* @__PURE__ */ Object.create(null), {});
const pageIslandRoutes = Object.assign(/* @__PURE__ */ Object.create(null), {});
const plugin = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  async setup(nuxtApp) {
    let __temp, __restore;
    let routerBase = (/* @__PURE__ */ useRuntimeConfig()).app.baseURL;
    const history = routerOptions.history?.(routerBase) ?? createMemoryHistory(routerBase);
    const routes = routerOptions.routes ? ([__temp, __restore] = executeAsync(() => routerOptions.routes(_routes)), __temp = await __temp, __restore(), __temp) ?? _routes : _routes;
    let startPosition;
    const router = createRouter({
      ...routerOptions,
      scrollBehavior: (to, from, savedPosition) => {
        if (from === START_LOCATION) {
          startPosition = savedPosition;
          return;
        }
        if (routerOptions.scrollBehavior) {
          router.options.scrollBehavior = routerOptions.scrollBehavior;
          if ("scrollRestoration" in (void 0).history) {
            const unsub = router.beforeEach(() => {
              unsub();
              (void 0).history.scrollRestoration = "manual";
            });
          }
          return routerOptions.scrollBehavior(to, START_LOCATION, startPosition || savedPosition);
        }
      },
      history,
      routes
    });
    nuxtApp.vueApp.use(router);
    const previousRoute = shallowRef(router.currentRoute.value);
    router.afterEach((_to, from) => {
      previousRoute.value = from;
    });
    Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", {
      get: () => previousRoute.value
    });
    const initialURL = nuxtApp.ssrContext.url;
    const _route = shallowRef(router.currentRoute.value);
    const syncCurrentRoute = () => {
      _route.value = router.currentRoute.value;
    };
    router.afterEach((to, from) => {
      const lastTo = to.matched.at(-1)?.components?.default;
      const lastFrom = from.matched.at(-1)?.components?.default;
      if (lastTo === lastFrom) {
        syncCurrentRoute();
        return;
      }
      if (to.matched.length < from.matched.length && to.matched.every((m, i) => m.components?.default === from.matched[i]?.components?.default)) {
        syncCurrentRoute();
      }
    });
    const route = { sync: syncCurrentRoute };
    for (const key in _route.value) {
      Object.defineProperty(route, key, {
        get: () => _route.value[key],
        enumerable: true
      });
    }
    nuxtApp._route = shallowReactive(route);
    nuxtApp._middleware ||= {
      global: [],
      named: {}
    };
    const error = /* @__PURE__ */ useError();
    const isServerPage = nuxtApp.ssrContext?.islandContext?.name?.startsWith("page_");
    if (!nuxtApp.ssrContext?.islandContext || isServerPage) {
      router.afterEach(async (to, _from, failure) => {
        delete nuxtApp._processingMiddleware;
        if (failure) {
          await nuxtApp.callHook("page:loading:end");
        }
        if (failure?.type === 4) {
          return;
        }
        if (to.redirectedFrom && to.fullPath !== initialURL) {
          await nuxtApp.runWithContext(() => navigateTo(to.fullPath || "/"));
        }
      });
    }
    try {
      if (true) {
        ;
        [__temp, __restore] = executeAsync(() => router.push(initialURL)), await __temp, __restore();
        ;
      }
      ;
      [__temp, __restore] = executeAsync(() => router.isReady()), await __temp, __restore();
      ;
    } catch (error2) {
      [__temp, __restore] = executeAsync(() => nuxtApp.runWithContext(() => showError(error2))), await __temp, __restore();
    }
    const resolvedInitialRoute = router.currentRoute.value;
    const hasDeferredRoute = false;
    syncCurrentRoute();
    if (nuxtApp.ssrContext?.islandContext && !isServerPage) {
      return { provide: { router } };
    }
    const initialLayout = nuxtApp.payload.state._layout;
    router.beforeEach(async (to, from) => {
      await nuxtApp.callHook("page:loading:start");
      to.meta = reactive(to.meta);
      if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) {
        to.meta.layout = initialLayout;
      }
      nuxtApp._processingMiddleware = true;
      if (!nuxtApp.ssrContext?.islandContext || isServerPage) {
        const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
        for (const component of to.matched) {
          const componentMiddleware = component.meta.middleware;
          if (!componentMiddleware) {
            continue;
          }
          for (const entry2 of toArray$1(componentMiddleware)) {
            middlewareEntries.add(entry2);
          }
        }
        const routeRules = getRouteRules({ path: to.path });
        if (routeRules.appMiddleware) {
          for (const key in routeRules.appMiddleware) {
            if (routeRules.appMiddleware[key]) {
              middlewareEntries.add(key);
            } else {
              middlewareEntries.delete(key);
            }
          }
        }
        for (const entry2 of middlewareEntries) {
          const middleware = typeof entry2 === "string" ? nuxtApp._middleware.named[entry2] || await namedMiddleware[entry2]?.().then((r) => r.default || r) : entry2;
          if (!middleware) {
            throw new Error(`Unknown route middleware: '${entry2}'.`);
          }
          try {
            if (false) ;
            const result = await nuxtApp.runWithContext(() => middleware(to, from));
            if (true) {
              if (result === false || result instanceof Error) {
                const error2 = result || createError({
                  status: 404,
                  statusText: `Page Not Found: ${initialURL}`
                });
                await nuxtApp.runWithContext(() => showError(error2));
                return false;
              }
            }
            if (result === true) {
              continue;
            }
            if (result === false) {
              return result;
            }
            if (result) {
              if (isNuxtError(result) && result.fatal) {
                await nuxtApp.runWithContext(() => showError(result));
              }
              return result;
            }
          } catch (err) {
            const error2 = createError(err);
            if (error2.fatal) {
              await nuxtApp.runWithContext(() => showError(error2));
            }
            return error2;
          }
        }
      }
    });
    if (isServerPage) {
      router.beforeResolve((to) => {
        const expected = pageIslandRoutes[nuxtApp.ssrContext.islandContext.name];
        const actual = to.matched.find((m) => m.components?.default?.__nuxt_island)?.components?.default;
        if (!expected || expected !== actual?.__nuxt_island) {
          nuxtApp.ssrContext["~renderResponse"] = {
            statusCode: 400,
            statusMessage: "Invalid island request path"
          };
          return false;
        }
      });
    }
    router.onError(async () => {
      delete nuxtApp._processingMiddleware;
      await nuxtApp.callHook("page:loading:end");
    });
    router.afterEach((to) => {
      if (to.matched.length === 0 && !error.value) {
        return nuxtApp.runWithContext(() => showError(createError({
          status: 404,
          fatal: false,
          statusText: `Page not found: ${to.fullPath}`,
          data: {
            path: to.fullPath
          }
        })));
      }
    });
    nuxtApp.hooks.hookOnce("app:created", async () => {
      try {
        if ("name" in resolvedInitialRoute) {
          resolvedInitialRoute.name = void 0;
        }
        if (hasDeferredRoute) ;
        else {
          await router.replace({
            ...resolvedInitialRoute,
            force: true
          });
        }
        router.options.scrollBehavior = routerOptions.scrollBehavior;
      } catch (error2) {
        await nuxtApp.runWithContext(() => showError(error2));
      }
    });
    return { provide: { router } };
  }
});
function definePayloadReducer(name, reduce) {
  {
    useNuxtApp().ssrContext["~payloadReducers"][name] = reduce;
  }
}
const reducers = [
  ["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
  ["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
  ["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
  ["Ref", (data) => isRef(data) && data.value],
  ["Reactive", (data) => isReactive(data) && toRaw(data)]
];
const revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const [reducer, fn] of reducers) {
      definePayloadReducer(reducer, fn);
    }
  }
});
const components_plugin_4kY4pyzJIYX99vmMAAIorFf3CnAaptHitJgf7JxiED8 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
const plugins = [
  unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU,
  plugin,
  revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms,
  components_plugin_4kY4pyzJIYX99vmMAAIorFf3CnAaptHitJgf7JxiED8
];
const ServerPlaceholder = defineComponent({
  name: "ServerPlaceholder",
  render() {
    return createElementBlock("div");
  }
});
const layouts = {
  default: defineAsyncComponent(() => import('./default-DpTM6Kh9.mjs').then((m) => m.default || m))
};
const routeRulesMatcher = _routeRulesMatcher;
const LayoutLoader = defineComponent({
  name: "LayoutLoader",
  inheritAttrs: false,
  props: {
    name: String,
    layoutProps: Object
  },
  setup(props, context) {
    return () => h(layouts[props.name], props.layoutProps, context.slots);
  }
});
const nuxtLayoutProps = {
  name: {
    type: [String, Boolean, Object],
    default: null
  },
  fallback: {
    type: [String, Object],
    default: null
  }
};
const __nuxt_component_1 = defineComponent({
  name: "NuxtLayout",
  inheritAttrs: false,
  props: nuxtLayoutProps,
  setup(props, context) {
    const nuxtApp = useNuxtApp();
    const injectedRoute = inject(PageRouteSymbol);
    const shouldUseEagerRoute = !injectedRoute || injectedRoute === useRoute();
    const route = shouldUseEagerRoute ? useRoute$1() : injectedRoute;
    const layout = computed(() => {
      let layout2 = unref(props.name) ?? route?.meta.layout ?? routeRulesMatcher(route?.path).appLayout ?? "default";
      if (layout2 && !(layout2 in layouts)) {
        if (props.fallback) {
          layout2 = unref(props.fallback);
        }
      }
      return layout2;
    });
    const layoutRef = shallowRef();
    context.expose({ layoutRef });
    const done = nuxtApp.deferHydration();
    let lastLayout;
    return () => {
      const hasLayout = !!layout.value && layout.value in layouts;
      const hasTransition = hasLayout && !!(route?.meta.layoutTransition ?? appLayoutTransition);
      const transitionProps = hasTransition && _mergeTransitionProps([
        route?.meta.layoutTransition,
        appLayoutTransition,
        {
          onBeforeLeave() {
            nuxtApp["~transitionPromise"] = new Promise((resolve) => {
              nuxtApp["~transitionFinish"] = resolve;
            });
          },
          onAfterLeave() {
            nuxtApp["~transitionFinish"]?.();
            delete nuxtApp["~transitionFinish"];
            delete nuxtApp["~transitionPromise"];
          }
        }
      ]);
      const previouslyRenderedLayout = lastLayout;
      lastLayout = layout.value;
      return _wrapInTransition(transitionProps, {
        default: () => h(
          Suspense,
          {
            suspensible: true,
            onResolve: async () => {
              await nextTick(done);
            }
          },
          {
            default: () => h(
              LayoutProvider,
              {
                layoutProps: mergeProps(context.attrs, route.meta.layoutProps ?? {}, { ref: layoutRef }),
                key: layout.value || void 0,
                name: layout.value,
                shouldProvide: !props.name,
                isRenderingNewLayout: (name) => {
                  return name !== previouslyRenderedLayout && name === layout.value;
                },
                hasTransition
              },
              context.slots
            )
          }
        )
      }).default();
    };
  }
});
const LayoutProvider = defineComponent({
  name: "NuxtLayoutProvider",
  inheritAttrs: false,
  props: {
    name: {
      type: [String, Boolean]
    },
    layoutProps: {
      type: Object
    },
    hasTransition: {
      type: Boolean
    },
    shouldProvide: {
      type: Boolean
    },
    isRenderingNewLayout: {
      type: Function,
      required: true
    }
  },
  setup(props, context) {
    const name = props.name;
    if (props.shouldProvide) {
      provide(LayoutMetaSymbol, {
        // When name=false, always return true so NuxtPage doesn't skip rendering
        isCurrent: (route) => name === false || name === (route.meta.layout ?? routeRulesMatcher(route.path).appLayout ?? "default")
      });
    }
    const injectedRoute = inject(PageRouteSymbol);
    const isNotWithinNuxtPage = injectedRoute && injectedRoute === useRoute();
    if (isNotWithinNuxtPage) {
      const vueRouterRoute = useRoute$1();
      const reactiveChildRoute = {};
      for (const _key in vueRouterRoute) {
        const key = _key;
        Object.defineProperty(reactiveChildRoute, key, {
          enumerable: true,
          get: () => {
            return props.isRenderingNewLayout(props.name) ? vueRouterRoute[key] : injectedRoute[key];
          }
        });
      }
      provide(PageRouteSymbol, shallowReactive(reactiveChildRoute));
    }
    return () => {
      if (!name || typeof name === "string" && !(name in layouts)) {
        return context.slots.default?.();
      }
      return h(
        LayoutLoader,
        { key: name, layoutProps: props.layoutProps, name },
        context.slots
      );
    };
  }
});
const defineRouteProvider = (name = "RouteProvider") => defineComponent({
  name,
  props: {
    route: {
      type: Object,
      required: true
    },
    vnode: Object,
    vnodeRef: Object,
    renderKey: String,
    trackRootNodes: Boolean
  },
  setup(props) {
    const previousKey = props.renderKey;
    const previousRoute = props.route;
    const route = {};
    for (const key in props.route) {
      Object.defineProperty(route, key, {
        get: () => previousKey === props.renderKey ? props.route[key] : previousRoute[key],
        enumerable: true
      });
    }
    provide(PageRouteSymbol, shallowReactive(route));
    return () => {
      if (!props.vnode) {
        return props.vnode;
      }
      return h(props.vnode, { ref: props.vnodeRef });
    };
  }
});
const RouteProvider = defineRouteProvider();
const __nuxt_component_2 = defineComponent({
  name: "NuxtPage",
  inheritAttrs: false,
  props: {
    name: {
      type: String
    },
    transition: {
      type: [Boolean, Object],
      default: void 0
    },
    keepalive: {
      type: [Boolean, Object],
      default: void 0
    },
    route: {
      type: Object
    },
    pageKey: {
      type: [Function, String],
      default: null
    }
  },
  setup(props, { attrs, slots, expose }) {
    const nuxtApp = useNuxtApp();
    const pageRef = ref();
    inject(PageRouteSymbol, null);
    expose({ pageRef });
    inject(LayoutMetaSymbol, null);
    nuxtApp.deferHydration();
    return () => {
      return h(RouterView, { name: props.name, route: props.route, ...attrs }, {
        default: (routeProps) => {
          return h(Suspense, { suspensible: true }, {
            default() {
              return h(RouteProvider, {
                vnode: slots.default ? normalizeSlot(slots.default, routeProps) : routeProps.Component,
                route: routeProps.route,
                vnodeRef: pageRef
              });
            }
          });
        }
      });
    };
  }
});
function normalizeSlot(slot, data) {
  const slotContent = slot(data);
  return slotContent.length === 1 ? h(slotContent[0]) : h(Fragment, void 0, slotContent);
}
function useLanguagePreferences() {
  const route = useRoute();
  const cookieOptions = { maxAge: 60 * 60 * 24 * 365, path: "/", sameSite: "lax" };
  const interfaceCookie = useCookie("interface_locale", { ...cookieOptions, default: () => DEFAULT_LANGUAGE_PREFERENCES.interfaceLocale });
  const explanationCookie = useCookie("explanation_locale", { ...cookieOptions, default: () => DEFAULT_LANGUAGE_PREFERENCES.explanationLocale });
  const routeLocale = computed(() => localeFromPath(route.path));
  if (routeLocale.value && interfaceCookie.value !== routeLocale.value) {
    interfaceCookie.value = routeLocale.value;
  }
  const interfaceLocale = computed({
    get: () => routeLocale.value ?? normalizeLocale(interfaceCookie.value),
    set: (value) => {
      interfaceCookie.value = normalizeLocale(value);
    }
  });
  const explanationLocale = computed({
    get: () => normalizeLocale(explanationCookie.value),
    set: (value) => {
      explanationCookie.value = normalizeLocale(value);
    }
  });
  const preferences = computed(() => ({
    interfaceLocale: interfaceLocale.value,
    explanationLocale: explanationLocale.value
  }));
  function setInterfaceLocale(locale) {
    const normalizedLocale = normalizeLocale(locale);
    interfaceLocale.value = normalizedLocale;
    const path = localizePath(route.path, normalizedLocale);
    if (path !== route.path) {
      void navigateTo({ path, query: route.query, hash: route.hash });
    }
  }
  function setExplanationLocale(locale) {
    explanationLocale.value = locale;
  }
  function t(key, parameters) {
    return translateAppMessage(interfaceLocale.value, key, parameters);
  }
  function ui(message, parameters) {
    return translateUiMessage(interfaceLocale.value, message, parameters);
  }
  function uiLabel(message) {
    if (!message) return "";
    const normalized = message.trim();
    if (isUiMessage(normalized)) return translateUiMessage(interfaceLocale.value, normalized);
    const lower = normalized.toLocaleLowerCase("fr-CH");
    if (!isUiMessage(lower)) return message;
    const translated = translateUiMessage(interfaceLocale.value, lower);
    return new RegExp("^\\p{Lu}", "u").test(normalized) ? translated.charAt(0).toLocaleUpperCase(interfaceLocale.value) + translated.slice(1) : translated;
  }
  useHead(() => ({ htmlAttrs: { lang: interfaceLocale.value } }));
  function localePath(path, locale = interfaceLocale.value) {
    return localizePath(path, normalizeLocale(locale));
  }
  return { interfaceLocale, explanationLocale, preferences, setInterfaceLocale, setExplanationLocale, localePath, t, ui, uiLabel };
}
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "app",
  __ssrInlineRender: true,
  setup(__props) {
    const { ui, interfaceLocale } = useLanguagePreferences();
    const route = useRoute();
    const config = /* @__PURE__ */ useRuntimeConfig();
    const siteUrl = computed(() => String(config.public.siteUrl).replace(/\/$/u, ""));
    const routeWithoutLocale = computed(() => stripLocaleFromPath(route.path));
    const canonicalUrl = computed(() => `${siteUrl.value}${localizePath(routeWithoutLocale.value, interfaceLocale.value)}`);
    const privatePath = computed(() => /^(?:\/admin(?:\/|$)|\/(?:signin|my-page|mon-compte|nouveau-defi)(?:\/|$)|\/(?:defi|bilan)(?:\/|$))/u.test(routeWithoutLocale.value));
    function localizedPageKey(route2) {
      return stripLocaleFromPath(route2.path);
    }
    useHead(() => ({
      titleTemplate: (title) => title ? `${title} · ${ui("Défis de conjugaison")}` : ui("Défis de conjugaison"),
      meta: [
        { name: "theme-color", content: "#344758" },
        { name: "robots", content: privatePath.value ? "noindex, nofollow" : "index, follow" },
        { property: "og:site_name", content: "TATITOTU" },
        { property: "og:url", content: canonicalUrl.value },
        {
          name: "description",
          content: ui("Créez des défis de conjugaison, entraînez-vous et imprimez vos questionnaires.")
        }
      ],
      link: [
        { rel: "canonical", href: canonicalUrl.value },
        ...SUPPORTED_LOCALES.map((locale) => ({
          rel: "alternate",
          hreflang: locale,
          href: `${siteUrl.value}${localizePath(routeWithoutLocale.value, locale)}`
        })),
        {
          rel: "alternate",
          hreflang: "x-default",
          href: `${siteUrl.value}${localizePath(routeWithoutLocale.value, "fr")}`
        }
      ],
      script: [{
        id: "theme-init",
        src: "/theme-init.js"
      }]
    }));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtRouteAnnouncer = ServerPlaceholder;
      const _component_NuxtLayout = __nuxt_component_1;
      const _component_NuxtPage = __nuxt_component_2;
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_component_NuxtRouteAnnouncer, null, null, _parent));
      _push(ssrRenderComponent(_component_NuxtLayout, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtPage, { "page-key": localizedPageKey }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtPage, { "page-key": localizedPageKey })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    const status = Number(_error.statusCode || 500);
    const is404 = status === 404;
    const statusText = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = defineAsyncComponent(() => import('./error-404-dpVO1X5U.mjs'));
    const _Error = defineAsyncComponent(() => import('./error-500-Or7ZOf9q.mjs'));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ status: unref(status), statusText: unref(statusText), statusCode: unref(status), statusMessage: unref(statusText), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = () => null;
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup", []);
    const error = /* @__PURE__ */ useError();
    const abortRender = error.value && !nuxtApp.ssrContext.error;
    function invokeAppErrorHandler(err, target, info) {
      const errorHandler = nuxtApp.vueApp.config.errorHandler;
      if (errorHandler && !errorHandler.__nuxt_default) {
        try {
          errorHandler(err, target, info);
        } catch (handlerError) {
          console.error("[nuxt] Error in `app.config.errorHandler`", handlerError);
        }
      }
    }
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info)?.catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        invokeAppErrorHandler(err, target, info);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(abortRender)) {
            _push(`<div></div>`);
          } else if (unref(error)) {
            _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(_sfc_main$2), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(_sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (error) {
      await nuxt.hooks.callHook("app:error", error);
      nuxt.payload.error ||= createError(error);
    }
    if (ssrContext && (ssrContext["~renderResponse"] || ssrContext._renderResponse)) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry_default = ((ssrContext) => entry(ssrContext));

export { useRouter as a, useNuxtApp as b, useRuntimeConfig as c, nuxtLinkDefaults as d, entry_default as default, encodeRoutePath as e, useLanguagePreferences as f, useRoute as g, useRequestFetch as h, useRequestHeaders as i, asyncDataDefaults as j, createError as k, fetchDefaults as l, useRequestEvent as m, navigateTo as n, useSeoMeta as o, defineNuxtRouteMiddleware as p, resolveRouteObject as r, useHead as u };
//# sourceMappingURL=server.mjs.map
