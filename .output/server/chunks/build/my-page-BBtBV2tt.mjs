import { _ as __nuxt_component_0 } from './LearnerSpace-xLCgtGco.mjs';
import { defineComponent, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { a as useLanguagePreferences, u as useHead } from './server.mjs';
import './nuxt-link-icjx6oE7.mjs';
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
import 'qrcode.vue';
import './_plugin-vue_export-helper-1tPrXgE0.mjs';
import './PasswordInput-D9iWnxeu.mjs';
import './VerbConsultationModal-CzRYX635.mjs';
import './CoachHelpPanel-D-N4HXfV.mjs';
import '@fortawesome/free-solid-svg-icons';
import '@fortawesome/vue-fontawesome';
import '../_/coach.mjs';
import '../_/coach-help-audit.mjs';
import '../_/near-future.mjs';
import '../_/impersonal-verbs.mjs';
import '../_/coach-ui.mjs';
import '../_/infinitive-identification2.mjs';
import '../_/conjugation-display.mjs';
import './useColorTheme-JdwrB1u2.mjs';
import './ChatExercise-DpvS452s.mjs';
import '../_/coach-dialogue.mjs';
import '../_/sentence-punctuation.mjs';
import '../_/identification-form.mjs';
import './useSiteAnalytics-B3_coq30.mjs';
import '../_/analytics-consent.mjs';
import './main-BB3tCCjd.mjs';
import './useLearnerAuth-tqISusbB.mjs';
import './ClassicExercise-CCFuTkWV.mjs';
import '../_/mode-landing-pages.mjs';
import '../_/mode-tense-pedagogy.mjs';
import './CoachPicker-6T9_MquD.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';
import './useTenseClassification-DcBiWL4X.mjs';
import './asyncData-C9fbioDi.mjs';
import 'perfect-debounce';

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
//# sourceMappingURL=my-page-BBtBV2tt.mjs.map
