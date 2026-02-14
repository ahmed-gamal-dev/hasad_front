'use client';

import React, { useState, useEffect, useRef } from 'react';
import { VehicleLog, CreateVehicleLogInput, UpdateVehicleLogInput, Vehicle } from '@/types/Vehicle';
import { vehicleApi } from '@/services/vehicles/vehicleService';

interface VehicleLogFormProps {
  log?: VehicleLog;
  vehicleId?: number;
  onSubmit: (data: CreateVehicleLogInput | UpdateVehicleLogInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function VehicleLogForm({
  log,
  vehicleId,
  onSubmit,
  onCancel,
  isLoading = false,
}: VehicleLogFormProps) {
  const [formData, setFormData] = useState({
    vehicle_id: log?.vehicle_id?.toString() || vehicleId?.toString() || '',
    month: log?.month || '',
    kilometers: log?.kilometers?.toString() || '',
    fuel_liters: log?.fuel_liters?.toString() || '',
    maintenance_cost: log?.maintenance_cost?.toString() || '',
    notes: log?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Vehicle dropdown states
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (log) {
      setFormData({
        vehicle_id: log.vehicle_id.toString(),
        month: log.month,
        kilometers: log.kilometers.toString(),
        fuel_liters: log.fuel_liters.toString(),
        maintenance_cost: log.maintenance_cost.toString(),
        notes: log.notes,
      });
    }
  }, [log]);

  // Fetch vehicles on mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Set selected vehicle when form data changes or vehicles are loaded
  useEffect(() => {
    if (formData.vehicle_id && vehicles.length > 0) {
      const vehicle = vehicles.find(v => v.id.toString() === formData.vehicle_id);
      if (vehicle) {
        setSelectedVehicle(vehicle);
        setSearchQuery(vehicle.name);
      }
    }
  }, [formData.vehicle_id, vehicles]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchVehicles = async () => {
    try {
      setIsLoadingVehicles(true);
      const response = await vehicleApi.list({ per_page: 100 });
      
      const vehiclesList = Array.isArray(response) ? response : response.data;
      setVehicles(vehiclesList);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setVehicles([]);
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicle_id) {
      newErrors.vehicle_id = 'Vehicle is required';
    }

    if (!formData.month.trim()) {
      newErrors.month = 'Month is required';
    } else {
      // Validate YYYY-MM format
      const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
      if (!monthRegex.test(formData.month)) {
        newErrors.month = 'Month must be in YYYY-MM format';
      }
    }

    if (!formData.kilometers) {
      newErrors.kilometers = 'Kilometers is required';
    } else if (isNaN(Number(formData.kilometers)) || Number(formData.kilometers) < 0) {
      newErrors.kilometers = 'Kilometers must be a positive number';
    }

    if (!formData.fuel_liters) {
      newErrors.fuel_liters = 'Fuel liters is required';
    } else if (isNaN(Number(formData.fuel_liters)) || Number(formData.fuel_liters) < 0) {
      newErrors.fuel_liters = 'Fuel liters must be a positive number';
    }

    if (!formData.maintenance_cost) {
      newErrors.maintenance_cost = 'Maintenance cost is required';
    } else if (isNaN(Number(formData.maintenance_cost)) || Number(formData.maintenance_cost) < 0) {
      newErrors.maintenance_cost = 'Maintenance cost must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data: CreateVehicleLogInput | UpdateVehicleLogInput = {
      vehicle_id: Number(formData.vehicle_id),
      month: formData.month.trim(),
      kilometers: Number(formData.kilometers),
      fuel_liters: Number(formData.fuel_liters),
      maintenance_cost: Number(formData.maintenance_cost),
      notes: formData.notes.trim(),
    };

    await onSubmit(data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleVehicleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsDropdownOpen(true);

    // Clear selected vehicle if search query is modified
    if (selectedVehicle && value !== selectedVehicle.name) {
      setSelectedVehicle(null);
      setFormData((prev) => ({ ...prev, vehicle_id: '' }));
    }
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setSearchQuery(vehicle.name);
    setFormData((prev) => ({ ...prev, vehicle_id: vehicle.id.toString() }));
    setIsDropdownOpen(false);
    // Clear error for this field
    if (errors.vehicle_id) {
      setErrors((prev) => ({ ...prev, vehicle_id: '' }));
    }
  };

  const handleVehicleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  // Filter vehicles based on search query
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.plate_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Vehicle Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700 mb-2">
          Vehicle *
        </label>
        <div className="relative">
          <input
            type="text"
            id="vehicle"
            value={searchQuery}
            onChange={handleVehicleSearch}
            onFocus={handleVehicleInputFocus}
            className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.vehicle_id ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Search vehicles by name or plate number..."
            disabled={isLoading || !!vehicleId}
            autoComplete="off"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {isLoadingVehicles ? (
              <svg
                className="animate-spin h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Dropdown */}
        {isDropdownOpen && !isLoadingVehicles && !vehicleId && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredVehicles.length > 0 ? (
              <ul className="py-1">
                {filteredVehicles.map((vehicle) => (
                  <li key={vehicle.id}>
                    <button
                      type="button"
                      onClick={() => handleVehicleSelect(vehicle)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                        selectedVehicle?.id === vehicle.id ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{vehicle.name}</div>
                          <div className="text-sm text-gray-500">Plate: {vehicle.plate_number}</div>
                        </div>
                        {/* <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          ID: {vehicle.id}
                        </span> */}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {searchQuery ? 'No vehicles found matching your search' : 'No vehicles available'}
              </div>
            )}
          </div>
        )}

        {errors.vehicle_id && (
          <p className="mt-1 text-sm text-red-600">{errors.vehicle_id}</p>
        )}

        {/* Selected Vehicle Display */}
        {selectedVehicle && !isDropdownOpen && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">{selectedVehicle.name}</div>
                <div className="text-xs text-gray-500">Plate: {selectedVehicle.plate_number}</div>
              </div>
              <span className="text-xs px-2 py-1 bg-white text-gray-600 rounded border border-gray-200">
                ID: {selectedVehicle.id}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Month Picker */}
      <div>
        <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
          Month *
        </label>
        <input
          type="month"
          id="month"
          name="month"
          value={formData.month}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            errors.month ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.month && <p className="mt-1 text-sm text-red-600">{errors.month}</p>}
        <p className="mt-1 text-xs text-gray-500">Select the month and year for this log entry</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="kilometers" className="block text-sm font-medium text-gray-700 mb-2">
            Kilometers *
          </label>
          <input
            type="number"
            id="kilometers"
            name="kilometers"
            value={formData.kilometers}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.kilometers ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 1500"
            disabled={isLoading}
          />
          {errors.kilometers && (
            <p className="mt-1 text-sm text-red-600">{errors.kilometers}</p>
          )}
        </div>

        <div>
          <label htmlFor="fuel_liters" className="block text-sm font-medium text-gray-700 mb-2">
            Fuel Liters *
          </label>
          <input
            type="number"
            id="fuel_liters"
            name="fuel_liters"
            value={formData.fuel_liters}
            onChange={handleChange}
            step="0.01"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.fuel_liters ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 60.5"
            disabled={isLoading}
          />
          {errors.fuel_liters && (
            <p className="mt-1 text-sm text-red-600">{errors.fuel_liters}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="maintenance_cost" className="block text-sm font-medium text-gray-700 mb-2">
          Maintenance Cost *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-500">$</span>
          <input
            type="number"
            id="maintenance_cost"
            name="maintenance_cost"
            value={formData.maintenance_cost}
            onChange={handleChange}
            step="0.01"
            className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.maintenance_cost ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 34.50"
            disabled={isLoading}
          />
        </div>
        {errors.maintenance_cost && (
          <p className="mt-1 text-sm text-red-600">{errors.maintenance_cost}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g., Oil changed, tire rotation, brake inspection"
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {log ? 'Updating...' : 'Creating...'}
            </span>
          ) : (
            <>{log ? 'Update Log' : 'Create Log'}</>
          )}
        </button>
      </div>
    </form>
  );
}