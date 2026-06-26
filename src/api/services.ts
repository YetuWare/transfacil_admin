import { api } from './client';
import type {
  User, Subscription, SubscriptionPlan, Route, Vehicle, EventData, EventTrip, EventBooking, Booking,
  BankDetail, University, Course, DashboardStats, Trip, SupportRequest, AppConfig, Faq,
} from '../types/api';

export const authService = {
  login: (email: string, password: string) =>
    api.post<{ user: User; token: string }>('/auth/admin-login', { email, password }),
  logout: () => api.post<void>('/auth/logout'),
  me: () => api.get<User>('/auth/me'),
};

export const usersService = {
  list: (params?: { status?: string; account_type?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.account_type) q.set('account_type', params.account_type);
    const s = q.toString();
    return api.get<User[]>(`/admin/users${s ? `?${s}` : ''}`);
  },
  pending: () => api.get<User[]>('/admin/users/pending'),
  approve: (id: string) => api.put<User>(`/admin/users/${id}/approve`),
  reject: (id: string, reason: string) =>
    api.put<User>(`/admin/users/${id}/reject`, { reason }),
  deactivate: (id: string) =>
    api.put<User>(`/admin/users/${id}/deactivate`),
  reactivate: (id: string) =>
    api.put<User>(`/admin/users/${id}/reactivate`),
  delete: (id: string) => api.del<void>(`/admin/users/${id}`),
  createAdmin: (data: { email: string; password: string; full_name: string; phone?: string }) =>
    api.post<User>('/admin/users', data),
};

export const subscriptionsService = {
  list: (status?: string) =>
    api.get<Subscription[]>(`/admin/subscriptions${status ? `?status=${status}` : ''}`),
  approve: (id: string, start_date: string) =>
    api.put<Subscription>(`/admin/subscriptions/${id}/approve`, { start_date }),
  reject: (id: string, notes: string) =>
    api.put<Subscription>(`/admin/subscriptions/${id}/reject`, { notes }),
};

export const plansService = {
  list: () => api.get<SubscriptionPlan[]>('/admin/subscription-plans'),
  create: (data: Partial<SubscriptionPlan>) =>
    api.post<SubscriptionPlan>('/admin/subscription-plans', data),
  update: (id: string, data: Partial<SubscriptionPlan>) =>
    api.put<SubscriptionPlan>(`/admin/subscription-plans/${id}`, data),
};

export const routesService = {
  list: () => api.get<Route[]>('/admin/routes'),
  create: (data: Partial<Route>) =>
    api.post<Route>('/routes', data),
  update: (id: string, data: Partial<Route>) =>
    api.put<Route>(`/routes/${id}`, data),
  delete: (id: string) => api.del<void>(`/routes/${id}`),
};

export const vehiclesService = {
  list: () => api.get<Vehicle[]>('/admin/vehicles'),
  create: (data: Partial<Vehicle>) =>
    api.post<Vehicle>('/admin/vehicles', data),
  update: (id: string, data: Partial<Vehicle>) =>
    api.put<Vehicle>(`/admin/vehicles/${id}`, data),
};

export const eventsService = {
  list: () => api.get<EventData[]>('/admin/events'),
  create: (data: Partial<EventData>) =>
    api.post<EventData>('/admin/events', { ...data, event_date: new Date(data.event_date!).toISOString() }),
  update: (id: string, data: Partial<EventData>) =>
    api.put<EventData>(`/admin/events/${id}`, { ...data, event_date: new Date(data.event_date!).toISOString() }),
  uploadImage: (id: string, file: File) =>
    api.upload<EventData>(`/admin/events/${id}/image`, file),
};

export const eventTripsService = {
  list: (eventId: string) => api.get<EventTrip[]>(`/admin/events/${eventId}/trips`),
  create: (eventId: string, data: Partial<EventTrip>) =>
    api.post<EventTrip>(`/admin/events/${eventId}/trips`, {
      ...data,
      departure_time: new Date(data.departure_time!).toISOString(),
      return_departure_time: data.return_departure_time ? new Date(data.return_departure_time).toISOString() : undefined,
    }),
  update: (eventId: string, tripId: string, data: Partial<EventTrip>) =>
    api.put<EventTrip>(`/admin/events/${eventId}/trips/${tripId}`, {
      ...data,
      departure_time: data.departure_time ? new Date(data.departure_time).toISOString() : undefined,
      return_departure_time: data.return_departure_time ? new Date(data.return_departure_time).toISOString() : undefined,
    }),
  delete: (eventId: string, tripId: string) =>
    api.del<void>(`/admin/events/${eventId}/trips/${tripId}`),
};

export const eventBookingsService = {
  list: (status?: string) =>
    api.get<EventBooking[]>(`/admin/event-bookings${status ? `?status=${status}` : ''}`),
  approve: (id: string) =>
    api.put<EventBooking>(`/admin/event-bookings/${id}/approve`),
  reject: (id: string, notes: string) =>
    api.put<EventBooking>(`/admin/event-bookings/${id}/reject`, { notes }),
};

export const bookingsService = {
  list: () => api.get<Booking[]>('/admin/bookings'),
};

export const tripsService = {
  list: () => api.get<Trip[]>('/admin/trips'),
  create: (data: Partial<Trip>) =>
    api.post<Trip>('/admin/trips', data),
  update: (id: string, data: Partial<Trip>) =>
    api.put<Trip>(`/admin/trips/${id}`, data),
};

export const bankDetailsService = {
  list: () => api.get<BankDetail[]>('/admin/bank-details'),
  create: (data: Partial<BankDetail>) =>
    api.post<BankDetail>('/admin/bank-details', data),
  update: (id: string, data: Partial<BankDetail>) =>
    api.put<BankDetail>(`/admin/bank-details/${id}`, data),
  delete: (id: string) => api.del<void>(`/admin/bank-details/${id}`),
};

export const universitiesService = {
  list: () => api.get<University[]>('/universities/all'),
  create: (name: string) =>
    api.post<University>('/universities', { name }),
  update: (id: string, data: Partial<University>) =>
    api.put<University>(`/universities/${id}`, data),
  delete: (id: string) => api.del<void>(`/universities/${id}`),
};

export const coursesService = {
  list: () => api.get<Course[]>('/courses/all'),
  create: (name: string) =>
    api.post<Course>('/courses', { name }),
  update: (id: string, data: Partial<Course>) =>
    api.put<Course>(`/courses/${id}`, data),
  delete: (id: string) => api.del<void>(`/courses/${id}`),
};

export const supportService = {
  list: (status?: string) =>
    api.get<SupportRequest[]>(`/admin/support-requests${status ? `?status=${status}` : ''}`),
  updateStatus: (id: string, status: string, admin_response?: string) =>
    api.put<SupportRequest>(`/admin/support-requests/${id}/status`, { status, admin_response }),
};

export const statsService = {
  get: () => api.get<DashboardStats>('/admin/stats'),
};

export const configService = {
  get: () => api.get<AppConfig>('/admin/config'),
  update: (data: Partial<AppConfig>) => api.put<AppConfig>('/admin/config', data),
};

export const faqsService = {
  list: () => api.get<Faq[]>('/admin/faqs'),
  create: (data: Partial<Faq>) => api.post<Faq>('/admin/faqs', data),
  update: (id: string, data: Partial<Faq>) => api.put<Faq>(`/admin/faqs/${id}`, data),
  delete: (id: string) => api.del<void>(`/admin/faqs/${id}`),
};
