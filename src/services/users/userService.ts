import { AxiosError } from "axios";
import { toast } from "react-toastify";
import axiosInstance from "../http/axiosInstance";
import userEndpoints from "./userEndpoints";
import {
  User,
  UsersResponse,
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/types/user";

const getErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    // Check for validation errors (422 response)
    if (error.response?.status === 422) {
      const validationErrors = error.response?.data?.errors;
      if (validationErrors) {
        // Combine all validation errors into a single message
        const errorMessages = Object.values(validationErrors).flat();
        return errorMessages.join(', ') || "Validation failed";
      }
    }
    
    return (
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};

export const userService = {
  // Get all users
  async getAll(): Promise<User[]> {
    try {
      const response = await axiosInstance.get<UsersResponse>(
        userEndpoints.list
      );
      
      console.log('Users API Response:', response.data);
      
      // Based on the API documentation, the response structure is:
      // { success: true, message: "...", data: { users: [...] }, errors: null }
      return response.data.data?.users || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  // Get single user by ID
  async getById(id: number): Promise<User> {
    try {
      const response = await axiosInstance.get<UserResponse>(
        userEndpoints.detail(id)
      );
      
      console.log('User Detail API Response:', response.data);
      
      // Based on the API documentation, the response structure is:
      // { success: true, message: "...", data: { user: {...} }, errors: null }
      return response.data.data.user;
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  // Create new user
  async create(data: CreateUserRequest): Promise<User> {
    try {
      // According to the API documentation, the request body should be:
      // { name, email, password, role }
      const requestData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || "Worker" // Default role if not provided
      };

      const response = await axiosInstance.post<UserResponse>(
        userEndpoints.create,
        requestData
      );
      
      console.log('Create User API Response:', response.data);
      
      // Check for success message in response
      if (response.data.success && response.data.message) {
        toast.success(response.data.message);
      } else {
        toast.success("User created successfully");
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      throw error;
    }
  },

  // Update user
  async update(id: number, data: UpdateUserRequest): Promise<User> {
    try {
      // According to the API documentation, the request body should be:
      // { name, email, password (optional), role }
      const requestData: any = {
        name: data.name,
        email: data.email,
        role: data.role || "Worker"
      };

      // Only include password if it's provided
      if (data.password) {
        requestData.password = data.password;
      }

      const response = await axiosInstance.put<UserResponse>(
        userEndpoints.update(id),
        requestData
      );
      
      console.log('Update User API Response:', response.data);
      
      // Check for success message in response
      if (response.data.success && response.data.message) {
        toast.success(response.data.message);
      } else {
        toast.success("User updated successfully");
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  // Delete user
  async delete(id: number): Promise<void> {
    try {
      const response = await axiosInstance.delete(userEndpoints.delete(id));
      
      // Check for success message in response if available
      if (response.data?.success && response.data?.message) {
        toast.success(response.data.message);
      } else {
        toast.success("User deleted successfully");
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },
};