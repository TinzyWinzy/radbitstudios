'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Loader2, Send, CheckCircle2, Phone, Linkedin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type FormType = 'hire' | 'pilot';

export default function ContactPage() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast({ title: 'Required fields', description: 'Please fill in your name and email.', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const body = formType === 'hire'
        ? { fullName: name, workEmail: email, company, phone, message: `Budget: ${budget}\nTimeline: ${timeline}\n\n${message}`, source: 'hire' }
        : { fullName: name, workEmail: email, company, phone, message: `Pilot Application\nIndustry pain point: ${painPoint}\nCurrent tools: ${currentTools}`, source: 'pilot' };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to send');
      toast({ title: 'Message sent!', description: 'We will get back to you within 48 hours.' });
      resetForm();
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
          Two paths. If you need systems built, use the Hire form. If you run a Zim SME and want to test Radbit Ops, use the Pilot form.
        </p>
      </div>

      <div className="flex gap-2 p-1 rounded-lg border border-border bg-muted/30 w-fit">
        <Button
          variant={formType === 'hire' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFormType('hire')}
          className="text-xs"
        >
          I need systems built
        </Button>
        <Button
          variant={formType === 'pilot' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFormType('pilot')}
          className="text-xs"
        >
          Join the SME Pilot
        </Button>
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
                <Select value={budget} onValueChange={setBudget}>
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
                <Textarea id="message" rows={4} value={message} onChange={e => setMessage(e.target.value)} required />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="painPoint">Biggest admin pain point</Label>
                <Textarea id="painPoint" rows={3} value={painPoint} onChange={e => setPainPoint(e.target.value)} placeholder="e.g. I keep missing tax deadlines..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentTools">Current tools (if any)</Label>
                <Input id="currentTools" value={currentTools} onChange={e => setCurrentTools(e.target.value)} placeholder="e.g. Excel, QuickBooks" />
              </div>
              <p className="text-xs text-muted-foreground">We will reply within 48 hours to schedule a 10-minute diagnostic.</p>
            </>
          )}

          <Button type="submit" disabled={sending} className="w-full">
            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {sending ? 'Sending...' : formType === 'hire' ? 'Send Enquiry' : 'Submit Application'}
          </Button>
        </form>
      </div>
    </div>
  );
}
