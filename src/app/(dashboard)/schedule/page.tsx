'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { visitService } from '@/services/visits/visitService';
import { clientService } from '@/services/clients/clientService';
import { workerService } from '@/services/workers/workerService';
import { Worker } from '@/types/worker';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setClients as setClientsInStore } from '@/store/slices/clientsSlice';
import { useTranslation } from '@/contexts/SimpleTranslationContext';

interface VisitEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    status: string;
    client_id: number;
    assigned_user_id: number;
  };
}

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

const STATUS_COLORS = {
  scheduled: 'bg-primary-500',
  in_progress: 'bg-secondary-500',
  completed: 'bg-emerald-600',
  cancelled: 'bg-gray-500',
};

const STATUS_BORDERS = {
  scheduled: 'border-l-primary-600',
  in_progress: 'border-l-secondary-600',
  completed: 'border-l-emerald-700',
  cancelled: 'border-l-gray-600',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function SchedulePage() {
  const dispatch = useAppDispatch();
  const clients = useAppSelector((state) => state.clients.clients);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [visits, setVisits] = useState<VisitEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(false);
  const [isLoadingVisits, setIsLoadingVisits] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    client_id: '',
    assigned_user_id: '',
    service: '',
    status: 'scheduled',
    scheduled_at: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const { translate, language, setLanguage } = useTranslation();

  // Fetch visits for calendar
  useEffect(() => {
    fetchVisits();
  }, [currentDate, viewMode]);

  // Fetch clients and workers when modal opens
  useEffect(() => {
    if (isModalOpen) {
      fetchClientsForModal();
      fetchWorkersForModal();
    }
  }, [isModalOpen]);

  const fetchVisits = async () => {
    try {
      setIsLoadingVisits(true);
      const { from, to } = getDateRange();
      
      // Use getAllPaginated with date range filters
      const response = await visitService.getAllPaginated({
        from,
        to,
      });
      
      // Transform the visits data to match the VisitEvent structure
      const events: VisitEvent[] = response.visits.map((visit: any) => ({
        id: visit.id,
        title: `${visit.service || 'Visit'} - ${visit.client_name || 'Client'}`,
        start: visit.scheduled_at,
        end: visit.scheduled_at,
        extendedProps: {
          status: visit.status,
          client_id: visit.client_id,
          assigned_user_id: visit.assigned_user_id,
        },
      }));
      
      setVisits(events);
    } catch (error) {
      console.error('Error fetching visits:', error);
      toast.error('Failed to fetch visits');
    } finally {
      setIsLoadingVisits(false);
    }
  };

  const fetchClientsForModal = async () => {
    if (clients.length > 0) return;
    
    try {
      setIsLoadingClients(true);
      const data = await clientService.getAll();
      dispatch(setClientsInStore(data));
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoadingClients(false);
    }
  };

  const fetchWorkersForModal = async () => {
    try {
      setIsLoadingWorkers(true);
      const data = await workerService.getAll({ page: 1, per_page: 100 });
      setWorkers(data.workers);
    } catch (error) {
      console.error('Error fetching workers:', error);
    } finally {
      setIsLoadingWorkers(false);
    }
  };

  const getDateRange = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    let from: Date;
    let to: Date;

    if (viewMode === 'month') {
      // Get first day of the month at 00:00:00
      from = new Date(year, month, 1, 0, 0, 0);
      // Get last day of the month at 23:59:59
      to = new Date(year, month + 1, 0, 23, 59, 59);
    } else if (viewMode === 'week') {
      const day = currentDate.getDay();
      from = new Date(currentDate);
      from.setDate(currentDate.getDate() - day);
      from.setHours(0, 0, 0, 0);
      to = new Date(from);
      to.setDate(from.getDate() + 6);
      to.setHours(23, 59, 59, 999);
    } else {
      from = new Date(currentDate);
      from.setHours(0, 0, 0, 0);
      to = new Date(currentDate);
      to.setHours(23, 59, 59, 999);
    }

    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return { 
      from: formatDate(from), 
      to: formatDate(to) 
    };
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getVisitsForDate = (date: Date | null) => {
    if (!date) return [];
    
    // Get local date string in YYYY-MM-DD format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return visits.filter(visit => {
      // Extract just the date part from the ISO string without timezone conversion
      const visitDateStr = visit.start.split('T')[0];
      return visitDateStr === dateStr;
    });
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!formData.client_id.trim()) {
      nextErrors.client_id = 'Client is required';
    }

    if (!formData.assigned_user_id.trim()) {
      nextErrors.assigned_user_id = 'Assigned user is required';
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

      setIsModalOpen(false);
      setFormData({
        client_id: '',
        assigned_user_id: '',
        service: '',
        status: 'scheduled',
        scheduled_at: '',
        notes: '',
      });
      fetchVisits();
    } catch (error) {
      console.error('Error creating visit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      client_id: '',
      assigned_user_id: '',
      service: '',
      status: 'scheduled',
      scheduled_at: '',
      notes: '',
    });
    setErrors({});
  };

  return (
    <div className="space-y-6 px-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{translate('Schedule')}</h1>
          <p className="text-gray-600 mt-2 text-xs px-2 ">{translate('View, manage, and create visit schedules')}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center gap-2.5 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
        >
          <svg 
            className="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
         {translate('Add Visit')} 
        </button>
      </div>
  <div className="px-6   ">
          <div className="flex items-center gap-6">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">          {translate('Schedule Key:')} 
</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary-500 rounded border-l-4 border-l-primary-600 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">  {translate('Scheduled:')} </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-secondary-500 rounded border-l-4 border-l-secondary-600 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700"> {translate('In Progress')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-600 rounded border-l-4 border-l-emerald-700 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">{translate('Completed')} </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-500 rounded border-l-4 border-l-gray-600 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">{translate('Cancelled')}</span>
              </div>
            </div>
          </div>
        </div>
      {/* Calendar Controls */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2.5 hover:bg-gray-100 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:shadow-sm"
              aria-label="Previous month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2.5 hover:bg-gray-100 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:shadow-sm"
              aria-label="Next month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-white border border-gray-300 hover:border-primary-500 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium text-sm text-gray-700 hover:text-primary-700 shadow-sm"
            >
              {translate('Today')}
            </button>
          </div>

          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
{translate(MONTHS[currentDate.getMonth()])} {currentDate.getFullYear()}
          </h2>

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1.5 shadow-inner">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'month'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {translate('Month')}
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'week'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {translate('Week')}
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'day'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
             {translate('Day')} 
            </button>
          </div>
        </div>

        {/* Status Legend */}
      
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden relative">
        {/* Loading Overlay - Only for Calendar */}
        {isLoadingVisits && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
            <div className="bg-white rounded-xl p-6 shadow-2xl border border-gray-200">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary"></div>
                <p className="text-sm font-medium text-gray-700">Loading visits...</p>
              </div>
            </div>
          </div>
        )}

        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200">
          {DAYS.map((day) => (
            <div key={day} className="py-4 text-center text-sm font-bold text-primary-900 tracking-wide uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 divide-x divide-gray-200">
          {getDaysInMonth().map((date, index) => {
            const dayVisits = getVisitsForDate(date);
            const isTodayDate = isToday(date);

            return (
              <div
                key={index}
                className={`min-h-[140px] p-3 transition-all duration-200 ${
                  date ? 'bg-white hover:bg-gray-50 cursor-pointer border-b border-gray-200' : 'bg-gray-50/50'
                } ${isTodayDate ? 'bg-primary-50/50 ring-2 ring-primary-500 ring-inset' : ''}`}
              >
                {date && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all ${
                          isTodayDate
                            ? 'bg-primary text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      {dayVisits.length > 0 && (
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {dayVisits.length}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {dayVisits.slice(0, 3).map((visit) => (
                        <div
                          key={visit.id}
                          className={`group ${STATUS_COLORS[visit.extendedProps.status as keyof typeof STATUS_COLORS]} text-white text-xs rounded-md px-2.5 py-2 cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 ${STATUS_BORDERS[visit.extendedProps.status as keyof typeof STATUS_BORDERS]} hover:scale-105 transform`}
                          title={`${formatTime(visit.start)} - ${visit.title}`}
                        >
                          <div className="font-semibold mb-0.5 flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {formatTime(visit.start)}
                          </div>
                          <div className="truncate text-[11px] opacity-95 leading-tight">
                            {visit.title}
                          </div>
                        </div>
                      ))}
                      {dayVisits.length > 3 && (
                        <div className="text-xs text-gray-600 font-semibold pl-2 py-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                          {dayVisits.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary to-primary-700 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Create New Visit</h2>
                <p className="text-sm text-primary-100 mt-1">Schedule a new visit for a client</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="client_id" className="block text-sm font-bold text-gray-900 mb-2">
                      Client <span className="text-secondary-500">*</span>
                    </label>
                    <select
                      id="client_id"
                      name="client_id"
                      value={formData.client_id}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 font-medium ${
                        errors.client_id ? 'border-secondary-500 bg-secondary-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      disabled={isLoadingClients}
                    >
                      <option value="">
                        {isLoadingClients ? 'Loading clients...' : 'Select a client'}
                      </option>
                      {clients.map((client) => (
                        <option key={client.id} value={String(client.id)}>
                          {client.name || client.company_name || `Client #${client.id}`}
                        </option>
                      ))}
                    </select>
                    {errors.client_id && (
                      <p className="mt-2 text-sm text-secondary-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.client_id}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="assigned_user_id" className="block text-sm font-bold text-gray-900 mb-2">
                      Assigned Worker <span className="text-secondary-500">*</span>
                    </label>
                    <select
                      id="assigned_user_id"
                      name="assigned_user_id"
                      value={formData.assigned_user_id}
                      onChange={handleChange}
                      disabled={isLoadingWorkers}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 font-medium ${
                        errors.assigned_user_id ? 'border-secondary-500 bg-secondary-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <option value="">
                        {isLoadingWorkers ? 'Loading workers...' : 'Select a worker'}
                      </option>
                      {workers.map((worker) => (
                        <option key={worker.id} value={String(worker.id)}>
                          {worker.name || worker.email || `Worker #${worker.id}`}
                        </option>
                      ))}
                    </select>
                    {errors.assigned_user_id && (
                      <p className="mt-2 text-sm text-secondary-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.assigned_user_id}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="service" className="block text-sm font-bold text-gray-900 mb-2">
                      Service Type <span className="text-secondary-500">*</span>
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 font-medium ${
                        errors.service ? 'border-secondary-500 bg-secondary-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <option value="">Select a service</option>
                      {SERVICE_OPTIONS.map((serviceOption) => (
                        <option key={serviceOption} value={serviceOption}>
                          {serviceOption}
                        </option>
                      ))}
                    </select>
                    {errors.service && (
                      <p className="mt-2 text-sm text-secondary-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.service}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-bold text-gray-900 mb-2">
                      Status <span className="text-secondary-500">*</span>
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 font-medium ${
                        errors.status ? 'border-secondary-500 bg-secondary-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {errors.status && (
                      <p className="mt-2 text-sm text-secondary-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.status}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="scheduled_at" className="block text-sm font-bold text-gray-900 mb-2">
                    Scheduled Date & Time <span className="text-secondary-500">*</span>
                  </label>
                  <input
                    id="scheduled_at"
                    name="scheduled_at"
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 font-medium ${
                      errors.scheduled_at ? 'border-secondary-500 bg-secondary-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  />
                  {errors.scheduled_at && (
                    <p className="mt-2 text-sm text-secondary-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.scheduled_at}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-bold text-gray-900 mb-2">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add any additional notes or instructions..."
                    className="w-full px-4 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none text-gray-900"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Visit
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}