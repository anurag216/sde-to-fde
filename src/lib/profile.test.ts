import assert from 'node:assert/strict'
import test from 'node:test'
import type { LearnerState } from '../domain'
import { buildSkillProfile, recommendTracks } from './profile'
import { generateRoadmap } from './roadmap'

const base: LearnerState = { xp:0,currentChallengeIndex:0,attempts:[],drafts:{},languages:{},codeRuns:{},tutor:{},trackInterest:{'backend-platform':4,'ai-engineering':4,fde:4,'technical-leadership':3},missionCompletions:[],reviewCompletions:[] }

test('unknown skills do not receive invented mastery',()=>{const profile=buildSkillProfile(base);assert.equal(profile.every((item)=>item.mastery===null),true);assert.equal(profile.every((item)=>item.confidence===0),true)})
test('objective evidence creates traceable mastery and confidence',()=>{const state:LearnerState={...base,attempts:[{challengeId:'request-dedup',answer:'1',objectiveCorrect:true,completedAt:new Date().toISOString()}]};const dsa=buildSkillProfile(state).find((item)=>item.skillId==='dsa')!;assert.equal(dsa.mastery,100);assert.ok(dsa.confidence>0&&dsa.confidence<100);assert.ok(dsa.evidence.some((item)=>item.kind==='objective'))})
test('roadmap includes 2 DSA items per week and delayed review',()=>{const roadmap=generateRoadmap(buildSkillProfile(base),base.trackInterest);assert.equal(roadmap.length,4);for(const week of roadmap)assert.equal(week.items.filter((item)=>item.kind==='dsa').length,2);assert.ok(roadmap[3].items.some((item)=>item.kind==='review'))})
test('track recommendation keeps interest separate from evidence confidence',()=>{const recommendations=recommendTracks(buildSkillProfile(base),{...base.trackInterest,fde:5});assert.equal(recommendations[0].trackId,'fde');assert.equal(recommendations[0].evidenceConfidence,0)})
test('delayed active recall creates retention evidence instead of inventing it',()=>{const state:LearnerState={...base,missionCompletions:[{challengeId:'request-pipeline-structures',completedAt:'2026-01-01T00:00:00.000Z',xpAwarded:50,maxHintLevel:0}],reviewCompletions:[{id:'r1',challengeId:'request-pipeline-structures',completedAt:'2026-01-04T00:00:00.000Z',rating:'okay',evidenceAt:'2026-01-04T00:00:00.000Z'}]};const programming=buildSkillProfile(state).find((item)=>item.skillId==='programming')!;assert.equal(programming.gaps.retention,'not-evidenced');assert.ok(programming.evidence.some((item)=>item.kind==='review'))})
