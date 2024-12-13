const express = require("express");
const router = express.Router();

require('./comments/comments')(router);
require('./index-funds/index-funds')(router);
require('./stocks/stocks')(router);

module.exports = router;
