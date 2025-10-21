// orders.js - Versión Corregida con Mapeo SQL

import api from '../api/api.js';

const ordersContainer = document.getElementById("orders-table-body");
const searchInput = document.getElementById("search-input");
const metricsContainer = document.getElementById("metrics-container");

let ordersData = []; 

// =========================================================
// Mapeo de IDs y Nombres (CRUCIAL: Mapea los valores SQL)
// Utiliza los IDs y nombres de la tabla 'status' de tu DB.
// =========================================================
const DB_STATUS_TO_UI = {
    // DB Name (Key) : { id: DB_ID, uiName: Display Name }
    "Preparación": { id: 9, uiName: "En Preparación" }, 
    "Listo": { id: 10, uiName: "Listo para Servir" }, 
    "Entregado": { id: 7, uiName: "Entregado" }, 
    "Cancelada": { id: 12, uiName: "Anulado" },
};

// Mapeo inverso para la lógica de avance de estado
const UI_STATUS_TO_DB = Object.values(DB_STATUS_TO_UI).reduce((acc, current) => {
    acc[current.uiName] = current;
    return acc;
}, {});


// =========================================================
// DATOS MOCK DE PEDIDOS (Actualizado para usar nombres de la DB: Preparación, Listo, Entregado)
// =========================================================
const MOCK_ORDERS_DATA = {
    items: [
        { "id": 1001, "table_name": "Mesa 5", "employee_name": "Ana García", "total_items": 4, "total_price": 45.50, "status_name": "Entregado", "created_at": "2025-10-20T10:15:00" },
        { "id": 1002, "table_name": "Barra 2", "employee_name": "Carlos Ruíz", "total_items": 2, "total_price": 24.00, "status_name": "Preparación", "created_at": "2025-10-20T10:30:00" },
        { "id": 1003, "table_name": "Terraza 1", "employee_name": "Ana García", "total_items": 5, "total_price": 78.90, "status_name": "Listo", "created_at": "2025-10-20T10:45:00" },
        { "id": 1004, "table_name": "Mesa 1", "employee_name": "Pedro López", "total_items": 1, "total_price": 12.00, "status_name": "Cancelada", "created_at": "2025-10-19T18:00:00" },
        { "id": 1005, "table_name": "Mesa 3", "employee_name": "Carlos Ruíz", "total_items": 3, "total_price": 38.00, "status_name": "Preparación", "created_at": "2025-10-20T11:00:00" },
        { "id": 1006, "table_name": "Barra 1", "employee_name": "Pedro López", "total_items": 1, "total_price": 5.00, "status_name": "Listo", "created_at": "2025-10-20T11:05:00" }
    ]
};

// =========================================================
// UI Helpers
// =========================================================

function getStatusStyles(dbStatusName) {
    const uiName = DB_STATUS_TO_UI[dbStatusName]?.uiName || dbStatusName;
    let style = { class: "bg-gray-200 text-gray-700", text: uiName };
    switch (uiName) {
        case "Entregado": style.class = "bg-green-100 text-green-700 font-medium"; break;
        case "Listo para Servir": style.class = "bg-blue-100 text-blue-700 font-medium"; break;
        case "En Preparación": style.class = "bg-yellow-100 text-yellow-700 font-medium"; break;
        case "Anulado": style.class = "bg-red-100 text-red-700 font-medium"; break;
    }
    return style;
}

function formatDate(isoString) {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        return date.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            day: 'numeric',
            month: 'numeric'
        });
    } catch (e) {
        return isoString.split('T')[0];
    }
}

