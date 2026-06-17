import api from './api';

export const register = (data)       => api.post('/auth/register', data);
export const login    = (data)       => api.post('/auth/login', data);
export const logout   = ()           => api.post('/auth/logout');
export const getProfile = ()         => api.get('/users/profile');
export const updateProfile = (data)  => api.put('/users/profile', data);
export const changePassword = (data) => api.put('/users/change-password', data);
export const getMyOrders = ()        => api.get('/orders/my-orders');
