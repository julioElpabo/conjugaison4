import { defineComponent, computed, unref, mergeProps, useTemplateRef, ref, watch, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderComponent, ssrRenderTeleport, ssrRenderAttr, ssrRenderStyle } from 'vue/server-renderer';
import { aj as localizedLearnerErrorMessage, ak as learnerErrorInsteadOf } from '../nitro/nitro.mjs';
import { f as useLanguagePreferences, c as useRuntimeConfig } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { i as isFiniteConjugationMode, c as conjugationModeOrder, a as conjugationTenseOrder, b as conjugationTenseRow, d as conjugationTenseLabel } from '../_/conjugation-display.mjs';

const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "LearnerErrorDetailMessage",
  __ssrInlineRender: true,
  props: {
    detail: {}
  },
  setup(__props) {
    const props = __props;
    const { interfaceLocale } = useLanguagePreferences();
    const isPersonConfusion = computed(() => props.detail.code === "person.other_form" && Boolean(props.detail.learnerValue) && Boolean(props.detail.expectedValue));
    const personSentence = computed(() => ({
      fr: { intro: "Tu as confondu la personne.", before: "Tu as conjugué avec", middle: "alors que c’était" },
      de: { intro: "Du hast die Person verwechselt.", before: "Du hast mit", middle: "konjugiert, erwartet war aber" },
      en: { intro: "You confused the grammatical person.", before: "You conjugated for", middle: "but the expected person was" },
      it: { intro: "Hai confuso la persona.", before: "Hai coniugato con", middle: "ma la persona richiesta era" },
      es: { intro: "Has confundido la persona.", before: "Has conjugado con", middle: "pero la persona esperada era" }
    })[interfaceLocale.value]);
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(isPersonConfusion)) {
        _push(`<span${ssrRenderAttrs(mergeProps({ class: "person-confusion-message" }, _attrs))} data-v-56038c0b>${ssrInterpolate(unref(personSentence).intro)} ${ssrInterpolate(unref(personSentence).before)} <mark class="is-wrong" data-v-56038c0b>${ssrInterpolate(__props.detail.learnerValue)}</mark>, ${ssrInterpolate(unref(personSentence).middle)} <mark class="is-correct" data-v-56038c0b>${ssrInterpolate(__props.detail.expectedValue)}</mark>. </span>`);
      } else {
        _push(`<span${ssrRenderAttrs(_attrs)} data-v-56038c0b>${ssrInterpolate(unref(localizedLearnerErrorMessage)(__props.detail, unref(interfaceLocale)))}</span>`);
      }
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/exercise/LearnerErrorDetailMessage.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const LearnerErrorDetailMessage = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$3, [["__scopeId", "data-v-56038c0b"]]), { __name: "ExerciseLearnerErrorDetailMessage" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "LearnerErrorFeedback",
  __ssrInlineRender: true,
  props: {
    details: {},
    compact: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const { interfaceLocale } = useLanguagePreferences();
    const visibleDetails = computed(() => props.details);
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(visibleDetails).length) {
        _push(`<div${ssrRenderAttrs(mergeProps({
          class: ["learner-error-feedback", { "is-compact": __props.compact }]
        }, _attrs))} data-v-5ca7d655><ul data-v-5ca7d655><!--[-->`);
        ssrRenderList(unref(visibleDetails), (detail) => {
          _push(`<li data-v-5ca7d655><b data-v-5ca7d655>`);
          _push(ssrRenderComponent(LearnerErrorDetailMessage, { detail }, null, _parent));
          _push(`</b>`);
          if (detail.code !== "person.other_form" && detail.learnerValue && detail.expectedValue) {
            _push(`<span class="learner-error-feedback__comparison" data-v-5ca7d655><del data-v-5ca7d655>${ssrInterpolate(detail.learnerValue)}</del><span data-v-5ca7d655>${ssrInterpolate(unref(learnerErrorInsteadOf)(unref(interfaceLocale)))}</span><ins data-v-5ca7d655>${ssrInterpolate(detail.expectedValue)}</ins></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</li>`);
        });
        _push(`<!--]--></ul></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/exercise/LearnerErrorFeedback.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const LearnerErrorFeedback = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-5ca7d655"]]), { __name: "ExerciseLearnerErrorFeedback" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ShareExerciseSummaryDialog",
  __ssrInlineRender: true,
  props: {
    presentation: {},
    items: {},
    verbs: {},
    tenses: {}
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const { ui, localePath } = useLanguagePreferences();
    const config = useRuntimeConfig();
    useTemplateRef("share-summary-dialog");
    useTemplateRef("close-button");
    const busy = ref(true);
    const error = ref("");
    const token = ref("");
    const copyStatus = ref("");
    const canNativeShare = ref(false);
    const shareUrl = computed(() => {
      if (!token.value) return "";
      const siteUrl = String(config.public.siteUrl).replace(/\/$/u, "");
      return new URL(localePath(`/bilan/${token.value}`), `${siteUrl}/`).toString();
    });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="summary-share-overlay" data-v-afacf570><section class="summary-share-dialog" role="dialog" aria-modal="true" aria-labelledby="summary-share-title" tabindex="-1" data-v-afacf570><button class="summary-share-dialog__close" type="button"${ssrRenderAttr("aria-label", unref(ui)("Fermer"))} data-v-afacf570>×</button><p class="summary-share-dialog__kicker" data-v-afacf570>${ssrInterpolate(unref(ui)("PARTAGER MON BILAN"))}</p><h2 id="summary-share-title" data-v-afacf570>${ssrInterpolate(unref(ui)("Ton bilan est prêt à être envoyé"))}</h2><p data-v-afacf570>${ssrInterpolate(unref(ui)("Il te suffit d’envoyer ce lien à la personne de ton choix, par e-mail, WhatsApp ou tout autre moyen. En l’ouvrant, elle verra directement ton bilan. Le lien restera disponible pendant un mois."))}</p>`);
        if (unref(busy)) {
          _push2(`<div class="summary-share-dialog__state" role="status" data-v-afacf570><span aria-hidden="true" data-v-afacf570></span><strong data-v-afacf570>${ssrInterpolate(unref(ui)("Création du lien…"))}</strong></div>`);
        } else if (unref(shareUrl)) {
          _push2(`<!--[--><label for="shared-summary-url" data-v-afacf570>${ssrInterpolate(unref(ui)("Lien complet à envoyer"))}</label><div class="summary-share-dialog__link" data-v-afacf570><input id="shared-summary-url"${ssrRenderAttr("value", unref(shareUrl))} readonly data-v-afacf570><button class="primary-button" type="button" data-v-afacf570>${ssrInterpolate(unref(ui)("Copier le lien"))}</button></div>`);
          if (unref(copyStatus)) {
            _push2(`<p class="summary-share-dialog__copy-status" role="status" data-v-afacf570>${ssrInterpolate(unref(copyStatus))}</p>`);
          } else {
            _push2(`<!---->`);
          }
          if (unref(canNativeShare)) {
            _push2(`<button class="secondary-button summary-share-dialog__native-share" type="button" data-v-afacf570>${ssrInterpolate(unref(ui)("Partager avec une application…"))}</button>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<small data-v-afacf570>${ssrInterpolate(unref(ui)("Toute personne qui possède ce lien peut consulter le bilan."))}</small><!--]-->`);
        } else {
          _push2(`<div class="summary-share-dialog__error" role="alert" data-v-afacf570><p data-v-afacf570>${ssrInterpolate(unref(error))}</p><button class="primary-button" type="button" data-v-afacf570>${ssrInterpolate(unref(ui)("Réessayer"))}</button></div>`);
        }
        _push2(`</section></div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/exercise/ShareExerciseSummaryDialog.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const ShareExerciseSummaryDialog = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-afacf570"]]), { __name: "ExerciseShareExerciseSummaryDialog" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "VerbConsultationModal",
  __ssrInlineRender: true,
  props: {
    verbId: {},
    headerColor: { default: "#344758" }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const { ui, uiLabel } = useLanguagePreferences();
    useTemplateRef("dialog");
    useTemplateRef("close-button");
    const detail = ref(null);
    const modes = ref([]);
    const tenses = ref([]);
    const loading = ref(true);
    const loadError = ref("");
    let requestNumber = 0;
    const groups = computed(() => [...modes.value].filter((mode) => isFiniteConjugationMode(mode.name)).sort((left, right) => conjugationModeOrder(left.name) - conjugationModeOrder(right.name) || left.id - right.id).map((mode) => {
      const modeTenses = [...tenses.value].filter((tense) => tense.modeId === mode.id).sort((left, right) => conjugationTenseOrder(mode.name, left.name) - conjugationTenseOrder(mode.name, right.name) || left.id - right.id).map((tense) => ({
        ...tense,
        rows: (detail.value?.conjugations ?? []).filter((row) => row.tenseId === tense.id)
      })).filter((tense) => tense.rows.length);
      const rows = /* @__PURE__ */ new Map();
      for (const tense of modeTenses) {
        const row = conjugationTenseRow(mode.name, tense.name);
        rows.set(row, [...rows.get(row) ?? [], tense]);
      }
      return { mode, tenseRows: [...rows.values()] };
    }).filter((group) => group.tenseRows.length));
    const nonFiniteForms = computed(() => {
      const verb = detail.value?.verb;
      if (!verb) return [];
      const isPronominal = /^(?:s['’]|se\s)/iu.test(verb.infinitif);
      const auxiliaryInfinitive = isPronominal ? "s’être" : verb.auxiliaire ?? "";
      const auxiliaryParticiple = isPronominal ? "s’étant" : verb.auxiliaire?.toLocaleLowerCase("fr") === "être" ? "étant" : "ayant";
      return [
        { mode: "Infinitif", tense: "présent", form: verb.infinitif },
        { mode: "Infinitif", tense: "passé", form: [auxiliaryInfinitive, verb.participePasse].filter(Boolean).join(" ") },
        { mode: "Participe", tense: "présent", form: verb.participePresent ?? "" },
        { mode: "Participe", tense: "passé", form: verb.participePasse ?? "" },
        { mode: "Gérondif", tense: "présent", form: verb.participePresent ? `en ${verb.participePresent}` : "" },
        { mode: "Gérondif", tense: "passé", form: verb.participePasse ? `en ${auxiliaryParticiple} ${verb.participePasse}` : "" }
      ].filter((item) => item.form.trim());
    });
    function displayedForm(row, form, mode) {
      if (mode.trim().toLocaleLowerCase("fr") === "impératif") return `${form} !`;
      const elidesJe = row.pronoun === "je" && /^[aeiouyàâäéèêëîïôöùûüh]/iu.test(form);
      const phrase = elidesJe ? `j’${form}` : `${row.pronoun} ${form}`;
      if (mode.trim().toLocaleLowerCase("fr") !== "subjonctif") return phrase;
      return /^[aeiouy]/iu.test(row.pronoun) ? `qu’${phrase}` : `que ${phrase}`;
    }
    function groupLabel(group) {
      if (group === 1) return ui("1er groupe");
      if (group === 2) return ui("2e groupe");
      if (group === 3) return ui("3e groupe");
      return ui("groupe irrégulier");
    }
    async function loadConsultation(id) {
      const currentRequest = ++requestNumber;
      loading.value = true;
      loadError.value = "";
      detail.value = null;
      try {
        const [consultation, catalogue] = await Promise.all([
          $fetch(`/api/conjugaisons/${id}`),
          $fetch("/api/catalogue")
        ]);
        if (currentRequest !== requestNumber) return;
        detail.value = consultation;
        modes.value = catalogue.modes;
        tenses.value = catalogue.temps;
      } catch {
        if (currentRequest === requestNumber) loadError.value = ui("Impossible de charger la conjugaison de ce verbe.");
      } finally {
        if (currentRequest === requestNumber) loading.value = false;
      }
    }
    watch(() => props.verbId, (id) => void loadConsultation(id));
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="verb-consultation-overlay" data-v-7faace05><section class="verb-consultation-dialog" style="${ssrRenderStyle({ "--verb-consultation-header": __props.headerColor })}" role="dialog" aria-modal="true"${ssrRenderAttr("aria-label", unref(ui)("Consulter le verbe"))} data-v-7faace05><header data-v-7faace05><strong data-v-7faace05>${ssrInterpolate(unref(ui)("Consulter le verbe"))}</strong><button type="button"${ssrRenderAttr("aria-label", unref(ui)("Fermer"))} data-v-7faace05>×</button></header><div class="verb-consultation-content" data-v-7faace05>`);
        if (unref(loading)) {
          _push2(`<p class="verb-consultation-state" role="status" data-v-7faace05>${ssrInterpolate(unref(ui)("Chargement de la conjugaison…"))}</p>`);
        } else if (unref(loadError)) {
          _push2(`<div class="verb-consultation-state verb-consultation-state--error" role="alert" data-v-7faace05><p data-v-7faace05>${ssrInterpolate(unref(loadError))}</p><button type="button" data-v-7faace05>${ssrInterpolate(unref(ui)("Réessayer"))}</button></div>`);
        } else if (unref(detail)) {
          _push2(`<!--[--><header class="verb-consultation-heading" data-v-7faace05><div data-v-7faace05><h2 data-v-7faace05>${ssrInterpolate(unref(detail).verb.infinitif)}</h2></div><dl data-v-7faace05><div data-v-7faace05><dt data-v-7faace05>${ssrInterpolate(unref(ui)("Groupe"))}</dt><dd data-v-7faace05>${ssrInterpolate(groupLabel(unref(detail).verb.groupeConjugaison))}</dd></div><div data-v-7faace05><dt data-v-7faace05>${ssrInterpolate(unref(ui)("Auxiliaire"))}</dt><dd data-v-7faace05>${ssrInterpolate(unref(detail).verb.auxiliaire)}</dd></div></dl></header><nav class="verb-consultation-nav"${ssrRenderAttr("aria-label", unref(ui)("Accès aux modes"))} data-v-7faace05><!--[-->`);
          ssrRenderList(unref(groups), (group) => {
            _push2(`<a${ssrRenderAttr("href", `#modal-mode-${group.mode.id}`)} data-v-7faace05>${ssrInterpolate(unref(uiLabel)(group.mode.name))}</a>`);
          });
          _push2(`<!--]--><a href="#modal-non-finite" data-v-7faace05>${ssrInterpolate(unref(ui)("Formes non personnelles"))}</a></nav><!--[-->`);
          ssrRenderList(unref(groups), (group) => {
            _push2(`<section${ssrRenderAttr("id", `modal-mode-${group.mode.id}`)} class="verb-mode-section" data-v-7faace05><h2 data-v-7faace05>${ssrInterpolate(unref(uiLabel)(group.mode.name))}</h2><div class="verb-tense-grid" data-v-7faace05><!--[-->`);
            ssrRenderList(group.tenseRows, (tenseRow, rowIndex) => {
              _push2(`<!--[--><!--[-->`);
              ssrRenderList(tenseRow, (tense) => {
                _push2(`<article data-v-7faace05><h3 data-v-7faace05>${ssrInterpolate(unref(uiLabel)(unref(conjugationTenseLabel)(group.mode.name, tense.name)))}</h3><ul data-v-7faace05><!--[-->`);
                ssrRenderList(tense.rows, (row) => {
                  _push2(`<li data-v-7faace05><!--[-->`);
                  ssrRenderList(row.forms, (form, index) => {
                    _push2(`<!--[-->`);
                    if (index) {
                      _push2(`<span class="verb-form-or" data-v-7faace05>${ssrInterpolate(unref(ui)("ou"))}</span>`);
                    } else {
                      _push2(`<!---->`);
                    }
                    _push2(`<span data-v-7faace05>${ssrInterpolate(displayedForm(row, form, group.mode.name))}</span><!--]-->`);
                  });
                  _push2(`<!--]--></li>`);
                });
                _push2(`<!--]--></ul></article>`);
              });
              _push2(`<!--]--><!--]-->`);
            });
            _push2(`<!--]--></div></section>`);
          });
          _push2(`<!--]--><section id="modal-non-finite" class="verb-mode-section" data-v-7faace05><h2 data-v-7faace05>${ssrInterpolate(unref(ui)("Formes non personnelles"))}</h2><div class="verb-non-finite-grid" data-v-7faace05><!--[-->`);
          ssrRenderList(unref(nonFiniteForms), (item) => {
            _push2(`<article data-v-7faace05><small data-v-7faace05>${ssrInterpolate(unref(uiLabel)(item.mode))} · ${ssrInterpolate(unref(uiLabel)(item.tense))}</small><strong data-v-7faace05>${ssrInterpolate(item.form)}</strong></article>`);
          });
          _push2(`<!--]--></div></section><!--]-->`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</div></section></div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/exercise/VerbConsultationModal.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const VerbConsultationModal = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-7faace05"]]), { __name: "ExerciseVerbConsultationModal" });

export { LearnerErrorFeedback as L, ShareExerciseSummaryDialog as S, VerbConsultationModal as V, LearnerErrorDetailMessage as a };
//# sourceMappingURL=VerbConsultationModal-BL2XCn3o.mjs.map
