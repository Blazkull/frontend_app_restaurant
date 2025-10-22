// Variables para el estado de ordenamiento y búsqueda
let ordenActual = '';
let direccionOrden = 'asc';

// Función para ordenar facturas
window.ordenarPor = (columna) => {
  if (ordenActual === columna) {
    direccionOrden = direccionOrden === 'asc' ? 'desc' : 'asc';
  } else {
    ordenActual = columna;
    direccionOrden = 'asc';
  }

  document.querySelectorAll('svg[id^="icon-"]').forEach(icon => {
    icon.style.transform = '';
  });

  const icon = document.getElementById(`icon-${columna}`);
  if (icon) {
    icon.style.transform = direccionOrden === 'asc' ? 'rotate(0deg)' : 'rotate(180deg)';
  }

  const facturasOrdenadas = [...facturas].sort((a, b) => {
    let valorA, valorB;

    switch(columna) {
      case 'id':
        valorA = a.id.toLowerCase();
        valorB = b.id.toLowerCase();
        break;
      case 'mesa':
        valorA = parseInt(a.mesa.match(/\d+/)[0]);
        valorB = parseInt(b.mesa.match(/\d+/)[0]);
        break;
      case 'cliente':
        valorA = a.cliente.toLowerCase();
        valorB = b.cliente.toLowerCase();
        break;
      case 'fecha':
        valorA = new Date(a.fecha).getTime();
        valorB = new Date(b.fecha).getTime();
        break;
      case 'total':
        valorA = a.total;
        valorB = b.total;
        break;
      case 'estado':
        valorA = a.estado.toLowerCase();
        valorB = b.estado.toLowerCase();
        break;
      default:
        return 0;
    }

    if (direccionOrden === 'asc') {
      return valorA > valorB ? 1 : -1;
    } else {
      return valorA < valorB ? 1 : -1;
    }
  });

  renderFacturas(facturasOrdenadas);
};

// Datos de facturas
const facturas = [
  { id: '#32553s', mesa: 'Mesa 3', cliente: 'Juan Perez', fecha: 'August 7, 2028', total: 999, estado: 'Paga' },
  { id: '#32553s', mesa: 'Mesa 2', cliente: 'Ninguno', fecha: 'August 2, 2028', total: 685, estado: 'Anulado' },
  { id: '#32553s', mesa: 'Mesa 10', cliente: 'Juan Perez', fecha: 'May 12, 2028', total: 935, estado: 'Pendiente' },
  { id: '#32553s', mesa: 'Mesa 7', cliente: 'Juan Perez', fecha: 'May 6, 2028', total: 860, estado: 'Paga' },
  { id: '#32553s', mesa: 'Mesa 6', cliente: 'Juan Perez', fecha: 'October 24, 2028', total: 790, estado: 'Paga' },
  { id: '#32553s', mesa: 'Mesa 1', cliente: 'Juan Perez', fecha: 'July 14, 2028', total: 560, estado: 'Paga' },
  { id: '#32553s', mesa: 'Mesa 4', cliente: 'Juan Perez', fecha: 'December 29, 2028', total: 680, estado: 'Borrado' },
  { id: '#32553s', mesa: 'Mesa 5', cliente: 'Juan Perez', fecha: 'March 13, 2028', total: 290, estado: 'Paga' },
  { id: '#32553s', mesa: 'Mesa 8', cliente: 'Juan Perez', fecha: 'December 19, 2028', total: 1250, estado: 'Atrasado' },
  { id: '#32553s', mesa: 'Mesa 9', cliente: 'Juan Perez', fecha: 'November 16, 2028', total: 1920, estado: 'Paga' }
];

// Formatear precio
const formatPrice = (price) => {
  return `$${price}`;
};

// Obtener clase de badge según estado
const getEstadoBadge = (estado) => {
  const badges = {
    'Paga': { bg: 'bg-green-100', text: 'text-green-700', label: 'Paga' },
    'Anulado': { bg: 'bg-red-100', text: 'text-red-700', label: 'Anulado' },
    'Pendiente': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Pendiente' },
    'Borrado': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Borrado' },
    'Atrasado': { bg: 'bg-red-100', text: 'text-red-700', label: 'Atrasado' }
  };
  return badges[estado] || badges['Borrado'];
};

