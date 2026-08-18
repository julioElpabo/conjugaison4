import { defineComponent, computed, withAsyncContext, unref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { h as useRoute, g as useLanguagePreferences, l as createError, u as useHead } from './server.mjs';
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
        _push(`<article${ssrRenderAttrs(mergeProps({ class: "shared-summary-page" }, _attrs))} data-v-fa4e20b3><header class="shared-summary-hero" data-v-fa4e20b3><p data-v-fa4e20b3>${ssrInterpolate(unref(ui)("BILAN PARTAGÉ"))}</p><h1 data-v-fa4e20b3>${ssrInterpolate(unref(ui)("Bilan de conjugaison"))}</h1><div class="shared-summary-score" data-v-fa4e20b3><strong data-v-fa4e20b3>${ssrInterpolate(unref(summary).score)}%</strong><span data-v-fa4e20b3>${ssrInterpolate(unref(summary).correctCount)} / ${ssrInterpolate(unref(summary).items.length)} ${ssrInterpolate(unref(summary).correctCount === 1 ? unref(ui)("réponse juste") : unref(ui)("réponses justes"))}</span></div><small data-v-fa4e20b3>${ssrInterpolate(unref(ui)("Bilan réalisé le {date}", { date: unref(formattedDate) }))}</small></header>`);
        if (unref(summary).verbs.length || unref(summary).tenses.length) {
          _push(`<section class="shared-summary-context"${ssrRenderAttr("aria-label", unref(ui)("Contenu de l’exercice"))} data-v-fa4e20b3>`);
          if (unref(summary).verbs.length) {
            _push(`<p data-v-fa4e20b3><strong data-v-fa4e20b3>${ssrInterpolate(unref(ui)("Verbes"))} :</strong> ${ssrInterpolate(unref(summary).verbs.join(", "))}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(summary).tenses.length) {
            _push(`<p data-v-fa4e20b3><strong data-v-fa4e20b3>${ssrInterpolate(unref(ui)("Temps"))} :</strong> ${ssrInterpolate(unref(summary).tenses.map((tense) => tense.mode ? `${unref(uiLabel)(tense.mode)} · ${unref(uiLabel)(tense.name)}` : unref(uiLabel)(tense.name)).join(", "))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</section>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<section class="shared-summary-results" aria-labelledby="shared-summary-results-title" data-v-fa4e20b3><h2 id="shared-summary-results-title" data-v-fa4e20b3>${ssrInterpolate(unref(ui)("Récapitulatif des réponses"))}</h2><ol data-v-fa4e20b3><!--[-->`);
        ssrRenderList(unref(summary).items, (item) => {
          _push(`<li class="${ssrRenderClass(`is-${item.status}`)}" data-v-fa4e20b3><span class="shared-summary-results__status"${ssrRenderAttr("aria-label", item.status === "correct" ? unref(ui)("Juste") : unref(ui)("À revoir"))} data-v-fa4e20b3>${ssrInterpolate(item.status === "correct" ? "✓" : "×")}</span><div data-v-fa4e20b3><h3 data-v-fa4e20b3>${ssrInterpolate(item.index)}. ${ssrInterpolate(item.questionLabel)}</h3><dl data-v-fa4e20b3><div data-v-fa4e20b3><dt data-v-fa4e20b3>${ssrInterpolate(unref(ui)("Réponse donnée"))}</dt><dd data-v-fa4e20b3>${ssrInterpolate(item.learnerAnswer || "—")}</dd></div><div data-v-fa4e20b3><dt data-v-fa4e20b3>${ssrInterpolate(unref(ui)("Bonne réponse"))}</dt><dd data-v-fa4e20b3>${ssrInterpolate(item.expectedAnswer)}</dd></div></dl>`);
          if (item.errorLabels.length) {
            _push(`<p class="shared-summary-results__errors" data-v-fa4e20b3>${ssrInterpolate(item.errorLabels.join(" · "))}</p>`);
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
const _token_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-fa4e20b3"]]);

export { _token_ as default };
//# sourceMappingURL=_token_-zcmsqjID.mjs.map
