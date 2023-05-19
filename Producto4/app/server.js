const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const bodyParser = require('body-parser');
const config = require('./config/config');
const { typeDefs, resolvers } = require('./config/config.js');
const path = require('path');
const connectDB = require('./config/database');
const http = require('http');
const socketIO = require('socket.io');
<<<<<<< HEAD
const { PubSub } = require('graphql-subscriptions');
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { schema } = require('./config/config');

const pubsub = new PubSub();
=======
const pubsub = require('./config/pubsub');
>>>>>>> parent of 1674252 (graph status ON)

const app = express();

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public', 'Dashboard.html'));
});

app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', filename);
  if (path.extname(filename) === '.txt') {
    res.setHeader('Content-Type', 'application/pdf');
  }
  res.sendFile(filepath, (err) => {
    if (err) {
      console.error('Error al enviar archivo:', err);
      res.status(500).send('Error al enviar el archivo');
    } else {
      console.log('Archivo enviado: ', filename);
    }
  });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const server = new ApolloServer({
  schema, 
  context: ({ req, res }) => ({ req, res, pubsub }),
  subscriptions: {
<<<<<<< HEAD
    onConnect: () => console.log('Conexión establecida a través de websockets'),
  },
=======
  onConnect: () => console.log('Connected to websocket'),
  introspection: true,
  playground: true,
  }
>>>>>>> parent of 1674252 (graph status ON)
});
const httpServer = http.createServer(app);

const io = socketIO(httpServer);
const setupSocketIO = require('./socket-server');
setupSocketIO(io);

async function startServer() {
  await server.start();
<<<<<<< HEAD
  server.applyMiddleware({ app, path: '/graphql' });

  const subscriptionServer = SubscriptionServer.create(
  {
    schema, 
    execute,
    subscribe,
    onConnect: (connectionParams, webSocket) => {
      console.log('Cliente conectado a través de websockets.');
    },
  },
  {
    server: httpServer,
    path: server.graphqlPath,
  }
);


=======
  server.applyMiddleware({ app ,  path: '/graphql'  });
  
>>>>>>> parent of 1674252 (graph status ON)
  connectDB()
    .then(() => {
      httpServer.listen(config.PORT, () => {
        console.log(`Servidor escuchando en el puerto ${config.PORT}`);
console.log(`🚀 Subscripciones listas en ws://localhost:${config.PORT}/graphql`);
      });
    })
    .catch((error) => {
      console.error("Error de conexión a MongoDB:", error);
    });
}

const tasksRoutes = require('./routes/tasksRoutes');
app.use(tasksRoutes);

startServer();

module.exports = { io };
