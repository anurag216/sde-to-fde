import { FormEvent, useMemo, useState } from 'react'
import { diagnosticChallenges } from './data/diagnostic'
import { skills } from './data/skills'
import type { Attempt, Challenge, LearnerState } from './domain'
import { emptyState, loadState, resetState, saveState } from './lib/progress'

type View = 'dashboard' | 'diagnostic'

function App() {
  const [view, setView] = useState<View>('dashboard')
  const [state, setState] = useState<LearnerState>(() => loadState())

  function update(next: LearnerState) {
    setState(next)
    saveState(next)
  }

  function startDiagnostic() {
    setView('diagnostic')
  }

  function restart() {
    resetState()
    setState(emptyState)
    setView('dashboard')
  }

  const completed = state.attempts.length
  const completion = Math.round((completed / diagnosticChallenges.length) * 100)

  if (view === 'diagnostic') {
    return (
      <Diagnostic
        state={state}
        onUpdate={update}
        onExit={() => setView('dashboard')}
      />
    )
  }

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">CAREER ALPHA · 0.1</p>
          <h1>SDE <span>→</span> FDE</h1>
          <p className="lede">
            Build the missing engineering depth without pretending your existing experience counts for nothing.
          </p>
        </div>
        <div className="level-card">
          <span>Current evidence</span>
          <strong>{completed}/{diagnosticChallenges.length}</strong>
          <small>diagnostic challenges attempted</small>
        </div>
      </header>

      <section className="north-star card">
        <div>
          <p className="eyebrow">NORTH STAR</p>
          <h2>Become better at doing engineering, not consuming courses.</h2>
        </div>
        <p>Problem → attempt → failure → hint → discovery → explanation → repetition → mastery.</p>
      </section>

      <section className="grid two">
        <article className="card mission-card">
          <p className="eyebrow">YOUR NEXT MOVE</p>
          <h2>{completion === 100 ? 'Diagnostic evidence captured' : 'Establish your engineering baseline'}</h2>
          <p>
            The diagnostic mixes practical backend, DSA, database, AI and FDE scenarios. Formal terminology helps, but practical reasoning counts.
          </p>
          <div className="progress"><i style={{ width: `${completion}%` }} /></div>
          <div className="row">
            <strong>{completion}%</strong>
            <button onClick={startDiagnostic}>{completed ? 'Continue diagnostic' : 'Start diagnostic'}</button>
          </div>
        </article>

        <article className="card">
          <p className="eyebrow">DESIGN RULE</p>
          <h2>No fake mastery.</h2>
          <p>
            Alpha 0.1 records your attempts and objectively scores only questions that actually have deterministic answers. Free-response and coding evidence stays unscored until a real evaluator is wired.
          </p>
          {completed > 0 && <button className="ghost" onClick={restart}>Reset local progress</button>}
        </article>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">SKILL GRAPH</p>
            <h2>Uneven is expected.</h2>
          </div>
          <p>We will replace “unknown” with evidence-backed mastery as you use the platform.</p>
        </div>
        <div className="skill-grid">
          {skills.map((skill) => (
            <article className="skill" key={skill.id}>
              <div className="skill-top"><span>{skill.target}</span><b>UNKNOWN</b></div>
              <h3>{skill.name}</h3>
              <p>{skill.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function Diagnostic({ state, onUpdate, onExit }: { state: LearnerState; onUpdate: (state: LearnerState) => void; onExit: () => void }) {
  const index = Math.min(state.currentChallengeIndex, diagnosticChallenges.length - 1)
  const challenge = diagnosticChallenges[index]
  const previous = state.attempts.find((a) => a.challengeId === challenge.id)
  const [answer, setAnswer] = useState(previous?.answer ?? '')
  const finished = state.attempts.length >= diagnosticChallenges.length

  const objectiveResult = useMemo(() => {
    if (challenge.type !== 'multiple-choice' || !previous) return undefined
    return previous.objectiveCorrect
  }, [challenge, previous])

  if (finished) {
    const objective = state.attempts.filter((a) => typeof a.objectiveCorrect === 'boolean')
    const correct = objective.filter((a) => a.objectiveCorrect).length
    return (
      <main className="shell diagnostic-shell">
        <button className="back" onClick={onExit}>← Dashboard</button>
        <section className="card finish">
          <p className="eyebrow">BASELINE · EVIDENCE CAPTURED</p>
          <h1>Diagnostic attempt complete.</h1>
          <p>You completed all {diagnosticChallenges.length} alpha challenges.</p>
          <div className="score-row">
            <div><strong>{correct}/{objective.length}</strong><span>objective checks</span></div>
            <div><strong>{state.xp} XP</strong><span>earned</span></div>
            <div><strong>{state.attempts.length}</strong><span>attempts stored</span></div>
          </div>
          <p className="note">Free-response and coding answers are intentionally awaiting a real evaluator. The next build will turn these attempts into an evidence-backed skill profile and personalized roadmap.</p>
        </section>
      </main>
    )
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!answer.trim()) return

    const objectiveCorrect = challenge.type === 'multiple-choice'
      ? Number(answer) === challenge.correctOption
      : undefined

    const attempt: Attempt = {
      challengeId: challenge.id,
      answer,
      objectiveCorrect,
      completedAt: new Date().toISOString(),
    }

    const attempts = [...state.attempts.filter((a) => a.challengeId !== challenge.id), attempt]
    const xpGain = previous ? 0 : objectiveCorrect === false ? 10 : 25
    const nextIndex = Math.min(index + 1, diagnosticChallenges.length)

    onUpdate({ ...state, attempts, xp: state.xp + xpGain, currentChallengeIndex: nextIndex })
    setAnswer('')
  }

  return (
    <main className="shell diagnostic-shell">
      <button className="back" onClick={onExit}>← Dashboard</button>
      <div className="diagnostic-progress">
        <span>Challenge {index + 1} of {diagnosticChallenges.length}</span>
        <div className="progress"><i style={{ width: `${((index + 1) / diagnosticChallenges.length) * 100}%` }} /></div>
        <span>{state.xp} XP</span>
      </div>

      <section className="card challenge-card">
        <div className="challenge-meta">
          <span>{challenge.type}</span>
          {challenge.skills.map((skill) => <span key={skill}>{skill}</span>)}
        </div>
        <h1>{challenge.title}</h1>
        <p className="scenario">{challenge.scenario}</p>
        <h3>{challenge.prompt}</h3>
        <ChallengeInput challenge={challenge} answer={answer} setAnswer={setAnswer} />
        {objectiveResult !== undefined && (
          <p className={objectiveResult ? 'result good' : 'result bad'}>
            {objectiveResult ? 'Correct — that is the strongest starting approach.' : 'Not quite. Keep the attempt; later remediation should revisit the underlying concept.'}
          </p>
        )}
        <div className="evidence"><b>What this is testing</b><span>{challenge.evidence}</span></div>
        <form onSubmit={submit}>
          <button disabled={!answer.trim()}>{index === diagnosticChallenges.length - 1 ? 'Finish diagnostic' : 'Submit & continue'}</button>
        </form>
      </section>
    </main>
  )
}

function ChallengeInput({ challenge, answer, setAnswer }: { challenge: Challenge; answer: string; setAnswer: (value: string) => void }) {
  if (challenge.type === 'multiple-choice') {
    return (
      <div className="options">
        {challenge.options?.map((option, optionIndex) => (
          <label className={answer === String(optionIndex) ? 'selected' : ''} key={option}>
            <input type="radio" name={challenge.id} value={optionIndex} checked={answer === String(optionIndex)} onChange={(e) => setAnswer(e.target.value)} />
            <span>{option}</span>
          </label>
        ))}
      </div>
    )
  }

  return (
    <textarea
      className={challenge.type === 'coding' ? 'code-input' : ''}
      rows={challenge.type === 'coding' ? 15 : 9}
      value={answer}
      placeholder={challenge.placeholder}
      onChange={(e) => setAnswer(e.target.value)}
    />
  )
}

export default App
