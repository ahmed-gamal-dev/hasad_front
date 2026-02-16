'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { clientService } from '@/services/clients/clientService';
import { reportService } from '@/services/reports/reportService';
import { visitService } from '@/services/visits/visitService';
import { workerService } from '@/services/workers/workerService';
import { Client } from '@/types/client';
import { Visit } from '@/types/visit';
import { Worker } from '@/types/worker';

type FormDataState = {
  client_id: string;
  visit_id: string;
  assigned_user_id: string;
  reported_at: string;
  service_location: string;
  lat: string;
  lng: string;
  service_types: string;
  observations: string;
  description: string;
  actions_taken: string;
  recommendations: string;
  rating: string;
  company_phone: string;
  company_signature: string;
  worker_signature: string;
  images: File[];
};

const toDateTimeLocal = (value: Date) => {
  const date = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return date.toISOString().slice(0, 16);
};

const splitLines = (value: string) => {
  const lines = value.split('\n').map((item) => item.trim()).filter(Boolean);
  return lines.length > 0 ? lines : [''];
};

export default function NewServiceReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [clients, setClients] = useState<Client[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormDataState>({
    client_id: '',
    visit_id: '',
    assigned_user_id: '',
    reported_at: toDateTimeLocal(new Date()),
    service_location: '',
    lat: '',
    lng: '',
    service_types: '',
    observations: '',
    description: '',
    actions_taken: '',
    recommendations: '',
    rating: '',
    company_phone: '',
    company_signature: '',
    worker_signature: '',
    images: [],
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoadingOptions(true);
        const [clientsData, workersData, visitsData] = await Promise.all([
          clientService.getAll(),
          workerService.getAll({ page: 1, per_page: 100 }),
          visitService.getAllPaginated({ page: 1, per_page: 100 }),
        ]);

        setClients(clientsData);
        setWorkers(workersData.workers);
        setVisits(visitsData.visits);
      } catch (error) {
        console.error('Error fetching report form options:', error);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      client_id: searchParams.get('client_id') ?? prev.client_id,
      visit_id: searchParams.get('visit_id') ?? prev.visit_id,
      assigned_user_id: searchParams.get('assigned_user_id') ?? prev.assigned_user_id,
    }));
  }, [searchParams]);

  const selectedVisit = useMemo(() => {
    const id = Number(formData.visit_id);
    if (Number.isNaN(id)) {
      return null;
    }
    return visits.find((visit) => visit.id === id) ?? null;
  }, [formData.visit_id, visits]);

  useEffect(() => {
    if (!selectedVisit) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      client_id: prev.client_id || String(selectedVisit.client_id),
      assigned_user_id: prev.assigned_user_id || String(selectedVisit.assigned_user_id),
      service_location:
        prev.service_location || selectedVisit.client_name || selectedVisit.client?.company_name || '',
    }));
  }, [selectedVisit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setFormData((prev) => ({ ...prev, images: files }));
  };

  const validate = () => {
    if (!formData.client_id.trim()) {
      toast.error('Client is required');
      return false;
    }

    if (!/^\d+$/.test(formData.client_id.trim())) {
      toast.error('Client must be a valid numeric ID');
      return false;
    }

    if (!formData.reported_at.trim()) {
      toast.error('Reported at is required');
      return false;
    }

    if (!formData.service_location.trim()) {
      toast.error('Service location is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await reportService.create({
        client_id: Number(formData.client_id.trim()),
        visit_id: formData.visit_id.trim() ? Number(formData.visit_id.trim()) : '',
        assigned_user_id: formData.assigned_user_id.trim()
          ? Number(formData.assigned_user_id.trim())
          : '',
        reported_at: new Date(formData.reported_at).toISOString(),
        service_location: formData.service_location.trim(),
        lat: formData.lat.trim() ? Number(formData.lat.trim()) : '',
        lng: formData.lng.trim() ? Number(formData.lng.trim()) : '',
        service_types: splitLines(formData.service_types),
        observations: splitLines(formData.observations),
        description: formData.description,
        actions_taken: formData.actions_taken,
        recommendations: formData.recommendations,
        rating: formData.rating.trim() ? Number(formData.rating.trim()) : '',
        company_phone: formData.company_phone,
        company_signature: formData.company_signature,
        worker_signature: formData.worker_signature,
        images: formData.images,
      });

      router.push('/service-report');
    } catch (error) {
      console.error('Error creating report from UI:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/service-report')}
            className="text-primary-600 hover:text-primary-700 mb-2 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Service Reports
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create Service Report</h1>
          <p className="text-gray-600 mt-1 text-xs">Submit a new report as multipart data</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-2">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                id="client_id"
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                disabled={isLoadingOptions}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{isLoadingOptions ? 'Loading...' : 'Select client'}</option>
                {clients.map((client) => (
                  <option key={client.id} value={String(client.id)}>
                    {client.name || client.company_name || `Client #${client.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="visit_id" className="block text-sm font-medium text-gray-700 mb-2">
                Visit ID
              </label>
              <select
                id="visit_id"
                name="visit_id"
                value={formData.visit_id}
                onChange={handleChange}
                disabled={isLoadingOptions}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{isLoadingOptions ? 'Loading...' : 'Send empty value'}</option>
                {visits.map((visit) => (
                  <option key={visit.id} value={String(visit.id)}>
                    #{visit.id} - {visit.client_name || visit.client?.company_name || `Client #${visit.client_id}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="assigned_user_id" className="block text-sm font-medium text-gray-700 mb-2">
                Assigned User
              </label>
              <select
                id="assigned_user_id"
                name="assigned_user_id"
                value={formData.assigned_user_id}
                onChange={handleChange}
                disabled={isLoadingOptions}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{isLoadingOptions ? 'Loading...' : 'Send empty value'}</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={String(worker.id)}>
                    {worker.name || worker.email || `Worker #${worker.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reported_at" className="block text-sm font-medium text-gray-700 mb-2">
                Reported At <span className="text-red-500">*</span>
              </label>
              <input
                id="reported_at"
                name="reported_at"
                type="datetime-local"
                value={formData.reported_at}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="service_location" className="block text-sm font-medium text-gray-700 mb-2">
                Service Location <span className="text-red-500">*</span>
              </label>
              <input
                id="service_location"
                name="service_location"
                value={formData.service_location}
                onChange={handleChange}
                placeholder="Hytech Branch A"
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                id="lat"
                name="lat"
                value={formData.lat}
                onChange={handleChange}
                placeholder="Send empty value"
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="lng" className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                id="lng"
                name="lng"
                value={formData.lng}
                onChange={handleChange}
                placeholder="Send empty value"
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="service_types" className="block text-sm font-medium text-gray-700 mb-2">
                Service Types (one per line)
              </label>
              <textarea
                id="service_types"
                name="service_types"
                rows={4}
                value={formData.service_types}
                onChange={handleChange}
                placeholder={'follow-up\ninspection'}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-2">
                Observations (one per line)
              </label>
              <textarea
                id="observations"
                name="observations"
                rows={4}
                value={formData.observations}
                onChange={handleChange}
                placeholder={'minor leakages\npeak traces'}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Send empty value if needed"
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="actions_taken" className="block text-sm font-medium text-gray-700 mb-2">
                Actions Taken
              </label>
              <textarea
                id="actions_taken"
                name="actions_taken"
                rows={3}
                value={formData.actions_taken}
                onChange={handleChange}
                placeholder="Send empty value if needed"
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="recommendations" className="block text-sm font-medium text-gray-700 mb-2">
                Recommendations
              </label>
              <textarea
                id="recommendations"
                name="recommendations"
                rows={3}
                value={formData.recommendations}
                onChange={handleChange}
                placeholder="Send empty value if needed"
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <input
                id="rating"
                name="rating"
                type="number"
                min={1}
                max={5}
                value={formData.rating}
                onChange={handleChange}
                placeholder="Send empty value"
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="company_phone" className="block text-sm font-medium text-gray-700 mb-2">
                Company Phone
              </label>
              <input
                id="company_phone"
                name="company_phone"
                value={formData.company_phone}
                onChange={handleChange}
                placeholder="Send empty value"
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="company_signature" className="block text-sm font-medium text-gray-700 mb-2">
                Company Signature (Base64 PNG)
              </label>
              <textarea
                id="company_signature"
                name="company_signature"
                rows={3}
                value={formData.company_signature}
                onChange={handleChange}
                placeholder="data:image/png;base64,..."
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="worker_signature" className="block text-sm font-medium text-gray-700 mb-2">
                Worker Signature (Base64 PNG)
              </label>
              <textarea
                id="worker_signature"
                name="worker_signature"
                rows={3}
                value={formData.worker_signature}
                onChange={handleChange}
                placeholder="data:image/png;base64,..."
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                Images
              </label>
              <input
                id="images"
                name="images"
                type="file"
                multiple
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                If no images are selected, the API will receive an empty value.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push('/service-report')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
