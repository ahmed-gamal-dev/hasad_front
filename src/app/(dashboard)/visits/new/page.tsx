'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { visitService } from '@/services/visits/visitService';
import { clientService } from '@/services/clients/clientService';
import { workerService } from '@/services/workers/workerService';
import { Worker } from '@/types/worker';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setClients as setClientsInStore } from '@/store/slices/clientsSlice';

interface FormData {
  client_id: string;
  assigned_user_id: string;
  service: string;
  status: string;
  scheduled_at: string;
  notes: string;
}

interface FormErrors {
  client_id?: string;
  assigned_user_id?: string;
  service?: string;
  status?: string;
  scheduled_at?: string;
}

const SERVICE_OPTIONS = [
  'Monthly Maintenance',
  'Installation',
  'Inspection',
  'Repair',
  'Emergency Support',
];

export default function NewVisitPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const clients = useAppSelector((state) => state.clients.clients);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    client_id: '',
    assigned_user_id: '',
    service: '',
    status: 'scheduled',
    scheduled_at: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const fetchClientsForSelect = async () => {
      if (clients.length > 0) {
        return;
      }

      try {
        setIsLoadingClients(true);
        const data = await clientService.getAll();
        dispatch(setClientsInStore(data));
      } catch (error) {
        console.error('Error fetching clients for visit form:', error);
      } finally {
        setIsLoadingClients(false);
      }
    };

    fetchClientsForSelect();
  }, [clients.length, dispatch]);

  useEffect(() => {
    const fetchWorkersForSelect = async () => {
      try {
        setIsLoadingWorkers(true);
        const data = await workerService.getAll({ page: 1, per_page: 100 });
        setWorkers(data.workers);
      } catch (error) {
        console.error('Error fetching workers for visit form:', error);
      } finally {
        setIsLoadingWorkers(false);
      }
    };

    fetchWorkersForSelect();
  }, []);

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!formData.client_id.trim()) {
      nextErrors.client_id = 'Client ID is required';
    } else if (!/^\d+$/.test(formData.client_id.trim())) {
      nextErrors.client_id = 'Client ID must be a number';
    }

    if (!formData.assigned_user_id.trim()) {
      nextErrors.assigned_user_id = 'Assigned user is required';
    } else if (!/^\d+$/.test(formData.assigned_user_id.trim())) {
      nextErrors.assigned_user_id = 'Assigned user ID must be a number';
    }

    if (!formData.service.trim()) {
      nextErrors.service = 'Service is required';
    }

    if (!formData.status.trim()) {
      nextErrors.status = 'Status is required';
    }

    if (!formData.scheduled_at.trim()) {
      nextErrors.scheduled_at = 'Scheduled date/time is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    try {
      await visitService.create({
        client_id: Number(formData.client_id),
        assigned_user_id: Number(formData.assigned_user_id),
        service: formData.service.trim(),
        status: formData.status.trim(),
        scheduled_at: new Date(formData.scheduled_at).toISOString(),
        notes: formData.notes.trim() || undefined,
      });

      router.push('/visits');
    } catch (error) {
      console.error('Error creating visit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/visits')}
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
            Back to Visits
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Visit</h1>
          <p className="text-gray-600 mt-1">Add a new visit to the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Visit Information</h2>

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
                className={`w-full px-4 py-2 border rounded-lg text-gray-400 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.client_id ? 'border-red-500' : 'border-gray-400'
                }`}
                disabled={isLoadingClients}
              >
                <option value="">
                  {isLoadingClients ? 'Loading clients...' : 'Select a client'}
                </option>
                {clients.map((client) => (
                  <option key={client.id} value={String(client.id)} className="text-gray-700">
                    {client.name || client.company_name || `Client #${client.id}`}
                  </option>
                ))}
              </select>
              {errors.client_id && <p className="mt-1 text-sm text-red-500">{errors.client_id}</p>}
            </div>

            <div>
              <label htmlFor="assigned_user_id" className="block text-sm font-medium text-gray-700 mb-2">
                Assigned User <span className="text-red-500">*</span>
              </label>
              <select
                id="assigned_user_id"
                name="assigned_user_id"
                value={formData.assigned_user_id}
                onChange={handleChange}
                disabled={isLoadingWorkers}
                className={`w-full px-4 py-2 border rounded-lg text-gray-400 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.assigned_user_id ? 'border-red-500' : 'border-gray-400'
                }`}
              >
                <option value="">
                  {isLoadingWorkers ? 'Loading workers...' : 'Select a worker'}
                </option>
                {workers.map((worker) => (
                  <option key={worker.id} value={String(worker.id)} className="text-gray-700">
                    {worker.name || worker.email || `Worker #${worker.id}`}
                  </option>
                ))}
              </select>
              {errors.assigned_user_id && (
                <p className="mt-1 text-sm text-red-500">{errors.assigned_user_id}</p>
              )}
            </div>

            <div>
              <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                Service <span className="text-red-500">*</span>
              </label>
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg text-gray-400 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.service ? 'border-red-500' : 'border-gray-400'
                }`}
              >
                <option value="">Select a service</option>
                {SERVICE_OPTIONS.map((serviceOption) => (
                  <option key={serviceOption} value={serviceOption} className="text-gray-700">
                    {serviceOption}
                  </option>
                ))}
              </select>
              {errors.service && <p className="mt-1 text-sm text-red-500">{errors.service}</p>}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.status ? 'border-red-500' : 'border-gray-400'
                }`}
              >
                <option value="scheduled">scheduled</option>
                <option value="in_progress">in_progress</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </select>
              {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="scheduled_at" className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled At <span className="text-red-500">*</span>
              </label>
              <input
                id="scheduled_at"
                name="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.scheduled_at ? 'border-red-500' : 'border-gray-400'
                }`}
              />
              {errors.scheduled_at && (
                <p className="mt-1 text-sm text-red-500">{errors.scheduled_at}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Optional notes"
                className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push('/visits')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Visit'}
          </button>
        </div>
      </form>
    </div>
  );
}
