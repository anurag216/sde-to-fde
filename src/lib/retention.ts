import { getLearningChallenge, learningChallenges } from '../data/learningChallenges'
import type { Challenge, LearnerState, ReviewRating } from '../domain'

const DAY = 24 * 60 * 60 * 1000
const INTERVALS: Record<ReviewRating, number[]> = {
  hard: [1, 2, 4, 7, 14, 30],
  okay: [3, 7, 21, 45, 90, 150],
  easy: [7, 21, 45, 90, 180, 270],
}

export type ReviewQueueItem = {
  challenge: Challenge
  dueAt: string
  reviewCount: number
  overdueDays: number
  evidenceReady: boolean
}

function plusDays(iso: string, days: number) { return new Date(new Date(iso).getTime() + days * DAY).toISOString() }
function eligible(challenge: Challenge) { return challenge.type === 'coding' || challenge.type === 'free-response' }
function latestReview(state: LearnerState, challengeId: string) {
  return state.reviewCompletions.filter((item) => item.challengeId === challengeId).sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0]
}

export function reviewDueAt(state: LearnerState, challengeId: string): string | null {
  const completion = state.missionCompletions.find((item) => item.challengeId === challengeId)
  if (!completion) return null
  const reviews = state.reviewCompletions.filter((item) => item.challengeId === challengeId).sort((a, b) => a.completedAt.localeCompare(b.completedAt))
  if (!reviews.length) return plusDays(completion.completedAt, 3)
  const last = reviews.at(-1)!
  const schedule = INTERVALS[last.rating]
  const interval = schedule[Math.min(reviews.length - 1, schedule.length - 1)]
  return plusDays(last.completedAt, interval)
}

export function evidenceAfter(state: LearnerState, challenge: Challenge, thresholdIso: string): string | null {
  if (challenge.type === 'coding') {
    const passing = (state.codeRuns[challenge.id] ?? []).filter((run) => run.status === 'passed' && run.startedAt > thresholdIso).sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0]
    return passing?.startedAt ?? null
  }
  if (challenge.type === 'free-response') {
    const evaluation = (state.tutor[challenge.id]?.evaluations ?? []).filter((item) => item.createdAt > thresholdIso).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
    return evaluation?.createdAt ?? null
  }
  return null
}

export function reviewEvidenceReady(state: LearnerState, challengeId: string): { ready: boolean; evidenceAt?: string } {
  const challenge = getLearningChallenge(challengeId)
  const completion = state.missionCompletions.find((item) => item.challengeId === challengeId)
  if (!challenge || !completion || !eligible(challenge)) return { ready: false }
  const last = latestReview(state, challengeId)
  const threshold = last?.completedAt ?? completion.completedAt
  const evidenceAt = evidenceAfter(state, challenge, threshold)
  return evidenceAt ? { ready: true, evidenceAt } : { ready: false }
}

export function getReviewQueue(state: LearnerState, now = new Date()): ReviewQueueItem[] {
  const nowMs = now.getTime()
  return learningChallenges
    .filter(eligible)
    .flatMap((challenge) => {
      const dueAt = reviewDueAt(state, challenge.id)
      if (!dueAt || new Date(dueAt).getTime() > nowMs) return []
      const ready = reviewEvidenceReady(state, challenge.id)
      return [{
        challenge,
        dueAt,
        reviewCount: state.reviewCompletions.filter((item) => item.challengeId === challenge.id).length,
        overdueDays: Math.max(0, Math.floor((nowMs - new Date(dueAt).getTime()) / DAY)),
        evidenceReady: ready.ready,
      }]
    })
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
}

export function completeReview(state: LearnerState, challengeId: string, rating: ReviewRating, now = new Date()): LearnerState {
  const status = reviewEvidenceReady(state, challengeId)
  if (!status.ready || !status.evidenceAt) return state
  const completedAt = now.toISOString()
  return {
    ...state,
    reviewCompletions: [...state.reviewCompletions, {
      id: `${challengeId}:${completedAt}`,
      challengeId,
      completedAt,
      rating,
      evidenceAt: status.evidenceAt,
    }],
  }
}
