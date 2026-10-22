import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FormField } from '../../components/admin/FormField';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { useSeo } from '../../hooks/useSeo';
import { firstErrors, loginSchema, setupSchema } from '../../utils/validation';

export function Login() {
  const { user, needsSetup, login, setup } = useAuth();
  const { db } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  useSeo({ title: 'Admin sign in | The Story Current', noindex: true });

  if (user) {
    const from = (location.state as {from?: string;} | null)?.from;
    return <Navigate to={from && from.startsWith('/admin') ? from : '/admin'} replace />;
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (needsSetup) {
      const parsed = setupSchema.safeParse(form);
      if (!parsed.success) return setErrors(firstErrors(parsed.error));
      setLoading(true);
      await setup(parsed.data.name, parsed.data.email, parsed.data.password);
      setLoading(false);
      navigate('/admin');
      return;
    }
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) return setErrors(firstErrors(parsed.error));
    setLoading(true);
    const err = await login(parsed.data.email, parsed.data.password);
    setLoading(false);
    if (err) setErrors({ form: err });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <img src={db.settings.logoUrl} alt={`${db.settings.siteName} logo`} className="h-24 w-24 rounded-xl shadow-sm" width={96} height={96} />
          <h1 className="mt-6 font-serif text-3xl font-extrabold">{needsSetup ? 'Create the first administrator' : 'Newsroom sign in'}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {needsSetup ? 'This one-time setup secures the admin portal. It is disabled once an administrator exists.' : 'Authorized staff only. All sign-ins are logged.'}
          </p>
        </div>
        <form onSubmit={submit} noValidate className="mt-8 space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm">
          {needsSetup &&
          <FormField label="Full name" htmlFor="name" error={errors.name}>
              <Input id="name" value={form.name} onChange={set('name')} autoComplete="name" />
            </FormField>
          }
          <FormField label="Email" htmlFor="email" error={errors.email}>
            <Input id="email" type="email" value={form.email} onChange={set('email')} autoComplete="username" />
          </FormField>
          <FormField label="Password" htmlFor="password" error={errors.password} hint={needsSetup ? '12+ characters with upper, lower case and a number.' : undefined}>
            <Input id="password" type="password" value={form.password} onChange={set('password')} autoComplete={needsSetup ? 'new-password' : 'current-password'} />
          </FormField>
          {needsSetup &&
          <FormField label="Confirm password" htmlFor="confirm" error={errors.confirm}>
              <Input id="confirm" type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
            </FormField>
          }
          {errors.form && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{errors.form}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : needsSetup ? <ShieldCheck className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            {needsSetup ? 'Create administrator' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">Passwords are hashed with PBKDF2-SHA256. Sessions expire after 8 hours.</p>
      </div>
    </div>);

}