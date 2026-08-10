import { _ as __nuxt_component_0 } from './nuxt-link-icjx6oE7.mjs';
import { defineComponent, ref, computed, withAsyncContext, watch, mergeProps, unref, withCtx, createVNode, toDisplayString, openBlock, createBlock, createTextVNode, useSSRContext, reactive } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderSlot } from 'vue/server-renderer';
import { f as useLanguagePreferences, g as useRoute, c as useRuntimeConfig } from './server.mjs';
import { u as useTurnstileWidget } from './useTurnstileWidget-BwmcZb0F.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { g as guidedTourCopy } from '../_/guided-tour.mjs';
import { u as useColorTheme, l as learnerSpaceCopy } from './useColorTheme-Z-rsU5UJ.mjs';
import { u as useLearnerAuth } from './useLearnerAuth-BLt5hOAV.mjs';
import { u as useSiteAnalytics } from './useSiteAnalytics-D1wpWTOZ.mjs';
import { u as useState } from './state-DjsguMyT.mjs';
import '../nitro/nitro.mjs';
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
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const copies = {
  fr: {
    title: "\xC9crire \xE0 TATITOTU",
    intro: "Vous avez rep\xE9r\xE9 une erreur sur le site ? Vous avez une suggestion d\u2019am\xE9lioration ou vous souhaitez simplement me dire que le site vous pla\xEEt ? \xC9crivez-moi !",
    privacy: "Votre adresse sert uniquement \xE0 vous r\xE9pondre. Pour limiter les abus, le nombre de messages est restreint.",
    email: "Votre adresse e-mail",
    subject: "Objet du message",
    message: "Votre message",
    emailPlaceholder: "vous@exemple.ch",
    subjectPlaceholder: "Par exemple : une erreur dans un exercice",
    messagePlaceholder: "D\xE9crivez pr\xE9cis\xE9ment ce que vous avez remarqu\xE9\u2026",
    characters: "{count} caract\xE8res minimum",
    send: "Envoyer mon message",
    sending: "Envoi\u2026",
    cancel: "Annuler",
    close: "Fermer",
    successTitle: "Merci pour votre message !",
    success: "Il a bien \xE9t\xE9 envoy\xE9. Nous le lirons d\xE8s que possible.",
    error: "Le message n\u2019a pas pu \xEAtre envoy\xE9. Veuillez r\xE9essayer dans quelques instants.",
    rateLimited: "Vous avez d\xE9j\xE0 envoy\xE9 plusieurs messages aujourd\u2019hui. Merci de r\xE9essayer demain.",
    shortRateLimited: "Vous avez d\xE9j\xE0 envoy\xE9 {maximum} messages sur une courte p\xE9riode. Merci de r\xE9essayer {when}.",
    dailyRateLimited: "Vous avez d\xE9j\xE0 envoy\xE9 {maximum} messages aujourd\u2019hui. Merci de r\xE9essayer {when}.",
    unavailable: "Le formulaire de contact est temporairement indisponible."
  },
  de: {
    title: "An TATITOTU schreiben",
    intro: "Haben Sie auf der Website einen Fehler entdeckt? Haben Sie einen Verbesserungsvorschlag oder m\xF6chten Sie mir einfach sagen, dass Ihnen die Website gef\xE4llt? Schreiben Sie mir!",
    privacy: "Ihre Adresse wird nur verwendet, um Ihnen zu antworten. Um Missbrauch zu begrenzen, ist die Anzahl der Nachrichten beschr\xE4nkt.",
    email: "Ihre E-Mail-Adresse",
    subject: "Betreff",
    message: "Ihre Nachricht",
    emailPlaceholder: "sie@beispiel.ch",
    subjectPlaceholder: "Zum Beispiel: ein Fehler in einer \xDCbung",
    messagePlaceholder: "Beschreiben Sie m\xF6glichst genau, was Ihnen aufgefallen ist\u2026",
    characters: "Mindestens {count} Zeichen",
    send: "Nachricht senden",
    sending: "Wird gesendet\u2026",
    cancel: "Abbrechen",
    close: "Schlie\xDFen",
    successTitle: "Vielen Dank f\xFCr Ihre Nachricht!",
    success: "Sie wurde erfolgreich gesendet. Wir werden sie so bald wie m\xF6glich lesen.",
    error: "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es in K\xFCrze erneut.",
    rateLimited: "Sie haben heute bereits mehrere Nachrichten gesendet. Bitte versuchen Sie es morgen erneut.",
    shortRateLimited: "Sie haben innerhalb kurzer Zeit bereits {maximum} Nachrichten gesendet. Bitte versuchen Sie es {when} erneut.",
    dailyRateLimited: "Sie haben heute bereits {maximum} Nachrichten gesendet. Bitte versuchen Sie es {when} erneut.",
    unavailable: "Das Kontaktformular ist vor\xFCbergehend nicht verf\xFCgbar."
  },
  en: {
    title: "Write to TATITOTU",
    intro: "Have you spotted an error on the website? Do you have a suggestion for improvement, or would you simply like to tell me that you enjoy the website? Write to me!",
    privacy: "Your address is used only to reply to you. To prevent abuse, the number of messages is limited.",
    email: "Your email address",
    subject: "Subject",
    message: "Your message",
    emailPlaceholder: "you@example.com",
    subjectPlaceholder: "For example: an error in an exercise",
    messagePlaceholder: "Describe precisely what you noticed\u2026",
    characters: "At least {count} characters",
    send: "Send my message",
    sending: "Sending\u2026",
    cancel: "Cancel",
    close: "Close",
    successTitle: "Thank you for your message!",
    success: "It has been sent successfully. We will read it as soon as possible.",
    error: "The message could not be sent. Please try again in a few moments.",
    rateLimited: "You have already sent several messages today. Please try again tomorrow.",
    shortRateLimited: "You have already sent {maximum} messages within a short period. Please try again {when}.",
    dailyRateLimited: "You have already sent {maximum} messages today. Please try again {when}.",
    unavailable: "The contact form is temporarily unavailable."
  },
  it: {
    title: "Scrivi a TATITOTU",
    intro: "Hai notato un errore sul sito? Hai un suggerimento per migliorarlo o vuoi semplicemente dirmi che il sito ti piace? Scrivimi!",
    privacy: "Il tuo indirizzo viene usato solo per risponderti. Per limitare gli abusi, il numero di messaggi \xE8 limitato.",
    email: "Il tuo indirizzo e-mail",
    subject: "Oggetto",
    message: "Il tuo messaggio",
    emailPlaceholder: "tu@esempio.ch",
    subjectPlaceholder: "Per esempio: un errore in un esercizio",
    messagePlaceholder: "Descrivi con precisione ci\xF2 che hai notato\u2026",
    characters: "Almeno {count} caratteri",
    send: "Invia il messaggio",
    sending: "Invio\u2026",
    cancel: "Annulla",
    close: "Chiudi",
    successTitle: "Grazie per il tuo messaggio!",
    success: "\xC8 stato inviato correttamente. Lo leggeremo appena possibile.",
    error: "Non \xE8 stato possibile inviare il messaggio. Riprova tra poco.",
    rateLimited: "Hai gi\xE0 inviato diversi messaggi oggi. Riprova domani.",
    shortRateLimited: "Hai gi\xE0 inviato {maximum} messaggi in un breve periodo. Riprova {when}.",
    dailyRateLimited: "Hai gi\xE0 inviato {maximum} messaggi oggi. Riprova {when}.",
    unavailable: "Il modulo di contatto \xE8 temporaneamente non disponibile."
  },
  es: {
    title: "Escribir a TATITOTU",
    intro: "\xBFHas detectado un error en el sitio? \xBFTienes alguna sugerencia para mejorarlo o simplemente quieres decirme que te gusta el sitio? \xA1Escr\xEDbeme!",
    privacy: "Tu direcci\xF3n solo se utiliza para responderte. Para limitar los abusos, el n\xFAmero de mensajes est\xE1 restringido.",
    email: "Tu correo electr\xF3nico",
    subject: "Asunto",
    message: "Tu mensaje",
    emailPlaceholder: "tu@ejemplo.ch",
    subjectPlaceholder: "Por ejemplo: un error en un ejercicio",
    messagePlaceholder: "Describe con precisi\xF3n lo que has observado\u2026",
    characters: "Al menos {count} caracteres",
    send: "Enviar mi mensaje",
    sending: "Enviando\u2026",
    cancel: "Cancelar",
    close: "Cerrar",
    successTitle: "\xA1Gracias por tu mensaje!",
    success: "Se ha enviado correctamente. Lo leeremos lo antes posible.",
    error: "No se ha podido enviar el mensaje. Int\xE9ntalo de nuevo en unos instantes.",
    rateLimited: "Ya has enviado varios mensajes hoy. Int\xE9ntalo de nuevo ma\xF1ana.",
    shortRateLimited: "Ya has enviado {maximum} mensajes en un periodo corto. Int\xE9ntalo de nuevo {when}.",
    dailyRateLimited: "Ya has enviado {maximum} mensajes hoy. Int\xE9ntalo de nuevo {when}.",
    unavailable: "El formulario de contacto no est\xE1 disponible temporalmente."
  }
};
function contactCopy(locale) {
  return copies[locale];
}

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ContactDialog",
  __ssrInlineRender: true,
  setup(__props, { expose: __expose }) {
    const config = useRuntimeConfig();
    const { interfaceLocale } = useLanguagePreferences();
    const copy = computed(() => contactCopy(interfaceLocale.value));
    const dialog = ref(null);
    ref(null);
    const email = ref("");
    const subject = ref("");
    const message = ref("");
    const website = ref("");
    const submitting = ref(false);
    const sent = ref(false);
    const errorMessage = ref("");
    const turnstileSiteKey = String(config.public.turnstileSiteKey || "");
    useTurnstileWidget(turnstileSiteKey, "contact");
    const constraints = reactive({
      enabled: true,
      subjectMinLength: 5,
      subjectMaxLength: 120,
      messageMinLength: 20,
      messageMaxLength: 3e3
    });
    async function refreshConstraints() {
      try {
        Object.assign(constraints, await $fetch("/api/contact-settings"));
      } catch {
      }
    }
    function open() {
      sent.value = false;
      errorMessage.value = "";
      dialog.value?.showModal();
      void refreshConstraints();
    }
    __expose({ open });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<dialog${ssrRenderAttrs(mergeProps({
        ref_key: "dialog",
        ref: dialog,
        class: "contact-dialog",
        "aria-labelledby": unref(sent) ? "contact-success-title" : "contact-title"
      }, _attrs))} data-v-0fafc0de><section class="contact-dialog__card" data-v-0fafc0de><button class="contact-dialog__close" type="button"${ssrRenderAttr("aria-label", unref(copy).close)}${ssrRenderAttr("title", unref(copy).close)}${ssrIncludeBooleanAttr(unref(submitting)) ? " disabled" : ""} data-v-0fafc0de><span aria-hidden="true" data-v-0fafc0de>×</span></button>`);
      if (unref(sent)) {
        _push(`<div class="contact-dialog__success" role="status" data-v-0fafc0de><span class="contact-dialog__success-icon" aria-hidden="true" data-v-0fafc0de>✓</span><h2 id="contact-success-title" data-v-0fafc0de>${ssrInterpolate(unref(copy).successTitle)}</h2><p data-v-0fafc0de>${ssrInterpolate(unref(copy).success)}</p><button class="contact-dialog__primary" type="button" data-v-0fafc0de>${ssrInterpolate(unref(copy).close)}</button></div>`);
      } else {
        _push(`<!--[--><header class="contact-dialog__header" data-v-0fafc0de><span class="contact-dialog__eyebrow" data-v-0fafc0de>CONTACT</span><h2 id="contact-title" data-v-0fafc0de>${ssrInterpolate(unref(copy).title)}</h2><p data-v-0fafc0de>${ssrInterpolate(unref(copy).intro)}</p></header><form class="contact-dialog__form" data-v-0fafc0de><label data-v-0fafc0de><span data-v-0fafc0de>${ssrInterpolate(unref(copy).email)}</span><input${ssrRenderAttr("value", unref(email))} type="email" maxlength="254" autocomplete="email"${ssrRenderAttr("placeholder", unref(copy).emailPlaceholder)} required data-v-0fafc0de></label><label data-v-0fafc0de><span data-v-0fafc0de>${ssrInterpolate(unref(copy).subject)}</span><input${ssrRenderAttr("value", unref(subject))} type="text"${ssrRenderAttr("minlength", unref(constraints).subjectMinLength)}${ssrRenderAttr("maxlength", unref(constraints).subjectMaxLength)}${ssrRenderAttr("placeholder", unref(copy).subjectPlaceholder)} required data-v-0fafc0de></label><label data-v-0fafc0de><span data-v-0fafc0de>${ssrInterpolate(unref(copy).message)}</span><textarea${ssrRenderAttr("minlength", unref(constraints).messageMinLength)}${ssrRenderAttr("maxlength", unref(constraints).messageMaxLength)} rows="6"${ssrRenderAttr("placeholder", unref(copy).messagePlaceholder)} required data-v-0fafc0de>${ssrInterpolate(unref(message))}</textarea><small data-v-0fafc0de>${ssrInterpolate(unref(copy).characters.replace("{count}", String(unref(constraints).messageMinLength)))}</small></label><label class="contact-dialog__honeypot" aria-hidden="true" data-v-0fafc0de> Site internet <input${ssrRenderAttr("value", unref(website))} name="website" type="text" tabindex="-1" autocomplete="off" data-v-0fafc0de></label>`);
        if (unref(turnstileSiteKey)) {
          _push(`<div class="cf-turnstile" data-v-0fafc0de></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(errorMessage)) {
          _push(`<p class="contact-dialog__error" role="alert" data-v-0fafc0de>${ssrInterpolate(unref(errorMessage))}</p>`);
        } else if (!unref(constraints).enabled) {
          _push(`<p class="contact-dialog__error" role="status" data-v-0fafc0de>${ssrInterpolate(unref(copy).unavailable)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<p class="contact-dialog__privacy" data-v-0fafc0de>${ssrInterpolate(unref(copy).privacy)}</p><div class="contact-dialog__actions" data-v-0fafc0de><button type="button"${ssrIncludeBooleanAttr(unref(submitting)) ? " disabled" : ""} data-v-0fafc0de>${ssrInterpolate(unref(copy).cancel)}</button><button class="contact-dialog__primary" type="submit"${ssrIncludeBooleanAttr(unref(submitting) || !unref(constraints).enabled) ? " disabled" : ""} data-v-0fafc0de>${ssrInterpolate(unref(submitting) ? unref(copy).sending : unref(copy).send)}</button></div></form><!--]-->`);
      }
      _push(`</section></dialog>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ContactDialog.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-0fafc0de"]]), { __name: "ContactDialog" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { ui, interfaceLocale, localePath } = useLanguagePreferences();
    const { user: learner, checkSession } = useLearnerAuth();
    const route = useRoute();
    useColorTheme();
    useSiteAnalytics();
    const isDark = ref(false);
    const localizedSectionPath = computed(() => route.path.replace(/^\/(?:fr|de|en|it|es)(?=\/|$)/u, "") || "/");
    const isAdminRoute = computed(() => localizedSectionPath.value === "/admin" || localizedSectionPath.value.startsWith("/admin/"));
    const embeddedConsultation = computed(() => localizedSectionPath.value === "/consulter" && route.query.embed === "challenge");
    const themeSwitchTitle = computed(() => isDark.value ? ui("Activer le mode clair") : ui("Activer le mode sombre"));
    const languageOptions = computed(() => [
      { value: "fr", label: ui("Français"), flag: "🇫🇷" },
      { value: "de", label: ui("Allemand"), flag: "🇩🇪" },
      { value: "en", label: ui("Anglais"), flag: "🇬🇧" },
      { value: "it", label: ui("Italien"), flag: "🇮🇹" },
      { value: "es", label: ui("Espagnol"), flag: "🇪🇸" }
    ]);
    const homeResetRequested = useState("home-reset-requested", () => false);
    const newChallengeRequested = useState("new-challenge-requested", () => false);
    useState("guided-tour-requested", () => false);
    const wizardAtHome = useState("wizard-at-home", () => true);
    const tourCopy = computed(() => guidedTourCopy(interfaceLocale.value));
    const learnerCopy = computed(() => learnerSpaceCopy(interfaceLocale.value));
    const isActualHomePage = computed(() => localizedSectionPath.value === "/" && wizardAtHome.value);
    const activeLanguageOption = computed(() => languageOptions.value.find((option) => option.value === interfaceLocale.value) ?? languageOptions.value[0]);
    const learnerMenu = ref(null);
    const learnerLanguageMenuOpen = ref(false);
    ref(null);
    const tabletLanguageMenuOpen = ref(false);
    const learnerLoggingOut = ref(false);
    const contactDialog = ref(null);
    const learnerDisplayName = computed(() => {
      const username = learner.value?.username || "";
      return username ? username.charAt(0).toLocaleUpperCase("fr-CH") + username.slice(1) : "";
    });
    [__temp, __restore] = withAsyncContext(() => checkSession()), await __temp, __restore();
    watch(() => route.fullPath, () => {
      learnerMenu.value?.removeAttribute("open");
      learnerLanguageMenuOpen.value = false;
      tabletLanguageMenuOpen.value = false;
    });
    function requestHomeReset() {
      homeResetRequested.value = true;
    }
    function requestNewChallenge() {
      newChallengeRequested.value = true;
    }
    const activeLearnerTab = computed(() => {
      if (localizedSectionPath.value !== "/my-page") return "";
      const tab = String(route.query.tab || "history");
      return ["history", "progress", "preferences", "account"].includes(tab) ? tab : "history";
    });
    const activeSection = computed(() => {
      if (localizedSectionPath.value === "/consulter" || localizedSectionPath.value.startsWith("/consulter/")) return "consulter";
      if (localizedSectionPath.value === "/apprendre" || localizedSectionPath.value.startsWith("/apprendre/") || /^\/(?:indicatif|subjonctif|conditionnel|imperatif|participe)\//u.test(localizedSectionPath.value) || localizedSectionPath.value === "/exercices" || localizedSectionPath.value.startsWith("/exercices/")) return "apprendre";
      if (!isAdminRoute.value) return "exercer";
      return "";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ContactDialog = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["site-shell", { "site-shell--embedded": unref(embeddedConsultation) }]
      }, _attrs))}>`);
      if (!unref(embeddedConsultation)) {
        _push(`<header class="site-header"><div class="site-header__inner"><div class="site-header__identity">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "site-brand",
          to: unref(localePath)("/")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<strong${_scopeId}>TATITOTU</strong><span${_scopeId}>${ssrInterpolate(unref(ui)("Défis de conjugaison"))}</span>`);
            } else {
              return [
                createVNode("strong", null, "TATITOTU"),
                createVNode("span", null, toDisplayString(unref(ui)("Défis de conjugaison")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(isActualHomePage)) {
          _push(`<div class="language-selector language-selector--tablet" role="group"${ssrRenderAttr("aria-label", unref(ui)("Langue de l’interface"))}><!--[-->`);
          ssrRenderList(unref(languageOptions), (option) => {
            _push(`<button type="button" class="${ssrRenderClass({ "is-active": unref(interfaceLocale) === option.value })}"${ssrRenderAttr("aria-label", option.label)}${ssrRenderAttr("aria-pressed", unref(interfaceLocale) === option.value)}${ssrRenderAttr("title", option.label)}><span aria-hidden="true">${ssrInterpolate(option.flag)}</span></button>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="${ssrRenderClass([{ "is-open": unref(tabletLanguageMenuOpen) }, "tablet-language-menu"])}"><button class="tablet-language-menu__trigger" type="button"${ssrRenderAttr("aria-label", unref(ui)("Langue de l’interface"))}${ssrRenderAttr("aria-expanded", unref(tabletLanguageMenuOpen))}${ssrRenderAttr("title", unref(activeLanguageOption).label)}><span aria-hidden="true">${ssrInterpolate(unref(activeLanguageOption).flag)}</span></button><div class="language-selector tablet-language-menu__panel" role="group"${ssrRenderAttr("aria-label", unref(ui)("Langue de l’interface"))}${ssrRenderAttr("aria-hidden", !unref(tabletLanguageMenuOpen))}><!--[-->`);
          ssrRenderList(unref(languageOptions), (option) => {
            _push(`<button type="button" class="${ssrRenderClass({ "is-active": unref(interfaceLocale) === option.value })}"${ssrRenderAttr("aria-label", option.label)}${ssrRenderAttr("aria-pressed", unref(interfaceLocale) === option.value)}${ssrRenderAttr("title", option.label)}><span aria-hidden="true">${ssrInterpolate(option.flag)}</span></button>`);
          });
          _push(`<!--]--></div></div>`);
        }
        if (!unref(isActualHomePage)) {
          _push(`<button class="site-tour-button" type="button"${ssrRenderAttr("title", unref(tourCopy).navLabel)}><span class="site-tour-button__label">${ssrInterpolate(unref(tourCopy).navLabel)}</span><span class="site-tour-button__tablet-icon" aria-hidden="true">i</span></button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><nav class="site-navigation"${ssrRenderAttr("aria-label", unref(ui)("Navigation principale"))}>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "site-navigation__home",
          to: unref(localePath)("/"),
          "aria-label": unref(ui)("Accueil"),
          title: unref(ui)("Accueil"),
          onClick: requestHomeReset
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<svg aria-hidden="true" viewBox="0 0 24 24"${_scopeId}><path d="M3 11.2 12 4l9 7.2"${_scopeId}></path><path d="M5.5 10.7V20h4.8v-5.4h3.4V20h4.8v-9.3"${_scopeId}></path></svg>`);
            } else {
              return [
                (openBlock(), createBlock("svg", {
                  "aria-hidden": "true",
                  viewBox: "0 0 24 24"
                }, [
                  createVNode("path", { d: "M3 11.2 12 4l9 7.2" }),
                  createVNode("path", { d: "M5.5 10.7V20h4.8v-5.4h3.4V20h4.8v-9.3" })
                ]))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: unref(localePath)("/"),
          class: { "is-active": unref(activeSection) === "exercer" },
          "aria-current": unref(activeSection) === "exercer" ? "page" : void 0,
          onClick: requestNewChallenge
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(ui)("S’exercer"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(ui)("S’exercer")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: unref(localePath)("/consulter"),
          class: { "is-active": unref(activeSection) === "consulter" },
          "aria-current": unref(activeSection) === "consulter" ? "page" : void 0
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(ui)("Consulter"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(ui)("Consulter")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: unref(localePath)("/apprendre"),
          class: { "is-active": unref(activeSection) === "apprendre" },
          "aria-current": unref(activeSection) === "apprendre" ? "page" : void 0
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(ui)("Apprendre"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(ui)("Apprendre")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(learner)) {
          _push(`<details class="learner-menu" data-tour="learner-account"><summary><span class="learner-menu__avatar" aria-hidden="true">${ssrInterpolate(unref(learnerDisplayName).charAt(0))}</span><span>${ssrInterpolate(unref(learnerDisplayName))}</span><svg aria-hidden="true" viewBox="0 0 20 20"><path d="m5 7.5 5 5 5-5"></path></svg></summary><div class="learner-menu__panel">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            class: ["learner-menu__progress", { "is-active": unref(activeLearnerTab) === "history" }],
            to: `${unref(localePath)("/my-page")}?tab=history`
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span aria-hidden="true"${_scopeId}>✦</span> ${ssrInterpolate(unref(learnerCopy).history)}`);
              } else {
                return [
                  createVNode("span", { "aria-hidden": "true" }, "✦"),
                  createTextVNode(" " + toDisplayString(unref(learnerCopy).history), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `${unref(localePath)("/my-page")}?tab=progress`,
            class: { "is-active": unref(activeLearnerTab) === "progress" }
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(learnerCopy).commonErrors)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(learnerCopy).commonErrors), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<div class="learner-menu__separator" role="separator"></div>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `${unref(localePath)("/my-page")}?tab=preferences`,
            class: { "is-active": unref(activeLearnerTab) === "preferences" }
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(learnerCopy).preferences)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(learnerCopy).preferences), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<div class="learner-menu__language"><button class="learner-menu__language-trigger" type="button"${ssrRenderAttr("aria-expanded", unref(learnerLanguageMenuOpen))}${ssrRenderAttr("aria-label", unref(learnerCopy).changeLanguage)}><span>${ssrInterpolate(unref(learnerCopy).changeLanguage)}</span><svg aria-hidden="true" viewBox="0 0 20 20"><path d="m7.5 5 5 5-5 5"></path></svg></button>`);
          if (unref(learnerLanguageMenuOpen)) {
            _push(`<div class="learner-menu__language-options" role="group"${ssrRenderAttr("aria-label", unref(ui)("Langue de l’interface"))}><!--[-->`);
            ssrRenderList(unref(languageOptions), (option) => {
              _push(`<button type="button" class="${ssrRenderClass({ "is-active": unref(interfaceLocale) === option.value })}"${ssrRenderAttr("aria-label", option.label)}${ssrRenderAttr("aria-pressed", unref(interfaceLocale) === option.value)}${ssrRenderAttr("title", option.label)}><span aria-hidden="true">${ssrInterpolate(option.flag)}</span></button>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `${unref(localePath)("/my-page")}?tab=account#change-password`,
            class: { "is-active": unref(activeLearnerTab) === "account" }
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(ui)("Changer mon mot de passe"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(ui)("Changer mon mot de passe")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<button type="button"${ssrIncludeBooleanAttr(unref(learnerLoggingOut)) ? " disabled" : ""}>${ssrInterpolate(unref(learnerLoggingOut) ? unref(ui)("Déconnexion…") : unref(ui)("Me déconnecter"))}</button></div></details>`);
        } else {
          _push(`<!--[--><button class="${ssrRenderClass([{ "is-dark": unref(isDark) }, "theme-switch"])}" type="button" role="switch"${ssrRenderAttr("aria-checked", unref(isDark))}${ssrRenderAttr("aria-label", unref(themeSwitchTitle))}${ssrRenderAttr("title", unref(themeSwitchTitle))}><span class="theme-switch__icon theme-switch__icon--moon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20.1 15.4A8.7 8.7 0 0 1 8.6 3.9 8.8 8.8 0 1 0 20.1 15.4Z"></path></svg></span><span class="theme-switch__icon theme-switch__icon--sun" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.5"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg></span></button><div class="language-selector language-selector--navigation" role="group"${ssrRenderAttr("aria-label", unref(ui)("Langue de l’interface"))}><!--[-->`);
          ssrRenderList(unref(languageOptions), (option) => {
            _push(`<button type="button" class="${ssrRenderClass({ "is-active": unref(interfaceLocale) === option.value })}"${ssrRenderAttr("aria-label", option.label)}${ssrRenderAttr("aria-pressed", unref(interfaceLocale) === option.value)}${ssrRenderAttr("title", option.label)}><span aria-hidden="true">${ssrInterpolate(option.flag)}</span></button>`);
          });
          _push(`<!--]--></div>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            class: "site-login-button",
            "data-tour": "learner-account",
            to: unref(localePath)("/signin")
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(ui)("Connexion"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(ui)("Connexion")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<!--]-->`);
        }
        _push(`</nav></div></header>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<main class="${ssrRenderClass(["site-main", { "site-main--admin": unref(isAdminRoute), "site-main--embedded": unref(embeddedConsultation) }])}">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main>`);
      if (!unref(embeddedConsultation)) {
        _push(`<footer class="site-footer"><p>${ssrInterpolate(unref(ui)("Un outil gratuit pour travailler la conjugaison française."))}</p><div class="site-footer__links"><button type="button">${ssrInterpolate(unref(ui)("Contact"))}</button>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: unref(localePath)("/admin")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(ui)("Administration"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(ui)("Administration")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></footer>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(embeddedConsultation)) {
        _push(ssrRenderComponent(_component_ContactDialog, {
          ref_key: "contactDialog",
          ref: contactDialog
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-CMum612V.mjs.map
