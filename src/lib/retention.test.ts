import assert from 'node:assert/strict'
import test from 'node:test'
import type { LearnerState } from '../domain'
import { completeReview, getReviewQueue, reviewDueAt, reviewEvidenceReady } from './retention'

function baseState(): LearnerState {
  return {
    xp: 100, currentChallengeIndex: 0, attempts: [], drafts: {}, languages: {}, codeRuns: {}, tutor: {},
    trackInterest: { 'backend-platform': 4, 'ai-engineering': 4, fde: 4, 'technical-leadership': 3 },
    missionCompletions: [{ challengeId: 'request-pipeline-structures', completedAt: '2026-01-01T00:00:00.000Z', xpAwarded: 50, maxHintLevel: 0 }],
    reviewCompletions: [],
  }
}

test('first active-recall review is due three days after mission completion', () => {
  const state = baseState()
  assert.equal(reviewDueAt(state, 'request-pipeline-structures'), '2026-01-04T00:00:00.000Z')
  assert.equal(getReviewQueue(state, new Date('2026-01-03T23:59:59.000Z')).length, 0)
  assert.equal(getReviewQueue(state, new Date('2026-01-04T00:00:00.000Z')).length, 1)
})

test('review cannot complete until fresh post-completion evidence exists', () => {
  const state = baseState()
  assert.equal(reviewEvidenceReady(state, 'request-pipeline-structures').ready, false)
  const unchanged = completeReview(state, 'request-pipeline-structures', 'okay', new Date('2026-01-04T01:00:00.000Z'))
  assert.equal(unchanged.reviewCompletions.length, 0)

  state.codeRuns['request-pipeline-structures'] = [{
    id: 'run-1', challengeId: 'request-pipeline-structures', language: 'typescript', source: 'x', startedAt: '2026-01-04T00:30:00.000Z', durationMs: 20, status: 'passed', tests: [],
  }]
  assert.equal(reviewEvidenceReady(state, 'request-pipeline-structures').ready, true)
  const reviewed = completeReview(state, 'request-pipeline-structures', 'okay', new Date('2026-01-04T01:00:00.000Z'))
  assert.equal(reviewed.reviewCompletions.length, 1)
  assert.equal(reviewed.xp, state.xp, 'review must not re-award mission XP')
})

test('easy recall expands the next interval while hard recall shortens it', () => {
  const easy = baseState()
  easy.reviewCompletions.push({ id: 'e', challengeId: 'request-pipeline-structures', completedAt: '2026-01-04T00:00:00.000Z', rating: 'easy', evidenceAt: '2026-01-04T00:00:00.000Z' })
  assert.equal(reviewDueAt(easy, 'request-pipeline-structures'), '2026-01-11T00:00:00.000Z')

  const hard = baseState()
  hard.reviewCompletions.push({ id: 'h', challengeId: 'request-pipeline-structures', completedAt: '2026-01-04T00:00:00.000Z', rating: 'hard', evidenceAt: '2026-01-04T00:00:00.000Z' })
  assert.equal(reviewDueAt(hard, 'request-pipeline-structures'), '2026-01-05T00:00:00.000Z')
})
