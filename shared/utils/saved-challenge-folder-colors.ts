export const SAVED_CHALLENGE_FOLDER_COLORS = [
  { id: 'violet', light: '#7052a0', dark: '#c5a9ed', swatch: '#8c6cba' },
  { id: 'blue', light: '#245bb0', dark: '#91b9f6', swatch: '#4078d0' },
  { id: 'sky', light: '#146b98', dark: '#86c9ef', swatch: '#329ed5' },
  { id: 'cyan', light: '#096f80', dark: '#7dd3e3', swatch: '#169db5' },
  { id: 'teal', light: '#166d61', dark: '#7ed7c2', swatch: '#2a9d8f' },
  { id: 'green', light: '#2d6b36', dark: '#a1d5a5', swatch: '#4f9756' },
  { id: 'lime', light: '#526a18', dark: '#c4d97c', swatch: '#8da839' },
  { id: 'yellow', light: '#80600c', dark: '#f1d276', swatch: '#d5ac32' },
  { id: 'orange', light: '#9a4e15', dark: '#f5b781', swatch: '#d98640' },
  { id: 'red', light: '#a63939', dark: '#f2a2a2', swatch: '#cf5b5b' },
  { id: 'pink', light: '#9a3e78', dark: '#efabd4', swatch: '#c565a3' },
  { id: 'gray', light: '#586372', dark: '#bdc6d4', swatch: '#7b8797' },
] as const

export type SavedChallengeFolderColor = typeof SAVED_CHALLENGE_FOLDER_COLORS[number]['id']
export const DEFAULT_SAVED_CHALLENGE_FOLDER_COLOR: SavedChallengeFolderColor = 'violet'

export function isSavedChallengeFolderColor(value: unknown): value is SavedChallengeFolderColor {
  return SAVED_CHALLENGE_FOLDER_COLORS.some(color => color.id === value)
}

export function savedChallengeFolderColor(value: unknown): SavedChallengeFolderColor {
  return isSavedChallengeFolderColor(value) ? value : DEFAULT_SAVED_CHALLENGE_FOLDER_COLOR
}

export function savedChallengeFolderColorStyle(value: unknown) {
  const color = SAVED_CHALLENGE_FOLDER_COLORS.find(color => color.id === value) || SAVED_CHALLENGE_FOLDER_COLORS[0]
  return { '--folder-color-light': color.light, '--folder-color-dark': color.dark }
}
