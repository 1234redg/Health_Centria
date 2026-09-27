# 12 — Notifications + Profile + Admin (staff accounts, audit, roles, security)

> Notifications: patients bell+email (confirm/decline+reason, new announcement per-post, day-before reminder via Resend); staff/admin bell for new requests. No SMS. Profile: patient edits contact/address/household/emergency/password (views PhilHealth); staff edits name/contact/password. Admin: staff CRUD + activate, roles matrix read-only, audit table (login, create/approve/decline, record edits), security placeholder.

## 1. Notifications center options

- **A. Bell drawer + full page (recommended).** Topbar bell with dot → dropdown/drawer (recent 10, Mark-all-read) → [View all] to `/notifications` full list grouped Today/Earlier, click navigates to appointment/announcement (anchored, symmetric). Filter chips (All/Appointments/Announcements).
  - *Pros:* quick triage + deep history, interruptible drawer (drag-to-dismiss with velocity, origin at bell). *Cons:* two UIs — share row component.
- **B. Page only.** Loses quick glance; extra navigation.
- **C. Toasts only.** Ephemeral, no history (fails accountability).

**Recommendation: A.** Row: icon by type, message plain ("Your Prenatal on Tue Jul 8 confirmed"), timestamp relative, unread tint + dot (not color-only). Day-before reminders labeled "Reminder". Staff rows: "New request: Juan D. — Consultation Mon needs review" → jumps to queue filtered pending.

Interactions: drawer springs 1.0/0.35 (bounce 0.2 only on flick dismiss mobile), content scrolls under translucent header, Mark-all-read optimistically updates badge continuously. Reduced motion → fade. Haptics/sound none (Utility: reserve for commit moments like Confirm, not every bell).

## 2. Profile options

- **A. Single settings page with sections (recommended).** Personal (read-only name/birthdate/sex for patients — prevents ID drift; editable contact/address/household/emergency), Account (email read-only + password change with confirm), Preferences (email reminders toggle, optional v1). Staff similar minus household. Save per section with inline success (completion feedback), not one giant Save.
- **B. Modal editor.** Cramped for many fields.
- **C. Multi-tab.** Overkill for ≤10 fields.

Clinical fields locked with explainer (Responsibility). PhilHealth shown read-only for patients (edit via front desk to keep verified).

## 3. Admin screens

- **Staff Accounts:** table (name, role, email, active, last login) + [Add staff] modal (name, email, temp password, role staff/admin), row actions Deactivate/Reactivate + Reset password (both confirm — destructive sparingly). Search instant.
- **Roles:** read-only matrix (rows capabilities, cols admin/staff/patient, check icons) + "Custom permissions — future" note. No editor v1 (avoids privilege-escalation risk).
- **Audit Logs:** filterable table (timestamp, actor, action, target link), presets Today/Week/Month (reuse pattern), row → detail (before/after summary for record edits). No export v1 (CSV optional later). Pagination "Show more".
- **Security:** placeholder card list (password rule text, session timeout note, DPA consent version + effective date, Resend sender identity status). No toggles that imply backend support that doesn't exist (Responsibility).

## 4. Responsive / acceptance

- Drawer full-width on mobile (bottom sheet with flick bounce), dropdown on desktop anchored to bell (transform-origin at bell).
- [ ] Badge clears on read; email links deep-link correctly when logged in (else login then redirect — never trap).
- [ ] Audit records every confirm/decline/record-edit with actor+time; patient views never expose other patients.
- [ ] Deactivate blocks login immediately (error message generic to avoid enumeration).
