const tasksController = require('../controllers/TasksController');
const weeksController = require('../controllers/WeeksController');
const pubsub = require('./pubsub');
const { makeExecutableSchema } = require('@graphql-tools/schema');

const mongoURI = 'mongodb+srv://David:1234@agendasemanal.zbsfqm3.mongodb.net/AgendaSemanal';
const PORT = process.env.PORT || 3000;
const TASK_DRAGGED = "TASK_DRAGGED";

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
  type DragDropEvent {
  taskId: ID!
  day: String!
}

type Subscription {
  taskDragged: DragDropEvent!
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
    updateWeek: (_, { id, week }) => {
      return weeksController.updateWeekById(id, week);
    },
    createTask: async (_, { taskData, weekId }) => {
      const taskWithWeek = { ...taskData, week: weekId };
      return await tasksController.createTask(taskWithWeek);
    },
    updateTask: (_, { id, task }) => {
      console.log("Mutation: updateTask triggered"); 
      const updatedTask = tasksController.updateTaskById(id, task);
      pubsub.publish(TASK_DRAGGED, { taskDragged: { taskId: id, day: task.day } });
      console.log("TASK_DRAGGED published", { taskId: id, day: task.day }); 
      return updatedTask;
    },
    deleteTask: (_, { id }) => tasksController.deleteTask(id),
  },
  Subscription: {
  taskDragged: {
    subscribe: () => {
      console.log("Subscription: taskDragged triggered");
      const stream = pubsub.asyncIterator([TASK_DRAGGED]);
      const logAndPassThrough = (value) => {
        console.log("Sending event to subscription:", value);
        return value;
      };
      return asyncIteratorToStream(mapAsyncIterator(stream, logAndPassThrough));
    },
  },
},
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

module.exports = {
<<<<<<< HEAD
  typeDefs,
  resolvers,
  mongoURI,
  PORT,
  TASK_DRAGGED,
  schema
=======
typeDefs,
resolvers,
mongoURI,
PORT,
>>>>>>> parent of 1674252 (graph status ON)
};
