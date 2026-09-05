import { _ as __nuxt_component_0 } from './nuxt-link-icjx6oE7.mjs';
import { defineComponent, computed, withAsyncContext, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderComponent, ssrRenderStyle } from 'vue/server-renderer';
import { w as withDutchVariants } from '../nitro/nitro.mjs';
import { f as useLanguagePreferences, u as useHead } from './server.mjs';
import { u as useFetch } from './fetch-Co7nvrA6.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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
import './asyncData--5yVuH0M.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { interfaceLocale, localePath } = useLanguagePreferences();
    const copy = computed(() => withDutchVariants({
      fr: { eyebrow: "Défis officiels", title: "Défis de conjugaison prêts à jouer", intro: "Choisis un entraînement préparé par TATITOTU et commence immédiatement.", empty: "Aucun défi public n’est encore disponible dans cette langue.", start: "Commencer ce défi" },
      de: { eyebrow: "Offizielle Aufgaben", title: "Spielfertige Konjugationsaufgaben", intro: "Wählen Sie eine von TATITOTU vorbereitete Übung und legen Sie sofort los.", empty: "In dieser Sprache ist noch keine öffentliche Aufgabe verfügbar.", start: "Aufgabe starten" },
      en: { eyebrow: "Official challenges", title: "Ready-to-play conjugation challenges", intro: "Choose an exercise prepared by TATITOTU and start immediately.", empty: "No public challenge is available in this language yet.", start: "Start this challenge" },
      it: { eyebrow: "Sfide ufficiali", title: "Sfide di coniugazione pronte da giocare", intro: "Scegli un esercizio preparato da TATITOTU e inizia subito.", empty: "Non è ancora disponibile alcuna sfida pubblica in questa lingua.", start: "Inizia questa sfida" },
      es: { eyebrow: "Retos oficiales", title: "Retos de conjugación listos para jugar", intro: "Elige un ejercicio preparado por TATITOTU y empieza inmediatamente.", empty: "Todavía no hay ningún reto público disponible en este idioma.", start: "Empezar este reto" },
      nl: { eyebrow: "Officiële uitdagingen", title: "Kant-en-klare vervoegingsuitdagingen", intro: "Kies een oefening van TATITOTU en begin meteen.", empty: "Er is nog geen openbare uitdaging in deze taal beschikbaar.", start: "Start deze uitdaging" }
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
    const navigationLabel = computed(() => withDutchVariants({
      fr: "Aller directement à un groupe de défis",
      de: "Direkt zu einer Aufgabengruppe springen",
      en: "Jump directly to a challenge group",
      it: "Vai direttamente a un gruppo di sfide",
      es: "Ir directamente a un grupo de retos",
      nl: "Ga rechtstreeks naar een groep uitdagingen"
    })[interfaceLocale.value]);
    const backToTopLabel = computed(() => withDutchVariants({
      fr: "Revenir en haut de la page",
      de: "Zum Seitenanfang zurückkehren",
      en: "Back to the top of the page",
      it: "Torna all’inizio della pagina",
      es: "Volver al principio de la página",
      nl: "Terug naar boven"
    })[interfaceLocale.value]);
    const flePageLabel = computed(() => withDutchVariants({
      fr: "Découvrir les exercices de conjugaison FLE",
      de: "FLE-Konjugationsübungen entdecken",
      en: "Explore FLE French conjugation exercises",
      it: "Scopri gli esercizi di coniugazione FLE",
      es: "Descubre los ejercicios de conjugación FLE",
      nl: "Ontdek oefeningen op Franse vervoeging voor anderstaligen"
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
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "challenge-library" }, _attrs))} data-v-7ca00a6f><header data-v-7ca00a6f><p data-v-7ca00a6f>${ssrInterpolate(unref(copy).eyebrow)}</p><h1 data-v-7ca00a6f>${ssrInterpolate(unref(copy).title)}</h1><span data-v-7ca00a6f>${ssrInterpolate(unref(copy).intro)}</span></header>`);
      if (unref(groups).length) {
        _push(`<nav class="challenge-library__navigation"${ssrRenderAttr("aria-label", unref(navigationLabel))} data-v-7ca00a6f><p data-v-7ca00a6f>${ssrInterpolate(unref(navigationLabel))}</p><div data-v-7ca00a6f><!--[-->`);
        ssrRenderList(unref(groups), (group) => {
          _push(`<a${ssrRenderAttr("href", `#${groupAnchor(group.slug)}`)} data-v-7ca00a6f><span data-v-7ca00a6f>${ssrInterpolate(group.name)}</span><small data-v-7ca00a6f>${ssrInterpolate(group.items.length)}</small></a>`);
        });
        _push(`<!--]--></div></nav>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(groups).length) {
        _push(`<p class="challenge-library__empty" data-v-7ca00a6f>${ssrInterpolate(unref(copy).empty)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(groups), (group) => {
        _push(`<section${ssrRenderAttr("id", groupAnchor(group.slug))} data-v-7ca00a6f><div class="challenge-library__section-heading" data-v-7ca00a6f><h2 data-v-7ca00a6f>${ssrInterpolate(group.name)}</h2>`);
        if (group.slug === "cif") {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: unref(localePath)("/conjugaison-fle")
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(flePageLabel))} <span aria-hidden="true" data-v-7ca00a6f${_scopeId}>→</span>`);
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
        _push(`</div><div class="challenge-library__grid" data-v-7ca00a6f><!--[-->`);
        ssrRenderList(group.items, (publication) => {
          _push(`<article data-v-7ca00a6f><h3 data-v-7ca00a6f>${ssrInterpolate(publication.title)}</h3><p data-v-7ca00a6f>${ssrInterpolate(publication.description)}</p>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: unref(localePath)(`/defis/${publication.slug}`)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(copy).start)} <span aria-hidden="true" data-v-7ca00a6f${_scopeId}>→</span>`);
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
        _push(`<button class="challenge-library__back-to-top" type="button"${ssrRenderAttr("aria-label", unref(backToTopLabel))}${ssrRenderAttr("title", unref(backToTopLabel))} style="${ssrRenderStyle({ bottom: `${unref(backToTopBottom)}px` })}" data-v-7ca00a6f><span aria-hidden="true" data-v-7ca00a6f>↑</span></button>`);
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
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-7ca00a6f"]]);

export { index as default };
//# sourceMappingURL=index-Zf7iS1LL.mjs.map
