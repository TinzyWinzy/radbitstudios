'use client';

import { useState, useContext, useEffect, useRef } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Landmark, Loader2, FileText, AlertTriangle, Scale } from 'lucide-react';
import { AuthContext } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { searchRelevantContext } from '@/services/ai/rag';
import { generateTaxAnswer } from '@/ai/flows/tax-copilot';
import { checkFeatureAccess, checkAndDecrementUsage } from '@/services/usage-service';
import { UpgradeModal } from '@/components/upgrade-modal';
import type { UpgradeInfo } from '@/services/feature-gate';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  status: 'pending' | 'sent' | 'error';
  regulations?: string[];
  disclaimers?: string[];
  sources?: string[];
}

export default function TaxCopilotPage() {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState<UpgradeInfo | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      setTimeout(() => {
        const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) viewport.scrollTop = viewport.scrollHeight;
      }, 100);
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !user || isSubmitting) return;

    const accessCheck = await checkFeatureAccess(user.uid, 'taxCopilot');
    if (!accessCheck.allowed) {
      if (accessCheck.upgrade) {
        setUpgradeInfo(accessCheck.upgrade);
        return;
      }
      toast({ title: 'Usage Limit Reached', description: accessCheck.message, variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    const userMessage: Message = {
      text: input,
      sender: 'user',
      id: Date.now(),
      status: 'pending',
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const searchQuery = user?.industry ? `${input} ${user.industry} tax compliance` : input;
      const ragResults = await searchRelevantContext(searchQuery, 5, 0.5);
      const context = ragResults.map(r => ({
        content: r.content,
        source: r.metadata.source || 'ZIMRA Guidelines',
        score: r.score,
      }));

      const appUser = user as any;
      const response = await generateTaxAnswer({
        query: input,
        context,
        industry: appUser?.industry || undefined,
        businessName: appUser?.businessName || undefined,
        businessDescription: appUser?.businessDescription || undefined,
      });

      checkAndDecrementUsage(user.uid, 'taxCopilot').catch(() => {});

      setMessages((prev) =>
        prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg))
      );

      const sources = ragResults.map(r => r.metadata.source || 'ZIMRA Guidelines').filter((v, i, a) => a.indexOf(v) === i);
      const aiMessage: Message = {
        text: response.answer,
        sender: 'ai',
        id: Date.now() + 1,
        status: 'sent',
        regulations: response.regulations,
        disclaimers: response.disclaimers,
        sources,
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error) || 'Sorry, I encountered an error. Please try again.';
      toast({ title: 'Error', description: errMsg, variant: 'destructive' });
      setMessages((prev) =>
        prev.map((msg) => msg.id === userMessage.id ? { ...msg, status: 'error' } : msg)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100dvh-10rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Landmark className="h-7 w-7 text-primary" />
          ZIMRA Tax Co-Pilot
        </h1>
        <p className="text-muted-foreground mt-2">
          Ask questions about ZIMRA tax compliance, VAT, PAYE, customs duties, and more.
        </p>
      </div>

      <Card className="flex-1 flex flex-col mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-4 w-4 text-primary" />
            Ask a Tax Question
          </CardTitle>
          <CardDescription className="text-xs">
            Answers are powered by official ZIMRA guidelines and trade agreements. Always verify with a registered tax practitioner.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">TA</AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-3 bg-muted max-w-[85%]">
                  <p className="text-sm">
                    Hello! I am your ZIMRA Tax Co-Pilot. I can help you understand tax regulations for Zimbabwean SMEs. Ask me about VAT, PAYE, corporate income tax, customs duties, and more.
                  </p>
                </div>
              </div>

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}
                >
                  {message.sender === 'ai' && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">TA</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg px-4 py-3 max-w-[85%] ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.sender === 'ai' && (
                      <>
                        {message.sources && message.sources.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {message.sources.map((src, i) => (
                              <Badge key={i} variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary gap-1">
                                <FileText className="h-3 w-3" />
                                {src}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <p className="text-sm whitespace-pre-line">{message.text}</p>

                        {message.regulations && message.regulations.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/40">
                            <p className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                              <Scale className="h-3 w-3" />
                              Applicable Regulations
                            </p>
                            <ul className="space-y-1">
                              {message.regulations.map((reg, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                  <span className="text-primary mt-0.5">•</span>
                                  {reg}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {message.disclaimers && message.disclaimers.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/40">
                            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1.5 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Disclaimer
                            </p>
                            <ul className="space-y-1">
                              {message.disclaimers.map((d, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                  <span className="text-amber-500 mt-0.5">⚠</span>
                                  {d}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                    {message.sender === 'user' && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                        {message.status === 'error' && (
                          <span className="text-xs text-destructive">Failed</span>
                        )}
                      </div>
                    )}
                  </div>
                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isSubmitting && messages[messages.length - 1]?.sender === 'user' && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">TA</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-4 py-3 bg-muted flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs text-muted-foreground">Searching ZIMRA guidelines...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Input
              name="query"
              placeholder="e.g. What is the VAT registration threshold?"
              className="flex-1"
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSubmitting}
            />
            <Button type="submit" size="icon" disabled={isSubmitting || !input.trim()}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
      <UpgradeModal open={!!upgradeInfo} onOpenChange={(o) => { if (!o) setUpgradeInfo(null); }} upgrade={upgradeInfo} onUpgrade={() => window.location.href = '/settings?tab=plan'} />
    </div>
  );
}
