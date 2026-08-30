import { yearJourney } from '../data/yearJourney'

export function YearJourney() {
  return <section className="year-journey">
    <div className="year-intro card">
      <div>
        <p className="eyebrow">52-WEEK COMPASS</p>
        <h2>One year. Four quarters. Adaptive four-week cycles.</h2>
      </div>
      <p>The year map gives direction, not homework. Your four-week roadmap is regenerated from evidence, so demonstrated strengths can move faster and weak concepts can resurface. You are never forced through beginner content just because it appears earlier on the map.</p>
    </div>
    <div className="quarter-grid">
      {yearJourney.map((quarter, index) => <article className={`quarter-card ${index === 0 ? 'current' : ''}`} key={quarter.quarter}>
        <div className="quarter-heading">
          <div><span>QUARTER {quarter.quarter}</span><small>Weeks {quarter.weeks[0]}–{quarter.weeks[1]}</small></div>
          {index === 0 && <b>CURRENT STARTING PHASE</b>}
        </div>
        <h2>{quarter.title}</h2>
        <p>{quarter.purpose}</p>
        <div className="leverage-note"><strong>Existing experience → leverage</strong><span>{quarter.leverage}</span></div>
        <div className="journey-cycles">
          {quarter.cycles.map((cycle) => <div className="journey-cycle" key={`${quarter.quarter}-${cycle.weeks[0]}`}>
            <div><span>W{cycle.weeks[0]}{cycle.weeks[1] !== cycle.weeks[0] ? `–${cycle.weeks[1]}` : ''}</span><strong>{cycle.title}</strong></div>
            <p>{cycle.focus.join(' · ')}</p>
            <ul>{cycle.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
          </div>)}
        </div>
        <div className="boss-card">
          <span>QUARTER BOSS</span>
          <strong>{quarter.bossOutcome}</strong>
          <small>Proof: {quarter.proof.join(' · ')}</small>
        </div>
      </article>)}
    </div>
  </section>
}
