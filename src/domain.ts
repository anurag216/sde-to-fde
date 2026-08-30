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

export type LearnerState = {
  xp: number
  currentChallengeIndex: number
  attempts: Attempt[]
  drafts: Record<string, string>
  languages: Record<string, CodeLanguage>
  codeRuns: Record<string, CodeRunResult[]>
}
