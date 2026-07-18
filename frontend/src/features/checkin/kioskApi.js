import api from '../../lib/api';

export const kioskApi = {
  // Kiosk needs to fetch services and search/scan in one go
  getServices: () => api.get('/services/'),
  scanAndCheckin: (data) => api.post('/attendance/scan/', data),
};