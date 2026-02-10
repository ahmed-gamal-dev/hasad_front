'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';
import { userService } from '@/services/users/userService';
import { toast } from 'react-toastify';

type UserDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function UserDetailsPage({ params }: UserDetailsPageProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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

  // Fetch user when userId is set
  useEffect(() => {
    if (userId !== null) {
      fetchUser(userId);
    }
  }, [userId]);

  const fetchUser = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await userService.getById(id);
      setUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || userId === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/users')}
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
            Back to Users
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-600 mt-1">{user.email}</p>
        </div>
        <button
          onClick={() => router.push(`/users/${user.id}/edit`)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Edit User
        </button>
      </div>

      {/* User Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">User ID</label>
              <p className="text-gray-900 font-medium">{user.id}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <p className="text-gray-900 font-medium">{user.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="text-gray-900 font-medium">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Email Verified</label>
              <p className="text-gray-900 font-medium">
                {user.email_verified_at ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>

        {/* Roles */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Roles</h2>
          <div className="flex flex-wrap gap-2">
            {user.roles && user.roles.length > 0 ? (
              user.roles.map((role) => (
                <span
                  key={role.id}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    role.name === 'Admin'
                      ? 'bg-red-100 text-red-700'
                      : role.name === 'Technician'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-primary-100 text-primary-700'
                  }`}
                >
                  {role.name}
                </span>
              ))
            ) : (
              <p className="text-gray-500">No roles assigned</p>
            )}
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Permissions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {user.permissions && user.permissions.length > 0 ? (
              user.permissions.map((permission) => (
                <div
                  key={permission.id}
                  className="px-3 py-2 bg-primary-50 text-primary-700 rounded text-sm"
                >
                  {permission.name}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No permissions assigned</p>
            )}
          </div>
        </div>

        {/* Timestamps */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Timestamps
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Created At</label>
              <p className="text-gray-900 font-medium">
                {user.created_at
                  ? new Date(user.created_at).toLocaleString()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Updated At</label>
              <p className="text-gray-900 font-medium">
                {user.updated_at
                  ? new Date(user.updated_at).toLocaleString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}