import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';

// Crear un HttpLink para conectarse a tu servidor GraphQL
const httpLink = new HttpLink({
  uri: 'http://localhost:3000/graphql', // tu endpoint de GraphQL
});

// Crear un WebSocketLink para las suscripciones
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:3000/graphql', // tu endpoint de WebSocket
  options: {
    reconnect: true,
  },
});

// Usa la función split para dirigir las consultas a través del enlace HTTP y las suscripciones a través del enlace WebSocket
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

// Crear un nuevo cliente Apollo
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client;
