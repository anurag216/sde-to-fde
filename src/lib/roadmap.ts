import { missionCatalog } from '../data/missionCatalog'
import type { MissionDefinition, RoadmapItem, RoadmapWeek, SkillId, SkillProfile, TrackId, TrackInterest } from '../domain'

const trackNames: Record<TrackId, string> = {
  'backend-platform': 'Backend / Platform',
  'ai-engineering': 'AI Engineering',
  fde: 'Forward Deployed Engineering',
  'technical-leadership': 'Technical Leadership',
}

function priority(profile: SkillProfile) {
  const masteryNeed = profile.mastery === null ? 62 : 100 - profile.mastery
  const uncertainty = (100 - profile.confidence) * 0.28
  return masteryNeed + uncertainty
}

function missionScore(mission: MissionDefinition, bySkill: Map<SkillId, SkillProfile>, interest: TrackInterest) {
  const skillScore = mission.skills.reduce((sum, skill) => sum + priority(bySkill.get(skill) ?? { skillId: skill, mastery: null, confidence: 0, evidence: [], gaps: { implementation: 'unknown', vocabulary: 'unknown', design: 'unknown', retention: 'unknown' } }), 0) / mission.skills.length
  const trackBoost = mission.tracks.reduce((best, track) => Math.max(best, (interest[track] ?? 3) * 5), 0)
  return skillScore + trackBoost
}

function whyFor(mission: MissionDefinition, bySkill: Map<SkillId, SkillProfile>) {
  const ranked = mission.skills.map((skill) => bySkill.get(skill)).filter(Boolean).sort((a, b) => priority(b!) - priority(a!)) as SkillProfile[]
  const focus = ranked[0]
  if (!focus) return 'Included to broaden engineering evidence.'
  if (focus.mastery === null) return `You do not yet have scored evidence for ${focus.skillId}; this mission creates practical evidence instead of assuming a gap.`
  if (focus.confidence < 45) return `${focus.skillId} is currently ${focus.mastery}% mastery but only ${focus.confidence}% confidence, so this mission tests it in a new context.`
  return `Targets ${focus.skillId}, currently one of the highest-priority gaps at ${focus.mastery}% mastery.`
}

export function generateRoadmap(profile: SkillProfile[], interest: TrackInterest): RoadmapWeek[] {
  const bySkill = new Map(profile.map((item) => [item.skillId, item]))
  const engineering = missionCatalog.filter((item) => item.kind === 'engineering').sort((a, b) => missionScore(b, bySkill, interest) - missionScore(a, bySkill, interest))
  const dsa = missionCatalog.filter((item) => item.kind === 'dsa').sort((a, b) => missionScore(b, bySkill, interest) - missionScore(a, bySkill, interest))
  const used = new Set<string>()
  const weeks: RoadmapWeek[] = []

  for (let week = 1; week <= 4; week += 1) {
    const engineeringItems = engineering.filter((item) => !used.has(item.id)).slice(0, 3)
    const dsaItems = dsa.filter((item) => !used.has(item.id)).slice(0, 2)
    const selected = [...engineeringItems, ...dsaItems]
    selected.forEach((item) => used.add(item.id))
    const topTrack = selected.flatMap((item) => item.tracks).sort((a, b) => (interest[b] ?? 3) - (interest[a] ?? 3))[0]
    weeks.push({
      week,
      theme: week === 4 ? 'Transfer, explain, and resurface weak concepts' : `${trackNames[topTrack] ?? 'Engineering'} with fundamentals underneath`,
      items: selected.map((item): RoadmapItem => ({ ...item, why: whyFor(item, bySkill) })),
    })
  }

  const first = weeks[0]?.items[0]
  if (first && weeks[3]) {
    weeks[3].items.push({
      id: `review-${first.id}`,
      title: `Delayed review: ${first.title}`,
      kind: 'review',
      skills: first.skills,
      tracks: first.tracks,
      minutes: 25,
      outcome: 'Re-solve/explain the core concept without using the earlier solution or high-level hints.',
      why: 'Delayed resurfacing checks retention rather than same-session recognition.',
    })
  }

  return weeks
}
