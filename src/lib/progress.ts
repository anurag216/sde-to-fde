import type { LearnerState } from '../domain'

const KEY = 'sde-to-fde:learner-state:v1'

export const emptyState: LearnerState = {
  xp: 0,
  currentChallengeIndex: 0,
  attempts: [],
}

export function loadState(): LearnerState {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...emptyState, ...JSON.parse(raw) } : emptyState
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
