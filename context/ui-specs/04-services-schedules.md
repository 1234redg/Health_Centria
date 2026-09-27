# 04 — Services & Schedules (patient read + staff manage)

> Services: Consultation Mon, Prenatal Tue, Immunization-newborn 2nd Wed/month, Family Planning Thu, As-needed (Postpartum, Follow-up, Hypertensive, Breastfeeding). Booking enforces valid days, 30-day horizon. Staff CRUD recurrence.

## 1. Patient view

### Options
- **A. Cards + week timetable toggle (recommended).** Default grid of service cards (icon, plain schedule text, [Book this service] preselects service). Toggle to Week view (Mon–Sun rows with service pills). Search box filters.
  - *Pros:* cards friendly for low-literacy; timetable answers "when". *Cons:* two views to maintain — mitigated by shared data.
- **B. Table only.** Dense, clinical, bad on phones.
- **C. Calendar month with dots.** Confusing for weekly recurrence + 2nd-Wed rule.

**Recommendation: A.** Detail opens as anchored sheet (origin = card, symmetric enter/exit, spring 1.0/0.35, interruptible drag-to-dismiss with velocity handoff) showing description, schedule, upcoming 3 valid dates, [Book].

### Interactions
- Search responds on each keystroke (no debounce lag on input path); list updates continuously.
- Sheet: 1:1 drag, rubber-band past bounds, snap via projection; reduced motion → fade.
- Book CTA highlights on pointer-down.

## 2. Staff manage view (`/staff/services`)

Table (name, rule text, active toggle, upcoming date, bookings count) + [New service]. Create/Edit modal: name, description, mode radio (Weekly weekdays multi-select / Nth-weekday-of-month (week 1–4 + weekday) / As-needed), active toggle. Validation: at least one weekday unless as-needed; preview line ("Occurs: every Monday" / "2nd Wednesday of month") updates live (proximity mapping — control near effect).

- **Tradeoff:** Custom recurrence builder vs fixed presets. Chosen: constrained builder (weekly + Nth-weekday + as-needed) — covers v1 services without full RRULE complexity (Purpose/Simplicity).
- Deactivate (not delete) if bookings exist — confirm dialog only here (destructive guard).

## 3. Responsive

- Patient mobile: 1-col cards, timetable becomes vertical day list. Staff mobile: table → cards, modal becomes full sheet.
- 44px targets, plain language ("Every Tuesday" not "RRULE:FREQ=WEEKLY").

## 4. Acceptance

- [ ] Each card states valid days unambiguously.
- [ ] Staff preview matches booking-picker enablement logic (shared util for weekday/2nd-Wed).
- [ ] Inactive services hidden from patients but visible to staff with badge.
