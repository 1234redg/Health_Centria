import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { DashboardShell } from '../../components/dashboard-shell';
import { opsNav } from '../../components/ops-nav';
import { getSession } from '../../lib/auth';
import {
  ApiError,
  listServices,
  lookupPatient,
  walkInAppointment,
  type Service,
  type StaffAppointment,
} from '../../lib/api';
import { getTodayService } from '../../lib/schedule';
import { cn } from '../../lib/utils';

export const Route = createFileRoute('/staff/walk-in')({
  component: WalkIn,
});

function todayYMD(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

const inputClass =
  'h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25';
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-800';

type Mode = 'existing' | 'new';

function WalkIn() {
  const session = getSession();
  const today = getTodayService();
  const day = todayYMD();
  const [mode, setMode] = useState<Mode>('existing');
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [email, setEmail] = useState('');
  const [found, setFound] = useState<{ id: string; name: string; email: string } | null>(null);
  const [lookupMsg, setLookupMsg] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [np, setNp] = useState<{
    fullName: string;
    email: string;
    birthdate: string;
    sex: 'Female' | 'Male' | 'Other' | 'Prefer not to say';
    address: string;
    householdNumber: string;
    contactNumber: string;
    philHealthNumber: string;
    emergencyName: string;
    emergencyNumber: string;
  }>({
    fullName: '',
    email: '',
    birthdate: '',
    sex: 'Female',
    address: '',
    householdNumber: '',
    contactNumber: '',
    philHealthNumber: '',
    emergencyName: '',
    emergencyNumber: '',
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ appt: StaffAppointment; tempPassword?: string } | null>(null);

  useEffect(() => {
    listServices().then((r) => setServices(r.services)).catch(() => {});
  }, []);

  async function handleLookup() {
    setLookupMsg(null);
    setFound(null);
    try {
      const r = await lookupPatient(email.trim());
      setFound(r.patient);
    } catch (err) {
      setLookupMsg(err instanceof ApiError ? err.message : 'Lookup failed.');
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(null);
    if (!serviceId) {
      setError('Select a service.');
      return;
    }
    setPending(true);
    try {
      const r = await walkInAppointment({
        serviceId,
        day,
        notes: notes.trim(),
        ...(mode === 'existing' ? { patientEmail: (found?.email ?? email).trim().toLowerCase() } : { newPatient: { ...np, email: np.email.trim().toLowerCase() } }),
      });
      setDone({ appt: r.appointment, tempPassword: r.tempPassword });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Walk-in booking failed.');
    } finally {
      setPending(false);
    }
  }

  return (
    <DashboardShell
      title="Walk-in"
      roleLabel={session?.role === 'admin' ? 'Admin' : 'Staff'}
      userName={session?.name}
      userEmail={session?.email ?? ''}
      todayService={`${today.name} — ${today.detail}`}
      nav={opsNav(session?.role)}
      notificationsTo="/staff/notifications"
    >
      <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_8px_30px_rgba(15,60,90,0.06)]">
        <h2 className="text-base font-bold text-slate-900">Same-day walk-in — auto-confirmed</h2>
        <p className="mt-1 text-sm text-slate-500">Today ({day}). Patient is present, so the visit is confirmed immediately.</p>

        <div role="group" aria-label="Patient mode" className="mt-4 flex rounded-xl bg-slate-100 p-1">
          {(['existing', 'new'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={cn(
                'h-9 flex-1 rounded-lg px-4 text-sm font-medium capitalize active:scale-[0.97]',
                mode === m ? 'bg-white text-slate-900 shadow' : 'text-slate-500',
              )}
            >
              {m === 'existing' ? 'Existing patient' : 'New patient'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
          <div>
            <label htmlFor="wi-service" className={labelClass}>Service *</label>
            <select
              id="wi-service"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none focus:border-teal-600"
            >
              <option value="">Select service</option>
              {services.filter((s) => s.active).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {mode === 'existing' ? (
            <div>
              <label htmlFor="wi-email" className={labelClass}>Patient email *</label>
              <div className="flex gap-2">
                <input
                  id="wi-email"
                  type="email"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={handleLookup}
                  className="h-11 shrink-0 rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 active:scale-[0.97]"
                >
                  Find
                </button>
              </div>
              {lookupMsg && <p role="alert" className="mt-1.5 text-sm text-destructive">{lookupMsg}</p>}
              {found && <p role="status" className="mt-1.5 text-sm font-semibold text-green-800">Found: {found.name} ({found.email})</p>}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ['fullName', 'Full name *', 'text'],
                  ['email', 'Email *', 'email'],
                  ['birthdate', 'Birthdate *', 'date'],
                  ['address', 'Address *', 'text'],
                  ['householdNumber', 'Household number *', 'text'],
                  ['contactNumber', 'Contact number *', 'tel'],
                  ['philHealthNumber', 'PhilHealth (optional)', 'text'],
                  ['emergencyName', 'Emergency contact name *', 'text'],
                  ['emergencyNumber', 'Emergency contact number *', 'tel'],
                ] as const
              ).map(([k, label, type]) => (
                <div key={k} className={k === 'fullName' || k === 'address' ? 'sm:col-span-2' : ''}>
                  <label htmlFor={`wi-${k}`} className={labelClass}>{label}</label>
                  <input
                    id={`wi-${k}`}
                    type={type}
                    value={np[k]}
                    onChange={(e) => setNp((p) => ({ ...p, [k]: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              ))}
              <div>
                <label htmlFor="wi-sex" className={labelClass}>Sex *</label>
                <select
                  id="wi-sex"
                  value={np.sex}
                  onChange={(e) => setNp((p) => ({ ...p, sex: e.target.value as typeof p.sex }))}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none focus:border-teal-600"
                >
                  {['Female', 'Male', 'Other', 'Prefer not to say'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="wi-notes" className={labelClass}>Notes</label>
            <textarea
              id="wi-notes"
              rows={2}
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for visit…"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25"
            />
          </div>

          {error && <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</p>}
          {done && (
            <div role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
              <p className="font-semibold">Walk-in confirmed for {done.appt.day}.</p>
              {done.tempPassword && (
                <p className="mt-1">New account: {done.appt.patient && typeof done.appt.patient === 'object' ? done.appt.patient.email : ''} — temporary password: <strong>{done.tempPassword}</strong> (give it to the patient once).</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 text-base font-medium text-white active:scale-[0.97] disabled:opacity-60"
          >
            {pending && <LoaderCircle size={18} className="animate-spin" aria-hidden />}
            {pending ? 'Confirming…' : 'Confirm walk-in'}
          </button>
        </form>
      </section>
    </DashboardShell>
  );
}
