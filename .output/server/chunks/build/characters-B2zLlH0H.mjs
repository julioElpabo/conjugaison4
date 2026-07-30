import { defineComponent, withAsyncContext, useSSRContext } from 'vue';
import { g as useRoute, f as useLanguagePreferences, n as navigateTo } from './server.mjs';
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
import 'vue/server-renderer';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "characters",
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const { localePath } = useLanguagePreferences();
    const query = { ...route.query };
    if (query.character && !query.caractere) query.caractere = query.character;
    delete query.character;
    [__temp, __restore] = withAsyncContext(() => navigateTo({ path: localePath("/admin/caracteres"), query }, { redirectCode: 301, replace: true })), await __temp, __restore();
    return () => {
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/characters.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=characters-B2zLlH0H.mjs.map
