// Configuración de la API


//Detectar entorno (usa solo el backend en la nube si el local no está activo)
const isBackendLocal = false; //cambiar a true si se va a usar el backend local
const API_URL_LOCAL = "http://127.0.0.1:8000";
const API_URL_PROD = "https://backend-app-restaurant-2kfa.onrender.com";

const API_URL = isBackendLocal ? API_URL_LOCAL : API_URL_PROD;


// Crear instancia de Axios
const api = axios.create({
  baseURL: `${API_URL}/api`,
});


// Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (role) config.headers["X-User-Role"] = role;

  return config;
});


// Exportar instancia para usar en otros archivos
export default api;
