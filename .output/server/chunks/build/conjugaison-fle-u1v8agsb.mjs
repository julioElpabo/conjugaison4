import { _ as __nuxt_component_0 } from './nuxt-link-icjx6oE7.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
import { f as useLanguagePreferences, u as useHead, c as useRuntimeConfig } from './server.mjs';
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
  __name: "conjugaison-fle",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { interfaceLocale, localePath } = useLanguagePreferences();
    const copy = computed(() => ({
      fr: {
        eyebrow: "Français langue étrangère",
        title: "Exercices de conjugaison FLE gratuits et personnalisables",
        intro: "Entraîne-toi à conjuguer les verbes français utiles pour comprendre, parler et écrire dans les situations de la vie quotidienne.",
        whyTitle: "Apprendre la conjugaison française en FLE",
        whyText: "Ces exercices s’adressent aux personnes qui apprennent le français comme langue étrangère, ainsi qu’aux enseignants et formateurs qui recherchent un entraînement interactif. Les parcours progressifs commencent par les verbes les plus fréquents avant d’introduire davantage de temps et de formes.",
        benefits: ["Des verbes fréquents et directement utiles", "Des parcours progressifs du niveau CIF 1 au niveau CIF 4", "Des temps et des verbes que tu peux modifier selon ton objectif"],
        howTitle: "Un exercice FLE adapté à ton objectif",
        howText: "Choisis un parcours ci-dessous. Avant de commencer, tu peux conserver la sélection proposée ou modifier les verbes, les temps et les options. Tu obtiens ainsi un exercice de conjugaison adapté à ton niveau et à ce que tu veux réviser.",
        listTitle: "Choisir un exercice de conjugaison FLE",
        start: "Commencer cet exercice",
        library: "Voir tous les défis officiels",
        empty: "Aucun exercice FLE n’est disponible pour le moment.",
        meta: "Exercices gratuits et interactifs de conjugaison FLE. Travaille les verbes français utiles par niveau et personnalise les verbes et les temps."
      },
      de: {
        eyebrow: "Französisch als Fremdsprache",
        title: "Kostenlose und anpassbare FLE-Konjugationsübungen",
        intro: "Übe nützliche französische Verben, um Alltagssituationen besser zu verstehen und dich mündlich wie schriftlich auszudrücken.",
        whyTitle: "Französische Konjugation als Fremdsprache lernen",
        whyText: "Die Übungen richten sich an Lernende von Französisch als Fremdsprache sowie an Lehrpersonen. Die progressiven Lernwege beginnen mit den häufigsten Verben und führen schrittweise zu weiteren Zeiten und Formen.",
        benefits: ["Häufige und sofort nützliche Verben", "Progressive Lernwege von CIF 1 bis CIF 4", "Verben und Zeitformen passend zu deinem Ziel ändern"],
        howTitle: "Eine FLE-Übung passend zu deinem Lernziel",
        howText: "Wähle unten einen Lernweg. Vor dem Start kannst du die vorgeschlagene Auswahl übernehmen oder Verben, Zeitformen und Optionen anpassen.",
        listTitle: "FLE-Konjugationsübung auswählen",
        start: "Übung starten",
        library: "Alle offiziellen Aufgaben ansehen",
        empty: "Zurzeit ist keine FLE-Übung verfügbar.",
        meta: "Kostenlose interaktive FLE-Übungen zur französischen Konjugation. Übe nützliche Verben nach Niveau und passe Verben und Zeitformen an."
      },
      en: {
        eyebrow: "French as a foreign language",
        title: "Free, customisable FLE French conjugation exercises",
        intro: "Practise useful French verbs for understanding, speaking and writing in everyday situations.",
        whyTitle: "Learn French conjugation as a foreign language",
        whyText: "These exercises are designed for learners of French as a foreign language and for teachers looking for interactive practice. Progressive pathways begin with frequent verbs before introducing more tenses and forms.",
        benefits: ["Frequent verbs you can use straight away", "Progressive pathways from CIF level 1 to CIF level 4", "Verbs and tenses you can change to match your goal"],
        howTitle: "FLE practice tailored to your goal",
        howText: "Choose a pathway below. Before starting, keep the suggested selection or change the verbs, tenses and options to create practice at the right level.",
        listTitle: "Choose an FLE French conjugation exercise",
        start: "Start this exercise",
        library: "See all official challenges",
        empty: "No FLE exercise is currently available.",
        meta: "Free interactive FLE French conjugation exercises. Practise useful French verbs by level and customise the verbs and tenses."
      },
      it: {
        eyebrow: "Francese lingua straniera",
        title: "Esercizi gratuiti e personalizzabili di coniugazione FLE",
        intro: "Esercitati con i verbi francesi utili per capire, parlare e scrivere nelle situazioni quotidiane.",
        whyTitle: "Imparare la coniugazione francese come lingua straniera",
        whyText: "Gli esercizi sono pensati per chi impara il francese come lingua straniera e per gli insegnanti. I percorsi progressivi iniziano dai verbi più frequenti e introducono gradualmente altri tempi e forme.",
        benefits: ["Verbi frequenti e subito utili", "Percorsi progressivi dal livello CIF 1 al CIF 4", "Verbi e tempi modificabili secondo il tuo obiettivo"],
        howTitle: "Un esercizio FLE adatto al tuo obiettivo",
        howText: "Scegli un percorso qui sotto. Prima di iniziare puoi mantenere la selezione proposta oppure modificare verbi, tempi e opzioni.",
        listTitle: "Scegli un esercizio di coniugazione FLE",
        start: "Inizia l’esercizio",
        library: "Vedi tutte le sfide ufficiali",
        empty: "Al momento non è disponibile alcun esercizio FLE.",
        meta: "Esercizi gratuiti e interattivi di coniugazione FLE. Allenati con i verbi francesi utili e personalizza verbi e tempi."
      },
      es: {
        eyebrow: "Francés como lengua extranjera",
        title: "Ejercicios gratuitos y personalizables de conjugación FLE",
        intro: "Practica los verbos franceses útiles para comprender, hablar y escribir en situaciones cotidianas.",
        whyTitle: "Aprender conjugación francesa como lengua extranjera",
        whyText: "Los ejercicios están pensados para quienes aprenden francés como lengua extranjera y para docentes. Los recorridos progresivos empiezan con los verbos más frecuentes e introducen poco a poco más tiempos y formas.",
        benefits: ["Verbos frecuentes y útiles desde el principio", "Recorridos progresivos del nivel CIF 1 al CIF 4", "Verbos y tiempos que puedes cambiar según tu objetivo"],
        howTitle: "Un ejercicio FLE adaptado a tu objetivo",
        howText: "Elige un recorrido. Antes de empezar, puedes mantener la selección propuesta o modificar los verbos, los tiempos y las opciones.",
        listTitle: "Elige un ejercicio de conjugación FLE",
        start: "Empezar el ejercicio",
        library: "Ver todos los retos oficiales",
        empty: "No hay ningún ejercicio FLE disponible por el momento.",
        meta: "Ejercicios gratuitos e interactivos de conjugación FLE. Practica verbos franceses útiles y personaliza los verbos y tiempos."
      }
    })[interfaceLocale.value]);
    const { data: response } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/challenge-publications",
      {
        query: computed(() => ({ locale: interfaceLocale.value }))
      },
      "$f0GsTlns0k"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const fleOrder = /* @__PURE__ */ new Map([
      ["CIF1", 1],
      ["CIF2", 2],
      ["CIF3", 3],
      ["CIF4", 4],
      ["100-verbes-utiles-allophones", 5]
    ]);
    const exercises = computed(() => (response.value?.publications ?? []).filter((publication) => publication.categorySlug === "cif").toSorted((left, right) => (fleOrder.get(left.presetKey) ?? 99) - (fleOrder.get(right.presetKey) ?? 99)));
    const config = useRuntimeConfig();
    const pageUrl = computed(() => `${String(config.public.siteUrl).replace(/\/$/u, "")}${localePath("/conjugaison-fle")}`);
    useHead(() => ({
      title: `${copy.value.title} | TATITOTU`,
      titleTemplate: null,
      meta: [
        { name: "description", content: copy.value.meta },
        { property: "og:title", content: copy.value.title },
        { property: "og:description", content: copy.value.meta },
        { property: "og:type", content: "website" }
      ],
      script: [{
        key: "fle-conjugation-collection",
        type: "application/ld+json",
        textContent: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: copy.value.title,
          description: copy.value.meta,
          url: pageUrl.value,
          inLanguage: interfaceLocale.value,
          isPartOf: { "@type": "WebSite", name: "TATITOTU" },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: exercises.value.map((exercise, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: exercise.title,
              url: `${String(config.public.siteUrl).replace(/\/$/u, "")}${localePath(`/defis/${exercise.slug}`)}`
            }))
          }
        })
      }]
    }));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "fle-page" }, _attrs))} data-v-53facdc2><header class="fle-page__hero" data-v-53facdc2><p data-v-53facdc2>${ssrInterpolate(unref(copy).eyebrow)}</p><h1 data-v-53facdc2>${ssrInterpolate(unref(copy).title)}</h1><span data-v-53facdc2>${ssrInterpolate(unref(copy).intro)}</span></header><section class="fle-page__explanation" data-v-53facdc2><div data-v-53facdc2><h2 data-v-53facdc2>${ssrInterpolate(unref(copy).whyTitle)}</h2><p data-v-53facdc2>${ssrInterpolate(unref(copy).whyText)}</p></div><ul data-v-53facdc2><!--[-->`);
      ssrRenderList(unref(copy).benefits, (benefit) => {
        _push(`<li data-v-53facdc2>${ssrInterpolate(benefit)}</li>`);
      });
      _push(`<!--]--></ul><div data-v-53facdc2><h2 data-v-53facdc2>${ssrInterpolate(unref(copy).howTitle)}</h2><p data-v-53facdc2>${ssrInterpolate(unref(copy).howText)}</p></div></section><section class="fle-page__exercises" data-v-53facdc2><div class="fle-page__heading" data-v-53facdc2><h2 data-v-53facdc2>${ssrInterpolate(unref(copy).listTitle)}</h2>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(localePath)("/defis")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(copy).library)} →`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(copy).library) + " →", 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (!unref(exercises).length) {
        _push(`<p class="fle-page__empty" data-v-53facdc2>${ssrInterpolate(unref(copy).empty)}</p>`);
      } else {
        _push(`<div class="fle-page__grid" data-v-53facdc2><!--[-->`);
        ssrRenderList(unref(exercises), (exercise) => {
          _push(`<article data-v-53facdc2><h3 data-v-53facdc2>${ssrInterpolate(exercise.title)}</h3><p data-v-53facdc2>${ssrInterpolate(exercise.description)}</p>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: unref(localePath)(`/defis/${exercise.slug}`)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(copy).start)} <span aria-hidden="true" data-v-53facdc2${_scopeId}>→</span>`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(copy).start) + " ", 1),
                  createVNode("span", { "aria-hidden": "true" }, "→")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</article>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</section></main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/conjugaison-fle.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const conjugaisonFle = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-53facdc2"]]);

export { conjugaisonFle as default };
//# sourceMappingURL=conjugaison-fle-u1v8agsb.mjs.map
