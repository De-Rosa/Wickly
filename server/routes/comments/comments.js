const express = require("express");
const databases = require("../../databases/databases.js")
const handling = require("../handling.js")

module.exports = function(app) {
  app.get('/comments', async function(req, res) {
    let query = req.query;
    let key = query.key;
  
    let isValid = await handling.isGetRequestValid(key, res)
    if (!isValid) return;

    databases.readFromDB("comments", key, res);
  })

  app.use(express.json())
  app.post('/comments', async function(req, res) {
    let data = req.body;

    const requiredFields = ["contents", "id", "hashed_id", "key"]
    let isValid = await handling.isPostRequestValid(data, requiredFields, res);
    if (!isValid) return;

    // Do not need to check for exceptions, already done after checking for validity.
    let json = JSON.stringify(data);
    let parsed = JSON.parse(json);

    const {key, contents, id, hashed_id} = parsed

    if (contents.length > 100) return handling.badRequest();

    // https://stackoverflow.com/a/63160519
    let date = new Date()
    let dateString = date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

    let commentJson = {"contents": contents, "datetime": dateString, "id": id}
    databases.appendToDB("comments", key, commentJson, res)
  })
}
