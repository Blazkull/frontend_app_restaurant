// ======================================================
// components.js - Sidebar, Navbar, Roles, JWT y Modal Logout nativo

function parseJwt(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error al decodificar el token JWT:", e);
        return null;
    }
}

// ======================================================
// Configuración de menús por rol
// ======================================================
const ROLE_MENUS = {
    "Administrador": [
        { name: "Pedidos", icon: "car", link: "../orders-adm/oders-adm.html" },
        { name: "Menú", icon: "calendar", link: "../menu/menu.html" },
        { name: "Mesas", icon: "flag", link: "../mesas/mesas_list.html" },
        { name: "Clientes", icon: "clients", link: "../clientes/clientes.html" },
        { name: "Usuarios", icon: "user", link: "../usuarios/usuarios.html" },
        { name: "Facturación", icon: "ticket", link: "../facturas/facturas_vista.html" },
        { name: "Cocina", icon: "clock", link: "../cocina/cocina.html" },
    ],
    "Mesero": [
        { name: "Mesas", icon: "flag", link: "../mesas/mesas_list.html" },
        { name: "Pedidos", icon: "car", link: "../pedidos/pedidos.html" },
        { name: "Cocina", icon: "clock", link: "../cocina/cocina.html" },
        { name: "Clientes", icon: "clients", link: "../clientes/clientes.html" },
    ],
    "Jefe de Cocina": [
        { name: "Menú", icon: "calendar", link: "../menu/menu.html" },
        { name: "Pedidos", icon: "car", link: "../pedidos/pedidos.html" },
        { name: "Cocina", icon: "clock", link: "../cocina/cocina.html" },
    ],
    "Cajero": [
        { name: "Facturación", icon: "ticket", link: "../facturas/facturas_vista.html" },
        { name: "Clientes", icon: "clients", link: "../clientes/clientes.html" },
    ],
};

// ======================================================
// Renderizar Sidebar dinámico
// ======================================================
function renderSidebar(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const token = localStorage.getItem("token");
    let role = "Invitado";
    let username = localStorage.getItem("username") || "Usuario";

    if (token) {
        const decoded = parseJwt(token);
        role = decoded?.role_name || "Invitado";
        username = decoded?.username || username;
    }

    const commonLinks = `
        <a href="../dashboard/dashboard.html" 
           class="flex items-center gap-3 p-2 rounded text-gray-700 hover:bg-gray-100 transition">
            <img src="../svg/bars.svg" class="w-5 h-5"> Dashboard
        </a>
    `;

    const roleLinks = (ROLE_MENUS[role] || [])
        .map(
            (item) => `
            <a href="${item.link}" 
               class="flex items-center gap-3 p-2 rounded text-gray-700 hover:bg-gray-100 transition">
               <img src="../svg/${item.icon}.svg" class="w-5 h-5"> ${item.name}
            </a>`
        )
        .join("") || `<p class="text-gray-500 px-4">Sin permisos asignados</p>`;

    container.innerHTML = `
        <div class="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
            <div>
                <div class="flex items-center gap-2 p-6 font-bold text-lg">
                    <div class="bg-blue-600 p-2 rounded-lg">
                        <i data-lucide="bar-chart-3" class="w-6 h-6 text-white"></i>
                    </div>
                    <span class="text-gray-900">La Media Luna</span>
                </div>

                <div class="px-6 pb-2 text-sm text-gray-600">
                    <span class="font-semibold">Rol:</span> ${role}
                </div>

                <nav class="flex flex-col gap-1 mt-2 px-2">
                    ${commonLinks}
                    ${roleLinks}
                </nav>
            </div>

            <div class="p-4">
                <button id="sidebarLogout" 
                    class="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg w-full font-medium hover:bg-indigo-700 transition shadow-md">
                    Cerrar Sesión
                    <img src="../svg/exit.svg" class="w-5 h-5">
                </button>
            </div>
        </div>
    `;

    lucide.createIcons();
}

// ======================================================
// Renderizar Topbar
// ======================================================
function renderTopbar(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const username = localStorage.getItem("username") || "Usuario";

    container.innerHTML = `
        <div class="w-full bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm">
            <h1 class="text-lg font-semibold text-gray-700">Bienvenido, ${username}</h1>
            <button id="openLogoutModal" 
                class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
                Cerrar Sesión
            </button>
        </div>
    `;
}

// ======================================================
// Modal Logout funcional
// ======================================================
function initLogoutModal() {
    const logoutModal = document.getElementById("logoutModal");
    const cancelLogout = document.getElementById("cancelLogout");
    const confirmLogout = document.getElementById("confirmLogout");

    if (!logoutModal) return;

    // Abrir modal desde botones de topbar o sidebar
    document.addEventListener("click", (e) => {
        if (e.target.id === "openLogoutModal" || e.target.id === "sidebarLogout") {
            showLogoutModal();
        }
    });

    // Cerrar modal
    cancelLogout?.addEventListener("click", hideLogoutModal);

    // Confirmar cierre de sesión
    confirmLogout?.addEventListener("click", () => {
        // Eliminamos solo los datos del usuario
        localStorage.removeItem("token");
        localStorage.removeItem("username");

        hideLogoutModal();

        // Redirigir al login
        window.location.href = "../login/login.html";
    });

    function showLogoutModal() {
        logoutModal.classList.remove("hidden");
        setTimeout(() => {
            const modalContent = logoutModal.querySelector("div > div");
            if (modalContent) modalContent.classList.remove("scale-95", "opacity-0");
        }, 10);
    }

    function hideLogoutModal() {
        const modalContent = logoutModal.querySelector("div > div");
        if (modalContent) modalContent.classList.add("scale-95", "opacity-0");
        setTimeout(() => logoutModal.classList.add("hidden"), 200);
    }
}

// ======================================================
// Protección de páginas por rol
// ======================================================
function protectPage(role) {
    const path = window.location.pathname;
    const fileName = path.substring(path.lastIndexOf("/") + 1);

    const allowedPaths = ["dashboard.html"];
    const roleMenus = ROLE_MENUS[role] || [];
    roleMenus.forEach((item) => {
        allowedPaths.push(item.link.split("/").pop());
    });

    if (!allowedPaths.includes(fileName)) {
        window.location.href = "../404/404.html";
    }
}

// ======================================================
// Inicializador global
// ======================================================
function initComponents() {
    const token = localStorage.getItem("token");

    // Si no hay token, redirigir a login
    if (!token) {
        window.location.href = "../login/login.html";
        return;
    }

    const decoded = parseJwt(token);
    if (!decoded) {
        console.warn("Token inválido, redirigiendo al login...");
        localStorage.removeItem("token");
        window.location.href = "../login/login.html";
        return;
    }

    // Validar expiración del token
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
        console.warn("Token expirado, redirigiendo al login...");
        localStorage.removeItem("token");
        window.location.href = "../login/login.html";
        return;
    }

    const role = decoded?.role_name || "Invitado";

    renderSidebar("sidebar");
    renderTopbar("topbar");
    initLogoutModal();
    protectPage(role);
}

// ======================================================
// Autoejecutar al cargar la página
// ======================================================
document.addEventListener("DOMContentLoaded", initComponents);
