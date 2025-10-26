document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const tableBody = document.getElementById('ordersTableBody');
    const rows = tableBody.querySelectorAll('.order-row');

    // Función principal para aplicar filtros
    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedStatus = statusFilter.value;

        rows.forEach(row => {
            const employeeName = row.getAttribute('data-employee-name').toLowerCase();
            const rowStatus = row.getAttribute('data-status');

            // 1. Filtrar por búsqueda de nombre
            const matchesSearch = employeeName.includes(searchTerm);

            // 2. Filtrar por estado
            const matchesStatus = selectedStatus === 'all' || rowStatus === selectedStatus;

            // Mostrar u ocultar la fila
            if (matchesSearch && matchesStatus) {
                row.style.display = ''; // Muestra la fila
            } else {
                row.style.display = 'none'; // Oculta la fila
            }
        });
    };

    // Evento para la búsqueda en tiempo real (al escribir)
    searchInput.addEventListener('keyup', applyFilters);

    // Evento para el filtro por estado (al cambiar la opción)
    statusFilter.addEventListener('change', applyFilters);

    // Inicialmente, ejecuta los filtros (para asegurar que todo esté visible si no hay filtros)
    applyFilters();
});