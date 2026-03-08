import axios from 'axios';

// Replace with your machine IP when testing on a physical phone.
export const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 7000
});
