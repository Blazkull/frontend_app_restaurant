// ======================================================
import api from "../api/api.js";
import showAlert from "../components/alerts.js";

/* ---------- Helpers ---------- */
const moneyFmt = (n) => {
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return n;
  }
};

const getInitials = (name) => {
  try {
    return name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  } catch {
    return "";
  }
};

/* ---------- DOM refs ---------- */
const statRevenue = document.getElementById("statRevenue");
const statOrders = document.getElementById("statOrders");
const statOccupancy = document.getElementById("statOccupancy");
const topProductEl = document.getElementById("topProduct");
const topProductPercentEl = document.getElementById("topProductPercent");
const topTableEl = document.getElementById("topTable");

const topDishesEl = document.getElementById("top-dishes");
const waiterSalesEl = document.getElementById("waiter-sales");
const invoicesBody = document.getElementById("invoices-table-body");
const dateStartEl = document.getElementById("dateStart");
const dateEndEl = document.getElementById("dateEnd");

const ordersTableBody = document.getElementById("orders-table-body");
const ordersPaginationEl = document.getElementById("orders-pagination");

/* ---------- Charts (ApexCharts) ---------- */
let lineChart = null;
let donutChart = null;

function renderLineChart(labels, values) {
  const options = {
    chart: { type: "area", height: 320, toolbar: { show: false }, zoom: { enabled: false } },
    series: [{ name: "Ventas", data: values }],
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.12, opacityTo: 0.02, stops: [0, 90, 100] },
    },
    colors: ["#6366F1"],
    xaxis: { categories: labels },
    yaxis: { labels: { formatter: (val) => moneyFmt(val) } },
    tooltip: { y: { formatter: (val) => moneyFmt(val) } },
  };
  if (lineChart) lineChart.destroy();
  lineChart = new ApexCharts(document.querySelector("#chart-line"), options);
  lineChart.render();
}

function renderDonut(labels, values) {
  const options = {
    chart: { type: "donut", height: 240 },
    series: values,
    labels: labels,
    colors: ["#6366F1", "#60A5FA", "#E5E7EB"],
    legend: { position: "bottom" },
  };
  if (donutChart) donutChart.destroy();
  donutChart = new ApexCharts(document.querySelector("#chart-donut"), options);
  donutChart.render();
}

/* ======================================================
    Cargar datos desde la API
====================================================== */
async function loadDashboardSummary(params = "") {
  try {
    const res = await api.get(`/dashboard/summary${params}`);
    const data = res.data.summary;

    statRevenue.textContent = moneyFmt(data.sales_today || 0);
    statOrders.textContent = data.orders_today || 0;

    const occupied = data.tables?.occupied || 0;
    const available = data.tables?.available || 0;
    statOccupancy.textContent = `${occupied} / ${occupied + available}`;

    topProductEl.textContent = data.top_product?.name || "Sin datos";
    topProductPercentEl.textContent = `${data.top_product?.quantity_sold || 0} uds`;
    topTableEl.textContent = `${data.tables?.occupancy_rate || 0}% ocupado`;
  } catch (error) {
    console.error("Error cargando summary:", error);
    showAlert("Error al obtener el resumen del dashboard", "error");
  }
}

async function loadSales(range = "mensual", params = "") {
  try {
    const res = await api.get(`/dashboard/sales?range_type=${range}${params}`);
    const data = res.data;
    const labels = [
      data.range === "mensual"
        ? "Últimos 30 días"
        : data.range === "trimestral"
        ? "Últimos 3 meses"
        : "Último año",
    ];
    renderLineChart(labels, [data.total_sales]);
  } catch (error) {
    console.error("Error cargando ventas:", error);
    showAlert("No se pudo obtener las ventas", "error");
  }
}

async function loadSalesByCategory(range = "mensual", params = "") {
  try {
    const res = await api.get(`/dashboard/sales-by-category?range_type=${range}${params}`);
    const data = res.data.sales_by_category || [];
    const labels = data.map((c) => c.category);
    const values = data.map((c) => c.total_sales);
    renderDonut(labels, values);
  } catch (error) {
    console.error("Error cargando ventas por categoría:", error);
  }
}

async function loadPopularItems(limit = 3, params = "") {
  try {
    const res = await api.get(`/dashboard/popular-items?limit=${limit}${params}`);
    const items = res.data.top_items || [];
    topDishesEl.innerHTML = items
      .map(
        (d) => `
        <li class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold">
              ${getInitials(d.item)}
            </div>
            <div>
              <div class="font-medium">${d.item}</div>
              <div class="text-xs text-gray-400">Platos vendidos</div>
            </div>
          </div>
          <div class="text-gray-500">${d.total_sold}</div>
        </li>`
      )
      .join("");
  } catch (error) {
    console.error("Error cargando platos populares:", error);
  }
}

