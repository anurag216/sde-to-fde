import type { AssistanceLevel, Challenge, EvidenceSignal, TutorEvaluation, TutorHint, TutorSkillSignal } from '../domain'

type EvaluateApiResponse = {
  source: 'ai'
  summary: string
  strengths: string[]
  gaps: string[]
  terminology: string[]
  misconceptionTags: string[]
  nextQuestion: string
  signals: TutorSkillSignal[]
}

type HintApiResponse = {
  source: 'ai'
  hint: string
}

function id() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalized(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ')
}

function localEvaluation(challenge: Challenge, answer: string): TutorEvaluation {
  const text = normalized(answer)
  const rubric = challenge.rubric ?? []
  const strengths: string[] = []
  const gaps: string[] = []
  const terminology = new Set<string>()
  const perSkill = new Map<string, { hits: number; total: number; reasons: string[] }>()

  for (const criterion of rubric) {
    const keywords = criterion.keywords ?? []
    const hitCount = keywords.filter((keyword) => text.includes(normalized(keyword).trim())).length
    const ratio = keywords.length === 0 ? 0 : hitCount / keywords.length
    if (ratio >= 0.35) strengths.push(criterion.label)
    else gaps.push(criterion.label)
    for (const keyword of keywords) {
      if (text.includes(normalized(keyword).trim())) terminology.add(keyword)
    }
    for (const skill of criterion.skills) {
      const existing = perSkill.get(skill) ?? { hits: 0, total: 0, reasons: [] }
      existing.hits += ratio >= 0.35 ? 1 : 0
      existing.total += 1
      existing.reasons.push(`${criterion.label}: ${ratio >= 0.35 ? 'some evidence present' : 'not yet evidenced'}`)
      perSkill.set(skill, existing)
    }
  }

  const signals: TutorSkillSignal[] = challenge.skills.map((skill) => {
    const evidence = perSkill.get(skill)
    if (!evidence || evidence.total === 0) return { skill, signal: 'unknown', rationale: 'No local rubric evidence for this skill.' }
    const ratio = evidence.hits / evidence.total
    const signal: EvidenceSignal = ratio >= 0.75 ? 'strong' : ratio >= 0.4 ? 'partial' : 'weak'
    return { skill, signal, rationale: evidence.reasons.join('; ') }
  })

  return {
    id: id(),
    challengeId: challenge.id,
    createdAt: new Date().toISOString(),
    source: 'local-rubric',
    summary: rubric.length
      ? 'Live AI is not configured, so this is a lightweight rubric check. Treat it as provisional evidence rather than semantic grading.'
      : 'No local rubric is available for this challenge yet.',
    strengths,
    gaps,
    terminology: [...terminology],
    misconceptionTags: [],
    nextQuestion: gaps.length ? `What would you add to address “${gaps[0]}”?` : 'What tradeoff in your answer would you revisit at 10× scale?',
    signals,
  }
}

async function postTutor<T>(payload: unknown): Promise<T> {
  const response = await fetch('/api/tutor', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Tutor endpoint returned ${response.status}`)
  return response.json() as Promise<T>
}

export async function evaluateAnswer(challenge: Challenge, answer: string): Promise<TutorEvaluation> {
  try {
    const result = await postTutor<EvaluateApiResponse>({
      mode: 'evaluate',
      challenge: {
        id: challenge.id,
        title: challenge.title,
        scenario: challenge.scenario,
        prompt: challenge.prompt,
        skills: challenge.skills,
        rubric: challenge.rubric ?? [],
      },
      answer,
    })
    return {
      id: id(), challengeId: challenge.id, createdAt: new Date().toISOString(), source: 'ai',
      summary: result.summary, strengths: result.strengths, gaps: result.gaps,
      terminology: result.terminology, misconceptionTags: result.misconceptionTags,
      nextQuestion: result.nextQuestion, signals: result.signals,
    }
  } catch {
    return localEvaluation(challenge, answer)
  }
}

export async function requestHint(challenge: Challenge, answer: string, level: AssistanceLevel): Promise<TutorHint> {
  try {
    const result = await postTutor<HintApiResponse>({
      mode: 'hint',
      level,
      challenge: {
        id: challenge.id,
        title: challenge.title,
        scenario: challenge.scenario,
        prompt: challenge.prompt,
        skills: challenge.skills,
        rubric: challenge.rubric ?? [],
      },
      answer,
    })
    return { id: id(), challengeId: challenge.id, createdAt: new Date().toISOString(), level, text: result.hint, source: 'ai' }
  } catch {
    const text = challenge.hints?.[level - 1] ?? 'No pre-authored hint is available at this assistance level yet.'
    return { id: id(), challengeId: challenge.id, createdAt: new Date().toISOString(), level, text, source: 'preauthored' }
  }
}
