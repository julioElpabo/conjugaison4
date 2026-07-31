import type { ModeLandingSlug } from './mode-landing-pages'

export interface ModeTensePage {
  slug: string
  label: string
  path: string
}

const tenseDefinitions: Record<ModeLandingSlug, Array<{ slug: string, label: string, exercisePath?: string }>> = {
  indicatif: [
    { slug: 'present', label: 'présent', exercisePath: '/exercices/present' },
    { slug: 'imparfait', label: 'imparfait', exercisePath: '/exercices/imparfait' },
    { slug: 'passe-compose', label: 'passé composé', exercisePath: '/exercices/passe-compose' },
    { slug: 'plus-que-parfait', label: 'plus-que-parfait' },
    { slug: 'passe-simple', label: 'passé simple' },
    { slug: 'passe-anterieur', label: 'passé antérieur' },
    { slug: 'futur-simple', label: 'futur simple' },
    { slug: 'futur-anterieur', label: 'futur antérieur' },
    { slug: 'futur-proche', label: 'futur proche' },
  ],
  subjonctif: [
    { slug: 'present', label: 'présent' },
    { slug: 'passe', label: 'passé' },
    { slug: 'imparfait', label: 'imparfait' },
    { slug: 'plus-que-parfait', label: 'plus-que-parfait' },
  ],
  conditionnel: [
    { slug: 'present', label: 'présent' },
    { slug: 'passe-premiere-forme', label: 'passé première forme' },
    { slug: 'passe-deuxieme-forme', label: 'passé deuxième forme' },
  ],
  imperatif: [
    { slug: 'present', label: 'présent' },
    { slug: 'passe', label: 'passé' },
  ],
  participe: [
    { slug: 'present', label: 'présent' },
    { slug: 'passe', label: 'passé' },
    { slug: 'gerondif-present', label: 'gérondif présent' },
    { slug: 'gerondif-passe', label: 'gérondif passé' },
  ],
}

export function modeTensePages(mode: ModeLandingSlug): ModeTensePage[] {
  return tenseDefinitions[mode].map(tense => ({
    slug: tense.slug,
    label: tense.label,
    path: tense.exercisePath ?? `/modes/${mode}/${tense.slug}`,
  }))
}

export function modeTensePage(mode: ModeLandingSlug, tenseSlug: string) {
  return modeTensePages(mode).find(tense => tense.slug === tenseSlug)
}

export const MODE_TENSE_PATHS = (Object.keys(tenseDefinitions) as ModeLandingSlug[])
  .flatMap(mode => modeTensePages(mode).map(tense => tense.path))
  .filter(path => path.startsWith('/modes/'))
