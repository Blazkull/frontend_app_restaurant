// pedidos.js - completo y adaptado al HTML Tailwind que compartiste
import api from "../api/api.js";

document.addEventListener("DOMContentLoaded", () => {
  // cargar pedidos iniciales
  fetchOrdersAndUsers();

  // inicializar handlers del modal y botones
  initCreateOrderUI();
  initStatusModal(); // 🆕 Nuevo: inicializa modal de cambio de estado
});

/* ===========================
   FETCH Y RENDER DE PEDIDOS
   =========================== */
async function fetchOrdersAndUsers() {
  const ordersContainer = document.getElementById("ordersContainer");
  if (!ordersContainer) return;

  ordersContainer.innerHTML = `
    <div class="flex justify-center items-center py-10 col-span-full">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span class="ml-3 text-gray-600 font-medium">Cargando pedidos...</span>
    </div>
  `;

  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Obtener usuarios y pedidos (paralelo)
    const [usersRes, ordersRes] = await Promise.all([
      api.get("/users", { headers }),
      api.get("/orders", { headers }),
    ]);

    const users = usersRes?.data?.items || usersRes?.data?.data || usersRes?.data || [];
    const orders = ordersRes?.data?.items || ordersRes?.data?.data || ordersRes?.data || [];

    // construir mapa de usuarios
    const userMap = {};
    users.forEach(u => {
      const name = u.name || u.full_name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.username || `Usuario #${u.id}`;
      userMap[u.id] = name;
    });

    renderOrders(orders, userMap);
  } catch (err) {
    console.error("Error cargando pedidos/usuarios:", err);
    ordersContainer.innerHTML = `
      <div class="text-center text-red-600 font-semibold py-10">Error al cargar los pedidos.</div>
    `;
  }
}

const estadoMap = {
  1: { label: "Pendiente", color: "text-gray-600 bg-gray-100", border: "border-gray-300", icon: "../svg/clock.svg" },
  2: { label: "Preparación", color: "text-blue-600 bg-blue-100", border: "border-blue-400", icon: "../svg/cart-moving-blue.svg" },
  7: { label: "Producción", color: "text-orange-600 bg-orange-100", border: "border-orange-400", icon: "../svg/cart-moving-yellow.svg" },
  8: { label: "Listo", color: "text-green-600 bg-green-100", border: "border-green-400", icon: "../svg/cart-moving-green.svg" },
  9: { label: "Entregado", color: "text-emerald-600 bg-emerald-100", border: "border-emerald-400", icon: "../svg/cart-moving-green.svg" },
  10:{ label: "Cancelado", color: "text-red-600 bg-red-100", border: "border-red-400", icon: "../svg/close_red.svg" },
  13:{ label: "Facturado", color: "text-green-600 bg-green-100", border: "border-green-700", icon: "../svg/money_green.svg" },
};

