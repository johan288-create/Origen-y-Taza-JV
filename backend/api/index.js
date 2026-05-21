const server = require('../server');
const express = require('express');
const app = express();

// Reenviar todas las rutas agregando /api al inicio
app.use('/', (req, res, next) => {
  req.url = '/api' + req.url;
  server(req, res, next);
});

module.exports = app;