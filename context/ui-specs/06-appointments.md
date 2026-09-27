# 06 — Appointments: Patient List + Staff Queue

> Patient: tabs Upcoming/Past/All, status chips (pending amber, confirmed green, declined red+reason, completed gray, cancelled), Cancel pending/confirmed via confirm. Staff: queue with filters (date/service/status), Confirm/Decline(reason required)/Complete/View patient, pending badge, walk-in entry.

## 1. Patient list options

- **A. Tabbed card list with detail sheet (recommended).** Rows → tap opens anchored sheet (same path in/out) with staff note + actions. Filters as tabs, not dropdowns (fewer taps, thumb-friendly).
- **B. Table.** Good desktop density, breaks on phones.
- **C. Calendar agenda.** Nice overview but hides reasons/actions.

**Recommendation: A.** Empty states per tab ("No upcoming — book" CTA). Cancel uses confirm dialog (destructive guard, sparingly). Status chips high-contrast, not color-only (label text + icon for accessibility).

## 2. Staff queue options

- **A. Triage queue: Pending first + Today + filters (recommended).** Top: Pending approvals shortcut card with count. Table/cards with inline Confirm/Decline, Decline opens reason modal (required). Row expands to patient mini-profile + history link. Bulk actions deferred (Purpose).
  - *Pros:* matches front-desk workflow (clear backlog, then today's list). *Cons:* needs pending badge sync (bell + sidebar).
- **B. Calendar day-view.** Familiar but poor for pending triage across 30 days.
- **C. Kanban (Pending/Confirmed/Completed).** Drag-drop fun but overkill, bad for accessibility + audit clarity.

**Recommendation: A.** Filters: date preset (Today/This week/All), service select, status select — presets only v1, no custom range. Search by patient name.

## 3. Components & interactions

- Badge counts update continuously during action (no input lock); Confirm triggers toast + patient bell/email (job) + audit log entry.
- Sheets: spring 1.0/0.35, drag-to-dismiss with velocity handoff, origin at row.
- Buttons: Confirm primary, Decline outline-red, Complete neutral. Pointer-down feedback.
- Reduced motion: fade only; status pulse static.

## 4. Responsive

- Desktop staff: table with sticky header (translucent blur, scroll-edge fade). Mobile: cards, swipe actions optional but keep visible buttons (Flexibility for touch precision); filters collapse into disclosure.
- Patient mobile: full-width cards, bottom detail sheet with flick bounce (0.8/0.3) since gesture-driven.

## 5. Acceptance

- [ ] Decline always requires reason; reason visible to patient.
- [ ] Pending badge + bell stay in sync after action.
- [ ] Cancel confirmed → status `cancelled` + audit; cannot cancel completed/declined.
- [ ] No bulk confirm v1.
