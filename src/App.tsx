import { FormEvent, useMemo, useState } from 'react'
import { RoadmapView } from './components/RoadmapView'
import { SkillProfileView } from './components/SkillProfileView'
import { TrackCompass } from './components/TrackCompass'
import { TutorPanel } from './components/TutorPanel'
import { diagnosticChallenges } from './data/diagnostic'
import { skills } from './data/skills'
import type { Challenge, CodeLanguage, CodeRunResult, LearnerState, TrackId } from './domain'
import { runCode } from './lib/codeRunner'
import { buildSkillProfile, recommendTracks } from './lib/profile'
import { emptyState, loadState, resetState, saveState } from './lib/progress'
import { generateRoadmap } from './lib/roadmap'

type View = 'dashboard' | 'diagnostic' | 'profile' | 'roadmap'

function App() {
  const [view, setView] = useState<View>('dashboard')
  const [state, setState] = useState<LearnerState>(() => loadState())
  const profile = useMemo(() => buildSkillProfile(state), [state])
  const recommendations = useMemo(() => recommendTracks(profile, state.trackInterest), [profile, state.trackInterest])
  const roadmap = useMemo(() => generateRoadmap(profile, state.trackInterest), [profile, state.trackInterest])

  function update(next: LearnerState) { setState(next); saveState(next) }
  function restart() { resetState(); setState(emptyState); setView('dashboard') }
  function updateInterest(track: TrackId, value: number) { update({ ...state, trackInterest: { ...state.trackInterest, [track]: value } }) }

  if (view === 'diagnostic') return <Diagnostic state={state} onUpdate={update} onExit={() => setView('dashboard')} onComplete={() => setView('profile')} />
  if (view === 'profile') return <SkillProfileView profile={profile} onBack={() => setView('dashboard')} onRoadmap={() => setView('roadmap')} />
  if (view === 'roadmap') return <RoadmapView weeks={roadmap} onBack={() => setView('dashboard')} onProfile={() => setView('profile')} />

  const completed = state.attempts.length
  const completion = Math.round((completed / diagnosticChallenges.length) * 100)
  const evaluations = Object.values(state.tutor).reduce((sum, item) => sum + item.evaluations.length, 0)

  return (
    <main className="shell">
      <nav className="top-nav"><button className="active">Dashboard</button><button onClick={() => setView('diagnostic')}>Diagnostic</button><button onClick={() => setView('profile')}>Skill profile</button><button onClick={() => setView('roadmap')}>4-week roadmap</button></nav>
      <header className="hero"><div><p className="eyebrow">CAREER ALPHA · 0.3</p><h1>SDE <span>→</span> FDE</h1><p className="lede">Build the missing engineering depth without pretending your existing experience counts for nothing.</p></div><div className="level-card"><span>Current evidence</span><strong>{completed}/{diagnosticChallenges.length}</strong><small>diagnostic challenges · {evaluations} tutor reviews</small></div></header>
      <section className="north-star card"><div><p className="eyebrow">NORTH STAR</p><h2>Become better at doing engineering, not consuming courses.</h2></div><p>Problem → attempt → failure → hint → discovery → explanation → repetition → mastery.</p></section>
      <section className="grid two">
        <article className="card mission-card"><p className="eyebrow">YOUR NEXT MOVE</p><h2>{completion === 100 ? 'Turn evidence into deliberate practice' : 'Establish your engineering baseline'}</h2><p>{completion === 100 ? 'Your profile and four-week roadmap now derive from the attempts, code runs, tutor signals and assistance you actually used.' : 'Finish the mixed diagnostic. It will not assign you a skill number from biography or self-confidence alone.'}</p><div className="progress"><i style={{ width: `${completion}%` }} /></div><div className="row"><strong>{completion}%</strong><button onClick={() => setView(completion === 100 ? 'profile' : 'diagnostic')}>{completion === 100 ? 'Open baseline' : completed ? 'Continue diagnostic' : 'Start diagnostic'}</button></div></article>
        <article className="card"><p className="eyebrow">EVIDENCE MODEL</p><h2>Mastery ≠ confidence.</h2><p>One correct answer can create a high provisional mastery signal but still low confidence. Confidence grows only as evidence accumulates across code, reasoning, transfer and later retention.</p>{completed > 0 && <button className="ghost" onClick={restart}>Reset local progress</button>}</article>
      </section>
      <TrackCompass interest={state.trackInterest} recommendations={recommendations} onChange={updateInterest} />
      <section><div className="section-heading"><div><p className="eyebrow">SKILL GRAPH</p><h2>Uneven is expected.</h2></div><p>Every number below comes from stored challenge evidence. A dash means we genuinely do not know yet.</p></div><div className="skill-grid">{skills.map((skill) => { const item = profile.find((entry) => entry.skillId === skill.id)!; return <article className="skill" key={skill.id}><div className="skill-top"><span>{skill.target}</span><b>{item.mastery === null ? 'UNKNOWN' : `${item.mastery}% · ${item.confidence}% conf.`}</b></div><h3>{skill.name}</h3><p>{skill.description}</p></article> })}</div></section>
    </main>
  )
}

