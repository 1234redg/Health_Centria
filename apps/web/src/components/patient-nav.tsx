import { Bell, CalendarCheck, CalendarDays, ClipboardList, LayoutDashboard, Megaphone, Plus } from 'lucide-react';
import type { ShellNavItem } from './dashboard-shell';

/** Single source of truth for the patient sidebar — every patient page uses this. */
export const patientNav: ShellNavItem[] = [
  { label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard },
  { label: 'Services', to: '/app/services', icon: CalendarDays },
  { label: 'Book Appointment', to: '/app/appointments/new', icon: Plus },
  { label: 'My Appointments', to: '/app/appointments', icon: CalendarCheck },
  { label: 'My Records', to: '/app/records', icon: ClipboardList },
  { label: 'Announcements', to: '/app/announcements', icon: Megaphone },
  { label: 'Notifications', to: '/app/notifications', icon: Bell },
];
