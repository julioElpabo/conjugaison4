import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { W as WizardChallengeWorkspace } from './WizardChallengeWorkspace-Dk0MPN9x.mjs';
import { f as useLanguagePreferences, g as useRoute, u as useHead } from './server.mjs';
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
import './url-Bv99RUXn.mjs';
import '../_/challenge-defaults.mjs';
import './state-DjsguMyT.mjs';
import '@fortawesome/vue-fontawesome';
import '@fortawesome/free-solid-svg-icons';
import '../_/passive-voice.mjs';
import './_plugin-vue_export-helper-1tPrXgE0.mjs';
import './useSiteAnalytics-D1wpWTOZ.mjs';
import './nuxt-link-icjx6oE7.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import '../_/conjugation-display.mjs';
import '../_/near-future.mjs';
import '../_/verb-search.mjs';
import '../_/guided-tour.mjs';
import './CoachPicker-BZYkJ1oV.mjs';
import './CoachHelpPanel-CV6-CBeI.mjs';
import '../_/coach.mjs';
import '../_/coach-help-audit.mjs';
import '../_/coach-dialogue.mjs';
import '../_/identification-form.mjs';
import '../_/mode-landing-pages.mjs';
import '../_/mode-tense-pedagogy.mjs';
import './useLearnerAuth-BLt5hOAV.mjs';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[code]",
  __ssrInlineRender: true,
  setup(__props) {
    const { ui } = useLanguagePreferences();
    const route = useRoute();
    const code = computed(() => String(route.params.code ?? ""));
    useHead(() => ({
      title: ui("Défi {code} · Conjugaison", { code: code.value }),
      meta: [
        { name: "description", content: ui("Ouvrir et réaliser le défi de conjugaison {code}.", { code: code.value }) }
      ]
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(WizardChallengeWorkspace, mergeProps({ "initial-code": unref(code) }, _attrs), null, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/defi/[code].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_code_-jSkgudC2.mjs.map
