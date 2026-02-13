export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  role?: string; // Added: API returns role as a string (admin, worker, supervisor, client)
  created_at?: string;
  updated_at?: string;
  roles?: Role[]; // Keep for backward compatibility
  permissions?: Permission[];
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

// API Response structure for paginated users list
export interface UsersResponse {
  success: boolean;
  message: string;
  data: User[]; // Updated: API returns users array directly in data
  meta: {
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
  errors: null | any;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: User; // Single user is directly in data
  errors: null | any;
}

// Request structures based on API documentation
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string; // Role as string like "worker", "admin", "supervisor", "client"
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  role?: string; // Role as string like "worker", "admin", "supervisor", "client"
}

// Pagination types
export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface GetUsersParams {
  page?: number;
  per_page?: number;
  q?: string;
  sort?: string;
}

export interface PaginatedUsersResponse {
  users: User[];
  total: number;
  currentPage: number;
  lastPage: number;
  perPage: number;
}