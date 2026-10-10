import { defineComponent, computed, unref, mergeProps, ref, useTemplateRef, watch, withCtx, openBlock, createBlock, createVNode, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderTeleport, ssrRenderStyle } from 'vue/server-renderer';
import { d as defaultCoachHelpBlocks, l as localizedCoachVerbDefinition, C as CoachHelpBlockView, _ as __nuxt_component_0, b as buildDefinitionHelpHtml } from './CoachHelpPanel-D-N4HXfV.mjs';
import { c as coachHelpProfile } from '../_/coach-help-audit.mjs';
import { i as infinitiveHelpVerb, a as infinitiveIdentificationGroupHints, b as infinitiveIdentificationEndingHints, I as INFINITIVE_AMBIGUITY_NOTICE } from '../_/infinitive-identification2.mjs';
import { a as useLanguagePreferences, g as useRuntimeConfig } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { w as withDutchVariants, aB as localizedLearnerErrorMessage, aC as learnerErrorInsteadOf } from '../nitro/nitro.mjs';
import { i as isFiniteConjugationMode, c as conjugationModeOrder, a as conjugationTenseOrder, b as conjugationTenseRow, d as conjugationTenseLabel } from '../_/conjugation-display.mjs';

const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "LearnerErrorDetailMessage",
  __ssrInlineRender: true,
  props: {
    detail: {}
  },
  setup(__props) {
    const props = __props;
    const { interfaceLocale } = useLanguagePreferences();
    const isPersonConfusion = computed(() => props.detail.code === "person.other_form" && Boolean(props.detail.learnerValue) && Boolean(props.detail.expectedValue));
    const personSentence = computed(() => withDutchVariants({
      fr: { intro: "Tu as confondu la personne.", before: "Tu as conjugué avec", middle: "alors que c’était" },
      de: { intro: "Du hast die Person verwechselt.", before: "Du hast mit", middle: "konjugiert, erwartet war aber" },
      en: { intro: "You confused the grammatical person.", before: "You conjugated for", middle: "but the expected person was" },
      it: { intro: "Hai confuso la persona.", before: "Hai coniugato con", middle: "ma la persona richiesta era" },
      es: { intro: "Has confundido la persona.", before: "Has conjugado con", middle: "pero la persona esperada era" },
      nl: { intro: "Je hebt de grammaticale persoon verwisseld.", before: "Je hebt vervoegd voor", middle: "maar de verwachte persoon was" }
    })[interfaceLocale.value]);
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(isPersonConfusion)) {
        _push(`<span${ssrRenderAttrs(mergeProps({ class: "person-confusion-message" }, _attrs))} data-v-f22f054c>${ssrInterpolate(unref(personSentence).intro)} ${ssrInterpolate(unref(personSentence).before)} <mark class="is-wrong" data-v-f22f054c>${ssrInterpolate(__props.detail.learnerValue)}</mark>, ${ssrInterpolate(unref(personSentence).middle)} <mark class="is-correct" data-v-f22f054c>${ssrInterpolate(__props.detail.expectedValue)}</mark>. </span>`);
      } else {
        _push(`<span${ssrRenderAttrs(_attrs)} data-v-f22f054c>${ssrInterpolate(unref(localizedLearnerErrorMessage)(__props.detail, unref(interfaceLocale)))}</span>`);
      }
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/exercise/LearnerErrorDetailMessage.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const LearnerErrorDetailMessage = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$4, [["__scopeId", "data-v-f22f054c"]]), { __name: "ExerciseLearnerErrorDetailMessage" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "InfinitiveCoachHelp",
  __ssrInlineRender: true,
  props: {
    question: {},
    questionNumber: {},
    verbs: {},
    coach: {},
    learningSupportMode: {},
    allowAnswer: { type: Boolean },
    corrected: { type: Boolean },
    feedbackContext: {}
  },
  emits: ["close", "revealAnswer", "changeCoach"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { interfaceLocale, ui } = useLanguagePreferences();
    const showAnswer = ref(false);
    const helpContent = useTemplateRef("helpContent");
    const usesBareAnswer = computed(() => props.learningSupportMode === "cif-fle" || coachHelpProfile(props.coach?.helpApproach).id === "allophone");
    const definitionBlock = defaultCoachHelpBlocks("complete")[0];
    watch([() => props.questionNumber, () => props.question], () => {
      showAnswer.value = false;
    });
    watch(() => props.allowAnswer, (allowed) => {
      if (!allowed) showAnswer.value = false;
    });
    const definition = computed(() => localizedCoachVerbDefinition(
      infinitiveHelpVerb(props.question.infinitif || props.question.reponsesPourCorrige[0] || "", props.verbs || []),
      interfaceLocale.value
    ));
    const groupHints = computed(() => infinitiveIdentificationGroupHints(props.question, props.verbs || [], ui));
    const endingHints = computed(() => infinitiveIdentificationEndingHints(props.question, ui));
    const answerText = computed(() => {
      const infinitive = props.question.reponsesPourCorrige.join(` ${ui("ou")} `);
      return usesBareAnswer.value ? infinitive : `${ui("Il s’agit du")} ${ui("verbe {verb}", { verb: infinitive })}.`;
    });
    const helpParagraphs = (texts) => texts.map((text) => buildDefinitionHelpHtml({ definition: text })).join("");
    const displayedHelp = computed(() => ({
      header: { title: ui("Trouver l’infinitif") },
      exerciseKind: "infinitive-identification",
      blocks: [
        { type: "normal", kind: "definition", title: ui("Définition"), renderedHtml: helpParagraphs([definition.value ? `${ui("Ce verbe signifie :")} ${definition.value}` : ui("Définition indisponible pour ce verbe.")]) },
        { type: "normal", kind: "group", title: ui("Groupe du verbe"), renderedHtml: helpParagraphs(groupHints.value) },
        { type: "normal", kind: "ending", title: ui("Terminaison"), renderedHtml: helpParagraphs(endingHints.value) },
        { type: "normal", kind: "answer", title: ui("Voir la réponse"), revealed: showAnswer.value, answers: showAnswer.value ? props.question.reponsesPourCorrige : [], renderedHtml: showAnswer.value ? helpParagraphs([answerText.value]) : "" }
      ]
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<aside${ssrRenderAttrs(mergeProps({
        ref_key: "helpContent",
        ref: helpContent,
        class: "infinitive-help",
        "data-tour": "chat-help",
        "aria-label": unref(ui)("Trouver l’infinitif")
      }, _attrs))} data-v-67670127><header data-v-67670127><div data-v-67670127>`);
      if (__props.coach) {
        _push(`<small data-v-67670127>${ssrInterpolate(__props.coach.firstName)}</small>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<strong data-v-67670127>${ssrInterpolate(unref(ui)("Trouver l’infinitif"))} · ${ssrInterpolate(__props.questionNumber)}</strong></div><button type="button"${ssrRenderAttr("aria-label", unref(ui)("Fermer l’aide"))} data-v-67670127>×</button></header><div class="infinitive-help__blocks" data-v-67670127><details data-v-67670127><summary data-v-67670127>${ssrInterpolate(unref(ui)("Indice {number}", { number: 1 }))} : ${ssrInterpolate(unref(ui)("Définition"))}</summary>`);
      _push(ssrRenderComponent(CoachHelpBlockView, {
        class: "infinitive-help__definition",
        block: unref(definitionBlock),
        values: {}
      }, {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(definition)) {
              _push2(`<p data-v-67670127${_scopeId}><strong data-v-67670127${_scopeId}>${ssrInterpolate(unref(ui)("Ce verbe signifie :"))}</strong> ${ssrInterpolate(unref(definition))}</p>`);
            } else {
              _push2(`<p data-v-67670127${_scopeId}>${ssrInterpolate(unref(ui)("Définition indisponible pour ce verbe."))}</p>`);
            }
          } else {
            return [
              unref(definition) ? (openBlock(), createBlock("p", { key: 0 }, [
                createVNode("strong", null, toDisplayString(unref(ui)("Ce verbe signifie :")), 1),
                createTextVNode(" " + toDisplayString(unref(definition)), 1)
              ])) : (openBlock(), createBlock("p", { key: 1 }, toDisplayString(unref(ui)("Définition indisponible pour ce verbe.")), 1))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</details><details data-v-67670127><summary data-v-67670127>${ssrInterpolate(unref(ui)("Indice {number}", { number: 2 }))} : ${ssrInterpolate(unref(ui)("Groupe du verbe"))}</summary><!--[-->`);
      ssrRenderList(unref(groupHints), (hint) => {
        _push(`<p data-v-67670127>${ssrInterpolate(hint)}</p>`);
      });
      _push(`<!--]--></details><details data-v-67670127><summary data-v-67670127>${ssrInterpolate(unref(ui)("Indice {number}", { number: 3 }))} : ${ssrInterpolate(unref(ui)("Terminaison"))}</summary><!--[-->`);
      ssrRenderList(unref(endingHints), (hint) => {
        _push(`<p data-v-67670127>${ssrInterpolate(hint)}</p>`);
      });
      _push(`<!--]--></details>`);
      if (__props.question.reponsesPourCorrige.length > 1) {
        _push(`<p data-v-67670127>${ssrInterpolate(unref(ui)(unref(INFINITIVE_AMBIGUITY_NOTICE)))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.allowAnswer) {
        _push(`<details${ssrIncludeBooleanAttr(unref(showAnswer)) ? " open" : ""} data-v-67670127><summary data-v-67670127>${ssrInterpolate(unref(ui)("Voir la réponse"))}</summary>`);
        if (unref(showAnswer)) {
          _push(`<section class="infinitive-help__correction" data-v-67670127>`);
          if (unref(usesBareAnswer)) {
            _push(`<p data-v-67670127><strong data-v-67670127>${ssrInterpolate(__props.question.reponsesPourCorrige.join(` ${unref(ui)("ou")} `))}</strong></p>`);
          } else {
            _push(`<p data-v-67670127>${ssrInterpolate(unref(ui)("Il s’agit du"))} <strong data-v-67670127>${ssrInterpolate(unref(ui)("verbe {verb}", { verb: __props.question.reponsesPourCorrige.join(` ${unref(ui)("ou")} `) }))}</strong>.</p>`);
          }
          _push(`</section>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</details>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (__props.coach) {
        _push(ssrRenderComponent(__nuxt_component_0, {
          "footer-only": "",
          "active-coach": __props.coach,
          "help-approach": __props.coach.helpApproach,
          "coach-color": __props.coach.themeColor,
          "question-number": __props.questionNumber,
          blocks: [],
          values: { helpTitle: unref(ui)("Trouver l’infinitif") },
          "include-automatic-orthography": false,
          "enable-automatic-audit": false,
          "feedback-context": __props.feedbackContext,
          "feedback-content": unref(helpContent),
          "displayed-help": unref(displayedHelp),
          onChangeCoach: ($event) => emit("changeCoach", $event)
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</aside>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/coach/InfinitiveCoachHelp.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const InfinitiveCoachHelp = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$3, [["__scopeId", "data-v-67670127"]]), { __name: "CoachInfinitiveCoachHelp" });
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

export { InfinitiveCoachHelp as I, LearnerErrorFeedback as L, ShareExerciseSummaryDialog as S, VerbConsultationModal as V, LearnerErrorDetailMessage as a };
//# sourceMappingURL=VerbConsultationModal-CzRYX635.mjs.map