// Función para renderizar las tarjetas de métricas
function renderMetrics(data) {
    // Las métricas se calculan usando los nombres de la DB
    const totalOrders = data.length;
    const pendingOrders = data.filter(o => o.status_name === "Preparación").length;
    const readyOrders = data.filter(o => o.status_name === "Listo").length;
    
    metricsContainer.innerHTML = `
        <div class="bg-white p-5 rounded-xl shadow-md flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-500">Pedidos Totales</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">${totalOrders}</p>
            </div>
            <div class="p-3 bg-primary-blue/10 rounded-full text-primary-blue">
                <svg data-lucide="utensils-crossed" class="w-6 h-6"></svg>
            </div>
        </div>

        <div class="bg-white p-5 rounded-xl shadow-md flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-500">En Preparación</p>
                <p class="text-2xl font-bold text-yellow-600 mt-1">${pendingOrders}</p>
            </div>
            <div class="p-3 bg-yellow-100 rounded-full text-yellow-600">
                <svg data-lucide="clock" class="w-6 h-6"></svg>
            </div>
        </div>

        <div class="bg-white p-5 rounded-xl shadow-md flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-500">Listos para Servir</p>
                <p class="text-2xl font-bold text-green-600 mt-1">${readyOrders}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-full text-green-600">
                <svg data-lucide="check-circle" class="w-6 h-6"></svg>
            </div>
        </div>
    `;
    lucide.createIcons();
}


function renderOrders(data) {
    ordersContainer.innerHTML = "";

    if (!data || data.length === 0) {
        ordersContainer.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-gray-500 italic">No se encontraron pedidos.</td></tr>';
        return;
    }

    data.forEach(order => {
        const status = getStatusStyles(order.status_name); // Usa el nombre de la DB
        
        // Deshabilita la acción si el estado es final (Entregado o Cancelada)
        const isActionDisabled = (order.status_name === 'Entregado' || order.status_name === 'Cancelada');

        const row = document.createElement("tr");
        row.className = "border-b hover:bg-gray-50 transition duration-150";

        row.innerHTML = `
            <td class="p-4">
                <input type="checkbox" class="rounded border-gray-300 text-primary-blue focus:ring-primary-blue">
            </td>
            <td class="p-4 text-sm text-gray-900 font-semibold">#${order.id}</td>
            <td class="p-4 text-sm text-gray-600">${order.employee_name || 'N/A'}</td>
            <td class="p-4 text-sm text-gray-900">${order.table_name || 'N/A'}</td>
            <td class="p-4 text-sm text-gray-600">${order.total_items}</td>
            <td class="p-4 text-sm text-gray-900 font-semibold">$${order.total_price.toFixed(2)}</td>
            <td class="p-4 text-sm text-gray-600">${formatDate(order.created_at)}</td>
            <td class="p-4">
                <span class="px-3 py-1 text-xs font-semibold rounded-full ${status.class}">${status.text}</span>
            </td>
            <td class="p-4 text-sm space-x-2 flex items-center">
                <button data-id="${order.id}" data-action="detail" title="Ver Detalles" 
                    class="p-2 rounded-full text-gray-500 hover:text-primary-blue hover:bg-gray-100 transition">
                    <svg data-lucide="eye" class="w-4 h-4"></svg>
                </button>
                <button data-id="${order.id}" data-action="update-status" title="Avanzar Estado" 
                    class="p-2 rounded-full text-gray-500 hover:text-green-600 hover:bg-gray-100 transition ${isActionDisabled ? 'opacity-50 cursor-not-allowed' : ''}"
                    ${isActionDisabled ? 'disabled' : ''}>
                    <svg data-lucide="refresh-ccw" class="w-4 h-4"></svg>
                </button>
            </td>
        `;

        ordersContainer.appendChild(row);
        lucide.createIcons();
        
        const detailButton = row.querySelector('[data-action="detail"]');
        const updateStatusButton = row.querySelector('[data-action="update-status"]');
        
        detailButton.addEventListener('click', () => alert(`(DEMO) Detalles del Pedido #${order.id}`));
        
        if (!isActionDisabled) {
            updateStatusButton.addEventListener('click', () => handleUpdateStatus(order.id, order.status_name));
        }
    });
}


