import { u as useAdminAuth, _ as __nuxt_component_0, a as __nuxt_component_1, g as getAdminErrorMessage } from './AdminShell-Sgl2pXrT.mjs';
import { _ as __nuxt_component_0$1 } from './LearnerSpace-S7eZvHiv.mjs';
import { defineComponent, ref, computed, watch, withCtx, unref, createVNode, openBlock, createBlock, toDisplayString, createCommentVNode, createTextVNode, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
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
import 'mysql2/promise';
import 'node:url';
import 'node:fs/promises';
import './state-DjsguMyT.mjs';
import './CoachPicker-Ba-GTtPW.mjs';
import './CoachHelpPanel-CV6-CBeI.mjs';
import '../_/coach.mjs';
import '../_/coach-help-audit.mjs';
import '../_/near-future.mjs';
import '@fortawesome/free-solid-svg-icons';
import '@fortawesome/vue-fontawesome';
import '../_/coach-dialogue.mjs';
import '../_/identification-form.mjs';
import './useSiteAnalytics-D1wpWTOZ.mjs';
import '../_/mode-landing-pages.mjs';
import '../_/mode-tense-pedagogy.mjs';
import './useLearnerAuth-BLt5hOAV.mjs';
import './useColorTheme-Z-rsU5UJ.mjs';
import './asyncData-BBDHP0iC.mjs';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "users",
  __ssrInlineRender: true,
  setup(__props) {
    const { user: sessionUser, handleUnauthorized } = useAdminAuth();
    const users2 = ref([]);
    const total = ref(0);
    const nextOffset = ref(0);
    const hasMore = ref(false);
    const selectedId = ref();
    const loading = ref(false);
    const loadingMore = ref(false);
    const error = ref("");
    let loaded = false;
    const selectedUser = computed(() => users2.value.find((user) => user.id === selectedId.value));
    useHead({ title: "Utilisateurs — Administration" });
    function displayUsername(username) {
      return username ? username.charAt(0).toLocaleUpperCase("fr-CH") + username.slice(1) : "Utilisateur";
    }
    function exerciseLabel(count) {
      return `${count} exercice${count > 1 ? "s" : ""}`;
    }
    async function loadUsers(reset = true) {
      if (reset ? loading.value : loadingMore.value) return;
      if (reset) loading.value = true;
      else loadingMore.value = true;
      error.value = "";
      try {
        const response = await $fetch("/api/admin/users", {
          query: { offset: reset ? 0 : nextOffset.value, limit: 50 },
          credentials: "same-origin"
        });
        users2.value = reset ? response.users : [...users2.value, ...response.users];
        total.value = response.total;
        nextOffset.value = response.nextOffset;
        hasMore.value = response.hasMore;
        if (!selectedId.value || !users2.value.some((user) => user.id === selectedId.value)) {
          selectedId.value = users2.value[0]?.id;
        }
      } catch (caught) {
        if (!handleUnauthorized(caught)) {
          error.value = getAdminErrorMessage(caught, "Impossible de charger les utilisateurs.");
        }
      } finally {
        loading.value = false;
        loadingMore.value = false;
      }
    }
    watch(sessionUser, (current) => {
      if (current && !loaded) {
        loaded = true;
        void loadUsers();
      }
      if (!current) loaded = false;
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminAuthBoundary = __nuxt_component_0;
      const _component_AdminShell = __nuxt_component_1;
      const _component_LearnerSpace = __nuxt_component_0$1;
      _push(ssrRenderComponent(_component_AdminAuthBoundary, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_AdminShell, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="learner-admin" data-v-0e312772${_scopeId2}><header class="admin-section-heading" data-v-0e312772${_scopeId2}><div data-v-0e312772${_scopeId2}><p class="admin-eyebrow" data-v-0e312772${_scopeId2}>Comptes pseudonymes</p><h1 data-v-0e312772${_scopeId2}>Utilisateurs</h1><p class="admin-muted" data-v-0e312772${_scopeId2}>Les comptes sont classés du plus actif au moins actif.</p></div><button class="admin-button admin-button--small" type="button"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} data-v-0e312772${_scopeId2}> Actualiser </button></header>`);
                  if (unref(error)) {
                    _push3(`<p class="admin-notice admin-notice--error" role="alert" data-v-0e312772${_scopeId2}>${ssrInterpolate(unref(error))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`<div class="learner-admin__workspace" data-v-0e312772${_scopeId2}><aside class="learner-admin__directory admin-card" aria-labelledby="learner-directory-title" data-v-0e312772${_scopeId2}><header data-v-0e312772${_scopeId2}><div data-v-0e312772${_scopeId2}><h2 id="learner-directory-title" data-v-0e312772${_scopeId2}>${ssrInterpolate(unref(total))} utilisateurs</h2><span data-v-0e312772${_scopeId2}>Triés par exercices réalisés</span></div></header>`);
                  if (unref(loading)) {
                    _push3(`<div class="learner-admin__loading" data-v-0e312772${_scopeId2}><span class="admin-spinner" aria-hidden="true" data-v-0e312772${_scopeId2}></span> Chargement… </div>`);
                  } else {
                    _push3(`<ol class="learner-admin__list" data-v-0e312772${_scopeId2}><!--[-->`);
                    ssrRenderList(unref(users2), (learner) => {
                      _push3(`<li data-v-0e312772${_scopeId2}><button type="button" class="${ssrRenderClass({ "is-selected": learner.id === unref(selectedId) })}" data-v-0e312772${_scopeId2}><span class="learner-admin__avatar" aria-hidden="true" data-v-0e312772${_scopeId2}>${ssrInterpolate(learner.username.charAt(0).toLocaleUpperCase("fr-CH"))}</span><span data-v-0e312772${_scopeId2}><strong data-v-0e312772${_scopeId2}>${ssrInterpolate(displayUsername(learner.username))}</strong><small data-v-0e312772${_scopeId2}>${ssrInterpolate(exerciseLabel(learner.exerciseCount))}</small></span><b data-v-0e312772${_scopeId2}>${ssrInterpolate(learner.exerciseCount)}</b></button></li>`);
                    });
                    _push3(`<!--]--></ol>`);
                  }
                  if (unref(hasMore)) {
                    _push3(`<button class="admin-button learner-admin__more" type="button"${ssrIncludeBooleanAttr(unref(loadingMore)) ? " disabled" : ""} data-v-0e312772${_scopeId2}>${ssrInterpolate(unref(loadingMore) ? "Chargement…" : "Afficher les suivants")}</button>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</aside><main class="learner-admin__preview" data-v-0e312772${_scopeId2}>`);
                  if (unref(selectedUser)) {
                    _push3(ssrRenderComponent(_component_LearnerSpace, {
                      key: unref(selectedUser).id,
                      "inspected-learner": { id: unref(selectedUser).id, username: unref(selectedUser).username },
                      "read-only": ""
                    }, null, _parent3, _scopeId2));
                  } else if (!unref(loading)) {
                    _push3(`<div class="admin-card learner-admin__empty" data-v-0e312772${_scopeId2}> Aucun compte utilisateur à afficher. </div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</main></div></div>`);
                } else {
                  return [
                    createVNode("div", { class: "learner-admin" }, [
                      createVNode("header", { class: "admin-section-heading" }, [
                        createVNode("div", null, [
                          createVNode("p", { class: "admin-eyebrow" }, "Comptes pseudonymes"),
                          createVNode("h1", null, "Utilisateurs"),
                          createVNode("p", { class: "admin-muted" }, "Les comptes sont classés du plus actif au moins actif.")
                        ]),
                        createVNode("button", {
                          class: "admin-button admin-button--small",
                          type: "button",
                          disabled: unref(loading),
                          onClick: ($event) => loadUsers()
                        }, " Actualiser ", 8, ["disabled", "onClick"])
                      ]),
                      unref(error) ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "admin-notice admin-notice--error",
                        role: "alert"
                      }, toDisplayString(unref(error)), 1)) : createCommentVNode("", true),
                      createVNode("div", { class: "learner-admin__workspace" }, [
                        createVNode("aside", {
                          class: "learner-admin__directory admin-card",
                          "aria-labelledby": "learner-directory-title"
                        }, [
                          createVNode("header", null, [
                            createVNode("div", null, [
                              createVNode("h2", { id: "learner-directory-title" }, toDisplayString(unref(total)) + " utilisateurs", 1),
                              createVNode("span", null, "Triés par exercices réalisés")
                            ])
                          ]),
                          unref(loading) ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "learner-admin__loading"
                          }, [
                            createVNode("span", {
                              class: "admin-spinner",
                              "aria-hidden": "true"
                            }),
                            createTextVNode(" Chargement… ")
                          ])) : (openBlock(), createBlock("ol", {
                            key: 1,
                            class: "learner-admin__list"
                          }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(users2), (learner) => {
                              return openBlock(), createBlock("li", {
                                key: learner.id
                              }, [
                                createVNode("button", {
                                  type: "button",
                                  class: { "is-selected": learner.id === unref(selectedId) },
                                  onClick: ($event) => selectedId.value = learner.id
                                }, [
                                  createVNode("span", {
                                    class: "learner-admin__avatar",
                                    "aria-hidden": "true"
                                  }, toDisplayString(learner.username.charAt(0).toLocaleUpperCase("fr-CH")), 1),
                                  createVNode("span", null, [
                                    createVNode("strong", null, toDisplayString(displayUsername(learner.username)), 1),
                                    createVNode("small", null, toDisplayString(exerciseLabel(learner.exerciseCount)), 1)
                                  ]),
                                  createVNode("b", null, toDisplayString(learner.exerciseCount), 1)
                                ], 10, ["onClick"])
                              ]);
                            }), 128))
                          ])),
                          unref(hasMore) ? (openBlock(), createBlock("button", {
                            key: 2,
                            class: "admin-button learner-admin__more",
                            type: "button",
                            disabled: unref(loadingMore),
                            onClick: ($event) => loadUsers(false)
                          }, toDisplayString(unref(loadingMore) ? "Chargement…" : "Afficher les suivants"), 9, ["disabled", "onClick"])) : createCommentVNode("", true)
                        ]),
                        createVNode("main", { class: "learner-admin__preview" }, [
                          unref(selectedUser) ? (openBlock(), createBlock(_component_LearnerSpace, {
                            key: unref(selectedUser).id,
                            "inspected-learner": { id: unref(selectedUser).id, username: unref(selectedUser).username },
                            "read-only": ""
                          }, null, 8, ["inspected-learner"])) : !unref(loading) ? (openBlock(), createBlock("div", {
                            key: 1,
                            class: "admin-card learner-admin__empty"
                          }, " Aucun compte utilisateur à afficher. ")) : createCommentVNode("", true)
                        ])
                      ])
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
                  createVNode("div", { class: "learner-admin" }, [
                    createVNode("header", { class: "admin-section-heading" }, [
                      createVNode("div", null, [
                        createVNode("p", { class: "admin-eyebrow" }, "Comptes pseudonymes"),
                        createVNode("h1", null, "Utilisateurs"),
                        createVNode("p", { class: "admin-muted" }, "Les comptes sont classés du plus actif au moins actif.")
                      ]),
                      createVNode("button", {
                        class: "admin-button admin-button--small",
                        type: "button",
                        disabled: unref(loading),
                        onClick: ($event) => loadUsers()
                      }, " Actualiser ", 8, ["disabled", "onClick"])
                    ]),
                    unref(error) ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "admin-notice admin-notice--error",
                      role: "alert"
                    }, toDisplayString(unref(error)), 1)) : createCommentVNode("", true),
                    createVNode("div", { class: "learner-admin__workspace" }, [
                      createVNode("aside", {
                        class: "learner-admin__directory admin-card",
                        "aria-labelledby": "learner-directory-title"
                      }, [
                        createVNode("header", null, [
                          createVNode("div", null, [
                            createVNode("h2", { id: "learner-directory-title" }, toDisplayString(unref(total)) + " utilisateurs", 1),
                            createVNode("span", null, "Triés par exercices réalisés")
                          ])
                        ]),
                        unref(loading) ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "learner-admin__loading"
                        }, [
                          createVNode("span", {
                            class: "admin-spinner",
                            "aria-hidden": "true"
                          }),
                          createTextVNode(" Chargement… ")
                        ])) : (openBlock(), createBlock("ol", {
                          key: 1,
                          class: "learner-admin__list"
                        }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(users2), (learner) => {
                            return openBlock(), createBlock("li", {
                              key: learner.id
                            }, [
                              createVNode("button", {
                                type: "button",
                                class: { "is-selected": learner.id === unref(selectedId) },
                                onClick: ($event) => selectedId.value = learner.id
                              }, [
                                createVNode("span", {
                                  class: "learner-admin__avatar",
                                  "aria-hidden": "true"
                                }, toDisplayString(learner.username.charAt(0).toLocaleUpperCase("fr-CH")), 1),
                                createVNode("span", null, [
                                  createVNode("strong", null, toDisplayString(displayUsername(learner.username)), 1),
                                  createVNode("small", null, toDisplayString(exerciseLabel(learner.exerciseCount)), 1)
                                ]),
                                createVNode("b", null, toDisplayString(learner.exerciseCount), 1)
                              ], 10, ["onClick"])
                            ]);
                          }), 128))
                        ])),
                        unref(hasMore) ? (openBlock(), createBlock("button", {
                          key: 2,
                          class: "admin-button learner-admin__more",
                          type: "button",
                          disabled: unref(loadingMore),
                          onClick: ($event) => loadUsers(false)
                        }, toDisplayString(unref(loadingMore) ? "Chargement…" : "Afficher les suivants"), 9, ["disabled", "onClick"])) : createCommentVNode("", true)
                      ]),
                      createVNode("main", { class: "learner-admin__preview" }, [
                        unref(selectedUser) ? (openBlock(), createBlock(_component_LearnerSpace, {
                          key: unref(selectedUser).id,
                          "inspected-learner": { id: unref(selectedUser).id, username: unref(selectedUser).username },
                          "read-only": ""
                        }, null, 8, ["inspected-learner"])) : !unref(loading) ? (openBlock(), createBlock("div", {
                          key: 1,
                          class: "admin-card learner-admin__empty"
                        }, " Aucun compte utilisateur à afficher. ")) : createCommentVNode("", true)
                      ])
                    ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/users.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const users = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0e312772"]]);

export { users as default };
//# sourceMappingURL=users-9356frFn.mjs.map
