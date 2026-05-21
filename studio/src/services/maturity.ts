import { MATURITY_LEVELS, BADGE_DEFINITIONS, type BadgeId, type MaturityLevelInfo } from "@/types/maturity";

export interface AssessmentDoc {
  id?: string;
  responses: Array<{ score: number; category: string; question: string; answer: string }>;
  summary?: string;
  createdAt?: { toDate?: () => Date };
}

export interface MaturityResult {
  overallScore: number;
  level: MaturityLevelInfo;
  categoryScores: Array<{ category: string; score: number }>;
  badges: Array<{ id: BadgeId; label: string; description: string; icon: string }>;
  hasProfile: boolean;
  assessmentCount: number;
  previousScore: number | null;
}

export function getMaturityLevel(score: number): MaturityLevelInfo {
  const level = MATURITY_LEVELS.find((l) => score >= l.minScore && score <= l.maxScore);
  return level ?? MATURITY_LEVELS[0];
}

export function computeOverallScore(responses: Array<{ score: number }>): number {
  if (responses.length === 0) return 0;
  const total = responses.reduce((sum, r) => sum + r.score, 0);
  const max = responses.length * 4;
  return Math.round((total / max) * 100);
}

export function computeCategoryScores(
  responses: Array<{ score: number; category: string }>
): Array<{ category: string; score: number }> {
  const grouped: Record<string, { total: number; count: number }> = {};
  for (const r of responses) {
    if (!grouped[r.category]) grouped[r.category] = { total: 0, count: 0 };
    grouped[r.category].total += r.score;
    grouped[r.category].count += 1;
  }
  return Object.entries(grouped).map(([category, d]) => ({
    category,
    score: Math.round((d.total / (d.count * 4)) * 100),
  }));
}

export function computeBadges(
  overallScore: number,
  assessmentCount: number,
  hasProfile: boolean,
  previousScore: number | null
): Array<{ id: BadgeId; label: string; description: string; icon: string }> {
  const earned: BadgeId[] = [];

  if (hasProfile) earned.push("profile_complete");
  if (assessmentCount >= 1) earned.push("assessment_complete");
  if (assessmentCount >= 2) earned.push("repeat_assessment");
  if (previousScore !== null && overallScore > previousScore) earned.push("score_improver");

  const level = getMaturityLevel(overallScore);
  if (level.key === "early_stage") earned.push("early_stage");
  if (level.key === "building_momentum") earned.push("building_momentum");
  if (level.key === "digitally_ready") earned.push("digitally_ready");

  return earned.map((id) => ({
    id,
    label: BADGE_DEFINITIONS[id].label,
    description: BADGE_DEFINITIONS[id].description,
    icon: BADGE_DEFINITIONS[id].icon,
  }));
}

export function computeMaturity(
  assessments: AssessmentDoc[],
  hasProfile: boolean
): MaturityResult {
  const sorted = [...assessments].sort((a, b) => {
    const aDate = a.createdAt?.toDate?.() ?? new Date(0);
    const bDate = b.createdAt?.toDate?.() ?? new Date(0);
    return bDate.getTime() - aDate.getTime();
  });

  const assessmentCount = sorted.length;
  const latest = sorted[0] ?? null;
  const previous = sorted[1] ?? null;

  const latestResponses = latest?.responses ?? [];
  const overallScore = latest ? computeOverallScore(latestResponses) : 0;
  const categoryScores = latest ? computeCategoryScores(latestResponses) : [];

  const previousScore = previous ? computeOverallScore(previous.responses) : null;

  const level = getMaturityLevel(overallScore);
  const badges = computeBadges(overallScore, assessmentCount, hasProfile, previousScore);

  return {
    overallScore,
    level,
    categoryScores,
    badges,
    hasProfile,
    assessmentCount,
    previousScore,
  };
}
