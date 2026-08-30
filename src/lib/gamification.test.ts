import assert from 'node:assert/strict'
import test from 'node:test'
import { learningChallenges, learningChallengeIds } from '../data/learningChallenges'
import { canCompleteMission, completeMission, missionXpForHintLevel, progressSummary } from './gamification'
import { buildSkillProfile } from './profile'
import { generateRoadmap } from './roadmap'
import type { LearnerState } from '../domain'

const base: LearnerState = { xp:0,currentChallengeIndex:0,attempts:[],drafts:{},languages:{},codeRuns:{},tutor:{},trackInterest:{'backend-platform':4,'ai-engineering':4,fde:4,'technical-leadership':3},missionCompletions:[],reviewCompletions:[] }

test('catalog exposes exactly twenty first learning challenges',()=>assert.equal(learningChallenges.length,20))
test('assistance reduces bonus but never to zero',()=>{assert.equal(missionXpForHintLevel(0),65);assert.equal(missionXpForHintLevel(2),55);assert.equal(missionXpForHintLevel(6),35)})
test('mission completion is idempotent for XP',()=>{const challenge=learningChallenges.find((item)=>item.id==='postgres-plan')!;const ready={...base,drafts:{[challenge.id]:String(challenge.correctOption)}};assert.equal(canCompleteMission(ready,challenge),true);const once=completeMission(ready,challenge,new Date('2026-08-30T10:00:00Z'));const twice=completeMission(once,challenge,new Date('2026-08-30T11:00:00Z'));assert.equal(twice.xp,once.xp);assert.equal(twice.missionCompletions.length,1)})
test('roadmap only schedules actionable challenge ids and two DSA reps per week',()=>{const roadmap=generateRoadmap(buildSkillProfile(base),base.trackInterest);for(const week of roadmap){const actionable=week.items.filter((item)=>item.kind!=='review');assert.equal(actionable.filter((item)=>item.kind==='dsa').length,2);for(const item of actionable) assert.equal(learningChallengeIds.has(item.id),true)}})
test('progress summary separates level, streak and badges',()=>{const challenge=learningChallenges.find((item)=>item.id==='postgres-plan')!;const ready={...base,drafts:{[challenge.id]:String(challenge.correctOption)}};const done=completeMission(ready,challenge,new Date('2026-08-30T10:00:00Z'));const summary=progressSummary(done,new Date('2026-08-30T12:00:00Z'));assert.equal(summary.completed,1);assert.equal(summary.streak,1);assert.equal(summary.level,1);assert.equal(summary.badges.find((badge)=>badge.id==='first-mission')?.earned,true)})
