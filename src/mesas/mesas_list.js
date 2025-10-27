// // Datos de prueba (se mantienen igual)
// let mesasDemo = [
//     { "id": 1, "nombre": "Mesa 1", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Disponible" },
//     { "id": 2, "nombre": "Mesa 2", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Disponible" },
//     { "id": 3, "nombre": "Mesa 3", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Disponible" },
    
//     { "id": 4, "nombre": "Mesa 4", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Ocupada" },
//     { "id": 5, "nombre": "Mesa 5", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Ocupada" },
//     { "id": 6, "nombre": "Mesa 6", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Ocupada" },
    
//     { "id": 7, "nombre": "Mesa 7", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Desactivada" },
//     { "id": 8, "nombre": "Mesa 8", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Desactivada" },
//     { "id": 9, "nombre": "Mesa 9", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Desactivada" },

//     // Más mesas para completar la vista
//     { "id": 10, "nombre": "Mesa 10", "ubicacion": "Terraza", "capacidad": 6, "estado": "Ocupada" },
//     { "id": 11, "nombre": "Mesa 11", "ubicacion": "Reservado", "capacidad": 2, "estado": "Disponible" },
//     { "id": 12, "nombre": "Mesa 12", "ubicacion": "Salón Principal", "capacidad": 4, "estado": "Disponible" },
// ];

const mesasContainer = document.getElementById("mesas-container");

/**
 * Función para obtener las clases de estilo y el texto
 * basado en el estado de la mesa.
 */
function getTableStyles(estado) {
    let style = {};
    let color = ''; 

    if (estado === "Disponible") {
        color = 'green';
        style.cardClass = "border-green-300 bg-white shadow-lg";
        style.statusClass = "bg-green-100 text-green-700 border-green-300";
        style.statusText = "Disponible";
    } else if (estado === "Ocupada") {
        color = 'red';
        style.cardClass = "border-red-300 bg-white shadow-lg";
        style.statusClass = "bg-red-100 text-red-700 border-red-300";
        style.statusText = "Ocupada";
    } else if (estado === "Desactivada") {
        color = 'yellow';
        style.cardClass = "border-yellow-300 bg-gray-50 shadow-lg";
        style.statusClass = "bg-yellow-100 text-yellow-700 border-yellow-300";
        style.statusText = "Desactivada";
    }
    
    style.iconWrapperClass = `p-2 border-2 rounded-lg border-${color}-400 bg-${color}-50`;
    style.iconColorClass = `text-${color}-500`;

    return style;
}

/**
 * Renderiza todas las tarjetas de mesa en el contenedor (Vista Mesero).
 * @param {Array<object>} data - Arreglo de objetos de mesa.
 */
function renderMesasMesero(data) {
    mesasContainer.innerHTML = "";
    
    if (!data || data.length === 0) {
        mesasContainer.innerHTML = '<p class="text-gray-500 italic col-span-full">No hay mesas registradas.</p>';
        return;
    }

    

    data.forEach(mesa => {
        const styles = getTableStyles(mesa.estado);

        const card = document.createElement("div");
        // Clase de la tarjeta: solo se usa el borde de color del estado
        card.className = `p-4 border-2 rounded-xl transition-all duration-300 ${styles.cardClass}`;
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div class="${styles.iconWrapperClass}">
                    <svg data-lucide="package" class="w-5 h-5 ${styles.iconColorClass}"></svg>
                </div>
                
                <span class="px-3 py-1 text-xs font-semibold rounded-full border border-current ${styles.statusClass}">${styles.statusText}</span>
            </div>
            
            <h2 class="font-bold text-xl">${mesa.nombre}</h2>
            
            <p class="text-sm text-gray-600">
                Ubicación: ${mesa.ubicacion}
            </p>
            <p class="text-sm text-gray-600">
                Capacidad: ${mesa.capacidad} personas
            </p>
            `;

        mesasContainer.appendChild(card);
        
        // Inicializar íconos de Lucide
        lucide.createIcons();
    });
}

// ----------------------------------------------------------------
// EVENT LISTENERS
// ----------------------------------------------------------------

// 1. Render inicial
document.addEventListener('DOMContentLoaded', () => {
    renderMesasMesero(mesasDemo);
});

// NOTA: Se eliminan todos los event listeners de botones y modal (crearMesaBtn, cancelarMesaBtn, formCrearMesa)