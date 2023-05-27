const WeeksController = require('./controllers/WeeksController');
const TasksController = require('./controllers/TasksController');

const fs = require('fs');
const path = require('path');

function setupSocketIO(io) {
  io.on('connection', (socket) => {
    // console.log(`Socket.io Cliente conectado con la id ${socket.id}`);

    //SEMANAS
    socket.on('createWeek', async (data, callback) => {
      // console.log('Socket.io Datos recibidos para crear semana:', data);

      try {
        const newWeek = await WeeksController.createWeek(data);
        io.sockets.emit('newWeek', newWeek);
        // console.log('Socket.io OK: Semana creada');
        callback({ success: true, week: newWeek });
      } catch (error) {
        // console.error('Socket.io Error al crear semana:', error);
        callback({ success: false, error });
      }
    });
    socket.on('updateWeek', async (data, callback) => {
      console.log('Socket.io Datos recibidos para actualizar semana:', data);

      try {
        const updatedWeek = await WeeksController.updateWeekById(data.id, data.updatedData);
        io.sockets.emit('updatedWeek', updatedWeek);
        // console.log('Socket.io OK: Semana actualizada');
        callback({ success: true, updatedWeek: updatedWeek });
      } catch (error) {
        // console.error('Socket.io Error al actualizar semana:', error);
        callback({ success: false, error });
      }
    });
    socket.on('getAllWeeks', (data, callback) => {
      WeeksController.getAllWeeks()
        .then((semanas_obtenidas) => {
          // console.log(' Socket.io OK: Semanas obtenidas');
          callback({ success: true, weeks: semanas_obtenidas });
        })
        .catch((error) => {
          // console.error(' Socket.io Error al obtener semanas:', error);
          callback({ success: false, error: error.message });
        })
    });
    // TAREAS
    socket.on('getAllTasks', async (data, callback) => {
      try {
        const tasks = await TasksController.getTasks({ weekId: data.weekId });
        // console.log(' Socket.io  OK: Tareas obtenidas');
        callback({ success: true, tasks });
      } catch (error) {
        // console.error('Socket.io Error al obtener tareas:', error);
        callback({ success: false, error });
      }
    });
    socket.on('createTask', async (data, callback) => {
      // console.log('Socket.io Datos recibidos para crear tarea:', data); 
    
      try {
        const newTask = await TasksController.createTask(data);
        io.sockets.emit('newTask', newTask);
        // console.log('Socket.io OK: Tarea creada');
        callback({ success: true, task: newTask });
      } catch (error) {
        // console.error('Socket.io Error al crear tarea:', error);
        callback({ success: false, error });
      }
    });
    
    socket.on('updateTask', async (data, callback) => {
      // console.log('Socket.io Datos recibidos para actualizar tarea:', data);
    
      try {
        let updatedData = data.updatedData;
        let filename = null; // Añade esta línea para inicializar la variable filename con un valor predeterminado
    
        if (updatedData.file) {
          filename = `file-${Date.now()}`; 
    
          await fs.promises.writeFile(path.join(__dirname, 'uploads', filename), updatedData.file);
    
          // console.log('Socket.io OK: Archivo subido');
          updatedData.fileUrl = `/uploads/${filename}`;
    
        }
        const updatedTask = await TasksController.updateTaskById(data.id, updatedData);
        io.sockets.emit('updatedTask', updatedTask);
        // console.log('Socket.io OK: Tarea actualizada');
        callback({ success: true, file: updatedData.fileUrl });
      } catch (error) {
        // console.error('Socket.io Error al actualizar tarea:', error);
        callback({ success: false, error: error.message }); 
      }
    });
    socket.on('deleteTask', async (data, callback) => {
      try {
        await TasksController.deleteTask(data.id);
        io.sockets.emit('deletedTask', { id: data.id });
        // console.log('Socket.io OK: Tarea eliminada');
        callback({ success: true });
      } catch (error) {
        // console.error('Socket.io Error al eliminar tarea:', error);
        callback({ success: false, error });
      }
    });

    socket.on('fileUploaded', (data, callback) => {
      const filename = (data.filename || `file-${Date.now()}`) + '.' + data.fileExtension;
  
      fs.writeFile(path.join(__dirname, 'uploads', filename), data.file, (error) => {
          if (error) {
              // console.error('Socket.io Error al subir archivo:', error);
              callback({ success: false, error });
          } else {
              // console.log('Socket.io OK: Archivo subido');
              callback({ success: true, file: filename });
          }
      });
  });
    

    socket.on('disconnect', () => {
      //  console.log(`Socket.io Cliente desconectado con id ${socket.id}`);
    });
  });
}

module.exports = setupSocketIO;