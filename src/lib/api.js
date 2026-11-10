import axios from 'axios';

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const http = axios.create({ baseURL: API_URL, timeout: 25000 });

export class ApiError extends Error {
  constructor(message, data) {
    super(message);
    this.name = 'ApiError';
    this.data = data;
  }
}

/**
 * The backend answers logical failures with HTTP 200 + { success:false, message }
 * (and sometimes just { message:'Unauthorized' }). Normalise all of it into thrown errors
 * so every caller can use plain try/catch.
 */
async function call(promise) {
  let res;
  try {
    res = await promise;
  } catch (err) {
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
      throw new ApiError('Cannot reach the server. Make sure the backend is running and try again.');
    }
    throw new ApiError(err.response?.data?.message || err.response?.data?.error || err.message || 'Something went wrong', err.response?.data);
  }
  const d = res.data;
  if (d && (d.success === false || d.message === 'Unauthorized' || d.message === 'Please fill all the field')) {
    throw new ApiError(d.message || 'Request failed', d);
  }
  return d;
}

export const authApi = {
  login: (email, password) => call(http.post('/login', { email, password })),
  register: ({ name, email, password, confirmPassword }) => call(http.post('/registration', { name, email, password, confirmPassword })),
  forgot: (email) => call(http.post('/forgotpassword', { email })),
  reset: (token, password, confirmPassword) => call(http.post(`/resetpassword/${token}`, { password, confirmPassword })),
  verify: (token) => call(http.post(`/verifyemail/${token}`)),
  resend: (email) => call(http.post('/resendverificationemail', { email })),
};

export const productApi = {
  list: () => call(http.get('/get-all-products')),
  bySlug: (slug) => call(http.get(`/get-single-slug-product/${encodeURIComponent(slug)}`)),
  create: (formData) => call(http.post('/createproduct', formData)),
  update: (id, formData) => call(http.put(`/update-product/${id}`, formData)),
  remove: (id) => call(http.delete(`/delete-product/${id}`)),
  bulk: (formData) => call(http.post('/bulk/createproduct', formData)),
  categories: () => call(http.get('/getcategory')),
  createCategory: (name) => call(http.post('/category', { name })),
};

export const cartApi = {
  get: (userId) => call(http.get(`/cart/${userId}`)),
  add: ({ proid, userid, quantity }) => call(http.post('/cart/create', { proid, userid, quantity })),
  step: (id, type) => call(http.post(`/cart/update/${id}`, { type })),
  remove: (id) => call(http.delete(`/cart/${id}`)),
};

export const orderApi = {
  pay: (payload) => call(http.post('/payment', payload)),
  forUser: (userId) => call(http.get(`/getorders/${userId}`)),
};

export const userApi = {
  all: () => call(http.get('/allusers')),
  one: (id) => call(http.get(`/singleuser/${id}`)),
  update: (id, body) => call(http.post(`/update/${id}`, body)),
  remove: (id) => call(http.delete(`/deleteuser/${id}`)),
};
