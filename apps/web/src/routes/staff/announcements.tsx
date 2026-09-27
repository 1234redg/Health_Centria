import { createFileRoute } from '@tanstack/react-router';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { LoaderCircle, Pin, Trash2 } from 'lucide-react';
import { DashboardShell } from '../../components/dashboard-shell';
import { opsNav } from '../../components/ops-nav';
import { getSession } from '../../lib/auth';
import {
  ApiError,
  CATEGORY_LABELS,
  createAnnouncement,
  deleteAnnouncement,
  listAnnouncements,
  updateAnnouncement,
  type Announcement,
  type AnnouncementCategory,
} from '../../lib/api';
import { getTodayService } from '../../lib/schedule';
import { cn } from '../../lib/utils';

export const Route = createFileRoute('/staff/announcements')({
  component: StaffAnnouncements,
});

const CATEGORIES = Object.keys(CATEGORY_LABELS) as AnnouncementCategory[];

interface ComposerState {
  id?: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  pinned: boolean;
}

const emptyComposer: ComposerState = { title: '', body: '', category: 'general', pinned: false };

function StaffAnnouncements() {
  const reduceMotion = useReducedMotion();
  const session = getSession();
  const today = getTodayService();
  const isAdmin = session?.role === 'admin';
  const [items, setItems] = useState<Announcement[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [composer, setComposer] = useState<ComposerState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  async function submit() {
    if (!composer) return;
    if (!composer.title.trim() || !composer.body.trim()) {
      setFormError('Title and message are both required.');
      return;
    }
    setPending(true);
    setFormError(null);
    try {
      if (composer.id) {
        const r = await updateAnnouncement(composer.id, {
          title: composer.title.trim(),
          body: composer.body.trim(),
          category: composer.category,
          pinned: composer.pinned,
        });
        setItems((l) => (l ?? []).map((x) => (x.id === r.announcement.id ? r.announcement : x)));
      } else {
        const r = await createAnnouncement({
          title: composer.title.trim(),
          body: composer.body.trim(),
          category: composer.category,
          pinned: composer.pinned,
        });
        setItems((l) => [r.announcement, ...(l ?? [])]);
      }
      setComposer(null);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not publish. Try again.');
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string) {
    setDeletingId(id);
    try {
      await deleteAnnouncement(id);
      setItems((l) => (l ?? []).filter((x) => x.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete. Try again.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <DashboardShell
      title="Announcements"
      roleLabel={isAdmin ? 'Admin' : 'Staff'}
      userName={session?.name}
      userEmail={session?.email ?? ''}
      todayService={`${today.name} — ${today.detail}`}
      nav={opsNav(session?.role)}
      notificationsTo="/staff/notifications"
    >
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
        className="flex items-center justify-between gap-3"
      >
        <p className="text-sm text-slate-600">
          Publishing notifies registered patients by email. Only admins can delete.
        </p>
        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setComposer({ ...emptyComposer });
          }}
          className="h-11 shrink-0 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-5 font-medium text-white active:scale-[0.97]"
        >
          New post
        </button>
      </motion.div>

      {error && (
        <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {items === null && !error && <p className="text-sm text-slate-500">Loading announcements…</p>}
      {items !== null && items.length === 0 && (
        <p className="rounded-2xl border border-slate-200/70 bg-white p-6 text-sm text-slate-600">
          Nothing posted yet. Use “New post” to publish the first announcement.
        </p>
      )}

      <div className="space-y-3">
        {(items ?? []).map((a) => (
          <article
            key={a.id}
            className={cn(
              'rounded-2xl border bg-white p-5 shadow-[0_8px_30px_rgba(15,60,90,0.06)]',
              a.pinned ? 'border-teal-600/40' : 'border-slate-200/70',
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              {a.pinned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  <Pin size={12} aria-hidden /> Pinned
                </span>
              )}
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                {CATEGORY_LABELS[a.category]}
              </span>
            </div>
            <h3 className="mt-1.5 font-bold text-slate-900">{a.title}</h3>
            <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600">{a.body}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setFormError(null);
                  setComposer({ id: a.id, title: a.title, body: a.body, category: a.category, pinned: a.pinned });
                }}
                className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 active:scale-[0.97]"
              >
                Edit
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  disabled={deletingId === a.id}
                  aria-label={`Delete ${a.title}`}
                  className="flex h-10 items-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-destructive active:scale-[0.97] disabled:opacity-60"
                >
                  {deletingId === a.id ? <LoaderCircle size={16} className="animate-spin" aria-hidden /> : <Trash2 size={16} aria-hidden />}
                  Delete
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      <AnimatePresence>
        {composer && (
          <>
            <motion.div
              aria-hidden
              onClick={() => setComposer(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-slate-900/40"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={composer.id ? 'Edit announcement' : 'New announcement'}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="fixed inset-x-4 bottom-4 top-auto z-50 mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:inset-0 sm:m-auto sm:h-fit"
            >
              <h2 className="text-lg font-bold text-slate-900">{composer.id ? 'Edit post' : 'New post'}</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="ann-title" className="mb-1.5 block text-sm font-medium text-slate-800">
                    Title *
                  </label>
                  <input
                    id="ann-title"
                    value={composer.title}
                    maxLength={200}
                    onChange={(e) => setComposer({ ...composer, title: e.target.value })}
                    placeholder="e.g. Prenatal moved to Wednesday this week"
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25"
                  />
                </div>
                <div>
                  <label htmlFor="ann-category" className="mb-1.5 block text-sm font-medium text-slate-800">
                    Category
                  </label>
                  <select
                    id="ann-category"
                    value={composer.category}
                    onChange={(e) => setComposer({ ...composer, category: e.target.value as AnnouncementCategory })}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none focus:border-teal-600"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="ann-body" className="mb-1.5 block text-sm font-medium text-slate-800">
                    Message *
                  </label>
                  <textarea
                    id="ann-body"
                    rows={4}
                    maxLength={5000}
                    value={composer.body}
                    onChange={(e) => setComposer({ ...composer, body: e.target.value })}
                    placeholder="Write the announcement in plain language…"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-base outline-none placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25"
                  />
                </div>
                <label htmlFor="ann-pinned" className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
                  <input
                    id="ann-pinned"
                    type="checkbox"
                    checked={composer.pinned}
                    onChange={(e) => setComposer({ ...composer, pinned: e.target.checked })}
                    className="size-5 accent-teal-700"
                  />
                  Pin to the top of the feed
                </label>
                {formError && (
                  <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    {formError}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={submit}
                    disabled={pending}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 font-medium text-white active:scale-[0.97] disabled:opacity-60"
                  >
                    {pending && <LoaderCircle size={18} className="animate-spin" aria-hidden />}
                    {composer.id ? 'Save changes' : 'Publish (emails patients)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposer(null)}
                    disabled={pending}
                    className="h-12 flex-1 rounded-xl border border-slate-300 font-medium text-slate-700 active:scale-[0.97]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}
