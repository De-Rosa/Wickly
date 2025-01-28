// Main server file, performs the basic operations for setting up express.

require('dotenv').config();
const express = require("express");

async function startApp() {
  console.log("Starting app...");

  const app = express();
  const routes = require('./routes/routes');
  app.use(routes);

  app.listen(process.env.PORT);
  app.use(express.static('public'));
}


startApp();
