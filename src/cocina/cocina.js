// cocina.js (Versión Corregida y Optimizada)
import api from '../api/api'; 

// =========================================================
// Mapeo de Estados (CRUCIAL: Usa los IDs de tu tabla 'status')
// =========================================================
const statusMap = {
    // Nombre API (DB) : { id: ID de la DB, local: Slug local }
    "Pendiente": { id: 8, local: "pendiente" }, 
    "Preparación": { id: 9, local: "en_preparacion" },
    "Listo": { id: 10, local: "listo" },
    "Entregado": { id: 11, local: "entregado" } // O ID 7, según uses kitchen_tickets o orders
};

// Mapeo inverso para encontrar el ID de la DB a partir del slug local (ej: 'listo' -> 10)
function getStatusIdByLocal(localStatus) {
    for (const key in statusMap) {
        if (statusMap[key].local === localStatus) {
            return statusMap[key].id;
        }
    }
    return null;
}

// ----------------------------------------------------
// UI Helpers
// ----------------------------------------------------

// Función para actualizar los contadores
function updateCounts(data) {
    const counts = data.reduce((acc, order) => {
        acc[order.estado] = (acc[order.estado] || 0) + 1;
        return acc;
    }, {});

    document.getElementById("count-pendientes").textContent = counts["pendiente"] || 0;
    document.getElementById("count-preparacion").textContent = counts["en_preparacion"] || 0;
    document.getElementById("count-listos").textContent = counts["listo"] || 0;
}


