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
}
