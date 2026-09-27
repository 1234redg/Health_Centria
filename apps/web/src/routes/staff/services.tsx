import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { DashboardShell } from '../../components/dashboard-shell';
import { opsNav } from '../../components/ops-nav';
import { getSession } from '../../lib/auth';
import {
  ApiError,
  createService,
  listServices,
  updateService,
  type Service,
  type ServiceSchedule,
} from '../../lib/api';
import { getTodayService } from '../../lib/schedule';
import { cn } from '../../lib/utils';

export const Route = createFileRoute('/staff/services')({
  component: ServicesManage,
});

const inputClass =
  'h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25';
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-800';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MODES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'nth-weekday', label: 'Nth weekday of month' },
  { value: 'as-needed', label: 'As needed (staff confirms date)' },
] as const;

type Mode = (typeof MODES)[number]['value'];

function emptySchedule(): ServiceSchedule {
  return { mode: 'weekly', weekdays: [1] };
}

function ScheduleFields({
  schedule,
  set,
  prefix,
}: {
  schedule: ServiceSchedule;
  set: (s: ServiceSchedule) => void;
  prefix: string;
}) {
  return (
    <div className="grid gap-4">
      <div>
        <label htmlFor={`${prefix}-mode`} className={labelClass}>Schedule *</label>
        <select
          id={`${prefix}-mode`}
          value={schedule.mode}
          onChange={(e) => {
            const mode = e.target.value as Mode;
            set(mode === 'weekly' ? { mode, weekdays: [1] } : mode === 'nth-weekday' ? { mode, weekdays: [], nthWeek: 2, weekday: 3 } : { mode, weekdays: [] });
          }}
          className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none focus:border-teal-600"
        >
          {MODES.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>
      {schedule.mode === 'weekly' && (
        <fieldset>
          <legend className={labelClass}>Weekdays * (Sundays never bookable)</legend>
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map((d) => {
              const on = (schedule.weekdays ?? []).includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    const cur = schedule.weekdays ?? [];
                    set({ ...schedule, weekdays: on ? cur.filter((x) => x !== d) : [...cur, d].sort() });
                  }}
                  className={cn(
                    'h-10 min-w-12 rounded-xl border px-3 text-sm font-medium active:scale-[0.97]',
                    on ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-input bg-background text-slate-700',
                  )}
                >
                  {DAY_NAMES[d]}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
      {schedule.mode === 'nth-weekday' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${prefix}-nth`} className={labelClass}>Which occurrence *</label>
            <select
              id={`${prefix}-nth`}
              value={schedule.nthWeek ?? 2}
              onChange={(e) => set({ ...schedule, nthWeek: Number(e.target.value) })}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none focus:border-teal-600"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${prefix}-weekday`} className={labelClass}>Weekday *</label>
            <select
              id={`${prefix}-weekday`}
              value={schedule.weekday ?? 3}
              onChange={(e) => set({ ...schedule, weekday: Number(e.target.value) })}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none focus:border-teal-600"
            >
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <option key={d} value={d}>{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d]}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

function ServicesManage() {
  const session = getSession();
  const today = getTodayService();
  const [list, setList] = useState<Service[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [cName, setCName] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cSched, setCSched] = useState<ServiceSchedule>(emptySchedule);
  const [cBusy, setCBusy] = useState(false);
  const [cError, setCError] = useState<string | null>(null);

  const [eName, setEName] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [eSched, setESched] = useState<ServiceSchedule>(emptySchedule);
  const [eActive, setEActive] = useState(true);
  const [eBusy, setEBusy] = useState(false);
  const [eError, setEError] = useState<string | null>(null);

  async function reload() {
    try {
      const r = await listServices();
      setList(r.services);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load services.');
    }
  }

  useEffect(() => {
    reload();
  }, []);

  function startEdit(s: Service) {
    setEditingId(s.id);
    setEName(s.name);
    setEDesc(s.description);
    setESched(s.schedule);
    setEActive(s.active);
    setEError(null);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCError(null);
    setCBusy(true);
    try {
      await createService({ name: cName.trim(), description: cDesc.trim(), schedule: cSched });
      setCName('');
      setCDesc('');
      setCSched(emptySchedule());
      setShowCreate(false);
      await reload();
    } catch (err) {
      setCError(err instanceof ApiError ? err.message : 'Could not create service.');
    } finally {
      setCBusy(false);
    }
  }

  async function handleUpdate(e: FormEvent, id: string) {
    e.preventDefault();
    setEError(null);
    setEBusy(true);
    try {
      await updateService(id, { name: eName.trim(), description: eDesc.trim(), schedule: eSched, active: eActive });
      setEditingId(null);
      await reload();
    } catch (err) {
      setEError(err instanceof ApiError ? err.message : 'Could not update service.');
    } finally {
      setEBusy(false);
    }
  }

  return (
    <DashboardShell
      title="Services"
      roleLabel={session?.role === 'admin' ? 'Admin' : 'Staff'}
      userName={session?.name}
      userEmail={session?.email ?? ''}
      todayService={`${today.name} — ${today.detail}`}
      nav={opsNav(session?.role)}
      notificationsTo="/staff/notifications"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {list === null ? 'Loading…' : `${list.length} service${list.length === 1 ? '' : 's'} (inactive visible to staff only)`}
        </p>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="inline-flex h-11 items-center rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-5 font-medium text-white active:scale-[0.97]"
        >
          {showCreate ? 'Close' : 'New service'}
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
      )}

      {showCreate && (
        <form onSubmit={handleCreate} className="grid gap-4 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_8px_30px_rgba(15,60,90,0.06)]">
          <div>
            <label htmlFor="svc-name" className={labelClass}>Name *</label>
            <input id="svc-name" value={cName} onChange={(e) => setCName(e.target.value)} placeholder="e.g. Consultation" className={inputClass} />
          </div>
          <div>
            <label htmlFor="svc-desc" className={labelClass}>Description</label>
            <textarea id="svc-desc" rows={2} value={cDesc} onChange={(e) => setCDesc(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25" />
          </div>
          <ScheduleFields schedule={cSched} set={setCSched} prefix="svc-new" />
          {cError && <p role="alert" className="text-sm text-destructive">{cError}</p>}
          <button type="submit" disabled={cBusy} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-600 font-semibold text-white active:scale-[0.97] disabled:opacity-60">
            {cBusy && <LoaderCircle size={16} className="animate-spin" aria-hidden />}
            {cBusy ? 'Creating…' : 'Create service'}
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {(list ?? []).map((s) => (
          <article key={s.id} className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_8px_30px_rgba(15,60,90,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900">{s.name}</h3>
                <p className="mt-0.5 text-sm text-slate-600">{s.scheduleText}</p>
                {s.description && <p className="mt-1 text-sm text-slate-500">{s.description}</p>}
              </div>
              <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-bold', s.active ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600')}>
                {s.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {editingId === s.id ? (
              <form onSubmit={(e) => handleUpdate(e, s.id)} className="mt-4 grid gap-4 border-t border-slate-100 pt-4">
                <div>
                  <label htmlFor={`edit-name-${s.id}`} className={labelClass}>Name *</label>
                  <input id={`edit-name-${s.id}`} value={eName} onChange={(e) => setEName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor={`edit-desc-${s.id}`} className={labelClass}>Description</label>
                  <textarea id={`edit-desc-${s.id}`} rows={2} value={eDesc} onChange={(e) => setEDesc(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25" />
                </div>
                <ScheduleFields schedule={eSched} set={setESched} prefix={`edit-${s.id}`} />
                <label htmlFor={`edit-active-${s.id}`} className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-800">
                  <input id={`edit-active-${s.id}`} type="checkbox" checked={eActive} onChange={(e) => setEActive(e.target.checked)} className="size-5 accent-teal-700" />
                  Active (visible for booking)
                </label>
                {eError && <p role="alert" className="text-sm text-destructive">{eError}</p>}
                <div className="flex gap-2">
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
              <button
                type="button"
                onClick={() => startEdit(s)}
                className="mt-3 inline-flex h-10 items-center rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 active:scale-[0.97]"
              >
                Edit
              </button>
            )}
          </article>
        ))}
      </div>
    </DashboardShell>
  );
}
