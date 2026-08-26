import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
import { f as useLanguagePreferences } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  ...{ inheritAttrs: false },
  __name: "PasswordInput",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    autocomplete: { default: void 0 },
    name: { default: void 0 },
    minlength: { default: void 0 },
    maxlength: { default: void 0 },
    required: { type: Boolean, default: false },
    describedby: { default: void 0 }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const { ui } = useLanguagePreferences();
    const revealed = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "password-input" }, _attrs))} data-v-2ff3a30d><input${ssrRenderAttrs(mergeProps(_ctx.$attrs, {
        value: __props.modelValue,
        type: unref(revealed) ? "text" : "password",
        name: __props.name,
        autocomplete: __props.autocomplete,
        minlength: __props.minlength,
        maxlength: __props.maxlength,
        required: __props.required,
        "aria-describedby": __props.describedby
      }))} data-v-2ff3a30d><button type="button"${ssrRenderAttr("aria-pressed", unref(revealed))}${ssrRenderAttr("aria-label", unref(revealed) ? unref(ui)("Masquer le mot de passe") : unref(ui)("Afficher le mot de passe"))} data-v-2ff3a30d>${ssrInterpolate(unref(revealed) ? unref(ui)("Masquer") : unref(ui)("Afficher"))}</button></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PasswordInput.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-2ff3a30d"]]), { __name: "PasswordInput" });

export { __nuxt_component_1 as _ };
//# sourceMappingURL=PasswordInput-D9iWnxeu.mjs.map