function Diagnostic({ state, onUpdate, onExit, onComplete }: { state: LearnerState; onUpdate: (state: LearnerState) => void; onExit: () => void; onComplete: () => void }) {
  const index = Math.min(state.currentChallengeIndex, diagnosticChallenges.length - 1)
  const challenge = diagnosticChallenges[index]
  const previous = state.attempts.find((attempt) => attempt.challengeId === challenge.id)
  const language = state.languages[challenge.id] ?? challenge.coding?.languages[0] ?? 'typescript'
  const starter = challenge.coding?.starterCode[language] ?? ''
  const answer = state.drafts[challenge.id] ?? previous?.answer ?? starter
  const runs = state.codeRuns[challenge.id] ?? []
  const [running, setRunning] = useState(false)
  const finished = state.currentChallengeIndex >= diagnosticChallenges.length

  if (finished) {
    const objective = state.attempts.filter((attempt) => typeof attempt.objectiveCorrect === 'boolean')
    const correct = objective.filter((attempt) => attempt.objectiveCorrect).length
    const codeRuns = Object.values(state.codeRuns).flat()
    const passingRuns = codeRuns.filter((run) => run.status === 'passed').length
    const tutorReviews = Object.values(state.tutor).reduce((sum, item) => sum + item.evaluations.length, 0)
    return <main className="shell diagnostic-shell"><button className="back" onClick={onExit}>← Dashboard</button><section className="card finish"><p className="eyebrow">BASELINE · EVIDENCE CAPTURED</p><h1>Diagnostic attempt complete.</h1><p>You completed all {diagnosticChallenges.length} alpha challenges.</p><div className="score-row"><div><strong>{correct}/{objective.length}</strong><span>objective checks</span></div><div><strong>{passingRuns}</strong><span>passing code runs</span></div><div><strong>{tutorReviews}</strong><span>tutor evaluations</span></div></div><p className="note">Your baseline now distinguishes mastery from evidence confidence and exposes exactly what evidence each skill value came from.</p><button onClick={onComplete}>Generate my baseline →</button></section></main>
  }

  function setAnswer(value: string) { onUpdate({ ...state, drafts: { ...state.drafts, [challenge.id]: value } }) }
  function setLanguage(nextLanguage: CodeLanguage) { const currentStarter = challenge.coding?.starterCode[language]; const shouldReplace = !state.drafts[challenge.id] || state.drafts[challenge.id] === currentStarter; onUpdate({ ...state, languages: { ...state.languages, [challenge.id]: nextLanguage }, drafts: shouldReplace && challenge.coding ? { ...state.drafts, [challenge.id]: challenge.coding.starterCode[nextLanguage] } : state.drafts }) }
  async function execute() { if (!challenge.coding || !answer.trim()) return; setRunning(true); const result = await runCode(challenge, language, answer); onUpdate({ ...state, codeRuns: { ...state.codeRuns, [challenge.id]: [...runs, result] } }); setRunning(false) }
  function submit(event: FormEvent) { event.preventDefault(); if (!answer.trim()) return; const objectiveCorrect = challenge.type === 'multiple-choice' ? Number(answer) === challenge.correctOption : undefined; const attempt = { challengeId: challenge.id, answer, objectiveCorrect, completedAt: new Date().toISOString() }; const attempts = [...state.attempts.filter((item) => item.challengeId !== challenge.id), attempt]; const xpGain = previous ? 0 : objectiveCorrect === false ? 10 : 25; onUpdate({ ...state, attempts, xp: state.xp + xpGain, currentChallengeIndex: index + 1 }) }

  return <main className="shell diagnostic-shell"><button className="back" onClick={onExit}>← Dashboard</button><div className="diagnostic-progress"><span>Challenge {index + 1} of {diagnosticChallenges.length}</span><div className="progress"><i style={{ width: `${((index + 1) / diagnosticChallenges.length) * 100}%` }} /></div><span>{state.xp} XP</span></div><section className="card challenge-card"><div className="challenge-meta"><span>{challenge.type}</span>{challenge.skills.map((skill) => <span key={skill}>{skill}</span>)}</div><h1>{challenge.title}</h1><p className="scenario">{challenge.scenario}</p><h3>{challenge.prompt}</h3><ChallengeInput challenge={challenge} answer={answer} setAnswer={setAnswer} language={language} setLanguage={setLanguage} running={running} onRun={execute} runs={runs} /><TutorPanel challenge={challenge} answer={answer} state={state} onUpdate={onUpdate} /><div className="evidence"><b>What this is testing</b><span>{challenge.evidence}</span></div><form onSubmit={submit}><button disabled={!answer.trim()}>{index === diagnosticChallenges.length - 1 ? 'Finish diagnostic' : 'Submit & continue'}</button></form></section></main>
}

