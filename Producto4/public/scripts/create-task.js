const socket = io();
let selectedCard;
let tarjetaAEditar;

// Función para crear o actualizar una tarea usando Socket.IO
async function createOrUpdateTask(
	id,
	name,
	description,
	startTime,
	endTime,
	participants,
	taskLocation,
	completed,
	day,
	weekId,
	taskCard,
	validateTask = false,
	arrayBuffer = null,
	filename = null
) {
	return new Promise((resolve, reject) => {
		// Validar campos
		if (validateTask) {
			if (!validarCampos()) {
				return;
			}
		}

		// Solo añade los campos que no son null al objeto de datos de la tarea
		const taskData = {};
		if (name !== null) taskData.name = name;
		if (description !== null) taskData.description = description;
		if (startTime !== null) taskData.startTime = startTime;
		if (endTime !== null) taskData.endTime = endTime;
		if (participants !== null) taskData.participants = participants;
		if (taskLocation !== null) taskData.location = taskLocation;
		if (completed !== null) taskData.completed = completed;
		if (day !== null) taskData.day = day;
		if (weekId !== null) taskData.weekId = weekId;
		if (arrayBuffer !== null) taskData.file = arrayBuffer;
		if (filename !== null) taskData.filename = filename;

		const onSuccess = (isCreated) => {
			if (isCreated) {
				console.log('Recargando página...');
				window.location.reload();
			}
		};
		
		if (!id) {
			socket.emit('createTask', { ...taskData, day }, async (response) => {
				if (response.success) {
					console.log('Tarea creada con éxito');
					const newTaskId = response.task.id; // Accede a la propiedad 'task' de la respuesta

					// Actualizar el atributo 'data-id' y el ID de la tarjeta
					if (taskCard) {
						taskCard.setAttribute('data-id', newTaskId);
						taskCard.id = `tarjeta-${newTaskId}`;
					}
					resolve(newTaskId);
					onSuccess(true); 
				} else {
					validarCampos(`Error al crear tarea: ${response.error}`);
					reject(new Error(`Error al crear tarea: ${response.error}`));
				}
			});
		} else {
			socket.emit('updateTask', { id, updatedData: taskData }, (response) => {
				if (response.success) {
					console.log('Tarea actualizada con éxito');
					resolve(id);
					onSuccess(false);
				} else {
					reject(new Error(`Error al actualizar tarea: ${response.error}`));
				}
			});
		}
	});
}
// Función para crear una tarjeta de tarea en el DOM a partir de los datos de la tarea

