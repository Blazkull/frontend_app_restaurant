// menu.js (Corregido y con llamadas a API)

import api from '../api/api.js'; 

const menuGrid = document.getElementById("menu-grid");
const comandaList = document.getElementById("comanda-list");
const comandaTitle = document.getElementById("comanda-title");
const enviarPedidoBtn = document.getElementById("enviar-pedido-btn");
const categoryButtonsContainer = document.getElementById("category-buttons");

// ID de Mesa Activa (Mock para desarrollo) - En una app real, esto viene de la URL
const ACTIVE_TABLE_ID = 3; 
const ACTIVE_TABLE_NAME = "Mesa 3"; 

let currentOrder = []; 
let productsData = []; 
let allCategories = []; 

// =========================================================
// DATOS MOCK DE CATEGORÍAS Y PRODUCTOS (Fallback si la API falla)
// =========================================================
const MOCK_CATEGORIES = [
    { id: 1, name: "Pizzas", active: true },
    { id: 2, name: "Hamburguesas" },
    { id: 3, name: "Pastas" },
    { id: 4, name: "Bebidas" },
    { id: 5, name: "Postres" },
];

const MOCK_PRODUCTS = [
    { id: 101, id_category: 1, name: "Pizza Margarita", price: 15.50, description: "Clásica masa, tomate, mozzarella y albahaca.", time_preparation: 15, image: "pizza-mock.jpg" },
    { id: 102, id_category: 1, name: "Pizza Pepperoni", price: 19.99, description: "Ingredientes: masa, pepperoni y salsa de la casa", time_preparation: 20, image: "pizza-mock.jpg" },
    { id: 103, id_category: 2, name: "Hamburguesa Clásica", price: 12.00, description: "Carne 180g, queso cheddar, lechuga, tomate.", time_preparation: 10, image: "pizza-mock.jpg" },
    { id: 104, id_category: 3, name: "Pasta Carbonara", price: 14.50, description: "Pasta fresca con salsa de huevo, queso y guanciale.", time_preparation: 18, image: "pizza-mock.jpg" },
    { id: 105, id_category: 1, name: "Pizza Vegana", price: 17.50, description: "Vegetales frescos de temporada y queso vegano.", time_preparation: 25, image: "pizza-mock.jpg" },
];


// ----------------------------------------------------------------
// FUNCIONES DE CONEXIÓN CON LA API (Rutas ajustadas)
// ----------------------------------------------------------------

/**
 * Carga las categorías del menú desde la API.
 */
async function fetchCategories() {
    try {
        // Ajuste de ruta: Se asume un prefijo '/menu/' para probar la solución al 404
        const response = await api.get('/menu/categories/'); 
        const apiCategories = response.data.items || response.data; 
        console.log("✅ Categorías cargadas desde la API.");
        return apiCategories.map(cat => ({
            id: cat.id,
            name: cat.name,
            active: false
        }));
    } catch (error) {
        console.warn("⚠️ Error al cargar categorías desde la API. Usando datos mock.", error);
        return MOCK_CATEGORIES; // Fallback
    }
}

/**
 * Carga los productos de una categoría específica desde la API.
 * @param {number} categoryId - ID de la categoría a cargar.
 */
async function fetchProducts(categoryId) {
    // Ajuste de ruta: Se asume un prefijo '/menu/' para probar la solución al 404
    let url = `/menu/products/?id_category=${categoryId}`; 
    
    try {
        const response = await api.get(url);
        const apiProducts = response.data.items || response.data;
        
        productsData = apiProducts.map(p => ({
            id: p.id,
            id_category: p.id_category,
            name: p.name,
            price: p.price,
            description: p.description,
            time_preparation: p.time_preparation,
            image: p.image || 'default.jpg' 
        }));
        console.log(`✅ Productos para categoría ${categoryId} cargados desde la API.`);
    } catch (error) {
        console.warn(`⚠️ Error al cargar productos desde la API (Cat: ${categoryId}). Usando datos mock.`, error);
        
        // Fallback: Filtrar mock data por categoría
        productsData = MOCK_PRODUCTS.filter(p => p.id_category === categoryId);
    }
    renderMenuProducts(productsData);
}


// ----------------------------------------------------------------
// RENDERIZADO DE CATEGORÍAS (Se mantiene igual)
// ----------------------------------------------------------------

