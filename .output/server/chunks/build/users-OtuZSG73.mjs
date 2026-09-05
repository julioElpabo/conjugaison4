import { _ as __nuxt_component_0, a as __nuxt_component_1 } from './AdminShell-Uralqobm.mjs';
import { _ as __nuxt_component_0$1 } from './LearnerSpace-Dv1Xez7M.mjs';
import { defineComponent, ref, computed, watch, withCtx, unref, createVNode, openBlock, createBlock, toDisplayString, createCommentVNode, createTextVNode, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr } from 'vue/server-renderer';
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
import 'qrcode.vue';
import './PasswordInput-D9iWnxeu.mjs';
import './VerbConsultationModal-DLbo-LR6.mjs';
import '../_/conjugation-display.mjs';
import './useColorTheme-C6CCVHIc.mjs';
import './ChatExercise-aXGhGYFV.mjs';
import './CoachHelpPanel-BQHM-KrB.mjs';
import '@fortawesome/free-solid-svg-icons';
import '@fortawesome/vue-fontawesome';
import '../_/coach.mjs';
import '../_/coach-help-audit.mjs';
import '../_/near-future.mjs';
import '../_/coach-dialogue.mjs';
import '../_/sentence-punctuation.mjs';
import '../_/identification-form.mjs';
import './useSiteAnalytics-CWvs4oMj.mjs';
import '../_/analytics-consent.mjs';
import './main-DlTU7wez.mjs';
import './useLearnerAuth-tqISusbB.mjs';
import './ClassicExercise-Bb29p9fh.mjs';
import '../_/mode-landing-pages.mjs';
import '../_/mode-tense-pedagogy.mjs';
import './CoachPicker-BDhegtjB.mjs';
import './asyncData--5yVuH0M.mjs';
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
    const previewTab = ref("account");
    const activity = ref();
    const activityLoading = ref(false);
    const activityError = ref("");
    const deleteDialog = ref(null);
    const deleting = ref(false);
    const deleteError = ref("");
    let loaded = false;
    let activityRequest = 0;
    const selectedUser = computed(() => users2.value.find((user) => user.id === selectedId.value));
    const activityConnections = computed(() => {
      const connections = [];
      let current;
      const events = [...activity.value?.events || []].sort((left, right) => new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime());
      for (const event of events) {
        if (event.type === "login" || event.type === "registration") {
          current = { connection: event, children: [] };
          connections.push(current);
        } else if (current) {
          current.children.push(event);
        }
      }
      return connections.reverse().map((group) => ({
        ...group,
        children: group.children.reverse()
      }));
    });
    useHead({ title: "Utilisateurs — Administration" });
    function displayUsername(username) {
      return username ? username.charAt(0).toLocaleUpperCase("fr-CH") + username.slice(1) : "Utilisateur";
    }
    function engagementLevel(learner) {
      if (learner.activeDaysLast30 >= 12 && learner.recentExerciseCount >= 24) return 4;
      if (learner.activeDaysLast30 >= 6 && learner.recentExerciseCount >= 12) return 3;
      if (learner.activeDaysLast30 >= 3 && learner.recentExerciseCount >= 5) return 2;
      if (learner.recentExerciseCount > 0) return 1;
      return 0;
    }
    function engagementDescription(learner) {
      if (!learner.recentExerciseCount) return "Aucune activité durant les 30 derniers jours";
      return `${learner.recentExerciseCount} exercice${learner.recentExerciseCount > 1 ? "s" : ""} sur ${learner.activeDaysLast30} jour${learner.activeDaysLast30 > 1 ? "s" : ""} durant les 30 derniers jours`;
    }
    function formatDate(value) {
      if (!value) return "Jamais";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "Date inconnue";
      return new Intl.DateTimeFormat("fr-CH", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(date);
    }
    function activityTitle(event) {
      if (event.type === "registration") return "Création du compte";
      if (event.type === "login") return "Connexion";
      if (event.type === "account") return event.eventType === "password_changed" ? "Mot de passe modifié" : "Modification du compte";
      if (event.isReview) return "Entraînement sur les erreurs";
      return event.label || "Exercice utilisé";
    }
    function activityDetail(event) {
      if (event.type !== "exercise") return "";
      const total2 = Number(event.correctCount || 0) + Number(event.incorrectCount || 0);
      const presentation = event.presentation === "chat" ? "avec coach" : "classique";
      if (!total2) return `Défi ouvert · ${presentation}`;
      return `${total2} réponse${total2 > 1 ? "s" : ""} · ${event.correctCount || 0} correcte${Number(event.correctCount) > 1 ? "s" : ""} · ${presentation}`;
    }
    async function loadActivity() {
      const id = selectedId.value;
      if (!id) return;
      const request = ++activityRequest;
      activityLoading.value = true;
      activityError.value = "";
      activity.value = void 0;
      try {
        const response = await $fetch(`/api/admin/users/${id}/activity`, {
          credentials: "same-origin"
        });
        if (request === activityRequest && selectedId.value === id) activity.value = response;
      } catch (caught) {
        if (request !== activityRequest) return;
        if (!handleUnauthorized(caught)) {
          activityError.value = getAdminErrorMessage(caught, "Impossible de charger l’activité.");
        }
      } finally {
        if (request === activityRequest) activityLoading.value = false;
      }
    }
    function selectPreviewTab(tab) {
      previewTab.value = tab;
      if (tab === "activity") void loadActivity();
    }
    function openDeleteDialog() {
      if (!selectedUser.value) return;
      deleteError.value = "";
      deleteDialog.value?.showModal();
    }
    function closeDeleteDialog() {
      if (!deleting.value) deleteDialog.value?.close();
    }
    async function deleteSelectedUser() {
      const target = selectedUser.value;
      if (!target || deleting.value) return;
      deleting.value = true;
      deleteError.value = "";
      try {
        await $fetch(`/api/admin/users/${target.id}`, {
          method: "DELETE",
          credentials: "same-origin"
        });
        const index = users2.value.findIndex((user) => user.id === target.id);
        users2.value = users2.value.filter((user) => user.id !== target.id);
        total.value = Math.max(0, total.value - 1);
        selectedId.value = users2.value[index]?.id || users2.value[index - 1]?.id;
        activity.value = void 0;
        deleteDialog.value?.close();
      } catch (caught) {
        if (!handleUnauthorized(caught)) {
          deleteError.value = getAdminErrorMessage(caught, "Impossible de supprimer ce compte.");
        }
      } finally {
        deleting.value = false;
      }
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
    watch(selectedId, () => {
      activity.value = void 0;
      activityError.value = "";
      if (previewTab.value === "activity") void loadActivity();
    });
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
                  _push3(`<div class="learner-admin" data-v-342ed7e6${_scopeId2}><header class="admin-section-heading" data-v-342ed7e6${_scopeId2}><div data-v-342ed7e6${_scopeId2}><p class="admin-eyebrow" data-v-342ed7e6${_scopeId2}>Comptes pseudonymes</p><h1 data-v-342ed7e6${_scopeId2}>Utilisateurs</h1><p class="admin-muted" data-v-342ed7e6${_scopeId2}>Les comptes sont classés du plus actif au moins actif.</p></div><button class="admin-button admin-button--small" type="button"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} data-v-342ed7e6${_scopeId2}> Actualiser </button></header>`);
                  if (unref(error)) {
                    _push3(`<p class="admin-notice admin-notice--error" role="alert" data-v-342ed7e6${_scopeId2}>${ssrInterpolate(unref(error))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`<div class="learner-admin__workspace" data-v-342ed7e6${_scopeId2}><aside class="learner-admin__directory admin-card" aria-labelledby="learner-directory-title" data-v-342ed7e6${_scopeId2}><header data-v-342ed7e6${_scopeId2}><div data-v-342ed7e6${_scopeId2}><h2 id="learner-directory-title" data-v-342ed7e6${_scopeId2}>${ssrInterpolate(unref(total))} utilisateurs</h2><span data-v-342ed7e6${_scopeId2}>Triés par exercices réalisés</span></div></header>`);
                  if (unref(loading)) {
                    _push3(`<div class="learner-admin__loading" data-v-342ed7e6${_scopeId2}><span class="admin-spinner" aria-hidden="true" data-v-342ed7e6${_scopeId2}></span> Chargement… </div>`);
                  } else {
                    _push3(`<ol class="learner-admin__list" data-v-342ed7e6${_scopeId2}><!--[-->`);
                    ssrRenderList(unref(users2), (learner) => {
                      _push3(`<li data-v-342ed7e6${_scopeId2}><button type="button" class="${ssrRenderClass([
                        { "is-selected": learner.id === unref(selectedId) },
                        `is-engagement-${engagementLevel(learner)}`
                      ])}"${ssrRenderAttr("title", engagementDescription(learner))} data-v-342ed7e6${_scopeId2}><span class="learner-admin__avatar" aria-hidden="true" data-v-342ed7e6${_scopeId2}>${ssrInterpolate(learner.username.charAt(0).toLocaleUpperCase("fr-CH"))}</span><span data-v-342ed7e6${_scopeId2}><strong data-v-342ed7e6${_scopeId2}>${ssrInterpolate(displayUsername(learner.username))}</strong><small data-v-342ed7e6${_scopeId2}>${ssrInterpolate(engagementDescription(learner))}</small></span><b data-v-342ed7e6${_scopeId2}>${ssrInterpolate(learner.exerciseCount)}</b></button></li>`);
                    });
                    _push3(`<!--]--></ol>`);
                  }
                  if (unref(hasMore)) {
                    _push3(`<button class="admin-button learner-admin__more" type="button"${ssrIncludeBooleanAttr(unref(loadingMore)) ? " disabled" : ""} data-v-342ed7e6${_scopeId2}>${ssrInterpolate(unref(loadingMore) ? "Chargement…" : "Afficher les suivants")}</button>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</aside><main class="learner-admin__preview" data-v-342ed7e6${_scopeId2}>`);
                  if (unref(selectedUser)) {
                    _push3(`<!--[--><header class="learner-admin__preview-header admin-card" data-v-342ed7e6${_scopeId2}><nav aria-label="Consultation de l’utilisateur" data-v-342ed7e6${_scopeId2}><button type="button" class="${ssrRenderClass({ "is-active": unref(previewTab) === "account" })}" data-v-342ed7e6${_scopeId2}> Vue du compte </button><button type="button" class="${ssrRenderClass({ "is-active": unref(previewTab) === "activity" })}" data-v-342ed7e6${_scopeId2}> Activité </button></nav><button class="admin-button admin-button--danger admin-button--small" type="button" data-v-342ed7e6${_scopeId2}> Supprimer le compte </button></header>`);
                    if (unref(previewTab) === "account") {
                      _push3(ssrRenderComponent(_component_LearnerSpace, {
                        key: unref(selectedUser).id,
                        "inspected-learner": { id: unref(selectedUser).id, username: unref(selectedUser).username },
                        "read-only": ""
                      }, null, _parent3, _scopeId2));
                    } else {
                      _push3(`<section class="learner-activity admin-card" aria-labelledby="learner-activity-title" data-v-342ed7e6${_scopeId2}><header data-v-342ed7e6${_scopeId2}><div data-v-342ed7e6${_scopeId2}><p class="admin-eyebrow" data-v-342ed7e6${_scopeId2}>Suivi du compte</p><h2 id="learner-activity-title" data-v-342ed7e6${_scopeId2}>Activité de ${ssrInterpolate(displayUsername(unref(selectedUser).username))}</h2><p data-v-342ed7e6${_scopeId2}>Connexions et utilisations enregistrées par le compte.</p></div><button class="admin-button admin-button--small" type="button"${ssrIncludeBooleanAttr(unref(activityLoading)) ? " disabled" : ""} data-v-342ed7e6${_scopeId2}> Actualiser </button></header>`);
                      if (unref(activityLoading)) {
                        _push3(`<div class="learner-admin__loading" data-v-342ed7e6${_scopeId2}><span class="admin-spinner" aria-hidden="true" data-v-342ed7e6${_scopeId2}></span> Chargement de l’activité… </div>`);
                      } else if (unref(activityError)) {
                        _push3(`<p class="admin-notice admin-notice--error" role="alert" data-v-342ed7e6${_scopeId2}>${ssrInterpolate(unref(activityError))}</p>`);
                      } else if (unref(activity)) {
                        _push3(`<!--[--><dl class="learner-activity__summary" data-v-342ed7e6${_scopeId2}><div data-v-342ed7e6${_scopeId2}><dt data-v-342ed7e6${_scopeId2}>Compte créé</dt><dd data-v-342ed7e6${_scopeId2}>${ssrInterpolate(formatDate(unref(activity).summary.createdAt))}</dd></div><div data-v-342ed7e6${_scopeId2}><dt data-v-342ed7e6${_scopeId2}>Dernière connexion</dt><dd data-v-342ed7e6${_scopeId2}>${ssrInterpolate(formatDate(unref(activity).summary.lastLoginAt))}</dd></div><div data-v-342ed7e6${_scopeId2}><dt data-v-342ed7e6${_scopeId2}>Dernière présence</dt><dd data-v-342ed7e6${_scopeId2}>${ssrInterpolate(formatDate(unref(activity).summary.lastSeenAt || unref(activity).summary.lastLoginAt))}</dd></div><div data-v-342ed7e6${_scopeId2}><dt data-v-342ed7e6${_scopeId2}>Connexions</dt><dd data-v-342ed7e6${_scopeId2}>${ssrInterpolate(unref(activity).summary.loginCount)}</dd></div><div data-v-342ed7e6${_scopeId2}><dt data-v-342ed7e6${_scopeId2}>Exercices utilisés</dt><dd data-v-342ed7e6${_scopeId2}>${ssrInterpolate(unref(activity).summary.exerciseCount)}</dd></div><div data-v-342ed7e6${_scopeId2}><dt data-v-342ed7e6${_scopeId2}>Réponses</dt><dd data-v-342ed7e6${_scopeId2}>${ssrInterpolate(unref(activity).summary.correctCount + unref(activity).summary.incorrectCount)}</dd></div></dl>`);
                        if (unref(activityConnections).length) {
                          _push3(`<ol class="connection-timeline" data-v-342ed7e6${_scopeId2}><!--[-->`);
                          ssrRenderList(unref(activityConnections), (group) => {
                            _push3(`<li data-v-342ed7e6${_scopeId2}><span class="connection-timeline__dot" aria-hidden="true" data-v-342ed7e6${_scopeId2}></span><details class="connection-card" data-v-342ed7e6${_scopeId2}><summary data-v-342ed7e6${_scopeId2}><span class="connection-card__icon" aria-hidden="true" data-v-342ed7e6${_scopeId2}>↪</span><span class="connection-card__heading" data-v-342ed7e6${_scopeId2}><strong data-v-342ed7e6${_scopeId2}>${ssrInterpolate(group.connection.type === "registration" ? "Création et première connexion" : "Connexion")}</strong><time${ssrRenderAttr("datetime", group.connection.occurredAt)} data-v-342ed7e6${_scopeId2}>${ssrInterpolate(formatDate(group.connection.occurredAt))}</time></span><span class="connection-card__count" data-v-342ed7e6${_scopeId2}>${ssrInterpolate(group.children.length)} événement${ssrInterpolate(group.children.length > 1 ? "s" : "")}</span><span class="connection-card__chevron" aria-hidden="true" data-v-342ed7e6${_scopeId2}>⌄</span></summary>`);
                            if (group.children.length) {
                              _push3(`<ol class="connection-card__children" data-v-342ed7e6${_scopeId2}><!--[-->`);
                              ssrRenderList(group.children, (item) => {
                                _push3(`<li class="${ssrRenderClass(`is-${item.type}`)}" data-v-342ed7e6${_scopeId2}><span class="connection-card__child-dot" aria-hidden="true" data-v-342ed7e6${_scopeId2}></span><article data-v-342ed7e6${_scopeId2}><time${ssrRenderAttr("datetime", item.occurredAt)} data-v-342ed7e6${_scopeId2}>${ssrInterpolate(formatDate(item.occurredAt))}</time><strong data-v-342ed7e6${_scopeId2}>${ssrInterpolate(activityTitle(item))}</strong>`);
                                if (activityDetail(item)) {
                                  _push3(`<p data-v-342ed7e6${_scopeId2}>${ssrInterpolate(activityDetail(item))}</p>`);
                                } else {
                                  _push3(`<!---->`);
                                }
                                _push3(`</article></li>`);
                              });
                              _push3(`<!--]--></ol>`);
                            } else {
                              _push3(`<p class="connection-card__empty" data-v-342ed7e6${_scopeId2}>Aucun autre événement enregistré pendant cette connexion.</p>`);
                            }
                            _push3(`</details></li>`);
                          });
                          _push3(`<!--]--></ol>`);
                        } else {
                          _push3(`<p class="learner-admin__empty" data-v-342ed7e6${_scopeId2}>Aucune activité enregistrée pour ce compte.</p>`);
                        }
                        _push3(`<!--]-->`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`</section>`);
                    }
                    _push3(`<!--]-->`);
                  } else if (!unref(loading)) {
                    _push3(`<div class="admin-card learner-admin__empty" data-v-342ed7e6${_scopeId2}> Aucun compte utilisateur à afficher. </div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</main></div><dialog class="learner-delete-dialog" data-v-342ed7e6${_scopeId2}>`);
                  if (unref(selectedUser)) {
                    _push3(`<section data-v-342ed7e6${_scopeId2}><span class="learner-delete-dialog__icon" aria-hidden="true" data-v-342ed7e6${_scopeId2}>!</span><p class="admin-eyebrow" data-v-342ed7e6${_scopeId2}>Suppression définitive</p><h2 data-v-342ed7e6${_scopeId2}>Supprimer ${ssrInterpolate(displayUsername(unref(selectedUser).username))} ?</h2><p data-v-342ed7e6${_scopeId2}>Le compte, ses connexions, sa progression et tout son historique d’exercices seront définitivement supprimés.</p>`);
                    if (unref(deleteError)) {
                      _push3(`<p class="admin-notice admin-notice--error" role="alert" data-v-342ed7e6${_scopeId2}>${ssrInterpolate(unref(deleteError))}</p>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`<footer data-v-342ed7e6${_scopeId2}><button class="admin-button" type="button"${ssrIncludeBooleanAttr(unref(deleting)) ? " disabled" : ""} data-v-342ed7e6${_scopeId2}>Annuler</button><button class="admin-button admin-button--danger" type="button"${ssrIncludeBooleanAttr(unref(deleting)) ? " disabled" : ""} data-v-342ed7e6${_scopeId2}>${ssrInterpolate(unref(deleting) ? "Suppression…" : "Supprimer définitivement")}</button></footer></section>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</dialog></div>`);
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
                                  class: [
                                    { "is-selected": learner.id === unref(selectedId) },
                                    `is-engagement-${engagementLevel(learner)}`
                                  ],
                                  title: engagementDescription(learner),
                                  onClick: ($event) => selectedId.value = learner.id
                                }, [
                                  createVNode("span", {
                                    class: "learner-admin__avatar",
                                    "aria-hidden": "true"
                                  }, toDisplayString(learner.username.charAt(0).toLocaleUpperCase("fr-CH")), 1),
                                  createVNode("span", null, [
                                    createVNode("strong", null, toDisplayString(displayUsername(learner.username)), 1),
                                    createVNode("small", null, toDisplayString(engagementDescription(learner)), 1)
                                  ]),
                                  createVNode("b", null, toDisplayString(learner.exerciseCount), 1)
                                ], 10, ["title", "onClick"])
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
                          unref(selectedUser) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                            createVNode("header", { class: "learner-admin__preview-header admin-card" }, [
                              createVNode("nav", { "aria-label": "Consultation de l’utilisateur" }, [
                                createVNode("button", {
                                  type: "button",
                                  class: { "is-active": unref(previewTab) === "account" },
                                  onClick: ($event) => selectPreviewTab("account")
                                }, " Vue du compte ", 10, ["onClick"]),
                                createVNode("button", {
                                  type: "button",
                                  class: { "is-active": unref(previewTab) === "activity" },
                                  onClick: ($event) => selectPreviewTab("activity")
                                }, " Activité ", 10, ["onClick"])
                              ]),
                              createVNode("button", {
                                class: "admin-button admin-button--danger admin-button--small",
                                type: "button",
                                onClick: openDeleteDialog
                              }, " Supprimer le compte ")
                            ]),
                            unref(previewTab) === "account" ? (openBlock(), createBlock(_component_LearnerSpace, {
                              key: unref(selectedUser).id,
                              "inspected-learner": { id: unref(selectedUser).id, username: unref(selectedUser).username },
                              "read-only": ""
                            }, null, 8, ["inspected-learner"])) : (openBlock(), createBlock("section", {
                              key: 1,
                              class: "learner-activity admin-card",
                              "aria-labelledby": "learner-activity-title"
                            }, [
                              createVNode("header", null, [
                                createVNode("div", null, [
                                  createVNode("p", { class: "admin-eyebrow" }, "Suivi du compte"),
                                  createVNode("h2", { id: "learner-activity-title" }, "Activité de " + toDisplayString(displayUsername(unref(selectedUser).username)), 1),
                                  createVNode("p", null, "Connexions et utilisations enregistrées par le compte.")
                                ]),
                                createVNode("button", {
                                  class: "admin-button admin-button--small",
                                  type: "button",
                                  disabled: unref(activityLoading),
                                  onClick: loadActivity
                                }, " Actualiser ", 8, ["disabled"])
                              ]),
                              unref(activityLoading) ? (openBlock(), createBlock("div", {
                                key: 0,
                                class: "learner-admin__loading"
                              }, [
                                createVNode("span", {
                                  class: "admin-spinner",
                                  "aria-hidden": "true"
                                }),
                                createTextVNode(" Chargement de l’activité… ")
                              ])) : unref(activityError) ? (openBlock(), createBlock("p", {
                                key: 1,
                                class: "admin-notice admin-notice--error",
                                role: "alert"
                              }, toDisplayString(unref(activityError)), 1)) : unref(activity) ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                                createVNode("dl", { class: "learner-activity__summary" }, [
                                  createVNode("div", null, [
                                    createVNode("dt", null, "Compte créé"),
                                    createVNode("dd", null, toDisplayString(formatDate(unref(activity).summary.createdAt)), 1)
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("dt", null, "Dernière connexion"),
                                    createVNode("dd", null, toDisplayString(formatDate(unref(activity).summary.lastLoginAt)), 1)
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("dt", null, "Dernière présence"),
                                    createVNode("dd", null, toDisplayString(formatDate(unref(activity).summary.lastSeenAt || unref(activity).summary.lastLoginAt)), 1)
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("dt", null, "Connexions"),
                                    createVNode("dd", null, toDisplayString(unref(activity).summary.loginCount), 1)
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("dt", null, "Exercices utilisés"),
                                    createVNode("dd", null, toDisplayString(unref(activity).summary.exerciseCount), 1)
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("dt", null, "Réponses"),
                                    createVNode("dd", null, toDisplayString(unref(activity).summary.correctCount + unref(activity).summary.incorrectCount), 1)
                                  ])
                                ]),
                                unref(activityConnections).length ? (openBlock(), createBlock("ol", {
                                  key: 0,
                                  class: "connection-timeline"
                                }, [
                                  (openBlock(true), createBlock(Fragment, null, renderList(unref(activityConnections), (group) => {
                                    return openBlock(), createBlock("li", {
                                      key: group.connection.id
                                    }, [
                                      createVNode("span", {
                                        class: "connection-timeline__dot",
                                        "aria-hidden": "true"
                                      }),
                                      createVNode("details", { class: "connection-card" }, [
                                        createVNode("summary", null, [
                                          createVNode("span", {
                                            class: "connection-card__icon",
                                            "aria-hidden": "true"
                                          }, "↪"),
                                          createVNode("span", { class: "connection-card__heading" }, [
                                            createVNode("strong", null, toDisplayString(group.connection.type === "registration" ? "Création et première connexion" : "Connexion"), 1),
                                            createVNode("time", {
                                              datetime: group.connection.occurredAt
                                            }, toDisplayString(formatDate(group.connection.occurredAt)), 9, ["datetime"])
                                          ]),
                                          createVNode("span", { class: "connection-card__count" }, toDisplayString(group.children.length) + " événement" + toDisplayString(group.children.length > 1 ? "s" : ""), 1),
                                          createVNode("span", {
                                            class: "connection-card__chevron",
                                            "aria-hidden": "true"
                                          }, "⌄")
                                        ]),
                                        group.children.length ? (openBlock(), createBlock("ol", {
                                          key: 0,
                                          class: "connection-card__children"
                                        }, [
                                          (openBlock(true), createBlock(Fragment, null, renderList(group.children, (item) => {
                                            return openBlock(), createBlock("li", {
                                              key: item.id,
                                              class: `is-${item.type}`
                                            }, [
                                              createVNode("span", {
                                                class: "connection-card__child-dot",
                                                "aria-hidden": "true"
                                              }),
                                              createVNode("article", null, [
                                                createVNode("time", {
                                                  datetime: item.occurredAt
                                                }, toDisplayString(formatDate(item.occurredAt)), 9, ["datetime"]),
                                                createVNode("strong", null, toDisplayString(activityTitle(item)), 1),
                                                activityDetail(item) ? (openBlock(), createBlock("p", { key: 0 }, toDisplayString(activityDetail(item)), 1)) : createCommentVNode("", true)
                                              ])
                                            ], 2);
                                          }), 128))
                                        ])) : (openBlock(), createBlock("p", {
                                          key: 1,
                                          class: "connection-card__empty"
                                        }, "Aucun autre événement enregistré pendant cette connexion."))
                                      ])
                                    ]);
                                  }), 128))
                                ])) : (openBlock(), createBlock("p", {
                                  key: 1,
                                  class: "learner-admin__empty"
                                }, "Aucune activité enregistrée pour ce compte."))
                              ], 64)) : createCommentVNode("", true)
                            ]))
                          ], 64)) : !unref(loading) ? (openBlock(), createBlock("div", {
                            key: 1,
                            class: "admin-card learner-admin__empty"
                          }, " Aucun compte utilisateur à afficher. ")) : createCommentVNode("", true)
                        ])
                      ]),
                      createVNode("dialog", {
                        ref_key: "deleteDialog",
                        ref: deleteDialog,
                        class: "learner-delete-dialog",
                        onCancel: ($event) => unref(deleting) && $event.preventDefault()
                      }, [
                        unref(selectedUser) ? (openBlock(), createBlock("section", { key: 0 }, [
                          createVNode("span", {
                            class: "learner-delete-dialog__icon",
                            "aria-hidden": "true"
                          }, "!"),
                          createVNode("p", { class: "admin-eyebrow" }, "Suppression définitive"),
                          createVNode("h2", null, "Supprimer " + toDisplayString(displayUsername(unref(selectedUser).username)) + " ?", 1),
                          createVNode("p", null, "Le compte, ses connexions, sa progression et tout son historique d’exercices seront définitivement supprimés."),
                          unref(deleteError) ? (openBlock(), createBlock("p", {
                            key: 0,
                            class: "admin-notice admin-notice--error",
                            role: "alert"
                          }, toDisplayString(unref(deleteError)), 1)) : createCommentVNode("", true),
                          createVNode("footer", null, [
                            createVNode("button", {
                              class: "admin-button",
                              type: "button",
                              disabled: unref(deleting),
                              onClick: closeDeleteDialog
                            }, "Annuler", 8, ["disabled"]),
                            createVNode("button", {
                              class: "admin-button admin-button--danger",
                              type: "button",
                              disabled: unref(deleting),
                              onClick: deleteSelectedUser
                            }, toDisplayString(unref(deleting) ? "Suppression…" : "Supprimer définitivement"), 9, ["disabled"])
                          ])
                        ])) : createCommentVNode("", true)
                      ], 40, ["onCancel"])
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
                                class: [
                                  { "is-selected": learner.id === unref(selectedId) },
                                  `is-engagement-${engagementLevel(learner)}`
                                ],
                                title: engagementDescription(learner),
                                onClick: ($event) => selectedId.value = learner.id
                              }, [
                                createVNode("span", {
                                  class: "learner-admin__avatar",
                                  "aria-hidden": "true"
                                }, toDisplayString(learner.username.charAt(0).toLocaleUpperCase("fr-CH")), 1),
                                createVNode("span", null, [
                                  createVNode("strong", null, toDisplayString(displayUsername(learner.username)), 1),
                                  createVNode("small", null, toDisplayString(engagementDescription(learner)), 1)
                                ]),
                                createVNode("b", null, toDisplayString(learner.exerciseCount), 1)
                              ], 10, ["title", "onClick"])
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
                        unref(selectedUser) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                          createVNode("header", { class: "learner-admin__preview-header admin-card" }, [
                            createVNode("nav", { "aria-label": "Consultation de l’utilisateur" }, [
                              createVNode("button", {
                                type: "button",
                                class: { "is-active": unref(previewTab) === "account" },
                                onClick: ($event) => selectPreviewTab("account")
                              }, " Vue du compte ", 10, ["onClick"]),
                              createVNode("button", {
                                type: "button",
                                class: { "is-active": unref(previewTab) === "activity" },
                                onClick: ($event) => selectPreviewTab("activity")
                              }, " Activité ", 10, ["onClick"])
                            ]),
                            createVNode("button", {
                              class: "admin-button admin-button--danger admin-button--small",
                              type: "button",
                              onClick: openDeleteDialog
                            }, " Supprimer le compte ")
                          ]),
                          unref(previewTab) === "account" ? (openBlock(), createBlock(_component_LearnerSpace, {
                            key: unref(selectedUser).id,
                            "inspected-learner": { id: unref(selectedUser).id, username: unref(selectedUser).username },
                            "read-only": ""
                          }, null, 8, ["inspected-learner"])) : (openBlock(), createBlock("section", {
                            key: 1,
                            class: "learner-activity admin-card",
                            "aria-labelledby": "learner-activity-title"
                          }, [
                            createVNode("header", null, [
                              createVNode("div", null, [
                                createVNode("p", { class: "admin-eyebrow" }, "Suivi du compte"),
                                createVNode("h2", { id: "learner-activity-title" }, "Activité de " + toDisplayString(displayUsername(unref(selectedUser).username)), 1),
                                createVNode("p", null, "Connexions et utilisations enregistrées par le compte.")
                              ]),
                              createVNode("button", {
                                class: "admin-button admin-button--small",
                                type: "button",
                                disabled: unref(activityLoading),
                                onClick: loadActivity
                              }, " Actualiser ", 8, ["disabled"])
                            ]),
                            unref(activityLoading) ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "learner-admin__loading"
                            }, [
                              createVNode("span", {
                                class: "admin-spinner",
                                "aria-hidden": "true"
                              }),
                              createTextVNode(" Chargement de l’activité… ")
                            ])) : unref(activityError) ? (openBlock(), createBlock("p", {
                              key: 1,
                              class: "admin-notice admin-notice--error",
                              role: "alert"
                            }, toDisplayString(unref(activityError)), 1)) : unref(activity) ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                              createVNode("dl", { class: "learner-activity__summary" }, [
                                createVNode("div", null, [
                                  createVNode("dt", null, "Compte créé"),
                                  createVNode("dd", null, toDisplayString(formatDate(unref(activity).summary.createdAt)), 1)
                                ]),
                                createVNode("div", null, [
                                  createVNode("dt", null, "Dernière connexion"),
                                  createVNode("dd", null, toDisplayString(formatDate(unref(activity).summary.lastLoginAt)), 1)
                                ]),
                                createVNode("div", null, [
                                  createVNode("dt", null, "Dernière présence"),
                                  createVNode("dd", null, toDisplayString(formatDate(unref(activity).summary.lastSeenAt || unref(activity).summary.lastLoginAt)), 1)
                                ]),
                                createVNode("div", null, [
                                  createVNode("dt", null, "Connexions"),
                                  createVNode("dd", null, toDisplayString(unref(activity).summary.loginCount), 1)
                                ]),
                                createVNode("div", null, [
                                  createVNode("dt", null, "Exercices utilisés"),
                                  createVNode("dd", null, toDisplayString(unref(activity).summary.exerciseCount), 1)
                                ]),
                                createVNode("div", null, [
                                  createVNode("dt", null, "Réponses"),
                                  createVNode("dd", null, toDisplayString(unref(activity).summary.correctCount + unref(activity).summary.incorrectCount), 1)
                                ])
                              ]),
                              unref(activityConnections).length ? (openBlock(), createBlock("ol", {
                                key: 0,
                                class: "connection-timeline"
                              }, [
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(activityConnections), (group) => {
                                  return openBlock(), createBlock("li", {
                                    key: group.connection.id
                                  }, [
                                    createVNode("span", {
                                      class: "connection-timeline__dot",
                                      "aria-hidden": "true"
                                    }),
                                    createVNode("details", { class: "connection-card" }, [
                                      createVNode("summary", null, [
                                        createVNode("span", {
                                          class: "connection-card__icon",
                                          "aria-hidden": "true"
                                        }, "↪"),
                                        createVNode("span", { class: "connection-card__heading" }, [
                                          createVNode("strong", null, toDisplayString(group.connection.type === "registration" ? "Création et première connexion" : "Connexion"), 1),
                                          createVNode("time", {
                                            datetime: group.connection.occurredAt
                                          }, toDisplayString(formatDate(group.connection.occurredAt)), 9, ["datetime"])
                                        ]),
                                        createVNode("span", { class: "connection-card__count" }, toDisplayString(group.children.length) + " événement" + toDisplayString(group.children.length > 1 ? "s" : ""), 1),
                                        createVNode("span", {
                                          class: "connection-card__chevron",
                                          "aria-hidden": "true"
                                        }, "⌄")
                                      ]),
                                      group.children.length ? (openBlock(), createBlock("ol", {
                                        key: 0,
                                        class: "connection-card__children"
                                      }, [
                                        (openBlock(true), createBlock(Fragment, null, renderList(group.children, (item) => {
                                          return openBlock(), createBlock("li", {
                                            key: item.id,
                                            class: `is-${item.type}`
                                          }, [
                                            createVNode("span", {
                                              class: "connection-card__child-dot",
                                              "aria-hidden": "true"
                                            }),
                                            createVNode("article", null, [
                                              createVNode("time", {
                                                datetime: item.occurredAt
                                              }, toDisplayString(formatDate(item.occurredAt)), 9, ["datetime"]),
                                              createVNode("strong", null, toDisplayString(activityTitle(item)), 1),
                                              activityDetail(item) ? (openBlock(), createBlock("p", { key: 0 }, toDisplayString(activityDetail(item)), 1)) : createCommentVNode("", true)
                                            ])
                                          ], 2);
                                        }), 128))
                                      ])) : (openBlock(), createBlock("p", {
                                        key: 1,
                                        class: "connection-card__empty"
                                      }, "Aucun autre événement enregistré pendant cette connexion."))
                                    ])
                                  ]);
                                }), 128))
                              ])) : (openBlock(), createBlock("p", {
                                key: 1,
                                class: "learner-admin__empty"
                              }, "Aucune activité enregistrée pour ce compte."))
                            ], 64)) : createCommentVNode("", true)
                          ]))
                        ], 64)) : !unref(loading) ? (openBlock(), createBlock("div", {
                          key: 1,
                          class: "admin-card learner-admin__empty"
                        }, " Aucun compte utilisateur à afficher. ")) : createCommentVNode("", true)
                      ])
                    ]),
                    createVNode("dialog", {
                      ref_key: "deleteDialog",
                      ref: deleteDialog,
                      class: "learner-delete-dialog",
                      onCancel: ($event) => unref(deleting) && $event.preventDefault()
                    }, [
                      unref(selectedUser) ? (openBlock(), createBlock("section", { key: 0 }, [
                        createVNode("span", {
                          class: "learner-delete-dialog__icon",
                          "aria-hidden": "true"
                        }, "!"),
                        createVNode("p", { class: "admin-eyebrow" }, "Suppression définitive"),
                        createVNode("h2", null, "Supprimer " + toDisplayString(displayUsername(unref(selectedUser).username)) + " ?", 1),
                        createVNode("p", null, "Le compte, ses connexions, sa progression et tout son historique d’exercices seront définitivement supprimés."),
                        unref(deleteError) ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "admin-notice admin-notice--error",
                          role: "alert"
                        }, toDisplayString(unref(deleteError)), 1)) : createCommentVNode("", true),
                        createVNode("footer", null, [
                          createVNode("button", {
                            class: "admin-button",
                            type: "button",
                            disabled: unref(deleting),
                            onClick: closeDeleteDialog
                          }, "Annuler", 8, ["disabled"]),
                          createVNode("button", {
                            class: "admin-button admin-button--danger",
                            type: "button",
                            disabled: unref(deleting),
                            onClick: deleteSelectedUser
                          }, toDisplayString(unref(deleting) ? "Suppression…" : "Supprimer définitivement"), 9, ["disabled"])
                        ])
                      ])) : createCommentVNode("", true)
                    ], 40, ["onCancel"])
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
const users = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-342ed7e6"]]);

export { users as default };
//# sourceMappingURL=users-OtuZSG73.mjs.map
