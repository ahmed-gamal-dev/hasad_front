import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import axiosInstance from '../http/axiosInstance';
import clientEndpoints from './clientEndpoints';
import {
  Client,
  ClientsResponse,
  ClientResponse,
  CreateClientRequest,
  UpdateClientRequest,
  GetClientsParams,
  PaginatedClientsResponse,
} from '@/types/client';

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

export const clientService = {
  async getAll(): Promise<Client[]> {
    const response = await clientService.getAllPaginated();
    return response.clients;
  },

  async getAllPaginated(params?: GetClientsParams): Promise<PaginatedClientsResponse> {
    try {
      const response = await axiosInstance.get<ClientsResponse>(
        clientEndpoints.list,
        { params }
      );

      const pagination = response.data.meta?.pagination || {};
      let clients: Client[] = [];
      const responseData = response.data.data;

      if (responseData && !Array.isArray(responseData) && Array.isArray(responseData.clients)) {
        clients = responseData.clients;
      } else if (Array.isArray(response.data.clients)) {
        clients = response.data.clients;
      } else if (Array.isArray(responseData)) {
        clients = responseData as unknown as Client[];
      }

      const fallbackTotal = clients.length;
      const perPage = pagination.per_page || params?.per_page || fallbackTotal || 15;

      return {
        clients,
        total: pagination.total || fallbackTotal,
        currentPage: pagination.current_page || params?.page || 1,
        lastPage:
          pagination.last_page ||
          (fallbackTotal > 0 ? Math.ceil((pagination.total || fallbackTotal) / perPage) : 1),
        perPage,
      };
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  async create(data: CreateClientRequest): Promise<Client> {
    try {
      const response = await axiosInstance.post<ClientResponse>(
        clientEndpoints.create,
        data
      );

      if (response.data?.message) {
        toast.success(response.data.message);
      } else {
        toast.success('Client created successfully');
      }

      if (response.data.data && 'client' in response.data.data) {
        return response.data.data.client as Client;
      }

      if (response.data.data && !('client' in response.data.data)) {
        return response.data.data as Client;
      }

      if (response.data.client) {
        return response.data.client;
      }

      return {} as Client;
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  async getById(id: number): Promise<Client> {
    try {
      const response = await axiosInstance.get<ClientResponse>(
        clientEndpoints.detail(id)
      );

      if (response.data.data && 'client' in response.data.data) {
        return response.data.data.client as Client;
      }

      if (response.data.data && !('client' in response.data.data)) {
        return response.data.data as Client;
      }

      if (response.data.client) {
        return response.data.client;
      }

      throw new Error('Client not found in response');
    } catch (error) {
      console.error('Error fetching client:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  async update(id: number, data: UpdateClientRequest): Promise<Client> {
    try {
      const response = await axiosInstance.put<ClientResponse>(
        clientEndpoints.update(id),
        data
      );

      if (response.data?.message) {
        toast.success(response.data.message);
      } else {
        toast.success('Client updated successfully');
      }

      if (response.data.data && 'client' in response.data.data) {
        return response.data.data.client as Client;
      }

      if (response.data.data && !('client' in response.data.data)) {
        return response.data.data as Client;
      }

      if (response.data.client) {
        return response.data.client;
      }

      throw new Error('Client not found in response');
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      const response = await axiosInstance.delete(clientEndpoints.delete(id));

      if (response.data?.message) {
        toast.success(response.data.message);
      } else {
        toast.success('Client deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  async exportCsv(): Promise<void> {
    try {
      const response = await axiosInstance.get(clientEndpoints.exportCsv, {
        responseType: 'blob',
      });

      const contentDisposition = response.headers['content-disposition'];
      let filename = 'clients.csv';

      if (typeof contentDisposition === 'string') {
        const match =
          contentDisposition.match(/filename\*=UTF-8''([^;]+)/i) ??
          contentDisposition.match(/filename="?([^"]+)"?/i);

        const extractedName = match?.[1];
        if (extractedName) {
          filename = decodeURIComponent(extractedName);
        }
      }

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Clients CSV exported successfully');
    } catch (error) {
      console.error('Error exporting clients CSV:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  },
};
