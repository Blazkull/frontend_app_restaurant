import api from "../api/api.js";
import showAlert from "../components/alerts.js";

let users = [];
let roles = []; 
let currentPage = 1;
let showingDeleted = false;
const rowsPerPage = 10;

// =============================
//Cargar roles del backend
// =============================
async function fetchRoles() {
  try {
    const response = await api.get("/roles");
    roles = response.data || [];
  } catch (error) {
    console.error("Error al cargar roles:", error);
    showAlert({
      title: "Error",
      message: "No se pudieron cargar los roles.",
      type: "error",
    });
  }
}

// =============================
// Cargar usuarios activos o eliminados
// =============================
async function fetchUsers(page = 1) {
  try {
    const endpoint = showingDeleted ? "/users/deleted" : `/users/?page=${page}`;
    const response = await api.get(endpoint);
    users = response.data.items || response.data;
    renderTable();
    updateToggleButton();
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
    showAlert({
      title: "Error al cargar",
      message: "No se pudieron cargar los usuarios.",
      type: "error",
    });
  }
}

// =============================
// Crear nuevo usuario
// =============================
async function createUser(data) {
  try {
    await api.post(`/users/`, data);
    showAlert({
      title: "Usuario creado",
      message: "El usuario se ha creado correctamente.",
      type: "success",
    });
    closeCreateModal();
    fetchUsers();
  } catch (error) {
    console.error("Error al crear usuario:", error);
    showAlert({
      title: "Error",
      message: "No se pudo crear el usuario.",
      type: "error",
    });
  }
}

// =============================
// MODAL DE EDICIÓN DE USUARIO
// =============================
let selectedEditUserId = null;

function openEditModal(id) {
  const numericId = Number(id);
  const user = users.find((u) => u.id === numericId);

  if (!user) {
    return showAlert({
      title: "Usuario no encontrado",
      message: "No se pudo localizar el usuario.",
      type: "error",
    });
  }

  // Rellenar campos del modal
  document.getElementById("edit_name").value = user.name || "";
  document.getElementById("edit_email").value = user.email || "";
  document.getElementById("edit_role").value = user.id_role || "";

  selectedEditUserId = numericId;

  // Mostrar modal
  const modal = document.getElementById("editUserModal");
  modal.classList.remove("invisible", "opacity-0");
  const modalBox = modal.querySelector("div");
  setTimeout(() => modalBox.classList.remove("scale-95"), 10);
}

function closeEditModal() {
  const modal = document.getElementById("editUserModal");
  const modalBox = modal.querySelector("div");
  modalBox.classList.add("scale-95");
  setTimeout(() => {
    modal.classList.add("invisible", "opacity-0");
    document.getElementById("editUserForm").reset();
    selectedEditUserId = null;
  }, 200);
}

// Guardar cambios
async function saveEditUser(event) {
  event.preventDefault();
  const name = document.getElementById("edit_name").value.trim();
  const email = document.getElementById("edit_email").value.trim();
  const id_role = Number(document.getElementById("edit_role").value);

  if (!name || !email || !id_role) {
    showAlert({
      title: "Campos incompletos",
      message: "Por favor, completa todos los campos antes de guardar.",
      type: "info",
    });
    return;
  }

  try {
    await api.patch(`/users/${selectedEditUserId}`, { name, email, id_role });
    showAlert({
      title: "Usuario actualizado",
      message: "Los datos se han actualizado correctamente.",
      type: "success",
    });
    closeEditModal();
    fetchUsers(currentPage);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    showAlert({
      title: "Error",
      message: "No se pudo actualizar el usuario.",
      type: "error",
    });
  }
}

// Eventos
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("cancelEditUser").addEventListener("click", closeEditModal);
  document.getElementById("editUserForm").addEventListener("submit", saveEditUser);
});

// Exponer global
window.openEditModal = openEditModal;


