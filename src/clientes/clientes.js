// clientes.js
const API_BASE = "https://backend-app-restaurant-2kfa.onrender.com/api/clients";

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("clientes-table-body");
    const crearClienteBtn = document.getElementById("crear-cliente-btn");
    const createClientForm = document.getElementById("createClientForm");
    const toggleDeletedBtn = document.getElementById("toggleDeletedBtn");

    let showDeleted = false;

    // 🔹 Cargar lista de clientes
    async function loadClients() {
        try {
            const endpoint = showDeleted ? `${API_BASE}?show_deleted=true` : API_BASE;
            const res = await axios.get(endpoint);
            const clients = res.data;

            tableBody.innerHTML = "";

            if (clients.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-gray-500 py-4">
                            No hay clientes registrados
                        </td>
                    </tr>
                `;
                return;
            }

            clients.forEach(client => {
                const row = document.createElement("tr");
                row.classList.add("hover:bg-gray-50");

                row.innerHTML = `
                    <td class="px-6 py-3 text-sm font-medium text-gray-900">${client.name}</td>
                    <td class="px-6 py-3 text-sm text-gray-500">${client.address || "-"}</td>
                    <td class="px-6 py-3 text-sm text-gray-500">${client.email || "-"}</td>
                    <td class="px-6 py-3 text-sm text-gray-500">${client.identificacion || "-"}</td>
                    <td class="px-6 py-3 text-sm text-gray-500">${client.phone_number || "-"}</td>
                    <td class="px-6 py-3 text-sm text-gray-500">${new Date(client.updated_at).toLocaleDateString()}</td>
                    <td class="px-6 py-3 text-center">
                        ${client.is_deleted
                            ? `<button class="text-green-600 hover:underline" onclick="restoreClient(${client.id})">Restaurar</button>`
                            : `<button class="text-red-600 hover:underline" onclick="deleteClient(${client.id})">Eliminar</button>`
                        }
                    </td>
                `;

                tableBody.appendChild(row);
            });

            lucide.createIcons();
        } catch (error) {
            console.error("❌ Error cargando clientes:", error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-red-500 py-4">
                        Error cargando datos
                    </td>
                </tr>
            `;
        }
    }

    // 🔹 Crear cliente
    createClientForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const newClient = {
            name: document.getElementById("fullname").value,
            identificacion: document.getElementById("identification_number").value,
            type_identificacion_id: parseInt(document.getElementById("id_type_identificacion").value),
            phone_number: document.getElementById("phone_number").value,
            email: document.getElementById("email").value,
            address: document.getElementById("address").value,
        };

        try {
            await axios.post(API_BASE, newClient);
            alert("✅ Cliente creado exitosamente");
            createClientForm.reset();
            loadClients();
        } catch (error) {
            console.error("❌ Error creando cliente:", error.response?.data || error.message);
            alert("Error al crear cliente");
        }
    });

    // 🔹 Eliminar cliente
    window.deleteClient = async (id) => {
        if (!confirm("¿Seguro que deseas eliminar este cliente?")) return;

        try {
            await axios.delete(`${API_BASE}/${id}`);
            alert("🗑️ Cliente eliminado correctamente");
            loadClients();
        } catch (error) {
            console.error("❌ Error eliminando cliente:", error.response?.data || error.message);
            alert("Error al eliminar cliente");
        }
    };

    // 🔹 Restaurar cliente
    window.restoreClient = async (id) => {
        try {
            await axios.patch(`${API_BASE}/${id}/restore`);
            alert("♻️ Cliente restaurado correctamente");
            loadClients();
        } catch (error) {
            console.error("❌ Error restaurando cliente:", error.response?.data || error.message);
            alert("Error al restaurar cliente");
        }
    };

    // 🔹 Alternar vista de eliminados
    toggleDeletedBtn.addEventListener("click", () => {
        showDeleted = !showDeleted;
        toggleDeletedBtn.innerHTML = showDeleted
            ? `<svg data-lucide="users" class="w-5 h-5 mr-2"></svg> Mostrar Activos`
            : `<svg data-lucide="archive-restore" class="w-5 h-5 mr-2"></svg> Mostrar Eliminados`;
        lucide.createIcons();
        loadClients();
    });

    // Inicializar
    loadClients();
});
