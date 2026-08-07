import { u as useAdminAuth, _ as __nuxt_component_0, a as __nuxt_component_1, g as getAdminErrorMessage } from './AdminShell-Sgl2pXrT.mjs';
import { defineComponent, ref, computed, watch, withCtx, unref, createVNode, openBlock, createBlock, toDisplayString, createCommentVNode, Fragment, renderList, withDirectives, vShow, withModifiers, vModelCheckbox, vModelText, vModelSelect, isRef, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderClass, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderStyle, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
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
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "challenges",
  __ssrInlineRender: true,
  setup(__props) {
    const COMPLEMENT_OPTIONS = [
      { value: "cod-after", label: "COD après le verbe" },
      { value: "cod-before", label: "COD avant le verbe" },
      { value: "coi-after", label: "COI après le verbe" },
      { value: "coi-before", label: "COI avant le verbe" }
    ];
    const { user, handleUnauthorized } = useAdminAuth();
    const tab = ref("presets");
    const categories = ref([]);
    const presets = ref([]);
    const verbs = ref([]);
    const modes = ref([]);
    const tenses = ref([]);
    const presetDraft = ref(null);
    const categoryDraft = ref(null);
    const openPresetCategoryId = ref(null);
    const draggedPresetId = ref(null);
    const dragOverPresetId = ref(null);
    const draggedCategoryId = ref(null);
    const dragOverCategoryId = ref(null);
    const verbSearch = ref("");
    const loading = ref(false);
    const presetSaving = ref(false);
    const categorySaving = ref(false);
    const saving = computed(() => presetSaving.value || categorySaving.value);
    const presetAutosaveState = ref("idle");
    const categoryAutosaveState = ref("idle");
    const error = ref("");
    const success = ref("");
    let loadedForUserId = null;
    let presetAutosaveTimer = null;
    let categoryAutosaveTimer = null;
    let lastPresetSnapshot = "";
    let lastCategorySnapshot = "";
    let suspendAutosave = false;
    useHead({ title: "Défis — Administration" });
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const sortedCategories = computed(() => [...categories.value].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "fr")));
    const sortedPresets = computed(() => [...presets.value].sort((a, b) => {
      const categoryA = categories.value.find((category) => category.id === a.categoryId);
      const categoryB = categories.value.find((category) => category.id === b.categoryId);
      return (categoryA?.sortOrder ?? 0) - (categoryB?.sortOrder ?? 0) || a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, "fr");
    }));
    const presetGroups = computed(() => sortedCategories.value.map((category) => ({
      category,
      presets: sortedPresets.value.filter((preset) => preset.categoryId === category.id)
    })).filter((group) => group.presets.length));
    const filteredVerbs = computed(() => {
      const query = verbSearch.value.trim().toLocaleLowerCase("fr");
      return verbs.value.filter((verb) => !query || verb.infinitif.toLocaleLowerCase("fr").includes(query));
    });
    const selectedVerbs = computed(() => {
      const selectedIds = new Set(presetDraft.value?.verbIds ?? []);
      const known = verbs.value.filter((verb) => selectedIds.has(verb.id)).sort((a, b) => a.infinitif.localeCompare(b.infinitif, "fr") || a.id - b.id);
      const knownIds = new Set(known.map((verb) => verb.id));
      const missing = [...selectedIds].filter((id) => !knownIds.has(id)).map((id) => ({ id, infinitif: `Verbe ${id}` }));
      return [...known, ...missing];
    });
    const tensesByMode = computed(() => modes.value.map((mode) => ({
      mode,
      tenses: tenses.value.filter((tense) => tense.modeId === mode.id)
    })).filter((group) => group.tenses.length));
    const presetAutosaveLabel = computed(() => {
      if (presetAutosaveState.value === "saving") return "Enregistrement…";
      if (presetAutosaveState.value === "dirty") return "Modification en attente — complète les champs obligatoires si nécessaire.";
      if (presetAutosaveState.value === "error") return "Échec de l’enregistrement automatique.";
      return "Toutes les modifications sont enregistrées.";
    });
    const categoryAutosaveLabel = computed(() => {
      if (categoryAutosaveState.value === "saving") return "Enregistrement…";
      if (categoryAutosaveState.value === "dirty") return "Modification en attente — complète le nom et l’identifiant.";
      if (categoryAutosaveState.value === "error") return "Échec de l’enregistrement automatique.";
      return "Toutes les modifications sont enregistrées.";
    });
    function setPresetDraft(preset) {
      suspendAutosave = true;
      presetDraft.value = preset ? clone(preset) : null;
      lastPresetSnapshot = presetDraft.value ? JSON.stringify(presetDraft.value) : "";
      presetAutosaveState.value = presetDraft.value ? "saved" : "idle";
      suspendAutosave = false;
    }
    function setCategoryDraft(category) {
      suspendAutosave = true;
      categoryDraft.value = category ? clone(category) : null;
      lastCategorySnapshot = categoryDraft.value ? JSON.stringify(categoryDraft.value) : "";
      categoryAutosaveState.value = categoryDraft.value ? "saved" : "idle";
      suspendAutosave = false;
    }
    function nextPresetOrder(categoryId) {
      return presets.value.filter((preset) => preset.categoryId === categoryId && preset.databaseId !== presetDraft.value?.databaseId).reduce((maximum, preset) => Math.max(maximum, preset.sortOrder), 0) + 1;
    }
    function assignNextPresetOrder() {
      if (presetDraft.value) presetDraft.value.sortOrder = nextPresetOrder(presetDraft.value.categoryId);
    }
    async function selectPreset(preset) {
      await flushPresetAutosave();
      setPresetDraft(preset);
      openPresetCategoryId.value = preset.categoryId;
      verbSearch.value = "";
      error.value = "";
      success.value = "";
    }
    async function createPreset() {
      await flushPresetAutosave();
      const category = sortedCategories.value[0];
      openPresetCategoryId.value = category?.id ?? null;
      setPresetDraft({
        databaseId: 0,
        id: "",
        label: "",
        description: "",
        group: category?.slug ?? "",
        groupLabel: category?.name ?? "",
        categoryId: category?.id ?? 0,
        verbIds: [],
        tenseIds: [],
        questionCount: 10,
        exerciseKind: "conjugation",
        identificationSource: "selected-verbs",
        pastSimplePronouns: "all",
        inclusivePronouns: false,
        includeOnPronoun: false,
        voiceMode: "active",
        includeComplements: true,
        complementPlacement: "mixed",
        complementOptions: ["cod-after", "coi-after"],
        sortOrder: nextPresetOrder(category?.id ?? 0),
        isActive: true,
        verbSelectionMode: "explicit"
      });
      lastPresetSnapshot = "";
      presetAutosaveState.value = "dirty";
      error.value = "";
      success.value = "";
    }
    function togglePresetCategory(categoryId) {
      openPresetCategoryId.value = openPresetCategoryId.value === categoryId ? null : categoryId;
    }
    function startPresetDrag(preset, event) {
      if (!preset.databaseId) return;
      draggedPresetId.value = preset.databaseId;
      dragOverPresetId.value = preset.databaseId;
      event.dataTransfer?.setData("text/plain", String(preset.databaseId));
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
    }
    function endPresetDrag() {
      draggedPresetId.value = null;
      dragOverPresetId.value = null;
    }
    function overPresetDrag(preset, event) {
      const dragged = presets.value.find((item) => item.databaseId === draggedPresetId.value);
      if (!dragged || dragged.categoryId !== preset.categoryId) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
      dragOverPresetId.value = preset.databaseId;
    }
    async function dropPreset(preset, event) {
      event.preventDefault();
      const dragged = presets.value.find((item) => item.databaseId === draggedPresetId.value);
      if (!dragged || dragged.databaseId === preset.databaseId || dragged.categoryId !== preset.categoryId) {
        endPresetDrag();
        return;
      }
      const categoryPresets = sortedPresets.value.filter((item) => item.categoryId === preset.categoryId);
      const originalOrders = new Map(categoryPresets.map((item) => [item.databaseId, item.sortOrder]));
      const reordered = categoryPresets.filter((item) => item.databaseId !== dragged.databaseId);
      let targetIndex = reordered.findIndex((item) => item.databaseId === preset.databaseId);
      const target = event.currentTarget;
      if (target && event.clientY > target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2) targetIndex += 1;
      reordered.splice(Math.max(0, targetIndex), 0, dragged);
      for (const [index, item] of reordered.entries()) item.sortOrder = index + 1;
      if (presetDraft.value && presetDraft.value.categoryId === preset.categoryId) {
        const selected = reordered.find((item) => item.databaseId === presetDraft.value?.databaseId);
        if (selected) presetDraft.value.sortOrder = selected.sortOrder;
        lastPresetSnapshot = JSON.stringify(presetDraft.value);
        cancelPresetAutosave();
      }
      presetAutosaveState.value = "saving";
      endPresetDrag();
      try {
        await $fetch("/api/admin/challenge-presets/reorder", {
          method: "PUT",
          body: { categoryId: preset.categoryId, orderedIds: reordered.map((item) => item.databaseId) }
        });
        presetAutosaveState.value = "saved";
      } catch (caught) {
        for (const item of categoryPresets) item.sortOrder = originalOrders.get(item.databaseId) ?? item.sortOrder;
        if (presetDraft.value && presetDraft.value.categoryId === preset.categoryId) {
          const restored = categoryPresets.find((item) => item.databaseId === presetDraft.value?.databaseId);
          if (restored) presetDraft.value.sortOrder = restored.sortOrder;
          lastPresetSnapshot = JSON.stringify(presetDraft.value);
        }
        presetAutosaveState.value = "error";
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible d’enregistrer le nouvel ordre.");
      }
    }
    function startCategoryDrag(category, event) {
      if (!category.id) return;
      draggedCategoryId.value = category.id;
      dragOverCategoryId.value = category.id;
      event.dataTransfer?.setData("text/plain", String(category.id));
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
    }
    function endCategoryDrag() {
      draggedCategoryId.value = null;
      dragOverCategoryId.value = null;
    }
    function overCategoryDrag(category, event) {
      if (!draggedCategoryId.value) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
      dragOverCategoryId.value = category.id;
    }
    async function dropCategory(category, event) {
      event.preventDefault();
      const dragged = categories.value.find((item) => item.id === draggedCategoryId.value);
      if (!dragged || dragged.id === category.id) {
        endCategoryDrag();
        return;
      }
      const ordered = [...sortedCategories.value];
      const originalOrders = new Map(ordered.map((item) => [item.id, item.sortOrder]));
      const reordered = ordered.filter((item) => item.id !== dragged.id);
      let targetIndex = reordered.findIndex((item) => item.id === category.id);
      const target = event.currentTarget;
      if (target && event.clientY > target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2) targetIndex += 1;
      reordered.splice(Math.max(0, targetIndex), 0, dragged);
      for (const [index, item] of reordered.entries()) item.sortOrder = index + 1;
      if (categoryDraft.value) {
        const selected = reordered.find((item) => item.id === categoryDraft.value?.id);
        if (selected) categoryDraft.value.sortOrder = selected.sortOrder;
        lastCategorySnapshot = JSON.stringify(categoryDraft.value);
        cancelCategoryAutosave();
      }
      categoryAutosaveState.value = "saving";
      endCategoryDrag();
      try {
        await $fetch("/api/admin/challenge-preset-categories/reorder", {
          method: "PUT",
          body: { orderedIds: reordered.map((item) => item.id) }
        });
        for (const preset of presets.value) {
          const presetCategory = reordered.find((item) => item.id === preset.categoryId);
          if (presetCategory) preset.groupOrder = presetCategory.sortOrder;
        }
        categoryAutosaveState.value = "saved";
      } catch (caught) {
        for (const item of ordered) item.sortOrder = originalOrders.get(item.id) ?? item.sortOrder;
        if (categoryDraft.value) {
          const restored = ordered.find((item) => item.id === categoryDraft.value?.id);
          if (restored) categoryDraft.value.sortOrder = restored.sortOrder;
          lastCategorySnapshot = JSON.stringify(categoryDraft.value);
        }
        categoryAutosaveState.value = "error";
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible d’enregistrer l’ordre des catégories.");
      }
    }
    async function selectCategory(category) {
      await flushCategoryAutosave();
      setCategoryDraft(category);
      error.value = "";
      success.value = "";
    }
    async function createCategory() {
      await flushCategoryAutosave();
      setCategoryDraft({
        id: 0,
        slug: "",
        name: "",
        description: "",
        sortOrder: categories.value.length + 1,
        isActive: true
      });
      lastCategorySnapshot = "";
      categoryAutosaveState.value = "dirty";
      error.value = "";
      success.value = "";
    }
    function toggleId(ids, id) {
      const index = ids.indexOf(id);
      if (index >= 0) ids.splice(index, 1);
      else ids.push(id);
    }
    function toggleVerb(id) {
      if (!presetDraft.value) return;
      presetDraft.value.verbSelectionMode = "explicit";
      const wasSelected = presetDraft.value.verbIds.includes(id);
      toggleId(presetDraft.value.verbIds, id);
      if (!wasSelected) verbSearch.value = "";
    }
    function inputChecked(event) {
      return event.target.checked;
    }
    function setComplementOption(option, checked) {
      if (!presetDraft.value) return;
      const current = presetDraft.value.complementOptions;
      if (checked && !current.includes(option)) current.push(option);
      if (!checked) presetDraft.value.complementOptions = current.filter((item) => item !== option);
    }
    function setAllVisibleVerbs(selected) {
      if (!presetDraft.value) return;
      presetDraft.value.verbSelectionMode = "explicit";
      const visibleIds = new Set(filteredVerbs.value.map((verb) => verb.id));
      presetDraft.value.verbIds = selected ? [.../* @__PURE__ */ new Set([...presetDraft.value.verbIds, ...visibleIds])] : presetDraft.value.verbIds.filter((id) => !visibleIds.has(id));
    }
    function setModeTenses(modeId, selected) {
      if (!presetDraft.value) return;
      const ids = new Set(tenses.value.filter((tense) => tense.modeId === modeId).map((tense) => tense.id));
      presetDraft.value.tenseIds = selected ? [.../* @__PURE__ */ new Set([...presetDraft.value.tenseIds, ...ids])] : presetDraft.value.tenseIds.filter((id) => !ids.has(id));
    }
    async function load(preferredPresetId, preferredCategoryId) {
      loading.value = true;
      error.value = "";
      try {
        const response = await $fetch("/api/admin/challenge-presets");
        categories.value = response.categories;
        presets.value = response.presets;
        verbs.value = response.verbs;
        modes.value = response.modes;
        tenses.value = response.tenses;
        const selectedPresetId = preferredPresetId ?? presetDraft.value?.databaseId;
        const selectedPreset = presets.value.find((item) => item.databaseId === selectedPresetId) ?? presets.value[0];
        setPresetDraft(selectedPreset ?? null);
        openPresetCategoryId.value = null;
        const selectedCategoryId = preferredCategoryId ?? categoryDraft.value?.id;
        const selectedCategory = categories.value.find((item) => item.id === selectedCategoryId) ?? sortedCategories.value[0];
        setCategoryDraft(selectedCategory ?? null);
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible de charger les défis.");
      } finally {
        loading.value = false;
      }
    }
    function presetCanBeSaved(draft) {
      return Boolean(draft.id.trim() && draft.label.trim() && draft.categoryId && draft.verbIds.length && draft.tenseIds.length);
    }
    function categoryCanBeSaved(draft) {
      return Boolean(draft.slug.trim() && draft.name.trim());
    }
    function cancelPresetAutosave() {
      if (presetAutosaveTimer) clearTimeout(presetAutosaveTimer);
      presetAutosaveTimer = null;
    }
    function cancelCategoryAutosave() {
      if (categoryAutosaveTimer) clearTimeout(categoryAutosaveTimer);
      categoryAutosaveTimer = null;
    }
    function schedulePresetAutosave() {
      cancelPresetAutosave();
      const draft = presetDraft.value;
      if (!draft || JSON.stringify(draft) === lastPresetSnapshot) return;
      presetAutosaveState.value = "dirty";
      if (!presetCanBeSaved(draft)) return;
      presetAutosaveTimer = setTimeout(() => {
        void savePreset();
      }, 650);
    }
    function scheduleCategoryAutosave() {
      cancelCategoryAutosave();
      const draft = categoryDraft.value;
      if (!draft || JSON.stringify(draft) === lastCategorySnapshot) return;
      categoryAutosaveState.value = "dirty";
      if (!categoryCanBeSaved(draft)) return;
      categoryAutosaveTimer = setTimeout(() => {
        void saveCategory();
      }, 650);
    }
    async function flushPresetAutosave() {
      cancelPresetAutosave();
      const draft = presetDraft.value;
      if (draft && JSON.stringify(draft) !== lastPresetSnapshot && presetCanBeSaved(draft)) await savePreset();
    }
    async function flushCategoryAutosave() {
      cancelCategoryAutosave();
      const draft = categoryDraft.value;
      if (draft && JSON.stringify(draft) !== lastCategorySnapshot && categoryCanBeSaved(draft)) await saveCategory();
    }
    async function savePreset() {
      const draft = presetDraft.value;
      if (!draft || presetSaving.value || !presetCanBeSaved(draft)) return;
      cancelPresetAutosave();
      error.value = "";
      success.value = "";
      presetSaving.value = true;
      presetAutosaveState.value = "saving";
      const submitted = clone(draft);
      let saveSucceeded = false;
      try {
        const endpoint = submitted.databaseId ? `/api/admin/challenge-presets/${submitted.databaseId}` : "/api/admin/challenge-presets";
        const response = await $fetch(endpoint, {
          method: submitted.databaseId ? "PUT" : "POST",
          body: submitted
        });
        const id = response.id ?? submitted.databaseId;
        if (presetDraft.value === draft) {
          const changedDuringSave = JSON.stringify(draft) !== JSON.stringify(submitted);
          const orderChangedDuringSave = draft.sortOrder !== submitted.sortOrder;
          draft.databaseId = id;
          draft.verbSelectionMode = submitted.verbSelectionMode;
          for (const order of response.orders ?? []) {
            const listed = presets.value.find((item) => item.databaseId === order.id);
            if (listed) listed.sortOrder = order.sortOrder;
          }
          const appliedOrder = response.orders?.find((order) => order.id === id)?.sortOrder;
          if (appliedOrder && !orderChangedDuringSave) draft.sortOrder = appliedOrder;
          const category = categories.value.find((item) => item.id === draft.categoryId);
          draft.group = category?.slug ?? draft.group;
          draft.groupLabel = category?.name ?? draft.groupLabel;
          draft.groupOrder = category?.sortOrder ?? draft.groupOrder;
          const saved = clone(draft);
          const index = presets.value.findIndex((item) => item.databaseId === id);
          if (index >= 0) presets.value[index] = saved;
          else presets.value.push(saved);
          const stored = clone(submitted);
          stored.databaseId = id;
          stored.verbSelectionMode = submitted.verbSelectionMode;
          if (appliedOrder) stored.sortOrder = appliedOrder;
          const storedCategory = categories.value.find((item) => item.id === stored.categoryId);
          stored.group = storedCategory?.slug ?? stored.group;
          stored.groupLabel = storedCategory?.name ?? stored.groupLabel;
          stored.groupOrder = storedCategory?.sortOrder ?? stored.groupOrder;
          lastPresetSnapshot = JSON.stringify(stored);
          presetAutosaveState.value = changedDuringSave ? "dirty" : "saved";
          saveSucceeded = true;
        }
      } catch (caught) {
        presetAutosaveState.value = "error";
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible d’enregistrer automatiquement ce défi.");
      } finally {
        presetSaving.value = false;
        if (saveSucceeded && presetDraft.value && JSON.stringify(presetDraft.value) !== lastPresetSnapshot) schedulePresetAutosave();
      }
    }
    async function deletePreset() {
      const draft = presetDraft.value;
      if (!draft?.databaseId || saving.value || !confirm(`Supprimer le défi « ${draft.label} » ?`)) return;
      cancelPresetAutosave();
      presetSaving.value = true;
      try {
        await $fetch(`/api/admin/challenge-presets/${draft.databaseId}`, { method: "DELETE" });
        setPresetDraft(null);
        await load();
        success.value = "Défi supprimé.";
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible de supprimer ce défi.");
      } finally {
        presetSaving.value = false;
      }
    }
    async function saveCategory() {
      const draft = categoryDraft.value;
      if (!draft || categorySaving.value || !categoryCanBeSaved(draft)) return;
      cancelCategoryAutosave();
      error.value = "";
      success.value = "";
      categorySaving.value = true;
      categoryAutosaveState.value = "saving";
      const submitted = clone(draft);
      let saveSucceeded = false;
      try {
        const endpoint = submitted.id ? `/api/admin/challenge-preset-categories/${submitted.id}` : "/api/admin/challenge-preset-categories";
        const response = await $fetch(endpoint, { method: submitted.id ? "PUT" : "POST", body: submitted });
        const id = response.id ?? submitted.id;
        if (categoryDraft.value === draft) {
          const changedDuringSave = JSON.stringify(draft) !== JSON.stringify(submitted);
          draft.id = id;
          const saved = clone(draft);
          const index = categories.value.findIndex((item) => item.id === id);
          if (index >= 0) categories.value[index] = saved;
          else categories.value.push(saved);
          const stored = clone(submitted);
          stored.id = id;
          lastCategorySnapshot = JSON.stringify(stored);
          categoryAutosaveState.value = changedDuringSave ? "dirty" : "saved";
          saveSucceeded = true;
        }
      } catch (caught) {
        categoryAutosaveState.value = "error";
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible d’enregistrer automatiquement cette catégorie.");
      } finally {
        categorySaving.value = false;
        if (saveSucceeded && categoryDraft.value && JSON.stringify(categoryDraft.value) !== lastCategorySnapshot) scheduleCategoryAutosave();
      }
    }
    async function deleteCategory() {
      const draft = categoryDraft.value;
      if (!draft?.id || saving.value || !confirm(`Supprimer la catégorie « ${draft.name} » ?`)) return;
      cancelCategoryAutosave();
      categorySaving.value = true;
      try {
        await $fetch(`/api/admin/challenge-preset-categories/${draft.id}`, { method: "DELETE" });
        setCategoryDraft(null);
        await load();
        success.value = "Catégorie supprimée.";
      } catch (caught) {
        if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, "Impossible de supprimer cette catégorie.");
      } finally {
        categorySaving.value = false;
      }
    }
    watch(presetDraft, () => {
      if (!suspendAutosave) schedulePresetAutosave();
    }, { deep: true });
    watch(categoryDraft, () => {
      if (!suspendAutosave) scheduleCategoryAutosave();
    }, { deep: true });
    watch(user, (currentUser) => {
      if (!currentUser) {
        loadedForUserId = null;
        return;
      }
      if (loadedForUserId !== currentUser.id) {
        loadedForUserId = currentUser.id;
        void load();
      }
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
                  _push3(`<div class="challenge-admin" data-v-8f884b5d${_scopeId2}><header class="admin-section-heading challenge-admin__heading" data-v-8f884b5d${_scopeId2}><div data-v-8f884b5d${_scopeId2}><p class="admin-eyebrow" data-v-8f884b5d${_scopeId2}>Catalogue d’exercices</p><h1 data-v-8f884b5d${_scopeId2}>Gestion des défis</h1><p class="admin-muted" data-v-8f884b5d${_scopeId2}>Configure les défis proposés, leurs verbes, leurs temps et toutes leurs options.</p></div><div class="challenge-tabs" role="tablist" aria-label="Gestion des défis" data-v-8f884b5d${_scopeId2}><button type="button" class="${ssrRenderClass({ active: unref(tab) === "presets" })}" data-v-8f884b5d${_scopeId2}>Défis</button><button type="button" class="${ssrRenderClass({ active: unref(tab) === "categories" })}" data-v-8f884b5d${_scopeId2}>Catégories</button></div></header>`);
                  if (unref(error)) {
                    _push3(`<p class="admin-notice admin-notice--error" role="alert" data-v-8f884b5d${_scopeId2}>${ssrInterpolate(unref(error))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(success)) {
                    _push3(`<p class="admin-notice admin-notice--success" role="status" data-v-8f884b5d${_scopeId2}>${ssrInterpolate(unref(success))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (unref(loading)) {
                    _push3(`<p class="admin-muted" data-v-8f884b5d${_scopeId2}>Chargement…</p>`);
                  } else if (unref(tab) === "presets") {
                    _push3(`<div class="challenge-workspace" data-v-8f884b5d${_scopeId2}><aside class="challenge-list admin-card" data-v-8f884b5d${_scopeId2}><header data-v-8f884b5d${_scopeId2}><strong data-v-8f884b5d${_scopeId2}>Défis</strong><button type="button" class="admin-button admin-button--small admin-button--primary" data-v-8f884b5d${_scopeId2}>Nouveau</button></header><!--[-->`);
                    ssrRenderList(unref(presetGroups), (group) => {
                      _push3(`<section class="challenge-list__group" data-v-8f884b5d${_scopeId2}><h2 data-v-8f884b5d${_scopeId2}><button type="button"${ssrRenderAttr("aria-expanded", unref(openPresetCategoryId) === group.category.id)}${ssrRenderAttr("aria-controls", `preset-category-${group.category.id}`)} data-v-8f884b5d${_scopeId2}><span data-v-8f884b5d${_scopeId2}>${ssrInterpolate(group.category.name)}</span><small data-v-8f884b5d${_scopeId2}>${ssrInterpolate(group.presets.length)}</small><i aria-hidden="true" data-v-8f884b5d${_scopeId2}>⌄</i></button></h2><div${ssrRenderAttr("id", `preset-category-${group.category.id}`)} class="challenge-list__items" style="${ssrRenderStyle(unref(openPresetCategoryId) === group.category.id ? null : { display: "none" })}" data-v-8f884b5d${_scopeId2}><!--[-->`);
                      ssrRenderList(group.presets, (preset) => {
                        _push3(`<button type="button" draggable="true" class="${ssrRenderClass({ selected: preset.databaseId === unref(presetDraft)?.databaseId, dragging: preset.databaseId === unref(draggedPresetId), "drag-over": preset.databaseId === unref(dragOverPresetId) && preset.databaseId !== unref(draggedPresetId) })}"${ssrRenderAttr("title", `Glisser pour déplacer ${preset.label}`)} data-v-8f884b5d${_scopeId2}><b class="drag-handle" aria-hidden="true" data-v-8f884b5d${_scopeId2}>⠿</b><span data-v-8f884b5d${_scopeId2}><strong data-v-8f884b5d${_scopeId2}>${ssrInterpolate(preset.label)}</strong><small data-v-8f884b5d${_scopeId2}>№ ${ssrInterpolate(preset.sortOrder)} · ${ssrInterpolate(preset.verbIds.length)} verbes · ${ssrInterpolate(preset.tenseIds.length)} temps</small></span><i class="${ssrRenderClass({ inactive: !preset.isActive })}" data-v-8f884b5d${_scopeId2}>${ssrInterpolate(preset.isActive ? "Actif" : "Masqué")}</i></button>`);
                      });
                      _push3(`<!--]--></div></section>`);
                    });
                    _push3(`<!--]--></aside>`);
                    if (unref(presetDraft)) {
                      _push3(`<form class="challenge-editor admin-card" data-v-8f884b5d${_scopeId2}><div class="editor-title" data-v-8f884b5d${_scopeId2}><div data-v-8f884b5d${_scopeId2}><p class="admin-eyebrow" data-v-8f884b5d${_scopeId2}>${ssrInterpolate(unref(presetDraft).databaseId ? "Défi existant" : "Nouveau défi")}</p><h2 data-v-8f884b5d${_scopeId2}>${ssrInterpolate(unref(presetDraft).label || "Sans nom")}</h2></div><label class="switch" data-v-8f884b5d${_scopeId2}><input${ssrIncludeBooleanAttr(Array.isArray(unref(presetDraft).isActive) ? ssrLooseContain(unref(presetDraft).isActive, null) : unref(presetDraft).isActive) ? " checked" : ""} type="checkbox" data-v-8f884b5d${_scopeId2}><span data-v-8f884b5d${_scopeId2}>Visible</span></label></div><section class="editor-section" data-v-8f884b5d${_scopeId2}><h3 data-v-8f884b5d${_scopeId2}>Informations</h3><div class="field-grid" data-v-8f884b5d${_scopeId2}><label class="admin-field" data-v-8f884b5d${_scopeId2}><span data-v-8f884b5d${_scopeId2}>Nom *</span><input${ssrRenderAttr("value", unref(presetDraft).label)} required data-v-8f884b5d${_scopeId2}></label><label class="admin-field" data-v-8f884b5d${_scopeId2}><span data-v-8f884b5d${_scopeId2}>Identifiant *</span><input${ssrRenderAttr("value", unref(presetDraft).id)} required pattern="[A-Za-z0-9][A-Za-z0-9_-]*" data-v-8f884b5d${_scopeId2}></label><label class="admin-field" data-v-8f884b5d${_scopeId2}><span data-v-8f884b5d${_scopeId2}>Catégorie *</span><select required data-v-8f884b5d${_scopeId2}><!--[-->`);
                      ssrRenderList(unref(sortedCategories), (category) => {
                        _push3(`<option${ssrRenderAttr("value", category.id)} data-v-8f884b5d${ssrIncludeBooleanAttr(Array.isArray(unref(presetDraft).categoryId) ? ssrLooseContain(unref(presetDraft).categoryId, category.id) : ssrLooseEqual(unref(presetDraft).categoryId, category.id)) ? " selected" : ""}${_scopeId2}>${ssrInterpolate(category.name)}</option>`);
                      });
                      _push3(`<!--]--></select></label><label class="admin-field" data-v-8f884b5d${_scopeId2}><span data-v-8f884b5d${_scopeId2}>Ordre dans la catégorie</span><input${ssrRenderAttr("value", unref(presetDraft).sortOrder)} type="number" min="1"${ssrRenderAttr("max", unref(presets).filter((preset) => preset.categoryId === unref(presetDraft).categoryId && preset.databaseId !== unref(presetDraft).databaseId).length + 1)} required data-v-8f884b5d${_scopeId2}></label><label class="admin-field wide" data-v-8f884b5d${_scopeId2}><span data-v-8f884b5d${_scopeId2}>Description</span><textarea rows="2" maxlength="500" data-v-8f884b5d${_scopeId2}>${ssrInterpolate(unref(presetDraft).description)}</textarea></label></div></section><section class="editor-section" data-v-8f884b5d${_scopeId2}><div class="section-heading" data-v-8f884b5d${_scopeId2}><div data-v-8f884b5d${_scopeId2}><h3 data-v-8f884b5d${_scopeId2}>Verbes</h3><small data-v-8f884b5d${_scopeId2}>${ssrInterpolate(unref(presetDraft).verbIds.length)} sélectionné(s)</small></div></div><div class="${ssrRenderClass([{ empty: !unref(selectedVerbs).length }, "selected-verbs"])}" data-v-8f884b5d${_scopeId2}><div class="selected-verbs__heading" data-v-8f884b5d${_scopeId2}><strong data-v-8f884b5d${_scopeId2}>Verbes sélectionnés</strong>`);
                      if (unref(selectedVerbs).length) {
                        _push3(`<button type="button" data-v-8f884b5d${_scopeId2}>Tout retirer</button>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`</div>`);
                      if (!unref(selectedVerbs).length) {
                        _push3(`<p data-v-8f884b5d${_scopeId2}>Aucun verbe sélectionné.</p>`);
                      } else {
                        _push3(`<div class="selected-verbs__badges" data-v-8f884b5d${_scopeId2}><!--[-->`);
                        ssrRenderList(unref(selectedVerbs), (verb) => {
                          _push3(`<button type="button"${ssrRenderAttr("aria-label", `Retirer ${verb.infinitif}`)}${ssrRenderAttr("title", `Retirer ${verb.infinitif}`)} data-v-8f884b5d${_scopeId2}><span data-v-8f884b5d${_scopeId2}>${ssrInterpolate(verb.infinitif)}</span><i aria-hidden="true" data-v-8f884b5d${_scopeId2}>×</i></button>`);
                        });
                        _push3(`<!--]--></div>`);
                      }
                      _push3(`</div><div class="verb-catalogue-heading" data-v-8f884b5d${_scopeId2}><strong data-v-8f884b5d${_scopeId2}>Tous les verbes</strong><input${ssrRenderAttr("value", unref(verbSearch))} class="search" type="search" placeholder="Rechercher un verbe…" data-v-8f884b5d${_scopeId2}></div><div class="selection-actions" data-v-8f884b5d${_scopeId2}><button type="button" class="admin-button admin-button--small" data-v-8f884b5d${_scopeId2}>Sélectionner les résultats</button><button type="button" class="admin-button admin-button--small" data-v-8f884b5d${_scopeId2}>Retirer les résultats</button></div><div class="choice-grid verb-grid" data-v-8f884b5d${_scopeId2}><!--[-->`);
                      ssrRenderList(unref(filteredVerbs), (verb) => {
                        _push3(`<label class="${ssrRenderClass({ selected: unref(presetDraft).verbIds.includes(verb.id) })}" data-v-8f884b5d${_scopeId2}><input type="checkbox"${ssrIncludeBooleanAttr(unref(presetDraft).verbIds.includes(verb.id)) ? " checked" : ""} data-v-8f884b5d${_scopeId2}><span data-v-8f884b5d${_scopeId2}>${ssrInterpolate(verb.infinitif)}</span></label>`);
                      });
                      _push3(`<!--]--></div></section><section class="editor-section" data-v-8f884b5d${_scopeId2}><div class="section-heading" data-v-8f884b5d${_scopeId2}><div data-v-8f884b5d${_scopeId2}><h3 data-v-8f884b5d${_scopeId2}>Temps</h3><small data-v-8f884b5d${_scopeId2}>${ssrInterpolate(unref(presetDraft).tenseIds.length)} sélectionné(s)</small></div></div><div class="tense-groups" data-v-8f884b5d${_scopeId2}><!--[-->`);
                      ssrRenderList(unref(tensesByMode), (group) => {
                        _push3(`<div data-v-8f884b5d${_scopeId2}><header data-v-8f884b5d${_scopeId2}><strong data-v-8f884b5d${_scopeId2}>${ssrInterpolate(group.mode.name)}</strong><span data-v-8f884b5d${_scopeId2}><button type="button" data-v-8f884b5d${_scopeId2}>Tous</button><button type="button" data-v-8f884b5d${_scopeId2}>Aucun</button></span></header><div class="choice-grid" data-v-8f884b5d${_scopeId2}><!--[-->`);
                        ssrRenderList(group.tenses, (tense) => {
                          _push3(`<label class="${ssrRenderClass({ selected: unref(presetDraft).tenseIds.includes(tense.id) })}" data-v-8f884b5d${_scopeId2}><input type="checkbox"${ssrIncludeBooleanAttr(unref(presetDraft).tenseIds.includes(tense.id)) ? " checked" : ""} data-v-8f884b5d${_scopeId2}><span data-v-8f884b5d${_scopeId2}>${ssrInterpolate(tense.name)}</span></label>`);
                        });
                        _push3(`<!--]--></div></div>`);
                      });
                      _push3(`<!--]--></div></section><section class="editor-section" data-v-8f884b5d${_scopeId2}><h3 data-v-8f884b5d${_scopeId2}>Options</h3><div class="field-grid" data-v-8f884b5d${_scopeId2}><label class="admin-field" data-v-8f884b5d${_scopeId2}><span data-v-8f884b5d${_scopeId2}>Nombre de questions</span><input${ssrRenderAttr("value", unref(presetDraft).questionCount)} type="number" min="1" max="100" required data-v-8f884b5d${_scopeId2}></label><label class="admin-field" data-v-8f884b5d${_scopeId2}><span data-v-8f884b5d${_scopeId2}>Type d’exercice</span><select data-v-8f884b5d${_scopeId2}><option value="conjugation" data-v-8f884b5d${ssrIncludeBooleanAttr(Array.isArray(unref(presetDraft).exerciseKind) ? ssrLooseContain(unref(presetDraft).exerciseKind, "conjugation") : ssrLooseEqual(unref(presetDraft).exerciseKind, "conjugation")) ? " selected" : ""}${_scopeId2}>Conjugaison</option><option value="tense-identification" data-v-8f884b5d${ssrIncludeBooleanAttr(Array.isArray(unref(presetDraft).exerciseKind) ? ssrLooseContain(unref(presetDraft).exerciseKind, "tense-identification") : ssrLooseEqual(unref(presetDraft).exerciseKind, "tense-identification")) ? " selected" : ""}${_scopeId2}>Identifier le temps</option></select></label><label class="admin-field" data-v-8f884b5d${_scopeId2}><span data-v-8f884b5d${_scopeId2}>Pronoms au passé simple</span><select data-v-8f884b5d${_scopeId2}><option value="all" data-v-8f884b5d${ssrIncludeBooleanAttr(Array.isArray(unref(presetDraft).pastSimplePronouns) ? ssrLooseContain(unref(presetDraft).pastSimplePronouns, "all") : ssrLooseEqual(unref(presetDraft).pastSimplePronouns, "all")) ? " selected" : ""}${_scopeId2}>Tous les pronoms</option><option value="third-person-only" data-v-8f884b5d${ssrIncludeBooleanAttr(Array.isArray(unref(presetDraft).pastSimplePronouns) ? ssrLooseContain(unref(presetDraft).pastSimplePronouns, "third-person-only") : ssrLooseEqual(unref(presetDraft).pastSimplePronouns, "third-person-only")) ? " selected" : ""}${_scopeId2}>3e personnes seulement</option></select></label><label class="check-line" data-v-8f884b5d${_scopeId2}><input${ssrIncludeBooleanAttr(Array.isArray(unref(presetDraft).inclusivePronouns) ? ssrLooseContain(unref(presetDraft).inclusivePronouns, null) : unref(presetDraft).inclusivePronouns) ? " checked" : ""} type="checkbox" data-v-8f884b5d${_scopeId2}><span data-v-8f884b5d${_scopeId2}>Inclure les pronoms « iel / iels »</span></label></div><div data-v-8f884b5d${_scopeId2}><strong class="option-title" data-v-8f884b5d${_scopeId2}>Compléments proposés</strong><div class="choice-grid complement-grid" data-v-8f884b5d${_scopeId2}><!--[-->`);
                      ssrRenderList(COMPLEMENT_OPTIONS, (option) => {
                        _push3(`<label class="${ssrRenderClass({ selected: unref(presetDraft).complementOptions.includes(option.value) })}" data-v-8f884b5d${_scopeId2}><input type="checkbox"${ssrIncludeBooleanAttr(unref(presetDraft).complementOptions.includes(option.value)) ? " checked" : ""} data-v-8f884b5d${_scopeId2}><span data-v-8f884b5d${_scopeId2}>${ssrInterpolate(option.label)}</span></label>`);
                      });
                      _push3(`<!--]--></div></div></section><footer class="editor-actions" data-v-8f884b5d${_scopeId2}>`);
                      if (unref(presetDraft).databaseId) {
                        _push3(`<button type="button" class="admin-button danger"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-8f884b5d${_scopeId2}>Supprimer</button>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`<span data-v-8f884b5d${_scopeId2}></span><p class="${ssrRenderClass([`is-${unref(presetAutosaveState)}`, "autosave-status"])}" aria-live="polite" data-v-8f884b5d${_scopeId2}><i aria-hidden="true" data-v-8f884b5d${_scopeId2}></i>${ssrInterpolate(unref(presetAutosaveLabel))} `);
                      if (unref(presetAutosaveState) === "error") {
                        _push3(`<button type="button" data-v-8f884b5d${_scopeId2}>Réessayer</button>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`</p></footer></form>`);
                    } else {
                      _push3(`<div class="empty admin-card" data-v-8f884b5d${_scopeId2}><p data-v-8f884b5d${_scopeId2}>Sélectionne un défi ou crée-en un nouveau.</p></div>`);
                    }
                    _push3(`</div>`);
                  } else {
                    _push3(`<div class="challenge-workspace category-workspace" data-v-8f884b5d${_scopeId2}><aside class="challenge-list category-list admin-card" data-v-8f884b5d${_scopeId2}><header data-v-8f884b5d${_scopeId2}><strong data-v-8f884b5d${_scopeId2}>Catégories</strong><button type="button" class="admin-button admin-button--small admin-button--primary" data-v-8f884b5d${_scopeId2}>Nouvelle</button></header><!--[-->`);
                    ssrRenderList(unref(sortedCategories), (category) => {
                      _push3(`<button type="button" draggable="true" class="${ssrRenderClass({ selected: category.id === unref(categoryDraft)?.id, dragging: category.id === unref(draggedCategoryId), "drag-over": category.id === unref(dragOverCategoryId) && category.id !== unref(draggedCategoryId) })}"${ssrRenderAttr("title", `Glisser pour déplacer ${category.name}`)} data-v-8f884b5d${_scopeId2}><b class="drag-handle" aria-hidden="true" data-v-8f884b5d${_scopeId2}>⠿</b><span data-v-8f884b5d${_scopeId2}><strong data-v-8f884b5d${_scopeId2}>${ssrInterpolate(category.name)}</strong><small data-v-8f884b5d${_scopeId2}>№ ${ssrInterpolate(category.sortOrder)} · ${ssrInterpolate(unref(presets).filter((preset) => preset.categoryId === category.id).length)} défi(s)</small></span><i class="${ssrRenderClass({ inactive: !category.isActive })}" data-v-8f884b5d${_scopeId2}>${ssrInterpolate(category.isActive ? "Active" : "Masquée")}</i></button>`);
                    });
                    _push3(`<!--]--></aside>`);
                    if (unref(categoryDraft)) {
                      _push3(`<form class="challenge-editor admin-card category-editor" data-v-8f884b5d${_scopeId2}><div class="editor-title" data-v-8f884b5d${_scopeId2}><div data-v-8f884b5d${_scopeId2}><p class="admin-eyebrow" data-v-8f884b5d${_scopeId2}>Catégorie</p><h2 data-v-8f884b5d${_scopeId2}>${ssrInterpolate(unref(categoryDraft).name || "Sans nom")}</h2></div><label class="switch" data-v-8f884b5d${_scopeId2}><input${ssrIncludeBooleanAttr(Array.isArray(unref(categoryDraft).isActive) ? ssrLooseContain(unref(categoryDraft).isActive, null) : unref(categoryDraft).isActive) ? " checked" : ""} type="checkbox" data-v-8f884b5d${_scopeId2}><span data-v-8f884b5d${_scopeId2}>Visible</span></label></div><div class="field-grid" data-v-8f884b5d${_scopeId2}><label class="admin-field" data-v-8f884b5d${_scopeId2}><span data-v-8f884b5d${_scopeId2}>Nom *</span><input${ssrRenderAttr("value", unref(categoryDraft).name)} required data-v-8f884b5d${_scopeId2}></label><label class="admin-field" data-v-8f884b5d${_scopeId2}><span data-v-8f884b5d${_scopeId2}>Identifiant *</span><input${ssrRenderAttr("value", unref(categoryDraft).slug)} required data-v-8f884b5d${_scopeId2}></label><label class="admin-field" data-v-8f884b5d${_scopeId2}><span data-v-8f884b5d${_scopeId2}>Ordre</span><input${ssrRenderAttr("value", unref(categoryDraft).sortOrder)} type="number" required data-v-8f884b5d${_scopeId2}></label><label class="admin-field wide" data-v-8f884b5d${_scopeId2}><span data-v-8f884b5d${_scopeId2}>Description</span><textarea rows="4" maxlength="500" data-v-8f884b5d${_scopeId2}>${ssrInterpolate(unref(categoryDraft).description)}</textarea></label></div><p class="admin-muted" data-v-8f884b5d${_scopeId2}>Une catégorie masquée masque aussi tous ses défis dans le catalogue public.</p><footer class="editor-actions" data-v-8f884b5d${_scopeId2}>`);
                      if (unref(categoryDraft).id) {
                        _push3(`<button type="button" class="admin-button danger"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-8f884b5d${_scopeId2}>Supprimer</button>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`<span data-v-8f884b5d${_scopeId2}></span><p class="${ssrRenderClass([`is-${unref(categoryAutosaveState)}`, "autosave-status"])}" aria-live="polite" data-v-8f884b5d${_scopeId2}><i aria-hidden="true" data-v-8f884b5d${_scopeId2}></i>${ssrInterpolate(unref(categoryAutosaveLabel))} `);
                      if (unref(categoryAutosaveState) === "error") {
                        _push3(`<button type="button" data-v-8f884b5d${_scopeId2}>Réessayer</button>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`</p></footer></form>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div>`);
                  }
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "challenge-admin" }, [
                      createVNode("header", { class: "admin-section-heading challenge-admin__heading" }, [
                        createVNode("div", null, [
                          createVNode("p", { class: "admin-eyebrow" }, "Catalogue d’exercices"),
                          createVNode("h1", null, "Gestion des défis"),
                          createVNode("p", { class: "admin-muted" }, "Configure les défis proposés, leurs verbes, leurs temps et toutes leurs options.")
                        ]),
                        createVNode("div", {
                          class: "challenge-tabs",
                          role: "tablist",
                          "aria-label": "Gestion des défis"
                        }, [
                          createVNode("button", {
                            type: "button",
                            class: { active: unref(tab) === "presets" },
                            onClick: ($event) => tab.value = "presets"
                          }, "Défis", 10, ["onClick"]),
                          createVNode("button", {
                            type: "button",
                            class: { active: unref(tab) === "categories" },
                            onClick: ($event) => tab.value = "categories"
                          }, "Catégories", 10, ["onClick"])
                        ])
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
                      unref(loading) ? (openBlock(), createBlock("p", {
                        key: 2,
                        class: "admin-muted"
                      }, "Chargement…")) : unref(tab) === "presets" ? (openBlock(), createBlock("div", {
                        key: 3,
                        class: "challenge-workspace"
                      }, [
                        createVNode("aside", { class: "challenge-list admin-card" }, [
                          createVNode("header", null, [
                            createVNode("strong", null, "Défis"),
                            createVNode("button", {
                              type: "button",
                              class: "admin-button admin-button--small admin-button--primary",
                              onClick: createPreset
                            }, "Nouveau")
                          ]),
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(presetGroups), (group) => {
                            return openBlock(), createBlock("section", {
                              key: group.category.id,
                              class: "challenge-list__group"
                            }, [
                              createVNode("h2", null, [
                                createVNode("button", {
                                  type: "button",
                                  "aria-expanded": unref(openPresetCategoryId) === group.category.id,
                                  "aria-controls": `preset-category-${group.category.id}`,
                                  onClick: ($event) => togglePresetCategory(group.category.id)
                                }, [
                                  createVNode("span", null, toDisplayString(group.category.name), 1),
                                  createVNode("small", null, toDisplayString(group.presets.length), 1),
                                  createVNode("i", { "aria-hidden": "true" }, "⌄")
                                ], 8, ["aria-expanded", "aria-controls", "onClick"])
                              ]),
                              withDirectives(createVNode("div", {
                                id: `preset-category-${group.category.id}`,
                                class: "challenge-list__items"
                              }, [
                                (openBlock(true), createBlock(Fragment, null, renderList(group.presets, (preset) => {
                                  return openBlock(), createBlock("button", {
                                    key: preset.databaseId,
                                    type: "button",
                                    draggable: "true",
                                    class: { selected: preset.databaseId === unref(presetDraft)?.databaseId, dragging: preset.databaseId === unref(draggedPresetId), "drag-over": preset.databaseId === unref(dragOverPresetId) && preset.databaseId !== unref(draggedPresetId) },
                                    title: `Glisser pour déplacer ${preset.label}`,
                                    onClick: ($event) => selectPreset(preset),
                                    onDragstart: ($event) => startPresetDrag(preset, $event),
                                    onDragover: ($event) => overPresetDrag(preset, $event),
                                    onDrop: ($event) => dropPreset(preset, $event),
                                    onDragend: endPresetDrag
                                  }, [
                                    createVNode("b", {
                                      class: "drag-handle",
                                      "aria-hidden": "true"
                                    }, "⠿"),
                                    createVNode("span", null, [
                                      createVNode("strong", null, toDisplayString(preset.label), 1),
                                      createVNode("small", null, "№ " + toDisplayString(preset.sortOrder) + " · " + toDisplayString(preset.verbIds.length) + " verbes · " + toDisplayString(preset.tenseIds.length) + " temps", 1)
                                    ]),
                                    createVNode("i", {
                                      class: { inactive: !preset.isActive }
                                    }, toDisplayString(preset.isActive ? "Actif" : "Masqué"), 3)
                                  ], 42, ["title", "onClick", "onDragstart", "onDragover", "onDrop"]);
                                }), 128))
                              ], 8, ["id"]), [
                                [vShow, unref(openPresetCategoryId) === group.category.id]
                              ])
                            ]);
                          }), 128))
                        ]),
                        unref(presetDraft) ? (openBlock(), createBlock("form", {
                          key: 0,
                          class: "challenge-editor admin-card",
                          onSubmit: withModifiers(() => {
                          }, ["prevent"])
                        }, [
                          createVNode("div", { class: "editor-title" }, [
                            createVNode("div", null, [
                              createVNode("p", { class: "admin-eyebrow" }, toDisplayString(unref(presetDraft).databaseId ? "Défi existant" : "Nouveau défi"), 1),
                              createVNode("h2", null, toDisplayString(unref(presetDraft).label || "Sans nom"), 1)
                            ]),
                            createVNode("label", { class: "switch" }, [
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(presetDraft).isActive = $event,
                                type: "checkbox"
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelCheckbox, unref(presetDraft).isActive]
                              ]),
                              createVNode("span", null, "Visible")
                            ])
                          ]),
                          createVNode("section", { class: "editor-section" }, [
                            createVNode("h3", null, "Informations"),
                            createVNode("div", { class: "field-grid" }, [
                              createVNode("label", { class: "admin-field" }, [
                                createVNode("span", null, "Nom *"),
                                withDirectives(createVNode("input", {
                                  "onUpdate:modelValue": ($event) => unref(presetDraft).label = $event,
                                  required: ""
                                }, null, 8, ["onUpdate:modelValue"]), [
                                  [vModelText, unref(presetDraft).label]
                                ])
                              ]),
                              createVNode("label", { class: "admin-field" }, [
                                createVNode("span", null, "Identifiant *"),
                                withDirectives(createVNode("input", {
                                  "onUpdate:modelValue": ($event) => unref(presetDraft).id = $event,
                                  required: "",
                                  pattern: "[A-Za-z0-9][A-Za-z0-9_-]*"
                                }, null, 8, ["onUpdate:modelValue"]), [
                                  [vModelText, unref(presetDraft).id]
                                ])
                              ]),
                              createVNode("label", { class: "admin-field" }, [
                                createVNode("span", null, "Catégorie *"),
                                withDirectives(createVNode("select", {
                                  "onUpdate:modelValue": ($event) => unref(presetDraft).categoryId = $event,
                                  required: "",
                                  onChange: assignNextPresetOrder
                                }, [
                                  (openBlock(true), createBlock(Fragment, null, renderList(unref(sortedCategories), (category) => {
                                    return openBlock(), createBlock("option", {
                                      key: category.id,
                                      value: category.id
                                    }, toDisplayString(category.name), 9, ["value"]);
                                  }), 128))
                                ], 40, ["onUpdate:modelValue"]), [
                                  [
                                    vModelSelect,
                                    unref(presetDraft).categoryId,
                                    void 0,
                                    { number: true }
                                  ]
                                ])
                              ]),
                              createVNode("label", { class: "admin-field" }, [
                                createVNode("span", null, "Ordre dans la catégorie"),
                                withDirectives(createVNode("input", {
                                  "onUpdate:modelValue": ($event) => unref(presetDraft).sortOrder = $event,
                                  type: "number",
                                  min: "1",
                                  max: unref(presets).filter((preset) => preset.categoryId === unref(presetDraft).categoryId && preset.databaseId !== unref(presetDraft).databaseId).length + 1,
                                  required: ""
                                }, null, 8, ["onUpdate:modelValue", "max"]), [
                                  [
                                    vModelText,
                                    unref(presetDraft).sortOrder,
                                    void 0,
                                    { number: true }
                                  ]
                                ])
                              ]),
                              createVNode("label", { class: "admin-field wide" }, [
                                createVNode("span", null, "Description"),
                                withDirectives(createVNode("textarea", {
                                  "onUpdate:modelValue": ($event) => unref(presetDraft).description = $event,
                                  rows: "2",
                                  maxlength: "500"
                                }, null, 8, ["onUpdate:modelValue"]), [
                                  [vModelText, unref(presetDraft).description]
                                ])
                              ])
                            ])
                          ]),
                          createVNode("section", { class: "editor-section" }, [
                            createVNode("div", { class: "section-heading" }, [
                              createVNode("div", null, [
                                createVNode("h3", null, "Verbes"),
                                createVNode("small", null, toDisplayString(unref(presetDraft).verbIds.length) + " sélectionné(s)", 1)
                              ])
                            ]),
                            createVNode("div", {
                              class: ["selected-verbs", { empty: !unref(selectedVerbs).length }]
                            }, [
                              createVNode("div", { class: "selected-verbs__heading" }, [
                                createVNode("strong", null, "Verbes sélectionnés"),
                                unref(selectedVerbs).length ? (openBlock(), createBlock("button", {
                                  key: 0,
                                  type: "button",
                                  onClick: ($event) => unref(presetDraft).verbIds = []
                                }, "Tout retirer", 8, ["onClick"])) : createCommentVNode("", true)
                              ]),
                              !unref(selectedVerbs).length ? (openBlock(), createBlock("p", { key: 0 }, "Aucun verbe sélectionné.")) : (openBlock(), createBlock("div", {
                                key: 1,
                                class: "selected-verbs__badges"
                              }, [
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(selectedVerbs), (verb) => {
                                  return openBlock(), createBlock("button", {
                                    key: verb.id,
                                    type: "button",
                                    "aria-label": `Retirer ${verb.infinitif}`,
                                    title: `Retirer ${verb.infinitif}`,
                                    onClick: ($event) => toggleVerb(verb.id)
                                  }, [
                                    createVNode("span", null, toDisplayString(verb.infinitif), 1),
                                    createVNode("i", { "aria-hidden": "true" }, "×")
                                  ], 8, ["aria-label", "title", "onClick"]);
                                }), 128))
                              ]))
                            ], 2),
                            createVNode("div", { class: "verb-catalogue-heading" }, [
                              createVNode("strong", null, "Tous les verbes"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => isRef(verbSearch) ? verbSearch.value = $event : null,
                                class: "search",
                                type: "search",
                                placeholder: "Rechercher un verbe…"
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelText, unref(verbSearch)]
                              ])
                            ]),
                            createVNode("div", { class: "selection-actions" }, [
                              createVNode("button", {
                                type: "button",
                                class: "admin-button admin-button--small",
                                onClick: ($event) => setAllVisibleVerbs(true)
                              }, "Sélectionner les résultats", 8, ["onClick"]),
                              createVNode("button", {
                                type: "button",
                                class: "admin-button admin-button--small",
                                onClick: ($event) => setAllVisibleVerbs(false)
                              }, "Retirer les résultats", 8, ["onClick"])
                            ]),
                            createVNode("div", { class: "choice-grid verb-grid" }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(filteredVerbs), (verb) => {
                                return openBlock(), createBlock("label", {
                                  key: verb.id,
                                  class: { selected: unref(presetDraft).verbIds.includes(verb.id) }
                                }, [
                                  createVNode("input", {
                                    type: "checkbox",
                                    checked: unref(presetDraft).verbIds.includes(verb.id),
                                    onChange: ($event) => toggleVerb(verb.id)
                                  }, null, 40, ["checked", "onChange"]),
                                  createVNode("span", null, toDisplayString(verb.infinitif), 1)
                                ], 2);
                              }), 128))
                            ])
                          ]),
                          createVNode("section", { class: "editor-section" }, [
                            createVNode("div", { class: "section-heading" }, [
                              createVNode("div", null, [
                                createVNode("h3", null, "Temps"),
                                createVNode("small", null, toDisplayString(unref(presetDraft).tenseIds.length) + " sélectionné(s)", 1)
                              ])
                            ]),
                            createVNode("div", { class: "tense-groups" }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(tensesByMode), (group) => {
                                return openBlock(), createBlock("div", {
                                  key: group.mode.id
                                }, [
                                  createVNode("header", null, [
                                    createVNode("strong", null, toDisplayString(group.mode.name), 1),
                                    createVNode("span", null, [
                                      createVNode("button", {
                                        type: "button",
                                        onClick: ($event) => setModeTenses(group.mode.id, true)
                                      }, "Tous", 8, ["onClick"]),
                                      createVNode("button", {
                                        type: "button",
                                        onClick: ($event) => setModeTenses(group.mode.id, false)
                                      }, "Aucun", 8, ["onClick"])
                                    ])
                                  ]),
                                  createVNode("div", { class: "choice-grid" }, [
                                    (openBlock(true), createBlock(Fragment, null, renderList(group.tenses, (tense) => {
                                      return openBlock(), createBlock("label", {
                                        key: tense.id,
                                        class: { selected: unref(presetDraft).tenseIds.includes(tense.id) }
                                      }, [
                                        createVNode("input", {
                                          type: "checkbox",
                                          checked: unref(presetDraft).tenseIds.includes(tense.id),
                                          onChange: ($event) => toggleId(unref(presetDraft).tenseIds, tense.id)
                                        }, null, 40, ["checked", "onChange"]),
                                        createVNode("span", null, toDisplayString(tense.name), 1)
                                      ], 2);
                                    }), 128))
                                  ])
                                ]);
                              }), 128))
                            ])
                          ]),
                          createVNode("section", { class: "editor-section" }, [
                            createVNode("h3", null, "Options"),
                            createVNode("div", { class: "field-grid" }, [
                              createVNode("label", { class: "admin-field" }, [
                                createVNode("span", null, "Nombre de questions"),
                                withDirectives(createVNode("input", {
                                  "onUpdate:modelValue": ($event) => unref(presetDraft).questionCount = $event,
                                  type: "number",
                                  min: "1",
                                  max: "100",
                                  required: ""
                                }, null, 8, ["onUpdate:modelValue"]), [
                                  [
                                    vModelText,
                                    unref(presetDraft).questionCount,
                                    void 0,
                                    { number: true }
                                  ]
                                ])
                              ]),
                              createVNode("label", { class: "admin-field" }, [
                                createVNode("span", null, "Type d’exercice"),
                                withDirectives(createVNode("select", {
                                  "onUpdate:modelValue": ($event) => unref(presetDraft).exerciseKind = $event
                                }, [
                                  createVNode("option", { value: "conjugation" }, "Conjugaison"),
                                  createVNode("option", { value: "tense-identification" }, "Identifier le temps")
                                ], 8, ["onUpdate:modelValue"]), [
                                  [vModelSelect, unref(presetDraft).exerciseKind]
                                ])
                              ]),
                              createVNode("label", { class: "admin-field" }, [
                                createVNode("span", null, "Pronoms au passé simple"),
                                withDirectives(createVNode("select", {
                                  "onUpdate:modelValue": ($event) => unref(presetDraft).pastSimplePronouns = $event
                                }, [
                                  createVNode("option", { value: "all" }, "Tous les pronoms"),
                                  createVNode("option", { value: "third-person-only" }, "3e personnes seulement")
                                ], 8, ["onUpdate:modelValue"]), [
                                  [vModelSelect, unref(presetDraft).pastSimplePronouns]
                                ])
                              ]),
                              createVNode("label", { class: "check-line" }, [
                                withDirectives(createVNode("input", {
                                  "onUpdate:modelValue": ($event) => unref(presetDraft).inclusivePronouns = $event,
                                  type: "checkbox"
                                }, null, 8, ["onUpdate:modelValue"]), [
                                  [vModelCheckbox, unref(presetDraft).inclusivePronouns]
                                ]),
                                createVNode("span", null, "Inclure les pronoms « iel / iels »")
                              ])
                            ]),
                            createVNode("div", null, [
                              createVNode("strong", { class: "option-title" }, "Compléments proposés"),
                              createVNode("div", { class: "choice-grid complement-grid" }, [
                                (openBlock(), createBlock(Fragment, null, renderList(COMPLEMENT_OPTIONS, (option) => {
                                  return createVNode("label", {
                                    key: option.value,
                                    class: { selected: unref(presetDraft).complementOptions.includes(option.value) }
                                  }, [
                                    createVNode("input", {
                                      type: "checkbox",
                                      checked: unref(presetDraft).complementOptions.includes(option.value),
                                      onChange: ($event) => setComplementOption(option.value, inputChecked($event))
                                    }, null, 40, ["checked", "onChange"]),
                                    createVNode("span", null, toDisplayString(option.label), 1)
                                  ], 2);
                                }), 64))
                              ])
                            ])
                          ]),
                          createVNode("footer", { class: "editor-actions" }, [
                            unref(presetDraft).databaseId ? (openBlock(), createBlock("button", {
                              key: 0,
                              type: "button",
                              class: "admin-button danger",
                              disabled: unref(saving),
                              onClick: deletePreset
                            }, "Supprimer", 8, ["disabled"])) : createCommentVNode("", true),
                            createVNode("span"),
                            createVNode("p", {
                              class: ["autosave-status", `is-${unref(presetAutosaveState)}`],
                              "aria-live": "polite"
                            }, [
                              createVNode("i", { "aria-hidden": "true" }),
                              createTextVNode(toDisplayString(unref(presetAutosaveLabel)) + " ", 1),
                              unref(presetAutosaveState) === "error" ? (openBlock(), createBlock("button", {
                                key: 0,
                                type: "button",
                                onClick: savePreset
                              }, "Réessayer")) : createCommentVNode("", true)
                            ], 2)
                          ])
                        ], 40, ["onSubmit"])) : (openBlock(), createBlock("div", {
                          key: 1,
                          class: "empty admin-card"
                        }, [
                          createVNode("p", null, "Sélectionne un défi ou crée-en un nouveau.")
                        ]))
                      ])) : (openBlock(), createBlock("div", {
                        key: 4,
                        class: "challenge-workspace category-workspace"
                      }, [
                        createVNode("aside", { class: "challenge-list category-list admin-card" }, [
                          createVNode("header", null, [
                            createVNode("strong", null, "Catégories"),
                            createVNode("button", {
                              type: "button",
                              class: "admin-button admin-button--small admin-button--primary",
                              onClick: createCategory
                            }, "Nouvelle")
                          ]),
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(sortedCategories), (category) => {
                            return openBlock(), createBlock("button", {
                              key: category.id,
                              type: "button",
                              draggable: "true",
                              class: { selected: category.id === unref(categoryDraft)?.id, dragging: category.id === unref(draggedCategoryId), "drag-over": category.id === unref(dragOverCategoryId) && category.id !== unref(draggedCategoryId) },
                              title: `Glisser pour déplacer ${category.name}`,
                              onClick: ($event) => selectCategory(category),
                              onDragstart: ($event) => startCategoryDrag(category, $event),
                              onDragover: ($event) => overCategoryDrag(category, $event),
                              onDrop: ($event) => dropCategory(category, $event),
                              onDragend: endCategoryDrag
                            }, [
                              createVNode("b", {
                                class: "drag-handle",
                                "aria-hidden": "true"
                              }, "⠿"),
                              createVNode("span", null, [
                                createVNode("strong", null, toDisplayString(category.name), 1),
                                createVNode("small", null, "№ " + toDisplayString(category.sortOrder) + " · " + toDisplayString(unref(presets).filter((preset) => preset.categoryId === category.id).length) + " défi(s)", 1)
                              ]),
                              createVNode("i", {
                                class: { inactive: !category.isActive }
                              }, toDisplayString(category.isActive ? "Active" : "Masquée"), 3)
                            ], 42, ["title", "onClick", "onDragstart", "onDragover", "onDrop"]);
                          }), 128))
                        ]),
                        unref(categoryDraft) ? (openBlock(), createBlock("form", {
                          key: 0,
                          class: "challenge-editor admin-card category-editor",
                          onSubmit: withModifiers(() => {
                          }, ["prevent"])
                        }, [
                          createVNode("div", { class: "editor-title" }, [
                            createVNode("div", null, [
                              createVNode("p", { class: "admin-eyebrow" }, "Catégorie"),
                              createVNode("h2", null, toDisplayString(unref(categoryDraft).name || "Sans nom"), 1)
                            ]),
                            createVNode("label", { class: "switch" }, [
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(categoryDraft).isActive = $event,
                                type: "checkbox"
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelCheckbox, unref(categoryDraft).isActive]
                              ]),
                              createVNode("span", null, "Visible")
                            ])
                          ]),
                          createVNode("div", { class: "field-grid" }, [
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Nom *"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(categoryDraft).name = $event,
                                required: ""
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelText, unref(categoryDraft).name]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Identifiant *"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(categoryDraft).slug = $event,
                                required: ""
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelText, unref(categoryDraft).slug]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Ordre"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(categoryDraft).sortOrder = $event,
                                type: "number",
                                required: ""
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [
                                  vModelText,
                                  unref(categoryDraft).sortOrder,
                                  void 0,
                                  { number: true }
                                ]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field wide" }, [
                              createVNode("span", null, "Description"),
                              withDirectives(createVNode("textarea", {
                                "onUpdate:modelValue": ($event) => unref(categoryDraft).description = $event,
                                rows: "4",
                                maxlength: "500"
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelText, unref(categoryDraft).description]
                              ])
                            ])
                          ]),
                          createVNode("p", { class: "admin-muted" }, "Une catégorie masquée masque aussi tous ses défis dans le catalogue public."),
                          createVNode("footer", { class: "editor-actions" }, [
                            unref(categoryDraft).id ? (openBlock(), createBlock("button", {
                              key: 0,
                              type: "button",
                              class: "admin-button danger",
                              disabled: unref(saving),
                              onClick: deleteCategory
                            }, "Supprimer", 8, ["disabled"])) : createCommentVNode("", true),
                            createVNode("span"),
                            createVNode("p", {
                              class: ["autosave-status", `is-${unref(categoryAutosaveState)}`],
                              "aria-live": "polite"
                            }, [
                              createVNode("i", { "aria-hidden": "true" }),
                              createTextVNode(toDisplayString(unref(categoryAutosaveLabel)) + " ", 1),
                              unref(categoryAutosaveState) === "error" ? (openBlock(), createBlock("button", {
                                key: 0,
                                type: "button",
                                onClick: saveCategory
                              }, "Réessayer")) : createCommentVNode("", true)
                            ], 2)
                          ])
                        ], 40, ["onSubmit"])) : createCommentVNode("", true)
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
                  createVNode("div", { class: "challenge-admin" }, [
                    createVNode("header", { class: "admin-section-heading challenge-admin__heading" }, [
                      createVNode("div", null, [
                        createVNode("p", { class: "admin-eyebrow" }, "Catalogue d’exercices"),
                        createVNode("h1", null, "Gestion des défis"),
                        createVNode("p", { class: "admin-muted" }, "Configure les défis proposés, leurs verbes, leurs temps et toutes leurs options.")
                      ]),
                      createVNode("div", {
                        class: "challenge-tabs",
                        role: "tablist",
                        "aria-label": "Gestion des défis"
                      }, [
                        createVNode("button", {
                          type: "button",
                          class: { active: unref(tab) === "presets" },
                          onClick: ($event) => tab.value = "presets"
                        }, "Défis", 10, ["onClick"]),
                        createVNode("button", {
                          type: "button",
                          class: { active: unref(tab) === "categories" },
                          onClick: ($event) => tab.value = "categories"
                        }, "Catégories", 10, ["onClick"])
                      ])
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
                    unref(loading) ? (openBlock(), createBlock("p", {
                      key: 2,
                      class: "admin-muted"
                    }, "Chargement…")) : unref(tab) === "presets" ? (openBlock(), createBlock("div", {
                      key: 3,
                      class: "challenge-workspace"
                    }, [
                      createVNode("aside", { class: "challenge-list admin-card" }, [
                        createVNode("header", null, [
                          createVNode("strong", null, "Défis"),
                          createVNode("button", {
                            type: "button",
                            class: "admin-button admin-button--small admin-button--primary",
                            onClick: createPreset
                          }, "Nouveau")
                        ]),
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(presetGroups), (group) => {
                          return openBlock(), createBlock("section", {
                            key: group.category.id,
                            class: "challenge-list__group"
                          }, [
                            createVNode("h2", null, [
                              createVNode("button", {
                                type: "button",
                                "aria-expanded": unref(openPresetCategoryId) === group.category.id,
                                "aria-controls": `preset-category-${group.category.id}`,
                                onClick: ($event) => togglePresetCategory(group.category.id)
                              }, [
                                createVNode("span", null, toDisplayString(group.category.name), 1),
                                createVNode("small", null, toDisplayString(group.presets.length), 1),
                                createVNode("i", { "aria-hidden": "true" }, "⌄")
                              ], 8, ["aria-expanded", "aria-controls", "onClick"])
                            ]),
                            withDirectives(createVNode("div", {
                              id: `preset-category-${group.category.id}`,
                              class: "challenge-list__items"
                            }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(group.presets, (preset) => {
                                return openBlock(), createBlock("button", {
                                  key: preset.databaseId,
                                  type: "button",
                                  draggable: "true",
                                  class: { selected: preset.databaseId === unref(presetDraft)?.databaseId, dragging: preset.databaseId === unref(draggedPresetId), "drag-over": preset.databaseId === unref(dragOverPresetId) && preset.databaseId !== unref(draggedPresetId) },
                                  title: `Glisser pour déplacer ${preset.label}`,
                                  onClick: ($event) => selectPreset(preset),
                                  onDragstart: ($event) => startPresetDrag(preset, $event),
                                  onDragover: ($event) => overPresetDrag(preset, $event),
                                  onDrop: ($event) => dropPreset(preset, $event),
                                  onDragend: endPresetDrag
                                }, [
                                  createVNode("b", {
                                    class: "drag-handle",
                                    "aria-hidden": "true"
                                  }, "⠿"),
                                  createVNode("span", null, [
                                    createVNode("strong", null, toDisplayString(preset.label), 1),
                                    createVNode("small", null, "№ " + toDisplayString(preset.sortOrder) + " · " + toDisplayString(preset.verbIds.length) + " verbes · " + toDisplayString(preset.tenseIds.length) + " temps", 1)
                                  ]),
                                  createVNode("i", {
                                    class: { inactive: !preset.isActive }
                                  }, toDisplayString(preset.isActive ? "Actif" : "Masqué"), 3)
                                ], 42, ["title", "onClick", "onDragstart", "onDragover", "onDrop"]);
                              }), 128))
                            ], 8, ["id"]), [
                              [vShow, unref(openPresetCategoryId) === group.category.id]
                            ])
                          ]);
                        }), 128))
                      ]),
                      unref(presetDraft) ? (openBlock(), createBlock("form", {
                        key: 0,
                        class: "challenge-editor admin-card",
                        onSubmit: withModifiers(() => {
                        }, ["prevent"])
                      }, [
                        createVNode("div", { class: "editor-title" }, [
                          createVNode("div", null, [
                            createVNode("p", { class: "admin-eyebrow" }, toDisplayString(unref(presetDraft).databaseId ? "Défi existant" : "Nouveau défi"), 1),
                            createVNode("h2", null, toDisplayString(unref(presetDraft).label || "Sans nom"), 1)
                          ]),
                          createVNode("label", { class: "switch" }, [
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(presetDraft).isActive = $event,
                              type: "checkbox"
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [vModelCheckbox, unref(presetDraft).isActive]
                            ]),
                            createVNode("span", null, "Visible")
                          ])
                        ]),
                        createVNode("section", { class: "editor-section" }, [
                          createVNode("h3", null, "Informations"),
                          createVNode("div", { class: "field-grid" }, [
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Nom *"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(presetDraft).label = $event,
                                required: ""
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelText, unref(presetDraft).label]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Identifiant *"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(presetDraft).id = $event,
                                required: "",
                                pattern: "[A-Za-z0-9][A-Za-z0-9_-]*"
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelText, unref(presetDraft).id]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Catégorie *"),
                              withDirectives(createVNode("select", {
                                "onUpdate:modelValue": ($event) => unref(presetDraft).categoryId = $event,
                                required: "",
                                onChange: assignNextPresetOrder
                              }, [
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(sortedCategories), (category) => {
                                  return openBlock(), createBlock("option", {
                                    key: category.id,
                                    value: category.id
                                  }, toDisplayString(category.name), 9, ["value"]);
                                }), 128))
                              ], 40, ["onUpdate:modelValue"]), [
                                [
                                  vModelSelect,
                                  unref(presetDraft).categoryId,
                                  void 0,
                                  { number: true }
                                ]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Ordre dans la catégorie"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(presetDraft).sortOrder = $event,
                                type: "number",
                                min: "1",
                                max: unref(presets).filter((preset) => preset.categoryId === unref(presetDraft).categoryId && preset.databaseId !== unref(presetDraft).databaseId).length + 1,
                                required: ""
                              }, null, 8, ["onUpdate:modelValue", "max"]), [
                                [
                                  vModelText,
                                  unref(presetDraft).sortOrder,
                                  void 0,
                                  { number: true }
                                ]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field wide" }, [
                              createVNode("span", null, "Description"),
                              withDirectives(createVNode("textarea", {
                                "onUpdate:modelValue": ($event) => unref(presetDraft).description = $event,
                                rows: "2",
                                maxlength: "500"
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelText, unref(presetDraft).description]
                              ])
                            ])
                          ])
                        ]),
                        createVNode("section", { class: "editor-section" }, [
                          createVNode("div", { class: "section-heading" }, [
                            createVNode("div", null, [
                              createVNode("h3", null, "Verbes"),
                              createVNode("small", null, toDisplayString(unref(presetDraft).verbIds.length) + " sélectionné(s)", 1)
                            ])
                          ]),
                          createVNode("div", {
                            class: ["selected-verbs", { empty: !unref(selectedVerbs).length }]
                          }, [
                            createVNode("div", { class: "selected-verbs__heading" }, [
                              createVNode("strong", null, "Verbes sélectionnés"),
                              unref(selectedVerbs).length ? (openBlock(), createBlock("button", {
                                key: 0,
                                type: "button",
                                onClick: ($event) => unref(presetDraft).verbIds = []
                              }, "Tout retirer", 8, ["onClick"])) : createCommentVNode("", true)
                            ]),
                            !unref(selectedVerbs).length ? (openBlock(), createBlock("p", { key: 0 }, "Aucun verbe sélectionné.")) : (openBlock(), createBlock("div", {
                              key: 1,
                              class: "selected-verbs__badges"
                            }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(selectedVerbs), (verb) => {
                                return openBlock(), createBlock("button", {
                                  key: verb.id,
                                  type: "button",
                                  "aria-label": `Retirer ${verb.infinitif}`,
                                  title: `Retirer ${verb.infinitif}`,
                                  onClick: ($event) => toggleVerb(verb.id)
                                }, [
                                  createVNode("span", null, toDisplayString(verb.infinitif), 1),
                                  createVNode("i", { "aria-hidden": "true" }, "×")
                                ], 8, ["aria-label", "title", "onClick"]);
                              }), 128))
                            ]))
                          ], 2),
                          createVNode("div", { class: "verb-catalogue-heading" }, [
                            createVNode("strong", null, "Tous les verbes"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => isRef(verbSearch) ? verbSearch.value = $event : null,
                              class: "search",
                              type: "search",
                              placeholder: "Rechercher un verbe…"
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [vModelText, unref(verbSearch)]
                            ])
                          ]),
                          createVNode("div", { class: "selection-actions" }, [
                            createVNode("button", {
                              type: "button",
                              class: "admin-button admin-button--small",
                              onClick: ($event) => setAllVisibleVerbs(true)
                            }, "Sélectionner les résultats", 8, ["onClick"]),
                            createVNode("button", {
                              type: "button",
                              class: "admin-button admin-button--small",
                              onClick: ($event) => setAllVisibleVerbs(false)
                            }, "Retirer les résultats", 8, ["onClick"])
                          ]),
                          createVNode("div", { class: "choice-grid verb-grid" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(filteredVerbs), (verb) => {
                              return openBlock(), createBlock("label", {
                                key: verb.id,
                                class: { selected: unref(presetDraft).verbIds.includes(verb.id) }
                              }, [
                                createVNode("input", {
                                  type: "checkbox",
                                  checked: unref(presetDraft).verbIds.includes(verb.id),
                                  onChange: ($event) => toggleVerb(verb.id)
                                }, null, 40, ["checked", "onChange"]),
                                createVNode("span", null, toDisplayString(verb.infinitif), 1)
                              ], 2);
                            }), 128))
                          ])
                        ]),
                        createVNode("section", { class: "editor-section" }, [
                          createVNode("div", { class: "section-heading" }, [
                            createVNode("div", null, [
                              createVNode("h3", null, "Temps"),
                              createVNode("small", null, toDisplayString(unref(presetDraft).tenseIds.length) + " sélectionné(s)", 1)
                            ])
                          ]),
                          createVNode("div", { class: "tense-groups" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(tensesByMode), (group) => {
                              return openBlock(), createBlock("div", {
                                key: group.mode.id
                              }, [
                                createVNode("header", null, [
                                  createVNode("strong", null, toDisplayString(group.mode.name), 1),
                                  createVNode("span", null, [
                                    createVNode("button", {
                                      type: "button",
                                      onClick: ($event) => setModeTenses(group.mode.id, true)
                                    }, "Tous", 8, ["onClick"]),
                                    createVNode("button", {
                                      type: "button",
                                      onClick: ($event) => setModeTenses(group.mode.id, false)
                                    }, "Aucun", 8, ["onClick"])
                                  ])
                                ]),
                                createVNode("div", { class: "choice-grid" }, [
                                  (openBlock(true), createBlock(Fragment, null, renderList(group.tenses, (tense) => {
                                    return openBlock(), createBlock("label", {
                                      key: tense.id,
                                      class: { selected: unref(presetDraft).tenseIds.includes(tense.id) }
                                    }, [
                                      createVNode("input", {
                                        type: "checkbox",
                                        checked: unref(presetDraft).tenseIds.includes(tense.id),
                                        onChange: ($event) => toggleId(unref(presetDraft).tenseIds, tense.id)
                                      }, null, 40, ["checked", "onChange"]),
                                      createVNode("span", null, toDisplayString(tense.name), 1)
                                    ], 2);
                                  }), 128))
                                ])
                              ]);
                            }), 128))
                          ])
                        ]),
                        createVNode("section", { class: "editor-section" }, [
                          createVNode("h3", null, "Options"),
                          createVNode("div", { class: "field-grid" }, [
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Nombre de questions"),
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(presetDraft).questionCount = $event,
                                type: "number",
                                min: "1",
                                max: "100",
                                required: ""
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [
                                  vModelText,
                                  unref(presetDraft).questionCount,
                                  void 0,
                                  { number: true }
                                ]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Type d’exercice"),
                              withDirectives(createVNode("select", {
                                "onUpdate:modelValue": ($event) => unref(presetDraft).exerciseKind = $event
                              }, [
                                createVNode("option", { value: "conjugation" }, "Conjugaison"),
                                createVNode("option", { value: "tense-identification" }, "Identifier le temps")
                              ], 8, ["onUpdate:modelValue"]), [
                                [vModelSelect, unref(presetDraft).exerciseKind]
                              ])
                            ]),
                            createVNode("label", { class: "admin-field" }, [
                              createVNode("span", null, "Pronoms au passé simple"),
                              withDirectives(createVNode("select", {
                                "onUpdate:modelValue": ($event) => unref(presetDraft).pastSimplePronouns = $event
                              }, [
                                createVNode("option", { value: "all" }, "Tous les pronoms"),
                                createVNode("option", { value: "third-person-only" }, "3e personnes seulement")
                              ], 8, ["onUpdate:modelValue"]), [
                                [vModelSelect, unref(presetDraft).pastSimplePronouns]
                              ])
                            ]),
                            createVNode("label", { class: "check-line" }, [
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => unref(presetDraft).inclusivePronouns = $event,
                                type: "checkbox"
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelCheckbox, unref(presetDraft).inclusivePronouns]
                              ]),
                              createVNode("span", null, "Inclure les pronoms « iel / iels »")
                            ])
                          ]),
                          createVNode("div", null, [
                            createVNode("strong", { class: "option-title" }, "Compléments proposés"),
                            createVNode("div", { class: "choice-grid complement-grid" }, [
                              (openBlock(), createBlock(Fragment, null, renderList(COMPLEMENT_OPTIONS, (option) => {
                                return createVNode("label", {
                                  key: option.value,
                                  class: { selected: unref(presetDraft).complementOptions.includes(option.value) }
                                }, [
                                  createVNode("input", {
                                    type: "checkbox",
                                    checked: unref(presetDraft).complementOptions.includes(option.value),
                                    onChange: ($event) => setComplementOption(option.value, inputChecked($event))
                                  }, null, 40, ["checked", "onChange"]),
                                  createVNode("span", null, toDisplayString(option.label), 1)
                                ], 2);
                              }), 64))
                            ])
                          ])
                        ]),
                        createVNode("footer", { class: "editor-actions" }, [
                          unref(presetDraft).databaseId ? (openBlock(), createBlock("button", {
                            key: 0,
                            type: "button",
                            class: "admin-button danger",
                            disabled: unref(saving),
                            onClick: deletePreset
                          }, "Supprimer", 8, ["disabled"])) : createCommentVNode("", true),
                          createVNode("span"),
                          createVNode("p", {
                            class: ["autosave-status", `is-${unref(presetAutosaveState)}`],
                            "aria-live": "polite"
                          }, [
                            createVNode("i", { "aria-hidden": "true" }),
                            createTextVNode(toDisplayString(unref(presetAutosaveLabel)) + " ", 1),
                            unref(presetAutosaveState) === "error" ? (openBlock(), createBlock("button", {
                              key: 0,
                              type: "button",
                              onClick: savePreset
                            }, "Réessayer")) : createCommentVNode("", true)
                          ], 2)
                        ])
                      ], 40, ["onSubmit"])) : (openBlock(), createBlock("div", {
                        key: 1,
                        class: "empty admin-card"
                      }, [
                        createVNode("p", null, "Sélectionne un défi ou crée-en un nouveau.")
                      ]))
                    ])) : (openBlock(), createBlock("div", {
                      key: 4,
                      class: "challenge-workspace category-workspace"
                    }, [
                      createVNode("aside", { class: "challenge-list category-list admin-card" }, [
                        createVNode("header", null, [
                          createVNode("strong", null, "Catégories"),
                          createVNode("button", {
                            type: "button",
                            class: "admin-button admin-button--small admin-button--primary",
                            onClick: createCategory
                          }, "Nouvelle")
                        ]),
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(sortedCategories), (category) => {
                          return openBlock(), createBlock("button", {
                            key: category.id,
                            type: "button",
                            draggable: "true",
                            class: { selected: category.id === unref(categoryDraft)?.id, dragging: category.id === unref(draggedCategoryId), "drag-over": category.id === unref(dragOverCategoryId) && category.id !== unref(draggedCategoryId) },
                            title: `Glisser pour déplacer ${category.name}`,
                            onClick: ($event) => selectCategory(category),
                            onDragstart: ($event) => startCategoryDrag(category, $event),
                            onDragover: ($event) => overCategoryDrag(category, $event),
                            onDrop: ($event) => dropCategory(category, $event),
                            onDragend: endCategoryDrag
                          }, [
                            createVNode("b", {
                              class: "drag-handle",
                              "aria-hidden": "true"
                            }, "⠿"),
                            createVNode("span", null, [
                              createVNode("strong", null, toDisplayString(category.name), 1),
                              createVNode("small", null, "№ " + toDisplayString(category.sortOrder) + " · " + toDisplayString(unref(presets).filter((preset) => preset.categoryId === category.id).length) + " défi(s)", 1)
                            ]),
                            createVNode("i", {
                              class: { inactive: !category.isActive }
                            }, toDisplayString(category.isActive ? "Active" : "Masquée"), 3)
                          ], 42, ["title", "onClick", "onDragstart", "onDragover", "onDrop"]);
                        }), 128))
                      ]),
                      unref(categoryDraft) ? (openBlock(), createBlock("form", {
                        key: 0,
                        class: "challenge-editor admin-card category-editor",
                        onSubmit: withModifiers(() => {
                        }, ["prevent"])
                      }, [
                        createVNode("div", { class: "editor-title" }, [
                          createVNode("div", null, [
                            createVNode("p", { class: "admin-eyebrow" }, "Catégorie"),
                            createVNode("h2", null, toDisplayString(unref(categoryDraft).name || "Sans nom"), 1)
                          ]),
                          createVNode("label", { class: "switch" }, [
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(categoryDraft).isActive = $event,
                              type: "checkbox"
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [vModelCheckbox, unref(categoryDraft).isActive]
                            ]),
                            createVNode("span", null, "Visible")
                          ])
                        ]),
                        createVNode("div", { class: "field-grid" }, [
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Nom *"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(categoryDraft).name = $event,
                              required: ""
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [vModelText, unref(categoryDraft).name]
                            ])
                          ]),
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Identifiant *"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(categoryDraft).slug = $event,
                              required: ""
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [vModelText, unref(categoryDraft).slug]
                            ])
                          ]),
                          createVNode("label", { class: "admin-field" }, [
                            createVNode("span", null, "Ordre"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(categoryDraft).sortOrder = $event,
                              type: "number",
                              required: ""
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [
                                vModelText,
                                unref(categoryDraft).sortOrder,
                                void 0,
                                { number: true }
                              ]
                            ])
                          ]),
                          createVNode("label", { class: "admin-field wide" }, [
                            createVNode("span", null, "Description"),
                            withDirectives(createVNode("textarea", {
                              "onUpdate:modelValue": ($event) => unref(categoryDraft).description = $event,
                              rows: "4",
                              maxlength: "500"
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [vModelText, unref(categoryDraft).description]
                            ])
                          ])
                        ]),
                        createVNode("p", { class: "admin-muted" }, "Une catégorie masquée masque aussi tous ses défis dans le catalogue public."),
                        createVNode("footer", { class: "editor-actions" }, [
                          unref(categoryDraft).id ? (openBlock(), createBlock("button", {
                            key: 0,
                            type: "button",
                            class: "admin-button danger",
                            disabled: unref(saving),
                            onClick: deleteCategory
                          }, "Supprimer", 8, ["disabled"])) : createCommentVNode("", true),
                          createVNode("span"),
                          createVNode("p", {
                            class: ["autosave-status", `is-${unref(categoryAutosaveState)}`],
                            "aria-live": "polite"
                          }, [
                            createVNode("i", { "aria-hidden": "true" }),
                            createTextVNode(toDisplayString(unref(categoryAutosaveLabel)) + " ", 1),
                            unref(categoryAutosaveState) === "error" ? (openBlock(), createBlock("button", {
                              key: 0,
                              type: "button",
                              onClick: saveCategory
                            }, "Réessayer")) : createCommentVNode("", true)
                          ], 2)
                        ])
                      ], 40, ["onSubmit"])) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/challenges.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const challenges = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-8f884b5d"]]);

export { challenges as default };
//# sourceMappingURL=challenges-BXLbpoli.mjs.map
