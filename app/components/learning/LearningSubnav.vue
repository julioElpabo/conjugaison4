<script setup lang="ts">
interface LearningNavItem {
  key: string
  label: string
  to: string
}

defineProps<{
  label: string
  items: LearningNavItem[]
  activeKey: string
}>()
</script>

<template>
  <nav class="learning-subnav" :aria-label="label">
    <span class="learning-subnav__label">{{ label }}</span>
    <ul>
      <li v-for="item in items" :key="item.key">
        <NuxtLink
          :to="item.to"
          :class="{ 'is-active': item.key === activeKey }"
          :aria-current="item.key === activeKey ? 'page' : undefined"
        >
          {{ item.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.learning-subnav { display: flex; width: fit-content; max-width: 100%; margin: 8px auto 34px; padding: 6px; align-items: center; border: 1px solid var(--line); border-radius: 16px; gap: 6px; background: color-mix(in srgb, var(--surface) 94%, var(--brand)); box-shadow: 0 8px 24px rgb(42 65 61 / 6%); }
.learning-subnav__label { padding: 7px 9px 7px 11px; color: var(--muted); font-size: .72rem; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; white-space: nowrap; }
.learning-subnav ul { display: flex; margin: 0; padding: 0; flex-wrap: wrap; gap: 4px; list-style: none; }
.learning-subnav a { display: block; padding: 8px 11px; border-radius: 10px; color: var(--brand-dark); font-size: .88rem; font-weight: 780; text-decoration: none; text-transform: capitalize; white-space: nowrap; transition: color .16s ease, background-color .16s ease; }
.learning-subnav a:hover { background: color-mix(in srgb, var(--surface) 70%, var(--brand)); }
.learning-subnav a.is-active { color: white; background: var(--brand); }
@media (max-width: 720px) {
  .learning-subnav { width: 100%; margin-bottom: 26px; align-items: stretch; flex-direction: column; }
  .learning-subnav__label { padding-bottom: 3px; }
  .learning-subnav ul { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: thin; }
}
</style>
