// Vehicle Types
export interface Vehicle {
  id: number;
  name: string;
  plate_number: string;
  assigned_user_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateVehicleInput {
  name: string;
  plate_number: string;
  assigned_user_id: number;
}

export interface UpdateVehicleInput {
  name?: string;
  plate_number?: string;
  assigned_user_id?: number;
}

// Vehicle Log Types
export interface VehicleLog {
  id: number;
  vehicle_id: number;
  month: string;
  kilometers: number;
  fuel_liters: number;
  maintenance_cost: number;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateVehicleLogInput {
  vehicle_id: number;
  month: string;
  kilometers: number;
  fuel_liters: number;
  maintenance_cost: number;
  notes: string;
}

export interface UpdateVehicleLogInput {
  vehicle_id?: number;
  month?: string;
  kilometers?: number;
  fuel_liters?: number;
  maintenance_cost?: number;
  notes?: string;
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}