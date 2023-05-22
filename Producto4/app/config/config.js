const tasksController = require('../controllers/TasksController');
const weeksController = require('../controllers/WeeksController');
const { pubsub, TASK_CREATED, TASK_MOVED } = require('./pubsub');

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
    week: String
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
    createTask(taskData: TaskInput!, weekId: ID!): Task
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
    getAllWeeks: () => weeksController.getWeeks(),
    getWeekById: (_, { id }) => weeksController.getWeekById(id),
    getAllTasks: (_, { weekId }) => tasksController.getTasks({ weekId }),
    getTaskById: (_, { id }) => tasksController.getTaskById(id),
  },
  Mutation: {
    createWeek: (_, { week }) => {
      return weeksController.createWeek(week);
    },
    deleteWeek: (_, { id }) => {
      return weeksController.deleteWeekById(id);
    },
    createTask: async (_, { taskData, weekId }) => {
    const taskWithWeek = { ...taskData, week: weekId };
    const newTask = await tasksController.createTask(taskWithWeek);

    console.log('Publicando evento TASK_CREATED');
    pubsub.publish(TASK_CREATED, { taskCreated: newTask });

    return newTask;
  },
  updateTask: (_, { id, task }) => {
    const updatedTask = tasksController.updateTaskById(id, task);

    console.log('Publicando evento TASK_MOVED');
    pubsub.publish(TASK_MOVED, { taskMoved: updatedTask });

    return updatedTask;
  },

    deleteTask: (_, { id }) => tasksController.deleteTask(id),
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
};


