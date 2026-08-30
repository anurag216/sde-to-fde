import { skills } from '../data/skills'
import type { SkillProfile } from '../domain'

function statusLabel(value: SkillProfile['gaps']['design']) {
  return value === 'evidenced' ? 'gap seen' : value === 'not-evidenced' ? 'no gap seen' : 'not tested'
}

export function SkillProfileView({ profile, onBack, onRoadmap }: { profile: SkillProfile[]; onBack: () => void; onRoadmap: () => void }) {
  return (
    <main className="shell profile-shell">
      <div className="view-nav"><button className="back" onClick={onBack}>← Dashboard</button><button onClick={onRoadmap}>View 4-week roadmap →</button></div>
      <header className="view-header"><p className="eyebrow">EVIDENCE-BACKED BASELINE</p><h1>Your skill profile</h1><p>Mastery and confidence are deliberately separate. A high score with thin evidence stays low-confidence until the concept survives different contexts and delayed review.</p></header>
      <div className="profile-grid">
        {profile.map((item) => {
          const skill = skills.find((entry) => entry.id === item.skillId)!
          return <article className="profile-card" key={item.skillId}>
            <div className="profile-card-head"><div><small>{skill.target}</small><h2>{skill.name}</h2></div><strong>{item.mastery === null ? '—' : `${item.mastery}%`}</strong></div>
            <div className="confidence-line"><span>Evidence confidence</span><b>{item.confidence}%</b></div><div className="mini-progress"><i style={{ width: `${item.confidence}%` }} /></div>
            <div className="gap-grid"><span>Implementation <b>{statusLabel(item.gaps.implementation)}</b></span><span>Vocabulary <b>{statusLabel(item.gaps.vocabulary)}</b></span><span>Design <b>{statusLabel(item.gaps.design)}</b></span><span>Retention <b>{statusLabel(item.gaps.retention)}</b></span></div>
            <details><summary>{item.evidence.length} evidence item{item.evidence.length === 1 ? '' : 's'}</summary>{item.evidence.length ? <ul className="evidence-list">{item.evidence.map((evidence) => <li key={evidence.id}><b>{evidence.kind}</b><span>{evidence.detail}</span></li>)}</ul> : <p className="empty-copy">No scored evidence yet. The roadmap will create it rather than assume weakness.</p>}</details>
          </article>
        })}
      </div>
    </main>
  )
}
