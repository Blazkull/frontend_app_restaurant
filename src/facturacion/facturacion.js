// invoices.js

import api from '../api/api.js';

const invoicesContainer = document.getElementById("invoices-table-body");
const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll("div.flex.space-x-1 button"); // Seleccionamos los botones de filtro

let invoicesData = []; 
let currentInvoiceToDeleteId = null; 

// =========================================================
// Mapeo de IDs (CRUCIAL para PATCH y DELETE)
// Asumimos estos IDs para el estado de la factura
// =========================================================
const statusMap = {
    "Pagada": 1,
    "Pendiente": 2, 
    "Anulada": 3,
    "Draft": 4, // Si tuvieras un estado borrador
};
// Mapeo inverso para poblar el modal de edición
const statusNameMap = {
    1: "Pagada",
    2: "Pendiente",
    3: "Anulada",
    4: "Draft",
};

// =========================================================
// ELEMENTOS MODALES
// =========================================================
const modalEdicion = document.getElementById("modal-edicion-factura");
const formEditarFactura = document.getElementById("form-editar-factura");
const editFacturaIdField = document.getElementById("edit-factura-id");
const cancelarEdicionBtn = document.getElementById("cancelar-edicion-btn");

const modalEliminar = document.getElementById("modal-eliminar-factura");
const confirmDeleteBtn = document.getElementById("confirmar-eliminar-btn");
const cancelDeleteBtn = document.getElementById("cancelar-eliminar-btn");


// =========================================================
// DATOS MOCK DE FACTURAS (PARA DESARROLLO)
// =========================================================
const MOCK_INVOICE_DATA = {
    items: [
        {
            "id": 323534,
            "table_name": "Mesa 3",
            "client_name": "Juan Perez",
            "total": 999.00,
            "status_name": "Pagada", // Mapea a ID 1
            "created_at": "2028-08-07T10:30:00"
        },
        {
            "id": 323535,
            "table_name": "Mesa 10",
            "client_name": "Ninguno",
            "total": 485.50,
            "status_name": "Anulada", // Mapea a ID 3
            "created_at": "2028-08-02T15:00:00"
        },
        {
            "id": 323536,
            "table_name": "Mesa 7",
            "client_name": "Maria Lopez",
            "total": 840.00,
            "status_name": "Pendiente", // Mapea a ID 2
            "created_at": "2028-05-06T19:20:00"
        }
    ]
};


// Función para obtener las clases de estilo del Badge (Status)
function getStatusStyles(statusName) {
    let style = {
        class: "bg-gray-200 text-gray-700",
        text: statusName
    };

    switch (statusName) {
        case "Pagada": 
        case "Pago": 
            style.class = "bg-green-100 text-green-700 font-medium";
            break;
        case "Anulado":
        case "Anulada": 
            style.class = "bg-red-100 text-red-700 font-medium";
            break;
        case "Pendiente": 
            style.class = "bg-yellow-100 text-yellow-700 font-medium";
            break;
        default:
            style.class = "bg-blue-100 text-blue-700 font-medium";
            break;
    }
    return style;
}

// Función auxiliar para formatear la fecha a un formato legible
function formatDate(isoString) {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } catch (e) {
        return isoString.split('T')[0];
    }
}


function renderInvoices(data) {
    invoicesContainer.innerHTML = "";
    invoicesData = data; 

    if (!data || data.length === 0) {
        invoicesContainer.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-gray-500 italic">No se encontraron facturas.</td></tr>';
        return;
    }

    data.forEach(invoice => {
        const status = getStatusStyles(invoice.status_name); 

        const row = document.createElement("tr");
        row.className = "border-b hover:bg-gray-50 transition duration-150";

        // Usamos los campos que la API debe devolver tras los JOINs
        row.innerHTML = `
            <td class="p-3">
                <input type="checkbox" class="rounded border-gray-300 text-primary-blue focus:ring-primary-blue">
            </td>
            <td class="p-3 text-sm text-gray-900 font-semibold">#${invoice.id}</td>
            <td class="p-3 text-sm text-gray-900">${invoice.table_name || 'N/A'}</td>
            <td class="p-3 text-sm text-gray-600">${invoice.client_name || 'Ninguno'}</td>
            <td class="p-3 text-sm text-gray-600">${formatDate(invoice.created_at)}</td>
            <td class="p-3 text-sm text-gray-900 font-semibold">$${invoice.total.toFixed(2)}</td>
            <td class="p-3">
                <span class="px-3 py-1 text-xs font-semibold rounded-full ${status.class}">${status.text}</span>
            </td>
            <td class="p-3 text-sm flex space-x-2">
                <button data-id="${invoice.id}" data-action="edit" title="Editar" 
                    class="p-2 rounded-full text-gray-500 hover:text-primary-blue hover:bg-gray-100 transition">
                    <svg data-lucide="pencil" class="w-4 h-4"></svg>
                </button>
                <button data-id="${invoice.id}" data-action="view" title="Ver/Pagar" 
                    class="p-2 rounded-full text-gray-500 hover:text-green-600 hover:bg-gray-100 transition">
                    <svg data-lucide="eye" class="w-4 h-4"></svg>
                </button>
                <button data-id="${invoice.id}" data-action="delete" title="Eliminar" 
                    class="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-gray-100 transition">
                    <svg data-lucide="trash-2" class="w-4 h-4"></svg>
                </button>
            </td>
        `;

        invoicesContainer.appendChild(row);
        lucide.createIcons();
        
        // Adjuntar event listeners a los botones de acción
        const actionButtons = row.querySelectorAll('button');
        actionButtons.forEach(button => {
            const action = button.dataset.action;
            const id = parseInt(button.dataset.id);

            if (action === "edit") {
                button.addEventListener('click', () => showEditModal(id));
            } else if (action === "delete") {
                button.addEventListener('click', () => showDeleteModal(id));
            } else if (action === "view") {
                 button.addEventListener('click', () => alert(`(Demo) Redirigir a Factura #${id}`));
            }
        });
    });
}

