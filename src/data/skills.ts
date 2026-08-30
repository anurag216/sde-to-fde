import type { Skill } from '../domain'

export const skills: Skill[] = [
  { id: 'programming', name: 'Programming', description: 'Implementation fluency, decomposition, OOP and debugging.', target: 'core' },
  { id: 'dsa', name: 'DSA & CS Vocabulary', description: 'Practical data structures, algorithms, complexity and interview confidence.', target: 'core' },
  { id: 'backend', name: 'Backend Engineering', description: 'APIs, async processing, reliability, concurrency and service design.', target: 'core' },
  { id: 'databases', name: 'Databases', description: 'SQL, PostgreSQL, indexing, transactions and data modeling.', target: 'core' },
  { id: 'distributed-systems', name: 'Distributed Systems', description: 'Queues, consistency, failures, partitioning and coordination.', target: 'core' },
  { id: 'cloud-production', name: 'Cloud & Production', description: 'Containers, Kubernetes, CI/CD, observability and safe deployments.', target: 'core' },
  { id: 'ai-engineering', name: 'AI Engineering', description: 'LLM apps, agents, evals, guardrails, reliability, latency and cost.', target: 'career-path' },
  { id: 'system-design', name: 'System Design', description: 'Architecture, tradeoffs, scaling, interfaces and failure modes.', target: 'career-path' },
  { id: 'fde', name: 'FDE', description: 'Ambiguous discovery, enterprise integration, prototyping, deployment and adoption.', target: 'career-path' },
  { id: 'technical-leadership', name: 'Technical Leadership', description: 'Communication, planning, architecture reviews, mentoring and execution.', target: 'parallel' },
]
