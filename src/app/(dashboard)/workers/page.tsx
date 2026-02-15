'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { Column } from '@/components/shared/DataTable';
import { Worker } from '@/types/worker';
import { workerService } from '@/services/workers/workerService';

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const router = useRouter();

  const fetchWorkers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await workerService.getAll({
        page: currentPage,
        per_page: itemsPerPage,
        q: searchTerm || undefined,
      });

      setWorkers(data.workers);
      setTotalPages(data.lastPage);
      setTotalItems(data.total);
    } catch (error) {
      console.error('Error fetching workers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

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

  const handleView = (worker: Worker) => {
    router.push(`/workers/${worker.id}/visits`);
  };

  const columns: Column<Worker>[] = [
    {
      key: 'name',
      label: 'Worker',
      render: (worker) => (
        <div className="text-sm font-medium text-gray-900">{worker.name || '-'}</div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (worker) => (
        <div className="text-sm text-gray-700">{worker.email || '-'}</div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (worker) => (
        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {worker.role || 'worker'}
        </span>
      ),
    },
    {
      key: 'visits',
      label: 'Visits',
      render: (worker) => {
        const visitsCount = typeof worker.visits_count === 'number'
          ? worker.visits_count
          : Array.isArray(worker.visits)
          ? worker.visits.length
          : 0;

        return <div className="text-sm text-gray-700">{visitsCount}</div>;
      },
    },
    {
      key: 'created_at',
      label: 'Created At',
      render: (worker) => {
        if (!worker.created_at) {
          return <span className="text-sm text-gray-400">-</span>;
        }

        const date = new Date(worker.created_at);
        if (Number.isNaN(date.getTime())) {
          return <span className="text-sm text-gray-700">{worker.created_at}</span>;
        }

        return (
          <div className="text-sm text-gray-600">
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Workers</h1>
        <p className="text-gray-600 text-xs mt-1">Workers and their visits</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Search workers by name or email..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <DataTable
        columns={columns}
        data={workers}
        onView={handleView}
        isLoading={isLoading}
        emptyMessage="No workers found"
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
