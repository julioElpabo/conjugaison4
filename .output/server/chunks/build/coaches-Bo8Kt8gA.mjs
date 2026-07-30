import { u as useAdminAuth, _ as __nuxt_component_0, a as __nuxt_component_1, g as getAdminErrorMessage } from './AdminShell-Vsqkwhjy.mjs';
import { defineComponent, ref, reactive, computed, watch, withCtx, unref, createVNode, openBlock, createBlock, toDisplayString, createCommentVNode, Fragment, renderList, createTextVNode, withModifiers, withDirectives, vModelText, vModelSelect, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { f as formatCaractereName } from '../_/coach-caractere.mjs';
import { c as createCoachReaction } from '../_/coach-dialogue.mjs';
import { g as useRoute, u as useHead } from './server.mjs';
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
  __name: "coaches",
  __ssrInlineRender: true,
  setup(__props) {
    const { user, handleUnauthorized } = useAdminAuth();
    const route = useRoute();
    const coaches2 = ref([]);
    const caracteres = ref([]);
    const media = ref([]);
    const selectedId = ref(null);
    const draft = ref(null);
    ref("coaches");
    const loading = ref(false);
    const saving = ref(false);
    const autosaveState = ref("idle");
    const deleting = ref(false);
    const error = ref("");
    const success = ref("");
    const previewEvent = ref("correct");
    ref(null);
    reactive({ id: 0, name: "", filePath: "", mediaType: "animation", category: "success", altText: "", rightsStatus: "pending", safetyStatus: "pending", isActive: true, fileSize: null });
    const uploading = ref(false);
    let loaded = false;
    let autosaveTimer = null;
    let autosavePromise = null;
    let lastSavedSnapshot = "";
    useHead({ title: "Coaches — Administration" });
    computed(() => draft.value ? createCoachReaction(draft.value, previewEvent.value, {
      verb: "manger",
      complement: "les pommes",
      participle: "mangées",
      gender: "féminin",
      number: "pluriel",
      mode: "indicatif",
      tense: "passé composé",
      expectedAnswer: "vous avez mangées",
      score: 85,
      correctCount: 17,
      questionCount: 20,
      questionNumber: 3
    }, { random: () => 0, allowMotion: true, mediaAllowed: true }) : null);
    const autosaveLabel = computed(() => {
      if (autosaveState.value === "saving") return "Enregistrement…";
      if (autosaveState.value === "dirty") return "Modification en attente…";
      if (autosaveState.value === "error") return "Échec de l’enregistrement";
      return "Toutes les modifications sont enregistrées";
    });
    const coachGroups = computed(() => {
      const caractereOrder = new Map(caracteres.value.map((caractere, index) => [caractere.id, index]));
      const groups = /* @__PURE__ */ new Map();
      for (const coach of coaches2.value) {
        const group = groups.get(coach.caractereId);
        if (group) group.coaches.push(coach);
        else {
          const caractere = caracteres.value.find((item) => item.id === coach.caractereId);
          groups.set(coach.caractereId, {
            caractereId: coach.caractereId,
            name: caractere ? formatCaractereName(caractere) : coach.caractereName || "Caractère non renseigné",
            emoticon: caractere?.emoticon || "🙂",
            coaches: [coach]
          });
        }
      }
      return [...groups.values()].sort((left, right) => (caractereOrder.get(left.caractereId) ?? 999) - (caractereOrder.get(right.caractereId) ?? 999) || left.name.localeCompare(right.name, "fr"));
    });
    const availableCaracteresForDraft = computed(() => caracteres.value.filter((caractere) => caractere.status !== "disabled" || caractere.id === draft.value?.caractereId).sort((left, right) => left.sortOrder - right.sortOrder || formatCaractereName(left).localeCompare(formatCaractereName(right), "fr") || left.id - right.id));
    function clone(value) {
      return JSON.parse(JSON.stringify(value));
    }
    function cancelScheduledAutosave() {
      if (autosaveTimer) clearTimeout(autosaveTimer);
      autosaveTimer = null;
    }
    function setCoachDraft(coach) {
      cancelScheduledAutosave();
      selectedId.value = coach.id || null;
      draft.value = clone(coach);
      lastSavedSnapshot = coach.id ? JSON.stringify(draft.value) : "";
      autosaveState.value = "idle";
      error.value = "";
      success.value = "";
    }
    async function selectCoach(coach) {
      await autosaveCoach();
      setCoachDraft(coach);
    }
    function blankCoach() {
      const caractere = availableCaracteresForDraft.value.find((item) => item.status !== "disabled") || null;
      const caractereName = caractere?.masculineName || "";
      return { id: 0, slug: "", firstName: "", lastName: "", gender: "female", avatarPath: "", description: "", likes: "", caractereId: caractere?.id || 0, caractereName, personality: caractereName, pedagogicalStyle: caractere?.pedagogicalStyle || "", helpApproach: caractere?.helpApproach || "complete-avec-reponses", themeColor: "#295f72", status: "draft", sortOrder: coaches2.value.length + 1, replies: [], media: clone(media.value), assignments: [], rules: [] };
    }
    async function newCoach() {
      await autosaveCoach();
      setCoachDraft(blankCoach());
    }
    async function load() {
      loading.value = true;
      error.value = "";
      try {
        const [coachResponse, caractereResponse, mediaResponse] = await Promise.all([
          $fetch("/api/admin/coaches"),
          $fetch("/api/admin/coach-caracteres"),
          $fetch("/api/admin/coach-media")
        ]);
        coaches2.value = coachResponse.coaches;
        caracteres.value = caractereResponse.caracteres;
        media.value = mediaResponse.media;
        const requestedCoachId = Number(route.query.coach);
        const requestedCoach = Number.isInteger(requestedCoachId) ? coaches2.value.find((item) => item.id === requestedCoachId) : void 0;
        if (requestedCoach) {
          setCoachDraft(requestedCoach);
        } else if (draft.value?.id) {
          const refreshed = coaches2.value.find((item) => item.id === draft.value?.id);
          if (refreshed) setCoachDraft(refreshed);
        } else if (!draft.value && coaches2.value[0]) setCoachDraft(coaches2.value[0]);
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible de charger les coaches.");
      } finally {
        loading.value = false;
      }
    }
    async function saveCoach() {
      if (!draft.value || saving.value) return;
      if (draft.value.id) {
        await autosaveCoach();
        return;
      }
      saving.value = true;
      error.value = "";
      success.value = "";
      try {
        if (draft.value.id) await $fetch(`/api/admin/coaches/${draft.value.id}`, { method: "PUT", body: draft.value });
        else {
          const response = await $fetch("/api/admin/coaches", { method: "POST", body: draft.value });
          draft.value.id = response.id;
          selectedId.value = response.id;
        }
        await load();
        success.value = "Coach enregistré.";
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible d’enregistrer ce coach.");
      } finally {
        saving.value = false;
      }
    }
    function coachCanBeSaved(coach) {
      return Boolean(
        coach.slug.trim() && coach.firstName.trim() && coach.lastName.trim() && /^#[0-9a-f]{6}$/iu.test(coach.themeColor) && ["female", "male"].includes(coach.gender) && Number.isInteger(coach.caractereId) && coach.caractereId > 0 && ["draft", "published", "disabled"].includes(coach.status) && Number.isInteger(coach.sortOrder) && (coach.status !== "published" || coach.avatarPath.trim())
      );
    }
    function refreshCoachInList(saved) {
      const item = coaches2.value.find((coach) => coach.id === saved.id);
      if (!item) return;
      const caractere = caracteres.value.find((candidate) => candidate.id === saved.caractereId);
      const caractereName = caractere?.masculineName || item.caractereName;
      Object.assign(item, clone(saved), {
        caractereName,
        personality: caractereName,
        pedagogicalStyle: caractere?.pedagogicalStyle || item.pedagogicalStyle
      });
    }
    function scheduleAutosave() {
      cancelScheduledAutosave();
      autosaveTimer = setTimeout(() => {
        void autosaveCoach();
      }, 650);
    }
    async function autosaveCoach() {
      cancelScheduledAutosave();
      if (autosavePromise) {
        await autosavePromise;
        if (draft.value?.id && JSON.stringify(draft.value) !== lastSavedSnapshot) scheduleAutosave();
        return;
      }
      const current = draft.value;
      if (!current?.id) return;
      const snapshot = JSON.stringify(current);
      if (snapshot === lastSavedSnapshot) return;
      if (!coachCanBeSaved(current)) {
        autosaveState.value = "dirty";
        return;
      }
      const payload = clone(current);
      const coachId = current.id;
      autosaveState.value = "saving";
      error.value = "";
      autosavePromise = $fetch(`/api/admin/coaches/${coachId}`, { method: "PUT", body: payload }).then(() => void 0);
      try {
        await autosavePromise;
        lastSavedSnapshot = snapshot;
        refreshCoachInList(payload);
        if (draft.value?.id === coachId && JSON.stringify(draft.value) === snapshot) autosaveState.value = "saved";
        else if (draft.value?.id === coachId) scheduleAutosave();
      } catch (caught) {
        autosaveState.value = "error";
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible d’enregistrer automatiquement ce coach.");
      } finally {
        autosavePromise = null;
      }
    }
    async function deleteCoach() {
      if (!draft.value?.id || deleting.value) return;
      const name = `${draft.value.firstName} ${draft.value.lastName}`.trim();
      if (!(void 0).confirm(`Supprimer définitivement le coach ${name} ?

Cette action est irréversible.`)) return;
      deleting.value = true;
      error.value = "";
      success.value = "";
      try {
        await $fetch(`/api/admin/coaches/${draft.value.id}`, { method: "DELETE" });
        selectedId.value = null;
        draft.value = null;
        await load();
        success.value = `Le coach ${name} a été supprimé.`;
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible de supprimer ce coach.");
      } finally {
        deleting.value = false;
      }
    }
    async function uploadAvatar(event) {
      const file = event.target.files?.[0];
      if (!file || !draft.value) return;
      uploading.value = true;
      error.value = "";
      try {
        const data = new FormData();
        data.append("file", file);
        const result = await $fetch("/api/admin/coach-media/upload", { method: "POST", body: data });
        draft.value.avatarPath = result.path;
      } catch (caught) {
        error.value = getAdminErrorMessage(caught, "Impossible d’envoyer cet avatar.");
      } finally {
        uploading.value = false;
      }
    }
    watch(draft, (current) => {
      if (loading.value || saving.value || !current) return;
      const caractere = caracteres.value.find((item) => item.id === current.caractereId);
      if (caractere) {
        const caractereName = caractere.masculineName;
        if (current.caractereName !== caractereName || current.personality !== caractereName || current.pedagogicalStyle !== caractere.pedagogicalStyle) {
          current.caractereName = caractereName;
          current.personality = caractereName;
          current.pedagogicalStyle = caractere.pedagogicalStyle;
          return;
        }
      }
      if (!current.id) return;
      const snapshot = JSON.stringify(current);
      if (snapshot === lastSavedSnapshot) return;
      autosaveState.value = "dirty";
      scheduleAutosave();
    }, { deep: true });
    watch(user, (current) => {
      if (current && !loaded) {
        loaded = true;
        void load();
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
                  _push3(`<div class="coach-admin" data-v-4027dfdc${_scopeId2}><header class="admin-section-heading" data-v-4027dfdc${_scopeId2}><div data-v-4027dfdc${_scopeId2}><p class="admin-eyebrow" data-v-4027dfdc${_scopeId2}>Personnages virtuels</p><h1 data-v-4027dfdc${_scopeId2}>Coaches</h1><p class="admin-muted" data-v-4027dfdc${_scopeId2}>Gérez leur identité et attribuez-leur un caractère partagé.</p></div><button class="admin-button admin-button--primary" data-v-4027dfdc${_scopeId2}>Nouveau coach</button></header>`);
                  if (unref(error)) {
                    _push3(`<p class="admin-notice admin-notice--error" data-v-4027dfdc${_scopeId2}>${ssrInterpolate(unref(error))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(success)) {
                    _push3(`<p class="admin-notice admin-notice--success" data-v-4027dfdc${_scopeId2}>${ssrInterpolate(unref(success))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`<div class="coach-admin__workspace" data-v-4027dfdc${_scopeId2}><aside class="coach-admin__list admin-card" data-v-4027dfdc${_scopeId2}><!--[-->`);
                  ssrRenderList(unref(coachGroups), (group) => {
                    _push3(`<section class="coach-list-group" data-v-4027dfdc${_scopeId2}><header data-v-4027dfdc${_scopeId2}><strong data-v-4027dfdc${_scopeId2}><span aria-hidden="true" data-v-4027dfdc${_scopeId2}>${ssrInterpolate(group.emoticon)}</span> ${ssrInterpolate(group.name)}</strong><span data-v-4027dfdc${_scopeId2}>${ssrInterpolate(group.coaches.length)}</span></header><!--[-->`);
                    ssrRenderList(group.coaches, (coach) => {
                      _push3(`<button class="${ssrRenderClass({ selected: coach.id === unref(selectedId) })}" data-v-4027dfdc${_scopeId2}><img${ssrRenderAttr("src", coach.avatarPath)} alt="" data-v-4027dfdc${_scopeId2}><span data-v-4027dfdc${_scopeId2}><strong data-v-4027dfdc${_scopeId2}>${ssrInterpolate(coach.firstName)} ${ssrInterpolate(coach.lastName)}</strong><small data-v-4027dfdc${_scopeId2}>${ssrInterpolate(coach.status === "published" ? "Publié" : coach.status === "draft" ? "Brouillon" : "Désactivé")}</small></span></button>`);
                    });
                    _push3(`<!--]--></section>`);
                  });
                  _push3(`<!--]--></aside>`);
                  if (unref(draft)) {
                    _push3(`<form class="coach-editor" data-v-4027dfdc${_scopeId2}><section class="admin-card coach-panel coach-identity-panel" data-v-4027dfdc${_scopeId2}><div class="coach-panel__title" data-v-4027dfdc${_scopeId2}><div data-v-4027dfdc${_scopeId2}><p class="admin-eyebrow" data-v-4027dfdc${_scopeId2}>Identité</p><h2 data-v-4027dfdc${_scopeId2}>${ssrInterpolate(unref(draft).id ? `${unref(draft).firstName} ${unref(draft).lastName}` : "Nouveau coach")}</h2></div>`);
                    if (unref(draft).id) {
                      _push3(`<button type="button" class="admin-button admin-button--danger admin-button--small"${ssrIncludeBooleanAttr(unref(deleting)) ? " disabled" : ""} data-v-4027dfdc${_scopeId2}>${ssrInterpolate(unref(deleting) ? "Suppression…" : "Supprimer")}</button>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div><div class="coach-identity-layout" data-v-4027dfdc${_scopeId2}><div class="coach-identity-fields" data-v-4027dfdc${_scopeId2}><div class="coach-fields coach-fields--identity" data-v-4027dfdc${_scopeId2}><label class="admin-field" data-v-4027dfdc${_scopeId2}><span data-v-4027dfdc${_scopeId2}>Prénom *</span><input${ssrRenderAttr("value", unref(draft).firstName)} required data-v-4027dfdc${_scopeId2}></label><label class="admin-field" data-v-4027dfdc${_scopeId2}><span data-v-4027dfdc${_scopeId2}>Nom fictif *</span><input${ssrRenderAttr("value", unref(draft).lastName)} required data-v-4027dfdc${_scopeId2}></label><label class="admin-field" data-v-4027dfdc${_scopeId2}><span data-v-4027dfdc${_scopeId2}>Genre du personnage *</span><select data-v-4027dfdc${_scopeId2}><option value="female" data-v-4027dfdc${ssrIncludeBooleanAttr(Array.isArray(unref(draft).gender) ? ssrLooseContain(unref(draft).gender, "female") : ssrLooseEqual(unref(draft).gender, "female")) ? " selected" : ""}${_scopeId2}>Femme</option><option value="male" data-v-4027dfdc${ssrIncludeBooleanAttr(Array.isArray(unref(draft).gender) ? ssrLooseContain(unref(draft).gender, "male") : ssrLooseEqual(unref(draft).gender, "male")) ? " selected" : ""}${_scopeId2}>Homme</option></select></label><label class="admin-field" data-v-4027dfdc${_scopeId2}><span data-v-4027dfdc${_scopeId2}>Identifiant *</span><input${ssrRenderAttr("value", unref(draft).slug)} required data-v-4027dfdc${_scopeId2}></label><label class="admin-field" data-v-4027dfdc${_scopeId2}><span data-v-4027dfdc${_scopeId2}>Caractère partagé *</span><select required data-v-4027dfdc${_scopeId2}><!--[-->`);
                    ssrRenderList(unref(availableCaracteresForDraft), (caractere) => {
                      _push3(`<option${ssrRenderAttr("value", caractere.id)}${ssrIncludeBooleanAttr(caractere.status === "disabled") ? " disabled" : ""} data-v-4027dfdc${ssrIncludeBooleanAttr(Array.isArray(unref(draft).caractereId) ? ssrLooseContain(unref(draft).caractereId, caractere.id) : ssrLooseEqual(unref(draft).caractereId, caractere.id)) ? " selected" : ""}${_scopeId2}>${ssrInterpolate(caractere.emoticon)} ${ssrInterpolate(unref(formatCaractereName)(caractere))}${ssrInterpolate(caractere.status === "disabled" ? " — désactivé" : "")}</option>`);
                    });
                    _push3(`<!--]--></select></label><label class="admin-field admin-field--color" data-v-4027dfdc${_scopeId2}><span data-v-4027dfdc${_scopeId2}>Couleur</span><input${ssrRenderAttr("value", unref(draft).themeColor)} type="color" data-v-4027dfdc${_scopeId2}></label><label class="admin-field" data-v-4027dfdc${_scopeId2}><span data-v-4027dfdc${_scopeId2}>Statut</span><select data-v-4027dfdc${_scopeId2}><option value="draft" data-v-4027dfdc${ssrIncludeBooleanAttr(Array.isArray(unref(draft).status) ? ssrLooseContain(unref(draft).status, "draft") : ssrLooseEqual(unref(draft).status, "draft")) ? " selected" : ""}${_scopeId2}>Brouillon</option><option value="published" data-v-4027dfdc${ssrIncludeBooleanAttr(Array.isArray(unref(draft).status) ? ssrLooseContain(unref(draft).status, "published") : ssrLooseEqual(unref(draft).status, "published")) ? " selected" : ""}${_scopeId2}>Publié</option><option value="disabled" data-v-4027dfdc${ssrIncludeBooleanAttr(Array.isArray(unref(draft).status) ? ssrLooseContain(unref(draft).status, "disabled") : ssrLooseEqual(unref(draft).status, "disabled")) ? " selected" : ""}${_scopeId2}>Désactivé</option></select></label><label class="admin-field" data-v-4027dfdc${_scopeId2}><span data-v-4027dfdc${_scopeId2}>Ordre d’affichage</span><input${ssrRenderAttr("value", unref(draft).sortOrder)} type="number" data-v-4027dfdc${_scopeId2}></label></div><div class="coach-description-fields" data-v-4027dfdc${_scopeId2}><label class="admin-field" data-v-4027dfdc${_scopeId2}><span data-v-4027dfdc${_scopeId2}>Citation</span><input${ssrRenderAttr("value", unref(draft).description)} data-v-4027dfdc${_scopeId2}></label><label class="admin-field" data-v-4027dfdc${_scopeId2}><span data-v-4027dfdc${_scopeId2}>J’aime</span><input${ssrRenderAttr("value", unref(draft).likes)} placeholder="Ex. les phrases courtes, les exemples concrets…" data-v-4027dfdc${_scopeId2}></label></div></div><aside class="coach-avatar-card" data-v-4027dfdc${_scopeId2}><div class="coach-avatar-card__portrait" data-v-4027dfdc${_scopeId2}>`);
                    if (unref(draft).avatarPath) {
                      _push3(`<img${ssrRenderAttr("src", unref(draft).avatarPath)}${ssrRenderAttr("alt", `Portrait de ${unref(draft).firstName || "ce coach"}`)} data-v-4027dfdc${_scopeId2}>`);
                    } else {
                      _push3(`<span aria-hidden="true" data-v-4027dfdc${_scopeId2}>?</span>`);
                    }
                    _push3(`</div><label class="admin-field" data-v-4027dfdc${_scopeId2}><span data-v-4027dfdc${_scopeId2}>Chemin de l’avatar *</span><input${ssrRenderAttr("value", unref(draft).avatarPath)} required data-v-4027dfdc${_scopeId2}></label><label class="admin-field coach-avatar-card__upload" data-v-4027dfdc${_scopeId2}><span data-v-4027dfdc${_scopeId2}>Remplacer le portrait</span><input type="file" accept="image/png,image/jpeg,image/webp"${ssrIncludeBooleanAttr(unref(uploading)) ? " disabled" : ""} data-v-4027dfdc${_scopeId2}><small data-v-4027dfdc${_scopeId2}>JPEG, PNG ou WebP</small></label></aside></div></section><div class="coach-editor__save" data-v-4027dfdc${_scopeId2}>`);
                    if (unref(draft).id) {
                      _push3(`<!--[--><p class="${ssrRenderClass([`is-${unref(autosaveState)}`, "autosave-status"])}" aria-live="polite" data-v-4027dfdc${_scopeId2}><span aria-hidden="true" data-v-4027dfdc${_scopeId2}></span>${ssrInterpolate(unref(autosaveLabel))}</p>`);
                      if (unref(autosaveState) === "error") {
                        _push3(`<button type="button" class="admin-button admin-button--small" data-v-4027dfdc${_scopeId2}>Réessayer</button>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`<!--]-->`);
                    } else {
                      _push3(`<button class="admin-button admin-button--primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-4027dfdc${_scopeId2}>${ssrInterpolate(unref(saving) ? "Création…" : "Créer le coach")}</button>`);
                    }
                    _push3(`</div></form>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div></div>`);
                } else {
                  return [
                    createVNode("div", { class: "coach-admin" }, [
                      createVNode("header", { class: "admin-section-heading" }, [
                        createVNode("div", null, [
                          createVNode("p", { class: "admin-eyebrow" }, "Personnages virtuels"),
                          createVNode("h1", null, "Coaches"),
                          createVNode("p", { class: "admin-muted" }, "Gérez leur identité et attribuez-leur un caractère partagé.")
                        ]),
                        createVNode("button", {
                          class: "admin-button admin-button--primary",
                          onClick: newCoach
                        }, "Nouveau coach")
                      ]),
                      unref(error) ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "admin-notice admin-notice--error"
                      }, toDisplayString(unref(error)), 1)) : createCommentVNode("", true),
                      unref(success) ? (openBlock(), createBlock("p", {
                        key: 1,
                        class: "admin-notice admin-notice--success"
                      }, toDisplayString(unref(success)), 1)) : createCommentVNode("", true),
                      createVNode("div", { class: "coach-admin__workspace" }, [
                        createVNode("aside", { class: "coach-admin__list admin-card" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(coachGroups), (group) => {
                            return openBlock(), createBlock("section", {
                              key: group.caractereId,
                              class: "coach-list-group"
                            }, [
                              createVNode("header", null, [
                                createVNode("strong", null, [
                                  createVNode("span", { "aria-hidden": "true" }, toDisplayString(group.emoticon), 1),
                                  createTextVNode(" " + toDisplayString(group.name), 1)
                                ]),
                                createVNode("span", null, toDisplayString(group.coaches.length), 1)
                              ]),
                              (openBlock(true), createBlock(Fragment, null, renderList(group.coaches, (coach) => {
                                return openBlock(), createBlock("button", {
                                  key: coach.id,
                                  class: { selected: coach.id === unref(selectedId) },
                                  onClick: ($event) => selectCoach(coach)
                                }, [
                                  createVNode("img", {
                                    src: coach.avatarPath,
                                    alt: ""
                                  }, null, 8, ["src"]),
                                  createVNode("span", null, [
                                    createVNode("strong", null, toDisplayString(coach.firstName) + " " + toDisplayString(coach.lastName), 1),
                                    createVNode("small", null, toDisplayString(coach.status === "published" ? "Publié" : coach.status === "draft" ? "Brouillon" : "Désactivé"), 1)
                                  ])
                                ], 10, ["onClick"]);
                              }), 128))
                            ]);
                          }), 128))
                        ]),
                        unref(draft) ? (openBlock(), createBlock("form", {
                          key: 0,
                          class: "coach-editor",
                          onSubmit: withModifiers(saveCoach, ["prevent"])
                        }, [
                          createVNode("section", { class: "admin-card coach-panel coach-identity-panel" }, [
                            createVNode("div", { class: "coach-panel__title" }, [
                              createVNode("div", null, [
                                createVNode("p", { class: "admin-eyebrow" }, "Identité"),
                                createVNode("h2", null, toDisplayString(unref(draft).id ? `${unref(draft).firstName} ${unref(draft).lastName}` : "Nouveau coach"), 1)
                              ]),
                              unref(draft).id ? (openBlock(), createBlock("button", {
                                key: 0,
                                type: "button",
                                class: "admin-button admin-button--danger admin-button--small",
                                disabled: unref(deleting),
                                onClick: deleteCoach
                              }, toDisplayString(unref(deleting) ? "Suppression…" : "Supprimer"), 9, ["disabled"])) : createCommentVNode("", true)
                            ]),
                            createVNode("div", { class: "coach-identity-layout" }, [
                              createVNode("div", { class: "coach-identity-fields" }, [
                                createVNode("div", { class: "coach-fields coach-fields--identity" }, [
                                  createVNode("label", { class: "admin-field" }, [
                                    createVNode("span", null, "Prénom *"),
                                    withDirectives(createVNode("input", {
                                      "onUpdate:modelValue": ($event) => unref(draft).firstName = $event,
                                      required: ""
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, unref(draft).firstName]
                                    ])
                                  ]),
                                  createVNode("label", { class: "admin-field" }, [
                                    createVNode("span", null, "Nom fictif *"),
                                    withDirectives(createVNode("input", {
                                      "onUpdate:modelValue": ($event) => unref(draft).lastName = $event,
                                      required: ""
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, unref(draft).lastName]
                                    ])
                                  ]),
                                  createVNode("label", { class: "admin-field" }, [
                                    createVNode("span", null, "Genre du personnage *"),
                                    withDirectives(createVNode("select", {
                                      "onUpdate:modelValue": ($event) => unref(draft).gender = $event
                                    }, [
                                      createVNode("option", { value: "female" }, "Femme"),
                                      createVNode("option", { value: "male" }, "Homme")
                                    ], 8, ["onUpdate:modelValue"]), [
                                      [vModelSelect, unref(draft).gender]
                                    ])
                                  ]),
                                  createVNode("label", { class: "admin-field" }, [
                                    createVNode("span", null, "Identifiant *"),
                                    withDirectives(createVNode("input", {
                                      "onUpdate:modelValue": ($event) => unref(draft).slug = $event,
                                      required: ""
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, unref(draft).slug]
                                    ])
                                  ]),
                                  createVNode("label", { class: "admin-field" }, [
                                    createVNode("span", null, "Caractère partagé *"),
                                    withDirectives(createVNode("select", {
                                      "onUpdate:modelValue": ($event) => unref(draft).caractereId = $event,
                                      required: ""
                                    }, [
                                      (openBlock(true), createBlock(Fragment, null, renderList(unref(availableCaracteresForDraft), (caractere) => {
                                        return openBlock(), createBlock("option", {
                                          key: caractere.id,
                                          value: caractere.id,
                                          disabled: caractere.status === "disabled"
                                        }, toDisplayString(caractere.emoticon) + " " + toDisplayString(unref(formatCaractereName)(caractere)) + toDisplayString(caractere.status === "disabled" ? " — désactivé" : ""), 9, ["value", "disabled"]);
                                      }), 128))
                                    ], 8, ["onUpdate:modelValue"]), [
                                      [
                                        vModelSelect,
                                        unref(draft).caractereId,
                                        void 0,
                                        { number: true }
                                      ]
                                    ])
                                  ]),
                                  createVNode("label", { class: "admin-field admin-field--color" }, [
                                    createVNode("span", null, "Couleur"),
                                    withDirectives(createVNode("input", {
                                      "onUpdate:modelValue": ($event) => unref(draft).themeColor = $event,
                                      type: "color"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, unref(draft).themeColor]
                                    ])
                                  ]),
                                  createVNode("label", { class: "admin-field" }, [
                                    createVNode("span", null, "Statut"),
                                    withDirectives(createVNode("select", {
                                      "onUpdate:modelValue": ($event) => unref(draft).status = $event
                                    }, [
                                      createVNode("option", { value: "draft" }, "Brouillon"),
                                      createVNode("option", { value: "published" }, "Publié"),
                                      createVNode("option", { value: "disabled" }, "Désactivé")
                                    ], 8, ["onUpdate:modelValue"]), [
                                      [vModelSelect, unref(draft).status]
                                    ])
                                  ]),
                                  createVNode("label", { class: "admin-field" }, [
                                    createVNode("span", null, "Ordre d’affichage"),
                                    withDirectives(createVNode("input", {
                                      "onUpdate:modelValue": ($event) => unref(draft).sortOrder = $event,
                                      type: "number"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [
                                        vModelText,
                                        unref(draft).sortOrder,
                                        void 0,
                                        { number: true }
                                      ]
                                    ])
                                  ])
                                ]),
                                createVNode("div", { class: "coach-description-fields" }, [
                                  createVNode("label", { class: "admin-field" }, [
                                    createVNode("span", null, "Citation"),
                                    withDirectives(createVNode("input", {
                                      "onUpdate:modelValue": ($event) => unref(draft).description = $event
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, unref(draft).description]
                                    ])
                                  ]),
                                  createVNode("label", { class: "admin-field" }, [
                                    createVNode("span", null, "J’aime"),
                                    withDirectives(createVNode("input", {
                                      "onUpdate:modelValue": ($event) => unref(draft).likes = $event,
                                      placeholder: "Ex. les phrases courtes, les exemples concrets…"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, unref(draft).likes]
                                    ])
                                  ])
                                ])
                              ]),
                              createVNode("aside", { class: "coach-avatar-card" }, [
                                createVNode("div", { class: "coach-avatar-card__portrait" }, [
                                  unref(draft).avatarPath ? (openBlock(), createBlock("img", {
                                    key: 0,
                                    src: unref(draft).avatarPath,
                                    alt: `Portrait de ${unref(draft).firstName || "ce coach"}`
                                  }, null, 8, ["src", "alt"])) : (openBlock(), createBlock("span", {
                                    key: 1,
                                    "aria-hidden": "true"
                                  }, "?"))
                                ]),
                                createVNode("label", { class: "admin-field" }, [
                                  createVNode("span", null, "Chemin de l’avatar *"),
                                  withDirectives(createVNode("input", {
                                    "onUpdate:modelValue": ($event) => unref(draft).avatarPath = $event,
                                    required: ""
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, unref(draft).avatarPath]
                                  ])
                                ]),
                                createVNode("label", { class: "admin-field coach-avatar-card__upload" }, [
                                  createVNode("span", null, "Remplacer le portrait"),
                                  createVNode("input", {
                                    type: "file",
                                    accept: "image/png,image/jpeg,image/webp",
                                    disabled: unref(uploading),
                                    onChange: uploadAvatar
                                  }, null, 40, ["disabled"]),
                                  createVNode("small", null, "JPEG, PNG ou WebP")
                                ])
                              ])
                            ])
                          ]),
                          createVNode("div", { class: "coach-editor__save" }, [
                            unref(draft).id ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                              createVNode("p", {
                                class: ["autosave-status", `is-${unref(autosaveState)}`],
                                "aria-live": "polite"
                              }, [
                                createVNode("span", { "aria-hidden": "true" }),
                                createTextVNode(toDisplayString(unref(autosaveLabel)), 1)
                              ], 2),
                              unref(autosaveState) === "error" ? (openBlock(), createBlock("button", {
                                key: 0,
                                type: "button",
                                class: "admin-button admin-button--small",
                                onClick: autosaveCoach
                              }, "Réessayer")) : createCommentVNode("", true)
                            ], 64)) : (openBlock(), createBlock("button", {
                              key: 1,
                              class: "admin-button admin-button--primary",
                              disabled: unref(saving)
                            }, toDisplayString(unref(saving) ? "Création…" : "Créer le coach"), 9, ["disabled"]))
                          ])
                        ], 32)) : createCommentVNode("", true)
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
                  createVNode("div", { class: "coach-admin" }, [
                    createVNode("header", { class: "admin-section-heading" }, [
                      createVNode("div", null, [
                        createVNode("p", { class: "admin-eyebrow" }, "Personnages virtuels"),
                        createVNode("h1", null, "Coaches"),
                        createVNode("p", { class: "admin-muted" }, "Gérez leur identité et attribuez-leur un caractère partagé.")
                      ]),
                      createVNode("button", {
                        class: "admin-button admin-button--primary",
                        onClick: newCoach
                      }, "Nouveau coach")
                    ]),
                    unref(error) ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "admin-notice admin-notice--error"
                    }, toDisplayString(unref(error)), 1)) : createCommentVNode("", true),
                    unref(success) ? (openBlock(), createBlock("p", {
                      key: 1,
                      class: "admin-notice admin-notice--success"
                    }, toDisplayString(unref(success)), 1)) : createCommentVNode("", true),
                    createVNode("div", { class: "coach-admin__workspace" }, [
                      createVNode("aside", { class: "coach-admin__list admin-card" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(coachGroups), (group) => {
                          return openBlock(), createBlock("section", {
                            key: group.caractereId,
                            class: "coach-list-group"
                          }, [
                            createVNode("header", null, [
                              createVNode("strong", null, [
                                createVNode("span", { "aria-hidden": "true" }, toDisplayString(group.emoticon), 1),
                                createTextVNode(" " + toDisplayString(group.name), 1)
                              ]),
                              createVNode("span", null, toDisplayString(group.coaches.length), 1)
                            ]),
                            (openBlock(true), createBlock(Fragment, null, renderList(group.coaches, (coach) => {
                              return openBlock(), createBlock("button", {
                                key: coach.id,
                                class: { selected: coach.id === unref(selectedId) },
                                onClick: ($event) => selectCoach(coach)
                              }, [
                                createVNode("img", {
                                  src: coach.avatarPath,
                                  alt: ""
                                }, null, 8, ["src"]),
                                createVNode("span", null, [
                                  createVNode("strong", null, toDisplayString(coach.firstName) + " " + toDisplayString(coach.lastName), 1),
                                  createVNode("small", null, toDisplayString(coach.status === "published" ? "Publié" : coach.status === "draft" ? "Brouillon" : "Désactivé"), 1)
                                ])
                              ], 10, ["onClick"]);
                            }), 128))
                          ]);
                        }), 128))
                      ]),
                      unref(draft) ? (openBlock(), createBlock("form", {
                        key: 0,
                        class: "coach-editor",
                        onSubmit: withModifiers(saveCoach, ["prevent"])
                      }, [
                        createVNode("section", { class: "admin-card coach-panel coach-identity-panel" }, [
                          createVNode("div", { class: "coach-panel__title" }, [
                            createVNode("div", null, [
                              createVNode("p", { class: "admin-eyebrow" }, "Identité"),
                              createVNode("h2", null, toDisplayString(unref(draft).id ? `${unref(draft).firstName} ${unref(draft).lastName}` : "Nouveau coach"), 1)
                            ]),
                            unref(draft).id ? (openBlock(), createBlock("button", {
                              key: 0,
                              type: "button",
                              class: "admin-button admin-button--danger admin-button--small",
                              disabled: unref(deleting),
                              onClick: deleteCoach
                            }, toDisplayString(unref(deleting) ? "Suppression…" : "Supprimer"), 9, ["disabled"])) : createCommentVNode("", true)
                          ]),
                          createVNode("div", { class: "coach-identity-layout" }, [
                            createVNode("div", { class: "coach-identity-fields" }, [
                              createVNode("div", { class: "coach-fields coach-fields--identity" }, [
                                createVNode("label", { class: "admin-field" }, [
                                  createVNode("span", null, "Prénom *"),
                                  withDirectives(createVNode("input", {
                                    "onUpdate:modelValue": ($event) => unref(draft).firstName = $event,
                                    required: ""
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, unref(draft).firstName]
                                  ])
                                ]),
                                createVNode("label", { class: "admin-field" }, [
                                  createVNode("span", null, "Nom fictif *"),
                                  withDirectives(createVNode("input", {
                                    "onUpdate:modelValue": ($event) => unref(draft).lastName = $event,
                                    required: ""
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, unref(draft).lastName]
                                  ])
                                ]),
                                createVNode("label", { class: "admin-field" }, [
                                  createVNode("span", null, "Genre du personnage *"),
                                  withDirectives(createVNode("select", {
                                    "onUpdate:modelValue": ($event) => unref(draft).gender = $event
                                  }, [
                                    createVNode("option", { value: "female" }, "Femme"),
                                    createVNode("option", { value: "male" }, "Homme")
                                  ], 8, ["onUpdate:modelValue"]), [
                                    [vModelSelect, unref(draft).gender]
                                  ])
                                ]),
                                createVNode("label", { class: "admin-field" }, [
                                  createVNode("span", null, "Identifiant *"),
                                  withDirectives(createVNode("input", {
                                    "onUpdate:modelValue": ($event) => unref(draft).slug = $event,
                                    required: ""
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, unref(draft).slug]
                                  ])
                                ]),
                                createVNode("label", { class: "admin-field" }, [
                                  createVNode("span", null, "Caractère partagé *"),
                                  withDirectives(createVNode("select", {
                                    "onUpdate:modelValue": ($event) => unref(draft).caractereId = $event,
                                    required: ""
                                  }, [
                                    (openBlock(true), createBlock(Fragment, null, renderList(unref(availableCaracteresForDraft), (caractere) => {
                                      return openBlock(), createBlock("option", {
                                        key: caractere.id,
                                        value: caractere.id,
                                        disabled: caractere.status === "disabled"
                                      }, toDisplayString(caractere.emoticon) + " " + toDisplayString(unref(formatCaractereName)(caractere)) + toDisplayString(caractere.status === "disabled" ? " — désactivé" : ""), 9, ["value", "disabled"]);
                                    }), 128))
                                  ], 8, ["onUpdate:modelValue"]), [
                                    [
                                      vModelSelect,
                                      unref(draft).caractereId,
                                      void 0,
                                      { number: true }
                                    ]
                                  ])
                                ]),
                                createVNode("label", { class: "admin-field admin-field--color" }, [
                                  createVNode("span", null, "Couleur"),
                                  withDirectives(createVNode("input", {
                                    "onUpdate:modelValue": ($event) => unref(draft).themeColor = $event,
                                    type: "color"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, unref(draft).themeColor]
                                  ])
                                ]),
                                createVNode("label", { class: "admin-field" }, [
                                  createVNode("span", null, "Statut"),
                                  withDirectives(createVNode("select", {
                                    "onUpdate:modelValue": ($event) => unref(draft).status = $event
                                  }, [
                                    createVNode("option", { value: "draft" }, "Brouillon"),
                                    createVNode("option", { value: "published" }, "Publié"),
                                    createVNode("option", { value: "disabled" }, "Désactivé")
                                  ], 8, ["onUpdate:modelValue"]), [
                                    [vModelSelect, unref(draft).status]
                                  ])
                                ]),
                                createVNode("label", { class: "admin-field" }, [
                                  createVNode("span", null, "Ordre d’affichage"),
                                  withDirectives(createVNode("input", {
                                    "onUpdate:modelValue": ($event) => unref(draft).sortOrder = $event,
                                    type: "number"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [
                                      vModelText,
                                      unref(draft).sortOrder,
                                      void 0,
                                      { number: true }
                                    ]
                                  ])
                                ])
                              ]),
                              createVNode("div", { class: "coach-description-fields" }, [
                                createVNode("label", { class: "admin-field" }, [
                                  createVNode("span", null, "Citation"),
                                  withDirectives(createVNode("input", {
                                    "onUpdate:modelValue": ($event) => unref(draft).description = $event
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, unref(draft).description]
                                  ])
                                ]),
                                createVNode("label", { class: "admin-field" }, [
                                  createVNode("span", null, "J’aime"),
                                  withDirectives(createVNode("input", {
                                    "onUpdate:modelValue": ($event) => unref(draft).likes = $event,
                                    placeholder: "Ex. les phrases courtes, les exemples concrets…"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, unref(draft).likes]
                                  ])
                                ])
                              ])
                            ]),
                            createVNode("aside", { class: "coach-avatar-card" }, [
                              createVNode("div", { class: "coach-avatar-card__portrait" }, [
                                unref(draft).avatarPath ? (openBlock(), createBlock("img", {
                                  key: 0,
                                  src: unref(draft).avatarPath,
                                  alt: `Portrait de ${unref(draft).firstName || "ce coach"}`
                                }, null, 8, ["src", "alt"])) : (openBlock(), createBlock("span", {
                                  key: 1,
                                  "aria-hidden": "true"
                                }, "?"))
                              ]),
                              createVNode("label", { class: "admin-field" }, [
                                createVNode("span", null, "Chemin de l’avatar *"),
                                withDirectives(createVNode("input", {
                                  "onUpdate:modelValue": ($event) => unref(draft).avatarPath = $event,
                                  required: ""
                                }, null, 8, ["onUpdate:modelValue"]), [
                                  [vModelText, unref(draft).avatarPath]
                                ])
                              ]),
                              createVNode("label", { class: "admin-field coach-avatar-card__upload" }, [
                                createVNode("span", null, "Remplacer le portrait"),
                                createVNode("input", {
                                  type: "file",
                                  accept: "image/png,image/jpeg,image/webp",
                                  disabled: unref(uploading),
                                  onChange: uploadAvatar
                                }, null, 40, ["disabled"]),
                                createVNode("small", null, "JPEG, PNG ou WebP")
                              ])
                            ])
                          ])
                        ]),
                        createVNode("div", { class: "coach-editor__save" }, [
                          unref(draft).id ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                            createVNode("p", {
                              class: ["autosave-status", `is-${unref(autosaveState)}`],
                              "aria-live": "polite"
                            }, [
                              createVNode("span", { "aria-hidden": "true" }),
                              createTextVNode(toDisplayString(unref(autosaveLabel)), 1)
                            ], 2),
                            unref(autosaveState) === "error" ? (openBlock(), createBlock("button", {
                              key: 0,
                              type: "button",
                              class: "admin-button admin-button--small",
                              onClick: autosaveCoach
                            }, "Réessayer")) : createCommentVNode("", true)
                          ], 64)) : (openBlock(), createBlock("button", {
                            key: 1,
                            class: "admin-button admin-button--primary",
                            disabled: unref(saving)
                          }, toDisplayString(unref(saving) ? "Création…" : "Créer le coach"), 9, ["disabled"]))
                        ])
                      ], 32)) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/coaches.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const coaches = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-4027dfdc"]]);

export { coaches as default };
//# sourceMappingURL=coaches-Bo8Kt8gA.mjs.map
