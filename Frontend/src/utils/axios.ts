import axios from 'axios';

// Create a custom axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token on every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common error scenarios
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // You could add refresh token logic here
      // For example:
      // try {
      //   const refreshToken = localStorage.getItem('refreshToken');
      //   const response = await axios.post('/auth/refresh', { refreshToken });
      //   localStorage.setItem('token', response.data.token);
      //   originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
      //   return axiosInstance(originalRequest);
      // } catch (refreshError) {
      //   // Logout user if refresh fails
      //   localStorage.removeItem('token');
      //   localStorage.removeItem('refreshToken');
      //   window.location.href = '/login';
      //   return Promise.reject(refreshError);
      // }
      
      // Without refresh token logic, simply clear the token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// // Custom method for handling file uploads with proper content type
// axiosInstance.uploadFile = (url, formData, config = {}) => {
//   return axiosInstance.post(url, formData, {
//     ...config,
//     headers: {
//       ...config.headers,
//       'Content-Type': 'multipart/form-data',
//     },
//   });
// };

export default axiosInstance;