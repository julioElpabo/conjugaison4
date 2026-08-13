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
const mountainSvgSource = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid slice" viewBox="515.29 533.29 750 500"><defs><linearGradient id="linear-gradient" x1="890.29" x2="890.29" y1="745.89" y2="505.89" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d5e7e4"/><stop offset=".18" stop-color="#c6dcda"/><stop offset=".46" stop-color="#a9c9cb"/><stop offset=".82" stop-color="#86b2b7"/><stop offset="1" stop-color="#6f9fa7"/></linearGradient><linearGradient xlink:href="#linear-gradient" id="linear-gradient1" x1="804.46" x2="804.46" y1="862.73" y2="716.99"/><linearGradient id="linear-gradient2" x1="949.96" x2="949.96" y1="877.63" y2="732.03" gradientUnits="userSpaceOnUse"><stop offset=".03" stop-color="#bcd7d6"/><stop offset=".32" stop-color="#9fc4c4"/><stop offset=".92" stop-color="#659aa0"/><stop offset="1" stop-color="#588b92"/></linearGradient><linearGradient id="linear-gradient3" x1="880.63" x2="880.63" y1="956.29" y2="815.22" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#83acab"/><stop offset=".18" stop-color="#719d9d"/><stop offset=".53" stop-color="#4f7f81"/><stop offset=".82" stop-color="#3c696c"/><stop offset="1" stop-color="#315d62"/></linearGradient><linearGradient id="linear-gradient4" x1="881.79" x2="881.79" y1="1005.29" y2="772.29" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#537e7d"/><stop offset=".09" stop-color="#456e6f"/><stop offset=".32" stop-color="#34595d"/><stop offset=".55" stop-color="#27494f"/><stop offset=".78" stop-color="#1d3d44"/><stop offset="1" stop-color="#173840"/></linearGradient><linearGradient id="linear-gradient5" x1="813.96" x2="813.96" y1="961.29" y2="839.29" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#356064"/><stop offset=".62" stop-color="#20454b"/><stop offset="1" stop-color="#15353d"/></linearGradient><linearGradient id="linear-gradient6" x1="897.73" x2="897.73" y1="1029.3" y2="840.59" gradientUnits="userSpaceOnUse"><stop offset=".2" stop-color="#264c52"/><stop offset=".4" stop-color="#1e4047"/><stop offset=".77" stop-color="#14333b"/><stop offset="1" stop-color="#0f2932"/></linearGradient><linearGradient id="linear-gradient7" x1="677.39" x2="677.39" y1="1116.29" y2="1004.41" gradientUnits="userSpaceOnUse"><stop offset=".34" stop-color="#264c52"/><stop offset=".5" stop-color="#1e4047"/><stop offset=".81" stop-color="#14333b"/><stop offset="1" stop-color="#0f2932"/></linearGradient><linearGradient id="linear-gradient8" x1="1025.42" x2="1025.42" y1="1108.29" y2="987.03" gradientUnits="userSpaceOnUse"><stop offset=".05" stop-color="#264c52"/><stop offset=".44" stop-color="#17333c"/><stop offset=".78" stop-color="#0e2731"/><stop offset="1" stop-color="#0a222c"/></linearGradient><radialGradient id="radial-gradient" cx="1211.29" cy="871.06" r="320.75" fx="1211.29" fy="871.06" gradientUnits="userSpaceOnUse"><stop offset=".05" stop-color="#8fd4c2"/><stop offset="1" stop-color="#8fd4c2" stop-opacity="0"/></radialGradient><radialGradient xlink:href="#radial-gradient" id="radial-gradient1" cx="533.29" cy="533.29" r="533.29" fx="533.29" fy="533.29"/><clipPath id="clippath"><path d="M515.29 533.29h750v500h-750z" style="fill:none"/></clipPath><style>.st3{mix-blend-mode:overlay;fill:#fff;opacity:.32}.st13{opacity:.32;fill:#e5eeea}.st15{opacity:.15;fill:#183c43}</style></defs><g style="isolation:isolate"><path id="BACKGROUND" d="M515.29 533.29h750v500h-750z" style="fill:url(#linear-gradient)"/><g id="OBJECTS" style="clip-path:url(#clippath)"><path d="m508.83 772.29 37.47-9h32l48.5-14 89 31 36 3s73-38.33 80-40.17c7-1.83 43-4.33 43-4.33l62.5 10.5 169.33 81.75v40.02H502.29l6.53-98.77Z" style="fill:url(#linear-gradient1)"/><path d="m793.29 816.21 65.51-46.58 46.99-20.34 46.34-51.66 9.29-9.34h15.21l20.66 12.67 14-.67 8 10.67 51.34 41.29 36 112.03H793.29z" style="fill:url(#linear-gradient2)"/><path d="m858.8 769.63 54.49 29.16 82 65.49h16l-61.33-72.65-9.17-19.34-18.5-5-16.5-18zm117.83-81.34 19.66 34.5 29.13 10.84 46.37 39.16 16.36 34-17.52-54.54-51.34-41.29-8-10.67-14 .67z" class="st15"/><path d="m1271.29 743.13-31.33-9.5-15.33 4.75-39.34 11.91-74 52.67-106 16-66.93-6-30.84-7.33-17.23 3.33-63.07-17.33-21.93-11.34-30 .67-14 10.67-19.33.66-68.67 18.67-84.66 12.67-98.67 19.47v85.36h781.33z" style="fill:url(#linear-gradient3)"/><path d="m805.29 780.29-26.66 5.34-11.67 14.33-29.33-1.67-64.34 12.67 68.67-18.67 19.33-.66 14-10.67z" class="st3"/><path d="m864.96 836.96-36.33 22.33-71.34 8-53.58 61.17h336.64l-32.89-109.83-2.17.33-66.93-6-30.84-7.33-17.23 3.33-63.07-17.33 37.74 32z" class="st15"/><path d="M481.29 871.29s43-69 61-72 39 0 39 0 74.2 65 96.1 72 114.9 8 114.9 8l67.93-14 51.07-17 13.82-19 16.79-5.67h8.35s16.04-27.33 20.04-40.33 13-22 13-22 1-16 7-17.5 16.5 0 16.5 0l10.5 1.5 29-35s11.5-17 17-19.5 14.5-17.5 14.5-17.5h23.5l39 15s15.5 31.5 27 37.5 24 18 24 18 17 36.5 25 43 22 17.5 22 17.5l44 47v194h-801z" style="fill:url(#linear-gradient4)"/><path d="m1039.79 829.79 24.07 36.76 9.43 22.74 47-12s-33.5-50.5-45.5-60.75-32-19.75-32-19.75l-25.5-51.5-10.5-1.5s-10.5-1.5-16.5 0c0 0 20 29 23.5 46.5s26 39.5 26 39.5m132-71.5 21 61 4.5-16.5 37.5 36 47.5 25.49v-12.99l-44-47s-14-11-22-17.5-25-43-25-43-12.5-12-24-18-27-37.5-27-37.5l17 46z" style="fill:#183c43;opacity:.33"/><path d="m481.29 908.14 27.53-31.35 22.97-33.69 23.57-45.05c-4.31.16-8.77.53-13.07 1.24-18 3-61 72-61 72z" class="st3"/><circle cx="1211.29" cy="871.06" r="320.75" style="mix-blend-mode:overlay;fill:url(#radial-gradient);opacity:.9"/><circle cx="533.29" cy="533.29" r="533.29" style="fill:url(#radial-gradient1);opacity:.47;mix-blend-mode:overlay"/><path d="M1129.96 997.64s-96.83-33.01-110.42-37.85c-13.58-4.83-57.91-33.5-67.41-37.5s-35.74-4-35.74-4l-11.35-9.33-21.74-5.33-8.56-3.33-21.81-20.67s-21.22-1.33-33.76-4-34.54-6.67-34.54-6.67l-45.33-20.67-54.67-20.67-38.67-4-15.33 14.67s-10.67 32.67-20 38-32 17-32 17l-24.67 17.34h-20.67l-35.33 33.56v89.1h632z" style="fill:url(#linear-gradient5)"/><path d="m589.29 893.29 36-15.67 28.67-34.53 30.67-15.47-38.67-4-15.33 14.67s-10.67 32.67-20 38-32 17-32 17l-24.67 17.34 11.33.33z" style="mix-blend-mode:overlay;opacity:.1;fill:#fff"/><path d="M508.83 1013.96s165.13-48.33 166.13-49 10 .33 13 0 27.33-12 28.67-12.67c1.33-.67 9 .33 15 5s8.33-2 9.33-1 10.33 11.33 11 10 5.33.67 7.33 0 16.33-9.33 23.67-13c7.33-3.67 13.33-2.33 26.67-4 13.33-1.67 33-8.33 36.33-9.33s15.33 4.67 25.46 6.33c10.13 1.67 13.87-3 18.87-2.67 11 .73 25-4 28.85-5.33s42.28-11.33 42.28-11.33l108.54-64 22.67-19.86s21.33 5.19 31.33 1.19 24.67 3.33 24.67 3.33 29.33 7.33 42 11.33 33.33 21.33 33.33 21.33l26.67 13h36v152h-777.8v-31.33Z" style="fill:url(#linear-gradient6)"/><path d="M1099.96 522.96s-30.67 18.67-44.67 21.33-8 3.33-20 4.67c-12 1.33-12.67-2.67-26.67 0s-24 2-27.33 8.67 21.33 2.67 20 8.67-19.33 4-24.67 7.33c-5.33 3.33 18.67 3.33-17.33 7.33s-28.67-8-51.33 6.67c-22.67 14.67-22 12-44.67 15.33s-42 4.67-28.67 13.33c13.33 8.67 71.33 7.33 75.33 12s-33.33 6.67-58 6-39.33-8.42-70 .12-33.33 14.54-64 14.54-38-1.33-90 4-46.32-.67-80.67 0c-34.34.67-38.47-.67-38.47-.67v-126l591.13-3.33Z" class="st13"/><path d="M493.29 612.29s44.63-4 62.07-3c17.43 1 36.93 7 58.43 9s66.67 2.5 70.83 9c4.17 6.5 10.67 11 26.67 13s15 10.29 31.5 14.9 45 10.6 45 10.6-34 2-54 0-24-3.5-40-1.5-21-6.5-36-6-15 3.28-26.5 8.39-8.5 12.61-37 6.61-33.5-1.5-54.5 0-37 2-39.5 0-7-61-7-61m317 58.5s15 3.94 39.5 4.72 50.5-1.78 70.5 0 46-3.72 63.5-4.72 43.5-1 46.5 0 21-.75 21-.75-16.5-5.25-32.5-5.75-29 .5-39-3.5-24.17-.5-29.83 0c-5.67.5-22.17 6-38.67 4s-37-1.5-37-1.5zm252-18.5s17.5-8.21 41.5-7.1 36 6.19 47.5-.1 16-8.29 30-9.29 17 4.5 32.5 5 51.5-3 51.5-3v50.5s-23-5-39.5-6-21.5-1.5-36-8-12.5-3.5-34-6-14 1.38-35-6.31-49.5-13.19-58.5-9.69Zm60.5-56.5s26.5-7.5 35.5-12 16 0 26.5 2.5 19.5 5.58 30.5 2.54 19.5.96 26.5 2.46 29.5 1 29.5 1v13s-43-2-54-3.5-12 4.5-29.5-1.5-15-10.42-31-6.71-34 2.21-34 2.21" class="st13"/><path d="M845.96 1050.29s-7.37-21-11.85-27.33-13.48-11.35-13.48-11.35-11.67 1.31-15.33 0c-3.67-1.31-3.67-9.38-6-10.85s-4.33-17.47-9.67-18.47c-.67 5.33 4.33 12.06-2 15.7s-9.33 8.05-9.33 10.84-3 7.46-3 7.46-1.58-4.62-4.98-5.59-4.85.75-4.85.75l-.97-2.87s-4.69 2.28-6.47.18-3.4-3.8-3.4-3.8-3.72 2.68-4.85.09-1.94-8.26-3.4-9.23 0-13.52 0-13.52-4.05 7.21-4.37 12.06-2.75 7.13-4.85 10.69c-2.1 3.55-.81 7.13-2.27 11.25s-5.34 6.06-5.99 3.15 1.13-4.85-2.59-4.21c-3.72.65-5.99 1.94-5.99 1.94s1.46-3.35-1.62-5.72-2.59 1.48-5.34-2.87-7.44.62-10.19-2.19-4.21-7.58-4.21-7.58 0-5.1-1.13-7.69-4.21-1.94-4.21-1.94-.32-5.5-3.56-9.39c-3.24-3.88-1.78-5.66-2.75-7.93s-3.72-3.85-4.21-2.57-.65 7.43-3.56 10.5-5.66-2.43-8.09 1.62-4.53 6.8-4.53 6.8-6.47-2.59-7.61-4.37c-1.13-1.78-.97-4.37-2.43-5.18s-2.43-13.92-4.21-14.56c-1.78-.65 0 4.08-.97 5.19s-7.77-.66-7.61 6.62-4.53-4.05-4.53-4.05l-2.75-5.99s-1.94-14.24-3.24-12.14c-1.29 2.1-1.78 10.84-1.78 10.84s-3.4 1.94-4.05 6.63-1.13 8.09-1.62 8.74-2.43-3.07-3.56-3.56-1.46-19.9-2.43-19.9-2.91 5.99-2.91 7.28-.49 8.58-2.59 8.74-4.53-.65-5.66.49-4.05-12.46-6.15-8.74-2.59 5.34-2.59 5.34l-3.24-5.34s-2.1-19.74-4.37-18.61-1.94 7.61-1.94 8.25 1.13 2.59-1.29 5.5c-2.43 2.91-2.91 6.15-3.07 7.28s-1.78 3.4-1.78 3.4l-3.72-8.25s-2.75-11.65-3.07-12.3-2.59-.49-1.94 5.5.16 8.74-1.29 9.71c-1.46.97-6.63-4.85-6.63-4.85l-3.4-6.15s-2.43.16-2.1 5.99c.32 5.83-.81 9.22-1.13 10.19s-4.53-11.97-4.53-12.46-4.05-5.66-4.37-6.47 2.43-16.18-.81-14.24-3.24 8.41-2.91 9.87 1.46 9.55-1.13 10.84-3.88 4.05-4.05 5.34-3.24-8.58-3.24-8.58-5.18 0-6.47-2.27-2.91-9.71-2.91-9.71-1.13-8.09-2.75-3.56.16 8.25-1.13 10.36c-1.29 2.1-4.53 1.94-4.53 1.94l-4.05-5.5-9.55-9.71v114.51h337.13Z" style="fill:url(#linear-gradient7)"/><path d="M1275.54 979.54s-12.75-8-14-12.25.75-8.25 0-12.75-.42-10.5-.42-10.5l-2.58-13s-.25 4.5-2.25 9.75-4.25 11.25-3.25 14.5-1.25 8-1.25 8 1 10-1.25 8-3.75-7.25-3.75-7.25 1.75 7.75-1.5 6-5-7-5-7-2.75 5-4 4-6 0-7.5-3.25-4-12.25-7-14.75-4-9-5.75-9-2.25 11-3.5 13.25-3 7.75-3 7.75-2-6.75-3.25-10.5-2-5.25-3-9.75-2.75-6.5-2.75-6.5-1.5 4-1.75 7 0 11.5 0 11.5l-.11 5.5s-7.89-6-8.14-12.5-3-7.5-3-7.5-2.75-4-4.25-5.75-.75-16.25-2.25-18.25-3.5-11.5-3.5-11.5-2 10.5-2.5 16.5-2 14-2 14l-3.75 12.75-4 4.25s-.25-3.25-2.25-12.25-2.75-11.75-2.75-12.5-2.25-20-4-22.75c0 0-.75 1-2 4.25s-3.25 7.75-3.25 9-1.25 10.25-1.25 10.25l-2 8s-3-4.5-3.5-8-2.25-10-2.5-10.75-2-22.25-2-22.25-5.25 8.75-6.75 18.75-2 6.25-2.75 13.75-1.25 18.25-1.25 18.25-4-10.5-4.75-11.75 0-13.25 0-13.25.83-16.5-.33-18.75c-1.17-2.25-2.17 4-2.17 4s-.75 10.5-4.5 15.25-3 14.25-3 14.25l-2.75 10.5v6.5s-1.5-11-3.5-15.5-2-15.75-2-15.75-2.25 2.5-2.75 7 0 12 0 12-4 5.75-4 7.75c0 0-.75-9-2-9.88s-1 3.62-2.25 3.62-6-14.5-6-14.5l-1.25-5s.5.5 0 7.25 0 12.75 0 12.75l-4-2.75s-.75-10.75-2-11.5-1.25 6.75-1.75 8-3.5 2.25-3.75 10.5-1.75 12-1.75 12-4.5-4-5.25 2.5-7 3.5-7 3.5-2.75 6.25-5 3.75-7.5 5.75-9.25 2.75.5-5.5 0-9.5-1.5-6.25-2-9 0-12.5 0-12.5-3.5-1.75-3.5 4 .25 9.75-2 14.25l-3.75 7.5s-.25-4.25 0-9 1.28-10.25-.11-10.25-1.39 1-2.14 5.75-3.75 14.25-3.75 14.25-1-4.75-1.5-9 0-6.75 0-6.75-3.75.25-3.75 3.25-2.25 11.25-2.25 11.25l-1.5 5.5s-3-5.5-2.25-9.25-.12-14.25-.12-14.25-3.13 2-3.13 6 .75 8.5 0 10-3 3.75-3 5.25v5.5s-7.75 3.75-7.75 4.5-1.75 4.75-1.75 4.75-6.75-.75-8-3.5-4.75-11.75-4.75-11.75-.25 2.75-1.25 5.5-.5 5.5-1.75 9.75-2 5-3 3.75-4-4.25-3-8.5-.25-1.75-1.25-8.75-1.5-11.75-1.5-11.75-3.25 3.75-4.25 10 2.25 8 0 11.75-4.25 5.59-4.25 7.8-1 4.95-1.5 3.7-1-7.75-3.25-10-1 4.5-1.75 5.25-4 3.75-4 3.75 1-4.75 0-8 .25-10 0-11.25-2.39-5.75-2.39-5.75-2.66 5.75-3.51 8.5-3.64 0-3.5 4.75c.15 4.75-1.35 12-2.35 11.75s-2.08-6-2.04-7.25 1.71-2.75 0-8.5-3.79-9.25-3.75-10.25-.04 3 0 3.75-.47 10-.84 10.75-1.12.5-2.37 8.75-3 8.8-3.5 8.78c-.5-.03-1.24-13.53-1.24-13.53l-3.01-6.75s-1.61 13.5-4.18 13.5-5.62-5.25-5.72-6.25-6.1-7.25-6.6-12-1.25-7-1.25-7-4.92 8.5-4.46 13.5-2.06 13.75-2.06 13.75-6.24-4.75-8.23-11.5-5.21-15.25-5.21-15.25-4.81 14.75-3.54 17.25c1.26 2.5-8.22 7-7.23 10s-8.56 4.28-8.56 4.28l-5.45-6.53-4.25-12s-3.39 10.5-4.82 13.75-4.36 9.22-4.36 9.22l-7.07-9.97-4.31-8.25s-3.23 10.25-2.71 12.5-2.48 4.68-2.48 5.47-3.5-1.12-3.5-1.12v-10.1l-3.25-9.25s-2.25 8.5-1.88 9.25c.38.75-1.37 7.03-1.37 7.03l-6.81 3.07-4.69 6.16s-.75-5.76-1.75-10.51 0-10.5 0-10.5-4.5 4.62-3.25 13.44.5 13.44-1.25 15.38-4.75-.81-5.75 5.19-5.75 9.75-6.75 10.5-12.75 7.25-12.75 8-11 10-11 10h497.33l2.92-65.75Z" style="fill:url(#linear-gradient8)"/></g></g></svg>';
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
    const isExerciseLandingPage = computed(() => ["/", "/exercices-de-conjugaison"].includes(localizedSectionPath.value));
    const isActualHomePage = computed(() => isExerciseLandingPage.value && wizardAtHome.value);
    const activeLanguageOption = computed(() => languageOptions.value.find((option) => option.value === interfaceLocale.value) ?? languageOptions.value[0]);
    const learnerMenu = ref(null);
    const learnerLanguageMenuOpen = ref(false);
    ref(null);
    const tabletLanguageMenuOpen = ref(false);
    const learnerLoggingOut = ref(false);
    const contactDialog = ref(null);
    ref(null);
    const mountainSvg = mountainSvgSource.replace('<g id="OBJECTS" style="clip-path:url(#clippath)">', '<g id="OBJECTS" style="clip-path:url(#clippath)"><g class="mountain-layer mountain-layer--far">').replace('<path d="m1271.29 743.13', '</g><g class="mountain-layer mountain-layer--middle"><path d="m1271.29 743.13').replace('<path d="M481.29 871.29', '</g><g class="mountain-layer mountain-layer--near"><path d="M481.29 871.29').replace('<path d="M1129.96 997.64', '</g><g class="mountain-layer mountain-layer--front"><path d="M1129.96 997.64').replace('<path d="M1099.96 522.96', '</g><g class="mountain-layer mountain-layer--clouds"><path d="M1099.96 522.96').replace('<path d="M845.96 1050.29', '</g><g class="mountain-layer mountain-layer--trees"><path d="M845.96 1050.29').replace("</g></g></svg>", "</g></g></g></svg>");
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
      }, _attrs))}><div class="mountain-backdrop" aria-hidden="true">${unref(mountainSvg) ?? ""}</div>`);
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
          to: unref(localePath)("/exercices-de-conjugaison"),
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
//# sourceMappingURL=default-2uj_KM_e.mjs.map
