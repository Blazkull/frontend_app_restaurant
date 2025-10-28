import api from "../api/api.js";

document.addEventListener("DOMContentLoaded", () => {
  fetchOrdersDetails();
});

// ======================================================
// 🔹 Obtener pedidos con detalles desde la API
// ======================================================
async function fetchOrdersDetails() {
  const ordersContainer = document.getElementById("ordersContainer");
  ordersContainer.innerHTML = `
    <div class="flex justify-center items-center py-10">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span class="ml-3 text-gray-600 font-medium">Cargando pedidos...</span>
    </div>
  `;

  try {
    const token = localStorage.getItem("token"); // JWT guardado tras login
    const response = await api.get(`/orders-details`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const orders = response.data; // según tu ejemplo no hay "data"
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

// ======================================================
// 🎨 Estilos según estado (id_status)
// ======================================================
const estadoMap = {
  1: { label: "Pendiente", color: "text-gray-600 bg-gray-100", border: "border-gray-300", icon: "../svg/clock.svg" },
  2: { label: "Preparación", color: "text-blue-600 bg-blue-100", border: "border-blue-400", icon: "../svg/cart-moving-blue.svg" },
  7: { label: "Producción", color: "text-orange-600 bg-orange-100", border: "border-orange-400", icon: "../svg/cart-moving-yellow.svg" },
  8: { label: "Listo", color: "text-green-600 bg-green-100", border: "border-green-400", icon: "../svg/cart-moving-green.svg" },
  9: { label: "Entregado", color: "text-emerald-600 bg-emerald-100", border: "border-emerald-400", icon: "../svg/cart-moving-green.svg" },
  10: { label: "Cancelado", color: "text-red-600 bg-red-100", border: "border-red-400", icon: "../svg/close_red.svg" },
  13: { label: "Facturado", color: "text-green-600 bg-green-100", border: "border-green-700", icon: "../svg/money_green.svg" },
};

// ======================================================
// 🧾 Renderizar los pedidos dinámicamente
// ======================================================
function renderOrders(orders) {
  const ordersContainer = document.getElementById("ordersContainer");
  ordersContainer.innerHTML = "";

  if (!orders.length) {
    ordersContainer.innerHTML = `
      <div class="text-center text-gray-500 font-medium py-10">
        No hay pedidos registrados.
      </div>
    `;
    return;
  }

  orders.forEach(order => {
    const estadoData = estadoMap[order.id_status] || estadoMap[1]; // por defecto Pendiente
    const createdDate = new Date(order.created_at);
    const fecha = createdDate.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });
    const hora = createdDate.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

    const productosHTML = (order.items || []).length > 0
      ? order.items.map(item => `
          <li class="flex justify-between text-sm text-gray-700">
            <span>${item.quantity}x ${item.menu_name}</span>
            <span class="text-gray-500">$${item.subtotal.toFixed(2)}</span>
          </li>
          ${item.note ? `<p class="text-xs text-gray-500 italic pl-2">Nota: ${item.note}</p>` : ""}
        `).join("")
      : `<li class="text-gray-400 text-sm">Sin productos</li>`;

    const card = document.createElement("div");
    card.className = `border rounded-xl p-4 bg-white shadow-sm hover:shadow-lg transition duration-200 ${estadoData.border}`;

    card.innerHTML = `
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <div class="${estadoData.color.split(" ")[1]} p-3 rounded-xl">
            <img src="${estadoData.icon}" alt="icon" class="w-5 h-5 ${estadoData.color.split(" ")[0]}">
          </div>
          <div>
            <h2 class="font-bold text-lg">Pedido #${order.order_id}</h2>
            <p class="text-gray-600 text-sm">Mesa ${order.id_table || "-"}</p>
            <p class="text-gray-500 text-sm">${fecha} • ${hora}</p>
          </div>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-semibold ${estadoData.color}">
          ${estadoData.label}
        </span>
      </div>

      <div class="mt-4 border-t border-gray-100 pt-4">
        <h3 class="font-semibold text-gray-700">Productos:</h3>
        <ul class="mt-2 space-y-1 max-h-40 overflow-y-auto pr-2 scroll-thin">
          ${productosHTML}
        </ul>
      </div>
    `;

    ordersContainer.appendChild(card);
  });

  lucide.createIcons();
}
