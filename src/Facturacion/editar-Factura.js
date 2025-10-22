// Archivo: Editar-Factura.js (Código ÚNICO y Completo)

// Variable global para la factura que se está editando
let facturaAEditar = null;

// Formatear precio a moneda
const formatPrice = (price) => {
    return `$${(Math.round(price * 100) / 100).toFixed(2)}`;
};

// Función para inicializar la página
function cargarDatosFactura() {
    const facturaId = localStorage.getItem('facturaEnEdicionId');
    const todasLasFacturas = JSON.parse(localStorage.getItem('todasLasFacturas') || '[]');
    // --> AÑADE ESTE LOG: Ver si tenemos datos y qué ID buscamos
    console.log('Facturas cargadas desde LS:', todasLasFacturas); 
    console.log('ID buscado en edición:', facturaId);
    
    // Busca la factura por el ID que guardamos
    facturaAEditar = todasLasFacturas.find(f => f.id === facturaId);

    if (!facturaAEditar) {
        console.error('Factura no encontrada para edición. ID:', facturaId);
        alert('Error: Factura no encontrada. Volviendo al listado.');
        // CORRECCIÓN DE RUTA DE REDIRECCIÓN (asegura que esta ruta sea correcta)
        window.location.href = '../Facturacion/cajero-facturacion.html';
        return;
    }
    console.log('✅ Factura ENCONTRADA:', facturaAEditar);
    // ----------------------------------------------------
    // SIMULACIÓN DE DATOS (PARA QUE SIEMPRE TENGA ARTÍCULOS Y CAMPOS)
    // Si la factura no trae 'articulos', usa los datos de prueba
    if (!facturaAEditar.articulos || facturaAEditar.articulos.length === 0) {
        facturaAEditar.articulos = [
            { id: 1, nombre: 'Aros de Cebolla Gourmet"', cantidad: 1, precioUnitario: 1200.00, descuentoPorcentaje: 0 },
            { id: 2, nombre: 'Limonada de Menta Refrescante', cantidad: 1, precioUnitario: 300.00, descuentoPorcentaje: 50 },
            { id: 3, nombre: 'Pizza Margarita Artesanal', cantidad: 2, precioUnitario: 800.00, descuentoPorcentaje: 0 }
        ];
        // Simular que algunos campos existen si no vienen del listado
        facturaAEditar.telefono = facturaAEditar.telefono || '+57 324 56 7890';
        facturaAEditar.metodoPago = facturaAEditar.metodoPago || 'Efectivo';
        facturaAEditar.direccion = facturaAEditar.direccion || 'Calle 123 #45-67';
        facturaAEditar.notas = facturaAEditar.notas || 'Entrega inmediata. Confirmar al llegar.';
    }
    
    // Llenar los campos del formulario con los IDs de tu HTML
    document.getElementById('factura-numero').value = facturaAEditar.id;
    document.getElementById('cliente').value = facturaAEditar.cliente;
    // Usamos 'direccion' para Mesa/Dirección si está definido
    document.getElementById('direccion').value = facturaAEditar.direccion || facturaAEditar.mesa; 
    document.getElementById('telefono').value = facturaAEditar.telefono || ''; 
    document.getElementById('metodo-pago').value = facturaAEditar.metodoPago || 'Efectivo'; 
    document.getElementById('informacion-adicional').value = facturaAEditar.notas || '';

    // Formato de fecha
    const fechaOriginal = new Date(facturaAEditar.fecha);
    const yyyy = fechaOriginal.getFullYear();
    const mm = String(fechaOriginal.getMonth() + 1).padStart(2, '0');
    const dd = String(fechaOriginal.getDate()).padStart(2, '0');
    document.getElementById('fecha-facturacion').value = `${yyyy}-${mm}-${dd}`;
    
    renderProductos();
}

// ... (todas las funciones updateResumen, renderProductos, agregarProducto, eliminarProducto) ...
// NO NECESITAS PEGARLAS AQUÍ, ASUMO QUE YA LAS TIENES EN EL ORDEN CORRECTO,
// SOLO ASEGÚRATE DE QUE SEAN LAS DEL PRIMER BLOQUE COMPLETO QUE ME MOSTRASTE.

/**
 * Recalcula y actualiza los totales de la factura.
 * Utiliza los productos simulados en facturaAEditar.articulos.
 */
