// mesas.js - Gestión de mesas con navegación al menú

import api from '../api/api.js';

console.log("✅ Módulo mesas.js (Admin) cargado correctamente");

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
const crearMesaBtn = document.getElementById("crear-mesa-btn");
const modal = document.getElementById("modal-creacion-mesa");
const cancelarMesaBtn = document.getElementById("cancelar-mesa-btn");
const formCrearMesa = document.getElementById("form-crear-mesa");

let mesasData = [];

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
        style.secondaryButtonClass = "bg-red-500 hover:bg-red-600";
        style.secondaryButtonText = "Desactivar";
        style.secondaryButtonIcon = "x";
    } else if (estado === "Ocupada") {
        color = 'red';
        style.cardClass = "border-red-300 bg-white shadow-lg hover:shadow-xl";
        style.statusClass = "bg-red-100 text-red-700 border-red-300";
        style.statusText = "Ocupada";
        style.mainButtonClass = "bg-blue-500 hover:bg-blue-600";
        style.mainButtonText = "Ver Pedido";
        style.mainButtonIcon = "eye";
        style.secondaryButtonClass = "bg-red-500 hover:bg-red-600";
        style.secondaryButtonText = "Desactivar";
        style.secondaryButtonIcon = "x";
    } else if (estado === "Desactivada") {
        color = 'yellow';
        style.cardClass = "border-yellow-300 bg-gray-50 shadow-lg opacity-75";
        style.statusClass = "bg-yellow-100 text-yellow-700 border-yellow-300";
        style.statusText = "Desactivada";
        style.mainButtonClass = "bg-green-500 hover:bg-green-600";
        style.mainButtonText = "Habilitar";
        style.mainButtonIcon = "check";
        style.secondaryButtonClass = "bg-gray-400 hover:bg-gray-500 cursor-not-allowed";
        style.secondaryButtonText = "Editar";
        style.secondaryButtonIcon = "edit-3";
    }
    
    style.iconWrapperClass = `p-2 border-2 rounded-lg border-${color}-400 bg-${color}-50`;
    style.iconColorClass = `text-${color}-500`;

    return style;
}

// =========================================================
// Renderizar mesas
// =========================================================

function renderMesas(data) {
    mesasContainer.innerHTML = "";
    
    if (!data || data.length === 0) {
        mesasContainer.innerHTML = '<p class="text-gray-500 italic col-span-full text-center py-8">No hay mesas registradas.</p>';
        return;
    }

    mesasData = data;

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

            <div class="flex gap-2">
                ${mesa.estado !== "Desactivada" ? `
                    <button data-id="${mesa.id}" data-action="order" data-name="${mesa.nombre}" data-estado="${mesa.estado}"
                            class="flex-[2] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-white font-medium shadow-md ${styles.mainButtonClass} transition-colors">
                        <i data-lucide="${styles.mainButtonIcon}" class="w-4 h-4"></i>
                        <span>${styles.mainButtonText}</span>
                    </button>
                ` : ''}
                
                <button data-id="${mesa.id}" data-action="${mesa.estado === 'Desactivada' ? 'toggle' : 'toggle'}" data-status="${mesa.estado}"
                        class="flex-1 flex items-center justify-center py-2 px-3 rounded-xl text-white font-medium shadow-md ${mesa.estado === 'Desactivada' ? styles.mainButtonClass : styles.secondaryButtonClass} transition-colors">
                    <i data-lucide="${mesa.estado === 'Desactivada' ? styles.mainButtonIcon : styles.secondaryButtonIcon}" class="w-4 h-4"></i>
                </button>
                
                ${mesa.estado !== "Desactivada" ? `
                    <button data-id="${mesa.id}" data-action="edit"
                            class="flex-1 flex items-center justify-center py-2 px-3 rounded-xl text-white font-medium bg-gray-500 hover:bg-gray-600 shadow-md transition-colors">
                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </button>
                ` : ''}
            </div>
        `;

        mesasContainer.appendChild(card);
        
        // Inicializar iconos de Lucide
        if (window.lucide) {
            lucide.createIcons();
        }
        
        // Agregar event listeners
        card.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                handleTableAction(
                    button.dataset.id,
                    button.dataset.action,
                    button.dataset.status || mesa.estado,
                    button.dataset.name || mesa.nombre
                );
            });
        });
    });
}

// =========================================================
// Obtener mesas desde la API
// =========================================================

async function fetchTables() {
    try {
        console.log("🔍 Obteniendo mesas...");
        
        const response = await api.get('/tables/');
        console.log("📡 Respuesta API:", response);
        
        const apiMesas = response.data.items;
        
        const transformedMesas = apiMesas.map(mesa => ({
            ...mesa,
            id: mesa.id,
            nombre: mesa.name || `Mesa #${mesa.id}`,
            capacidad: mesa.capacity || 0,
            estado: getStatusName(mesa.id_status),
            ubicacion: getLocationName(mesa.id_location),
            id_location: mesa.id_location,
            id_status: mesa.id_status,
        }));

        console.log(`✅ ${transformedMesas.length} mesas cargadas`);
        renderMesas(transformedMesas);

    } catch (error) {
        console.error("❌ Error al obtener las mesas:", error);
        console.error("📊 Detalles:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url
        });
        mesasContainer.innerHTML = '<p class="text-red-500 italic col-span-full text-center py-8">Error al cargar las mesas. Intente nuevamente.</p>';
    }
}

