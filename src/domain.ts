export type SkillId =
  | 'programming'
  | 'dsa'
  | 'backend'
  | 'databases'
  | 'distributed-systems'
  | 'cloud-production'
  | 'ai-engineering'
  | 'system-design'
  | 'fde'
  | 'technical-leadership'

export type Skill = {
  id: SkillId
  name: string
  description: string
  target: 'core' | 'career-path' | 'parallel'
}

export type ChallengeType = 'multiple-choice' | 'free-response' | 'coding'
export type CodeLanguage = 'typescript' | 'javascript' | 'python'
export type AssistanceLevel = 1 | 2 | 3 | 4 | 5 | 6
export type EvidenceSignal = 'strong' | 'partial' | 'weak' | 'unknown'

export type CodeTest = {
  name: string
  args: unknown[]
  expected: unknown
  hidden?: boolean
}

export type CodingConfig = {
  functionName: string
  languages: CodeLanguage[]
  starterCode: Record<CodeLanguage, string>
  tests: CodeTest[]
  timeLimitMs: number
}

export type RubricCriterion = {
  id: string
  label: string
  description: string
  skills: SkillId[]
  keywords?: string[]
}

export type Challenge = {
  id: string
  title: string
  scenario: string
  type: ChallengeType
  skills: SkillId[]
  prompt: string
  options?: string[]
  correctOption?: number
  placeholder?: string
  evidence: string
  coding?: CodingConfig
  rubric?: RubricCriterion[]
  hints?: string[]
}

export type CodeRunTestResult = {
  name: string
  passed: boolean
  expected?: unknown
  actual?: unknown
  error?: string
}

export type CodeRunResult = {
  id: string
  challengeId: string
  language: CodeLanguage
  source: string
  startedAt: string
  durationMs: number
  status: 'passed' | 'failed' | 'error' | 'timeout'
  tests: CodeRunTestResult[]
  error?: string
}

export type Attempt = {
  challengeId: string
  answer: string
  objectiveCorrect?: boolean
  completedAt: string
}

export type TutorSkillSignal = {
  skill: SkillId
  signal: EvidenceSignal
  rationale: string
}

export type TutorEvaluation = {
  id: string
  challengeId: string
  createdAt: string
  source: 'ai' | 'local-rubric'
  summary: string
  strengths: string[]
  gaps: string[]
  terminology: string[]
  misconceptionTags: string[]
  nextQuestion: string
  signals: TutorSkillSignal[]
}

export type TutorHint = {
  id: string
  challengeId: string
  createdAt: string
  level: AssistanceLevel
  text: string
  source: 'ai' | 'preauthored'
}

export type TutorEvidence = {
  evaluations: TutorEvaluation[]
  hints: TutorHint[]
}

export type LearnerState = {
  xp: number
  currentChallengeIndex: number
  attempts: Attempt[]
  drafts: Record<string, string>
  languages: Record<string, CodeLanguage>
  codeRuns: Record<string, CodeRunResult[]>
  tutor: Record<string, TutorEvidence>
}
