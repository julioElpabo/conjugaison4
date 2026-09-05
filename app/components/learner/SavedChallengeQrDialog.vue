<script setup lang="ts">
import QrcodeVue from 'qrcode.vue'
import { savedChallengeCardCopy } from '~~/shared/i18n/saved-challenge-card'

defineProps<{ url: string, title: string, code: string }>()
const emit = defineEmits<{ close: [] }>()
const { interfaceLocale } = useLanguagePreferences()
const copy = computed(() => savedChallengeCardCopy(interfaceLocale.value))
const dialog = useTemplateRef<HTMLElement>('dialog')
const closeButton = useTemplateRef<HTMLButtonElement>('close-button')
useDialogFocus(dialog, () => emit('close'), closeButton)
</script>

<template>
  <Teleport to="body">
    <div class="challenge-qr-backdrop" @click.self="emit('close')">
      <section ref="dialog" class="challenge-qr-dialog" role="dialog" aria-modal="true" aria-labelledby="challenge-qr-title" tabindex="-1">
        <header>
          <div><p>{{ copy.scan }}</p><h2 id="challenge-qr-title">{{ title }}</h2></div>
          <button ref="close-button" type="button" @click="emit('close')">{{ copy.close }} <span aria-hidden="true">×</span></button>
        </header>
        <QrcodeVue class="challenge-qr-image" :value="url" :size="720" :margin="4" level="M" render-as="svg" background="#ffffff" foreground="#000000" role="img" :aria-label="`${copy.code} ${code}`" />
        <strong class="challenge-qr-code">{{ code }}</strong>
        <a class="challenge-qr-link" :href="url">{{ url }}</a>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.challenge-qr-backdrop{position:fixed;inset:0;z-index:1100;display:grid;place-items:center;padding:20px;background:rgb(12 20 35 / 75%);backdrop-filter:blur(6px)}
.challenge-qr-dialog{box-sizing:border-box;display:flex;width:min(100%,1100px);max-height:calc(100dvh - 40px);padding:24px 32px;flex-direction:column;align-items:center;overflow:auto;border-radius:24px;color:#243345;background:white;box-shadow:0 28px 100px rgb(0 0 0 / 30%)}
.challenge-qr-dialog header{display:flex;width:100%;align-items:flex-start;justify-content:space-between;gap:24px}.challenge-qr-dialog header p{margin:0 0 7px;color:#7052a0;font-size:.78rem;font-weight:850;text-transform:uppercase;letter-spacing:.08em}.challenge-qr-dialog h2{margin:0;font-size:clamp(1.3rem,3vw,2rem);overflow-wrap:anywhere}.challenge-qr-dialog header button{display:flex;padding:10px 14px;flex-shrink:0;align-items:center;gap:12px;border:1px solid #d8dce3;border-radius:12px;color:#33435b;background:#f5f6f9;font:inherit;font-weight:750;cursor:pointer}.challenge-qr-dialog header button span{font-size:1.6rem;line-height:1}.challenge-qr-dialog button:focus-visible,.challenge-qr-link:focus-visible{outline:3px solid #7052a0;outline-offset:3px}.challenge-qr-image{display:block;flex-shrink:0;width:min(62dvh,680px,100%);height:auto;margin:12px 0;background:white}.challenge-qr-code{margin:10px 0 5px;font-size:clamp(1.3rem,3vw,2rem);letter-spacing:.1em}.challenge-qr-link{max-width:100%;color:#7052a0;font-size:.8rem;overflow-wrap:anywhere;text-align:center}
@media(max-width:600px){.challenge-qr-backdrop{padding:10px}.challenge-qr-dialog{max-height:calc(100dvh - 20px);padding:20px 16px;border-radius:18px}.challenge-qr-dialog header{gap:12px}.challenge-qr-dialog header button{padding:8px;font-size:.8rem}.challenge-qr-dialog header p{font-size:.65rem}}
</style>