function createTaskCard(task) {
	const tarjeta = document.createElement('div');
	tarjeta.id = `tarjeta-${task._id}`;
	tarjeta.classList.add('card', 'my-3', 'draggable');
	tarjeta.setAttribute('data-id', task._id);
	
	let uploadButtonOrFileLink = `
		<button type="button" class="btn btn-link p-0 upload-tarea"><i class="bi bi-upload"> </i>Subir archivo</button>
	`;

	if (task.fileUrl) {
		uploadButtonOrFileLink = `
			<a href="${task.fileUrl}" target="_blank" class="btn btn-link p-0"><i class="bi bi-file-earmark-text"> Archivo adjuntado</i></a>
		`;
		console.log(task.fileUrl);
	}
	tarjeta.innerHTML = `
	  <div class="card-body">
		<div class="d-flex align-items-center justify-content-between">
		  <h5 class="card-title">${task.name}</h5>
		  <button type="button" class="btn btn-link p-0 eliminar-tarea">${iconoPapelera.outerHTML}</button>
		</div>
		<p class="card-text">${task.description}</p>
		<ul class="list-group list-group-flush">
		  <li class="list-group-item"><strong>Hora de inicio:</strong> ${task.startTime}</li>
		  <li class="list-group-item"><strong>Hora de final:</strong> ${task.endTime}</li>
		  <li class="list-group-item"><strong>Participantes:</strong> ${task.participants}</li>
		  <li class="list-group-item"><strong>Ubicación:</strong> ${task.location}</li>
		</ul>
		<div class="form-check mt-3">
		  <input class="form-check-input" type="checkbox" id="tarea-${task.name}">
		  <label class="form-check-label" for="tarea-${task.name}">Tarea terminada</label>
		</div>
		<div class="mt-auto d-flex justify-content-between">
				${uploadButtonOrFileLink}
				<button type="button" class="btn btn-link p-0 editar-tarea"><i class="bi bi-pencil-square text-primary"></i></button>
			</div>
	  </div>
	`;

	tarjeta.setAttribute('draggable', true);

	const botonEliminar = tarjeta.querySelector('.eliminar-tarea');
	botonEliminar.addEventListener('click', async function () {
		selectedCard = tarjeta;
		const taskId = selectedCard.getAttribute('data-id');

		const eliminarTareaModalEl = document.getElementById('eliminarTareaModal');
		const eliminarTareaModal = new bootstrap.Modal(eliminarTareaModalEl);
		eliminarTareaModal.show();
	});

	const checkbox = tarjeta.querySelector('.form-check-input');
	if (task.completed) {
		checkbox.checked = true;
		tarjeta.style.borderColor = 'green';
		tarjeta.style.borderWidth = '2px';
	}

	checkbox.addEventListener('change', async function () {
		if (this.checked) {
			tarjeta.style.borderColor = 'green';
			tarjeta.style.borderWidth = '2px';
		} else {
			tarjeta.style.borderColor = '';
			tarjeta.style.borderWidth = '';
		}
	
		try {
			const taskId = task._id;
			const completed = this.checked;
	
			// Actualizar las propiedades del objeto task antes de llamar a createOrUpdateTask
			task.completed = completed;
			if (task.fileUrl) {
				task.fileUrl = task.fileUrl;
			}
			
			await createOrUpdateTask(
				taskId,
				null,
				null,
				null,
				null,
				null,
				null,
				task.completed,
				null,
				null,
				null,
				null,
				null,
				null
			);
		} catch (error) {
			console.error('Error al actualizar la tarea:', error);
		}
	});

	const botonEditar = tarjeta.querySelector('.editar-tarea');
	botonEditar.addEventListener('click', function () {
		tarjetaAEditar = tarjeta;

		fillFormWithTaskData(task);

		const formTaskModalEl = document.getElementById('formtask');
		const formTaskModal = new bootstrap.Modal(formTaskModalEl);
		formTaskModal.show();
	});

	const botonUpload = tarjeta.querySelector('.upload-tarea');
	if (botonUpload) {
		botonUpload.addEventListener('click', function () {
			const uploadModalEl = document.getElementById('uploadModal');
			const uploadModal = new bootstrap.Modal(uploadModalEl);
			uploadModal.show();

			uploadModalEl
				.querySelector('#uploadButton')
				.addEventListener('click', async function (e) {
					e.preventDefault();

					const fileInput = document.getElementById('fileInput');
					const file = fileInput.files[0];

					if (!file) {
						console.error('No se seleccionó ningún archivo.');
						return;
					}

					const reader = new FileReader();
					reader.onload = async function (event) {
						const arrayBuffer = event.target.result;
						const filename = file.name;
							const filenameParts = filename.split('.');
							const fileExtension = filenameParts[filenameParts.length - 1];
						try {
							const taskId = task._id;
							await createOrUpdateTask(
								taskId,
								task.name,
								task.description,
								task.startTime,
								task.endTime,
								task.participants,
								task.location,
								task.completed,
								task.day,
								null,
								tarjeta,
								false,
								arrayBuffer,
								task.filename
							);


							socket.emit(
								'fileUploaded',
								{ file: arrayBuffer, filename, fileExtension },
								(response) => {
									if (response.success) {
										console.log('Archivo subido con éxito: ', response.file);
										window.location.reload();
									} else {
										console.error('Error al subir archivo:', response.error);
									}
								}
							);
						} catch (error) {
							console.error('Error al actualizar la tarea:', error);
						}

						uploadModal.hide();
						fileInput.value = '';
					};
					reader.readAsArrayBuffer(file);
				});
		});
	}

	return tarjeta;
}
// Función para obtener las tareas de la base de datos por ID de semana usando Socket.IO
async function getTasks(weekId) {
	return new Promise((resolve, reject) => {
		socket.emit('getAllTasks', { weekId }, (response) => {
			if (response.success) {
				console.log('Carga del servidor:', response);
				resolve(response.tasks);
			} else {
				console.error('Carga del servidor:', response);
				reject(new Error(`Error en getAllTasks: ${response.error}`));
			}
		});
	});
}
// Función para agregar una tarjeta de tarea al DOM en el día correspondiente
function addTaskToDOM(taskCard, selectedDay) {
	let dropzone;
	if (selectedDay) {
		dropzone = document.querySelector(
			`.contenedor-dia[data-day="${selectedDay}"] .dropzone`
		);
	}
	if (!dropzone) {
		dropzone = document.querySelector('.zone-bottom');
	}
	if (dropzone) {
		dropzone.appendChild(taskCard);
	} else {
		console.error('Dropzone no encontrada');
	}
}

