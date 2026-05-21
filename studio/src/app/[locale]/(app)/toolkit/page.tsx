
'use client';

import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, Sparkles, Wand2, Download, Share2, FileText, FileDown } from 'lucide-react';
import { AuthContext } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { generateBusinessInsight } from '@/ai/flows/generate-business-insight';
import { checkAndDecrementUsage } from '@/services/usage-service';
import { UpgradeModal } from "@/components/upgrade-modal";
import type { UpgradeInfo } from "@/services/feature-gate";
import { MarkdownRenderer } from '@/components/markdown-renderer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportContent } from '@/services/export-service';

const formSchema = z.object({
  insightType: z.enum(
    [
      'profile_generator',
      'slogan_generator',
      'financial_projector',
      'competitor_analyzer',
      'grant_matcher',
      'marketing_copy',
      'compliance_check',
      'pitch_outline',
      'swot_analysis',
      'hr_policy',
      'supplier_negotiator',
      'export_coach',
    ],
    {
      required_error: 'Please select a tool.',
    }
  ),
  businessDescription: z
    .string()
    .min(20, { message: 'Please provide a description of at least 20 characters.' })
    .max(500, { message: 'Description cannot exceed 500 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

const toolOptions = [
  { value: 'profile_generator', label: 'Business Profile Generator' },
  { value: 'slogan_generator', label: 'Slogan Generator' },
  { value: 'financial_projector', label: '12-Month Financial Projector' },
  { value: 'competitor_analyzer', label: 'Competitor Analysis' },
  { value: 'grant_matcher', label: 'Grant & Funding Finder' },
  { value: 'marketing_copy', label: 'Marketing Copywriter' },
  { value: 'compliance_check', label: 'Compliance Quick-Check' },
  { value: 'pitch_outline', label: 'Pitch Deck Outline' },
  { value: 'swot_analysis', label: 'SWOT Analysis' },
  { value: 'hr_policy', label: 'HR Policy Generator' },
  { value: 'supplier_negotiator', label: 'Supplier Negotiator' },
  { value: 'export_coach', label: 'Export Coach' },
];

export default function AiToolkitPage() {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [upgradeInfo, setUpgradeInfo] = useState<UpgradeInfo | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessDescription: user?.businessDescription || '',
      insightType: undefined,
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to use the toolkit.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setGeneratedContent('');

    try {
      const usageResult = await checkAndDecrementUsage(user.uid, 'templateGeneration');
      if (!usageResult.success) {
        if (usageResult.upgrade) {
          setUpgradeInfo(usageResult.upgrade);
          setIsLoading(false);
          return;
        }
        toast({ title: 'Usage Limit Reached', description: usageResult.message, variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const response = await generateBusinessInsight({
        ...data,
        businessName: user?.businessName,
        industry: user?.industry,
      });

      setGeneratedContent(response.insight);
    } catch (error: any) {
      console.error('Error generating insight:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'docx' | 'md') => {
    if (!generatedContent) return;
    const selectedTool = toolOptions.find(t => t.value === form.getValues('insightType'));
    const title = selectedTool?.label || 'AI Toolkit Output';
    await exportContent({ title, content: generatedContent, format });
  };

  const handleShare = () => {
    if (!generatedContent) return;
    const shareText = `*AI Toolkit Result from Radbit SME Hub:*\n\n${generatedContent}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Business Toolkit</h1>
        <p className="text-muted-foreground mt-2">
          Your AI-powered assistant for common business tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Select a Tool</CardTitle>
                <CardDescription>
                  Choose a tool and provide a brief description of your business to get started.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="insightType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tool</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a tool from the list" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {toolOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'A small agribusiness in Mutare specializing in organic dried herbs for the local and export market.'"
                          className="min-h-[120px]"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                       <FormDescription>
                        The more detail you provide, the better the result.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Generate
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Generated Content
                    </CardTitle>
                    <CardDescription>
                        Your AI-generated result will appear here.
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handleShare} disabled={!generatedContent}>
                        <Share2 className="h-4 w-4"/>
                        <span className="sr-only">Share</span>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" disabled={!generatedContent}>
                                <Download className="h-4 w-4"/>
                                <span className="sr-only">Download</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownload('pdf')}>
                                <FileText className="h-4 w-4 mr-2" />
                                PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload('docx')}>
                                <FileDown className="h-4 w-4 mr-2" />
                                DOCX
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload('md')}>
                                <FileText className="h-4 w-4 mr-2" />
                                Markdown
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {generatedContent ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <MarkdownRenderer content={generatedContent} />
              </div>
            ) : !isLoading ? (
                <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                    <p>Your result will be shown here.</p>
                </div>
            ) : null
            }
          </CardContent>
        </Card>
      </div>
      <UpgradeModal open={!!upgradeInfo} onOpenChange={(o) => { if (!o) setUpgradeInfo(null); }} upgrade={upgradeInfo} onUpgrade={() => window.location.href = '/settings?tab=plan'} />
    </div>
  );
}
