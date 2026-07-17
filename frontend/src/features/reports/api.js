import api from '../../lib/api';

export const reportsApi = {
  getStats: () => api.get('/reports/stats/'),
};