"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MATURITY_LEVELS } from "@/types/maturity";
import { computeMaturity, type AssessmentDoc } from "@/services/maturity";
import {
  Award,
  CheckCircle2,
  ClipboardCheck,
  Sprout,
  TrendingUp,
  RefreshCw,
  ArrowUpCircle,
  BarChart,
} from "lucide-react";

const badgeIcons: Record<string, React.ReactNode> = {
  CheckCircle2: <CheckCircle2 className="h-4 w-4" />,
  ClipboardCheck: <ClipboardCheck className="h-4 w-4" />,
  Sprout: <Sprout className="h-4 w-4" />,
  TrendingUp: <TrendingUp className="h-4 w-4" />,
  Award: <Award className="h-4 w-4" />,
  RefreshCw: <RefreshCw className="h-4 w-4" />,
  ArrowUpCircle: <ArrowUpCircle className="h-4 w-4" />,
};

interface MaturityOverviewProps {
  assessments: AssessmentDoc[];
  hasProfile: boolean;
  benchmarkData: Array<{ category: string; benchmarkScore: number }>;
}

function getLevelColor(score: number): string {
  const level = MATURITY_LEVELS.find((l) => score >= l.minScore && score <= l.maxScore);
  return level?.color ?? "#6B7280";
}

function getLevelLabel(score: number): string {
  const level = MATURITY_LEVELS.find((l) => score >= l.minScore && score <= l.maxScore);
  return level?.label ?? "Unknown";
}

function getNextLevel(score: number) {
  const current = MATURITY_LEVELS.find((l) => score >= l.minScore && score <= l.maxScore);
  if (!current) return MATURITY_LEVELS[1];
  const idx = MATURITY_LEVELS.indexOf(current);
  return idx < MATURITY_LEVELS.length - 1 ? MATURITY_LEVELS[idx + 1] : null;
}

export function MaturityOverview({ assessments, hasProfile, benchmarkData }: MaturityOverviewProps) {
  const maturity = useMemo(
    () => computeMaturity(assessments, hasProfile),
    [assessments, hasProfile]
  );

  if (!hasProfile || maturity.assessmentCount === 0) return null;

  const nextLevel = getNextLevel(maturity.overallScore);
  const progressToNext = nextLevel
    ? ((maturity.overallScore - maturity.level.minScore) /
        (nextLevel.minScore - maturity.level.minScore)) *
      100
    : 100;

  const overallBenchmark = benchmarkData.length > 0
    ? Math.round(
        benchmarkData.reduce((s, b) => s + b.benchmarkScore, 0) / benchmarkData.length
      )
    : null;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="h-5 w-5 text-primary" />
          Maturity Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-foreground"
            style={{ backgroundColor: getLevelColor(maturity.overallScore) }}
          >
            {maturity.overallScore}
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold">{maturity.level.label}</p>
            <p className="text-sm text-muted-foreground">{maturity.level.description}</p>
          </div>
        </div>

        {nextLevel && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress to {nextLevel.label}</span>
              <span>{Math.min(Math.round(progressToNext), 100)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(progressToNext, 100)}%`,
                  backgroundColor: getLevelColor(maturity.overallScore),
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{nextLevel.nextAction}</p>
          </div>
        )}

        {overallBenchmark !== null && (
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <BarChart className="h-5 w-5 text-primary shrink-0" />
            <div className="text-sm">
              <span className="font-medium">vs Industry Average</span>
              <span className="text-muted-foreground">: </span>
              <span
                className="font-semibold"
                style={{ color: getLevelColor(overallBenchmark) }}
              >
                {overallBenchmark}
              </span>
              <span className="text-muted-foreground">
                {" "}
                ({getLevelLabel(overallBenchmark)})
              </span>
            </div>
          </div>
        )}

        {maturity.badges.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Badges Earned
            </p>
            <div className="flex flex-wrap gap-2">
              {maturity.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium"
                >
                  {badgeIcons[badge.icon] ?? <Award className="h-4 w-4" />}
                  {badge.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {maturity.previousScore !== null && (
          <div className="flex items-center gap-2 text-sm">
            <ArrowUpCircle
              className={`h-4 w-4 ${
                maturity.overallScore > maturity.previousScore
                  ? "text-green-500"
                  : maturity.overallScore < maturity.previousScore
                  ? "text-red-500"
                  : "text-muted-foreground"
              }`}
            />
            <span className="text-muted-foreground">
              Previous score:{" "}
              <span className="font-medium text-foreground">
                {maturity.previousScore}
              </span>
              {maturity.overallScore > maturity.previousScore
                ? ` (+${maturity.overallScore - maturity.previousScore})`
                : maturity.overallScore < maturity.previousScore
                ? ` (${maturity.overallScore - maturity.previousScore})`
                : " (no change)"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
