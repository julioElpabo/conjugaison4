import { defineComponent, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { W as WizardChallengeWorkspace } from './WizardChallengeWorkspace-CRI3VPAO.mjs';
import { f as useLanguagePreferences, u as useHead } from './server.mjs';
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
import './url-BYGmH4vU.mjs';
import '../_/challenge-defaults.mjs';
import './state-DjsguMyT.mjs';
import '@fortawesome/vue-fontawesome';
import '@fortawesome/free-solid-svg-icons';
import './_plugin-vue_export-helper-1tPrXgE0.mjs';
import './useSiteAnalytics-D1wpWTOZ.mjs';
import '../_/exercise-instructions.mjs';
import './nuxt-link-icjx6oE7.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import '../_/conjugation-display.mjs';
import '../_/near-future.mjs';
import '../_/verb-search.mjs';
import '../_/guided-tour.mjs';
import './main-A4EiZdXZ.mjs';
import './CoachHelpPanel-Bf20pXup.mjs';
import '../_/coach.mjs';
import '../_/coach-help-audit.mjs';
import '../_/coach-dialogue.mjs';
import './useLearnerAuth-BLt5hOAV.mjs';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "nouveau-defi",
  __ssrInlineRender: true,
  setup(__props) {
    const { ui } = useLanguagePreferences();
    useHead(() => ({
      title: ui("Nouveau parcours"),
      meta: [
        {
          name: "description",
          content: ui("Composez un défi de conjugaison en choisissant les verbes, les modes et les temps.")
        }
      ]
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(WizardChallengeWorkspace, _attrs, null, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/nouveau-defi.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=nouveau-defi-Jkgl-0V6.mjs.map
