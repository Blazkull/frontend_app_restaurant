document.addEventListener('DOMContentLoaded', () => {
    const homeButton = document.getElementById('home-button');

    homeButton.addEventListener('click', () => {
        // Regresar a la página anterior en el historial
        window.history.back();
    });
});
