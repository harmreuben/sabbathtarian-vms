import api from '../../lib/api';

export const settingsApi = {
  getServices: () => api.get('/services/'),
  createService: (data) => api.post('/services/', data),
  updateService: (id, data) => api.patch(`/services/${id}/`, data),
  getBranches: () => api.get('/branches/'),
};