async function loadTopClients(params = "") {
  try {
    const res = await api.get(`/dashboard/top-clients${params}`);
    const clients = res.data.top_clients || [];
    renderInvoicesTable(clients);
  } catch (error) {
    console.error("Error cargando clientes:", error);
  }
}

// ---- PERFORMANCE ----
async function loadStaffPerformance(limit = 4, params = "") {
  try {
    const res = await api.get(`/dashboard/performance?limit=${limit}${params}`);
    const staff = res.data.staff_performance || [];
    waiterSalesEl.innerHTML = staff
      .map(
        (w) => `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img class="w-8 h-8 rounded-full" src="https://i.pravatar.cc/32?u=${encodeURIComponent(
          w.waiter_name
        )}" />
            <div>
              <div class="font-medium">${w.waiter_name}</div>
              <div class="text-xs text-gray-400">ID ${w.user_id}</div>
            </div>
          </div>
          <div class="font-medium">${w.orders} pedidos</div>
        </div>`
      )
      .join("");
  } catch (error) {
    console.error("Error cargando performance:", error);
  }
}

/* ======================================================
   Paginación visible de facturas
====================================================== */
let currentPage = 1;
const rowsPerPage = 5;
let invoicesData = [];

function renderInvoicesTable(data) {
  invoicesData = data;
  renderInvoicesPage(1);
}

function renderInvoicesPage(page) {
  currentPage = page;
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const visibleRows = invoicesData.slice(start, end);

  invoicesBody.innerHTML = visibleRows
    .map(
      (c, i) => `
      <tr class="border-t">
        <td class="py-3 px-4">${start + i + 1}</td>
        <td class="py-3 px-4">—</td>
        <td class="py-3 px-4">${c.client}</td>
        <td class="py-3 px-4">${c.invoice_count}</td>
        <td class="py-3 px-4">—</td>
        <td class="py-3 px-4">Activo</td>
        <td class="py-3 px-4 text-indigo-600">Ver</td>
      </tr>`
    )
    .join("");

  renderPaginationControls();
}

function renderPaginationControls() {
  const totalPages = Math.ceil(invoicesData.length / rowsPerPage);
  const containerId = "invoices-pagination-controls";

  // Eliminar controles previos
  const oldContainer = document.getElementById(containerId);
  if (oldContainer) oldContainer.remove();

  const paginationDiv = document.createElement("div");
  paginationDiv.id = containerId;
  paginationDiv.className = "flex justify-center mt-3 gap-2";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `px-3 py-1 rounded ${i === currentPage ? "bg-indigo-600 text-white" : "bg-gray-200"}`;
    btn.addEventListener("click", () => renderInvoicesPage(i));
    paginationDiv.appendChild(btn);
  }

  invoicesBody.parentElement.insertAdjacentElement("afterend", paginationDiv);
}

/* ======================================================
   Interacciones UI + PDF + Filtro por fecha
====================================================== */
function setupInteractions() {
  // Botones rango
  document.querySelectorAll(".btn-range").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const range = btn.dataset.range;
      document.querySelectorAll(".btn-range").forEach((b) =>
        b.classList.remove("bg-indigo-100", "text-indigo-600")
      );
      btn.classList.add("bg-indigo-100", "text-indigo-600");
      await Promise.all([loadSales(range), loadSalesByCategory(range)]);
    });
  });

  // Botón aplicar filtro
  document.getElementById("applyFilter")?.addEventListener("click", async () => {
    const start = dateStartEl.value;
    const end = dateEndEl.value;

    if (!start || !end) {
      return showAlert("Debes seleccionar ambas fechas", "warning");
    }

    const params = `?start_date=${start}&end_date=${end}`;
    await Promise.all([
      loadDashboardSummary(params),
      loadSales("mensual", params),
      loadSalesByCategory("mensual", params),
      loadPopularItems(3, params),
      loadTopClients(params),
      loadStaffPerformance(4, params),
      loadRecentOrders(params),
    ]);

    showAlert("Filtro aplicado correctamente", "success");
  });

  // Botón exportar PDF
  document.getElementById("export-pdf")?.addEventListener("click", async () => {
    await generateDashboardPDF();
  });
}

