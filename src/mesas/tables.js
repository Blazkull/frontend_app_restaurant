// tables.js

import api from '../api/api.js';

// =========================================================
// Mapeo de IDs (CRUCIAL para POST/PATCH)
// Basado en las inserciones de tu script SQL
// =========================================================

// Mapeo 1: Estado (status) - Usamos el ID del status para la API
// Status ID 3: 'Ocupada', Status ID 4: 'Disponible'
const statusMap = {
    // Clave: Valor que espera la API, Valor: Nombre local
    "Ocupada": 3,   // ID 3
    "Disponible": 4, // ID 4
    "Desactivada": 2, // Usamos 'Inactivo' (ID 2) para desactivar
};

// Mapeo 2: Ubicación (locations) - Usamos el ID de la ubicación
// Ubicaciones ID 1: 'Salón Principal', ID 2: 'Terraza', ID 3: 'Barra'
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

// Función auxiliar para revertir el ID del estado a texto para el UI (Solo lectura)
function getStatusName(id_status) {
    if (id_status === 3) return "Ocupada";
    if (id_status === 4) return "Disponible";
    if (id_status === 2) return "Desactivada";
    return "Desconocido";
}

// Función auxiliar para obtener el nombre de la ubicación (Solo lectura)
function getLocationName(id_location) {
    if (id_location === 1) return "Salón Principal";
    if (id_location === 2) return "Terraza";
    if (id_location === 3) return "Barra";
    return "Sin Ubicación";
}

/**
 * Función para obtener las clases de estilo y el texto del botón
 * basado en el estado de la mesa (usa el texto local).
 */
function getTableStyles(estado) {
    let style = {};
    let color = '';

    // ... (El resto de la función getTableStyles se mantiene igual)
    if (estado === "Disponible") {
        color = 'green';
        style.cardClass = "border-green-300 bg-white shadow-lg";
        style.statusClass = "bg-green-100 text-green-700 border-green-300";
        style.statusText = "Disponible";
        style.mainButtonClass = "bg-red-500 hover:bg-red-600";
        style.mainButtonText = "Desactivar";
        style.mainButtonIcon = "x";
    } else if (estado === "Ocupada") {
        color = 'red';
        style.cardClass = "border-red-300 bg-white shadow-lg";
        style.statusClass = "bg-red-100 text-red-700 border-red-300";
        style.statusText = "Ocupada";
        style.mainButtonClass = "bg-red-500 hover:bg-red-600";
        style.mainButtonText = "Desactivar";
        style.mainButtonIcon = "x";
    } else if (estado === "Desactivada") {
        color = 'yellow';
        style.cardClass = "border-yellow-300 bg-gray-50 shadow-lg";
        style.statusClass = "bg-yellow-100 text-yellow-700 border-yellow-300";
        style.statusText = "Desactivada";
        style.mainButtonClass = "bg-green-500 hover:bg-green-600";
        style.mainButtonText = "Habilitar";
        style.mainButtonIcon = "check";
    }
    
    style.iconWrapperClass = `p-2 border-2 rounded-lg border-${color}-400 bg-${color}-50`;
    style.iconColorClass = `text-${color}-500`;

    return style;
}

function renderMesas(data) {
    mesasContainer.innerHTML = "";
    
    if (!data || data.length === 0) {
        mesasContainer.innerHTML = '<p class="text-gray-500 italic col-span-full">No hay mesas registradas.</p>';
        return;
    }

    mesasData = data; 

    data.forEach(mesa => {
        const styles = getTableStyles(mesa.estado); 

        const card = document.createElement("div");
        card.className = `p-4 border-2 rounded-xl transition-all duration-300 ${styles.cardClass}`;
        
        // Renderizamos con los nombres (texto) ya mapeados
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div class="${styles.iconWrapperClass}">
                    <svg data-lucide="package" class="w-5 h-5 ${styles.iconColorClass}"></svg>
                </div>
                
                <span class="px-3 py-1 text-xs font-semibold rounded-full border ${styles.statusClass}">${styles.statusText}</span>
            </div>
            <h2 class="font-bold text-xl">${mesa.nombre}</h2>
            
            <p class="text-sm text-gray-600">
                Ubicación: ${mesa.ubicacion}
            </p>
            <p class="text-sm text-gray-600">
                Capacidad: ${mesa.capacidad} personas
            </p>

            <div class="mt-4 flex space-x-2">
                <button data-id="${mesa.id}" data-action="toggle"
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
        
        card.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => handleTableAction(button.dataset.id, button.dataset.action, mesa.estado));
        });
    });
}

// ----------------------------------------------------------------
// FUNCIÓN PARA OBTENER DATOS DE LA API (Lectura)
// ----------------------------------------------------------------

