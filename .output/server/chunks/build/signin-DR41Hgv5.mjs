import { _ as __nuxt_component_0 } from './nuxt-link-icjx6oE7.mjs';
import { defineComponent, computed, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain } from 'vue/server-renderer';
import { f as useLanguagePreferences, u as useHead, c as useRuntimeConfig } from './server.mjs';
import { u as useLearnerAuth } from './useLearnerAuth-BLt5hOAV.mjs';
import { u as useSiteAnalytics } from './useSiteAnalytics-D1wpWTOZ.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import './state-DjsguMyT.mjs';

const copies = {
  fr: {
    pageTitle: "Compte pseudonyme",
    created: "Ton compte est cr\xE9\xE9",
    keepCode: "Conserve ton code de r\xE9cup\xE9ration",
    recoveryInfo: "Il permet de r\xE9cup\xE9rer ton compte sans adresse e-mail. Il ne sera plus affich\xE9 apr\xE8s cette \xE9tape.",
    username: "Pseudonyme",
    recoveryCode: "Code de r\xE9cup\xE9ration",
    codeCopied: "Code copi\xE9",
    copyCode: "Copier le code",
    download: "T\xE9l\xE9charger",
    continue: "Continuer",
    create: "Cr\xE9er mon compte",
    signIn: "Me connecter",
    intro: "Cr\xE9er un compte t\u2019aide \xE0 mieux progresser : tes r\xE9sultats sont m\xE9moris\xE9s, tu peux suivre tes progr\xE8s et retravailler tes fautes. Aucun nom ni aucune adresse e-mail ne sont demand\xE9s.",
    chooseAction: "Choisir une action",
    proposedUsername: "Ton pseudonyme propos\xE9",
    searching: "Recherche\u2026",
    unavailable: "Indisponible",
    anotherUsername: "M\u2019en proposer un autre",
    choosePassword: "Choisis un mot de passe",
    passwordHint: "Au moins 10 caract\xE8res. Une petite phrase est facile \xE0 retenir.",
    confirmPassword: "Confirme ton mot de passe",
    privacy: "J\u2019ai compris que le site enregistre mon pseudonyme et ma progression. Il ne demande ni mon vrai nom ni mon email et je pourrai supprimer mon compte.",
    creating: "Cr\xE9ation\u2026",
    password: "Mot de passe",
    signingIn: "Connexion\u2026"
  },
  de: {
    pageTitle: "Pseudonymes Konto",
    created: "Dein Konto wurde erstellt",
    keepCode: "Bewahre deinen Wiederherstellungscode auf",
    recoveryInfo: "Damit kannst du dein Konto ohne E-Mail-Adresse wiederherstellen. Nach diesem Schritt wird er nicht mehr angezeigt.",
    username: "Benutzername",
    recoveryCode: "Wiederherstellungscode",
    codeCopied: "Code kopiert",
    copyCode: "Code kopieren",
    download: "Herunterladen",
    continue: "Weiter",
    create: "Mein Konto erstellen",
    signIn: "Anmelden",
    intro: "Mit einem Konto werden deine Ergebnisse gespeichert. Du kannst deinen Fortschritt verfolgen und Fehler erneut \xFCben. Ein echter Name oder eine E-Mail-Adresse ist nicht n\xF6tig.",
    chooseAction: "Aktion ausw\xE4hlen",
    proposedUsername: "Vorgeschlagener Benutzername",
    searching: "Suche\u2026",
    unavailable: "Nicht verf\xFCgbar",
    anotherUsername: "Anderen vorschlagen",
    choosePassword: "Passwort w\xE4hlen",
    passwordHint: "Mindestens 10 Zeichen. Ein kurzer Satz ist leicht zu merken.",
    confirmPassword: "Passwort best\xE4tigen",
    privacy: "Ich habe verstanden, dass die Website meinen Benutzernamen und meinen Fortschritt speichert. Mein echter Name wird nicht verlangt, und ich kann mein Konto l\xF6schen.",
    creating: "Konto wird erstellt\u2026",
    password: "Passwort",
    signingIn: "Anmeldung\u2026"
  },
  en: {
    pageTitle: "Pseudonymous account",
    created: "Your account has been created",
    keepCode: "Keep your recovery code",
    recoveryInfo: "It lets you recover your account without an email address. It will not be shown again after this step.",
    username: "Username",
    recoveryCode: "Recovery code",
    codeCopied: "Code copied",
    copyCode: "Copy code",
    download: "Download",
    continue: "Continue",
    create: "Create my account",
    signIn: "Sign in",
    intro: "An account saves your results so you can track your progress and practise your mistakes again. No real name or email address is required.",
    chooseAction: "Choose an action",
    proposedUsername: "Suggested username",
    searching: "Searching\u2026",
    unavailable: "Unavailable",
    anotherUsername: "Suggest another",
    choosePassword: "Choose a password",
    passwordHint: "At least 10 characters. A short sentence is easy to remember.",
    confirmPassword: "Confirm your password",
    privacy: "I understand that the site saves my username and progress. It does not ask for my real name, and I can delete my account.",
    creating: "Creating account\u2026",
    password: "Password",
    signingIn: "Signing in\u2026"
  },
  it: {
    pageTitle: "Account con pseudonimo",
    created: "Il tuo account \xE8 stato creato",
    keepCode: "Conserva il codice di recupero",
    recoveryInfo: "Permette di recuperare l\u2019account senza indirizzo e-mail. Non verr\xE0 pi\xF9 mostrato dopo questo passaggio.",
    username: "Pseudonimo",
    recoveryCode: "Codice di recupero",
    codeCopied: "Codice copiato",
    copyCode: "Copia il codice",
    download: "Scarica",
    continue: "Continua",
    create: "Crea il mio account",
    signIn: "Accedi",
    intro: "Un account salva i risultati, permette di seguire i progressi e di esercitarsi di nuovo sugli errori. Non sono richiesti nome reale n\xE9 indirizzo e-mail.",
    chooseAction: "Scegli un\u2019azione",
    proposedUsername: "Pseudonimo proposto",
    searching: "Ricerca\u2026",
    unavailable: "Non disponibile",
    anotherUsername: "Proponine un altro",
    choosePassword: "Scegli una password",
    passwordHint: "Almeno 10 caratteri. Una breve frase \xE8 facile da ricordare.",
    confirmPassword: "Conferma la password",
    privacy: "Ho capito che il sito salva il mio pseudonimo e i miei progressi. Non chiede il mio vero nome e potr\xF2 eliminare l\u2019account.",
    creating: "Creazione\u2026",
    password: "Password",
    signingIn: "Accesso\u2026"
  },
  es: {
    pageTitle: "Cuenta con seud\xF3nimo",
    created: "Tu cuenta ha sido creada",
    keepCode: "Guarda tu c\xF3digo de recuperaci\xF3n",
    recoveryInfo: "Permite recuperar tu cuenta sin direcci\xF3n de correo electr\xF3nico. No volver\xE1 a mostrarse despu\xE9s de este paso.",
    username: "Seud\xF3nimo",
    recoveryCode: "C\xF3digo de recuperaci\xF3n",
    codeCopied: "C\xF3digo copiado",
    copyCode: "Copiar el c\xF3digo",
    download: "Descargar",
    continue: "Continuar",
    create: "Crear mi cuenta",
    signIn: "Iniciar sesi\xF3n",
    intro: "Una cuenta guarda tus resultados para que puedas seguir tu progreso y volver a practicar tus errores. No se pide ning\xFAn nombre real ni correo electr\xF3nico.",
    chooseAction: "Elegir una acci\xF3n",
    proposedUsername: "Seud\xF3nimo propuesto",
    searching: "Buscando\u2026",
    unavailable: "No disponible",
    anotherUsername: "Proponer otro",
    choosePassword: "Elige una contrase\xF1a",
    passwordHint: "Al menos 10 caracteres. Una frase corta es f\xE1cil de recordar.",
    confirmPassword: "Confirma tu contrase\xF1a",
    privacy: "Entiendo que el sitio guarda mi seud\xF3nimo y mi progreso. No pide mi nombre real y podr\xE9 eliminar mi cuenta.",
    creating: "Creando\u2026",
    password: "Contrase\xF1a",
    signingIn: "Iniciando sesi\xF3n\u2026"
  }
};
function learnerAuthCopy(locale) {
  return copies[locale];
}

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "signin",
  __ssrInlineRender: true,
  setup(__props) {
    const config = useRuntimeConfig();
    useLearnerAuth();
    useSiteAnalytics();
    const { interfaceLocale, localePath } = useLanguagePreferences();
    const copy = computed(() => learnerAuthCopy(interfaceLocale.value));
    const mode = ref("login");
    const loadingSuggestion = ref(true);
    const submitting = ref(false);
    const errorMessage = ref("");
    const suggestion = ref(null);
    ref([]);
    const password = ref("");
    const passwordConfirmation = ref("");
    const loginUsername = ref("");
    const loginPassword = ref("");
    const privacyAccepted = ref(false);
    const website = ref("");
    const recovery = ref(null);
    ref(null);
    const copied = ref(false);
    const turnstileSiteKey = String(config.public.turnstileSiteKey || "");
    useHead(() => ({
      title: copy.value.pageTitle,
      meta: [{ name: "robots", content: "noindex, nofollow" }],
      script: turnstileSiteKey ? [{ src: "https://challenges.cloudflare.com/turnstile/v0/api.js", async: true, defer: true }] : []
    }));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "learner-auth-page" }, _attrs))} data-v-e58cde1b>`);
      if (unref(recovery)) {
        _push(`<section class="learner-card learner-recovery" aria-labelledby="recovery-title" data-v-e58cde1b><p class="learner-eyebrow" data-v-e58cde1b>${ssrInterpolate(unref(copy).created)}</p><h1 id="recovery-title" data-v-e58cde1b>${ssrInterpolate(unref(copy).keepCode)}</h1><p data-v-e58cde1b>${ssrInterpolate(unref(copy).recoveryInfo)}</p><dl data-v-e58cde1b><div data-v-e58cde1b><dt data-v-e58cde1b>${ssrInterpolate(unref(copy).username)}</dt><dd data-v-e58cde1b>${ssrInterpolate(unref(recovery).username)}</dd></div><div data-v-e58cde1b><dt data-v-e58cde1b>${ssrInterpolate(unref(copy).recoveryCode)}</dt><dd data-v-e58cde1b><code data-v-e58cde1b>${ssrInterpolate(unref(recovery).recoveryCode)}</code></dd></div></dl><div class="learner-actions" data-v-e58cde1b><button type="button" class="secondary-button" data-v-e58cde1b>${ssrInterpolate(unref(copied) ? unref(copy).codeCopied : unref(copy).copyCode)}</button><button type="button" class="secondary-button" data-v-e58cde1b>${ssrInterpolate(unref(copy).download)}</button>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "primary-button",
          to: unref(localePath)("/my-page")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(copy).continue)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(copy).continue), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></section>`);
      } else {
        _push(`<section class="learner-card" aria-labelledby="learner-auth-title" data-v-e58cde1b><h1 id="learner-auth-title" data-v-e58cde1b>${ssrInterpolate(unref(mode) === "register" ? unref(copy).create : unref(copy).signIn)}</h1><p class="learner-intro" data-v-e58cde1b>${ssrInterpolate(unref(copy).intro)}</p><div class="learner-tabs" role="tablist"${ssrRenderAttr("aria-label", unref(copy).chooseAction)} data-v-e58cde1b><button type="button" role="tab"${ssrRenderAttr("aria-selected", unref(mode) === "login")} data-v-e58cde1b>${ssrInterpolate(unref(copy).signIn)}</button><button type="button" role="tab"${ssrRenderAttr("aria-selected", unref(mode) === "register")} data-v-e58cde1b>${ssrInterpolate(unref(copy).create)}</button></div>`);
        if (unref(errorMessage)) {
          _push(`<p class="learner-error" role="alert" data-v-e58cde1b>${ssrInterpolate(unref(errorMessage))}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(mode) === "register") {
          _push(`<form data-v-e58cde1b><div class="learner-field" data-v-e58cde1b><span data-v-e58cde1b>${ssrInterpolate(unref(copy).proposedUsername)}</span><div class="username-proposal" aria-live="polite" data-v-e58cde1b><strong data-v-e58cde1b>${ssrInterpolate(unref(loadingSuggestion) ? unref(copy).searching : unref(suggestion)?.username || unref(copy).unavailable)}</strong><button type="button"${ssrIncludeBooleanAttr(unref(loadingSuggestion)) ? " disabled" : ""} data-v-e58cde1b>${ssrInterpolate(unref(copy).anotherUsername)}</button></div></div><label class="learner-field" data-v-e58cde1b><span data-v-e58cde1b>${ssrInterpolate(unref(copy).choosePassword)}</span><input${ssrRenderAttr("value", unref(password))} type="password" minlength="10" maxlength="200" autocomplete="new-password" required data-v-e58cde1b><small data-v-e58cde1b>${ssrInterpolate(unref(copy).passwordHint)}</small></label><label class="learner-field" data-v-e58cde1b><span data-v-e58cde1b>${ssrInterpolate(unref(copy).confirmPassword)}</span><input${ssrRenderAttr("value", unref(passwordConfirmation))} type="password" minlength="10" maxlength="200" autocomplete="new-password" required data-v-e58cde1b></label><label class="honeypot" aria-hidden="true" data-v-e58cde1b> Site internet <input${ssrRenderAttr("value", unref(website))} name="website" type="text" tabindex="-1" autocomplete="off" data-v-e58cde1b></label><label class="privacy-check" data-v-e58cde1b><input${ssrIncludeBooleanAttr(Array.isArray(unref(privacyAccepted)) ? ssrLooseContain(unref(privacyAccepted), null) : unref(privacyAccepted)) ? " checked" : ""} type="checkbox" required data-v-e58cde1b><span data-v-e58cde1b>${ssrInterpolate(unref(copy).privacy)}</span></label>`);
          if (unref(turnstileSiteKey)) {
            _push(`<div class="cf-turnstile"${ssrRenderAttr("data-sitekey", unref(turnstileSiteKey))} data-action="learner_register" data-theme="auto" data-v-e58cde1b></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button class="primary-button is-full" type="submit"${ssrIncludeBooleanAttr(unref(submitting) || unref(loadingSuggestion) || !unref(suggestion)) ? " disabled" : ""} data-v-e58cde1b>${ssrInterpolate(unref(submitting) ? unref(copy).creating : unref(copy).create)}</button></form>`);
        } else {
          _push(`<form data-v-e58cde1b><label class="learner-field" data-v-e58cde1b><span data-v-e58cde1b>${ssrInterpolate(unref(copy).username)}</span><input${ssrRenderAttr("value", unref(loginUsername))} type="text" maxlength="80" autocomplete="username" autocapitalize="none" spellcheck="false" required data-v-e58cde1b></label><label class="learner-field" data-v-e58cde1b><span data-v-e58cde1b>${ssrInterpolate(unref(copy).password)}</span><input${ssrRenderAttr("value", unref(loginPassword))} type="password" maxlength="200" autocomplete="current-password" required data-v-e58cde1b></label><button class="primary-button is-full" type="submit"${ssrIncludeBooleanAttr(unref(submitting)) ? " disabled" : ""} data-v-e58cde1b>${ssrInterpolate(unref(submitting) ? unref(copy).signingIn : unref(copy).signIn)}</button></form>`);
        }
        _push(`</section>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/signin.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const signin = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-e58cde1b"]]);

export { signin as default };
//# sourceMappingURL=signin-DR41Hgv5.mjs.map