// Renderizar tabla
const renderFacturas = (facturasAMostrar = facturas) => {
  const tbody = document.getElementById('facturasTableBody');
  
  if (!tbody) return;
  
  tbody.innerHTML = facturasAMostrar.map(factura => {
    const badge = getEstadoBadge(factura.estado);
    
    return `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-6 py-4">
          <input type="checkbox" class="rounded border-gray-300" />
        </td>
        <td class="px-6 py-4">
          <span class="text-sm font-medium text-gray-900">${factura.id}</span>
        </td>
        <td class="px-6 py-4">
          <span class="text-sm text-gray-600">${factura.mesa}</span>
        </td>
        <td class="px-6 py-4">
          <span class="text-sm text-gray-600">${factura.cliente}</span>
        </td>
        <td class="px-6 py-4">
          <span class="text-sm text-gray-600">${factura.fecha}</span>
        </td>
        <td class="px-6 py-4">
          <span class="text-sm font-semibold text-gray-900">${formatPrice(factura.total)}</span>
        </td>
        <td class="px-6 py-4">
          <span class="${badge.bg} ${badge.text} text-xs font-medium px-3 py-1 rounded-full">
            ${badge.label}
          </span>
        </td>
        <td class="px-6 py-4 ">
          <div class="flex items-center gap-2">
            <button onclick="editarFactura('${factura.id}')" class="p-2 flex items-center gap-2 px-3 py-2.5 border border-gray-200 shadow-sm bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14.8634 6.09743L17.9019 9.13594M18.7724 4.31043L19.6896 5.22763C20.2754 5.81341 20.2754 6.76316 19.6896 7.34895L9.40256 17.636C9.22846 17.8101 9.01419 17.9387 8.77864 18.0104L4.76953 19.2305L5.9897 15.2214C6.06138 14.9859 6.18995 14.7716 6.36405 14.5975L16.6511 4.31043C17.2369 3.72465 18.1866 3.72465 18.7724 4.31043Z" stroke="#53B1FD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="p-2 flex items-center gap-2 px-3 py-3 border border-gray-200 shadow-sm bg-white text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="Ver">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </button>
            <button onclick="pagarFactura('${factura.id}')" class="p-2 flex items-center gap-5 px-5 py-3 border border-gray-200 shadow-sm bg-white text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Pagar">
              <svg width="9" height="18" viewBox="0 0 9 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.40271 5.43589C7.40271 4.23312 6.42768 3.25809 5.22491 3.25809H4.3442C2.82625 3.25809 1.5957 4.48864 1.5957 6.00659C1.5957 7.15226 2.30636 8.17776 3.37907 8.58006L5.61934 9.42022C6.69205 9.82252 7.40271 10.848 7.40271 11.9937C7.40271 13.5116 6.17216 14.7422 4.65421 14.7422H3.77349C2.57073 14.7422 1.5957 13.7672 1.5957 12.5644M4.49903 15.069L4.49903 16.6735M4.49903 1.32642L4.49903 2.93088" stroke="#039855" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
};

// Función de búsqueda
const buscarFacturas = (texto) => {
  const busqueda = texto.toLowerCase();
  const facturasFiltradas = facturas.filter(factura => 
    factura.cliente.toLowerCase().includes(busqueda) ||
    factura.mesa.toLowerCase().includes(busqueda) ||
    factura.estado.toLowerCase().includes(busqueda) ||
    factura.id.toLowerCase().includes(busqueda)
  );
  
  renderFacturas(facturasFiltradas);
};

// Variables para los filtros
let filtroEstado = '';

// Función para aplicar filtros por columna (NUEVA - como en menu-admin)
window.aplicarFiltro = (tipo) => {
  const filterModal = document.getElementById('filterModal');
  if (filterModal) {
    filterModal.classList.add('hidden');
  }
  
  // Simplemente ordenar por el tipo seleccionado
  ordenarPor(tipo);
};

// Función para limpiar filtros (NUEVA - mejorada)
window.limpiarFiltros = () => {
  const filterModal = document.getElementById('filterModal');
  const filterEstado = document.getElementById('filterEstado');
  
  // Cerrar modal si está abierto
  if (filterModal) {
    filterModal.classList.add('hidden');
  }
  
  // Limpiar select de estado
  if (filterEstado) {
    filterEstado.value = '';
  }
  
  // Resetear variable de filtro
  filtroEstado = '';
  
  // Resetear ordenamiento
  ordenActual = '';
  direccionOrden = 'asc';
  
  // Resetear todas las flechas de ordenamiento
  document.querySelectorAll('svg[id^="icon-"]').forEach(icon => {
    icon.style.transform = '';
  });
  
  // Limpiar el campo de búsqueda
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = '';
  }
  
  // Renderizar todas las facturas sin filtros
  renderFacturas(facturas);
};

// Función para aplicar filtros de estado
const aplicarFiltros = () => {
  const facturasFiltradas = facturas.filter(factura => {
    // Filtro por estado
    if (filtroEstado && factura.estado !== filtroEstado) {
      return false;
    }
    return true;
  });
  
  renderFacturas(facturasFiltradas);
};

// ============================================
// FUNCIÓN PARA EDITAR FACTURA
// ============================================
window.editarFactura = (facturaId) => {
  console.log('🖊️ Editando factura ID:', facturaId);
  
  // Guardar la lista completa de facturas
  localStorage.setItem('todasLasFacturas', JSON.stringify(facturas));

  // Guardar el ID de la factura
  localStorage.setItem('facturaEnEdicionId', facturaId);
  
  console.log('✅ Factura ID guardada en localStorage:', facturaId);

  // Redirigir a editar factura
  window.location.href = '../Editar-Factura/Editar-Factura.html'; 
};

// ============================================
// FUNCIÓN PARA PAGAR FACTURA (NUEVA)
// ============================================
window.pagarFactura = (facturaId) => {
  console.log('💳 Procesando pago de factura:', facturaId);
  
  // Buscar la factura en el array
  const factura = facturas.find(f => f.id === facturaId);
  
  if (!factura) {
    alert('Factura no encontrada');
    console.error('Factura no encontrada:', facturaId);
    return;
  }
  
  console.log('Factura encontrada:', factura);
  
  // Guardar información de la factura en localStorage
  localStorage.setItem('facturaAPagar', JSON.stringify(factura));
  
  console.log('✅ Factura guardada en localStorage, redirigiendo...');
  
  // Redirigir a página de pago
  window.location.href = '../Facturacion/pagar-factura.html';
};

// Toggle sidebar - EMPUJA EL CONTENIDO
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const searchInput = document.getElementById('searchInput');
  
  // Elementos del modal de filtros
  const filterButton = document.getElementById('filterButton');
  const filterModal = document.getElementById('filterModal');
  const closeFilterModal = document.getElementById('closeFilterModal');
  const filterEstadoSelect = document.getElementById('filterEstado');
  const applyFilters = document.getElementById('applyFilters');
  const clearFilters = document.getElementById('clearFilters');
  
  // Modal de logout
  const logoutBtn = document.getElementById('logout');
  const logoutModal = document.getElementById('logoutModal');
  const cancelLogout = document.getElementById('cancelLogout');
  const confirmLogout = document.getElementById('confirmLogout');
  
  if (filterModal) {
    filterModal.classList.add('hidden');
  }
  
  // Toggle sidebar
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-ml-64');
      sidebar.classList.toggle('ml-0');
    });
  }

  // Event listener para la búsqueda
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      buscarFacturas(e.target.value);
    });
  }

  // Event listeners para el modal de filtros
  if (filterButton && filterModal) {
    filterButton.addEventListener('click', () => {
      filterModal.classList.remove('hidden');
      filterModal.classList.add('flex');
    });

    if (closeFilterModal) {
      closeFilterModal.addEventListener('click', () => {
        filterModal.classList.add('hidden');
        filterModal.classList.remove('flex');
      });
    }

    // Cerrar modal al hacer clic fuera
    filterModal.addEventListener('click', (e) => {
      if (e.target === filterModal) {
        filterModal.classList.add('hidden');
        filterModal.classList.remove('flex');
      }
    });
  }

  // Aplicar filtros
  if (applyFilters) {
    applyFilters.addEventListener('click', () => {
      filtroEstado = filterEstadoSelect.value;
      aplicarFiltros();
      filterModal.classList.add('hidden');
      filterModal.classList.remove('flex');
    });
  }

  // Limpiar filtros (botón dentro del modal)
  if (clearFilters) {
    clearFilters.addEventListener('click', () => {
      limpiarFiltros();
    });
  }

  // Manejo del dropdown de filtros (NUEVO - como en menu-admin)
  const filterButtonDropdown = document.getElementById('filterButton');
  const filterDropdown = document.getElementById('filterDropdown');
  
  if (filterButtonDropdown && filterDropdown) {
    filterButtonDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      filterDropdown.classList.toggle('hidden');
      // Cerrar el modal si está abierto
      if (filterModal) {
        filterModal.classList.add('hidden');
        filterModal.classList.remove('flex');
      }
    });

    // Cerrar el dropdown cuando se hace clic fuera
    document.addEventListener('click', (e) => {
      if (!filterDropdown.contains(e.target) && !filterButtonDropdown.contains(e.target)) {
        filterDropdown.classList.add('hidden');
      }
    });
  }

  // Modal de logout
  if (logoutBtn && logoutModal) {
    logoutBtn.addEventListener('click', () => {
      logoutModal.classList.remove('hidden');
      logoutModal.classList.add('flex');
      // Animación de entrada
      setTimeout(() => {
        const modalContent = logoutModal.querySelector('div');
        if (modalContent) {
          modalContent.classList.remove('scale-95', 'opacity-0');
          modalContent.classList.add('scale-100', 'opacity-100');
        }
      }, 10);
    });

    if (cancelLogout) {
      cancelLogout.addEventListener('click', () => {
        const modalContent = logoutModal.querySelector('div');
        if (modalContent) {
          modalContent.classList.add('scale-95', 'opacity-0');
          modalContent.classList.remove('scale-100', 'opacity-100');
        }
        setTimeout(() => {
          logoutModal.classList.add('hidden');
          logoutModal.classList.remove('flex');
        }, 300);
      });
    }

    if (confirmLogout) {
      confirmLogout.addEventListener('click', () => {
        // Aquí puedes agregar la lógica de logout
        localStorage.clear();
        window.location.href = '/login.html';
      });
    }
  }
  
  renderFacturas();
});