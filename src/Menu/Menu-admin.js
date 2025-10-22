// Datos de ejemplo de productos del menú
let productosMenu = [];
let filterButton = null;
let filterMenu = null;

// Función para mapear id_status a texto - DEBE ESTAR ANTES de fetchMenuItems
function mapearEstado(idStatus) {
  const estadosMap = {
    1: 'disponible',
    2: 'desactivado',
    3: 'agotado'
  };
  return estadosMap[idStatus] ?? 'desactivado';
}

// Función para mapear id_category a texto
function mapearCategoria(idCategoria) {
  const categoriasMap = {
    1: 'Entradas',
    2: 'Platos Fuertes',
    3: 'Bebidas',
    4: 'Postres',
    5: 'Ensaladas',
    6: 'Sopas',
    7: 'Acompañamientos'
  };
  return categoriasMap[idCategoria] ?? 'Sin Categoría';
}

// Mapear fecha
function mapearFecha(fechaISO) {
  if (!fechaISO) return 'Fecha Desconocida';
  const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(fechaISO).toLocaleDateString('es-ES', opciones);
}

// Obtener productos del menú desde la API
async function fetchMenuItems() {
  const response = await fetch('https://backend-app-restaurant-2kfa.onrender.com/api/menu_items', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) {
    console.log('Error on fetching menu items', await response.json());
    return;
  }

  const data = await response.json();
  productosMenu = data.items.map((item) => ({
    id: item.id,
    nombre: item.name ?? 'Nombre Desconocido',
    categoria: mapearCategoria(item.id_category),
    tiempo: `${item.estimated_time ?? 0}min`,
    precio: item.price ?? 0,
    estado: mapearEstado(item.id_status),
    imagen: 'https://th.bing.com/th/id/R.97e6e024942909edd49b49151b681b36?rik=MPl%2fr3lNHQ2xkg&riu=http%3a%2f%2f2.bp.blogspot.com%2f-aKJ6vZ2EAXQ%2fVnjMt-BpyEI%2fAAAAAAAAAgg%2fBRz4GUzOXfM%2fs1600%2f1442691006_picca-i-rebenok-samye-rasprostranennye-mify.jpg&ehk=XRWSc1eeRSh0gFfsto2MXRtEFa0hXm3iS92eQ5WLGdw%3d&risl=&pid=ImgRaw&r=0',
    fechaCreacion: mapearFecha(item.created_at),
    fechaActualizacion: mapearFecha(item.updated_at)
  }));

  console.log('Productos del menú desde API finalizado con éxito');
  console.log('Estados mapeados:', productosMenu.map(p => ({ nombre: p.nombre, categoria: p.categoria, estado: p.estado })));
}

