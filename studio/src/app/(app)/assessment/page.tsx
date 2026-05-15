
"use client";

import { useState, useMemo, useEffect, useRef, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Download, RefreshCw, Lightbulb, Loader2, Share2, Users } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { generateAssessmentSummary, GenerateAssessmentSummaryInput } from "@/ai/flows/generate-assessment-summary";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "@/contexts/auth-context";
import { checkAndDecrementUsage } from "@/services/usage-service";
import { saveAssessmentDraft, getAssessmentDraft, deleteAssessmentDraft, createAutoSave, watchNetworkStatus } from "@/services/offline";

const totalSteps = 15;
const questions = [
  // Each question is assigned a category
  {
    question: "How do you accept payments from your customers?",
    options: ["Cash only", "Primarily EcoCash/OneMoney", "Bank transfers and swipe machines", "Integrated online payment gateways (e.g., Paynow, DPO)"],
    category: "Payments",
  },
  {
    question: "How do you manage your business's tax compliance with ZIMRA?",
    options: ["Not yet registered", "Manual record keeping for a tax consultant", "Using spreadsheets to track everything", "Using accounting software with ZIMRA-compliant features"],
    category: "Finance",
  },
  {
    question: "Which statement best describes your online marketing?",
    options: ["Word of mouth only", "Active on WhatsApp & Facebook groups", "Running paid ads on social media", "Have a website with SEO and a multi-channel strategy"],
    category: "Marketing",
  },
  {
    question: "How do you manage your stock or inventory?",
    options: ["I just know what I have", "Pen and paper", "Excel or Google Sheets", "A dedicated inventory management system"],
    category: "Operations",
  },
  {
    question: "How do you handle customer support and inquiries?",
    options: ["On my personal phone number", "A dedicated business WhatsApp number", "Email and phone support", "A helpdesk or ticketing system"],
    category: "Customer Service",
  },
  {
    question: "What's your approach to business record-keeping?",
    options: ["I keep receipts in a box", "I write down sales and expenses in a book", "I use spreadsheets to track finances", "I use dedicated accounting software"],
    category: "Finance",
  },
  {
    question: "How does your business connect to the internet?",
    options: ["Mobile data on a phone", "A MIFI/dongle for the business", "ADSL/Fibre for the office", "Redundant connections (e.g., Fibre + LTE backup)"],
    category: "Infrastructure",
  },
  {
    question: "How do you manage your relationship with suppliers?",
    options: ["Informal WhatsApp messages", "Phone calls and verbal agreements", "Email orders and invoices", "A system for purchase orders and supplier management"],
    category: "Operations",
  },
  {
    question: "What is your company's data backup and security strategy?",
    options: ["No backups, data is on one device", "Occasional manual backups to a flash drive", "Automatic cloud backup (e.g., Google Drive)", "Encrypted backups and formal security policies"],
    category: "Infrastructure",
  },
  {
    question: "How do you get your products to customers?",
    options: ["Customers collect from me", "I deliver myself when I can", "Using local courier services (e.g., Hlanganiso, FedEx)", "An integrated logistics and delivery system"],
    category: "Operations",
  },
  {
    question: "How does your team collaborate on tasks?",
    options: ["We just talk to each other in person", "WhatsApp group for all communication", "Shared documents on Google Drive/Dropbox", "Project management tools like Trello or Asana"],
    category: "Customer Service",
  },
  {
    question: "How do you get information on new business tenders?",
    options: ["I hear about them from friends", "I check the newspapers", "I browse government and corporate websites", "I use a tender notification service"],
    category: "Marketing",
  },
  {
    question: "How do you handle foreign currency (USD) transactions and pricing?",
    options: ["I only deal in ZWL", "I use the official bank rate for conversions", "I use the prevailing 'street' rate for pricing", "I have a registered FCA account and price dually"],
    category: "Finance",
  },
  {
    question: "What is your strategy for employee skills development?",
    options: ["They learn on the job", "Informal peer-to-peer training", "I sponsor occasional external workshops", "We have a structured internal training program"],
    category: "Customer Service",
  },
  {
    question: "How do you use business data to make decisions?",
    options: ["Based on my gut feeling", "I look at my daily sales numbers", "I analyze monthly sales and expense reports", "I use data dashboards to track key performance indicators (KPIs)"],
    category: "Marketing",
  },
];

type Answers = {
    [key: number]: { answer: string; score: number };
};


