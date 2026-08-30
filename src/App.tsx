import { FormEvent, useState } from 'react'
import { diagnosticChallenges } from './data/diagnostic'
import { skills } from './data/skills'
import type { Challenge, CodeLanguage, CodeRunResult, LearnerState } from './domain'
import { runCode } from './lib/codeRunner'
import { emptyState, loadState, resetState, saveState } from './lib/progress'

type View = 'dashboard' | 'diagnostic'

function App() {
  const [view, setView] = useState<View>('dashboard')
  const [state, setState] = useState<LearnerState>(() => loadState())

  function update(next: LearnerState) {
    setState(next)
    saveState(next)
  }

  function restart() {
    resetState()
    setState(emptyState)
    setView('dashboard')
  }

  const completed = state.attempts.length
  const completion = Math.round((completed / diagnosticChallenges.length) * 100)

  if (view === 'diagnostic') {
    return <Diagnostic state={state} onUpdate={update} onExit={() => setView('dashboard')} />
  }

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">CAREER ALPHA · 0.2</p>
          <h1>SDE <span>→</span> FDE</h1>
          <p className="lede">Build the missing engineering depth without pretending your existing experience counts for nothing.</p>
        </div>
        <div className="level-card"><span>Current evidence</span><strong>{completed}/{diagnosticChallenges.length}</strong><small>diagnostic challenges attempted</small></div>
      </header>

      <section className="north-star card">
        <div><p className="eyebrow">NORTH STAR</p><h2>Become better at doing engineering, not consuming courses.</h2></div>
        <p>Problem → attempt → failure → hint → discovery → explanation → repetition → mastery.</p>
      </section>

      <section className="grid two">
        <article className="card mission-card">
          <p className="eyebrow">YOUR NEXT MOVE</p>
          <h2>{completion === 100 ? 'Diagnostic evidence captured' : 'Establish your engineering baseline'}</h2>
          <p>The diagnostic mixes practical backend, DSA, database, AI and FDE scenarios. Coding challenges now execute against deterministic tests in an isolated browser worker.</p>
          <div className="progress"><i style={{ width: `${completion}%` }} /></div>
          <div className="row"><strong>{completion}%</strong><button onClick={() => setView('diagnostic')}>{completed ? 'Continue diagnostic' : 'Start diagnostic'}</button></div>
        </article>
        <article className="card">
          <p className="eyebrow">EVIDENCE, NOT VIBES</p>
          <h2>Run code. See failures. Try again.</h2>
          <p>TypeScript/JavaScript execute in a disposable Web Worker. Python runs through Pyodide in a disposable worker. Every run and test result is saved locally as learning evidence.</p>
          {completed > 0 && <button className="ghost" onClick={restart}>Reset local progress</button>}
        </article>
      </section>

      <section>
        <div className="section-heading"><div><p className="eyebrow">SKILL GRAPH</p><h2>Uneven is expected.</h2></div><p>We replace “unknown” only with evidence-backed mastery as you use the platform.</p></div>
        <div className="skill-grid">{skills.map((skill) => <article className="skill" key={skill.id}><div className="skill-top"><span>{skill.target}</span><b>UNKNOWN</b></div><h3>{skill.name}</h3><p>{skill.description}</p></article>)}</div>
      </section>
    </main>
  )
}

