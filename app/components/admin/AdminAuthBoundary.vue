<script setup lang="ts">
const { user, status, checkSession } = useAdminAuth()

onMounted(() => {
  if (status.value === 'unknown') {
    void checkSession()
  }
})
</script>

<template>
  <div class="admin-gate">
    <div
      v-if="status === 'unknown' || status === 'checking'"
      class="admin-loading admin-card"
      role="status"
      aria-live="polite"
    >
      <span class="admin-spinner" aria-hidden="true" />
      <p>Vérification de la session…</p>
    </div>

    <AdminLoginForm v-else-if="!user" />

    <slot v-else :user="user" />
  </div>
</template>

<style>
.admin-gate {
  --admin-navy: #183b52;
  --admin-blue: #176b87;
  --admin-blue-dark: #0e4e65;
  --admin-cyan: #e7f7fb;
  --admin-orange: #d97816;
  --admin-red: #b42318;
  --admin-green: #26734d;
  --admin-border: #cedbe4;
  --admin-muted: #607181;
  min-width: 0;
}

.admin-card {
  color: var(--ink, #243247);
  background: rgb(255 255 255 / 96%);
  border: 1px solid rgb(206 219 228 / 90%);
  border-radius: 18px;
  box-shadow: 0 16px 44px rgb(24 59 82 / 10%);
}

.admin-loading {
  display: flex;
  width: min(100%, 420px);
  min-height: 150px;
  margin: clamp(24px, 8vh, 88px) auto;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 28px;
}

.admin-loading p {
  margin: 0;
  color: var(--admin-muted);
  font-weight: 700;
}

.admin-spinner {
  width: 25px;
  height: 25px;
  border: 3px solid #cce4eb;
  border-top-color: var(--admin-blue);
  border-radius: 50%;
  animation: admin-spin .7s linear infinite;
}

@keyframes admin-spin {
  to { transform: rotate(360deg); }
}

.admin-eyebrow {
  margin: 0;
  color: var(--admin-blue);
  font-size: .75rem;
  font-weight: 800;
  letter-spacing: .15em;
  text-transform: uppercase;
}

.admin-muted {
  color: var(--admin-muted);
  line-height: 1.6;
}

.admin-form {
  display: grid;
  gap: 18px;
}

.admin-field {
  display: grid;
  min-width: 0;
  gap: 7px;
  color: var(--admin-navy);
  font-weight: 750;
}

.admin-field > span,
.admin-field > legend {
  font-size: .9rem;
}

.admin-field input,
.admin-field select,
.admin-field textarea,
.admin-input {
  width: 100%;
  min-height: 44px;
  padding: 9px 12px;
  color: var(--ink, #243247);
  background: white;
  border: 1px solid #b9cbd6;
  border-radius: 9px;
  outline: none;
}

.admin-field input:focus,
.admin-field select:focus,
.admin-field textarea:focus,
.admin-input:focus {
  border-color: var(--admin-blue);
  box-shadow: 0 0 0 3px rgb(23 107 135 / 15%);
}

.admin-button {
  display: inline-flex;
  min-height: 42px;
  padding: 9px 16px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--admin-navy);
  background: white;
  border: 1px solid #b9cbd6;
  border-radius: 9px;
  cursor: pointer;
  font-weight: 800;
  text-decoration: none;
}

.admin-button:hover:not(:disabled) {
  border-color: var(--admin-blue);
  transform: translateY(-1px);
}

.admin-button:focus-visible {
  outline: 3px solid rgb(23 107 135 / 28%);
  outline-offset: 2px;
}

.admin-button:disabled {
  cursor: not-allowed;
  opacity: .58;
}

.admin-button--primary {
  color: white;
  background: var(--admin-blue);
  border-color: var(--admin-blue);
}

.admin-button--primary:hover:not(:disabled) {
  background: var(--admin-blue-dark);
  border-color: var(--admin-blue-dark);
}

.admin-button--danger {
  color: var(--admin-red);
  border-color: #e7b8b3;
}

.admin-button--small {
  min-height: 36px;
  padding: 6px 11px;
  font-size: .88rem;
}

.admin-notice {
  margin: 0;
  padding: 11px 13px;
  border: 1px solid #b9cbd6;
  border-radius: 9px;
  line-height: 1.45;
}

.admin-notice--error {
  color: #8b1e17;
  background: #fff3f1;
  border-color: #efc2bd;
}

.admin-notice--success {
  color: #185c3a;
  background: #effaf4;
  border-color: #a9d8bd;
}

.admin-section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
}

.admin-section-heading h1,
.admin-section-heading h2 {
  margin: 3px 0 0;
  color: var(--admin-navy);
  line-height: 1.12;
}

.admin-section-heading h1 {
  font-size: clamp(1.8rem, 5vw, 2.65rem);
}

.admin-section-heading h2 {
  font-size: clamp(1.35rem, 3vw, 1.75rem);
}

.admin-sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

@media (prefers-reduced-motion: reduce) {
  .admin-spinner {
    animation-duration: 1.8s;
  }

  .admin-button:hover:not(:disabled) {
    transform: none;
  }
}
</style>
