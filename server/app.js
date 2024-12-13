require('dotenv').config();
const express = require("express");
const crypto = require("crypto");

async function startApp() {
  console.log("Starting app...");

  const app = express();
  const routes = require('./routes/routes');
  app.use(routes);

  app.listen(process.env.PORT);
  app.use(express.static('../public/'));

  app.get('/', function(resp, req) {
    ids = generateID(); 
    console.log(ids)
    req.send(ids)
  })
}

async function hashID(uuid) {
  return crypto.createHmac('sha256', process.env.HASH_KEY).update(uuid)
}

async function generateID() {
  const uuid = crypto.randomUUID();
  const hashed_uuid = hashID(uuid).then(() => {});

  return {
    id: uuid, 
    hashed_id: hashed_uuid
  };
}

startApp();
