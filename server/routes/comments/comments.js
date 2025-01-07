const express = require("express");
const hashing = require("../ids/hashing.js")
const fs = require("fs")

module.exports = function(app) {
  app.get('/comments', async function(req, res) {
    let query = req.query;
    let location = query.location;
  
    let isValid = await isGetRequestValid(location, res)
    if (!isValid) return;

    readFromDB(location, res);
  })

  app.use(express.json())
  app.post('/comments', async function(req, res) {
    let data = req.body;

    let isValid = await isPostRequestValid(data, res);
    if (!isValid) return;

    // Do not need to check for exceptions, already done after checking for validity.
    let json = JSON.stringify(data);
    let parsed = JSON.parse(json);

    const {location, contents, id, hashed_id} = parsed
    let commentJson = {"contents": contents, "id": id}
    writeToDB(location, commentJson, res)
  })

  async function isGetRequestValid(location, res) {
    if (!location) {
      return badRequest(res);
    }

    return true;
  }

  async function isPostRequestValid(data, res) {
    if (!data) {
      return badRequest(res);
    }

    let json;
    try {
      json = JSON.stringify(data)
    } catch (error) {
      return badRequest(res)
    }

    const requiredKeys = ['location', 'contents', 'id', 'hashed_id']
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

    if (dataParsed.contents.length > 300) {
      return badRequest(res);
    }

    let isIDValid = await hashing.validateID(dataParsed.id, dataParsed.hashed_id);

    if (!isIDValid) {
      return unauthorized(res);
    }

    return true;
  }

  
  async function readFromDB(location, res) {
      fs.readFile(`${__dirname}/comments.json`, (error, data) => {
        if (error) {
          console.error(error)
          return internalError(res);
        }

        let json;
        try {
          json = JSON.parse(data);
        } catch (error) {
          console.error(error)
          return internalError(res);
        }

        if (!json.hasOwnProperty(location)) return notFound(res);
        res.send(json[location]);
      })
  }

  async function writeToDB(location, data, res) {
    fs.readFile(`${__dirname}/comments.json`, (error, db) => {
        if (error) {
          console.error(error)
          return internalError(res);
        }

        let json;
        try {
          json = JSON.parse(db);
        } catch (error) {
          console.error(error)
          return internalError(res);
        }

        if (!json.hasOwnProperty(location)) {
          json[location] = []
        }
        json[location].push(data)

        fs.writeFile(`${__dirname}/comments.json`, JSON.stringify(json), (error) => {
          if (error) {
            console.error(error)
            return internalError(res);
          }
        })
        
        res.sendStatus(200)
      
      }) 
  }

  async function unauthorized(res) {
    res.sendStatus(401) // Client error: unauthorized.
    return false;
  }

  async function badRequest(res) {
    res.sendStatus(400) // Client error: bad request.
    return false;
  }
  
  async function notFound(res) {
    res.sendStatus(404) // Client error: not found.
    return false;
  }

  async function internalError(res) {
    res.sendStatus(500) // Server error: internal error.
    return false;
  }
}
