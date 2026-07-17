import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { followupsApi } from './api';

export default function FollowUpList() {
  const queryClient = useQueryClient();

  // Fetch only Pending followups for this dashboard widget
  const { data, isLoading } = useQuery({
    queryKey: ['followups', 'Pending'],
    queryFn: () => followupsApi.getFollowups({ status: 'Pending' }),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }) => followupsApi.updateFollowup(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['followups']);
    },
  });

  const handleStatusChange = (id, newStatus) => {
    mutation.mutate({ id, status: newStatus });
  };

  const followups = data?.data?.results || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pending Follow-ups</h1>
        
        <div className="bg-white shadow rounded-lg dark:bg-gray-800 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Visitor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {isLoading ? (
                <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
              ) : followups.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No pending follow-ups!</td></tr>
              ) : (
                followups.map(followup => (
                  <tr key={followup.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {followup.visitor_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {followup.visitor_phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {new Date(followup.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select 
                        defaultValue=""
                        onChange={(e) => handleStatusChange(followup.id, e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                      >
                        <option value="" disabled>Update Status...</option>
                        <option value="Called">Called</option>
                        <option value="Visited">Visited</option>
                        <option value="Prayed With">Prayed With</option>
                        <option value="Joined Church">Joined Church</option>
                        <option value="No Response">No Response</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}