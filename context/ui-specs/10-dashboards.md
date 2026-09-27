# 10 — Dashboards: Staff (daily ops) + Admin (system-wide)

> Staff: Today's Appointments, Pending Requests, Today's Service, Total Patients (small), Today's schedule table, bar visits-per-service (static 7/30d), pending shortcut. Admin: all staff + Total Patients, Staff Accounts, Appointments-by-status week, line/bar utilization over time. visx, no filters/drill-downs v1. PulseCare-style cards + gradients + clear viz.

## 1. Layout options

- **A. KPI cards → Today's list → Chart (recommended both roles).** Top 4 KPI cards (icon, delta-free counts, gradient accent on primary), then 2-col: Today's schedule (table/cards) + Chart card. Admin adds second row: system cards + utilization chart. Pending-approval CTA card when backlog >0 (warning feedback).
  - *Pros:* achievement + understanding at a glance, matches card-based friendly-trustworthy brief, scannable on desktop + stacks on mobile. *Cons:* charts take space — keep one per dashboard v1 (Purpose).
- **B. Chart-first analytics.** Impressive but wrong for front-desk triage (needs actions first).
- **C. List-only ops.** Fast but loses utilization insight admin needs.

**Recommendation: A.** Information hierarchy: act now (pending/today) → orient (today service) → understand (chart).

## 2. Components & viz

- KPI card: label (small, +tracking), value (large, tight), sub ("5 pending need review"), icon in tinted tile, soft shadow. Primary card (Today) subtle gradient border.
- Today's table: time/service, patient, status chip, [View]. Empty → "No appointments today".
- Bar chart (visx, static range): visits per service; Admin line/bar over time. Tooltips on hover (desktop), tap values on mobile (large hit areas). No filter UI v1 — title states range ("Last 30 days"). Colors blue/teal/green + slate grid, color-blind-safe (labels + values, not color-only).
- Skeletons while loading (chart shimmer already in repo — reuse `area-chart-loading` patterns, no looping oscillation).

## 3. Interactions (restrained Apple)

- Cards rise 8px critically damped on load, stagger <100ms total; numbers count up short (or static if reduced motion). Never block taps during load.
- Chart hover: 1:1 highlight (dim others via `series-hover-dim`), tooltip anchored to point (origin-aware), symmetric show/hide. Touch: tap point, not hover.
- Pending badge + bell update continuously (no poll lag perceptible; simple refetch on focus/action).
- Translucent sticky section headers with blur where table scrolls under.

## 4. Responsive

- Desktop: 4 KPIs in row, 2-col below. Tablet: 2×2 KPIs. Mobile: horizontal snap KPI scroll (projection) or 2-col compact, then stacked list + chart full-width, chart height 220px min for touch.
- Print not needed for dashboards (reports cover print).

## 5. Acceptance

- [ ] Staff sees today + pending without scrolling on 1440px.
- [ ] Admin extra cards only for admin role (guard).
- [ ] Charts render with zero data ("No visits yet") gracefully.
- [ ] No drill-down/filter controls v1 (explicitly out).
