import { SubscriptionClient } from 'subscriptions-transport-ws';

// Crea un nuevo cliente de suscripción WebSocket
const client = new SubscriptionClient('ws://localhost:3000/graphql', {
  reconnect: true,
  onConnected: () => {
    console.log('graphqlSubscriptions.js :Conectado al servidor GraphQL');
  },
  onDisconnected: () => {
    console.log('graphqlSubscriptions.js :Desconectado del servidor GraphQL');
  },
});

console.log('graphqlSubscriptions.js :graphqlSubscriptions.js funcionando')

// Suscripción a TASK_CREATED
client.request({
  query: `
    subscription {
      taskCreated {
        id
        name
        description
        startTime
        endTime
        participants
        location
        day
        completed
        week {
          _id
        }
        fileUrl
      }
    }
  `
}).subscribe({
  next(data) {
    console.log('graphqlSubscriptions.js :Tarea creada:', data.taskCreated);
    // Aquí puedes actualizar la UI con la nueva tarea.
    // Tal vez quieras llamar a `window.location.reload()`
    // o tal vez quieras actualizar la UI de una manera más específica.
  },
  error(err) {
    console.error('graphqlSubscriptions.js :Error al recibir la tarea creada:', err);
  },
});

// Similarmente, puedes suscribirte a TASK_MOVED
client.request({
  query: `
    subscription {
      taskMoved {
        id
        name
        description
        startTime
        endTime
        participants
        location
        day
        completed
        week {
          _id
        }
        fileUrl
      }
    }
  `
}).subscribe({
  next(data) {
    console.log('graphqlSubscriptions.js :Tarea movida:', data.taskMoved);
    // Aquí puedes actualizar la UI con la tarea movida.
    // Tal vez quieras llamar a `window.location.reload()`
    // o tal vez quieras actualizar la UI de una manera más específica.
  },
  error(err) {
    console.error('graphqlSubscriptions.js :Error al recibir la tarea movida:', err);
  },
});
