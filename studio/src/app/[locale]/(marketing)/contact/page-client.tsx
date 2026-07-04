'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Loader2, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast({ title: 'Required fields', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name, workEmail: email, message }),
      });
      if (!res.ok) throw new Error('Failed to send');
      toast({ title: 'Message sent!', description: 'We will get back to you within 48 hours.' });
      setName('');
      setEmail('');
      setMessage('');
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
        <h1 className="text-fluid-3xl font-bold tracking-tight">Contact Us</h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-prose">
          Have a question about Radbit&apos;s tender intelligence, compliance automation, or AI business tools? Whether you&apos;re a Zimbabwean SME exploring digital transformation, a diaspora investor looking for verified opportunities, or a partner organisation interested in collaboration &mdash; we&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-8">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">Email</h3>
              <p className="text-sm text-muted-foreground">hanzohanic@gmail.com</p>
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
                Support is available Monday &ndash; Friday, 8 AM &ndash; 5 PM CAT
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                For urgent technical issues, include &ldquo;URGENT&rdquo; in your subject line
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-2">
            <h3 className="font-semibold text-sm">Common inquiries</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><strong className="text-foreground">Tender registration</strong> &mdash; Help onboarding to the tender intelligence platform</li>
              <li><strong className="text-foreground">PRAZ compliance</strong> &mdash; Questions about the automated compliance tool</li>
              <li><strong className="text-foreground">Diaspora investment</strong> &mdash; How to browse and invest in SMEs from abroad</li>
              <li><strong className="text-foreground">Partnerships</strong> &mdash; Business development and channel partnerships</li>
              <li><strong className="text-foreground">Billing &amp; plans</strong> &mdash; Subscription changes, invoices, and payments</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={5} value={message} onChange={e => setMessage(e.target.value)} required />
          </div>
          <Button type="submit" disabled={sending} className="w-full">
            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </div>
    </div>
  );
}
