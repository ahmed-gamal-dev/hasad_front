import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import axiosInstance from '../http/axiosInstance';
import reportEndpoints from './reportEndpoints';
import {
  CreateReportRequest,
  ServiceReport,
  ServiceReportResponse,
  ServiceReportsResponse,
} from '@/types/report';

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

export const reportService = {
  async create(data: CreateReportRequest): Promise<ServiceReport> {
    try {
      const formData = new FormData();

      const appendValue = (
        key: string,
        value: string | number | null | undefined,
        includeEmpty = false
      ) => {
        if (value === null || value === undefined || value === '') {
          if (includeEmpty) {
            formData.append(key, '');
          }
          return;
        }

        formData.append(key, String(value));
      };

      const appendArray = (key: string, values: string[] | undefined, includeEmpty = false) => {
        if (!Array.isArray(values) || values.length === 0) {
          if (includeEmpty) {
            formData.append(`${key}[]`, '');
          }
          return;
        }

        values.forEach((item) => {
          formData.append(`${key}[]`, item ?? '');
        });
      };

      const appendImages = (images: Array<File | Blob | string> | undefined) => {
        if (!Array.isArray(images) || images.length === 0) {
          formData.append('images[]', '');
          return;
        }

        images.forEach((image) => {
          if (image instanceof File) {
            formData.append('images[]', image, image.name);
            return;
          }

          if (image instanceof Blob) {
            formData.append('images[]', image);
            return;
          }

          formData.append('images[]', image ?? '');
        });
      };

      appendValue('client_id', data.client_id);
      appendValue('visit_id', data.visit_id, true);
      appendValue('assigned_user_id', data.assigned_user_id, true);
      appendValue('reported_at', data.reported_at);
      appendValue('service_location', data.service_location);
      appendValue('lat', data.lat, true);
      appendValue('lng', data.lng, true);
      appendArray('service_types', data.service_types, true);
      appendArray('observations', data.observations, true);
      appendValue('description', data.description, true);
      appendValue('actions_taken', data.actions_taken, true);
      appendValue('recommendations', data.recommendations, true);
      appendValue('rating', data.rating, true);
      appendValue('company_phone', data.company_phone, true);
      appendValue('company_signature', data.company_signature, true);
      appendValue('worker_signature', data.worker_signature, true);
      appendImages(data.images);

      const response = await axiosInstance.post<ServiceReportResponse>(
        reportEndpoints.create,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data?.message) {
        toast.success(response.data.message);
      } else {
        toast.success('Report created successfully');
      }

      if (
        response.data.data &&
        typeof response.data.data === 'object' &&
        'id' in response.data.data
      ) {
        return response.data.data as ServiceReport;
      }

      if (response.data.data && 'report' in response.data.data) {
        return response.data.data.report as ServiceReport;
      }

      return {} as ServiceReport;
    } catch (error) {
      console.error('Error creating service report:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  async getAll(): Promise<ServiceReport[]> {
    try {
      const response = await axiosInstance.get<ServiceReportsResponse>(
        reportEndpoints.list
      );

      if (Array.isArray(response.data.data)) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error('Error fetching service reports:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  async getPendingApproval(): Promise<ServiceReport[]> {
    try {
      const response = await axiosInstance.get<ServiceReportsResponse>(
        reportEndpoints.pendingApproval
      );

      if (Array.isArray(response.data.data)) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error('Error fetching pending approval reports:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  async getById(id: number): Promise<ServiceReport> {
    try {
      const response = await axiosInstance.get<ServiceReportResponse>(
        reportEndpoints.detail(id)
      );

      if (
        response.data.data &&
        typeof response.data.data === 'object' &&
        'id' in response.data.data
      ) {
        return response.data.data as ServiceReport;
      }

      if (response.data.data && 'report' in response.data.data) {
        return response.data.data.report as ServiceReport;
      }

      throw new Error('Service report not found in response');
    } catch (error) {
      console.error('Error fetching service report:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  async approve(id: number): Promise<ServiceReport> {
    try {
      const response = await axiosInstance.post<ServiceReportResponse>(
        reportEndpoints.approve(id)
      );

      if (response.data?.message) {
        toast.success(response.data.message);
      } else {
        toast.success('Report approved successfully');
      }

      if (
        response.data.data &&
        typeof response.data.data === 'object' &&
        'id' in response.data.data
      ) {
        return response.data.data as ServiceReport;
      }

      if (response.data.data && 'report' in response.data.data) {
        return response.data.data.report as ServiceReport;
      }

      return {} as ServiceReport;
    } catch (error) {
      console.error('Error approving service report:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  async submit(id: number): Promise<ServiceReport> {
    try {
      const response = await axiosInstance.post<ServiceReportResponse>(
        reportEndpoints.submit(id)
      );

      if (response.data?.message) {
        toast.success(response.data.message);
      } else {
        toast.success('Report submitted successfully');
      }

      if (
        response.data.data &&
        typeof response.data.data === 'object' &&
        'id' in response.data.data
      ) {
        return response.data.data as ServiceReport;
      }

      if (response.data.data && 'report' in response.data.data) {
        return response.data.data.report as ServiceReport;
      }

      return {} as ServiceReport;
    } catch (error) {
      console.error('Error submitting service report:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  async reject(id: number, reason: string): Promise<ServiceReport> {
    try {
      const response = await axiosInstance.post<ServiceReportResponse>(
        reportEndpoints.reject(id),
        { reason }
      );

      if (response.data?.message) {
        toast.success(response.data.message);
      } else {
        toast.success('Report rejected successfully');
      }

      if (
        response.data.data &&
        typeof response.data.data === 'object' &&
        'id' in response.data.data
      ) {
        return response.data.data as ServiceReport;
      }

      if (response.data.data && 'report' in response.data.data) {
        return response.data.data.report as ServiceReport;
      }

      return {} as ServiceReport;
    } catch (error) {
      console.error('Error rejecting service report:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  async downloadPdf(id: number): Promise<void> {
    try {
      const openedTab = window.open('', '_blank');

      const response = await axiosInstance.get(reportEndpoints.downloadPdf(id), {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      if (openedTab) {
        openedTab.location.href = url;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60_000);

      toast.success('Report PDF opened in a new tab');
    } catch (error) {
      console.error('Error opening report PDF:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },
};
