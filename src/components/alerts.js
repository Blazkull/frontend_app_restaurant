// =====================================
// 📦 alerts.js — Modal de alertas con íconos SVG y animación
// =====================================

// Inyectar el modal si no existe
function renderAlertModal() {
    if (document.getElementById("customAlert")) return;

    const modalHTML = `
    <div id="customAlert"
        class="hidden fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
        <div
            class="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 text-center transform scale-95 opacity-0 transition-all duration-300">
            
            <div id="alertIconWrapper" class="flex justify-center mb-4">
                <div id="alertIconContainer"
                    class="w-20 h-20 rounded-full flex items-center justify-center bg-gray-100 animate-none transition-all duration-300">
                    <img id="alertIcon" src="" alt="icono alerta" class="w-10 h-10">
                </div>
            </div>

            <h2 id="alertTitle" class="text-2xl font-bold text-gray-800 mb-3"></h2>
            <p id="alertMessage" class="text-gray-500 text-sm mb-6"></p>
            <div id="alertButtons" class="flex justify-center gap-4"></div>
        </div>
    </div>

    <style>
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.9; }
      }
      .animate-pulse-soft {
        animation: pulse 1.6s ease-in-out infinite;
      }
    </style>
  `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
}

// Mostrar alerta (devuelve una Promesa)
function showAlert({
    title = "Mensaje",
    message = "",
    type = "info", // success | error | confirm | info
    onConfirm = null
}) {
    return new Promise((resolve) => {
        renderAlertModal();

        const modal = document.getElementById("customAlert");
        const titleEl = document.getElementById("alertTitle");
        const messageEl = document.getElementById("alertMessage");
        const buttonsEl = document.getElementById("alertButtons");
        const iconEl = document.getElementById("alertIcon");
        const iconContainer = document.getElementById("alertIconContainer");
        const container = modal.querySelector("div");

        // Texto
        titleEl.textContent = title;
        messageEl.textContent = message;
        buttonsEl.innerHTML = "";

        // Configurar estilos e íconos
        const config = {
            success: { bg: "bg-green-100", icon: "../svg/check-mark-ceircle_green.svg" },
            error: { bg: "bg-red-100", icon: "../svg/close_red.svg" },
            info: { bg: "bg-blue-100", icon: "../svg/info_blue.svg" },
            confirm: { bg: "bg-indigo-100", icon: "../svg/info_blue.svg" }
        };

        const cfg = config[type] || config.info;
        iconContainer.className = `w-20 h-20 rounded-full flex items-center justify-center ${cfg.bg} animate-pulse-soft`;
        iconEl.src = cfg.icon;

        // Crear botones
        if (type === "confirm") {
            const cancelBtn = document.createElement("button");
            cancelBtn.textContent = "Cancelar";
            cancelBtn.className =
                "px-6 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition";
            cancelBtn.onclick = () => {
                closeAlert();
                resolve({ isConfirmed: false });
            };

            const confirmBtn = document.createElement("button");
            confirmBtn.textContent = "Confirmar";
            confirmBtn.className =
                "px-6 py-2 rounded-xl text-white font-medium shadow-md transition bg-indigo-600 hover:bg-indigo-700";
            confirmBtn.onclick = () => {
                closeAlert();
                if (onConfirm) onConfirm();
                resolve({ isConfirmed: true });
            };

            buttonsEl.append(cancelBtn, confirmBtn);
        } else {
            const okBtn = document.createElement("button");
            okBtn.textContent = "Aceptar";
            okBtn.className =
                "px-6 py-2 rounded-xl text-white font-medium shadow-md transition " +
                (type === "error"
                    ? "bg-red-600 hover:bg-red-700"
                    : type === "success"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-blue-600 hover:bg-blue-700");

            okBtn.onclick = () => {
                closeAlert();
                resolve({ isConfirmed: true });
            };

            buttonsEl.appendChild(okBtn);
        }

        // Mostrar animación
        modal.classList.remove("hidden");
        setTimeout(() => {
            container.classList.remove("scale-95", "opacity-0");
            container.classList.add("scale-100", "opacity-100");
        }, 10);
    });
}

// Cerrar modal
export function closeAlert() {
    const modal = document.getElementById("customAlert");
    if (!modal) return;

    const container = modal.querySelector("div");
    container.classList.remove("scale-100", "opacity-100");
    container.classList.add("scale-95", "opacity-0");
    setTimeout(() => modal.classList.add("hidden"), 200);
}

export default showAlert;
