
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
  RefreshCw,
  Loader2,
  Wand2,
  Newspaper,
  TrendingUp,
  ExternalLink,
  Briefcase,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BarChart,
  WifiOff,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
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
import { watchNetworkStatus } from "@/services/offline";
import type { UpgradeInfo } from "@/services/feature-gate";
import type { AppUser } from "@/types/user";

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const chartConfig = {
  score: { label: "Score", color: "hsl(var(--primary))" },
  category: { label: "Category" },
};

interface AssessmentData {
  chartData: { category: string; score: number }[];
  aiSummary: string;
}

const AssessmentRadarChart = memo(function AssessmentRadarChart({ data }: { data: AssessmentData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <BarChart className="h-4 w-4 text-primary" />
          Strengths & Gaps
        </h3>
        <ChartContainer config={chartConfig} className="aspect-square h-full w-full">
          <RadarChart data={data.chartData}>
            <ChartTooltip content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="category" />
            <PolarGrid />
            <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
          </RadarChart>
        </ChartContainer>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <Lightbulb className="h-4 w-4 text-primary" />
          AI Summary
        </h3>
        <div className="p-4 bg-muted rounded-lg flex-1">
          <p className="text-sm whitespace-pre-line">{data.aiSummary}</p>
        </div>
      </div>
    </div>
  );
});

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [dailyTips, setDailyTips] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [insightsError, setInsightsError] = useState(false);
  const [insightsExpanded, setInsightsExpanded] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState<UpgradeInfo | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<{ date: string; score: number }[]>([]);
  const [allAssessments, setAllAssessments] = useState<any[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<Array<{ category: string; benchmarkScore: number }>>([]);
  const [isLoadingAssessment, setIsLoadingAssessment] = useState(true);
  const [creditsExhausted, setCreditsExhausted] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [insightsGeneratedAt, setInsightsGeneratedAt] = useState<number | null>(null);
  const upgradeShown = useRef(false);

  const hasCompletedProfile = !!(user && user.businessName && user.industry);

  useEffect(() => {
    const cleanup = watchNetworkStatus(
      () => setIsOffline(false),
      () => setIsOffline(true)
    );
    setIsOffline(!navigator.onLine);
    return cleanup;
  }, []);

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
              if (cached.cachedAt) setInsightsGeneratedAt(cached.cachedAt);
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
          setInsightsGeneratedAt(Date.now());
          setIsLoadingInsights(false);
          createNotification({
            userId: user.uid,
            title: "New Dashboard Insights",
            body: `Tip: ${result.dailyTips[0]?.slice(0, 80) || 'Check your personalized recommendations.'}`,
            type: "insights",
            read: false,
            link: "/dashboard",
          }).catch(e => console.error('[Dashboard] createNotification failed:', e));
        }

        checkAndDecrementUsage(user.uid, 'dashboardInsights').then(decrementResult => {
          if (decrementResult.success) {
            cacheDashboardData(user.uid, {
              dailyTips: result.dailyTips,
              recommendations: result.recommendations,
            }).catch(e => console.error('[Dashboard] cacheDashboardData failed:', e));
          }
        }).catch(e => console.error('[Dashboard] checkAndDecrementUsage failed:', e));
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
          latestData.responses?.forEach((response: any) => {
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
          const rawSummary = latestData.summary;
          const aiSummary = typeof rawSummary === 'string' ? rawSummary : rawSummary?.summary || '';
          if (mounted) setAssessmentData({ chartData, aiSummary });

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
        } catch (e) { console.warn('[Dashboard] benchmark fetch failed:', e); }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, hasCompletedProfile, retryTrigger]);

  const insightCount = dailyTips.length + recommendations.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, {user?.displayName?.split(' ')[0] || 'Entrepreneur'}!
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s your business overview for today.
          </p>
        </div>
      </div>

      <OnboardingWizard />

      {isOffline && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>You&apos;re offline. Showing cached data where available. Insights and news may be stale.</span>
        </div>
      )}

      {/* Main Content: Assessment + Insights side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Assessment Section (3/5) */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle className="text-base">Digital Readiness</CardTitle>
                <CardDescription className="text-xs">
                  Your latest assessment results and score trend.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild className="shrink-0">
                <Link href="/assessment">
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5"/>
                  {assessmentData ? 'Retake' : 'Take Assessment'}
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ErrorBoundary>
              {isLoadingAssessment ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : assessmentData ? (
                <AssessmentRadarChart data={assessmentData} />
              ) : (
                <div className="flex flex-col items-center justify-center text-center min-h-[200px]">
                  <FileText className="h-8 w-8 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">You haven&apos;t taken the assessment yet.</p>
                  <Button asChild size="sm">
                    <Link href="/assessment">Take Your First Assessment</Link>
                  </Button>
                </div>
              )}
            </ErrorBoundary>
            {assessmentHistory.length > 1 && (
              <div className="border-t pt-4">
                <h3 className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  Score Trend
                </h3>
                <div className="h-28">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <LineChart data={assessmentHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 2 }} />
                    </LineChart>
                  </ChartContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights Sidebar (2/5) */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Insights
                </CardTitle>
                <CardDescription className="text-xs">
                  Personalized tips for your business.
                  {insightsGeneratedAt && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Updated {new Date(insightsGeneratedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </CardDescription>
              </div>
              {insightCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInsightsExpanded(!insightsExpanded)}
                  className="h-7 px-2 text-xs"
                >
                  {insightsExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {insightsExpanded ? "Less" : `${insightCount} tips`}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ErrorBoundary>
              {isLoadingInsights ? (
                <div className="space-y-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-3/5" />
                </div>
              ) : insightsError ? (
                <div className="text-center py-6 space-y-3">
                  <AlertTriangle className="h-6 w-6 text-destructive mx-auto" />
                  <p className="text-xs text-muted-foreground">Failed to load insights.</p>
                  <Button variant="outline" size="sm" onClick={() => setRetryTrigger(c => c + 1)}>
                    <RefreshCw className="mr-1.5 h-3 w-3" />
                    Retry
                  </Button>
                </div>
              ) : hasCompletedProfile && !creditsExhausted ? (
                <div className="space-y-3">
                  {/* Daily Tips - always show first 2 */}
                  {dailyTips.length > 0 && dailyTips.slice(0, 2).map((tip, i) => (
                    <div key={i} className="p-2.5 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
                    </div>
                  ))}
                  {/* Expanded: show remaining tips + recommendations */}
                  {insightsExpanded && (
                    <>
                      {dailyTips.slice(2).map((tip, i) => (
                        <div key={`tip-${i}`} className="p-2.5 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
                        </div>
                      ))}
                      {recommendations.length > 0 && (
                        <div className="pt-2 border-t">
                          <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                            <Wand2 className="h-3 w-3 text-primary" />
                            Recommendations
                          </h4>
                          {recommendations.map((rec, i) => (
                            <div key={`rec-${i}`} className="p-2.5 bg-muted/50 rounded-lg mb-2">
                              <p className="text-xs text-muted-foreground leading-relaxed">{rec}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  {dailyTips.length === 0 && recommendations.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No tips available right now.</p>
                  )}
                </div>
              ) : creditsExhausted && hasCompletedProfile ? (
                <div className="text-center py-6 space-y-3">
                  <Sparkles className="h-6 w-6 text-primary mx-auto" />
                  <p className="text-xs text-muted-foreground">AI credits used up for this month.</p>
                  <p className="text-[11px] text-muted-foreground">Credits reset on the 1st of each month.</p>
                  <Button size="sm" onClick={() => router.push('/settings?tab=plan')}>
                    Upgrade <ArrowRight className="ml-1.5 h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  <p>Complete your profile to unlock AI insights.</p>
                </div>
              )}
            </ErrorBoundary>
          </CardContent>
        </Card>
      </div>

      {/* Maturity + News + Usage row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Maturity Overview */}
        {user && hasCompletedProfile && allAssessments.length > 0 ? (
          <MaturityOverview
            assessments={allAssessments}
            hasProfile={hasCompletedProfile}
            benchmarkData={benchmarkData}
          />
        ) : (
          <Card className="lg:col-span-1 hidden lg:block">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Business Maturity</CardTitle>
              <CardDescription className="text-xs">Your growth journey starts here.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center min-h-[180px]">
              <TrendingUp className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-xs text-muted-foreground">
                Complete your profile and take the assessment to track your business maturity over time.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-3">
                <Link href="/assessment">Start Assessment</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* News Brief — spans remaining cols */}
        <div className={user && hasCompletedProfile && allAssessments.length > 0 ? '' : 'lg:col-span-3'}>
          <ErrorBoundary>
            <NewsInsightsCard user={user} />
          </ErrorBoundary>
        </div>
      </div>

      {/* Usage + Activity - compact row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <UsageSummary user={user} />
        {user && <RecentActivity userId={user.uid} />}
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Industry Intel</CardTitle>
          </div>
          {!brief ? (
            <Button size="sm" variant="outline" onClick={handleGenerate} disabled={loading} className="h-7 text-xs gap-1.5">
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Newspaper className="h-3 w-3" />}
              {loading ? 'Generating...' : 'Generate'}
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)} className="h-7 text-xs">
              {expanded ? 'Less' : 'More'}
            </Button>
          )}
        </div>
        <CardDescription className="text-xs">
          News and tenders for your industry.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!brief ? (
          <div className="text-center py-4 text-muted-foreground">
            <Newspaper className="h-6 w-6 mx-auto mb-2 opacity-30" />
            {error ? (
              <div className="space-y-2">
                <p className="text-xs">Failed to generate. Try again.</p>
                <Button size="sm" variant="outline" onClick={handleGenerate} className="h-7 text-xs">
                  <RefreshCw className="mr-1.5 h-3 w-3" />
                  Retry
                </Button>
              </div>
            ) : (
              <p className="text-xs">Click &quot;Generate&quot; for AI-curated news.</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {brief.summary && (
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">{brief.summary}</p>
            )}
            {brief.topStories?.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold flex items-center gap-1">
                  <Newspaper className="h-3 w-3 text-primary" />
                  Stories
                </h4>
                {(expanded ? brief.topStories : brief.topStories.slice(0, 2)).map((story: any, i: number) => (
                  <div key={i} className="p-2.5 bg-card rounded-lg border border-border/50">
                    <p className="text-xs font-medium">{story.headline}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{story.whyItMatters}</p>
                    {story.actionStep && (
                      <p className="text-[11px] text-primary mt-1 font-medium">→ {story.actionStep}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {brief.relevantTenders?.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold flex items-center gap-1">
                  <Briefcase className="h-3 w-3 text-primary" />
                  Tenders
                </h4>
                {(expanded ? brief.relevantTenders : brief.relevantTenders.slice(0, 2)).map((t: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-card rounded-lg border border-border/50">
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{t.title}</p>
                      <p className="text-[10px] text-muted-foreground">Due: {t.deadline}</p>
                    </div>
                    <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary font-medium flex items-center gap-0.5 hover:underline shrink-0 ml-2">
                      Apply <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                ))}
                <Button asChild variant="link" className="text-[11px] px-0 text-primary h-auto py-0">
                  <Link href="/tenders">All tenders <ArrowRight className="h-2.5 w-2.5 ml-0.5" /></Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
