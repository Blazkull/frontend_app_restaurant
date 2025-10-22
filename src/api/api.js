// ======================================================
// Configuración de la API con Axios
// ======================================================

//import axios from "axios";
import showAlert from "../components/alerts.js"; // Asegúrate de tener este archivo

// Detectar entorno (usa solo el backend en la nube si el local no está activo)
const isBackendLocal = false; // Cambiar a true si se usa backend local
const API_URL_LOCAL = "http://127.0.0.1:8000";
const API_URL_PROD = "https://backend-app-restaurant-2kfa.onrender.com";

const API_URL = isBackendLocal ? API_URL_LOCAL : API_URL_PROD;

// ======================================================
// Creación de instancia de Axios
// ======================================================

const api = axios.create({
  baseURL: `${API_URL}/api` // 10 segundos para evitar bloqueos si la API no responde
});

// ======================================================
// Interceptor de solicitud (envía token y rol)
// ======================================================

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Validar token antes de usarlo
  if (token && token !== "undefined" && token.trim() !== "") {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (role) {
    config.headers["X-User-Role"] = role;
  }

  return config;
});

// ======================================================
// Interceptor de respuesta (manejo de errores y sesión)
// ======================================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Token expirado o inválido
      if (status === 401 || status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        showAlert({
          type: "info",
          title: "Sesión expirada",
          message: "Por favor, inicia sesión nuevamente.",
        }).then((result) => {
          // Solo redirige si el usuario confirma
          if (result.isConfirmed) {
            window.location.href = "../login/login.html";
          }
        });
      }

      // Error de servidor
      else if (status >= 500) {
        showAlert({
          type: "error",
          title: "Error del servidor",
          message: "Ocurrió un problema al conectar con el servidor. Intenta más tarde.",
        });
      }

      // Error de cliente (400–499 distinto de autenticación)
      else if (status >= 400) {
        showAlert({
          type: "info",
          title: "Error en la solicitud",
          message: error.response.data?.detail || "Verifica los datos enviados.",
        });
      }
    } else {
      // Error de red o timeout
      showAlert({
        type: "error",
        title: "Error de conexión",
        message: "No se pudo conectar con el servidor. Revisa tu conexión a Internet.",
      });
    }

    return Promise.reject(error);
  }
);

// ======================================================
// Exportar instancia para usar en otros módulos
// ======================================================

export default api;
