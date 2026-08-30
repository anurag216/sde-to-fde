import { learningChallengeIds } from '../data/learningChallenges'
import type { RoadmapWeek } from '../domain'
import { YearJourney } from './YearJourney'

export function RoadmapView({ weeks, onBack, onProfile, onOpenMission }: { weeks: RoadmapWeek[]; onBack: () => void; onProfile: () => void; onOpenMission: (id:string)=>void }) {
  return <main className="shell roadmap-shell">
    <div className="view-nav"><button className="back" onClick={onBack}>← Dashboard</button><button className="ghost" onClick={onProfile}>Inspect skill evidence</button></div>
    <header className="view-header"><p className="eyebrow">ADAPTIVE 4-WEEK CYCLE</p><h1>Your next engineering reps</h1><p>This short cycle is generated from current evidence + career interests. It deliberately mixes real engineering missions with exactly two DSA reps per week, then resurfaces an earlier concept in week four. The 52-week map below is the compass; this four-week cycle is the route you actually execute.</p></header>
    <div className="weeks">{weeks.map((week)=><section className="week-card" key={week.week}><div className="week-title"><span>WEEK {week.week}</span><h2>{week.theme}</h2></div><div className="roadmap-items">{week.items.map((item)=><article key={item.id}><div className="roadmap-meta"><span>{item.kind}</span><span>{item.minutes} min</span>{item.skills.map((skill)=><span key={skill}>{skill}</span>)}</div><h3>{item.title}</h3><p>{item.outcome}</p><small><b>Why now:</b> {item.why}</small>{learningChallengeIds.has(item.id)&&<button className="roadmap-start" onClick={()=>onOpenMission(item.id)}>Start mission →</button>}</article>)}</div></section>)}</div>
    <YearJourney />
  </main>
}
