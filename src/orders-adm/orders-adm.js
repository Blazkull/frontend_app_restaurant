// ======================================================
// 📁 orders-adm.js - Carga dinámica de pedidos (sin módulos ES6)
// ======================================================
import api from "../api/api.js";
import showAlert from "../components/alerts.js";

// ======================================================
// 🎯 Referencias del DOM
// ======================================================
const tableBody = document.getElementById("ordersTableBody");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

// 🆕 Referencias para las cards
const countComplete = document.getElementById("count-complete");
const countPending = document.getElementById("count-pending");
const countCanceled = document.getElementById("count-canceled");
const countInProgress = document.getElementById("count-in-progress");

// ======================================================
// 📦 Estado global
// ======================================================
let orders = [];
let users = []; // añadimos lista de usuarios

// ======================================================
// 🚀 Cargar pedidos desde la API
// ======================================================
async function loadOrders() {
    // Muestra un mensaje de carga provisional
    tableBody.innerHTML = '<tr><td colspan="8" class="py-4 text-center text-blue-500 font-semibold">Cargando pedidos...</td></tr>';

    try {
        const token = localStorage.getItem("token");

        // Cargamos pedidos y usuarios en paralelo
        const [ordersResponse, usersResponse] = await Promise.all([
            api.get(`/orders`, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                    "Content-Type": "application/json",
                },
            }),
            api.get(`/users/`, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                    "Content-Type": "application/json",
                },
            }),
        ]);

        // Asegurarse de manejar la estructura de datos (ej. .data.data)
        orders = ordersResponse.data.data || ordersResponse.data || [];
        users = usersResponse.data || [];

        // Agregamos el nombre de usuario a cada pedido
        orders = orders.map(order => {
            // Busca el usuario por id_user_created
            const user = users.find(u => u.id === order.id_user_created);

            // Asigna un nombre predeterminado si no se encuentra el usuario
            const userName = user
                ? `${user.name}` // Asume que 'name' y 'email' existen
                : `Usuario ${order.id_user_created}`;

            return {
                ...order,
                user_name: userName,
            };
        });

        renderOrders();

        // 🆕 Actualizamos las cards
        updateOrderCounts();

    } catch (error) {
        console.error("Error al cargar pedidos:", error);

        showAlert({
            title: "Error",
            message: "error al cargar los pedidos.",
            type: "error",
        });

        tableBody.innerHTML = `
            <tr>
              <td colspan="8" class="py-6 text-center text-red-500 font-semibold">
                Error al cargar pedidos.
              </td>
            </tr>
        `;
    }
}

// ======================================================
// Renderizar pedidos (¡Color de iniciales actualizado a azul!)
// ======================================================
function renderOrders() {
    tableBody.innerHTML = "";

    if (!orders.length) {
        tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="py-6 text-center text-gray-500">
          No hay pedidos disponibles
        </td>
      </tr>
    `;
        return;
    }

    const fragment = document.createDocumentFragment();

    // Filtra las órdenes antes de renderizar para respetar el filtro actual si ya fue aplicado
    const filteredOrders = orders.filter(order => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedStatus = statusFilter.value.toLowerCase();

        const statusText = mapStatus(order.id_status).toLowerCase();
        const userName = order.user_name.toLowerCase();

        const matchesSearch = userName.includes(searchTerm);
        const matchesStatus = selectedStatus === "all" || statusText === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    if (filteredOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
              <td colspan="8" class="py-6 text-center text-gray-500">
                No se encontraron pedidos con los filtros aplicados.
              </td>
            </tr>
        `;
        return;
    }

    filteredOrders.forEach((order) => {
        const tr = document.createElement("tr");
        tr.className = "order-row hover:bg-gray-50 transition duration-75";

        const statusText = mapStatus(order.id_status);
        const statusBadge = getStatusBadge(statusText);
        // Usa el user_name ya procesado en loadOrders
        const userName = order.user_name;
        const initials = getInitials(userName);
        // Utiliza id_table en lugar de table_name si el backend solo proporciona el ID
        const tableName = `Mesa ${order.id_table}`;

        tr.dataset.status = statusText.toLowerCase();
        tr.dataset.employeeName = userName.toLowerCase();

        tr.innerHTML = `
      <td class="py-3 px-2 whitespace-nowrap text-sm text-gray-900 font-medium">
        ${order.id}
      </td>
      <td class="py-3 px-2 whitespace-nowrap">
        <div class="flex items-center">
          <div class="user-initials bg-blue-100 text-blue-800 font-semibold rounded-full w-8 h-8 flex items-center justify-center mr-3">
            ${initials}
          </div>
          <div>
            <p class="text-sm font-medium text-gray-800 employee-name">${userName}</p>
          </div>
        </div>
      </td>
      <td class="py-3 px-2 whitespace-nowrap text-sm text-gray-500">
        ${tableName}
      </td>
      <td class="py-3 px-2 whitespace-nowrap text-sm text-gray-500">
        ${formatCurrency(order.total_value || 0)}
      </td>
      <td class="py-3 px-2 whitespace-nowrap text-sm text-gray-500">
        ${formatDate(order.created_at)}
      </td>
      <td class="py-3 px-2 whitespace-nowrap">
        ${statusBadge}
      </td>
    `;

        fragment.appendChild(tr);
    });

    tableBody.appendChild(fragment);
    // Nota: applyFilters ya no se llama aquí, ya que el filtrado se hizo arriba.
    // Mantenemos applyFilters para los eventos keyup/change.
}

