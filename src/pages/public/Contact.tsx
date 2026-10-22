import React, { useRef, useState } from 'react';
import { CheckCircle2, Loader2, Mail, MessageSquare, ShieldCheck } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useSeo } from '../../hooks/useSeo';
import { uid } from '../../utils/format';
import { checkRateLimit, looksLikeSpam } from '../../utils/security';
import { contactSchema, firstErrors } from '../../utils/validation';

const empty = { name: '', email: '', subject: '', message: '' };

export function Contact() {
  const { db, upsert } = useStore();
  const [form, setForm] = useState(empty);
  const [hp, setHp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
  const startedAt = useRef(Date.now());
  useSeo({ title: `Contact Us | ${db.settings.siteName}`, description: 'Contact The Story Current newsroom with tips, corrections, feedback or partnership enquiries.', path: '/contact' });

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) return setErrors(firstErrors(parsed.error));
    if (looksLikeSpam({ honeypot: hp, startedAt: startedAt.current, text: form.message })) return setErrors({ form: 'Your message could not be sent. Please try again in a moment.' });
    const rl = checkRateLimit('contact', 3, 15 * 60 * 1000);
    if (!rl.ok) return setErrors({ form: `You've sent several messages recently. Please try again in ${Math.ceil(rl.retryInSec / 60)} minutes.` });
    setErrors({});
    setState('loading');
    await new Promise((r) => setTimeout(r, 500));
    upsert('messages', { id: uid(), ...parsed.data, status: 'unread', createdAt: new Date().toISOString() });
    setState('done');
    setForm(empty);
  };

  const field = 'mt-1.5 w-full rounded-md border border-border px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 aria-[invalid=true]:border-red-500';

  return (
    <div className="container py-10">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Get in touch</p>
          <h1 className="mt-2 font-serif text-4xl font-extrabold md:text-5xl">Contact the newsroom</h1>
          <p className="mt-4 text-lg text-muted-foreground">Have a tip, spotted an error, or want to share feedback? We read every message.</p>
          <ul className="mt-8 space-y-5">
            {[
            { Icon: MessageSquare, t: 'Story tips & feedback', d: 'Tell us what we should be covering.' },
            { Icon: ShieldCheck, t: 'Corrections', d: 'Flag an error and we\'ll review it under our Corrections Policy.' },
            { Icon: Mail, t: 'Email', d: db.settings.contactEmail }].
            map(({ Icon, t, d }) =>
            <li key={t} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand"><Icon className="h-5 w-5" /></span>
                <div><p className="font-semibold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div>
              </li>
            )}
          </ul>
        </div>

        <div className="lg:col-span-7">
          {state === 'done' ?
          <div role="status" className="flex flex-col items-center rounded-xl border border-border p-10 text-center">
              <CheckCircle2 className="h-12 w-12 text-brand" />
              <h2 className="mt-4 font-serif text-2xl font-bold">Message received</h2>
              <p className="mt-2 max-w-sm text-muted-foreground">Thank you for reaching out. A member of our team will review your message.</p>
              <button onClick={() => {setState('idle');startedAt.current = Date.now();}} className="mt-6 text-sm font-semibold text-brand hover:text-brand-deep">Send another message</button>
            </div> :

          <form onSubmit={submit} noValidate className="space-y-5 rounded-xl border border-border p-6 md:p-8">
              <div className="hidden" aria-hidden="true">
                <label htmlFor="c-website">Website</label>
                <input id="c-website" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="c-name" className="text-sm font-medium">Name</label>
                  <input id="c-name" value={form.name} onChange={set('name')} className={`${field} h-11`} aria-invalid={!!errors.name} autoComplete="name" />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="c-email" className="text-sm font-medium">Email</label>
                  <input id="c-email" type="email" value={form.email} onChange={set('email')} className={`${field} h-11`} aria-invalid={!!errors.email} autoComplete="email" />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="c-subject" className="text-sm font-medium">Subject</label>
                <input id="c-subject" value={form.subject} onChange={set('subject')} className={`${field} h-11`} aria-invalid={!!errors.subject} />
                {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}
              </div>
              <div>
                <label htmlFor="c-message" className="text-sm font-medium">Message</label>
                <textarea id="c-message" rows={7} value={form.message} onChange={set('message')} className={`${field} py-2.5`} aria-invalid={!!errors.message} />
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-red-600">{errors.message}</span>
                  <span className="text-muted-foreground">{form.message.length}/5000</span>
                </div>
              </div>
              {errors.form && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{errors.form}</p>}
              <button type="submit" disabled={state === 'loading'} className="inline-flex h-11 items-center gap-2 rounded-md bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-60">
                {state === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />} Send message
              </button>
              <p className="text-xs text-muted-foreground">We store your message securely to respond to you. We never sell your data.</p>
            </form>
          }
        </div>
      </div>
    </div>);

}