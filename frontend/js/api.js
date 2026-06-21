
const API_BASE = window.API_BASE_URL || 'http://localhost:8080/projet_tutore_final/projet_tutore/backend';

const api = {

  async request(method, endpoint, data = null) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (data) opts.body = JSON.stringify(data);

    try {
      const res = await fetch(API_BASE + endpoint, opts);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Erreur ${res.status}`);
      return json;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  },

  get:    (endpoint)       => api.request('GET',    endpoint),
  post:   (endpoint, data) => api.request('POST',   endpoint, data),
  put:    (endpoint, data) => api.request('PUT',    endpoint, data),
  delete: (endpoint)       => api.request('DELETE', endpoint),

  cours:       { getAll: ()      => api.get('/api/cours'),
                 get:    id      => api.get(`/api/cours/${id}`),
                 create: d       => api.post('/api/cours', d),
                 update: (id, d) => api.put(`/api/cours/${id}`, d),
                 remove: id      => api.delete(`/api/cours/${id}`) },

  enseignants: { getAll: ()      => api.get('/api/enseignants'),
                 get:    id      => api.get(`/api/enseignants/${id}`),
                 create: d       => api.post('/api/enseignants', d),
                 update: (id, d) => api.put(`/api/enseignants/${id}`, d),
                 remove: id      => api.delete(`/api/enseignants/${id}`) },

  classes:     { getAll: ()      => api.get('/api/classes'),
                 get:    id      => api.get(`/api/classes/${id}`),
                 create: d       => api.post('/api/classes', d),
                 update: (id, d) => api.put(`/api/classes/${id}`, d),
                 remove: id      => api.delete(`/api/classes/${id}`) },

  seances:     { getAll: (classeId) => api.get('/api/seances' + (classeId ? `?classe_id=${classeId}` : '')),
                 get:    id         => api.get(`/api/seances/${id}`),
                 create: d          => api.post('/api/seances', d),
                 update: (id, d)    => api.put(`/api/seances/${id}`, d),
                 remove: id         => api.delete(`/api/seances/${id}`) },

  evaluations: { getAll: ()      => api.get('/api/evaluations'),
                 get:    id      => api.get(`/api/evaluations/${id}`),
                 create: d       => api.post('/api/evaluations', d),
                 update: (id, d) => api.put(`/api/evaluations/${id}`, d),
                 remove: id      => api.delete(`/api/evaluations/${id}`) },

  avancement:  { getAll: ()      => api.get('/api/avancement'),
                 get:    id      => api.get(`/api/avancement/${id}`),
                 create: d       => api.post('/api/avancement', d),
                 update: (id, d) => api.put(`/api/avancement/${id}`, d),
                 remove: id      => api.delete(`/api/avancement/${id}`) },
};
