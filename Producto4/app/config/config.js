const tasksController = require('../controllers/TasksController');
const weeksController = require('../controllers/WeeksController');
const { TASK_CREATED, TASK_MOVED } = require('./subscriptions');
const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

const typeDefs = `#graphql
scalar ID
type Week {
  _id: ID
  name: String
  numberWeek: Int
  priority: Int
  year : Int
  description: String
  borderColor: String
  tasks: [Task]
}
type Task {
  _id: ID
  name: String 
  description: String
  startTime: String
  endTime: String
  participants: String
  location:String
  day: String
  completed: Boolean
  week: Week
  fileUrl: String
}
  input WeekInput {
    name: String
    numberWeek: Int
    priority: Int
    year: Int
    description: String
    borderColor: String
  }
  
  input TaskInput {
    name: String
    description: String
    startTime: String
    endTime: String
    participants: String
    location: String
    day: String
    completed: Boolean
    week: ID
    fileUrl: String
  }
  type Query {
    getAllWeeks: [Week]
    getWeekById(id: ID): Week
    getAllTasks(weekId: ID!): [Task]
    getTaskById(id: String): Task
  }
  
  type Mutation {
    createWeek(week: WeekInput): Week
    deleteWeek(id: String): Week
    updateWeek(id: ID, week: WeekInput): Week
    createTask(taskData: TaskInput!): Task
    updateTask(id: String, task: TaskInput): Task
    deleteTask(id: String): Task
  }
  type Subscription {
  taskCreated: Task
  taskMoved: Task
}
`;
const resolvers = {
  Query: {
    getAllWeeks: async () => {
      console.log('Obteniendo todas las semanas');
      const result = await weeksController.getAllWeeks();
      console.log('Semanas obtenidas con éxito:', result);
      return result;
    },
    getWeekById: async (_, { id }) => {
      console.log(`Obteniendo semana con id ${id}`);
      const result = await weeksController.getWeekById(id);
      console.log('Semana obtenida con éxito:', result);
      return result;
    },
    getAllTasks: async (_, { weekId }) => {
      console.log(`Obteniendo todas las tareas para la semana ${weekId}`);
      const result = await tasksController.getTasks({ weekId });
      console.log('Tareas obtenidas con éxito:', result);
      return result;
    },
    getTaskById: async (_, { id }) => {
      console.log(`Obteniendo tarea con id ${id}`);
      const result = await tasksController.getTaskById(id);
      console.log('Tarea obtenida con éxito:', result);
      return result;
    },
  },
  Mutation: {
    createWeek: async (_, { week }) => {
      console.log('Creando semana:', week);
      const result = await weeksController.createWeek(week);
      console.log('Semana creada con éxito:', result);
      return result;
    },
    deleteWeek: async (_, { id }) => {
      console.log(`Eliminando semana con id ${id}`);
      const result = await weeksController.deleteWeekById(id);
      console.log('Semana eliminada con éxito:', result);
      return result;
    },
    updateWeek: async (_, { id, week }) => {
      console.log(`Actualizando semana con id ${id}`);
      const result = await weeksController.updateWeekById(id, week);
      console.log('Semana actualizada con éxito:', result);
      return result;
    },
    createTask: async (_, { taskData, weekId }) => {
     console.log('Creando tarea:', taskData);
     const taskWithWeek = { ...taskData, week: weekId };
    const newTask = await tasksController.createTask(taskWithWeek);
      console.log('Publicando evento TASK_CREATED');
      await pubsub.publish(TASK_CREATED, { taskCreated: newTask });
      console.log('Evento TASK_CREATED publicado con éxito');
      return newTask;
    },
    updateTask: async (_, { id, task }) => {
      console.log(`Actualizando tarea con id ${id}`);
      const updatedTask = await tasksController.updateTaskById(id, task);
      console.log("Publicando evento TASK_MOVED");
      await pubsub.publish(TASK_MOVED, { taskMoved: updatedTask });
      console.log('Evento TASK_MOVED publicado con éxito');
      return updatedTask;
    },
    deleteTask: async (_, { id }) => {
      console.log(`Eliminando tarea con id ${id}`);
      const result = await tasksController.deleteTask(id);
      console.log('Tarea eliminada con éxito:', result);
      return result;
    },
  },
  Subscription: {
    taskCreated: {
      subscribe: () => {
        console.log('Subscripción a TASK_CREATED iniciada');
        return pubsub.asyncIterator([TASK_CREATED]);
      },
    },
    taskMoved: {
      subscribe: () => {
        console.log('Subscripción a TASK_MOVED iniciada');
        return pubsub.asyncIterator([TASK_MOVED]);
      },
    },
  },
};

const mongoURI = 'mongodb+srv://David:1234@agendasemanal.zbsfqm3.mongodb.net/AgendaSemanal';
const PORT = process.env.PORT || 3000;

module.exports = {
    typeDefs,
    resolvers,
    mongoURI,
    PORT,
    pubsub,
};