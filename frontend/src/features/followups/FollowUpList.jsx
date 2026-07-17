import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { followupsApi } from './api';
import { ListChecks } from 'lucide-react';

export default function FollowUpList() {
  const queryClient = useQueryClient();

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Follow-ups</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Visitors waiting to be contacted by the team.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-premium border border-gray-100 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500">Loading follow-ups...</div>
        ) : followups.length === 0 ? (
          <div className="p-10 text-center">
            <ListChecks className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">All caught up!</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">There are no pending follow-ups right now.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Visitor</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {followups.map((followup) => (
                  <tr key={followup.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{followup.visitor_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {followup.visitor_phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(followup.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select 
                        defaultValue=""
                        onChange={(e) => handleStatusChange(followup.id, e.target.value)}
                        className="rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm py-1.5 px-3 transition-colors"
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}