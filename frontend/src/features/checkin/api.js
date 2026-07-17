import api from '../../lib/api';

export const checkinApi = {
  scan: (data) => api.post('/attendance/scan/', data),
  getServices: () => api.get('/services/'),
};