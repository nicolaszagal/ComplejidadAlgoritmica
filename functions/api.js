const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json'); // Asegúrate de que 'db.json' coincida con el nombre de tu archivo de datos
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(router);

module.exports = server;
