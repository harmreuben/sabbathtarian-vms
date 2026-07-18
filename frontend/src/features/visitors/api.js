import api from '../../lib/api';

export const visitorsApi = {
  register: (data) => api.post('/visitors/', data),
  getVisitors: (params) => api.get('/visitors/', { params }),
  getVisitor: (id) => api.get(`/visitors/${id}/`),
  searchVisitors: (query) => api.get(`/visitors/search/?q=${query}`),
  regenerateQR: (id) => api.post(`/visitors/${id}/regenerate-qr/`),
};