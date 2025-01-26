const express = require("express");
const databases = require("../../databases/databases.js")
const handling = require("../handling.js")

module.exports = function(app) {
  app.get('/index-funds', async function(req, res) {
    let query = req.query;
    let key = query.key;
  
    let isValid = await handling.isGetRequestValid(key, res)
    if (!isValid) return;

    databases.readFromDB("index-funds", key, res);
  })

  app.use(express.json())
  app.post('/index-funds', async function(req, res) {
    let data = req.body;

    const requiredFields = ["stocks", "id", "hashed_id", "key"]
    let isValid = await handling.isPostRequestValid(data, requiredFields, res);
    if (!isValid) return;

    // Do not need to check for exceptions, already done after checking for validity.
    let json = JSON.stringify(data);
    let parsed = JSON.parse(json);
  
    let {stocks, key, id, hashed_id} = parsed
    
    // https://stackoverflow.com/a/9229821
    stocks = [...new Set(stocks)]

    if (stocks.length >= 10) return handling.badRequest(); 
    if (key.length > 10 | key.length == 0) return handling.badRequest();
  
    let indexJson = {"stocks": stocks, "id": id}
    databases.writeToDB("index-funds", key, indexJson, res)
  })
}

