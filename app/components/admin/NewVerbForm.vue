<script setup lang="ts">
interface NewVerbPayload {
  infinitif: string
  participePresent: string
  participePasse: string
  auxiliaire: string
}

defineProps<{
  saving?: boolean
  error?: string
}>()

const emit = defineEmits<{
  create: [payload: NewVerbPayload]
  cancel: []
}>()

const form = reactive<NewVerbPayload>({
  infinitif: '',
  participePresent: '',
  participePasse: '',
  auxiliaire: 'avoir'
})

function submit() {
  emit('create', {
    infinitif: form.infinitif.trim(),
    participePresent: form.participePresent.trim(),
    participePasse: form.participePasse.trim(),
    auxiliaire: form.auxiliaire
  })
}
</script>

<template>
  <section class="new-verb" aria-labelledby="new-verb-title">
    <div class="admin-section-heading">
      <div>
        <p class="admin-eyebrow">Nouveau</p>
        <h2 id="new-verb-title">Ajouter un verbe</h2>
      </div>
    </div>

    <p class="admin-muted">
      Créez d’abord sa fiche, puis complétez ses conjugaisons dans la grille.
    </p>

    <form class="admin-form new-verb__form" @submit.prevent="submit">
      <label class="admin-field">
        <span>Infinitif *</span>
        <input v-model="form.infinitif" maxlength="255" required autofocus>
      </label>

      <label class="admin-field">
        <span>Participe présent</span>
        <input v-model="form.participePresent" maxlength="255">
      </label>

      <label class="admin-field">
        <span>Participe passé</span>
        <input v-model="form.participePasse" maxlength="255">
      </label>

      <label class="admin-field">
        <span>Auxiliaire *</span>
        <select v-model="form.auxiliaire" required>
          <option value="avoir">avoir</option>
          <option value="être">être</option>
        </select>
      </label>

      <p v-if="error" class="admin-notice admin-notice--error" role="alert">{{ error }}</p>

      <div class="new-verb__actions">
        <button class="admin-button" type="button" :disabled="saving" @click="emit('cancel')">
          Annuler
        </button>
        <button class="admin-button admin-button--primary" type="submit" :disabled="saving">
          {{ saving ? 'Création…' : 'Créer le verbe' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.new-verb {
  width: min(100%, 670px);
}

.new-verb > .admin-muted {
  margin: 10px 0 24px;
}

.new-verb__form {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.new-verb__form .admin-notice,
.new-verb__actions {
  grid-column: 1 / -1;
}

.new-verb__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 560px) {
  .new-verb__form {
    grid-template-columns: 1fr;
  }
}
</style>
