import type { CoachCharacter, CoachGender } from '../types/coach'

type CharacterNames = Pick<CoachCharacter, 'masculineName' | 'feminineName'>

export function characterNameForGender(character: CharacterNames, gender: CoachGender): string {
  return gender === 'female' ? character.feminineName : character.masculineName
}

export function formatCharacterNames(character: CharacterNames): string {
  return character.masculineName === character.feminineName
    ? character.masculineName
    : `${character.masculineName} / ${character.feminineName}`
}
