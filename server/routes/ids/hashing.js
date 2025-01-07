const crypto = require("crypto");

async function generateIDs() {
  const id = crypto.randomUUID();
  const hashed_id = await hashID(id);

  return {
    id: id, 
    hashed_id: hashed_id
  };
}

async function validateID(id, hashed_id) {
  const new_hashed_id = await hashID(id);
  return new_hashed_id == hashed_id;
}

async function hashID(id) {
  return crypto.createHmac('sha256', process.env.HASH_KEY)
    .update(id)
    .digest('hex')
}

module.exports = { generateIDs, validateID }
