// cocina.js – versión estable con /api/kitchen/orders/
let api = null;
const bc = (typeof BroadcastChannel !== "undefined") ? new BroadcastChannel("orders_channel") : null;
const LOCAL_TRIGGER_KEY = "new_order_trigger_v1";

async function initializeAPI() {
  try {
    const apiModule = await import("../api/api.js");
    api = apiModule.default;
    console.log("✅ API lista:", api.defaults.baseURL);
    await fetchOrders();
    setInterval(fetchOrders, 30000);
  } catch (err) {
    console.error("❌ Error inicializando API:", err);
  }
}

// =========================================================
// OBTENER PEDIDOS desde /api/kitchen/orders/
// =========================================================
async function fetchOrders() {
  if (!api) return;
  try {
    const response = await api.get("/kitchen/orders/");
    const data = response.data?.data || {};
    console.log("📦 Datos cocina:", data);

    renderPedidos(data);
    updateCounters(
      data.Pendiente?.length || 0,
      data["Preparación"]?.length || 0,
      data.Listo?.length || 0
    );
  } catch (error) {
    console.error("❌ Error al obtener pedidos:", error);
  }
}

// =========================================================
// RENDERIZAR PEDIDOS EN CADA COLUMNA
// =========================================================
function renderPedidos(data) {
  const pendientes = document.getElementById("pendientes");
  const preparacion = document.getElementById("preparacion");
  const listos = document.getElementById("listos");
  const entregados = document.getElementById("entregados");

  pendientes.innerHTML = "";
  preparacion.innerHTML = "";
  listos.innerHTML = "";
  if (entregados) entregados.innerHTML = "";

  (data.Pendiente || []).forEach(o => pendientes.appendChild(createOrderCard(o, "Pendiente")));
  (data["Preparación"] || []).forEach(o => preparacion.appendChild(createOrderCard(o, "Preparación")));
  (data.Listo || []).forEach(o => listos.appendChild(createOrderCard(o, "Listo")));
  (data.Entregado || []).forEach(o => entregados?.appendChild(createOrderCard(o, "Entregado")));

  if (window.lucide) lucide.createIcons();
}

// =========================================================
// TARJETA DE PEDIDO CON SUS ÍTEMS Y BOTONES DE ESTADO
// =========================================================
function createOrderCard(order, estado) {
  const card = document.createElement("div");
  card.className = "p-4 border rounded-xl shadow bg-white hover:shadow-md transition-shadow";
  
  const itemsHTML = (order.items || [])
    .map(i => `
      <li class="text-sm flex justify-between">
        <span>${i.menu_item}</span>
        <span class="text-gray-500">x${i.quantity}</span>
      </li>
      ${i.note ? `<p class="text-xs text-gray-400 italic ml-2">Nota: ${i.note}</p>` : ""}
    `)
    .join("");

  let botonesHTML = "";

  if (estado === "Pendiente") {
    botonesHTML = `
      <div class="flex gap-2 mt-3">
        <button data-id="${order.order_number}" data-action="next"
          class="w-full bg-orange-500 text-white rounded-xl py-2 hover:bg-orange-600 transition">
          Iniciar preparación
        </button>
      </div>`;
  } else if (estado === "Preparación") {
    botonesHTML = `
      <div class="flex gap-2 mt-3">
        <button data-id="${order.order_number}" data-action="prev"
          class="w-1/2 bg-gray-400 text-white rounded-xl py-2 hover:bg-gray-500 transition">
          ← Pendiente
        </button>
        <button data-id="${order.order_number}" data-action="next"
          class="w-1/2 bg-blue-500 text-white rounded-xl py-2 hover:bg-blue-600 transition">
          Listo →
        </button>
      </div>`;
  } else if (estado === "Listo") {
    botonesHTML = `
      <div class="flex gap-2 mt-3">
        <button data-id="${order.order_number}" data-action="prev"
          class="w-1/2 bg-gray-400 text-white rounded-xl py-2 hover:bg-gray-500 transition">
          ← Preparación
        </button>
        <button data-id="${order.order_number}" data-action="next"
          class="w-1/2 bg-green-500 text-white rounded-xl py-2 hover:bg-green-600 transition">
          Entregado →
        </button>
      </div>`;
  } else if (estado === "Entregado") {
    botonesHTML = `
      <div class="mt-3">
        <button data-id="${order.order_number}" data-action="prev"
          class="w-full bg-gray-500 text-white rounded-xl py-2 hover:bg-gray-600 transition">
          ← Revertir a Listo
        </button>
      </div>`;
  }

  card.innerHTML = `
    <div class="flex justify-between items-start mb-2">
      <h3 class="font-bold text-lg">${order.order_number}</h3>
      <span class="text-xs text-gray-500">${order.created_at}</span>
    </div>
    <p class="text-sm text-gray-600 mb-2">${order.table}</p>
    <ul class="mb-2">${itemsHTML}</ul>
    ${botonesHTML}
  `;

  card.querySelectorAll("button[data-action]").forEach(btn =>
    btn.addEventListener("click", handleStatusChange)
  );

  return card;
}

// =========================================================
// CAMBIO DE ESTADO (NEXT / PREVIOUS)
// =========================================================
async function handleStatusChange(e) {
  const btn = e.currentTarget;
  const action = btn.dataset.action;
  const orderId = btn.dataset.id.replace("Pedido #", "").trim();

  btn.disabled = true;
  try {
    const endpoint = action === "next"
      ? `/kitchen/orders/${orderId}/next-status`
      : `/kitchen/orders/${orderId}/previous-status`;
    await api.patch(endpoint);
    toast(`Orden #${orderId} actualizada (${action === "next" ? "avanzó" : "retrocedió"})`);
    await fetchOrders();
  } catch (err) {
    console.error("Error al cambiar estado:", err);
  } finally {
    btn.disabled = false;
  }
}

// =========================================================
// UTILIDADES
// =========================================================
function updateCounters(p, pr, l) {
  document.getElementById("count-pendientes").textContent = p;
  document.getElementById("count-preparacion").textContent = pr;
  document.getElementById("count-listos").textContent = l;
}

function toast(msg) {
  const n = document.createElement("div");
  n.className = "fixed top-4 right-4 px-4 py-2 rounded shadow z-50 bg-indigo-600 text-white";
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(() => { n.style.opacity = "0"; setTimeout(() => n.remove(), 300); }, 2000);
}

// =========================================================
// ESCUCHAR NUEVAS ÓRDENES
// =========================================================
if (bc) {
  bc.onmessage = (e) => {
    if (e.data?.type === "new_order") {
      console.log("🔔 Nuevo pedido detectado via BroadcastChannel");
      toast("Nuevo pedido recibido");
      fetchOrders();
    }
  };
}

window.addEventListener("storage", (e) => {
  if (e.key === LOCAL_TRIGGER_KEY) {
    console.log("🔔 Nuevo pedido detectado via localStorage");
    toast("Nuevo pedido recibido");
    fetchOrders();
  }
});

// =========================================================
document.addEventListener("DOMContentLoaded", initializeAPI);
