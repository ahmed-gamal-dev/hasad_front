import axiosInstance from '../http/axiosInstance'; // Adjust the import path as needed
import {
  Vehicle,
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleLog,
  CreateVehicleLogInput,
  UpdateVehicleLogInput,
  PaginatedResponse,
} from '@/types/Vehicle';

// ==================== Vehicle API ====================

export const vehicleApi = {
  // List all vehicles
  list: async (params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<Vehicle> | Vehicle[]> => {
    const response = await axiosInstance.get('/vehicles', { params });
    return response.data;
  },

  // Get a single vehicle
  get: async (id: number): Promise<Vehicle> => {
    const response = await axiosInstance.get(`/vehicles/${id}`);
    return response.data;
  },

  // Create a new vehicle
  create: async (data: CreateVehicleInput): Promise<Vehicle> => {
    const response = await axiosInstance.post('/vehicles', data);
    return response.data;
  },

  // Update a vehicle
  update: async (id: number, data: UpdateVehicleInput): Promise<Vehicle> => {
    const response = await axiosInstance.put(`/vehicles/${id}`, data);
    return response.data;
  },

  // Delete a vehicle
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/vehicles/${id}`);
  },

  // Export vehicles to CSV
  exportCsv: async (): Promise<Blob> => {
    const response = await axiosInstance.get('/vehicles/export/csv', {
      responseType: 'blob',
    });
    return response.data;
  },
};

// ==================== Vehicle Log API ====================

export const vehicleLogApi = {
  // List all vehicle logs
  list: async (params?: { 
    vehicle_id?: number; 
    page?: number; 
    per_page?: number 
  }): Promise<PaginatedResponse<VehicleLog> | VehicleLog[]> => {
    const response = await axiosInstance.get('/vehicle-logs', { params });
    return response.data;
  },

  // Get a single vehicle log
  get: async (id: number): Promise<VehicleLog> => {
    const response = await axiosInstance.get(`/vehicle-logs/${id}`);
    return response.data;
  },

  // Create a new vehicle log
  create: async (data: CreateVehicleLogInput): Promise<VehicleLog> => {
    const response = await axiosInstance.post('/vehicle-logs', data);
    return response.data;
  },

  // Update a vehicle log
  update: async (id: number, data: UpdateVehicleLogInput): Promise<VehicleLog> => {
    const response = await axiosInstance.put(`/vehicle-logs/${id}`, data);
    return response.data;
  },

  // Delete a vehicle log
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/vehicle-logs/${id}`);
  },

  // Export vehicle logs to CSV
  exportCsv: async (vehicleId?: number): Promise<Blob> => {
    const params = vehicleId ? { vehicle_id: vehicleId } : {};
    const response = await axiosInstance.get('/vehicle-logs/export/csv', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};