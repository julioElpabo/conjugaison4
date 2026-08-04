import { u as useAdminAuth, _ as __nuxt_component_0, a as __nuxt_component_1 } from './AdminShell-DAeZS54P.mjs';
import { defineComponent, computed, withCtx, unref, openBlock, createBlock, createVNode, toDisplayString, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
import { f as useLanguagePreferences, u as useHead } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import './nuxt-link-icjx6oE7.mjs';
import '../nitro/nitro.mjs';
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
import './state-DjsguMyT.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "mon-compte",
  __ssrInlineRender: true,
  setup(__props) {
    const { ui } = useLanguagePreferences();
    const { user } = useAdminAuth();
    useHead(() => ({ title: ui("Mon compte") }));
    const displayName = computed(() => {
      if (!user.value) {
        return "";
      }
      return [user.value.prenom, user.value.nom].filter(Boolean).join(" ");
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminAuthBoundary = __nuxt_component_0;
      const _component_AdminShell = __nuxt_component_1;
      _push(ssrRenderComponent(_component_AdminAuthBoundary, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_AdminShell, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (unref(user)) {
                    _push3(`<div class="account-page" data-v-1c724fc9${_scopeId2}><header class="admin-section-heading" data-v-1c724fc9${_scopeId2}><div data-v-1c724fc9${_scopeId2}><p class="admin-eyebrow" data-v-1c724fc9${_scopeId2}>${ssrInterpolate(unref(ui)("Profil"))}</p><h1 data-v-1c724fc9${_scopeId2}>${ssrInterpolate(unref(ui)("Mon compte"))}</h1><p class="admin-muted" data-v-1c724fc9${_scopeId2}>${ssrInterpolate(unref(ui)("Informations associées à votre session administrateur."))}</p></div></header><section class="account-card admin-card" aria-labelledby="account-identity-title" data-v-1c724fc9${_scopeId2}><div class="account-card__avatar" aria-hidden="true" data-v-1c724fc9${_scopeId2}>${ssrInterpolate((unref(user).prenom?.[0] || unref(user).username?.[0] || "A").toLocaleUpperCase("fr"))}</div><div class="account-card__heading" data-v-1c724fc9${_scopeId2}><h2 id="account-identity-title" data-v-1c724fc9${_scopeId2}>${ssrInterpolate(unref(displayName) || unref(user).username)}</h2><p data-v-1c724fc9${_scopeId2}>${ssrInterpolate(unref(ui)("Administrateur"))}</p></div><dl data-v-1c724fc9${_scopeId2}><div data-v-1c724fc9${_scopeId2}><dt data-v-1c724fc9${_scopeId2}>${ssrInterpolate(unref(ui)("Prénom"))}</dt><dd data-v-1c724fc9${_scopeId2}>${ssrInterpolate(unref(user).prenom || "—")}</dd></div><div data-v-1c724fc9${_scopeId2}><dt data-v-1c724fc9${_scopeId2}>${ssrInterpolate(unref(ui)("Nom"))}</dt><dd data-v-1c724fc9${_scopeId2}>${ssrInterpolate(unref(user).nom || "—")}</dd></div><div data-v-1c724fc9${_scopeId2}><dt data-v-1c724fc9${_scopeId2}>${ssrInterpolate(unref(ui)("Nom d’utilisateur"))}</dt><dd data-v-1c724fc9${_scopeId2}>${ssrInterpolate(unref(user).username || "—")}</dd></div><div data-v-1c724fc9${_scopeId2}><dt data-v-1c724fc9${_scopeId2}>${ssrInterpolate(unref(ui)("Adresse e-mail"))}</dt><dd data-v-1c724fc9${_scopeId2}><a${ssrRenderAttr("href", `mailto:${unref(user).email}`)} data-v-1c724fc9${_scopeId2}>${ssrInterpolate(unref(user).email)}</a></dd></div><div data-v-1c724fc9${_scopeId2}><dt data-v-1c724fc9${_scopeId2}>${ssrInterpolate(unref(ui)("Identifiant"))}</dt><dd data-v-1c724fc9${_scopeId2}>${ssrInterpolate(unref(user).id)}</dd></div><div data-v-1c724fc9${_scopeId2}><dt data-v-1c724fc9${_scopeId2}>${ssrInterpolate(unref(ui)("Niveau d’accès"))}</dt><dd data-v-1c724fc9${_scopeId2}>${ssrInterpolate(unref(ui)("Administration"))}</dd></div></dl></section><aside class="account-note" data-v-1c724fc9${_scopeId2}><strong data-v-1c724fc9${_scopeId2}>${ssrInterpolate(unref(ui)("Modification du profil"))}</strong><p data-v-1c724fc9${_scopeId2}>${ssrInterpolate(unref(ui)("Cette version permet de consulter le compte. Aucune API de modification du profil ou du mot de passe n’est disponible."))}</p></aside></div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                } else {
                  return [
                    unref(user) ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "account-page"
                    }, [
                      createVNode("header", { class: "admin-section-heading" }, [
                        createVNode("div", null, [
                          createVNode("p", { class: "admin-eyebrow" }, toDisplayString(unref(ui)("Profil")), 1),
                          createVNode("h1", null, toDisplayString(unref(ui)("Mon compte")), 1),
                          createVNode("p", { class: "admin-muted" }, toDisplayString(unref(ui)("Informations associées à votre session administrateur.")), 1)
                        ])
                      ]),
                      createVNode("section", {
                        class: "account-card admin-card",
                        "aria-labelledby": "account-identity-title"
                      }, [
                        createVNode("div", {
                          class: "account-card__avatar",
                          "aria-hidden": "true"
                        }, toDisplayString((unref(user).prenom?.[0] || unref(user).username?.[0] || "A").toLocaleUpperCase("fr")), 1),
                        createVNode("div", { class: "account-card__heading" }, [
                          createVNode("h2", { id: "account-identity-title" }, toDisplayString(unref(displayName) || unref(user).username), 1),
                          createVNode("p", null, toDisplayString(unref(ui)("Administrateur")), 1)
                        ]),
                        createVNode("dl", null, [
                          createVNode("div", null, [
                            createVNode("dt", null, toDisplayString(unref(ui)("Prénom")), 1),
                            createVNode("dd", null, toDisplayString(unref(user).prenom || "—"), 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("dt", null, toDisplayString(unref(ui)("Nom")), 1),
                            createVNode("dd", null, toDisplayString(unref(user).nom || "—"), 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("dt", null, toDisplayString(unref(ui)("Nom d’utilisateur")), 1),
                            createVNode("dd", null, toDisplayString(unref(user).username || "—"), 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("dt", null, toDisplayString(unref(ui)("Adresse e-mail")), 1),
                            createVNode("dd", null, [
                              createVNode("a", {
                                href: `mailto:${unref(user).email}`
                              }, toDisplayString(unref(user).email), 9, ["href"])
                            ])
                          ]),
                          createVNode("div", null, [
                            createVNode("dt", null, toDisplayString(unref(ui)("Identifiant")), 1),
                            createVNode("dd", null, toDisplayString(unref(user).id), 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("dt", null, toDisplayString(unref(ui)("Niveau d’accès")), 1),
                            createVNode("dd", null, toDisplayString(unref(ui)("Administration")), 1)
                          ])
                        ])
                      ]),
                      createVNode("aside", { class: "account-note" }, [
                        createVNode("strong", null, toDisplayString(unref(ui)("Modification du profil")), 1),
                        createVNode("p", null, toDisplayString(unref(ui)("Cette version permet de consulter le compte. Aucune API de modification du profil ou du mot de passe n’est disponible.")), 1)
                      ])
                    ])) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_AdminShell, null, {
                default: withCtx(() => [
                  unref(user) ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "account-page"
                  }, [
                    createVNode("header", { class: "admin-section-heading" }, [
                      createVNode("div", null, [
                        createVNode("p", { class: "admin-eyebrow" }, toDisplayString(unref(ui)("Profil")), 1),
                        createVNode("h1", null, toDisplayString(unref(ui)("Mon compte")), 1),
                        createVNode("p", { class: "admin-muted" }, toDisplayString(unref(ui)("Informations associées à votre session administrateur.")), 1)
                      ])
                    ]),
                    createVNode("section", {
                      class: "account-card admin-card",
                      "aria-labelledby": "account-identity-title"
                    }, [
                      createVNode("div", {
                        class: "account-card__avatar",
                        "aria-hidden": "true"
                      }, toDisplayString((unref(user).prenom?.[0] || unref(user).username?.[0] || "A").toLocaleUpperCase("fr")), 1),
                      createVNode("div", { class: "account-card__heading" }, [
                        createVNode("h2", { id: "account-identity-title" }, toDisplayString(unref(displayName) || unref(user).username), 1),
                        createVNode("p", null, toDisplayString(unref(ui)("Administrateur")), 1)
                      ]),
                      createVNode("dl", null, [
                        createVNode("div", null, [
                          createVNode("dt", null, toDisplayString(unref(ui)("Prénom")), 1),
                          createVNode("dd", null, toDisplayString(unref(user).prenom || "—"), 1)
                        ]),
                        createVNode("div", null, [
                          createVNode("dt", null, toDisplayString(unref(ui)("Nom")), 1),
                          createVNode("dd", null, toDisplayString(unref(user).nom || "—"), 1)
                        ]),
                        createVNode("div", null, [
                          createVNode("dt", null, toDisplayString(unref(ui)("Nom d’utilisateur")), 1),
                          createVNode("dd", null, toDisplayString(unref(user).username || "—"), 1)
                        ]),
                        createVNode("div", null, [
                          createVNode("dt", null, toDisplayString(unref(ui)("Adresse e-mail")), 1),
                          createVNode("dd", null, [
                            createVNode("a", {
                              href: `mailto:${unref(user).email}`
                            }, toDisplayString(unref(user).email), 9, ["href"])
                          ])
                        ]),
                        createVNode("div", null, [
                          createVNode("dt", null, toDisplayString(unref(ui)("Identifiant")), 1),
                          createVNode("dd", null, toDisplayString(unref(user).id), 1)
                        ]),
                        createVNode("div", null, [
                          createVNode("dt", null, toDisplayString(unref(ui)("Niveau d’accès")), 1),
                          createVNode("dd", null, toDisplayString(unref(ui)("Administration")), 1)
                        ])
                      ])
                    ]),
                    createVNode("aside", { class: "account-note" }, [
                      createVNode("strong", null, toDisplayString(unref(ui)("Modification du profil")), 1),
                      createVNode("p", null, toDisplayString(unref(ui)("Cette version permet de consulter le compte. Aucune API de modification du profil ou du mot de passe n’est disponible.")), 1)
                    ])
                  ])) : createCommentVNode("", true)
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/mon-compte.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const monCompte = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-1c724fc9"]]);

export { monCompte as default };
//# sourceMappingURL=mon-compte-qEflaIPp.mjs.map
