import { allLearningChallenges } from '../data/challengeCatalog'
import { diagnosticChallenges } from '../data/diagnostic'
import type { LearnerState, SkillId, SkillProfile } from '../domain'

export type ReadinessStatus = 'unknown' | 'building' | 'evidenced'
export type ReadinessArea = {
  id: string
  title: string
  description: string
  skills: SkillId[]
  status: ReadinessStatus
  confidence: number
  evidenceCount: number
  evidence: string[]
}

const specs: { id:string; title:string; description:string; skills:SkillId[] }[] = [
  { id:'coding', title:'Coding & implementation', description:'Can turn requirements into working code and reason about data structures/complexity.', skills:['programming','dsa'] },
  { id:'debugging', title:'Debugging & diagnosis', description:'Can localize failures from evidence instead of changing components by guesswork.', skills:['programming','backend','cloud-production'] },
  { id:'backend-data', title:'Backend & data', description:'Can design APIs, state transitions, SQL/index/transaction boundaries, async workers and retries.', skills:['backend','databases'] },
  { id:'distributed-production', title:'Distributed & production', description:'Can reason about failure, delivery semantics, concurrency, deploys and observability.', skills:['distributed-systems','cloud-production'] },
  { id:'system-design', title:'System design', description:'Can decompose systems, state invariants, identify failure modes and defend tradeoffs.', skills:['system-design'] },
  { id:'ai-engineering', title:'AI engineering', description:'Can put probabilistic models inside evaluated, authorized, observable deterministic boundaries.', skills:['ai-engineering'] },
  { id:'fde-discovery', title:'FDE discovery & delivery', description:'Can discover design-changing constraints, scope pilots and adapt to enterprise reality.', skills:['fde'] },
  { id:'technical-communication', title:'Technical communication & leadership', description:'Can explain decisions, structure disagreement and communicate rollout/risk clearly.', skills:['technical-leadership'] },
]

const allChallenges = [...diagnosticChallenges, ...allLearningChallenges]
function unique(values:string[]){return [...new Set(values)]}

export function buildCareerReadiness(state:LearnerState, profile:SkillProfile[]):ReadinessArea[] {
  return specs.map((spec) => {
    const relatedProfiles = spec.skills.map((skill)=>profile.find((item)=>item.skillId===skill)).filter(Boolean) as SkillProfile[]
    const challengeIds = new Set(allChallenges.filter((challenge)=>challenge.skills.some((skill)=>spec.skills.includes(skill))).map((challenge)=>challenge.id))
    const evidence:string[]=[]

    for(const [challengeId,runs] of Object.entries(state.codeRuns)){
      if(challengeIds.has(challengeId)&&runs.some((run)=>run.status==='passed')) evidence.push(`Passing code: ${allChallenges.find((item)=>item.id===challengeId)?.title??challengeId}`)
    }
    for(const [challengeId,tutor] of Object.entries(state.tutor)){
      if(challengeIds.has(challengeId)&&tutor.evaluations.length) evidence.push(`Evaluated reasoning: ${allChallenges.find((item)=>item.id===challengeId)?.title??challengeId}`)
    }
    for(const attempt of state.attempts){
      if(challengeIds.has(attempt.challengeId)&&typeof attempt.objectiveCorrect==='boolean') evidence.push(`Objective decision: ${allChallenges.find((item)=>item.id===attempt.challengeId)?.title??attempt.challengeId}`)
    }
    for(const completion of state.missionCompletions){
      if(challengeIds.has(completion.challengeId)) evidence.push(`Completed mission: ${allChallenges.find((item)=>item.id===completion.challengeId)?.title??completion.challengeId}`)
    }
    for(const review of state.reviewCompletions){
      if(challengeIds.has(review.challengeId)) evidence.push(`Delayed recall (${review.rating}): ${allChallenges.find((item)=>item.id===review.challengeId)?.title??review.challengeId}`)
    }

    const deduped=unique(evidence)
    const confidence = relatedProfiles.length ? Math.round(relatedProfiles.reduce((sum,item)=>sum+item.confidence,0)/relatedProfiles.length) : 0
    const knownMastery = relatedProfiles.filter((item)=>item.mastery!==null)
    const avgMastery = knownMastery.length ? knownMastery.reduce((sum,item)=>sum+(item.mastery??0),0)/knownMastery.length : null
    const status:ReadinessStatus = deduped.length===0 ? 'unknown' : deduped.length>=3 && confidence>=55 && avgMastery!==null && avgMastery>=65 ? 'evidenced' : 'building'

    return { ...spec, status, confidence, evidenceCount:deduped.length, evidence:deduped.slice(-6).reverse() }
  })
}
