import api from "../api/api.js";
import showAlert from "../components/alerts.js";

const menuGrid = document.getElementById("menu-grid");
const categoryContainer = document.getElementById("category-container");
const orderList = document.getElementById("order-list");
const sendOrderBtn = document.getElementById("send-order-btn");
const tableTitle = document.getElementById("table-title");
const totalAmountElement = document.getElementById("total-amount");

// Datos globales
let categoriesData = [];
let productsData = [];
let currentOrder = [];
let currentTable = null;
let currentOrderId = null; // Para tracking de orden abierta

// =========================================================
// CARGA DE CATEGORÍAS DESDE EL BACKEND
// =========================================================
async function fetchCategories() {
  try {
    console.log("🔍 Obteniendo categorías...");
    console.log("📡 URL:", `${api.defaults.baseURL}/categories`);
    
    const response = await api.get("/categories", {
      params: {
        offset: 0,
        limit: 50,
        status_filter: "Activo" // Solo categorías activas
      },
    });

    console.log("📦 Respuesta completa de categorías:", response.data);

    // La API devuelve un objeto genérico, intentar diferentes estructuras
    let items = [];
    
    if (response.data.items) {
      items = response.data.items;
    } else if (response.data.data) {
      items = response.data.data;
    } else if (response.data.categories) {
      items = response.data.categories;
    } else if (Array.isArray(response.data)) {
      items = response.data;
    } else {
      // Si no podemos encontrar el array, intentar buscar en las propiedades del objeto
      const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
      if (possibleArrays.length > 0) {
        items = possibleArrays[0];
      } else {
        console.warn("⚠️ No se encontró un array en la respuesta, usando estructura completa");
        // Si la respuesta tiene claves que son objetos con id y name, convertirlos
        items = Object.values(response.data).filter(item => 
          item && typeof item === 'object' && 'id' in item && 'name' in item
        );
      }
    }
    
    if (!Array.isArray(items) || items.length === 0) {
      console.warn("⚠️ No se encontraron categorías, mostrando opción 'Todos'");
      throw new Error("No se encontraron categorías en la respuesta");
    }

    // Agregar opción "Todos" al inicio
    categoriesData = [
      { id: null, name: "Todos", active: true },
      ...items.map((cat, index) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || "",
        active: false
      }))
    ];

    console.log(`✅ ${categoriesData.length} categorías cargadas:`, categoriesData);
    
    renderCategories(categoriesData);
    
    // Cargar todos los items inicialmente (categoría "Todos")
    await fetchMenuItems(null);
  } catch (error) {
    console.error("❌ Error al obtener categorías:", error);
    console.error("📋 Detalles del error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method
    });
    
    // Verificar si es un error de autenticación
    if (error.response?.status === 401 || error.response?.status === 403) {
      showAlert({
        type: "error",
        title: "Sesión expirada",
        message: "Por favor, inicia sesión nuevamente.",
      });
      return;
    }
    
    // Categoría por defecto en caso de error
    categoriesData = [{ id: null, name: "Todos", active: true }];
    renderCategories(categoriesData);
    
    // Intentar cargar items sin filtro de categoría
    await fetchMenuItems(null);
    
    // Mostrar alerta solo si no es un error de red común
    if (error.response?.status === 500) {
      showAlert({
        type: "warning",
        title: "Advertencia",
        message: "Error del servidor al cargar categorías. Mostrando todos los items disponibles.",
      });
    }
  }
}

