import { defineComponent, ref, computed, unref, useSSRContext } from 'vue';
import { ssrRenderTeleport, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderStyle } from 'vue/server-renderer';
import { l as localizeCoachProfile, t as translateCoachUiText, c as coachHelpApproachTitle } from '../_/coach-ui.mjs';
import { a as useLanguagePreferences } from './server.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CoachPicker",
  __ssrInlineRender: true,
  props: {
    tourDemo: { type: Boolean },
    selectionPending: { type: Boolean },
    selectionError: {},
    learningSupportMode: {}
  },
  emits: ["close", "select"],
  setup(__props, { emit: __emit }) {
    const { interfaceLocale, ui } = useLanguagePreferences();
    const props = __props;
    const coachPairs = ref([]);
    const loading = ref(true);
    const error = ref("");
    const allophoneOnly = computed(() => props.learningSupportMode === "cif-fle");
    const coachGroups = computed(
      () => coachPairs.value.filter((group) => !allophoneOnly.value || group.approach === "allophone").map((group) => ({
        ...group,
        label: coachHelpApproachTitle(interfaceLocale.value, group.approach),
        description: translateCoachUiText(interfaceLocale.value, group.description),
        coaches: group.coaches.map((coach) => localizeCoachProfile(interfaceLocale.value, coach))
      }))
    );
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="coach-picker-overlay" data-tour="coach-picker" data-v-c53d0b2f><section class="coach-picker" role="dialog" aria-modal="true" aria-labelledby="coach-picker-title"${ssrRenderAttr("aria-busy", __props.selectionPending)} data-v-c53d0b2f><header data-v-c53d0b2f><div data-v-c53d0b2f><h2 id="coach-picker-title" data-v-c53d0b2f>${ssrInterpolate(unref(ui)("Choisis ton coach"))}</h2></div><button type="button"${ssrRenderAttr("aria-label", unref(ui)("Fermer"))}${ssrIncludeBooleanAttr(__props.selectionPending) ? " disabled" : ""} data-v-c53d0b2f>×</button></header>`);
        if (__props.selectionPending) {
          _push2(`<p class="coach-picker__state coach-picker__state--pending" role="status" data-v-c53d0b2f>${ssrInterpolate(unref(ui)("Préparation de la séance…"))}</p>`);
        } else if (__props.selectionError) {
          _push2(`<p class="coach-picker__state coach-picker__state--error" role="alert" data-v-c53d0b2f>${ssrInterpolate(__props.selectionError)}</p>`);
        } else {
          _push2(`<!---->`);
        }
        if (unref(loading)) {
          _push2(`<p class="coach-picker__state" data-v-c53d0b2f>${ssrInterpolate(unref(ui)("Chargement des coaches…"))}</p>`);
        } else if (unref(error)) {
          _push2(`<p class="coach-picker__state coach-picker__state--error" data-v-c53d0b2f>${ssrInterpolate(unref(error))}</p>`);
        } else {
          _push2(`<div class="coach-picker__groups" data-v-c53d0b2f><!--[-->`);
          ssrRenderList(unref(coachGroups), (group) => {
            _push2(`<section class="coach-caractere-group"${ssrRenderAttr("data-help-approach", group.approach)}${ssrRenderAttr("data-tour", group.approach === "complete" ? "coach-complete-group" : void 0)} data-v-c53d0b2f>`);
            if (!unref(allophoneOnly)) {
              _push2(`<header class="coach-caractere-group__header" data-v-c53d0b2f><div data-v-c53d0b2f><h3 data-v-c53d0b2f>${ssrInterpolate(group.label)}</h3><p data-v-c53d0b2f>${ssrInterpolate(group.description)}</p></div></header>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="coach-picker__grid" data-v-c53d0b2f><!--[-->`);
            ssrRenderList(group.coaches, (coach) => {
              _push2(`<button type="button" class="coach-card" style="${ssrRenderStyle({ "--coach-color": coach.themeColor })}"${ssrIncludeBooleanAttr(__props.selectionPending) ? " disabled" : ""} data-v-c53d0b2f><img${ssrRenderAttr("src", coach.avatarPath)}${ssrRenderAttr("alt", unref(ui)("Avatar de {name}", { name: coach.firstName }))} data-v-c53d0b2f><strong data-v-c53d0b2f>${ssrInterpolate(coach.firstName)}</strong></button>`);
            });
            _push2(`<!--]--></div></section>`);
          });
          _push2(`<!--]--></div>`);
        }
        _push2(`</section></div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/exercise/CoachPicker.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const CoachPicker = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-c53d0b2f"]]), { __name: "ExerciseCoachPicker" });

export { CoachPicker as default };
//# sourceMappingURL=CoachPicker-6T9_MquD.mjs.map
