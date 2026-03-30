import axios from 'axios';
import { useAppStore } from './store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor – attach token
api.interceptors.request.use((config) => {
  const token = useAppStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor – handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = useAppStore.getState().refreshToken;
      if (refreshToken && !error.config._retry) {
        error.config._retry = true;
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, null, {
            params: { refresh_token: refreshToken },
          });
          const { access_token, refresh_token } = res.data;
          useAppStore.getState().setTokens(access_token, refresh_token);
          error.config.headers.Authorization = `Bearer ${access_token}`;
          return api(error.config);
        } catch {
          useAppStore.getState().clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } else {
        useAppStore.getState().clearTokens();
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────
export const authAPI = {
  signup: (data: { email: string; password: string; name: string; age?: number; language?: string; currency?: string; personality?: string }) =>
    api.post('/auth/signup', data),
  sendOTP: (data: { email: string; password: string; name: string; age?: number; language?: string; currency?: string; personality?: string }) =>
    api.post('/auth/signup/send-otp', data),
  verifyOTP: (data: { email: string; code: string }) =>
    api.post('/auth/signup/verify-otp', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ── Transactions ─────────────────────────
export const transactionsAPI = {
  list: (params?: Record<string, string | number>) =>
    api.get('/transactions', { params }),
  create: (data: { raw_text: string; amount: number; type: string; transaction_date: string }) =>
    api.post('/transactions', data),
  uploadCSV: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/transactions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadReceipt: (file: File, rawText: string, amount: number, type: string, transactionDate: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/transactions/upload-receipt?raw_text=${encodeURIComponent(rawText)}&amount=${amount}&type=${type}&transaction_date=${transactionDate}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  summary: (period?: string) =>
    api.get('/transactions/summary', { params: { period } }),
};

// ── Roast ────────────────────────────────
export const roastAPI = {
  generate: (data: { period_days: number; tone: string }) =>
    api.post('/roast/generate', data),
  history: (page?: number) =>
    api.get('/roast/history', { params: { page } }),
  share: (roastId: string, platform: string) =>
    api.put(`/roast/${roastId}/share`, null, { params: { platform } }),
};

// ── Learning ─────────────────────────────
export const learningAPI = {
  generateQuiz: (triggerCategory?: string) =>
    api.get('/learning/quiz/generate', { params: { trigger_category: triggerCategory } }),
  submitQuiz: (quizId: string, answers: string[]) =>
    api.post(`/learning/quiz/${quizId}/submit`, { answers }),
  generateArticle: (topic: string) =>
    api.get('/learning/articles/generate', { params: { topic } }),
  staticArticles: () =>
    api.get('/learning/articles/featured'),
  badges: () => api.get('/learning/badges'),
  streaks: () => api.get('/learning/streaks'),
};

// ── Insights ────────────────────────────
export const insightsAPI = {
  financialHealth: () => api.get('/insights/financial-health'),
  dailyDigest: () => api.get('/insights/daily-digest'),
};

// ── Forecast ────────────────────────────
export const forecastAPI = {
  bills: (monthsAhead?: number) =>
    api.get('/forecast/bills', { params: { months_ahead: monthsAhead } }),
  cashflow: (month?: string) =>
    api.get('/forecast/cashflow', { params: { month } }),
};

// ── User ────────────────────────────────
export const userAPI = {
  profile: () => api.get('/user/profile'),
  updateProfile: (data: Record<string, unknown>) =>
    api.put('/user/profile', data),
  updatePreferences: (data: Record<string, unknown>) =>
    api.put('/user/preferences', data),
  deleteData: () => api.delete('/user/data'),
};

export default api;
