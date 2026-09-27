# 03 — Patient Dashboard `/app/dashboard`

> Goal: "What do I do next?" in one glance. Shows: greeting, upcoming confirmed card, pending requests, upcoming service-day reminder, recent announcements 2–3, quick actions (Book, Services, Records).

## 1. Layout options

- **A. Card stack with priority order (recommended).** Top: greeting + today-service banner ("Today: Prenatal — Tuesdays"). Next: Next appointment hero card (gradient accent). Then 2-col (desktop) Pending / Announcements; Quick actions row. Mobile stacks same order.
  - *Pros:* Simplicity (most important most obvious), scannable, matches PulseCare card style. *Cons:* needs empty states when no appointments.
- **B. Dense KPI dashboard (like admin).** Charts + counts — overwhelming for patients, wrong metaphor (Familiarity: patients think visits, not metrics).
- **C. Timeline feed.** Nice chronology but buries actions.

**Recommendation: A.** Status → completion → warning hierarchy: confirmed hero, pending warning chips, announcements status.

## 2. Components

- Greeting header (name, date, service-today pill).
- Hero appointment card: service icon, date (large), weekday computed, queue advice ("Arrive morning, bring ID"), [View] [Cancel] (cancel needs confirm — Agency/forgiveness).
- Pending list: status chips (amber pulse, no looping oscillation), reason tooltip for declined.
- Service reminder card: "Tomorrow: Family Planning — Thursday".
- Announcements mini-list (pinned icon, category chip, tap → detail, symmetric path).
- Quick actions: 3 large buttons (Book Appointment primary gradient, View Services, My Records), 52px on mobile.
- Bell dot in topbar; empty states ("No upcoming visits — Book when ready").

## 3. Interactions (apple-design, restrained)

- Cards enter with short critically-damped rise (y 8px→0, 0.35s, no bounce); stagger minimal. Interruptible, no input lock.
- Pull-to-refresh optional; rubber-band overscroll native.
- Tap highlight on down; content tracks 1:1 on horizontal quick-action scroll (if overflow).
- Reduced motion: no rise, opacity fade only.

## 4. Responsive

- Desktop: hero + 2-col grid (left appointments, right announcements/reminders). Mobile: single stack, quick actions sticky bottom or top after hero, 44px+ targets, charts none (patients don't need charts).
- Translucent topbar with blur; scroll-edge fade, not hard divider.

## 5. Acceptance

- [ ] Zero-appointment state guides to booking, not blank.
- [ ] Declined shows staff reason + rebook CTA.
- [ ] Day-before reminder surfaces here + bell + email (job-driven, UI just renders).
- [ ] Works on 360px phones, readable 16px.
