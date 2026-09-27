import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { BarChart } from '../../components/charts/bar-chart';
import { Bar } from '../../components/charts/bar';
import { BarXAxis } from '../../components/charts/bar-x-axis';
import { Grid } from '../../components/charts/grid';
import { ChartTooltip } from '../../components/charts/tooltip/chart-tooltip';
import { DashboardShell } from '../../components/dashboard-shell';
import { opsNav } from '../../components/ops-nav';
import { getSession } from '../../lib/auth';
import { visitsPerService, type VisitsPerServiceRow } from '../../lib/api';
import { getTodayService } from '../../lib/schedule';

export const Route = createFileRoute('/staff/reports')({
  component: Reports,
});

function Reports() {
  const session = getSession();
  const today = getTodayService();
  const [rows, setRows] = useState<VisitsPerServiceRow[] | null>(null);
  const [meta, setMeta] = useState<{ from: string; to: string; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    visitsPerService(30)
      .then((r) => {
        if (!cancelled) {
          setRows(r.rows);
          setMeta({ from: r.from, to: r.to, total: r.total });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load report.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const data = (rows ?? []).map((r) => ({ service: r.serviceName, visits: r.count }));

  return (
    <DashboardShell
      title="Reports"
      roleLabel={session?.role === 'admin' ? 'Admin' : 'Staff'}
      userName={session?.name}
      userEmail={session?.email ?? ''}
      todayService={`${today.name} — ${today.detail}`}
      nav={opsNav(session?.role)}
      notificationsTo="/staff/notifications"
    >
      <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_8px_30px_rgba(15,60,90,0.06)]">
        <h2 className="text-base font-bold text-slate-900">Visits per service</h2>
        <p className="mt-1 text-sm text-slate-500">
          {meta ? `Completed visits, last 30 days (${meta.from} → ${meta.to}) · ${meta.total} total` : 'Completed visits, last 30 days.'}
        </p>
        <div className="mt-4">
          {error && (
            <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</p>
          )}
          {rows === null && !error && <p className="text-sm text-slate-500">Loading report…</p>}
          {rows !== null && rows.length === 0 && !error && (
            <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              No completed visits in the last 30 days yet.
            </p>
          )}
          {rows !== null && rows.length > 0 && (
            <BarChart data={data} xDataKey="service">
              <Grid horizontal />
              <Bar dataKey="visits" fill="var(--chart-line-primary)" lineCap="round" />
              <BarXAxis />
              <ChartTooltip />
            </BarChart>
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
