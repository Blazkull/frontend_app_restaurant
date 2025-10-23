// ======================================================
// Configuración de la API con Axios
// ======================================================

import showAlert from "../components/alerts.js";

// Detectar entorno
const isBackendLocal = false; // Cambiar a true si se usa backend local
const API_URL_LOCAL = "http://127.0.0.1:8000";
const API_URL_PROD = "https://backend-app-restaurant-2kfa.onrender.com";

const API_URL = isBackendLocal ? API_URL_LOCAL : API_URL_PROD;

// ======================================================
// Función para validar token JWT
// ======================================================

function isValidToken(token) {
  if (!token || token === "undefined" || token === "null" || token.trim() === "") {
    return false;
  }
  
  // Validar formato JWT básico (3 partes separadas por punto)
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.warn("⚠️ Token malformado detectado");
    return false;
  }
  
  return true;
}

// ======================================================
// Función para limpiar sesión
// ======================================================

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
}

// ======================================================
// Creación de instancia de Axios
// ======================================================

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000, // 15 segundos
  headers: {
    'Content-Type': 'application/json',
  }
});

// ======================================================
// Interceptor de solicitud (envía token y rol)
// ======================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Validar y añadir token solo si es válido
    if (isValidToken(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token) {
      // Si existe un token pero no es válido, limpiarlo
      console.warn("⚠️ Token inválido detectado. Limpiando sesión...");
      clearSession();
    }

    if (role && role !== "undefined") {
      config.headers["X-User-Role"] = role;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ======================================================
// Interceptor de respuesta (manejo de errores y sesión)
// ======================================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Error de red o sin respuesta del servidor
    if (!error.response) {
      showAlert({
        type: "error",
        title: "Error de conexión",
        message: "No se pudo conectar con el servidor. Revisa tu conexión a Internet.",
      });
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Token expirado o inválido (401, 403)
    if (status === 401 || status === 403) {
      clearSession();

      showAlert({
        type: "warning",
        title: "Sesión expirada",
        message: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
      }).then((result) => {
        if (result.isConfirmed || result.isDismissed) {
          window.location.href = "../login/login.html";
        }
      });
    }

    // Error de servidor (500+)
    else if (status >= 500) {
      showAlert({
        type: "error",
        title: "Error del servidor",
        message: data?.detail || "Ocurrió un problema en el servidor. Intenta más tarde.",
      });
    }

    // Error de cliente (400-499)
    else if (status >= 400) {
      let errorMessage = data?.detail || data?.message || "Verifica los datos enviados.";
      
      // Si es un error de validación (422), mostrar más detalles
      if (status === 422 && data?.detail) {
        console.error("❌ Error de validación 422:", data.detail);
        
        // Formatear errores de validación de Pydantic
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map(err => {
            const field = err.loc?.join('.') || 'campo desconocido';
            return `${field}: ${err.msg}`;
          }).join('\n');
        }
      }
      
      showAlert({
        type: "error",
        title: status === 422 ? "Error de validación" : "Error en la solicitud",
        message: errorMessage,
      });
    }

    return Promise.reject(error);
  }
);

// ======================================================
// Función auxiliar para verificar autenticación
// ======================================================

export function isAuthenticated() {
  const token = localStorage.getItem("token");
  return isValidToken(token);
}

// ======================================================
// Función para verificar sesión al cargar página
// ======================================================

export function checkSession() {
  const token = localStorage.getItem("token");
  
  if (!isValidToken(token)) {
    clearSession();
    
    // Solo redirigir si no estamos ya en la página de login
    if (!window.location.pathname.includes('login.html')) {
      showAlert({
        type: "info",
        title: "Sesión no válida",
        message: "Por favor, inicia sesión para continuar.",
      }).then(() => {
        window.location.href = "../login/login.html";
      });
    }
  }
}

// ======================================================
// Exportar instancia y funciones auxiliares
// ======================================================

export default api;