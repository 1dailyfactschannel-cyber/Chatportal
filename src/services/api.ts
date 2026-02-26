import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (username: string, password: string) => {
    const { data } = await api.post('/auth/login', { username, password });
    return data;
  },
  register: async (username: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { username, email, password });
    return data;
  },
};

export const chatApi = {
  getChats: async () => {
    const { data } = await api.get('/chats');
    return data;
  },
  getMessages: async (chatId: string) => {
    const { data } = await api.get(`/chats/${chatId}/messages`);
    return data;
  },
  sendMessage: async (chatId: string, content: string) => {
    const { data } = await api.post(`/chats/${chatId}/messages`, { content });
    return data;
  },
  createChat: async (type: string, title: string, members: string[]) => {
    const { data } = await api.post('/chats', { type, title, members });
    return data;
  },
  markAsRead: async (chatId: string) => {
    const { data } = await api.post(`/chats/${chatId}/read`);
    return data;
  },
};
