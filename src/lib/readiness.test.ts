import assert from 'node:assert/strict'
import test from 'node:test'
import { bosses, bossChallenges, bossStageUnlocked } from '../data/bossChallenges'
import type { LearnerState } from '../domain'
import { buildSkillProfile } from './profile'
import { buildCareerReadiness } from './readiness'

function state():LearnerState{return {xp:0,currentChallengeIndex:0,attempts:[],drafts:{},languages:{},codeRuns:{},tutor:{},trackInterest:{'backend-platform':4,'ai-engineering':4,fde:4,'technical-leadership':3},missionCompletions:[],reviewCompletions:[]}}

test('career readiness never turns untested areas into weak numeric scores',()=>{const s=state();const areas=buildCareerReadiness(s,buildSkillProfile(s));assert.equal(areas.length,8);assert.equal(areas.every((area)=>area.status==='unknown'&&area.confidence===0&&area.evidenceCount===0),true)})

test('stored implementation evidence changes related readiness from unknown',()=>{const s=state();s.codeRuns['request-pipeline-structures']=[{id:'run',challengeId:'request-pipeline-structures',language:'typescript',source:'x',startedAt:'2026-01-01T00:00:00.000Z',durationMs:5,status:'passed',tests:[]}];const coding=buildCareerReadiness(s,buildSkillProfile(s)).find((area)=>area.id==='coding')!;assert.equal(coding.status,'building');assert.ok(coding.evidenceCount>0)})

test('boss catalog has three tracks and three sequential stages each',()=>{assert.equal(bosses.length,3);assert.equal(bossChallenges.length,9);for(const boss of bosses){assert.equal(boss.stageIds.length,3);assert.equal(bossStageUnlocked(state(),boss,0),true);assert.equal(bossStageUnlocked(state(),boss,1),false);const s=state();s.missionCompletions.push({challengeId:boss.stageIds[0],completedAt:'2026-01-01T00:00:00.000Z',xpAwarded:50,maxHintLevel:0});assert.equal(bossStageUnlocked(s,boss,1),true);assert.equal(bossStageUnlocked(s,boss,2),false)}})

test('boss stages mix design coding and changed-constraint evidence',()=>{for(const boss of bosses){const stages=boss.stageIds.map((id)=>bossChallenges.find((challenge)=>challenge.id===id)!);assert.equal(stages[0].type,'free-response');assert.ok(stages.some((stage)=>stage.type==='coding')||boss.track==='fde');assert.equal(stages[2].type,'free-response');assert.ok(stages[2].scenario.toLowerCase().includes('constraint')||stages[2].scenario.toLowerCase().includes('revealed'))}})
