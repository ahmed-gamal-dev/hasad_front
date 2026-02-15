import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import axiosInstance from '../http/axiosInstance';
import workerEndpoints from './workerEndpoints';
import {
  Worker,
  WorkersResponse,
  WorkerResponse,
  CreateWorkerRequest,
  UpdateWorkerRequest,
  GetWorkersParams,
  PaginatedWorkersResponse,
  GetWorkerVisitsParams,
  WorkerVisitsResponse,
  PaginatedWorkerVisitsResponse,
} from '@/types/worker';
import { Visit } from '@/types/visit';

const getErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    if (error.response?.status === 422) {
      const validationErrors = error.response?.data?.errors;
      if (validationErrors) {
        const errorMessages = Object.values(validationErrors).flat();
        return errorMessages.join(', ') || 'Validation failed';
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

  return 'Something went wrong';
};

export const workerService = {
  async getAll(params?: GetWorkersParams): Promise<PaginatedWorkersResponse> {
    try {
      const response = await axiosInstance.get<WorkersResponse>(
        workerEndpoints.list,
        { params }
      );

      const workers = Array.isArray(response.data.data) ? response.data.data : [];
      const pagination = response.data.meta?.pagination || {};
      const hasServerPagination =
        typeof pagination.total === 'number' &&
        typeof pagination.current_page === 'number' &&
        typeof pagination.last_page === 'number' &&
        typeof pagination.per_page === 'number';

      if (hasServerPagination) {
        return {
          workers,
          total: pagination.total || workers.length,
          currentPage: pagination.current_page || params?.page || 1,
          lastPage: pagination.last_page || 1,
          perPage: pagination.per_page || params?.per_page || 15,
        };
      }

      const query = params?.q?.trim().toLowerCase() || '';
      const filteredWorkers = query
        ? workers.filter((worker) =>
            `${worker.name || ''} ${worker.email || ''}`.toLowerCase().includes(query)
          )
        : workers;

      const perPage = params?.per_page || 15;
      const requestedPage = params?.page || 1;
      const total = filteredWorkers.length;
      const lastPage = Math.max(1, Math.ceil(total / perPage));
      const currentPage = Math.min(Math.max(1, requestedPage), lastPage);
      const startIndex = (currentPage - 1) * perPage;
      const pagedWorkers = filteredWorkers.slice(startIndex, startIndex + perPage);

      return {
        workers: pagedWorkers,
        total,
        currentPage,
        lastPage,
        perPage,
      };
    } catch (error) {
      console.error('Error fetching workers:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  async getById(id: number): Promise<Worker> {
    try {
      const response = await axiosInstance.get<WorkerResponse>(
        workerEndpoints.detail(id)
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching worker:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  async create(data: CreateWorkerRequest): Promise<Worker> {
    try {
      const requestData = {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        role: data.role || 'worker',
      };

      const response = await axiosInstance.post<WorkerResponse>(
        workerEndpoints.create,
        requestData
      );

      toast.success(response.data.message || 'Worker created successfully');
      return response.data.data;
    } catch (error) {
      console.error('Error creating worker:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  async update(id: number, data: UpdateWorkerRequest): Promise<Worker> {
    try {
      const requestData: UpdateWorkerRequest = {
        name: data.name,
        email: data.email,
        role: data.role || 'worker',
      };

      if (data.password) {
        requestData.password = data.password;
        requestData.password_confirmation = data.password_confirmation;
      }

      const response = await axiosInstance.put<WorkerResponse>(
        workerEndpoints.update(id),
        requestData
      );

      toast.success(response.data.message || 'Worker updated successfully');
      return response.data.data;
    } catch (error) {
      console.error('Error updating worker:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      const response = await axiosInstance.delete(workerEndpoints.delete(id));
      toast.success(response.data?.message || 'Worker deleted successfully');
    } catch (error) {
      console.error('Error deleting worker:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  async getVisits(
    workerId: number,
    params?: GetWorkerVisitsParams
  ): Promise<PaginatedWorkerVisitsResponse> {
    try {
      const response = await axiosInstance.get<WorkerVisitsResponse>(
        workerEndpoints.visits(workerId),
        { params }
      );

      const visits = Array.isArray(response.data.data) ? response.data.data : [];
      const pagination = response.data.meta?.pagination || {};
      const hasServerPagination =
        typeof pagination.total === 'number' &&
        typeof pagination.current_page === 'number' &&
        typeof pagination.last_page === 'number' &&
        typeof pagination.per_page === 'number';

      if (hasServerPagination) {
        return {
          visits,
          total: pagination.total || visits.length,
          currentPage: pagination.current_page || params?.page || 1,
          lastPage: pagination.last_page || 1,
          perPage: pagination.per_page || params?.per_page || 15,
        };
      }

      const query = params?.q?.trim().toLowerCase() || '';
      const filteredVisits = query
        ? visits.filter((visit: Visit) =>
            `${visit.service || ''} ${visit.status || ''} ${visit.client_name || ''}`.toLowerCase().includes(query)
          )
        : visits;

      const perPage = params?.per_page || 15;
      const requestedPage = params?.page || 1;
      const total = filteredVisits.length;
      const lastPage = Math.max(1, Math.ceil(total / perPage));
      const currentPage = Math.min(Math.max(1, requestedPage), lastPage);
      const startIndex = (currentPage - 1) * perPage;
      const pagedVisits = filteredVisits.slice(startIndex, startIndex + perPage);

      return {
        visits: pagedVisits,
        total,
        currentPage,
        lastPage,
        perPage,
      };
    } catch (error) {
      console.error('Error fetching worker visits:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },
};
