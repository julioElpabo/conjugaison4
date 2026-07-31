import type { ModeLandingSlug } from './mode-landing-pages'

export interface TenseEndingGroup {
  label: string
  endings: string
  example: string
  note?: string
}

export interface TenseEndingsGuide {
  intro: string
  groups: TenseEndingGroup[]
}

type EndingsKey = `${ModeLandingSlug}:${string}`

const imperfectEndings: TenseEndingGroup[] = [
  { label: 'Tous les groupes', endings: '-ais · -ais · -ait · -ions · -iez · -aient', example: 'je parlais · nous finissions · ils prenaient', note: 'Les terminaisons sont identiques ; c’est le radical, tiré de « nous » au présent, qui change.' },
]

const futureEndings: TenseEndingGroup[] = [
  { label: 'Tous les groupes', endings: '-ai · -as · -a · -ons · -ez · -ont', example: 'je parlerai · nous finirons · ils prendront', note: 'Les terminaisons sont communes. Les verbes en -re perdent leur e final et certains verbes ont un radical irrégulier.' },
]

const compoundGroups = (auxiliaryTense: string, avoir: string, etre: string): TenseEndingGroup[] => [
  { label: `Auxiliaire avoir — ${auxiliaryTense}`, endings: avoir, example: 'j’ai parlé · nous avons fini' },
  { label: `Auxiliaire être — ${auxiliaryTense}`, endings: etre, example: 'elle est partie · ils sont venus', note: 'Avec être, le participe passé s’accorde généralement avec le sujet.' },
  { label: 'Participe passé du verbe', endings: '1er groupe : -é · 2e groupe : -i · 3e groupe : formes variables', example: 'parlé · fini · pris / venu / fait', note: 'Le groupe aide à prévoir les formes régulières, mais le 3e groupe doit souvent être appris par familles.' },
]

const subjunctivePresentGroups: TenseEndingGroup[] = [
  { label: '1er groupe', endings: '-e · -es · -e · -ions · -iez · -ent', example: 'que je parle · que nous parlions · qu’ils parlent' },
  { label: '2e groupe', endings: '-isse · -isses · -isse · -issions · -issiez · -issent', example: 'que je finisse · que nous finissions · qu’ils finissent' },
  { label: '3e groupe', endings: '-e · -es · -e · -ions · -iez · -ent', example: 'que je prenne · que nous prenions · qu’ils prennent', note: 'Les terminaisons sont régulières, mais les radicaux sont souvent variables. Être, avoir, aller, faire, pouvoir, savoir et vouloir ont notamment des formes particulières.' },
]

