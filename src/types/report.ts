export interface ServiceReport {
  id: number;
  client_id?: number;
  client_name?: string;
  visit_id?: number;
  assigned_user_id?: number;
  assigned_user_name?: string;
  reported_at?: string;
  service_location?: string;
  lat?: string;
  lng?: string;
  service_types?: string[];
  observations?: string[];
  description?: string;
  actions_taken?: string;
  recommendations?: string;
  rating?: number;
  company_phone?: string;
  company_signature_path?: string | null;
  worker_signature_path?: string | null;
  status?: string;
  rejection_reason?: string | null;
  images?: unknown[];
  [key: string]: unknown;
}

export interface CreateReportRequest {
  client_id: number;
  visit_id?: number | '' | null;
  assigned_user_id?: number | '' | null;
  reported_at: string;
  service_location: string;
  lat?: number | '' | null;
  lng?: number | '' | null;
  service_types: string[];
  observations: string[];
  description: string;
  actions_taken: string;
  recommendations?: string | null;
  rating?: number | '' | null;
  company_phone?: string | null;
  company_signature?: string | null;
  worker_signature?: string | null;
  images?: Array<File | Blob | string>;
}

export interface ReportsPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ServiceReportsResponse {
  success?: boolean;
  data?: ServiceReport[];
  meta?: {
    pagination?: ReportsPagination;
  };
  message?: string;
  errors?: null | unknown;
}

export interface ServiceReportResponse {
  success?: boolean;
  data?: ServiceReport | { report?: ServiceReport };
  meta?: null | unknown;
  message?: string;
  errors?: null | unknown;
}
