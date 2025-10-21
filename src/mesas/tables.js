// tables.js

import api from '../api/api.js';

// =========================================================
// Mapeo de IDs (CRUCIAL para POST/PATCH)
// =========================================================

// Mapeo 1: Estado (status)
const statusMap = {
    "Ocupada": 3,   
    "Disponible": 4, 
    "Desactivada": 2, 
};

// Mapeo 2: Ubicación (locations)
const locationMap = {
    "Salón Principal": 1, 
    "Terraza": 2,         
    "Barra": 3,           
    "Reservado": 4,       
};

// Mapeo 3: Mapeo Inverso (ID -> Nombre) para poblar el modal de edición
const statusNameMap = {
    3: "Ocupada",
    4: "Disponible",
    2: "Desactivada",
};

const locationNameMap = {
    1: "Salón Principal",
    2: "Terraza",
    3: "Barra",
    4: "Reservado",
};

const mesasContainer = document.getElementById("mesas-container");
const crearMesaBtn = document.getElementById("crear-mesa-btn");

// MODAL DE CREACIÓN
const modalCreacion = document.getElementById("modal-creacion-mesa");
const cancelarMesaBtn = document.getElementById("cancelar-mesa-btn");
const formCrearMesa = document.getElementById("form-crear-mesa");

// NUEVOS ELEMENTOS DEL MODAL DE EDICIÓN
const modalEdicion = document.getElementById("modal-edicion-mesa");
const cancelarEdicionBtn = document.getElementById("cancelar-edicion-btn");
const formEditarMesa = document.getElementById("form-editar-mesa");
const editMesaIdField = document.getElementById("edit-mesa-id");


let mesasData = []; 

// =========================================================
// DATOS MOCK DE MESAS (RESPALDO EN CASO DE ERROR DE API)
// =========================================================
const MOCK_MESAS = [
    { id: 1, name: "Mesa 1", capacity: 4, id_location: 1, id_status: 4 }, // Disponible
    { id: 2, name: "Mesa 2", capacity: 6, id_location: 1, id_status: 3 }, // Ocupada
    { id: 3, name: "Mesa 3", capacity: 2, id_location: 2, id_status: 4 }, // Disponible
    { id: 4, name: "Mesa 4", capacity: 8, id_location: 4, id_status: 2 }, // Desactivada
];


// Funciones auxiliares simplificadas usando los nuevos mapeos inversos
function getStatusName(id_status) {
    return statusNameMap[id_status] || "Desconocido";
}

function getLocationName(id_location) {
    return locationNameMap[id_location] || "Sin Ubicación";
}

// ... (getTableStyles se mantiene igual, ya que usa el nombre del estado) ...
function getTableStyles(estado) {
    let style = {};
    let color = '';

    if (estado === "Disponible") {
        color = 'green';
        style.cardClass = "border-green-300 bg-white shadow-lg";
        style.statusClass = "bg-green-100 text-green-700 border-green-300";
        style.statusText = "Disponible";
        style.mainButtonClass = "bg-primary-blue hover:bg-blue-700";
        style.mainButtonText = "Ver Comanda";
        style.mainButtonIcon = "eye";
    } else if (estado === "Ocupada") {
        color = 'red';
        style.cardClass = "border-red-300 bg-white shadow-lg";
        style.statusClass = "bg-red-100 text-red-700 border-red-300";
        style.statusText = "Ocupada";
        style.mainButtonClass = "bg-red-500 hover:bg-red-600";
        style.mainButtonText = "Ir a Comanda";
        style.mainButtonIcon = "utensils";
    } else if (estado === "Desactivada") {
        color = 'yellow';
        style.cardClass = "border-yellow-300 bg-gray-50 shadow-lg";
        style.statusClass = "bg-yellow-100 text-yellow-700 border-yellow-300";
        style.statusText = "Desactivada";
        style.mainButtonClass = "bg-green-500 hover:bg-green-600";
        style.mainButtonText = "Habilitar";
        style.mainButtonIcon = "check";
    } else {
        color = 'gray';
        style.cardClass = "border-gray-300 bg-gray-100 shadow-md";
        style.statusClass = "bg-gray-200 text-gray-700 border-gray-300";
        style.statusText = estado;
        style.mainButtonClass = "bg-gray-400 hover:bg-gray-500";
        style.mainButtonText = "Acción";
        style.mainButtonIcon = "package";
    }
    
    style.iconWrapperClass = `p-2 border-2 rounded-lg border-${color}-400 bg-white/50`;
    style.iconColorClass = `text-${color}-500`;

    return style;
}


