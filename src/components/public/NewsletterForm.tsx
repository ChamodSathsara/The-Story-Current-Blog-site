import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import type { Subscriber } from '../../types/models';
import { uid } from '../../utils/format';
import { checkRateLimit, looksLikeSpam, randomToken } from '../../utils/security';
import { firstErrors, subscribeSchema } from '../../utils/validation';

interface NewsletterFormProps {
  source: 'homepage' | 'article' | 'footer' | 'newsletter-page';
  variant?: 'block' | 'inline' | 'footer';
  showName?: boolean;
}

const CONSENT_TEXT = 'I agree to receive The Story Current newsletter by email and understand I can unsubscribe at any time.';

export function NewsletterForm({ source, variant = 'block', showName = false }: NewsletterFormProps) {
  const { db, upsert } = useStore();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
  const startedAt = useRef(Date.now());
  const dark = variant === 'footer';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = subscribeSchema.safeParse({ email, name: name || undefined, consent });
    if (!parsed.success) return setErrors(firstErrors(parsed.error));
    if (looksLikeSpam({ honeypot: hp, startedAt: startedAt.current, text: email })) return setErrors({ form: 'Please wait a moment and try again.' });
    const rl = checkRateLimit('subscribe', 3, 10 * 60 * 1000);
    if (!rl.ok) return setErrors({ form: 'Too many attempts. Please try again later.' });
    setErrors({});
    setState('loading');
    await new Promise((r) => setTimeout(r, 400));
    const existing = db.subscribers.find((s) => s.email === parsed.data.email);
    if (existing && existing.status !== 'unsubscribed') {
      setState('done');
      return;
    }
    const now = new Date().toISOString();
    const sub: Subscriber = {
      id: existing?.id ?? uid(), email: parsed.data.email, name: parsed.data.name ?? '', status: 'pending', consent: true,
      consentAt: now, consentText: CONSENT_TEXT, signupSource: source, verifiedAt: null, unsubscribeToken: randomToken(),
      createdAt: existing?.createdAt ?? now, unsubscribedAt: null
    };
    upsert('subscribers', sub);
    setState('done');
  };

  if (state === 'done') {
    return (
      <div role="status" className={`flex items-start gap-3 rounded-md p-4 ${dark ? 'bg-white/10 text-white' : 'border border-brand/20 bg-white text-ink'}`}>
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <div>
          <p className="font-semibold">You're on the list.</p>
          <p className={`text-sm ${dark ? 'text-white/70' : 'text-muted-foreground'}`}>Thanks for subscribing. We'll only email you about The Story Current.</p>
        </div>
      </div>);

  }

  const inputCls = `h-11 w-full rounded-md border px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${dark ? 'border-white/20 bg-white/5 text-white placeholder:text-white/50' : 'border-border bg-white'}`;
  const id = `nl-${source}`;

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${id}-hp`}>Leave blank</label>
        <input id={`${id}-hp`} tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
      </div>
      {showName &&
      <div>
          <label htmlFor={`${id}-name`} className="sr-only">Name (optional)</label>
          <input id={`${id}-name`} value={name} onChange={(e) => setName(e.target.value)} placeholder="First name (optional)" className={inputCls} autoComplete="given-name" />
        </div>
      }
      <div className={variant === 'inline' || variant === 'block' ? 'flex flex-col gap-2 sm:flex-row' : 'flex flex-col gap-2'}>
        <div className="flex-1">
          <label htmlFor={`${id}-email`} className="sr-only">Email address</label>
          <input id={`${id}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? `${id}-email-err` : undefined} />
          {errors.email && <p id={`${id}-email-err`} className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
        <button type="submit" disabled={state === 'loading'} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand-deep disabled:opacity-60">
          {state === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />} Subscribe
        </button>
      </div>
      <label className={`flex items-start gap-2 text-xs ${dark ? 'text-white/70' : 'text-muted-foreground'}`}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#FF5A00]" />
        <span>
          {CONSENT_TEXT} See our <Link to="/privacy-policy" className="underline hover:text-brand">Privacy Policy</Link>.
        </span>
      </label>
      {errors.consent && <p className="text-xs text-red-600">{errors.consent}</p>}
      {errors.form && <p className="text-xs text-red-600">{errors.form}</p>}
    </form>);

}