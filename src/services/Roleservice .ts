import { AxiosError } from "axios";
import { toast } from "react-toastify";
import axiosInstance from "./http/axiosInstance";

const getErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
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

export interface Role {
  id: number;
  name: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RolesResponse {
  success: boolean;
  data: Role[];
  message?: string;
  errors?: any;
}

export const roleService = {
  // Get all roles
  async getAll(): Promise<Role[]> {
    try {
      const response = await axiosInstance.get<RolesResponse>('/roles');
      
      console.log('Roles API Response:', response.data);
      
      // Based on API response structure
      return response.data.data?.roles || [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },
};