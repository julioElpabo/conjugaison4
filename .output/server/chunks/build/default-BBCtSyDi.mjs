import { _ as __nuxt_component_0 } from './nuxt-link-icjx6oE7.mjs';
import { defineComponent, ref, computed, withAsyncContext, watch, mergeProps, unref, withCtx, createVNode, toDisplayString, openBlock, createBlock, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderSlot } from 'vue/server-renderer';
import { g as guidedTourCopy } from '../_/guided-tour.mjs';
import { u as useColorTheme, l as learnerSpaceCopy } from './useColorTheme-Z-rsU5UJ.mjs';
import { f as useLanguagePreferences, g as useRoute } from './server.mjs';
import { u as useLearnerAuth } from './useLearnerAuth-BLt5hOAV.mjs';
import { u as useSiteAnalytics } from './useSiteAnalytics-DPlmCjj8.mjs';
import { u as useState } from './state-DjsguMyT.mjs';
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
  __name: "default",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { ui, interfaceLocale, localePath } = useLanguagePreferences();
    const { user: learner, checkSession } = useLearnerAuth();
    const route = useRoute();
    useColorTheme();
    useSiteAnalytics();
    const isDark = ref(false);
    const localizedSectionPath = computed(() => route.path.replace(/^\/(?:fr|de|en|it|es)(?=\/|$)/u, "") || "/");
    const isAdminRoute = computed(() => localizedSectionPath.value === "/admin" || localizedSectionPath.value.startsWith("/admin/"));
    const themeSwitchTitle = computed(() => isDark.value ? ui("Activer le mode clair") : ui("Activer le mode sombre"));
    const languageOptions = computed(() => [
      { value: "fr", label: ui("Français"), flag: "🇫🇷" },
      { value: "de", label: ui("Allemand"), flag: "🇩🇪" },
      { value: "en", label: ui("Anglais"), flag: "🇬🇧" },
      { value: "it", label: ui("Italien"), flag: "🇮🇹" },
      { value: "es", label: ui("Espagnol"), flag: "🇪🇸" }
    ]);
    const homeResetRequested = useState("home-reset-requested", () => false);
    const newChallengeRequested = useState("new-challenge-requested", () => false);
    useState("guided-tour-requested", () => false);
    const wizardAtHome = useState("wizard-at-home", () => true);
    const tourCopy = computed(() => guidedTourCopy(interfaceLocale.value));
    const learnerCopy = computed(() => learnerSpaceCopy(interfaceLocale.value));
    const isActualHomePage = computed(() => localizedSectionPath.value === "/" && wizardAtHome.value);
    const activeLanguageOption = computed(() => languageOptions.value.find((option) => option.value === interfaceLocale.value) ?? languageOptions.value[0]);
    const learnerMenu = ref(null);
    const learnerLanguageMenuOpen = ref(false);
    ref(null);
    const tabletLanguageMenuOpen = ref(false);
    const learnerLoggingOut = ref(false);
    const learnerDisplayName = computed(() => {
      const username = learner.value?.username || "";
      return username ? username.charAt(0).toLocaleUpperCase("fr-CH") + username.slice(1) : "";
    });
    [__temp, __restore] = withAsyncContext(() => checkSession()), await __temp, __restore();
    watch(() => route.fullPath, () => {
      learnerMenu.value?.removeAttribute("open");
      learnerLanguageMenuOpen.value = false;
      tabletLanguageMenuOpen.value = false;
    });
    function requestHomeReset() {
      homeResetRequested.value = true;
    }
    function requestNewChallenge() {
      newChallengeRequested.value = true;
    }
    const activeLearnerTab = computed(() => {
      if (localizedSectionPath.value !== "/my-page") return "";
      const tab = String(route.query.tab || "history");
      return ["history", "progress", "preferences", "account"].includes(tab) ? tab : "history";
    });
    const activeSection = computed(() => {
      if (localizedSectionPath.value === "/consulter" || localizedSectionPath.value.startsWith("/consulter/")) return "consulter";
      if (localizedSectionPath.value === "/apprendre" || localizedSectionPath.value.startsWith("/apprendre/")) return "apprendre";
      if (!isAdminRoute.value) return "exercer";
      return "";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "site-shell" }, _attrs))}><header class="site-header"><div class="site-header__inner"><div class="site-header__identity">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "site-brand",
        to: unref(localePath)("/")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<strong${_scopeId}>TATITOTU</strong><span${_scopeId}>${ssrInterpolate(unref(ui)("Défis de conjugaison"))}</span>`);
          } else {
            return [
              createVNode("strong", null, "TATITOTU"),
              createVNode("span", null, toDisplayString(unref(ui)("Défis de conjugaison")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(isActualHomePage)) {
        _push(`<div class="language-selector language-selector--tablet" role="group"${ssrRenderAttr("aria-label", unref(ui)("Langue de l’interface"))}><!--[-->`);
        ssrRenderList(unref(languageOptions), (option) => {
          _push(`<button type="button" class="${ssrRenderClass({ "is-active": unref(interfaceLocale) === option.value })}"${ssrRenderAttr("aria-label", option.label)}${ssrRenderAttr("aria-pressed", unref(interfaceLocale) === option.value)}${ssrRenderAttr("title", option.label)}><span aria-hidden="true">${ssrInterpolate(option.flag)}</span></button>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="${ssrRenderClass([{ "is-open": unref(tabletLanguageMenuOpen) }, "tablet-language-menu"])}"><button class="tablet-language-menu__trigger" type="button"${ssrRenderAttr("aria-label", unref(ui)("Langue de l’interface"))}${ssrRenderAttr("aria-expanded", unref(tabletLanguageMenuOpen))}${ssrRenderAttr("title", unref(activeLanguageOption).label)}><span aria-hidden="true">${ssrInterpolate(unref(activeLanguageOption).flag)}</span></button><div class="language-selector tablet-language-menu__panel" role="group"${ssrRenderAttr("aria-label", unref(ui)("Langue de l’interface"))}${ssrRenderAttr("aria-hidden", !unref(tabletLanguageMenuOpen))}><!--[-->`);
        ssrRenderList(unref(languageOptions), (option) => {
          _push(`<button type="button" class="${ssrRenderClass({ "is-active": unref(interfaceLocale) === option.value })}"${ssrRenderAttr("aria-label", option.label)}${ssrRenderAttr("aria-pressed", unref(interfaceLocale) === option.value)}${ssrRenderAttr("title", option.label)}><span aria-hidden="true">${ssrInterpolate(option.flag)}</span></button>`);
        });
        _push(`<!--]--></div></div>`);
      }
      if (!unref(isActualHomePage)) {
        _push(`<button class="site-tour-button" type="button"${ssrRenderAttr("title", unref(tourCopy).navLabel)}><span class="site-tour-button__label">${ssrInterpolate(unref(tourCopy).navLabel)}</span><span class="site-tour-button__tablet-icon" aria-hidden="true">i</span></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><nav class="site-navigation"${ssrRenderAttr("aria-label", unref(ui)("Navigation principale"))}>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "site-navigation__home",
        to: unref(localePath)("/"),
        "aria-label": unref(ui)("Accueil"),
        title: unref(ui)("Accueil"),
        onClick: requestHomeReset
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg aria-hidden="true" viewBox="0 0 24 24"${_scopeId}><path d="M3 11.2 12 4l9 7.2"${_scopeId}></path><path d="M5.5 10.7V20h4.8v-5.4h3.4V20h4.8v-9.3"${_scopeId}></path></svg>`);
          } else {
            return [
              (openBlock(), createBlock("svg", {
                "aria-hidden": "true",
                viewBox: "0 0 24 24"
              }, [
                createVNode("path", { d: "M3 11.2 12 4l9 7.2" }),
                createVNode("path", { d: "M5.5 10.7V20h4.8v-5.4h3.4V20h4.8v-9.3" })
              ]))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(localePath)("/"),
        class: { "is-active": unref(activeSection) === "exercer" },
        "aria-current": unref(activeSection) === "exercer" ? "page" : void 0,
        onClick: requestNewChallenge
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
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(localePath)("/consulter"),
        class: { "is-active": unref(activeSection) === "consulter" },
        "aria-current": unref(activeSection) === "consulter" ? "page" : void 0
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(ui)("Consulter"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(ui)("Consulter")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(localePath)("/apprendre"),
        class: { "is-active": unref(activeSection) === "apprendre" },
        "aria-current": unref(activeSection) === "apprendre" ? "page" : void 0
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(ui)("Apprendre"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(ui)("Apprendre")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(learner)) {
        _push(`<details class="learner-menu" data-tour="learner-account"><summary><span class="learner-menu__avatar" aria-hidden="true">${ssrInterpolate(unref(learnerDisplayName).charAt(0))}</span><span>${ssrInterpolate(unref(learnerDisplayName))}</span><svg aria-hidden="true" viewBox="0 0 20 20"><path d="m5 7.5 5 5 5-5"></path></svg></summary><div class="learner-menu__panel">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: ["learner-menu__progress", { "is-active": unref(activeLearnerTab) === "history" }],
          to: `${unref(localePath)("/my-page")}?tab=history`
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span aria-hidden="true"${_scopeId}>✦</span> ${ssrInterpolate(unref(learnerCopy).history)}`);
            } else {
              return [
                createVNode("span", { "aria-hidden": "true" }, "✦"),
                createTextVNode(" " + toDisplayString(unref(learnerCopy).history), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `${unref(localePath)("/my-page")}?tab=progress`,
          class: { "is-active": unref(activeLearnerTab) === "progress" }
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(learnerCopy).commonErrors)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(learnerCopy).commonErrors), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="learner-menu__separator" role="separator"></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `${unref(localePath)("/my-page")}?tab=preferences`,
          class: { "is-active": unref(activeLearnerTab) === "preferences" }
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(learnerCopy).preferences)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(learnerCopy).preferences), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="learner-menu__language"><button class="learner-menu__language-trigger" type="button"${ssrRenderAttr("aria-expanded", unref(learnerLanguageMenuOpen))}${ssrRenderAttr("aria-label", unref(learnerCopy).changeLanguage)}><span>${ssrInterpolate(unref(learnerCopy).changeLanguage)}</span><svg aria-hidden="true" viewBox="0 0 20 20"><path d="m7.5 5 5 5-5 5"></path></svg></button>`);
        if (unref(learnerLanguageMenuOpen)) {
          _push(`<div class="learner-menu__language-options" role="group"${ssrRenderAttr("aria-label", unref(ui)("Langue de l’interface"))}><!--[-->`);
          ssrRenderList(unref(languageOptions), (option) => {
            _push(`<button type="button" class="${ssrRenderClass({ "is-active": unref(interfaceLocale) === option.value })}"${ssrRenderAttr("aria-label", option.label)}${ssrRenderAttr("aria-pressed", unref(interfaceLocale) === option.value)}${ssrRenderAttr("title", option.label)}><span aria-hidden="true">${ssrInterpolate(option.flag)}</span></button>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `${unref(localePath)("/my-page")}?tab=account#change-password`,
          class: { "is-active": unref(activeLearnerTab) === "account" }
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(ui)("Changer mon mot de passe"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(ui)("Changer mon mot de passe")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<button type="button"${ssrIncludeBooleanAttr(unref(learnerLoggingOut)) ? " disabled" : ""}>${ssrInterpolate(unref(learnerLoggingOut) ? unref(ui)("Déconnexion…") : unref(ui)("Me déconnecter"))}</button></div></details>`);
      } else {
        _push(`<!--[--><button class="${ssrRenderClass([{ "is-dark": unref(isDark) }, "theme-switch"])}" type="button" role="switch"${ssrRenderAttr("aria-checked", unref(isDark))}${ssrRenderAttr("aria-label", unref(themeSwitchTitle))}${ssrRenderAttr("title", unref(themeSwitchTitle))}><span class="theme-switch__icon theme-switch__icon--moon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20.1 15.4A8.7 8.7 0 0 1 8.6 3.9 8.8 8.8 0 1 0 20.1 15.4Z"></path></svg></span><span class="theme-switch__icon theme-switch__icon--sun" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.5"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg></span></button><div class="language-selector language-selector--navigation" role="group"${ssrRenderAttr("aria-label", unref(ui)("Langue de l’interface"))}><!--[-->`);
        ssrRenderList(unref(languageOptions), (option) => {
          _push(`<button type="button" class="${ssrRenderClass({ "is-active": unref(interfaceLocale) === option.value })}"${ssrRenderAttr("aria-label", option.label)}${ssrRenderAttr("aria-pressed", unref(interfaceLocale) === option.value)}${ssrRenderAttr("title", option.label)}><span aria-hidden="true">${ssrInterpolate(option.flag)}</span></button>`);
        });
        _push(`<!--]--></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "site-login-button",
          "data-tour": "learner-account",
          to: unref(localePath)("/signin")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(ui)("Connexion"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(ui)("Connexion")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<!--]-->`);
      }
      _push(`</nav></div></header><main class="${ssrRenderClass(["site-main", { "site-main--admin": unref(isAdminRoute) }])}">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main><footer class="site-footer"><p>${ssrInterpolate(unref(ui)("Un outil gratuit pour travailler la conjugaison française."))}</p><div class="site-footer__links"><a href="mailto:christophe.roulet@edu-vd.ch">${ssrInterpolate(unref(ui)("Contact"))}</a>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(localePath)("/admin")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(ui)("Administration"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(ui)("Administration")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></footer></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-BBCtSyDi.mjs.map
