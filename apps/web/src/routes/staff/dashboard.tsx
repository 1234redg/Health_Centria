import { createFileRoute, Link } from '@tanstack/react-router';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  Bell,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Megaphone,
  Users,
} from 'lucide-react';
import { DashboardShell } from '../../components/dashboard-shell';
import { getSession } from '../../lib/auth';
import { queueAppointments } from '../../lib/api';
import { getTodayService } from '../../lib/schedule';

export const Route = createFileRoute('/staff/dashboard')({
  component: StaffDashboard,
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

function StaffDashboard() {
  const reduceMotion = useReducedMotion();
  const session = getSession();
  const service = getTodayService();
  const [counts, setCounts] = useState<{ today: number; pending: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const now = new Date();
    const t = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    Promise.all([
      queueAppointments({ from: t, to: t }).catch(() => ({ appointments: [] })),
      queueAppointments({ status: 'pending' }).catch(() => ({ appointments: [] })),
    ]).then(([todays, pendings]) => {
      if (cancelled) return;
      setCounts({
        today: todays.appointments.filter((a) => a.status === 'confirmed' || a.status === 'pending').length,
        pending: pendings.appointments.length,
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardShell
      title="Staff Dashboard"
      roleLabel={session?.role === 'admin' ? 'Admin' : 'Staff'}
      userName={session?.name}
      userEmail={session?.email ?? ''}
      todayService={`${service.name} — ${service.detail}`}
      nav={[
        { label: 'Dashboard', to: '/staff/dashboard', icon: LayoutDashboard },
        { label: 'Appointments', to: '/staff/appointments', icon: CalendarCheck },
        { label: 'Patients', icon: Users },
        { label: 'Walk-in', icon: ClipboardList },
        { label: 'Services', icon: CalendarDays },
        { label: 'Announcements', to: '/staff/announcements', icon: Megaphone },
        { label: 'Notifications', to: '/staff/notifications', icon: Bell },
        { label: 'Reports', icon: FileText },
      ]}
      notificationsTo="/staff/notifications"
    >
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <Kpi label="Today's appointments" value={counts === null ? '—' : String(counts.today)} sub="Confirmed + pending for today" />
        <Kpi label="Pending requests" value={counts === null ? '—' : String(counts.pending)} sub="Confirm / decline in the queue" />
        <Kpi label="Today's service" value={service.name} sub={service.detail} />
        <Kpi label="Total patients" value="—" sub="Live count connects with the records API" />
      </motion.div>

      <section
        aria-labelledby="staff-today"
        className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_8px_30px_rgba(15,60,90,0.06)]"
      >
        <h2 id="staff-today" className="text-base font-bold text-slate-900">
          Pending approvals
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
        aria-labelledby="staff-chart"
        className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_8px_30px_rgba(15,60,90,0.06)]"
      >
        <h2 id="staff-chart" className="text-base font-bold text-slate-900">
          Visits per service
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Chart connects when visit records exist. Planned as a simple static bar chart (last 30 days, no filters for
          v1).
        </p>
      </section>
    </DashboardShell>
  );
}
