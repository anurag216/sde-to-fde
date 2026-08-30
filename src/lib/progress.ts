import type { LearnerState } from '../domain'

const KEY = 'sde-to-fde:learner-state:v5'
const PREVIOUS_KEYS = ['sde-to-fde:learner-state:v4', 'sde-to-fde:learner-state:v3']

export const emptyState: LearnerState = {
  xp: 0,
  currentChallengeIndex: 0,
  attempts: [],
  drafts: {},
  languages: {},
  codeRuns: {},
  tutor: {},
  trackInterest: { 'backend-platform': 4, 'ai-engineering': 4, fde: 4, 'technical-leadership': 3 },
  missionCompletions: [],
  reviewCompletions: [],
}

export function loadState(): LearnerState {
  try {
    const raw = localStorage.getItem(KEY) ?? PREVIOUS_KEYS.map((key) => localStorage.getItem(key)).find(Boolean)
    if (!raw) return emptyState
    const parsed = JSON.parse(raw) as Partial<LearnerState>
    const hydrated: LearnerState = {
      ...emptyState,
      ...parsed,
      drafts: parsed.drafts ?? {}, languages: parsed.languages ?? {}, codeRuns: parsed.codeRuns ?? {}, tutor: parsed.tutor ?? {},
      attempts: parsed.attempts ?? [], missionCompletions: parsed.missionCompletions ?? [], reviewCompletions: parsed.reviewCompletions ?? [],
      trackInterest: { ...emptyState.trackInterest, ...(parsed.trackInterest ?? {}) },
    }
    localStorage.setItem(KEY, JSON.stringify(hydrated))
    return hydrated
  } catch { return emptyState }
}

export function saveState(state: LearnerState) { localStorage.setItem(KEY, JSON.stringify(state)) }
export function resetState() { localStorage.removeItem(KEY); PREVIOUS_KEYS.forEach((key) => localStorage.removeItem(key)) }
