# 11 — Reports (on-screen + print + CSV, no PDF)

> v1 reports: 1) visits by service (daily/weekly), 2) appointments by status (pending/confirmed/declined/completed by service), 3) basic patient list. Presets Today/Week/Month (monthly primary for DOH). Print stylesheet + CSV export via backend. No custom range, no PDF, CSV columns TBD if DOH strict.

## 1. Layout options

- **A. Report switcher + preset bar + table + actions (recommended).** Tabs for 3 reports, preset segmented (Today/Week/Month), table with sticky translucent header, footer summary row (totals), actions [Print][Export CSV] top-right near table (proximity mapping).
  - *Pros:* one pattern for all reports, minimal learning, print-friendly. *Cons:* no custom range — accepted v1 constraint (Simplicity).
- **B. Dashboard-embedded export.** Fewer pages but conflates ops + compliance.
- **C. Query builder.** Flexible, overkill + jargon for BHW.

**Recommendation: A.** Monthly default selected (primary use), preset change refetches with skeleton (continuous status feedback).

## 2. Tables & hierarchy

- Visits by service: columns Date, Service, Count, breakdown link (→ filtered appointments). Summary: total visits month.
- By status: rows Service × columns Pending/Confirmed/Declined/Completed/Total + week total. Status chips consistent with appointments.
- Patient list: name, age/sex, address, contact, household #, last visit. Search box filters client-side after fetch (instant feedback).
- Totals emphasized with weight, not just size. Empty → "No data for this period" + suggest another preset (forgiveness, not dead end).

## 3. Components & interactions

- shadcn Table, Tabs, Segmented presets, Buttons. Export triggers download + completion toast ("CSV downloaded"); Print opens print view (nav/bell hidden via print CSS, table only).
- No animation on data change except short fade; keep focus on preset after reload (wayfinding).
- CSV filename convention: `healthcentria-{report}-{YYYY-MM}.csv` (predictability/Familiarity).

## 4. Responsive / print

- Desktop full tables; mobile tables → horizontally scrollable with sticky first column (patient name) + snap, or card fallback for patient list. Export buttons remain visible (sticky action bar).
- Print: black-on-white, no shadows/gradients, header with clinic + period + generated-at, footer page numbers via CSS.

## 5. Acceptance

- [ ] Monthly preset default; Today/Week work.
- [ ] Print shows only report + header; no nav.
- [ ] CSV downloads and opens in Excel (UTF-8 BOM if needed for PH characters — confirm on implementation).
- [ ] No PDF option exposed.
