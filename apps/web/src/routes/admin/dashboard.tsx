import { createFileRoute } from '@tanstack/react-router';
import { motion, useReducedMotion } from 'motion/react';
import {
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Megaphone,
  Settings,
  Users,
} from 'lucide-react';
import { DashboardShell } from '../../components/dashboard-shell';
import { getSession } from '../../lib/auth';
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

  return (
    <DashboardShell
      title="Admin Dashboard"
      roleLabel="Admin"
      userName={session?.name}
      userEmail={session?.email ?? ''}
      todayService={`${service.name} — ${service.detail}`}
      nav={[
        { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Appointments', icon: CalendarCheck },
        { label: 'Patients', icon: Users },
        { label: 'Walk-in', icon: ClipboardList },
        { label: 'Services', icon: CalendarDays },
        { label: 'Announcements', icon: Megaphone },
        { label: 'Reports', icon: FileText },
        { label: 'Staff Accounts', icon: Settings },
      ]}
      notificationsTo="/staff/notifications"
    >
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <Kpi label="Today's appointments" value="—" sub="Same daily-ops view as staff" />
        <Kpi label="Pending requests" value="—" sub="Same triage queue as staff" />
        <Kpi label="Total patients" value="—" sub="System-wide count (records API)" />
        <Kpi label="Staff accounts" value="—" sub="Active staff (accounts screen)" />
      </motion.div>

      <section
        aria-labelledby="admin-usage"
        className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_8px_30px_rgba(15,60,90,0.06)]"
      >
        <h2 id="admin-usage" className="text-base font-bold text-slate-900">
          Service utilization
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          System-wide chart connects when appointment data exists. Planned as a basic bar/line over time (no
          filters or drill-downs for v1).
        </p>
      </section>

      <section
        aria-labelledby="admin-ops"
        className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_8px_30px_rgba(15,60,90,0.06)]"
      >
        <h2 id="admin-ops" className="text-base font-bold text-slate-900">
          Administration
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Staff accounts, audit logs, roles (read-only), and security settings land here next. Admins can already
          reach every staff view through role access.
        </p>
      </section>
    </DashboardShell>
  );
}
