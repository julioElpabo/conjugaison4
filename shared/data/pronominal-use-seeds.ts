const SOURCE_ROOT = 'https://www.dictionnaire-academie.fr/article'

type SeedKind = '' | 'p' | 'r' | 'i' | 'q'
type AcademyUse = readonly [infinitif: string, articleId: string, kind?: SeedKind]

/**
 * Emplois pronominaux attestés dans le Dictionnaire de l’Académie française.
 *
 * Le troisième champ décrit le cas qui influe sur l’exercice :
 * - p : emploi passif, limité aux troisièmes personnes ;
 * - r : emploi réciproque, limité aux personnes du pluriel ;
 * - i : pronom complément indirect, participe passé invariable ;
 * - q : emploi réciproque indirect, pluriel et participe passé invariable ;
 * - absent : emploi réfléchi ou subjectif ordinaire.
 */
const ACADEMIE_USES: AcademyUse[] = [
  ['abonner','A9A0099'], ['abreuver','B0A0134'], ['abriter','A9A0142'], ['accompagner','A9A0269'],
  ['accorder','A9A0283'], ['accumuler','A9A0339'], ['accuser','A9A0345'], ['acheminer','A9A0374'],
  ['acquérir','A9A0424','p'], ['adapter','A9A0506'], ['adresser','A9A0606'], ['affronter','A9A0786'],
  ['agacer','A9A0815'], ['aggraver','A9A0853'], ['aimer','A9A1016'], ['ajouter','A9A1047'],
  ['ajuster','A9A1051'], ['amarrer','A9A1381'], ['amener','A9A1441'], ['ancrer','A9A1693'],
  ['animer','A9A1803'], ['apaiser','A9A2069'], ['apprendre','A9A2249'], ['assumer','A9A2900'],
  ['attendre','A9A3030'], ['attirer','A9A3066'], ['attraper','A9A3078'], ['avaler','A9A3332'],
  ['avouer','A9A3471'], ['barrer','A9B0482'], ['blesser','A9B1365'], ['boire','A9B1462','p'],
  ['bousculer','A9B1877'], ['brancher','A9B2003'], ['brouiller','A9B2285'], ['calmer','A9C0327'],
  ['camoufler','A9C0415'], ['caracteriser','A9C0726'], ['ceindre','A9C1230'], ['changer','A9C1591'],
  ['charger','A9C1670'], ['chercher','A9C1904'], ['clore','A9C2658'], ['combiner','A9C3062'],
  ['commander','A9C3091'], ['communiquer','A9C3170'], ['concentrer','A9C3355'], ['conduire','A9C3472'],
  ['connaître','A9C3636'], ['corriger','A9C4351'], ['couler','A9C4538'], ['créer','A9C4870'],
  ['croire','A9C5041'], ['croiser','A9C5047'], ['cultiver','A9C5283'], ['danser','A9D0087','p'],
  ['déborder','A9D0233'], ['découper','A9D0606'], ['découvrir','A9D0628'], ['défiler','A9D0799'],
  ['déposer','A9D1558'], ['dessiner','A9D2011'], ['devoir','A9D2262'], ['disposer','A9D2723'],
  ['diviser','A9D2863','p'], ['documenter','A9D2924'], ['écrire','A9E0358','i'], ['employer','A9E1180'],
  ['enfiler','A9E1555'], ['enseigner','A9E1784','p'], ['essayer','A9E2664'], ['essuyer','A9E2693'],
  ['estimer','A9E2733'], ['étudier','A9E3017','r'], ['examiner','A9E3207'], ['expliquer','A9E3460'],
  ['fabriquer','A9F0013'], ['faire','A9F0112'], ['fixer','A9F0878'], ['garder','A9G0255'],
  ['grandir','A9G1216'], ['haïr','A9H0071','r'], ['interpeller','A9I1744','r'], ['inventer','A9I1922','p'],
  ['inviter','A9I1963','r'], ['joindre','A9J0231'], ['juger','A9J0351','r'], ['laisser','A9L0132'],
  ['lancer','A9L0235'], ['lire','A9L0973','p'], ['manger','A9M0490','p'], ['manquer','A9M0575'],
  ['menacer','A9M1668'], ['mettre','A9M1992'], ['modeler','A9M2436'], ['monter','A9M2749'],
  ['mourir','A9M3019'], ['observer','A9O0082','r'], ['offrir','A9O0286'], ['oindre','A9O0305'],
  ['organiser','A9O0703','p'], ['ouvrir','A9O1025'], ['partager','A9P0750'], ['passer','A9P0853'],
  ['payer','A9P1095','p'], ['peindre','A9P1224'], ['peler','A9P1254','p'], ['penser','A9P1375'],
  ['peser','A9P1757'], ['plaire','A9P2680','q'], ['plonger','A9P2934'], ['porter','A9P3531','p'],
  ['pouvoir','A9P3829','p'], ['présenter','A9P4144'], ['prononcer','A9P4591','p'], ['raconter','A9R0122'],
  ['ranger','A9R0448','p'], ['recevoir','A9R0843'], ['reconnaître','A9R0949'], ['rencontrer','A9R1680','r'],
  ['rendre','A9R1686'],
  ['rentrer','A9R1786'], ['répéter','A9R1858'], ['répondre','A9R1899','q'], ['reprendre','A9R1930'],
  ['rire','A9R2696','i'], ['rompre','A9R2887'], ['savoir','A9S0657'], ['sentir','A9S1258'],
  ['sortir','A9S2177'], ['souffrir','A9S2239','r'], ['suivre','A9S3347'], ['tirer','A9T1270','p'],
  ['trahir','A9T1779'], ['travailler','A9T2026','p'], ['tuer','A9T2638'], ['utiliser','A9U0236','p'],
  ['valoir','A9V0113','r'], ['vendre','A9V0354','p'], ['vêtir','A9V0637'], ['vider','A9V0766'],
  ['voir','A9V1094','p'], ['vouloir','A9V1230'],
]

const PERSONS: Record<'default' | Exclude<SeedKind, ''>, number[]> = {
  default: [4, 5, 6, 7, 8, 9],
  p: [6, 9],
  r: [7, 8, 9],
  i: [4, 5, 6, 7, 8, 9],
  q: [7, 8, 9],
}

export const pronominalUseSeeds = ACADEMIE_USES.map(([infinitif, articleId, kind = '']) => ({
  infinitif,
  typeEmploi: kind === 'p' ? 'passif' : ['r', 'q'].includes(kind) ? 'reciproque' : 'reflechi',
  fonctionPronom: kind === 'p' ? 'sans_fonction' : ['i', 'q'].includes(kind) ? 'coi' : 'variable',
  regleAccord: ['i', 'q'].includes(kind) ? 'invariable' : ['p', 'r'].includes(kind) ? 'avec_sujet' : 'selon_construction',
  personnesAutorisees: PERSONS[kind || 'default'],
  sourceUrl: `${SOURCE_ROOT}/${articleId}`,
}))
