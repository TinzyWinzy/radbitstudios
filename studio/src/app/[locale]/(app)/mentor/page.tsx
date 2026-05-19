'use client';

import { useState, useContext, useEffect, useRef } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Sparkles, Loader2, RefreshCw, Newspaper, Briefcase, Zap } from 'lucide-react';
import { AuthContext } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { sendMessageAction, sendMessageWithNews } from './actions';
import { checkAndDecrementUsage } from '@/services/usage-service';
import { UpgradeModal } from '@/components/upgrade-modal';
import type { UpgradeInfo } from '@/services/feature-gate';
import type { User } from 'firebase/auth';

interface CustomUser extends User {
  businessName?: string;
  industry?: string;
  businessDescription?: string;
}

interface Message {
  text: string;
  sender: 'user' | 'ai';
  id: number;
  status: 'pending' | 'sent' | 'error';
  hasNewsContext?: boolean;
  hasTenderContext?: boolean;
}

export default function MentorPage() {
  const { user: authUser } = useContext(AuthContext);
  const user = authUser as CustomUser | null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState<UpgradeInfo | null>(null);
  const [includeContext, setIncludeContext] = useState(true);
  const [contextStats, setContextStats] = useState({ news: 0, tenders: 0 });
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const hasProfile = !!(user as any)?.industry;

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

    const usageResult = await checkAndDecrementUsage(user.uid, 'mentorChat');
    if (!usageResult.success) {
      if (usageResult.upgrade) {
        setUpgradeInfo(usageResult.upgrade);
        return;
      }
      toast({ title: 'Usage Limit Reached', description: usageResult.message, variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    const userMessage: Message = {
      text: input,
      sender: 'user',
      id: Date.now(),
      status: 'pending',
      hasNewsContext: includeContext && hasProfile,
      hasTenderContext: includeContext && hasProfile,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      let response: { answer: string; newsCount?: number; tenderCount?: number };
      if (includeContext && hasProfile) {
        response = await sendMessageWithNews({
          userId: user.uid,
          query: input,
          businessName: user.businessName,
          industry: user.industry,
          businessDescription: user.businessDescription,
        });
        setContextStats({ news: response.newsCount || 0, tenders: response.tenderCount || 0 });
      } else {
        const simple = await sendMessageAction({
          query: input,
          businessName: user.businessName,
          industry: user.industry,
          businessDescription: user.businessDescription,
        });
        response = { answer: simple.answer };
      }

      setMessages((prev) =>
        prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg))
      );

      const aiMessage: Message = {
        text: response.answer,
        sender: 'ai',
        id: Date.now() + 1,
        status: 'sent',
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error: any) {
      const errMsg = error.message || 'Sorry, I encountered an error. Please try again.';
      toast({ title: 'Error', description: errMsg, variant: 'destructive' });
      setMessages((prev) =>
        prev.map((msg) => msg.id === userMessage.id ? { ...msg, status: 'error' } : msg)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex items-start justify-between">
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
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <Sparkles className="h-4 w-4" />
          <span>Set your industry in Settings to get news-aware answers and tender recommendations</span>
        </div>
      )}

      <Card className="flex-1 flex flex-col mt-6">
        <CardHeader>
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
        <CardContent className="flex-1 overflow-hidden">
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
                    {message.sender === 'ai' && (message.hasNewsContext || message.hasTenderContext) && (
                      <div className="flex items-center gap-2 mb-2 -mt-1">
                        <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary gap-1">
                          <Zap className="h-3 w-3" />
                          Based on {contextStats.news} articles + {contextStats.tenders} tenders
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      {message.sender === 'user' && message.status === 'error' && (
                        <RefreshCw className="h-4 w-4 shrink-0 opacity-70" aria-label="Failed" />
                      )}
                    </div>
                  </div>
                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={user?.photoURL || undefined} alt="@user" />
                      <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isSubmitting && messages[messages.length - 1]?.sender === 'user' && (
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
        <CardFooter>
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