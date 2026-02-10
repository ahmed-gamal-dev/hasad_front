'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';
import { userService } from '@/services/users/userService';
import DataTable, { Column } from '@/components/shared/DataTable';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        await userService.delete(user.id);
        // Refresh the list after delete
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleEdit = (user: User) => {
    router.push(`/users/${user.id}/edit`);
  };

  const handleView = (user: User) => {
    router.push(`/users/${user.id}`);
  };

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Define table columns
  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (user) => (
        <div className="text-sm font-medium text-gray-900">{user.name}</div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (user) => (
        <div className="text-sm text-gray-600">{user.email}</div>
      ),
    },
    {
      key: 'roles',
      label: 'Role',
      render: (user) => (
        <div className="flex gap-2">
          {user?.roles?.map((role) => (
            <span
              key={role?.id}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                role.name === 'Admin'
                  ? 'bg-primary-100 text-primary-700'
                  : role.name === 'Technician'
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-primary-100 text-primary-700'
              }`}
            >
              {role?.name}
            </span>
          ))}
          {user?.roles?.length === 0 && (
            <span className="text-sm text-gray-400">No role</span>
          )}
        </div>
      ),
    },
    
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 text-xs mt-1">
            Add, edit, or remove users and their permissions
          </p>
        </div>
        <button
          onClick={() => router.push('/users/new')}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
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
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        isLoading={isLoading}
        emptyMessage="No users found"
      />
    </div>
  );
}