'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Client } from '@/types/client';
import { clientService } from '@/services/clients/clientService';

type ClientDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function ClientDetailsPage({ params }: ClientDetailsPageProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [clientId, setClientId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      const id = Number(resolvedParams.id);

      if (isNaN(id)) {
        toast.error('Invalid client ID');
        router.push('/clients');
        return;
      }

      setClientId(id);
    };

    unwrapParams();
  }, [params, router]);

  useEffect(() => {
    if (clientId !== null) {
      fetchClient(clientId);
    }
  }, [clientId]);

  const fetchClient = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await clientService.getById(id);
      setClient(data);
    } catch (error) {
      console.error('Error fetching client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || clientId === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Client not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/clients')}
            className="text-primary-600 hover:text-primary-700 mb-2 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Clients
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {client.name || client.company_name || `Client #${clientId}`}
          </h1>
          <p className="text-gray-600 mt-1">{client.email || '-'}</p>
        </div>
        <button
          onClick={() => router.push(`/clients/${clientId}/edit`)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Edit Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Client ID</label>
              <p className="text-gray-900 font-medium">{client.id || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <p className="text-gray-900 font-medium">{client.name || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="text-gray-900 font-medium">{client.email || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Phone</label>
              <p className="text-gray-900 font-medium">{client.phone || '-'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Address Information
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Address</label>
              <p className="text-gray-900 font-medium">{client.address || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">City</label>
              <p className="text-gray-900 font-medium">{client.city || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">State</label>
              <p className="text-gray-900 font-medium">{client.state || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Zip Code</label>
              <p className="text-gray-900 font-medium">{client.zip_code || '-'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{client.notes || '-'}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Timestamps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Created At</label>
              <p className="text-gray-900 font-medium">
                {client.created_at
                  ? new Date(client.created_at).toLocaleString()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Updated At</label>
              <p className="text-gray-900 font-medium">
                {client.updated_at
                  ? new Date(client.updated_at).toLocaleString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
