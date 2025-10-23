// ======================================================
// menu.js — versión corregida para depurar error 422
// ======================================================

import api from '../api/api.js';
import showAlert from '../components/alerts.js';
import { checkSession } from '../api/api.js';

// Elementos del DOM
const menuGrid = document.getElementById("menu-grid");
const comandaList = document.getElementById("comanda-list");
const comandaTitle = document.getElementById("comanda-title");
const enviarPedidoBtn = document.getElementById("enviar-pedido-btn");
const categoryButtonsContainer = document.getElementById("category-buttons");

// ID de mesa activa
const ACTIVE_TABLE_ID = 3;
const ACTIVE_TABLE_NAME = "Mesa 3";

let currentOrder = [];
let productsData = [];
let allCategories = [];

// ======================================================
// FALLBACK DATA (si el servidor falla)
// ======================================================

const MOCK_CATEGORIES = [
  { id: 1, name: "Pizzas", active: true },
  { id: 2, name: "Hamburguesas", active: false },
  { id: 3, name: "Bebidas", active: false },
  { id: 4, name: "Postres", active: false },
];

const MOCK_PRODUCTS = [
  { 
    id: 101, 
    id_category: 1, 
    name: "Pizza Margarita", 
    price: 15.50, 
    description: "Masa artesanal, salsa de tomate, mozzarella fresca y albahaca.", 
    time_preparation: 15, 
    image: "default.jpg" 
  },
  { 
    id: 102, 
    id_category: 1, 
    name: "Pizza Pepperoni", 
    price: 17.00, 
    description: "Masa fina, salsa especial, mozzarella y pepperoni.", 
    time_preparation: 15, 
    image: "default.jpg" 
  },
  { 
    id: 103, 
    id_category: 2, 
    name: "Hamburguesa Clásica", 
    price: 12.00, 
    description: "Carne 180g, queso cheddar, lechuga, tomate y salsa especial.", 
    time_preparation: 10, 
    image: "default.jpg" 
  },
  { 
    id: 104, 
    id_category: 3, 
    name: "Limonada Natural", 
    price: 3.50, 
    description: "Jugo de limón fresco, agua y azúcar.", 
    time_preparation: 5, 
    image: "default.jpg" 
  },
  { 
    id: 105, 
    id_category: 4, 
    name: "Tiramisú", 
    price: 6.00, 
    description: "Bizcocho, café, mascarpone y cacao.", 
    time_preparation: 0, 
    image: "default.jpg" 
  },
];

// ======================================================
// API CALLS CON REINTENTOS
// ======================================================

/**
 * Función auxiliar para reintentar peticiones
 */
