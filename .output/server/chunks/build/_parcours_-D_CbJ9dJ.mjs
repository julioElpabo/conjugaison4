import { _ as __nuxt_component_0 } from './nuxt-link-icjx6oE7.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { t as tenseExercisePage, r as relatedTenseExercisePages } from '../_/tense-exercise-pages.mjs';
import { g as useRoute, f as useLanguagePreferences, n as navigateTo, l as createError, u as useHead, q as useSeoMeta } from './server.mjs';
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
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[parcours]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const { localePath } = useLanguagePreferences();
    const requestedSlug = String(route.params.parcours || "");
    const canonicalSlug = requestedSlug === "present" ? "present-indicatif" : requestedSlug;
    if (requestedSlug === "present") {
      [__temp, __restore] = withAsyncContext(() => navigateTo(localePath("/exercices/present-indicatif"), { redirectCode: 301, replace: true })), await __temp, __restore();
    }
    const page = tenseExercisePage(canonicalSlug);
    if (!page) {
      throw createError({ statusCode: 404, statusMessage: "Temps introuvable" });
    }
    const relatedPages = relatedTenseExercisePages(page);
    const generalExercisesUrl = computed(() => localePath("/exercices-de-conjugaison"));
    const startsWithVowel = /^[aeiouyéèêàâîïôöùûü]/iu.test(page.label);
    const practiceLabel = `${startsWithVowel ? "à l’" : "au "}${page.label}`;
    const definiteLabel = `${startsWithVowel ? "l’" : "le "}${page.label}`;
    const exerciseUrl = computed(() => ({
      path: generalExercisesUrl.value,
      query: { mode: page.mode, temps: page.queryTense }
    }));
    useHead(() => ({
      title: page.title,
      titleTemplate: null,
      meta: [
        { name: "description", content: page.description },
        { property: "og:title", content: page.title },
        { property: "og:description", content: page.description },
        { property: "og:type", content: "website" }
      ],
      script: [{
        key: "tense-exercise-learning-resource",
        type: "application/ld+json",
        textContent: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: page.h1,
          description: page.description,
          learningResourceType: "Exercise",
          educationalUse: "Practice",
          inLanguage: "fr",
          teaches: `Conjugaison française : ${page.label}`,
          isAccessibleForFree: true
        })
      }]
    }));
    useSeoMeta({ twitterCard: "summary" });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "tense-exercise-page" }, _attrs))} data-v-0b226aa0><header class="tense-exercise-page__hero" data-v-0b226aa0><p data-v-0b226aa0>Exercices de conjugaison · ${ssrInterpolate(unref(page).mode)}</p><h1 data-v-0b226aa0>${ssrInterpolate(unref(page).h1)}</h1><p data-v-0b226aa0>${ssrInterpolate(unref(page).intro)}</p>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "exercise-landing__primary",
        to: unref(exerciseUrl)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Commencer les exercices ${ssrInterpolate(practiceLabel)}`);
          } else {
            return [
              createTextVNode("Commencer les exercices " + toDisplayString(practiceLabel))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</header><section class="tense-exercise-page__practice" aria-labelledby="practice-title" data-v-0b226aa0><div data-v-0b226aa0><p data-v-0b226aa0>Temps présélectionné</p><h2 id="practice-title" data-v-0b226aa0>Créez votre exercice ${ssrInterpolate(practiceLabel)}</h2><span data-v-0b226aa0>Choisissez les verbes, le nombre de questions et le format de votre entraînement.</span></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: unref(exerciseUrl) }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Commencer les exercices ${ssrInterpolate(practiceLabel)} <span aria-hidden="true" data-v-0b226aa0${_scopeId}>→</span>`);
          } else {
            return [
              createTextVNode("Commencer les exercices " + toDisplayString(practiceLabel) + " "),
              createVNode("span", { "aria-hidden": "true" }, "→")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</section><section class="tense-exercise-page__explanation" data-v-0b226aa0><h2 data-v-0b226aa0>À quoi sert ${ssrInterpolate(definiteLabel)} ?</h2><p data-v-0b226aa0>${ssrInterpolate(unref(page).explanation)}</p></section><nav class="tense-exercise-page__related" aria-labelledby="related-title" data-v-0b226aa0><h2 id="related-title" data-v-0b226aa0>Autres exercices de conjugaison</h2><ul data-v-0b226aa0><!--[-->`);
      ssrRenderList(unref(relatedPages), (related) => {
        _push(`<li data-v-0b226aa0>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: unref(localePath)(`/exercices/${related.slug}`)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(related.label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(related.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ul></nav>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "tense-exercise-page__back",
        to: unref(generalExercisesUrl)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span aria-hidden="true" data-v-0b226aa0${_scopeId}>←</span> Retour aux exercices de conjugaison`);
          } else {
            return [
              createVNode("span", { "aria-hidden": "true" }, "←"),
              createTextVNode(" Retour aux exercices de conjugaison")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/exercices/[parcours].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _parcours_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0b226aa0"]]);

export { _parcours_ as default };
//# sourceMappingURL=_parcours_-D_CbJ9dJ.mjs.map
