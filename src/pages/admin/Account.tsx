import React, { useState } from 'react';
import { toast } from 'sonner';
import { ShieldCheck } from 'lucide-react';
import { FormField } from '../../components/admin/FormField';
import { PageHeader, Panel } from '../../components/admin/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { formatDate, timeAgo } from '../../utils/format';
import { firstErrors, setupSchema } from '../../utils/validation';

export function Account() {
  const { user, changePassword } = useAuth();
  const { db, upsert } = useStore();
  const [name, setName] = useState(user?.name ?? '');
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  if (!user) return null;

  const saveProfile = () => {
    if (name.trim().length < 2) return toast.error('Name is too short');
    upsert('adminUsers', { ...user, name: name.trim() }, 'Updated admin profile');
    toast.success('Profile updated');
  };

  const savePassword = async () => {
    const parsed = setupSchema.safeParse({ name: user.name, email: user.email, password: pw.next, confirm: pw.confirm });
    if (!parsed.success) {
      const e = firstErrors(parsed.error);
      return setErrors({ next: e.password, confirm: e.confirm });
    }
    const err = await changePassword(pw.current, pw.next);
    if (err) return setErrors({ current: err });
    setErrors({});
    setPw({ current: '', next: '', confirm: '' });
    toast.success('Password changed');
  };

  const securityLog = db.activity.filter((a) => a.entity === 'auth' || a.entity === 'adminUsers').slice(0, 8);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Account & Security" />
      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Profile">
          <div className="space-y-4">
            <FormField label="Name" htmlFor="acc-name"><Input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} /></FormField>
            <FormField label="Email" htmlFor="acc-email" hint="Sign-in email cannot be changed here"><Input id="acc-email" value={user.email} disabled /></FormField>
            <p className="text-xs text-muted-foreground">Account created {formatDate(user.createdAt)} · last sign-in {user.lastLoginAt ? timeAgo(user.lastLoginAt) : '—'}</p>
            <Button onClick={saveProfile}>Save profile</Button>
          </div>
        </Panel>
        <Panel title="Change password">
          <div className="space-y-4">
            <FormField label="Current password" htmlFor="pw-cur" error={errors.current}><Input id="pw-cur" type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></FormField>
            <FormField label="New password" htmlFor="pw-new" error={errors.next} hint="12+ chars, upper & lower case, number"><Input id="pw-new" type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></FormField>
            <FormField label="Confirm new password" htmlFor="pw-conf" error={errors.confirm}><Input id="pw-conf" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></FormField>
            <Button onClick={savePassword}>Update password</Button>
          </div>
        </Panel>
      </div>
      <Panel title="Security" className="mt-6">
        <ul className="mb-5 grid gap-2 text-sm sm:grid-cols-2">
          {['PBKDF2-SHA256 password hashing (120k iterations)', 'Sessions expire after 8 hours', 'Login rate limited: 5 attempts / 15 minutes', 'Destructive actions recorded in the audit log', 'Rich text sanitized before rendering', 'Admin pages marked noindex'].map((t) =>
          <li key={t} className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{t}</li>
          )}
        </ul>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent security events</p>
        <ul className="divide-y divide-border text-sm">
          {securityLog.map((a) => <li key={a.id} className="flex justify-between gap-3 py-2"><span>{a.details}</span><span className="shrink-0 text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span></li>)}
          {securityLog.length === 0 && <li className="py-2 text-muted-foreground">No events yet.</li>}
        </ul>
      </Panel>
    </div>);

}