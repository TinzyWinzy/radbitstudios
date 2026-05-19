
"use client";

import { useState, useEffect, useContext } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { UsageSummary } from "@/components/usage-summary";
import { generateDashboardInsights } from "@/ai/flows/generate-dashboard-insights";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { AuthContext } from "@/contexts/auth-context";


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

import { checkAndDecrementUsage } from "@/services/usage-service";
import { UpgradeModal } from "@/components/upgrade-modal";
import type { UpgradeInfo } from "@/services/feature-gate";

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

export default function DashboardPage() {
  const { user } = useContext(AuthContext);
  const [dailyTips, setDailyTips] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [upgradeInfo, setUpgradeInfo] = useState<UpgradeInfo | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [isLoadingAssessment, setIsLoadingAssessment] = useState(true);

  const hasCompletedProfile = user && (user as any).businessName && (user as any).industry;

  useEffect(() => {
    const fetchDashboardInsights = async () => {
      if (!user || !hasCompletedProfile) {
        setIsLoadingInsights(false);
        return;
      };

      setIsLoadingInsights(true);
      try {
        const usageResult = await checkAndDecrementUsage(user.uid, 'dashboardInsights');
        if (!usageResult.success) {
          if (usageResult.upgrade) {
            setUpgradeInfo(usageResult.upgrade);
            setIsLoadingInsights(false);
            return;
          }
          setDailyTips([usageResult.message]);
          setIsLoadingInsights(false);
          return;
        }
        const result = await generateDashboardInsights({
          userId: user.uid,
          businessDescription: (user as any).businessDescription || '',
          industry: (user as any).industry
        });
        setDailyTips(result.dailyTips);
        setRecommendations(result.recommendations);
      } catch (error) {
        console.error("Error fetching dashboard insights:", error);
        setDailyTips(["Error loading tips. Please refresh."]);
        setRecommendations(["Error loading recommendations. Please refresh."]);
      } finally {
        setIsLoadingInsights(false);
      }
    };
    
    const fetchAssessmentData = async () => {
        if (!user) {
            setIsLoadingAssessment(false);
            return;
        }
        setIsLoadingAssessment(true);
        try {
            const q = query(
                collection(db, "assessments"),
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc"),
                limit(1)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const data = doc.data();

                const categoryScores: { [key: string]: { totalScore: number; count: number } } = {};
                data.responses.forEach((response: any) => {
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
                
                setAssessmentData({
                    chartData,
                    aiSummary: data.summary,
                });
            } else {
                 setAssessmentData(null);
            }
        } catch (error) {
             console.error("Error fetching assessment data:", error);
             setAssessmentData(null);
        } finally {
            setIsLoadingAssessment(false);
        }
    }

    fetchDashboardInsights();
    fetchAssessmentData();
  }, [user, hasCompletedProfile]);


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
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px]">
                {isLoadingAssessment ? (
                     <div className="col-span-1 md:col-span-2 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                     </div>
                ) : assessmentData ? (
                    <>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center">
                            <BarChart className="mr-2 h-5 w-5 text-primary" />
                            Strengths & Gaps
                        </h3>
                        <ChartContainer config={chartConfig} className="aspect-square h-full w-full">
                            <ResponsiveContainer>
                                <RadarChart data={assessmentData.chartData}>
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
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center">
                            <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                            AI Summary
                        </h3>
                        <div className="p-4 bg-muted rounded-lg flex-1">
                            <p className="text-sm whitespace-pre-line">{assessmentData.aiSummary}</p>
                        </div>
                    </div>
                    </>
                ) : (
                    <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center text-center">
                        <p className="text-muted-foreground">You haven&apos;t taken the assessment yet.</p>
                        <Button asChild className="mt-4">
                            <Link href="/assessment">Take Your First Assessment</Link>
                        </Button>
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
              ) : hasCompletedProfile ? (
                <>
                <div>
                  <h3 className="font-semibold text-md mb-2 flex items-center"><Wand2 className="w-4 h-4 mr-2 text-primary"/>Daily Tips</h3>
                  <div className="space-y-3">
                    {dailyTips.map((tip, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                   <h3 className="font-semibold text-md mb-2 flex items-center"><Wand2 className="w-4 h-4 mr-2 text-primary"/>Recommendations</h3>
                   <div className="space-y-3">
                    {recommendations.map((rec, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>Complete your business profile to unlock personalized AI insights.</p>
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <UsageSummary user={user} />
      </div>

      <div id="dashboard-news-insights" className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <NewsInsightsCard user={user} />
      </div>

      <UpgradeModal open={!!upgradeInfo} onOpenChange={(o) => { if (!o) setUpgradeInfo(null); }} upgrade={upgradeInfo} onUpgrade={() => window.location.href = '/settings?tab=plan'} />
    </div>
  );
}

function NewsInsightsCard({ user }: { user: any }) {
  const [brief, setBrief] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleGenerate = async () => {
    if (!user) return;
    setLoading(true);
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
    } catch (error) {
      console.error('Error generating brief:', error);
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
            <p className="text-sm">Click &quot;Generate Brief&quot; to get AI-curated news and tender recommendations for your industry.</p>
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

    