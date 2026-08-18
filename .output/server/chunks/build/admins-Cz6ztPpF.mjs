import { u as useAdminAuth, _ as __nuxt_component_0, a as __nuxt_component_1, g as getAdminErrorMessage } from './AdminShell-4Nuy8GEQ.mjs';
import { defineComponent, ref, reactive, computed, watch, withCtx, unref, createVNode, openBlock, createBlock, toDisplayString, createCommentVNode, createTextVNode, Fragment, renderList, withModifiers, withDirectives, vModelText, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderClass, ssrRenderAttr } from 'vue/server-renderer';
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
  __name: "admins",
  __ssrInlineRender: true,
  setup(__props) {
    const { user: sessionUser, handleUnauthorized, checkSession } = useAdminAuth();
    const users = ref([]);
    const selectedId = ref(null);
    const loading = ref(false);
    const saving = ref(false);
    const deleting = ref(false);
    const error = ref("");
    const success = ref("");
    let loaded = false;
    const draft = reactive({ prenom: "", nom: "", email: "", username: "", password: "" });
    const editing = computed(() => selectedId.value !== null);
    const selectedUser = computed(() => users.value.find((item) => item.id === selectedId.value) || null);
    useHead({ title: "Admins — Administration" });
    function resetDraft() {
      selectedId.value = null;
      Object.assign(draft, { prenom: "", nom: "", email: "", username: "", password: "" });
      error.value = "";
      success.value = "";
    }
    function editUser(managed) {
      selectedId.value = managed.id;
      Object.assign(draft, { prenom: managed.prenom, nom: managed.nom, email: managed.email, username: managed.username, password: "" });
      error.value = "";
      success.value = "";
    }
    async function loadUsers(keepSelection = true) {
      loading.value = true;
      error.value = "";
      try {
        const response = await $fetch("/api/admin/admins", { credentials: "same-origin" });
        users.value = response.users;
        if (keepSelection && selectedId.value) {
          const refreshed = users.value.find((item) => item.id === selectedId.value);
          if (refreshed) editUser(refreshed);
          else resetDraft();
        }
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible de charger les admins.");
      } finally {
        loading.value = false;
      }
    }
    async function saveUser() {
      if (saving.value) return;
      saving.value = true;
      error.value = "";
      success.value = "";
      const body = { ...draft };
      const wasEditing = editing.value;
      try {
        if (wasEditing) {
          await $fetch(`/api/admin/admins/${selectedId.value}`, { method: "PUT", credentials: "same-origin", body });
          if (selectedId.value === sessionUser.value?.id) await checkSession(true);
        } else {
          const response = await $fetch("/api/admin/admins", { method: "POST", credentials: "same-origin", body });
          selectedId.value = response.id;
        }
        const message = wasEditing ? "Admin enregistré." : "Admin créé.";
        draft.password = "";
        await loadUsers(true);
        success.value = message;
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible d’enregistrer cet admin.");
      } finally {
        saving.value = false;
      }
    }
    async function deleteUser() {
      const managed = selectedUser.value;
      if (!managed || deleting.value || !(void 0).confirm(`Supprimer le compte de ${managed.prenom} ${managed.nom} ?`)) return;
      deleting.value = true;
      error.value = "";
      try {
        await $fetch(`/api/admin/admins/${managed.id}`, { method: "DELETE", credentials: "same-origin" });
        resetDraft();
        await loadUsers(false);
        success.value = "Admin supprimé.";
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible de supprimer cet admin.");
      } finally {
        deleting.value = false;
      }
    }
    watch(sessionUser, (current) => {
      if (current && !loaded) {
        loaded = true;
        void loadUsers(false);
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
                  _push3(`<div class="admin-users" data-v-29627520${_scopeId2}><header class="admin-section-heading" data-v-29627520${_scopeId2}><div data-v-29627520${_scopeId2}><p class="admin-eyebrow" data-v-29627520${_scopeId2}>Accès</p><h1 data-v-29627520${_scopeId2}>Admins</h1><p class="admin-muted" data-v-29627520${_scopeId2}>Créez et gérez les comptes qui peuvent accéder à l’administration.</p></div><button class="admin-button admin-button--primary" type="button" data-v-29627520${_scopeId2}>Nouvel admin</button></header>`);
                  if (unref(error)) {
                    _push3(`<p class="admin-notice admin-notice--error" role="alert" data-v-29627520${_scopeId2}>${ssrInterpolate(unref(error))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(success)) {
                    _push3(`<p class="admin-notice admin-notice--success" role="status" data-v-29627520${_scopeId2}>${ssrInterpolate(unref(success))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`<div class="admin-users__workspace" data-v-29627520${_scopeId2}><section class="admin-users__list admin-card" aria-labelledby="users-list-title" data-v-29627520${_scopeId2}><header data-v-29627520${_scopeId2}><h2 id="users-list-title" data-v-29627520${_scopeId2}>${ssrInterpolate(unref(users).length)} comptes</h2><button class="admin-button admin-button--small"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} data-v-29627520${_scopeId2}>Actualiser</button></header>`);
                  if (unref(loading)) {
                    _push3(`<div class="admin-users__loading" data-v-29627520${_scopeId2}><span class="admin-spinner" aria-hidden="true" data-v-29627520${_scopeId2}></span> Chargement…</div>`);
                  } else {
                    _push3(`<!--[-->`);
                    ssrRenderList(unref(users), (managed) => {
                      _push3(`<button class="${ssrRenderClass(["admin-users__item", { "is-selected": managed.id === unref(selectedId) }])}" type="button" data-v-29627520${_scopeId2}><span class="admin-users__avatar" aria-hidden="true" data-v-29627520${_scopeId2}>${ssrInterpolate((managed.prenom[0] || managed.username[0] || "?").toLocaleUpperCase("fr"))}</span><span data-v-29627520${_scopeId2}><strong data-v-29627520${_scopeId2}>${ssrInterpolate(managed.prenom)} ${ssrInterpolate(managed.nom)}</strong><small data-v-29627520${_scopeId2}>${ssrInterpolate(managed.email)}</small></span><em data-v-29627520${_scopeId2}>Admin</em></button>`);
                    });
                    _push3(`<!--]-->`);
                  }
                  _push3(`</section><form class="admin-users__form admin-card" data-v-29627520${_scopeId2}><div class="admin-users__form-heading" data-v-29627520${_scopeId2}><div data-v-29627520${_scopeId2}><p class="admin-eyebrow" data-v-29627520${_scopeId2}>${ssrInterpolate(unref(editing) ? `Compte no ${unref(selectedId)}` : "Nouveau compte")}</p><h2 data-v-29627520${_scopeId2}>${ssrInterpolate(unref(editing) ? "Modifier l’admin" : "Créer un admin")}</h2></div>`);
                  if (unref(editing)) {
                    _push3(`<button class="admin-button admin-button--danger admin-button--small" type="button"${ssrIncludeBooleanAttr(unref(deleting) || unref(selectedId) === unref(sessionUser)?.id) ? " disabled" : ""} data-v-29627520${_scopeId2}>${ssrInterpolate(unref(deleting) ? "Suppression…" : "Supprimer")}</button>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div><div class="admin-users__fields" data-v-29627520${_scopeId2}><label class="admin-field" data-v-29627520${_scopeId2}><span data-v-29627520${_scopeId2}>Prénom *</span><input${ssrRenderAttr("value", unref(draft).prenom)} required maxlength="255" data-v-29627520${_scopeId2}></label><label class="admin-field" data-v-29627520${_scopeId2}><span data-v-29627520${_scopeId2}>Nom *</span><input${ssrRenderAttr("value", unref(draft).nom)} required maxlength="255" data-v-29627520${_scopeId2}></label><label class="admin-field" data-v-29627520${_scopeId2}><span data-v-29627520${_scopeId2}>Adresse e-mail *</span><input${ssrRenderAttr("value", unref(draft).email)} required type="email" maxlength="254" data-v-29627520${_scopeId2}></label><label class="admin-field" data-v-29627520${_scopeId2}><span data-v-29627520${_scopeId2}>Nom d’utilisateur *</span><input${ssrRenderAttr("value", unref(draft).username)} required maxlength="255" autocomplete="off" data-v-29627520${_scopeId2}></label><label class="admin-field" data-v-29627520${_scopeId2}><span data-v-29627520${_scopeId2}>${ssrInterpolate(unref(editing) ? "Nouveau mot de passe" : "Mot de passe *")}</span><input${ssrRenderAttr("value", unref(draft).password)} type="password"${ssrIncludeBooleanAttr(!unref(editing)) ? " required" : ""} minlength="10" maxlength="200" autocomplete="new-password" data-v-29627520${_scopeId2}><small data-v-29627520${_scopeId2}>${ssrInterpolate(unref(editing) ? "Laissez vide pour le conserver." : "10 caractères minimum.")}</small></label></div><div class="admin-users__actions" data-v-29627520${_scopeId2}><button class="admin-button" type="button" data-v-29627520${_scopeId2}>Annuler</button><button class="admin-button admin-button--primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-29627520${_scopeId2}>${ssrInterpolate(unref(saving) ? "Enregistrement…" : unref(editing) ? "Enregistrer" : "Créer le compte")}</button></div></form></div></div>`);
                } else {
                  return [
                    createVNode("div", { class: "admin-users" }, [
                      createVNode("header", { class: "admin-section-heading" }, [
                        createVNode("div", null, [
                          createVNode("p", { class: "admin-eyebrow" }, "Accès"),
                          createVNode("h1", null, "Admins"),
                          createVNode("p", { class: "admin-muted" }, "Créez et gérez les comptes qui peuvent accéder à l’administration.")
                        ]),
                        createVNode("button", {
                          class: "admin-button admin-button--primary",
                          type: "button",
                          onClick: resetDraft
                        }, "Nouvel admin")
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
                      createVNode("div", { class: "admin-users__workspace" }, [
                        createVNode("section", {
                          class: "admin-users__list admin-card",
                          "aria-labelledby": "users-list-title"
                        }, [
                          createVNode("header", null, [
                            createVNode("h2", { id: "users-list-title" }, toDisplayString(unref(users).length) + " comptes", 1),
                            createVNode("button", {
                              class: "admin-button admin-button--small",
                              disabled: unref(loading),
                              onClick: ($event) => loadUsers()
                            }, "Actualiser", 8, ["disabled", "onClick"])
                          ]),
                          unref(loading) ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "admin-users__loading"
                          }, [
                            createVNode("span", {
                              class: "admin-spinner",
                              "aria-hidden": "true"
                            }),
                            createTextVNode(" Chargement…")
                          ])) : (openBlock(true), createBlock(Fragment, { key: 1 }, renderList(unref(users), (managed) => {
                            return openBlock(), createBlock("button", {
                              key: managed.id,
                              class: ["admin-users__item", { "is-selected": managed.id === unref(selectedId) }],
                              type: "button",
                              onClick: ($event) => editUser(managed)
                            }, [
                              createVNode("span", {
                                class: "admin-users__avatar",
                                "aria-hidden": "true"
                              }, toDisplayString((managed.prenom[0] || managed.username[0] || "?").toLocaleUpperCase("fr")), 1),
                              createVNode("span", null, [
                                createVNode("strong", null, toDisplayString(managed.prenom) + " " + toDisplayString(managed.nom), 1),
                                createVNode("small", null, toDisplayString(managed.email), 1)
                              ]),
                              createVNode("em", null, "Admin")
                            ], 10, ["onClick"]);
                          }), 128))
                        ]),
                        createVNode("form", {
                          class: "admin-users__form admin-card",
                          onSubmit: withModifiers(saveUser, ["prevent"])
                        }, [
                          createVNode("div", { class: "admin-users__form-heading" }, [
                            createVNode("div", null, [
                              createVNode("p", { class: "admin-eyebrow" }, toDisplayString(unref(editing) ? `Compte no ${unref(selectedId)}` : "Nouveau compte"), 1),
                              createVNode("h2", null, toDisplayString(unref(editing) ? "Modifier l’admin" : "Créer un admin"), 1)
                            ]),
                            unref(editing) ? (openBlock(), createBlock("button", {
                              key: 0,
                              class: "admin-button admin-button--danger admin-button--small",
                              type: "button",
                              disabled: unref(deleting) || unref(selectedId) === unref(sessionUser)?.id,
                              onClick: deleteUser
                            }, toDisplayString(unref(deleting) ? "Suppression…" : "Supprimer"), 9, ["disabled"])) : createCommentVNode("", true)
                          ]),
                          createVNode("div", { class: "admin-users__fields" }, [
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Prénom *"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(draft).prenom = $event,
                                required: "",
                                maxlength: "255"
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelText, unref(draft).prenom]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Nom *"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(draft).nom = $event,
                                required: "",
                                maxlength: "255"
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelText, unref(draft).nom]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Adresse e-mail *"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(draft).email = $event,
                                required: "",
                                type: "email",
                                maxlength: "254"
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelText, unref(draft).email]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Nom d’utilisateur *"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(draft).username = $event,
                                required: "",
                                maxlength: "255",
                                autocomplete: "off"
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelText, unref(draft).username]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, toDisplayString(unref(editing) ? "Nouveau mot de passe" : "Mot de passe *"), 1),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(draft).password = $event,
                                type: "password",
                                required: !unref(editing),
                                minlength: "10",
                                maxlength: "200",
                                autocomplete: "new-password"
                              }, null, 8, ["onUpdate:modelValue", "required"]), [
                                [vModelText, unref(draft).password]
                              ]),
                              createVNode("small", null, toDisplayString(unref(editing) ? "Laissez vide pour le conserver." : "10 caractères minimum."), 1)
                            ])
                          ]),
                          createVNode("div", { class: "admin-users__actions" }, [
                            createVNode("button", {
                              class: "admin-button",
                              type: "button",
                              onClick: resetDraft
                            }, "Annuler"),
                            createVNode("button", {
                              class: "admin-button admin-button--primary",
                              disabled: unref(saving)
                            }, toDisplayString(unref(saving) ? "Enregistrement…" : unref(editing) ? "Enregistrer" : "Créer le compte"), 9, ["disabled"])
                          ])
                        ], 32)
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
                  createVNode("div", { class: "admin-users" }, [
                    createVNode("header", { class: "admin-section-heading" }, [
                      createVNode("div", null, [
                        createVNode("p", { class: "admin-eyebrow" }, "Accès"),
                        createVNode("h1", null, "Admins"),
                        createVNode("p", { class: "admin-muted" }, "Créez et gérez les comptes qui peuvent accéder à l’administration.")
                      ]),
                      createVNode("button", {
                        class: "admin-button admin-button--primary",
                        type: "button",
                        onClick: resetDraft
                      }, "Nouvel admin")
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
                    createVNode("div", { class: "admin-users__workspace" }, [
                      createVNode("section", {
                        class: "admin-users__list admin-card",
                        "aria-labelledby": "users-list-title"
                      }, [
                        createVNode("header", null, [
                          createVNode("h2", { id: "users-list-title" }, toDisplayString(unref(users).length) + " comptes", 1),
                          createVNode("button", {
                            class: "admin-button admin-button--small",
                            disabled: unref(loading),
                            onClick: ($event) => loadUsers()
                          }, "Actualiser", 8, ["disabled", "onClick"])
                        ]),
                        unref(loading) ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "admin-users__loading"
                        }, [
                          createVNode("span", {
                            class: "admin-spinner",
                            "aria-hidden": "true"
                          }),
                          createTextVNode(" Chargement…")
                        ])) : (openBlock(true), createBlock(Fragment, { key: 1 }, renderList(unref(users), (managed) => {
                          return openBlock(), createBlock("button", {
                            key: managed.id,
                            class: ["admin-users__item", { "is-selected": managed.id === unref(selectedId) }],
                            type: "button",
                            onClick: ($event) => editUser(managed)
                          }, [
                            createVNode("span", {
                              class: "admin-users__avatar",
                              "aria-hidden": "true"
                            }, toDisplayString((managed.prenom[0] || managed.username[0] || "?").toLocaleUpperCase("fr")), 1),
                            createVNode("span", null, [
                              createVNode("strong", null, toDisplayString(managed.prenom) + " " + toDisplayString(managed.nom), 1),
                              createVNode("small", null, toDisplayString(managed.email), 1)
                            ]),
                            createVNode("em", null, "Admin")
                          ], 10, ["onClick"]);
                        }), 128))
                      ]),
                      createVNode("form", {
                        class: "admin-users__form admin-card",
                        onSubmit: withModifiers(saveUser, ["prevent"])
                      }, [
                        createVNode("div", { class: "admin-users__form-heading" }, [
                          createVNode("div", null, [
                            createVNode("p", { class: "admin-eyebrow" }, toDisplayString(unref(editing) ? `Compte no ${unref(selectedId)}` : "Nouveau compte"), 1),
                            createVNode("h2", null, toDisplayString(unref(editing) ? "Modifier l’admin" : "Créer un admin"), 1)
                          ]),
                          unref(editing) ? (openBlock(), createBlock("button", {
                            key: 0,
                            class: "admin-button admin-button--danger admin-button--small",
                            type: "button",
                            disabled: unref(deleting) || unref(selectedId) === unref(sessionUser)?.id,
                            onClick: deleteUser
                          }, toDisplayString(unref(deleting) ? "Suppression…" : "Supprimer"), 9, ["disabled"])) : createCommentVNode("", true)
                        ]),
                        createVNode("div", { class: "admin-users__fields" }, [
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Prénom *"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(draft).prenom = $event,
                              required: "",
                              maxlength: "255"
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [vModelText, unref(draft).prenom]
                            ])
                          ]),
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Nom *"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(draft).nom = $event,
                              required: "",
                              maxlength: "255"
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [vModelText, unref(draft).nom]
                            ])
                          ]),
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Adresse e-mail *"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(draft).email = $event,
                              required: "",
                              type: "email",
                              maxlength: "254"
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [vModelText, unref(draft).email]
                            ])
                          ]),
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Nom d’utilisateur *"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(draft).username = $event,
                              required: "",
                              maxlength: "255",
                              autocomplete: "off"
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [vModelText, unref(draft).username]
                            ])
                          ]),
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, toDisplayString(unref(editing) ? "Nouveau mot de passe" : "Mot de passe *"), 1),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(draft).password = $event,
                              type: "password",
                              required: !unref(editing),
                              minlength: "10",
                              maxlength: "200",
                              autocomplete: "new-password"
                            }, null, 8, ["onUpdate:modelValue", "required"]), [
                              [vModelText, unref(draft).password]
                            ]),
                            createVNode("small", null, toDisplayString(unref(editing) ? "Laissez vide pour le conserver." : "10 caractères minimum."), 1)
                          ])
                        ]),
                        createVNode("div", { class: "admin-users__actions" }, [
                          createVNode("button", {
                            class: "admin-button",
                            type: "button",
                            onClick: resetDraft
                          }, "Annuler"),
                          createVNode("button", {
                            class: "admin-button admin-button--primary",
                            disabled: unref(saving)
                          }, toDisplayString(unref(saving) ? "Enregistrement…" : unref(editing) ? "Enregistrer" : "Créer le compte"), 9, ["disabled"])
                        ])
                      ], 32)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/admins.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const admins = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-29627520"]]);

export { admins as default };
//# sourceMappingURL=admins-Cz6ztPpF.mjs.map
