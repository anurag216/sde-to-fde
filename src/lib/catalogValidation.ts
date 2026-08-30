import { bossChallenges, bosses } from '../data/bossChallenges'
import { diagnosticChallenges } from '../data/diagnostic'
import { learningChallenges } from '../data/learningChallenges'
import { missionCatalog } from '../data/missionCatalog'
import { skills } from '../data/skills'
import type { Challenge } from '../domain'

const skillIds = new Set(skills.map((skill) => skill.id))

function duplicates(values: string[]) {
  const seen = new Set<string>()
  const dupes = new Set<string>()
  for (const value of values) { if (seen.has(value)) dupes.add(value); else seen.add(value) }
  return [...dupes]
}

function validateChallenge(challenge: Challenge, context: string, errors: string[]) {
  const label = `${context}:${challenge.id}`
  if (!challenge.id.trim() || !challenge.title.trim() || !challenge.scenario.trim() || !challenge.prompt.trim()) errors.push(`${label} is missing required text.`)
  if (!challenge.skills.length || challenge.skills.some((skill) => !skillIds.has(skill))) errors.push(`${label} references an unknown or empty skill set.`)
  if (challenge.type === 'multiple-choice') {
    if (!challenge.options || challenge.options.length < 2 || challenge.correctOption === undefined || challenge.correctOption < 0 || challenge.correctOption >= challenge.options.length) errors.push(`${label} has an invalid objective answer configuration.`)
  }
  if (challenge.type === 'free-response') {
    if (!challenge.rubric || challenge.rubric.length < 2) errors.push(`${label} needs at least two rubric criteria.`)
    if (challenge.hints?.length !== 6) errors.push(`${label} needs exactly six progressive hint levels.`)
  }
  if (challenge.type === 'coding') {
    if (!challenge.coding?.functionName || !challenge.coding.tests.length || !challenge.coding.languages.length) errors.push(`${label} has incomplete executable configuration.`)
    for (const language of challenge.coding?.languages ?? []) if (!challenge.coding?.starterCode[language]) errors.push(`${label} is missing ${language} starter code.`)
    if (challenge.hints?.length !== 6) errors.push(`${label} needs exactly six progressive hint levels.`)
  }
}

export function validateCurriculum(): string[] {
  const errors: string[] = []
  for (const id of duplicates(diagnosticChallenges.map((item) => item.id))) errors.push(`Duplicate diagnostic id: ${id}`)
  for (const id of duplicates(learningChallenges.map((item) => item.id))) errors.push(`Duplicate core mission id: ${id}`)
  for (const id of duplicates(bossChallenges.map((item) => item.id))) errors.push(`Duplicate boss-stage id: ${id}`)

  diagnosticChallenges.forEach((challenge) => validateChallenge(challenge, 'diagnostic', errors))
  learningChallenges.forEach((challenge) => validateChallenge(challenge, 'mission', errors))
  bossChallenges.forEach((challenge) => validateChallenge(challenge, 'boss', errors))

  const missionIds = new Set(missionCatalog.map((item) => item.id))
  for (const challenge of learningChallenges) if (!missionIds.has(challenge.id)) errors.push(`Core learning challenge ${challenge.id} has no mission-catalog definition.`)

  const bossStageIds = new Set(bossChallenges.map((item) => item.id))
  for (const boss of bosses) {
    if (boss.stageIds.length !== 3) errors.push(`${boss.id} must have exactly three stages.`)
    for (const stage of boss.stageIds) if (!bossStageIds.has(stage)) errors.push(`${boss.id} references missing stage ${stage}.`)
  }
  const referencedBossStages = bosses.flatMap((boss) => [...boss.stageIds])
  for (const id of duplicates(referencedBossStages)) errors.push(`Boss stage ${id} is referenced by more than one boss.`)
  for (const challenge of bossChallenges) if (!referencedBossStages.includes(challenge.id)) errors.push(`Boss stage ${challenge.id} is orphaned.`)

  return errors
}
