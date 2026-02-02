import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/',
});

// Request interceptor to add the auth token header to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Basic ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const setAuthToken = (username, password) => {
    const token = btoa(`${username}:${password}`);
    localStorage.setItem('authToken', token);
};

export default api;
