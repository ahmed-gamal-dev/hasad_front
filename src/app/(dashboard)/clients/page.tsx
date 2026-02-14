'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { Column } from '@/components/shared/DataTable';
import { confirmDeleteAlert } from '@/components/shared/confirmAlert';
import { Client } from '@/types/client';
import { clientService } from '@/services/clients/clientService';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const data = await clientService.getAll();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (client: Client) => {
    router.push(`/clients/${client.id}`);
  };

  const handleEdit = (client: Client) => {
    router.push(`/clients/${client.id}/edit`);
  };

  const handleDelete = async (client: Client) => {
    const label = client.name || client.company_name || `Client #${client.id}`;
    const isConfirmed = await confirmDeleteAlert({ entityName: label });

    if (!isConfirmed) {
      return;
    }

    try {
      await clientService.delete(client.id);
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      await clientService.exportCsv();
    } catch (error) {
      console.error('Error exporting clients CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    const searchable = [
      client.name,
      client.company_name,
      client.email,
      client.phone,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchable.includes(searchTerm.toLowerCase());
  });

  const columns: Column<Client>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (client) => (
        <div className="text-sm font-medium text-gray-900">
          {client.name || client.company_name || '-'}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (client) => (
        <div className="text-sm text-gray-600">{client.email || '-'}</div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (client) => (
        <div className="text-sm text-gray-600">{client.phone || '-'}</div>
      ),
    },
    {
      key: 'address',
      label: 'Address',
      render: (client) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {client.address || '-'}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 text-xs mt-1">
            View and manage all clients
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="bg-white text-gray-700 border border-gray-400 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={() => router.push('/clients/new')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Client
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredClients}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage="No clients found"
      />
    </div>
  );
}
