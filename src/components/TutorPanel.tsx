import { useState } from 'react'
import type { AssistanceLevel, Challenge, LearnerState } from '../domain'
import { evaluateAnswer, requestHint } from '../lib/tutor'

export function TutorPanel({ challenge, answer, state, onUpdate }: {
  challenge: Challenge
  answer: string
  state: LearnerState
  onUpdate: (state: LearnerState) => void
}) {
  const evidence = state.tutor[challenge.id] ?? { evaluations: [], hints: [] }
  const latest = evidence.evaluations.at(-1)
  const [busy, setBusy] = useState<'evaluate' | 'hint' | null>(null)
  const nextLevel = Math.min(evidence.hints.length + 1, 6) as AssistanceLevel
  const canHint = answer.trim().length > 0 && evidence.hints.length < 6

  async function evaluate() {
    if (!answer.trim()) return
    setBusy('evaluate')
    const evaluation = await evaluateAnswer(challenge, answer)
    onUpdate({
      ...state,
      tutor: { ...state.tutor, [challenge.id]: { ...evidence, evaluations: [...evidence.evaluations, evaluation] } },
    })
    setBusy(null)
  }

  async function hint() {
    if (!canHint) return
    setBusy('hint')
    const result = await requestHint(challenge, answer, nextLevel)
    onUpdate({
      ...state,
      tutor: { ...state.tutor, [challenge.id]: { ...evidence, hints: [...evidence.hints, result] } },
    })
    setBusy(null)
  }

  return (
    <section className="tutor-panel">
      <div className="tutor-heading">
        <div><span className="tutor-orb">AI</span><div><strong>Engineering tutor</strong><small>Attempts first. Answers last.</small></div></div>
        <div className="tutor-actions">
          <button type="button" className="ghost" disabled={!answer.trim() || busy !== null} onClick={evaluate}>{busy === 'evaluate' ? 'Evaluating…' : 'Evaluate attempt'}</button>
          <button type="button" className="hint-button" disabled={!canHint || busy !== null} onClick={hint}>{busy === 'hint' ? 'Thinking…' : evidence.hints.length < 6 ? `Hint ${nextLevel}/6` : 'Hints exhausted'}</button>
        </div>
      </div>

      {evidence.hints.length > 0 && <div className="hint-stack">{evidence.hints.map((item) => <article key={item.id}><div><b>Hint {item.level}</b><span>{item.source === 'ai' ? 'AI' : 'pre-authored fallback'}</span></div><p>{item.text}</p></article>)}</div>}

      {latest && (
        <article className="evaluation-card">
          <div className="evaluation-head"><strong>{latest.source === 'ai' ? 'AI evaluation' : 'Offline rubric check'}</strong><span>{latest.source === 'ai' ? 'semantic review' : 'provisional'}</span></div>
          <p>{latest.summary}</p>
          <div className="evaluation-grid">
            <div><b>Strengths</b>{latest.strengths.length ? <ul>{latest.strengths.map((item) => <li key={item}>{item}</li>)}</ul> : <small>No strong evidence identified yet.</small>}</div>
            <div><b>Gaps</b>{latest.gaps.length ? <ul>{latest.gaps.map((item) => <li key={item}>{item}</li>)}</ul> : <small>No major gap identified from this attempt.</small>}</div>
          </div>
          {latest.terminology.length > 0 && <p className="term-line"><b>Vocabulary:</b> {latest.terminology.join(' · ')}</p>}
          <div className="signal-row">{latest.signals.map((signal) => <span className={`signal ${signal.signal}`} title={signal.rationale} key={signal.skill}>{signal.skill}: {signal.signal}</span>)}</div>
          <p className="next-question"><b>Think next:</b> {latest.nextQuestion}</p>
        </article>
      )}
    </section>
  )
}
