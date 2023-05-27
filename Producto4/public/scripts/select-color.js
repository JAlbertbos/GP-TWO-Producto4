// Definir una variable global para el color seleccionado
window.selectedColor = "black";

const circles = document.querySelectorAll(".circle");
const description = document.querySelector("textarea");

circles.forEach(circle => {
    circle.addEventListener("click", () => {
        window.selectedColor = circle.classList[1];
        description.style.borderColor = window.selectedColor;
    });
});