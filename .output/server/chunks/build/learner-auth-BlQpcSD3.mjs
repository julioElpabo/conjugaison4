import { a9 as executeAsync } from '../nitro/nitro.mjs';
import { p as defineNuxtRouteMiddleware, f as useLanguagePreferences, n as navigateTo } from './server.mjs';
import { u as useLearnerAuth } from './useLearnerAuth-BLt5hOAV.mjs';
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
import 'vue';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';
import './state-DjsguMyT.mjs';

const learnerAuth = defineNuxtRouteMiddleware(async (to) => {
  let __temp, __restore;
  const { checkSession } = useLearnerAuth();
  const { localePath } = useLanguagePreferences();
  const learner = ([__temp, __restore] = executeAsync(() => checkSession()), __temp = await __temp, __restore(), __temp);
  if (!learner) {
    return navigateTo({
      path: localePath("/signin"),
      query: { redirect: to.fullPath }
    }, { replace: true });
  }
});

export { learnerAuth as default };
//# sourceMappingURL=learner-auth-BlQpcSD3.mjs.map
