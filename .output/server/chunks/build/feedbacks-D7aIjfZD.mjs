import { _ as __nuxt_component_0, a as __nuxt_component_1 } from './AdminShell-Uralqobm.mjs';
import { _ as __nuxt_component_0$1 } from './CoachHelpPanel-BQHM-KrB.mjs';
import { defineComponent, ref, computed, watch, withCtx, unref, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, createTextVNode, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { u as useAdminAuth, g as getAdminErrorMessage } from './useAdminAuth-BdfYT3Lh.mjs';
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
import '@fortawesome/free-solid-svg-icons';
import '@fortawesome/vue-fontawesome';
import '../_/coach.mjs';
import '../_/coach-help-audit.mjs';
import '../_/near-future.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "feedbacks",
  __ssrInlineRender: true,
  setup(__props) {
    const { user, handleUnauthorized } = useAdminAuth();
    const feedbacks2 = ref([]);
    const totalCount = ref(0);
    const selectedId = ref(null);
    const loading = ref(false);
    const copying = ref(false);
    const deletingAll = ref(false);
    const error = ref("");
    const success = ref("");
    let loaded = false;
    useHead({ title: "Feedbacks — Administration" });
    const visibleFeedbacks = computed(() => [...feedbacks2.value].sort((left, right) => {
      const dateDifference = new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      return dateDifference || right.id - left.id;
    }));
    const selectedFeedback = computed(() => visibleFeedbacks.value.find((item) => item.id === selectedId.value) || visibleFeedbacks.value[0] || null);
    const selectedQuestion = computed(() => selectedFeedback.value?.question || selectedFeedback.value?.context?.currentQuestion || null);
    const selectedMessages = computed(() => selectedFeedback.value?.messages || []);
    const selectedAttempts = computed(() => selectedFeedback.value?.attempts || []);
    const selectedAnswer = computed(() => {
      const selected = selectedFeedback.value;
      if (!selected) return "";
      const question = selectedQuestion.value;
      const questionId = question?.id;
      const matchingAttempt = [...selectedAttempts.value].reverse().find((attempt) => {
        const attemptQuestion = attempt.question;
        return questionId !== void 0 && attemptQuestion?.id === questionId;
      }) || selectedAttempts.value.at(-1);
      return String(matchingAttempt?.answer || selected.context?.currentAnswerDraft || "");
    });
    const selectedHelpBlocks = computed(() => {
      const blocks = selectedFeedback.value?.displayedHelp?.blocks || [];
      return blocks.map((block, index) => snapshotToHelpBlock(block, index)).filter(Boolean);
    });
    const selectedHelpValues = computed(() => selectedFeedback.value?.displayedHelp?.values || {});
    const selectedHelpTitle = computed(() => selectedFeedback.value?.displayedHelp?.header?.title || selectedFeedback.value?.helpName || "Aide");
    const selectedHelpDescription = computed(() => selectedFeedback.value?.displayedHelp?.header?.descriptionHtml || "");
    const feedbackLabels = {
      useful: "Utile",
      unclear: "Pas clair",
      error: "Erreur",
      remark: "Remarque"
    };
    function snapshotToHelpBlock(snapshot, index) {
      const type = typeof snapshot.type === "string" && ["normal", "info", "success", "warning", "danger"].includes(snapshot.type) ? snapshot.type : "normal";
      const children = Array.isArray(snapshot.children) ? snapshot.children.map((child, childIndex) => snapshotToHelpBlock(child, childIndex)).filter(Boolean) : [];
      return {
        id: Number(snapshot.id) || -1e5 - index,
        type,
        title: typeof snapshot.sourceTitle === "string" ? snapshot.sourceTitle : typeof snapshot.title === "string" ? snapshot.title : "",
        content: typeof snapshot.sourceContent === "string" ? snapshot.sourceContent : typeof snapshot.renderedHtml === "string" ? snapshot.renderedHtml : "",
        explanationApproach: typeof snapshot.explanationApproach === "string" && ["cif-falc", "concise", "grammatical-technical", "guided-discovery"].includes(snapshot.explanationApproach) ? snapshot.explanationApproach : "cif-falc",
        isActive: true,
        sortOrder: index + 1,
        children
      };
    }
    function formatDate(value) {
      if (!value) return "—";
      return new Intl.DateTimeFormat("fr-CH", {
        dateStyle: "short",
        timeStyle: "short"
      }).format(new Date(value));
    }
    function stringify(value) {
      return JSON.stringify(value, null, 2);
    }
    function questionLine(feedback) {
      return [feedback.person, feedback.verb, feedback.tense, feedback.mode].filter(Boolean).join(" · ") || `Feedback #${feedback.id}`;
    }
    async function loadFeedbacks(keepSelection = true) {
      loading.value = true;
      error.value = "";
      try {
        const response = await $fetch("/api/admin/coach-help-feedbacks", {
          credentials: "same-origin",
          query: { sort: "desc" }
        });
        feedbacks2.value = response.feedbacks;
        totalCount.value = response.totalCount;
        if (keepSelection && selectedId.value && visibleFeedbacks.value.some((item) => item.id === selectedId.value)) return;
        selectedId.value = visibleFeedbacks.value[0]?.id || null;
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible de charger les feedbacks.");
      } finally {
        loading.value = false;
      }
    }
    async function copyAllFeedbacks() {
      if (copying.value) return;
      copying.value = true;
      error.value = "";
      success.value = "";
      try {
        const response = await $fetch("/api/admin/coach-help-feedbacks/export", {
          credentials: "same-origin"
        });
        if (!response.prompt) {
          success.value = "Aucun feedback à copier.";
          return;
        }
        await (void 0).clipboard.writeText(response.prompt);
        success.value = `${response.count} feedback${response.count > 1 ? "s" : ""} copié${response.count > 1 ? "s" : ""} pour Codex.`;
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible de copier les feedbacks.");
      } finally {
        copying.value = false;
      }
    }
    async function deleteAllFeedbacks() {
      const count = totalCount.value;
      if (!count || deletingAll.value) return;
      const label = `${count} feedback${count > 1 ? "s" : ""}`;
      if (!(void 0).confirm(`Supprimer définitivement les ${label} ?

Tous les feedbacks utilisateurs seront effacés. Cette action est irréversible.`)) return;
      deletingAll.value = true;
      error.value = "";
      success.value = "";
      try {
        const response = await $fetch("/api/admin/coach-help-feedbacks/all", {
          method: "DELETE",
          credentials: "same-origin"
        });
        selectedId.value = null;
        await loadFeedbacks(false);
        success.value = `${response.count} feedback${response.count > 1 ? "s" : ""} supprimé${response.count > 1 ? "s" : ""}.`;
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible de supprimer tous les feedbacks.");
      } finally {
        deletingAll.value = false;
      }
    }
    watch(user, (current) => {
      if (current && !loaded) {
        loaded = true;
        void loadFeedbacks(false);
      }
      if (!current) loaded = false;
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminAuthBoundary = __nuxt_component_0;
      const _component_AdminShell = __nuxt_component_1;
      const _component_CoachHelpPanel = __nuxt_component_0$1;
      _push(ssrRenderComponent(_component_AdminAuthBoundary, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_AdminShell, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<main class="feedback-admin" data-v-c4495bab${_scopeId2}><header class="admin-section-heading feedback-admin__heading" data-v-c4495bab${_scopeId2}><div data-v-c4495bab${_scopeId2}><p class="admin-eyebrow" data-v-c4495bab${_scopeId2}>Retours utilisateurs</p><h1 data-v-c4495bab${_scopeId2}>Feedbacks</h1><p class="admin-muted" data-v-c4495bab${_scopeId2}>Tous les retours sur les aides automatiques, du plus récent au plus ancien.</p></div><div class="feedback-admin__top-actions" data-v-c4495bab${_scopeId2}><button class="admin-button admin-button--primary" type="button"${ssrIncludeBooleanAttr(unref(copying) || !unref(totalCount)) ? " disabled" : ""} data-v-c4495bab${_scopeId2}>${ssrInterpolate(unref(copying) ? "Copie…" : `Tout copier pour Codex (${unref(totalCount)})`)}</button><button class="admin-button admin-button--danger" type="button"${ssrIncludeBooleanAttr(unref(deletingAll) || !unref(totalCount)) ? " disabled" : ""} data-v-c4495bab${_scopeId2}>${ssrInterpolate(unref(deletingAll) ? "Suppression…" : `Tout supprimer (${unref(totalCount)})`)}</button><button class="admin-button admin-button--small" type="button"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} data-v-c4495bab${_scopeId2}>${ssrInterpolate(unref(loading) ? "Chargement…" : "Actualiser")}</button></div></header>`);
                  if (unref(error)) {
                    _push3(`<p class="admin-notice admin-notice--error" data-v-c4495bab${_scopeId2}>${ssrInterpolate(unref(error))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(success)) {
                    _push3(`<p class="admin-notice admin-notice--success" data-v-c4495bab${_scopeId2}>${ssrInterpolate(unref(success))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`<section class="feedback-admin__summary" data-v-c4495bab${_scopeId2}><span data-v-c4495bab${_scopeId2}><strong data-v-c4495bab${_scopeId2}>${ssrInterpolate(unref(totalCount))}</strong> feedbacks</span></section><div class="feedback-admin__workspace" data-v-c4495bab${_scopeId2}><aside class="admin-card feedback-list" aria-label="Liste des feedbacks" data-v-c4495bab${_scopeId2}>`);
                  if (unref(loading) && !unref(feedbacks2).length) {
                    _push3(`<p class="feedback-empty" data-v-c4495bab${_scopeId2}>Chargement…</p>`);
                  } else if (!unref(visibleFeedbacks).length) {
                    _push3(`<p class="feedback-empty" data-v-c4495bab${_scopeId2}>Aucun feedback à afficher.</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`<!--[-->`);
                  ssrRenderList(unref(visibleFeedbacks), (feedback) => {
                    _push3(`<button type="button" class="${ssrRenderClass(["feedback-list__item", { "is-selected": feedback.id === unref(selectedFeedback)?.id }])}" data-v-c4495bab${_scopeId2}><span data-v-c4495bab${_scopeId2}><strong data-v-c4495bab${_scopeId2}>${ssrInterpolate(feedbackLabels[feedback.feedbackType])}</strong><small data-v-c4495bab${_scopeId2}>${ssrInterpolate(formatDate(feedback.createdAt))}</small></span><span data-v-c4495bab${_scopeId2}><b data-v-c4495bab${_scopeId2}>${ssrInterpolate(questionLine(feedback))}</b><small data-v-c4495bab${_scopeId2}>${ssrInterpolate(feedback.comment || "Sans commentaire")}</small></span></button>`);
                  });
                  _push3(`<!--]--></aside>`);
                  if (unref(selectedFeedback)) {
                    _push3(`<section class="feedback-detail" data-v-c4495bab${_scopeId2}><article class="admin-card feedback-panel" data-v-c4495bab${_scopeId2}><header class="feedback-panel__header" data-v-c4495bab${_scopeId2}><div data-v-c4495bab${_scopeId2}><p class="admin-eyebrow" data-v-c4495bab${_scopeId2}>Feedback #${ssrInterpolate(unref(selectedFeedback).id)}</p><h2 data-v-c4495bab${_scopeId2}>${ssrInterpolate(feedbackLabels[unref(selectedFeedback).feedbackType])} · ${ssrInterpolate(questionLine(unref(selectedFeedback)))}</h2><p class="admin-muted" data-v-c4495bab${_scopeId2}>${ssrInterpolate(formatDate(unref(selectedFeedback).createdAt))} · ${ssrInterpolate(unref(selectedFeedback).coachName || "coach inconnu")} · ${ssrInterpolate(unref(selectedFeedback).helpName || "aide inconnue")}</p></div></header><dl class="feedback-facts" data-v-c4495bab${_scopeId2}><div data-v-c4495bab${_scopeId2}><dt data-v-c4495bab${_scopeId2}>Question</dt><dd data-v-c4495bab${_scopeId2}>${ssrInterpolate(unref(selectedFeedback).questionNumber ?? "—")}</dd></div><div data-v-c4495bab${_scopeId2}><dt data-v-c4495bab${_scopeId2}>Session</dt><dd data-v-c4495bab${_scopeId2}>${ssrInterpolate(unref(selectedFeedback).sessionId || "—")}</dd></div></dl><section class="feedback-section" data-v-c4495bab${_scopeId2}><h3 data-v-c4495bab${_scopeId2}>Commentaire du feedback</h3><p class="feedback-comment" data-v-c4495bab${_scopeId2}>${ssrInterpolate(unref(selectedFeedback).comment || "Aucun commentaire.")}</p></section><section class="feedback-section" data-v-c4495bab${_scopeId2}><h3 data-v-c4495bab${_scopeId2}>Question demandée</h3><dl class="feedback-question" data-v-c4495bab${_scopeId2}><div data-v-c4495bab${_scopeId2}><dt data-v-c4495bab${_scopeId2}>Personne</dt><dd data-v-c4495bab${_scopeId2}>${ssrInterpolate(unref(selectedFeedback).person || "—")}</dd></div><div data-v-c4495bab${_scopeId2}><dt data-v-c4495bab${_scopeId2}>Verbe</dt><dd data-v-c4495bab${_scopeId2}>${ssrInterpolate(unref(selectedFeedback).verb || "—")}</dd></div><div data-v-c4495bab${_scopeId2}><dt data-v-c4495bab${_scopeId2}>Temps</dt><dd data-v-c4495bab${_scopeId2}>${ssrInterpolate(unref(selectedFeedback).tense || "—")}</dd></div><div data-v-c4495bab${_scopeId2}><dt data-v-c4495bab${_scopeId2}>Mode</dt><dd data-v-c4495bab${_scopeId2}>${ssrInterpolate(unref(selectedFeedback).mode || "—")}</dd></div><div data-v-c4495bab${_scopeId2}><dt data-v-c4495bab${_scopeId2}>Réponse attendue</dt><dd data-v-c4495bab${_scopeId2}>${ssrInterpolate(unref(selectedFeedback).expectedAnswer || "—")}</dd></div><div data-v-c4495bab${_scopeId2}><dt data-v-c4495bab${_scopeId2}>Réponse fournie</dt><dd data-v-c4495bab${_scopeId2}>${ssrInterpolate(unref(selectedAnswer) || "Aucune réponse donnée avant le feedback.")}</dd></div></dl><details data-v-c4495bab${_scopeId2}><summary data-v-c4495bab${_scopeId2}>Objet question complet</summary><pre data-v-c4495bab${_scopeId2}>${ssrInterpolate(stringify(unref(selectedQuestion)))}</pre></details></section><section class="feedback-section" data-v-c4495bab${_scopeId2}><h3 data-v-c4495bab${_scopeId2}>Messages du chat au moment du feedback</h3>`);
                    if (unref(selectedMessages).length) {
                      _push3(`<ol class="feedback-messages" data-v-c4495bab${_scopeId2}><!--[-->`);
                      ssrRenderList(unref(selectedMessages), (message) => {
                        _push3(`<li data-v-c4495bab${_scopeId2}><strong data-v-c4495bab${_scopeId2}>${ssrInterpolate(message.author === "coach" ? "Coach" : "Utilisateur")}</strong><span data-v-c4495bab${_scopeId2}>${ssrInterpolate(message.text || "[média]")}</span></li>`);
                      });
                      _push3(`<!--]--></ol>`);
                    } else {
                      _push3(`<p class="admin-muted" data-v-c4495bab${_scopeId2}>Aucun message capturé.</p>`);
                    }
                    _push3(`</section></article><article class="admin-card feedback-help-preview" data-v-c4495bab${_scopeId2}><header data-v-c4495bab${_scopeId2}><div data-v-c4495bab${_scopeId2}><p class="admin-eyebrow" data-v-c4495bab${_scopeId2}>Aide fournie</p><h2 data-v-c4495bab${_scopeId2}>Composant affiché à l’utilisateur</h2></div></header>`);
                    if (unref(selectedHelpBlocks).length) {
                      _push3(ssrRenderComponent(_component_CoachHelpPanel, {
                        embedded: "",
                        "show-close": false,
                        "show-feedback": false,
                        "include-automatic-orthography": false,
                        blocks: unref(selectedHelpBlocks),
                        values: unref(selectedHelpValues),
                        "header-title": unref(selectedHelpTitle),
                        "header-description": unref(selectedHelpDescription),
                        "question-number": unref(selectedFeedback).questionNumber || 1,
                        "coach-color": "#176b87"
                      }, null, _parent3, _scopeId2));
                    } else {
                      _push3(`<p class="feedback-empty" data-v-c4495bab${_scopeId2}>Aucun composant d’aide capturé pour ce feedback.</p>`);
                    }
                    _push3(`</article><article class="admin-card feedback-raw" data-v-c4495bab${_scopeId2}><details data-v-c4495bab${_scopeId2}><summary data-v-c4495bab${_scopeId2}>Données complètes enregistrées</summary><pre data-v-c4495bab${_scopeId2}>${ssrInterpolate(stringify(unref(selectedFeedback)))}</pre></details></article></section>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div></main>`);
                } else {
                  return [
                    createVNode("main", { class: "feedback-admin" }, [
                      createVNode("header", { class: "admin-section-heading feedback-admin__heading" }, [
                        createVNode("div", null, [
                          createVNode("p", { class: "admin-eyebrow" }, "Retours utilisateurs"),
                          createVNode("h1", null, "Feedbacks"),
                          createVNode("p", { class: "admin-muted" }, "Tous les retours sur les aides automatiques, du plus récent au plus ancien.")
                        ]),
                        createVNode("div", { class: "feedback-admin__top-actions" }, [
                          createVNode("button", {
                            class: "admin-button admin-button--primary",
                            type: "button",
                            disabled: unref(copying) || !unref(totalCount),
                            onClick: copyAllFeedbacks
                          }, toDisplayString(unref(copying) ? "Copie…" : `Tout copier pour Codex (${unref(totalCount)})`), 9, ["disabled"]),
                          createVNode("button", {
                            class: "admin-button admin-button--danger",
                            type: "button",
                            disabled: unref(deletingAll) || !unref(totalCount),
                            onClick: deleteAllFeedbacks
                          }, toDisplayString(unref(deletingAll) ? "Suppression…" : `Tout supprimer (${unref(totalCount)})`), 9, ["disabled"]),
                          createVNode("button", {
                            class: "admin-button admin-button--small",
                            type: "button",
                            disabled: unref(loading),
                            onClick: ($event) => loadFeedbacks(true)
                          }, toDisplayString(unref(loading) ? "Chargement…" : "Actualiser"), 9, ["disabled", "onClick"])
                        ])
                      ]),
                      unref(error) ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "admin-notice admin-notice--error"
                      }, toDisplayString(unref(error)), 1)) : createCommentVNode("", true),
                      unref(success) ? (openBlock(), createBlock("p", {
                        key: 1,
                        class: "admin-notice admin-notice--success"
                      }, toDisplayString(unref(success)), 1)) : createCommentVNode("", true),
                      createVNode("section", { class: "feedback-admin__summary" }, [
                        createVNode("span", null, [
                          createVNode("strong", null, toDisplayString(unref(totalCount)), 1),
                          createTextVNode(" feedbacks")
                        ])
                      ]),
                      createVNode("div", { class: "feedback-admin__workspace" }, [
                        createVNode("aside", {
                          class: "admin-card feedback-list",
                          "aria-label": "Liste des feedbacks"
                        }, [
                          unref(loading) && !unref(feedbacks2).length ? (openBlock(), createBlock("p", {
                            key: 0,
                            class: "feedback-empty"
                          }, "Chargement…")) : !unref(visibleFeedbacks).length ? (openBlock(), createBlock("p", {
                            key: 1,
                            class: "feedback-empty"
                          }, "Aucun feedback à afficher.")) : createCommentVNode("", true),
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(visibleFeedbacks), (feedback) => {
                            return openBlock(), createBlock("button", {
                              key: feedback.id,
                              type: "button",
                              class: ["feedback-list__item", { "is-selected": feedback.id === unref(selectedFeedback)?.id }],
                              onClick: ($event) => selectedId.value = feedback.id
                            }, [
                              createVNode("span", null, [
                                createVNode("strong", null, toDisplayString(feedbackLabels[feedback.feedbackType]), 1),
                                createVNode("small", null, toDisplayString(formatDate(feedback.createdAt)), 1)
                              ]),
                              createVNode("span", null, [
                                createVNode("b", null, toDisplayString(questionLine(feedback)), 1),
                                createVNode("small", null, toDisplayString(feedback.comment || "Sans commentaire"), 1)
                              ])
                            ], 10, ["onClick"]);
                          }), 128))
                        ]),
                        unref(selectedFeedback) ? (openBlock(), createBlock("section", {
                          key: 0,
                          class: "feedback-detail"
                        }, [
                          createVNode("article", { class: "admin-card feedback-panel" }, [
                            createVNode("header", { class: "feedback-panel__header" }, [
                              createVNode("div", null, [
                                createVNode("p", { class: "admin-eyebrow" }, "Feedback #" + toDisplayString(unref(selectedFeedback).id), 1),
                                createVNode("h2", null, toDisplayString(feedbackLabels[unref(selectedFeedback).feedbackType]) + " · " + toDisplayString(questionLine(unref(selectedFeedback))), 1),
                                createVNode("p", { class: "admin-muted" }, toDisplayString(formatDate(unref(selectedFeedback).createdAt)) + " · " + toDisplayString(unref(selectedFeedback).coachName || "coach inconnu") + " · " + toDisplayString(unref(selectedFeedback).helpName || "aide inconnue"), 1)
                              ])
                            ]),
                            createVNode("dl", { class: "feedback-facts" }, [
                              createVNode("div", null, [
                                createVNode("dt", null, "Question"),
                                createVNode("dd", null, toDisplayString(unref(selectedFeedback).questionNumber ?? "—"), 1)
                              ]),
                              createVNode("div", null, [
                                createVNode("dt", null, "Session"),
                                createVNode("dd", null, toDisplayString(unref(selectedFeedback).sessionId || "—"), 1)
                              ])
                            ]),
                            createVNode("section", { class: "feedback-section" }, [
                              createVNode("h3", null, "Commentaire du feedback"),
                              createVNode("p", { class: "feedback-comment" }, toDisplayString(unref(selectedFeedback).comment || "Aucun commentaire."), 1)
                            ]),
                            createVNode("section", { class: "feedback-section" }, [
                              createVNode("h3", null, "Question demandée"),
                              createVNode("dl", { class: "feedback-question" }, [
                                createVNode("div", null, [
                                  createVNode("dt", null, "Personne"),
                                  createVNode("dd", null, toDisplayString(unref(selectedFeedback).person || "—"), 1)
                                ]),
                                createVNode("div", null, [
                                  createVNode("dt", null, "Verbe"),
                                  createVNode("dd", null, toDisplayString(unref(selectedFeedback).verb || "—"), 1)
                                ]),
                                createVNode("div", null, [
                                  createVNode("dt", null, "Temps"),
                                  createVNode("dd", null, toDisplayString(unref(selectedFeedback).tense || "—"), 1)
                                ]),
                                createVNode("div", null, [
                                  createVNode("dt", null, "Mode"),
                                  createVNode("dd", null, toDisplayString(unref(selectedFeedback).mode || "—"), 1)
                                ]),
                                createVNode("div", null, [
                                  createVNode("dt", null, "Réponse attendue"),
                                  createVNode("dd", null, toDisplayString(unref(selectedFeedback).expectedAnswer || "—"), 1)
                                ]),
                                createVNode("div", null, [
                                  createVNode("dt", null, "Réponse fournie"),
                                  createVNode("dd", null, toDisplayString(unref(selectedAnswer) || "Aucune réponse donnée avant le feedback."), 1)
                                ])
                              ]),
                              createVNode("details", null, [
                                createVNode("summary", null, "Objet question complet"),
                                createVNode("pre", null, toDisplayString(stringify(unref(selectedQuestion))), 1)
                              ])
                            ]),
                            createVNode("section", { class: "feedback-section" }, [
                              createVNode("h3", null, "Messages du chat au moment du feedback"),
                              unref(selectedMessages).length ? (openBlock(), createBlock("ol", {
                                key: 0,
                                class: "feedback-messages"
                              }, [
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(selectedMessages), (message) => {
                                  return openBlock(), createBlock("li", {
                                    key: String(message.id)
                                  }, [
                                    createVNode("strong", null, toDisplayString(message.author === "coach" ? "Coach" : "Utilisateur"), 1),
                                    createVNode("span", null, toDisplayString(message.text || "[média]"), 1)
                                  ]);
                                }), 128))
                              ])) : (openBlock(), createBlock("p", {
                                key: 1,
                                class: "admin-muted"
                              }, "Aucun message capturé."))
                            ])
                          ]),
                          createVNode("article", { class: "admin-card feedback-help-preview" }, [
                            createVNode("header", null, [
                              createVNode("div", null, [
                                createVNode("p", { class: "admin-eyebrow" }, "Aide fournie"),
                                createVNode("h2", null, "Composant affiché à l’utilisateur")
                              ])
                            ]),
                            unref(selectedHelpBlocks).length ? (openBlock(), createBlock(_component_CoachHelpPanel, {
                              key: 0,
                              embedded: "",
                              "show-close": false,
                              "show-feedback": false,
                              "include-automatic-orthography": false,
                              blocks: unref(selectedHelpBlocks),
                              values: unref(selectedHelpValues),
                              "header-title": unref(selectedHelpTitle),
                              "header-description": unref(selectedHelpDescription),
                              "question-number": unref(selectedFeedback).questionNumber || 1,
                              "coach-color": "#176b87"
                            }, null, 8, ["blocks", "values", "header-title", "header-description", "question-number"])) : (openBlock(), createBlock("p", {
                              key: 1,
                              class: "feedback-empty"
                            }, "Aucun composant d’aide capturé pour ce feedback."))
                          ]),
                          createVNode("article", { class: "admin-card feedback-raw" }, [
                            createVNode("details", null, [
                              createVNode("summary", null, "Données complètes enregistrées"),
                              createVNode("pre", null, toDisplayString(stringify(unref(selectedFeedback))), 1)
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
                  createVNode("main", { class: "feedback-admin" }, [
                    createVNode("header", { class: "admin-section-heading feedback-admin__heading" }, [
                      createVNode("div", null, [
                        createVNode("p", { class: "admin-eyebrow" }, "Retours utilisateurs"),
                        createVNode("h1", null, "Feedbacks"),
                        createVNode("p", { class: "admin-muted" }, "Tous les retours sur les aides automatiques, du plus récent au plus ancien.")
                      ]),
                      createVNode("div", { class: "feedback-admin__top-actions" }, [
                        createVNode("button", {
                          class: "admin-button admin-button--primary",
                          type: "button",
                          disabled: unref(copying) || !unref(totalCount),
                          onClick: copyAllFeedbacks
                        }, toDisplayString(unref(copying) ? "Copie…" : `Tout copier pour Codex (${unref(totalCount)})`), 9, ["disabled"]),
                        createVNode("button", {
                          class: "admin-button admin-button--danger",
                          type: "button",
                          disabled: unref(deletingAll) || !unref(totalCount),
                          onClick: deleteAllFeedbacks
                        }, toDisplayString(unref(deletingAll) ? "Suppression…" : `Tout supprimer (${unref(totalCount)})`), 9, ["disabled"]),
                        createVNode("button", {
                          class: "admin-button admin-button--small",
                          type: "button",
                          disabled: unref(loading),
                          onClick: ($event) => loadFeedbacks(true)
                        }, toDisplayString(unref(loading) ? "Chargement…" : "Actualiser"), 9, ["disabled", "onClick"])
                      ])
                    ]),
                    unref(error) ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "admin-notice admin-notice--error"
                    }, toDisplayString(unref(error)), 1)) : createCommentVNode("", true),
                    unref(success) ? (openBlock(), createBlock("p", {
                      key: 1,
                      class: "admin-notice admin-notice--success"
                    }, toDisplayString(unref(success)), 1)) : createCommentVNode("", true),
                    createVNode("section", { class: "feedback-admin__summary" }, [
                      createVNode("span", null, [
                        createVNode("strong", null, toDisplayString(unref(totalCount)), 1),
                        createTextVNode(" feedbacks")
                      ])
                    ]),
                    createVNode("div", { class: "feedback-admin__workspace" }, [
                      createVNode("aside", {
                        class: "admin-card feedback-list",
                        "aria-label": "Liste des feedbacks"
                      }, [
                        unref(loading) && !unref(feedbacks2).length ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "feedback-empty"
                        }, "Chargement…")) : !unref(visibleFeedbacks).length ? (openBlock(), createBlock("p", {
                          key: 1,
                          class: "feedback-empty"
                        }, "Aucun feedback à afficher.")) : createCommentVNode("", true),
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(visibleFeedbacks), (feedback) => {
                          return openBlock(), createBlock("button", {
                            key: feedback.id,
                            type: "button",
                            class: ["feedback-list__item", { "is-selected": feedback.id === unref(selectedFeedback)?.id }],
                            onClick: ($event) => selectedId.value = feedback.id
                          }, [
                            createVNode("span", null, [
                              createVNode("strong", null, toDisplayString(feedbackLabels[feedback.feedbackType]), 1),
                              createVNode("small", null, toDisplayString(formatDate(feedback.createdAt)), 1)
                            ]),
                            createVNode("span", null, [
                              createVNode("b", null, toDisplayString(questionLine(feedback)), 1),
                              createVNode("small", null, toDisplayString(feedback.comment || "Sans commentaire"), 1)
                            ])
                          ], 10, ["onClick"]);
                        }), 128))
                      ]),
                      unref(selectedFeedback) ? (openBlock(), createBlock("section", {
                        key: 0,
                        class: "feedback-detail"
                      }, [
                        createVNode("article", { class: "admin-card feedback-panel" }, [
                          createVNode("header", { class: "feedback-panel__header" }, [
                            createVNode("div", null, [
                              createVNode("p", { class: "admin-eyebrow" }, "Feedback #" + toDisplayString(unref(selectedFeedback).id), 1),
                              createVNode("h2", null, toDisplayString(feedbackLabels[unref(selectedFeedback).feedbackType]) + " · " + toDisplayString(questionLine(unref(selectedFeedback))), 1),
                              createVNode("p", { class: "admin-muted" }, toDisplayString(formatDate(unref(selectedFeedback).createdAt)) + " · " + toDisplayString(unref(selectedFeedback).coachName || "coach inconnu") + " · " + toDisplayString(unref(selectedFeedback).helpName || "aide inconnue"), 1)
                            ])
                          ]),
                          createVNode("dl", { class: "feedback-facts" }, [
                            createVNode("div", null, [
                              createVNode("dt", null, "Question"),
                              createVNode("dd", null, toDisplayString(unref(selectedFeedback).questionNumber ?? "—"), 1)
                            ]),
                            createVNode("div", null, [
                              createVNode("dt", null, "Session"),
                              createVNode("dd", null, toDisplayString(unref(selectedFeedback).sessionId || "—"), 1)
                            ])
                          ]),
                          createVNode("section", { class: "feedback-section" }, [
                            createVNode("h3", null, "Commentaire du feedback"),
                            createVNode("p", { class: "feedback-comment" }, toDisplayString(unref(selectedFeedback).comment || "Aucun commentaire."), 1)
                          ]),
                          createVNode("section", { class: "feedback-section" }, [
                            createVNode("h3", null, "Question demandée"),
                            createVNode("dl", { class: "feedback-question" }, [
                              createVNode("div", null, [
                                createVNode("dt", null, "Personne"),
                                createVNode("dd", null, toDisplayString(unref(selectedFeedback).person || "—"), 1)
                              ]),
                              createVNode("div", null, [
                                createVNode("dt", null, "Verbe"),
                                createVNode("dd", null, toDisplayString(unref(selectedFeedback).verb || "—"), 1)
                              ]),
                              createVNode("div", null, [
                                createVNode("dt", null, "Temps"),
                                createVNode("dd", null, toDisplayString(unref(selectedFeedback).tense || "—"), 1)
                              ]),
                              createVNode("div", null, [
                                createVNode("dt", null, "Mode"),
                                createVNode("dd", null, toDisplayString(unref(selectedFeedback).mode || "—"), 1)
                              ]),
                              createVNode("div", null, [
                                createVNode("dt", null, "Réponse attendue"),
                                createVNode("dd", null, toDisplayString(unref(selectedFeedback).expectedAnswer || "—"), 1)
                              ]),
                              createVNode("div", null, [
                                createVNode("dt", null, "Réponse fournie"),
                                createVNode("dd", null, toDisplayString(unref(selectedAnswer) || "Aucune réponse donnée avant le feedback."), 1)
                              ])
                            ]),
                            createVNode("details", null, [
                              createVNode("summary", null, "Objet question complet"),
                              createVNode("pre", null, toDisplayString(stringify(unref(selectedQuestion))), 1)
                            ])
                          ]),
                          createVNode("section", { class: "feedback-section" }, [
                            createVNode("h3", null, "Messages du chat au moment du feedback"),
                            unref(selectedMessages).length ? (openBlock(), createBlock("ol", {
                              key: 0,
                              class: "feedback-messages"
                            }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(selectedMessages), (message) => {
                                return openBlock(), createBlock("li", {
                                  key: String(message.id)
                                }, [
                                  createVNode("strong", null, toDisplayString(message.author === "coach" ? "Coach" : "Utilisateur"), 1),
                                  createVNode("span", null, toDisplayString(message.text || "[média]"), 1)
                                ]);
                              }), 128))
                            ])) : (openBlock(), createBlock("p", {
                              key: 1,
                              class: "admin-muted"
                            }, "Aucun message capturé."))
                          ])
                        ]),
                        createVNode("article", { class: "admin-card feedback-help-preview" }, [
                          createVNode("header", null, [
                            createVNode("div", null, [
                              createVNode("p", { class: "admin-eyebrow" }, "Aide fournie"),
                              createVNode("h2", null, "Composant affiché à l’utilisateur")
                            ])
                          ]),
                          unref(selectedHelpBlocks).length ? (openBlock(), createBlock(_component_CoachHelpPanel, {
                            key: 0,
                            embedded: "",
                            "show-close": false,
                            "show-feedback": false,
                            "include-automatic-orthography": false,
                            blocks: unref(selectedHelpBlocks),
                            values: unref(selectedHelpValues),
                            "header-title": unref(selectedHelpTitle),
                            "header-description": unref(selectedHelpDescription),
                            "question-number": unref(selectedFeedback).questionNumber || 1,
                            "coach-color": "#176b87"
                          }, null, 8, ["blocks", "values", "header-title", "header-description", "question-number"])) : (openBlock(), createBlock("p", {
                            key: 1,
                            class: "feedback-empty"
                          }, "Aucun composant d’aide capturé pour ce feedback."))
                        ]),
                        createVNode("article", { class: "admin-card feedback-raw" }, [
                          createVNode("details", null, [
                            createVNode("summary", null, "Données complètes enregistrées"),
                            createVNode("pre", null, toDisplayString(stringify(unref(selectedFeedback))), 1)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/feedbacks.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const feedbacks = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c4495bab"]]);

export { feedbacks as default };
//# sourceMappingURL=feedbacks-D7aIjfZD.mjs.map
