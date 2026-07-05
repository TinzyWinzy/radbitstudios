'use client';

import { useState, FormEvent } from 'react';
import { Mail, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

interface NewsletterSignupProps {
  variant?: 'inline' | 'card' | 'banner';
  title?: string;
  description?: string;
  buttonText?: string;
  placeholder?: string;
  className?: string;
  leadMagnet?: string;
}

export function NewsletterSignup({
  variant = 'card',
  title = 'Get Zimbabwe business insights delivered to your inbox',
  description = 'Weekly updates on tenders, compliance, tax deadlines, and diaspora investment opportunities.',
  buttonText = 'Subscribe',
  placeholder = 'Enter your email',
  className = '',
  leadMagnet,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, frequency: 'weekly' }),
      });

      if (res.ok) {
        setStatus('success');
        setMessage(leadMagnet
          ? `Check your inbox for your free ${leadMagnet}!`
          : 'You\'re subscribed! Check your inbox for a confirmation.'
        );
      } else {
        const data = await res.json();
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className={`flex items-start gap-3 p-4 rounded-lg border border-green-500/20 bg-green-500/5 ${className}`}>
        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-green-600 dark:text-green-400">Subscribed!</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={placeholder}
            required
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0"
        >
          {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : buttonText}
        </button>
      </form>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8 ${className}`}>
        <div className="max-w-2xl mx-auto text-center">
          <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-headline text-xl font-bold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={placeholder}
              required
              className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0"
            >
              {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{buttonText} <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
          {status === 'error' && <p className="text-sm text-destructive mt-2">{message}</p>}
          {leadMagnet && (
            <p className="text-xs text-muted-foreground mt-3">
              Free gift: <strong>{leadMagnet}</strong> — sent to your inbox after subscribing
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-border/50 bg-card/50 p-6 ${className}`}>
      <div className="flex items-start gap-3 mb-4">
        <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h3 className="font-headline font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={placeholder}
          required
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{buttonText} <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
      {status === 'error' && <p className="text-sm text-destructive mt-2">{message}</p>}
      {leadMagnet && (
        <p className="text-xs text-muted-foreground mt-3">
          Free gift: <strong>{leadMagnet}</strong>
        </p>
      )}
    </div>
  );
}
