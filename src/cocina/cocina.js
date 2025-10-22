// static/js/cocina.js

// ==============================
// ⚙️ Configuración de Axios
// ==============================
const API_BASE_URL = "https://backend-app-restaurant-2kfa.onrender.com/api/kitchen/orders/";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==============================
// 🚀 Inicialización
// ==============================
document.addEventListener("DOMContentLoaded", async () => {
  createToastContainer();
  await loadOrders();
});

// ==============================
// 📦 Cargar órdenes
// ==============================
async function loadOrders() {
  try {
    const { data: orders } = await api.get("/api/kitchen/orders/");
    renderOrders(orders);
  } catch (error) {
    console.error("❌ Error cargando órdenes:", error);
    showToast("Error al cargar las órdenes", "error");
  }
}

// ==============================
// 🧩 Renderizado de órdenes
// ==============================
function renderOrders(orders) {
  const pendientes = document.getElementById("pendientes");
  const preparacion = document.getElementById("preparacion");
  const listos = document.getElementById("listos");

  // Limpiar columnas
  pendientes.innerHTML = "";
  preparacion.innerHTML = "";
  listos.innerHTML = "";

  // Contadores
  let countPendientes = 0;
  let countPreparacion = 0;
  let countListos = 0;

  orders.forEach(order => {
    const card = createOrderCard(order);

    switch (order.status) {
      case "pendiente":
        pendientes.appendChild(card);
        countPendientes++;
        break;
      case "en_preparacion":
        preparacion.appendChild(card);
        countPreparacion++;
        break;
      case "listo":
        listos.appendChild(card);
        countListos++;
        break;
    }
  });

  // Actualizar contadores
  document.getElementById("count-pendientes").textContent = countPendientes;
  document.getElementById("count-preparacion").textContent = countPreparacion;
  document.getElementById("count-listos").textContent = countListos;
}

// ==============================
// 🧱 Crear tarjeta de orden
// ==============================
function createOrderCard(order) {
  const div = document.createElement("div");
  div.className =
    "p-4 border rounded-lg shadow-sm bg-gray-50 hover:bg-gray-100 transition duration-200 transform hover:scale-[1.01]";

  const colorClass = {
    pendiente: "border-orange-400",
    en_preparacion: "border-blue-400",
    listo: "border-green-400",
  }[order.status] || "border-gray-300";

  div.classList.add(colorClass);

  div.innerHTML = `
    <div class="flex justify-between items-start">
      <div>
        <h3 class="font-bold text-gray-800">Orden #${order.id}</h3>
        <p class="text-sm text-gray-500">${order.customer_name || "Cliente no especificado"}</p>
        <ul class="text-xs text-gray-600 mt-2 list-disc ml-4">
          ${(order.items || [])
            .map(item => `<li>${item.name} x${item.quantity}</li>`)
            .join("")}
        </ul>
      </div>

      <div class="flex flex-col gap-1">
        <button 
          class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm transition" 
          onclick="updateOrderStatus(${order.id}, 'previous')">
          ⏪
        </button>
        <button 
          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition" 
          onclick="updateOrderStatus(${order.id}, 'next')">
          ⏩
        </button>
      </div>
    </div>

    <div class="mt-3 text-xs text-gray-500 italic">
      Estado actual: <span class="font-semibold capitalize">${order.status.replace("_", " ")}</span>
    </div>
  `;

  return div;
}

// ==============================
// 🔄 Cambiar estado de orden
// ==============================
async function updateOrderStatus(orderId, action) {
  const endpoint =
    action === "next"
      ? `${orderId}/next-status`
      : `${orderId}/previous-status`;

  try {
    const { data: updated } = await api.post(endpoint);
    showToast(`Orden #${orderId} pasó a "${updated.status.replace("_", " ")}"`, "success");
    await loadOrders();
  } catch (error) {
    console.error("❌ Error actualizando orden:", error);
    showToast("No se pudo actualizar la orden", "error");
  }
}

// ==============================
// 🔔 Sistema de notificaciones
// ==============================
function createToastContainer() {
  if (document.getElementById("toast-container")) return;
  const container = document.createElement("div");
  container.id = "toast-container";
  container.className = "fixed top-5 right-5 flex flex-col gap-3 z-[9999]";
  document.body.appendChild(container);
}

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");

  const baseClasses =
    "px-4 py-2 rounded-lg shadow-lg text-white font-medium text-sm flex items-center gap-2 transform transition-all duration-300 opacity-0 translate-y-2";

  const typeClasses = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }[type];

  toast.className = `${baseClasses} ${typeClasses}`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  // Animar entrada
  setTimeout(() => {
    toast.classList.remove("opacity-0", "translate-y-2");
    toast.classList.add("opacity-100", "translate-y-0");
  }, 100);

  // Eliminar después de 3 segundos
  setTimeout(() => {
    toast.classList.remove("opacity-100", "translate-y-0");
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
