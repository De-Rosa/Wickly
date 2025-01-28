require('dotenv').config();
const hashing = require('./hashing.js'); 

module.exports = async function(app) {
  // We generate UUIDs for each user to be stored in localStorage.
  // This is used for comment & index fund ownership.
  // We hash the UUID for security purposes (so that the user cannot just iterate
  // through UUIDs). However, since security isn't extremely necessary, we forgo 
  // salts or other practices.
  //
  app.get('/ids', async function(resp, req) {
    const ids = await hashing.generateIDs()
    req.send(ids) // Default code of 200 when successful.
  })
}


