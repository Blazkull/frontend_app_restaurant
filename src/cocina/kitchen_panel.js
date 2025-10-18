// kitchen_panel.js
import api from '../api/api'; // Importar la instancia de Axios


// ... (El código de pedidosDemo, si lo necesitas para pruebas iniciales, puede quedar comentado o eliminado)

// Mapeo de estados de la API a estados locales
const statusMap = {
    "Pendiente": "pendiente",
    "Preparación": "en_preparacion",
    "Listo": "listo",
    "Entregado": "entregado" // Aunque no se renderiza, es bueno mantener el mapeo
};

function renderPedidos(data) {
    console.log("Pedidos recibidos (Datos Transformados):", data);

    const pendientes = document.getElementById("pendientes");
    const preparacion = document.getElementById("preparacion");
    const listos = document.getElementById("listos");

    pendientes.innerHTML = "";
    preparacion.innerHTML = "";
    listos.innerHTML = "";

    // Combina todos los pedidos en una sola lista
    const allOrders = Object.values(data).flat(); 

    if (!allOrders || allOrders.length === 0) {
        pendientes.innerHTML = `<p class="text-gray-500 italic">No hay pedidos pendientes</p>`;
        preparacion.innerHTML = `<p class="text-gray-500 italic">No hay pedidos en preparación</p>`;
        listos.innerHTML = `<p class="text-gray-500 italic">No hay pedidos listos</p>`;
        return;
    }

    allOrders.forEach(pedido => {
        // Adaptación de los datos de la API a la estructura de la card
        const pedidoIdMatch = pedido.order_number.match(/#(\d+)/);
        const id = pedidoIdMatch ? parseInt(pedidoIdMatch[1]) : 'N/A';
        const mesa = pedido.table.replace('Mesa ', '');
        const hora = pedido.created_at; 
        const items = pedido.items.map(item => `${item.quantity}x ${item.menu_item}${item.note ? ` (${item.note})` : ''}`);
        const estado = pedido.estado; // El estado se añade en la función fetch

        let botonTexto = "";
        let nuevoEstado = null;
        if (estado === "pendiente") {
            botonTexto = "Iniciar Preparación";
            nuevoEstado = "en_preparacion";
        } else if (estado === "en_preparacion") {
            botonTexto = "Marcar Listo";
            nuevoEstado = "listo";
        } else if (estado === "listo") {
            botonTexto = "Notificar";
            nuevoEstado = "entregado";
        }

        const card = document.createElement("div");
        card.className = "p-4 border rounded-xl shadow-sm bg-white";

        card.innerHTML = `
            <p class="font-bold">${pedido.order_number}</p>
            <p class="text-sm text-gray-500">${pedido.table} - ${hora}</p>
            <ul class="mt-2 text-gray-700 text-sm">
                ${items.map(item => `<li>• ${item}</li>`).join("")}
            </ul>
            ${
                botonTexto
                    ? `<button data-id="${id}" data-estado="${nuevoEstado}" 
                        class="mt-3 w-full flex items-center justify-between py-2 px-3 rounded-xl text-white font-medium ${
                            estado === "pendiente"
                                ? "bg-orange-500 hover:bg-orange-600"
                                : estado === "en_preparacion"
                                ? "bg-blue-500 hover:bg-blue-600"
                                : "bg-green-500 hover:bg-green-600"
                        }">
                        <span>${botonTexto}</span>
                        <i data-lucide="${
                            estado === "pendiente"
                                ? "play"
                                : estado === "en_preparacion"
                                ? "check-circle"
                                : "bell"
                        }"></i>
                        </button>`
                    : ""
            }
        `;


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
                const nextState = btn.dataset.estado;
                
                // Llamar a la función para actualizar el estado del pedido
                const success = await updateOrderStatus(orderId, nextState);
                if(success) {
                     alert(`Pedido #${orderId} cambiado a estado "${nextState}"`);
                     fetchOrders(); // Recargar pedidos después de la actualización
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
        const response = await api.get('/kitchen/orders/');
        const apiData = response.data.data; // Accede a la parte 'data' de la respuesta de la API

        // Transformar la estructura de la API a una más plana y con el estado de tu app
        const transformedData = {};
        
        for (const [apiStatus, orders] of Object.entries(apiData)) {
            const localStatus = statusMap[apiStatus]; // Mapea 'Pendiente' -> 'pendiente', etc.
            if (localStatus) {
                // Añade el estado local a cada pedido antes de renderizar
                transformedData[localStatus] = orders.map(order => ({
                    ...order,
                    estado: localStatus,
                }));
            }
        }
        
        // Combina los arrays por estado para renderPedidos (renderPedidos espera un array plano de todos)
        const allOrdersArray = Object.values(transformedData).flat(); 
        renderPedidos(allOrdersArray);

    } catch (error) {
        console.error("Error al obtener los pedidos:", error);
        // Opcional: Mostrar un mensaje de error en la UI
        renderPedidos([]); 
    }
}


/**
 * Función para actualizar el estado de un pedido.
 * @param {number} id - El ID del pedido.
 * @param {string} newState - El nuevo estado ('en_preparacion', 'listo', 'entregado').
 * @returns {boolean} - true si la actualización fue exitosa.
 */
async function updateOrderStatus(id, newState) {
    const apiStatus = Object.keys(statusMap).find(key => statusMap[key] === newState);

    if (!apiStatus) {
        console.error(`Estado desconocido: ${newState}`);
        return false;
    }

    try {
        // La ruta para actualizar el estado de un pedido (ej. /api/kitchen/orders/1/status)
        // DEBES CONFIRMAR LA RUTA EXACTA CON EL DESARROLLADOR DEL BACKEND
        // Aquí asumo un endpoint PUT o PATCH a '/api/kitchen/orders/{id}' con el nuevo estado en el cuerpo.
        await api.patch(`/kitchen/orders/${id}/`, {
            new_status: apiStatus // Envía el estado en el formato que espera el backend (ej. 'Preparación', 'Listo')
        });

        // Si el backend te pide un formato diferente (ej. solo el id y el estado en el body o en la URL), 
        // deberás ajustar la llamada `api.patch` o `api.put`.

        return true;
    } catch (error) {
        console.error(`Error al actualizar el estado del pedido #${id} a ${apiStatus}:`, error);
        return false;
    }
}


// Iniciar la carga de pedidos al cargar la página
fetchOrders();

// Opcional: Configurar una recarga automática cada cierto tiempo (ej. 15 segundos)
// setInterval(fetchOrders, 15000);