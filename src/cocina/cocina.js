// cocina.js - Panel de Cocina con barra de progreso y control de tiempos

let api = null;
const activeTimers = {};

async function initializeAPI() {
  const apiModule = await import("../api/api.js");
  api = apiModule.default;
  console.log("✅ API lista:", api.defaults.baseURL);
  await fetchOrders();
  setInterval(fetchOrders, 30000);
}

// =========================================================
// OBTENER PEDIDOS
// =========================================================
async function fetchOrders() {
  try {
    const response = await api.get("/kitchen/orders/");
    const ordersGrouped = response.data.data || response.data;
    renderPedidos(ordersGrouped);
  } catch (error) {
    console.error("❌ Error al obtener pedidos:", error);
  }
}

// =========================================================
// RENDERIZAR PEDIDOS
// =========================================================
function renderPedidos(ordersGrouped) {
  const pendientes = document.getElementById("pendientes");
  const preparacion = document.getElementById("preparacion");
  const listos = document.getElementById("listos");

  pendientes.innerHTML = "";
  preparacion.innerHTML = "";
  listos.innerHTML = "";

  const pendientesArray = ordersGrouped["Pendiente"] || [];
  const preparacionArray = ordersGrouped["Preparación"] || [];
  const listosArray = ordersGrouped["Listo"] || [];

  updateCounters(pendientesArray.length, preparacionArray.length, listosArray.length);

  pendientesArray.forEach(order => pendientes.appendChild(createOrderCard(order, "pendiente")));
  preparacionArray.forEach(order => preparacion.appendChild(createOrderCard(order, "preparacion")));
  listosArray.forEach(order => listos.appendChild(createOrderCard(order, "listo")));

  if (window.lucide) lucide.createIcons();
}

// =========================================================
// TARJETA DE PEDIDO + BARRA DE PROGRESO
// =========================================================
function createOrderCard(order, estado) {
  const card = document.createElement("div");
  card.className = "p-4 border rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow";

  const hora = formatearHora(order.created_at);
  const tiempo = Number(order.remaining_time || order.estimated_time || 0);

  const progressBar = `
    <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
      <div id="bar-${order.order_id}" class="bg-blue-500 h-2 rounded-full transition-all duration-1000" style="width:${(tiempo / (order.estimated_time || tiempo || 1)) * 100}%;"></div>
    </div>
  `;

  let botonesHTML = "";
  if (estado === "pendiente") {
    botonesHTML = `
      <button data-order-id="${order.order_id}" data-action="next"
        class="btn-cambiar-estado w-full mt-3 bg-orange-500 text-white rounded-xl py-2 hover:bg-orange-600 transition">
        Iniciar preparación
      </button>`;
  } else if (estado === "preparacion") {
    botonesHTML = `
      <div class="mt-3 flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-700">Tiempo restante:</span>
          <span id="tiempo-${order.order_id}" class="text-blue-600 font-bold">${tiempo} min</span>
        </div>
        ${progressBar}
        <div class="flex justify-between mt-2">
          <button class="ajustar-tiempo bg-gray-200 px-2 py-1 rounded-lg" data-id="${order.order_id}" data-change="-5">-5</button>
          <button class="ajustar-tiempo bg-gray-200 px-2 py-1 rounded-lg" data-id="${order.order_id}" data-change="5">+5</button>
        </div>
        <button data-order-id="${order.order_id}" data-action="next"
          class="btn-cambiar-estado w-full bg-blue-500 text-white rounded-xl py-2 hover:bg-blue-600 transition">
          Marcar listo
        </button>
      </div>`;
  } else if (estado === "listo") {
    botonesHTML = `
      <button data-order-id="${order.order_id}" data-action="next"
        class="btn-cambiar-estado w-full mt-3 bg-green-500 text-white rounded-xl py-2 hover:bg-green-600 transition">
        Marcar entregado
      </button>`;
  }

  card.innerHTML = `
    <div class="flex justify-between items-start">
      <h3 class="font-bold text-lg">${order.order_number || "—"}</h3>
      <span class="text-xs text-gray-500">${hora}</span>
    </div>
    <p class="text-sm text-gray-600 mb-2">Mesa ${order.table || "—"}</p>
    <ul class="bg-gray-50 rounded-lg p-2 mb-2">
      ${(order.items || [])
        .map(
          (item) => `
        <li class="text-sm text-gray-800">
          ${item.quantity}x ${item.menu_item}
          ${item.note ? `<p class="text-xs text-gray-400 italic">${item.note}</p>` : ""}
        </li>`
        )
        .join("")}
    </ul>
    ${botonesHTML}
  `;

  // Eventos
  card.querySelectorAll(".btn-cambiar-estado").forEach((b) =>
    b.addEventListener("click", handleStatusChange)
  );
  card.querySelectorAll(".ajustar-tiempo").forEach((b) =>
    b.addEventListener("click", handleTimeAdjust)
  );

  if (estado === "preparacion") startTimer(order.order_id, tiempo, order.estimated_time);

  return card;
}

// =========================================================
// TEMPORIZADOR CON BARRA DE PROGRESO
// =========================================================
function startTimer(orderId, minutosIniciales, total) {
  clearInterval(activeTimers[orderId]);
  let minutos = minutosIniciales;
  const display = document.getElementById(`tiempo-${orderId}`);
  const bar = document.getElementById(`bar-${orderId}`);
  if (!display || !bar) return;

  const totalMin = total || minutosIniciales || 1;

  activeTimers[orderId] = setInterval(() => {
    minutos = Math.max(0, minutos - 1);
    const progress = Math.max(0, (minutos / totalMin) * 100);

    display.textContent = `${minutos} min`;
    bar.style.width = `${progress}%`;

    if (minutos <= 0) {
      bar.classList.replace("bg-blue-500", "bg-red-500");
      clearInterval(activeTimers[orderId]);
    }
  }, 60000);
}

// =========================================================
// CAMBIO DE ESTADO
// =========================================================
async function handleStatusChange(event) {
  const btn = event.currentTarget;
  const orderId = btn.dataset.orderId;
  const action = btn.dataset.action;
  btn.disabled = true;

  try {
    const endpoint = action === "next"
      ? `/kitchen/orders/${orderId}/next-status`
      : `/kitchen/orders/${orderId}/previous-status`;

    await api.patch(endpoint);
    await fetchOrders();
  } catch (error) {
    console.error("Error al actualizar estado:", error);
  } finally {
    btn.disabled = false;
  }
}

// =========================================================
// AJUSTAR TIEMPO
// =========================================================
async function handleTimeAdjust(e) {
  const btn = e.currentTarget;
  const id = btn.dataset.id;
  const delta = parseInt(btn.dataset.change);
  const display = document.getElementById(`tiempo-${id}`);
  if (!display) return;

  let current = parseInt(display.textContent);
  current = Math.max(0, current + delta);
  display.textContent = `${current} min`;

  try {
    await api.patch(`/kitchen/orders/${id}/time`, { remaining_time: current });
  } catch (err) {
    console.error("❌ Error al actualizar tiempo:", err);
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

function formatearHora(fecha) {
  if (!fecha) return "—";
  const d = new Date(fecha);
  return isNaN(d) ? "—" : d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

// =========================================================
document.addEventListener("DOMContentLoaded", initializeAPI);
