import api from "../api/api.js";
import showAlert from "../components/alerts.js";

let clients = [];
let currentPage = 1;
let showingDeleted = false;

// =============================
// Cargar clientes activos o eliminados
// =============================
async function fetchClients(page = 1) {
  try {
    const endpoint = showingDeleted
      ? `/clients`
      : `/clients/?page=${page}`;

    const response = await api.get(endpoint);

    clients = response.data.data || [];

    renderTable();
    updateToggleButton();
  } catch (error) {
    console.error("Error al cargar clientes:", error);
    showAlert({
      title: "Error al cargar",
      message: "No se pudieron cargar los clientes. Asegúrate de estar autenticado.",
      type: "error",
    });
  }
}


// =============================
// Crear nuevo cliente
// =============================
async function createClient(data) {
  try {
    await api.post("/clients/", data);
    showAlert({
      title: "Cliente creado",
      message: "El cliente se ha creado correctamente.",
      type: "success",
    });
    closeCreateModal();
    fetchClients();
  } catch (error) {
    console.error("Error al crear cliente:", error);
    showAlert({
      title: "Error",
      message: "No se pudo crear el cliente.",
      type: "error",
    });
  }
}

// =============================
// Eliminar cliente
// =============================
async function deleteClient(id) {
  showAlert({
    title: "¿Eliminar cliente?",
    message: "Esta acción eliminará al cliente de forma permanente. ¿Deseas continuar?",
    type: "confirm",
    async onConfirm() {
      try {
        await api.delete(`/clients/${id}`);
        showAlert({
          title: "Cliente eliminado",
          message: "El Cliente fue eliminado correctamente.",
          type: "sucess",
        });
        fetchUsers(currentPage);
      } catch (error) {
        console.error("Error al eliminar cliente:", error);
        showAlert({
          title: "Error",
          message: "No se pudo eliminar el cliente.",
          type: "error",
        });
      }
    },
  });
}

// =============================
// Restaurar cliente eliminado
// =============================
async function restoreClient(id) {
  try {
    await api.patch(`/clients/${id}/restore`);
    showAlert({
      title: "Cliente restaurado",
      message: "El cliente se ha restaurado correctamente.",
      type: "success",
    });
    fetchClients();
  } catch (error) {
    console.error("Error al restaurar cliente:", error);
    showAlert({
      title: "Error",
      message: "No se pudo restaurar el cliente.",
      type: "error",
    });
  }
}

// =============================
// Actualizar cliente
// =============================
async function updateClient(id, data) {
  try {
    await api.put(`/clients/${id}`, data);
    showAlert({
      title: "Cliente actualizado",
      message: "El cliente se ha actualizado correctamente.",
      type: "success",
    });
    closeEditModal();
    fetchClients(currentPage);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    showAlert({
      title: "Error",
      message: "No se pudo actualizar el cliente.",
      type: "error",
    });
  }
}

