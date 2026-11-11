import type { SavedChallengeFolderColor } from '../utils/saved-challenge-folder-colors'

export interface SavedChallenge {
  code: string
  title: string
  description: string
  questionCount: number
  verbCount: number
  tenseCount: number
  savedAt: string
  folderId: number | null
}

export interface SavedChallengeFolder {
  id: number
  name: string
  color: SavedChallengeFolderColor
}

export type SavedChallengeFolderFilter = 'all' | 'unfiled' | number

export type SavedChallengeFolderAction =
  | { kind: 'create' }
  | { kind: 'rename', folder: SavedChallengeFolder }
  | { kind: 'color', folder: SavedChallengeFolder }
  | { kind: 'delete', folder: SavedChallengeFolder }
  | { kind: 'move', challenges: SavedChallenge[] }
