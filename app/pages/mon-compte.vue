<script setup lang="ts">
const { user } = useAdminAuth()

useHead({ title: 'Mon compte' })

const displayName = computed(() => {
  if (!user.value) {
    return ''
  }
  return [user.value.prenom, user.value.nom].filter(Boolean).join(' ')
})
</script>

<template>
  <AdminAuthBoundary>
    <AdminShell>
      <div v-if="user" class="account-page">
        <header class="admin-section-heading">
          <div>
            <p class="admin-eyebrow">Profil</p>
            <h1>Mon compte</h1>
            <p class="admin-muted">Informations associées à votre session administrateur.</p>
          </div>
        </header>

        <section class="account-card admin-card" aria-labelledby="account-identity-title">
          <div class="account-card__avatar" aria-hidden="true">
            {{ (user.prenom?.[0] || user.username?.[0] || 'A').toLocaleUpperCase('fr') }}
          </div>

          <div class="account-card__heading">
            <h2 id="account-identity-title">{{ displayName || user.username }}</h2>
            <p>Administrateur</p>
          </div>

          <dl>
            <div>
              <dt>Prénom</dt>
              <dd>{{ user.prenom || '—' }}</dd>
            </div>
            <div>
              <dt>Nom</dt>
              <dd>{{ user.nom || '—' }}</dd>
            </div>
            <div>
              <dt>Nom d’utilisateur</dt>
              <dd>{{ user.username || '—' }}</dd>
            </div>
            <div>
              <dt>Adresse e-mail</dt>
              <dd><a :href="`mailto:${user.email}`">{{ user.email }}</a></dd>
            </div>
            <div>
              <dt>Identifiant</dt>
              <dd>{{ user.id }}</dd>
            </div>
            <div>
              <dt>Niveau d’accès</dt>
              <dd>Administration</dd>
            </div>
          </dl>
        </section>

        <aside class="account-note">
          <strong>Modification du profil</strong>
          <p>
            Cette version permet de consulter le compte. Aucune API de modification du profil ou du mot de passe n’est disponible.
          </p>
        </aside>
      </div>
    </AdminShell>
  </AdminAuthBoundary>
</template>

<style scoped>
.account-page {
  display: grid;
  gap: 25px;
}

.account-page .admin-section-heading .admin-muted {
  margin: 7px 0 0;
}

.account-card {
  display: grid;
  padding: clamp(20px, 4vw, 32px);
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 14px 18px;
  box-shadow: none;
}

.account-card__avatar {
  display: grid;
  width: 68px;
  height: 68px;
  grid-row: 1;
  place-items: center;
  color: white;
  background: linear-gradient(145deg, var(--admin-blue), var(--admin-navy));
  border-radius: 20px;
  font-size: 1.8rem;
  font-weight: 900;
}

.account-card__heading h2,
.account-card__heading p {
  margin: 0;
}

.account-card__heading h2 {
  color: var(--admin-navy);
  font-size: 1.5rem;
}

.account-card__heading p {
  margin-top: 4px;
  color: var(--admin-muted);
}

.account-card dl {
  display: grid;
  margin: 14px 0 0;
  grid-column: 1 / -1;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  overflow: hidden;
}

.account-card dl > div {
  min-width: 0;
  padding: 14px 16px;
  border-bottom: 1px solid var(--admin-border);
}

.account-card dl > div:nth-child(odd) {
  border-right: 1px solid var(--admin-border);
}

.account-card dl > div:nth-last-child(-n + 2) {
  border-bottom: 0;
}

.account-card dt {
  color: var(--admin-muted);
  font-size: .75rem;
  font-weight: 800;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.account-card dd {
  margin: 5px 0 0;
  overflow-wrap: anywhere;
  color: var(--admin-navy);
  font-weight: 750;
}

.account-note {
  padding: 17px 19px;
  color: #765018;
  background: #fff8e8;
  border-left: 4px solid #e9a53c;
  border-radius: 8px;
}

.account-note p {
  margin: 5px 0 0;
  line-height: 1.55;
}

@media (max-width: 590px) {
  .account-card dl {
    grid-template-columns: 1fr;
  }

  .account-card dl > div,
  .account-card dl > div:nth-child(odd),
  .account-card dl > div:nth-last-child(-n + 2) {
    border-right: 0;
    border-bottom: 1px solid var(--admin-border);
  }

  .account-card dl > div:last-child {
    border-bottom: 0;
  }
}
</style>
