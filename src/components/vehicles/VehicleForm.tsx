'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Vehicle, CreateVehicleInput, UpdateVehicleInput } from '@/types/Vehicle';
import { User } from '@/types/user';
import { userService } from '@/services/users/userService';

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSubmit: (data: CreateVehicleInput | UpdateVehicleInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function VehicleForm({
  vehicle,
  onSubmit,
  onCancel,
  isLoading = false,
}: VehicleFormProps) {
  const [formData, setFormData] = useState({
    name: vehicle?.name || '',
    plate_number: vehicle?.plate_number || '',
    assigned_user_id: vehicle?.assigned_user_id?.toString() || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // User dropdown states
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name,
        plate_number: vehicle.plate_number,
        assigned_user_id: vehicle.assigned_user_id.toString(),
      });
    }
  }, [vehicle]);

  // Fetch initial technicians and load selected user if editing
  useEffect(() => {
    const initializeUsers = async () => {
      await fetchUsers('');
      
      // If editing a vehicle, fetch and set the selected user
      if (vehicle?.assigned_user_id) {
        try {
          const user = await userService.getById(vehicle.assigned_user_id);
          setSelectedUser(user);
          setSearchQuery(user.name);
        } catch (err) {
          console.error('Error fetching assigned user:', err);
        }
      }
    };
    
    initializeUsers();
  }, [vehicle]);

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

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (isDropdownOpen) {
        fetchUsers(searchQuery);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, isDropdownOpen]);

  const fetchUsers = async (query: string) => {
    try {
      setIsLoadingUsers(true);
      const response = await userService.getAll({ 
        q: query || undefined, // Use 'q' parameter for search as shown in API
        per_page: 50 
      });
      
      // Filter to show only Technician role users
      const technicians = response.users.filter(user => 
        user.role && user.role.toLowerCase() === 'worker'
      );
      
      setUsers(technicians);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vehicle name is required';
    }

    if (!formData.plate_number.trim()) {
      newErrors.plate_number = 'Plate number is required';
    }

    if (!formData.assigned_user_id) {
      newErrors.assigned_user_id = 'Assigned technician is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data: CreateVehicleInput | UpdateVehicleInput = {
      name: formData.name.trim(),
      plate_number: formData.plate_number.trim(),
      assigned_user_id: Number(formData.assigned_user_id),
    };

    await onSubmit(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleUserSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsDropdownOpen(true);
    
    // Clear selected user if search query is modified
    if (selectedUser && value !== selectedUser.name) {
      setSelectedUser(null);
      setFormData((prev) => ({ ...prev, assigned_user_id: '' }));
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSearchQuery(user.name);
    setFormData((prev) => ({ ...prev, assigned_user_id: user.id.toString() }));
    setIsDropdownOpen(false);
    // Clear error for this field
    if (errors.assigned_user_id) {
      setErrors((prev) => ({ ...prev, assigned_user_id: '' }));
    }
  };

  const handleUserInputFocus = () => {
    setIsDropdownOpen(true);
    // Fetch users when opening dropdown if list is empty
    if (users.length === 0) {
      fetchUsers(searchQuery);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Vehicle Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Service Van"
          disabled={isLoading}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="plate_number" className="block text-sm font-medium text-gray-700 mb-2">
          Plate Number *
        </label>
        <input
          type="text"
          id="plate_number"
          name="plate_number"
          value={formData.plate_number}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            errors.plate_number ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., ABC-123"
          disabled={isLoading}
        />
        {errors.plate_number && (
          <p className="mt-1 text-sm text-red-600">{errors.plate_number}</p>
        )}
      </div>

      <div className="relative" ref={dropdownRef}>
        <label htmlFor="assigned_user" className="block text-sm font-medium text-gray-700 mb-2">
          Assigned Technician *
        </label>
        <div className="relative">
          <input
            type="text"
            id="assigned_user"
            value={searchQuery}
            onChange={handleUserSearch}
            onFocus={handleUserInputFocus}
            className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.assigned_user_id ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Search technicians by name or email..."
            disabled={isLoading}
            autoComplete="off"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {isLoadingUsers ? (
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
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isLoadingUsers ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                <svg
                  className="animate-spin h-5 w-5 text-gray-400 mx-auto"
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
                <span className="mt-1 block">Searching technicians...</span>
              </div>
            ) : users.length > 0 ? (
              <ul className="py-1">
                {users.map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => handleUserSelect(user)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                        selectedUser?.id === user.id ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {user.role}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {searchQuery ? 'No technicians found matching your search' : 'No technicians available'}
              </div>
            )}
          </div>
        )}

        {errors.assigned_user_id && (
          <p className="mt-1 text-sm text-red-600">{errors.assigned_user_id}</p>
        )}

        {/* Selected Technician Display */}
        {selectedUser && !isDropdownOpen && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">{selectedUser.name}</div>
                <div className="text-xs text-gray-500">{selectedUser.email}</div>
              </div>
              {selectedUser.role && (
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded border border-blue-300">
                  {selectedUser.role}
                </span>
              )}
            </div>
          </div>
        )}
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
              {vehicle ? 'Updating...' : 'Creating...'}
            </span>
          ) : (
            <>{vehicle ? 'Update Vehicle' : 'Create Vehicle'}</>
          )}
        </button>
      </div>
    </form>
  );
}