# 09 — Announcements (public feed + staff composer)

> Public visible without login (`/` preview + `/announcements`), category chips (Schedule Change, Vaccination Day, Health Advisory, General), pinned first. Any staff can post (admin can delete any). Publish → in-app bell + per-post Resend email to registered patients.

## 1. Reader options

- **A. Feed + detail page (recommended).** Cards with pin icon, category chip, date, excerpt → detail page (same enter/exit path, anchored origin). Pinned section on top, then chronological. Preview 3–5 on landing.
  - *Pros:* shareable URLs for barangay reminders, email links land correctly. *Cons:* needs detail route — trivial with TanStack Router.
- **B. Modal-only detail.** Faster but breaks sharing/deep links from email.
- **C. Banner ticker.** Eye-catching but unreadable for long advisories, bad accessibility.

**Recommendation: A.**

## 2. Composer (staff) options

- **A. List + modal composer (recommended).** Table/cards (title, category, pinned, date, status) + [New] modal: title, category select, body (textarea with plain formatting hint, no rich-text v1), pinned toggle, publish now/schedule date. Preview pane live (mapping: control near effect).
  - *Pros:* simple, focused modal task with dim scrim (pushes background back). *Cons:* no image upload v1 — text-only (Purpose: avoids storage/moderation).
- **B. Inline page editor.** More space but loses context of list.
- **C. Rich WYSIWYG.** Overkill, XSS/moderation risk.

**Recommendation: A**, text-only v1. Publish requires confirm ("Notify all patients via bell + email?") — meaningful commit gets multimodal confirm (visual + toast), no haptic spam.

## 3. Interactions

- Publish: button down-feedback, sheet dismisses along same path it entered, feed prepends with damped rise; bell badge increments continuously.
- Category filter chips filter 1:1 (no reload); pinned stays on top.
- Reduced motion: fade; no auto-carousel.

## 4. Responsive

- Reader mobile: single feed, 16px body, generous leading (1.6) for readability. Composer mobile: full sheet, sticky [Publish].
- Email template mirrors card (title, category, excerpt, link) — plain, high contrast.

## 5. Acceptance

- [ ] Public feed loads without auth; detail shareable.
- [ ] Per-post email sent once (idempotent key to avoid dupes on double-click).
- [ ] Admin can delete any post (confirm dialog).
