import { useState } from 'react';
import { ChevronDown, Pin } from 'lucide-react';
import { CATEGORY_LABELS, type Announcement } from '../lib/api';
import { cn } from '../lib/utils';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Shared reader used by the public page and the patient feed. */
export function AnnouncementFeed({ items }: { items: Announcement[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-slate-200/70 bg-white p-6 text-sm leading-6 text-slate-600">
        No announcements yet. New posts from the center — schedule changes, vaccination days, health advisories —
        will appear here.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((a) => {
        const open = openId === a.id;
        return (
          <article
            key={a.id}
            className={cn(
              'rounded-2xl border bg-white p-5 shadow-[0_8px_30px_rgba(15,60,90,0.06)]',
              a.pinned ? 'border-teal-600/40' : 'border-slate-200/70',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {a.pinned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-600 px-2.5 py-0.5 text-xs font-bold text-white">
                    <Pin size={12} aria-hidden /> Pinned
                  </span>
                )}
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {CATEGORY_LABELS[a.category]}
                </span>
                {formatDate(a.publishedAt) && (
                  <span className="text-xs text-slate-400">{formatDate(a.publishedAt)}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : a.id)}
                aria-expanded={open}
                aria-label={open ? `Hide full text of ${a.title}` : `Show full text of ${a.title}`}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <ChevronDown size={18} className={cn('transition-transform', open && 'rotate-180')} />
              </button>
            </div>
            <h3 className="mt-1.5 font-bold text-slate-900">{a.title}</h3>
            <p className={cn('mt-1 text-sm leading-6 text-slate-600', !open && 'line-clamp-2')}>{a.body}</p>
          </article>
        );
      })}
    </div>
  );
}
