# UI Specs Index — HealthCentria v1

> Per-page design decisions with options, tradeoffs, and recommendations. Guideline: `apple-design` skill (fluid, interruptible springs, pointer-down response, translucency, size-specific type, reduced-motion) restrained for clinical use. Global tokens: `00-design-system.md`. Source requirements: `../HealthCentria_UI_spec.md`. Stack: React + Vite + TanStack Router + Tailwind + shadcn/radix + Motion + visx. Email: Resend. Reports: Today/Week/Month, monthly primary, CSV+print, no PDF. No SMS v1.

| File | Page(s) | Key recommendation |
|------|---------|--------------------|
| `00-design-system.md` | tokens, shells, motion house style | Sidebar + translucent topbar, damping 1.0/0.35, bounce only on flick |
| `01-public-landing.md` | `/`, public services/announcements | Single landing + week strip with snap/projection |
| `02-auth.md` | login/register | Centered card, 3-group register with progress, inline Zod-mirror validation |
| `03-patient-dashboard.md` | patient home | Card stack priority: next visit → pending → reminders → announcements |
| `04-services-schedules.md` | services read + manage | Cards + week toggle (patient), constrained recurrence builder (staff) |
| `05-appointment-booking.md` | 3-step wizard | Service → Date (disabled invalid + 30-day cap + double-book block) → Review |
| `06-appointments.md` | patient list + staff queue | Tabbed cards + sheet (patient), Pending-first triage queue (staff) |
| `07-patient-records.md` | staff master-detail + patient read-only | Searchable table → header + timeline; audit on edits |
| `08-walk-in.md` | front-desk quick form | Split search+form one page, minimal required, sticky Save |
| `09-announcements.md` | feed + composer | Feed + detail pages (shareable), modal text-only composer, per-post email |
| `10-dashboards.md` | staff ops + admin system | KPI → Today → Chart; one static chart each, no filters |
| `11-reports.md` | 3 reports + print/CSV | Switcher + presets + table; monthly default |
| `12-notifications-profile-admin.md` | bell center, profile, staff/audit/roles/security | Bell drawer + full page; sectioned profile; read-only roles |

Out of scope v1 (all files): medicine inventory, dose history, growth charts, PDF, SMS, custom permissions, dark mode, Tagalog, uploads, slot engine, holiday calendar, drill-downs.
