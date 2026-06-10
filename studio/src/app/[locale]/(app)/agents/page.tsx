'use client';

import { useState, useContext, useRef, useEffect, useCallback } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Send, Loader2, Users, Sparkles, ChevronRight, Zap, Clock,
} from 'lucide-react';
import { AuthContext } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { runMultiAgentWorkflow, listAvailableAgents } from '@/ai/agents/workflow';
import type { AppUser } from '@/types/user';
import type { WorkflowResult } from '@/ai/agents/workflow';

interface AgentInfo {
  id: string;
  name: string;
  persona: string;
  description: string;
  capabilities: string[];
}

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  result?: WorkflowResult;
  timestamp: Date;
}

export default function AgentsPage() {
  const { user: authUser } = useContext(AuthContext);
  const user = authUser as AppUser | null;
  const { toast } = useToast();

  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const msgIdRef = useRef(0);

  useEffect(() => {
    listAvailableAgents()
      .then(setAgents)
      .catch(() => toast({ title: 'Failed to load agents', variant: 'destructive' }))
      .finally(() => setAgentsLoading(false));
  }, [toast]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }, 50);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isProcessing) return;

    const userMsg: ChatMessage = {
      id: ++msgIdRef.current,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      const result = await runMultiAgentWorkflow({
        request: text,
        userId: user?.uid,
        mode: selectedAgent ? 'single' : 'orchestrated',
        agentId: selectedAgent || undefined,
        businessContext: user?.industry ? {
          businessName: user.displayName || undefined,
          industry: user.industry,
          businessDescription: undefined,
        } : undefined,
      });

      const assistantMsg: ChatMessage = {
        id: ++msgIdRef.current,
        role: 'assistant',
        content: result.finalOutput,
        result,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      toast({
        title: 'Agent request failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Agent Sidebar */}
      <aside className="w-72 shrink-0 hidden lg:block">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              AI Agents
            </CardTitle>
            <CardDescription>Select a specialist or use the orchestrator</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-2">
            {agentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedAgent(null)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    selectedAgent === null
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    <Sparkles className="h-3.5 w-3.5" />
                    Orchestrator
                  </div>
                  <p className="text-xs opacity-70 mt-0.5">Auto-routes to specialists</p>
                </button>
                {agents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      selectedAgent === agent.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium">{agent.name}</div>
                    <p className="text-xs opacity-70 mt-0.5 line-clamp-1">{agent.persona}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {agent.capabilities.slice(0, 2).map(cap => (
                        <Badge key={cap} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </aside>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  {selectedAgent
                    ? agents.find(a => a.id === selectedAgent)?.name || 'Agent'
                    : 'Multi-Agent Orchestrator'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedAgent
                    ? agents.find(a => a.id === selectedAgent)?.persona
                    : 'Automatically decomposes tasks across specialist agents'}
                </CardDescription>
              </div>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setMessages([]); setSelectedAgent(null); }}
                >
                  New Chat
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full" ref={scrollRef}>
              <div className="p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-primary/10 p-3 mb-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">Ask the Agent Team</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Your request will be analyzed and routed to the right specialists.
                      Each request uses 1 credit regardless of how many agents are involved.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {['SWOT analysis', 'Marketing plan', 'Financial projection', 'HR policy'].map(suggestion => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          onClick={() => setInput(suggestion)}
                          className="text-xs"
                        >
                          {suggestion}
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <MarkdownRenderer content={msg.content} />
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}
                      {msg.result && (
                        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/50 text-xs opacity-70">
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {msg.result.subtasks.length} agent{msg.result.subtasks.length !== 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {(msg.result.executionTimeMs / 1000).toFixed(1)}s
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        {selectedAgent ? 'Agent is thinking...' : 'Orchestrating agents...'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={
                  selectedAgent
                    ? `Ask ${agents.find(a => a.id === selectedAgent)?.name || 'the agent'}...`
                    : 'Describe what you need help with...'
                }
                disabled={isProcessing}
                className="flex-1"
              />
              <Button type="submit" disabled={isProcessing || !input.trim()}>
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
