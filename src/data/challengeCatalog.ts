import { bossChallenges } from './bossChallenges'
import { learningChallenges } from './learningChallenges'

export const allLearningChallenges = [...learningChallenges, ...bossChallenges]
export const allLearningChallengeIds = new Set(allLearningChallenges.map((challenge) => challenge.id))
export function getAnyLearningChallenge(id: string) { return allLearningChallenges.find((challenge) => challenge.id === id) }
