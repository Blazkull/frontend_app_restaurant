

// Datos de ejemplo del menú
const menuItems = [
  {
    id: 1,
    name: 'Pizza xl',
    price: 19999,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    ingredients: 'Ingredientes: masa, peperoni, buffillera y salsa de la casa',
    estimatedTime: '20 min',
    category: 'Pizzas'
  },
  {
    id: 2,
    name: 'Pizza xl',
    price: 19999,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    ingredients: 'Ingredientes: masa, peperoni, buffillera y salsa de la casa',
    estimatedTime: '20 min',
    category: 'Pizzas'
  },
  {
    id: 3,
    name: 'Pizza xl',
    price: 19999,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    ingredients: 'Ingredientes: masa, peperoni, buffillera y salsa de la casa',
    estimatedTime: '20 min',
    category: 'Pizzas'
  },
  {
    id: 4,
    name: 'Pizza xl',
    price: 19999,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    ingredients: 'Ingredientes: masa, peperoni, buffillera y salsa de la casa',
    estimatedTime: '20 min',
    category: 'Pizzas'
  },
  {
    id: 5,
    name: 'Pizza xl',
    price: 19999,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    ingredients: 'Ingredientes: masa, peperoni, buffillera y salsa de la casa',
    estimatedTime: '20 min',
    category: 'Pizzas'
  },
  {
    id: 6,
    name: 'Pizza xl',
    price: 19999,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    ingredients: 'Ingredientes: masa, peperoni, buffillera y salsa de la casa',
    estimatedTime: '20 min',
    category: 'Pizzas'
  }
];

// Estado del carrito
let cart = [];

// Función para formatear precio
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price);
};

// Renderizar items del menú
const renderMenuItems = () => {
  const menuGrid = document.getElementById('menuGrid');
  
  menuGrid.innerHTML = menuItems.map(item => `
    <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div class="relative">
        <img src="${item.image}" alt="${item.name}" class="w-full h-48 object-cover">
        <div class="absolute top-2 left-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
          PUNCH TODAY IN THE FACE
        </div>
      </div>
      
      <div class="p-4">
        <h3 class="text-lg font-bold text-gray-800 mb-1">${item.name}</h3>
        <p class="text-2xl font-bold text-gray-900 mb-2">${formatPrice(item.price)}</p>
        <p class="text-sm text-gray-600 mb-3">${item.ingredients}</p>
        <p class="text-sm text-gray-500 mb-4">Tiempo estimado: ${item.estimatedTime}</p>
        
        <div class="flex items-center gap-2">
          <button 
            onclick="addToCart(${item.id})"
            class="cursor-pointer flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            Agregar
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </button>
          
          <div class="flex items-center gap-2 border border-gray-300 rounded-lg">
            <button class="px-3 py-2 hover:bg-gray-100 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
              </svg>
            </button>
            <span class="text-sm font-medium">1</span>
            <button class="px-3 py-2 hover:bg-gray-100 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
};

// Agregar al carrito
window.addToCart = (itemId) => {
  const item = menuItems.find(i => i.id === itemId);
  const existingItem = cart.find(i => i.id === itemId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  
  renderCart();
  updateCartBadge();
};

// Remover del carrito
window.removeFromCart = (itemId) => {
  cart = cart.filter(i => i.id !== itemId);
  renderCart();
  updateCartBadge();
};

// Actualizar cantidad
window.updateQuantity = (itemId, change) => {
  const item = cart.find(i => i.id === itemId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(itemId);
    } else {
      renderCart();
    }
  }
};

// Renderizar carrito
const renderCart = () => {
  const orderItems = document.getElementById('orderItems');
  
  if (cart.length === 0) {
    orderItems.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-gray-400">
        <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
        </svg>
        <p class="text-sm">No hay items en la orden</p>
      </div>
    `;
    return;
  }
  
  orderItems.innerHTML = cart.map(item => `
    <div class="flex gap-3 mb-4 pb-4 border-b border-gray-200">
      <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg">
      <div class="flex-1">
        <div class="flex items-start justify-between mb-1">
          <h4 class="font-semibold text-gray-800">${item.name}</h4>
          <button onclick="removeFromCart(${item.id})" class="text-red-500 hover:text-red-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <p class="text-sm text-gray-600 mb-2">Carne 2</p>
        <p class="text-xs text-gray-500 mb-2">notas</p>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 border border-gray-300 rounded-lg">
            <button onclick="updateQuantity(${item.id}, -1)" class="px-2 py-1 hover:bg-gray-100 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
              </svg>
            </button>
            <span class="text-sm font-medium px-2">${item.quantity}</span>
            <button onclick="updateQuantity(${item.id}, 1)" class="px-2 py-1 hover:bg-gray-100 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </button>
          </div>
          <span class="font-semibold text-gray-800">${formatPrice(item.price * item.quantity)}</span>
        </div>
      </div>
    </div>
  `).join('');
};

// Actualizar badge del carrito
const updateCartBadge = () => {
  const badge = document.getElementById('cartBadge');
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = total;
};

// Enviar pedido
document.getElementById('sendOrderBtn')?.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('El carrito está vacío');
    return;
  }
  
  alert('Pedido enviado correctamente!');
  cart = [];
  renderCart();
  updateCartBadge();
});

// Toggle sidebar - EMPUJA EL CONTENIDO
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menuToggle');
  const sidebar = document.getElementById('sidebar');
  
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-ml-64');
      sidebar.classList.toggle('ml-0');
    });
  }
});

// Inicializar app
document.addEventListener('DOMContentLoaded', () => {
  renderMenuItems();
  renderCart();
  updateCartBadge();
});
