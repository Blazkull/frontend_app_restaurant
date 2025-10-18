// Datos de prueba basados en la imagen
let clientesDemo = [
    { id: 1, nombre: "Lindsey Curtis", direccion: "Cra 87#109A-34", correo: "Lindsey44@gmail.com", cedula: "1045735577", telefono: "+57 3023964845", actualizado: "12 Feb, 2027" },
    { id: 2, nombre: "Kaiya George", direccion: "Cra 87#109A-34", correo: "kaiya.g@mail.com", cedula: "1045735578", telefono: "+57 3023964846", actualizado: "13 Mar, 2027" },
    { id: 3, nombre: "Zoin Geldt", direccion: "Cra 87#109A-34", correo: "zoing@test.com", cedula: "1045735579", telefono: "+57 3023964847", actualizado: "19 Mar, 2027" },
    { id: 4, nombre: "Abram Schleifer", direccion: "Cra 87#109A-34", correo: "abram.s@test.com", cedula: "1045735580", telefono: "+57 3023964848", actualizado: "25 Apr, 2027" },
    { id: 5, nombre: "Carla George", direccion: "Cra 87#109A-34", correo: "carla.g@test.com", cedula: "1045735581", telefono: "+57 3023964849", actualizado: "11 May, 2027" },
    { id: 6, nombre: "Emery Culhane", direccion: "Cra 87#109A-34", correo: "emery.c@test.com", cedula: "1045735582", telefono: "+57 3023964850", actualizado: "29 Jun, 2027" },
    { id: 7, nombre: "Livia Donin", direccion: "Cra 87#109A-34", correo: "livia.d@test.com", cedula: "1045735583", telefono: "+57 3023964851", actualizado: "22 Jul, 2027" },
    { id: 8, nombre: "Miracle Bator", direccion: "Cra 87#109A-34", correo: "miracle.b@test.com", cedula: "1045735584", telefono: "+57 3023964852", actualizado: "05 Aug, 2027" },
    { id: 9, nombre: "Lincoln Herwitz", direccion: "Cra 87#109A-34", correo: "lincoln.h@test.com", cedula: "1045735585", telefono: "+57 3023964853", actualizado: "09 Sep, 2027" },
    { id: 10, nombre: "Ekstrom Bothman", direccion: "Cra 87#109A-34", correo: "ekstrom.b@test.com", cedula: "1045735586", telefono: "+57 3023964854", actualizado: "15 Nov, 2027" },
    // Añadir más datos para simular paginación/total
    { id: 11, nombre: "Andrea García", direccion: "Calle 10#5-20", correo: "andrea@test.com", cedula: "1045735587", telefono: "+57 3023964855", actualizado: "20 Nov, 2027" },
    { id: 12, nombre: "Carlos Vives", direccion: "Av. Caracas 1-1", correo: "carlos@test.com", cedula: "1045735588", telefono: "+57 3023964856", actualizado: "01 Dec, 2027" },
    { id: 13, nombre: "Daniela Castro", direccion: "Cl. 100 #20-5", correo: "daniela@test.com", cedula: "1045735589", telefono: "+57 3023964857", actualizado: "05 Dec, 2027" },
];

const tableBody = document.getElementById("clientes-table-body");
const totalDatosSpan = document.getElementById("total-datos");
const crearClienteBtn = document.getElementById("crear-cliente-btn");
const modal = document.getElementById("modal-creacion-cliente");
const cancelarClienteBtn = document.getElementById("cancelar-cliente-btn");
const formCrearCliente = document.getElementById("form-crear-cliente");

/**
 * Renderiza las filas de clientes en la tabla.
 * NOTA: Esta versión simple renderiza todos los datos. La paginación real
 * y filtrado requerirían más lógica.
 */
