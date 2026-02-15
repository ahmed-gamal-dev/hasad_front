'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DataTable, { Column } from '@/components/shared/DataTable';
import { Visit } from '@/types/visit';
import { workerService } from '@/services/workers/workerService';

export default function WorkerVisitsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const workerId = useMemo(() => Number(params?.id), [params?.id]);

  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchWorkerVisits = useCallback(async () => {
    if (Number.isNaN(workerId) || workerId <= 0) {
      setVisits([]);
      setTotalPages(1);
      setTotalItems(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await workerService.getVisits(workerId, {
        page: currentPage,
        per_page: itemsPerPage,
        q: searchTerm || undefined,
      });

      setVisits(data.visits);
      setTotalPages(data.lastPage);
      setTotalItems(data.total);
    } catch (error) {
      console.error('Error fetching worker visits:', error);
    } finally {
      setIsLoading(false);
    }
  }, [workerId, currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    fetchWorkerVisits();
  }, [fetchWorkerVisits]);

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

  const formatScheduledAt = (value?: string) => {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  const columns: Column<Visit>[] = [
    {
      key: 'client_id',
      label: 'Client',
      render: (visit) => (
        <div className="text-sm text-gray-700">
          {visit.client_name || visit.client?.name || visit.client?.company_name || `#${visit.client_id}`}
        </div>
      ),
    },
    {
      key: 'service',
      label: 'Service',
      render: (visit) => (
        <div className="text-sm font-medium text-gray-900">{visit.service || '-'}</div>
      ),
    },
    {
      key: 'assigned_user_name',
      label: 'Assigned Worker',
      render: (visit) => (
        <div className="text-sm text-gray-700">
          {visit.assigned_user_name || visit.assigned_user?.name || `#${visit.assigned_user_id}`}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (visit) => (
        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
          {visit.status || '-'}
        </span>
      ),
    },
    {
      key: 'scheduled_at',
      label: 'Scheduled At',
      render: (visit) => (
        <div className="text-sm text-gray-600">{formatScheduledAt(visit.scheduled_at)}</div>
      ),
    },
    {
      key: 'completed_at',
      label: 'Completed At',
      render: (visit) => (
        <div className="text-sm text-gray-600">{formatDateTime(visit.completed_at)}</div>
      ),
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (visit) => (
        <div className="text-sm text-gray-700 max-w-xs truncate" title={visit.notes || ''}>
          {visit.notes || '-'}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/workers')}
            className="inline-flex items-center gap-2 text-sm text-primary-700 hover:text-primary-900 mb-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Workers
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Worker Visits</h1>
          <p className="text-gray-600 text-xs mt-1">Worker ID: {Number.isNaN(workerId) ? '-' : workerId}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Search visits by service, status, or client..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <DataTable
        columns={columns}
        data={visits}
        isLoading={isLoading}
        emptyMessage="No visits found for this worker"
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
