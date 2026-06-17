import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Ensures clean base URL:
 * - removes trailing slashes
 * - avoids double /api/api issues
 */
function normalizeBaseUrl(url) {
  if (!url) return "/api";

  // Remove trailing slash(es)
  url = url.replace(/\/+$/, "");

  // If the URL is a plain hostname or domain, prefer https
  if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) {
    url = `https://${url}`;
  }

  // Add /api when the base has a host but no API prefix yet
  if (/^https?:\/\//i.test(url) && !url.toLowerCase().includes("/api")) {
    url = `${url}/api`;
  }

  return url;
}

const axiosClient = axios.create({
  baseURL: normalizeBaseUrl(API_BASE_URL),
  headers: {
    "Content-Type": "application/json",
  },
});

// -----------------------------
// Attach JWT token automatically
// -----------------------------
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// -----------------------------
// Global error handling
// -----------------------------
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Clear auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Notify app (optional listener)
      window.dispatchEvent(
        new CustomEvent("auth:unauthorized", {
          detail: {
            message: error.response?.data?.error || "Unauthorized",
          },
        })
      );

      // Redirect safely
      window.location.href = "/#/login";
    }

    return Promise.reject(error);
  }
);

export default axiosClient;