function renderPedidos(data) {
    updateCounts(data); // Actualiza los contadores

    const pendientes = document.getElementById("pendientes");
    const preparacion = document.getElementById("preparacion");
    const listos = document.getElementById("listos");

    pendientes.innerHTML = "";
    preparacion.innerHTML = "";
    listos.innerHTML = "";

    if (!data || data.length === 0) {
        pendientes.innerHTML = `<p class="p-4 text-gray-500 italic">No hay pedidos pendientes</p>`;
        preparacion.innerHTML = `<p class="p-4 text-gray-500 italic">No hay pedidos en preparación</p>`;
        listos.innerHTML = `<p class="p-4 text-gray-500 italic">No hay pedidos listos</p>`;
        return;
    }

    data.forEach(pedido => {
        // Asumiendo que la API devuelve el ID del pedido directamente (más robusto)
        // Si no devuelve un campo 'id', se usa el método original:
        const id = pedido.id || (pedido.order_number.match(/#(\d+)/) ? parseInt(pedido.order_number.match(/#(\d+)/)[1]) : 'N/A');
        
        const hora = pedido.created_at; 
        const items = pedido.items.map(item => `${item.quantity}x ${item.menu_item}${item.note ? ` (${item.note})` : ''}`);
        const estado = pedido.estado; 

        let botonTexto = "";
        let nuevoEstadoLocal = null;
        let buttonClass = "";
        let lucideIcon = "";
        
        if (estado === "pendiente") {
            botonTexto = "Iniciar Preparación";
            nuevoEstadoLocal = "en_preparacion";
            buttonClass = "bg-orange-500 hover:bg-orange-600";
            lucideIcon = "play";
        } else if (estado === "en_preparacion") {
            botonTexto = "Marcar Listo";
            nuevoEstadoLocal = "listo";
            buttonClass = "bg-blue-500 hover:bg-blue-600";
            lucideIcon = "check-circle";
        } else if (estado === "listo") {
            // Este botón es para que el mesero sepa que debe servir
            botonTexto = "Notificar Entrega"; 
            nuevoEstadoLocal = "entregado";
            buttonClass = "bg-green-500 hover:bg-green-600";
            lucideIcon = "bell";
        }

        const card = document.createElement("div");
        card.className = "p-4 border rounded-xl shadow-sm bg-white";

        card.innerHTML = `
            <p class="font-bold">${pedido.order_number}</p>
            <p class="text-sm text-gray-500">${pedido.table} - ${hora}</p>
            <ul class="mt-2 text-gray-700 text-sm list-disc pl-5 space-y-1">
                ${items.map(item => `<li>${item}</li>`).join("")}
            </ul>
            ${
                botonTexto
                    ? `<button data-id="${id}" data-estado-local="${nuevoEstadoLocal}" 
                        class="mt-3 w-full flex items-center justify-between py-2 px-3 rounded-xl text-white font-medium transition ${buttonClass}">
                        <span>${botonTexto}</span>
                        <i data-lucide="${lucideIcon}"></i>
                        </button>`
                    : ""
            }
        `;


        // Insertar en la columna correcta
        if (estado === "pendiente") {
            pendientes.appendChild(card);
        } else if (estado === "en_preparacion") {
            preparacion.appendChild(card);
        } else if (estado === "listo") {
            listos.appendChild(card);
        }

        const btn = card.querySelector("button");
        if (btn) {
            btn.addEventListener("click", async () => {
                const orderId = btn.dataset.id;
                const nextStateLocal = btn.dataset.estadoLocal;
                
                const success = await updateOrderStatus(orderId, nextStateLocal);
                if(success) {
                    // El alert es solo para fines de prueba, usar una notificación Toast en producción
                    alert(`Pedido #${orderId} cambiado a estado "${nextStateLocal.replace('_', ' ')}"`);
                    fetchOrders(); 
                } else {
                    alert(`Error al cambiar el estado del Pedido #${orderId}`);
                }
            });
        }

        lucide.createIcons();
    });
}

// ----------------------------------------------------
// FUNCIONES DE INTERACCIÓN CON LA API
// ----------------------------------------------------

/**
 * Función para obtener los pedidos de la API.
 */
async function fetchOrders() {
    try {
        // Asumiendo que la API devuelve un objeto { data: { 'Pendiente': [..], 'Preparación': [..] } }
        const response = await api.get('/kitchen/orders/');
        const apiData = response.data.data; 

        const allOrdersArray = []; 
        
        for (const [apiStatus, orders] of Object.entries(apiData)) {
            // Busca la configuración del estado en el mapeo
            const statusConfig = statusMap[apiStatus];
            
            if (statusConfig) {
                // Añade el estado local (slug) a cada pedido
                const localStatus = statusConfig.local;
                const ordersWithStatus = orders.map(order => ({
                    ...order,
                    estado: localStatus,
                }));
                allOrdersArray.push(...ordersWithStatus);
            }
        }
        
        renderPedidos(allOrdersArray);

    } catch (error) {
        console.error("Error al obtener los pedidos:", error);
        // Opcional: Mostrar un mensaje de error en la UI
        renderPedidos([]); 
    }
}


/**
 * Función para actualizar el estado de un pedido enviando el ID de estado de la DB.
 * @param {number} id - El ID del pedido.
 * @param {string} newStateLocal - El slug local del nuevo estado ('en_preparacion', 'listo', 'entregado').
 * @returns {boolean} - true si la actualización fue exitosa.
 */
async function updateOrderStatus(id, newStateLocal) {
    const id_status = getStatusIdByLocal(newStateLocal);

    if (!id_status) {
        console.error(`Estado local desconocido o sin ID de DB: ${newStateLocal}`);
        return false;
    }

    try {
        // Enviar el ID de la DB al backend, que es el método más limpio y seguro.
        await api.patch(`/orders/${id}/`, {
            id_status: id_status 
        });

        // NOTA: Si tu API de cocina usa un endpoint diferente (ej: /kitchen/tickets/{id}/),
        // debes cambiar la ruta de la llamada:
        // await api.patch(`/kitchen/tickets/${id_ticket}/`, { id_status: id_status });

        return true;
    } catch (error) {
        console.error(`Error al actualizar el estado del pedido #${id} a ID ${id_status}:`, error.response ? error.response.data : error.message);
        return false;
    }
}


// Iniciar la carga de pedidos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
});
// Opcional: Configurar una recarga automática cada cierto tiempo (ej. 15 segundos)
// setInterval(fetchOrders, 15000);