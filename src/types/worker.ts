import { Visit } from './visit';

export interface Worker {
  id: number;
  name: string;
  email: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
  visits_count?: number;
  visits?: Visit[];
  [key: string]: unknown;
}

export interface WorkersResponse {
  success: boolean;
  message: string;
  data: Worker[];
  meta?:
    | {
        pagination?: {
          current_page?: number;
          last_page?: number;
          per_page?: number;
          total?: number;
        };
      }
    | null;
  errors?: null | unknown;
}

export interface WorkerResponse {
  success: boolean;
  message: string;
  data: Worker;
  errors?: null | unknown;
}

export interface CreateWorkerRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: string;
}

export interface UpdateWorkerRequest {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  role?: string;
}

export interface GetWorkersParams {
  page?: number;
  per_page?: number;
  q?: string;
  sort?: string;
}

export interface PaginatedWorkersResponse {
  workers: Worker[];
  total: number;
  currentPage: number;
  lastPage: number;
  perPage: number;
}

export interface GetWorkerVisitsParams {
  page?: number;
  per_page?: number;
  q?: string;
  sort?: string;
}

export interface WorkerVisitsResponse {
  success: boolean;
  message: string;
  data: Visit[];
  meta?:
    | {
        pagination?: {
          current_page?: number;
          last_page?: number;
          per_page?: number;
          total?: number;
        };
      }
    | null;
  errors?: null | unknown;
}

export interface PaginatedWorkerVisitsResponse {
  visits: Visit[];
  total: number;
  currentPage: number;
  lastPage: number;
  perPage: number;
}
