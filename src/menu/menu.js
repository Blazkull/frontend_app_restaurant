import api from "../api/api.js";
import showAlert from "../components/alerts.js"; 

// ======================================================
// Variables globales
// ======================================================
const tableBody = document.getElementById("product-list");
const modal = document.getElementById("product-modal");
const modalContent = document.getElementById("product-modal-content");
const deleteModal = document.getElementById("delete-modal");
const deleteModalContent = document.getElementById("delete-modal-content");
const form = document.getElementById("product-form");
const btnCrear = document.getElementById("btn-crear-producto");
const btnCancelar = document.getElementById("btn-cancelar");
const btnDeleteCancelar = document.getElementById("btn-delete-cancelar");
const btnDeleteConfirmar = document.getElementById("btn-delete-confirmar");
const toggleDeletedBtn = document.getElementById("btn-toggle-deleted");

const modalTitle = document.getElementById("modal-title");
const submitBtn = document.getElementById("btn-submit");
const fileInput = document.getElementById("file-upload");
const imagePreview = document.getElementById("image-preview");
const selectCategoria = document.getElementById("categoria");

let currentEditId = null;
let showingDeleted = false;
let categories = []; //Guardará las categorías cargadas del backend

// ======================================================
// Cargar categorías dinámicamente
// ======================================================
async function loadCategories() {
  try {
    const response = await api.get("/categories");
    categories = response.data.data || [];

    selectCategoria.innerHTML = "";

    if (categories.length === 0) {
      selectCategoria.innerHTML = `<option value="">Sin categorías</option>`;
      return;
    }

    selectCategoria.innerHTML = `<option value="">Seleccionar categoría</option>`;
    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.name;
      selectCategoria.appendChild(option);
    });
  } catch (error) {
    console.error("❌ Error al cargar categorías:", error);
    selectCategoria.innerHTML = `<option value="">Error al cargar categorías</option>`;
  }
}

// ======================================================
// Cargar ítems del menú (activos)
// ======================================================
async function loadMenuItems() {
  try {
    // Si estamos viendo eliminados, no sobrescribir la lista
    if (showingDeleted) {
        await loadDeletedMenuItems();
        return;
    }
    
    const response = await api.get("/menu_items");
    const items = response.data.items || [];
    renderMenuTable(items, false);
  } catch (error) {
    console.error("Error al cargar los ítems del menú:", error);
    showAlert("error", "Error al cargar los ítems del menú. Intenta nuevamente.");
  }
}

// ======================================================
// Cargar ítems eliminados
// ======================================================
async function loadDeletedMenuItems() {
  try {
    const response = await api.get("/menu_items/deleted");
    const items = response.data.items || [];
    renderMenuTable(items, true);
  } catch (error) {
    console.error("Error al cargar los ítems eliminados:", error);
    showAlert("error", "Error al cargar los ítems eliminados. Intenta nuevamente.");
  }
}

// ======================================================
// Renderizar tabla de productos
// ======================================================
function renderMenuTable(items, isDeleted) {
  tableBody.innerHTML = "";

  if (items.length === 0) {
    tableBody.innerHTML = `
        <tr>
            <td colspan="9" class="text-center py-4 text-gray-500">
                ${isDeleted ? "No hay productos eliminados." : "No hay ítems disponibles en el menú."}
            </td>
        </tr>`;
    return;
  }

  items.forEach((item) => {
    const categoryName =
      categories.find((cat) => cat.id === item.id_category)?.name || "Sin categoría";

    const row = document.createElement("tr");
    row.innerHTML = `
        <td class="px-3 py-2"><input type="checkbox" class="rounded text-indigo-600"></td>
        <td class="px-3 py-2">
            <img src="${
              item.image_url && item.image_url !== "string"
                ? item.image_url
                : "https://via.placeholder.com/80"
            }" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover">
        </td>
        <td class="px-3 py-2 font-medium text-gray-800">${item.name}</td>
        <td class="px-3 py-2">${categoryName}</td>
        <td class="px-3 py-2">${item.estimated_time || "N/A"}</td>
        <td class="px-3 py-2">$${Number(item.price || 0).toLocaleString()}</td>
        <td class="px-3 py-2">
            <span class="px-2 py-1 rounded-full text-xs font-semibold ${
              item.id_status === 1
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }">
                ${item.id_status === 1 ? "Disponible" : "Inactivo"}
            </span>
        </td>
        <td class="px-3 py-2">${new Date(item.created_at).toLocaleDateString()}</td>
        <td class="px-3 py-2 space-x-2">
            ${
              isDeleted
                ? `
                    <button class="text-green-600 hover:text-green-800 restore-btn" data-id="${item.id}">
                        <i data-lucide="rotate-ccw" class="w-5 h-5"></i>
                    </button>`
                : `
                    <button class="text-indigo-600 hover:text-indigo-800 edit-btn" data-id="${item.id}">
                        <i data-lucide="edit-3" class="w-5 h-5"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800 delete-btn" data-id="${item.id}">
                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                    </button>`
            }
        </td>
    `;
    tableBody.appendChild(row);
  });

  // @ts-ignore
  lucide.createIcons();
  if (isDeleted) attachRestoreListeners();
  else attachEventListeners();
}

