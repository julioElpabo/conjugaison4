import { _ as __nuxt_component_0 } from './LearningSubnav-CV5szJr4.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-icjx6oE7.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
import { i as isModeLandingSlug, m as modeLandingPage, M as MODE_LANDING_SLUGS } from '../_/mode-landing-pages.mjs';
import { a as modeTensePage, m as modeTensePages } from '../_/mode-tense-pages.mjs';
import { g as useRoute, f as useLanguagePreferences, k as createError, u as useHead } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const pedagogy = {
  "indicatif:present": {
    summary: "Le pr\xE9sent de l\u2019indicatif situe le fait au moment o\xF9 l\u2019on parle, mais il sert aussi \xE0 exprimer une habitude ou une v\xE9rit\xE9 valable en g\xE9n\xE9ral.",
    formation: "On conjugue directement le verbe au pr\xE9sent. Le radical et les terminaisons varient selon le groupe et le verbe.",
    uses: ["Une action en cours maintenant", "Une habitude ou une r\xE9p\xE9tition", "Une v\xE9rit\xE9 g\xE9n\xE9rale"],
    examples: [
      { sentence: "Je ferme la fen\xEAtre maintenant.", context: "La personne d\xE9crit son geste au moment m\xEAme o\xF9 elle parle.", reason: "L\u2019indicatif pr\xE9sente le geste comme r\xE9el ; le pr\xE9sent le rend simultan\xE9 \xE0 la parole." },
      { sentence: "Chaque matin, Lina prend le train.", context: "\xAB Chaque matin \xBB signale une habitude.", reason: "Le pr\xE9sent convient \xE0 une action qui se r\xE9p\xE8te r\xE9guli\xE8rement." },
      { sentence: "L\u2019eau bout \xE0 100 \xB0C.", context: "Il s\u2019agit d\u2019un fait scientifique g\xE9n\xE9ral.", reason: "Le pr\xE9sent de v\xE9rit\xE9 g\xE9n\xE9rale ne d\xE9pend pas d\u2019un moment pr\xE9cis." }
    ]
  },
  "indicatif:imparfait": {
    summary: "L\u2019imparfait montre une action pass\xE9e en cours, habituelle ou utilis\xE9e comme d\xE9cor d\u2019un r\xE9cit, sans insister sur sa fin.",
    formation: "On prend g\xE9n\xE9ralement le radical de \xAB nous \xBB au pr\xE9sent sans -ons, puis on ajoute -ais, -ais, -ait, -ions, -iez, -aient.",
    uses: ["Le d\xE9cor et les circonstances d\u2019un r\xE9cit", "Une habitude pass\xE9e", "Une action en cours interrompue"],
    examples: [
      { sentence: "Le soleil brillait et la place \xE9tait calme.", context: "Le narrateur installe le d\xE9cor avant les \xE9v\xE9nements.", reason: "L\u2019imparfait d\xE9crit un \xE9tat durable \xE0 l\u2019arri\xE8re-plan du r\xE9cit." },
      { sentence: "Enfant, nous jouions ici tous les mercredis.", context: "\xAB Tous les mercredis \xBB marque une r\xE9p\xE9tition dans le pass\xE9.", reason: "L\u2019imparfait exprime une habitude pass\xE9e sans limites pr\xE9cises." },
      { sentence: "Je pr\xE9parais le repas quand tu as appel\xE9.", context: "La pr\xE9paration \xE9tait d\xE9j\xE0 en cours au moment de l\u2019appel.", reason: "L\u2019imparfait porte l\u2019action longue ; le pass\xE9 compos\xE9 signale l\u2019\xE9v\xE9nement qui l\u2019interrompt." }
    ]
  },
  "indicatif:passe-compose": {
    summary: "Le pass\xE9 compos\xE9 pr\xE9sente un \xE9v\xE9nement pass\xE9 achev\xE9, souvent li\xE9 au pr\xE9sent ou racont\xE9 dans une conversation.",
    formation: "On emploie avoir ou \xEAtre au pr\xE9sent, suivi du participe pass\xE9. L\u2019accord d\xE9pend de l\u2019auxiliaire et de la place du compl\xE9ment direct.",
    uses: ["Un \xE9v\xE9nement termin\xE9", "Une suite d\u2019actions au premier plan", "Un r\xE9sultat encore visible maintenant"],
    examples: [
      { sentence: "Ce matin, j\u2019ai envoy\xE9 le dossier.", context: "L\u2019envoi est termin\xE9 et le moment est identifi\xE9.", reason: "L\u2019indicatif affirme le fait ; le pass\xE9 compos\xE9 pr\xE9sente l\u2019action comme accomplie." },
      { sentence: "Elle est entr\xE9e, a salu\xE9 puis s\u2019est assise.", context: "Les actions font avancer le r\xE9cit l\u2019une apr\xE8s l\u2019autre.", reason: "Le pass\xE9 compos\xE9 convient aux \xE9v\xE9nements successifs du premier plan." },
      { sentence: "Nous avons perdu la cl\xE9, donc nous attendons dehors.", context: "La perte pass\xE9e a une cons\xE9quence pr\xE9sente.", reason: "Le pass\xE9 compos\xE9 relie naturellement l\u2019\xE9v\xE9nement accompli \xE0 son r\xE9sultat actuel." }
    ]
  },
  "indicatif:plus-que-parfait": {
    summary: "Le plus-que-parfait exprime un fait d\xE9j\xE0 accompli avant un autre moment du pass\xE9.",
    formation: "On conjugue avoir ou \xEAtre \xE0 l\u2019imparfait, puis on ajoute le participe pass\xE9.",
    uses: ["Une action ant\xE9rieure \xE0 une autre action pass\xE9e", "Une cause d\xE9j\xE0 r\xE9alis\xE9e", "Un retour en arri\xE8re dans un r\xE9cit"],
    examples: [
      { sentence: "Quand le train est arriv\xE9, nous avions d\xE9j\xE0 achet\xE9 les billets.", context: "L\u2019achat pr\xE9c\xE8de l\u2019arriv\xE9e du train.", reason: "Le plus-que-parfait marque clairement l\u2019ant\xE9riorit\xE9 entre deux faits pass\xE9s." },
      { sentence: "Elle \xE9tait rassur\xE9e parce qu\u2019elle avait re\xE7u la r\xE9ponse.", context: "La r\xE9ception explique un \xE9tat ressenti ensuite.", reason: "Le temps pr\xE9sente la cause comme achev\xE9e avant sa cons\xE9quence pass\xE9e." },
      { sentence: "Il reconnut la maison o\xF9 il avait grandi.", context: "Le r\xE9cit revient sur une p\xE9riode plus ancienne.", reason: "Le plus-que-parfait ouvre un retour en arri\xE8re par rapport au moment racont\xE9." }
    ]
  },
  "indicatif:passe-simple": {
    summary: "Le pass\xE9 simple raconte des \xE9v\xE9nements achev\xE9s au premier plan, surtout dans les r\xE9cits \xE9crits et litt\xE9raires.",
    formation: "C\u2019est un temps simple dont les terminaisons d\xE9pendent du groupe ; de nombreux verbes du troisi\xE8me groupe ont un radical particulier.",
    uses: ["Les actions principales d\u2019un r\xE9cit \xE9crit", "Un \xE9v\xE9nement bref et d\xE9limit\xE9", "Une succession d\u2019actions achev\xE9es"],
    examples: [
      { sentence: "Le voyageur ouvrit la porte et entra.", context: "Un r\xE9cit \xE9crit encha\xEEne deux actions br\xE8ves.", reason: "Le pass\xE9 simple fait progresser l\u2019histoire avec des \xE9v\xE9nements achev\xE9s." },
      { sentence: "Soudain, la lumi\xE8re s\u2019\xE9teignit.", context: "\xAB Soudain \xBB annonce une rupture ponctuelle.", reason: "Le pass\xE9 simple d\xE9tache cet \xE9v\xE9nement du d\xE9cor d\xE9crit \xE0 l\u2019imparfait." },
      { sentence: "Ils travers\xE8rent la for\xEAt, atteignirent le col et disparurent.", context: "Plusieurs \xE9tapes successives structurent le r\xE9cit.", reason: "Chaque verbe au pass\xE9 simple pr\xE9sente une \xE9tape compl\xE8te." }
    ]
  },
  "indicatif:passe-anterieur": {
    summary: "Le pass\xE9 ant\xE9rieur indique qu\u2019une action s\u2019est achev\xE9e imm\xE9diatement avant une autre action au pass\xE9 simple, surtout dans un r\xE9cit soutenu.",
    formation: "On conjugue avoir ou \xEAtre au pass\xE9 simple, suivi du participe pass\xE9.",
    uses: ["Une action juste ant\xE9rieure au pass\xE9 simple", "Une action accomplie avant la suite du r\xE9cit", "Les propositions introduites par quand, d\xE8s que ou apr\xE8s que"],
    examples: [
      { sentence: "D\xE8s qu\u2019il eut ferm\xE9 la porte, il partit.", context: "La fermeture est enti\xE8rement termin\xE9e avant le d\xE9part.", reason: "Le pass\xE9 ant\xE9rieur ordonne deux actions rapproch\xE9es dans un r\xE9cit au pass\xE9 simple." },
      { sentence: "Quand elles furent arriv\xE9es, la r\xE9union commen\xE7a.", context: "Le d\xE9but attend l\u2019ach\xE8vement de leur arriv\xE9e.", reason: "Le temps souligne que la premi\xE8re action est accomplie avant la seconde." },
      { sentence: "Apr\xE8s qu\u2019il eut relu sa lettre, il la signa.", context: "La relecture pr\xE9c\xE8de n\xE9cessairement la signature.", reason: "Dans ce registre \xE9crit, le pass\xE9 ant\xE9rieur marque cette ant\xE9riorit\xE9 imm\xE9diate." }
    ]
  },
  "indicatif:futur-simple": {
    summary: "Le futur simple pr\xE9sente comme \xE0 venir un fait que le locuteur annonce, pr\xE9voit ou promet.",
    formation: "On ajoute g\xE9n\xE9ralement -ai, -as, -a, -ons, -ez, -ont \xE0 l\u2019infinitif ou \xE0 un radical futur irr\xE9gulier.",
    uses: ["Une pr\xE9vision", "Une promesse ou un engagement", "Un \xE9v\xE9nement futur dat\xE9"],
    examples: [
      { sentence: "Demain, nous partirons \xE0 huit heures.", context: "\xAB Demain \xBB situe clairement le d\xE9part apr\xE8s le moment pr\xE9sent.", reason: "L\u2019indicatif annonce le d\xE9part comme pr\xE9vu ; le futur simple le place \xE0 venir." },
      { sentence: "Je te rappellerai ce soir.", context: "La personne prend un engagement pour plus tard.", reason: "Le futur simple donne \xE0 la promesse une valeur directe et assur\xE9e." },
      { sentence: "Selon la m\xE9t\xE9o, il neigera en altitude.", context: "Il s\u2019agit d\u2019une pr\xE9vision fond\xE9e sur des informations.", reason: "Le futur convient \xE0 un fait attendu mais pas encore r\xE9alis\xE9." }
    ]
  },
  "indicatif:futur-anterieur": {
    summary: "Le futur ant\xE9rieur pr\xE9sente une action qui sera d\xE9j\xE0 termin\xE9e avant un autre rep\xE8re futur.",
    formation: "On emploie avoir ou \xEAtre au futur simple, suivi du participe pass\xE9.",
    uses: ["Une action accomplie avant une autre action future", "Un bilan \xE0 une \xE9ch\xE9ance", "Une supposition sur un fait pass\xE9"],
    examples: [
      { sentence: "Quand tu arriveras, j\u2019aurai termin\xE9 le repas.", context: "La fin de la pr\xE9paration pr\xE9c\xE9dera l\u2019arriv\xE9e.", reason: "Le futur ant\xE9rieur marque l\u2019accomplissement avant le second rep\xE8re futur." },
      { sentence: "\xC0 la fin du mois, nous aurons parcouru mille kilom\xE8tres.", context: "On se place \xE0 une \xE9ch\xE9ance pour dresser un bilan.", reason: "Ce temps pr\xE9sente la distance comme enti\xE8rement parcourue \xE0 ce moment futur." },
      { sentence: "Il n\u2019est pas l\xE0 ; il aura oubli\xE9 notre rendez-vous.", context: "Le locuteur formule une explication probable d\u2019un fait pr\xE9sent.", reason: "Le futur ant\xE9rieur peut exprimer une supposition sur ce qui s\u2019est pass\xE9." }
    ]
  },
  "indicatif:futur-proche": {
    summary: "Le futur proche annonce une action imminente ou d\xE9j\xE0 pr\xE9par\xE9e, souvent per\xE7ue comme proche du pr\xE9sent.",
    formation: "On conjugue aller au pr\xE9sent, puis on ajoute l\u2019infinitif du verbe principal.",
    uses: ["Une action imminente", "Une intention d\xE9j\xE0 d\xE9cid\xE9e", "Une cons\xE9quence visible"],
    examples: [
      { sentence: "Attention, le verre va tomber !", context: "La situation montre que la chute est imminente.", reason: "Le futur proche relie directement la pr\xE9diction aux indices pr\xE9sents." },
      { sentence: "Nous allons repeindre la cuisine ce week-end.", context: "Le projet est d\xE9cid\xE9 et pr\xE9par\xE9.", reason: "Cette forme convient \xE0 une intention concr\xE8te proche du moment pr\xE9sent." },
      { sentence: "Regarde ces nuages : il va pleuvoir.", context: "Les nuages constituent un signe observable maintenant.", reason: "Le choix du futur proche souligne la cons\xE9quence attendue des indices pr\xE9sents." }
    ]
  },
  "subjonctif:present": {
    summary: "Le subjonctif pr\xE9sent exprime une action envisag\xE9e au pr\xE9sent ou dans l\u2019avenir \xE0 travers une volont\xE9, une n\xE9cessit\xE9, une \xE9motion ou un doute.",
    formation: "Il est souvent introduit par que. On utilise les terminaisons -e, -es, -e, -ions, -iez, -ent, avec des radicaux parfois irr\xE9guliers.",
    uses: ["Une n\xE9cessit\xE9", "Un souhait ou une volont\xE9", "Un doute ou un sentiment"],
    examples: [
      { sentence: "Il faut que tu viennes avant midi.", context: "\xAB Il faut que \xBB exprime une n\xE9cessit\xE9.", reason: "Le subjonctif est impos\xE9 par la n\xE9cessit\xE9 ; le pr\xE9sent vise une venue non encore r\xE9alis\xE9e." },
      { sentence: "Je souhaite que vous r\xE9ussissiez.", context: "La r\xE9ussite est d\xE9sir\xE9e, mais elle n\u2019est pas pr\xE9sent\xE9e comme un fait.", reason: "Le souhait d\xE9clenche le subjonctif pr\xE9sent." },
      { sentence: "Je doute qu\u2019elle connaisse la r\xE9ponse.", context: "Le locuteur ne tient pas sa connaissance pour certaine.", reason: "Le doute conduit \xE0 pr\xE9senter l\u2019action au subjonctif plut\xF4t qu\u2019\xE0 l\u2019indicatif." }
    ]
  },
  "subjonctif:passe": {
    summary: "Le subjonctif pass\xE9 exprime une action accomplie, mais toujours envisag\xE9e \xE0 travers un sentiment, un jugement, un souhait ou un doute.",
    formation: "On met avoir ou \xEAtre au subjonctif pr\xE9sent, suivi du participe pass\xE9.",
    uses: ["Un jugement sur une action achev\xE9e", "Un regret ou une \xE9motion li\xE9s au pass\xE9", "Un doute portant sur un fait ant\xE9rieur"],
    examples: [
      { sentence: "Je suis heureux que tu aies r\xE9ussi.", context: "La r\xE9ussite a d\xE9j\xE0 eu lieu ; elle provoque une \xE9motion pr\xE9sente.", reason: "Le sentiment appelle le subjonctif et l\u2019ant\xE9riorit\xE9 exige sa forme pass\xE9e." },
      { sentence: "Elle regrette que nous soyons partis si t\xF4t.", context: "Le d\xE9part est achev\xE9 avant le regret exprim\xE9.", reason: "Le subjonctif pass\xE9 combine le regard subjectif et l\u2019action accomplie." },
      { sentence: "Je doute qu\u2019ils aient re\xE7u le message.", context: "La r\xE9ception \xE9ventuelle pr\xE9c\xE8de le doute actuel.", reason: "Le doute impose le subjonctif ; le pass\xE9 situe la r\xE9ception avant ce doute." }
    ]
  },
  "subjonctif:imparfait": {
    summary: "Le subjonctif imparfait est une forme surtout litt\xE9raire qui exprime, dans un contexte pass\xE9, une action simultan\xE9e ou post\xE9rieure soumise au subjonctif.",
    formation: "Il se construit \xE0 partir du radical du pass\xE9 simple et de terminaisons comme -sse, -sses, -\xE2t / -\xEEt / -\xFBt, -ssions, -ssiez, -ssent.",
    uses: ["La concordance litt\xE9raire apr\xE8s un verbe au pass\xE9", "Un souhait ou une n\xE9cessit\xE9 dans un r\xE9cit soutenu", "Une action non accomplie vue depuis le pass\xE9"],
    examples: [
      { sentence: "Le roi voulait que chacun ob\xE9\xEEt.", context: "Le r\xE9cit est au pass\xE9 et adopte un registre litt\xE9raire.", reason: "La volont\xE9 exige le subjonctif ; l\u2019imparfait respecte la concordance soutenue avec \xAB voulait \xBB." },
      { sentence: "Il fallait qu\u2019elle part\xEEt avant l\u2019aube.", context: "Une n\xE9cessit\xE9 pass\xE9e concerne un d\xE9part encore \xE0 venir \xE0 ce moment-l\xE0.", reason: "Le subjonctif imparfait situe cette action d\xE9pendante depuis le point de vue pass\xE9." },
      { sentence: "Je craignais qu\u2019il ne f\xFBt trop tard.", context: "Une crainte est rapport\xE9e dans un r\xE9cit au pass\xE9.", reason: "La crainte appelle le subjonctif et le registre litt\xE9raire choisit l\u2019imparfait." }
    ]
  },
  "subjonctif:plus-que-parfait": {
    summary: "Le subjonctif plus-que-parfait, aujourd\u2019hui litt\xE9raire, exprime une action accomplie avant un rep\xE8re pass\xE9 tout en conservant une valeur subjective.",
    formation: "On emploie avoir ou \xEAtre au subjonctif imparfait, suivi du participe pass\xE9.",
    uses: ["Une action ant\xE9rieure d\xE9pendant d\u2019un sentiment pass\xE9", "Un doute ou un regret dans un r\xE9cit soutenu", "La concordance litt\xE9raire des temps"],
    examples: [
      { sentence: "Elle regrettait qu\u2019il f\xFBt parti sans pr\xE9venir.", context: "Le d\xE9part pr\xE9c\xE8de le regret, tous deux situ\xE9s dans le pass\xE9.", reason: "Le subjonctif traduit le regret et le plus-que-parfait marque l\u2019ant\xE9riorit\xE9." },
      { sentence: "Je doutais qu\u2019ils eussent compris.", context: "Le doute pass\xE9 porte sur une compr\xE9hension encore ant\xE9rieure.", reason: "La forme compos\xE9e ordonne les deux moments dans un registre litt\xE9raire." },
      { sentence: "Il \xE9tait heureux que nous eussions accept\xE9.", context: "L\u2019acceptation \xE9tait d\xE9j\xE0 acquise lorsqu\u2019il a ressenti cette joie.", reason: "L\u2019\xE9motion impose le subjonctif ; l\u2019ant\xE9riorit\xE9 appelle le plus-que-parfait." }
    ]
  },
  "conditionnel:present": {
    summary: "Le conditionnel pr\xE9sent pr\xE9sente une action possible, d\xE9pendante d\u2019une condition, ou att\xE9nue une demande et une affirmation.",
    formation: "On emploie le radical du futur avec les terminaisons de l\u2019imparfait : -ais, -ais, -ait, -ions, -iez, -aient.",
    uses: ["La cons\xE9quence d\u2019une condition", "Une demande polie", "Une information non confirm\xE9e"],
    examples: [
      { sentence: "Je viendrais si je pouvais me lib\xE9rer.", context: "La venue d\xE9pend d\u2019une condition qui n\u2019est pas remplie.", reason: "Le conditionnel pr\xE9sente la cons\xE9quence comme seulement possible." },
      { sentence: "Pourriez-vous fermer la porte ?", context: "La personne formule une demande sans donner un ordre direct.", reason: "Le conditionnel att\xE9nue la demande et la rend plus polie." },
      { sentence: "Le mus\xE9e rouvrirait lundi, selon la presse.", context: "La source est cit\xE9e, mais l\u2019information n\u2019est pas confirm\xE9e.", reason: "Le conditionnel marque la distance du locuteur envers l\u2019annonce." }
    ]
  },
  "conditionnel:passe-premiere-forme": {
    summary: "Le conditionnel pass\xE9 premi\xE8re forme exprime une action qui aurait pu se produire dans le pass\xE9, un regret ou une information pass\xE9e non confirm\xE9e.",
    formation: "On conjugue avoir ou \xEAtre au conditionnel pr\xE9sent, puis on ajoute le participe pass\xE9.",
    uses: ["La cons\xE9quence irr\xE9elle d\u2019une condition pass\xE9e", "Un regret ou un reproche", "Une information pass\xE9e non confirm\xE9e"],
    examples: [
      { sentence: "Nous serions venus si nous avions re\xE7u l\u2019invitation.", context: "L\u2019invitation n\u2019a pas \xE9t\xE9 re\xE7ue et la venue n\u2019a donc pas eu lieu.", reason: "Le conditionnel pass\xE9 exprime la cons\xE9quence irr\xE9alis\xE9e dans le pass\xE9." },
      { sentence: "Tu aurais pu me pr\xE9venir.", context: "Le locuteur reproche une action qui n\u2019a pas \xE9t\xE9 accomplie.", reason: "Cette forme porte un jugement r\xE9trospectif sur une possibilit\xE9 pass\xE9e." },
      { sentence: "Le tableau aurait \xE9t\xE9 vendu hier.", context: "L\u2019information circule, mais elle reste \xE0 v\xE9rifier.", reason: "Le conditionnel pass\xE9 signale la r\xE9serve \xE0 propos d\u2019un \xE9v\xE9nement suppos\xE9 accompli." }
    ]
  },
  "conditionnel:passe-deuxieme-forme": {
    summary: "Le conditionnel pass\xE9 deuxi\xE8me forme a le m\xEAme sens que la premi\xE8re, mais appartient surtout \xE0 la langue litt\xE9raire ou tr\xE8s soutenue.",
    formation: "Sa forme est identique au subjonctif plus-que-parfait : auxiliaire au subjonctif imparfait et participe pass\xE9.",
    uses: ["Une cons\xE9quence pass\xE9e irr\xE9elle en style litt\xE9raire", "Un regret dans un r\xE9cit soutenu", "Une variante stylistique du conditionnel pass\xE9"],
    examples: [
      { sentence: "Il e\xFBt accept\xE9 si on le lui avait demand\xE9.", context: "La demande n\u2019a pas eu lieu ; l\u2019acceptation reste imaginaire.", reason: "La deuxi\xE8me forme exprime l\u2019irr\xE9el du pass\xE9 avec une tonalit\xE9 litt\xE9raire." },
      { sentence: "Nous fussions partis plus t\xF4t sans cet orage.", context: "L\u2019orage a emp\xEAch\xE9 un d\xE9part envisag\xE9.", reason: "Le contexte irr\xE9el appelle le conditionnel pass\xE9 ; cette forme marque un registre soutenu." },
      { sentence: "Elle e\xFBt aim\xE9 revoir cette ville.", context: "Le souhait n\u2019a pas \xE9t\xE9 r\xE9alis\xE9 dans le pass\xE9.", reason: "La forme litt\xE9raire souligne ici le regret d\u2019une possibilit\xE9 perdue." }
    ]
  },
  "imperatif:present": {
    summary: "L\u2019imp\xE9ratif pr\xE9sent sert \xE0 faire agir maintenant ou plus tard : ordre, conseil, invitation, interdiction ou instruction.",
    formation: "On utilise les formes de tu, nous et vous sans \xE9crire le pronom sujet. \xC0 l\u2019affirmatif, certains pronoms se placent apr\xE8s le verbe.",
    uses: ["Un ordre ou une interdiction", "Un conseil", "Une invitation ou une consigne"],
    examples: [
      { sentence: "Ferme doucement la porte.", context: "Le locuteur demande une action directe \xE0 une personne.", reason: "L\u2019imp\xE9ratif convient \xE0 la consigne et le pr\xE9sent vise une ex\xE9cution imm\xE9diate." },
      { sentence: "Prenez le temps de relire votre r\xE9ponse.", context: "Un enseignant donne un conseil \xE0 plusieurs \xE9l\xE8ves ou vouvoie une personne.", reason: "L\u2019imp\xE9ratif peut conseiller sans exprimer un ordre autoritaire." },
      { sentence: "Allons voir cette exposition !", context: "La personne s\u2019inclut dans la proposition.", reason: "La forme en \xAB nous \xBB transforme l\u2019imp\xE9ratif en invitation collective." }
    ]
  },
  "imperatif:passe": {
    summary: "L\u2019imp\xE9ratif pass\xE9 ordonne qu\u2019une action soit termin\xE9e avant une \xE9ch\xE9ance future.",
    formation: "On emploie avoir ou \xEAtre \xE0 l\u2019imp\xE9ratif pr\xE9sent, suivi du participe pass\xE9.",
    uses: ["Une t\xE2che \xE0 achever avant un moment donn\xE9", "Une consigne portant sur un r\xE9sultat", "Une injonction d\u2019ant\xE9riorit\xE9"],
    examples: [
      { sentence: "Ayez termin\xE9 ce rapport avant midi.", context: "\xC0 midi, le r\xE9sultat devra d\xE9j\xE0 \xEAtre obtenu.", reason: "L\u2019imp\xE9ratif donne la consigne ; sa forme pass\xE9e insiste sur l\u2019ach\xE8vement avant l\u2019\xE9ch\xE9ance." },
      { sentence: "Sois revenu avant la nuit.", context: "Le retour doit \xEAtre accompli lorsque la nuit commencera.", reason: "Le pass\xE9 de l\u2019imp\xE9ratif place l\u2019action avant ce rep\xE8re futur." },
      { sentence: "Ayons rang\xE9 la salle avant l\u2019arriv\xE9e des invit\xE9s.", context: "Le locuteur s\u2019inclut dans une t\xE2che collective \xE0 finir.", reason: "La forme compos\xE9e fixe le r\xE9sultat attendu avant l\u2019arriv\xE9e." }
    ]
  },
  "participe:present": {
    summary: "Le participe pr\xE9sent pr\xE9sente une action li\xE9e \xE0 un nom ou simultan\xE9e \xE0 une autre, sans porter lui-m\xEAme de personne ni de temps pleinement autonome.",
    formation: "On part g\xE9n\xE9ralement de la forme \xAB nous \xBB au pr\xE9sent, on retire -ons et on ajoute -ant. Le participe pr\xE9sent est invariable.",
    uses: ["Caract\xE9riser un nom par une action", "Exprimer deux actions simultan\xE9es", "All\xE9ger une proposition relative"],
    examples: [
      { sentence: "Les \xE9l\xE8ves connaissant la r\xE9ponse l\xE8vent la main.", context: "Le groupe est d\xE9fini par l\u2019action de conna\xEEtre.", reason: "Le participe pr\xE9sent remplace ici \xAB qui connaissent \xBB et reste invariable." },
      { sentence: "Voyant la pluie, nous sommes rentr\xE9s.", context: "La perception de la pluie accompagne et motive le retour.", reason: "La forme non personnelle relie les deux actions sans nouvelle proposition compl\xE8te." },
      { sentence: "Une eau bouillant \xE0 gros bouillons remplit la casserole.", context: "L\u2019action caract\xE9rise directement le nom \xAB eau \xBB.", reason: "Le participe pr\xE9sent conserve une valeur verbale et ne s\u2019accorde pas comme un adjectif." }
    ]
  },
  "participe:passe": {
    summary: "Le participe pass\xE9 sert \xE0 former les temps compos\xE9s et peut aussi caract\xE9riser un nom ; son accord d\xE9pend alors de sa construction.",
    formation: "Sa terminaison varie selon le verbe. Employ\xE9 seul, il s\u2019accorde comme un adjectif ; avec un auxiliaire, des r\xE8gles particuli\xE8res s\u2019appliquent.",
    uses: ["Former un temps compos\xE9", "Caract\xE9riser le r\xE9sultat d\u2019une action", "Construire la voix passive"],
    examples: [
      { sentence: "Nous avons termin\xE9 le projet.", context: "\xAB Termin\xE9 \xBB compl\xE8te l\u2019auxiliaire avoir.", reason: "Le participe pass\xE9 permet ici de construire le pass\xE9 compos\xE9." },
      { sentence: "Les fen\xEAtres ouvertes laissent entrer l\u2019air.", context: "\xAB Ouvertes \xBB d\xE9crit l\u2019\xE9tat des fen\xEAtres.", reason: "Employ\xE9 comme adjectif, le participe s\u2019accorde avec le nom f\xE9minin pluriel." },
      { sentence: "La route est bloqu\xE9e par la neige.", context: "La phrase met l\u2019accent sur la route qui subit l\u2019action.", reason: "\xCAtre et le participe pass\xE9 construisent la voix passive ; \xAB bloqu\xE9e \xBB s\u2019accorde avec \xAB route \xBB." }
    ]
  },
  "participe:gerondif-present": {
    summary: "Le g\xE9rondif pr\xE9sent relie deux actions ayant le m\xEAme sujet et exprime souvent la simultan\xE9it\xE9, la mani\xE8re, la cause ou la condition.",
    formation: "On place \xAB en \xBB devant le participe pr\xE9sent : en parlant, en finissant, en prenant.",
    uses: ["Deux actions simultan\xE9es", "La mani\xE8re ou le moyen", "Une condition"],
    examples: [
      { sentence: "Elle \xE9coute de la musique en travaillant.", context: "La m\xEAme personne \xE9coute et travaille au m\xEAme moment.", reason: "Le g\xE9rondif marque la simultan\xE9it\xE9 avec un sujet commun." },
      { sentence: "Tu progresseras en pratiquant r\xE9guli\xE8rement.", context: "La pratique est le moyen d\u2019obtenir le progr\xE8s.", reason: "Le g\xE9rondif r\xE9pond ici \xE0 la question \xAB comment ? \xBB." },
      { sentence: "En partant maintenant, nous arriverons \xE0 l\u2019heure.", context: "Le d\xE9part imm\xE9diat constitue la condition de l\u2019arriv\xE9e ponctuelle.", reason: "Le g\xE9rondif exprime une condition sans employer une proposition avec \xAB si \xBB." }
    ]
  },
  "participe:gerondif-passe": {
    summary: "Le g\xE9rondif pass\xE9 exprime une action d\xE9j\xE0 accomplie avant l\u2019action du verbe principal, avec le m\xEAme sujet.",
    formation: "On emploie \xAB en \xBB suivi de avoir ou \xEAtre au participe pr\xE9sent, puis du participe pass\xE9 : en ayant fini, en \xE9tant parti.",
    uses: ["Une action accomplie avant l\u2019action principale", "La cause issue d\u2019un fait ant\xE9rieur", "Une mani\xE8re ant\xE9rieure d\u2019obtenir un r\xE9sultat"],
    examples: [
      { sentence: "En ayant termin\xE9 t\xF4t, elle a pu nous rejoindre.", context: "Elle termine d\u2019abord, puis elle peut rejoindre le groupe.", reason: "Le g\xE9rondif pass\xE9 marque l\u2019ant\xE9riorit\xE9 et explique la possibilit\xE9 qui suit." },
      { sentence: "En \xE9tant partis avant l\u2019aube, nous avons \xE9vit\xE9 la circulation.", context: "Le d\xE9part pr\xE9c\xE8de le trajet sans embouteillages.", reason: "La forme pass\xE9e pr\xE9sente ce choix ant\xE9rieur comme la cause du r\xE9sultat." },
      { sentence: "Il a rassur\xE9 l\u2019\xE9quipe en ayant v\xE9rifi\xE9 chaque d\xE9tail.", context: "La v\xE9rification est achev\xE9e avant l\u2019effet rassurant.", reason: "Le g\xE9rondif pass\xE9 relie l\u2019action pr\xE9alable au r\xE9sultat, avec le m\xEAme sujet \xAB il \xBB." }
    ]
  }
};
function modeTensePedagogy(mode, tenseSlug) {
  return pedagogy[`${mode}:${tenseSlug}`];
}

