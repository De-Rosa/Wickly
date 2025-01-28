// Routes file, handles all of the routes in seperate files.
// https://expressjs.com/en/guide/routing.html

const express = require("express");
const router = express.Router();

require('./comments/comments')(router);
require('./index-funds/index-funds')(router);
require('./stocks/stocks')(router);
require('./ids/ids')(router);

module.exports = router;
