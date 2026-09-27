# HealthCentria UI Spec — v1

> Barangay Health Center System. Web only, single responsive site.
> Stack: `apps/web` React 18 + Vite 6 + TanStack Router + Tailwind 4 + shadcn/radix + lucide + visx charts. Backend Express JS + Mongoose (MongoDB Atlas). No mobile app for v1.
> Design intent (from `context/ui_reference.md`): professional yet easy to use for barangay staff and patients.
> Status: Spec for UI/page structure/navigation/flows/screens only. No code changes yet. Source of truth from user interviews 2026-09-27 + existing `context/*` templates (still blank) + current scaffold (`/` health-check page only).

---

## 1. Users & Access Model

### 1.1 Roles (fixed for v1, no custom permissions editor)

| Role | How account is created | Access |
|------|------------------------|--------|
| **Patient** | Self-registers online (Register page). No admin approval stated for v1 — assume immediate active. Edits own contact/profile only. | Patient portal |
| **Staff** (nurse/midwife/BHW/clerk — single generic role for v1) | Created by Admin via Manage Staff Accounts. Cannot self-register as staff. | Staff portal + sidebar dashboard |
| **Admin** | Pre-seeded / created out-of-band. Manages staff accounts. | Admin portal (staff views + system-wide stats, staff CRUD, audit log, reports) |

Permissions editing is **deferred** — 3 fixed roles for v1.

### 1.2 Auth screens (public)

- `/login` — email + password, role auto-resolved, error on wrong password, redirect by role: patient → `/app/dashboard`, staff → `/staff/dashboard`, admin → `/admin/dashboard`. Include “Register as patient” link, “Forgot password?” placeholder (no reset flow for v1 unless trivial).
- `/register` — patient self-registration only, immediate active (no admin verification for v1). Fields (confirmed 2026-09-27): full name, birthdate, sex, address, contact number, email, password + confirm, household number, PhilHealth number (optional), emergency contact name + number, Data Privacy consent checkbox (Phil. DPA short text). Validation inline. Success → auto-login or redirect to login.
- `/` public landing — service list + schedules summary + announcements feed preview + Login/Register CTAs. Must work without login (per “public homepage feed” discussion). Simple hero: clinic name, hours, service days.
- Logout everywhere in header/user menu.

### 1.3 What each role can do (confirmed interface lists)

**Patient:** Register, Login/Log out, Manage Profile (contact/address/password only), Request Appointment, View Appointment Status, View Appointment History, View Health Services & Schedules, View Announcements, Receive Notifications (bell + email), View own basic clinical info (diagnoses/notes + prescriptions — read-only).

**Staff:** Login/Log out, Manage Patient Records (full CRUD + visit notes), Manage Appointments (confirm/decline, create walk-ins), Manage Health Services & Schedules (CRUD service definitions + recurrence rules), Post Announcements, View Dashboard (daily ops), View/Generate Reports (on-screen + print + CSV).

**Admin:** Login/Log out, Manage Staff Accounts (CRUD + activate/deactivate), Manage Roles & Permissions (view-only for v1), View/Generate Reports (same as staff + system-wide), Manage Data Security (basic: password policy, session handling — UI = settings page placeholder), View Audit Logs (activity table).

---

## 2. Global Navigation & Layout

### 2.1 Chosen pattern: sidebar dashboard (staff/admin) + responsive patient layout

- **Staff/Admin shell:** Left sidebar (desktop ≥1024px) → collapsible to icon rail; drawer on mobile. Items:
  - Staff: Dashboard, Appointments, Patients, Walk-in, Services & Schedules, Announcements, Reports, Notifications, Profile/Settings.
  - Admin: all staff items + Staff Accounts, Audit Logs, (Roles read-only, Security settings).
  - Sidebar shows: clinic logo/name, role badge, today's service highlight (e.g. “Tue: Prenatal Day”), pending-request count badge on Appointments.
- **Patient shell:** Same sidebar on desktop, bottom-tab-like simple top nav + hamburger on mobile (must be thumb-friendly). Items: Dashboard/Home, Services, Book Appointment, My Appointments, My Records (basic), Announcements, Notifications (bell), Profile.
- **Topbar (all authed):** Page title, search (patients/appointments), notification bell with unread dot, user avatar/menu (Profile, Logout).
- **Public header:** Minimal topbar: Home, Services, Announcements, Login, Register.

### 2.2 Routing sketch (TanStack Router file routes)

