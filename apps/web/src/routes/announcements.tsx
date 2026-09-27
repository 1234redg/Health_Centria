import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { AnnouncementFeed } from '../components/announcement-feed';
import { listAnnouncements, type Announcement } from '../lib/api';

export const Route = createFileRoute('/announcements')({
  component: PublicAnnouncements,
});

function PublicAnnouncements() {
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
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="text-lg font-bold tracking-tight text-slate-900">
            HealthCentria
          </Link>
          <nav aria-label="Public" className="ml-auto flex items-center gap-2 text-sm">
            <Link to="/login" className="rounded-xl px-3 py-2 font-medium text-slate-600 hover:bg-slate-100">
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-4 py-2 font-medium text-white active:scale-[0.97]"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Announcements</h1>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Schedule changes, vaccination days, and health advisories from the center. No login needed.
          </p>
        </div>
        {error && (
          <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {items === null && !error && <p className="text-sm text-slate-500">Loading announcements…</p>}
        {items !== null && <AnnouncementFeed items={items} />}
      </main>
    </div>
  );
}
