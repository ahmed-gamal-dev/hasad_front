import { AxiosError } from "axios";
import { toast } from "react-toastify";
import axiosInstance from "../http/axiosInstance";
import loginEndpoint from "./LoginEndpoint";

// Update the types to match the API response from the image
export type LoginRequest = {
  email: string;
  password: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  roles: Array<{
    id: number;
    name: string;
    guard_name: string;
  }>;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
};

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

export const loginService = async (payload: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post<LoginResponse>(
      loginEndpoint,
      payload
    );
    console.log(response);
    
    toast.success("Logged in successfully");
    return response.data;
  } catch (error) {
    toast.error(getErrorMessage(error));
    throw error;
  }
};