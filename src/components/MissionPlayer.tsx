import { useState } from 'react'
import { TutorPanel } from './TutorPanel'
import type { Challenge, CodeLanguage, CodeRunResult, LearnerState } from '../domain'
import { canCompleteMission, completeMission, maxHintLevel, missionXpForHintLevel } from '../lib/gamification'
import { runCode } from '../lib/codeRunner'

export function MissionPlayer({ challenge, state, onUpdate, onBack }: { challenge: Challenge; state: LearnerState; onUpdate: (state: LearnerState) => void; onBack: () => void }) {
  const completed = state.missionCompletions.find((item)=>item.challengeId===challenge.id)
  const language = state.languages[challenge.id] ?? challenge.coding?.languages[0] ?? 'typescript'
  const starter = challenge.coding?.starterCode[language] ?? ''
  const answer = state.drafts[challenge.id] ?? state.attempts.find((item)=>item.challengeId===challenge.id)?.answer ?? starter
  const runs = state.codeRuns[challenge.id] ?? []
  const [running,setRunning]=useState(false)
  const ready=canCompleteMission(state,challenge)
  const hintLevel=maxHintLevel(state,challenge.id)
  const potentialXp=missionXpForHintLevel(hintLevel)

  function setAnswer(value:string){ onUpdate({...state,drafts:{...state.drafts,[challenge.id]:value}}) }
  function setLanguage(next:CodeLanguage){
    const currentStarter=challenge.coding?.starterCode[language]
    const replace=!state.drafts[challenge.id]||state.drafts[challenge.id]===currentStarter
    onUpdate({...state,languages:{...state.languages,[challenge.id]:next},drafts:replace&&challenge.coding?{...state.drafts,[challenge.id]:challenge.coding.starterCode[next]}:state.drafts})
  }
  async function execute(){ if(!challenge.coding||!answer.trim())return;setRunning(true);const result=await runCode(challenge,language,answer);onUpdate({...state,codeRuns:{...state.codeRuns,[challenge.id]:[...runs,result]}});setRunning(false) }
  function finish(){ const next=completeMission(state,challenge);onUpdate(next) }

  return <main className="shell mission-player-shell">
    <div className="view-nav"><button className="back" onClick={onBack}>← Missions</button><div className="mission-reward"><span>{completed?'Completed':`Up to +${potentialXp} XP`}</span>{hintLevel>0&&<small>highest hint: {hintLevel}/6</small>}</div></div>
    <section className="card challenge-card mission-player-card">
      <div className="challenge-meta"><span>learning mission</span><span>{challenge.type}</span>{challenge.skills.map((skill)=><span key={skill}>{skill}</span>)}</div>
      <h1>{challenge.title}</h1><p className="scenario">{challenge.scenario}</p><h3>{challenge.prompt}</h3>
      <MissionInput challenge={challenge} answer={answer} setAnswer={setAnswer} language={language} setLanguage={setLanguage} running={running} onRun={execute} runs={runs}/>
      <TutorPanel challenge={challenge} answer={answer} state={state} onUpdate={onUpdate}/>
      <div className="evidence"><b>What this proves</b><span>{challenge.evidence}</span></div>
      <CompletionGate challenge={challenge} state={state}/>
      <div className="mission-finish-row"><button disabled={!ready||Boolean(completed)} onClick={finish}>{completed?'Mission complete ✓':ready?`Complete mission · +${potentialXp} XP`:'Complete the evidence gate above'}</button>{completed&&<span>Earned {completed.xpAwarded} XP · hint level {completed.maxHintLevel}/6</span>}</div>
    </section>
  </main>
}

function MissionInput({challenge,answer,setAnswer,language,setLanguage,running,onRun,runs}:{challenge:Challenge;answer:string;setAnswer:(value:string)=>void;language:CodeLanguage;setLanguage:(language:CodeLanguage)=>void;running:boolean;onRun:()=>void;runs:CodeRunResult[]}){
  if(challenge.type==='multiple-choice') return <div className="options">{challenge.options?.map((option,index)=><label className={answer===String(index)?'selected':''} key={option}><input type="radio" name={challenge.id} value={index} checked={answer===String(index)} onChange={(event)=>setAnswer(event.target.value)}/><span>{option}</span></label>)}</div>
  if(challenge.type==='coding'&&challenge.coding){const latest=runs.at(-1);return <div className="code-workspace"><div className="code-toolbar"><label>Language<select value={language} onChange={(event)=>setLanguage(event.target.value as CodeLanguage)}>{challenge.coding.languages.map((item)=><option key={item} value={item}>{item}</option>)}</select></label><button type="button" className="run-button" disabled={running||!answer.trim()} onClick={onRun}>{running?'Running…':'▶ Run tests'}</button></div><textarea className="code-input" rows={18} value={answer} onChange={(event)=>setAnswer(event.target.value)} spellCheck={false}/>{latest&&<RunResult result={latest}/>} {runs.length>1&&<p className="run-history">{runs.length} runs saved · {runs.filter((run)=>run.status==='passed').length} passing</p>}</div>}
  return <textarea rows={11} value={answer} placeholder={challenge.placeholder??'Write your reasoning. Be concrete about tradeoffs and failure modes…'} onChange={(event)=>setAnswer(event.target.value)}/>
}

function RunResult({result}:{result:CodeRunResult}){return <div className={`run-result ${result.status}`}><div className="run-summary"><strong>{result.status==='passed'?'All tests passed':result.status==='failed'?'Some tests failed':result.status==='timeout'?'Execution timed out':'Could not run'}</strong><span>{result.durationMs} ms</span></div>{result.error&&<pre>{result.error}</pre>}{result.tests.map((test)=><div className="test-row" key={test.name}><span>{test.passed?'✓':'×'} {test.name}</span><b>{test.passed?'pass':'fail'}</b>{!test.passed&&test.error&&<small>{test.error}</small>}</div>)}</div>}

function CompletionGate({challenge,state}:{challenge:Challenge;state:LearnerState}){
  if(challenge.type==='coding'){const passed=(state.codeRuns[challenge.id]??[]).some((run)=>run.status==='passed');return <div className={passed?'gate gate-ready':'gate'}><b>{passed?'✓':'○'} Evidence gate</b><span>{passed?'At least one deterministic run passed.':'Pass all deterministic tests at least once.'}</span></div>}
  if(challenge.type==='free-response'){const evaluated=(state.tutor[challenge.id]?.evaluations??[]).length>0;return <div className={evaluated?'gate gate-ready':'gate'}><b>{evaluated?'✓':'○'} Evidence gate</b><span>{evaluated?'Your attempt has evaluator evidence.':'Write an attempt, then use “Evaluate attempt” before completion.'}</span></div>}
  const correct=Number(state.drafts[challenge.id])===challenge.correctOption;return <div className={correct?'gate gate-ready':'gate'}><b>{correct?'✓':'○'} Evidence gate</b><span>{correct?'Decision is correct.':'Choose the strongest answer. You can revise after feedback/hints.'}</span></div>
}
