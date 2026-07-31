import { _ as __nuxt_component_0$1 } from './nuxt-link-icjx6oE7.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "LearningSubnav",
  __ssrInlineRender: true,
  props: {
    label: {},
    items: {},
    activeKey: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<nav${ssrRenderAttrs(mergeProps({
        class: "learning-subnav",
        "aria-label": __props.label
      }, _attrs))} data-v-9e05e343><span class="learning-subnav__label" data-v-9e05e343>${ssrInterpolate(__props.label)}</span><ul data-v-9e05e343><!--[-->`);
      ssrRenderList(__props.items, (item) => {
        _push(`<li data-v-9e05e343>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: item.to,
          class: { "is-active": item.key === __props.activeKey },
          "aria-current": item.key === __props.activeKey ? "page" : void 0
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(item.label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(item.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ul></nav>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/learning/LearningSubnav.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-9e05e343"]]), { __name: "LearningSubnav" });

export { __nuxt_component_0 as _ };
//# sourceMappingURL=LearningSubnav-CV5szJr4.mjs.map
