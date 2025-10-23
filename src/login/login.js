import api from "../api/api.js";
import showAlert from "../components/alerts.js";

document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    showAlert({
      title: "Campos vacíos",
      message: "Por favor ingrese usuario y contraseña.",
      type: "info",
    });
    return;
  }

  // Mostrar loading
  const loadingAlert = Swal.fire({
    title: "Iniciando sesión...",
    text: "Por favor espera...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    // 1. Hacer login
    const response = await api.post(`/auth/login`, { username, password }, {
      headers: { "Content-Type": "application/json" }
    });

    const data = response.data;

    // 2. Guardar token y rol PRIMERO (necesarios para las siguientes peticiones)
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("role", data.role_name);
    localStorage.setItem("username", username);

    // 3. Intentar obtener el user_id desde el backend
    try {
      // Opción A: Si tu backend tiene un endpoint /auth/me o /users/me
      const userResponse = await api.get("/auth/me");
      const userId = userResponse.data?.id || userResponse.data?.user_id;
      
      if (userId) {
        localStorage.setItem("user_id", userId);
        console.log("✅ User ID obtenido:", userId);
      }
    } catch (userError) {
      console.warn("⚠️ No se pudo obtener user_id desde /auth/me");
      
      // Opción B: Intentar desde /users/current
      try {
        const userResponse2 = await api.get("/users/current");
        const userId = userResponse2.data?.id || userResponse2.data?.user_id;
        
        if (userId) {
          localStorage.setItem("user_id", userId);
          console.log("✅ User ID obtenido desde /users/current:", userId);
        }
      } catch (error2) {
        console.warn("⚠️ No se pudo obtener user_id. Usando ID por defecto.");
        
        // Opción C: Usar un ID temporal basado en el username
        // En producción, esto debe venir del backend
        localStorage.setItem("user_id", "1"); // Valor por defecto
      }
    }

    Swal.close();

    // 4. Mostrar mensaje de éxito
    await showAlert({
      title: "¡Bienvenido!",
      message: `Inicio de sesión exitoso como ${data.role_name}`,
      type: "success",
      timer: 1500,
    });

    // 5. Redirigir según el rol
    if (data.role_name === "waiter" || data.role_name === "mesero") {
      window.location.href = "../src/menu/menu.html";
    } else if (data.role_name === "admin" || data.role_name === "administrador") {
      window.location.href = "../usuarios/usuarios.html";
    } else {
      // Rol por defecto
      window.location.href = "../usuarios/usuarios.html";
    }

  } catch (error) {
    Swal.close();
    
    if (error.response) {
      console.error("Error en respuesta:", error.response.data);
      
      const errorMessage = error.response.data?.detail || 
                          error.response.data?.message || 
                          "Credenciales incorrectas o usuario no válido.";
      
      showAlert({
        title: "Error de autenticación",
        message: errorMessage,
        type: "error",
      });
    } else {
      console.error("Error de conexión:", error.message);
      showAlert({
        title: "Error de conexión",
        message: "No se pudo conectar con el servidor. Verifica tu conexión o inténtalo más tarde.",
        type: "error",
      });
    }
  }
});