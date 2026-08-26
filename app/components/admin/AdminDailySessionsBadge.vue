<script setup lang="ts">
interface DailyVisitorSnapshot {
  count: number
  date: string
  source: 'ga4' | 'local'
  notice?: string
}

const { status, isAuthenticated, checkSession, handleUnauthorized } = useAdminAuth()
const { localePath } = useLanguagePreferences()
const count = ref<number | null>(null)
const source = ref<'ga4' | 'local' | null>(null)
const loading = ref(false)
let refreshTimer: ReturnType<typeof setInterval> | undefined

const badgeLabel = computed(() => count.value === null
  ? 'Chargement du nombre de visiteurs distincts depuis minuit'
  : source.value === 'ga4'
    ? `${count.value.toLocaleString('fr-CH')} visiteur${count.value === 1 ? '' : 's'} distinct${count.value === 1 ? '' : 's'} depuis minuit selon GA4`
    : `${count.value.toLocaleString('fr-CH')} visiteur${count.value === 1 ? '' : 's'} estimé${count.value === 1 ? '' : 's'} depuis minuit selon la mesure locale`)

async function refreshCount() {
  if (!isAuthenticated.value || loading.value || document.visibilityState !== 'visible') return
  loading.value = true
  try {
    const snapshot = await $fetch<DailyVisitorSnapshot>('/api/admin/daily-visitors', {
      credentials: 'same-origin',
      timeout: 10_000,
    })
    count.value = snapshot.count
    source.value = snapshot.source
  }
  catch (error) {
    if (!handleUnauthorized(error)) count.value = null
  }
  finally {
    loading.value = false
  }
}

function stopRefreshTimer() {
  if (refreshTimer) clearInterval(refreshTimer)
  refreshTimer = undefined
}

function startRefreshTimer() {
  stopRefreshTimer()
  refreshTimer = setInterval(() => void refreshCount(), 60_000)
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible' && isAuthenticated.value) void refreshCount()
}

watch(isAuthenticated, (authenticated) => {
  if (!authenticated) {
    count.value = null
    source.value = null
    stopRefreshTimer()
    return
  }
  void refreshCount()
  startRefreshTimer()
})

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
  if (isAuthenticated.value) {
    void refreshCount()
    startRefreshTimer()
  }
  else if (status.value === 'unknown') {
    void checkSession()
  }
})

onBeforeUnmount(() => {
  stopRefreshTimer()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <NuxtLink
    v-if="isAuthenticated"
    class="admin-daily-sessions-badge"
    :class="{ 'is-loading': loading && count === null }"
    :to="localePath('/admin/charts')"
    :aria-label="badgeLabel"
    :title="badgeLabel"
    aria-live="polite"
  >
    <strong>{{ count === null ? '…' : count.toLocaleString('fr-CH') }}</strong>
    <span>{{ source === 'local' ? 'visiteurs estimés' : 'visiteurs aujourd’hui' }}</span>
  </NuxtLink>
</template>

<style scoped>
.admin-daily-sessions-badge{display:inline-flex;min-height:32px;padding:4px 10px 4px 7px;align-items:center;gap:7px;border:1px solid rgb(152 226 192 / 48%);border-radius:999px;color:#effff7;background:rgb(31 126 85 / 38%);box-shadow:inset 0 1px 0 rgb(255 255 255 / 10%);font-size:.72rem;font-weight:750;line-height:1;text-decoration:none;white-space:nowrap;transition:background-color 150ms ease,border-color 150ms ease,transform 150ms ease}
.admin-daily-sessions-badge strong{display:grid;min-width:24px;height:24px;padding:0 6px;place-items:center;border-radius:999px;color:#174d35;background:#d8f8e5;font-size:.76rem;font-weight:900}
.admin-daily-sessions-badge:hover{border-color:rgb(174 241 208 / 76%);background:rgb(31 126 85 / 58%);transform:translateY(-1px)}
.admin-daily-sessions-badge:focus-visible{outline:3px solid rgb(174 241 208 / 62%);outline-offset:2px}
.admin-daily-sessions-badge.is-loading{opacity:.8}
@media(max-width:640px){.admin-daily-sessions-badge{padding-right:8px}.admin-daily-sessions-badge span{font-size:0}.admin-daily-sessions-badge span::after{content:'sess.';font-size:.68rem}}
@media(prefers-reduced-motion:reduce){.admin-daily-sessions-badge{transition:none}.admin-daily-sessions-badge:hover{transform:none}}
</style>
