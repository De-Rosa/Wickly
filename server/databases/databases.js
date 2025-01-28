// Database file, used by routes to access and update JSON databases. 

const fs = require("fs")
const handling = require("../routes/handling.js")

// Reads from a given database, at a key.
// INPUT:
// (database) A string, corresponds to a file name "(database).json".
// (key) A key/ticker which is a position in the database we want to retrieve from.
// (res) The response object from a route used to send error codes/data.
// OUTPUT: 
// The function does not output anything, however (res) has sendCode or send applied to it.

async function readFromDB(database, key, res) {
  if (!database || !key || !res) return;

  fsReadToJSON(database, res, async function(json) {
    res.send(json.hasOwnProperty(key) ? json[key] : []);
  })
}

// Adds to a given database, at a key.
// INPUT:
// (database) A string, corresponds to a file name "(database).json".
// (key) A key/ticker which is a position in the database we want to retrieve from.
// (data) Data to add.
// (res) The response object from a route used to send error codes/data.
// OUTPUT: 
// The function does not output anything, however (res) has sendCode or send applied to it.

async function appendToDB(database, key, data, res) {
  if (!database || !key || !data || !res) return;

  fsReadToJSON(database, res, async function(json) {
    if (!json.hasOwnProperty(key)) {
      json[key] = []
    }
    json[key].push(data)

    fs.writeFile(`${__dirname}/${database}.json`, JSON.stringify(json), (error) => {
      if (error) {
        return handlingError(res, error); 
      }
    })

    res.sendStatus(200)
  });
}

// Writes to a given database, at a key. Is unsuccessful if already exists (conflict error code sent).
// INPUT:
// (database) A string, corresponds to a file name "(database).json".
// (key) A key/ticker which is a position in the database we want to retrieve from.
// (data) Data to write.
// (res) The response object from a route used to send error codes/data.
// OUTPUT: 
// The function does not output anything, however (res) has sendCode or send applied to it.

async function writeToDB(database, key, data, res) {
  if (!database || !key || !data || !res) return;

  fsReadToJSON(database, res, async function(json) {
    if (json.hasOwnProperty(key)) {
      return handling.conflict(res); 
    }

    json[key] = data

    fs.writeFile(`${__dirname}/${database}.json`, JSON.stringify(json), (error) => {
      if (error) {
        return handlingError(res, error);
      }
    })

    res.sendStatus(200)
  }) 
}

// Reads the given JSON file asynchronously.
// INPUT:
// (database) A string, corresponds to a file name "(database).json".
// (res) The response object from a route used to send error codes/data.
// (callback) The callback function used to return the JSON/error code to.
// OUTPUT:
// A JSON file/error code returned to the callback function.

async function fsReadToJSON(database, res, callback) {
  fs.readFile(`${__dirname}/${database}.json`, async (error, data) => {
    if (error) {
      callback(handlingError(res, error));
      return;
    }

    let json = await parseJSON(data, res);
    if (json == false) {
      callback(handling.internalError(res))
      return;
    }
    callback(json);
  })
}

// Error catching parsing JSON. Returns an error code instead of an Error object.
// INPUT:
// (data) JSON data to be parsed.
// (res) The response object from a route used to send error codes/data.
// OUTPUT:
// A parsed JSON object or an error code.

async function parseJSON(data, res) {
    let json;
    try {
      json = JSON.parse(data);
    } catch (error) {
      return handlingError(res, error); 
    }
    return json
}

// Handling error, sends an error message to the server's console and returns an internal error code.
function handlingError(res, error) {
  console.error(error)
  return handling.internalError(res);
}

module.exports = { readFromDB, appendToDB, writeToDB }
