import { u as useAdminAuth, _ as __nuxt_component_0, a as __nuxt_component_1, g as getAdminErrorMessage } from './AdminShell-4Nuy8GEQ.mjs';
import { defineComponent, ref, watch, withCtx, unref, createVNode, openBlock, createBlock, toDisplayString, createCommentVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrIncludeBooleanAttr, ssrInterpolate } from 'vue/server-renderer';
import { u as useHead } from './server.mjs';
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
  __name: "shared-summaries",
  __ssrInlineRender: true,
  setup(__props) {
    const { user, handleUnauthorized } = useAdminAuth();
    const stats = ref({ totalCount: 0, expiredCount: 0 });
    const loading = ref(false);
    const deleting = ref(false);
    const error = ref("");
    const success = ref("");
    let loaded = false;
    useHead({ title: "Bilans partagés — Administration" });
    async function loadStats() {
      loading.value = true;
      error.value = "";
      try {
        stats.value = await $fetch("/api/admin/exercise-summaries", {
          credentials: "same-origin"
        });
      } catch (caught) {
        if (!handleUnauthorized(caught)) {
          error.value = getAdminErrorMessage(caught, "Impossible de charger les bilans partagés.");
        }
      } finally {
        loading.value = false;
      }
    }
    async function deleteExpired() {
      if (deleting.value || !(void 0).confirm("Supprimer tous les bilans partagés âgés de plus d’un mois ?\n\nCette action est irréversible.")) return;
      deleting.value = true;
      error.value = "";
      success.value = "";
      try {
        const response = await $fetch("/api/admin/exercise-summaries", {
          method: "DELETE",
          credentials: "same-origin"
        });
        const count = response.count;
        success.value = `${count} bilan${count > 1 ? "s" : ""} partagé${count > 1 ? "s" : ""} supprimé${count > 1 ? "s" : ""}.`;
        await loadStats();
      } catch (caught) {
        if (!handleUnauthorized(caught)) {
          error.value = getAdminErrorMessage(caught, "Impossible de supprimer les anciens bilans.");
        }
      } finally {
        deleting.value = false;
      }
    }
    watch(user, (current) => {
      if (current && !loaded) {
        loaded = true;
        void loadStats();
      }
      if (!current) loaded = false;
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminAuthBoundary = __nuxt_component_0;
      const _component_AdminShell = __nuxt_component_1;
      _push(ssrRenderComponent(_component_AdminAuthBoundary, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_AdminShell, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="shared-summaries-admin" data-v-636d02ed${_scopeId2}><header class="admin-section-heading" data-v-636d02ed${_scopeId2}><div data-v-636d02ed${_scopeId2}><p class="admin-eyebrow" data-v-636d02ed${_scopeId2}>Stockage temporaire</p><h1 data-v-636d02ed${_scopeId2}>Bilans partagés</h1><p class="admin-muted" data-v-636d02ed${_scopeId2}>Les liens cessent de fonctionner un mois après la création du bilan.</p></div><button class="admin-button" type="button"${ssrIncludeBooleanAttr(unref(loading) || unref(deleting)) ? " disabled" : ""} data-v-636d02ed${_scopeId2}> Actualiser </button></header>`);
                  if (unref(error)) {
                    _push3(`<p class="admin-notice admin-notice--error" role="alert" data-v-636d02ed${_scopeId2}>${ssrInterpolate(unref(error))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(success)) {
                    _push3(`<p class="admin-notice admin-notice--success" role="status" data-v-636d02ed${_scopeId2}>${ssrInterpolate(unref(success))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(loading)) {
                    _push3(`<div class="shared-summaries-admin__loading" data-v-636d02ed${_scopeId2}><span class="admin-spinner" aria-hidden="true" data-v-636d02ed${_scopeId2}></span> Chargement… </div>`);
                  } else {
                    _push3(`<section class="admin-card shared-summaries-admin__panel" data-v-636d02ed${_scopeId2}><div class="shared-summaries-admin__metrics" data-v-636d02ed${_scopeId2}><div data-v-636d02ed${_scopeId2}><span data-v-636d02ed${_scopeId2}>Bilans enregistrés</span><strong data-v-636d02ed${_scopeId2}>${ssrInterpolate(unref(stats).totalCount)}</strong></div><div data-v-636d02ed${_scopeId2}><span data-v-636d02ed${_scopeId2}>Bilans de plus d’un mois</span><strong data-v-636d02ed${_scopeId2}>${ssrInterpolate(unref(stats).expiredCount)}</strong></div></div><div class="shared-summaries-admin__cleanup" data-v-636d02ed${_scopeId2}><div data-v-636d02ed${_scopeId2}><h2 data-v-636d02ed${_scopeId2}>Nettoyer les anciens bilans</h2><p data-v-636d02ed${_scopeId2}>Supprime définitivement tous les bilans partagés créés il y a plus d’un mois.</p></div><button class="admin-button admin-button--danger" type="button"${ssrIncludeBooleanAttr(unref(deleting) || unref(stats).expiredCount === 0) ? " disabled" : ""} data-v-636d02ed${_scopeId2}>${ssrInterpolate(unref(deleting) ? "Suppression…" : "Supprimer les bilans de plus d’un mois")}</button></div></section>`);
                  }
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "shared-summaries-admin" }, [
                      createVNode("header", { class: "admin-section-heading" }, [
                        createVNode("div", null, [
                          createVNode("p", { class: "admin-eyebrow" }, "Stockage temporaire"),
                          createVNode("h1", null, "Bilans partagés"),
                          createVNode("p", { class: "admin-muted" }, "Les liens cessent de fonctionner un mois après la création du bilan.")
                        ]),
                        createVNode("button", {
                          class: "admin-button",
                          type: "button",
                          disabled: unref(loading) || unref(deleting),
                          onClick: loadStats
                        }, " Actualiser ", 8, ["disabled"])
                      ]),
                      unref(error) ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "admin-notice admin-notice--error",
                        role: "alert"
                      }, toDisplayString(unref(error)), 1)) : createCommentVNode("", true),
                      unref(success) ? (openBlock(), createBlock("p", {
                        key: 1,
                        class: "admin-notice admin-notice--success",
                        role: "status"
                      }, toDisplayString(unref(success)), 1)) : createCommentVNode("", true),
                      unref(loading) ? (openBlock(), createBlock("div", {
                        key: 2,
                        class: "shared-summaries-admin__loading"
                      }, [
                        createVNode("span", {
                          class: "admin-spinner",
                          "aria-hidden": "true"
                        }),
                        createTextVNode(" Chargement… ")
                      ])) : (openBlock(), createBlock("section", {
                        key: 3,
                        class: "admin-card shared-summaries-admin__panel"
                      }, [
                        createVNode("div", { class: "shared-summaries-admin__metrics" }, [
                          createVNode("div", null, [
                            createVNode("span", null, "Bilans enregistrés"),
                            createVNode("strong", null, toDisplayString(unref(stats).totalCount), 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("span", null, "Bilans de plus d’un mois"),
                            createVNode("strong", null, toDisplayString(unref(stats).expiredCount), 1)
                          ])
                        ]),
                        createVNode("div", { class: "shared-summaries-admin__cleanup" }, [
                          createVNode("div", null, [
                            createVNode("h2", null, "Nettoyer les anciens bilans"),
                            createVNode("p", null, "Supprime définitivement tous les bilans partagés créés il y a plus d’un mois.")
                          ]),
                          createVNode("button", {
                            class: "admin-button admin-button--danger",
                            type: "button",
                            disabled: unref(deleting) || unref(stats).expiredCount === 0,
                            onClick: deleteExpired
                          }, toDisplayString(unref(deleting) ? "Suppression…" : "Supprimer les bilans de plus d’un mois"), 9, ["disabled"])
                        ])
                      ]))
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_AdminShell, null, {
                default: withCtx(() => [
                  createVNode("div", { class: "shared-summaries-admin" }, [
                    createVNode("header", { class: "admin-section-heading" }, [
                      createVNode("div", null, [
                        createVNode("p", { class: "admin-eyebrow" }, "Stockage temporaire"),
                        createVNode("h1", null, "Bilans partagés"),
                        createVNode("p", { class: "admin-muted" }, "Les liens cessent de fonctionner un mois après la création du bilan.")
                      ]),
                      createVNode("button", {
                        class: "admin-button",
                        type: "button",
                        disabled: unref(loading) || unref(deleting),
                        onClick: loadStats
                      }, " Actualiser ", 8, ["disabled"])
                    ]),
                    unref(error) ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "admin-notice admin-notice--error",
                      role: "alert"
                    }, toDisplayString(unref(error)), 1)) : createCommentVNode("", true),
                    unref(success) ? (openBlock(), createBlock("p", {
                      key: 1,
                      class: "admin-notice admin-notice--success",
                      role: "status"
                    }, toDisplayString(unref(success)), 1)) : createCommentVNode("", true),
                    unref(loading) ? (openBlock(), createBlock("div", {
                      key: 2,
                      class: "shared-summaries-admin__loading"
                    }, [
                      createVNode("span", {
                        class: "admin-spinner",
                        "aria-hidden": "true"
                      }),
                      createTextVNode(" Chargement… ")
                    ])) : (openBlock(), createBlock("section", {
                      key: 3,
                      class: "admin-card shared-summaries-admin__panel"
                    }, [
                      createVNode("div", { class: "shared-summaries-admin__metrics" }, [
                        createVNode("div", null, [
                          createVNode("span", null, "Bilans enregistrés"),
                          createVNode("strong", null, toDisplayString(unref(stats).totalCount), 1)
                        ]),
                        createVNode("div", null, [
                          createVNode("span", null, "Bilans de plus d’un mois"),
                          createVNode("strong", null, toDisplayString(unref(stats).expiredCount), 1)
                        ])
                      ]),
                      createVNode("div", { class: "shared-summaries-admin__cleanup" }, [
                        createVNode("div", null, [
                          createVNode("h2", null, "Nettoyer les anciens bilans"),
                          createVNode("p", null, "Supprime définitivement tous les bilans partagés créés il y a plus d’un mois.")
                        ]),
                        createVNode("button", {
                          class: "admin-button admin-button--danger",
                          type: "button",
                          disabled: unref(deleting) || unref(stats).expiredCount === 0,
                          onClick: deleteExpired
                        }, toDisplayString(unref(deleting) ? "Suppression…" : "Supprimer les bilans de plus d’un mois"), 9, ["disabled"])
                      ])
                    ]))
                  ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/shared-summaries.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const sharedSummaries = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-636d02ed"]]);

export { sharedSummaries as default };
//# sourceMappingURL=shared-summaries-D0JbdJPV.mjs.map