const endings: Record<EndingsKey, TenseEndingsGuide> = {
  'indicatif:present': {
    intro: 'Au présent, les terminaisons dépendent réellement du groupe du verbe.',
    groups: [
      { label: '1er groupe — verbes en -er', endings: '-e · -es · -e · -ons · -ez · -ent', example: 'je parle · tu parles · nous parlons' },
      { label: '2e groupe — verbes réguliers en -ir', endings: '-is · -is · -it · -issons · -issez · -issent', example: 'je finis · nous finissons · ils finissent' },
      { label: '3e groupe', endings: '-s · -s · -t/-d · -ons · -ez · -ent', example: 'je prends · il prend · vous prenez', note: 'Ce sont des terminaisons fréquentes, pas une règle unique. Partir, prendre, pouvoir ou venir ne se construisent pas exactement de la même façon.' },
    ],
  },
  'indicatif:imparfait': { intro: 'À l’imparfait, les trois groupes partagent la même série de terminaisons.', groups: imperfectEndings },
  'indicatif:passe-compose': { intro: 'Le passé composé n’ajoute pas une terminaison au verbe principal : il combine un auxiliaire au présent et un participe passé.', groups: compoundGroups('présent', 'ai · as · a · avons · avez · ont', 'suis · es · est · sommes · êtes · sont') },
  'indicatif:plus-que-parfait': { intro: 'Le plus-que-parfait combine un auxiliaire à l’imparfait et le participe passé du verbe.', groups: compoundGroups('imparfait', 'avais · avais · avait · avions · aviez · avaient', 'étais · étais · était · étions · étiez · étaient') },
  'indicatif:passe-simple': {
    intro: 'Au passé simple, le groupe permet de repérer les grandes séries, mais le 3e groupe comprend plusieurs familles.',
    groups: [
      { label: '1er groupe', endings: '-ai · -as · -a · -âmes · -âtes · -èrent', example: 'je parlai · nous parlâmes · ils parlèrent' },
      { label: '2e groupe', endings: '-is · -is · -it · -îmes · -îtes · -irent', example: 'je finis · nous finîmes · ils finirent' },
      { label: '3e groupe — série en -i-', endings: '-is · -is · -it · -îmes · -îtes · -irent', example: 'je pris · il prit · ils prirent' },
      { label: '3e groupe — série en -u-', endings: '-us · -us · -ut · -ûmes · -ûtes · -urent', example: 'je pus · il put · ils purent' },
      { label: 'Venir et tenir', endings: '-ins · -ins · -int · -înmes · -întes · -inrent', example: 'je vins · il vint · ils vinrent', note: 'Les formes du radical sont à apprendre par familles de verbes.' },
    ],
  },
  'indicatif:passe-anterieur': { intro: 'Le passé antérieur combine un auxiliaire au passé simple et un participe passé.', groups: compoundGroups('passé simple', 'eus · eus · eut · eûmes · eûtes · eurent', 'fus · fus · fut · fûmes · fûtes · furent') },
  'indicatif:futur-simple': { intro: 'Au futur simple, les terminaisons sont communes aux trois groupes ; les différences concernent surtout le radical.', groups: futureEndings },
  'indicatif:futur-anterieur': { intro: 'Le futur antérieur combine un auxiliaire au futur simple et un participe passé.', groups: compoundGroups('futur simple', 'aurai · auras · aura · aurons · aurez · auront', 'serai · seras · sera · serons · serez · seront') },
  'indicatif:futur-proche': {
    intro: 'Le futur proche se construit avec aller au présent. Le verbe principal reste à l’infinitif : son groupe ne change donc pas la construction.',
    groups: [
      { label: 'Aller au présent', endings: 'vais · vas · va · allons · allez · vont', example: 'je vais parler · nous allons finir · ils vont partir' },
      { label: 'Verbe principal', endings: 'infinitif inchangé', example: 'parler · finir · prendre' },
    ],
  },
  'subjonctif:present': { intro: 'Les terminaisons du subjonctif présent sont largement communes, mais les radicaux révèlent certaines différences entre groupes.', groups: subjunctivePresentGroups },
  'subjonctif:passe': { intro: 'Le subjonctif passé combine un auxiliaire au subjonctif présent et un participe passé.', groups: compoundGroups('subjonctif présent', 'aie · aies · ait · ayons · ayez · aient', 'sois · sois · soit · soyons · soyez · soient') },
  'subjonctif:imparfait': {
    intro: 'Le subjonctif imparfait se rattache aux familles du passé simple.',
    groups: [
      { label: '1er groupe', endings: '-asse · -asses · -ât · -assions · -assiez · -assent', example: 'que je parlasse · qu’il parlât · qu’ils parlassent' },
      { label: '2e groupe', endings: '-isse · -isses · -ît · -issions · -issiez · -issent', example: 'que je finisse · qu’il finît · qu’ils finissent' },
      { label: '3e groupe — série en -i-', endings: '-isse · -isses · -ît · -issions · -issiez · -issent', example: 'que je prisse · qu’il prît · qu’ils prissent' },
      { label: '3e groupe — série en -u-', endings: '-usse · -usses · -ût · -ussions · -ussiez · -ussent', example: 'que je pusse · qu’il pût · qu’ils pussent' },
      { label: 'Venir et tenir', endings: '-insse · -insses · -înt · -inssions · -inssiez · -inssent', example: 'que je vinsse · qu’il vînt · qu’ils vinssent', note: 'La voyelle dépend de la forme du passé simple du verbe.' },
    ],
  },
  'subjonctif:plus-que-parfait': { intro: 'Cette forme littéraire combine un auxiliaire au subjonctif imparfait et un participe passé.', groups: compoundGroups('subjonctif imparfait', 'eusse · eusses · eût · eussions · eussiez · eussent', 'fusse · fusses · fût · fussions · fussiez · fussent') },
  'conditionnel:present': { intro: 'Les trois groupes prennent les terminaisons de l’imparfait sur le radical du futur.', groups: imperfectEndings.map(group => ({ ...group, example: 'je parlerais · nous finirions · ils viendraient', note: 'Le radical suit les mêmes règles et les mêmes irrégularités qu’au futur simple.' })) },
  'conditionnel:passe-premiere-forme': { intro: 'La première forme combine un auxiliaire au conditionnel présent et un participe passé.', groups: compoundGroups('conditionnel présent', 'aurais · aurais · aurait · aurions · auriez · auraient', 'serais · serais · serait · serions · seriez · seraient') },
  'conditionnel:passe-deuxieme-forme': { intro: 'La deuxième forme combine un auxiliaire au subjonctif imparfait et un participe passé.', groups: compoundGroups('subjonctif imparfait', 'eusse · eusses · eût · eussions · eussiez · eussent', 'fusse · fusses · fût · fussions · fussiez · fussent') },
  'imperatif:present': {
    intro: 'L’impératif n’existe qu’à trois personnes : tu, nous et vous. Le pronom sujet n’est pas exprimé.',
    groups: [
      { label: '1er groupe', endings: '-e · -ons · -ez', example: 'parle · parlons · parlez', note: 'À la forme affirmative devant « en » ou « y », le -s réapparaît : « vas-y », « parles-en ».' },
      { label: '2e groupe', endings: '-is · -issons · -issez', example: 'finis · finissons · finissez' },
      { label: '3e groupe', endings: '-s/-x · -ons · -ez', example: 'prends · prenons · prenez', note: 'Les radicaux et certaines terminaisons varient. Être, avoir, savoir et vouloir ont des formes particulières.' },
    ],
  },
  'imperatif:passe': { intro: 'L’impératif passé combine l’auxiliaire à l’impératif présent et un participe passé ; seules les personnes tu, nous et vous existent.', groups: [
    { label: 'Auxiliaire avoir', endings: 'aie · ayons · ayez', example: 'aie terminé · ayons terminé · ayez terminé' },
    { label: 'Auxiliaire être', endings: 'sois · soyons · soyez', example: 'sois revenu · soyons partis · soyez arrivés', note: 'Le participe passé s’accorde avec le sujet sous-entendu.' },
  ] },
  'participe:present': {
    intro: 'Le participe présent a une seule terminaison. Le groupe aide surtout à retrouver le radical.',
    groups: [
      { label: 'Tous les groupes', endings: '-ant sur le radical de « nous » au présent', example: 'parlant · finissant · prenant' },
      { label: 'Exceptions', endings: 'ayant · étant · sachant', example: 'avoir → ayant · être → étant · savoir → sachant' },
    ],
  },
  'participe:passe': {
    intro: 'C’est ici que la relation avec le groupe est la plus utile pour les verbes réguliers.',
    groups: [
      { label: '1er groupe', endings: '-é', example: 'parler → parlé · aimer → aimé' },
      { label: '2e groupe', endings: '-i', example: 'finir → fini · choisir → choisi' },
      { label: '3e groupe', endings: '-i, -u, -is, -it…', example: 'parti · venu · pris · écrit', note: 'Il n’existe pas de terminaison unique : les formes s’apprennent par familles.' },
    ],
  },
  'participe:gerondif-present': {
    intro: 'Le gérondif présent ajoute « en » devant le participe présent ; sa terminaison ne varie pas selon la personne.',
    groups: [
      { label: 'Tous les groupes', endings: 'en + radical de « nous » + -ant', example: 'en parlant · en finissant · en prenant' },
      { label: 'Exceptions', endings: 'en ayant · en étant · en sachant', example: 'en ayant du temps · en étant prêt · en sachant cela' },
    ],
  },
  'participe:gerondif-passe': {
    intro: 'Le gérondif passé combine « en », un auxiliaire au participe présent et le participe passé du verbe.',
    groups: [
      { label: 'Avec avoir', endings: 'en ayant + participe passé', example: 'en ayant parlé · en ayant fini · en ayant compris' },
      { label: 'Avec être', endings: 'en étant + participe passé', example: 'en étant parti · en étant arrivée', note: 'Avec être, le participe passé s’accorde avec le sujet.' },
    ],
  },
}

export function modeTenseEndings(mode: ModeLandingSlug, tenseSlug: string): TenseEndingsGuide | undefined {
  return endings[`${mode}:${tenseSlug}`]
}
