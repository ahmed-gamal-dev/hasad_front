export interface Client {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  company_name?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface ClientsResponse {
  success?: boolean;
  message?: string;
  data?: {
    clients?: Client[];
  } | Client[];
  meta?: {
    pagination?: {
      current_page?: number;
      last_page?: number;
      per_page?: number;
      total?: number;
    };
  };
  clients?: Client[];
  errors?: null | unknown;
}

export interface ClientResponse {
  success?: boolean;
  message?: string;
  data?: {
    client?: Client;
  } | Client;
  client?: Client;
  errors?: null | unknown;
}

export interface CreateClientRequest {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
}

export interface UpdateClientRequest {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
}

export interface GetClientsParams {
  page?: number;
  per_page?: number;
  q?: string;
  sort?: string;
}

export interface PaginatedClientsResponse {
  clients: Client[];
  total: number;
  currentPage: number;
  lastPage: number;
  perPage: number;
}
