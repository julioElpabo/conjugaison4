<script setup lang="ts">
const { ui, localePath } = useLanguagePreferences()
useHead(() => ({
  title: ui('Apprendre la conjugaison'),
  meta: [{ name: 'description', content: ui('Une synthèse claire des règles essentielles de la conjugaison française.') }],
}))

const sections = computed(() => [
  { id: 'bases', number: '01', title: ui('Comprendre le verbe'), description: ui('Radical, terminaison, groupes et auxiliaires.') },
  { id: 'temps', number: '02', title: ui('Former les temps'), description: ui('Les repères pour construire les temps simples et composés.') },
  { id: 'modes', number: '03', title: ui('Choisir le bon mode'), description: ui('Indicatif, subjonctif, conditionnel et impératif.') },
  { id: 'accords', number: '04', title: ui('Réussir les accords'), description: ui('Sujet, auxiliaires et participe passé.') },
  { id: 'orthographe', number: '05', title: ui('Éviter les pièges'), description: ui('Modifications du radical et terminaisons à surveiller.') },
])

function scrollToSection(sectionId: string) {
  const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  document.getElementById(sectionId)?.scrollIntoView({ behavior, block: 'start' })
}
</script>

<template>
  <div class="learning-page">
    <header class="learning-hero">
      <p class="learning-eyebrow">{{ ui('Les règles essentielles') }}</p>
      <h1>{{ ui('Apprendre la conjugaison française') }}</h1>
      <p>{{ ui('Une carte simple pour comprendre comment les verbes se construisent, choisir le bon temps et éviter les erreurs les plus fréquentes.') }}</p>
    </header>

    <nav class="learning-summary" :aria-label="ui('Sommaire des règles')">
      <button v-for="section in sections" :key="section.id" type="button" @click="scrollToSection(section.id)">
        <span>{{ section.number }}</span>
        <strong>{{ section.title }}</strong>
        <small>{{ section.description }}</small>
      </button>
    </nav>

    <main class="learning-content">
      <section id="bases" class="rule-section">
        <header><span>01</span><div><p class="learning-eyebrow">{{ ui('Les fondations') }}</p><h2>{{ ui('Comprendre le verbe') }}</h2></div></header>
        <div class="rule-grid rule-grid--three">
          <article>
            <h3>{{ ui('Radical + terminaison') }}</h3>
            <p>{{ ui('Une forme conjuguée associe généralement un radical, qui porte le sens, et une terminaison, qui indique la personne, le mode et le temps.') }}</p>
            <p class="rule-example"><strong>nous chantions</strong><span>chant- + -ions</span></p>
          </article>
          <article>
            <h3>{{ ui('Les trois groupes') }}</h3>
            <ul>
              <li><strong>{{ ui('1er groupe :') }}</strong> {{ ui('verbes en -er, sauf aller.') }}</li>
              <li><strong>{{ ui('2e groupe :') }}</strong> {{ ui('verbes en -ir faisant -issons.') }}</li>
              <li><strong>{{ ui('3e groupe :') }}</strong> {{ ui('tous les autres verbes, souvent irréguliers.') }}</li>
            </ul>
          </article>
          <article>
            <h3>{{ ui('Être et avoir') }}</h3>
            <p>{{ ui('Ces deux verbes ont leurs propres conjugaisons et servent aussi d’auxiliaires pour former les temps composés.') }}</p>
            <p class="rule-example"><strong>elle a fini</strong><span>{{ ui('auxiliaire + participe passé') }}</span></p>
          </article>
        </div>
      </section>

      <section id="temps" class="rule-section">
        <header><span>02</span><div><p class="learning-eyebrow">{{ ui('La construction') }}</p><h2>{{ ui('Former les temps') }}</h2></div></header>
        <div class="formation-table" role="table" :aria-label="ui('Formation des principaux temps')">
          <div class="formation-row formation-row--head" role="row"><span>{{ ui('Temps') }}</span><span>{{ ui('Construction') }}</span><span>{{ ui('Exemple') }}</span></div>
          <div class="formation-row" role="row"><strong>{{ ui('Présent') }}</strong><span>{{ ui('radical + terminaisons du présent') }}</span><em>je parle, nous finissons</em></div>
          <div class="formation-row" role="row"><strong>{{ ui('Imparfait') }}</strong><span>{{ ui('radical de « nous » au présent + -ais, -ais, -ait, -ions, -iez, -aient') }}</span><em>nous parlions</em></div>
          <div class="formation-row" role="row"><strong>{{ ui('Futur simple') }}</strong><span>{{ ui('infinitif, ou radical irrégulier, + -ai, -as, -a, -ons, -ez, -ont') }}</span><em>tu viendras</em></div>
          <div class="formation-row" role="row"><strong>{{ ui('Conditionnel présent') }}</strong><span>{{ ui('radical du futur + terminaisons de l’imparfait') }}</span><em>vous pourriez</em></div>
          <div class="formation-row" role="row"><strong>{{ ui('Temps composé') }}</strong><span>{{ ui('auxiliaire conjugué + participe passé') }}</span><em>ils avaient compris</em></div>
        </div>
        <aside class="rule-note"><strong>{{ ui('Le bon réflexe') }}</strong><p>{{ ui('Pour reconnaître un temps composé, cherche d’abord une forme de avoir ou d’être, puis le participe passé.') }}</p></aside>
      </section>

      <section id="modes" class="rule-section">
        <header><span>03</span><div><p class="learning-eyebrow">{{ ui('Le sens') }}</p><h2>{{ ui('Choisir le bon mode') }}</h2></div></header>
        <div class="mode-cards">
          <article><span>{{ ui('Fait') }}</span><h3>{{ ui('Indicatif') }}</h3><p>{{ ui('Présente un fait, une action certaine ou située dans le temps.') }}</p><em>Demain, nous partirons.</em></article>
          <article><span>{{ ui('Doute') }}</span><h3>{{ ui('Subjonctif') }}</h3><p>{{ ui('Exprime notamment le souhait, la nécessité, le sentiment ou l’incertitude.') }}</p><em>Il faut que tu viennes.</em></article>
          <article><span>{{ ui('Hypothèse') }}</span><h3>{{ ui('Conditionnel') }}</h3><p>{{ ui('Présente une possibilité, une information incertaine ou une action soumise à une condition.') }}</p><em>Je viendrais si je pouvais.</em></article>
          <article><span>{{ ui('Consigne') }}</span><h3>{{ ui('Impératif') }}</h3><p>{{ ui('Exprime un ordre, un conseil ou une invitation, sans sujet exprimé.') }}</p><em>Écoutez attentivement !</em></article>
        </div>
      </section>

      <section id="accords" class="rule-section">
        <header><span>04</span><div><p class="learning-eyebrow">{{ ui('Les correspondances') }}</p><h2>{{ ui('Réussir les accords') }}</h2></div></header>
        <div class="agreement-flow">
          <article><span>1</span><div><h3>{{ ui('Trouver le sujet') }}</h3><p>{{ ui('Le verbe s’accorde en personne et en nombre avec son sujet, même lorsque celui-ci est éloigné.') }}</p><em>Les élèves de cette classe réussissent.</em></div></article>
          <article><span>2</span><div><h3>{{ ui('Identifier l’auxiliaire') }}</h3><p>{{ ui('Avec être, le participe passé s’accorde généralement avec le sujet.') }}</p><em>Elles sont arrivées.</em></div></article>
          <article><span>3</span><div><h3>{{ ui('Repérer le COD avec avoir') }}</h3><p>{{ ui('Avec avoir, le participe passé s’accorde avec le COD seulement si celui-ci est placé avant.') }}</p><em>Les lettres qu’il a écrites.</em></div></article>
        </div>
        <aside class="rule-note rule-note--warning"><strong>{{ ui('Verbes pronominaux') }}</strong><p>{{ ui('Leur accord dépend de la fonction du pronom. Il faut déterminer si celui-ci est COD, COI ou fait partie du verbe.') }}</p></aside>
      </section>

      <section id="orthographe" class="rule-section">
        <header><span>05</span><div><p class="learning-eyebrow">{{ ui('Les pièges fréquents') }}</p><h2>{{ ui('Préserver le son et l’orthographe') }}</h2></div></header>
        <div class="trap-grid">
          <article><h3>-ger et -cer</h3><p>{{ ui('On ajoute parfois un e après g ou une cédille pour conserver le son.') }}</p><em>nous mangeons · nous plaçons</em></article>
          <article><h3>-yer</h3><p>{{ ui('Le y peut devenir i devant un e muet. Pour certains verbes, les deux graphies sont admises.') }}</p><em>j’emploie · nous employons</em></article>
          <article><h3>e / è</h3><p>{{ ui('Certains verbes changent l’accent lorsque la syllabe suivante contient un e muet.') }}</p><em>je lève · nous levons</em></article>
          <article><h3>{{ ui('Consonne doublée') }}</h3><p>{{ ui('Certains verbes en -eler et -eter doublent la consonne ; d’autres prennent un accent grave.') }}</p><em>j’appelle · j’achète</em></article>
          <article><h3>-é ou -er ?</h3><p>{{ ui('Remplace le verbe par « vendre » : si « vendu » convient, écris le participe passé ; si « vendre » convient, écris l’infinitif.') }}</p><em>j’ai mangé · je vais manger</em></article>
          <article><h3>-rai ou -rais ?</h3><p>{{ ui('Le futur exprime ce qui arrivera ; le conditionnel dépend d’une condition ou atténue une demande.') }}</p><em>je viendrai · je viendrais si…</em></article>
        </div>
      </section>

      <section class="learning-actions" aria-labelledby="continue-title">
        <div><p class="learning-eyebrow">{{ ui('À toi de jouer') }}</p><h2 id="continue-title">{{ ui('Passe de la règle à la pratique') }}</h2><p>{{ ui('Consulte un modèle complet ou crée un exercice ciblé pour vérifier ce que tu viens d’apprendre.') }}</p></div>
        <div><NuxtLink :to="localePath('/consulter')">{{ ui('Consulter un verbe') }}</NuxtLink><NuxtLink class="is-primary" :to="localePath('/')">{{ ui('S’exercer') }}</NuxtLink></div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.learning-page { color: var(--ink); font-family: "Funnel Sans", "Avenir Next", Avenir, system-ui, sans-serif; }
