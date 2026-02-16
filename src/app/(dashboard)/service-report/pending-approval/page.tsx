'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { Column } from '@/components/shared/DataTable';
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

export default function PendingApprovalReportsPage() {
  const [reports, setReports] = useState<ServiceReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvingReportId, setApprovingReportId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const data = await reportService.getPendingApproval();
      setReports(data);
    } catch (error) {
      console.error('Error fetching pending approval reports:', error);
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
      firstValue(report, ['reported_at'], ''),
    ]
      .join(' ')
      .toLowerCase();

    return searchable.includes(searchTerm.toLowerCase());
  });

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
      key: 'status',
      label: 'Status',
      render: (report) => (
        <div className="text-sm text-amber-700 capitalize">
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
      key: 'approve',
      label: 'Approve',
      render: (report) => {
        const reportId = Number(report.id);
        const isApproving = approvingReportId === reportId;

        return (
          <button
            type="button"
            onClick={async () => {
              if (Number.isNaN(reportId)) {
                return;
              }

              try {
                setApprovingReportId(reportId);
                await reportService.approve(reportId);
                await fetchReports();
              } catch (error) {
                console.error('Error approving pending report:', error);
              } finally {
                setApprovingReportId(null);
              }
            }}
            disabled={isApproving}
            className="px-3 py-1.5 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isApproving ? 'Approving...' : 'Approve'}
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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Approval Queue</h1>
          <p className="text-gray-600 text-xs mt-1">
            Reports waiting for supervisor approval
          </p>
        </div>
        <button
          onClick={() => router.push('/service-report')}
          className="bg-white text-primary-700 border border-primary-300 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
        >
          View All Reports
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search pending reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredReports}
        onView={handleView}
        isLoading={isLoading}
        emptyMessage="No reports are pending approval"
      />
    </div>
  );
}
