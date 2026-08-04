import { _ as __nuxt_component_0 } from './nuxt-link-icjx6oE7.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createVNode, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderComponent, ssrRenderAttr } from 'vue/server-renderer';
import { M as MODE_LANDING_SLUGS, m as modeLandingPage } from '../_/mode-landing-pages.mjs';
import { m as modeTensePages } from '../_/mode-tense-pages.mjs';
import { f as useLanguagePreferences, u as useHead } from './server.mjs';
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
import 'node:url';
import 'node:fs/promises';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { interfaceLocale, localePath } = useLanguagePreferences();
    const modes = computed(() => MODE_LANDING_SLUGS.map((slug) => ({
      ...modeLandingPage(slug, interfaceLocale.value),
      to: localePath(`/modes/${slug}`)
    })));
    const tenseGroups = computed(() => MODE_LANDING_SLUGS.map((slug) => ({
      mode: modeLandingPage(slug, interfaceLocale.value),
      to: localePath(`/modes/${slug}`),
      tenses: modeTensePages(slug).map((tense) => ({ ...tense, to: localePath(tense.path) }))
    })));
    const copy = computed(() => ({
      fr: { eyebrow: "Comprendre avant de pratiquer", title: "Choisis d’abord un mode, puis un temps", intro: "Le mode exprime le regard porté sur l’action. Le temps la situe et précise son déroulement. Commence par le mode pour faire un choix qui a du sens.", modesStep: "Étape 1", modesTitle: "Quel mode correspond à ton intention ?", modesText: "Fait, souhait, hypothèse, consigne ou forme non personnelle : ouvre un mode pour comprendre ce qu’il permet d’exprimer.", discover: "Découvrir ce mode", tensesStep: "Étape 2", tensesTitle: "Puis choisis un temps dans ce mode", tensesText: "Chaque page explique le rôle précis du temps, sa formation et plusieurs exemples contextualisés." },
      de: { eyebrow: "Verstehen vor dem Üben", title: "Wähle zuerst einen Modus, dann eine Zeit", intro: "Der Modus zeigt die Haltung zur Handlung; die Zeit ordnet sie ein. Beginne mit dem Modus, damit deine Wahl sinnvoll ist.", modesStep: "Schritt 1", modesTitle: "Welcher Modus passt zu deiner Absicht?", modesText: "Öffne einen Modus und entdecke, was er ausdrückt.", discover: "Modus entdecken", tensesStep: "Schritt 2", tensesTitle: "Wähle dann eine Zeit in diesem Modus", tensesText: "Jede Seite erklärt Rolle, Bildung und Verwendung anhand konkreter Beispiele." },
      en: { eyebrow: "Understand before practising", title: "Choose a mood first, then a tense", intro: "The mood conveys how an action is viewed; the tense locates and shapes it. Start with the mood so that your choice is meaningful.", modesStep: "Step 1", modesTitle: "Which mood matches your intention?", modesText: "Open a mood to understand what it allows you to express.", discover: "Discover this mood", tensesStep: "Step 2", tensesTitle: "Then choose a tense within that mood", tensesText: "Each page explains its precise role, formation and use through contextualised examples." },
      it: { eyebrow: "Capire prima di esercitarsi", title: "Scegli prima un modo, poi un tempo", intro: "Il modo esprime il punto di vista sull’azione; il tempo la situa e la precisa. Inizia dal modo per dare senso alla scelta.", modesStep: "Passaggio 1", modesTitle: "Quale modo corrisponde alla tua intenzione?", modesText: "Apri un modo per capire cosa permette di esprimere.", discover: "Scopri questo modo", tensesStep: "Passaggio 2", tensesTitle: "Poi scegli un tempo in questo modo", tensesText: "Ogni pagina spiega ruolo, formazione e uso con esempi contestualizzati." },
      es: { eyebrow: "Comprender antes de practicar", title: "Elige primero un modo y después un tiempo", intro: "El modo expresa la perspectiva sobre la acción; el tiempo la sitúa y la precisa. Empieza por el modo para que tu elección tenga sentido.", modesStep: "Paso 1", modesTitle: "¿Qué modo corresponde a tu intención?", modesText: "Abre un modo para entender qué permite expresar.", discover: "Descubrir este modo", tensesStep: "Paso 2", tensesTitle: "Después elige un tiempo de ese modo", tensesText: "Cada página explica su función, formación y uso con ejemplos contextualizados." }
    })[interfaceLocale.value]);
    useHead(() => ({
      title: copy.value.title,
      meta: [{ name: "description", content: copy.value.intro }]
    }));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "exercise-map" }, _attrs))} data-v-f2557608><header class="exercise-map__hero" data-v-f2557608><p data-v-f2557608>${ssrInterpolate(unref(copy).eyebrow)}</p><h1 data-v-f2557608>${ssrInterpolate(unref(copy).title)}</h1><p data-v-f2557608>${ssrInterpolate(unref(copy).intro)}</p></header><section class="exercise-map__modes" aria-labelledby="mode-choice-title" data-v-f2557608><header data-v-f2557608><span data-v-f2557608>${ssrInterpolate(unref(copy).modesStep)}</span><div data-v-f2557608><h2 id="mode-choice-title" data-v-f2557608>${ssrInterpolate(unref(copy).modesTitle)}</h2><p data-v-f2557608>${ssrInterpolate(unref(copy).modesText)}</p></div></header><div data-v-f2557608><!--[-->`);
      ssrRenderList(unref(modes), (mode) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: mode.slug,
          to: mode.to
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span data-v-f2557608${_scopeId}>${ssrInterpolate(mode.eyebrow)}</span><h3 data-v-f2557608${_scopeId}>${ssrInterpolate(mode.modeName)}</h3><p data-v-f2557608${_scopeId}>${ssrInterpolate(mode.purpose)}</p><strong data-v-f2557608${_scopeId}>${ssrInterpolate(unref(copy).discover)} <span aria-hidden="true" data-v-f2557608${_scopeId}>→</span></strong>`);
            } else {
              return [
                createVNode("span", null, toDisplayString(mode.eyebrow), 1),
                createVNode("h3", null, toDisplayString(mode.modeName), 1),
                createVNode("p", null, toDisplayString(mode.purpose), 1),
                createVNode("strong", null, [
                  createTextVNode(toDisplayString(unref(copy).discover) + " ", 1),
                  createVNode("span", { "aria-hidden": "true" }, "→")
                ])
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div></section><section class="exercise-map__tenses" aria-labelledby="tense-choice-title" data-v-f2557608><header data-v-f2557608><span data-v-f2557608>${ssrInterpolate(unref(copy).tensesStep)}</span><div data-v-f2557608><h2 id="tense-choice-title" data-v-f2557608>${ssrInterpolate(unref(copy).tensesTitle)}</h2><p data-v-f2557608>${ssrInterpolate(unref(copy).tensesText)}</p></div></header><div class="exercise-map__tense-groups" data-v-f2557608><!--[-->`);
      ssrRenderList(unref(tenseGroups), (group) => {
        _push(`<article data-v-f2557608><header data-v-f2557608><h3 data-v-f2557608>${ssrInterpolate(group.mode.modeName)}</h3>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: group.to
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(copy).discover)} →`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(copy).discover) + " →", 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</header><nav${ssrRenderAttr("aria-label", `${unref(copy).tensesTitle} : ${group.mode.modeName}`)} data-v-f2557608><!--[-->`);
        ssrRenderList(group.tenses, (tense) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: tense.slug,
            to: tense.to
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(tense.label)} <span aria-hidden="true" data-v-f2557608${_scopeId}>→</span>`);
              } else {
                return [
                  createTextVNode(toDisplayString(tense.label) + " ", 1),
                  createVNode("span", { "aria-hidden": "true" }, "→")
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></nav></article>`);
      });
      _push(`<!--]--></div></section></main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/exercices/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-f2557608"]]);

export { index as default };
//# sourceMappingURL=index-DyvMNFSj.mjs.map