function renderMesas(data) {
    mesasContainer.innerHTML = "";
    
    if (!data || data.length === 0) {
        mesasContainer.innerHTML = '<p class="text-gray-500 italic col-span-full">No hay mesas registradas. Verifique la API o los datos mock.</p>';
        return;
    }

    // Almacenamos los datos crudos (con IDs) para facilitar la edición
    mesasData = data; 

    data.forEach(mesa => {
        // Obtenemos los nombres de estado y ubicación mapeados
        const estadoNombre = getStatusName(mesa.id_status); 
        const ubicacionNombre = getLocationName(mesa.id_location); 
        const styles = getTableStyles(estadoNombre); 

        const card = document.createElement("div");
        card.className = `p-4 border-2 rounded-xl transition-all duration-300 ${styles.cardClass}`;
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div class="${styles.iconWrapperClass}">
                    <svg data-lucide="package" class="w-5 h-5 ${styles.iconColorClass}"></svg>
                </div>
                
                <span class="px-3 py-1 text-xs font-semibold rounded-full border ${styles.statusClass}">${styles.statusText}</span>
            </div>
            <h2 class="font-bold text-xl">${mesa.name || `Mesa #${mesa.id}`}</h2>
            
            <p class="text-sm text-gray-600">
                Ubicación: ${ubicacionNombre}
            </p>
            <p class="text-sm text-gray-600">
                Capacidad: ${mesa.capacity} personas
            </p>

            <div class="mt-4 flex space-x-2">
                <button data-id="${mesa.id}" data-action="${estadoNombre === 'Desactivada' ? 'toggle' : 'comanda'}"
                        class="flex-1 flex items-center justify-center py-2 px-3 rounded-xl text-white font-medium shadow-md ${styles.mainButtonClass}">
                    <span>${styles.mainButtonText}</span>
                    <i data-lucide="${styles.mainButtonIcon}" class="w-4 h-4 ml-1"></i>
                </button>

                <button data-id="${mesa.id}" data-action="edit"
                        class="w-1/3 flex items-center justify-center py-2 px-3 rounded-xl text-white font-medium bg-primary-blue hover:bg-blue-700 shadow-md">
                    <span>Editar</span>
                    <i data-lucide="edit-3" class="w-4 h-4 ml-1"></i>
                </button>
            </div>
        `;

        mesasContainer.appendChild(card);
        lucide.createIcons();
        
        // Adjuntamos el evento aquí para que sea dinámico
        card.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => handleTableAction(button.dataset.id, button.dataset.action, estadoNombre));
        });
    });
}

// ----------------------------------------------------------------
// FUNCIÓN PARA OBTENER DATOS DE LA API (Lectura)
// ----------------------------------------------------------------

async function fetchTables() {
    let apiMesas = [];
    let isApiDataValid = false;
    
    try {
        const response = await api.get('/tables/');
        
        const dataItems = response.data.items || response.data;
        
        if (dataItems && Array.isArray(dataItems) && dataItems.length > 0) {
            apiMesas = dataItems;
            isApiDataValid = true;
        }

    } catch (error) {
        console.error("Error al obtener las mesas desde la API. Usando datos mock. Error:", error);
    }
    
    if (!isApiDataValid) {
        apiMesas = MOCK_MESAS;
    }
    
    renderMesas(apiMesas);
}


// ----------------------------------------------------------------
// FUNCIONES DE ACCIÓN CON LA API (Escritura)
// ----------------------------------------------------------------

async function handleTableAction(id, action, estadoActual) {
    const mesaId = parseInt(id);
    
    if (action === "toggle") {
        // ... (La lógica de toggle se mantiene igual) ...
        let nuevoEstadoLocal = estadoActual === "Desactivada" ? "Disponible" : "Desactivada";
        
        const nuevoEstadoApiId = statusMap[nuevoEstadoLocal];

        if (!nuevoEstadoApiId) {
            alert("Error: Estado de destino no reconocido.");
            return;
        }

        if (confirm(`¿Está seguro de cambiar el estado de la Mesa #${mesaId} a ${nuevoEstadoLocal}?`)) {
            try {
                await api.patch(`/tables/${mesaId}/`, { 
                    id_status: nuevoEstadoApiId 
                });
                
                alert(`Mesa #${mesaId} cambiada a estado: ${nuevoEstadoLocal}`);
                fetchTables(); 

            } catch (error) {
                console.error(`Error al actualizar estado de Mesa #${mesaId}:`, error.response ? error.response.data : error.message);
                alert(`Error al actualizar estado: ${error.response ? error.response.data.detail : error.message}`);
            }
        }
    } else if (action === "comanda") {
        alert(`(Demo) Redirigir a Comanda para Mesa ${mesaId}. Estado: ${estadoActual}.`);
    } else if (action === "edit") {
        // Nueva lógica para edición
        showEditModal(mesaId);
    }
}

