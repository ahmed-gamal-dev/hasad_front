'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { reportService } from '@/services/reports/reportService';
import { ServiceReport } from '@/types/report';

type ServiceReportDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const formatDate = (dateValue?: string) => {
  if (!dateValue) {
    return 'N/A';
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleString();
};

const statusText = (status?: string) => {
  if (!status) {
    return '-';
  }
  return status.replaceAll('_', ' ');
};

export default function ServiceReportDetailsPage({
  params,
}: ServiceReportDetailsPageProps) {
  const [report, setReport] = useState<ServiceReport | null>(null);
  const [reportId, setReportId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      const id = Number(resolvedParams.id);

      if (Number.isNaN(id)) {
        toast.error('Invalid service report ID');
        router.push('/service-report');
        return;
      }

      setReportId(id);
    };

    unwrapParams();
  }, [params, router]);

  useEffect(() => {
    if (reportId !== null) {
      fetchReport(reportId);
    }
  }, [reportId]);

  const fetchReport = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await reportService.getById(id);
      setReport(data);
    } catch (error) {
      console.error('Error fetching service report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!reportId) {
      toast.error('Invalid service report ID');
      return;
    }

    try {
      setIsDownloadingPdf(true);
      await reportService.downloadPdf(reportId);
    } catch (error) {
      console.error('Error downloading report PDF:', error);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (isLoading || reportId === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Service report not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/service-report')}
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
            Back to Service Reports
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Service Report #{report.id}</h1>
          <p className="text-gray-600 mt-1">{report.client_name || '-'}</p>
        </div>
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-400 disabled:cursor-not-allowed"
        >
          {isDownloadingPdf ? 'Opening...' : 'Open PDF'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Report ID</label>
              <p className="text-gray-900 font-medium">{report.id}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Client</label>
              <p className="text-gray-900 font-medium">{report.client_name || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Assigned User</label>
              <p className="text-gray-900 font-medium">
                {report.assigned_user_name || '-'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Visit ID</label>
              <p className="text-gray-900 font-medium">{report.visit_id ?? '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Status</label>
              <p className="text-gray-900 font-medium capitalize">
                {statusText(report.status)}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Rating</label>
              <p className="text-gray-900 font-medium">{report.rating ?? '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Reported At</label>
              <p className="text-gray-900 font-medium">{formatDate(report.reported_at)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Service Location</label>
              <p className="text-gray-900 font-medium">{report.service_location || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Latitude</label>
              <p className="text-gray-900 font-medium">{report.lat || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Longitude</label>
              <p className="text-gray-900 font-medium">{report.lng || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Company Phone</label>
              <p className="text-gray-900 font-medium">{report.company_phone || '-'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Types</h2>
          {report.service_types && report.service_types.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {report.service_types.map((serviceType, index) => (
                <span
                  key={`${serviceType}-${index}`}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700"
                >
                  {serviceType}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No service types</p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Observations</h2>
          {report.observations && report.observations.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {report.observations.map((observation, index) => (
                <li key={`${observation}-${index}`}>{observation}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No observations</p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{report.description || '-'}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Taken</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{report.actions_taken || '-'}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{report.recommendations || '-'}</p>
        </div>

        {report.rejection_reason && (
          <div className="bg-red-50 rounded-lg border border-red-200 p-6 md:col-span-2">
            <h2 className="text-lg font-semibold text-red-900 mb-4">Rejection Reason</h2>
            <p className="text-red-700 whitespace-pre-wrap">{report.rejection_reason}</p>
          </div>
        )}
      </div>
    </div>
  );
}
