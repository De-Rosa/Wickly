// Main server file, performs the basic operations for setting up express.

require('dotenv').config();
const express = require("express");
const app = express();

async function startApp() {
  console.log("Starting app...");

  const routes = require('./routes/routes');
  app.use(routes);

  app.listen(process.env.PORT);
  app.use(express.static('src/public'));
}


startApp();

module.exports = app;
