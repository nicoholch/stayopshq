export type Plan = 'free' | 'starter' | 'pro' | 'enterprise';

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  public_page_enabled: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  hotel_id: string;
  full_name: string;
  role: 'manager' | 'staff';
  department: Department | null;
}

export type Department =
  | 'Front Desk'
  | 'Housekeeping'
  | 'Food & Beverage'
  | 'Concierge'
  | 'Spa & Fitness'
  | 'Pool & Beach'
  | 'Valet & Transport'
  | 'Activities'
  | 'Maintenance';

export type ComplaintSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ComplaintStatus = 'open' | 'in_progress' | 'resolved';

export type ComplaintCategory =
  | 'Room Condition'
  | 'Cleanliness'
  | 'Noise'
  | 'Temperature / AC'
  | 'Maintenance'
  | 'Staff Behavior'
  | 'Food & Beverage'
  | 'Wait Times'
  | 'Billing'
  | 'Other';

export interface Complaint {
  id: string;
  hotel_id: string;
  submitted_by: string;
  guest_id: string | null;             // FK → guests.id (optional, linked at logging time)
  guest?: Pick<Guest, 'name' | 'email'>; // joined field, populated in DB queries
  department: Department;
  room_number: string | null;
  category: ComplaintCategory;
  description: string;
  severity: ComplaintSeverity;
  status: ComplaintStatus;
  assigned_to: string | null;
  resolution: string | null;           // how the issue was resolved
  compensation: string | null;         // e.g. "Room upgrade", "$50 credit"
  guest_satisfaction: number | null;   // 1–5 post-resolution rating
  resolved_at: string | null;
  created_at: string;
}

export interface Guest {
  id: string;
  hotel_id: string;
  name: string;
  email: string;
  room_number: string;
  check_in: string;   // ISO date string YYYY-MM-DD
  check_out: string;  // ISO date string YYYY-MM-DD
  followup_sent: boolean;
  created_at: string;
}

export interface DepartmentComplaintCount {
  department: Department;
  open_count: number;
  resolved_count: number;
  total_count: number;
}