async function fetchOrders(searchQuery = null) {
    let url = '/orders/';
    let finalOrders = []; 
    let isApiCallSuccessful = false;
    
    try {
        let apiUrl = url;
        if (searchQuery) {
            // Asume que tu API maneja el filtro por 'q' en el backend
            apiUrl += `?q=${encodeURIComponent(searchQuery)}`; 
        }

        const response = await api.get(apiUrl);
        
        const dataItems = response.data.items || response.data; 

        if (dataItems && Array.isArray(dataItems)) {
            // Se espera que la API devuelva 'status_name' con los nombres de la DB
            finalOrders = dataItems;
            isApiCallSuccessful = true;
            console.log("✅ Pedidos cargados correctamente desde la API.");
        }

    } catch (error) {
        // En caso de error de conexión (paso 1 sin hacer), usamos mock data.
        console.warn("⚠️ Error al cargar pedidos desde la API. Usando datos mock. Error:", error.response ? error.response.data : error.message);
    }
    
    if (!isApiCallSuccessful || finalOrders.length === 0) {
        finalOrders = MOCK_ORDERS_DATA.items;
    }
    
    // Mapeo (solo para asegurar la estructura, los nombres de estado ya vienen de la DB)
    const transformedOrders = finalOrders.map(order => ({
        id: order.id,
        table_name: order.table_name,
        employee_name: order.employee_name,
        total_items: order.total_items,
        total_price: order.total_price,
        status_name: order.status_name, // Nombre de la DB ('Preparación', 'Listo', etc.)
        created_at: order.created_at,
    }));
    
    // Aplicar Filtro de Cliente (se aplica SIEMPRE si hay un término de búsqueda, en caso de que la API no filtre)
    let filteredOrders = transformedOrders;

    if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        filteredOrders = transformedOrders.filter(order => 
            (order.id && order.id.toString().includes(lowerCaseQuery)) || 
            (order.table_name && order.table_name.toLowerCase().includes(lowerCaseQuery)) || 
            (order.employee_name && order.employee_name.toLowerCase().includes(lowerCaseQuery)) ||
            (order.status_name && order.status_name.toLowerCase().includes(lowerCaseQuery)) 
        );
    }

    renderMetrics(filteredOrders);
    renderOrders(filteredOrders);
}


// ----------------------------------------------------------------
// LÓGICA DE ACTUALIZACIÓN DE ESTADO (PATCH)
// ----------------------------------------------------------------

async function handleUpdateStatus(orderId, currentDBStatusName) {
    let nextDBStatusName = "";

    // Lógica de avance usando los nombres de la DB
    if (currentDBStatusName === "Preparación") {
        nextDBStatusName = "Listo";
    } else if (currentDBStatusName === "Listo") {
        nextDBStatusName = "Entregado";
    } else {
        // Entregado o Cancelada (no se avanza)
        return;
    }
    
    // Obtener el ID del siguiente estado para el payload
    const nextStatusData = DB_STATUS_TO_UI[nextDBStatusName];
    if (!nextStatusData) return;
    
    const nextStatusUI = nextStatusData.uiName;
    const nextStatusId = nextStatusData.id;

    if (!confirm(`¿Desea cambiar el estado del Pedido #${orderId} a "${nextStatusUI}"?`)) {
        return;
    }

    const payload = {
        id_status: nextStatusId, // Enviamos el ID de la DB
    };
    
    try {
        await api.patch(`/orders/${orderId}/`, payload);
        alert(`Estado del Pedido #${orderId} actualizado a "${nextStatusUI}" con éxito.`);
        fetchOrders(searchInput.value); // Recargar la lista manteniendo el filtro de búsqueda
    } catch (error) {
        console.error(`Error al actualizar el estado del Pedido #${orderId}:`, error.response ? error.response.data : error.message);
        alert(`Error al actualizar estado: ${error.response ? error.response.data.detail : error.message}`);
    }
}


// ----------------------------------------------------------------
// EVENT LISTENERS
// ----------------------------------------------------------------

searchInput.addEventListener('input', (e) => {
    fetchOrders(e.target.value);
});


document.addEventListener('DOMContentLoaded', () => {
    fetchOrders(); 
});