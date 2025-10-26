/* dashboard.js - preview con datos estáticos
   Usa ApexCharts para gráficos elegantes y Tailwind para estilos.
   Cambia a llamadas a tu API cuando estés listo.
*/

/* ---------- Datos estáticos de ejemplo ---------- */
const SAMPLE = {
    summary: {
        totalToday: 12384000,
        totalOrdersToday: 728,
        occupancyCurrent: '64 / 70',
        topProduct: { name: 'Pollo a la carbonara', percent: '85%', table: 'MESA 3' }
    },

    sales: {
        monthly: { labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'], values: [1200000, 1400000, 1350000, 1500000, 1600000, 1550000, 1580000, 1650000, 1700000, 1750000, 1820000, 1900000] },
        quarterly: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], values: [3950000, 4650000, 4900000, 5470000] },
        annually: { labels: ['2019', '2020', '2021', '2022', '2023', '2024'], values: [12000000, 13000000, 12500000, 14000000, 15000000, 17500000] }
    },

    donut: { labels: ['Comida', 'Bebidas', 'Otros'], values: [65, 25, 10] },

    topDishes: [
        { name: 'Pollo a la carbonara', visitors: '4.7K' },
        { name: 'Pasta Alfredo', visitors: '3.4K' },
        { name: 'Ensalada César', visitors: '2.9K' },
        { name: 'Lomo saltado', visitors: '1.5K' }
    ],

    waiters: [
        { name: 'Juan Perez', sold: 500, role: 'Mesero' },
        { name: 'Carlos Robles', sold: 320, role: 'Mesero' },
        { name: 'María López', sold: 210, role: 'Mesera' }
    ],

    orders: [
        { id: 'DE124321', employee: 'John Doe', table: 'Mesa 1', qty: 2, price: 185000, created_at: '2025-10-24', status: 'Complete' },
        { id: 'DE124322', employee: 'Kierra Franci', table: 'Mesa 4', qty: 3, price: 95000, created_at: '2025-10-24', status: 'Complete' },
        { id: 'DE124323', employee: 'Emerson Workman', table: 'Mesa 2', qty: 3, price: 140000, created_at: '2025-10-23', status: 'Pending' }
    ],

    invoices: [
        { id: '#323534', table: 'Mesa 3', client: 'Juan Perez', total: 999000, date: '2025-10-22', status: 'Pago' },
        { id: '#323535', table: 'Mesa 2', client: 'Ninguno', total: 485000, date: '2025-10-21', status: 'Anulado' },
        { id: '#323536', table: 'Mesa 10', client: 'Luis', total: 935000, date: '2025-10-20', status: 'Pendiente' }
    ]
};

/* ---------- Helpers ---------- */
const moneyFmt = (n) => {
    try {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
    } catch { return n; }
};

const normalizeFilterValue = (val) => {
    if (!val) return 'Todos';
    const v = val.toString().toLowerCase();
    if (v === 'all' || v === 'todos') return 'Todos';
    if (v === 'completado' || v === 'complete') return 'Complete';
    if (v === 'pendiente' || v === 'pending') return 'Pending';
    if (v === 'cancelado' || v === 'cancelled') return 'Cancelled';
    return 'Todos';
};

const getInitials = (name) => {
    try {
        return name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
    } catch { return ''; }
}

/* ---------- DOM refs ---------- */
const statRevenue = document.getElementById('statRevenue');
const statOrders = document.getElementById('statOrders');
const statOccupancy = document.getElementById('statOccupancy');
const topProductEl = document.getElementById('topProduct');
const topProductPercentEl = document.getElementById('topProductPercent');
const topTableEl = document.getElementById('topTable');

const topDishesEl = document.getElementById('top-dishes');
const waiterSalesEl = document.getElementById('waiter-sales');
const ordersBody = document.getElementById('orders-table-body');
const invoicesBody = document.getElementById('invoices-table-body');
const ordersPaginationContainer = document.getElementById('orders-pagination');

const dateStartEl = document.getElementById('dateStart');
const dateEndEl = document.getElementById('dateEnd');

/* ---------- Charts (ApexCharts) ---------- */
let lineChart = null;
let donutChart = null;

function renderLineChart(labels, seriesValues) {
    const options = {
        chart: { type: 'area', height: 320, toolbar: { show: false }, zoom: { enabled: false } },
        series: [{ name: 'Ventas', data: seriesValues }],
        stroke: { curve: 'smooth', width: 3 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.12, opacityTo: 0.02, stops: [0, 90, 100] } },
        colors: ['#6366F1'],
        xaxis: { categories: labels, labels: { style: { colors: '#6B7280' } } },
        yaxis: { labels: { formatter: val => moneyFmt(val), style: { colors: '#6B7280' } } },
        grid: { borderColor: '#f1f5f9' },
        tooltip: { y: { formatter: val => moneyFmt(val) } }
    };
    if (lineChart) try { lineChart.destroy(); } catch(e){}
    lineChart = new ApexCharts(document.querySelector("#chart-line"), options);
    lineChart.render();
}

