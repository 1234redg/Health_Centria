# System Flow

## 1. Authentication
Register/Login → Better-Auth verifies → session created → redirected to role dashboard (Patient / Staff / Admin). Includes password reset (email link) and logout.

## 2. Schedule of Services (digital, replaces printed sign)
Staff/Admin adds or edits a service + its day/recurrence (e.g. Consultation–Mon, Prenatal–every Tue, Immunization–every 2nd Wed, Family Planning–Thu) → saved to DB → patients see it live on their dashboard.

## 3. Patient Appointment Request
Patient views schedule → picks a service + date (must match that service's day) → submits request → status = **pending** → patient can track status (pending/confirmed/declined) and history.

## 4. Staff Appointment Handling
Staff views pending requests → confirms or declines → patient notified automatically → confirmed ones show on staff dashboard.

## 5. Resident Record & Visit History (replaces paper ITR)
- **New/walk-in resident:** staff registers profile (name, birthdate, address, PhilHealth no., etc.)
- **Existing resident:** staff searches and opens their record
- **Each visit:** staff adds an entry with date, vital signs (WT, TEMP, O2, HR, RR, HT, BP), diagnosis, and treatment plan → saved to that resident's history, viewable as a timeline.

## 6. Announcements
Staff posts an announcement (e.g. schedule change, health drive) → saved → appears on all patient dashboards, optionally with a notification.

## 7. Reports & Statistics
Staff/Admin selects a report type (appointment count, status breakdown, patients served, services used) → system aggregates data → shown as charts/tables 

## 8. Admin: Accounts & Access
Admin creates/deactivates staff accounts → assigns roles → configures per-role permissions → applied on next login.

## 9. Security & Backup
Admin sets an automatic backup schedule (cron job) → runs in the background. Every sensitive action (login, record edit, role change) is written to an audit log, viewable by Admin.

## 10. Technical flow (how a request travels)
```
React (frontend) → tRPC call → Express server → Better-Auth checks session/role
   → business logic runs → Mongoose reads/writes MongoDB Atlas → response → UI updates


Note: I am not sure with all of the information above yuo can ask or verify some things to me in the future since i only get that by asking suggestion to AI