async function retryRequest(requestFn, maxRetries = 2, delayMs = 1500) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      console.warn(`⚠️ Intento ${attempt} falló, reintentando en ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

/**
 * Cargar categorías reales desde la API
 */
async function fetchCategories() {
  const loadingAlert = Swal.fire({
    title: "Cargando categorías...",
    text: "Conectando con el servidor...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const response = await retryRequest(() => api.get("/categories"));
    Swal.close();

    allCategories = response.data?.data || [];

    if (allCategories.length === 0) {
      throw new Error("No se recibieron categorías");
    }

    showAlert({
      type: "success",
      title: "Categorías cargadas",
      message: `Se cargaron ${allCategories.length} categorías correctamente.`,
      timer: 2000,
    });

    // Forzar primera categoría activa
    allCategories[0].active = true;
    renderCategories(allCategories);

  } catch (error) {
    Swal.close();
    console.warn("⚠️ Error al cargar categorías:", error);
    
    // Usar datos de respaldo
    allCategories = MOCK_CATEGORIES;
    renderCategories(allCategories);
    
    showAlert({
      type: "warning",
      title: "Modo sin conexión",
      message: "El servidor no responde. Usando datos de demostración.",
    });
  }
}

/**
 * Cargar ítems del menú desde la API
 */
async function fetchMenuItems() {
  const loadingAlert = Swal.fire({
    title: "Cargando menú...",
    text: "Obteniendo productos del servidor...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const response = await retryRequest(() => api.get("/menu_items"));
    Swal.close();

    const items = response.data?.items || response.data?.data || [];
    
    productsData = items.map(i => ({
      id: i.id,
      id_category: i.id_category,
      name: i.name,
      price: parseFloat(i.price),
      description: i.ingredients || i.description || "",
      time_preparation: parseInt(i.estimated_time) || 0,
      image: i.image || "default.jpg"
    }));

    showAlert({
      type: "success",
      title: "Menú cargado",
      message: `Se cargaron ${productsData.length} productos.`,
      timer: 2000,
    });

    // Pintar los productos de la primera categoría
    if (allCategories.length > 0) {
      renderMenuProducts(productsData.filter(p => p.id_category === allCategories[0].id));
    }

  } catch (error) {
    Swal.close();
    console.warn("⚠️ Error al cargar menú:", error);
    
    // Usar datos de respaldo
    productsData = MOCK_PRODUCTS;
    
    if (allCategories.length > 0) {
      renderMenuProducts(productsData.filter(p => p.id_category === allCategories[0].id));
    }
    
    showAlert({
      type: "warning",
      title: "Modo sin conexión",
      message: "Mostrando menú de demostración.",
    });
  }
}

/**
 * Enviar la comanda (pedido)
 */
async function sendOrder() {
  if (currentOrder.length === 0) {
    showAlert({
      type: "info",
      title: "Comanda vacía",
      message: "Agrega productos antes de enviar el pedido.",
    });
    return;
  }

  const loadingOrder = Swal.fire({
    title: "Enviando pedido...",
    text: "Por favor espera mientras se procesa la comanda.",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  enviarPedidoBtn.disabled = true;
  enviarPedidoBtn.textContent = "Enviando...";

  // Obtener el ID del usuario actual desde localStorage
  const currentUserId = parseInt(localStorage.getItem("user_id")) || 1;

  // Construir payload según el formato esperado por el backend
  const orderPayload = {
    id_table: ACTIVE_TABLE_ID,
    id_status: 1,  // ✅ Estado inicial: "Pendiente" o "En preparación"
    id_user_created: currentUserId,  // ✅ Usuario que crea la orden
    items: currentOrder.map(item => {
      const product = productsData.find(p => p.id === item.id_product);
      return {
        id_menu_item: item.id_product,
        quantity: item.quantity,
        price_at_order: product ? product.price : 0,  // ✅ Precio al momento de ordenar
        note: item.note || ""
      };
    })
  };

  // DEBUG: Mostrar en consola el payload exacto
  console.log("📦 Payload a enviar:", JSON.stringify(orderPayload, null, 2));

  try {
    const response = await api.post("/orders", orderPayload);
    Swal.close();

    const orderId = response.data?.id || response.data?.order_id || "N/A";

    showAlert({
      type: "success",
      title: "Pedido enviado",
      message: `La comanda #${orderId} para ${ACTIVE_TABLE_NAME} fue enviada correctamente.`,
    });

    currentOrder = [];
    renderComanda();

  } catch (error) {
    Swal.close();
    console.error("❌ Error al enviar el pedido:", error);
    
    // Mostrar detalles específicos del error 422
    if (error.response?.status === 422) {
      console.error("📋 Detalles del error 422:", error.response.data);
      
      let errorDetails = "Error de validación en los datos enviados.";
      
      if (error.response.data?.detail) {
        const detail = error.response.data.detail;
        
        if (Array.isArray(detail)) {
          errorDetails = detail.map(err => {
            const field = err.loc?.join(' → ') || 'campo';
            return `• ${field}: ${err.msg}`;
          }).join('\n');
        } else if (typeof detail === 'string') {
          errorDetails = detail;
        }
      }
      
      showAlert({
        type: "error",
        title: "Error de validación (422)",
        message: errorDetails,
      });
    } else {
      showAlert({
        type: "error",
        title: "Error al enviar",
        message: error.response?.data?.detail || "Ocurrió un problema al enviar el pedido.",
      });
    }
  } finally {
    enviarPedidoBtn.disabled = false;
    enviarPedidoBtn.textContent = "Enviar pedido";
  }
}

// ======================================================
// RENDER CATEGORÍAS
// ======================================================

function renderCategories(categories) {
  categoryButtonsContainer.innerHTML = "";

  categories.forEach(cat => {
    const button = document.createElement("button");
    button.dataset.categoryId = cat.id;
    button.textContent = cat.name;
    button.className = `px-4 py-2 rounded-xl text-sm font-medium transition ${cat.active
      ? "bg-blue-600 text-white"
      : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`;

    button.addEventListener("click", () => {
      allCategories.forEach(c => (c.active = c.id === cat.id));
      renderCategories(allCategories);
      const filtered = productsData.filter(p => p.id_category === cat.id);
      renderMenuProducts(filtered);
    });

    categoryButtonsContainer.appendChild(button);
  });
}

// ======================================================
// RENDER MENÚ
// ======================================================

function renderMenuProducts(products) {
  menuGrid.innerHTML = "";

  if (!products || products.length === 0) {
    menuGrid.innerHTML = '<p class="text-gray-500 italic col-span-full">No hay productos disponibles.</p>';
    return;
  }

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "bg-white border rounded-xl shadow-sm p-4 flex flex-col";

    const currentItemInOrder = currentOrder.find(i => i.id_product === product.id);
    const initialQuantity = currentItemInOrder ? currentItemInOrder.quantity : 0;

    card.innerHTML = `
      <img src="../assets/img/${product.image}" alt="${product.name}" class="rounded-lg h-32 w-full object-cover mb-3">
      <h3 class="font-bold text-lg">${product.name}</h3>
      <p class="text-xl font-semibold text-blue-600 mb-2">$${product.price.toFixed(2)}</p>
      <p class="text-xs text-gray-600 mb-2">${product.description}</p>
      <p class="text-xs text-gray-400 mb-4">Tiempo estimado: ${product.time_preparation} min</p>

      <div class="flex items-center space-x-2 mt-auto pt-2 border-t">
        <button data-product-id="${product.id}" data-action="decrease"
          class="p-2 border rounded-xl text-gray-500 hover:bg-gray-100 transition ${initialQuantity === 0 ? "opacity-50" : ""}"
          ${initialQuantity === 0 ? "disabled" : ""}>-</button>
        <span id="quantity-${product.id}" class="text-sm font-medium w-6 text-center">${initialQuantity}</span>
        <button data-product-id="${product.id}" data-action="increase"
          class="p-2 border rounded-xl text-blue-600 hover:bg-blue-50 transition">+</button>
        <button data-product-id="${product.id}" data-product-name="${product.name}"
          class="flex-1 py-2 px-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          data-action="add-to-order">
          Agregar +
        </button>
      </div>
    `;
    menuGrid.appendChild(card);
  });

  menuGrid.querySelectorAll("button[data-action]").forEach(btn => {
    btn.addEventListener("click", handleMenuAction);
  });
}

