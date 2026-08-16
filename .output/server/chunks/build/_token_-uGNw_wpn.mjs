import { defineComponent, computed, withAsyncContext, unref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { g as useRoute, f as useLanguagePreferences, k as createError, u as useHead } from './server.mjs';
import { u as useFetch } from './fetch-CA_A3qtF.mjs';
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
import '@vue/shared';
import './asyncData-BBDHP0iC.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[token]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const { ui, uiLabel, interfaceLocale } = useLanguagePreferences();
    const token = computed(() => String(route.params.token || ""));
    const { data: summary, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/bilans/${encodeURIComponent(token.value)}`,
      "$kS3c3FjcZy"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    if (error.value || !summary.value) {
      throw createError({ statusCode: error.value?.statusCode || 404, statusMessage: ui("Bilan introuvable") });
    }
    const formattedDate = computed(() => new Intl.DateTimeFormat(`${interfaceLocale.value}-CH`, {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date(summary.value.createdAt)));
    useHead(() => ({
      title: ui("Bilan de conjugaison partagé"),
      meta: [
        { name: "description", content: ui("Consulter un bilan de conjugaison partagé.") },
        { name: "robots", content: "noindex, nofollow" }
      ]
    }));
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(summary)) {
        _push(`<article${ssrRenderAttrs(mergeProps({ class: "shared-summary-page" }, _attrs))} data-v-a5d6b1bf><header class="shared-summary-hero" data-v-a5d6b1bf><p data-v-a5d6b1bf>${ssrInterpolate(unref(ui)("BILAN PARTAGÉ"))}</p><h1 data-v-a5d6b1bf>${ssrInterpolate(unref(ui)("Bilan de conjugaison"))}</h1><div class="shared-summary-score" data-v-a5d6b1bf><strong data-v-a5d6b1bf>${ssrInterpolate(unref(summary).score)}%</strong><span data-v-a5d6b1bf>${ssrInterpolate(unref(summary).correctCount)} / ${ssrInterpolate(unref(summary).items.length)} ${ssrInterpolate(unref(summary).correctCount === 1 ? unref(ui)("réponse juste") : unref(ui)("réponses justes"))}</span></div><small data-v-a5d6b1bf>${ssrInterpolate(unref(ui)("Bilan réalisé le {date}", { date: unref(formattedDate) }))}</small></header>`);
        if (unref(summary).verbs.length || unref(summary).tenses.length) {
          _push(`<section class="shared-summary-context"${ssrRenderAttr("aria-label", unref(ui)("Contenu de l’exercice"))} data-v-a5d6b1bf>`);
          if (unref(summary).verbs.length) {
            _push(`<p data-v-a5d6b1bf><strong data-v-a5d6b1bf>${ssrInterpolate(unref(ui)("Verbes"))} :</strong> ${ssrInterpolate(unref(summary).verbs.join(", "))}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(summary).tenses.length) {
            _push(`<p data-v-a5d6b1bf><strong data-v-a5d6b1bf>${ssrInterpolate(unref(ui)("Temps"))} :</strong> ${ssrInterpolate(unref(summary).tenses.map((tense) => tense.mode ? `${unref(uiLabel)(tense.mode)} · ${unref(uiLabel)(tense.name)}` : unref(uiLabel)(tense.name)).join(", "))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</section>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<section class="shared-summary-results" aria-labelledby="shared-summary-results-title" data-v-a5d6b1bf><h2 id="shared-summary-results-title" data-v-a5d6b1bf>${ssrInterpolate(unref(ui)("Récapitulatif des réponses"))}</h2><ol data-v-a5d6b1bf><!--[-->`);
        ssrRenderList(unref(summary).items, (item) => {
          _push(`<li class="${ssrRenderClass(`is-${item.status}`)}" data-v-a5d6b1bf><span class="shared-summary-results__status"${ssrRenderAttr("aria-label", item.status === "correct" ? unref(ui)("Juste") : unref(ui)("À revoir"))} data-v-a5d6b1bf>${ssrInterpolate(item.status === "correct" ? "✓" : "×")}</span><div data-v-a5d6b1bf><h3 data-v-a5d6b1bf>${ssrInterpolate(item.index)}. ${ssrInterpolate(item.questionLabel)}</h3><dl data-v-a5d6b1bf><div data-v-a5d6b1bf><dt data-v-a5d6b1bf>${ssrInterpolate(unref(ui)("Réponse donnée"))}</dt><dd data-v-a5d6b1bf>${ssrInterpolate(item.learnerAnswer || "—")}</dd></div><div data-v-a5d6b1bf><dt data-v-a5d6b1bf>${ssrInterpolate(unref(ui)("Bonne réponse"))}</dt><dd data-v-a5d6b1bf>${ssrInterpolate(item.expectedAnswer)}</dd></div></dl>`);
          if (item.errorLabels.length) {
            _push(`<p class="shared-summary-results__errors" data-v-a5d6b1bf>${ssrInterpolate(item.errorLabels.join(" · "))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></li>`);
        });
        _push(`<!--]--></ol></section></article>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/bilan/[token].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _token_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a5d6b1bf"]]);

export { _token_ as default };
//# sourceMappingURL=_token_-uGNw_wpn.mjs.map
