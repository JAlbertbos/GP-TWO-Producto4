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
    const file = req.file;
    const task = await Task.findById(req.params.taskId);

    const fileUrl = file.path;

    task.fileUrl = fileUrl;
    await task.save();

    res.status(200).send({ success: true, fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: 'Error subida de archivo' });
  }
};


exports.getTasks = async ({ weekId }) => {
  try {
    const tasks = await Task.find({ week: weekId });
    return tasks;
  } catch (error) {
    console.error('Error al obtener tareas:', error);
  }
};


exports.getTaskById = async (id) => {
  try {
    return await Task.findById(id).populate("week");
  } catch (err) {
    console.error(err);
    throw new Error("Error al recuperar la tarea");
  }
};

exports.createTask = async (taskData) => {
  try {
    taskData.week = taskData.weekId;
    delete taskData.weekId;
    const newTask = new Task(taskData);
    return await newTask.save();
  } catch (err) {
    console.error(err);
    throw new Error("Error al crear la tarea");
  }
};



exports.updateTaskById = async (id, updatedData) => {
  try {
    return await Task.findByIdAndUpdate(id, updatedData, { new: true });
  } catch (err) {
    console.error(err);
    throw new Error("Error al actualizar la tarea");
  }
};

exports.deleteTask = async (id) => {

  try {
    await Task.findByIdAndRemove(id);
  } catch (err) {
    console.error(err);
    throw new Error("Error al borrar la tarea");
  }
};
