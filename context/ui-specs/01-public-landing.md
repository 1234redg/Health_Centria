# 01 — Public Landing `/` + Services/Announcements (public)

> Routes: `/`, `/services` (public view), `/announcements` (public feed). Users: visitors + registered patients (no login required). Announcements public + per-post email to registered patients (Resend).

## 1. Purpose & hierarchy

Answer in 5 seconds: what clinic, when open, how to book. Hierarchy: Hero (name/hours/CTAs) → This-Week strip → How to book (3 steps) → Services grid → Announcements 3–5 → Footer/contact.

## 2. Layout options

- **A. Single long landing with anchored sections (recommended).** Hero + sticky translucent header, week strip horizontally scrollable with momentum projection + snap, service cards grid, announcements list. One URL to share at barangay hall.
  - *Pros:* wayfinding simple, mobile-friendly, announcements visible without login (requirement). *Cons:* long page; needs scroll-edge blur + back-to-top.
- **B. Multi-page public site (Home/Services/Announcements separate).** Cleaner per-page but more clicks for low-literacy users; harder to broadcast "today's service".
- **C. Dashboard-style public portal.** Dense, intimidating for first-time visitors.

**Recommendation: A**, with `/services` and `/announcements` as deep links that scroll or standalone for SEO/share but reuse same components.

## 3. Components

- Sticky header: translucent (`blur 20px`), logo, links (Services, Announcements), Login, Register (primary gradient). Solid on `prefers-reduced-transparency`.
- Hero: soft gradient wash (teal/blue, decorative only, no motion loop), headline (tight tracking -0.02em), sub (service-days summary), CTAs [Register] [View services]. Pointer-down scale on buttons.
- This-Week strip (Mon–Sun chips with service dots): 1:1 drag on mobile, flick projects to nearest day, rubber-band at ends. Today highlighted, tap → filters services below (no page reload). Hint motion toward outcome (chip grows toward finger).
- Service cards: icon + name + plain schedule ("Every Monday", "2nd Wed of month", "As needed — staff confirms") + [Book] (→ login or booking with service preselected). Card hover lift (desktop only, transform only).
- Announcements: pinned first, category chip (Schedule Change/Vaccination/Advisory/General), date, excerpt. Click → `/announcements/$id` (same enter/exit path, anchored from card).
- Footer: address, contact, hours, map placeholder.

## 4. Interactions (apple-design)

- Header materializes on scroll (blur+scale together, not just fade).
- Strip/carousel: Pointer Events + capture, velocity handoff, snap via projection. Interruptible mid-fling.
- Reduced motion: strip becomes static scroll, no snap animation; hero gradient static.
- Tap hysteresis 10px; highlight on down.

## 5. Responsive

- Mobile: hero stacked, CTAs full-width 48px, strip snap-scroll, cards 1-col, announcements compact. Desktop: hero 2-col (copy + schedule card), cards 3-col.
- Performance: no full-viewport video, images lazy, blur only on header (not whole page) to keep frames smooth.

## 6. Edge cases / acceptance

- [ ] No login needed to view services/announcements.
- [ ] Today chip correct for PH timezone; 2nd-Wed label computed.
- [ ] Empty announcements → friendly empty state, not blank.
- [ ] Contrast passes over gradient; `prefers-contrast: more` → solid hero.
