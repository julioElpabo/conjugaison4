import { u as useAdminAuth, _ as __nuxt_component_0, a as __nuxt_component_1, g as getAdminErrorMessage } from './AdminShell-x17k8Gc9.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-icjx6oE7.mjs';
import { defineComponent, ref, useTemplateRef, reactive, computed, watch, withCtx, unref, createVNode, toDisplayString, createTextVNode, openBlock, createBlock, createCommentVNode, Fragment, renderList, withModifiers, withDirectives, vModelText, vModelSelect, vModelCheckbox, Teleport, withKeys, isRef, nextTick, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr, ssrRenderAttr, ssrLooseContain, ssrLooseEqual, ssrRenderTeleport } from 'vue/server-renderer';
import { R as REQUIRED_COACH_REPLY_EVENTS, C as COACH_EVENTS } from '../_/coach.mjs';
import { f as formatCaractereName } from '../_/coach-caractere.mjs';
import { C as COACH_PLACEHOLDERS, u as unknownCoachPlaceholders } from '../_/coach-dialogue.mjs';
import { f as useLanguagePreferences, g as useRoute, u as useHead, n as navigateTo } from './server.mjs';
import { onBeforeRouteLeave } from 'vue-router';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import './state-DjsguMyT.mjs';
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

const COACH_CARACTERE_ICON_GROUPS = [
  {
    label: "Attitude",
    icons: [
      { value: "\u{1F642}", label: "Souriant" },
      { value: "\u{1F60A}", label: "Bienveillant" },
      { value: "\u{1F917}", label: "Chaleureux" },
      { value: "\u{1F60C}", label: "Serein" },
      { value: "\u{1F9D8}", label: "Calme" },
      { value: "\u{1F33F}", label: "Apaisant" },
      { value: "\u2600\uFE0F", label: "Positif" },
      { value: "\u{1F308}", label: "Optimiste" },
      { value: "\u{1F989}", label: "Sage" },
      { value: "\u{1F91D}", label: "Collaboratif" },
      { value: "\u{1F499}", label: "Rassurant" },
      { value: "\u{1FAF6}", label: "Soutenant" }
    ]
  },
  {
    label: "M\xE9thode",
    icons: [
      { value: "\u{1F9ED}", label: "M\xE9thodique" },
      { value: "\u{1F3AF}", label: "Pr\xE9cis" },
      { value: "\u{1F4A1}", label: "Explicatif" },
      { value: "\u{1F9E0}", label: "Analytique" },
      { value: "\u{1F50E}", label: "Observateur" },
      { value: "\u{1F9E9}", label: "Progressif" },
      { value: "\u{1F4DA}", label: "Scolaire" },
      { value: "\u270F\uFE0F", label: "Pratique" },
      { value: "\u{1F4D0}", label: "Structur\xE9" },
      { value: "\u{1F6E0}\uFE0F", label: "Concret" },
      { value: "\u{1F9EA}", label: "Exp\xE9rimental" },
      { value: "\u{1F4DD}", label: "Organis\xE9" }
    ]
  },
  {
    label: "Encouragement",
    icons: [
      { value: "\u2B50", label: "Encourageant" },
      { value: "\u{1F31F}", label: "Valorisant" },
      { value: "\u2728", label: "Inspirant" },
      { value: "\u{1F4AA}", label: "Motivant" },
      { value: "\u{1F44F}", label: "F\xE9licitant" },
      { value: "\u{1F64C}", label: "Enthousiaste" },
      { value: "\u{1F3C6}", label: "Ambitieux" },
      { value: "\u{1F331}", label: "Encourage la progression" },
      { value: "\u{1F33B}", label: "Lumineux" },
      { value: "\u{1F389}", label: "Festif" },
      { value: "\u2705", label: "Validant" },
      { value: "\u2764\uFE0F", label: "Attentionn\xE9" }
    ]
  },
  {
    label: "Rythme et style",
    icons: [
      { value: "\u26A1", label: "Dynamique" },
      { value: "\u{1F680}", label: "Rapide" },
      { value: "\u{1F525}", label: "\xC9nergique" },
      { value: "\u{1F3B5}", label: "Rythm\xE9" },
      { value: "\u{1F388}", label: "L\xE9ger" },
      { value: "\u{1F422}", label: "Patient" },
      { value: "\u{1F41D}", label: "Actif" },
      { value: "\u{1F98A}", label: "Astucieux" },
      { value: "\u{1F43C}", label: "Doux" },
      { value: "\u{1F42C}", label: "Joueur" },
      { value: "\u{1F98B}", label: "Cr\xE9atif" },
      { value: "\u{1F3A8}", label: "Imaginatif" }
    ]
  }
];

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "caracteres",
  __ssrInlineRender: true,
  setup(__props) {
    const EVENT_LABELS = {
      introduction: "Présentation",
      question: "Question",
      correct: "Bonne réponse",
      "correct-alternative": "Bonne réponse avec variante",
      incorrect: "Mauvaise réponse",
      "cod-before": "COD avant",
      "cod-after": "COD après",
      coi: "COI",
      encouragement: "Encouragement",
      "help-announcement": "Annonce d’aide",
      streak: "Série réussie",
      finish: "Fin",
      restart: "Recommencer"
    };
    const EVENT_DESCRIPTIONS = {
      introduction: "Premières phrases affichées à l’ouverture du chat.",
      question: "Transitions éventuelles avant une nouvelle question.",
      correct: "Réactions après une réponse entièrement correcte.",
      "correct-alternative": "Réactions lorsqu’une autre formulation correcte est aussi acceptée.",
      incorrect: "Réactions après une réponse fausse, avant l’explication.",
      "cod-before": "Phrases liées aux compléments d’objet placés avant le verbe.",
      "cod-after": "Phrases liées aux compléments d’objet placés après le verbe.",
      coi: "Phrases liées aux compléments d’objet indirects.",
      encouragement: "Relances positives pour aider l’élève à continuer.",
      "help-announcement": "Phrase affichée avant de proposer l’aide après une attente ou plusieurs erreurs.",
      streak: "Réactions après plusieurs bonnes réponses consécutives.",
      finish: "Phrases affichées à la fin de l’exercice.",
      restart: "Phrases affichées lorsque l’élève recommence."
    };
    const REQUIRED_REPLY_EVENTS = new Set(REQUIRED_COACH_REPLY_EVENTS);
    const REACTION_EVENTS = ["correct", "incorrect", "streak", "finish"];
    const MEDIA_FREQUENCY_OPTIONS = [
      { label: "Aucun", value: 0 },
      { label: "Rarement", value: 0.2 },
      { label: "Moitié", value: 0.5 },
      { label: "Souvent", value: 0.8 },
      { label: "Toujours", value: 1 }
    ];
    const placeholdersLabel = COACH_PLACEHOLDERS.map((item) => `{${item}}`).join(" · ");
    const { user, handleUnauthorized } = useAdminAuth();
    const { localePath } = useLanguagePreferences();
    const route = useRoute();
    const caracteres2 = ref([]);
    const coaches = ref([]);
    const media = ref([]);
    const helpApproaches = ref([]);
    const draft = ref(null);
    const selectedId = ref(null);
    const tab = ref("caracteres");
    const loading = ref(false);
    const saving = ref(false);
    const autosaveState = ref("idle");
    const uploading = ref(false);
    const openingHelp = ref(false);
    const duplicatingCaractere = ref(false);
    const deletingCaractere = ref(false);
    const error = ref("");
    const success = ref("");
    const selectedMediaId = ref(null);
    const iconPickerOpen = ref(false);
    const approachManagerOpen = ref(false);
    const approachDrafts = ref([]);
    const newApproachName = ref("");
    const approachSaving = ref(null);
    const approachError = ref("");
    const iconPicker = useTemplateRef("iconPicker");
    const mediaDraft = reactive({ id: 0, name: "", filePath: "", mediaType: "animation", category: "success", altText: "", rightsStatus: "pending", safetyStatus: "pending", isActive: true, fileSize: null });
    let loaded = false;
    let autosaveTimer = null;
    let autosavePromise = null;
    let lastSavedSnapshot = "";
    const caractereCoaches = computed(() => draft.value?.id ? coaches.value.filter((coach) => coach.caractereId === draft.value?.id) : []);
    const sortedCaracteres = computed(() => [...caracteres2.value].sort((left, right) => left.sortOrder - right.sortOrder || formatCaractereName(left).localeCompare(formatCaractereName(right), "fr") || left.id - right.id));
    const caractereIconGroups = computed(() => {
      const configuredIcons = new Set(COACH_CARACTERE_ICON_GROUPS.flatMap((group) => group.icons.map((icon) => icon.value)));
      const customIcons = [...new Set(caracteres2.value.map((caractere) => caractere.emoticon.trim()).filter((icon) => icon && !configuredIcons.has(icon)))];
      return customIcons.length ? [{ label: "Déjà utilisées", icons: customIcons.map((value) => ({ value, label: "Icône existante" })) }, ...COACH_CARACTERE_ICON_GROUPS] : COACH_CARACTERE_ICON_GROUPS;
    });
    const responseMediaGroups = computed(() => [
      {
        key: "correct",
        title: "Bonne réponse",
        description: "GIF animés et émojis qui peuvent féliciter l’utilisateur.",
        items: media.value.filter((item) => (item.mediaType === "animation" || item.mediaType === "emoji") && item.category === "success")
      },
      {
        key: "incorrect",
        title: "Mauvaise réponse",
        description: "GIF animés et émojis qui peuvent accompagner une correction.",
        items: media.value.filter((item) => (item.mediaType === "animation" || item.mediaType === "emoji") && item.category === "encouragement")
      }
    ]);
    const otherReactionMedia = computed(() => {
      const responseIds = new Set(responseMediaGroups.value.flatMap((group) => group.items.map((item) => item.id)));
      return media.value.filter((item) => !responseIds.has(item.id));
    });
    useHead({ title: "Caractères — Administration" });
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const autosaveLabel = computed(() => {
      if (autosaveState.value === "saving") return "Enregistrement…";
      if (autosaveState.value === "dirty") return draft.value?.id ? "Modification en attente…" : "Complète les champs obligatoires…";
      if (autosaveState.value === "error") return "Échec de l’enregistrement";
      return "Toutes les modifications sont enregistrées";
    });
    function cancelScheduledAutosave() {
      if (autosaveTimer) clearTimeout(autosaveTimer);
      autosaveTimer = null;
    }
    async function openIconPicker() {
      iconPickerOpen.value = true;
      await nextTick();
      const selected = iconPicker.value?.querySelector('[aria-pressed="true"]');
      (selected || iconPicker.value?.querySelector("button"))?.focus();
    }
    function closeIconPicker() {
      iconPickerOpen.value = false;
    }
    function openApproachManager() {
      approachDrafts.value = clone(helpApproaches.value);
      approachError.value = "";
      newApproachName.value = "";
      approachManagerOpen.value = true;
    }
    function closeApproachManager() {
      if (!approachSaving.value) approachManagerOpen.value = false;
    }
    async function reloadHelpApproaches() {
      const response = await $fetch("/api/admin/coach-help-approaches");
      helpApproaches.value = response.approaches;
      approachDrafts.value = clone(response.approaches);
      for (const caractere of caracteres2.value) {
        const approach = response.approaches.find((item) => item.id === caractere.helpApproachId);
        if (approach) Object.assign(caractere, { helpApproachName: approach.name, helpApproach: approach.engineKey });
      }
      if (draft.value) {
        const approach = response.approaches.find((item) => item.id === draft.value?.helpApproachId);
        if (approach) Object.assign(draft.value, { helpApproachName: approach.name, helpApproach: approach.engineKey });
      }
    }
    async function selectHelpApproach(event) {
      const value = event.target.value;
      if (value === "manage") {
        openApproachManager();
        await nextTick();
        event.target.value = String(draft.value?.helpApproachId || "");
        return;
      }
      if (!draft.value) return;
      const approach = helpApproaches.value.find((item) => item.id === Number(value));
      if (!approach) return;
      draft.value.helpApproachId = approach.id;
      draft.value.helpApproachName = approach.name;
      draft.value.helpApproach = approach.engineKey;
    }
    async function createHelpApproach() {
      const name = newApproachName.value.trim();
      if (!name || approachSaving.value) return;
      approachSaving.value = "new";
      approachError.value = "";
      try {
        await $fetch("/api/admin/coach-help-approaches", { method: "POST", body: {
          name,
          engineKey: "complete-avec-reponses",
          status: "draft",
          sortOrder: Math.max(0, ...helpApproaches.value.map((item) => item.sortOrder)) + 1
        } });
        newApproachName.value = "";
        await reloadHelpApproaches();
      } catch (caught) {
        approachError.value = getAdminErrorMessage(caught, "Impossible d’ajouter cette approche.");
      } finally {
        approachSaving.value = null;
      }
    }
    async function saveHelpApproach(approach) {
      if (!approach.name.trim() || approachSaving.value) return;
      approachSaving.value = approach.id;
      approachError.value = "";
      try {
        await $fetch(`/api/admin/coach-help-approaches/${approach.id}`, { method: "PUT", body: approach });
        await reloadHelpApproaches();
      } catch (caught) {
        approachError.value = getAdminErrorMessage(caught, "Impossible de modifier cette approche.");
      } finally {
        approachSaving.value = null;
      }
    }
    async function deleteHelpApproach(approach) {
      if (approachSaving.value || !(void 0).confirm(`Supprimer l’approche « ${approach.name} » ?`)) return;
      approachSaving.value = approach.id;
      approachError.value = "";
      try {
        await $fetch(`/api/admin/coach-help-approaches/${approach.id}`, { method: "DELETE" });
        await reloadHelpApproaches();
      } catch (caught) {
        approachError.value = getAdminErrorMessage(caught, "Impossible de supprimer cette approche.");
      } finally {
        approachSaving.value = null;
      }
    }
    async function selectCaractereIcon(icon) {
      if (!draft.value) return;
      draft.value.emoticon = icon;
      closeIconPicker();
      await nextTick();
      await autosaveCaractere();
    }
    function setCaractereDraft(caractere) {
      cancelScheduledAutosave();
      selectedId.value = caractere.id || null;
      draft.value = clone(caractere);
      lastSavedSnapshot = caractere.id ? JSON.stringify(draft.value) : "";
      autosaveState.value = caractere.id ? "idle" : "dirty";
      error.value = "";
      success.value = "";
    }
    async function selectCaractere(caractere) {
      await autosaveCaractere();
      setCaractereDraft(caractere);
    }
    async function newCaractere() {
      await autosaveCaractere();
      selectedId.value = null;
      const assignments = media.value.filter((item) => item.isActive && (item.mediaType === "emoji" || item.mediaType === "animation")).map((item) => ({ mediaId: item.id, eventType: mediaDefaultEvent(item), weight: 1, isActive: true }));
      const approach = helpApproaches.value[0];
      setCaractereDraft({ id: 0, slug: "", masculineName: "", emoticon: "🙂", pedagogicalStyle: "", helpApproachId: approach?.id || 0, helpApproachName: approach?.name || "", helpApproach: approach?.engineKey || "complete-avec-reponses", status: "draft", sortOrder: caracteres2.value.length + 1, replies: [], media: clone(media.value), assignments, rules: [] });
    }
    function duplicatedSlug(sourceSlug) {
      const existingSlugs = new Set(caracteres2.value.map((caractere) => caractere.slug));
      const root = `${sourceSlug.slice(0, 74)}-copie`;
      let candidate = root;
      let index = 2;
      while (existingSlugs.has(candidate)) {
        const suffix = `-${index}`;
        candidate = `${root.slice(0, 80 - suffix.length)}${suffix}`;
        index += 1;
      }
      return candidate;
    }
    function duplicatedName(name) {
      return `${name.slice(0, 72)} (copie)`;
    }
    async function duplicateCaractere() {
      if (!draft.value?.id || duplicatingCaractere.value) return;
      duplicatingCaractere.value = true;
      error.value = "";
      success.value = "";
      try {
        await autosaveCaractere();
        const source = draft.value;
        if (!source?.id) return;
        const copy = clone(source);
        copy.id = 0;
        copy.slug = duplicatedSlug(source.slug);
        copy.masculineName = duplicatedName(source.masculineName);
        copy.status = "draft";
        copy.sortOrder = Math.max(0, ...caracteres2.value.map((caractere) => caractere.sortOrder)) + 1;
        copy.replies = copy.replies.map((reply) => ({ ...reply, id: 0 }));
        setCaractereDraft(copy);
        await autosaveCaractere();
        if (draft.value?.id) success.value = "Caractère et configuration d’aide dupliqués en brouillon.";
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible de dupliquer ce caractère.");
      } finally {
        duplicatingCaractere.value = false;
      }
    }
    async function load() {
      loading.value = true;
      try {
        const [caractereResponse, coachResponse, mediaResponse, approachResponse] = await Promise.all([
          $fetch("/api/admin/coach-caracteres"),
          $fetch("/api/admin/coaches"),
          $fetch("/api/admin/coach-media"),
          $fetch("/api/admin/coach-help-approaches")
        ]);
        caracteres2.value = caractereResponse.caracteres;
        coaches.value = coachResponse.coaches;
        media.value = mediaResponse.media;
        helpApproaches.value = approachResponse.approaches;
        if (draft.value?.id) {
          const refreshed = caracteres2.value.find((item) => item.id === draft.value?.id);
          if (refreshed) setCaractereDraft(refreshed);
        } else if (!draft.value) {
          const requestedId = Number(route.query.caractere);
          const requested = Number.isInteger(requestedId) ? caracteres2.value.find((item) => item.id === requestedId) : void 0;
          if (requested || caracteres2.value[0]) setCaractereDraft(requested || caracteres2.value[0]);
        }
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible de charger les caractères.");
      } finally {
        loading.value = false;
      }
    }
    function caractereCanBeSaved(caractere) {
      if (!caractere.slug.trim() || !caractere.masculineName.trim() || !caractere.emoticon.trim() || !caractere.pedagogicalStyle.trim() || !Number.isInteger(caractere.sortOrder)) return false;
      if (caractere.replies.some((reply) => !reply.content.trim() || unknownCoachPlaceholders(reply.content).length)) return false;
      if (caractere.status !== "published") return true;
      return [...REQUIRED_REPLY_EVENTS].every((eventType) => caractere.replies.some((reply) => reply.eventType === eventType && reply.isActive && reply.content.trim()));
    }
    function refreshCaractereInList(saved) {
      const item = caracteres2.value.find((caractere) => caractere.id === saved.id);
      if (item) Object.assign(item, clone(saved));
      else caracteres2.value.push(clone(saved));
    }
    function scheduleAutosave() {
      cancelScheduledAutosave();
      autosaveTimer = setTimeout(() => {
        void autosaveCaractere();
      }, 650);
    }
    async function autosaveCaractere() {
      cancelScheduledAutosave();
      if (autosavePromise) {
        await autosavePromise;
        if (draft.value && JSON.stringify(draft.value) !== lastSavedSnapshot) scheduleAutosave();
        return;
      }
      const current = draft.value;
      if (!current) return;
      const snapshot = JSON.stringify(current);
      if (current.id && snapshot === lastSavedSnapshot) return;
      if (!caractereCanBeSaved(current)) {
        autosaveState.value = "dirty";
        return;
      }
      const payload = clone(current);
      const caractereId = current.id;
      autosaveState.value = "saving";
      error.value = "";
      autosavePromise = caractereId ? $fetch(`/api/admin/coach-caracteres/${caractereId}`, { method: "PUT", body: payload }).then(() => void 0) : $fetch("/api/admin/coach-caracteres", {
        method: "POST",
        body: payload
      }).then((result) => {
        payload.id = result.id;
        if (draft.value === current) {
          draft.value.id = result.id;
          selectedId.value = result.id;
        }
      });
      try {
        await autosavePromise;
        const savedSnapshot = JSON.stringify(payload);
        lastSavedSnapshot = savedSnapshot;
        refreshCaractereInList(payload);
        if (draft.value?.id === payload.id && JSON.stringify(draft.value) === savedSnapshot) autosaveState.value = "saved";
        else if (draft.value?.id === payload.id) scheduleAutosave();
      } catch (caught) {
        autosaveState.value = "error";
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible d’enregistrer automatiquement ce caractère.");
      } finally {
        autosavePromise = null;
      }
    }
    async function openCaractereHelp() {
      await autosaveCaractere();
      const caractere = draft.value;
      if (!caractere?.id) {
        error.value = "Complète d’abord les champs obligatoires du caractère.";
        return;
      }
      openingHelp.value = true;
      error.value = "";
      try {
        await navigateTo({ path: localePath("/admin/helps"), query: { caractere: caractere.id } });
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible d’ouvrir l’aide de ce caractère.");
      } finally {
        openingHelp.value = false;
      }
    }
    async function disableCaractere() {
      if (!draft.value?.id || !(void 0).confirm(`Désactiver le caractère « ${formatCaractereName(draft.value)} » ?`)) return;
      cancelScheduledAutosave();
      try {
        if (autosavePromise) await autosavePromise;
        await $fetch(`/api/admin/coach-caracteres/${draft.value.id}`, { method: "DELETE" });
        await load();
        success.value = "Caractère désactivé.";
      } catch (caught) {
        error.value = getAdminErrorMessage(caught, "Impossible de désactiver ce caractère.");
      }
    }
    async function deleteCaractere() {
      const caractere = draft.value;
      if (!caractere?.id) return;
      const coachWarning = caractereCoaches.value.length ? `

${caractereCoaches.value.length} coach${caractereCoaches.value.length > 1 ? "es" : ""} utilisant ce caractère ${caractereCoaches.value.length > 1 ? "seront détachés" : "sera détaché"}.` : "";
      if (!(void 0).confirm(`Supprimer définitivement le caractère « ${formatCaractereName(caractere)} » ?

Ses textes, règles et associations seront supprimés.${coachWarning}

Cette action est irréversible.`)) return;
      cancelScheduledAutosave();
      deletingCaractere.value = true;
      error.value = "";
      success.value = "";
      try {
        if (autosavePromise) await autosavePromise;
        await $fetch(`/api/admin/coach-caracteres/${caractere.id}/permanent`, { method: "DELETE" });
        draft.value = null;
        selectedId.value = null;
        lastSavedSnapshot = "";
        await load();
        success.value = "Caractère supprimé définitivement.";
      } catch (caught) {
        error.value = getAdminErrorMessage(caught, "Impossible de supprimer définitivement ce caractère.");
      } finally {
        deletingCaractere.value = false;
      }
    }
    function repliesFor(eventType) {
      return draft.value?.replies.filter((reply) => reply.eventType === eventType) || [];
    }
    function activeReplyCount(eventType) {
      return repliesFor(eventType).filter((reply) => reply.isActive).length;
    }
    function addReply(eventType) {
      draft.value?.replies.push({ id: 0, eventType, content: "", weight: 1, isActive: true });
    }
    function removeReply(reply) {
      if (!draft.value) return;
      const index = draft.value.replies.indexOf(reply);
      if (index >= 0) draft.value.replies.splice(index, 1);
    }
    function mediaDefaultEvent(item) {
      if (item.category === "success") return "correct";
      if (item.category === "encouragement") return "incorrect";
      if (item.category === "finish") return "finish";
      if (item.category === "welcome") return "introduction";
      return "question";
    }
    function assignmentFor(id, eventType) {
      return draft.value?.assignments.find((item) => item.mediaId === id && (!eventType || item.eventType === eventType));
    }
    function assignedMediaCount(items, eventType) {
      return items.filter((item) => assignmentFor(item.id, eventType)?.isActive).length;
    }
    function toggleMedia(item) {
      if (!draft.value) return;
      const index = draft.value.assignments.findIndex((assignment) => assignment.mediaId === item.id);
      if (index >= 0) draft.value.assignments.splice(index, 1);
      else draft.value.assignments.push({ mediaId: item.id, eventType: mediaDefaultEvent(item), weight: 1, isActive: true });
    }
    function toggleResponseMedia(item, eventType) {
      if (!draft.value) return;
      const existing = assignmentFor(item.id, eventType);
      if (existing) {
        draft.value.assignments = draft.value.assignments.filter((assignment) => !(assignment.mediaId === item.id && assignment.eventType === eventType));
        return;
      }
      draft.value.assignments = draft.value.assignments.filter((assignment) => assignment.mediaId !== item.id);
      draft.value.assignments.push({ mediaId: item.id, eventType, weight: 1, isActive: true });
      ensureRule(eventType);
    }
    function setResponseMediaSelection(eventType, selected) {
      if (!draft.value) return;
      const group = responseMediaGroups.value.find((item) => item.key === eventType);
      if (!group) return;
      const mediaIds = new Set(group.items.map((item) => item.id));
      draft.value.assignments = draft.value.assignments.filter((assignment) => !mediaIds.has(assignment.mediaId));
      if (selected) {
        draft.value.assignments.push(...group.items.map((item) => ({ mediaId: item.id, eventType, weight: 1, isActive: true })));
        ensureRule(eventType);
      }
    }
    function inputValue(event) {
      return event.target.value;
    }
    function updateAssignment(id, field, value) {
      const assignment = assignmentFor(id);
      if (!assignment) return;
      if (field === "eventType") assignment.eventType = value;
      else assignment.weight = Number(value);
    }
    function ruleFor(eventType) {
      return draft.value?.rules.find((item) => item.eventType === eventType);
    }
    function ensureRule(eventType) {
      if (draft.value && !ruleFor(eventType)) {
        draft.value.rules.push({ eventType, mediaProbability: 0.2, animationProbability: 0.2, emojiProbability: 0.2, cooldownQuestions: 2 });
      }
    }
    function updateRule(eventType, field, value) {
      const rule = ruleFor(eventType);
      if (!rule) return;
      rule[field] = Number(value);
      rule.mediaProbability = Math.max(rule.animationProbability, rule.emojiProbability);
    }
    async function deleteMedia(item) {
      if (!(void 0).confirm(`Supprimer définitivement « ${item.name} » ? Cette action supprimera ce média pour tous les caractères.`)) return;
      cancelScheduledAutosave();
      error.value = "";
      success.value = "";
      try {
        if (autosavePromise) await autosavePromise;
        await autosaveCaractere();
        await $fetch(`/api/admin/coach-media/${item.id}`, { method: "DELETE" });
        media.value = media.value.filter((mediaItem) => mediaItem.id !== item.id);
        if (draft.value) {
          draft.value.media = draft.value.media.filter((mediaItem) => mediaItem.id !== item.id);
          draft.value.assignments = draft.value.assignments.filter((assignment) => assignment.mediaId !== item.id);
          lastSavedSnapshot = JSON.stringify(draft.value);
        }
        caracteres2.value.forEach((caractere) => {
          caractere.media = caractere.media.filter((mediaItem) => mediaItem.id !== item.id);
          caractere.assignments = caractere.assignments.filter((assignment) => assignment.mediaId !== item.id);
        });
        if (selectedMediaId.value === item.id) selectMedia();
        success.value = "Média supprimé définitivement.";
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible de supprimer ce média.");
      }
    }
    function selectMedia(item) {
      selectedMediaId.value = item?.id || null;
      Object.assign(mediaDraft, item ? clone(item) : { id: 0, name: "", filePath: "", mediaType: "animation", category: "success", altText: "", rightsStatus: "pending", safetyStatus: "pending", isActive: true, fileSize: null });
    }
    async function uploadMedia(event) {
      const file = event.target.files?.[0];
      if (!file) return;
      uploading.value = true;
      error.value = "";
      try {
        const data = new FormData();
        data.append("file", file);
        const result = await $fetch("/api/admin/coach-media/upload", { method: "POST", body: data });
        mediaDraft.filePath = result.path;
        mediaDraft.fileSize = result.size;
        mediaDraft.mediaType = result.mediaType;
        if (!mediaDraft.name) mediaDraft.name = file.name.replace(/\.[^.]+$/u, "");
      } catch (caught) {
        error.value = getAdminErrorMessage(caught, "Impossible d’envoyer ce fichier.");
      } finally {
        uploading.value = false;
      }
    }
    async function saveMedia() {
      saving.value = true;
      error.value = "";
      success.value = "";
      try {
        if (mediaDraft.id) await $fetch(`/api/admin/coach-media/${mediaDraft.id}`, { method: "PUT", body: mediaDraft });
        else await $fetch("/api/admin/coach-media", { method: "POST", body: mediaDraft });
        await load();
        selectMedia();
        success.value = "Média enregistré.";
      } catch (caught) {
        error.value = getAdminErrorMessage(caught, "Impossible d’enregistrer ce média.");
      } finally {
        saving.value = false;
      }
    }
    watch(draft, (current) => {
      if (loading.value || saving.value || !current) return;
      const snapshot = JSON.stringify(current);
      if (current.id && snapshot === lastSavedSnapshot) return;
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
    onBeforeRouteLeave(async () => {
      await autosaveCaractere();
    });
    watch([iconPickerOpen, approachManagerOpen], ([iconOpen, approachOpen]) => {
      return;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminAuthBoundary = __nuxt_component_0;
      const _component_AdminShell = __nuxt_component_1;
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(ssrRenderComponent(_component_AdminAuthBoundary, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_AdminShell, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="caractere-admin" data-v-94e140ef${_scopeId2}><header class="admin-section-heading" data-v-94e140ef${_scopeId2}><div data-v-94e140ef${_scopeId2}><p class="admin-eyebrow" data-v-94e140ef${_scopeId2}>Contenu mutualisé</p><h1 data-v-94e140ef${_scopeId2}>Caractères</h1><p class="admin-muted" data-v-94e140ef${_scopeId2}>Une modification s’applique immédiatement à tous les coaches qui partagent ce caractère.</p></div><button class="admin-button admin-button--primary" data-v-94e140ef${_scopeId2}>${ssrInterpolate(unref(tab) === "caracteres" ? "Nouveau caractère" : "Nouveau média")}</button></header><div class="caractere-tabs" data-v-94e140ef${_scopeId2}><button class="${ssrRenderClass({ active: unref(tab) === "caracteres" })}" data-v-94e140ef${_scopeId2}>Caractères</button><button class="${ssrRenderClass({ active: unref(tab) === "media" })}" data-v-94e140ef${_scopeId2}>Médiathèque <span data-v-94e140ef${_scopeId2}>${ssrInterpolate(unref(media).length)}</span></button></div>`);
                  if (unref(error)) {
                    _push3(`<p class="admin-notice admin-notice--error" data-v-94e140ef${_scopeId2}>${ssrInterpolate(unref(error))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(success)) {
                    _push3(`<p class="admin-notice admin-notice--success" data-v-94e140ef${_scopeId2}>${ssrInterpolate(unref(success))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(tab) === "caracteres") {
                    _push3(`<div class="caractere-workspace" data-v-94e140ef${_scopeId2}><aside class="caractere-list admin-card" data-v-94e140ef${_scopeId2}><!--[-->`);
                    ssrRenderList(unref(sortedCaracteres), (caractere) => {
                      _push3(`<button class="${ssrRenderClass({ selected: caractere.id === unref(selectedId), "is-disabled": caractere.status === "disabled" })}" data-v-94e140ef${_scopeId2}><span class="caractere-list__mark" data-v-94e140ef${_scopeId2}>${ssrInterpolate(caractere.emoticon)}</span><span data-v-94e140ef${_scopeId2}><strong data-v-94e140ef${_scopeId2}>${ssrInterpolate(unref(formatCaractereName)(caractere))}</strong><small data-v-94e140ef${_scopeId2}>`);
                      if (caractere.status === "disabled") {
                        _push3(`<span data-v-94e140ef${_scopeId2}>Désactivé · </span>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`${ssrInterpolate(caractere.replies.length)} répliques · ${ssrInterpolate(caractere.assignments.length)} médias</small></span></button>`);
                    });
                    _push3(`<!--]--></aside>`);
                    if (unref(draft)) {
                      _push3(`<form class="caractere-editor" data-v-94e140ef${_scopeId2}><section class="admin-card caractere-panel" data-v-94e140ef${_scopeId2}><div class="panel-title caractere-profile-title" data-v-94e140ef${_scopeId2}><div data-v-94e140ef${_scopeId2}><p class="admin-eyebrow" data-v-94e140ef${_scopeId2}>Profil partagé</p><h2 data-v-94e140ef${_scopeId2}>${ssrInterpolate(unref(draft).masculineName ? unref(formatCaractereName)(unref(draft)) : "Nouveau caractère")}</h2></div><div class="admin-field emoticon-field" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Icône *</span><button type="button" class="emoticon-trigger" aria-haspopup="dialog" data-v-94e140ef${_scopeId2}><span aria-hidden="true" data-v-94e140ef${_scopeId2}>${ssrInterpolate(unref(draft).emoticon)}</span><small data-v-94e140ef${_scopeId2}>Modifier</small></button></div><div class="caractere-profile-actions" data-v-94e140ef${_scopeId2}><button type="button" class="admin-button admin-button--primary caractere-help-button"${ssrIncludeBooleanAttr(unref(openingHelp) || unref(duplicatingCaractere) || unref(deletingCaractere)) ? " disabled" : ""} data-v-94e140ef${_scopeId2}>${ssrInterpolate(unref(openingHelp) ? "Ouverture de l’aide…" : "Voir l’aide automatique")}</button>`);
                      if (unref(draft).id) {
                        _push3(`<button type="button" class="admin-button admin-button--small"${ssrIncludeBooleanAttr(unref(openingHelp) || unref(duplicatingCaractere) || unref(deletingCaractere)) ? " disabled" : ""} data-v-94e140ef${_scopeId2}>${ssrInterpolate(unref(duplicatingCaractere) ? "Duplication…" : "Dupliquer")}</button>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      if (unref(draft).id) {
                        _push3(`<button type="button" class="admin-button admin-button--danger admin-button--small"${ssrIncludeBooleanAttr(unref(duplicatingCaractere) || unref(deletingCaractere)) ? " disabled" : ""} data-v-94e140ef${_scopeId2}>Désactiver</button>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      if (unref(draft).id) {
                        _push3(`<button type="button" class="admin-button admin-button--danger admin-button--small caractere-delete-button"${ssrIncludeBooleanAttr(unref(duplicatingCaractere) || unref(deletingCaractere)) ? " disabled" : ""} data-v-94e140ef${_scopeId2}>${ssrInterpolate(unref(deletingCaractere) ? "Suppression…" : "Supprimer")}</button>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`</div></div>`);
                      if (unref(draft).id) {
                        _push3(`<div class="caractere-coaches" data-v-94e140ef${_scopeId2}><div data-v-94e140ef${_scopeId2}><strong data-v-94e140ef${_scopeId2}>Coaches utilisant ce caractère</strong><small data-v-94e140ef${_scopeId2}>${ssrInterpolate(unref(caractereCoaches).length)} coach${ssrInterpolate(unref(caractereCoaches).length > 1 ? "es" : "")}</small></div>`);
                        if (unref(caractereCoaches).length) {
                          _push3(`<div class="caractere-coaches__portraits" data-v-94e140ef${_scopeId2}><!--[-->`);
                          ssrRenderList(unref(caractereCoaches), (coach) => {
                            _push3(ssrRenderComponent(_component_NuxtLink, {
                              key: coach.id,
                              to: { path: unref(localePath)("/admin/coaches"), query: { coach: coach.id } },
                              title: `Modifier ${coach.firstName} ${coach.lastName}`,
                              "aria-label": `Ouvrir la fiche de ${coach.firstName} ${coach.lastName}`
                            }, {
                              default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                                if (_push4) {
                                  _push4(`<img${ssrRenderAttr("src", coach.avatarPath)} alt="" data-v-94e140ef${_scopeId3}><span data-v-94e140ef${_scopeId3}>${ssrInterpolate(coach.firstName)}</span>`);
                                } else {
                                  return [
                                    createVNode("img", {
                                      src: coach.avatarPath,
                                      alt: ""
                                    }, null, 8, ["src"]),
                                    createVNode("span", null, toDisplayString(coach.firstName), 1)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent3, _scopeId2));
                          });
                          _push3(`<!--]--></div>`);
                        } else {
                          _push3(`<p data-v-94e140ef${_scopeId2}>Aucun coach n’utilise encore ce caractère.</p>`);
                        }
                        _push3(`</div>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`<div class="caractere-fields" data-v-94e140ef${_scopeId2}><label class="admin-field" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Nom *</span><input${ssrRenderAttr("value", unref(draft).masculineName)} required data-v-94e140ef${_scopeId2}></label><label class="admin-field" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Identifiant *</span><input${ssrRenderAttr("value", unref(draft).slug)} required data-v-94e140ef${_scopeId2}></label><label class="admin-field" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Ordre</span><input${ssrRenderAttr("value", unref(draft).sortOrder)} type="number" data-v-94e140ef${_scopeId2}></label><label class="admin-field wide" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Description courte *</span><textarea rows="3" required data-v-94e140ef${_scopeId2}>${ssrInterpolate(unref(draft).pedagogicalStyle)}</textarea></label><label class="admin-field" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Approche de l’aide</span><select${ssrRenderAttr("value", unref(draft).helpApproachId)} data-v-94e140ef${_scopeId2}><!--[-->`);
                      ssrRenderList(unref(helpApproaches), (approach) => {
                        _push3(`<option${ssrRenderAttr("value", approach.id)} data-v-94e140ef${_scopeId2}>${ssrInterpolate(approach.name)}</option>`);
                      });
                      _push3(`<!--]--><option disabled data-v-94e140ef${_scopeId2}>──────────</option><option value="manage" data-v-94e140ef${_scopeId2}>Modifier les approches…</option></select></label><label class="admin-field" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Statut</span><select data-v-94e140ef${_scopeId2}><option value="draft" data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(unref(draft).status) ? ssrLooseContain(unref(draft).status, "draft") : ssrLooseEqual(unref(draft).status, "draft")) ? " selected" : ""}${_scopeId2}>Brouillon</option><option value="published" data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(unref(draft).status) ? ssrLooseContain(unref(draft).status, "published") : ssrLooseEqual(unref(draft).status, "published")) ? " selected" : ""}${_scopeId2}>Publié</option><option value="disabled" data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(unref(draft).status) ? ssrLooseContain(unref(draft).status, "disabled") : ssrLooseEqual(unref(draft).status, "disabled")) ? " selected" : ""}${_scopeId2}>Désactivé</option></select></label></div></section><section class="admin-card caractere-panel dialogue-panel" data-v-94e140ef${_scopeId2}><div class="panel-title" data-v-94e140ef${_scopeId2}><div data-v-94e140ef${_scopeId2}><p class="admin-eyebrow" data-v-94e140ef${_scopeId2}>Dialogue partagé</p><h2 data-v-94e140ef${_scopeId2}>Textes du caractère</h2></div><strong data-v-94e140ef${_scopeId2}>${ssrInterpolate(unref(draft).replies.length)} phrase(s)</strong></div><p class="admin-muted dialogue-intro" data-v-94e140ef${_scopeId2}>Les phrases sont classées selon le moment où elles peuvent apparaître dans la conversation. Ouvrez une catégorie pour gérer son contenu. <span class="required-note" data-v-94e140ef${_scopeId2}>* Catégorie obligatoire</span></p><details class="variables-help" data-v-94e140ef${_scopeId2}><summary data-v-94e140ef${_scopeId2}>Variables utilisables dans les phrases</summary><p data-v-94e140ef${_scopeId2}>${ssrInterpolate(unref(placeholdersLabel))}</p></details><div class="reply-groups" data-v-94e140ef${_scopeId2}><!--[-->`);
                      ssrRenderList(unref(COACH_EVENTS), (eventType) => {
                        _push3(`<details class="reply-group"${ssrIncludeBooleanAttr(eventType === "introduction") ? " open" : ""} data-v-94e140ef${_scopeId2}><summary class="reply-group__summary" data-v-94e140ef${_scopeId2}><span class="reply-group__heading" data-v-94e140ef${_scopeId2}><strong data-v-94e140ef${_scopeId2}>${ssrInterpolate(EVENT_LABELS[eventType])}`);
                        if (unref(REQUIRED_REPLY_EVENTS).has(eventType)) {
                          _push3(`<span class="required-mark" aria-label="obligatoire" data-v-94e140ef${_scopeId2}> *</span>`);
                        } else {
                          _push3(`<!---->`);
                        }
                        _push3(`</strong><small data-v-94e140ef${_scopeId2}>${ssrInterpolate(EVENT_DESCRIPTIONS[eventType])}</small></span><span class="${ssrRenderClass([{ "is-empty": activeReplyCount(eventType) === 0 }, "reply-group__count"])}" data-v-94e140ef${_scopeId2}>${ssrInterpolate(activeReplyCount(eventType))} active(s)</span></summary><div class="reply-group__body" data-v-94e140ef${_scopeId2}>`);
                        if (!repliesFor(eventType).length) {
                          _push3(`<div class="reply-group__empty" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Aucune phrase dans cette catégorie.</span>`);
                          if (unref(REQUIRED_REPLY_EVENTS).has(eventType)) {
                            _push3(`<small data-v-94e140ef${_scopeId2}>Au moins une phrase active est nécessaire pour publier ce caractère.</small>`);
                          } else {
                            _push3(`<!---->`);
                          }
                          _push3(`</div>`);
                        } else {
                          _push3(`<div class="reply-list" data-v-94e140ef${_scopeId2}><!--[-->`);
                          ssrRenderList(repliesFor(eventType), (reply) => {
                            _push3(`<article class="${ssrRenderClass([{ "is-inactive": !reply.isActive }, "reply-card"])}" data-v-94e140ef${_scopeId2}><label class="reply-card__content" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Phrase</span><textarea rows="2" required data-v-94e140ef${_scopeId2}>${ssrInterpolate(reply.content)}</textarea></label><div class="reply-card__settings" data-v-94e140ef${_scopeId2}><label class="reply-active" data-v-94e140ef${_scopeId2}><input${ssrIncludeBooleanAttr(Array.isArray(reply.isActive) ? ssrLooseContain(reply.isActive, null) : reply.isActive) ? " checked" : ""} type="checkbox" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Active</span></label><label class="reply-weight" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Fréquence</span><input${ssrRenderAttr("value", reply.weight)} type="number" min="1" max="20" data-v-94e140ef${_scopeId2}><small data-v-94e140ef${_scopeId2}>1 = rare, 20 = fréquente</small></label><button type="button" class="reply-delete" aria-label="Supprimer cette phrase" data-v-94e140ef${_scopeId2}>Supprimer</button></div></article>`);
                          });
                          _push3(`<!--]--></div>`);
                        }
                        _push3(`<button type="button" class="admin-button admin-button--small reply-add" data-v-94e140ef${_scopeId2}>+ Ajouter une phrase</button></div></details>`);
                      });
                      _push3(`<!--]--></div></section><section class="admin-card caractere-panel reaction-media-panel" data-v-94e140ef${_scopeId2}><div class="panel-title" data-v-94e140ef${_scopeId2}><div data-v-94e140ef${_scopeId2}><p class="admin-eyebrow" data-v-94e140ef${_scopeId2}>Réactions partagées</p><h2 data-v-94e140ef${_scopeId2}>GIF animés et émojis</h2></div><strong data-v-94e140ef${_scopeId2}>${ssrInterpolate(unref(draft).assignments.length)} attribué(s)</strong></div><h3 data-v-94e140ef${_scopeId2}>Fréquence des réactions</h3><div class="rule-list" data-v-94e140ef${_scopeId2}><!--[-->`);
                      ssrRenderList(REACTION_EVENTS, (eventType) => {
                        _push3(`<div data-v-94e140ef${_scopeId2}><button type="button" data-v-94e140ef${_scopeId2}>${ssrInterpolate(EVENT_LABELS[eventType])}</button>`);
                        if (ruleFor(eventType)) {
                          _push3(`<!--[--><label data-v-94e140ef${_scopeId2}>GIF animés <select${ssrRenderAttr("value", ruleFor(eventType)?.animationProbability)} data-v-94e140ef${_scopeId2}><!--[-->`);
                          ssrRenderList(MEDIA_FREQUENCY_OPTIONS, (option) => {
                            _push3(`<option${ssrRenderAttr("value", option.value)} data-v-94e140ef${_scopeId2}>${ssrInterpolate(option.label)}</option>`);
                          });
                          _push3(`<!--]--></select></label><label data-v-94e140ef${_scopeId2}>Émojis <select${ssrRenderAttr("value", ruleFor(eventType)?.emojiProbability)} data-v-94e140ef${_scopeId2}><!--[-->`);
                          ssrRenderList(MEDIA_FREQUENCY_OPTIONS, (option) => {
                            _push3(`<option${ssrRenderAttr("value", option.value)} data-v-94e140ef${_scopeId2}>${ssrInterpolate(option.label)}</option>`);
                          });
                          _push3(`<!--]--></select></label><label data-v-94e140ef${_scopeId2}>Pause <input${ssrRenderAttr("value", ruleFor(eventType)?.cooldownQuestions)} type="number" min="0" data-v-94e140ef${_scopeId2}></label><!--]-->`);
                        } else {
                          _push3(`<!---->`);
                        }
                        _push3(`</div>`);
                      });
                      _push3(`<!--]--></div><div class="response-media-groups" data-v-94e140ef${_scopeId2}><!--[-->`);
                      ssrRenderList(unref(responseMediaGroups), (group) => {
                        _push3(`<section class="${ssrRenderClass([`response-media-group--${group.key}`, "response-media-group"])}" data-v-94e140ef${_scopeId2}><header data-v-94e140ef${_scopeId2}><div data-v-94e140ef${_scopeId2}><p class="admin-eyebrow" data-v-94e140ef${_scopeId2}>${ssrInterpolate(group.title)}</p><h3 data-v-94e140ef${_scopeId2}>${ssrInterpolate(group.title)}</h3><small data-v-94e140ef${_scopeId2}>${ssrInterpolate(group.description)}</small></div><div class="media-selection-actions" data-v-94e140ef${_scopeId2}><strong data-v-94e140ef${_scopeId2}>${ssrInterpolate(assignedMediaCount(group.items, group.key))}/${ssrInterpolate(group.items.length)}</strong><button type="button" class="admin-button admin-button--small" data-v-94e140ef${_scopeId2}>Tout sélectionner</button><button type="button" class="admin-button admin-button--small" data-v-94e140ef${_scopeId2}>Tout désélectionner</button></div></header>`);
                        if (!group.items.length) {
                          _push3(`<p class="admin-muted" data-v-94e140ef${_scopeId2}>Aucun média dans cette catégorie.</p>`);
                        } else {
                          _push3(`<div class="media-grid" data-v-94e140ef${_scopeId2}><!--[-->`);
                          ssrRenderList(group.items, (item) => {
                            _push3(`<article class="${ssrRenderClass({ assigned: assignmentFor(item.id, group.key) })}" data-v-94e140ef${_scopeId2}><button type="button" class="media-delete-button"${ssrRenderAttr("aria-label", `Supprimer définitivement ${item.name}`)} title="Supprimer définitivement" data-v-94e140ef${_scopeId2}>×</button><button type="button" data-v-94e140ef${_scopeId2}><img${ssrRenderAttr("src", item.filePath)}${ssrRenderAttr("alt", item.altText)} data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>${ssrInterpolate(assignmentFor(item.id, group.key) ? "✓" : "+")}</span></button><strong data-v-94e140ef${_scopeId2}>${ssrInterpolate(item.name)}</strong>`);
                            if (assignmentFor(item.id, group.key)) {
                              _push3(`<label data-v-94e140ef${_scopeId2}>Poids <input${ssrRenderAttr("value", assignmentFor(item.id, group.key)?.weight)} type="number" min="1" max="20" data-v-94e140ef${_scopeId2}></label>`);
                            } else {
                              _push3(`<!---->`);
                            }
                            _push3(`</article>`);
                          });
                          _push3(`<!--]--></div>`);
                        }
                        if (group.key === "incorrect" && assignedMediaCount(group.items, group.key) === 0) {
                          _push3(`<p class="response-media-group__text-only" data-v-94e140ef${_scopeId2}>Aucun média sélectionné : les mauvaises réponses utiliseront uniquement du texte.</p>`);
                        } else {
                          _push3(`<!---->`);
                        }
                        _push3(`</section>`);
                      });
                      _push3(`<!--]--></div>`);
                      if (unref(otherReactionMedia).length) {
                        _push3(`<details class="other-reaction-media" data-v-94e140ef${_scopeId2}><summary data-v-94e140ef${_scopeId2}>Autres moments de la conversation · ${ssrInterpolate(unref(otherReactionMedia).length)} média(s)</summary><div class="media-grid" data-v-94e140ef${_scopeId2}><!--[-->`);
                        ssrRenderList(unref(otherReactionMedia), (item) => {
                          _push3(`<article class="${ssrRenderClass({ assigned: assignmentFor(item.id) })}" data-v-94e140ef${_scopeId2}><button type="button" class="media-delete-button"${ssrRenderAttr("aria-label", `Supprimer définitivement ${item.name}`)} title="Supprimer définitivement" data-v-94e140ef${_scopeId2}>×</button><button type="button" data-v-94e140ef${_scopeId2}><img${ssrRenderAttr("src", item.filePath)}${ssrRenderAttr("alt", item.altText)} data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>${ssrInterpolate(assignmentFor(item.id) ? "✓" : "+")}</span></button><strong data-v-94e140ef${_scopeId2}>${ssrInterpolate(item.name)}</strong>`);
                          if (assignmentFor(item.id)) {
                            _push3(`<!--[--><select${ssrRenderAttr("value", assignmentFor(item.id)?.eventType)} data-v-94e140ef${_scopeId2}><!--[-->`);
                            ssrRenderList(unref(COACH_EVENTS), (eventType) => {
                              _push3(`<option${ssrRenderAttr("value", eventType)} data-v-94e140ef${_scopeId2}>${ssrInterpolate(EVENT_LABELS[eventType])}</option>`);
                            });
                            _push3(`<!--]--></select><label data-v-94e140ef${_scopeId2}>Poids <input${ssrRenderAttr("value", assignmentFor(item.id)?.weight)} type="number" min="1" max="20" data-v-94e140ef${_scopeId2}></label><!--]-->`);
                          } else {
                            _push3(`<!---->`);
                          }
                          _push3(`</article>`);
                        });
                        _push3(`<!--]--></div></details>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`</section><div class="save-bar" data-v-94e140ef${_scopeId2}><p class="${ssrRenderClass([`is-${unref(autosaveState)}`, "autosave-status"])}" aria-live="polite" data-v-94e140ef${_scopeId2}><span aria-hidden="true" data-v-94e140ef${_scopeId2}></span>${ssrInterpolate(unref(autosaveLabel))}</p>`);
                      if (unref(autosaveState) === "error") {
                        _push3(`<button type="button" class="admin-button admin-button--small" data-v-94e140ef${_scopeId2}>Réessayer</button>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`</div></form>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div>`);
                  } else {
                    _push3(`<div class="media-workspace" data-v-94e140ef${_scopeId2}><aside class="media-library admin-card" data-v-94e140ef${_scopeId2}><!--[-->`);
                    ssrRenderList(unref(media), (item) => {
                      _push3(`<button class="${ssrRenderClass({ selected: item.id === unref(selectedMediaId) })}" data-v-94e140ef${_scopeId2}><img${ssrRenderAttr("src", item.filePath)}${ssrRenderAttr("alt", item.altText)} data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}><strong data-v-94e140ef${_scopeId2}>${ssrInterpolate(item.name)}</strong><small data-v-94e140ef${_scopeId2}>${ssrInterpolate(item.mediaType)} · ${ssrInterpolate(item.safetyStatus)}</small></span></button>`);
                    });
                    _push3(`<!--]--></aside><form class="admin-card media-editor" data-v-94e140ef${_scopeId2}><div class="panel-title" data-v-94e140ef${_scopeId2}><h2 data-v-94e140ef${_scopeId2}>${ssrInterpolate(unref(mediaDraft).id ? "Modifier le média" : "Ajouter un média")}</h2>`);
                    if (unref(mediaDraft).filePath && unref(mediaDraft).mediaType !== "video") {
                      _push3(`<img${ssrRenderAttr("src", unref(mediaDraft).filePath)} alt="Aperçu" data-v-94e140ef${_scopeId2}>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div><label class="admin-field" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Importer</span><input type="file" accept="image/png,image/jpeg,image/gif,image/webp,video/mp4,video/webm"${ssrIncludeBooleanAttr(unref(uploading)) ? " disabled" : ""} data-v-94e140ef${_scopeId2}></label><label class="admin-field" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Nom *</span><input${ssrRenderAttr("value", unref(mediaDraft).name)} required data-v-94e140ef${_scopeId2}></label><label class="admin-field" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Chemin *</span><input${ssrRenderAttr("value", unref(mediaDraft).filePath)} required data-v-94e140ef${_scopeId2}></label><div class="caractere-fields" data-v-94e140ef${_scopeId2}><label class="admin-field" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Type</span><select data-v-94e140ef${_scopeId2}><option data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(unref(mediaDraft).mediaType) ? ssrLooseContain(unref(mediaDraft).mediaType, null) : ssrLooseEqual(unref(mediaDraft).mediaType, null)) ? " selected" : ""}${_scopeId2}>emoji</option><option data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(unref(mediaDraft).mediaType) ? ssrLooseContain(unref(mediaDraft).mediaType, null) : ssrLooseEqual(unref(mediaDraft).mediaType, null)) ? " selected" : ""}${_scopeId2}>animation</option><option data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(unref(mediaDraft).mediaType) ? ssrLooseContain(unref(mediaDraft).mediaType, null) : ssrLooseEqual(unref(mediaDraft).mediaType, null)) ? " selected" : ""}${_scopeId2}>video</option><option data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(unref(mediaDraft).mediaType) ? ssrLooseContain(unref(mediaDraft).mediaType, null) : ssrLooseEqual(unref(mediaDraft).mediaType, null)) ? " selected" : ""}${_scopeId2}>image</option></select></label><label class="admin-field" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Catégorie</span><select data-v-94e140ef${_scopeId2}><option value="success" data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(unref(mediaDraft).category) ? ssrLooseContain(unref(mediaDraft).category, "success") : ssrLooseEqual(unref(mediaDraft).category, "success")) ? " selected" : ""}${_scopeId2}>Réussite</option><option value="encouragement" data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(unref(mediaDraft).category) ? ssrLooseContain(unref(mediaDraft).category, "encouragement") : ssrLooseEqual(unref(mediaDraft).category, "encouragement")) ? " selected" : ""}${_scopeId2}>Encouragement</option><option value="finish" data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(unref(mediaDraft).category) ? ssrLooseContain(unref(mediaDraft).category, "finish") : ssrLooseEqual(unref(mediaDraft).category, "finish")) ? " selected" : ""}${_scopeId2}>Fin</option><option value="welcome" data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(unref(mediaDraft).category) ? ssrLooseContain(unref(mediaDraft).category, "welcome") : ssrLooseEqual(unref(mediaDraft).category, "welcome")) ? " selected" : ""}${_scopeId2}>Accueil</option><option value="neutral" data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(unref(mediaDraft).category) ? ssrLooseContain(unref(mediaDraft).category, "neutral") : ssrLooseEqual(unref(mediaDraft).category, "neutral")) ? " selected" : ""}${_scopeId2}>Neutre</option></select></label><label class="admin-field" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Droits</span><select data-v-94e140ef${_scopeId2}><option value="pending" data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(unref(mediaDraft).rightsStatus) ? ssrLooseContain(unref(mediaDraft).rightsStatus, "pending") : ssrLooseEqual(unref(mediaDraft).rightsStatus, "pending")) ? " selected" : ""}${_scopeId2}>À vérifier</option><option value="verified" data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(unref(mediaDraft).rightsStatus) ? ssrLooseContain(unref(mediaDraft).rightsStatus, "verified") : ssrLooseEqual(unref(mediaDraft).rightsStatus, "verified")) ? " selected" : ""}${_scopeId2}>Vérifiés</option><option value="rejected" data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(unref(mediaDraft).rightsStatus) ? ssrLooseContain(unref(mediaDraft).rightsStatus, "rejected") : ssrLooseEqual(unref(mediaDraft).rightsStatus, "rejected")) ? " selected" : ""}${_scopeId2}>Refusés</option></select></label><label class="admin-field" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Sécurité mineurs</span><select data-v-94e140ef${_scopeId2}><option value="pending" data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(unref(mediaDraft).safetyStatus) ? ssrLooseContain(unref(mediaDraft).safetyStatus, "pending") : ssrLooseEqual(unref(mediaDraft).safetyStatus, "pending")) ? " selected" : ""}${_scopeId2}>À vérifier</option><option value="approved" data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(unref(mediaDraft).safetyStatus) ? ssrLooseContain(unref(mediaDraft).safetyStatus, "approved") : ssrLooseEqual(unref(mediaDraft).safetyStatus, "approved")) ? " selected" : ""}${_scopeId2}>Approuvée</option><option value="rejected" data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(unref(mediaDraft).safetyStatus) ? ssrLooseContain(unref(mediaDraft).safetyStatus, "rejected") : ssrLooseEqual(unref(mediaDraft).safetyStatus, "rejected")) ? " selected" : ""}${_scopeId2}>Refusée</option></select></label></div><label class="admin-field" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Texte alternatif *</span><input${ssrRenderAttr("value", unref(mediaDraft).altText)} required data-v-94e140ef${_scopeId2}></label><button class="admin-button admin-button--primary"${ssrIncludeBooleanAttr(unref(saving) || unref(uploading)) ? " disabled" : ""} data-v-94e140ef${_scopeId2}>Enregistrer le média</button></form></div>`);
                  }
                  ssrRenderTeleport(_push3, (_push4) => {
                    if (unref(approachManagerOpen)) {
                      _push4(`<div class="icon-picker-backdrop" data-v-94e140ef${_scopeId2}><section class="icon-picker approach-manager" role="dialog" aria-modal="true" aria-labelledby="approach-manager-title" data-v-94e140ef${_scopeId2}><header data-v-94e140ef${_scopeId2}><div data-v-94e140ef${_scopeId2}><p class="admin-eyebrow" data-v-94e140ef${_scopeId2}>Aides automatiques</p><h2 id="approach-manager-title" data-v-94e140ef${_scopeId2}>Gérer les approches</h2></div><button type="button" class="icon-picker__close" aria-label="Fermer"${ssrIncludeBooleanAttr(Boolean(unref(approachSaving))) ? " disabled" : ""} data-v-94e140ef${_scopeId2}>×</button></header><p class="approach-manager__intro" data-v-94e140ef${_scopeId2}>Le nom est libre. Le comportement moteur indique la stratégie utilisée par le générateur automatique.</p>`);
                      if (unref(approachError)) {
                        _push4(`<p class="admin-notice admin-notice--error" data-v-94e140ef${_scopeId2}>${ssrInterpolate(unref(approachError))}</p>`);
                      } else {
                        _push4(`<!---->`);
                      }
                      _push4(`<div class="approach-manager__list" data-v-94e140ef${_scopeId2}><!--[-->`);
                      ssrRenderList(unref(approachDrafts), (approach) => {
                        _push4(`<article data-v-94e140ef${_scopeId2}><label class="admin-field" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Nom</span><input${ssrRenderAttr("value", approach.name)} maxlength="80" data-v-94e140ef${_scopeId2}></label><label class="admin-field" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Comportement moteur</span><select data-v-94e140ef${_scopeId2}><option value="complete-avec-reponses" data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(approach.engineKey) ? ssrLooseContain(approach.engineKey, "complete-avec-reponses") : ssrLooseEqual(approach.engineKey, "complete-avec-reponses")) ? " selected" : ""}${_scopeId2}>Complète avec réponses</option><option value="complete" data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(approach.engineKey) ? ssrLooseContain(approach.engineKey, "complete") : ssrLooseEqual(approach.engineKey, "complete")) ? " selected" : ""}${_scopeId2}>Complète sans réponses</option><option value="tres-condensee" data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(approach.engineKey) ? ssrLooseContain(approach.engineKey, "tres-condensee") : ssrLooseEqual(approach.engineKey, "tres-condensee")) ? " selected" : ""}${_scopeId2}>Très condensée</option><option value="allophone" data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(approach.engineKey) ? ssrLooseContain(approach.engineKey, "allophone") : ssrLooseEqual(approach.engineKey, "allophone")) ? " selected" : ""}${_scopeId2}>Allophone</option></select></label><label class="admin-field" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Statut</span><select data-v-94e140ef${_scopeId2}><option value="draft" data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(approach.status) ? ssrLooseContain(approach.status, "draft") : ssrLooseEqual(approach.status, "draft")) ? " selected" : ""}${_scopeId2}>Brouillon</option><option value="published" data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(approach.status) ? ssrLooseContain(approach.status, "published") : ssrLooseEqual(approach.status, "published")) ? " selected" : ""}${_scopeId2}>Publié</option><option value="disabled" data-v-94e140ef${ssrIncludeBooleanAttr(Array.isArray(approach.status) ? ssrLooseContain(approach.status, "disabled") : ssrLooseEqual(approach.status, "disabled")) ? " selected" : ""}${_scopeId2}>Désactivé</option></select></label><span class="approach-manager__usage" data-v-94e140ef${_scopeId2}>${ssrInterpolate(approach.characterCount)} caractère${ssrInterpolate(approach.characterCount > 1 ? "s" : "")}</span><button type="button" class="admin-button admin-button--small"${ssrIncludeBooleanAttr(Boolean(unref(approachSaving)) || !approach.name.trim()) ? " disabled" : ""} data-v-94e140ef${_scopeId2}>${ssrInterpolate(unref(approachSaving) === approach.id ? "Enregistrement…" : "Enregistrer")}</button><button type="button" class="admin-button admin-button--danger admin-button--small"${ssrIncludeBooleanAttr(Boolean(unref(approachSaving)) || approach.characterCount > 0) ? " disabled" : ""}${ssrRenderAttr("title", approach.characterCount ? "Cette approche est encore utilisée" : "Supprimer cette approche")} data-v-94e140ef${_scopeId2}>Supprimer</button></article>`);
                      });
                      _push4(`<!--]--></div><form class="approach-manager__new" data-v-94e140ef${_scopeId2}><label class="admin-field" data-v-94e140ef${_scopeId2}><span data-v-94e140ef${_scopeId2}>Nouvelle approche</span><input${ssrRenderAttr("value", unref(newApproachName))} maxlength="80" placeholder="Nom de l’approche" data-v-94e140ef${_scopeId2}></label><button class="admin-button admin-button--primary"${ssrIncludeBooleanAttr(Boolean(unref(approachSaving)) || !unref(newApproachName).trim()) ? " disabled" : ""} data-v-94e140ef${_scopeId2}>${ssrInterpolate(unref(approachSaving) === "new" ? "Ajout…" : "Ajouter")}</button></form></section></div>`);
                    } else {
                      _push4(`<!---->`);
                    }
                  }, "body", false, _parent3);
                  ssrRenderTeleport(_push3, (_push4) => {
                    if (unref(iconPickerOpen)) {
                      _push4(`<div class="icon-picker-backdrop" data-v-94e140ef${_scopeId2}><section class="icon-picker" role="dialog" aria-modal="true" aria-labelledby="icon-picker-title" data-v-94e140ef${_scopeId2}><header data-v-94e140ef${_scopeId2}><div data-v-94e140ef${_scopeId2}><p class="admin-eyebrow" data-v-94e140ef${_scopeId2}>Caractère</p><h2 id="icon-picker-title" data-v-94e140ef${_scopeId2}>Choisir une icône</h2></div><button type="button" class="icon-picker__close" aria-label="Fermer" data-v-94e140ef${_scopeId2}>×</button></header><div class="icon-picker__groups" data-v-94e140ef${_scopeId2}><!--[-->`);
                      ssrRenderList(unref(caractereIconGroups), (group) => {
                        _push4(`<section data-v-94e140ef${_scopeId2}><h3 data-v-94e140ef${_scopeId2}>${ssrInterpolate(group.label)}</h3><div class="icon-picker__grid" data-v-94e140ef${_scopeId2}><!--[-->`);
                        ssrRenderList(group.icons, (icon) => {
                          _push4(`<button type="button"${ssrRenderAttr("title", icon.label)}${ssrRenderAttr("aria-label", icon.label)}${ssrRenderAttr("aria-pressed", unref(draft)?.emoticon === icon.value)} data-v-94e140ef${_scopeId2}><span aria-hidden="true" data-v-94e140ef${_scopeId2}>${ssrInterpolate(icon.value)}</span><small data-v-94e140ef${_scopeId2}>${ssrInterpolate(icon.label)}</small></button>`);
                        });
                        _push4(`<!--]--></div></section>`);
                      });
                      _push4(`<!--]--></div><p class="icon-picker__hint" data-v-94e140ef${_scopeId2}>Le choix est enregistré immédiatement.</p></section></div>`);
                    } else {
                      _push4(`<!---->`);
                    }
                  }, "body", false, _parent3);
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "caractere-admin" }, [
                      createVNode("header", { class: "admin-section-heading" }, [
                        createVNode("div", null, [
                          createVNode("p", { class: "admin-eyebrow" }, "Contenu mutualisé"),
                          createVNode("h1", null, "Caractères"),
                          createVNode("p", { class: "admin-muted" }, "Une modification s’applique immédiatement à tous les coaches qui partagent ce caractère.")
                        ]),
                        createVNode("button", {
                          class: "admin-button admin-button--primary",
                          onClick: ($event) => unref(tab) === "caracteres" ? newCaractere() : selectMedia()
                        }, toDisplayString(unref(tab) === "caracteres" ? "Nouveau caractère" : "Nouveau média"), 9, ["onClick"])
                      ]),
                      createVNode("div", { class: "caractere-tabs" }, [
                        createVNode("button", {
                          class: { active: unref(tab) === "caracteres" },
                          onClick: ($event) => tab.value = "caracteres"
                        }, "Caractères", 10, ["onClick"]),
                        createVNode("button", {
                          class: { active: unref(tab) === "media" },
                          onClick: ($event) => tab.value = "media"
                        }, [
                          createTextVNode("Médiathèque "),
                          createVNode("span", null, toDisplayString(unref(media).length), 1)
                        ], 10, ["onClick"])
                      ]),
                      unref(error) ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "admin-notice admin-notice--error"
                      }, toDisplayString(unref(error)), 1)) : createCommentVNode("", true),
                      unref(success) ? (openBlock(), createBlock("p", {
                        key: 1,
                        class: "admin-notice admin-notice--success"
                      }, toDisplayString(unref(success)), 1)) : createCommentVNode("", true),
                      unref(tab) === "caracteres" ? (openBlock(), createBlock("div", {
                        key: 2,
                        class: "caractere-workspace"
                      }, [
                        createVNode("aside", { class: "caractere-list admin-card" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(sortedCaracteres), (caractere) => {
                            return openBlock(), createBlock("button", {
                              key: caractere.id,
                              class: { selected: caractere.id === unref(selectedId), "is-disabled": caractere.status === "disabled" },
                              onClick: ($event) => selectCaractere(caractere)
                            }, [
                              createVNode("span", { class: "caractere-list__mark" }, toDisplayString(caractere.emoticon), 1),
                              createVNode("span", null, [
                                createVNode("strong", null, toDisplayString(unref(formatCaractereName)(caractere)), 1),
                                createVNode("small", null, [
                                  caractere.status === "disabled" ? (openBlock(), createBlock("span", { key: 0 }, "Désactivé · ")) : createCommentVNode("", true),
                                  createTextVNode(toDisplayString(caractere.replies.length) + " répliques · " + toDisplayString(caractere.assignments.length) + " médias", 1)
                                ])
                              ])
                            ], 10, ["onClick"]);
                          }), 128))
                        ]),
                        unref(draft) ? (openBlock(), createBlock("form", {
                          key: 0,
                          class: "caractere-editor",
                          onSubmit: withModifiers(() => {
                          }, ["prevent"])
                        }, [
                          createVNode("section", { class: "admin-card caractere-panel" }, [
                            createVNode("div", { class: "panel-title caractere-profile-title" }, [
                              createVNode("div", null, [
                                createVNode("p", { class: "admin-eyebrow" }, "Profil partagé"),
                                createVNode("h2", null, toDisplayString(unref(draft).masculineName ? unref(formatCaractereName)(unref(draft)) : "Nouveau caractère"), 1)
                              ]),
                              createVNode("div", { class: "admin-field emoticon-field" }, [
                                createVNode("span", null, "Icône *"),
                                createVNode("button", {
                                  type: "button",
                                  class: "emoticon-trigger",
                                  "aria-haspopup": "dialog",
                                  onClick: openIconPicker
                                }, [
                                  createVNode("span", { "aria-hidden": "true" }, toDisplayString(unref(draft).emoticon), 1),
                                  createVNode("small", null, "Modifier")
                                ])
                              ]),
                              createVNode("div", { class: "caractere-profile-actions" }, [
                                createVNode("button", {
                                  type: "button",
                                  class: "admin-button admin-button--primary caractere-help-button",
                                  disabled: unref(openingHelp) || unref(duplicatingCaractere) || unref(deletingCaractere),
                                  onClick: openCaractereHelp
                                }, toDisplayString(unref(openingHelp) ? "Ouverture de l’aide…" : "Voir l’aide automatique"), 9, ["disabled"]),
                                unref(draft).id ? (openBlock(), createBlock("button", {
                                  key: 0,
                                  type: "button",
                                  class: "admin-button admin-button--small",
                                  disabled: unref(openingHelp) || unref(duplicatingCaractere) || unref(deletingCaractere),
                                  onClick: duplicateCaractere
                                }, toDisplayString(unref(duplicatingCaractere) ? "Duplication…" : "Dupliquer"), 9, ["disabled"])) : createCommentVNode("", true),
                                unref(draft).id ? (openBlock(), createBlock("button", {
                                  key: 1,
                                  type: "button",
                                  class: "admin-button admin-button--danger admin-button--small",
                                  disabled: unref(duplicatingCaractere) || unref(deletingCaractere),
                                  onClick: disableCaractere
                                }, "Désactiver", 8, ["disabled"])) : createCommentVNode("", true),
                                unref(draft).id ? (openBlock(), createBlock("button", {
                                  key: 2,
                                  type: "button",
                                  class: "admin-button admin-button--danger admin-button--small caractere-delete-button",
                                  disabled: unref(duplicatingCaractere) || unref(deletingCaractere),
                                  onClick: deleteCaractere
                                }, toDisplayString(unref(deletingCaractere) ? "Suppression…" : "Supprimer"), 9, ["disabled"])) : createCommentVNode("", true)
                              ])
                            ]),
                            unref(draft).id ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "caractere-coaches"
                            }, [
                              createVNode("div", null, [
                                createVNode("strong", null, "Coaches utilisant ce caractère"),
                                createVNode("small", null, toDisplayString(unref(caractereCoaches).length) + " coach" + toDisplayString(unref(caractereCoaches).length > 1 ? "es" : ""), 1)
                              ]),
                              unref(caractereCoaches).length ? (openBlock(), createBlock("div", {
                                key: 0,
                                class: "caractere-coaches__portraits"
                              }, [
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(caractereCoaches), (coach) => {
                                  return openBlock(), createBlock(_component_NuxtLink, {
                                    key: coach.id,
                                    to: { path: unref(localePath)("/admin/coaches"), query: { coach: coach.id } },
                                    title: `Modifier ${coach.firstName} ${coach.lastName}`,
                                    "aria-label": `Ouvrir la fiche de ${coach.firstName} ${coach.lastName}`
                                  }, {
                                    default: withCtx(() => [
                                      createVNode("img", {
                                        src: coach.avatarPath,
                                        alt: ""
                                      }, null, 8, ["src"]),
                                      createVNode("span", null, toDisplayString(coach.firstName), 1)
                                    ]),
                                    _: 2
                                  }, 1032, ["to", "title", "aria-label"]);
                                }), 128))
                              ])) : (openBlock(), createBlock("p", { key: 1 }, "Aucun coach n’utilise encore ce caractère."))
                            ])) : createCommentVNode("", true),
                            createVNode("div", { class: "caractere-fields" }, [
                              createVNode("label", { class: "admin-field" }, [
                                createVNode("span", null, "Nom *"),
                                withDirectives(createVNode("input", {
                                  "onUpdate:modelValue": ($event) => unref(draft).masculineName = $event,
                                  required: ""
                                }, null, 8, ["onUpdate:modelValue"]), [
                                  [vModelText, unref(draft).masculineName]
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
                                createVNode("span", null, "Ordre"),
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
                              ]),
                              createVNode("label", { class: "admin-field wide" }, [
                                createVNode("span", null, "Description courte *"),
                                withDirectives(createVNode("textarea", {
                                  "onUpdate:modelValue": ($event) => unref(draft).pedagogicalStyle = $event,
                                  rows: "3",
                                  required: ""
                                }, null, 8, ["onUpdate:modelValue"]), [
                                  [vModelText, unref(draft).pedagogicalStyle]
                                ])
                              ]),
                              createVNode("label", { class: "admin-field" }, [
                                createVNode("span", null, "Approche de l’aide"),
                                createVNode("select", {
                                  value: unref(draft).helpApproachId,
                                  onChange: selectHelpApproach
                                }, [
                                  (openBlock(true), createBlock(Fragment, null, renderList(unref(helpApproaches), (approach) => {
                                    return openBlock(), createBlock("option", {
                                      key: approach.id,
                                      value: approach.id
                                    }, toDisplayString(approach.name), 9, ["value"]);
                                  }), 128)),
                                  createVNode("option", { disabled: "" }, "──────────"),
                                  createVNode("option", { value: "manage" }, "Modifier les approches…")
                                ], 40, ["value"])
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
                              ])
                            ])
                          ]),
                          createVNode("section", { class: "admin-card caractere-panel dialogue-panel" }, [
                            createVNode("div", { class: "panel-title" }, [
                              createVNode("div", null, [
                                createVNode("p", { class: "admin-eyebrow" }, "Dialogue partagé"),
                                createVNode("h2", null, "Textes du caractère")
                              ]),
                              createVNode("strong", null, toDisplayString(unref(draft).replies.length) + " phrase(s)", 1)
                            ]),
                            createVNode("p", { class: "admin-muted dialogue-intro" }, [
                              createTextVNode("Les phrases sont classées selon le moment où elles peuvent apparaître dans la conversation. Ouvrez une catégorie pour gérer son contenu. "),
                              createVNode("span", { class: "required-note" }, "* Catégorie obligatoire")
                            ]),
                            createVNode("details", { class: "variables-help" }, [
                              createVNode("summary", null, "Variables utilisables dans les phrases"),
                              createVNode("p", null, toDisplayString(unref(placeholdersLabel)), 1)
                            ]),
                            createVNode("div", { class: "reply-groups" }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(COACH_EVENTS), (eventType) => {
                                return openBlock(), createBlock("details", {
                                  key: eventType,
                                  class: "reply-group",
                                  open: eventType === "introduction"
                                }, [
                                  createVNode("summary", { class: "reply-group__summary" }, [
                                    createVNode("span", { class: "reply-group__heading" }, [
                                      createVNode("strong", null, [
                                        createTextVNode(toDisplayString(EVENT_LABELS[eventType]), 1),
                                        unref(REQUIRED_REPLY_EVENTS).has(eventType) ? (openBlock(), createBlock("span", {
                                          key: 0,
                                          class: "required-mark",
                                          "aria-label": "obligatoire"
                                        }, " *")) : createCommentVNode("", true)
                                      ]),
                                      createVNode("small", null, toDisplayString(EVENT_DESCRIPTIONS[eventType]), 1)
                                    ]),
                                    createVNode("span", {
                                      class: ["reply-group__count", { "is-empty": activeReplyCount(eventType) === 0 }]
                                    }, toDisplayString(activeReplyCount(eventType)) + " active(s)", 3)
                                  ]),
                                  createVNode("div", { class: "reply-group__body" }, [
                                    !repliesFor(eventType).length ? (openBlock(), createBlock("div", {
                                      key: 0,
                                      class: "reply-group__empty"
                                    }, [
                                      createVNode("span", null, "Aucune phrase dans cette catégorie."),
                                      unref(REQUIRED_REPLY_EVENTS).has(eventType) ? (openBlock(), createBlock("small", { key: 0 }, "Au moins une phrase active est nécessaire pour publier ce caractère.")) : createCommentVNode("", true)
                                    ])) : (openBlock(), createBlock("div", {
                                      key: 1,
                                      class: "reply-list"
                                    }, [
                                      (openBlock(true), createBlock(Fragment, null, renderList(repliesFor(eventType), (reply) => {
                                        return openBlock(), createBlock("article", {
                                          key: reply.id || unref(draft).replies.indexOf(reply),
                                          class: ["reply-card", { "is-inactive": !reply.isActive }]
                                        }, [
                                          createVNode("label", { class: "reply-card__content" }, [
                                            createVNode("span", null, "Phrase"),
                                            withDirectives(createVNode("textarea", {
                                              "onUpdate:modelValue": ($event) => reply.content = $event,
                                              rows: "2",
                                              required: ""
                                            }, null, 8, ["onUpdate:modelValue"]), [
                                              [vModelText, reply.content]
                                            ])
                                          ]),
                                          createVNode("div", { class: "reply-card__settings" }, [
                                            createVNode("label", { class: "reply-active" }, [
                                              withDirectives(createVNode("input", {
                                                "onUpdate:modelValue": ($event) => reply.isActive = $event,
                                                type: "checkbox"
                                              }, null, 8, ["onUpdate:modelValue"]), [
                                                [vModelCheckbox, reply.isActive]
                                              ]),
                                              createVNode("span", null, "Active")
                                            ]),
                                            createVNode("label", { class: "reply-weight" }, [
                                              createVNode("span", null, "Fréquence"),
                                              withDirectives(createVNode("input", {
                                                "onUpdate:modelValue": ($event) => reply.weight = $event,
                                                type: "number",
                                                min: "1",
                                                max: "20"
                                              }, null, 8, ["onUpdate:modelValue"]), [
                                                [
                                                  vModelText,
                                                  reply.weight,
                                                  void 0,
                                                  { number: true }
                                                ]
                                              ]),
                                              createVNode("small", null, "1 = rare, 20 = fréquente")
                                            ]),
                                            createVNode("button", {
                                              type: "button",
                                              class: "reply-delete",
                                              "aria-label": "Supprimer cette phrase",
                                              onClick: ($event) => removeReply(reply)
                                            }, "Supprimer", 8, ["onClick"])
                                          ])
                                        ], 2);
                                      }), 128))
                                    ])),
                                    createVNode("button", {
                                      type: "button",
                                      class: "admin-button admin-button--small reply-add",
                                      onClick: ($event) => addReply(eventType)
                                    }, "+ Ajouter une phrase", 8, ["onClick"])
                                  ])
                                ], 8, ["open"]);
                              }), 128))
                            ])
                          ]),
                          createVNode("section", { class: "admin-card caractere-panel reaction-media-panel" }, [
                            createVNode("div", { class: "panel-title" }, [
                              createVNode("div", null, [
                                createVNode("p", { class: "admin-eyebrow" }, "Réactions partagées"),
                                createVNode("h2", null, "GIF animés et émojis")
                              ]),
                              createVNode("strong", null, toDisplayString(unref(draft).assignments.length) + " attribué(s)", 1)
                            ]),
                            createVNode("h3", null, "Fréquence des réactions"),
                            createVNode("div", { class: "rule-list" }, [
                              (openBlock(), createBlock(Fragment, null, renderList(REACTION_EVENTS, (eventType) => {
                                return createVNode("div", { key: eventType }, [
                                  createVNode("button", {
                                    type: "button",
                                    onClick: ($event) => ensureRule(eventType)
                                  }, toDisplayString(EVENT_LABELS[eventType]), 9, ["onClick"]),
                                  ruleFor(eventType) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                    createVNode("label", null, [
                                      createTextVNode("GIF animés "),
                                      createVNode("select", {
                                        value: ruleFor(eventType)?.animationProbability,
                                        onChange: ($event) => updateRule(eventType, "animationProbability", inputValue($event))
                                      }, [
                                        (openBlock(), createBlock(Fragment, null, renderList(MEDIA_FREQUENCY_OPTIONS, (option) => {
                                          return createVNode("option", {
                                            key: `animation-${eventType}-${option.value}`,
                                            value: option.value
                                          }, toDisplayString(option.label), 9, ["value"]);
                                        }), 64))
                                      ], 40, ["value", "onChange"])
                                    ]),
                                    createVNode("label", null, [
                                      createTextVNode("Émojis "),
                                      createVNode("select", {
                                        value: ruleFor(eventType)?.emojiProbability,
                                        onChange: ($event) => updateRule(eventType, "emojiProbability", inputValue($event))
                                      }, [
                                        (openBlock(), createBlock(Fragment, null, renderList(MEDIA_FREQUENCY_OPTIONS, (option) => {
                                          return createVNode("option", {
                                            key: `emoji-${eventType}-${option.value}`,
                                            value: option.value
                                          }, toDisplayString(option.label), 9, ["value"]);
                                        }), 64))
                                      ], 40, ["value", "onChange"])
                                    ]),
                                    createVNode("label", null, [
                                      createTextVNode("Pause "),
                                      createVNode("input", {
                                        value: ruleFor(eventType)?.cooldownQuestions,
                                        type: "number",
                                        min: "0",
                                        onInput: ($event) => updateRule(eventType, "cooldownQuestions", inputValue($event))
                                      }, null, 40, ["value", "onInput"])
                                    ])
                                  ], 64)) : createCommentVNode("", true)
                                ]);
                              }), 64))
                            ]),
                            createVNode("div", { class: "response-media-groups" }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(responseMediaGroups), (group) => {
                                return openBlock(), createBlock("section", {
                                  key: group.key,
                                  class: ["response-media-group", `response-media-group--${group.key}`]
                                }, [
                                  createVNode("header", null, [
                                    createVNode("div", null, [
                                      createVNode("p", { class: "admin-eyebrow" }, toDisplayString(group.title), 1),
                                      createVNode("h3", null, toDisplayString(group.title), 1),
                                      createVNode("small", null, toDisplayString(group.description), 1)
                                    ]),
                                    createVNode("div", { class: "media-selection-actions" }, [
                                      createVNode("strong", null, toDisplayString(assignedMediaCount(group.items, group.key)) + "/" + toDisplayString(group.items.length), 1),
                                      createVNode("button", {
                                        type: "button",
                                        class: "admin-button admin-button--small",
                                        onClick: ($event) => setResponseMediaSelection(group.key, true)
                                      }, "Tout sélectionner", 8, ["onClick"]),
                                      createVNode("button", {
                                        type: "button",
                                        class: "admin-button admin-button--small",
                                        onClick: ($event) => setResponseMediaSelection(group.key, false)
                                      }, "Tout désélectionner", 8, ["onClick"])
                                    ])
                                  ]),
                                  !group.items.length ? (openBlock(), createBlock("p", {
                                    key: 0,
                                    class: "admin-muted"
                                  }, "Aucun média dans cette catégorie.")) : (openBlock(), createBlock("div", {
                                    key: 1,
                                    class: "media-grid"
                                  }, [
                                    (openBlock(true), createBlock(Fragment, null, renderList(group.items, (item) => {
                                      return openBlock(), createBlock("article", {
                                        key: item.id,
                                        class: { assigned: assignmentFor(item.id, group.key) }
                                      }, [
                                        createVNode("button", {
                                          type: "button",
                                          class: "media-delete-button",
                                          "aria-label": `Supprimer définitivement ${item.name}`,
                                          title: "Supprimer définitivement",
                                          onClick: withModifiers(($event) => deleteMedia(item), ["stop"])
                                        }, "×", 8, ["aria-label", "onClick"]),
                                        createVNode("button", {
                                          type: "button",
                                          onClick: ($event) => toggleResponseMedia(item, group.key)
                                        }, [
                                          createVNode("img", {
                                            src: item.filePath,
                                            alt: item.altText
                                          }, null, 8, ["src", "alt"]),
                                          createVNode("span", null, toDisplayString(assignmentFor(item.id, group.key) ? "✓" : "+"), 1)
                                        ], 8, ["onClick"]),
                                        createVNode("strong", null, toDisplayString(item.name), 1),
                                        assignmentFor(item.id, group.key) ? (openBlock(), createBlock("label", { key: 0 }, [
                                          createTextVNode("Poids "),
                                          createVNode("input", {
                                            value: assignmentFor(item.id, group.key)?.weight,
                                            type: "number",
                                            min: "1",
                                            max: "20",
                                            onInput: ($event) => updateAssignment(item.id, "weight", inputValue($event))
                                          }, null, 40, ["value", "onInput"])
                                        ])) : createCommentVNode("", true)
                                      ], 2);
                                    }), 128))
                                  ])),
                                  group.key === "incorrect" && assignedMediaCount(group.items, group.key) === 0 ? (openBlock(), createBlock("p", {
                                    key: 2,
                                    class: "response-media-group__text-only"
                                  }, "Aucun média sélectionné : les mauvaises réponses utiliseront uniquement du texte.")) : createCommentVNode("", true)
                                ], 2);
                              }), 128))
                            ]),
                            unref(otherReactionMedia).length ? (openBlock(), createBlock("details", {
                              key: 0,
                              class: "other-reaction-media"
                            }, [
                              createVNode("summary", null, "Autres moments de la conversation · " + toDisplayString(unref(otherReactionMedia).length) + " média(s)", 1),
                              createVNode("div", { class: "media-grid" }, [
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(otherReactionMedia), (item) => {
                                  return openBlock(), createBlock("article", {
                                    key: item.id,
                                    class: { assigned: assignmentFor(item.id) }
                                  }, [
                                    createVNode("button", {
                                      type: "button",
                                      class: "media-delete-button",
                                      "aria-label": `Supprimer définitivement ${item.name}`,
                                      title: "Supprimer définitivement",
                                      onClick: withModifiers(($event) => deleteMedia(item), ["stop"])
                                    }, "×", 8, ["aria-label", "onClick"]),
                                    createVNode("button", {
                                      type: "button",
                                      onClick: ($event) => toggleMedia(item)
                                    }, [
                                      createVNode("img", {
                                        src: item.filePath,
                                        alt: item.altText
                                      }, null, 8, ["src", "alt"]),
                                      createVNode("span", null, toDisplayString(assignmentFor(item.id) ? "✓" : "+"), 1)
                                    ], 8, ["onClick"]),
                                    createVNode("strong", null, toDisplayString(item.name), 1),
                                    assignmentFor(item.id) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                      createVNode("select", {
                                        value: assignmentFor(item.id)?.eventType,
                                        onChange: ($event) => updateAssignment(item.id, "eventType", inputValue($event))
                                      }, [
                                        (openBlock(true), createBlock(Fragment, null, renderList(unref(COACH_EVENTS), (eventType) => {
                                          return openBlock(), createBlock("option", {
                                            key: eventType,
                                            value: eventType
                                          }, toDisplayString(EVENT_LABELS[eventType]), 9, ["value"]);
                                        }), 128))
                                      ], 40, ["value", "onChange"]),
                                      createVNode("label", null, [
                                        createTextVNode("Poids "),
                                        createVNode("input", {
                                          value: assignmentFor(item.id)?.weight,
                                          type: "number",
                                          min: "1",
                                          max: "20",
                                          onInput: ($event) => updateAssignment(item.id, "weight", inputValue($event))
                                        }, null, 40, ["value", "onInput"])
                                      ])
                                    ], 64)) : createCommentVNode("", true)
                                  ], 2);
                                }), 128))
                              ])
                            ])) : createCommentVNode("", true)
                          ]),
                          createVNode("div", { class: "save-bar" }, [
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
                              onClick: autosaveCaractere
                            }, "Réessayer")) : createCommentVNode("", true)
                          ])
                        ], 40, ["onSubmit"])) : createCommentVNode("", true)
                      ])) : (openBlock(), createBlock("div", {
                        key: 3,
                        class: "media-workspace"
                      }, [
                        createVNode("aside", { class: "media-library admin-card" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(media), (item) => {
                            return openBlock(), createBlock("button", {
                              key: item.id,
                              class: { selected: item.id === unref(selectedMediaId) },
                              onClick: ($event) => selectMedia(item)
                            }, [
                              createVNode("img", {
                                src: item.filePath,
                                alt: item.altText
                              }, null, 8, ["src", "alt"]),
                              createVNode("span", null, [
                                createVNode("strong", null, toDisplayString(item.name), 1),
                                createVNode("small", null, toDisplayString(item.mediaType) + " · " + toDisplayString(item.safetyStatus), 1)
                              ])
                            ], 10, ["onClick"]);
                          }), 128))
                        ]),
                        createVNode("form", {
                          class: "admin-card media-editor",
                          onSubmit: withModifiers(saveMedia, ["prevent"])
                        }, [
                          createVNode("div", { class: "panel-title" }, [
                            createVNode("h2", null, toDisplayString(unref(mediaDraft).id ? "Modifier le média" : "Ajouter un média"), 1),
                            unref(mediaDraft).filePath && unref(mediaDraft).mediaType !== "video" ? (openBlock(), createBlock("img", {
                              key: 0,
                              src: unref(mediaDraft).filePath,
                              alt: "Aperçu"
                            }, null, 8, ["src"])) : createCommentVNode("", true)
                          ]),
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Importer"),
                            createVNode("input", {
                              type: "file",
                              accept: "image/png,image/jpeg,image/gif,image/webp,video/mp4,video/webm",
                              disabled: unref(uploading),
                              onChange: uploadMedia
                            }, null, 40, ["disabled"])
                          ]),
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Nom *"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(mediaDraft).name = $event,
                              required: ""
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [vModelText, unref(mediaDraft).name]
                            ])
                          ]),
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Chemin *"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(mediaDraft).filePath = $event,
                              required: ""
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [vModelText, unref(mediaDraft).filePath]
                            ])
                          ]),
                          createVNode("div", { class: "caractere-fields" }, [
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Type"),
                              withDirectives(createVNode("select", {
                                "onUpdate:modelValue": ($event) => unref(mediaDraft).mediaType = $event
                              }, [
                                createVNode("option", null, "emoji"),
                                createVNode("option", null, "animation"),
                                createVNode("option", null, "video"),
                                createVNode("option", null, "image")
                              ], 8, ["onUpdate:modelValue"]), [
                                [vModelSelect, unref(mediaDraft).mediaType]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Catégorie"),
                              withDirectives(createVNode("select", {
                                "onUpdate:modelValue": ($event) => unref(mediaDraft).category = $event
                              }, [
                                createVNode("option", { value: "success" }, "Réussite"),
                                createVNode("option", { value: "encouragement" }, "Encouragement"),
                                createVNode("option", { value: "finish" }, "Fin"),
                                createVNode("option", { value: "welcome" }, "Accueil"),
                                createVNode("option", { value: "neutral" }, "Neutre")
                              ], 8, ["onUpdate:modelValue"]), [
                                [vModelSelect, unref(mediaDraft).category]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Droits"),
                              withDirectives(createVNode("select", {
                                "onUpdate:modelValue": ($event) => unref(mediaDraft).rightsStatus = $event
                              }, [
                                createVNode("option", { value: "pending" }, "À vérifier"),
                                createVNode("option", { value: "verified" }, "Vérifiés"),
                                createVNode("option", { value: "rejected" }, "Refusés")
                              ], 8, ["onUpdate:modelValue"]), [
                                [vModelSelect, unref(mediaDraft).rightsStatus]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Sécurité mineurs"),
                              withDirectives(createVNode("select", {
                                "onUpdate:modelValue": ($event) => unref(mediaDraft).safetyStatus = $event
                              }, [
                                createVNode("option", { value: "pending" }, "À vérifier"),
                                createVNode("option", { value: "approved" }, "Approuvée"),
                                createVNode("option", { value: "rejected" }, "Refusée")
                              ], 8, ["onUpdate:modelValue"]), [
                                [vModelSelect, unref(mediaDraft).safetyStatus]
                              ])
                            ])
                          ]),
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Texte alternatif *"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(mediaDraft).altText = $event,
                              required: ""
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [vModelText, unref(mediaDraft).altText]
                            ])
                          ]),
                          createVNode("button", {
                            class: "admin-button admin-button--primary",
                            disabled: unref(saving) || unref(uploading)
                          }, "Enregistrer le média", 8, ["disabled"])
                        ], 32)
                      ])),
                      (openBlock(), createBlock(Teleport, { to: "body" }, [
                        unref(approachManagerOpen) ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "icon-picker-backdrop",
                          onClick: withModifiers(closeApproachManager, ["self"]),
                          onKeydown: withKeys(withModifiers(closeApproachManager, ["prevent"]), ["esc"])
                        }, [
                          createVNode("section", {
                            class: "icon-picker approach-manager",
                            role: "dialog",
                            "aria-modal": "true",
                            "aria-labelledby": "approach-manager-title"
                          }, [
                            createVNode("header", null, [
                              createVNode("div", null, [
                                createVNode("p", { class: "admin-eyebrow" }, "Aides automatiques"),
                                createVNode("h2", { id: "approach-manager-title" }, "Gérer les approches")
                              ]),
                              createVNode("button", {
                                type: "button",
                                class: "icon-picker__close",
                                "aria-label": "Fermer",
                                disabled: Boolean(unref(approachSaving)),
                                onClick: closeApproachManager
                              }, "×", 8, ["disabled"])
                            ]),
                            createVNode("p", { class: "approach-manager__intro" }, "Le nom est libre. Le comportement moteur indique la stratégie utilisée par le générateur automatique."),
                            unref(approachError) ? (openBlock(), createBlock("p", {
                              key: 0,
                              class: "admin-notice admin-notice--error"
                            }, toDisplayString(unref(approachError)), 1)) : createCommentVNode("", true),
                            createVNode("div", { class: "approach-manager__list" }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(approachDrafts), (approach) => {
                                return openBlock(), createBlock("article", {
                                  key: approach.id
                                }, [
                                  createVNode("label", { class: "admin-field" }, [
                                    createVNode("span", null, "Nom"),
                                    withDirectives(createVNode("input", {
                                      "onUpdate:modelValue": ($event) => approach.name = $event,
                                      maxlength: "80"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, approach.name]
                                    ])
                                  ]),
                                  createVNode("label", { class: "admin-field" }, [
                                    createVNode("span", null, "Comportement moteur"),
                                    withDirectives(createVNode("select", {
                                      "onUpdate:modelValue": ($event) => approach.engineKey = $event
                                    }, [
                                      createVNode("option", { value: "complete-avec-reponses" }, "Complète avec réponses"),
                                      createVNode("option", { value: "complete" }, "Complète sans réponses"),
                                      createVNode("option", { value: "tres-condensee" }, "Très condensée"),
                                      createVNode("option", { value: "allophone" }, "Allophone")
                                    ], 8, ["onUpdate:modelValue"]), [
                                      [vModelSelect, approach.engineKey]
                                    ])
                                  ]),
                                  createVNode("label", { class: "admin-field" }, [
                                    createVNode("span", null, "Statut"),
                                    withDirectives(createVNode("select", {
                                      "onUpdate:modelValue": ($event) => approach.status = $event
                                    }, [
                                      createVNode("option", { value: "draft" }, "Brouillon"),
                                      createVNode("option", { value: "published" }, "Publié"),
                                      createVNode("option", { value: "disabled" }, "Désactivé")
                                    ], 8, ["onUpdate:modelValue"]), [
                                      [vModelSelect, approach.status]
                                    ])
                                  ]),
                                  createVNode("span", { class: "approach-manager__usage" }, toDisplayString(approach.characterCount) + " caractère" + toDisplayString(approach.characterCount > 1 ? "s" : ""), 1),
                                  createVNode("button", {
                                    type: "button",
                                    class: "admin-button admin-button--small",
                                    disabled: Boolean(unref(approachSaving)) || !approach.name.trim(),
                                    onClick: ($event) => saveHelpApproach(approach)
                                  }, toDisplayString(unref(approachSaving) === approach.id ? "Enregistrement…" : "Enregistrer"), 9, ["disabled", "onClick"]),
                                  createVNode("button", {
                                    type: "button",
                                    class: "admin-button admin-button--danger admin-button--small",
                                    disabled: Boolean(unref(approachSaving)) || approach.characterCount > 0,
                                    title: approach.characterCount ? "Cette approche est encore utilisée" : "Supprimer cette approche",
                                    onClick: ($event) => deleteHelpApproach(approach)
                                  }, "Supprimer", 8, ["disabled", "title", "onClick"])
                                ]);
                              }), 128))
                            ]),
                            createVNode("form", {
                              class: "approach-manager__new",
                              onSubmit: withModifiers(createHelpApproach, ["prevent"])
                            }, [
                              createVNode("label", { class: "admin-field" }, [
                                createVNode("span", null, "Nouvelle approche"),
                                withDirectives(createVNode("input", {
                                  "onUpdate:modelValue": ($event) => isRef(newApproachName) ? newApproachName.value = $event : null,
                                  maxlength: "80",
                                  placeholder: "Nom de l’approche"
                                }, null, 8, ["onUpdate:modelValue"]), [
                                  [vModelText, unref(newApproachName)]
                                ])
                              ]),
                              createVNode("button", {
                                class: "admin-button admin-button--primary",
                                disabled: Boolean(unref(approachSaving)) || !unref(newApproachName).trim()
                              }, toDisplayString(unref(approachSaving) === "new" ? "Ajout…" : "Ajouter"), 9, ["disabled"])
                            ], 32)
                          ])
                        ], 40, ["onKeydown"])) : createCommentVNode("", true)
                      ])),
                      (openBlock(), createBlock(Teleport, { to: "body" }, [
                        unref(iconPickerOpen) ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "icon-picker-backdrop",
                          onClick: withModifiers(closeIconPicker, ["self"]),
                          onKeydown: withKeys(withModifiers(closeIconPicker, ["prevent"]), ["esc"])
                        }, [
                          createVNode("section", {
                            ref_key: "iconPicker",
                            ref: iconPicker,
                            class: "icon-picker",
                            role: "dialog",
                            "aria-modal": "true",
                            "aria-labelledby": "icon-picker-title"
                          }, [
                            createVNode("header", null, [
                              createVNode("div", null, [
                                createVNode("p", { class: "admin-eyebrow" }, "Caractère"),
                                createVNode("h2", { id: "icon-picker-title" }, "Choisir une icône")
                              ]),
                              createVNode("button", {
                                type: "button",
                                class: "icon-picker__close",
                                "aria-label": "Fermer",
                                onClick: closeIconPicker
                              }, "×")
                            ]),
                            createVNode("div", { class: "icon-picker__groups" }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(caractereIconGroups), (group) => {
                                return openBlock(), createBlock("section", {
                                  key: group.label
                                }, [
                                  createVNode("h3", null, toDisplayString(group.label), 1),
                                  createVNode("div", { class: "icon-picker__grid" }, [
                                    (openBlock(true), createBlock(Fragment, null, renderList(group.icons, (icon) => {
                                      return openBlock(), createBlock("button", {
                                        key: icon.value,
                                        type: "button",
                                        title: icon.label,
                                        "aria-label": icon.label,
                                        "aria-pressed": unref(draft)?.emoticon === icon.value,
                                        onClick: ($event) => selectCaractereIcon(icon.value)
                                      }, [
                                        createVNode("span", { "aria-hidden": "true" }, toDisplayString(icon.value), 1),
                                        createVNode("small", null, toDisplayString(icon.label), 1)
                                      ], 8, ["title", "aria-label", "aria-pressed", "onClick"]);
                                    }), 128))
                                  ])
                                ]);
                              }), 128))
                            ]),
                            createVNode("p", { class: "icon-picker__hint" }, "Le choix est enregistré immédiatement.")
                          ], 512)
                        ], 40, ["onKeydown"])) : createCommentVNode("", true)
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
                  createVNode("div", { class: "caractere-admin" }, [
                    createVNode("header", { class: "admin-section-heading" }, [
                      createVNode("div", null, [
                        createVNode("p", { class: "admin-eyebrow" }, "Contenu mutualisé"),
                        createVNode("h1", null, "Caractères"),
                        createVNode("p", { class: "admin-muted" }, "Une modification s’applique immédiatement à tous les coaches qui partagent ce caractère.")
                      ]),
                      createVNode("button", {
                        class: "admin-button admin-button--primary",
                        onClick: ($event) => unref(tab) === "caracteres" ? newCaractere() : selectMedia()
                      }, toDisplayString(unref(tab) === "caracteres" ? "Nouveau caractère" : "Nouveau média"), 9, ["onClick"])
                    ]),
                    createVNode("div", { class: "caractere-tabs" }, [
                      createVNode("button", {
                        class: { active: unref(tab) === "caracteres" },
                        onClick: ($event) => tab.value = "caracteres"
                      }, "Caractères", 10, ["onClick"]),
                      createVNode("button", {
                        class: { active: unref(tab) === "media" },
                        onClick: ($event) => tab.value = "media"
                      }, [
                        createTextVNode("Médiathèque "),
                        createVNode("span", null, toDisplayString(unref(media).length), 1)
                      ], 10, ["onClick"])
                    ]),
                    unref(error) ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "admin-notice admin-notice--error"
                    }, toDisplayString(unref(error)), 1)) : createCommentVNode("", true),
                    unref(success) ? (openBlock(), createBlock("p", {
                      key: 1,
                      class: "admin-notice admin-notice--success"
                    }, toDisplayString(unref(success)), 1)) : createCommentVNode("", true),
                    unref(tab) === "caracteres" ? (openBlock(), createBlock("div", {
                      key: 2,
                      class: "caractere-workspace"
                    }, [
                      createVNode("aside", { class: "caractere-list admin-card" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(sortedCaracteres), (caractere) => {
                          return openBlock(), createBlock("button", {
                            key: caractere.id,
                            class: { selected: caractere.id === unref(selectedId), "is-disabled": caractere.status === "disabled" },
                            onClick: ($event) => selectCaractere(caractere)
                          }, [
                            createVNode("span", { class: "caractere-list__mark" }, toDisplayString(caractere.emoticon), 1),
                            createVNode("span", null, [
                              createVNode("strong", null, toDisplayString(unref(formatCaractereName)(caractere)), 1),
                              createVNode("small", null, [
                                caractere.status === "disabled" ? (openBlock(), createBlock("span", { key: 0 }, "Désactivé · ")) : createCommentVNode("", true),
                                createTextVNode(toDisplayString(caractere.replies.length) + " répliques · " + toDisplayString(caractere.assignments.length) + " médias", 1)
                              ])
                            ])
                          ], 10, ["onClick"]);
                        }), 128))
                      ]),
                      unref(draft) ? (openBlock(), createBlock("form", {
                        key: 0,
                        class: "caractere-editor",
                        onSubmit: withModifiers(() => {
                        }, ["prevent"])
                      }, [
                        createVNode("section", { class: "admin-card caractere-panel" }, [
                          createVNode("div", { class: "panel-title caractere-profile-title" }, [
                            createVNode("div", null, [
                              createVNode("p", { class: "admin-eyebrow" }, "Profil partagé"),
                              createVNode("h2", null, toDisplayString(unref(draft).masculineName ? unref(formatCaractereName)(unref(draft)) : "Nouveau caractère"), 1)
                            ]),
                            createVNode("div", { class: "admin-field emoticon-field" }, [
                              createVNode("span", null, "Icône *"),
                              createVNode("button", {
                                type: "button",
                                class: "emoticon-trigger",
                                "aria-haspopup": "dialog",
                                onClick: openIconPicker
                              }, [
                                createVNode("span", { "aria-hidden": "true" }, toDisplayString(unref(draft).emoticon), 1),
                                createVNode("small", null, "Modifier")
                              ])
                            ]),
                            createVNode("div", { class: "caractere-profile-actions" }, [
                              createVNode("button", {
                                type: "button",
                                class: "admin-button admin-button--primary caractere-help-button",
                                disabled: unref(openingHelp) || unref(duplicatingCaractere) || unref(deletingCaractere),
                                onClick: openCaractereHelp
                              }, toDisplayString(unref(openingHelp) ? "Ouverture de l’aide…" : "Voir l’aide automatique"), 9, ["disabled"]),
                              unref(draft).id ? (openBlock(), createBlock("button", {
                                key: 0,
                                type: "button",
                                class: "admin-button admin-button--small",
                                disabled: unref(openingHelp) || unref(duplicatingCaractere) || unref(deletingCaractere),
                                onClick: duplicateCaractere
                              }, toDisplayString(unref(duplicatingCaractere) ? "Duplication…" : "Dupliquer"), 9, ["disabled"])) : createCommentVNode("", true),
                              unref(draft).id ? (openBlock(), createBlock("button", {
                                key: 1,
                                type: "button",
                                class: "admin-button admin-button--danger admin-button--small",
                                disabled: unref(duplicatingCaractere) || unref(deletingCaractere),
                                onClick: disableCaractere
                              }, "Désactiver", 8, ["disabled"])) : createCommentVNode("", true),
                              unref(draft).id ? (openBlock(), createBlock("button", {
                                key: 2,
                                type: "button",
                                class: "admin-button admin-button--danger admin-button--small caractere-delete-button",
                                disabled: unref(duplicatingCaractere) || unref(deletingCaractere),
                                onClick: deleteCaractere
                              }, toDisplayString(unref(deletingCaractere) ? "Suppression…" : "Supprimer"), 9, ["disabled"])) : createCommentVNode("", true)
                            ])
                          ]),
                          unref(draft).id ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "caractere-coaches"
                          }, [
                            createVNode("div", null, [
                              createVNode("strong", null, "Coaches utilisant ce caractère"),
                              createVNode("small", null, toDisplayString(unref(caractereCoaches).length) + " coach" + toDisplayString(unref(caractereCoaches).length > 1 ? "es" : ""), 1)
                            ]),
                            unref(caractereCoaches).length ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "caractere-coaches__portraits"
                            }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(caractereCoaches), (coach) => {
                                return openBlock(), createBlock(_component_NuxtLink, {
                                  key: coach.id,
                                  to: { path: unref(localePath)("/admin/coaches"), query: { coach: coach.id } },
                                  title: `Modifier ${coach.firstName} ${coach.lastName}`,
                                  "aria-label": `Ouvrir la fiche de ${coach.firstName} ${coach.lastName}`
                                }, {
                                  default: withCtx(() => [
                                    createVNode("img", {
                                      src: coach.avatarPath,
                                      alt: ""
                                    }, null, 8, ["src"]),
                                    createVNode("span", null, toDisplayString(coach.firstName), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["to", "title", "aria-label"]);
                              }), 128))
                            ])) : (openBlock(), createBlock("p", { key: 1 }, "Aucun coach n’utilise encore ce caractère."))
                          ])) : createCommentVNode("", true),
                          createVNode("div", { class: "caractere-fields" }, [
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Nom *"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(draft).masculineName = $event,
                                required: ""
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelText, unref(draft).masculineName]
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
                              createVNode("span", null, "Ordre"),
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
                            ]),
                            createVNode("label", { class: "admin-field wide" }, [
                              createVNode("span", null, "Description courte *"),
                              withDirectives(createVNode("textarea", {
                                "onUpdate:modelValue": ($event) => unref(draft).pedagogicalStyle = $event,
                                rows: "3",
                                required: ""
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelText, unref(draft).pedagogicalStyle]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Approche de l’aide"),
                              createVNode("select", {
                                value: unref(draft).helpApproachId,
                                onChange: selectHelpApproach
                              }, [
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(helpApproaches), (approach) => {
                                  return openBlock(), createBlock("option", {
                                    key: approach.id,
                                    value: approach.id
                                  }, toDisplayString(approach.name), 9, ["value"]);
                                }), 128)),
                                createVNode("option", { disabled: "" }, "──────────"),
                                createVNode("option", { value: "manage" }, "Modifier les approches…")
                              ], 40, ["value"])
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
                            ])
                          ])
                        ]),
                        createVNode("section", { class: "admin-card caractere-panel dialogue-panel" }, [
                          createVNode("div", { class: "panel-title" }, [
                            createVNode("div", null, [
                              createVNode("p", { class: "admin-eyebrow" }, "Dialogue partagé"),
                              createVNode("h2", null, "Textes du caractère")
                            ]),
                            createVNode("strong", null, toDisplayString(unref(draft).replies.length) + " phrase(s)", 1)
                          ]),
                          createVNode("p", { class: "admin-muted dialogue-intro" }, [
                            createTextVNode("Les phrases sont classées selon le moment où elles peuvent apparaître dans la conversation. Ouvrez une catégorie pour gérer son contenu. "),
                            createVNode("span", { class: "required-note" }, "* Catégorie obligatoire")
                          ]),
                          createVNode("details", { class: "variables-help" }, [
                            createVNode("summary", null, "Variables utilisables dans les phrases"),
                            createVNode("p", null, toDisplayString(unref(placeholdersLabel)), 1)
                          ]),
                          createVNode("div", { class: "reply-groups" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(COACH_EVENTS), (eventType) => {
                              return openBlock(), createBlock("details", {
                                key: eventType,
                                class: "reply-group",
                                open: eventType === "introduction"
                              }, [
                                createVNode("summary", { class: "reply-group__summary" }, [
                                  createVNode("span", { class: "reply-group__heading" }, [
                                    createVNode("strong", null, [
                                      createTextVNode(toDisplayString(EVENT_LABELS[eventType]), 1),
                                      unref(REQUIRED_REPLY_EVENTS).has(eventType) ? (openBlock(), createBlock("span", {
                                        key: 0,
                                        class: "required-mark",
                                        "aria-label": "obligatoire"
                                      }, " *")) : createCommentVNode("", true)
                                    ]),
                                    createVNode("small", null, toDisplayString(EVENT_DESCRIPTIONS[eventType]), 1)
                                  ]),
                                  createVNode("span", {
                                    class: ["reply-group__count", { "is-empty": activeReplyCount(eventType) === 0 }]
                                  }, toDisplayString(activeReplyCount(eventType)) + " active(s)", 3)
                                ]),
                                createVNode("div", { class: "reply-group__body" }, [
                                  !repliesFor(eventType).length ? (openBlock(), createBlock("div", {
                                    key: 0,
                                    class: "reply-group__empty"
                                  }, [
                                    createVNode("span", null, "Aucune phrase dans cette catégorie."),
                                    unref(REQUIRED_REPLY_EVENTS).has(eventType) ? (openBlock(), createBlock("small", { key: 0 }, "Au moins une phrase active est nécessaire pour publier ce caractère.")) : createCommentVNode("", true)
                                  ])) : (openBlock(), createBlock("div", {
                                    key: 1,
                                    class: "reply-list"
                                  }, [
                                    (openBlock(true), createBlock(Fragment, null, renderList(repliesFor(eventType), (reply) => {
                                      return openBlock(), createBlock("article", {
                                        key: reply.id || unref(draft).replies.indexOf(reply),
                                        class: ["reply-card", { "is-inactive": !reply.isActive }]
                                      }, [
                                        createVNode("label", { class: "reply-card__content" }, [
                                          createVNode("span", null, "Phrase"),
                                          withDirectives(createVNode("textarea", {
                                            "onUpdate:modelValue": ($event) => reply.content = $event,
                                            rows: "2",
                                            required: ""
                                          }, null, 8, ["onUpdate:modelValue"]), [
                                            [vModelText, reply.content]
                                          ])
                                        ]),
                                        createVNode("div", { class: "reply-card__settings" }, [
                                          createVNode("label", { class: "reply-active" }, [
                                            withDirectives(createVNode("input", {
                                              "onUpdate:modelValue": ($event) => reply.isActive = $event,
                                              type: "checkbox"
                                            }, null, 8, ["onUpdate:modelValue"]), [
                                              [vModelCheckbox, reply.isActive]
                                            ]),
                                            createVNode("span", null, "Active")
                                          ]),
                                          createVNode("label", { class: "reply-weight" }, [
                                            createVNode("span", null, "Fréquence"),
                                            withDirectives(createVNode("input", {
                                              "onUpdate:modelValue": ($event) => reply.weight = $event,
                                              type: "number",
                                              min: "1",
                                              max: "20"
                                            }, null, 8, ["onUpdate:modelValue"]), [
                                              [
                                                vModelText,
                                                reply.weight,
                                                void 0,
                                                { number: true }
                                              ]
                                            ]),
                                            createVNode("small", null, "1 = rare, 20 = fréquente")
                                          ]),
                                          createVNode("button", {
                                            type: "button",
                                            class: "reply-delete",
                                            "aria-label": "Supprimer cette phrase",
                                            onClick: ($event) => removeReply(reply)
                                          }, "Supprimer", 8, ["onClick"])
                                        ])
                                      ], 2);
                                    }), 128))
                                  ])),
                                  createVNode("button", {
                                    type: "button",
                                    class: "admin-button admin-button--small reply-add",
                                    onClick: ($event) => addReply(eventType)
                                  }, "+ Ajouter une phrase", 8, ["onClick"])
                                ])
                              ], 8, ["open"]);
                            }), 128))
                          ])
                        ]),
                        createVNode("section", { class: "admin-card caractere-panel reaction-media-panel" }, [
                          createVNode("div", { class: "panel-title" }, [
                            createVNode("div", null, [
                              createVNode("p", { class: "admin-eyebrow" }, "Réactions partagées"),
                              createVNode("h2", null, "GIF animés et émojis")
                            ]),
                            createVNode("strong", null, toDisplayString(unref(draft).assignments.length) + " attribué(s)", 1)
                          ]),
                          createVNode("h3", null, "Fréquence des réactions"),
                          createVNode("div", { class: "rule-list" }, [
                            (openBlock(), createBlock(Fragment, null, renderList(REACTION_EVENTS, (eventType) => {
                              return createVNode("div", { key: eventType }, [
                                createVNode("button", {
                                  type: "button",
                                  onClick: ($event) => ensureRule(eventType)
                                }, toDisplayString(EVENT_LABELS[eventType]), 9, ["onClick"]),
                                ruleFor(eventType) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                  createVNode("label", null, [
                                    createTextVNode("GIF animés "),
                                    createVNode("select", {
                                      value: ruleFor(eventType)?.animationProbability,
                                      onChange: ($event) => updateRule(eventType, "animationProbability", inputValue($event))
                                    }, [
                                      (openBlock(), createBlock(Fragment, null, renderList(MEDIA_FREQUENCY_OPTIONS, (option) => {
                                        return createVNode("option", {
                                          key: `animation-${eventType}-${option.value}`,
                                          value: option.value
                                        }, toDisplayString(option.label), 9, ["value"]);
                                      }), 64))
                                    ], 40, ["value", "onChange"])
                                  ]),
                                  createVNode("label", null, [
                                    createTextVNode("Émojis "),
                                    createVNode("select", {
                                      value: ruleFor(eventType)?.emojiProbability,
                                      onChange: ($event) => updateRule(eventType, "emojiProbability", inputValue($event))
                                    }, [
                                      (openBlock(), createBlock(Fragment, null, renderList(MEDIA_FREQUENCY_OPTIONS, (option) => {
                                        return createVNode("option", {
                                          key: `emoji-${eventType}-${option.value}`,
                                          value: option.value
                                        }, toDisplayString(option.label), 9, ["value"]);
                                      }), 64))
                                    ], 40, ["value", "onChange"])
                                  ]),
                                  createVNode("label", null, [
                                    createTextVNode("Pause "),
                                    createVNode("input", {
                                      value: ruleFor(eventType)?.cooldownQuestions,
                                      type: "number",
                                      min: "0",
                                      onInput: ($event) => updateRule(eventType, "cooldownQuestions", inputValue($event))
                                    }, null, 40, ["value", "onInput"])
                                  ])
                                ], 64)) : createCommentVNode("", true)
                              ]);
                            }), 64))
                          ]),
                          createVNode("div", { class: "response-media-groups" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(responseMediaGroups), (group) => {
                              return openBlock(), createBlock("section", {
                                key: group.key,
                                class: ["response-media-group", `response-media-group--${group.key}`]
                              }, [
                                createVNode("header", null, [
                                  createVNode("div", null, [
                                    createVNode("p", { class: "admin-eyebrow" }, toDisplayString(group.title), 1),
                                    createVNode("h3", null, toDisplayString(group.title), 1),
                                    createVNode("small", null, toDisplayString(group.description), 1)
                                  ]),
                                  createVNode("div", { class: "media-selection-actions" }, [
                                    createVNode("strong", null, toDisplayString(assignedMediaCount(group.items, group.key)) + "/" + toDisplayString(group.items.length), 1),
                                    createVNode("button", {
                                      type: "button",
                                      class: "admin-button admin-button--small",
                                      onClick: ($event) => setResponseMediaSelection(group.key, true)
                                    }, "Tout sélectionner", 8, ["onClick"]),
                                    createVNode("button", {
                                      type: "button",
                                      class: "admin-button admin-button--small",
                                      onClick: ($event) => setResponseMediaSelection(group.key, false)
                                    }, "Tout désélectionner", 8, ["onClick"])
                                  ])
                                ]),
                                !group.items.length ? (openBlock(), createBlock("p", {
                                  key: 0,
                                  class: "admin-muted"
                                }, "Aucun média dans cette catégorie.")) : (openBlock(), createBlock("div", {
                                  key: 1,
                                  class: "media-grid"
                                }, [
                                  (openBlock(true), createBlock(Fragment, null, renderList(group.items, (item) => {
                                    return openBlock(), createBlock("article", {
                                      key: item.id,
                                      class: { assigned: assignmentFor(item.id, group.key) }
                                    }, [
                                      createVNode("button", {
                                        type: "button",
                                        class: "media-delete-button",
                                        "aria-label": `Supprimer définitivement ${item.name}`,
                                        title: "Supprimer définitivement",
                                        onClick: withModifiers(($event) => deleteMedia(item), ["stop"])
                                      }, "×", 8, ["aria-label", "onClick"]),
                                      createVNode("button", {
                                        type: "button",
                                        onClick: ($event) => toggleResponseMedia(item, group.key)
                                      }, [
                                        createVNode("img", {
                                          src: item.filePath,
                                          alt: item.altText
                                        }, null, 8, ["src", "alt"]),
                                        createVNode("span", null, toDisplayString(assignmentFor(item.id, group.key) ? "✓" : "+"), 1)
                                      ], 8, ["onClick"]),
                                      createVNode("strong", null, toDisplayString(item.name), 1),
                                      assignmentFor(item.id, group.key) ? (openBlock(), createBlock("label", { key: 0 }, [
                                        createTextVNode("Poids "),
                                        createVNode("input", {
                                          value: assignmentFor(item.id, group.key)?.weight,
                                          type: "number",
                                          min: "1",
                                          max: "20",
                                          onInput: ($event) => updateAssignment(item.id, "weight", inputValue($event))
                                        }, null, 40, ["value", "onInput"])
                                      ])) : createCommentVNode("", true)
                                    ], 2);
                                  }), 128))
                                ])),
                                group.key === "incorrect" && assignedMediaCount(group.items, group.key) === 0 ? (openBlock(), createBlock("p", {
                                  key: 2,
                                  class: "response-media-group__text-only"
                                }, "Aucun média sélectionné : les mauvaises réponses utiliseront uniquement du texte.")) : createCommentVNode("", true)
                              ], 2);
                            }), 128))
                          ]),
                          unref(otherReactionMedia).length ? (openBlock(), createBlock("details", {
                            key: 0,
                            class: "other-reaction-media"
                          }, [
                            createVNode("summary", null, "Autres moments de la conversation · " + toDisplayString(unref(otherReactionMedia).length) + " média(s)", 1),
                            createVNode("div", { class: "media-grid" }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(otherReactionMedia), (item) => {
                                return openBlock(), createBlock("article", {
                                  key: item.id,
                                  class: { assigned: assignmentFor(item.id) }
                                }, [
                                  createVNode("button", {
                                    type: "button",
                                    class: "media-delete-button",
                                    "aria-label": `Supprimer définitivement ${item.name}`,
                                    title: "Supprimer définitivement",
                                    onClick: withModifiers(($event) => deleteMedia(item), ["stop"])
                                  }, "×", 8, ["aria-label", "onClick"]),
                                  createVNode("button", {
                                    type: "button",
                                    onClick: ($event) => toggleMedia(item)
                                  }, [
                                    createVNode("img", {
                                      src: item.filePath,
                                      alt: item.altText
                                    }, null, 8, ["src", "alt"]),
                                    createVNode("span", null, toDisplayString(assignmentFor(item.id) ? "✓" : "+"), 1)
                                  ], 8, ["onClick"]),
                                  createVNode("strong", null, toDisplayString(item.name), 1),
                                  assignmentFor(item.id) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                    createVNode("select", {
                                      value: assignmentFor(item.id)?.eventType,
                                      onChange: ($event) => updateAssignment(item.id, "eventType", inputValue($event))
                                    }, [
                                      (openBlock(true), createBlock(Fragment, null, renderList(unref(COACH_EVENTS), (eventType) => {
                                        return openBlock(), createBlock("option", {
                                          key: eventType,
                                          value: eventType
                                        }, toDisplayString(EVENT_LABELS[eventType]), 9, ["value"]);
                                      }), 128))
                                    ], 40, ["value", "onChange"]),
                                    createVNode("label", null, [
                                      createTextVNode("Poids "),
                                      createVNode("input", {
                                        value: assignmentFor(item.id)?.weight,
                                        type: "number",
                                        min: "1",
                                        max: "20",
                                        onInput: ($event) => updateAssignment(item.id, "weight", inputValue($event))
                                      }, null, 40, ["value", "onInput"])
                                    ])
                                  ], 64)) : createCommentVNode("", true)
                                ], 2);
                              }), 128))
                            ])
                          ])) : createCommentVNode("", true)
                        ]),
                        createVNode("div", { class: "save-bar" }, [
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
                            onClick: autosaveCaractere
                          }, "Réessayer")) : createCommentVNode("", true)
                        ])
                      ], 40, ["onSubmit"])) : createCommentVNode("", true)
                    ])) : (openBlock(), createBlock("div", {
                      key: 3,
                      class: "media-workspace"
                    }, [
                      createVNode("aside", { class: "media-library admin-card" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(media), (item) => {
                          return openBlock(), createBlock("button", {
                            key: item.id,
                            class: { selected: item.id === unref(selectedMediaId) },
                            onClick: ($event) => selectMedia(item)
                          }, [
                            createVNode("img", {
                              src: item.filePath,
                              alt: item.altText
                            }, null, 8, ["src", "alt"]),
                            createVNode("span", null, [
                              createVNode("strong", null, toDisplayString(item.name), 1),
                              createVNode("small", null, toDisplayString(item.mediaType) + " · " + toDisplayString(item.safetyStatus), 1)
                            ])
                          ], 10, ["onClick"]);
                        }), 128))
                      ]),
                      createVNode("form", {
                        class: "admin-card media-editor",
                        onSubmit: withModifiers(saveMedia, ["prevent"])
                      }, [
                        createVNode("div", { class: "panel-title" }, [
                          createVNode("h2", null, toDisplayString(unref(mediaDraft).id ? "Modifier le média" : "Ajouter un média"), 1),
                          unref(mediaDraft).filePath && unref(mediaDraft).mediaType !== "video" ? (openBlock(), createBlock("img", {
                            key: 0,
                            src: unref(mediaDraft).filePath,
                            alt: "Aperçu"
                          }, null, 8, ["src"])) : createCommentVNode("", true)
                        ]),
                        createVNode("label", { class: "admin-field" }, [
                          createVNode("span", null, "Importer"),
                          createVNode("input", {
                            type: "file",
                            accept: "image/png,image/jpeg,image/gif,image/webp,video/mp4,video/webm",
                            disabled: unref(uploading),
                            onChange: uploadMedia
                          }, null, 40, ["disabled"])
                        ]),
                        createVNode("label", { class: "admin-field" }, [
                          createVNode("span", null, "Nom *"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(mediaDraft).name = $event,
                            required: ""
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(mediaDraft).name]
                          ])
                        ]),
                        createVNode("label", { class: "admin-field" }, [
                          createVNode("span", null, "Chemin *"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(mediaDraft).filePath = $event,
                            required: ""
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(mediaDraft).filePath]
                          ])
                        ]),
                        createVNode("div", { class: "caractere-fields" }, [
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Type"),
                            withDirectives(createVNode("select", {
                              "onUpdate:modelValue": ($event) => unref(mediaDraft).mediaType = $event
                            }, [
                              createVNode("option", null, "emoji"),
                              createVNode("option", null, "animation"),
                              createVNode("option", null, "video"),
                              createVNode("option", null, "image")
                            ], 8, ["onUpdate:modelValue"]), [
                              [vModelSelect, unref(mediaDraft).mediaType]
                            ])
                          ]),
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Catégorie"),
                            withDirectives(createVNode("select", {
                              "onUpdate:modelValue": ($event) => unref(mediaDraft).category = $event
                            }, [
                              createVNode("option", { value: "success" }, "Réussite"),
                              createVNode("option", { value: "encouragement" }, "Encouragement"),
                              createVNode("option", { value: "finish" }, "Fin"),
                              createVNode("option", { value: "welcome" }, "Accueil"),
                              createVNode("option", { value: "neutral" }, "Neutre")
                            ], 8, ["onUpdate:modelValue"]), [
                              [vModelSelect, unref(mediaDraft).category]
                            ])
                          ]),
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Droits"),
                            withDirectives(createVNode("select", {
                              "onUpdate:modelValue": ($event) => unref(mediaDraft).rightsStatus = $event
                            }, [
                              createVNode("option", { value: "pending" }, "À vérifier"),
                              createVNode("option", { value: "verified" }, "Vérifiés"),
                              createVNode("option", { value: "rejected" }, "Refusés")
                            ], 8, ["onUpdate:modelValue"]), [
                              [vModelSelect, unref(mediaDraft).rightsStatus]
                            ])
                          ]),
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Sécurité mineurs"),
                            withDirectives(createVNode("select", {
                              "onUpdate:modelValue": ($event) => unref(mediaDraft).safetyStatus = $event
                            }, [
                              createVNode("option", { value: "pending" }, "À vérifier"),
                              createVNode("option", { value: "approved" }, "Approuvée"),
                              createVNode("option", { value: "rejected" }, "Refusée")
                            ], 8, ["onUpdate:modelValue"]), [
                              [vModelSelect, unref(mediaDraft).safetyStatus]
                            ])
                          ])
                        ]),
                        createVNode("label", { class: "admin-field" }, [
                          createVNode("span", null, "Texte alternatif *"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(mediaDraft).altText = $event,
                            required: ""
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, unref(mediaDraft).altText]
                          ])
                        ]),
                        createVNode("button", {
                          class: "admin-button admin-button--primary",
                          disabled: unref(saving) || unref(uploading)
                        }, "Enregistrer le média", 8, ["disabled"])
                      ], 32)
                    ])),
                    (openBlock(), createBlock(Teleport, { to: "body" }, [
                      unref(approachManagerOpen) ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "icon-picker-backdrop",
                        onClick: withModifiers(closeApproachManager, ["self"]),
                        onKeydown: withKeys(withModifiers(closeApproachManager, ["prevent"]), ["esc"])
                      }, [
                        createVNode("section", {
                          class: "icon-picker approach-manager",
                          role: "dialog",
                          "aria-modal": "true",
                          "aria-labelledby": "approach-manager-title"
                        }, [
                          createVNode("header", null, [
                            createVNode("div", null, [
                              createVNode("p", { class: "admin-eyebrow" }, "Aides automatiques"),
                              createVNode("h2", { id: "approach-manager-title" }, "Gérer les approches")
                            ]),
                            createVNode("button", {
                              type: "button",
                              class: "icon-picker__close",
                              "aria-label": "Fermer",
                              disabled: Boolean(unref(approachSaving)),
                              onClick: closeApproachManager
                            }, "×", 8, ["disabled"])
                          ]),
                          createVNode("p", { class: "approach-manager__intro" }, "Le nom est libre. Le comportement moteur indique la stratégie utilisée par le générateur automatique."),
                          unref(approachError) ? (openBlock(), createBlock("p", {
                            key: 0,
                            class: "admin-notice admin-notice--error"
                          }, toDisplayString(unref(approachError)), 1)) : createCommentVNode("", true),
                          createVNode("div", { class: "approach-manager__list" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(approachDrafts), (approach) => {
                              return openBlock(), createBlock("article", {
                                key: approach.id
                              }, [
                                createVNode("label", { class: "admin-field" }, [
                                  createVNode("span", null, "Nom"),
                                  withDirectives(createVNode("input", {
                                    "onUpdate:modelValue": ($event) => approach.name = $event,
                                    maxlength: "80"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, approach.name]
                                  ])
                                ]),
                                createVNode("label", { class: "admin-field" }, [
                                  createVNode("span", null, "Comportement moteur"),
                                  withDirectives(createVNode("select", {
                                    "onUpdate:modelValue": ($event) => approach.engineKey = $event
                                  }, [
                                    createVNode("option", { value: "complete-avec-reponses" }, "Complète avec réponses"),
                                    createVNode("option", { value: "complete" }, "Complète sans réponses"),
                                    createVNode("option", { value: "tres-condensee" }, "Très condensée"),
                                    createVNode("option", { value: "allophone" }, "Allophone")
                                  ], 8, ["onUpdate:modelValue"]), [
                                    [vModelSelect, approach.engineKey]
                                  ])
                                ]),
                                createVNode("label", { class: "admin-field" }, [
                                  createVNode("span", null, "Statut"),
                                  withDirectives(createVNode("select", {
                                    "onUpdate:modelValue": ($event) => approach.status = $event
                                  }, [
                                    createVNode("option", { value: "draft" }, "Brouillon"),
                                    createVNode("option", { value: "published" }, "Publié"),
                                    createVNode("option", { value: "disabled" }, "Désactivé")
                                  ], 8, ["onUpdate:modelValue"]), [
                                    [vModelSelect, approach.status]
                                  ])
                                ]),
                                createVNode("span", { class: "approach-manager__usage" }, toDisplayString(approach.characterCount) + " caractère" + toDisplayString(approach.characterCount > 1 ? "s" : ""), 1),
                                createVNode("button", {
                                  type: "button",
                                  class: "admin-button admin-button--small",
                                  disabled: Boolean(unref(approachSaving)) || !approach.name.trim(),
                                  onClick: ($event) => saveHelpApproach(approach)
                                }, toDisplayString(unref(approachSaving) === approach.id ? "Enregistrement…" : "Enregistrer"), 9, ["disabled", "onClick"]),
                                createVNode("button", {
                                  type: "button",
                                  class: "admin-button admin-button--danger admin-button--small",
                                  disabled: Boolean(unref(approachSaving)) || approach.characterCount > 0,
                                  title: approach.characterCount ? "Cette approche est encore utilisée" : "Supprimer cette approche",
                                  onClick: ($event) => deleteHelpApproach(approach)
                                }, "Supprimer", 8, ["disabled", "title", "onClick"])
                              ]);
                            }), 128))
                          ]),
                          createVNode("form", {
                            class: "approach-manager__new",
                            onSubmit: withModifiers(createHelpApproach, ["prevent"])
                          }, [
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Nouvelle approche"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => isRef(newApproachName) ? newApproachName.value = $event : null,
                                maxlength: "80",
                                placeholder: "Nom de l’approche"
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelText, unref(newApproachName)]
                              ])
                            ]),
                            createVNode("button", {
                              class: "admin-button admin-button--primary",
                              disabled: Boolean(unref(approachSaving)) || !unref(newApproachName).trim()
                            }, toDisplayString(unref(approachSaving) === "new" ? "Ajout…" : "Ajouter"), 9, ["disabled"])
                          ], 32)
                        ])
                      ], 40, ["onKeydown"])) : createCommentVNode("", true)
                    ])),
                    (openBlock(), createBlock(Teleport, { to: "body" }, [
                      unref(iconPickerOpen) ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "icon-picker-backdrop",
                        onClick: withModifiers(closeIconPicker, ["self"]),
                        onKeydown: withKeys(withModifiers(closeIconPicker, ["prevent"]), ["esc"])
                      }, [
                        createVNode("section", {
                          ref_key: "iconPicker",
                          ref: iconPicker,
                          class: "icon-picker",
                          role: "dialog",
                          "aria-modal": "true",
                          "aria-labelledby": "icon-picker-title"
                        }, [
                          createVNode("header", null, [
                            createVNode("div", null, [
                              createVNode("p", { class: "admin-eyebrow" }, "Caractère"),
                              createVNode("h2", { id: "icon-picker-title" }, "Choisir une icône")
                            ]),
                            createVNode("button", {
                              type: "button",
                              class: "icon-picker__close",
                              "aria-label": "Fermer",
                              onClick: closeIconPicker
                            }, "×")
                          ]),
                          createVNode("div", { class: "icon-picker__groups" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(caractereIconGroups), (group) => {
                              return openBlock(), createBlock("section", {
                                key: group.label
                              }, [
                                createVNode("h3", null, toDisplayString(group.label), 1),
                                createVNode("div", { class: "icon-picker__grid" }, [
                                  (openBlock(true), createBlock(Fragment, null, renderList(group.icons, (icon) => {
                                    return openBlock(), createBlock("button", {
                                      key: icon.value,
                                      type: "button",
                                      title: icon.label,
                                      "aria-label": icon.label,
                                      "aria-pressed": unref(draft)?.emoticon === icon.value,
                                      onClick: ($event) => selectCaractereIcon(icon.value)
                                    }, [
                                      createVNode("span", { "aria-hidden": "true" }, toDisplayString(icon.value), 1),
                                      createVNode("small", null, toDisplayString(icon.label), 1)
                                    ], 8, ["title", "aria-label", "aria-pressed", "onClick"]);
                                  }), 128))
                                ])
                              ]);
                            }), 128))
                          ]),
                          createVNode("p", { class: "icon-picker__hint" }, "Le choix est enregistré immédiatement.")
                        ], 512)
                      ], 40, ["onKeydown"])) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/caracteres.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const caracteres = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-94e140ef"]]);

export { caracteres as default };
//# sourceMappingURL=caracteres-DpL0k9FB.mjs.map
