'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Loader2, Send, CheckCircle2, Phone, Linkedin, Sparkles, ArrowRight, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type FormType = 'hire' | 'pilot';

type IntentResult = {
  intent: string;
  need: string;
  audience: string;
  budget: string;
  industry: string | null;
  serviceInterest: string | null;
  summary: string;
  question: string;
};

type Step = 'intake' | 'chat' | 'form';

export default function ContactPage() {
  const [step, setStep] = useState<Step>('intake');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{ question: string; answer: string }>>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [refinement, setRefinement] = useState<Record<string, string | null>>({});

  const [formType, setFormType] = useState<FormType>('hire');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [painPoint, setPainPoint] = useState('');
  const [currentTools, setCurrentTools] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setName(''); setCompany(''); setEmail(''); setPhone(''); setMessage('');
    setBudget(''); setTimeline(''); setPainPoint(''); setCurrentTools('');
  };

  const handleDescribe = async () => {
    if (!description.trim() || description.trim().length < 3) {
      toast({ title: 'Tell me what you need', description: 'Describe your situation briefly so I can help.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/leads/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Classification failed');
      }
      const data = await res.json();
      setIntentResult(data);
      setRefinement({
        intent: data.intent,
        need: data.need,
        budget: data.budget,
        audience: data.audience,
        industry: data.industry,
        serviceInterest: data.serviceInterest,
      });
      setFormType(data.intent === 'pilot' ? 'pilot' : 'hire');
      setStep('chat');
    } catch {
      toast({ title: 'Could not process that', description: 'No problem - fill in the form directly.', variant: 'default' });
      setFormType('hire');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async () => {
    if (!currentAnswer.trim()) return;
    const updatedHistory = [...chatHistory, { question: intentResult?.question || '', answer: currentAnswer.trim() }];
    setChatHistory(updatedHistory);
    setCurrentAnswer('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/leads/intent/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          history: chatHistory,
          answer: currentAnswer.trim(),
        }),
      });
      if (!res.ok) throw new Error('Followup failed');
      const data = await res.json();

      if (data.refinement) {
        setRefinement((prev) => ({ ...prev, ...data.refinement }));
        if (data.refinement.intent) setFormType(data.refinement.intent === 'pilot' ? 'pilot' : 'hire');
      }

      if (data.ready || !data.nextQuestion) {
        setStep('form');
      } else {
        setIntentResult((prev) => prev ? { ...prev, question: data.nextQuestion } : prev);
      }
    } catch {
      setStep('form');
    } finally {
      setChatLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast({ title: 'Required fields', description: 'Please fill in your name and email.', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const body = formType === 'hire'
        ? {
            fullName: name,
            workEmail: email,
            company,
            phone,
            message: `Budget: ${budget || refinement.budget || 'not specified'}\nTimeline: ${timeline}\n\n${message || description}`,
            source: 'hire',
            industry: refinement.industry || undefined,
            serviceInterest: refinement.serviceInterest || undefined,
            budgetRange: budget || refinement.budget || undefined,
            need: refinement.need || undefined,
            audience: refinement.audience || undefined,
          }
        : {
            fullName: name,
            workEmail: email,
            company,
            phone,
            message: `Pilot Application\nIndustry pain point: ${painPoint || description}\nCurrent tools: ${currentTools}`,
            source: 'pilot',
            industry: refinement.industry || undefined,
          };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to send');
      toast({ title: 'Message sent!', description: 'We will get back to you within 48 hours.' });
      resetForm();
      setStep('intake');
      setDescription('');
      setIntentResult(null);
      setChatHistory([]);
      setRefinement({});
    } catch {
      toast({
        title: 'Failed to send',
        description: 'Please email us directly at hanzohanic@gmail.com',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-16 space-y-6 md:space-y-10">
      <div className="space-y-2">
        <h1 className="text-fluid-3xl font-bold tracking-tight">Contact — Radbit Studios</h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-prose">
          Tell me what you need and I will point you to the right path.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-8">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Email</h3>
              <p className="text-sm text-muted-foreground">hanzohanic@gmail.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">WhatsApp</h3>
              <p className="text-sm text-muted-foreground">+263 78 133 4474</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Linkedin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">LinkedIn</h3>
              <p className="text-sm text-muted-foreground">/company/radbitstudios</p>
            </div>
          </div>

          <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
            <h3 className="font-semibold text-sm">What to expect</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                We respond to business inquiries within 48 hours
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                Available Monday &ndash; Friday, 8 AM &ndash; 5 PM CAT
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          {step === 'intake' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Bot className="h-4 w-4" />
                <span>Sekuru Tafadzwa will guide you</span>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm leading-relaxed">
                  Describe what you need help with. Software, website, business tools, or just advice — I will listen and point you to the right path.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">What do you need?</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. I run a small retail business in Harare and need a way to track inventory and sales..."
                  disabled={loading}
                />
              </div>
              <Button onClick={handleDescribe} disabled={loading || !description.trim()} className="w-full">
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sekuru is listening...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Describe what you need</>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Or{' '}
                <button
                  type="button"
                  onClick={() => { setFormType('hire'); setStep('form'); }}
                  className="underline underline-offset-2 hover:text-primary"
                >
                  skip straight to the form
                </button>
              </p>
            </div>
          )}

          {step === 'chat' && intentResult && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium">Sekuru Tafadzwa</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {intentResult.summary || 'I think I understand what you need.'}
                    </p>
                    <p className="text-sm leading-relaxed">
                      {intentResult.question}
                    </p>
                  </div>
                </div>
              </div>

              {chatHistory.map((h, i) => (
                <div key={i} className="flex items-start gap-3 justify-end">
                  <div className="bg-muted rounded-lg p-3 max-w-[85%]">
                    <p className="text-sm">{h.answer}</p>
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <Input
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAnswer(); } }}
                  disabled={chatLoading}
                />
                <Button onClick={handleAnswer} disabled={chatLoading || !currentAnswer.trim()} size="icon">
                  {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Or{' '}
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="underline underline-offset-2 hover:text-primary"
                >
                  skip to the form
                </button>
              </p>
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {intentResult && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    I understood you need <strong className="text-foreground">{refinement.serviceInterest || refinement.need || 'help with your business'}</strong>
                    {refinement.industry ? ` in the ${refinement.industry} sector` : ''}.
                    {refinement.budget && refinement.budget !== 'not-sure' ? ` Budget around ${refinement.budget.replace('-', ' to ')}.` : ''}
                    Adjust anything below.
                  </p>
                </div>
              )}

              <div className="flex gap-2 p-1 rounded-lg border border-border bg-muted/30 w-fit">
                <Button
                  type="button"
                  variant={formType === 'hire' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFormType('hire')}
                  className="text-xs"
                >
                  I need systems built
                </Button>
                <Button
                  type="button"
                  variant={formType === 'pilot' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFormType('pilot')}
                  className="text-xs"
                >
                  Join the SME Pilot
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={company} onChange={e => setCompany(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              {formType === 'hire' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget range</Label>
                    <Select value={budget || refinement.budget || ''} onValueChange={setBudget}>
                      <SelectTrigger id="budget">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        {["<$5k", "$5k-$15k", "$15k-$50k", "$50k+"].map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeline">Timeline</Label>
                    <Input id="timeline" value={timeline} onChange={e => setTimeline(e.target.value)} placeholder="e.g. Next quarter, urgent, exploratory" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">What you need built</Label>
                    <Textarea id="message" rows={4} value={message || description} onChange={e => setMessage(e.target.value)} required />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="painPoint">Biggest admin pain point</Label>
                    <Textarea id="painPoint" rows={3} value={painPoint || description} onChange={e => setPainPoint(e.target.value)} placeholder="e.g. I keep missing tax deadlines..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentTools">Current tools (if any)</Label>
                    <Input id="currentTools" value={currentTools} onChange={e => setCurrentTools(e.target.value)} placeholder="e.g. Excel, QuickBooks" />
                  </div>
                </>
              )}

              <Button type="submit" disabled={sending} className="w-full">
                {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {sending ? 'Sending...' : formType === 'hire' ? 'Send Enquiry' : 'Submit Application'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
