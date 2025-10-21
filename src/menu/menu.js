// menu.js

import api from '../api/api.js'; 

const menuGrid = document.getElementById("menu-grid");
const comandaList = document.getElementById("comanda-list");
const comandaTitle = document.getElementById("comanda-title");
const enviarPedidoBtn = document.getElementById("enviar-pedido-btn");
const categoryButtonsContainer = document.getElementById("category-buttons"); // Nuevo ID

// ID de Mesa Activa (Mock para desarrollo)
const ACTIVE_TABLE_ID = 3; 
const ACTIVE_TABLE_NAME = "Mesa 3"; 

let currentOrder = []; 
let productsData = []; 

// =========================================================
// DATOS MOCK DE CATEGORÍAS
// =========================================================
const MOCK_CATEGORIES = [
    { id: 1, name: "Pizzas", active: true },
    { id: 2, name: "Hamburguesas" },
    { id: 3, name: "Pastas" },
    { id: 4, name: "Bebidas" },
    { id: 5, name: "Postres" },
];

// =========================================================
// DATOS MOCK DE PRODUCTOS (Asumimos que todos son de la categoría Pizzas por ahora)
// Repetimos el mismo producto para llenar la vista como en la imagen
// =========================================================
// const MOCK_PRODUCTS = [
//     { id: 101, id_category: 1, name: "Pizza xl", price: 19.99, description: "Ingredientes: masa, peperoni, butifarra y salsa de la casa", time_preparation: 20, image: "pizza-mock.jpg" },
//     { id: 102, id_category: 1, name: "Pizza xl", price: 19.99, description: "Ingredientes: masa, peperoni, butifarra y salsa de la casa", time_preparation: 20, image: "pizza-mock.jpg" },
//     { id: 103, id_category: 1, name: "Pizza xl", price: 19.99, description: "Ingredientes: masa, peperoni, butifarra y salsa de la casa", time_preparation: 20, image: "pizza-mock.jpg" },
//     { id: 104, id_category: 1, name: "Pizza xl", price: 19.99, description: "Ingredientes: masa, peperoni, butifarra y salsa de la casa", time_preparation: 20, image: "pizza-mock.jpg" },
//     { id: 105, id_category: 1, name: "Pizza xl", price: 19.99, description: "Ingredientes: masa, peperoni, butifarra y salsa de la casa", time_preparation: 20, image: "pizza-mock.jpg" },
//     { id: 106, id_category: 1, name: "Pizza xl", price: 19.99, description: "Ingredientes: masa, peperoni, butifarra y salsa de la casa", time_preparation: 20, image: "pizza-mock.jpg" },
// ];
// productsData = MOCK_PRODUCTS; 

// ----------------------------------------------------------------
// RENDERIZADO DE CATEGORÍAS
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
        
        button.addEventListener('click', () => {
            // Lógica para cambiar la categoría activa y recargar productos
            // Por ahora, solo simula el cambio visual
            categories.forEach(c => c.active = (c.id === cat.id));
            renderCategories(categories);
            // Simular carga de productos de la nueva categoría:
            // fetchProducts(cat.id);
            renderMenuProducts(productsData); // Usamos el mock data fijo
        });
        
        categoryButtonsContainer.appendChild(button);
    });
}


// ----------------------------------------------------------------
// RENDERIZADO DE MENÚ (Izquierda) - El mismo código de antes
// ----------------------------------------------------------------