```
“/” public landing
“/login” “/register”
“/app/*” patient: dashboard, services, appointments/new, appointments, appointments/$id, records, announcements, notifications, profile
“/staff/*” staff: dashboard, appointments, patients, patients/$id, walk-in, services, announcements, reports, notifications, profile
“/admin/*” admin: dashboard, staff, audit-logs, roles, security, reports (+ reuse staff routes or shared components)
“/403” “/__notfound”
```

Guard by role in `__root`/layout loaders; unauthorized → login or 403.

---

## 3. Core Domain & Business Rules (drive UI)

### 3.1 Health services — weekly/monthly recurrence, NOT daily availability

v1 services:

1. Consultation — Mondays
2. Prenatal — every Tuesday
3. Routine Immunization of Newborn Babies — every 2nd Wednesday of the month
4. Family Planning — Thursdays
5. As-needed (no fixed weekday, staff-confirmed): Postpartum Visit, Follow-up Visits, Hypertensive Patient monitoring, Breastfeeding Mothers support

UI must:
- Service list card shows: name, description, offered day(s) in plain language (“Every Monday”, “2nd Wed of month”, “As needed — staff will confirm date”).
- Booking calendar **disables invalid dates** (strict enforcement). E.g. Consultation picker only enables Mondays; Immunization only enables computed 2nd-Wednesday dates. As-needed services allow any future weekday but flag “subject to staff confirmation”.
- No per-day slot caps for v1 (unlimited requests, staff triage manually). Note as future: add `maxPerDay` later.
- Booking horizon (confirmed): max 30 days in advance, no past dates, no Sundays/holidays handling for v1 except manual decline with reason.
- Staff can CRUD services + recurrence rule (weekday selector, “Nth weekday of month” for immunization, “as-needed” toggle).

### 3.2 Explicit non-goals for v1

- No medicine inventory / dispensing tracking.
- No maternal/child growth charts.
- Immunization = simple bookable service. No per-child dose history, no next-due calculation (staff manage manually).

---

## 4. Screens — Detail

### 4.1 Public landing `/`

Sections: hero (barangay + hours), This Week schedule strip (Mon–Sun with service chips), How to book (3 steps), Announcements latest 3–5, Footer with address/contact/map placeholder. CTA → Register / View Services.

### 4.2 Auth

Login: card centered, large inputs, show/hide password, error alert, link to register. Register: 2-column on desktop (personal / account), consent checkbox required, success toast.

### 4.3 Patient Dashboard `/app/dashboard`

- Greeting + upcoming confirmed appointment card (service, date, queue advice).
- Pending requests with status chips.
- Upcoming service day reminder (“Tomorrow: Prenatal — Tuesday”).
- Recent announcements (2–3).
- Quick actions: Book Appointment, View Services, View Records.

### 4.4 Services & Schedules (patient read, staff manage)

- Patient view: searchable list/grid of service cards + weekly timetable view (Mon–Sun). Each card → Detail drawer/page with schedule text, “Book this service” (pre-selects service, jumps to calendar with invalid dates disabled).
- Staff view: table (name, schedule rule, active, upcoming date, total bookings) + Create/Edit modal (name, description, weekday(s) or Nth-weekday rule, as-needed flag, active toggle).

### 4.5 Appointment booking `/app/appointments/new`

Wizard (3 steps, mobile-friendly):
1. Select service (radio cards with schedule hint).
2. Select date (calendar with disabled invalid dates + reason tooltip “Only Mondays for Consultation”) + optional time preference / notes (symptoms).
3. Review + Submit → status `pending`, confirmation screen + bell + email (see §7).

Validation: must pick valid date; block submit on invalid day even if URL-tampered (mirror server check).

### 4.6 My Appointments (patient) / Manage Appointments (staff)

- Patient: tabs Upcoming / Past / All; each row: date, service, status chip (`pending` yellow, `confirmed` green, `declined` red + reason, `completed` gray, `cancelled`), detail view with staff note. Actions: Cancel pending OR confirmed (confirmed 2026-09-27, confirm dialog). Double-booking same date+service for same patient is blocked with message “You already have a request for this service on this date.”
- Staff: queue view with filters (date, service, status) + pending-count badge; row actions: Confirm / Decline (require reason for decline) / Mark completed / View patient. Bulk confirm not needed v1. Walk-in creation entry point here too.

### 4.7 Walk-in registration `/staff/walk-in`