function renderCategories(categories) {
    categoryButtonsContainer.innerHTML = '';
    
    categories.forEach(cat => {
        const button = document.createElement('button');
        button.dataset.categoryId = cat.id;
        button.textContent = cat.name;
        button.className = `px-4 py-2 rounded-xl text-sm font-medium transition ${
            cat.active ? 'bg-primary-blue text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`;
        
        button.addEventListener('click', async () => {
            allCategories.forEach(c => c.active = (c.id === cat.id));
            renderCategories(allCategories);
            await fetchProducts(cat.id);
        });
        
        categoryButtonsContainer.appendChild(button);
    });
}


// ----------------------------------------------------------------
// RENDERIZADO DE MENÚ (Izquierda) - Se mantiene igual
// ----------------------------------------------------------------

function renderMenuProducts(products) {
    menuGrid.innerHTML = "";
    
    if (!products || products.length === 0) {
        menuGrid.innerHTML = '<p class="text-gray-500 italic col-span-full">No hay productos en esta categoría.</p>';
        return;
    }

    products.forEach(product => {
        const currentItemInOrder = currentOrder.find(item => item.id_product === product.id && item.note === null);
        const initialQuantity = currentItemInOrder ? currentItemInOrder.quantity : 0;
        
        const card = document.createElement("div");
        card.className = "bg-white border rounded-xl shadow-sm p-4 flex flex-col";
        
        card.innerHTML = `
            <img src="../assets/img/${product.image}" alt="${product.name}" 
                 class="rounded-lg h-32 w-full object-cover mb-3 ">
            <h3 class="font-bold text-lg">${product.name}</h3>
            <p class="text-xl font-semibold text-primary-blue mb-2">$${product.price.toFixed(2)}</p>
            <p class="text-xs text-gray-600 mb-2">${product.description}</p>
            <p class="text-xs text-gray-400 mb-4">Tiempo estimado: ${product.time_preparation} min</p>

            <div class="flex items-center space-x-2 mt-auto pt-2 border-t">
                <button data-product-id="${product.id}" data-action="decrease"
                    class="p-2 border rounded-xl text-gray-500 hover:bg-gray-100 transition disabled:opacity-50"
                    ${initialQuantity === 0 ? 'disabled' : ''}
                    >-</button>
                <span id="quantity-${product.id}" class="text-sm font-medium w-6 text-center">${initialQuantity}</span>
                <button data-product-id="${product.id}" data-action="increase"
                    class="p-2 border rounded-xl text-primary-blue hover:bg-blue-50 transition">+</button>
                <button data-product-id="${product.id}" data-product-name="${product.name}"
                    class="flex-1 py-2 px-3 bg-primary-blue text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
                    data-action="add-to-order">
                    Agregar +
                </button>
            </div>
        `;
        menuGrid.appendChild(card);
    });
    
    menuGrid.querySelectorAll('button[data-action]').forEach(button => {
        button.addEventListener('click', handleMenuAction);
    });
}


// ----------------------------------------------------------------
// RENDERIZADO DE COMANDA (Derecha) - Se mantiene igual
// ----------------------------------------------------------------

