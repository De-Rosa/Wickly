// Index funds route file, used to handle POST and GET index fund requests. 

const handling = require("../handling.js")
const fetchPolygon = require("./polygon.js")

module.exports = async function(app) {

  // Route which returns a JSON object of the aggregate bars from the past 5 months. 
  // Formatted as '/stocks/aggs?key={key}'.
  // (key) is a string corresponding to a given ticker/crypto. 
  // If successful, sends a JSON object with results being a list of JSON objects corresponding to an aggregate bar.
  // If it doesn't exist, the result will pass as successful but will have results of length 0.
  // If unsuccessful, sends the corresponding error code:
  // 400 - missing ticker or other bad request.

  app.get('/stocks/aggs', async function(req, res) {
    let query = req.query;
    let key = query.key;
  
    let isValid = await handling.isGetRequestValid(key, res)
    if (!isValid) return;

    // Key is not in correct format.
    // https://stackoverflow.com/a/23476587
    if (!/^([IX]:)?[A-Z.]*$/.test(key)) return handling.badRequest(res); 

    // PolygonIO REST documentations state:
    // /v2/aggs/ticker/{stocksTicker}/range/{multiplier}/{timespan}/{from}/{to}
    
    const [fromDate, toDate] = getTimeframe()

    const endpoint = `v2/aggs/ticker/${key}/range/1/day/${fromDate}/${toDate}?apiKey=${process.env.POLYGON_API_KEY}`
    fetchPolygon(res, endpoint).then((fetched) => {
      res.send(fetched)
    }).catch((error) => { 
      return;
    })

  })

  // Route which returns a JSON object of the details of a given ticker/crypto. 
  // Formatted as '/stocks/details?key={key}'.
  // (key) is a string corresponding to a given ticker/crypto. 
  // If successful, sends a JSON object with results being a list of JSON objects corresponding to an aggregate bar.
  // If unsuccessful, sends the corresponding error code:
  // 404 - ticker doesn't exist,
  // 400 - missing ticker or other bad request.

   app.get('/stocks/details', async function(req, res) {
    let query = req.query;
    let key = query.key
  
    let isValid = await handling.isGetRequestValid(key, res)
    if (!isValid) return;

    // Key is not in correct format.
    // https://stackoverflow.com/a/23476587
    if (!/^([IX]:)?[A-Z.]*$/.test(key)) return handling.badRequest(res); 

    // PolygonIO REST documentations state:
    // /v3/reference/tickers/{ticker}
    
    const endpoint = `v3/reference/tickers/${key}?apiKey=${process.env.POLYGON_API_KEY}`
    fetchPolygon(res, endpoint).then((fetched) => {
      res.send(fetched)
    }).catch((error) => { 
      return;
    })
  })

  // Route which returns a JSON object of related stocks to the given ticker. (CURRENTLY UNUSED)
  // Formatted as '/stocks/related?key={key}'.
  // (key) is a string corresponding to a given ticker. 
  // If successful, sends a JSON object with results being a list of JSON objects corresponding to tickers.
  // If it doesn't exist, the result will pass as successful but will have results of length 0.
  // If unsuccessful, sends the corresponding error code:
  // 400 - missing ticker or other bad request.

  app.get('/stocks/related', async function(req, res) {
    let query = req.query;
    let key = query.key;
  
    let isValid = await handling.isGetRequestValid(key, res)
    if (!isValid) return;
    // Key is not in correct format.
    // https://stackoverflow.com/a/23476587
    if (!/^([IX]:)?[A-Z.]*$/.test(key)) return handling.badRequest(res); 

    // PolygonIO REST documentations state:
    // /v1/related-companies/{ticker}
    
    const endpoint = `v1/related-companies/${key}?apiKey=${process.env.POLYGON_API_KEY}`
    fetchPolygon(res, endpoint).then((fetched) => {
      res.send(fetched)
    }).catch((error) => { 
      return;
    })
  })




  // Returns two strings, one 5 months ago and one 2 days ago.
  // This is used for the timeframe used to get aggregate bars.

  function getTimeframe() {
    // https://stackoverflow.com/a/60121079
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString

    function getDate(offset) {
      const options = { month: "2-digit", day: "2-digit", year: "numeric" }
      let date = new Date()
      date.setDate(date.getDate() - offset);
      return date.toLocaleDateString('en-CA', options)
    }

    let toDate = getDate(2) 
    let fromDate = getDate(31 * 5)

    return [fromDate, toDate]
  }

}
