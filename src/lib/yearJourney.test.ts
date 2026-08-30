import assert from 'node:assert/strict'
import test from 'node:test'
import { diagnosticChallenges } from '../data/diagnostic'
import { journeyWeekCount, yearJourney } from '../data/yearJourney'
import type { SkillId } from '../domain'

const allSkills: SkillId[] = [
  'programming', 'dsa', 'backend', 'databases', 'distributed-systems',
  'cloud-production', 'ai-engineering', 'system-design', 'fde', 'technical-leadership',
]

test('diagnostic samples every major skill area with practical evidence', () => {
  assert.ok(diagnosticChallenges.length >= 15)
  const covered = new Set(diagnosticChallenges.flatMap((challenge) => challenge.skills))
  for (const skill of allSkills) assert.ok(covered.has(skill), `missing diagnostic coverage for ${skill}`)
  assert.ok(diagnosticChallenges.some((challenge) => challenge.type === 'coding'))
  assert.ok(diagnosticChallenges.some((challenge) => challenge.type === 'free-response'))
  assert.ok(diagnosticChallenges.some((challenge) => challenge.type === 'multiple-choice'))
})

test('free-response diagnostic challenges provide tutor rubrics and six hint levels', () => {
  for (const challenge of diagnosticChallenges.filter((item) => item.type === 'free-response')) {
    assert.ok((challenge.rubric?.length ?? 0) >= 2, `${challenge.id} needs a meaningful rubric`)
    assert.equal(challenge.hints?.length, 6, `${challenge.id} needs all six assistance levels`)
  }
})

test('one-year journey contains four contiguous quarters and exactly 52 weeks', () => {
  assert.equal(yearJourney.length, 4)
  assert.equal(journeyWeekCount, 52)
  let expectedStart = 1
  for (const quarter of yearJourney) {
    assert.equal(quarter.weeks[0], expectedStart)
    expectedStart = quarter.weeks[1] + 1
    assert.ok(quarter.bossOutcome.length > 40)
    assert.ok(quarter.proof.length >= 4)
    assert.ok(quarter.cycles.length >= 4)
  }
  assert.equal(expectedStart, 53)
})

test('every quarter ends with a build/design/explain style checkpoint', () => {
  for (const quarter of yearJourney) {
    const finalCycle = quarter.cycles.at(-1)
    assert.ok(finalCycle)
    assert.equal(finalCycle?.weeks[1], quarter.weeks[1])
    assert.ok(finalCycle?.outcomes.length)
    assert.ok(quarter.primarySkills.length >= 4)
    assert.ok(quarter.trackExploration.length >= 2)
  }
})
