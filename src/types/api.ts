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
  price: number;
  is_active: boolean;
  created_at: string;
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
  payment_status: string;
  payment_proof_url: string | null;
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
}

export interface Booking {
  id: string;
  student_id: string;
  trip_id: string;
  qr_token: string;
  status: 'active' | 'used' | 'cancelled';
  validated_at: string | null;
  validated_by: string | null;
  created_at: string;
  users?: { id: string; full_name: string; email: string; student_number: string | null };
  trips?: Trip;
}

export interface DashboardStats {
  total_users: number;
  pending_users: number;
  active_subscriptions: number;
  pending_payments: number;
  upcoming_trips: number;
  pending_event_bookings: number;
}
