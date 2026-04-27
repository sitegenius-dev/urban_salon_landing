import axios from 'axios';

const api = axios.create({
   baseURL: "/api",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('salon_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const path = window.location.pathname;
      if (path.startsWith('/admin') || path.startsWith('/developer')) {
        localStorage.removeItem('salon_token');
        localStorage.removeItem('salon_user');
        window.location.href = path.startsWith('/admin') ? '/admin/login' : '/developer/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
