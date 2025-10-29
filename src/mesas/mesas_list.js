// mesas_list.js - Vista de mesas para meseros (solo tomar/ver pedidos)

import api from '../api/api.js';

console.log("✅ Módulo mesas_list.js (Meseros) cargado correctamente");

// =========================================================
// Mapeo de IDs según la base de datos
// =========================================================

const statusMap = {
    "Ocupada": 3,       // ID 3
    "Disponible": 4,    // ID 4
    "Desactivada": 2,   // ID 2
};

const locationMap = {
    "Salón Principal": 1, // ID 1
    "Terraza": 2,         // ID 2
    "Barra": 3,           // ID 3
};

const mesasContainer = document.getElementById("mesas-container");

// =========================================================
// Funciones auxiliares de mapeo
// =========================================================

function getStatusName(id_status) {
    const statusNames = {
        2: "Desactivada",
        3: "Ocupada",
        4: "Disponible"
    };
    return statusNames[id_status] || "Desconocido";
}

function getLocationName(id_location) {
    const locationNames = {
        1: "Salón Principal",
        2: "Terraza",
        3: "Barra"
    };
    return locationNames[id_location] || "Sin Ubicación";
}

function getTableStyles(estado) {
    let style = {};
    let color = '';

    if (estado === "Disponible") {
        color = 'green';
        style.cardClass = "border-green-300 bg-white shadow-lg hover:shadow-xl";
        style.statusClass = "bg-green-100 text-green-700 border-green-300";
        style.statusText = "Disponible";
        style.mainButtonClass = "bg-blue-500 hover:bg-blue-600";
        style.mainButtonText = "Tomar Pedido";
        style.mainButtonIcon = "clipboard-list";
    } else if (estado === "Ocupada") {
        color = 'red';
        style.cardClass = "border-red-300 bg-white shadow-lg hover:shadow-xl";
        style.statusClass = "bg-red-100 text-red-700 border-red-300";
        style.statusText = "Ocupada";
        style.mainButtonClass = "bg-blue-500 hover:bg-blue-600";
        style.mainButtonText = "Ver Pedido";
        style.mainButtonIcon = "eye";
    } else if (estado === "Desactivada") {
        color = 'yellow';
        style.cardClass = "border-yellow-300 bg-gray-50 shadow-lg opacity-75";
        style.statusClass = "bg-yellow-100 text-yellow-700 border-yellow-300";
        style.statusText = "Desactivada";
    }
    
    style.iconWrapperClass = `p-2 border-2 rounded-lg border-${color}-400 bg-${color}-50`;
    style.iconColorClass = `text-${color}-500`;

    return style;
}

// =========================================================
// Renderizar mesas (Vista Meseros - Solo lectura con botón de pedido)
// =========================================================

