import { graphqlFetch } from './create-week.js';

document.addEventListener("DOMContentLoaded", async () => {
  async function deleteWeekFromServer(id) {
    try {
      const query = `
  mutation DeleteWeek($id: String!) {
    deleteWeek(id: $id) {
      _id
    }
  }
`;

      const variables = {
        id,
      };

      console.log('Variables enviadas:', variables);

      const response = await graphqlFetch(query, variables);
      const deletedWeek = response.deleteWeek;

      console.log('Semana eliminada:', deletedWeek);

      // Emitir evento "deleteWeek" a través de Socket.IO
      const socket = io();
      socket.emit("deleteWeek", id);

    } catch (error) {
      console.error("Error al eliminar la semana:", error);
    }
  }

  async function deleteCard(id) {
    const cardContainers = document.querySelectorAll(".col-md-4.mb-4");

    cardContainers.forEach((cardContainer) => {
      const card = cardContainer.querySelector(".card");

      if (card.getAttribute("data-id") === id) {
        cardContainer.remove();
      }
    });
  }

  const mainRow = document.querySelector("main .row");

  mainRow.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-icon")) {
      e.preventDefault();
      const card = e.target.closest(".card");
      const weekId = card.getAttribute("data-id");

      const eliminarTarjetaModalEl = document.getElementById("eliminarTarjetaModal");
      const eliminarTarjetaModal = new bootstrap.Modal(eliminarTarjetaModalEl, { keyboard: false });

      const eliminarTarjetaBtn = eliminarTarjetaModalEl.querySelector("#eliminarTarjetaBtn");

      eliminarTarjetaBtn.removeEventListener('click', handleClick);

      eliminarTarjetaBtn.addEventListener("click", handleClick);

      async function handleClick() {
        await deleteWeekFromServer(weekId);
        deleteCard(weekId);

        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove();
        }
        eliminarTarjetaModal.hide();
      }

      eliminarTarjetaModal.show();
    }
  });
});