function renderMenuProducts(products) {
    menuGrid.innerHTML = "";
    
    if (!products || products.length === 0) {
        menuGrid.innerHTML = '<p class="text-gray-500 italic col-span-full">No hay productos en esta categoría.</p>';
        return;
    }

    products.forEach(product => {
        // Inicializar la cantidad actual del producto en 0
        const initialQuantity = 0; 
        
        const card = document.createElement("div");
        card.className = "bg-white border rounded-xl shadow-sm p-4 flex flex-col";
        
        // La imagen debe estar en la carpeta ../assets/img/
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
// RENDERIZADO DE COMANDA (Derecha) - Ajuste para mostrar la imagen
// ----------------------------------------------------------------

function renderComanda() {
    comandaTitle.textContent = `COMANDA #${ACTIVE_TABLE_ID} - ${ACTIVE_TABLE_NAME}`;
    comandaList.innerHTML = "";
    
    // ... (El resto del control de estado y botones se mantiene igual)

    if (currentOrder.length === 0) {
        comandaList.innerHTML = '<p class="text-center text-gray-500 italic p-4">La comanda está vacía.</p>';
        enviarPedidoBtn.disabled = true;
        enviarPedidoBtn.classList.add('opacity-50', 'cursor-not-allowed');
        return;
    }
    
    enviarPedidoBtn.disabled = false;
    enviarPedidoBtn.classList.remove('opacity-50', 'cursor-not-allowed');

    currentOrder.forEach(item => {
        const product = productsData.find(p => p.id === item.id_product) || { image: 'default.jpg' };
        
        const comandaItem = document.createElement("div");
        comandaItem.className = "flex items-start justify-between border-b pb-2 mb-2 last:border-b-0 last:mb-0";
        
        comandaItem.innerHTML = `
            <div class="flex space-x-3 w-full">
                <img src="../assets/img/${product.image}" alt="${item.name}" class="rounded-lg w-12 h-12 object-cover flex-shrink-0">
                <div class="flex-1 min-w-0">
                    <p class="font-medium text-sm text-gray-900 truncate">${item.name}</p>
                    <p class="text-xs text-gray-500 mt-1">nota: <span class="text-gray-700">${item.note || 'ninguna'}</span></p>
                </div>
                <div class="text-right flex-shrink-0">
                    <p class="font-medium text-sm">Cant: ${item.quantity}</p>
                    <button data-id-product="${item.id_product}" data-action="remove-item" 
                            class="text-xs text-red-500 hover:text-red-700 transition hidden">Quitar</button>
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
// MANEJO DE ACCIONES (Actualizado para deshabilitar botón en 0)
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
        
        // Resetear el contador y deshabilitar el botón de disminuir
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

// ... (El resto de las funciones addItemToOrder, handleComandaAction, sendOrder se mantienen igual)
function addItemToOrder(productId, productName, quantity, note) {
    // Buscar si el producto ya existe en la comanda (por ID y NOTA para pedidos especiales)
    const existingItemIndex = currentOrder.findIndex(item => 
        item.id_product === productId && item.note === note
    );
    
    if (existingItemIndex > -1) {
        // Actualizar cantidad si existe
        currentOrder[existingItemIndex].quantity += quantity;
    } else {
        // Agregar nuevo ítem
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
    const productId = parseInt(button.dataset.idProduct);
    
    currentOrder = currentOrder.filter(item => item.id_product !== productId);
    
    renderComanda();
}

async function sendOrder() {
    if (currentOrder.length === 0) {
        alert("La comanda está vacía. Agregue productos antes de enviar.");
        return;
    }
    
    const orderPayload = {
        id_table: ACTIVE_TABLE_ID,
        items: currentOrder.map(item => ({
            id_product: item.id_product,
            quantity: item.quantity,
            note: item.note || "" 
        }))
    };
    
    console.log("Payload de Pedido a enviar:", orderPayload);
    
    try {
        // await api.post('/orders/', orderPayload); 
        
        alert(`Pedido para ${ACTIVE_TABLE_NAME} enviado con éxito. Ítems: ${currentOrder.length}`);
        
        currentOrder = [];
        renderComanda();
        document.querySelectorAll('[id^="quantity-"]').forEach(span => span.textContent = 0);
        document.querySelectorAll('[data-action="decrease"]').forEach(btn => {
            btn.disabled = true;
            btn.classList.add('opacity-50');
        });

    } catch (error) {
        console.error("Error al enviar el pedido:", error.response ? error.response.data : error.message);
        alert("Error al enviar el pedido. Consulte la consola.");
    }
}


// ----------------------------------------------------------------
// INICIALIZACIÓN
// ----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar categorías y productos
    renderCategories(MOCK_CATEGORIES);
    renderMenuProducts(productsData);
    
    // 2. Inicializar la comanda (Vacía)
    renderComanda(); 
    
    // 3. Asignar evento al botón de envío
    enviarPedidoBtn.addEventListener('click', sendOrder);
});