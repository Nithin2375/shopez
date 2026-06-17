import api from './api';

export const getProducts  = (params) => api.get('/products', { params });
export const getProductById = (id)   => api.get(`/products/${id}`);
export const getCategories  = ()     => api.get('/products/categories');
