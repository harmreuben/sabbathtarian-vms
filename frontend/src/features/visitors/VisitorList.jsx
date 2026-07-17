import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { visitorsApi } from './api';

function VisitorSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-700"></div>
            <div className="h-3 w-1/2 rounded bg-gray-300 dark:bg-gray-700"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function VisitorList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['visitors', page, search],
    queryFn: () => visitorsApi.getVisitors({ page, search: search || undefined }),
  });

  const visitors = data?.data?.results || [];
  const totalCount = data?.data?.count || 0;
  const totalPages = Math.ceil(totalCount / 20);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Visitor Directory</h1>
          <button
            onClick={() => navigate('/visitors/new')}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            + Register New
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, phone, or ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="block w-full rounded-lg border border-gray-300 bg-white py-3 px-4 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          />
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow dark:bg-gray-800">
          {isLoading && <div className="p-6"><VisitorSkeleton /></div>}
          
          {isError && (
            <div className="p-6 text-center text-red-500">Failed to load visitors.</div>
          )}

          {!isLoading && !isError && visitors.length === 0 && (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">
              No visitors found matching your criteria.
            </div>
          )}

          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {visitors.map((visitor) => (
              <li 
                key={visitor.id} 
                onClick={() => navigate(`/visitors/${visitor.id}`)}
                className="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold dark:bg-blue-900 dark:text-blue-300">
                    {visitor.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{visitor.full_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{visitor.phone_number} • {visitor.registration_number}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    visitor.visitor_type === 'First Time' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                  }`}>
                    {visitor.visitor_type}
                  </span>
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                </p>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:ring-gray-600 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:ring-gray-600 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}