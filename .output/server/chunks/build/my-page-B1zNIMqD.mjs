import { _ as __nuxt_component_0 } from './LearnerSpace-CyIJEhoa.mjs';
import { defineComponent, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { f as useLanguagePreferences, u as useHead } from './server.mjs';
import './main-A4EiZdXZ.mjs';
import './CoachHelpPanel-Bf20pXup.mjs';
import '../_/coach.mjs';
import '../_/coach-help-audit.mjs';
import '../_/near-future.mjs';
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
import './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../_/coach-dialogue.mjs';
import './useSiteAnalytics-D1wpWTOZ.mjs';
import './state-DjsguMyT.mjs';
import './useLearnerAuth-BLt5hOAV.mjs';
import './useColorTheme-Z-rsU5UJ.mjs';
import './asyncData-BBDHP0iC.mjs';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "my-page",
  __ssrInlineRender: true,
  setup(__props) {
    const { ui } = useLanguagePreferences();
    useHead(() => ({
      title: ui("Mon espace"),
      meta: [{ name: "robots", content: "noindex, nofollow" }]
    }));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LearnerSpace = __nuxt_component_0;
      _push(ssrRenderComponent(_component_LearnerSpace, _attrs, null, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/my-page.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=my-page-B1zNIMqD.mjs.map
