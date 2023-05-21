const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { PubSub } = require('graphql-subscriptions');
const bodyParser = require('body-parser');
const config = require('./config/config');
const { typeDefs, resolvers } = require('./config/config.js');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const http = require('http');
const socketIO = require('socket.io');

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

const cors = require('cors');

// Antes de tus rutas y middleware
app.use(cors({
  origin: 'https://studio.apollographql.com',
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res, pubsub }),
  subscriptions: {
    onConnect: () => console.log('Connected to websocket'),
  },
});

const httpServer = http.createServer(app);

const io = socketIO(httpServer);
const setupSocketIO = require('./socket-server');
setupSocketIO(io);

async function startServer() {
  try {
    await server.start();
    // Middleware para Express
    server.applyMiddleware({
      app,
      cors: {
        origin: 'https://studio.apollographql.com',
        credentials: true,
      },
    });
    await connectDB();
  } catch (error) {
    console.error('Error starting server', error);
  }
}

// Mueve esto fuera de startServer()
httpServer.listen(config.PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${config.PORT}${server.graphqlPath}`);
  console.log(`🚀 Subscriptions ready at ws://localhost:${config.PORT}${server.subscriptionsPath}`);
});

const tasksRoutes = require('./routes/tasksRoutes');
app.use(tasksRoutes);

startServer();

module.exports = { io };