// ======================================================
// 🧩 Funciones auxiliares
// ======================================================
function formatCurrency(value) {
    // Si tu moneda es diferente a COP, cambia el código 'COP' y el locale 'es-CO'
    return Number(value).toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 2,
    });
}

function formatDate(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    // Asegura que la fecha es válida antes de formatear
    if (isNaN(date)) return "Fecha inválida";

    return date.toLocaleString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getInitials(name) {
    // Intenta encontrar las primeras letras antes del primer espacio, o si es un nombre compuesto (ej. John Doe)
    const cleanName = name.trim().split(' (')[0]; // Ignora el email si fue añadido
    const parts = cleanName.split(/\s+/).filter(p => p.length > 0);

    if (parts.length === 0) return 'UN';
    if (parts.length === 1) return parts[0][0].toUpperCase();

    // Devuelve las iniciales de las primeras dos palabras
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

// ======================================================
// 🧩 Mapeo de estados
// ======================================================
const STATUS_MAP = {
    7: "Complete",
    8: "Canceled", // Asumido
    9: "Pending", // Asumido
    10: "In Progress",
    13: "Pending",
};

function mapStatus(id_status) {
    // Mapea a string para una mejor comparación en el frontend
    return STATUS_MAP[id_status] || "Unknown";
}

// ======================================================
// 🎨 Generar badge de estado
// ======================================================
function getStatusBadge(status) {
    const base = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    const badges = {
        complete: { bg: "bg-green-100", text: "text-green-700", label: "Completado" },
        pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pendiente" },
        canceled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelado" },
        "in progress": { bg: "bg-blue-100", text: "text-blue-700", label: "En Progreso" },
    };

    // Asegura que el status se compara en minúsculas
    const statusKey = status.toLowerCase();
    const badge = badges[statusKey] || { bg: "bg-gray-100", text: "text-gray-700", label: "Desconocido" };

    return `<span class="${base} ${badge.bg} ${badge.text}">${badge.label}</span>`;
}

// ======================================================
// 🧮 Contar pedidos por estado y actualizar las cards
// ======================================================
function updateOrderCounts() {
    const counts = { complete: 0, pending: 0, canceled: 0, "in progress": 0 };

    orders.forEach(order => {
        // Usa mapStatus para obtener el nombre legible antes de contar
        const status = mapStatus(order.id_status).toLowerCase();
        if (counts.hasOwnProperty(status)) counts[status]++;
    });

    // Actualiza los elementos del DOM usando los IDs
    if (countComplete) countComplete.textContent = counts.complete.toLocaleString('es-ES');
    if (countPending) countPending.textContent = counts.pending.toLocaleString('es-ES');
    if (countCanceled) countCanceled.textContent = counts.canceled.toLocaleString('es-ES');
    if (countInProgress) countInProgress.textContent = counts["in progress"].toLocaleString('es-ES');
}

// ======================================================
// 🔍 Filtros de búsqueda y estado
// ======================================================
function applyFilters() {
    // Llama a renderOrders para aplicar los filtros
    renderOrders();
}

// ======================================================
// 🧠 Listeners
// ======================================================
searchInput.addEventListener("keyup", applyFilters);
statusFilter.addEventListener("change", applyFilters);

// ======================================================
// 🧭 Inicialización
// ======================================================
document.addEventListener("DOMContentLoaded", loadOrders);