function renderDonut(labels, values) {
    const options = {
        chart: { type: 'donut', height: 240 },
        series: values,
        labels: labels,
        colors: ['#6366F1', '#60A5FA', '#E5E7EB'],
        legend: { position: 'bottom' },
        responsive: [{ breakpoint: 640, options: { chart: { height: 200 }, legend: { position: 'bottom' } } }]
    };
    if (donutChart) try { donutChart.destroy(); } catch(e){}
    donutChart = new ApexCharts(document.querySelector("#chart-donut"), options);
    donutChart.render();
}

/* ---------- Render UI with SAMPLE data ---------- */
function renderSummary() {
    statRevenue.textContent = moneyFmt(SAMPLE.summary.totalToday);
    statOrders.textContent = SAMPLE.summary.totalOrdersToday;
    statOccupancy.textContent = SAMPLE.summary.occupancyCurrent;

    topProductEl.textContent = `${SAMPLE.summary.topProduct.name} `;
    topProductPercentEl.textContent = SAMPLE.summary.topProduct.percent;
    topTableEl.textContent = SAMPLE.summary.topProduct.table;
}

function renderTopDishes() {
    topDishesEl.innerHTML = SAMPLE.topDishes.map(d =>
        `<li class="flex items-center justify-between">
       <div class="flex items-center gap-3">
         <div class="w-8 h-8 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold">${d.name.split(' ').map(s => s[0]).slice(0, 2).join('')}</div>
         <div><div class="font-medium">${d.name}</div><div class="text-xs text-gray-400">Platos vendidos</div></div>
       </div>
       <div class="text-gray-500">${d.visitors}</div>
     </li>`).join('');
}

function renderWaiters() {
    waiterSalesEl.innerHTML = SAMPLE.waiters.map(w =>
        `<div class="flex items-center justify-between">
       <div class="flex items-center gap-3">
         <img class="w-8 h-8 rounded-full" src="https://i.pravatar.cc/32?u=${encodeURIComponent(w.name)}" />
         <div><div class="font-medium">${w.name}</div><div class="text-xs text-gray-400">${w.role}</div></div>
       </div>
       <div class="font-medium">${w.sold} platos</div>
     </div>`).join('');
}

/* ---------- Orders: filter, pagination, PDF ---------- */
let ORDERS_CACHE = [];
let currentPage = 1;
const rowsPerPage = 10;
let currentStatusFilter = 'Todos'; 

function renderOrders() {
    ORDERS_CACHE = SAMPLE.orders;
    currentPage = 1;
    currentStatusFilter = normalizeFilterValue(document.getElementById('filter-state')?.value || 'all');
    updateOrdersTable();
}

function getFilteredOrders() {
    let filtered = ORDERS_CACHE.slice();
    if (currentStatusFilter && currentStatusFilter !== 'Todos') filtered = filtered.filter(o => o.status === currentStatusFilter);

    const q = document.getElementById('search-orders')?.value?.trim()?.toLowerCase();
    if (q) filtered = filtered.filter(o => o.id.toLowerCase().includes(q) || o.employee.toLowerCase().includes(q) || o.table.toLowerCase().includes(q));

    // Filtrado por fechas
    const start = dateStartEl?.value;
    const end = dateEndEl?.value;
    if (start && end) filtered = filtered.filter(o => o.created_at >= start && o.created_at <= end);

    return filtered;
}

function updateOrdersTable() {
    const filtered = getFilteredOrders();
    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * rowsPerPage;
    const visible = filtered.slice(start, start + rowsPerPage);

    ordersBody.innerHTML = visible.map(o => {
        const badgeClass =
            o.status === 'Complete' ? 'bg-green-50 text-green-600' :
            o.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' :
            'bg-gray-50 text-gray-600';
        const initials = getInitials(o.employee);
        return `<tr class="border-t hover:bg-gray-50 transition">
          <td class="py-3 px-4">${o.id}</td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-xs uppercase">${initials}</div>
              <span class="text-gray-800">${o.employee}</span>
            </div>
          </td>
          <td class="py-3 px-4">${o.table}</td>
          <td class="py-3 px-4">${o.qty}</td>
          <td class="py-3 px-4">${moneyFmt(o.price)}</td>
          <td class="py-3 px-4">${o.created_at}</td>
          <td class="py-3 px-4"><span class="px-2 py-1 text-xs rounded-full font-medium ${badgeClass}">${o.status}</span></td>
        </tr>`;
    }).join('');

    renderOrdersPagination(filtered.length, totalPages);
}