// =========================================================
// Manejar acciones de las mesas
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

    if (action === "toggle") {
        let nuevoEstadoLocal = estadoActual === "Desactivada" ? "Disponible" : "Desactivada";
        const nuevoEstadoApiId = statusMap[nuevoEstadoLocal];

        if (!nuevoEstadoApiId) {
            alert("Error: Estado de destino no reconocido.");
            return;
        }

        if (confirm(`¿Está seguro de cambiar el estado de ${nombreMesa} a ${nuevoEstadoLocal}?`)) {
            try {
                await api.patch(`/tables/${mesaId}/status`, { 
                    id_status: nuevoEstadoApiId
                });

                console.log(`✅ ${nombreMesa} cambiada a: ${nuevoEstadoLocal}`);
                fetchTables();

            } catch (error) {
                console.error(`❌ Error al actualizar estado:`, error);
                alert(`Error al actualizar estado: ${error.response?.data?.detail || error.message}`);
            }
        }
    } else if (action === "edit") {
        const mesa = mesasData.find(m => m.id === mesaId);
        if (mesa) showEditModal(mesa);
    }
}

// =========================================================
// Crear nueva mesa
// =========================================================

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const ubicacionNombre = document.getElementById("ubicacion").value;
    const estadoLocal = document.getElementById("estado").value;
    const capacidad = parseInt(document.getElementById("capacidad").value);

    const id_location = locationMap[ubicacionNombre];
    const id_status = statusMap[estadoLocal];
    
    if (!id_location || !id_status) {
        console.error("Mapeo fallido:", { ubicacionNombre, estadoLocal });
        alert("Error: El estado o ubicación seleccionados no son válidos.");
        return;
    }

    const newTableData = {
        name: `Mesa ${mesasData.length + 1}`,
        id_location: id_location,
        capacity: capacidad,
        id_status: id_status,
    };
    
    console.log("📤 Creando mesa:", newTableData);

    try {
        const response = await api.post('/tables/', newTableData);
        
        alert(`Mesa creada con éxito: ${response.data.name}`);
        hideModal();
        fetchTables();

    } catch (error) {
        console.error("❌ Error al crear la mesa:", error.response?.data || error.message);
        alert(`Error al crear la mesa: ${error.response?.data?.detail || error.message}`);
    }
}

// =========================================================
// Modal de edición
// =========================================================

const modalEditar = document.getElementById("modal-editar-mesa");
const formEditarMesa = document.getElementById("form-editar-mesa");
const cancelarEditarBtn = document.getElementById("cancelar-editar-btn");

let mesaEditando = null;

function showEditModal(mesa) {
    mesaEditando = mesa;

    document.getElementById("editar-nombre").value = mesa.nombre;
    document.getElementById("editar-ubicacion").value = mesa.ubicacion;
    document.getElementById("editar-estado").value = mesa.estado;
    document.getElementById("editar-capacidad").value = mesa.capacidad;

    modalEditar.classList.remove("hidden");
    setTimeout(() => {
        modalEditar.classList.add("opacity-100");
        modalEditar.querySelector("div").classList.remove("scale-95");
        modalEditar.querySelector("div").classList.add("scale-100");
    }, 10);
}

function hideEditModal() {
    modalEditar.classList.remove("opacity-100");
    modalEditar.querySelector("div").classList.add("scale-95");
    modalEditar.querySelector("div").classList.remove("scale-100");
    
    setTimeout(() => {
        modalEditar.classList.add("hidden");
        formEditarMesa.reset();
        mesaEditando = null;
    }, 300);
}

