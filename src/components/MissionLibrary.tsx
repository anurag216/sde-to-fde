import { learningChallenges } from '../data/learningChallenges'
import type { LearnerState } from '../domain'

export function MissionLibrary({ state, onBack, onOpen }: { state: LearnerState; onBack: () => void; onOpen: (id: string) => void }) {
  const completed = new Set(state.missionCompletions.map((item) => item.challengeId))
  const engineering = learningChallenges.filter((item) => !item.id.startsWith('dsa-'))
  const dsa = learningChallenges.filter((item) => item.id.startsWith('dsa-'))
  return <main className="shell mission-shell">
    <div className="view-nav"><button className="back" onClick={onBack}>← Dashboard</button><span className="library-count">{completed.size}/{learningChallenges.length} completed</span></div>
    <header className="view-header"><p className="eyebrow">MISSION LIBRARY</p><h1>Learn by doing.</h1><p>Every mission is an engineering rep, not a lecture. Coding missions require passing tests; design missions require an evaluated attempt; objective missions require the correct decision.</p></header>
    <MissionSection title="Engineering missions" items={engineering} completed={completed} onOpen={onOpen} />
    <MissionSection title="DSA reinforcement" items={dsa} completed={completed} onOpen={onOpen} />
  </main>
}

function MissionSection({ title, items, completed, onOpen }: { title: string; items: typeof learningChallenges; completed: Set<string>; onOpen: (id: string) => void }) {
  return <section className="mission-section"><div className="section-heading"><div><h2>{title}</h2></div><p>{items.filter((item)=>completed.has(item.id)).length}/{items.length} complete</p></div><div className="mission-grid">{items.map((challenge)=><article className={completed.has(challenge.id)?'mission-tile complete':'mission-tile'} key={challenge.id}><div className="mission-tile-meta"><span>{challenge.type}</span><span>{completed.has(challenge.id)?'✓ complete':'open'}</span></div><h3>{challenge.title}</h3><p>{challenge.scenario}</p><div className="mission-skill-tags">{challenge.skills.map((skill)=><span key={skill}>{skill}</span>)}</div><button onClick={()=>onOpen(challenge.id)}>{completed.has(challenge.id)?'Revisit':'Start mission'} →</button></article>)}</div></section>
}
