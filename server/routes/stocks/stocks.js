module.exports = function(app) {
  app.get('/stocks/:ticker', function(req, res) {
    res.send(req.params.ticker) 
  })
}