// =========================================================
// CARGA DE ÍTEMS DE MENÚ
// =========================================================
async function fetchMenuItems(categoryId = null) {
  try {
    console.log(`🔍 Obteniendo items del menú${categoryId ? ` (categoría ${categoryId})` : ''}...`);
    
    const params = {
      page: 1,
      page_size: 50,
      status_id: 1, // Solo items activos (ajusta según tu BD)
    };
    
    if (categoryId) {
      params.category_id = categoryId;
    }

    const response = await api.get("/menu_items", { params });
    
    // La respuesta tiene estructura: { items: [...], total_items, page, page_size, total_pages }
    const items = response.data.items || [];

    productsData = items.map((item) => ({
      id: item.id,
      id_category: item.id_category,
      name: item.name,
      price: parseFloat(item.price),
      description: item.ingredients || "Sin descripción",
      time_preparation: item.estimated_time || 0,
      // Si no hay imagen, usar un SVG placeholder en lugar de una ruta que no existe
      image: item.image_url || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%239ca3af%22 font-family=%22Arial%22 font-size=%2224%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3ESin imagen%3C/text%3E%3C/svg%3E',
      status_id: item.id_status,
    }));

    console.log(`✅ ${productsData.length} items cargados`);
    renderMenuProducts(productsData);
  } catch (error) {
    console.error("❌ Error al obtener ítems del menú:", error);
    menuGrid.innerHTML =
      '<p class="text-red-500 italic col-span-full text-center py-8">Error al cargar los ítems del menú.</p>';
  }
}

// =========================================================
// RENDERIZAR CATEGORÍAS
// =========================================================
function renderCategories(categories) {
  categoryContainer.innerHTML = "";

  categories.forEach((cat) => {
    const button = document.createElement("button");
    button.textContent = cat.name;
    button.className = `px-4 py-2 rounded-full text-sm font-medium transition-all ${
      cat.active
        ? "bg-indigo-600 text-white shadow-md"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`;

    button.addEventListener("click", async () => {
      // Actualizar estado activo
      categories.forEach((c) => (c.active = c.id === cat.id));
      renderCategories(categories);
      await fetchMenuItems(cat.id);
    });

    categoryContainer.appendChild(button);
  });
}

