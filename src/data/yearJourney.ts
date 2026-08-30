import type { SkillId, TrackId } from '../domain'

export type JourneyCycle = {
  weeks: [number, number]
  title: string
  focus: string[]
  outcomes: string[]
}

export type JourneyQuarter = {
  quarter: 1 | 2 | 3 | 4
  weeks: [number, number]
  title: string
  purpose: string
  leverage: string
  primarySkills: SkillId[]
  trackExploration: TrackId[]
  cycles: JourneyCycle[]
  bossOutcome: string
  proof: string[]
}

export const yearJourney: JourneyQuarter[] = [
  {
    quarter: 1,
    weeks: [1, 13],
    title: 'Formalize the engineer you already are',
    purpose: 'Turn practical automation intuition into explicit programming, CS, backend, database, and system-design fluency.',
    leverage: 'Reuse your experience with automation frameworks, browser workflows, CI/CD, queues, and production tooling instead of restarting from beginner material.',
    primarySkills: ['programming', 'dsa', 'backend', 'databases', 'system-design'],
    trackExploration: ['backend-platform', 'fde'],
    cycles: [
      {
        weeks: [1, 4],
        title: 'Baseline + programming fluency',
        focus: ['hash-based structures', 'complexity', 'functions and decomposition', 'OOP/composition', 'debugging'],
        outcomes: ['Explain common data structures in engineering language', 'Implement medium-sized functions without relying on generated solutions', 'Diagnose complexity problems in ordinary service code'],
      },
      {
        weeks: [5, 8],
        title: 'Backend and data foundations',
        focus: ['HTTP/APIs', 'PostgreSQL', 'indexes', 'transactions', 'caching', 'error handling'],
        outcomes: ['Design and implement a small API', 'Use query plans and indexes intentionally', 'Explain transaction boundaries and common consistency failures'],
      },
      {
        weeks: [9, 12],
        title: 'Async work and reliability',
        focus: ['queues', 'retries', 'idempotency', 'concurrency', 'observability', 'testing'],
        outcomes: ['Build a retry-safe worker', 'Explain at-least-once delivery and duplicate side effects', 'Debug failures from logs/metrics rather than guesses'],
      },
      {
        weeks: [13, 13],
        title: 'Quarter boss',
        focus: ['build', 'debug', 'design', 'explain'],
        outcomes: ['Ship and defend a small approval-processing backend with API, PostgreSQL, queue semantics, idempotency, tests, and observability'],
      },
    ],
    bossOutcome: 'Build an approval-processing service from scratch and explain every important design choice without hiding behind framework vocabulary.',
    proof: ['working service', 'architecture diagram', 'failure-mode write-up', 'recorded or written design explanation', 'targeted DSA checkpoint'],
  },
  {
    quarter: 2,
    weeks: [14, 26],
    title: 'Become production-dangerous in a good way',
    purpose: 'Deepen platform, distributed-systems, and production judgment so you can own services after they leave your laptop.',
    leverage: 'Connect existing Kubernetes/AWS/deployment exposure to the underlying reliability and distributed-systems concepts.',
    primarySkills: ['cloud-production', 'distributed-systems', 'backend', 'databases', 'system-design'],
    trackExploration: ['backend-platform', 'fde'],
    cycles: [
      {
        weeks: [14, 17],
        title: 'Containers, delivery, and runtime behavior',
        focus: ['Docker', 'Kubernetes', 'health checks', 'secrets', 'CI/CD', 'deployment strategies'],
        outcomes: ['Containerize and deploy a service', 'Explain readiness vs liveness', 'Design safe rollout and rollback behavior'],
      },
      {
        weeks: [18, 21],
        title: 'Distributed failure',
        focus: ['replication', 'consistency', 'partitions', 'distributed locks', 'rate limiting', 'backpressure'],
        outcomes: ['Reason about partial failure explicitly', 'Choose consistency tradeoffs instead of saying “eventually consistent” generically', 'Design overload protection'],
      },
      {
        weeks: [22, 25],
        title: 'Operate what you build',
        focus: ['logging', 'metrics', 'tracing', 'SLO thinking', 'incident debugging', 'capacity'],
        outcomes: ['Instrument a service around user-visible outcomes', 'Debug a seeded production incident', 'Explain scaling bottlenecks with evidence'],
      },
      {
        weeks: [26, 26],
        title: 'Quarter boss',
        focus: ['resilience', 'operations', 'architecture review'],
        outcomes: ['Deploy a multi-worker system, inject failures, recover it, and defend the architecture in a review'],
      },
    ],
    bossOutcome: 'Operate a resilient asynchronous system under injected failures and demonstrate that you can diagnose, mitigate, and explain the failure modes.',
    proof: ['deployed service', 'observability dashboard or evidence', 'failure injection results', 'architecture review memo', 'system-design checkpoint'],
  },
  {
    quarter: 3,
    weeks: [27, 39],
    title: 'AI engineering + Forward Deployed Engineering',
    purpose: 'Combine production engineering with AI application reliability, ambiguous discovery, enterprise constraints, and fast customer-facing delivery.',
    leverage: 'Use your practical experience with AI agents, browser automation, enterprise workflows, and systems without APIs as realistic practice material without copying proprietary details.',
    primarySkills: ['ai-engineering', 'fde', 'system-design', 'backend', 'cloud-production'],
    trackExploration: ['ai-engineering', 'fde', 'backend-platform'],
    cycles: [
      {
        weeks: [27, 30],
        title: 'Production AI foundations',
        focus: ['LLM APIs', 'structured outputs', 'tool calling', 'embeddings', 'RAG', 'model selection'],
        outcomes: ['Build an AI-backed service with deterministic interfaces', 'Choose where AI adds value vs ordinary code', 'Measure latency/cost/quality tradeoffs'],
      },
      {
        weeks: [31, 34],
        title: 'AI reliability and safety',
        focus: ['evals', 'guardrails', 'prompt injection', 'auth', 'auditability', 'fallbacks', 'human-in-the-loop'],
        outcomes: ['Create eval cases before tuning prompts', 'Design deterministic action boundaries around probabilistic models', 'Handle uncertain or malicious model inputs'],
      },
      {
        weeks: [35, 38],
        title: 'FDE delivery loop',
        focus: ['discovery', 'technical scoping', 'legacy systems', 'no-API constraints', 'pilot design', 'adoption', 'stakeholder communication'],
        outcomes: ['Ask design-changing discovery questions', 'Prototype under enterprise constraints', 'Define pilot success and operational ownership'],
      },
      {
        weeks: [39, 39],
        title: 'Quarter boss',
        focus: ['customer scenario', 'prototype', 'deployment', 'adoption plan'],
        outcomes: ['Take an ambiguous enterprise problem from discovery through working prototype and rollout plan'],
      },
    ],
    bossOutcome: 'Build a production-conscious AI/automation solution for a fictional enterprise customer with no clean APIs, then present the discovery, architecture, prototype, risks, and rollout.',
    proof: ['discovery notes', 'working prototype', 'eval suite', 'security/reliability review', 'stakeholder demo narrative'],
  },
  {
    quarter: 4,
    weeks: [40, 52],
    title: 'Convert capability into next-role readiness',
    purpose: 'Turn the year of evidence into interview fluency, architecture confidence, leadership range, and a portfolio of credible engineering stories.',
    leverage: 'Translate existing automation/enterprise work plus new builds into a coherent software-engineering narrative instead of presenting yourself as “QA trying to become SWE.”',
    primarySkills: ['dsa', 'system-design', 'fde', 'technical-leadership', 'programming'],
    trackExploration: ['backend-platform', 'ai-engineering', 'fde', 'technical-leadership'],
    cycles: [
      {
        weeks: [40, 43],
        title: 'Interview coding without competitive-programming obsession',
        focus: ['arrays/maps/sets', 'stacks/queues', 'trees/graphs', 'heaps', 'recursion', 'common patterns'],
        outcomes: ['Solve Easy/Medium problems with clear reasoning', 'State complexity confidently', 'Recognize patterns without memorizing hundreds of solutions'],
      },
      {
        weeks: [44, 47],
        title: 'System design and architecture communication',
        focus: ['requirements', 'capacity', 'APIs', 'data', 'failure modes', 'tradeoffs', 'evolution'],
        outcomes: ['Lead a 45-minute design discussion', 'Use precise terminology without jargon dumping', 'Defend tradeoffs and adapt when constraints change'],
      },
      {
        weeks: [48, 51],
        title: 'Staff/FDE/leadership range',
        focus: ['technical decisions', 'mentoring', 'stakeholders', 'project planning', 'architecture reviews', 'execution'],
        outcomes: ['Write a concise technical decision record', 'Review another design constructively', 'Drive an ambiguous project plan with risks and owners'],
      },
      {
        weeks: [52, 52],
        title: 'Final boss',
        focus: ['capstone', 'mock loop', 'career decision'],
        outcomes: ['Complete a build + coding + system-design + FDE simulation and compare evidence across target career paths'],
      },
    ],
    bossOutcome: 'Complete a realistic next-role loop: coding, debugging, system design, ambiguous customer scenario, technical communication, and capstone defense.',
    proof: ['capstone repository', 'architecture case study', 'mock interview evidence', 'career-track comparison', 'next-role application narrative'],
  },
]

export const journeyWeekCount = yearJourney.reduce((sum, quarter) => sum + quarter.weeks[1] - quarter.weeks[0] + 1, 0)