Single quick form (for unregistered or registered patients):
- Search patient by name/ID → autofill, or “New patient” fields (name, DOB, sex, address, contact).
- Select service + today’s date auto, chief complaint/notes → creates `completed` or `confirmed` record immediately + appears in patient history. Must be fast for front-desk (large buttons, minimal required fields, keyboard-friendly).

### 4.8 Patient records

- Staff Patient List: search + filter, table (name, age/sex, barangay address, last visit, total visits). Row → Patient Detail: profile header (contact, emergency, PhilHealth if any — optional), Visit History timeline/table (date, service, diagnosis, prescription, attending staff, notes), Add Visit / Edit Record buttons, attachments deferred (no upload v1).
- Patient “My Records” (basic): read-only list of own visits with diagnosis/notes + prescriptions. No edit, no full staff notes if sensitive — v1 shows same basic fields staff entered as patient-visible. Explicit: no clinical edit by patient.

### 4.9 Announcements (public + per-post email)

- Public: fully visible without login on landing `/` + `/announcements` feed (confirmed). Category chip (Schedule Change, Vaccination Day, Health Advisory, General), date, pinned important on top.
- Patient: same feed + detail, also surfaced on dashboard. Registered patients get per-post email for each new announcement (not digest).
- Staff: list + Create/Edit (title, category, body, publish date, pinned toggle, active). V1 allows any staff to post; admin can delete any. Publishing triggers in-app bell + per-post email to patients.

### 4.10 Dashboards

**Staff Dashboard:**
- KPI cards: Today’s Appointments (count), Pending Requests, Today’s Service (e.g. Prenatal), Total Patients (small).
- Today’s schedule table (time-ordered if time exists, else by service).
- Simple bar chart: visits per service (last 7/30 days, no filters/drill-down — static).
- Pending approvals shortcut.

**Admin Dashboard:** everything in staff + system-wide cards: Total Patients, Staff Accounts (active), Appointments by status this week, plus line/bar chart: service utilization or appointments over time (basic visx bar/line, static range).

Charts: keep basic (reuse existing visx/area-chart components), no filter UI for v1.

### 4.11 Reports `/staff/reports`, `/admin/reports`

v1 reports (on-screen tables + Print button + CSV export, **no PDF**):
1. Daily/weekly visits by service (date, service, count, list).
2. Appointments by status (pending/confirmed/declined/completed, grouped by service).
3. Basic patient list (name, age/sex, address, contact, last visit).
Print stylesheet; CSV via backend endpoint. Presets: Today / This week / This month (confirmed 2026-09-27: monthly is primary for DOH-style reporting). No custom range builder for v1.

### 4.12 Notifications (confirmed 2026-09-27, no SMS v1)

- Patient in-app bell + email for: appointment confirmed/declined (with reason), new announcement (per-post), day-before reminder for confirmed bookings (generated by daily job/cron — UI just displays). Bell list: icon by type, message, timestamp, read/unread, click → relevant appointment/announcement. Unread badge in topbar. Mark-all-read.
- Staff/Admin in-app bell for: new incoming appointment requests needing review/confirmation. No email for staff v1 unless trivial.
- Email via Resend (confirmed 2026-09-27, free-tier); simple text templates. SMS deferred indefinitely.
- Settings: patient can toggle email reminders on/off (optional v1).

### 4.13 Admin screens

- Staff Accounts: table (name, role, email, active, last login) + Invite/Create modal (name, email, temp password, role=staff/admin), deactivate/reactivate, reset password. Bootstrap before any UI exists: `pnpm --filter @healthcentria/server seed:user -- --email=E --password=P --role=admin --name="Name"` (staff same way with `--role=staff`); `--force` resets an existing password. Staff profile fields are optional for non-patients.
- Roles & Permissions: read-only matrix (admin/staff/patient × capabilities) + “Custom permissions — future” note.
- Audit Logs: filterable table (timestamp, actor, action: login, create/approve/decline appointment, record edit with patient + field summary), no export v1 (CSV optional).
- Data Security: placeholder page — password requirements text, session timeout note, Data Privacy consent version. No complex UI v1.

### 4.14 Profile

- Patient: edit contact number, address, household number, emergency contact, password; view PhilHealth number. Clinical fields locked.
- Staff/Admin: edit name, contact, password.

---

## 5. Components & Style (see §4.12 + decisions 2026-09-27 for theme)

