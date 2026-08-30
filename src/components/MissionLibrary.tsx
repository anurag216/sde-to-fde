import { learningChallenges } from '../data/learningChallenges'
import type { LearnerState } from '../domain'
import { BossLibrary } from './BossLibrary'
import { ReviewQueue } from './ReviewQueue'

export function MissionLibrary({ state, onUpdate, onBack, onOpen }: { state: LearnerState; onUpdate: (state: LearnerState) => void; onBack: () => void; onOpen: (id: string) => void }) {
  const completed = new Set(state.missionCompletions.map((item) => item.challengeId))
  const engineering = learningChallenges.filter((item) => !item.id.startsWith('dsa-'))
  const dsa = learningChallenges.filter((item) => item.id.startsWith('dsa-'))
  return <main className="shell mission-shell">
    <div className="view-nav"><button className="back" onClick={onBack}>← Dashboard</button><span className="library-count">{completed.size}/{learningChallenges.length} core missions completed · {state.reviewCompletions.length} delayed reviews</span></div>
    <header className="view-header"><p className="eyebrow">ENGINEERING GYM</p><h1>Learn. Prove. Forget a little. Prove it again.</h1><p>Core missions build the skill, delayed reviews test retention, and boss missions force several skills to survive changing constraints.</p></header>
    <ReviewQueue state={state} onUpdate={onUpdate} onOpen={onOpen} />
    <BossLibrary state={state} onOpen={onOpen} />
    <MissionSection title="Engineering missions" items={engineering} completed={completed} onOpen={onOpen} />
    <MissionSection title="DSA reinforcement" items={dsa} completed={completed} onOpen={onOpen} />
  </main>
}

function MissionSection({ title, items, completed, onOpen }: { title: string; items: typeof learningChallenges; completed: Set<string>; onOpen: (id: string) => void }) {
  return <section className="mission-section"><div className="section-heading"><div><h2>{title}</h2></div><p>{items.filter((item)=>completed.has(item.id)).length}/{items.length} complete</p></div><div className="mission-grid">{items.map((challenge)=><article className={completed.has(challenge.id)?'mission-tile complete':'mission-tile'} key={challenge.id}><div className="mission-tile-meta"><span>{challenge.type}</span><span>{completed.has(challenge.id)?'✓ complete':'open'}</span></div><h3>{challenge.title}</h3><p>{challenge.scenario}</p><div className="mission-skill-tags">{challenge.skills.map((skill)=><span key={skill}>{skill}</span>)}</div><button onClick={()=>onOpen(challenge.id)}>{completed.has(challenge.id)?'Revisit':'Start mission'} →</button></article>)}</div></section>
}
