import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { DashboardShell } from '../../components/dashboard-shell';
import { opsNav } from '../../components/ops-nav';
import { getSession } from '../../lib/auth';
import { listPatients, type PatientSummary } from '../../lib/api';
import { getTodayService } from '../../lib/schedule';

export const Route = createFileRoute('/staff/patients')({
  component: PatientsList,
});

function PatientsList() {
  const session = getSession();
  const today = getTodayService();
  const [search, setSearch] = useState('');
  const [list, setList] = useState<PatientSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    const t = setTimeout(() => {
      listPatients(search)
        .then((r) => {
          if (!cancelled) setList(r.patients);
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setList([]);
            setError(err instanceof Error ? err.message : 'Could not load patients.');
          }
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [search]);

  return (
    <DashboardShell
      title="Patients"
      roleLabel={session?.role === 'admin' ? 'Admin' : 'Staff'}
      userName={session?.name}
      userEmail={session?.email ?? ''}
      todayService={`${today.name} — ${today.detail}`}
      nav={opsNav(session?.role)}
      notificationsTo="/staff/notifications"
    >
      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_8px_30px_rgba(15,60,90,0.06)]">
        <label htmlFor="patient-search" className="mb-1.5 block text-sm font-medium text-slate-800">
          Search by name, email, contact, or household number
        </label>
        <input
          id="patient-search"
          type="search"
          placeholder="e.g. Juan Cruz"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {list === null && !error && <p className="text-sm text-slate-500">Loading patients…</p>}
      {list !== null && list.length === 0 && !error && (
        <p className="rounded-2xl border border-slate-200/70 bg-white p-6 text-sm text-slate-600">
          No patients found.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {(list ?? []).map((p) => (
          <Link
            key={p.id}
            to="/staff/patients/$patientId"
            params={{ patientId: p.id }}
            className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_8px_30px_rgba(15,60,90,0.06)] transition-transform active:scale-[0.99] hover:border-teal-600/40"
          >
            <h3 className="font-bold text-slate-900">{p.name}</h3>
            <p className="mt-0.5 text-sm text-slate-600">{p.email}</p>
            <p className="mt-1 text-xs text-slate-400">
              {[p.contactNumber, p.householdNumber].filter(Boolean).join(' · ')}
              {!p.active && ' · inactive'}
            </p>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