function renderClientes(data) {
    tableBody.innerHTML = "";
    totalDatosSpan.textContent = data.length; // Actualiza el total de datos

    data.forEach(cliente => {
        const row = document.createElement("tr");
        row.className = "hover:bg-gray-50 transition duration-150";

        // NOTA: Se ha simplificado la columna 'Cédula' y 'Teléfono' para
        // que coincidan con la imagen original (sin la columna 'Sales Assistant').
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${cliente.nombre}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${cliente.direccion}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${cliente.correo}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${cliente.cedula}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${cliente.telefono}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${cliente.actualizado}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                <button data-id="${cliente.id}" data-action="edit" title="Editar"
                    class="p-1 rounded-full text-primary-blue hover:bg-primary-blue/10 transition duration-150">
                    <svg data-lucide="pencil" class="w-4 h-4"></svg>
                </button>
                <button data-id="${cliente.id}" data-action="delete" title="Eliminar"
                    class="p-1 rounded-full text-red-500 hover:bg-red-500/10 transition duration-150">
                    <svg data-lucide="trash-2" class="w-4 h-4"></svg>
                </button>
            </td>
        `;
        tableBody.appendChild(row);

        // Agregar listeners para botones (Demo)
        row.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => handleClienteAction(button.dataset.id, button.dataset.action));
        });
    });
    // Volver a crear los íconos de Lucide
    lucide.createIcons();
}

/**
 * Maneja las acciones de Editar/Eliminar (Demo).
 */
function handleClienteAction(id, action) {
    alert(`(Demo) Acción: ${action} para el Cliente ID: ${id}`);
    if (action === 'delete') {
        const index = clientesDemo.findIndex(c => c.id === parseInt(id));
        if (index > -1) {
            clientesDemo.splice(index, 1); // Eliminar de los datos de prueba
            renderClientes(clientesDemo); // Volver a renderizar
        }
    }
    // Para 'edit', se abriría el modal con los datos del cliente
}


// --- Lógica del Modal ---

/** Muestra el modal de creación */
function showModal() {
    modal.classList.remove("hidden");
    // Animación de entrada
    setTimeout(() => {
        modal.classList.add("opacity-100");
        modal.querySelector("div").classList.remove("scale-95");
        modal.querySelector("div").classList.add("scale-100");
    }, 10);
}

/** Oculta el modal de creación */
function hideModal() {
    // Animación de salida
    modal.classList.remove("opacity-100");
    modal.querySelector("div").classList.add("scale-95");
    modal.querySelector("div").classList.remove("scale-100");
    
    // Oculta completamente después de la transición
    setTimeout(() => {
        modal.classList.add("hidden");
        formCrearCliente.reset(); // Limpiar el formulario
    }, 300); 
}

/** Maneja el envío del formulario */
function handleFormSubmit(event) {
    event.preventDefault();
    
    const nombre = document.getElementById("nombre-cliente").value;
    const cedula = document.getElementById("cedula-cliente").value;
    const correo = document.getElementById("correo-cliente").value;
    const telefono = document.getElementById("telefono-cliente").value;
    const direccion = document.getElementById("direccion-cliente").value;

    // Encontrar el ID más alto
    const nextId = clientesDemo.length > 0 ? Math.max(...clientesDemo.map(c => c.id)) + 1 : 1;
    const fechaActual = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/\./g, '');

    const nuevoCliente = {
        id: nextId,
        nombre: nombre,
        direccion: direccion,
        correo: correo,
        cedula: cedula,
        telefono: telefono,
        actualizado: fechaActual.replace(' ', ', ') // Formato: 12 Feb, 2027
    };

    // Agregar el nuevo cliente al arreglo (DEMO)
    clientesDemo.push(nuevoCliente);
    
    alert(`Cliente "${nombre}" (${cedula}) creado con éxito.`);

    // Volver a renderizar la tabla
    renderClientes(clientesDemo);

    // Ocultar el modal
    hideModal();
}

// ----------------------------------------------------------------
// EVENT LISTENERS
// ----------------------------------------------------------------

// 1. Render inicial
document.addEventListener('DOMContentLoaded', () => {
    renderClientes(clientesDemo);
});

// 2. Abrir Modal al hacer clic en "Crear Cliente"
crearClienteBtn.addEventListener("click", showModal);

// 3. Cerrar Modal (botón Cancelar)
cancelarClienteBtn.addEventListener("click", hideModal);

// 4. Cerrar Modal (clic fuera del contenido del modal)
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        hideModal();
    }
});

// 5. Enviar formulario
formCrearCliente.addEventListener("submit", handleFormSubmit);