import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL;

function normalizeBaseUrl(raw) {
  if (!raw) return "http://localhost:5000/api";
  // If someone set ":5000" or ":5000/api", prefix with localhost
  if (/^:\d/.test(raw)) return `http://localhost${raw}`;
  // If it looks like a host without protocol (e.g. localhost:5000), add http://
  if (!/^https?:\/\//i.test(raw)) return `http://${raw}`;
  return raw;
}

const axiosClient = axios.create({
  baseURL: normalizeBaseUrl(rawApiUrl),
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Emit a custom event so the app-level auth provider can handle logout
      try {
        window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { message: error.response?.data?.error } }));
      } catch (e) {
        // Fallback to direct removal if CustomEvent not supported
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;