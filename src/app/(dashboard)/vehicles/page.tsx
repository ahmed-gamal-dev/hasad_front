'use client';

import React, { useState, useEffect } from 'react';
import { Vehicle, VehicleLog, CreateVehicleInput, UpdateVehicleInput, CreateVehicleLogInput, UpdateVehicleLogInput } from '@/types/Vehicle';
import { vehicleApi, vehicleLogApi } from '@/services/vehicles/vehicleService';
import DataTable, { Column } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import Modal from '@/components/vehicles/Modal';
import VehicleForm from '@/components/vehicles/VehicleForm';
import VehicleLogForm from '@/components/vehicles/VehicleLogForm';

type TabType = 'vehicles' | 'logs';

export default function VehiclesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('vehicles');

  // Vehicles state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isVehiclesLoading, setIsVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);
  
  // Vehicles pagination state
  const [vehiclesCurrentPage, setVehiclesCurrentPage] = useState(1);
  const [vehiclesTotalPages, setVehiclesTotalPages] = useState(1);
  const [vehiclesTotalItems, setVehiclesTotalItems] = useState(0);
  const [vehiclesPerPage, setVehiclesPerPage] = useState(15);

  // Logs state
  const [logs, setLogs] = useState<VehicleLog[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [filterVehicleId, setFilterVehicleId] = useState<string>('');
  
  // Logs pagination state
  const [logsCurrentPage, setLogsCurrentPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [logsTotalItems, setLogsTotalItems] = useState(0);
  const [logsPerPage, setLogsPerPage] = useState(15);

  // Vehicle Modal states
  const [isCreateVehicleModalOpen, setIsCreateVehicleModalOpen] = useState(false);
  const [isEditVehicleModalOpen, setIsEditVehicleModalOpen] = useState(false);
  const [isViewVehicleModalOpen, setIsViewVehicleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Log Modal states
  const [isCreateLogModalOpen, setIsCreateLogModalOpen] = useState(false);
  const [isEditLogModalOpen, setIsEditLogModalOpen] = useState(false);
  const [isViewLogModalOpen, setIsViewLogModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<VehicleLog | null>(null);

  // Vehicle Confirm dialog states
  const [isDeleteVehicleDialogOpen, setIsDeleteVehicleDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  // Log Confirm dialog states
  const [isDeleteLogDialogOpen, setIsDeleteLogDialogOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<VehicleLog | null>(null);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      setIsVehiclesLoading(true);
      setVehiclesError(null);
      const response = await vehicleApi.list({
        page: vehiclesCurrentPage,
        per_page: vehiclesPerPage,
      });
      
      // Handle the API response structure
      if (Array.isArray(response)) {
        // Non-paginated response
        setVehicles(response);
        setVehiclesTotalItems(response.length);
        setVehiclesTotalPages(1);
      } else {
        // Paginated response with structure: { success, data, meta, message, errors }
        setVehicles(response.data || []);
        
        if (response.meta?.pagination) {
          const { current_page, last_page, per_page, total } = response.meta.pagination;
          setVehiclesCurrentPage(current_page);
          setVehiclesTotalPages(last_page);
          setVehiclesPerPage(per_page);
          setVehiclesTotalItems(total);
        }
      }
    } catch (err) {
      setVehiclesError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
      console.error('Error fetching vehicles:', err);
    } finally {
      setIsVehiclesLoading(false);
    }
  };

  // Fetch logs
  const fetchLogs = async () => {
    try {
      setIsLogsLoading(true);
      setLogsError(null);
      const params: any = {
        page: logsCurrentPage,
        per_page: logsPerPage,
      };
      
      if (filterVehicleId) {
        params.vehicle_id = Number(filterVehicleId);
      }
      
      const response = await vehicleLogApi.list(params);
      
      // Handle the API response structure
      if (Array.isArray(response)) {
        // Non-paginated response
        setLogs(response);
        setLogsTotalItems(response.length);
        setLogsTotalPages(1);
      } else {
        // Paginated response with structure: { success, data, meta, message, errors }
        setLogs(response.data || []);
        
        if (response.meta?.pagination) {
          const { current_page, last_page, per_page, total } = response.meta.pagination;
          setLogsCurrentPage(current_page);
          setLogsTotalPages(last_page);
          setLogsPerPage(per_page);
          setLogsTotalItems(total);
        }
      }
    } catch (err) {
      setLogsError(err instanceof Error ? err.message : 'Failed to fetch vehicle logs');
      console.error('Error fetching logs:', err);
    } finally {
      setIsLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'vehicles') {
      fetchVehicles();
    } else {
      fetchLogs();
    }
  }, [activeTab, filterVehicleId, vehiclesCurrentPage, vehiclesPerPage, logsCurrentPage, logsPerPage]);

  // Vehicle handlers
  const handleCreateVehicle = async (data: CreateVehicleInput) => {
    try {
      setIsSubmitting(true);
      await vehicleApi.create(data);
      setIsCreateVehicleModalOpen(false);
      await fetchVehicles();
    } catch (err) {
      console.error('Error creating vehicle:', err);
      alert(err instanceof Error ? err.message : 'Failed to create vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateVehicle = async (data: UpdateVehicleInput) => {
    if (!selectedVehicle) return;

    try {
      setIsSubmitting(true);
      await vehicleApi.update(selectedVehicle.id, data);
      setIsEditVehicleModalOpen(false);
      setSelectedVehicle(null);
      await fetchVehicles();
    } catch (err) {
      console.error('Error updating vehicle:', err);
      alert(err instanceof Error ? err.message : 'Failed to update vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;

    try {
      setIsDeleting(true);
      await vehicleApi.delete(vehicleToDelete.id);
      setIsDeleteVehicleDialogOpen(false);
      setVehicleToDelete(null);
      await fetchVehicles();
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete vehicle');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportVehicles = async () => {
    try {
      const blob = await vehicleApi.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vehicles-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting vehicles:', err);
      alert(err instanceof Error ? err.message : 'Failed to export vehicles');
    }
  };

  // Vehicles pagination handlers
  const handleVehiclesPageChange = (page: number) => {
    setVehiclesCurrentPage(page);
  };

  const handleVehiclesPerPageChange = (perPage: number) => {
    setVehiclesPerPage(perPage);
    setVehiclesCurrentPage(1); // Reset to first page when changing items per page
  };

  // Log handlers
  const handleCreateLog = async (data: CreateVehicleLogInput) => {
    try {
      setIsSubmitting(true);
      await vehicleLogApi.create(data);
      setIsCreateLogModalOpen(false);
      await fetchLogs();
    } catch (err) {
      console.error('Error creating log:', err);
      alert(err instanceof Error ? err.message : 'Failed to create log');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLog = async (data: UpdateVehicleLogInput) => {
    if (!selectedLog) return;

    try {
      setIsSubmitting(true);
      await vehicleLogApi.update(selectedLog.id, data);
      setIsEditLogModalOpen(false);
      setSelectedLog(null);
      await fetchLogs();
    } catch (err) {
      console.error('Error updating log:', err);
      alert(err instanceof Error ? err.message : 'Failed to update log');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLog = async () => {
    if (!logToDelete) return;

    try {
      setIsDeleting(true);
      await vehicleLogApi.delete(logToDelete.id);
      setIsDeleteLogDialogOpen(false);
      setLogToDelete(null);
      await fetchLogs();
    } catch (err) {
      console.error('Error deleting log:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete log');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportLogs = async () => {
    try {
      const vehicleId = filterVehicleId ? Number(filterVehicleId) : undefined;
      const blob = await vehicleLogApi.exportCsv(vehicleId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vehicle-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting logs:', err);
      alert(err instanceof Error ? err.message : 'Failed to export logs');
    }
  };

  // Logs pagination handlers
  const handleLogsPageChange = (page: number) => {
    setLogsCurrentPage(page);
  };

  const handleLogsPerPageChange = (perPage: number) => {
    setLogsPerPage(perPage);
    setLogsCurrentPage(1); // Reset to first page when changing items per page
  };

  // Table columns for vehicles
  const vehicleColumns: Column<Vehicle>[] = [
    {
      key: 'id',
      label: 'ID',
      width: '80px',
    },
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'plate_number',
      label: 'Plate Number',
    },
    {
      key: 'assigned_user_id',
      label: 'Assigned User',
    },
    {
      key: 'created_at',
      label: 'Created At',
      render: (vehicle) =>
        vehicle.created_at
          ? new Date(vehicle.created_at).toLocaleDateString()
          : '-',
    },
  ];

  // Table columns for logs
  const logColumns: Column<VehicleLog>[] = [
    {
      key: 'id',
      label: 'ID',
      width: '80px',
    },
    {
      key: 'vehicle_id',
      label: 'Vehicle ID',
      width: '120px',
    },
    {
      key: 'month',
      label: 'Month',
    },
    {
      key: 'kilometers',
      label: 'Kilometers',
      render: (log) => log.kilometers.toLocaleString(),
    },
    {
      key: 'fuel_liters',
      label: 'Fuel (L)',
      render: (log) => Number(log.fuel_liters).toFixed(2),
    },
    {
      key: 'maintenance_cost',
      label: 'Maintenance ($)',
      render: (log) => `$${Number(log.maintenance_cost).toFixed(2)}`,
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (log) => (
        <span className="truncate max-w-xs block" title={log.notes}>
          {log.notes || '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-[80vh] bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicles Management</h1>
          <p className="text-gray-600 text-xs px-2">Manage your fleet of vehicles and track monthly logs</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('vehicles')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'vehicles'
                    ? 'border-primary-500 text-xl font-bold text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Vehicles
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'logs'
                    ? 'border-primary-500 text-xl font-bold text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Monthly Logs
              </button>
            </nav>
          </div>
        </div>

        {/* Vehicles Tab Content */}
        {activeTab === 'vehicles' && (
          <>
            {/* Error Message */}
            {vehiclesError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{vehiclesError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mb-6 flex justify-end gap-3">
              <button
                onClick={() => setIsCreateVehicleModalOpen(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
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
                Add Vehicle
              </button>
              <button
                onClick={handleExportVehicles}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export CSV
              </button>
            </div>

            {/* Vehicles Table */}
            <DataTable
              columns={vehicleColumns}
              data={vehicles}
              isLoading={isVehiclesLoading}
              emptyMessage="No vehicles found. Create your first vehicle to get started."
              showPagination={true}
              pagination={{
                currentPage: vehiclesCurrentPage,
                totalPages: vehiclesTotalPages,
                totalItems: vehiclesTotalItems,
                itemsPerPage: vehiclesPerPage,
                onPageChange: handleVehiclesPageChange,
                onItemsPerPageChange: handleVehiclesPerPageChange,
              }}
              onView={(vehicle) => {
                setSelectedVehicle(vehicle);
                setIsViewVehicleModalOpen(true);
              }}
              onEdit={(vehicle) => {
                setSelectedVehicle(vehicle);
                setIsEditVehicleModalOpen(true);
              }}
              onDelete={(vehicle) => {
                setVehicleToDelete(vehicle);
                setIsDeleteVehicleDialogOpen(true);
              }}
            />
          </>
        )}

        {/* Logs Tab Content */}
        {activeTab === 'logs' && (
          <>
            {/* Error Message */}
            {logsError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{logsError}</p>
              </div>
            )}

            {/* Actions and Filters */}
            <div className="mb-6 flex justify-end flex-wrap gap-3">
              <button
                onClick={() => setIsCreateLogModalOpen(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
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
                Add Log
              </button>
              <button
                onClick={handleExportLogs}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export CSV
              </button>

              {/* Filter by vehicle */}
              {/* <div className="ml-auto flex items-center gap-2">
                <label htmlFor="vehicle-filter" className="text-sm text-gray-700">
                  Filter by Vehicle ID:
                </label>
                <input
                  id="vehicle-filter"
                  type="number"
                  value={filterVehicleId}
                  onChange={(e) => {
                    setFilterVehicleId(e.target.value);
                    setLogsCurrentPage(1); // Reset to first page when filtering
                  }}
                  placeholder="All"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-32"
                />
                {filterVehicleId && (
                  <button
                    onClick={() => {
                      setFilterVehicleId('');
                      setLogsCurrentPage(1); // Reset to first page when clearing filter
                    }}
                    className="text-gray-400 hover:text-gray-600"
                    title="Clear filter"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div> */}
            </div>

            {/* Logs Table */}
            <DataTable
              columns={logColumns}
              data={logs}
              isLoading={isLogsLoading}
              emptyMessage="No vehicle logs found. Create your first log to get started."
              showPagination={true}
              pagination={{
                currentPage: logsCurrentPage,
                totalPages: logsTotalPages,
                totalItems: logsTotalItems,
                itemsPerPage: logsPerPage,
                onPageChange: handleLogsPageChange,
                onItemsPerPageChange: handleLogsPerPageChange,
              }}
              onView={(log) => {
                setSelectedLog(log);
                setIsViewLogModalOpen(true);
              }}
              onEdit={(log) => {
                setSelectedLog(log);
                setIsEditLogModalOpen(true);
              }}
              onDelete={(log) => {
                setLogToDelete(log);
                setIsDeleteLogDialogOpen(true);
              }}
            />
          </>
        )}

        {/* Vehicle Modals */}
        <Modal
          isOpen={isCreateVehicleModalOpen}
          onClose={() => setIsCreateVehicleModalOpen(false)}
          title="Create New Vehicle"
        >
          <VehicleForm
            onSubmit={handleCreateVehicle}
            onCancel={() => setIsCreateVehicleModalOpen(false)}
            isLoading={isSubmitting}
          />
        </Modal>

        <Modal
          isOpen={isEditVehicleModalOpen}
          onClose={() => {
            setIsEditVehicleModalOpen(false);
            setSelectedVehicle(null);
          }}
          title="Edit Vehicle"
        >
          {selectedVehicle && (
            <VehicleForm
              vehicle={selectedVehicle}
              onSubmit={handleUpdateVehicle}
              onCancel={() => {
                setIsEditVehicleModalOpen(false);
                setSelectedVehicle(null);
              }}
              isLoading={isSubmitting}
            />
          )}
        </Modal>

        <Modal
          isOpen={isViewVehicleModalOpen}
          onClose={() => {
            setIsViewVehicleModalOpen(false);
            setSelectedVehicle(null);
          }}
          title="Vehicle Details"
        >
          {selectedVehicle && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">ID</p>
                  <p className="text-lg text-gray-900">{selectedVehicle.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-lg text-gray-900">{selectedVehicle.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Plate Number</p>
                  <p className="text-lg text-gray-900">{selectedVehicle.plate_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Assigned User ID</p>
                  <p className="text-lg text-gray-900">{selectedVehicle.assigned_user_id}</p>
                </div>
                {selectedVehicle.created_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created At</p>
                    <p className="text-lg text-gray-900">
                      {new Date(selectedVehicle.created_at).toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedVehicle.updated_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Updated At</p>
                    <p className="text-lg text-gray-900">
                      {new Date(selectedVehicle.updated_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setIsViewVehicleModalOpen(false);
                    setSelectedVehicle(null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Log Modals */}
        <Modal
          isOpen={isCreateLogModalOpen}
          onClose={() => setIsCreateLogModalOpen(false)}
          title="Create New Log"
        >
          <VehicleLogForm
            vehicleId={filterVehicleId ? Number(filterVehicleId) : undefined}
            onSubmit={handleCreateLog}
            onCancel={() => setIsCreateLogModalOpen(false)}
            isLoading={isSubmitting}
          />
        </Modal>

        <Modal
          isOpen={isEditLogModalOpen}
          onClose={() => {
            setIsEditLogModalOpen(false);
            setSelectedLog(null);
          }}
          title="Edit Log"
        >
          {selectedLog && (
            <VehicleLogForm
              log={selectedLog}
              onSubmit={handleUpdateLog}
              onCancel={() => {
                setIsEditLogModalOpen(false);
                setSelectedLog(null);
              }}
              isLoading={isSubmitting}
            />
          )}
        </Modal>

        <Modal
          isOpen={isViewLogModalOpen}
          onClose={() => {
            setIsViewLogModalOpen(false);
            setSelectedLog(null);
          }}
          title="Log Details"
        >
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">ID</p>
                  <p className="text-lg text-gray-900">{selectedLog.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Vehicle ID</p>
                  <p className="text-lg text-gray-900">{selectedLog.vehicle_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Month</p>
                  <p className="text-lg text-gray-900">{selectedLog.month}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Kilometers</p>
                  <p className="text-lg text-gray-900">{selectedLog.kilometers.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fuel Liters</p>
                  <p className="text-lg text-gray-900">{Number(selectedLog.fuel_liters).toFixed(2)} L</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Maintenance Cost</p>
                  <p className="text-lg text-gray-900">${Number(selectedLog.maintenance_cost).toFixed(2)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-lg text-gray-900">{selectedLog.notes || '-'}</p>
                </div>
                {selectedLog.created_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created At</p>
                    <p className="text-lg text-gray-900">
                      {new Date(selectedLog.created_at).toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedLog.updated_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Updated At</p>
                    <p className="text-lg text-gray-900">
                      {new Date(selectedLog.updated_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setIsViewLogModalOpen(false);
                    setSelectedLog(null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Dialogs */}
        <ConfirmDialog
          isOpen={isDeleteVehicleDialogOpen}
          title="Delete Vehicle"
          message={`Are you sure you want to delete "${vehicleToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteVehicle}
          onCancel={() => {
            setIsDeleteVehicleDialogOpen(false);
            setVehicleToDelete(null);
          }}
          isLoading={isDeleting}
        />

        <ConfirmDialog
          isOpen={isDeleteLogDialogOpen}
          title="Delete Log"
          message={`Are you sure you want to delete the log for ${logToDelete?.month}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteLog}
          onCancel={() => {
            setIsDeleteLogDialogOpen(false);
            setLogToDelete(null);
          }}
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}