// =============================
// Editar usuario
// =============================
async function editUser(id) {
  const numericId = Number(id);
  const user = users.find((u) => u.id === numericId);
  if (!user)
    return showAlert({
      title: "Usuario no encontrado",
      message: "No se pudo localizar el usuario.",
      type: "error",
    });

  const nuevoNombre = prompt("Nuevo nombre completo:", user.name);
  if (nuevoNombre === null) return;

  const nuevoEmail = prompt("Nuevo correo electrónico:", user.email);
  if (nuevoEmail === null) return;

  const nuevoRol = confirm("¿Deseas que sea administrador? (Aceptar = Sí)") ? 1 : 2;

  try {
    await api.patch(`/users/${numericId}`, {
      name: nuevoNombre,
      email: nuevoEmail,
      id_role: nuevoRol,
    });
    showAlert({
      title: "Usuario actualizado",
      message: "Los datos se actualizaron correctamente.",
      type: "success",
    });
    fetchUsers(currentPage);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    showAlert({
      title: "Error",
      message: "No se pudo actualizar el usuario.",
      type: "error",
    });
  }
}


// =============================
// Modal de contraseña
// =============================
let selectedUserId = null;

function openPasswordModal(id) {
  selectedUserId = id;
  const modal = document.getElementById("updatePasswordModal");
  modal.classList.remove("invisible", "opacity-0");
  const modalBox = modal.querySelector("div");
  setTimeout(() => modalBox.classList.remove("scale-95"), 10);
}

function closePasswordModal() {
  const modal = document.getElementById("updatePasswordModal");
  const modalBox = modal.querySelector("div");
  modalBox.classList.add("scale-95");
  setTimeout(() => {
    modal.classList.add("invisible", "opacity-0");
    document.getElementById("updatePasswordForm").reset();
  }, 200);
}

async function savePassword() {
  const newPassword = document.getElementById("newPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (!newPassword || !confirmPassword) {
    showAlert({
      title: "Campos incompletos",
      message: "Por favor, completa todos los campos.",
      type: "info",
    });
    return;
  }

  if (newPassword !== confirmPassword) {
    showAlert({
      title: "Error de validación",
      message: "Las contraseñas no coinciden.",
      type: "error",
    });
    return;
  }

  try {
    await api.patch(`/users/${selectedUserId}/password`, { password: newPassword });
    showAlert({
      title: "Contraseña actualizada",
      message: "La contraseña se actualizó correctamente.",
      type: "success",
    });
    closePasswordModal();
  } catch (error) {
    console.error("Error al actualizar contraseña:", error);
    showAlert({
      title: "Error",
      message: "No se pudo actualizar la contraseña.",
      type: "error",
    });
  }
}

// =============================
// Eliminar usuario
// =============================
async function deleteUser(id) {
  showAlert({
    title: "¿Eliminar usuario?",
    message: "Esta acción eliminará al usuario de forma permanente. ¿Deseas continuar?",
    type: "confirm",
    async onConfirm() {
      try {
        await api.delete(`/users/${id}`);
        showAlert({
          title: "Usuario eliminado",
          message: "El usuario fue eliminado correctamente.",
          type: "success",
        });
        fetchUsers(currentPage);
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        showAlert({
          title: "Error",
          message: "No se pudo eliminar el usuario.",
          type: "error",
        });
      }
    },
  });
}

// =============================
// Restaurar usuario eliminado
// =============================
async function restoreUser(id) {
  try {
    await api.patch(`/users/${id}/restore`);
    showAlert({
      title: "Usuario restaurado",
      message: "El usuario se ha restaurado correctamente.",
      type: "success",
    });
    fetchUsers();
  } catch (error) {
    console.error("Error al restaurar usuario:", error);
    showAlert({
      title: "Error",
      message: "No se pudo restaurar el usuario.",
      type: "error",
    });
  }
}

