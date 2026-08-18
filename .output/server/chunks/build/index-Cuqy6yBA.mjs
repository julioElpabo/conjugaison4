import { _ as __nuxt_component_0 } from './nuxt-link-icjx6oE7.mjs';
import { defineComponent, computed, withAsyncContext, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderComponent, ssrRenderStyle } from 'vue/server-renderer';
import { g as useLanguagePreferences, u as useHead } from './server.mjs';
import { u as useFetch } from './fetch-LM88WSA3.mjs';
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
import '@vue/shared';
import './asyncData-CjrHXDLz.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { interfaceLocale, localePath } = useLanguagePreferences();
    const copy = computed(() => ({
      fr: { eyebrow: "Défis officiels", title: "Défis de conjugaison prêts à jouer", intro: "Choisis un entraînement préparé par TATITOTU et commence immédiatement.", empty: "Aucun défi public n’est encore disponible dans cette langue.", start: "Commencer ce défi" },
      de: { eyebrow: "Offizielle Aufgaben", title: "Spielfertige Konjugationsaufgaben", intro: "Wählen Sie eine von TATITOTU vorbereitete Übung und legen Sie sofort los.", empty: "In dieser Sprache ist noch keine öffentliche Aufgabe verfügbar.", start: "Aufgabe starten" },
      en: { eyebrow: "Official challenges", title: "Ready-to-play conjugation challenges", intro: "Choose an exercise prepared by TATITOTU and start immediately.", empty: "No public challenge is available in this language yet.", start: "Start this challenge" },
      it: { eyebrow: "Sfide ufficiali", title: "Sfide di coniugazione pronte da giocare", intro: "Scegli un esercizio preparato da TATITOTU e inizia subito.", empty: "Non è ancora disponibile alcuna sfida pubblica in questa lingua.", start: "Inizia questa sfida" },
      es: { eyebrow: "Retos oficiales", title: "Retos de conjugación listos para jugar", intro: "Elige un ejercicio preparado por TATITOTU y empieza inmediatamente.", empty: "Todavía no hay ningún reto público disponible en este idioma.", start: "Empezar este reto" }
    })[interfaceLocale.value]);
    const { data: response } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/challenge-publications",
      {
        query: computed(() => ({ locale: interfaceLocale.value }))
      },
      "$EXWQ2jZhSr"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const publications = computed(() => response.value?.publications ?? []);
    const groups = computed(() => {
      const grouped = /* @__PURE__ */ new Map();
      for (const publication of publications.value) {
        const group = grouped.get(publication.categorySlug) ?? { name: publication.categoryName, items: [] };
        group.items.push(publication);
        grouped.set(publication.categorySlug, group);
      }
      return [...grouped.entries()].map(([slug, group]) => ({ slug, ...group }));
    });
    const navigationLabel = computed(() => ({
      fr: "Aller directement à un groupe de défis",
      de: "Direkt zu einer Aufgabengruppe springen",
      en: "Jump directly to a challenge group",
      it: "Vai direttamente a un gruppo di sfide",
      es: "Ir directamente a un grupo de retos"
    })[interfaceLocale.value]);
    const backToTopLabel = computed(() => ({
      fr: "Revenir en haut de la page",
      de: "Zum Seitenanfang zurückkehren",
      en: "Back to the top of the page",
      it: "Torna all’inizio della pagina",
      es: "Volver al principio de la página"
    })[interfaceLocale.value]);
    const flePageLabel = computed(() => ({
      fr: "Découvrir les exercices de conjugaison FLE",
      de: "FLE-Konjugationsübungen entdecken",
      en: "Explore FLE French conjugation exercises",
      it: "Scopri gli esercizi di coniugazione FLE",
      es: "Descubre los ejercicios de conjugación FLE"
    })[interfaceLocale.value]);
    const showBackToTop = ref(false);
    const backToTopBottom = ref(84);
    function groupAnchor(slug) {
      return `groupe-defis-${slug}`;
    }
    useHead(() => ({
      title: `${copy.value.title} | TATITOTU`,
      titleTemplate: null,
      meta: [
        { name: "description", content: copy.value.intro },
        { property: "og:title", content: copy.value.title },
        { property: "og:description", content: copy.value.intro }
      ]
    }));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "challenge-library" }, _attrs))} data-v-a16803a3><header data-v-a16803a3><p data-v-a16803a3>${ssrInterpolate(unref(copy).eyebrow)}</p><h1 data-v-a16803a3>${ssrInterpolate(unref(copy).title)}</h1><span data-v-a16803a3>${ssrInterpolate(unref(copy).intro)}</span></header>`);
      if (unref(groups).length) {
        _push(`<nav class="challenge-library__navigation"${ssrRenderAttr("aria-label", unref(navigationLabel))} data-v-a16803a3><p data-v-a16803a3>${ssrInterpolate(unref(navigationLabel))}</p><div data-v-a16803a3><!--[-->`);
        ssrRenderList(unref(groups), (group) => {
          _push(`<a${ssrRenderAttr("href", `#${groupAnchor(group.slug)}`)} data-v-a16803a3><span data-v-a16803a3>${ssrInterpolate(group.name)}</span><small data-v-a16803a3>${ssrInterpolate(group.items.length)}</small></a>`);
        });
        _push(`<!--]--></div></nav>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(groups).length) {
        _push(`<p class="challenge-library__empty" data-v-a16803a3>${ssrInterpolate(unref(copy).empty)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(groups), (group) => {
        _push(`<section${ssrRenderAttr("id", groupAnchor(group.slug))} data-v-a16803a3><div class="challenge-library__section-heading" data-v-a16803a3><h2 data-v-a16803a3>${ssrInterpolate(group.name)}</h2>`);
        if (group.slug === "cif") {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: unref(localePath)("/conjugaison-fle")
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(flePageLabel))} <span aria-hidden="true" data-v-a16803a3${_scopeId}>→</span>`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(flePageLabel)) + " ", 1),
                  createVNode("span", { "aria-hidden": "true" }, "→")
                ];
              }
            }),
            _: 2
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="challenge-library__grid" data-v-a16803a3><!--[-->`);
        ssrRenderList(group.items, (publication) => {
          _push(`<article data-v-a16803a3><h3 data-v-a16803a3>${ssrInterpolate(publication.title)}</h3><p data-v-a16803a3>${ssrInterpolate(publication.description)}</p>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: unref(localePath)(`/defis/${publication.slug}`)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(copy).start)} <span aria-hidden="true" data-v-a16803a3${_scopeId}>→</span>`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(copy).start) + " ", 1),
                  createVNode("span", { "aria-hidden": "true" }, "→")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</article>`);
        });
        _push(`<!--]--></div></section>`);
      });
      _push(`<!--]-->`);
      if (unref(showBackToTop)) {
        _push(`<button class="challenge-library__back-to-top" type="button"${ssrRenderAttr("aria-label", unref(backToTopLabel))}${ssrRenderAttr("title", unref(backToTopLabel))} style="${ssrRenderStyle({ bottom: `${unref(backToTopBottom)}px` })}" data-v-a16803a3><span aria-hidden="true" data-v-a16803a3>↑</span></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/defis/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a16803a3"]]);

export { index as default };
//# sourceMappingURL=index-Cuqy6yBA.mjs.map
