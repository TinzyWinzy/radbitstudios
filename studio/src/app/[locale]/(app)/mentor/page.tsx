
'use client';

import { useState, useContext, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { AuthContext } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { sendMessageAction } from './actions';
import { checkAndDecrementUsage } from '@/services/usage-service';
import { type User } from 'firebase/auth';

// Define a custom user type for better type safety
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
}

export default function MentorPage() {
  const { user: authUser } = useContext(AuthContext);
  const user = authUser as CustomUser | null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      setTimeout(() => {
        const viewport = scrollAreaRef.current?.querySelector(
          '[data-radix-scroll-area-viewport]'
        );
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }, 100);
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !user || isSubmitting) return;

    const usageResult = await checkAndDecrementUsage(user.uid, 'mentorChat');
    if (!usageResult.success) {
      toast({ title: 'Usage Limit Reached', description: usageResult.message, variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    const userMessage: Message = { text: input, sender: 'user', id: Date.now(), status: 'pending' };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const response = await sendMessageAction({
        query: userMessage.text,
        businessName: user.businessName,
        industry: user.industry,
        businessDescription: user.businessDescription,
      });

      // Update user message to 'sent' and add AI response
      setMessages((prev) =>
        prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg))
      );

      const aiMessage: Message = { text: response.answer, sender: 'ai', id: Date.now() + 1, status: 'sent' };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error: any) {
      const errorMessage = error.message || 'Sorry, I encountered an error. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      // Update the message status to 'error' to give user feedback
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Business Mentor</h1>
        <p className="text-muted-foreground mt-2">
          Your personal AI guide for navigating the entrepreneurial journey.
        </p>
      </div>
      <Card className="flex-1 flex flex-col mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Chat with your Mentor
          </CardTitle>
          <CardDescription>
            Ask questions about starting, running, or growing your business.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <p className="text-sm">
                    Welcome! { user?.businessName ? `How can I help you with ${user.businessName}?` : 'How can I help you today?'}
                  </p>
                </div>
              </div>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.sender === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {message.sender === 'ai' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                        <p className="text-sm whitespace-pre-line">
                        {message.text}
                        </p>
                         {message.sender === 'user' && message.status === 'error' && (
                           <RefreshCw className="h-4 w-4 text-destructive-foreground/70" aria-label="Failed to send" />
                        )}
                    </div>
                  </div>
                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.photoURL || undefined} alt="@user" />
                      <AvatarFallback>
                        {user?.displayName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
               {isSubmitting && messages[messages.length - 1]?.sender === 'user' && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
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
                placeholder="Type your question..."
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
    </div>
  );
}
