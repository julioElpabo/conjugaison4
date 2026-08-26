<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  modelValue: string
  autocomplete?: string
  name?: string
  minlength?: number
  maxlength?: number
  required?: boolean
  describedby?: string
}>(), {
  autocomplete: undefined,
  name: undefined,
  minlength: undefined,
  maxlength: undefined,
  required: false,
  describedby: undefined,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const { ui } = useLanguagePreferences()
const revealed = ref(false)
</script>

<template>
  <div class="password-input">
    <input
      v-bind="$attrs"
      :value="modelValue"
      :type="revealed ? 'text' : 'password'"
      :name="name"
      :autocomplete="autocomplete"
      :minlength="minlength"
      :maxlength="maxlength"
      :required="required"
      :aria-describedby="describedby"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <button
      type="button"
      :aria-pressed="revealed"
      :aria-label="revealed ? ui('Masquer le mot de passe') : ui('Afficher le mot de passe')"
      @click="revealed = !revealed"
    >
      {{ revealed ? ui('Masquer') : ui('Afficher') }}
    </button>
  </div>
</template>

<style scoped>
.password-input{position:relative;display:grid;width:100%}.password-input input{width:100%;min-height:45px;box-sizing:border-box;padding:10px 92px 10px 12px;border:1px solid var(--line);border-radius:11px;color:var(--ink);background:var(--surface);font:inherit}.password-input input:focus{border-color:#8060ad;outline:3px solid color-mix(in srgb,#7052a0 20%,transparent)}.password-input button{position:absolute;top:50%;right:7px;min-height:32px;padding:5px 9px;transform:translateY(-50%);border:1px solid var(--line);border-radius:8px;color:var(--brand-dark);background:var(--surface-soft);cursor:pointer;font:inherit;font-size:.76rem;font-weight:800}.password-input button:hover,.password-input button:focus-visible{border-color:var(--brand);outline:2px solid color-mix(in srgb,var(--brand) 20%,transparent);background:var(--surface)}
</style>
