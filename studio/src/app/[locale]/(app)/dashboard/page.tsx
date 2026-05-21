
"use client";

import { useState, useEffect, useContext, useRef, memo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Lightbulb,
  FileText,
  Users,
  Briefcase,
  BarChart,
  RefreshCw,
  Loader2,
  Wand2,
  Newspaper,
  TrendingUp,
  ExternalLink,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { UsageSummary } from "@/components/usage-summary";
import { RecentActivity } from "@/components/recent-activity";
import { MaturityOverview } from "@/components/maturity-overview";
import { generateDashboardInsights } from "@/ai/flows/generate-dashboard-insights";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { AuthContext } from "@/contexts/auth-context";
import { withRetry } from "@/lib/retry";
import { checkFeatureAccess, checkAndDecrementUsage } from "@/services/usage-service";
import { createNotification } from "@/services/notifications/notifications-service";
import { UpgradeModal } from "@/components/upgrade-modal";
import { ErrorBoundary } from "@/components/error-boundary";
import { cacheDashboardData, getCachedDashboardData } from "@/services/offline";
import type { UpgradeInfo } from "@/services/feature-gate";
import type { AppUser } from "@/types/user";

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const overviewCards = [
  {
    title: "Digital Assessment",
    description: "Gauge your business's digital readiness.",
    icon: <FileText className="h-6 w-6 text-primary" />,
    href: "/assessment",
  },
  {
    title: "AI Toolkit",
    description: "Use AI to generate slogans, profiles, and more.",
    icon: <Wand2 className="h-6 w-6 text-primary" />,
    href: "/toolkit",
  },
  {
    title: "Tenders & News",
    description: "Find new opportunities and stay updated.",
    icon: <Briefcase className="h-6 w-6 text-primary" />,
    href: "/tenders",
  },
  {
    title: "Community Forum",
    description: "Connect and learn from other entrepreneurs.",
    icon: <Users className="h-6 w-6 text-primary" />,
    href: "/community",
  },
];

const chartConfig = {
    score: {
      label: "Score",
      color: "hsl(var(--primary))",
    },
    category: {
      label: "Category",
    },
};

interface AssessmentData {
    chartData: { category: string; score: number }[];
    aiSummary: string;
}

const AssessmentRadarChart = memo(function AssessmentRadarChart({ data }: { data: AssessmentData }) {
  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <BarChart className="mr-2 h-5 w-5 text-primary" />
          Strengths & Gaps
        </h3>
        <ChartContainer config={chartConfig} className="aspect-square h-full w-full">
          <RadarChart data={data.chartData}>
            <ChartTooltip content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="category" />
            <PolarGrid />
            <Radar
              name="Score"
              dataKey="score"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Lightbulb className="mr-2 h-5 w-5 text-primary" />
          AI Summary
        </h3>
        <div className="p-4 bg-muted rounded-lg flex-1">
          <p className="text-sm whitespace-pre-line">{data.aiSummary}</p>
        </div>
      </div>
    </>
  );
});

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [dailyTips, setDailyTips] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [insightsError, setInsightsError] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState<UpgradeInfo | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<{ date: string; score: number }[]>([]);
  const [allAssessments, setAllAssessments] = useState<any[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<Array<{ category: string; benchmarkScore: number }>>([]);
  const [isLoadingAssessment, setIsLoadingAssessment] = useState(true);
  const [creditsExhausted, setCreditsExhausted] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const upgradeShown = useRef(false);

  const hasCompletedProfile = !!(user && user.businessName && user.industry);

  useEffect(() => {
    let mounted = true;

    const fetchDashboardInsights = async () => {
      if (!user || !hasCompletedProfile) return;

      if (mounted) setIsLoadingInsights(true);
      setInsightsError(false);
      setCreditsExhausted(false);

      try {
        const access = await checkFeatureAccess(user.uid, 'dashboardInsights');
        if (!access.allowed) {
          if (access.upgrade && !upgradeShown.current) {
            upgradeShown.current = true;
            if (mounted) setUpgradeInfo(access.upgrade);
          } else {
            if (mounted) setCreditsExhausted(true);
          }
          if (mounted) setIsLoadingInsights(false);
          return;
        }

        const cached = await getCachedDashboardData(user.uid);
        if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
          const data = cached.data as { dailyTips: string[]; recommendations: string[] };
          if (data?.dailyTips?.length && data?.recommendations?.length) {
            if (mounted) {
              setDailyTips(data.dailyTips);
              setRecommendations(data.recommendations);
              setIsLoadingInsights(false);
            }
            return;
          }
        }

        const result = await generateDashboardInsights({
          userId: user.uid,
          businessDescription: user.businessDescription || '',
          industry: user.industry,
        });

        if (mounted) {
          setDailyTips(result.dailyTips);
          setRecommendations(result.recommendations);
          setIsLoadingInsights(false);
          createNotification({
            userId: user.uid,
            title: "New Dashboard Insights",
            body: `Tip: ${result.dailyTips[0]?.slice(0, 80) || 'Check your personalized recommendations.'}`,
            type: "insights",
            read: false,
            link: "/dashboard",
          }).catch(() => {});
        }

        checkAndDecrementUsage(user.uid, 'dashboardInsights').then(decrementResult => {
          if (decrementResult.success) {
            cacheDashboardData(user.uid, {
              dailyTips: result.dailyTips,
              recommendations: result.recommendations,
            }).catch(() => {});
          }
        }).catch(() => {});
      } catch (error) {
        console.error("Error fetching dashboard insights:", error);
        if (mounted) setInsightsError(true);
        if (mounted) setIsLoadingInsights(false);
      }
    };

    const fetchAssessmentData = async () => {
      if (!user) return;
      if (mounted) setIsLoadingAssessment(true);
      try {
        const q = query(
          collection(db, "assessments"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await withRetry(() => getDocs(q));
        const sorted = querySnapshot.docs.sort((a, b) => {
          const aDate = a.data().createdAt?.toDate?.() ?? new Date(0);
          const bDate = b.data().createdAt?.toDate?.() ?? new Date(0);
          return bDate.getTime() - aDate.getTime();
        });
        if (mounted) setAllAssessments(sorted.map(d => ({ ...d.data(), id: d.id })));
        if (sorted.length > 0 && mounted) {
          const latest = sorted[0];
          const latestData = latest.data();
          const categoryScores: { [key: string]: { totalScore: number; count: number } } = {};
          latestData.responses.forEach((response: any) => {
            if (!categoryScores[response.category]) {
              categoryScores[response.category] = { totalScore: 0, count: 0 };
            }
            categoryScores[response.category].totalScore += response.score;
            categoryScores[response.category].count += 1;
          });
          const chartData = Object.entries(categoryScores).map(([category, scores]) => ({
            category,
            score: (scores.totalScore / (scores.count * 4)) * 100,
          }));
          if (mounted) setAssessmentData({ chartData, aiSummary: latestData.summary });

          const history = sorted.map(doc => {
            const d = doc.data();
            const scores = d.responses as Array<{ score: number }>;
            const total = scores.reduce((sum, r) => sum + r.score, 0);
            const max = scores.length * 4;
            const date = d.createdAt?.toDate?.() ?? new Date(0);
            return {
              date: date.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' }),
              score: Math.round((total / max) * 100),
            };
          }).reverse();
          if (mounted) setAssessmentHistory(history);
        } else if (mounted) {
          setAssessmentData(null);
          setAssessmentHistory([]);
          setAllAssessments([]);
        }
        try {
          const res = await fetch('/api/assessments/benchmark');
          const json = await res.json();
          if (mounted && json.benchmark) setBenchmarkData(json.benchmark);
        } catch {}
      } catch (error) {
        console.error("Error fetching assessment data:", error);
        if (mounted) setAssessmentData(null);
      } finally {
        if (mounted) setIsLoadingAssessment(false);
      }
    };

    if (!user) {
      if (mounted) setIsLoadingInsights(false);
      if (mounted) setIsLoadingAssessment(false);
      return;
    }

    fetchDashboardInsights();
    fetchAssessmentData();

    return () => { mounted = false; };
  }, [user, hasCompletedProfile, retryTrigger]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {user?.displayName?.split(' ')[0] || 'Entrepreneur'}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here&apos;s your business overview for today.
          </p>
        </div>
      </div>

      <OnboardingWizard />

      {user && hasCompletedProfile && allAssessments.length > 0 && (
        <MaturityOverview
          assessments={allAssessments}
          hasProfile={hasCompletedProfile}
          benchmarkData={benchmarkData}
        />
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
               <Button variant="link" asChild className="px-0 mt-2">
                <Link href={card.href}>
                  Go to {card.title} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle>Your Digital Readiness</CardTitle>
                <CardDescription>
                  A summary of your recent assessment.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/assessment">
                  <RefreshCw className="mr-2 h-4 w-4"/>
                  Retake Assessment
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ErrorBoundary>
              {isLoadingAssessment ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : assessmentData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AssessmentRadarChart data={assessmentData} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center min-h-[200px]">
                  <p className="text-muted-foreground">You haven&apos;t taken the assessment yet.</p>
                  <Button asChild className="mt-4">
                    <Link href="/assessment">Take Your First Assessment</Link>
                  </Button>
                </div>
              )}
            </ErrorBoundary>
            {assessmentHistory.length > 1 && (
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Score Trend
                </h3>
                <div className="h-32">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <LineChart data={assessmentHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
                    </LineChart>
                  </ChartContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>
              Personalized tips and recommendations to help you grow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ErrorBoundary>
              {isLoadingInsights ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ) : insightsError ? (
                <div className="text-center py-8 space-y-4">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="size-6 text-destructive" />
                  </div>
                  <div>
                    <p className="font-semibold text-md">Failed to load insights</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Something went wrong. Please try again.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setRetryTrigger(c => c + 1)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                </div>
              ) : hasCompletedProfile && !creditsExhausted ? (
                <>
                  <div>
                    <h3 className="font-semibold text-md mb-2 flex items-center"><Wand2 className="w-4 h-4 mr-2 text-primary"/>Daily Tips</h3>
                    <div className="space-y-3">
                      {dailyTips.length > 0 ? dailyTips.map((tip, index) => (
                        <div key={index} className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">{tip}</p>
                        </div>
                      )) : (
                        <p className="text-xs text-muted-foreground">No tips available right now.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-md mb-2 flex items-center"><Wand2 className="w-4 h-4 mr-2 text-primary"/>Recommendations</h3>
                    <div className="space-y-3">
                      {recommendations.length > 0 ? recommendations.map((rec, index) => (
                        <div key={index} className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">{rec}</p>
                        </div>
                      )) : (
                        <p className="text-xs text-muted-foreground">No recommendations right now.</p>
                      )}
                    </div>
                  </div>
                </>
              ) : creditsExhausted && hasCompletedProfile ? (
                <div className="text-center py-8 space-y-4">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="size-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-md">AI Insights Exhausted</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You&apos;ve used all your dashboard insights credits for this billing period.
                    </p>
                  </div>
                  <Button onClick={() => router.push('/settings?tab=plan')}>
                    Upgrade to Growth — $5/mo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>Complete your business profile to unlock personalized AI insights.</p>
                </div>
              )}
            </ErrorBoundary>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <UsageSummary user={user} />
        {user && <RecentActivity userId={user.uid} />}
      </div>

      <div id="dashboard-news-insights" className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <ErrorBoundary>
          <NewsInsightsCard user={user} />
        </ErrorBoundary>
      </div>

      <UpgradeModal open={!!upgradeInfo} onOpenChange={(o) => { if (!o) setUpgradeInfo(null); }} upgrade={upgradeInfo} onUpgrade={() => router.push('/settings?tab=plan')} />
    </div>
  );
}

function NewsInsightsCard({ user }: { user: AppUser | null }) {
  const [brief, setBrief] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleGenerate = async () => {
    if (!user) return;
    setLoading(true);
    setError(false);
    try {
      const { generatePersonalizedBrief } = await import('@/ai/flows/generate-personalized-brief');
      const result = await generatePersonalizedBrief({
        userId: user.uid,
        businessName: user.businessName,
        industry: user.industry,
        businessDescription: user.businessDescription,
        focusArea: 'both',
      });
      setBrief(result);
    } catch (err) {
      console.error('Error generating brief:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="lg:col-span-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Industry Intelligence</CardTitle>
          </div>
          {!brief ? (
            <Button size="sm" variant="outline" onClick={handleGenerate} disabled={loading} className="gap-1.5">
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Newspaper className="h-3.5 w-3.5" />}
              {loading ? 'Generating...' : 'Generate Brief'}
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Show less' : 'Show more'}
            </Button>
          )}
        </div>
        <CardDescription>
          Live news and tender opportunities relevant to your business.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!brief ? (
          <div className="text-center py-6 text-muted-foreground">
            <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-30" />
            {error ? (
              <div className="space-y-3">
                <p className="text-sm">Failed to generate brief. Try again.</p>
                <Button size="sm" variant="outline" onClick={handleGenerate}>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Retry
                </Button>
              </div>
            ) : (
              <p className="text-sm">Click &quot;Generate Brief&quot; to get AI-curated news and tender recommendations for your industry.</p>
            )}
          </div>
        ) : (
          <>
            {brief.summary && (
              <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">{brief.summary}</p>
            )}
            {brief.topStories?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <Newspaper className="h-4 w-4 text-primary" />
                  Top Stories
                </h4>
                {(expanded ? brief.topStories : brief.topStories.slice(0, 2)).map((story: any, i: number) => (
                  <div key={i} className="p-3 bg-card rounded-lg border border-border/50">
                    <p className="text-sm font-medium">{story.headline}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{story.whyItMatters}</p>
                    {story.actionStep && (
                      <p className="text-xs text-primary mt-1 font-medium">Action: {story.actionStep}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {brief.relevantTenders?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Relevant Tenders
                </h4>
                <div className="space-y-1.5">
                  {(expanded ? brief.relevantTenders : brief.relevantTenders.slice(0, 3)).map((t: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-card rounded-lg border border-border/50 text-sm">
                      <div>
                        <p className="font-medium text-sm">{t.title}</p>
                        <p className="text-xs text-muted-foreground">Deadline: {t.deadline}</p>
                      </div>
                      <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline shrink-0 ml-2">
                        Apply <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
                <Button asChild variant="link" className="text-xs px-0 text-primary">
                  <Link href="/tenders">View all tenders <ArrowRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

    