/**
 * Références linguistiques initiales. Les noms, plutôt que les identifiants SQL,
 * rendent la migration reproductible sur une base réimportée.
 */
export const schoolVerbSeeds: Record<string, readonly string[]> = {
  '5P': ['être', 'avoir', 'aller', 'chanter', 'finir', 'dire', 'faire', 'joindre', 'savoir', 'vouloir'],
  '6P': ['être', 'avoir', 'aller', 'aimer', 'finir', 'dire', 'faire', 'rendre', 'savoir', 'vouloir', 'manger', 'commencer', 'mettre', 'pouvoir', 'oublier', 'prendre', 'sortir', 'courir', 'voir', 'venir'],
  '7H': ['être', 'avoir', 'aller', 'chanter', 'finir', 'dire', 'faire', 'entendre', 'savoir', 'vouloir', 'manger', 'commencer', 'mettre', 'pouvoir', 'oublier', 'prendre', 'sortir', 'voir', 'venir', 'employer', 'payer', 'acheter', 'peler'],
  '8H': ['être', 'avoir', 'aller', 'aimer', 'finir', 'dire', 'faire', 'rendre', 'savoir', 'vouloir', 'manger', 'commencer', 'mettre', 'pouvoir', 'oublier', 'prendre', 'sortir', 'courir', 'voir', 'venir', 'employer', 'payer', 'acheter', 'peler', 'appeler', 'jeter', 'craindre', 'plaire', 'fuir', 'valoir', 'falloir', 'boire', 'ouvrir', 'vivre'],
  '9H': ['être', 'avoir', 'faire', 'dire', 'pouvoir', 'aller', 'voir', 'savoir', 'vouloir', 'falloir', 'devoir', 'croire', 'prendre', 'comprendre', 'reprendre', 'apprendre', 'aimer', 'mettre', 'tenir', 'venir', 'rendre', 'entendre', 'répondre', 'perdre', 'descendre', 'connaître', 'paraître', 'sentir', 'sortir', 'partir', 'vivre', 'écrire', 'placer', 'commencer', 'avancer', 'suivre', 'mourir', 'couvrir', 'ouvrir', 'offrir', 'souffrir', 'lire', 'acheter'],
  '10H': ['servir', 'jeter', 'recevoir', 'peser', 'rire', 'finir', 'apprécier', 'courir', 'envoyer', 'manger', 'valoir', 'plaire', 'dormir', 'céder', 'cuire', 'craindre', 'payer', 'asseoir'],
  '11H': ['acquérir', 'assiéger', 'battre', 'boire', 'broyer', 'conclure', 'créer', 'croître', 'cueillir', 'fuir', 'haïr', 'modeler', 'mouvoir', 'naître', 'vaincre'],
}

export const cifVerbSeeds: Record<string, readonly string[]> = {
  CIF1: ['être', 'aller', 'faire', 'avoir'],
  CIF2: ['acheter', 'aimer', 'aller', 'avoir', 'chanter', 'dire', 'être', 'faire', 'lire', 'travailler'],
  CIF3: ['apprendre', 'tenir', 'venir'],
  CIF4: ['savoir', 'falloir', 'valoir', 'boire'],
}

export const rareVerbSeeds = ['acquérir', 'absoudre', 'assaillir', 'déchoir', 'gésir', 'ouïr', 'pourvoir', 'requérir', 'conquérir', 'cranter', 'oindre', 'ceindre', 'surseoir', 'se mouvoir'] as const

export const difficultVerbSeeds = ['craindre', 'accroître', 'haïr', 'joindre', 'moudre', 'résoudre', 'peler', 'acquérir', 'mourir', 'bouillir', 'dormir', 'vaincre', 'vêtir', 'cueillir', 'céder', 'croître', 'clore', 'nourrir', 'convaincre', 'se baigner'] as const

export const canonicalInfinitives: Record<string, string> = {
  caracteriser: 'caractériser', celebrer: 'célébrer', considerer: 'considérer', controler: 'contrôler',
  deborder: 'déborder', deboucher: 'déboucher', debuter: 'débuter', decaler: 'décaler', decoller: 'décoller',
  decouper: 'découper', decoupler: 'découpler', dedier: 'dédier', defier: 'défier', defiler: 'défiler',
  dejeuner: 'déjeuner', demarrer: 'démarrer', denicher: 'dénicher', denommer: 'dénommer',
}

export const semanticDomains = [
  ['etat-existence', 'État et existence'],
  ['mouvement', 'Mouvement et déplacement'],
  ['position', 'Position et orientation'],
  ['transformation', 'Transformation et changement'],
  ['manipulation', 'Action physique et manipulation'],
  ['corps', 'Corps, santé et besoins'],
  ['perception', 'Perception'],
  ['cognition', 'Pensée et connaissance'],
  ['communication', 'Communication et langage'],
  ['emotion', 'Émotions et appréciation'],
  ['modalite', 'Volonté, capacité et obligation'],
  ['relations', 'Relations et interactions sociales'],
  ['echange', 'Possession, échange et commerce'],
  ['creation-travail', 'Création, travail et technique'],
  ['nature', 'Nature et phénomènes'],
  ['action-processus', 'Action et processus général'],
] as const

