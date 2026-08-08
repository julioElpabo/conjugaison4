import { _ as __nuxt_component_0 } from './nuxt-link-icjx6oE7.mjs';
import { defineComponent, computed, ref, mergeProps, unref, withCtx, createVNode, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrRenderComponent } from 'vue/server-renderer';
import { E as EXERCISE_LANDING_SLUGS, e as exerciseLandingPage } from '../_/exercise-landing-pages.mjs';
import { M as MODE_LANDING_SLUGS, m as modeLandingPage } from '../_/mode-landing-pages.mjs';
import { m as modeTensePages } from '../_/mode-tense-pages.mjs';
import { f as useLanguagePreferences, u as useHead } from './server.mjs';
import { u as useSiteAnalytics } from './useSiteAnalytics-D1wpWTOZ.mjs';
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
import 'node:url';
import 'node:fs/promises';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';
import './state-DjsguMyT.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "apprendre",
  __ssrInlineRender: true,
  setup(__props) {
    const { ui, localePath, interfaceLocale } = useLanguagePreferences();
    useSiteAnalytics();
    useHead(() => ({
      title: ui("Apprendre la conjugaison"),
      meta: [{ name: "description", content: ui("Une synthèse claire des règles essentielles de la conjugaison française.") }]
    }));
    const modeExplorerCopy = computed(() => ({
      fr: { eyebrow: "Le sens et le temps", title: "Comprendre les modes et choisir un temps", intro: "Sélectionne un mode pour comprendre ce qu’il exprime. Tu verras ensuite ses exemples, les points à surveiller et uniquement les temps qui lui appartiennent.", tabsLabel: "Choisir un mode", tenseHelp: "Choisis ensuite un temps pour approfondir son rôle, sa formation et ses emplois." },
      de: { eyebrow: "Bedeutung und Zeit", title: "Modi verstehen und eine Zeit wählen", intro: "Wähle einen Modus, um seine Bedeutung zu verstehen. Danach siehst du Beispiele, wichtige Hinweise und nur die dazugehörigen Zeiten.", tabsLabel: "Einen Modus wählen", tenseHelp: "Wähle anschließend eine Zeitform, um Funktion, Bildung und Gebrauch zu vertiefen." },
      en: { eyebrow: "Meaning and tense", title: "Understand moods and choose a tense", intro: "Select a mood to understand what it expresses. You will then see examples, points to watch and only the tenses that belong to it.", tabsLabel: "Choose a mood", tenseHelp: "Then choose a tense to explore its role, formation and uses." },
      it: { eyebrow: "Significato e tempo", title: "Capire i modi e scegliere un tempo", intro: "Seleziona un modo per capire che cosa esprime. Vedrai poi gli esempi, i punti importanti e soltanto i tempi che gli appartengono.", tabsLabel: "Scegliere un modo", tenseHelp: "Scegli quindi un tempo per approfondirne ruolo, formazione e usi." },
      es: { eyebrow: "Significado y tiempo", title: "Comprender los modos y elegir un tiempo", intro: "Selecciona un modo para comprender qué expresa. Después verás ejemplos, puntos importantes y únicamente los tiempos que le corresponden.", tabsLabel: "Elegir un modo", tenseHelp: "Elige después un tiempo para profundizar en su función, formación y usos." }
    })[interfaceLocale.value]);
    const sections = computed(() => [
      { id: "modes", number: "01", title: modeExplorerCopy.value.title, description: modeExplorerCopy.value.tabsLabel },
      { id: "bases", number: "02", title: ui("Comprendre le verbe"), description: ui("Radical, terminaison, groupes et auxiliaires.") },
      { id: "accords", number: "03", title: ui("Réussir les accords"), description: ui("Sujet, auxiliaires et participe passé.") },
      { id: "orthographe", number: "04", title: ui("Éviter les pièges"), description: ui("Modifications du radical et terminaisons à surveiller.") }
    ]);
    const exerciseJourneys = computed(() => EXERCISE_LANDING_SLUGS.map((slug) => exerciseLandingPage(slug, interfaceLocale.value)));
    const learningModes = computed(() => MODE_LANDING_SLUGS.map((slug) => ({
      ...modeLandingPage(slug, interfaceLocale.value),
      tenses: modeTensePages(slug).map((tense) => ({ ...tense, to: localePath(tense.path) }))
    })));
    const selectedLearningMode = ref("indicatif");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "learning-page" }, _attrs))} data-v-aa4a415f><header class="learning-hero" data-v-aa4a415f><p class="learning-eyebrow" data-v-aa4a415f>${ssrInterpolate(unref(ui)("Les règles essentielles"))}</p><h1 data-v-aa4a415f>${ssrInterpolate(unref(ui)("Apprendre la conjugaison française"))}</h1></header><nav class="learning-summary"${ssrRenderAttr("aria-label", unref(ui)("Sommaire des règles"))} data-v-aa4a415f><!--[-->`);
      ssrRenderList(unref(sections), (section) => {
        _push(`<button type="button" data-v-aa4a415f><span data-v-aa4a415f>${ssrInterpolate(section.number)}</span><strong data-v-aa4a415f>${ssrInterpolate(section.title)}</strong><small data-v-aa4a415f>${ssrInterpolate(section.description)}</small></button>`);
      });
      _push(`<!--]--></nav><main class="learning-content" data-v-aa4a415f><section id="modes" class="rule-section" data-v-aa4a415f><header data-v-aa4a415f><span data-v-aa4a415f>01</span><div data-v-aa4a415f><p class="learning-eyebrow" data-v-aa4a415f>${ssrInterpolate(unref(modeExplorerCopy).eyebrow)}</p><h2 data-v-aa4a415f>${ssrInterpolate(unref(modeExplorerCopy).title)}</h2><p class="mode-explorer-intro" data-v-aa4a415f>${ssrInterpolate(unref(modeExplorerCopy).intro)}</p></div></header><div class="mode-selector" role="tablist"${ssrRenderAttr("aria-label", unref(modeExplorerCopy).tabsLabel)} data-v-aa4a415f><!--[-->`);
      ssrRenderList(unref(learningModes), (mode) => {
        _push(`<button${ssrRenderAttr("id", `mode-tab-${mode.slug}`)} type="button" role="tab"${ssrRenderAttr("aria-controls", `mode-panel-${mode.slug}`)}${ssrRenderAttr("aria-selected", unref(selectedLearningMode) === mode.slug)}${ssrRenderAttr("tabindex", unref(selectedLearningMode) === mode.slug ? 0 : -1)} class="${ssrRenderClass({ "is-active": unref(selectedLearningMode) === mode.slug })}" data-v-aa4a415f><strong data-v-aa4a415f>${ssrInterpolate(mode.modeName)}</strong></button>`);
      });
      _push(`<!--]--></div><!--[-->`);
      ssrRenderList(unref(learningModes), (mode) => {
        _push(`<div${ssrRenderAttr("id", `mode-panel-${mode.slug}`)} class="mode-explorer-panel" role="tabpanel"${ssrRenderAttr("aria-labelledby", `mode-tab-${mode.slug}`)} style="${ssrRenderStyle(unref(selectedLearningMode) === mode.slug ? null : { display: "none" })}" data-v-aa4a415f><div class="mode-explorer-purpose" data-v-aa4a415f><p data-v-aa4a415f>${ssrInterpolate(mode.eyebrow)}</p><h3 data-v-aa4a415f>${ssrInterpolate(mode.purposeTitle)}</h3><p data-v-aa4a415f>${ssrInterpolate(mode.purpose)}</p></div><div class="mode-explorer-details" data-v-aa4a415f><section data-v-aa4a415f><h4 data-v-aa4a415f>${ssrInterpolate(mode.examplesTitle)}</h4><ul data-v-aa4a415f><!--[-->`);
        ssrRenderList(mode.examples, (example) => {
          _push(`<li data-v-aa4a415f>${ssrInterpolate(example)}</li>`);
        });
        _push(`<!--]--></ul></section><section data-v-aa4a415f><h4 data-v-aa4a415f>${ssrInterpolate(mode.watchTitle)}</h4><ul data-v-aa4a415f><!--[-->`);
        ssrRenderList(mode.watchItems, (item) => {
          _push(`<li data-v-aa4a415f>${ssrInterpolate(item)}</li>`);
        });
        _push(`<!--]--></ul></section></div><section class="mode-explorer-tenses"${ssrRenderAttr("aria-labelledby", `mode-panel-${mode.slug}-tenses`)} data-v-aa4a415f><header data-v-aa4a415f><h4${ssrRenderAttr("id", `mode-panel-${mode.slug}-tenses`)} data-v-aa4a415f>${ssrInterpolate(mode.tensesTitle)}</h4><p data-v-aa4a415f>${ssrInterpolate(unref(modeExplorerCopy).tenseHelp)}</p></header><nav${ssrRenderAttr("aria-label", mode.tensesTitle)} data-v-aa4a415f><!--[-->`);
        ssrRenderList(mode.tenses, (tense) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: tense.slug,
            to: tense.to
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<strong data-v-aa4a415f${_scopeId}>${ssrInterpolate(tense.label)}</strong><span aria-hidden="true" data-v-aa4a415f${_scopeId}>→</span>`);
              } else {
                return [
                  createVNode("strong", null, toDisplayString(tense.label), 1),
                  createVNode("span", { "aria-hidden": "true" }, "→")
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></nav></section><div class="mode-explorer-actions" data-v-aa4a415f><p data-v-aa4a415f>${ssrInterpolate(mode.ctaText)}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: { path: unref(localePath)("/"), query: { mode: mode.slug } }
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(mode.ctaLabel)} <span aria-hidden="true" data-v-aa4a415f${_scopeId}>→</span>`);
            } else {
              return [
                createTextVNode(toDisplayString(mode.ctaLabel) + " ", 1),
                createVNode("span", { "aria-hidden": "true" }, "→")
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</div></div>`);
      });
      _push(`<!--]-->`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "mode-training-button",
        to: { path: unref(localePath)("/"), query: { identifier: "mode-temps" } }
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span data-v-aa4a415f${_scopeId}>S’entraîner à reconnaître les modes et les temps</span><span aria-hidden="true" data-v-aa4a415f${_scopeId}>→</span>`);
          } else {
            return [
              createVNode("span", null, "S’entraîner à reconnaître les modes et les temps"),
              createVNode("span", { "aria-hidden": "true" }, "→")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</section><section id="bases" class="rule-section" data-v-aa4a415f><header data-v-aa4a415f><span data-v-aa4a415f>02</span><div data-v-aa4a415f><p class="learning-eyebrow" data-v-aa4a415f>${ssrInterpolate(unref(ui)("Les fondations"))}</p><h2 data-v-aa4a415f>${ssrInterpolate(unref(ui)("Comprendre le verbe"))}</h2></div></header><div class="rule-grid rule-grid--three" data-v-aa4a415f><article data-v-aa4a415f><h3 data-v-aa4a415f>${ssrInterpolate(unref(ui)("Radical + terminaison"))}</h3><p data-v-aa4a415f>${ssrInterpolate(unref(ui)("Une forme conjuguée associe généralement un radical, qui porte le sens, et une terminaison, qui indique la personne, le mode et le temps."))}</p><p class="rule-example" data-v-aa4a415f><strong data-v-aa4a415f>nous chantions</strong><span data-v-aa4a415f>chant- + -ions</span></p></article><article data-v-aa4a415f><h3 data-v-aa4a415f>${ssrInterpolate(unref(ui)("Les trois groupes"))}</h3><ul data-v-aa4a415f><li data-v-aa4a415f><strong data-v-aa4a415f>${ssrInterpolate(unref(ui)("1er groupe :"))}</strong> ${ssrInterpolate(unref(ui)("verbes en -er, sauf aller."))}</li><li data-v-aa4a415f><strong data-v-aa4a415f>${ssrInterpolate(unref(ui)("2e groupe :"))}</strong> ${ssrInterpolate(unref(ui)("verbes en -ir faisant -issons."))}</li><li data-v-aa4a415f><strong data-v-aa4a415f>${ssrInterpolate(unref(ui)("3e groupe :"))}</strong> ${ssrInterpolate(unref(ui)("tous les autres verbes, souvent irréguliers."))}</li></ul></article><article data-v-aa4a415f><h3 data-v-aa4a415f>${ssrInterpolate(unref(ui)("Être et avoir"))}</h3><p data-v-aa4a415f>${ssrInterpolate(unref(ui)("Ces deux verbes ont leurs propres conjugaisons et servent aussi d’auxiliaires pour former les temps composés."))}</p><p class="rule-example" data-v-aa4a415f><strong data-v-aa4a415f>elle a fini</strong><span data-v-aa4a415f>${ssrInterpolate(unref(ui)("auxiliaire + participe passé"))}</span></p></article></div></section><section id="accords" class="rule-section" data-v-aa4a415f><header data-v-aa4a415f><span data-v-aa4a415f>03</span><div data-v-aa4a415f><p class="learning-eyebrow" data-v-aa4a415f>${ssrInterpolate(unref(ui)("Les correspondances"))}</p><h2 data-v-aa4a415f>${ssrInterpolate(unref(ui)("Réussir les accords"))}</h2></div></header><div class="agreement-flow" data-v-aa4a415f><article data-v-aa4a415f><span data-v-aa4a415f>1</span><div data-v-aa4a415f><h3 data-v-aa4a415f>${ssrInterpolate(unref(ui)("Trouver le sujet"))}</h3><p data-v-aa4a415f>${ssrInterpolate(unref(ui)("Le verbe s’accorde en personne et en nombre avec son sujet, même lorsque celui-ci est éloigné."))}</p><em data-v-aa4a415f>Les élèves de cette classe réussissent.</em></div></article><article data-v-aa4a415f><span data-v-aa4a415f>2</span><div data-v-aa4a415f><h3 data-v-aa4a415f>${ssrInterpolate(unref(ui)("Identifier l’auxiliaire"))}</h3><p data-v-aa4a415f>${ssrInterpolate(unref(ui)("Avec être, le participe passé s’accorde généralement avec le sujet."))}</p><em data-v-aa4a415f>Elles sont arrivées.</em></div></article><article data-v-aa4a415f><span data-v-aa4a415f>3</span><div data-v-aa4a415f><h3 data-v-aa4a415f>${ssrInterpolate(unref(ui)("Repérer le COD avec avoir"))}</h3><p data-v-aa4a415f>${ssrInterpolate(unref(ui)("Avec avoir, le participe passé s’accorde avec le COD seulement si celui-ci est placé avant."))}</p><em data-v-aa4a415f>Les lettres qu’il a écrites.</em></div></article></div><aside class="rule-note rule-note--warning" data-v-aa4a415f><strong data-v-aa4a415f>${ssrInterpolate(unref(ui)("Verbes pronominaux"))}</strong><p data-v-aa4a415f>${ssrInterpolate(unref(ui)("Leur accord dépend de la fonction du pronom. Il faut déterminer si celui-ci est COD, COI ou fait partie du verbe."))}</p></aside></section><section id="orthographe" class="rule-section" data-v-aa4a415f><header data-v-aa4a415f><span data-v-aa4a415f>04</span><div data-v-aa4a415f><p class="learning-eyebrow" data-v-aa4a415f>${ssrInterpolate(unref(ui)("Les pièges fréquents"))}</p><h2 data-v-aa4a415f>${ssrInterpolate(unref(ui)("Préserver le son et l’orthographe"))}</h2></div></header><div class="trap-grid" data-v-aa4a415f><article data-v-aa4a415f><h3 data-v-aa4a415f>-ger et -cer</h3><p data-v-aa4a415f>${ssrInterpolate(unref(ui)("On ajoute parfois un e après g ou une cédille pour conserver le son."))}</p><em data-v-aa4a415f>nous mangeons · nous plaçons</em></article><article data-v-aa4a415f><h3 data-v-aa4a415f>-yer</h3><p data-v-aa4a415f>${ssrInterpolate(unref(ui)("Le y peut devenir i devant un e muet. Pour certains verbes, les deux graphies sont admises."))}</p><em data-v-aa4a415f>j’emploie · nous employons</em></article><article data-v-aa4a415f><h3 data-v-aa4a415f>e / è</h3><p data-v-aa4a415f>${ssrInterpolate(unref(ui)("Certains verbes changent l’accent lorsque la syllabe suivante contient un e muet."))}</p><em data-v-aa4a415f>je lève · nous levons</em></article><article data-v-aa4a415f><h3 data-v-aa4a415f>${ssrInterpolate(unref(ui)("Consonne doublée"))}</h3><p data-v-aa4a415f>${ssrInterpolate(unref(ui)("Certains verbes en -eler et -eter doublent la consonne ; d’autres prennent un accent grave."))}</p><em data-v-aa4a415f>j’appelle · j’achète</em></article><article data-v-aa4a415f><h3 data-v-aa4a415f>-é ou -er ?</h3><p data-v-aa4a415f>${ssrInterpolate(unref(ui)("Remplace le verbe par « vendre » : si « vendu » convient, écris le participe passé ; si « vendre » convient, écris l’infinitif."))}</p><em data-v-aa4a415f>j’ai mangé · je vais manger</em></article><article data-v-aa4a415f><h3 data-v-aa4a415f>-rai ou -rais ?</h3><p data-v-aa4a415f>${ssrInterpolate(unref(ui)("Le futur exprime ce qui arrivera ; le conditionnel dépend d’une condition ou atténue une demande."))}</p><em data-v-aa4a415f>je viendrai · je viendrais si…</em></article></div></section><section class="learning-journeys" aria-labelledby="journeys-title" data-v-aa4a415f><header data-v-aa4a415f><p class="learning-eyebrow" data-v-aa4a415f>${ssrInterpolate(unref(ui)("À toi de jouer"))}</p><h2 id="journeys-title" data-v-aa4a415f>${ssrInterpolate(unref(ui)("Passe de la règle à la pratique"))}</h2></header><div data-v-aa4a415f><!--[-->`);
      ssrRenderList(unref(exerciseJourneys), (journey) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: journey.slug,
          to: unref(localePath)(`/indicatif/${journey.slug}`)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span data-v-aa4a415f${_scopeId}>${ssrInterpolate(journey.eyebrow)}</span><strong data-v-aa4a415f${_scopeId}>${ssrInterpolate(journey.title)}</strong><small data-v-aa4a415f${_scopeId}>${ssrInterpolate(journey.description)}</small>`);
            } else {
              return [
                createVNode("span", null, toDisplayString(journey.eyebrow), 1),
                createVNode("strong", null, toDisplayString(journey.title), 1),
                createVNode("small", null, toDisplayString(journey.description), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div></section><section class="learning-actions" aria-labelledby="continue-title" data-v-aa4a415f><div data-v-aa4a415f><p class="learning-eyebrow" data-v-aa4a415f>${ssrInterpolate(unref(ui)("À toi de jouer"))}</p><h2 id="continue-title" data-v-aa4a415f>${ssrInterpolate(unref(ui)("Passe de la règle à la pratique"))}</h2><p data-v-aa4a415f>${ssrInterpolate(unref(ui)("Consulte un modèle complet ou crée un exercice ciblé pour vérifier ce que tu viens d’apprendre."))}</p></div><div data-v-aa4a415f>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(localePath)("/consulter")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(ui)("Consulter un verbe"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(ui)("Consulter un verbe")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "is-primary",
        to: unref(localePath)("/")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(ui)("S’exercer"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(ui)("S’exercer")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></section></main></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/apprendre.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const apprendre = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-aa4a415f"]]);

export { apprendre as default };
//# sourceMappingURL=apprendre-BTlT3UZi.mjs.map