// =============================
// Renderizar tabla
// =============================
function renderTable() {
  const tbody = document.getElementById("userTableBody");
  tbody.innerHTML = "";

  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-gray-500 py-4">
          ${showingDeleted ? "No hay usuarios eliminados" : "No hay usuarios activos"}
        </td>
      </tr>`;
    return;
  }

  users.forEach((u) => {
    const estadoActivo = u.id_status === 1;
    const estadoClass = estadoActivo
      ? "text-green-600 bg-green-100 px-2 py-1 rounded-md text-xs"
      : "text-red-600 bg-red-100 px-2 py-1 rounded-md text-xs";

    //Buscar nombre de rol real
    const rol = roles.find(r => r.id === u.id_role);
    const rolNombre = rol ? rol.name : "Desconocido";

    const row = `
      <tr class="border-b">
        <td class="p-3"><input type="checkbox"></td>
        <td class="p-3">${u.name || "—"}</td>
        <td class="p-3">${u.email || "—"}</td>
        <td class="p-3">${rolNombre}</td>
        <td class="p-3"><span class="${estadoClass}">${estadoActivo ? "Activo" : "Inactivo"}</span></td>
        <td class="p-3">${u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
        <td class="p-3">${u.last_connection ? new Date(u.last_connection).toLocaleDateString() : "—"}</td>
        <td class="p-3 flex space-x-2">
          ${showingDeleted
        ? `<button onclick="restoreUser('${u.id}')" class="text-green-600 hover:text-green-800">
                  <img src="../svg/update_blue.svg" alt="restaurar" class="w-5 h-5">
            </button>`
        : `
          <button onclick="openEditModal(${u.id})" class="text-blue-600 hover:text-blue-800">
            <img src="../svg/edit_blue.svg" alt="editar" class="w-5 h-5">
          </button>
          <button onclick="openPasswordModal('${u.id}')" class="text-yellow-600 hover:text-yellow-800">
            <img src="../svg/lock.svg" alt="contraseña" class="w-5 h-5">
          </button>
          <button onclick="deleteUser('${u.id}')" class="text-red-600 hover:text-red-800">
            <img src="../svg/delete_red.svg" alt="eliminar" class="w-5 h-5">
          </button>
          `
      }
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// =============================
// Mostrar usuarios eliminados o activos
// =============================
const toggleDeletedBtn = document.createElement("button");
toggleDeletedBtn.id = "toggleDeletedBtn";
toggleDeletedBtn.className =
  "flex items-center gap-3 p-2 border px-4 py-2 rounded-md text-sm hover:bg-gray-100";
toggleDeletedBtn.innerHTML = `
  <img src="../svg/recycle.svg" alt="toggle" class="w-5 h-5">
  Mostrar eliminados
`;
document.addEventListener("DOMContentLoaded", () => {
  const buttonsContainer = document.querySelector(".flex.space-x-2");
  buttonsContainer.appendChild(toggleDeletedBtn);
});

toggleDeletedBtn.addEventListener("click", () => {
  showingDeleted = !showingDeleted;
  fetchUsers();
});

function updateToggleButton() {
  toggleDeletedBtn.innerHTML = showingDeleted
    ? `<img src="../svg/clients.svg" class="w-5 h-5"> Mostrar activos`
    : `<img src="../svg/delete_red.svg" class="w-5 h-5"> Mostrar eliminados`;
}

// =============================
//Rellenar selects con roles
// =============================
function populateRoleSelects() {
  const createRoleSelect = document.querySelector("#createUserModal select");
  const editRoleSelect = document.querySelector("#edit_role");

  if (createRoleSelect) {
    createRoleSelect.innerHTML = roles
      .map(r => `<option value="${r.id}">${r.name}</option>`)
      .join("");
  }

  if (editRoleSelect) {
    editRoleSelect.innerHTML = roles
      .map(r => `<option value="${r.id}">${r.name}</option>`)
      .join("");
  }
}

// =============================
// MODAL DE CREACIÓN DE USUARIO
// =============================
function openCreateModal() {
  const modal = document.getElementById("createUserModal");
  modal.classList.remove("invisible", "opacity-0");
  const modalBox = modal.querySelector("div");
  setTimeout(() => modalBox.classList.remove("scale-95"), 10);
}

function closeCreateModal() {
  const modal = document.getElementById("createUserModal");
  const modalBox = modal.querySelector("div");
  modalBox.classList.add("scale-95");
  setTimeout(() => {
    modal.classList.add("invisible", "opacity-0");
  }, 200);
}

// =============================
// Inicializar eventos
// =============================
document.addEventListener("DOMContentLoaded", async () => {
  await fetchRoles(); // cargar roles
  populateRoleSelects(); //llenar selects
  await fetchUsers();

  // Modal creación
  document.getElementById("openCreateUserModal").addEventListener("click", openCreateModal);
  document.getElementById("cancelCreateUser").addEventListener("click", closeCreateModal);

  // Interceptar creación de usuario
  const createBtn = document.querySelector("#createUserModal button.bg-gradient-to-r");
  const inputs = document.querySelectorAll("#createUserModal input, #createUserModal select");

  createBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const [name, username, email, password, confirmPassword] = Array.from(inputs).map(
      (i) => i.value.trim()
    );
    const roleSelect = inputs[inputs.length - 1].value;

    if (!name || !username || !email || !password) {
      showAlert({
        title: "Campos incompletos",
        message: "Por favor, completa todos los campos.",
        type: "info",
      });
      return;
    }

    if (password !== confirmPassword) {
      showAlert({
        title: "Contraseña inválida",
        message: "Las contraseñas no coinciden.",
        type: "error",
      });
      return;
    }

    // usar id_role real
    const data = {
      name,
      username,
      email,
      password,
      id_role: Number(roleSelect),
      id_status: 1,
    };

    console.log("Datos enviados al backend:", data);
    await createUser(data);
  });

  // Modal contraseña
  document.getElementById("cancelUpdatePassword").addEventListener("click", closePasswordModal);
  document.getElementById("savePasswordBtn").addEventListener("click", savePassword);
});

