# 05 — Appointment Booking `/app/appointments/new` (3-step wizard)

> Strict day enforcement, 30-day horizon, block same date+service double-book, patient can cancel pending/confirmed. Creates `pending` → bell+email on confirm/decline + day-before reminder (Resend).

## 1. Flow options

- **A. 3-step wizard: Service → Date+Notes → Review (recommended).** Progress indicator (1-2-3), Back preserves state, Review shows plain summary before submit.
  - *Pros:* fewer errors for low-literacy/mobile, maps to mental model, inline validation per step. *Cons:* more taps than single page — acceptable for correctness.
- **B. Single long form.** Faster for power users but overwhelming on 360px phones; invalid-date errors discovered late.
- **C. Chat/conversational.** Novel, breaks Familiarity, harder to validate dates.

**Recommendation: A**, mobile-first, sticky bottom [Back][Continue] with safe-area.

## 2. Step details & hierarchy

1. **Service:** radio cards (icon, name, schedule hint "Only Mondays"). Selected card elevated (soft shadow + gradient border). Tapping highlights on down.
2. **Date:** month calendar with invalid dates disabled + reason line ("Consultation only on Mondays", "Immunization: 2nd Wed of month"). Past + >30 days disabled. Selected date large + weekday. Notes field (symptoms, optional) + time preference (optional select Morning/Afternoon — no slot engine v1). If same date+service exists → inline block "You already have a request for this service on this date" + link to My Appointments (no submit).
3. **Review:** service, date, notes, schedule reminder → [Submit request]. Success screen (check, "Pending — we'll notify you") + [View my appointments] [Book another]. Symmetric return path.

## 3. Components

shadcn RadioGroup cards, Calendar (custom disabled logic shared with services), Textarea, Alert, Progress steps. Status copy plain, no jargon.

## 4. Interactions (apple-design)

- Step transitions: critically damped x-slide from live value, mirror easing both directions; interruptible rapid Next/Back.
- Calendar month swipe: 1:1 drag, velocity projection to nearest month, rubber-band at 30-day bounds. Disabled dates never animate as selectable (no misleading feedback).
- Keyboard: focus moves to step heading on advance; Esc does not lose draft (Agency) — explicit Cancel with confirm.
- Reduced motion: cross-fade steps, no slide.

## 5. Responsive / validation

- Mobile: cards full-width 52px, calendar full-width, bottom action bar. Desktop: centered max-w 640px, 2-col review.
- Server re-validates weekday/2nd-Wed/horizon/double-book even if tampered (UI hint mirrors rule).
- Acceptance: [ ] cannot submit invalid day; [ ] double-book blocked client+server; [ ] success triggers pending chip + toast.
