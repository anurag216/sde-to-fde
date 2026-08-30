# Evidence-backed mastery

The platform must not turn a biography or self-rating into fake precision.

## Mastery

A skill mastery value is calculated only from scored evidence:

- deterministic objective checks
- deterministic code execution
- tutor skill signals (semantic AI evaluation receives more weight than the local keyword fallback)

If there is no scored evidence, mastery is `unknown` rather than `0%`.

## Confidence

Confidence is separate from mastery. One correct check can produce a high provisional mastery value while confidence remains low. Confidence grows as more independent evidence accumulates.

Assistance usage reduces the weight of an evidence item progressively, but using hints is never treated as failure.

## Gap types

The alpha separately tracks whether current evidence suggests:

- implementation gap
- CS/formal-vocabulary gap
- design/reasoning gap
- retention gap

Retention remains unknown until a concept is resurfaced after a delay.

## Career compass

Track recommendations combine:

- 65% learner interest
- 35% confidence-adjusted related skill evidence

Low-confidence mastery is pulled toward a neutral midpoint so one diagnostic cannot prematurely lock the learner into or out of a career path.

## Roadmap

The first four-week roadmap is regenerated from the evidence profile and career interests. Each week contains three engineering missions and two DSA reps. Week four also adds delayed resurfacing of an early mission to begin collecting retention evidence.