// =============================
// Renderizar tabla de clientes
// =============================
function renderTable() {
  const tbody = document.getElementById("clientes-table-body");
  tbody.innerHTML = "";

  if (!clients || clients.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-gray-500 py-4">
                    ${showingDeleted ? "No hay clientes eliminados" : "No hay clientes activos"}
                </td>
            </tr>`;
    return;
  }

  clients.forEach((c) => {
    const row = `
            <tr class="border-b">
                <td class="p-3">${c.fullname || "—"}</td>
                <td class="p-3">${c.address || "—"}</td>
                <td class="p-3">${c.email || "—"}</td>
                <td class="p-3">${c.identification_number || "—"}</td>
                <td class="p-3">${c.phone_number || "—"}</td>
                <td class="p-3">${c.updated_at ? new Date(c.updated_at).toLocaleDateString() : "—"}</td>
                <td class="p-3 flex justify-center space-x-2">
                    ${!showingDeleted
        ? `<button onclick="editClientModalHandler(${c.id})" class="text-blue-600 hover:text-blue-800" title="Editar">
                            <img src="../svg/edit_blue.svg" alt="editar" class="w-5 h-5">
                          </button>`
        : ''}
                    ${showingDeleted
        ? `<button onclick="restoreClient(${c.id})" class="text-green-600 hover:text-green-800" title="Restaurar">
                            <img src="../svg/update_blue.svg" alt="restaurar" class="w-5 h-5">
                          </button>`
        : `<button onclick="deleteClient(${c.id})" class="text-red-600 hover:text-red-800" title="Eliminar">
                            <img src="../svg/delete_red.svg" alt="eliminar" class="w-5 h-5">
                          </button>`}
                </td>
            </tr>
        `;
    tbody.innerHTML += row;
  });
}

// =============================
// Modal crear cliente
// =============================
function openCreateModal() {
  const modal = document.getElementById("createClientModal");
  modal.classList.remove("hidden");

  void modal.offsetWidth;

  setTimeout(() => {
    modal.classList.remove("opacity-0");
    const contentDiv = modal.querySelector('div.bg-white');
    if (contentDiv) {
      contentDiv.classList.remove("scale-95");
    }
  }, 10);
}

function closeCreateModal() {
  const modal = document.getElementById("createClientModal");
  modal.classList.add("opacity-0");
  const contentDiv = modal.querySelector('div.bg-white');
  if (contentDiv) {
    contentDiv.classList.add("scale-95");
  }

  setTimeout(() => {
    modal.classList.add("hidden");
    document.getElementById("createClientForm").reset();
  }, 300);
}


// =============================
// Lógica y Modales de Edición
// =============================

async function editClientModalHandler(id) {
  try {
    const response = await api.get(`/clients/${id}`);
    const client = response.data.data;

    document.getElementById("edit_id").value = client.id;
    document.getElementById("edit_fullname").value = client.fullname || '';
    document.getElementById("edit_address").value = client.address || '';
    document.getElementById("edit_phone_number").value = client.phone_number || '';
    document.getElementById("edit_identification_number").value = client.identification_number || '';
    document.getElementById("edit_email").value = client.email || '';
    document.getElementById("edit_id_type_identificacion").value = client.id_type_identificacion;

    openEditModal();

  } catch (error) {
    console.error("Error al cargar datos del cliente para edición:", error);
    showAlert({
      title: "Error",
      message: "No se pudo cargar la información del cliente para edición.",
      type: "error",
    });
  }
}

// Función para abrir el modal de edición
function openEditModal() {
  const modal = document.getElementById("editClientModal");
  modal.classList.remove("hidden");
  void modal.offsetWidth;
  setTimeout(() => {
    modal.classList.remove("opacity-0");
    const contentDiv = modal.querySelector('div.bg-white');
    if (contentDiv) {
      contentDiv.classList.remove("scale-95");
    }
  }, 10);
}

// Función para cerrar el modal de edición
function closeEditModal() {
  const modal = document.getElementById("editClientModal");
  modal.classList.add("opacity-0");
  const contentDiv = modal.querySelector('div.bg-white');
  if (contentDiv) {
    contentDiv.classList.add("scale-95");
  }

  setTimeout(() => {
    modal.classList.add("hidden");
    document.getElementById("editClientForm").reset();
  }, 300);
}


// =============================
// Toggle mostrar eliminados
// =============================
const toggleDeletedBtn = document.getElementById("toggleDeletedBtn");
toggleDeletedBtn.addEventListener("click", () => {
  showingDeleted = !showingDeleted;
  fetchClients();
});

function updateToggleButton() {
  toggleDeletedBtn.innerText = showingDeleted ? "Mostrar activos" : "Mostrar eliminados";
}

// =============================
// Crear cliente desde modal
// =============================
document.getElementById("crear-cliente-btn").addEventListener("click", openCreateModal);
document.getElementById("createClientForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    fullname: document.getElementById("fullname").value,
    address: document.getElementById("address").value,
    phone_number: document.getElementById("phone_number").value,
    identification_number: document.getElementById("identification_number").value,
    email: document.getElementById("email").value,
    id_type_identificacion: Number(document.getElementById("id_type_identificacion").value),
  };
  await createClient(data);
});

// =============================
// Editar cliente desde modal
// =============================
document.getElementById("editClientForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("edit_id").value;

  const data = {
    fullname: document.getElementById("edit_fullname").value,
    address: document.getElementById("edit_address").value,
    phone_number: document.getElementById("edit_phone_number").value,
    identification_number: document.getElementById("edit_identification_number").value,
    email: document.getElementById("edit_email").value,
    id_type_identificacion: Number(document.getElementById("edit_id_type_identificacion").value),
  };

  await updateClient(id, data);
});


// =============================
// Inicializar y Globalizar
// =============================
document.addEventListener("DOMContentLoaded", () => {
  fetchClients();
});

window.deleteClient = deleteClient;
window.restoreClient = restoreClient;
window.openCreateModal = openCreateModal;
window.closeCreateModal = closeCreateModal;
window.editClientModalHandler = editClientModalHandler;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
