import type { ProgressSummary } from '../lib/gamification'

export function ProgressPanel({ summary }: { summary: ProgressSummary }) {
  const earned=summary.badges.filter((badge)=>badge.earned)
  return <section className="progress-panel"><article><span>LEVEL</span><strong>{summary.level}</strong><small>{summary.xp} total XP</small></article><article className="level-progress"><div><span>NEXT LEVEL</span><b>{summary.xpIntoLevel}/{summary.xpForNextLevel} XP</b></div><div className="progress"><i style={{width:`${(summary.xpIntoLevel/summary.xpForNextLevel)*100}%`}}/></div><small>{summary.completed}/{summary.total} learning missions complete</small></article><article><span>STREAK</span><strong>{summary.streak}</strong><small>active learning day{summary.streak===1?'':'s'}</small></article><article className="badge-summary"><span>BADGES</span><strong>{earned.length}/{summary.badges.length}</strong><div>{summary.badges.map((badge)=><i className={badge.earned?'earned':''} title={`${badge.name}: ${badge.description}`} key={badge.id}>{badge.name.slice(0,1)}</i>)}</div></article></section>
}
