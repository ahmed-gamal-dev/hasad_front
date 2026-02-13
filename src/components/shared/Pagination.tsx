'use client';

import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  showItemsPerPage?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 15, 25, 50, 100],
  showItemsPerPage = true,
}: PaginationProps) {
  // Safety checks to prevent NaN
  const safeTotalItems = totalItems || 0;
  const safeCurrentPage = currentPage || 1;
  const safeItemsPerPage = itemsPerPage || 10;
  const safeTotalPages = totalPages || 1;
  
  const startItem = (safeCurrentPage - 1) * safeItemsPerPage + 1;
  const endItem = Math.min(safeCurrentPage * safeItemsPerPage, safeTotalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (safeTotalPages <= maxPagesToShow) {
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (safeCurrentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(safeTotalPages - 1, safeCurrentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (safeCurrentPage < safeTotalPages - 2) {
        pages.push('...');
      }

      pages.push(safeTotalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (safeTotalItems === 0) {
    return null;
  }

  return (
    <div className="w-full p-5">
      {/* Mobile view */}
      <div className="flex flex-col gap-4 sm:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              <span className="font-medium">{startItem}</span>
              <span className="mx-1">—</span>
              <span className="font-medium">{endItem}</span>
            </span>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-500">{safeTotalItems} total</span>
          </div>
          
          {showItemsPerPage && onItemsPerPageChange && (
            <div className="flex items-center gap-2">
              <label htmlFor="itemsPerPage-mobile" className="text-sm text-gray-600">
                Show:
              </label>
              <select
                id="itemsPerPage-mobile"
                value={safeItemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                className="border border-gray-200 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {safeCurrentPage} of {safeTotalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="inline-flex items-center px-3 py-1.5 border border-gray-200 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button
              onClick={() => onPageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage === safeTotalPages}
              className="inline-flex items-center px-3 py-1.5 border border-gray-200 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center gap-6">
          {/* Results info */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              <span className="font-medium">{startItem}</span>
              <span className="mx-1">—</span>
              <span className="font-medium">{endItem}</span>
            </span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-500">{safeTotalItems} results</span>
          </div>

          {/* Items per page selector */}
          {showItemsPerPage && onItemsPerPageChange && (
            <div className="flex items-center gap-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                Items per page:
              </label>
              <select
                id="itemsPerPage"
                value={safeItemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                className="border border-gray-200 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Page indicator */}
          <span className="text-sm text-gray-600">
            Page <span className="font-medium">{safeCurrentPage}</span> of{' '}
            <span className="font-medium">{safeTotalPages}</span>
          </span>

          {/* Pagination controls */}
          <nav className="flex items-center gap-1" aria-label="Pagination">
            <button
              onClick={() => onPageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="inline-flex items-center px-2.5 py-1.5 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {pageNumbers.map((page, index) => {
                if (page === '...') {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-3 py-1 text-sm text-gray-500"
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page as number)}
                    className={`
                      px-3 py-1 text-sm font-medium rounded
                      transition-colors duration-150
                      ${safeCurrentPage === page
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onPageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage === safeTotalPages}
              className="inline-flex items-center px-2.5 py-1.5 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}