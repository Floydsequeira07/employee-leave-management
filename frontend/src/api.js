import axios from "axios";

// One shared axios instance for every request after login
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,

  // Fail with a clear error instead of hanging forever on a sleeping server
  timeout: 20000,
});

// Send the login token with every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// If the token is missing or expired, send the user back to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/api/auth/login");

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;