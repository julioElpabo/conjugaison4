<script setup lang="ts">
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

const emit = defineEmits<{ close: [] }>()
const { handleUnauthorized } = useAdminAuth()
const dialog = useTemplateRef<HTMLElement>('dialog')
const cancelButton = useTemplateRef<HTMLButtonElement>('cancel-button')
const step = ref<'preview' | 'confirm' | 'done'>('preview')
const preview = ref<{ count: number, cutoff: string } | null>(null)
const loading = ref(true)
const deleting = ref(false)
const error = ref('')
const deletedCount = ref(0)
const countLabel = computed(() => (preview.value?.count ?? 0).toLocaleString('fr-CH'))
const cutoffLabel = computed(() => preview.value?.cutoff.slice(0, 10).split('-').reverse().join('.'))

function close() {
  if (!deleting.value) emit('close')
}
useDialogFocus(dialog, close, cancelButton)

async function loadPreview() {
  loading.value = true
  error.value = ''
  try {
    preview.value = await $fetch<{ count: number, cutoff: string }>('/api/admin/defis/cleanup', { credentials: 'same-origin' })
  } catch (caught) {
    handleUnauthorized(caught)
    error.value = getAdminErrorMessage(caught, 'Impossible de compter les défis. Réessaie dans un instant.')
  } finally {
    loading.value = false
  }
}

async function confirmStep() {
  if (!preview.value?.count || loading.value) return
  step.value = 'confirm'
  await nextTick()
  cancelButton.value?.focus()
}

async function removeDefis() {
  if (deleting.value || !preview.value || step.value !== 'confirm') return
  deleting.value = true
  error.value = ''
  try {
    const result = await $fetch<{ deletedCount: number }>('/api/admin/defis/cleanup', {
      method: 'POST', credentials: 'same-origin',
      body: { confirm: true, cutoff: preview.value.cutoff },
    })
    deletedCount.value = result.deletedCount
    step.value = 'done'
  } catch (caught) {
    handleUnauthorized(caught)
    step.value = 'preview'
    preview.value = null
    error.value = getAdminErrorMessage(caught, 'La suppression n’a pas pu être confirmée. Actualise le décompte avant de réessayer.')
  } finally {
    deleting.value = false
    await nextTick()
    cancelButton.value?.focus()
  }
}

onMounted(loadPreview)
</script>

<template>
  <Teleport to="body">
    <div class="cleanup-backdrop" @click.self="close">
      <section ref="dialog" class="cleanup-dialog" :class="`cleanup-dialog--${step}`" :role="step === 'confirm' ? 'alertdialog' : 'dialog'" aria-modal="true" aria-labelledby="cleanup-title" aria-describedby="cleanup-description" :aria-busy="loading || deleting" tabindex="-1">
        <div class="cleanup-icon" aria-hidden="true">{{ step === 'done' ? '✓' : step === 'confirm' ? '!' : '▤' }}</div>
        <p class="cleanup-eyebrow">{{ step === 'confirm' ? 'Dernière confirmation' : step === 'done' ? 'Nettoyage terminé' : 'Entretien de la base de données' }}</p>
        <h2 id="cleanup-title">{{ step === 'confirm' ? 'Supprimer définitivement ces défis ?' : step === 'done' ? 'Le nettoyage est terminé' : 'Faire de la place dans la BDD' }}</h2>

        <template v-if="step === 'preview'">
          <p id="cleanup-description">Ce nettoyage supprime les défis enregistrés dont le lien ou le code n’a pas été chargé depuis plus de cinq ans. Les défis marqués permanents et le catalogue d’exercices sont conservés.</p>
          <div class="cleanup-count" role="status" aria-live="polite">
            <template v-if="loading">Recherche des défis inutilisés…</template>
            <template v-else-if="preview">
              <strong>{{ countLabel }}</strong>
              <span>{{ preview.count === 1 ? 'défi peut être supprimé' : 'défis peuvent être supprimés' }}</span>
              <small>Dernière utilisation antérieure au {{ cutoffLabel }}.</small>
            </template>
            <template v-else>Décompte indisponible</template>
          </div>
          <p class="cleanup-note">Pour les anciens défis sans historique d’utilisation, les cinq ans sont comptés à partir de la mise en place du suivi. Leur date de création ne suffit pas à les supprimer.</p>
          <p v-if="preview?.count === 0 && !loading" class="cleanup-empty">Aucun défi à supprimer pour le moment.</p>
        </template>

        <template v-else-if="step === 'confirm'">
          <p id="cleanup-description">Tu vas supprimer définitivement jusqu’à <strong>{{ countLabel }} {{ preview?.count === 1 ? 'défi enregistré' : 'défis enregistrés' }}</strong> inutilisés depuis plus de cinq ans.</p>
          <div class="cleanup-warning">Leurs liens et leurs codes ne fonctionneront plus. Ils disparaîtront également de « Mes défis ». Cette action est irréversible.</div>
          <p class="cleanup-note">Un défi utilisé à nouveau ou marqué permanent depuis le décompte sera conservé.</p>
        </template>

        <template v-else>
          <p id="cleanup-description" role="status"><strong>{{ deletedCount.toLocaleString('fr-CH') }}</strong> {{ deletedCount === 1 ? 'défi supprimé.' : 'défis supprimés.' }}</p>
          <p class="cleanup-note">Les défis utilisés au cours des cinq dernières années et les défis permanents sont conservés.</p>
        </template>

        <p v-if="error" class="cleanup-error" role="alert">{{ error }}</p>
        <footer>
          <button ref="cancel-button" type="button" class="cleanup-secondary" :disabled="deleting" @click="close">{{ step === 'done' ? 'Fermer' : 'Annuler' }}</button>
          <button v-if="step === 'preview' && !preview && !loading" type="button" class="cleanup-primary" @click="loadPreview">Actualiser le décompte</button>
          <button v-else-if="step === 'preview'" type="button" class="cleanup-primary" :disabled="loading || !preview?.count" @click="confirmStep">Supprimer</button>
          <button v-else-if="step === 'confirm'" type="button" class="cleanup-danger" :disabled="deleting" @click="removeDefis">{{ deleting ? 'Suppression en cours…' : 'Confirmer la suppression' }}</button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.cleanup-backdrop{position:fixed;inset:0;z-index:1100;display:grid;place-items:center;padding:24px;background:rgb(10 25 39 / 62%);backdrop-filter:blur(6px)}
