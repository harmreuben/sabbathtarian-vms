import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { communicationApi } from './api';

export default function SendBroadcast() {
  const [message, setMessage] = useState('');
  const [selectedVisitors, setSelectedVisitors] = useState([]);
  const [statusMsg, setStatusMsg] = useState(null);

  const { data: visitorsData, isLoading } = useQuery({
    queryKey: ['visitors-for-broadcast'],
    queryFn: communicationApi.getVisitors,
  });

  const mutation = useMutation({
    mutationFn: communicationApi.sendBroadcast,
    onSuccess: (response) => {
      setStatusMsg({ type: 'success', text: response.data.success });
      setMessage('');
      setSelectedVisitors([]);
    },
    onError: (error) => {
      setStatusMsg({ type: 'error', text: error.response?.data?.error || 'Failed to queue messages.' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatusMsg(null);
    if (selectedVisitors.length === 0) {
      setStatusMsg({ type: 'error', text: 'Please select at least one visitor.' });
      return;
    }
    mutation.mutate({ message, visitor_ids: selectedVisitors });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = visitorsData?.data?.results.map(v => v.id) || [];
      setSelectedVisitors(allIds);
    } else {
      setSelectedVisitors([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedVisitors.includes(id)) {
      setSelectedVisitors(selectedVisitors.filter(v => v !== id));
    } else {
      setSelectedVisitors([...selectedVisitors, id]);
    }
  };

  const visitors = visitorsData?.data?.results || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Send SMS Broadcast</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Compose a message and select recipients.</p>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-lg text-sm ${statusMsg.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20' : 'bg-red-50 text-red-700 dark:bg-red-900/20'}`}>
          {statusMsg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-premium border border-gray-100 dark:border-gray-800">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message *</label>
          <textarea 
            required 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            rows="4"
            maxLength="160"
            placeholder="Type your SMS message here..."
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm p-3"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{message.length}/160 characters</p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Select Recipients</h3>
          <div className="mb-3 flex items-center">
            <input 
              type="checkbox" 
              id="selectAll" 
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="selectAll" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Select All Visitors</label>
          </div>
          
          <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            {isLoading ? (
              <p className="p-4 text-center text-gray-500">Loading visitors...</p>
            ) : visitors.length === 0 ? (
              <p className="p-4 text-center text-gray-500">No visitors found.</p>
            ) : (
              visitors.map(visitor => (
                <div key={visitor.id} className="flex items-center p-3 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input 
                    type="checkbox" 
                    checked={selectedVisitors.includes(visitor.id)}
                    onChange={() => handleSelectOne(visitor.id)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    {visitor.full_name} - {visitor.phone_number}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={mutation.isPending}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 transition-colors"
        >
          {mutation.isPending ? 'Queuing...' : 'Queue Broadcast'}
        </button>
      </form>
    </div>
  );
}