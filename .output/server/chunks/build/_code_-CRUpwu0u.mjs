import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { W as WizardChallengeWorkspace } from './WizardChallengeWorkspace-Hw3RxA8F.mjs';
import { g as useLanguagePreferences, h as useRoute, u as useHead } from './server.mjs';
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
import './_plugin-vue_export-helper-1tPrXgE0.mjs';
import './useSiteAnalytics-Dqt6jAGm.mjs';
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
import './main-mlnFKERp.mjs';
import './useLearnerAuth-CauYcSRJ.mjs';
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
//# sourceMappingURL=_code_-CRUpwu0u.mjs.map