// ----------------------------------------------------------------
// FUNCIÓN PARA OBTENER DATOS DE LA API (Lectura)
// * Valida la conexión y usa los MOCK si falla.
// ----------------------------------------------------------------

async function fetchInvoices(statusFilter = null) {
    let url = '/invoices/';
    
    // Convertir el filtro local (unpaid/paid/draft) a un nombre de estado de la DB
    let statusNameFilter = null;
    if (statusFilter === 'unpaid') {
        statusNameFilter = 'Pendiente'; 
    } else if (statusFilter === 'paid') {
        statusNameFilter = 'Pagada';
    } else if (statusFilter === 'draft') {
        statusNameFilter = 'Draft'; 
    }
    
    // Si hay un filtro por nombre de estado, lo añadimos como query param (Asumiendo que la API lo soporta)
    if (statusNameFilter) {
        url += `?status_name=${statusNameFilter}`; 
    }

    let apiInvoices = [];
    let isApiDataValid = false;
    
    try {
        const response = await api.get(url);
        
        const dataItems = response.data.items || response.data; 

        if (dataItems && dataItems.length > 0) {
            apiInvoices = dataItems;
            isApiDataValid = true;
            console.log("✅ Facturas cargadas correctamente desde la API.");
        }

    } catch (error) {
        console.warn("⚠️ Error al conectar o cargar facturas desde la API. Usando datos mock. Error:", error.response ? error.response.data : error.message);
        // Usar datos mock si la API falla
    }
    
    if (!isApiDataValid) {
        apiInvoices = MOCK_INVOICE_DATA.items;
        
        // Aplicar filtro al mock data si es necesario
        if (statusNameFilter) {
             apiInvoices = apiInvoices.filter(invoice => 
                 invoice.status_name === statusNameFilter
             );
        }
    }
    
    // Mantenemos la estructura de datos limpia para renderizado
    const transformedInvoices = apiInvoices.map(invoice => ({
        id: invoice.id,
        table_name: invoice.table_name,
        client_name: invoice.client_name,
        created_at: invoice.created_at,
        total: invoice.total,
        status_name: invoice.status_name,
    }));

    renderInvoices(transformedInvoices);
}


// ----------------------------------------------------------------
// GESTIÓN DEL MODAL DE EDICIÓN (PATCH)
// ----------------------------------------------------------------

function getStatusName(id) {
    return statusNameMap[id] || "Desconocido";
}

function getStatusId(name) {
    return statusMap[name] || null;
}

function showEditModal(id) {
    const invoiceToEdit = invoicesData.find(i => i.id === id);

    if (!invoiceToEdit) {
        alert("Error: Factura no encontrada en los datos locales.");
        return;
    }

    // 1. Llenar los campos del modal con los datos actuales
    document.getElementById("factura-id-display").textContent = `#${invoiceToEdit.id}`;
    editFacturaIdField.value = invoiceToEdit.id;
    document.getElementById("edit-client-name").value = invoiceToEdit.client_name || '';
    document.getElementById("edit-total").value = invoiceToEdit.total;
    
    // Preseleccionar el <select> de estado usando el nombre
    document.getElementById("edit-status").value = invoiceToEdit.status_name;
    
    // 2. Mostrar el modal
    showModal(modalEdicion);
}

