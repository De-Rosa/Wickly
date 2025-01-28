// Ids route file, used for sending (ID, hashed ID) pairs to users. 

require('dotenv').config();
const hashing = require('./hashing.js'); 

module.exports = async function(app) {

  // We generate IDs for each user to be stored in localStorage.
  // This is used for comment & index fund ownership.
  // We hash the ID for security purposes (so that the user cannot just impersonate
  // other IDs). However, since security isn't extremely necessary, we forgo 
  // salts or other practices.
  
  app.get('/ids', async function(resp, req) {
    const ids = await hashing.generateIDs()
    req.send(ids) 
  })
}


