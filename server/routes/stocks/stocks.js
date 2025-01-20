const handling = require("../handling.js")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async function(app) {
  // aggregate bars for current day
  app.get('/stocks/aggs', async function(req, res) {
    let query = req.query;
    let key = query.key;
  
    let isValid = await handling.isGetRequestValid(key, res)
    if (!isValid) return;

    // according to docs /v2/aggs/ticker/{stocksTicker}/range/{multiplier}/{timespan}/{from}/{to}
    
    const [fromDate, toDate] = getTimeframe()

    const endpoint = `v2/aggs/ticker/${key}/range/1/day/${fromDate}/${toDate}?apiKey=${process.env.POLYGON_API_KEY}`
    fetchPolygon(res, endpoint).then((fetched) => {
      res.send(fetched)
    }).catch((error) => { 
      return false;
    })

  })

   app.get('/stocks/details', async function(req, res) {
    let query = req.query;
    let key = query.key
  
    let isValid = await handling.isGetRequestValid(key, res)
    if (!isValid) return;

    // according to docs /v3/reference/tickers/{ticker}
    
    const endpoint = `v3/reference/tickers/${key}?apiKey=${process.env.POLYGON_API_KEY}`
    fetchPolygon(res, endpoint).then((fetched) => {
      res.send(fetched)
    }).catch((error) => { 
      return false;
    })
  })

  app.get('/stocks/related', async function(req, res) {
    let query = req.query;
    let key = query.key;
  
    let isValid = await handling.isGetRequestValid(key, res)
    if (!isValid) return;

    // according to docs /v1/related-companies/{ticker}
    
    const endpoint = `v1/related-companies/${key}?apiKey=${process.env.POLYGON_API_KEY}`
    fetchPolygon(res, endpoint).then((fetched) => {
      res.send(fetched)
    }).catch((error) => { 
      return false;
    })
  })


  async function fetchPolygon(res, endpoint) {
    const baseURL = "https://api.polygon.io"
    console.log(`${baseURL}/${endpoint}`)
    try {
      fetched = await fetch(`${baseURL}/${endpoint}`, {
        method: "GET",
        headers: {"Content-Type": "application/json"}
      })
      if (fetched.ok) return fetched.json();
      res.sendStatus(fetched.status)
      throw new Error(fetched.status)

    } catch (error) {
      return Promise.reject(error)
    }     
  }

  function getTimeframe() {
    function getDate(offset) {
      const options = { month: "2-digit", day: "2-digit", year: "numeric" }
      let date = new Date()
      date.setDate(date.getDate() - offset);
      return date.toLocaleDateString('en-CA', options)
    }

    let toDate = getDate(2) 
    let fromDate = getDate(31)

    return [fromDate, toDate]
  }

}
