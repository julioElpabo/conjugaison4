import { defineComponent, withAsyncContext, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { W as WizardChallengeWorkspace } from './WizardChallengeWorkspace--YGt-N26.mjs';
import { g as useRoute, f as useLanguagePreferences, l as createError, n as navigateTo, p as usePageSeoOverride, u as useHead, c as useRuntimeConfig } from './server.mjs';
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
import 'web-push';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';
import '../_/guided-tour.mjs';
import '../_/challenge-defaults.mjs';
import '@fortawesome/vue-fontawesome';
import '@fortawesome/free-solid-svg-icons';
import '../_/passive-voice.mjs';
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
import '@vue/shared';
import './asyncData-CjrHXDLz.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[slug]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const config = useRuntimeConfig();
    const { interfaceLocale, localePath } = useLanguagePreferences();
    const requestedSlug = String(route.params.slug || "");
    const { data: resolution, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/challenge-publications/${encodeURIComponent(requestedSlug)}`,
      {
        query: { locale: interfaceLocale.value }
      },
      "$73pdo5NmTO"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    if (error.value || !resolution.value) {
      throw createError({ statusCode: 404, statusMessage: "Défi public introuvable" });
    }
    if (resolution.value.kind === "redirect") {
      [__temp, __restore] = withAsyncContext(() => navigateTo(localePath(`/defis/${resolution.value.slug}`, resolution.value.locale), { redirectCode: 301, replace: true })), await __temp, __restore();
    }
    if (resolution.value.kind !== "publication") {
      throw createError({ statusCode: 404, statusMessage: "Défi public introuvable" });
    }
    const publication = resolution.value.publication;
    const editHint = {
      fr: {
        before: "Les boutons",
        between: "et",
        after: "te permettent de voir quels sont les verbes et les temps que tu vas travailler. Tu peux aussi les modifier. Bon travail !",
        verbsLabel: "Modifier les verbes à travailler",
        tensesLabel: "Modifier les temps à travailler"
      },
      de: {
        before: "Mit den Schaltflächen",
        between: "und",
        after: "zeigen dir, welche Verben und Zeitformen du üben wirst. Du kannst sie auch ändern. Viel Erfolg!",
        verbsLabel: "Verben zum Üben ändern",
        tensesLabel: "Zeitformen zum Üben ändern"
      },
      en: {
        before: "Buttons",
        between: "and",
        after: "show you which verbs and tenses you are going to practise. You can also change them. Keep up the good work!",
        verbsLabel: "Change the verbs to practise",
        tensesLabel: "Change the tenses to practise"
      },
      it: {
        before: "I pulsanti",
        between: "e",
        after: "ti permettono di vedere quali verbi e tempi eserciterai. Puoi anche modificarli. Buon lavoro!",
        verbsLabel: "Modifica i verbi da esercitare",
        tensesLabel: "Modifica i tempi da esercitare"
      },
      es: {
        before: "Los botones",
        between: "y",
        after: "te permiten ver qué verbos y tiempos vas a practicar. También puedes modificarlos. ¡Buen trabajo!",
        verbsLabel: "Modificar los verbos que quieres practicar",
        tensesLabel: "Modificar los tiempos que quieres practicar"
      }
    }[publication.locale];
    const canonicalPath = `/${publication.locale}/defis/${publication.slug}`;
    const frenchAlternate = publication.translations.find((alternate) => alternate.locale === "fr");
    usePageSeoOverride().setPageSeoOverride({
      canonicalPath,
      alternates: publication.translations,
      xDefaultPath: frenchAlternate?.path ?? canonicalPath,
      robots: publication.isIndexable ? "index, follow" : "noindex, follow"
    });
    const pageUrl = `${String(config.public.siteUrl).replace(/\/$/u, "")}${canonicalPath}`;
    useHead({
      title: publication.metaTitle || publication.title,
      titleTemplate: null,
      meta: [
        { name: "description", content: publication.metaDescription || publication.description },
        { property: "og:title", content: publication.metaTitle || publication.title },
        { property: "og:description", content: publication.metaDescription || publication.description },
        { property: "og:type", content: "website" }
      ],
      script: [{
        key: "challenge-learning-resource",
        type: "application/ld+json",
        textContent: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: publication.title,
          description: publication.description,
          url: pageUrl,
          learningResourceType: "Exercise",
          educationalUse: "Practice",
          inLanguage: publication.locale,
          teaches: "French conjugation",
          isAccessibleForFree: true
        })
      }]
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "public-challenge" }, _attrs))} data-v-27396d29>`);
      _push(ssrRenderComponent(WizardChallengeWorkspace, {
        "initial-preset-id": unref(publication).presetKey,
        "launch-category": unref(publication).categoryName,
        "launch-description": unref(publication).description,
        "launch-edit-hint": unref(editHint),
        "launch-title": unref(publication).title,
        embedded: "",
        "start-at-launch": ""
      }, null, _parent));
      _push(`</main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/defis/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _slug_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-27396d29"]]);

export { _slug_ as default };
//# sourceMappingURL=_slug_-BKPWkztC.mjs.map
