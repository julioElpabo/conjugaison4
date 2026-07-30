import { _ as __nuxt_component_0 } from './nuxt-link-icjx6oE7.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
import { f as useLanguagePreferences, u as useHead } from './server.mjs';
import { u as useSiteAnalytics } from './useSiteAnalytics-DPlmCjj8.mjs';
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
import 'unhead/utils';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "apprendre",
  __ssrInlineRender: true,
  setup(__props) {
    const { ui, localePath } = useLanguagePreferences();
    useSiteAnalytics();
    useHead(() => ({
      title: ui("Apprendre la conjugaison"),
      meta: [{ name: "description", content: ui("Une synthèse claire des règles essentielles de la conjugaison française.") }]
    }));
    const sections = computed(() => [
      { id: "bases", number: "01", title: ui("Comprendre le verbe"), description: ui("Radical, terminaison, groupes et auxiliaires.") },
      { id: "temps", number: "02", title: ui("Former les temps"), description: ui("Les repères pour construire les temps simples et composés.") },
      { id: "modes", number: "03", title: ui("Choisir le bon mode"), description: ui("Indicatif, subjonctif, conditionnel et impératif.") },
      { id: "accords", number: "04", title: ui("Réussir les accords"), description: ui("Sujet, auxiliaires et participe passé.") },
      { id: "orthographe", number: "05", title: ui("Éviter les pièges"), description: ui("Modifications du radical et terminaisons à surveiller.") }
    ]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "learning-page" }, _attrs))} data-v-95af89a9><header class="learning-hero" data-v-95af89a9><p class="learning-eyebrow" data-v-95af89a9>${ssrInterpolate(unref(ui)("Les règles essentielles"))}</p><h1 data-v-95af89a9>${ssrInterpolate(unref(ui)("Apprendre la conjugaison française"))}</h1><p data-v-95af89a9>${ssrInterpolate(unref(ui)("Une carte simple pour comprendre comment les verbes se construisent, choisir le bon temps et éviter les erreurs les plus fréquentes."))}</p></header><nav class="learning-summary"${ssrRenderAttr("aria-label", unref(ui)("Sommaire des règles"))} data-v-95af89a9><!--[-->`);
      ssrRenderList(unref(sections), (section) => {
        _push(`<button type="button" data-v-95af89a9><span data-v-95af89a9>${ssrInterpolate(section.number)}</span><strong data-v-95af89a9>${ssrInterpolate(section.title)}</strong><small data-v-95af89a9>${ssrInterpolate(section.description)}</small></button>`);
      });
      _push(`<!--]--></nav><main class="learning-content" data-v-95af89a9><section id="bases" class="rule-section" data-v-95af89a9><header data-v-95af89a9><span data-v-95af89a9>01</span><div data-v-95af89a9><p class="learning-eyebrow" data-v-95af89a9>${ssrInterpolate(unref(ui)("Les fondations"))}</p><h2 data-v-95af89a9>${ssrInterpolate(unref(ui)("Comprendre le verbe"))}</h2></div></header><div class="rule-grid rule-grid--three" data-v-95af89a9><article data-v-95af89a9><h3 data-v-95af89a9>${ssrInterpolate(unref(ui)("Radical + terminaison"))}</h3><p data-v-95af89a9>${ssrInterpolate(unref(ui)("Une forme conjuguée associe généralement un radical, qui porte le sens, et une terminaison, qui indique la personne, le mode et le temps."))}</p><p class="rule-example" data-v-95af89a9><strong data-v-95af89a9>nous chantions</strong><span data-v-95af89a9>chant- + -ions</span></p></article><article data-v-95af89a9><h3 data-v-95af89a9>${ssrInterpolate(unref(ui)("Les trois groupes"))}</h3><ul data-v-95af89a9><li data-v-95af89a9><strong data-v-95af89a9>${ssrInterpolate(unref(ui)("1er groupe :"))}</strong> ${ssrInterpolate(unref(ui)("verbes en -er, sauf aller."))}</li><li data-v-95af89a9><strong data-v-95af89a9>${ssrInterpolate(unref(ui)("2e groupe :"))}</strong> ${ssrInterpolate(unref(ui)("verbes en -ir faisant -issons."))}</li><li data-v-95af89a9><strong data-v-95af89a9>${ssrInterpolate(unref(ui)("3e groupe :"))}</strong> ${ssrInterpolate(unref(ui)("tous les autres verbes, souvent irréguliers."))}</li></ul></article><article data-v-95af89a9><h3 data-v-95af89a9>${ssrInterpolate(unref(ui)("Être et avoir"))}</h3><p data-v-95af89a9>${ssrInterpolate(unref(ui)("Ces deux verbes ont leurs propres conjugaisons et servent aussi d’auxiliaires pour former les temps composés."))}</p><p class="rule-example" data-v-95af89a9><strong data-v-95af89a9>elle a fini</strong><span data-v-95af89a9>${ssrInterpolate(unref(ui)("auxiliaire + participe passé"))}</span></p></article></div></section><section id="temps" class="rule-section" data-v-95af89a9><header data-v-95af89a9><span data-v-95af89a9>02</span><div data-v-95af89a9><p class="learning-eyebrow" data-v-95af89a9>${ssrInterpolate(unref(ui)("La construction"))}</p><h2 data-v-95af89a9>${ssrInterpolate(unref(ui)("Former les temps"))}</h2></div></header><div class="formation-table" role="table"${ssrRenderAttr("aria-label", unref(ui)("Formation des principaux temps"))} data-v-95af89a9><div class="formation-row formation-row--head" role="row" data-v-95af89a9><span data-v-95af89a9>${ssrInterpolate(unref(ui)("Temps"))}</span><span data-v-95af89a9>${ssrInterpolate(unref(ui)("Construction"))}</span><span data-v-95af89a9>${ssrInterpolate(unref(ui)("Exemple"))}</span></div><div class="formation-row" role="row" data-v-95af89a9><strong data-v-95af89a9>${ssrInterpolate(unref(ui)("Présent"))}</strong><span data-v-95af89a9>${ssrInterpolate(unref(ui)("radical + terminaisons du présent"))}</span><em data-v-95af89a9>je parle, nous finissons</em></div><div class="formation-row" role="row" data-v-95af89a9><strong data-v-95af89a9>${ssrInterpolate(unref(ui)("Imparfait"))}</strong><span data-v-95af89a9>${ssrInterpolate(unref(ui)("radical de « nous » au présent + -ais, -ais, -ait, -ions, -iez, -aient"))}</span><em data-v-95af89a9>nous parlions</em></div><div class="formation-row" role="row" data-v-95af89a9><strong data-v-95af89a9>${ssrInterpolate(unref(ui)("Futur simple"))}</strong><span data-v-95af89a9>${ssrInterpolate(unref(ui)("infinitif, ou radical irrégulier, + -ai, -as, -a, -ons, -ez, -ont"))}</span><em data-v-95af89a9>tu viendras</em></div><div class="formation-row" role="row" data-v-95af89a9><strong data-v-95af89a9>${ssrInterpolate(unref(ui)("Conditionnel présent"))}</strong><span data-v-95af89a9>${ssrInterpolate(unref(ui)("radical du futur + terminaisons de l’imparfait"))}</span><em data-v-95af89a9>vous pourriez</em></div><div class="formation-row" role="row" data-v-95af89a9><strong data-v-95af89a9>${ssrInterpolate(unref(ui)("Temps composé"))}</strong><span data-v-95af89a9>${ssrInterpolate(unref(ui)("auxiliaire conjugué + participe passé"))}</span><em data-v-95af89a9>ils avaient compris</em></div></div><aside class="rule-note" data-v-95af89a9><strong data-v-95af89a9>${ssrInterpolate(unref(ui)("Le bon réflexe"))}</strong><p data-v-95af89a9>${ssrInterpolate(unref(ui)("Pour reconnaître un temps composé, cherche d’abord une forme de avoir ou d’être, puis le participe passé."))}</p></aside></section><section id="modes" class="rule-section" data-v-95af89a9><header data-v-95af89a9><span data-v-95af89a9>03</span><div data-v-95af89a9><p class="learning-eyebrow" data-v-95af89a9>${ssrInterpolate(unref(ui)("Le sens"))}</p><h2 data-v-95af89a9>${ssrInterpolate(unref(ui)("Choisir le bon mode"))}</h2></div></header><div class="mode-cards" data-v-95af89a9><article data-v-95af89a9><span data-v-95af89a9>${ssrInterpolate(unref(ui)("Fait"))}</span><h3 data-v-95af89a9>${ssrInterpolate(unref(ui)("Indicatif"))}</h3><p data-v-95af89a9>${ssrInterpolate(unref(ui)("Présente un fait, une action certaine ou située dans le temps."))}</p><em data-v-95af89a9>Demain, nous partirons.</em></article><article data-v-95af89a9><span data-v-95af89a9>${ssrInterpolate(unref(ui)("Doute"))}</span><h3 data-v-95af89a9>${ssrInterpolate(unref(ui)("Subjonctif"))}</h3><p data-v-95af89a9>${ssrInterpolate(unref(ui)("Exprime notamment le souhait, la nécessité, le sentiment ou l’incertitude."))}</p><em data-v-95af89a9>Il faut que tu viennes.</em></article><article data-v-95af89a9><span data-v-95af89a9>${ssrInterpolate(unref(ui)("Hypothèse"))}</span><h3 data-v-95af89a9>${ssrInterpolate(unref(ui)("Conditionnel"))}</h3><p data-v-95af89a9>${ssrInterpolate(unref(ui)("Présente une possibilité, une information incertaine ou une action soumise à une condition."))}</p><em data-v-95af89a9>Je viendrais si je pouvais.</em></article><article data-v-95af89a9><span data-v-95af89a9>${ssrInterpolate(unref(ui)("Consigne"))}</span><h3 data-v-95af89a9>${ssrInterpolate(unref(ui)("Impératif"))}</h3><p data-v-95af89a9>${ssrInterpolate(unref(ui)("Exprime un ordre, un conseil ou une invitation, sans sujet exprimé."))}</p><em data-v-95af89a9>Écoutez attentivement !</em></article></div></section><section id="accords" class="rule-section" data-v-95af89a9><header data-v-95af89a9><span data-v-95af89a9>04</span><div data-v-95af89a9><p class="learning-eyebrow" data-v-95af89a9>${ssrInterpolate(unref(ui)("Les correspondances"))}</p><h2 data-v-95af89a9>${ssrInterpolate(unref(ui)("Réussir les accords"))}</h2></div></header><div class="agreement-flow" data-v-95af89a9><article data-v-95af89a9><span data-v-95af89a9>1</span><div data-v-95af89a9><h3 data-v-95af89a9>${ssrInterpolate(unref(ui)("Trouver le sujet"))}</h3><p data-v-95af89a9>${ssrInterpolate(unref(ui)("Le verbe s’accorde en personne et en nombre avec son sujet, même lorsque celui-ci est éloigné."))}</p><em data-v-95af89a9>Les élèves de cette classe réussissent.</em></div></article><article data-v-95af89a9><span data-v-95af89a9>2</span><div data-v-95af89a9><h3 data-v-95af89a9>${ssrInterpolate(unref(ui)("Identifier l’auxiliaire"))}</h3><p data-v-95af89a9>${ssrInterpolate(unref(ui)("Avec être, le participe passé s’accorde généralement avec le sujet."))}</p><em data-v-95af89a9>Elles sont arrivées.</em></div></article><article data-v-95af89a9><span data-v-95af89a9>3</span><div data-v-95af89a9><h3 data-v-95af89a9>${ssrInterpolate(unref(ui)("Repérer le COD avec avoir"))}</h3><p data-v-95af89a9>${ssrInterpolate(unref(ui)("Avec avoir, le participe passé s’accorde avec le COD seulement si celui-ci est placé avant."))}</p><em data-v-95af89a9>Les lettres qu’il a écrites.</em></div></article></div><aside class="rule-note rule-note--warning" data-v-95af89a9><strong data-v-95af89a9>${ssrInterpolate(unref(ui)("Verbes pronominaux"))}</strong><p data-v-95af89a9>${ssrInterpolate(unref(ui)("Leur accord dépend de la fonction du pronom. Il faut déterminer si celui-ci est COD, COI ou fait partie du verbe."))}</p></aside></section><section id="orthographe" class="rule-section" data-v-95af89a9><header data-v-95af89a9><span data-v-95af89a9>05</span><div data-v-95af89a9><p class="learning-eyebrow" data-v-95af89a9>${ssrInterpolate(unref(ui)("Les pièges fréquents"))}</p><h2 data-v-95af89a9>${ssrInterpolate(unref(ui)("Préserver le son et l’orthographe"))}</h2></div></header><div class="trap-grid" data-v-95af89a9><article data-v-95af89a9><h3 data-v-95af89a9>-ger et -cer</h3><p data-v-95af89a9>${ssrInterpolate(unref(ui)("On ajoute parfois un e après g ou une cédille pour conserver le son."))}</p><em data-v-95af89a9>nous mangeons · nous plaçons</em></article><article data-v-95af89a9><h3 data-v-95af89a9>-yer</h3><p data-v-95af89a9>${ssrInterpolate(unref(ui)("Le y peut devenir i devant un e muet. Pour certains verbes, les deux graphies sont admises."))}</p><em data-v-95af89a9>j’emploie · nous employons</em></article><article data-v-95af89a9><h3 data-v-95af89a9>e / è</h3><p data-v-95af89a9>${ssrInterpolate(unref(ui)("Certains verbes changent l’accent lorsque la syllabe suivante contient un e muet."))}</p><em data-v-95af89a9>je lève · nous levons</em></article><article data-v-95af89a9><h3 data-v-95af89a9>${ssrInterpolate(unref(ui)("Consonne doublée"))}</h3><p data-v-95af89a9>${ssrInterpolate(unref(ui)("Certains verbes en -eler et -eter doublent la consonne ; d’autres prennent un accent grave."))}</p><em data-v-95af89a9>j’appelle · j’achète</em></article><article data-v-95af89a9><h3 data-v-95af89a9>-é ou -er ?</h3><p data-v-95af89a9>${ssrInterpolate(unref(ui)("Remplace le verbe par « vendre » : si « vendu » convient, écris le participe passé ; si « vendre » convient, écris l’infinitif."))}</p><em data-v-95af89a9>j’ai mangé · je vais manger</em></article><article data-v-95af89a9><h3 data-v-95af89a9>-rai ou -rais ?</h3><p data-v-95af89a9>${ssrInterpolate(unref(ui)("Le futur exprime ce qui arrivera ; le conditionnel dépend d’une condition ou atténue une demande."))}</p><em data-v-95af89a9>je viendrai · je viendrais si…</em></article></div></section><section class="learning-actions" aria-labelledby="continue-title" data-v-95af89a9><div data-v-95af89a9><p class="learning-eyebrow" data-v-95af89a9>${ssrInterpolate(unref(ui)("À toi de jouer"))}</p><h2 id="continue-title" data-v-95af89a9>${ssrInterpolate(unref(ui)("Passe de la règle à la pratique"))}</h2><p data-v-95af89a9>${ssrInterpolate(unref(ui)("Consulte un modèle complet ou crée un exercice ciblé pour vérifier ce que tu viens d’apprendre."))}</p></div><div data-v-95af89a9>`);
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
const apprendre = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-95af89a9"]]);

export { apprendre as default };
//# sourceMappingURL=apprendre-BkR4qlFK.mjs.map