// Renderizar tabla
const renderProductTable = (productosAMostrar = productosMenu) => {
  console.log('Length: ', productosAMostrar.length);
  const tbody = document.getElementById('menuTableBody');
  if (!tbody) return;

  tbody.innerHTML = productosAMostrar.map(producto => {
    const esDisponible = producto.estado === 'disponible';
    const badgeBg = esDisponible ? 'bg-green-200' : 'bg-red-200';
    const badgeText = esDisponible ? 'text-disponible-700' : 'text-black-600';
    const estadoTexto = esDisponible ? 'Disponible' : 'Desactivado';

    return `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-6 py-4"><input type="checkbox" class="rounded border-gray-300 text-primary focus:ring-primary" /></td>
        <td class="px-6 py-4"><img src="${producto.imagen}" alt="${producto.nombre}" class="w-12 h-12 object-cover rounded-lg" /></td>
        <td class="px-6 py-4"><span class="text-sm font-medium text-gray-900">${producto.nombre}</span></td>
        <td class="px-6 py-4"><span class="text-sm text-gray-600">${producto.categoria}</span></td>
        <td class="px-6 py-4"><span class="text-sm text-gray-600">${producto.tiempo}</span></td>
        <td class="px-6 py-4"><span class="text-sm font-semibold text-gray-900">${formatPrice(producto.precio)}</span></td>
        <td class="px-6 py-4">
          <span class="${badgeBg} ${badgeText} text-xs font-semibold px-3 py-1 rounded-full">${estadoTexto}</span>
        </td>
        <td class="px-6 py-4"><span class="text-sm text-gray-600">${producto.fechaCreacion}</span></td>
        <td class="px-6 py-4">
          <button onclick="editarProducto(${producto.id})" class="cursor-pointer text-primary hover:text-primary-hover transition-colors" title="Editar producto">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');
};

let contadorId = 8;
let imagenSeleccionada = null;
let productoEnEdicion = null;

const formatPrice = (price, currencyCode = 'COP') => {
  let locale = 'es-CO';
  let minimumFractionDigits = 0;
  if (currencyCode === 'USD') {
    locale = 'en-US';
    minimumFractionDigits = 2;
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits
  }).format(price);
};

// Variables de ordenamiento
let ordenActual = '';
let direccionOrden = 'asc';

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
  if (icon) icon.style.transform = direccionOrden === 'asc' ? 'rotate(0deg)' : 'rotate(180deg)';

  const productosOrdenados = [...productosMenu].sort((a, b) => {
    let valorA, valorB;
    switch (columna) {
      case 'categoria': valorA = a.categoria.toLowerCase(); valorB = b.categoria.toLowerCase(); break;
      case 'tiempo': valorA = parseInt(a.tiempo); valorB = parseInt(b.tiempo); break;
      case 'precio': valorA = a.precio; valorB = b.precio; break;
      case 'fecha': valorA = new Date(a.fechaCreacion).getTime(); valorB = new Date(b.fechaCreacion).getTime(); break;
      default: return 0;
    }
    return direccionOrden === 'asc' ? valorA > valorB ? 1 : -1 : valorA < valorB ? 1 : -1;
  });

  renderProductTable(productosOrdenados);
};

// Abrir modal para CREAR
window.abrirModal = () => {
  productoEnEdicion = null;
  document.getElementById('modalTitle').textContent = 'Crear Producto';
  document.getElementById('submitBtn').textContent = 'Crear';
  document.getElementById('modalCrearProducto').classList.remove('hidden');
  document.getElementById('formCrearProducto').reset();
  document.getElementById('imagenPreview').classList.add('hidden');
  imagenSeleccionada = null;
};

// Abrir modal para EDITAR
window.editarProducto = (productoId) => {
  const producto = productosMenu.find(p => p.id === productoId);
  if (!producto) return;
  productoEnEdicion = producto;
  document.getElementById('modalTitle').textContent = 'Editar Producto';
  document.getElementById('submitBtn').textContent = 'Actualizar';
  document.getElementById('productoNombre').value = producto.nombre;
  document.getElementById('productoPrecio').value = producto.precio;
  document.getElementById('productoEstado').value = producto.estado;
  if (producto.imagen) {
    imagenSeleccionada = producto.imagen;
    document.getElementById('imagenPreviewImg').src = producto.imagen;
    document.getElementById('imagenPreview').classList.remove('hidden');
  }
  document.getElementById('modalCrearProducto').classList.remove('hidden');
};

// Cerrar modal
window.cerrarModal = () => {
  document.getElementById('modalCrearProducto').classList.add('hidden');
  document.getElementById('formCrearProducto').reset();
  document.getElementById('imagenPreview').classList.add('hidden');
  imagenSeleccionada = null;
  productoEnEdicion = null;
};

document.addEventListener('DOMContentLoaded', async () => {
  await fetchMenuItems();

  const form = document.getElementById('formCrearProducto');
  const inputImagen = document.getElementById('productoImagen');

  if (inputImagen) {
    inputImagen.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          imagenSeleccionada = event.target.result;
          const previewImg = document.getElementById('imagenPreviewImg');
          const previewDiv = document.getElementById('imagenPreview');
          if (previewImg && previewDiv) {
            previewImg.src = event.target.result;
            previewDiv.classList.remove('hidden');
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = document.getElementById('productoNombre')?.value;
      const precio = document.getElementById('productoPrecio')?.value;
      const categoria = document.getElementById('productoCategoria')?.value;
      const estado = document.getElementById('productoEstado')?.value;

      if (productoEnEdicion) {
        productoEnEdicion.nombre = nombre;
        productoEnEdicion.precio = isNaN(precio) ? 0 : parseFloat(precio);
        productoEnEdicion.categoria = categoria;
        productoEnEdicion.estado = estado;
        if (imagenSeleccionada && imagenSeleccionada !== productoEnEdicion.imagen) {
          productoEnEdicion.imagen = imagenSeleccionada;
        }
        alert('¡Producto actualizado exitosamente!');
      } else {
        const nuevoProducto = {
          id: contadorId++,
          nombre,
          precio: isNaN(precio) ? 0 : parseFloat(precio),
          categoria,
          estado,
          imagen: imagenSeleccionada || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
          fechaCreacion: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
        };
        productosMenu.unshift(nuevoProducto);
        alert('¡Producto creado exitosamente!');
      }

      renderProductTable();
      cerrarModal();
    });
  }

  renderProductTable();

  filterButton = document.getElementById('filterButton');
  filterMenu = document.getElementById('filterMenu');

  if (filterButton && filterMenu) {
    filterButton.addEventListener('click', () => {
      filterMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (event) => {
      if (filterButton && filterMenu && !filterButton.contains(event.target) && !filterMenu.contains(event.target)) {
        filterMenu.classList.add('hidden');
      }
    });
  }

  window.limpiarFiltros = () => {
    renderProductTable(productosMenu);
    filterMenu.classList.add('hidden');
  };

  window.aplicarFiltro = (tipo) => {
    const productos = [...productosMenu];
    switch (tipo) {
      case 'nombre': productos.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
      case 'categoria': productos.sort((a, b) => a.categoria.localeCompare(b.categoria)); break;
      case 'tiempo': productos.sort((a, b) => a.tiempo.localeCompare(b.tiempo)); break;
      case 'precio': productos.sort((a, b) => a.precio - b.precio); break;
      case 'estado': productos.sort((a, b) => a.estado.localeCompare(b.estado)); break;
      case 'fecha': productos.sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion)); break;
    }
    renderProductTable(productos);
  };

  const menuToggle = document.querySelector('.menuToggle');
  const sidebar = document.getElementById('sidebar');
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-ml-64');
      sidebar.classList.toggle('ml-0');
    });
  }

  const inputBuscar = document.getElementById('buscarProducto');
  if (inputBuscar) {
    inputBuscar.addEventListener('input', (e) => {
      const busqueda = e.target.value.toLowerCase();
      const productosFiltrados = productosMenu.filter(producto =>
        producto.nombre.toLowerCase().includes(busqueda) ||
        producto.categoria.toLowerCase().includes(busqueda)
      );
      renderProductTable(productosFiltrados);
    });
  }

  window.exportarCSV = () => {
    const encabezados = ['ID', 'Nombre', 'Categoría', 'Tiempo', 'Precio', 'Estado', 'Fecha de Creación'];
    const filas = productosMenu.map(producto => [
      producto.id,
      producto.nombre,
      producto.categoria,
      producto.tiempo,
      formatPrice(producto.precio).replace('COP', '').trim(),
      producto.estado === 'disponible' ? 'Disponible' : 'Desactivado',
      producto.fechaCreacion
    ].join(','));
    const contenidoCSV = [encabezados.join(','), ...filas].join('\n');
    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'menu_productos.csv');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cerrar sesión - Abrir modal de confirmación
  const logoutButton = document.getElementById('btnCerrarSesion');
  const modalCerrarSesion = document.getElementById('modalCerrarSesion');
  const btnConfirmarLogout = document.getElementById('confirmarLogout');
  const btnCancelarLogout = document.getElementById('cancelarLogout');

  if (logoutButton && modalCerrarSesion) {
    logoutButton.addEventListener('click', () => {
      modalCerrarSesion.classList.remove('hidden');
    });
  }

  if (btnCancelarLogout) {
    btnCancelarLogout.addEventListener('click', () => {
      modalCerrarSesion.classList.add('hidden');
    });
  }

  if (btnConfirmarLogout) {
    btnConfirmarLogout.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = '/login.html';
    });
  }
});
