// Hashing file, used for authentication in POST requests. 
const crypto = require("crypto");

// Generates IDs and returns (ID, hashed ID) .

async function generateIDs() {
  const id = crypto.randomUUID();
  const hashed_id = await hashID(id);

  return {
    id: id, 
    hashed_id: hashed_id
  };
}

// Checks if an ID corresponds to its hashed ID. 

async function validateID(id, hashed_id) {
  const new_hashed_id = await hashID(id);
  return new_hashed_id == hashed_id;
}

// Hashes a given ID using SHA256. 
// https://www.tutorialspoint.com/crypto-createhmac-method-in-node-js 

async function hashID(id) {
  return crypto.createHmac('sha256', process.env.HASH_KEY)
    .update(id)
    .digest('hex')
}

module.exports = { generateIDs, validateID }
