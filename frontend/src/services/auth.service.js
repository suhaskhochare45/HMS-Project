import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data; // Backend currently returns the raw string token (Wait, we should check if backend returns a pure string or json payload)
};

export const register = async (userData) => {
  // userData: { name, email, password, role }
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getCurrentRole = () => {
    return localStorage.getItem('role');
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};
