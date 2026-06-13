"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Download, RefreshCw, Lightbulb, Loader2, Share2, Users } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { generateAssessmentSummary } from "@/ai/flows/generate-assessment-summary";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { createNotification } from "@/services/notifications/notifications-service";
import { UpgradeModal } from "@/components/upgrade-modal";
import { useAssessmentFlow, type AssessmentQuestion } from "@/hooks/use-assessment-flow";
import { withRetry } from "@/lib/retry";

const questions: AssessmentQuestion[] = [
  { question: "How do you accept payments from your customers?", options: ["Cash only", "Primarily EcoCash/OneMoney", "Bank transfers and swipe machines", "Integrated online payment gateways (e.g., Paynow, DPO)"], category: "Payments" },
  { question: "How do you manage your business's tax compliance with ZIMRA?", options: ["Not yet registered", "Manual record keeping for a tax consultant", "Using spreadsheets to track everything", "Using accounting software with ZIMRA-compliant features"], category: "Finance" },
  { question: "Which statement best describes your online marketing?", options: ["Word of mouth only", "Active on WhatsApp & Facebook groups", "Running paid ads on social media", "Have a website with SEO and a multi-channel strategy"], category: "Marketing" },
  { question: "How do you manage your stock or inventory?", options: ["I just know what I have", "Pen and paper", "Excel or Google Sheets", "A dedicated inventory management system"], category: "Operations" },
  { question: "How do you handle customer support and inquiries?", options: ["On my personal phone number", "A dedicated business WhatsApp number", "Email and phone support", "A helpdesk or ticketing system"], category: "Customer Service" },
  { question: "What's your approach to business record-keeping?", options: ["I keep receipts in a box", "I write down sales and expenses in a book", "I use spreadsheets to track finances", "I use dedicated accounting software"], category: "Finance" },
  { question: "How does your business connect to the internet?", options: ["Mobile data on a phone", "A MIFI/dongle for the business", "ADSL/Fibre for the office", "Redundant connections (e.g., Fibre + LTE backup)"], category: "Infrastructure" },
  { question: "How do you manage your relationship with suppliers?", options: ["Informal WhatsApp messages", "Phone calls and verbal agreements", "Email orders and invoices", "A system for purchase orders and supplier management"], category: "Operations" },
  { question: "What is your company's data backup and security strategy?", options: ["No backups, data is on one device", "Occasional manual backups to a flash drive", "Automatic cloud backup (e.g., Google Drive)", "Encrypted backups and formal security policies"], category: "Infrastructure" },
  { question: "How do you get your products to customers?", options: ["Customers collect from me", "I deliver myself when I can", "Using local courier services (e.g., Hlanganiso, FedEx)", "An integrated logistics and delivery system"], category: "Operations" },
  { question: "How does your team collaborate on tasks?", options: ["We just talk to each other in person", "WhatsApp group for all communication", "Shared documents on Google Drive/Dropbox", "Project management tools like Trello or Asana"], category: "Customer Service" },
  { question: "How do you get information on new business tenders?", options: ["I hear about them from friends", "I check the newspapers", "I browse government and corporate websites", "I use a tender notification service"], category: "Marketing" },
  { question: "How do you handle foreign currency (USD) transactions and pricing?", options: ["I only deal in ZWL", "I use the official bank rate for conversions", "I use the prevailing 'street' rate for pricing", "I have a registered FCA account and price dually"], category: "Finance" },
  { question: "What is your strategy for employee skills development?", options: ["They learn on the job", "Informal peer-to-peer training", "I sponsor occasional external workshops", "We have a structured internal training program"], category: "Customer Service" },
  { question: "How do you use business data to make decisions?", options: ["Based on my gut feeling", "I look at my daily sales numbers", "I analyze monthly sales and expense reports", "I use data dashboards to track key performance indicators (KPIs)"], category: "Marketing" },
];