/** Plusieurs domaines sont possibles : un verbe n'est jamais enfermé dans une seule catégorie. */
export const semanticVerbSeeds: Record<string, readonly string[]> = {
  'etat-existence': ['être', 'avoir', 'rester', 'demeurer', 'sembler', 'paraître', 'apparaître', 'devenir', 'vivre', 'exister', 'gésir', 'suffire', 'valoir'],
  mouvement: ['aller', 'venir', 'partir', 'arriver', 'entrer', 'sortir', 'rentrer', 'retourner', 'avancer', 'reculer', 'courir', 'marcher', 'nager', 'voyager', 'naviguer', 'fuir', 'tomber', 'monter', 'descendre', 'passer', 'traverser', 'sauter', 'plonger', 'se déplacer', 'se diriger', 'se mouvoir', 'tourner'],
  position: ['asseoir', "s'asseoir", 'lever', 'se lever', 'coucher', 'se coucher', 'poser', 'se poser', 'tenir', 'se tenir', 'placer', 'aligner', 'accrocher', 'attacher', 'tourner', 'se tourner'],
  transformation: ['changer', 'devenir', 'grandir', 'affaiblir', "s'affaiblir", 'améliorer', 'adapter', 'augmenter', 'baisser', 'allonger', 'mélanger', 'se mélanger', 'brûler', 'casser', 'se casser', 'démolir', 'vider', 'remplir'],
  manipulation: ['prendre', 'mettre', 'porter', 'apporter', 'couper', 'se couper', 'ouvrir', 'fermer', 'couvrir', 'se couvrir', 'tirer', 'pousser', 'jeter', 'attraper', 'saisir', 'se saisir', 'joindre', 'plier', 'coudre', 'moudre', 'broyer', 'cuire', 'coller', 'brancher'],
  corps: ['manger', 'boire', 'dormir', 'mourir', 'naître', 'souffrir', 'respirer', 'se laver', 'se doucher', 'se raser', 'se brosser', 'se nourrir', 'se reposer', 'se réveiller', 'fatiguer', 'blesser', 'se blesser', 'mordre', 'se mordre', 'avaler', 'goûter'],
  perception: ['voir', 'regarder', 'se regarder', 'observer', 'apercevoir', "s'apercevoir", 'entendre', 'ouïr', 'écouter', "s'écouter", 'sentir', 'goûter', 'examiner'],
  cognition: ['penser', 'réfléchir', 'savoir', 'croire', 'comprendre', 'apprendre', 'connaître', 'imaginer', "s'imaginer", 'oublier', 'se souvenir', 'se rappeler', 'considérer', 'décider', 'se décider', 'résoudre', 'se résoudre', 'choisir', 'comparer'],
  communication: ['dire', 'parler', 'demander', 'se demander', 'répondre', 'raconter', 'expliquer', 'écrire', 'lire', 'communiquer', 'appeler', "s'appeler", 'annoncer', 'avouer', 'citer', 'commenter', 'prononcer', 'suggérer', 'saluer', 'crier', "s'écrier"],
  emotion: ['aimer', 'adorer', 'préférer', 'apprécier', 'craindre', 'haïr', 'plaire', 'souhaiter', 'rire', 'sourire', 'rigoler', 'amuser', 'affoler', "s'affoler", 'émouvoir', "s'émouvoir", 'calmer', 'apaiser', 'agacer'],
  modalite: ['vouloir', 'pouvoir', 'devoir', 'falloir', 'souhaiter', 'oser', 'essayer', 'tenter', 'faillir', 'forcer', 'se forcer'],
  relations: ['aider', 'accompagner', 'rencontrer', 'inviter', 'collaborer', 'assister', 'affronter', 'se battre', 'saluer', 'épouser', 'se marier', 'protéger', 'se protéger', 'accuser', 'approuver', 'convaincre'],
  echange: ['avoir', 'donner', 'se donner', 'recevoir', 'acheter', 'vendre', 'payer', 'offrir', 'prêter', 'emprunter', 'commander', 'allouer', 'accorder', 'acquérir', 'posséder'],
  'creation-travail': ['faire', 'créer', 'fabriquer', 'construire', 'produire', 'travailler', 'bricoler', 'cuisiner', 'dessiner', 'peindre', 'colorier', 'écrire', 'filmer', 'photocopier', 'copier', 'cliquer', 'archiver', 'classer', 'organiser', 'réparer', 'cultiver'],
  nature: ['pleuvoir', 'briller', 'couler', 'brûler', 'geler', 'neiger', 'fleurir', 'pousser', 'bouillir', 'déborder'],
}