function renderOrders(orders, userMap = {}) {
  const ordersContainer = document.getElementById("ordersContainer");
  if (!ordersContainer) return;

  if (!Array.isArray(orders) || orders.length === 0) {
    ordersContainer.innerHTML = `
      <div class="text-center text-gray-500 font-medium py-10 col-span-full">No hay pedidos registrados.</div>
    `;
    return;
  }

  ordersContainer.innerHTML = ""; // limpiar

  orders.forEach(order => {
    const estadoData = estadoMap[order.id_status] || estadoMap[1];
    const createdDate = new Date(order.created_at);
    const fecha = createdDate.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });
    const hora = createdDate.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    const userName = userMap[order.id_user_created] || `Usuario #${order.id_user_created}`;

    const card = document.createElement("div");
    card.className = `order-card border rounded-xl p-4 bg-white shadow-sm hover:shadow-lg transition duration-200 cursor-pointer ${estadoData.border}`;
    card.dataset.orderId = order.id;
    card.dataset.statusId = order.id_status;

    card.innerHTML = `
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <div class="${estadoData.color.split(" ")[1]} p-3 rounded-xl">
            <img src="${estadoData.icon}" alt="icon" class="w-5 h-5 ${estadoData.color.split(" ")[0]}">
          </div>
          <div>
            <h3 class="font-bold text-lg">Pedido #${order.id}</h3>
            <p class="text-gray-600 text-sm">Mesa ${order.id_table || "-"}</p>
            <p class="text-gray-500 text-sm">${fecha} • ${hora}</p>
          </div>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-semibold ${estadoData.color}">${estadoData.label}</span>
      </div>

      <div class="mt-4 border-t border-gray-100 pt-4">
        <h4 class="font-semibold text-gray-700">Resumen:</h4>
        <ul class="mt-2 space-y-1">
          <li class="flex justify-between text-sm text-gray-700">
            <span class="font-medium text-gray-600">Valor total:</span>
            <span class="font-semibold text-gray-800">$${Number(order.total_value || 0).toFixed(2)}</span>
          </li>
          <li class="text-xs text-gray-500 italic">Creado por: ${userName}</li>
        </ul>
      </div>
    `;

    // 🆕 Evento para abrir modal de cambio de estado
    card.addEventListener("click", () => openStatusModal(order.id, order.id_status));

    ordersContainer.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

/* ===========================
   MODAL + CREAR PEDIDO
   =========================== */
function initCreateOrderUI() {
  const newOrderBtn = document.getElementById("newOrderBtn");
  const modal = document.getElementById("createOrderModal");
  const closeBtn = document.getElementById("closeModalBtn");
  const cancelBtn = document.getElementById("cancelOrderBtn");
  const form = document.getElementById("createOrderForm");
  const orderTable = document.getElementById("orderTable");
  const orderUser = document.getElementById("orderUser");
  const orderStatus = document.getElementById("orderStatus");
  const itemsBody = document.getElementById("itemsTableBody");
  const addItemBtn = document.getElementById("addItemBtn");
  const orderTotal = document.getElementById("orderTotal");

  if (!newOrderBtn || !modal || !form) {
    console.warn("Elementos del modal no encontrados. Revisa IDs en HTML.");
    return;
  }

  newOrderBtn.addEventListener("click", async () => {
    await loadUsersTablesMenuInto(orderUser, orderTable);
    itemsBody.innerHTML = "";
    addItemRow(itemsBody);
    orderTotal.value = "";
    showModal(modal);
  });

  if (closeBtn) closeBtn.addEventListener("click", () => hideModal(modal));
  if (cancelBtn) cancelBtn.addEventListener("click", () => hideModal(modal));

  if (addItemBtn) addItemBtn.addEventListener("click", () => addItemRow(itemsBody));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const rows = Array.from(itemsBody.querySelectorAll("tr"));
      const items = [];
      for (const r of rows) {
        const sel = r.querySelector(".menu-select");
        const qty = r.querySelector(".item-qty");
        const note = r.querySelector(".item-note");
        const price = r.querySelector(".item-price");
        const id_menu_item = parseInt(sel.value);
        const quantity = parseInt(qty.value);
        const noteText = (note.value || "").trim();
        const price_at_order = parseFloat(price.value);
        if (!id_menu_item || !quantity || Number.isNaN(price_at_order)) continue;
        items.push({ id_menu_item, quantity, note: noteText, price_at_order });
      }

      if (items.length === 0) {
        alert("Agrega al menos un ítem válido al pedido.");
        return;
      }

      const payload = {
        id_table: parseInt(orderTable.value),
        id_status: parseInt(orderStatus.value),
        id_user_created: parseInt(orderUser.value),
        total_value: parseFloat(orderTotal.value) || items.reduce((s, it) => s + it.price_at_order * it.quantity, 0),
        items,
      };

      await api.post("/orders", payload, { headers });

      alert("Pedido creado correctamente ✅");
      hideModal(modal);
      form.reset();
      itemsBody.innerHTML = "";
      fetchOrdersAndUsers();
    } catch (err) {
      console.error("Error creando pedido:", err);
      const message = err?.response?.data?.message || err?.response?.data || err.message || "Error";
      alert("Error al crear pedido: " + message);
    }
  });
}

/* ===========================
   MODAL CAMBIAR ESTADO 🆕
   =========================== */
let currentOrderId = null;

function initStatusModal() {
  const modal = document.getElementById("statusModal");
  const closeBtn = document.getElementById("closeStatusModal");
  const cancelBtn = document.getElementById("cancelStatusBtn");
  const form = document.getElementById("statusForm");

  if (!modal || !form) return;

  [closeBtn, cancelBtn].forEach(btn => btn?.addEventListener("click", () => hideModal(modal)));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newStatus = parseInt(document.getElementById("statusSelect").value);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await api.patch(`/orders/${currentOrderId}/status`, { id_status: newStatus }, { headers });
      alert("Estado actualizado correctamente ✅");
      hideModal(modal);
      fetchOrdersAndUsers();
    } catch (err) {
      console.error("Error actualizando estado:", err);
      alert("Error al cambiar estado del pedido");
    }
  });
}

function openStatusModal(orderId, currentStatus) {
  currentOrderId = orderId;
  const modal = document.getElementById("statusModal");
  const select = document.getElementById("statusSelect");
  if (select) select.value = currentStatus;
  showModal(modal);
}

