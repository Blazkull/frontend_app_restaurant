// Datos de prueba para simular la información de las mesas
let mesasDemo = [
    { "id": 1, "nombre": "Mesa 1", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Disponible" },
    { "id": 2, "nombre": "Mesa 2", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Disponible" },
    { "id": 3, "nombre": "Mesa 3", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Disponible" },
    
    { "id": 4, "nombre": "Mesa 4", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Ocupada" },
    { "id": 5, "nombre": "Mesa 5", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Ocupada" },
    { "id": 6, "nombre": "Mesa 6", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Ocupada" },
    
    { "id": 7, "nombre": "Mesa 7", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Desactivada" },
    { "id": 8, "nombre": "Mesa 8", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Desactivada" },
    { "id": 9, "nombre": "Mesa 9", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Desactivada" },

    // Más mesas para completar la vista
    { "id": 10, "nombre": "Mesa 10", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Ocupada" },
    { "id": 11, "nombre": "Mesa 11", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Ocupada" },
    { "id": 12, "nombre": "Mesa 12", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Ocupada" },
];

const mesasContainer = document.getElementById("mesas-container");
const crearMesaBtn = document.getElementById("crear-mesa-btn");
const modal = document.getElementById("modal-creacion-mesa");
const cancelarMesaBtn = document.getElementById("cancelar-mesa-btn");
const formCrearMesa = document.getElementById("form-crear-mesa");

/**
 * Función para obtener las clases de estilo y el texto del botón
 * basado en el estado de la mesa.
 * @param {string} estado - El estado de la mesa ('Disponible', 'Ocupada', 'Desactivada').
 * @returns {object} Un objeto con las clases CSS y el texto/ícono del botón.
 */
function getTableStyles(estado) {
    let style = {};
    if (estado === "Disponible") {
        style.cardClass = "border-green-300 bg-white shadow-lg";
        style.statusClass = "bg-green-100 text-green-700 border-green-300";
        style.statusText = "Disponible";
        style.mainButtonClass = "bg-red-500 hover:bg-red-600";
        style.mainButtonText = "Desactivar";
        style.mainButtonIcon = "x";
    } else if (estado === "Ocupada") {
        style.cardClass = "border-red-300 bg-white shadow-lg";
        style.statusClass = "bg-red-100 text-red-700 border-red-300";
        style.statusText = "Ocupada";
        style.mainButtonClass = "bg-red-500 hover:bg-red-600";
        style.mainButtonText = "Desactivar";
        style.mainButtonIcon = "x";
    } else if (estado === "Desactivada") {
        style.cardClass = "border-yellow-300 bg-gray-50 shadow-lg";
        style.statusClass = "bg-yellow-100 text-yellow-700 border-yellow-300";
        style.statusText = "Desactivada";
        style.mainButtonClass = "bg-green-500 hover:bg-green-600";
        style.mainButtonText = "Habilitar";
        style.mainButtonIcon = "check";
    }
    return style;
}

/**
 * Renderiza todas las tarjetas de mesa en el contenedor.
 * @param {Array<object>} data - Arreglo de objetos de mesa.
 */
function renderMesas(data) {
    mesasContainer.innerHTML = "";
    
    if (!data || data.length === 0) {
        mesasContainer.innerHTML = '<p class="text-gray-500 italic col-span-full">No hay mesas registradas.</p>';
        return;
    }

    data.forEach(mesa => {
        const styles = getTableStyles(mesa.estado);

        const card = document.createElement("div");
        card.className = `p-4 border-4 rounded-xl transition-all duration-300 ${styles.cardClass}`;
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <h2 class="font-bold text-xl">${mesa.nombre}</h2>
                <span class="px-3 py-1 text-xs font-semibold rounded-full border ${styles.statusClass}">${styles.statusText}</span>
            </div>
            
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
        
        // Inicializar íconos de Lucide
        lucide.createIcons();
        
        // Agregar listeners para botones de acción (Demo)
        card.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => handleTableAction(button.dataset.id, button.dataset.action, mesa.estado));
        });
    });
}

/**
 * Maneja la lógica de las acciones de los botones de cada mesa (Demo).
 */
function handleTableAction(id, action, estadoActual) {
    const mesaId = parseInt(id);
    const mesaIndex = mesasDemo.findIndex(m => m.id === mesaId);

    if (action === "toggle") {
        let nuevoEstado = estadoActual === "Desactivada" ? "Disponible" : "Desactivada";
        alert(`(Demo) Mesa ${mesaId} (${mesasDemo[mesaIndex].nombre}) cambiará a estado: ${nuevoEstado}`);
        // Lógica de actualización de datos (solo demo en cliente)
        if (mesaIndex !== -1) {
            mesasDemo[mesaIndex].estado = nuevoEstado;
            renderMesas(mesasDemo); // Volver a renderizar para reflejar el cambio
        }
    } else if (action === "edit") {
        alert(`(Demo) Abrir formulario de edición para Mesa ${mesaId}`);
        // Aquí se podría cargar el modal con los datos de la mesa para editar
    }
}

/**
 * Muestra el modal de creación.
 */
function showModal() {
    modal.classList.remove("hidden");
    // Añade clases para animación de entrada
    setTimeout(() => {
        modal.classList.add("opacity-100");
        modal.querySelector("div").classList.remove("scale-95");
        modal.querySelector("div").classList.add("scale-100");
    }, 10);
}

/**
 * Oculta el modal de creación.
 */
function hideModal() {
    // Añade clases para animación de salida
    modal.classList.remove("opacity-100");
    modal.querySelector("div").classList.add("scale-95");
    modal.querySelector("div").classList.remove("scale-100");
    
    // Oculta completamente después de la transición
    setTimeout(() => {
        modal.classList.add("hidden");
        formCrearMesa.reset(); // Limpiar el formulario
    }, 300); 
}

/**
 * Maneja el envío del formulario para crear una nueva mesa.
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    const ubicacion = document.getElementById("ubicacion").value;
    const estado = document.getElementById("estado").value;
    const capacidad = parseInt(document.getElementById("capacidad").value);

    // Encontrar el ID más alto para el nuevo pedido
    const nextId = mesasDemo.length > 0 ? Math.max(...mesasDemo.map(m => m.id)) + 1 : 1;

    const nuevaMesa = {
        id: nextId,
        nombre: `Mesa ${nextId}`,
        ubicacion: ubicacion,
        capacidad: capacidad,
        estado: estado
    };

    // Agregar la nueva mesa al arreglo de datos (DEMO)
    mesasDemo.push(nuevaMesa);
    
    alert(`Mesa ${nextId} creada con éxito: Ubicación: ${ubicacion}, Capacidad: ${capacidad}, Estado: ${estado}`);

    // Volver a renderizar las mesas
    renderMesas(mesasDemo);

    // Ocultar el modal
    hideModal();
}

// ----------------------------------------------------------------
// EVENT LISTENERS
// ----------------------------------------------------------------

// 1. Render inicial
document.addEventListener('DOMContentLoaded', () => {
    renderMesas(mesasDemo);
});

// 2. Abrir Modal
crearMesaBtn.addEventListener("click", showModal);

// 3. Cerrar Modal (botón Cancelar)
cancelarMesaBtn.addEventListener("click", hideModal);

// 4. Cerrar Modal (clic fuera del contenido del modal)
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        hideModal();
    }
});

// 5. Enviar formulario
formCrearMesa.addEventListener("submit", handleFormSubmit);

// 6. Botón Cerrar Sesión (Demo)
document.getElementById('cerrar-sesion-btn').addEventListener('click', () => {
    alert("(Demo) Cerrar Sesión");
});