// ----------------------------------------------------------------
// GESTIÓN DEL MODAL DE EDICIÓN
// ----------------------------------------------------------------

function showEditModal(id) {
    const mesaToEdit = mesasData.find(m => m.id === id);

    if (!mesaToEdit) {
        alert("Error: Mesa no encontrada.");
        return;
    }

    // 1. Llenar los campos del modal con los datos actuales
    document.getElementById("mesa-id-display").textContent = `#${mesaToEdit.id}`;
    editMesaIdField.value = mesaToEdit.id;
    document.getElementById("edit-nombre").value = mesaToEdit.name || '';
    document.getElementById("edit-capacidad").value = mesaToEdit.capacity;
    
    // Convertir IDs a nombres para preseleccionar los <select>
    const estadoNombre = getStatusName(mesaToEdit.id_status);
    const ubicacionNombre = getLocationName(mesaToEdit.id_location);
    
    document.getElementById("edit-estado").value = estadoNombre;
    document.getElementById("edit-ubicacion").value = ubicacionNombre;
    
    // 2. Mostrar el modal de edición usando la función showModal genérica, pero apuntando a modalEdicion
    showModal(modalEdicion);
}

async function handleEditFormSubmit(event) {
    event.preventDefault();
    
    const mesaId = parseInt(editMesaIdField.value);
    
    // 1. Obtener valores del formulario (en nombre/texto)
    const nombre = document.getElementById("edit-nombre").value;
    const ubicacionNombre = document.getElementById("edit-ubicacion").value;
    const estadoLocal = document.getElementById("edit-estado").value; 
    const capacidad = parseInt(document.getElementById("edit-capacidad").value);

    // 2. Convertir nombres a IDs de la DB
    const id_location = locationMap[ubicacionNombre];
    const id_status = statusMap[estadoLocal];
    
    if (!id_location || !id_status) {
        alert("Error de mapeo: El estado o ubicación seleccionados no tienen un ID válido para la API.");
        return;
    }

    // 3. Crear el payload (usamos PATCH, solo enviamos los campos a actualizar)
    const updatedTableData = {
        name: nombre,
        id_location: id_location,
        capacity: capacidad,
        id_status: id_status,
    };
    
    console.log(`Payload PATCH para Mesa #${mesaId}:`, updatedTableData); 

    try {
        // 4. Enviar la solicitud PATCH
        const response = await api.patch(`/tables/${mesaId}/`, updatedTableData);
        
        alert(`Mesa #${mesaId} actualizada con éxito.`);

        hideModal(modalEdicion);
        fetchTables(); // Recargar la lista para ver los cambios

    } catch (error) {
        console.error(`Error al editar la Mesa #${mesaId}:`, error.response ? error.response.data : error.message);
        alert(`Error al guardar cambios: ${error.response ? error.response.data.detail : error.message}`);
    }
}