/* ======================================================
Generador de PDF
====================================================== */
async function generateDashboardPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");
  const userName = localStorage.getItem("user_name") || "Usuario";
  const now = new Date();
  const dateStr = now.toLocaleString("es-CO");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(63, 81, 181);
  doc.text("Reporte", 15, 25);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Generado por: ${userName}`, 15, 33);
  doc.text(`Fecha de generación: ${dateStr}`, 15, 39);

  doc.setFontSize(14);
  doc.setTextColor(33, 33, 33);
  doc.text("Resumen del día", 15, 60);

  const revenue = statRevenue.textContent;
  const orders = statOrders.textContent;
  const occupancy = statOccupancy.textContent;
  const topProduct = topProductEl.textContent;
  const topPercent = topProductPercentEl.textContent;
  const tableOccupancy = topTableEl.textContent;

  doc.autoTable({
    startY: 65,
    styles: { halign: "center", fontSize: 10 },
    headStyles: { fillColor: [99, 102, 241] },
    head: [["Ventas Totales", "Pedidos", "Ocupación", "Top Producto", "Ventas Producto", "Ocupación Mesas"]],
    body: [[revenue, orders, occupancy, topProduct, topPercent, tableOccupancy]],
  });

  doc.setFontSize(14);
  doc.text("Platos populares", 15, doc.lastAutoTable.finalY + 15);

  const topDishes = [...topDishesEl.querySelectorAll("li")].map((li) => {
    const name = li.querySelector(".font-medium")?.textContent.trim();
    const sold = li.querySelector(".text-gray-500")?.textContent.trim();
    return [name, sold];
  });

  if (topDishes.length) {
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [99, 102, 241] },
      head: [["Plato", "Unidades Vendidas"]],
      body: topDishes,
    });
  }

  const staff = [...waiterSalesEl.querySelectorAll(".flex.items-center.justify-between")].map((el) => {
    const name = el.querySelector(".font-medium")?.textContent.trim();
    const orders = el.querySelector("div.font-medium:last-child")?.textContent.trim();
    return [name, orders];
  });

  if (staff.length) {
    doc.setFontSize(14);
    doc.text("Desempeño del personal", 15, doc.lastAutoTable.finalY + 15);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [99, 102, 241] },
      head: [["Mesero", "Pedidos Atendidos"]],
      body: staff,
    });
  }

  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generado por ${userName} el ${dateStr}`, 15, pageHeight - 10);
  doc.save(`Reporte_${now.toISOString().slice(0, 10)}.pdf`);
}

/* ==========================
   Pedidos recientes con nombre de usuario
========================== */
let currentOrdersPage = 1;
const ordersPerPage = 5;
let ordersData = [];
let usersData = [];

// Cargar usuarios desde /users
async function loadUsers() {
  try {
    const res = await api.get("/users");
    usersData = res.data || [];
  } catch (error) {
    console.error("Error cargando usuarios:", error);
    showAlert("No se pudieron cargar los usuarios", "error");
  }
}

// Cargar pedidos recientes
async function loadRecentOrders(params = "") {
  await loadUsers();
  try {
    const res = await api.get(`/orders${params}`);
    ordersData = res.data.data || [];

    // Sumar el total de todas las órdenes
    const totalRevenue = ordersData.reduce((acc, o) => acc + (o.total_value || 0), 0);
    statRevenue.textContent = moneyFmt(totalRevenue);

    renderOrdersPage(1);
  } catch (error) {
    console.error("Error cargando pedidos:", error);
    showAlert("No se pudieron cargar los pedidos", "error");
  }
}

// Renderizar pedidos según página
function renderOrdersPage(page) {
  currentOrdersPage = page;
  const start = (page - 1) * ordersPerPage;
  const end = start + ordersPerPage;
  const visibleOrders = ordersData.slice(start, end);

  ordersTableBody.innerHTML = visibleOrders
    .map((o) => {
      const user = usersData.find((u) => u.id === o.id_user_created);
      const userName = user ? user.name : "—";

      return `
      <tr>
        <td class="py-3 px-4">${o.id}</td>
        <td class="py-3 px-4">${userName}</td>
        <td class="py-3 px-4">${o.id_table}</td>
        <td class="py-3 px-4">${o.total_quantity || "—"}</td>
        <td class="py-3 px-4">${moneyFmt(o.total_value)}</td>
        <td class="py-3 px-4">${new Date(o.created_at).toLocaleString()}</td>
        <td class="py-3 px-4 capitalize">${o.id_status}</td>
      </tr>`;
    })
    .join("");

  renderOrdersPagination();
}

// Renderizar paginación
function renderOrdersPagination() {
  const totalPages = Math.ceil(ordersData.length / ordersPerPage);
  ordersPaginationEl.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `px-3 py-1 rounded ${i === currentOrdersPage ? "bg-indigo-600 text-white" : "bg-gray-200"}`;
    btn.addEventListener("click", () => renderOrdersPage(i));
    ordersPaginationEl.appendChild(btn);
  }
}

/* ======================================================
Inicialización
====================================================== */
async function initDashboard() {
  await Promise.all([
    loadDashboardSummary(),
    loadSales(),
    loadSalesByCategory(),
    loadPopularItems(),
    loadTopClients(),
    loadStaffPerformance(),
  ]);
  setupInteractions();
  loadRecentOrders();
}

document.addEventListener("DOMContentLoaded", initDashboard);
