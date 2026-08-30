import assert from 'node:assert/strict'
import test from 'node:test'
import type { LearnerState } from '../domain'
import { parseLearnerStateBackup, serializeLearnerState } from './portability'

const state: LearnerState = { xp:42,currentChallengeIndex:3,attempts:[],drafts:{x:'answer'},languages:{},codeRuns:{},tutor:{},trackInterest:{'backend-platform':4,'ai-engineering':4,fde:5,'technical-leadership':3},missionCompletions:[],reviewCompletions:[] }

test('learner progress survives export/import round trip',()=>{const raw=serializeLearnerState(state,new Date('2026-01-01T00:00:00.000Z'));const restored=parseLearnerStateBackup(raw);assert.equal(restored.xp,42);assert.equal(restored.currentChallengeIndex,3);assert.equal(restored.drafts.x,'answer');assert.equal(restored.trackInterest.fde,5)})
test('malformed or unrecognized backups are rejected',()=>{assert.throws(()=>parseLearnerStateBackup('not-json'),/valid JSON/);assert.throws(()=>parseLearnerStateBackup('{}'),/not recognized/);assert.throws(()=>parseLearnerStateBackup(JSON.stringify({schemaVersion:1,state:{xp:'lots'}})),/invalid XP/)})
