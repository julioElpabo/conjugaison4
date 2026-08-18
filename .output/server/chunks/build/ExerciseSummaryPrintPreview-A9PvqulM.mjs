import { defineComponent, useTemplateRef, ref, computed, unref, useSSRContext } from 'vue';
import { ssrRenderTeleport, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderAttr } from 'vue/server-renderer';
import { g as useLanguagePreferences } from './server.mjs';
import { u as useSiteAnalytics } from './useSiteAnalytics-Dqt6jAGm.mjs';
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
  __name: "ExerciseSummaryPrintPreview",
  __ssrInlineRender: true,
  props: {
    items: {},
    score: {},
    correctCount: {},
    verbs: {},
    tenses: {}
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const { ui, interfaceLocale } = useLanguagePreferences();
    useSiteAnalytics();
    useTemplateRef("summary-print-dialog");
    useTemplateRef("summary-print-frame");
    const pdfPreviewUrl = ref("");
    const previewError = ref("");
    const isPreviewBusy = ref(true);
    const isFrameReady = ref(false);
    const isPdfBusy = ref(false);
    computed(() => new Intl.DateTimeFormat(`${interfaceLocale.value}-CH`, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(/* @__PURE__ */ new Date()).replace(",", ""));
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="summary-print-overlay" role="dialog" aria-modal="true" aria-labelledby="summary-print-title" data-v-a316d3c6><section class="summary-print-modal" data-v-a316d3c6><header class="summary-print-toolbar" data-v-a316d3c6><h2 id="summary-print-title" data-v-a316d3c6>${ssrInterpolate(unref(ui)("Aperçu du bilan"))}</h2><div data-v-a316d3c6><button type="button" class="secondary-button" data-v-a316d3c6>${ssrInterpolate(unref(ui)("Fermer"))}</button><button type="button" class="secondary-button"${ssrIncludeBooleanAttr(!unref(pdfPreviewUrl) || !unref(isFrameReady)) ? " disabled" : ""} data-v-a316d3c6>${ssrInterpolate(unref(ui)("Imprimer"))}</button><button type="button" class="primary-button"${ssrIncludeBooleanAttr(unref(isPdfBusy)) ? " disabled" : ""} data-v-a316d3c6>${ssrInterpolate(unref(isPdfBusy) ? "Création…" : "PDF")}</button></div></header><main class="summary-print-preview" data-v-a316d3c6>`);
        if (unref(pdfPreviewUrl)) {
          _push2(`<iframe${ssrRenderAttr("src", `${unref(pdfPreviewUrl)}#view=FitH&toolbar=0&navpanes=0`)}${ssrRenderAttr("title", unref(ui)("Aperçu du bilan au format PDF"))} data-v-a316d3c6></iframe>`);
        } else {
          _push2(`<!---->`);
        }
        if (!unref(previewError) && (unref(isPreviewBusy) || !unref(isFrameReady))) {
          _push2(`<div class="summary-print-state" role="status" aria-live="polite" data-v-a316d3c6><span aria-hidden="true" data-v-a316d3c6></span><strong data-v-a316d3c6>${ssrInterpolate(unref(ui)("Création de l’aperçu PDF…"))}</strong></div>`);
        } else {
          _push2(`<!---->`);
        }
        if (unref(previewError)) {
          _push2(`<div class="summary-print-state summary-print-state--error" role="alert" data-v-a316d3c6><strong data-v-a316d3c6>${ssrInterpolate(unref(previewError))}</strong><button type="button" class="secondary-button" data-v-a316d3c6>${ssrInterpolate(unref(ui)("Réessayer"))}</button></div>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</main></section></div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/exercise/ExerciseSummaryPrintPreview.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ExerciseSummaryPrintPreview = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-a316d3c6"]]), { __name: "ExerciseSummaryPrintPreview" });

export { ExerciseSummaryPrintPreview as default };
//# sourceMappingURL=ExerciseSummaryPrintPreview-A9PvqulM.mjs.map
