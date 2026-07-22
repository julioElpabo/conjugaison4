import type { CoachCaractere } from '../types/coach'

type CaractereName = Pick<CoachCaractere, 'masculineName'>

export function formatCaractereName(caractere: CaractereName): string {
  return caractere.masculineName
}
