import { getSession } from './auth';

export interface HealthResponse {
  success: boolean;
  message: string;
  uptime: number;
  db: string;
  timestamp: string;
}

export interface ServiceSchedule {
  mode: 'weekly' | 'nth-weekday' | 'as-needed';
  weekdays: number[];
  nthWeek?: number;
  weekday?: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  schedule: ServiceSchedule;
  scheduleText: string;
  active: boolean;
}

export interface Appointment {
  id: string;
  service: { id: string; name: string } | string;
  day: string;
  timePreference: 'morning' | 'afternoon' | 'any';
  notes: string;
  status: 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled';
  declineReason: string;
  diagnosis: string;
  prescription: string;
  visitNotes: string;
  createdAt: string;
}

export interface StaffAppointment extends Appointment {
  patient: { id: string; name: string; email: string } | string;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_URL}/api/health`);
  if (!res.ok) throw new Error(`API responded with ${res.status}`);
  return res.json() as Promise<HealthResponse>;
}

async function apiFetch<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = getSession()?.token;
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });
  let data: { message?: string; errors?: Record<string, string[]> } | null = null;
  try {
    data = (await res.json()) as { message?: string; errors?: Record<string, string[]> };
  } catch {
    data = null;
  }
  if (!res.ok) {
    throw new ApiError(res.status, data?.message ?? `Request failed (${res.status}).`, data?.errors);
  }
  return data as T;
}

export function listServices(): Promise<{ services: Service[] }> {
  return apiFetch('/api/services');
}

export function validDates(serviceId: string, days = 30): Promise<{ dates: string[] }> {
  return apiFetch(`/api/services/${serviceId}/valid-dates?days=${days}`);
}

export function bookAppointment(input: {
  serviceId: string;
  day: string;
  timePreference?: string;
  notes?: string;
}): Promise<{ appointment: Appointment }> {
  return apiFetch('/api/appointments', { method: 'POST', body: input });
}

export function myAppointments(): Promise<{ appointments: Appointment[] }> {
  return apiFetch('/api/appointments/mine');
}

export function cancelAppointment(id: string): Promise<{ appointment: Appointment }> {
  return apiFetch(`/api/appointments/${id}/cancel`, { method: 'PATCH' });
}

export function queueAppointments(filters: {
  status?: string;
  serviceId?: string;
  from?: string;
  to?: string;
} = {}): Promise<{ appointments: StaffAppointment[] }> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.serviceId) params.set('serviceId', filters.serviceId);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  const qs = params.toString();
  return apiFetch(`/api/appointments${qs ? `?${qs}` : ''}`);
}

export function confirmAppointment(id: string): Promise<{ appointment: StaffAppointment }> {
  return apiFetch(`/api/appointments/${id}/confirm`, { method: 'PATCH' });
}

export function declineAppointment(id: string, reason: string): Promise<{ appointment: StaffAppointment }> {
  return apiFetch(`/api/appointments/${id}/decline`, { method: 'PATCH', body: { reason } });
}

export function completeAppointment(
  id: string,
  clinical: { diagnosis?: string; prescription?: string; visitNotes?: string } = {},
): Promise<{ appointment: StaffAppointment }> {
  return apiFetch(`/api/appointments/${id}/complete`, { method: 'PATCH', body: clinical });
}

export type AnnouncementCategory = 'schedule-change' | 'vaccination-day' | 'health-advisory' | 'general';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  pinned: boolean;
  publishedAt: string;
}

export const CATEGORY_LABELS: Record<AnnouncementCategory, string> = {
  'schedule-change': 'Schedule Change',
  'vaccination-day': 'Vaccination Day',
  'health-advisory': 'Health Advisory',
  general: 'General',
};

export function listAnnouncements(): Promise<{ announcements: Announcement[] }> {
  return apiFetch('/api/announcements');
}

export function createAnnouncement(input: {
  title: string;
  body: string;
  category: AnnouncementCategory;
  pinned: boolean;
}): Promise<{ announcement: Announcement }> {
  return apiFetch('/api/announcements', { method: 'POST', body: input });
}

export function updateAnnouncement(
  id: string,
  input: Partial<{ title: string; body: string; category: AnnouncementCategory; pinned: boolean; active: boolean }>,
): Promise<{ announcement: Announcement }> {
  return apiFetch(`/api/announcements/${id}`, { method: 'PATCH', body: input });
}

export function deleteAnnouncement(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/announcements/${id}`, { method: 'DELETE' });
}

export type NotificationType =
  | 'appointment-confirmed'
  | 'appointment-declined'
  | 'appointment-cancelled'
  | 'new-request'
  | 'new-announcement'
  | 'reminder';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export function listNotifications(): Promise<{ unread: number; notifications: NotificationItem[] }> {
  return apiFetch('/api/notifications');
}

export function markNotificationRead(id: string): Promise<{ notification: NotificationItem }> {
  return apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
}

export function markAllNotificationsRead(): Promise<{ success: boolean }> {
  return apiFetch('/api/notifications/read-all', { method: 'POST' });
}