.cleanup-dialog{width:min(100%,560px);max-height:calc(100dvh - 48px);overflow:auto;box-sizing:border-box;padding:32px;border:1px solid #e5ddd3;border-radius:24px;color:#273e48;background:#fffdf9;box-shadow:0 28px 90px rgb(0 0 0 / 28%)}
.cleanup-icon{display:grid;width:56px;height:56px;place-items:center;border-radius:18px;color:#a34d08;background:#fff0d8;font-size:1.8rem;font-weight:900}
.cleanup-eyebrow{margin:20px 0 8px;color:#9a510d;font-size:.7rem;font-weight:850;letter-spacing:.1em;text-transform:uppercase}
.cleanup-dialog h2{margin:0 0 16px;font-size:1.65rem;line-height:1.2;color:#193947}
.cleanup-dialog p{line-height:1.6}.cleanup-count{display:grid;gap:5px;margin:22px 0;padding:22px;border:1px solid #efd8b7;border-radius:16px;text-align:center;background:#fff5e6}.cleanup-count strong{color:#a14a08;font-size:2.6rem;line-height:1.1}.cleanup-count span{font-weight:750}.cleanup-count small,.cleanup-note{color:#5f7078;font-size:.84rem}.cleanup-empty{color:#287054;font-weight:750}.cleanup-warning{padding:18px;border:1px solid #efc5b7;border-radius:14px;color:#8c3229;background:#fff0e9;line-height:1.6}.cleanup-error{padding:12px;border-radius:10px;color:#982e28;background:#fff0ec}.cleanup-dialog footer{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:10px;margin-top:26px;padding-top:20px;border-top:1px solid #e7e1d9}.cleanup-dialog button{min-height:44px;padding:11px 17px;border:1px solid transparent;border-radius:11px;font:inherit;font-weight:800;cursor:pointer}.cleanup-dialog button:disabled{opacity:.5;cursor:default}.cleanup-dialog button:focus-visible{outline:3px solid #237891;outline-offset:3px}.cleanup-secondary{color:#415a65;background:#f1f4f5;border-color:#d9e2e5!important}.cleanup-primary{color:#fff;background:#b9570b}.cleanup-danger{color:#fff;background:#b14032}.cleanup-dialog--confirm .cleanup-icon{color:#a33529;background:#ffe7dc}.cleanup-dialog--done .cleanup-icon{color:#22734f;background:#e2f3e8}.cleanup-dialog--done .cleanup-eyebrow{color:#22734f}
@media(max-width:600px){.cleanup-backdrop{padding:14px}.cleanup-dialog{padding:24px;max-height:calc(100dvh - 28px)}.cleanup-dialog footer button{flex:1 1 150px}}
</style>
