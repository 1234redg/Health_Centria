# 07 — Patient Records (staff full + patient basic read-only)

> Staff: search/filter table → Patient Detail (profile header + Visit History timeline/table + Add Visit/Edit). Patient "My Records": read-only own visits (diagnosis/notes + prescriptions). No uploads v1. Audit logs record edits.

## 1. Staff list + detail options

- **A. Master-detail: searchable table → detail page with header + timeline (recommended).** List columns: name, age/sex, address, last visit, visits count. Detail header: contact, household #, PhilHealth, emergency contact. Visits as timeline (newest first) with service chip, diagnosis, prescription, attending staff, notes + [Add visit] primary, [Edit] per visit (logs actor+time).
  - *Pros:* Familiar clinical chart metaphor, scannable, supports front-desk search speed. *Cons:* long histories need pagination — use "Show more", not infinite scroll v1.
- **B. Single-page EHR grid.** Dense, intimidating, poor mobile.
- **C. Card-only directory.** Friendly but slow for large censuses.

**Recommendation: A.** Search responds per keystroke (continuous feedback); filters (barangay/sex/last-visit) as simple selects. Row tap highlights on down, navigates with symmetric slide (mirror easing).

## 2. Patient My Records

Simple card list (date, service, diagnosis, prescription, note), no edit affordances, explicit "Managed by clinic — contact front desk for corrections" (Responsibility + Clarity). Same data staff marked patient-visible; no hidden sensitive split v1.

## 3. Forms (Add/Edit visit)

Modal/sheet: service select, date (default today), diagnosis (textarea), prescription (textarea with line hints), notes, attending staff auto. Inline validation, Save → toast + timeline prepend (critically damped rise, interruptible). Edit shows "Last edited by X at Y". Confirm only for delete (avoid delete v1 if possible — prefer edit + audit).

## 4. Interactions

- Detail header sticks as translucent layer with blur on scroll (material weight = structure), content scrolls under.
- Timeline expand/collapse animates from live height, reversible path.
- Reduced motion/transparency/contrast honored; print visit list cleanly (hide nav) for referrals if needed.

## 5. Responsive

- Desktop: 2-col detail (left profile sticky, right timeline). Mobile: stacked, Add visit as bottom primary button (thumb reach), tables → cards.
- 44px targets, 16px base, labels always visible.

## 6. Acceptance

- [ ] Patient cannot edit; staff edits logged.
- [ ] Search finds by name/household/contact.
- [ ] Empty history → "No visits yet" + Add visit CTA (staff) / "No records" (patient).
