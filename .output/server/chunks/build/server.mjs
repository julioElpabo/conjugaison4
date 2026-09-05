import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { computed, hasInjectionContext, inject, toRef, isRef, getCurrentInstance, ref, customRef, defineComponent, createElementBlock, defineAsyncComponent, h, unref, shallowRef, provide, shallowReactive, Suspense, Fragment, useSSRContext, createApp, withCtx, createVNode, onErrorCaptured, onServerPrefetch, resolveDynamicComponent, reactive, effectScope, nextTick, mergeProps, getCurrentScope, isReadonly, isShallow, isReactive, toRaw } from 'vue';
import { ag as SUPPORTED_LOCALES, w as withDutchVariants, aW as withSwissObjectAliases, aX as parseURL, aY as encodePath, aZ as decodePath, a_ as localeFromPath, z as normalizeLocale, a$ as getRequestHeaders, b0 as klona, c as createError$1, am as hasProtocol, ao as isScriptProtocol, an as joinURL, b1 as withQuery, b2 as DEFAULT_LANGUAGE_PREFERENCES, ak as localizePath, b3 as getRequestHeader, b4 as isEqual, b5 as sanitizeStatusCode, b6 as getContext, t as setCookie, x as getCookie, v as deleteCookie, b7 as $fetch, ah as localeLanguageTag, b8 as defu, O as stripLocaleFromPath, au as executeAsync, b9 as DEFAULT_INTERFACE_LOCALE } from '../nitro/nitro.mjs';
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
import 'web-push';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';
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
  if (localizedHome) {
    const locale = localizedHome[1];
    return locale === "fr" ? "/fr/exercices-de-conjugaison" : `/${locale}/`;
  }
  const normalizedPath = withoutTrailingSlash(path);
  const localizedModePath = normalizedPath.match(LOCALIZED_MODE_PATH);
  if (localizedModePath) {
    const [, locale, mode, tense] = localizedModePath;
    return mode && tense ? `/${locale}/${mode}/${tense}` : `/${locale}/apprendre`;
  }
  if (normalizedPath === "/") return "/fr/";
  if (normalizedPath === "/accueil") return "/fr/exercices-de-conjugaison";
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
const appMessages = withDutchVariants({
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
  },
  nl: {
    "language.interface": "Taal van de interface",
    "language.explanations": "Taal van de uitleg",
    "language.french": "Frans",
    "language.german": "Duits",
    "language.english": "Engels",
    "language.italian": "Italiaans",
    "language.spanish": "Spaans",
    "common.close": "Sluiten",
    "common.loading": "Bezig met laden\u2026",
    "common.save": "Opslaan",
    "common.cancel": "Annuleren"
  }
});
function translateAppMessage(locale, key, parameters = {}) {
  const template = appMessages[locale][key] || frenchMessages[key] || key;
  return template.replace(/\{([a-zA-Z0-9_]+)\}/gu, (_match, name) => {
    var _a;
    return String((_a = parameters[name]) != null ? _a : `{${name}}`);
  });
}

