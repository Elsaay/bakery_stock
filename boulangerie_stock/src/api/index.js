import axios from 'axios';

const productsApi = axios.create({
  baseURL: 'http://localhost:5001',
  headers: { 'Content-Type': 'application/json' },
});

const ordersApi = axios.create({
  baseURL: 'http://localhost:5002',
  headers: { 'Content-Type': 'application/json' },
});

const stockApi = axios.create({
  baseURL: 'http://localhost:5003',
  headers: { 'Content-Type': 'application/json' },
});

// === PRODUITS ===
export const getProducts = () => productsApi.get('/products');
export const createProduct = (data) => productsApi.post('/products', data);
export const updateProduct = (id, data) => productsApi.put(`/products/${id}`, data);
export const deleteProduct = (id) => productsApi.delete(`/products/${id}`);

// === COMMANDES ===
export const getOrders = () => ordersApi.get('/orders');
export const createOrder = (data) => ordersApi.post('/orders', data);

// === BILAN DE LA JOURNÉE ===
export const recordDailyReport = (items) => stockApi.post('/stock-usage', items);

export default productsApi;
