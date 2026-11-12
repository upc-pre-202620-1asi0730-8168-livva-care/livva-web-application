import axios from 'axios';
import authToken from './auth-token.js';

const baseApi = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Send the JWT issued by the Livva Platform API on every request.
baseApi.interceptors.request.use((config) => {
    const token = authToken.get();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default baseApi;