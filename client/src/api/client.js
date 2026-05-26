import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
});

// Let the browser set multipart boundary for FormData (do NOT use application/json)
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    const apiError = new Error(message);
    apiError.status = error.response?.status;
    return Promise.reject(apiError);
  }
);

/** Unwrap { success, data } from API after response interceptor */
export const getApiData = (response) => {
  if (!response) return null;
  if (response.success !== undefined && response.data !== undefined) {
    return response.data;
  }
  return response.data ?? response;
};

export const summarizeText = (payload) => api.post('/summarize/text', payload);

export const summarizeUrl = (payload) => api.post('/summarize/url', payload);

export const summarizeFile = (formData) => api.post('/summarize/pdf', formData);

export const getHistory = (limit = 50) => api.get('/history', { params: { limit } });

export const semanticSearch = (payload) => api.post('/search', payload);

export const healthCheck = () => api.get('/health');

export default api;
