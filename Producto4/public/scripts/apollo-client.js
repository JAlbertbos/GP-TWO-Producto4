import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import gql from 'graphql-tag';

// HTTP connection to the API
const httpLink = new HttpLink({
  uri: 'http://localhost:3000/graphql', // Replace with your GraphQL server URL
});

// WebSocket link for subscriptions
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:3000/graphql', // Replace with your GraphQL server WebSocket URL
  options: {
    reconnect: true,
    lazy: true,  // Added for compatibility with graphql-ws
  },
});

// Split links for different operation types
const link = split(
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

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

// Subscriptions
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

// Subscription handlers
client.subscribe({ query: TASK_CREATED_SUBSCRIPTION }).subscribe({
  next(data) {
    console.log('DESDE APOLLO-SERVER Task Created:', data);
  },
  error(err) {
    console.error('Error:', err);
  },
});

client.subscribe({ query: TASK_MOVED_SUBSCRIPTION }).subscribe({
  next(data) {
    console.log('DESDE APOLLO-SERVER Task Moved:', data);
  },
  error(err) {
    console.error('Error:', err);
  },
});

export default client;
