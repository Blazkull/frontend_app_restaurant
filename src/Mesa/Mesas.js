import '../Menu/style.css'

// Datos de las mesas (20 mesas)
const mesas = [
  { id: 1, numero: 'Mesa 1', ubicacion: 'Salón Principal', capacidad: 4, estado: 'disponible' },
  { id: 2, numero: 'Mesa 2', ubicacion: 'Salón Principal', capacidad: 4, estado: 'disponible' },
  { id: 3, numero: 'Mesa 3', ubicacion: 'Salón Principal', capacidad: 4, estado: 'disponible' },
  { id: 4, numero: 'Mesa 1', ubicacion: 'Salón Principal', capacidad: 4, estado: 'ocupada' },
  { id: 5, numero: 'Mesa 2', ubicacion: 'Salón Principal', capacidad: 4, estado: 'ocupada' },
  { id: 6, numero: 'Mesa 3', ubicacion: 'Salón Principal', capacidad: 4, estado: 'ocupada' },
  { id: 7, numero: 'Mesa 1', ubicacion: 'Salón Principal', capacidad: 4, estado: 'ocupada' },
  { id: 8, numero: 'Mesa 2', ubicacion: 'Salón Principal', capacidad: 4, estado: 'ocupada' },
  { id: 9, numero: 'Mesa 3', ubicacion: 'Salón Principal', capacidad: 4, estado: 'ocupada' },
  { id: 10, numero: 'Mesa 1', ubicacion: 'Salón Principal', capacidad: 4, estado: 'disponible' },
  { id: 11, numero: 'Mesa 2', ubicacion: 'Salón Principal', capacidad: 4, estado: 'disponible' },
  { id: 12, numero: 'Mesa 3', ubicacion: 'Salón Principal', capacidad: 4, estado: 'disponible' },
  { id: 13, numero: 'Mesa 1', ubicacion: 'Salón Principal', capacidad: 6, estado: 'disponible' },
  { id: 14, numero: 'Mesa 2', ubicacion: 'Salón Principal', capacidad: 6, estado: 'disponible' },
  { id: 15, numero: 'Mesa 3', ubicacion: 'Salón Principal', capacidad: 6, estado: 'disponible' },
  { id: 16, numero: 'Mesa 1', ubicacion: 'Salón VIP', capacidad: 8, estado: 'disponible' },
  { id: 17, numero: 'Mesa 2', ubicacion: 'Salón VIP', capacidad: 8, estado: 'disponible' },
  { id: 18, numero: 'Mesa 3', ubicacion: 'Salón VIP', capacidad: 8, estado: 'disponible' },
  { id: 19, numero: 'Mesa 1', ubicacion: 'Terraza', capacidad: 4, estado: 'ocupada' },
  { id: 20, numero: 'Mesa 2', ubicacion: 'Terraza', capacidad: 4, estado: 'disponible' },
];

// Renderizar las mesas
export const renderMesas = () => {
  const mesasGrid = document.getElementById('mesasGrid');
  
  if (!mesasGrid) return;
  
  mesasGrid.innerHTML = mesas.map(mesa => {
    const isDisponible = mesa.estado === 'disponible';
    const borderColor = isDisponible ? 'border-[#039855]' : 'border-[#F97066]';
    const iconBgColor = isDisponible ? 'bg-teal-50' : 'bg-red-50';
    const iconColor = isDisponible ? 'text-[#039855]' : 'text-red-400';
    const badgeBg = isDisponible ? 'bg-teal-50' : 'bg-red-50';
    const badgeText = isDisponible ? 'text-teal-600' : 'text-red-500';
    const buttonBg = isDisponible ? 'bg-[#039855] hover:bg-[#039855]' : 'bg-[#F97066] hover:bg-[#F97066]';
    const estadoTexto = isDisponible ? 'Disponible' : 'Ocupada';
    const buttonTexto = isDisponible ? 'Ocupar' : 'Disponible';
    const buttonIcon = isDisponible
  ? `<svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.98 8.8288L9.63677 12.172L8.01874 10.554M18.2077 10.5003C18.2077 14.7575 14.7565 18.2087 10.4993 18.2087C6.24215 18.2087 2.79102 14.7575 2.79102 10.5003C2.79102 6.24313 6.24215 2.79199 10.4993 2.79199C14.7565 2.79199 18.2077 6.24313 18.2077 10.5003Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>` 
  : `<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none">
<path d="M12 8.66992H12.0007" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12.0001 11.2148V15.4392M21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

    return `
      <div class="bg-white ${borderColor} border rounded-lg p-3 hover:shadow-sm transition-shadow">
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2.5">
            <div class="${iconBgColor} ${iconColor} p-6 rounded-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900">${mesa.numero}</h3>
              <h3 class="text-sm text-gray-500">Ubicacion: ${mesa.ubicacion}</h3>
              <h3 class="text-sm text-gray-500 mb-3">Capacidad: ${mesa.capacidad} personas</h3>
            </div>
          </div>
          <span class="${badgeBg} ${badgeText} text-xs font-medium px-2.5 py-0.5 rounded-full">
            ${estadoTexto}
          </span>
        </div>
        
        <!-- Botón para cambiar estado -->
        <button 
          onclick="cambiarEstadoMesa(${mesa.id})"
          class="cursor-pointer w-full ${buttonBg} text-white text-sm py-2 px-3 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5"
        >
          <span>${buttonTexto}</span>
          ${buttonIcon}
        </button>
      </div>
    `;
  }).join('');
};

// Cambiar estado de una mesa
window.cambiarEstadoMesa = (mesaId) => {
  const mesa = mesas.find(m => m.id === mesaId);
  if (mesa) {
    mesa.estado = mesa.estado === 'disponible' ? 'ocupada' : 'disponible';
    renderMesas();
  }
};

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  renderMesas();
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