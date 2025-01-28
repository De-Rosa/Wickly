// Handling file, used by other server-side files to check requests and to return codes. 
//
const hashing = require("../routes/ids/hashing.js")

// Checks if the default GET request is valid.
// INPUT:
// (key) A key/ticker which we want to GET from.
// (res) The response object from a route used to send error codes.
// OUTPUT: 
// True/False depending on if the request was valid.

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

// Checks if the default POST request is valid.
// INPUT:
// (key) A key/ticker which we want to POST to. 
// (data) Data to POST.
// (res) The response object from a route used to send error codes.
// OUTPUT: 
// True/False depending on if the request was valid.

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

  if (!dataParsed.key) {
    return badRequest(res);
  }
  
  if (!await isIDValid(dataParsed.id, dataParsed.hashed_id)) {
    return unauthorized(res);
  }

  return true;
}

// Function, given an ID and a hashed ID, checks if its valid (the hashed_ID == hash(ID)).
// Used to authenticate POST requests (so users cannot change their ID to impersonate another).
// We do not need more security further than this.

async function isIDValid(id, hashed_id) {
  return await hashing.validateID(id, hashed_id);
}

// Functions which return their corresponding statuses.
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
