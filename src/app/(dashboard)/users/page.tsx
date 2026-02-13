'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';
import { userService } from '@/services/users/userService';
import { downloadUsersCSV } from '@/services/users/downloadUsersCSV';
import DataTable, { Column } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortField, setSortField] = useState('-created_at');
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  // Fetch users when page, itemsPerPage, searchTerm, or sortField changes
  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, searchTerm, sortField]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAll({
        page: currentPage,
        per_page: itemsPerPage,
        q: searchTerm || undefined,
        sort: sortField,
      });
      
      setUsers(data.users);
      setTotalPages(data.lastPage);
      setTotalItems(data.total);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (user: User) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete User',
      message: `Are you sure you want to delete "${user.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setIsDeleting(true);
          await userService.delete(user.id);
          
          // Close dialog
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          
          // Refresh the list after delete
          // If we're on a page that becomes empty, go to previous page
          if (users.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          } else {
            fetchUsers();
          }
        } catch (error) {
          console.error('Error deleting user:', error);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const handleEdit = (user: User) => {
    router.push(`/users/${user.id}/edit`);
  };

  const handleView = (user: User) => {
    router.push(`/users/${user.id}`);
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      await downloadUsersCSV();
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

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
      key: 'role',
      label: 'Role',
      render: (user) => {
        // Handle both role as string and roles as array for backward compatibility
        if (typeof user.role === 'string') {
          return (
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.role === 'admin'
                  ? 'bg-primary-100 text-primary-700'
                  : user.role === 'supervisor'
                  ? 'bg-blue-100 text-blue-700'
                  : user.role === 'worker'
                  ? 'bg-gray-100 text-gray-700'
                  : user.role === 'client'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          );
        }
        
        // Fallback for roles array (if API structure changes)
        if (user.roles && Array.isArray(user.roles)) {
          return (
            <div className="flex gap-2">
              {user.roles.map((role) => (
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
              {user.roles.length === 0 && (
                <span className="text-sm text-gray-400">No role</span>
              )}
            </div>
          );
        }
        
        return <span className="text-sm text-gray-400">No role</span>;
      },
    },
    {
      key: 'created_at',
      label: 'Created At',
      render: (user) => {
        if (!user.created_at) return <span className="text-sm text-gray-400">-</span>;
        const date = new Date(user.created_at);
        return (
          <div className="text-sm text-gray-600">
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        );
      },
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
        <div className="flex gap-3">
          {/* Export CSV Button - ADDED suppressHydrationWarning */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={handleExportCSV}
            disabled={isExporting}
            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
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
                Exporting...
              </>
            ) : (
              <>
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
              </>
            )}
          </button>
          
          {/* Add User Button - ADDED suppressHydrationWarning */}
          <button
            type="button"
            suppressHydrationWarning
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
      </div>

      {/* Search */}
      {/* Search */}
<div className="bg-white rounded-lg border border-gray-200 p-4">
  <div className="flex items-center gap-4">
    <div className="flex-1">
      <input
        type="text"
        suppressHydrationWarning
        placeholder="Search users by name or email..."
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  </div>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        isLoading={isLoading}
        emptyMessage="No users found"
        showPagination={true}
        pagination={{
          currentPage,
          totalPages,
          itemsPerPage,
          totalItems,
          onPageChange: handlePageChange,
          onItemsPerPageChange: handleItemsPerPageChange,
          itemsPerPageOptions: [10, 15, 25, 50, 100],
          showItemsPerPage: true,
        }}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        isLoading={isDeleting}
      />
    </div>
  );
}