const updateResumen = () => {
    const articulos = facturaAEditar.articulos || [];
    let subtotal = 0;

    articulos.forEach(p => {
        const totalProducto = p.cantidad * p.precioUnitario * (1 - (p.descuentoPorcentaje || 0) / 100);
        subtotal += totalProducto;
    });

    // Usa tus constantes de descuento/impuesto, aquí asumo el 10% global
    const DESCUENTO_GLOBAL_PORCENTAJE = 10; 
    const descuentoBruto = subtotal * (DESCUENTO_GLOBAL_PORCENTAJE / 100);
    const totalFinal = subtotal - descuentoBruto;

    // Actualizar los displays en el resumen
    document.getElementById('subtotal-display').textContent = formatPrice(subtotal);
    document.getElementById('descuento-display').textContent = `-${formatPrice(descuentoBruto)}`;
    document.getElementById('total-display').textContent = formatPrice(totalFinal);
};


/**
 * Genera la fila HTML para un artículo y re-renderiza.
 */
function renderProductos() {
    const tableBody = document.getElementById('factura-productos-body');
    if (!tableBody || !facturaAEditar || !facturaAEditar.articulos) return;

    tableBody.innerHTML = ''; // Limpiar la tabla

    facturaAEditar.articulos.forEach((producto, index) => {
        const totalProducto = producto.cantidad * producto.precioUnitario * (1 - (producto.descuentoPorcentaje || 0) / 100);

        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class=" px-6 py-3 whitespace-nowrap text-sm text-gray-500 text-left">${index + 1}</td>
            <td class=" px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-left">${producto.nombre}</td>
            <td class=" px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">${producto.cantidad}</td>
            <td class=" px-4 py-2 whitespace-nowrap text-sm text-right text-gray-500">$${producto.precioUnitario.toFixed(2)}</td>
            <td class=" px-4 py-2 whitespace-nowrap text-sm text-right text-red-500">${producto.descuentoPorcentaje || 0}%</td>
            <td class=" px-4 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900">$${totalProducto.toFixed(2)}</td>
            <td class=" px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="eliminarProducto(${producto.id})" class="text-gray-400 hover:text-red-500 p-1 rounded transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18" fill="none">
                        <path d="M2.37565 3.79175V15.4584C2.37565 16.1488 2.9353 16.7084 3.62565 16.7084H12.3757C13.066 16.7084 13.6257 16.1488 13.6257 15.4584V3.79175M1.33398 3.79175H14.6665M2.37565 12.2463V7.24634M13.6257 12.2463V7.24634M6.33398 12.7501V7.75008M9.66732 12.7501V7.75008M10.7086 3.79175V2.54175C10.7086 1.85139 10.1489 1.29175 9.45858 1.29175H6.54191C5.85156 1.29175 5.29191 1.85139 5.29191 2.54175V3.79175H10.7086Z" stroke="#667085" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updateResumen();
}

/**
 * Agrega un nuevo producto a la lista en memoria y re-renderiza.
 */
function agregarProducto() {
    const nombre = document.getElementById('nuevo-producto-nombre').value.trim();
    const precio = parseFloat(document.getElementById('nuevo-producto-precio').value);
    const cantidad = parseInt(document.getElementById('nuevo-producto-cantidad').value);
    const descuento = parseInt(document.getElementById('nuevo-producto-descuento').value);

    if (!nombre || isNaN(precio) || precio <= 0 || isNaN(cantidad) || cantidad <= 0 || isNaN(descuento) || descuento < 0 || descuento > 100) {
        alert("Por favor, rellena todos los campos con valores válidos.");
        return;
    }
    
    // Obtener el ID más alto y sumar 1
    const nextId = facturaAEditar.articulos.length > 0 
        ? Math.max(...facturaAEditar.articulos.map(p => p.id)) + 1 
        : 1;

    const nuevoProducto = {
        id: nextId,
        nombre: nombre,
        cantidad: cantidad,
        precioUnitario: precio,
        descuentoPorcentaje: descuento
    };

    facturaAEditar.articulos.push(nuevoProducto);
    renderProductos();

    // Limpiar formulario de adición
    document.getElementById('nuevo-producto-nombre').value = '';
    document.getElementById('nuevo-producto-precio').value = '100.00';
    document.getElementById('nuevo-producto-cantidad').value = '1';
    document.getElementById('nuevo-producto-descuento').value = '0';
}
window.agregarProducto = agregarProducto; // Hacemos la función global

/**
 * Elimina un producto de la lista en memoria y re-renderiza.
 */
function eliminarProducto(id) {
    facturaAEditar.articulos = facturaAEditar.articulos.filter(p => p.id !== id);
    renderProductos();
}
window.eliminarProducto = eliminarProducto; // Hacemos la función global

/**
 * Cancela la edición, limpia el ID de la factura en edición y redirige
 * al listado principal de facturas.
 */
function cancelarEdicion() {
    // Es buena práctica limpiar el ID de la factura que se estaba editando
    localStorage.removeItem('facturaEnEdicionId');
    // Muestra una alerta (opcional)
    alert('Edición de factura cancelada. Volviendo al listado.');

    // REDIRECCIÓN: Usa la misma ruta que usas para volver después de guardar
    window.location.href = '../Facturacion/cajero-facturacion.html';
}
window.cancelarEdicion = cancelarEdicion;


/**
 * Guarda los cambios en el localStorage y redirige.
 */
function guardarCambios() {
    // 1. Recoger datos de los campos principales
    const id = document.getElementById('factura-numero').value;
    const cliente = document.getElementById('cliente').value;
    const direccion = document.getElementById('direccion').value;
    const telefono = document.getElementById('telefono').value;
    const metodoPago = document.getElementById('metodo-pago').value;
    // Captura la fecha en formato yyyy-MM-dd del input
    const inputFecha = document.getElementById('fecha-facturacion').value; 
    // Convierte la fecha del input a 'Month Day, Year' para mantener el formato del listado
    const fecha = new Date(inputFecha).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const notas = document.getElementById('informacion-adicional').value;

    // 2. Calcular el total final (replicamos la lógica)
    let subtotal = 0;
    facturaAEditar.articulos.forEach(p => {
        const totalProducto = p.cantidad * p.precioUnitario * (1 - (p.descuentoPorcentaje || 0) / 100);
        subtotal += totalProducto;
    });

    const DESCUENTO_GLOBAL_PORCENTAJE = 10; 
    const descuentoBruto = subtotal * (DESCUENTO_GLOBAL_PORCENTAJE / 100);
    const totalFinal = subtotal - descuentoBruto;

    // 3. Crear el objeto de factura actualizado (usando el formato del listado original)
    const facturaActualizada = {
        id: id,
        mesa: direccion, // Mapear Dirección a Mesa para el listado
        cliente: cliente,
        fecha: fecha,
        total: Math.round(totalFinal), // Redondeamos para simular el formato del listado
        estado: facturaAEditar.estado, // Mantiene el estado original
        // Añade los detalles completos necesarios para la próxima edición
        articulos: facturaAEditar.articulos,
        notas: notas,
        telefono: telefono,
        direccion: direccion,
        metodoPago: metodoPago
    };

    // 4. Actualizar el array principal en localStorage
    const todasLasFacturas = JSON.parse(localStorage.getItem('todasLasFacturas') || '[]');
    const indice = todasLasFacturas.findIndex(f => f.id === id);

    if (indice !== -1) {
        // Reemplazar la factura con la nueva información
        todasLasFacturas[indice] = facturaActualizada;
        localStorage.setItem('todasLasFacturas', JSON.stringify(todasLasFacturas));
        
        alert('Factura actualizada correctamente: ' + id);
        
        // 5. Redirección
        // ¡IMPORTANTE! Revisa tu estructura de carpetas y ajusta si es necesario
        window.location.href = '../Facturacion/cajero-facturacion.html';
    } else {
        alert('Error: No se pudo encontrar la factura original para actualizar.');
    }
}
window.guardarCambios = guardarCambios; // Hacemos la función global


// Inicializar la página al cargar
document.addEventListener('DOMContentLoaded', () => {
    cargarDatosFactura();
    
    // Asignar el listener al botón de guardar
    const btnGuardar = document.getElementById('guardar-cambios');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', guardarCambios);
    }
    
    // Asignar el listener al botón de agregar producto
    const btnAgregar = document.getElementById('agregar-articulo');
    if (btnAgregar) {
        btnAgregar.addEventListener('click', agregarProducto);
    }
});