import type { ConjugationTense } from '../types/conjugation'
import { grammarModeCode } from './grammar-codes'

function normalized(value?: string | null) {
  return (value || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLocaleLowerCase('fr')
}

export function areOnlyIndicativeTenses(tenses: readonly ConjugationTense[]) {
  return tenses.length > 0 && tenses.every(tense =>
    tense.mode?.code === 'indicative' || grammarModeCode(tense.mode?.name) === 'indicative')
}

export function withoutIndicativeMode(value: string) {
  return value
    .replace(/\s*\(\s*indicatif\s*\)/giu, '')
    .replace(/\b(?:du\s+indicatif|de\s+l[’']indicatif)\b/giu, '')
    .replace(/\b(?:le\s+)?mode\s+indicatif\s+(?:et|,)\s+(?:le\s+)?temps\s+/giu, match => /^\p{Lu}/u.test(match) ? 'Le temps ' : 'le temps ')
    .replace(/\bindicatif\s*([·–—-])\s*/giu, '')
    .replace(/([·–—-])\s*indicatif\b/giu, '')
    .replace(/\bindicatif\b/giu, '')
    .replace(/[ \t]+(<\/(?:b|em|figcaption|strong)>)/giu, '$1')
    .replace(/[ \t]+([,.;:!?])/gu, '$1')
    .replace(/[ \t]{2,}/gu, ' ')
    .replace(/[ \t]+\n/gu, '\n')
    .trim()
}