export default function AssessmentPage() {
  const flow = useAssessmentFlow({
    questions,
    assessmentType: "assessment",
    usageFeature: "assessmentSummary",
    generateSummary: generateAssessmentSummary,
    saveResults: async (data, summary) => {
      const { user } = flow;
      if (!user) return;
      const summaryText = typeof summary === 'string' ? summary : summary?.summary || JSON.stringify(summary);
      try {
        await withRetry(() => addDoc(collection(db, "assessments"), {
          userId: user.uid,
          responses: data.responses,
          summary: summaryText,
          createdAt: serverTimestamp(),
        }), 3);
        createNotification({
          userId: user.uid,
          title: "Assessment Complete",
          body: "Your Digital Readiness Assessment results are ready. View your personalized insights on the dashboard.",
          type: "assessment",
          read: false,
          link: "/dashboard",
        }).catch((e) => console.error("[Assessment] notification failed:", e));
      } catch (e) {
        console.error("[Assessment] save failed:", e);
      }
    },
    pdfFilename: "Radbit_Assessment_Report.pdf",
    whatsappDigest: true,
  });

  const currentQuestion = flow.questions[flow.currentStep - 1];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {flow.isFinished ? "Assessment Results" : "Digital Readiness Assessment"}
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2">
            {flow.isFinished
              ? "Here's a snapshot of your business's digital readiness."
              : `Step ${flow.currentStep} of ${flow.totalSteps}. Take the first step to digital transformation.`}
          </p>
          {flow.isFinished && <p className="text-xs text-muted-foreground mt-1">AI Summary Generations Left: {flow.remainingGenerations}</p>}
        </div>
        <div className="flex gap-2 sm:self-start">
          {flow.isFinished && (
            <>
              <Button variant="outline" size="sm" onClick={flow.handleShare} disabled={!flow.aiResult}>
                <Share2 className="mr-1.5 h-3.5 w-3.5" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={flow.handleDownloadReport} disabled={flow.isDownloading}>
                {flow.isDownloading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
                {flow.isDownloading ? "Saving..." : "Download"}
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
            <CardTitle className="text-lg sm:text-xl">
              {flow.isFinished ? "Your Results Overview" : `Question ${flow.currentStep}`}
            </CardTitle>
            <Progress value={flow.isFinished ? 100 : flow.progress} className="w-1/3 sm:w-1/4" />
          </div>
        </CardHeader>
        <CardContent className="min-h-[300px] sm:min-h-[400px]">
          {!flow.isFinished ? (
            <div className="w-full space-y-6">
              <h3 className="text-lg sm:text-xl font-semibold text-center leading-relaxed">{currentQuestion.question}</h3>
              <RadioGroup
                value={flow.answers[flow.currentStep - 1]?.answer || ""}
                onValueChange={flow.handleAnswerChange}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {currentQuestion.options.map((option, i) => (
                  <Label
                    key={option}
                    htmlFor={`q${flow.currentStep}-${i}`}
                    className="flex items-center gap-2 sm:gap-3 rounded-md border p-3 sm:p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:bg-primary [&:has([data-state=checked])]:text-primary-foreground transition-colors cursor-pointer text-sm"
                  >
                    <RadioGroupItem value={option} id={`q${flow.currentStep}-${i}`} className="shrink-0" />
                    <span className="leading-snug">{option}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          ) : (
            <div ref={flow.resultsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="space-y-4 lg:col-span-2">
                <h3 className="text-lg sm:text-xl font-semibold flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary shrink-0" />
                  Your Score vs. SME Average
                </h3>
                {flow.isLoadingBenchmark ? (
                  <div className="flex justify-center items-center h-full aspect-square max-h-[280px] sm:max-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <ChartContainer config={flow.chartConfig} className="aspect-square w-full max-w-full max-h-[280px] sm:max-h-[400px]" aria-label="Radar chart showing your assessment scores compared to SME average">
                    <ResponsiveContainer>
                      <RadarChart data={flow.chartData}>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                        <PolarGrid />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Radar name="Your Score" dataKey="yourScore" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                        <Radar name="SME Average" dataKey="benchmarkScore" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </div>
              <div className="space-y-3 lg:col-span-1">
                <h3 className="text-lg sm:text-xl font-semibold flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5 text-primary shrink-0" />
                  AI-Generated Summary
                </h3>
                <div className="p-3 sm:p-4 bg-muted rounded-lg min-h-[150px] sm:min-h-[200px]">
                  {flow.isGeneratingSummary ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[80%]" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-[60%]" />
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-line leading-relaxed">{flow.aiResult}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" onClick={flow.handleBack} disabled={flow.currentStep === 1 && !flow.isFinished}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {!flow.isFinished && (
            <Button size="sm" onClick={flow.handleNext} disabled={!flow.answers[flow.currentStep - 1]}>
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
