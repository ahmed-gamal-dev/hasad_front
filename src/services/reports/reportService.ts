import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import axiosInstance from '../http/axiosInstance';
import reportEndpoints from './reportEndpoints';
import {
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
