const AWS = require('aws-sdk');

const TableName = 'Hackday.Gamification';

const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

const getUser = (github) => docClient.get({
  TableName,
  Key: { github },
}).promise();

const createUser = (github) => docClient.put({
  TableName,
  Item: {
    github,
    pushes: 0,
    pullRequests: 0,
  },
}).promise();

/**
 * Check if user exists, if not will create a new user with the github
 * @param {String} github github of the user
 */
const userHandler = async (github) => {
  const user = await getUser(github);
  if (!user.Item) { // not exists
    await createUser(github);
  }
};

const increaseAttributeByOne = (github, attribute) => docClient.update({
  TableName,
  Key: { github },
  UpdateExpression: 'set #k= #k + :val',
  ExpressionAttributeNames: {
    '#k': attribute,
  },
  ExpressionAttributeValues: {
    ':val': 1,
  },
}).promise();

module.exports = {
  userHandler,
  increaseAttributeByOne,
};