// ======================================================
// RENDER COMANDA
// ======================================================

function renderComanda() {
  comandaTitle.textContent = `COMANDA #${ACTIVE_TABLE_ID} - ${ACTIVE_TABLE_NAME}`;
  comandaList.innerHTML = "";

  if (currentOrder.length === 0) {
    comandaList.innerHTML = '<p class="text-center text-gray-500 italic p-4">La comanda está vacía.</p>';
    enviarPedidoBtn.disabled = true;
    enviarPedidoBtn.classList.add("opacity-50", "cursor-not-allowed");
    return;
  }

  enviarPedidoBtn.disabled = false;
  enviarPedidoBtn.classList.remove("opacity-50", "cursor-not-allowed");

  currentOrder.forEach((item, index) => {
    const product = productsData.find(p => p.id === item.id_product) || { image: "default.jpg" };

    const comandaItem = document.createElement("div");
    comandaItem.className = "flex items-start justify-between border-b pb-2 mb-2";

    comandaItem.innerHTML = `
      <div class="flex space-x-3 w-full">
        <img src="../assets/img/${product.image}" alt="${item.name}" class="rounded-lg w-12 h-12 object-cover">
        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm text-gray-900 truncate">${item.name}</p>
          <p class="text-xs text-gray-500 mt-1">Nota: <span class="text-gray-700">${item.note || "ninguna"}</span></p>
        </div>
        <div class="text-right flex-shrink-0">
          <p class="font-medium text-sm">Cant: ${item.quantity}</p>
          <button data-index="${index}" data-action="remove-item"
                  class="text-xs text-red-500 hover:text-red-700 transition">Quitar</button>
        </div>
      </div>
    `;

    comandaList.appendChild(comandaItem);
  });

  comandaList.querySelectorAll('button[data-action="remove-item"]').forEach(btn => {
    btn.addEventListener("click", handleComandaAction);
  });
}

// ======================================================
// EVENTOS
// ======================================================

function handleMenuAction(event) {
  const button = event.currentTarget;
  const productId = parseInt(button.dataset.productId);
  const action = button.dataset.action;
  const quantitySpan = document.getElementById(`quantity-${productId}`);
  const decreaseButton = button.parentNode.querySelector('[data-action="decrease"]');

  let currentQuantity = parseInt(quantitySpan.textContent);

  if (action === "increase") {
    currentQuantity++;
  } else if (action === "decrease" && currentQuantity > 0) {
    currentQuantity--;
  } else if (action === "add-to-order" && currentQuantity > 0) {
    const product = productsData.find(p => p.id === productId);
    const note = prompt(`Añadir nota para ${product.name} (opcional):`);
    addItemToOrder(productId, product.name, currentQuantity, note);
    currentQuantity = 0;
  }

  quantitySpan.textContent = currentQuantity;
  decreaseButton.disabled = currentQuantity === 0;
  decreaseButton.classList.toggle("opacity-50", currentQuantity === 0);
}

function addItemToOrder(productId, productName, quantity, note) {
  const existingItemIndex = currentOrder.findIndex(
    i => i.id_product === productId && (i.note || "") === (note || "")
  );

  if (existingItemIndex > -1) {
    currentOrder[existingItemIndex].quantity += quantity;
  } else {
    currentOrder.push({ 
      id_product: productId, 
      name: productName, 
      quantity: quantity,
      note: note || ""
    });
  }

  showAlert({
    type: "success",
    title: "Producto agregado",
    message: `${productName} se añadió a la comanda.`,
  });

  renderComanda();
}

function handleComandaAction(event) {
  const indexToRemove = parseInt(event.currentTarget.dataset.index);
  const removed = currentOrder.splice(indexToRemove, 1)[0];
  renderComanda();

  showAlert({
    type: "info",
    title: "Producto eliminado",
    message: `${removed.name} fue eliminado de la comanda.`,
  });
}

// ======================================================
// INICIALIZACIÓN
// ======================================================

document.addEventListener("DOMContentLoaded", async () => {
  // Verificar sesión antes de cargar datos
  checkSession();
  
  await fetchCategories();
  await fetchMenuItems();
  renderComanda();
  enviarPedidoBtn.addEventListener("click", sendOrder);
});