// ======================================================
// Alternar entre activos / eliminados
// ======================================================
toggleDeletedBtn.addEventListener("click", async () => {
  showingDeleted = !showingDeleted;
  toggleDeletedBtn.textContent = showingDeleted ? "Ver activos" : "Ver eliminados";
  if (showingDeleted) await loadDeletedMenuItems();
  else await loadMenuItems();
});

// ======================================================
// Crear o actualizar ítem (Estrategia Dual)
// ======================================================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 1. Obtener y preparar datos
  const nombre = document.getElementById("nombre").value.trim();
  const tiempo = parseInt(document.getElementById("tiempo").value) || 0;
  const precio = parseFloat(document.getElementById("precio").value) || 0; 
  const estado = document.getElementById("estado").value === "Disponible" ? 1 : 2;
  const categoria = parseInt(document.getElementById("categoria").value); 
  const imagen = document.getElementById("file-upload").files[0];

  // 2. VALIDACIÓN (UX)
  if (!nombre) {
      showAlert("error", "El nombre del producto es obligatorio.");
      return;
  }
  if (isNaN(categoria) || categoria === 0) { 
      showAlert("error", "Debes seleccionar una categoría válida.");
      return;
  }
  
  // 3. Objeto de datos (como JSON)
  const data = {
      name: nombre,
      id_category: categoria,
      ingredients: "", // Requerido por el servidor
      estimated_time: tiempo,
      price: precio,
      id_status: estado,
  };

  try {
    let response;
    
    // ESTRATEGIA DUAL: Si NO hay imagen, usamos JSON simple.
    if (!imagen) {
        if (currentEditId) {
            // PATCH con JSON
            response = await api.patch(`/menu_items/${currentEditId}`, data);
        } else {
            // POST con JSON
            response = await api.post("/menu_items", data);
        }
    } else {
        // ESTRATEGIA DUAL: Si HAY imagen, usamos FormData.
        const formData = new FormData();
        
        // Convertimos a String para FormData, asegurando formato de número
        formData.append("name", data.name);
        formData.append("id_category", data.id_category.toString());
        formData.append("ingredients", data.ingredients);
        formData.append("estimated_time", data.estimated_time.toString());
        
        // CLAVE: Enviar el precio con el formato correcto (ej: "200.0")
        formData.append("price", data.price.toFixed(1)); 
        
        formData.append("id_status", data.id_status.toString());
        formData.append("image", imagen);

        if (currentEditId) {
            // PATCH con FormData
            response = await api.patch(`/menu_items/${currentEditId}`, formData);
        } else {
            // POST con FormData
            response = await api.post("/menu_items", formData);
        }
    }

    // 4. Manejo de la respuesta
    const successMsg = currentEditId ? "Producto actualizado correctamente" : "Producto creado correctamente";
    showAlert("success", successMsg);

    // Limpieza y cierre
    modal.classList.add("hidden");
    form.reset();
    if (imagePreview) imagePreview.src = "https://via.placeholder.com/80";
    currentEditId = null;
    loadMenuItems();
  } catch (error) {
    console.error("Error al guardar producto:", error);
    if (error.response && error.response.status === 422) {
         // Mostrar el campo faltante o inválido para un mejor debug
         const field = error.response.data.detail[0]?.loc[1];
         const msg = field ? `Error de validación en el campo: ${field}` : 'Campos requeridos faltantes o inválidos.';
         showAlert("error", `Error (422): ${msg}`);
    } else {
         showAlert("error", "Error al guardar el producto. Intenta nuevamente.");
    }
  }
});

