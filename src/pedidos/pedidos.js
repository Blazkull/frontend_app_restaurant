import api from "../api/api.js";

document.addEventListener("DOMContentLoaded", () => {
  fetchOrders();
});

// Obtener pedidos desde la API
async function fetchOrders() {
  const ordersContainer = document.getElementById("ordersContainer");
  ordersContainer.innerHTML = `
    <div class="flex justify-center items-center py-10">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span class="ml-3 text-gray-600 font-medium">Cargando pedidos...</span>
    </div>
  `;

  try {
    const token = localStorage.getItem("token"); // JWT guardado tras el login
    const response = await api.get(`/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const orders = response.data;
    renderOrders(orders);

  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    ordersContainer.innerHTML = `
      <div class="flex justify-center items-center text-center text-red-600 font-semibold py-10">
        Error al cargar los pedidos.
      </div>
    `;
  }
}

// Estilos por estado
const estadoStyles = {
  "Listo": "bg-green-100 text-green-600",
  "Preparación": "bg-blue-100 text-blue-600",
  "Producción": "bg-orange-100 text-orange-600",
};

const cardBorderStyles = {
  "Listo": "border-green-400",
  "Preparación": "border-blue-400",
  "Producción": "border-orange-400",
};

const iconStyles = {
  "Listo": {
    bg: "bg-green-100",
    text: "text-green-600",
    icon: "../svg/cart-moving-green.svg",
  },
  "Preparación": {
    bg: "bg-blue-100",
    text: "text-blue-600",
    icon: "../svg/cart-moving-blue.svg",
  },
  "Producción": {
    bg: "bg-orange-100",
    text: "text-orange-600",
    icon: "../svg/cart-moving-yellow.svg",
  },
};

// Renderizar las órdenes dinámicamente
function renderOrders(orders) {
  const ordersContainer = document.getElementById("ordersContainer");
  ordersContainer.innerHTML = "";

  if (!orders.length) {
    ordersContainer.innerHTML = `
      <div class="text-center text-gray-500 font-medium py-10">
        No hay pedidos disponibles.
      </div>
    `;
    return;
  }

  orders.forEach(order => {
    const estado = order.estado || "Pendiente";
    const cardBorderClass = cardBorderStyles[estado] || "border-gray-300";
    const iconStyle = iconStyles[estado] || { bg: "bg-gray-100", text: "text-gray-600", icon: "../svg/cart-moving-gray.svg" };

    const productosHTML = (order.productos || []).map(p => `
      <li>${p.cantidad}x ${p.nombre}</li>
    `).join("") || `<li>No hay productos registrados.</li>`;

    const card = document.createElement("div");
    card.className = `border rounded-xl p-4 bg-white shadow-sm hover:shadow-lg transition duration-200 ${cardBorderClass}`;

    card.innerHTML = `
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <div class="${iconStyle.bg} p-3 rounded-xl">
            <img src="${iconStyle.icon}" alt="icon" class="w-5 h-5 ${iconStyle.text}">
          </div>
          <div>
            <h2 class="font-bold text-lg">Pedido #${order.id}</h2>
            <p class="text-gray-600 text-sm">Mesa ${order.mesa || "-"}</p>
            <p class="text-gray-500 text-sm">${order.hora || "Sin hora"}</p>
          </div>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-semibold ${estadoStyles[estado]}">
          ${estado}
        </span>
      </div>

      <div class="mt-4 border-t border-gray-100 pt-4">
        <h3 class="font-semibold text-gray-700">Productos:</h3>
        <ul class="text-sm text-gray-600 mt-2 list-none space-y-1 max-h-40 overflow-y-auto pr-2 scroll-thin">
          ${productosHTML}
        </ul>
      </div>
    `;

    ordersContainer.appendChild(card);
  });

  lucide.createIcons();
}
