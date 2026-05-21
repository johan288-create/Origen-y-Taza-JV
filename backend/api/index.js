const app = require('../server');

// Reescribir rutas quitando /api
const originalStack = app._router.stack;

module.exports = app;