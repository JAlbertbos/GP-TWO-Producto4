import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import gql from 'graphql-tag';

console.log("Desde apollo-client.js: Imports realizados con éxito");


const httpLink = new HttpLink({
  uri: 'http://localhost:3000/graphql', 
});

console.log("Desde apollo-client.js: HTTP Link establecido");

const wsLink = new WebSocketLink({
  uri: 'wss://localhost:3000/graphql',
  options: {
    reconnect: true,
    lazy: true, 
  },
});

console.log("Desde apollo-client.js: WebSocket Link establecido");

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    console.log("Desde apollo-client.js: Ejecutando split link, definition.kind:", definition.kind, ", definition.operation:", definition.operation);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

console.log("Desde apollo-client.js: Link de split creado");

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

console.log("Desde apollo-client.js: ApolloClient creado");

const TASK_CREATED_SUBSCRIPTION = gql`
  subscription {
    taskCreated {
      _id
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
        name
        numberWeek
        priority
        year
        description
        borderColor
      }
      fileUrl
    }
  }
`;

console.log("Desde apollo-client.js: TASK_CREATED_SUBSCRIPTION creada");

const TASK_MOVED_SUBSCRIPTION = gql`
  subscription {
    taskMoved {
      _id
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
        name
        numberWeek
        priority
        year
        description
        borderColor
      }
      fileUrl
    }
  }
`;

console.log("Desde apollo-client.js: TASK_MOVED_SUBSCRIPTION creada");


client.subscribe({ query: TASK_CREATED_SUBSCRIPTION }).subscribe({
  next(data) {
    console.log('DESDE APOLLO-SERVER Task Created:', data);
  },
  error(err) {
    console.error('Error:', err);
  },
});

console.log("Desde apollo-client.js: Suscripción a TASK_CREATED_SUBSCRIPTION realizada");

client.subscribe({ query: TASK_MOVED_SUBSCRIPTION }).subscribe({
  next(data) {
    console.log('DESDE APOLLO-SERVER Task Moved:', data);
  },
  error(err) {
    console.error('Error:', err);
  },
});

console.log("Desde apollo-client.js: Suscripción a TASK_MOVED_SUBSCRIPTION realizada");

export default client;

console.log("Desde apollo-client.js: Exportación de client realizada");
