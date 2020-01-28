/* eslint-disable no-console */
const AWS = require('aws-sdk');
const http = require('http');
require('dotenv').config();

const handler = require('github-webhook-handler')({ path: '/webhook', secret: 'hackdaygamification' });

const credentials = {
  accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key,
};

AWS.config.update({ credentials, region: 'eu-north-1' });

const { userHandler, increaseAttributeByOne } = require('./dynamodb');


http.createServer((req, res) => {
  handler(req, res, () => {
    res.statusCode = 404;
    res.end('no such location');
  });
}).listen(process.env.PORT || 8081);

handler.on('error', (err) => {
  console.error('Error:', err.message);
});

handler.on('push', async ({ payload }) => {
  const github = payload.sender.login;
  console.log(`received a push from ${github}`);
  try {
    await userHandler(github);
    await increaseAttributeByOne(github, 'pushes');
  } catch (e) {
    console.error('Something goes wrong');
  }
});

handler.on('pull_request', async ({ payload }) => {
  const { action } = payload;
  if (action === 'closed') {
    const github = payload.pull_request.user.login;
    try {
      await userHandler(github);
      await increaseAttributeByOne(github, 'pullRequests');
    } catch (e) {
      console.error('Something goes wrong');
    }
  }
});
