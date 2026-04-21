import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// ─── Bills ───────────────────────────────────────────────
export const submitBill = (formData) =>
  api.post('/bills', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getMyBills = () => api.get('/bills/my');
export const getManagerBills = () => api.get('/bills/manager');
export const getHodBills = () => api.get('/bills/hod');
export const getAccountsBills = () => api.get('/bills/accounts');
export const getAllBills = (status) =>
  api.get('/bills/all', { params: status ? { status } : {} });
export const getBillById = (id) => api.get(`/bills/${id}`);

export const managerAction = (id, data) =>
  api.put(`/bills/${id}/manager-action`, data);
export const hodAction = (id, data) =>
  api.put(`/bills/${id}/hod-action`, data);

// ─── Users ───────────────────────────────────────────────
export const getUsers = (role) =>
  api.get('/users', { params: role ? { role } : {} });

export default api;
