import { u as useAdminAuth, _ as __nuxt_component_0, a as __nuxt_component_1, g as getAdminErrorMessage } from './AdminShell-Vsqkwhjy.mjs';
import { defineComponent, ref, computed, watch, withCtx, unref, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, createTextVNode, Fragment, renderList, useSSRContext } from 'vue';
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
import 'node:fs/promises';
import 'node:url';
import './state-DjsguMyT.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "errors",
  __ssrInlineRender: true,
  setup(__props) {
    const { user, handleUnauthorized } = useAdminAuth();
    const errors2 = ref([]);
    const selectedId = ref(null);
    const loading = ref(false);
    const saving = ref(false);
    const copying = ref(false);
    const deletingTreated = ref(false);
    const errorMessage = ref("");
    const success = ref("");
    let loaded = false;
    useHead({ title: "Erreurs — Administration" });
    const selectedError = computed(() => errors2.value.find((item) => item.id === selectedId.value) || errors2.value[0] || null);
    const untreatedErrors = computed(() => errors2.value.filter((item) => item.validationStatus === "unvalidated" && item.moderationStatus === "active"));
    const treatedErrors = computed(() => errors2.value.filter((item) => item.validationStatus === "validated"));
    function formatDate(value) {
      if (!value) return "—";
      return new Intl.DateTimeFormat("fr-CH", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
    }
    function contextLabel(item) {
      return [item.person, item.verb, item.tense, item.mode].filter(Boolean).join(" · ") || `Erreur #${item.id}`;
    }
    function stringify(value) {
      return JSON.stringify(value, null, 2);
    }
    async function loadErrors(keepSelection = true) {
      loading.value = true;
      errorMessage.value = "";
      try {
        const response = await $fetch("/api/admin/coach-help-feedbacks", {
          credentials: "same-origin",
          query: { origin: "automatic", limit: 500 }
        });
        errors2.value = response.feedbacks;
        if (keepSelection && selectedId.value && errors2.value.some((item) => item.id === selectedId.value)) return;
        selectedId.value = errors2.value[0]?.id || null;
      } catch (caught) {
        if (!handleUnauthorized(caught)) errorMessage.value = getAdminErrorMessage(caught, "Impossible de charger les erreurs automatiques.");
      } finally {
        loading.value = false;
      }
    }
    async function updateError(action) {
      const selected = selectedError.value;
      if (!selected || saving.value) return;
      let note = null;
      if (action === "remove") {
        note = (void 0).prompt("Raison du retrait ?", "Erreur sans valeur exploitable")?.trim() || "";
        if (!note) return;
      }
      saving.value = true;
      errorMessage.value = "";
      success.value = "";
      try {
        await $fetch(`/api/admin/coach-help-feedbacks/${selected.id}`, {
          method: "PUT",
          credentials: "same-origin",
          body: { action, note }
        });
        await loadErrors(true);
        success.value = action === "validate" ? "Erreur marquée comme traitée." : action === "unvalidate" ? "Erreur remise dans les éléments non traités." : action === "remove" ? "Erreur retirée." : "Erreur restaurée.";
      } catch (caught) {
        if (!handleUnauthorized(caught)) errorMessage.value = getAdminErrorMessage(caught, "Impossible de traiter cette erreur.");
      } finally {
        saving.value = false;
      }
    }
    async function copyUntreatedErrors() {
      if (copying.value) return;
      copying.value = true;
      errorMessage.value = "";
      success.value = "";
      try {
        const response = await $fetch("/api/admin/coach-help-errors/export", {
          credentials: "same-origin"
        });
        if (!response.prompt) {
          success.value = "Aucune erreur non traitée à copier.";
          return;
        }
        await (void 0).clipboard.writeText(response.prompt);
        success.value = `${response.count} erreur${response.count > 1 ? "s" : ""} non traitée${response.count > 1 ? "s" : ""} copiée${response.count > 1 ? "s" : ""}.`;
      } catch (caught) {
        if (!handleUnauthorized(caught)) errorMessage.value = getAdminErrorMessage(caught, "Impossible de copier les erreurs.");
      } finally {
        copying.value = false;
      }
    }
    async function deleteTreatedErrors() {
      const count = treatedErrors.value.length;
      if (!count || deletingTreated.value) return;
      const label = `${count} erreur${count > 1 ? "s" : ""} traitée${count > 1 ? "s" : ""}`;
      if (!(void 0).confirm(`Supprimer définitivement ${label} ?

Cette action est irréversible.`)) return;
      deletingTreated.value = true;
      errorMessage.value = "";
      success.value = "";
      try {
        const response = await $fetch("/api/admin/coach-help-feedbacks/treated", {
          method: "DELETE",
          credentials: "same-origin",
          body: { origin: "automatic" }
        });
        selectedId.value = null;
        await loadErrors(false);
        success.value = `${response.count} erreur${response.count > 1 ? "s" : ""} traitée${response.count > 1 ? "s" : ""} supprimée${response.count > 1 ? "s" : ""}.`;
      } catch (caught) {
        if (!handleUnauthorized(caught)) errorMessage.value = getAdminErrorMessage(caught, "Impossible de supprimer les erreurs traitées.");
      } finally {
        deletingTreated.value = false;
      }
    }
    watch(user, (current) => {
      if (current && !loaded) {
        loaded = true;
        void loadErrors(false);
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
                  _push3(`<main class="error-admin" data-v-5f87a590${_scopeId2}><header class="admin-section-heading error-admin__heading" data-v-5f87a590${_scopeId2}><div data-v-5f87a590${_scopeId2}><p class="admin-eyebrow" data-v-5f87a590${_scopeId2}>Contrôle automatique des aides</p><h1 data-v-5f87a590${_scopeId2}>Erreurs</h1><p class="admin-muted" data-v-5f87a590${_scopeId2}>Incohérences relevées en comparant l’aide affichée avec la réponse officielle.</p></div><div class="error-admin__top-actions" data-v-5f87a590${_scopeId2}><button class="admin-button admin-button--danger" type="button"${ssrIncludeBooleanAttr(unref(deletingTreated) || !unref(treatedErrors).length) ? " disabled" : ""} data-v-5f87a590${_scopeId2}>${ssrInterpolate(unref(deletingTreated) ? "Suppression…" : `Supprimer les erreurs traitées (${unref(treatedErrors).length})`)}</button><button class="admin-button admin-button--primary" type="button"${ssrIncludeBooleanAttr(unref(copying)) ? " disabled" : ""} data-v-5f87a590${_scopeId2}>${ssrInterpolate(unref(copying) ? "Copie…" : "Copier toutes les erreurs non traitées")}</button><button class="admin-button admin-button--small" type="button"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} data-v-5f87a590${_scopeId2}>${ssrInterpolate(unref(loading) ? "Chargement…" : "Actualiser")}</button></div></header>`);
                  if (unref(errorMessage)) {
                    _push3(`<p class="admin-notice admin-notice--error" data-v-5f87a590${_scopeId2}>${ssrInterpolate(unref(errorMessage))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(success)) {
                    _push3(`<p class="admin-notice admin-notice--success" data-v-5f87a590${_scopeId2}>${ssrInterpolate(unref(success))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`<section class="error-admin__summary" data-v-5f87a590${_scopeId2}><span data-v-5f87a590${_scopeId2}><strong data-v-5f87a590${_scopeId2}>${ssrInterpolate(unref(errors2).length)}</strong> erreurs recensées</span><span data-v-5f87a590${_scopeId2}><strong data-v-5f87a590${_scopeId2}>${ssrInterpolate(unref(untreatedErrors).length)}</strong> non traitées</span><span data-v-5f87a590${_scopeId2}><strong data-v-5f87a590${_scopeId2}>${ssrInterpolate(unref(treatedErrors).length)}</strong> traitées</span></section><div class="error-admin__workspace" data-v-5f87a590${_scopeId2}><aside class="admin-card error-list" aria-label="Liste des erreurs automatiques" data-v-5f87a590${_scopeId2}>`);
                  if (unref(loading) && !unref(errors2).length) {
                    _push3(`<p class="error-empty" data-v-5f87a590${_scopeId2}>Chargement…</p>`);
                  } else if (!unref(errors2).length) {
                    _push3(`<p class="error-empty" data-v-5f87a590${_scopeId2}>Aucune erreur automatique enregistrée.</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`<!--[-->`);
                  ssrRenderList(unref(errors2), (item) => {
                    _push3(`<button type="button" class="${ssrRenderClass(["error-list__item", { "is-selected": item.id === unref(selectedError)?.id, "is-removed": item.moderationStatus === "removed" }])}" data-v-5f87a590${_scopeId2}><span data-v-5f87a590${_scopeId2}><strong data-v-5f87a590${_scopeId2}>${ssrInterpolate(item.errorCode || "Erreur automatique")}</strong><small data-v-5f87a590${_scopeId2}>${ssrInterpolate(formatDate(item.lastSeenAt || item.createdAt))}</small></span><span data-v-5f87a590${_scopeId2}><b data-v-5f87a590${_scopeId2}>${ssrInterpolate(contextLabel(item))}</b><small data-v-5f87a590${_scopeId2}>${ssrInterpolate(item.comment || "Sans diagnostic")}</small></span><span class="error-list__status" data-v-5f87a590${_scopeId2}><em data-v-5f87a590${_scopeId2}>${ssrInterpolate(item.occurrenceCount)}×</em><em class="${ssrRenderClass(item.validationStatus === "validated" ? "is-treated" : "is-untreated")}" data-v-5f87a590${_scopeId2}>${ssrInterpolate(item.validationStatus === "validated" ? "Traitée" : "Non traitée")}</em></span></button>`);
                  });
                  _push3(`<!--]--></aside>`);
                  if (unref(selectedError)) {
                    _push3(`<section class="error-detail" data-v-5f87a590${_scopeId2}><article class="admin-card error-panel" data-v-5f87a590${_scopeId2}><header data-v-5f87a590${_scopeId2}><div data-v-5f87a590${_scopeId2}><p class="admin-eyebrow" data-v-5f87a590${_scopeId2}>Erreur #${ssrInterpolate(unref(selectedError).id)}</p><h2 data-v-5f87a590${_scopeId2}>${ssrInterpolate(unref(selectedError).errorCode || "Erreur automatique")}</h2><p class="admin-muted" data-v-5f87a590${_scopeId2}>${ssrInterpolate(contextLabel(unref(selectedError)))}</p></div><div class="error-panel__actions" data-v-5f87a590${_scopeId2}>`);
                    if (unref(selectedError).validationStatus === "unvalidated") {
                      _push3(`<button class="admin-button admin-button--primary admin-button--small" type="button"${ssrIncludeBooleanAttr(unref(saving) || unref(selectedError).moderationStatus === "removed") ? " disabled" : ""} data-v-5f87a590${_scopeId2}>Marquer comme traitée</button>`);
                    } else {
                      _push3(`<button class="admin-button admin-button--small" type="button"${ssrIncludeBooleanAttr(unref(saving) || unref(selectedError).moderationStatus === "removed") ? " disabled" : ""} data-v-5f87a590${_scopeId2}>Remettre non traitée</button>`);
                    }
                    if (unref(selectedError).moderationStatus === "active") {
                      _push3(`<button class="admin-button admin-button--danger admin-button--small" type="button"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-5f87a590${_scopeId2}>Supprimer</button>`);
                    } else {
                      _push3(`<button class="admin-button admin-button--small" type="button"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-5f87a590${_scopeId2}>Restaurer</button>`);
                    }
                    _push3(`</div></header><p class="error-panel__diagnostic" data-v-5f87a590${_scopeId2}>${ssrInterpolate(unref(selectedError).comment)}</p><dl class="error-facts" data-v-5f87a590${_scopeId2}><div data-v-5f87a590${_scopeId2}><dt data-v-5f87a590${_scopeId2}>Occurrences</dt><dd data-v-5f87a590${_scopeId2}>${ssrInterpolate(unref(selectedError).occurrenceCount)}</dd></div><div data-v-5f87a590${_scopeId2}><dt data-v-5f87a590${_scopeId2}>Réponse officielle</dt><dd data-v-5f87a590${_scopeId2}>${ssrInterpolate(unref(selectedError).expectedAnswer || "—")}</dd></div><div data-v-5f87a590${_scopeId2}><dt data-v-5f87a590${_scopeId2}>Première détection</dt><dd data-v-5f87a590${_scopeId2}>${ssrInterpolate(formatDate(unref(selectedError).firstSeenAt || unref(selectedError).createdAt))}</dd></div><div data-v-5f87a590${_scopeId2}><dt data-v-5f87a590${_scopeId2}>Dernière détection</dt><dd data-v-5f87a590${_scopeId2}>${ssrInterpolate(formatDate(unref(selectedError).lastSeenAt || unref(selectedError).createdAt))}</dd></div><div data-v-5f87a590${_scopeId2}><dt data-v-5f87a590${_scopeId2}>Coach</dt><dd data-v-5f87a590${_scopeId2}>${ssrInterpolate(unref(selectedError).coachName || "—")}</dd></div><div data-v-5f87a590${_scopeId2}><dt data-v-5f87a590${_scopeId2}>Aide</dt><dd data-v-5f87a590${_scopeId2}>${ssrInterpolate(unref(selectedError).helpName || "—")}</dd></div></dl><details data-v-5f87a590${_scopeId2}><summary data-v-5f87a590${_scopeId2}>Question complète</summary><pre data-v-5f87a590${_scopeId2}>${ssrInterpolate(stringify(unref(selectedError).question))}</pre></details><details data-v-5f87a590${_scopeId2}><summary data-v-5f87a590${_scopeId2}>Contexte complet</summary><pre data-v-5f87a590${_scopeId2}>${ssrInterpolate(stringify(unref(selectedError).context))}</pre></details><details data-v-5f87a590${_scopeId2}><summary data-v-5f87a590${_scopeId2}>HTML de l’aide rejetée</summary><pre data-v-5f87a590${_scopeId2}>${ssrInterpolate(unref(selectedError).displayedHelpHtml || "Aucun HTML enregistré.")}</pre></details></article></section>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div></main>`);
                } else {
                  return [
                    createVNode("main", { class: "error-admin" }, [
                      createVNode("header", { class: "admin-section-heading error-admin__heading" }, [
                        createVNode("div", null, [
                          createVNode("p", { class: "admin-eyebrow" }, "Contrôle automatique des aides"),
                          createVNode("h1", null, "Erreurs"),
                          createVNode("p", { class: "admin-muted" }, "Incohérences relevées en comparant l’aide affichée avec la réponse officielle.")
                        ]),
                        createVNode("div", { class: "error-admin__top-actions" }, [
                          createVNode("button", {
                            class: "admin-button admin-button--danger",
                            type: "button",
                            disabled: unref(deletingTreated) || !unref(treatedErrors).length,
                            onClick: deleteTreatedErrors
                          }, toDisplayString(unref(deletingTreated) ? "Suppression…" : `Supprimer les erreurs traitées (${unref(treatedErrors).length})`), 9, ["disabled"]),
                          createVNode("button", {
                            class: "admin-button admin-button--primary",
                            type: "button",
                            disabled: unref(copying),
                            onClick: copyUntreatedErrors
                          }, toDisplayString(unref(copying) ? "Copie…" : "Copier toutes les erreurs non traitées"), 9, ["disabled"]),
                          createVNode("button", {
                            class: "admin-button admin-button--small",
                            type: "button",
                            disabled: unref(loading),
                            onClick: ($event) => loadErrors(true)
                          }, toDisplayString(unref(loading) ? "Chargement…" : "Actualiser"), 9, ["disabled", "onClick"])
                        ])
                      ]),
                      unref(errorMessage) ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "admin-notice admin-notice--error"
                      }, toDisplayString(unref(errorMessage)), 1)) : createCommentVNode("", true),
                      unref(success) ? (openBlock(), createBlock("p", {
                        key: 1,
                        class: "admin-notice admin-notice--success"
                      }, toDisplayString(unref(success)), 1)) : createCommentVNode("", true),
                      createVNode("section", { class: "error-admin__summary" }, [
                        createVNode("span", null, [
                          createVNode("strong", null, toDisplayString(unref(errors2).length), 1),
                          createTextVNode(" erreurs recensées")
                        ]),
                        createVNode("span", null, [
                          createVNode("strong", null, toDisplayString(unref(untreatedErrors).length), 1),
                          createTextVNode(" non traitées")
                        ]),
                        createVNode("span", null, [
                          createVNode("strong", null, toDisplayString(unref(treatedErrors).length), 1),
                          createTextVNode(" traitées")
                        ])
                      ]),
                      createVNode("div", { class: "error-admin__workspace" }, [
                        createVNode("aside", {
                          class: "admin-card error-list",
                          "aria-label": "Liste des erreurs automatiques"
                        }, [
                          unref(loading) && !unref(errors2).length ? (openBlock(), createBlock("p", {
                            key: 0,
                            class: "error-empty"
                          }, "Chargement…")) : !unref(errors2).length ? (openBlock(), createBlock("p", {
                            key: 1,
                            class: "error-empty"
                          }, "Aucune erreur automatique enregistrée.")) : createCommentVNode("", true),
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(errors2), (item) => {
                            return openBlock(), createBlock("button", {
                              key: item.id,
                              type: "button",
                              class: ["error-list__item", { "is-selected": item.id === unref(selectedError)?.id, "is-removed": item.moderationStatus === "removed" }],
                              onClick: ($event) => selectedId.value = item.id
                            }, [
                              createVNode("span", null, [
                                createVNode("strong", null, toDisplayString(item.errorCode || "Erreur automatique"), 1),
                                createVNode("small", null, toDisplayString(formatDate(item.lastSeenAt || item.createdAt)), 1)
                              ]),
                              createVNode("span", null, [
                                createVNode("b", null, toDisplayString(contextLabel(item)), 1),
                                createVNode("small", null, toDisplayString(item.comment || "Sans diagnostic"), 1)
                              ]),
                              createVNode("span", { class: "error-list__status" }, [
                                createVNode("em", null, toDisplayString(item.occurrenceCount) + "×", 1),
                                createVNode("em", {
                                  class: item.validationStatus === "validated" ? "is-treated" : "is-untreated"
                                }, toDisplayString(item.validationStatus === "validated" ? "Traitée" : "Non traitée"), 3)
                              ])
                            ], 10, ["onClick"]);
                          }), 128))
                        ]),
                        unref(selectedError) ? (openBlock(), createBlock("section", {
                          key: 0,
                          class: "error-detail"
                        }, [
                          createVNode("article", { class: "admin-card error-panel" }, [
                            createVNode("header", null, [
                              createVNode("div", null, [
                                createVNode("p", { class: "admin-eyebrow" }, "Erreur #" + toDisplayString(unref(selectedError).id), 1),
                                createVNode("h2", null, toDisplayString(unref(selectedError).errorCode || "Erreur automatique"), 1),
                                createVNode("p", { class: "admin-muted" }, toDisplayString(contextLabel(unref(selectedError))), 1)
                              ]),
                              createVNode("div", { class: "error-panel__actions" }, [
                                unref(selectedError).validationStatus === "unvalidated" ? (openBlock(), createBlock("button", {
                                  key: 0,
                                  class: "admin-button admin-button--primary admin-button--small",
                                  type: "button",
                                  disabled: unref(saving) || unref(selectedError).moderationStatus === "removed",
                                  onClick: ($event) => updateError("validate")
                                }, "Marquer comme traitée", 8, ["disabled", "onClick"])) : (openBlock(), createBlock("button", {
                                  key: 1,
                                  class: "admin-button admin-button--small",
                                  type: "button",
                                  disabled: unref(saving) || unref(selectedError).moderationStatus === "removed",
                                  onClick: ($event) => updateError("unvalidate")
                                }, "Remettre non traitée", 8, ["disabled", "onClick"])),
                                unref(selectedError).moderationStatus === "active" ? (openBlock(), createBlock("button", {
                                  key: 2,
                                  class: "admin-button admin-button--danger admin-button--small",
                                  type: "button",
                                  disabled: unref(saving),
                                  onClick: ($event) => updateError("remove")
                                }, "Supprimer", 8, ["disabled", "onClick"])) : (openBlock(), createBlock("button", {
                                  key: 3,
                                  class: "admin-button admin-button--small",
                                  type: "button",
                                  disabled: unref(saving),
                                  onClick: ($event) => updateError("restore")
                                }, "Restaurer", 8, ["disabled", "onClick"]))
                              ])
                            ]),
                            createVNode("p", { class: "error-panel__diagnostic" }, toDisplayString(unref(selectedError).comment), 1),
                            createVNode("dl", { class: "error-facts" }, [
                              createVNode("div", null, [
                                createVNode("dt", null, "Occurrences"),
                                createVNode("dd", null, toDisplayString(unref(selectedError).occurrenceCount), 1)
                              ]),
                              createVNode("div", null, [
                                createVNode("dt", null, "Réponse officielle"),
                                createVNode("dd", null, toDisplayString(unref(selectedError).expectedAnswer || "—"), 1)
                              ]),
                              createVNode("div", null, [
                                createVNode("dt", null, "Première détection"),
                                createVNode("dd", null, toDisplayString(formatDate(unref(selectedError).firstSeenAt || unref(selectedError).createdAt)), 1)
                              ]),
                              createVNode("div", null, [
                                createVNode("dt", null, "Dernière détection"),
                                createVNode("dd", null, toDisplayString(formatDate(unref(selectedError).lastSeenAt || unref(selectedError).createdAt)), 1)
                              ]),
                              createVNode("div", null, [
                                createVNode("dt", null, "Coach"),
                                createVNode("dd", null, toDisplayString(unref(selectedError).coachName || "—"), 1)
                              ]),
                              createVNode("div", null, [
                                createVNode("dt", null, "Aide"),
                                createVNode("dd", null, toDisplayString(unref(selectedError).helpName || "—"), 1)
                              ])
                            ]),
                            createVNode("details", null, [
                              createVNode("summary", null, "Question complète"),
                              createVNode("pre", null, toDisplayString(stringify(unref(selectedError).question)), 1)
                            ]),
                            createVNode("details", null, [
                              createVNode("summary", null, "Contexte complet"),
                              createVNode("pre", null, toDisplayString(stringify(unref(selectedError).context)), 1)
                            ]),
                            createVNode("details", null, [
                              createVNode("summary", null, "HTML de l’aide rejetée"),
                              createVNode("pre", null, toDisplayString(unref(selectedError).displayedHelpHtml || "Aucun HTML enregistré."), 1)
                            ])
                          ])
                        ])) : createCommentVNode("", true)
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
                  createVNode("main", { class: "error-admin" }, [
                    createVNode("header", { class: "admin-section-heading error-admin__heading" }, [
                      createVNode("div", null, [
                        createVNode("p", { class: "admin-eyebrow" }, "Contrôle automatique des aides"),
                        createVNode("h1", null, "Erreurs"),
                        createVNode("p", { class: "admin-muted" }, "Incohérences relevées en comparant l’aide affichée avec la réponse officielle.")
                      ]),
                      createVNode("div", { class: "error-admin__top-actions" }, [
                        createVNode("button", {
                          class: "admin-button admin-button--danger",
                          type: "button",
                          disabled: unref(deletingTreated) || !unref(treatedErrors).length,
                          onClick: deleteTreatedErrors
                        }, toDisplayString(unref(deletingTreated) ? "Suppression…" : `Supprimer les erreurs traitées (${unref(treatedErrors).length})`), 9, ["disabled"]),
                        createVNode("button", {
                          class: "admin-button admin-button--primary",
                          type: "button",
                          disabled: unref(copying),
                          onClick: copyUntreatedErrors
                        }, toDisplayString(unref(copying) ? "Copie…" : "Copier toutes les erreurs non traitées"), 9, ["disabled"]),
                        createVNode("button", {
                          class: "admin-button admin-button--small",
                          type: "button",
                          disabled: unref(loading),
                          onClick: ($event) => loadErrors(true)
                        }, toDisplayString(unref(loading) ? "Chargement…" : "Actualiser"), 9, ["disabled", "onClick"])
                      ])
                    ]),
                    unref(errorMessage) ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "admin-notice admin-notice--error"
                    }, toDisplayString(unref(errorMessage)), 1)) : createCommentVNode("", true),
                    unref(success) ? (openBlock(), createBlock("p", {
                      key: 1,
                      class: "admin-notice admin-notice--success"
                    }, toDisplayString(unref(success)), 1)) : createCommentVNode("", true),
                    createVNode("section", { class: "error-admin__summary" }, [
                      createVNode("span", null, [
                        createVNode("strong", null, toDisplayString(unref(errors2).length), 1),
                        createTextVNode(" erreurs recensées")
                      ]),
                      createVNode("span", null, [
                        createVNode("strong", null, toDisplayString(unref(untreatedErrors).length), 1),
                        createTextVNode(" non traitées")
                      ]),
                      createVNode("span", null, [
                        createVNode("strong", null, toDisplayString(unref(treatedErrors).length), 1),
                        createTextVNode(" traitées")
                      ])
                    ]),
                    createVNode("div", { class: "error-admin__workspace" }, [
                      createVNode("aside", {
                        class: "admin-card error-list",
                        "aria-label": "Liste des erreurs automatiques"
                      }, [
                        unref(loading) && !unref(errors2).length ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "error-empty"
                        }, "Chargement…")) : !unref(errors2).length ? (openBlock(), createBlock("p", {
                          key: 1,
                          class: "error-empty"
                        }, "Aucune erreur automatique enregistrée.")) : createCommentVNode("", true),
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(errors2), (item) => {
                          return openBlock(), createBlock("button", {
                            key: item.id,
                            type: "button",
                            class: ["error-list__item", { "is-selected": item.id === unref(selectedError)?.id, "is-removed": item.moderationStatus === "removed" }],
                            onClick: ($event) => selectedId.value = item.id
                          }, [
                            createVNode("span", null, [
                              createVNode("strong", null, toDisplayString(item.errorCode || "Erreur automatique"), 1),
                              createVNode("small", null, toDisplayString(formatDate(item.lastSeenAt || item.createdAt)), 1)
                            ]),
                            createVNode("span", null, [
                              createVNode("b", null, toDisplayString(contextLabel(item)), 1),
                              createVNode("small", null, toDisplayString(item.comment || "Sans diagnostic"), 1)
                            ]),
                            createVNode("span", { class: "error-list__status" }, [
                              createVNode("em", null, toDisplayString(item.occurrenceCount) + "×", 1),
                              createVNode("em", {
                                class: item.validationStatus === "validated" ? "is-treated" : "is-untreated"
                              }, toDisplayString(item.validationStatus === "validated" ? "Traitée" : "Non traitée"), 3)
                            ])
                          ], 10, ["onClick"]);
                        }), 128))
                      ]),
                      unref(selectedError) ? (openBlock(), createBlock("section", {
                        key: 0,
                        class: "error-detail"
                      }, [
                        createVNode("article", { class: "admin-card error-panel" }, [
                          createVNode("header", null, [
                            createVNode("div", null, [
                              createVNode("p", { class: "admin-eyebrow" }, "Erreur #" + toDisplayString(unref(selectedError).id), 1),
                              createVNode("h2", null, toDisplayString(unref(selectedError).errorCode || "Erreur automatique"), 1),
                              createVNode("p", { class: "admin-muted" }, toDisplayString(contextLabel(unref(selectedError))), 1)
                            ]),
                            createVNode("div", { class: "error-panel__actions" }, [
                              unref(selectedError).validationStatus === "unvalidated" ? (openBlock(), createBlock("button", {
                                key: 0,
                                class: "admin-button admin-button--primary admin-button--small",
                                type: "button",
                                disabled: unref(saving) || unref(selectedError).moderationStatus === "removed",
                                onClick: ($event) => updateError("validate")
                              }, "Marquer comme traitée", 8, ["disabled", "onClick"])) : (openBlock(), createBlock("button", {
                                key: 1,
                                class: "admin-button admin-button--small",
                                type: "button",
                                disabled: unref(saving) || unref(selectedError).moderationStatus === "removed",
                                onClick: ($event) => updateError("unvalidate")
                              }, "Remettre non traitée", 8, ["disabled", "onClick"])),
                              unref(selectedError).moderationStatus === "active" ? (openBlock(), createBlock("button", {
                                key: 2,
                                class: "admin-button admin-button--danger admin-button--small",
                                type: "button",
                                disabled: unref(saving),
                                onClick: ($event) => updateError("remove")
                              }, "Supprimer", 8, ["disabled", "onClick"])) : (openBlock(), createBlock("button", {
                                key: 3,
                                class: "admin-button admin-button--small",
                                type: "button",
                                disabled: unref(saving),
                                onClick: ($event) => updateError("restore")
                              }, "Restaurer", 8, ["disabled", "onClick"]))
                            ])
                          ]),
                          createVNode("p", { class: "error-panel__diagnostic" }, toDisplayString(unref(selectedError).comment), 1),
                          createVNode("dl", { class: "error-facts" }, [
                            createVNode("div", null, [
                              createVNode("dt", null, "Occurrences"),
                              createVNode("dd", null, toDisplayString(unref(selectedError).occurrenceCount), 1)
                            ]),
                            createVNode("div", null, [
                              createVNode("dt", null, "Réponse officielle"),
                              createVNode("dd", null, toDisplayString(unref(selectedError).expectedAnswer || "—"), 1)
                            ]),
                            createVNode("div", null, [
                              createVNode("dt", null, "Première détection"),
                              createVNode("dd", null, toDisplayString(formatDate(unref(selectedError).firstSeenAt || unref(selectedError).createdAt)), 1)
                            ]),
                            createVNode("div", null, [
                              createVNode("dt", null, "Dernière détection"),
                              createVNode("dd", null, toDisplayString(formatDate(unref(selectedError).lastSeenAt || unref(selectedError).createdAt)), 1)
                            ]),
                            createVNode("div", null, [
                              createVNode("dt", null, "Coach"),
                              createVNode("dd", null, toDisplayString(unref(selectedError).coachName || "—"), 1)
                            ]),
                            createVNode("div", null, [
                              createVNode("dt", null, "Aide"),
                              createVNode("dd", null, toDisplayString(unref(selectedError).helpName || "—"), 1)
                            ])
                          ]),
                          createVNode("details", null, [
                            createVNode("summary", null, "Question complète"),
                            createVNode("pre", null, toDisplayString(stringify(unref(selectedError).question)), 1)
                          ]),
                          createVNode("details", null, [
                            createVNode("summary", null, "Contexte complet"),
                            createVNode("pre", null, toDisplayString(stringify(unref(selectedError).context)), 1)
                          ]),
                          createVNode("details", null, [
                            createVNode("summary", null, "HTML de l’aide rejetée"),
                            createVNode("pre", null, toDisplayString(unref(selectedError).displayedHelpHtml || "Aucun HTML enregistré."), 1)
                          ])
                        ])
                      ])) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/errors.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const errors = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-5f87a590"]]);

export { errors as default };
//# sourceMappingURL=errors-kF8V85j3.mjs.map