function renderComanda() {
    comandaTitle.textContent = `COMANDA #${ACTIVE_TABLE_ID} - ${ACTIVE_TABLE_NAME}`;
    comandaList.innerHTML = "";

    if (currentOrder.length === 0) {
        comandaList.innerHTML = '<p class="text-center text-gray-500 italic p-4">La comanda está vacía.</p>';
        enviarPedidoBtn.disabled = true;
        enviarPedidoBtn.classList.add('opacity-50', 'cursor-not-allowed');
        return;
    }
    
    enviarPedidoBtn.disabled = false;
    enviarPedidoBtn.classList.remove('opacity-50', 'cursor-not-allowed');

    currentOrder.forEach((item, index) => {
        const product = productsData.find(p => p.id === item.id_product) || MOCK_PRODUCTS.find(p => p.id === item.id_product) || { image: 'default.jpg' };
        
        const comandaItem = document.createElement("div");
        comandaItem.className = "flex items-start justify-between border-b pb-2 mb-2 last:border-b-0 last:mb-0";
        
        comandaItem.innerHTML = `
            <div class="flex space-x-3 w-full">
                <img src="../assets/img/${product.image}" alt="${item.name}" class="rounded-lg w-12 h-12 object-cover flex-shrink-0">
                <div class="flex-1 min-w-0">
                    <p class="font-medium text-sm text-gray-900 truncate">${item.name}</p>
                    <p class="text-xs text-gray-500 mt-1">Nota: <span class="text-gray-700">${item.note || 'ninguna'}</span></p>
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
    
    comandaList.querySelectorAll('button[data-action="remove-item"]').forEach(button => {
        button.addEventListener('click', handleComandaAction);
    });
}


// ----------------------------------------------------------------
// MANEJO DE ACCIONES (Se mantiene igual)
// ----------------------------------------------------------------

function handleMenuAction(event) {
    const button = event.currentTarget;
    const productId = parseInt(button.dataset.productId);
    const action = button.dataset.action;
    const quantitySpan = document.getElementById(`quantity-${productId}`);
    const decreaseButton = button.parentNode.querySelector('[data-action="decrease"]');

    let currentQuantity = parseInt(quantitySpan.textContent);

    if (action === 'increase') {
        currentQuantity++;
    } else if (action === 'decrease' && currentQuantity > 0) {
        currentQuantity--;
    } else if (action === 'add-to-order' && currentQuantity > 0) {
        const product = productsData.find(p => p.id === productId);
        const note = prompt(`Añadir nota para ${product.name} (opcional):`); 
        
        addItemToOrder(productId, product.name, currentQuantity, note);
        
        currentQuantity = 0;
    }
    
    quantitySpan.textContent = currentQuantity;
    decreaseButton.disabled = currentQuantity === 0;
    
    if (decreaseButton.disabled) {
        decreaseButton.classList.add('opacity-50');
    } else {
        decreaseButton.classList.remove('opacity-50');
    }
}

function addItemToOrder(productId, productName, quantity, note) {
    const existingItemIndex = currentOrder.findIndex(item => 
        item.id_product === productId && (item.note || '') === (note || '')
    );
    
    if (existingItemIndex > -1) {
        currentOrder[existingItemIndex].quantity += quantity;
    } else {
        currentOrder.push({
            id_product: productId,
            name: productName,
            quantity: quantity,
            note: note 
        });
    }
    
    renderComanda();
}

function handleComandaAction(event) {
    const button = event.currentTarget;
    const indexToRemove = parseInt(button.dataset.index); 
    
    currentOrder.splice(indexToRemove, 1);
    
    renderComanda();
}

/**
 * Función para enviar la comanda completa a la API.
 */
async function sendOrder() {
    if (currentOrder.length === 0) {
        alert("La comanda está vacía. Agregue productos antes de enviar.");
        return;
    }
    
    enviarPedidoBtn.disabled = true;
    enviarPedidoBtn.textContent = 'Enviando...';
    
    const orderPayload = {
        id_table: ACTIVE_TABLE_ID,
        items: currentOrder.map(item => ({
            id_product: item.id_product,
            quantity: item.quantity,
            note: item.note || "" 
        }))
    };
    
    try {
        // La ruta /orders/ se asume correcta, ajusta si es necesario.
        const response = await api.post('/orders/', orderPayload); 
        
        alert(`Pedido #${response.data.order_id || 'N/A'} para ${ACTIVE_TABLE_NAME} enviado con éxito.`);
        
        // Limpieza de UI
        currentOrder = [];
        renderComanda();
        document.querySelectorAll('[id^="quantity-"]').forEach(span => span.textContent = 0);
        document.querySelectorAll('[data-action="decrease"]').forEach(btn => {
            btn.disabled = true;
            btn.classList.add('opacity-50');
        });

    } catch (error) {
        // Muestra el detalle del error 401/404/500
        console.error("Error al enviar el pedido:", error.response ? error.response.data : error.message);
        alert(`Error al enviar el pedido. Detalle: ${error.response ? (error.response.data.detail || JSON.stringify(error.response.data)) : error.message}`);
    } finally {
        enviarPedidoBtn.disabled = false;
        enviarPedidoBtn.textContent = 'Enviar pedido';
    }
}


// ----------------------------------------------------------------
// INICIALIZACIÓN
// ----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
    
    const categories = await fetchCategories();
    allCategories = categories; 
    
    if (allCategories.length > 0) {
        allCategories[0].active = true;
        renderCategories(allCategories);
        
        // Carga los productos de la primera categoría al inicio
        await fetchProducts(allCategories[0].id);
    } else {
        renderCategories([]);
        renderMenuProducts([]);
    }
    
    renderComanda(); 
    
    enviarPedidoBtn.addEventListener('click', sendOrder);
});