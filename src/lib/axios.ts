import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends HTTP-only cookies automatically
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 30000,
});

// Request interceptor: attach token from localStorage if available
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('rico_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 globally — clear token and redirect if on a protected route
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('rico_token');
        
        // Do NOT force-redirect on initial auth probe (/api/auth/me) — let React Query & AuthGuard handle state
        const isAuthProbe = error.config?.url?.includes('/auth/me');
        if (!isAuthProbe) {
          const path = window.location.pathname;
          if (
            !path.startsWith('/login') &&
            !path.startsWith('/signup') &&
            !path.startsWith('/invite')
          ) {
            window.location.href = '/login/';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