/* ===========================
   CARGAR USERS/TABLES/MENU
   =========================== */
async function loadUsersTablesMenuInto(userSelect, tableSelect) {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const [usersRes, tablesRes, menuRes] = await Promise.all([
      api.get("/users", { headers }),
      api.get("/tables", { headers }),
      api.get("/menu_items", { headers }),
    ]);

    const users = usersRes?.data?.items || usersRes?.data?.data || usersRes?.data || [];
    const tables = tablesRes?.data?.items || tablesRes?.data?.data || tablesRes?.data || [];
    const menuItems = menuRes?.data?.items || menuRes?.data?.data || menuRes?.data || [];

    if (userSelect) {
      userSelect.innerHTML = users
        .map(u => `<option value="${u.id}">${u.name || u.username || u.full_name || `Usuario #${u.id}`}</option>`)
        .join("");
    }
    if (tableSelect) {
      tableSelect.innerHTML = tables
        .map(t => `<option value="${t.id}">${t.name || `Mesa ${t.id}`}</option>`)
        .join("");
    }

    window.__MENU_ITEMS = menuItems;
  } catch (err) {
    console.error("Error cargando users/tables/menu:", err);
  }
}

/* ===========================
   FILAS DE ITEMS (tabla)
   =========================== */
function addItemRow(itemsBody) {
  if (!itemsBody) return;
  const menuItems = window.__MENU_ITEMS || [];
  const tr = document.createElement("tr");
  tr.className = "border-b";

  const options = menuItems.map(mi => `<option value="${mi.id}" data-price="${mi.price || 0}">${escapeHtml(mi.name || mi.id)} - $${(mi.price || 0).toFixed(2)}</option>`).join("");

  tr.innerHTML = `
    <td class="px-3 py-2">
      <select class="menu-select block w-full border rounded px-2 py-1 text-sm">${options}</select>
    </td>
    <td class="px-3 py-2">
      <input type="number" min="1" value="1" class="item-qty block w-full border rounded px-2 py-1 text-sm" />
    </td>
    <td class="px-3 py-2">
      <input type="text" class="item-note block w-full border rounded px-2 py-1 text-sm" placeholder="Nota (opcional)" />
    </td>
    <td class="px-3 py-2">
      <input type="number" min="0" step="0.01" value="0" class="item-price block w-full border rounded px-2 py-1 text-sm" />
    </td>
    <td class="px-3 py-2">
      <button type="button" class="remove-item inline-flex items-center justify-center rounded px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-sm">✕</button>
    </td>
  `;

  const sel = tr.querySelector(".menu-select");
  const qty = tr.querySelector(".item-qty");
  const price = tr.querySelector(".item-price");
  const removeBtn = tr.querySelector(".remove-item");

  sel.addEventListener("change", () => {
    const selectedOpt = sel.options[sel.selectedIndex];
    const p = parseFloat(selectedOpt?.dataset?.price || 0);
    price.value = Number.isFinite(p) ? p.toFixed(2) : "0.00";
    recalcTotal();
  });

  qty.addEventListener("input", recalcTotal);
  price.addEventListener("input", recalcTotal);

  removeBtn.addEventListener("click", () => {
    tr.remove();
    recalcTotal();
  });

  itemsBody.appendChild(tr);
  if (sel.options.length > 0) {
    const p = parseFloat(sel.options[0].dataset.price || 0);
    price.value = Number.isFinite(p) ? p.toFixed(2) : "0.00";
  }
  recalcTotal();
}

function recalcTotal() {
  const rows = Array.from(document.querySelectorAll("#itemsTableBody tr"));
  let total = 0;
  rows.forEach(r => {
    const q = parseFloat((r.querySelector(".item-qty")?.value) || 0);
    const p = parseFloat((r.querySelector(".item-price")?.value) || 0);
    if (!Number.isNaN(q) && !Number.isNaN(p)) total += q * p;
  });
  const orderTotalInput = document.getElementById("orderTotal");
  if (orderTotalInput) orderTotalInput.value = total.toFixed(2);
}

/* ===========================
   UTIL: modal show/hide
   =========================== */
function showModal(modal) {
  modal.classList.remove("hidden");
  const box = modal.querySelector(".modal-content, .bg-white") || modal.querySelector("div");
  if (box) {
    box.classList.add("scale-95", "opacity-0");
    void box.offsetWidth;
    box.classList.remove("scale-95", "opacity-0");
  }
  if (window.lucide) lucide.createIcons();
}

function hideModal(modal) {
  modal.classList.add("hidden");
}

function escapeHtml(str) {
  if (str == null) return "";
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
