import { _ as __nuxt_component_0 } from './nuxt-link-icjx6oE7.mjs';
import { defineComponent, computed, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { W as WizardChallengeWorkspace } from './WizardChallengeWorkspace-CPuznDLN.mjs';
import { a as TENSE_EXERCISE_PAGES } from '../_/tense-exercise-pages.mjs';
import { f as useLanguagePreferences, g as useRoute, u as useHead, c as useRuntimeConfig } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../nitro/nitro.mjs';
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
import '../_/guided-tour.mjs';
import '../_/challenge-defaults.mjs';
import '@fortawesome/vue-fontawesome';
import '@fortawesome/free-solid-svg-icons';
import '../_/passive-voice.mjs';
import './useSiteAnalytics-Bd_7Kr2F.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import '../_/conjugation-display.mjs';
import '../_/near-future.mjs';
import '../_/verb-search.mjs';
import './main-CrmznQVJ.mjs';
import './useLearnerAuth-tqISusbB.mjs';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "exercices-de-conjugaison",
  __ssrInlineRender: true,
  setup(__props) {
    const { ui, interfaceLocale, localePath } = useLanguagePreferences();
    const config = useRuntimeConfig();
    const route = useRoute();
    const description = computed(() => ui("Exercices de conjugaison française gratuits, interactifs et personnalisables. Entraînez-vous aux temps et aux verbes de votre choix, sans publicité."));
    const pageTitle = computed(() => interfaceLocale.value === "fr" ? "Exercices de conjugaison française gratuits | TATITOTU" : `${ui("Exercices de conjugaison française gratuits et sans publicité")} | TATITOTU`);
    const pageUrl = computed(() => `${String(config.public.siteUrl).replace(/\/$/u, "")}${route.path}`);
    useHead(() => ({
      title: pageTitle.value,
      titleTemplate: null,
      meta: [
        { name: "description", content: description.value },
        { property: "og:description", content: description.value }
      ],
      script: [{
        key: "exercise-learning-resource",
        type: "application/ld+json",
        textContent: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: pageTitle.value,
          description: description.value,
          url: pageUrl.value,
          learningResourceType: "Interactive resource",
          educationalUse: ["Instruction", "Practice"],
          inLanguage: interfaceLocale.value,
          teaches: ui("Conjugaison française"),
          isAccessibleForFree: true
        })
      }]
    }));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-b168657c>`);
      _push(ssrRenderComponent(WizardChallengeWorkspace, {
        "home-heading": unref(ui)("Exercices de conjugaison française")
      }, null, _parent));
      _push(`<section class="tense-links" aria-labelledby="tense-links-title" data-v-b168657c><h2 id="tense-links-title" data-v-b168657c>Exercices par temps</h2><ul data-v-b168657c><!--[-->`);
      ssrRenderList(unref(TENSE_EXERCISE_PAGES), (page) => {
        _push(`<li data-v-b168657c>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: unref(localePath)(`/exercices/${page.slug}`)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(page.linkLabel)}`);
            } else {
              return [
                createTextVNode(toDisplayString(page.linkLabel), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ul></section></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/exercices-de-conjugaison.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const exercicesDeConjugaison = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b168657c"]]);

export { exercicesDeConjugaison as default };
//# sourceMappingURL=exercices-de-conjugaison-CuXLrQtQ.mjs.map