const imperfectEndings = [
  { label: "Tous les groupes", endings: "-ais \xB7 -ais \xB7 -ait \xB7 -ions \xB7 -iez \xB7 -aient", example: "je parlais \xB7 nous finissions \xB7 ils prenaient", note: "Les terminaisons sont identiques ; c\u2019est le radical, tir\xE9 de \xAB nous \xBB au pr\xE9sent, qui change." }
];
const futureEndings = [
  { label: "Tous les groupes", endings: "-ai \xB7 -as \xB7 -a \xB7 -ons \xB7 -ez \xB7 -ont", example: "je parlerai \xB7 nous finirons \xB7 ils prendront", note: "Les terminaisons sont communes. Les verbes en -re perdent leur e final et certains verbes ont un radical irr\xE9gulier." }
];
const compoundGroups = (auxiliaryTense, avoir, etre) => [
  { label: `Auxiliaire avoir \u2014 ${auxiliaryTense}`, endings: avoir, example: "j\u2019ai parl\xE9 \xB7 nous avons fini" },
  { label: `Auxiliaire \xEAtre \u2014 ${auxiliaryTense}`, endings: etre, example: "elle est partie \xB7 ils sont venus", note: "Avec \xEAtre, le participe pass\xE9 s\u2019accorde g\xE9n\xE9ralement avec le sujet." },
  { label: "Participe pass\xE9 du verbe", endings: "1er groupe : -\xE9 \xB7 2e groupe : -i \xB7 3e groupe : formes variables", example: "parl\xE9 \xB7 fini \xB7 pris / venu / fait", note: "Le groupe aide \xE0 pr\xE9voir les formes r\xE9guli\xE8res, mais le 3e groupe doit souvent \xEAtre appris par familles." }
];
const subjunctivePresentGroups = [
  { label: "1er groupe", endings: "-e \xB7 -es \xB7 -e \xB7 -ions \xB7 -iez \xB7 -ent", example: "que je parle \xB7 que nous parlions \xB7 qu\u2019ils parlent" },
  { label: "2e groupe", endings: "-isse \xB7 -isses \xB7 -isse \xB7 -issions \xB7 -issiez \xB7 -issent", example: "que je finisse \xB7 que nous finissions \xB7 qu\u2019ils finissent" },
  { label: "3e groupe", endings: "-e \xB7 -es \xB7 -e \xB7 -ions \xB7 -iez \xB7 -ent", example: "que je prenne \xB7 que nous prenions \xB7 qu\u2019ils prennent", note: "Les terminaisons sont r\xE9guli\xE8res, mais les radicaux sont souvent variables. \xCAtre, avoir, aller, faire, pouvoir, savoir et vouloir ont notamment des formes particuli\xE8res." }
];
const endings = {
  "indicatif:present": {
    intro: "Au pr\xE9sent, les terminaisons d\xE9pendent r\xE9ellement du groupe du verbe.",
    groups: [
      { label: "1er groupe \u2014 verbes en -er", endings: "-e \xB7 -es \xB7 -e \xB7 -ons \xB7 -ez \xB7 -ent", example: "je parle \xB7 tu parles \xB7 nous parlons" },
      { label: "2e groupe \u2014 verbes r\xE9guliers en -ir", endings: "-is \xB7 -is \xB7 -it \xB7 -issons \xB7 -issez \xB7 -issent", example: "je finis \xB7 nous finissons \xB7 ils finissent" },
      { label: "3e groupe", endings: "-s \xB7 -s \xB7 -t/-d \xB7 -ons \xB7 -ez \xB7 -ent", example: "je prends \xB7 il prend \xB7 vous prenez", note: "Ce sont des terminaisons fr\xE9quentes, pas une r\xE8gle unique. Partir, prendre, pouvoir ou venir ne se construisent pas exactement de la m\xEAme fa\xE7on." }
    ]
  },
  "indicatif:imparfait": { intro: "\xC0 l\u2019imparfait, les trois groupes partagent la m\xEAme s\xE9rie de terminaisons.", groups: imperfectEndings },
  "indicatif:passe-compose": { intro: "Le pass\xE9 compos\xE9 n\u2019ajoute pas une terminaison au verbe principal : il combine un auxiliaire au pr\xE9sent et un participe pass\xE9.", groups: compoundGroups("pr\xE9sent", "ai \xB7 as \xB7 a \xB7 avons \xB7 avez \xB7 ont", "suis \xB7 es \xB7 est \xB7 sommes \xB7 \xEAtes \xB7 sont") },
  "indicatif:plus-que-parfait": { intro: "Le plus-que-parfait combine un auxiliaire \xE0 l\u2019imparfait et le participe pass\xE9 du verbe.", groups: compoundGroups("imparfait", "avais \xB7 avais \xB7 avait \xB7 avions \xB7 aviez \xB7 avaient", "\xE9tais \xB7 \xE9tais \xB7 \xE9tait \xB7 \xE9tions \xB7 \xE9tiez \xB7 \xE9taient") },
  "indicatif:passe-simple": {
    intro: "Au pass\xE9 simple, le groupe permet de rep\xE9rer les grandes s\xE9ries, mais le 3e groupe comprend plusieurs familles.",
    groups: [
      { label: "1er groupe", endings: "-ai \xB7 -as \xB7 -a \xB7 -\xE2mes \xB7 -\xE2tes \xB7 -\xE8rent", example: "je parlai \xB7 nous parl\xE2mes \xB7 ils parl\xE8rent" },
      { label: "2e groupe", endings: "-is \xB7 -is \xB7 -it \xB7 -\xEEmes \xB7 -\xEEtes \xB7 -irent", example: "je finis \xB7 nous fin\xEEmes \xB7 ils finirent" },
      { label: "3e groupe \u2014 s\xE9rie en -i-", endings: "-is \xB7 -is \xB7 -it \xB7 -\xEEmes \xB7 -\xEEtes \xB7 -irent", example: "je pris \xB7 il prit \xB7 ils prirent" },
      { label: "3e groupe \u2014 s\xE9rie en -u-", endings: "-us \xB7 -us \xB7 -ut \xB7 -\xFBmes \xB7 -\xFBtes \xB7 -urent", example: "je pus \xB7 il put \xB7 ils purent" },
      { label: "Venir et tenir", endings: "-ins \xB7 -ins \xB7 -int \xB7 -\xEEnmes \xB7 -\xEEntes \xB7 -inrent", example: "je vins \xB7 il vint \xB7 ils vinrent", note: "Les formes du radical sont \xE0 apprendre par familles de verbes." }
    ]
  },
  "indicatif:passe-anterieur": { intro: "Le pass\xE9 ant\xE9rieur combine un auxiliaire au pass\xE9 simple et un participe pass\xE9.", groups: compoundGroups("pass\xE9 simple", "eus \xB7 eus \xB7 eut \xB7 e\xFBmes \xB7 e\xFBtes \xB7 eurent", "fus \xB7 fus \xB7 fut \xB7 f\xFBmes \xB7 f\xFBtes \xB7 furent") },
  "indicatif:futur-simple": { intro: "Au futur simple, les terminaisons sont communes aux trois groupes ; les diff\xE9rences concernent surtout le radical.", groups: futureEndings },
  "indicatif:futur-anterieur": { intro: "Le futur ant\xE9rieur combine un auxiliaire au futur simple et un participe pass\xE9.", groups: compoundGroups("futur simple", "aurai \xB7 auras \xB7 aura \xB7 aurons \xB7 aurez \xB7 auront", "serai \xB7 seras \xB7 sera \xB7 serons \xB7 serez \xB7 seront") },
  "indicatif:futur-proche": {
    intro: "Le futur proche se construit avec aller au pr\xE9sent. Le verbe principal reste \xE0 l\u2019infinitif : son groupe ne change donc pas la construction.",
    groups: [
      { label: "Aller au pr\xE9sent", endings: "vais \xB7 vas \xB7 va \xB7 allons \xB7 allez \xB7 vont", example: "je vais parler \xB7 nous allons finir \xB7 ils vont partir" },
      { label: "Verbe principal", endings: "infinitif inchang\xE9", example: "parler \xB7 finir \xB7 prendre" }
    ]
  },
  "subjonctif:present": { intro: "Les terminaisons du subjonctif pr\xE9sent sont largement communes, mais les radicaux r\xE9v\xE8lent certaines diff\xE9rences entre groupes.", groups: subjunctivePresentGroups },
  "subjonctif:passe": { intro: "Le subjonctif pass\xE9 combine un auxiliaire au subjonctif pr\xE9sent et un participe pass\xE9.", groups: compoundGroups("subjonctif pr\xE9sent", "aie \xB7 aies \xB7 ait \xB7 ayons \xB7 ayez \xB7 aient", "sois \xB7 sois \xB7 soit \xB7 soyons \xB7 soyez \xB7 soient") },
  "subjonctif:imparfait": {
    intro: "Le subjonctif imparfait se rattache aux familles du pass\xE9 simple.",
    groups: [
      { label: "1er groupe", endings: "-asse \xB7 -asses \xB7 -\xE2t \xB7 -assions \xB7 -assiez \xB7 -assent", example: "que je parlasse \xB7 qu\u2019il parl\xE2t \xB7 qu\u2019ils parlassent" },
      { label: "2e groupe", endings: "-isse \xB7 -isses \xB7 -\xEEt \xB7 -issions \xB7 -issiez \xB7 -issent", example: "que je finisse \xB7 qu\u2019il fin\xEEt \xB7 qu\u2019ils finissent" },
      { label: "3e groupe \u2014 s\xE9rie en -i-", endings: "-isse \xB7 -isses \xB7 -\xEEt \xB7 -issions \xB7 -issiez \xB7 -issent", example: "que je prisse \xB7 qu\u2019il pr\xEEt \xB7 qu\u2019ils prissent" },
      { label: "3e groupe \u2014 s\xE9rie en -u-", endings: "-usse \xB7 -usses \xB7 -\xFBt \xB7 -ussions \xB7 -ussiez \xB7 -ussent", example: "que je pusse \xB7 qu\u2019il p\xFBt \xB7 qu\u2019ils pussent" },
      { label: "Venir et tenir", endings: "-insse \xB7 -insses \xB7 -\xEEnt \xB7 -inssions \xB7 -inssiez \xB7 -inssent", example: "que je vinsse \xB7 qu\u2019il v\xEEnt \xB7 qu\u2019ils vinssent", note: "La voyelle d\xE9pend de la forme du pass\xE9 simple du verbe." }
    ]
  },
  "subjonctif:plus-que-parfait": { intro: "Cette forme litt\xE9raire combine un auxiliaire au subjonctif imparfait et un participe pass\xE9.", groups: compoundGroups("subjonctif imparfait", "eusse \xB7 eusses \xB7 e\xFBt \xB7 eussions \xB7 eussiez \xB7 eussent", "fusse \xB7 fusses \xB7 f\xFBt \xB7 fussions \xB7 fussiez \xB7 fussent") },
  "conditionnel:present": { intro: "Les trois groupes prennent les terminaisons de l\u2019imparfait sur le radical du futur.", groups: imperfectEndings.map((group) => ({ ...group, example: "je parlerais \xB7 nous finirions \xB7 ils viendraient", note: "Le radical suit les m\xEAmes r\xE8gles et les m\xEAmes irr\xE9gularit\xE9s qu\u2019au futur simple." })) },
  "conditionnel:passe-premiere-forme": { intro: "La premi\xE8re forme combine un auxiliaire au conditionnel pr\xE9sent et un participe pass\xE9.", groups: compoundGroups("conditionnel pr\xE9sent", "aurais \xB7 aurais \xB7 aurait \xB7 aurions \xB7 auriez \xB7 auraient", "serais \xB7 serais \xB7 serait \xB7 serions \xB7 seriez \xB7 seraient") },
  "conditionnel:passe-deuxieme-forme": { intro: "La deuxi\xE8me forme combine un auxiliaire au subjonctif imparfait et un participe pass\xE9.", groups: compoundGroups("subjonctif imparfait", "eusse \xB7 eusses \xB7 e\xFBt \xB7 eussions \xB7 eussiez \xB7 eussent", "fusse \xB7 fusses \xB7 f\xFBt \xB7 fussions \xB7 fussiez \xB7 fussent") },
  "imperatif:present": {
    intro: "L\u2019imp\xE9ratif n\u2019existe qu\u2019\xE0 trois personnes : tu, nous et vous. Le pronom sujet n\u2019est pas exprim\xE9.",
    groups: [
      { label: "1er groupe", endings: "-e \xB7 -ons \xB7 -ez", example: "parle \xB7 parlons \xB7 parlez", note: "\xC0 la forme affirmative devant \xAB en \xBB ou \xAB y \xBB, le -s r\xE9appara\xEEt : \xAB vas-y \xBB, \xAB parles-en \xBB." },
      { label: "2e groupe", endings: "-is \xB7 -issons \xB7 -issez", example: "finis \xB7 finissons \xB7 finissez" },
      { label: "3e groupe", endings: "-s/-x \xB7 -ons \xB7 -ez", example: "prends \xB7 prenons \xB7 prenez", note: "Les radicaux et certaines terminaisons varient. \xCAtre, avoir, savoir et vouloir ont des formes particuli\xE8res." }
    ]
  },
  "imperatif:passe": { intro: "L\u2019imp\xE9ratif pass\xE9 combine l\u2019auxiliaire \xE0 l\u2019imp\xE9ratif pr\xE9sent et un participe pass\xE9 ; seules les personnes tu, nous et vous existent.", groups: [
    { label: "Auxiliaire avoir", endings: "aie \xB7 ayons \xB7 ayez", example: "aie termin\xE9 \xB7 ayons termin\xE9 \xB7 ayez termin\xE9" },
    { label: "Auxiliaire \xEAtre", endings: "sois \xB7 soyons \xB7 soyez", example: "sois revenu \xB7 soyons partis \xB7 soyez arriv\xE9s", note: "Le participe pass\xE9 s\u2019accorde avec le sujet sous-entendu." }
  ] },
  "participe:present": {
    intro: "Le participe pr\xE9sent a une seule terminaison. Le groupe aide surtout \xE0 retrouver le radical.",
    groups: [
      { label: "Tous les groupes", endings: "-ant sur le radical de \xAB nous \xBB au pr\xE9sent", example: "parlant \xB7 finissant \xB7 prenant" },
      { label: "Exceptions", endings: "ayant \xB7 \xE9tant \xB7 sachant", example: "avoir \u2192 ayant \xB7 \xEAtre \u2192 \xE9tant \xB7 savoir \u2192 sachant" }
    ]
  },
  "participe:passe": {
    intro: "C\u2019est ici que la relation avec le groupe est la plus utile pour les verbes r\xE9guliers.",
    groups: [
      { label: "1er groupe", endings: "-\xE9", example: "parler \u2192 parl\xE9 \xB7 aimer \u2192 aim\xE9" },
      { label: "2e groupe", endings: "-i", example: "finir \u2192 fini \xB7 choisir \u2192 choisi" },
      { label: "3e groupe", endings: "-i, -u, -is, -it\u2026", example: "parti \xB7 venu \xB7 pris \xB7 \xE9crit", note: "Il n\u2019existe pas de terminaison unique : les formes s\u2019apprennent par familles." }
    ]
  },
  "participe:gerondif-present": {
    intro: "Le g\xE9rondif pr\xE9sent ajoute \xAB en \xBB devant le participe pr\xE9sent ; sa terminaison ne varie pas selon la personne.",
    groups: [
      { label: "Tous les groupes", endings: "en + radical de \xAB nous \xBB + -ant", example: "en parlant \xB7 en finissant \xB7 en prenant" },
      { label: "Exceptions", endings: "en ayant \xB7 en \xE9tant \xB7 en sachant", example: "en ayant du temps \xB7 en \xE9tant pr\xEAt \xB7 en sachant cela" }
    ]
  },
  "participe:gerondif-passe": {
    intro: "Le g\xE9rondif pass\xE9 combine \xAB en \xBB, un auxiliaire au participe pr\xE9sent et le participe pass\xE9 du verbe.",
    groups: [
      { label: "Avec avoir", endings: "en ayant + participe pass\xE9", example: "en ayant parl\xE9 \xB7 en ayant fini \xB7 en ayant compris" },
      { label: "Avec \xEAtre", endings: "en \xE9tant + participe pass\xE9", example: "en \xE9tant parti \xB7 en \xE9tant arriv\xE9e", note: "Avec \xEAtre, le participe pass\xE9 s\u2019accorde avec le sujet." }
    ]
  }
};
function modeTenseEndings(mode, tenseSlug) {
  return endings[`${mode}:${tenseSlug}`];
}

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[temps]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { interfaceLocale, localePath } = useLanguagePreferences();
    const modeSlug = String(route.params.mode || "");
    const tenseSlug = String(route.params.temps || "");
    if (!isModeLandingSlug(modeSlug)) {
      throw createError({ statusCode: 404, statusMessage: "Mode introuvable" });
    }
    const tense = modeTensePage(modeSlug, tenseSlug);
    const pedagogy = modeTensePedagogy(modeSlug, tenseSlug);
    const endingsGuide = modeTenseEndings(modeSlug, tenseSlug);
    if (!tense || !pedagogy || !endingsGuide) {
      throw createError({ statusCode: 404, statusMessage: "Temps introuvable" });
    }
    const mode = computed(() => modeLandingPage(modeSlug, interfaceLocale.value));
    const endingPronouns = computed(() => {
      if (modeSlug === "participe") return [];
      if (modeSlug === "imperatif") return ["(tu)", "(nous)", "(vous)"];
      if (modeSlug === "subjonctif") return ["que je / j’", "que tu", "qu’il / elle / on", "que nous", "que vous", "qu’ils / elles"];
      return ["je / j’", "tu", "il / elle / on", "nous", "vous", "ils / elles"];
    });
    function endingForms(endings) {
      return endings.split("·").map((ending) => ending.trim());
    }
    const endingTableGroups = computed(() => endingsGuide.groups.filter((group) => endingForms(group.endings).length === endingPronouns.value.length));
    const endingReferenceGroups = computed(() => endingsGuide.groups.filter((group) => !endingTableGroups.value.includes(group)));
    const modeNavigation = computed(() => MODE_LANDING_SLUGS.map((slug) => ({
      key: slug,
      label: modeLandingPage(slug, interfaceLocale.value).modeName,
      to: localePath(`/modes/${slug}`)
    })));
    const tenseNavigation = computed(() => modeTensePages(modeSlug).map((item) => ({
      key: item.slug,
      label: item.label,
      to: localePath(item.path)
    })));
    const copy = computed(() => ({
      fr: { modes: "Les modes", modeContext: `À quoi sert ${mode.value.modeName === "indicatif" ? "l’indicatif" : `le ${mode.value.modeName}`} ?`, choose: `Les temps ${mode.value.modeName === "indicatif" ? "de l’indicatif" : `du ${mode.value.modeName}`}`, title: `${tense.label} — ${mode.value.modeName}`, description: `${tense.label} du mode ${mode.value.modeName} : rôle, formation, terminaisons et exemples contextualisés.`, role: "Le rôle de ce temps", formation: "Comment le former ?", endings: "Les terminaisons", uses: "Quand le choisir ?", examples: "Phrases exemples : pourquoi employer ce temps ?", examplesIntro: `Chaque phrase met en évidence un usage du ${tense.label}. Le contexte fournit les indices et la justification explique précisément pourquoi ce temps convient.`, example: "Phrase exemple", context: "Situation et indices", reason: "Justification de l’usage du temps", back: `Revenir au ${mode.value.modeName}`, practise: `Créer un exercice au ${tense.label}` },
      de: { modes: "Die Modi", modeContext: `Wozu dient ${mode.value.modeName}?`, choose: `Zeiten: ${mode.value.modeName}`, title: `${tense.label} — ${mode.value.modeName}`, description: `Verstehe die Wahl von ${tense.label} im Modus ${mode.value.modeName} anhand konkreter Situationen.`, role: "Die Rolle dieser Zeit", formation: "Wie wird sie gebildet?", endings: "Endungen", uses: "Wann verwendet man sie?", examples: "Beispiele: Warum diese Zeit verwenden?", examplesIntro: "Jeder Satz zeigt eine Verwendung dieser Zeit. Der Kontext liefert die Hinweise und die Begründung erklärt die Wahl.", example: "Beispielsatz", context: "Situation und Hinweise", reason: "Begründung der Zeitwahl", back: `Zurück zu ${mode.value.modeName}`, practise: `Übung: ${tense.label}` },
      en: { modes: "French moods", modeContext: `What is the ${mode.value.modeName} used for?`, choose: `${mode.value.modeName} tenses`, title: `${tense.label} — ${mode.value.modeName}`, description: `Understand why ${tense.label} is chosen within the ${mode.value.modeName} through concrete situations.`, role: "The role of this tense", formation: "How is it formed?", endings: "Endings", uses: "When should it be used?", examples: "Example sentences: why use this tense?", examplesIntro: "Each sentence illustrates one use of the tense. The context provides the clues and the explanation justifies the choice.", example: "Example sentence", context: "Situation and clues", reason: "Why this tense is used", back: `Back to ${mode.value.modeName}`, practise: `Practise ${tense.label}` },
      it: { modes: "I modi", modeContext: `A cosa serve ${mode.value.modeName}?`, choose: `I tempi: ${mode.value.modeName}`, title: `${tense.label} — ${mode.value.modeName}`, description: `Comprendi perché si sceglie ${tense.label} nel modo ${mode.value.modeName} attraverso situazioni concrete.`, role: "Il ruolo di questo tempo", formation: "Come si forma?", endings: "Desinenze", uses: "Quando sceglierlo?", examples: "Frasi di esempio: perché usare questo tempo?", examplesIntro: "Ogni frase mostra un uso del tempo. Il contesto fornisce gli indizi e la spiegazione giustifica la scelta.", example: "Frase di esempio", context: "Situazione e indizi", reason: "Giustificazione dell’uso del tempo", back: `Torna a ${mode.value.modeName}`, practise: `Esercitati: ${tense.label}` },
      es: { modes: "Los modos", modeContext: `¿Para qué sirve ${mode.value.modeName}?`, choose: `Los tiempos: ${mode.value.modeName}`, title: `${tense.label} — ${mode.value.modeName}`, description: `Comprende por qué se elige ${tense.label} en el modo ${mode.value.modeName} mediante situaciones concretas.`, role: "La función de este tiempo", formation: "¿Cómo se forma?", endings: "Terminaciones", uses: "¿Cuándo elegirlo?", examples: "Frases de ejemplo: ¿por qué usar este tiempo?", examplesIntro: "Cada frase muestra un uso del tiempo. El contexto aporta las pistas y la explicación justifica la elección.", example: "Frase de ejemplo", context: "Situación y pistas", reason: "Justificación del uso del tiempo", back: `Volver a ${mode.value.modeName}`, practise: `Practicar ${tense.label}` }
    })[interfaceLocale.value]);
    const exerciseUrl = computed(() => ({
      path: localePath("/"),
      query: { mode: modeSlug, temps: tense.label }
    }));
    useHead(() => ({
      title: `${copy.value.title} : emplois, exemples et exercices`,
      meta: [
        { name: "description", content: copy.value.description },
        { property: "og:title", content: copy.value.title },
        { property: "og:description", content: copy.value.description },
        { property: "og:type", content: "website" }
      ],
      script: [{
        key: "mode-tense-learning-resource",
        type: "application/ld+json",
        textContent: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: copy.value.title,
          description: copy.value.description,
          learningResourceType: "Lesson",
          educationalUse: ["Instruction", "Practice"],
          inLanguage: "fr",
          teaches: `Conjugaison française : ${tense.label} — ${mode.value.modeName}`,
          isAccessibleForFree: true
        })
      }]
    }));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LearningSubnav = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "tense-page" }, _attrs))} data-v-9fd3f2f4>`);
      _push(ssrRenderComponent(_component_LearningSubnav, {
        label: unref(copy).modes,
        items: unref(modeNavigation),
        "active-key": unref(modeSlug)
      }, null, _parent));
      _push(`<section class="tense-page__mode-context" data-v-9fd3f2f4><p data-v-9fd3f2f4>01 · ${ssrInterpolate(unref(mode).eyebrow)}</p><div data-v-9fd3f2f4><h2 data-v-9fd3f2f4>${ssrInterpolate(unref(copy).modeContext)}</h2><p data-v-9fd3f2f4>${ssrInterpolate(unref(mode).purpose)}</p>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(localePath)(`/modes/${unref(modeSlug)}`)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(copy).back)} <span aria-hidden="true" data-v-9fd3f2f4${_scopeId}>→</span>`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(copy).back) + " ", 1),
              createVNode("span", { "aria-hidden": "true" }, "→")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></section><section class="tense-page__choice"${ssrRenderAttr("aria-labelledby", `${unref(modeSlug)}-tense-choice`)} data-v-9fd3f2f4><div data-v-9fd3f2f4><p data-v-9fd3f2f4>02</p><div data-v-9fd3f2f4><h2${ssrRenderAttr("id", `${unref(modeSlug)}-tense-choice`)} data-v-9fd3f2f4>${ssrInterpolate(unref(copy).choose)}</h2><span data-v-9fd3f2f4>Le temps actif est mis en évidence. Choisis-en un autre pour comparer son rôle dans ce même mode.</span></div></div>`);
      _push(ssrRenderComponent(_component_LearningSubnav, {
        label: unref(mode).modeName,
        items: unref(tenseNavigation),
        "active-key": unref(tenseSlug)
      }, null, _parent));
      _push(`</section><header class="tense-page__hero" data-v-9fd3f2f4><p data-v-9fd3f2f4>${ssrInterpolate(unref(mode).modeName)} · ${ssrInterpolate(unref(tense).label)}</p><h1 data-v-9fd3f2f4>${ssrInterpolate(unref(copy).title)}</h1></header><div class="tense-page__content" data-v-9fd3f2f4><section class="tense-page__summary" data-v-9fd3f2f4><p data-v-9fd3f2f4>03</p><div data-v-9fd3f2f4><h2 data-v-9fd3f2f4>${ssrInterpolate(unref(copy).role)}</h2><p data-v-9fd3f2f4>${ssrInterpolate(unref(pedagogy).summary)}</p></div></section><section class="tense-page__panel" data-v-9fd3f2f4><h2 data-v-9fd3f2f4>${ssrInterpolate(unref(copy).formation)}</h2><p data-v-9fd3f2f4>${ssrInterpolate(unref(pedagogy).formation)}</p></section><section class="tense-page__panel tense-page__panel--uses" data-v-9fd3f2f4><h2 data-v-9fd3f2f4>${ssrInterpolate(unref(copy).uses)}</h2><ul data-v-9fd3f2f4><!--[-->`);
      ssrRenderList(unref(pedagogy).uses, (use) => {
        _push(`<li data-v-9fd3f2f4>${ssrInterpolate(use)}</li>`);
      });
      _push(`<!--]--></ul></section><section class="tense-page__endings" data-v-9fd3f2f4><header data-v-9fd3f2f4><h2 data-v-9fd3f2f4>${ssrInterpolate(unref(copy).endings)}</h2><p data-v-9fd3f2f4>${ssrInterpolate(unref(endingsGuide).intro)}</p></header>`);
      if (unref(endingPronouns).length && unref(endingTableGroups).length) {
        _push(`<div class="tense-page__table-wrap" data-v-9fd3f2f4><table data-v-9fd3f2f4><thead data-v-9fd3f2f4><tr data-v-9fd3f2f4><th scope="col" data-v-9fd3f2f4>Pronom</th><!--[-->`);
        ssrRenderList(unref(endingTableGroups), (group) => {
          _push(`<th scope="col" data-v-9fd3f2f4>${ssrInterpolate(group.label)}</th>`);
        });
        _push(`<!--]--></tr></thead><tbody data-v-9fd3f2f4><!--[-->`);
        ssrRenderList(unref(endingPronouns), (pronoun, index) => {
          _push(`<tr data-v-9fd3f2f4><th scope="row" data-v-9fd3f2f4>${ssrInterpolate(pronoun)}</th><!--[-->`);
          ssrRenderList(unref(endingTableGroups), (group) => {
            _push(`<td data-v-9fd3f2f4><strong data-v-9fd3f2f4>${ssrInterpolate(endingForms(group.endings)[index])}</strong></td>`);
          });
          _push(`<!--]--></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(endingReferenceGroups).length) {
        _push(`<div class="tense-page__table-wrap tense-page__table-wrap--reference" data-v-9fd3f2f4><table data-v-9fd3f2f4><thead data-v-9fd3f2f4><tr data-v-9fd3f2f4><th scope="col" data-v-9fd3f2f4>Groupe ou élément</th><th scope="col" data-v-9fd3f2f4>Terminaison ou construction</th><th scope="col" data-v-9fd3f2f4>Exemple</th></tr></thead><tbody data-v-9fd3f2f4><!--[-->`);
        ssrRenderList(unref(endingReferenceGroups), (group) => {
          _push(`<tr data-v-9fd3f2f4><th scope="row" data-v-9fd3f2f4>${ssrInterpolate(group.label)}</th><td data-v-9fd3f2f4><strong data-v-9fd3f2f4>${ssrInterpolate(group.endings)}</strong></td><td data-v-9fd3f2f4>${ssrInterpolate(group.example)}</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="tense-page__ending-notes" data-v-9fd3f2f4><!--[-->`);
      ssrRenderList(unref(endingsGuide).groups.filter((item) => item.note), (group) => {
        _push(`<p data-v-9fd3f2f4><strong data-v-9fd3f2f4>${ssrInterpolate(group.label)} :</strong> ${ssrInterpolate(group.note)}</p>`);
      });
      _push(`<!--]--></div></section><section class="tense-page__examples"${ssrRenderAttr("aria-labelledby", `${unref(modeSlug)}-${unref(tenseSlug)}-examples`)} data-v-9fd3f2f4><header data-v-9fd3f2f4><p data-v-9fd3f2f4>04</p><div data-v-9fd3f2f4><h2${ssrRenderAttr("id", `${unref(modeSlug)}-${unref(tenseSlug)}-examples`)} data-v-9fd3f2f4>${ssrInterpolate(unref(copy).examples)}</h2><p data-v-9fd3f2f4>${ssrInterpolate(unref(copy).examplesIntro)}</p></div></header><div data-v-9fd3f2f4><!--[-->`);
      ssrRenderList(unref(pedagogy).examples, (example, index) => {
        _push(`<article data-v-9fd3f2f4><p class="tense-page__example-label" data-v-9fd3f2f4>${ssrInterpolate(unref(copy).example)} ${ssrInterpolate(String(index + 1).padStart(2, "0"))}</p><blockquote data-v-9fd3f2f4>${ssrInterpolate(example.sentence)}</blockquote><dl data-v-9fd3f2f4><div data-v-9fd3f2f4><dt data-v-9fd3f2f4>${ssrInterpolate(unref(copy).context)}</dt><dd data-v-9fd3f2f4>${ssrInterpolate(example.context)}</dd></div><div data-v-9fd3f2f4><dt data-v-9fd3f2f4>${ssrInterpolate(unref(copy).reason)}</dt><dd data-v-9fd3f2f4>${ssrInterpolate(example.reason)}</dd></div></dl></article>`);
      });
      _push(`<!--]--></div></section></div><footer class="tense-page__actions" data-v-9fd3f2f4>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(localePath)(`/modes/${unref(modeSlug)}`)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(copy).back)}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(copy).back), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "is-primary",
        to: unref(exerciseUrl)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(copy).practise)} <span aria-hidden="true" data-v-9fd3f2f4${_scopeId}>→</span>`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(copy).practise) + " ", 1),
              createVNode("span", { "aria-hidden": "true" }, "→")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</footer></main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/modes/[mode]/[temps].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _temps_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-9fd3f2f4"]]);

export { _temps_ as default };
//# sourceMappingURL=_temps_-1n1rJlXg.mjs.map