function renderOrdersPagination(totalItems, totalPages) {
    if (!ordersPaginationContainer) return;
    let html = `<div class="inline-flex items-center gap-2">`;
    html += `<button id="orders-prev" class="px-3 py-1 rounded-md border ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}">←</button>`;
    for (let i = 1; i <= totalPages; i++) html += `<button data-page="${i}" class="px-3 py-1 rounded-md border ${i===currentPage?'bg-indigo-600 text-white border-indigo-600':'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}">${i}</button>`;
    html += `<button id="orders-next" class="px-3 py-1 rounded-md border ${currentPage===totalPages?'opacity-50 cursor-not-allowed':'hover:bg-gray-100'}">→</button>`;
    html += `</div>`;
    ordersPaginationContainer.innerHTML = html;

    ordersPaginationContainer.querySelectorAll('button[data-page]').forEach(btn => {
        btn.addEventListener('click', () => { currentPage = Number(btn.dataset.page); updateOrdersTable(); ordersBody.scrollIntoView({ behavior:'smooth', block:'center' }); });
    });
    document.getElementById('orders-prev')?.addEventListener('click', ()=>{ if(currentPage>1){currentPage--;updateOrdersTable();} });
    document.getElementById('orders-next')?.addEventListener('click', ()=>{ if(currentPage<totalPages){currentPage++;updateOrdersTable();} });
}

/* ---------- Invoices ---------- */
function renderInvoices() {
    invoicesBody.innerHTML = SAMPLE.invoices.map(i =>
        `<tr class="border-t">
          <td class="py-3 px-4">${i.id}</td>
          <td class="py-3 px-4">${i.table}</td>
          <td class="py-3 px-4">${i.client}</td>
          <td class="py-3 px-4">${moneyFmt(i.total)}</td>
          <td class="py-3 px-4">${i.date}</td>
          <td class="py-3 px-4">${i.status}</td>
          <td class="py-3 px-4"><button class="px-2 py-1 border rounded text-sm">Ver</button></td>
        </tr>`).join('');
}

/* ---------- Setup interactions ---------- */
function setupInteractions() {
    document.getElementById('search-orders')?.addEventListener('input', ()=>{ currentPage=1; updateOrdersTable(); });
    document.getElementById('filter-state')?.addEventListener('change', e => { currentStatusFilter=normalizeFilterValue(e.target.value); currentPage=1; updateOrdersTable(); });
    dateStartEl?.addEventListener('change', ()=>{ currentPage=1; updateOrdersTable(); });
    dateEndEl?.addEventListener('change', ()=>{ currentPage=1; updateOrdersTable(); });

    document.getElementById('export-pdf')?.addEventListener('click', ()=>{
        const filtered = getFilteredOrders();
        const start = (currentPage-1)*rowsPerPage;
        const visible = filtered.slice(start,start+rowsPerPage);
        if(!visible.length) return alert('No hay pedidos visibles para exportar.');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({unit:'pt'});
        doc.setFontSize(12);
        doc.text('Reporte — Pedidos visibles',40,40);
        const rows = visible.map(o=>[o.id,o.employee,o.table,String(o.qty),moneyFmt(o.price),o.created_at,o.status]);
        doc.autoTable({startY:60, head:[['ID','Empleado','Mesa','Cant.','Precio','Fecha','Estado']], body:rows, styles:{fontSize:9,cellPadding:4}, headStyles:{fillColor:[99,102,241], textColor:255}});
        doc.save(`pedidos_visible_page${currentPage}.pdf`);
    });

    document.getElementById('export-orders')?.addEventListener('click', ()=>{
        if(!ORDERS_CACHE.length) return alert('No hay pedidos para exportar.');
        const rows = ORDERS_CACHE.map(r=>[r.id,r.employee,r.table,r.qty,r.price,r.created_at,r.status].join(','));
        const csv=['ID,Empleado,Mesa,Cantidad,Precio,Creacion,Status',...rows].join('\n');
        const blob = new Blob([csv],{type:'text/csv'});
        const url=URL.createObjectURL(blob);
        const a=document.createElement('a');
        a.href=url;a.download='pedidos.csv';a.click();URL.revokeObjectURL(url);
    });

    document.querySelectorAll('.btn-range').forEach(b=>{
        if(b.dataset.range==='monthly') b.classList.add('bg-indigo-50');
        b.addEventListener('click',()=>{
            const range=b.dataset.range||'monthly';
            const d=SAMPLE.sales[range]||SAMPLE.sales.monthly;
            renderLineChart(d.labels,d.values);
            document.querySelectorAll('.btn-range').forEach(x=>x.classList.remove('bg-indigo-50','text-indigo-700'));
            b.classList.add('bg-indigo-50','text-indigo-700');
        });
    });

    document.getElementById('openSidebarBtn')?.addEventListener('click', ()=>{ document.getElementById('sidebar')?.classList.toggle('hidden'); });
    document.getElementById('logoutBtn')?.addEventListener('click', ()=>alert('Cerrar sesión (implementa endpoint real).'));
}

/* ---------- Init ---------- */
function initDashboardPreview() {
    renderSummary();
    renderTopDishes();
    renderWaiters();
    renderOrders();
    renderInvoices();
    renderLineChart(SAMPLE.sales.monthly.labels,SAMPLE.sales.monthly.values);
    renderDonut(SAMPLE.donut.labels,SAMPLE.donut.values);
    setupInteractions();
}

document.addEventListener('DOMContentLoaded', initDashboardPreview);
