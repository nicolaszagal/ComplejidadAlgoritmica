// api.js
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const path = require('path');

app.use(express.json());

app.get('/usuarios', (req, res) => {
  const dbPath = path.resolve(__dirname, '../src/assets/db.json');
  res.sendFile(dbPath);
});
app.get('/destinos', (req, res) => {
  const dbPath = path.resolve(__dirname, '../src/assets/db.json');
  res.sendFile(dbPath);
});
app.get('/guardados', (req, res) => {
  const dbPath = path.resolve(__dirname, '../src/assets/db.json');
  res.sendFile(dbPath);
});
app.get('/vuelos', (req, res) => {
  const dbPath = path.resolve(__dirname, '../src/assets/db.json');
  res.sendFile(dbPath);
});

module.exports = app;
module.exports.handler = serverless(app);
