import type { LearnerState, ReviewRating } from '../domain'
import { completeReview, getReviewQueue } from '../lib/retention'

export function ReviewQueue({ state, onUpdate, onOpen }: { state: LearnerState; onUpdate: (state: LearnerState) => void; onOpen: (id: string) => void }) {
  const due = getReviewQueue(state)
  if (!due.length) return <section className="card review-queue calm"><div><p className="eyebrow">RETENTION QUEUE</p><h2>Nothing due right now.</h2></div><p>Completed coding and design missions reappear after a delay. Reviews only count after you re-prove the skill with a fresh passing run or evaluator review.</p></section>

  function rate(challengeId: string, rating: ReviewRating) { onUpdate(completeReview(state, challengeId, rating)) }

  return <section className="review-queue">
    <div className="section-heading"><div><p className="eyebrow">RETENTION QUEUE</p><h2>{due.length} active-recall review{due.length === 1 ? '' : 's'} due</h2></div><p>Re-solve first. Then rate how hard recall felt; that rating changes the next interval.</p></div>
    <div className="review-grid">{due.map((item) => <article className={item.evidenceReady ? 'review-card ready' : 'review-card'} key={item.challenge.id}>
      <div className="review-meta"><span>{item.reviewCount ? `review #${item.reviewCount + 1}` : 'first review'}</span><span>{item.overdueDays ? `${item.overdueDays}d overdue` : 'due today'}</span></div>
      <h3>{item.challenge.title}</h3>
      <p>{item.evidenceReady ? 'Fresh evidence detected. Rate the recall before moving on.' : 'Open the mission and re-prove it without relying on your old answer.'}</p>
      {!item.evidenceReady && <button onClick={() => onOpen(item.challenge.id)}>Re-prove mission →</button>}
      {item.evidenceReady && <div className="rating-row">
        <button className="ghost" onClick={() => rate(item.challenge.id, 'hard')}>Hard</button>
        <button className="ghost" onClick={() => rate(item.challenge.id, 'okay')}>Okay</button>
        <button onClick={() => rate(item.challenge.id, 'easy')}>Easy</button>
      </div>}
    </article>)}</div>
  </section>
}
