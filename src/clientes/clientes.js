// ======================================================
// Importaciones
// ======================================================
import api from "../api/api.js";
import showAlert from "../components/alerts.js";

// ======================================================
// Variables globales
// ======================================================
let showingDeleted = false; // Estado para saber si se están mostrando eliminados
const tbody = document.getElementById("clientes-table-body");
const toggleDeletedBtn = document.getElementById("toggleDeletedBtn");
const createClientForm = document.getElementById("createClientForm");

// ======================================================
// Cargar clientes (activos o eliminados)
// ======================================================
async function loadClients(showDeleted = false) {
    try {
        const response = await api.get(`/clients`, {
            params: { deleted: showDeleted },
        });
        const clients = response.data.data;

        tbody.innerHTML = "";

        clients.forEach((client) => {
            const row = `
        <tr class="hover:bg-gray-50 border-b">
          <td class="px-6 py-4 text-sm text-gray-900">${client.fullname}</td>
          <td class="px-6 py-4 text-sm text-gray-500">${client.address}</td>
          <td class="px-6 py-4 text-sm text-gray-500">${client.email}</td>
          <td class="px-6 py-4 text-sm text-gray-500">${client.identification_number}</td>
          <td class="px-6 py-4 text-sm text-gray-500">${client.phone_number}</td>
          <td class="px-6 py-4 text-sm text-gray-500">${new Date(client.updated_at).toLocaleDateString()}</td>
          <td class="px-6 py-4 text-center flex items-center justify-center space-x-3">
            ${client.deleted
                    ? `
              <button onclick="restoreClient(${client.id})" 
                class="text-green-600 hover:text-green-800" title="Restaurar cliente">
                <img src="../svg/restore_green.svg" alt="restaurar" class="w-5 h-5">
              </button>`
                    : `
              <button onclick="editClient(${client.id})" 
                class="text-blue-600 hover:text-blue-800" title="Editar cliente">
                <img src="../svg/edit_blue.svg" alt="editar" class="w-5 h-5">
              </button>
              <button onclick="deleteClient(${client.id})" 
                class="text-red-600 hover:text-red-800" title="Eliminar cliente">
                <img src="../svg/delete_red.svg" alt="eliminar" class="w-5 h-5">
              </button>`
                }
          </td>
        </tr>`;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error("Error al cargar clientes:", error);
    }
}

// ======================================================
// Crear cliente
// ======================================================
createClientForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        fullname: document.getElementById("fullname").value.trim(),
        identification_number: document.getElementById("identification_number").value.trim(),
        id_type_identificacion: parseInt(document.getElementById("id_type_identificacion").value),
        phone_number: document.getElementById("phone_number").value.trim(),
        email: document.getElementById("email").value.trim(),
        address: document.getElementById("address").value.trim(),
    };

    try {
        await api.post("/clients", data);

        showAlert({
            type: "success",
            title: "Cliente creado",
            message: "El cliente fue agregado exitosamente.",
        });

        const modal = bootstrap.Modal.getInstance(document.getElementById("createClientModal"));
        modal.hide();

        createClientForm.reset();
        loadClients();
    } catch (error) {
        console.error("Error al crear cliente:", error);
    }
});

// ======================================================
// Editar cliente
// ======================================================
window.editClient = async (id) => {
    try {
        const response = await api.get(`/clients/${id}`);
        const client = response.data;

        // Llenar el modal con los datos
        document.getElementById("fullname").value = client.fullname;
        document.getElementById("identification_number").value = client.identification_number;
        document.getElementById("id_type_identificacion").value = client.id_type_identificacion;
        document.getElementById("phone_number").value = client.phone_number;
        document.getElementById("email").value = client.email;
        document.getElementById("address").value = client.address;

        // Cambiar título del modal
        document.getElementById("createClientModalLabel").textContent = "Editar Cliente";

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById("createClientModal"));
        modal.show();

        // Reemplazar el evento del formulario temporalmente
        createClientForm.onsubmit = async (e) => {
            e.preventDefault();

            const updatedData = {
                fullname: document.getElementById("fullname").value.trim(),
                identification_number: document.getElementById("identification_number").value.trim(),
                id_type_identificacion: parseInt(document.getElementById("id_type_identificacion").value),
                phone_number: document.getElementById("phone_number").value.trim(),
                email: document.getElementById("email").value.trim(),
                address: document.getElementById("address").value.trim(),
            };

            try {
                await api.patch(`/clients/${id}`, updatedData);

                showAlert({
                    type: "success",
                    title: "Cliente actualizado",
                    message: "Los datos del cliente se han modificado correctamente.",
                });

                modal.hide();
                loadClients();
            } catch (error) {
                console.error("Error al actualizar cliente:", error);
            } finally {
                // Restaurar comportamiento del formulario original
                createClientForm.onsubmit = null;
                createClientForm.addEventListener("submit", createClientForm);
            }
        };
    } catch (error) {
        console.error("Error al obtener cliente:", error);
    }
};

// ======================================================
// Eliminar cliente
// ======================================================
window.deleteClient = async (id) => {
    const result = await showAlert({
        type: "confirm",
        title: "¿Eliminar cliente?",
        message: "Esta acción no se puede deshacer.",
        showCancel: true,
    });

    if (result.isConfirmed) {
        try {
            await api.delete(`/clients/${id}`);

            await showAlert({
                type: "success",
                title: "Cliente eliminado",
                message: "El cliente fue eliminado correctamente.",
            });

            // Recarga los clientes activos
            loadClients(showingDeleted);
        } catch (error) {
            console.error("Error al eliminar cliente:", error);
            showAlert({
                type: "error",
                title: "Error",
                message: "No se pudo eliminar el cliente.",
            });
        }
    }
};


// ======================================================
// Restaurar cliente eliminado
// ======================================================
window.restoreClient = async (id) => {
    const result = await showAlert({
        type: "confirm",
        title: "¿Restaurar cliente?",
        message: "Este cliente volverá a estar activo.",
        showCancel: true,
    });

    if (result.isConfirmed) {
        try {
            await api.patch(`/clients/${id}/restore`);
            showAlert({
                type: "success",
                title: "Cliente restaurado",
                message: "El cliente fue restaurado correctamente.",
            });
            loadClients(true);
        } catch (error) {
            console.error("Error al restaurar cliente:", error);
        }
    }
};

// ======================================================
// Botón para alternar entre activos y eliminados
// ======================================================
toggleDeletedBtn.addEventListener("click", () => {
    showingDeleted = !showingDeleted;
    toggleDeletedBtn.textContent = showingDeleted ? "Mostrar Activos" : "Mostrar Eliminados";
    loadClients(showingDeleted);
});

// ======================================================
// Inicializar al cargar el DOM
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
    loadClients();
});
