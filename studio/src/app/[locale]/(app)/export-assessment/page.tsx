"use client";

import { useState, useMemo, useEffect, useRef, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Download, RefreshCw, Lightbulb, Loader2, Share2, Globe, CheckCircle2, AlertTriangle, BadgeCheck, Store } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { generateExportAssessment, GenerateExportAssessmentInput } from "@/ai/flows/generate-export-assessment";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "@/contexts/auth-context";
import { checkAndDecrementUsage } from "@/services/usage-service";
import { createNotification } from "@/services/notifications/notifications-service";
import { UpgradeModal } from "@/components/upgrade-modal";
import type { UpgradeInfo } from "@/services/feature-gate";
import { saveAssessmentDraft, getAssessmentDraft, deleteAssessmentDraft, createAutoSave, watchNetworkStatus } from "@/services/offline";
import { exportQuestions } from "@/data/export-assessment-questions";

const totalSteps = exportQuestions.length;

type Answers = {
    [key: number]: { answer: string; score: number };
};

export default function ExportAssessmentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [isFinished, setIsFinished] = useState(false);
  const [aiResult, setAiResult] = useState<{
    readinessScore: number;
    strengths: string[];
    gaps: string[];
    recommendedMarkets: string[];
    requiredCertifications: string[];
    summary: string;
  } | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState<any[] | null>(null);
  const [isLoadingBenchmark, setIsLoadingBenchmark] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState<UpgradeInfo | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, refreshUserData } = useContext(AuthContext);

  useEffect(() => {
    if (isFinished) {
      handleFinish();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const draft = await getAssessmentDraft(user.uid);
      if (draft && !draft.completed && draft.currentStep > 1) {
        const resume = window.confirm(`You were on question ${draft.currentStep} of ${totalSteps}. Resume where you left off?`);
        if (resume) {
          setCurrentStep(draft.currentStep);
          const restored: Answers = {};
          Object.entries(draft.answers).forEach(([key, val]) => {
            restored[Number(key)] = { answer: val.answer, score: val.score };
          });
          setAnswers(restored);
        } else {
          deleteAssessmentDraft(draft.id);
        }
      }
    })();
  }, [user]);

  const { start: startAutoSave, stop: stopAutoSave } = useMemo(() => {
    return createAutoSave(async () => {
      if (!user) return;
      const draftAnswers: Record<number, { answer: string; score: number }> = {};
      Object.entries(answers).forEach(([key, val]) => {
        draftAnswers[Number(key)] = val;
      });
      await saveAssessmentDraft({
        id: user.uid,
        userId: user.uid,
        currentStep,
        answers: draftAnswers,
        startedAt: Date.now(),
        lastSavedAt: Date.now(),
        completed: false,
      });
    }, 30000);
  }, [user, currentStep, answers]);

  useEffect(() => {
    if (!user) return;
    startAutoSave();
    return () => stopAutoSave();
  }, [startAutoSave, stopAutoSave, user]);

  useEffect(() => {
    return watchNetworkStatus(
      () => toast({ title: 'Back online', description: 'Your data will sync automatically.' }),
      () => toast({ title: 'You\'re offline', description: 'Progress is saved locally until reconnection.' })
    );
  }, [toast]);

  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleBack = () => {
    if (isFinished) {
      setIsFinished(false);
      setCurrentStep(totalSteps);
      setAiResult(null);
      setBenchmarkData(null);
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setAnswers({});
    setIsFinished(false);
    setAiResult(null);
    setBenchmarkData(null);
    if (user) deleteAssessmentDraft(user.uid);
  }

  const handleAnswerChange = (value: string) => {
    const questionIndex = currentStep - 1;
    const score = exportQuestions[questionIndex].options.indexOf(value) + 1;
    setAnswers({
        ...answers,
        [questionIndex]: { answer: value, score },
    });
  }

  const handleFinish = async () => {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
        return;
    }

    setIsGeneratingSummary(true);
    setIsLoadingBenchmark(true);
    fetchBenchmarkData();

     try {
        const usageResult = await checkAndDecrementUsage(user.uid, 'exportAssessment');
        if (!usageResult.success) {
            if (usageResult.upgrade) {
                setUpgradeInfo(usageResult.upgrade);
                setIsGeneratingSummary(false);
                setIsLoadingBenchmark(false);
                return;
            }
            setAiResult({
              readinessScore: 0,
              strengths: [],
              gaps: [],
              recommendedMarkets: [],
              requiredCertifications: [],
              summary: usageResult.message + "\n\nYou can still view your results chart and download the report.",
            });
            await refreshUserData();
            return;
        }

        const assessmentData: GenerateExportAssessmentInput = {
            responses: Object.values(answers).map((a, index) => ({
                question: exportQuestions[index].question,
                answer: a.answer,
                score: a.score,
                category: exportQuestions[index].category,
            }))
        };

        const result = await generateExportAssessment(assessmentData);
        setAiResult(result);
        await saveAssessmentResults(assessmentData, result);
        await refreshUserData();
        if (user) await deleteAssessmentDraft(user.uid);

    } catch (error) {
      console.error("Error generating or saving export assessment:", error);
      setAiResult({
        readinessScore: 0,
        strengths: [],
        gaps: [],
        recommendedMarkets: [],
        requiredCertifications: [],
        summary: "We couldn't generate your AI summary at the moment. Please try again later.",
      });
       toast({
        title: "Error",
        description: "Failed to generate or save your assessment.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  }

  const fetchBenchmarkData = async () => {
    try {
      setIsLoadingBenchmark(true);
      const res = await fetch('/api/assessments/benchmark');
      const data = await res.json();
      setBenchmarkData(data.benchmark || []);
    } catch {
      setBenchmarkData([]);
    } finally {
      setIsLoadingBenchmark(false);
    }
  };

  const saveAssessmentResults = async (assessmentData: GenerateExportAssessmentInput, result: typeof aiResult) => {
    if (!user || !result) return;

    try {
        await addDoc(collection(db, "export_assessments"), {
            userId: user.uid,
            responses: assessmentData.responses,
            readinessScore: result.readinessScore,
            strengths: result.strengths,
            gaps: result.gaps,
            recommendedMarkets: result.recommendedMarkets,
            requiredCertifications: result.requiredCertifications,
            summary: result.summary,
            createdAt: serverTimestamp(),
        });
        createNotification({
          userId: user.uid,
          title: "Export Assessment Complete",
          body: "Your Export Readiness Assessment results are ready. Check your recommended markets and certifications.",
          type: "assessment",
          read: false,
          link: "/dashboard",
        }).catch(() => {});
        toast({
            title: "Assessment Saved!",
            description: "Your results have been saved to your profile.",
        });
    } catch (error) {
        console.error("Error saving export assessment to Firestore:", error);
        toast({
            title: "Save Failed",
            description: "Could not save your assessment results. You can still view them here and download the report.",
            variant: "destructive",
        });
    }
  };

  const handleDownloadReport = async () => {
    if (!resultsRef.current) return;
    setIsDownloading(true);

    try {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(resultsRef.current, {
            useCORS: true,
            scale: 2,
            backgroundColor: null,
        });

        const imgData = canvas.toDataURL('image/png');
        const { default: jsPDF } = await import('jspdf');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('Radbit_Export_Readiness_Report.pdf');

    } catch (error) {
        console.error("Error generating PDF:", error);
    } finally {
        setIsDownloading(false);
    }
  };

  const handleShare = () => {
    if (!aiResult?.summary) return;

    const scoreCardUrl = `${window.location.origin}/api/og/score?score=${aiResult.readinessScore}&user=${encodeURIComponent(user?.displayName || 'My Business')}&category=Export%20Readiness`;
    const shareText = `*My Score: ${aiResult.readinessScore}/100 — Export Readiness Assessment* 🚀\n\n${aiResult.summary}\n\nAssess your business: ${window.location.origin}/export-assessment`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + scoreCardUrl)}`;
    window.open(whatsappUrl, '_blank');
  }

  const chartData = useMemo(() => {
    if (!isFinished) return [];

    const categoryScores: { [key: string]: { totalScore: number, count: number } } = {};

    exportQuestions.forEach((q, index) => {
      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { totalScore: 0, count: 0 };
      }
      categoryScores[q.category].totalScore += answers[index]?.score || 0;
      categoryScores[q.category].count += 1;
    });

    return Object.entries(categoryScores).map(([category, data]) => {
        const benchmark = benchmarkData?.find(b => b.category === category);
        return {
            category,
            yourScore: (data.totalScore / (data.count * 4)) * 100,
            benchmarkScore: benchmark?.benchmarkScore || 0,
        }
    });

  }, [isFinished, answers, benchmarkData]);

  const chartConfig = {
    yourScore: {
      label: "Your Score",
      color: "hsl(var(--primary))",
    },
    benchmarkScore: {
        label: "SME Average",
        color: "hsl(var(--muted-foreground))",
    },
    category: {
      label: "Category",
    },
  }

  const currentQuestion = exportQuestions[currentStep - 1];
  const remainingGenerations = user?.usage?.exportAssessment?.remaining ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isFinished ? "Export Readiness Results" : "Cross-Border Trade Readiness Diagnostic"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isFinished
              ? "Here's an overview of your business's export readiness."
              : `Step ${currentStep} of ${totalSteps}. Assess your readiness to trade across SADC borders.`}
          </p>
           {isFinished && <p className="text-xs text-muted-foreground mt-1">AI Summary Generations Left: {remainingGenerations}</p>}
        </div>
         <div className="flex gap-2">
            {isFinished && (
                <>
                <Button variant="outline" onClick={handleShare} disabled={!aiResult?.summary}>
                    <Share2 className="mr-2 h-4 w-4"/>
                    Share
                </Button>
                <Button variant="outline" onClick={handleDownloadReport} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4"/>}
                    {isDownloading ? 'Downloading...' : 'Download Report'}
                </Button>
                </>
            )}
            <Button variant="outline" size="icon" onClick={handleRestart}>
                <RefreshCw className="h-4 w-4"/>
                <span className="sr-only">Restart Assessment</span>
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
             <CardTitle className="text-xl">
                {isFinished ? "Your Results Overview" : `Question ${currentStep}`}
             </CardTitle>
             <Progress value={isFinished ? 100 : progress} className="w-1/3" />
          </div>
        </CardHeader>
        <CardContent className="min-h-[400px]">
          {!isFinished ? (
            <div className="w-full space-y-6">
              <h3 className="text-xl font-semibold text-center">{currentQuestion.question}</h3>
              <RadioGroup
                value={answers[currentStep - 1]?.answer || ""}
                onValueChange={handleAnswerChange}
                className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option) => (
                   <Label key={option} htmlFor={option} className="flex items-center space-x-3 rounded-md border p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:bg-primary [&:has([data-state=checked])]:text-primary-foreground transition-colors">
                    <RadioGroupItem value={option} id={option} />
                    <span>{option}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          ) : (
             <div ref={resultsRef} className="space-y-8 pt-4 p-4">
                {/* Readiness Score */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Export Readiness Score</h3>
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-primary text-4xl font-bold">
                    {isGeneratingSummary ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      aiResult?.readinessScore ?? 0
                    )}
                  </div>
                  <p className="text-muted-foreground mt-2">out of 100</p>
                </div>

                {/* Radar Chart & Summary */}
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="space-y-4 lg:col-span-2">
                      <h3 className="text-xl font-semibold flex items-center">
                          <Globe className="mr-2 h-5 w-5 text-primary" />
                          Your Score vs. SME Average
                      </h3>
                      {isLoadingBenchmark ? (
                          <div className="flex justify-center items-center h-full aspect-square">
                              <Loader2 className="h-8 w-8 animate-spin" />
                          </div>
                      ) : (
                          <ChartContainer config={chartConfig} className="aspect-square h-full w-full">
                              <ResponsiveContainer>
                                  <RadarChart data={chartData}>
                                      <ChartTooltip content={<ChartTooltipContent />} />
                                      <PolarAngleAxis dataKey="category" />
                                      <PolarGrid />
                                      <Legend />
                                      <Radar
                                          name="Your Score"
                                          dataKey="yourScore"
                                          stroke="hsl(var(--primary))"
                                          fill="hsl(var(--primary))"
                                          fillOpacity={0.6}
                                      />
                                      <Radar
                                          name="SME Average"
                                          dataKey="benchmarkScore"
                                          stroke="hsl(var(--muted-foreground))"
                                          fill="hsl(var(--muted-foreground))"
                                          fillOpacity={0.4}
                                      />
                                  </RadarChart>
                              </ResponsiveContainer>
                          </ChartContainer>
                      )}
                  </div>
                  <div className="space-y-4 lg:col-span-1">
                       <h3 className="text-xl font-semibold flex items-center">
                          <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                          AI Summary
                      </h3>
                       <div className="p-4 bg-muted rounded-lg min-h-[200px]">
                        {isGeneratingSummary ? (
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[80%]" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-[60%]" />
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-line">{aiResult?.summary}</p>
                        )}
                      </div>
                  </div>
                </div>

                {/* Strengths & Gaps */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center mb-4">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                      Strengths
                    </h3>
                    {isGeneratingSummary ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[60%]" />
                        <Skeleton className="h-4 w-[80%]" />
                        <Skeleton className="h-4 w-[50%]" />
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {aiResult?.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold flex items-center mb-4">
                      <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                      Gaps to Address
                    </h3>
                    {isGeneratingSummary ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[70%]" />
                        <Skeleton className="h-4 w-[50%]" />
                        <Skeleton className="h-4 w-[60%]" />
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {aiResult?.gaps.map((g, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Recommended Markets & Certifications */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center mb-4">
                      <Store className="mr-2 h-5 w-5 text-blue-500" />
                      Recommended Export Markets
                    </h3>
                    {isGeneratingSummary ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[50%]" />
                        <Skeleton className="h-4 w-[60%]" />
                        <Skeleton className="h-4 w-[40%]" />
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {aiResult?.recommendedMarkets.map((m, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Store className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold flex items-center mb-4">
                      <BadgeCheck className="mr-2 h-5 w-5 text-purple-500" />
                      Required Certifications
                    </h3>
                    {isGeneratingSummary ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[60%]" />
                        <Skeleton className="h-4 w-[50%]" />
                        <Skeleton className="h-4 w-[70%]" />
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {aiResult?.requiredCertifications.map((c, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <BadgeCheck className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 && !isFinished}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {!isFinished && (
            <Button onClick={handleNext} disabled={!answers[currentStep -1]}>
                {currentStep === totalSteps ? "Finish & See Results" : "Next"}
            </Button>
          )}
        </CardFooter>
      </Card>
        <UpgradeModal open={!!upgradeInfo} onOpenChange={(o) => { if (!o) setUpgradeInfo(null); }} upgrade={upgradeInfo} onUpgrade={() => window.location.href = '/settings?tab=plan'} />
    </div>
  );
}
