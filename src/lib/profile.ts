import { diagnosticChallenges } from '../data/diagnostic'
import { skills } from '../data/skills'
import type { EvidenceSignal, GapStatus, LearnerState, ProfileEvidence, SkillId, SkillProfile, TrackId, TrackInterest, TrackRecommendation } from '../domain'

const signalValue: Record<EvidenceSignal, number | undefined> = { strong: 1, partial: 0.65, weak: 0.3, unknown: undefined }
const trackSkills: Record<TrackId, SkillId[]> = {
  'backend-platform': ['programming', 'backend', 'databases', 'distributed-systems', 'cloud-production', 'system-design'],
  'ai-engineering': ['programming', 'backend', 'ai-engineering', 'system-design', 'cloud-production'],
  fde: ['backend', 'cloud-production', 'system-design', 'fde', 'technical-leadership'],
  'technical-leadership': ['system-design', 'fde', 'technical-leadership'],
}

function clamp(value: number, min = 0, max = 100) { return Math.max(min, Math.min(max, value)) }
function assistanceFactor(state: LearnerState, challengeId: string) {
  const hints = state.tutor[challengeId]?.hints ?? []
  const max = hints.reduce((level, hint) => Math.max(level, hint.level), 0)
  return [1, 1, 0.95, 0.88, 0.8, 0.7, 0.58][max] ?? 0.58
}
function statusFromBoolean(value: boolean | undefined): GapStatus { return value === undefined ? 'unknown' : value ? 'not-evidenced' : 'evidenced' }

export function buildSkillProfile(state: LearnerState): SkillProfile[] {
  return skills.map((skill) => {
    const evidence: ProfileEvidence[] = []
    let implementation: GapStatus = 'unknown'
    let vocabulary: GapStatus = 'unknown'
    let design: GapStatus = 'unknown'

    for (const challenge of diagnosticChallenges.filter((item) => item.skills.includes(skill.id))) {
      const attempt = state.attempts.find((item) => item.challengeId === challenge.id)
      const factor = assistanceFactor(state, challenge.id)

      if (challenge.type === 'multiple-choice' && attempt && typeof attempt.objectiveCorrect === 'boolean') {
        const value = attempt.objectiveCorrect ? 1 : 0.25
        evidence.push({ id: `objective:${challenge.id}`, challengeId: challenge.id, kind: 'objective', label: challenge.title, detail: attempt.objectiveCorrect ? 'Objective concept check correct.' : 'Objective concept check missed.', value, weight: 1 * factor })
        if (skill.id === 'dsa' || skill.id === 'programming' || skill.id === 'databases') vocabulary = statusFromBoolean(attempt.objectiveCorrect)
      }

      if (challenge.type === 'coding') {
        const runs = state.codeRuns[challenge.id] ?? []
        const latest = runs.at(-1)
        if (latest) {
          const executable = latest.status === 'passed' || latest.status === 'failed'
          const value = latest.status === 'passed' ? 1 : latest.status === 'failed' ? 0.35 : undefined
          evidence.push({ id: `code:${latest.id}`, challengeId: challenge.id, kind: 'code', label: challenge.title, detail: `${latest.status} code run after ${runs.length} run${runs.length === 1 ? '' : 's'}.`, value, weight: (executable ? 1.5 : 0.25) * factor })
          implementation = latest.status === 'passed' ? 'not-evidenced' : latest.status === 'failed' ? 'evidenced' : 'unknown'
        } else if (attempt) {
          evidence.push({ id: `attempt:${challenge.id}`, challengeId: challenge.id, kind: 'attempt', label: challenge.title, detail: 'Coding answer submitted but no deterministic run evidence exists.', weight: 0.15 })
        }
      }

      const evaluations = state.tutor[challenge.id]?.evaluations ?? []
      const latestEvaluation = evaluations.at(-1)
      const skillSignal = latestEvaluation?.signals.find((signal) => signal.skill === skill.id)
      if (latestEvaluation && skillSignal) {
        const value = signalValue[skillSignal.signal]
        const sourceWeight = latestEvaluation.source === 'ai' ? 1.25 : 0.55
        evidence.push({ id: `tutor:${latestEvaluation.id}:${skill.id}`, challengeId: challenge.id, kind: 'tutor', label: challenge.title, detail: `${latestEvaluation.source === 'ai' ? 'AI semantic evaluation' : 'Local rubric'}: ${skillSignal.signal}. ${skillSignal.rationale}`, value, weight: sourceWeight * factor })
        if (challenge.type === 'free-response') design = skillSignal.signal === 'strong' ? 'not-evidenced' : skillSignal.signal === 'partial' || skillSignal.signal === 'weak' ? 'evidenced' : design
      } else if (attempt && challenge.type === 'free-response') {
        evidence.push({ id: `attempt:${challenge.id}:${skill.id}`, challengeId: challenge.id, kind: 'attempt', label: challenge.title, detail: 'Free-response attempt captured; semantic evaluation not yet available.', weight: 0.15 })
      }
    }

    const scored = evidence.filter((item) => typeof item.value === 'number')
    const totalWeight = scored.reduce((sum, item) => sum + item.weight, 0)
    const mastery = totalWeight === 0 ? null : Math.round(100 * scored.reduce((sum, item) => sum + (item.value ?? 0) * item.weight, 0) / totalWeight)
    const confidenceWeight = evidence.reduce((sum, item) => sum + item.weight, 0)
    const confidence = Math.round(clamp((confidenceWeight / 3.2) * 100))

    return { skillId: skill.id, mastery, confidence, evidence, gaps: { implementation, vocabulary, design, retention: 'unknown' } }
  })
}

function effectiveMastery(profile: SkillProfile) {
  if (profile.mastery === null) return 50
  const confidence = profile.confidence / 100
  return 50 + (profile.mastery - 50) * confidence
}

export function recommendTracks(profile: SkillProfile[], interest: TrackInterest): TrackRecommendation[] {
  return (Object.keys(trackSkills) as TrackId[]).map((trackId) => {
    const related = trackSkills[trackId].map((skillId) => profile.find((item) => item.skillId === skillId)!).filter(Boolean)
    const affinity = related.length ? related.reduce((sum, item) => sum + effectiveMastery(item), 0) / related.length : 50
    const confidence = related.length ? related.reduce((sum, item) => sum + item.confidence, 0) / related.length : 0
    const interestScore = clamp(((interest[trackId] ?? 3) - 1) / 4 * 100)
    const score = Math.round(interestScore * 0.65 + affinity * 0.35)
    const reason = confidence < 35
      ? `Interest is carrying more weight because evidence confidence is still low (${Math.round(confidence)}%).`
      : `Combines your interest with evidence across ${related.length} related skill areas; current evidence confidence is ${Math.round(confidence)}%.`
    return { trackId, score, evidenceConfidence: Math.round(confidence), reason }
  }).sort((a, b) => b.score - a.score)
}
