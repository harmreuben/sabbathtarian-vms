import api from '../../lib/api';

export const followupsApi = {
  getFollowups: (params) => api.get('/followups/', { params }),
  updateFollowup: (id, data) => api.patch(`/followups/${id}/`, data),
};