import type { SavedChallenge, SavedChallengeFolderFilter } from '../types/saved-challenge'

export function filterSavedChallenges(challenges: readonly SavedChallenge[], filter: SavedChallengeFolderFilter): SavedChallenge[] {
  if (filter === 'all') return [...challenges]
  return challenges.filter(challenge => (challenge.folderId ?? null) === (filter === 'unfiled' ? null : filter))
}
