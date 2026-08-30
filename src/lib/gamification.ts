import { learningChallenges } from '../data/learningChallenges'
import type { Challenge, LearnerState, MissionCompletion } from '../domain'

export type Badge = { id: string; name: string; description: string; earned: boolean }
export type ProgressSummary = { level: number; xp: number; xpIntoLevel: number; xpForNextLevel: number; streak: number; badges: Badge[]; completed: number; total: number }

const LEVEL_SIZE = 300

export function maxHintLevel(state: LearnerState, challengeId: string) {
  return (state.tutor[challengeId]?.hints ?? []).reduce((max, hint) => Math.max(max, hint.level), 0)
}

export function missionXpForHintLevel(level: number) {
  if (level === 0) return 65
  if (level <= 2) return 55
  if (level <= 4) return 45
  return 35
}

export function canCompleteMission(state: LearnerState, challenge: Challenge) {
  if (challenge.type === 'multiple-choice') {
    const draft = state.drafts[challenge.id]
    return Number(draft) === challenge.correctOption
  }
  if (challenge.type === 'coding') return (state.codeRuns[challenge.id] ?? []).some((run) => run.status === 'passed')
  return (state.tutor[challenge.id]?.evaluations ?? []).length > 0 && Boolean(state.drafts[challenge.id]?.trim())
}

export function completeMission(state: LearnerState, challenge: Challenge, now = new Date()): LearnerState {
  if (!canCompleteMission(state, challenge)) return state
  if (state.missionCompletions.some((item) => item.challengeId === challenge.id)) return state
  const hintLevel = maxHintLevel(state, challenge.id)
  const xpAwarded = missionXpForHintLevel(hintLevel)
  const completion: MissionCompletion = { challengeId: challenge.id, completedAt: now.toISOString(), xpAwarded, maxHintLevel: hintLevel }
  const answer = state.drafts[challenge.id] ?? ''
  const objectiveCorrect = challenge.type === 'multiple-choice' ? true : undefined
  return {
    ...state,
    xp: state.xp + xpAwarded,
    missionCompletions: [...state.missionCompletions, completion],
    attempts: [...state.attempts.filter((item) => item.challengeId !== challenge.id), { challengeId: challenge.id, answer, objectiveCorrect, completedAt: completion.completedAt }],
  }
}

function localDay(value: string) { const date = new Date(value); return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` }
function dayNumber(value: string) { const date = new Date(value); return Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86400000) }

export function calculateStreak(completions: MissionCompletion[], now = new Date()) {
  if (!completions.length) return 0
  const unique = [...new Set(completions.map((item) => localDay(item.completedAt)))].map((day) => {
    const [year, month, date] = day.split('-').map(Number)
    return Math.floor(new Date(year, month, date).getTime() / 86400000)
  }).sort((a,b) => b-a)
  const today = dayNumber(now.toISOString())
  if (today - unique[0] > 1) return 0
  let streak = 1
  for (let i = 1; i < unique.length; i += 1) { if (unique[i-1] - unique[i] === 1) streak += 1; else break }
  return streak
}

export function progressSummary(state: LearnerState, now = new Date()): ProgressSummary {
  const completedIds = new Set(state.missionCompletions.map((item) => item.challengeId))
  const dsaCompleted = learningChallenges.filter((item) => item.id.startsWith('dsa-') && completedIds.has(item.id)).length
  const fdeCompleted = learningChallenges.filter((item) => item.skills.includes('fde') && completedIds.has(item.id)).length
  const noHint = state.missionCompletions.some((item) => item.maxHintLevel === 0)
  const hasPassingCode = Object.values(state.codeRuns).flat().some((run) => run.status === 'passed' && completedIds.has(run.challengeId))
  const badges: Badge[] = [
    { id:'first-mission', name:'First Rep', description:'Complete your first learning mission.', earned: state.missionCompletions.length >= 1 },
    { id:'code-green', name:'Green Build', description:'Complete a mission with passing deterministic code tests.', earned: hasPassingCode },
    { id:'no-hint', name:'Cold Solve', description:'Complete a mission without using a hint.', earned: noHint },
    { id:'dsa-five', name:'DSA Momentum', description:'Complete five DSA missions.', earned: dsaCompleted >= 5 },
    { id:'fde-three', name:'Ambiguity Operator', description:'Complete three FDE-tagged missions.', earned: fdeCompleted >= 3 },
    { id:'ten-reps', name:'Double Digits', description:'Complete ten learning missions.', earned: state.missionCompletions.length >= 10 },
  ]
  return { level: Math.floor(state.xp / LEVEL_SIZE) + 1, xp: state.xp, xpIntoLevel: state.xp % LEVEL_SIZE, xpForNextLevel: LEVEL_SIZE, streak: calculateStreak(state.missionCompletions, now), badges, completed: state.missionCompletions.length, total: learningChallenges.length }
}
