const { ApolloServer} = require('apollo-server-express');
const express = require('express');
const { createServer } = require('http');
const { execute, subscribe } = require('graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const config = require('./config/config');
const path = require('path');
const connectDB = require('./config/database');
const cors = require('cors');
const { typeDefs, resolvers, pubsub } = require('./config/config.js');
const setupSocketIO = require('./socket-server');


console.log("Desde server.js:Imports completados");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

console.log("Desde server.js:Cors configurado");

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log("Desde server.js:Directorios estáticos configurados");

app.get('/', (req, res) => {
  console.log("Desde server.js:Entrando en la ruta '/'");
  res.sendFile(path.resolve(__dirname, '..', 'public', 'Dashboard.html'));
});
console.log("Desde server.js:Body parser configurado");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res, pubsub }),
});
console.log("Desde server.js:ApolloServer configurado");

const httpServer = createServer(app);
console.log("Desde server.js:httpServer creado");

const io = require('socket.io')(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    path: '/socket.io',
    transports: ["websocket"]
  }
});

io.on('connection', (socket) => {
    console.log('Cliente conectado: ' + socket.id);

    socket.on('disconnect', (reason) => {
        console.log('Cliente desconectado: ' + socket.id);
        console.log('Razón: ' + reason);
    });

    socket.on('error', (error) => {
        console.log('Se produjo un error con el cliente ' + socket.id);
        console.log(error);
    });
});

console.log("Desde server.js:Socket.io configurado");

setupSocketIO(io);

console.log("Desde server.js:Socket.io configurado con setupSocketIO");

async function startServer() {
  try {
    console.log("Desde server.js:Iniciando servidor...");
    await server.start();
    console.log("Desde server.js:Servidor iniciado");
    server.applyMiddleware({ app, cors: true });

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    console.log("Desde server.js:Esquema creado");

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

    console.log("Desde server.js:SubscriptionServer creado");

    console.log("Desde server.js:Intentando conectar a la base de datos...");
    await connectDB();
    console.log("Desde server.js:Desde server.js:Conexión a la base de datos exitosa");

    httpServer.listen(config.PORT, () => {
      console.log(`Servidor en http://localhost:${config.PORT}${server.graphqlPath}`);
      console.log(`Subscriptions en ws://localhost:${config.PORT}/graphql`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
  }
}



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('¡Algo salió mal!');
});
console.log("Desde server.js:Iniciando servidor...");
startServer();