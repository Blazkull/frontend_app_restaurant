// invoices.js

import api from '../api/api.js';

const invoicesContainer = document.getElementById("invoices-table-body");
const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll("#filter-buttons button");

let invoicesData = []; 

// =========================================================
// DATOS MOCK DE FACTURAS (PARA DESARROLLO)
// Estos datos simulan la respuesta esperada de la API (con JOINs aplicados)
// =========================================================
const MOCK_INVOICE_DATA = {
    items: [
        {
            "id": 323534,
            "table_name": "Mesa 3",
            "client_name": "Juan Perez",
            "total": 999.00,
            "status_name": "Pagada", 
            "created_at": "2028-08-07T10:30:00"
        },
        {
            "id": 323535,
            "table_name": "Mesa 10",
            "client_name": "Ninguno",
            "total": 485.50,
            "status_name": "Anulada", 
            "created_at": "2028-08-02T15:00:00"
        },
        {
            "id": 323536,
            "table_name": "Mesa 7",
            "client_name": "Maria Lopez",
            "total": 840.00,
            "status_name": "Pendiente", 
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
        invoicesContainer.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-gray-500 italic">No se encontraron facturas.</td></tr>';
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
                <button title="Editar" class="p-2 rounded-full text-gray-500 hover:text-primary-blue hover:bg-gray-100 transition">
                    <svg data-lucide="pencil" class="w-4 h-4"></svg>
                </button>
                <button title="Ver/Pagar" class="p-2 rounded-full text-gray-500 hover:text-primary-blue hover:bg-gray-100 transition">
                    <svg data-lucide="eye" class="w-4 h-4"></svg>
                </button>
                <button title="Acción de Dinero" class="p-2 rounded-full text-gray-500 hover:text-green-600 hover:bg-gray-100 transition">
                    <svg data-lucide="dollar-sign" class="w-4 h-4"></svg>
                </button>
            </td>
        `;

        invoicesContainer.appendChild(row);
        lucide.createIcons();
    });
}

// ----------------------------------------------------------------
// FUNCIÓN PARA OBTENER DATOS DE LA API (Lectura)
// * Usa los datos MOCK si la API falla o no devuelve datos.
// ----------------------------------------------------------------

async function fetchInvoices(statusFilter = null) {
    let url = '/invoices/';
    if (statusFilter) {
        url += `?status_name=${statusFilter}`; 
    }
    
    let apiInvoices = [];
    let isApiDataValid = false;
    
    try {
        const response = await api.get(url);
        
        // Asumimos estructura de paginación { "items": [...] }
        const dataItems = response.data.items || response.data; 

        if (dataItems && dataItems.length > 0) {
            apiInvoices = dataItems;
            isApiDataValid = true;
            console.log("Facturas cargadas desde la API.");
        }

    } catch (error) {
        console.warn("Error al conectar o cargar facturas desde la API. Usando datos mock. Error:", error.response ? error.response.data : error.message);
        // Si hay error, caemos a usar datos mock
    }
    
    // Si la API falló o no devolvió datos (isApiDataValid es false), usa MOCK_INVOICE_DATA
    if (!isApiDataValid) {
        apiInvoices = MOCK_INVOICE_DATA.items;
        
        // Si también estamos filtrando, debemos aplicar el filtro al mock data
        if (statusFilter) {
             apiInvoices = apiInvoices.filter(invoice => 
                 invoice.status_name.toLowerCase() === statusFilter.toLowerCase()
             );
        }
    }
    
    // Transformamos (o re-transformamos si usamos mock data)
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
// EVENT LISTENERS y Lógica de Filtrado (Se mantienen igual)
// ----------------------------------------------------------------

// Lógica de filtrado por botones
filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Quita la clase 'active' de todos
        filterButtons.forEach(btn => btn.classList.remove('active', 'border-primary-blue', 'text-primary-blue'));
        // Añade la clase 'active' al botón clickeado
        e.currentTarget.classList.add('active', 'border-primary-blue', 'text-primary-blue');

        const filter = e.currentTarget.dataset.filter;
        
        let statusToFetch = null;
        if (filter === 'unpaid') {
            statusToFetch = 'Pendiente'; 
        } else if (filter === 'paid') {
            statusToFetch = 'Pagada';
        } 
        
        fetchInvoices(statusToFetch);
    });
});

// Lógica de búsqueda (simple en el cliente)
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    // Usa los datos que fueron cargados (ya sean API o MOCK)
    const dataToFilter = invoicesData.length > 0 ? invoicesData : MOCK_INVOICE_DATA.items; 

    if (searchTerm === "") {
        // Al borrar la búsqueda, se debe renderizar el set de datos completo actual
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


document.addEventListener('DOMContentLoaded', () => {
    // Inicializa la carga de todas las facturas al cargar la página
    fetchInvoices(); 
});