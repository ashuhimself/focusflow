/**
 * API Service Layer for FocusFlow
 * Handles all HTTP requests with authentication and error handling
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  login: async (username, password) => {
    const response = await axios.post(`${API_BASE_URL}/token/`, {
      username,
      password,
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me/');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// Workspace APIs
export const workspaceAPI = {
  getWorkspace: async () => {
    const response = await api.get('/workspaces/');
    return response.data;
  },
};

// Track APIs
export const trackAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/tracks/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/tracks/${id}/`);
    return response.data;
  },

  create: async (trackData) => {
    const response = await api.post('/tracks/', trackData);
    return response.data;
  },

  update: async (id, trackData) => {
    const response = await api.patch(`/tracks/${id}/`, trackData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/tracks/${id}/`);
    return response.data;
  },

  getByCategory: async () => {
    const response = await api.get('/tracks/by_category/');
    return response.data;
  },

  updateProgress: async (id) => {
    const response = await api.post(`/tracks/${id}/update_progress/`);
    return response.data;
  },
};

// Category APIs
export const categoryAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/categories/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/categories/${id}/`);
    return response.data;
  },

  create: async (categoryData) => {
    const response = await api.post('/categories/', categoryData);
    return response.data;
  },

  update: async (id, categoryData) => {
    const response = await api.patch(`/categories/${id}/`, categoryData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/categories/${id}/`);
    return response.data;
  },
};

// Daily Todo APIs
export const dailyTodoAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/daily-todos/', { params });
    return response.data;
  },

  getToday: async () => {
    const response = await api.get('/daily-todos/today/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/daily-todos/${id}/`);
    return response.data;
  },

  create: async (todoData) => {
    const response = await api.post('/daily-todos/', todoData);
    return response.data;
  },

  update: async (id, todoData) => {
    const response = await api.patch(`/daily-todos/${id}/`, todoData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/daily-todos/${id}/`);
    return response.data;
  },
};

// Sprint APIs
export const sprintAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/sprints/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/sprints/${id}/`);
    return response.data;
  },

  create: async (sprintData) => {
    const response = await api.post('/sprints/', sprintData);
    return response.data;
  },

  update: async (id, sprintData) => {
    const response = await api.patch(`/sprints/${id}/`, sprintData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/sprints/${id}/`);
    return response.data;
  },

  getCurrent: async () => {
    const response = await api.get('/sprints/current/');
    return response.data;
  },
};

// Task APIs
export const taskAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/tasks/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/tasks/${id}/`);
    return response.data;
  },

  create: async (taskData) => {
    const response = await api.post('/tasks/', taskData);
    return response.data;
  },

  update: async (id, taskData) => {
    const response = await api.patch(`/tasks/${id}/`, taskData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/tasks/${id}/`);
    return response.data;
  },

  getByStatus: async () => {
    const response = await api.get('/tasks/by_status/');
    return response.data;
  },

  getToday: async () => {
    const response = await api.get('/tasks/today/');
    return response.data;
  },
};

// Daily Log APIs
export const dailyLogAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/daily-logs/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/daily-logs/${id}/`);
    return response.data;
  },

  create: async (logData) => {
    const response = await api.post('/daily-logs/', logData);
    return response.data;
  },

  update: async (id, logData) => {
    const response = await api.patch(`/daily-logs/${id}/`, logData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/daily-logs/${id}/`);
    return response.data;
  },

  getToday: async () => {
    const response = await api.get('/daily-logs/today/');
    return response.data;
  },

  getRecent: async () => {
    const response = await api.get('/daily-logs/recent/');
    return response.data;
  },
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats/');
    return response.data;
  },
};

export default api;
