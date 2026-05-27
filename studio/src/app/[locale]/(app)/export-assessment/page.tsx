"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Download, RefreshCw, Lightbulb, Loader2, Share2, Globe, CheckCircle2, AlertTriangle, BadgeCheck, Store } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { generateExportAssessment } from "@/ai/flows/generate-export-assessment";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { createNotification } from "@/services/notifications/notifications-service";
import { UpgradeModal } from "@/components/upgrade-modal";
import { useAssessmentFlow } from "@/hooks/use-assessment-flow";
import { exportQuestions } from "@/data/export-assessment-questions";

export default function ExportAssessmentPage() {
  const flow = useAssessmentFlow({
    questions: exportQuestions,
    assessmentType: "export-assessment",
    usageFeature: "exportAssessment",
    generateSummary: generateExportAssessment,
    saveResults: async (data, result) => {
      const { user } = flow;
      if (!user || !result) return;
      try {
        await addDoc(collection(db, "export_assessments"), {
          userId: user.uid,
          responses: data.responses,
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
        }).catch((e) => console.error("[ExportAssessment] notification failed:", e));
      } catch (e) {
        console.error("[ExportAssessment] save failed:", e);
      }
    },
    pdfFilename: "Radbit_Export_Readiness_Report.pdf",
  });

  const currentQuestion = flow.questions[flow.currentStep - 1];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {flow.isFinished ? "Export Readiness Results" : "Cross-Border Trade Readiness Diagnostic"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {flow.isFinished
              ? "Here's an overview of your business's export readiness."
              : `Step ${flow.currentStep} of ${flow.totalSteps}. Assess your readiness to trade across SADC borders.`}
          </p>
          {flow.isFinished && <p className="text-xs text-muted-foreground mt-1">AI Summary Generations Left: {flow.remainingGenerations}</p>}
        </div>
        <div className="flex gap-2">
          {flow.isFinished && (
            <>
              <Button variant="outline" onClick={flow.handleShare} disabled={!flow.aiResult?.summary}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" onClick={flow.handleDownloadReport} disabled={flow.isDownloading}>
                {flow.isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                {flow.isDownloading ? "Downloading..." : "Download Report"}
              </Button>
            </>
          )}
          <Button variant="outline" size="icon" onClick={flow.handleRestart}>
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Restart Assessment</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-xl">
              {flow.isFinished ? "Your Results Overview" : `Question ${flow.currentStep}`}
            </CardTitle>
            <Progress value={flow.isFinished ? 100 : flow.progress} className="w-1/3" />
          </div>
        </CardHeader>
        <CardContent className="min-h-[400px]">
          {!flow.isFinished ? (
            <div className="w-full space-y-6">
              <h3 className="text-xl font-semibold text-center">{currentQuestion.question}</h3>
              <RadioGroup
                value={flow.answers[flow.currentStep - 1]?.answer || ""}
                onValueChange={flow.handleAnswerChange}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {currentQuestion.options.map((option, i) => (
                  <Label
                    key={option}
                    htmlFor={`q${flow.currentStep}-${i}`}
                    className="flex items-center space-x-3 rounded-md border p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:bg-primary [&:has([data-state=checked])]:text-primary-foreground transition-colors"
                  >
                    <RadioGroupItem value={option} id={`q${flow.currentStep}-${i}`} />
                    <span>{option}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          ) : (
            <div ref={flow.resultsRef} className="space-y-8 pt-4 p-4">
              {/* Readiness Score */}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Export Readiness Score</h3>
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-primary text-4xl font-bold" aria-label={`Readiness score: ${flow.aiResult?.readinessScore ?? 0} out of 100`}>
                  {flow.isGeneratingSummary ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    flow.aiResult?.readinessScore ?? 0
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
                  {flow.isLoadingBenchmark ? (
                    <div className="flex justify-center items-center h-full aspect-square">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <ChartContainer config={flow.chartConfig} className="aspect-square h-full w-full" aria-label="Radar chart showing your export readiness scores compared to SME average">
                      <ResponsiveContainer>
                        <RadarChart data={flow.chartData}>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <PolarAngleAxis dataKey="category" />
                          <PolarGrid />
                          <Legend />
                          <Radar name="Your Score" dataKey="yourScore" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                          <Radar name="SME Average" dataKey="benchmarkScore" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.4} />
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
                    {flow.isGeneratingSummary ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[80%]" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[60%]" />
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-line">{flow.aiResult?.summary}</p>
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
                  {flow.isGeneratingSummary ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[60%]" />
                      <Skeleton className="h-4 w-[80%]" />
                      <Skeleton className="h-4 w-[50%]" />
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {flow.aiResult?.strengths?.map((s: string, i: number) => (
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
                  {flow.isGeneratingSummary ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[70%]" />
                      <Skeleton className="h-4 w-[50%]" />
                      <Skeleton className="h-4 w-[60%]" />
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {flow.aiResult?.gaps?.map((g: string, i: number) => (
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
                  {flow.isGeneratingSummary ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[50%]" />
                      <Skeleton className="h-4 w-[60%]" />
                      <Skeleton className="h-4 w-[40%]" />
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {flow.aiResult?.recommendedMarkets?.map((m: string, i: number) => (
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
                  {flow.isGeneratingSummary ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[60%]" />
                      <Skeleton className="h-4 w-[50%]" />
                      <Skeleton className="h-4 w-[70%]" />
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {flow.aiResult?.requiredCertifications?.map((c: string, i: number) => (
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
          <Button variant="outline" onClick={flow.handleBack} disabled={flow.currentStep === 1 && !flow.isFinished}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {!flow.isFinished && (
            <Button onClick={flow.handleNext} disabled={!flow.answers[flow.currentStep - 1]}>
              {flow.currentStep === flow.totalSteps ? "Finish & See Results" : "Next"}
            </Button>
          )}
        </CardFooter>
      </Card>
      <UpgradeModal
        open={!!flow.upgradeInfo}
        onOpenChange={(o) => { if (!o) flow.setUpgradeInfo(null); }}
        upgrade={flow.upgradeInfo}
        onUpgrade={() => { window.location.href = "/settings?tab=plan"; }}
      />
    </div>
  );
}
