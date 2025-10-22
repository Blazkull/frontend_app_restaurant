// src/menu/menu.js (Versión Final Integrada con API FastAPI)

import api from "../api/api.js";

const menuGrid = document.getElementById("menu-grid");
const comandaList = document.getElementById("comanda-list");
const comandaTitle = document.getElementById("comanda-title");
const enviarPedidoBtn = document.getElementById("enviar-pedido-btn");
const categoryButtonsContainer = document.getElementById("category-buttons");

// ID de Mesa activa (Mock)
const ACTIVE_TABLE_ID = 3;
const ACTIVE_TABLE_NAME = "Mesa 3";

let currentOrder = [];
let productsData = [];
let allCategories = [];

// // =========================================================
// // DATOS MOCK (si falla la API)
// // =========================================================
// const MOCK_CATEGORIES = [
//   { id: 1, name: "Pizzas", active: true },
//   { id: 2, name: "Hamburguesas" },
//   { id: 3, name: "Pastas" },
//   { id: 4, name: "Bebidas" },
//   { id: 5, name: "Postres" },
// ];

// const MOCK_PRODUCTS = [
//   {
//     id: 101,
//     id_category: 1,
//     name: "Pizza Margarita",
//     price: 15.5,
//     description: "Clásica masa, tomate, mozzarella y albahaca.",
//     time_preparation: 15,
//     image: "pizza-mock.jpg",
//   },
//   {
//     id: 102,
//     id_category: 1,
//     name: "Pizza Pepperoni",
//     price: 19.99,
//     description: "Masa artesanal, pepperoni y salsa de la casa.",
//     time_preparation: 20,
//     image: "pizza-mock.jpg",
//   },
// ];

// =========================================================
// 🔹 FUNCIÓN: CARGAR CATEGORÍAS DESDE API
// =========================================================
async function fetchCategories() {
  try {
    const response = await api.get("/api/categories/");
    const apiCategories = response.data.items || response.data;
    console.log("✅ Categorías cargadas:", apiCategories);
    return apiCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      active: false,
    }));
  } catch (error) {
    console.warn("⚠️ Error al cargar categorías:", error);
    Swal.fire("Aviso", "No se pudieron cargar categorías, usando datos locales.", "warning");
    return MOCK_CATEGORIES;
  }
}

// =========================================================
// 🔹 FUNCIÓN: CARGAR PRODUCTOS DESDE API
// =========================================================
async function fetchProducts(categoryId) {
  try {
    const response = await api.get(`/api/menu_items?id_category=${categoryId}`);
    const apiProducts = response.data.items || response.data;
    productsData = apiProducts.map((p) => ({
      id: p.id,
      id_category: p.id_category,
      name: p.name,
      price: p.price,
      description: p.ingredients || p.description,
      time_preparation: p.estimated_time || p.time_preparation,
      image: p.image || "default.jpg",
    }));
    console.log(`✅ Productos de categoría ${categoryId} cargados.`);
  } catch (error) {
    console.warn(`⚠️ Error cargando productos (Cat: ${categoryId}).`, error);
    Swal.fire("Aviso", "No se pudieron cargar los productos, usando datos mock.", "warning");
    productsData = MOCK_PRODUCTS.filter((p) => p.id_category === categoryId);
  }

  renderMenuProducts(productsData);
}

// =========================================================
// 🔹 RENDERIZADO DE CATEGORÍAS
// =========================================================
function renderCategories(categories) {
  categoryButtonsContainer.innerHTML = "";

  categories.forEach((cat) => {
    const button = document.createElement("button");
    button.dataset.categoryId = cat.id;
    button.textContent = cat.name;
    button.className = `px-4 py-2 rounded-xl text-sm font-medium transition ${
      cat.active
        ? "bg-primary-blue text-white"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
    }`;

    button.addEventListener("click", async () => {
      allCategories.forEach((c) => (c.active = c.id === cat.id));
      renderCategories(allCategories);
      await fetchProducts(cat.id);
    });

    categoryButtonsContainer.appendChild(button);
  });
}

// =========================================================
// 🔹 RENDERIZADO DE PRODUCTOS DEL MENÚ
// =========================================================
function renderMenuProducts(products) {
  menuGrid.innerHTML = "";

  if (!products || products.length === 0) {
    menuGrid.innerHTML =
      '<p class="text-gray-500 italic col-span-full">No hay productos disponibles.</p>';
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("div");
    const currentItem = currentOrder.find((i) => i.id_product === product.id);
    const quantity = currentItem ? currentItem.quantity : 0;

    card.className = "bg-white border rounded-xl shadow-sm p-4 flex flex-col";

    card.innerHTML = `
      <img src="../assets/img/${product.image}" alt="${product.name}"
           class="rounded-lg h-32 w-full object-cover mb-3">
      <h3 class="font-bold text-lg">${product.name}</h3>
      <p class="text-xl font-semibold text-primary-blue mb-2">$${product.price.toFixed(2)}</p>
      <p class="text-xs text-gray-600 mb-2">${product.description}</p>
      <p class="text-xs text-gray-400 mb-4">Tiempo estimado: ${product.time_preparation} min</p>
      <div class="flex items-center space-x-2 mt-auto pt-2 border-t">
          <button data-product-id="${product.id}" data-action="decrease"
              class="p-2 border rounded-xl text-gray-500 hover:bg-gray-100 transition"
              ${quantity === 0 ? "disabled" : ""}>-</button>
          <span id="quantity-${product.id}" class="text-sm font-medium w-6 text-center">${quantity}</span>
          <button data-product-id="${product.id}" data-action="increase"
              class="p-2 border rounded-xl text-primary-blue hover:bg-blue-50 transition">+</button>
          <button data-product-id="${product.id}" data-product-name="${product.name}"
              class="flex-1 py-2 px-3 bg-primary-blue text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
              data-action="add-to-order">Agregar +</button>
      </div>
    `;

    menuGrid.appendChild(card);
  });

  menuGrid.querySelectorAll("button[data-action]").forEach((btn) =>
    btn.addEventListener("click", handleMenuAction)
  );
}

