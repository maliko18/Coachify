import axios from "axios";

const axiosClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Intercepteur pour ajouter le token d'authentification
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error?.config?.url || "");
    const authEndpoints = [
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
    ];
    const isAuthRequest = authEndpoints.some((endpoint) =>
      requestUrl.includes(endpoint),
    );
    const hasToken = Boolean(localStorage.getItem("ACCESS_TOKEN"));

    if (error.response?.status === 401 && hasToken && !isAuthRequest) {
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("USER");

      // Evite de forcer un rechargement inutile si on est deja sur la page login.
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/signup" &&
        window.location.pathname !== "/forgot-password"
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