.learning-hero { max-width: 850px; margin: 8px auto 36px; text-align: center; }
.learning-eyebrow { margin: 0 0 6px; color: var(--brand); font-size: .75rem; font-weight: 850; letter-spacing: .13em; text-transform: uppercase; }
.learning-hero h1 { margin: 0; color: #294c4b; font-size: clamp(2.3rem, 6vw, 4.7rem); letter-spacing: -.06em; line-height: 1; }
.learning-hero > p:last-child { max-width: 720px; margin: 20px auto 0; color: var(--muted); font-size: 1.1rem; line-height: 1.65; }
.learning-summary { display: grid; max-width: 1080px; margin: 0 auto 32px; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 9px; }
.learning-summary button { display: flex; min-height: 155px; flex-direction: column; padding: 16px; border: 1px solid var(--line); border-radius: 17px; color: var(--ink); background: rgb(255 255 255 / 88%); text-align: left; box-shadow: 0 10px 28px rgb(42 65 61 / 7%); transition: transform 150ms ease, border-color 150ms ease; cursor: pointer; }
.learning-summary button:hover { transform: translateY(-3px); border-color: var(--brand); }
.learning-summary span { color: var(--accent); font-size: .76rem; font-weight: 850; }
.learning-summary strong { margin-top: auto; color: var(--brand-dark); line-height: 1.2; }
.learning-summary small { margin-top: 6px; color: var(--muted); line-height: 1.35; }
.learning-content { display: grid; max-width: 1080px; margin: 0 auto; gap: 24px; }
.rule-section { padding: 30px; border: 1px solid var(--line); border-radius: 24px; background: rgb(255 255 255 / 92%); box-shadow: var(--shadow); scroll-margin-top: 20px; }
.rule-section > header { display: flex; align-items: center; gap: 16px; margin-bottom: 23px; }
.rule-section > header > span { display: grid; flex: 0 0 48px; width: 48px; height: 48px; place-items: center; border-radius: 14px; color: var(--brand-dark); background: var(--brand-pale); font-weight: 850; }
.rule-section h2 { margin: 0; color: var(--brand-dark); font-size: clamp(1.65rem, 4vw, 2.4rem); letter-spacing: -.04em; }
.rule-section h3 { margin: 0 0 9px; color: var(--brand-dark); font-size: 1.08rem; }
.rule-section article p, .rule-section li { color: var(--muted); line-height: 1.55; }
.rule-grid { display: grid; gap: 13px; }
.rule-grid--three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.rule-grid article, .trap-grid article { padding: 18px; border: 1px solid var(--line); border-radius: 17px; background: var(--soft); }
.rule-grid article > p { margin: 0; }
.rule-grid ul { margin: 0; padding-left: 19px; }
.rule-example { display: flex; flex-direction: column; margin-top: 16px !important; padding: 12px; border-radius: 11px; color: var(--ink) !important; background: white; }
.rule-example span { margin-top: 3px; color: var(--muted); font-size: .82rem; }
.formation-table { overflow: hidden; border: 1px solid var(--line); border-radius: 17px; }
.formation-row { display: grid; grid-template-columns: .7fr 1.7fr 1fr; gap: 14px; padding: 13px 16px; border-top: 1px solid var(--line); align-items: center; }
.formation-row:first-child { border-top: 0; }
.formation-row--head { color: white; background: var(--brand); font-size: .78rem; font-weight: 800; text-transform: uppercase; }
.formation-row em { color: var(--brand-dark); }
.rule-note { display: flex; align-items: center; gap: 18px; margin-top: 15px; padding: 15px 18px; border-radius: 15px; color: var(--brand-dark); background: var(--brand-pale); }
.rule-note p { margin: 0; line-height: 1.5; }
.rule-note--warning { color: #784719; background: var(--accent-pale); }
.mode-cards { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 11px; }
.mode-cards article { padding: 18px; border: 1px solid var(--line); border-radius: 17px; background: var(--soft); }
.mode-cards article > span { display: inline-block; margin-bottom: 15px; padding: 5px 8px; border-radius: 99px; color: var(--brand-dark); background: var(--brand-pale); font-size: .72rem; font-weight: 800; text-transform: uppercase; }
.mode-cards p { min-height: 105px; margin-bottom: 10px; }
.mode-cards em, .trap-grid em, .agreement-flow em { color: var(--brand-dark); }
.agreement-flow { display: grid; gap: 10px; }
.agreement-flow article { display: flex; align-items: start; gap: 15px; padding: 16px 18px; border: 1px solid var(--line); border-radius: 16px; background: var(--soft); }
.agreement-flow article > span { display: grid; flex: 0 0 34px; width: 34px; height: 34px; place-items: center; border-radius: 50%; color: white; background: var(--brand); font-weight: 800; }
.agreement-flow p { margin: 0 0 5px; }
.trap-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 11px; }
.trap-grid p { min-height: 74px; margin: 0 0 8px; }
.learning-actions { display: flex; align-items: center; justify-content: space-between; gap: 28px; padding: 30px; border-radius: 24px; color: white; background: #345f58; }
.learning-actions .learning-eyebrow { color: #bfe5d8; }
.learning-actions h2 { margin: 0; font-size: 1.8rem; }
.learning-actions p:last-child { max-width: 630px; margin: 8px 0 0; color: #dbece7; line-height: 1.5; }
.learning-actions > div:last-child { display: flex; flex: 0 0 auto; gap: 8px; }
.learning-actions a { padding: 10px 14px; border: 1px solid rgb(255 255 255 / 45%); border-radius: 99px; color: white; text-decoration: none; font-weight: 750; }
.learning-actions a.is-primary { border-color: var(--accent); background: var(--accent); }
@media (max-width: 850px) {
  .learning-summary { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .rule-grid--three, .trap-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .mode-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 620px) {
  .learning-summary { grid-template-columns: 1fr; }
  .learning-summary button { min-height: 105px; }
  .rule-section { padding: 20px; border-radius: 19px; }
  .rule-grid--three, .trap-grid, .mode-cards { grid-template-columns: 1fr; }
  .mode-cards p, .trap-grid p { min-height: 0; }
  .formation-row { grid-template-columns: 1fr; gap: 4px; }
  .formation-row--head { display: none; }
  .rule-note, .learning-actions { align-items: start; flex-direction: column; }
  .learning-actions > div:last-child { width: 100%; flex-wrap: wrap; }
}
</style>
