import { computed, defineComponent, mergeProps, unref, ref, watch, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrRenderStyle, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { _ as __nuxt_component_0$2 } from './nuxt-link-icjx6oE7.mjs';
import { u as useState } from './state-DjsguMyT.mjs';
import { f as useLanguagePreferences, g as useRoute } from './server.mjs';

function getAdminErrorStatus(error) {
  if (!error || typeof error !== "object") {
    return void 0;
  }
  const candidate = error;
  return candidate.statusCode ?? candidate.status ?? candidate.data?.statusCode ?? candidate.data?.status ?? candidate.response?.status;
}
function getAdminErrorMessage(error, fallback = "Une erreur est survenue.") {
  if (!error || typeof error !== "object") {
    return fallback;
  }
  const candidate = error;
  return candidate.data?.statusMessage || candidate.data?.message || candidate.statusMessage || candidate.message || fallback;
}
function useAdminAuth() {
  const user = useState("admin-user", () => null);
  const status = useState("admin-auth-status", () => "unknown");
  const authError = useState("admin-auth-error", () => "");
  const isAuthenticated = computed(() => status.value === "authenticated" && Boolean(user.value));
  function clearSession(message = "") {
    user.value = null;
    status.value = "anonymous";
    authError.value = message;
  }
  async function checkSession(force = false) {
    if (!force && status.value === "authenticated" && user.value) {
      return user.value;
    }
    status.value = "checking";
    authError.value = "";
    try {
      const response = await $fetch("/api/auth/me", {
        credentials: "same-origin"
      });
      if (!response.user || response.user.privilegeId !== 1) {
        clearSession();
        return null;
      }
      user.value = response.user;
      status.value = "authenticated";
      return response.user;
    } catch (error) {
      if (getAdminErrorStatus(error) === 401) {
        clearSession();
      } else {
        clearSession(getAdminErrorMessage(error, "Impossible de vérifier la session."));
      }
      return null;
    }
  }
  async function login(email, password) {
    authError.value = "";
    try {
      const response = await $fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        body: { email, password }
      });
      user.value = response.user;
      status.value = "authenticated";
      return response.user;
    } catch (error) {
      clearSession(getAdminErrorMessage(error, "Connexion impossible."));
      throw error;
    }
  }
  async function logout() {
    authError.value = "";
    try {
      await $fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin"
      });
      clearSession();
    } catch (error) {
      if (getAdminErrorStatus(error) === 401) {
        clearSession();
        return;
      }
      authError.value = getAdminErrorMessage(error, "Déconnexion impossible.");
      throw error;
    }
  }
  function handleUnauthorized(error) {
    if (getAdminErrorStatus(error) !== 401) {
      return false;
    }
    clearSession("Votre session a expiré. Reconnectez-vous pour continuer.");
    return true;
  }
  return {
    user,
    status,
    authError,
    isAuthenticated,
    checkSession,
    login,
    logout,
    clearSession,
    handleUnauthorized
  };
}
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "AdminLoginForm",
  __ssrInlineRender: true,
  emits: ["authenticated"],
  setup(__props, { emit: __emit }) {
    const { authError } = useAdminAuth();
    const email = ref("");
    const password = ref("");
    const submitting = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "admin-login admin-card",
        "aria-labelledby": "admin-login-title"
      }, _attrs))} data-v-e884dcee><p class="admin-eyebrow" data-v-e884dcee>Espace protégé</p><h1 id="admin-login-title" data-v-e884dcee>Administration</h1><form class="admin-form" data-v-e884dcee><label class="admin-field" data-v-e884dcee><span data-v-e884dcee>Adresse e-mail</span><input${ssrRenderAttr("value", unref(email))} type="email" name="email" autocomplete="username" inputmode="email" maxlength="254" required autofocus data-v-e884dcee></label><label class="admin-field" data-v-e884dcee><span data-v-e884dcee>Mot de passe</span><input${ssrRenderAttr("value", unref(password))} type="password" name="password" autocomplete="current-password" maxlength="200" required data-v-e884dcee></label>`);
      if (unref(authError)) {
        _push(`<p class="admin-notice admin-notice--error" role="alert" data-v-e884dcee>${ssrInterpolate(unref(authError))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="admin-button admin-button--primary" type="submit"${ssrIncludeBooleanAttr(unref(submitting)) ? " disabled" : ""} data-v-e884dcee>${ssrInterpolate(unref(submitting) ? "Connexion…" : "Se connecter")}</button></form></section>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/AdminLoginForm.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-e884dcee"]]), { __name: "AdminLoginForm" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "AdminAuthBoundary",
  __ssrInlineRender: true,
  setup(__props) {
    const { user, status } = useAdminAuth();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminLoginForm = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "admin-gate" }, _attrs))}>`);
      if (unref(status) === "unknown" || unref(status) === "checking") {
        _push(`<div class="admin-loading admin-card" role="status" aria-live="polite"><span class="admin-spinner" aria-hidden="true"></span><p>Vérification de la session…</p></div>`);
      } else if (!unref(user)) {
        _push(ssrRenderComponent(_component_AdminLoginForm, null, null, _parent));
      } else {
        ssrRenderSlot(_ctx.$slots, "default", { user: unref(user) }, null, _push, _parent);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/AdminAuthBoundary.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$1, { __name: "AdminAuthBoundary" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AdminShell",
  __ssrInlineRender: true,
  setup(__props) {
    const { user, authError } = useAdminAuth();
    const { localePath } = useLanguagePreferences();
    const route = useRoute();
    const loggingOut = ref(false);
    const siteHeaderHeight = ref(68);
    const openMenu = ref(null);
    const menuGroups = [
      {
        id: "verbs",
        label: "Verbes",
        links: [
          { label: "Verbes", path: "/admin" },
          { label: "Défis", path: "/admin/challenges" }
        ]
      },
      {
        id: "coaches",
        label: "Coaches",
        links: [
          { label: "Coaches", path: "/admin/coaches" },
          { label: "Caractères", path: "/admin/caracteres" }
        ]
      },
      {
        id: "development",
        label: "Développement",
        links: [
          { label: "Tests", path: "/admin/tests" },
          { label: "Feedbacks", path: "/admin/feedbacks" },
          { label: "Erreurs", path: "/admin/errors" }
        ]
      },
      {
        id: "admin",
        label: "Admin",
        links: [
          { label: "Mon compte", path: "/mon-compte" },
          { label: "Admins", path: "/admin/admins" },
          { label: "Utilisateurs", path: "/admin/users" }
        ]
      }
    ];
    const stickyHeaderStyle = computed(() => ({
      "--admin-sticky-top": `${siteHeaderHeight.value}px`
    }));
    watch(() => route.fullPath, () => {
      openMenu.value = null;
    });
    function linkIsActive(path) {
      const target = localePath(path).replace(/\/+$/u, "");
      const current = route.path.replace(/\/+$/u, "");
      return current === target;
    }
    function groupIsActive(group) {
      return group.links.some((link) => linkIsActive(link.path));
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "admin-shell admin-card" }, _attrs))} data-v-6e34d217><header class="admin-shell__header" style="${ssrRenderStyle(unref(stickyHeaderStyle))}" data-v-6e34d217><div class="admin-shell__identity" data-v-6e34d217><span class="admin-shell__mark" aria-hidden="true" data-v-6e34d217>A</span><div data-v-6e34d217><strong data-v-6e34d217>Administration</strong>`);
      if (unref(user)) {
        _push(`<small data-v-6e34d217>${ssrInterpolate(unref(user).prenom)} ${ssrInterpolate(unref(user).nom)}</small>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><nav class="admin-shell__nav" aria-label="Navigation d’administration" data-v-6e34d217><!--[-->`);
      ssrRenderList(menuGroups, (group) => {
        _push(`<div class="${ssrRenderClass([[`admin-menu--${group.id}`, { active: groupIsActive(group) }], "admin-menu"])}" data-v-6e34d217><button type="button" aria-haspopup="menu"${ssrRenderAttr("aria-expanded", unref(openMenu) === group.id)}${ssrRenderAttr("aria-controls", `admin-menu-${group.id}`)} data-v-6e34d217>${ssrInterpolate(group.label)} <span aria-hidden="true" data-v-6e34d217>⌄</span></button><div${ssrRenderAttr("id", `admin-menu-${group.id}`)} class="admin-menu__panel" role="menu" style="${ssrRenderStyle(unref(openMenu) === group.id ? null : { display: "none" })}" data-v-6e34d217><!--[-->`);
        ssrRenderList(group.links, (link) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: link.path,
            to: unref(localePath)(link.path),
            role: "menuitem",
            class: { "router-link-exact-active": linkIsActive(link.path) }
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(link.label)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(link.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div></div>`);
      });
      _push(`<!--]-->`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "admin-shell__direct-link",
        to: unref(localePath)("/admin/charts")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Statistiques`);
          } else {
            return [
              createTextVNode("Statistiques")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</nav><button class="admin-button admin-button--small" type="button"${ssrIncludeBooleanAttr(unref(loggingOut)) ? " disabled" : ""} data-v-6e34d217>${ssrInterpolate(unref(loggingOut) ? "Déconnexion…" : "Se déconnecter")}</button></header>`);
      if (unref(authError)) {
        _push(`<p class="admin-shell__error admin-notice admin-notice--error" role="alert" data-v-6e34d217>${ssrInterpolate(unref(authError))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<main class="admin-shell__content" data-v-6e34d217>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/AdminShell.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-6e34d217"]]), { __name: "AdminShell" });

export { __nuxt_component_0 as _, __nuxt_component_1 as a, getAdminErrorMessage as g, useAdminAuth as u };
//# sourceMappingURL=AdminShell-Vsqkwhjy.mjs.map
