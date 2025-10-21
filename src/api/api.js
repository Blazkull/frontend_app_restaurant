// api.js

import axios from 'axios';

// 1. Define la URL base de tu backend (sin la / final)
const API_BASE_URL = 'https://backend-app-restaurant-2kfa.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Interceptor para inyectar el token ANTES de cada solicitud
api.interceptors.request.use(
    (config) => {
        // Asumimos que el token se guarda como 'authToken' al iniciar sesión
        const token = localStorage.getItem('authToken'); 

        if (token) {
            // Añade el token al encabezado Authorization en formato Bearer
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;