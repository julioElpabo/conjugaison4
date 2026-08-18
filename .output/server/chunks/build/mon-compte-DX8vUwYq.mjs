import { u as useAdminAuth, _ as __nuxt_component_0, a as __nuxt_component_1 } from './AdminShell-4Nuy8GEQ.mjs';
import { defineComponent, ref, computed, withCtx, unref, openBlock, createBlock, createVNode, toDisplayString, Fragment, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { g as useLanguagePreferences, u as useHead } from './server.mjs';
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
  __name: "mon-compte",
  __ssrInlineRender: true,
  setup(__props) {
    const { ui } = useLanguagePreferences();
    const { user } = useAdminAuth();
    const pushSupported = ref(false);
    const pushCapabilityChecked = ref(false);
    const pushEnabled = ref(false);
    const pushBusy = ref(false);
    const pushMessage = ref("");
    const pushError = ref("");
    let pushRegistration = null;
    let pushSubscription = null;
    useHead(() => ({ title: ui("Mon compte") }));
    const displayName = computed(() => {
      if (!user.value) {
        return "";
      }
      return [user.value.prenom, user.value.nom].filter(Boolean).join(" ");
    });
    function applicationServerKey(value) {
      const padding = "=".repeat((4 - value.length % 4) % 4);
      const raw = atob((value + padding).replace(/-/gu, "+").replace(/_/gu, "/"));
      return Uint8Array.from(raw, (character) => character.charCodeAt(0));
    }
    async function pushConfiguration() {
      return await $fetch("/api/admin/push-subscriptions");
    }
    async function synchronizeSubscription(subscription) {
      await $fetch("/api/admin/push-subscriptions", {
        method: "POST",
        body: subscription.toJSON()
      });
    }
    async function enablePush() {
      if (!pushSupported.value || pushBusy.value) return;
      pushBusy.value = true;
      pushMessage.value = "";
      pushError.value = "";
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          pushError.value = "Les notifications ont été refusées dans les réglages du navigateur.";
          return;
        }
        pushRegistration ||= await (void 0).serviceWorker.register("/admin-push-sw.js", { scope: "/" });
        const { publicKey } = await pushConfiguration();
        if (!publicKey) throw new Error("Clé Web Push indisponible");
        pushSubscription = await pushRegistration.pushManager.getSubscription() || await pushRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey(publicKey)
        });
        await synchronizeSubscription(pushSubscription);
        pushEnabled.value = true;
        pushMessage.value = "Notifications activées sur cet appareil.";
      } catch {
        pushError.value = "L’activation des notifications a échoué.";
      } finally {
        pushBusy.value = false;
      }
    }
    async function disablePush() {
      if (!pushSubscription || pushBusy.value) return;
      pushBusy.value = true;
      pushMessage.value = "";
      pushError.value = "";
      try {
        await $fetch("/api/admin/push-subscriptions", {
          method: "DELETE",
          body: { endpoint: pushSubscription.endpoint }
        });
        await pushSubscription.unsubscribe();
        pushSubscription = null;
        pushEnabled.value = false;
        pushMessage.value = "Notifications désactivées sur cet appareil.";
      } catch {
        pushError.value = "La désactivation des notifications a échoué.";
      } finally {
        pushBusy.value = false;
      }
    }
    async function testPush() {
      if (!pushSubscription || pushBusy.value) return;
      pushBusy.value = true;
      pushMessage.value = "";
      pushError.value = "";
      try {
        await $fetch("/api/admin/push-subscriptions/test", {
          method: "POST",
          body: { endpoint: pushSubscription.endpoint }
        });
        pushMessage.value = "Notification de test envoyée.";
      } catch {
        pushError.value = "La notification de test n’a pas pu être envoyée.";
      } finally {
        pushBusy.value = false;
      }
    }
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
                    _push3(`<div class="account-page" data-v-c807b3f7${_scopeId2}><header class="admin-section-heading" data-v-c807b3f7${_scopeId2}><div data-v-c807b3f7${_scopeId2}><p class="admin-eyebrow" data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Profil"))}</p><h1 data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Mon compte"))}</h1><p class="admin-muted" data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Informations associées à votre session administrateur."))}</p></div></header><section class="account-card admin-card" aria-labelledby="account-identity-title" data-v-c807b3f7${_scopeId2}><div class="account-card__avatar" aria-hidden="true" data-v-c807b3f7${_scopeId2}>${ssrInterpolate((unref(user).prenom?.[0] || unref(user).username?.[0] || "A").toLocaleUpperCase("fr"))}</div><div class="account-card__heading" data-v-c807b3f7${_scopeId2}><h2 id="account-identity-title" data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(displayName) || unref(user).username)}</h2><p data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Administrateur"))}</p></div><dl data-v-c807b3f7${_scopeId2}><div data-v-c807b3f7${_scopeId2}><dt data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Prénom"))}</dt><dd data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(user).prenom || "—")}</dd></div><div data-v-c807b3f7${_scopeId2}><dt data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Nom"))}</dt><dd data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(user).nom || "—")}</dd></div><div data-v-c807b3f7${_scopeId2}><dt data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Nom d’utilisateur"))}</dt><dd data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(user).username || "—")}</dd></div><div data-v-c807b3f7${_scopeId2}><dt data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Adresse e-mail"))}</dt><dd data-v-c807b3f7${_scopeId2}><a${ssrRenderAttr("href", `mailto:${unref(user).email}`)} data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(user).email)}</a></dd></div><div data-v-c807b3f7${_scopeId2}><dt data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Identifiant"))}</dt><dd data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(user).id)}</dd></div><div data-v-c807b3f7${_scopeId2}><dt data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Niveau d’accès"))}</dt><dd data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Administration"))}</dd></div></dl></section><section class="push-card admin-card" aria-labelledby="push-notifications-title" data-v-c807b3f7${_scopeId2}><div data-v-c807b3f7${_scopeId2}><p class="admin-eyebrow" data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Alertes privées"))}</p><h2 id="push-notifications-title" data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Notifications Tatitotu"))}</h2><p class="admin-muted" data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Recevez les paliers de comptes créés et de sessions quotidiennes, même lorsque le site n’est pas ouvert."))}</p></div>`);
                    if (unref(pushSupported)) {
                      _push3(`<div class="push-card__actions" data-v-c807b3f7${_scopeId2}>`);
                      if (!unref(pushEnabled)) {
                        _push3(`<button class="admin-button" type="button"${ssrIncludeBooleanAttr(unref(pushBusy)) ? " disabled" : ""} data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(pushBusy) ? unref(ui)("Activation…") : unref(ui)("Activer sur cet appareil"))}</button>`);
                      } else {
                        _push3(`<!--[--><span class="push-card__status" data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Activées sur cet appareil"))}</span><button class="admin-button" type="button"${ssrIncludeBooleanAttr(unref(pushBusy)) ? " disabled" : ""} data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Envoyer un test"))}</button><button class="admin-button admin-button--secondary" type="button"${ssrIncludeBooleanAttr(unref(pushBusy)) ? " disabled" : ""} data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Désactiver"))}</button><!--]-->`);
                      }
                      _push3(`</div>`);
                    } else if (unref(pushCapabilityChecked)) {
                      _push3(`<p class="admin-notice admin-notice--error" role="status" data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Ce navigateur ne prend pas en charge les notifications Web Push."))}</p>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    if (unref(pushMessage)) {
                      _push3(`<p class="admin-notice admin-notice--success" role="status" data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(pushMessage))}</p>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    if (unref(pushError)) {
                      _push3(`<p class="admin-notice admin-notice--error" role="alert" data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(pushError))}</p>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`<ul data-v-c807b3f7${_scopeId2}><li data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Comptes créés : 40, 50, 60, puis chaque dizaine."))}</li><li data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Sessions quotidiennes : 1 000, 1 500, puis chaque centaine."))}</li></ul></section><aside class="account-note" data-v-c807b3f7${_scopeId2}><strong data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Modification du profil"))}</strong><p data-v-c807b3f7${_scopeId2}>${ssrInterpolate(unref(ui)("Cette version permet de consulter le compte. Aucune API de modification du profil ou du mot de passe n’est disponible."))}</p></aside></div>`);
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
                      createVNode("section", {
                        class: "push-card admin-card",
                        "aria-labelledby": "push-notifications-title"
                      }, [
                        createVNode("div", null, [
                          createVNode("p", { class: "admin-eyebrow" }, toDisplayString(unref(ui)("Alertes privées")), 1),
                          createVNode("h2", { id: "push-notifications-title" }, toDisplayString(unref(ui)("Notifications Tatitotu")), 1),
                          createVNode("p", { class: "admin-muted" }, toDisplayString(unref(ui)("Recevez les paliers de comptes créés et de sessions quotidiennes, même lorsque le site n’est pas ouvert.")), 1)
                        ]),
                        unref(pushSupported) ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "push-card__actions"
                        }, [
                          !unref(pushEnabled) ? (openBlock(), createBlock("button", {
                            key: 0,
                            class: "admin-button",
                            type: "button",
                            disabled: unref(pushBusy),
                            onClick: enablePush
                          }, toDisplayString(unref(pushBusy) ? unref(ui)("Activation…") : unref(ui)("Activer sur cet appareil")), 9, ["disabled"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                            createVNode("span", { class: "push-card__status" }, toDisplayString(unref(ui)("Activées sur cet appareil")), 1),
                            createVNode("button", {
                              class: "admin-button",
                              type: "button",
                              disabled: unref(pushBusy),
                              onClick: testPush
                            }, toDisplayString(unref(ui)("Envoyer un test")), 9, ["disabled"]),
                            createVNode("button", {
                              class: "admin-button admin-button--secondary",
                              type: "button",
                              disabled: unref(pushBusy),
                              onClick: disablePush
                            }, toDisplayString(unref(ui)("Désactiver")), 9, ["disabled"])
                          ], 64))
                        ])) : unref(pushCapabilityChecked) ? (openBlock(), createBlock("p", {
                          key: 1,
                          class: "admin-notice admin-notice--error",
                          role: "status"
                        }, toDisplayString(unref(ui)("Ce navigateur ne prend pas en charge les notifications Web Push.")), 1)) : createCommentVNode("", true),
                        unref(pushMessage) ? (openBlock(), createBlock("p", {
                          key: 2,
                          class: "admin-notice admin-notice--success",
                          role: "status"
                        }, toDisplayString(unref(pushMessage)), 1)) : createCommentVNode("", true),
                        unref(pushError) ? (openBlock(), createBlock("p", {
                          key: 3,
                          class: "admin-notice admin-notice--error",
                          role: "alert"
                        }, toDisplayString(unref(pushError)), 1)) : createCommentVNode("", true),
                        createVNode("ul", null, [
                          createVNode("li", null, toDisplayString(unref(ui)("Comptes créés : 40, 50, 60, puis chaque dizaine.")), 1),
                          createVNode("li", null, toDisplayString(unref(ui)("Sessions quotidiennes : 1 000, 1 500, puis chaque centaine.")), 1)
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
                    createVNode("section", {
                      class: "push-card admin-card",
                      "aria-labelledby": "push-notifications-title"
                    }, [
                      createVNode("div", null, [
                        createVNode("p", { class: "admin-eyebrow" }, toDisplayString(unref(ui)("Alertes privées")), 1),
                        createVNode("h2", { id: "push-notifications-title" }, toDisplayString(unref(ui)("Notifications Tatitotu")), 1),
                        createVNode("p", { class: "admin-muted" }, toDisplayString(unref(ui)("Recevez les paliers de comptes créés et de sessions quotidiennes, même lorsque le site n’est pas ouvert.")), 1)
                      ]),
                      unref(pushSupported) ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "push-card__actions"
                      }, [
                        !unref(pushEnabled) ? (openBlock(), createBlock("button", {
                          key: 0,
                          class: "admin-button",
                          type: "button",
                          disabled: unref(pushBusy),
                          onClick: enablePush
                        }, toDisplayString(unref(pushBusy) ? unref(ui)("Activation…") : unref(ui)("Activer sur cet appareil")), 9, ["disabled"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                          createVNode("span", { class: "push-card__status" }, toDisplayString(unref(ui)("Activées sur cet appareil")), 1),
                          createVNode("button", {
                            class: "admin-button",
                            type: "button",
                            disabled: unref(pushBusy),
                            onClick: testPush
                          }, toDisplayString(unref(ui)("Envoyer un test")), 9, ["disabled"]),
                          createVNode("button", {
                            class: "admin-button admin-button--secondary",
                            type: "button",
                            disabled: unref(pushBusy),
                            onClick: disablePush
                          }, toDisplayString(unref(ui)("Désactiver")), 9, ["disabled"])
                        ], 64))
                      ])) : unref(pushCapabilityChecked) ? (openBlock(), createBlock("p", {
                        key: 1,
                        class: "admin-notice admin-notice--error",
                        role: "status"
                      }, toDisplayString(unref(ui)("Ce navigateur ne prend pas en charge les notifications Web Push.")), 1)) : createCommentVNode("", true),
                      unref(pushMessage) ? (openBlock(), createBlock("p", {
                        key: 2,
                        class: "admin-notice admin-notice--success",
                        role: "status"
                      }, toDisplayString(unref(pushMessage)), 1)) : createCommentVNode("", true),
                      unref(pushError) ? (openBlock(), createBlock("p", {
                        key: 3,
                        class: "admin-notice admin-notice--error",
                        role: "alert"
                      }, toDisplayString(unref(pushError)), 1)) : createCommentVNode("", true),
                      createVNode("ul", null, [
                        createVNode("li", null, toDisplayString(unref(ui)("Comptes créés : 40, 50, 60, puis chaque dizaine.")), 1),
                        createVNode("li", null, toDisplayString(unref(ui)("Sessions quotidiennes : 1 000, 1 500, puis chaque centaine.")), 1)
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
const monCompte = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c807b3f7"]]);

export { monCompte as default };
//# sourceMappingURL=mon-compte-DX8vUwYq.mjs.map
