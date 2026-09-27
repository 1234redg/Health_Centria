import { createFileRoute, Link } from '@tanstack/react-router';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { DashboardShell } from '../../components/dashboard-shell';
import { opsNav } from '../../components/ops-nav';
import { getSession } from '../../lib/auth';
import { overview } from '../../lib/api';
import { getTodayService } from '../../lib/schedule';

export const Route = createFileRoute('/admin/dashboard')({
  component: AdminDashboard,
});

function Kpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_8px_30px_rgba(15,60,90,0.06)]">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{sub}</p>
    </div>
  );
}

function AdminDashboard() {
  const reduceMotion = useReducedMotion();
  const session = getSession();
  const service = getTodayService();
  const [counts, setCounts] = useState<{
    today: number;
    pending: number;
    totalPatients: number;
    activeStaff?: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    overview()
      .then((r) => {
        if (!cancelled) setCounts(r);
      })
      .catch(() => {
        if (!cancelled) setCounts(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const v = (n: number | undefined) => (counts === null ? '—' : String(n ?? 0));

  return (
    <DashboardShell
      title="Admin Dashboard"
      roleLabel="Admin"
      userName={session?.name}
      userEmail={session?.email ?? ''}
      todayService={`${service.name} — ${service.detail}`}
      nav={opsNav(session?.role)}
      notificationsTo="/staff/notifications"
    >
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <Kpi label="Today's appointments" value={v(counts?.today)} sub="Confirmed + pending for today" />
        <Kpi label="Pending requests" value={v(counts?.pending)} sub="Confirm / decline in the queue" />
        <Kpi label="Total patients" value={v(counts?.totalPatients)} sub="Registered patient accounts" />
        <Kpi label="Staff accounts" value={v(counts?.activeStaff)} sub="Active staff (accounts screen next)" />
      </motion.div>

      <section
        aria-labelledby="admin-queue"
        className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_8px_30px_rgba(15,60,90,0.06)]"
      >
        <h2 id="admin-queue" className="text-base font-bold text-slate-900">
          Triage queue
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {counts === null
            ? 'Loading…'
            : counts.pending === 0
              ? 'Nothing waiting — the queue is clear.'
              : `${counts.pending} request${counts.pending === 1 ? '' : 's'} need${counts.pending === 1 ? 's' : ''} review.`}
        </p>
        <Link
          to="/staff/appointments"
          className="mt-3 inline-flex h-11 items-center rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-5 font-medium text-white active:scale-[0.97]"
        >
          Open the queue
        </Link>
      </section>

      <section
        aria-labelledby="admin-usage"
        className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_8px_30px_rgba(15,60,90,0.06)]"
      >
        <h2 id="admin-usage" className="text-base font-bold text-slate-900">
          Service utilization
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Completed visits per service for the last 30 days.
        </p>
        <Link
          to="/staff/reports"
          className="mt-3 inline-flex h-11 items-center rounded-xl border border-slate-300 px-5 font-medium text-slate-700 active:scale-[0.97]"
        >
          Open reports
        </Link>
      </section>
    </DashboardShell>
  );
}
