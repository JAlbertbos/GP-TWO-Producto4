const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const bodyParser = require('body-parser');
const config = require('./config/config');
const { typeDefs, resolvers } = require('./config/config.js');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const http = require('http');
const socketIO = require('socket.io');
const { pubsub } = require('./config/pubsub');
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
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res, pubsub }),
  subscriptions: {
  path: '/subscriptions',
  onConnect: () => console.log('Conectado al WebSocket'),
  onDisconnect: () => console.log('Desconectado del WebSocket'),
},
});

const httpServer = http.createServer(app);

const io = socketIO(httpServer);

const setupSocketIO = require('./socket-server');
setupSocketIO(io);

async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  connectDB()
    .then(() => {
      httpServer.listen(config.PORT, () => {
        console.log(`Servidor escuchando en el puerto ${config.PORT}`);
        console.log(`GraphQL Endpoint: http://localhost:${config.PORT}/graphql`);
        console.log(`Suscripciones disponibles en: ws://localhost:${config.PORT}${server.subscriptionsPath}`);
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
