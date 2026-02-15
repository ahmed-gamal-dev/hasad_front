'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { Column } from '@/components/shared/DataTable';
import { Visit } from '@/types/visit';
import { visitService } from '@/services/visits/visitService';

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompletingVisitId, setIsCompletingVisitId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const router = useRouter();

  const fetchVisits = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await visitService.getAllPaginated({
        page: currentPage,
        per_page: itemsPerPage,
        q: searchTerm || undefined,
      });
      setVisits(data.visits);
      setTotalPages(data.lastPage);
      setTotalItems(data.total);
    } catch (error) {
      console.error('Error fetching visits:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

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

  const handleCompleteVisit = async (visit: Visit) => {
    if (!visit?.id || visit.status === 'completed') {
      return;
    }

    try {
      setIsCompletingVisitId(visit.id);
      await visitService.complete(visit.id);
      await fetchVisits();
    } catch (error) {
      console.error('Error marking visit completed:', error);
    } finally {
      setIsCompletingVisitId(null);
    }
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
      key: 'assigned_user_id',
      label: 'Assigned User',
      render: (visit) => (
        <div className="text-sm text-gray-700">
          {visit.assigned_user_name || visit.assigned_user?.name || `#${visit.assigned_user_id}`}
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
      key: 'actions',
      label: 'Action',
      render: (visit) => {
        const isCompleted = visit.status === 'completed';
        const isBusy = isCompletingVisitId === visit.id;

        return (
          <button
            type="button"
            onClick={() => handleCompleteVisit(visit)}
            disabled={isCompleted || isBusy}
            className="px-3 py-1.5 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isCompleted ? 'Completed' : isBusy ? 'Completing...' : 'Mark Completed'}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visits</h1>
          <p className="text-gray-600 text-xs mt-1">View and manage all visits</p>
        </div>
        <button
          onClick={() => router.push('/visits/new')}
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
          Add Visit
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Search visits..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <DataTable
        columns={columns}
        data={visits}
        isLoading={isLoading}
        emptyMessage="No visits found"
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