function renderMesas(data) {
    mesasContainer.innerHTML = "";
    
    if (!data || data.length === 0) {
        mesasContainer.innerHTML = '<p class="text-gray-500 italic col-span-full text-center py-8">No hay mesas registradas.</p>';
        return;
    }

    data.forEach(mesa => {
        const styles = getTableStyles(mesa.estado);

        const card = document.createElement("div");
        card.className = `p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer ${styles.cardClass}`;
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div class="${styles.iconWrapperClass}">
                    <svg data-lucide="package" class="w-5 h-5 ${styles.iconColorClass}"></svg>
                </div>
                <span class="px-3 py-1 text-xs font-semibold rounded-full border ${styles.statusClass}">${styles.statusText}</span>
            </div>
            
            <h2 class="font-bold text-xl mb-2">${mesa.nombre}</h2>
            
            <div class="space-y-1 mb-4">
                <p class="text-sm text-gray-600 flex items-center gap-2">
                    <i data-lucide="map-pin" class="w-4 h-4"></i>
                    ${mesa.ubicacion}
                </p>
                <p class="text-sm text-gray-600 flex items-center gap-2">
                    <i data-lucide="users" class="w-4 h-4"></i>
                    Capacidad: ${mesa.capacidad} personas
                </p>
            </div>

            ${mesa.estado !== "Desactivada" ? `
                <button data-id="${mesa.id}" data-action="order" data-name="${mesa.nombre}" data-estado="${mesa.estado}"
                        class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-white font-medium shadow-md ${styles.mainButtonClass} transition-colors">
                    <i data-lucide="${styles.mainButtonIcon}" class="w-4 h-4"></i>
                    <span>${styles.mainButtonText}</span>
                </button>
            ` : ''}
        `;

        mesasContainer.appendChild(card);
        
        // Inicializar iconos de Lucide
        if (window.lucide) {
            lucide.createIcons();
        }
        
        // Agregar event listener solo al botón de pedido
        const button = card.querySelector('button');
        if (button) {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                handleTableAction(
                    button.dataset.id,
                    button.dataset.action,
                    button.dataset.estado,
                    button.dataset.name
                );
            });
        }
    });
}

// =========================================================
// Obtener mesas desde la API
// =========================================================

async function fetchTables() {
    try {
        console.log("🔍 Obteniendo mesas...");
        console.log("📦 Contenedor encontrado:", mesasContainer ? "SÍ" : "NO");
        console.log("🌐 API configurada:", api ? "SÍ" : "NO");
        
        const response = await api.get('/tables/');
        console.log("📡 Respuesta completa API:", response);
        console.log("📋 Data recibida:", response.data);
        console.log("📊 Items:", response.data?.items);
        
        const apiMesas = response.data.items;
        
        if (!apiMesas || apiMesas.length === 0) {
            console.warn("⚠️ No hay mesas en la respuesta");
            mesasContainer.innerHTML = '<p class="text-yellow-500 italic col-span-full text-center py-8">No hay mesas registradas en el sistema.</p>';
            return;
        }
        
        const transformedMesas = apiMesas.map(mesa => {
            console.log("🔄 Transformando mesa:", mesa);
            return {
                ...mesa,
                id: mesa.id,
                nombre: mesa.name || `Mesa #${mesa.id}`,
                capacidad: mesa.capacity || 0,
                estado: getStatusName(mesa.id_status),
                ubicacion: getLocationName(mesa.id_location),
                id_location: mesa.id_location,
                id_status: mesa.id_status,
            };
        });

        console.log("✅ Mesas transformadas:", transformedMesas);
        console.log(`✅ ${transformedMesas.length} mesas cargadas`);
        renderMesas(transformedMesas);

    } catch (error) {
        console.error("❌ Error al obtener las mesas:", error);
        console.error("📊 Detalles completos del error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url,
            baseURL: error.config?.baseURL,
            fullURL: error.config?.baseURL + error.config?.url
        });
        
        if (mesasContainer) {
            mesasContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-red-500 font-bold mb-2">Error al cargar las mesas</p>
                    <p class="text-sm text-gray-600">${error.message}</p>
                    ${error.response?.status ? `<p class="text-sm text-gray-500 mt-2">Status: ${error.response.status}</p>` : ''}
                </div>
            `;
        }
    }
}

// =========================================================
// Manejar acción de tomar/ver pedido (solo para meseros)
// =========================================================

async function handleTableAction(id, action, estadoActual, nombreMesa) {
    const mesaId = parseInt(id);

    if (action === "order") {
        // Si la mesa está DISPONIBLE → Tomar pedido (ir al menú)
        if (estadoActual === "Disponible") {
            console.log(`📋 Tomando pedido para ${nombreMesa} (ID: ${mesaId})`);
            
            try {
                console.log(`🔄 Cambiando estado de ${nombreMesa} a Ocupada...`);
                
                await api.patch(`/tables/${mesaId}/status`, { 
                    id_status: statusMap["Ocupada"]
                });
                
                console.log(`✅ ${nombreMesa} marcada como Ocupada`);
                
                // Guardar mesa actual en localStorage
                localStorage.setItem("current_table", mesaId);
                localStorage.setItem("current_table_name", nombreMesa);
                
                // Navegar a la página del menú
                window.location.href = `../menu/menu.html?table=${mesaId}`;
                
            } catch (error) {
                console.error(`❌ Error al procesar pedido:`, error);
                alert(`Error al procesar pedido: ${error.response?.data?.detail || error.message}`);
            }
        }
        // Si la mesa está OCUPADA → Ver pedido (mostrar modal)
        else if (estadoActual === "Ocupada") {
            console.log(`👁️ Viendo pedido de ${nombreMesa} (ID: ${mesaId})`);
            await showOrderModal(mesaId, nombreMesa);
        }
        return;
    }
}

// =========================================================
// Modal para ver pedido de mesa ocupada
// =========================================================

async function showOrderModal(tableId, tableName) {
    try {
        console.log(`🔍 Buscando pedido activo para mesa ${tableId}...`);
        
        // Obtener las órdenes de esta mesa
        const response = await api.get('/orders', { 
            params: { 
                limit: 50, 
                deleted: false 
            } 
        });
        
        console.log("📡 Respuesta de órdenes:", response.data);
        
        let orders = [];
        if (Array.isArray(response.data)) orders = response.data;
        else if (response.data.items) orders = response.data.items;
        else if (response.data.data) orders = response.data.data;
        
        console.log("📋 Total de órdenes recibidas:", orders.length);
        
        // Filtrar órdenes de esta mesa que no estén entregadas
        const tableOrders = orders.filter(o => 
            parseInt(o.id_table) === parseInt(tableId) && 
            o.id_status !== 4 // No mostrar las entregadas
        );
        
        console.log(`📊 Órdenes activas para mesa ${tableId}:`, tableOrders);
        
        if (tableOrders.length === 0) {
            alert(`No hay pedidos activos para ${tableName}`);
            return;
        }
        
        // Ordenar por fecha de creación (más reciente primero) y tomar la primera
        tableOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const currentOrder = tableOrders[0];
        
        console.log("✅ Orden actual seleccionada:", currentOrder);
        
        const statusNames = {
            1: "Pendiente",
            2: "En Preparación",
            3: "Listo",
            4: "Entregado"
        };
        
        const statusColors = {
            1: 'bg-yellow-100 text-yellow-700 border-yellow-300',
            2: 'bg-orange-100 text-orange-700 border-orange-300',
            3: 'bg-green-100 text-green-700 border-green-300',
            4: 'bg-gray-100 text-gray-700 border-gray-300'
        };
        
        const statusIcons = {
            1: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            2: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>',
            3: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            4: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
        };
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md transform transition-all animate-scaleIn">
                <div class="flex justify-between items-start mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">Pedido de ${tableName}</h2>
                    <button id="close-modal" class="text-gray-400 hover:text-gray-600 transition">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="space-y-4 mb-6">
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span class="text-gray-600 font-medium">Orden #</span>
                        <span class="font-bold text-xl text-indigo-600">${currentOrder.id}</span>
                    </div>
                    
                    <div class="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border-2 ${statusColors[currentOrder.id_status]}">
                        <div class="flex items-center gap-2">
                            <span class="text-gray-600 font-medium">Estado</span>
                        </div>
                        <div class="flex items-center gap-2">
                            ${statusIcons[currentOrder.id_status]}
                            <span class="px-3 py-1 rounded-full text-sm font-bold ${statusColors[currentOrder.id_status]}">
                                ${statusNames[currentOrder.id_status] || 'Desconocido'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                        <span class="text-gray-600 font-medium">Total</span>
                        <span class="font-bold text-2xl text-indigo-600">${currentOrder.total_value?.toLocaleString() || 0}</span>
                    </div>
                    
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center gap-2">
                            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-gray-600 font-medium">Hora</span>
                        </div>
                        <span class="text-sm font-semibold text-gray-700">${new Date(currentOrder.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
                
                <div class="flex gap-3">
                    <button id="goto-kitchen" class="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-indigo-800 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        Ver en Cocina
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Agregar estilos de animación
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scaleIn {
                from { transform: scale(0.95); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            .animate-fadeIn {
                animation: fadeIn 0.2s ease-out;
            }
            .animate-scaleIn {
                animation: scaleIn 0.2s ease-out;
            }
        `;
        document.head.appendChild(style);
        
        // Event listeners
        modal.querySelector('#close-modal').addEventListener('click', () => {
            modal.remove();
            style.remove();
        });
        
        modal.querySelector('#goto-kitchen').addEventListener('click', () => {
            window.location.href = `../cocina/cocina.html?highlight=${currentOrder.id}`;
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                style.remove();
            }
        });
        
    } catch (error) {
        console.error('❌ Error al obtener pedido:', error);
        console.error('📊 Detalles del error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        alert('Error al cargar los detalles del pedido. Por favor, intente nuevamente.');
    }
}

// =========================================================
// Inicialización
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Inicializando vista de mesas para meseros...");
    fetchTables();
});