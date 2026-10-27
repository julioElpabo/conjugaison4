<script setup lang="ts">
const { ui } = useLanguagePreferences()
const emit = defineEmits<{ discover: [] }>()
</script>

<template>
  <aside class="zazizozu-discovery" :aria-label="ui('Découvrez Zazizozu.')">
    <img
      class="zazizozu-discovery__image"
      src="/images/zazizozu/ma-ville.webp"
      width="1600"
      height="160"
      alt=""
      loading="lazy"
      decoding="async"
    />
    <header class="zazizozu-discovery__heading">
      <p>{{ ui('Vous aimez Tatitotu ?') }}</p>
      <h2>{{ ui('Découvrez Zazizozu.') }}</h2>
    </header>
    <p class="zazizozu-discovery__description">{{ ui('Des jeux éducatifs pour progresser en lecture, en maths et dans la vie quotidienne.') }}</p>
    <div class="zazizozu-discovery__footer">
      <p class="zazizozu-discovery__promise">
        <span aria-hidden="true">✓</span>
        {{ ui('Toujours gratuit et sans publicité') }}
      </p>
      <a class="zazizozu-discovery__link" href="https://zazizozu.ch/" target="_blank" rel="noopener noreferrer" @click="emit('discover')" @auxclick.middle="emit('discover')">
        {{ ui('Découvrir Zazizozu') }} <span aria-hidden="true">→</span>
      </a>
    </div>
  </aside>
</template>

<style scoped>
.zazizozu-discovery {
  position: relative;
  isolation: isolate;
  display: grid;
  min-width: 0;
  padding: 16px;
  gap: 6px;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 35%);
  border-radius: 18px;
  box-shadow: 0 10px 26px rgb(24 60 53 / 18%);
  color: #fff;
  background: #173f36;
}
.zazizozu-discovery__image { position: absolute; z-index: -2; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 66% center; }
.zazizozu-discovery::before { position: absolute; z-index: -1; inset: 0; background: linear-gradient(90deg, rgb(13 46 39 / 97%) 0%, rgb(13 46 39 / 92%) 46%, rgb(13 46 39 / 65%) 72%, rgb(13 46 39 / 8%) 100%); content: ''; }
.zazizozu-discovery__heading { min-width: 0; max-width: 300px; }
.zazizozu-discovery__heading p { margin: 0 0 4px; color: #dbeedc; font-size: .75rem; line-height: 1.3; }
.zazizozu-discovery__heading h2 { margin: 0; color: white; font-size: 1.35rem; line-height: 1.15; letter-spacing: -.02em; }
.zazizozu-discovery__description { max-width: 295px; margin: 0; color: #f5f7ed; font-size: .8rem; line-height: 1.4; }
.zazizozu-discovery__footer { display: flex; min-width: 0; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px 8px; }
.zazizozu-discovery__promise { display: flex; margin: 0; align-items: baseline; gap: 5px; color: #f8edbc; font-size: .69rem; font-weight: 700; line-height: 1.4; }
.zazizozu-discovery__promise span { color: #bde9a3; }
.zazizozu-discovery__link { display: inline-flex; min-height: 44px; padding: 8px 11px; align-items: center; justify-content: center; gap: 8px; border-radius: 999px; color: #183b2a; background: #fbe4a0; font-size: .75rem; font-weight: 800; text-decoration: none; }
.zazizozu-discovery__link:hover { background: #fff0c2; }
.zazizozu-discovery__link:focus-visible { outline: 3px solid white; outline-offset: 3px; }
@media (min-width: 1024px) {
  .zazizozu-discovery { padding: 14px 16px; border-radius: 15px; }
}
@container (max-width: 360px) {
  .zazizozu-discovery__description { max-width: 250px; }
  .zazizozu-discovery__footer { align-items: start; flex-direction: column; gap: 8px; }
}
@media (max-width: 640px) {
  .zazizozu-discovery { padding: 18px; gap: 12px; }
  .zazizozu-discovery__heading p { margin-bottom: 6px; }
  .zazizozu-discovery__description { font-size: .82rem; line-height: 1.55; }
  .zazizozu-discovery__footer { align-items: start; flex-direction: column; gap: 16px; }
  .zazizozu-discovery__promise { font-size: .72rem; line-height: 1.5; }
}
</style>
