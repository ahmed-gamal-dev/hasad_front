'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';
import { userService } from '@/services/users/userService';
import { roleService, Role } from '@/services/Roleservice ';
import { toast } from 'react-toastify';

type UserEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

interface FormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  role?: string;
}

export default function EditUserPage({ params }: UserEditPageProps) {
  const router = useRouter();

  const [userId, setUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUser, setIsFetchingUser] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  // Unwrap params promise
  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      const id = Number(resolvedParams.id);
      
      if (isNaN(id)) {
        toast.error('Invalid user ID');
        router.push('/users');
        return;
      }
      
      setUserId(id);
    };

    unwrapParams();
  }, [params, router]);

  // Fetch roles on mount
  useEffect(() => {
    fetchRoles();
  }, []);

  // Fetch user when userId is set
  useEffect(() => {
    if (userId !== null) {
      fetchUser(userId);
    }
  }, [userId]);

  const fetchRoles = async () => {
    try {
      setIsLoadingRoles(true);
      const fetchedRoles = await roleService.getAll();
      setRoles(fetchedRoles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const fetchUser = async (id: number) => {
    try {
      setIsFetchingUser(true);
      const user = await userService.getById(id);

      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        role: (user.role ) || '',
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to load user data');
    } finally {
      setIsFetchingUser(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Passwords do not match';
      }
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error('Invalid user ID');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await userService.update(userId, updateData);
      router.push('/users');
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (isFetchingUser || userId === null) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-100/40 -z-10"></div>
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-200/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-300/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
            <p className="mt-4 text-lg font-semibold text-gray-700">Loading user data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-100/40 -z-10"></div>
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-200/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-300/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Header Section */}
        <div className="mb-5 animate-fade-in">
          <button
            onClick={() => router.push('/users')}
            className="group inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-900 transition-all duration-300 mb-8 hover:gap-3"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Users
          </button>
          
          <div className="space-y-3 flex justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Edit User
              </h1>
              <p className="text-xs pt-2 px-2 text-gray-500 max-w-2xl">
                Update user information and configure their access permissions
              </p>
            </div>
            <div>
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary-100/60 backdrop-blur-sm rounded-full border border-primary-200/50">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">Edit Mode</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Container */}
        <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up">
          {/* User Information Card */}
          <div className="group relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-primary-200">
            {/* Decorative gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400"></div>
            
            {/* Card Header */}
            <div className="relative px-8 py-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">User Information</h2>
                  <p className="text-sm text-gray-500">Personal details and identification</p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span>Full Name</span>
                    <span className="text-secondary-500">*</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-4 ${
                        errors.name 
                          ? 'border-red-400 bg-red-50/50 focus:ring-red-100 focus:border-red-500' 
                          : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100 hover:border-gray-300'
                      }`}
                      placeholder="John Doe"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      {formData.name && !errors.name && (
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {errors.name && (
                    <div className="flex items-center gap-2 text-xs text-red-600 animate-shake">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.name}
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span>Email Address</span>
                    <span className="text-secondary-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-4 ${
                        errors.email 
                          ? 'border-red-400 bg-red-50/50 focus:ring-red-100 focus:border-red-500' 
                          : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100 hover:border-gray-300'
                      }`}
                      placeholder="john.doe@company.com"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      {formData.email && !errors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {errors.email && (
                    <div className="flex items-center gap-2 text-xs text-red-600 animate-shake">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Role Field */}
              <div className="space-y-2">
                <label htmlFor="role" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span>User Role</span>
                  <span className="text-secondary-500">*</span>
                </label>
                {isLoadingRoles ? (
                  <div className="w-full px-4 py-3.5 bg-gray-50/50 border-2 border-gray-200 rounded-xl flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-3 border-primary-600 border-t-transparent"></div>
                    <span className="text-sm text-gray-600 font-medium">Loading available roles...</span>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl text-sm font-medium appearance-none transition-all duration-300 focus:outline-none focus:ring-4 cursor-pointer ${
                        errors.role 
                          ? 'border-red-400 bg-red-50/50 focus:ring-red-100 focus:border-red-500' 
                          : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100 hover:border-gray-300'
                      }`}
                    >
                      <option value="" disabled>Select a role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.name}>
                          {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}
                {errors.role && (
                  <div className="flex items-center gap-2 text-xs text-red-600 animate-shake">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.role}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="group relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-primary-200">
            {/* Decorative gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400"></div>
            
            {/* Card Header */}
            <div className="relative px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                    <p className="text-sm text-gray-500">Update security credentials (optional)</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-primary-100/80 text-primary-700 text-xs font-semibold rounded-full">Optional</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-8">
              {/* Info Banner */}
              <div className="mb-6 bg-gradient-to-r from-primary-50 to-primary-100/50 border-l-4 border-primary-500 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-primary-800 font-medium">
                    Leave password fields blank to keep the current password unchanged
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span>New Password</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-4 ${
                      errors.password 
                        ? 'border-red-400 bg-red-50/50 focus:ring-red-100 focus:border-red-500' 
                        : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100 hover:border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  {errors.password ? (
                    <div className="flex items-center gap-2 text-xs text-red-600 animate-shake">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password}
                    </div>
                  ) : (
                    <p className="flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Minimum 8 characters required
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password_confirmation" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span>Confirm New Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="password_confirmation"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-4 ${
                        errors.password_confirmation 
                          ? 'border-red-400 bg-red-50/50 focus:ring-red-100 focus:border-red-500' 
                          : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100 hover:border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      {formData.password_confirmation && formData.password === formData.password_confirmation && (
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {errors.password_confirmation && (
                    <div className="flex items-center gap-2 text-xs text-red-600 animate-shake">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password_confirmation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 gap-4">
            <button
              type="button"
              onClick={() => router.push('/users')}
              className="px-6 py-3.5 text-sm font-semibold text-gray-700 bg-white/80 backdrop-blur-sm border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="group relative px-8 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              
              <span className="relative flex items-center gap-2">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}