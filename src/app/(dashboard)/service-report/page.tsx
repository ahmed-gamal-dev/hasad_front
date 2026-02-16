'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { Column } from '@/components/shared/DataTable';
import { promptRejectReasonAlert } from '@/components/shared/promptInputAlert';
import { reportService } from '@/services/reports/reportService';
import { ServiceReport } from '@/types/report';

const firstValue = (
  report: ServiceReport,
  keys: string[],
  fallback = '-'
): string => {
  for (const key of keys) {
    const value = report[key];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value);
    }
  }
  return fallback;
};

const formatReportedAt = (reportedAt?: string): string => {
  if (!reportedAt) {
    return '-';
  }

  const date = new Date(reportedAt);
  if (Number.isNaN(date.getTime())) {
    return reportedAt;
  }

  return date.toLocaleString();
};

const normalizedStatus = (status?: string) => (status || '').trim().toLowerCase();

export default function ServiceReportPage() {
  const [reports, setReports] = useState<ServiceReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submittingReportId, setSubmittingReportId] = useState<number | null>(null);
  const [approvingReportId, setApprovingReportId] = useState<number | null>(null);
  const [rejectingReportId, setRejectingReportId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const router = useRouter();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const data = await reportService.getAll();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const searchable = [
      firstValue(report, ['id'], ''),
      firstValue(report, ['client_name'], ''),
      firstValue(report, ['assigned_user_name'], ''),
      firstValue(report, ['service_location'], ''),
      firstValue(report, ['status'], ''),
      firstValue(report, ['company_phone'], ''),
      firstValue(report, ['reported_at'], ''),
    ]
      .join(' ')
      .toLowerCase();

    return searchable.includes(searchTerm.toLowerCase());
  });

  const totalItems = filteredReports.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedReports = filteredReports.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

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

  const columns: Column<ServiceReport>[] = [
    {
      key: 'id',
      label: 'ID',
      render: (report) => (
        <div className="text-sm font-medium text-gray-900">
          {firstValue(report, ['id'])}
        </div>
      ),
    },
    {
      key: 'client_name',
      label: 'Client',
      render: (report) => (
        <div className="text-sm text-gray-600">
          {firstValue(report, ['client_name'])}
        </div>
      ),
    },
    {
      key: 'assigned_user_name',
      label: 'Assigned User',
      render: (report) => (
        <div className="text-sm text-gray-600">
          {firstValue(report, ['assigned_user_name'])}
        </div>
      ),
    },
    {
      key: 'service_location',
      label: 'Location',
      render: (report) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {firstValue(report, ['service_location'])}
        </div>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (report) => (
        <div className="text-sm text-gray-600">{firstValue(report, ['rating'])}</div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (report) => (
        <div className="text-sm text-gray-600 capitalize">
          {firstValue(report, ['status']).replaceAll('_', ' ')}
        </div>
      ),
    },
    {
      key: 'reported_at',
      label: 'Reported At',
      render: (report) => (
        <div className="text-sm text-gray-600">
          {formatReportedAt(
            typeof report.reported_at === 'string' ? report.reported_at : undefined
          )}
        </div>
      ),
    },
    {
      key: 'submit',
      label: 'Submit',
      render: (report) => {
        const reportId = Number(report.id);
        const isSubmitted = normalizedStatus(
          typeof report.status === 'string' ? report.status : undefined
        ) === 'submitted';
        const isSubmitting = submittingReportId === reportId;
        const isApproving = approvingReportId === reportId;
        const isRejecting = rejectingReportId === reportId;

        return (
          <button
            type="button"
            disabled={isSubmitted || isSubmitting || isApproving || isRejecting}
            onClick={async () => {
              if (Number.isNaN(reportId)) {
                return;
              }

              try {
                setSubmittingReportId(reportId);
                await reportService.submit(reportId);
                await fetchReports();
              } catch (error) {
                console.error('Error submitting report from table:', error);
              } finally {
                setSubmittingReportId(null);
              }
            }}
            className="bg-primary-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        );
      },
    },
    {
      key: 'Approved',
      label: 'Approve',
      render: (report) => {
        const reportId = Number(report.id);
        const isSubmitting = submittingReportId === reportId;
        const isApproving = approvingReportId === reportId;
        const isRejecting = rejectingReportId === reportId;
        const isApproved =
          normalizedStatus(typeof report.status === 'string' ? report.status : undefined) ===
          'approved';

        return (
          <button
            type="button"
            disabled={isApproved || isSubmitting || isApproving || isRejecting}
            onClick={async () => {
              if (Number.isNaN(reportId)) {
                return;
              }

              try {
                setApprovingReportId(reportId);
                await reportService.approve(reportId);
                await fetchReports();
              } catch (error) {
                console.error('Error approving report from table:', error);
              } finally {
                setApprovingReportId(null);
              }
            }}
            className="px-3 py-1.5 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isApproving ? 'Approving...' : 'Approve'}
          </button>
        );
      },
    },
    {
      key: 'reject',
      label: 'Reject',
      render: (report) => {
        const reportId = Number(report.id);
        const isSubmitting = submittingReportId === reportId;
        const isApproving = approvingReportId === reportId;
        const isRejecting = rejectingReportId === reportId;
        const isRejected =
          normalizedStatus(typeof report.status === 'string' ? report.status : undefined) ===
          'rejected';

        return (
          <button
            type="button"
            disabled={isRejected || isSubmitting || isApproving || isRejecting}
            onClick={async () => {
              if (Number.isNaN(reportId)) {
                return;
              }

              const reason = await promptRejectReasonAlert();
              if (!reason) {
                return;
              }

              try {
                setRejectingReportId(reportId);
                await reportService.reject(reportId, reason);
                await fetchReports();
              } catch (error) {
                console.error('Error rejecting report from table:', error);
              } finally {
                setRejectingReportId(null);
              }
            }}
            className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isRejecting ? 'Rejecting...' : 'Reject'}
          </button>
        );
      },
    },
  ];

  const handleView = (report: ServiceReport) => {
    router.push(`/service-report/${report.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Reports</h1>
          <p className="text-gray-600 text-xs mt-1">View all service reports</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/service-report/new')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create Report
          </button>
          <button
            onClick={() => router.push('/service-report/pending-approval')}
            className="bg-white text-primary-700 border border-primary-300 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
          >
            Pending Approval Queue
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedReports}
        onView={handleView}
        isLoading={isLoading}
        emptyMessage="No service reports found"
        showPagination={true}
        pagination={{
          currentPage: safeCurrentPage,
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
