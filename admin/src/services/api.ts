import axios from 'axios';
import { useAuthStore } from '../store/auth';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const authService = {
  login: (username: string, password: string) => api.post('/auth/login', { username, password }),
  register: (data: { username: string; password: string; email?: string }) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: { email?: string }) => api.put('/auth/profile', data),
  changePassword: (data: { oldPassword: string; newPassword: string }) => api.put('/auth/password', data),
};

export const userService = {
  getUsers: (params?: { page?: number; pageSize?: number }) => api.get('/users', { params }),
  getUser: (id: number) => api.get(`/users/${id}`),
  createUser: (data: { username: string; password: string; email?: string; role?: string }) => api.post('/users', data),
  updateUser: (id: number, data: { email?: string; role?: string; status?: string }) => api.put(`/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/users/${id}`),
};

export const postService = {
  getPosts: (params?: { page?: number; pageSize?: number; status?: string; search?: string }) => api.get('/posts', { params }),
  getPost: (id: number) => api.get(`/posts/${id}`),
  createPost: (data: { title: string; content?: string; slug?: string; category?: string; tags?: string[]; status?: string }) => api.post('/posts', data),
  updatePost: (id: number, data: { title?: string; content?: string; slug?: string; category?: string; tags?: string[]; status?: string }) => api.put(`/posts/${id}`, data),
  deletePost: (id: number) => api.delete(`/posts/${id}`),
};

export const commentService = {
  getComments: (params?: { page?: number; pageSize?: number; status?: string }) => api.get('/comments', { params }),
  updateCommentStatus: (id: number, status: string) => api.put(`/comments/${id}`, { status }),
  deleteComment: (id: number) => api.delete(`/comments/${id}`),
};

export const logService = {
  getLogs: (params?: { page?: number; pageSize?: number; action?: string; user_id?: number }) => api.get('/logs', { params }),
  getLogStatistics: () => api.get('/logs/statistics'),
};

export const settingService = {
  getSettings: () => api.get('/settings'),
  updateSetting: (key: string, value: string, description?: string) => api.put('/settings', { key, value, description }),
  getDashboardStats: () => api.get('/dashboard/stats'),
};

export default api;
