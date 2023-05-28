const { ApolloServer, PubSub } = require('apollo-server-express');
const express = require('express');
const { createServer } = require('http');
const { execute, subscribe } = require('graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const bodyParser = require('body-parser');
const config = require('./config/config');
const path = require('path');
const connectDB = require('./config/database');
const cors = require('cors');
const { typeDefs, resolvers, pubsub } = require('./config/config.js');
const setupSocketIO = require('./socket-server');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://studio.apollographql.com'],
  credentials: true
}));

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public', 'Dashboard.html'));
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res, pubsub }),
});

const httpServer = createServer(app);

const io = require('socket.io')(httpServer, {
  cors: {
    origin: '*',
  }
});

setupSocketIO(io);

async function startServer() {
  await server.start();
  server.applyMiddleware({ app, cors: true });

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    {
      server: httpServer,
      path: '/graphql',
    },
  );

  connectDB()
    .then(() => {
      httpServer.listen(config.PORT, () => {
        console.log(`Servidor en http://localhost:${config.PORT}${server.graphqlPath}`);
        console.log(`Subscriptions en ws://localhost:${config.PORT}/graphql`);
      });
    })
    .catch((error) => {
      console.error("Error de conexión a MongoDB:", error);
    });
}

startServer();
