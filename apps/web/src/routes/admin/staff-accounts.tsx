import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { DashboardShell } from '../../components/dashboard-shell';
import { adminNav } from '../../components/ops-nav';
import { getSession } from '../../lib/auth';
import {
  ApiError,
  createStaffAccount,
  listStaffAccounts,
  updateStaffAccount,
  type StaffAccount,
} from '../../lib/api';
import { getTodayService } from '../../lib/schedule';
import { cn } from '../../lib/utils';

export const Route = createFileRoute('/admin/staff-accounts')({
  component: StaffAccounts,
});

const inputClass =
  'h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25';
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-800';

function StaffAccounts() {
  const session = getSession();
  const today = getTodayService();
  const [list, setList] = useState<StaffAccount[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [cRole, setCRole] = useState<'staff' | 'admin'>('staff');
  const [cShow, setCShow] = useState(false);
  const [cBusy, setCBusy] = useState(false);
  const [cError, setCError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [eName, setEName] = useState('');
  const [eRole, setERole] = useState<'staff' | 'admin'>('staff');
  const [ePassword, setEPassword] = useState('');
  const [eBusy, setEBusy] = useState(false);
  const [eError, setEError] = useState<string | null>(null);

  async function reload() {
    try {
      const r = await listStaffAccounts();
      setList(r.accounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load accounts.');
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCError(null);
    setCBusy(true);
    try {
      await createStaffAccount({
        fullName: cName.trim(),
        email: cEmail.trim().toLowerCase(),
        password: cPassword,
        role: cRole,
      });
      setCName('');
      setCEmail('');
      setCPassword('');
      setCRole('staff');
      setShowCreate(false);
      await reload();
    } catch (err) {
      setCError(err instanceof ApiError ? err.message : 'Could not create account.');
    } finally {
      setCBusy(false);
    }
  }

  function startEdit(a: StaffAccount) {
    setEditingId(a.id);
    setEName(a.name);
    setERole(a.role);
    setEPassword('');
    setEError(null);
  }

  async function handleUpdate(e: FormEvent, id: string) {
    e.preventDefault();
    setEError(null);
    setEBusy(true);
    try {
      await updateStaffAccount(id, {
        fullName: eName.trim(),
        role: eRole,
        ...(ePassword ? { password: ePassword } : {}),
      });
      setEditingId(null);
      await reload();
    } catch (err) {
      setEError(err instanceof ApiError ? err.message : 'Could not update account.');
    } finally {
      setEBusy(false);
    }
  }

  async function toggleActive(a: StaffAccount) {
    setEError(null);
    try {
      await updateStaffAccount(a.id, { active: !a.active });
      await reload();
    } catch (err) {
      setEError(err instanceof ApiError ? err.message : 'Could not update account.');
    }
  }

  return (
    <DashboardShell
      title="Staff Accounts"
      roleLabel="Admin"
      userName={session?.name}
      userEmail={session?.email ?? ''}
      todayService={`${today.name} — ${today.detail}`}
      nav={adminNav}
      notificationsTo="/staff/notifications"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {list === null ? 'Loading…' : `${list.length} account${list.length === 1 ? '' : 's'}`}
        </p>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="inline-flex h-11 items-center rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-5 font-medium text-white active:scale-[0.97]"
        >
          {showCreate ? 'Close' : 'New account'}
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
      )}

      {showCreate && (
        <form onSubmit={handleCreate} className="grid gap-4 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_8px_30px_rgba(15,60,90,0.06)] sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="sa-name" className={labelClass}>Full name *</label>
            <input id="sa-name" value={cName} onChange={(e) => setCName(e.target.value)} placeholder="Nurse Joy" className={inputClass} />
          </div>
          <div>
            <label htmlFor="sa-email" className={labelClass}>Email *</label>
            <input id="sa-email" type="email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} placeholder="staff@example.com" className={inputClass} />
          </div>
          <div>
            <label htmlFor="sa-role" className={labelClass}>Role *</label>
            <select id="sa-role" value={cRole} onChange={(e) => setCRole(e.target.value as 'staff' | 'admin')} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none focus:border-teal-600">
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="sa-password" className={labelClass}>Temporary password * (min 8 characters)</label>
            <div className="relative">
              <input
                id="sa-password"
                type={cShow ? 'text' : 'password'}
                autoComplete="new-password"
                value={cPassword}
                onChange={(e) => setCPassword(e.target.value)}
                className={cn(inputClass, 'pr-11')}
              />
              <button
                type="button"
                onClick={() => setCShow((v) => !v)}
                aria-label={cShow ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-500 hover:text-slate-800"
              >
                {cShow ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {cError && <p role="alert" className="text-sm text-destructive sm:col-span-2">{cError}</p>}
          <button type="submit" disabled={cBusy} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-600 font-semibold text-white active:scale-[0.97] disabled:opacity-60 sm:col-span-2">
            {cBusy && <LoaderCircle size={16} className="animate-spin" aria-hidden />}
            {cBusy ? 'Creating…' : 'Create account'}
          </button>
        </form>
      )}

      {eError && (
        <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{eError}</p>
      )}

      <div className="grid gap-4">
        {(list ?? []).map((a) => (
          <article key={a.id} className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_8px_30px_rgba(15,60,90,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900">{a.name}</h3>
                <p className="mt-0.5 text-sm text-slate-600">{a.email}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold capitalize', a.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800')}>
                  {a.role}
                </span>
                <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', a.active ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600')}>
                  {a.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            {editingId === a.id ? (
              <form onSubmit={(e) => handleUpdate(e, a.id)} className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                <div>
                  <label htmlFor={`edit-name-${a.id}`} className={labelClass}>Full name *</label>
                  <input id={`edit-name-${a.id}`} value={eName} onChange={(e) => setEName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor={`edit-role-${a.id}`} className={labelClass}>Role *</label>
                  <select id={`edit-role-${a.id}`} value={eRole} onChange={(e) => setERole(e.target.value as 'staff' | 'admin')} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none focus:border-teal-600">
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor={`edit-pw-${a.id}`} className={labelClass}>Reset password (leave blank to keep)</label>
                  <input id={`edit-pw-${a.id}`} type="password" autoComplete="new-password" value={ePassword} onChange={(e) => setEPassword(e.target.value)} placeholder="Min 8 characters" className={inputClass} />
                </div>
                {eError && <p role="alert" className="text-sm text-destructive sm:col-span-2">{eError}</p>}
                <div className="flex gap-2 sm:col-span-2">
                  <button type="submit" disabled={eBusy} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 text-sm font-semibold text-white active:scale-[0.97] disabled:opacity-60">
                    {eBusy && <LoaderCircle size={16} className="animate-spin" aria-hidden />}
                    Save
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="h-10 flex-1 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 active:scale-[0.97]">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(a)}
                  className="inline-flex h-10 items-center rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 active:scale-[0.97]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => toggleActive(a)}
                  className={cn(
                    'inline-flex h-10 items-center rounded-xl border px-4 text-sm font-semibold active:scale-[0.97]',
                    a.active ? 'border-red-200 text-destructive' : 'border-green-200 text-green-800',
                  )}
                >
                  {a.active ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </DashboardShell>
  );
}