const uiMessages = {
  "D\xE9fis de conjugaison": withDutchVariants({ de: "Konjugations\xFCbungen", en: "Conjugation challenges", it: "Esercizi di coniugazione", es: "Ejercicios de conjugaci\xF3n", nl: "Vervoegingsuitdagingen" }),
  "D\xE9fi de conjugaison": withDutchVariants({ de: "Konjugations\xFCbung", en: "Conjugation challenge", it: "Esercizio di coniugazione", es: "Ejercicio de conjugaci\xF3n", nl: "Vervoegingsuitdaging" }),
  "D\xE9fi pr\xEAt \xE0 \xEAtre partag\xE9": withDutchVariants({ de: "\xDCbung bereit zum Teilen", en: "Challenge ready to share", it: "Esercizio pronto per essere condiviso", es: "Ejercicio listo para compartir", nl: "Uitdaging klaar om te delen" }),
  "D\xE9fi partag\xE9": withDutchVariants({ de: "Geteilte \xDCbung", en: "Shared challenge", it: "Esercizio condiviso", es: "Ejercicio compartido", nl: "Gedeelde uitdaging" }),
  "Phrases litt\xE9raires": withDutchVariants({ de: "Literarische S\xE4tze", en: "Literary sentences", it: "Frasi letterarie", es: "Frases literarias", nl: "Literaire zinnen" }),
  "Titre du d\xE9fi": withDutchVariants({ de: "Titel der \xDCbung", en: "Challenge title", it: "Titolo dell\u2019esercizio", es: "T\xEDtulo del ejercicio", nl: "Titel van de uitdaging" }),
  "Description du d\xE9fi": withDutchVariants({ de: "Beschreibung der \xDCbung", en: "Challenge description", it: "Descrizione dell\u2019esercizio", es: "Descripci\xF3n del ejercicio", nl: "Beschrijving van de uitdaging" }),
  "Facultatif : une description \xE0 l\u2019attention des personnes qui d\xE9couvriront ce d\xE9fi": withDutchVariants({ de: "Optional: eine Beschreibung f\xFCr Personen, die diese \xDCbung entdecken", en: "Optional: a description for people discovering this challenge", it: "Facoltativo: una descrizione per chi scoprir\xE0 questo esercizio", es: "Opcional: una descripci\xF3n para quienes descubran este ejercicio", nl: "Optioneel: een beschrijving voor wie deze uitdaging ontdekt" }),
  "Cr\xE9er le code": withDutchVariants({ de: "Code erstellen", en: "Create code", it: "Crea il codice", es: "Crear el c\xF3digo", nl: "Code aanmaken" }),
  "Cr\xE9ation\u2026": withDutchVariants({ de: "Wird erstellt\u2026", en: "Creating\u2026", it: "Creazione\u2026", es: "Creando\u2026", nl: "Wordt aangemaakt\u2026" }),
  "Nouveau parcours": withDutchVariants({ de: "Neue \xDCbungsstrecke", en: "New learning path", it: "Nuovo percorso", es: "Nuevo recorrido", nl: "Nieuw leertraject" }),
  "D\xE9fi {code} \xB7 Conjugaison": withDutchVariants({ de: "\xDCbung {code} \xB7 Konjugation", en: "Challenge {code} \xB7 Conjugation", it: "Esercizio {code} \xB7 Coniugazione", es: "Ejercicio {code} \xB7 Conjugaci\xF3n", nl: "Uitdaging {code} \xB7 Vervoeging" }),
  "Ouvrir et r\xE9aliser le d\xE9fi de conjugaison {code}.": withDutchVariants({ de: "Konjugations\xFCbung {code} \xF6ffnen und bearbeiten.", en: "Open and complete conjugation challenge {code}.", it: "Apri e completa l\u2019esercizio di coniugazione {code}.", es: "Abre y completa el ejercicio de conjugaci\xF3n {code}.", nl: "Open en maak vervoegingsuitdaging {code}." }),
  "Exercices de conjugaison fran\xE7aise gratuits et sans publicit\xE9": withDutchVariants({ de: "Kostenlose und werbefreie \xDCbungen zur franz\xF6sischen Konjugation", en: "Free, ad-free French conjugation exercises", it: "Esercizi gratuiti di coniugazione francese senza pubblicit\xE0", es: "Ejercicios gratuitos de conjugaci\xF3n francesa sin publicidad", nl: "Gratis oefeningen op Franse vervoeging, zonder reclame" }),
  "Exercices de conjugaison fran\xE7aise": withDutchVariants({ de: "\xDCbungen zur franz\xF6sischen Konjugation", en: "French conjugation exercises", it: "Esercizi di coniugazione francese", es: "Ejercicios de conjugaci\xF3n francesa", nl: "Oefeningen op Franse vervoeging" }),
  "Exercices de conjugaison fran\xE7aise gratuits, interactifs et personnalisables. Entra\xEEnez-vous aux temps et aux verbes de votre choix, sans publicit\xE9.": withDutchVariants({ de: "Kostenlose, interaktive und anpassbare \xDCbungen zur franz\xF6sischen Konjugation. \xDCben Sie die Zeitformen und Verben Ihrer Wahl, ganz ohne Werbung.", en: "Free, interactive and customisable French conjugation exercises. Practise the tenses and verbs of your choice, with no advertising.", it: "Esercizi di coniugazione francese gratuiti, interattivi e personalizzabili. Allenati con i tempi e i verbi che preferisci, senza pubblicit\xE0.", es: "Ejercicios de conjugaci\xF3n francesa gratuitos, interactivos y personalizables. Practica los tiempos y verbos que elijas, sin publicidad.", nl: "Gratis, interactieve oefeningen op Franse vervoeging op maat. Oefen de tijden en werkwoorden naar keuze, zonder reclame." }),
  "Conjugaison fran\xE7aise": withDutchVariants({ de: "Franz\xF6sische Konjugation", en: "French conjugation", it: "Coniugazione francese", es: "Conjugaci\xF3n francesa", nl: "Franse vervoeging" }),
  "Composez un d\xE9fi de conjugaison en choisissant les verbes, les modes et les temps.": withDutchVariants({ de: "Erstelle eine Konjugations\xFCbung, indem du Verben, Modi und Zeitformen ausw\xE4hlst.", en: "Create a conjugation challenge by choosing the verbs, moods and tenses.", it: "Crea un esercizio di coniugazione scegliendo verbi, modi e tempi.", es: "Crea un ejercicio de conjugaci\xF3n eligiendo verbos, modos y tiempos.", nl: "Maak een vervoegingsuitdaging door de werkwoorden, wijzen en tijden te kiezen." }),
  "TATITOTU est un outil gratuit et multilingue pour apprendre et enseigner la conjugaison fran\xE7aise, quel que soit le pays.": withDutchVariants({ de: "TATITOTU ist ein kostenloses, mehrsprachiges Werkzeug zum Lernen und Lehren der franz\xF6sischen Konjugation \u2013 unabh\xE4ngig vom Land.", en: "TATITOTU is a free, multilingual tool for learning and teaching French conjugation, wherever you are.", it: "TATITOTU \xE8 uno strumento gratuito e multilingue per imparare e insegnare la coniugazione francese, in qualunque Paese.", es: "TATITOTU es una herramienta gratuita y multiling\xFCe para aprender y ense\xF1ar la conjugaci\xF3n francesa desde cualquier pa\xEDs.", nl: "TATITOTU is een gratis, meertalig hulpmiddel om Franse vervoeging te leren en te onderwijzen, waar je ook bent." }),
  "Cr\xE9ez des d\xE9fis de conjugaison, entra\xEEnez-vous et imprimez vos questionnaires.": withDutchVariants({ de: "Erstelle Konjugations\xFCbungen, \xFCbe und drucke deine Frageb\xF6gen.", en: "Create conjugation challenges, practise and print your questionnaires.", it: "Crea esercizi di coniugazione, allenati e stampa i questionari.", es: "Crea ejercicios de conjugaci\xF3n, practica e imprime tus cuestionarios.", nl: "Maak vervoegingsuitdagingen, oefen en druk je vragenlijsten af." }),
  "Navigation principale": withDutchVariants({ de: "Hauptnavigation", en: "Main navigation", it: "Navigazione principale", es: "Navegaci\xF3n principal", nl: "Hoofdnavigatie" }),
  "Accueil": withDutchVariants({ de: "Startseite", en: "Home", it: "Home", es: "Inicio", nl: "Startpagina" }),
  "S\u2019exercer": withDutchVariants({ de: "\xDCben", en: "Practise", it: "Esercitarsi", es: "Practicar", nl: "Oefenen" }),
  "Consulter": withDutchVariants({ de: "Nachschlagen", en: "Look up", it: "Consultare", es: "Consultar", nl: "Opzoeken" }),
  "Apprendre": withDutchVariants({ de: "Lernen", en: "Learn", it: "Imparare", es: "Aprender", nl: "Leren" }),
  "Un outil gratuit pour travailler la conjugaison fran\xE7aise.": withDutchVariants({ de: "Ein kostenloses Werkzeug zum \xDCben der franz\xF6sischen Konjugation.", en: "A free tool for practising French conjugation.", it: "Uno strumento gratuito per esercitare la coniugazione francese.", es: "Una herramienta gratuita para practicar la conjugaci\xF3n francesa.", nl: "Een gratis hulpmiddel om Franse vervoeging te oefenen." }),
  "Contact": withDutchVariants({ de: "Kontakt", en: "Contact", it: "Contatti", es: "Contacto", nl: "Contact" }),
  "Administration": withDutchVariants({ de: "Verwaltung", en: "Administration", it: "Amministrazione", es: "Administraci\xF3n", nl: "Beheer" }),
  "Connexion": withDutchVariants({ de: "Anmelden", en: "Sign in", it: "Accedi", es: "Iniciar sesi\xF3n", nl: "Aanmelden" }),
  "Mon espace": withDutchVariants({ de: "Mein Bereich", en: "My page", it: "Il mio spazio", es: "Mi espacio", nl: "Mijn pagina" }),
  "Changer mon mot de passe": withDutchVariants({ de: "Mein Passwort \xE4ndern", en: "Change my password", it: "Cambia la mia password", es: "Cambiar mi contrase\xF1a", nl: "Mijn wachtwoord wijzigen" }),
  "D\xE9connexion\u2026": withDutchVariants({ de: "Abmeldung\u2026", en: "Signing out\u2026", it: "Disconnessione\u2026", es: "Cerrando sesi\xF3n\u2026", nl: "Bezig met afmelden\u2026" }),
  "Me d\xE9connecter": withDutchVariants({ de: "Abmelden", en: "Sign out", it: "Disconnettermi", es: "Cerrar sesi\xF3n", nl: "Afmelden" }),
  "Activer le mode clair": withDutchVariants({ de: "Hellen Modus aktivieren", en: "Switch to light mode", it: "Attiva la modalit\xE0 chiara", es: "Activar el modo claro", nl: "Lichte modus inschakelen" }),
  "Activer le mode sombre": withDutchVariants({ de: "Dunklen Modus aktivieren", en: "Switch to dark mode", it: "Attiva la modalit\xE0 scura", es: "Activar el modo oscuro", nl: "Donkere modus inschakelen" }),
  "Activer le mode FALC": withDutchVariants({ de: "Einfachen Modus aktivieren", en: "Enable easy-read mode", it: "Attiva la modalit\xE0 facile da leggere", es: "Activar el modo de lectura f\xE1cil", nl: "Eenvoudige leesmodus inschakelen" }),
  "D\xE9sactiver le mode FALC": withDutchVariants({ de: "Einfachen Modus deaktivieren", en: "Disable easy-read mode", it: "Disattiva la modalit\xE0 facile da leggere", es: "Desactivar el modo de lectura f\xE1cil", nl: "Eenvoudige leesmodus uitschakelen" }),
  "FALC": withDutchVariants({ de: "Leichte Sprache", en: "Easy to read", it: "Facile lettura", es: "Lectura f\xE1cil", nl: "Gemakkelijk te lezen" }),
  "Mode FALC": withDutchVariants({ de: "Einfacher Modus", en: "Easy-read mode", it: "Modalit\xE0 facile da leggere", es: "Modo de lectura f\xE1cil", nl: "Eenvoudige leesmodus" }),
  "Le mode FALC affiche seulement l\u2019essentiel. Les mots et les \xE9tapes sont plus simples.": withDutchVariants({ de: "Der einfache Modus zeigt nur das Wichtigste. W\xF6rter und Schritte sind einfacher.", en: "Easy-read mode shows only what matters. Words and steps are simpler.", it: "La modalit\xE0 facile mostra solo l\u2019essenziale. Le parole e i passaggi sono pi\xF9 semplici.", es: "El modo de lectura f\xE1cil muestra solo lo esencial. Las palabras y los pasos son m\xE1s sencillos.", nl: "De eenvoudige leesmodus toont alleen het belangrijkste. Woorden en stappen zijn eenvoudiger." }),
  "Entendre la r\xE9ponse": withDutchVariants({ de: "Antwort anh\xF6ren", en: "Hear the answer", it: "Ascolta la risposta", es: "Escuchar la respuesta", nl: "Het antwoord beluisteren" }),
  "\xC9couter la question": withDutchVariants({ de: "Frage anh\xF6ren", en: "Listen to the question", it: "Ascolta la domanda", es: "Escuchar la pregunta", nl: "De vraag beluisteren" }),
  "\xC9couter la d\xE9finition": withDutchVariants({ de: "Definition anh\xF6ren", en: "Listen to the definition", it: "Ascolta la definizione", es: "Escuchar la definici\xF3n", nl: "De definitie beluisteren" }),
  "\xC9couter cette ligne": withDutchVariants({ de: "Diese Zeile anh\xF6ren", en: "Listen to this line", it: "Ascolta questa riga", es: "Escuchar esta l\xEDnea", nl: "Deze regel beluisteren" }),
  "\xC9couter le nom du temps": withDutchVariants({ de: "Name der Zeitform anh\xF6ren", en: "Listen to the tense name", it: "Ascolta il nome del tempo", es: "Escuchar el nombre del tiempo", nl: "De naam van de tijd beluisteren" }),
  "\xC9couter le message du coach": withDutchVariants({ de: "Nachricht des Coaches anh\xF6ren", en: "Listen to the coach message", it: "Ascolta il messaggio del coach", es: "Escuchar el mensaje del coach", nl: "Het bericht van de coach beluisteren" }),
  "Couper le son": withDutchVariants({ de: "Ton ausschalten", en: "Mute sound", it: "Disattiva audio", es: "Silenciar", nl: "Geluid uitschakelen" }),
  "Activer le son": withDutchVariants({ de: "Ton einschalten", en: "Enable sound", it: "Attiva audio", es: "Activar sonido", nl: "Geluid inschakelen" }),
  "Lecture audio momentan\xE9ment indisponible.": withDutchVariants({ de: "Audiowiedergabe ist momentan nicht verf\xFCgbar.", en: "Audio playback is temporarily unavailable.", it: "La riproduzione audio non \xE8 momentaneamente disponibile.", es: "La reproducci\xF3n de audio no est\xE1 disponible temporalmente.", nl: "Audio afspelen is tijdelijk niet beschikbaar." }),
  "Chargement de l\u2019audio\u2026": withDutchVariants({ de: "Audio wird geladen\u2026", en: "Loading audio\u2026", it: "Caricamento audio\u2026", es: "Cargando audio\u2026", nl: "Audio wordt geladen\u2026" }),
  "Tu peux aussi \xE9couter la r\xE9ponse.": withDutchVariants({ de: "Du kannst dir die Antwort auch anh\xF6ren.", en: "You can also listen to the answer.", it: "Puoi anche ascoltare la risposta.", es: "Tambi\xE9n puedes escuchar la respuesta.", nl: "Je kunt het antwoord ook beluisteren." }),
  "Arr\xEAter la lecture": withDutchVariants({ de: "Wiedergabe beenden", en: "Stop reading", it: "Interrompi la lettura", es: "Detener la lectura", nl: "Voorlezen stoppen" }),
  "La lecture audio a \xE9chou\xE9. R\xE9essayer.": withDutchVariants({ de: "Die Audiowiedergabe ist fehlgeschlagen. Erneut versuchen.", en: "Audio playback failed. Try again.", it: "La riproduzione audio non \xE8 riuscita. Riprova.", es: "La reproducci\xF3n de audio fall\xF3. Int\xE9ntalo de nuevo.", nl: "Afspelen mislukt. Probeer opnieuw." }),
  "R\xE9\xE9couter cette phrase": withDutchVariants({ de: "Diesen Satz erneut anh\xF6ren", en: "Listen to this sentence again", it: "Riascolta questa frase", es: "Volver a escuchar esta frase", nl: "Deze zin opnieuw beluisteren" }),
  "R\xE9ponse entendue": withDutchVariants({ de: "Antwort angeh\xF6rt", en: "Answer heard", it: "Risposta ascoltata", es: "Respuesta escuchada", nl: "Antwoord beluisterd" }),
  "Pas maintenant": withDutchVariants({ de: "Nicht jetzt", en: "Not now", it: "Non ora", es: "Ahora no", nl: "Niet nu" }),
  "J\u2019ai un code": withDutchVariants({ de: "Ich habe einen Code", en: "I have a code", it: "Ho un codice", es: "Tengo un c\xF3digo", nl: "Ik heb een code" }),
  "Choisir un d\xE9fi": withDutchVariants({ de: "Eine \xDCbung ausw\xE4hlen", en: "Choose a challenge", it: "Scegli un esercizio", es: "Elegir un ejercicio", nl: "Kies een uitdaging" }),
  "Cr\xE9er mon exercice": withDutchVariants({ de: "Meine \xDCbung erstellen", en: "Create my exercise", it: "Crea il mio esercizio", es: "Crear mi ejercicio", nl: "Mijn oefening maken" }),
  "\xC9cris le code du d\xE9fi": withDutchVariants({ de: "Gib den \xDCbungscode ein", en: "Enter the challenge code", it: "Scrivi il codice dell\u2019esercizio", es: "Escribe el c\xF3digo del ejercicio", nl: "Voer de code van de uitdaging in" }),
  "Ouvrir le d\xE9fi": withDutchVariants({ de: "\xDCbung \xF6ffnen", en: "Open challenge", it: "Apri l\u2019esercizio", es: "Abrir el ejercicio", nl: "Uitdaging openen" }),
  "Choisis un d\xE9fi": withDutchVariants({ de: "W\xE4hle eine \xDCbung", en: "Choose a challenge", it: "Scegli un esercizio", es: "Elige un ejercicio", nl: "Kies een uitdaging" }),
  "\xC9tape pr\xE9c\xE9dente": withDutchVariants({ de: "Vorheriger Schritt", en: "Previous step", it: "Passaggio precedente", es: "Paso anterior", nl: "Vorige stap" }),
  "\xC9tape suivante": withDutchVariants({ de: "N\xE4chster Schritt", en: "Next step", it: "Passaggio successivo", es: "Paso siguiente", nl: "Volgende stap" }),
  "Commencer": withDutchVariants({ de: "Starten", en: "Start", it: "Inizia", es: "Empezar", nl: "Starten" }),
  "Exercice de conjugaison": withDutchVariants({ de: "Konjugations\xFCbung", en: "Conjugation exercise", it: "Esercizio di coniugazione", es: "Ejercicio de conjugaci\xF3n", nl: "Vervoegingsoefening" }),
  "Juste !": withDutchVariants({ de: "Richtig!", en: "Correct!", it: "Giusto!", es: "\xA1Correcto!", nl: "Juist!" }),
  "C\u2019est faux.": withDutchVariants({ de: "Das ist falsch.", en: "That\u2019s incorrect.", it: "Non \xE8 corretto.", es: "No es correcto.", nl: "Dat is niet juist." }),
  "La bonne r\xE9ponse est \xAB {expectedAnswer} \xBB.": withDutchVariants({ de: "Die richtige Antwort ist \u201E{expectedAnswer}\u201C.", en: "The correct answer is \u201C{expectedAnswer}\u201D.", it: "La risposta corretta \xE8 \xAB{expectedAnswer}\xBB.", es: "La respuesta correcta es \xAB{expectedAnswer}\xBB.", nl: "Het juiste antwoord is \u201C{expectedAnswer}\u201D." }),
  "Faux.": withDutchVariants({ de: "Falsch.", en: "Incorrect.", it: "Sbagliato.", es: "Incorrecto.", nl: "Onjuist." }),
  "Bonne r\xE9ponse :": withDutchVariants({ de: "Richtige Antwort:", en: "Correct answer:", it: "Risposta corretta:", es: "Respuesta correcta:", nl: "Juist antwoord:" }),
  "Voir les autres modes": withDutchVariants({ de: "Andere Modi anzeigen", en: "Show other moods", it: "Mostra gli altri modi", es: "Ver otros modos", nl: "Andere wijzen tonen" }),
  "Masquer les autres modes": withDutchVariants({ de: "Andere Modi ausblenden", en: "Hide other moods", it: "Nascondi gli altri modi", es: "Ocultar otros modos", nl: "Andere wijzen verbergen" }),
  "Langue de l\u2019interface": withDutchVariants({ de: "Sprache der Benutzeroberfl\xE4che", en: "Interface language", it: "Lingua dell\u2019interfaccia", es: "Idioma de la interfaz", nl: "Taal van de interface" }),
  "Fran\xE7ais": withDutchVariants({ de: "Franz\xF6sisch", en: "French", it: "Francese", es: "Franc\xE9s", nl: "Frans" }),
  "Allemand": withDutchVariants({ de: "Deutsch", en: "German", it: "Tedesco", es: "Alem\xE1n", nl: "Duits" }),
  "Anglais": withDutchVariants({ de: "Englisch", en: "English", it: "Inglese", es: "Ingl\xE9s", nl: "Engels" }),
  "Italien": withDutchVariants({ de: "Italienisch", en: "Italian", it: "Italiano", es: "Italiano", nl: "Italiaans" }),
  "Espagnol": withDutchVariants({ de: "Spanisch", en: "Spanish", it: "Spagnolo", es: "Espa\xF1ol", nl: "Spaans" }),
  "Fermer": withDutchVariants({ de: "Schlie\xDFen", en: "Close", it: "Chiudi", es: "Cerrar", nl: "Sluiten" }),
  "Chargement\u2026": withDutchVariants({ de: "Wird geladen\u2026", en: "Loading\u2026", it: "Caricamento\u2026", es: "Cargando\u2026", nl: "Bezig met laden\u2026" }),
  "R\xE9essayer": withDutchVariants({ de: "Erneut versuchen", en: "Try again", it: "Riprova", es: "Reintentar", nl: "Opnieuw proberen" }),
  "Annuler": withDutchVariants({ de: "Abbrechen", en: "Cancel", it: "Annulla", es: "Cancelar", nl: "Annuleren" }),
  "Termin\xE9": withDutchVariants({ de: "Fertig", en: "Done", it: "Fatto", es: "Listo", nl: "Klaar" }),
  "Copier": withDutchVariants({ de: "Kopieren", en: "Copy", it: "Copia", es: "Copiar", nl: "Kopi\xEBren" }),
  "Code copi\xE9": withDutchVariants({ de: "Code kopiert", en: "Code copied", it: "Codice copiato", es: "C\xF3digo copiado", nl: "Code gekopieerd" }),
  "Lien copi\xE9": withDutchVariants({ de: "Link kopiert", en: "Link copied", it: "Link copiato", es: "Enlace copiado", nl: "Link gekopieerd" }),
  "La copie a \xE9chou\xE9.": withDutchVariants({ de: "Das Kopieren ist fehlgeschlagen.", en: "Copying failed.", it: "Copia non riuscita.", es: "No se ha podido copiar.", nl: "Kopi\xEBren mislukt." }),
  "Retour": withDutchVariants({ de: "Zur\xFCck", en: "Back", it: "Indietro", es: "Volver", nl: "Terug" }),
  "Continuer": withDutchVariants({ de: "Weiter", en: "Continue", it: "Continua", es: "Continuar", nl: "Verder" }),
  "Mesure d\u2019activit\xE9": withDutchVariants({ de: "Aktivit\xE4tsmessung", en: "Activity tracking", it: "Misurazione dell\u2019attivit\xE0", es: "Medici\xF3n de actividad", nl: "Activiteiten volgen" }),
  "Statistiques": withDutchVariants({ de: "Statistiken", en: "Statistics", it: "Statistiche", es: "Estad\xEDsticas", nl: "Statistieken" }),
  "Vue quotidienne des 30 derniers jours enregistr\xE9s.": withDutchVariants({ de: "Tagesansicht der letzten 30 aufgezeichneten Tage.", en: "Daily view of the last 30 recorded days.", it: "Vista giornaliera degli ultimi 30 giorni registrati.", es: "Vista diaria de los \xFAltimos 30 d\xEDas registrados.", nl: "Dagoverzicht van de laatste 30 geregistreerde dagen." }),
  "Chargement des statistiques\u2026": withDutchVariants({ de: "Statistiken werden geladen\u2026", en: "Loading statistics\u2026", it: "Caricamento delle statistiche\u2026", es: "Cargando estad\xEDsticas\u2026", nl: "Statistieken worden geladen\u2026" }),
  "Impossible de charger les statistiques.": withDutchVariants({ de: "Die Statistiken konnten nicht geladen werden.", en: "The statistics could not be loaded.", it: "Impossibile caricare le statistiche.", es: "No se han podido cargar las estad\xEDsticas.", nl: "De statistieken konden niet worden geladen." }),
  "Le conjugueur": withDutchVariants({ de: "Konjugator", en: "Conjugator", it: "Coniugatore", es: "Conjugador", nl: "Vervoegingshulp" }),
  "Consulter un verbe": withDutchVariants({ de: "Ein Verb nachschlagen", en: "Look up a verb", it: "Consultare un verbo", es: "Consultar un verbo", nl: "Een werkwoord opzoeken" }),
  "Recherchez un verbe et consultez sa conjugaison \xE0 tous les modes et \xE0 tous les temps.": withDutchVariants({ de: "Suche ein Verb und sieh seine Konjugation in allen Modi und Zeitformen nach.", en: "Search for a verb and view its conjugation in every mood and tense.", it: "Cerca un verbo e consulta la coniugazione in tutti i modi e tempi.", es: "Busca un verbo y consulta su conjugaci\xF3n en todos los modos y tiempos.", nl: "Zoek een werkwoord en bekijk de vervoeging in elke wijs en tijd." }),
  "Chargement du catalogue\u2026": withDutchVariants({ de: "Katalog wird geladen\u2026", en: "Loading catalogue\u2026", it: "Caricamento del catalogo\u2026", es: "Cargando cat\xE1logo\u2026", nl: "Catalogus wordt geladen\u2026" }),
  "Le catalogue n\u2019a pas pu \xEAtre charg\xE9.": withDutchVariants({ de: "Der Katalog konnte nicht geladen werden.", en: "The catalogue could not be loaded.", it: "Impossibile caricare il catalogo.", es: "No se ha podido cargar el cat\xE1logo.", nl: "De catalogus kon niet worden geladen." }),
  "Impossible de charger la conjugaison de ce verbe.": withDutchVariants({ de: "Die Konjugation dieses Verbs konnte nicht geladen werden.", en: "This verb\u2019s conjugation could not be loaded.", it: "Impossibile caricare la coniugazione di questo verbo.", es: "No se ha podido cargar la conjugaci\xF3n de este verbo.", nl: "De vervoeging van dit werkwoord kon niet worden geladen." }),
  "Le participe pass\xE9 avec avoir": withDutchVariants({ de: "Das Partizip Perfekt mit avoir", en: "The past participle with avoir", it: "Il participio passato con avoir", es: "El participio pasado con avoir", nl: "Het voltooid deelwoord met avoir" }),
  "La place du COD change l\u2019accord": withDutchVariants({ de: "Die Position des direkten Objekts bestimmt die Angleichung", en: "The position of the direct object changes agreement", it: "La posizione del complemento oggetto cambia la concordanza", es: "La posici\xF3n del complemento directo cambia la concordancia", nl: "De plaats van het lijdend voorwerp bepaalt de overeenkomst" }),
  "Voir avec un COD": withDutchVariants({ de: "Mit direktem Objekt anzeigen", en: "View with a direct object", it: "Vedi con un complemento oggetto", es: "Ver con un complemento directo", nl: "Bekijken met een lijdend voorwerp" }),
  "Masquer le COD": withDutchVariants({ de: "Direktes Objekt ausblenden", en: "Hide direct object", it: "Nascondi il complemento oggetto", es: "Ocultar el complemento directo", nl: "Lijdend voorwerp verbergen" }),
  "Avec un COD": withDutchVariants({ de: "Mit direktem Objekt", en: "With a direct object", it: "Con un complemento oggetto", es: "Con un complemento directo", nl: "Met een lijdend voorwerp" }),
  "Exemple indisponible": withDutchVariants({ de: "Beispiel nicht verf\xFCgbar", en: "Example unavailable", it: "Esempio non disponibile", es: "Ejemplo no disponible", nl: "Voorbeeld niet beschikbaar" }),
  "Aucun exemple avec un COD n\u2019est disponible pour ce verbe.": withDutchVariants({ de: "F\xFCr dieses Verb ist kein Beispiel mit direktem Objekt verf\xFCgbar.", en: "No example with a direct object is available for this verb.", it: "Non \xE8 disponibile alcun esempio con complemento oggetto per questo verbo.", es: "No hay ning\xFAn ejemplo con complemento directo disponible para este verbo.", nl: "Er is geen voorbeeld met een lijdend voorwerp beschikbaar voor dit werkwoord." }),
  "Voir les pi\xE8ges": withDutchVariants({ de: "Stolperfallen anzeigen", en: "View pitfalls", it: "Vedi le difficolt\xE0", es: "Ver las dificultades", nl: "Valkuilen tonen" }),
  "Masquer les pi\xE8ges": withDutchVariants({ de: "Stolperfallen ausblenden", en: "Hide pitfalls", it: "Nascondi le difficolt\xE0", es: "Ocultar las dificultades", nl: "Valkuilen verbergen" }),
  "Exporter en PDF": withDutchVariants({ de: "Als PDF exportieren", en: "Export to PDF", it: "Esporta in PDF", es: "Exportar a PDF", nl: "Exporteren naar PDF" }),
  "Avec avoir, le participe pass\xE9 ne s\u2019accorde pas avec le COD plac\xE9 apr\xE8s.": withDutchVariants({ de: "Mit avoir wird das Partizip Perfekt nicht an ein nachgestelltes direktes Objekt angeglichen.", en: "With avoir, the past participle does not agree with a direct object placed after it.", it: "Con avoir, il participio passato non concorda con il complemento oggetto posto dopo.", es: "Con avoir, el participio pasado no concuerda con el complemento directo colocado despu\xE9s.", nl: "Met avoir komt het voltooid deelwoord niet overeen met een lijdend voorwerp dat erna staat." }),
  "COD \xAB {cod} \xBB plac\xE9 avant : accord avec le COD ({gender}, {number}).": withDutchVariants({ de: "Vorangestelltes direktes Objekt \u201E{cod}\u201C: Angleichung an das direkte Objekt ({gender}, {number}).", en: "Direct object \u201C{cod}\u201D placed before the verb: agreement with the direct object ({gender}, {number}).", it: "Complemento oggetto \xAB{cod}\xBB posto prima: concordanza con il complemento oggetto ({gender}, {number}).", es: "Complemento directo \xAB{cod}\xBB colocado antes: concordancia con el complemento directo ({gender}, {number}).", nl: "Lijdend voorwerp \u201C{cod}\u201D voor het werkwoord: overeenkomst met het lijdend voorwerp ({gender}, {number})." }),
  "Difficult\xE9s rep\xE9r\xE9es": withDutchVariants({ de: "Erkannte Schwierigkeiten", en: "Detected difficulties", it: "Difficolt\xE0 rilevate", es: "Dificultades detectadas", nl: "Vastgestelde moeilijkheden" }),
  "Consulter le verbe": withDutchVariants({ de: "Verb nachschlagen", en: "View the verb", it: "Consulta il verbo", es: "Consultar el verbo", nl: "Het werkwoord bekijken" }),
  "Conjugaison compl\xE8te": withDutchVariants({ de: "Vollst\xE4ndige Konjugation", en: "Full conjugation", it: "Coniugazione completa", es: "Conjugaci\xF3n completa", nl: "Volledige vervoeging" }),
  "Consulte toutes les formes du verbe {verb}.": withDutchVariants({ de: "Sieh dir alle Formen des Verbs {verb} an.", en: "View every form of the verb {verb}.", it: "Consulta tutte le forme del verbo {verb}.", es: "Consulta todas las formas del verbo {verb}.", nl: "Bekijk alle vormen van het werkwoord {verb}." }),
  "Tu veux consulter la conjugaison du verbe {verb} ?": withDutchVariants({ de: "M\xF6chtest du die Konjugation des Verbs {verb} nachschlagen?", en: "Would you like to view the conjugation of the verb {verb}?", it: "Vuoi consultare la coniugazione del verbo {verb}?", es: "\xBFQuieres consultar la conjugaci\xF3n del verbo {verb}?", nl: "Wil je de vervoeging van het werkwoord {verb} bekijken?" }),
  "Pi\xE8ges \xE0 surveiller pour \xAB {verb} \xBB": withDutchVariants({ de: "Stolperfallen bei \u201E{verb}\u201C", en: "Pitfalls to watch for with \u201C{verb}\u201D", it: "Difficolt\xE0 da osservare per \xAB{verb}\xBB", es: "Dificultades que debes vigilar con \xAB{verb}\xBB", nl: "Valkuilen bij \u201C{verb}\u201D" }),
  "Aucun pi\xE8ge particulier n\u2019a \xE9t\xE9 d\xE9tect\xE9 dans les formes de ce verbe.": withDutchVariants({ de: "In den Formen dieses Verbs wurde keine besondere Stolperfalle erkannt.", en: "No particular pitfall was detected in this verb\u2019s forms.", it: "Non \xE8 stata rilevata alcuna difficolt\xE0 particolare nelle forme di questo verbo.", es: "No se ha detectado ninguna dificultad particular en las formas de este verbo.", nl: "Er is geen bijzondere valkuil vastgesteld in de vormen van dit werkwoord." }),
  "C\xE9dille \xE0 ne pas oublier": withDutchVariants({ de: "Die Cedille nicht vergessen", en: "Do not forget the cedilla", it: "Non dimenticare la cediglia", es: "No olvides la cedilla", nl: "Vergeet de cedille niet" }),
  "Le \xE7 conserve le son [s] devant a, o ou u, ou appartient au radical de certaines formes.": withDutchVariants({ de: "Das \xE7 erh\xE4lt den Laut [s] vor a, o oder u oder geh\xF6rt in manchen Formen zum Stamm.", en: "The \xE7 preserves the [s] sound before a, o or u, or belongs to the stem in some forms.", it: "La \xE7 conserva il suono [s] davanti ad a, o o u, oppure appartiene alla radice di alcune forme.", es: "La \xE7 conserva el sonido [s] delante de a, o o u, o forma parte de la ra\xEDz en algunas formas.", nl: "De \xE7 behoudt de klank [s] voor a, o of u, of hoort bij sommige vormen bij de stam." }),
  "E protecteur apr\xE8s le g": withDutchVariants({ de: "Sch\xFCtzendes e nach g", en: "Protective e after g", it: "E protettiva dopo la g", es: "E protectora despu\xE9s de la g", nl: "Een e na de g om de klank te behouden" }),
  "Le e plac\xE9 apr\xE8s g conserve le son [\u0292] devant a ou o : mangeais, mangeons.": withDutchVariants({ de: "Das e nach g erh\xE4lt den Laut [\u0292] vor a oder o: mangeais, mangeons.", en: "The e after g preserves the [\u0292] sound before a or o: mangeais, mangeons.", it: "La e dopo g conserva il suono [\u0292] davanti ad a o o: mangeais, mangeons.", es: "La e despu\xE9s de g conserva el sonido [\u0292] delante de a u o: mangeais, mangeons.", nl: "De e na g behoudt de klank [\u0292] voor a of o: mangeais, mangeons." }),
  "Y remplac\xE9 par i": withDutchVariants({ de: "Y wird durch i ersetzt", en: "Y changes to i", it: "Y sostituita da i", es: "Y sustituida por i", nl: "Y verandert in i" }),
  "Dans certaines formes des verbes en -yer, le y du radical devient i.": withDutchVariants({ de: "In manchen Formen der Verben auf -yer wird das y des Stamms zu i.", en: "In some forms of -yer verbs, the y in the stem changes to i.", it: "In alcune forme dei verbi in -yer, la y della radice diventa i.", es: "En algunas formas de los verbos en -yer, la y de la ra\xEDz se convierte en i.", nl: "Bij sommige vormen van werkwoorden op -yer verandert de y van de stam in i." }),
  "Accent grave dans le radical": withDutchVariants({ de: "Gravis im Stamm", en: "Grave accent in the stem", it: "Accento grave nella radice", es: "Acento grave en la ra\xEDz", nl: "Accent grave in de stam" }),
  "Un e ou un \xE9 du radical devient \xE8 dans certaines formes.": withDutchVariants({ de: "Ein e oder \xE9 des Stamms wird in manchen Formen zu \xE8.", en: "An e or \xE9 in the stem changes to \xE8 in some forms.", it: "Una e o una \xE9 della radice diventa \xE8 in alcune forme.", es: "Una e o una \xE9 de la ra\xEDz se convierte en \xE8 en algunas formas.", nl: "Een e of \xE9 in de stam verandert bij sommige vormen in \xE8." }),
  "Certains verbes en -eler ou -eter doublent le l ou le t dans une partie de leur conjugaison.": withDutchVariants({ de: "Manche Verben auf -eler oder -eter verdoppeln in einem Teil ihrer Konjugation l oder t.", en: "Some -eler or -eter verbs double the l or t in part of their conjugation.", it: "Alcuni verbi in -eler o -eter raddoppiano la l o la t in parte della coniugazione.", es: "Algunos verbos en -eler o -eter duplican la l o la t en parte de su conjugaci\xF3n.", nl: "Sommige werkwoorden op -eler of -eter verdubbelen de l of t in een deel van hun vervoeging." }),
  "Deux i cons\xE9cutifs": withDutchVariants({ de: "Zwei aufeinanderfolgende i", en: "Two consecutive i letters", it: "Due i consecutive", es: "Dos \xEDes consecutivas", nl: "Twee opeenvolgende i\u2019s" }),
  "Le premier i appartient au radical et le second \xE0 la terminaison : les deux doivent \xEAtre \xE9crits.": withDutchVariants({ de: "Das erste i geh\xF6rt zum Stamm und das zweite zur Endung: Beide m\xFCssen geschrieben werden.", en: "The first i belongs to the stem and the second to the ending: both must be written.", it: "La prima i appartiene alla radice e la seconda alla desinenza: vanno scritte entrambe.", es: "La primera i pertenece a la ra\xEDz y la segunda a la terminaci\xF3n: hay que escribir ambas.", nl: "De eerste i hoort bij de stam en de tweede bij de uitgang: je moet ze allebei schrijven." }),
  "Accent circonflexe aux temps litt\xE9raires": withDutchVariants({ de: "Zirkumflex in literarischen Zeitformen", en: "Circumflex in literary tenses", it: "Accento circonflesso nei tempi letterari", es: "Acento circunflejo en los tiempos literarios", nl: "Circonflexe in literaire tijden" }),
  "Le pass\xE9 simple et le subjonctif imparfait comportent parfois un accent circonflexe facile \xE0 oublier.": withDutchVariants({ de: "Pass\xE9 simple und Subjonctif imparfait enthalten manchmal einen leicht zu vergessenden Zirkumflex.", en: "The past historic and imperfect subjunctive sometimes contain an easily forgotten circumflex.", it: "Il pass\xE9 simple e il congiuntivo imperfetto contengono talvolta un accento circonflesso facile da dimenticare.", es: "El pass\xE9 simple y el subjuntivo imperfecto llevan a veces un circunflejo f\xE1cil de olvidar.", nl: "De pass\xE9 simple en de subjonctif imparfait bevatten soms een circonflexe die je gemakkelijk vergeet." }),
  "Radical du futur \xE0 m\xE9moriser": withDutchVariants({ de: "Futurstamm zum Auswendiglernen", en: "Future stem to memorise", it: "Radice del futuro da memorizzare", es: "Ra\xEDz del futuro que debes memorizar", nl: "Stam van de futur om te onthouden" }),
  "Le futur simple et le conditionnel utilisent ici un radical diff\xE9rent de l\u2019infinitif attendu.": withDutchVariants({ de: "Futur simple und Conditionnel verwenden hier einen anderen Stamm als den vom Infinitiv erwarteten.", en: "The future and conditional use a stem here that differs from the expected infinitive.", it: "Il futuro e il condizionale usano qui una radice diversa da quella attesa dall\u2019infinito.", es: "El futuro y el condicional usan aqu\xED una ra\xEDz distinta de la esperada a partir del infinitivo.", nl: "De futur en de conditionnel gebruiken hier een stam die afwijkt van de verwachte infinitief." }),
  "Futur ou conditionnel ?": withDutchVariants({ de: "Futur oder Konditional?", en: "Future or conditional?", it: "Futuro o condizionale?", es: "\xBFFuturo o condicional?", nl: "Futur of conditionnel?" }),
  "Avec je, le futur se termine par -ai et le conditionnel par -ais.": withDutchVariants({ de: "Mit je endet das Futur auf -ai und das Konditional auf -ais.", en: "With je, the future ends in -ai and the conditional in -ais.", it: "Con je, il futuro termina in -ai e il condizionale in -ais.", es: "Con je, el futuro termina en -ai y el condicional en -ais.", nl: "Bij je eindigt de futur op -ai en de conditionnel op -ais." }),
  "Terminaison -ent muette": withDutchVariants({ de: "Stumme Endung -ent", en: "Silent -ent ending", it: "Desinenza -ent muta", es: "Terminaci\xF3n -ent muda", nl: "Onuitgesproken uitgang -ent" }),
  "\xC0 la troisi\xE8me personne du pluriel, -ent s\u2019\xE9crit mais ne se prononce g\xE9n\xE9ralement pas.": withDutchVariants({ de: "In der dritten Person Plural wird -ent geschrieben, aber meist nicht ausgesprochen.", en: "In the third person plural, -ent is written but is generally not pronounced.", it: "Alla terza persona plurale, -ent si scrive ma generalmente non si pronuncia.", es: "En la tercera persona del plural, -ent se escribe pero normalmente no se pronuncia.", nl: "In de derde persoon meervoud schrijf je -ent, maar spreek je die meestal niet uit." }),
  "Pas de s \xE0 l\u2019imp\xE9ratif": withDutchVariants({ de: "Kein s im Imperativ", en: "No s in the imperative", it: "Niente s all\u2019imperativo", es: "Sin s en el imperativo", nl: "Geen s in de gebiedende wijs" }),
  "\xC0 l\u2019imp\xE9ratif pr\xE9sent, les verbes en -er perdent normalement le s de la forme tu.": withDutchVariants({ de: "Im Imperativ Pr\xE4sens verlieren Verben auf -er normalerweise das s der tu-Form.", en: "In the present imperative, -er verbs normally drop the s from the tu form.", it: "All\u2019imperativo presente, i verbi in -er perdono normalmente la s della forma tu.", es: "En el imperativo presente, los verbos en -er normalmente pierden la s de la forma tu.", nl: "In de tegenwoordige gebiedende wijs verliezen werkwoorden op -er normaal de s van de tu-vorm." }),
  "Plusieurs formes admises": withDutchVariants({ de: "Mehrere zul\xE4ssige Formen", en: "Several accepted forms", it: "Pi\xF9 forme ammesse", es: "Varias formas admitidas", nl: "Meerdere aanvaarde vormen" }),
  "La base contient plusieurs variantes correctes pour cette personne et ce temps.": withDutchVariants({ de: "Die Datenbank enth\xE4lt f\xFCr diese Person und Zeitform mehrere korrekte Varianten.", en: "The database contains several correct variants for this person and tense.", it: "La banca dati contiene pi\xF9 varianti corrette per questa persona e questo tempo.", es: "La base de datos contiene varias variantes correctas para esta persona y este tiempo.", nl: "De databank bevat meerdere juiste varianten voor deze persoon en tijd." }),
  "Conjugaison incompl\xE8te": withDutchVariants({ de: "Unvollst\xE4ndige Konjugation", en: "Incomplete conjugation", it: "Coniugazione incompleta", es: "Conjugaci\xF3n incompleta", nl: "Onvolledige vervoeging" }),
  "Ce verbe est impersonnel ou d\xE9fectif : certaines personnes ou certains temps ne s\u2019emploient pas.": withDutchVariants({ de: "Dieses Verb ist unpers\xF6nlich oder defektiv: Manche Personen oder Zeitformen werden nicht verwendet.", en: "This verb is impersonal or defective: some persons or tenses are not used.", it: "Questo verbo \xE8 impersonale o difettivo: alcune persone o alcuni tempi non si usano.", es: "Este verbo es impersonal o defectivo: algunas personas o tiempos no se usan.", nl: "Dit werkwoord is onpersoonlijk of defectief: sommige personen of tijden worden niet gebruikt." }),
  "M\xE9thode de recherche du verbe": withDutchVariants({ de: "Methode der Verbsuche", en: "Verb search method", it: "Metodo di ricerca del verbo", es: "M\xE9todo de b\xFAsqueda del verbo", nl: "Zoekmethode voor werkwoorden" }),
  "Rechercher un verbe": withDutchVariants({ de: "Ein Verb suchen", en: "Search for a verb", it: "Cerca un verbo", es: "Buscar un verbo", nl: "Een werkwoord zoeken" }),
  "Liste de A \xE0 Z": withDutchVariants({ de: "Liste von A bis Z", en: "A\u2013Z list", it: "Elenco dalla A alla Z", es: "Lista de la A a la Z", nl: "Lijst A\u2013Z" }),
  "Recherche rapide": withDutchVariants({ de: "Schnellsuche", en: "Quick search", it: "Ricerca rapida", es: "B\xFAsqueda r\xE1pida", nl: "Snel zoeken" }),
  "Quel verbe cherches-tu ?": withDutchVariants({ de: "Welches Verb suchst du?", en: "Which verb are you looking for?", it: "Quale verbo cerchi?", es: "\xBFQu\xE9 verbo buscas?", nl: "Welk werkwoord zoek je?" }),
  "Commence \xE0 \xE9crire son infinitif, puis choisis-le dans les propositions.": withDutchVariants({ de: "Beginne den Infinitiv einzugeben und w\xE4hle ihn dann aus den Vorschl\xE4gen.", en: "Start typing its infinitive, then choose it from the suggestions.", it: "Inizia a scrivere l\u2019infinito, poi sceglilo tra i suggerimenti.", es: "Empieza a escribir el infinitivo y el\xEDgelo entre las sugerencias.", nl: "Begin de infinitief te typen en kies het werkwoord uit de suggesties." }),
  "Par exemple : venir": withDutchVariants({ de: "Zum Beispiel: venir", en: "For example: venir", it: "Per esempio: venir", es: "Por ejemplo: venir", nl: "Bijvoorbeeld: venir" }),
  "Catalogue complet": withDutchVariants({ de: "Vollst\xE4ndiger Katalog", en: "Full catalogue", it: "Catalogo completo", es: "Cat\xE1logo completo", nl: "Volledige catalogus" }),
  "Tous les verbes de A \xE0 Z": withDutchVariants({ de: "Alle Verben von A bis Z", en: "All verbs from A to Z", it: "Tutti i verbi dalla A alla Z", es: "Todos los verbos de la A a la Z", nl: "Alle werkwoorden van A tot Z" }),
  "Acc\xE8s aux lettres": withDutchVariants({ de: "Buchstabennavigation", en: "Letter navigation", it: "Navigazione per lettera", es: "Navegaci\xF3n por letras", nl: "Navigeren op letter" }),
  "Retour au choix du verbe": withDutchVariants({ de: "Zur\xFCck zur Verbauswahl", en: "Back to verb selection", it: "Torna alla scelta del verbo", es: "Volver a la selecci\xF3n del verbo", nl: "Terug naar de werkwoordselectie" }),
  "Retour au d\xE9fi": withDutchVariants({ de: "Zur\xFCck zur Aufgabe", en: "Back to the challenge", it: "Torna alla sfida", es: "Volver al reto", nl: "Terug naar de uitdaging" }),
  "Chargement de la conjugaison\u2026": withDutchVariants({ de: "Konjugation wird geladen\u2026", en: "Loading conjugation\u2026", it: "Caricamento della coniugazione\u2026", es: "Cargando conjugaci\xF3n\u2026", nl: "Vervoeging wordt geladen\u2026" }),
  "Retour \xE0 la liste": withDutchVariants({ de: "Zur\xFCck zur Liste", en: "Back to the list", it: "Torna all\u2019elenco", es: "Volver a la lista", nl: "Terug naar de lijst" }),
  "Conjugaison du verbe": withDutchVariants({ de: "Konjugation des Verbs", en: "Verb conjugation", it: "Coniugazione del verbo", es: "Conjugaci\xF3n del verbo", nl: "Vervoeging van het werkwoord" }),
  "Groupe": withDutchVariants({ de: "Gruppe", en: "Group", it: "Gruppo", es: "Grupo", nl: "Groep" }),
  "groupe irr\xE9gulier": withDutchVariants({ de: "unregelm\xE4\xDFige Gruppe", en: "irregular group", it: "gruppo irregolare", es: "grupo irregular", nl: "onregelmatige groep" }),
  "1er groupe": withDutchVariants({ de: "1. Gruppe", en: "1st group", it: "1\xBA gruppo", es: "1.er grupo", nl: "1e groep" }),
  "2e groupe": withDutchVariants({ de: "2. Gruppe", en: "2nd group", it: "2\xBA gruppo", es: "2.\xBA grupo", nl: "2e groep" }),
  "3e groupe": withDutchVariants({ de: "3. Gruppe", en: "3rd group", it: "3\xBA gruppo", es: "3.er grupo", nl: "3e groep" }),
  "Auxiliaire": withDutchVariants({ de: "Hilfsverb", en: "Auxiliary", it: "Ausiliare", es: "Auxiliar", nl: "Hulpwerkwoord" }),
  "Acc\xE8s aux modes": withDutchVariants({ de: "Navigation nach Modi", en: "Mood navigation", it: "Navigazione per modi", es: "Navegaci\xF3n por modos", nl: "Navigeren tussen wijzen" }),
  "Formes non personnelles": withDutchVariants({ de: "Unpers\xF6nliche Formen", en: "Non-finite forms", it: "Forme non personali", es: "Formas no personales", nl: "Onpersoonlijke vormen" }),
  "Profil": withDutchVariants({ de: "Profil", en: "Profile", it: "Profilo", es: "Perfil", nl: "Profiel" }),
  "Mon compte": withDutchVariants({ de: "Mein Konto", en: "My account", it: "Il mio account", es: "Mi cuenta", nl: "Mijn account" }),
  "Informations associ\xE9es \xE0 votre session administrateur.": withDutchVariants({ de: "Informationen zu Ihrer Administratorsitzung.", en: "Information associated with your administrator session.", it: "Informazioni associate alla sessione amministratore.", es: "Informaci\xF3n asociada a tu sesi\xF3n de administrador.", nl: "Informatie die bij je beheerderssessie hoort." }),
  "Administrateur": withDutchVariants({ de: "Administrator", en: "Administrator", it: "Amministratore", es: "Administrador", nl: "Beheerder" }),
  "Pr\xE9nom": withDutchVariants({ de: "Vorname", en: "First name", it: "Nome", es: "Nombre", nl: "Voornaam" }),
  "Nom": withDutchVariants({ de: "Nachname", en: "Last name", it: "Cognome", es: "Apellido", nl: "Achternaam" }),
  "Nom d\u2019utilisateur": withDutchVariants({ de: "Benutzername", en: "Username", it: "Nome utente", es: "Nombre de usuario", nl: "Gebruikersnaam" }),
  "Adresse e-mail": withDutchVariants({ de: "E-Mail-Adresse", en: "Email address", it: "Indirizzo e-mail", es: "Correo electr\xF3nico", nl: "E-mailadres" }),
  "Identifiant": withDutchVariants({ de: "Kennung", en: "Identifier", it: "Identificativo", es: "Identificador", nl: "Identificatiecode" }),
  "Niveau d\u2019acc\xE8s": withDutchVariants({ de: "Zugriffsebene", en: "Access level", it: "Livello di accesso", es: "Nivel de acceso", nl: "Toegangsniveau" }),
  "Modification du profil": withDutchVariants({ de: "Profil bearbeiten", en: "Edit profile", it: "Modifica del profilo", es: "Editar perfil", nl: "Profiel bewerken" }),
  "Alertes priv\xE9es": withDutchVariants({ de: "Private Benachrichtigungen", en: "Private alerts", it: "Avvisi privati", es: "Alertas privadas", nl: "Priv\xE9meldingen" }),
  "Notifications Tatitotu": withDutchVariants({ de: "Tatitotu-Benachrichtigungen", en: "Tatitotu notifications", it: "Notifiche Tatitotu", es: "Notificaciones de Tatitotu", nl: "Tatitotu-meldingen" }),
  "Recevez les paliers de comptes cr\xE9\xE9s et de sessions quotidiennes, m\xEAme lorsque le site n\u2019est pas ouvert.": withDutchVariants({ de: "Erhalten Sie Meldungen zu Meilensteinen bei erstellten Konten und t\xE4glichen Sitzungen, auch wenn die Website nicht ge\xF6ffnet ist.", en: "Receive milestones for created accounts and daily sessions, even when the site is not open.", it: "Ricevi gli avvisi sui traguardi degli account creati e delle sessioni giornaliere, anche quando il sito non \xE8 aperto.", es: "Recibe avisos de los hitos de cuentas creadas y sesiones diarias, incluso cuando el sitio no est\xE1 abierto.", nl: "Ontvang meldingen over mijlpalen voor aangemaakte accounts en dagelijkse sessies, ook wanneer de site niet openstaat." }),
  "Activation\u2026": withDutchVariants({ de: "Aktivierung\u2026", en: "Enabling\u2026", it: "Attivazione\u2026", es: "Activando\u2026", nl: "Wordt ingeschakeld\u2026" }),
  "Activer sur cet appareil": withDutchVariants({ de: "Auf diesem Ger\xE4t aktivieren", en: "Enable on this device", it: "Attiva su questo dispositivo", es: "Activar en este dispositivo", nl: "Inschakelen op dit toestel" }),
  "Activ\xE9es sur cet appareil": withDutchVariants({ de: "Auf diesem Ger\xE4t aktiviert", en: "Enabled on this device", it: "Attivate su questo dispositivo", es: "Activadas en este dispositivo", nl: "Ingeschakeld op dit toestel" }),
  "Envoyer un test": withDutchVariants({ de: "Test senden", en: "Send a test", it: "Invia un test", es: "Enviar una prueba", nl: "Een test versturen" }),
  "D\xE9sactiver": withDutchVariants({ de: "Deaktivieren", en: "Disable", it: "Disattiva", es: "Desactivar", nl: "Uitschakelen" }),
  "Ce navigateur ne prend pas en charge les notifications Web Push.": withDutchVariants({ de: "Dieser Browser unterst\xFCtzt keine Web-Push-Benachrichtigungen.", en: "This browser does not support Web Push notifications.", it: "Questo browser non supporta le notifiche Web Push.", es: "Este navegador no admite notificaciones Web Push.", nl: "Deze browser ondersteunt geen Web Push-meldingen." }),
  "Les notifications n\xE9cessitent une connexion HTTPS s\xE9curis\xE9e.": withDutchVariants({ de: "Benachrichtigungen ben\xF6tigen eine sichere HTTPS-Verbindung.", en: "Notifications require a secure HTTPS connection.", it: "Le notifiche richiedono una connessione HTTPS sicura.", es: "Las notificaciones requieren una conexi\xF3n HTTPS segura.", nl: "Voor meldingen is een beveiligde HTTPS-verbinding nodig." }),
  "Comptes cr\xE9\xE9s : 40, 50, 60, puis chaque dizaine.": withDutchVariants({ de: "Erstellte Konten: 40, 50, 60, dann alle zehn.", en: "Accounts created: 40, 50, 60, then every ten.", it: "Account creati: 40, 50, 60, poi ogni dieci.", es: "Cuentas creadas: 40, 50, 60 y despu\xE9s cada diez.", nl: "Aangemaakte accounts: 40, 50, 60 en daarna per tiental." }),
  "Chaque nouvelle inscription, avec le total de comptes cr\xE9\xE9s.": withDutchVariants({ de: "Jede neue Registrierung mit der Gesamtzahl der erstellten Konten.", en: "Every new registration, with the total number of accounts created.", it: "Ogni nuova registrazione, con il totale degli account creati.", es: "Cada nuevo registro, con el total de cuentas creadas.", nl: "Elke nieuwe registratie, met het totale aantal aangemaakte accounts." }),
  "Messages \xE0 recevoir sur cet appareil": withDutchVariants({ de: "Nachrichten auf diesem Ger\xE4t", en: "Messages to receive on this device", it: "Messaggi da ricevere su questo dispositivo", es: "Mensajes que recibir en este dispositivo", nl: "Berichten om op dit toestel te ontvangen" }),
  "Plus de 5 personnes actives simultan\xE9ment dans un pays hors de Suisse.": withDutchVariants({ de: "Mehr als 5 gleichzeitig aktive Personen in einem Land ausserhalb der Schweiz.", en: "More than 5 people active at the same time in a country outside Switzerland.", it: "Pi\xF9 di 5 persone attive contemporaneamente in un Paese diverso dalla Svizzera.", es: "M\xE1s de 5 personas activas al mismo tiempo en un pa\xEDs fuera de Suiza.", nl: "Meer dan 5 personen tegelijk actief in een land buiten Zwitserland." }),
  "Une personne utilise r\xE9ellement le mode FALC.": withDutchVariants({ de: "Eine Person verwendet den Modus Leichte Sprache tats\xE4chlich.", en: "Someone is actively using easy-read mode.", it: "Una persona utilizza realmente la modalit\xE0 di facile lettura.", es: "Una persona est\xE1 utilizando realmente el modo de lectura f\xE1cil.", nl: "Iemand gebruikt actief de eenvoudige leesmodus." }),
  "Sessions quotidiennes : 1 000, 1 500, puis chaque centaine.": withDutchVariants({ de: "T\xE4gliche Sitzungen: 1.000, 1.500, dann alle hundert.", en: "Daily sessions: 1,000, 1,500, then every hundred.", it: "Sessioni giornaliere: 1.000, 1.500, poi ogni cento.", es: "Sesiones diarias: 1000, 1500 y despu\xE9s cada cien.", nl: "Dagelijkse sessies: 1.000, 1.500 en daarna per honderdtal." }),
  "Cette version permet de consulter le compte. Aucune API de modification du profil ou du mot de passe n\u2019est disponible.": withDutchVariants({ de: "In dieser Version kann das Konto eingesehen werden. Eine Schnittstelle zum \xC4ndern des Profils oder Passworts ist nicht verf\xFCgbar.", en: "This version lets you view the account. No API is available for changing the profile or password.", it: "Questa versione permette di consultare l\u2019account. Non \xE8 disponibile un\u2019API per modificare il profilo o la password.", es: "Esta versi\xF3n permite consultar la cuenta. No hay disponible una API para modificar el perfil o la contrase\xF1a.", nl: "In deze versie kun je het account bekijken. Er is geen API beschikbaar om het profiel of wachtwoord te wijzigen." }),
  "Ton d\xE9fi est pr\xEAt": withDutchVariants({ de: "Deine \xDCbung ist bereit", en: "Your challenge is ready", it: "Il tuo esercizio \xE8 pronto", es: "Tu ejercicio est\xE1 listo", nl: "Je uitdaging is klaar" }),
  "Comment veux-tu l\u2019utiliser ?": withDutchVariants({ de: "Wie m\xF6chtest du sie verwenden?", en: "How would you like to use it?", it: "Come vuoi usarlo?", es: "\xBFC\xF3mo quieres utilizarlo?", nl: "Hoe wil je ze gebruiken?" }),
  "Lancer le d\xE9fi": withDutchVariants({ de: "\xDCbung starten", en: "Start the challenge", it: "Avvia l\u2019esercizio", es: "Iniciar el ejercicio", nl: "Start de uitdaging" }),
  "Questions et correction imm\xE9diate": withDutchVariants({ de: "Fragen mit sofortiger Korrektur", en: "Questions with instant feedback", it: "Domande e correzione immediata", es: "Preguntas y correcci\xF3n inmediata", nl: "Vragen met onmiddellijke feedback" }),
  "Dialogue virtuel avec une aide pas \xE0 pas": withDutchVariants({ de: "Virtueller Dialog mit schrittweiser Hilfe", en: "Virtual dialogue with step-by-step help", it: "Dialogo virtuale con aiuto passo passo", es: "Di\xE1logo virtual con ayuda paso a paso", nl: "Virtueel gesprek met stapsgewijze hulp" }),
  "Les questions et le corrig\xE9": withDutchVariants({ de: "Fragen und L\xF6sungen", en: "Questions and answer key", it: "Domande e soluzioni", es: "Preguntas y soluciones", nl: "Vragen en oplossingen" }),
  "Partager ce d\xE9fi avec d\u2019autres personnes": withDutchVariants({ de: "Diese \xDCbung mit anderen teilen", en: "Share this challenge with others", it: "Condividi questo esercizio con altre persone", es: "Compartir este ejercicio con otras personas", nl: "Deel deze uitdaging met anderen" }),
  "Mes options": withDutchVariants({ de: "Meine Optionen", en: "My options", it: "Le mie opzioni", es: "Mis opciones", nl: "Mijn opties" }),
  "Aide audio": withDutchVariants({ de: "Audiohilfe", en: "Audio support", it: "Aiuto audio", es: "Ayuda de audio", nl: "Audio-ondersteuning" }),
  "Normal": withDutchVariants({ de: "Normal", en: "Normal", it: "Normale", es: "Normal", nl: "Normaal" }),
  "CIF / FLE": withDutchVariants({ de: "CIF / FLE", en: "CIF / FLE", it: "CIF / FLE", es: "CIF / FLE", nl: "CIF / FLE" }),
  "Aide \xE0 l\u2019\xE9coute pour les personnes allophones.": withDutchVariants({ de: "H\xF6rhilfe f\xFCr fremdsprachige Lernende.", en: "Listening support for learners of French.", it: "Aiuto all\u2019ascolto per persone allofone.", es: "Ayuda auditiva para personas al\xF3fonas.", nl: "Luisterondersteuning voor wie Frans leert." }),
  "Nombre de questions": withDutchVariants({ de: "Anzahl der Fragen", en: "Number of questions", it: "Numero di domande", es: "N\xFAmero de preguntas", nl: "Aantal vragen" }),
  "Pronoms": withDutchVariants({ de: "Pronomen", en: "Pronouns", it: "Pronomi", es: "Pronombres", nl: "Voornaamwoorden" }),
  "Inclure les pronoms": withDutchVariants({ de: "Pronomen einbeziehen", en: "Include pronouns", it: "Includi i pronomi", es: "Incluir pronombres", nl: "Voornaamwoorden opnemen" }),
  "Voix du verbe": withDutchVariants({ de: "Verbform", en: "Verb voice", it: "Voce del verbo", es: "Voz del verbo", nl: "Actieve of passieve vorm" }),
  "Active uniquement": withDutchVariants({ de: "Nur Aktiv", en: "Active only", it: "Solo attiva", es: "Solo activa", nl: "Alleen actief" }),
  "Passive uniquement": withDutchVariants({ de: "Nur Passiv", en: "Passive only", it: "Solo passiva", es: "Solo pasiva", nl: "Alleen passief" }),
  "Active et passive": withDutchVariants({ de: "Aktiv und Passiv", en: "Active and passive", it: "Attiva e passiva", es: "Activa y pasiva", nl: "Actief en passief" }),
  "Le COD devient le sujet de la phrase.": withDutchVariants({ de: "Das direkte Objekt wird zum Subjekt des Satzes.", en: "The direct object becomes the subject of the sentence.", it: "Il complemento oggetto diventa il soggetto della frase.", es: "El complemento directo se convierte en el sujeto de la oraci\xF3n.", nl: "Het lijdend voorwerp wordt het onderwerp van de zin." }),
  "Les deux voix alterneront dans le d\xE9fi.": withDutchVariants({ de: "Beide Formen wechseln sich in der \xDCbung ab.", en: "Both voices will alternate in the challenge.", it: "Le due voci si alterneranno nella sfida.", es: "Las dos voces se alternar\xE1n en el reto.", nl: "Beide vormen wisselen elkaar af in de uitdaging." }),
  "Aucun verbe s\xE9lectionn\xE9 ne poss\xE8de de COD valid\xE9.": withDutchVariants({ de: "Keines der ausgew\xE4hlten Verben hat ein validiertes direktes Objekt.", en: "None of the selected verbs has a validated direct object.", it: "Nessun verbo selezionato ha un complemento oggetto convalidato.", es: "Ning\xFAn verbo seleccionado tiene un complemento directo validado.", nl: "Geen van de geselecteerde werkwoorden heeft een gecontroleerd lijdend voorwerp." }),
  "Ils appara\xEEtront ponctuellement dans les questions.": withDutchVariants({ de: "Sie erscheinen gelegentlich in den Fragen.", en: "They will occasionally appear in questions.", it: "Appariranno occasionalmente nelle domande.", es: "Aparecer\xE1n ocasionalmente en las preguntas.", nl: "Ze komen af en toe voor in de vragen." }),
  "Inclure le pronom": withDutchVariants({ de: "Pronomen einbeziehen", en: "Include the pronoun", it: "Includi il pronome", es: "Incluir el pronombre", nl: "Het voornaamwoord opnemen" }),
  "Il appara\xEEtra ponctuellement dans les questions \xE0 la troisi\xE8me personne du singulier.": withDutchVariants({ de: "Es erscheint gelegentlich in Fragen in der dritten Person Singular.", en: "It will occasionally appear in third-person singular questions.", it: "Apparir\xE0 occasionalmente nelle domande alla terza persona singolare.", es: "Aparecer\xE1 ocasionalmente en preguntas en tercera persona del singular.", nl: "Het komt af en toe voor in vragen in de derde persoon enkelvoud." }),
  "Type d\u2019exercice": withDutchVariants({ de: "\xDCbungstyp", en: "Exercise type", it: "Tipo di esercizio", es: "Tipo de ejercicio", nl: "Soort oefening" }),
  "Choix des verbes": withDutchVariants({ de: "Auswahl der Verben", en: "Verb selection", it: "Scelta dei verbi", es: "Selecci\xF3n de verbos", nl: "Werkwoordselectie" }),
  "Conjuguer": withDutchVariants({ de: "Konjugieren", en: "Conjugate", it: "Coniugare", es: "Conjugar", nl: "Vervoegen" }),
  "Conjuguer les formes demand\xE9es": withDutchVariants({ de: "Die verlangten Formen konjugieren", en: "Conjugate the requested forms", it: "Coniugare le forme richieste", es: "Conjugar las formas solicitadas", nl: "Vervoeg de gevraagde vormen" }),
  "avec compl\xE9ments,": withDutchVariants({ de: "mit Erg\xE4nzungen,", en: "with complements,", it: "con complementi,", es: "con complementos,", nl: "met aanvullingen," }),
  "Trouver le mode et le temps": withDutchVariants({ de: "Modus und Zeitform bestimmen", en: "Identify the mood and tense", it: "Trovare il modo e il tempo", es: "Identificar el modo y el tiempo", nl: "De wijs en tijd herkennen" }),
  "Trouver le mode et les temps": withDutchVariants({ de: "Modus und Zeitformen bestimmen", en: "Identify the mood and tenses", it: "Trovare il modo e i tempi", es: "Identificar el modo y los tiempos", nl: "De wijs en tijden herkennen" }),
  "Avec mes verbes": withDutchVariants({ de: "Mit meinen Verben", en: "With my verbs", it: "Con i miei verbi", es: "Con mis verbos", nl: "Met mijn werkwoorden" }),
  "Formes conjugu\xE9es simples, sans citation.": withDutchVariants({ de: "Einfache konjugierte Formen, ohne Zitat.", en: "Simple conjugated forms, without quotations.", it: "Forme coniugate semplici, senza citazioni.", es: "Formas conjugadas simples, sin citas.", nl: "Eenvoudige vervoegde vormen, zonder citaten." }),
  "Avec n\u2019importe quel verbe": withDutchVariants({ de: "Mit beliebigen Verben", en: "With any verb", it: "Con qualsiasi verbo", es: "Con cualquier verbo", nl: "Met elk mogelijk werkwoord" }),
  "Construits avec des phrases litt\xE9raires.": withDutchVariants({ de: "Mit literarischen S\xE4tzen erstellt.", en: "Built from literary sentences.", it: "Costruiti con frasi letterarie.", es: "Construidos con frases literarias.", nl: "Opgebouwd uit literaire zinnen." }),
  "Disponible uniquement pour un exercice de conjugaison.": withDutchVariants({ de: "Nur f\xFCr Konjugations\xFCbungen verf\xFCgbar.", en: "Available only for conjugation exercises.", it: "Disponibile solo per gli esercizi di coniugazione.", es: "Disponible solo para los ejercicios de conjugaci\xF3n.", nl: "Alleen beschikbaar voor vervoegingsoefeningen." }),
  "Au passif, le COD devient le sujet : ces options ne s\u2019appliquent pas.": withDutchVariants({ de: "Im Passiv wird das direkte Objekt zum Subjekt: Diese Optionen gelten hier nicht.", en: "In the passive voice, the direct object becomes the subject, so these options do not apply.", it: "Nella forma passiva, il complemento oggetto diventa il soggetto: queste opzioni non si applicano.", es: "En la voz pasiva, el complemento directo se convierte en sujeto: estas opciones no se aplican.", nl: "In de passieve vorm wordt het lijdend voorwerp het onderwerp. Deze opties zijn dus niet van toepassing." }),
  "Les verbes choisis ne proposent pas de compl\xE9ment.": withDutchVariants({ de: "F\xFCr die ausgew\xE4hlten Verben sind keine Objekterg\xE4nzungen verf\xFCgbar.", en: "The selected verbs do not provide any object complements.", it: "I verbi selezionati non prevedono complementi oggetto.", es: "Los verbos seleccionados no incluyen complementos de objeto.", nl: "De geselecteerde werkwoorden hebben geen voorwerpen beschikbaar." }),
  "Compl\xE9ments d\u2019objets :": withDutchVariants({ de: "Objekterg\xE4nzungen:", en: "Object complements:", it: "Complementi oggetto:", es: "Complementos de objeto:", nl: "Voorwerpen:" }),
  "Ajoute des compl\xE9ments d\u2019objets directs ou indirects.": withDutchVariants({ de: "F\xFCge direkte oder indirekte Objekte hinzu.", en: "Add direct or indirect object complements.", it: "Aggiungi complementi oggetto diretti o indiretti.", es: "A\xF1ade complementos de objeto directos o indirectos.", nl: "Voeg lijdende of meewerkende voorwerpen toe." }),
  "nouveau": withDutchVariants({ de: "neu", en: "new", it: "nuovo", es: "nuevo", nl: "nieuw" }),
  "Pr\xE9sentation des compl\xE9ments d\u2019objets": withDutchVariants({ de: "Position der Objekterg\xE4nzungen", en: "Object complement placement", it: "Posizione dei complementi oggetto", es: "Posici\xF3n de los complementos de objeto", nl: "Plaats van het voorwerp" }),
  "toujours apr\xE8s": withDutchVariants({ de: "immer danach", en: "always after", it: "sempre dopo", es: "siempre despu\xE9s", nl: "altijd erna" }),
  "parfois avant": withDutchVariants({ de: "manchmal davor", en: "sometimes before", it: "a volte prima", es: "a veces antes", nl: "soms ervoor" }),
  "avant si possible": withDutchVariants({ de: "wenn m\xF6glich davor", en: "before when possible", it: "prima se possibile", es: "antes si es posible", nl: "ervoor wanneer mogelijk" }),
  "COD plac\xE9 apr\xE8s": withDutchVariants({ de: "Direktes Objekt danach", en: "Direct object after", it: "Oggetto diretto dopo", es: "Objeto directo despu\xE9s", nl: "Lijdend voorwerp erna" }),
  "COD plac\xE9 avant": withDutchVariants({ de: "Direktes Objekt davor", en: "Direct object before", it: "Oggetto diretto prima", es: "Objeto directo antes", nl: "Lijdend voorwerp ervoor" }),
  "COI plac\xE9 apr\xE8s": withDutchVariants({ de: "Indirektes Objekt danach", en: "Indirect object after", it: "Oggetto indiretto dopo", es: "Objeto indirecto despu\xE9s", nl: "Meewerkend voorwerp erna" }),
  "COI plac\xE9 avant": withDutchVariants({ de: "Indirektes Objekt davor", en: "Indirect object before", it: "Oggetto indiretto prima", es: "Objeto indirecto antes", nl: "Meewerkend voorwerp ervoor" }),
  "COD (CVD) plac\xE9 apr\xE8s": withDutchVariants({ de: "Direktes Objekt danach", en: "Direct object after", it: "Oggetto diretto dopo", es: "Objeto directo despu\xE9s", nl: "Lijdend voorwerp erna" }),
  "COD (CVD) plac\xE9 avant": withDutchVariants({ de: "Direktes Objekt davor", en: "Direct object before", it: "Oggetto diretto prima", es: "Objeto directo antes", nl: "Lijdend voorwerp ervoor" }),
  "COI (CVI) plac\xE9 apr\xE8s": withDutchVariants({ de: "Indirektes Objekt danach", en: "Indirect object after", it: "Oggetto indiretto dopo", es: "Objeto indirecto despu\xE9s", nl: "Meewerkend voorwerp erna" }),
  "COI (CVI) plac\xE9 avant": withDutchVariants({ de: "Indirektes Objekt davor", en: "Indirect object before", it: "Oggetto indiretto prima", es: "Objeto indirecto antes", nl: "Meewerkend voorwerp ervoor" }),
  "Ajoute des COD (CVD) ou des COI (CVI).": withDutchVariants({ de: "F\xFCge direkte oder indirekte Objekte hinzu.", en: "Add direct or indirect objects.", it: "Aggiungi complementi oggetto diretti o indiretti.", es: "A\xF1ade complementos directos o indirectos.", nl: "Voeg lijdende of meewerkende voorwerpen toe." }),
  "Aucun verbe choisi ne poss\xE8de de COD (CVD) valid\xE9.": withDutchVariants({ de: "Kein gew\xE4hltes Verb hat ein validiertes direktes Objekt.", en: "None of the chosen verbs has a validated direct object.", it: "Nessun verbo scelto possiede un complemento oggetto diretto convalidato.", es: "Ning\xFAn verbo elegido tiene un complemento directo validado.", nl: "Geen van de gekozen werkwoorden heeft een gecontroleerd lijdend voorwerp." }),
  "Aucun COD (CVD) valid\xE9 ne peut \xEAtre plac\xE9 avant avec les verbes choisis.": withDutchVariants({ de: "Bei den gew\xE4hlten Verben kann kein validiertes direktes Objekt vorangestellt werden.", en: "No validated direct object can be placed before the chosen verbs.", it: "Nessun complemento oggetto diretto convalidato pu\xF2 essere posto prima con i verbi scelti.", es: "Ning\xFAn complemento directo validado puede colocarse antes con los verbos elegidos.", nl: "Er kan geen gecontroleerd lijdend voorwerp voor de gekozen werkwoorden worden geplaatst." }),
  "Aucun verbe choisi ne poss\xE8de de COI (CVI) valid\xE9.": withDutchVariants({ de: "Kein gew\xE4hltes Verb hat ein validiertes indirektes Objekt.", en: "None of the chosen verbs has a validated indirect object.", it: "Nessun verbo scelto possiede un complemento indiretto convalidato.", es: "Ning\xFAn verbo elegido tiene un complemento indirecto validado.", nl: "Geen van de gekozen werkwoorden heeft een gecontroleerd meewerkend voorwerp." }),
  "Aucun COI (CVI) valid\xE9 ne peut \xEAtre plac\xE9 avant avec les verbes choisis.": withDutchVariants({ de: "Bei den gew\xE4hlten Verben kann kein validiertes indirektes Objekt vorangestellt werden.", en: "No validated indirect object can be placed before the chosen verbs.", it: "Nessun complemento indiretto convalidato pu\xF2 essere posto prima con i verbi scelti.", es: "Ning\xFAn complemento indirecto validado puede colocarse antes con los verbos elegidos.", nl: "Er kan geen gecontroleerd meewerkend voorwerp voor de gekozen werkwoorden worden geplaatst." }),
  "Aper\xE7u d\u2019une question": withDutchVariants({ de: "Vorschau einer Frage", en: "Question preview", it: "Anteprima di una domanda", es: "Vista previa de una pregunta", nl: "Voorbeeldvraag" }),
  "Pr\xE9paration de l\u2019aper\xE7u": withDutchVariants({ de: "Vorschau wird vorbereitet", en: "Preparing preview", it: "Preparazione dell\u2019anteprima", es: "Preparando vista previa", nl: "Voorbeeld wordt voorbereid" }),
  "Exemple de question": withDutchVariants({ de: "Beispielfrage", en: "Sample question", it: "Esempio di domanda", es: "Ejemplo de pregunta", nl: "Voorbeeldvraag" }),
  "R\xE9ponse attendue": withDutchVariants({ de: "Erwartete Antwort", en: "Expected answer", it: "Risposta attesa", es: "Respuesta esperada", nl: "Verwacht antwoord" }),
  "Gratuit \xB7 sans publicit\xE9 \xB7 personnalisable": withDutchVariants({ de: "Kostenlos \xB7 werbefrei \xB7 anpassbar", en: "Free \xB7 ad-free \xB7 customisable", it: "Gratuito \xB7 senza pubblicit\xE0 \xB7 personalizzabile", es: "Gratis \xB7 sin publicidad \xB7 personalizable", nl: "Gratis \xB7 zonder reclame \xB7 aanpasbaar" }),
  "Cr\xE9e ton d\xE9fi de conjugaison": withDutchVariants({ de: "Erstelle deine Konjugations\xFCbung", en: "Create your conjugation challenge", it: "Crea il tuo esercizio di coniugazione", es: "Crea tu ejercicio de conjugaci\xF3n", nl: "Maak je vervoegingsuitdaging" }),
  "Choisis les verbes et les temps \xE0 travailler, puis exerce-toi en ligne ou imprime une fiche avec son corrig\xE9.": withDutchVariants({ de: "W\xE4hle die Verben und Zeitformen aus und \xFCbe online oder drucke ein Arbeitsblatt mit L\xF6sungen.", en: "Choose the verbs and tenses to practise, then work online or print a worksheet with its answer key.", it: "Scegli i verbi e i tempi da esercitare, poi allenati online o stampa una scheda con le soluzioni.", es: "Elige los verbos y tiempos que quieras practicar y trabaja en l\xEDnea o imprime una ficha con soluciones.", nl: "Kies de werkwoorden en tijden die je wilt oefenen. Werk daarna online of druk een werkblad met oplossingen af." }),
  "Chargement du catalogue de conjugaison\u2026": withDutchVariants({ de: "Konjugationskatalog wird geladen\u2026", en: "Loading conjugation catalogue\u2026", it: "Caricamento del catalogo di coniugazione\u2026", es: "Cargando cat\xE1logo de conjugaci\xF3n\u2026", nl: "Vervoegingscatalogus wordt geladen\u2026" }),
  "Pr\xE9paration de la s\xE9ance\u2026": withDutchVariants({ de: "\xDCbung wird vorbereitet\u2026", en: "Preparing the session\u2026", it: "Preparazione della sessione\u2026", es: "Preparando la sesi\xF3n\u2026", nl: "Sessie wordt voorbereid\u2026" }),
  "Tu as re\xE7u ou enregistr\xE9 un d\xE9fi ?": withDutchVariants({ de: "Hast du eine \xDCbung erhalten oder gespeichert?", en: "Have you received or saved a challenge?", it: "Hai ricevuto o salvato un esercizio?", es: "\xBFHas recibido o guardado un ejercicio?", nl: "Heb je een uitdaging ontvangen of bewaard?" }),
  "Charger un d\xE9fi avec son code": withDutchVariants({ de: "\xDCbung mit Code laden", en: "Load a challenge using its code", it: "Carica un esercizio con il codice", es: "Cargar un ejercicio con su c\xF3digo", nl: "Laad een uitdaging met de code" }),
  "R\xE9sum\xE9 de ton d\xE9fi": withDutchVariants({ de: "Zusammenfassung deiner \xDCbung", en: "Challenge summary", it: "Riepilogo del tuo esercizio", es: "Resumen de tu ejercicio", nl: "Overzicht van de uitdaging" }),
  "Ton d\xE9fi n\u2019est pas encore complet": withDutchVariants({ de: "Deine \xDCbung ist noch nicht vollst\xE4ndig", en: "Your challenge is not complete yet", it: "Il tuo esercizio non \xE8 ancora completo", es: "Tu ejercicio a\xFAn no est\xE1 completo", nl: "Je uitdaging is nog niet volledig" }),
  "Aucune question ne correspond \xE0 cette s\xE9lection.": withDutchVariants({ de: "F\xFCr diese Auswahl gibt es keine passende Frage.", en: "No questions match this selection.", it: "Nessuna domanda corrisponde a questa selezione.", es: "Ninguna pregunta corresponde a esta selecci\xF3n.", nl: "Er passen geen vragen bij deze selectie." }),
  "Impossible de pr\xE9parer le questionnaire.": withDutchVariants({ de: "Der Fragebogen konnte nicht vorbereitet werden.", en: "The questionnaire could not be prepared.", it: "Impossibile preparare il questionario.", es: "No se ha podido preparar el cuestionario.", nl: "De vragenlijst kon niet worden voorbereid." }),
  "Aucune nouvelle question ne correspond \xE0 cette s\xE9lection.": withDutchVariants({ de: "F\xFCr diese Auswahl gibt es keine neue passende Frage.", en: "No new questions match this selection.", it: "Nessuna nuova domanda corrisponde a questa selezione.", es: "Ninguna pregunta nueva corresponde a esta selecci\xF3n.", nl: "Er passen geen nieuwe vragen bij deze selectie." }),
  "Impossible de pr\xE9parer la fiche \xE0 imprimer.": withDutchVariants({ de: "Das Arbeitsblatt konnte nicht zum Drucken vorbereitet werden.", en: "The printable worksheet could not be prepared.", it: "Impossibile preparare la scheda da stampare.", es: "No se ha podido preparar la ficha para imprimir.", nl: "Het afdrukbare werkblad kon niet worden voorbereid." }),
  "Impossible de sauvegarder ce d\xE9fi.": withDutchVariants({ de: "Diese \xDCbung konnte nicht gespeichert werden.", en: "This challenge could not be saved.", it: "Impossibile salvare questo esercizio.", es: "No se ha podido guardar este ejercicio.", nl: "Deze uitdaging kon niet worden opgeslagen." }),
  "Ce code ne correspond \xE0 aucun d\xE9fi.": withDutchVariants({ de: "Dieser Code geh\xF6rt zu keiner \xDCbung.", en: "This code does not match any challenge.", it: "Questo codice non corrisponde ad alcun esercizio.", es: "Este c\xF3digo no corresponde a ning\xFAn ejercicio.", nl: "Deze code hoort niet bij een uitdaging." }),
  "S\xE9lectionne au moins un verbe et un temps pour pouvoir le lancer.": withDutchVariants({ de: "W\xE4hle mindestens ein Verb und eine Zeitform aus, um zu beginnen.", en: "Select at least one verb and one tense to start it.", it: "Seleziona almeno un verbo e un tempo per iniziare.", es: "Selecciona al menos un verbo y un tiempo para empezar.", nl: "Selecteer minstens \xE9\xE9n werkwoord en \xE9\xE9n tijd om te beginnen." }),
  "D\xE9fi enregistr\xE9": withDutchVariants({ de: "\xDCbung gespeichert", en: "Challenge saved", it: "Esercizio salvato", es: "Ejercicio guardado", nl: "Uitdaging opgeslagen" }),
  "Charger un d\xE9fi": withDutchVariants({ de: "\xDCbung laden", en: "Load a challenge", it: "Carica un esercizio", es: "Cargar un ejercicio", nl: "Een uitdaging laden" }),
  "Saisissez ou collez le code re\xE7u. Les tirets sont ajout\xE9s automatiquement.": withDutchVariants({ de: "Gib den erhaltenen Code ein. Bindestriche werden automatisch erg\xE4nzt.", en: "Enter or paste the code you received. Hyphens are added automatically.", it: "Inserisci o incolla il codice ricevuto. I trattini vengono aggiunti automaticamente.", es: "Escribe o pega el c\xF3digo recibido. Los guiones se a\xF1aden autom\xE1ticamente.", nl: "Typ of plak de ontvangen code. De koppeltekens worden automatisch toegevoegd." }),
  "Code \xE0 8 caract\xE8res": withDutchVariants({ de: "8-stelliger Code", en: "8-character code", it: "Codice di 8 caratteri", es: "C\xF3digo de 8 caracteres", nl: "Code van 8 tekens" }),
  "Le code doit ressembler \xE0 AB-CD-EF-23.": withDutchVariants({ de: "Der Code muss dem Muster AB-CD-EF-23 entsprechen.", en: "The code should look like AB-CD-EF-23.", it: "Il codice deve essere simile a AB-CD-EF-23.", es: "El c\xF3digo debe tener el formato AB-CD-EF-23.", nl: "De code moet eruitzien als AB-CD-EF-23." }),
  "Cat\xE9gories": withDutchVariants({ de: "Kategorien", en: "Categories", it: "Categorie", es: "Categor\xEDas", nl: "Categorie\xEBn" }),
  "autres verbes": withDutchVariants({ de: "weitere Verben", en: "other verbs", it: "altri verbi", es: "otros verbos", nl: "andere werkwoorden" }),
  "Choisir le nombre de verbes": withDutchVariants({ de: "Anzahl der Verben w\xE4hlen", en: "Choose the number of verbs", it: "Scegli il numero di verbi", es: "Elegir el n\xFAmero de verbos", nl: "Kies het aantal werkwoorden" }),
  "Choisissez un niveau ou une famille de verbes, puis ajustez librement la s\xE9lection.": withDutchVariants({ de: "W\xE4hle eine Stufe oder Verbfamilie und passe die Auswahl anschlie\xDFend frei an.", en: "Choose a level or verb family, then adjust the selection as you wish.", it: "Scegli un livello o una famiglia di verbi, poi modifica liberamente la selezione.", es: "Elige un nivel o una familia de verbos y ajusta libremente la selecci\xF3n.", nl: "Kies een niveau of werkwoordfamilie en pas de selectie aan zoals je wilt." }),
  "Choisir un niveau ou un entra\xEEnement\u2026": withDutchVariants({ de: "Stufe oder Training w\xE4hlen\u2026", en: "Choose a level or practice set\u2026", it: "Scegli un livello o un allenamento\u2026", es: "Elegir un nivel o una pr\xE1ctica\u2026", nl: "Kies een niveau of oefenreeks\u2026" }),
  "Cat\xE9gories de d\xE9fis": withDutchVariants({ de: "\xDCbungskategorien", en: "Challenge categories", it: "Categorie di esercizi", es: "Categor\xEDas de ejercicios", nl: "Categorie\xEBn van uitdagingen" }),
  "Verbes": withDutchVariants({ de: "Verben", en: "Verbs", it: "Verbi", es: "Verbos", nl: "Werkwoorden" }),
  "verbe": withDutchVariants({ de: "Verb", en: "verb", it: "verbo", es: "verbo", nl: "werkwoord" }),
  "verbes": withDutchVariants({ de: "Verben", en: "verbs", it: "verbi", es: "verbos", nl: "werkwoorden" }),
  "s\xE9lectionn\xE9": withDutchVariants({ de: "ausgew\xE4hlt", en: "selected", it: "selezionato", es: "seleccionado", nl: "geselecteerd" }),
  "s\xE9lectionn\xE9s": withDutchVariants({ de: "ausgew\xE4hlt", en: "selected", it: "selezionati", es: "seleccionados", nl: "geselecteerd" }),
  "temps": withDutchVariants({ de: "Zeitformen", en: "tenses", it: "tempi", es: "tiempos", nl: "tijden" }),
  "question": withDutchVariants({ de: "Frage", en: "question", it: "domanda", es: "pregunta", nl: "vraag" }),
  "questions": withDutchVariants({ de: "Fragen", en: "questions", it: "domande", es: "preguntas", nl: "vragen" }),
  "r\xE9ponse juste": withDutchVariants({ de: "richtige Antwort", en: "correct answer", it: "risposta corretta", es: "respuesta correcta", nl: "juist antwoord" }),
  "r\xE9ponses justes": withDutchVariants({ de: "richtige Antworten", en: "correct answers", it: "risposte corrette", es: "respuestas correctas", nl: "juiste antwoorden" }),
  "Temps": withDutchVariants({ de: "Zeitformen", en: "Tenses", it: "Tempi", es: "Tiempos", nl: "Tijden" }),
  "Tous les verbes": withDutchVariants({ de: "Alle Verben", en: "All verbs", it: "Tutti i verbi", es: "Todos los verbos", nl: "Alle werkwoorden" }),
  "Tous au hasard": withDutchVariants({ de: "Alle zuf\xE4llig", en: "All at random", it: "Tutti a caso", es: "Todos al azar", nl: "Allemaal willekeurig" }),
  "1 au hasard": withDutchVariants({ de: "1 zuf\xE4llig", en: "1 at random", it: "1 a caso", es: "1 al azar", nl: "1 willekeurig" }),
  "2 au hasard": withDutchVariants({ de: "2 zuf\xE4llig", en: "2 at random", it: "2 a caso", es: "2 al azar", nl: "2 willekeurig" }),
  "3 au hasard": withDutchVariants({ de: "3 zuf\xE4llig", en: "3 at random", it: "3 a caso", es: "3 al azar", nl: "3 willekeurig" }),
  "5 au hasard": withDutchVariants({ de: "5 zuf\xE4llig", en: "5 at random", it: "5 a caso", es: "5 al azar", nl: "5 willekeurig" }),
  "10 au hasard": withDutchVariants({ de: "10 zuf\xE4llig", en: "10 at random", it: "10 a caso", es: "10 al azar", nl: "10 willekeurig" }),
  "{count} au hasard": withDutchVariants({ de: "{count} zuf\xE4llig", en: "{count} at random", it: "{count} a caso", es: "{count} al azar", nl: "{count} willekeurig" }),
  "Pour d\xE9marrer rapidement": withDutchVariants({ de: "F\xFCr einen schnellen Start", en: "For a quick start", it: "Per iniziare rapidamente", es: "Para empezar r\xE1pidamente", nl: "Om snel te beginnen" }),
  "D\xE9fis pr\xEAts \xE0 l\u2019emploi": withDutchVariants({ de: "Fertige \xDCbungen", en: "Ready-made challenges", it: "Esercizi pronti all\u2019uso", es: "Ejercicios listos para usar", nl: "Kant-en-klare uitdagingen" }),
  "Choisir un d\xE9fi pr\xEAt \xE0 l\u2019emploi": withDutchVariants({ de: "Eine fertige \xDCbung w\xE4hlen", en: "Choose a ready-made challenge", it: "Scegli un esercizio pronto", es: "Elegir un ejercicio listo", nl: "Kies een kant-en-klare uitdaging" }),
  "Au hasard :": withDutchVariants({ de: "Zuf\xE4llig:", en: "At random:", it: "A caso:", es: "Al azar:", nl: "Willekeurig:" }),
  "Autres temps": withDutchVariants({ de: "Weitere Zeitformen", en: "Other tenses", it: "Altri tempi", es: "Otros tiempos", nl: "Andere tijden" }),
  "Autres": withDutchVariants({ de: "Weitere", en: "Other", it: "Altri", es: "Otros", nl: "Andere" }),
  "Aper\xE7u avant impression": withDutchVariants({ de: "Druckvorschau", en: "Print preview", it: "Anteprima di stampa", es: "Vista previa de impresi\xF3n", nl: "Afdrukvoorbeeld" }),
  "Personnalisation": withDutchVariants({ de: "Anpassung", en: "Customisation", it: "Personalizzazione", es: "Personalizaci\xF3n", nl: "Aanpassen" }),
  "Options de la fiche": withDutchVariants({ de: "Arbeitsblattoptionen", en: "Worksheet options", it: "Opzioni della scheda", es: "Opciones de la ficha", nl: "Werkbladopties" }),
  "Les changements apparaissent imm\xE9diatement dans l\u2019aper\xE7u.": withDutchVariants({ de: "\xC4nderungen erscheinen sofort in der Vorschau.", en: "Changes appear immediately in the preview.", it: "Le modifiche appaiono subito nell\u2019anteprima.", es: "Los cambios aparecen inmediatamente en la vista previa.", nl: "Wijzigingen verschijnen meteen in het voorbeeld." }),
  "Questions de la fiche": withDutchVariants({ de: "Fragen des Arbeitsblatts", en: "Worksheet questions", it: "Domande della scheda", es: "Preguntas de la ficha", nl: "Vragen van het werkblad" }),
  "Nouvelle fiche au hasard": withDutchVariants({ de: "Neues zuf\xE4lliges Arbeitsblatt", en: "New random worksheet", it: "Nuova scheda casuale", es: "Nueva ficha al azar", nl: "Nieuw willekeurig werkblad" }),
  "Cr\xE9ation d\u2019une nouvelle fiche\u2026": withDutchVariants({ de: "Neues Arbeitsblatt wird erstellt\u2026", en: "Creating a new worksheet\u2026", it: "Creazione di una nuova scheda\u2026", es: "Creando una nueva ficha\u2026", nl: "Nieuw werkblad wordt aangemaakt\u2026" }),
  "D\xE9fi {code} \u2014 fiche {number}": withDutchVariants({ de: "\xDCbung {code} \u2014 Arbeitsblatt {number}", en: "Challenge {code} \u2014 worksheet {number}", it: "Esercizio {code} \u2014 scheda {number}", es: "Ejercicio {code} \u2014 ficha {number}", nl: "Uitdaging {code} \u2014 werkblad {number}" }),
  "Seulement {available} questions diff\xE9rentes sont disponibles sur les {requested} demand\xE9es": withDutchVariants({ de: "Nur {available} verschiedene Fragen sind von den {requested} angeforderten verf\xFCgbar", en: "Only {available} different questions are available out of the {requested} requested", it: "Sono disponibili solo {available} domande diverse sulle {requested} richieste", es: "Solo hay {available} preguntas diferentes disponibles de las {requested} solicitadas", nl: "Er zijn slechts {available} verschillende vragen beschikbaar van de {requested} gevraagde" }),
  "Autoriser les r\xE9p\xE9titions": withDutchVariants({ de: "Wiederholungen zulassen", en: "Allow repetitions", it: "Consenti ripetizioni", es: "Permitir repeticiones", nl: "Herhalingen toestaan" }),
  "R\xE9p\xE9titions autoris\xE9es": withDutchVariants({ de: "Wiederholungen zugelassen", en: "Repetitions allowed", it: "Ripetizioni consentite", es: "Repeticiones permitidas", nl: "Herhalingen toegestaan" }),
  "Titre de la fiche": withDutchVariants({ de: "Titel des Arbeitsblatts", en: "Worksheet title", it: "Titolo della scheda", es: "T\xEDtulo de la ficha", nl: "Titel van het werkblad" }),
  "Pr\xE9sentation des questions": withDutchVariants({ de: "Darstellung der Fragen", en: "Question layout", it: "Presentazione delle domande", es: "Presentaci\xF3n de las preguntas", nl: "Indeling van de vragen" }),
  "Pr\xE9sentation en lignes": withDutchVariants({ de: "Darstellung in Zeilen", en: "Line layout", it: "Presentazione in righe", es: "Presentaci\xF3n en l\xEDneas", nl: "Indeling op regels" }),
  "Pronom, verbe et temps sur une ligne, puis une ligne pour \xE9crire la r\xE9ponse.": withDutchVariants({ de: "Pronomen, Verb und Zeitform in einer Zeile, danach eine Linie f\xFCr die Antwort.", en: "Pronoun, verb and tense on one line, followed by a line for the answer.", it: "Pronome, verbo e tempo su una riga, poi una riga per scrivere la risposta.", es: "Pronombre, verbo y tiempo en una l\xEDnea, seguidos de una l\xEDnea para escribir la respuesta.", nl: "Voornaamwoord, werkwoord en tijd op \xE9\xE9n regel, gevolgd door een antwoordlijn." }),
  "Pr\xE9sentation en tableau": withDutchVariants({ de: "Darstellung als Tabelle", en: "Table layout", it: "Presentazione in tabella", es: "Presentaci\xF3n en tabla", nl: "Tabelindeling" }),
  "Une colonne pour le verbe, le temps, le pronom et la r\xE9ponse \xE0 \xE9crire.": withDutchVariants({ de: "Je eine Spalte f\xFCr Verb, Zeitform, Pronomen und die zu schreibende Antwort.", en: "One column each for the verb, tense, pronoun and written answer.", it: "Una colonna per il verbo, il tempo, il pronome e la risposta da scrivere.", es: "Una columna para el verbo, el tiempo, el pronombre y la respuesta que se debe escribir.", nl: "Een aparte kolom voor het werkwoord, de tijd, het voornaamwoord en het geschreven antwoord." }),
  "Espace avant le titre": withDutchVariants({ de: "Abstand vor dem Titel", en: "Space before the title", it: "Spazio prima del titolo", es: "Espacio antes del t\xEDtulo", nl: "Ruimte voor de titel" }),
  "Espacement entre les questions": withDutchVariants({ de: "Abstand zwischen den Fragen", en: "Spacing between questions", it: "Spaziatura tra le domande", es: "Espacio entre las preguntas", nl: "Ruimte tussen de vragen" }),
  "Mise en page": withDutchVariants({ de: "Layout", en: "Layout", it: "Impaginazione", es: "Dise\xF1o", nl: "Indeling" }),
  "Affichage inclusif": withDutchVariants({ de: "Barrierearme Darstellung", en: "Inclusive layout", it: "Visualizzazione inclusiva", es: "Visualizaci\xF3n inclusiva", nl: "Toegankelijke indeling" }),
  "Texte agrandi, police Arial, interligne renforc\xE9 et mise en page plus a\xE9r\xE9e.": withDutchVariants({ de: "Gr\xF6\xDFerer Text, Arial, gr\xF6\xDFerer Zeilenabstand und ein luftigeres Layout.", en: "Larger text, Arial, increased line spacing and a more spacious layout.", it: "Testo ingrandito, carattere Arial, interlinea maggiore e impaginazione pi\xF9 ariosa.", es: "Texto ampliado, fuente Arial, mayor interlineado y dise\xF1o m\xE1s espacioso.", nl: "Grotere tekst in Arial, meer regelafstand en een ruimere indeling." }),
  "Informations de l\u2019\xE9l\xE8ve": withDutchVariants({ de: "Angaben zum Sch\xFCler", en: "Student information", it: "Informazioni dell\u2019alunno", es: "Informaci\xF3n del alumno", nl: "Gegevens van de leerling" }),
  "Date": withDutchVariants({ de: "Datum", en: "Date", it: "Data", es: "Fecha", nl: "Datum" }),
  "Espace pour la note": withDutchVariants({ de: "Platz f\xFCr die Note", en: "Space for the mark", it: "Spazio per il voto", es: "Espacio para la nota", nl: "Ruimte voor het cijfer" }),
  "Contenu affich\xE9": withDutchVariants({ de: "Angezeigter Inhalt", en: "Displayed content", it: "Contenuto visualizzato", es: "Contenido mostrado", nl: "Getoonde inhoud" }),
  "Liste des verbes": withDutchVariants({ de: "Verbliste", en: "Verb list", it: "Elenco dei verbi", es: "Lista de verbos", nl: "Werkwoordenlijst" }),
  "Liste des temps": withDutchVariants({ de: "Liste der Zeitformen", en: "Tense list", it: "Elenco dei tempi", es: "Lista de tiempos", nl: "Tijdenlijst" }),
  "Num\xE9ro questionnaire/corrig\xE9": withDutchVariants({ de: "Nummer des Fragebogens/der L\xF6sung", en: "Questionnaire/answer-key number", it: "Numero questionario/soluzioni", es: "N\xFAmero de cuestionario/soluciones", nl: "Nummer van de vragenlijst/oplossingen" }),
  "Cr\xE9ation du code\u2026": withDutchVariants({ de: "Code wird erstellt\u2026", en: "Creating code\u2026", it: "Creazione del codice\u2026", es: "Creando el c\xF3digo\u2026", nl: "Code wordt aangemaakt\u2026" }),
  "Le lien reste actif. Un d\xE9fi inutilis\xE9 depuis plus de cinq ans peut \xEAtre supprim\xE9.": withDutchVariants({ de: "Der Link bleibt aktiv. Eine \xDCbung, die seit mehr als f\xFCnf Jahren nicht genutzt wurde, kann gel\xF6scht werden.", en: "The link stays active. A challenge unused for more than five years may be deleted.", it: "Il link resta attivo. Un esercizio inutilizzato da pi\xF9 di cinque anni pu\xF2 essere eliminato.", es: "El enlace permanece activo. Un ejercicio que no se haya utilizado durante m\xE1s de cinco a\xF1os puede eliminarse.", nl: "De link blijft actief. Een uitdaging die meer dan vijf jaar niet is gebruikt, kan worden verwijderd." }),
  "Impossible de cr\xE9er le code du d\xE9fi.": withDutchVariants({ de: "Der \xDCbungscode konnte nicht erstellt werden.", en: "The challenge code could not be created.", it: "Impossibile creare il codice dell\u2019esercizio.", es: "No se ha podido crear el c\xF3digo del ejercicio.", nl: "De code van de uitdaging kon niet worden aangemaakt." }),
  "Le code du d\xE9fi n\u2019a pas pu \xEAtre cr\xE9\xE9.": withDutchVariants({ de: "Der \xDCbungscode konnte nicht erstellt werden.", en: "The challenge code could not be created.", it: "Non \xE8 stato possibile creare il codice dell\u2019esercizio.", es: "No se ha podido crear el c\xF3digo del ejercicio.", nl: "De code van de uitdaging kon niet worden aangemaakt." }),
  "Aper\xE7u exact de la fiche PDF et de son corrig\xE9": withDutchVariants({ de: "Genaue Vorschau des PDF-Arbeitsblatts und der L\xF6sungen", en: "Exact preview of the PDF worksheet and its answer key", it: "Anteprima esatta della scheda PDF e delle soluzioni", es: "Vista exacta de la ficha PDF y sus soluciones", nl: "Exact voorbeeld van het PDF-werkblad en de oplossingen" }),
  "Cr\xE9ation de l\u2019aper\xE7u PDF\u2026": withDutchVariants({ de: "PDF-Vorschau wird erstellt\u2026", en: "Creating PDF preview\u2026", it: "Creazione dell\u2019anteprima PDF\u2026", es: "Creando vista previa en PDF\u2026", nl: "PDF-voorbeeld wordt aangemaakt\u2026" }),
  "La fiche et le corrig\xE9 sont mis en page.": withDutchVariants({ de: "Arbeitsblatt und L\xF6sungen werden formatiert.", en: "The worksheet and answer key are being laid out.", it: "La scheda e le soluzioni vengono impaginate.", es: "Se est\xE1n maquetando la ficha y las soluciones.", nl: "Het werkblad en de oplossingen worden opgemaakt." }),
  "Impossible de g\xE9n\xE9rer l\u2019aper\xE7u PDF.": withDutchVariants({ de: "Die PDF-Vorschau konnte nicht erstellt werden.", en: "The PDF preview could not be generated.", it: "Impossibile generare l\u2019anteprima PDF.", es: "No se ha podido generar la vista previa en PDF.", nl: "Het PDF-voorbeeld kon niet worden gegenereerd." }),
  "L\u2019aper\xE7u PDF n\u2019a pas pu \xEAtre cr\xE9\xE9.": withDutchVariants({ de: "Die PDF-Vorschau konnte nicht erstellt werden.", en: "The PDF preview could not be created.", it: "Impossibile creare l\u2019anteprima PDF.", es: "No se ha podido crear la vista previa en PDF.", nl: "Het PDF-voorbeeld kon niet worden aangemaakt." }),
  "CORRIG\xC9": withDutchVariants({ de: "L\xD6SUNGEN", en: "ANSWER KEY", it: "SOLUZIONI", es: "SOLUCIONES", nl: "OPLOSSINGEN" }),
  "D\xE9fi sauvegard\xE9": withDutchVariants({ de: "\xDCbung gespeichert", en: "Challenge saved", it: "Esercizio salvato", es: "Ejercicio guardado", nl: "Uitdaging opgeslagen" }),
  "Ce d\xE9fi est enregistr\xE9 dans \xAB Mes d\xE9fis \xBB de votre compte.": withDutchVariants({ de: "Diese \xDCbung ist unter \u201EMeine Herausforderungen\u201C in deinem Konto gespeichert.", en: "This challenge is saved under \u201CMy challenges\u201D in your account.", it: "Questo esercizio \xE8 salvato in \xABI miei esercizi\xBB nel tuo account.", es: "Este ejercicio est\xE1 guardado en \xABMis ejercicios\xBB de tu cuenta.", nl: "Deze uitdaging is opgeslagen bij \u201CMijn uitdagingen\u201D in je account." }),
  "Ce d\xE9fi sera automatiquement enregistr\xE9 dans \xAB Mes d\xE9fis \xBB de votre compte.": withDutchVariants({ de: "Diese \xDCbung wird automatisch unter \u201EMeine Herausforderungen\u201C in deinem Konto gespeichert.", en: "This challenge will automatically be saved under \u201CMy challenges\u201D in your account.", it: "Questo esercizio verr\xE0 salvato automaticamente in \xABI miei esercizi\xBB nel tuo account.", es: "Este ejercicio se guardar\xE1 autom\xE1ticamente en \xABMis ejercicios\xBB de tu cuenta.", nl: "Deze uitdaging wordt automatisch opgeslagen bij \u201CMijn uitdagingen\u201D in je account." }),
  "Votre d\xE9fi est pr\xEAt \xE0 \xEAtre partag\xE9": withDutchVariants({ de: "Deine \xDCbung kann geteilt werden", en: "Your challenge is ready to share", it: "Il tuo esercizio \xE8 pronto per essere condiviso", es: "Tu ejercicio est\xE1 listo para compartir", nl: "Je uitdaging is klaar om te delen" }),
  "Deux possibilit\xE9s permettent \xE0 vos \xE9l\xE8ves de retrouver ce d\xE9fi.": withDutchVariants({ de: "Deine Sch\xFClerinnen und Sch\xFCler k\xF6nnen diese \xDCbung auf zwei Arten wiederfinden.", en: "Your students can retrieve this challenge in two ways.", it: "Gli alunni possono ritrovare questo esercizio in due modi.", es: "Tus alumnos pueden recuperar este ejercicio de dos maneras.", nl: "Je leerlingen kunnen deze uitdaging op twee manieren terugvinden." }),
  "Sauvegarder le code": withDutchVariants({ de: "Code speichern", en: "Save the code", it: "Salva il codice", es: "Guardar el c\xF3digo", nl: "Bewaar de code" }),
  "L\u2019\xE9l\xE8ve conserve ce code. Plus tard, il le copie sur la page d\u2019accueil pour retrouver ce d\xE9fi.": withDutchVariants({ de: "Der Sch\xFCler bewahrt diesen Code auf und gibt ihn sp\xE4ter auf der Startseite ein, um die \xDCbung wiederzufinden.", en: "The student keeps this code and later enters it on the home page to retrieve the challenge.", it: "L\u2019alunno conserva il codice e lo inserisce in seguito nella home page per ritrovare l\u2019esercizio.", es: "El alumno guarda el c\xF3digo y lo introduce m\xE1s tarde en la p\xE1gina de inicio para recuperar el ejercicio.", nl: "De leerling bewaart deze code en voert ze later in op de startpagina om de uitdaging terug te vinden." }),
  "Id\xE9al pour transmettre le d\xE9fi par \xE9crit": withDutchVariants({ de: "Ideal, um die \xDCbung schriftlich weiterzugeben", en: "Ideal for sharing the challenge in writing", it: "Ideale per trasmettere l\u2019esercizio per iscritto", es: "Ideal para compartir el ejercicio por escrito", nl: "Ideaal om de uitdaging schriftelijk door te geven" }),
  "Code \xE0 conserver": withDutchVariants({ de: "Code zum Aufbewahren", en: "Code to keep", it: "Codice da conservare", es: "C\xF3digo que debes guardar", nl: "Code om te bewaren" }),
  "Comment le recharger plus tard ?": withDutchVariants({ de: "Wie kann ich ihn sp\xE4ter laden?", en: "How can it be loaded later?", it: "Come ricaricarlo in seguito?", es: "\xBFC\xF3mo cargarlo m\xE1s tarde?", nl: "Hoe kun je ze later opnieuw laden?" }),
  "Emplacement du code re\xE7u sur la page d\u2019accueil": withDutchVariants({ de: "Eingabefeld f\xFCr den erhaltenen Code auf der Startseite", en: "Where to enter the received code on the home page", it: "Posizione del codice ricevuto nella home page", es: "Lugar para introducir el c\xF3digo recibido en la p\xE1gina de inicio", nl: "Waar je de ontvangen code op de startpagina invoert" }),
  "page d\u2019accueil": withDutchVariants({ de: "Startseite", en: "home page", it: "home page", es: "p\xE1gina de inicio", nl: "startpagina" }),
  "Envoyer le lien direct": withDutchVariants({ de: "Direktlink senden", en: "Send the direct link", it: "Invia il link diretto", es: "Enviar el enlace directo", nl: "Stuur de rechtstreekse link" }),
  "L\u2019\xE9l\xE8ve clique simplement sur ce lien : il arrive directement sur le d\xE9fi, sans saisir le code.": withDutchVariants({ de: "Der Sch\xFCler klickt einfach auf diesen Link und gelangt ohne Codeeingabe direkt zur \xDCbung.", en: "The student simply clicks this link to open the challenge directly, without entering the code.", it: "L\u2019alunno fa clic sul link e accede direttamente all\u2019esercizio senza inserire il codice.", es: "El alumno solo tiene que hacer clic en el enlace para abrir el ejercicio sin introducir el c\xF3digo.", nl: "De leerling klikt gewoon op deze link om de uitdaging rechtstreeks te openen, zonder de code in te voeren." }),
  "Id\xE9al pour transmettre le d\xE9fi par email": withDutchVariants({ de: "Ideal zum Versenden per E-Mail", en: "Ideal for sharing the challenge by email", it: "Ideale per inviare l\u2019esercizio via e-mail", es: "Ideal para enviar el ejercicio por correo electr\xF3nico", nl: "Ideaal om de uitdaging via e-mail te delen" }),
  "Lien \xE0 envoyer": withDutchVariants({ de: "Link zum Senden", en: "Link to send", it: "Link da inviare", es: "Enlace para enviar", nl: "Link om te versturen" }),
  "\xC9tape 1": withDutchVariants({ de: "Schritt 1", en: "Step 1", it: "Passaggio 1", es: "Paso 1", nl: "Stap 1" }),
  "\xC9tape 2": withDutchVariants({ de: "Schritt 2", en: "Step 2", it: "Passaggio 2", es: "Paso 2", nl: "Stap 2" }),
  "Mes verbes": withDutchVariants({ de: "Meine Verben", en: "My verbs", it: "I miei verbi", es: "Mis verbos", nl: "Mijn werkwoorden" }),
  "Mes temps": withDutchVariants({ de: "Meine Zeitformen", en: "My tenses", it: "I miei tempi", es: "Mis tiempos", nl: "Mijn tijden" }),
  "Ajouter un verbe": withDutchVariants({ de: "Verb hinzuf\xFCgen", en: "Add a verb", it: "Aggiungi un verbo", es: "A\xF1adir un verbo", nl: "Een werkwoord toevoegen" }),
  "\xC9cris un verbe pour l\u2019ajouter": withDutchVariants({ de: "Schreibe ein Verb, um es hinzuzuf\xFCgen", en: "Type a verb to add it", it: "Scrivi un verbo per aggiungerlo", es: "Escribe un verbo para a\xF1adirlo", nl: "Typ een werkwoord om het toe te voegen" }),
  "Ex. aller, \xEAtre, finir\u2026": withDutchVariants({ de: "Z. B. aller, \xEAtre, finir\u2026", en: "E.g. aller, \xEAtre, finir\u2026", it: "Es. aller, \xEAtre, finir\u2026", es: "P. ej. aller, \xEAtre, finir\u2026", nl: "Bijv. aller, \xEAtre, finir\u2026" }),
  "Ajouter le premier verbe propos\xE9": withDutchVariants({ de: "Erstes vorgeschlagenes Verb hinzuf\xFCgen", en: "Add the first suggested verb", it: "Aggiungi il primo verbo suggerito", es: "A\xF1adir el primer verbo sugerido", nl: "Het eerste voorgestelde werkwoord toevoegen" }),
  "Verbes propos\xE9s": withDutchVariants({ de: "Vorgeschlagene Verben", en: "Suggested verbs", it: "Verbi suggeriti", es: "Verbos sugeridos", nl: "Voorgestelde werkwoorden" }),
  "forme pronominale g\xE9n\xE9r\xE9e": withDutchVariants({ de: "erzeugte pronominale Form", en: "generated pronominal form", it: "forma pronominale generata", es: "forma pronominal generada", nl: "gegenereerde wederkerende vorm" }),
  "auxiliaire": withDutchVariants({ de: "Hilfsverb", en: "auxiliary", it: "ausiliare", es: "auxiliar", nl: "hulpwerkwoord" }),
  "Verbes s\xE9lectionn\xE9s": withDutchVariants({ de: "Ausgew\xE4hlte Verben", en: "Selected verbs", it: "Verbi selezionati", es: "Verbos seleccionados", nl: "Geselecteerde werkwoorden" }),
  "Tout supprimer": withDutchVariants({ de: "Alle entfernen", en: "Remove all", it: "Rimuovi tutto", es: "Eliminar todo", nl: "Alles verwijderen" }),
  "Tout cocher": withDutchVariants({ de: "Alle ausw\xE4hlen", en: "Select all", it: "Seleziona tutto", es: "Seleccionar todo", nl: "Alles selecteren" }),
  "Tout d\xE9cocher": withDutchVariants({ de: "Alle abw\xE4hlen", en: "Clear all", it: "Deseleziona tutto", es: "Deseleccionar todo", nl: "Alles wissen" }),
  "Uniquement il / ils": withDutchVariants({ de: "Nur il / ils", en: "Only il / ils", it: "Solo il / ils", es: "Solo il / ils", nl: "Alleen il / ils" }),
  "Exemple:": withDutchVariants({ de: "Beispiel:", en: "Example:", it: "Esempio:", es: "Ejemplo:", nl: "Voorbeeld:" }),
  "Voir un exemple :": withDutchVariants({ de: "Beispiel anzeigen:", en: "View an example:", it: "Vedi un esempio:", es: "Ver un ejemplo:", nl: "Een voorbeeld bekijken:" }),
  "Exemple momentan\xE9ment indisponible.": withDutchVariants({ de: "Beispiel vor\xFCbergehend nicht verf\xFCgbar.", en: "Example temporarily unavailable.", it: "Esempio temporaneamente non disponibile.", es: "Ejemplo no disponible temporalmente.", nl: "Voorbeeld tijdelijk niet beschikbaar." }),
  "Composer un d\xE9fi personnalis\xE9": withDutchVariants({ de: "Eigene \xDCbung erstellen", en: "Create a custom challenge", it: "Crea un esercizio personalizzato", es: "Crear un ejercicio personalizado", nl: "Een uitdaging op maat maken" }),
  "Niveau scolaire suisse": withDutchVariants({ de: "Schweizer Schulstufe", en: "Swiss school level", it: "Livello scolastico svizzero", es: "Nivel escolar suizo", nl: "Zwitsers schoolniveau" }),
  "Construire mon d\xE9fi": withDutchVariants({ de: "Meine \xDCbung erstellen", en: "Build my challenge", it: "Crea il mio esercizio", es: "Crear mi ejercicio", nl: "Mijn uitdaging samenstellen" }),
  "Exercices de conjugaison fran\xE7aise, gratuits et sans publicit\xE9": withDutchVariants({ de: "Kostenlose und werbefreie \xDCbungen zur franz\xF6sischen Konjugation", en: "Free, ad-free French conjugation exercises", it: "Esercizi gratuiti di coniugazione francese senza pubblicit\xE0", es: "Ejercicios gratuitos de conjugaci\xF3n francesa sin publicidad", nl: "Gratis oefeningen op Franse vervoeging, zonder reclame" }),
  "TATITOTU propose des exercices de conjugaison fran\xE7aise enti\xE8rement gratuits, interactifs et personnalisables, sans publicit\xE9.": withDutchVariants({ de: "TATITOTU bietet vollst\xE4ndig kostenlose, interaktive und anpassbare \xDCbungen zur franz\xF6sischen Konjugation \u2013 ohne Werbung.", en: "TATITOTU offers completely free, interactive and customisable French conjugation exercises, without advertising.", it: "TATITOTU propone esercizi di coniugazione francese completamente gratuiti, interattivi e personalizzabili, senza pubblicit\xE0.", es: "TATITOTU ofrece ejercicios de conjugaci\xF3n francesa totalmente gratuitos, interactivos y personalizables, sin publicidad.", nl: "TATITOTU biedt volledig gratis, interactieve oefeningen op Franse vervoeging op maat, zonder reclame." }),
  "Tout pour progresser": withDutchVariants({ de: "Alles, um Fortschritte zu machen", en: "Everything you need to progress", it: "Tutto per fare progressi", es: "Todo para progresar", nl: "Alles wat je nodig hebt om vooruit te gaan" }),
  "Des exercices de conjugaison adapt\xE9s \xE0 tes besoins": withDutchVariants({ de: "Konjugations\xFCbungen, die zu deinen Bed\xFCrfnissen passen", en: "Conjugation exercises tailored to your needs", it: "Esercizi di coniugazione adatti alle tue esigenze", es: "Ejercicios de conjugaci\xF3n adaptados a tus necesidades", nl: "Vervoegingsoefeningen op maat van jouw behoeften" }),
  "Pour les \xE9l\xE8ves": withDutchVariants({ de: "F\xFCr Sch\xFClerinnen und Sch\xFCler", en: "For students", it: "Per gli studenti", es: "Para estudiantes", nl: "Voor leerlingen" }),
  "Pour les enseignants": withDutchVariants({ de: "F\xFCr Lehrpersonen", en: "For teachers", it: "Per gli insegnanti", es: "Para docentes", nl: "Voor leerkrachten" }),
  "Des ressources utiles": withDutchVariants({ de: "N\xFCtzliche Lernressourcen", en: "Useful resources", it: "Risorse utili", es: "Recursos \xFAtiles", nl: "Nuttige bronnen" }),
  "Personnalise ton exercice": withDutchVariants({ de: "Passe deine \xDCbung an", en: "Customise your exercise", it: "Personalizza il tuo esercizio", es: "Personaliza tu ejercicio", nl: "Pas je oefening aan" }),
  "Entra\xEEne-toi et imprime": withDutchVariants({ de: "\xDCbe und drucke", en: "Practise and print", it: "Esercitati e stampa", es: "Practica e imprime", nl: "Oefenen en afdrukken" }),
  "Apprends et r\xE9vise": withDutchVariants({ de: "Lerne und wiederhole", en: "Learn and revise", it: "Impara e ripassa", es: "Aprende y repasa", nl: "Leren en herhalen" }),
  "Choisis les verbes, les modes et les temps que tu souhaites travailler, personnalise les questions, puis commence ton entra\xEEnement.": withDutchVariants({ de: "W\xE4hle die Verben, Modi und Zeitformen aus, die du \xFCben m\xF6chtest, passe die Fragen an und beginne dein Training.", en: "Choose the verbs, moods and tenses you want to practise, customise the questions, then begin your training.", it: "Scegli i verbi, i modi e i tempi che desideri esercitare, personalizza le domande e inizia l\u2019allenamento.", es: "Elige los verbos, modos y tiempos que deseas practicar, personaliza las preguntas y empieza tu entrenamiento.", nl: "Kies de werkwoorden, wijzen en tijden die je wilt oefenen, pas de vragen aan en begin te oefenen." }),
  "Les exercices peuvent \xEAtre r\xE9alis\xE9s dans un format classique ou sous la forme d\u2019un dialogue avec un coach virtuel qui t\u2019aide pour chaque question.": withDutchVariants({ de: "Die \xDCbungen k\xF6nnen im klassischen Format oder als Dialog mit einem virtuellen Coach durchgef\xFChrt werden, der dir bei jeder Frage hilft.", en: "Exercises can be completed in a classic format or as a dialogue with a virtual coach who helps you with each question.", it: "Gli esercizi possono essere svolti in formato classico oppure sotto forma di dialogo con un coach virtuale che ti aiuta per ogni domanda.", es: "Los ejercicios pueden realizarse en un formato cl\xE1sico o mediante un di\xE1logo con un entrenador virtual que te ayuda con cada pregunta.", nl: "Je kunt de oefeningen maken in de klassieke vorm of als gesprek met een virtuele coach die je bij elke vraag helpt." }),
  "Tes propres exercices peuvent \xEAtre partag\xE9s avec tes \xE9l\xE8ves.": withDutchVariants({ de: "Du kannst deine eigenen \xDCbungen mit deinen Sch\xFClerinnen und Sch\xFClern teilen.", en: "You can share your own exercises with your students.", it: "Puoi condividere i tuoi esercizi con i tuoi studenti.", es: "Puedes compartir tus propios ejercicios con tus estudiantes.", nl: "Je kunt je eigen oefeningen met je leerlingen delen." }),
  "Les \xE9l\xE8ves peuvent aussi te partager leurs bilans pour un meilleur suivi.": withDutchVariants({ de: "Die Sch\xFClerinnen und Sch\xFCler k\xF6nnen ihre Auswertungen ebenfalls mit dir teilen, damit du ihre Fortschritte besser verfolgen kannst.", en: "Students can also share their reports with you, so you can track their progress more effectively.", it: "Gli studenti possono anche condividere con te i loro risultati, per consentirti di seguirne meglio i progressi.", es: "Los estudiantes tambi\xE9n pueden compartir contigo sus informes para facilitar el seguimiento.", nl: "Leerlingen kunnen ook hun verslagen met jou delen, zodat je hun vooruitgang beter kunt volgen." }),
  "Tu peux aussi imprimer l\u2019exercice en PDF ou DOCX avec corrig\xE9.": withDutchVariants({ de: "Du kannst die \xDCbung mit den L\xF6sungen auch als PDF oder DOCX ausdrucken.", en: "You can also print the exercise as a PDF or DOCX with its answer key.", it: "Puoi anche stampare l\u2019esercizio in formato PDF o DOCX con le soluzioni.", es: "Tambi\xE9n puedes imprimir el ejercicio en PDF o DOCX con sus soluciones.", nl: "Je kunt de oefening ook als PDF of DOCX met oplossingen afdrukken." }),
  "Les exercices peuvent \xEAtre r\xE9alis\xE9s dans un format classique ou sous la forme d\u2019un dialogue avec un coach virtuel qui dispense une aide contextualis\xE9e. Tu peux \xE9galement cr\xE9er une fiche PDF ou docx \xE0 imprimer avec les questions et leur corrig\xE9.": withDutchVariants({ de: "Die \xDCbungen k\xF6nnen im klassischen Format oder als Dialog mit einem virtuellen Coach durchgef\xFChrt werden, der kontextbezogene Hilfe bietet. Du kannst au\xDFerdem ein PDF- oder DOCX-Arbeitsblatt mit Fragen und L\xF6sungen zum Ausdrucken erstellen.", en: "Exercises can be completed in a classic format or as a dialogue with a virtual coach who provides contextual help. You can also create a printable PDF or DOCX worksheet containing the questions and answer key.", it: "Gli esercizi possono essere svolti in formato classico oppure sotto forma di dialogo con un coach virtuale che fornisce un aiuto contestualizzato. Puoi anche creare una scheda PDF o DOCX da stampare con le domande e le soluzioni.", es: "Los ejercicios pueden realizarse en un formato cl\xE1sico o mediante un di\xE1logo con un entrenador virtual que ofrece ayuda contextualizada. Tambi\xE9n puedes crear una ficha PDF o DOCX imprimible con las preguntas y sus soluciones.", nl: "Je kunt de oefeningen maken in de klassieke vorm of als gesprek met een virtuele coach die gerichte hulp biedt. Je kunt ook een afdrukbaar PDF- of DOCX-werkblad met vragen en oplossingen maken." }),
  "Pour apprendre et r\xE9viser, le site propose aussi des explications sur les modes et les temps, ainsi que la conjugaison compl\xE8te des verbes fran\xE7ais, avec les accords du participe pass\xE9 et les principales difficult\xE9s \xE0 \xE9viter.": withDutchVariants({ de: "Zum Lernen und Wiederholen bietet die Website au\xDFerdem Erkl\xE4rungen zu Modi und Zeitformen sowie die vollst\xE4ndige Konjugation franz\xF6sischer Verben, einschlie\xDFlich der \xDCbereinstimmung des Partizips Perfekt und der wichtigsten zu vermeidenden Schwierigkeiten.", en: "To learn and revise, the site also provides explanations of moods and tenses, together with complete French verb conjugations, past participle agreement and the main difficulties to avoid.", it: "Per imparare e ripassare, il sito propone anche spiegazioni sui modi e sui tempi, oltre alla coniugazione completa dei verbi francesi, con gli accordi del participio passato e le principali difficolt\xE0 da evitare.", es: "Para aprender y repasar, el sitio tambi\xE9n ofrece explicaciones sobre los modos y los tiempos, adem\xE1s de la conjugaci\xF3n completa de los verbos franceses, con la concordancia del participio pasado y las principales dificultades que conviene evitar.", nl: "Om te leren en te herhalen biedt de site ook uitleg over wijzen en tijden, volledige Franse vervoegingen, de overeenkomst van het voltooid deelwoord en de belangrijkste valkuilen." }),
  "Pour apprendre et r\xE9viser, le site propose aussi des explications sur les modes et les temps.": withDutchVariants({ de: "Zum Lernen und Wiederholen bietet die Website au\xDFerdem Erkl\xE4rungen zu Modi und Zeitformen.", en: "To learn and revise, the site also provides explanations of moods and tenses.", it: "Per imparare e ripassare, il sito propone anche spiegazioni sui modi e sui tempi.", es: "Para aprender y repasar, el sitio tambi\xE9n ofrece explicaciones sobre los modos y los tiempos.", nl: "Om te leren en te herhalen biedt de site ook uitleg over wijzen en tijden." }),
  "Tu peux \xE9galement consulter la conjugaison compl\xE8te des verbes fran\xE7ais, les r\xE8gles d\u2019accord du participe pass\xE9 et les principales difficult\xE9s \xE0 \xE9viter.": withDutchVariants({ de: "Du kannst au\xDFerdem die vollst\xE4ndige Konjugation franz\xF6sischer Verben, die Regeln zur \xDCbereinstimmung des Partizips Perfekt und die wichtigsten Schwierigkeiten nachschlagen.", en: "You can also consult complete French verb conjugations, the rules for past participle agreement and the main difficulties to avoid.", it: "Puoi inoltre consultare la coniugazione completa dei verbi francesi, le regole dell\u2019accordo del participio passato e le principali difficolt\xE0 da evitare.", es: "Tambi\xE9n puedes consultar la conjugaci\xF3n completa de los verbos franceses, las reglas de concordancia del participio pasado y las principales dificultades que conviene evitar.", nl: "Je kunt ook volledige Franse vervoegingen, de regels voor de overeenkomst van het voltooid deelwoord en de belangrijkste valkuilen raadplegen." }),
  "\xC9tapes de cr\xE9ation du d\xE9fi": withDutchVariants({ de: "Schritte zur Erstellung der \xDCbung", en: "Challenge creation steps", it: "Passaggi per creare l\u2019esercizio", es: "Pasos para crear el ejercicio", nl: "Stappen om een uitdaging te maken" }),
  "Options": withDutchVariants({ de: "Optionen", en: "Options", it: "Opzioni", es: "Opciones", nl: "Opties" }),
  "Finaliser le d\xE9fi": withDutchVariants({ de: "\xDCbung fertigstellen", en: "Finish the challenge", it: "Completa l\u2019esercizio", es: "Finalizar el ejercicio", nl: "De uitdaging afronden" }),
  "Cr\xE9er": withDutchVariants({ de: "Erstellen", en: "Create", it: "Crea", es: "Crear", nl: "Maken" }),
  "Utiliser le d\xE9fi": withDutchVariants({ de: "\xDCbung verwenden", en: "Use the challenge", it: "Usa l\u2019esercizio", es: "Utilizar el ejercicio", nl: "De uitdaging gebruiken" }),
  "Pr\xE9paration de ton d\xE9fi\u2026": withDutchVariants({ de: "Deine \xDCbung wird vorbereitet\u2026", en: "Preparing your challenge\u2026", it: "Preparazione dell\u2019esercizio\u2026", es: "Preparando tu ejercicio\u2026", nl: "Je uitdaging wordt voorbereid\u2026" }),
  "Tu as re\xE7u un d\xE9fi ?": withDutchVariants({ de: "Hast du eine \xDCbung erhalten?", en: "Have you received a challenge?", it: "Hai ricevuto un esercizio?", es: "\xBFHas recibido un ejercicio?", nl: "Heb je een uitdaging ontvangen?" }),
  "Colle son code pour le reprendre imm\xE9diatement.": withDutchVariants({ de: "F\xFCge den Code ein, um sofort weiterzumachen.", en: "Paste its code to resume it immediately.", it: "Incolla il codice per riprenderlo subito.", es: "Pega el c\xF3digo para retomarlo inmediatamente.", nl: "Plak de code om ze meteen te openen." }),
  "Code du d\xE9fi": withDutchVariants({ de: "\xDCbungscode", en: "Challenge code", it: "Codice dell\u2019esercizio", es: "C\xF3digo del ejercicio", nl: "Code van de uitdaging" }),
  "Voir": withDutchVariants({ de: "Ansehen", en: "View", it: "Vedi", es: "Ver", nl: "Bekijken" }),
  "D\xE9couvrir": withDutchVariants({ de: "Entdecken", en: "Discover", it: "Scopri", es: "Descubrir", nl: "Ontdekken" }),
  "Tu veux travailler un de nos d\xE9fis\xA0?": withDutchVariants({ de: "M\xF6chtest du eine unserer \xDCbungen bearbeiten?", en: "Would you like to try one of our challenges?", it: "Vuoi provare uno dei nostri esercizi?", es: "\xBFQuieres practicar con uno de nuestros ejercicios?", nl: "Wil je een van onze uitdagingen proberen?" }),
  "Tu veux construire ton propre d\xE9fi ?": withDutchVariants({ de: "M\xF6chtest du deine eigene \xDCbung erstellen?", en: "Would you like to build your own challenge?", it: "Vuoi creare il tuo esercizio?", es: "\xBFQuieres crear tu propio ejercicio?", nl: "Wil je je eigen uitdaging samenstellen?" }),
  "Choisis les verbes, les modes, les temps et les options.": withDutchVariants({ de: "W\xE4hle Verben, Modi, Zeitformen und Optionen.", en: "Choose the verbs, moods, tenses and options.", it: "Scegli verbi, modi, tempi e opzioni.", es: "Elige los verbos, modos, tiempos y opciones.", nl: "Kies de werkwoorden, wijzen, tijden en opties." }),
  "Construire un nouveau d\xE9fi \u2192": withDutchVariants({ de: "Neue \xDCbung erstellen \u2192", en: "Build a new challenge \u2192", it: "Crea un nuovo esercizio \u2192", es: "Crear un nuevo ejercicio \u2192", nl: "Een nieuwe uitdaging samenstellen \u2192" }),
  "\u2190 Accueil": withDutchVariants({ de: "\u2190 Startseite", en: "\u2190 Home", it: "\u2190 Home", es: "\u2190 Inicio", nl: "\u2190 Startpagina" }),
  "\u2190 Nouveau d\xE9fi": withDutchVariants({ de: "\u2190 Neue Herausforderung", en: "\u2190 New challenge", it: "\u2190 Nuova sfida", es: "\u2190 Nuevo desaf\xEDo", nl: "\u2190 Nieuwe uitdaging" }),
  "Choisir les temps \u2192": withDutchVariants({ de: "Zeitformen w\xE4hlen \u2192", en: "Choose tenses \u2192", it: "Scegli i tempi \u2192", es: "Elegir tiempos \u2192", nl: "Tijden kiezen \u2192" }),
  "Modifier la liste": withDutchVariants({ de: "Liste \xE4ndern", en: "Edit the list", it: "Modifica l\u2019elenco", es: "Modificar la lista", nl: "De lijst bewerken" }),
  "\u2190 Verbes": withDutchVariants({ de: "\u2190 Verben", en: "\u2190 Verbs", it: "\u2190 Verbi", es: "\u2190 Verbos", nl: "\u2190 Werkwoorden" }),
  "Choisir les options \u2192": withDutchVariants({ de: "Optionen w\xE4hlen \u2192", en: "Choose options \u2192", it: "Scegli le opzioni \u2192", es: "Elegir opciones \u2192", nl: "Opties kiezen \u2192" }),
  "Cr\xE9er le d\xE9fi": withDutchVariants({ de: "\xDCbung erstellen", en: "Create the challenge", it: "Crea l\u2019esercizio", es: "Crear el ejercicio", nl: "De uitdaging maken" }),
  "Options du d\xE9fi": withDutchVariants({ de: "\xDCbungsoptionen", en: "Challenge options", it: "Opzioni dell\u2019esercizio", es: "Opciones del ejercicio", nl: "Opties van de uitdaging" }),
  "\u2190 Options": withDutchVariants({ de: "\u2190 Optionen", en: "\u2190 Options", it: "\u2190 Opzioni", es: "\u2190 Opciones", nl: "\u2190 Opties" }),
  "Aper\xE7u des verbes choisis": withDutchVariants({ de: "Vorschau der ausgew\xE4hlten Verben", en: "Preview of selected verbs", it: "Anteprima dei verbi scelti", es: "Vista previa de los verbos elegidos", nl: "Voorbeeld van de geselecteerde werkwoorden" }),
  "Autres verbes choisis": withDutchVariants({ de: "Weitere ausgew\xE4hlte Verben", en: "Other selected verbs", it: "Altri verbi scelti", es: "Otros verbos elegidos", nl: "Andere geselecteerde werkwoorden" }),
  "Questionnaire": withDutchVariants({ de: "Fragebogen", en: "Questionnaire", it: "Questionario", es: "Cuestionario", nl: "Vragenlijst" }),
  "Question": withDutchVariants({ de: "Frage", en: "Question", it: "Domanda", es: "Pregunta", nl: "Vraag" }),
  "Verbe :": withDutchVariants({ de: "Verb:", en: "Verb:", it: "Verbo:", es: "Verbo:", nl: "Werkwoord:" }),
  "Mode :": withDutchVariants({ de: "Modus:", en: "Mood:", it: "Modo:", es: "Modo:", nl: "Wijs:" }),
  "Temps :": withDutchVariants({ de: "Zeitform:", en: "Tense:", it: "Tempo:", es: "Tiempo:", nl: "Tijd:" }),
  "Personne :": withDutchVariants({ de: "Person:", en: "Person:", it: "Persona:", es: "Persona:", nl: "Persoon:" }),
  "Progression": withDutchVariants({ de: "Fortschritt", en: "Progress", it: "Avanzamento", es: "Progreso", nl: "Vooruitgang" }),
  "Progression du questionnaire": withDutchVariants({ de: "Fortschritt im Fragebogen", en: "Questionnaire progress", it: "Avanzamento del questionario", es: "Progreso del cuestionario", nl: "Voortgang van de vragenlijst" }),
  "{answered} questions r\xE9pondues sur {total}": withDutchVariants({ de: "{answered} von {total} Fragen beantwortet", en: "{answered} of {total} questions answered", it: "{answered} domande su {total} completate", es: "{answered} preguntas de {total} respondidas", nl: "{answered} van {total} vragen beantwoord" }),
  "Pas encore r\xE9pondue": withDutchVariants({ de: "Noch nicht beantwortet", en: "Not answered yet", it: "Non ancora completata", es: "A\xFAn no respondida", nl: "Nog niet beantwoord" }),
  "R\xE9ussie au premier essai": withDutchVariants({ de: "Beim ersten Versuch richtig", en: "Correct on the first attempt", it: "Corretta al primo tentativo", es: "Correcta en el primer intento", nl: "Juist bij de eerste poging" }),
  "R\xE9ussie au deuxi\xE8me essai": withDutchVariants({ de: "Beim zweiten Versuch richtig", en: "Correct on the second attempt", it: "Corretta al secondo tentativo", es: "Correcta en el segundo intento", nl: "Juist bij de tweede poging" }),
  "R\xE9ponse fausse": withDutchVariants({ de: "Falsche Antwort", en: "Incorrect answer", it: "Risposta errata", es: "Respuesta incorrecta", nl: "Onjuist antwoord" }),
  "Terminer la s\xE9ance": withDutchVariants({ de: "Sitzung beenden", en: "Finish session", it: "Termina la sessione", es: "Finalizar la sesi\xF3n", nl: "Sessie afronden" }),
  "Reprendre \xE0 la prochaine question": withDutchVariants({ de: "Mit der n\xE4chsten Frage fortfahren", en: "Resume with the next question", it: "Riprendi dalla prossima domanda", es: "Retomar desde la siguiente pregunta", nl: "Verdergaan met de volgende vraag" }),
  "Contexte grammatical": withDutchVariants({ de: "Grammatischer Kontext", en: "Grammatical context", it: "Contesto grammaticale", es: "Contexto gramatical", nl: "Grammaticale context" }),
  "V\xE9rifier": withDutchVariants({ de: "Pr\xFCfen", en: "Check", it: "Verifica", es: "Comprobar", nl: "Controleren" }),
  "Pas encore. V\xE9rifie ta r\xE9ponse et essaie une deuxi\xE8me fois.": withDutchVariants({ de: "Noch nicht. Pr\xFCfe deine Antwort und versuche es ein zweites Mal.", en: "Not yet. Check your answer and try a second time.", it: "Non ancora. Controlla la risposta e prova una seconda volta.", es: "Todav\xEDa no. Comprueba tu respuesta e int\xE9ntalo una segunda vez.", nl: "Nog niet juist. Controleer je antwoord en probeer een tweede keer." }),
  "Pas encore. Essaie une deuxi\xE8me fois.": withDutchVariants({ de: "Noch nicht. Versuche es ein zweites Mal.", en: "Not yet. Try a second time.", it: "Non ancora. Prova una seconda volta.", es: "Todav\xEDa no. Int\xE9ntalo una segunda vez.", nl: "Nog niet juist. Probeer een tweede keer." }),
  "Un indice pour t\u2019aider": withDutchVariants({ de: "Ein Hinweis f\xFCr dich", en: "A hint to help you", it: "Un suggerimento per aiutarti", es: "Una pista para ayudarte", nl: "Een tip om je te helpen" }),
  "Modifie ta r\xE9ponse ci-dessus, puis clique \xE0 nouveau sur \xAB V\xE9rifier \xBB.": withDutchVariants({ de: "\xC4ndere deine Antwort oben und klicke dann erneut auf \u201EPr\xFCfen\u201C.", en: "Change your answer above, then click \u201CCheck\u201D again.", it: "Modifica la risposta qui sopra, quindi fai di nuovo clic su \xABVerifica\xBB.", es: "Modifica tu respuesta de arriba y vuelve a pulsar \xABComprobar\xBB.", nl: "Pas je antwoord hierboven aan en klik opnieuw op \u201CControleren\u201D." }),
  "Ta conjugaison est correcte au futur simple, mais la question demande le futur proche. Au futur simple, le verbe est conjugu\xE9 en un seul mot (\xAB tu mangeras \xBB). Au futur proche, on utilise \xAB aller \xBB au pr\xE9sent suivi de l\u2019infinitif (\xAB tu vas manger \xBB).": withDutchVariants({ de: "Deine Konjugation ist im Futur I richtig, aber gefragt ist das nahe Futur. Im Futur I wird das Verb in einem Wort konjugiert (\u201Etu mangeras\u201C). F\xFCr das nahe Futur verwendet man \u201Ealler\u201C im Pr\xE4sens mit dem Infinitiv (\u201Etu vas manger\u201C).", en: "Your conjugation is correct in the simple future, but the question asks for the near future. In the simple future, the verb is conjugated as one word (\u201Ctu mangeras\u201D). The near future uses the present tense of \u201Caller\u201D followed by the infinitive (\u201Ctu vas manger\u201D).", it: "La coniugazione \xE8 corretta al futuro semplice, ma la domanda richiede il futuro prossimo. Al futuro semplice il verbo \xE8 coniugato in una sola parola (\xABtu mangeras\xBB). Il futuro prossimo usa \xABaller\xBB al presente seguito dall\u2019infinito (\xABtu vas manger\xBB).", es: "La conjugaci\xF3n es correcta en futuro simple, pero la pregunta pide el futuro pr\xF3ximo. En futuro simple, el verbo se conjuga en una sola palabra (\xABtu mangeras\xBB). El futuro pr\xF3ximo usa \xABaller\xBB en presente seguido del infinitivo (\xABtu vas manger\xBB).", nl: "Je vervoeging is juist in de futur simple, maar de vraag vraagt de futur proche. In de futur simple wordt het werkwoord als \xE9\xE9n woord vervoegd (\u201Ctu mangeras\u201D). De futur proche gebruikt de tegenwoordige tijd van \u201Caller\u201D, gevolgd door de infinitief (\u201Ctu vas manger\u201D)." }),
  "Futur proche ou futur simple ?": withDutchVariants({ de: "Nahes Futur oder Futur I?", en: "Near future or simple future?", it: "Futuro prossimo o futuro semplice?", es: "\xBFFuturo pr\xF3ximo o futuro simple?", nl: "Futur proche of futur simple?" }),
  "Bravo, c\u2019est juste !": withDutchVariants({ de: "Bravo, das ist richtig!", en: "Well done, that\u2019s correct!", it: "Bravo, \xE8 corretto!", es: "\xA1Muy bien, es correcto!", nl: "Goed gedaan, dat is juist!" }),
  "Pas tout \xE0 fait.": withDutchVariants({ de: "Nicht ganz.", en: "Not quite.", it: "Non proprio.", es: "No del todo.", nl: "Niet helemaal." }),
  "Ta r\xE9ponse": withDutchVariants({ de: "Deine Antwort", en: "Your answer", it: "La tua risposta", es: "Tu respuesta", nl: "Jouw antwoord" }),
  "La r\xE9ponse attendue \xE9tait :": withDutchVariants({ de: "Die erwartete Antwort war:", en: "The expected answer was:", it: "La risposta attesa era:", es: "La respuesta esperada era:", nl: "Het verwachte antwoord was:" }),
  "On peut aussi r\xE9pondre :": withDutchVariants({ de: "Auch m\xF6glich:", en: "Another possible answer is:", it: "Si pu\xF2 anche rispondere:", es: "Tambi\xE9n se puede responder:", nl: "Een ander mogelijk antwoord is:" }),
  "Tu peux passer \xE0 la question suivante.": withDutchVariants({ de: "Du kannst zur n\xE4chsten Frage gehen.", en: "You can move on to the next question.", it: "Puoi passare alla domanda successiva.", es: "Puedes pasar a la pregunta siguiente.", nl: "Je kunt verdergaan met de volgende vraag." }),
  "Correction": withDutchVariants({ de: "Korrektur", en: "Correction", it: "Correzione", es: "Correcci\xF3n", nl: "Verbetering" }),
  "Bonne r\xE9ponse": withDutchVariants({ de: "Richtige Antwort", en: "Correct answer", it: "Risposta corretta", es: "Respuesta correcta", nl: "Juist antwoord" }),
  "Bilan de la s\xE9ance": withDutchVariants({ de: "Sitzungsbilanz", en: "Session report", it: "Bilancio della sessione", es: "Balance de la sesi\xF3n", nl: "Verslag van de sessie" }),
  "Mes erreurs": withDutchVariants({ de: "Meine Fehler", en: "My mistakes", it: "I miei errori", es: "Mis errores", nl: "Mijn fouten" }),
  "Mes r\xE9ussites": withDutchVariants({ de: "Meine Erfolge", en: "My correct answers", it: "Le mie risposte corrette", es: "Mis aciertos", nl: "Mijn juiste antwoorden" }),
  "Aucune r\xE9ussite dans cette s\xE9ance.": withDutchVariants({ de: "Keine richtige Antwort in dieser Sitzung.", en: "No correct answers in this session.", it: "Nessuna risposta corretta in questa sessione.", es: "Ning\xFAn acierto en esta sesi\xF3n.", nl: "Geen juiste antwoorden in deze sessie." }),
  "R\xE9ponse donn\xE9e": withDutchVariants({ de: "Gegebene Antwort", en: "Answer given", it: "Risposta data", es: "Respuesta dada", nl: "Gegeven antwoord" }),
  "Question suivante": withDutchVariants({ de: "N\xE4chste Frage", en: "Next question", it: "Domanda successiva", es: "Pregunta siguiente", nl: "Volgende vraag" }),
  "Recommencer": withDutchVariants({ de: "Neu starten", en: "Start again", it: "Ricomincia", es: "Empezar de nuevo", nl: "Opnieuw beginnen" }),
  "R\xE9capitulatif des r\xE9ponses": withDutchVariants({ de: "Antwort\xFCbersicht", en: "Answer summary", it: "Riepilogo delle risposte", es: "Resumen de respuestas", nl: "Overzicht van de antwoorden" }),
  "R\xE9sultat": withDutchVariants({ de: "Ergebnis", en: "Result", it: "Risultato", es: "Resultado", nl: "Resultaat" }),
  "Excellent !": withDutchVariants({ de: "Ausgezeichnet!", en: "Excellent!", it: "Eccellente!", es: "\xA1Excelente!", nl: "Uitstekend!" }),
  "Bravo !": withDutchVariants({ de: "Bravo!", en: "Well done!", it: "Bravo!", es: "\xA1Muy bien!", nl: "Goed gedaan!" }),
  "Bel effort !": withDutchVariants({ de: "Gute Leistung!", en: "Good effort!", it: "Ottimo impegno!", es: "\xA1Buen esfuerzo!", nl: "Goed geprobeerd!" }),
  "Continue, tu progresses !": withDutchVariants({ de: "Weiter so, du machst Fortschritte!", en: "Keep going, you\u2019re making progress!", it: "Continua cos\xEC, stai migliorando!", es: "\xA1Sigue as\xED, est\xE1s progresando!", nl: "Doe zo voort, je gaat vooruit!" }),
  "Quitter": withDutchVariants({ de: "Beenden", en: "Leave", it: "Esci", es: "Salir", nl: "Verlaten" }),
  "Quitter l\u2019exercice": withDutchVariants({ de: "\xDCbung verlassen", en: "Leave the exercise", it: "Esci dall\u2019esercizio", es: "Salir del ejercicio", nl: "De oefening verlaten" }),
  "Quitter l\u2019exercice ?": withDutchVariants({ de: "\xDCbung verlassen?", en: "Leave the exercise?", it: "Uscire dall\u2019esercizio?", es: "\xBFSalir del ejercicio?", nl: "De oefening verlaten?" }),
  "Quitter le chat": withDutchVariants({ de: "Chat verlassen", en: "Leave the chat", it: "Esci dalla chat", es: "Salir del chat", nl: "De chat verlaten" }),
  "Quitter le chat ?": withDutchVariants({ de: "Chat verlassen?", en: "Leave the chat?", it: "Uscire dalla chat?", es: "\xBFSalir del chat?", nl: "De chat verlaten?" }),
  "Continuer l\u2019exercice": withDutchVariants({ de: "\xDCbung fortsetzen", en: "Continue the exercise", it: "Continua l\u2019esercizio", es: "Continuar el ejercicio", nl: "Verdergaan met de oefening" }),
  "Impossible de pr\xE9parer de nouvelles questions. Le d\xE9fi actuel reste disponible.": withDutchVariants({ de: "Neue Fragen konnten nicht vorbereitet werden. Die aktuelle \xDCbung bleibt verf\xFCgbar.", en: "New questions could not be prepared. The current challenge remains available.", it: "Impossibile preparare nuove domande. L\u2019esercizio attuale rimane disponibile.", es: "No se han podido preparar nuevas preguntas. El ejercicio actual sigue disponible.", nl: "Er konden geen nieuwe vragen worden voorbereid. De huidige uitdaging blijft beschikbaar." }),
  "Ta progression actuelle sera perdue.": withDutchVariants({ de: "Dein aktueller Fortschritt geht verloren.", en: "Your current progress will be lost.", it: "I progressi attuali andranno persi.", es: "Perder\xE1s tu progreso actual.", nl: "Je huidige voortgang gaat verloren." }),
  "Besoin d\u2019un coup de pouce ?": withDutchVariants({ de: "Brauchst du einen Tipp?", en: "Need a hint?", it: "Hai bisogno di un suggerimento?", es: "\xBFNecesitas una pista?", nl: "Een tip nodig?" }),
  "Les deux r\xE9ponses sont tr\xE8s diff\xE9rentes : observe d\u2019abord la construction compl\xE8te.": withDutchVariants({ de: "Die beiden Antworten unterscheiden sich stark: Schau dir zuerst die vollst\xE4ndige Konstruktion an.", en: "The two answers are very different: first look at the complete construction.", it: "Le due risposte sono molto diverse: osserva prima la costruzione completa.", es: "Las dos respuestas son muy diferentes: observa primero la construcci\xF3n completa.", nl: "De twee antwoorden verschillen sterk. Bekijk eerst de volledige opbouw." }),
  "Ouvrir l\u2019aide": withDutchVariants({ de: "Hilfe \xF6ffnen", en: "Open help", it: "Apri l\u2019aiuto", es: "Abrir la ayuda", nl: "Hulp openen" }),
  "Cr\xE9ation du bilan": withDutchVariants({ de: "Auswertung wird erstellt", en: "Creating summary", it: "Creazione del riepilogo", es: "Creando resumen", nl: "Overzicht wordt aangemaakt" }),
  "Bilan du d\xE9fi": withDutchVariants({ de: "\xDCbungsauswertung", en: "Challenge summary", it: "Riepilogo dell\u2019esercizio", es: "Resumen del ejercicio", nl: "Overzicht van de uitdaging" }),
  "Tu veux refaire ce d\xE9fi ?": withDutchVariants({ de: "M\xF6chtest du diese \xDCbung wiederholen?", en: "Would you like to repeat this challenge?", it: "Vuoi ripetere questo esercizio?", es: "\xBFQuieres repetir este ejercicio?", nl: "Wil je deze uitdaging opnieuw maken?" }),
  "Avec les m\xEAmes questions": withDutchVariants({ de: "Mit denselben Fragen", en: "With the same questions", it: "Con le stesse domande", es: "Con las mismas preguntas", nl: "Met dezelfde vragen" }),
  "Imprimer le bilan": withDutchVariants({ de: "Auswertung drucken", en: "Print summary", it: "Stampa il riepilogo", es: "Imprimir el resumen", nl: "Overzicht afdrukken" }),
  "Partager mon bilan": withDutchVariants({ de: "Meine Auswertung teilen", en: "Share my summary", it: "Condividi il mio riepilogo", es: "Compartir mi resumen", nl: "Mijn overzicht delen" }),
  "Imprimer mon bilan": withDutchVariants({ de: "Meine Auswertung drucken", en: "Print my summary", it: "Stampa il mio riepilogo", es: "Imprimir mi resumen", nl: "Mijn overzicht afdrukken" }),
  "PARTAGER MON BILAN": withDutchVariants({ de: "MEINE AUSWERTUNG TEILEN", en: "SHARE MY SUMMARY", it: "CONDIVIDI IL MIO RIEPILOGO", es: "COMPARTIR MI RESUMEN", nl: "MIJN OVERZICHT DELEN" }),
  "Ton bilan est pr\xEAt \xE0 \xEAtre envoy\xE9": withDutchVariants({ de: "Deine Auswertung kann verschickt werden", en: "Your summary is ready to send", it: "Il tuo riepilogo \xE8 pronto per essere inviato", es: "Tu resumen est\xE1 listo para enviar", nl: "Je overzicht is klaar om te versturen" }),
  "Il te suffit d\u2019envoyer ce lien \xE0 la personne de ton choix, par e-mail, WhatsApp ou tout autre moyen. En l\u2019ouvrant, elle verra directement ton bilan. Le lien restera disponible pendant un mois.": withDutchVariants({ de: "Sende diesen Link einfach per E-Mail, WhatsApp oder auf einem anderen Weg an die Person deiner Wahl. Beim \xD6ffnen sieht sie direkt deine Auswertung. Der Link bleibt einen Monat lang verf\xFCgbar.", en: "Simply send this link to anyone you choose by email, WhatsApp or any other means. When they open it, they will see your summary directly. The link will remain available for one month.", it: "Invia questo link alla persona che preferisci via e-mail, WhatsApp o con qualsiasi altro mezzo. Aprendolo, vedr\xE0 direttamente il tuo riepilogo. Il link rester\xE0 disponibile per un mese.", es: "Solo tienes que enviar este enlace a quien quieras por correo electr\xF3nico, WhatsApp o cualquier otro medio. Al abrirlo, ver\xE1 directamente tu resumen. El enlace estar\xE1 disponible durante un mes.", nl: "Stuur deze link gewoon naar wie je wilt via e-mail, WhatsApp of een ander kanaal. Wie de link opent, ziet meteen je overzicht. De link blijft een maand beschikbaar." }),
  "Cr\xE9ation du lien\u2026": withDutchVariants({ de: "Link wird erstellt\u2026", en: "Creating link\u2026", it: "Creazione del link\u2026", es: "Creando el enlace\u2026", nl: "Link wordt aangemaakt\u2026" }),
  "Lien complet \xE0 envoyer": withDutchVariants({ de: "Vollst\xE4ndiger Link zum Versenden", en: "Full link to send", it: "Link completo da inviare", es: "Enlace completo para enviar", nl: "Volledige link om te versturen" }),
  "Copier le lien": withDutchVariants({ de: "Link kopieren", en: "Copy link", it: "Copia il link", es: "Copiar el enlace", nl: "Link kopi\xEBren" }),
  "Partager avec une application\u2026": withDutchVariants({ de: "Mit einer App teilen\u2026", en: "Share with an app\u2026", it: "Condividi con un\u2019app\u2026", es: "Compartir con una aplicaci\xF3n\u2026", nl: "Delen met een app\u2026" }),
  "Toute personne qui poss\xE8de ce lien peut consulter le bilan.": withDutchVariants({ de: "Jede Person mit diesem Link kann die Auswertung ansehen.", en: "Anyone with this link can view the summary.", it: "Chiunque possieda questo link pu\xF2 consultare il riepilogo.", es: "Cualquier persona que tenga este enlace puede consultar el resumen.", nl: "Iedereen met deze link kan het overzicht bekijken." }),
  "Le lien du bilan n\u2019a pas pu \xEAtre cr\xE9\xE9.": withDutchVariants({ de: "Der Link zur Auswertung konnte nicht erstellt werden.", en: "The summary link could not be created.", it: "Non \xE8 stato possibile creare il link del riepilogo.", es: "No se ha podido crear el enlace del resumen.", nl: "De link naar het overzicht kon niet worden aangemaakt." }),
  "Mon bilan de conjugaison": withDutchVariants({ de: "Meine Konjugationsauswertung", en: "My conjugation summary", it: "Il mio riepilogo di coniugazione", es: "Mi resumen de conjugaci\xF3n", nl: "Mijn vervoegingsoverzicht" }),
  "Voici mon bilan de conjugaison.": withDutchVariants({ de: "Hier ist meine Konjugationsauswertung.", en: "Here is my conjugation summary.", it: "Ecco il mio riepilogo di coniugazione.", es: "Aqu\xED est\xE1 mi resumen de conjugaci\xF3n.", nl: "Hier is mijn vervoegingsoverzicht." }),
  "Bilan introuvable": withDutchVariants({ de: "Auswertung nicht gefunden", en: "Summary not found", it: "Riepilogo non trovato", es: "Resumen no encontrado", nl: "Overzicht niet gevonden" }),
  "Bilan de conjugaison partag\xE9": withDutchVariants({ de: "Geteilte Konjugationsauswertung", en: "Shared conjugation summary", it: "Riepilogo di coniugazione condiviso", es: "Resumen de conjugaci\xF3n compartido", nl: "Gedeeld vervoegingsoverzicht" }),
  "Consulter un bilan de conjugaison partag\xE9.": withDutchVariants({ de: "Eine geteilte Konjugationsauswertung ansehen.", en: "View a shared conjugation summary.", it: "Consulta un riepilogo di coniugazione condiviso.", es: "Consulta un resumen de conjugaci\xF3n compartido.", nl: "Bekijk een gedeeld vervoegingsoverzicht." }),
  "BILAN PARTAG\xC9": withDutchVariants({ de: "GETEILTE AUSWERTUNG", en: "SHARED SUMMARY", it: "RIEPILOGO CONDIVISO", es: "RESUMEN COMPARTIDO", nl: "GEDEELD OVERZICHT" }),
  "Bilan de conjugaison": withDutchVariants({ de: "Konjugationsauswertung", en: "Conjugation summary", it: "Riepilogo di coniugazione", es: "Resumen de conjugaci\xF3n", nl: "Vervoegingsoverzicht" }),
  "Bilan r\xE9alis\xE9 le {date}": withDutchVariants({ de: "Auswertung vom {date}", en: "Summary completed on {date}", it: "Riepilogo completato il {date}", es: "Resumen realizado el {date}", nl: "Overzicht voltooid op {date}" }),
  "Contenu de l\u2019exercice": withDutchVariants({ de: "Inhalt der \xDCbung", en: "Exercise content", it: "Contenuto dell\u2019esercizio", es: "Contenido del ejercicio", nl: "Inhoud van de oefening" }),
  "Glisse vers le bas pour voir l\u2019aide.": withDutchVariants({ de: "Wische nach unten, um die Hilfe zu sehen.", en: "Swipe down to see the help.", it: "Scorri verso il basso per vedere l\u2019aiuto.", es: "Desliza hacia abajo para ver la ayuda.", nl: "Veeg naar beneden om de hulp te zien." }),
  "N'oublie pas le pronom !": withDutchVariants({ de: "Vergiss das Pronomen nicht!", en: "Don't forget the pronoun!", it: "Non dimenticare il pronome!", es: "\xA1No olvides el pronombre!", nl: "Vergeet het voornaamwoord niet!" }),
  "\xC0 l'imp\xE9ratif, la personne est indiqu\xE9e, mais n'\xE9cris pas le pronom.": withDutchVariants({ de: "Beim Imperativ ist die Person angegeben, aber schreibe das Pronomen nicht.", en: "For the imperative, the person is shown, but don't write the pronoun.", it: "Nell\u2019imperativo la persona \xE8 indicata, ma non scrivere il pronome.", es: "En el imperativo se indica la persona, pero no escribas el pronombre.", nl: "Bij de gebiedende wijs wordt de persoon getoond, maar schrijf je het voornaamwoord niet." }),
  "Il manque le pronom": withDutchVariants({ de: "Das Pronomen fehlt", en: "The pronoun is missing", it: "Manca il pronome", es: "Falta el pronombre", nl: "Het voornaamwoord ontbreekt" }),
  "Type de faute": withDutchVariants({ de: "Fehlertyp", en: "Error type", it: "Tipo di errore", es: "Tipo de error", nl: "Soort fout" }),
  "Types de faute": withDutchVariants({ de: "Fehlertypen", en: "Error types", it: "Tipi di errore", es: "Tipos de error", nl: "Soorten fouten" }),
  "Choisis ton coach": withDutchVariants({ de: "W\xE4hle deinen Coach", en: "Choose your coach", it: "Scegli il tuo coach", es: "Elige tu coach", nl: "Kies je coach" }),
  "Ces coaches sont des personnages virtuels automatis\xE9s.": withDutchVariants({ de: "Diese Coaches sind automatisierte virtuelle Figuren.", en: "These coaches are automated virtual characters.", it: "Questi coach sono personaggi virtuali automatizzati.", es: "Estos coaches son personajes virtuales automatizados.", nl: "Deze coaches zijn geautomatiseerde virtuele personages." }),
  "Un avatar, un pr\xE9nom ou un \xE2ge ne prouvent jamais l\u2019identit\xE9 d\u2019une personne sur Internet.": withDutchVariants({ de: "Ein Avatar, Vorname oder Alter beweist niemals die Identit\xE4t einer Person im Internet.", en: "An avatar, first name or age never proves a person\u2019s identity online.", it: "Un avatar, un nome o un\u2019et\xE0 non provano mai l\u2019identit\xE0 di una persona su Internet.", es: "Un avatar, un nombre o una edad nunca demuestran la identidad de una persona en Internet.", nl: "Een avatar, voornaam of leeftijd bewijst online nooit iemands identiteit." }),
  "Aime :": withDutchVariants({ de: "Mag:", en: "Likes:", it: "Gli piace:", es: "Le gusta:", nl: "Houdt van:" }),
  "Chargement des coaches\u2026": withDutchVariants({ de: "Coaches werden geladen\u2026", en: "Loading coaches\u2026", it: "Caricamento dei coach\u2026", es: "Cargando coaches\u2026", nl: "Coaches worden geladen\u2026" }),
  "Impossible de charger les coaches.": withDutchVariants({ de: "Die Coaches konnten nicht geladen werden.", en: "The coaches could not be loaded.", it: "Impossibile caricare i coach.", es: "No se han podido cargar los coaches.", nl: "De coaches konden niet worden geladen." }),
  "Type d\u2019aide": withDutchVariants({ de: "Art der Hilfe", en: "Type of help", it: "Tipo di aiuto", es: "Tipo de ayuda", nl: "Soort hulp" }),
  "Aper\xE7u du bilan": withDutchVariants({ de: "Vorschau der Auswertung", en: "Summary preview", it: "Anteprima del riepilogo", es: "Vista previa del resumen", nl: "Voorbeeld van het overzicht" }),
  "Aper\xE7u du bilan au format PDF": withDutchVariants({ de: "Vorschau der Auswertung als PDF", en: "PDF summary preview", it: "Anteprima del riepilogo in PDF", es: "Vista previa del resumen en PDF", nl: "PDF-voorbeeld van het overzicht" }),
  "BILAN DU D\xC9FI": withDutchVariants({ de: "\xDCBUNGSAUSWERTUNG", en: "CHALLENGE SUMMARY", it: "RIEPILOGO DELL\u2019ESERCIZIO", es: "RESUMEN DEL EJERCICIO", nl: "OVERZICHT VAN DE UITDAGING" }),
  "BILAN DU D\xC9FI \u2014 SUITE": withDutchVariants({ de: "\xDCBUNGSAUSWERTUNG \u2014 FORTSETZUNG", en: "CHALLENGE SUMMARY \u2014 CONTINUED", it: "RIEPILOGO DELL\u2019ESERCIZIO \u2014 SEGUITO", es: "RESUMEN DEL EJERCICIO \u2014 CONTINUACI\xD3N", nl: "OVERZICHT VAN DE UITDAGING \u2014 VERVOLG" }),
  "R\xC9PONSE DONN\xC9E": withDutchVariants({ de: "GEGEBENE ANTWORT", en: "ANSWER GIVEN", it: "RISPOSTA DATA", es: "RESPUESTA DADA", nl: "GEGEVEN ANTWOORD" }),
  "BONNE R\xC9PONSE": withDutchVariants({ de: "RICHTIGE ANTWORT", en: "CORRECT ANSWER", it: "RISPOSTA CORRETTA", es: "RESPUESTA CORRECTA", nl: "JUIST ANTWOORD" }),
  "Impossible de g\xE9n\xE9rer le bilan PDF.": withDutchVariants({ de: "Die PDF-Auswertung konnte nicht erstellt werden.", en: "The PDF summary could not be generated.", it: "Impossibile generare il riepilogo PDF.", es: "No se ha podido generar el resumen en PDF.", nl: "Het PDF-overzicht kon niet worden gegenereerd." }),
  "L\u2019aper\xE7u du bilan n\u2019a pas pu \xEAtre cr\xE9\xE9.": withDutchVariants({ de: "Die Vorschau der Auswertung konnte nicht erstellt werden.", en: "The summary preview could not be created.", it: "Impossibile creare l\u2019anteprima del riepilogo.", es: "No se ha podido crear la vista previa del resumen.", nl: "Het voorbeeld van het overzicht kon niet worden aangemaakt." }),
  "Aide": withDutchVariants({ de: "Hilfe", en: "Help", it: "Aiuto", es: "Ayuda", nl: "Hulp" }),
  "Fermer l\u2019aide": withDutchVariants({ de: "Hilfe schlie\xDFen", en: "Close help", it: "Chiudi l\u2019aiuto", es: "Cerrar la ayuda", nl: "Hulp sluiten" }),
  "Retour sur l\u2019aide automatique": withDutchVariants({ de: "Feedback zur automatischen Hilfe", en: "Feedback on automated help", it: "Feedback sull\u2019aiuto automatico", es: "Comentarios sobre la ayuda autom\xE1tica", nl: "Feedback over automatische hulp" }),
  "Cette aide est g\xE9n\xE9r\xE9e automatiquement. Elle peut contenir une erreur ou manquer de clart\xE9. Les retours permettent de l\u2019am\xE9liorer.": withDutchVariants({ de: "Diese Hilfe wird automatisch erstellt. Sie kann Fehler enthalten oder unklar sein. R\xFCckmeldungen helfen, sie zu verbessern.", en: "This help is generated automatically. It may contain an error or lack clarity. Feedback helps improve it.", it: "Questo aiuto \xE8 generato automaticamente. Pu\xF2 contenere errori o essere poco chiaro. I feedback aiutano a migliorarlo.", es: "Esta ayuda se genera autom\xE1ticamente. Puede contener errores o no ser clara. Los comentarios ayudan a mejorarla.", nl: "Deze hulp wordt automatisch gegenereerd. Ze kan een fout bevatten of onduidelijk zijn. Feedback helpt om ze te verbeteren." }),
  "Changer de niveau d\u2019aide": withDutchVariants({ de: "Hilfeniveau wechseln", en: "Change help level", it: "Cambia livello di aiuto", es: "Cambiar el nivel de ayuda", nl: "Hulpniveau wijzigen" }),
  "Approfondir sans voir la r\xE9ponse": withDutchVariants({ de: "Vertiefen, ohne die Antwort zu sehen", en: "Go deeper without seeing the answer", it: "Approfondisci senza vedere la risposta", es: "Profundizar sin ver la respuesta", nl: "Verder verdiepen zonder het antwoord te zien" }),
  "Ces coaches analysent la question plus pr\xE9cis\xE9ment et te guident \xE9tape par \xE9tape, sans r\xE9v\xE9ler la r\xE9ponse.": withDutchVariants({ de: "Diese Coaches untersuchen die Aufgabe genauer und f\xFChren dich Schritt f\xFCr Schritt, ohne die Antwort zu verraten.", en: "These coaches analyse the question more closely and guide you step by step without revealing the answer.", it: "Questi coach analizzano la domanda pi\xF9 precisamente e ti guidano passo dopo passo, senza rivelare la risposta.", es: "Estos coaches analizan la pregunta con m\xE1s precisi\xF3n y te gu\xEDan paso a paso sin revelar la respuesta.", nl: "Deze coaches analyseren de vraag grondiger en begeleiden je stap voor stap zonder het antwoord te geven." }),
  "\xCAtre guid\xE9 jusqu\u2019\xE0 la r\xE9ponse": withDutchVariants({ de: "Bis zur Antwort begleitet werden", en: "Be guided all the way to the answer", it: "Fatti guidare fino alla risposta", es: "Recibir ayuda hasta llegar a la respuesta", nl: "Laat je begeleiden tot aan het antwoord" }),
  "Ces coaches reprennent chaque \xE9tape avec toi et montrent la r\xE9ponse en l\u2019expliquant.": withDutchVariants({ de: "Diese Coaches gehen jeden Schritt mit dir durch und zeigen die Antwort mit einer Erkl\xE4rung.", en: "These coaches go through every step with you and show the answer with an explanation.", it: "Questi coach ripercorrono ogni passaggio con te e mostrano la risposta spiegandola.", es: "Estos coaches repasan cada paso contigo y muestran la respuesta explic\xE1ndola.", nl: "Deze coaches doorlopen alle stappen met jou en tonen het antwoord met uitleg." }),
  "Le changement s\u2019applique imm\xE9diatement \xE0 cette question.": withDutchVariants({ de: "Der Wechsel gilt sofort f\xFCr diese Aufgabe.", en: "The change applies to this question immediately.", it: "Il cambiamento si applica subito a questa domanda.", es: "El cambio se aplica inmediatamente a esta pregunta.", nl: "De wijziging geldt meteen voor deze vraag." }),
  "Choisir {name}": withDutchVariants({ de: "{name} ausw\xE4hlen", en: "Choose {name}", it: "Scegli {name}", es: "Elegir a {name}", nl: "{name} kiezen" }),
  "Retour sur cette aide": withDutchVariants({ de: "Feedback zu dieser Hilfe", en: "Feedback on this help", it: "Feedback su questo aiuto", es: "Comentarios sobre esta ayuda", nl: "Feedback over deze hulp" }),
  "Remarque optionnelle": withDutchVariants({ de: "Optionale Anmerkung", en: "Optional comment", it: "Nota facoltativa", es: "Comentario opcional", nl: "Optionele opmerking" }),
  "Pr\xE9cision utile pour corriger ou am\xE9liorer l\u2019aide\u2026": withDutchVariants({ de: "N\xFCtzlicher Hinweis zur Korrektur oder Verbesserung der Hilfe\u2026", en: "Useful detail for correcting or improving the help\u2026", it: "Dettaglio utile per correggere o migliorare l\u2019aiuto\u2026", es: "Detalle \xFAtil para corregir o mejorar la ayuda\u2026", nl: "Nuttige informatie om de hulp te verbeteren of aan te passen\u2026" }),
  "Retour enregistr\xE9.": withDutchVariants({ de: "Feedback gespeichert.", en: "Feedback saved.", it: "Feedback salvato.", es: "Comentarios guardados.", nl: "Feedback opgeslagen." }),
  "Retour impossible pour le moment.": withDutchVariants({ de: "Feedback ist derzeit nicht m\xF6glich.", en: "Feedback is currently unavailable.", it: "Il feedback non \xE8 disponibile al momento.", es: "Los comentarios no est\xE1n disponibles en este momento.", nl: "Feedback is momenteel niet beschikbaar." }),
  "Pas clair": withDutchVariants({ de: "Unklar", en: "Unclear", it: "Poco chiaro", es: "Poco claro", nl: "Onduidelijk" }),
  "Utile": withDutchVariants({ de: "Hilfreich", en: "Helpful", it: "Utile", es: "\xDAtil", nl: "Nuttig" }),
  "Erreur": withDutchVariants({ de: "Fehler", en: "Error", it: "Errore", es: "Error", nl: "Fout" }),
  "Remarque": withDutchVariants({ de: "Anmerkung", en: "Comment", it: "Nota", es: "Comentario", nl: "Opmerking" }),
  "Aide s\xE9curis\xE9e": withDutchVariants({ de: "Abgesicherte Hilfe", en: "Safeguarded help", it: "Aiuto protetto", es: "Ayuda protegida", nl: "Gecontroleerde hulp" }),
  "D\xE9finition": withDutchVariants({ de: "Definition", en: "Definition", it: "Definizione", es: "Definici\xF3n", nl: "Definitie" }),
  "Envoi\u2026": withDutchVariants({ de: "Wird gesendet\u2026", en: "Sending\u2026", it: "Invio\u2026", es: "Enviando\u2026", nl: "Wordt verstuurd\u2026" }),
  "Envoyer le retour": withDutchVariants({ de: "Feedback senden", en: "Send feedback", it: "Invia feedback", es: "Enviar comentarios", nl: "Feedback versturen" }),
  "Une incoh\xE9rence a \xE9t\xE9 d\xE9tect\xE9e dans l\u2019explication d\xE9taill\xE9e. La r\xE9ponse officielle \xE0 retenir est :": withDutchVariants({ de: "In der ausf\xFChrlichen Erkl\xE4rung wurde eine Unstimmigkeit festgestellt. Die ma\xDFgebliche richtige Antwort lautet:", en: "An inconsistency was found in the detailed explanation. The official answer to remember is:", it: "\xC8 stata rilevata un\u2019incoerenza nella spiegazione dettagliata. La risposta ufficiale da ricordare \xE8:", es: "Se ha detectado una incoherencia en la explicaci\xF3n detallada. La respuesta oficial que debes recordar es:", nl: "Er is een tegenstrijdigheid gevonden in de gedetailleerde uitleg. Het juiste antwoord om te onthouden is:" }),
  "Une incoh\xE9rence a \xE9t\xE9 d\xE9tect\xE9e dans cette explication. Rep\xE8re le temps et la personne, cherche le radical, puis choisis la terminaison correspondante.": withDutchVariants({ de: "In dieser Erkl\xE4rung wurde eine Unstimmigkeit festgestellt. Bestimme Zeitform und Person, suche den Stamm und w\xE4hle dann die passende Endung.", en: "An inconsistency was found in this explanation. Identify the tense and person, find the stem, then choose the corresponding ending.", it: "\xC8 stata rilevata un\u2019incoerenza in questa spiegazione. Individua il tempo e la persona, trova la radice, poi scegli la desinenza corrispondente.", es: "Se ha detectado una incoherencia en esta explicaci\xF3n. Identifica el tiempo y la persona, busca la ra\xEDz y elige la terminaci\xF3n correspondiente.", nl: "Er is een tegenstrijdigheid gevonden in deze uitleg. Bepaal de tijd en de persoon, zoek de stam en kies daarna de bijbehorende uitgang." }),
  "Groupe du verbe": withDutchVariants({ de: "Verbgruppe", en: "Verb group", it: "Gruppo del verbo", es: "Grupo del verbo", nl: "Werkwoordgroep" }),
  "Verbe aller": withDutchVariants({ de: "Das Verb aller", en: "The verb aller", it: "Il verbo aller", es: "El verbo aller", nl: "Het werkwoord aller" }),
  "La lettre G": withDutchVariants({ de: "Der Buchstabe G", en: "The letter G", it: "La lettera G", es: "La letra G", nl: "De letter G" }),
  "La lettre C et la c\xE9dille": withDutchVariants({ de: "Der Buchstabe C und die Cedille", en: "The letter C and the cedilla", it: "La lettera C e la cediglia", es: "La letra C y la cedilla", nl: "De letter C en de cedille" }),
  "Le COD plac\xE9 avant": withDutchVariants({ de: "Das vorangestellte direkte Objekt", en: "The direct object placed before the verb", it: "Il complemento oggetto posto prima", es: "El complemento directo colocado antes", nl: "Het lijdend voorwerp voor het werkwoord" }),
  "Accord du participe pass\xE9": withDutchVariants({ de: "Angleichung des Partizips Perfekt", en: "Past participle agreement", it: "Concordanza del participio passato", es: "Concordancia del participio pasado", nl: "Overeenkomst van het voltooid deelwoord" }),
  "Verbe pronominal": withDutchVariants({ de: "Reflexives Verb", en: "Pronominal verb", it: "Verbo pronominale", es: "Verbo pronominal", nl: "Wederkerend werkwoord" }),
  "Indicatif": withDutchVariants({ de: "Indikativ", en: "Indicative", it: "Indicativo", es: "Indicativo", nl: "Indicatief" }),
  "Reconna\xEEtre les modes": withDutchVariants({ de: "Modi erkennen", en: "Recognise moods", it: "Riconoscere i modi", es: "Reconocer los modos", nl: "Wijzen herkennen" }),
  "D\xE9finition du verbe": withDutchVariants({ de: "Definition des Verbs", en: "Verb definition", it: "Definizione del verbo", es: "Definici\xF3n del verbo", nl: "Definitie van het werkwoord" }),
  "Choisis le mode": withDutchVariants({ de: "W\xE4hle den Modus", en: "Choose the mood", it: "Scegli il modo", es: "Elige el modo", nl: "Kies de wijs" }),
  "Modes": withDutchVariants({ de: "Modi", en: "Moods", it: "Modi", es: "Modos", nl: "Wijzen" }),
  "Choisis le temps": withDutchVariants({ de: "W\xE4hle die Zeitform", en: "Choose the tense", it: "Scegli il tempo", es: "Elige el tiempo", nl: "Kies de tijd" }),
  "\xC9cris ta r\xE9ponse ou clique directement sur le mode correct": withDutchVariants({ de: "Schreibe deine Antwort oder klicke direkt auf den richtigen Modus", en: "Write your answer or click the correct mood directly", it: "Scrivi la risposta o fai clic direttamente sul modo corretto", es: "Escribe tu respuesta o haz clic directamente en el modo correcto", nl: "Schrijf je antwoord of klik rechtstreeks op de juiste wijs" }),
  "\xC9cris ta r\xE9ponse ou clique directement sur le mode puis sur le temps correct": withDutchVariants({ de: "Schreibe deine Antwort oder klicke direkt auf den richtigen Modus und dann auf die richtige Zeitform", en: "Write your answer or click the correct mood and then the correct tense", it: "Scrivi la risposta o fai clic direttamente sul modo e poi sul tempo corretto", es: "Escribe tu respuesta o haz clic directamente en el modo y despu\xE9s en el tiempo correcto", nl: "Schrijf je antwoord of klik op de juiste wijs en daarna op de juiste tijd" }),
  "\xC9cris ta r\xE9ponse": withDutchVariants({ de: "Schreibe deine Antwort", en: "Type your answer", it: "Scrivi la tua risposta", es: "Escribe tu respuesta", nl: "Typ je antwoord" }),
  "Subjonctif": withDutchVariants({ de: "Subjonktiv", en: "Subjunctive", it: "Congiuntivo", es: "Subjuntivo", nl: "Subjonctief" }),
  "Conditionnel": withDutchVariants({ de: "Konditional", en: "Conditional", it: "Condizionale", es: "Condicional", nl: "Conditionnel" }),
  "Imp\xE9ratif": withDutchVariants({ de: "Imperativ", en: "Imperative", it: "Imperativo", es: "Imperativo", nl: "Gebiedende wijs" }),
  "Infinitif": withDutchVariants({ de: "Infinitiv", en: "Infinitive", it: "Infinito", es: "Infinitivo", nl: "Infinitief" }),
  "Participe": withDutchVariants({ de: "Partizip", en: "Participle", it: "Participio", es: "Participio", nl: "Deelwoord" }),
  "G\xE9rondif": withDutchVariants({ de: "Gerundium", en: "Gerund", it: "Gerundio", es: "Gerundio", nl: "G\xE9rondif" }),
  "pr\xE9sent": withDutchVariants({ de: "Pr\xE4sens", en: "present", it: "presente", es: "presente", nl: "tegenwoordige tijd" }),
  "pass\xE9": withDutchVariants({ de: "Vergangenheit", en: "past", it: "passato", es: "pasado", nl: "verleden tijd" }),
  "futur proche": withDutchVariants({ de: "nahes Futur", en: "near future", it: "futuro prossimo", es: "futuro pr\xF3ximo", nl: "futur proche" }),
  "futur simple": withDutchVariants({ de: "Futur I", en: "simple future", it: "futuro semplice", es: "futuro simple", nl: "futur simple" }),
  "futur": withDutchVariants({ de: "Futur", en: "future", it: "futuro", es: "futuro", nl: "futur" }),
  "pass\xE9 compos\xE9": withDutchVariants({ de: "Pass\xE9 compos\xE9", en: "perfect tense", it: "passato prossimo", es: "pret\xE9rito perfecto", nl: "pass\xE9 compos\xE9" }),
  "imparfait": withDutchVariants({ de: "Imparfait", en: "imperfect", it: "imperfetto", es: "pret\xE9rito imperfecto", nl: "imparfait" }),
  "plus-que-parfait": withDutchVariants({ de: "Plusquamperfekt", en: "pluperfect", it: "trapassato prossimo", es: "pret\xE9rito pluscuamperfecto", nl: "plus-que-parfait" }),
  "pass\xE9 simple": withDutchVariants({ de: "Pass\xE9 simple", en: "simple past", it: "passato remoto", es: "pret\xE9rito indefinido", nl: "pass\xE9 simple" }),
  "pass\xE9 ant\xE9rieur": withDutchVariants({ de: "Pass\xE9 ant\xE9rieur", en: "past anterior", it: "trapassato remoto", es: "pret\xE9rito anterior", nl: "pass\xE9 ant\xE9rieur" }),
  "futur ant\xE9rieur": withDutchVariants({ de: "Futur II", en: "future perfect", it: "futuro anteriore", es: "futuro perfecto", nl: "futur ant\xE9rieur" }),
  "pass\xE9 premi\xE8re forme": withDutchVariants({ de: "Vergangenheit, erste Form", en: "past, first form", it: "passato, prima forma", es: "pasado, primera forma", nl: "verleden tijd, eerste vorm" }),
  "pass\xE9 deuxi\xE8me forme": withDutchVariants({ de: "Vergangenheit, zweite Form", en: "past, second form", it: "passato, seconda forma", es: "pasado, segunda forma", nl: "verleden tijd, tweede vorm" }),
  "Choisis les verbes": withDutchVariants({ de: "W\xE4hle die Verben", en: "Choose the verbs", it: "Scegli i verbi", es: "Elige los verbos", nl: "Kies de werkwoorden" }),
  "Verbes du d\xE9fi": withDutchVariants({ de: "Verben der \xDCbung", en: "Challenge verbs", it: "Verbi dell\u2019esercizio", es: "Verbos del ejercicio", nl: "Werkwoorden van de uitdaging" }),
  "Choisis les modes et les temps": withDutchVariants({ de: "W\xE4hle Modi und Zeitformen", en: "Choose moods and tenses", it: "Scegli modi e tempi", es: "Elige modos y tiempos", nl: "Kies wijzen en tijden" }),
  "Choisis les temps": withDutchVariants({ de: "W\xE4hle die Zeitformen", en: "Choose the tenses", it: "Scegli i tempi", es: "Elige los tiempos", nl: "Kies de tijden" }),
  "\xC0 choisir": withDutchVariants({ de: "Auszuw\xE4hlen", en: "To choose", it: "Da scegliere", es: "Por elegir", nl: "Te kiezen" }),
  "{count} choisi": withDutchVariants({ de: "{count} ausgew\xE4hlt", en: "{count} selected", it: "{count} selezionato", es: "{count} seleccionado", nl: "{count} geselecteerd" }),
  "{count} choisis": withDutchVariants({ de: "{count} ausgew\xE4hlt", en: "{count} selected", it: "{count} selezionati", es: "{count} seleccionados", nl: "{count} geselecteerd" }),
  "Aucun verbe s\xE9lectionn\xE9": withDutchVariants({ de: "Kein Verb ausgew\xE4hlt", en: "No verb selected", it: "Nessun verbo selezionato", es: "Ning\xFAn verbo seleccionado", nl: "Geen werkwoord geselecteerd" }),
  "Verbes retenus": withDutchVariants({ de: "Ausgew\xE4hlte Verben", en: "Selected verbs", it: "Verbi selezionati", es: "Verbos seleccionados", nl: "Geselecteerde werkwoorden" }),
  "Charger": withDutchVariants({ de: "Laden", en: "Load", it: "Carica", es: "Cargar", nl: "Laden" }),
  "Pr\xE9paration\u2026": withDutchVariants({ de: "Vorbereitung\u2026", en: "Preparing\u2026", it: "Preparazione\u2026", es: "Preparando\u2026", nl: "Wordt voorbereid\u2026" }),
  "Classique": withDutchVariants({ de: "Klassisch", en: "Classic", it: "Classica", es: "Cl\xE1sica", nl: "Klassiek" }),
  "Avec un coach": withDutchVariants({ de: "Mit einem Coach", en: "With a coach", it: "Con un coach", es: "Con un coach", nl: "Met een coach" }),
  "Imprimer": withDutchVariants({ de: "Drucken", en: "Print", it: "Stampa", es: "Imprimir", nl: "Afdrukken" }),
  "Partager": withDutchVariants({ de: "Teilen", en: "Share", it: "Condividi", es: "Compartir", nl: "Delen" }),
  "Sauvegarde\u2026": withDutchVariants({ de: "Wird gespeichert\u2026", en: "Saving\u2026", it: "Salvataggio\u2026", es: "Guardando\u2026", nl: "Wordt opgeslagen\u2026" }),
  "R\xE9sultats": withDutchVariants({ de: "Ergebnisse", en: "Results", it: "Risultati", es: "Resultados", nl: "Resultaten" }),
  "Question {current} sur {total}": withDutchVariants({ de: "Frage {current} von {total}", en: "Question {current} of {total}", it: "Domanda {current} di {total}", es: "Pregunta {current} de {total}", nl: "Vraag {current} van {total}" }),
  "Voir mes r\xE9sultats": withDutchVariants({ de: "Meine Ergebnisse ansehen", en: "View my results", it: "Vedi i miei risultati", es: "Ver mis resultados", nl: "Mijn resultaten bekijken" }),
  "Forme conjugu\xE9e de {verb}": withDutchVariants({ de: "Konjugierte Form von {verb}", en: "Conjugated form of {verb}", it: "Forma coniugata di {verb}", es: "Forma conjugada de {verb}", nl: "Vervoegde vorm van {verb}" }),
  "Rappel de la r\xE8gle": withDutchVariants({ de: "Regelerinnerung", en: "Rule reminder", it: "Promemoria della regola", es: "Recordatorio de la regla", nl: "Herhaling van de regel" }),
  "Attention au temps et au mode": withDutchVariants({ de: "Achte auf Zeitform und Modus", en: "Check the tense and mood", it: "Attenzione al tempo e al modo", es: "Atenci\xF3n al tiempo y al modo", nl: "Controleer de tijd en de wijs" }),
  "Attention \xE0 la personne": withDutchVariants({ de: "Achte auf die Person", en: "Check the person", it: "Attenzione alla persona", es: "Atenci\xF3n a la persona", nl: "Controleer de persoon" }),
  "Avec \xAB je \xBB ou \xAB tu \xBB, une forme conjugu\xE9e ne peut pas se terminer par \xAB -t \xBB ou \xAB -d \xBB.": withDutchVariants({
    de: "Mit \xAB je \xBB oder \xAB tu \xBB kann eine konjugierte Form nicht auf \xAB -t \xBB oder \xAB -d \xBB enden.",
    en: "With \u201Cje\u201D or \u201Ctu\u201D, a conjugated form cannot end in \u201C-t\u201D or \u201C-d\u201D.",
    it: "Con \xAB je \xBB o \xAB tu \xBB, una forma coniugata non pu\xF2 terminare in \xAB -t \xBB o \xAB -d \xBB.",
    es: "Con \xAB je \xBB o \xAB tu \xBB, una forma conjugada no puede terminar en \xAB -t \xBB o \xAB -d \xBB.",
    nl: "Bij \u201Cje\u201D of \u201Ctu\u201D kan een vervoegde vorm niet eindigen op \u201C-t\u201D of \u201C-d\u201D."
  }),
  "Avec \xAB il \xBB, \xAB elle \xBB ou \xAB iel \xBB, une forme conjugu\xE9e ne peut pas se terminer par \xAB -s \xBB ou \xAB -x \xBB.": withDutchVariants({
    de: "Mit \xAB il \xBB, \xAB elle \xBB oder \xAB iel \xBB kann eine konjugierte Form nicht auf \xAB -s \xBB oder \xAB -x \xBB enden.",
    en: "With \u201Cil\u201D, \u201Celle\u201D or \u201Ciel\u201D, a conjugated form cannot end in \u201C-s\u201D or \u201C-x\u201D.",
    it: "Con \xAB il \xBB, \xAB elle \xBB o \xAB iel \xBB, una forma coniugata non pu\xF2 terminare in \xAB -s \xBB o \xAB -x \xBB.",
    es: "Con \xAB il \xBB, \xAB elle \xBB o \xAB iel \xBB, una forma conjugada no puede terminar en \xAB -s \xBB o \xAB -x \xBB.",
    nl: "Bij \u201Cil\u201D, \u201Celle\u201D of \u201Ciel\u201D kan een vervoegde vorm niet eindigen op \u201C-s\u201D of \u201C-x\u201D."
  }),
  "Dans un temps compos\xE9, c\u2019est l\u2019auxiliaire qui se conjugue. Avec \xAB je \xBB ou \xAB tu \xBB, il ne peut pas se terminer par \xAB -t \xBB ou \xAB -d \xBB.": withDutchVariants({
    de: "In einer zusammengesetzten Zeitform wird das Hilfsverb konjugiert. Mit \xAB je \xBB oder \xAB tu \xBB kann es nicht auf \xAB -t \xBB oder \xAB -d \xBB enden.",
    en: "In a compound tense, the auxiliary is conjugated. With \u201Cje\u201D or \u201Ctu\u201D, it cannot end in \u201C-t\u201D or \u201C-d\u201D.",
    it: "In un tempo composto si coniuga l\u2019ausiliare. Con \xAB je \xBB o \xAB tu \xBB, non pu\xF2 terminare in \xAB -t \xBB o \xAB -d \xBB.",
    es: "En un tiempo compuesto se conjuga el auxiliar. Con \xAB je \xBB o \xAB tu \xBB, no puede terminar en \xAB -t \xBB o \xAB -d \xBB.",
    nl: "In een samengestelde tijd wordt het hulpwerkwoord vervoegd. Bij \u201Cje\u201D of \u201Ctu\u201D kan het niet eindigen op \u201C-t\u201D of \u201C-d\u201D."
  }),
  "Dans un temps compos\xE9, c\u2019est l\u2019auxiliaire qui se conjugue. Avec \xAB il \xBB, \xAB elle \xBB ou \xAB iel \xBB, il ne peut pas se terminer par \xAB -s \xBB ou \xAB -x \xBB.": withDutchVariants({
    de: "In einer zusammengesetzten Zeitform wird das Hilfsverb konjugiert. Mit \xAB il \xBB, \xAB elle \xBB oder \xAB iel \xBB kann es nicht auf \xAB -s \xBB oder \xAB -x \xBB enden.",
    en: "In a compound tense, the auxiliary is conjugated. With \u201Cil\u201D, \u201Celle\u201D or \u201Ciel\u201D, it cannot end in \u201C-s\u201D or \u201C-x\u201D.",
    it: "In un tempo composto si coniuga l\u2019ausiliare. Con \xAB il \xBB, \xAB elle \xBB o \xAB iel \xBB, non pu\xF2 terminare in \xAB -s \xBB o \xAB -x \xBB.",
    es: "En un tiempo compuesto se conjuga el auxiliar. Con \xAB il \xBB, \xAB elle \xBB o \xAB iel \xBB, no puede terminar en \xAB -s \xBB o \xAB -x \xBB.",
    nl: "In een samengestelde tijd wordt het hulpwerkwoord vervoegd. Bij \u201Cil\u201D, \u201Celle\u201D of \u201Ciel\u201D kan het niet eindigen op \u201C-s\u201D of \u201C-x\u201D."
  }),
  "Ta forme est correcte pour le mode {sourceMode}, au temps {sourceTense}. Ici, il fallait le mode {targetMode}, au temps {targetTense}.": withDutchVariants({
    de: "Deine Form ist im Modus {sourceMode} und in der Zeitform {sourceTense} richtig. Hier war der Modus {targetMode} in der Zeitform {targetTense} gefragt.",
    en: "Your form is correct in the {sourceMode} mood and the {sourceTense} tense. Here, the required mood was {targetMode} and the tense was {targetTense}.",
    it: "La tua forma \xE8 corretta nel modo {sourceMode}, al tempo {sourceTense}. Qui servivano il modo {targetMode} e il tempo {targetTense}.",
    es: "Tu forma es correcta en el modo {sourceMode}, en el tiempo {sourceTense}. Aqu\xED se ped\xEDan el modo {targetMode} y el tiempo {targetTense}.",
    nl: "Je vorm is juist in de wijs {sourceMode} en de tijd {sourceTense}. Hier werd de wijs {targetMode} en de tijd {targetTense} gevraagd."
  }),
  "{correct} bonnes r\xE9ponses sur {total}": withDutchVariants({ de: "{correct} richtige Antworten von {total}", en: "{correct} correct answers out of {total}", it: "{correct} risposte corrette su {total}", es: "{correct} respuestas correctas de {total}", nl: "{correct} juiste antwoorden op {total}" }),
  "{correct} bonne r\xE9ponse sur {total}": withDutchVariants({ de: "{correct} richtige Antwort von {total}", en: "{correct} correct answer out of {total}", it: "{correct} risposta corretta su {total}", es: "{correct} respuesta correcta de {total}", nl: "{correct} juist antwoord op {total}" }),
  "Juste au deuxi\xE8me essai": withDutchVariants({ de: "Beim zweiten Versuch richtig", en: "Correct on the second try", it: "Corretta al secondo tentativo", es: "Correcta al segundo intento", nl: "Juist bij de tweede poging" }),
  "Juste": withDutchVariants({ de: "Richtig", en: "Correct", it: "Corretta", es: "Correcta", nl: "Juist" }),
  "\xC0 revoir": withDutchVariants({ de: "Noch einmal ansehen", en: "Review", it: "Da rivedere", es: "Para repasar", nl: "Herhalen" }),
  "{count} coach": withDutchVariants({ de: "{count} Coach", en: "{count} coach", it: "{count} coach", es: "{count} coach", nl: "{count} coach" }),
  "{count} coaches": withDutchVariants({ de: "{count} Coaches", en: "{count} coaches", it: "{count} coach", es: "{count} coaches", nl: "{count} coaches" }),
  "Avatar de {name}": withDutchVariants({ de: "Avatar von {name}", en: "{name}\u2019s avatar", it: "Avatar di {name}", es: "Avatar de {name}", nl: "Avatar van {name}" }),
  "\xC9cris ta r\xE9ponse\u2026": withDutchVariants({ de: "Schreibe deine Antwort\u2026", en: "Type your answer\u2026", it: "Scrivi la tua risposta\u2026", es: "Escribe tu respuesta\u2026", nl: "Typ je antwoord\u2026" }),
  "\xC9cris ta r\xE9ponse ou \xAB Aide \xBB\u2026": withDutchVariants({ de: "Schreibe deine Antwort oder \u201EHilfe\u201C\u2026", en: "Type your answer or \u201CHelp\u201D\u2026", it: "Scrivi la tua risposta o \xABAiuto\xBB\u2026", es: "Escribe tu respuesta o \xABAyuda\xBB\u2026", nl: "Typ je antwoord of \u201CHulp\u201D\u2026" }),
  "Question\u2026": withDutchVariants({ de: "Frage\u2026", en: "Question\u2026", it: "Domanda\u2026", es: "Pregunta\u2026", nl: "Vraag\u2026" }),
  "R\xE9ponse\u2026": withDutchVariants({ de: "Antwort\u2026", en: "Answer\u2026", it: "Risposta\u2026", es: "Respuesta\u2026", nl: "Antwoord\u2026" }),
  "Suite\u2026": withDutchVariants({ de: "Weiter\u2026", en: "Next\u2026", it: "Avanti\u2026", es: "Siguiente\u2026", nl: "Volgende\u2026" }),
  "Envoyer": withDutchVariants({ de: "Senden", en: "Send", it: "Invia", es: "Enviar", nl: "Versturen" }),
  "Avec d\u2019autres questions": withDutchVariants({ de: "Mit anderen Fragen", en: "With different questions", it: "Con altre domande", es: "Con otras preguntas", nl: "Met andere vragen" }),
  "Revenir \xE0 l\u2019aide de la derni\xE8re question": withDutchVariants({ de: "Zur Hilfe der letzten Frage zur\xFCckkehren", en: "Return to help for the last question", it: "Torna all\u2019aiuto dell\u2019ultima domanda", es: "Volver a la ayuda de la \xFAltima pregunta", nl: "Terug naar de hulp bij de laatste vraag" }),
  "Revenir \xE0 l\u2019aide de la question actuelle": withDutchVariants({ de: "Zur Hilfe der aktuellen Frage zur\xFCckkehren", en: "Return to help for the current question", it: "Torna all\u2019aiuto della domanda attuale", es: "Volver a la ayuda de la pregunta actual", nl: "Terug naar de hulp bij de huidige vraag" }),
  "Voir l\u2019aide de la derni\xE8re question": withDutchVariants({ de: "Hilfe zur letzten Frage anzeigen", en: "View help for the last question", it: "Vedi l\u2019aiuto dell\u2019ultima domanda", es: "Ver la ayuda de la \xFAltima pregunta", nl: "Hulp bij de laatste vraag bekijken" }),
  "Voir l\u2019aide de la question actuelle": withDutchVariants({ de: "Hilfe zur aktuellen Frage anzeigen", en: "View help for the current question", it: "Vedi l\u2019aiuto della domanda attuale", es: "Ver la ayuda de la pregunta actual", nl: "Hulp bij de huidige vraag bekijken" }),
  "Voir l\u2019aide de la question {number} pour la r\xE9ponse {answer}": withDutchVariants({ de: "Hilfe zu Frage {number} f\xFCr die Antwort {answer} anzeigen", en: "View help for question {number} for the answer {answer}", it: "Vedi l\u2019aiuto della domanda {number} per la risposta {answer}", es: "Ver la ayuda de la pregunta {number} para la respuesta {answer}", nl: "Hulp bij vraag {number} bekijken voor het antwoord {answer}" }),
  "Voir l\u2019aide de la question {number} : {question}": withDutchVariants({ de: "Hilfe zu Frage {number} anzeigen: {question}", en: "View help for question {number}: {question}", it: "Vedi l\u2019aiuto della domanda {number}: {question}", es: "Ver la ayuda de la pregunta {number}: {question}", nl: "Hulp bij vraag {number} bekijken: {question}" }),
  "Tu peux regarder l\u2019aide \xE0 droite pour trouver un indice.": withDutchVariants({ de: "In der Hilfe rechts findest du einen Hinweis.", en: "You can look at the help panel on the right for a hint.", it: "Puoi guardare l\u2019aiuto a destra per trovare un indizio.", es: "Puedes consultar la ayuda de la derecha para encontrar una pista.", nl: "Je kunt in het hulppaneel rechts een tip vinden." }),
  "Si tu veux un indice, tape \xAB Aide \xBB dans le champ de r\xE9ponse": withDutchVariants({ de: "Wenn du einen Hinweis m\xF6chtest, schreibe \u201EHilfe\u201C in das Antwortfeld", en: "If you want a hint, type \u201CHelp\u201D in the answer field", it: "Se vuoi un indizio, scrivi \xABAiuto\xBB nel campo della risposta", es: "Si quieres una pista, escribe \xABAyuda\xBB en el campo de respuesta", nl: "Als je een tip wilt, typ dan \u201CHulp\u201D in het antwoordveld" }),
  ", ou clique sur ce bouton :": withDutchVariants({ de: ", oder klicke auf diese Schaltfl\xE4che:", en: ", or click this button:", it: ", oppure fai clic su questo pulsante:", es: ", o haz clic en este bot\xF3n:", nl: ", of klik op deze knop:" }),
  "Regarde o\xF9 \xE7a change :": withDutchVariants({ de: "Schau, wo es sich unterscheidet:", en: "Look at what changes:", it: "Guarda che cosa cambia:", es: "Mira qu\xE9 cambia:", nl: "Kijk wat er verandert:" }),
  "Repars de la correction compl\xE8te :": withDutchVariants({ de: "Gehe von der vollst\xE4ndigen Korrektur aus:", en: "Start again from the full correction:", it: "Riparti dalla correzione completa:", es: "Vuelve a partir de la correcci\xF3n completa:", nl: "Vertrek opnieuw van de volledige verbetering:" }),
  "Apprendre la conjugaison": withDutchVariants({ de: "Franz\xF6sische Konjugation lernen", en: "Learn French conjugation", it: "Imparare la coniugazione francese", es: "Aprender la conjugaci\xF3n francesa", nl: "Franse vervoeging leren" }),
  "Une synth\xE8se claire des r\xE8gles essentielles de la conjugaison fran\xE7aise.": withDutchVariants({ de: "Eine klare \xDCbersicht \xFCber die wichtigsten Regeln der franz\xF6sischen Konjugation.", en: "A clear overview of the essential rules of French conjugation.", it: "Una sintesi chiara delle regole essenziali della coniugazione francese.", es: "Un resumen claro de las reglas esenciales de la conjugaci\xF3n francesa.", nl: "Een duidelijk overzicht van de belangrijkste regels van de Franse vervoeging." }),
  "Les r\xE8gles essentielles": withDutchVariants({ de: "Die wichtigsten Regeln", en: "The essential rules", it: "Le regole essenziali", es: "Las reglas esenciales", nl: "De belangrijkste regels" }),
  "Apprendre la conjugaison fran\xE7aise": withDutchVariants({ de: "Franz\xF6sische Konjugation lernen", en: "Learn French conjugation", it: "Imparare la coniugazione francese", es: "Aprender la conjugaci\xF3n francesa", nl: "Franse vervoeging leren" }),
  "Sommaire des r\xE8gles": withDutchVariants({ de: "\xDCbersicht der Regeln", en: "Rules overview", it: "Indice delle regole", es: "\xCDndice de las reglas", nl: "Overzicht van de regels" }),
  "Comprendre le verbe": withDutchVariants({ de: "Das Verb verstehen", en: "Understand the verb", it: "Capire il verbo", es: "Entender el verbo", nl: "Het werkwoord begrijpen" }),
  "Radical, terminaison, groupes et auxiliaires.": withDutchVariants({ de: "Stamm, Endung, Gruppen und Hilfsverben.", en: "Stem, ending, groups and auxiliaries.", it: "Radice, desinenza, gruppi e ausiliari.", es: "Ra\xEDz, terminaci\xF3n, grupos y auxiliares.", nl: "Stam, uitgang, groepen en hulpwerkwoorden." }),
  "Former les temps": withDutchVariants({ de: "Zeitformen bilden", en: "Form the tenses", it: "Formare i tempi", es: "Formar los tiempos", nl: "De tijden vormen" }),
  "Les rep\xE8res pour construire les temps simples et compos\xE9s.": withDutchVariants({ de: "Orientierung zur Bildung einfacher und zusammengesetzter Zeitformen.", en: "Guidance for forming simple and compound tenses.", it: "Indicazioni per formare i tempi semplici e composti.", es: "Pautas para formar los tiempos simples y compuestos.", nl: "Hulp bij het vormen van enkelvoudige en samengestelde tijden." }),
  "Choisir le bon mode": withDutchVariants({ de: "Den richtigen Modus w\xE4hlen", en: "Choose the right mood", it: "Scegliere il modo giusto", es: "Elegir el modo adecuado", nl: "De juiste wijs kiezen" }),
  "Indicatif, subjonctif, conditionnel et imp\xE9ratif.": withDutchVariants({ de: "Indikativ, Subjonctif, Konditional und Imperativ.", en: "Indicative, subjunctive, conditional and imperative.", it: "Indicativo, congiuntivo, condizionale e imperativo.", es: "Indicativo, subjuntivo, condicional e imperativo.", nl: "Indicatief, subjonctief, conditionnel en gebiedende wijs." }),
  "R\xE9ussir les accords": withDutchVariants({ de: "\xDCbereinstimmungen meistern", en: "Master agreement", it: "Padroneggiare le concordanze", es: "Dominar las concordancias", nl: "De overeenkomst beheersen" }),
  "Sujet, auxiliaires et participe pass\xE9.": withDutchVariants({ de: "Subjekt, Hilfsverben und Partizip Perfekt.", en: "Subject, auxiliaries and past participle.", it: "Soggetto, ausiliari e participio passato.", es: "Sujeto, auxiliares y participio pasado.", nl: "Onderwerp, hulpwerkwoorden en voltooid deelwoord." }),
  "\xC9viter les pi\xE8ges": withDutchVariants({ de: "Stolperfallen vermeiden", en: "Avoid pitfalls", it: "Evitare le insidie", es: "Evitar las trampas", nl: "Valkuilen vermijden" }),
  "Modifications du radical et terminaisons \xE0 surveiller.": withDutchVariants({ de: "Stamm\xE4nderungen und Endungen, auf die du achten solltest.", en: "Stem changes and endings to watch out for.", it: "Modifiche della radice e desinenze da controllare.", es: "Cambios de ra\xEDz y terminaciones que hay que vigilar.", nl: "Stamveranderingen en uitgangen om op te letten." }),
  "Les fondations": withDutchVariants({ de: "Die Grundlagen", en: "The foundations", it: "Le basi", es: "Los fundamentos", nl: "De basis" }),
  "Radical + terminaison": withDutchVariants({ de: "Stamm + Endung", en: "Stem + ending", it: "Radice + desinenza", es: "Ra\xEDz + terminaci\xF3n", nl: "Stam + uitgang" }),
  "Une forme conjugu\xE9e associe g\xE9n\xE9ralement un radical, qui porte le sens, et une terminaison, qui indique la personne, le mode et le temps.": withDutchVariants({ de: "Eine konjugierte Form verbindet meist einen bedeutungstragenden Stamm mit einer Endung, die Person, Modus und Zeitform angibt.", en: "A conjugated form usually combines a stem, which carries the meaning, with an ending that indicates person, mood and tense.", it: "Una forma coniugata unisce generalmente una radice, che porta il significato, e una desinenza, che indica persona, modo e tempo.", es: "Una forma conjugada suele unir una ra\xEDz, que aporta el significado, y una terminaci\xF3n, que indica persona, modo y tiempo.", nl: "Een vervoegde vorm bestaat meestal uit een stam, die de betekenis draagt, en een uitgang die de persoon, wijs en tijd aangeeft." }),
  "Les trois groupes": withDutchVariants({ de: "Die drei Gruppen", en: "The three groups", it: "I tre gruppi", es: "Los tres grupos", nl: "De drie groepen" }),
  "1er groupe :": withDutchVariants({ de: "1. Gruppe:", en: "1st group:", it: "1\xBA gruppo:", es: "1.er grupo:", nl: "1e groep:" }),
  "2e groupe :": withDutchVariants({ de: "2. Gruppe:", en: "2nd group:", it: "2\xBA gruppo:", es: "2.\xBA grupo:", nl: "2e groep:" }),
  "3e groupe :": withDutchVariants({ de: "3. Gruppe:", en: "3rd group:", it: "3\xBA gruppo:", es: "3.er grupo:", nl: "3e groep:" }),
  "verbes en -er, sauf aller.": withDutchVariants({ de: "Verben auf -er, au\xDFer aller.", en: "verbs ending in -er, except aller.", it: "verbi in -er, tranne aller.", es: "verbos en -er, excepto aller.", nl: "werkwoorden op -er, behalve aller." }),
  "verbes en -ir faisant -issons.": withDutchVariants({ de: "Verben auf -ir, deren nous-Form auf -issons endet.", en: "verbs ending in -ir whose nous form ends in -issons.", it: "verbi in -ir che alla forma nous terminano in -issons.", es: "verbos en -ir cuya forma nous termina en -issons.", nl: "werkwoorden op -ir waarvan de nous-vorm eindigt op -issons." }),
  "tous les autres verbes, souvent irr\xE9guliers.": withDutchVariants({ de: "alle anderen, oft unregelm\xE4\xDFigen Verben.", en: "all other verbs, which are often irregular.", it: "tutti gli altri verbi, spesso irregolari.", es: "todos los dem\xE1s verbos, a menudo irregulares.", nl: "alle andere werkwoorden, die vaak onregelmatig zijn." }),
  "\xCAtre et avoir": withDutchVariants({ de: "\xCAtre und avoir", en: "\xCAtre and avoir", it: "\xCAtre e avoir", es: "\xCAtre y avoir", nl: "\xCAtre en avoir" }),
  "Ces deux verbes ont leurs propres conjugaisons et servent aussi d\u2019auxiliaires pour former les temps compos\xE9s.": withDutchVariants({ de: "Diese beiden Verben haben eigene Konjugationen und dienen auch als Hilfsverben zur Bildung zusammengesetzter Zeiten.", en: "These two verbs have their own conjugations and also serve as auxiliaries for compound tenses.", it: "Questi due verbi hanno coniugazioni proprie e servono anche da ausiliari per formare i tempi composti.", es: "Estos dos verbos tienen conjugaciones propias y tambi\xE9n sirven de auxiliares para formar los tiempos compuestos.", nl: "Deze twee werkwoorden hebben hun eigen vervoeging en dienen ook als hulpwerkwoorden voor samengestelde tijden." }),
  "auxiliaire + participe pass\xE9": withDutchVariants({ de: "Hilfsverb + Partizip Perfekt", en: "auxiliary + past participle", it: "ausiliare + participio passato", es: "auxiliar + participio pasado", nl: "hulpwerkwoord + voltooid deelwoord" }),
  "La construction": withDutchVariants({ de: "Der Aufbau", en: "Formation", it: "La costruzione", es: "La formaci\xF3n", nl: "Vorming" }),
  "Formation des principaux temps": withDutchVariants({ de: "Bildung der wichtigsten Zeitformen", en: "Formation of the main tenses", it: "Formazione dei tempi principali", es: "Formaci\xF3n de los tiempos principales", nl: "Vorming van de belangrijkste tijden" }),
  "Construction": withDutchVariants({ de: "Bildung", en: "Formation", it: "Formazione", es: "Formaci\xF3n", nl: "Vorming" }),
  "Exemple": withDutchVariants({ de: "Beispiel", en: "Example", it: "Esempio", es: "Ejemplo", nl: "Voorbeeld" }),
  "radical + terminaisons du pr\xE9sent": withDutchVariants({ de: "Stamm + Pr\xE4sensendungen", en: "stem + present-tense endings", it: "radice + desinenze del presente", es: "ra\xEDz + terminaciones del presente", nl: "stam + uitgangen van de tegenwoordige tijd" }),
  "radical de \xAB nous \xBB au pr\xE9sent + -ais, -ais, -ait, -ions, -iez, -aient": withDutchVariants({ de: "Stamm der nous-Form im Pr\xE4sens + -ais, -ais, -ait, -ions, -iez, -aient", en: "stem of the present nous form + -ais, -ais, -ait, -ions, -iez, -aient", it: "radice della forma nous al presente + -ais, -ais, -ait, -ions, -iez, -aient", es: "ra\xEDz de la forma nous del presente + -ais, -ais, -ait, -ions, -iez, -aient", nl: "stam van de nous-vorm in de tegenwoordige tijd + -ais, -ais, -ait, -ions, -iez, -aient" }),
  "infinitif, ou radical irr\xE9gulier, + -ai, -as, -a, -ons, -ez, -ont": withDutchVariants({ de: "Infinitiv oder unregelm\xE4\xDFiger Stamm + -ai, -as, -a, -ons, -ez, -ont", en: "infinitive, or irregular stem, + -ai, -as, -a, -ons, -ez, -ont", it: "infinito, o radice irregolare, + -ai, -as, -a, -ons, -ez, -ont", es: "infinitivo, o ra\xEDz irregular, + -ai, -as, -a, -ons, -ez, -ont", nl: "infinitief, of onregelmatige stam, + -ai, -as, -a, -ons, -ez, -ont" }),
  "radical du futur + terminaisons de l\u2019imparfait": withDutchVariants({ de: "Futurstamm + Imparfait-Endungen", en: "future stem + imperfect endings", it: "radice del futuro + desinenze dell\u2019imperfetto", es: "ra\xEDz del futuro + terminaciones del imperfecto", nl: "stam van de futur + uitgangen van de imparfait" }),
  "auxiliaire conjugu\xE9 + participe pass\xE9": withDutchVariants({ de: "konjugiertes Hilfsverb + Partizip Perfekt", en: "conjugated auxiliary + past participle", it: "ausiliare coniugato + participio passato", es: "auxiliar conjugado + participio pasado", nl: "vervoegd hulpwerkwoord + voltooid deelwoord" }),
  "Le bon r\xE9flexe": withDutchVariants({ de: "Der richtige Reflex", en: "A useful habit", it: "Il riflesso giusto", es: "El buen reflejo", nl: "Een nuttige gewoonte" }),
  "Pour reconna\xEEtre un temps compos\xE9, cherche d\u2019abord une forme de avoir ou d\u2019\xEAtre, puis le participe pass\xE9.": withDutchVariants({ de: "Um eine zusammengesetzte Zeit zu erkennen, suche zuerst eine Form von avoir oder \xEAtre und dann das Partizip Perfekt.", en: "To identify a compound tense, first look for a form of avoir or \xEAtre, then the past participle.", it: "Per riconoscere un tempo composto, cerca prima una forma di avoir o \xEAtre, poi il participio passato.", es: "Para reconocer un tiempo compuesto, busca primero una forma de avoir o \xEAtre y despu\xE9s el participio pasado.", nl: "Zoek om een samengestelde tijd te herkennen eerst een vorm van avoir of \xEAtre en daarna het voltooid deelwoord." }),
  "Le sens": withDutchVariants({ de: "Die Bedeutung", en: "Meaning", it: "Il significato", es: "El significado", nl: "Betekenis" }),
  "Fait": withDutchVariants({ de: "Tatsache", en: "Fact", it: "Fatto", es: "Hecho", nl: "Feit" }),
  "Doute": withDutchVariants({ de: "Zweifel", en: "Doubt", it: "Dubbio", es: "Duda", nl: "Twijfel" }),
  "Hypoth\xE8se": withDutchVariants({ de: "Annahme", en: "Hypothesis", it: "Ipotesi", es: "Hip\xF3tesis", nl: "Veronderstelling" }),
  "Consigne": withDutchVariants({ de: "Aufforderung", en: "Instruction", it: "Istruzione", es: "Instrucci\xF3n", nl: "Instructie" }),
  "Pr\xE9sente un fait, une action certaine ou situ\xE9e dans le temps.": withDutchVariants({ de: "Dr\xFCckt eine Tatsache, eine sichere oder zeitlich eingeordnete Handlung aus.", en: "Presents a fact, a certain action or one situated in time.", it: "Presenta un fatto, un\u2019azione certa o collocata nel tempo.", es: "Presenta un hecho, una acci\xF3n segura o situada en el tiempo.", nl: "Stelt een feit voor, een zekere handeling of een handeling die in de tijd gesitueerd is." }),
  "Exprime notamment le souhait, la n\xE9cessit\xE9, le sentiment ou l\u2019incertitude.": withDutchVariants({ de: "Dr\xFCckt unter anderem Wunsch, Notwendigkeit, Gef\xFChl oder Unsicherheit aus.", en: "Expresses wishes, necessity, feelings or uncertainty, among other things.", it: "Esprime, tra l\u2019altro, desiderio, necessit\xE0, sentimento o incertezza.", es: "Expresa, entre otras cosas, deseo, necesidad, sentimiento o incertidumbre.", nl: "Drukt onder meer wensen, noodzaak, gevoelens of onzekerheid uit." }),
  "Pr\xE9sente une possibilit\xE9, une information incertaine ou une action soumise \xE0 une condition.": withDutchVariants({ de: "Dr\xFCckt eine M\xF6glichkeit, eine unsichere Information oder eine bedingte Handlung aus.", en: "Presents a possibility, uncertain information or an action subject to a condition.", it: "Presenta una possibilit\xE0, un\u2019informazione incerta o un\u2019azione soggetta a una condizione.", es: "Presenta una posibilidad, una informaci\xF3n incierta o una acci\xF3n sujeta a una condici\xF3n.", nl: "Stelt een mogelijkheid, onzekere informatie of een handeling onder een voorwaarde voor." }),
  "Exprime un ordre, un conseil ou une invitation, sans sujet exprim\xE9.": withDutchVariants({ de: "Dr\xFCckt einen Befehl, einen Rat oder eine Einladung ohne genanntes Subjekt aus.", en: "Expresses an order, advice or an invitation, without an explicit subject.", it: "Esprime un ordine, un consiglio o un invito, senza soggetto espresso.", es: "Expresa una orden, un consejo o una invitaci\xF3n, sin sujeto expl\xEDcito.", nl: "Drukt een bevel, advies of uitnodiging uit, zonder uitdrukkelijk onderwerp." }),
  "Les correspondances": withDutchVariants({ de: "Die \xDCbereinstimmungen", en: "Agreement", it: "Le concordanze", es: "Las concordancias", nl: "Overeenkomst" }),
  "Trouver le sujet": withDutchVariants({ de: "Das Subjekt finden", en: "Find the subject", it: "Trovare il soggetto", es: "Encontrar el sujeto", nl: "Zoek het onderwerp" }),
  "Le verbe s\u2019accorde en personne et en nombre avec son sujet, m\xEAme lorsque celui-ci est \xE9loign\xE9.": withDutchVariants({ de: "Das Verb stimmt in Person und Zahl mit seinem Subjekt \xFCberein, auch wenn dieses weit entfernt steht.", en: "The verb agrees in person and number with its subject, even when the subject is far away.", it: "Il verbo concorda in persona e numero con il soggetto, anche quando questo \xE8 lontano.", es: "El verbo concuerda en persona y n\xFAmero con el sujeto, aunque est\xE9 alejado.", nl: "Het werkwoord komt in persoon en getal overeen met het onderwerp, ook als dat ver weg staat." }),
  "Identifier l\u2019auxiliaire": withDutchVariants({ de: "Das Hilfsverb bestimmen", en: "Identify the auxiliary", it: "Individuare l\u2019ausiliare", es: "Identificar el auxiliar", nl: "Herken het hulpwerkwoord" }),
  "Avec \xEAtre, le participe pass\xE9 s\u2019accorde g\xE9n\xE9ralement avec le sujet.": withDutchVariants({ de: "Mit \xEAtre stimmt das Partizip Perfekt normalerweise mit dem Subjekt \xFCberein.", en: "With \xEAtre, the past participle generally agrees with the subject.", it: "Con \xEAtre, il participio passato concorda generalmente con il soggetto.", es: "Con \xEAtre, el participio pasado concuerda generalmente con el sujeto.", nl: "Met \xEAtre komt het voltooid deelwoord meestal overeen met het onderwerp." }),
  "Rep\xE9rer le COD avec avoir": withDutchVariants({ de: "Das direkte Objekt bei avoir erkennen", en: "Identify the direct object with avoir", it: "Individuare il complemento oggetto con avoir", es: "Identificar el complemento directo con avoir", nl: "Herken het lijdend voorwerp bij avoir" }),
  "Avec avoir, le participe pass\xE9 s\u2019accorde avec le COD seulement si celui-ci est plac\xE9 avant.": withDutchVariants({ de: "Mit avoir stimmt das Partizip Perfekt nur dann mit dem direkten Objekt \xFCberein, wenn dieses davorsteht.", en: "With avoir, the past participle agrees with the direct object only when it comes before it.", it: "Con avoir, il participio passato concorda con il complemento oggetto solo se questo \xE8 posto prima.", es: "Con avoir, el participio pasado concuerda con el complemento directo solo si este aparece antes.", nl: "Met avoir komt het voltooid deelwoord alleen overeen met het lijdend voorwerp als dat ervoor staat." }),
  "Verbes pronominaux": withDutchVariants({ de: "Pronominalverben", en: "Pronominal verbs", it: "Verbi pronominali", es: "Verbos pronominales", nl: "Wederkerende werkwoorden" }),
  "Leur accord d\xE9pend de la fonction du pronom. Il faut d\xE9terminer si celui-ci est COD, COI ou fait partie du verbe.": withDutchVariants({ de: "Ihre \xDCbereinstimmung h\xE4ngt von der Funktion des Pronomens ab. Bestimme, ob es direktes Objekt, indirektes Objekt oder Teil des Verbs ist.", en: "Their agreement depends on the function of the pronoun. Determine whether it is a direct object, an indirect object or part of the verb.", it: "La concordanza dipende dalla funzione del pronome. Bisogna stabilire se \xE8 complemento oggetto, complemento indiretto o parte del verbo.", es: "La concordancia depende de la funci\xF3n del pronombre. Hay que determinar si es complemento directo, indirecto o parte del verbo.", nl: "De overeenkomst hangt af van de functie van het voornaamwoord. Bepaal of het een lijdend voorwerp, een meewerkend voorwerp of een deel van het werkwoord is." }),
  "Les pi\xE8ges fr\xE9quents": withDutchVariants({ de: "H\xE4ufige Stolperfallen", en: "Common pitfalls", it: "Le insidie frequenti", es: "Las trampas frecuentes", nl: "Veelvoorkomende valkuilen" }),
  "Pr\xE9server le son et l\u2019orthographe": withDutchVariants({ de: "Laut und Schreibweise bewahren", en: "Preserve sound and spelling", it: "Conservare il suono e l\u2019ortografia", es: "Conservar el sonido y la ortograf\xEDa", nl: "Klank en spelling behouden" }),
  "On ajoute parfois un e apr\xE8s g ou une c\xE9dille pour conserver le son.": withDutchVariants({ de: "Manchmal wird nach g ein e oder unter c eine Cedille erg\xE4nzt, um den Laut zu bewahren.", en: "An e after g or a cedilla is sometimes added to preserve the sound.", it: "A volte si aggiunge una e dopo g o una cediglia per conservare il suono.", es: "A veces se a\xF1ade una e despu\xE9s de g o una cedilla para conservar el sonido.", nl: "Soms wordt een e na g of een cedille toegevoegd om de klank te behouden." }),
  "Le y peut devenir i devant un e muet. Pour certains verbes, les deux graphies sont admises.": withDutchVariants({ de: "Vor einem stummen e kann y zu i werden. Bei manchen Verben sind beide Schreibweisen zul\xE4ssig.", en: "The y may become i before a silent e. For some verbs, both spellings are accepted.", it: "La y pu\xF2 diventare i davanti a una e muta. Per alcuni verbi sono ammesse entrambe le grafie.", es: "La y puede convertirse en i delante de una e muda. En algunos verbos se admiten ambas graf\xEDas.", nl: "De y kan i worden voor een stomme e. Bij sommige werkwoorden worden beide spellingen aanvaard." }),
  "Certains verbes changent l\u2019accent lorsque la syllabe suivante contient un e muet.": withDutchVariants({ de: "Bei manchen Verben \xE4ndert sich der Akzent, wenn die folgende Silbe ein stummes e enth\xE4lt.", en: "Some verbs change their accent when the following syllable contains a silent e.", it: "Alcuni verbi cambiano accento quando la sillaba seguente contiene una e muta.", es: "Algunos verbos cambian el acento cuando la s\xEDlaba siguiente contiene una e muda.", nl: "Sommige werkwoorden veranderen van accent wanneer de volgende lettergreep een stomme e bevat." }),
  "Consonne doubl\xE9e": withDutchVariants({ de: "Doppelter Konsonant", en: "Double consonant", it: "Consonante doppia", es: "Consonante doble", nl: "Dubbele medeklinker" }),
  "Certains verbes en -eler et -eter doublent la consonne ; d\u2019autres prennent un accent grave.": withDutchVariants({ de: "Manche Verben auf -eler und -eter verdoppeln den Konsonanten; andere erhalten einen accent grave.", en: "Some verbs ending in -eler and -eter double the consonant; others take a grave accent.", it: "Alcuni verbi in -eler e -eter raddoppiano la consonante; altri prendono un accento grave.", es: "Algunos verbos en -eler y -eter duplican la consonante; otros llevan acento grave.", nl: "Sommige werkwoorden op -eler en -eter verdubbelen de medeklinker. Andere krijgen een accent grave." }),
  "Remplace le verbe par \xAB vendre \xBB : si \xAB vendu \xBB convient, \xE9cris le participe pass\xE9 ; si \xAB vendre \xBB convient, \xE9cris l\u2019infinitif.": withDutchVariants({ de: "Ersetze das Verb durch \u201Evendre\u201C: Passt \u201Evendu\u201C, schreibe das Partizip Perfekt; passt \u201Evendre\u201C, schreibe den Infinitiv.", en: "Replace the verb with \u201Cvendre\u201D: if \u201Cvendu\u201D works, write the past participle; if \u201Cvendre\u201D works, write the infinitive.", it: "Sostituisci il verbo con \xABvendre\xBB: se va bene \xABvendu\xBB, scrivi il participio passato; se va bene \xABvendre\xBB, scrivi l\u2019infinito.", es: "Sustituye el verbo por \xABvendre\xBB: si encaja \xABvendu\xBB, escribe el participio pasado; si encaja \xABvendre\xBB, escribe el infinitivo.", nl: "Vervang het werkwoord door \u201Cvendre\u201D: past \u201Cvendu\u201D, schrijf dan het voltooid deelwoord; past \u201Cvendre\u201D, schrijf dan de infinitief." }),
  "Le futur exprime ce qui arrivera ; le conditionnel d\xE9pend d\u2019une condition ou att\xE9nue une demande.": withDutchVariants({ de: "Das Futur dr\xFCckt aus, was geschehen wird; das Konditional h\xE4ngt von einer Bedingung ab oder mildert eine Bitte.", en: "The future expresses what will happen; the conditional depends on a condition or softens a request.", it: "Il futuro esprime ci\xF2 che accadr\xE0; il condizionale dipende da una condizione o attenua una richiesta.", es: "El futuro expresa lo que ocurrir\xE1; el condicional depende de una condici\xF3n o suaviza una petici\xF3n.", nl: "De futur drukt uit wat zal gebeuren. De conditionnel hangt af van een voorwaarde of maakt een verzoek beleefder." }),
  "\xC0 toi de jouer": withDutchVariants({ de: "Jetzt bist du dran", en: "Your turn", it: "Tocca a te", es: "Tu turno", nl: "Nu jij" }),
  "Passe de la r\xE8gle \xE0 la pratique": withDutchVariants({ de: "Von der Regel zur Praxis", en: "Put the rules into practice", it: "Passa dalla regola alla pratica", es: "Pasa de la regla a la pr\xE1ctica", nl: "Pas de regels toe" }),
  "Consulte un mod\xE8le complet ou cr\xE9e un exercice cibl\xE9 pour v\xE9rifier ce que tu viens d\u2019apprendre.": withDutchVariants({ de: "Sieh dir ein vollst\xE4ndiges Konjugationsmuster an oder erstelle eine gezielte \xDCbung, um dein Wissen zu pr\xFCfen.", en: "View a full conjugation or create a focused exercise to check what you have just learned.", it: "Consulta un modello completo o crea un esercizio mirato per verificare ci\xF2 che hai appena imparato.", es: "Consulta un modelo completo o crea un ejercicio espec\xEDfico para comprobar lo que acabas de aprender.", nl: "Bekijk een volledige vervoeging of maak een gerichte oefening om te controleren wat je net hebt geleerd." }),
  "Pr\xE9sent": withDutchVariants({ de: "Pr\xE4sens", en: "Present", it: "Presente", es: "Presente", nl: "Tegenwoordige tijd" }),
  "Imparfait": withDutchVariants({ de: "Imparfait", en: "Imperfect", it: "Imperfetto", es: "Pret\xE9rito imperfecto", nl: "Imparfait" }),
  "Futur simple": withDutchVariants({ de: "Futur I", en: "Simple future", it: "Futuro semplice", es: "Futuro simple", nl: "Futur simple" }),
  "Conditionnel pr\xE9sent": withDutchVariants({ de: "Konditional Pr\xE4sens", en: "Present conditional", it: "Condizionale presente", es: "Condicional presente", nl: "Conditionnel pr\xE9sent" }),
  "Temps compos\xE9": withDutchVariants({ de: "Zusammengesetzte Zeit", en: "Compound tense", it: "Tempo composto", es: "Tiempo compuesto", nl: "Samengestelde tijd" }),
  "Charger ce d\xE9fi": withDutchVariants({ de: "Diese \xDCbung laden", en: "Load this challenge", it: "Carica questo esercizio", es: "Cargar este ejercicio", nl: "Deze uitdaging laden" }),
  "Modes et temps": withDutchVariants({ de: "Modi und Zeitformen", en: "Moods and tenses", it: "Modi e tempi", es: "Modos y tiempos", nl: "Wijzen en tijden" }),
  "Verbes choisis": withDutchVariants({ de: "Ausgew\xE4hlte Verben", en: "Selected verbs", it: "Verbi scelti", es: "Verbos elegidos", nl: "Geselecteerde werkwoorden" }),
  "{count} verbe": withDutchVariants({ de: "{count} Verb", en: "{count} verb", it: "{count} verbo", es: "{count} verbo", nl: "{count} werkwoord" }),
  "{count} verbes": withDutchVariants({ de: "{count} Verben", en: "{count} verbs", it: "{count} verbi", es: "{count} verbos", nl: "{count} werkwoorden" }),
  "{count} temps": withDutchVariants({ de: "{count} Zeitformen", en: "{count} tenses", it: "{count} tempi", es: "{count} tiempos", nl: "{count} tijden" }),
  "R\xE9duire": withDutchVariants({ de: "Weniger anzeigen", en: "Show less", it: "Riduci", es: "Mostrar menos", nl: "Minder tonen" }),
  "Voir tout ({count})": withDutchVariants({ de: "Alle anzeigen ({count})", en: "View all ({count})", it: "Vedi tutti ({count})", es: "Ver todos ({count})", nl: "Alles bekijken ({count})" }),
  "Retirer le verbe {verb}": withDutchVariants({ de: "Verb {verb} entfernen", en: "Remove the verb {verb}", it: "Rimuovi il verbo {verb}", es: "Eliminar el verbo {verb}", nl: "Het werkwoord {verb} verwijderen" }),
  "Quel est le mode et le temps de cette forme conjugu\xE9e ?": withDutchVariants({ de: "Welchen Modus und welche Zeitform hat diese konjugierte Form?", en: "What are the mood and tense of this conjugated form?", it: "Quali sono il modo e il tempo di questa forma coniugata?", es: "\xBFCu\xE1les son el modo y el tiempo de esta forma conjugada?", nl: "Wat zijn de wijs en de tijd van deze vervoegde vorm?" }),
  "ou": withDutchVariants({ de: "oder", en: "or", it: "o", es: "o", nl: "of" }),
  "L\u2019autre possibilit\xE9 correcte est \xAB {answer} \xBB.": withDutchVariants({ de: "Die andere richtige M\xF6glichkeit ist \u201E{answer}\u201C.", en: "The other correct answer is \u201C{answer}\u201D.", it: "L\u2019altra possibilit\xE0 corretta \xE8 \xAB{answer}\xBB.", es: "La otra posibilidad correcta es \xAB{answer}\xBB.", nl: "Het andere juiste antwoord is \u201C{answer}\u201D." }),
  "Les autres possibilit\xE9s correctes sont {answers}.": withDutchVariants({ de: "Die anderen richtigen M\xF6glichkeiten sind {answers}.", en: "The other correct answers are {answers}.", it: "Le altre possibilit\xE0 corrette sono {answers}.", es: "Las otras posibilidades correctas son {answers}.", nl: "De andere juiste antwoorden zijn {answers}." }),
  "f\xE9minin": withDutchVariants({ de: "weiblich", en: "feminine", it: "femminile", es: "femenino", nl: "vrouwelijk" }),
  "masculin": withDutchVariants({ de: "m\xE4nnlich", en: "masculine", it: "maschile", es: "masculino", nl: "mannelijk" }),
  "singulier": withDutchVariants({ de: "Singular", en: "singular", it: "singolare", es: "singular", nl: "enkelvoud" }),
  "pluriel": withDutchVariants({ de: "Plural", en: "plural", it: "plurale", es: "plural", nl: "meervoud" }),
  "C\u2019est juste : le COD \xAB {complement} \xBB est plac\xE9 avant le verbe \xAB {verb} \xBB. Avec avoir, le participe pass\xE9 s\u2019accorde donc avec ce COD{features} : \xAB {participle} \xBB.": withDutchVariants({ de: "Richtig: Das direkte Objekt \u201E{complement}\u201C steht vor dem Verb \u201E{verb}\u201C. Mit avoir stimmt das Partizip Perfekt daher mit diesem Objekt{features} \xFCberein: \u201E{participle}\u201C.", en: "Correct: the direct object \u201C{complement}\u201D comes before the verb \u201C{verb}\u201D. With avoir, the past participle therefore agrees with this direct object{features}: \u201C{participle}\u201D.", it: "Giusto: il complemento oggetto \xAB{complement}\xBB \xE8 posto prima del verbo \xAB{verb}\xBB. Con avoir, il participio passato concorda quindi con questo complemento{features}: \xAB{participle}\xBB.", es: "Correcto: el complemento directo \xAB{complement}\xBB aparece antes del verbo \xAB{verb}\xBB. Con avoir, el participio pasado concuerda por tanto con este complemento{features}: \xAB{participle}\xBB.", nl: "Juist: het lijdend voorwerp \u201C{complement}\u201D staat voor het werkwoord \u201C{verb}\u201D. Met avoir komt het voltooid deelwoord dus overeen met dit lijdend voorwerp{features}: \u201C{participle}\u201D." }),
  "Ici, le COD \xAB {complement} \xBB est plac\xE9 avant le verbe \xAB {verb} \xBB. Avec avoir, il commande l\u2019accord du participe pass\xE9{features} : \xAB {participle} \xBB.": withDutchVariants({ de: "Hier steht das direkte Objekt \u201E{complement}\u201C vor dem Verb \u201E{verb}\u201C. Mit avoir bestimmt es die Angleichung des Partizips Perfekt{features}: \u201E{participle}\u201C.", en: "Here, the direct object \u201C{complement}\u201D comes before the verb \u201C{verb}\u201D. With avoir, it determines the agreement of the past participle{features}: \u201C{participle}\u201D.", it: "Qui il complemento oggetto \xAB{complement}\xBB \xE8 posto prima del verbo \xAB{verb}\xBB. Con avoir determina la concordanza del participio passato{features}: \xAB{participle}\xBB.", es: "Aqu\xED, el complemento directo \xAB{complement}\xBB aparece antes del verbo \xAB{verb}\xBB. Con avoir, determina la concordancia del participio pasado{features}: \xAB{participle}\xBB.", nl: "Hier staat het lijdend voorwerp \u201C{complement}\u201D voor het werkwoord \u201C{verb}\u201D. Met avoir bepaalt het de overeenkomst van het voltooid deelwoord{features}: \u201C{participle}\u201D." }),
  "Le participe pass\xE9 n\u2019a pas le bon accord. Compare sa terminaison avec la correction.": withDutchVariants({ de: "Das Partizip Perfekt ist nicht richtig angeglichen. Vergleiche seine Endung mit der Korrektur.", en: "The past participle does not have the correct agreement. Compare its ending with the correction.", it: "Il participio passato non \xE8 concordato correttamente. Confronta la sua desinenza con la correzione.", es: "El participio pasado no tiene la concordancia correcta. Compara su terminaci\xF3n con la correcci\xF3n.", nl: "Het voltooid deelwoord heeft niet de juiste overeenkomst. Vergelijk de uitgang met de verbetering." }),
  "Attention \xE0 l\u2019auxiliaire": withDutchVariants({ de: "Achte auf das Hilfsverb", en: "Check the auxiliary", it: "Attenzione all\u2019ausiliare", es: "Atenci\xF3n al auxiliar", nl: "Controleer het hulpwerkwoord" }),
  "cette personne": withDutchVariants({ de: "dieser Person", en: "this person", it: "questa persona", es: "esta persona", nl: "deze persoon" }),
  "L\u2019auxiliaire \xAB {learnerAuxiliary} \xBB ne convient pas. Avec {person} au {tense}, il fallait \xAB {expectedAuxiliary} \xBB.": withDutchVariants({ de: "Das Hilfsverb \u201E{learnerAuxiliary}\u201C passt nicht. Mit {person} im {tense} musste \u201E{expectedAuxiliary}\u201C stehen.", en: "The auxiliary \u201C{learnerAuxiliary}\u201D is not correct. With {person} in the {tense}, \u201C{expectedAuxiliary}\u201D was required.", it: "L\u2019ausiliare \xAB{learnerAuxiliary}\xBB non \xE8 corretto. Con {person} al {tense} occorreva \xAB{expectedAuxiliary}\xBB.", es: "El auxiliar \xAB{learnerAuxiliary}\xBB no es correcto. Con {person} en {tense}, deb\xEDa usarse \xAB{expectedAuxiliary}\xBB.", nl: "Het hulpwerkwoord \u201C{learnerAuxiliary}\u201D is niet juist. Bij {person} in de {tense} was \u201C{expectedAuxiliary}\u201D nodig." }),
  "Pour reconna\xEEtre le COD, pose \xAB {verb} qui ? \xBB ou \xAB {verb} quoi ? \xBB. Il r\xE9pond sans pr\xE9position.": withDutchVariants({ de: "Um das direkte Objekt zu erkennen, frage \u201E{verb} wen?\u201C oder \u201E{verb} was?\u201C. Es antwortet ohne Pr\xE4position.", en: "To identify the direct object, ask \u201C{verb} whom?\u201D or \u201C{verb} what?\u201D. It answers without a preposition.", it: "Per riconoscere il complemento oggetto, chiedi \xAB{verb} chi?\xBB o \xAB{verb} che cosa?\xBB. Risponde senza preposizione.", es: "Para reconocer el complemento directo, pregunta \xAB\xBF{verb} a qui\xE9n?\xBB o \xAB\xBF{verb} qu\xE9?\xBB. Responde sin preposici\xF3n.", nl: "Vraag om het lijdend voorwerp te herkennen: \u201C{verb} wie?\u201D of \u201C{verb} wat?\u201D. Het antwoord heeft geen voorzetsel." }),
  "C\u2019est juste : le COD \xAB {complement} \xBB est plac\xE9 apr\xE8s le verbe \xAB {verb} \xBB. Avec avoir, on n\u2019accorde pas le participe pass\xE9 avec un COD plac\xE9 apr\xE8s : il reste \xAB {participle} \xBB.": withDutchVariants({ de: "Richtig: Das direkte Objekt \u201E{complement}\u201C steht nach dem Verb \u201E{verb}\u201C. Mit avoir wird das Partizip Perfekt nicht an ein nachgestelltes Objekt angeglichen: Es bleibt \u201E{participle}\u201C.", en: "Correct: the direct object \u201C{complement}\u201D comes after the verb \u201C{verb}\u201D. With avoir, the past participle does not agree with a direct object placed after it, so it remains \u201C{participle}\u201D.", it: "Giusto: il complemento oggetto \xAB{complement}\xBB \xE8 posto dopo il verbo \xAB{verb}\xBB. Con avoir, il participio passato non concorda con un complemento posto dopo: resta \xAB{participle}\xBB.", es: "Correcto: el complemento directo \xAB{complement}\xBB aparece despu\xE9s del verbo \xAB{verb}\xBB. Con avoir, el participio pasado no concuerda con un complemento colocado despu\xE9s: queda \xAB{participle}\xBB.", nl: "Juist: het lijdend voorwerp \u201C{complement}\u201D staat na het werkwoord \u201C{verb}\u201D. Met avoir komt het voltooid deelwoord niet overeen met een lijdend voorwerp dat erna staat. Het blijft dus \u201C{participle}\u201D." }),
  "Ici, le COD \xAB {complement} \xBB est plac\xE9 apr\xE8s le verbe \xAB {verb} \xBB. Il ne commande donc aucun accord : le participe pass\xE9 reste \xAB {participle} \xBB.": withDutchVariants({ de: "Hier steht das direkte Objekt \u201E{complement}\u201C nach dem Verb \u201E{verb}\u201C. Es bewirkt daher keine Angleichung: Das Partizip Perfekt bleibt \u201E{participle}\u201C.", en: "Here, the direct object \u201C{complement}\u201D comes after the verb \u201C{verb}\u201D. It therefore causes no agreement: the past participle remains \u201C{participle}\u201D.", it: "Qui il complemento oggetto \xAB{complement}\xBB \xE8 posto dopo il verbo \xAB{verb}\xBB. Non determina quindi alcuna concordanza: il participio passato resta \xAB{participle}\xBB.", es: "Aqu\xED, el complemento directo \xAB{complement}\xBB aparece despu\xE9s del verbo \xAB{verb}\xBB. Por tanto, no determina ninguna concordancia: el participio pasado queda \xAB{participle}\xBB.", nl: "Hier staat het lijdend voorwerp \u201C{complement}\u201D na het werkwoord \u201C{verb}\u201D. Het veroorzaakt dus geen overeenkomst: het voltooid deelwoord blijft \u201C{participle}\u201D." }),
  "C\u2019est juste : \xAB {complement} \xBB n\u2019est pas un COD, mais un COI du verbe \xAB {verb} \xBB. Un COI ne commande jamais l\u2019accord du participe pass\xE9 employ\xE9 avec avoir : il reste \xAB {participle} \xBB.": withDutchVariants({ de: "Richtig: \u201E{complement}\u201C ist kein direktes, sondern ein indirektes Objekt des Verbs \u201E{verb}\u201C. Ein indirektes Objekt bewirkt beim Partizip Perfekt mit avoir nie eine Angleichung: Es bleibt \u201E{participle}\u201C.", en: "Correct: \u201C{complement}\u201D is not a direct object but an indirect object of the verb \u201C{verb}\u201D. An indirect object never determines agreement of a past participle used with avoir, so it remains \u201C{participle}\u201D.", it: "Giusto: \xAB{complement}\xBB non \xE8 un complemento oggetto, ma un complemento indiretto del verbo \xAB{verb}\xBB. Un complemento indiretto non determina mai la concordanza del participio passato con avoir: resta \xAB{participle}\xBB.", es: "Correcto: \xAB{complement}\xBB no es un complemento directo, sino indirecto del verbo \xAB{verb}\xBB. Un complemento indirecto nunca determina la concordancia del participio pasado con avoir: queda \xAB{participle}\xBB.", nl: "Juist: \u201C{complement}\u201D is geen lijdend voorwerp, maar een meewerkend voorwerp bij het werkwoord \u201C{verb}\u201D. Een meewerkend voorwerp bepaalt nooit de overeenkomst van een voltooid deelwoord met avoir. Het blijft dus \u201C{participle}\u201D." }),
  "Attention : \xAB {complement} \xBB n\u2019est pas un COD, mais un COI du verbe \xAB {verb} \xBB. Il ne faut pas accorder le participe avec ce compl\xE9ment : il reste \xAB {participle} \xBB.": withDutchVariants({ de: "Vorsicht: \u201E{complement}\u201C ist kein direktes, sondern ein indirektes Objekt des Verbs \u201E{verb}\u201C. Das Partizip darf nicht an dieses Objekt angeglichen werden: Es bleibt \u201E{participle}\u201C.", en: "Careful: \u201C{complement}\u201D is not a direct object but an indirect object of the verb \u201C{verb}\u201D. The participle must not agree with this complement, so it remains \u201C{participle}\u201D.", it: "Attenzione: \xAB{complement}\xBB non \xE8 un complemento oggetto, ma un complemento indiretto del verbo \xAB{verb}\xBB. Il participio non va concordato con questo complemento: resta \xAB{participle}\xBB.", es: "Atenci\xF3n: \xAB{complement}\xBB no es un complemento directo, sino indirecto del verbo \xAB{verb}\xBB. El participio no debe concordar con este complemento: queda \xAB{participle}\xBB.", nl: "Let op: \u201C{complement}\u201D is geen lijdend voorwerp, maar een meewerkend voorwerp bij het werkwoord \u201C{verb}\u201D. Het deelwoord mag zich hier niet aan aanpassen. Het blijft dus \u201C{participle}\u201D." }),
  "Pour reconna\xEEtre le COI, rep\xE8re sa pr\xE9position et pose la question \xAB {question} \xBB.": withDutchVariants({ de: "Um das indirekte Objekt zu erkennen, achte auf seine Pr\xE4position und stelle die Frage \u201E{question}\u201C.", en: "To identify the indirect object, find its preposition and ask \u201C{question}\u201D.", it: "Per riconoscere il complemento indiretto, individua la preposizione e poni la domanda \xAB{question}\xBB.", es: "Para reconocer el complemento indirecto, identifica la preposici\xF3n y formula la pregunta \xAB{question}\xBB.", nl: "Zoek om het meewerkend voorwerp te herkennen het voorzetsel en stel de vraag \u201C{question}\u201D." }),
  "R\xE9ponse apr\xE8s la premi\xE8re tentative": withDutchVariants({ de: "Antwort nach dem ersten Versuch", en: "Answer after the first attempt", it: "Risposta dopo il primo tentativo", es: "Respuesta despu\xE9s del primer intento", nl: "Antwoord na de eerste poging" }),
  "Erreur du premier essai :": withDutchVariants({ de: "Fehler beim ersten Versuch:", en: "First-attempt mistake:", it: "Errore del primo tentativo:", es: "Error del primer intento:", nl: "Fout bij de eerste poging:" }),
  "Afficher": withDutchVariants({ de: "Anzeigen", en: "Show", it: "Mostra", es: "Mostrar", nl: "Tonen" }),
  "Masquer": withDutchVariants({ de: "Ausblenden", en: "Hide", it: "Nascondi", es: "Ocultar", nl: "Verbergen" }),
  "Afficher le mot de passe": withDutchVariants({ de: "Passwort anzeigen", en: "Show password", it: "Mostra la password", es: "Mostrar la contrase\xF1a", nl: "Wachtwoord tonen" }),
  "Masquer le mot de passe": withDutchVariants({ de: "Passwort ausblenden", en: "Hide password", it: "Nascondi la password", es: "Ocultar la contrase\xF1a", nl: "Wachtwoord verbergen" }),
  "Rep\xE8re le COD (CVD) plac\xE9 avant le verbe : avec avoir, il commande l\u2019accord du participe pass\xE9 en genre et en nombre.": withDutchVariants({ de: "Erkenne das vor dem Verb stehende direkte Objekt: Mit avoir bestimmt es Genus und Numerus des Partizips.", en: "Identify the direct object before the verb: with avoir, it determines the gender and number of the past participle.", it: "Individua il complemento oggetto prima del verbo: con avoir determina genere e numero del participio passato.", es: "Identifica el complemento directo situado antes del verbo: con avoir determina el g\xE9nero y el n\xFAmero del participio pasado.", nl: "Herken het lijdend voorwerp voor het werkwoord: met avoir bepaalt het het geslacht en getal van het voltooid deelwoord." }),
  "Le COD (CVD) est plac\xE9 apr\xE8s le verbe : avec avoir, il ne commande pas l\u2019accord du participe pass\xE9.": withDutchVariants({ de: "Das direkte Objekt steht nach dem Verb: Mit avoir bestimmt es die Angleichung des Partizips nicht.", en: "The direct object comes after the verb: with avoir, it does not determine past-participle agreement.", it: "Il complemento oggetto \xE8 posto dopo il verbo: con avoir non determina la concordanza del participio passato.", es: "El complemento directo est\xE1 despu\xE9s del verbo: con avoir no determina la concordancia del participio pasado.", nl: "Het lijdend voorwerp staat na het werkwoord: met avoir bepaalt het niet de overeenkomst van het voltooid deelwoord." }),
  "Ce compl\xE9ment est un COI (CVI) : il ne commande pas l\u2019accord du participe pass\xE9 avec avoir.": withDutchVariants({ de: "Dieses Objekt ist indirekt: Es bestimmt die Angleichung des Partizips mit avoir nicht.", en: "This is an indirect object: it does not determine past-participle agreement with avoir.", it: "\xC8 un complemento indiretto: non determina la concordanza del participio passato con avoir.", es: "Es un complemento indirecto: no determina la concordancia del participio pasado con avoir.", nl: "Dit is een meewerkend voorwerp: het bepaalt niet de overeenkomst van het voltooid deelwoord met avoir." }),
  "L\u2019auxiliaire choisi ne convient pas. Reprends la construction du temps demand\xE9 avec cette personne.": withDutchVariants({ de: "Das gew\xE4hlte Hilfsverb passt nicht. Bilde die verlangte Zeitform f\xFCr diese Person erneut.", en: "The chosen auxiliary is not correct. Rebuild the requested tense for this person.", it: "L\u2019ausiliare scelto non \xE8 corretto. Ricostruisci il tempo richiesto per questa persona.", es: "El auxiliar elegido no es correcto. Vuelve a construir el tiempo pedido para esta persona.", nl: "Het gekozen hulpwerkwoord is niet juist. Vorm de gevraagde tijd opnieuw voor deze persoon." })
};
function translateUiMessage(locale, message, parameters = {}) {
  const template = locale === "fr" ? message : uiMessages[message][locale];
  const rendered = template.replace(/\{([a-zA-Z0-9_]+)\}/gu, (_match, name) => {
    var _a;
    return String((_a = parameters[name]) != null ? _a : `{${name}}`);
  });
  return locale === "fr" ? withSwissObjectAliases(rendered) : rendered;
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
    component: () => import('./admins-3KOrvOy7.mjs')
  },
  {
    name: "admin-caracteres",
    path: "/admin/caracteres",
    component: () => import('./caracteres-DEMsAfRw.mjs')
  },
  {
    name: "admin-challenges",
    path: "/admin/challenges",
    component: () => import('./challenges-BSf0BHbP.mjs')
  },
  {
    name: "admin-characters",
    path: "/admin/characters",
    component: () => import('./characters-BXdrw2IO.mjs')
  },
  {
    name: "admin-charts",
    path: "/admin/charts",
    component: () => import('./charts-CK3v6Vc9.mjs')
  },
  {
    name: "admin-coaches",
    path: "/admin/coaches",
    component: () => import('./coaches-BlTVkvRW.mjs')
  },
  {
    name: "admin-contact",
    path: "/admin/contact",
    component: () => import('./contact-DApuYpWu.mjs')
  },
  {
    name: "admin-errors",
    path: "/admin/errors",
    component: () => import('./errors-CYLSmv7X.mjs')
  },
  {
    name: "admin-feedbacks",
    path: "/admin/feedbacks",
    component: () => import('./feedbacks-D7aIjfZD.mjs')
  },
  {
    name: "admin-help-verification",
    path: "/admin/help-verification",
    component: () => import('./help-verification-K7RQAcaT.mjs')
  },
  {
    name: "admin-helps",
    path: "/admin/helps",
    component: () => import('./helps-CEqnAvwY.mjs')
  },
  {
    name: "admin-literary-corpus",
    path: "/admin/literary-corpus",
    component: () => import('./literary-corpus-CUtTCOZC.mjs')
  },
  {
    name: "admin-phrases",
    path: "/admin/phrases",
    component: () => import('./phrases-DEqEMVrl.mjs')
  },
  {
    name: "admin-shared-summaries",
    path: "/admin/shared-summaries",
    component: () => import('./shared-summaries-BuWWdgY4.mjs')
  },
  {
    name: "admin-tests",
    path: "/admin/tests",
    component: () => import('./tests-WMbfJxRn.mjs')
  },
  {
    name: "admin-users",
    path: "/admin/users",
    component: () => import('./users-OtuZSG73.mjs')
  },
  {
    name: "admin-verbes",
    path: "/admin/verbes",
    component: () => import('./verbes-Bw35G_Ge.mjs')
  },
  {
    name: "modes-mode-temps",
    path: "/modes/:mode()/:temps()",
    component: () => import('./_temps_-BmmDOAZL.mjs')
  },
  {
    name: "bilan-token",
    path: "/bilan/:token()",
    component: () => import('./_token_-gBJRMAQT.mjs')
  },
  {
    name: "defi-code",
    path: "/defi/:code()",
    component: () => import('./_code_-IUiv5mvJ.mjs')
  },
  {
    name: "defis-slug",
    path: "/defis/:slug()",
    component: () => import('./_slug_-By00p13m.mjs')
  },
  {
    name: "exercices-parcours",
    path: "/exercices/:parcours()",
    component: () => import('./_parcours_-CIi2CIfO.mjs')
  },
  {
    name: "modes-mode",
    path: "/modes/:mode()",
    component: () => import('./index-CSS0QjNm.mjs')
  },
  {
    name: "admin",
    path: "/admin",
    component: () => import('./index-DvPP2nXZ.mjs')
  },
  {
    name: "apprendre",
    path: "/apprendre",
    component: () => import('./apprendre-2EYIPkLg.mjs')
  },
  {
    name: "conjugaison-fle",
    path: "/conjugaison-fle",
    component: () => import('./conjugaison-fle-C5nA-Ju0.mjs')
  },
  {
    name: "consulter",
    path: "/consulter",
    component: () => import('./consulter-hV_4r-FU.mjs')
  },
  {
    name: "defis",
    path: "/defis",
    component: () => import('./index-Zf7iS1LL.mjs')
  },
  {
    name: "exercices",
    path: "/exercices",
    component: () => import('./index-BM0DBf8x.mjs')
  },
  {
    name: "exercices-de-conjugaison",
    path: "/exercices-de-conjugaison",
    component: () => import('./exercices-de-conjugaison-Ds-HflYz.mjs')
  },
  {
    name: "mon-compte",
    path: "/mon-compte",
    component: () => import('./mon-compte-DcPmWdNY.mjs')
  },
  {
    name: "my-page",
    path: "/my-page",
    meta: { "middleware": "learner-auth" },
    component: () => import('./my-page-CTql2gYG.mjs')
  },
  {
    name: "nouveau-defi",
    path: "/nouveau-defi",
    component: () => import('./nouveau-defi-DHHIq5Vi.mjs')
  },
  {
    name: "signin",
    path: "/signin",
    component: () => import('./signin-DjYgwd49.mjs')
  },
  {
    name: "index",
    path: "/",
    component: () => import('./index-CeXea7Hg.mjs')
  },
  {
    name: "mode-tense",
    path: "/:mode(indicatif|subjonctif|conditionnel|imperatif|participe)/:temps",
    component: () => import('./_temps_-BmmDOAZL.mjs')
  },
  {
    name: "localized-admin-admins",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/admin/admins",
    component: () => import('./admins-3KOrvOy7.mjs')
  },
  {
    name: "localized-admin-caracteres",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/admin/caracteres",
    component: () => import('./caracteres-DEMsAfRw.mjs')
  },
  {
    name: "localized-admin-challenges",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/admin/challenges",
    component: () => import('./challenges-BSf0BHbP.mjs')
  },
  {
    name: "localized-admin-characters",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/admin/characters",
    component: () => import('./characters-BXdrw2IO.mjs')
  },
  {
    name: "localized-admin-charts",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/admin/charts",
    component: () => import('./charts-CK3v6Vc9.mjs')
  },
  {
    name: "localized-admin-coaches",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/admin/coaches",
    component: () => import('./coaches-BlTVkvRW.mjs')
  },
  {
    name: "localized-admin-contact",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/admin/contact",
    component: () => import('./contact-DApuYpWu.mjs')
  },
  {
    name: "localized-admin-errors",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/admin/errors",
    component: () => import('./errors-CYLSmv7X.mjs')
  },
  {
    name: "localized-admin-feedbacks",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/admin/feedbacks",
    component: () => import('./feedbacks-D7aIjfZD.mjs')
  },
  {
    name: "localized-admin-help-verification",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/admin/help-verification",
    component: () => import('./help-verification-K7RQAcaT.mjs')
  },
  {
    name: "localized-admin-helps",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/admin/helps",
    component: () => import('./helps-CEqnAvwY.mjs')
  },
  {
    name: "localized-admin-literary-corpus",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/admin/literary-corpus",
    component: () => import('./literary-corpus-CUtTCOZC.mjs')
  },
  {
    name: "localized-admin-phrases",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/admin/phrases",
    component: () => import('./phrases-DEqEMVrl.mjs')
  },
  {
    name: "localized-admin-shared-summaries",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/admin/shared-summaries",
    component: () => import('./shared-summaries-BuWWdgY4.mjs')
  },
  {
    name: "localized-admin-tests",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/admin/tests",
    component: () => import('./tests-WMbfJxRn.mjs')
  },
  {
    name: "localized-admin-users",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/admin/users",
    component: () => import('./users-OtuZSG73.mjs')
  },
  {
    name: "localized-admin-verbes",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/admin/verbes",
    component: () => import('./verbes-Bw35G_Ge.mjs')
  },
  {
    name: "localized-modes-mode-temps",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/modes/:mode()/:temps()",
    component: () => import('./_temps_-BmmDOAZL.mjs')
  },
  {
    name: "localized-bilan-token",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/bilan/:token()",
    component: () => import('./_token_-gBJRMAQT.mjs')
  },
  {
    name: "localized-defi-code",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/defi/:code()",
    component: () => import('./_code_-IUiv5mvJ.mjs')
  },
  {
    name: "localized-defis-slug",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/defis/:slug()",
    component: () => import('./_slug_-By00p13m.mjs')
  },
  {
    name: "localized-exercices-parcours",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/exercices/:parcours()",
    component: () => import('./_parcours_-CIi2CIfO.mjs')
  },
  {
    name: "localized-modes-mode",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/modes/:mode()",
    component: () => import('./index-CSS0QjNm.mjs')
  },
  {
    name: "localized-admin",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/admin",
    component: () => import('./index-DvPP2nXZ.mjs')
  },
  {
    name: "localized-apprendre",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/apprendre",
    component: () => import('./apprendre-2EYIPkLg.mjs')
  },
  {
    name: "localized-conjugaison-fle",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/conjugaison-fle",
    component: () => import('./conjugaison-fle-C5nA-Ju0.mjs')
  },
  {
    name: "localized-consulter",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/consulter",
    component: () => import('./consulter-hV_4r-FU.mjs')
  },
  {
    name: "localized-defis",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/defis",
    component: () => import('./index-Zf7iS1LL.mjs')
  },
  {
    name: "localized-exercices",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/exercices",
    component: () => import('./index-BM0DBf8x.mjs')
  },
  {
    name: "localized-exercices-de-conjugaison",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/exercices-de-conjugaison",
    component: () => import('./exercices-de-conjugaison-Ds-HflYz.mjs')
  },
  {
    name: "localized-mon-compte",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/mon-compte",
    component: () => import('./mon-compte-DcPmWdNY.mjs')
  },
  {
    name: "localized-my-page",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/my-page",
    meta: { "middleware": "learner-auth" },
    component: () => import('./my-page-CTql2gYG.mjs')
  },
  {
    name: "localized-nouveau-defi",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/nouveau-defi",
    component: () => import('./nouveau-defi-DHHIq5Vi.mjs')
  },
  {
    name: "localized-signin",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/signin",
    component: () => import('./signin-DjYgwd49.mjs')
  },
  {
    name: "localized-index",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/",
    component: () => import('./index-CeXea7Hg.mjs')
  },
  {
    name: "localized-mode-tense",
    path: "/:locale(fr|de|en|it|es|nl-NL|nl)/:mode(indicatif|subjonctif|conditionnel|imperatif|participe)/:temps",
    component: () => import('./_temps_-BmmDOAZL.mjs')
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
const useStateKeyPrefix = "$s";
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = useStateKeyPrefix + _key;
  const nuxtApp = useNuxtApp();
  const state = toRef(nuxtApp.payload.state, key);
  if (init) {
    nuxtApp._state[key] ??= { _default: init };
  }
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxtApp.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
function usePageSeoOverride() {
  const pageSeoOverride = useState("page-seo-override", () => null);
  function setPageSeoOverride(value) {
    pageSeoOverride.value = value;
  }
  return { pageSeoOverride, setPageSeoOverride };
}
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
  usePageSeoOverride().setPageSeoOverride(null);
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
    if (to.path.replace(/^\/(?:fr|de|en|it|es|nl-NL|nl)(?=\/|$)/u, "") === "/charts") {
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
  "learner-auth": () => import('./learner-auth-BVuWqFgW.mjs')
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
  default: defineAsyncComponent(() => import('./default-CuilOmzl.mjs').then((m) => m.default || m))
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
    const seoOverride = usePageSeoOverride().pageSeoOverride.value;
    const seoAlternate = seoOverride?.alternates.find((alternate) => alternate.locale === normalizedLocale);
    const path = seoAlternate?.path ?? (seoOverride ? localizePath("/defis", normalizedLocale) : localizePath(route.path, normalizedLocale));
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
  useHead(() => ({ htmlAttrs: { lang: localeLanguageTag(interfaceLocale.value) } }));
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
    const { pageSeoOverride } = usePageSeoOverride();
    const canonicalUrl = computed(() => `${siteUrl.value}${pageSeoOverride.value?.canonicalPath ?? localizePath(routeWithoutLocale.value, interfaceLocale.value)}`);
    const alternateLinks = computed(() => pageSeoOverride.value?.alternates.map((alternate) => ({
      rel: "alternate",
      hreflang: localeLanguageTag(alternate.locale),
      href: `${siteUrl.value}${alternate.path}`
    })) ?? SUPPORTED_LOCALES.map((locale) => ({
      rel: "alternate",
      hreflang: localeLanguageTag(locale),
      href: `${siteUrl.value}${localizePath(routeWithoutLocale.value, locale)}`
    })));
    const xDefaultPath = computed(() => pageSeoOverride.value?.xDefaultPath ?? localizePath(routeWithoutLocale.value, "fr"));
    const privatePath = computed(() => /^(?:\/admin(?:\/|$)|\/(?:signin|my-page|mon-compte|nouveau-defi)(?:\/|$)|\/(?:defi|bilan)(?:\/|$))/u.test(routeWithoutLocale.value));
    function localizedPageKey(route2) {
      return stripLocaleFromPath(route2.path);
    }
    useHead(() => ({
      titleTemplate: (title) => title ? `${title} · ${ui("Défis de conjugaison")}` : ui("Défis de conjugaison"),
      meta: [
        { name: "theme-color", content: "#344758" },
        { name: "robots", content: pageSeoOverride.value?.robots ?? (privatePath.value ? "noindex, nofollow" : "index, follow") },
        { property: "og:site_name", content: "TATITOTU" },
        { property: "og:url", content: canonicalUrl.value },
        {
          name: "description",
          content: ui("Créez des défis de conjugaison, entraînez-vous et imprimez vos questionnaires.")
        }
      ],
      link: [
        { rel: "canonical", href: canonicalUrl.value },
        ...alternateLinks.value,
        {
          rel: "alternate",
          hreflang: "x-default",
          href: `${siteUrl.value}${xDefaultPath.value}`
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

export { useRouter as a, useNuxtApp as b, useRuntimeConfig as c, nuxtLinkDefaults as d, entry_default as default, encodeRoutePath as e, useLanguagePreferences as f, useRoute as g, useState as h, useRequestFetch as i, useRequestHeaders as j, useCookie as k, asyncDataDefaults as l, createError as m, navigateTo as n, fetchDefaults as o, useRequestEvent as p, usePageSeoOverride as q, resolveRouteObject as r, useSeoMeta as s, defineNuxtRouteMiddleware as t, useHead as u };
//# sourceMappingURL=server.mjs.map