// ======================================================
// Editar producto
// ======================================================
function attachEventListeners() {
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      try {
        const response = await api.get(`/menu_items/${id}`);
        const item = response.data;

        currentEditId = item.id;
        document.getElementById("nombre").value = item.name || "";
        document.getElementById("tiempo").value = item.estimated_time || "";
        document.getElementById("precio").value = item.price || "";
        document.getElementById("estado").value =
          item.id_status === 1 ? "Disponible" : "Desactivado";

        await loadCategories();
        selectCategoria.value = item.id_category || "";

        if (imagePreview) {
          imagePreview.src =
            item.image_url && item.image_url !== "string"
              ? item.image_url
              : "https://via.placeholder.com/80";
        }

        modalTitle.textContent = "Editar producto";
        submitBtn.textContent = "Actualizar";
        openModal(modal, modalContent);
      } catch (error) {
        console.error("Error al cargar producto:", error);
        showAlert("error", "Error al cargar los datos del producto.");
      }
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      // @ts-ignore
      document.getElementById("delete-product-id").value = id;
      openModal(deleteModal, deleteModalContent);
    });
  });
}

// ======================================================
// Restaurar producto eliminado
// ======================================================
function attachRestoreListeners() {
  document.querySelectorAll(".restore-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      // @ts-ignore
      const confirm = await Swal.fire({
        title: "¿Restaurar producto?",
        text: "El producto volverá a estar disponible.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#16a34a",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, restaurar",
        cancelButtonText: "Cancelar",
      });

      if (confirm.isConfirmed) {
        try {
          await api.patch(`/menu_items/${id}/restore`);
          showAlert("success", "Producto restaurado correctamente");
          loadDeletedMenuItems();
        } catch (error) {
          console.error("Error al restaurar producto:", error);
          showAlert("error", "Error al restaurar el producto.");
        }
      }
    });
  });
}

// ======================================================
// Eliminar producto
// ======================================================
btnDeleteConfirmar.addEventListener("click", async () => {
  // @ts-ignore
  const id = document.getElementById("delete-product-id").value;
  try {
    await api.delete(`/menu_items/${id}`);
    showAlert("success", "Producto eliminado correctamente");
    closeModal(deleteModal, deleteModalContent);
    loadMenuItems();
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    showAlert("error", "Error al eliminar el producto.");
  }
});

// ======================================================
// Vista previa de imagen
// ======================================================
if (fileInput) {
  fileInput.addEventListener("change", (e) => {
    // @ts-ignore
    const file = e.target.files[0];
    if (file && imagePreview) {
      const reader = new FileReader();
      // @ts-ignore
      reader.onload = (event) => (imagePreview.src = event.target.result);
      reader.readAsDataURL(file);
    }
  });
}

// ======================================================
// Buscar productos
// ======================================================
document.getElementById("input-search").addEventListener("input", (e) => {
  // @ts-ignore
  const query = e.target.value.toLowerCase();
  document.querySelectorAll("#product-list tr").forEach((row) => {
    const name = row.querySelector("td:nth-child(3)")?.textContent.toLowerCase() || "";
    // @ts-ignore
    row.style.display = name.includes(query) ? "" : "none";
  });
});

// ======================================================
// Control de modales
// ======================================================
btnCrear.addEventListener("click", async () => {
  form.reset();
  currentEditId = null;
  if (imagePreview) imagePreview.src = "https://via.placeholder.com/80";

  await loadCategories();

  modalTitle.textContent = "Crear producto";
  submitBtn.textContent = "Crear";

  openModal(modal, modalContent);
});

btnCancelar.addEventListener("click", () => {
    form.reset(); 
    if (imagePreview) imagePreview.src = "https://via.placeholder.com/80"; 
    closeModal(modal, modalContent)
});

btnDeleteCancelar.addEventListener("click", () => closeModal(deleteModal, deleteModalContent));

function openModal(modal, content) {
  modal.classList.remove("hidden");
  setTimeout(() => {
    content.classList.add("scale-100", "opacity-100");
    content.classList.remove("scale-95", "opacity-0");
  }, 50);
}

function closeModal(modal, content) {
  content.classList.remove("scale-100", "opacity-100");
  content.classList.add("scale-95", "opacity-0");
  setTimeout(() => modal.classList.add("hidden"), 200);
}

// ======================================================
// Inicialización
// ======================================================
document.addEventListener("DOMContentLoaded", async () => {
  await loadCategories();
  await loadMenuItems();
});