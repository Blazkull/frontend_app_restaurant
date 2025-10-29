// facturas_vista.js
import api from "../api/api.js";

const tableBody = document.getElementById("invoices-table-body");
const searchInput = document.getElementById("search-input");

document.addEventListener("DOMContentLoaded", initializeInvoices);

// =========================================================
// INICIALIZACIÓN
// =========================================================
async function initializeInvoices() {
  console.log("🧾 Cargando facturas...");
  await fetchInvoices();

  // Buscar por texto
  searchInput?.addEventListener("input", debounce(fetchInvoices, 500));

  // Filtros rápidos
  document.querySelectorAll("[data-filter]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll("[data-filter]").forEach(b => b.classList.remove("border-primary-blue", "text-primary-blue"));
      e.currentTarget.classList.add("border-primary-blue", "text-primary-blue");
      fetchInvoices();
    });
  });
}

// =========================================================
// OBTENER FACTURAS
// =========================================================
async function fetchInvoices() {
  try {
    const filter = document.querySelector("[data-filter].text-primary-blue")?.dataset.filter;
    const query = searchInput?.value?.trim() || "";
    const params = { limit: 50, offset: 0 };

    const response = await api.get("/invoices", { params });
    const invoices = Array.isArray(response.data) ? response.data : [];

    renderInvoices(
      invoices.filter(inv => {
        if (!query) return true;
        return (
          String(inv.id).includes(query) ||
          String(inv.id_order).includes(query) ||
          String(inv.total).includes(query)
        );
      })
    );
  } catch (error) {
    console.error("❌ Error al obtener facturas:", error);
    Swal.fire("Error", "No se pudieron cargar las facturas.", "error");
  }
}

// =========================================================
// RENDER DE TABLA
// =========================================================
function renderInvoices(invoices) {
  tableBody.innerHTML = "";

  if (!invoices.length) {
    tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-gray-400 py-6">No hay facturas disponibles</td></tr>`;
    return;
  }

  invoices.forEach(inv => {
    const status = mapStatus(inv.id_status);
    const created = formatDate(inv.created_at);

    const row = document.createElement("tr");
    row.className = "border-b hover:bg-gray-50 transition";
    row.innerHTML = `
      <td class="p-3 text-center"><input type="checkbox" /></td>
      <td class="p-3 font-medium text-gray-700">#${inv.id}</td>
      <td class="p-3 text-gray-600">${inv.id_order || "-"}</td>
      <td class="p-3 text-gray-600">${inv.id_client || "-"}</td>
      <td class="p-3 text-gray-600">${created}</td>
      <td class="p-3 text-gray-800 font-semibold">$${(inv.total || 0).toLocaleString()}</td>
      <td class="p-3">
        <span class="px-2 py-1 rounded-full text-xs font-semibold ${status.class}">
          ${status.text}
        </span>
      </td>
      <td class="p-3 flex gap-2">
        <button class="edit-btn text-blue-600 hover:text-blue-800" data-id="${inv.id}">
          <i data-lucide="pencil"></i>
        </button>
        <button class="delete-btn text-red-600 hover:text-red-800" data-id="${inv.id}">
          <i data-lucide="trash-2"></i>
        </button>
        <button class="annul-btn text-yellow-600 hover:text-yellow-800" data-id="${inv.id}">
          <i data-lucide="x-circle"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  if (window.lucide) lucide.createIcons();
  attachActionHandlers();
}

// =========================================================
// BOTONES DE ACCIÓN
// =========================================================
function attachActionHandlers() {
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => handleEditInvoice(btn.dataset.id));
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => handleDeleteInvoice(btn.dataset.id));
  });

  document.querySelectorAll(".annul-btn").forEach(btn => {
    btn.addEventListener("click", () => handleAnnulInvoice(btn.dataset.id));
  });
}

// =========================================================
// EDITAR FACTURA
// =========================================================
async function handleEditInvoice(id) {
  const { value: total } = await Swal.fire({
    title: `Editar factura #${id}`,
    input: "number",
    inputLabel: "Nuevo total",
    inputPlaceholder: "Ingrese el nuevo total",
    showCancelButton: true,
    confirmButtonText: "Actualizar",
  });

  if (!total) return;

  try {
    await api.patch(`/invoices/${id}`, { total: parseFloat(total) });
    Swal.fire("Actualizado", `Factura #${id} actualizada.`, "success");
    fetchInvoices();
  } catch (error) {
    Swal.fire("Error", "No se pudo actualizar la factura.", "error");
  }
}

// =========================================================
// ANULAR FACTURA
// =========================================================
async function handleAnnulInvoice(id) {
  const { value: reason } = await Swal.fire({
    title: `Anular factura #${id}`,
    input: "text",
    inputLabel: "Motivo de anulación",
    inputPlaceholder: "Escribe el motivo...",
    showCancelButton: true,
    confirmButtonText: "Anular",
  });

  if (!reason) return;

  try {
    await api.patch(`/invoices/${id}/annul`, { annulment_reason: reason });
    Swal.fire("Anulada", `Factura #${id} fue anulada.`, "success");
    fetchInvoices();
  } catch (error) {
    Swal.fire("Error", "No se pudo anular la factura.", "error");
  }
}

// =========================================================
// ELIMINAR FACTURA
// =========================================================
async function handleDeleteInvoice(id) {
  const result = await Swal.fire({
    title: "¿Eliminar factura?",
    text: `Esta acción no se puede deshacer.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#aaa",
    confirmButtonText: "Eliminar",
  });

  if (!result.isConfirmed) return;

  try {
    await api.delete(`/invoices/${id}`);
    Swal.fire("Eliminada", "Factura eliminada con éxito.", "success");
    fetchInvoices();
  } catch (error) {
    Swal.fire("Error", "No se pudo eliminar la factura.", "error");
  }
}

// =========================================================
// UTILIDADES
// =========================================================
function formatDate(date) {
  if (!date) return "—";
  const d = new Date(date);
  return isNaN(d) ? "—" : d.toLocaleString("es-CO", { hour12: false });
}

function mapStatus(id_status) {
  const map = {
    1: { text: "Borrador", class: "bg-gray-100 text-gray-600" },
    2: { text: "Pendiente", class: "bg-orange-100 text-orange-600" },
    3: { text: "Pagada", class: "bg-green-100 text-green-700" },
    4: { text: "Anulada", class: "bg-red-100 text-red-600" },
  };
  return map[id_status] || { text: "Desconocido", class: "bg-gray-200 text-gray-500" };
}

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