- Base: shadcn/radix (Button, Card, Dialog, Input, Select, Calendar, Table, Badge, Tabs, Toast, Avatar, Dropdown), lucide icons, Tailwind 4.
- Status chips, service-day badges, empty states (“No appointments today”), skeletons for tables/charts, confirm dialogs for destructive/decline actions.
- Forms: inline validation (Zod on backend, mirror on frontend), large tap targets (≥44px on patient mobile), readable 16px base.
- Theme (confirmed 2026-09-27): clean modern healthcare, PulseCare-style visual language only (no brand copying) — soft gradient accents, card-based layout with soft shadows, blue/teal/green palette, clear data viz (charts, progress indicators) on dashboard. Clean, colorful but not cluttered, friendly and trustworthy. Light mode only v1; dark mode deferred. Language: English-only v1; i18n deferred.
- Accessibility: labels on all inputs, focus states, `role=alert` errors, keyboard-navigable calendar/dialogs.

---

## 6. User Flows (happy path)

**Patient books Consultation:**
Landing → Register/Login → Services (sees “Consultation — Every Monday”) → Book → picks next Monday (other days disabled) → Review → Submit → sees Pending → receives bell+email on Confirm → reminder day-before → attends → record appears in My Records.

**Staff handles request:**
Staff Dashboard (sees pending badge) → Appointments → Pending → opens request → Confirm (or Decline + reason) → patient notified → day-of list updates.

**Walk-in:**
Patient arrives without booking → Staff Walk-in → search/create patient → select service + notes → save → visit logged.

**Announcement:**
Staff creates announcement → published → appears on landing + patient dashboard + bell (“New announcement”).

---

## 7. Edge Cases & Validation

- Invalid-date tampering: server re-validates weekday/2nd-Wed rule; UI disables + shows hint.
- 2nd-Wednesday computation: define as 2nd Wednesday of calendar month (if holiday, staff manually declines/reschedules — no auto-holiday calendar v1).
- Double-booking same patient same date+service: blocked (confirmed).
- Past dates / >30 days ahead: blocked in picker.
- Cancel policy (confirmed): patient can cancel pending or confirmed (confirm dialog); completed/declined cannot be cancelled.
- Empty states, offline/API error banners (reuse current health-check pattern → proper error toasts).
- Print: reports print only table, hide nav.
- Audit: every confirm/decline/record edit logs actor + timestamp.

---

## 8. Information Architecture Summary

```
Public: Home | Services | Announcements | Login | Register
Patient (/app): Dashboard | Services | Book | My Appointments | My Records | Announcements | Notifications | Profile
Staff (/staff): Dashboard | Appointments (badge) | Patients | Walk-in | Services (manage) | Announcements (post) | Reports | Notifications | Profile
Admin (/admin): Dashboard+ | Staff Accounts | Audit Logs | Roles (view) | Security | Reports+ | (all staff views)
```

---

## 9. Out of Scope (explicitly not v1)

Medicine inventory, dose-history/immunization tracking, growth charts, PDF export, SMS, custom roles editor, dark mode, Tagalog i18n, file uploads, slot-capacity engine, holiday calendar, analytics drill-downs.

## 10. Resolved Decisions (2026-09-27) + Remaining

Resolved:
1. Booking horizon = 30 days max. As-needed = free weekday picker + “subject to staff confirmation.”
2. Registration auto-activate (no verification). Fields fixed — see §1.2.
3. Double-booking same date+service = blocked. Cancel = pending or confirmed by patient.
4. Email = Resend + announcements per-post email to registered patients.
5. Announcements = public (no login) + in-app + email.
6. Notifications: patients bell+email (status, announcements, day-before reminder); staff/admin bell for new requests. No SMS.
7. Theme = PulseCare-style (gradients, cards, soft shadows, blue/teal/green) + English-only.
8. Reports = Today/Week/Month presets, monthly primary. CSV columns TBD from DOH format if needed.
9. Sessions = JWT Bearer (7d), scrypt hashing. First admin/staff via `seed:user`; catalog via `seed:services`.
10. Booking = service catalog + valid-dates API + 3-step wizard + patient lists (built); staff confirm/decline/complete queue + audit trail (built).
11. Records = clinical fields on completion + patient read-only view (built); staff patient directory next.
12. Announcements = public feed + patient feed + staff composer + per-post Resend emails (built; emails need RESEND_API_KEY).
13. Notifications = in-app inbox + bell badge/drawer + confirm/decline emails + day-before reminders via `reminders` script (built).

Still open:
1. CSV column exact shape for DOH (if strict format required).

---

*Generated from interviews; maps to `context/problem_statement.md`, `system_flow.md`, `user_stories.md` (still templates — fill from §6 flows) and `tech_stack.md` constraints.*
