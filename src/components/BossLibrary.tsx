import { bossChallenges, bosses, bossStageUnlocked } from '../data/bossChallenges'
import type { LearnerState } from '../domain'

export function BossLibrary({ state, onOpen }: { state: LearnerState; onOpen: (id: string) => void }) {
  const completed = new Set(state.missionCompletions.map((item) => item.challengeId))
  return <section className="boss-library">
    <div className="section-heading"><div><p className="eyebrow">BOSS MISSIONS</p><h2>Design → build → survive the new constraint.</h2></div><p>Each boss reveals stages sequentially. You cannot solve the whole case from the prompt because production rarely gives you every constraint upfront.</p></div>
    <div className="boss-grid">{bosses.map((boss) => <article className="boss-tile" key={boss.id}>
      <div className="boss-track"><span>{boss.track}</span><b>{boss.stageIds.filter((id) => completed.has(id)).length}/3 stages</b></div>
      <h3>{boss.title}</h3><p>{boss.description}</p>
      <div className="boss-stages">{boss.stageIds.map((id, index) => {
        const challenge = bossChallenges.find((item) => item.id === id)!
        const unlocked = bossStageUnlocked(state, boss, index)
        const done = completed.has(id)
        return <div className={done ? 'boss-stage done' : unlocked ? 'boss-stage unlocked' : 'boss-stage locked'} key={id}>
          <span>STAGE {index + 1}</span><strong>{challenge.title.replace(/^Stage \d — /, '')}</strong>
          <button disabled={!unlocked} onClick={() => onOpen(id)}>{done ? 'Revisit' : unlocked ? 'Start' : 'Locked'}</button>
        </div>
      })}</div>
    </article>)}</div>
  </section>
}