async function handleEditFormSubmit(event) {
    event.preventDefault();
    
    const facturaId = parseInt(editFacturaIdField.value);
    
    // 1. Obtener valores del formulario
    const client_name = document.getElementById("edit-client-name").value;
    const total = parseFloat(document.getElementById("edit-total").value);
    const statusName = document.getElementById("edit-status").value; 

    // 2. Convertir el nombre de estado a ID de la DB
    const id_status = getStatusId(statusName);
    
    if (!id_status) {
        alert("Error: El estado seleccionado no tiene un ID válido para la API.");
        return;
    }

    // 3. Crear el payload
    const updatedInvoiceData = {
        client_name: client_name, // Suponemos que la API acepta este campo
        total: total,
        id_status: id_status, // Usamos el ID para la API
    };
    
    console.log(`Payload PATCH para Factura #${facturaId}:`, updatedInvoiceData); 

    try {
        // 4. Enviar la solicitud PATCH
        await api.patch(`/invoices/${facturaId}/`, updatedInvoiceData);
        
        alert(`Factura #${facturaId} actualizada con éxito.`);

        hideModal(modalEdicion);
        fetchInvoices(); // Recargar la lista para ver los cambios

    } catch (error) {
        console.error(`Error al editar la Factura #${facturaId}:`, error.response ? error.response.data : error.message);
        alert(`Error al guardar cambios: ${error.response ? error.response.data.detail : error.message}`);
    }
}


// ----------------------------------------------------------------
// GESTIÓN DEL MODAL DE ELIMINACIÓN (DELETE)
// ----------------------------------------------------------------

function showDeleteModal(id) {
    currentInvoiceToDeleteId = id;
    document.getElementById("delete-factura-id-display").textContent = `#${id}`;
    showModal(modalEliminar);
}

async function handleDeleteAction() {
    if (!currentInvoiceToDeleteId) return;

    const facturaId = currentInvoiceToDeleteId;
    
    try {
        // Enviar la solicitud DELETE
        await api.delete(`/invoices/${facturaId}/`);
        
        alert(`Factura #${facturaId} eliminada con éxito.`);

        hideModal(modalEliminar);
        currentInvoiceToDeleteId = null; 
        fetchInvoices(); // Recargar la lista

    } catch (error) {
        console.error(`Error al eliminar la Factura #${facturaId}:`, error.response ? error.response.data : error.message);
        alert(`Error al eliminar: ${error.response ? error.response.data.detail : error.message}`);
    }
}


// ----------------------------------------------------------------
// FUNCIONES GENÉRICAS DE UI Y EVENT LISTENERS
// ----------------------------------------------------------------

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
        // Reiniciar formularios si es necesario
        if (targetModal.id === "modal-edicion-factura") {
            formEditarFactura.reset();
        }
    }, 300); 
}


document.addEventListener('DOMContentLoaded', () => {
    // Inicializa la carga de todas las facturas al cargar la página
    fetchInvoices(); 
});


// Event Listeners para el filtrado (se mantienen igual, pero con mejor selector)
filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Lógica para resaltar el botón activo
        filterButtons.forEach(btn => {
            btn.classList.remove('active', 'border-primary-blue', 'text-primary-blue');
            btn.classList.add('border-transparent', 'hover:border-gray-200');
        });
        e.currentTarget.classList.add('active', 'border-primary-blue', 'text-primary-blue');
        e.currentTarget.classList.remove('border-transparent', 'hover:border-gray-200');

        const filter = e.currentTarget.dataset.filter;
        
        let statusToFetch = null;
        if (filter === 'unpaid') {
            statusToFetch = 'unpaid'; 
        } else if (filter === 'paid') {
            statusToFetch = 'paid';
        } else if (filter === 'draft') {
            statusToFetch = 'draft';
        }
        // 'all' no requiere filtro
        
        fetchInvoices(statusToFetch);
    });
});

// Event Listeners para los modales de edición y eliminación
cancelarEdicionBtn.addEventListener("click", () => hideModal(modalEdicion));
formEditarFactura.addEventListener("submit", handleEditFormSubmit);

cancelDeleteBtn.addEventListener("click", () => hideModal(modalEliminar));
confirmDeleteBtn.addEventListener("click", handleDeleteAction);


// Lógica de búsqueda (simple en el cliente) se mantiene igual
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    // Se usa invoicesData (cargado por fetchInvoices)
    const dataToFilter = invoicesData.length > 0 ? invoicesData : MOCK_INVOICE_DATA.items; 

    if (searchTerm === "") {
        renderInvoices(dataToFilter); 
        return;
    }

    const filteredData = dataToFilter.filter(invoice => 
        (invoice.id.toString().includes(searchTerm)) || 
        (invoice.table_name && invoice.table_name.toLowerCase().includes(searchTerm)) ||
        (invoice.client_name && invoice.client_name.toLowerCase().includes(searchTerm))
    );
    
    renderInvoices(filteredData);
});

// Listener para cerrar modales al hacer clic fuera
[modalEdicion, modalEliminar].forEach(m => {
    m.addEventListener("click", (e) => {
        if (e.target === m) {
            hideModal(m);
        }
    });
});