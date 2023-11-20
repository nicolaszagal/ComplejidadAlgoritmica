// functions/api.js
const serverless = require('serverless-http');
const express = require('express');
const jsonServer = require('json-server');
const app = express();
const router = jsonServer.router('../src/assets/db.json');
const middlewares = jsonServer.defaults();

app.use('/api', middlewares);
app.use('/api', router);

module.exports = {
  handler: serverless(app),
};
