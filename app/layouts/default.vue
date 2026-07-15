<script setup lang="ts">
const route = useRoute()
const isAdminRoute = computed(() => route.path === '/admin' || route.path.startsWith('/admin/'))
</script>

<template>
  <div class="site-shell">
    <header class="site-header">
      <div class="site-header__inner">
        <a class="site-brand" href="/">
          <strong>TATITOTU</strong>
          <span>Défis de conjugaison</span>
        </a>
      </div>
    </header>

    <main :class="['site-main', { 'site-main--admin': isAdminRoute }]">
      <slot />
    </main>

    <footer class="site-footer">
      <p>Un outil gratuit pour travailler la conjugaison française.</p>
      <div class="site-footer__links">
        <a href="mailto:christophe.roulet@edu-vd.ch">Contact</a>
        <NuxtLink to="/admin">Administration</NuxtLink>
      </div>
    </footer>
  </div>
</template>

<style>
:root {
  color-scheme: light;
  --ink: #243247;
  --muted: #667085;
  --surface: #ffffff;
  --surface-soft: #f4f8fb;
  --line: #d9e2ea;
  --brand: #176b87;
  --brand-dark: #0e4e65;
  --accent: #e58b2b;
  --success: #34895f;
  --danger: #b42318;
  --shadow: 0 18px 50px rgb(36 50 71 / 10%);
  font-family: "Funnel Sans", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

html {
  min-width: 320px;
  background: #edf8fb;
}

body {
  min-height: 100vh;
  margin: 0;
  color: var(--ink);
  background: linear-gradient(180deg, #d7f3fa 0%, #f9f8e8 72%, #f6f3e7 100%);
}

button,
input,
select,
textarea {
  font: inherit;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

a {
  color: var(--brand-dark);
}

.site-shell {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.site-header {
  color: white;
  background: #344758;
  box-shadow: 0 2px 10px rgb(26 42 56 / 18%);
}

.site-header__inner {
  display: flex;
  width: min(1180px, calc(100% - 32px));
  min-height: 68px;
  margin: 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.site-brand {
  display: flex;
  align-items: baseline;
  gap: 10px;
  color: white;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: .06em;
}

.site-brand strong {
  letter-spacing: .18em;
}

.site-brand span {
  opacity: .82;
  font-size: .88rem;
}

.site-header nav {
  display: flex;
  gap: 18px;
}

.site-header nav a {
  padding: 8px 0;
  color: #eaf4f7;
  text-decoration: none;
}

.site-header nav a.router-link-active {
  color: white;
  border-bottom: 2px solid #70d2e8;
}

.site-main {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  flex: 1;
  padding: 38px 0 64px;
}

.site-main--admin {
  width: calc(100% - 24px);
  max-width: none;
}

.site-footer {
  min-height: 150px;
  padding: 42px 24px;
  color: #dfe9ef;
  text-align: center;
  background: #344758;
}

.site-footer p {
  margin: 0 0 10px;
}

.site-footer a {
  color: white;
}

.site-footer__links {
  display: flex;
  justify-content: center;
  gap: 18px;
}

@media (max-width: 640px) {
  .site-header__inner {
    min-height: 62px;
  }

  .site-brand span {
    display: none;
  }

  .site-main {
    width: min(100% - 20px, 1180px);
    padding-top: 22px;
  }

  .site-main--admin {
    width: calc(100% - 10px);
  }
}
</style>
