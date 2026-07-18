import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from './api';
import { Loader2, Plus, Settings2, Power } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('services');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newService, setNewService] = useState({ name: '', day_of_week: 'Saturday', start_time: '10:00' });
  
  const queryClient = useQueryClient();

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: settingsApi.getServices,
  });

  const { data: branchesData } = useQuery({
    queryKey: ['branches'],
    queryFn: settingsApi.getBranches,
  });

  const createMutation = useMutation({
    mutationFn: settingsApi.createService,
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      setIsModalOpen(false);
      setNewService({ name: '', day_of_week: 'Saturday', start_time: '10:00' });
    },
    onError: (err) => alert(err.response?.data?.name?.[0] || 'Failed to create service.')
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => settingsApi.updateService(id, { is_active: !is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
    }
  });

  const services = servicesData?.data?.results || [];
  const branches = branchesData?.data?.results || [];

  const handleCreateService = (e) => {
    e.preventDefault();
    if (branches.length === 0) {
      alert("Please create a Church Branch first in Django Admin.");
      return;
    }
    // Automatically assign to the first branch for now
    createMutation.mutate({ ...newService, branch: branches[0].id });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage church branches, services, and system configurations.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('services')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'services' 
                ? 'border-brand-600 text-brand-600 dark:text-brand-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Church Services
          </button>
          <button
            onClick={() => setActiveTab('branches')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'branches' 
                ? 'border-brand-600 text-brand-600 dark:text-brand-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Branches
          </button>
        </nav>
      </div>

      {/* Services Tab Content */}
      {activeTab === 'services' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-premium border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Services</h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Service
            </button>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <div className="p-10 text-center text-gray-500"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></div>
            ) : services.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                <Settings2 className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                No services configured. Create one to enable check-ins.
              </div>
            ) : (
              services.map(service => (
                <div key={service.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {service.day_of_week || 'Any Day'} at {new Date(`2000-01-01T${service.start_time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleMutation.mutate({ id: service.id, is_active: service.is_active })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      service.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      service.is_active ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Branches Tab Content */}
      {activeTab === 'branches' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-premium border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Church Branches</h2>
          <div className="space-y-3">
            {branches.map(branch => (
              <div key={branch.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{branch.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{branch.county || 'No county set'}</p>
                </div>
                <span className="text-xs text-gray-400">Managed via Admin</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-premium-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create New Service</h3>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Service Name *</label>
                <input
                  type="text"
                  required
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="e.g., Sabbath Service, Bible Study"
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2.5 px-3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Day of Week</label>
                  <select
                    value={newService.day_of_week}
                    onChange={(e) => setNewService({ ...newService, day_of_week: e.target.value })}
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2.5 px-3"
                  >
                    <option>Saturday</option>
                    <option>Sunday</option>
                    <option>Wednesday</option>
                    <option>Friday</option>
                    <option>Daily</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newService.start_time}
                    onChange={(e) => setNewService({ ...newService, start_time: e.target.value })}
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm py-2.5 px-3"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:bg-brand-400">
                  {createMutation.isPending ? 'Creating...' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}