import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { markAllNotificationsRead, markNotificationRead, type NotificationItem } from '../lib/api';
import { cn } from '../lib/utils';

const KNOWN_LINKS = [
  '/app/dashboard',
  '/app/appointments',
  '/app/announcements',
  '/staff/dashboard',
  '/staff/appointments',
  '/staff/announcements',
] as const;

type KnownLink = (typeof KNOWN_LINKS)[number];

function knownLink(link: string): KnownLink | null {
  return (KNOWN_LINKS as readonly string[]).includes(link) ? (link as KnownLink) : null;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return '';
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** Shared inbox used by the patient and staff notification pages. */
export function NotificationCenter({
  items,
  onChanged,
}: {
  items: NotificationItem[];
  onChanged: (items: NotificationItem[]) => void;
}) {
  const [clearing, setClearing] = useState(false);

  async function open(item: NotificationItem) {
    if (!item.read) {
      try {
        await markNotificationRead(item.id);
        onChanged(items.map((x) => (x.id === item.id ? { ...x, read: true } : x)));
      } catch {
        // Opening the link still works; the dot clears on next load.
      }
    }
  }

  async function clear() {
    setClearing(true);
    try {
      await markAllNotificationsRead();
      onChanged(items.map((x) => ({ ...x, read: true })));
    } catch {
      // Ignore — badge refreshes on next load.
    } finally {
      setClearing(false);
    }
  }

  const unread = items.filter((i) => !i.read).length;

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-slate-200/70 bg-white p-6 text-sm leading-6 text-slate-600">
        No notifications yet. Appointment updates, announcements, and reminders will appear here.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-slate-500" role="status">
          {unread === 0 ? 'All caught up.' : `${unread} unread`}
        </p>
        {unread > 0 && (
          <button
            type="button"
            onClick={clear}
            disabled={clearing}
            className="h-9 rounded-xl px-3 text-sm font-medium text-teal-700 hover:bg-teal-50 active:scale-[0.97] disabled:opacity-60"
          >
            Mark all read
          </button>
        )}
      </div>
      <ul className="space-y-3">
        {items.map((item) => {
          const row = (
            <>
              <span
                aria-hidden
                className={cn(
                  'mt-1.5 size-2.5 shrink-0 rounded-full',
                  item.read ? 'bg-slate-200' : 'bg-teal-600',
                )}
              />
              <span className="min-w-0 flex-1">
                <span className={cn('block text-sm', item.read ? 'font-normal text-slate-600' : 'font-semibold text-slate-900')}>
                  {item.title}
                </span>
                {item.body && <span className="mt-0.5 block text-sm leading-6 text-slate-600">{item.body}</span>}
                {timeAgo(item.createdAt) && (
                  <span className="mt-0.5 block text-xs text-slate-400">{timeAgo(item.createdAt)}</span>
                )}
              </span>
            </>
          );
          const cls =
            'flex w-full items-start gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 text-left shadow-[0_8px_30px_rgba(15,60,90,0.06)] transition-transform active:scale-[0.99]';
          const dest = knownLink(item.link);
          return (
            <li key={item.id}>
              {dest ? (
                <Link to={dest} onClick={() => open(item)} className={cn(cls, 'hover:border-teal-600/40')}>
                  {row}
                </Link>
              ) : (
                <button type="button" onClick={() => open(item)} className={cls}>
                  {row}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function BellDot({ unread }: { unread: number }) {
  return (
    <span className="relative flex size-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100">
      <Bell size={20} aria-hidden />
      {unread > 0 && (
        <span
          aria-label={`${unread} unread notifications`}
          className="absolute right-1.5 top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white"
        >
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </span>
  );
}
