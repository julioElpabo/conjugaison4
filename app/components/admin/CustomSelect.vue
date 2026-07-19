<script setup lang="ts">
export interface AdminCustomSelectOption {
  value: string | number
  label: string
  description?: string
  group?: string
}

const props = defineProps<{
  modelValue: string | number
  options: AdminCustomSelectOption[]
  label: string
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()
const root = ref<HTMLElement | null>(null)
const open = ref(false)
const activeIndex = ref(-1)
const selectedOption = computed(() => props.options.find(option => option.value === props.modelValue))
const groupedOptions = computed(() => {
  const groups = new Map<string, Array<{ option: AdminCustomSelectOption, index: number }>>()
  props.options.forEach((option, index) => {
    const group = option.group || ''
    const items = groups.get(group) || []
    items.push({ option, index })
    groups.set(group, items)
  })
  return [...groups].map(([label, items]) => ({ label, items }))
})

function show() {
  if (props.disabled || !props.options.length) return
  open.value = true
  activeIndex.value = Math.max(0, props.options.findIndex(option => option.value === props.modelValue))
}
function close() {
  open.value = false
  activeIndex.value = -1
}
function choose(option: AdminCustomSelectOption) {
  emit('update:modelValue', option.value)
  close()
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') return close()
  if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) return
  event.preventDefault()
  if (!open.value) return show()
  if (event.key === 'Enter' || event.key === ' ') {
    const option = props.options[activeIndex.value]
    if (option) choose(option)
    return
  }
  const direction = event.key === 'ArrowDown' ? 1 : -1
  activeIndex.value = (activeIndex.value + direction + props.options.length) % props.options.length
}
function onDocumentPointerDown(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) close()
}

watch(() => props.options, (options) => {
  if (!options.length) close()
  else if (activeIndex.value >= options.length) activeIndex.value = 0
})
onMounted(() => document.addEventListener('pointerdown', onDocumentPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointerDown))
</script>

<template>
  <div ref="root" class="admin-custom-select" :class="{ 'is-open': open, 'is-disabled': disabled }">
    <span class="admin-custom-select__label">{{ label }}</span>
    <button type="button" class="admin-custom-select__trigger" :disabled="disabled || !options.length" :aria-expanded="open" aria-haspopup="listbox" @click="open ? close() : show()" @keydown="onKeydown">
      <span><strong>{{ selectedOption?.label || placeholder || 'Choisir' }}</strong><small v-if="selectedOption?.description">{{ selectedOption.description }}</small></span>
      <i aria-hidden="true">⌄</i>
    </button>
    <ul v-if="open" role="listbox" :aria-label="label">
      <template v-for="group in groupedOptions" :key="group.label || 'ungrouped'">
        <li v-if="group.label" class="admin-custom-select__group" role="presentation">{{ group.label }}</li>
        <li v-for="item in group.items" :key="item.option.value" role="option" :aria-selected="item.option.value === modelValue">
          <button type="button" :class="{ 'is-active': item.index === activeIndex, 'is-selected': item.option.value === modelValue }" @mouseenter="activeIndex = item.index" @click="choose(item.option)"><span><strong>{{ item.option.label }}</strong><small v-if="item.option.description">{{ item.option.description }}</small></span><b v-if="item.option.value === modelValue" aria-hidden="true">✓</b></button>
        </li>
      </template>
    </ul>
  </div>
</template>

<style scoped>
.admin-custom-select{position:relative;display:grid;gap:5px;min-width:0}.admin-custom-select__label{color:var(--admin-muted);font-size:.72rem;font-weight:800}.admin-custom-select__trigger{display:flex;width:100%;min-height:44px;padding:8px 10px;align-items:center;justify-content:space-between;gap:8px;border:1px solid var(--admin-border);border-radius:10px;color:var(--admin-navy);background:white;text-align:left;cursor:pointer}.admin-custom-select__trigger>span,.admin-custom-select li button>span{display:grid;min-width:0;gap:1px}.admin-custom-select strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.77rem}.admin-custom-select small{overflow:hidden;color:var(--admin-muted);font-size:.65rem;font-weight:650;text-overflow:ellipsis;white-space:nowrap}.admin-custom-select__trigger i{display:grid;width:24px;height:24px;flex:0 0 auto;place-items:center;border-radius:7px;color:var(--admin-blue);background:#e6f3f5;font-style:normal;font-weight:900;transition:transform .15s}.is-open .admin-custom-select__trigger{border-color:#6ba9b8;box-shadow:0 0 0 3px rgb(83 157 175 / 16%)}.is-open .admin-custom-select__trigger i{transform:rotate(180deg)}.admin-custom-select ul{position:absolute;z-index:14;top:calc(100% + 5px);right:0;left:0;max-height:310px;margin:0;padding:5px;overflow:auto;border:1px solid var(--admin-border);border-radius:11px;background:white;box-shadow:0 14px 32px rgb(18 56 70 / 20%);list-style:none}.admin-custom-select__group{position:sticky;top:-5px;z-index:1;margin:5px -1px 3px;padding:7px 9px 5px;color:var(--admin-blue);border-bottom:1px solid #dce9eb;background:white;font-size:.65rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.admin-custom-select__group:first-child{margin-top:-1px}.admin-custom-select li button{display:flex;width:100%;padding:8px 9px 8px 14px;align-items:center;justify-content:space-between;gap:8px;border:0;border-radius:8px;color:var(--admin-navy);background:transparent;text-align:left;cursor:pointer}.admin-custom-select li button:hover,.admin-custom-select li button.is-active{background:#e7f3f5}.admin-custom-select li button.is-selected{color:#155d70}.admin-custom-select li b{color:var(--admin-blue)}.is-disabled{opacity:.6}:global(:root[data-theme='dark'] .admin-custom-select__trigger),:global(:root[data-theme='dark'] .admin-custom-select ul){color:#d8e7ea;border-color:#49616a;background:#192b30}:global(:root[data-theme='dark'] .admin-custom-select__trigger i){color:#8bd0de;background:#29464d}:global(:root[data-theme='dark'] .admin-custom-select__group){color:#8bd0de;border-color:#3c555d;background:#192b30}:global(:root[data-theme='dark'] .admin-custom-select li button){color:#d8e7ea}:global(:root[data-theme='dark'] .admin-custom-select li button:hover),:global(:root[data-theme='dark'] .admin-custom-select li button.is-active){background:#294149}:global(:root[data-theme='dark'] .admin-custom-select li button.is-selected){color:#9bdce6}:global(:root[data-theme='dark'] .admin-custom-select small){color:#aec0c5}
</style>
