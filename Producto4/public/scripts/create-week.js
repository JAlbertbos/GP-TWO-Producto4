const socket = io();

//Funciones API

function priorityToString(priority) {
  switch (parseInt(priority)) {
    case 1:
      return "Alta";
    case 2:
      return "Media";
    case 3:
      return "Baja";
    default:
      return "";
  }
}
function priorityStringToValue(priorityString) {
  switch (priorityString) {
    case "Alta":
      return "1";
    case "Media":
      return "2";
    case "Baja":
      return "3";
    default:
      return "";
  }
}

let tarjetaAEditar;

function renderWeeks(weeks) {
  removeExistingCards();
  weeks.forEach((week) => {
    addCardToDOM(
      week._id,
      week.name,
      week.numberWeek,
      week.priority,
      week.year,
      week.description,
      week.borderColor
    );
  });
}

async function graphqlFetch(query, variables = {}) {
  try {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    });

    const jsonResponse = await response.json();
    
    console.log("Respuesta completa de GraphQL:", jsonResponse);

    if (jsonResponse.errors) {
      throw new Error(jsonResponse.errors[0].message);
    }

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    if (jsonResponse.errors) {
      throw new Error(jsonResponse.errors[0].message);
    }

    return jsonResponse.data;
  } catch (error) {
    console.error('Error en graphqlFetch:', error);
    throw error;
  }
}


async function saveWeekToServer(name, numberWeek, priority, year, description, borderColor) {
  return new Promise((resolve, reject) => {
    console.log('Enviando petición para crear semana:', { name, numberWeek, priority, year, description, borderColor });
    socket.emit('createWeek', { name, numberWeek, priority, year, description, borderColor }, (response) => {
      if (response.error) {
        console.error('Error al guardar la semana:', response.error);
        reject(response.error);
      } else {
        console.log('Respuesta del servidor al crear la semana:', response.week);
        resolve(response.week._id);
      }
    });
  });
}

async function updateWeekOnServer(id, name, numberWeek, priority, year, description, borderColor) {
  return new Promise((resolve, reject) => {
    
    const updatedData = {
      name,
      numberWeek,
      priority,
      year,
      description,
      borderColor,
    };
    socket.emit('updateWeek', { id, updatedData }, (response) => {
      if (response.error) {
        console.error('Error al actualizar la semana:', response.error);
        reject(response.error);
      } else {
        console.log('Respuesta del servidor al actualizar la semana:', response.updatedWeek);
        if (response.updatedWeek && response.updatedWeek._id) {
          resolve(response.updatedWeek._id);
          console.log('OK : Semana actualizada');
        } else {
          console.error('Error: updatedWeek o updatedWeek._id no definido', response.updatedWeek);
          reject('Error: updatedWeek o updatedWeek._id no definido');
        }
      }
    });
  });
}

//DOMsito 

function removeExistingCards() {
  const mainRow = document.querySelector("main .row");
  const cardContainers = mainRow.querySelectorAll(".col-md-4.mb-4");
  cardContainers.forEach((cardContainer) => {
    cardContainer.remove();
  });
}


async function addCardToDOM(id, name, numberWeek, priority, year, description, color) {
  const cardContainer = document.createElement("div");
  cardContainer.classList.add("col-md-4", "mb-4");

  const priorityText = priorityToString(priority);

  const card = `
    <div class="card shadow-sm card-square" data-id="${id}" style="border-color: ${color}">
      <div class="card-body">
        <h5 class="card-title"><b>${name}</b></h5>
        <p class ="card-text">Semana: ${numberWeek}</p>
        <p class="card-text">Prioridad: "${priorityText}"</p>
        <p class ="card-text">Año: ${year}</p>
        <p class ="card-text">Descripcion: ${description}</p>
      </div>
      <div class="card-icons d-flex justify-content-between position-absolute bottom-0 start-0 end-0">
        <a href="./Weektasks.html?weekId=${id}" class="card-link"><i class="bi bi-eye"></i></a>
        <a href="#" class="card-link"><i class="bi bi-trash delete-icon" data-bs-toggle="modal" data-bs-target="#eliminarTarjetaModal" data-card="${id}"></i>
        <a href="#" class="card-link btn btn-link p-0 editar-week " data-id="${id}"><i class="bi bi-pencil-square "></i></a>
        </a>
      </div>
    </div>
  `;

  cardContainer.innerHTML = card;

  const mainRow = document.querySelector("main .row");
  mainRow.appendChild(cardContainer);

  const cardValues = {
    name: cardContainer.querySelector('.card-title').textContent,
    description: cardContainer.querySelector('.card-text:nth-child(5)').textContent,
    numberWeek: cardContainer.querySelector('.card-text:nth-child(2)').textContent.split(": ")[1],
    priority: priorityStringToValue(priorityText),
    year: cardContainer.querySelector('.card-text:nth-child(4)').textContent.split(": ")[1],
    color: cardContainer.querySelector('.card.shadow-sm.card-square').style.borderColor
  };
  
  function fillModalForm(cardValues) {
    document.getElementById("name").value = cardValues.name;
    document.getElementById("description").value = cardValues.description.substring(13);
    document.getElementById("numberWeek").value = cardValues.numberWeek;
    document.getElementById("priority").value = parseInt(cardValues.priority);
    document.getElementById("year").value = cardValues.year;
  
    const colorCircles = document.querySelectorAll(".circle");
    colorCircles.forEach(circle => {
      if (circle.dataset.color === cardValues.color) {
        circle.classList.add("selected");
      } else {
        circle.classList.remove("selected");
      }
    });
}

  const editButton = cardContainer.querySelector(".editar-week");
  editButton.addEventListener("click", async () => {
    tarjetaAEditar = cardContainer;
    
    const cardValues = {
      name: cardContainer.querySelector('.card-title').textContent,
      description: cardContainer.querySelector('.card-text:nth-child(5)').textContent,
      numberWeek: cardContainer.querySelector('.card-text:nth-child(2)').textContent.split(": ")[1],
      priority: priorityStringToValue(priorityText),
      year: cardContainer.querySelector('.card-text:nth-child(4)').textContent.split(": ")[1],
      color: cardContainer.querySelector('.card.shadow-sm.card-square').style.borderColor
    };
  
    fillModalForm(cardValues);
  
    const modal = new bootstrap.Modal(document.getElementById("nuevaSemanaModal"));
    modal.show();
  });
 
}

