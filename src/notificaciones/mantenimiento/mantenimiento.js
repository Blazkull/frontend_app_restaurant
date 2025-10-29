document.addEventListener('DOMContentLoaded', () => {
    const homeButton = document.getElementById('home-button');

    homeButton.addEventListener('click', () => {
        // En una aplicación real, si el mantenimiento terminara, usarías:
        // window.location.href = '/dashboard.html'; 
        
        // Para la demo, mostramos una alerta de funcionalidad
        alert("Simulación: Intento de volver a la página principal. ¡El sitio sigue en mantenimiento! 🚧");

        // Si deseas que el botón haga algo más en la demo, cámbialo aquí.
        // window.location.href = 'dashboard.html'; 
    });
});