export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [isFinished, setIsFinished] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState<any[] | null>(null);
  const [isLoadingBenchmark, setIsLoadingBenchmark] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, refreshUserData } = useContext(AuthContext);

  useEffect(() => {
    if (isFinished) {
      handleFinish();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  // Offline: resume draft on mount
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

  // Offline: auto-save every 30 seconds
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

  // Offline: network status watcher
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
      setAiSummary('');
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
    setAiSummary('');
    setBenchmarkData(null);
    if (user) deleteAssessmentDraft(user.uid);
  }

  const handleAnswerChange = (value: string) => {
    const questionIndex = currentStep - 1;
    const score = questions[questionIndex].options.indexOf(value) + 1;
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
    fetchBenchmarkData(); // Fire off benchmark calculation

     try {
        const usageResult = await checkAndDecrementUsage(user.uid, 'assessmentSummary');
        if (!usageResult.success) {
            setAiSummary(usageResult.message + "\n\nYou can still view your results chart and download the report.");
            await refreshUserData();
            return;
        }

        const assessmentData: GenerateAssessmentSummaryInput = {
            responses: Object.values(answers).map((a, index) => ({
                question: questions[index].question,
                answer: a.answer,
                score: a.score,
                category: questions[index].category,
            }))
        };

        const result = await generateAssessmentSummary(assessmentData);
        setAiSummary(result.summary);
        await saveAssessmentResults(assessmentData, result.summary);
        await refreshUserData();
        if (user) await deleteAssessmentDraft(user.uid);

    } catch (error) {
      console.error("Error generating or saving assessment:", error);
      setAiSummary("We couldn't generate your AI summary at the moment. Please try again later.");
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
      const querySnapshot = await getDocs(collection(db, "assessments"));
      const allResponses: any[] = [];
      querySnapshot.forEach((doc) => {
        allResponses.push(...doc.data().responses);
      });

      if (allResponses.length === 0) {
        setBenchmarkData([]);
        return;
      }

      const categoryTotals: { [key: string]: { totalScore: number, count: number } } = {};
      allResponses.forEach(response => {
        if (!categoryTotals[response.category]) {
          categoryTotals[response.category] = { totalScore: 0, count: 0 };
        }
        categoryTotals[response.category].totalScore += response.score;
        categoryTotals[response.category].count += 1;
      });

      const calculatedBenchmark = Object.entries(categoryTotals).map(([category, data]) => ({
        category,
        benchmarkScore: (data.totalScore / (data.count * 4)) * 100, // Normalized to 100
      }));
      setBenchmarkData(calculatedBenchmark);

    } catch (error) {
      console.error("Error fetching benchmark data:", error);
      toast({ title: "Benchmark Error", description: "Could not calculate SME benchmark data.", variant: "destructive" });
    } finally {
      setIsLoadingBenchmark(false);
    }
  };


  const saveAssessmentResults = async (assessmentData: GenerateAssessmentSummaryInput, summary: string) => {
    if (!user) return;

    try {
        await addDoc(collection(db, "assessments"), {
            userId: user.uid,
            responses: assessmentData.responses,
            summary: summary,
            createdAt: serverTimestamp(),
        });
        toast({
            title: "Assessment Saved!",
            description: "Your results have been saved to your profile.",
        });
    } catch (error) {
        console.error("Error saving assessment to Firestore:", error);
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
        pdf.save('Radbit_SME_Hub_Assessment_Report.pdf');

    } catch (error) {
        console.error("Error generating PDF:", error);
    } finally {
        setIsDownloading(false);
    }
  };

  const handleShare = () => {
    if (!aiSummary) return;
    const shareText = `*My Business Readiness Results from Radbit SME Hub:*\n\n${aiSummary}\n\nAssess your own business here: ${window.location.origin}/assessment`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  }

  const chartData = useMemo(() => {
    if (!isFinished) return [];

    const categoryScores: { [key: string]: { totalScore: number, count: number } } = {};

    questions.forEach((q, index) => {
      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { totalScore: 0, count: 0 };
      }
      categoryScores[q.category].totalScore += answers[index]?.score || 0;
      categoryScores[q.category].count += 1;
    });
    
    // Merge user scores with benchmark scores
    return Object.entries(categoryScores).map(([category, data]) => {
        const benchmark = benchmarkData?.find(b => b.category === category);
        return {
            category,
            yourScore: (data.totalScore / (data.count * 4)) * 100, // Normalize score to be out of 100
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

  const currentQuestion = questions[currentStep - 1];
  const remainingGenerations = (user as any)?.usage?.assessmentSummary?.remaining ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isFinished ? "Assessment Results" : "Digital Readiness Assessment"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isFinished
              ? "Here's a snapshot of your business's digital readiness."
              : `Step ${currentStep} of ${totalSteps}. Take the first step to digital transformation.`}
          </p>
           {isFinished && <p className="text-xs text-muted-foreground mt-1">AI Summary Generations Left: {remainingGenerations}</p>}
        </div>
         <div className="flex gap-2">
            {isFinished && (
                <>
                <Button variant="outline" onClick={handleShare} disabled={!aiSummary}>
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
             <div ref={resultsRef} className="grid lg:grid-cols-3 gap-8 pt-4 p-4">
                <div className="space-y-4 lg:col-span-2">
                    <h3 className="text-xl font-semibold flex items-center">
                        <Users className="mr-2 h-5 w-5 text-primary" />
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
                        AI-Generated Summary
                    </h3>
                    <div className="p-4 bg-muted rounded-lg min-h-[200px]">
                      {isGeneratingSummary ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[80%]" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-[60%]" />
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-line">{aiSummary}</p>
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
    </div>
  );
}
