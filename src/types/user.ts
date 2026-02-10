export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  roles?: Role[];
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

// API Response structure based on the documentation
export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];  // Users are nested inside data.users
  };
  errors: null | any;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: User;  // Single user is directly in data
  errors: null | any;
}

// Request structures based on API documentation
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;  // Changed from role_ids to role (string like "Worker", "Admin", "Technician")
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  role?: string;  // Changed from role_ids to role (string like "Worker", "Admin", "Technician")
}