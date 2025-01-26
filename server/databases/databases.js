const fs = require("fs")
const handling = require("../routes/handling.js")

async function readFromDB(database, key, res) {
  if (!database || !key || !res) return;

  fsReadToJSON(database, res, async function(json) {
    res.send(json.hasOwnProperty(key) ? json[key] : []);
  })
}

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

async function parseJSON(data, res) {
    let json;
    try {
      json = JSON.parse(data);
    } catch (error) {
      return handlingError(res, error); 
    }
    return json
}

function handlingError(res, error) {
  console.error(error)
  return handling.internalError(res);
}

module.exports = { readFromDB, appendToDB, writeToDB }
