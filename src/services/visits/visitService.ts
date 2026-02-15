import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import axiosInstance from '../http/axiosInstance';
import visitEndpoints from './visitEndpoints';
import {
  Visit,
  VisitsResponse,
  VisitResponse,
  CreateVisitRequest,
  VisitCalendarItem,
  VisitsCalendarResponse,
  GetVisitsCalendarParams,
  GetVisitsParams,
  PaginatedVisitsResponse,
} from '@/types/visit';

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

  return 'Something went wrong';
};

const toApiDate = (value: string | Date) => {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error('Invalid date');
    }
    return value.toISOString().split('T')[0];
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      throw new Error('Date is required');
    }

    // Keep valid YYYY-MM-DD values as-is for date-only API params.
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
      return trimmedValue;
    }

    const parsedDate = new Date(trimmedValue);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format');
    }

    return parsedDate.toISOString().split('T')[0];
  }

  throw new Error('Invalid date value');
};

export const visitService = {
  async getAll(): Promise<Visit[]> {
    const response = await visitService.getAllPaginated();
    return response.visits;
  },

  async getAllPaginated(params?: GetVisitsParams): Promise<PaginatedVisitsResponse> {
    try {
      const response = await axiosInstance.get<VisitsResponse>(visitEndpoints.list, {
        params,
      });

      const visits = Array.isArray(response.data.data) ? response.data.data : [];
      const pagination = response.data.meta?.pagination || {};
      const fallbackTotal = visits.length;
      const perPage = pagination.per_page || params?.per_page || fallbackTotal || 15;

      return {
        visits,
        total: pagination.total || fallbackTotal,
        currentPage: pagination.current_page || params?.page || 1,
        lastPage:
          pagination.last_page ||
          (fallbackTotal > 0 ? Math.ceil((pagination.total || fallbackTotal) / perPage) : 1),
        perPage,
      };
    } catch (error) {
      console.error('Error fetching visits:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  async create(data: CreateVisitRequest): Promise<Visit> {
    try {
      const response = await axiosInstance.post<VisitResponse>(
        visitEndpoints.create,
        data
      );

      if (response.data?.message) {
        toast.success(response.data.message);
      } else {
        toast.success('Visit created successfully');
      }

      if (response.data.data && !Array.isArray(response.data.data) && 'visit' in response.data.data) {
        return response.data.data.visit as Visit;
      }

      if (response.data.data && !Array.isArray(response.data.data) && !('visit' in response.data.data)) {
        return response.data.data as Visit;
      }

      if (response.data.visit) {
        return response.data.visit;
      }

      return {} as Visit;
    } catch (error) {
      console.error('Error creating visit:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  async getCalendar(params: GetVisitsCalendarParams): Promise<VisitCalendarItem[]> {
    try {
      const from = toApiDate(params.from);
      const to = toApiDate(params.to);

      const response = await axiosInstance.get<VisitsCalendarResponse>(
        visitEndpoints.calendar,
        {
          params: {
            from,
            to,
          },
        }
      );

      if (Array.isArray(response.data.data)) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error('Error fetching visits calendar:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  async complete(id: number): Promise<Visit> {
    try {
      const response = await axiosInstance.post<VisitResponse>(
        visitEndpoints.complete(id)
      );

      if (response.data?.message) {
        toast.success(response.data.message);
      } else {
        toast.success('Visit marked as completed');
      }

      if (response.data.data && !Array.isArray(response.data.data) && 'visit' in response.data.data) {
        return response.data.data.visit as Visit;
      }

      if (response.data.data && !Array.isArray(response.data.data) && !('visit' in response.data.data)) {
        return response.data.data as Visit;
      }

      if (response.data.visit) {
        return response.data.visit;
      }

      return {} as Visit;
    } catch (error) {
      console.error('Error completing visit:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },
};