// Función para cargar las tareas de la base de datos y agregarlas al DOM
async function loadTasksFromDatabase() {
	const tasks = await getTasks(weekId);
	for (const task of tasks) {
		const taskCard = createTaskCard(task);
		taskCard.addEventListener('dragstart', function (event) {
			event.dataTransfer.setData('text/plain', this.id);
		});
		addTaskToDOM(
			taskCard,
			task.day === 'zone-bottom' ? 'zone-bottom' : task.day
		);
	}
}
// Función para eliminar una tarea de la base de datos por ID usando Socket.IO
async function deleteTask(taskId) {
	return new Promise((resolve, reject) => {
		socket.emit('deleteTask', { id: taskId }, (response) => {
			if (response.success) {
				console.log('Tarea Eliminada:', response);
				resolve(response);
			} else {
				console.error('Respuesta del servidor:', response);
				reject(new Error(`Error en deleteTask: ${response.error}`));
			}
		});
	});
}
// Función para permitir soltar elementos en una zona de soltado (dropzone)
function allowDrop(event) {
	event.preventDefault();
}
window.allowDrop = allowDrop;
// Función para manejar el evento de soltar (drop) de una tarjeta de tarea en una zona de soltado
async function drop(event) {
	let dropzoneAncestor = event.target.closest('.dropzone');

	if (!dropzoneAncestor) {
		return;
	}

	event.preventDefault();
	const taskId = event.dataTransfer.getData('text');
	const element = document.getElementById(taskId);

	const contenedorDia = dropzoneAncestor.closest('.contenedor-dia');
	const zoneBottom = dropzoneAncestor.closest('.zone-bottom');

	let newDay;

	if (contenedorDia) {
		newDay = contenedorDia.getAttribute('data-day');
	} else if (zoneBottom) {
		newDay = 'zone-bottom';
	} else {
		console.error('No se encontró el elemento .contenedor-dia o .zone-bottom');
		return;
	}

	// Solo envía el ID de la tarea y el nuevo día
	const taskData = {
		id: element.getAttribute('data-id'),
		day: newDay,
	};

	await createOrUpdateTask(
		taskData.id,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		taskData.day,
		weekId,
		null,
		false
	);

	dropzoneAncestor.appendChild(element);
}
window.drop = drop;
// Función para llenar el formulario con los datos de la tarea que se va a editar
function fillFormWithTaskData(task) {
	nombreTarea.value = task.name;
	descripcion.value = task.description;
	horaInicio.value = task.startTime;
	horaFinal.value = task.endTime;
	participantes.value = task.participants;
	ubicacion.value = task.location;
	completed.checked = task.completed;
}
let selectedDay = 'zone-bottom';
document.querySelectorAll('[data-day]').forEach((button) => {
	button.addEventListener('click', function () {
		selectedDay = this.getAttribute('data-day');
	});
});
const form = document.querySelector('#formtask form');
const nombreTarea = document.querySelector('#nombreTarea');
const descripcion = document.querySelector('#descripcion');
const horaInicio = document.querySelector('#horaInicio');
const horaFinal = document.querySelector('#horaFinal');
const participantes = document.querySelector('#participantes');
const ubicacion = document.querySelector('#ubicacion');
const completed = document.querySelector('#tareaTerminada');
const iconoPapelera = document.createElement('i');
iconoPapelera.classList.add(
	'bi',
	'bi-trash-fill',
	'ms-2',
	'eliminar-tarea',
	'text-danger'
);
const urlParams = new URLSearchParams(window.location.search);
const weekId = urlParams.get('weekId');

function validarCampos() {
	let mensajeError = '';
	if (nombreTarea.value.trim() === '') {
		mensajeError = 'El nombre de la tarea no puede estar vacío.';
	} else if (descripcion.value.trim() === '') {
		mensajeError = 'La descripción no puede estar vacía.';
	} else if (horaInicio.value === '') {
		mensajeError = 'La hora de inicio no puede estar vacía.';
	} else if (horaFinal.value === '') {
		mensajeError = 'La hora de final no puede estar vacía.';
	} else if (participantes.value.trim() === '') {
		mensajeError = 'Los participantes no pueden estar vacíos.';
	} else if (ubicacion.value.trim() === '') {
		mensajeError = 'La ubicación no puede estar vacía.';
	}

	// Verificar si mensajeError no está vacío
	if (mensajeError) {
		document.getElementById('genericModalMessage').innerText = mensajeError;
		const modal = new bootstrap.Modal(document.getElementById('genericModal'));
		modal.show();
		return false;
	}
	return true;
}
form.addEventListener('submit', async function (event) {
	event.preventDefault();
	if (!validarCampos()) {
		return;
	}
	const modal = bootstrap.Modal.getInstance(document.querySelector('#formtask'));
	if (tarjetaAEditar) {
		const taskId = tarjetaAEditar.getAttribute('data-id');
		await createOrUpdateTask(taskId,nombreTarea.value,descripcion.value,horaInicio.value,horaFinal.value,participantes.value,ubicacion.value,completed.checked,null, null, tarjetaAEditar, false);
		window.location.reload();
	} else {
		await createOrUpdateTask(null,nombreTarea.value,descripcion.value,horaInicio.value,horaFinal.value,participantes.value,ubicacion.value,completed.checked,selectedDay,weekId,null,true
		);
		tarjetaAEditar = null;  
	}
	modal.hide();
});
document
	.getElementById('deleteButton')
	.addEventListener('click', async function () {
		const taskId = selectedCard.getAttribute('data-id');
		await deleteTask(taskId); 
		const tarjeta = document.getElementById(`tarjeta-${taskId}`);
		if (tarjeta) {
			tarjeta.remove();
		}
		const eliminarTareaModalEl = document.getElementById('eliminarTareaModal');
		const eliminarTareaModal =
			bootstrap.Modal.getInstance(eliminarTareaModalEl);
		eliminarTareaModal.hide();
	});
loadTasksFromDatabase();
