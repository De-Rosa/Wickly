// Index funds route file, used to handle POST and GET index fund requests. 

const express = require("express");
const databases = require("../../databases/databases.js")
const handling = require("../handling.js")

module.exports = function(app) {

  // Route which returns a JSON object of an index fund from its given key. 
  // Formatted as '/index-funds?key={key}'.
  // (key) is a string corresponding to a given index fund key. 
  // If successful, sends a JSON object corresponding to the index fund (with code 200):
  // {"stocks": KEY/TICKER LIST, "id": USER ID}
  // If unsuccessful, sends the corresponding error code:
  // 400 - invalid/missing key or other bad request,
  // 404 - index fund doesn't exist at key,
  // 500 - internal error when dealing with the JSON/database.
  
  app.get('/index-funds', async function(req, res) {
    let query = req.query;
    let key = query.key;
  
    let isValid = await handling.isGetRequestValid(key, res)
    if (!isValid) return;

    // Name of index fund is not uppercase characters.
    // https://stackoverflow.com/a/23476587
    if (!/^[A-Z]*$/.test(key)) return handling.badRequest(res); 


    databases.readFromDB("index-funds", key, res);
  })

  // Route which POSTs a JSON object of an index fund given its key.
  // POST request is formatted as:
  // {"stocks": KEY/TICKER LIST, "id": USER ID, "hashed_id": USER HASHED ID, "key": KEY}
  // There are allowed at most 10 keys in the KEY/TICKER LIST.
  // Duplicates in the KEY/TICKER LIST are removed.
  // If successful, sends code 200.   
  // If unsuccessful, sends the corresponding error code:
  // 400 - invalid POST body or other bad request,
  // 500 - internal error when dealing with the JSON/database.
  // 401 - unauthorized, ID and HASHED ID do not match.

  app.use(express.json())
  app.post('/index-funds', async function(req, res) {
    let data = req.body;

    const requiredFields = ["stocks", "id", "hashed_id", "key"]
    let isValid = await handling.isPostRequestValid(data, requiredFields, res);
    if (!isValid) return; // Already sent an error code.

    // Do not need to check for exceptions, already done after checking for validity.
    let json = JSON.stringify(data);
    let parsed = JSON.parse(json);
  
    let {stocks, key, id, hashed_id} = parsed

    // Name of index fund is not uppercase characters.
    // https://stackoverflow.com/a/23476587
    if (!/^[A-Z]*$/.test(key)) return handling.badRequest(res); 

    // Remove duplicate stocks.
    // https://stackoverflow.com/a/9229821
    stocks = [...new Set(stocks)]

    if (stocks.length >= 10 || stocks.length == 0) return handling.badRequest(res); 
    if (key.length > 10 | key.length == 0) return handling.badRequest(res);
  
    let indexJson = {"stocks": stocks, "id": id}
    databases.writeToDB("index-funds", key, indexJson, res)
  })
}

