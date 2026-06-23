// Database Type Definitions for GarageBook
// Derived from Supabase PostgreSQL Schema

export interface Profile {
  id: string; // UUID references auth.users
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_pro: boolean;
  created_at: string;
}

export interface Vehicle {
  id: string; // UUID
  user_id: string; // UUID references Profile
  year: number;
  make: string;
  model: string;
  trim: string | null;
  body_style: string | null;
  vin: string | null;
  purchase_date: string | null; // ISO Date String
  purchase_price: number | null;
  current_mileage: number | null;
  is_primary: boolean;
  created_at: string;
}

export interface MaintenanceRecord {
  id: string; // UUID
  vehicle_id: string; // UUID references Vehicle
  service_date: string; // ISO Date String
  mileage: number;
  service_type: string;
  description: string | null;
  cost: number;
  shop_name: string | null;
  receipt_url: string | null;
  created_at: string;
}

export interface Modification {
  id: string; // UUID
  vehicle_id: string; // UUID references Vehicle
  install_date: string; // ISO Date String
  part_name: string;
  brand: string | null;
  category: string | null;
  cost: number;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface Expense {
  id: string; // UUID
  vehicle_id: string; // UUID references Vehicle
  expense_date: string; // ISO Date String
  category: 'Fuel' | 'Insurance' | 'Registration' | 'Other' | string;
  amount: number;
  description: string | null;
  mileage: number | null;
  created_at: string;
}

export interface Photo {
  id: string; // UUID
  vehicle_id: string; // UUID references Vehicle
  related_type: 'vehicle' | 'maintenance' | 'modification' | 'expense' | string;
  related_id: string | null; // UUID of related record
  storage_path: string;
  caption: string | null;
  created_at: string;
}

export interface Import {
  id: string; // UUID
  user_id: string; // UUID references Profile
  file_name: string;
  status: 'pending' | 'processed' | 'failed' | string;
  record_type: 'maintenance' | 'modification' | 'expense' | string;
  mapping: Record<string, unknown> | null;
  created_at: string;
}
