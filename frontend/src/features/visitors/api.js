import api from '../../lib/api';

export const visitorsApi = {
  register: (data) => api.post('/visitors/', data),
  getVisitors: (params) => api.get('/visitors/', { params }),
  getVisitor: (id) => api.get(`/visitors/${id}/`),
};