import api from '../../lib/api';

export const communicationApi = {
  getVisitors: () => api.get('/visitors/'),
  sendBroadcast: (data) => api.post('/communication/broadcast/send/', data),
  getLogs: () => api.get('/communication/logs/'),
};