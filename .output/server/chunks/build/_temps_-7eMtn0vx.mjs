import { _ as __nuxt_component_0 } from './LearningSubnav-CV5szJr4.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-icjx6oE7.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { i as isModeLandingSlug, m as modeLandingPage, M as MODE_LANDING_SLUGS } from '../_/mode-landing-pages.mjs';
import { m as modeTensePage, a as modeTensePages } from '../_/mode-tense-pages.mjs';
import { g as useRoute, f as useLanguagePreferences, k as createError, u as useHead } from './server.mjs';
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
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[temps]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { interfaceLocale, localePath } = useLanguagePreferences();
    const modeSlug = String(route.params.mode || "");
    const tenseSlug = String(route.params.temps || "");
    if (!isModeLandingSlug(modeSlug)) {
      throw createError({ statusCode: 404, statusMessage: "Mode introuvable" });
    }
    const tense = modeTensePage(modeSlug, tenseSlug);
    if (!tense || tense.path.startsWith("/exercices/")) {
      throw createError({ statusCode: 404, statusMessage: "Temps introuvable" });
    }
    const mode = computed(() => modeLandingPage(modeSlug, interfaceLocale.value));
    const modeNavigation = computed(() => MODE_LANDING_SLUGS.map((slug) => ({
      key: slug,
      label: modeLandingPage(slug, interfaceLocale.value).modeName,
      to: localePath(`/modes/${slug}`)
    })));
    const tenseNavigation = computed(() => modeTensePages(modeSlug).map((item) => ({
      key: item.slug,
      label: item.label,
      to: localePath(item.path)
    })));
    const copy = computed(() => ({
      fr: { modes: "Les modes", tenses: mode.value.modeName, title: `${tense.label} — ${mode.value.modeName}`, description: `Découvre la place du ${tense.label} dans le mode ${mode.value.modeName}, puis entraîne-toi avec les verbes de ton choix.`, section: "Comprendre ce temps", examples: "Exemples dans ce mode", back: `Revenir au ${mode.value.modeName}`, practise: `Créer un exercice au ${tense.label}` },
      de: { modes: "Die Modi", tenses: mode.value.modeName, title: `${tense.label} — ${mode.value.modeName}`, description: `Entdecke die Rolle von ${tense.label} im Modus ${mode.value.modeName} und übe anschließend mit eigenen Verben.`, section: "Diese Zeit verstehen", examples: "Beispiele in diesem Modus", back: `Zurück zu ${mode.value.modeName}`, practise: `Übung: ${tense.label}` },
      en: { modes: "French moods", tenses: mode.value.modeName, title: `${tense.label} — ${mode.value.modeName}`, description: `Learn where ${tense.label} fits within the French ${mode.value.modeName}, then practise with your choice of verbs.`, section: "Understand this tense", examples: "Examples in this mood", back: `Back to ${mode.value.modeName}`, practise: `Practise ${tense.label}` },
      it: { modes: "I modi", tenses: mode.value.modeName, title: `${tense.label} — ${mode.value.modeName}`, description: `Scopri il ruolo di ${tense.label} nel modo ${mode.value.modeName}, poi esercitati con i verbi che preferisci.`, section: "Capire questo tempo", examples: "Esempi in questo modo", back: `Torna a ${mode.value.modeName}`, practise: `Esercitati: ${tense.label}` },
      es: { modes: "Los modos", tenses: mode.value.modeName, title: `${tense.label} — ${mode.value.modeName}`, description: `Descubre el papel de ${tense.label} en el modo ${mode.value.modeName} y practica con los verbos que elijas.`, section: "Comprender este tiempo", examples: "Ejemplos en este modo", back: `Volver a ${mode.value.modeName}`, practise: `Practicar ${tense.label}` }
    })[interfaceLocale.value]);
    const exerciseUrl = computed(() => ({
      path: localePath("/"),
      query: { mode: modeSlug, temps: tense.label }
    }));
    useHead(() => ({
      title: `${copy.value.title} : règles et exercices`,
      meta: [
        { name: "description", content: copy.value.description },
        { property: "og:title", content: copy.value.title },
        { property: "og:description", content: copy.value.description },
        { property: "og:type", content: "website" }
      ]
    }));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LearningSubnav = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "tense-page" }, _attrs))} data-v-22da4457><div class="tense-page__navigation" data-v-22da4457>`);
      _push(ssrRenderComponent(_component_LearningSubnav, {
        label: unref(copy).modes,
        items: unref(modeNavigation),
        "active-key": unref(modeSlug)
      }, null, _parent));
      _push(ssrRenderComponent(_component_LearningSubnav, {
        label: unref(copy).tenses,
        items: unref(tenseNavigation),
        "active-key": unref(tenseSlug)
      }, null, _parent));
      _push(`</div><header class="tense-page__hero" data-v-22da4457><p data-v-22da4457>${ssrInterpolate(unref(mode).modeName)} · ${ssrInterpolate(unref(tense).label)}</p><h1 data-v-22da4457>${ssrInterpolate(unref(copy).title)}</h1><p data-v-22da4457>${ssrInterpolate(unref(copy).description)}</p></header><div class="tense-page__content" data-v-22da4457><section data-v-22da4457><h2 data-v-22da4457>${ssrInterpolate(unref(copy).section)}</h2><p data-v-22da4457>${ssrInterpolate(unref(mode).purpose)}</p></section><section data-v-22da4457><h2 data-v-22da4457>${ssrInterpolate(unref(copy).examples)}</h2><ul data-v-22da4457><!--[-->`);
      ssrRenderList(unref(mode).examples, (example) => {
        _push(`<li data-v-22da4457>${ssrInterpolate(example)}</li>`);
      });
      _push(`<!--]--></ul></section></div><footer class="tense-page__actions" data-v-22da4457>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(localePath)(`/modes/${unref(modeSlug)}`)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(copy).back)}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(copy).back), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "is-primary",
        to: unref(exerciseUrl)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(copy).practise)} <span aria-hidden="true" data-v-22da4457${_scopeId}>→</span>`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(copy).practise) + " ", 1),
              createVNode("span", { "aria-hidden": "true" }, "→")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</footer></main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/modes/[mode]/[temps].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _temps_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-22da4457"]]);

export { _temps_ as default };
//# sourceMappingURL=_temps_-7eMtn0vx.mjs.map
