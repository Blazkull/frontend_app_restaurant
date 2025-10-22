// Datos de ejemplo de productos
const productosFactura = [
    { id: 1, nombre: 'Macbook pro 13"', cantidad: 1, precioUnitario: 1200, descuento: 0 },
    { id: 2, nombre: 'Apple Watch Ultra', cantidad: 1, precioUnitario: 300, descuento: 50 },
    { id: 3, nombre: 'iPhone 13 Pro Max', cantidad: 2, precioUnitario: 850, descuento: 0 },
    { id: 4, nombre: 'iPad Pro 3rd Gen', cantidad: 1, precioUnitario: 900, descuento: 0 }
];

// Información de la factura
const facturaInfo = {
    id: '#34854',
    fecha: '11 March, 2027',
    restaurante: {
        nombre: 'Restaurante La Media Luna',
        direccion: 'Cra 12 # 45-67',
        ciudad: 'Barranquilla, Colombia'
    },
    cliente: {
        nombre: 'Pepito Perez',
        direccion: 'Cra 12 # 12-60',
        ciudad: 'Barranquilla, Colombia',
        email: 'pepito123@gmail.com'
    }
};

// ============================================
// FUNCIONES DE RENDERIZADO
// ============================================

// Formatear precio en pesos colombianos
const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(price);
};

// Calcular total de un producto
const calcularTotalProducto = (producto) => {
    const subtotal = producto.cantidad * producto.precioUnitario;
    const descuento = subtotal * (producto.descuento / 100);
    return subtotal - descuento;
};

// Calcular total de la factura
const calcularTotalFactura = () => {
    return productosFactura.reduce((total, producto) => {
        return total + calcularTotalProducto(producto);
    }, 0);
};

// Renderizar tabla de productos
const renderProductos = () => {
    const tbody = document.getElementById('productosTableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = productosFactura.map((producto, index) => {
        const totalProducto = calcularTotalProducto(producto);
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="py-4 text-sm text-gray-900">${index + 1}</td>
                <td class="py-4 text-sm text-gray-900">${producto.nombre}</td>
                <td class="py-4 text-sm text-gray-900 text-center">${producto.cantidad}</td>
                <td class="py-4 text-sm text-gray-900 text-right">${formatPrice(producto.precioUnitario)}</td>
                <td class="py-4 text-sm text-gray-900 text-center">${producto.descuento}%</td>
                <td class="py-4 text-sm font-semibold text-gray-900 text-right">${formatPrice(totalProducto)}</td>
            </tr>
        `;
    }).join('');
};

// Cargar información de la factura
const cargarInfoFactura = () => {
    // Cargar ID y fecha
    const facturaIdEl = document.getElementById('facturaId');
    const fechaEmisionEl = document.getElementById('fechaEmision');
    
    if (facturaIdEl) facturaIdEl.textContent = facturaInfo.id;
    if (fechaEmisionEl) fechaEmisionEl.textContent = facturaInfo.fecha;
    
    // Cargar info del cliente
    const clienteNombreEl = document.getElementById('clienteNombre');
    const clienteDocEl = document.getElementById('clienteDoc');
    const clienteEmailEl = document.getElementById('clienteEmail');
    
    if (clienteNombreEl) clienteNombreEl.textContent = facturaInfo.cliente.nombre;
    if (clienteDocEl) clienteDocEl.textContent = facturaInfo.cliente.direccion;
    if (clienteEmailEl) clienteEmailEl.textContent = facturaInfo.cliente.ciudad;
    
    // Calcular y mostrar total
    const total = calcularTotalFactura();
    const totalFacturaEl = document.getElementById('totalFactura');
    if (totalFacturaEl) totalFacturaEl.textContent = formatPrice(total);
};

// ============================================
// FUNCIONES DE PAGO
// ============================================

// Procesar pago
const procesarPago = () => {
    const dineroRecibido = parseFloat(document.getElementById('dineroRecibido')?.value || 0);
    const metodoPago = document.getElementById('metodoPago')?.value;
    const total = calcularTotalFactura();
    
    if (!metodoPago) {
        alert('Por favor selecciona un método de pago');
        return;
    }
    
    if (dineroRecibido < total) {
        alert(`El dinero recibido (${formatPrice(dineroRecibido)}) es menor al total (${formatPrice(total)})`);
        return;
    }
    
    const cambio = dineroRecibido - total;
    
    alert(`
Pago procesado exitosamente
━━━━━━━━━━━━━━━━━━━━━━
Total: ${formatPrice(total)}
Recibido: ${formatPrice(dineroRecibido)}
Cambio: ${formatPrice(cambio)}
Método: ${metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1)}
    `);
    
    // Aquí podrías guardar el pago en la BD
    console.log('Pago procesado:', {
        facturaId: facturaInfo.id,
        total,
        dineroRecibido,
        cambio,
        metodoPago,
        fecha: new Date().toISOString()
    });
};

// Enviar factura por correo
const enviarCorreo = () => {
    const metodoPago = document.getElementById('metodoPago')?.value;
    
    if (!metodoPago) {
        alert('Por favor completa el método de pago antes de enviar');
        return;
    }
    
    alert(`Factura ${facturaInfo.id} enviada a ${facturaInfo.cliente.email}`);
    
    // Aquí implementarías la lógica de envío de correo
    console.log('Enviando factura por correo a:', facturaInfo.cliente.email);
};

// Imprimir factura
const imprimirFactura = () => {
    window.print();
};

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    
    console.log('Iniciando página de pago de factura...');
    
    // Cargar datos de la factura
    cargarInfoFactura();
    renderProductos();
    
    // ============================================
    // TOGGLE SIDEBAR
    // ============================================
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }
    
    // ============================================
    // EVENT LISTENERS DE BOTONES
    // ============================================
    
    const btnProcesar = document.getElementById('btnProcesar');
    const btnEnviar = document.getElementById('btnEnviar');
    const btnImprimir = document.getElementById('btnImprimir');
    
    if (btnProcesar) {
        btnProcesar.addEventListener('click', procesarPago);
    }
    
    if (btnEnviar) {
        btnEnviar.addEventListener('click', enviarCorreo);
    }
    
    if (btnImprimir) {
        btnImprimir.addEventListener('click', imprimirFactura);
    }
    
    // ============================================
    // CALCULAR CAMBIO EN TIEMPO REAL
    // ============================================
    const dineroRecibidoInput = document.getElementById('dineroRecibido');
    
    if (dineroRecibidoInput) {
        dineroRecibidoInput.addEventListener('input', (e) => {
            const dineroRecibido = parseFloat(e.target.value || 0);
            const total = calcularTotalFactura();
            const cambio = dineroRecibido - total;
            
            if (cambio >= 0) {
                console.log('Cambio:', formatPrice(cambio));
            }
        });
    }
    
    console.log('✅ Página de pago cargada correctamente');
    
});