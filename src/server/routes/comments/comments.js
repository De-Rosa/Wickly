// Comments route file, used to handle POST and GET comment requests. 

const express = require("express");
const databases = require("../../databases/databases.js")
const handling = require("../handling.js")

module.exports = function(app) {

  // Route which returns a JSON object of all comments from a given ticker/key. 
  // Formatted as '/comments?key={key}'.
  // (key) is a string corresponding to a given ticker/key. 
  // If successful, sends a list of JSON objects corresponding to a comment (with code 200):
  // {"contents": MESSAGE CONTENTS, "datetime": DATE TIME, "id": USER ID}
  // If there are no comments in the given key, an empty array is returned.
  // If unsuccessful, sends the corresponding error code:
  // 400 - invalid/missing key or other bad request,
  // 500 - internal error when dealing with the JSON/database.

  app.get('/comments', async function(req, res) {
    let query = req.query;
    let key = query.key;
  
    let isValid = await handling.isGetRequestValid(key, res)
    if (!isValid) return;

    databases.readFromDB("comments", key, res);
  })

  // Route which POSTs a JSON object of a comment to a given ticker/key. 
  // POST request is formatted as:
  // {"contents": MESSAGE CONTENTS, "id": USER ID, "hashed_id": USER HASHED ID, "key": KEY}
  // The MESSAGE CONTENTS cannot be bigger than 100 characters.
  // If successful, sends code 200.   
  // If unsuccessful, sends the corresponding error code:
  // 400 - invalid POST body or other bad request,
  // 500 - internal error when dealing with the JSON/database.
  // 401 - unauthorized, ID and HASHED ID do not match.

  app.use(express.json())
  app.post('/comments', async function(req, res) {
    let data = req.body;

    const requiredFields = ["contents", "id", "hashed_id", "key"]
    let isValid = await handling.isPostRequestValid(data, requiredFields, res);
    if (!isValid) return; // Already sent an error code.

    // Do not need to check for exceptions, already done after checking for validity.
    let json = JSON.stringify(data);
    let parsed = JSON.parse(json);

    const {key, contents, id, hashed_id} = parsed

    if (contents.length > 100 || contents.length == 0) return handling.badRequest(res);
    
    // https://stackoverflow.com/a/63160519
    let date = new Date()
    let dateString = date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

    let commentJson = {"contents": contents, "datetime": dateString, "id": id}
    databases.appendToDB("comments", key, commentJson, res)
  })
}
