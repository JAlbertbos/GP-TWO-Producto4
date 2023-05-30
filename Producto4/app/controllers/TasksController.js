const Task = require('../models/Task');
const multer = require('multer');

// Configuración Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage });


exports.uploadFile = upload.single('file'), async (req, res) => {
  try {
    console.log('Desde TaskController:Comenzando la subida del archivo');
    const file = req.file;
    const task = await Task.findById(req.params.taskId);

    const fileUrl = file.path;

    task.fileUrl = fileUrl;
    await task.save();

    console.log('Desde TaskController:Archivo subido con éxito');
    res.status(200).send({ success: true, fileUrl });
  } catch (err) {
    console.error('Error en la subida del archivo', err);
    res.status(500).send({ success: false, message: 'Error subida de archivo' });
  }
};


exports.getTasks = async ({ weekId }) => {
  try {
    console.log('Desde TaskController:Obteniendo tareas');
    const tasks = await Task.find({ week: weekId });
    console.log('Desde TaskController:Tareas obtenidas con éxito');
    return tasks;
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    throw new Error('Error al obtener tareas:', error);
  }
};


exports.getTaskById = async (id) => {
  try {
    console.log('Desde TaskController:Obteniendo tarea por ID');
    const task = await Task.findById(id).populate("week");
    console.log('Desde TaskController:Tarea obtenida con éxito');
    return task;
  } catch (err) {
    console.error('Error al obtener la tarea por ID', err);
    throw new Error("Error al recuperar la tarea");
  }
};

exports.createTask = async (taskData) => {
  try {
    console.log('Desde TaskController:Creando tarea');
    const newTask = new Task(taskData);
    const savedTask = await newTask.save();
    console.log('Desde TaskController:Tarea creada con éxito');
    return savedTask;
  } catch (err) {
    console.error('Error al crear la tarea', err);
    throw new Error("Error al crear la tarea");
  }
};


exports.updateTaskById = async (id, updatedData) => {
  try {
    console.log('Desde TaskController:Actualizando tarea');
    const updatedTask = await Task.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedTask) {
      console.log('Desde TaskController:No se encontró la tarea para actualizar');
      throw new Error('Tarea no encontrada');
    }
    console.log('Desde TaskController:Tarea actualizada con éxito');
    return updatedTask;
  } catch (err) {
    console.error('Error al actualizar la tarea', err);
    throw new Error("Error al actualizar la tarea");
  }
};

exports.deleteTask = async (id) => {
  try {
    console.log('Desde TaskController:Borrando tarea');
    await Task.findByIdAndRemove(id);
    console.log('Desde TaskController:Tarea borrada con éxito');
  } catch (err) {
    console.error('Error al borrar la tarea', err);
    throw new Error("Error al borrar la tarea");
  }
};