function Diagnostic({ state, onUpdate, onExit }: { state: LearnerState; onUpdate: (state: LearnerState) => void; onExit: () => void }) {
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
    return (
      <main className="shell diagnostic-shell">
        <button className="back" onClick={onExit}>← Dashboard</button>
        <section className="card finish">
          <p className="eyebrow">BASELINE · EVIDENCE CAPTURED</p>
          <h1>Diagnostic attempt complete.</h1>
          <p>You completed all {diagnosticChallenges.length} alpha challenges.</p>
          <div className="score-row">
            <div><strong>{correct}/{objective.length}</strong><span>objective checks</span></div>
            <div><strong>{passingRuns}</strong><span>passing code runs</span></div>
            <div><strong>{state.xp} XP</strong><span>earned</span></div>
          </div>
          <p className="note">Code execution is now real. Free-response/design evaluation and progressive tutor hints are the next evidence layer.</p>
        </section>
      </main>
    )
  }

  function setAnswer(value: string) {
    onUpdate({ ...state, drafts: { ...state.drafts, [challenge.id]: value } })
  }

  function setLanguage(nextLanguage: CodeLanguage) {
    const currentStarter = challenge.coding?.starterCode[language]
    const shouldReplace = !state.drafts[challenge.id] || state.drafts[challenge.id] === currentStarter
    onUpdate({
      ...state,
      languages: { ...state.languages, [challenge.id]: nextLanguage },
      drafts: shouldReplace && challenge.coding
        ? { ...state.drafts, [challenge.id]: challenge.coding.starterCode[nextLanguage] }
        : state.drafts,
    })
  }

  async function execute() {
    if (!challenge.coding || !answer.trim()) return
    setRunning(true)
    const result = await runCode(challenge, language, answer)
    const history = [...runs, result]
    onUpdate({ ...state, codeRuns: { ...state.codeRuns, [challenge.id]: history } })
    setRunning(false)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!answer.trim()) return
    const objectiveCorrect = challenge.type === 'multiple-choice' ? Number(answer) === challenge.correctOption : undefined
    const attempt = { challengeId: challenge.id, answer, objectiveCorrect, completedAt: new Date().toISOString() }
    const attempts = [...state.attempts.filter((item) => item.challengeId !== challenge.id), attempt]
    const xpGain = previous ? 0 : objectiveCorrect === false ? 10 : 25
    onUpdate({ ...state, attempts, xp: state.xp + xpGain, currentChallengeIndex: index + 1 })
  }

  return (
    <main className="shell diagnostic-shell">
      <button className="back" onClick={onExit}>← Dashboard</button>
      <div className="diagnostic-progress"><span>Challenge {index + 1} of {diagnosticChallenges.length}</span><div className="progress"><i style={{ width: `${((index + 1) / diagnosticChallenges.length) * 100}%` }} /></div><span>{state.xp} XP</span></div>
      <section className="card challenge-card">
        <div className="challenge-meta"><span>{challenge.type}</span>{challenge.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
        <h1>{challenge.title}</h1>
        <p className="scenario">{challenge.scenario}</p>
        <h3>{challenge.prompt}</h3>
        <ChallengeInput challenge={challenge} answer={answer} setAnswer={setAnswer} language={language} setLanguage={setLanguage} running={running} onRun={execute} runs={runs} />
        <div className="evidence"><b>What this is testing</b><span>{challenge.evidence}</span></div>
        <form onSubmit={submit}><button disabled={!answer.trim()}>{index === diagnosticChallenges.length - 1 ? 'Finish diagnostic' : 'Submit & continue'}</button></form>
      </section>
    </main>
  )
}

function ChallengeInput({ challenge, answer, setAnswer, language, setLanguage, running, onRun, runs }: {
  challenge: Challenge; answer: string; setAnswer: (value: string) => void; language: CodeLanguage; setLanguage: (language: CodeLanguage) => void; running: boolean; onRun: () => void; runs: CodeRunResult[]
}) {
  if (challenge.type === 'multiple-choice') {
    return <div className="options">{challenge.options?.map((option, optionIndex) => <label className={answer === String(optionIndex) ? 'selected' : ''} key={option}><input type="radio" name={challenge.id} value={optionIndex} checked={answer === String(optionIndex)} onChange={(event) => setAnswer(event.target.value)} /><span>{option}</span></label>)}</div>
  }

  if (challenge.type === 'coding' && challenge.coding) {
    const latest = runs.at(-1)
    return (
      <div className="code-workspace">
        <div className="code-toolbar">
          <label>Language<select value={language} onChange={(event) => setLanguage(event.target.value as CodeLanguage)}>{challenge.coding.languages.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <button type="button" className="run-button" disabled={running || !answer.trim()} onClick={onRun}>{running ? 'Running…' : '▶ Run tests'}</button>
        </div>
        <textarea className="code-input" rows={17} value={answer} placeholder={challenge.placeholder} onChange={(event) => setAnswer(event.target.value)} spellCheck={false} />
        {latest && <RunResult result={latest} />}
        {runs.length > 1 && <p className="run-history">{runs.length} code runs saved · {runs.filter((run) => run.status === 'passed').length} passing</p>}
      </div>
    )
  }

  return <textarea rows={9} value={answer} placeholder={challenge.placeholder} onChange={(event) => setAnswer(event.target.value)} />
}

function RunResult({ result }: { result: CodeRunResult }) {
  return (
    <div className={`run-result ${result.status}`}>
      <div className="run-summary"><strong>{result.status === 'passed' ? 'All tests passed' : result.status === 'timeout' ? 'Execution timed out' : result.status === 'error' ? 'Could not run' : 'Some tests failed'}</strong><span>{result.durationMs} ms</span></div>
      {result.error && <pre>{result.error}</pre>}
      {result.tests.map((test) => <div className="test-row" key={test.name}><span>{test.passed ? '✓' : '×'} {test.name}</span><b>{test.passed ? 'pass' : 'fail'}</b>{!test.passed && test.error && <small>{test.error}</small>}</div>)}
    </div>
  )
}

export default App
