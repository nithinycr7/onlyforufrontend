import axios from 'axios';
import { getCookie } from 'cookies-next';

// Smart API URL detection
const getApiUrl = () => {
    // 1. Try environment variable
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

    // 2. Default to localhost/127.0.0.1 for browser-only dev
    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') {
            return 'http://127.0.0.1:8000/api/v1';
        }
        // 3. Use the known network IP if on the same network (for mobile testing)
        return `http://${host}:8000/api/v1`;
    }

    // Fallback for SSR
    return 'http://127.0.0.1:8000/api/v1';
};

const API_URL = getApiUrl();

console.log('🔧 API URL:', API_URL);
console.log('🔧 NEXT_PUBLIC_API_URL env:', process.env.NEXT_PUBLIC_API_URL);

export const api = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30 second timeout to detect hangs
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
    // Get token from localStorage (where login stores it)
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Create a custom event to notify the app about 401
            // We can listen to this in AuthProvider to logout
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('auth:unauthorized'));
            }
        }
        return Promise.reject(error);
    }
);