async function createCard(name, numberWeek, priority, year, description, color) {
  const id = await saveWeekToServer(name, numberWeek, priority, year, description, color);
  if (id) {
    addCardToDOM(id, name, numberWeek, priority, year, description, color);
  }
}


async function loadWeeks() {
  console.log("loadWeeks() iniciada");
  
  socket.emit('getAllWeeks', {}, (response) => {
    console.log("Respuesta de getAllWeeks recibida:", response);
    
    if (response.error) {
      console.error('Error al cargar las semanas:', response.error);
    } else {
      console.log("Semanas recibidas:", response.weeks);
      renderWeeks(response.weeks);
    }
  });
}



// Eventos

document.addEventListener("DOMContentLoaded", async () => {
  const confirmBtn = document.getElementById("confirmButton");
  const cardForm = document.getElementById("cardForm");

  let selectedColor = "black";
  const circles = document.querySelectorAll(".circle");
  const description = document.querySelector("textarea");

  circles.forEach(circle => {
      circle.addEventListener("click", () => {
          selectedColor = circle.classList[1];
          description.style.borderColor = selectedColor;
      });
  });

  confirmBtn.addEventListener("click", async (e) => {
    var formulario = document.getElementById("cardForm");
    var inputsRequeridos = formulario.querySelectorAll("[required]");
    var valido = true;
  
    for (var i = 0; i < inputsRequeridos.length; i++) {
      if (!inputsRequeridos[i].value) {
        valido = false;
        break;
      }
    }

    function mostrarModal(mensaje) {
      const modalBody = document.querySelector("#genericModal #genericModalMessage");
      modalBody.textContent = mensaje;
  
      const genericModal = new bootstrap.Modal(document.querySelector("#genericModal"));
      genericModal.show();
  }
  
  
    if (valido) {
      e.preventDefault();
      let name = document.getElementById("name").value;
      let numberWeek = document.getElementById("numberWeek").value;
      let priority = parseInt(document.getElementById("priority").value);
      let year = document.getElementById("year").value;
      let description = document.getElementById("description").value;
  
      
      if (name.trim() === "") {
        mostrarModal("Por favor ingrese un nombre válido.");
        return;
      }
  
      
      const weekRegex = /^(0?[1-9]|[1-4][0-9]|5[0-3])$/;
      if (!weekRegex.test(numberWeek)) {
        mostrarModal("Por favor ingrese un número de semana válido (entre 01 y 53).");
        return;
      }
  
      
      if (![1, 2, 3].includes(priority)) {
        mostrarModal("Por favor seleccione una prioridad válida (Alta, Media o Baja).");
        return;
      }
  
      
      const yearRegex = /^\d{4}$/;
      if (!yearRegex.test(year)) {
        mostrarModal("Por favor ingrese un año válido (formato: AAAA).");
        return;
      }
  
      
      if (description.trim() === "") {
        mostrarModal("Por favor ingrese una descripción válida.");
        return;
      }
  
      if (tarjetaAEditar) {
        const id = tarjetaAEditar.querySelector(".card").dataset.id;
        await updateWeekOnServer(id, name, numberWeek, priority, year, description, selectedColor);
        tarjetaAEditar.remove();
        tarjetaAEditar = null;
      } else {
        await createCard(name, numberWeek, priority, year, description, selectedColor);
      }
  
      await loadWeeks();
  
      const nuevaSemanaModal = document.getElementById("nuevaSemanaModal");
      const modal = bootstrap.Modal.getInstance(nuevaSemanaModal);
      modal.hide();
  
      cardForm.reset();
      tarjetaAEditar = null;
    } else {
      mostrarModal("Faltan campos por completar");
    }
  });
  document.querySelectorAll(".delete-icon").forEach((deleteIcon) => {
    deleteIcon.addEventListener("click", (e) => {
      e.preventDefault();
      const cardContainer = e.target.closest(".col-md-4.mb-4");
      deleteCard(cardContainer);
    });
  });

  loadWeeks();
});



export { graphqlFetch, renderWeeks };
