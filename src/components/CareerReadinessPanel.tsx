import type { LearnerState, SkillProfile } from '../domain'
import { buildCareerReadiness } from '../lib/readiness'

export function CareerReadinessPanel({ state, profile }: { state: LearnerState; profile: SkillProfile[] }) {
  const areas = buildCareerReadiness(state, profile)
  return <section className="readiness-panel">
    <div className="section-heading"><div><p className="eyebrow">NEXT-ROLE READINESS</p><h2>Evidence, not one fake score.</h2></div><p>Unknown means we have not tested it yet. Building means evidence exists but is still thin. Evidenced requires repeated, higher-confidence proof.</p></div>
    <div className="readiness-grid">{areas.map((area) => <article className={`readiness-card ${area.status}`} key={area.id}>
      <div className="readiness-top"><span>{area.status}</span><b>{area.status === 'unknown' ? '—' : `${area.confidence}% evidence confidence`}</b></div>
      <h3>{area.title}</h3><p>{area.description}</p>
      <div className="readiness-count"><strong>{area.evidenceCount}</strong><span>stored proof point{area.evidenceCount === 1 ? '' : 's'}</span></div>
      {area.evidence.length > 0 && <details><summary>Show evidence</summary><ul>{area.evidence.map((item) => <li key={item}>{item}</li>)}</ul></details>}
    </article>)}</div>
  </section>
}