function ChallengeInput({ challenge, answer, setAnswer, language, setLanguage, running, onRun, runs }: { challenge: Challenge; answer: string; setAnswer: (value: string) => void; language: CodeLanguage; setLanguage: (language: CodeLanguage) => void; running: boolean; onRun: () => void; runs: CodeRunResult[] }) {
  if (challenge.type === 'multiple-choice') return <div className="options">{challenge.options?.map((option, optionIndex) => <label className={answer === String(optionIndex) ? 'selected' : ''} key={option}><input type="radio" name={challenge.id} value={optionIndex} checked={answer === String(optionIndex)} onChange={(event) => setAnswer(event.target.value)} /><span>{option}</span></label>)}</div>
  if (challenge.type === 'coding' && challenge.coding) { const latest = runs.at(-1); return <div className="code-workspace"><div className="code-toolbar"><label>Language<select value={language} onChange={(event) => setLanguage(event.target.value as CodeLanguage)}>{challenge.coding.languages.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><button type="button" className="run-button" disabled={running || !answer.trim()} onClick={onRun}>{running ? 'Running…' : '▶ Run tests'}</button></div><textarea className="code-input" rows={17} value={answer} placeholder={challenge.placeholder} onChange={(event) => setAnswer(event.target.value)} spellCheck={false} />{latest && <RunResult result={latest} />}{runs.length > 1 && <p className="run-history">{runs.length} code runs saved · {runs.filter((run) => run.status === 'passed').length} passing</p>}</div> }
  return <textarea rows={9} value={answer} placeholder={challenge.placeholder} onChange={(event) => setAnswer(event.target.value)} />
}

function RunResult({ result }: { result: CodeRunResult }) { return <div className={`run-result ${result.status}`}><div className="run-summary"><strong>{result.status === 'passed' ? 'All tests passed' : result.status === 'timeout' ? 'Execution timed out' : result.status === 'error' ? 'Could not run' : 'Some tests failed'}</strong><span>{result.durationMs} ms</span></div>{result.error && <pre>{result.error}</pre>}{result.tests.map((test) => <div className="test-row" key={test.name}><span>{test.passed ? '✓' : '×'} {test.name}</span><b>{test.passed ? 'pass' : 'fail'}</b>{!test.passed && test.error && <small>{test.error}</small>}</div>)}</div> }

export default App
