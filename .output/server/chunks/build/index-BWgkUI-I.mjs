import { defineComponent, computed, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { W as WizardChallengeWorkspace } from './WizardChallengeWorkspace-BKZ39LrQ.mjs';
import { f as useLanguagePreferences, g as useRoute, u as useHead, c as useRuntimeConfig } from './server.mjs';
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
import './useSiteAnalytics-Bd_7Kr2F.mjs';
import './nuxt-link-icjx6oE7.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import './useLearnerAuth-tqISusbB.mjs';
import '../_/conjugation-display.mjs';
import '../_/near-future.mjs';
import '../_/verb-search.mjs';
import './main-A_ELVmjx.mjs';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { ui, interfaceLocale } = useLanguagePreferences();
    const config = useRuntimeConfig();
    const route = useRoute();
    const description = computed(() => ui("TATITOTU est un outil gratuit et multilingue pour apprendre et enseigner la conjugaison française, quel que soit le pays."));
    const pageUrl = computed(() => `${String(config.public.siteUrl).replace(/\/$/u, "")}${route.path}`);
    useHead(() => ({
      title: `TATITOTU · ${ui("Exercices de conjugaison française gratuits et sans publicité")}`,
      meta: [
        {
          name: "description",
          content: description.value
        },
        { property: "og:description", content: description.value }
      ],
      script: [{
        key: "home-learning-resource",
        type: "application/ld+json",
        textContent: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: "TATITOTU",
          description: description.value,
          url: pageUrl.value,
          learningResourceType: "Interactive resource",
          educationalUse: ["Instruction", "Practice"],
          inLanguage: interfaceLocale.value,
          teaches: ui("Conjugaison française"),
          isAccessibleForFree: true
        })
      }]
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(WizardChallengeWorkspace, _attrs, null, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BWgkUI-I.mjs.map
