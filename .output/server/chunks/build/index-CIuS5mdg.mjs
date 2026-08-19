import { _ as __nuxt_component_0$1 } from './nuxt-link-icjx6oE7.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { i as isModeLandingSlug, m as modeLandingPage, M as MODE_LANDING_SLUGS } from '../_/mode-landing-pages.mjs';
import { m as modeTensePages } from '../_/mode-tense-pages.mjs';
import { g as useRoute, f as useLanguagePreferences, l as createError, u as useHead, q as useSeoMeta } from './server.mjs';
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

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "LearningSubnav",
  __ssrInlineRender: true,
  props: {
    label: {},
    items: {},
    activeKey: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<nav${ssrRenderAttrs(mergeProps({
        class: "learning-subnav",
        "aria-label": __props.label
      }, _attrs))} data-v-9e05e343><span class="learning-subnav__label" data-v-9e05e343>${ssrInterpolate(__props.label)}</span><ul data-v-9e05e343><!--[-->`);
      ssrRenderList(__props.items, (item) => {
        _push(`<li data-v-9e05e343>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: item.to,
          class: { "is-active": item.key === __props.activeKey },
          "aria-current": item.key === __props.activeKey ? "page" : void 0
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(item.label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(item.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ul></nav>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/learning/LearningSubnav.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-9e05e343"]]), { __name: "LearningSubnav" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { interfaceLocale, localePath } = useLanguagePreferences();
    const slug = String(route.params.mode || "");
    if (!isModeLandingSlug(slug)) {
      throw createError({ statusCode: 404, statusMessage: "Mode introuvable" });
    }
    const page = computed(() => modeLandingPage(slug, interfaceLocale.value));
    const modeNavigation = computed(() => MODE_LANDING_SLUGS.map((modeSlug) => ({
      key: modeSlug,
      label: modeLandingPage(modeSlug, interfaceLocale.value).modeName,
      to: localePath(`/modes/${modeSlug}`)
    })));
    const navigationLabel = computed(() => ({
      fr: "Les modes",
      de: "Die Modi",
      en: "French moods",
      it: "I modi",
      es: "Los modos"
    })[interfaceLocale.value]);
    const tenseItems = computed(() => modeTensePages(slug).map((tense) => ({
      key: tense.slug,
      label: tense.label,
      to: localePath(tense.path)
    })));
    const exerciseUrl = computed(() => ({ path: localePath("/exercices-de-conjugaison"), query: { mode: slug } }));
    useHead(() => ({
      title: page.value.metaTitle,
      meta: [
        { name: "description", content: page.value.description },
        { property: "og:title", content: page.value.metaTitle },
        { property: "og:description", content: page.value.description },
        { property: "og:type", content: "website" }
      ],
      script: [{
        key: "mode-learning-resource",
        type: "application/ld+json",
        textContent: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: page.value.title,
          description: page.value.description,
          learningResourceType: "Lesson",
          educationalUse: ["Instruction", "Practice"],
          inLanguage: interfaceLocale.value,
          teaches: `Conjugaison française : ${page.value.modeName}`,
          isAccessibleForFree: true
        })
      }]
    }));
    useSeoMeta({ twitterCard: "summary" });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LearningSubnav = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "mode-landing" }, _attrs))} data-v-0fafbab4><div class="mode-landing__navigation" data-v-0fafbab4>`);
      _push(ssrRenderComponent(_component_LearningSubnav, {
        label: unref(navigationLabel),
        items: unref(modeNavigation),
        "active-key": unref(slug)
      }, null, _parent));
      _push(`</div><header class="mode-landing__hero" data-v-0fafbab4><p data-v-0fafbab4>${ssrInterpolate(unref(page).eyebrow)}</p><h1 data-v-0fafbab4>${ssrInterpolate(unref(page).title)}</h1>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: unref(exerciseUrl) }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(page).ctaLabel)}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(page).ctaLabel), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</header><div class="mode-landing__content" data-v-0fafbab4><section class="mode-purpose" data-v-0fafbab4><span data-v-0fafbab4>01</span><div data-v-0fafbab4><h2 data-v-0fafbab4>${ssrInterpolate(unref(page).purposeTitle)}</h2><p data-v-0fafbab4>${ssrInterpolate(unref(page).purpose)}</p></div></section><section class="mode-panel" data-v-0fafbab4><h2 data-v-0fafbab4>${ssrInterpolate(unref(page).examplesTitle)}</h2><ul data-v-0fafbab4><!--[-->`);
      ssrRenderList(unref(page).examples, (example) => {
        _push(`<li data-v-0fafbab4>${ssrInterpolate(example)}</li>`);
      });
      _push(`<!--]--></ul></section><section class="mode-panel mode-panel--watch" data-v-0fafbab4><h2 data-v-0fafbab4>${ssrInterpolate(unref(page).watchTitle)}</h2><ul data-v-0fafbab4><!--[-->`);
      ssrRenderList(unref(page).watchItems, (item) => {
        _push(`<li data-v-0fafbab4>${ssrInterpolate(item)}</li>`);
      });
      _push(`<!--]--></ul></section><section class="mode-tenses"${ssrRenderAttr("aria-labelledby", `${unref(slug)}-tenses-title`)} data-v-0fafbab4><div data-v-0fafbab4><p data-v-0fafbab4>02</p><div data-v-0fafbab4><h2${ssrRenderAttr("id", `${unref(slug)}-tenses-title`)} data-v-0fafbab4>${ssrInterpolate(unref(page).tensesTitle)}</h2><span data-v-0fafbab4>Choisis un temps pour comprendre son rôle précis, sa formation et les raisons de son emploi dans plusieurs contextes.</span></div></div>`);
      _push(ssrRenderComponent(_component_LearningSubnav, {
        label: unref(page).modeName,
        items: unref(tenseItems),
        "active-key": ""
      }, null, _parent));
      _push(`</section><section class="mode-cta" data-v-0fafbab4><div data-v-0fafbab4><p data-v-0fafbab4>${ssrInterpolate(unref(page).eyebrow)}</p><h2 data-v-0fafbab4>${ssrInterpolate(unref(page).ctaTitle)}</h2><span data-v-0fafbab4>${ssrInterpolate(unref(page).ctaText)}</span></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: unref(exerciseUrl) }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(page).ctaLabel)} <span aria-hidden="true" data-v-0fafbab4${_scopeId}>→</span>`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(page).ctaLabel) + " ", 1),
              createVNode("span", { "aria-hidden": "true" }, "→")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</section></div></main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/modes/[mode]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0fafbab4"]]);

export { index as default };
//# sourceMappingURL=index-CIuS5mdg.mjs.map
