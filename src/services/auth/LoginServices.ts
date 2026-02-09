import { AxiosError } from "axios";
import { toast } from "react-toastify";
import axiosInstance from "../http/axiosInstance";
import loginEndpoint from "./LoginEndpoint";

export type LoginRequest = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export type LoginResponse = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
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

export const loginService = async (payload: LoginRequest) => {
  try {
    const response = await axiosInstance.post<LoginResponse>(
      loginEndpoint,
      payload
    );
    toast.success("Logged in successfully");
    return response.data;
  } catch (error) {
    toast.error(getErrorMessage(error));
    throw error;
  }
};
