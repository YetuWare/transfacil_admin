export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  account_type: 'student' | 'general';
  role: string;
  status: 'pending' | 'active' | 'rejected';
  rejection_reason?: string | null;
  student_number: string | null;
  university: string | null;
  course: string | null;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration_months: number;
  duration_days: number | null;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Subscription {
  id: string;
  student_id: string;
  plan_id: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  payment_proof_url: string | null;
  payment_notes: string | null;
  merchant_transaction_id?: string | null;
  ekwanza_transaction_id?: string | null;
  payment_method?: 'REF' | 'GPO' | null;
  payment_reference?: string | null;
  payment_entity?: string | null;
  payment_expires_at?: string | null;
  paid_at?: string | null;
  created_at: string;
  users?: { full_name: string; email: string };
  subscription_plans?: { name: string; duration_months: number; price: number };
}

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  estimated_duration_min: number | null;
  stops?: Array<{ name: string; estimated_time?: string; order: number }>;
  is_active: boolean;
  created_at: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string | null;
  capacity: number;
  driver_id: string | null;
  is_active: boolean;
  users?: { full_name: string; phone: string };
}

export interface EventTrip {
  id: string;
  event_id: string;
  vehicle_id: string;
  driver_id: string;
  departure_time: string;
  return_departure_time?: string;
  available_seats: number;
  total_seats: number;
  stops: any[];
  vehicles?: { plate: string; model: string };
  users?: { id: string; full_name: string; phone: string };
}

export interface EventData {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  event_date: string;
  origin: string;
  destination: string;
  price_one_way: number;
  price_return: number;
  price_round_trip: number;
  available_seats: number;
  total_seats: number;
  max_seats_per_user?: number | null;
  is_active: boolean;
  event_trips?: EventTrip[];
  created_at: string;
}

export interface EventBooking {
  id: string;
  user_id: string;
  event_id: string;
  trip_type: 'one_way' | 'return' | 'round_trip';
  pickup_address: string;
  amount: number;
  seats?: number;
  payment_status: string;
  payment_proof_url: string | null;
  payment_notes?: string | null;
  merchant_transaction_id?: string | null;
  ekwanza_transaction_id?: string | null;
  payment_method?: 'REF' | 'GPO' | null;
  payment_reference?: string | null;
  payment_entity?: string | null;
  payment_expires_at?: string | null;
  paid_at?: string | null;
  qr_token: string | null;
  created_at: string;
  users?: { full_name: string; email: string };
  events?: { title: string; event_date: string; origin: string; destination: string };
  event_trips?: EventTrip;
}

export interface BankDetail {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  iban: string | null;
  reference: string | null;
  is_active: boolean;
  created_at: string;
}

export interface University {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface Trip {
  id: string;
  route_id: string;
  vehicle_id: string;
  driver_id: string;
  departure_time: string;
  available_seats: number;
  total_seats: number;
  status: string;
  stops?: any;
  routes?: { name: string; origin: string; destination: string };
  vehicles?: { plate: string; model: string };
  users?: { full_name: string; phone: string };
  schedule_id?: string | null;
  service_date?: string | null;
  direction?: 'outbound' | 'return';
}

export interface Booking {
  id: string;
  student_id: string;
  trip_id: string;
  qr_token: string;
  status: 'active' | 'used' | 'cancelled' | 'pending_payment';
  validated_at: string | null;
  validated_by: string | null;
  // Viagem extra paga
  is_extra?: boolean;
  amount?: number | null;
  payment_method?: 'REF' | 'GPO' | null;
  payment_reference?: string | null;
  payment_entity?: string | null;
  payment_expires_at?: string | null;
  paid_at?: string | null;
  payment_notes?: string | null;
  created_at: string;
  users?: { id: string; full_name: string; email: string; student_number: string | null };
  trips?: Trip;
}

export interface SupportRequest {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved';
  admin_response?: string | null;
  resolved_by?: string | null;
  resolved_at?: string | null;
  created_at: string;
  user?: { id: string; full_name: string; email: string };
}

export interface AppConfig {
  id: string;
  contact_email: string;
  contact_phone: string;
  contact_hours_pt: string;
  contact_hours_en: string;
  extra_trip_price: number;
  created_at: string;
  updated_at: string;
}

export interface Faq {
  id: string;
  question_pt: string;
  question_en: string;
  answer_pt: string;
  answer_en: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_users: number;
  pending_users: number;
  active_subscriptions: number;
  pending_payments: number;
  upcoming_trips: number;
  pending_event_bookings: number;
  pending_support_requests: number;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  actor_role: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditLogFilters {
  actor_email?: string;
  action?: string;
  entity_type?: string;
  entity_id?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface TripSchedule {
  id: string;
  name: string | null;
  route_id: string;
  vehicle_id: string;
  driver_id: string;
  departure_time: string;            // HH:MM:SS (hora de Luanda)
  return_departure_time: string | null;
  weekdays: number[];                // 1 = segunda ... 7 = domingo
  valid_from: string;
  valid_until: string | null;
  total_seats: number;
  stops: { name: string; estimated_time?: string; order: number }[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  routes?: { id: string; name: string; origin: string; destination: string };
  vehicles?: { id: string; plate: string; model: string | null; capacity: number };
  users?: { id: string; full_name: string; phone: string | null };
  generated?: { created: number; skipped: number };
}
