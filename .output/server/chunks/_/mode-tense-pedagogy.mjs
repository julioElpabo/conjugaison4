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

export { modeTensePedagogy as m };
//# sourceMappingURL=mode-tense-pedagogy.mjs.map
