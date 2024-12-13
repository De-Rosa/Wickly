module.exports = function(app) {
  app.get('/comments', function(req, res) {
    res.send("comments")
  })
}