// =========================================================
// 🔹 RENDERIZADO DE COMANDA
// =========================================================
function renderComanda() {
  comandaTitle.textContent = `COMANDA #${ACTIVE_TABLE_ID} - ${ACTIVE_TABLE_NAME}`;
  comandaList.innerHTML = "";

  if (currentOrder.length === 0) {
    comandaList.innerHTML =
      '<p class="text-center text-gray-500 italic p-4">La comanda está vacía.</p>';
    enviarPedidoBtn.disabled = true;
    enviarPedidoBtn.classList.add("opacity-50", "cursor-not-allowed");
    return;
  }

  enviarPedidoBtn.disabled = false;
  enviarPedidoBtn.classList.remove("opacity-50", "cursor-not-allowed");

  currentOrder.forEach((item, index) => {
    const product =
      productsData.find((p) => p.id === item.id_product) ||
      MOCK_PRODUCTS.find((p) => p.id === item.id_product) ||
      { image: "default.jpg" };

    const div = document.createElement("div");
    div.className =
      "flex items-start justify-between border-b pb-2 mb-2 last:border-b-0";

    div.innerHTML = `
      <div class="flex space-x-3 w-full">
          <img src="../assets/img/${product.image}" alt="${item.name}" class="rounded-lg w-12 h-12 object-cover">
          <div class="flex-1">
              <p class="font-medium text-sm text-gray-900">${item.name}</p>
              <p class="text-xs text-gray-500 mt-1">Nota: <span class="text-gray-700">${
                item.note || "ninguna"
              }</span></p>
          </div>
          <div class="text-right">
              <p class="font-medium text-sm">Cant: ${item.quantity}</p>
              <button data-index="${index}" data-action="remove-item"
                  class="text-xs text-red-500 hover:text-red-700">Quitar</button>
          </div>
      </div>
    `;
    comandaList.appendChild(div);
  });

  comandaList
    .querySelectorAll('button[data-action="remove-item"]')
    .forEach((b) => b.addEventListener("click", handleComandaAction));
}

// =========================================================
// 🔹 MANEJO DE ACCIONES DEL MENÚ
// =========================================================
function handleMenuAction(e) {
  const btn = e.currentTarget;
  const productId = parseInt(btn.dataset.productId);
  const action = btn.dataset.action;
  const span = document.getElementById(`quantity-${productId}`);
  const decBtn = btn.parentNode.querySelector('[data-action="decrease"]');
  let quantity = parseInt(span.textContent);

  if (action === "increase") quantity++;
  if (action === "decrease" && quantity > 0) quantity--;
  if (action === "add-to-order" && quantity > 0) {
    const product = productsData.find((p) => p.id === productId);
    const note = prompt(`Añadir nota para ${product.name} (opcional):`) || "";
    addItemToOrder(productId, product.name, quantity, note);
    quantity = 0;
  }

  span.textContent = quantity;
  decBtn.disabled = quantity === 0;
}

// =========================================================
// 🔹 AÑADIR PRODUCTO A COMANDA
// =========================================================
function addItemToOrder(id_product, name, quantity, note) {
  const existing = currentOrder.findIndex(
    (item) => item.id_product === id_product && item.note === note
  );

  if (existing >= 0) currentOrder[existing].quantity += quantity;
  else currentOrder.push({ id_product, name, quantity, note });

  renderComanda();
}

// =========================================================
// 🔹 QUITAR ITEM DE LA COMANDA
// =========================================================
function handleComandaAction(e) {
  const index = parseInt(e.currentTarget.dataset.index);
  currentOrder.splice(index, 1);
  renderComanda();
}

// =========================================================
// 🔹 ENVIAR COMANDA A LA API
// =========================================================
async function sendOrder() {
  if (currentOrder.length === 0) {
    Swal.fire("Aviso", "La comanda está vacía.", "warning");
    return;
  }

  enviarPedidoBtn.disabled = true;
  enviarPedidoBtn.textContent = "Enviando...";

  const payload = {
    id_table: ACTIVE_TABLE_ID,
    items: currentOrder.map((item) => ({
      id_product: item.id_product,
      quantity: item.quantity,
      note: item.note,
    })),
  };

  try {
    const response = await api.post("/api/orders/", payload);
    Swal.fire("Pedido enviado", `Pedido #${response.data.id || "N/A"} enviado con éxito.`, "success");
    currentOrder = [];
    renderComanda();
  } catch (error) {
    console.error("❌ Error enviando pedido:", error);
    const message =
      error.response?.data?.detail || error.message || "Error desconocido";
    Swal.fire("Error", `No se pudo enviar el pedido: ${message}`, "error");
  } finally {
    enviarPedidoBtn.disabled = false;
    enviarPedidoBtn.textContent = "Enviar pedido";
  }
}

// =========================================================
// 🔹 INICIALIZACIÓN
// =========================================================
document.addEventListener("DOMContentLoaded", async () => {
  allCategories = await fetchCategories();

  if (allCategories.length > 0) {
    allCategories[0].active = true;
    renderCategories(allCategories);
    await fetchProducts(allCategories[0].id);
  } else {
    renderCategories([]);
    renderMenuProducts([]);
  }

  renderComanda();
  enviarPedidoBtn.addEventListener("click", sendOrder);
});