formEditarMesa.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!mesaEditando) return;

    const nuevoNombre = document.getElementById("editar-nombre").value;
    const nuevaUbicacion = document.getElementById("editar-ubicacion").value;
    const nuevoEstado = document.getElementById("editar-estado").value;
    const nuevaCapacidad = parseInt(document.getElementById("editar-capacidad").value);

    const payload = {
        name: nuevoNombre,
        id_location: locationMap[nuevaUbicacion],
        capacity: nuevaCapacidad,
        id_status: statusMap[nuevoEstado],
    };

    try {
        await api.patch(`/tables/${mesaEditando.id}`, payload);
        alert("Mesa actualizada correctamente.");
        hideEditModal();
        fetchTables();
    } catch (error) {
        console.error("❌ Error al editar mesa:", error.response?.data || error.message);
        alert(`Error al editar mesa: ${error.response?.data?.detail || error.message}`);
    }
});

// =========================================================
// Modales y event listeners
// =========================================================

function showModal() {
    modal.classList.remove("hidden");
    setTimeout(() => {
        modal.classList.add("opacity-100");
        modal.querySelector("div").classList.remove("scale-95");
        modal.querySelector("div").classList.add("scale-100");
    }, 10);
}

function hideModal() {
    modal.classList.remove("opacity-100");
    modal.querySelector("div").classList.add("scale-95");
    modal.querySelector("div").classList.remove("scale-100");
    
    setTimeout(() => {
        modal.classList.add("hidden");
        formCrearMesa.reset();
    }, 300);
}

// =========================================================
// Modal para ver pedido de mesa ocupada
// =========================================================

async function showOrderModal(tableId, tableName) {
    try {
        // Obtener las órdenes de esta mesa
        const response = await api.get('/orders', { 
            params: { 
                limit: 10, 
                deleted: false 
            } 
        });
        
        let orders = [];
        if (Array.isArray(response.data)) orders = response.data;
        else if (response.data.items) orders = response.data.items;
        else if (response.data.data) orders = response.data.data;
        
        // Filtrar órdenes de esta mesa que no estén entregadas
        const tableOrders = orders.filter(o => 
            o.id_table === tableId && 
            o.id_status !== 4 // No mostrar las entregadas
        );
        
        if (tableOrders.length === 0) {
            alert(`No hay pedidos activos para ${tableName}`);
            return;
        }
        
        // Usar la orden más reciente
        const currentOrder = tableOrders[0];
        
        const statusNames = {
            1: "Pendiente",
            2: "En Preparación",
            3: "Listo",
            4: "Entregado"
        };
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md transform transition-all">
                <div class="flex justify-between items-start mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">Pedido de ${tableName}</h2>
                    <button id="close-modal" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="space-y-3 mb-6">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">Orden #</span>
                        <span class="font-bold text-lg">${currentOrder.id}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">Estado</span>
                        <span class="px-3 py-1 rounded-full text-sm font-semibold ${
                            currentOrder.id_status === 1 ? 'bg-yellow-100 text-yellow-700' :
                            currentOrder.id_status === 2 ? 'bg-orange-100 text-orange-700' :
                            currentOrder.id_status === 3 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }">
                            ${statusNames[currentOrder.id_status] || 'Desconocido'}
                        </span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">Total</span>
                        <span class="font-bold text-xl text-indigo-600">${currentOrder.total_value?.toLocaleString() || 0}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">Hora</span>
                        <span class="text-sm text-gray-500">${new Date(currentOrder.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
                
                <div class="flex gap-3">
                    <button id="goto-kitchen" class="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition shadow-md">
                        Ver en Cocina
                    </button>
                    <button id="goto-menu" class="flex-1 bg-gray-500 text-white py-3 rounded-xl font-medium hover:bg-gray-600 transition shadow-md">
                        Agregar Items
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('#close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#goto-kitchen').addEventListener('click', () => {
            window.location.href = `../cocina/cocina.html?highlight=${currentOrder.id}`;
        });
        
        modal.querySelector('#goto-menu').addEventListener('click', () => {
            localStorage.setItem("current_table", tableId);
            localStorage.setItem("current_table_name", tableName);
            window.location.href = `../menu/menu.html?table=${tableId}`;
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
    } catch (error) {
        console.error('❌ Error al obtener pedido:', error);
        alert('Error al cargar los detalles del pedido');
    }
}

// =========================================================
// Inicialización
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Inicializando módulo de mesas (Admin)...");
    fetchTables();
});

crearMesaBtn.addEventListener("click", showModal);
cancelarMesaBtn.addEventListener("click", hideModal);
cancelarEditarBtn.addEventListener("click", hideEditModal);

modal.addEventListener("click", (e) => {
    if (e.target === modal) hideModal();
});

modalEditar.addEventListener("click", (e) => {
    if (e.target === modalEditar) hideEditModal();
});

formCrearMesa.addEventListener("submit", handleFormSubmit);