'use client';

import { useCallback, useEffect, useState } from 'react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const router = useRouter();

  const fetchClients = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await clientService.getAllPaginated({
        page: currentPage,
        per_page: itemsPerPage,
        q: searchTerm || undefined,
      });
      setClients(data.clients);
      setTotalPages(data.lastPage);
      setTotalItems(data.total);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

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
      if (clients.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchClients();
      }
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

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
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={clients}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage="No clients found"
        showPagination={true}
        pagination={{
          currentPage,
          totalPages,
          itemsPerPage,
          totalItems,
          onPageChange: handlePageChange,
          onItemsPerPageChange: handleItemsPerPageChange,
          itemsPerPageOptions: [10, 15, 25, 50, 100],
          showItemsPerPage: true,
        }}
      />
    </div>
  );
}
