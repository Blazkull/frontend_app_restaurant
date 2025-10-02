// Pedidos de prueba embebidos en el JS
const pedidosDemo = [
    { "id": 1, "mesa": 3, "hora": "10:30", "items": ["Pizza Margherita", "Pasta Carbonara"], "estado": "pendiente" },
    { "id": 7, "mesa": 3, "hora": "11:20", "items": ["Pizza Margherita", "Pasta Carbonara"], "estado": "pendiente" },
    { "id": 8, "mesa": 4, "hora": "11:25", "items": ["Risotto", "Ensalada César"], "estado": "pendiente" },
    { "id": 10, "mesa": 3, "hora": "11:35", "items": ["Pizza Margherita", "Pasta Carbonara"], "estado": "pendiente" },
    { "id": 11, "mesa": 3, "hora": "11:40", "items": ["Pizza Margherita", "Pasta Carbonara"], "estado": "pendiente" },
    { "id": 12, "mesa": 3, "hora": "11:45", "items": ["Pizza Margherita", "Pasta Carbonara"], "estado": "pendiente" },
    
    { "id": 2, "mesa": 5, "hora": "10:45", "items": ["Lasaña"], "estado": "en_preparacion" },
    { "id": 5, "mesa": 6, "hora": "11:10", "items": ["Spaghetti Bolognese"], "estado": "en_preparacion" },
    { "id": 9, "mesa": 6, "hora": "11:30", "items": ["Spaghetti Bolognese"], "estado": "en_preparacion" },

    { "id": 3, "mesa": 2, "hora": "10:50", "items": ["Pizza Pepperoni"], "estado": "listo" },
    { "id": 6, "mesa": 7, "hora": "11:15", "items": ["Pizza Cuatro Quesos"], "estado": "listo" },
    { "id": 13, "mesa": 2, "hora": "12:00", "items": ["Pizza Pepperoni"], "estado": "listo" },
];

function renderPedidos(data) {
  console.log("Pedidos recibidos:", data);

  const pendientes = document.getElementById("pendientes");
  const preparacion = document.getElementById("preparacion");
  const listos = document.getElementById("listos");

  pendientes.innerHTML = "";
  preparacion.innerHTML = "";
  listos.innerHTML = "";

  if (!data || data.length === 0) {
    pendientes.innerHTML = `<p class="text-gray-500 italic">No hay pedidos</p>`;
    preparacion.innerHTML = `<p class="text-gray-500 italic">No hay pedidos</p>`;
    listos.innerHTML = `<p class="text-gray-500 italic">No hay pedidos</p>`;
    return;
  }

  data.forEach(pedido => {
    let botonTexto = "";
    let nuevoEstado = null;
    if (pedido.estado === "pendiente") {
      botonTexto = "Iniciar Preparación";
      nuevoEstado = "en_preparacion";
    } else if (pedido.estado === "en_preparacion") {
      botonTexto = "Marcar Listo";
      nuevoEstado = "listo";
    } else if (pedido.estado === "listo") {
      botonTexto = "Notificar";
      nuevoEstado = "entregado";
    }

    const card = document.createElement("div");
    card.className = "p-4 border rounded-xl shadow-sm bg-white";

card.innerHTML = `
  <p class="font-bold">Pedido #${pedido.id}</p>
  <p class="text-sm text-gray-500">Mesa ${pedido.mesa} - ${pedido.hora}</p>
  <ul class="mt-2 text-gray-700 text-sm">
    ${pedido.items.map(item => `<li>• ${item}</li>`).join("")}
  </ul>
  ${
    botonTexto
      ? `<button data-id="${pedido.id}" data-estado="${nuevoEstado}" 
          class="mt-3 w-full flex items-center justify-between py-2 px-3 rounded-xl text-white font-medium ${
            pedido.estado === "pendiente"
              ? "bg-orange-500 hover:bg-orange-600"
              : pedido.estado === "en_preparacion"
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-green-500 hover:bg-green-600"
          }">
          <span>${botonTexto}</span>
          <i data-lucide="${
            pedido.estado === "pendiente"
              ? "play"
              : pedido.estado === "en_preparacion"
              ? "check-circle"
              : "bell"
          }"></i>
         </button>`
      : ""
  }
`;


    if (pedido.estado === "pendiente") {
      pendientes.appendChild(card);
    } else if (pedido.estado === "en_preparacion") {
      preparacion.appendChild(card);
    } else if (pedido.estado === "listo") {
      listos.appendChild(card);
    }

   

    const btn = card.querySelector("button");
    if (btn) {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const estado = btn.dataset.estado;
        alert(`(Demo) Pedido ${id} cambiado a estado "${estado}"`);
      });
    }

     lucide.createIcons();
  });
}

// Render inicial con datos embebidos
renderPedidos(pedidosDemo);
