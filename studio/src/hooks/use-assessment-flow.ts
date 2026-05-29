"use client";

import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "@/contexts/auth-context";
import { checkAndDecrementUsage } from "@/services/usage-service";
import { saveAssessmentDraft, getAssessmentDraft, deleteAssessmentDraft, watchNetworkStatus } from "@/services/offline";
import type { UpgradeInfo } from "@/services/feature-gate";

export interface AssessmentQuestion {
  question: string;
  options: string[];
  category: string;
}

export type Answers = Record<number, { answer: string; score: number }>;

export interface UseAssessmentFlowOptions {
  questions: AssessmentQuestion[];
  assessmentType: "assessment" | "export-assessment";
  usageFeature: "assessmentSummary" | "exportAssessment";
  generateSummary: (data: any) => Promise<any>;
  saveResults: (data: any, result: any) => Promise<void>;
  pdfFilename: string;
  whatsappDigest?: boolean;
}

export function useAssessmentFlow(options: UseAssessmentFlowOptions) {
  const {
    questions,
    assessmentType,
    usageFeature,
    generateSummary,
    saveResults,
    pdfFilename,
    whatsappDigest = false,
  } = options;

  const totalSteps = questions.length;
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [isFinished, setIsFinished] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState<any[] | null>(null);
  const [isLoadingBenchmark, setIsLoadingBenchmark] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState<UpgradeInfo | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, refreshUserData } = useContext(AuthContext);

  // Stable refs for auto-save closure and guard against double-fire
  const answersRef = useRef(answers);
  const currentStepRef = useRef(currentStep);
  const userRef = useRef(user);
  const finishStartedRef = useRef(false);
  const toastRef = useRef(toast);
  answersRef.current = answers;
  currentStepRef.current = currentStep;
  userRef.current = user;
  toastRef.current = toast;

  // Draft key includes assessment type to prevent collision
  const draftKey = user ? `${user.uid}-${assessmentType}` : null;

  // Resume draft on mount
  useEffect(() => {
    if (!user || !draftKey) return;
    let cancelled = false;

    (async () => {
      try {
        const draft = await getAssessmentDraft(draftKey);
        if (cancelled || !draft || draft.completed || draft.currentStep <= 1) return;

        const resume = window.confirm(
          `You were on question ${draft.currentStep} of ${totalSteps}. Resume where you left off?`
        );
        if (resume) {
          setCurrentStep(draft.currentStep);
          const restored: Answers = {};
          Object.entries(draft.answers).forEach(([key, val]) => {
            restored[Number(key)] = { answer: (val as any).answer, score: (val as any).score };
          });
          setAnswers(restored);
        } else {
          deleteAssessmentDraft(draftKey);
        }
      } catch (e) {
        console.error(`[${assessmentType}] Draft resume failed:`, e);
      }
    })();

    return () => { cancelled = true; };
  }, [user, draftKey, totalSteps, assessmentType]);

  // Auto-save every 30 seconds using refs for stable closure
  useEffect(() => {
    if (!user || !draftKey) return;

    const interval = setInterval(async () => {
      try {
        const draftAnswers: Record<number, { answer: string; score: number }> = {};
        Object.entries(answersRef.current).forEach(([key, val]) => {
          draftAnswers[Number(key)] = val;
        });
        await saveAssessmentDraft({
          id: draftKey,
          userId: userRef.current!.uid,
          currentStep: currentStepRef.current,
          answers: draftAnswers,
          startedAt: Date.now(),
          lastSavedAt: Date.now(),
          completed: false,
        });
      } catch (e) {
        console.error(`[${assessmentType}] Auto-save failed:`, e);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, draftKey, assessmentType]);

  // Network status watcher
  useEffect(() => {
    return watchNetworkStatus(
      () => toast({ title: 'Back online', description: 'Your data will sync automatically.' }),
      () => toast({ title: 'You\'re offline', description: 'Progress is saved locally until reconnection.' })
    );
  }, [toast]);

  const progress = (currentStep / totalSteps) * 100;

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1);
    } else {
      setIsFinished(true);
    }
  }, [currentStep, totalSteps]);

  const handleBack = useCallback(() => {
    if (isFinished) {
      setIsFinished(false);
      setCurrentStep(totalSteps);
      finishStartedRef.current = false;
      return;
    }
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  }, [isFinished, currentStep, totalSteps]);

  const handleRestart = useCallback(() => {
    setCurrentStep(1);
    setAnswers({});
    setIsFinished(false);
    setAiResult(null);
    setBenchmarkData(null);
    finishStartedRef.current = false;
    if (draftKey) deleteAssessmentDraft(draftKey);
  }, [draftKey]);

  const handleAnswerChange = useCallback((value: string) => {
    const questionIndex = currentStepRef.current - 1;
    const score = questions[questionIndex].options.indexOf(value) + 1;
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: { answer: value, score },
    }));
  }, [questions]);

  const fetchBenchmarkData = useCallback(async () => {
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
  }, []);

  // handleFinish is called directly, NOT via useEffect
  const handleFinish = useCallback(async () => {
    if (!user) {
      toastRef.current({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    if (finishStartedRef.current) return;
    finishStartedRef.current = true;

    setIsGeneratingSummary(true);
    setIsLoadingBenchmark(true);
    fetchBenchmarkData();

    try {
      // Build assessment data
      const assessmentData = {
        responses: Object.values(answers).map((a, index) => ({
          question: questions[index].question,
          answer: a.answer,
          score: a.score,
          category: questions[index].category,
        })),
        industry: (user as any)?.industry || undefined,
        businessName: (user as any)?.businessName || undefined,
        businessDescription: (user as any)?.businessDescription || undefined,
        userId: user.uid,
      };

      // Generate AI summary FIRST (before decrementing usage)
      let result: any;
      try {
        result = await generateSummary(assessmentData);
      } catch (e) {
        console.error(`[${assessmentType}] AI generation failed:`, e);
        setAiResult(assessmentType === "export-assessment"
          ? { readinessScore: 0, strengths: [], gaps: [], recommendedMarkets: [], requiredCertifications: [], summary: "We couldn't generate your AI summary at the moment. Please try again later." }
          : "We couldn't generate your AI summary at the moment. Please try again later."
        );
        toastRef.current({ title: "Error", description: "Failed to generate your assessment.", variant: "destructive" });
        finishStartedRef.current = false;
        return; // Don't decrement usage on AI failure
      }

      // Now decrement usage (after successful generation)
      const usageResult = await checkAndDecrementUsage(user.uid, usageFeature);
      if (!usageResult.success) {
        if (usageResult.upgrade) {
          setUpgradeInfo(usageResult.upgrade);
          finishStartedRef.current = false;
          return;
        }
        setAiResult(assessmentType === "export-assessment"
          ? { readinessScore: 0, strengths: [], gaps: [], recommendedMarkets: [], requiredCertifications: [], summary: usageResult.message + "\n\nYou can still view your results chart and download the report." }
          : usageResult.message + "\n\nYou can still view your results chart and download the report."
        );
        await refreshUserData();
        finishStartedRef.current = false;
        return;
      }

      setAiResult(result);
      await saveResults(assessmentData, result);
      await refreshUserData();
      if (draftKey) await deleteAssessmentDraft(draftKey);

      // Fire-and-forget WhatsApp digest (assessment only)
      if (whatsappDigest && user) {
        try {
          const idToken = await user.getIdToken();
          fetch('/api/whatsapp/schedule-assessment-digest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.uid, idToken }),
          }).catch((e) => console.error(`[${assessmentType}] schedule digest failed:`, e));
        } catch (e) {
          console.warn(`[${assessmentType}] non-blocking error:`, e);
        }
      }
    } catch (error) {
      console.error(`[${assessmentType}] Error:`, error);
      setAiResult(assessmentType === "export-assessment"
        ? { readinessScore: 0, strengths: [], gaps: [], recommendedMarkets: [], requiredCertifications: [], summary: "An unexpected error occurred." }
        : "An unexpected error occurred."
      );
      toastRef.current({ title: "Error", description: "Failed to generate or save your assessment.", variant: "destructive" });
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [user, answers, questions, assessmentType, usageFeature, generateSummary, saveResults, draftKey, whatsappDigest, refreshUserData, fetchBenchmarkData]);

  // Call handleFinish when isFinished becomes true
  useEffect(() => {
    if (isFinished) {
      handleFinish();
    }
  }, [isFinished, handleFinish]);

  const handleDownloadReport = useCallback(async () => {
    if (!resultsRef.current) return;
    setIsDownloading(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(resultsRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
      });

      const { default: jsPDF } = await import('jspdf');

      // A4 dimensions in points
      const a4Width = 595.28;
      const a4Height = 841.89;
      const margin = 40;
      const contentWidth = a4Width - margin * 2;
      const scaleRatio = contentWidth / canvas.width;
      const scaledHeight = canvas.height * scaleRatio;

      const pdf = new jsPDF({
        orientation: scaledHeight > a4Height ? 'landscape' : 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pageWidth = scaledHeight > a4Height ? a4Height : a4Width;
      const pageHeight = scaledHeight > a4Height ? a4Width : a4Height;
      const contentW = pageWidth - margin * 2;
      const ratio = contentW / canvas.width;
      const totalPageHeight = canvas.height * ratio;

      // Add image, handling multi-page if needed
      let yOffset = 0;
      let page = 0;
      while (yOffset < totalPageHeight) {
        if (page > 0) pdf.addPage();
        const srcY = (yOffset / ratio);
        const srcH = Math.min(pageHeight / ratio, canvas.height - srcY);
        const destH = srcH * ratio;

        // Create a sub-canvas for this page slice
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = srcH;
        const ctx = sliceCanvas.getContext('2d')!;
        ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

        pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, margin, contentW, destH);
        yOffset += pageHeight - margin * 2;
        page++;
      }

      pdf.save(pdfFilename);
      toast({ title: "Report downloaded", description: "Your assessment report has been saved." });
    } catch (error) {
      console.error(`[${assessmentType}] PDF generation error:`, error);
      toast({ title: "Download failed", description: "Could not generate the PDF report.", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  }, [assessmentType, pdfFilename, toast]);

  const handleShare = useCallback(() => {
    const summaryText = assessmentType === "export-assessment" ? aiResult?.summary : aiResult;
    if (!summaryText) return;

    const score = assessmentType === "export-assessment"
      ? aiResult?.readinessScore
      : (() => {
          let total = 0;
          for (let i = 0; i < questions.length; i++) total += answers[i]?.score || 0;
          return Math.round(total / (questions.length * 4) * 100);
        })();

    const category = assessmentType === "export-assessment" ? "Export%20Readiness" : "Digital%20Readiness";
    const pagePath = assessmentType === "export-assessment" ? "export-assessment" : "assessment";
    const scoreCardUrl = `${window.location.origin}/api/og/score?score=${score}&user=${encodeURIComponent(user?.displayName || 'My Business')}&category=${category}`;
    const shareText = `*My Score: ${score}/100 — ${assessmentType === "export-assessment" ? "Export Readiness" : "Digital Readiness"} Assessment* 🚀\n\n${summaryText}\n\nAssess your business: ${window.location.origin}/${pagePath}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + scoreCardUrl)}`;
    window.open(whatsappUrl, '_blank');
  }, [aiResult, assessmentType, questions, answers, user]);

  const chartData = (() => {
    if (!isFinished) return [];

    const categoryScores: Record<string, { totalScore: number; count: number }> = {};
    questions.forEach((q, index) => {
      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { totalScore: 0, count: 0 };
      }
      categoryScores[q.category].totalScore += answers[index]?.score || 0;
      categoryScores[q.category].count += 1;
    });

    return Object.entries(categoryScores).map(([category, data]) => {
      const benchmark = benchmarkData?.find((b: any) => b.category === category);
      return {
        category,
        yourScore: (data.totalScore / (data.count * 4)) * 100,
        benchmarkScore: benchmark?.benchmarkScore || 0,
      };
    });
  })();

  const chartConfig = {
    yourScore: { label: "Your Score", color: "hsl(var(--primary))" },
    benchmarkScore: { label: "SME Average", color: "hsl(var(--muted-foreground))" },
    category: { label: "Category" },
  };

  return {
    // State
    currentStep,
    answers,
    isFinished,
    aiResult,
    isGeneratingSummary,
    isDownloading,
    benchmarkData,
    isLoadingBenchmark,
    upgradeInfo,
    resultsRef,
    totalSteps,
    progress,
    chartData,
    chartConfig,
    remainingGenerations: user?.usage?.[usageFeature]?.remaining ?? 0,

    // Actions
    handleNext,
    handleBack,
    handleRestart,
    handleAnswerChange,
    handleFinish,
    handleDownloadReport,
    handleShare,
    setUpgradeInfo,
    setAiResult,

    // User
    user,
    questions,
  };
}
