import { createFileRoute } from '@tanstack/react-router';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { AnnouncementFeed } from '../../components/announcement-feed';
import { DashboardShell } from '../../components/dashboard-shell';
import { patientNav } from '../../components/patient-nav';
import { getSession } from '../../lib/auth';
import { listAnnouncements, type Announcement } from '../../lib/api';
import { getTodayService } from '../../lib/schedule';

export const Route = createFileRoute('/app/announcements')({
  component: PatientAnnouncements,
});

function PatientAnnouncements() {
  const reduceMotion = useReducedMotion();
  const session = getSession();
  const today = getTodayService();
  const [items, setItems] = useState<Announcement[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listAnnouncements()
      .then((r) => {
        if (!cancelled) setItems(r.announcements);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load announcements.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardShell
      title="Announcements"
      roleLabel="Patient"
      userName={session?.name}
      userEmail={session?.email ?? ''}
      todayService={`${today.name} — ${today.detail}`}
      nav={patientNav}
      notificationsTo="/app/notifications"
    >
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
      >
        {error && (
          <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {items === null && !error && <p className="text-sm text-slate-500">Loading announcements…</p>}
        {items !== null && <AnnouncementFeed items={items} />}
      </motion.div>
    </DashboardShell>
  );
}