async function fetchTables() {
    try {
        const response = await api.get('/tables/');
        const apiMesas = response.data;
        
        // Mapeamos los IDs de la API a nombres de texto para el UI
        const transformedMesas = apiMesas.map(mesa => ({
            ...mesa,
            id: mesa.id,
            nombre: mesa.name || `Mesa #${mesa.id}`,
            capacidad: mesa.capacity || 0,
            
            // CONVERTIMOS ID A NOMBRE PARA MOSTRAR EN LA UI
            estado: getStatusName(mesa.id_status), 
            ubicacion: getLocationName(mesa.id_location), 
            
            // Mantenemos los IDs originales por si son necesarios para otras operaciones
            id_location: mesa.id_location,
            id_status: mesa.id_status,
        }));

        renderMesas(transformedMesas);

    } catch (error) {
        console.error("Error al obtener las mesas:", error);
        mesasContainer.innerHTML = '<p class="text-red-500 italic col-span-full">Error al cargar las mesas. Intente nuevamente.</p>';
    }
}


// ----------------------------------------------------------------
// FUNCIONES DE ACCIÓN CON LA API (Escritura)
// ----------------------------------------------------------------

async function handleTableAction(id, action, estadoActual) {
    const mesaId = parseInt(id);

    if (action === "toggle") {
        // Lógica para determinar el nuevo estado local y obtener su ID
        let nuevoEstadoLocal = estadoActual === "Desactivada" ? "Disponible" : "Desactivada";
        
        // ¡Usamos el mapeo de estado para obtener el ID!
        const nuevoEstadoApiId = statusMap[nuevoEstadoLocal];

        if (!nuevoEstadoApiId) {
            alert("Error: Estado de destino no reconocido.");
            return;
        }

        if (confirm(`¿Está seguro de cambiar el estado de la Mesa #${mesaId} a ${nuevoEstadoLocal}?`)) {
            try {
                // ENVIAMOS EL ID DE ESTADO REQUERIDO POR LA DB
                await api.patch(`/tables/${mesaId}/`, { 
                    id_status: nuevoEstadoApiId // Campo de la DB
                });
                
                alert(`Mesa #${mesaId} cambiada a estado: ${nuevoEstadoLocal}`);
                fetchTables(); 

            } catch (error) {
                console.error(`Error al actualizar estado de Mesa #${mesaId}:`, error);
                alert(`Error al actualizar estado: ${error.message}`);
            }
        }
    } else if (action === "edit") {
        alert(`(Demo) Abrir formulario de edición para Mesa ${mesaId}.`);
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Obtenemos los nombres (ej. "Salón Principal")
    const ubicacionNombre = document.getElementById("ubicacion").value;
    const estadoLocal = document.getElementById("estado").value; 
    const capacidad = parseInt(document.getElementById("capacidad").value);

    // CONVERTIMOS LOS NOMBRES DEL FORMULARIO A LOS IDs DE LA DB
    const id_location = locationMap[ubicacionNombre];
    const id_status = statusMap[estadoLocal];
    
    // Verificación de IDs
    if (!id_location || !id_status) {
        console.error("Mapeo fallido:", { ubicacionNombre, estadoLocal });
        alert("Error de mapeo: El estado o ubicación seleccionados no tienen un ID válido para la API.");
        return;
    }

    // CREAMOS EL OBJETO DE DATOS PARA LA API
    // Usamos los nombres de campos de la tabla MySQL: name, id_location, capacity, id_status
    const newTableData = {
        name: `Mesa ${mesasData.length + 1}`, 
        id_location: id_location,
        capacity: capacidad,
        id_status: id_status,
        // id_user_assigned: null, // Opcional, puede no enviarse si la API lo maneja como NULL por defecto
    };
    
    // Muestra el payload final que se envía para depuración
    console.log("Payload enviado:", newTableData); 

    try {
        const response = await api.post('/tables/', newTableData);
        
        alert(`Mesa creada con éxito: ${response.data.name}`);

        hideModal();
        fetchTables(); 

    } catch (error) {
        // La razón del error 422 debe aparecer aquí en el console.error
        console.error("Error al crear la mesa:", error.response ? error.response.data : error.message);
        alert(`Error al crear la mesa. Revise la consola. El API probablemente requiere otros campos.`);
    }
}


// ----------------------------------------------------------------
// EVENT LISTENERS Y UI (se mantienen sin cambios)
// ----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    fetchTables();
});

crearMesaBtn.addEventListener("click", showModal);
cancelarMesaBtn.addEventListener("click", hideModal);
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        hideModal();
    }
});
formCrearMesa.addEventListener("submit", handleFormSubmit);

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