// =========================================================
// RENDERIZAR PRODUCTOS DEL MENÚ
// =========================================================
function renderMenuProducts(products) {
  menuGrid.innerHTML = "";

  if (!products.length) {
    menuGrid.innerHTML =
      '<p class="text-gray-500 italic col-span-full text-center py-8">No hay productos disponibles en esta categoría.</p>';
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className =
      "bg-white rounded-2xl shadow-md overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow";

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" 
           class="h-40 w-full object-cover bg-gray-200"
           onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22200%22 height=%22200%22/%3E%3Ctext fill=%22%239ca3af%22 font-family=%22Arial%22 font-size=%2216%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3ESin imagen%3C/text%3E%3C/svg%3E'">
      <div class="p-4 flex flex-col gap-2">
        <h3 class="text-lg font-bold text-gray-800">${product.name}</h3>
        <p class="text-indigo-600 font-semibold text-xl">$${product.price.toLocaleString()}</p>
        <p class="text-sm text-gray-600 line-clamp-2">${product.description}</p>
        <div class="flex items-center gap-1 text-xs text-gray-400">
          <i data-lucide="clock" class="w-4 h-4"></i>
          <span>${product.time_preparation} min</span>
        </div>
        <div class="flex items-center justify-between mt-3 pt-3 border-t">
          <div class="flex items-center gap-3">
            <button class="decrease bg-gray-200 text-gray-700 w-8 h-8 rounded-lg hover:bg-gray-300 transition font-bold">
              -
            </button>
            <span class="quantity text-gray-800 font-semibold text-lg min-w-[20px] text-center">0</span>
            <button class="increase bg-gray-200 text-gray-700 w-8 h-8 rounded-lg hover:bg-gray-300 transition font-bold">
              +
            </button>
          </div>
          <button class="add-btn bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm">
            Agregar
          </button>
        </div>
      </div>
    `;

    const qtySpan = card.querySelector(".quantity");
    const decreaseBtn = card.querySelector(".decrease");
    const increaseBtn = card.querySelector(".increase");
    const addBtn = card.querySelector(".add-btn");

    let quantity = 0;

    decreaseBtn.addEventListener("click", () => {
      if (quantity > 0) {
        quantity--;
        qtySpan.textContent = quantity;
      }
    });

    increaseBtn.addEventListener("click", () => {
      quantity++;
      qtySpan.textContent = quantity;
    });

    addBtn.addEventListener("click", () => {
      if (quantity > 0) {
        addToOrder(product, quantity);
        quantity = 0;
        qtySpan.textContent = quantity;
      } else {
        showAlert({
          type: "info",
          title: "Cantidad inválida",
          message: "Debes seleccionar al menos 1 unidad.",
        });
      }
    });

    menuGrid.appendChild(card);
  });

  // Inicializar iconos de Lucide
  if (window.lucide) {
    lucide.createIcons();
  }
}

// =========================================================
// GESTIÓN DE COMANDA
// =========================================================
function addToOrder(product, qty) {
  const existing = currentOrder.find((item) => item.id === product.id);
  
  if (existing) {
    existing.quantity += qty;
  } else {
    currentOrder.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      note: "", // Podrías agregar un campo para notas
    });
  }
  
  renderOrder();
  
  // Feedback visual
  showNotification(`${product.name} agregado (x${qty})`, "success");
}

function removeFromOrder(productId) {
  currentOrder = currentOrder.filter((item) => item.id !== productId);
  renderOrder();
}

function updateQuantity(productId, newQuantity) {
  const item = currentOrder.find((i) => i.id === productId);
  if (item) {
    if (newQuantity <= 0) {
      removeFromOrder(productId);
    } else {
      item.quantity = newQuantity;
      renderOrder();
    }
  }
}

function renderOrder() {
  orderList.innerHTML = "";

  if (currentOrder.length === 0) {
    orderList.innerHTML =
      '<p class="text-gray-500 italic text-center py-4">La comanda está vacía.</p>';
    sendOrderBtn.disabled = true;
    if (totalAmountElement) totalAmountElement.textContent = "$0";
    return;
  }

  let total = 0;

  currentOrder.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const li = document.createElement("li");
    li.className =
      "flex justify-between items-center border-b pb-3 mb-3 text-sm";
    
    li.innerHTML = `
      <div class="flex-1">
        <p class="font-medium text-gray-800">${item.name}</p>
        <div class="flex items-center gap-2 mt-1">
          <button class="qty-decrease text-gray-500 hover:text-gray-700" data-id="${item.id}">
            <i data-lucide="minus-circle" class="w-4 h-4"></i>
          </button>
          <span class="text-xs text-gray-600 font-semibold">x${item.quantity}</span>
          <button class="qty-increase text-gray-500 hover:text-gray-700" data-id="${item.id}">
            <i data-lucide="plus-circle" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
      <div class="text-right">
        <p class="font-semibold text-indigo-600">$${itemTotal.toLocaleString()}</p>
        <button class="remove-item text-red-500 hover:text-red-700 text-xs mt-1" data-id="${item.id}">
          Eliminar
        </button>
      </div>
    `;
    
    orderList.appendChild(li);
  });

  // Eventos para botones de cantidad
  orderList.querySelectorAll(".qty-decrease").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      const item = currentOrder.find((i) => i.id === id);
      if (item) updateQuantity(id, item.quantity - 1);
    });
  });

  orderList.querySelectorAll(".qty-increase").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      const item = currentOrder.find((i) => i.id === id);
      if (item) updateQuantity(id, item.quantity + 1);
    });
  });

  orderList.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      removeFromOrder(id);
    });
  });

  // Actualizar total
  if (totalAmountElement) {
    totalAmountElement.textContent = `$${total.toLocaleString()}`;
  }

  sendOrderBtn.disabled = false;

  // Reinicializar iconos
  if (window.lucide) {
    lucide.createIcons();
  }
}

// =========================================================
// ENVIAR COMANDA AL BACKEND
// =========================================================
async function sendOrder() {
  if (!currentOrder.length) {
    showAlert({
      type: "info",
      title: "Comanda vacía",
      message: "Agrega productos antes de enviar.",
    });
    return;
  }

  if (!currentTable) {
    showAlert({
      type: "error",
      title: "Mesa no seleccionada",
      message: "Debes seleccionar una mesa antes de enviar el pedido.",
    });
    return;
  }

  try {
    // Deshabilitar botón mientras se envía
    sendOrderBtn.disabled = true;
    sendOrderBtn.innerHTML = '<span class="animate-pulse">Enviando...</span>';

    // Calcular total
    const totalValue = currentOrder.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Preparar items en el formato que espera la API
    const items = currentOrder.map((item) => ({
      id_menu_item: item.id,
      quantity: item.quantity,
      note: item.note || "",
      price_at_order: item.price,
    }));

    // Crear la orden con items
    // Endpoint: POST /api/orders
    const orderData = {
    id_table: parseInt(currentTable),
    id_status: 2, // Pendiente (ajustar según tu backend)
    id_user_created: parseInt(localStorage.getItem("user_id")) || 1,
    total_value: totalValue,
    items: currentOrder.map(item => ({
        id_menu_item: item.id,
        quantity: item.quantity,
        note: item.note || "",
        price_at_order: item.price,
    })),
    };


    console.log("📤 Enviando orden:", orderData);

    const response = await api.post("/orders", orderData);

    console.log("✅ Orden creada:", response.data);

    // Mostrar alerta de éxito
    await showAlert({
      title: "¡Pedido enviado!",
      message: `Orden #${response.data.id} enviada correctamente a cocina.`,
      type: "success",
    });

    // Limpiar comanda
    currentOrder = [];
    currentOrderId = response.data.id;
    renderOrder();

  } catch (error) {
    console.error("❌ Error al enviar orden:", error);
    
    const errorMsg = error.response?.data?.detail || "No se pudo enviar el pedido.";
    
    showAlert({
      title: "Error al enviar",
      message: errorMsg,
      type: "error",
    });

    // Restaurar botón
    sendOrderBtn.disabled = false;
    sendOrderBtn.textContent = "Enviar pedido";
  }
}

