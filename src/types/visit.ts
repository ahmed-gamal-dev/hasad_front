export interface Visit {
  id: number;
  client_id: number;
  client_name?: string;
  assigned_user_id: number;
  assigned_user_name?: string;
  service: string;
  status: string;
  scheduled_at: string;
  completed_at?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  client?: {
    id: number;
    name?: string;
    company_name?: string;
  };
  assigned_user?: {
    id: number;
    name?: string;
    email?: string;
  };
  [key: string]: unknown;
}

export interface VisitsResponse {
  success?: boolean;
  message?: string;
  data?: Visit[];
  meta?: {
    pagination?: {
      current_page?: number;
      last_page?: number;
      per_page?: number;
      total?: number;
    };
  };
  errors?: null | unknown;
}

export interface VisitResponse {
  success?: boolean;
  message?: string;
  data?: {
    visit?: Visit;
  } | Visit;
  visit?: Visit;
  errors?: null | unknown;
}

export interface CreateVisitRequest {
  client_id: number;
  assigned_user_id: number;
  service: string;
  status: string;
  scheduled_at: string;
  notes?: string;
}

export interface VisitCalendarItem {
  id: string | number;
  title: string;
  start: string;
  end?: string | null;
  allDay?: boolean;
  extendedProps?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface VisitsCalendarResponse {
  success?: boolean;
  message?: string;
  data?: VisitCalendarItem[];
  errors?: null | unknown;
}

export interface GetVisitsCalendarParams {
  from: string | Date;
  to: string | Date;
}

export interface GetVisitsParams {
  page?: number;
  per_page?: number;
  q?: string;
  sort?: string;
}

export interface PaginatedVisitsResponse {
  visits: Visit[];
  total: number;
  currentPage: number;
  lastPage: number;
  perPage: number;
}
