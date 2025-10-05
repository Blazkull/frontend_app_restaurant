import api from "../api/api.js";

document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Por favor ingrese usuario y contraseña.");
    return;
  }

  try {
    const response = await api.post(`/auth/login`, {
      username,
      password
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = response.data;

    // Guardar token y rol
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("role", data.role_name);
    
    // Redirigir al dashboard
    window.location.href = "../dashboard/dashboard.html";

  } catch (error) {
    if (error.response) {
      console.error("Error en respuesta:", error.response.data);
      alert("Credenciales incorrectas o usuario no válido.");
    } else {
      console.error("Error de conexión:", error.message);
      alert("No se pudo conectar con el servidor.");
    }
  }
});
