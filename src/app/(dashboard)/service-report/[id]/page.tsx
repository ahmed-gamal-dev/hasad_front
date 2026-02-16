'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { promptRejectReasonAlert } from '@/components/shared/promptInputAlert';
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

const normalizedStatus = (status?: string) => (status || '').trim().toLowerCase();

export default function ServiceReportDetailsPage({
  params,
}: ServiceReportDetailsPageProps) {
  const [report, setReport] = useState<ServiceReport | null>(null);
  const [reportId, setReportId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
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

  const handleApprove = async () => {
    if (!report?.id) {
      return;
    }

    try {
      setIsApproving(true);
      const approvedReport = await reportService.approve(report.id);

      if (approvedReport && typeof approvedReport === 'object' && 'id' in approvedReport) {
        setReport(approvedReport);
      } else {
        await fetchReport(report.id);
      }
    } catch (error) {
      console.error('Error approving service report:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!report?.id) {
      return;
    }

    try {
      setIsSubmitting(true);
      const submittedReport = await reportService.submit(report.id);

      if (submittedReport && typeof submittedReport === 'object' && 'id' in submittedReport) {
        setReport(submittedReport);
      } else {
        await fetchReport(report.id);
      }
    } catch (error) {
      console.error('Error submitting service report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!report?.id) {
      return;
    }

    const reason = await promptRejectReasonAlert();
    if (!reason) {
      return;
    }

    try {
      setIsRejecting(true);
      const rejectedReport = await reportService.reject(report.id, reason);

      if (rejectedReport && typeof rejectedReport === 'object' && 'id' in rejectedReport) {
        setReport(rejectedReport);
      } else {
        await fetchReport(report.id);
      }
    } catch (error) {
      console.error('Error rejecting service report:', error);
    } finally {
      setIsRejecting(false);
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

  const isApproved = normalizedStatus(report.status) === 'approved';
  const isRejected = normalizedStatus(report.status) === 'rejected';
  const isSubmitted = normalizedStatus(report.status) === 'submitted';

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
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmitReport}
            disabled={isSubmitted || isSubmitting || isApproving || isRejecting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
          <button
            onClick={handleApprove}
            disabled={isApproved || isSubmitting || isApproving || isRejecting}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {isApproving ? 'Approving...' : 'Approve Report'}
          </button>
          <button
            onClick={handleReject}
            disabled={isRejected || isSubmitting || isRejecting || isApproving}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            {isRejecting ? 'Rejecting...' : 'Reject Report'}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-400 disabled:cursor-not-allowed"
          >
            {isDownloadingPdf ? 'Opening...' : 'Open PDF'}
          </button>
        </div>
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
