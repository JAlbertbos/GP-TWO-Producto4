const express = require('express');
const { ApolloServer, PubSub } = require('apollo-server-express');
const { createServer } = require('http');
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const bodyParser = require('body-parser');
const config = require('./config/config');
const { typeDefs, resolvers } = require('./config/config.js');
const path = require('path');
const connectDB = require('./config/database');
const socketIO = require('socket.io');
const { pubsub } = require('./config/pubsub');
const cors = require('cors');

const app = express();
let io;
app.use(cors({
  origin: ['http://localhost:3000', 'https://studio.apollographql.com'],
  credentials: true
}));

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
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res }),
  subscriptions: {
    path: '/subscriptions',
    onConnect: () => console.log('Client connected'),
    onDisconnect: () => console.log('Client disconnected'),
  },
});


const tasksRoutes = require('./routes/tasksRoutes');
app.use(tasksRoutes);

async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql', cors: true });
  
  const httpServer = createServer(app);
  
  io = socketIO(httpServer);  
  const setupSocketIO = require('./socket-server');
  setupSocketIO(io);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

 SubscriptionServer.create(
  {
    schema,
    execute,
    subscribe,
  },
  {
    server: httpServer,
    path: '/subscriptions',
  },
);


  connectDB()
    .then(() => {
      httpServer.listen(config.PORT, () => {
        console.log(`Servidor escuchando en el puerto ${config.PORT}`);
        console.log(`GraphQL Endpoint: http://localhost:${config.PORT}${server.graphqlPath}`);
        console.log(`Suscripciones disponibles en: ws://localhost:${config.PORT}/subscriptions`);

      });
    })
    .catch((error) => {
      console.error("Error de conexión a MongoDB:", error);
    });

    module.exports = { io };
}

startServer();

