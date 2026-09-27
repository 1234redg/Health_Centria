# 08 — Walk-in Registration `/staff/walk-in` (front-desk speed)

> Single quick form: search existing → autofill OR new patient (name, DOB, sex, address, contact + household/emergency minimal) + service + today auto + complaint/notes → creates completed/confirmed + appears in history + audit.

## 1. Layout options

- **A. One-page split: Search left, Form right (recommended desktop); stacked mobile.** Top search bar with live results; selecting fills form (highlight changed fields briefly). New-patient toggle reveals minimal fields. Bottom sticky [Save visit] large.
  - *Pros:* fastest path (search→save in <30s), forgiveness (Back keeps input), proximity mapping. *Cons:* dense — solved by progressive disclosure (advanced fields collapsed).
- **B. Wizard.** Safer but slower for queue at front desk.
- **C. Modal from queue.** Good shortcut but not enough space for new-patient fields.

**Recommendation: A**, plus "Create walk-in" entry from Appointments queue and Patient Detail (pre-fills patient).

## 2. Hierarchy & fields

Order: 1 Search → 2 Patient (name, birthdate auto-age, sex segmented, address, contact, household #, emergency) → 3 Visit (service select with today's validity hint, date=today locked with override + reason, complaint/notes) → Save. Required minimal: name, birthdate, sex, contact, service. Optional collapsed: PhilHealth, full address detail.

Keyboard-first: Tab order logical, Enter in search selects top hit, Cmd/Ctrl+S saves (desktop). Large buttons, 48px Save.

## 3. Interactions

- Live search per keystroke, 1:1 list update, arrow-key navigable, Esc clears (never traps).
- Save: pointer-down feedback, optimistic prepend to Today's list + toast with [View record] (completion feedback), no input lock; failure → inline error + retry preserves input.
- Reduced motion: no slide, fade only.

## 4. Responsive

- Desktop 2-col; tablet/mobile single stack, search sticky under topbar (translucent), Save sticky bottom with safe-area.
- Works offline-fail gracefully: API error banner + draft retained in-memory (no localStorage PHI v1 — Responsibility/privacy).

## 5. Acceptance

- [ ] Existing patient found in ≤3 keystrokes for common names (ranking TBD).
- [ ] New walk-in appears in Today's appointments + patient history immediately.
- [ ] Audit logs creator + timestamp.
- [ ] Invalid service-for-today warns but allows staff override with note (unlike patient strict block).
