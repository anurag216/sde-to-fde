import type { LearnerState } from '../domain'
import { emptyState } from './progress'

export type LearnerBackup = { schemaVersion: 1; exportedAt: string; state: LearnerState }

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value) }
function isArray(value: unknown): value is unknown[] { return Array.isArray(value) }

export function serializeLearnerState(state: LearnerState, now = new Date()): string {
  const backup: LearnerBackup = { schemaVersion: 1, exportedAt: now.toISOString(), state }
  return JSON.stringify(backup, null, 2)
}

export function parseLearnerStateBackup(raw: string): LearnerState {
  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch { throw new Error('Backup is not valid JSON.') }
  if (!isRecord(parsed) || parsed.schemaVersion !== 1 || !isRecord(parsed.state)) throw new Error('Backup format is not recognized.')
  const value = parsed.state
  if (typeof value.xp !== 'number' || !Number.isFinite(value.xp) || value.xp < 0) throw new Error('Backup has an invalid XP value.')
  if (typeof value.currentChallengeIndex !== 'number' || value.currentChallengeIndex < 0) throw new Error('Backup has an invalid diagnostic position.')
  for (const key of ['attempts','missionCompletions','reviewCompletions'] as const) if (!isArray(value[key])) throw new Error(`Backup has an invalid ${key} collection.`)
  for (const key of ['drafts','languages','codeRuns','tutor','trackInterest'] as const) if (!isRecord(value[key])) throw new Error(`Backup has an invalid ${key} object.`)

  return {
    ...emptyState,
    ...(value as unknown as LearnerState),
    attempts: value.attempts as LearnerState['attempts'],
    missionCompletions: value.missionCompletions as LearnerState['missionCompletions'],
    reviewCompletions: value.reviewCompletions as LearnerState['reviewCompletions'],
    drafts: value.drafts as LearnerState['drafts'],
    languages: value.languages as LearnerState['languages'],
    codeRuns: value.codeRuns as LearnerState['codeRuns'],
    tutor: value.tutor as LearnerState['tutor'],
    trackInterest: { ...emptyState.trackInterest, ...(value.trackInterest as LearnerState['trackInterest']) },
  }
}
