import type { LearnerState } from '../domain'

const KEY = 'sde-to-fde:learner-state:v3'

export const emptyState: LearnerState = {
  xp: 0,
  currentChallengeIndex: 0,
  attempts: [],
  drafts: {},
  languages: {},
  codeRuns: {},
  tutor: {},
}

export function loadState(): LearnerState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyState
    const parsed = JSON.parse(raw) as Partial<LearnerState>
    return {
      ...emptyState,
      ...parsed,
      drafts: parsed.drafts ?? {},
      languages: parsed.languages ?? {},
      codeRuns: parsed.codeRuns ?? {},
      tutor: parsed.tutor ?? {},
      attempts: parsed.attempts ?? [],
    }
  } catch {
    return emptyState
  }
}

export function saveState(state: LearnerState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function resetState() {
  localStorage.removeItem(KEY)
}
