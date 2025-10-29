document.addEventListener('DOMContentLoaded', () => {
    const homeButton = document.getElementById('home-button');

    homeButton.addEventListener('click', () => {
        // En una aplicación real, usarías:
        // window.location.href = '/dashboard.html'; 
        
        // Para la demo, mostramos una alerta de funcionalidad
        alert("Redirigiendo a la página principal (Dashboard)...");

        // Simulación de navegación (cambiar a otra URL si es necesario)
        // window.location.href = 'dashboard.html'; 
    });
});