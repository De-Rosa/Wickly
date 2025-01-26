const hashing = require("../routes/ids/hashing.js")

async function isGetRequestValid(key, res) {
  if (!res) {
    console.error("Invalid parameters passed into get request check.");
    return false;
  }
  if (!key) {
    return badRequest(res);
  }
  return true;
}

async function isPostRequestValid(data, requiredKeys, res) {
  if (!res) {
    console.error("Invalid parameters passed into post request check.");
    return;
  }
  if (!data || !requiredKeys) {
    return badRequest(res);
  }

  if (!requiredKeys.includes('id') || !requiredKeys.includes('hashed_id')) {
    return unauthorized(res);
  }

  let json;
  try {
    json = JSON.stringify(data)
  } catch (error) {
    return badRequest(res)
  }

  let dataParsed = JSON.parse(json);
  let dataKeys = Object.getOwnPropertyNames(dataParsed)

  if (dataKeys.length != requiredKeys.length) {
    return badRequest(res);
  }

  for (let key of requiredKeys) {
    if (!dataKeys.includes(key)) {
      return badRequest(res);
    }
  }
  
  if (!await isIDValid(dataParsed.id, dataParsed.hashed_id)) {
    return unauthorized(res);
  }

  return true;
}

async function isIDValid(id, hashed_id) {
  return await hashing.validateID(id, hashed_id);
}

function unauthorized(res) {
  res.sendStatus(401) // Client error: unauthorized.
  return false;
}

function badRequest(res) {
  res.sendStatus(400) // Client error: bad request.
  return false;
}

function conflict(res) {
  res.sendStatus(409) // Client error: conflict.
  return false;
}

function notFound(res) {
  res.sendStatus(404) // Client error: not found.
  return false;
}

function internalError(res) {
  res.sendStatus(500) // Server error: internal error.
  return false;
}

module.exports = { isGetRequestValid, isPostRequestValid, unauthorized, badRequest, conflict, notFound, internalError }
