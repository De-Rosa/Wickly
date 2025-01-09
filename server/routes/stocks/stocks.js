const handling = require("../handling.js")

module.exports = async function(app) {
  app.get('/stocks', async function(req, res) {
    let query = req.query;
    let key = query.key;
  
    let isValid = await handling.isGetRequestValid(key, res)
    if (!isValid) return;

  })
}
