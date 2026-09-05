/** Nederlandstalige publicaties voor België en Nederland; de Franse voorbeelden blijven behouden. */
const topics: Record<string, [string, string]> = {
  groupe1: ['werkwoorden van de eerste groep', 'Regelmatige werkwoorden op -er vormen de basis van heel wat Franse zinnen. Als je hun uitgangen kent, kun je honderden veelgebruikte werkwoorden met vertrouwen vervoegen.'],
  groupe2: ['werkwoorden van de tweede groep', 'Regelmatige werkwoorden op -ir zoals finir en choisir volgen een vast patroon. Als je dat herkent, vorm je werkwoorden zoals nous finissons en ils choisissaient correct.'],
  groupe3: ['werkwoorden van de derde groep', 'Werkwoorden van de derde groep komen heel vaak voor, maar zijn dikwijls onregelmatig. Door ze samen te oefenen, onthoud je hun stammen en uitgangen zonder ze te verwisselen.'],
  groupe3ir: ['onregelmatige werkwoorden op -ir', 'Partir, venir, dormir en sortir eindigen op -ir, maar volgen het patroon van finir niet. Door ze te vergelijken, herken je stamveranderingen en vermijd je onjuiste regelmatige vormen.'],
  groupe3oir: ['werkwoorden van de derde groep op -oir', 'Pouvoir, vouloir, devoir en recevoir zijn onmisbaar in het dagelijkse Frans. Als je hun onregelmatige vormen beheerst, kun je mogelijkheden, wensen en verplichtingen precies uitdrukken.'],
  groupe3autres: ['andere werkwoorden van de derde groep', 'Prendre, mettre, lire, écrire en conduire volgen bijzondere, veelgebruikte patronen. Door ze te oefenen, herken je werkwoordfamilies en onthoud je onregelmatige vormen makkelijker.'],
  ger: ['Franse werkwoorden op -ger', 'Eén letter kan een juiste vorm in een spelfout veranderen. Als je werkwoorden op -ger beheerst, schrijf je nous mangeons en je voyageais correct en begrijp je hun spellingveranderingen.'],
  cer: ['Franse werkwoorden op -cer', 'Commencer, avancer en remplacer hebben soms een cedille nodig om de zachte c-klank te behouden. Weten wanneer je nous commençons of je plaçais schrijft, helpt je een veelgemaakte spelfout te vermijden.'],
  'ger-cer': ['Franse werkwoorden op -ger en -cer', 'Franse werkwoorden op -ger en -cer veranderen van spelling om hun uitspraak te behouden. Door beide patronen te vergelijken, kies je snel tussen de extra e en de cedille.'],
  'sens-mouvement': ['Franse werkwoorden van beweging', 'Aller, venir, partir, arriver, entrer en sortir zijn onmisbaar om verplaatsingen, routes en plannen te beschrijven. Door ze vlot te vervoegen, spreek en schrijf je nauwkeuriger Frans.'],
  'sens-communication': ['Franse werkwoorden van communicatie', 'Dire, parler, répondre, expliquer en raconter helpen je ideeën te delen en deel te nemen aan gesprekken. Een juiste vervoeging maakt je communicatie duidelijker en natuurlijker.'],
  'sens-cognition': ['Franse werkwoorden van denken en weten', 'Penser, savoir, comprendre, apprendre en décider drukken meningen, kennis en keuzes uit. Als je ze beheerst, kun je ideeën precies en genuanceerd overbrengen.'],
  'sens-emotion': ['Franse werkwoorden van gevoelens', 'Aimer, préférer, craindre, rire en ressentir helpen je over voorkeuren en gevoelens te praten. Met de juiste vervoeging druk je nauwkeuriger uit hoe je je voelt.'],
  'sens-corps': ['Franse werkwoorden van het lichaam en behoeften', 'Manger, boire, dormir, respirer en se soigner zijn onmisbaar om over gezondheid en het dagelijkse leven te praten. Door ze correct te vervoegen, beschrijf je behoeften en gewoonten duidelijk.'],
  rares: ['zeldzame en literaire Franse werkwoorden', 'Zeldzame en literaire werkwoorden verrijken je woordenschat en verbeteren je leesbegrip. Door ze te vervoegen, begrijp je literatuur beter en ontdek je de nuances van het Frans.'],
  difficiles: ['moeilijke Franse werkwoorden', 'De moeilijkste Franse werkwoorden combineren vaak stamveranderingen met onregelmatige uitgangen. Gericht oefenen helpt je hun patronen te herkennen en terugkerende fouten weg te werken.'],
  pronominaux: ['Franse wederkerende werkwoorden', 'Se lever, s’habiller, se souvenir en se rencontrer zijn onmisbaar in het dagelijkse leven. Als je ze beheerst, plaats je het wederkerend voornaamwoord juist, kies je het juiste hulpwerkwoord en vorm je samengestelde tijden.'],
}
const fleTopics: Record<string, string> = {
  CIF1: '4 essentiële werkwoorden – CIF-niveau 1',
  CIF2: '12 nuttige werkwoorden – CIF-niveau 2',
  CIF3: '12 werkwoorden op -er – CIF-niveau 3',
  CIF4: '20 nuttige werkwoorden – CIF-niveau 4',
  '100-verbes-utiles-allophones': '100 nuttige Franse werkwoorden voor elke dag',
}

export function dutchChallengePublication(definition: { id: string, label: string }) {
  const level = definition.label
  if (/^(5P|6P|7H|8H|9H|10H|11H)$/u.test(definition.id)) {
    return { topic: `het Zwitserse leerplan ${definition.id}`, description: `Oefen de Franse werkwoorden en tijden die bij ${definition.id} in het Zwitserse leerplan horen. Deze oefening versterkt de belangrijkste vaardigheden van het schooljaar en geeft je meer vertrouwen bij het spreken en schrijven in het Frans.` }
  }
  if (definition.id.startsWith('france-')) {
    return { topic: `het Franse leerplan ${level}`, description: `Herhaal de werkwoorden, tijden en wijzen die bij ${level} in het Franse leerplan horen. Deze oefening versterkt de vervoegingsvaardigheden die je in de klas en bij schrijfopdrachten nodig hebt.` }
  }
  const fleTopic = fleTopics[definition.id]
  if (fleTopic) return { topic: fleTopic, description: `${fleTopic} vormen een stapsgewijze vervoegingsoefening voor Frans als vreemde taal (FLE). Je oefent de vormen die je nodig hebt om Frans te begrijpen, te spreken en te schrijven in dagelijkse situaties.` }
  const entry = topics[definition.id]
  if (!entry) throw new Error(`Nederlandse publicatie ontbreekt: ${definition.id}`)
  return { topic: entry[0], description: entry[1] }
}
