const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

module.exports = pubsub;


const TASK_CREATED = 'TASK_CREATED';
const TASK_MOVED = 'TASK_MOVED';

const taskCreatedIterator = pubsub.asyncIterator([TASK_CREATED]);
const taskMovedIterator = pubsub.asyncIterator([TASK_MOVED]);

module.exports = { pubsub, taskCreatedIterator, taskMovedIterator, TASK_CREATED, TASK_MOVED };