// =========================================================
// OBTENER/ESTABLECER MESA ACTUAL
// =========================================================
function setTableInfo() {
  // Prioridad: URL > localStorage > null
  const urlParams = new URLSearchParams(window.location.search);
  const tableFromUrl = urlParams.get('table');
  const tableFromStorage = localStorage.getItem("current_table");
  const tableNameFromStorage = localStorage.getItem("current_table_name");
  
  currentTable = tableFromUrl || tableFromStorage || null;

  if (currentTable) {
    // Guardar en localStorage para persistencia
    localStorage.setItem("current_table", currentTable);
    
    const tableName = tableNameFromStorage || `Mesa ${currentTable}`;
    tableTitle.textContent = `COMANDA - ${tableName}`;
    tableTitle.classList.add("text-indigo-600");
    
    console.log(`📍 Mesa seleccionada: ${tableName} (ID: ${currentTable})`);
  } else {
    tableTitle.textContent = "⚠️ Mesa no seleccionada";
    tableTitle.classList.add("text-red-600");
    console.warn("⚠️ No se ha seleccionado una mesa");
    
    // Mostrar alerta
    showAlert({
      type: "warning",
      title: "Mesa no seleccionada",
      message: "Por favor, selecciona una mesa desde el mapa de mesas.",
    });
  }
}

// =========================================================
// NOTIFICACIÓN RÁPIDA
// =========================================================
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium z-50 transform transition-all duration-300 ${
    type === "success" ? "bg-green-500" : "bg-blue-500"
  }`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = "translateX(400px)";
    notification.style.opacity = "0";
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// =========================================================
// EVENTO: ENVIAR PEDIDO
// =========================================================
if (sendOrderBtn) {
  sendOrderBtn.addEventListener("click", sendOrder);
}

// =========================================================
// INICIALIZACIÓN
// =========================================================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Inicializando módulo de menú...");
  
  setTableInfo();
  await fetchCategories();
  
  console.log("✅ Módulo de menú inicializado");
});