// ----------------------------------------------------------------
// GESTIÓN DEL MODAL DE CREACIÓN (Se mantiene igual)
// ----------------------------------------------------------------

async function handleCreateFormSubmit(event) {
    event.preventDefault();
    
    // ... (Lógica de creación de mesa se mantiene igual)
    const ubicacionNombre = document.getElementById("ubicacion").value;
    const estadoLocal = document.getElementById("estado").value; 
    const capacidad = parseInt(document.getElementById("capacidad").value);

    const id_location = locationMap[ubicacionNombre];
    const id_status = statusMap[estadoLocal];
    
    if (!id_location || !id_status) {
        alert("Error de mapeo: El estado o ubicación seleccionados no tienen un ID válido para la API.");
        return;
    }

    const newTableData = {
        name: `Mesa ${mesasData.length + 1}`, // Nombre temporal
        id_location: id_location,
        capacity: capacidad,
        id_status: id_status,
    };
    
    try {
        const response = await api.post('/tables/', newTableData);
        
        alert(`Mesa creada con éxito: ${response.data.name || response.data.id}`);

        hideModal(modalCreacion);
        fetchTables(); 

    } catch (error) {
        console.error("Error al crear la mesa:", error.response ? error.response.data : error.message);
        alert(`Error al crear la mesa. Revise la consola.`);
    }
}


// ----------------------------------------------------------------
// FUNCIONES GENÉRICAS DE UI Y EVENT LISTENERS
// ----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    fetchTables();
});

// Event Listeners para ambos formularios/botones
crearMesaBtn.addEventListener("click", () => showModal(modalCreacion));
cancelarMesaBtn.addEventListener("click", () => hideModal(modalCreacion));
formCrearMesa.addEventListener("submit", handleCreateFormSubmit);

cancelarEdicionBtn.addEventListener("click", () => hideModal(modalEdicion));
formEditarMesa.addEventListener("submit", handleEditFormSubmit); // ¡Nuevo listener de envío!

// Modificamos showModal y hideModal para que sean genéricas
function showModal(targetModal) {
    targetModal.classList.remove("hidden");
    setTimeout(() => {
        targetModal.classList.add("opacity-100");
        targetModal.querySelector("div").classList.remove("scale-95");
        targetModal.querySelector("div").classList.add("scale-100");
    }, 10);
}

function hideModal(targetModal) {
    targetModal.classList.remove("opacity-100");
    targetModal.querySelector("div").classList.add("scale-95");
    targetModal.querySelector("div").classList.remove("scale-100");
    
    setTimeout(() => {
        targetModal.classList.add("hidden");
        // Reiniciamos solo el formulario de creación al cerrarse
        if (targetModal.id === "modal-creacion-mesa") {
            formCrearMesa.reset();
        }
    }, 300); 
}

// Listener para cerrar modales al hacer clic fuera
[modalCreacion, modalEdicion].forEach(m => {
    m.addEventListener("click", (e) => {
        if (e.target === m) {
            hideModal(m);
        }
    });
});

// ... (Resto del código de cerrar sesión) ...
const cerrarSesionBtn = document.getElementById('cerrar-sesion-btn');
if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener('click', () => {
        const logoutModal = document.getElementById('logoutModal');
        if (logoutModal) {
            logoutModal.classList.remove("hidden");
        } else {
            alert("(Demo) Cerrar Sesión");
        }
    });
}