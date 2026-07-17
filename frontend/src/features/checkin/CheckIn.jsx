import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { checkinApi } from './api';

export default function CheckIn() {
  const [code, setCode] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [message, setMessage] = useState(null);

  const { data: servicesData } = useQuery({
    queryKey: ['services'],
    queryFn: checkinApi.getServices,
  });

  const mutation = useMutation({
    mutationFn: checkinApi.scan,
    onSuccess: (response) => {
      setMessage({ type: 'success', text: `Success: ${response.data.visitor_name} checked in!` });
      setCode(''); // Clear input for next person
    },
    onError: (error) => {
      const errMsg = error.response?.data?.error || error.response?.data?.warning || 'Check-in failed.';
      const type = error.response?.status === 409 ? 'warning' : 'error';
      setMessage({ type, text: errMsg });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);
    mutation.mutate({ code, service: serviceId });
  };

  // Extract the actual array from the paginated response
  const services = servicesData?.data?.results || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-md bg-white shadow-lg rounded-xl dark:bg-gray-800 p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Visitor Check-In</h1>
        
        {message && (
          <div className={`mb-4 p-3 rounded-md text-sm ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 
            message.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : 
            'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Service *</label>
            <select 
              required 
              value={serviceId} 
              onChange={(e) => setServiceId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Service...</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Scan QR / Reg Number *</label>
            <input 
              type="text" 
              required 
              value={code} 
              onChange={(e) => setCode(e.target.value)}
              autoFocus
              placeholder="Scan or type code here..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <button 
            type="submit" 
            disabled={mutation.isPending || !serviceId}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            {mutation.isPending ? 'Checking in...' : 'Check In'}
          </button>
        </form>
      </div>
    </div>
  );
}