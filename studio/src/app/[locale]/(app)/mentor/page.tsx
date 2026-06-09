'use client';

import { useState, useContext, useEffect, useRef, useCallback } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Sparkles, Loader2, RefreshCw, Newspaper, Briefcase, Zap, Square } from 'lucide-react';
import { AuthContext } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { getMentorContext } from './actions';
import { useStreamingAI } from '@/hooks/use-streaming-ai';
import { checkFeatureAccess, checkAndDecrementUsage } from '@/services/usage-service';
import { UpgradeModal } from '@/components/upgrade-modal';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import type { UpgradeInfo } from '@/services/feature-gate';
import type { AppUser } from '@/types/user';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  id: number;
  status: 'pending' | 'sent' | 'error' | 'streaming';
  newsCount?: number;
  tenderCount?: number;
}

export default function MentorPage() {
  const { user: authUser } = useContext(AuthContext);
  const user = authUser as AppUser | null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState<UpgradeInfo | null>(null);
  const [includeContext, setIncludeContext] = useState(true);
  const [contextStats, setContextStats] = useState({ news: 0, tenders: 0 });
  const [systemPromptCache, setSystemPromptCache] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const aiMsgIdRef = useRef<number>(0);
  const { toast } = useToast();
  const { content, isStreaming: aiStreaming, error: aiError, stream, cancel } = useStreamingAI();

  const hasProfile = !!user?.industry;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!hasProfile) return;
    getMentorContext({
      userId: user!.uid,
      industry: user!.industry,
      businessName: user!.businessName,
      businessDescription: user!.businessDescription,
    }).then(res => {
      setSystemPromptCache(res.systemPrompt);
    }).catch(e => console.error('[Mentor] getMentorContext failed:', e));
  }, [hasProfile, user]);

  useEffect(() => {
    if (!aiMsgIdRef.current) return;

    if (aiStreaming && content) {
      setMessages(prev => prev.map(m =>
        m.id === aiMsgIdRef.current ? { ...m, text: content } : m
      ));
    } else if (!aiStreaming && content && !aiError) {
      setMessages(prev => prev.map(m =>
        m.id === aiMsgIdRef.current ? { ...m, text: content, status: 'sent' } : m
      ));
      setIsSubmitting(false);
      aiMsgIdRef.current = 0;
    } else if (!aiStreaming && aiError) {
      setMessages(prev => prev.map(m =>
        m.id === aiMsgIdRef.current ? { ...m, status: 'error', text: m.text || content } : m
      ));
      setIsSubmitting(false);
      aiMsgIdRef.current = 0;
      toast({ title: 'Error', description: aiError, variant: 'destructive' });
    }
  }, [content, aiStreaming, aiError, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !user || isSubmitting) return;

    const accessCheck = await checkFeatureAccess(user.uid, 'mentorChat');
    if (!accessCheck.allowed) {
      if (accessCheck.upgrade) {
        setUpgradeInfo(accessCheck.upgrade);
      } else {
        toast({ title: 'Usage Limit Reached', description: accessCheck.message, variant: 'destructive' });
      }
      return;
    }

    setIsSubmitting(true);
    const userMsgId = Date.now();
    const userMessage: Message = {
      text: input,
      sender: 'user',
      id: userMsgId,
      status: 'sent',
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    let currentContext = systemPromptCache;
    let newsCount = 0;
    let tenderCount = 0;

    if (includeContext && hasProfile) {
      try {
        if (!systemPromptCache) {
          const ctx = await getMentorContext({
            userId: user.uid,
            industry: user.industry,
            businessName: user.businessName,
            businessDescription: user.businessDescription,
          });
          currentContext = ctx.systemPrompt;
          newsCount = ctx.newsCount;
          tenderCount = ctx.tenderCount;
          setSystemPromptCache(currentContext);
          setContextStats({ news: newsCount, tenders: tenderCount });
        } else {
          newsCount = contextStats.news;
          tenderCount = contextStats.tenders;
        }
      } catch (ctxErr) {
        console.error('[Mentor] getMentorContext failed:', ctxErr);
        // Continue without context — AI can still answer based on user's message
      }
    }

    const aiMsgId = Date.now() + 1;
    aiMsgIdRef.current = aiMsgId;

    const aiMessage: Message = {
      text: '',
      sender: 'ai',
      id: aiMsgId,
      status: 'streaming',
      newsCount,
      tenderCount,
    };
    setMessages((prev) => [...prev, aiMessage]);

    checkAndDecrementUsage(user.uid, 'mentorChat').catch(() => {});

    stream({
      prompt: input,
      systemPrompt: includeContext && hasProfile ? currentContext : undefined,
      userId: user.uid,
    });
  };

  const handleCancel = () => {
    cancel();
    if (aiMsgIdRef.current) {
      setMessages(prev => prev.map(m =>
        m.id === aiMsgIdRef.current ? { ...m, status: 'sent', text: m.text || '(Cancelled)' } : m
      ));
    }
    aiMsgIdRef.current = 0;
    setIsSubmitting(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 pb-14 lg:pb-0">
      <div className="flex items-start justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            AI Business Mentor
          </h1>
          <p className="text-muted-foreground mt-2">
            Your personal guide — powered by live Zimbabwe news and tender data.
          </p>
        </div>
        {hasProfile && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Button
                variant={includeContext ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIncludeContext(!includeContext)}
                className="gap-1.5"
              >
                <Zap className="h-3.5 w-3.5" />
                {includeContext ? 'Context ON' : 'Context OFF'}
              </Button>
              {includeContext && contextStats.news > 0 && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Newspaper className="h-3 w-3" />
                  {contextStats.news} articles
                </Badge>
              )}
              {includeContext && contextStats.tenders > 0 && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Briefcase className="h-3 w-3" />
                  {contextStats.tenders} tenders
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {!hasProfile && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 shrink-0">
          <Sparkles className="h-4 w-4" />
          <span>Set your industry in Settings to get news-aware answers and tender recommendations</span>
        </div>
      )}

      <Card className="flex-1 flex flex-col min-h-0 mt-6">
        <CardHeader className="shrink-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Chat with your Mentor
          </CardTitle>
          <CardDescription className="text-xs">
            {includeContext && hasProfile
              ? 'Your business profile, live news, and tender opportunities are included in every answer.'
              : 'Ask questions about starting, running, or growing your business in Zimbabwe.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden min-h-0">
          <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">AI</AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-3 bg-muted max-w-[85%]">
                  <p className="text-sm">
                    {user?.businessName
                      ? `Hello! I'm your AI Business Mentor. I've been briefed on ${user.businessName} in the ${user.industry || 'general business'} sector. I'll reference the latest Zimbabwe news and tender opportunities in my answers. How can I help?`
                      : 'Hello! I\'m your AI Business Mentor for Zimbabwean SMEs. Complete your business profile in Settings to unlock personalized answers powered by live news and tender data.'}
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
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg px-4 py-3 max-w-[85%] ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.sender === 'ai' && (message.newsCount || message.tenderCount) && message.status !== 'streaming' && (
                      <div className="flex items-center gap-2 mb-2 -mt-1">
                        <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary gap-1">
                          <Zap className="h-3 w-3" />
                          Based on {message.newsCount} articles + {message.tenderCount} tenders
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <div className="text-sm min-w-0 [&_.prose]:text-sm">
                        {message.text ? (
                          <MarkdownRenderer content={message.text} />
                        ) : message.status === 'streaming' ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="h-3 w-1 bg-primary animate-pulse" />
                          </span>
                        ) : null}
                        {message.status === 'streaming' && aiStreaming && (
                          <span className="inline-flex items-center gap-1 ml-0.5">
                            <span className="h-3 w-0.5 bg-primary animate-pulse" />
                          </span>
                        )}
                      </div>
                      {message.sender === 'user' && message.status === 'error' && (
                        <RefreshCw className="h-4 w-4 shrink-0 mt-1 opacity-70" aria-label="Failed" />
                      )}
                    </div>
                  </div>
                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'Your avatar'} />
                      <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isSubmitting && !messages.find(m => m.status === 'streaming') && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-4 py-3 bg-muted flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs text-muted-foreground">
                      {includeContext && hasProfile ? 'Fetching latest news...' : 'Thinking...'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t border-border/50 pt-4 shrink-0">
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Input
              name="message"
              placeholder={includeContext && hasProfile ? 'Ask about regulatory changes, tender opportunities...' : 'Ask about your business...'}
              className="flex-1"
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSubmitting}
            />
            {aiStreaming ? (
              <Button type="button" size="icon" variant="outline" onClick={handleCancel}>
                <Square className="h-4 w-4" />
                <span className="sr-only">Stop</span>
              </Button>
            ) : (
              <Button type="submit" size="icon" disabled={isSubmitting || !input.trim()}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
              </Button>
            )}
          </form>
        </CardFooter>
      </Card>
      <UpgradeModal open={!!upgradeInfo} onOpenChange={(o) => { if (!o) setUpgradeInfo(null); }} upgrade={upgradeInfo} onUpgrade={() => window.location.href = '/settings?tab=plan'} />
    </div>
  );
}