// =============================
// BÚSQUEDA Y FILTRO
// =============================

// Elementos de la interfaz
const searchInput = document.getElementById("searchInput");
const filterBtn = document.getElementById("filterBtn");

let searchTerm = "";
let filterRole = "todos";
let filterStatus = "todos";

function applyFilters() {
  let filtered = [...users];

  if (searchTerm) {
    filtered = filtered.filter((u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (filterRole !== "todos") {
    const roleId = roles.find(r => r.name === filterRole)?.id;
    if (roleId) filtered = filtered.filter((u) => u.id_role === roleId);
  }

  if (filterStatus !== "todos") {
    const statusId = filterStatus === "Activo" ? 1 : 2;
    filtered = filtered.filter((u) => u.id_status === statusId);
  }

  renderFilteredTable(filtered);
}

function renderFilteredTable(filtered) {
  const tbody = document.getElementById("userTableBody");
  tbody.innerHTML = "";

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-gray-500 py-4">
          No se encontraron usuarios con los filtros seleccionados.
        </td>
      </tr>`;
    return;
  }

  filtered.forEach((u) => {
    const estadoActivo = u.id_status === 1;
    const estadoClass = estadoActivo
      ? "text-green-600 bg-green-100 px-2 py-1 rounded-md text-xs"
      : "text-red-600 bg-red-100 px-2 py-1 rounded-md text-xs";

    const rol = roles.find(r => r.id === u.id_role);
    const rolNombre = rol ? rol.name : "Desconocido";

    const row = `
      <tr class="border-b">
        <td class="p-3"><input type="checkbox"></td>
        <td class="p-3">${u.name || "—"}</td>
        <td class="p-3">${u.email || "—"}</td>
        <td class="p-3">${rolNombre}</td>
        <td class="p-3"><span class="${estadoClass}">${estadoActivo ? "Activo" : "Inactivo"}</span></td>
        <td class="p-3">${u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
        <td class="p-3">${u.last_connection ? new Date(u.last_connection).toLocaleDateString() : "—"}</td>
        <td class="p-3 flex space-x-2">
          <button onclick="openEditModal(${u.id})" class="text-blue-600 hover:text-blue-800">
            <img src="../svg/edit_blue.svg" class="w-5 h-5">
          </button>
          <button onclick="deleteUser('${u.id}')" class="text-red-600 hover:text-red-800">
            <img src="../svg/delete_red.svg" class="w-5 h-5">
          </button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// Eventos de filtro
searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value.trim();
  applyFilters();
});

filterBtn.addEventListener("click", applyFilters);
